# Distributed Systems, Database & Software Architecture
## Senior-Level Interview Q&A — Complete Reference Guide

---

# PART 1: DISTRIBUTED SYSTEMS

---

## Consistency Models

### 1. Strong consistency vs eventual consistency?

**Strong consistency** guarantees that after a write completes, every subsequent read — from any node, anywhere — will return that updated value. The system behaves as if there is a single copy of the data. This comes at the cost of availability and latency, since the system must coordinate across nodes before acknowledging a write.

**Eventual consistency** guarantees that if no new updates are made to a data item, all replicas will *eventually* converge to the same value — but there is no bound on when. In the meantime, different nodes may return different values for the same key. Systems like Cassandra, DynamoDB (default), and DNS use eventual consistency to achieve high availability and low latency.

The core tradeoff is CAP theorem: strong consistency sacrifices availability during network partitions; eventual consistency sacrifices consistency for availability.

---

### 2. When is eventual consistency acceptable?

Eventual consistency is acceptable when:

- **Staleness is tolerable**: Social media likes/follower counts, product view counts, leaderboards. A user seeing "1,203 likes" instead of "1,204" is harmless.
- **The data is user-specific and non-financial**: User preferences, theme settings, read receipts.
- **Operations are naturally idempotent or commutative**: Shopping cart additions (with CRDT-style merging), tag additions.
- **The business can absorb brief inconsistencies**: A product catalog showing an old price for 200ms is acceptable; a payment ledger is not.
- **High availability is more critical than accuracy**: DNS propagation, CDN cache invalidation, notification delivery.

A useful mental model: ask "what is the business cost if two users see different values for 500ms?" If the answer is "minor annoyance," eventual consistency is fine. If the answer is "double charge, oversell, or data corruption," it is not.

---

### 3. What production issues can eventual consistency cause?

- **Lost updates**: Two clients read stale state, both make decisions based on it, and one's update is overwritten.
- **Phantom reads**: A user sees a product as in-stock, adds it to cart, but inventory was already exhausted at another replica.
- **Double-spending / overselling**: Critical in e-commerce and payments. A seat or item appears available on two replicas simultaneously.
- **Confusing UX**: A user posts a comment, refreshes, and doesn't see it (because they're now routed to a replica that hasn't caught up).
- **Cascading stale reads**: A downstream service reads from a stale replica and makes decisions (e.g., pricing, permissions) based on outdated data, propagating the staleness further.
- **Difficult debugging**: Bugs that only manifest under high replication lag are non-deterministic and hard to reproduce.

---

### 4. How would you explain read-after-write consistency?

Read-after-write (RAW) consistency is a specific guarantee: after a user performs a write, any subsequent reads *by that same user* will reflect that write. It does not guarantee that other users immediately see the write.

**Example**: A user updates their profile photo. With RAW consistency, if they immediately navigate to their profile page, they see the new photo — even if other users still see the old one.

**How it's implemented**:
- After a write, route the user's reads to the primary/leader node for a short window (e.g., 1 minute).
- Use sticky sessions or session tokens that encode "last write timestamp"; read replicas refuse to serve the request if their replication lag puts them behind that timestamp.
- DynamoDB offers this as an optional "strongly consistent read" per-request.

RAW consistency is often the minimum acceptable bar for user-facing applications — users find it disorienting to not see their own changes.

---

### 5. How do DynamoDB Global Tables resolve conflicts?

DynamoDB Global Tables use **last-writer-wins (LWW)** conflict resolution based on wall-clock timestamps. Each write is tagged with a timestamp, and when replicas reconcile, the write with the latest timestamp wins.

**Implications**:
- Clock skew between regions can cause unexpected overwrites. A write at 12:00:00.001 in us-east-1 may be beaten by a write at 12:00:00.002 in eu-west-1, even if the us-east-1 write was "later" in causal terms.
- There is no automatic merge of conflicting writes — one simply overwrites the other.
- Applications that need causal consistency must implement their own versioning (e.g., conditional writes using `ConditionExpression` with version counters).

For most workloads with region-affinity (users in a region mostly write their own data), conflicts are rare and LWW is acceptable. For shared mutable state accessed globally, application-level conflict resolution is needed.

---

### 6. How would you design a system needing strong consistency only for specific operations?

The key insight is that you don't need strong consistency everywhere — only at specific critical points.

**Strategy: Selective strong consistency**

- Identify operations where correctness is non-negotiable (inventory reservation, payment deduction, seat booking).
- Route *those* operations to the primary/leader database with synchronous writes.
- Route read-heavy, latency-sensitive operations (browsing, search, non-critical reads) to replicas with eventual consistency.

**Implementation patterns**:
- **Per-request consistency flags**: DynamoDB allows `ConsistentRead=true` on individual read operations.
- **Optimistic locking with conditional writes**: Use version numbers; reject writes if the version has changed since the read.
- **Fencing tokens**: Issue a monotonically increasing token when a resource is locked; any write with an older token is rejected.
- **Two-tier storage**: Store critical state (balances, inventory) in a strongly consistent store (PostgreSQL, Spanner), and derive read models in an eventually consistent store (Elasticsearch, Redis).

---

### 7. What is monotonic read consistency?

Monotonic read consistency guarantees that if a process has read a value at time T, it will never read an older value in a subsequent read. You can only move forward in time — you won't see a "rollback" of data.

**Example of a violation**: A user reads their inbox and sees 5 messages. They refresh and only see 4, because they're now routed to a replica that is further behind.

**Implementation**: Achieved by either:
- Pinning a user's reads to a single replica for the duration of a session.
- Tracking the user's last-read "replication position" (e.g., a log sequence number) and only serving reads from replicas that have reached at least that position.

Monotonic reads are important for user-perceived correctness — users expect time to move forward, not backward.

---

### 8. Explain quorum-based consistency.

In a distributed system with N replicas, a **quorum** is the minimum number of nodes that must agree for an operation to succeed.

The standard formulas:
- **Write quorum (W)**: minimum nodes that must acknowledge a write.
- **Read quorum (R)**: minimum nodes that must respond to a read.
- **Strong consistency condition**: `R + W > N`

**Example** with N=3:
- W=2, R=2: Reads and writes overlap by at least 1 node, ensuring reads see the latest write.
- W=1, R=3: Reads must check all 3 nodes, writes are fast.
- W=3, R=1: Writes are slow (all must confirm), reads are fast.

**Tunable consistency**: Cassandra and DynamoDB allow tuning W and R per-operation:
- `QUORUM`/`QUORUM` = strong consistency.
- `ONE`/`ONE` = fast but eventually consistent.
- `ALL`/`ONE` = durable writes, fast reads (but writes fail if any node is down).

Quorum-based systems gracefully handle node failures — with N=5, you can tolerate 2 node failures with W=R=3.

---

### 9. How would you handle stale cache reads?

Several strategies, often used in combination:

1. **TTL (Time-to-Live)**: Every cache entry expires after a fixed duration. Simple but coarse — you accept up to TTL seconds of staleness.

2. **Cache invalidation on write**: When the source data changes, explicitly delete or update the cache entry. Requires coupling between write path and cache layer; can have race conditions.

3. **Read-through with version check**: Cache stores a version hash alongside the data. Before serving, compare the hash against a cheap "latest version" check in the DB (e.g., a `last_modified` timestamp stored separately).

4. **Write-through cache**: All writes go through the cache, keeping it always current. Adds write latency; cache is the source of truth.

5. **Event-driven invalidation**: The write path publishes a cache-invalidation event to a message bus; cache consumers listen and invalidate. Decoupled but eventually consistent.

6. **Probabilistic early expiration (PER)**: Cache entries are refreshed slightly before their TTL expires with some probability, preventing thundering herds where many items expire simultaneously.

For critical reads (inventory, pricing), bypass the cache or use a very short TTL. For content (product descriptions, user profiles), longer TTLs with explicit invalidation are acceptable.

---

### 10. How would you test consistency issues in distributed systems?

Testing consistency bugs requires simulating real distributed failures:

1. **Jepsen-style testing**: Inject network partitions, clock skew, node crashes, and packet loss while running concurrent reads and writes. Verify invariants (e.g., "no two users should book the same seat") after recovery.

2. **Chaos engineering**: Tools like Chaos Monkey, Gremlin, or Litmus deliberately kill services, add latency, or corrupt messages in production-like environments.

3. **Linearizability checkers**: Tools like Knossos or Elle analyze operation histories and verify they satisfy linearizability or other consistency models.

4. **Integration tests with artificial lag**: In test environments, introduce artificial replication delays and verify that the application handles stale reads gracefully (e.g., doesn't double-book).

5. **Property-based testing**: Generate random sequences of operations and assert invariants hold after each sequence.

6. **Concurrent load tests**: Run multiple concurrent booking/payment flows with the same resource and assert no duplicates in the result.

---

## Replication & Replication Lag

### 11. What causes replication lag?

Replication lag is the delay between a write being committed on the primary and being applied on replicas. Causes include:

- **High write throughput**: If the primary is writing faster than replicas can apply changes, lag accumulates.
- **Single-threaded replication**: Traditional MySQL replication applies binlog events serially; parallel replication reduces but doesn't eliminate this.
- **Network latency / bandwidth**: Cross-region replication inherently has higher latency.
- **Long-running queries on replicas**: Analytical queries or maintenance tasks on replicas block the replication thread.
- **Large transactions**: A single large transaction (e.g., bulk INSERT of millions of rows) blocks replication until it fully applies.
- **Disk I/O bottlenecks**: If the replica's disk is slower, applying WAL/binlog takes longer.
- **Replica resource constraints**: Running replicas on smaller instances than the primary.

---

### 12. How would you monitor replication lag?

- **Database-native metrics**: PostgreSQL exposes `pg_stat_replication` with `write_lag`, `flush_lag`, `replay_lag`. MySQL exposes `Seconds_Behind_Master` in `SHOW SLAVE STATUS`.
- **Custom lag metrics**: Periodically write a heartbeat row with the current timestamp to the primary; measure how long it takes to appear on replicas.
- **CloudWatch/Datadog metrics**: AWS RDS exposes `ReplicaLag` as a CloudWatch metric. Set alarms for lag > threshold (e.g., 30 seconds).
- **Application-level monitoring**: Track read/write divergence by comparing reads from replicas against expected values from recent writes.
- **Alerting tiers**: Warn at 10s lag, alert at 60s, page at 300s (tune per SLA).

---

### 13. How can lag impact user experience?

- **Read-after-write failures**: User submits a form, is redirected to a confirmation page that reads from a lagged replica — they see stale or missing data.
- **Inconsistent search results**: A user creates a listing; it doesn't appear in search (backed by a replica) for minutes.
- **Stale inventory displays**: Product shows as available even though it was just purchased.
- **Broken authorization**: A permissions change (e.g., user role update) takes time to propagate; the user still has old permissions.
- **Phantom emails/notifications**: A downstream service reads from a lagged replica and sends duplicate or incorrect notifications.

The impact scales with how often users immediately query their own writes — interactive UIs suffer more than batch pipelines.

---

### 14. How do read replicas improve scalability?

Read replicas offload read traffic from the primary, allowing it to dedicate resources to writes and strongly consistent reads. Benefits:

- **Horizontal read scaling**: Add replicas to handle more read throughput without scaling the primary.
- **Workload isolation**: Route analytics/reporting queries to dedicated replicas so they don't impact OLTP performance on the primary.
- **Geographic distribution**: Place replicas in regions close to read-heavy users to reduce read latency.
- **Primary protection**: Even if a misbehaving query causes a replica to crash, the primary is unaffected.

Limits: Replicas don't help with write throughput (all writes still go to the primary). For write-heavy systems, sharding or a different data model is needed.

---

### 15. Why can replicas return stale data?

Because replication is asynchronous by default. The primary acknowledges the write to the client immediately after committing locally, without waiting for replicas to apply it. The replica applies the change later (after network transit + disk write), during which time reads from that replica return the old value.

The staleness window equals the current replication lag. Under normal conditions this is milliseconds; under load or network issues it can be seconds to minutes.

---

### 16. How would you decide which APIs can safely hit replicas?

A useful decision framework:

**Safe for replicas (read your own writes not required)**:
- Browsing/search endpoints (product catalog, listings, articles).
- Aggregated stats (leaderboards, counters) where small inaccuracies are acceptable.
- Non-personalized content (homepage recommendations, featured items).
- Historical data (order history older than a few minutes).

**Requires primary (or RAW-consistent replica)**:
- Reading state immediately after a write (confirmation pages, post-creation views).
- Any operation that informs a subsequent write (read-modify-write patterns like inventory check before booking).
- Authorization/permission checks (user role, account status).
- Financial operations (balance reads before deductions).

Implementation tip: Use a routing layer that checks if the request is in a "post-write window" (tracked via session or token) and routes to primary or a designated RAW-consistent replica if so.

---

### 17. How do asynchronous and synchronous replication differ?

**Asynchronous replication**: Primary commits and acknowledges the write to the client without waiting for replicas. Replicas catch up in the background. Low write latency, but replicas may lag; failover can lose recent writes.

**Synchronous replication**: Primary waits for at least one replica to acknowledge the write before responding to the client. Guarantees zero data loss on failover (RPO = 0), but adds write latency equal to the round-trip to the replica.

**Semi-synchronous** (MySQL's approach): Wait for at least one replica to receive the write (not necessarily apply it). A middle ground — low risk of data loss, moderate latency increase.

---

### 18. What are the tradeoffs of synchronous replication?

**Pros**:
- Zero data loss (RPO = 0) on primary failure.
- Replicas are always up-to-date; immediate failover is safe.

**Cons**:
- Increased write latency proportional to replica round-trip time (especially painful cross-region).
- Write availability depends on replica availability — if the replica goes down, writes block until timeout.
- Limits write throughput because the primary can't pipeline as aggressively.

In practice, most systems use asynchronous replication with a small RPO tolerance and compensate with write-ahead logs (WAL archiving) to minimize data loss on failover.

---

### 19. How would you fail over during primary DB outage?

1. **Detect failure**: Health check or heartbeat times out. Automated (RDS, Patroni) or manual detection.
2. **Elect a new primary**: Choose the replica with the least replication lag (most up-to-date).
3. **Fence the old primary**: Issue a STONITH (Shoot The Other Node In The Head) command or revoke its network access to prevent split-brain — the old primary must not accept writes.
4. **Promote the new primary**: The selected replica becomes primary.
5. **Update connection strings**: DNS failover (Route 53 with low TTL), or proxy layer (PgBouncer, ProxySQL) redirects traffic to the new primary.
6. **Re-attach remaining replicas**: Other replicas now replicate from the new primary.
7. **Handle lag gap**: Any data written to the old primary but not replicated is lost (in async setups). Decisions needed on how to reconcile or discard.

Target RTO (Recovery Time Objective) for modern managed databases: 30–60 seconds for automated failover.

---

### 20. What problems occur during failback?

**Failback** is the process of restoring the original primary once it recovers.

Problems:
- **Data divergence**: The original primary may have processed writes (during the failure window) that were never replicated. These are in conflict with writes now on the new primary.
- **Re-synchronization cost**: Catching up the old primary to the current state can take significant time during which it can't serve traffic.
- **Split-brain risk**: If fencing was incomplete, the old primary may still believe it's the leader and accept writes.
- **Application reconnection**: Clients that cached the old connection string need to be updated again.
- **Unnecessary disruption**: Two failovers (to the replica, then back) cause two disruption windows. Many teams prefer to keep the promoted replica as the permanent primary and retire the old one.

---

## Distributed Transactions

### 21. Why are distributed transactions hard?

In a single-node transaction, atomicity is achieved via a local lock manager and write-ahead log — the database either commits or rolls back entirely. Across multiple nodes or services:

- **Partial failures**: Node A commits but Node B crashes before committing. The system is now in an inconsistent state.
- **No global clock**: There's no single "time" at which all nodes see the same state. Ordering events across nodes requires logical clocks or coordination.
- **Network partitions**: A coordinator can't distinguish between a node that crashed vs. a network partition. Waiting forever is not acceptable.
- **Coordination overhead**: Ensuring all participants agree requires multiple round trips, adding latency.
- **Lock contention**: Holding locks across service boundaries while waiting for remote confirmations blocks resources.

These problems are not just implementation challenges — they're fundamental: the FLP impossibility theorem proves that no deterministic distributed algorithm can guarantee consensus in the presence of even a single node failure.

---

### 22. Explain 2PC (Two-Phase Commit).

2PC is a distributed coordination protocol ensuring all-or-nothing commits across multiple participants.

**Phase 1 — Prepare (Voting)**:
- The **coordinator** sends a `PREPARE` message to all participants.
- Each participant checks if it can commit (validates constraints, acquires locks), writes the intent to its WAL, and responds `YES` or `NO`.

**Phase 2 — Commit or Abort**:
- If all participants voted `YES`: coordinator sends `COMMIT` to all; participants commit and release locks.
- If any participant voted `NO`: coordinator sends `ABORT` to all; participants roll back.

**Failure handling**:
- If a participant crashes after voting `YES` but before receiving `COMMIT`, it checks its WAL on recovery and waits for the coordinator's decision.
- If the **coordinator crashes** after Phase 1, participants are in a "blocking" state — they hold locks and cannot proceed until the coordinator recovers. This is the fundamental weakness of 2PC: it's a **blocking protocol**.

---

### 23. Why is 2PC often avoided in microservices?

- **Tight coupling**: All participating services must implement the 2PC protocol interface and coordinate with the same coordinator. This violates service autonomy.
- **Blocking on coordinator failure**: If the coordinator dies mid-protocol, all participants are stuck holding locks, degrading availability.
- **Performance**: Multiple synchronous round trips across network boundaries add significant latency.
- **Heterogeneous databases**: Microservices often use different databases (PostgreSQL, MongoDB, DynamoDB) that don't share a common transaction protocol.
- **Long-held locks**: During 2PC, resources are locked for the entire protocol duration. In high-traffic systems, this causes contention and timeouts.

Instead, microservices favor Saga patterns (compensating transactions) or outbox patterns that achieve eventual consistency without distributed locks.

---

### 24. Saga pattern vs distributed transactions?

**Distributed transaction (2PC)**:
- All-or-nothing atomicity via locking.
- ACID properties maintained across services.
- High coupling, blocking failures, performance overhead.

**Saga pattern**:
- A saga is a sequence of **local transactions**, each publishing events or calling next steps.
- Each step has a corresponding **compensating transaction** that undoes its effect if a later step fails.
- No global locks — each service commits locally.
- Eventual consistency: briefly, the system may be in an intermediate state (order placed but payment not yet confirmed).

**Tradeoff**: Sagas are harder to reason about (no global atomicity), require careful compensating transaction design, and the intermediate states must be handled gracefully (e.g., don't show "order confirmed" until the saga completes).

---

### 25. Choreography vs orchestration saga?

**Choreography**:
- Each service listens for events and reacts. No central coordinator.
- Service A completes → publishes event → Service B listens → completes → publishes event → etc.
- **Pros**: Loose coupling, no single point of failure in the coordinator.
- **Cons**: Difficult to track overall saga state; debugging requires tracing events across multiple services; cyclic dependencies can emerge.

**Orchestration**:
- A central **orchestrator** (a saga controller) directs each step explicitly: "Do this, then do that."
- The orchestrator knows the entire workflow and handles compensation centrally.
- **Pros**: Clear visibility into saga state; easier debugging and rollback logic.
- **Cons**: Orchestrator becomes a central point of coupling and potential failure.

**In practice**: Orchestration is often preferred for complex sagas (5+ steps) because it's easier to reason about. Choreography works well for simple 2–3 step flows.

---

### 26. How would you rollback a partially completed booking?

Using the Saga pattern with compensating transactions:

1. **Step 1**: Reserve inventory → compensating transaction: release reservation.
2. **Step 2**: Charge payment → compensating transaction: issue refund.
3. **Step 3**: Send confirmation email → compensating transaction: send cancellation email.

If Step 3 fails, execute Step 2's compensation (refund), then Step 1's (release reservation) in reverse order.

**Implementation considerations**:
- Compensating transactions must be **idempotent** — if the compensation itself fails and is retried, it shouldn't double-refund.
- Some steps are **non-compensatable** (e.g., once an email is sent, it can't be unsent). Design to put non-compensatable steps last, or accept that they're "best effort."
- Track saga state in a durable store so that if the orchestrator crashes, it can resume on restart.

---

### 27. How do you ensure idempotency in distributed workflows?

- **Idempotency keys**: Assign a unique ID to each workflow step. Before executing, check if the ID has already been processed. If yes, return the cached result without re-executing.
- **Conditional writes**: Use database conditions like `WHERE status = 'PENDING'` so that a step only executes if the resource is in the expected state.
- **Upsert semantics**: For state transitions, use UPSERT or conditional updates that are safe to retry.
- **Event deduplication**: Message consumers track processed event IDs (in Redis or a DB) and skip duplicates.
- **Saga state machine**: Model each saga step as a state transition; steps that have already happened transition the state forward — replaying the same step when already in a later state is a no-op.

---

### 28. What happens if one service succeeds and another fails?

This is the "partial failure" problem — the system is left in an inconsistent intermediate state.

Approaches:
1. **Saga compensation**: Detect the failure, trigger compensating transactions to undo completed steps.
2. **Retry with idempotency**: If the failure was transient, retry the failed step (idempotency ensures safe retries).
3. **Dead letter queue (DLQ)**: Failed operations land in a DLQ for human review or automated retry with a different strategy.
4. **Timeout and reconciliation**: Background jobs periodically scan for sagas stuck in intermediate states and either advance or compensate them.

The key is that the system must never silently swallow the failure — every partial failure must be handled explicitly (compensated or retried).

---

### 29. How do retries create duplicate operations?

When an operation times out, the caller doesn't know if it failed before execution or during. Retrying executes the operation again, potentially twice:

**Example**: A payment service calls a bank API. The API processes the charge but the response is lost in transit. The caller retries, and the bank charges the card twice.

Solutions:
- **Idempotency keys**: Include a client-generated unique key in every request. The server stores `(idempotency_key → result)` and returns the cached result on duplicates without re-executing.
- **Exactly-once semantics**: Hard to achieve universally; usually approximated with at-least-once + idempotency.
- **Transactional outbox**: Write the intent to a local table atomically with the business operation; a separate relay process sends it to the downstream service exactly once.

---

### 30. How would you design payment + booking consistency?

A robust pattern using Saga + Outbox:

1. **Create booking record** with status `PENDING` (local transaction).
2. **Publish payment request** via the **Outbox pattern**: write a `payment_request` event to an outbox table in the same DB transaction as the booking creation. A relay process reads and publishes it to the payment service.
3. **Payment service processes** and publishes a `payment_completed` or `payment_failed` event.
4. **Booking service listens**: On `payment_completed`, transition booking to `CONFIRMED`. On `payment_failed`, transition to `CANCELLED` and release inventory.
5. **Idempotency throughout**: The payment service uses an idempotency key (the booking ID) to prevent double charges on retry.

This ensures: no booking is confirmed without a successful payment, and no payment is taken without a corresponding booking.

---

## Event-Driven Architecture

### 31. Event-driven vs request-response architecture?

**Request-response** (synchronous): Service A calls Service B and waits for a response. Simple, easy to debug, immediate feedback. Tightly coupled in time — if B is slow or down, A is affected.

**Event-driven** (asynchronous): Service A publishes an event to a broker; Service B (and C, D...) consume it independently. Services are decoupled in time and space. A doesn't need to know about B.

**When to use event-driven**:
- Fan-out to multiple consumers (order placed → notify warehouse, email service, analytics).
- Operations where immediate response isn't required (sending emails, generating reports).
- Buffering against traffic spikes.

**When request-response is better**:
- Real-time UX that requires an immediate answer.
- Simple request/reply where adding a broker is unnecessary complexity.
- When you need the response to complete the current user flow.

---

### 32. Benefits of async systems?

- **Temporal decoupling**: Producer and consumer don't need to be simultaneously available.
- **Traffic absorption**: Queues buffer spikes, protecting downstream services from being overwhelmed.
- **Independent scaling**: Producers and consumers scale independently based on their throughput.
- **Resilience**: If a consumer fails, events accumulate in the queue and are processed once the consumer recovers — no data is lost.
- **Fan-out**: A single event can be consumed by multiple independent services without the producer knowing about them.
- **Retry and DLQ**: Failed processing can be retried automatically; unprocessable messages are quarantined for inspection.

---

### 33. What is eventual consistency in event-driven systems?

In an event-driven system, after a write, downstream services update their state by consuming events — not instantly. During the propagation window, different services (or different views) reflect different states of the world.

**Example**: An order is placed. The inventory service, analytics service, and notification service all consume the `order_placed` event. The inventory decrements a moment after the order is confirmed, the analytics dashboard updates a moment after that. For a brief window, these views are inconsistent with each other and with the source of truth.

This is acceptable when services have clearly defined ownership of their own state and don't need to query each other synchronously.

---

### 34. Explain event ordering problems.

Events from the same producer may arrive out of order due to:
- Network path differences.
- Parallel consumer processing.
- Retries of earlier events arriving after later events.
- Partitioning across multiple queue shards.

**Example**: `account_created` and `account_deleted` for the same user arrive out of order. Processing `deleted` first then `created` leaves a ghost account.

**Solutions**:
- **Partition by entity key**: In Kafka, partition by `user_id` so all events for a user go to the same partition and are processed in order.
- **Sequence numbers / version checks**: Attach a version to each event; reject events with an older version than the current state.
- **Event sourcing with sequence enforcement**: Consumers build state from an ordered event stream, replaying in order.
- **Idempotent, commutative operations**: Design operations so order doesn't matter (e.g., SET operations instead of INCREMENT).

---

### 35. What are dead letter queues?

A **dead letter queue (DLQ)** is a special queue where messages are automatically sent after failing to be processed successfully after N retries.

**Purpose**:
- Prevent poison messages (malformed, unexpected format) from blocking the main queue indefinitely.
- Provide a quarantine for manual inspection and reprocessing.
- Give operational visibility into processing failures.

**Implementation**: In SQS, set `maxReceiveCount` on the main queue; after that many failed delivery attempts, the message moves to the DLQ. In Kafka, implement a "dead letter topic" in the consumer's exception handler.

**Operations**: DLQs should be monitored and alerted on. Messages should not silently accumulate — they represent business failures (failed orders, lost events).

---

### 36. How would you retry failed events?

**Immediate retry**: Retry immediately on transient failures (network timeouts). Limit to 1–2 attempts.

**Exponential backoff with jitter**: Wait 2^n seconds between retries, with random jitter to prevent retry storms. E.g., 1s, 2s, 4s, 8s... up to a max.

**Retry queues**: After initial failures, move the message to a "retry queue" with a delay. Process after the delay. Multiple tiers: retry-1m, retry-5m, retry-30m.

**DLQ for final failure**: After exhausting all retry attempts, move to DLQ for manual intervention.

**Idempotency is essential**: Retries only work safely if the operation is idempotent. Otherwise retries create duplicates.

---

### 37. What is an idempotent consumer?

An idempotent consumer processes any given event exactly once, even if it receives it multiple times (due to broker redelivery or consumer crashes).

**Implementation**:
- Maintain a **processed event ID store** (Redis SET or DB table). Before processing, check if the event ID has been seen. If yes, skip. If no, process and mark as seen.
- Use atomic check-and-set to prevent race conditions in concurrent consumer instances.
- The store TTL should exceed the maximum message retention period of the broker.

**Alternative**: Design the operation itself to be idempotent. E.g., `UPDATE inventory SET quantity = 10 WHERE sku = 'X'` is idempotent; `UPDATE inventory SET quantity = quantity - 1 WHERE sku = 'X'` is not.

---

### 38. Kafka vs RabbitMQ vs SNS/SQS?

| Feature | Kafka | RabbitMQ | SNS/SQS |
|---|---|---|---|
| Model | Distributed log / pub-sub | Message broker (push/pull) | Managed pub-sub (SNS) + queue (SQS) |
| Message retention | Configurable (days/forever) | Until consumed | SQS: 14 days; SNS: no retention |
| Ordering | Per partition | Per queue | SQS FIFO: per message group |
| Throughput | Very high (millions/sec) | High (hundreds of thousands/sec) | High (auto-scaled) |
| Consumer model | Pull (consumer groups) | Push or Pull | Push (SNS→Lambda) or Pull (SQS) |
| Replay | Yes (seek to offset) | No (once consumed, gone) | No |
| Operational complexity | High (Zookeeper/KRaft, cluster tuning) | Medium | Low (fully managed) |
| Best for | Event streaming, audit logs, analytics | Task queues, RPC patterns | Cloud-native AWS workloads |

**Rule of thumb**: Use Kafka when you need replay, event sourcing, or very high throughput. Use SQS/SNS in AWS for simple task queues and fan-out. Use RabbitMQ for complex routing rules or when running on-premises.

---

### 39. At-most-once vs at-least-once vs exactly-once delivery?

**At-most-once**: Messages may be lost, never duplicated. Fire-and-forget. Appropriate for metrics, logging where occasional loss is acceptable.

**At-least-once**: Messages will be delivered, but may be duplicated. Default for most brokers (Kafka, SQS). Safe when consumers are idempotent.

**Exactly-once**: Each message is delivered and processed exactly once. Very hard to achieve end-to-end. Kafka supports exactly-once semantics (EOS) within the Kafka ecosystem using transactional producers and idempotent consumers. End-to-end exactly-once (including the consumer's side effects) requires application-level idempotency.

In practice: Build for at-least-once delivery with idempotent consumers. This achieves the effect of exactly-once at lower complexity cost.

---

### 40. How would you prevent duplicate event processing?

1. **Idempotency key in DB**: Store `(event_id)` in a processed-events table. Wrap event processing and the insert in a single transaction.
2. **Redis SETNX**: Atomically set `event_id` in Redis; only process if the set succeeded.
3. **Database unique constraints**: If the event creates a record, use a unique constraint on a natural key (e.g., `(order_id, status)`). Duplicate events trigger a constraint violation, which is caught and ignored.
4. **Conditional state machine transitions**: Only process an event if the entity is in the expected state. E.g., only process `payment_completed` if the order is `PENDING`. A duplicate `payment_completed` finds the order already `CONFIRMED` and is ignored.

---

## Idempotency

### 41. What is idempotency?

An operation is **idempotent** if executing it multiple times produces the same result as executing it once. Formally: `f(f(x)) = f(x)`.

HTTP analogy:
- `GET /users/1` — idempotent: reading doesn't change state.
- `PUT /users/1 {name: "Alice"}` — idempotent: setting the name to "Alice" twice is the same as once.
- `POST /orders` — **not** idempotent by default: each call creates a new order.
- `DELETE /users/1` — idempotent: deleting an already-deleted resource returns 404 but doesn't change state further.

---

### 42. Why is idempotency critical in payment systems?

Payment systems are particularly susceptible to duplicate operations due to:
- **Network timeouts**: The client doesn't know if the charge succeeded.
- **Client retries**: Retry logic re-submits the request.
- **Infrastructure retries**: Load balancers and service meshes may retry internally.

Without idempotency, a user could be charged multiple times for a single purchase. A double charge is a severe business and trust failure — it causes chargebacks, customer complaints, and regulatory risk.

With idempotency keys, the payment service can safely tell a retrying client: "I already processed this request, here is the result" — without charging again.

---

### 43. How would you design idempotent APIs?

1. **Require an idempotency key header**: `Idempotency-Key: <client-generated UUID>`. The client generates this once per logical operation and uses it for all retries.

2. **Store the request and response**: On first receipt, process the request and store `{idempotency_key → response}` durably (in Redis or DB) with a TTL.

3. **Return cached response on duplicates**: If the key is seen again, return the stored response without re-executing.

4. **Handle concurrent requests with the same key**: Use a distributed lock or database unique constraint on the idempotency key to prevent races where two requests with the same key are processed simultaneously.

5. **Include request fingerprint**: Optionally validate that the request body matches the original for the same key — prevents misuse (same key, different payload).

---

### 44. Idempotency key implementation strategy?

```
1. Client generates UUID v4 idempotency key before sending request.
2. Server receives request with Idempotency-Key header.
3. Server attempts to INSERT into idempotency_keys table:
   (key, status='PROCESSING', created_at, expires_at)
   Using a UNIQUE constraint on key.
4. If INSERT succeeds: process the request, UPDATE with status='DONE', response=<result>.
5. If INSERT fails (duplicate key): wait for status != 'PROCESSING', return stored response.
6. If server crashes mid-processing: key remains PROCESSING. 
   On retry: check if expired; if yes, re-process; if no, wait.
```

Critical: Steps 3–4 must be in a transaction to prevent race conditions.

---

### 45. What storage would you use for idempotency keys?

**Redis (most common)**:
- Fast O(1) SET/GET operations.
- TTL built-in — keys auto-expire.
- Use `SET key value NX EX 86400` (set only if not exists, expire in 24h).
- Risk: Redis is in-memory; if not persisted (RDB/AOF), keys can be lost on restart. Use `--appendonly yes` for durability.

**Database (PostgreSQL/MySQL)**:
- Durable by default.
- Can be part of the same transaction as the business operation (atomic idempotency).
- Slower than Redis but higher reliability.
- Periodically clean up expired keys with a background job.

**DynamoDB**:
- Good middle ground: durable, fast, TTL support.
- Conditional writes (`ConditionExpression: "attribute_not_exists(idempotency_key)"`) provide atomic check-and-set.

For payment systems: use a database for maximum durability. For lower-stakes operations: Redis with AOF persistence is sufficient.

---

### 46. What happens if retries hit different servers?

If idempotency state is stored locally on a single server (e.g., in-memory), retries hitting a different server won't find the cached response and will re-execute the operation — defeating idempotency.

Solution: **Idempotency state must be stored in a shared, distributed store** (Redis cluster, database) accessible by all server instances. This is why local caching alone is insufficient for idempotency.

---

### 47. How would you prevent duplicate bookings?

Multiple layers of defense:

1. **Optimistic locking**: Read the resource's version, attempt to write with `WHERE version = <read_version>`. If another booking was made concurrently, the version changes and the write fails — the user is told the resource is no longer available.

2. **Database unique constraint**: `UNIQUE(resource_id, date, status='CONFIRMED')` ensures at the DB level that no two confirmed bookings exist for the same slot.

3. **Pessimistic locking**: `SELECT ... FOR UPDATE` on the resource row before checking availability. Guarantees no concurrent booking can proceed while the lock is held.

4. **Idempotency key on the booking request**: Prevents the same booking request from being submitted twice (network retry case).

5. **Inventory reservation with atomic decrement**: Use Redis `DECR` or a DB atomic `UPDATE ... WHERE quantity > 0` to decrement inventory; only proceed if the decrement succeeded.

---

### 48. What are race conditions in retries?

A race condition in retries occurs when multiple in-flight retries of the same operation execute concurrently, each believing they are the only one, leading to multiple executions.

**Example**: A payment timeout causes the client to retry. But the original request was slow, not failed — both the original and the retry arrive at the server almost simultaneously. Without idempotency and distributed locking, both are processed.

The window for this race is the overlap between the original request's latency and the retry trigger time. If the original takes 5s and the retry fires at 3s, there's a 2s window of concurrent execution.

Mitigation: The idempotency key + distributed lock pattern: the first request to arrive acquires the lock, others wait and return the cached result.

---

### 49. How do you safely retry failed distributed operations?

1. **Classify failures**: Is the error transient (network timeout, 503) or permanent (400 Bad Request, business logic error)? Only retry transient failures.

2. **Exponential backoff**: Increase delay between retries: 1s, 2s, 4s, 8s... up to a cap (e.g., 60s).

3. **Jitter**: Add random variation to backoff delays to prevent synchronized retry storms from multiple clients.

4. **Idempotency keys**: Include the same idempotency key on all retries so the server can deduplicate.

5. **Max retry limit**: Set a hard cap (e.g., 5 attempts) and move to a DLQ or surface the error after exhausting retries.

6. **Circuit breaker**: If error rate exceeds a threshold, stop retrying for a period to give the downstream service time to recover.

---

### 50. How long should idempotency keys live?

The key TTL should exceed the maximum realistic retry window — the time from the first request to the last possible retry.

**Typical guideline**: 24 hours for most payment/booking systems.

Reasoning:
- Automated retries typically exhaust within minutes.
- Manual retries (user clicking "retry" on a failed page) may happen within hours.
- After 24 hours, it's safe to assume the user has either moved on or the issue has been resolved through other means.

For very critical financial operations, keep keys for 7–30 days to handle delayed client-side retries from mobile apps with intermittent connectivity.

Cleanup: Use TTL in Redis, or a scheduled job for database-backed stores, to prevent unbounded storage growth.

---

## CAP Theorem

### 51. Explain CAP theorem.

CAP theorem states that a distributed system can provide at most **two of three** guarantees simultaneously:

- **Consistency (C)**: Every read receives the most recent write or an error. All nodes see the same data at the same time.
- **Availability (A)**: Every request receives a (non-error) response — though it may not be the most recent.
- **Partition Tolerance (P)**: The system continues to operate despite arbitrary network partitions (some nodes can't communicate).

In a distributed system, network partitions are not optional — they happen (hardware fails, cables get cut, DCs lose connectivity). Therefore **P is always required**, and the real choice is between **C and A** during a partition.

---

### 52. Why can't distributed systems guarantee all three?

During a network partition, two nodes can't communicate. If a write happens on one side:
- To maintain **Consistency**: the other side must refuse reads (return an error) until the partition heals — sacrificing Availability.
- To maintain **Availability**: the other side must respond with potentially stale data — sacrificing Consistency.

There is no third option. You cannot simultaneously guarantee "every read sees the latest write" AND "every request gets a response" when the nodes can't talk to each other.

---

### 53. CP vs AP systems examples?

**CP (Consistency + Partition Tolerance)**:
- **HBase, Zookeeper, etcd**: Refuse writes/reads if quorum can't be reached. Used for coordination, locks, leader election where correctness is critical.
- **Google Spanner**: Achieves external consistency (strong) with TrueTime API.
- **Traditional RDBMS in a cluster**: Will return errors rather than stale data.

**AP (Availability + Partition Tolerance)**:
- **Cassandra, CouchDB, DynamoDB (default)**: Continue accepting reads and writes during partitions; reconcile later.
- **DNS**: Returns cached (potentially stale) responses; always available.
- **Amazon S3**: Eventually consistent (historically); favors availability.

---

### 54. Why is DynamoDB closer to AP?

DynamoDB uses **asynchronous replication** across its storage nodes. By default, it returns the response from any available node without waiting for all nodes to confirm — prioritizing low latency and availability. During a partition, it may return stale data rather than refusing the request.

DynamoDB does offer **strongly consistent reads** (opt-in, per request), which provide CP-like guarantees but at slightly higher latency and cost. In its default configuration, it optimizes for availability and partition tolerance.

---

### 55. Why are relational databases usually CP-oriented?

Relational databases are designed around ACID transactions, which require strong consistency. During a network partition:
- A properly configured PostgreSQL HA cluster will refuse writes if the primary can't reach its synchronous replica (to prevent split-brain).
- Reads requiring serializability will block or return errors rather than stale results.

This makes them CP: they sacrifice availability (return errors) to preserve consistency. The assumption is that for financial/transactional data, it is worse to return wrong data than to return an error.

---

### 56. What happens during network partitions?

The network splits into isolated segments. Nodes in segment A cannot communicate with nodes in segment B.

**For CP systems**: Nodes in the minority segment (fewer than quorum) stop accepting writes and may refuse reads. The majority segment continues operating. After partition heals, minority nodes catch up.

**For AP systems**: Both segments continue operating independently. Writes to segment A and segment B diverge. When the partition heals, the system applies a conflict resolution strategy (LWW, vector clocks, CRDTs) to reconcile the diverged state.

**In practice**: Most cloud providers have <0.1% partition events annually, but they do happen. Systems should be designed with the assumption that partitions will occur.

---

### 57. How do systems prioritize consistency vs availability?

Through configuration and operational choices:

- **Quorum settings** (Cassandra, DynamoDB): `QUORUM`/`QUORUM` = favor consistency. `ONE`/`ONE` = favor availability.
- **Synchronous vs asynchronous replication**: Synchronous = favor consistency (lose availability if replica is down). Async = favor availability.
- **Read preferences**: MongoDB `readPreference: primary` = consistent. `readPreference: nearest` = available/low latency.
- **Timeout and failure behavior**: Does the system return a cached/stale result on timeout (AP) or return an error (CP)?

The decision is typically made at the system design level based on what failure mode is more acceptable for the use case.

---

### 58. How would you explain CAP theorem using a booking system?

Imagine a flight booking system with servers in two regions, connected by a network link.

**Normal operation**: A booking in New York is replicated to London. Both regions agree on seat availability.

**Network partition**: The link goes down. A customer in New York books seat 14A. A customer in London also tries to book seat 14A.

**CP choice**: London refuses the booking ("cannot confirm at this time, please try again") until the link is restored. Availability is sacrificed, but no double-booking occurs.

**AP choice**: London accepts the booking. Now both customers have seat 14A confirmed. When the link restores, the system detects the conflict and must compensate (upgrade one customer, refund, etc.). Consistency is sacrificed for availability.

The airline's business rules determine which is worse: a temporary booking failure or an oversold seat.

---

### 59. CAP theorem vs PACELC?

CAP theorem only addresses behavior during **network partitions**. PACELC extends it to cover normal operation:

**PACELC**: 
- During a **P**artition: choose between **A**vailability and **C**onsistency (same as CAP).
- **E**lse (normal operation): choose between **L**atency and **C**onsistency.

In normal operation, achieving strong consistency requires synchronous replication, which adds latency. PACELC acknowledges this latency/consistency tradeoff exists even without partitions.

**Examples**:
- DynamoDB: PA/EL (favors availability during partitions, low latency in normal operation).
- Spanner: PC/EC (strongly consistent in both cases, accepts higher latency).
- Cassandra (configurable): PA/EL by default, PC/EC with QUORUM settings.

PACELC gives a more complete picture of real-world tradeoffs than CAP alone.

---

### 60. Real-world tradeoff example from your projects?

**Example answer (booking/inventory context)**:

In designing a seat reservation system, we chose to make the **availability check** AP and the **reservation commit** CP.

The availability display (how many seats are left) read from a replica with eventual consistency — it was acceptable to briefly show "3 seats left" when there were actually 2, as it didn't commit anyone to a booking.

However, the actual reservation used optimistic locking on the primary database: `UPDATE seats SET status='RESERVED' WHERE id=? AND status='AVAILABLE'`. This CP-style check prevented double-bookings, even at the cost of occasional reservation failures under contention.

The result: high availability for browsing (users almost never see errors) with strong consistency for the critical booking step (no overselling).

---

## Backpressure & Scaling

### 61. What is backpressure?

Backpressure is a flow control mechanism where a downstream system signals to upstream producers to slow down when it's overwhelmed. It propagates the signal of "I'm at capacity" back through the call chain.

**Example**: A database can handle 1,000 writes/second. If the application tier is sending 5,000 writes/second, without backpressure the database is overwhelmed. With backpressure, the database (or a queue in front of it) signals: "slow down, I'm at capacity."

Backpressure is the correct long-term solution. The wrong response is to silently drop requests or allow unbounded queue growth (which causes memory exhaustion and delayed failures).

---

### 62. How do queues help absorb traffic spikes?

Queues act as **buffers** between producers and consumers. During a traffic spike:

- Producers write to the queue quickly (queue writes are fast).
- Consumers process at their sustainable rate, regardless of spike.
- The queue accumulates messages during the spike and drains gradually.

This decouples the peak demand from the processing rate. A system that receives 10x its normal traffic for 30 seconds can handle it if the queue has capacity and the average throughput over the spike window doesn't exceed processing capacity.

**Analogy**: A grocery store checkout queue during rush hour. Customers arrive in bursts, the queue absorbs the burst, and cashiers process at a steady rate. Without the queue, customers would be turned away.

---

### 63. What happens when consumers are slower than producers?

Queue depth grows unboundedly. Consequences:
- **Memory exhaustion**: If the queue is in-memory, the process runs out of RAM and crashes.
- **Increased latency**: Messages sit in the queue longer, increasing end-to-end processing time. A 10-minute queue depth means 10-minute processing delay.
- **Cascading failures**: Producers may time out waiting for queue writes, failing the operation upstream.
- **Data loss risk**: If the queue is not durable, a restart loses all queued messages.

**Detection**: Monitor queue depth (lag) and alert when it grows beyond acceptable bounds. In Kafka, monitor consumer group lag. In SQS, monitor `ApproximateNumberOfMessagesVisible`.

**Resolution**: Scale out consumers, reduce message processing complexity, shed load (reject low-priority messages), or implement backpressure upstream.

---

### 64. How would you protect downstream services?

1. **Rate limiting**: Cap the number of requests a caller can send per second.
2. **Circuit breaker**: Stop sending requests to a service that's failing; fail fast to give it time to recover.
3. **Bulkhead pattern**: Isolate resource pools so that exhaustion in one service doesn't exhaust shared resources for another.
4. **Load shedding**: Deliberately drop low-priority requests under extreme load rather than accepting all and failing all.
5. **Queues with bounded depth**: Enforce a maximum queue size; reject new messages when the limit is reached rather than accepting them into an unbounded queue.
6. **Timeout + fallback**: Set aggressive timeouts on downstream calls; have a fallback (cached response, degraded response, or empty state) when the call times out.

---

### 65. Rate limiting vs throttling?

**Rate limiting**: Enforces a maximum request rate per unit time (e.g., 100 requests/second per API key). Requests exceeding the limit are rejected with a 429 response. Protects the server from overload; implemented at the API gateway or service level.

**Throttling**: Slows down requests rather than rejecting them — introduces artificial delays to pace the caller. Often used for fairness (preventing a single client from consuming all resources) rather than pure overload protection.

In practice the terms are often used interchangeably, but the distinction is: rate limiting rejects excess requests; throttling delays them.

Common algorithms: Token bucket (allows bursts), leaky bucket (smooth output), sliding window counter, fixed window counter.

---

### 66. Circuit breaker pattern?

A circuit breaker wraps calls to an external service and monitors for failures. It has three states:

- **Closed** (normal): Requests pass through. Failures are tracked.
- **Open** (tripped): After failures exceed a threshold (e.g., 50% error rate over 10 seconds), the circuit opens. Requests fail immediately without attempting the downstream call — fast failure instead of slow failure.
- **Half-open** (testing): After a cooldown period, a small number of probe requests are allowed. If they succeed, the circuit closes. If they fail, it opens again.

**Benefits**: Prevents cascading failures, gives downstream services time to recover, reduces latency under failure (fast fail instead of waiting for timeout).

**Implementation**: Netflix's Hystrix, Resilience4j (Java), Polly (.NET), or service mesh-level (Istio, Envoy).

---

### 67. Bulkhead pattern?

Named after ship bulkheads that isolate compartments — if one floods, others remain intact.

In software: **isolate resource pools** (thread pools, connection pools, semaphores) for different downstream services. If Service A starts failing and exhausts its thread pool, Service B's thread pool is unaffected.

**Example**: Without bulkheads, a shared HTTP client thread pool is used for all downstream calls. If Service A starts responding slowly, all threads get stuck waiting, and Service B (normally healthy) also becomes unavailable from the caller's perspective.

With bulkheads: Service A gets 10 threads, Service B gets 10 threads. Exhaustion in A doesn't affect B.

---

### 68. Retry storm problem?

A **retry storm** (or thundering herd on retry) occurs when many clients simultaneously experience failures and all retry at the same time, creating a spike in requests that overwhelms the recovering service, causing further failures, which trigger more retries — a feedback loop.

**Example**: A database restarts after a crash. 1,000 application servers, all experiencing connection errors, retry simultaneously. The database is hit with 1,000 reconnection attempts in milliseconds, which is worse than its normal load, causing it to fail again.

**Solutions**:
- **Exponential backoff with jitter**: Each client waits a random delay so retries are spread out over time.
- **Circuit breaker**: After a threshold of failures, stop retrying. This prevents the retry storm from starting.
- **Retry budgets**: Limit the total retry rate across all clients using a distributed rate limiter.

---

### 69. Exponential backoff strategy?

Exponential backoff doubles the wait time between successive retries:

```
attempt 1: wait 1s
attempt 2: wait 2s
attempt 3: wait 4s
attempt 4: wait 8s
attempt 5: wait 16s (capped at max, e.g., 60s)
```

**With jitter**: Add random noise to prevent synchronized retries:
```
wait = min(cap, base * 2^attempt) + random(0, 1s)
```

**Decorrelated jitter** (AWS recommendation):
```
wait = random(base, previous_wait * 3)
```

This distributes retry load more evenly. Without jitter, all clients on the same retry schedule hit the server simultaneously.

**Max retries**: Set a hard cap (e.g., 5 retries). After that, fail permanently or send to DLQ.

---

### 70. How would you prevent cascading failures?

Cascading failures occur when a failure in one service causes failures in dependent services, spreading throughout the system.

Prevention strategy (defense in depth):

1. **Timeouts everywhere**: Never wait indefinitely for a downstream response. Use aggressive timeouts.
2. **Circuit breakers**: Stop calling failing services; fail fast.
3. **Bulkheads**: Isolate thread/connection pools per downstream service.
4. **Graceful degradation**: Return a cached/reduced response when a dependency fails, rather than propagating the error.
5. **Shed load early**: Reject excess requests at the edge (load balancer/API gateway) before they penetrate deeper.
6. **Rate limit downstream calls**: Don't let a surge in traffic translate into a proportional surge in downstream calls.
7. **Chaos engineering**: Proactively test failure scenarios to find cascade paths before they occur in production.

---

# PART 2: DATABASE SYSTEMS

---

## Query Optimization

### 71. Why does an index sometimes not get used?

The query planner uses statistics to estimate whether an index will be faster than a sequential scan. It may skip the index when:

- **Low selectivity**: If the index column has few distinct values (e.g., a boolean column with 90% `TRUE`), scanning the index + fetching rows is slower than a full table scan.
- **Small table**: For small tables, a full scan is faster than index traversal overhead.
- **Leading column not in query**: For composite indexes on `(A, B)`, a query filtering only on `B` can't use the index efficiently.
- **Function on indexed column**: `WHERE LOWER(email) = 'user@example.com'` — the index on `email` isn't used. Need a functional index.
- **Type mismatch**: `WHERE user_id = '123'` (string vs integer) causes implicit cast, bypassing the index.
- **Stale statistics**: The planner's row count estimates are wrong, leading to a bad plan.

---

### 72. Explain index selectivity.

Selectivity measures the fraction of rows returned by a predicate. High selectivity = few rows returned = the index is useful. Low selectivity = many rows returned = a full scan may be better.

**Formula**: Selectivity = (distinct values / total rows). A column with 1 million distinct values in 1 million rows has selectivity of 1 (very high). A boolean column has selectivity of ~0.5 (low).

**Rule of thumb**: Indexes are typically beneficial when a query returns less than 5–10% of the table. Above that, the query planner often prefers a sequential scan.

The selectivity threshold varies by table size and hardware (SSD vs HDD), which is why planners use statistics to decide dynamically.

---

### 73. What are covering indexes?

A covering index is an index that contains all columns needed to satisfy a query — both the filter condition and the SELECT columns. The database can answer the query entirely from the index without touching the base table ("index-only scan").

**Example**:
```sql
SELECT email FROM users WHERE tenant_id = 5 ORDER BY created_at;
```
A covering index on `(tenant_id, created_at, email)` serves this query entirely from the index. Without `email` in the index, the DB must fetch each row from the table to retrieve it (expensive for large result sets).

**Tradeoff**: Covering indexes are larger (include more columns) and have higher write overhead. Only create them for high-frequency, performance-critical queries.

---

### 74. Why can ORDER BY break index optimization?

An index efficiently sorts data in its defined order. `ORDER BY` breaks index optimization when:

- **Ordering by a non-indexed column**: The DB must sort the result set in memory or on disk.
- **Mixed sort directions**: `ORDER BY A ASC, B DESC` — most B-Tree indexes only support a single sort direction; mixed directions require a filesort.
- **ORDER BY on a non-leading index column**: For index `(A, B)`, `ORDER BY B` can't use the index for ordering without also filtering on A.
- **LIMIT on a non-indexed sort**: `ORDER BY created_at DESC LIMIT 10` without an index on `created_at` requires sorting the entire table before taking 10 rows.

**Fix**: Create an index on the ORDER BY column(s), matching the sort direction. For the last example: `CREATE INDEX ON orders(created_at DESC)`.

---

### 75. Explain execution plans.

An execution plan is the step-by-step strategy the database will use to execute a query. Viewing it (via `EXPLAIN` in PostgreSQL, `EXPLAIN FORMAT=JSON` in MySQL) shows:

- **Scan type**: Sequential scan vs index scan vs index-only scan.
- **Join algorithm**: Nested loop join, hash join, merge join.
- **Estimated row counts and costs**: The planner's estimates for how many rows each step will process.
- **Actual vs estimated** (with `EXPLAIN ANALYZE`): Whether estimates were accurate; large discrepancies indicate stale statistics.

**Key metrics to look for**:
- High "rows" estimates that don't match actual (bad statistics).
- Sequential scans on large tables (missing index).
- Nested loop joins on large tables with no index (should be hash join).
- High sort costs (missing index on ORDER BY column).

Understanding execution plans is one of the most powerful tools for query optimization.

---

### 76. Why can the same query suddenly become slow?

Several reasons:

- **Table growth**: A query that was fast on 10K rows may be slow on 100M rows. The plan that worked before is no longer optimal.
- **Stale statistics**: After a large data load, the planner's statistics don't reflect the new distribution. `ANALYZE` (PostgreSQL) updates them.
- **Plan cache pollution**: The database cached a query plan that was optimal for one set of parameters but poor for another (parameter sniffing in SQL Server).
- **Index bloat/fragmentation**: After heavy writes/deletes, index pages become fragmented, degrading scan performance.
- **Lock contention**: A new, long-running transaction is holding locks, causing the query to wait.
- **Changed data distribution**: A once-selective predicate (e.g., `status = 'PENDING'`) is no longer selective after a bulk status update.
- **Vacuum/autovacuum failing**: In PostgreSQL, table bloat from dead tuples slows scans if autovacuum isn't keeping up.

---

### 77. How do statistics affect query planners?

The query planner uses statistics to estimate the cost of different query plans and choose the cheapest one. Statistics include:

- **Row count estimates** per table.
- **Column value distribution**: Most common values (MCVs) and histogram of value ranges.
- **Correlation**: How well the physical order of rows matches the logical order of an indexed column.
- **Null fraction**: What percentage of values are null.

If statistics are stale (after bulk inserts, deletes, or updates), the planner uses wrong estimates. It may choose a nested loop join expecting 100 rows when there are 1 million, or skip an index because it thinks the selectivity is low when it's actually high.

**Fix**: Run `ANALYZE` (PostgreSQL) or `UPDATE STATISTICS` (SQL Server) after significant data changes. Increase the statistics target for columns with unusual distributions: `ALTER TABLE t ALTER COLUMN c SET STATISTICS 500`.

---

### 78. Explain cardinality estimation problems.

**Cardinality** = the number of rows the planner estimates a query step will produce. Estimation errors compound through multi-step plans.

**Common sources of error**:
- **Correlation between columns**: The planner assumes column predicates are independent. `WHERE city = 'New York' AND state = 'CA'` — the planner estimates based on each column separately, but city and state are correlated (NYC is in NY, not CA), leading to wildly wrong estimates.
- **Non-uniform distributions**: Histograms bucket values into equal-frequency ranges; rare values or skewed distributions can mislead the planner.
- **Join cardinality**: Estimating rows after multi-table joins compounds errors — errors multiply.
- **Subqueries and CTEs**: Planners may not push statistics through CTEs, treating them as black boxes.

**Fix**: Extended statistics in PostgreSQL (`CREATE STATISTICS`) can capture column correlations. For persistent bad plans, force a plan with hints (SQL Server) or pg_hint_plan (PostgreSQL).

---

### 79. How do joins impact performance?

Joins combine rows from two tables based on a condition. Performance depends on:

- **Table sizes**: Joining two large tables without indexes is very expensive.
- **Join algorithm selected**:
  - **Nested loop**: Good for small tables or when one side is small. O(N×M) worst case.
  - **Hash join**: Good for large tables without sort order. Builds a hash table of one side, probes with the other. High memory usage.
  - **Merge join**: Good when both sides are sorted on the join key (often via index scan). Very efficient but requires sorted input.
- **Missing indexes on join columns**: Without an index on the join key, the planner may choose a nested loop over a full table scan — O(N×M).
- **Data type mismatches**: Joining `INT` to `VARCHAR` requires implicit casting, disabling index use.
- **Row count asymmetry**: Building the hash table from the smaller side is more efficient.

---

### 80. Nested loop vs hash join vs merge join?

| Algorithm | Best when | Memory | Complexity |
|---|---|---|---|
| **Nested loop** | One side is small or heavily indexed | Low | O(N + N×M/B) with index |
| **Hash join** | Large tables, no sort order available | High (builds hash table) | O(N + M) |
| **Merge join** | Both sides sorted on join key | Low | O(N + M) if pre-sorted |

**Decision logic** (simplified):
- If the inner table has an index on the join key and the outer table is small → Nested loop.
- If tables are large and unsorted → Hash join.
- If there's an ORDER BY on the join columns or both sides come from index scans in the right order → Merge join.

The query planner chooses based on estimated costs. You can influence the choice by adding appropriate indexes or, rarely, using query hints.

---

## Indexing Strategies

### 81. B-Tree vs Hash index?

**B-Tree** (default in PostgreSQL, MySQL):
- Balanced tree structure; O(log n) lookup.
- Supports equality, range, prefix, and sort operations (`<`, `>`, `BETWEEN`, `LIKE 'prefix%'`).
- Universal choice for most queries.

**Hash index**:
- Hash map structure; O(1) equality lookup.
- Only supports exact equality (`=`). No range queries, no sorting.
- Theoretically faster for equality lookups but not significantly so in practice.
- PostgreSQL hash indexes are not WAL-logged by default (less durable historically; improved in PG10+).

**In practice**: Use B-Tree almost always. Hash indexes are a micro-optimization for very specific equality-heavy workloads that rarely justify the trade-offs.

---

### 82. GIN index use cases?

**GIN (Generalized Inverted Index)** is optimized for composite values where each element needs to be searchable independently:

- **Full-text search**: Index `tsvector` columns for fast text search (`@@` operator).
- **Array columns**: Index elements of arrays for efficient `@>` (contains), `<@` (is contained by), `&&` (overlap) queries.
- **JSONB columns**: Index keys/values within JSONB for fast JSON attribute queries.
- **hstore**: Key-value store type in PostgreSQL.

**Tradeoff**: GIN indexes have higher write overhead (each array element / text token gets an entry). They're ideal for read-heavy, search-heavy workloads. For heavy writes, consider `fastupdate` option or BRIN/partial indexes.

---

### 83. Partial indexes?

A partial index only includes rows that satisfy a WHERE condition. It's smaller, faster to build, and more selective.

**Example**:
```sql
CREATE INDEX idx_pending_orders ON orders(created_at) WHERE status = 'PENDING';
```

This index only covers pending orders. If 95% of orders are `COMPLETED`, this index is 20x smaller than a full index on `created_at`. Queries filtering on `status = 'PENDING'` benefit enormously.

**Other use cases**:
- Index non-null values only: `WHERE email IS NOT NULL`.
- Index active/non-deleted records: `WHERE deleted_at IS NULL`.
- Index recent data: `WHERE created_at > '2024-01-01'`.

Partial indexes are one of the most underused optimization tools. They dramatically reduce index size and write overhead.

---

### 84. Composite index ordering importance?

A composite index `(A, B, C)` can be used for queries filtering on:
- `A` alone
- `A, B`
- `A, B, C`

But NOT efficiently for:
- `B` alone (no `A` prefix)
- `B, C` (no `A` prefix)
- `C` alone

The **leftmost prefix rule**: a query must use the leading columns of the index in order. Once a range predicate is used on a column (e.g., `A > 5`), the index cannot be used for filtering on subsequent columns (though it can still be used for the covered columns).

**Design guidance**: Order columns in the index by:
1. Equality predicates first (highest selectivity, used in WHERE).
2. Range predicates second.
3. Sort/ORDER BY columns last.

---

### 85. Why do too many indexes hurt performance?

Every index is a separate data structure that must be maintained on every INSERT, UPDATE, and DELETE:

- **Write overhead**: Each write to a table must update all its indexes. 10 indexes = 10× the write work.
- **Storage overhead**: Indexes can easily be 2–5× the size of the table data itself.
- **Query planner overhead**: More indexes = more potential plans = longer planning time.
- **Index bloat**: Unused or rarely-used indexes accumulate dead pages, consuming storage and memory (buffer pool).
- **Lock contention**: More indexes = more lock acquisitions per write.

**Best practice**: Index only what you query. Regularly audit for unused indexes (see Q90) and drop them. For write-heavy tables (logs, events), be especially conservative with indexes.

---

### 86. Explain write amplification caused by indexes.

Write amplification is the ratio of actual I/O written to the amount of data written by the application. Indexes multiply write amplification:

- A single row insert into a table with 5 indexes results in 6 writes (1 table + 5 index pages).
- For updates touching indexed columns, both the old and new index entries must be updated.
- With B-Tree indexes, a single write may cascade into multiple page splits and rebalancing operations.

For LSM-tree based systems (like RocksDB/Cassandra), compaction multiplies write amplification further as data is merged across levels.

High write amplification means slower writes, higher IOPS consumption, and faster SSD wear.

---

### 87. How do indexes impact insert-heavy systems?

For insert-heavy workloads (logging, time-series, event ingestion):

- Each insert must update all indexes synchronously before the transaction can commit.
- Index page splits (when a B-Tree leaf page is full) are particularly expensive — they require acquiring locks and rewriting multiple pages.
- If indexes are on monotonically increasing values (like timestamps), all inserts hit the rightmost page of the B-Tree, creating a hot spot.

**Mitigation strategies**:
- Use a **BRIN index** (Block Range Index) for insert-order data — tiny size, fast inserts, works for range scans on timestamp-ordered data.
- Use **partial indexes** to cover only the queried subset.
- Use **write-optimized storage engines** (LSM-tree based: ClickHouse, Cassandra) for very high write rates.
- **Batch inserts**: Accumulate inserts in memory and write in large batches; reduces index update overhead.
- **Defer index creation**: Drop indexes before a bulk load, then recreate them concurrently after.

---

### 88. Clustered vs non-clustered indexes?

**Clustered index**: The table data is physically stored in the order of the index key. There can be only one clustered index per table (since data can only be ordered one way). In InnoDB (MySQL), the primary key is always the clustered index.

**Benefits**: Range scans on the clustered key are very fast (physically sequential reads). No extra lookup needed to get the row data.

**Non-clustered index** (all indexes in PostgreSQL; secondary indexes in MySQL):
- A separate structure that stores the index key + a pointer to the row (heap tuple in PostgreSQL, primary key in InnoDB).
- Range scans require random I/O to fetch each row separately (expensive for large result sets).

**InnoDB implication**: Since secondary indexes store the primary key (not a physical pointer), keep primary keys small (INT vs UUID) to minimize secondary index size.

---

### 89. What is index fragmentation?

Over time, as rows are inserted, updated, and deleted, index pages develop "holes" — pages that are partially empty or logically sequential pages that are not physically contiguous on disk.

**Logical fragmentation**: Index pages are out of physical order on disk, causing random I/O on sequential scans.

**Internal fragmentation**: Individual pages are partially empty (after deletions), wasting storage and reducing cache efficiency.

**Effects**: Slower index scans (more I/O pages to read), larger index size, reduced buffer pool efficiency.

**Fix**:
- PostgreSQL: `VACUUM` reclaims space from dead tuples; `REINDEX` or `CLUSTER` rebuilds the index/table.
- MySQL: `OPTIMIZE TABLE` or `ALTER TABLE ... ENGINE=InnoDB` rebuilds.
- SQL Server: `ALTER INDEX REBUILD` (offline, locks table) or `ALTER INDEX REORGANIZE` (online, less disruptive).

---

### 90. How do you identify unused indexes?

**PostgreSQL**:
```sql
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```
`idx_scan = 0` means the index has never been used since the last statistics reset.

**MySQL**:
```sql
SELECT * FROM sys.schema_unused_indexes;
```

**General approach**:
- Monitor index usage statistics for 30–90 days (covering peak traffic periods and batch jobs).
- Flag indexes with zero or very low scan counts.
- Check if the index is needed for a specific scheduled job or report that runs infrequently.
- Before dropping, consider creating the index in an equivalent database and monitoring — the pg_stat data resets on restarts, so a recently restarted DB shows all zeros.

---

## Partitioning & Sharding

### 91. Partitioning vs sharding?

**Partitioning**: Dividing a single table into multiple physical segments within the **same database instance**. The database engine manages routing transparently. Queries can span all partitions via the same connection.

**Sharding**: Distributing data across **multiple separate database instances** (different servers). The application (or a proxy layer) routes queries to the correct shard. Shards are fully independent.

**Key difference**: Partitioning is vertical/horizontal decomposition within one node; sharding is distributing across many nodes. Sharding provides horizontal scale-out beyond what a single machine can handle.

---

### 92. Horizontal vs vertical partitioning?

**Horizontal partitioning (most common)**: Splitting rows across partitions based on a partition key. Each partition has the same schema but a subset of rows.
- Example: Partition an orders table by year: orders from 2023 in one partition, 2024 in another.

**Vertical partitioning**: Splitting columns across separate tables or storage. A "wide" table with 50 columns might be split into a "hot" table with the 10 frequently-accessed columns and a "cold" table with the 40 rarely-accessed ones, joined by primary key.
- Example: Split a `users` table into `users_core (id, email, name)` and `users_profile (id, bio, preferences, settings)`.

Vertical partitioning reduces I/O for queries that only need a few columns.

---

### 93. Good shard key characteristics?

A good shard key:

1. **High cardinality**: Many distinct values so data distributes evenly across shards. A boolean is a terrible shard key.
2. **Even distribution**: Values should be uniformly distributed, avoiding hot spots where most data concentrates in one shard.
3. **Query locality**: Queries should typically involve data from a single shard. Cross-shard queries are expensive.
4. **Immutable**: Once a shard key is assigned to a row, it shouldn't change — changing it requires moving the row to a different shard.
5. **Low fan-out**: Operations should touch as few shards as possible.

**Common shard keys**: `user_id` (for user-centric data), `tenant_id` (for multi-tenant SaaS), `order_id` (hash-based).

---

### 94. What causes hot partitions?

A hot partition receives a disproportionate share of read or write traffic. Causes:

- **Sequential keys as shard key**: Using timestamps or auto-increment IDs means all new writes go to the "latest" partition. This is the most common cause.
- **Skewed data distribution**: Certain partition key values are far more common (e.g., a viral user's content, a popular product category).
- **Low cardinality shard key**: If there are only 10 distinct country values and one country has 80% of traffic, that partition is hot.
- **Business patterns**: "Flash sales" create sudden traffic spikes on specific items; sporting events create spikes on specific team/event data.

**Solutions**: Hash-based partitioning (distributes sequential keys evenly), composite shard keys (add randomness), read replicas for hot partitions, write buffering with fan-out.

---

### 95. How would you rebalance shards?

Rebalancing moves data between shards, needed when shards become unevenly loaded or new shards are added.

**Approaches**:

1. **Consistent hashing**: New shards only take data from neighbors; minimal data movement. Used by Cassandra and DynamoDB.

2. **Range splitting**: Split an overloaded shard's key range and migrate half to a new shard. Used by HBase, Bigtable.

3. **Double-write migration**: 
   - Start writing to both old and new shard simultaneously.
   - Backfill old data to new shard.
   - Once caught up, switch reads to new shard.
   - Stop writes to old shard.
   
4. **Proxy-based routing**: A routing layer abstracts shard topology from the application; it can reroute traffic during rebalancing without application changes.

**Challenge**: Rebalancing must happen with minimal downtime and without data loss. Data consistency during migration requires careful sequencing and dual-write windows.

---

### 96. Range vs hash partitioning?

**Range partitioning**: Partitions are defined by value ranges.
- Example: `orders` by `created_at`: Jan–Mar in partition 1, Apr–Jun in partition 2.
- **Pros**: Efficient range queries; easy partition pruning; archive/drop old partitions.
- **Cons**: Hot spots on recent data (all new rows go to the "current" partition).

**Hash partitioning**: Partition is determined by `hash(key) % N`.
- Example: `orders` by `hash(order_id) % 8` → 8 shards.
- **Pros**: Even distribution; eliminates sequential hot spots.
- **Cons**: Range queries require hitting all partitions; can't prune based on key range.

**Hybrid**: Hash-then-range (consistent hashing ring with virtual nodes). Used in Cassandra: rows are hash-partitioned across the ring, then physically range-sorted within each node.

---

### 97. Why is userId often used as partition key?

- **High cardinality**: Typically millions of distinct user IDs — excellent distribution.
- **Query locality**: User-centric applications mostly access data belonging to a specific user. Using `userId` as the partition key means a user's data is co-located on a single shard, enabling efficient single-shard queries.
- **Even distribution**: User IDs (especially UUID or random-component IDs) distribute evenly via hashing.
- **Scalability**: Adding users grows the dataset; `userId`-based sharding scales naturally as users are distributed across shards.

**Caveat**: For highly popular users (celebrities, viral accounts), a single `userId` shard can become a hot spot. Mitigate with caching, read replicas, or activity sharding for specific high-traffic entities.

---

### 98. Why can timestamp-based partitioning fail?

Timestamp-based partitioning causes **write hot spots**: all new writes go to the latest time partition.

- In a write-heavy system, 99% of writes hit partition N (today's partition) while partitions 1 through N-1 are cold.
- A single partition must handle the entire write load of the system.
- In distributed databases (Cassandra, DynamoDB), this can overload specific nodes.

**Additional issues**:
- Clock skew: Out-of-order timestamps from different nodes can distribute across partition boundaries unexpectedly.
- Backfill: Re-processing historical data writes to older partitions, causing unexpected load spikes.

**Fix**: Use timestamp for range-based partitioning in analytical/archival contexts (where writes are distributed across time), but for OLTP hot-write scenarios, use hash partitioning or composite keys (e.g., `hash(user_id)` for primary distribution, timestamp for secondary sorting within a partition).

---

### 99. Cross-shard query challenges?

Cross-shard queries require fetching data from multiple shards and aggregating it:

- **Scatter-gather**: Query all N shards in parallel, collect results, merge. Latency = slowest shard. N shards = N×write queries.
- **No global sort**: Ordering results from multiple shards requires a merge-sort step in the application or a gateway layer.
- **No global transactions**: ACID transactions across shards require distributed transaction protocols (2PC or Saga).
- **Aggregation complexity**: `GROUP BY`, `COUNT`, `SUM` across shards must be done in two phases: per-shard aggregate, then global merge.
- **JOINs**: Joining data across shards requires either broadcasting one side or fetching from both and joining in application memory.

**Mitigations**: Design the data model to minimize cross-shard access. For queries that are inherently global (analytics), use a separate read replica/data warehouse that consolidates all shards.

---

### 100. How would you shard a booking system?

**Analysis**: 
- Bookings are created by users but reference resources (seats, rooms, time slots).
- Most queries are by `user_id` (user's booking history) or by `resource_id + date` (availability check).

**Shard by `user_id` (user-centric approach)**:
- A user's booking history is co-located — fast for user-facing queries.
- Availability checks (how many bookings for resource X on date Y?) require cross-shard scatter-gather.

**Shard by `resource_id` (resource-centric approach)**:
- Availability checks are fast (all bookings for a resource on the same shard).
- User booking history requires scatter-gather across all resource shards.

**Hybrid approach**:
- Shard by `resource_id` for write path (inventory check, booking creation).
- Maintain a separate user-indexed view (replicated from events) for the user booking history read path.

**In practice**: Use a hash of `resource_id` for the primary shard, and build an async denormalized "user's bookings" projection for the user-centric view.

---

## Storage Engine Internals

### 101. Explain PostgreSQL WAL.

WAL (Write-Ahead Log) is the mechanism PostgreSQL uses to ensure durability and enable recovery.

**How it works**:
1. Before a data page is modified, the intended change is written to the WAL (a sequential log on disk).
2. The WAL record is flushed to disk (`fsync`) before the transaction commits.
3. The actual data pages are modified in the buffer pool (memory) and written to disk lazily (checkpoint process).

**Why WAL enables durability**: If the database crashes before flushing dirty data pages, the WAL contains all committed changes. On restart, PostgreSQL replays the WAL to bring data pages up-to-date.

**Secondary uses**:
- **Replication**: Replicas apply WAL records to stay current (streaming replication).
- **PITR (Point-In-Time Recovery)**: Archive WAL files to restore the database to any point in time.
- **Logical decoding**: WAL is decoded to replicate data changes to other systems (Debezium, logical replication).

---

### 102. What happens during checkpointing?

A **checkpoint** is a synchronization point where all dirty pages in the buffer pool are flushed to disk. After a checkpoint, the WAL before the checkpoint can be discarded (for recovery purposes) because all the data it describes is now safely on disk.

**Checkpoint process**:
1. PostgreSQL identifies all dirty buffer pool pages.
2. Writes them to disk (spread out over `checkpoint_completion_target` to avoid I/O spikes).
3. Writes a checkpoint record to WAL.
4. Truncates WAL before the checkpoint (no longer needed for recovery).

**Performance impact**: Checkpoints cause I/O bursts (flushing many dirty pages). Too-frequent checkpoints = high I/O; too-infrequent = more WAL to replay on crash recovery and more memory used by dirty pages.

**Tuning**: `checkpoint_timeout` (max time between checkpoints), `max_wal_size` (triggers checkpoint if WAL grows beyond this), `checkpoint_completion_target` (fraction of timeout over which to spread checkpoint writes, default 0.9).

---

### 103. Why are random writes expensive?

Random writes access non-contiguous locations on disk:

**HDDs**: The read/write head must physically move (seek) to each new location. Seek time is ~5–10ms per random I/O. At 5ms/op, you can do ~200 random writes/second — catastrophically slow for modern workloads.

**SSDs**: No mechanical movement, but random writes trigger **write amplification** internally. Flash cells must be erased before writing (erase block granularity is 256KB–1MB), so writing 4KB requires erasing and rewriting a 256KB block. Additionally, the FTL (Flash Translation Layer) maintains a page mapping table; random writes fragment this table and degrade performance over time due to garbage collection.

**In databases**: Random writes occur when updating index pages, modifying B-Tree nodes, or writing to random positions in a table heap. Sequential writes (WAL, LSM memtable flushes) are far more efficient on both HDDs and SSDs.

---

### 104. Explain LSM trees vs B-Trees.

**B-Tree (B+ Tree in practice)**:
- In-place updates: modifications overwrite existing pages.
- Read-optimized: single tree lookup, O(log n).
- Write path: random writes to update tree nodes.
- Used by: PostgreSQL, MySQL/InnoDB, SQLite.

**LSM-Tree (Log-Structured Merge Tree)**:
- Append-only writes: all writes go to an in-memory structure (memtable) + sequential WAL.
- When memtable is full, it's flushed to an immutable sorted file (SSTable) on disk.
- SSTables are periodically merged and compacted into larger files (reducing read overhead).
- Read path: must check memtable + multiple SSTable levels (mitigated with bloom filters and indexes).
- Used by: Cassandra, RocksDB, LevelDB, HBase.

**Tradeoff**:
| | B-Tree | LSM Tree |
|---|---|---|
| Writes | Slower (random I/O) | Faster (sequential) |
| Reads | Faster (one lookup) | Slower (multiple levels) |
| Space amplification | Low | Higher (compaction needed) |
| Write amplification | Medium | Higher (compaction rewrites) |

LSM-Trees excel in write-heavy workloads; B-Trees in read-heavy workloads.

---

### 105. Why is DynamoDB optimized for key-value access?

DynamoDB is built on principles of:
- **Fixed-time lookups**: Using the partition key, DynamoDB hashes it to locate the exact storage node and partition containing the data — O(1) lookup regardless of table size.
- **No joins, no range scans across partitions**: DynamoDB doesn't support cross-partition queries, forcing all data for a logical entity under a single partition key (co-location pattern).
- **Predictable performance**: By restricting access patterns to key-based lookups and within-partition range queries, DynamoDB can guarantee single-digit millisecond latency at any scale.

Complex queries (joins, aggregations, full-text search) are offloaded to other systems (Elasticsearch, Redshift). DynamoDB is designed for the OLTP hot path, not ad-hoc analytics.

---

### 106. How does MongoDB WiredTiger work?

WiredTiger is MongoDB's default storage engine (since 3.2). Key features:

- **Document-level concurrency control**: Multiple clients can modify different documents in the same collection concurrently without collection-level locks.
- **MVCC**: Readers don't block writers; each reader sees a snapshot of the data.
- **Compression**: Documents and indexes are compressed by default (Snappy for data, prefix compression for indexes), reducing storage by 60–80%.
- **Cache management**: WiredTiger maintains its own cache (separate from OS page cache), controllable via `wiredTigerCacheSizeGB`.
- **Write path**: Writes go to an in-memory cache and a journal (WAL). Journal provides crash recovery. Dirty pages are flushed to disk during checkpoints.

WiredTiger uses a B-Tree-like structure for collections and indexes, but with per-document locking rather than page-level locking.

---

### 107. What are SSTables?

**SSTable (Sorted String Table)**: An immutable, sorted file containing key-value pairs, used in LSM-tree storage engines (Cassandra, RocksDB, LevelDB).

**Structure**:
- Key-value pairs sorted by key.
- An index block at the end maps key ranges to block offsets (enables binary search).
- A bloom filter per SSTable allows quickly checking if a key *might* exist without reading the file.
- Compressed in blocks.

**Immutability**: SSTables are never modified after creation — they're only merged (compacted) into new, larger SSTables and then deleted.

**Why immutable?**: Immutability allows append-only writes (no random I/O), enables consistent snapshots, and simplifies concurrent access (no write locks needed for readers).

---

### 108. Write amplification vs read amplification?

**Write amplification**: The ratio of data actually written to disk vs data logically written by the application.
- Causes: B-Tree page splits (one write → multiple page rewrites), LSM compaction (data rewritten multiple times as it moves through levels), WAL writes.
- High write amplification = faster SSD wear, higher I/O, lower write throughput.

**Read amplification**: The number of disk I/O operations per logical read.
- Causes: Multi-level LSM structure (must check memtable + L0 + L1 + ... + Ln), non-covering indexes (index read + heap fetch), fragmentation.
- High read amplification = higher read latency.

**Space amplification**: Amount of storage used vs logical data size.
- Causes: LSM compaction (old and new data coexist until compaction), B-Tree page fragmentation, MVCC dead rows.

LSM trees trade read/space amplification for low write amplification. B-Trees balance all three. Tuning involves shifting between these tradeoffs.

---

### 109. How does compaction work?

**Compaction** (in LSM-tree engines) merges multiple SSTables into a larger, sorted SSTable, removing deleted and superseded entries.

**Why necessary**:
- Without compaction, the number of SSTables grows, increasing read amplification (must check every SSTable for a key).
- Deleted keys (tombstones) continue to take up space.
- Duplicate versions of a key accumulate across SSTables.

**Types**:
- **Size-tiered compaction** (Cassandra default for write-heavy): Group SSTables of similar size and merge them. Low write amplification, high space amplification (temporary double-space during compaction).
- **Leveled compaction** (LevelDB, RocksDB): Organize SSTables into levels; each level is 10× the size of the previous. Lower space amplification, better read performance, higher write amplification.

**Tradeoff**: Compaction consumes CPU and I/O, temporarily competing with normal operations. Under high sustained write load, compaction may fall behind, degrading read performance.

---

### 110. Why are sequential writes faster?

**HDDs**: Sequential writes move the disk head along a track continuously — no seek time between writes. A sequential I/O can write thousands of sectors in one sweep; random I/O requires seeking for each.

**SSDs**: Sequential writes map to naturally aligned flash erase blocks, minimizing write amplification in the FTL. Random writes trigger costly erase-and-rewrite cycles on out-of-place pages.

**OS and hardware buffers**: Sequential I/O benefits from read-ahead, OS page cache batching, and write buffer coalescing — entire pages are submitted in one I/O operation.

**In databases**: This is why WAL-first designs (PostgreSQL, InnoDB, LSM engines) achieve high durability and throughput — all committed data is written sequentially to the log. Random data page writes happen lazily in the background.

---

## Concurrency & Transactions

### 111. What causes deadlocks?

A deadlock occurs when two or more transactions are each waiting for a lock held by another transaction in the set, creating a cycle:

- Transaction A holds lock on row 1, waits for row 2.
- Transaction B holds lock on row 2, waits for row 1.
- Neither can proceed.

**Common patterns**:
- **Inconsistent lock ordering**: Transaction A locks rows in order (1, 2); Transaction B locks in order (2, 1). They meet in the middle.
- **Gap lock + range conflicts**: In MySQL with repeatable read isolation, gap locks can create unexpected deadlocks.
- **Application-level lock ordering**: Different code paths acquiring the same set of locks in different orders.
- **Lock escalation**: An operation that starts with row locks escalates to a table lock, conflicting with existing row locks.

---

### 112. How do you debug deadlocks?

**PostgreSQL**:
- Deadlock details are logged automatically (at `LOG` level) with `DETAIL` showing which PIDs held/waited for which locks and the lock graph.
- Enable `log_lock_waits = on` to see all waits (not just deadlocks).
- Query `pg_locks` and `pg_stat_activity` to see current lock state.

**MySQL**:
- `SHOW ENGINE INNODB STATUS` → look for the "LATEST DETECTED DEADLOCK" section, showing the full transaction and lock state.
- Enable `innodb_print_all_deadlocks` to log all deadlocks to the error log.

**Analysis steps**:
1. Identify the two (or more) transactions involved.
2. Identify which rows/tables/locks each transaction held and waited for.
3. Find the code paths that created those transactions.
4. Determine why they acquired locks in conflicting orders.

**Fix**: Standardize lock acquisition order in code. Use `SELECT ... FOR UPDATE` explicitly and consistently. Keep transactions short to reduce contention window.

---

### 113. Explain optimistic vs pessimistic locking.

**Pessimistic locking**: Assume conflicts will occur. Lock the resource before reading it: `SELECT ... FOR UPDATE`. Holds the lock until transaction ends. Safe, but reduces concurrency and can cause deadlocks.

**Best for**: High-contention scenarios where conflicts are likely (e.g., popular seat booking, shared inventory).

**Optimistic locking**: Assume conflicts are rare. Read without locking; check at write time if the data has changed since the read.

Implementation:
```sql
-- Read
SELECT version, quantity FROM inventory WHERE id = 1;
-- ... process ...
-- Write (fails if version changed)
UPDATE inventory SET quantity = ?, version = version + 1 
WHERE id = 1 AND version = <read_version>;
-- If 0 rows affected: conflict detected, retry
```

**Best for**: Low-contention scenarios where conflicts are infrequent. Avoids lock overhead in the common case at the cost of occasional retries.

---

### 114. Row lock vs table lock?

**Row lock**: Locks a specific row. Other transactions can read/write other rows in the same table concurrently. Highest concurrency; higher overhead per lock (many lock objects for bulk operations).

**Table lock**: Locks the entire table. Simple, low overhead, but completely serializes access to the table. Appropriate for bulk operations (ALTER TABLE, TRUNCATE) or very low-traffic tables.

**Page lock** (intermediate, less common): Locks a disk page (typically 8KB, containing many rows). Intermediate granularity.

**In practice**: Modern OLTP databases use row-level locking by default. Table locks are used for DDL operations. Explicit table locks (`LOCK TABLE`) are rarely needed and generally indicate a design problem.

---

### 115. What is MVCC?

**MVCC (Multi-Version Concurrency Control)** allows readers and writers to operate concurrently without blocking each other by maintaining multiple versions of each row.

**How it works (PostgreSQL)**:
- Every row version has `xmin` (transaction that created it) and `xmax` (transaction that deleted/updated it).
- When a transaction starts, it gets a snapshot of which transactions were committed.
- Reads see the latest row version that was committed before their snapshot — not the current state being modified by concurrent transactions.
- Writers create new row versions rather than modifying in place.

**Benefits**:
- Readers never block writers; writers never block readers.
- Consistent reads throughout a transaction's duration (snapshot isolation).
- No shared read locks needed.

**Costs**:
- Storage overhead from keeping multiple row versions.
- Need for vacuum (PostgreSQL) or purge (MySQL) to clean up old versions.

---

### 116. Phantom reads?

A phantom read occurs when a transaction re-executes a query and finds new rows that weren't there on the first execution, because another transaction committed an INSERT in between.

**Example**:
- Transaction A: `SELECT COUNT(*) FROM orders WHERE user_id = 5` → returns 3.
- Transaction B: INSERTs a new order for user_id 5 and commits.
- Transaction A: Re-runs the same query → returns 4. The new row is a "phantom."

**Isolation levels**:
- **Read Committed, Repeatable Read**: Phantoms can occur (in most implementations).
- **Serializable**: Phantoms are prevented. PostgreSQL uses Serializable Snapshot Isolation (SSI) with predicate locks to detect and block phantoms.

For booking systems: phantom reads can cause overselling — two transactions both read 0 conflicting bookings, both insert, resulting in a double booking. Serializable isolation or explicit locking prevents this.

---

### 117. Serializable isolation performance tradeoff?

Serializable isolation guarantees transactions execute as if they ran one at a time (serially), even if they actually ran concurrently. This is the strongest isolation level.

**Performance cost**:
- **Traditional serializable (2PL)**: Uses strict two-phase locking. High lock contention; long lock hold times; deadlocks more frequent; significantly reduced concurrency.
- **Serializable Snapshot Isolation (SSI in PostgreSQL)**: Optimistic — detects conflicts and aborts one transaction rather than pre-acquiring locks. Lower contention but adds CPU overhead and requires transaction retry logic.

**Guideline**: Use serializable isolation for critical financial operations or complex invariants (booking, inventory). Use lower isolation levels (Read Committed — PostgreSQL default) for most read-heavy and less critical operations. The performance difference can be 3–10× under high contention.

---

### 118. How do transactions impact scalability?

- **Lock contention**: Long transactions hold locks longer, blocking concurrent transactions. More concurrent transactions = more lock waits = lower throughput.
- **Connection exhaustion**: Each transaction typically holds a database connection. Long transactions = fewer connections available for other operations.
- **Replication lag**: Large transactions hold the write-ahead log open until commit, potentially delaying replication.
- **Vacuum inefficiency** (PostgreSQL): Long-running transactions prevent VACUUM from cleaning dead tuples, causing table/index bloat.
- **XID wraparound risk** (PostgreSQL): Very long-running transactions consume transaction IDs.

**Best practices**: Keep transactions as short as possible. Don't do network calls inside a transaction. Don't hold transactions open waiting for user input. Use READ COMMITTED when REPEATABLE READ isn't needed.

---

### 119. Long-running transaction problems?

- **Held locks block writes**: If a transaction holds a lock on a frequently-written row for minutes, all other writers queue behind it.
- **Table bloat**: Dead tuples can't be reclaimed by VACUUM while any transaction that predates them is open.
- **Replication slot lag**: If a logical replication slot is associated with a long-running transaction, WAL files accumulate and can fill up disk.
- **Potential for stale reads**: A transaction that started an hour ago sees a snapshot from an hour ago, which may confuse application logic.
- **Connection holding**: A sleeping transaction holds a database connection that could serve other requests.

**Detection**: `SELECT pid, now() - xact_start AS duration, state, query FROM pg_stat_activity WHERE xact_start IS NOT NULL ORDER BY duration DESC;`

**Mitigation**: Set `statement_timeout` and `idle_in_transaction_session_timeout` (PostgreSQL) to automatically terminate stuck transactions.

---

### 120. How would you prevent double booking?

Multiple strategies depending on the scale and requirements:

**1. Pessimistic locking (simplest)**:
```sql
BEGIN;
SELECT id FROM seats WHERE id = ? AND status = 'AVAILABLE' FOR UPDATE;
-- If row returned:
UPDATE seats SET status = 'BOOKED', user_id = ? WHERE id = ?;
COMMIT;
```
The `FOR UPDATE` lock prevents concurrent bookings of the same seat.

**2. Optimistic locking**:
```sql
UPDATE seats SET status = 'BOOKED', user_id = ?, version = version + 1 
WHERE id = ? AND status = 'AVAILABLE' AND version = ?;
-- Check rows affected = 1; if 0, seat was taken
```

**3. Database unique constraint**:
```sql
CREATE UNIQUE INDEX idx_unique_booking ON bookings(seat_id, date) 
WHERE status != 'CANCELLED';
```
The DB enforces uniqueness; concurrent inserts for the same seat/date fail with a constraint violation.

**4. Redis atomic reservation** (for very high concurrency):
```
SETNX seat:123:date:20240615 user_456  (set if not exists)
```
Returns 1 (success) or 0 (already taken). Then persist to DB.

---

# PART 3: SOFTWARE ARCHITECTURE

---

## Data Lifecycle & Evolution

### 121. How do you safely evolve schemas?

Schema evolution is one of the highest-risk database operations. Safe evolution principles:

1. **Never rename or drop columns directly** — old application code may still reference them.
2. **Prefer additive changes**: Adding new columns (with defaults or nullable) is safe because old code ignores them.
3. **Use the expand-contract pattern** (see Q124) for breaking changes.
4. **Deploy schema changes before code changes**: The new column exists but old code doesn't use it yet — safe.
5. **Deploy code changes after**: New code uses the new column — which now exists.
6. **Clean up old columns last**: After all instances are running new code, drop the old column.
7. **Test with production-like data**: Migration performance on small dev data doesn't predict behavior on 1B-row tables.

---

### 122. Backward compatibility vs forward compatibility?

**Backward compatibility**: New code can read data written by old code. Old records (with old schema) are readable by new code.
- Achieved by: Making new fields optional/nullable with defaults. Not removing fields old code may have written.

**Forward compatibility**: Old code can read data written by new code. Records written by new code (with new fields) are safely handled by old code.
- Achieved by: Old code ignores unknown fields (rather than erroring). New required fields have defaults.

**Why both matter**: During a deployment, different instances run different code versions simultaneously (rolling deployment). During this window, both old and new code will read/write data. Both forward and backward compatibility ensure the window is safe.

**Protobuf, Avro, JSON Schema**: Support backward/forward compatible evolution through field tagging, optional fields, and schema registries.

---

### 123. Blue-green DB migrations?

A **blue-green database migration** runs two versions of the schema simultaneously — blue (current) and green (new) — while deploying the application.

**Process**:
1. Add the new "green" column/table alongside the old "blue" one.
2. Write to both (dual-write in the application layer).
3. Backfill the green column with data from blue.
4. Verify green is consistent with blue.
5. Switch reads to green.
6. Stop writing to blue.
7. Remove blue.

**Benefits**: Zero-downtime migration; instant rollback by switching back to blue if issues arise.

**Example**: Renaming column `user_name` → `full_name`:
1. Add `full_name` column.
2. Write to both `user_name` and `full_name`.
3. Backfill `full_name` from `user_name`.
4. Switch reads to `full_name`.
5. Stop writing to `user_name`.
6. Drop `user_name`.

---

### 124. Expand-contract migration pattern?

A structured approach to zero-downtime schema changes in three phases:

**Phase 1 — Expand**: Add new structures without removing old ones. Old and new code both work. New code writes to new structure; old code ignores it.

**Phase 2 — Migrate**: Backfill data into new structure. Update all application instances to use new structure. Both old (during blue-green window) and new code work throughout.

**Phase 3 — Contract**: Remove old structure once all code is updated and no instances reference the old structure.

**Example** (splitting `full_name` into `first_name` + `last_name`):
- Expand: Add `first_name` and `last_name` columns.
- Migrate: Backfill from `full_name`; new code writes to both old and new.
- Contract: Drop `full_name` once no code references it.

---

### 125. How do you migrate terabytes of data?

**Key principles**: Never do it in one transaction; never take downtime for the migration itself.

**Strategy**:
1. **Batch migration**: Process rows in small batches (1,000–10,000 rows). Between batches, sleep briefly to reduce I/O impact on production.
```sql
-- Migrate in batches
UPDATE table SET new_col = transform(old_col) 
WHERE id BETWEEN ? AND ? AND new_col IS NULL;
```
2. **Background job**: Run the migration as a continuous background process, not a one-time script. It can be paused, resumed, and rate-limited.
3. **Track progress**: Record the last processed ID. Resumable from any point.
4. **Dual-write**: While migrating, new writes populate both old and new columns to keep pace.
5. **Verify consistency**: Compare row counts and sample checksums between old and new structures before cutting over.
6. **Cutover**: Once migration is complete and verified, atomic switch (see blue-green pattern).

**Tools**: `pt-online-schema-change` (MySQL), `pg_repack` or `pg_partman` (PostgreSQL).

---

### 126. Online migration vs offline migration?

**Offline migration**: Take the database down, apply schema changes, bring it back up. Zero complexity, but requires downtime. Acceptable only for maintenance windows or non-critical systems.

**Online migration**: Apply schema changes while the database serves traffic. Zero downtime. Much more complex.

Techniques for online migrations:
- `CREATE INDEX CONCURRENTLY` (PostgreSQL): Builds an index without locking the table.
- `pt-online-schema-change` (Percona, MySQL): Creates a shadow table, copies data, swaps tables with minimal lock.
- `gh-ost` (GitHub): Uses MySQL replication to perform online schema changes.
- Expand-contract pattern: Phased additions and removals.

**When each is appropriate**: Online for production systems with SLA requirements. Offline for development, staging, or systems tolerating maintenance windows.

---

### 127. Feature flags during migrations?

Feature flags decouple code deployment from feature activation, enabling safe migrations:

- **Deploy new code with feature disabled**: The new code path (using the new schema) is deployed but not activated. Old code path still runs.
- **Activate gradually**: Enable the new code path for 1% of traffic, then 10%, then 100%. Monitor for errors.
- **Instant rollback**: If issues arise, turn off the flag — no redeployment needed.
- **Control dual-write window**: Flag enables writing to both old and new schema; once migration is verified, flag switches to new-only.

**Example**: `use_new_user_profile_table` flag. When `false`, reads/writes go to old `users` table. When `true`, go to new `users_v2` table. Gradually ramp while monitoring error rates and latency.

**Tools**: LaunchDarkly, Split.io, Unleash, homegrown Redis-based flag systems.

---

### 128. How do you rollback DB schema changes?

Schema rollback is one of the hardest problems in database operations. Strategies:

1. **Additive changes are easy to rollback**: Drop the new column/index/table. No data transformation needed.

2. **Non-additive changes (renames, type changes, drops) require pre-planning**:
   - Keep the old column until you're certain rollback won't be needed.
   - In the expand-contract pattern, rollback means staying in "expand" phase longer.

3. **Blue-green migration**: Keep the old structure until the new one is verified. Rollback = stop using new, continue using old.

4. **Point-in-time recovery (PITR)**: Restore the database to a pre-migration snapshot. Works but restores all data to that point — loses all writes since the migration. Suitable only for catastrophic failures.

5. **Logical rollback (event sourcing)**: If the system is event-sourced, project a new read model from events — no physical schema rollback needed.

**Best practice**: Never deploy a migration that can't be reversed during the first 24 hours. Keep old columns alive until confidence is high.

---

### 129. Versioned APIs vs versioned events?

**Versioned APIs** (`/api/v1/users`, `/api/v2/users`):
- Breaking changes are isolated to new versions.
- Multiple versions run simultaneously; clients migrate at their own pace.
- Old versions are eventually deprecated and sunset.
- Cons: Maintenance burden of running multiple versions; code duplication.

**Versioned events** (schema evolution for event-driven systems):
- Events carry a version field: `{"version": 2, "type": "OrderPlaced", "data": {...}}`.
- Consumers handle multiple event versions or use a schema registry (Confluent Schema Registry with Avro/Protobuf).
- Upcasters transform old event versions to new format before processing.
- Cons: Consumers must handle all versions ever published; can accumulate over time.

**Key difference**: API versioning is request-driven (client chooses version); event versioning is historical (events in logs can't be changed, so all consumers must handle past versions).

---

### 130. Data archival strategy?

Old data that's rarely accessed but must be retained (compliance, auditing, historical analysis):

**Tiered storage**:
1. **Hot tier** (primary DB): Last 90 days. Full OLTP performance.
2. **Warm tier** (cheaper DB/compressed): 91 days – 2 years. Slower, cheaper.
3. **Cold tier** (object storage: S3 Glacier, Archival): 2+ years. Very cheap, minutes-to-hours retrieval.

**Implementation**:
- **Partition-based archival**: If data is range-partitioned by date, archiving is as simple as detaching an old partition and moving it.
- **Batch move**: Background job moves rows older than threshold to archive table/database.
- **Event replay archive**: Store raw events forever in S3 (cheap), rebuild any read model from them.

**Compliance considerations**: GDPR requires the ability to delete user data even in archives — plan for this upfront.

---

## Scalability

### 131. Vertical scaling vs horizontal scaling?

**Vertical scaling (scale-up)**: Add more CPU, RAM, or storage to a single machine. Simple (no code changes), but has physical limits and a single point of failure. Cost grows non-linearly.

**Horizontal scaling (scale-out)**: Add more machines. Theoretically unlimited scale; higher resilience (distributed failures). Requires the system to distribute state and work across nodes (sharding, replication, stateless services).

**Practical guidance**: Start with vertical scaling — it's simpler and often sufficient. Move to horizontal scaling when a single machine approaches its limits (CPU contention, memory pressure, I/O saturation) or when availability requires it.

---

### 132. Stateless vs stateful services?

**Stateless**: Each request is self-contained. The service doesn't remember previous requests. Any instance can handle any request. Trivially horizontally scalable — add instances behind a load balancer.

**Stateful**: The service retains state between requests (session data, connection state, cached data). Harder to scale — a request must go to the instance holding the relevant state, or state must be externalized to a shared store.

**Best practice**: Push state to external stores (Redis for sessions, databases for persistent state). Keep application services stateless. This makes scaling, failover, and deployment much simpler.

---

### 133. Bottlenecks in high-scale systems?

Common bottlenecks (in order of how frequently encountered):

1. **Database write throughput**: A single primary DB has finite write capacity. Usually the first bottleneck.
2. **Database connection limits**: Each DB connection consumes memory; connection pooling (PgBouncer) is essential.
3. **Network bandwidth**: Cross-service calls, large response payloads, missing compression.
4. **CPU saturation**: JSON serialization/deserialization, encryption, regex processing.
5. **Memory**: In-memory state, large object allocation, cache size.
6. **Lock contention**: Hot rows, long transactions.
7. **External service rate limits**: Third-party API limits, payment processor limits.
8. **Queue consumer lag**: Consumers can't keep up with producers.

**Discovery method**: Load test, profile, measure, find the bottleneck, fix it, repeat.

---

### 134. How do you identify scaling bottlenecks?

**Performance profiling**:
- Application-level: APM tools (Datadog, New Relic, Jaeger) show latency distributions and slow traces.
- Database: Slow query logs, `pg_stat_statements`, `EXPLAIN ANALYZE`.
- Infrastructure: CPU, memory, disk I/O, network throughput metrics in CloudWatch/Grafana.

**Load testing**: Tools like k6, Locust, or JMeter to generate realistic load and find where the system degrades.

**Little's Law**: `L = λ × W`. If response time W increases, throughput L/W decreases. Measure W at each tier to find the slowest.

**Flame graphs**: CPU profiling to identify hot code paths.

**Queue depth monitoring**: Rising queue depth indicates consumers are the bottleneck.

---

### 135. CPU-bound vs IO-bound systems?

**CPU-bound**: Processing time is limited by CPU speed. Characteristic of: encryption/decryption, complex computations, video encoding, ML inference, heavy JSON parsing.
- **Scaling strategy**: Add CPU cores (vertical) or parallelize work across more machines (horizontal). Multi-threading helps up to the number of physical cores.

**IO-bound**: Processing time is dominated by waiting for I/O (disk, network, database). Characteristic of: web servers, CRUD APIs, services with many downstream calls.
- **Scaling strategy**: Async I/O (non-blocking), more connections/threads to overlap waits, caching to reduce I/O, faster storage (SSD vs HDD).

**Identification**: CPU utilization stays low but throughput is also low → IO-bound. CPU at 100% → CPU-bound. Use `top`, `htop`, or profiling tools.

---

### 136. How would you scale WebSockets?

WebSockets maintain long-lived stateful connections — a single client is connected to a specific server instance. This breaks horizontal scaling assumptions.

**Challenge**: Client A is connected to Server 1. A message for Client A arrives at Server 2. How does Server 2 reach Client A?

**Solution: Pub/Sub with a shared message broker**:
- All server instances subscribe to a channel per client (e.g., Redis Pub/Sub channel `ws:user:123`).
- When a message for user 123 arrives at any server, it publishes to `ws:user:123`.
- The server instance holding that WebSocket connection delivers it to the client.

**Sticky sessions**: Alternatively, use load balancer session affinity (sticky sessions) to route a client's requests to the same server instance. Simpler but complicates rolling deployments and uneven load distribution.

**Dedicated WebSocket tier**: Separate the stateful WebSocket servers from the stateless API servers. Scale them independently.

**Scale-out limit**: At very high connection counts (millions), use purpose-built services (Ably, Pusher, socket.io with Redis adapter) or cluster-aware frameworks.

---

### 137. Scaling reads vs scaling writes?

**Scaling reads** is easier:
- Add read replicas; distribute read traffic.
- Add caching layers (Redis, CDN); serve cached data.
- Read replicas are cheap and can scale to handle 10× or 100× reads.

**Scaling writes** is harder:
- All writes go to the primary (for consistency).
- Limited by primary's write throughput (typically 10K–100K writes/sec for well-tuned systems).
- Strategies: Write batching (buffer and batch-insert), queue-based write absorption, sharding (distribute writes across multiple primaries), CQRS (separate write and read models).

**Asymmetry**: Most web applications read far more than they write. A 90/10 read/write split means read scaling buys 10× the benefit per unit of work compared to write scaling. Start with read scaling.

---

### 138. Cache-aside vs write-through cache?

**Cache-aside (lazy loading)**:
- On read: check cache. If hit, return. If miss, fetch from DB, store in cache, return.
- On write: update DB directly, invalidate (or update) cache entry.
- **Pros**: Cache only contains frequently-accessed data (no cold data wasting cache space). Simple to implement.
- **Cons**: Cache miss causes latency (DB fetch + cache write). Risk of stale data if invalidation fails.

**Write-through**:
- All writes go through the cache. Cache and DB are always in sync.
- On write: update cache, then write to DB.
- **Pros**: Cache is always fresh; no stale data problem. Read-heavy workloads always hit cache.
- **Cons**: Write latency includes cache write. Cache contains all written data, including rarely-read items.

**Rule of thumb**: Cache-aside for read-heavy workloads with occasional writes. Write-through for workloads requiring always-fresh cache (session data, configuration).

---

### 139. CDN vs backend caching?

**CDN (Content Delivery Network)**:
- Edge caching of static assets (JS, CSS, images) and cacheable HTTP responses.
- Geographically distributed — serves from a PoP close to the user, reducing latency.
- Best for: static assets, public API responses, images, video.
- Controlled via HTTP cache headers: `Cache-Control`, `Vary`, `ETag`.

**Backend caching (Redis, Memcached)**:
- In-memory caching of computed results, DB queries, session data.
- Shared across all application instances.
- Best for: expensive DB queries, session state, computed aggregates, frequently-read objects.
- Controlled by application code.

**Complementary, not competitive**: Use CDN for the outer caching layer (serving static and public content without reaching your servers) and backend caching for dynamic, personalized, or authenticated content.

---

### 140. Redis vs DynamoDB caching?

| Dimension | Redis | DynamoDB |
|---|---|---|
| Latency | Sub-millisecond (~0.1ms) | Single-digit ms (~1–5ms) |
| Data model | Rich (strings, hashes, sets, sorted sets, streams) | Key-value + nested attributes |
| Persistence | Optional (RDB/AOF) | Always durable |
| Durability | Not primary store (data loss risk without persistence) | Fully durable, replicated |
| Cost | Per instance size (memory) | Per request + storage |
| Max item size | 512MB (strings) | 400KB |
| TTL | Native support | Native support |
| Operations | Atomic operations (INCR, LPUSH, ZADD...) | ConditionalWrite |

**Use Redis for**: Session caching, rate limiting (sliding windows), leaderboards (sorted sets), pub/sub, real-time counters.

**Use DynamoDB for**: When you need durability + performance without managing Redis clusters, or when the data is too large/important to risk losing on Redis restart.

---

## Reliability & Resiliency

### 141. What is graceful degradation?

Graceful degradation means the system continues to function with reduced capabilities when components fail, rather than failing completely.

**Examples**:
- Search service down → show popular/trending results instead of personalized recommendations.
- Payment provider timeout → show "try again shortly" instead of crashing the checkout flow.
- Database replicas lagging → serve cached content for non-critical reads rather than returning errors.
- ML recommendation service down → fall back to rule-based recommendations.

**Implementation**:
- Define critical vs non-critical features.
- For non-critical features, implement fallbacks.
- Use circuit breakers with fallback behavior.
- Return partial responses rather than complete errors when some dependencies fail.

The goal: users experience reduced quality, not complete outage.

---

### 142. Explain retry storms.

See Q68 — expanded:

A retry storm is a distributed feedback loop where failures trigger widespread retries that amplify load on already-struggling services.

**Anatomy**:
1. Service B starts responding slowly (DB latency spike).
2. All clients to B time out and retry.
3. Retry doubles the request volume hitting B.
4. B gets more overwhelmed, slower still.
5. More timeouts, more retries — the system spirals.

**Why it's dangerous**: An otherwise survivable partial slowdown becomes a complete outage because the retry behavior multiplies the problem.

**Prevention**:
- Exponential backoff with full jitter (not synchronized retries).
- Circuit breakers (stop retrying when failure rate is high).
- Client-side rate limiting on retries.
- Server-side load shedding (accept reduced load, reject excess).

---

### 143. What is chaos engineering?

Chaos engineering is the practice of **intentionally introducing failures** in production (or production-like) environments to discover system weaknesses before they cause unplanned outages.

**Origin**: Netflix's Chaos Monkey randomly terminates EC2 instances in production — forcing engineers to build systems resilient enough to survive instance loss.

**Evolved practices**:
- Kill random instances (original chaos monkey).
- Inject network latency or packet loss between services.
- Simulate regional outages.
- Corrupt messages in queues.
- Fill disks.
- Kill database replicas.

**Process**:
1. Define "steady state" (normal behavior metrics).
2. Hypothesize that the system will maintain steady state under failure X.
3. Introduce failure X.
4. Compare results to hypothesis.
5. Fix vulnerabilities discovered.

**Tools**: Gremlin, Chaos Mesh (Kubernetes), AWS Fault Injection Simulator (FIS), Netflix's Chaos Monkey.

---

### 144. How do you design highly available systems?

High availability (HA) requires eliminating single points of failure and planning for component failures:

1. **Redundancy at every tier**: Multiple app servers, multiple DB nodes (primary + replicas), multiple AZs/regions.
2. **Automated failover**: No human action required to recover from component failure. Automated health checks, leader election, DNS failover.
3. **Load balancing**: Distribute traffic across multiple instances; health-check-based removal of failed instances.
4. **Stateless services**: Allows any instance to handle any request; failed instances are replaced seamlessly.
5. **Circuit breakers and fallbacks**: Prevent cascading failures when dependencies degrade.
6. **Regular failure drills**: Chaos engineering ensures the HA mechanisms actually work.
7. **Multi-AZ deployment**: Primary and replicas in different availability zones. Single-AZ failures don't cause outages.
8. **Health checks and self-healing**: Auto-scaling groups replace failed instances automatically.

Target: 99.99% availability = 52 minutes downtime/year.

---

### 145. Single point of failure examples?

A single point of failure (SPOF) is a component whose failure causes the entire system to fail:

- **Single database primary** with no replica or automated failover.
- **Single load balancer** with no redundant pair.
- **Single region deployment** — a cloud region outage takes down the whole system.
- **Shared configuration service** (etcd, Consul) with no redundancy.
- **Single authentication service** — if it's down, no user can log in.
- **Shared external DNS** with a single provider and no failover.
- **Single NAT gateway** in a VPC (all outbound traffic routes through it).
- **Hard-coded external service dependency** with no timeout or fallback.

**Discovery**: Draw a system diagram and trace: "what happens if X fails?" If the answer is "everything breaks," X is a SPOF.

---

### 146. Active-active vs active-passive?

**Active-passive (hot standby)**:
- One primary handles all traffic; one (or more) standbys are ready to take over.
- Standby is always synchronized but idle (or handling only reads).
- On primary failure: failover to standby (seconds to minutes).
- Simple, less complex, but wastes the standby's capacity.

**Active-active**:
- Multiple nodes all handle traffic simultaneously.
- Higher resource utilization; lower latency (route to nearest node).
- More complex: writes may hit different nodes, requiring conflict resolution or coordination.
- On node failure: remaining nodes absorb the failed node's traffic.

**Choosing**:
- Active-passive: simpler, for systems where conflict resolution is too complex (financial systems with strong consistency requirements).
- Active-active: for high-availability, latency-sensitive, geographically distributed systems where the complexity of conflict resolution is acceptable.

---

### 147. Multi-region deployment challenges?

- **Data replication latency**: Cross-region replication adds 50–200ms of latency. Strong consistency across regions is impractical for most workloads.
- **Data residency**: GDPR, CCPA, and local regulations may require data to remain in specific regions. User data from EU must stay in EU.
- **Split-brain risk**: Active-active writes to multiple regions risk conflicting writes being applied independently.
- **Failover complexity**: Routing DNS traffic, promoting a replica to primary, and draining existing connections must all happen automatically.
- **Cost**: Cross-region data transfer is expensive in most cloud providers (~$0.02/GB).
- **Consistency model choice**: Must explicitly choose CP (reject writes during partition → lower availability) or AP (accept potential inconsistency).
- **Schema migration complexity**: Migrations must be applied to all regions, often requiring careful ordering to avoid regional inconsistency.

---

### 148. Disaster recovery strategy?

A DR strategy defines how to recover from a catastrophic failure (regional outage, data corruption, ransomware):

**Tiers** (by cost and recovery time):

1. **Backup & Restore**: Periodic DB backups to S3/another region. RTO: hours. RPO: hours. Lowest cost.
2. **Pilot Light**: Core infrastructure is always running in DR region (DB replica, minimal compute). RTO: 10–30 minutes. RPO: minutes.
3. **Warm Standby**: A scaled-down but fully functional copy runs in DR region. RTO: minutes. RPO: seconds.
4. **Multi-Site Active-Active**: Full capacity in multiple regions simultaneously. RTO: near-zero. RPO: near-zero. Highest cost.

**Key activities**: Regular DR drills (test the plan, not just the theory), runbooks (step-by-step recovery procedures), automated failover where possible.

---

### 149. RPO vs RTO?

**RPO (Recovery Point Objective)**: How much data can you afford to lose? The maximum acceptable age of data at recovery.
- RPO = 0: No data loss (synchronous replication required).
- RPO = 1 hour: Can lose up to 1 hour of data (hourly backups are sufficient).

**RTO (Recovery Time Objective)**: How long can the system be down? The maximum acceptable time from failure to recovery.
- RTO = 5 minutes: Must be back online within 5 minutes.
- RTO = 4 hours: 4-hour outage is acceptable.

**Relationship to cost**: Lower RPO/RTO = higher cost. Achieving RPO = 0 requires synchronous replication; RTO = 0 requires active-active deployment. Not every system needs this.

**Setting targets**: Define per service, not globally. Your billing service may need RPO = 0 / RTO = 5 minutes. Your analytics dashboard may be fine with RPO = 24 hours / RTO = 4 hours.

---

### 150. How would you handle regional outage?

**Preparation**:
1. Multi-region deployment with automated failover.
2. Read replicas in DR region already synchronized.
3. DNS failover configured with low TTL (30–60 seconds).
4. Runbooks documented and tested.

**During outage**:
1. Monitoring alerts fire: health checks failing for affected region.
2. Automated failover (if configured): DNS updates to route to DR region; standby DB promoted.
3. If manual: Execute runbook. Update DNS. Promote DR DB.
4. Communicate via status page (hosted in a third region or CDN, not affected by the outage).

**After outage**:
1. Assess data loss (compare RPO to actual gap).
2. Perform any reconciliation of data written during the failover window.
3. Plan failback or operate from DR region long-term.
4. Post-mortem: root cause analysis, what failed in the DR plan, improvements.

---

## Cost Optimization

### 151. How would you reduce OpenSearch infra cost?

- **Right-size nodes**: Audit actual CPU/memory usage. Oversized instances are common. Downgrade to the appropriate instance type.
- **Reduce shard count**: Over-sharding is the #1 OpenSearch cost driver (see Q152). Fewer, larger shards are more efficient than many small ones.
- **Use UltraWarm/Cold storage**: Move indices older than N days to UltraWarm (S3-backed, 90% cheaper). Move even older to Cold storage.
- **Index lifecycle policies (ILM)**: Automate tier transitions. Automatically move hot → warm → cold → delete based on age.
- **Compression**: Enable `best_compression` codec on indices that aren't write-hot. Reduces storage by 2–3×.
- **Reserved instances**: 1-year RI for stable cluster capacity gives 30–40% discount.
- **Delete unused indices**: Old test indices, temp indices, one-time job indices accumulate. Regularly audit and delete.
- **Reduce replica count**: Default is 1 replica. For non-critical search indices, 0 replicas halves storage.

---

### 152. Why are too many shards expensive?

Each Elasticsearch/OpenSearch shard is an independent Lucene index. Costs of too many shards:

- **Memory overhead**: Each shard consumes ~10MB of heap regardless of data size. 10,000 shards = 100GB of heap just for overhead.
- **Cluster state overhead**: Every shard's metadata is stored in cluster state, which all nodes must hold in memory. Large shard counts bloat cluster state.
- **Search overhead**: A search query fans out to every shard. 1,000 shards = 1,000 concurrent Lucene searches per query. High CPU and coordination overhead.
- **Indexing overhead**: Each shard has an independent write path (translog, refresh, merge). More shards = more parallel write overhead.

**Guideline**: Target shard size of 10–50GB. Keep total shard count below ~1,000 per cluster for manageable overhead.

---

### 153. DynamoDB cost optimization strategies?

DynamoDB charges for RCU (Read Capacity Units), WCU (Write Capacity Units), and storage:

- **On-demand vs provisioned**: On-demand is convenient but 6–7× more expensive at steady traffic. For predictable workloads, use provisioned capacity.
- **Auto-scaling**: Set min/max provisioned capacity with auto-scaling. Handles traffic variation without over-provisioning.
- **Reserved capacity**: Purchase 1- or 3-year reserved capacity for 40–75% discount on predictable baseline load.
- **Optimize item sizes**: DynamoDB rounds up to the nearest 4KB for reads. Keep items small; avoid storing large blobs. Compress large attributes (Base64-encoded gzip).
- **Projection in GSIs**: Only project the attributes you query in each GSI. Unnecessary attribute projection wastes WCU on every write and storage.
- **Sparse indexes**: Use sparse GSIs (only items with the indexed attribute get an entry). Reduces GSI storage and write cost.
- **DAX (DynamoDB Accelerator)**: For read-heavy workloads, DAX caches reads in microseconds, dramatically reducing RCU consumption.
- **Batch operations**: Use `BatchWrite` and `BatchGet` to reduce per-request overhead.

---

### 154. Read-heavy vs write-heavy optimization?

**Read-heavy**:
- Aggressive caching (Redis, CDN, application-level).
- Read replicas to distribute load.
- Denormalization: pre-compute and store query results to avoid expensive joins.
- Materialized views.
- Index everything that's queried.
- CDN for static and semi-static content.

**Write-heavy**:
- Write buffering: batch multiple writes and apply in one operation.
- Queue-based write absorption: decouple writes from processing.
- Minimize indexes (each index adds write cost).
- LSM-tree based storage (Cassandra, RocksDB) optimized for writes.
- Write sharding: distribute writes across multiple primaries.
- Async writes for non-critical data (fire-and-forget to queue, process later).

---

### 155. Cold storage strategies?

**Data categorization**:
- **Hot** (frequently accessed, low latency required): Primary DB, Redis.
- **Warm** (occasionally accessed): Secondary DB, compressed DB, warm-tier object storage (S3 Intelligent Tiering).
- **Cold** (rarely accessed, access measured in hours): S3 Glacier, S3 Glacier Deep Archive.

**Implementation**:
- **Time-based tiering**: Automatically move data based on age (ILM in Elasticsearch, S3 lifecycle policies, custom DB archival jobs).
- **Access-frequency tiering**: S3 Intelligent Tiering automatically moves objects between tiers based on actual access patterns.
- **Data format**: On transition to cold storage, convert to a more efficient format (Parquet, ORC) for compressed columnar storage.

**Cost example**: S3 Standard: ~$0.023/GB/month. S3 Glacier: ~$0.004/GB/month. Glacier Deep Archive: ~$0.00099/GB/month. A 10TB cold dataset costs ~$10/month instead of $230/month.

---

### 156. How do caches reduce infra cost?

Caching reduces expensive operations:

- **Fewer DB reads**: Each DB query costs compute (CPU, IOPS). Cache hits cost a fraction — Redis reads are 100× cheaper than DB reads.
- **Reduced DB instances needed**: Fewer DB reads = DB can handle more traffic with the same hardware.
- **CDN offload**: A CDN serving 80% of requests means 80% fewer requests reaching your backend — directly proportional cost reduction.
- **DynamoDB RCU reduction**: DAX caches reduce DynamoDB RCU consumption, directly reducing cost.
- **Compute savings**: Less time spent on DB queries means application instances process more requests per second, reducing the number of instances needed.

**Cache cost vs savings**: A Redis cache (~$0.05/GB/hr) typically saves 10–100× its cost in reduced DB and compute spend for read-heavy workloads.

---

### 157. Why can over-indexing increase cloud bills?

- **Storage cost**: Each index is stored on disk (or SSDs). 20 indexes on a table can mean 5–10× the storage cost of the raw data.
- **Write IOPS**: Every write to a table updates all indexes. More indexes = more IOPS consumed per write = more I/O throughput purchased.
- **RDS instance sizing**: High write IOPS from index maintenance requires larger (more expensive) instance types with more I/O capacity.
- **Aurora storage billing**: Aurora charges for storage consumed. Indexes are included in storage billing.
- **Elasticsearch/OpenSearch**: Over-indexed fields inflate shard size, increasing node count needed and therefore cost.
- **DynamoDB GSIs**: Every GSI doubles write cost for the indexed attribute (WCU consumed for both the main table and the GSI).

---

### 158. Compression tradeoffs?

**Storage compression** (zstd, gzip, snappy, lz4):

| Algorithm | Ratio | CPU cost | Decompression speed | Use case |
|---|---|---|---|---|
| Snappy | 2–3× | Low | Very fast | General purpose, real-time |
| LZ4 | 2–3× | Very low | Fastest | High-throughput, low latency |
| Zstd | 3–5× | Medium | Fast | Storage efficiency |
| gzip | 3–5× | High | Slower | Static content, cold data |
| Brotli | 4–6× | Very high | Medium | HTTP assets |

**Tradeoffs**:
- Better compression ratio = more CPU at write time (and read time).
- Lower CPU cost = lower compression ratio (more storage).
- Compressing cached data saves memory but adds decompression latency on cache reads.
- Compressing DB storage reduces I/O at the cost of CPU for each read/write.

**When to compress**: Always compress cold data (high ratio, access is rare so decompression latency doesn't matter). Use lightweight compression (LZ4/Snappy) for hot data where decompression latency matters.

---

### 159. Spot instances vs reserved instances?

**Spot instances** (AWS/GCP equivalent):
- Spare cloud capacity at 60–90% discount.
- Can be terminated with 2-minute notice when capacity is reclaimed.
- Best for: fault-tolerant workloads (batch jobs, ML training, stateless web workers, CI/CD).
- Not suitable for: databases, stateful services, jobs requiring guaranteed completion.

**Reserved instances (RIs)**:
- Commit to 1 or 3 years in exchange for 30–70% discount vs on-demand.
- No interruption risk — capacity is guaranteed.
- Best for: stable, predictable workloads (production databases, core application servers).

**Savings Plans** (AWS): More flexible than RIs — commit to $/hr of compute usage rather than specific instance types. Applies across instance families and regions.

**Strategy**: Reserved for production steady-state capacity; spot for batch/variable workloads; on-demand for spikes beyond reserved capacity.

---

### 160. How do you estimate infra cost before launch?

**Step 1 — Capacity modeling**:
- Estimate expected requests per second (RPS) at launch and at target scale.
- Estimate data size: rows × average row size = storage needed.
- Model read/write ratio.

**Step 2 — Per-component sizing**:
- **Compute**: RPS × average CPU time per request ÷ CPU core capacity = cores needed. Add 30–40% headroom.
- **Database**: Write RPS × avg write size = I/O throughput. Peak connections = max concurrent users / connection pool size.
- **Cache**: Working set size (hot data that fits in cache) determines Redis instance size.
- **Network**: Estimate ingress/egress bandwidth. P99 payload size × RPS = throughput.

**Step 3 — Cloud pricing calculators**:
- AWS Pricing Calculator, GCP Pricing Calculator.
- Build out the architecture with estimated sizes and get monthly estimates.

**Step 4 — Load test validation**:
- Run a load test at target scale (even at 10% scale and extrapolate).
- Measure actual CPU, memory, DB connections, IOPS under load.
- Adjust estimates based on actual profiling data.

**Step 5 — Add headroom and error margin**:
- Build in 2× headroom for auto-scaling lag.
- Add 20–30% contingency for unknown unknowns.
- Model steady-state vs peak (use reserved for steady-state, on-demand/spot for peak overhead).

---

*End of Document — 160 Questions Answered*