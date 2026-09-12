# System Design Diagrams Reference

This document provides a comprehensive list of complex system design concepts outlined in the terminology reference that would benefit from visual diagrams.

## 1. Distributed Systems
- **Two-Phase Commit (2PC):** Demonstrates the two phases (Voting and Commit) between a Coordinator and Participants to ensure distributed transaction atomicity.
- **Split Brain:** Visualizes a network partition where a cluster is split, leading to two independent leaders.
- **Gossip Protocol:** Shows how nodes periodically transmit state updates to random peers, propagating information logarithmically.
- **Vector Clock & Lamport Clock:** Illustrates the arrays of logical counters tracking causal event ordering across different nodes.
- **Quorum Consensus:** Diagrams (N/2) + 1 read/write overlaps ensuring consistency during partitions.
- **Heartbeats & Failure Detection:** Visualizes ping/ack timeouts leading to a new leader election.

## 2. Scalability & Performance
- **Horizontal vs Vertical Scaling:** Contrasts adding more machines to a cluster versus adding more CPU/RAM to a single machine.
- **Auto Scaling:** Flowchart of metrics (e.g., CPU load) triggering the commissioning or decommissioning of instances.

## 3. Load Balancing & Proxies
- **Consistent Hashing Ring:** Shows how nodes and keys map to a hash ring, minimizing data movement when nodes are added/removed.
- **Layer 4 vs Layer 7 Load Balancing:** Compares transport-level routing (IP/Port) versus application-level routing (HTTP headers/payload).
- **Active-Active vs Active-Passive:** Contrasts a setup where all nodes handle traffic simultaneously versus a standby failover setup.
- **Reverse Proxy vs Forward Proxy:** Visualizes an intermediary shielding internal servers versus an intermediary shielding clients.

## 4. Reliability & Resilience
- **Circuit Breaker:** State machine diagram depicting the transitions between Closed, Open, and Half-Open states to prevent cascading failures.
- **Rate Limiting Algorithms:** Visualizes how Token Bucket or Leaky Bucket algorithms control traffic flow over time.
- **Backpressure & Load Shedding:** Depicts downstream services signaling upstream to slow down or rejecting requests (HTTP 503) to prevent collapse.
- **Retry Pattern with Exponential Backoff & Jitter:** Graph showing increasing delay intervals and randomized noise between request retries.

## 5. Database Fundamentals (SQL & NoSQL)
- **Isolation Levels & Concurrency Anomalies:** Sequence diagrams illustrating Dirty Reads, Non-Repeatable Reads, and Phantom Reads.
- **MVCC (Multi-Version Concurrency Control):** Shows how databases maintain multiple versions of a row to allow lock-free reads while writes occur.
- **Optimistic vs Pessimistic Locking:** Compares locking rows upfront versus checking version columns at commit time.
- **Write-Ahead Log (WAL):** Visualizes the crash recovery flow where changes are appended to the WAL before being written to actual data pages.
- **Secondary vs Covering Indexes:** Diagrams the difference between an index requiring a disk lookup vs an index containing all requested query data.
- **Joins (Nested Loop vs Hash Join):** Shows the execution flow of iterating through rows vs building an in-memory hash table.
- **NoSQL Data Models:** Visual comparisons of Document (JSON), Wide Column (Column Families), and Graph (Nodes & Edges) structures.
- **Global vs Local Secondary Indexes (GSI/LSI):** Shows how queries map across NoSQL partitions using different sort keys and partition keys.

## 6. Database Scaling & Storage
- **Primary-Replica & Multi-Leader Replication:** Shows how write traffic is handled and propagated asynchronously or synchronously.
- **Sharding vs Vertical Partitioning vs Federation:** Visualizes splitting rows (sharding), splitting columns (vertical), and splitting by business domain (federation).
- **LSM Tree (Log-Structured Merge-Tree):** Visualizes the write path from the in-memory MemTable being flushed to immutable SSTables on disk, followed by Compaction.
- **B+ Tree:** Depicts the search tree structure where data is stored exclusively in sequentially linked leaf nodes for fast range scans.
- **Bloom Filters:** Shows the probabilistic hashing arrays used to quickly skip checking SSTables for non-existent keys.
- **Anti-Entropy (Merkle Trees):** Visualizes how replicas compare hierarchical hash trees to find and sync mismatched data efficiently.
- **Tombstones:** Shows how deletes in distributed DBs act as markers that propagate across nodes before being cleared during compaction.

## 7. Caching
- **Cache-Aside vs Read-Through:** Visualizes application-managed cache retrieval versus the cache proxying the database automatically.
- **Write-Through, Write-Around, and Write-Back:** Contrasts synchronous cache-to-database writes, bypassing cache, and high-performance asynchronous background updates.
- **Cache Stampede / Avalanche Mitigations:** Diagrams showing lock acquisition or TTL jitter to prevent database flooding.
- **Cache Penetration Mitigation:** Shows requests for non-existent data being blocked by a Bloom filter before hitting the database.
- **Hot Key Replication:** Depicts a single heavily accessed key being duplicated across multiple cache nodes or pushed to a local in-memory cache.
- **Eviction Policies (LRU vs LFU):** Visual queues showing how Least Recently Used and Least Frequently Used items are discarded.

## 8. Messaging & Queues
- **Pub/Sub (Publish/Subscribe) Model:** Shows producers publishing messages to a Topic, which is then broadcast to multiple independent subscriber groups.
- **Fan Out Pattern:** Shows a single message being duplicated and routed to multiple target queues simultaneously.
- **Dead Letter Queue (DLQ):** Shows how poison pill messages that repeatedly fail processing are routed to an isolated queue.
- **Consumer Group Partitions:** Visualizes how Kafka distributes topic partitions exclusively among active consumers in a group.

## 9. Event-Driven Architecture
- **Saga Pattern (Choreography vs Orchestration):** Depicts distributed transactions handled via localized events versus a central controller explicit calls.
- **Event Sourcing:** Shows how state is reconstructed by sequentially replaying an append-only log of historical events.
- **Outbox Pattern:** Shows the atomic database transaction writing business data and an event record, followed by a background polling publisher.
- **Inbox Pattern (Idempotency):** Shows consumers checking a local database for duplicate message IDs before executing side-effects.

## 10. Microservices & APIs
- **API Gateway / BFF (Backend For Frontend):** Shows how an API gateway shields internal microservices from the client and aggregates responses.
- **Sidecar & Ambassador Patterns:** Visualizes a helper container running alongside the main application pod to handle cross-cutting network proxying.
- **Strangler Pattern:** Illustrates a routing proxy incrementally directing traffic from a legacy monolith to new microservices.
- **Service Discovery:** Shows microservices registering with a Service Registry (like Consul) and clients dynamically looking up IPs.
- **WebSockets vs SSE vs Long Polling:** Connection lifecycle diagrams comparing full-duplex, server-push, and repeated polling.

## 11. Security
- **OAuth 2.0 Authorization Code Flow:** Details how a third-party app securely gains access to a user's resources through redirects and token exchanges.
- **JWT Structure:** Illustrates the composition of a JSON Web Token (Header, Payload, Signature) and its cryptographic verification flow.
- **CSRF & XSS Mitigation:** Diagrams showing the flow of Anti-CSRF tokens and Content Security Policies protecting browsers.
- **mTLS (Mutual TLS):** Visualizes the two-way certificate validation between two internal microservices in a service mesh.

## 12. Observability & Search
- **Distributed Tracing:** Shows how a Trace ID is generated at the gateway and passed as context via headers to link spans across microservices.
- **Inverted Index:** Depicts the mapping of tokenized words directly to document IDs for O(1) search lookups.

## 13. Kubernetes, Networking & Deployments
- **Kubernetes Architecture:** Displays the hierarchy of a Cluster containing Nodes, which host Pods encapsulating Containers, exposed via Services and Ingress.
- **Deployment Strategies:** Flowcharts contrasting Rolling Updates, Blue-Green Deployments, and Canary Deployments.
- **TCP vs UDP / HTTP/2 vs HTTP/3:** Diagrams comparing connection handshakes and multiplexing (TCP Head-of-line blocking vs QUIC).
- **CDN (Content Delivery Network):** Shows client requests being routed via Anycast to the geographically closest Edge Node/POP.

## 14. Architecture Patterns
- **CQRS (Command Query Responsibility Segregation):** Displays the separation of the read and write models to scale them independently.
- **Clean Architecture / Hexagonal:** Illustrates concentric dependency circles or ports and adapters isolating core business logic from external frameworks.
