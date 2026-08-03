# System Design Interview Cheatsheet
### The Complete Decision Framework for Distributed Systems, Microservices & Beyond

---

## TABLE OF CONTENTS

1. [The Universal 45-Minute Interview Framework](#1-the-universal-45-minute-interview-framework)
2. [Step 0 — Clarify Requirements](#2-step-0--clarify-requirements-first-5-min)
3. [Step 1 — Estimate Scale & Constraints](#3-step-1--estimate-scale--constraints-5-min)
4. [Step 2 — High-Level Design](#4-step-2--high-level-design-10-min)
5. [Step 3 — Deep Dive Decision Trees](#5-step-3--deep-dive-decision-trees-15-min)
6. [Monolith vs Microservices Decision Tree](#6-monolith-vs-microservices-decision-tree)
7. [Database Selection Guide](#7-database-selection-guide)
8. [Caching Strategy Cheatsheet](#8-caching-strategy-cheatsheet)
9. [Message Queue & Event Streaming Guide](#9-message-queue--event-streaming-guide)
10. [API Design Cheatsheet](#10-api-design-cheatsheet)
11. [Load Balancing & Traffic Management](#11-load-balancing--traffic-management)
12. [Storage Systems Cheatsheet](#12-storage-systems-cheatsheet)
13. [Consistency & Availability Tradeoffs (CAP)](#13-consistency--availability-tradeoffs-cap)
14. [Distributed Systems Patterns](#14-distributed-systems-patterns)
15. [Microservices Patterns](#15-microservices-patterns)
16. [Data Partitioning & Sharding](#16-data-partitioning--sharding)
17. [Replication Strategies](#17-replication-strategies)
18. [Rate Limiting & Throttling](#18-rate-limiting--throttling)
19. [Search Systems](#19-search-systems)
20. [Notification Systems](#20-notification-systems)
21. [Observability & Monitoring](#21-observability--monitoring)
22. [Security Design Patterns](#22-security-design-patterns)
23. [Common System Design Templates](#23-common-system-design-templates)
    - [Design a URL Shortener](#231-url-shortener)
    - [Design a Chat System](#232-chat-system)
    - [Design a News Feed](#233-news-feed--social-feed)
    - [Design a Video Streaming Service](#234-video-streaming-service)
    - [Design a Ride-Sharing Service](#235-ride-sharing-service)
    - [Design a Rate Limiter](#236-rate-limiter)
    - [Design a Distributed Cache](#237-distributed-cache)
    - [Design a Search Autocomplete](#238-search-autocomplete)
    - [Design an E-Commerce System](#239-e-commerce-system)
    - [Design a Notification Service](#2310-notification-service)
24. [Numbers Every Engineer Must Know](#24-numbers-every-engineer-must-know)
25. [Failure & Fault Tolerance Patterns](#25-failure--fault-tolerance-patterns)
26. [Trade-off Cheatsheets](#26-trade-off-cheatsheets)
27. [Interview Anti-Patterns to Avoid](#27-interview-anti-patterns-to-avoid)
28. [Communication & Scoring Rubric](#28-communication--scoring-rubric)
29. [Real-Time & Streaming Systems](#29-real-time--streaming-systems)
30. [Unique ID Generation & Distributed Transactions](#30-unique-id-generation--distributed-transactions)
31. [Multi-Tenancy & SaaS Architecture](#31-multi-tenancy--saas-architecture)
32. [ML System Design Patterns](#32-ml-system-design-patterns)
33. [Additional Design Templates](#33-additional-design-templates)
    - [Design a Key-Value Store](#331-key-value-store)
    - [Design a Distributed Job Scheduler](#332-distributed-job-scheduler)
    - [Design a Web Crawler](#333-web-crawler)

---

## 1. THE UNIVERSAL 45-MINUTE INTERVIEW FRAMEWORK

```
00:00 – 05:00  → Clarify requirements (functional + non-functional)
05:00 – 10:00  → Estimate scale (users, QPS, storage, bandwidth)
10:00 – 20:00  → High-level design (boxes and arrows)
20:00 – 35:00  → Deep dive into 2-3 critical components
35:00 – 45:00  → Wrap up: trade-offs, bottlenecks, follow-ups
```

### The 5 Questions to Ask at the Start of EVERY Interview

1. **Scale**: How many users / requests per second are we targeting?
2. **Consistency vs Availability**: Is it okay to show stale data? Is downtime acceptable?
3. **Geographic distribution**: Single region or global deployment?
4. **Read vs Write ratio**: Is this read-heavy, write-heavy, or balanced?
5. **Latency requirements**: What are the SLA targets (p99, p999)?

---

## 2. STEP 0 — CLARIFY REQUIREMENTS (First 5 Min)

### Functional Requirements Template
```
ALWAYS ask:
  □ What are the core features? (List top 3)
  □ What is OUT of scope for this design?
  □ Who are the users? (consumers, businesses, internal?)
  □ What devices/clients need to be supported?
  □ Any special constraints (regulations, geography, compliance)?
```

### Non-Functional Requirements Template
```
  □ Availability SLA?         → 99.9% (8.7h/yr), 99.99% (52m/yr), 99.999% (5m/yr)
  □ Latency target?           → p50 / p95 / p99 in ms
  □ Throughput?               → Reads/sec, Writes/sec
  □ Consistency model?        → Strong / Eventual / Causal
  □ Durability?               → Data loss tolerance
  □ Security?                 → Auth, encryption, compliance (GDPR, HIPAA)
  □ Scalability horizon?      → 10x growth? 100x?
```

### Quick SLA Reference
| Availability | Downtime/Year | Downtime/Month | Downtime/Day  |
|-------------|---------------|----------------|---------------|
| 99%         | 3.65 days     | 7.2 hours      | 14.4 minutes  |
| 99.9%       | 8.77 hours    | 43.8 minutes   | 1.44 minutes  |
| 99.99%      | 52.6 minutes  | 4.38 minutes   | 8.6 seconds   |
| 99.999%     | 5.26 minutes  | 26.3 seconds   | 0.86 seconds  |

---

## 3. STEP 1 — ESTIMATE SCALE & CONSTRAINTS (5 Min)

### The Back-of-Envelope Estimation Formula

#### Users & Traffic
```
Daily Active Users (DAU)                   = X million
Average requests per user per day          = Y
Total daily requests                       = X * Y million
QPS (Queries Per Second)                   = Total daily / 86,400
Peak QPS (assume 2-3x average)             = QPS * 3

Example:
  500M DAU, 10 requests/day = 5B requests/day
  QPS = 5B / 86,400 ≈ 58,000
  Peak QPS ≈ 175,000
```

#### Storage
```
Per-record size (bytes)                    = S
New records per day                        = N
Daily storage                             = S * N
5-year storage                            = S * N * 365 * 5

Example (Twitter-like):
  Tweet size: 280 chars = ~280 bytes + metadata ≈ 1 KB
  500M tweets/day = 500M KB/day = 500 GB/day
  5-year total = 500 GB * 1825 = ~900 TB ≈ 1 PB
```

#### Bandwidth
```
Read bandwidth  = QPS_read  * avg_response_size
Write bandwidth = QPS_write * avg_request_size

Example (image service):
  Reads: 100K QPS * 100 KB/image = 10 GB/s (need CDN!)
  Writes: 1K QPS  * 100 KB/image = 100 MB/s
```

### Quick Math Tips for Interviews
```
1 million    = 10^6
1 billion    = 10^9
86,400 sec   ≈ 10^5 sec/day  (use 100K for easy math)
1 KB         = 10^3 bytes
1 MB         = 10^6 bytes
1 GB         = 10^9 bytes
1 TB         = 10^12 bytes
1 PB         = 10^15 bytes

Memory rule of thumb:
  1 char  = 1 byte
  1 int   = 4 bytes
  1 long  = 8 bytes
  UUID    = 16 bytes (or 36 chars as string)
```

---

## 4. STEP 2 — HIGH-LEVEL DESIGN (10 Min)

### The Universal High-Level Template

```
[Client / Browser / Mobile App]
        |
        | HTTPS
        ↓
[CDN] ←──────────────── (static assets, geo-routing)
        |
        ↓
[Load Balancer / API Gateway]
        |
        ├──→ [Auth Service]
        |
        ├──→ [Service A] ←──→ [Cache (Redis)]
        |         |
        |         └──→ [Database A (Primary)]
        |                      ↑
        |              [Database A (Replica)]
        |
        ├──→ [Service B] ←──→ [Message Queue (Kafka)]
        |         |                    |
        |         └──→ [Database B]    └──→ [Worker / Consumer]
        |
        └──→ [Object Storage (S3)]
```

### Components to Always Consider

| Component         | When to Add                                      | Popular Choices                   |
|-------------------|--------------------------------------------------|-----------------------------------|
| CDN               | Static assets, media, global users               | CloudFront, Cloudflare, Fastly    |
| Load Balancer     | Multiple service instances                       | AWS ALB, NGINX, HAProxy           |
| API Gateway       | Microservices, auth, rate limiting               | AWS API GW, Kong, Envoy           |
| Cache             | Read-heavy, expensive queries                    | Redis, Memcached                  |
| Message Queue     | Async processing, decoupling                     | Kafka, RabbitMQ, SQS              |
| Object Storage    | Files, images, videos, blobs                     | S3, GCS, Azure Blob               |
| Search Engine     | Full-text search, autocomplete                   | Elasticsearch, OpenSearch         |
| Relational DB     | Transactional, structured, relationships         | PostgreSQL, MySQL                 |
| NoSQL DB          | Scale, flexible schema, document/key-value       | MongoDB, DynamoDB, Cassandra      |
| Time-series DB    | Metrics, logs, IoT                               | InfluxDB, TimescaleDB, Prometheus |
| Graph DB          | Social networks, recommendations                 | Neo4j, Amazon Neptune             |

---

## 5. STEP 3 — DEEP DIVE DECISION TREES (15 Min)

### Which Deep Dives Impress Interviewers Most?

```
Pick components where:
  1. The bottleneck lives (usually DB or messaging)
  2. The hardest consistency/availability trade-off exists
  3. The interviewer kept asking about (a hint!)
  4. Failure of this component = catastrophic data loss

Golden rule: Always deep dive the data model first.
  → "Let me walk through what the schema/document structure looks like"
  → Then show how reads and writes flow through it
```

---

## 6. MONOLITH VS MICROSERVICES DECISION TREE

### When to KEEP a Monolith
```
Use monolith if ANY of the following are true:
  □ Team size < 10-15 engineers
  □ System complexity is low to medium
  □ Domain boundaries are NOT well understood yet
  □ You're building an MVP or prototype
  □ You need a simple deployment model
  □ Low operational overhead is critical
  □ The system is a single-tenant internal tool
  □ Network latency between services would dominate costs
```

### When to BREAK INTO Microservices
```
Use microservices if SEVERAL of the following are true:
  □ Team size > 15 engineers (Conway's Law kicks in)
  □ Different services need to scale independently
  □ Different services have different tech requirements
  □ Deploy frequency differs across components
  □ You need blast-radius isolation (failures don't cascade)
  □ You need independent release cycles per team
  □ Regulatory/compliance requires data isolation
  □ Traffic patterns are wildly different per feature
```

### The Migration Path: Strangler Fig Pattern
```
Step 1: Start with monolith (always)
Step 2: Identify bounded contexts (domains with clear ownership)
Step 3: Extract the MOST scaled / MOST independent service first
Step 4: Use an API gateway to route traffic
Step 5: Move data ownership gradually (strangler fig)
Step 6: Keep the monolith for remaining logic until each service is stable

DO NOT:
  × Start with microservices from day 1 (premature decomposition)
  × Extract services without clear domain boundaries
  × Share databases between microservices
```

### Microservices Decomposition Strategies

#### By Business Capability (Recommended)
```
E-Commerce example:
  ├── User Service          → account, profile, auth
  ├── Product Service       → catalog, inventory
  ├── Order Service         → order lifecycle, status
  ├── Payment Service       → billing, transactions
  ├── Shipping Service      → delivery tracking
  ├── Notification Service  → email, SMS, push
  └── Search Service        → product search, filters
```

#### By Subdomain (DDD-based)
```
Core Domain      → highest business value (order processing)
Supporting Domain → needed but not differentiating (auth, notifications)
Generic Domain   → commodity (logging, metrics) → use SaaS
```

#### By Data Access Pattern
```
Separate services if:
  - Different databases needed (relational vs document)
  - Different consistency requirements
  - Different caching strategies
  - Different backup/retention policies
```

### Microservices Communication Matrix
```
Communication Type   | Protocol          | When to Use
---------------------|-------------------|-----------------------------------------------
Sync, query          | REST / GraphQL    | Client needs immediate response
Sync, command        | gRPC              | Internal service-to-service, low latency
Async, fire-forget   | Message Queue     | No response needed (notifications, audit logs)
Async, event-driven  | Event Streaming   | Multiple consumers, replay needed (Kafka)
Async, request-reply | Correlation ID    | Async but need response later
Streaming            | gRPC streaming    | Real-time data, live video/audio
```

---

## 7. DATABASE SELECTION GUIDE

### The Database Decision Tree

```
START: What is the primary access pattern?

1. Do you need ACID transactions (money, inventory, orders)?
   YES → Relational DB (PostgreSQL, MySQL)
   NO  → continue...

2. Is your data a document (user profile, product catalog)?
   YES → Document DB (MongoDB, DynamoDB, Firestore)
   NO  → continue...

3. Is your data key-value only (sessions, cache, counters)?
   YES → Key-Value Store (Redis, DynamoDB, Memcached)
   NO  → continue...

4. Is your data a time series (metrics, IoT, logs)?
   YES → Time-Series DB (InfluxDB, TimescaleDB, Cassandra)
   NO  → continue...

5. Is your data a graph (social network, fraud detection)?
   YES → Graph DB (Neo4j, Amazon Neptune, TigerGraph)
   NO  → continue...

6. Do you need full-text search / faceted search?
   YES → Search Engine (Elasticsearch, OpenSearch, Typesense)
   NO  → continue...

7. Do you need column-oriented analytics (OLAP, BI)?
   YES → Columnar DB (BigQuery, Redshift, ClickHouse, Snowflake)
   NO  → Default to PostgreSQL (can handle most use cases)
```

### Relational Database Scaling Ladder
```
Level 1: Single DB instance
  → Good up to ~10K QPS reads, ~1K QPS writes

Level 2: Add read replicas
  → Route 80% reads to replicas
  → Good up to ~50K QPS reads

Level 3: Connection pooling (PgBouncer)
  → Handle thousands of connections efficiently

Level 4: Vertical scaling
  → Bigger instance (more CPU, RAM, NVMe SSDs)

Level 5: Caching layer (Redis)
  → Cache hot queries, cache result sets
  → Reduce DB load 80-90%

Level 6: Horizontal sharding
  → Split data across multiple DB instances
  → Shard by user_id, tenant_id, or geo

Level 7: CQRS + separate read/write stores
  → Write: normalized relational
  → Read: denormalized, pre-aggregated

Level 8: Move to distributed SQL
  → CockroachDB, Spanner, YugabyteDB
  → True horizontal scale with SQL semantics
```

### Database Comparison Quick Reference
| Database       | Type          | Strengths                              | Weaknesses                        | Use When                              |
|----------------|---------------|----------------------------------------|-----------------------------------|---------------------------------------|
| PostgreSQL     | Relational    | ACID, rich queries, JSON support       | Hard to scale writes horizontally | Default choice for most apps          |
| MySQL          | Relational    | Mature, widely supported               | Weaker JSON, less features        | Web apps, read-heavy workloads        |
| MongoDB        | Document      | Flexible schema, easy to scale         | No multi-doc ACID (older ver.)    | Catalogs, user profiles, CMS          |
| Cassandra      | Wide-column   | Massive write scale, multi-region      | No JOINs, eventual consistency    | Time-series, IoT, activity feeds      |
| DynamoDB       | Key-Value/Doc | Serverless, auto-scale, low latency    | Expensive at scale, limited query | Serverless apps, session store        |
| Redis          | Key-Value     | Sub-ms latency, data structures        | In-memory (costly), no joins      | Cache, sessions, leaderboards, queues |
| Elasticsearch  | Search        | Full-text search, faceting, analytics  | Not primary store, sync needed    | Search features, log analytics        |
| Kafka (+KsqlDB)| Streaming     | Durable log, replay, fan-out           | Not a traditional DB              | Event sourcing, pipelines             |
| Neo4j          | Graph         | Relationship traversal                 | Doesn't scale like relational     | Fraud detection, recommendations      |
| ClickHouse     | Columnar      | Blazing fast analytics queries         | Not OLTP, batch inserts           | Analytics, dashboards, BI             |
| Snowflake      | Data Warehouse| Separation of compute/storage          | Expensive, not real-time          | Enterprise analytics, data lake       |
| InfluxDB       | Time-Series   | Purpose-built for time-series data     | Limited general queries           | Metrics, monitoring, IoT              |

---

## 8. CACHING STRATEGY CHEATSHEET

### Cache Decision Tree
```
Should I add a cache?
  → Is the data read far more than written?        YES → Cache it
  → Is the data expensive to compute?              YES → Cache it
  → Is the data hot (same data fetched repeatedly)?YES → Cache it
  → Is the data time-sensitive (must be fresh)?    YES → Short TTL or no cache
  → Is the data personalized per user?             MAYBE → User-scoped cache key
```

### Cache Invalidation Strategies
```
1. TTL (Time To Live)
   → Set expiry on cache entry
   → Simple, but can serve stale data
   → Good for: product details, weather, exchange rates

2. Write-Through
   → Write to cache AND DB at the same time
   → Cache always consistent with DB
   → Downside: write latency increases
   → Good for: user settings, config data

3. Write-Behind (Write-Back)
   → Write to cache FIRST, async flush to DB later
   → Very fast writes, but risk of data loss
   → Good for: counters, analytics, non-critical writes

4. Cache-Aside (Lazy Loading) ← Most Common
   → App checks cache first
   → On miss: load from DB, populate cache
   → On write: invalidate cache entry
   → Good for: most general use cases

5. Read-Through
   → Cache sits in front of DB
   → Cache handles misses automatically
   → Good for: consistent access patterns
```

### What to Cache
```
✓ Cache these:
  - Database query results (hot rows)
  - Computed/aggregated data (feed rankings, leaderboards)
  - Session tokens and auth data
  - API responses from expensive third-party services
  - HTML/JSON fragments (partial rendering)
  - User profile data (read-heavy)

✗ Don't cache these:
  - Financial transaction data (consistency required)
  - Passwords or private keys (security)
  - Highly personalized data (cache thrash)
  - Data written as much as it's read
  - Data where staleness would cause errors
```

### Cache Key Design
```
Pattern: service:entity:id[:field]

Examples:
  user:profile:1234
  product:details:sku-5678
  feed:user:1234:page:1
  session:token:abc123
  rate_limit:user:1234:hour:2024-01-01-14
  leaderboard:game:42:daily
```

### Redis Data Structures Cheatsheet
| Data Structure | Redis Type     | Use Case                                   |
|----------------|----------------|--------------------------------------------|
| String         | STRING         | Simple cache, counters, session tokens     |
| Hash map       | HASH           | User profile (field-level updates)         |
| List           | LIST           | Recent activity, message queues, timelines |
| Set            | SET            | Unique visitors, tags, friend lists        |
| Sorted Set     | ZSET           | Leaderboards, rate limiting, expiry queues |
| Bitmap         | BITMAP         | Daily active users, feature flags          |
| HyperLogLog    | HLL            | Approximate unique count (low memory)      |
| Pub/Sub        | PUB/SUB        | Real-time notifications, chat              |
| Streams        | STREAM         | Event log, activity feed (like Kafka lite) |
| Geo            | GEO            | Location-based search, nearby users        |

### Cache Capacity Planning
```
Cache Hit Ratio target: > 90% (ideally > 95%)
Cache Size Rule: Cache top 20% of data that handles 80% of traffic

Memory estimate:
  Keys: 1M entries
  Value: 1 KB avg
  Redis overhead: ~64 bytes/key
  Total: ~1M * (1KB + 64B) ≈ 1.06 GB

Redis instance sizes:
  Small:  8 GB  → ~7M entries at 1KB
  Medium: 32 GB → ~30M entries at 1KB
  Large:  128 GB → ~120M entries at 1KB
```

---

## 9. MESSAGE QUEUE & EVENT STREAMING GUIDE

### Queue vs Stream Decision
```
Use MESSAGE QUEUE (RabbitMQ, SQS, ActiveMQ) when:
  □ Each message should be processed by EXACTLY ONE consumer
  □ Messages can be discarded after processing
  □ You need dead-letter queues, retries, ACKs
  □ Work distribution (task queue pattern)
  □ You don't need replay

Use EVENT STREAMING (Kafka, Kinesis, Pulsar) when:
  □ Multiple consumers need the SAME event (fan-out)
  □ You need to REPLAY events from the past
  □ You're doing event sourcing / CQRS
  □ You need durable ordered log
  □ You're building a real-time pipeline
  □ High throughput (millions of events/sec)
```

### Kafka Key Concepts for Interviews
```
Topic         → Named stream of events (like a table in a DB)
Partition     → Ordered sub-log within a topic (unit of parallelism)
Offset        → Position of a message in a partition
Consumer Group → Set of consumers sharing the work of a topic
Retention     → How long to keep messages (hours, days, forever)
Key           → Used to route message to a consistent partition
Broker        → Kafka server node
Replication   → Factor of 3 = 1 leader + 2 replicas

Throughput rule of thumb:
  1 Kafka partition ≈ 10 MB/s throughput
  Need 100 MB/s → use 10+ partitions
```

### When to Use Async Messaging
```
SYNC call if:
  - User needs the response to continue (checkout, login)
  - Latency requirement < 100ms
  - Strong consistency needed

ASYNC messaging if:
  - Operation can take more than a second
  - User doesn't need to wait (send email, generate report)
  - Multiple systems need to react to the same event
  - You want to decouple producers from consumers
  - Traffic spikes need to be smoothed (queue as buffer)
```

### Common Messaging Patterns
```
Pattern 1: Fan-out
  Producer → Topic → Consumer A
                   → Consumer B
                   → Consumer C
  Example: OrderPlaced event → trigger email, inventory update, analytics

Pattern 2: Work Queue (competing consumers)
  Producer → Queue → Worker 1
                   → Worker 2
                   → Worker 3
  Example: Image resize job queue — workers take one job each

Pattern 3: Saga (Distributed Transaction via events)
  Order Service   → emits OrderCreated
  Payment Service → listens, emits PaymentProcessed or PaymentFailed
  Inventory       → listens to PaymentProcessed, reserves stock
  Shipping        → listens to StockReserved, creates shipment
  (each step can emit compensating event on failure)

Pattern 4: Event Sourcing
  All changes are stored as an immutable event log
  State = replay of all events
  Strong audit trail, time travel, CQRS compatible

Pattern 5: Dead Letter Queue (DLQ)
  Failed messages → DLQ after N retries
  Operators inspect/replay manually
  Prevents poison pill messages from blocking the queue
```

---

## 10. API DESIGN CHEATSHEET

### REST vs GraphQL vs gRPC Decision
```
Use REST when:
  □ Public API (third parties, browsers)
  □ Simple CRUD operations
  □ HTTP caching is important
  □ Team is more comfortable with REST
  □ Stateless interactions

Use GraphQL when:
  □ Client needs flexibility over what data to fetch
  □ Multiple client types (mobile vs web) need different data shapes
  □ Avoid over-fetching / under-fetching
  □ Rapidly evolving APIs
  □ BFF (Backend for Frontend) pattern

Use gRPC when:
  □ Internal service-to-service communication
  □ Very low latency is critical (binary protocol)
  □ Bi-directional streaming needed
  □ Strongly typed contract (proto files)
  □ Polyglot microservices
```

### REST API Design Best Practices
```
Versioning:
  /api/v1/users          ← URI versioning (most common)
  Accept: application/vnd.api+json;version=2  ← Header versioning

Naming:
  GET    /users             → list users
  POST   /users             → create user
  GET    /users/{id}        → get user
  PUT    /users/{id}        → replace user
  PATCH  /users/{id}        → partial update
  DELETE /users/{id}        → delete user
  GET    /users/{id}/orders → nested resource

Status Codes to Know:
  200 OK           → success
  201 Created      → resource created (POST)
  204 No Content   → success, no body (DELETE)
  400 Bad Request  → client error, validation failed
  401 Unauthorized → not authenticated
  403 Forbidden    → authenticated but not authorized
  404 Not Found    → resource doesn't exist
  409 Conflict     → duplicate, version mismatch
  429 Too Many Requests → rate limit hit
  500 Internal Server Error → server bug
  503 Service Unavailable   → overloaded or down

Pagination:
  Cursor-based (preferred for large datasets):
    GET /posts?cursor=abc123&limit=20
    Response: { data: [...], next_cursor: "xyz789" }

  Offset-based (simple but doesn't scale):
    GET /posts?page=5&limit=20
```

### API Gateway Responsibilities
```
The API Gateway should handle:
  ✓ Authentication & Authorization (JWT validation, OAuth)
  ✓ Rate limiting & throttling
  ✓ SSL termination
  ✓ Request routing (to correct microservice)
  ✓ Load balancing
  ✓ Request/response transformation
  ✓ Circuit breaking
  ✓ Logging & tracing (inject correlation IDs)
  ✓ Caching (for idempotent GETs)

Do NOT put business logic in the API Gateway
```

---

## 11. LOAD BALANCING & TRAFFIC MANAGEMENT

### Load Balancing Algorithms
```
Round Robin
  → Each request goes to the next server in rotation
  → Simple, equal distribution
  → Problem: ignores server capacity/load

Weighted Round Robin
  → Servers with higher capacity get more requests
  → Good when servers have different specs

Least Connections
  → Route to server with fewest active connections
  → Good for long-lived connections (WebSockets)

IP Hash / Sticky Sessions
  → Same client always hits same server
  → Needed for stateful sessions (without shared cache)
  → Problem: imbalanced if one IP is large (corporate NAT)

Random
  → Simple, works well at scale

Resource-Based
  → Route based on CPU/memory metrics
  → Most accurate, highest complexity
```

### L4 vs L7 Load Balancing
```
L4 (Transport Layer):
  → Routes based on IP + TCP port
  → Doesn't inspect HTTP content
  → Very fast (less processing)
  → Use for: raw throughput, non-HTTP protocols
  → Examples: AWS NLB, HAProxy (TCP mode)

L7 (Application Layer):
  → Routes based on HTTP headers, URL, cookies
  → Can do content-based routing (A/B testing, canary)
  → Slightly more overhead
  → Use for: HTTP services, API routing, SSL termination
  → Examples: AWS ALB, NGINX, Envoy, Traefik
```

### Geographic Load Balancing
```
DNS-based GeoDNS:
  → Different IP returned based on client geography
  → Lowest latency routing
  → Failover to other region on health check fail
  → TTL must be low for fast failover

Anycast:
  → Same IP announced from multiple data centers
  → BGP routes to nearest PoP
  → Used by CDNs and DNS providers

Global Load Balancers:
  → AWS Global Accelerator
  → GCP Global Load Balancer
  → Cloudflare Load Balancing
```

---

## 12. STORAGE SYSTEMS CHEATSHEET

### Blob / Object Storage
```
Use for: images, videos, documents, ML models, backups, logs

Key features:
  - Virtually unlimited storage
  - Cheap (cents per GB/month)
  - Global replication available
  - URL-based access
  - Lifecycle policies (move to cold storage after 90 days)

Architecture pattern:
  Client → (upload URL) → API Service
  Client → (pre-signed URL) → S3 directly   ← preferred for large files

Bucket naming: service-env-type (e.g., myapp-prod-avatars)
File naming:   prefix/year/month/day/uuid.ext
               user-avatars/2024/01/15/abc-123.jpg
```

### File Storage vs Block Storage vs Object Storage
```
Block Storage (EBS, iSCSI):
  - Raw disk attached to VM
  - Low latency (< 1ms)
  - Use for: OS disk, databases, requires mount
  - Not shareable across instances

File Storage (EFS, NFS, NAS):
  - POSIX filesystem, shareable
  - Good for: shared configuration, CMS assets
  - Higher latency than block

Object Storage (S3, GCS):
  - HTTP-based, unlimited scale
  - Cheapest at scale
  - Use for: static assets, media files, backups
  - No random writes (write-once, replace-all)
```

### CDN Strategy
```
Use CDN for:
  ✓ Static assets (JS, CSS, images, fonts)
  ✓ Video/audio streaming
  ✓ User-uploaded content (profile pictures, documents)
  ✓ API responses that are the same for all users
  ✓ DDoS protection (absorb traffic at edge)

CDN Cache-Control headers:
  Cache-Control: public, max-age=31536000, immutable   → 1 year (versioned assets)
  Cache-Control: public, max-age=3600                  → 1 hour (API responses)
  Cache-Control: no-cache, no-store                    → never cache (private data)

CDN Invalidation:
  Option A: Change file URL on every deploy (hash in filename) ← preferred
  Option B: Purge CDN cache on deploy (can take time to propagate)
```

---

## 13. CONSISTENCY & AVAILABILITY TRADEOFFS (CAP)

### CAP Theorem in Plain English
```
In a distributed system with network partitions (P is always true):
  Choose ONE of:
    C = Consistency   (all nodes see same data at same time)
    A = Availability  (every request gets a response)

CP systems: Banking, inventory, booking (correctness over availability)
AP systems: Social feeds, DNS, caching (availability over correctness)
```

### PACELC Model (More Realistic)
```
If there's a Partition:
  Choose: Availability (A) or Consistency (C)
Else (normal operation):
  Choose: Latency (L) or Consistency (C)

PACELC ratings:
  Cassandra → PA/EL → favor availability and low latency
  DynamoDB  → PA/EL → favor availability and low latency
  MongoDB   → PA/EC → favor availability, strong consistency for reads
  PostgreSQL → PC/EC → strong consistency always
  Spanner   → PC/EC → strong global consistency
  Zookeeper → PC/EC → strong consistency
```

### Consistency Models Explained
```
Strong Consistency:
  After write, all reads see the new value immediately
  Use for: banking, seat booking, inventory
  Cost: higher latency, lower availability

Linearizability:
  Operations appear to happen at a single point in time
  Strongest form of consistency
  Use for: distributed locks, leader election

Sequential Consistency:
  All nodes see operations in the same order
  No real-time guarantee

Causal Consistency:
  Causally related operations seen in order
  "You see your own writes" + "you see what you've read"
  Use for: social feeds, comments (reply after post)

Eventual Consistency:
  Given no new writes, all replicas converge eventually
  Use for: DNS, shopping carts, social likes
  Cost: temporary inconsistency windows

Read-Your-Writes:
  User always sees their own writes
  Others may not see them yet
  Use for: profile updates, comment submission
```

### Conflict Resolution Strategies (for Eventual Consistency)
```
Last Write Wins (LWW):
  → Timestamp determines winner
  → Simple but can lose data
  → Use when last value is correct (sensor readings)

Vector Clocks:
  → Track causality, detect concurrent updates
  → Can show conflict to user for manual resolution
  → Use for: collaborative docs, shopping carts

CRDTs (Conflict-free Replicated Data Types):
  → Data structures that auto-merge without conflict
  → Counters (G-Counter, PN-Counter)
  → Sets (G-Set, OR-Set)
  → Text editing (RGA, LSEQ)
  → Use for: collaborative editing, distributed counters

Application-Level Merge:
  → Custom merge logic for domain objects
  → Most flexible but most complex
```

---

## 14. DISTRIBUTED SYSTEMS PATTERNS

### Distributed Locking
```
Use distributed lock when:
  - Multiple instances must NOT process the same job
  - Shared resource must be updated atomically
  - Leader election is needed

Redis-based lock (Redlock algorithm):
  1. Get current timestamp T1
  2. Try to SET key with NX (not exists) and PX (expiry) on N Redis nodes
  3. Lock acquired if majority (N/2+1) acquired within validity time
  4. Validity = expiry - (T2-T1) - clock_drift
  5. Release by deleting key (only if it's yours — check token)

ZooKeeper / etcd (stronger):
  → Use for critical locks (leader election, distributed coordination)
  → More expensive but stronger consistency

Watch out for:
  → GC pauses can cause lock expiry before operation completes
  → Always set TTL to avoid deadlocks
  → Don't hold locks across network calls
```

### Circuit Breaker Pattern
```
States:
  CLOSED → requests pass through normally
  OPEN   → requests fail immediately (fast fail, no retries)
  HALF-OPEN → trial requests to check if service recovered

Transitions:
  CLOSED → OPEN:      N failures in window
  OPEN → HALF-OPEN:   timeout expires (e.g., 30 seconds)
  HALF-OPEN → CLOSED: trial request succeeds
  HALF-OPEN → OPEN:   trial request fails

Benefits:
  - Prevents cascading failures
  - Gives failing service time to recover
  - Returns fast failures (better UX than hanging)

Libraries: Hystrix (Java), Polly (.NET), resilience4j, go-kit
```

### Bulkhead Pattern
```
Isolate resources per consumer to prevent one consumer from
exhausting all resources and affecting others.

Example:
  Without bulkhead: 1 slow DB client monopolizes all 100 DB connections
  With bulkhead:    Each client gets its own pool of 10 connections

Implementation:
  - Thread pool isolation (Hystrix)
  - Connection pool per service/tenant
  - Separate queues per priority tier
  - Container resource limits (CPU/memory quotas)
```

### Saga Pattern (Distributed Transactions)
```
Problem: Can't do ACID transactions across microservices

Solution: Sequence of local transactions + compensating transactions

Choreography-based Saga:
  Each service emits events, next service listens
  + No central coordinator (decentralized)
  - Hard to track, harder to debug

Orchestration-based Saga:
  Central Saga Orchestrator sends commands, receives events
  + Easy to visualize and debug
  - Central point of failure, coupling

Example: Book Hotel + Book Flight + Charge Card
  1. BookHotel → success → emit HotelBooked
  2. BookFlight → success → emit FlightBooked
  3. ChargeCard → FAIL → emit ChargeFailed
  4. Compensate: CancelFlight, CancelHotel (in reverse)

Rules:
  → All steps must be idempotent
  → Compensating transactions must always succeed
  → Design for "at-least-once" delivery
```

### Service Discovery
```
Client-side Discovery:
  Service registers with registry (Consul, Eureka, etcd)
  Client queries registry and picks an instance
  Client does load balancing
  + More control, single network hop
  - Client complexity, coupling to registry

Server-side Discovery:
  Service registers with registry
  Client calls load balancer
  Load balancer queries registry and routes
  + Simple client
  - Extra network hop, load balancer can be bottleneck

DNS-based Discovery:
  Services registered as DNS entries
  Simple, works with any client
  - Caching issues, low granularity
```

### Leader Election
```
Use when exactly one service instance must:
  - Process cron jobs
  - Send notifications
  - Act as primary DB writer

Implementations:
  ZooKeeper:   Create ephemeral node; first to succeed = leader
  etcd:        PUT with lease; lease expiry triggers re-election
  Redis:       SET key NX EX; holder = leader
  Kubernetes:  Leader election via Lease resource (built-in)

Watch for:
  - Split-brain: two nodes think they're leader
  - Use fencing tokens to prevent stale leader writes
  - Implement health checks to detect leader failure
```

---

## 15. MICROSERVICES PATTERNS

### API Gateway Pattern
```
Responsibilities:
  → Authentication (validate JWT/OAuth tokens)
  → Authorization (check permissions)
  → Rate limiting (per user, per API key)
  → SSL termination
  → Request routing (to correct service)
  → Request aggregation (one call → multiple services)
  → Response transformation
  → Caching
  → Logging, tracing, metrics

Anti-pattern: Logic leaking into gateway
  DO: Validate token format in gateway
  DON'T: Check user permissions against DB in gateway
```

### Backend for Frontend (BFF) Pattern
```
Problem: Web, mobile, IoT clients have different data needs
Solution: Dedicated backend per frontend type

  [Web Client]       → [Web BFF]     → [Microservices]
  [Mobile Client]    → [Mobile BFF]  → [Microservices]
  [3rd Party Client] → [Public API]  → [Microservices]

Benefits:
  - Each BFF optimized for its client
  - Mobile BFF returns compact responses (save bandwidth)
  - Web BFF returns richer data
  - Teams own their BFF

Trade-off: Code duplication in BFFs
```

### Sidecar Pattern
```
Attach a helper container alongside each service container

Use for:
  - Service mesh (Envoy, Linkerd, Istio proxies)
  - Log shipping (Fluentd, Filebeat)
  - Secret injection (Vault agent)
  - Metrics collection (Prometheus agent)
  - mTLS (mutual TLS between services)

Benefits:
  - Cross-cutting concerns handled without changing app code
  - Language-agnostic
  - Consistent behavior across all services
```

### Event-Driven Architecture
```
Services communicate via events (not direct calls)
Events are facts: "OrderPlaced", "UserRegistered", "PaymentFailed"

Command vs Event:
  Command: "PlaceOrder" → directed at one service, expects action
  Event:   "OrderPlaced" → broadcast, multiple services can react

Event Schema Design:
  {
    "event_id": "uuid",
    "event_type": "order.placed",
    "version": "1.0",
    "timestamp": "2024-01-15T10:00:00Z",
    "source": "order-service",
    "data": {
      "order_id": "123",
      "user_id": "456",
      "total": 99.99
    }
  }

Schema Registry:
  Store event schemas (Avro, Protobuf, JSON Schema)
  Producers register schema before publishing
  Consumers validate incoming events
  Enables schema evolution without breaking consumers
```

### Data Consistency in Microservices
```
The golden rule: Each microservice owns its data.
NO shared databases between services.

Patterns for cross-service data:
  1. Sync (REST/gRPC) — call service directly
     + Simple, consistent view
     - Coupling, availability risk

  2. Data Duplication (with events)
     → Service B subscribes to Service A's events
     → Maintains its own copy of relevant data
     + Decoupled, resilient
     - Eventually consistent, sync complexity

  3. API Composition
     → Query multiple services, merge in memory
     + No data duplication
     - Performance overhead, partial failure handling

  4. CQRS with Materialized Views
     → Read model built from multiple services' events
     + Fast reads, decoupled writes
     - Complex infrastructure
```

---

## 16. DATA PARTITIONING & SHARDING

### When to Shard
```
Consider sharding when:
  □ Single DB instance maxes out on disk (>10 TB)
  □ Write QPS exceeds single-node capacity
  □ Query latency degrades due to table size
  □ Regulatory requirements mandate data locality

Try these BEFORE sharding:
  1. Vertical scaling (bigger instance)
  2. Read replicas
  3. Caching layer
  4. Archiving old data
  5. Data compression
```

### Sharding Strategies

#### Hash-Based Sharding
```
shard_id = hash(shard_key) % num_shards

Pros:
  + Even distribution of data
  + Predictable shard for a given key
Cons:
  - Resharding is painful (consistent hashing helps)
  - Range queries span multiple shards
  - Hotspots possible if many same-key writes (celebrities)

Best for: User data, equal distribution needed
```

#### Range-Based Sharding
```
Shard by range: users 0-10M on shard 1, 10M-20M on shard 2

Pros:
  + Range queries efficient (same shard)
  + Easy to reason about data location
Cons:
  - Uneven distribution (hotspots at popular ranges)
  - Last shard always gets new writes

Best for: Time-series data, ordered IDs
```

#### Directory-Based Sharding
```
Lookup service maps key → shard

Pros:
  + Flexible, any mapping is possible
  + Easy to rebalance shards
Cons:
  - Lookup service is a bottleneck + single point of failure
  - Extra hop for every request

Best for: Non-uniform data, when flexibility needed
```

#### Consistent Hashing
```
Ring of 2^32 positions
Nodes placed on ring at hash(node_id)
Data assigned to nearest node clockwise
Rebalancing: Only K/N keys move when adding node N

Virtual nodes (vnodes):
  Each physical node gets 150-200 virtual nodes
  Ensures even distribution
  Used by Cassandra, DynamoDB

Good for: Dynamic cluster sizing, avoiding resharding pain
```

### Shard Key Selection Rules
```
GOOD shard key:
  ✓ High cardinality (many unique values)
  ✓ Low correlation (avoids hotspots)
  ✓ Even distribution
  ✓ Appears in most queries (avoids scatter-gather)
  ✓ Immutable (no need to move data between shards)

Examples:
  user_id    → Good (high cardinality, even distribution)
  tenant_id  → Good for multi-tenant (data locality per tenant)
  timestamp  → Risky (all new writes go to last shard)
  country    → Risky (US has 10x traffic of others = hotspot)
  status     → Terrible (low cardinality, ACTIVE hotspot)
```

---

## 17. REPLICATION STRATEGIES

### Replication Modes
```
Synchronous Replication:
  Write committed only when ALL replicas acknowledge
  + Zero data loss (strong consistency)
  - Latency = slowest replica's latency
  Use for: banking, inventory, critical data

Asynchronous Replication:
  Write committed after primary acknowledges
  Replicas catch up eventually
  + Low write latency
  - Potential data loss on primary failure (RPO > 0)
  Use for: analytics replicas, reporting, social feeds

Semi-synchronous (MySQL default):
  At least 1 replica must acknowledge
  Balance between safety and performance
```

### Replication Topologies
```
Single Leader (Master-Slave):
  One primary handles writes, N replicas handle reads
  Simple, most common
  Failover: promote replica to primary
  RPO: seconds to minutes (async)

Multi-Leader:
  Multiple primaries accept writes
  Useful for multi-region active-active
  Conflict resolution needed (LWW, CRDTs, user resolution)

Leaderless (Dynamo-style):
  Any node accepts writes
  Quorum reads/writes: W + R > N
  Use: N=3, W=2, R=2 for strong consistency
  Use: N=3, W=1, R=1 for high availability
  Read repair + anti-entropy for convergence
```

### Recovery Point Objective (RPO) vs Recovery Time Objective (RTO)
```
RPO = How much data loss is acceptable?
  RPO = 0: synchronous replication required
  RPO = minutes: async replication + frequent WAL shipping
  RPO = hours: daily backups acceptable

RTO = How long can the system be down?
  RTO = seconds: hot standby, automatic failover
  RTO = minutes: warm standby, manual failover
  RTO = hours: cold standby, restore from backup

Tier 0 (mission critical): RPO=0, RTO=0     → synchronous multi-AZ
Tier 1 (business critical): RPO<1hr, RTO<1hr → async replication
Tier 2 (important): RPO<24hr, RTO<4hr       → daily backups
Tier 3 (non-critical): RPO>24hr, RTO>24hr   → weekly backups
```

---

## 18. RATE LIMITING & THROTTLING

### Rate Limiting Algorithms

#### Token Bucket (Most Common)
```
Bucket capacity: max burst allowed
Token refill rate: sustained request rate
Each request consumes 1 token
If bucket empty: request rejected (429)

Parameters:
  capacity = 100 (burst up to 100 requests)
  rate     = 10 tokens/second

Best for: APIs, burst-friendly applications
```

#### Leaky Bucket
```
Requests enter a queue (bucket)
Requests processed at fixed rate (leak)
If bucket full: request rejected

Smooths out traffic spikes
Best for: network traffic shaping, stable output rate
```

#### Fixed Window Counter
```
Time divided into fixed windows (e.g., per minute)
Counter increments per request
Reset at window boundary

Problem: Allows 2x rate at window boundaries
  (100 requests at 00:59, 100 requests at 01:00)
Best for: Simple quota enforcement (daily limits)
```

#### Sliding Window Log
```
Store timestamp of each request
On new request: remove timestamps older than window
Count remaining = current request count
If count > limit: reject

+ Accurate
- Memory intensive (store all timestamps)
Best for: accurate rate limiting where memory is available
```

#### Sliding Window Counter
```
Hybrid of fixed window + sliding
Use weights from current and previous window

current_count = prev_window_count * (1 - time_elapsed_fraction) + curr_window_count

+ Low memory, reasonably accurate
Best for: Production rate limiting at scale
```

### Where to Store Rate Limit State
```
Redis (recommended):
  INCR key             → atomic counter
  EXPIRE key 60        → 60-second window
  Use SETNX + TTL for token bucket
  Use Sorted Sets for sliding window log

Redis + Lua script:
  Atomic check-and-increment in one round trip
  Avoids race conditions

Distributed counters:
  Redis Cluster → partition key = user_id or ip_address
  Sticky routing to same shard for same user
```

### Rate Limit Key Design
```
By user:        rate_limit:user:{user_id}:{window}
By IP:          rate_limit:ip:{ip_addr}:{window}
By API key:     rate_limit:apikey:{key}:{window}
By endpoint:    rate_limit:user:{user_id}:endpoint:{path}:{window}
By tenant:      rate_limit:tenant:{tenant_id}:{window}

Multi-level:
  Global per user: 1000 req/day
  Per-endpoint: 100 req/min for POST /search
  Burst: 20 req/sec max
```

---

## 19. SEARCH SYSTEMS

### Search Decision Tree
```
Full-text search needed?
  YES → Elasticsearch / OpenSearch / Typesense

Autocomplete / prefix search?
  YES → Trie (in-memory), Redis prefix, Elasticsearch prefix query

Geospatial search?
  YES → Elasticsearch geo queries, PostGIS, Redis GEO

Semantic / vector search?
  YES → Pinecone, Weaviate, pgvector, Qdrant

Faceted / filtered search?
  YES → Elasticsearch with aggregations

SQL LIKE for small dataset?
  YES → PostgreSQL full-text search (pg_trgm extension)
```

### Elasticsearch Architecture
```
Index    → like a database table
Document → like a row (JSON)
Field    → like a column
Shard    → unit of distribution (Lucene instance)
Replica  → copy of shard for HA

Sizing rule:
  Shard size: 20-50 GB (sweet spot)
  # Shards = total_data_size / 40 GB
  # Replicas = 1 (for HA) or 2 (for resilience)

Indexing pipeline:
  Source DB → Debezium (CDC) → Kafka → Logstash/Flink → ES
  Or:
  Source DB → Application writes to both DB and ES

Search flow:
  Query → Scatter (broadcast to all shards) → Gather (merge, rank) → Return
```

### Autocomplete Design
```
Approach 1: Trie (in-memory)
  Prefix search → O(L) time, L = prefix length
  Pre-computed tries loaded into memory
  Good for: small/medium datasets (<100M terms)

Approach 2: Elasticsearch Prefix
  Use "search_as_you_type" field type
  Good for: large datasets, text metadata

Approach 3: Redis Sorted Set
  Store all strings + their scores
  Use ZRANGEBYLEX to get prefix matches
  score = popularity/usage
  Fast, simple, horizontally scalable

Approach 4: Cassandra + Prefix Table
  Pre-generate prefix → [results] table
  Very fast reads, expensive to maintain

Typically asked follow-ups:
  - How to handle typos? → Edit distance / Levenshtein
  - How to rank? → CTR, usage frequency, recency
  - How to personalize? → User's history + global ranking blended
```

---

## 20. NOTIFICATION SYSTEMS

### Notification Architecture
```
[Event Source] → [Notification Service] → [Channel Workers]
                         |
                    [User Preferences DB]
                    [Template Engine]
                    [Delivery Log]

Channel Workers:
  Email Worker    → SMTP / SendGrid / SES
  Push Worker     → APNs (iOS), FCM (Android)
  SMS Worker      → Twilio, SNS
  Slack Worker    → Webhook
  Webhook Worker  → Customer's endpoint
```

### Delivery Guarantees
```
At-most-once:   Send once, may be lost → newsletter, promotions
At-least-once:  May duplicate, not lost → alerts, order confirmations
Exactly-once:   Never lost, never duplicated → payment receipts

For exactly-once:
  - Idempotency key per notification
  - Deduplication table (notification_id → delivered_at)
  - Check before sending
```

### Fan-out for Feed / Notifications at Scale
```
Push model (write-time fan-out):
  When user X posts → immediately write to followers' inboxes
  + Fast reads (pre-computed)
  - Slow writes for users with millions of followers (celebrity problem)

Pull model (read-time fan-out):
  When user reads → pull from all followees, merge, rank
  + Simple writes
  - Slow reads

Hybrid (best for large scale):
  Regular users (< 10K followers): push model
  Celebrity users (> 10K followers): pull model
  On read: merge pre-computed feed + pull from celebrities
```

---

## 21. OBSERVABILITY & MONITORING

### The Three Pillars of Observability
```
1. Metrics (What is happening?)
   → Counters, gauges, histograms
   → QPS, latency, error rate, CPU, memory
   → Tools: Prometheus, Datadog, CloudWatch

2. Logs (What happened and why?)
   → Structured logs (JSON), timestamped, with correlation IDs
   → Tools: ELK Stack, Loki, Splunk, CloudWatch Logs

3. Traces (Where did time go?)
   → Distributed traces across services
   → Spans with parent-child relationships
   → Tools: Jaeger, Zipkin, DataDog APM, AWS X-Ray
```

### Key Metrics to Track Per Service
```
RED Method (for services):
  Rate     → requests per second
  Errors   → error rate (5xx / total)
  Duration → latency (p50, p95, p99)

USE Method (for resources):
  Utilization → CPU %, memory %, disk %
  Saturation  → queue depth, wait time
  Errors      → hardware errors, dropped packets

SLI / SLO / SLA:
  SLI = Service Level Indicator (actual measurement: p99 latency)
  SLO = Service Level Objective (target: p99 < 200ms)
  SLA = Service Level Agreement (contractual: 99.9% uptime)

Error Budget:
  SLO = 99.9% → Error budget = 0.1% = 43.8 min/month
  If budget exhausted: freeze new deployments, focus on reliability
```

### Alerting Rules
```
Alert on symptoms, not causes:
  ✓ "Error rate > 1% for 5 minutes" (symptom)
  ✗ "CPU > 80%" (cause — may not affect users)

Alert fatigue rules:
  - Alert must be actionable (human must do something)
  - Alert must be urgent (can't wait until morning)
  - Alert must have runbook link

Severity levels:
  P1 (Critical): Service down, data loss risk → page on-call immediately
  P2 (High):     Degraded, SLO at risk → notify team channel, resolve in 4h
  P3 (Medium):   Non-critical issue → ticket, resolve in 24h
  P4 (Low):      Cleanup / optimization → backlog
```

---

## 22. SECURITY DESIGN PATTERNS

### Authentication & Authorization
```
Authentication (who are you?):
  JWT (JSON Web Token):
    Header.Payload.Signature
    Stateless, scalable
    Watch for: expiry, revocation (use short-lived tokens)
    Access token: 15 min TTL
    Refresh token: 7-30 days, stored securely

  OAuth2 / OIDC:
    Delegated authorization
    Authorization Code Flow for web apps
    PKCE for mobile/SPA apps
    Client Credentials for service-to-service

Authorization (what can you do?):
  RBAC (Role-Based Access Control):
    User → Role → Permissions
    Simple, easy to audit
    Good for: most applications

  ABAC (Attribute-Based Access Control):
    Policy based on attributes (user.department, resource.owner)
    More flexible but complex
    Good for: fine-grained access, multi-tenant

  ReBAC (Relationship-Based Access Control):
    Google Zanzibar model
    Access based on relationships (owner, viewer, editor)
    Good for: Google Docs-style sharing
```

### Secrets Management
```
NEVER:
  × Hard-code secrets in code
  × Store secrets in environment variables in plain text
  × Commit secrets to version control

DO:
  ✓ Use secret management service (HashiCorp Vault, AWS Secrets Manager)
  ✓ Rotate secrets automatically
  ✓ Use principle of least privilege
  ✓ Audit secret access logs
  ✓ Use short-lived credentials where possible
```

### Defense in Depth
```
Network Layer:
  → VPC with private subnets for databases
  → Security groups (allow only necessary ports)
  → WAF (Web Application Firewall) for public endpoints

Application Layer:
  → Input validation + sanitization
  → Parameterized queries (prevent SQL injection)
  → CSP headers, CORS policy
  → Rate limiting
  → DDoS protection (Cloudflare, AWS Shield)

Data Layer:
  → Encryption at rest (AES-256)
  → Encryption in transit (TLS 1.3)
  → Field-level encryption for PII
  → Data masking in non-prod environments
  → Audit logs for sensitive data access
```

---

## 23. COMMON SYSTEM DESIGN TEMPLATES

---

### 23.1 URL SHORTENER

**Requirements**: Create short URLs (like bit.ly), redirect users, track clicks.

```
Scale: 100M URLs created/day, 10B redirects/day
QPS (write): ~1,200/sec
QPS (read):  ~115,000/sec (read:write = 100:1)
Storage: 100M * 365 * 5 * 500 bytes ≈ 91 TB (5 years)
```

**Key Design Decisions**:
```
Short URL generation:
  Option A: MD5/SHA1 hash → take first 7 chars (collision risk)
  Option B: Base62 encoding of auto-increment ID ← recommended
             [0-9a-zA-Z] = 62 chars
             7 chars = 62^7 = 3.5 trillion URLs
  Option C: Distributed ID generator (Snowflake)

Redirect type:
  301 Permanent: Browser caches → fewer hits to your servers
  302 Temporary: Every redirect hits your servers → better analytics ← use this

Storage:
  Key-value: short_code → {long_url, user_id, created_at, expire_at}
  Cache top 20% URLs in Redis (handle 80% of traffic)

Database schema:
  urls table: id, short_code, long_url, user_id, created_at, expire_at, click_count
  clicks table: id, url_id, timestamp, ip, user_agent, country (for analytics)

Architecture:
  [Client] → [CDN] → [Load Balancer] → [Redirect Service]
                                              ↓
                                        [Redis Cache]
                                              ↓ (miss)
                                        [URL Database]

  Analytics: async via Kafka → Flink/Spark → ClickHouse
```

---

### 23.2 CHAT SYSTEM

**Requirements**: 1:1 messaging, group chats, online presence, read receipts.

```
Scale: 500M DAU, 50 messages/user/day = 25B messages/day
QPS: 25B / 86400 ≈ 290K QPS
Storage: 25B * 100 bytes ≈ 2.5 TB/day
```

**Key Design Decisions**:
```
Real-time messaging protocol:
  Option A: HTTP Long Polling → client polls every few seconds
  Option B: Server-Sent Events (SSE) → server pushes to client
  Option C: WebSocket ← recommended for chat
             Persistent bidirectional connection
             Low latency, efficient

Message delivery:
  1. Sender → WebSocket → Chat Server
  2. Chat Server → stores message in DB
  3. Chat Server → checks if recipient is online
     ONLINE:  push via WebSocket
     OFFLINE: push via push notification (APNs/FCM)

Presence service:
  User connects → set online status (Redis: SET online:{user_id} 1 EX 60)
  Heartbeat every 30s (refresh TTL)
  WebSocket disconnect → key expires → user goes offline
  Subscribe to presence changes via Redis Pub/Sub

Message schema:
  message_id (UUID), conversation_id, sender_id,
  content (encrypted), created_at, message_type

Chat server scalability:
  Use consistent hashing to route same user to same chat server
  Or: stateless servers + Redis for session lookup

Group chat:
  Small groups (< 500): Fan-out on write (message to each member)
  Large groups (> 500): Fan-out on read (members pull from group mailbox)

Storage:
  Recent messages: Redis (last 100 messages per conversation)
  All messages: Cassandra (write-heavy, time-series-like access)
  Search: Elasticsearch

Message encryption:
  End-to-end: Signal protocol (client-side keys)
  Transport: TLS
```

---

### 23.3 NEWS FEED / SOCIAL FEED

**Requirements**: Users see posts from people they follow, ranked by relevance.

```
Scale: 300M DAU, 5M posts/day, avg 200 followers per user
QPS (read): ~50K/sec
Fan-out rate: 5M posts/day * 200 followers = 1B feed writes/day
```

**Feed Generation Strategies**:
```
Push (Write-time fan-out):
  On post → write to followers' pre-computed feeds immediately
  + Reads are O(1) — just read the feed
  - Celebrity with 50M followers = 50M writes per post

Pull (Read-time fan-out):
  On load → query followees' posts, merge, rank
  + No pre-computation needed
  - Slow reads, expensive at request time

Hybrid (recommended for > 10M users):
  Regular users (< 10K followers): push model
  Celebrities (> 10K followers): pull model
  On read: merge pre-built feed + pull celebrity posts → rank

Feed ranking signals:
  - Recency (newer = higher score)
  - Engagement (likes, comments, shares)
  - Relationship strength (close friends weighted higher)
  - Content type preference (user interacts more with videos)
  - Freshness (avoid showing same post twice)

Data model:
  Feed table: user_id | post_id | score | created_at
  Index: user_id + created_at (for pagination)

Storage:
  Feed: Redis sorted set per user
    Key: feed:{user_id}
    Score: timestamp or ML-derived relevance score
    Trim to last 1000 posts per user

  Posts: Cassandra (high write throughput, time-series)
  Post metadata: PostgreSQL
  Media: S3 + CDN
```

---

### 23.4 VIDEO STREAMING SERVICE

**Requirements**: Upload, transcode, and stream videos (YouTube/Netflix scale).

```
Scale: 5M video uploads/day, 500M daily viewers, 1B hours watched/day
Avg video size: 500 MB
Storage new: 5M * 500 MB = 2.5 PB/day
CDN bandwidth: 1B hours * 60 min/hr * 1 MB/min ≈ 60 PB/day
```

**Video Upload Pipeline**:
```
1. Client → pre-signed S3 URL → upload raw video directly to S3
2. S3 upload complete → trigger Lambda/SNS event
3. Transcode Queue (Kafka) receives job
4. Transcoding Workers:
   - Validate video integrity
   - Extract metadata (duration, resolution, framerate)
   - Transcode to multiple resolutions (360p, 720p, 1080p, 4K)
   - Generate thumbnails at multiple timestamps
   - Output segmented HLS/DASH chunks
5. Upload segments to S3 / CDN
6. Update video metadata DB (status: ready)
7. Notify upload service (webhook/event)
```

**Video Streaming (Adaptive Bitrate)**:
```
Protocol: HLS (HTTP Live Streaming) or MPEG-DASH
Each quality level split into ~10s segments
Manifest file (.m3u8) lists all segments

Player flow:
  1. Request manifest file
  2. Assess network bandwidth
  3. Request segment of appropriate quality
  4. Switch quality level dynamically per segment

CDN:
  Edge nodes cache video segments globally
  95%+ requests served from CDN, not origin
  CDN pulls from S3 on cache miss

Database:
  Video metadata: PostgreSQL (title, description, status, owner)
  View counts: Redis counter → batch flush to DB
  User watch history: Cassandra (append-only, user_id + timestamp)
```

**Recommendations**:
```
Collaborative filtering: Users who watched X also watched Y
Content-based filtering: Similar genre, topic, creator
Two-tower ML model: User embedding + Video embedding → dot product
Serving: Pre-compute recommendations offline, cache per user
```

---

### 23.5 RIDE-SHARING SERVICE

**Requirements**: Match drivers and riders, real-time location tracking, pricing.

```
Scale: 10M rides/day, 5M concurrent drivers sending location every 5s
Location updates: 5M * (86400/5) = 86B updates/day = ~1M/sec
```

**Core Architecture**:
```
Location Update Flow:
  Driver App → WebSocket → Location Service → Redis GEO

Match Making:
  Rider requests ride (lat/lng) → 
  Matching Service →
    GEORADIUS search in Redis for available drivers within 5km →
    Pick closest available driver →
    Send match to driver app (push notification/WebSocket)

Location Storage:
  Hot (last 1 min): Redis GEO
    GEOADD drivers:available lon lat driver_id
    GEORADIUS drivers:available lon lat 5 km ASC COUNT 10

  Warm (last 24h): Cassandra
    driver_id, timestamp, lat, lng, status

  Cold (historical): S3 (compressed)

Pricing (Surge):
  Demand/Supply ratio per geo cell (H3 hexagonal grid)
  High demand + low supply → surge multiplier
  Real-time update via Kafka + streaming aggregation

Trip State Machine:
  SEARCHING → MATCHED → DRIVER_EN_ROUTE → IN_PROGRESS → COMPLETED
  Also: CANCELLED, NO_DRIVER_FOUND

ETA Calculation:
  Map data: OpenStreetMap or Google Maps API
  Real-time traffic: aggregate driver GPS data
  Routing engine: OSRM, Valhalla, or commercial API
```

---

### 23.6 RATE LIMITER

**Requirements**: Design a rate limiter service usable by all microservices.

```
Requirements:
  - Support multiple algorithms (token bucket, sliding window)
  - Work across distributed instances
  - Sub-millisecond overhead
  - Support per-user, per-IP, per-API-key limits
  - Configurable rules without deploy
```

**Architecture**:
```
[API Gateway] → [Rate Limiter Middleware]
                         ↓
                   [Redis Cluster]
                   (rate limit state)
                         ↑
               [Rule Config Service]
               (rules in DB/cache)

Rate limit check (Lua script for atomicity):
  1. Get current bucket state from Redis
  2. Calculate if request is allowed
  3. Update state atomically
  4. Return: {allowed: bool, remaining: int, reset_at: timestamp}

Response headers:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 42
  X-RateLimit-Reset: 1705320000
  Retry-After: 30  (when rejected)

Rule storage:
  Redis Hash: rules:{service}:{endpoint}
  Fields: limit, window_seconds, algorithm
  Cached in-memory in middleware (TTL: 60s) → refresh from DB

Distributed challenges:
  Race condition → use Redis Lua scripts (atomic)
  Clock drift → use Redis server time (SRANDMEMBER-safe)
  Redis failure → fail open (allow requests) or fail closed (block all)
```

---

### 23.7 DISTRIBUTED CACHE

**Requirements**: Design a distributed in-memory cache like Redis or Memcached.

```
Core operations: GET, SET, DELETE, EXPIRE
Targets: < 1ms p99 latency, 100K QPS per node
```

**Architecture**:
```
Client library → Consistent hashing → Cache node

Cache node internals:
  Data structure: Hash map + Doubly linked list (LRU eviction)
  LRU eviction:
    Recently accessed → move to front of list
    Evict from tail when memory full

Memory management:
  Slab allocation (Memcached approach)
    → Pre-allocate memory in fixed-size chunks
    → Avoids fragmentation
  jemalloc / tcmalloc for Redis

Network:
  RESP protocol (Redis Serialization Protocol)
  Single-threaded event loop (Redis model)
    → Avoid mutex overhead
    → Use I/O multiplexing (epoll)

Cluster topology:
  Master + Replicas per shard
  Redis Cluster: 16,384 hash slots
  slot = CRC16(key) % 16384

Consistency:
  Writes go to master
  Reads can go to replica (eventual consistency)

Persistence (optional):
  RDB: Point-in-time snapshots
  AOF: Append-Only File (log every write)
  AOF + RDB: Use both for durability + fast restart
```

---

### 23.8 SEARCH AUTOCOMPLETE

**Requirements**: Return top 5 search suggestions as user types.

```
Scale: 10M DAU, 10 searches/user = 100M searches/day
Each search: avg 4 keystrokes before selecting = 400M queries/day
QPS: 400M / 86400 ≈ 5K QPS autocomplete requests
Latency target: < 100ms p99
```

**Architecture**:
```
[Client] → [CDN (if cacheable)] → [Autocomplete Service] → [Trie/Data Store]

Data collection:
  Log all search queries
  Batch job (weekly) to compute top queries per prefix
  Or stream processing (Kafka + Flink) for real-time trending

Trie design:
  Node: char, children[], is_end, top_searches[5]
  Each node pre-stores top 5 queries for that prefix
  Stored in Redis as sorted set:
    Key:   prefix:{prefix}
    Score: search frequency
    Value: query string

Redis approach:
  ZADD prefix:ca 1000 "cats"
  ZADD prefix:ca 800  "cars"
  ZREVRANGE prefix:ca 0 4  → top 5 results

Personalization:
  Blend global results with user's history
  Boost queries user has searched before

Filtering:
  Block offensive/inappropriate suggestions
  Blocklist stored in Redis SET, check before returning

Trie updates:
  Immutable trie: rebuild weekly, swap atomically
  Mutable trie: update with write locks (complex)
  Recommended: immutable + delta updates for trending terms

Cache:
  Cache prefix responses (most queries repeat)
  short TTL (1 min) for trending terms
  long TTL (1 hour) for stable terms
```

---

### 23.9 E-COMMERCE SYSTEM

**Requirements**: Product catalog, cart, checkout, inventory, orders.

```
Scale: 10M DAU, 100K orders/day, 10M products
Black Friday: 10x normal traffic
Read:Write = 100:1 (browse >> purchase)
```

**Service Decomposition**:
```
Product Service:
  - Product catalog (id, name, description, images)
  - Category hierarchy
  - Search index (Elasticsearch)
  - DB: PostgreSQL + Elasticsearch

Inventory Service:
  - Stock levels per product per warehouse
  - Reserve inventory (soft hold during checkout)
  - DB: PostgreSQL with FOR UPDATE SKIP LOCKED for concurrent reservations

Cart Service:
  - User's cart (session-based or user-based)
  - DB: Redis (TTL 7 days) — fast, acceptable to lose
  - Schema: cart:{user_id} → {product_id: qty, ...}

Order Service:
  - Order lifecycle (PENDING → CONFIRMED → SHIPPED → DELIVERED)
  - DB: PostgreSQL (ACID required)
  - Emit events on state changes

Payment Service:
  - Integrate with payment gateway (Stripe, PayPal)
  - Idempotency key on every payment attempt
  - DB: PostgreSQL + separate audit log

Notification Service:
  - Listen to order events → send email/SMS

Pricing Service:
  - Price calculation, discounts, taxes
  - Rules engine for promotions

Search Service:
  - Elasticsearch for full-text + filters
  - Sync from Product DB via CDC (Debezium)
```

**Checkout Flow (Saga Pattern)**:
```
1. Validate cart (check product existence, prices)
2. Reserve inventory (soft hold for 10 min)
3. Create order (PENDING)
4. Process payment
   SUCCESS → confirm order (CONFIRMED), publish OrderConfirmed event
   FAIL    → release inventory, cancel order
5. OrderConfirmed → Shipping Service creates shipment
6. OrderConfirmed → Notification Service sends email
```

**Flash Sale / High-Concurrency Inventory**:
```
Problem: 10K concurrent users trying to buy last 100 items

Solution:
  Option A: Optimistic locking
    UPDATE inventory SET qty = qty - 1, version = version + 1
    WHERE product_id = X AND qty > 0 AND version = {expected_version}
    Retry on failure

  Option B: Redis atomic decrement
    DECR inventory:{product_id}
    If < 0: INCR (rollback), return sold out
    Async sync to DB

  Option C: Queue + single worker
    All purchase requests → queue
    Single worker processes sequentially
    Simple but slow for very high volume
```

---

### 23.10 NOTIFICATION SERVICE

**Requirements**: Send notifications via email, push, SMS, Slack.

```
Scale: 100M notifications/day across all channels
  Email: 50M/day
  Push:  40M/day
  SMS:   10M/day
```

**Architecture**:
```
[Event Producer Services]
  OrderService, AlertService, etc.
        ↓
[Notification Service API]
  POST /notifications
  {user_id, template_id, data, priority}
        ↓
[Kafka Topic: notifications]
        ↓
[Notification Processor]
  1. Fetch user preferences (channels, do-not-disturb)
  2. Fetch user contact info (email, phone, device tokens)
  3. Render template with data
  4. Route to channel queue
        ↓                    ↓                   ↓
[Email Queue]         [Push Queue]         [SMS Queue]
     ↓                      ↓                   ↓
[Email Worker]         [Push Worker]       [SMS Worker]
(SendGrid/SES)        (APNs/FCM)          (Twilio/SNS)
        ↓                    ↓                   ↓
[Delivery Tracking DB]
  notification_id, user_id, channel, status, attempts, sent_at
```

**Retry Logic**:
```
Exponential backoff: 1s, 2s, 4s, 8s, 16s... up to max attempts
Dead letter queue: after 5 failures → DLQ for manual inspection
Idempotency: notification_id prevents duplicate sends

Status machine:
  QUEUED → SENDING → DELIVERED
                   → FAILED (retry)
                   → DEAD (max retries exceeded)
```

**Template Engine**:
```
Templates stored in DB with variables:
  "Hi {{user.first_name}}, your order {{order.id}} has shipped!"

Versioned templates:
  template_id, version, channel, subject, body, variables_schema

A/B testing: route % of notifications to variant templates
```

---

## 24. NUMBERS EVERY ENGINEER MUST KNOW

### Latency Numbers (2024)
```
Operation                               Time
--------------------------------------  --------
L1 cache reference                       0.5 ns
Branch mispredict                        5 ns
L2 cache reference                       7 ns
Mutex lock/unlock                       25 ns
Main memory reference                  100 ns
Compress 1K bytes with Zippy           3,000 ns   (3 µs)
Send 1K bytes over 1 Gbps network     10,000 ns  (10 µs)
Read 4K randomly from SSD             150,000 ns (150 µs)
Read 1 MB sequentially from memory    250,000 ns (250 µs)
Round trip within same datacenter     500,000 ns (0.5 ms)
Read 1 MB sequentially from SSD     1,000,000 ns (1 ms)
Disk seek                           10,000,000 ns (10 ms)
Read 1 MB sequentially from disk    20,000,000 ns (20 ms)
Send packet CA to Netherlands      150,000,000 ns (150 ms)
```

### Throughput Rules of Thumb
```
Web server (NGINX):         100K – 200K req/sec
App server (Node.js):         10K – 50K  req/sec
App server (Go/Java):         50K – 200K req/sec
PostgreSQL (reads):            5K – 50K  QPS (with cache)
PostgreSQL (writes):           1K – 10K  QPS
Redis:                       100K – 1M   ops/sec
Kafka:                        1M  – 10M  events/sec (per broker)
Cassandra (writes):          100K – 500K ops/sec (multi-node)
```

### Storage Size Reference
```
1 char    = 1 byte
Tweet     ≈ 500 bytes (with metadata)
Photo     ≈ 300 KB (compressed)
1 min audio ≈ 1 MB
1 min video (720p) ≈ 50 MB
1 min video (4K)   ≈ 400 MB

DB row sizes:
  User profile      ≈ 500 bytes – 2 KB
  Product entry     ≈ 1 – 5 KB
  Log entry         ≈ 200 – 500 bytes
```

### Power of 2 Reference
```
Power  Exact Value     Approximate  Common Name
2^10   1,024           1 thousand   1 KB
2^20   1,048,576       1 million    1 MB
2^30   1,073,741,824   1 billion    1 GB
2^32   4,294,967,296   4 billion    4 GB
2^40   ≈ 1.1 trillion  1 trillion   1 TB
```

---

## 25. FAILURE & FAULT TOLERANCE PATTERNS

### Designing for Failure
```
Assume Everything Will Fail:
  - Network will have partitions
  - Disks will corrupt
  - Machines will reboot unexpectedly
  - Services will be slow (not just down)
  - Your own code has bugs

Design Principles:
  □ Redundancy at every layer (no single points of failure)
  □ Health checks + automatic failover
  □ Graceful degradation (partial service > no service)
  □ Timeouts on every external call
  □ Retries with exponential backoff + jitter
  □ Circuit breakers to prevent cascade failures
  □ Bulkheads to isolate failure domains
  □ Idempotency for safe retries
```

### Retry Strategies
```
No retry (fire-and-forget):
  → Notifications, analytics, non-critical operations

Fixed interval retry:
  → Retry every 1s, max 3 times
  → Risk: thundering herd if all clients retry simultaneously

Exponential backoff:
  → 1s, 2s, 4s, 8s, 16s...
  → Reduces load on recovering service

Exponential backoff + jitter (recommended):
  → sleep = random(0, min(cap, base * 2^attempt))
  → Spreads retry load across time window
  → Prevents correlated retries

What to retry:
  ✓ Network timeout
  ✓ 503 Service Unavailable
  ✓ 429 Too Many Requests (after Retry-After)
  ✗ 400 Bad Request (client error, won't succeed)
  ✗ 401 Unauthorized (auth error, retry won't help)
  ✗ 404 Not Found (resource doesn't exist)
```

### Timeout Strategy
```
Always set timeouts for:
  - HTTP client calls
  - Database queries
  - Cache operations
  - Message queue operations
  - Any external I/O

Timeout ladder:
  User-facing request timeout:  1-2 seconds
  Service-to-service timeout:   100-500ms
  DB query timeout:             50-200ms
  Cache operation:              5-10ms

Cascading timeout:
  If A calls B calls C:
    A's timeout must be > B's timeout > C's timeout
    A = 1000ms, B = 500ms, C = 200ms
    Otherwise: A times out before B can respond to C's failure
```

### Chaos Engineering
```
Principles:
  1. Define steady state (normal behavior)
  2. Hypothesize that steady state continues under chaos
  3. Inject failures (kill instances, slow network, corrupt data)
  4. Observe if hypothesis is true
  5. Fix weaknesses found

Types of experiments:
  - Kill random instance → does auto-scaling work?
  - Inject 500ms latency → does circuit breaker trip?
  - Fill disk on DB node → does failover work?
  - Corrupt Kafka messages → does consumer handle it?
  - Partition network between services → correct behavior?

Tools: Chaos Monkey (Netflix), Gremlin, Litmus (Kubernetes)
```

---

## 26. TRADE-OFF CHEATSHEETS

### Performance vs Correctness
```
FASTER (less correct):
  Async writes → batch to DB
  Eventual consistency → shorter TTL
  Approximate counts (HyperLogLog)
  Read from replica → possible stale data
  Pre-compute results → might be slightly stale

CORRECT (slower):
  Sync writes → wait for DB commit
  Strong consistency → all reads from primary
  Exact counts → lock and count
  Always read from primary
  Compute on demand

Decision: Ask "What is the cost of being wrong?"
  Financial transaction? → CORRECT
  Like count on a tweet? → FASTER is fine
```

### Latency vs Throughput
```
Optimize for LATENCY (single request speed):
  - More replicas (read from nearest)
  - More caching
  - Smaller payloads (pagination)
  - Pre-compute results

Optimize for THROUGHPUT (requests per second):
  - Batching (aggregate writes)
  - Async processing
  - More parallelism (workers)
  - Larger payloads (fewer round trips)

Usually must choose one:
  A single fast disk seek vs sequential batch reads
  Individual API calls vs bulk API
  One-by-one DB writes vs bulk inserts
```

### Cost vs Performance
```
Performance is never free. Common trade-offs:

CDN: ~$0.01-0.10/GB → saves origin bandwidth + improves latency
Redis: ~$0.03-0.10/GB/month → saves DB calls, improves latency
Read replicas: 2x DB cost → reduces read latency, improves write performance
Multi-region: 2-3x total infra cost → lower latency globally, better HA
SSD vs HDD: 5-10x cost/GB → 100x lower latency for random reads
```

---

## 27. INTERVIEW ANTI-PATTERNS TO AVOID

### Common Mistakes and How to Avoid Them

```
❌ Jumping to solution without clarifying requirements
   → Always spend 5 minutes on requirements. Say: "Before I dive in,
     let me clarify a few things..."

❌ Over-engineering from the start
   → Start simple, then scale. Say: "Let's start with a basic design
     and then identify where bottlenecks would be."

❌ Using a specific technology without justification
   → Always explain WHY: "I'd use Kafka here because we need fan-out
     to multiple consumers and replay capability."

❌ Ignoring failure cases
   → Proactively say: "Let me think about what happens if this service
     goes down..." Shows maturity.

❌ Not talking through trade-offs
   → Every choice has trade-offs. Name them. "The downside of this
     approach is X, which is acceptable because..."

❌ Designing in silence
   → Narrate your thinking constantly. Interviewers want to follow
     your reasoning, not guess at it.

❌ Not handling the "scale" dimension
   → After basic design, always ask: "This works at 1K QPS. At 1M QPS,
     the bottleneck would be the database. Here's how I'd address that..."

❌ Treating the interview as a test vs a conversation
   → Say "What do you think about this approach?" It's collaborative.
     Adjust based on hints.

❌ Forgetting the data model
   → Always define the key entities and schema. Interviewers value
     concrete data models.

❌ Solving a different problem than asked
   → Periodically check: "Is this what you had in mind?" Especially
     after the first 10 minutes.
```

---

## 28. COMMUNICATION & SCORING RUBRIC

### What Interviewers Are Evaluating
```
Technical Depth (40%):
  □ Correct use of distributed systems concepts
  □ Appropriate technology choices with justification
  □ Awareness of trade-offs and failure modes
  □ Deep dives show deep understanding

Problem Solving Process (30%):
  □ Structured approach (requirements → estimate → design → deep dive)
  □ Handles ambiguity well
  □ Asks good clarifying questions
  □ Prioritizes correctly (builds important things first)

Communication (20%):
  □ Explains reasoning clearly
  □ Listens to and incorporates feedback
  □ Admits uncertainty honestly
  □ Keeps appropriate pace (not too fast/slow)

Practical Experience (10%):
  □ References real experience when appropriate
  □ Knows limitations of technologies they mention
  □ Aware of operational concerns (not just design)
```

### Phrases That Signal Seniority
```
Instead of:                      Say:
"I would use Redis"              "I'd use Redis here because it supports
                                  atomic sorted set operations which maps
                                  naturally to our leaderboard need"

"The database might be slow"     "At this scale, the DB will be our read
                                  bottleneck. I'd add a cache layer and
                                  read replicas to handle it"

"We need microservices"          "The team is growing and the checkout
                                  domain has very different scaling needs
                                  from product catalog, so extracting those
                                  two would buy us independent deployability"

"That won't work"                "That's a good point — I see one challenge:
                                  if we do X, then Y becomes difficult because
                                  Z. Here's how I'd handle it..."

"I'm not sure"                   "I haven't implemented this directly, but
                                  my understanding is X. I'd want to verify
                                  the specifics before committing."
```

### The Perfect Answer Structure
```
For every design decision, use this format:

1. STATE the decision: "I'll use Cassandra for storing the activity feed."
2. JUSTIFY it: "Because we need high write throughput and time-range queries,
               and we can tolerate eventual consistency on reads."
3. ACKNOWLEDGE the trade-off: "The downside is we lose flexible querying —
   we can't do ad-hoc queries easily."
4. HANDLE the alternative: "We could use PostgreSQL, but at 500K writes/sec
   we'd need to shard it, which adds complexity. Cassandra handles that natively."

This shows: knowledge + judgment + awareness + alternatives considered.
```

### Quick Reference: What to Say When Stuck
```
When you don't know a technology in depth:
  "I know it at a conceptual level — it's a distributed log that gives you
  ordered, replayable events. Let me design around those properties."

When asked to go deeper and you're uncertain:
  "I haven't implemented this at scale personally, but the approach I'd
  research is X, because of Y principle. How does that compare to what
  you've seen work in practice?"

When the interviewer gives a hint:
  "That's a great point — I think you're suggesting [X concern]. Let me
  revise the design to address that..."

When you've taken a wrong turn:
  "Actually, I realize the approach I outlined has a problem: [X]. Let me
  reconsider — a better solution would be [Y] because..."
```

---

## QUICK REFERENCE SUMMARY CARDS

### The Magic Checklist (30 seconds before you start drawing)
```
□ Clarified functional requirements (core features)
□ Clarified non-functional (scale, latency, consistency)
□ Did back-of-envelope math (users, QPS, storage)
□ Identified read:write ratio
□ Identified if SQL or NoSQL is appropriate
□ Know if you need async messaging
□ Know if a CDN is needed
□ Considered failure modes
□ Have 2-3 deep dives prepared
```

### Database Quick Pick
```
Transactions needed?        → PostgreSQL
Flexible schema + docs?     → MongoDB
Massive write scale?        → Cassandra
Sub-ms key-value?           → Redis / DynamoDB
Full-text search?           → Elasticsearch
Time-series / metrics?      → InfluxDB / TimescaleDB
Graph / relationships?      → Neo4j
Analytics / OLAP?           → ClickHouse / BigQuery
Global strong consistency?  → CockroachDB / Spanner
```

### Scalability Quick Pick
```
Traffic spikes?             → Auto-scaling + load balancer
Read bottleneck?            → Read replicas + Redis cache
Write bottleneck?           → Sharding + async queuing
Latency (global users)?     → CDN + multi-region
Large files?                → Object storage (S3) + CDN
Fan-out (notifications)?    → Kafka + worker pool
Complex joins slow?         → Denormalize + materialized views
Schema flexibility?         → NoSQL or JSONB columns
Too many connections?       → Connection pooling (PgBouncer)
```

### CAP Quick Pick
```
Must never lose data / be inconsistent?  → CP → Zookeeper, etcd, Spanner
Must always be available even if stale?  → AP → Cassandra, DynamoDB, DNS
Single region, no partitions expected?  → CA → Traditional RDBMS is fine
```

---

*Last updated: 2026. Always verify technology specifics before interviews — ecosystems evolve quickly.*

---

## 29. REAL-TIME & STREAMING SYSTEMS

### WebSocket vs SSE vs Long Polling
```
Long Polling:
  Client sends request → server holds until data available or timeout
  + Simple, works everywhere
  - High server connection count, inefficient
  Use for: legacy clients, simple notification pull

Server-Sent Events (SSE):
  Server pushes events over persistent HTTP connection (one-way)
  + Simple, HTTP-native, automatic reconnect
  - One-directional (server → client only)
  Use for: live dashboards, stock tickers, activity feeds

WebSocket:
  Full-duplex, persistent TCP connection
  + Bidirectional, low overhead per message
  - Not HTTP-native (proxy/firewall issues possible), stateful
  Use for: chat, multiplayer games, collaborative editing, trading

Decision rule:
  Need bi-directional? → WebSocket
  Server-push only, need simplicity? → SSE
  Low-tech client or polling is enough? → Long Polling
```

### Stream Processing Architecture
```
Lambda Architecture:
  Batch layer:  process all historical data (Spark, Hive)
  Speed layer:  process recent data in real-time (Flink, Storm)
  Serving layer: merge results for queries
  + Accurate + low latency
  - Complex, two codepaths to maintain

Kappa Architecture (recommended for most cases):
  Single streaming pipeline handles both real-time and batch
  Kafka as source of truth (infinite retention)
  Reprocess by replaying from Kafka
  + Simpler, one codebase
  - Requires stream engine to handle large replays

Common streaming tools:
  Apache Flink  → stateful stream processing, exactly-once semantics
  Apache Spark Streaming → micro-batch (not true streaming)
  Kafka Streams → lightweight, embedded in your app
  Apache Storm  → true streaming, at-least-once
```

### Real-Time Leaderboard Design
```
Data structure: Redis Sorted Set
  ZADD leaderboard:{game_id} {score} {user_id}
  ZREVRANK leaderboard:{game_id} {user_id}  → user's rank
  ZREVRANGE leaderboard:{game_id} 0 9       → top 10

Scaling:
  Global leaderboard: single Redis Sorted Set (millions of users fine)
  Per-region: separate sets, merge for global view
  Partitioned: use multiple sets, fan-out query + merge

Near-real-time updates:
  Score event → Kafka → Consumer → ZADD to Redis
  Batch flush to DB every 1-5 minutes

Friend leaderboard:
  User's friends list → ZINTERSTORE with global set → ranked subset
```

### Live Collaboration (e.g., Google Docs)
```
Core problem: Multiple users editing simultaneously → conflicts

Operational Transformation (OT):
  Every edit = operation (insert char at position X)
  Server transforms concurrent operations to preserve intent
  Used by: Google Docs

CRDT (Conflict-free Replicated Data Type):
  Local edits applied immediately, synced asynchronously
  Merges automatically without central server
  Used by: Figma, many P2P editors

Architecture:
  [Client] ←WebSocket→ [Collaboration Server]
                                ↓
                         [Operation Log (Kafka)]
                                ↓
                         [Document Store (DB)]

Presence (who is online where):
  Redis pub/sub per document
  Heartbeat every 5s → expire after 10s of silence
```

---

## 30. UNIQUE ID GENERATION & DISTRIBUTED TRANSACTIONS

### Unique ID Generation Strategies

#### UUID (v4)
```
128-bit random ID → xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
+ No coordination needed, works everywhere
- Not sortable by time, large (36 chars as string / 16 bytes binary)
- Index fragmentation in databases
Use for: external-facing IDs, when sortability doesn't matter
```

#### Snowflake ID (Twitter)
```
64-bit integer structured as:
  [41 bits timestamp ms] [10 bits machine ID] [12 bits sequence]

+ Time-sortable (newer IDs > older IDs)
+ 4096 IDs/ms per machine
+ Fits in a BIGINT (DB-friendly)
- Requires machine ID coordination
- Clock skew can cause issues (use NTP + detect backward clock)

Variants:
  Sonyflake (Japan Sony) → 39-bit time, 8-bit sequence, 16-bit machine
  Instagram ID → epoch + shard ID + auto-increment within shard

Use for: internal IDs that need ordering (messages, events, orders)
```

#### Ticket Server (Flickr-style)
```
Dedicated DB server with AUTO_INCREMENT
All services call ticket server to get next ID

+ Simple, ordered IDs
- Single point of failure
- Bottleneck at scale

Mitigation: Two ticket servers with alternating IDs (odd/even)
```

#### Redis INCR
```
REDIS INCR global:counter → atomic increment
+ Simple, fast, distributed
- Redis dependency (use Sentinel/Cluster for HA)
- Not sortable across restarts without careful seeding
```

### Distributed Transaction Patterns

#### Two-Phase Commit (2PC)
```
Phase 1 (Prepare):
  Coordinator asks all participants: "Can you commit?"
  Participants lock resources, respond YES/NO

Phase 2 (Commit/Abort):
  If ALL said YES → send COMMIT
  If ANY said NO  → send ABORT

+ ACID guarantees across services
- Blocking protocol (participant locked until coordinator responds)
- Coordinator failure = stuck participants
- Poor performance under high load

Use only when: small # of participants, latency acceptable, no better option
```

#### Saga Pattern (preferred over 2PC)
```
See Section 14 for full details.
Key: Design each step to be idempotent + have a compensating transaction.

Golden rule: If step N fails, run compensating transactions for steps 1..N-1
             in reverse order.

Idempotency implementation:
  Store operation_id → result in DB before executing
  On retry: check if already processed → return cached result
```

#### Outbox Pattern (Transactional Messaging)
```
Problem: Write to DB AND publish to Kafka atomically
         → Can't do in one transaction across two systems

Solution:
  1. Write record + outbox_event in same DB transaction
  2. Outbox poller reads unpublished events → publishes to Kafka
  3. Mark event as published

Table schema:
  outbox: id, event_type, payload, created_at, published_at

Benefit: Exactly-once write to DB + at-least-once to Kafka
Tools: Debezium (CDC-based), custom poller
```

---

## 31. MULTI-TENANCY & SAAS ARCHITECTURE

### Isolation Models
```
Silo (Per-Tenant DB + Infrastructure):
  Each tenant has dedicated DB (and optionally dedicated app instances)
  + Strongest isolation, easy to delete tenant data
  + Can customize per tenant
  - Highest cost, hard to manage at scale
  Use for: enterprise, regulated industries (HIPAA, finance)

Pool (Shared DB, Tenant-Partitioned):
  All tenants in same DB, every table has tenant_id column
  + Cost-efficient, easy to scale infrastructure
  - Data leakage risk if queries miss tenant_id filter
  - One noisy tenant can affect others (add DB-level quotas)
  Use for: SMB SaaS, cost-sensitive products

Bridge (Shared App, Separate DBs per Tenant):
  Shared app/compute layer, each tenant has own DB schema/database
  + Balance between isolation and cost
  - More complex routing, connection pool per tenant
  Use for: mid-market SaaS
```

### Tenant Routing
```
Subdomain routing:
  tenant1.myapp.com → app reads subdomain → sets tenant context

Path routing:
  myapp.com/tenant1/dashboard

JWT claim:
  { "sub": "user123", "tenant_id": "acme-corp" }
  Middleware extracts tenant_id, sets DB connection/schema

Tenant context middleware (every request):
  1. Extract tenant_id from token/subdomain/header
  2. Validate tenant is active/not suspended
  3. Set tenant_id in thread-local / request context
  4. All DB queries automatically include WHERE tenant_id = ?
```

### Noisy Neighbor Problem
```
One tenant consuming disproportionate resources affects all others.

Solutions:
  □ Rate limiting per tenant (separate Redis key per tenant)
  □ DB connection pool limits per tenant
  □ Separate queue per tenant priority tier (premium vs free)
  □ Dedicated resources for high-value tenants (move to silo)
  □ Monitoring per-tenant resource usage
  □ Circuit breaker per tenant (isolate runaway tenant)
```

### Data Residency & Compliance
```
Regulatory requirements may mandate:
  EU customers → data stored only in EU (GDPR)
  Healthcare → HIPAA-compliant storage (US)
  Finance → regional data sovereignty laws

Solution: Regional shard selection
  Tenant onboarding: pick region → provision in that region's DB cluster
  Routing layer: tenant_id → region map → route to correct cluster
  No cross-region data replication for regulated data
```

---

## 32. ML SYSTEM DESIGN PATTERNS

### ML System Architecture Overview
```
[Data Collection]     → Raw events, user interactions, logs
        ↓
[Feature Store]       → Precomputed features (online + offline)
        ↓
[Training Pipeline]   → Batch/online learning (Spark, TensorFlow)
        ↓
[Model Registry]      → Versioned model artifacts (MLflow, SageMaker)
        ↓
[Serving Layer]       → Real-time inference (low latency)
        ↓
[Monitoring]          → Model drift, data drift, prediction quality
```

### Feature Store
```
Problem: Features computed for training must be identical at serving time
         ("training-serving skew")

Solution: Feature Store (shared repository of features)
  Offline store: historical features (S3 + Parquet, BigQuery)
    → Used for training
  Online store:  latest feature values (Redis, DynamoDB)
    → Used for real-time serving

Tools: Feast, Tecton, AWS SageMaker Feature Store, Vertex AI Feature Store

Key principle:
  Write once → available for both training and serving
  Prevents training-serving skew
```

### Model Serving Patterns
```
Synchronous (Online) Inference:
  Client → Model Server → prediction returned in real-time
  Latency target: < 100ms p99
  Tools: TensorFlow Serving, TorchServe, Triton, BentoML

Asynchronous (Batch) Inference:
  Scheduled job → run model on dataset → store predictions
  Use for: pre-compute recommendations, offline scoring
  Tools: Spark MLlib, SageMaker Batch Transform

Embedding-based Retrieval (Two-Tower):
  Offline: precompute item embeddings → store in vector DB
  Online: compute user embedding → approximate nearest neighbor search
  Tools: FAISS, Pinecone, Weaviate, Qdrant
  Use for: recommendations, semantic search

A/B Testing:
  Traffic split (e.g., 90/10) between model versions
  Measure: click-through rate, conversion rate, engagement
  Gradual rollout: 1% → 10% → 50% → 100%
  Shadow mode: run new model, don't serve results, just log
```

### Handling Model Drift
```
Data drift:  Input distribution changes (users behave differently)
Model drift: Model accuracy degrades over time
Concept drift: Relationship between input and output changes

Detection:
  Monitor prediction distribution (histograms, KL divergence)
  Monitor feature distribution vs training baseline
  Compare model performance metrics over time windows

Response:
  Scheduled retraining (weekly/daily)
  Trigger-based retraining (when drift metric exceeds threshold)
  Online learning (continuously update model with new data)
```

---

## 33. ADDITIONAL DESIGN TEMPLATES

---

### 33.1 KEY-VALUE STORE

**Requirements**: Design a distributed key-value store like DynamoDB or Cassandra.

```
Operations: get(key), put(key, value), delete(key)
Targets: < 10ms p99, 100K QPS, petabyte-scale storage
```

**Core Design**:
```
Partitioning:
  Consistent hashing ring (2^32 positions)
  Each node owns a range of the ring
  Virtual nodes (150 vnodes per physical node) → even distribution

Replication:
  Factor N=3 (store on N consecutive nodes on ring)
  Quorum reads/writes: W + R > N
    Strong consistency: W=2, R=2, N=3
    High availability: W=1, R=1, N=3

Coordinator node:
  Any node can be coordinator for a request
  Routes to replica nodes (client-side or server-side)

Data model:
  In-memory: hash map → O(1) get/put
  Persistent: LSM-tree (Log-Structured Merge-Tree)
    Write path: MemTable (in-memory) → WAL → SSTable (disk)
    Read path: MemTable → SSTable L0 → L1 → L2...
    Compaction: merge SSTables to reclaim space
    Bloom filter: quickly check if key MAY exist in SSTable

Conflict resolution:
  Vector clocks to detect concurrent writes
  Last-Write-Wins (LWW) on timestamp for simple cases
  Read-repair: on read, compare replicas, fix stale ones
  Anti-entropy: background gossip to sync replicas

Failure handling:
  Hinted handoff: coordinator stores write for failed node temporarily
  On node recovery: deliver hinted writes → node catches up
```

---

### 33.2 DISTRIBUTED JOB SCHEDULER

**Requirements**: Schedule one-time and recurring jobs across distributed workers.

```
Scale: 10M jobs/day, jobs ranging from seconds to hours
Features: cron scheduling, job dependencies, retries, monitoring
```

**Architecture**:
```
[Client / API] → [Scheduler Service]
                       |
              [Job Queue (Kafka/DB)]
                       |
              [Worker Pool (auto-scaled)]
                       |
              [Job State DB (PostgreSQL)]

Job states:
  SCHEDULED → QUEUED → RUNNING → SUCCEEDED
                                → FAILED (retry)
                                → DEAD (max retries exceeded)

Scheduler design:
  Persistent cron store: job_id, cron_expression, last_run, next_run
  Scheduler loop: SELECT jobs WHERE next_run <= NOW() LIMIT 100
  Atomically claim job: UPDATE SET status='CLAIMED' WHERE status='SCHEDULED'
  Publish to Kafka partition (by job_type for ordering)
  Update next_run = cron_next(cron_expression, NOW())

Worker design:
  Pull from Kafka (or poll DB queue)
  Heartbeat every 30s (detect stuck jobs)
  Job timeout: if no heartbeat in 2 min → mark FAILED → retry

Exactly-once semantics:
  Idempotency key per job run
  Workers check if job_run_id already completed before executing

Distributed locking:
  Use Redis SETNX or DB advisory lock to prevent duplicate scheduling
  Only one scheduler instance runs the scheduling loop at a time
  (Leader election via Kubernetes Lease or Redis)

Scaling:
  Partition jobs by tenant or job type
  Multiple scheduler instances with leader election
  Worker pool: Kubernetes HPA based on queue depth
```

---

### 33.3 WEB CRAWLER

**Requirements**: Design a web crawler that indexes the web (like Googlebot).

```
Scale: 1 billion pages, crawl cycle: 4 weeks
QPS: 1B / (4*7*24*3600) ≈ 400 pages/sec
Storage: 1B * avg 100 KB = 100 TB raw HTML
```

**Architecture**:
```
[Seed URLs]
     ↓
[URL Frontier] ← politeness queue (per-domain buckets)
     ↓
[Fetcher Workers] → download HTML
     ↓                    ↓
[Content Seen?]    [URL Extractor]
  (Bloom filter)         ↓
     ↓             [URL Normalizer]
  SKIP or STORE          ↓
     ↓             [URL Seen? Filter]
[HTML Store (S3)]        ↓ (new URLs only)
     ↓             [URL Frontier]
[Parser / Indexer]
```

**Key Design Decisions**:
```
URL Frontier:
  Priority queue: high-quality / high-importance pages crawled first
  Politeness: obey robots.txt, max 1 req/domain/sec
  Store in Redis sorted set (score = priority + delay timer)
  Persist to DB for durability across restarts

Duplicate detection:
  URL-level: Bloom filter (URLs seen before)
  Content-level: Hash of page content (SimHash for near-duplicates)
    SimHash: detect pages that are 90% similar (avoid re-indexing)

Distributed crawling:
  URL → assign to worker by hash(domain) → same domain always same worker
  Ensures per-domain politeness without central coordination

Storage:
  Raw HTML: S3 (compressed, 1B * 50KB avg compressed = 50 TB)
  URL metadata: Cassandra (url, status, last_crawled, next_crawl, checksum)
  Parsed content: Elasticsearch / indexer pipeline

Robots.txt:
  Fetch and cache robots.txt per domain (TTL: 24h)
  Respect Crawl-delay directive
  Honor Disallow rules

Recrawl strategy:
  High-change pages (news): every hour
  Medium-change pages (blogs): every week
  Low-change pages (static docs): every month
  Change detection: compare content hash with stored hash
```

---

## APPENDIX: DECISION QUICK-CARDS

### WebSocket vs REST vs gRPC vs SSE at a Glance
| Scenario                          | Protocol       |
|-----------------------------------|----------------|
| Public CRUD API                   | REST           |
| Internal low-latency service      | gRPC           |
| Real-time bidirectional (chat)    | WebSocket      |
| Server push to browser (feed)     | SSE            |
| Mobile with varied data needs     | GraphQL        |
| File upload/download              | REST + S3 URL  |

### Consistency Level Quick Chooser
| Use Case                          | Consistency Level     | Technology        |
|-----------------------------------|-----------------------|-------------------|
| Bank transactions                 | Strong / Linearizable | PostgreSQL, Spanner|
| Inventory (e-commerce)            | Strong                | PostgreSQL + lock |
| Social media likes                | Eventual              | Cassandra, Redis  |
| User's own posts                  | Read-Your-Writes      | Session sticky    |
| Collaborative doc editing         | Causal                | CRDTs             |
| DNS / Config                      | Eventual              | DynamoDB          |
| Distributed lock / leader         | Linearizable          | etcd, ZooKeeper   |

### Common Interview Problem → System Mapping
| Problem Asked                     | Core Pattern                          |
|-----------------------------------|---------------------------------------|
| Design Twitter / Instagram        | News Feed, Fan-out, CDN               |
| Design WhatsApp / Slack           | Chat, WebSocket, Presence             |
| Design YouTube / Netflix          | Video streaming, CDN, Transcoding     |
| Design Uber / Lyft                | Geospatial, real-time location, matching|
| Design TinyURL / Bitly            | ID generation, redirect, analytics   |
| Design Google Search autocomplete | Trie, prefix search, caching          |
| Design Amazon / Shopify           | E-commerce, Saga, inventory locking  |
| Design DynamoDB / Redis           | Key-Value Store, LSM-tree, quorum    |
| Design a rate limiter             | Token bucket, Redis, sliding window   |
| Design Airbnb / Booking           | Search, availability, booking saga   |
| Design Twitter search             | Inverted index, Elasticsearch         |
| Design Dropbox / Google Drive     | File sync, chunking, versioning       |

---

*Last updated: 2026. Always verify technology specifics before interviews — ecosystems evolve quickly.*