# Kafka: Complete Interview Guide (Senior SDE to Staff Engineer)

> Covers fundamentals, internals, trade-offs, real-world examples, and system design.  
> Questions 1–70, answered in depth.

---

## Table of Contents

1. [Fundamentals (Q1–Q10)](#fundamentals)
2. [Partitioning & Ordering (Q11–Q18)](#partitioning--ordering)
3. [Producer Internals (Q19–Q30)](#producer-internals)
4. [Consumer Internals (Q31–Q40)](#consumer-internals)
5. [Rebalancing (Q41–Q45)](#rebalancing)
6. [Delivery Guarantees (Q46–Q50)](#delivery-guarantees)
7. [Bonus: Senior/Staff Follow-ups (Q51–Q70)](#bonus-seniorstaff-follow-ups)

---

# Fundamentals

---

## Q1. What problem does Kafka solve?

### The Core Problem

Modern distributed systems have dozens of services that need to communicate with each other. A naive approach is to wire them together directly — Service A calls Service B, which calls Service C. This works for simple cases, but breaks down in production.

Kafka solves the problem of **reliable, high-throughput, decoupled communication between services at scale**.

---

### Why Not DB Polling?

A common (and painful) pattern in legacy systems:

```
Service A writes an event into a `events` table in a database.
Service B, C, D all poll this table every few seconds.
```

**Problems with DB polling:**

1. **Thundering herd**: Multiple services hammering the DB with `SELECT` queries every N seconds creates massive read load, especially as the number of consumers grows.
2. **Latency**: Polling introduces inherent delay. If you poll every 5 seconds, your average latency is 2.5 seconds — unacceptable for real-time systems.
3. **State management is messy**: You need extra columns like `processed_at`, `locked_by`, `status` to track who processed what. This pollutes your data model.
4. **No replay**: Once you mark a record as processed, replaying it (e.g., for a new service, a bug fix) is extremely difficult.
5. **Tight coupling via DB schema**: The producing service owns the DB, but consuming services are tightly coupled to its schema.
6. **Scalability ceiling**: A relational DB is not designed for high-throughput sequential reads from multiple concurrent consumers.

---

### Why Not Direct Service-to-Service Communication?

```
OrderService → PaymentService (HTTP/gRPC)
             → InventoryService (HTTP/gRPC)
             → NotificationService (HTTP/gRPC)
```

**Problems:**

1. **Temporal coupling**: If PaymentService is down when OrderService tries to call it, the order fails. The availability of the caller depends on the availability of the callee.
2. **Cascading failures**: A slow PaymentService causes threads in OrderService to pile up, eventually crashing OrderService too.
3. **Fan-out complexity**: If OrderService needs to notify 10 downstream services, it now has to manage 10 HTTP calls — retries, timeouts, partial failures.
4. **No replay**: If InventoryService was down for 2 hours, there's no built-in way to replay events it missed.
5. **Tight coupling**: OrderService needs to know the address, contract, and availability of every downstream service.
6. **No ordering guarantees**: Concurrent HTTP calls arrive in arbitrary order.

---

### Event Streaming Benefits (What Kafka Gives You)

Kafka is a **distributed, append-only, replicated log**. Producers write events to Kafka. Consumers read from Kafka at their own pace.

| Benefit | Description |
|---|---|
| **Decoupling** | Producers don't know about consumers. New consumers can be added without changing producers. |
| **Durability** | Events are persisted to disk and replicated. A consumer going down for hours can catch up. |
| **Replay** | Any consumer can rewind to any offset and re-read past events — great for new services or bug recovery. |
| **High Throughput** | Kafka handles millions of events/sec via sequential disk writes, batching, and zero-copy. |
| **Ordering** | Within a partition, ordering is guaranteed. |
| **Backpressure handling** | Consumers read at their own pace. A slow consumer doesn't slow down the producer. |
| **Fan-out** | Multiple consumer groups independently consume the same topic without affecting each other. |
| **Event sourcing** | Kafka's log is the source of truth — you can reconstruct any state by replaying events. |

**Real-world example**: Uber uses Kafka to process millions of trip events per second — location updates, ride requests, payment events — all decoupled so each service (surge pricing, driver matching, ETA calculation) consumes independently.

---

## Q2. Explain Kafka Architecture

Kafka's architecture has these key components:

```
                         Kafka Cluster
                    ┌────────────────────────┐
Producer ──────────►│  Broker 1  Broker 2    │
                    │   (Leader) (Follower)   │
Producer ──────────►│                        │
                    │  Topic: orders          │
                    │  Partition 0 [log]      │
                    │  Partition 1 [log]      │
                    └────────────────────────┘
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
        Consumer Group A  Consumer Group B  Consumer Group C
        (PaymentSvc)       (InventorySvc)    (Analytics)
```

---

### Producer

The **producer** is any application that writes (publishes) messages to a Kafka topic. The producer decides:
- Which topic to write to.
- Which partition within that topic (based on key, round-robin, or custom logic).
- Acknowledgment requirements (acks).
- Batching and compression settings.

Producers are **push-based** — they push data into Kafka.

---

### Broker

A **broker** is a single Kafka server. It:
- Stores partitions (segments of the append-only log) on disk.
- Handles producer write requests.
- Handles consumer fetch requests.
- Manages replication between brokers.

Each broker has a unique `broker.id`. In production, you typically run 3, 5, or more brokers for fault tolerance.

---

### Topic

A **topic** is a logical channel or category of events. Think of it like a database table name, but for streams. Topics are:
- **Multi-producer**: Many producers can write to the same topic.
- **Multi-consumer**: Many consumer groups can read from the same topic independently.
- **Durable**: Messages are retained for a configured time period (e.g., 7 days) regardless of consumption.

Example topics: `order-created`, `payment-processed`, `user-activity`, `inventory-updates`.

---

### Partition

A **partition** is the unit of parallelism and storage in Kafka. Each topic is split into one or more partitions. Each partition is:
- An **ordered, immutable sequence of messages** (append-only log).
- Stored on disk on a broker.
- **Replicated** across multiple brokers for fault tolerance.
- Identified by `topicName-partitionNumber` (e.g., `orders-0`, `orders-1`).

Partitions enable horizontal scalability — more partitions = more parallelism.

---

### Consumer

A **consumer** is any application that reads messages from a Kafka topic. Consumers are **pull-based** — they poll Kafka for new messages. Each consumer tracks its position in a partition via an **offset**.

---

### Consumer Group

A **consumer group** is a group of consumers that collectively consume a topic. Kafka ensures each partition is consumed by exactly one consumer within a group. This enables:
- **Parallel processing**: Different consumers in the group process different partitions simultaneously.
- **Independent consumption**: Multiple consumer groups can consume the same topic fully and independently.

---

### Controller

The **controller** is a special broker elected to manage cluster-level metadata:
- Tracking which brokers are alive.
- Performing leader elections for partitions when a broker dies.
- Managing partition assignments.

In KRaft mode (Kafka 3.x), the controller is a dedicated Raft-based quorum. In legacy ZooKeeper mode, one of the brokers is elected as controller via ZooKeeper.

---

## Q3. What is a Topic?

A topic is Kafka's fundamental abstraction for organizing event streams.

**Analogy**: If Kafka is a database, a topic is a table. If Kafka is a filesystem, a topic is a directory.

Key characteristics:
- **Named**: Topics have human-readable names like `payments`, `user-signups`, `sensor-readings`.
- **Append-only**: Messages are only added, never updated or deleted (until retention expires or compaction runs).
- **Ordered within partitions**: Messages in a single partition are strictly ordered by offset.
- **Configurable retention**: You can retain messages by time (`retention.ms`) or by size (`retention.bytes`).
- **Configurable partitioning**: You choose how many partitions a topic has at creation time.
- **Configurable replication**: You choose the replication factor (how many copies of each partition exist).

**Real-world example**:
```
Topic: order-events
  Partition 0: [OrderCreated(1), OrderShipped(3), OrderDelivered(7)]
  Partition 1: [OrderCreated(2), OrderCancelled(4)]
  Partition 2: [OrderCreated(5), OrderCreated(6)]
```

---

## Q4. What is a Partition?

### Definition

A partition is the fundamental storage and parallelism unit in Kafka. It is an **ordered, immutable, append-only log of messages**.

```
Partition 0:
Offset:  0        1         2         3         4
       [msg_a] [msg_b]  [msg_c]  [msg_d]  [msg_e]
                                                  ← new messages append here
```

### Why Partitioning Exists

1. **Scalability**: A single machine has limited disk space and network throughput. By splitting a topic into many partitions, you can spread the data and load across many brokers.
2. **Parallelism**: Multiple consumers in a group can each process a different partition simultaneously. Without partitions, only one consumer could read from a topic at a time.
3. **Throughput**: Producers can write to multiple partitions in parallel.

**Formula**: `Max consumer parallelism = number of partitions`

If you have 12 partitions, you can have at most 12 active consumers in a group processing them in parallel.

### Parallelism vs Ordering Trade-off

This is one of the most important trade-offs in Kafka:

| Characteristic | More Partitions | Fewer Partitions |
|---|---|---|
| Throughput | Higher (more parallelism) | Lower |
| Consumer parallelism | Higher | Lower |
| Ordering scope | Per-partition only | Easier to reason about |
| Memory/file handles | More (each partition = files) | Less |
| Rebalance time | Longer | Shorter |
| End-to-end latency | Can be lower | Can be higher |

**Key insight**: Kafka only guarantees ordering **within a partition**. If OrderCreated and OrderShipped for the same order end up in different partitions, you have no ordering guarantee between them. The solution is to use a **partition key** (like `orderId`) so all events for the same entity always land in the same partition.

### Partition Internals

Each partition maps to a **directory** on the broker's filesystem:

```
/kafka-logs/
  orders-0/          ← Partition 0 of topic 'orders'
    00000000000000000000.log     ← Segment file (actual messages)
    00000000000000000000.index   ← Offset index
    00000000000000000000.timeindex ← Timestamp index
    00000000000000004096.log     ← Next segment
    ...
  orders-1/          ← Partition 1
  orders-2/          ← Partition 2
```

---

## Q5. How Does Kafka Store Messages Internally?

### Append-Only Log

At its core, Kafka's storage model is a **append-only log**. New messages are always written to the end. Existing messages are never modified. This design is fundamental to Kafka's performance and simplicity.

Why append-only?
- **Sequential writes are fast**: HDDs and SSDs are dramatically faster for sequential writes vs random writes. Sequential disk writes can approach memory speeds.
- **Simple offset arithmetic**: Because messages are never moved, the offset is both the identity and the position of a message.
- **Safe concurrent access**: Multiple readers can read from any offset without locks. Only one writer appends to the tail.

### Segment Files

A partition is not stored as one giant file. It is split into **segments** — rolling files of a configurable size (default: 1 GB) or age (default: 7 days).

```
orders-0/
  00000000000000000000.log   ← Segment starting at offset 0
  00000000000000001024.log   ← Segment starting at offset 1024
  00000000000000002048.log   ← Active (current) segment
```

The filename is the **base offset** of the first message in that segment.

Why segments?
- **Efficient deletion**: When a segment ages past `retention.ms`, Kafka deletes the entire segment file — a single OS `delete` call, not record-by-record deletion.
- **Log compaction**: Compaction can be done per-segment.
- **Manageability**: Working with many smaller files is more practical than one enormous file.

**Active segment**: The last segment is the active one — the only one receiving writes. All previous segments are immutable.

### Index Files

For each `.log` segment, Kafka maintains two index files:

1. **`.index` (Offset Index)**: Maps logical offsets to physical byte positions within the `.log` file. This is a **sparse** index — not every offset is indexed, only every `log.index.interval.bytes` (default: 4096 bytes). When a consumer requests offset N, Kafka binary-searches the index to find the nearest indexed offset, then scans forward from there.

2. **`.timeindex` (Timestamp Index)**: Maps timestamps to offsets. Used when consumers want to start consuming from a specific time (e.g., "give me all messages since yesterday 3pm").

```
.index file (sparse):
Offset 0    → byte position 0
Offset 100  → byte position 5120
Offset 200  → byte position 10240
...
```

Both index files are **memory-mapped**, so lookups are extremely fast — the OS maps the file into virtual memory and accesses it like an array.

### Message Format (Record Batch)

Messages are stored in **record batches** (introduced in Kafka 0.11):

```
RecordBatch:
  baseOffset: 100
  batchLength: 512
  magic: 2
  attributes: compression=SNAPPY, timestampType=CREATE
  lastOffsetDelta: 4       ← 5 records in this batch (offsets 100-104)
  firstTimestamp: 1672531200000
  maxTimestamp: 1672531200500
  producerId: 5001         ← for idempotent/transactional producers
  producerEpoch: 1
  Records:
    [offset_delta=0, key=order-1, value=<bytes>, headers=[]]
    [offset_delta=1, key=order-2, value=<bytes>, headers=[]]
    ...
```

This batch format enables efficient compression and reduces per-message overhead.

---

## Q6. How Does Kafka Achieve High Throughput?

Kafka is famously capable of millions of messages per second. Here's how:

### 1. Sequential Disk Writes

Modern storage systems (both HDD and SSD) have dramatically different performance for sequential vs random I/O:

- HDD sequential write: ~100-200 MB/s
- HDD random write: ~0.1-1 MB/s (100-200x slower!)
- SSD sequential write: ~500-3000 MB/s
- SSD random write: ~10-100 MB/s

Kafka **only ever writes sequentially** — always appending to the end of the active segment. This makes Kafka competitive with in-memory systems on throughput even while writing to disk.

### 2. OS Page Cache

Kafka does not manage its own memory cache. Instead, it deliberately relies on the **OS page cache** (also called the buffer cache).

When Kafka writes a message to disk, the OS doesn't immediately flush it to the physical disk. Instead:
1. The write goes to the page cache (RAM) first.
2. The OS asynchronously flushes dirty pages to disk in the background.
3. When a consumer reads a recent message, it's likely still in the page cache — a **RAM read**, not a disk read.

Benefits:
- **Producers and consumers share the cache**: If a consumer is near the tail (processing recent messages), it reads from cache, not disk.
- **JVM heap is not consumed**: Kafka's Java process doesn't hold data in its heap. This means small GC pressure and large effective cache using all available RAM.
- **Simplicity**: No double-buffering (data isn't stored both in Kafka's memory and the OS cache).

This is why Kafka recommends giving the machine plenty of RAM even though Kafka's JVM heap is small (usually 4-8 GB) — the rest of the RAM becomes OS page cache.

### 3. Zero-Copy

Traditional server read flow (without zero-copy):
```
Disk → Kernel buffer → User space (app memory) → Kernel socket buffer → NIC
         (copy 1)          (copy 2)                   (copy 3)
```

Kafka's read flow with zero-copy (`sendfile()` system call):
```
Disk → Kernel buffer → NIC
         (copy 1 — but stays in kernel space)
```

The `sendfile()` system call transfers data from a file descriptor to a socket descriptor entirely within the kernel. The data **never crosses into user space**. This eliminates 2 out of 3 copies and 2 context switches.

This is huge for consumers: Kafka reads a segment file and sends it over the network without any data touching Kafka's JVM process memory. Benchmark studies show zero-copy can improve throughput by 2-4x for network-bound workloads.

**Note**: Zero-copy only works when messages are uncompressed at the broker level (i.e., the broker doesn't need to decompress-then-recompress). If end-to-end compression is used, the broker can pass compressed batches through as-is.

### 4. Batching

Both producers and consumers work in batches:

**Producer batching**: The producer accumulates messages in memory (`RecordAccumulator`) and sends them as a batch. Config:
- `linger.ms`: How long to wait to accumulate a batch (default: 0ms = send immediately).
- `batch.size`: Maximum bytes in a batch (default: 16KB).

**Consumer batching**: Each `poll()` returns up to `max.poll.records` (default: 500) messages at once. The consumer processes them all before the next poll.

**Compression of batches**: Compression is applied at the batch level, which is far more effective than compressing individual messages (compression algorithms benefit from repetition across messages).

**Broker to broker replication**: Followers fetch from leaders in batches too.

Summary of throughput techniques:

| Technique | Mechanism | Benefit |
|---|---|---|
| Sequential writes | Append-only log | 100-200x faster than random writes |
| Page cache | OS buffer cache | Recent reads from RAM, not disk |
| Zero-copy | `sendfile()` syscall | Eliminates 2 copies + 2 context switches |
| Batching | Group messages | Amortizes per-message overhead |
| Compression | Batch-level | Reduces network & disk I/O by 3-10x |

---

## Q7. What is a Broker?

A broker is a single Kafka server process running on a machine. It is responsible for:

1. **Storing partitions**: Each broker stores a subset of all topic partitions on its local disk.
2. **Serving producers**: Accepting write requests from producers for partitions it leads.
3. **Serving consumers**: Responding to fetch requests from consumers for partitions it leads or follows.
4. **Replication**: Leader brokers replicate new messages to follower brokers. Follower brokers actively pull from leaders.
5. **Metadata management**: Brokers advertise their state and partition leadership to the cluster's metadata system (ZooKeeper or KRaft controller).

Each broker is identified by a unique integer `broker.id` (e.g., 1, 2, 3).

**Stateless in terms of consumer tracking**: Brokers don't track which consumer consumed what. Consumer offsets are stored in the special `__consumer_offsets` topic (which itself is replicated). This makes Kafka brokers more horizontally scalable.

---

## Q8. What is a Cluster?

A Kafka cluster is a group of brokers working together to collectively store and serve topics.

```
Kafka Cluster (3 brokers)
┌─────────────────────────────────────────┐
│  Broker 1          Broker 2          Broker 3  │
│  orders-0 (L)      orders-0 (F)      orders-0 (F) │
│  orders-1 (F)      orders-1 (L)      orders-1 (F) │
│  orders-2 (F)      orders-2 (F)      orders-2 (L) │
│                                             │
│  (L) = Leader, (F) = Follower               │
└─────────────────────────────────────────┘
```

Key cluster properties:
- **Horizontal scalability**: Add brokers to increase capacity and throughput.
- **Fault tolerance**: With replication factor 3, the cluster can survive 2 broker failures.
- **Load distribution**: Partition leaders are spread across brokers so no single broker is a bottleneck.
- **Single logical entity**: From the client's perspective, it's one cluster accessible via any broker (bootstrap servers).

**Cluster sizing guidelines**:
- Development: 1 broker (no HA)
- Production minimum: 3 brokers (can survive 1 failure with RF=3)
- High throughput: 5+ brokers
- LinkedIn, Uber scale: thousands of brokers across multiple data centers

---

## Q9. What is Replication?

Replication is Kafka's mechanism for fault tolerance and high availability. Each partition has a configurable **replication factor** (RF). If RF=3, there are 3 copies of every message — one on the leader broker and two on follower brokers.

### How Replication Works

1. Producer writes to the **partition leader** (the broker currently responsible for this partition).
2. The leader appends the message to its local log.
3. Follower brokers **actively pull** (fetch) new messages from the leader — similar to how a consumer would.
4. The leader tracks which followers are "in-sync" (up to date) — this is the **ISR (In-Sync Replica) set**.
5. Based on the producer's `acks` setting, the leader may wait for followers to acknowledge before responding to the producer.

### Why Replication Matters

Without replication, a broker failure means data loss. With RF=3:
- **1 broker failure**: System continues normally (2 copies remain).
- **2 broker failures**: System continues with reduced redundancy (1 copy remains).
- **3 broker failures**: Data loss risk for the affected partitions.

### Configuring Replication

```properties
# Topic-level config
replication.factor=3

# Broker-level config
default.replication.factor=3

# How many in-sync replicas must acknowledge a write
min.insync.replicas=2
```

**Trade-off**: Higher replication factor = more durability + more disk usage + more network traffic + slightly higher write latency.

---

## Q10. What is a Leader and Follower Replica?

### Leader Replica

The leader replica for a partition is the **single authoritative copy** that:
- Handles all **producer writes** for that partition.
- Handles all **consumer reads** for that partition.
- Maintains the **ISR list** — tracking which followers are current.
- Sends new messages to followers (followers pull from leader).

Every partition has exactly one leader at any given time.

### Follower Replica

A follower replica:
- **Passively replicates** the leader by pulling (fetching) new messages.
- Does **not** serve producer or consumer requests directly (by default).
- Is a **hot standby** — ready to become the new leader if the current leader dies.
- Is in the ISR if its replica lag is within `replica.lag.time.max.ms` (default: 30 seconds).

### Why This Design?

Having a single leader for all reads and writes:
- **Simplifies consistency**: No need for consensus on every read. The leader is the truth.
- **Predictable performance**: Consumers always know where to fetch from.
- **Clear failover semantics**: Leader election is simple — pick the best ISR member.

**Trade-off**: Kafka 2.4+ introduced **follower fetching** (`replica.selector.class`) which allows consumers to read from the nearest replica (geographically), reducing cross-AZ data transfer costs. This is an opt-in feature.

---

# Partitioning & Ordering

---

## Q11. How Does Kafka Decide Which Partition Receives a Message?

This is a critical topic because the choice determines parallelism, ordering, and load distribution.

### Case 1: Message Has a Key

If the producer specifies a key, Kafka uses the **DefaultPartitioner** which computes:

```
partition = hash(key) % numPartitions
```

Specifically, it uses **MurmurHash2** on the serialized key bytes:

```java
partition = Utils.toPositive(Utils.murmur2(keyBytes)) % numPartitions
```

**Why this matters**: All messages with the same key always go to the same partition. This is the mechanism for ordering — if you use `orderId` as the key, all events for a given order land in the same partition and are therefore ordered.

**Watch out**: If you increase the partition count later, the hash function gives different results. `hash(key) % 12 ≠ hash(key) % 24`. Existing keys may be routed to different partitions. See Q16.

### Case 2: No Key (null key) — Round Robin (Legacy) or Sticky Partitioner (Current)

**Pre-Kafka 2.4 (DefaultPartitioner with null key)**: Pure round-robin — messages distributed evenly one by one: partition 0, 1, 2, 0, 1, 2...

**Kafka 2.4+ (StickyPartitioner)**: The sticky partitioner fills up a batch for one partition before switching to the next. This **dramatically improves batching efficiency** because:
- Sending many small batches to many partitions = high overhead.
- Sending one full batch to one partition = efficient.

After filling a batch (or after `linger.ms` expires), the sticky partitioner randomly picks a new partition.

### Case 3: Custom Partitioner

You can implement `org.apache.kafka.clients.producer.Partitioner` and specify `partitioner.class` in producer config:

```java
public class GeographicPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                         Object value, byte[] valueBytes, Cluster cluster) {
        String region = extractRegion(key);
        // US orders → partition 0-3, EU orders → partition 4-7, APAC → 8-11
        return getPartitionForRegion(region, cluster.partitionCountForTopic(topic));
    }
}
```

**Use cases for custom partitioners**:
- Geographic routing (EU data stays in EU partitions, consumed by EU consumers).
- VIP/priority routing (premium customers' events go to dedicated partitions with dedicated consumers).
- Preventing hot partitions (see Q18).

---

## Q12. How is Ordering Guaranteed in Kafka?

### The Core Guarantee

Kafka guarantees **total ordering within a single partition**. Messages in a partition are assigned monotonically increasing offsets and are always read in that order.

```
Partition 0, Topic: order-events
Offset: 0          1            2           3
       [Created]  [PaymentOK]  [Shipped]  [Delivered]
       (orderId=A) (orderId=A) (orderId=A) (orderId=A)

Consumers ALWAYS see: Created → PaymentOK → Shipped → Delivered
```

### The Mechanism

1. **Producer serialization within a batch**: Within a single `send()` call, messages are assigned sequence numbers by the idempotent producer protocol.
2. **Broker enforces order**: The broker's append-only log maintains offset order.
3. **Consumer reads sequentially**: The consumer always fetches from the last committed offset forward, never backwards (unless explicitly seeking).

### The Key-Based Strategy

To get ordering for a specific entity (order, user, device), use that entity's ID as the **message key**:

```java
ProducerRecord<String, OrderEvent> record = new ProducerRecord<>(
    "order-events",
    orderId,      // ← key: ensures same partition
    orderEvent    // ← value
);
producer.send(record);
```

All events for `orderId=123` hash to the same partition. Within that partition, they're ordered. Consumer processes them in order.

---

## Q13. When Does Kafka NOT Guarantee Ordering?

### Across Partitions

Kafka gives **zero ordering guarantees across partitions**. If two messages for the same entity end up in different partitions (due to different keys or null keys), Kafka makes no promise about their relative order from a consumer's perspective.

### Scenario 1: No Key Used

```java
producer.send(new ProducerRecord<>("events", null, event1)); // → Partition 0
producer.send(new ProducerRecord<>("events", null, event2)); // → Partition 1
```

Even though event1 was sent before event2, the consumer group might process event2 (from partition 1) before event1 (from partition 0).

### Scenario 2: Retries Without Idempotent Producer

If the producer sends message A, then message B, then A fails and is retried:

```
Send: A → B → (A retry)
Delivered order: B → A   ← WRONG!
```

Without `enable.idempotence=true` and with `max.in.flight.requests.per.connection > 1`, retries can reorder messages even within a partition.

**Fix**: Set `enable.idempotence=true`. This automatically sets:
- `max.in.flight.requests.per.connection=5` (Kafka guarantees ordering with up to 5 in-flight requests for idempotent producers)
- `acks=all`
- Retries to `Integer.MAX_VALUE`

### Scenario 3: Multiple Producers to Same Partition

Two producers both writing to partition 0 with interleaved sends — there's no global ordering between them unless orchestrated externally.

### Scenario 4: Consumer Group with Multiple Consumers

Two consumers in the same group, each processing a different partition. There's no coordination on the order events are processed across partitions.

---

## Q14. If OrderCreated and OrderDeleted Events Arrive Out of Order, How Would You Fix It?

This is a classic system design problem asked at senior levels.

### Why This Happens

Scenario: OrderService sends `OrderCreated` then `OrderDeleted` for orderId=42. But if they land in different partitions (because no key is used), or because of retries, the consumer might process `OrderDeleted` before `OrderCreated`.

### Fix 1: Use OrderId as Partition Key (Primary Fix)

```java
// Producer side
producer.send(new ProducerRecord<>("order-events", orderId, event));
```

This ensures `OrderCreated` and `OrderDeleted` for the same orderId always land in the same partition and are strictly ordered by offset.

### Fix 2: Include a Sequence Number / Version in the Event

Even if you've used a partition key, add a monotonic sequence number or version to each event:

```json
{
  "orderId": "42",
  "eventType": "OrderDeleted",
  "version": 2,
  "timestamp": 1672531300000
}
```

Consumer logic:

```java
long currentVersion = stateStore.getVersion(orderId);
if (event.version <= currentVersion) {
    // Already processed a newer event — skip or handle as idempotent
    return;
}
stateStore.updateVersion(orderId, event.version);
processEvent(event);
```

### Fix 3: Use Event Timestamps + Out-of-Order Buffer

For systems where strict ordering isn't always achievable (e.g., mobile events with clock skew), maintain a small in-memory buffer:

```java
// Buffer events for up to 5 seconds
buffer.add(event);
List<Event> readyEvents = buffer.drainExpired(5, TimeUnit.SECONDS);
readyEvents.sort(Comparator.comparingLong(Event::getTimestamp));
readyEvents.forEach(this::process);
```

This adds latency but handles cases like mobile app events that arrive with delay.

### Fix 4: Use a State Machine + Compensating Events

Design your consumer with a state machine:

```
States: CREATED → PAID → SHIPPED → DELIVERED
                ↘ CANCELLED

If OrderDeleted arrives before OrderCreated:
  - Store OrderDeleted in pending state
  - When OrderCreated arrives, apply both in correct order
```

### Fix 5: Enable Idempotent Producer

```properties
enable.idempotence=true
max.in.flight.requests.per.connection=5
acks=all
```

This prevents retry-induced reordering within a partition.

### Best Practice Combination

```
Partition key = orderId          ← Ensures same partition
Event version field              ← Consumer can detect out-of-order
Idempotent producer              ← Prevents retry reordering
Consumer state machine           ← Handles business logic ordering
```

---

## Q15. Why Should Related Events Use the Same Partition Key?

**The short answer**: Because Kafka only guarantees ordering within a single partition. If you want events about the same entity (order, user, transaction) to be processed in order, they must be in the same partition.

**Deeper reasoning**:

1. **Consumer assignment**: One consumer in a group processes one partition. If events for user-123 span multiple partitions, they might be processed by multiple consumers simultaneously, creating race conditions.

2. **Stateful processing is simpler**: If all events for customer-456 go to partition 3, the consumer processing partition 3 can maintain local state for customer-456 without sharing or locking.

3. **Aggregation accuracy**: If you're building a stream aggregate (e.g., "sum of all payments for user X"), all payment events for user X must be in the same partition so one consumer accumulates them correctly. If they're spread, you'd need a distributed aggregation layer (like Kafka Streams, Flink).

4. **Causal consistency**: `UserRegistered` must be processed before `UserProfileUpdated`. Same partition key ensures same partition, ensures ordered delivery.

**Real-world example**: Stripe's payment system uses `customerId` as the partition key for payment events. All charges, refunds, and disputes for a customer flow through the same partition, making fraud detection and balance calculation straightforward.

---

## Q16. What Happens If Partition Count is Increased Later?

This is a gotcha that trips up many engineers.

### What Changes

The DefaultPartitioner computes: `partition = hash(key) % numPartitions`

Before increase: `hash("order-42") % 10 = 7` → Partition 7
After increase to 20: `hash("order-42") % 20 = 13` → Partition 13

**All new messages** with key `"order-42"` now go to partition 13. But all **historical messages** for `"order-42"` are still in partition 7.

### Consequences

1. **Ordering broken for existing keys**: New events for `order-42` land in a different partition than historical events for `order-42`. If a consumer replays from the beginning, it won't see a consistent ordered stream for that key.

2. **Stateful processors are confused**: A Kafka Streams job that joins events by key now sees the key split across two partitions.

3. **Consumer state is invalidated**: Any state derived from the "all events for key X are in partition Y" assumption is now wrong.

### Why Kafka Doesn't Have Auto-Repartitioning

Repartitioning existing data would be extremely expensive (read all data, rehash, write to new partitions) and would violate the immutability of existing offsets. Kafka intentionally leaves this as an operational concern.

### Mitigation Strategies

1. **Choose partition count wisely upfront**: Overestimate. It's better to have 100 partitions (even with only 5 consumers initially) than to repartition later. Empty partitions have minimal cost.

2. **Use a custom partitioner that's partition-count-aware**: Some teams use consistent hashing that maps keys to partitions in a stable way even after partition count changes. However, this is complex.

3. **Use a topic migration strategy**:
   - Create a new topic with the desired partition count.
   - Dual-write to both old and new topics during migration.
   - Migrate consumers to the new topic.
   - Retire the old topic.

4. **Kafka Streams repartition topics**: If you're using Kafka Streams, it creates internal repartition topics automatically when needed (e.g., after a `groupByKey` with a changed partitioner).

**Rule of thumb**: Plan your partition count for 6-12 months of growth. Use the formula: `partitions = max(throughput_target / single_partition_throughput, expected_max_consumers * 2)`.

---

## Q17. How Does Repartitioning Affect Ordering?

Repartitioning inherently **breaks per-key ordering** during and after the migration. Here's the detailed impact:

### During Migration (Dual-Write Period)

```
Time T1: Events 1-100 for key K in Partition 3 (old topic)
Time T2: Events 101-200 for key K in Partition 7 (new topic, different hash)
```

Consumers of the old topic and the new topic are processing different subsets of events for key K. You cannot get a globally ordered view of key K's events without special handling.

### Ordering Recovery Strategies

1. **Drain old topic first**: Before switching consumers to the new topic, ensure all consumers of the old topic have processed all messages. Only then switch. This gives a clean cutover with no concurrent processing of the same key in two places.

2. **Use a sequence number in the message**: The consumer can reorder by sequence number regardless of partition.

3. **Snapshot + replay**: Take a state snapshot when all consumers have caught up to offset X in the old topic. Load the snapshot into consumers for the new topic. Now consumers on the new topic only need to process events that were produced after the migration started.

4. **Accept temporary inconsistency**: For some use cases (analytics, metrics), brief ordering violations during migration may be acceptable. Record the migration timestamp and handle edge cases in application logic.

---

## Q18. What Are Hot Partitions?

### Definition

A hot partition is a partition that receives **disproportionately more messages** than other partitions, causing one broker/consumer to be overloaded while others are idle.

### Causes

1. **Skewed key distribution**: If 90% of orders come from 10 large enterprise customers (VIP keys), and those keys hash to the same partition, that partition gets 90% of the load.

2. **Very few unique keys**: If you use a low-cardinality key like `country_code` (`US`, `EU`, `APAC`), and 80% of traffic is `US`, then the US partition is hot.

3. **Null key with legacy round-robin**: Round-robin distributes messages evenly, but if one consumer is much slower than others, its partition queue grows while others are idle (this is a consumer hot partition, not a producer one).

4. **Time-based keys**: If you use something like `hour_of_day` as a key, during peak hours, one partition is overwhelmed.

### Consequences

- **Producer side**: The hot partition's network buffer fills up, causing backpressure on the producer. Other partitions are underutilized.
- **Consumer side**: The consumer assigned to the hot partition can't keep up, accumulating consumer lag. Other consumers are idle.
- **Broker side**: The broker holding the hot partition leader experiences high CPU, network, and disk I/O.

### Solutions

1. **Salting the key**: Add a random suffix to hot keys:

```java
// Instead of: key = "US"
// Use: key = "US-" + random.nextInt(numSalts)  // e.g., "US-0", "US-1", "US-2"
```

This spreads `US` events across `numSalts` partitions. **Downside**: You lose global ordering for the US key — `US-0` and `US-1` are in different partitions.

2. **Custom Partitioner**: Detect known hot keys and distribute them across multiple "hot key buckets":

```java
public int partition(String topic, Object key, ...) {
    if (isHotKey(key)) {
        // Spread across dedicated range of partitions
        return hotKeyPartitions.get(key)[random.nextInt(hotKeyPartitions.get(key).length)];
    }
    return defaultHash(key, numPartitions);
}
```

3. **Increase partition count**: More partitions = hash more uniform by the law of large numbers. A 100-partition topic is less prone to hot partitions than a 3-partition topic.

4. **Redesign the key**: Use a more granular key. Instead of `country_code`, use `(country_code, user_id % 100)`.

5. **Monitor and alert**: Track per-partition message rates. Alert when any partition receives >2x the average rate.

---

# Producer Internals

---

## Q19. Explain Producer Flow End-to-End

The producer flow from `producer.send(record)` to broker acknowledgment involves several stages:

```
Application Code
      │
      ▼
[1] Serialization
      │
      ▼
[2] Partition Selection
      │
      ▼
[3] RecordAccumulator (in-memory batching)
      │ (linger.ms or batch.size filled)
      ▼
[4] Sender Thread → Network I/O → Broker
      │
      ▼
[5] Broker appends to partition log
      │
      ▼
[6] Replication (if acks=all)
      │
      ▼
[7] Acknowledgment → Producer callback
```

### Step 1: Serialization

The key and value are serialized to byte arrays using the configured serializers:

```java
// Config
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "io.confluent.kafka.serializers.KafkaAvroSerializer");
```

Common serializers:
- `StringSerializer` / `StringDeserializer`
- `IntegerSerializer` / `LongSerializer`
- `ByteArraySerializer`
- Avro Serializer (with Schema Registry)
- Protobuf Serializer
- JSON Serializer

### Step 2: Partition Selection

As described in Q11 — key hash, round-robin, or custom partitioner.

### Step 3: RecordAccumulator (Batching)

The `RecordAccumulator` is an in-memory buffer organized as a `Map<TopicPartition, Deque<ProducerBatch>>`. 

- Each `ProducerBatch` accumulates records for a specific `(topic, partition)` pair.
- New records are appended to the current batch for their partition.
- If the batch reaches `batch.size` bytes OR `linger.ms` milliseconds pass, the batch is ready to send.
- Buffer total size is controlled by `buffer.memory` (default: 32 MB). If full, `send()` blocks for `max.block.ms` (default: 60s) before throwing `BufferExhaustedException`.

### Step 4: Sender Thread

A background `Sender` thread continuously:
1. Drains ready batches from the `RecordAccumulator`.
2. Groups batches by destination broker (each broker gets one request with batches for all its partitions).
3. Sends via `KafkaChannel` (NIO-based network layer).
4. Manages in-flight requests: up to `max.in.flight.requests.per.connection` concurrent requests per broker.

### Step 5: Broker Appends to Log

The broker receives a `ProduceRequest`:
1. Validates the request (authentication, authorization, quotas).
2. Writes the record batch to the partition's active segment file.
3. Updates the in-memory offset tracker.

### Step 6: Replication

Based on `acks`:
- `acks=0`: Don't wait.
- `acks=1`: Wait for leader write only.
- `acks=all`: Wait for all ISR members to acknowledge.

Followers actively fetch and write the batch. Once a follower writes and acknowledges to the leader, the leader updates the High Watermark.

### Step 7: Acknowledgment

The broker sends a `ProduceResponse` with the assigned offset(s). The Sender thread invokes the producer's callback (if any):

```java
producer.send(record, (metadata, exception) -> {
    if (exception != null) {
        log.error("Send failed for offset: {}", metadata.offset(), exception);
    } else {
        log.info("Sent to {}-{} at offset {}", 
            metadata.topic(), metadata.partition(), metadata.offset());
    }
});
```

---

## Q20. What is ACK=0, ACK=1, ACK=all?

The `acks` configuration controls **how many broker acknowledgments** the producer requires before considering a write successful. It's the fundamental durability vs. latency knob.

### acks=0 (Fire and Forget)

```
Producer ──────────────────────────► Broker
          (send and immediately continue)
```

- Producer sends the message and **does not wait** for any acknowledgment.
- **Fastest**: Zero latency overhead. No wait, no roundtrip.
- **Highest risk**: If the broker crashes before writing, the message is **silently lost**. The producer doesn't know.
- **Use cases**: Metrics, click-tracking, IoT telemetry where losing some events is acceptable. Never use for financial or order events.

### acks=1 (Leader Acknowledge)

```
Producer ─────────────────────────────────► Leader Broker
                                                │ (writes to local log)
         ◄──────────── ack ─────────────────────┘
```

- Producer waits for the **leader** to write the message to its local log.
- **Default for most use cases**.
- **Risk**: If the leader crashes *after* acknowledging but *before* replicating to followers, the message is **lost** when a follower becomes the new leader (the follower doesn't have it yet).
- **Use cases**: General purpose — good balance of durability and latency for most business events.

### acks=all (or acks=-1)

```
Producer ───────────────────────────────────────► Leader Broker
                                                       │
                                              Replicates to all ISR
                                                   │         │
                                              Follower1  Follower2
                                                   │         │
         ◄──── ack when all ISR confirm ───────────┴─────────┘
```

- Producer waits for the leader **and all ISR members** to write the message.
- **Slowest**: Extra latency for cross-broker replication roundtrip.
- **Safest**: Message survives any single broker failure (or multiple, depending on RF).
- **Must be combined with `min.insync.replicas`** (see Q55) to be meaningful.
- **Use cases**: Financial transactions, order processing, any data where losing a message is unacceptable.

### Summary Table

| Setting | Speed | Durability | Use Case |
|---|---|---|---|
| `acks=0` | Fastest | No guarantee | Metrics, logs |
| `acks=1` | Medium | Leader durability | General events |
| `acks=all` | Slowest | Highest (all ISR) | Payments, orders |

---

## Q21. What is ISR (In-Sync Replica)?

### Definition

The **In-Sync Replica (ISR)** set for a partition is the set of replicas that are **currently caught up** with the leader.

"Caught up" means: the replica has fetched and written all messages up to the leader's latest offset, within a configurable lag window (`replica.lag.time.max.ms`, default: 30 seconds).

### ISR Membership

**Joining the ISR**: A follower joins/stays in the ISR if it has fetched messages within the last `replica.lag.time.max.ms` milliseconds AND its end offset is close to (or equal to) the leader's end offset.

**Leaving the ISR**: A follower is removed from the ISR if:
- It fails to fetch from the leader for `replica.lag.time.max.ms` milliseconds (broker crash, GC pause, network partition).
- It falls too far behind (historically also `replica.lag.max.messages`, but this is removed in newer versions).

### Why ISR Matters for Producers

With `acks=all`, the producer waits for all ISR members to acknowledge. If the ISR shrinks to just the leader (ISR size = 1), then `acks=all` becomes equivalent to `acks=1` — the leader just waits for itself!

This is where `min.insync.replicas` comes in: if the ISR size drops below this threshold, the broker **refuses writes** and throws `NotEnoughReplicasException`. This is the safety net that prevents "acks=all" from silently degrading.

### ISR and High Watermark

The **High Watermark (HW)** is the offset up to which all ISR members have confirmed replication. Consumers can only read up to the High Watermark — they can never read "uncommitted" messages that haven't been replicated to all ISR members yet.

```
Partition 0:
  Leader log:    [0, 1, 2, 3, 4, 5]   ← LEO (Log End Offset) = 6
  Follower1 log: [0, 1, 2, 3]         
  Follower2 log: [0, 1, 2, 3, 4]
  High Watermark = 4                  ← All ISR have confirmed up to 4
  Consumer can read: offsets 0-4 only
```

---

## Q22. What Happens When Leader Crashes During Produce?

This is a failure scenario that must be handled correctly to avoid data loss or duplication.

### Scenario: Leader Crashes Before Replication

```
Producer → Leader (writes locally, crashes before replication)
                ↓ crash
Follower1 becomes new leader (doesn't have the latest message)
```

The message was lost. The producer will either:
1. Receive a network timeout error.
2. Receive a `NotLeaderOrFollowerException` when the cluster stabilizes and the producer retries to the old leader.

The producer then **retries** (if `retries > 0`) — it will discover the new leader via metadata refresh and resend. Since the new leader never had the message, the retry succeeds as a fresh write. No duplication in this case — just potential ordering concern if other messages were sent between the crash and retry.

### Scenario: Leader Crashes After Replication, Before ACK

```
Producer → Leader → (replicates to all ISR → crashes before sending ack)
Follower1 becomes new leader (has the message!)
Producer retries → new leader → writes again = DUPLICATE!
```

This is the classic source of **producer-side duplication**. The producer timed out waiting for an ack, retried, and wrote the message a second time to the new leader that already had it.

**Solution**: Idempotent producer (Q25) handles this exact scenario.

### Scenario: Leader Crashes Mid-Batch (Partial Write)

If the leader crashes mid-batch write (e.g., after writing 3 of 5 messages), the follower (new leader) only has the 3 written messages. The producer's retry resends the full batch. But the first 3 messages are now duplicated.

**Solution**: Idempotent producer + transactional producer for atomicity.

---

## Q23. What is Producer Retry?

### Default Behavior

When a produce request fails with a **retriable error**, the Kafka producer can automatically retry.

**Retriable errors** (transient, safe to retry):
- `NetworkException`
- `LeaderNotAvailableException`
- `NotLeaderOrFollowerException`
- `UnknownTopicOrPartitionException`
- `NotEnoughReplicasException`
- `RequestTimedOutException`

**Non-retriable errors** (fatal, should not retry):
- `MessageTooLargeException`
- `InvalidTopicException`
- `AuthorizationException`
- `SerializationException`

### Configuration

```properties
# Number of retries (default: Integer.MAX_VALUE in modern Kafka)
retries=3

# Wait between retries (default: 100ms)
retry.backoff.ms=100

# Total time budget for all retries
delivery.timeout.ms=120000  # 2 minutes
```

### The Ordering Problem with Retries

```
Producer sends: [Batch A (offset 100), Batch B (offset 101)]
Batch A fails, Batch B succeeds (offset 101 written)
Batch A retried → now written at offset 102

Broker log: [101: B, 102: A]  ← A and B are out of order!
```

This happens when `max.in.flight.requests.per.connection > 1` — multiple batches can be in-flight simultaneously, and a retry of batch A can complete after batch B.

**Solution**: Set `enable.idempotence=true` (Q25), which guarantees ordering even with up to 5 in-flight requests.

---

## Q24. Can Retries Create Duplicates?

**Yes, absolutely.** This is one of the most important producer reliability topics.

### How Duplicates Happen

1. Producer sends message M to leader.
2. Leader writes M to its log.
3. Leader replicates M to followers.
4. **Leader crashes before sending the ACK to the producer** (or network drops the ACK).
5. A new leader is elected (it has message M from replication).
6. Producer doesn't receive an ACK → assumes failure → **retries**.
7. Producer resends M to the new leader.
8. New leader writes M again → **M is now in the log twice** at two different offsets.

From the broker's perspective, both writes were valid. It has no way to know the second write is a retry of the first.

### The Scope of Duplicates

- **Within a Kafka session**: Idempotent producer solves this (Q25).
- **Across Kafka to external systems**: If a consumer reads a message, crashes before committing the offset, and another consumer reprocesses it, you get duplicate processing in the external system. Solved by idempotent consumer logic (Q48).

### Why You Must Assume Duplicates

Even with idempotent producer enabled, once data leaves Kafka (i.e., a consumer writes to a database), Kafka's guarantees don't extend to that external write. Always design consumers with idempotency in mind.

---

## Q25. What is Idempotent Producer?

### The Problem It Solves

The idempotent producer ensures that even if a message is retried multiple times, it is **written to the Kafka partition exactly once**. No duplicates within a Kafka session.

### How It Works

When idempotency is enabled, the broker assigns each producer a unique **Producer ID (PID)**. The producer then includes two additional fields in every batch:

1. **Producer ID (PID)**: Unique identifier for this producer session.
2. **Sequence Number**: A per-partition, monotonically increasing integer.

```
Batch sent: PID=5001, Partition=3, SeqNum=42, Messages=[...]
```

The broker maintains a map: `{PID, Partition} → lastSeqNum`

When a batch arrives:
- **SeqNum = lastSeqNum + 1**: Accept and process. Update lastSeqNum.
- **SeqNum ≤ lastSeqNum**: Duplicate! Discard silently. Return success to producer (the original was already written).
- **SeqNum > lastSeqNum + 1**: Out-of-order delivery. Return `OutOfOrderSequenceException` — this indicates a serious bug.

### Enabling Idempotent Producer

```properties
enable.idempotence=true
# The following are automatically set when idempotence is enabled:
acks=all
retries=Integer.MAX_VALUE
max.in.flight.requests.per.connection=5
```

### Limitations of Idempotent Producer

1. **Per-session only**: If the producer process restarts, it gets a new PID. The new producer has no knowledge of what the old producer sent. If the old producer wrote a message and crashed before receiving the ACK, the new producer might write it again.

2. **Within a single partition**: The sequence number is per-partition. It doesn't coordinate across partitions.

3. **Doesn't cover external systems**: If the consumer writes to a DB after reading from Kafka, idempotent producer doesn't help there.

For cross-partition, cross-restart exactly-once: use **transactional producer** (Q30).

---

## Q26. How Does Kafka Prevent Duplicate Writes?

### Summary of Mechanisms

| Layer | Mechanism | Prevents |
|---|---|---|
| Producer → Broker | Idempotent Producer (PID + SeqNum) | Retry duplicates within a session |
| Producer → Broker | Transactional Producer | Atomic multi-partition writes across restarts |
| Consumer → Sink | Idempotent Consumer | Duplicate processing of the same message |
| Consumer → Sink | Exactly-once via Transactions | Atomic read-process-write |

### The Key-Deduplication Pattern (Consumer Side)

The most common approach for preventing duplicate processing:

```java
// Consumer with deduplication
String messageId = record.headers().lastHeader("messageId").value();
if (deduplicationStore.contains(messageId)) {
    log.info("Skipping duplicate message {}", messageId);
    return;
}
processMessage(record.value());
deduplicationStore.put(messageId, System.currentTimeMillis()); // TTL: 24 hours
```

The deduplication store is typically Redis (for speed) or a DB with a unique index on `messageId`.

---

## Q27. What is max.in.flight.requests.per.connection?

### Definition

`max.in.flight.requests.per.connection` controls how many **unacknowledged produce requests** the producer can have in-flight simultaneously to a single broker connection.

Default: 5

### Impact on Ordering

This is where things get subtle.

**With `max.in.flight=1`**:
```
Send A → Wait for ACK → Send B → Wait for ACK → Send C
```
Strict serial sending. No reordering possible. But throughput is low (lots of round-trip wait time).

**With `max.in.flight=5` (without idempotence)**:
```
Send A, B, C, D, E simultaneously
If A fails and B-E succeed:
  Retry A → A arrives after B-E → REORDERED
```

**With `max.in.flight=5` and `enable.idempotence=true`**:
The broker uses sequence numbers to detect and reject reordering. Even if A is retried, the broker knows A's sequence number must come before B. If B already arrived at the broker but A hasn't, the broker buffers B until A arrives (or rejects if the sequence gap is too large).

**With `max.in.flight > 5` and `enable.idempotence=true`**:
This is **not supported** for idempotent producers. Setting idempotence=true with in-flight > 5 will throw a `ConfigException`.

### Recommendations

```properties
# For maximum throughput (accept possible reordering for non-critical data)
max.in.flight.requests.per.connection=10
enable.idempotence=false

# For ordering + high throughput (production recommendation)
enable.idempotence=true  # automatically sets max.in.flight=5

# For strict ordering + lowest throughput
max.in.flight.requests.per.connection=1
enable.idempotence=false
```

---

## Q28. What is Batching?

### Why Batching

Sending every message as an individual network request is extremely inefficient:
- Each request has TCP/IP overhead (headers, handshake).
- Each request requires a context switch.
- Each request requires a broker-side disk write syscall.

Batching amortizes these costs across many messages.

### Key Configuration

**`linger.ms`** (default: 0):
- How long the producer waits to accumulate messages into a batch before sending.
- Default 0 means send immediately (no intentional batching delay).
- Setting `linger.ms=5` means: "wait up to 5ms to see if more messages arrive before sending."
- Higher `linger.ms` = larger batches = higher throughput + higher latency.

**`batch.size`** (default: 16384 = 16KB):
- Maximum bytes for a single batch.
- A batch is sent either when full OR when `linger.ms` expires.
- Increasing batch.size (e.g., 64KB or 256KB) allows larger batches when the producer is fast.
- Setting it too large wastes memory when the producer is slow.

### Batching + Compression Interaction

Compression is applied per batch, not per message. This is crucial because:

```
5 messages, each JSON:
  {"event": "order_created", "orderId": "123", "userId": "456", ...}
  {"event": "order_created", "orderId": "124", "userId": "456", ...}
  ...

Individual compression: each message compressed separately → poor ratio
Batch compression: all 5 compressed together → 5-10x better ratio because
  repeated patterns ("order_created", "orderId", "userId") compress very well
```

**Real impact**: With snappy compression and a well-configured batch size, it's common to see 5-10x size reduction, dramatically reducing network and disk I/O.

### Tuning Example

For high-throughput analytics events:
```properties
linger.ms=20
batch.size=65536          # 64 KB
compression.type=lz4
buffer.memory=67108864    # 64 MB
```

For low-latency transactional events:
```properties
linger.ms=0
batch.size=16384          # 16 KB (default)
compression.type=none
acks=all
```

---

## Q29. What is Compression?

Kafka supports multiple compression algorithms for record batches. Compression reduces network bandwidth and disk usage.

### Compression Algorithms

| Algorithm | Ratio | CPU Cost | Speed | Best For |
|---|---|---|---|---|
| **none** | 1x | 0 | Fastest | Simplicity, already-compressed data |
| **gzip** | Best (4-10x) | Highest | Slowest | Storage-bound, max compression |
| **snappy** | Good (2-5x) | Low | Fast | General purpose, Google's choice |
| **lz4** | Good (2-5x) | Very Low | Fastest | Latency-sensitive, high-throughput |
| **zstd** | Excellent (4-8x) | Medium | Fast | Best ratio/speed balance (Kafka 2.1+) |

### Compression in Kafka's Architecture

**Producer-side compression**: The producer compresses the batch and sends compressed bytes to the broker. The broker stores them compressed. Followers replicate them compressed. The consumer decompresses.

```
Producer: [Msg1, Msg2, Msg3] → compress → [compressed bytes] → Broker
Broker: stores [compressed bytes] as-is → Zero-copy send to consumer
Consumer: [compressed bytes] → decompress → [Msg1, Msg2, Msg3]
```

**Broker-side recompression**: If the producer and broker have different compression settings (e.g., producer sends gzip but topic is configured for snappy), the broker decompresses and recompresses. This is expensive and should be avoided. Match producer and topic compression settings.

### Producer Config

```properties
compression.type=lz4    # none, gzip, snappy, lz4, zstd
```

**Recommendation**:
- For most production workloads: `lz4` (best speed/ratio balance for streaming)
- For archival/storage cost optimization: `zstd` or `gzip`
- For highest throughput, CPU-bound scenarios: `none` or `lz4`

---

## Q30. What is Transactional Producer?

### The Problem It Solves

Transactional producers enable **atomic writes across multiple partitions and topics** — all succeed or none succeed. This is the foundation of Kafka's exactly-once semantics (EOS).

### Use Cases

1. **Read-Process-Write (Kafka Streams pattern)**: Read from topic A, process, write to topic B. Both the consumer offset commit and the write to topic B must happen atomically. Either both happen or neither.
2. **Multi-topic atomic writes**: A payment event must atomically write to `payments-confirmed` AND `inventory-reserved` AND `notifications-pending`. You don't want a crash to leave the payment confirmed but the inventory not reserved.
3. **Idempotent across producer restarts**: Unlike the idempotent producer (which loses its PID on restart), the transactional producer uses a stable `transactional.id` that persists across restarts.

### How Transactions Work

```java
// Producer config
props.put("transactional.id", "payment-processor-1");
props.put("enable.idempotence", "true");

KafkaProducer<K,V> producer = new KafkaProducer<>(props);
producer.initTransactions();  // Registers with Transaction Coordinator

// In your processing loop:
producer.beginTransaction();
try {
    // Write to multiple partitions atomically
    producer.send(new ProducerRecord<>("payments-confirmed", paymentId, event));
    producer.send(new ProducerRecord<>("inventory-reserved", itemId, event));
    
    // If read-process-write: also commit offsets atomically
    producer.sendOffsetsToTransaction(offsets, consumerGroupMetadata);
    
    producer.commitTransaction();  // ← All writes become visible atomically
} catch (Exception e) {
    producer.abortTransaction();   // ← All writes are rolled back
}
```

### Internals: Transaction Coordinator

Kafka has a **Transaction Coordinator** (a special partition leader of the `__transaction_state` topic):

1. `initTransactions()` → Coordinator issues a **PID** and epoch to the transactional producer. If a previous producer with the same `transactional.id` had a pending transaction, it's aborted (fencing the zombie producer).
2. `beginTransaction()` → Local marker only (no network call).
3. `send()` → Messages are written to partitions with a special `transactional` flag. They're not visible to consumers yet.
4. `commitTransaction()` → Coordinator writes a `COMMIT` marker to all affected partitions. Consumers with `isolation.level=read_committed` can now see the messages.
5. `abortTransaction()` → Coordinator writes an `ABORT` marker. Messages are discarded from the consumer's perspective.

### Consumer Side: Isolation Levels

```properties
# Default: see all messages including uncommitted
isolation.level=read_uncommitted

# Only see committed transactions
isolation.level=read_committed
```

Use `read_committed` when consuming from topics written by transactional producers.

### Exactly-Once Semantics (EOS) Summary

For true exactly-once end-to-end:
- **Producer**: `transactional.id` + `enable.idempotence=true`
- **Consumer**: `isolation.level=read_committed`
- **Offset commit**: `producer.sendOffsetsToTransaction()` — atomic with the write

This is what Kafka Streams uses internally for its EOS mode.

---

# Consumer Internals

---

## Q31. Explain Consumer Flow End-to-End

```
Application Code: consumer.poll(Duration.ofMillis(500))
                         │
                         ▼
[1] Heartbeat (background thread checks group coordinator)
                         │
                         ▼
[2] Fetch Request to broker(s) for assigned partitions
                         │
                         ▼
[3] Broker returns up to max.partition.fetch.bytes per partition
                         │
                         ▼
[4] Deserialize key/value bytes → Java objects
                         │
                         ▼
[5] Application processes records
                         │
                         ▼
[6] Commit offset (auto or manual)
                         │
                         ▼
[7] Repeat
```

### Step 1: Group Coordinator & Heartbeat

Before any polling, the consumer finds its **Group Coordinator** (a broker that manages the consumer group's state). It sends regular **heartbeats** (every `heartbeat.interval.ms`, default: 3 seconds) to indicate it's alive.

If the Group Coordinator doesn't receive a heartbeat within `session.timeout.ms` (default: 45 seconds for modern clients), it considers the consumer dead and triggers a rebalance.

### Step 2: Fetch Request

The consumer sends a `FetchRequest` to the **leader broker** of each assigned partition. The request includes:
- List of `(topic, partition, offset)` tuples — "give me messages starting from offset X in partition Y".
- `fetch.min.bytes` (default: 1 byte): Minimum data to return. If less data is available, the broker waits.
- `fetch.max.wait.ms` (default: 500ms): Maximum wait time if `fetch.min.bytes` isn't met.
- `max.partition.fetch.bytes` (default: 1 MB): Max bytes per partition per response.
- `fetch.max.bytes` (default: 50 MB): Max total bytes per fetch response.

### Step 3: Broker Response

The broker returns available messages starting from the requested offset. If the consumer is at the tail (no new messages), the broker holds the connection open (long-polling) until either new messages arrive or `fetch.max.wait.ms` expires. This is efficient — no constant polling overhead.

### Step 4: Deserialization

The raw bytes are deserialized using configured deserializers:
```java
props.put("value.deserializer", "io.confluent.kafka.serializers.KafkaAvroDeserializer");
```

### Step 5: Application Processing

The application iterates over `ConsumerRecords<K, V>`:
```java
ConsumerRecords<String, Order> records = consumer.poll(Duration.ofMillis(500));
for (ConsumerRecord<String, Order> record : records) {
    processOrder(record.value());
}
```

**Critical**: The consumer should process records within `max.poll.interval.ms` (default: 5 minutes). If `poll()` isn't called within this interval, the consumer is considered dead and a rebalance is triggered.

### Step 6: Offset Commit

The consumer commits offsets to `__consumer_offsets` topic to record progress. This can be:
- **Auto-commit**: Background commit every `auto.commit.interval.ms` (default: 5 seconds).
- **Manual sync**: `consumer.commitSync()` — blocks until committed.
- **Manual async**: `consumer.commitAsync()` — non-blocking with callback.

### Step 7: Repeat

The consumer loops back to `poll()`. The fetch request now starts from the last committed offset + 1.

---

## Q32. What is a Consumer Group?

### Definition

A consumer group is a set of consumer instances identified by a shared `group.id`. They collectively consume a topic, with each partition assigned to exactly one consumer in the group.

### The Power of Consumer Groups

**Parallel Processing**: 

```
Topic: orders (6 partitions)
Consumer Group: payment-processors (3 consumers)

Consumer 1 → Partition 0, 1
Consumer 2 → Partition 2, 3
Consumer 3 → Partition 4, 5
```

All 3 consumers process in parallel. Throughput scales with consumer count (up to partition count).

**Independent Consumption**:

```
Topic: orders (6 partitions)

Group: payment-processors  → all 6 partitions (sees all events)
Group: inventory-service   → all 6 partitions (independent copy)
Group: analytics           → all 6 partitions (independent copy)
```

Each group maintains its own set of offsets. A slow analytics consumer doesn't affect payment processing. This is fundamentally different from traditional message queues (like RabbitMQ) where consuming a message removes it from the queue — only one consumer gets it.

### Group Coordinator

Each consumer group has a **Group Coordinator** — a broker that:
- Tracks which consumers are alive (via heartbeats).
- Orchestrates partition assignment during rebalances.
- Manages offset commits (via `__consumer_offsets` topic).

The Group Coordinator for a group is determined by: `hash(group.id) % numPartitions(__consumer_offsets)`. This spreads coordinator load across brokers.

### Practical Sizing

```
Scenario: Topic has 12 partitions, consumer group has N consumers

N=1:  1 consumer processes all 12 partitions (bottleneck)
N=6:  each consumer processes 2 partitions
N=12: each consumer processes 1 partition (max parallelism)
N=15: 12 consumers active, 3 idle (no partition to assign)
N=20: still 12 active, 8 idle

Rule: adding consumers beyond partition count provides no benefit
```

---

## Q33. How Does Kafka Distribute Partitions Among Consumers?

Partition assignment happens during a **rebalance** using an **assignor strategy**.

### Built-in Assignors

**1. RangeAssignor (default for single-topic)**

For each topic, partitions are sorted and divided into ranges:

```
Topic: orders (6 partitions: 0,1,2,3,4,5)
Consumers: C1, C2, C3 (sorted by member ID)

C1 → Partition 0, 1  (floor(6/3) = 2 partitions, first range)
C2 → Partition 2, 3
C3 → Partition 4, 5
```

**Problem with multiple topics**: If you have topic A (6 parts) and topic B (6 parts), C1 gets A-0,1 and B-0,1. If you have topics with different partition counts, the range distribution can be uneven.

**2. RoundRobinAssignor**

All partitions across all topics are pooled and distributed round-robin:

```
Topics: A(3 parts), B(3 parts)
All partitions: A-0, A-1, A-2, B-0, B-1, B-2
Consumers: C1, C2

C1 → A-0, A-2, B-1
C2 → A-1, B-0, B-2
```

More balanced for multi-topic consumption.

**3. StickyAssignor**

Like round-robin but tries to **minimize reassignment** during rebalances — reassigns only the partitions from the leaving consumer, keeps other consumers' assignments unchanged:

```
Before rebalance: C1→[A-0,A-1], C2→[A-2,B-0], C3→[B-1,B-2]
C3 leaves.
StickyAssignor: C1→[A-0,A-1,B-1], C2→[A-2,B-0,B-2]  ← C1 and C2 keep their original partitions
RangeAssignor might reassign completely.
```

**4. CooperativeStickyAssignor** (preferred modern choice)

Same as StickyAssignor but uses **incremental cooperative rebalancing** — consumers don't stop processing during rebalance (see Q44).

### Custom Assignor

Implement `ConsumerPartitionAssignor` for custom logic (geographic affinity, capacity-weighted assignment, etc.).

---

## Q34. Why Can a Partition Only Be Assigned to One Consumer in a Group?

This is a fundamental design decision with important trade-offs.

### The Reason: Ordering + Simplicity

**Ordering**: If two consumers both read from partition 0, they'd each see some subset of messages. Consumer A processes messages at offsets 0, 2, 4 and Consumer B processes 1, 3, 5. Even within the same partition, ordering is violated.

**Offset management**: There's one offset per `(consumer group, partition)`. If two consumers share a partition, they'd need to coordinate which offsets they've processed — complex distributed coordination.

**No double-processing**: With one consumer per partition, there's no risk of the same message being processed twice within the same consumer group.

### The Queue-Like Behavior

This design gives Kafka its "queue" semantics within a consumer group: each message is processed by exactly one consumer in the group. Combined with multi-group support, you also get "pubsub" semantics (every group gets every message).

### Implications for Parallelism

**If you need more parallelism than partition count allows**: You must increase partition count. You cannot add more consumers than partitions.

**If you have more consumers than partitions**: Extra consumers sit idle as hot standbys. When an active consumer dies, an idle consumer picks up its partition immediately (after a rebalance).

---

## Q35. What is an Offset?

### Definition

An offset is a **monotonically increasing integer** that uniquely identifies a message's position within a specific partition.

```
Partition 0:
  Offset 0: {key: "order-1", value: OrderCreated{...}, timestamp: 1672531200000}
  Offset 1: {key: "order-2", value: OrderCreated{...}, timestamp: 1672531200100}
  Offset 2: {key: "order-1", value: OrderShipped{...}, timestamp: 1672531200500}
  ...
```

Key properties:
- **Immutable**: Once assigned, an offset never changes. The message at offset 42 will always be the same message.
- **Partition-scoped**: Offset 42 in partition 0 is a completely different message than offset 42 in partition 1.
- **Assigned by the broker**: The leader broker assigns offsets sequentially as messages are written.
- **Persistent**: Offsets survive broker restarts (they're part of the log).

### Types of Offsets

1. **Log End Offset (LEO)**: The next offset to be written — the current "end" of the partition log.
2. **High Watermark (HW)**: The highest offset that has been replicated to all ISR members. Consumers can only read up to the HW.
3. **Consumer Committed Offset**: The offset the consumer group has committed — "I've processed everything up to here."
4. **Current Position**: The offset the consumer is about to fetch next (may be ahead of committed offset during processing).

### Offset as a Cursor

The committed offset is the consumer group's **bookmark**. If a consumer crashes:
1. New consumer starts.
2. Reads committed offset from `__consumer_offsets`: "Group X was at offset 150 for partition 3."
3. Fetches from offset 151.
4. No data loss, minimal duplication.

---

## Q36. Where Are Offsets Stored?

### Modern Kafka: __consumer_offsets Topic

Since Kafka 0.9, consumer offsets are stored in a **special internal Kafka topic** called `__consumer_offsets`.

Properties of this topic:
- 50 partitions by default (`offsets.topic.num.partitions`)
- Replication factor 3 (configurable, `offsets.topic.replication.factor`)
- Log compacted: only the latest offset per `(group, topic, partition)` is retained
- Managed entirely by Kafka brokers

How it works:
```
Consumer commits: group="payment-svc", topic="orders", partition=3, offset=1500
Kafka writes to __consumer_offsets:
  Key: [group_id, topic, partition]
  Value: [offset, metadata, timestamp]
  Partition: hash(group_id) % 50  ← determines which __consumer_offsets partition
```

### Legacy: ZooKeeper (Kafka < 0.9)

Before Kafka 0.9, offsets were stored in ZooKeeper at path `/consumers/{group}/offsets/{topic}/{partition}`. 

Problems:
- ZooKeeper is not designed for high-frequency writes — committing offsets on every batch caused ZooKeeper overload.
- ZooKeeper nodes have limited write throughput.

Moving offsets to a Kafka topic (which is append-only and handles millions of writes/sec) was a major improvement.

### Reading Committed Offsets

You can inspect committed offsets using the `kafka-consumer-groups.sh` tool:

```bash
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group payment-service \
  --describe

GROUP           TOPIC   PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
payment-service orders  0          1450            1500            50
payment-service orders  1          1498            1500            2
payment-service orders  2          1500            1500            0
```

---

## Q37. What is __consumer_offsets Topic?

### Purpose

`__consumer_offsets` is Kafka's internal bookkeeping topic for tracking all consumer group offset commits across all topics.

### Structure

```
Topic: __consumer_offsets
  50 partitions (default)
  Replication factor: 3

Keys: 
  OffsetCommitKey: [group_id, topic, partition]
  GroupMetadataKey: [group_id]

Values:
  OffsetCommitValue: [offset, leaderEpoch, metadata, commitTimestamp, expireTimestamp]
  GroupMetadataValue: [protocolType, generation, protocol, leader, members]
```

Two types of entries:
1. **Offset commits**: `(group, topic, partition) → latest_committed_offset`
2. **Group metadata**: `group_id → {members, their assignments, generation_id}`

### Log Compaction

`__consumer_offsets` uses **log compaction** (not time-based retention). For each key `(group, topic, partition)`, only the latest value (most recent offset) is retained. Older offsets are garbage-collected.

This means the topic never grows unboundedly — only as large as (num_groups × num_topics × num_partitions × offset_entry_size).

### Coordinator Assignment

The **Group Coordinator** for consumer group `G` is the broker that is the leader for partition `hash(G) % 50` of `__consumer_offsets`. This means coordinator responsibility is automatically distributed across all brokers.

---

## Q38. Auto Commit vs Manual Commit?

This is a critical design decision that directly impacts your delivery guarantees.

### Auto Commit

```properties
enable.auto.commit=true
auto.commit.interval.ms=5000  # Commit every 5 seconds
```

**How it works**:
- A background thread periodically commits the latest polled offset.
- The commit happens at most every `auto.commit.interval.ms`.
- The commit happens on the next `poll()` call after the interval has elapsed.

**Problem**: Auto-commit commits the offset of messages **returned by poll()**, not messages **successfully processed**. If the consumer crashes after poll() but before finishing processing, those messages are "committed" and won't be reprocessed — **data loss**.

```
poll() → gets offsets 100-200
[background: auto-commit offset 200 at T+5s]
App crashes at offset 150 while processing
Restart: reads from offset 201 ← skips 150-200!
```

**When it's okay**: Log aggregation, metrics, audit trails where occasional loss is acceptable.

### Manual Commit: commitSync()

```java
while (true) {
    ConsumerRecords<String, Order> records = consumer.poll(Duration.ofMillis(500));
    for (ConsumerRecord<String, Order> record : records) {
        processOrder(record.value());  // ← process first
    }
    consumer.commitSync();  // ← then commit, blocks until confirmed
}
```

**Pros**: You control exactly when to commit — only after processing is complete.
**Cons**: Synchronous — blocks the consumer loop while waiting for the commit to be acknowledged by the broker. Can reduce throughput.

### Manual Commit: commitAsync()

```java
consumer.commitAsync((offsets, exception) -> {
    if (exception != null) {
        log.error("Commit failed for offsets {}", offsets, exception);
        // Note: commitAsync does NOT retry on failure!
    }
});
```

**Pros**: Non-blocking. Consumer can continue processing while commit is in-flight.
**Cons**: No automatic retry on failure. If commit fails and the consumer crashes before the next successful commit, there may be reprocessing (at-least-once).

### Manual Commit: Per-Partition or Per-Record

For fine-grained control (e.g., after each record in a slow processing loop):

```java
for (ConsumerRecord<String, Order> record : records) {
    processOrder(record.value());
    
    // Commit just this partition-offset pair
    Map<TopicPartition, OffsetAndMetadata> offset = Map.of(
        new TopicPartition(record.topic(), record.partition()),
        new OffsetAndMetadata(record.offset() + 1)
    );
    consumer.commitSync(offset);
}
```

Note: commit offset is always `lastProcessedOffset + 1` (i.e., the next offset to read).

### Summary

| Mode | Delivery Semantics | Use Case |
|---|---|---|
| Auto-commit | At-most-once (can lose) | Non-critical logs/metrics |
| Manual commitSync after processing | At-least-once (can duplicate) | Most production use cases |
| Transactional + sendOffsetsToTransaction | Exactly-once | Payments, Kafka Streams |

---

## Q39. What Happens If Consumer Crashes Before Commit?

### Scenario

```
Consumer polls: offsets 100-200 for partition 3
Consumer processes records 100-150
Consumer crashes (JVM crash, kill -9, out-of-memory)
```

### What Happens

1. The consumer stops sending heartbeats.
2. After `session.timeout.ms` (default: 45s), the Group Coordinator marks the consumer as dead.
3. A rebalance is triggered. Another consumer (or the same one after restart) is assigned partition 3.
4. The new consumer reads the **last committed offset** for partition 3: offset 99 (the last committed before this crash).
5. The new consumer starts fetching from offset 100.
6. **Records 100-150 are reprocessed** (even though they were already processed before the crash).

### The Outcome: At-Least-Once Delivery

This is at-least-once semantics — records are never lost (the committed checkpoint is before the crash), but they may be processed more than once.

### Mitigations

1. **Idempotent consumer**: Design processing to be safe when called multiple times with the same record. Use the record's unique identifier to deduplicate.

2. **More frequent commits**: Commit after every batch (or every N records) to minimize the "reprocessing window":
   ```java
   for (ConsumerRecord<K,V> record : records) {
       process(record);
       // Commit per record (small window, but high commit overhead)
       commitSingleOffset(record);
   }
   ```

3. **Track processed IDs in external store**: Store `(topic, partition, offset)` or a business `eventId` in a database. On reprocessing, check if it's already been handled.

4. **Transactional processing**: Use Kafka Streams or transactions to atomically commit offset + write result.

---

## Q40. What Happens If Consumer Commits Before Processing?

### Scenario

```java
// BAD PATTERN
while (true) {
    ConsumerRecords<K,V> records = consumer.poll(Duration.ofMillis(500));
    consumer.commitSync();  // ← commit BEFORE processing!
    for (ConsumerRecord<K,V> record : records) {
        process(record);    // ← crash here
    }
}
```

### What Happens

1. Consumer polls offsets 100-200.
2. Consumer commits offset 200 immediately.
3. Consumer crashes during processing at offset 150.
4. Consumer restarts — reads committed offset 200.
5. **Records 150-200 are never processed.** Gone. Lost.

### The Outcome: At-Most-Once Delivery

This is at-most-once semantics — records are never reprocessed, but they may be lost.

### When This Is Intentional

Some systems deliberately use at-most-once to avoid duplicate side effects. For example:
- Sending email notifications: you'd rather miss one than send duplicates.
- Triggering idempotent-but-annoying side effects (showing a popup).

But for most transactional systems (payments, inventory, orders), this is a dangerous anti-pattern.

### Anti-Pattern with Auto-Commit

Auto-commit in Kafka is essentially "commit before fully processing" because it commits offsets from the last `poll()` irrespective of whether your application finished processing them. This is why many teams disable auto-commit for critical consumers.

---

# Rebalancing

---

## Q41. What is Consumer Group Rebalancing?

### Definition

Rebalancing is the process by which Kafka **redistributes partition ownership** among all consumers in a group. During a rebalance, partitions are taken away from some consumers and given to others to ensure each partition is assigned to exactly one consumer.

### Why Rebalancing Is Necessary

Kafka needs to continuously balance partitions across consumers as the group membership changes (consumers joining, leaving, crashing) or as topic configurations change (partition count changes). Without rebalancing, crashed consumers would leave their partitions "orphaned" with no consumer reading them.

### The Rebalance Protocol (Classic — Eager Rebalancing)

```
1. Trigger: Consumer C3 dies (no heartbeat for session.timeout.ms)
2. Group Coordinator detects C3 is gone
3. Coordinator sends "JoinGroup" request to all active consumers (C1, C2)
4. ALL consumers stop consuming and revoke ALL their partitions
   ← This is the "stop-the-world" pause
5. Consumers send their partition subscriptions to the Coordinator
6. Coordinator selects one consumer as "Group Leader"
7. Group Leader runs the partition assignor algorithm
8. Group Leader sends the new assignment to the Coordinator
9. Coordinator sends "SyncGroup" response to each consumer with their new assignments
10. All consumers resume consuming from their new partitions
```

### Impact of Rebalancing

During steps 4-9, **no consumer in the group is processing any messages**. All partitions are effectively paused. This is called a "stop-the-world" pause.

For a small group with fast heartbeats: pauses of 1-3 seconds.
For large groups: pauses of 10-30+ seconds.

---

## Q42. When Does Rebalancing Happen?

### 1. Consumer Joins the Group

When a new consumer instance starts and subscribes to a topic:
```java
consumer.subscribe(Collections.singletonList("orders"));
consumer.poll(Duration.ZERO); // ← triggers JoinGroup
```

This is normal and expected during deployments (rolling restart adds new consumer instances before old ones are removed).

### 2. Consumer Leaves the Group

**Graceful leave**: Consumer calls `consumer.close()`. The consumer sends a `LeaveGroup` request to the coordinator. Rebalance starts immediately.

**Ungraceful leave (crash)**: Consumer stops heartbeating. Coordinator waits `session.timeout.ms` (default: 45s) before declaring it dead and triggering rebalance.

**Processing too slow**: If `consumer.poll()` isn't called within `max.poll.interval.ms` (default: 5 minutes), Kafka considers the consumer stuck and removes it from the group, triggering a rebalance.

### 3. Topic Partition Changes

If the number of partitions in a subscribed topic changes (via `kafka-topics.sh --alter`), all consumers in groups subscribing to that topic will rebalance to get the new partition assignment.

### 4. Consumer Group Subscription Changes

If consumers in the group change which topics they subscribe to (e.g., pattern-based subscription matches a new topic), a rebalance occurs.

### 5. Group Coordinator Failure

If the broker acting as Group Coordinator for a group fails, consumers discover a new coordinator and rebalance.

---

## Q43. Why Are Rebalances Expensive?

### 1. Processing Pause (Stop-the-World)

In eager rebalancing (the classic protocol), ALL consumers in the group stop processing when a rebalance starts. Even if only one consumer died and its 2 partitions need to be reassigned, ALL consumers (even those with perfectly healthy assignments) must pause, release their partitions, and wait for reassignment. This is O(group_size) disruption for O(1) actual change.

### 2. State Loss for Stateful Consumers

If a consumer has built up in-memory state from processing a partition (e.g., a 5-minute aggregation window), that state is lost when the partition is reassigned. The new consumer must rebuild state from scratch or from a persistent store.

### 3. Cache Invalidation

Consumers often cache data specific to the partitions they own (e.g., user records for users in those partitions). When partitions are reassigned, the cache must be re-warmed.

### 4. Reprocessing Due to In-Flight Records

Records that were fetched but not yet committed before the rebalance will be re-fetched and reprocessed by the new consumer (at-least-once behavior). The more records "in flight," the more reprocessing.

### 5. Latency Spike

During the rebalance pause, messages accumulate in partition logs. After the rebalance, the new consumers have a backlog to catch up on, causing a temporary latency spike.

### 6. Cascade Rebalances

If a rebalance triggers downstream consumers (e.g., consumer group B subscribes to a topic that consumer group A writes to), and group A's rebalance causes a pause in writes, group B might also experience issues.

---

## Q44. What Are Eager and Cooperative Rebalancing?

### Eager Rebalancing (Classic Protocol)

The original Kafka rebalancing protocol. "Eager" because consumers eagerly give up ALL their partitions at the start of every rebalance, even partitions they'll likely be reassigned after the rebalance.

```
Rebalance triggered (C3 dies):
  C1: Revokes [P0, P1] ← gives up everything
  C2: Revokes [P2, P3] ← gives up everything
  C3: Dead

  Assignment computed: C1→[P0,P1,P4], C2→[P2,P3,P5]
  (P4, P5 were C3's partitions; everything else stays the same)

  C1: Resumes [P0, P1, P4]
  C2: Resumes [P2, P3, P5]
```

**Problem**: C1 and C2 needlessly gave up P0-P3 and re-received them. This caused unnecessary pausing and potential reprocessing.

### Cooperative Rebalancing (Incremental Protocol)

Introduced in Kafka 2.4. Instead of stop-the-world, rebalancing happens in **multiple rounds**:

**Round 1**: Consumers keep their current partitions but inform the coordinator of their current assignment. The coordinator identifies only the partitions that need to be moved.

**Round 2**: Only the "to be revoked" partitions are taken from their current owners. Other consumers continue processing. The revoked partitions are then assigned to new consumers.

```
Rebalance triggered (C3 dies, had P4,P5):
  Round 1: 
    C1 keeps [P0,P1], C2 keeps [P2,P3]
    Coordinator identifies P4,P5 need assignment
  Round 2:
    C1 gets P4, C2 gets P5
    C1 and C2 only briefly pause to add new partitions
    Processing of P0,P1,P2,P3 continues throughout!
```

**Key benefit**: Consumers don't stop processing their stable partitions during a rebalance. Only the specific partitions being moved cause a brief pause.

### Configuring Cooperative Rebalancing

```java
props.put("partition.assignment.strategy", 
    "org.apache.kafka.clients.consumer.CooperativeStickyAssignor");
```

Or with the Spring Kafka library:
```java
@Bean
public ConsumerFactory<String, Object> consumerFactory() {
    Map<String, Object> config = new HashMap<>();
    config.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG,
        CooperativeStickyAssignor.class.getName());
    return new DefaultKafkaConsumerFactory<>(config);
}
```

### Comparison Table

| Feature | Eager | Cooperative |
|---|---|---|
| Processing pause | All consumers, all partitions | Only affected partitions |
| Rounds of rebalancing | 1 (but longer) | 2+ (but shorter disruption) |
| State/cache loss | All consumers | Only reassigned partitions |
| Complexity | Simple | More complex |
| Recommended for | Legacy compatibility | Modern production systems |

---

## Q45. How Can You Reduce Rebalance Impact?

### 1. Tune Session Timeout and Heartbeat

```properties
# Heartbeat interval — how often to send heartbeats (default: 3s)
heartbeat.interval.ms=3000

# Session timeout — how long before declaring consumer dead (default: 45s)
session.timeout.ms=45000

# Rule: heartbeat.interval.ms < session.timeout.ms / 3
```

**Lower `session.timeout.ms`**: Faster failure detection, faster rebalance trigger, but more false positives (temporary GC pause might cause spurious rebalance).

**Higher `session.timeout.ms`**: Tolerates GC pauses and temporary slowness, but takes longer to detect real failures.

### 2. Tune max.poll.interval.ms

```properties
# If poll() isn't called within this window, consumer is considered dead
max.poll.interval.ms=300000  # 5 minutes (default)
```

If your processing loop takes longer than 5 minutes per batch, increase this. Or reduce `max.poll.records` to process fewer records per loop iteration.

### 3. Use CooperativeStickyAssignor

As described in Q44 — dramatically reduces processing pauses during rebalances.

### 4. Static Group Membership

Kafka 2.3+ introduced **static membership** (`group.instance.id`). A consumer with a static group.instance.id:
- Retains its partition assignment across restarts (within `session.timeout.ms`).
- Does NOT trigger a rebalance when it restarts (as long as it reconnects within the session timeout).

```java
props.put("group.instance.id", "consumer-pod-3"); // unique per pod
props.put("session.timeout.ms", "120000"); // give pod time to restart
```

This is ideal for Kubernetes pods — pod restarts don't cause rebalances if the pod comes back up within 2 minutes.

### 5. Reduce Consumer Count Volatility

Don't scale consumer groups up and down frequently. Use the minimum-maximum autoscaling range that covers your peak load.

### 6. Graceful Shutdown

Always close consumers gracefully with `consumer.close()` so the `LeaveGroup` request is sent immediately (instant rebalance trigger, not waiting for session timeout):

```java
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    consumer.wakeup(); // interrupt the poll() loop
}));
try {
    while (true) { consumer.poll(...); }
} catch (WakeupException e) {
    // Expected: shutdown signal
} finally {
    consumer.close(); // ← sends LeaveGroup, triggers fast rebalance
}
```

---

# Delivery Guarantees

---

## Q46. Explain At-Most-Once, At-Least-Once, Exactly-Once

### At-Most-Once

A message is processed **zero or one times**. It may be lost but will never be processed more than once.

**How**: Commit offsets **before** processing. If the consumer crashes during processing, the committed offset means the messages won't be re-read.

```
poll → commitSync → process → (crash) → restart → reads from committed+1
                                                    ← missed messages!
```

**Characteristics**:
- No duplicates.
- Possible data loss.
- Highest throughput (no need for deduplication logic).
- Use case: Metrics, click counters, log aggregation where occasional loss is acceptable.

### At-Least-Once

A message is processed **one or more times**. It will never be lost but may be processed more than once.

**How**: Commit offsets **after** processing. If the consumer crashes after processing but before committing, on restart it re-reads and reprocesses from the last committed offset.

```
poll → process → (crash) → restart → reads from last committed → reprocesses
                                                                   ← duplicates!
```

**Characteristics**:
- Possible duplicates.
- No data loss.
- Requires idempotent processing logic.
- **Most common in practice** — the default for most Kafka setups.
- Use case: Order processing with idempotent consumers, email sending with deduplication, etc.

### Exactly-Once

A message is processed **exactly one time** — no loss, no duplicates.

**How**: Atomic read-process-write using Kafka transactions. The offset commit and the result write are part of the same atomic transaction.

```
beginTransaction()
  → read from input topic (via consumer group)
  → process
  → write result to output topic
  → sendOffsetsToTransaction (atomic offset commit)
commitTransaction()  ← either ALL happen or NONE
```

**Characteristics**:
- No duplicates, no loss.
- Most complex to implement.
- Higher latency due to transaction coordination.
- Only truly exactly-once **within Kafka**. Writing to an external DB still requires idempotent DB writes.
- Use case: Financial calculations, payment processing, Kafka Streams pipelines.

### Comparison

| Semantic | Data Loss | Duplicates | Complexity | Latency |
|---|---|---|---|---|
| At-most-once | Possible | No | Low | Lowest |
| At-least-once | No | Possible | Medium | Medium |
| Exactly-once | No | No | High | Highest |

---

## Q47. How Do Duplicates Occur in Kafka?

### Source 1: Producer Retries (Producer Side)

As discussed in Q24:
- Producer sends message M to broker.
- Broker writes M, starts replication.
- Broker crashes before sending ACK.
- Producer times out, retries.
- New leader writes M again.
- M is in the log twice.

**Fix**: Idempotent producer.

### Source 2: Consumer Crash Before Commit (Consumer Side)

- Consumer polls messages 100-200.
- Processes messages 100-180.
- Crashes before committing.
- Restarts, reads from offset 100 again.
- Messages 100-180 are reprocessed.

**Fix**: Idempotent consumer (check if already processed using a unique message ID or idempotent DB write).

### Source 3: Rebalance Mid-Processing

- Consumer A is processing partition 3 (offsets 100-200), hasn't committed yet.
- Rebalance triggered (e.g., consumer B joins the group).
- Consumer A's partition 3 is revoked.
- Consumer C gets partition 3.
- Consumer C reads from offset 100 (last committed) — same messages Consumer A was processing.
- Consumer A (now without partition 3) also finishes processing 100-200 and tries to commit — but it no longer owns partition 3 (gets `CommitFailedException`).
- Duplicates from Consumer A's processing + Consumer C's processing.

**Fix**: Commit offsets before rebalance using `ConsumerRebalanceListener.onPartitionsRevoked()`:

```java
consumer.subscribe(topics, new ConsumerRebalanceListener() {
    @Override
    public void onPartitionsRevoked(Collection<TopicPartition> partitions) {
        consumer.commitSync(currentOffsets);  // ← save progress before losing partitions
    }
    
    @Override
    public void onPartitionsAssigned(Collection<TopicPartition> partitions) {
        // Optional: load state for newly assigned partitions
    }
});
```

### Source 4: Network Timeouts with Retried Requests

Even with non-Kafka infrastructure: if a network proxy retries a timed-out request, the broker might receive the same request twice. The idempotent producer handles this at the Kafka level.

---

## Q48. How Do You Build Idempotent Consumers?

An idempotent consumer is one where processing the same message N times has the same effect as processing it once.

### Strategy 1: Natural Idempotency

Some operations are inherently idempotent — no extra work needed:

```java
// IDEMPOTENT: "Set user's name to Alice" — running it twice still results in name=Alice
UPDATE users SET name='Alice' WHERE id=123;

// IDEMPOTENT: "Set order status to SHIPPED"
UPDATE orders SET status='SHIPPED' WHERE order_id='456';

// NOT IDEMPOTENT: "Add $100 to balance" — running twice adds $200!
UPDATE accounts SET balance = balance + 100 WHERE id=789;
```

Design your event model around SET semantics rather than INCREMENT semantics where possible.

### Strategy 2: Deduplication Table

Maintain a table of processed message IDs:

```sql
CREATE TABLE processed_events (
    event_id VARCHAR(255) PRIMARY KEY,
    processed_at TIMESTAMP,
    INDEX idx_processed_at (processed_at)  -- for TTL cleanup
);
```

```java
public void processEvent(ConsumerRecord<String, Event> record) {
    String eventId = record.headers().lastHeader("X-Event-Id").value().toString();
    
    // Try to insert — fails silently if duplicate (idempotent)
    boolean isNew = db.insertIgnore("INSERT IGNORE INTO processed_events VALUES (?, NOW())", eventId);
    
    if (!isNew) {
        log.info("Skipping duplicate event {}", eventId);
        return;
    }
    
    // Process only if new
    doActualProcessing(record.value());
}
```

Use a TTL to clean up old entries (events older than your maximum retention period can be safely deleted).

### Strategy 3: Upsert Semantics

Instead of INSERT (which fails on duplicate), use UPSERT:

```java
// Idempotent: same result whether run once or multiple times
db.execute("INSERT INTO orders (order_id, status, updated_at) VALUES (?, ?, ?) " +
           "ON DUPLICATE KEY UPDATE status=VALUES(status), updated_at=VALUES(updated_at)",
           orderId, status, timestamp);
```

### Strategy 4: Versioned Updates (Optimistic Concurrency)

Include a version/timestamp in the event. Only apply if the event's version is newer than the stored version:

```java
public void applyEvent(OrderEvent event) {
    Order currentOrder = orderRepo.findById(event.orderId());
    if (currentOrder.version() >= event.version()) {
        log.info("Stale event version {}, current is {}", event.version(), currentOrder.version());
        return;  // Already processed a newer version
    }
    orderRepo.save(event.toOrder());
}
```

### Strategy 5: Kafka's Offset as Idempotency Key

Use `(topic, partition, offset)` as a unique event identifier:

```java
String idempotencyKey = String.format("%s-%d-%d", 
    record.topic(), record.partition(), record.offset());
```

This is guaranteed unique by Kafka — the same message always has the same `(topic, partition, offset)`.

---

## Q49. Is Kafka Exactly-Once Really Exactly-Once?

### The Short Answer

Within a Kafka-to-Kafka pipeline: **Yes**, Kafka's EOS (Exactly-Once Semantics) works correctly.

For pipelines involving external systems: **No** — it's still at-least-once with respect to the external system, unless the external system supports idempotent writes or distributed transactions.

### Scope of Kafka EOS

Kafka EOS covers the following atomically:
1. Read from a Kafka source topic.
2. Write to a Kafka sink topic.
3. Commit the source consumer offset.

All three happen atomically — either all succeed or all are rolled back. This is what Kafka Streams uses for its `EXACTLY_ONCE` and `EXACTLY_ONCE_V2` processing guarantees.

### The External DB Problem

```
Read from Kafka (offset 100-200)
Process: compute new balance
Write to PostgreSQL (the result)
Commit offset 200 to Kafka

Kafka EOS guarantees: offset commit + Kafka write are atomic
But: PostgreSQL write is OUTSIDE the Kafka transaction
```

If the app crashes after writing to PostgreSQL but before committing the Kafka offset, on restart it will re-read offsets 100-200, reprocess, and try to write to PostgreSQL again. **Duplicate write to PostgreSQL!**

### Solutions for External Systems

1. **Idempotent writes to external system**:
```java
// Use event_id as idempotency key in PostgreSQL
db.execute("INSERT INTO payments (event_id, amount) VALUES (?, ?) ON CONFLICT (event_id) DO NOTHING",
           event.getId(), event.getAmount());
```

2. **Two-phase commit (XA transactions)**: Kafka and the external DB participate in a distributed transaction. Extremely complex and usually avoided.

3. **Outbox pattern**: Don't write directly to external DB from consumer. Write to an "outbox" table in the DB in the same transaction as your business logic. A separate service reads from the outbox and writes to Kafka (or external system). The outbox acts as a durability buffer.

4. **Change Data Capture (CDC)**: Use Debezium to capture DB changes and publish to Kafka. The CDC ensures exactly-once by design (DB transactions are the source of truth).

### Kafka Streams EOS Configuration

```properties
# Kafka Streams (recommended for most cases)
processing.guarantee=exactly_once_v2  # EOS V2 (Kafka 2.5+, more efficient)
# or
processing.guarantee=exactly_once     # EOS V1 (legacy)
```

EOS V2 uses an optimized protocol that reduces the number of coordination messages compared to V1.

### Honest Assessment

When engineers say "Kafka gives exactly-once," they mean:
- **True**: Within a Kafka transaction (source topic → processing → sink topic + offset commit), exactly-once.
- **Partial**: With an external DB, you need idempotent DB writes on top.
- **False**: If your consumer writes to a non-idempotent external service (e.g., sending an email, charging a credit card), Kafka cannot give you exactly-once for those side effects.

---

## Q50. How Would You Design a Reliable Order Processing System Using Kafka?

This is the capstone design question. Let's build this systematically.

### System Requirements

- Orders arrive at high volume (100k+ events/sec during peak).
- Each order goes through: Created → Payment → Inventory Reserved → Shipped → Delivered.
- No payment charged twice.
- No inventory double-allocated.
- Failed processing retried without data loss.
- Dead-lettered after N retries for manual intervention.
- Full audit trail.

### Architecture

```
OrderService (Producer)
     │
     ▼ (key=orderId, transactional)
┌─────────────────────────────────────────┐
│  Topic: order-events  (24 partitions)   │
│  RF=3, min.insync.replicas=2            │
└─────────────────────────────────────────┘
     │
     ├──────────────────────────┐
     ▼                          ▼
PaymentConsumer           InventoryConsumer
(group: payment-svc)       (group: inventory-svc)
     │                          │
     ├── success → order-events │
     └── fail    → retry-topic  └── fail → retry-topic
                      │
                  RetryConsumer (N times)
                      │
                  DLQ Topic (dead-letter-queue)
                      │
                  AlertService / Manual Review
```

### 1. Partition Key = OrderId

```java
producer.send(new ProducerRecord<>(
    "order-events",
    order.getId(),    // ← partition key = orderId
    orderCreatedEvent
));
```

All events for the same order land in the same partition, ensuring strict ordering. `OrderCreated → PaymentInitiated → InventoryReserved` are always processed in order.

### 2. Transactional Producer

```java
props.put("transactional.id", "order-service-" + instanceId);
props.put("enable.idempotence", "true");
props.put("acks", "all");

producer.initTransactions();

producer.beginTransaction();
try {
    producer.send(orderCreatedRecord);
    producer.send(auditLogRecord);  // Atomic with order creation
    producer.commitTransaction();
} catch (Exception e) {
    producer.abortTransaction();
    throw e;
}
```

### 3. Ordering Guarantees

- `orderId` as key ensures partition locality.
- Idempotent producer prevents retry-induced reordering.
- Each partition is consumed by exactly one consumer in a group.

### 4. Retry Topic

For transient failures (downstream service timeout, DB unavailable):

```
Topic: order-events-retry-1  (same partition count)
Topic: order-events-retry-2
Topic: order-events-retry-3
```

Retry consumer logic:

```java
try {
    processEvent(record);
} catch (RetriableException e) {
    int retryCount = getRetryCount(record.headers());
    if (retryCount < MAX_RETRIES) {
        // Re-publish to next retry topic with delay
        publishToRetryTopic(record, retryCount + 1, delay);
    } else {
        // Exhausted retries → DLQ
        publishToDLQ(record, e);
    }
}
```

Add retry metadata as headers:
```java
headers.add("X-Retry-Count", String.valueOf(retryCount));
headers.add("X-Original-Offset", String.valueOf(record.offset()));
headers.add("X-Error-Message", e.getMessage());
headers.add("X-First-Failed-At", firstFailedAt.toString());
```

Use **exponential backoff** between retries: retry-1 (5s delay), retry-2 (30s delay), retry-3 (5min delay). Implement delay by scheduling the retry consumer to only process messages after a timestamp header.

### 5. DLQ (Dead Letter Queue)

```
Topic: order-events-dlq
  Retention: 30 days (long — for manual review)
  Partitions: 12 (or same as main topic)
  Alerting: consumer lag alert on DLQ consumer
```

DLQ message includes full context:
```json
{
  "originalTopic": "order-events",
  "originalPartition": 3,
  "originalOffset": 14521,
  "orderId": "order-789",
  "eventType": "PaymentInitiated",
  "retryCount": 3,
  "errorMessage": "Payment service timeout after 5s",
  "errorStack": "...",
  "originalPayload": {...},
  "dlqTimestamp": "2024-01-15T10:30:00Z"
}
```

### 6. Idempotent Consumer

```java
@Component
public class PaymentConsumer {
    
    @KafkaListener(topics = "order-events", groupId = "payment-svc")
    public void handleOrderEvent(ConsumerRecord<String, OrderEvent> record) {
        String idempotencyKey = record.topic() + "-" + record.partition() + "-" + record.offset();
        
        if (processedEventRepo.existsById(idempotencyKey)) {
            log.info("Skipping already-processed event: {}", idempotencyKey);
            return;
        }
        
        // Process in a DB transaction: business logic + idempotency record
        transactionTemplate.execute(status -> {
            processPayment(record.value());
            processedEventRepo.save(new ProcessedEvent(idempotencyKey, Instant.now()));
            return null;
        });
    }
}
```

### 7. Offset Commit Strategy

Use **manual commitSync after batch processing** with rebalance listener:

```java
@Override
public void onPartitionsRevoked(Collection<TopicPartition> partitions) {
    // Commit current progress before partitions are reassigned
    try {
        consumer.commitSync(currentOffsets);
    } catch (CommitFailedException e) {
        log.error("Failed to commit on partition revoke", e);
    }
    currentOffsets.clear();
}
```

For bulk processing within a batch, commit the highest successfully processed offset per partition:

```java
Map<TopicPartition, OffsetAndMetadata> offsets = new HashMap<>();
for (ConsumerRecord<String, OrderEvent> record : records) {
    try {
        processEvent(record);
        offsets.put(
            new TopicPartition(record.topic(), record.partition()),
            new OffsetAndMetadata(record.offset() + 1)
        );
    } catch (NonRetriableException e) {
        publishToDLQ(record, e);
        offsets.put(new TopicPartition(record.topic(), record.partition()),
                    new OffsetAndMetadata(record.offset() + 1));
    }
}
consumer.commitSync(offsets);
```

### 8. Failure Handling Summary

| Failure Type | Handling |
|---|---|
| Transient error (timeout) | Retry with backoff via retry topics |
| Permanent error (bad data) | Route to DLQ immediately |
| Consumer crash | Reprocess from last committed offset (idempotent consumer handles duplicates) |
| Broker failure | Kafka replication + acks=all ensures no data loss |
| Duplicate payment | Idempotent consumer + dedup table in payments DB |
| Rebalance | CooperativeStickyAssignor + commitSync on revoke |

### 9. Rebalancing Impact Mitigation

```properties
# Static membership for stable pods
group.instance.id=payment-svc-pod-${POD_NAME}
session.timeout.ms=120000

# Cooperative rebalancing
partition.assignment.strategy=CooperativeStickyAssignor

# Graceful shutdown
heartbeat.interval.ms=3000
max.poll.interval.ms=300000  # Give enough time for batch processing
```

---

# Bonus: Senior/Staff Follow-ups

---

## Q51. What Happens When a Broker Dies?

### Detection

1. **Heartbeat failure**: Each broker sends heartbeats to ZooKeeper (or KRaft controller) every `zookeeper.session.timeout.ms` (default: 18 seconds in ZK mode).
2. **Connection loss**: Other brokers and clients detect TCP connection drops.
3. **KRaft controller detection**: In KRaft mode, the controller gets notification when a broker's network connection drops or heartbeat times out.

### Leader Re-election

For each partition where the dead broker was the **leader**:

1. Controller identifies the partition (from its in-memory metadata).
2. Controller selects the **best ISR member** as the new leader (typically the first ISR member that's alive).
3. Controller updates the partition's leader metadata.
4. Controller sends `LeaderAndIsrRequest` to the new leader broker and `UpdateMetadataRequest` to all other brokers.
5. New leader starts accepting produce/fetch requests.

Time for leader election: typically 1-5 seconds in a healthy cluster.

### Producer Impact

Producers using `bootstrap.servers` have a connection to multiple brokers. When the leader for a partition moves:
1. Next produce request fails with `NotLeaderForPartitionException`.
2. Producer fetches updated metadata (discovers new leader).
3. Producer retries to new leader.
4. Visible as a brief spike in produce latency (usually < 10 seconds).

### Consumer Impact

Similar — fetch requests to the dead broker fail, consumer discovers new leader, resumes fetching. Brief latency spike.

### Data Impact

- If the broker dies cleanly and followers are in ISR: **no data loss**.
- If the broker dies with un-replicated data (followers behind): messages not yet in ISR are **lost** unless `acks=all` was used (in which case writes requiring all ISR to acknowledge would have already been rejected).
- `unclean.leader.election.enable=false` (default) prevents non-ISR replicas from becoming leader, ensuring no data loss at the cost of availability.

---

## Q52. What Happens When the Controller Dies?

### The Controller's Role

The controller (one special broker in ZK mode, or a quorum in KRaft mode) manages:
- Broker liveness tracking.
- Partition leader election.
- Cluster metadata.

### ZooKeeper Mode: Controller Failover

1. Controller broker dies (or loses ZooKeeper session).
2. ZooKeeper session expires. ZK ephemeral node `/controller` is deleted.
3. All brokers race to create the new `/controller` ZK node (first one wins).
4. Winner becomes the new controller.
5. New controller reads cluster state from ZooKeeper.
6. New controller performs any pending leader elections.

**Time**: Controller election typically takes 5-30 seconds in ZooKeeper mode.

**"Zombie controller" problem**: If the old controller is paused (long GC) rather than dead, it might try to perform operations after a new controller has been elected. Kafka handles this via **controller epoch** — all requests include the epoch, and brokers reject requests from controllers with old epochs.

### KRaft Mode: Controller Failover

In KRaft (Kafka 3.x without ZooKeeper), the controller is a Raft quorum (typically 3 controllers):

1. One controller is the active leader.
2. Other controllers are followers (hot standbys).
3. If the active controller dies, the Raft protocol elects a new leader from the remaining quorum (within a few hundred milliseconds).
4. The new controller already has all metadata (replicated via Raft log) — no state reconstruction needed.

**Much faster**: Raft election < 1 second vs ZooKeeper election of 5-30 seconds.

---

## Q53. What is KRaft and Why Was ZooKeeper Removed?

### ZooKeeper's Role (Legacy)

Kafka originally used Apache ZooKeeper for:
- Controller election.
- Storing cluster metadata (broker list, topic configurations, partition assignments, ISR).
- Consumer group management (later moved to `__consumer_offsets`).

### Problems with ZooKeeper

1. **Scalability ceiling**: ZooKeeper has limits on the number of znodes (metadata nodes) and write throughput. Large Kafka clusters (millions of partitions) hit ZooKeeper bottlenecks.
2. **Operational complexity**: ZooKeeper is a separate system requiring its own expertise, separate monitoring, separate upgrades.
3. **Slow metadata operations**: Broker start time grows with cluster size because the new controller reads all metadata from ZooKeeper synchronously. A broker restart in a 200,000-partition cluster could take minutes.
4. **Split-brain risks**: Network partition between Kafka and ZooKeeper can cause inconsistent state.
5. **Two systems to manage**: Ops teams need expertise in both Kafka and ZooKeeper.

### KRaft (Kafka Raft Metadata Mode)

KRaft (KIP-500) replaces ZooKeeper with a **built-in Raft consensus protocol** for metadata management.

**Architecture**:
- A set of 3 (or 5) brokers are designated as **controller nodes**.
- Controller nodes form a Raft quorum — they elect a leader among themselves.
- The controller leader manages all cluster metadata.
- Metadata is stored in a special internal topic `@metadata` (replicated via Raft).
- Regular brokers are "metadata followers" — they receive metadata updates from controllers via a streaming protocol.

**Became production-ready**: Kafka 3.3 (October 2022).
**ZooKeeper support removed**: Kafka 4.0 (2024).

### Benefits of KRaft

| Aspect | ZooKeeper Mode | KRaft Mode |
|---|---|---|
| Broker startup time | Minutes for large clusters | Seconds |
| Max partitions per cluster | ~200,000 | Millions |
| Controller failover | 5-30 seconds | < 1 second |
| Operational systems | Kafka + ZooKeeper | Kafka only |
| Metadata consistency | Eventually consistent | Strong consistency via Raft |
| Scaling operations | Complex rolling upgrades | Simpler |

---

## Q54. How Does Leader Election Work?

### Partition Leader Election Process

When a partition needs a new leader (broker death, manual reassignment):

1. **Controller detects**: The controller (via ZK watcher or KRaft heartbeat) detects that the current leader's broker is dead.

2. **ISR check**: Controller looks at the ISR for the partition. It selects the **first live broker in the ISR list** as the new leader.
   - ISR is maintained in the metadata: `[broker1, broker2, broker3]` (the leader is always first).
   - After controller selects, say, broker2, the new ISR = `[broker2, broker3]` (broker1 removed as it's dead).

3. **LeaderAndIsrRequest**: Controller sends `LeaderAndIsrRequest` to broker2 (now the leader) and broker3 (follower), telling them the new leadership.

4. **UpdateMetadataRequest**: Controller broadcasts the new metadata to ALL brokers.

5. **Client refresh**: Producers and consumers will get `NotLeaderOrFollowerException` on their next request to the old leader. They refresh metadata and connect to broker2.

### Preferred Leader Election

Each partition has a **preferred leader** — the broker listed first in the partition's replica assignment. After a failed broker comes back online, Kafka can run **preferred leader election** to move leadership back to the preferred broker.

Controlled by `auto.leader.rebalance.enable=true` (default: true). The controller periodically checks if preferred leaders are out of balance and triggers elections to restore balance.

### Unclean Leader Election

By default, `unclean.leader.election.enable=false`. This means:
- If ALL ISR members are down, Kafka waits — the partition is unavailable until an ISR member comes back.
- This prevents electing a lagging (non-ISR) replica as leader, which would cause data loss.

Setting `unclean.leader.election.enable=true`:
- Allows a non-ISR replica to become leader if no ISR member is available.
- Restores availability at the cost of potentially losing some messages.
- Appropriate for use cases where availability > durability (metrics, logs).

---

## Q55. What is min.insync.replicas?

### Definition

`min.insync.replicas` (misr) specifies the **minimum number of replicas that must acknowledge a write** for it to be considered successful when `acks=all` is set.

### The Problem It Solves

With `acks=all` and ISR size = 1 (only the leader is in-sync), `acks=all` becomes equivalent to `acks=1` — the leader just waits for itself. If the leader then crashes, the message is lost. `min.insync.replicas` prevents this degradation.

### Configuration

```properties
# Broker/topic config
min.insync.replicas=2

# Producer config (must be set together)
acks=all
```

**Behavior**: If the ISR size drops below `min.insync.replicas`, the broker **refuses writes** with `NotEnoughReplicasException`. Producers see an error rather than a silent durability downgrade.

### The Classic Formula

```
Safe configuration for RF=3:
  replication.factor = 3
  min.insync.replicas = 2
  acks = all

This means:
  - Writes require 2 of 3 replicas to acknowledge
  - System can survive 1 broker failure
  - If 2 brokers are down → writes fail (availability sacrificed for consistency)
```

### Trade-off: Availability vs Durability

```
min.insync.replicas=1: High availability, low durability (effectively acks=1)
min.insync.replicas=2: Good balance (survives 1 failure, tolerates 1 offline)
min.insync.replicas=3: Maximum durability, minimum availability (all 3 must be up)
```

**For a payment system**: Use RF=3, min.insync.replicas=2. You can afford a brief write pause if 2 brokers die (extremely rare). You cannot afford data loss.

**For a metrics system**: Use RF=3, min.insync.replicas=1. Availability is more important than perfect durability.

---

## Q56. Difference Between Retention and Compaction?

### Retention

**Time-based retention** (`retention.ms`): Messages are kept for a specified duration. After that, entire segment files are deleted.

```
retention.ms=604800000  # 7 days
```

**Size-based retention** (`retention.bytes`): When the total size of a partition's log exceeds this threshold, the oldest segment is deleted.

```
retention.bytes=10737418240  # 10 GB per partition
```

**Use case**: Event streaming where you want a rolling window of recent events. "Give me all events from the last 7 days." After 7 days, old events are gone.

### Log Compaction

Log compaction retains **the latest value for each key** indefinitely (until the key's latest value is a tombstone — null — which itself is retained for a configured period before deletion).

```properties
cleanup.policy=compact  # or "delete" (default) or "compact,delete" (both)
```

**How it works**: A background compaction thread scans old segments, identifies duplicate keys, keeps only the latest value, and writes a new compacted segment:

```
Before compaction:
  offset 0: key=user-1, value={"name": "Alice"}
  offset 1: key=user-2, value={"name": "Bob"}
  offset 2: key=user-1, value={"name": "Alice Smith"}  ← newer value for user-1
  offset 3: key=user-3, value={"name": "Charlie"}
  offset 4: key=user-2, value=null  ← tombstone (user-2 deleted)

After compaction:
  key=user-1 → {"name": "Alice Smith"}  (latest value)
  key=user-3 → {"name": "Charlie"}      (only value)
  [user-2 tombstone: retained briefly, then deleted]
```

**Use case**: Maintaining a **current state** snapshot. If you replay the compacted topic, you get the latest state of every entity. Examples:
- User profiles (latest profile for each userId).
- Product catalog (latest price/description for each productId).
- Kafka Streams changelog topics (KTable state).
- Debezium CDC topics (current DB row state).

### Comparison

| Feature | Retention (delete) | Compaction |
|---|---|---|
| What's deleted | Old messages by time/size | Duplicate keys (keeping latest) |
| Guarantees | Messages available for retention period | Latest value for each key always available |
| Storage | Bounded by time/size | Bounded by number of unique keys |
| Use case | Event log with time window | Current state / changelog |
| Consumer behavior | Can replay events in window | Can reconstruct current state |
| Tombstones | N/A | null value marks deletion |

---

## Q57. How Does Log Compaction Work?

### Compaction Architecture

```
Partition:
  [Head]  ←── Active segment (not compacted, recent writes)
  [Tail]  ←── Older segments (candidates for compaction)
```

A **log cleaner thread pool** runs compaction on the tail (older segments). The head is never compacted (it's actively being written to).

### The Compaction Process

1. **Log Cleaner Selection**: Kafka selects the partition with the highest ratio of `dirty bytes` (bytes since last compaction) to `total bytes`. Config: `log.cleaner.min.cleanable.ratio=0.5` (compact when > 50% of data is dirty).

2. **Building the Offset Map**: The cleaner reads the dirty (uncompacted) portion and builds an in-memory map of `key → latest_offset`. This identifies which messages are "superseded" (have a newer version).

3. **Copying**: The cleaner rewrites old segments, copying only messages whose offset matches the latest offset in the map (i.e., they're the current version of their key).

4. **Tombstone Handling**: Tombstones (null-value messages) are retained for `log.cleaner.delete.retention.ms` (default: 24 hours) after the last record in the topic. This gives all consumers time to see the deletion event before it disappears.

5. **Swap**: The original segments are replaced with the compacted versions atomically.

### Key Properties of Compacted Topics

- **Ordering preserved within compacted log**: Messages are in offset order in the compacted log.
- **Offsets can have gaps**: After compaction, offset 0, 1, 2, 4 (offset 3 was compacted away) is valid. Consumers handle this gracefully.
- **New consumers can bootstrap**: A consumer starting from `earliest` will see the current state of all keys. It won't see historical intermediate states (those were compacted away), but it gets the current snapshot.
- **`log.cleaner.min.compaction.lag.ms`**: Messages are not eligible for compaction until they're at least this old (default: 0). Useful to ensure recent writes are visible for a minimum time before being overwritten by compaction.

---

## Q58. Why Is Kafka Not a Traditional Message Queue?

### Traditional Message Queue (RabbitMQ, ActiveMQ, SQS)

| Property | Traditional MQ | Kafka |
|---|---|---|
| Message consumption | Message deleted after consumption | Message persisted; consumers track offset |
| Multiple consumers | Each message delivered to one consumer | Each consumer group gets all messages |
| Replay | Generally impossible | Consumers can seek to any past offset |
| Consumer speed | MQ buffers for slow consumers (bounded) | Kafka log is the buffer (durable, large) |
| Ordering | Queue ordering (FIFO per queue) | Per-partition ordering |
| Storage | Short-term (message gone after consume) | Long-term (configured retention) |
| Use case | Task distribution, work queues | Event streaming, event sourcing |
| Push/Pull | Push-based | Pull-based |

### What Makes Kafka Different

1. **Consumers don't "consume" messages**: Reading a message doesn't remove it from Kafka. Multiple consumer groups can independently read the same message. In a traditional queue, message consumption is destructive.

2. **Retention is time/size-based, not consumption-based**: Messages stay for 7 days (or whatever retention) regardless of whether anyone read them.

3. **Replay**: This is impossible in a traditional MQ but trivial in Kafka — just reset the consumer offset to the beginning.

4. **The log is the state**: Kafka is a distributed, replicated, fault-tolerant log. This makes it suitable for event sourcing — your entire application state can be reconstructed by replaying the Kafka log.

5. **Pull-based consumers**: Consumers control their read rate. The broker doesn't push messages. This allows consumers to slow down without backpressure, and fast consumers to batch efficiently.

---

## Q59. Kafka vs RabbitMQ?

| Dimension | Kafka | RabbitMQ |
|---|---|---|
| **Model** | Distributed log / event streaming | Message broker / work queue |
| **Throughput** | Millions of messages/sec | Tens of thousands/sec |
| **Latency** | Low (ms range) | Very low (sub-ms with memory queues) |
| **Message retention** | Configurable (days, weeks) | Until consumed or TTL |
| **Replay** | Yes (by resetting offset) | No |
| **Routing** | Partition key → partition | Exchange → queue bindings (fanout, direct, topic, headers) |
| **Ordering** | Per-partition | Per-queue |
| **Consumer model** | Pull, consumer groups | Push (default) or pull |
| **Message filtering** | Limited (at consumer) | Flexible (exchange routing keys, headers) |
| **Delivery guarantees** | At-least-once, exactly-once (within Kafka) | At-least-once, at-most-once |
| **Use cases** | Event streaming, event sourcing, log aggregation, stream processing | Task queues, RPC, request/reply, complex routing |
| **Protocol** | Kafka binary protocol | AMQP, MQTT, STOMP |
| **Operations** | Complex (more moving parts) | Relatively simpler |

**Choose Kafka when**: High throughput, event replay, multiple independent consumers, event sourcing, stream processing.

**Choose RabbitMQ when**: Complex routing rules, request/reply patterns, per-message TTL/priority, small teams who need operational simplicity, standard AMQP protocol support.

---

## Q60. Kafka vs SQS?

| Dimension | Kafka | Amazon SQS |
|---|---|---|
| **Type** | Self-managed distributed log | Fully managed message queue |
| **Throughput** | Millions/sec (with proper sizing) | 300 msg/sec (standard) / 3000/sec (FIFO) |
| **Retention** | Up to 2 TB per partition (configurable) | Up to 14 days |
| **Replay** | Yes | No (message deleted after consume) |
| **Multiple consumers** | Yes (consumer groups) | No (one consumer per message, sort of) |
| **Ordering** | Per-partition | Only with FIFO queues |
| **Operational overhead** | High (you manage it) | Zero (fully managed) |
| **Cost** | Infrastructure cost | Per-message pricing |
| **Visibility timeout** | N/A | Yes (message invisible during processing) |
| **Long polling** | Yes (fetch.max.wait.ms) | Yes (up to 20s) |
| **On-premises** | Yes | AWS only |

**Choose Kafka when**: Multi-consumer fan-out, event replay needed, on-premises, high throughput, stream processing, not on AWS.

**Choose SQS when**: AWS ecosystem, simple work queue, fully managed, lower throughput requirements, simpler operations.

---

## Q61. Kafka vs Pulsar?

Apache Pulsar is a newer event streaming system that was created at Yahoo.

| Dimension | Kafka | Pulsar |
|---|---|---|
| **Storage** | Broker-based (partitions stored on broker disk) | Separate compute/storage (Apache BookKeeper) |
| **Scalability** | Add brokers (rebalance needed) | Add broker or storage independently |
| **Geo-replication** | MirrorMaker2 (complex) | Built-in, first-class |
| **Multi-tenancy** | Namespace-based | First-class (tenant/namespace/topic hierarchy) |
| **Tiered storage** | Via plugins | Built-in (offload to S3/GCS) |
| **Message TTL** | Topic-level only | Per-message TTL |
| **Schema registry** | External (Confluent) | Built-in schema registry |
| **Cursor management** | Consumer manages offset | Pulsar manages cursor (server-side) |
| **Ordering** | Per-partition | Per-topic or per-key |
| **Maturity** | Very mature (10+ years) | Newer (5+ years) |
| **Ecosystem** | Huge (Kafka Streams, ksqlDB, Flink, Spark) | Growing |
| **Operational complexity** | Kafka + ZK/KRaft | Kafka + BookKeeper + ZK |

**Key Pulsar advantage**: Storage and compute separation via BookKeeper means you can add consumers without rebalancing storage. Topic expansion doesn't require data migration.

**Key Kafka advantage**: Maturity, ecosystem, battle-tested at scale, simpler architecture.

---

## Q62. How Would You Migrate a Monolith to Event-Driven Architecture Using Kafka?

### The Strangler Fig Pattern

Don't rewrite everything at once. Strangle the monolith by extracting one domain at a time.

### Step-by-Step Migration

**Phase 1: Event Capture — Outbox Pattern**

Don't change the monolith's code yet. Instead, capture events via **Debezium CDC** (Change Data Capture):

```
Monolith DB (PostgreSQL) → Debezium Connector → Kafka
```

Debezium reads the PostgreSQL WAL (Write-Ahead Log) and publishes change events to Kafka topics. Zero monolith code changes.

**Phase 2: Dual Write + Parallel Processing**

Start building new microservices that consume from Kafka topics:

```
Monolith still handles requests AND writes to DB.
New OrderService reads from order-events Kafka topic.
Both systems run in parallel for shadowing/validation.
```

**Phase 3: Strangler Switch**

Route new requests to the new microservice. The microservice reads from Kafka and has its own DB. Old monolith code paths are put behind a feature flag.

**Phase 4: Monolith Code Removal**

After the new service is validated in production, remove the old code from the monolith.

### Key Patterns to Use

1. **Outbox Pattern**: Monolith writes to an `outbox` table in the same DB transaction as business logic. Debezium reads the outbox and publishes to Kafka. This guarantees at-least-once delivery from monolith to Kafka.

2. **Saga Pattern**: Replace distributed transactions with choreography (each service reacts to events and emits new events) or orchestration (a saga orchestrator coordinates the sequence).

3. **CQRS**: Separate read models (projections built from Kafka streams) from write models (commands go to services that produce events).

4. **Event Sourcing**: Store all state changes as events in Kafka. Current state is derived by replaying events.

---

## Q63. How Would You Handle Poison Messages?

A **poison message** (also "poison pill") is a message that repeatedly causes consumer processing to fail and blocks progress.

### The Problem

```
Consumer: poll [msg1, msg2, POISON, msg4, msg5]
Process msg1 → success
Process msg2 → success
Process POISON → exception!
Retry POISON → exception again!
Retry POISON → exception again!
...
Consumer is stuck. msg4, msg5 never processed. Consumer lag grows forever.
```

### Detection

A poison message typically:
- Fails with a `NonRetriableException` (bad data, schema mismatch, null pointer due to malformed payload).
- Fails consistently (not intermittently).
- Causes the consumer to throw the same exception on every retry.

### Solution 1: Dead Letter Queue (DLQ) with Max Retries

```java
int maxRetries = 3;

for (ConsumerRecord<K,V> record : records) {
    int retries = getRetryCount(record);
    try {
        process(record);
    } catch (Exception e) {
        if (retries >= maxRetries || isNonRetriable(e)) {
            // Send to DLQ and move on
            publishToDLQ(record, e);
        } else {
            publishToRetryTopic(record, retries + 1);
        }
        // Regardless, commit this offset so we don't block on this message
        commitOffset(record);
    }
}
```

**Key**: Always commit the poison message's offset after routing it to DLQ/retry. Don't let it block the partition.

### Solution 2: Spring Kafka DeadLetterPublishingRecoverer

Spring Kafka has built-in dead letter support:

```java
@Bean
public DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
    DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(template,
        (record, ex) -> new TopicPartition(record.topic() + ".DLQ", record.partition()));
    
    return new DefaultErrorHandler(recoverer, 
        new FixedBackOff(1000L, 3L)); // 3 retries, 1s apart
}
```

### Solution 3: Schema Validation Before Processing

Validate messages against their schema (Avro, Protobuf, JSON Schema) before processing. Malformed messages get routed to DLQ immediately without any processing attempts:

```java
try {
    OrderEvent event = avroDeserializer.deserialize(record.value());
    validateEvent(event);  // check required fields, business rules
    processEvent(event);
} catch (SchemaException | ValidationException e) {
    // Definitely not a transient error — send to DLQ immediately
    publishToDLQ(record, e);
    commitOffset(record);
}
```

### Solution 4: Circuit Breaker on DLQ

Monitor the DLQ consumer lag. If DLQ is filling up rapidly, alert the team (it means your main pipeline has a systematic issue, not just occasional bad messages).

---

## Q64. How Would You Retry Failed Events?

### Retry Architecture

The cleanest pattern for Kafka retry is a **multi-level retry topic hierarchy**:

```
main-topic
    ↓ (fail, retryable)
retry-topic-1  (process after 1 minute delay)
    ↓ (fail again)
retry-topic-2  (process after 10 minutes delay)
    ↓ (fail again)
retry-topic-3  (process after 1 hour delay)
    ↓ (fail again)
dead-letter-queue  (human review)
```

### Implementing Delay in Retry Topics

Kafka doesn't natively support message scheduling/delay. Two patterns:

**Pattern 1: Timestamp-based delay in consumer**

Include a `process_after` timestamp in the retry message headers:

```java
// Producer side when routing to retry:
headers.add("process-after", 
    String.valueOf(System.currentTimeMillis() + retryDelayMs));

// Consumer side of retry topic:
ConsumerRecords<K,V> records = consumer.poll(Duration.ofMillis(500));
for (ConsumerRecord<K,V> record : records) {
    long processAfter = Long.parseLong(record.headers().lastHeader("process-after").value());
    if (System.currentTimeMillis() < processAfter) {
        // Too early — pause this partition briefly and re-seek
        consumer.pause(Set.of(new TopicPartition(record.topic(), record.partition())));
        consumer.seek(new TopicPartition(record.topic(), record.partition()), record.offset());
        Thread.sleep(100); // brief pause before next poll
        consumer.resume(Set.of(new TopicPartition(record.topic(), record.partition())));
        break;
    }
    processRetry(record);
}
```

**Pattern 2: Dedicated scheduled consumer per retry level**

Each retry topic has a dedicated consumer with a sleep at the start:

```java
// RetryLevel1Consumer: runs every 1 minute
// RetryLevel2Consumer: runs every 10 minutes
// These are cron-like consumers that only poll periodically
```

### Adding Context to Retried Messages

Always include retry context in headers:

```java
headers.add("X-Original-Topic", record.topic());
headers.add("X-Original-Partition", String.valueOf(record.partition()));
headers.add("X-Original-Offset", String.valueOf(record.offset()));
headers.add("X-Retry-Count", String.valueOf(retryCount + 1));
headers.add("X-Last-Error", truncate(exception.getMessage(), 500));
headers.add("X-Last-Failed-At", Instant.now().toString());
headers.add("X-First-Failed-At", getOrSet(record, "X-First-Failed-At", Instant.now().toString()));
```

### Replay from DLQ

Once you've fixed the bug causing failures, you need to replay the DLQ:

```bash
# Tool to re-publish DLQ messages back to the original topic
kafka-consumer-groups.sh --reset-offsets --group dlq-replayer \
  --topic order-events.DLQ --to-earliest --execute

# Or write a simple "DLQ Replayer" service
```

---

## Q65. How Would You Process 1 Million Events/Sec?

### Hardware Baseline

A well-configured Kafka broker can handle 100k-500k events/sec. To hit 1M events/sec:

**Brokers**: Start with 5-10 brokers, each with:
- 64-128 GB RAM (for OS page cache)
- 12+ CPU cores
- Fast NVMe SSDs (1-2 GB/s sequential write)
- 10 Gbps network
- Multiple data disks (Kafka can use multiple `log.dirs` to stripe I/O across disks)

### Topic Configuration

```properties
# Enough partitions for parallelism
# Rule of thumb: 2x your peak consumer count
num.partitions=100

# Fast replication
replication.factor=3
min.insync.replicas=2

# Large segment size for efficient storage
log.segment.bytes=1073741824  # 1 GB segments
```

### Producer Tuning

```properties
# Aggressive batching
linger.ms=20
batch.size=1048576        # 1 MB batches
compression.type=lz4       # Fast compression

# High throughput parallelism
acks=1                     # Not acks=all for max throughput
max.in.flight.requests.per.connection=10

# Large memory buffer
buffer.memory=134217728    # 128 MB
```

**Multiple producer instances**: Run 10-20 producer threads or processes in parallel, each writing to different sets of partitions.

### Consumer Tuning

```properties
# Fetch large batches
fetch.min.bytes=1048576    # 1 MB minimum fetch
fetch.max.bytes=52428800   # 50 MB max per fetch
max.partition.fetch.bytes=1048576  # 1 MB per partition

# Process more per poll
max.poll.records=5000
```

**Consumer parallelism**: One consumer thread per partition. With 100 partitions and 100 consumer threads (across 10 machines), you can achieve very high throughput.

### Application-Level Parallelism

Don't process records serially in the consumer loop. Use async processing:

```java
// Multi-threaded consumer processing
ExecutorService executor = Executors.newFixedThreadPool(32);

while (true) {
    ConsumerRecords<K,V> records = consumer.poll(Duration.ofMillis(100));
    
    List<Future<?>> futures = new ArrayList<>();
    for (ConsumerRecord<K,V> record : records) {
        futures.add(executor.submit(() -> processRecord(record)));
    }
    
    // Wait for all to complete before committing
    for (Future<?> f : futures) f.get();
    consumer.commitSync();
}
```

**Warning**: Multi-threaded consumer processing sacrifices per-record ordering guarantees. Ensure your processing logic is truly parallelizable.

### Use Stream Processing Frameworks

For complex transformations at 1M events/sec, use:
- **Kafka Streams**: Native Kafka stream processing, scales by adding application instances.
- **Apache Flink**: More powerful, handles stateful aggregations, windowing.
- **Apache Spark Structured Streaming**: For batch-oriented streaming.

---

## Q66. How Would You Guarantee Ordering and Scalability Simultaneously?

This is the classic tension: ordering requires a single partition, scalability requires many partitions.

### The Solution: Partition by Natural Ordering Key

The key insight is: **you don't need global ordering. You need per-entity ordering.**

```
Global order (impossible at scale):
  All 1M events/sec in one partition → 1 consumer → no scalability

Per-entity order (achievable):
  All events for entity X in partition P(X) → ordered per entity
  Events across different entities can be in any order → irrelevant to business logic
```

### Design Principle: Choose the Right Partition Key

The partition key defines your "ordering scope." Choose the smallest scope that satisfies your business requirements:

| Business Requirement | Partition Key |
|---|---|
| All orders for a customer in order | customerId |
| All events for a specific order in order | orderId |
| All financial transactions per account | accountId |
| All IoT sensor readings per device | deviceId |
| All changes per user profile | userId |

### Pattern: Multi-Level Keys for Different Granularities

If you need ordering at multiple levels, consider compound keys:

```java
// Order within a customer, but parallelism across customers
String partitionKey = customerId; // Ensures all customer's orders are ordered

// If customerId has hot partition issues (big customer has too many orders):
// Use customerId + time bucket for better distribution
String partitionKey = customerId + "-" + (System.currentTimeMillis() / 3600000); // per hour
// Accept that ordering is only within an hour per customer
```

### Pattern: Consistent Hashing for Stable Routing

For cases where partition count may change, use consistent hashing:

```java
// Map entity to a "virtual partition" (e.g., 0-999)
int virtualPartition = Math.abs(entityId.hashCode()) % 1000;

// Map virtual partition to actual partition
int actualPartition = virtualPartition % numActualPartitions;
```

When actual partition count changes, only ~1/N of virtual partitions need to remap (much better than standard modulo hashing).

### Pattern: Kafka Streams for Ordered Aggregations

For stateful ordered processing across many partitions, use Kafka Streams with `.groupByKey()` — Streams automatically handles repartitioning and ensures all records for a key are co-located for stateful processing.

---

## Q67. How Would You Prevent Duplicate Payments?

This is a critical real-world problem. Let's solve it completely.

### The Problem

Payment processing involves:
1. Consumer reads `PaymentRequested` event from Kafka.
2. Consumer calls external payment gateway (Stripe, Braintree, etc.).
3. Payment gateway charges the card.
4. Consumer commits offset.

If the consumer crashes after step 3 but before step 4, on restart it will re-read the `PaymentRequested` event and call the gateway again → **customer charged twice**.

### Layer 1: Idempotency Key at the Payment Gateway

Every payment API call includes an **idempotency key**:

```java
String idempotencyKey = generateIdempotencyKey(record);
// e.g., "payment-req-" + record.topic() + "-" + record.partition() + "-" + record.offset()
// or better: the business-level paymentRequestId from the event

StripeCharge charge = stripe.charges().create(
    new ChargeCreateParams.Builder()
        .setAmount(event.getAmount())
        .setCurrency("usd")
        .setSource(event.getCardToken())
        .setIdempotencyKey(idempotencyKey)  // ← Stripe deduplicates on this key
        .build()
);
```

If the same idempotency key is used within 24 hours (Stripe's window), Stripe returns the original charge result rather than creating a new charge. **Stripe handles the deduplication.**

### Layer 2: Idempotency Record in Your DB

Persist the idempotency key in your own database alongside the payment record:

```sql
CREATE TABLE payment_processed (
    idempotency_key VARCHAR(255) PRIMARY KEY,
    payment_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    processed_at TIMESTAMP NOT NULL,
    kafka_topic VARCHAR(255),
    kafka_partition INT,
    kafka_offset BIGINT
);
```

```java
// Check if already processed
if (paymentRepo.existsByIdempotencyKey(idempotencyKey)) {
    log.info("Duplicate payment request {}, skipping", idempotencyKey);
    return;
}

// Charge the card
ChargeResult result = stripe.charge(idempotencyKey, amount, cardToken);

// Record in DB (transactional with any other business updates)
paymentRepo.save(new PaymentRecord(idempotencyKey, result.getChargeId(), amount, "COMPLETED"));
```

### Layer 3: Kafka Transactions for Atomic Offset Commit

```java
producer.initTransactions();
// Use transactional.id = "payment-processor-" + instanceId

producer.beginTransaction();
try {
    // Record the payment outcome
    producer.send(new ProducerRecord<>("payment-completed", orderId, paymentCompletedEvent));
    
    // Atomically commit the input offset with the output
    producer.sendOffsetsToTransaction(
        Map.of(inputTopicPartition, new OffsetAndMetadata(record.offset() + 1)),
        consumer.groupMetadata()
    );
    
    producer.commitTransaction();
} catch (Exception e) {
    producer.abortTransaction();
    // Retry or handle error
}
```

### Combined Protection

```
Request Layer: Idempotency key validates at API gateway level
Processing Layer: Check DB for processed key before calling Stripe
External Layer: Stripe deduplicates on idempotency key
Kafka Layer: Transactional offset commit prevents reprocessing
```

With all four layers, a duplicate payment becomes essentially impossible.

---

## Q68. How Would You Design an Audit / Event Sourcing System Using Kafka?

### Event Sourcing Overview

In event sourcing, the **event log is the source of truth**, not a database of current state. Current state is a **projection** (derived from replaying events).

```
Traditional: DB stores current state (mutated in place)
Event Sourcing: Kafka stores all state changes; current state = replay of events
```

### Design

**Topics**:

```
order-events  (compacted + time-based retention, 7 years for audit)
  key = orderId
  value = {eventType, orderId, payload, timestamp, userId, version}

audit-log  (append-only, very long retention, never compacted)
  key = userId (or entityId)
  value = {action, resource, userId, ipAddress, timestamp, result}
```

**Producer**:

```java
// Every state change produces an event
public Order createOrder(CreateOrderCommand cmd) {
    Order order = new Order(cmd);
    
    OrderCreatedEvent event = new OrderCreatedEvent(
        order.getId(),
        cmd.getUserId(),
        cmd.getItems(),
        Instant.now(),
        nextVersion(order.getId())
    );
    
    // Publish to Kafka
    kafka.send("order-events", order.getId(), event);
    
    return order;
}
```

**Projection (Read Model)**:

```java
@KafkaListener(topics = "order-events", groupId = "order-projection")
public void buildProjection(ConsumerRecord<String, OrderEvent> record) {
    OrderEvent event = record.value();
    
    switch (event.getType()) {
        case "OrderCreated":
            orderProjectionRepo.save(new OrderView(event)); break;
        case "OrderShipped":
            orderProjectionRepo.updateStatus(event.getOrderId(), "SHIPPED"); break;
        case "OrderCancelled":
            orderProjectionRepo.updateStatus(event.getOrderId(), "CANCELLED"); break;
    }
}
```

### Benefits for Audit

1. **Complete history**: Every change is a distinct event in the log. You can always answer "who did what, when, and what was the state before/after?"
2. **Time travel**: Replay events up to any point in time to see what the state was at that moment.
3. **Compliance**: Long retention (7 years for financial data) satisfies regulatory requirements.
4. **Root cause analysis**: When something goes wrong, replay events to see exactly what sequence of actions led to the incorrect state.

### Temporal Queries

```java
// "What was the state of order-456 on Jan 1, 2024?"
consumer.assign(List.of(orderPartitionForKey("456")));
consumer.seek(orderPartitionForKey("456"), 
    consumer.offsetsForTimes(Map.of(partition, jan1Timestamp)).get(partition).offset());

List<OrderEvent> eventsUntilJan1 = new ArrayList<>();
while (true) {
    records = consumer.poll(...);
    for (var r : records) {
        if (r.timestamp() > jan1Timestamp) break;
        eventsUntilJan1.add(r.value());
    }
}

// Replay events to reconstruct state
Order orderOnJan1 = replayEvents(eventsUntilJan1);
```

---

## Q69. How Would You Monitor Kafka in Production?

### Consumer Lag (Most Critical Metric)

**Consumer lag** = `LogEndOffset - CommittedOffset` for each `(group, topic, partition)`.

- **Lag = 0**: Consumer is real-time.
- **Lag growing**: Consumer can't keep up — investigate processing bottlenecks, consumer crashes, or producer spike.
- **Lag stuck at same value**: Consumer is down — not processing at all.

```bash
# CLI
kafka-consumer-groups.sh --describe --group payment-service \
  --bootstrap-server broker:9092

# Programmatic (using AdminClient)
adminClient.listConsumerGroupOffsets(group)
```

**Alert thresholds**: Set lag alerts at 1000 messages (warning) and 10000 messages (critical) — tune based on your processing SLAs.

### ISR Count

Monitor `kafka.server:type=ReplicaManager,name=IsrShrinksPerSec` and `IsrExpandsPerSec`.

- Frequent ISR shrinks indicate broker performance issues, GC pauses, or network problems.
- If ISR size drops to 1 for a critical partition and `min.insync.replicas=2`, **writes will fail**.

### Broker Health

- **Broker under-replicated partitions**: `kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions` — should be 0 in a healthy cluster.
- **Active controller count**: Should be exactly 1. 0 = no controller (critical), >1 = split-brain (impossible but alert-worthy).
- **Request handler idle ratio**: `kafka.server:type=KafkaRequestHandlerPool,name=RequestHandlerAvgIdlePercent` — below 30% means broker is overwhelmed.
- **Network idle ratio**: Similar — if < 30%, network is saturated.

### Throughput

- **Bytes In/Out per second**: Per broker and per topic. Helps identify hot brokers.
- **Messages In per second**: Producer throughput.
- **Request rate**: Produce and fetch request rates per broker.

### Rebalance Count

High rebalance frequency indicates:
- Unstable consumer group (crashes, GC pauses).
- Wrong `max.poll.interval.ms` (processing takes too long).
- Rolling deployments triggering rebalances (use static membership).

Monitor `kafka.coordinator.group:type=GroupMetadataManager,name=NumGroups` and `NumOffsets`.

### Tools

| Tool | Purpose |
|---|---|
| **Prometheus + JMX Exporter** | Export Kafka JMX metrics to Prometheus |
| **Grafana** | Dashboard visualization |
| **Burrow (LinkedIn)** | Advanced consumer lag monitoring |
| **Conduktor / Kafka UI** | Web UI for cluster management and monitoring |
| **Confluent Control Center** | Enterprise monitoring (paid) |
| **Datadog Kafka Integration** | Pre-built dashboards and alerts |

---

## Q70. What Kafka Metrics Do You Always Monitor?

Here's a production-grade monitoring checklist. These are the metrics that matter most:

### Consumer Metrics

| Metric | JMX Path | Alert Condition |
|---|---|---|
| **Consumer Lag** | `kafka.consumer:type=consumer-fetch-manager-metrics,client-id=X,records-lag-max` | > 10,000 (critical) |
| **Records Consumed Rate** | `records-consumed-rate` | Sudden drop = consumer stopped |
| **Fetch Rate** | `fetch-rate` | Should match poll frequency |
| **Commit Rate** | `commit-rate` | Should be positive; 0 = consumer down |
| **Rebalance Rate** | `rebalance-rate-per-hour` | > 1/hour = investigate |

### Producer Metrics

| Metric | JMX Path | Alert Condition |
|---|---|---|
| **Record Error Rate** | `record-error-rate` | > 0 = produce failures |
| **Record Send Rate** | `record-send-rate` | Sudden drop = producer issue |
| **Batch Size Avg** | `batch-size-avg` | Too small = increase linger.ms |
| **Request Latency Avg** | `request-latency-avg` | Spike = broker issue |
| **Buffer Exhausted Rate** | `buffer-exhausted-rate` | > 0 = producer too slow |

### Broker Metrics

| Metric | JMX Path | Alert Condition |
|---|---|---|
| **Under-Replicated Partitions** | `kafka.server:UnderReplicatedPartitions` | > 0 (critical) |
| **Active Controller** | `kafka.controller:ActiveControllerCount` | ≠ 1 (critical) |
| **Offline Partitions** | `kafka.controller:OfflinePartitionsCount` | > 0 (critical) |
| **Leader Election Rate** | `LeaderElectionRateAndTimeMs` | Spike = broker failures |
| **Bytes In/Out** | `BrokerTopicMetrics:BytesInPerSec` | Threshold based on network capacity |
| **Request Handler Idle** | `RequestHandlerAvgIdlePercent` | < 30% (warning) |
| **Log Flush Latency** | `LogFlushRateAndTimeMs` | High = disk I/O problem |
| **Disk Utilization** | OS metric | > 70% (warning), > 85% (critical) |

### The "Must-Alert-On" Short List

If you only have time to set up 5 alerts:

1. **Consumer lag > threshold per group**: Direct impact on processing SLA.
2. **Under-replicated partitions > 0**: Durability at risk.
3. **Offline partitions > 0**: Data unavailable.
4. **Active controller count ≠ 1**: Cluster management broken.
5. **Broker disk usage > 80%**: Risk of broker failure from disk full.

---

## Q71. What are the Most Common Issues with Kafka and Serverless Lambdas?

Serverless functions like AWS Lambda consuming from Kafka can introduce unique challenges, primarily around impedance mismatch between scale and state.

### 1. Connection Exhaustion Downstream
**Issue**: Lambda can scale out massively (e.g., to hundreds of instances) in response to a surge in Kafka messages. If each Lambda opens a database connection, it can easily exhaust the DB connection pool.
**Mitigation**: 
- Limit the maximum concurrency of the Lambda function.
- Use a connection proxy (like AWS RDS Proxy or PgBouncer) to multiplex connections.
- Batch messages to process more records per Lambda invocation.

### 2. Poison Pill Messages and Stuck Partitions
**Issue**: If a Lambda fails to process a message in a batch, the entire batch might be retried endlessly, blocking the partition and increasing lag.
**Mitigation**:
- Catch exceptions in your code and route the problematic message to a Dead Letter Queue (DLQ).
- Return partial batch success (e.g., `ReportBatchItemFailures` in AWS Lambda) so Kafka only retries the failed records and moves the offset forward for successful ones.

### 3. Timeout and Frequent Rebalances
**Issue**: If the Lambda processing takes longer than the consumer's timeout setting, the broker assumes the consumer died, triggering a rebalance.
**Mitigation**:
- Keep Lambda execution times well below the timeout threshold.
- Tune the batch size (`BatchSize`) and time window (`MaximumBatchingWindowInSeconds`) to ensure the batch can be processed within the timeout limit.

---

## Q72. What are the Common Issues when Running Kafka on Kubernetes (EKS)?

Running a stateful, disk-I/O heavy system like Kafka on Kubernetes requires careful configuration to avoid performance and stability issues.

### 1. Pod Restarts Causing Endless Rebalances
**Issue**: In Kubernetes, pods might be rescheduled, restarted, or evicted. When a Kafka consumer pod restarts, it leaves the consumer group and rejoins, triggering stop-the-world rebalances.
**Mitigation**:
- **Static Membership**: Use `group.instance.id` for consumers. The broker will recognize the pod when it rejoins and assign it the same partitions without triggering a rebalance (provided it rejoins within `session.timeout.ms`).
- Ensure adequate pod resources (CPU/RAM requests and limits) to prevent OOM Kills or CPU throttling.

### 2. Storage Bottlenecks (EBS Volumes)
**Issue**: Network-attached storage like AWS EBS can become a bottleneck. Hitting IOPS or throughput limits will severely degrade broker performance.
**Mitigation**:
- Use high-performance storage classes (e.g., AWS `gp3` or `io2` with provisioned IOPS).
- For maximum performance, use instance store volumes (local NVMe SSDs), relying on Kafka's replication (`replication.factor=3`) for high availability instead of the storage layer.

### 3. Networking and `advertised.listeners` Complexity
**Issue**: Clients outside the EKS cluster cannot connect to brokers because brokers return internal Pod IPs that are unroutable from the outside.
**Mitigation**:
- Carefully configure `listeners` and `advertised.listeners`. Use internal listeners (ClusterIP or headless services) for inter-broker communication and external listeners (NodePort or LoadBalancer) mapped to routable domain names for external clients.

---

## Q73. How do you Troubleshoot and Mitigate Consumer Lag?

Consumer lag indicates that messages are being produced faster than they are being consumed.

### 1. Slow Message Processing
**Issue**: The consumer application takes too long to process each message (e.g., making slow API calls or single DB inserts).
**Mitigation**:
- **Batching**: Insert records into databases in batches rather than one by one.
- **Async Processing**: Use asynchronous processing within the consumer (taking care of ordering guarantees if required).
- Increase the number of partitions and scale out the consumer group to match.

### 2. Hot Partitions (Skewed Data)
**Issue**: Most traffic goes to a single partition because of an unbalanced partition key (e.g., one huge tenant ID), causing one consumer to lag while others are idle.
**Mitigation**:
- Redesign the partition key. Use a compound key (e.g., `TenantId-TimestampHour`) to spread the load across multiple partitions.

### 3. Frequent Rebalances
**Issue**: Consumer lag spikes periodically because the consumer group is constantly rebalancing.
**Mitigation**:
- Investigate why consumers are dropping out. Are they crashing (OOM)? Are they taking too long to poll (`max.poll.interval.ms` exceeded)?
- Enable **Cooperative Rebalancing** (`partition.assignment.strategy=CooperativeStickyAssignor`) so partitions are not revoked from healthy consumers during a rebalance.

---

## Q74. How Do You Handle "Message Too Large" Exceptions?

Kafka is optimized for small messages (typically 1KB to 10KB). The default `message.max.bytes` is just 1MB.

### The Issue
Producers fail with `RecordTooLargeException` when trying to send large JSON payloads, images, or documents. If you simply increase `message.max.bytes` on the broker, it increases memory pressure, degrades performance, and can cause GC pauses.

### Mitigation
- **Claim Check Pattern (Best Practice)**: Store the large payload in external storage (e.g., AWS S3, Azure Blob) and publish a message to Kafka containing just the URI/reference to that object. The consumer reads the URI and fetches the payload from S3.
- **Compression**: Enable producer-side compression (`compression.type=lz4` or `zstd`) if the payload is highly compressible text (like JSON or XML).
- **Chunking**: Split the large message into smaller chunks (e.g., 1MB each) with a common ID and sequence number, then reassemble them on the consumer side. This is complex and generally discouraged unless necessary.

---

## Q75. How Do You Resolve "Consumer Rebalancing Storms"?

### The Issue
In default configuration (Eager Rebalancing), when a consumer joins or leaves a group, *every* consumer stops processing, relinquishes its partitions, and waits for a new assignment. In large groups, this "stop-the-world" event causes massive lag spikes. If consumers keep dying and rejoining, you enter a "rebalance storm" where no progress is made.

### Mitigation
- **Cooperative Rebalancing**: Change `partition.assignment.strategy` to `CooperativeStickyAssignor`. Consumers retain their partitions during a rebalance, and only the partitions that actually need to move are revoked.
- **Tune Timeouts**: If a rebalance is caused by consumers taking too long to process, increase `max.poll.interval.ms`. If caused by temporary network blips, tune `session.timeout.ms`.
- **Static Membership**: As discussed for Kubernetes, configure `group.instance.id` so a restarted consumer is recognized and given back its exact partitions without triggering a rebalance.

---

## Q76. How Do You Prevent Unbounded Topic Growth (Disk Full)?

### The Issue
A runaway producer or a misconfigured topic can rapidly fill the broker's disk. When a broker's disk reaches 100%, the broker crashes and cannot be restarted until data is manually deleted, potentially causing an outage.

### Mitigation
- **Strict Retention Policies**: Set absolute maximums using `retention.bytes` (max size per partition) and `retention.ms` (max time).
- **Monitor Disk Space**: Alert strictly when disk usage hits 75-80%. Use tools like Cruise Control to automatically move partitions away from a full broker.
- **Tiered Storage (KIP-405)**: In modern Kafka versions, configure Tiered Storage to automatically offload older segments to cheap object storage (S3/GCS), keeping the local disk almost empty and preventing disk-full scenarios entirely.

---

## Q77. What Happens When ZooKeeper/KRaft Loses Quorum?

### The Issue
Kafka relies on a consensus system (ZooKeeper historically, or KRaft natively) to manage cluster metadata and elect leaders. If the majority of quorum nodes fail (e.g., 2 out of 3 nodes die), the cluster loses quorum.

### Impact & Mitigation
- **Impact**: Existing producers and consumers *might* continue working if they already have the metadata. However, no new topics can be created, no partition leaders can be elected, and if a broker dies, its partitions will remain offline because a new leader cannot be chosen.
- **Mitigation**: 
  - Always deploy an odd number of quorum nodes (3 or 5).
  - Spread the quorum nodes across different Availability Zones (AZs) so an AZ outage doesn't take down the quorum.
  - Dedicate specific nodes to be KRaft controllers (don't mix controller and broker roles in large clusters).

---

## Q78. How Do You Optimize Producer Batching and Latency?

### The Issue
A producer might experience high latency, or conversely, poor throughput, because it is sending too many tiny requests to the broker instead of batching them.

### Mitigation
- **High Throughput / Moderate Latency**: Increase `linger.ms` (e.g., 20-50ms) and `batch.size` (e.g., 1MB). The producer will wait up to `linger.ms` to fill the batch, greatly improving throughput and broker CPU efficiency.
- **Ultra-Low Latency**: Set `linger.ms=0`. The producer sends messages immediately. This sacrifices throughput and increases broker network/CPU overhead but minimizes producer-side delay.
- **Alert on `buffer.memory` Full**: If the producer produces faster than it can send to the broker, its internal buffer fills up, and `send()` blocks. Monitor the producer `buffer-exhausted-rate`.

---

## Q79. What are the Challenges with Cross-Region Replication?

### The Issue
Disaster recovery requires replicating Kafka data from one region to another (e.g., US-East to US-West). Due to the speed of light, synchronous replication across regions is too slow.

### Mitigation
- **Asynchronous Replication**: Use tools like **MirrorMaker 2** or **Confluent Cluster Linking**. Understand that replication is asynchronous, meaning the standby cluster will always be slightly behind (RPO > 0).
- **Offset Translation**: When failing over, consumer offsets in the primary cluster don't perfectly match the secondary cluster. MM2 handles offset translation automatically so consumers can resume near where they left off.
- **Active-Active Loops**: If doing active-active replication, ensure you don't create infinite replication loops (messages bouncing back and forth). MM2 prevents this using topic prefixes (e.g., `us-east.topicA`).

---

## Q80. How Do You Solve the "Zombie Consumer" Problem?

### The Issue
A consumer application deadlocks or its processing thread hangs forever (e.g., stuck on a slow DB query with no timeout). Because Kafka's heartbeat is sent by a separate background thread, the broker thinks the consumer is still alive. The partition gets "stuck"—no other consumer takes over, and lag grows infinitely.

### Mitigation
- **`max.poll.interval.ms`**: This is Kafka's built-in protection against zombie consumers. The consumer *must* call `poll()` within this interval. If it doesn't, the heartbeat thread voluntarily tells the broker to remove the consumer, triggering a rebalance so another consumer can take over.
- **Strict Timeouts in Code**: Always use timeouts for downstream API/DB calls within your consumer loop.

---

## Q81. How Do You Handle Schema Evolution Breakages?

### The Issue
A producer adds or removes a field in the JSON payload. The downstream consumer, expecting the old format, throws a `NullPointerException` or deserialization error, causing a poison pill scenario.

### Mitigation
- **Schema Registry**: Use a Schema Registry (like Confluent's) with Avro, Protobuf, or JSON Schema.
- **Enforce Compatibility Rules**: Configure the registry to reject schema updates that break compatibility. 
  - *Backward Compatibility*: New consumer code can read old data.
  - *Forward Compatibility*: Old consumer code can read new data.
- **Centralized Governance**: Make schema changes a pull request process that requires consumer team approval.

---

## Q82. How Do You Secure Kafka from Unauthorized Access?

### The Issue
By default, Kafka allows anyone who can reach the broker IP to read from and write to any topic. A malicious or buggy service could delete topics or publish garbage data.

### Mitigation
- **Encryption in Transit**: Enable TLS (SSL) for all client-broker and broker-broker communication.
- **Authentication**: Require clients to prove who they are using mTLS (Mutual TLS), SASL/SCRAM (username/password), or OAuth 2.0.
- **Authorization (ACLs)**: Use Kafka's ACLs (Access Control Lists) to enforce the Principle of Least Privilege. E.g., `ServiceA` can only WRITE to `topic-a`, and `ServiceB` can only READ from `topic-a`.

---

## Q83. How Do You Resolve Hot Brokers and Uneven Load?

### The Issue
You notice Broker 1 is using 90% CPU and Disk, while Broker 2 and Broker 3 are at 10%. This happens when one broker becomes the leader for too many high-traffic partitions, or when partition sizes grow unevenly.

### Mitigation
- **Leader Election**: Run the `kafka-leader-election.sh` tool to restore the "preferred leaders," balancing leadership evenly across the cluster.
- **Partition Reassignment**: Use the `kafka-reassign-partitions.sh` tool to physically move partition replicas from the hot broker to the colder brokers.
- **Automated Balancing**: In production, install **Cruise Control** (open source by LinkedIn). It monitors broker utilization and automatically generates and executes partition reassignment plans to keep the cluster perfectly balanced without human intervention.

---

## Quick Reference: The 80/90% Topics

As noted in the introduction, mastering these questions covers 80-90% of senior-level Kafka interviews:

| # | Topic | Key Points |
|---|---|---|
| 11 | Partition selection | Key hash, round-robin, sticky, custom |
| 14 | Out-of-order events | Partition key, version fields, state machine |
| 20 | ACK settings | 0=fire-forget, 1=leader, all=ISR |
| 21 | ISR | In-sync replicas, high watermark, ISR shrink |
| 24 | Retries = duplicates | Leader crash after write, before ACK |
| 25 | Idempotent producer | PID + SeqNum, per-session |
| 30 | Transactional producer | Atomic multi-partition, exactly-once |
| 32 | Consumer groups | Parallel consumption, independent groups |
| 35 | Offsets | Immutable, partition-scoped, bookmark |
| 38 | Commit strategies | Auto vs manual, sync vs async |
| 41 | Rebalancing | Stop-the-world, partition reassignment |
| 46 | Delivery semantics | At-most/at-least/exactly-once trade-offs |
| 49 | EOS scope | Within Kafka only; external DB needs idempotency |
| 53 | KRaft | Raft-based metadata, no ZooKeeper |
| 55 | min.insync.replicas | Safety net for acks=all |
| 56 | Retention vs compaction | Time-window vs current-state snapshot |
| 63 | Poison messages | DLQ, max retries, commit and move on |
| 64 | Retry architecture | Multi-level retry topics, exponential backoff |
| 66 | Ordering + scalability | Per-entity key, not global ordering |
| 67 | Duplicate payments | Idempotency key, dedup table, transactions |

---

*This guide covers Kafka internals from producer flow to cluster architecture. For hands-on practice, set up a local Kafka cluster (Docker Compose works well), produce events with different ack settings, deliberately kill brokers, and observe what happens to consumer lag and leader elections.*