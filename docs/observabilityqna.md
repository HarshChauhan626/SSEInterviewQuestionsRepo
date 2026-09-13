# Observability Interview Guide
> Comprehensive answers to every major observability, monitoring, logging, tracing, and alerting interview question.

---

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Logging](#2-logging)
3. [Metrics & Monitoring](#3-metrics--monitoring)
4. [Distributed Tracing](#4-distributed-tracing)
5. [OpenTelemetry & Modern Observability](#5-opentelemetry--modern-observability)
6. [Alerting & Incident Management](#6-alerting--incident-management)

---

# 1. Core Concepts

## What is observability?

Observability is the ability to understand the **internal state of a system** by examining its external outputs — logs, metrics, and traces. A system is "observable" if you can answer *why* something is broken, not just *that* something is broken, without needing to ship new code or restart anything.

The term comes from control theory: a system is observable if its internal states can be inferred from its outputs. Applied to software, it means: given the data your system emits, can you diagnose any failure mode — even one you've never seen before?

> **Key distinction**: Monitoring tells you *when* something is wrong. Observability tells you *why*.

---

## Difference between monitoring and observability?

| Aspect | Monitoring | Observability |
|---|---|---|
| **Question answered** | Is the system healthy? | Why is the system unhealthy? |
| **Approach** | Check known failure modes | Explore unknown failure modes |
| **Data** | Pre-defined dashboards & alerts | Rich, queryable telemetry |
| **Mindset** | Reactive — watch known metrics | Proactive — ask arbitrary questions |
| **Tooling** | Nagios, Zabbix, CloudWatch alarms | Jaeger, Grafana, OpenTelemetry |

Monitoring is a **subset** of observability. You can monitor without full observability (e.g., a simple uptime check), but true observability implies you can monitor anything because the data is rich enough to answer any question.

```
Monitoring:  "CPU > 90% → alert"
Observability: "Why is this one user's checkout taking 8s? Let me trace it."
```

---

## What are the three pillars of observability?

```
┌─────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY                                 │
│                                                                 │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐  │
│   │    LOGS     │   │   METRICS   │   │      TRACES         │  │
│   │             │   │             │   │                     │  │
│   │ Timestamped │   │ Numeric     │   │ End-to-end request  │  │
│   │ event       │   │ aggregated  │   │ flow across         │  │
│   │ records     │   │ measurements│   │ services            │  │
│   │             │   │             │   │                     │  │
│   │ "What       │   │ "How much / │   │ "Where did time     │  │
│   │ happened?"  │   │ how many?"  │   │ go?"                │  │
│   └─────────────┘   └─────────────┘   └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

1. **Logs** — Discrete, timestamped records of events. Rich in context but expensive to store and query at scale.
2. **Metrics** — Numeric time-series data (counters, gauges, histograms). Cheap to store, great for alerting and dashboards.
3. **Traces** — Correlated records of a request's journey across multiple services. Essential for debugging latency in distributed systems.

These three complement each other: metrics tell you *something is wrong*, logs tell you *what happened*, and traces tell you *where*.

---

## Difference between logs, metrics, and traces?

| | Logs | Metrics | Traces |
|---|---|---|---|
| **Format** | Text/JSON events | Numeric time-series | Spans with timing + context |
| **Cardinality** | High (unbounded) | Low-medium (controlled) | Medium |
| **Cost** | High (storage) | Low | Medium-high |
| **Best for** | Debugging specific events | Alerting, dashboards | Latency analysis, bottlenecks |
| **Query style** | Full-text search | PromQL, math expressions | Trace ID lookup, flame graphs |
| **Example** | `ERROR: DB timeout user_id=123` | `http_requests_total{status="500"} 42` | Span: `checkout→payment→fraud-check` |

---

## What kind of issues are best solved using logs vs metrics vs traces?

**Use Logs when:**
- Debugging a specific error for a specific user/request
- Investigating intermittent bugs (race conditions, edge cases)
- Auditing access or security events
- Understanding the exact sequence of events before a crash
- Example: "Why did order #9823 fail at 2:34 AM?"

**Use Metrics when:**
- Detecting that *something is wrong* (alerting)
- Capacity planning and trend analysis
- SLO/SLA reporting
- Understanding aggregate behavior (p99 latency, error rate %)
- Example: "Is our error rate above 1% in the last 5 minutes?"

**Use Traces when:**
- Finding which service is causing end-to-end latency
- Debugging cascading failures across microservices
- Understanding call graphs and dependencies
- Performance profiling of distributed workflows
- Example: "Our checkout is slow — which of the 12 services is the bottleneck?"

---

## What is distributed tracing?

Distributed tracing is a method of tracking a **single request's journey** across multiple services, processes, or systems. Each service adds a "span" (a timed unit of work) to the trace, and all spans share a common `trace_id` so they can be assembled into a complete picture.

```
User Request
    │
    ▼
[API Gateway]──────────────────────────── Span A (0ms → 250ms)
    │
    ├──► [Auth Service]──────────────────── Span B (5ms → 30ms)
    │
    ├──► [Product Service]───────────────── Span C (35ms → 90ms)
    │         │
    │         └──► [DB Query]───────────── Span D (40ms → 85ms)
    │
    └──► [Payment Service]───────────────── Span E (95ms → 240ms)
              │
              └──► [Fraud Check API]──────── Span F (100ms → 230ms)
                         ▲
                    This is the bottleneck!
```

The trace reveals that `Fraud Check API` (Span F) consumed 130ms of the 250ms total — the bottleneck invisible without tracing.

---

## What is telemetry?

Telemetry is the **automated collection and transmission** of data from a system to a remote location for monitoring and analysis. In software, it means the signals (logs, metrics, traces, events) that your application emits about its own behavior.

Telemetry = the pipeline that generates, collects, and ships observability data.

```
[Application] → emits telemetry → [Collector/Agent] → [Backend (Datadog/Grafana)]
```

---

## What is cardinality in metrics?

Cardinality refers to the **number of unique combinations** of label/tag values for a metric. High cardinality = many unique time series.

```
# Low cardinality — 3 series
http_requests_total{method="GET"}
http_requests_total{method="POST"}
http_requests_total{method="DELETE"}

# High cardinality — millions of series
http_requests_total{user_id="u-1234", session_id="abc-xyz-..."}
```

Each unique label combination creates a separate time series in Prometheus/Thanos, consuming memory and storage.

---

## Why is high cardinality dangerous?

1. **Memory explosion**: Prometheus keeps all active series in RAM. Millions of series = OOM crashes.
2. **Query performance**: High-cardinality queries scan enormous data sets, making dashboards slow or unusable.
3. **Storage costs**: Each series is stored separately; exponential growth in data volume.
4. **Scrape timeouts**: Too many series causes scrape intervals to be missed.

**Rule of thumb**: Never use user IDs, session IDs, email addresses, or unbounded string values as metric labels. Use logs for high-cardinality data, metrics for low-cardinality aggregations.

---

## What are SLI, SLO, and SLA?

```
SLA (Contract)
  └── SLO (Internal Target)
        └── SLI (Measurement)
```

**SLI (Service Level Indicator)** — A *measurement* of some aspect of service behavior.
- Example: `success_rate = successful_requests / total_requests`
- Example: `p99_latency = 99th percentile response time`

**SLO (Service Level Objective)** — An *internal target* for an SLI.
- Example: "99.9% of requests succeed over a 30-day rolling window"
- Example: "p99 latency < 300ms"
- SLOs drive engineering priorities. If you're burning your error budget, you stop feature work and fix reliability.

**SLA (Service Level Agreement)** — A *contract* with customers, usually less strict than the SLO (with a buffer).
- Example: "We guarantee 99.5% uptime. Breach = service credits."
- SLA breaches have financial/legal consequences.

| Term | Audience | Consequence of breach |
|---|---|---|
| SLI | Engineers | None (it's just a number) |
| SLO | Engineering/Product | Engineering prioritization |
| SLA | Customers/Legal | Financial penalties, churn |

---

## Difference between uptime and availability?

**Uptime** = The total time a system has been running without interruption.
- Measured in wall-clock time: "The server has been up for 99 days."
- Doesn't account for partial degradation.

**Availability** = The proportion of time a system is **functional and serving requests correctly**.
- Formula: `Availability = Uptime / (Uptime + Downtime)`
- A system can be "up" (process running) but unavailable (returning 500s, too slow to be useful).

```
Server is running:            ████████████████████  (99% uptime)
Server serving correctly:     ████████░░░░████████  (85% availability)
                                       ↑
                              Up but returning errors
```

**Availability is the more meaningful metric for users.**

---

## What is MTTR and MTTD?

**MTTD (Mean Time to Detect)** — Average time from when an incident starts to when your team knows about it. Measures alerting effectiveness.

**MTTR (Mean Time to Recover/Resolve)** — Average time from incident detection (or start) to full resolution. Measures response and remediation speed.

```
Incident Timeline:
──────────────────────────────────────────────────────►
   │                  │                              │
 Incident           Alert                        Resolved
  starts            fires
   ◄────────────────►◄──────────────────────────►
        MTTD                    MTTR
```

Other related metrics:
- **MTTF (Mean Time to Failure)** — Average time between failures (reliability measure)
- **MTBF (Mean Time Between Failures)** — MTTF + MTTR

Improving MTTD: Better alerting, anomaly detection, synthetic monitoring.
Improving MTTR: Runbooks, on-call training, better tooling, chaos engineering.

---

## What is a golden signal?

The four golden signals (from Google's SRE book) are the most critical metrics for any user-facing service:

```
┌─────────────────────────────────────────────────────────────────┐
│              THE FOUR GOLDEN SIGNALS                            │
│                                                                 │
│  1. LATENCY    │  How long requests take                        │
│                │  Track success and error latency separately    │
│                │                                                │
│  2. TRAFFIC    │  How much demand hits your system              │
│                │  RPS, QPS, concurrent users                    │
│                │                                                │
│  3. ERRORS     │  Rate of failed requests                       │
│                │  HTTP 5xx, timeouts, exceptions                │
│                │                                                │
│  4. SATURATION │  How "full" your service is                    │
│                │  CPU %, memory %, queue depth                  │
└─────────────────────────────────────────────────────────────────┘
```

If you instrument nothing else, instrument these four. They capture almost every failure mode that affects users.

---

## Explain RED metrics.

RED is a methodology for **request-driven services** (APIs, microservices):

- **R — Rate**: How many requests per second is the service receiving?
- **E — Errors**: What fraction of those requests are failing?
- **D — Duration**: How long do requests take? (distribution, not average)

```
RED Dashboard Example:
┌─────────────────────────────────────┐
│ Rate:     1,200 req/s               │
│ Errors:   0.8% (9.6 req/s failing)  │
│ Duration: p50=45ms p95=210ms        │
│           p99=890ms ← problem here  │
└─────────────────────────────────────┘
```

RED is simpler to apply than golden signals for service-level monitoring. It's the go-to framework for microservice health.

---

## Explain USE metrics.

USE is a methodology for **resource-driven components** (CPUs, disks, queues, databases):

- **U — Utilization**: What % of the resource's capacity is being used? (e.g., CPU at 75%)
- **S — Saturation**: Is work queuing up because the resource is overloaded? (e.g., run queue depth)
- **E — Errors**: Are there hardware or software errors on this resource? (e.g., disk I/O errors)

```
USE for a database server:
┌─────────────────────────────────────────┐
│ Utilization:  CPU 78%, Memory 65%       │
│ Saturation:   Connection pool 92% full  │  ← Problem!
│ Errors:       0 disk errors, 0 net drops│
└─────────────────────────────────────────┘
```

USE = infrastructure layer. RED = application layer. Use both together for complete coverage.

---

## What makes a system "observable"?

A system is observable if:

1. **It emits structured, rich telemetry** — logs with context (trace_id, user_id), metrics with meaningful labels, traces with full span trees.
2. **You can ask arbitrary questions** — not just the ones you anticipated when writing dashboards.
3. **You can correlate signals** — a trace ID appears in logs, metrics have matching timestamps.
4. **High cardinality is supported** — you can drill down to individual users, requests, or transactions.
5. **The data is fresh** — telemetry arrives with low latency so you can debug live issues.
6. **You don't need to deploy new code to debug** — the existing instrumentation is sufficient to answer new questions.

The test: Can a new engineer, on their first on-call shift, diagnose a production issue they've never seen before using only your observability tooling?

---

## What is instrumentation?

Instrumentation is the **code you add** (or auto-generate) to emit telemetry. It's the practice of wiring your application to produce logs, metrics, and traces.

Types:
- **Manual instrumentation**: Explicit code — `span.start()`, `counter.increment()`, `logger.info()`
- **Auto-instrumentation**: Libraries/agents that patch frameworks automatically (e.g., OpenTelemetry Java agent instruments Spring Boot with zero code changes)
- **Library instrumentation**: Popular libraries (gRPC, pg, Redis clients) come with built-in telemetry hooks

Good instrumentation principles:
- Add context at boundaries (service entry/exit, DB calls, external HTTP calls)
- Use standard conventions (OpenTelemetry semantic conventions)
- Don't over-instrument — every log/trace/metric has a cost

---

## Passive vs active monitoring?

**Passive monitoring** — Observe traffic/behavior that naturally flows through the system. No synthetic load.
- Examples: Scraping Prometheus metrics, tailing logs, capturing traces from real requests
- Pros: Zero overhead on production, reflects real user experience
- Cons: Can't detect issues before users hit them; blind spots during low-traffic periods

**Active monitoring** — Proactively send synthetic requests or probes to test the system.
- Examples: Synthetic uptime checks, health check pings, canary requests
- Pros: Detects issues 24/7 even at zero traffic; can test specific user flows
- Cons: Adds artificial load; may not catch issues only triggered by real usage patterns

**Best practice**: Use both. Passive for real-user experience. Active for uptime and pre-traffic detection.

---

## Black-box vs white-box monitoring?

**Black-box monitoring** — Tests the system from the **outside**, without knowledge of internals.
- Only sees what a user/client sees: HTTP responses, latency, DNS resolution
- Examples: Uptime robots, synthetic checks, Pingdom, Prometheus Blackbox Exporter
- Good for: User-facing availability, external dependency checks, SLA monitoring
- Bad for: Root-cause analysis, internal queue depths, memory leaks

**White-box monitoring** — Instruments the system from the **inside** with full knowledge of internals.
- Sees internal metrics: JVM heap, DB connection pool, queue depth, cache hit rate
- Examples: Prometheus metrics from app code, application logs, traces
- Good for: Root-cause analysis, performance tuning, capacity planning
- Bad for: Knowing what the user actually experiences

```
User → [Black-box probe] → System → [White-box metrics] → Prometheus
         "Is it up?"                  "Why is it slow?"
```

---

## Difference between health check and readiness check?

These are Kubernetes concepts but widely applicable:

**Health Check (Liveness Probe)** — "Is this process alive and not deadlocked?"
- If it fails → container is **killed and restarted**
- Should be simple: just confirm the process isn't hung
- Example: `GET /healthz` returns 200 if the goroutine/thread is alive
- ⚠️ Don't include dependency checks here — a DB outage shouldn't restart your app

**Readiness Check (Readiness Probe)** — "Is this instance ready to **receive traffic**?"
- If it fails → instance is **removed from load balancer** (not killed)
- Can include dependency checks: DB connected, cache warmed, config loaded
- Example: `GET /ready` returns 200 only if DB connection pool is healthy

```
Startup sequence:
[Pod starts] → Liveness: PASS (alive) → Readiness: FAIL (warming up)
                                              ↓ (excluded from LB)
[DB connected, cache warm] → Readiness: PASS → Added to LB → Traffic flows
```

---

# 2. Logging

## Structured logging vs unstructured logging?

**Unstructured logging** — Free-form text.
```
2024-01-15 14:23:01 ERROR Failed to process payment for user 1234: timeout after 5000ms
```
Human-readable but machine-hostile. Parsing requires regex. Hard to query at scale.

**Structured logging** — Machine-readable format (typically JSON) where every field is explicitly named.
```json
{
  "timestamp": "2024-01-15T14:23:01Z",
  "level": "ERROR",
  "message": "Payment processing failed",
  "user_id": "1234",
  "error": "timeout",
  "duration_ms": 5000,
  "service": "payment-service",
  "trace_id": "abc123xyz"
}
```

Structured logs can be:
- Indexed and queried by any field
- Filtered efficiently (e.g., all errors for user_id=1234)
- Aggregated (count errors by type)
- Correlated with traces via `trace_id`

**Always use structured logging in production systems.**

---

## Why JSON logging is preferred?

1. **Universal parsing** — Every language, log shipper, and platform can parse JSON natively.
2. **Schema flexibility** — Add new fields without breaking parsers.
3. **Native indexing** — ELK, Loki, Datadog, and Splunk index JSON fields automatically.
4. **Queryability** — Filter by any field: `level=ERROR AND service=payment AND user_id=1234`.
5. **Type preservation** — Numbers stay numbers, booleans stay booleans (unlike text logs where everything is a string).
6. **Toolchain compatibility** — OpenTelemetry, fluentd, Logstash all work natively with JSON.

---

## What log levels do you use and why?

| Level | When to use | Example |
|---|---|---|
| **TRACE** | Ultra-verbose, every step of execution | "Entering function processOrder, orderId=123" |
| **DEBUG** | Diagnostic info for development/troubleshooting | "Cache miss for key user:456, fetching from DB" |
| **INFO** | Normal business events worth recording | "Order placed: order_id=789, amount=$49.99" |
| **WARN** | Something unexpected but recoverable | "Retrying DB connection, attempt 2/3" |
| **ERROR** | Failure that needs attention, request failed | "Payment gateway timeout, order_id=789" |
| **FATAL/CRITICAL** | Unrecoverable error, process will exit | "Config file missing, cannot start" |

**Production config**: INFO and above. DEBUG enabled selectively via feature flags.
Never log DEBUG in high-traffic production paths — it's a performance and storage killer.

---

## How do you avoid excessive logging?

1. **Set appropriate log levels by environment** — DEBUG in dev, INFO in staging, WARN/ERROR in production hot paths.
2. **Sample high-frequency logs** — Log 1% of "request received" events, 100% of errors.
3. **Avoid logging in tight loops** — One log per request, not per iteration.
4. **Use rate limiting** — Some frameworks support "log this message at most N times per minute."
5. **Deduplication** — Aggregate repeated errors ("same error occurred 500 times") instead of 500 individual entries.
6. **Lazy evaluation** — In languages like Java/Go, use log.IsDebugEnabled() guards or lazy string formatting.
7. **Structured filtering** — Log the event once with enough context rather than multiple fragmented log lines.

---

## How do you correlate logs across services?

Using a **correlation ID** (also called request ID or trace ID) that is:
1. Generated at the entry point (API gateway or first service)
2. Passed in HTTP headers to all downstream services (`X-Request-ID`, `traceparent`)
3. Included in every log line of every service

```
Request arrives → API Gateway generates trace_id: "abc-123"
    ↓ passes X-Request-ID: abc-123 header
Auth Service logs: {"trace_id": "abc-123", "event": "token_validated"}
    ↓
Order Service logs: {"trace_id": "abc-123", "event": "order_created"}
    ↓
Payment Service logs: {"trace_id": "abc-123", "event": "payment_failed", "error": "timeout"}
```

Now in Kibana/Loki, query `trace_id = "abc-123"` to see the complete request journey across all services.

---

## What is a trace ID and correlation ID?

**Correlation ID** — A generic term for any ID used to link related events. Often used for business flows (e.g., `order_id`, `session_id`). Can be user-generated.

**Trace ID** — A specific 128-bit (W3C standard) or 64-bit identifier generated by a distributed tracing system (OpenTelemetry, Jaeger, Zipkin) that uniquely identifies a single end-to-end trace across all services.

In modern systems, these often overlap. OpenTelemetry's `trace_id` serves as the correlation ID, so traces and logs are automatically linked.

```
W3C traceparent header:
00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
   └─ trace_id ──────────────────┘ └─ span_id ──────┘
```

---

## Centralized logging architecture?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CENTRALIZED LOGGING ARCHITECTURE                  │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │
│  │Service A │  │Service B │  │Service C │    (Application Layer)   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                          │
│       │              │              │                                │
│  ┌────▼──────────────▼──────────────▼─────┐                         │
│  │         Log Shippers / Agents          │  (Collection Layer)    │
│  │    (Fluentd, Filebeat, Promtail)       │                         │
│  └─────────────────────┬──────────────────┘                         │
│                         │                                           │
│  ┌──────────────────────▼──────────────────┐                        │
│  │        Message Queue (Optional)         │  (Buffer Layer)       │
│  │        Kafka / Redis Streams            │                        │
│  └──────────────────────┬──────────────────┘                        │
│                         │                                           │
│  ┌──────────────────────▼──────────────────┐                        │
│  │       Processing / Transformation       │  (Processing Layer)   │
│  │       Logstash / Fluentd Filters        │                        │
│  └──────────────────────┬──────────────────┘                        │
│                         │                                           │
│  ┌──────────────────────▼──────────────────┐                        │
│  │           Storage + Indexing            │  (Storage Layer)      │
│  │   Elasticsearch / Loki / Splunk         │                        │
│  └──────────────────────┬──────────────────┘                        │
│                         │                                           │
│  ┌──────────────────────▼──────────────────┐                        │
│  │        Visualization + Alerting         │  (UI Layer)           │
│  │         Kibana / Grafana                │                        │
│  └─────────────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## How do you design logging for microservices?

1. **Standardize the log schema** — Every service uses the same JSON fields: `timestamp`, `level`, `service`, `trace_id`, `span_id`, `message`, plus optional service-specific fields.
2. **Use a shared logging library** — A thin internal wrapper so all services auto-inject context (trace_id, service name, version).
3. **Propagate context** — Extract `traceparent`/`X-Request-ID` from incoming requests and inject into log context automatically.
4. **Write to stdout/stderr** — Never write to files in containers. Let the orchestrator (Kubernetes) collect logs.
5. **Ship via sidecar or DaemonSet** — Fluentd/Promtail runs as a DaemonSet and tails container stdout.
6. **Centralize** — All logs flow to one queryable backend.
7. **Tag with service metadata** — `service`, `version`, `environment`, `pod_name`, `region` on every log line.

---

## How do you prevent sensitive data from being logged?

1. **Never log secrets** — No passwords, API keys, tokens, SSNs, credit card numbers. Code review + static analysis to enforce this.
2. **Mask/redact fields** — Build a logging interceptor that automatically redacts known-sensitive field names (`password`, `cvv`, `ssn`, `token`).
3. **Log references, not values** — Log `user_id=1234`, not `email=john@example.com`.
4. **PII awareness** — Classify fields in your data dictionary as PII/non-PII. Only non-PII fields are safe to log.
5. **Log scrubbing middleware** — Apply regex scrubbers for patterns like card numbers (`\d{4}-\d{4}-\d{4}-\d{4}`) before log emission.
6. **Access controls on log storage** — Even if something slips through, restrict who can query raw logs.
7. **Audit logging separately** — PII needed for audits goes to a separate, access-controlled audit log, not the main log stream.

---

## How do you handle log retention?

Define retention by compliance requirements and cost:

| Log Type | Typical Retention | Reason |
|---|---|---|
| Application debug logs | 7–14 days | High volume, low long-term value |
| Application info/warn logs | 30–90 days | Incident investigation |
| Error logs | 90–180 days | Post-incident analysis |
| Access/audit logs | 1–7 years | Compliance (GDPR, SOC2, HIPAA) |
| Security logs | 1–3 years | Forensics, compliance |

Implementation:
- Use ILM (Index Lifecycle Management) in Elasticsearch to auto-move old indices to cheaper tiers (warm → cold → delete)
- Loki has retention policies per stream label
- Archive to S3/GCS in compressed format for cheap long-term storage
- Tag logs with data classification so retention policy can be applied automatically

---

## What problems occur with massive log ingestion?

1. **Storage costs** — Terabytes/day of logs become expensive fast. Need compression and tiered storage.
2. **Indexing lag** — Elasticsearch can fall behind ingestion, causing query delays.
3. **OOM on indexers** — Elasticsearch nodes crash under write pressure with insufficient heap.
4. **Lost logs** — If the log shipper buffer fills faster than it can drain to storage.
5. **Noisy neighbors** — One service producing 10M logs/min starves others in shared clusters.
6. **Slow queries** — High data volume makes full-text search slow without proper indexing strategy.
7. **Backpressure propagation** — Blocked log shipper causes application threads to block if using synchronous logging.

Mitigations: sampling, rate limiting at shipper, dedicated clusters per team, Kafka as a buffer, Loki's label-based storage model.

---

## Difference between Loki and ELK stack?

| | Loki | ELK Stack |
|---|---|---|
| **Storage model** | Label-indexed (like Prometheus) — only indexes labels, not log content | Full-text indexed — indexes every word in every log line |
| **Storage cost** | Very low (compressed chunks) | High (index is large) |
| **Query language** | LogQL | Lucene / KQL |
| **Search capability** | Fast label-based filtering, slower for ad-hoc full-text | Excellent full-text search across all fields |
| **Schema** | Schema-on-read | Schema-on-write (must define mappings) |
| **Operational complexity** | Low (single binary or simple Helm chart) | High (multiple components: ES, Logstash, Kibana) |
| **Best for** | Kubernetes/cloud-native, cost-sensitive, teams using Grafana | Complex search, compliance, large enterprises with search needs |

---

## Why would you choose Loki over Elasticsearch?

1. **Cost** — Loki stores raw compressed log chunks; no per-field index means 10–100x cheaper storage.
2. **Simplicity** — One binary (`loki`), easy Kubernetes deployment, integrates natively with Grafana.
3. **Prometheus parity** — Same label model as Prometheus; correlating metrics and logs feels natural.
4. **Scalability** — Horizontal scaling via consistent hashing; no complex shard management.
5. **Cloud-native fit** — Designed for Kubernetes; DaemonSet + Promtail is the standard pattern.

**Choose Elasticsearch when**: You need full-text search across log content, complex aggregations, or APM features. Loki struggles with "find all logs containing this error message across any service" queries unless structured log labels are set up well.

---

## How do you search logs efficiently?

1. **Always filter by time range first** — Most log backends are time-partitioned; a time filter is the biggest query optimizer.
2. **Filter on indexed labels** — In Loki: `{service="payment", env="prod"}`. In ES: query on indexed fields, not `_source`.
3. **Use trace_id** — The fastest path to relevant logs. One query, complete context.
4. **Narrow before expanding** — Start with tight filters (service + time + level=ERROR), then broaden.
5. **Avoid `*` wildcards at the start** — Leading wildcards prevent index use in Elasticsearch.
6. **Use KQL/LogQL** — Learn the query language; raw JSON queries are 10x slower to write.
7. **Pre-aggregate common queries** — In high-volume systems, pre-compute error counts and store as metrics to avoid repeated expensive log queries.

---

## What are common logging anti-patterns?

1. **Logging too much** — Every function entry/exit at INFO level. Buries signal in noise.
2. **Logging too little** — No context in errors. "Error occurred" tells you nothing.
3. **Logging sensitive data** — PII, passwords, tokens in plain text.
4. **String concatenation for logging** — `logger.debug("User " + user.toString())` evaluated even when debug is disabled.
5. **Swallowing exceptions silently** — `catch(Exception e) { }` with no log.
6. **Logging in catch and re-throwing** — The same exception gets logged 5 times at different levels.
7. **No correlation IDs** — Can't join logs across services.
8. **Inconsistent formats** — Half the services log JSON, half log plain text.
9. **Synchronous logging in hot paths** — Writing to disk synchronously adds latency to every request.
10. **Not logging at service boundaries** — Every external call (DB, HTTP, queue) should be logged with duration.

---

## How would you debug intermittent production issues using logs?

1. **Reproduce the signature** — Find one confirmed occurrence. Get its exact timestamp and any identifiers (user_id, order_id, trace_id).
2. **Use trace_id to reconstruct the request** — Query all logs with that trace_id across all services to see the full timeline.
3. **Look for patterns** — Are failures correlated with time of day? Specific instances? Specific users? After deploys?
4. **Expand the time window** — Look at logs 5 minutes before the failure. What changed? CPU spike? Cache flush? Deployment?
5. **Compare against a healthy baseline** — Find a successful request for the same operation and diff the log sequence.
6. **Check for resource exhaustion** — Look for connection pool timeouts, thread pool waits, GC pauses near the failure.
7. **Add temporary debug logging** — If logs are insufficient, add targeted DEBUG logs under a feature flag and enable for a % of traffic.
8. **Use distributed trace** — The trace's flame graph often immediately reveals which service added latency.

---

## What causes duplicate logs?

1. **Multiple log handlers** — Logger configured with both a file handler and a console handler, both at INFO level.
2. **Log propagation** — In Python logging, child loggers propagate to root logger; if root also has a handler, entries are logged twice.
3. **Multiple shipping paths** — Filebeat and a sidecar container both tailing the same log file.
4. **At-least-once delivery** — Kafka consumers or log shippers with at-least-once semantics can re-deliver on restart.
5. **Retry logic without idempotency** — Retried requests trigger the same log statements multiple times.
6. **Clustered applications** — Improper configuration where every node logs the same cluster-wide event.

---

## How do asynchronous systems affect logging?

1. **Non-sequential timestamps** — Async operations complete out of order; logs interleave across multiple concurrent flows.
2. **Context loss** — Thread-local storage doesn't carry across async boundaries. Context (trace_id) must be explicitly passed.
3. **Correlation is harder** — A request might span 10 async tasks; need to propagate correlation_id through callbacks/futures/channels.
4. **Log ordering** — Cannot rely on log insertion order to reconstruct flow; must use timestamps and sequence numbers.
5. **Error attribution** — An exception in an async callback has a stack trace that doesn't show the original caller.

**Solutions**: Use structured concurrency with context propagation (Go contexts, Java's MDC with CompletableFuture copy, Python's contextvars), always pass trace context through async boundaries.

---

## How do you log in event-driven systems?

1. **Log at producer and consumer** — Both sides log the event with the same `event_id`/`correlation_id`.
2. **Include event metadata** — `topic`, `partition`, `offset`, `event_type`, `event_id`, `produced_at`.
3. **Log processing lifecycle** — "received", "processing", "processed" or "failed" states.
4. **Trace context in event headers** — Embed `traceparent` in Kafka/SQS message headers so consumer traces link to producer traces.
5. **Dead letter queue logging** — When an event goes to DLQ, log the full event payload and failure reason.

```json
{
  "event": "order.payment.received",
  "event_id": "evt-789",
  "trace_id": "abc-123",
  "kafka_offset": 1048576,
  "kafka_partition": 3,
  "produced_at": "2024-01-15T14:23:00Z",
  "processed_at": "2024-01-15T14:23:01Z",
  "status": "processed"
}
```

---

## How do you handle logs in Kubernetes?

1. **Write to stdout/stderr** — Never write to files inside containers; Kubernetes captures stdout/stderr automatically.
2. **Use a DaemonSet log shipper** — Promtail (for Loki) or Fluentd/Fluent Bit (for ELK) runs on every node and tails `/var/log/containers/`.
3. **Enrich with K8s metadata** — The log shipper adds `pod_name`, `namespace`, `container_name`, `node_name` as labels/fields automatically.
4. **Label-based routing** — Route logs from different namespaces or teams to different storage backends.
5. **Handle log rotation** — Kubernetes rotates container logs; shippers must handle log file rotation.
6. **Avoid logging to emptyDir volumes** — Ephemeral storage; logs lost on pod restart. Use node-level collection instead.
7. **Multi-line log handling** — Stack traces span multiple lines; configure log shippers to detect and join them (multiline parsers).

```yaml
# DaemonSet log collection architecture
[Node]
  ├── /var/log/containers/app-pod-*.log   ← K8s writes here
  └── [Fluent Bit DaemonSet pod]
          ├── reads log files
          ├── enriches with k8s metadata
          └── ships to Loki/Elasticsearch
```

---

# 3. Metrics & Monitoring

## What metrics are important for backend APIs?

**Request metrics:**
- Request rate (RPS by endpoint)
- Error rate (5xx %, 4xx %)
- Latency distribution (p50, p95, p99 by endpoint)
- Request duration by status code

**Resource metrics:**
- CPU utilization
- Memory usage (heap + RSS)
- Goroutine/thread count
- Open file descriptors

**Dependency metrics:**
- Database query latency (p99) and error rate
- External HTTP call success rate and latency
- Cache hit rate
- Connection pool utilization

**Business metrics:**
- Orders/second, signups/minute (contextualizes technical metrics)

---

## Infrastructure metrics vs application metrics?

**Infrastructure metrics** — Hardware/OS/platform level.
- CPU, memory, disk I/O, network throughput, context switches
- Reported by Node Exporter (Prometheus), CloudWatch, system agents
- Answer: "Is the server healthy?"

**Application metrics** — Business logic and runtime level.
- Request rates, error rates, cache hit ratios, queue depths, business KPIs
- Reported by your application code via instrumentation
- Answer: "Is the application behaving correctly?"

You need both. A server can be healthy (infrastructure fine) while the application fails (OOM in a specific service). And vice versa.

---

## What is Prometheus?

Prometheus is an open-source **metrics monitoring and alerting system** originally built at SoundCloud, now a CNCF graduated project. It:

- Stores metrics as **time-series data** (metric name + labels + timestamp + value)
- Uses a **pull model** — scrapes HTTP `/metrics` endpoints on a defined interval
- Has its own **query language (PromQL)** for aggregating and alerting on metrics
- Includes **Alertmanager** for routing, deduplication, and silencing alerts
- Is **highly reliable** — single binary, no external dependencies for basic operation

Prometheus is the de facto standard for Kubernetes monitoring.

---

## Pull vs push monitoring models?

**Pull model (Prometheus)** — The monitoring system scrapes metrics from targets.
```
Prometheus ──► GET /metrics ──► Service A
              (every 15s)
```
Pros: Prometheus controls scrape rate; easy to detect dead services (scrape fails); simpler target configuration.
Cons: Harder for short-lived jobs (use Pushgateway as workaround); firewall issues if targets are not reachable.

**Push model (Graphite, InfluxDB, StatsD, Datadog Agent)** — Services push metrics to a central receiver.
```
Service A ──► metrics ──► InfluxDB/StatsD
(on event)
```
Pros: Works for short-lived processes, batch jobs, behind NAT.
Cons: Services can overwhelm the receiver; harder to detect missing metrics (silence vs failure).

---

## Why does Prometheus use pull architecture?

1. **Dead service detection** — If a scrape fails, Prometheus knows the target is down. With push, silence could mean down or just nothing to report.
2. **Rate control** — Prometheus controls how often to scrape; services can't DDoS the monitoring backend.
3. **Simpler service configuration** — Services just expose `/metrics`; no monitoring endpoint config.
4. **Network security** — Prometheus sits in a network location that can reach targets; services don't need outbound connectivity to monitoring.
5. **Consistent intervals** — Pull ensures metrics arrive at known, regular intervals useful for rate calculations.

---

## What are exporters in Prometheus?

Exporters are processes that **translate** third-party system metrics into the Prometheus format and expose them on a `/metrics` endpoint for scraping.

Used for systems you can't instrument directly (databases, hardware, OS):

| Exporter | What it monitors |
|---|---|
| node_exporter | Linux/OS: CPU, memory, disk, network |
| mysql_exporter | MySQL query rates, connections, slow queries |
| redis_exporter | Redis hit rate, memory, keyspace |
| blackbox_exporter | HTTP/TCP/DNS probes (synthetic checks) |
| kube-state-metrics | Kubernetes object states (pod status, deployment replicas) |
| postgres_exporter | PostgreSQL stats |
| kafka_exporter | Kafka consumer lag, topic metrics |

---

## Explain Prometheus scraping.

```
1. Prometheus reads its config (scrape_configs)
2. For each target, every scrape_interval (default 15s):
   a. HTTP GET {target_address}/metrics
   b. Parse the exposition format (text or protobuf)
   c. Store each metric as time-series: metric{labels} value @timestamp
3. Retention: keeps data in local TSDB (default 15 days)
4. Compaction: Prometheus compacts blocks to save space
```

The exposition format:
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1234
http_requests_total{method="POST",status="500"} 7
```

---

## What is PromQL?

PromQL (Prometheus Query Language) is a functional query language for time-series data. Used for dashboards (Grafana) and alert rules.

Key operations:
```promql
# Instant vector — current value
http_requests_total{job="api", status="500"}

# Rate over 5 minutes (for counters)
rate(http_requests_total[5m])

# Error rate percentage
sum(rate(http_requests_total{status=~"5.."}[5m])) /
sum(rate(http_requests_total[5m])) * 100

# p99 latency from a histogram
histogram_quantile(0.99, rate(http_duration_seconds_bucket[5m]))

# Aggregation across instances
sum by (service) (rate(http_requests_total[5m]))
```

---

## Counter vs Gauge vs Histogram vs Summary?

**Counter** — Monotonically increasing value. Only goes up (resets to 0 on restart).
- Use for: request count, error count, bytes sent
- Query with `rate()` or `increase()` to get per-second rate
- Example: `http_requests_total`

**Gauge** — Current value that can go up or down.
- Use for: memory usage, active connections, queue size, temperature
- Example: `memory_usage_bytes`, `goroutines_active`

**Histogram** — Samples observations and counts them in configurable buckets. Calculates quantiles server-side via `histogram_quantile()`.
- Use for: request latency, response size
- Stores: `_bucket`, `_sum`, `_count`
- Example: `http_request_duration_seconds`

**Summary** — Like Histogram but calculates quantiles client-side (in the application).
- Quantiles are pre-calculated, less flexible for aggregation across instances
- Example: `rpc_duration_seconds{quantile="0.99"}`

---

## When would you use Histogram over Summary?

**Use Histogram when:**
- You need to aggregate quantiles across multiple instances (`histogram_quantile()` can merge histograms from 100 pods)
- You don't know the expected value range in advance (buckets can be adjusted)
- You're using Prometheus (histogram is the standard)

**Use Summary when:**
- You need accurate quantiles for a single instance (no aggregation)
- Client-side computation is acceptable
- The latency distribution is known and stable

**In practice, Histogram is almost always preferred** in distributed systems because you can aggregate across all pods of a service. Summary quantiles from different pods cannot be meaningfully merged.

---

## What is percentile latency?

Percentile latency answers: "What is the latency that X% of requests complete within?"

- **p50 (median)**: 50% of requests are faster than this. Represents the "typical" user.
- **p95**: 95% of requests are faster. Represents users with slightly slow experience.
- **p99**: 99% of requests are faster. Represents the tail experience.
- **p99.9**: The worst 0.1% of requests — important for SLOs on critical paths.

```
Latency distribution:
p50  =  45ms  (half your users see this)
p95  = 210ms  (most users see this or better)
p99  = 890ms  (1 in 100 users waits this long)
p999 = 4200ms (1 in 1000 users — possibly hitting retry storms)
```

---

## Difference between p95 and average latency?

The average (mean) hides the distribution. A system with:
- 99 requests at 10ms and 1 request at 1000ms
- Reports average: 19.9ms ✓ (looks great!)
- But p99: 1000ms ✗ (1% of users wait 1 second)

The average is dragged down by the majority of fast requests and masks the tail experience. In e-commerce, the slow 1% might be your most important users (large carts, enterprise customers).

**Always use percentile latency for SLOs. Never use average latency for SLOs.**

---

## Why are averages misleading?

Averages suffer from:
1. **Masking tail latency** — As above; outliers are diluted.
2. **Simpson's paradox** — Averages across groups can be misleading when group sizes differ.
3. **Skewed distributions** — Latency distributions are typically log-normal or bimodal, not Gaussian. Mean is meaningless for non-normal distributions.
4. **The "1 in 100" problem** — If p99=5s and you have 1000 RPS, 10 users/second are experiencing 5s latency. That's a lot of angry users even if the average looks fine.

---

## How do you monitor memory leaks?

1. **Track heap/RSS over time** — A steadily increasing line that never flattens out is the classic leak signature.
2. **GC metrics** — Increasing GC frequency with decreasing GC effectiveness (GC reclaims less each cycle).
3. **Object allocation profiling** — Use pprof (Go), JVM heap dumps, .NET memory profiler to find which types are accumulating.
4. **Goroutine/thread count** — Leaked goroutines/threads each hold stack memory; goroutine count growing without bound is a leak.
5. **Alert on memory trend** — Alert when memory increases >X% over the past hour, not just when it hits a threshold.
6. **Chaos testing** — Run load tests for 24h; leaks often only appear under sustained load.

---

## What metrics would you monitor for Kubernetes?

**Cluster level:**
- Node CPU/memory utilization and capacity
- Pod pending count (scheduling failures)
- Node conditions (MemoryPressure, DiskPressure, PIDPressure)

**Workload level:**
- Deployment replica count vs desired
- Pod restart count (CrashLoopBackOff indicator)
- HPA (Horizontal Pod Autoscaler) utilization and scaling events
- Container CPU throttling (very important — often missed)
- Container OOM kills

**Control plane:**
- API server request latency and error rate
- etcd latency and disk usage
- Scheduler queue depth

**Sources**: kube-state-metrics (object states), cAdvisor (container resource usage), node_exporter (node OS metrics), metrics-server (HPA).

---

## Important JVM/.NET/Golang runtime metrics?

**JVM:**
- `jvm_memory_used_bytes` by heap/non-heap area
- GC pause duration and frequency (`jvm_gc_pause_seconds`)
- Thread pool utilization and queue depth
- Class loading count (leak indicator)
- JIT compilation time

**Golang:**
- `go_goroutines` — should be stable under steady load
- `go_memstats_heap_alloc_bytes` — heap in use
- `go_gc_duration_seconds` — GC pause distribution
- `go_memstats_sys_bytes` — total memory from OS
- `go_memstats_heap_idle_bytes` — idle heap (high = over-allocated)

**.NET:**
- `process_working_set_bytes` — total memory
- ThreadPool queue length
- GEN0/GEN1/GEN2 GC collection rate
- Exception count per second
- AspNetCore request queue length

---

## How do you monitor thread pool exhaustion?

Signs of thread pool exhaustion:
- Latency suddenly spikes without CPU spike
- Request queuing time increases
- "Thread pool starvation" errors in logs

Metrics to track:
```
thread_pool_active_threads / thread_pool_max_threads > 0.9  → Alert!
thread_pool_queue_depth > 100                               → Warning
thread_pool_rejected_tasks_total increasing                 → Critical
```

In Go: monitor goroutine count; goroutine leaks are the equivalent.
In Java: use `executor.getActiveCount() / executor.getMaximumPoolSize()`.

---

## How do you monitor database performance?

**Query performance:**
- Slow query count and latency (p95, p99)
- Queries per second by type (SELECT/INSERT/UPDATE)
- Deadlock count
- Lock wait time

**Connection pool:**
- Active connections / max connections (alert > 80%)
- Wait time for connection acquisition
- Connection errors

**Resource usage:**
- Disk I/O (reads/writes per second, bytes)
- Buffer cache hit ratio (should be >99%)
- Replication lag (for replica sets)
- Tablespace/index size growth

**PostgreSQL specific**: `pg_stat_activity` (active queries), `pg_stat_user_tables` (table bloat, index hit rate), `pg_stat_replication` (replica lag).

---

## Key Redis monitoring metrics?

- **Hit rate**: `keyspace_hits / (keyspace_hits + keyspace_misses)` — should be >95%
- **Memory usage**: `used_memory` vs `maxmemory` — alert at 80%
- **Eviction rate**: `evicted_keys` — if > 0 consistently, Redis is under memory pressure
- **Connected clients**: spike = connection leak
- **Blocked clients**: `blocked_clients` — clients waiting on BLPOP etc.
- **Command latency**: p99 latency per command type
- **Replication lag**: `master_last_io_seconds_ago` on replicas
- **Keyspace**: number of keys, key TTL distribution
- **Slowlog**: track commands exceeding `slowlog-log-slower-than`

---

## What OpenSearch/Elasticsearch metrics matter most?

**Cluster health:**
- Cluster status: GREEN/YELLOW/RED (RED = shards unassigned, data unavailable)
- Unassigned shards count
- Active shards %

**Performance:**
- Indexing rate (docs/sec) and latency
- Search query latency (p95, p99)
- Merge rate and merge time (heavy merges cause query slowdowns)

**Resource:**
- JVM heap usage (alert >75%, GC pressure >80%)
- Disk usage per node (alert >85%)
- Thread pool rejections (write, search, get)

**Most important signal**: JVM heap at >85% leads to GC storms → node instability → potential split-brain.

---

## How do you detect traffic spikes?

```promql
# Prometheus: detect if current rate is >2x the 1-hour average
rate(http_requests_total[5m]) >
  2 * avg_over_time(rate(http_requests_total[5m])[1h:5m])
```

Approaches:
1. **Rate-of-change alerting** — Alert when requests/second increases >X% over the last N minutes.
2. **Anomaly detection** — Baseline normal traffic patterns by hour/day; alert on deviations (requires ML or tools like Datadog).
3. **Absolute threshold with time-of-day** — Different thresholds for business hours vs. night.
4. **Saturation leading indicators** — CPU throttling, connection pool depth, and queue depth spike before traffic spike appears in metrics.

---

## What metrics indicate cascading failures?

1. **Error rates rising in waves** — Service A errors, then Service B errors, then Service C — the blast radius is spreading.
2. **Latency increasing across services** — Slow upstream causes thread pool exhaustion in downstream.
3. **Connection pool exhaustion** — Downstream service slow → upstream holds connections longer → pool fills.
4. **Retry storms** — Error rate rises, clients retry, amplifying the load.
5. **Circuit breaker open states** — `circuit_breaker_open{service="payment"}` = 1 means that service is shedding load.
6. **GC pressure** — Long response times cause request queuing → more in-flight requests → more objects in heap → GC pressure → longer pauses → more queuing (feedback loop).

---

## CPU high but low traffic — possible reasons?

1. **Runaway background job** — A cron job, GC, or maintenance task consuming CPU.
2. **Infinite loop / busy-wait** — A bug causing a thread to spin.
3. **Inefficient algorithm** — O(n²) operation triggered by a small input but running continuously.
4. **Log processing spike** — Logger flushing a large buffer, especially synchronous loggers.
5. **Crypto operations** — TLS renegotiation, certificate validation, or encryption running hot.
6. **GC pressure** — Memory leak causing frequent GC cycles.
7. **Noisy neighbor** — Another container/process on the same node consuming CPU (check node-level metrics).
8. **Metrics/tracing overhead** — Poorly configured instrumentation sampling every request.
9. **Kernel-level work** — System calls (context switches, interrupts) visible in `iowait` or `sys` CPU.

---

## Memory usage keeps increasing — how do you debug?

1. **Confirm it's a leak** — Is memory growing monotonically over hours/days? Or does it plateau? (Plateau = just loading data, not a leak.)
2. **Take heap snapshots at intervals** — Compare `t0`, `t+1h`, `t+2h` snapshots; what object types grew?
3. **Check goroutine/thread count** — Growing count = goroutine/thread leak.
4. **Look at allocation sites** — Go: `pprof` heap profile; Java: heap dump + MAT; .NET: dotnet-dump.
5. **Find retention paths** — What's holding references to the accumulating objects? GC roots analysis.
6. **Correlate with traffic** — Does memory grow proportionally to requests (might be caching) or independently?
7. **Check third-party libraries** — Connection pools, HTTP clients, and caches often have misconfigured max sizes.
8. **Review recent deployments** — Memory leak introduced in last N commits; bisect with git.

---

## What dashboards do you usually create?

**Service Overview (RED + Golden Signals):**
- Request rate, error rate, p50/p95/p99 latency (by endpoint)
- Active instances, restart count, deployment marker

**Infrastructure:**
- CPU, memory, disk I/O, network per node/pod
- Container CPU throttling, OOM kills

**Database:**
- Query latency, slow queries, connection pool utilization, replication lag

**Distributed Tracing Summary:**
- Slowest traces, error traces, service dependency graph

**Business KPIs:**
- Orders/minute, signups, revenue — correlated with technical metrics

**On-call Dashboard:**
- All active alerts, error budget burn rate, recent incidents

---

## What metrics are most important for microservices?

Per-service:
1. **Error rate** — % of requests returning 5xx
2. **Latency p99** — Tail latency affecting users
3. **Request rate** — Traffic volume
4. **Saturation** — CPU, memory, thread pool

Cross-service:
5. **Downstream dependency error rates** — Which dependencies are failing?
6. **Circuit breaker states** — Which services are in open/half-open state?
7. **Service mesh metrics** — If using Istio/Linkerd: success rate and latency per service pair

---

## How do you monitor queue systems like Kafka/RabbitMQ/SQS?

**Kafka:**
- Consumer lag per consumer group per partition (most important)
- Messages produced/consumed per second
- Broker disk usage, partition count
- Under-replicated partitions (data loss risk)
- Leader election rate

**RabbitMQ:**
- Queue depth per queue
- Messages published/delivered/acknowledged per second
- Unacked message count
- Dead letter queue depth

**SQS:**
- `ApproximateNumberOfMessagesVisible` (queue depth)
- `ApproximateAgeOfOldestMessage` (processing lag)
- `NumberOfMessagesSent` / `NumberOfMessagesDeleted`

---

## What is consumer lag?

Consumer lag is the **difference between the latest message offset** in a Kafka partition and **the offset the consumer group has committed** (processed).

```
Partition:  [msg1, msg2, msg3, msg4, msg5, msg6, msg7]
                                      ↑                ↑
                              Consumer committed     Latest
                              up to msg4             msg7
                              
Lag = 7 - 4 = 3 (3 unprocessed messages)
```

High consumer lag means:
- Consumers are slower than producers
- Risk of `retention.ms` expiry causing data loss
- Processing backlog growing

Alert on lag > N messages AND lag growing over time (steady lag is fine, growing lag is not).

---

## How do you monitor API rate limiting?

Metrics to track:
- `rate_limit_hit_total` — Count of requests rejected by rate limiter
- `rate_limit_remaining` — Tokens/capacity remaining in the bucket (gauge)
- Request rate by client/IP/API key — Are specific clients being throttled?
- `429 status code rate` — HTTP 429 responses as % of total

Alert when:
- 429 rate exceeds X% of traffic (might indicate DDoS or misbehaving client)
- A trusted client (internal service) starts getting rate-limited unexpectedly

---

## What metrics matter for autoscaling?

For HPA (Kubernetes Horizontal Pod Autoscaler):
- **CPU utilization** — Standard HPA metric; scale when >70% average across pods
- **Memory utilization** — For memory-bound services
- **Custom metrics** — Request queue depth, active connections, pending jobs (KEDA)
- **RPS per pod** — Scale based on load, not just resource usage

For predictive/proactive autoscaling:
- Traffic growth rate (slope of RPS)
- Time-of-day traffic patterns
- Upstream event signals (e.g., marketing campaign start)

Key consideration: Include scale-in cooldown periods to prevent thrashing. Monitor HPA events (`kubectl describe hpa`) for scaling failures.

---

# 4. Distributed Tracing

## What is distributed tracing?

Already covered above. To restate concisely: distributed tracing tracks a single request's complete journey across all services by propagating a `trace_id` and recording timed "spans" at each service. The result is a tree (or DAG) of spans showing the full execution path, duration, and metadata for any given request.

---

## Why is tracing important in microservices?

In a monolith, a stack trace shows you exactly where an error occurred. In a microservices system with 20+ services, a slow or failed request could be caused by any of them. Without tracing:

- You know the checkout is slow but not which of 15 services is responsible
- Each service's logs are siloed; correlating them is manual and error-prone
- Dependencies are invisible; you don't know that checkout calls auth, which calls user-service, which calls postgres

Tracing provides the **call graph and timing data** that makes distributed debugging feasible.

---

## Explain a request lifecycle using traces.

```
User clicks "Checkout" at T=0ms

Trace ID: 4bf92f35 (generated by API gateway)

Span A: api-gateway                         [0ms ───────────────────────── 280ms]
  Span B: auth-service                        [5ms ──── 28ms]
  Span C: cart-service                        [30ms ──── 85ms]
    Span D: postgres (SELECT cart)              [35ms ── 80ms]
  Span E: payment-service                     [90ms ──────────────────────── 275ms]
    Span F: fraud-check-api (external)          [95ms ─────────────────────── 265ms]
      ← THIS is where 170ms of latency was added
```

Each span contains:
- `trace_id`, `span_id`, `parent_span_id`
- `service.name`, `operation.name`
- Start time, duration
- Status (OK / ERROR)
- Attributes: `http.method`, `http.status_code`, `db.statement`, etc.
- Events: timestamped annotations within the span (e.g., "cache miss", "retry attempt 1")

---

## What is a span?

A span is a **single unit of work** within a trace — the building block of distributed tracing.

Each span represents one operation: an HTTP request, a DB query, a cache lookup, a function call. Spans are the nodes in the trace tree.

Span anatomy:
```
{
  "trace_id":    "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id":     "00f067aa0ba902b7",
  "parent_span_id": "b9c7c989f97918e1",
  "operation":   "SELECT * FROM orders WHERE id=?",
  "service":     "order-service",
  "start_time":  "2024-01-15T14:23:01.100Z",
  "duration_ms": 45,
  "status":      "OK",
  "attributes": {
    "db.system": "postgresql",
    "db.name": "orders"
  }
}
```

---

## Parent span vs child span?

**Parent span** — The span that initiates a unit of work and may create child spans.
- A parent span's duration encompasses all its children.
- The root span (top of the tree) has no parent.

**Child span** — Created by a parent span to represent a sub-operation.
- Has a `parent_span_id` referencing the parent.
- If a child errors, the parent typically also marks itself as errored.

```
Parent: api-gateway [0-280ms]
  Child: auth [5-28ms]
  Child: payment [90-275ms]   ← This is both a child of api-gateway
    Child: fraud [95-265ms]   ← And a parent of fraud
```

---

## What is span context propagation?

Span context propagation is the mechanism of **passing trace identity** (trace_id, span_id, sampling decision) from one service to another, so they can attach their spans to the correct trace.

Without propagation, each service creates isolated, disconnected traces.

Propagation flow:
```
Service A creates span → injects context into outgoing HTTP headers
Service B receives request → extracts context from headers → creates child span
```

The W3C `traceparent` header is the modern standard:
```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ↑   ↑ trace_id                      ↑ span_id          ↑ sampled
             version
```

---

## What headers are commonly used for trace propagation?

| Header | Standard | Used by |
|---|---|---|
| `traceparent` | W3C TraceContext (recommended) | OpenTelemetry, all modern systems |
| `tracestate` | W3C (vendor-specific data) | OpenTelemetry |
| `X-B3-TraceId` + `X-B3-SpanId` | B3 (Zipkin) | Zipkin, older Jaeger, Spring Cloud Sleuth |
| `X-Request-ID` | Custom | Generic correlation |
| `uber-trace-id` | Jaeger native | Jaeger (legacy) |
| `x-datadog-trace-id` | Datadog | Datadog APM |

OpenTelemetry can extract and inject all of these via configurable propagators, enabling interop between systems.

---

## How does OpenTelemetry work?

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION                              │
│                                                             │
│  SDK (OTel)  →  instruments code  →  creates Spans/Metrics  │
│                         ↓                                  │
│              Batches & exports telemetry                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ OTLP (gRPC or HTTP)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│             OpenTelemetry Collector                          │
│                                                             │
│  Receivers (OTLP, Jaeger, Zipkin, Prometheus)               │
│      ↓                                                      │
│  Processors (batch, filter, transform, sample)              │
│      ↓                                                      │
│  Exporters (Jaeger, Zipkin, Datadog, Grafana, OTLP)         │
└──────────────────────────────────────────────────────────────┘
```

The SDK: Provides APIs for creating spans, recording metrics, emitting logs. Language-specific (Go, Java, Python, Node.js, .NET, etc.)

The Collector: A vendor-neutral proxy/pipeline. Decouples your app from the backend. You can switch from Jaeger to Datadog without touching application code.

---

## Difference between Jaeger and Zipkin?

| | Jaeger | Zipkin |
|---|---|---|
| **Origin** | Uber | Twitter |
| **Architecture** | Full-featured: collector, query, UI, agent | Simpler: collector, storage, UI |
| **Storage backends** | Cassandra, Elasticsearch, Kafka, Badger | Cassandra, Elasticsearch, MySQL, in-memory |
| **UI** | Rich: flame graph, service map, comparison | Simpler but functional |
| **Scalability** | Better horizontal scaling design | Good for small-medium deployments |
| **Sampling** | Head and adaptive sampling | Head sampling |
| **OTel integration** | First-class (CNCF project like OTel) | Supported via OTel Zipkin exporter |

Both are excellent. In greenfield systems, use OpenTelemetry + Jaeger (or Tempo for Grafana stack). Zipkin is more common in legacy Java/Spring ecosystems.

---

## How do traces help identify bottlenecks?

The flame graph / Gantt chart view makes bottlenecks visually obvious:

1. **Width of span = duration** — Long spans = slow operations
2. **Sequential vs parallel** — Unnecessary sequential calls that could be parallelized are visible
3. **Tail latency contributors** — Even if p50 looks fine, trace a p99 request and see which span is the outlier
4. **N+1 patterns** — If you see 100 identical DB spans in a trace, you've found an N+1 query
5. **Cold start latency** — First requests to a service may be slow due to connection pool warmup, visible in traces

---

## Challenges with tracing asynchronous systems?

1. **Context loss across async boundaries** — When a goroutine/thread is spawned, the context isn't automatically inherited; must be explicitly passed.
2. **Broken trace continuity** — If context isn't propagated across a queue/event bus, the consumer trace is disconnected from the producer trace.
3. **Time gaps** — Async work may happen minutes or hours after the triggering event; the trace spans a non-contiguous time period.
4. **Span lifetime management** — Long-running async spans need explicit start/end; if the process crashes, spans may never be exported.
5. **Out-of-order span arrival** — Async spans may arrive at the backend out of order; backends must handle this gracefully.

---

## How do you trace Kafka/SQS events?

Inject the trace context into the **message headers** at produce time, extract it at consume time:

**Producer (Python example):**
```python
headers = {}
propagate.inject(headers)  # Injects traceparent into headers dict
producer.send(topic, value=payload, headers=headers)
```

**Consumer:**
```python
context = propagate.extract(message.headers)
with tracer.start_as_current_span("process_order", context=context):
    # This span is now linked to the producer's trace
    process(message)
```

This creates a linked trace across the queue boundary. In Jaeger, you can see the producer and consumer spans in the same trace tree, with the queue "hop" showing the time message spent in queue.

---

## What is sampling in tracing?

Sampling is the process of deciding which requests to trace (record all spans) vs. drop (discard). Tracing every request at high traffic is prohibitively expensive.

**Why sample?** At 10,000 RPS, full tracing generates millions of spans/second. A 1% sample still gives 100 traces/second — enough for analysis.

---

## Head sampling vs tail sampling?

**Head sampling** — The sampling decision is made **at the start** of the trace (at the first span).
- Simple to implement; decision is made once and propagated
- Cons: You don't know yet if the request will be interesting (slow, erroring)
- You might discard a slow/error trace because it was sampled out at the beginning

**Tail sampling** — The sampling decision is made **after the trace completes**.
- Can always sample 100% of error traces and slow traces
- Discard boring fast/successful traces
- Cons: Must buffer all spans until trace completion, then decide; more complex, more infrastructure

```
Head: [decide at start] → might discard errors
Tail: [buffer all spans] → [trace completes] → [was it interesting?] → keep/discard
```

**Best practice**: Head-sample at a base rate (0.1–1%) for volume control + tail-sample for all errors and p99+ latency traces.

---

## How do you reduce tracing overhead?

1. **Sampling** — Don't trace every request. 1–10% is usually sufficient.
2. **Async export** — Never block request handling to export spans; use background batching.
3. **Batch export** — Send spans in batches (OTel Collector handles this) not one at a time.
4. **Reduce attribute count** — Don't add 50 attributes per span; keep to the essentials.
5. **Avoid tracing every SQL parameter** — Log query type, not full query with all values.
6. **Use sampling for internal spans** — Internal in-process spans can be sampled at lower rates than service boundary spans.
7. **OTel Collector as buffer** — Have the app export to a local OTel Collector; the Collector handles batching, retry, and backpressure, not the app.

---

## What problems happen when trace propagation breaks?

1. **Orphaned spans** — Consumer service creates spans with no parent; they appear as independent single-service traces.
2. **Incomplete traces** — A trace shows only part of the request journey; the rest is invisible.
3. **Missing root cause** — If the failing service's spans are disconnected, you can't see what triggered the failure.
4. **Broken alerting** — Trace-based SLO monitors (error rate by trace root) miss failures in disconnected services.

Common causes: HTTP client not configured with OTel propagator, async message handler not extracting headers, gRPC metadata not mapped to context.

---

## How do you correlate traces with logs?

1. **Inject trace_id into log context** — When a span is active, the trace_id and span_id should automatically appear in every log line.

In Go (zap):
```go
logger.Info("Payment processed",
    zap.String("trace_id", span.SpanContext().TraceID().String()),
    zap.String("span_id", span.SpanContext().SpanID().String()),
)
```

2. **OTel log bridge** — OpenTelemetry provides a LogBridge API that automatically correlates logs with the active span.
3. **Grafana Explore** — Shows "Logs for this trace" feature when trace_id is present in both Tempo (traces) and Loki (logs).
4. **Datadog** — Automatically correlates APM traces and logs when the same trace_id appears in both.

---

## How do you instrument a Golang/.NET service for tracing?

**Go (OpenTelemetry):**
```go
// 1. Initialize tracer provider
tp := trace.NewTracerProvider(
    trace.WithBatcher(otlpExporter),
    trace.WithResource(resource.NewWithAttributes(
        semconv.ServiceNameKey.String("payment-service"),
    )),
)
otel.SetTracerProvider(tp)

// 2. Use tracer in handlers
tracer := otel.Tracer("payment-service")

func ProcessPayment(ctx context.Context) {
    ctx, span := tracer.Start(ctx, "ProcessPayment")
    defer span.End()
    
    // Pass ctx to downstream calls so child spans are created
    result, err := callFraudCheck(ctx)
    if err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, err.Error())
    }
}
```

**.NET (OpenTelemetry):**
```csharp
services.AddOpenTelemetry()
    .WithTracing(builder => builder
        .AddAspNetCoreInstrumentation()    // Auto-instrument HTTP
        .AddSqlClientInstrumentation()    // Auto-instrument SQL
        .AddOtlpExporter());              // Export to OTel Collector
```

---

## What causes missing spans?

1. **Context not propagated** — Async call, goroutine spawn, or thread pool without context passing.
2. **Exporter failure** — Network issue between app and OTel Collector; spans buffered then dropped.
3. **Sampling** — Span was created but sampled out.
4. **Span not ended** — `span.End()` not called (defer missed); span may time out and be dropped.
5. **Wrong parent** — Span created with background context instead of request context; appears as separate trace.
6. **Instrumentation not installed** — Dependency (gRPC client, HTTP client) not instrumented.
7. **Clock skew** — In distributed systems, small clock differences can cause spans to appear out-of-order or outside the parent's time window.

---

## How would you debug a slow distributed transaction?

1. **Find the trace** — Filter traces for the transaction type with high duration (p99 filter in Jaeger/Grafana Tempo).
2. **Look at the flame graph** — Identify the widest (slowest) span. Is it one service, or many?
3. **Drill into the slow span** — What operation is it? DB query, external API call, CPU work?
4. **Check the span's attributes** — `db.statement`, `http.url`, error details.
5. **Look at parallel vs sequential** — Are services being called sequentially that could be parallelized?
6. **Compare to a fast trace** — Diff a slow trace against a fast one for the same operation. What's different?
7. **Check the span events** — Timeline within the span (retries, cache misses, lock waits).
8. **Correlate with logs** — Use trace_id to pull logs from the slow service during that exact window.
9. **Check infrastructure** — Was there CPU throttling, GC pause, or network congestion on the node running the slow service?

---

# 5. OpenTelemetry & Modern Observability

## What is OpenTelemetry?

OpenTelemetry (OTel) is an **open-source observability framework** — a CNCF project — that provides:
- **APIs**: Language-agnostic interfaces for creating spans, recording metrics, emitting logs
- **SDKs**: Language-specific implementations (Go, Java, Python, JS, .NET, Ruby, etc.)
- **Collector**: A vendor-neutral agent/proxy for receiving, processing, and exporting telemetry
- **Semantic conventions**: Standardized attribute names (`http.method`, `db.system`, etc.)
- **OTLP**: OpenTelemetry Line Protocol — the wire protocol for telemetry data

OTel replaces vendor-specific SDKs (Datadog, Jaeger, Zipkin SDKs) with a single, standardized instrumentation layer.

---

## Why is OpenTelemetry becoming standard?

1. **Vendor lock-in escape** — Instrument once, export to any backend (Datadog, Grafana, Jaeger, Splunk, New Relic). Switch vendors without touching application code.
2. **Community + CNCF backing** — Broad adoption, active maintenance, all major vendors contributing.
3. **Unified signals** — One SDK for traces, metrics, and logs with built-in correlation.
4. **Auto-instrumentation** — Zero-code instrumentation for popular frameworks (Spring Boot, Express, Django, gRPC).
5. **Semantic conventions** — Standardized attribute names enable cross-service, cross-team analysis without schema negotiation.
6. **Collector** — A powerful, pluggable pipeline for telemetry processing (sampling, filtering, enrichment).

---

## Explain OTLP protocol.

OTLP (OpenTelemetry Protocol) is the **native wire protocol** for sending telemetry data between OTel components (SDK → Collector, Collector → backend).

It uses:
- **gRPC** (default, port 4317) — Binary, efficient, streaming
- **HTTP/JSON** (port 4318) — Human-readable, easier to debug, works in environments where gRPC is blocked

OTLP carries all three signals (traces, metrics, logs) over the same connection. Data is encoded as Protocol Buffers.

```
Application SDK
    ↓ OTLP/gRPC (localhost:4317)
OTel Collector
    ↓ OTLP/gRPC or vendor-specific protocol
Backend (Jaeger / Datadog / Tempo)
```

---

## What is an OpenTelemetry Collector?

The OTel Collector is a **vendor-agnostic telemetry pipeline** that sits between your applications and your backends.

```
Receivers          Processors              Exporters
─────────          ──────────              ─────────
OTLP      ──►  batch                ──►  Jaeger
Jaeger    ──►  filter               ──►  Prometheus
Zipkin    ──►  tail_sampling        ──►  Datadog
Prometheus──►  attribute_transform  ──►  OTLP (another collector)
Syslog    ──►  resourcedetection    ──►  Loki
```

Benefits:
- **Decoupling**: Apps don't know about backends; Collector handles routing
- **Processing**: Sampling, filtering, enrichment, format conversion
- **Reliability**: Buffering, retry, backpressure between app and backend
- **Multi-backend**: Fan out to Datadog + Jaeger simultaneously
- **Security**: Only the Collector needs outbound connectivity to monitoring backends

---

## Agent vs Collector?

In OTel terminology these terms are sometimes used interchangeably, but architecturally:

**Agent (sidecar/local process)** — A Collector instance running **per host or per pod**, close to the application.
- Receives telemetry from the app (low-latency, local network)
- Does basic processing (batching, local enrichment)
- Forwards to a central Collector or backend

**Collector (central/gateway)** — A larger Collector deployment receiving from many agents.
- Does heavy processing (tail sampling, complex filtering, routing)
- Manages backend connections

```
[App] → [OTel SDK] → [Agent (per pod)] → [Collector (central)] → [Backends]
                      local gRPC          regional cluster
```

The two-tier model separates concerns: agents are lightweight and close to apps, central collectors handle complex processing.

---

## How do you instrument applications with OpenTelemetry?

**Step 1**: Add OTel SDK dependency
**Step 2**: Configure SDK (exporter endpoint, service name, resource attributes)
**Step 3**: Choose auto vs manual instrumentation
**Step 4**: Start the SDK at application startup

```go
// Go — manual initialization
func initTracer() *sdktrace.TracerProvider {
    exporter, _ := otlptracehttp.New(ctx,
        otlptracehttp.WithEndpoint("otel-collector:4318"),
    )
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter),
        sdktrace.WithResource(resource.NewWithAttributes(
            semconv.ServiceNameKey.String("checkout-service"),
            semconv.ServiceVersionKey.String("1.2.3"),
        )),
    )
    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.TraceContext{})
    return tp
}
```

---

## Auto instrumentation vs manual instrumentation?

**Auto-instrumentation** — An agent or library patches frameworks/libraries at startup with no code changes.
- Java agent: `-javaagent:opentelemetry-javaagent.jar` instruments Spring Boot, JDBC, gRPC, etc. automatically
- Node.js: `@opentelemetry/auto-instrumentations-node` patches Express, pg, redis, etc.
- Pros: Zero code change, consistent instrumentation, fast to deploy
- Cons: Less control over span attributes; can't add custom business context

**Manual instrumentation** — Developer explicitly creates spans and adds attributes.
```python
with tracer.start_as_current_span("validate-payment") as span:
    span.set_attribute("payment.method", "card")
    span.set_attribute("payment.amount", amount)
    result = validate(payment)
```
- Pros: Rich, contextual, business-aware spans
- Cons: Developer effort; easy to miss instrumentation

**Best practice**: Auto-instrumentation as the base layer, manual instrumentation for business-critical paths.

---

## What telemetry data does OpenTelemetry support?

OTel supports all three pillars:

1. **Traces** — Spans with context propagation, parent-child relationships, attributes, events, links
2. **Metrics** — Counters, gauges, histograms, up/down counters with OTLP metric export
3. **Logs** — Structured log emission with automatic trace context injection (OTel Logs SDK is the newest addition)

Plus:
- **Baggage** — User-defined key-value pairs propagated across services (for business context, not telemetry)
- **Exemplars** — Link specific metric data points to representative traces (e.g., the trace that caused a p99 spike)

---

## How do you export telemetry to Grafana/Datadog/New Relic?

**Grafana (OSS stack):**
```yaml
# OTel Collector config
exporters:
  otlp:
    endpoint: "tempo-gateway:4317"    # Traces → Grafana Tempo
  prometheus:
    endpoint: "0.0.0.0:8889"          # Metrics → Prometheus scrapes this
  loki:
    endpoint: "http://loki:3100/loki/api/v1/push"  # Logs → Loki
```

**Datadog:**
```yaml
exporters:
  datadog:
    api:
      key: "${DD_API_KEY}"
      site: "datadoghq.com"
```

**New Relic:**
```yaml
exporters:
  otlp:
    endpoint: "otlp.nr-data.net:4317"
    headers:
      api-key: "${NEW_RELIC_LICENSE_KEY}"
```

The power of OTel: change the exporter config, keep all application code unchanged.

---

## What challenges have you faced with OpenTelemetry?

1. **SDK maturity varies by language** — Go and Java SDKs are stable; some languages (PHP, Swift) have less complete implementations.
2. **Auto-instrumentation gaps** — Not every library has an OTel plugin; custom instrumentation needed for internal frameworks.
3. **Tail sampling complexity** — Implementing tail sampling in the OTel Collector requires careful memory sizing and trace buffering config.
4. **Context propagation bugs** — Easy to lose context in async code, goroutine pools, or thread pools not configured with context propagation.
5. **Collector operational overhead** — Running and sizing a Collector fleet is an additional infrastructure concern.
6. **Metric compatibility** — Translating OTel metrics (OTLP) to Prometheus format loses some fidelity (exemplars, histograms).
7. **Logs SDK** — The OTel Logs SDK is newer and less battle-tested than traces and metrics.
8. **Vendor compatibility** — Some vendor-specific features (Datadog APM profiling, custom sampling rules) require vendor-specific SDK extensions.

---

# 6. Alerting & Incident Management

## What makes a good alert?

A good alert is:

1. **Actionable** — There is a clear action to take when it fires. "CPU > 50%" with no action = bad alert.
2. **Symptom-based, not cause-based** — Alert on "users are experiencing errors" not "CPU is high" (CPU high may or may not affect users).
3. **Accurate** — Low false positive rate. Alerts that cry wolf get ignored.
4. **Time-sensitive** — Alerts fire quickly enough to allow response before significant user impact.
5. **Contextualized** — The alert message includes enough information to start investigating (runbook link, affected service, severity).
6. **Prioritized** — Not every problem needs to wake someone at 3 AM. Reserve pager alerts for user-impacting issues.

```
Bad:  "CPU on web-server-03 is 85%"     (cause, not symptom; maybe fine)
Good: "Error rate > 1% for 5m on checkout service — p99 latency 2.3s, runbook: /runbooks/checkout-errors"
```

---

## What is alert fatigue?

Alert fatigue occurs when engineers receive so many alerts — especially false positives or low-signal alerts — that they start ignoring or dismissing them automatically, including real incidents.

Causes:
- Too many low-priority alerts going to pager
- Alerts that don't require action ("informational")
- Noisy thresholds that fire constantly during normal behavior
- No alerting hygiene — alerts added but never reviewed

Consequences:
- Engineers dismiss pages without investigating
- Real incidents missed or responded to slowly
- Team morale deteriorates; on-call becomes dreaded

Fix: Audit alert noise monthly. Every alert should have a runbook. If an alert fires and the action is "nothing" more than 20% of the time, delete or downgrade it.

---

## Difference between symptom-based and cause-based alerts?

**Symptom-based** — Alerts on things users experience.
- "Error rate > 1% on checkout" — users are failing
- "p99 latency > 2s" — users are experiencing slowness
- High signal, unambiguous user impact

**Cause-based** — Alerts on internal resource/infrastructure conditions.
- "CPU > 90%" — might affect users, might not
- "Disk > 80%" — might cause issues, might not
- More ambiguous; many false positives

**Best practice**: Use symptom-based alerts for pager/PagerDuty. Use cause-based alerts for tickets and dashboards. Alert on symptoms to wake people up; use causes to guide investigation.

---

## Static threshold vs anomaly detection?

**Static threshold** — Alert when a metric crosses a fixed value.
- Example: `error_rate > 5%`
- Simple to configure and reason about
- Cons: Brittle to seasonality (weekday vs weekend traffic patterns), requires manual tuning

**Anomaly detection** — Alert when a metric deviates significantly from its predicted/historical value.
- Example: "Current error rate is 5x higher than normal for this time of week"
- Catches problems that don't cross static thresholds (e.g., normally 0.01% errors; now 0.2% is a huge problem)
- Adapts to traffic patterns automatically
- Cons: Can be a black box; harder to tune; may alert during planned changes

**Use both**: Static thresholds for absolute limits (error rate must never exceed 5%). Anomaly detection for relative changes (error rate tripled from baseline).

---

## What should trigger a pager alert?

Only things that are:
1. **User-impacting now** — Real users experiencing failures or severe degradation
2. **Requiring immediate human action** — Automation can't resolve it
3. **Time-critical** — Delaying response by >15 minutes would meaningfully worsen the incident

Examples of pager-worthy alerts:
- Error rate > 1% for 5+ minutes
- p99 latency > 5s for 5+ minutes
- Service completely down (0 successful requests)
- Security incident (unauthorized access pattern)
- Data loss or corruption risk

Examples of NOT pager-worthy (handle via ticket/Slack):
- Disk usage > 70% (trending toward full over days)
- Memory usage elevated but stable
- Certificate expiring in 30 days
- Deployment failure (service still up on previous version)

---

## How do you reduce false positives?

1. **Use `for` duration** — Alert only if condition persists for N minutes (not just one data point).
   ```yaml
   alert: HighErrorRate
   expr: error_rate > 0.05
   for: 5m   # Must be true for 5 continuous minutes
   ```
2. **Alert on rate, not total** — `rate(errors[5m]) > 0.05` not `errors > 100` (traffic-normalized).
3. **Seasonal adjustments** — Different thresholds for business hours vs. night.
4. **Multi-condition alerts** — Alert only when errors are high AND latency is high AND traffic is normal (not when you're DDoSed).
5. **Tune regularly** — Review which alerts fired over the last month; retune or delete noisy ones.
6. **Test in staging** — Validate alert behavior in staging by injecting failures before enabling in production.
7. **Inhibition rules** — If the database is down, suppress all downstream service alerts (they're caused by the DB, not independent issues).

---

## What alerts are critical for APIs?

1. **Error rate (5xx)** — Any sustained elevation above baseline
2. **Latency (p99)** — Slow tail latency degrading user experience
3. **Request rate drop** — Sudden drop in traffic = possible routing or deployment issue
4. **SSL certificate expiry** — Alert 30 days before, then 14, then 7
5. **Authentication failure spike** — Possible credential stuffing or auth service outage
6. **Downstream dependency failures** — DB, cache, or critical external API error rate spike
7. **Deployment rollout failures** — New version releasing with elevated errors vs old version

---

## What alerts matter for databases?

1. **Replication lag** — Replica falling behind master (data staleness or failover risk)
2. **Connection pool exhaustion** — Pool utilization > 85% for sustained period
3. **Slow query count** — Queries exceeding query timeout threshold
4. **Disk usage** — Alert at 75%, 85%, 90%
5. **Lock wait timeout** — Indicates contention, possible deadlock risk
6. **Buffer cache hit rate drop** — Cache hit rate < 95% means more disk I/O, degraded performance
7. **Primary unavailable** — Full loss of primary database (critical, immediate page)
8. **Long-running transactions** — Transactions open for > N minutes; holding locks, bloating logs

---

## What is a runbook?

A runbook is a **documented procedure** for responding to a specific alert or incident. It answers:

1. **What is this alert?** — What condition triggered it?
2. **What is the user impact?** — Who is affected and how?
3. **Immediate mitigations** — Steps to reduce impact NOW (rollback, scale up, restart, toggle feature flag)
4. **Investigation steps** — How to diagnose the root cause (which queries to run, dashboards to check)
5. **Escalation path** — Who to contact if you can't resolve it
6. **Resolution steps** — How to fully fix the issue

Good runbooks:
- Are linked directly from alert messages
- Are kept up to date (tested during every incident)
- Are written to be executed by someone unfamiliar with the service
- Include copy-paste commands, not just descriptions

---

## What happens during an incident response?

```
INCIDENT RESPONSE LIFECYCLE

1. DETECT          Alert fires → on-call receives page
2. ACKNOWLEDGE     On-call acknowledges; declares incident if warranted
3. TRIAGE          Assess severity: Who is affected? How badly?
4. COMMUNICATE     Post in #incidents channel; notify stakeholders
5. INVESTIGATE     Use observability tools to find root cause
6. MITIGATE        Reduce impact: rollback, scale, feature flag
7. RESOLVE         Fix root cause or confirm mitigation is stable
8. COMMUNICATE     All-clear to stakeholders
9. POSTMORTEM      Within 24-48h: blameless review of what happened and why
```

Key roles during an incident:
- **Incident Commander (IC)** — Coordinates response, makes decisions, manages communication
- **Technical Lead** — Investigates and implements fixes
- **Communications Lead** — Updates stakeholders and status page
- **Scribe** — Documents timeline in real time

---

## How do you handle production outages?

1. **Don't panic** — Take a breath; systematic debugging beats frantic clicking.
2. **Start with recent changes** — 80% of outages are caused by recent deployments, config changes, or data migrations. Check what changed in the last 2 hours.
3. **Assess scope** — Is this affecting all users or a subset? All regions or one? All endpoints or specific ones?
4. **Mitigate first** — Rollback a bad deployment, scale up resources, toggle a feature flag. Restore service first, find root cause second.
5. **Communicate continuously** — Regular updates every 15-30 minutes even if there's no news: "Still investigating, update in 30m."
6. **Document as you go** — Write down what you tried, what you found, what you ruled out.
7. **Involve the right people** — If DB is involved, call the DBA. Don't solo-hero a multi-domain outage.
8. **Don't make things worse** — If unsure about a change, don't make it during the outage. Stability > speed of recovery.

---

## How do you prioritize incidents?

Use a severity matrix based on **user impact** and **scope**:

| Severity | Definition | Response Time | Example |
|---|---|---|---|
| **SEV1 (Critical)** | Complete outage, all users affected | Immediate, all hands | Checkout service 100% down |
| **SEV2 (High)** | Major feature broken, many users affected | 15 min | Payment failures for 20% of users |
| **SEV3 (Medium)** | Degraded experience, some users affected | 1 hour | Slow search for users in EU region |
| **SEV4 (Low)** | Minor issue, small user impact | Next business day | Broken image on help page |

Prioritize by: user impact > revenue impact > data integrity risk > security risk.

---

## What is a postmortem?

A postmortem (also called incident review or PIR — Post-Incident Review) is a **structured analysis** conducted after an incident to:

1. Build a shared, accurate understanding of what happened
2. Identify contributing factors (not just the proximate cause)
3. Generate action items to prevent recurrence
4. Learn and share knowledge across the team

Key artifact: a written document shared with the broader engineering organization.

---

## Blameless postmortem meaning?

A blameless postmortem focuses on **systems and processes**, not individual people. The goal is to understand *why the system allowed* a failure to occur, not to find who made a mistake.

Principles:
- People made the best decisions they could with the information they had at the time
- If an individual "caused" the incident, ask: why did the system allow one person to make this mistake?
- No naming and shaming; psychological safety is essential for honest postmortems
- The goal is learning, not punishment

Origin: Google/Netflix SRE culture. Studies show blame-focused reviews cause people to hide information, which prevents organizations from learning and improving.

---

## What should a good postmortem include?

1. **Incident summary** — One-paragraph overview: what happened, when, and impact
2. **Timeline** — Chronological sequence of events from first symptom to resolution
3. **Root cause analysis** — The technical root cause AND the systemic contributing factors (5 Whys)
4. **User/business impact** — How many users affected? Duration? Revenue impact? SLA breach?
5. **What went well** — What detection, mitigation, or communication worked well?
6. **What went wrong** — What slowed detection, mitigation, or resolution?
7. **Action items** — Specific, assigned, time-bounded tasks to prevent recurrence
8. **Lessons learned** — What does the broader team learn from this?

**Action items must be**: assigned to a specific person, tracked in a ticketing system, and have a deadline. Untracked action items are postmortem theater.

---

## What is incident severity classification?

Already covered in the SEV1-SEV4 table above. Additional considerations:

- Severity should be **declared early** based on observed impact, not speculated cause
- **Downgrade freely** as more information becomes available (SEV2 → SEV3 when scope is narrower than feared)
- **Upgrade if it gets worse** (SEV3 → SEV1 if data corruption is discovered)
- Security incidents often have their own severity track (P0/P1) outside of availability severity

Some orgs add dimensions: `severity` (technical impact) × `priority` (business urgency). A SEV3 during Black Friday might be treated as SEV1 priority.

---

## How do you communicate during outages?

1. **Dedicated incident channel** — `#incident-2024-01-15-checkout` or similar. All updates there.
2. **Status page** — External customers see a public status page (Statuspage.io, Atlassian). Update it within 5-10 minutes of declaring an incident.
3. **Regular cadence** — Update every 15-30 minutes even with "still investigating." Silence = anxiety.
4. **Jargon-free for execs** — "The checkout service is not processing payments for ~30% of users since 14:23 UTC. We're investigating and will update in 20 minutes." Not "the pod is crashlooping due to a nil pointer dereference."
5. **Single source of truth** — Don't let updates scatter across Slack, email, Zoom. Channel + status page.
6. **All-clear message** — Explicit resolution notification with: what was fixed, how users are affected now, when the postmortem will be.

---

## What monitoring gaps have caused incidents for you?

Common gaps encountered in practice:

1. **Missing dependency health metrics** — A third-party API degraded silently; we had no metrics on its response time. Users experienced failures for 45 minutes before logs revealed the pattern.
2. **No alerting on traffic drop** — A deployment misconfiguration caused 0 traffic to route to new pods; error rate was 0% (no requests), so no alert fired. Added explicit "traffic_rate < N for 5m" alert.
3. **Alerts only on errors, not latency** — A memory leak caused p99 latency to climb from 200ms to 8s over 2 hours; the error rate stayed at 0% because requests eventually succeeded. Users complained before we knew.
4. **Consumer lag not monitored** — A Kafka consumer fell behind by 500,000 messages silently; discovered when downstream data was hours stale.
5. **No synthetic monitoring** — The status page reported green while authentication was broken; no real-user or synthetic check was testing the login flow end-to-end.

---

## How do you validate alerts before production?

1. **Test in staging** — Inject faults (kill pods, spike CPU, return 500s) and verify the alert fires within expected time.
2. **Dead man's switch** — A "heartbeat" alert that fires if monitoring data STOPS being received. Validates the monitoring pipeline itself.
3. **Alert unit tests** — Write PromQL unit tests for complex alert expressions:
   ```yaml
   # prometheus rule test
   evaluation_interval: 1m
   tests:
     - name: HighErrorRateAlert
       input_series:
         - series: 'http_errors_total{job="api"}'
           values: '0 0 0 10 10 10 10 10 10'
       alert_rule_test:
         - eval_time: 7m
           alertname: HighErrorRate
           exp_alerts:
             - exp_labels: {job: "api", severity: "critical"}
   ```
4. **Shadow alerts** — Run the alert in "no-op" mode (logs but doesn't page) for a week before enabling paging. Review false positive rate.
5. **Chaos engineering** — Deliberately cause failure scenarios (GameDay, Netflix's Chaos Monkey). Verify monitoring catches it within SLA.

---

## What is synthetic monitoring?

Synthetic monitoring is **proactive, scripted testing** of your system from the outside, simulating real user behavior, on a schedule — regardless of whether real users are present.

Types:
1. **Uptime checks** — Simple HTTP GET to a health endpoint every 60 seconds. Did it return 200?
2. **API tests** — Scripted API calls: POST a test order, verify it's created, clean it up.
3. **Browser tests** — Simulate a full user journey in a headless browser: login → search → add to cart → checkout.
4. **Multi-region probes** — Run checks from AWS us-east-1, eu-west-1, ap-southeast-1 to detect regional issues.

Tools: Datadog Synthetics, Grafana Cloud Synthetic Monitoring, Checkly, Pingdom, AWS CloudWatch Synthetics.

Benefits:
- Detects issues before real users do
- Works at 0 real traffic (off-hours, new deployments)
- Tests full user journeys, not just infrastructure health
- Provides external perspective (CDN issues, DNS failures visible to real users but not internal monitoring)

---

*End of Observability Interview Guide*

---

> **Study tip**: For each section, practice explaining the concept out loud in 2 minutes, then drill down on details. Interviewers often start broad ("what is observability?") then probe deep ("how does tail sampling work in the OTel Collector?").


# Enterprise Observability Design: Complete Reference Architecture

> A comprehensive guide to designing, building, and operating observability platforms for large-scale distributed systems handling millions of requests per minute.

---

## Table of Contents

1. [Observability for Large-Scale Microservice Architecture](#1-observability-for-large-scale-microservice-architecture)
2. [Centralized Logging for Thousands of Services Across Multiple Kubernetes Clusters and Regions](#2-centralized-logging-for-thousands-of-services-across-multiple-kubernetes-clusters-and-regions)
3. [Distributed Tracing for Event-Driven Architecture Using Kafka/SQS at Enterprise Scale](#3-distributed-tracing-for-event-driven-architecture-using-kafkasqs-at-enterprise-scale)
4. [Scaling Prometheus for Thousands of Nodes, Containers, and High-Cardinality Metrics](#4-scaling-prometheus-for-thousands-of-nodes-containers-and-high-cardinality-metrics)
5. [Telemetry Pipeline Using OpenTelemetry for Logs, Metrics, and Traces at Massive Scale](#5-telemetry-pipeline-using-opentelemetry-for-logs-metrics-and-traces-at-massive-scale)
6. [Observability for Multi-Region Globally Distributed Platform with Failover and DR](#6-observability-for-multi-region-globally-distributed-platform-with-failover-and-dr)
7. [Reducing Observability Costs While Maintaining Production Visibility](#7-reducing-observability-costs-while-maintaining-production-visibility)
8. [Monitoring and Alerting for High-Scale Kubernetes Platform](#8-monitoring-and-alerting-for-high-scale-kubernetes-platform)
9. [Detecting and Debugging Cascading Failures Across Hundreds of Microservices](#9-detecting-and-debugging-cascading-failures-across-hundreds-of-microservices)
10. [Complete Observability Platform: Grafana, Loki, Prometheus, and Distributed Tracing](#10-complete-observability-platform-grafana-loki-prometheus-and-distributed-tracing)

---

## 1. Observability for Large-Scale Microservice Architecture

### 1.1 The Three Pillars — Unified Model

Observability is not merely monitoring. For a system processing millions of requests per minute across hundreds of microservices, observability is the capacity to ask arbitrary questions about the system's internal state from its external outputs — without needing to redeploy or modify code.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    THE OBSERVABILITY TRIAD                              │
│                                                                         │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│   │    METRICS   │    │    TRACES    │    │     LOGS     │             │
│   │              │    │              │    │              │             │
│   │ Aggregated   │    │ Request-     │    │ Discrete     │             │
│   │ numerical    │◄──►│ scoped       │◄──►│ event        │             │
│   │ time-series  │    │ execution    │    │ records      │             │
│   │              │    │ paths        │    │              │             │
│   │ "How many?"  │    │ "Where did   │    │ "What        │             │
│   │ "How fast?"  │    │ it go?"      │    │ happened?"   │             │
│   │ "How much?"  │    │ "How long?"  │    │ "Why?"       │             │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘             │
│          │                   │                   │                     │
│          └───────────────────┼───────────────────┘                     │
│                              ▼                                         │
│                  ┌───────────────────────┐                             │
│                  │   CORRELATION LAYER   │                             │
│                  │  trace_id / span_id   │                             │
│                  │  exemplars / linking  │                             │
│                  └───────────────────────┘                             │
│                              │                                         │
│                              ▼                                         │
│                  ┌───────────────────────┐                             │
│                  │   CONTEXT: EVENTS     │                             │
│                  │  (4th pillar emerging)│                             │
│                  │  Deployments, config  │                             │
│                  │  changes, incidents   │                             │
│                  └───────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Request Lifecycle Observability Flow

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         REQUEST LIFECYCLE WITH OBSERVABILITY                     │
│                                                                                  │
│  CLIENT                                                                          │
│    │                                                                             │
│    │  HTTP/gRPC Request                                                          │
│    ▼                                                                             │
│  ┌─────────────────┐                                                             │
│  │   API Gateway   │──── Trace Start ──────────────────────────────────────┐    │
│  │  (Envoy/Nginx)  │     trace_id: abc123                                  │    │
│  │                 │──── Log: {trace_id, method, path, client_ip, ts}      │    │
│  │                 │──── Metric: http_requests_total{method,path,status}   │    │
│  └────────┬────────┘                                                       │    │
│           │ propagates trace context (W3C TraceContext headers)            │    │
│           ▼                                                                │    │
│  ┌─────────────────┐                                                       │    │
│  │  Auth Service   │──── Span: auth.validate ──────────────────────────┐  │    │
│  │                 │     parent_id: gateway_span                        │  │    │
│  │                 │──── Log: {trace_id, span_id, user_id, policy}      │  │    │
│  │                 │──── Metric: auth_latency_histogram{...}            │  │    │
│  └────────┬────────┘                                                    │  │    │
│           │                                                             │  │    │
│           ▼                                                             │  │    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────────┐     │  │    │
│  │ Order Service   │  │  Inventory Svc  │  │  Pricing Service   │     │  │    │
│  │                 │  │                 │  │                     │     │  │    │
│  │ Span: order.*   │  │ Span: inv.*     │  │  Span: price.*     │     │  │    │
│  │ (parallel calls)│  │                 │  │                     │     │  │    │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬─────────┘     │  │    │
│           │                   │                        │               │  │    │
│           └───────────────────┴────────────────────────┘               │  │    │
│                               │                                        │  │    │
│                               ▼                                        │  │    │
│                    ┌─────────────────────┐                             │  │    │
│                    │   Database Layer    │                             │  │    │
│                    │  (Postgres/Redis)   │                             │  │    │
│                    │                     │                             │  │    │
│                    │  Span: db.query     │                             │  │    │
│                    │  db.statement (tag) │                             │  │    │
│                    │  db.rows_returned   │                             │  │    │
│                    └─────────────────────┘                             │  │    │
│                                                                        │  │    │
│                    Trace complete ◄────────────────────────────────────┘  │    │
│                    Root span closes ◄─────────────────────────────────────┘    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Observability Platform Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                     PRODUCTION SERVICES LAYER (hundreds of services)             │
│                                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│  │Svc A   │ │Svc B   │ │Svc C   │ │Svc D   │ │Svc E   │ │Svc ... │            │
│  │OTel SDK│ │OTel SDK│ │OTel SDK│ │OTel SDK│ │OTel SDK│ │OTel SDK│            │
│  └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘            │
│       └──────────┴──────────┴──────┬───┴──────────┴──────────┘                 │
└────────────────────────────────────┼────────────────────────────────────────────┘
                                     │ OTLP (gRPC/HTTP)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          COLLECTION & PROCESSING LAYER                           │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    OpenTelemetry Collector Fleet                        │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │    │
│  │  │Agent     │  │Agent     │  │Agent     │  │Agent     │  (per node)    │    │
│  │  │Collector │  │Collector │  │Collector │  │Collector │               │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘               │    │
│  │       └─────────────┴─────────────┴──────┬───────┘                     │    │
│  │                                           ▼                             │    │
│  │                          ┌────────────────────────────┐                 │    │
│  │                          │   Gateway/Aggregator       │                 │    │
│  │                          │   Collectors (stateful)    │                 │    │
│  │                          │   - Tail sampling          │                 │    │
│  │                          │   - Attribute enrichment   │                 │    │
│  │                          │   - PII scrubbing          │                 │    │
│  │                          │   - Rate limiting          │                 │    │
│  │                          └─────────────┬──────────────┘                 │    │
│  └────────────────────────────────────────┼─────────────────────────────────    │
└───────────────────────────────────────────┼────────────────────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│    METRICS BACKEND      │ │    TRACES BACKEND        │ │     LOGS BACKEND        │
│                         │ │                         │ │                         │
│  Thanos / Cortex /      │ │  Tempo / Jaeger /        │ │  Loki / Elasticsearch / │
│  Victoria Metrics       │ │  Zipkin                  │ │  OpenSearch             │
│                         │ │                         │ │                         │
│  - Long-term storage    │ │  - Trace index           │ │  - Log index            │
│  - Global query         │ │  - Span storage          │ │  - Full-text search     │
│  - Downsampling         │ │  - Dependency graph      │ │  - Label queries        │
└──────────┬──────────────┘ └──────────┬──────────────┘ └──────────┬──────────────┘
           └─────────────────────────── ┴ ─────────────────────────┘
                                        │
                                        ▼
                          ┌─────────────────────────┐
                          │   VISUALIZATION LAYER    │
                          │       Grafana            │
                          │  - Unified dashboards    │
                          │  - Cross-signal linking  │
                          │  - Alert management      │
                          └─────────────────────────┘
```

### 1.4 Key Observability Principles at Scale

#### Signal-to-Noise Ratio
At millions of requests/minute, raw data volume becomes the enemy. Effective observability requires:

- **Sampling strategies**: Head-based (fast, cheap) vs. tail-based (smart, keeps interesting traces)
- **Cardinality discipline**: Every unique label combination creates a new time series; unbounded labels (user_id, IP addresses) cause cardinality explosions
- **Structured logging**: JSON-only logs with consistent schema; free-text logs are unsearchable at scale
- **Exemplars**: Attach sample trace IDs to histogram buckets — bridge metrics to traces without full trace volume

#### RED Method (Services)
For every microservice, instrument:
- **Rate**: Requests per second (throughput)
- **Errors**: Error rate (% of failed requests)
- **Duration**: Latency distribution (p50, p95, p99, p999)

#### USE Method (Infrastructure)
For every resource:
- **Utilization**: % time the resource is busy
- **Saturation**: How much work is queued/waiting
- **Errors**: Error events

#### Four Golden Signals (Google SRE)
- **Latency**: Time to serve a request (distinguish successful vs. failed)
- **Traffic**: Demand on the system
- **Errors**: Rate of failing requests
- **Saturation**: How "full" the service is

---

## 2. Centralized Logging for Thousands of Services Across Multiple Kubernetes Clusters and Regions

### 2.1 Architecture Overview

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                          MULTI-REGION LOG ARCHITECTURE                        │
│                                                                               │
│  REGION: us-east-1                    REGION: eu-west-1                       │
│  ┌──────────────────────────┐         ┌──────────────────────────┐            │
│  │  K8s Cluster A  K8s B   │         │  K8s Cluster C  K8s D   │            │
│  │  ┌──────────┐ ┌────────┐│         │  ┌──────────┐ ┌────────┐ │            │
│  │  │DaemonSet │ │DaemonSet││         │  │DaemonSet │ │DaemonSet│ │            │
│  │  │Fluent Bit│ │Fluent B ││         │  │Fluent Bit│ │Fluent B │ │            │
│  │  └────┬─────┘ └───┬────┘│         │  └────┬─────┘ └───┬────┘ │            │
│  │       └───────────┘     │         │       └───────────┘      │            │
│  │           │             │         │           │              │            │
│  │           ▼             │         │           ▼              │            │
│  │  ┌─────────────────────┐│         │  ┌─────────────────────┐ │            │
│  │  │  Regional Kafka     ││         │  │  Regional Kafka     │ │            │
│  │  │  (log-ingest topic) ││         │  │  (log-ingest topic) │ │            │
│  │  └──────────┬──────────┘│         │  └──────────┬──────────┘ │            │
│  │             │           │         │             │            │            │
│  │             ▼           │         │             ▼            │            │
│  │  ┌──────────────────┐   │         │  ┌──────────────────┐    │            │
│  │  │ Log Processors   │   │         │  │ Log Processors   │    │            │
│  │  │ (Logstash/Vector)│   │         │  │ (Logstash/Vector)│    │            │
│  │  │ - Parse/enrich   │   │         │  │ - Parse/enrich   │    │            │
│  │  │ - PII mask       │   │         │  │ - PII mask       │    │            │
│  │  │ - Dedup          │   │         │  │ - Dedup          │    │            │
│  │  └──────────┬───────┘   │         │  └──────────┬───────┘    │            │
│  └─────────────┼───────────┘         └─────────────┼────────────┘            │
│                │                                   │                          │
│                └──────────────┬────────────────────┘                          │
│                               │  Cross-region replication                     │
│                               ▼                                               │
│          ┌────────────────────────────────────────────┐                       │
│          │           GLOBAL AGGREGATION TIER           │                       │
│          │                                            │                       │
│          │  ┌──────────────────────────────────────┐  │                       │
│          │  │           Apache Kafka               │  │                       │
│          │  │  (global-logs-enriched topic)        │  │                       │
│          │  │  - Partitioned by service/cluster    │  │                       │
│          │  │  - 7-day retention                   │  │                       │
│          │  └──────────────┬───────────────────────┘  │                       │
│          │                 │                          │                       │
│          │    ┌────────────┴──────────────┐           │                       │
│          │    ▼                           ▼           │                       │
│          │  ┌──────────────┐  ┌──────────────────┐   │                       │
│          │  │  Hot Tier    │  │  Cold/Archive    │   │                       │
│          │  │  (Loki /     │  │  (S3/GCS +       │   │                       │
│          │  │  OpenSearch) │  │  Athena/BigQuery) │   │                       │
│          │  │  1-30 days   │  │  1-7 years       │   │                       │
│          │  └──────────────┘  └──────────────────┘   │                       │
│          └────────────────────────────────────────────┘                       │
└───────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Log Collection: Fluent Bit DaemonSet Architecture

Every node in every Kubernetes cluster runs a Fluent Bit DaemonSet pod. This is the log collection agent.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES NODE                                   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Application Pods                                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│  │  │ order-svc    │  │ payment-svc  │  │ notif-svc    │       │   │
│  │  │ stdout/stderr│  │ stdout/stderr│  │ stdout/stderr│       │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │   │
│  └─────────┼─────────────────┼─────────────────┼───────────────┘   │
│            │                 │                 │                    │
│            ▼ Container runtime writes to host filesystem            │
│  /var/log/containers/                                               │
│  ├── order-svc-xxx.log                                              │
│  ├── payment-svc-xxx.log                                            │
│  └── notif-svc-xxx.log                                              │
│            │                                                        │
│            ▼ inotify/tail                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  FLUENT BIT (DaemonSet)                     │    │
│  │                                                             │    │
│  │  INPUT: tail plugin                                         │    │
│  │  ├── Path: /var/log/containers/*.log                        │    │
│  │  ├── Tag: kube.<namespace>.<pod>.<container>                │    │
│  │  └── DB: /var/fluent-bit/state.db  (offset tracking)       │    │
│  │                                                             │    │
│  │  FILTER: kubernetes plugin                                  │    │
│  │  ├── Merge_Log: On (parse nested JSON)                      │    │
│  │  ├── K8S-Logging.Parser: On                                 │    │
│  │  ├── Enrich with: pod_name, namespace, labels, annotations  │    │
│  │  └── Add: cluster_name, region, environment                 │    │
│  │                                                             │    │
│  │  FILTER: lua (custom processing)                            │    │
│  │  ├── PII masking (email, SSN, credit card regex)            │    │
│  │  ├── Drop debug logs in prod (level == "debug" → drop)      │    │
│  │  └── Normalize log levels                                   │    │
│  │                                                             │    │
│  │  FILTER: record_modifier                                    │    │
│  │  └── Add: fluent_bit_version, host_ip, ingested_at          │    │
│  │                                                             │    │
│  │  OUTPUT: kafka plugin                                       │    │
│  │  ├── Brokers: kafka-log-ingest.us-east-1:9092              │    │
│  │  ├── Topic: logs.raw.${namespace}                           │    │
│  │  ├── rdkafka.compression.codec: snappy                      │    │
│  │  ├── rdkafka.batch.num.messages: 10000                      │    │
│  │  └── rdkafka.queue.buffering.max.ms: 1000                   │    │
│  │                                                             │    │
│  │  OUTPUT: (fallback) forward plugin → local buffer           │    │
│  │  └── Filesystem buffer for Kafka unavailability             │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Log Schema: Canonical Log Format

Enforce a canonical log schema across all services. This is critical for aggregation and search:

```json
{
  "timestamp": "2024-01-15T10:23:45.123456Z",
  "level": "INFO",
  "service": "order-service",
  "version": "v2.3.1",
  "environment": "production",
  "region": "us-east-1",
  "cluster": "prod-k8s-east-01",
  "namespace": "orders",
  "pod": "order-service-7d8f9b-xkzp2",
  "node": "ip-10-0-1-42.ec2.internal",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "message": "Order created successfully",
  "fields": {
    "order_id": "ord-12345",
    "customer_id": "cust-67890",
    "total_amount": 99.99,
    "currency": "USD",
    "item_count": 3,
    "duration_ms": 45
  },
  "http": {
    "method": "POST",
    "path": "/api/v1/orders",
    "status": 201,
    "request_id": "req-abc123",
    "user_agent": "Mozilla/5.0...",
    "remote_addr": "10.0.2.100"
  },
  "error": null
}
```

### 2.4 Loki Architecture for Kubernetes-Native Log Storage

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LOKI CLUSTER ARCHITECTURE                       │
│                                                                        │
│  WRITE PATH                              READ PATH                     │
│                                                                        │
│  Fluent Bit / Promtail                   Grafana / LogQL Queries       │
│         │                                         │                    │
│         ▼                                         ▼                    │
│  ┌─────────────────┐                    ┌─────────────────┐            │
│  │   Distributor   │                    │    Query        │            │
│  │  (hash ring)    │                    │    Frontend     │            │
│  │  - Validate     │                    │  - Query split  │            │
│  │  - Rate limit   │                    │  - Caching      │            │
│  │  - Route        │                    │  - Retry        │            │
│  └────────┬────────┘                    └────────┬────────┘            │
│           │  (consistent hash by stream)          │                    │
│           ▼                                       ▼                    │
│  ┌─────────────────────────────────────────────────────┐               │
│  │                  INGESTER RING                      │               │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │               │
│  │  │Ingester 1│  │Ingester 2│  │Ingester 3│  ...     │               │
│  │  │          │  │          │  │          │          │               │
│  │  │In-memory │  │In-memory │  │In-memory │          │               │
│  │  │WAL       │  │WAL       │  │WAL       │          │               │
│  │  │chunks    │  │chunks    │  │chunks    │          │               │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘          │               │
│  └───────┼─────────────┼─────────────┼────────────────┘               │
│          │             │             │                                 │
│          ▼             ▼             ▼   (flush on size/time)         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                      OBJECT STORE (S3)                         │   │
│  │                                                                │   │
│  │  Chunks:       s3://loki-chunks/tenant/date/stream_hash/chunk  │   │
│  │  Index:        ┌────────────────────────────────────────────┐  │   │
│  │                │  BoltDB Shipper / TSDBIndex                 │  │   │
│  │                │  label_name → label_value → [chunk refs]   │  │   │
│  │                └────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  Compactor: merges small chunks, applies retention             │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  QUERIER (stateless, auto-scale):                                      │
│  - Fetches chunks from S3                                              │
│  - Executes LogQL filter/metric queries                                │
│  - Merges results from ingesters + object store                        │
│                                                                        │
│  RULER:                                                                │
│  - Evaluates LogQL alert rules                                         │
│  - Fires alerts to Alertmanager                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.5 Log Routing and Multi-Tenancy Strategy

```
┌──────────────────────────────────────────────────────────────┐
│              LOG ROUTING DECISION TREE                        │
│                                                              │
│  Incoming Log Event                                          │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────┐                            │
│  │  Is it a security/audit log?│──── YES ──► Security SIEM  │
│  └──────────────┬──────────────┘             (Splunk/Elastic)│
│                 │ NO                                         │
│                 ▼                                            │
│  ┌─────────────────────────────┐                            │
│  │  Level == ERROR or FATAL?   │──── YES ──► Hot tier +     │
│  └──────────────┬──────────────┘             PagerDuty feed │
│                 │ NO                                         │
│                 ▼                                            │
│  ┌─────────────────────────────┐                            │
│  │  Is it a billing event?     │──── YES ──► Data Warehouse  │
│  └──────────────┬──────────────┘             (Snowflake)    │
│                 │ NO                                         │
│                 ▼                                            │
│  ┌─────────────────────────────┐                            │
│  │  Level == DEBUG?            │──── YES ──► Dev/staging    │
│  └──────────────┬──────────────┘             Loki only      │
│                 │ NO                                         │
│                 ▼                                            │
│  Standard INFO/WARN → Loki (hot tier, 30-day retention)     │
│         + async copy → S3 (cold tier, 7-year retention)     │
└──────────────────────────────────────────────────────────────┘
```

### 2.6 Cross-Cluster Log Aggregation with Kafka

```
CLUSTER A (us-east-1)          CLUSTER B (eu-west-1)         CLUSTER C (ap-southeast-1)
┌──────────────────┐           ┌──────────────────┐          ┌──────────────────┐
│ Fluent Bit fleet │           │ Fluent Bit fleet │          │ Fluent Bit fleet │
│        │         │           │        │         │          │        │         │
│        ▼         │           │        ▼         │          │        ▼         │
│ Kafka (regional) │           │ Kafka (regional) │          │ Kafka (regional) │
│  topic: logs.*   │           │  topic: logs.*   │          │  topic: logs.*   │
└────────┬─────────┘           └────────┬─────────┘          └────────┬─────────┘
         │                              │                              │
         │ MirrorMaker2 / Kafka         │ replication                 │
         │ Connect replication          │                              │
         └──────────────────────────────┼──────────────────────────────┘
                                        │
                                        ▼
                          ┌─────────────────────────────┐
                          │   GLOBAL KAFKA CLUSTER      │
                          │                             │
                          │  Topics:                    │
                          │  logs.global.info           │
                          │  logs.global.error          │
                          │  logs.global.audit          │
                          │  logs.global.security       │
                          │                             │
                          │  Partitioning:              │
                          │  hash(service_name)         │
                          │  → co-locate same service   │
                          │    logs on same partition   │
                          └──────────────┬──────────────┘
                                         │
                          ┌──────────────┴──────────────┐
                          ▼                             ▼
                  ┌──────────────┐             ┌──────────────┐
                  │   Loki       │             │ S3 + Athena  │
                  │  (hot tier)  │             │  (cold tier) │
                  │  <30 days    │             │  1-7 years   │
                  └──────────────┘             └──────────────┘
```

### 2.7 Retention, Tiering, and Cost Strategy

| Tier | Storage | Retention | Access Pattern | Cost/GB | Use Case |
|------|---------|-----------|---------------|---------|----------|
| Hot | Loki (S3 + index) | 7-30 days | Sub-second | $$$ | Active debugging, alerting |
| Warm | Loki compacted | 30-90 days | Seconds | $$ | Incident retrospectives |
| Cold | S3 + Athena | 90 days - 2 years | Minutes | $ | Compliance, trend analysis |
| Archive | S3 Glacier | 2-7 years | Hours | ¢ | Legal, audit requirements |

---

## 3. Distributed Tracing for Event-Driven Architecture Using Kafka/SQS at Enterprise Scale

### 3.1 The Challenge: Async Trace Propagation

In synchronous HTTP systems, trace context propagates via request headers. In event-driven systems (Kafka, SQS, SNS, RabbitMQ), context must propagate through **message metadata** — headers or message attributes. The challenge is maintaining a continuous trace across asynchronous boundaries where producers and consumers may run minutes or hours apart.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│              TRACE PROPAGATION IN EVENT-DRIVEN SYSTEMS                        │
│                                                                               │
│  SYNCHRONOUS (easy — headers propagate automatically)                         │
│                                                                               │
│  Service A ──HTTP──► Service B ──HTTP──► Service C                            │
│  trace_id=xyz        trace_id=xyz         trace_id=xyz                        │
│  span=root           span=child_1         span=child_2                        │
│                                                                               │
│  ASYNCHRONOUS (hard — need explicit context injection/extraction)             │
│                                                                               │
│  Producer              Kafka/SQS              Consumer                        │
│  Service A             Message Queue          Service B                       │
│     │                       │                     │                          │
│     │──PRODUCE──────────────►                     │                          │
│     │  message + headers:                         │                          │
│     │  traceparent: 00-abc-111-01  ←── INJECT     │                          │
│     │  tracestate: vendor=data     ←── HERE       │                          │
│     │                             │               │                          │
│     │                (message     │               │                          │
│     │                 waits       │               │                          │
│     │                 10 min)     │               │                          │
│     │                             │               │                          │
│     │                             │──CONSUME──────►                          │
│     │                             │               │                          │
│     │                             │   EXTRACT ───►│ new child span            │
│     │                             │   trace_id:   │ parent=111               │
│     │                             │   abc          │ trace_id=abc             │
│     │                             │               │                          │
│     │                   This creates a LINKED     │                          │
│     │                   trace, not nested span    │                          │
│                                                                               │
│  KEY: The "gap" between produce and consume is NOT lost                       │
│  → use SpanLinks for async relationships                                      │
│  → use SpanContext propagation for strict parent-child                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Kafka Trace Context Propagation Implementation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KAFKA MESSAGE WITH TRACE CONTEXT                          │
│                                                                             │
│  ProducerRecord {                                                           │
│    topic: "order-events"                                                    │
│    key: "order-12345"                                                       │
│    value: { "event": "OrderCreated", "orderId": "12345", ... }             │
│    headers: [                                                               │
│      { key: "traceparent",                                                  │
│        value: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01" }, │
│      { key: "tracestate",                                                   │
│        value: "rojo=00f067aa0ba902b7,congo=t61rcWkgMzE" },                 │
│      { key: "baggage",                                                      │
│        value: "userId=alice,serverNode=DF28,isProduction=true" },           │
│      { key: "x-b3-traceid",    value: "..." },   ← B3 format fallback      │
│      { key: "x-b3-spanid",     value: "..." },                             │
│      { key: "x-b3-sampled",    value: "1" }                                │
│    ]                                                                        │
│  }                                                                          │
│                                                                             │
│  W3C TraceContext header format:                                            │
│  traceparent: {version}-{trace_id}-{parent_span_id}-{flags}                │
│               00       -4bf92f..  -00f067..        -01 (sampled)           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 End-to-End Distributed Trace Across Kafka Pipeline

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                 COMPLETE EVENT-DRIVEN TRACE FLOW                                  │
│                                                                                   │
│  t=0ms                                                                            │
│  ┌──────────────────┐                                                             │
│  │  API Gateway     │ Span: api.gateway.request                                   │
│  │  trace_id: T1    │ {trace_id:T1, span_id:S1, parent:none}                     │
│  └────────┬─────────┘                                                             │
│           │ HTTP                                                                  │
│           ▼                                                                       │
│  ┌──────────────────┐                                                             │
│  │  Order Service   │ Span: order.create                                          │
│  │  trace_id: T1    │ {trace_id:T1, span_id:S2, parent:S1}                       │
│  │                  │                                                             │
│  │  [PRODUCE EVENT] │──────────────────────────────────────────────────────────► │
│  │  Inject T1,S2    │  Kafka: order-events topic                                 │
│  │  into headers    │  Message header: traceparent=00-T1-S2-01                   │
│  └────────┬─────────┘                                                             │
│           │                         │                                             │
│  t=50ms   │                         │ (async gap — could be seconds/minutes)     │
│           │                         │                                             │
│           │                         ▼                                             │
│           │              ┌──────────────────────────────────────┐                │
│           │              │  Inventory Consumer Service          │                │
│           │              │                                      │                │
│           │              │  Span: inventory.reserve             │                │
│           │              │  - Extract T1, S2 from headers       │                │
│           │              │  - Create CHILD SPAN of S2           │                │
│           │              │  {trace_id:T1, span_id:S3, parent:S2}│               │
│           │              │                                      │                │
│           │              │  [PRODUCE TO NEXT TOPIC]             │                │
│           │              │  warehouse-commands topic            │                │
│           │              │  header: traceparent=00-T1-S3-01     │                │
│           │              └─────────────────────────────────────┘                 │
│           │                                       │                              │
│           │                                       ▼                              │
│           │              ┌────────────────────────────────────────┐              │
│           │              │  Warehouse Service                     │              │
│           │              │  Span: warehouse.fulfill               │              │
│           │              │  {trace_id:T1, span_id:S4, parent:S3}  │              │
│           │              └────────────────────────────────────────┘              │
│           │                                                                       │
│           ▼                                                                       │
│  RESULTING TRACE TREE:                                                            │
│  T1                                                                               │
│  └── S1: api.gateway.request         [0ms → 200ms]                               │
│      └── S2: order.create            [5ms → 45ms]                                │
│          └── S3: inventory.reserve   [async: 50ms → 120ms]                       │
│              └── S4: warehouse.fulfill [async: 200ms → 450ms]                    │
│                                                                                   │
│  NOTE: "async gaps" shown as timing discontinuity in trace view                   │
│  Total E2E "business transaction" latency visible across the full chain           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Span Links for Fan-out / Fan-in Patterns

```
┌──────────────────────────────────────────────────────────────────┐
│              FAN-OUT TRACE PATTERN (SQS/SNS Fanout)              │
│                                                                  │
│  Source Event (trace_id: T1)                                     │
│         │                                                        │
│         │ SNS publishes to 3 SQS queues                          │
│         │                                                        │
│    ┌────┴──────────────────────────────────┐                     │
│    ▼              ▼                        ▼                     │
│  ┌──────────┐ ┌──────────┐          ┌──────────┐                 │
│  │Consumer 1│ │Consumer 2│          │Consumer 3│                 │
│  │trace: T2 │ │trace: T3 │          │trace: T4 │                 │
│  │          │ │          │          │          │                 │
│  │SpanLink: │ │SpanLink: │          │SpanLink: │                 │
│  │ → T1,S_src│ │ → T1,S_src│         │ → T1,S_src│               │
│  └──────────┘ └──────────┘          └──────────┘                 │
│                                                                  │
│  SpanLink = "this trace is causally related to another trace"    │
│  Used when strict parent-child would make traces too wide/deep   │
│  to display or when consuming a batch of messages                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BATCH CONSUMER PATTERN                                  │   │
│  │                                                          │   │
│  │  Kafka batch: [msg1(T1), msg2(T2), msg3(T3)]             │   │
│  │                                                          │   │
│  │  Approach 1: One span per message (high overhead)        │   │
│  │  Approach 2: One span for batch + links to each          │   │
│  │              source trace (recommended at scale)         │   │
│  │                                                          │   │
│  │  Batch Processing Span                                   │   │
│  │  ├── SpanLink → T1 (msg1 origin)                         │   │
│  │  ├── SpanLink → T2 (msg2 origin)                         │   │
│  │  └── SpanLink → T3 (msg3 origin)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 3.5 Sampling Strategy for High-Volume Event Streams

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     TRACE SAMPLING DECISION FLOW                          │
│                                                                           │
│  INCOMING REQUEST / EVENT                                                 │
│           │                                                               │
│           ▼                                                               │
│  ┌───────────────────────────────────────────────────────┐               │
│  │              HEAD-BASED SAMPLING (at entry point)     │               │
│  │                                                       │               │
│  │  Is upstream trace context sampled?                   │               │
│  │  YES → continue sampling (respect decision)           │               │
│  │  NO  → apply local sampling policy:                   │               │
│  │         - Health checks:          0.01% (1/10,000)    │               │
│  │         - High-value endpoints:   10%                 │               │
│  │         - Default:                1%                  │               │
│  │         - Explicitly flagged:     100%                │               │
│  └──────────────────────────┬────────────────────────────┘               │
│                             │                                             │
│                             ▼                                             │
│  ┌───────────────────────────────────────────────────────┐               │
│  │          TAIL-BASED SAMPLING (at collector tier)      │               │
│  │                                                       │               │
│  │  After trace completes, decide to keep based on:      │               │
│  │                                                       │               │
│  │  ALWAYS KEEP:                                         │               │
│  │  ├── Any span has error=true or status=ERROR          │               │
│  │  ├── Total trace duration > p99 threshold             │               │
│  │  ├── Specific operation types (payments, auth)        │               │
│  │  └── Trace contains specific user IDs (VIP debug)     │               │
│  │                                                       │               │
│  │  PROBABILISTIC DROP:                                  │               │
│  │  └── Normal successful traces below latency threshold │               │
│  │      → drop 99% to stay within storage budget         │               │
│  └──────────────────────────┬────────────────────────────┘               │
│                             │                                             │
│                             ▼                                             │
│               ┌─────────────────────────┐                                │
│               │  Trace Backend Storage  │                                │
│               │  (Tempo / Jaeger)       │                                │
│               └─────────────────────────┘                                │
│                                                                           │
│  ESTIMATED VOLUME REDUCTION:                                              │
│  100M events/day × 1% head sample × 10% tail keep = 100K stored traces   │
│  Storage: ~100K traces × 50KB avg = ~5GB/day (manageable)                │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.6 SQS-Specific Tracing Considerations

SQS has unique constraints:
- Message attribute limit: 10 user-defined attributes
- Must compress trace context into minimal attributes
- Dead-letter queue traces must link back to original queue trace

```
SQS Message Attributes for Tracing:
{
  "traceparent": {
    "DataType": "String",
    "StringValue": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"
  },
  "tracestate": {
    "DataType": "String",
    "StringValue": "svc=order-producer"
  }
}
```

DLQ trace linkage pattern:
```
Original Queue Processing Span
  └── FAILED (moved to DLQ)
       │
       ▼
DLQ Processing Span
  └── SpanLink → original failed span
      Attribute: dlq.original_queue = "order-events"
      Attribute: dlq.receive_count = 3
      Attribute: dlq.first_failure_time = "..."
```

---

## 4. Scaling Prometheus for Thousands of Nodes, Containers, and High-Cardinality Metrics

### 4.1 Prometheus Scalability Limits

A single Prometheus instance begins to strain at:
- ~10M active time series
- ~1M samples/second ingestion rate
- ~1TB local storage (performance degrades)
- Query latency increases significantly above these thresholds

For thousands of nodes with hundreds of metrics each, plus high-cardinality application metrics, you rapidly exceed these limits. The solution is a **federated, sharded architecture**.

### 4.2 Prometheus Federation Hierarchy

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     PROMETHEUS FEDERATION ARCHITECTURE                      │
│                                                                             │
│  LEAF LAYER (per K8s cluster or datacenter zone)                           │
│                                                                             │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐          │
│  │      Cluster A              │  │      Cluster B              │          │
│  │                             │  │                             │          │
│  │  Prom Shard 1  Prom Shard 2 │  │  Prom Shard 3  Prom Shard 4 │          │
│  │  (0-500 nodes) (500-1k nodes│  │  (0-500 nodes) (500-1k nodes│         │
│  │       │             │       │  │       │             │       │          │
│  │       └──────┬───────┘       │  │       └──────┬───────┘       │         │
│  │              ▼               │  │              ▼               │         │
│  │  ┌──────────────────────┐    │  │  ┌──────────────────────┐    │         │
│  │  │  Prometheus (local)  │    │  │  │  Prometheus (local)  │    │         │
│  │  │  - Cluster-level     │    │  │  │  - Cluster-level     │    │         │
│  │  │    aggregation rules │    │  │  │    aggregation rules │    │         │
│  │  │  - Short retention   │    │  │  │  - Short retention   │    │         │
│  │  │    (24-48h)          │    │  │  │    (24-48h)          │    │         │
│  │  └──────────────────────┘    │  │  └──────────────────────┘    │         │
│  └─────────────────────────────┘  └─────────────────────────────┘          │
│                   │                              │                           │
│                   └──────────────┬───────────────┘                          │
│                                  │ Federation scrape (pre-aggregated)       │
│                                  ▼                                          │
│  REGIONAL LAYER                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │              Thanos / Cortex Regional Tier                           │  │
│  │                                                                      │  │
│  │  Thanos Sidecar         Thanos Sidecar        Thanos Sidecar         │  │
│  │  (Prom Shard 1) ──────► (Prom Shard 2) ─────► (Prom Shard 3)        │  │
│  │       │                      │                      │               │  │
│  │       └──────────────────────┼──────────────────────┘               │  │
│  │                              │ Upload blocks to object store         │  │
│  │                              ▼                                       │  │
│  │                    ┌──────────────────────┐                          │  │
│  │                    │  Object Store (S3)   │                          │  │
│  │                    │  Thanos blocks        │                         │  │
│  │                    │  Long-term retention  │                         │  │
│  │                    │  2h block compaction  │                         │  │
│  │                    └──────────────────────┘                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                  │                                          │
│                                  ▼                                          │
│  GLOBAL QUERY LAYER                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Thanos Query / Cortex Query                        │  │
│  │                                                                      │  │
│  │  - Fan-out queries to all Thanos Store Gateways + Sidecars           │  │
│  │  - Deduplication (HA Prometheus pairs produce duplicate series)      │  │
│  │  - Merge results from multiple regions                               │  │
│  │  - Long-term metric data from object store                           │  │
│  │  - Caching layer (Memcached/Redis for query results)                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 High-Cardinality Metrics Problem and Solutions

```
┌────────────────────────────────────────────────────────────────────────┐
│              HIGH-CARDINALITY EXPLOSION PROBLEM                         │
│                                                                         │
│  BAD (cardinality explosion):                                           │
│  http_requests_total{method, path, status, user_id, ip_address}        │
│                                                         ↑              │
│  user_id alone = millions of unique values              ↑              │
│  ip_address alone = millions of unique values ──────────┘              │
│                                                                         │
│  Result: 10M series × 10 labels × ~1KB = 10GB RAM just for metadata    │
│                                                                         │
│  GOOD (bounded cardinality):                                            │
│  http_requests_total{method, path, status_class, service, region}      │
│                              ↑         ↑                               │
│                        /api/v1/orders  "2xx"/"4xx"/"5xx"               │
│                        (finite paths)  (bounded)                       │
│                                                                         │
│  RULES FOR LABEL CARDINALITY:                                           │
│  ├── Never use user IDs as labels (use exemplars or logs instead)       │
│  ├── Never use timestamps, UUIDs, or request IDs as labels             │
│  ├── Bucket/normalize high-cardinality values:                          │
│  │    path="/api/v1/orders/12345" → path="/api/v1/orders/{id}"         │
│  ├── Use recording rules to pre-aggregate before storage               │
│  └── Set cardinality limits per series: enforce via Prometheus flags    │
│       --query.max-samples, per-series sample limits                    │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Thanos Architecture Deep Dive

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         THANOS COMPONENT MAP                             │
│                                                                          │
│  ┌──────────────────┐                                                    │
│  │  Prometheus +    │                                                    │
│  │  Thanos Sidecar  │◄── Scrapes targets ─── ServiceMonitors/PodMonitors│
│  │                  │                                                    │
│  │  Sidecar tasks:  │                                                    │
│  │  1. StoreAPI:    │◄── Thanos Querier queries recent data (last 2h)   │
│  │     serve local  │                                                    │
│  │     TSDB blocks  │                                                    │
│  │  2. Shipper:     │──► Upload 2h blocks ──► Object Store (S3)        │
│  │     upload to S3 │                                                    │
│  └──────────────────┘                                                    │
│                                                                          │
│  ┌──────────────────┐                                                    │
│  │  Thanos Store    │◄── Object Store (S3) ──► serves historical data   │
│  │  Gateway         │    Implements StoreAPI                             │
│  │                  │    Caches index/series lookups in memory           │
│  │                  │    Lazy-loads chunk files from S3                  │
│  └──────────────────┘                                                    │
│                                                                          │
│  ┌──────────────────┐                                                    │
│  │  Thanos Querier  │◄── Receives PromQL queries (from Grafana)         │
│  │  (Query)         │    Fans out to all StoreAPI endpoints:             │
│  │                  │    - All Prometheus Sidecars (recent data)         │
│  │                  │    - All Store Gateways (historical data)          │
│  │                  │    - Other Queriers (hierarchical)                 │
│  │                  │    Deduplicates HA Prometheus replicas             │
│  │                  │    Merges partial results                          │
│  └──────────────────┘                                                    │
│                                                                          │
│  ┌──────────────────┐                                                    │
│  │  Thanos Compactor│    Runs as singleton (not in critical path)        │
│  │                  │    Compacts 2h blocks → 24h → 7d → 30d → ...      │
│  │                  │    Applies downsampling:                           │
│  │                  │    - Raw: 5s/15s resolution (0-7 days)             │
│  │                  │    - 5min downsampled (7d-1year)                   │
│  │                  │    - 1hr downsampled (1year+)                      │
│  │                  │    Applies retention deletion                      │
│  └──────────────────┘                                                    │
│                                                                          │
│  ┌──────────────────┐                                                    │
│  │  Thanos Ruler    │    Evaluates Prometheus recording/alerting rules   │
│  │                  │    against global view (cross-cluster rules)       │
│  │                  │    Stores results as new metric series in S3       │
│  └──────────────────┘                                                    │
│                                                                          │
│  ┌──────────────────┐                                                    │
│  │  Thanos Receive  │    (Alternative to sidecar pattern)                │
│  │                  │    Accepts remote_write from Prometheus            │
│  │                  │    Distributes via consistent hash ring            │
│  │                  │    Better for: many short-lived Prom instances     │
│  └──────────────────┘                                                    │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.5 Recording Rules Strategy

Pre-aggregation with recording rules is critical for performance at scale:

```yaml
# BEFORE: slow query (computed at query time)
# sum(rate(http_requests_total{job="api-server"}[5m])) by (service, status_code)
# → Must scan millions of raw series at query time

# AFTER: recording rule (computed every 30s, stored as new series)
groups:
  - name: api_request_rates
    interval: 30s
    rules:
      # Per-service request rate (pre-aggregated)
      - record: job:http_requests_total:rate5m
        expr: sum(rate(http_requests_total[5m])) by (job, status_code, service)
      
      # Error rate ratio
      - record: job:http_error_rate:ratio_rate5m
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (job, service)
          /
          sum(rate(http_requests_total[5m])) by (job, service)
      
      # p99 latency recording
      - record: job:http_request_duration_seconds:p99_rate5m
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (job, service, le)
          )
      
      # Node resource pre-aggregation
      - record: instance:node_cpu_utilisation:rate5m
        expr: |
          1 - avg without (cpu, mode) (
            rate(node_cpu_seconds_total{mode="idle"}[5m])
          )
```

### 4.6 Prometheus Operator and Service Discovery at Scale

```yaml
# ServiceMonitor: auto-discovery for thousands of services
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: microservices-monitor
  labels:
    team: platform
spec:
  selector:
    matchLabels:
      monitoring: "true"          # Auto-include any service with this label
  namespaceSelector:
    any: true                      # Across ALL namespaces
  endpoints:
  - port: metrics
    interval: 30s
    scrapeTimeout: 10s
    path: /metrics
    relabelings:
      # Enrich with K8s metadata
      - sourceLabels: [__meta_kubernetes_pod_label_app]
        targetLabel: service
      - sourceLabels: [__meta_kubernetes_namespace]
        targetLabel: namespace
      - sourceLabels: [__meta_kubernetes_pod_node_name]
        targetLabel: node
    metricRelabelings:
      # Drop high-cardinality metrics we don't need
      - sourceLabels: [__name__]
        regex: "go_gc_.*|process_open_fds"
        action: drop
      # Normalize high-cardinality labels
      - sourceLabels: [path]
        regex: "/api/v[0-9]+/orders/[0-9a-f-]+"
        targetLabel: path
        replacement: "/api/vN/orders/{id}"
```

---

## 5. Telemetry Pipeline Using OpenTelemetry for Logs, Metrics, and Traces at Massive Scale

### 5.1 OpenTelemetry as the Universal Standard

OpenTelemetry (OTel) solves vendor lock-in by providing a single, unified API, SDK, and wire protocol (OTLP) for all three telemetry signals. The architecture is:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    OPENTELEMETRY ARCHITECTURE                                  │
│                                                                               │
│  APPLICATION LAYER                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐       │
│  │  OTel SDK (per language: Java, Go, Python, Node.js, .NET, ...)     │       │
│  │                                                                    │       │
│  │  API Layer                                                         │       │
│  │  ├── Tracer API  → create spans, set attributes                    │       │
│  │  ├── Meter API   → create counters, histograms, gauges             │       │
│  │  └── Logger API  → structured log emission with trace correlation  │       │
│  │                                                                    │       │
│  │  SDK Layer (implementation)                                        │       │
│  │  ├── Trace SDK: SpanProcessor, Sampler, Exporter                  │       │
│  │  ├── Metric SDK: MetricReader, MetricExporter, Views              │       │
│  │  └── Log SDK: LogRecordProcessor, LogRecordExporter               │       │
│  │                                                                    │       │
│  │  Auto-instrumentation: zero-code instrumentation via agents        │       │
│  │  (Java agent, Node.js --require, Python site-packages)            │       │
│  └────────────────────────────────┬───────────────────────────────────┘       │
│                                   │  OTLP/gRPC or OTLP/HTTP                   │
│                                   ▼                                           │
│  COLLECTION LAYER                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐       │
│  │                  OpenTelemetry Collector                           │       │
│  │                                                                    │       │
│  │  RECEIVERS          PROCESSORS              EXPORTERS             │       │
│  │  ┌──────────┐       ┌──────────────────┐    ┌───────────────────┐ │       │
│  │  │otlp      │──────►│memory_limiter    │───►│otlp (to gateway) │ │       │
│  │  │jaeger    │       │batch             │    │prometheus         │ │       │
│  │  │zipkin    │       │resourcedetection │    │loki               │ │       │
│  │  │prometheus│       │k8sattributes     │    │jaeger             │ │       │
│  │  │filelog   │       │filter            │    │kafka              │ │       │
│  │  │hostmetric│       │transform         │    │s3                 │ │       │
│  │  │kubelet   │       │tail_sampling     │    │datadog            │ │       │
│  │  └──────────┘       │spanmetrics       │    │newrelic           │ │       │
│  │                     │servicegraph      │    └───────────────────┘ │       │
│  │                     └──────────────────┘                          │       │
│  └────────────────────────────────────────────────────────────────────┘       │
└───────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 OTel Collector Pipeline Architecture (Enterprise Scale)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                OTEL COLLECTOR DEPLOYMENT TOPOLOGY                            │
│                                                                             │
│  TIER 1: AGENT COLLECTORS (sidecar or DaemonSet per node)                   │
│  ─────────────────────────────────────────────────────────                  │
│  Purpose: Receive local telemetry, do light processing, forward upstream    │
│  Scale: 1 per node (thousands of instances)                                 │
│  Config: Lightweight, minimal CPU/RAM (100m CPU, 128Mi RAM)                 │
│                                                                             │
│  Receivers:  otlp (from app) + filelog (local files) + hostmetrics          │
│  Processors: batch, memory_limiter, k8sattributes (add pod/namespace)       │
│  Exporters:  otlp → Gateway Collectors                                      │
│                                                                             │
│  TIER 2: GATEWAY COLLECTORS (stateful, central per cluster)                 │
│  ─────────────────────────────────────────────────────────                  │
│  Purpose: Expensive processing, routing, tail sampling                      │
│  Scale: 3-20 instances per cluster (horizontally scaled)                   │
│  Config: Resource-heavy (4 CPU, 8Gi RAM)                                    │
│                                                                             │
│  Receivers:  otlp (from agents)                                             │
│  Processors:                                                                │
│  ├── tail_sampling (keeps errors, slow traces)                              │
│  ├── spanmetrics (generate RED metrics FROM traces)                         │
│  ├── servicegraph (generate service topology metrics)                       │
│  ├── transform (normalize attributes, mask PII)                             │
│  ├── filter (drop noisy/unused signals)                                     │
│  ├── resourcedetection (enrich with cloud metadata)                         │
│  └── probabilistic_sampler (final rate limiting)                            │
│  Exporters:                                                                 │
│  ├── otlp → Tempo (traces)                                                  │
│  ├── prometheusremotewrite → Thanos (metrics)                               │
│  └── loki (logs)                                                            │
│                                                                             │
│  TIER 3: GLOBAL ROUTING LAYER (optional, for multi-region)                  │
│  ─────────────────────────────────────────────────────────                  │
│  Kafka as durable buffer between regions                                    │
│  Kafka receiver/exporter in OTel Collector                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Complete OTel Collector Configuration

```yaml
# otel-collector-gateway.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        max_recv_msg_size_mib: 16
      http:
        endpoint: 0.0.0.0:4318

processors:
  # Prevent OOM
  memory_limiter:
    check_interval: 1s
    limit_percentage: 75
    spike_limit_percentage: 25

  # Batch for efficiency
  batch:
    timeout: 1s
    send_batch_size: 1024
    send_batch_max_size: 2048

  # Add K8s metadata
  k8sattributes:
    auth_type: serviceAccount
    passthrough: false
    extract:
      metadata:
        - k8s.pod.name
        - k8s.pod.uid
        - k8s.namespace.name
        - k8s.node.name
        - k8s.pod.start_time
        - k8s.deployment.name
        - k8s.cluster.uid
      labels:
        - tag_name: app.label.version
          key: app.kubernetes.io/version
          from: pod
      annotations:
        - tag_name: app.annotation.team
          key: team
          from: pod

  # Tail-based sampling
  tail_sampling:
    decision_wait: 30s
    num_traces: 100000
    expected_new_traces_per_sec: 10000
    policies:
      # Always keep errors
      - name: error-policy
        type: status_code
        status_code: {status_codes: [ERROR]}
      # Always keep slow traces
      - name: slow-traces
        type: latency
        latency: {threshold_ms: 500}
      # Keep traces for critical services
      - name: critical-services
        type: string_attribute
        string_attribute:
          key: service.name
          values: ["payment-service", "auth-service", "order-service"]
      # Sample 1% of everything else
      - name: base-sampling
        type: probabilistic
        probabilistic: {sampling_percentage: 1}

  # Generate span metrics from traces (RED metrics)
  spanmetrics:
    metrics_exporter: prometheusremotewrite
    latency_histogram_buckets: [5ms, 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2s, 5s]
    dimensions:
      - name: http.method
      - name: http.status_code
      - name: service.name
      - name: service.namespace

  # PII / sensitive data filtering
  transform/redact:
    trace_statements:
      - context: span
        statements:
          - replace_all_patterns(attributes, "value", "\\b[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}\\b", "****-****-****-****")
          - delete_key(attributes, "user.password")
          - delete_key(attributes, "http.request.header.authorization")

  # Resource detection (cloud metadata)
  resourcedetection:
    detectors: [env, aws, gcp, azure, k8s]
    timeout: 2s

exporters:
  # Traces → Grafana Tempo
  otlp/tempo:
    endpoint: tempo.monitoring.svc.cluster.local:4317
    tls:
      insecure: false

  # Metrics → Thanos
  prometheusremotewrite:
    endpoint: "http://thanos-receive.monitoring:10908/api/v1/receive"
    external_labels:
      cluster: "${CLUSTER_NAME}"
      region: "${REGION}"
    queue_config:
      max_samples_per_send: 10000
      batch_send_deadline: 5s
      max_shards: 30

  # Logs → Loki
  loki:
    endpoint: "http://loki.monitoring:3100/loki/api/v1/push"
    labels:
      resource:
        service.name: "service_name"
        k8s.namespace.name: "namespace"
        k8s.pod.name: "pod"
        severity: "level"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, k8sattributes, resourcedetection, transform/redact, tail_sampling, spanmetrics, batch]
      exporters: [otlp/tempo]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, k8sattributes, resourcedetection, batch]
      exporters: [prometheusremotewrite]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, k8sattributes, resourcedetection, transform/redact, batch]
      exporters: [loki]
```

### 5.4 SpanMetrics: Generating RED Metrics from Traces

The `spanmetrics` processor is powerful: it generates Prometheus-compatible RED metrics automatically from trace data, eliminating the need to manually instrument metrics for every service.

```
TRACE DATA (spans):
  span {
    service.name = "order-service"
    http.method = "POST"
    http.route = "/orders"
    http.status_code = "201"
    duration = 45ms
    status = OK
  }

↓ spanmetrics processor

GENERATED METRICS:
  calls_total{
    service_name="order-service",
    span_name="POST /orders",
    status_code="STATUS_CODE_OK",
    http_method="POST"
  } = 1

  duration_milliseconds_bucket{
    service_name="order-service",
    span_name="POST /orders",
    le="50"
  } = 1

  duration_milliseconds_count{...} = 1
  duration_milliseconds_sum{...} = 45
```

---

## 6. Observability for Multi-Region Globally Distributed Platform with Failover and DR

### 6.1 Multi-Region Observability Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    GLOBAL OBSERVABILITY TOPOLOGY                                  │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │  ACTIVE-ACTIVE: us-east-1 (primary)           eu-west-1 (primary)           │ │
│  │                                                                             │ │
│  │  ┌──────────────────────────┐    ┌──────────────────────────┐               │ │
│  │  │  LOCAL OBSERVABILITY     │    │  LOCAL OBSERVABILITY     │               │ │
│  │  │                          │    │                          │               │ │
│  │  │  • Prometheus (HA pair)  │    │  • Prometheus (HA pair)  │               │ │
│  │  │  • Loki (3-node ring)    │    │  • Loki (3-node ring)    │               │ │
│  │  │  • Tempo (S3-backed)     │    │  • Tempo (S3-backed)     │               │ │
│  │  │  • Alertmanager          │    │  • Alertmanager          │               │ │
│  │  │  • Grafana (read-only)   │    │  • Grafana (read-only)   │               │ │
│  │  │                          │    │                          │               │ │
│  │  │  Region can operate      │    │  Region can operate      │               │ │
│  │  │  independently if        │    │  independently if        │               │ │
│  │  │  global tier fails       │    │  global tier fails       │               │ │
│  │  └──────────┬───────────────┘    └──────────┬───────────────┘               │ │
│  └─────────────┼─────────────────────────────────┼─────────────────────────────┘ │
│                │  Cross-region replication        │                               │
│                │  (async, non-critical path)      │                               │
│                └────────────────┬─────────────────┘                               │
│                                 │                                                 │
│                                 ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                    GLOBAL CONTROL PLANE                                     │ │
│  │                    (us-east-1, replicated to eu-west-1 standby)             │ │
│  │                                                                             │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────────────┐  │ │
│  │  │ Thanos Query   │  │ Global Grafana │  │ Global Alertmanager          │  │ │
│  │  │ Frontend       │  │ (R/W, primary) │  │ (HA cluster, dedup)          │  │ │
│  │  │                │  │                │  │                              │  │ │
│  │  │ Queries ALL    │  │ All dashboards │  │ Deduplicates alerts from     │  │ │
│  │  │ regions' data  │  │ Multi-region   │  │ all regions                  │  │ │
│  │  │ simultaneously │  │ views          │  │ Routes to PagerDuty/Slack    │  │ │
│  │  └────────────────┘  └────────────────┘  └──────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Alertmanager HA and Deduplication

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                   ALERTMANAGER HIGH AVAILABILITY                              │
│                                                                              │
│  Region A                         Region B                                  │
│  ┌────────────────────────────┐   ┌────────────────────────────┐            │
│  │ Alertmanager A1            │   │ Alertmanager B1            │            │
│  │ Prometheus A sends alerts  │   │ Prometheus B sends alerts  │            │
│  │                            │◄──►                            │            │
│  │ Gossip protocol (mesh)     │   │ Gossip: share state        │            │
│  └────────────────────────────┘   └────────────────────────────┘            │
│              │                                 │                            │
│              │ Both send same alert            │                            │
│              │ Gossip deduplicates             │                            │
│              └────────────────┬────────────────┘                            │
│                               │ ONE notification (deduplicated)             │
│                               ▼                                             │
│                    ┌───────────────────────┐                                │
│                    │  PagerDuty / Slack    │                                │
│                    │  OpsGenie             │                                │
│                    └───────────────────────┘                                │
│                                                                              │
│  ALERTMANAGER CONFIG FOR CROSS-REGION:                                       │
│  alertmanager.yml:                                                           │
│    cluster:                                                                  │
│      listen-address: "0.0.0.0:9094"                                         │
│      peers:                                                                  │
│        - "alertmanager-b1.eu-west-1:9094"  # cross-region peer              │
│        - "alertmanager-a2.us-east-1:9094"  # same-region HA peer            │
│      gossip-interval: 200ms                                                  │
│      push-pull-interval: 60s                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Observability Failover Runbook

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  OBSERVABILITY FAILOVER SCENARIOS                            │
│                                                                             │
│  SCENARIO 1: Global Query Layer Unavailable                                 │
│  ─────────────────────────────────────────────                              │
│  Impact: Cross-region dashboards unavailable                                │
│  NOT impacted: Regional alerts still fire, local dashboards work            │
│  Recovery:                                                                  │
│  1. Regional Grafana instances switch to local data sources                 │
│  2. Engineers use per-region dashboards during outage                       │
│  3. Global Grafana fails over to standby region                             │
│  SLO impact: None (local observability fully functional)                    │
│                                                                             │
│  SCENARIO 2: Loki Region Failure                                            │
│  ──────────────────────────────────                                         │
│  Impact: Log queries for affected region fail                               │
│  Recovery:                                                                  │
│  1. Log tail buffered in Fluent Bit (disk buffer)                          │
│  2. Replay from Kafka (7-day retention) to standby Loki                    │
│  3. Historical logs replayed from S3 if needed                             │
│  Recovery time: < 30 minutes for recent logs                               │
│                                                                             │
│  SCENARIO 3: Prometheus Cluster Failure                                     │
│  ─────────────────────────────────────                                      │
│  Impact: Real-time metrics missing for region                               │
│  Recovery:                                                                  │
│  1. HA Prometheus pair: second instance takes over immediately              │
│  2. Thanos Receive provides remote_write endpoint as backup                 │
│  3. Historical metrics available from S3 via Store Gateway                 │
│  Recovery time: < 1 minute (HA pair), < 5 minutes (full restart)           │
│                                                                             │
│  SCENARIO 4: OTel Collector Fleet Failure                                   │
│  ─────────────────────────────────────────                                  │
│  Impact: Telemetry pipeline disrupted                                       │
│  Recovery:                                                                  │
│  1. SDK-side buffering kicks in (configurable retry + queue)                │
│  2. Collectors restart (K8s DaemonSet guarantees re-scheduling)             │
│  3. Buffered data replays on reconnect (bounded by buffer size)             │
│  SDK retry config: max_queue_size=10000, export_timeout=30s, retry=5       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Cross-Region SLO Tracking

```
GLOBAL SLO DASHBOARD ARCHITECTURE:

Global Error Budget Calculation:
─────────────────────────────────
# Query across all regions using Thanos global view
# This PromQL runs against Thanos Query which fans out to us-east-1 + eu-west-1

sum(rate(http_requests_total{status_code!~"5.."}[30d]))
  by (service)
/
sum(rate(http_requests_total[30d]))
  by (service)

Multi-window, multi-burn-rate alerting (Google SRE Workbook):
─────────────────────────────────────────────────────────────

SLO: 99.9% availability (error budget: 0.1% = 43.8 min/month)

Alert rules:
  Critical (page immediately):
    Condition: 14.4x burn rate over 1h AND 14.4x burn rate over 5m
    Impact: Exhausts 2% budget in 1 hour
    
  High (page):
    Condition: 6x burn rate over 6h AND 6x burn rate over 30m
    Impact: Exhausts 5% budget in 6 hours
    
  Medium (ticket):
    Condition: 3x burn rate over 3d AND 3x burn rate over 6h
    Impact: Slow budget burn
    
  Low (inform):
    Condition: 1x burn rate over 30d
    Impact: On track to exhaust budget by end of window
```

---

## 7. Reducing Observability Costs While Maintaining Production Visibility

### 7.1 Observability Cost Model

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY COST BREAKDOWN                           │
│               (Typical large-scale deployment, monthly)                  │
│                                                                           │
│  LOGS: Usually 60-70% of total cost                                       │
│  ├── Volume: 50TB/month at $0.30/GB stored = $15,000/month                │
│  ├── Ingestion: 10M events/min × 1KB × $0.10/GB ingest = $4,000/month    │
│  └── Query: high read I/O on hot storage = variable                       │
│                                                                           │
│  METRICS: 15-20% of total cost                                            │
│  ├── Active time series: 10M × $0.002/series = $20,000/month             │
│  └── Query: relatively cheap due to pre-aggregation                       │
│                                                                           │
│  TRACES: 10-15% of total cost                                             │
│  ├── Sampled trace storage: 500GB/month at $0.50/GB = $250/month         │
│  └── Indexing: most cost in trace search (Jaeger/Tempo)                   │
│                                                                           │
│  COMPUTE: 10-15% of total cost                                            │
│  └── Collector fleet, Prometheus, Loki, Tempo = VM/container costs        │
│                                                                           │
│  TOTAL TARGET: < $50K/month for 100-service platform                      │
└──────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Log Volume Reduction Strategies

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    LOG COST REDUCTION TECHNIQUES                              │
│                                                                               │
│  TECHNIQUE 1: Log Level Filtering (immediate 60-80% reduction)               │
│  ─────────────────────────────────────────────────────────────               │
│  Production: INFO and above only                                              │
│  Staging: DEBUG and above                                                     │
│  Config in Fluent Bit:                                                        │
│    [FILTER]                                                                   │
│      Name grep                                                                │
│      Match *                                                                  │
│      Regex level (INFO|WARN|ERROR|FATAL|CRITICAL)                            │
│                                                                               │
│  TECHNIQUE 2: Sampling for High-Volume, Low-Value Logs (50% reduction)       │
│  ─────────────────────────────────────────────────────────────────────       │
│  Health check logs: 1-in-1000 kept                                           │
│  Successful background job logs: 1-in-100 kept                               │
│  Successful API calls: 1-in-10 kept                                          │
│  Error logs: 100% kept (always)                                              │
│                                                                               │
│  TECHNIQUE 3: Structured Log Compression                                     │
│  ─────────────────────────────────────                                       │
│  Use snappy/zstd compression in Kafka and storage                            │
│  Typical compression ratio: 3-5x for JSON logs                               │
│  10TB/day → 2-3TB/day stored = 70% storage cost reduction                   │
│                                                                               │
│  TECHNIQUE 4: Tiered Retention                                               │
│  ────────────────────────────────                                            │
│  Hot (Loki, fast query):  7 days    → $$$                                    │
│  Warm (Loki compacted):   30 days   → $$                                     │
│  Cold (S3 + Athena):      1 year    → $                                      │
│  Archive (S3 Glacier):    7 years   → ¢                                      │
│                                                                               │
│  TECHNIQUE 5: Log Deduplication                                              │
│  ─────────────────────────────────                                           │
│  Many errors repeat thousands of times per minute                            │
│  Collapse: "DB connection failed" × 10,000 → "DB connection failed [×10000]"│
│  Use Vector's dedupe transform or Loki's dedup_stream_selector               │
│                                                                               │
│  TECHNIQUE 6: Parse-and-Drop                                                 │
│  ────────────────────────────                                                │
│  Extract metrics from logs, then drop the log line                           │
│  Access logs → HTTP metrics (requests/sec, latency, status codes)            │
│  Drop the access log line after metric extraction                            │
│  Access logs are 30-50% of total log volume → massive savings                │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Metrics Cardinality Control

```yaml
# Prometheus metric relabeling to control cardinality

# 1. Drop high-cardinality, low-value metrics
metric_relabel_configs:
  # Drop per-second GC metrics (use aggregates instead)
  - source_labels: [__name__]
    regex: "go_gc_duration_seconds.*"
    action: drop
  
  # Drop per-connection TCP metrics
  - source_labels: [__name__]
    regex: "node_netstat_.*"
    action: drop
  
  # Replace high-cardinality path with normalized version
  - source_labels: [http_path]
    regex: "^/api/v\\d+/users/([0-9a-f-]+)(.*)$"
    target_label: http_path
    replacement: "/api/vN/users/{id}$2"

# 2. Limit active series per job
# In Prometheus configuration:
scrape_configs:
  - job_name: application-metrics
    sample_limit: 50000      # Max 50K series per scrape target
    label_limit: 30          # Max 30 labels per series
    label_name_length_limit: 128
    label_value_length_limit: 1024
```

### 7.4 Trace Sampling Cost Optimization

```
TRACE COST OPTIMIZATION CALCULATOR:

System: 1M requests/minute = 60M/hour = 1.44B/day

Head-based sampling only (naive):
  1% sample = 14.4M traces/day
  Each trace avg 10 spans × 1KB = 10KB
  Storage: 14.4M × 10KB = 144GB/day → $72/day = $2,160/month

Intelligent tail-based sampling:
  Total traces: 1.44B/day
  Errors (1% error rate): 14.4M → KEEP ALL = 14.4M
  Slow traces (1% of successful): 14.26M × 1% = 142K → KEEP ALL = 142K
  Normal successful: 14.26M × 0.1% kept = 14.26K
  
  Total kept: 14.4M + 142K + 14.26K = 14.56M traces/day
  But 99% of these are error traces which are small (fail fast)
  Avg error trace: 3 spans × 1KB = 3KB
  Avg slow trace: 20 spans × 1KB = 20KB
  
  Storage: (14.4M × 3KB) + (142K × 20KB) + (14.26K × 10KB)
         = 43.2GB + 2.84GB + 0.14GB = ~46GB/day
  Cost: $23/day = $690/month

Savings: 68% cost reduction while keeping ALL interesting traces
```

### 7.5 Observability Cost Governance

```
┌─────────────────────────────────────────────────────────────────────────┐
│               OBSERVABILITY COST GOVERNANCE FRAMEWORK                    │
│                                                                         │
│  TEAM BUDGETS (chargeback model)                                        │
│  ─────────────────────────────────                                      │
│  Each service team owns their observability costs                       │
│  Labels: team="payments", team="search", team="user-service"            │
│  Monthly report: "Your service emitted 2TB of logs last month"          │
│  Budget alerts: notify team if they exceed 110% of last month's budget  │
│                                                                         │
│  CARDINALITY BUDGETS                                                    │
│  ─────────────────────                                                  │
│  Enforce per-service cardinality limits                                 │
│  Mimirtool / Cortex tenant limits                                       │
│  Alert when approaching cardinality limit                               │
│  Block ingestion when limit exceeded (circuit breaker)                  │
│                                                                         │
│  MONTHLY OBSERVABILITY REVIEW                                           │
│  ──────────────────────────────                                         │
│  Top 10 highest-cost services by signal                                 │
│  Unused dashboards (queries dashboard: last_viewed > 90d)               │
│  Unused alert rules (never fired in 180d)                               │
│  Zombie metrics (not queried in 90d)                                    │
│  → Action: remove or archive                                            │
│                                                                         │
│  TOOLS FOR COST ANALYSIS                                                │
│  ────────────────────────                                               │
│  Grafana Mimirtool: cardinality analysis, top series by cost            │
│  Prometheus: tsdb analyze command for cardinality                       │
│  Loki: LogQL to identify top contributors to log volume                 │
│  Custom dashboards: cost-per-team, cost-per-service trending            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Monitoring and Alerting for High-Scale Kubernetes Platform

### 8.1 Kubernetes Monitoring Layers

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                      KUBERNETES MONITORING STACK                               │
│                                                                                │
│  LAYER 7: Business Metrics (SLIs/SLOs)                                        │
│  ─────────────────────────────────────────────────────────────────────────    │
│  Order completion rate, checkout success rate, API availability, p99 latency  │
│                                                                                │
│  LAYER 6: Application Metrics (RED method)                                    │
│  ──────────────────────────────────────────────────────────────────────────   │
│  HTTP request rate, error rate, latency; DB query latency; cache hit rate     │
│  Source: Prometheus scraping /metrics endpoints via ServiceMonitor             │
│                                                                                │
│  LAYER 5: Container / Pod Metrics                                             │
│  ──────────────────────────────────────────────────────────────────────────   │
│  CPU/memory/network per container; OOM kills; restart counts                  │
│  Source: cAdvisor (embedded in kubelet)                                        │
│                                                                                │
│  LAYER 4: Pod / Deployment Health                                             │
│  ──────────────────────────────────────────────────────────────────────────   │
│  Pod readiness/liveness; deployment rollout status; replica counts            │
│  Source: kube-state-metrics                                                    │
│                                                                                │
│  LAYER 3: Node Metrics                                                        │
│  ──────────────────────────────────────────────────────────────────────────   │
│  CPU/memory/disk/network per node; kernel metrics; file descriptors           │
│  Source: node-exporter (DaemonSet)                                             │
│                                                                                │
│  LAYER 2: Kubernetes API Server & Control Plane                               │
│  ──────────────────────────────────────────────────────────────────────────   │
│  API server latency, etcd health, scheduler queue depth                       │
│  Source: kube-apiserver, etcd, kube-scheduler, kube-controller-manager        │
│                                                                                │
│  LAYER 1: Infrastructure / Cloud                                              │
│  ──────────────────────────────────────────────────────────────────────────   │
│  Instance health, EBS/PD IOPS, VPC flow logs, load balancer metrics          │
│  Source: CloudWatch/Stackdriver/Azure Monitor, cloud-provider exporters       │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Critical Kubernetes Alert Rules

```yaml
# kubernetes-alerts.yaml — Essential alerting rules for K8s platform

groups:
  # ─────────────────────────────────────────────────
  # POD HEALTH
  # ─────────────────────────────────────────────────
  - name: kubernetes.pods
    rules:
    - alert: PodCrashLooping
      expr: |
        increase(kube_pod_container_status_restarts_total[15m]) > 3
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Pod {{ $labels.pod }} in {{ $labels.namespace }} is crash-looping"
        runbook: "https://runbooks.internal/crash-loop"

    - alert: PodNotReady
      expr: |
        kube_pod_status_ready{condition="true"} == 0
        and
        kube_pod_status_phase{phase!~"Succeeded|Failed"} == 1
      for: 5m
      labels:
        severity: warning

    - alert: PodOOMKilled
      expr: |
        kube_pod_container_status_last_terminated_reason{reason="OOMKilled"} == 1
      for: 1m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ $labels.pod }} was OOM killed — memory limits too low"

  # ─────────────────────────────────────────────────
  # DEPLOYMENT HEALTH
  # ─────────────────────────────────────────────────
  - name: kubernetes.deployments
    rules:
    - alert: DeploymentReplicasMismatch
      expr: |
        (
          kube_deployment_spec_replicas
          != kube_deployment_status_available_replicas
        ) and (
          changes(kube_deployment_status_available_replicas[5m]) == 0
        )
      for: 10m
      labels:
        severity: warning

    - alert: DeploymentRolloutStuck
      expr: |
        kube_deployment_status_condition{condition="Progressing", status="false"} == 1
      for: 15m
      labels:
        severity: critical

    - alert: HorizontalPodAutoscalerMaxedOut
      expr: |
        kube_horizontalpodautoscaler_status_current_replicas
        == kube_horizontalpodautoscaler_spec_max_replicas
      for: 15m
      labels:
        severity: warning
      annotations:
        summary: "HPA {{ $labels.horizontalpodautoscaler }} is at max replicas — may need scale-out"

  # ─────────────────────────────────────────────────
  # NODE HEALTH
  # ─────────────────────────────────────────────────
  - name: kubernetes.nodes
    rules:
    - alert: NodeHighCPU
      expr: |
        instance:node_cpu_utilisation:rate5m > 0.85
      for: 10m
      labels:
        severity: warning

    - alert: NodeDiskPressure
      expr: |
        (node_filesystem_avail_bytes{mountpoint="/", fstype!="tmpfs"}
          / node_filesystem_size_bytes{mountpoint="/"}) < 0.10
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Node {{ $labels.instance }} disk < 10% free"

    - alert: NodeMemoryPressure
      expr: |
        node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes < 0.05
      for: 5m
      labels:
        severity: critical

    - alert: NodeNotReady
      expr: |
        kube_node_status_condition{condition="Ready",status="true"} == 0
      for: 2m
      labels:
        severity: critical

  # ─────────────────────────────────────────────────
  # ETCD
  # ─────────────────────────────────────────────────
  - name: kubernetes.etcd
    rules:
    - alert: EtcdHighCommitDuration
      expr: |
        histogram_quantile(0.99, rate(etcd_disk_backend_commit_duration_seconds_bucket[5m])) > 0.25
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "etcd commit duration p99 > 250ms — disk performance issue"

    - alert: EtcdInsufficientMembers
      expr: |
        count(up{job="etcd"} == 1) < ((count(up{job="etcd"}) + 1) / 2)
      for: 3m
      labels:
        severity: critical

  # ─────────────────────────────────────────────────
  # APPLICATION SLO
  # ─────────────────────────────────────────────────
  - name: application.slo
    rules:
    - alert: HighErrorRate
      expr: |
        (
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (service)
          /
          sum(rate(http_requests_total[5m])) by (service)
        ) > 0.01
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Service {{ $labels.service }} error rate > 1%"

    - alert: HighP99Latency
      expr: |
        histogram_quantile(0.99,
          sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le)
        ) > 1.0
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Service {{ $labels.service }} p99 latency > 1s"
```

### 8.3 Alert Routing and Notification Strategy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       ALERTMANAGER ROUTING TREE                               │
│                                                                              │
│  All alerts                                                                  │
│       │                                                                      │
│       ├─── severity=critical ──────────────────────────────────────────────┐ │
│       │                                                                    │ │
│       │    ├── team=payments ──► PagerDuty (payments on-call)             │ │
│       │    │                    + Slack #payments-alerts                  │ │
│       │    │                    + SMS to on-call engineer                 │ │
│       │    │                                                              │ │
│       │    ├── team=infrastructure ──► PagerDuty (infra on-call)         │ │
│       │    │                          + Slack #infra-critical             │ │
│       │    │                                                              │ │
│       │    └── team=* ──► PagerDuty (default on-call)                    │ │
│       │                   + Slack #incidents                             │ │
│       │                                                                  │ │
│       ├─── severity=warning ──────────────────────────────────────────────┤ │
│       │                                                                  │ │
│       │    ├── team=payments ──► Slack #payments-warnings               │ │
│       │    │                    + JIRA ticket auto-created               │ │
│       │    │                                                              │ │
│       │    └── team=* ──► Slack #platform-warnings                      │ │
│       │                                                                  │ │
│       └─── severity=info ──────────────────────────────────────────────────┘ │
│                                                                              │
│            └── Slack #observability-info only                               │
│                                                                              │
│  INHIBITION RULES:                                                           │
│  ─────────────────                                                           │
│  If NodeNotReady fires → inhibit all pod/container alerts on that node      │
│  (avoids alert storm when the real cause is a node failure)                 │
│                                                                              │
│  inhibit_rules:                                                              │
│    - source_match:                                                           │
│        alertname: NodeNotReady                                               │
│      target_match_re:                                                        │
│        alertname: "(Pod.*|Container.*|Deployment.*)"                        │
│      equal: [node]                                                           │
│                                                                              │
│  GROUPING:                                                                   │
│  ──────────                                                                  │
│  group_by: [cluster, namespace, team]                                        │
│  group_wait: 30s       # Wait to batch related alerts                       │
│  group_interval: 5m    # How often to send grouped updates                  │
│  repeat_interval: 4h   # How often to re-notify if not resolved             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Detecting and Debugging Cascading Failures Across Hundreds of Microservices

### 9.1 What Causes Cascading Failures

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                   CASCADE FAILURE PROPAGATION MODEL                           │
│                                                                              │
│  t=0: Database slow (high query latency)                                     │
│  ─────────────────────────────────────                                       │
│        DB ──────────────────────────────────────────► slow queries (500ms)  │
│                                                                              │
│  t=30s: Services calling DB accumulate open connections                      │
│  ──────────────────────────────────────────────────────                      │
│        User Service ──► DB (connection pool 90% full, requests queuing)     │
│        Order Service ──► DB (connection pool 95% full)                      │
│        Payment Service ──► DB (connection pool 100% — rejecting!)          │
│                                                                              │
│  t=60s: Services start timing out, retry storms begin                        │
│  ──────────────────────────────────────────────────────                      │
│        API Gateway ──► User Service (timeouts) ──► retries ──► more load   │
│                   └──► Order Service (timeouts) ──► retries                 │
│                   └──► Payment Service (500s) ──► client retries            │
│                                                                              │
│  t=90s: Thread/goroutine exhaustion in caller services                       │
│  ────────────────────────────────────────────────────                        │
│        User Service: all threads blocked on DB calls ──► OOM / CPU max      │
│        → User Service pods restart                                           │
│        → K8s restarts them → CrashLoop begins                               │
│                                                                              │
│  t=120s: Full cascade                                                        │
│  ────────────────────                                                        │
│        API Gateway is overwhelmed → Gateway starts returning 503s           │
│        CDN/Load balancer unhealthy checks fire                               │
│        Customer-facing: entire platform down                                 │
│                                                                              │
│  Root cause: single DB slowdown → total platform outage in 2 minutes        │
│                                                                              │
│  PREVENTION: Circuit breakers, bulkheads, timeouts, retry budgets           │
│  DETECTION: Dependency graph + correlated alert analysis                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Cascade Detection via Service Dependency Graph

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    SERVICE DEPENDENCY GRAPH MONITORING                        │
│                                                                              │
│  Auto-generated from traces (servicegraph processor in OTel Collector)       │
│                                                                              │
│  SERVICE GRAPH METRICS:                                                      │
│  traces_service_graph_request_total{client, server}                          │
│  traces_service_graph_request_failed_total{client, server}                   │
│  traces_service_graph_request_server_seconds_bucket{client, server, le}      │
│                                                                              │
│  DEPENDENCY GRAPH (example):                                                 │
│                                                                              │
│  [API GW] ──► [User Svc]   ──► [DB-Users]                                  │
│            ├──► [Order Svc]  ──► [DB-Orders]                                │
│            │                └──► [Inventory Svc] ──► [DB-Inventory]         │
│            │                └──► [Payment Svc] ──► [Stripe API]             │
│            └──► [Search Svc] ──► [Elasticsearch]                            │
│                                                                              │
│  CASCADE DETECTION ALGORITHM:                                                │
│  ─────────────────────────────                                               │
│  1. Detect anomaly: payment-svc error rate spikes to 50%                    │
│  2. Graph traversal: find payment-svc's dependencies                        │
│     → payment-svc depends on: db-orders, stripe-api                        │
│  3. Check dependency health at same timestamp:                               │
│     → db-orders: p99 latency spiked from 20ms to 800ms ← ROOT CAUSE        │
│     → stripe-api: normal                                                    │
│  4. Find who depends on payment-svc:                                        │
│     → order-svc → api-gateway                                               │
│  5. Correlate: order-svc error rate also elevated? YES → cascade confirmed  │
│  6. Alert: "Cascade detected: db-orders → payment-svc → order-svc"         │
│                                                                              │
│  GRAFANA SERVICE GRAPH PANEL:                                                │
│  - Nodes colored by error rate (green → yellow → red)                       │
│  - Edge thickness = request volume                                           │
│  - Click node → drill to traces for that service pair                       │
│  - Automatic upstream/downstream expansion                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Cascade Failure Debugging Playbook

```
┌──────────────────────────────────────────────────────────────────────────────┐
│              CASCADE FAILURE DEBUGGING DECISION TREE                          │
│                                                                              │
│  STEP 1: TRIAGE (0-5 minutes)                                                │
│  ─────────────────────────────                                               │
│  1a. What is the customer impact?                                            │
│      → Check: synthetic monitor results, real-user monitoring (RUM)          │
│      → Check: top-level SLO dashboard (availability + latency)              │
│                                                                              │
│  1b. Which services are unhealthy?                                           │
│      → Check: Grafana service topology / dependency graph                   │
│      → RED metrics for all services (color-coded health map)                │
│      → Sort by error rate DESC                                               │
│                                                                              │
│  STEP 2: IDENTIFY ROOT CAUSE (5-15 minutes)                                  │
│  ──────────────────────────────────────────                                  │
│  2a. Find the "most upstream" unhealthy service in the dependency chain      │
│      (the one with no unhealthy dependencies is likely root cause)           │
│                                                                              │
│  2b. Look at the failing service's traces:                                   │
│      Loki query: {service="order-svc", level="ERROR"} |= "timeout"          │
│      → Find common error messages                                            │
│      → Click trace_id → open in Tempo                                       │
│                                                                              │
│  2c. Correlate with infrastructure events:                                   │
│      → Deployment events (Grafana annotations)                               │
│      → Node events (kube_node_status_condition changes)                      │
│      → Resource exhaustion (CPU, memory, disk, connection pools)             │
│                                                                              │
│  STEP 3: CONTAIN (15-30 minutes)                                             │
│  ─────────────────────────────────                                           │
│  3a. Activate circuit breakers if not auto-triggered                         │
│  3b. Shed load: reduce traffic to affected services                          │
│  3c. Scale out if resource-bound: kubectl scale deployment X --replicas=20  │
│  3d. Roll back if deployment-caused: argocd rollback / helm rollback        │
│                                                                              │
│  STEP 4: RESOLVE AND MONITOR (30+ minutes)                                   │
│  ─────────────────────────────────────────                                   │
│  4a. Fix root cause (scale DB, fix query, increase pool size)                │
│  4b. Monitor recovery: watch error rates drop                                │
│  4c. Verify no secondary cascades as load shifts                             │
│  4d. Declare incident resolved when SLO is back to normal                   │
│                                                                              │
│  STEP 5: POST-INCIDENT REVIEW                                                │
│  ─────────────────────────────                                               │
│  5a. Pull 1-hour trace sample from incident window (Tempo)                   │
│  5b. Generate timeline from logs (LogQL + Grafana annotations)               │
│  5c. Identify detection gap (could we have caught this earlier?)             │
│  5d. Add missing alerts / improve circuit breaker tuning                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 9.4 Key Cascade Failure Prevention Metrics to Monitor

```
CIRCUIT BREAKER METRICS:
  resilience4j_circuitbreaker_state{name, state="open|closed|half_open"}
  resilience4j_circuitbreaker_failure_rate
  resilience4j_circuitbreaker_calls_total{kind="successful|failed|rejected"}

BULKHEAD METRICS:
  resilience4j_bulkhead_available_concurrent_calls
  resilience4j_bulkhead_max_allowed_concurrent_calls
  → Alert when: available / max < 0.1 (10% capacity remaining)

RETRY STORM DETECTION:
  # Retries = traffic amplification under failure
  rate(http_client_requests_total{outcome="RETRIED"}[1m])
    / rate(http_client_requests_total[1m]) > 0.3
  → When 30% of outbound calls are retries = retry storm in progress

CONNECTION POOL EXHAUSTION:
  hikaricp_connections_pending > 5           # DB connection pool pressure
  hikaricp_connections_active / hikaricp_connections_max > 0.9

THREAD POOL EXHAUSTION:
  jvm_threads_states_threads{state="blocked"} 
    / jvm_threads_live_threads > 0.5
  → When 50% of threads are blocked = likely cascade in progress

QUEUE DEPTH SPIRAL:
  # Growing queue depth = system not keeping up
  kafka_consumer_lag_sum{consumer_group="order-processor"} > 10000
  AND
  rate(kafka_consumer_lag_sum[5m]) > 0      # and still growing
```

---

## 10. Complete Observability Platform: Grafana, Loki, Prometheus, and Distributed Tracing

### 10.1 The LGTM Stack (Loki, Grafana, Tempo, Mimir/Prometheus)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE LGTM STACK ARCHITECTURE                       │
│                                                                                │
│                          ┌─────────────────────────────┐                      │
│                          │          GRAFANA             │                      │
│                          │   (Unified Visualization)    │                      │
│                          │                             │                      │
│                          │  ┌────────┐ ┌────────────┐  │                      │
│                          │  │Dashbrd │ │   Alerts   │  │                      │
│                          │  │Builder │ │  Manager   │  │                      │
│                          │  └────────┘ └────────────┘  │                      │
│                          │  ┌────────┐ ┌────────────┐  │                      │
│                          │  │Explore │ │  OnCall    │  │                      │
│                          │  │(ad-hoc)│ │ (rotation) │  │                      │
│                          │  └────────┘ └────────────┘  │                      │
│                          └──────────────────┬───────────┘                      │
│                                             │                                  │
│             ┌───────────────────────────────┼───────────────────────────┐      │
│             │                               │                           │      │
│             ▼                               ▼                           ▼      │
│  ┌─────────────────────┐  ┌─────────────────────────┐  ┌──────────────────┐  │
│  │        LOKI          │  │   MIMIR / PROMETHEUS    │  │      TEMPO        │  │
│  │  (Log Aggregation)  │  │   (Metrics Storage)     │  │ (Trace Storage)  │  │
│  │                     │  │                         │  │                  │  │
│  │  LogQL queries      │  │  PromQL queries         │  │  TraceQL queries │  │
│  │  Label-based index  │  │  Long-term storage      │  │  Span search     │  │
│  │  S3 chunk storage   │  │  Global query           │  │  S3-backed       │  │
│  │  Multi-tenancy      │  │  Multi-tenancy          │  │  Multi-tenant    │  │
│  │  Compaction/rules   │  │  Unlimited retention    │  │  Tag search      │  │
│  └──────────┬──────────┘  └────────────┬────────────┘  └────────┬─────────┘  │
│             │                          │                         │            │
│             └──────────────────────────┼─────────────────────────┘            │
│                                        │                                      │
│                              ┌─────────▼──────────┐                          │
│                              │   OBJECT STORAGE   │                          │
│                              │  (S3 / GCS / Azure │                          │
│                              │   Blob Storage)    │                          │
│                              │                    │                          │
│                              │  /loki/chunks/     │                          │
│                              │  /mimir/blocks/    │                          │
│                              │  /tempo/traces/    │                          │
│                              └────────────────────┘                          │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                  COLLECTION LAYER (feeding the stack)                  │  │
│  │                                                                        │  │
│  │  OTel Collectors ──► Loki (logs) + Mimir (metrics) + Tempo (traces)   │  │
│  │  Prometheus Agents / Alloy ──► Mimir remote_write                     │  │
│  │  Fluent Bit ──► Loki push API                                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Grafana Dashboard Strategy

```
DASHBOARD HIERARCHY:
─────────────────────
LEVEL 0: Executive / SRE Overview
  → 1 page: all services, SLO status, global health map
  → Audience: On-call engineers, managers
  → Refresh: 30s
  → Panels: SLO burn rate, service health grid, active incidents

LEVEL 1: Service-Level Dashboards (one per service)
  → RED method: Rate, Errors, Duration
  → Linked to: relevant traces, logs
  → Template variables: environment, region, version
  → Audience: Service owners, debugging engineers

LEVEL 2: Infrastructure Dashboards
  → Node exporter: CPU, memory, disk, network per node
  → K8s cluster: pod density, resource utilization heatmap
  → Database: query latency, connection pools, lock waits

LEVEL 3: Deep-Dive / Debug Dashboards
  → Trace-to-log correlation explorer
  → Cardinality analysis dashboard
  → Pipeline health (collector throughput, queue depths)

DASHBOARD BEST PRACTICES:
─────────────────────────
1. Every dashboard has: title, description, owner label, last-updated date
2. Use template variables for service, environment, region (no hardcoding)
3. Every panel has a description explaining what it measures and why
4. Link panels to relevant runbooks
5. Use consistent color coding: green < threshold, yellow = warning, red = critical
6. Show SLO thresholds as horizontal lines on latency graphs
7. Exemplar dots on histograms — click to jump to the exact slow trace
```

### 10.3 Grafana-Tempo-Loki Deep Integration

The most powerful feature of the LGTM stack is the **cross-signal correlation** — jumping from a metric spike, to the traces that contributed to it, to the logs for those specific spans.

```
CORRELATION WORKFLOW:
─────────────────────

1. METRIC ALERT FIRES:
   → Grafana alert: "payment-service p99 latency > 1s"
   → Click alert → open latency histogram

2. EXEMPLAR NAVIGATION (Metrics → Traces):
   → Histogram panel shows exemplar dots at the 99th percentile
   → Each dot = a sample trace from that latency bucket
   → Click dot → opens Tempo trace explorer with that trace_id
   → See: which spans were slow, which service caused the bottleneck

3. SPAN TO LOGS (Traces → Logs):
   → In Tempo trace view, click any span
   → "Logs for this span" button → opens Loki
   → Loki query auto-generated: {service="payment-svc"} | trace_id="abc123"
   → See all log lines emitted during that specific request

4. DERIVED FIELDS (Logs → Traces):
   → In Loki log line, trace_id is auto-detected (derived field)
   → Click trace_id value → opens Tempo with full trace
   → Bidirectional navigation

GRAFANA DATASOURCE CONFIG FOR CORRELATION:
──────────────────────────────────────────
# Tempo datasource with trace-to-logs linkage:
datasources:
  - name: Tempo
    type: tempo
    url: http://tempo:3200
    jsonData:
      tracesToLogs:
        datasourceUid: loki-uid
        tags: ['service.name', 'k8s.pod.name']
        filterByTraceID: true
        filterBySpanID: false
        lokiSearch: true
      serviceMap:
        datasourceUid: prometheus-uid    # for service graph
      search:
        hide: false
      nodeGraph:
        enabled: true

  - name: Prometheus
    type: prometheus
    url: http://thanos-query:9090
    jsonData:
      exemplarTraceIdDestinations:
        - name: trace_id
          datasourceUid: tempo-uid        # Click exemplar → Tempo
```

### 10.4 Mimir Architecture (Prometheus-Compatible, Horizontally Scalable)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        GRAFANA MIMIR ARCHITECTURE                           │
│                   (drop-in Prometheus replacement at scale)                 │
│                                                                             │
│  WRITE PATH                                                                 │
│  ─────────                                                                  │
│  Remote Write ──► Distributor ──► (hash ring) ──► Ingester (3x replicas)   │
│                                                       │                    │
│                                                       ▼ (flush 2h blocks)  │
│                                               Object Store (S3)            │
│                                                                             │
│  READ PATH                                                                  │
│  ─────────                                                                  │
│  Grafana ──► Query Frontend ──► Query Scheduler ──► Querier                 │
│                                                        │                   │
│                           ┌────────────────────────────┤                   │
│                           ▼                            ▼                   │
│                       Ingester                   Store Gateway             │
│                       (recent data)              (S3 historical data)      │
│                                                                             │
│  SCALABILITY:                                                               │
│  ─────────────                                                              │
│  Distributor:      stateless, horizontally scalable, hash ring routing     │
│  Ingester:         stateful, WAL for durability, 3x replication            │
│  Query Frontend:   stateless, splits large queries, caches results         │
│  Querier:          stateless, fans out to ingester + store gateway         │
│  Store Gateway:    stateless, lazy-loads S3 blocks, index caching          │
│  Compactor:        singleton (or sharded), compacts + downsample blocks    │
│  Ruler:            evaluates recording/alert rules against global data     │
│                                                                             │
│  MULTI-TENANCY:                                                             │
│  ──────────────                                                             │
│  X-Scope-OrgID header segregates all data by tenant                        │
│  Per-tenant limits: max active series, ingestion rate, query timeout       │
│  Tenant isolation: cross-tenant queries impossible via API                  │
└────────────────────────────────────────────────────────────────────────────┘
```

### 10.5 Grafana OnCall Integration

```
INCIDENT RESPONSE WORKFLOW:
─────────────────────────────

Alert fires (Grafana Alerting)
     │
     ▼
Grafana OnCall receives alert
     │
     ├── Route by: service label, severity, time-of-day
     │
     ├── Escalation policy:
     │   1. Notify primary on-call (push notification, 5 min)
     │   2. Notify secondary on-call (if no ack, 10 min)
     │   3. Notify team lead (if no ack, 20 min)
     │   4. Page all engineers (if no ack, 30 min)
     │
     ├── Auto-create incident:
     │   → Slack channel: #incident-2024-01-15-payment-outage
     │   → Populate: affected service, alert description, runbook link
     │   → Attach: Grafana dashboard link, relevant log/trace queries
     │
     └── During incident:
         → Timeline auto-populated from acknowledgment, comments, actions
         → Severity can be escalated/downgraded
         → Stakeholder notification (automated updates every 30min)
         → Post-incident: auto-generate retrospective template
```

### 10.6 Full Platform Sizing Guide

```
┌───────────────────────────────────────────────────────────────────────────────┐
│              PLATFORM SIZING REFERENCE (adjust for your scale)                │
│                                                                               │
│  SCENARIO: 500 services, 5 K8s clusters, 1000 nodes, 5M requests/min         │
│                                                                               │
│  LOKI (log storage):                                                          │
│  ├── Ingest rate: 500 services × 5KB/s avg = 2.5MB/s = 215GB/day             │
│  ├── Distributor: 3× nodes, 2 CPU, 2Gi RAM                                   │
│  ├── Ingester: 6× nodes, 4 CPU, 16Gi RAM (WAL + in-memory chunks)            │
│  ├── Querier: 4× nodes, 4 CPU, 8Gi RAM (auto-scale based on query load)      │
│  ├── Query Frontend: 2× nodes, 2 CPU, 2Gi RAM                                │
│  └── Object Store: ~6.5TB/month (at 30-day retention)                        │
│                                                                               │
│  MIMIR/PROMETHEUS (metrics):                                                  │
│  ├── Active series: 1000 nodes × 2000 metrics + app metrics ≈ 10M series     │
│  ├── Ingest rate: 10M series / 15s scrape = 667K samples/s                   │
│  ├── Distributor: 3× nodes, 4 CPU, 4Gi RAM                                   │
│  ├── Ingester: 9× nodes, 8 CPU, 32Gi RAM (3x replication)                   │
│  ├── Querier: 4× nodes, 4 CPU, 8Gi RAM                                       │
│  └── Object Store: ~500GB/month (with downsampling)                          │
│                                                                               │
│  TEMPO (trace storage):                                                       │
│  ├── Trace volume (1% sampled): 5M req/min × 1% × 10KB = 500MB/min           │
│  ├── Distributor: 3× nodes, 2 CPU, 4Gi RAM                                   │
│  ├── Ingester: 3× nodes, 4 CPU, 8Gi RAM                                      │
│  ├── Query Frontend: 2× nodes, 2 CPU, 2Gi RAM                                │
│  └── Object Store: ~700GB/month                                              │
│                                                                               │
│  OTel COLLECTOR FLEET:                                                        │
│  ├── Agent (DaemonSet): 1000 nodes × 0.1 CPU, 128Mi = 100 CPU, 128Gi total  │
│  └── Gateway: 10× nodes, 4 CPU, 8Gi RAM                                      │
│                                                                               │
│  GRAFANA:                                                                     │
│  └── 3× HA nodes, 2 CPU, 4Gi RAM (stateless, session in Redis)              │
│                                                                               │
│  TOTAL ESTIMATED COST (cloud, us-east-1):                                     │
│  ├── Compute: ~$8,000-12,000/month                                           │
│  ├── Object storage: ~$500-800/month                                         │
│  └── Total: ~$8,500-13,000/month for full observability platform             │
└───────────────────────────────────────────────────────────────────────────────┘
```

### 10.7 Platform Deployment: Kubernetes Manifests Overview

```yaml
# Namespace + RBAC
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
  labels:
    monitoring: "true"

---
# Grafana Helm values (abbreviated)
# helm install grafana grafana/grafana -f grafana-values.yaml

grafana:
  replicas: 3
  persistence:
    enabled: false  # Dashboards as code (Grafana Operator / ConfigMaps)
  datasources:
    datasources.yaml:
      apiVersion: 1
      datasources:
        - name: Mimir
          type: prometheus
          url: http://mimir-query-frontend.monitoring:8080/prometheus
        - name: Loki
          type: loki
          url: http://loki-gateway.monitoring:80
        - name: Tempo
          type: tempo
          url: http://tempo-query-frontend.monitoring:3200
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
        - name: 'platform'
          orgId: 1
          folder: 'Platform'
          type: file
          options:
            path: /var/lib/grafana/dashboards/platform
  sidecar:
    dashboards:
      enabled: true        # Auto-load dashboards from ConfigMaps
      label: grafana_dashboard

---
# Example: Dashboard as ConfigMap (GitOps-friendly)
apiVersion: v1
kind: ConfigMap
metadata:
  name: service-health-dashboard
  namespace: monitoring
  labels:
    grafana_dashboard: "1"
data:
  service-health.json: |
    {
      "title": "Service Health Overview",
      "panels": [...],
      "templating": {...}
    }
```

### 10.8 Day-2 Operations: Observability Health Checks

```
WEEKLY OBSERVABILITY HEALTH REVIEW CHECKLIST:
──────────────────────────────────────────────

SIGNAL QUALITY:
□ All services emitting metrics (check for gaps in service coverage)
□ Trace coverage > 95% of services (OTel auto-instrumentation verification)
□ Log parse error rate < 1% (structured log compliance)
□ No cardinality explosions (top-10 series by cardinality review)

ALERT QUALITY:
□ Alert-to-page ratio < 5:1 (if >5 alerts per page, tune sensitivity)
□ Mean time to detect (MTTD) < 5 minutes for critical issues
□ No alerts firing for > 7 days without resolution (stale alerts)
□ Coverage: every service has at least error rate + latency alerts

STORAGE HEALTH:
□ Loki ingester memory < 80%
□ Mimir compactor not falling behind (block age < 3h)
□ Tempo trace search index healthy
□ S3 bucket lifecycle rules enforcing retention

COST HEALTH:
□ Top 5 log-emitting services reviewed for reduction opportunities
□ Unused dashboards archived (last_viewed_at > 90 days)
□ Prometheus recording rules covering all heavy queries
□ Trace sample rate still appropriate (not over-sampling)
```

---

## Appendix A: Technology Selection Matrix

| Requirement | Option A | Option B | Option C | Recommended |
|-------------|----------|----------|----------|-------------|
| Metrics (small-med) | Prometheus | VictoriaMetrics | Mimir | Prometheus + Thanos |
| Metrics (large-scale) | Thanos | Cortex | Mimir | Mimir (simpler ops) |
| Logs | Elasticsearch | Loki | OpenSearch | Loki (cost-effective) |
| Traces | Jaeger | Zipkin | Tempo | Tempo (Loki-compatible) |
| Visualization | Grafana | Kibana | Datadog | Grafana (open ecosystem) |
| Collection | Fluent Bit | Logstash | Vector | OTel Collector + Fluent Bit |
| Alerting | Alertmanager | PagerDuty | Grafana OnCall | Alertmanager + OnCall |

## Appendix B: Key PromQL Recipes

```promql
# SLO error budget burn rate (30-day window)
1 - (
  sum(rate(http_requests_total{status!~"5..", job="api"}[30d]))
  / sum(rate(http_requests_total{job="api"}[30d]))
) > 0.001   # 99.9% SLO

# Deployment rollout progress
kube_deployment_status_updated_replicas / kube_deployment_spec_replicas

# Service to service error rate (from span metrics)
sum(rate(traces_spanmetrics_calls_total{status_code="STATUS_CODE_ERROR"}[5m])) by (service, peer_service)
/ sum(rate(traces_spanmetrics_calls_total[5m])) by (service, peer_service)

# Connection pool saturation
1 - (hikaricp_connections_idle / hikaricp_connections_max)

# JVM GC pressure
rate(jvm_gc_pause_seconds_sum[5m]) / rate(jvm_gc_pause_seconds_count[5m])
```

## Appendix C: LogQL Recipes

```logql
# Find all errors for a service in the last hour
{service="payment-svc", env="prod"} |= "ERROR" | json | line_format "{{.timestamp}} {{.message}}"

# Count errors by type
sum by (error_type) (
  count_over_time({service="payment-svc"} |= "ERROR" | json | unwrap error_type [5m])
)

# Slow requests > 1s from access logs
{service="api-gateway"} | json | duration > 1s | line_format "{{.path}} {{.duration}} {{.trace_id}}"

# Log volume by service (for cost analysis)
sum by (service) (
  bytes_rate({namespace="production"}[5m])
)

# Trace correlation: all logs for a specific trace
{namespace="production"} | json | trace_id="4bf92f3577b34da6a3ce929d0e0e4736"
```

## Appendix D: TraceQL Recipes (Grafana Tempo)

```traceql
# All error traces for payment service
{ span.service.name = "payment-service" && status = error }

# Slow traces > 2 seconds
{ rootName = "POST /api/v1/orders" && duration > 2s }

# Traces containing a specific DB query
{ span.db.statement =~ ".*SELECT.*orders.*" && span.db.system = "postgresql" }

# Traces with high span count (complex requests)
{ } | count() > 50

# Service graph: all calls from order-svc to payment-svc that failed
{ span.service.name = "order-service" } >> { span.service.name = "payment-service" && status = error }
```

---

*Document version: 1.0 | Architecture patterns current as of 2024 | Review annually or after major platform changes*