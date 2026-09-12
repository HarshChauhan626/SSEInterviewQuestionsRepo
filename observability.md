# Observability Guide

A comprehensive, practical reference for designing, implementing, and operating observability across backend services, Kubernetes/EKS infrastructure, and frontend applications. This guide covers the OpenTelemetry protocol, Datadog, the Grafana stack (LGTM), EKS application observability, and frontend observability — with architecture explanations, working examples, and best practices for each.

## Table of Contents

1. [Observability Fundamentals](#1-observability-fundamentals)
2. [OpenTelemetry (OTel) Protocol](#2-opentelemetry-otel-protocol)
3. [Datadog](#3-datadog)
4. [Grafana Stack (LGTM)](#4-grafana-stack-lgtm)
5. [EKS Application Observability](#5-eks-application-observability)
6. [Frontend Observability](#6-frontend-observability)
7. [Reference Architecture](#7-reference-architecture)
8. [Cross-Cutting Best Practices](#8-cross-cutting-best-practices)
9. [Incident Response & Runbooks](#9-incident-response--runbooks)
10. [Appendix](#10-appendix)

---

## 1. Observability Fundamentals

### 1.1 What Observability Means

Observability is the ability to understand a system's internal state from its external outputs. In practice this means being able to answer *any* question about system behavior — not just the questions you thought to ask in advance (as with traditional dashboards/monitoring). The three foundational signal types are:

- **Metrics** — numeric measurements aggregated over time (request rate, CPU usage, queue depth).
- **Logs** — discrete, timestamped, often unstructured or semi-structured events.
- **Traces** — the causal path of a single request as it flows through distributed services.

A fourth pillar, increasingly recognized as essential, is:

- **Profiles** — continuous CPU/memory profiling data that shows *where* time/resources are spent within a process.

### 1.2 Monitoring vs. Observability

| Monitoring | Observability |
|---|---|
| Answers known questions ("is CPU > 80%?") | Answers unknown/ad-hoc questions ("why did checkout latency spike for EU users on Android at 14:32?") |
| Dashboards built in advance | High-cardinality, high-dimensionality data queried ad hoc |
| Threshold-based alerting | Context-rich investigation and correlation |
| Necessary but not sufficient | Superset that includes monitoring |

### 1.3 The Three Pillars, Unified

Modern observability practice treats metrics, logs, and traces not as three separate silos, but as **correlated views into the same events**:

```
                     ┌─────────────────────────┐
                     │      Single Request      │
                     └────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
   ┌─────────┐              ┌──────────┐              ┌──────────┐
   │ Metric  │              │  Trace   │              │   Log    │
   │ sample  │◄── exemplar ─┤  (spans) │─── trace_id ─►│  record  │
   │ (p99)   │              │          │              │          │
   └─────────┘              └──────────┘              └──────────┘
```

The value of a mature observability stack is largely determined by how well these three are *linked* — being able to click from a metric spike, into the exact trace that represents it, into the logs emitted during that trace.

### 1.4 Cardinality and Cost

The single biggest practical constraint in observability system design is **cardinality** — the number of unique label/tag combinations a system must index.

- Metrics systems (Prometheus, Mimir, Datadog custom metrics) are cardinality-sensitive: a label like `user_id` on a metric can blow up storage and query cost by orders of magnitude.
- Logs and traces are comparatively cardinality-tolerant (they are stored as full records, not aggregated time series), which is why high-cardinality data (user ID, request ID, session ID) belongs in logs/trace attributes, not metric labels.

**Rule of thumb:** Metrics for aggregates and alerting. Traces for causal request flow. Logs for detailed context and forensics. Never put unbounded values in metric label sets.

### 1.5 Golden Signals / RED / USE

Three widely used frameworks for deciding what to measure on any service:

- **Golden Signals** (Google SRE): Latency, Traffic, Errors, Saturation.
- **RED method** (services): Rate, Errors, Duration.
- **USE method** (resources): Utilization, Saturation, Errors.

Every service dashboard in this guide is built around these frameworks so that any engineer, on any team, can look at any dashboard and immediately understand service health without prior context.

---

## 2. OpenTelemetry (OTel) Protocol

### 2.1 Overview and Motivation

OpenTelemetry (OTel) is a CNCF-graduated, vendor-neutral standard for generating, collecting, and exporting telemetry. It emerged from the 2019 merger of OpenTracing and OpenCensus and has become the de facto instrumentation standard across the industry. Its core value proposition:

- **Instrument once, export anywhere.** Application code depends only on the OTel API — the backend (Datadog, Grafana, Honeycomb, New Relic, self-hosted Jaeger/Prometheus, etc.) is a deployment-time configuration choice, not a code change.
- **Avoid vendor lock-in** at the instrumentation layer while still allowing vendor-specific enrichment at the collection layer.
- **Consistency** across languages via shared semantic conventions.

### 2.2 Architecture Layers

OpenTelemetry is organized into distinct layers, each with a specific responsibility:

```
┌────────────────────────────────────────────────────────────┐
│  Application Code                                           │
│  ┌──────────────┐                                            │
│  │  OTel API    │  <- what app code calls (tracer.startSpan) │
│  └──────┬───────┘                                            │
│         │                                                    │
│  ┌──────▼───────┐                                            │
│  │  OTel SDK    │  <- implements the API, does batching,     │
│  │              │     sampling decisions, resource attach    │
│  └──────┬───────┘                                            │
│         │                                                    │
│  ┌──────▼───────┐                                            │
│  │  Exporter    │  <- serializes to OTLP and sends            │
│  └──────┬───────┘                                            │
└─────────┼──────────────────────────────────────────────────┘
          │  OTLP (grpc :4317 / http :4318)
          ▼
┌────────────────────────────────────────────────────────────┐
│  OpenTelemetry Collector                                     │
│  ┌───────────┐   ┌────────────┐   ┌───────────┐             │
│  │ Receivers │──►│ Processors │──►│ Exporters │──► Backends  │
│  └───────────┘   └────────────┘   └───────────┘             │
└────────────────────────────────────────────────────────────┘
```

- **API** — the interface application code calls. Stable, minimal, language-idiomatic.
- **SDK** — the concrete implementation: sampling, batching, context propagation, resource attribution.
- **Instrumentation libraries** — pre-built wrappers for common frameworks (Express, Spring, Django, gRPC, JDBC, etc.) that create spans/metrics automatically without manual code changes.
- **Collector** — a separate, standalone process/binary that receives, transforms, and forwards telemetry. This is the architectural centerpiece that enables vendor flexibility.
- **Exporters** — protocol adapters, either in-SDK (rare, for simple cases) or in-Collector (typical, for production).

### 2.3 The Three Signals in Detail

#### 2.3.1 Traces

A **trace** represents the end-to-end journey of a request. It is composed of **spans**, each representing a unit of work (an HTTP call, a DB query, a function execution).

Key concepts:
- **Trace ID** — 16-byte identifier shared by every span in a trace.
- **Span ID** — 8-byte identifier unique to a span.
- **Parent/child relationships** — spans form a tree (or DAG with span links) representing causality.
- **Span attributes** — key/value metadata (`http.route`, `db.statement`, `messaging.system`).
- **Span events** — timestamped annotations within a span (e.g., a retry, a cache miss).
- **Span status** — `Unset`, `Ok`, or `Error`.
- **Span kind** — `Client`, `Server`, `Producer`, `Consumer`, `Internal` — describes the span's role in the RPC.

Example span emitted from a Node.js Express handler:

```javascript
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('checkout-service');

app.post('/checkout', async (req, res) => {
  const span = tracer.startSpan('process-checkout', {
    attributes: {
      'checkout.cart_id': req.body.cartId,
      'checkout.item_count': req.body.items.length,
    },
  });

  try {
    const total = await calculateTotal(req.body.items);
    span.setAttribute('checkout.total_cents', total);
    const result = await chargePayment(req.body.paymentToken, total);
    span.addEvent('payment-charged', { 'payment.provider': 'stripe' });
    res.json(result);
  } catch (err) {
    span.recordException(err);
    span.setStatus({ code: 2, message: err.message }); // 2 = ERROR
    res.status(500).send('checkout failed');
  } finally {
    span.end();
  }
});
```

#### 2.3.2 Metrics

OTel metrics are collected via **instruments**:

| Instrument | Use case | Example |
|---|---|---|
| Counter | Monotonically increasing value | `http.server.request.count` |
| UpDownCounter | Value that can increase/decrease | `queue.size` |
| Histogram | Distribution of values | `http.server.duration` |
| Gauge (async) | Point-in-time value, observed via callback | `process.memory.usage` |
| Exponential Histogram | High-resolution latency distributions with low storage overhead | `db.client.operation.duration` |

Example instrumentation in Python:

```python
from opentelemetry import metrics

meter = metrics.get_meter("inventory-service")

request_counter = meter.create_counter(
    name="inventory.requests",
    description="Count of inventory API requests",
    unit="1",
)

latency_histogram = meter.create_histogram(
    name="inventory.request.duration",
    description="Request duration",
    unit="ms",
)

def handle_request(sku):
    start = time.time()
    request_counter.add(1, {"sku_category": get_category(sku)})
    result = lookup_inventory(sku)
    latency_histogram.record((time.time() - start) * 1000, {"sku_category": get_category(sku)})
    return result
```

#### 2.3.3 Logs

OTel logs are the newest of the three signals to stabilize. They wrap existing logging libraries (Winston, Log4j, structlog) rather than replacing them, and automatically inject `trace_id`/`span_id` into log records so logs can be correlated with the active trace/span at emission time.

```python
import logging
from opentelemetry.instrumentation.logging import LoggingInstrumentor

LoggingInstrumentor().instrument(set_logging_format=True)

logging.info("Order created", extra={"order_id": order.id, "amount": order.total})
# Output automatically includes trace_id=... span_id=... for correlation
```

### 2.4 OTLP Wire Protocol

**OTLP (OpenTelemetry Protocol)** is the wire format used to transmit telemetry from SDKs/agents to Collectors, and between Collectors.

- **otlp/grpc** — binary protobuf over HTTP/2, port `4317` by default. Preferred in production for efficiency and built-in streaming/backpressure handling.
- **otlp/http** — protobuf or JSON over HTTP/1.1, port `4318` by default. Easier to route through proxies, load balancers, and browsers (gRPC-Web has limitations in browsers, so frontend telemetry almost always uses otlp/http).

Payload structure (conceptually):

```
ExportTraceServiceRequest
└── ResourceSpans[]
    ├── Resource (service.name, service.version, deployment.environment, host.name, ...)
    └── ScopeSpans[]
        ├── Scope (instrumentation library name/version)
        └── Spans[]
            ├── trace_id, span_id, parent_span_id
            ├── name, kind, start_time, end_time
            ├── attributes[]
            ├── events[]
            ├── links[]
            └── status
```

The same nesting pattern (`Resource` → `Scope` → data points) applies to `ResourceMetrics` and `ResourceLogs`.

### 2.5 Resource Attribution

Every signal is tagged with a **Resource** — metadata describing the entity producing telemetry. Setting this correctly is one of the highest-leverage things a platform team can standardize.

```javascript
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'checkout-service',
  [ATTR_SERVICE_VERSION]: process.env.APP_VERSION,
  'deployment.environment': process.env.NODE_ENV,
  'cloud.provider': 'aws',
  'cloud.platform': 'aws_eks',
  'k8s.cluster.name': process.env.CLUSTER_NAME,
  'k8s.namespace.name': process.env.K8S_NAMESPACE,
  'k8s.pod.name': process.env.HOSTNAME,
});
```

**Best practice:** standardize a minimum resource attribute set org-wide (`service.name`, `service.version`, `deployment.environment`, `service.namespace`/team, cloud/k8s attributes) and enforce it via a shared instrumentation library or Collector-side `resource`/`resourcedetection` processor, rather than leaving it to each team.

### 2.6 Context Propagation

For a trace to span multiple services, trace context (trace ID, span ID, sampling decision) must travel with the request — typically as HTTP headers.

- **W3C Trace Context** (`traceparent`, `tracestate`) is the OTel default and the emerging cross-vendor standard. Format: `traceparent: 00-<trace-id>-<span-id>-<flags>`.
- **W3C Baggage** (`baggage` header) propagates arbitrary key/value context (e.g., `user.tier=premium`) alongside trace context, for use in sampling decisions or attribute enrichment downstream.
- Legacy formats — B3 (Zipkin), Datadog's `x-datadog-trace-id` headers — can still be used but require explicit propagator configuration, and mixing formats across a system is a common source of "broken" (unlinked) traces.

```javascript
const { propagation } = require('@opentelemetry/api');
const { W3CTraceContextPropagator } = require('@opentelemetry/core');

propagation.setGlobalPropagator(new W3CTraceContextPropagator());
```

**Best practice:** Standardize on W3C Trace Context org-wide. If integrating with legacy Datadog-instrumented services, configure the Collector's `datadog` receiver/connector to translate between formats rather than running dual-propagator chaos in every service.

### 2.7 The OpenTelemetry Collector

The Collector is a standalone, horizontally scalable process that decouples instrumentation from backend choice. It is configured via YAML pipelines composed of three stages.

#### 2.7.1 Receivers

Ingest data. Common receivers:

- `otlp` — accepts OTLP grpc/http (the primary receiver for app telemetry).
- `prometheus` — scrapes Prometheus-format `/metrics` endpoints.
- `filelog` — tails log files (used heavily in Kubernetes DaemonSet deployments to read `/var/log/pods`).
- `hostmetrics` — collects CPU/memory/disk/network stats from the host.
- `k8s_cluster` / `kubeletstats` — Kubernetes object and node/pod resource metrics.
- `jaeger`, `zipkin` — legacy trace format ingestion for gradual migration.

#### 2.7.2 Processors

Transform, filter, enrich, or batch data before export. Common processors:

- `batch` — groups telemetry into batches before export (always include this — exporting one item at a time is extremely inefficient).
- `memory_limiter` — protects the Collector process from OOM by shedding load under memory pressure. Should be the *first* processor in every pipeline.
- `resource` / `resourcedetection` — add or auto-detect resource attributes (cloud provider, k8s metadata, host info).
- `attributes` — add, delete, rename, or hash span/log/metric attributes (commonly used for PII scrubbing).
- `filter` — drop telemetry matching a condition (e.g., drop health-check spans).
- `tail_sampling` — makes sampling decisions after a full trace is assembled, enabling "keep all errors, sample the rest" strategies.
- `probabilistic_sampler` — simple head-based sampling.
- `transform` (OTTL — OpenTelemetry Transformation Language) — powerful, SQL-like syntax for arbitrary telemetry transformation.

#### 2.7.3 Exporters

Send data onward:

- `otlp` / `otlphttp` — forward to another OTLP-compatible backend (Grafana Tempo/Mimir/Loki, Datadog, Honeycomb, etc.).
- `datadog` — native Datadog exporter that also computes APM trace metrics.
- `prometheusremotewrite` — push metrics to Mimir/Cortex/Prometheus remote-write receivers.
- `loki` — push logs to Grafana Loki.
- `debug` — logs telemetry to Collector stdout, invaluable for local development/troubleshooting.

#### 2.7.4 Full Example: Production Gateway Collector Config

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        max_recv_msg_size_mib: 32
      http:
        endpoint: 0.0.0.0:4318
        cors:
          allowed_origins:
            - "https://app.example.com"

  prometheus:
    config:
      scrape_configs:
        - job_name: 'collector-self-metrics'
          scrape_interval: 30s
          static_configs:
            - targets: ['0.0.0.0:8888']

processors:
  memory_limiter:
    check_interval: 1s
    limit_percentage: 80
    spike_limit_percentage: 25

  resourcedetection:
    detectors: [env, eks, ec2]
    timeout: 5s

  attributes/scrub-pii:
    actions:
      - key: user.email
        action: delete
      - key: http.request.header.authorization
        action: delete
      - key: credit_card
        action: hash

  transform/normalize:
    trace_statements:
      - context: span
        statements:
          - set(attributes["http.route"], attributes["http.target"]) where attributes["http.route"] == nil

  tail_sampling:
    decision_wait: 10s
    num_traces: 100000
    policies:
      - name: keep-errors
        type: status_code
        status_code: { status_codes: [ERROR] }
      - name: keep-slow
        type: latency
        latency: { threshold_ms: 1000 }
      - name: sample-rest
        type: probabilistic
        probabilistic: { sampling_percentage: 10 }

  batch:
    send_batch_size: 8192
    timeout: 5s

exporters:
  otlphttp/datadog:
    endpoint: "https://otlp-http-intake.logs.datadoghq.com"
    headers:
      "dd-api-key": "${env:DD_API_KEY}"

  otlp/tempo:
    endpoint: "tempo-distributor.observability.svc:4317"
    tls:
      insecure: true

  prometheusremotewrite/mimir:
    endpoint: "http://mimir-nginx.observability.svc/api/v1/push"

  loki:
    endpoint: "http://loki-gateway.observability.svc/loki/api/v1/push"

  debug:
    verbosity: basic
    sampling_initial: 5
    sampling_thereafter: 200

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  telemetry:
    metrics:
      level: detailed
      address: 0.0.0.0:8888
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, resourcedetection, attributes/scrub-pii, transform/normalize, tail_sampling, batch]
      exporters: [otlphttp/datadog, otlp/tempo]
    metrics:
      receivers: [otlp, prometheus]
      processors: [memory_limiter, resourcedetection, batch]
      exporters: [prometheusremotewrite/mimir]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, resourcedetection, attributes/scrub-pii, batch]
      exporters: [loki]
```

### 2.8 Sampling Strategies Explained

| Strategy | How it works | Pros | Cons |
|---|---|---|---|
| Head-based (probabilistic) | Decision made at trace start, propagated via sampling flag | Cheap, simple, low collector memory | May drop rare errors/slow traces entirely |
| Tail-based | Decision made after full trace assembles | Keeps 100% of interesting traces (errors, high latency) | Requires all spans to reach the same Collector instance (needs gateway + consistent routing), higher memory/buffering cost |
| Rate limiting | Cap traces/sec regardless of content | Predictable cost | Can drop signal during incidents (worst possible time) |
| Consistent probability sampling (new W3C spec) | Sampling decision embedded in trace context so downstream services agree without needing a stateful gateway | Scales well, avoids partial traces | Newer, less universally supported yet |

**Best practice:** Use tail-based sampling with a policy hierarchy: always keep errors, always keep traces above a latency threshold, then probabilistically sample the remainder (typically 1-20% depending on traffic volume and budget). Route all spans for a given trace to the same Collector pod using a load balancer with consistent hashing on trace ID (the `loadbalancing` exporter + a load-balancing Collector tier).

### 2.9 Semantic Conventions

OTel defines standardized attribute names so telemetry is comparable across languages/vendors. Examples:

| Domain | Attributes |
|---|---|
| HTTP | `http.request.method`, `http.response.status_code`, `http.route`, `url.full` |
| Database | `db.system`, `db.name`, `db.statement`, `db.operation` |
| Messaging | `messaging.system`, `messaging.destination.name`, `messaging.operation` |
| Kubernetes | `k8s.pod.name`, `k8s.namespace.name`, `k8s.deployment.name` |
| Cloud | `cloud.provider`, `cloud.region`, `cloud.availability_zone` |
| Exceptions | `exception.type`, `exception.message`, `exception.stacktrace` |

**Best practice:** Never invent a custom attribute name for a concept that already has a semantic convention. Doing so breaks auto-generated dashboards, service maps, and cross-vendor portability.

### 2.10 OTel Best Practices Summary

1. **Instrument at the framework level first** using auto-instrumentation before hand-rolling spans — it's lower effort and standards-compliant by default.
2. **Always run a Collector**, even if you only have one backend today — it decouples app code from backend choice and gives you a single place to implement sampling, scrubbing, and enrichment.
3. **Put `memory_limiter` first** in every pipeline to protect against OOM kills under load spikes.
4. **Use `batch` processor everywhere** — never export unbatched in production.
5. **Scrub PII at the Collector**, not hoping app developers remember to do it in every service.
6. **Standardize resource attributes** via a shared library or `resourcedetection` processor.
7. **Version your Collector config** in git and deploy it like any other production service (canary, rollback, monitoring the Collector itself).
8. **Monitor the Collector's own health** — enable `telemetry.metrics` and alert on `otelcol_processor_dropped_spans`, `otelcol_exporter_send_failed_spans`, and queue/memory saturation.
9. **Use tail sampling for traces** in high-volume services; head-based sampling alone will silently lose your most valuable error traces.
10. **Avoid attribute cardinality explosions** — never put user IDs, session IDs, or free-text into metric labels; those belong in span/log attributes only.

---

## 3. Datadog

### 3.1 Overview

Datadog is a commercial, unified SaaS observability platform combining infrastructure monitoring, APM, log management, RUM, synthetics, and security monitoring under one tagging and correlation model.

### 3.2 Ingestion Architecture

```
┌───────────────────────────────────────────────────────────┐
│  Application / Host / Container                             │
│                                                               │
│  Option A: Datadog Tracer Library (ddtrace)                  │
│  Option B: OpenTelemetry SDK ──► OTLP ──► Datadog Agent/DD   │
│                                            Exporter           │
└───────────────────────┬───────────────────────────────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │   Datadog Agent        │  (DaemonSet in K8s)
             │  - APM trace-agent     │
             │  - Log-agent           │
             │  - Process-agent       │
             │  - OTLP ingest endpoint│
             └───────────┬────────────┘
                         │ HTTPS
                         ▼
             ┌───────────────────────┐
             │   Datadog SaaS Intake  │
             │  (APM / Logs / Metrics │
             │   / RUM / Synthetics)  │
             └───────────────────────┘
```

Three main paths into Datadog:

1. **Datadog-native tracer libraries** (`dd-trace-java`, `dd-trace-js`, `ddtrace` for Python, etc.) — deepest integration, automatic APM stats computation, but vendor-specific instrumentation.
2. **OpenTelemetry → Datadog Agent OTLP ingest** — app teams instrument with OTel, the local Datadog Agent (running as a DaemonSet) exposes an OTLP receiver and converts to Datadog's internal format.
3. **OpenTelemetry → Collector `datadog` exporter → Datadog intake directly** — bypasses the Agent entirely; useful for serverless or environments where running an Agent isn't practical.

### 3.3 Key Products

#### 3.3.1 APM (Application Performance Monitoring)

- **Service Catalog** — auto-discovered inventory of services, ownership, dependencies, SLOs.
- **Service Map** — auto-generated topology graph from trace data showing real-time call relationships.
- **Trace Explorer / Flame Graphs** — per-request waterfall view of spans.
- **Trace Metrics** — Datadog computes request/error/duration metrics directly from spans (no separate metric instrumentation required), enabling monitors on `trace.<service>.request` etc.
- **Deployment Tracking** — correlates version tags with APM metrics to auto-detect regressions after a release.
- **Error Tracking** — groups exceptions across traces into issues with occurrence counts and first/last seen.

#### 3.3.2 Infrastructure Monitoring

- Host, container, and Kubernetes-level metrics collected by the Agent's `process-agent` and integrations (250+ built-in integrations for databases, message queues, cloud services).
- **Live Containers** view — real-time container resource usage.
- **Kubernetes Explorer** — cluster/namespace/workload health, resource requests vs. actual usage, autoscaling status.

#### 3.3.3 Log Management

- Centralized log ingestion with automatic **trace_id correlation** (a log line emitted during a traced request is automatically linked to that trace, and vice versa).
- **Log Pipelines** — parsing rules (grok patterns) applied at ingest to structure unstructured logs.
- **Indexed vs. Logging without Limits** — logs can be ingested (and briefly retained/searchable) without being fully indexed, decoupling ingestion cost from indexing/retention cost.

#### 3.3.4 RUM (Real User Monitoring)

Covered in depth in [Section 6.5](#65-datadog-rum).

#### 3.3.5 Synthetics

Scripted uptime checks (API tests) and browser tests (multi-step user flows) run from global locations on a schedule, independent of real user traffic — useful for catching regressions before users do and for validating SLAs on low-traffic endpoints.

#### 3.3.6 Watchdog

Automated, unsupervised anomaly detection across APM and infrastructure metrics — surfaces anomalies without requiring pre-configured thresholds, useful for catching "unknown unknowns."

#### 3.3.7 Cloud SIEM

Correlates logs against detection rules for security event monitoring (e.g., anomalous IAM activity, brute-force patterns) — relevant if Datadog is also the security-observability platform.

### 3.4 Kubernetes/EKS Deployment

#### 3.4.1 Helm Installation

```bash
helm repo add datadog https://helm.datadoghq.com
helm repo update

helm install datadog-agent datadog/datadog \
  -f datadog-values.yaml \
  --namespace observability \
  --create-namespace
```

#### 3.4.2 Full `datadog-values.yaml` Example

```yaml
datadog:
  apiKeyExistingSecret: datadog-api-key
  appKeyExistingSecret: datadog-app-key
  site: datadoghq.com
  clusterName: prod-use1-eks

  logs:
    enabled: true
    containerCollectAll: true
    containerCollectUsingFiles: true

  apm:
    portEnabled: true
    socketEnabled: true

  processAgent:
    enabled: true
    processCollection: true

  orchestratorExplorer:
    enabled: true

  networkMonitoring:
    enabled: true

  otlp:
    receiver:
      protocols:
        grpc:
          enabled: true
          endpoint: 0.0.0.0:4317
        http:
          enabled: true
          endpoint: 0.0.0.0:4318

  tags:
    - "team:platform"
    - "cost-center:eng-infra"

clusterAgent:
  enabled: true
  replicas: 2
  metricsProvider:
    enabled: true          # enables DatadogMetric CRD for HPA
  admissionController:
    enabled: true           # auto-injects tracer libraries via mutating webhook
    mutateUnlabelled: false

clusterChecksEnabled: true

agents:
  containers:
    agent:
      resources:
        requests: { cpu: 200m, memory: 256Mi }
        limits: { cpu: 500m, memory: 512Mi }
    traceAgent:
      resources:
        requests: { cpu: 100m, memory: 128Mi }
```

#### 3.4.3 Admission Controller Auto-Instrumentation

Datadog's Cluster Agent admission controller can auto-inject tracer libraries into pods without code changes, similar in spirit to the OTel Operator:

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    admission.datadoghq.com/enabled: "true"
  annotations:
    admission.datadoghq.com/java-lib.version: "latest"
```

### 3.5 Unified Service Tagging

Datadog's correlation model depends on three tags being set consistently across every telemetry source (APM, logs, infra metrics, RUM):

```
env:production
service:checkout-api
version:1.4.2
```

Set via environment variables so all instrumentation paths agree:

```yaml
env:
  - name: DD_ENV
    value: "production"
  - name: DD_SERVICE
    value: "checkout-api"
  - name: DD_VERSION
    value: "1.4.2"
```

**Why this matters:** without matching `env`/`service`/`version` tags, Datadog cannot auto-link a trace to its logs, or a deployment marker to its APM regression — the entire "click to pivot" experience depends on this convention being followed exactly.

### 3.6 Monitors, SLOs, and Dashboards

#### 3.6.1 Monitor Types

| Type | Use case |
|---|---|
| Metric threshold | Simple static threshold alert |
| Anomaly | Learns a baseline, alerts on deviation |
| Outlier | Flags a single host/pod behaving differently than its peers |
| Forecast | Predicts future breach of a threshold (e.g., disk will fill in 6 hours) |
| Composite | Combines multiple monitors with boolean logic (reduces alert noise) |
| APM trace analytics | Alerts on trace-derived metrics (error rate, p99 latency per service/resource) |
| Log alert | Alerts on log query rate/pattern |
| Process monitor | Alerts if an expected process isn't running |

Example monitor definition (Terraform):

```hcl
resource "datadog_monitor" "checkout_error_rate" {
  name    = "[checkout-api] Error rate above SLO threshold"
  type    = "metric alert"
  message = <<-EOT
    {{#is_alert}}
    Checkout API error rate exceeded 2% for 5 minutes.
    Runbook: https://wiki.example.com/runbooks/checkout-errors
    @pagerduty-checkout-team
    {{/is_alert}}
    {{#is_recovery}}
    Checkout API error rate back to normal.
    {{/is_recovery}}
  EOT

  query = <<-EOT
    sum(last_5m):sum:trace.express.request.errors{env:production,service:checkout-api}.as_count() /
    sum:trace.express.request.hits{env:production,service:checkout-api}.as_count() > 0.02
  EOT

  monitor_thresholds {
    critical = 0.02
    warning  = 0.01
  }

  notify_no_data    = true
  no_data_timeframe = 10
  tags              = ["team:checkout", "env:production"]
}
```

#### 3.6.2 SLOs

```hcl
resource "datadog_service_level_objective" "checkout_availability" {
  name        = "Checkout API Availability"
  type        = "metric"
  description = "99.9% of checkout requests should succeed over 30 days"

  query {
    numerator   = "sum:trace.express.request.hits{env:production,service:checkout-api,!http.status_code:5*}.as_count()"
    denominator = "sum:trace.express.request.hits{env:production,service:checkout-api}.as_count()"
  }

  thresholds {
    timeframe = "30d"
    target    = 99.9
    warning   = 99.95
  }

  tags = ["team:checkout"]
}
```

SLO error budgets should drive burn-rate alerts (fast burn = page immediately, slow burn = ticket for next sprint) rather than a single static threshold.

#### 3.6.3 Dashboards

- Use **template variables** (`$env`, `$service`) so one dashboard definition works across every service/environment rather than hand-building N dashboards.
- Prefer **Notebooks** for incident postmortems (freeform, timestamped, shareable) and **Dashboards** for steady-state monitoring.
- Manage dashboards as code (Terraform provider or `dashboard-as-code` JSON) so they're versioned and reviewable.

### 3.7 Cost Management

Datadog billing scales primarily with hosts, indexed logs volume, custom metrics cardinality, and APM ingested/indexed spans. Key levers:

1. **Log exclusion filters** — drop noisy debug/health-check logs before indexing.
2. **Log-based metrics** — extract a metric from a log pattern instead of retaining/indexing every matching log line long-term.
3. **APM ingestion vs. retention filters** — ingest all spans for trace-metric computation, but only *retain* (index) a sampled/filtered subset for search — keep 100% of errors, sample the rest.
4. **Custom metric governance** — audit high-cardinality custom metrics regularly (`metrics summary` page); bound label cardinality at the instrumentation layer.
5. **Right-size Agent resource requests** to avoid paying for over-provisioned infra-monitoring hosts.

### 3.8 Datadog Best Practices Summary

1. Enforce Unified Service Tagging (`env`, `service`, `version`) via CI/CD templates, not tribal knowledge.
2. Prefer the admission controller / OTel Operator for auto-instrumentation over manual per-service wiring.
3. Build monitors around SLOs and error budgets, not arbitrary thresholds.
4. Use composite monitors to reduce page fatigue from correlated failures.
5. Manage dashboards, monitors, and SLOs as code (Terraform) — review and version them like application code.
6. Regularly audit custom metric and log volume for cost — cardinality creep is the #1 unplanned cost driver.
7. Use Deployment Tracking to catch regressions automatically tied to specific releases.
8. Route different monitor severities to different notification channels (warning → Slack, critical → PagerDuty).

---

## 4. Grafana Stack (LGTM)

### 4.1 Overview

The Grafana "LGTM" stack — **L**oki, **G**rafana, **T**empo, **M**imir — is an open-source-first (with optional Grafana Cloud/Enterprise hosting) observability stack built around Prometheus-compatible APIs and OTLP-native ingestion.

### 4.2 Component Deep Dive

#### 4.2.1 Grafana

The visualization and alerting layer. Connects to any number of data sources (Mimir, Loki, Tempo, Prometheus, CloudWatch, Datadog, SQL databases, etc.) via a plugin architecture. Also provides:
- Unified alerting engine (evaluates queries directly, no separate Alertmanager required though it's still supported).
- Dashboards-as-code via JSON model or `grafonnet`/`jsonnet` libraries.
- **Explore** mode for ad hoc querying across data sources without building a dashboard.
- **Correlations** feature for defining clickable links between data sources (e.g., metric → trace).

#### 4.2.2 Mimir

Horizontally scalable, long-term storage for Prometheus metrics. Fully compatible with PromQL and the Prometheus remote-write API, meaning existing Prometheus deployments can remote-write into Mimir without changing dashboards or alert rules. Uses object storage (S3) for durability and near-infinite retention at low cost, with a separately scalable ingest/query path.

#### 4.2.3 Loki

Log aggregation system that indexes only **labels** (not full log text), making it dramatically cheaper to operate at scale than full-text-indexed systems. Query language is **LogQL**, which is deliberately similar to PromQL:

```logql
{namespace="checkout", app="checkout-api"} |= "ERROR" | json | duration_ms > 500
```

#### 4.2.4 Tempo

Object-storage-backed distributed tracing backend. Like Loki, it avoids a heavy indexing layer — traces are found primarily via trace ID lookup or via **TraceQL**, a query language for filtering traces by span attributes:

```traceql
{ span.http.status_code = 500 && span.service.name = "checkout-api" && duration > 800ms }
```

#### 4.2.5 Grafana Alloy

The unified telemetry collector — successor to "Grafana Agent" — built on the OpenTelemetry Collector's component model but with Grafana-specific conveniences. Speaks OTLP in, and can fan out to Mimir (remote-write), Loki (push), Tempo (OTLP), and Pyroscope (profiles).

#### 4.2.6 Pyroscope

Continuous profiling backend — captures CPU/memory/allocation profiles from running services on an ongoing basis, correlatable with traces via exemplars, letting you jump from "this span is slow" to "here's the exact function eating the CPU during that time window."

### 4.3 Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│  Application (OTel SDK) ──OTLP──► Grafana Alloy (DaemonSet)     │
└─────────────────────────────────────┬───────────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
      ┌───────────────┐       ┌───────────────┐       ┌────────────────┐
      │ Mimir           │       │ Loki           │       │ Tempo            │
      │ (remote-write)  │       │ (push)         │       │ (OTLP)           │
      │ metrics ─ S3    │       │ logs ─ S3      │       │ traces ─ S3      │
      └───────┬────────┘       └───────┬────────┘       └────────┬────────┘
              │                        │                          │
              └───────────┬────────────┴───────────┬─────────────┘
                          ▼                        ▼
                  ┌──────────────────────────────────────┐
                  │              Grafana                    │
                  │  Dashboards / Explore / Alerting /      │
                  │  Correlations (exemplars & derived      │
                  │  fields link metric↔trace↔log)          │
                  └──────────────────────────────────────┘
```

### 4.4 Correlated Signals — the Core Value Proposition

#### 4.4.1 Exemplars

A Prometheus/Mimir histogram sample can carry an attached `trace_id`. When you hover a latency spike on a Grafana panel, an exemplar dot lets you jump straight into the corresponding Tempo trace. Requires the app to expose exemplars (most OTel Prometheus exporters do this automatically for histograms) and Mimir/Prometheus to be configured with `--enable-feature=exemplar-storage`.

#### 4.4.2 Derived Fields (Loki → Tempo)

Grafana can regex-extract a `trace_id` from a log line and render it as a clickable link:

```json
{
  "derivedFields": [
    {
      "matcherRegex": "trace_id=(\\w+)",
      "name": "TraceID",
      "url": "$${__value.raw}",
      "datasourceUid": "tempo-datasource-uid"
    }
  ]
}
```

#### 4.4.3 TraceQL → Logs/Metrics

Tempo can be configured with a `traceql` link that queries Loki for logs sharing the same `trace_id`, and Mimir for span-derived metrics — completing the "any signal to any signal" loop.

### 4.5 Grafana Alloy Configuration Example

```river
// Receive OTLP from applications
otelcol.receiver.otlp "default" {
  grpc {
    endpoint = "0.0.0.0:4317"
  }
  http {
    endpoint = "0.0.0.0:4318"
  }
  output {
    traces  = [otelcol.processor.batch.default.input]
    metrics = [otelcol.processor.batch.default.input]
    logs    = [otelcol.processor.batch.default.input]
  }
}

otelcol.processor.batch "default" {
  output {
    traces  = [otelcol.exporter.otlp.tempo.input]
    metrics = [otelcol.exporter.prometheus.mimir.input]
    logs    = [otelcol.exporter.loki.loki.input]
  }
}

otelcol.exporter.otlp "tempo" {
  client {
    endpoint = "tempo-distributor.observability.svc:4317"
    tls { insecure = true }
  }
}

otelcol.exporter.prometheus "mimir" {
  forward_to = [prometheus.remote_write.mimir.receiver]
}

prometheus.remote_write "mimir" {
  endpoint {
    url = "http://mimir-nginx.observability.svc/api/v1/push"
  }
}

otelcol.exporter.loki "loki" {
  forward_to = [loki.write.default.receiver]
}

loki.write "default" {
  endpoint {
    url = "http://loki-gateway.observability.svc/loki/api/v1/push"
  }
}

// Node-level metrics (run as DaemonSet)
prometheus.exporter.unix "node" {}

prometheus.scrape "node" {
  targets    = prometheus.exporter.unix.node.targets
  forward_to = [prometheus.remote_write.mimir.receiver]
}
```

### 4.6 Grafana Unified Alerting

```yaml
apiVersion: 1
groups:
  - orgId: 1
    name: checkout-service-alerts
    folder: Checkout Team
    interval: 1m
    rules:
      - uid: checkout-high-error-rate
        title: Checkout error rate > 2%
        condition: C
        data:
          - refId: A
            datasourceUid: mimir-datasource-uid
            model:
              expr: |
                sum(rate(http_server_request_duration_seconds_count{service="checkout-api",http_response_status_code=~"5.."}[5m]))
                /
                sum(rate(http_server_request_duration_seconds_count{service="checkout-api"}[5m]))
          - refId: C
            datasourceUid: "__expr__"
            model:
              type: threshold
              expression: A
              conditions:
                - evaluator: { type: gt, params: [0.02] }
        for: 5m
        labels:
          severity: critical
          team: checkout
        annotations:
          summary: "Checkout API error rate above 2% for 5 minutes"
          runbook_url: "https://wiki.example.com/runbooks/checkout-errors"
```

Notification routing uses label-matching trees (same concept as Prometheus Alertmanager):

```yaml
route:
  receiver: default-slack
  group_by: [alertname, team]
  routes:
    - matchers: [severity="critical"]
      receiver: pagerduty-oncall
      continue: true
    - matchers: [team="checkout"]
      receiver: checkout-team-slack
```

### 4.7 Storage & Multi-Tenancy

- Mimir and Loki both separate the write/ingest path from long-term object storage (S3/GCS/Azure Blob), with a compactor process periodically merging/compacting blocks — this is what enables cheap, near-infinite retention compared to raw Prometheus TSDB (which is local-disk-bound).
- Multi-tenancy is native via the `X-Scope-OrgID` header, letting a single Mimir/Loki/Tempo deployment serve multiple teams/environments with isolated data and independent rate limits — useful for a platform team running shared infrastructure for many product teams.
- Ring-based architecture (using a distributed hash ring, typically backed by `memberlist` or etcd/consul) allows ingesters/queriers/compactors to scale horizontally and rebalance automatically.

### 4.8 Grafana Stack Best Practices Summary

1. Standardize on OTLP ingestion via Alloy rather than mixing raw Prometheus scrape configs, Promtail, and OTel Collector configs across teams.
2. Enable exemplars end-to-end (app → Alloy → Mimir → Grafana panel) — this single feature is what makes metric dashboards actionable rather than just informative.
3. Keep Loki labels low-cardinality (`namespace`, `app`, `level`) — never put request IDs or user IDs in Loki labels; use LogQL's `| json` line filtering for high-cardinality search instead.
4. Use TraceQL span-level filtering instead of relying purely on trace ID lookup — this is what makes Tempo genuinely searchable at scale.
5. Deploy Mimir/Loki/Tempo in microservices mode (not monolithic mode) once ingest volume justifies it, for independent scaling of ingest vs. query paths.
6. Version dashboards as JSON/jsonnet in git; use folders and permissions aligned to team ownership.
7. Set per-tenant rate limits deliberately in a shared multi-tenant deployment to avoid one noisy team starving others.
8. Alert on the observability stack's own health (Alloy queue depth, Mimir ingester WAL replay time, Loki 5xx rate) — observability infra failing silently is worse than an unobserved app failing loudly.

---

## 5. EKS Application Observability

### 5.1 Layered Model

Observability on EKS spans four distinct layers, each requiring different collection strategies:

```
┌──────────────────────────────────────────────────────────┐
│ 1. AWS Control Plane                                        │
│    EKS API server, audit, authenticator, scheduler logs    │
│    → CloudWatch Logs (native EKS log export)                │
├──────────────────────────────────────────────────────────┤
│ 2. Node / Infra Layer                                       │
│    kubelet, container runtime (containerd), node resources │
│    → hostmetrics + kubeletstats receivers, node exporter    │
├──────────────────────────────────────────────────────────┤
│ 3. Workload Layer                                            │
│    Pod/container metrics, app traces/logs/metrics           │
│    → OTel auto-instrumentation, kube-state-metrics, cAdvisor│
├──────────────────────────────────────────────────────────┤
│ 4. Network Layer                                             │
│    CNI flow logs, service mesh telemetry (if applicable)     │
│    → VPC CNI metrics, Cilium Hubble, Istio/Envoy telemetry  │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Control Plane Observability

Enable EKS control plane logging selectively (all log types cost money to ship/store — enable only what you'll use):

```bash
aws eks update-cluster-config \
  --name prod-use1-eks \
  --logging '{"clusterLogging":[{"types":["api","audit","authenticator","controllerManager","scheduler"],"enabled":true}]}'
```

Ship these to your observability backend via a CloudWatch Logs subscription filter → Kinesis Firehose → S3/OTel Collector, or query directly in CloudWatch Logs Insights for ad hoc investigation.

### 5.3 Deployment Pattern: DaemonSet + Gateway

The standard, battle-tested pattern for collector deployment on EKS:

```
┌──────────────────────────────────────────────────────────────┐
│  Node 1                          Node 2                         │
│  ┌────────────┐                  ┌────────────┐                │
│  │ App Pod A  │──OTLP(localhost)─►│  DaemonSet │                │
│  │ App Pod B  │──OTLP(localhost)─►│  Collector │                │
│  └────────────┘                  │  (Agent)   │                │
│  hostmetrics, kubeletstats, ─────►│            │                │
│  filelog (/var/log/pods)         └─────┬──────┘                │
└─────────────────────────────────────────┼──────────────────────┘
                                           │ OTLP
                                           ▼
                        ┌──────────────────────────────┐
                        │  Gateway Deployment            │
                        │  (3+ replicas, HPA)            │
                        │  - tail sampling                │
                        │  - PII scrubbing                │
                        │  - routing to backends           │
                        └───────────────┬────────────────┘
                                        │
                            ┌────────────┴─────────────┐
                            ▼                           ▼
                        Datadog                   Grafana Stack
```

- **DaemonSet ("Agent") Collector** — one per node, handles local telemetry collection (host metrics, log tailing, receiving app OTLP over `localhost` for low latency), does minimal processing, forwards to the Gateway.
- **Gateway Collector** — a `Deployment` with multiple replicas behind a Service, handles the expensive/centralized work: tail sampling (needs full traces), PII scrubbing, routing/fan-out to multiple backends, and rate limiting. Scales independently of node count via HPA on CPU/queue depth.

### 5.4 DaemonSet Collector Manifest

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: otel-collector-agent
  namespace: observability
spec:
  selector:
    matchLabels: { app: otel-collector-agent }
  template:
    metadata:
      labels: { app: otel-collector-agent }
    spec:
      serviceAccountName: otel-collector
      containers:
        - name: otel-collector
          image: otel/opentelemetry-collector-contrib:0.108.0
          args: ["--config=/etc/otel/config.yaml"]
          env:
            - name: K8S_NODE_NAME
              valueFrom: { fieldRef: { fieldPath: spec.nodeName } }
          resources:
            requests: { cpu: 100m, memory: 200Mi }
            limits: { memory: 500Mi }
          volumeMounts:
            - name: config
              mountPath: /etc/otel
            - name: varlogpods
              mountPath: /var/log/pods
              readOnly: true
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
          ports:
            - containerPort: 4317
            - containerPort: 4318
      volumes:
        - name: config
          configMap: { name: otel-collector-agent-config }
        - name: varlogpods
          hostPath: { path: /var/log/pods }
        - name: varlibdockercontainers
          hostPath: { path: /var/lib/docker/containers }
```

DaemonSet Collector config excerpt (log tailing + host/kubelet metrics):

```yaml
receivers:
  filelog:
    include: [/var/log/pods/*/*/*.log]
    include_file_path: true
    operators:
      - type: container
      - type: json_parser
        parse_from: body

  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu: {}
      memory: {}
      disk: {}
      network: {}
      filesystem: {}

  kubeletstats:
    collection_interval: 30s
    auth_type: serviceAccount
    endpoint: "https://${env:K8S_NODE_NAME}:10250"
    insecure_skip_verify: true

  otlp:
    protocols:
      grpc: { endpoint: 0.0.0.0:4317 }
      http: { endpoint: 0.0.0.0:4318 }

processors:
  memory_limiter: { check_interval: 1s, limit_percentage: 80, spike_limit_percentage: 25 }
  k8sattributes:
    extract:
      metadata: [k8s.pod.name, k8s.namespace.name, k8s.deployment.name, k8s.node.name]
    pod_association:
      - sources: [{ from: resource_attribute, name: k8s.pod.ip }]
  batch: {}

exporters:
  otlp/gateway:
    endpoint: "otel-gateway.observability.svc:4317"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, k8sattributes, batch]
      exporters: [otlp/gateway]
    metrics:
      receivers: [otlp, hostmetrics, kubeletstats]
      processors: [memory_limiter, k8sattributes, batch]
      exporters: [otlp/gateway]
    logs:
      receivers: [filelog, otlp]
      processors: [memory_limiter, k8sattributes, batch]
      exporters: [otlp/gateway]
```

The `k8sattributes` processor is critical — it enriches telemetry with pod/namespace/deployment metadata by matching the source pod IP, so every span/log/metric is automatically tagged with its Kubernetes context without any app-side configuration.

### 5.5 Auto-Instrumentation via the OpenTelemetry Operator

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otel-gateway
  namespace: observability
spec:
  mode: deployment
  replicas: 3
  config: |
    receivers:
      otlp:
        protocols: { grpc: {}, http: {} }
    processors:
      batch: {}
      tail_sampling:
        policies:
          - name: errors
            type: status_code
            status_code: { status_codes: [ERROR] }
          - name: rest
            type: probabilistic
            probabilistic: { sampling_percentage: 10 }
    exporters:
      otlphttp/datadog:
        endpoint: "https://otlp-http-intake.logs.datadoghq.com"
      otlp/tempo:
        endpoint: "tempo-distributor.observability.svc:4317"
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [tail_sampling, batch]
          exporters: [otlphttp/datadog, otlp/tempo]
---
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: java-instrumentation
  namespace: checkout
spec:
  exporter:
    endpoint: http://otel-collector-agent.observability.svc:4318
  propagators: [tracecontext, baggage]
  sampler:
    type: parentbased_traceidratio
    argument: "1.0"
  java: {}
```

Enable injection on the workload with a pod annotation — no application code or Dockerfile changes required:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkout-api
  namespace: checkout
spec:
  template:
    metadata:
      annotations:
        instrumentation.opentelemetry.io/inject-java: "observability/java-instrumentation"
    spec:
      containers:
        - name: checkout-api
          image: 123456789.dkr.ecr.us-east-1.amazonaws.com/checkout-api:1.4.2
```

### 5.6 IAM & Networking

- **IRSA (IAM Roles for Service Accounts)** or the newer **EKS Pod Identity** should be used to grant Collector pods scoped permissions (e.g., `cloudwatch:PutMetricData`, `xray:PutTraceSegments`, S3 write for a Tempo/Loki/Mimir backing bucket) — never mount long-lived static AWS credentials.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector
  namespace: observability
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/otel-collector-role
```

- **Security groups / NetworkPolicies** must explicitly allow:
  - App pods → DaemonSet Collector on `4317`/`4318` (usually same-node, via `hostPort` or pod IP).
  - DaemonSet Collector → Gateway Collector Service on `4317`.
  - Gateway Collector → external backend (Datadog intake `443`, or Grafana Cloud endpoints `443`), routed through a NAT Gateway for private subnets, or a VPC Interface Endpoint/PrivateLink where the backend supports it (reduces NAT data-processing cost and improves security posture).

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-otlp-egress
  namespace: checkout
spec:
  podSelector: {}
  policyTypes: [Egress]
  egress:
    - to:
        - namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: observability } }
      ports:
        - { protocol: TCP, port: 4317 }
        - { protocol: TCP, port: 4318 }
```

### 5.7 Autoscaling on Observability Signals

#### 5.7.1 HPA on Custom Metrics (Prometheus/Mimir-backed)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: checkout-api-hpa
  namespace: checkout
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: checkout-api }
  minReplicas: 3
  maxReplicas: 30
  metrics:
    - type: Pods
      pods:
        metric: { name: http_server_active_requests }
        target: { type: AverageValue, averageValue: "50" }
```

Requires the `prometheus-adapter` (or Datadog's `DatadogMetric` CRD equivalent) to expose the custom metric to the Kubernetes metrics API.

#### 5.7.2 Datadog External Metrics

```yaml
apiVersion: datadoghq.com/v1alpha1
kind: DatadogMetric
metadata:
  name: checkout-queue-depth
spec:
  query: "avg:sqs.queue.depth{queue:checkout-orders}"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: checkout-worker-hpa
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: checkout-worker }
  minReplicas: 2
  maxReplicas: 50
  metrics:
    - type: External
      external:
        metric: { name: datadogmetric@default:checkout-queue-depth }
        target: { type: Value, value: "100" }
```

### 5.8 Golden Signals Dashboard Template (per service)

Every service in the cluster should expose a dashboard following the same structure so on-call engineers never have to relearn a layout mid-incident:

1. **Request rate** (by route/status code)
2. **Error rate** (%) with SLO burn-rate overlay
3. **Latency** — p50/p95/p99 as a heatmap or multi-line, never a bare average
4. **Saturation** — CPU/memory vs. requests/limits, pod restart count, HPA current/desired replicas
5. **Dependencies** — downstream call latency/error rate (DB, cache, external APIs)
6. **Recent deploys** — annotation markers correlating version changes with the above

### 5.9 EKS Observability Best Practices Summary

1. Split collection into DaemonSet (Agent) + Deployment (Gateway) tiers — never do tail sampling or heavy processing in the DaemonSet, it doesn't have visibility into all spans of a trace.
2. Use the `k8sattributes` processor so every signal is automatically enriched with pod/namespace/deployment metadata — don't rely on app code to set this manually.
3. Use the OpenTelemetry Operator (or vendor admission controller) for auto-instrumentation to minimize per-team instrumentation toil and keep versions consistent.
4. Grant Collector permissions via IRSA/Pod Identity, scoped to exactly what's needed — never broad `AdministratorAccess`.
5. Track Karpenter/Cluster Autoscaler behavior (pending-pod count, node provisioning latency) as first-class SLIs, not just CPU/memory.
6. Enable only the control-plane log types you actually use — `api` and `audit` logs especially can be very high volume.
7. Set resource requests/limits on Collector pods deliberately — an under-resourced DaemonSet Collector silently drops telemetry under load, exactly when you need it most.
8. Build one dashboard template and enforce it across all services (via a shared Terraform module or Grafana provisioning) so on-call context-switches cheaply between services during an incident.
9. Alert on collector health metrics themselves (`otelcol_exporter_send_failed_*`, queue saturation) as part of the platform team's own on-call rotation.

---

## 6. Frontend Observability

### 6.1 Why Frontend Observability Is a Distinct Discipline

Backend telemetry originates in a trusted, controlled environment (your own servers). Frontend telemetry originates in the browser or mobile app — an environment that is:

- **Untrusted** — a malicious or buggy client could send arbitrary/malformed telemetry.
- **High cardinality** — every user, device, browser version, and network condition is different.
- **Intermittently connected** — telemetry must be batched, retried, and tolerant of the client going offline mid-session.
- **Privacy-sensitive** — frontend telemetry captures real user behavior, often including PII, and is subject to consent/regulatory requirements (GDPR, CCPA).
- **Resource-constrained** — telemetry collection itself must not degrade the user experience it's trying to measure.

### 6.2 Core Signal Types

| Category | Examples | Why it matters |
|---|---|---|
| Core Web Vitals | LCP, INP, CLS | Google's standardized UX quality metrics; directly impact SEO ranking and correlate with conversion/bounce rates |
| Resource timing | Asset load time, API call duration (client-perceived) | Reveals network/CDN issues invisible to server-side metrics |
| JS errors | Uncaught exceptions, unhandled promise rejections | Directly impacts functional correctness for real users |
| Session/RUM | Page views, route changes, session replay | Reconstructs the actual user journey around a bug report |
| Custom business events | Cart abandonment, feature flag exposure, funnel steps | Connects technical telemetry to product/business outcomes |

### 6.3 Core Web Vitals Explained

- **LCP (Largest Contentful Paint)** — time until the largest visible element renders. Target: < 2.5s. Dominated by server response time, render-blocking resources, and image/font loading.
- **INP (Interaction to Next Paint)** — replaces the deprecated FID metric; measures responsiveness across *all* interactions during a page's lifetime, not just the first one. Target: < 200ms.
- **CLS (Cumulative Layout Shift)** — measures visual stability; unexpected layout shifts (e.g., an ad loading late and pushing content down). Target: < 0.1.

```javascript
import { onLCP, onINP, onCLS, onTTFB, onFCP } from 'web-vitals';

function sendToAnalytics(metric) {
  navigator.sendBeacon('/analytics/vitals', JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    navigationType: metric.navigationType,
  }));
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
onTTFB(sendToAnalytics);
onFCP(sendToAnalytics);
```

`navigator.sendBeacon` is preferred over `fetch` for telemetry that fires on page unload — it guarantees delivery without blocking navigation.

### 6.4 OpenTelemetry for Web

```javascript
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { resourceFromAttributes } from '@opentelemetry/resources';

const provider = new WebTracerProvider({
  resource: resourceFromAttributes({
    'service.name': 'web-storefront',
    'service.version': process.env.REACT_APP_VERSION,
    'deployment.environment': process.env.NODE_ENV,
  }),
  spanProcessors: [
    new BatchSpanProcessor(
      new OTLPTraceExporter({ url: 'https://otel-edge.example.com/v1/traces' })
    ),
  ],
});

provider.register({ propagator: new W3CTraceContextPropagator() });

registerInstrumentations({
  instrumentations: [
    new DocumentLoadInstrumentation(),
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: [/https:\/\/api\.example\.com/],
    }),
    new XMLHttpRequestInstrumentation({
      propagateTraceHeaderCorsUrls: [/https:\/\/api\.example\.com/],
    }),
  ],
});
```

Key notes:
- `otlp/http` is used (not grpc) because browsers can't send raw gRPC without a proxy translation layer.
- `propagateTraceHeaderCorsUrls` is required — by default, trace headers are stripped from cross-origin requests for security; this allowlist explicitly opts specific API origins into propagation, enabling the click → backend trace to connect.
- The exporter target is typically an edge/public-facing Collector endpoint behind a CDN/WAF, performing rate limiting before telemetry reaches internal infrastructure.

### 6.5 Datadog RUM

```javascript
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: '<APP_ID>',
  clientToken: '<CLIENT_TOKEN>',
  site: 'datadoghq.com',
  service: 'web-storefront',
  env: 'production',
  version: process.env.REACT_APP_VERSION,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
  allowedTracingUrls: [
    { match: 'https://api.example.com', propagatorTypes: ['tracecontext', 'datadog'] },
  ],
});

datadogRum.startSessionReplayRecording();

// Custom business event
datadogRum.addAction('checkout_completed', {
  cart_value: 129.99,
  item_count: 3,
});
```

`allowedTracingUrls` is the link between RUM sessions and backend APM traces — without it, frontend and backend telemetry remain siloed even if both are sent to the same Datadog org. Setting `propagatorTypes: ['tracecontext']` allows interop with OTel-instrumented backends.

### 6.6 Grafana Faro

```javascript
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

const faro = initializeFaro({
  url: 'https://faro-collector.example.com/collect',
  app: {
    name: 'web-storefront',
    version: process.env.REACT_APP_VERSION,
    environment: 'production',
  },
  instrumentations: [
    ...getWebInstrumentations({ captureConsole: true }),
    new TracingInstrumentation(),
  ],
});

faro.api.pushEvent('checkout_completed', { cartValue: '129.99', itemCount: '3' });
```

The Faro Web SDK exports OTLP to a dedicated **Faro Collector** (a thin wrapper around the OTel Collector tuned for browser ingestion — CORS handling, rate limiting), which then forwards traces to Tempo, logs to Loki, and metrics to Mimir, preserving the same correlation model used on the backend.

### 6.7 JS Error Tracking

Two categories must both be captured — most frameworks only catch one by default:

```javascript
window.addEventListener('error', (event) => {
  reportError({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  reportError({
    message: 'Unhandled promise rejection',
    reason: String(event.reason),
    stack: event.reason?.stack,
  });
});
```

**Source maps:** production JS is minified, so raw stack traces are useless without uploading source maps to your observability backend at build time (Datadog, Sentry, and Faro all support this) so stack traces resolve back to original source lines.

```bash
# Example: upload source maps to Datadog during CI build
datadog-ci sourcemaps upload ./build \
  --service=web-storefront \
  --release-version=$APP_VERSION \
  --minified-path-prefix=https://cdn.example.com/static/js
```

### 6.8 Session Replay

Session replay reconstructs a visual DOM-based recording of what the user actually saw/did — invaluable for reproducing hard-to-describe bugs. Because it's the most expensive telemetry type (both in storage and in privacy risk), it should:

- Be sampled far below 100% (typically 10-20%) unless investigating a specific issue.
- Default to input masking (`mask-user-input` or stricter) so form fields, especially payment/PII fields, are never recorded in plaintext.
- Be explicitly excluded from regions/consent states where it isn't legally permitted.

### 6.9 Privacy & Consent

- **PII scrubbing** — mask or strip emails, tokens, and free-text input before telemetry leaves the client; don't rely solely on backend-side scrubbing since data has already left the user's device by then.
- **Consent gating** — initialize RUM/telemetry SDKs only after consent-management state allows it, particularly under GDPR/CCPA. A common pattern:

```javascript
function initTelemetryIfConsented() {
  if (consentManager.hasConsent('analytics')) {
    datadogRum.init({ /* ... */ });
  }
}
consentManager.onConsentChange(initTelemetryIfConsented);
```

- **Data minimization** — don't send free-text form values, full URLs with query-string secrets, or unbounded user-generated content into telemetry payloads.

### 6.10 Frontend Observability Best Practices Summary

1. Capture Web Vitals at close to 100% sample rate — they're cheap and are your primary UX SLI; save aggressive sampling for expensive signals like session replay.
2. Always wire `allowedTracingUrls` / `propagateTraceHeaderCorsUrls` so frontend RUM sessions link to backend APM traces — this is the single highest-leverage frontend observability configuration.
3. Capture both `error` and `unhandledrejection` events — most teams forget the latter and silently lose telemetry on async failures.
4. Upload source maps on every deploy, tied to the exact release version, or stack traces are unreadable in production.
5. Default session replay to input-masked and low sample rate; treat it as an investigative tool, not an always-on firehose.
6. Gate telemetry initialization behind consent-management state where legally required.
7. Track resource timing per third-party origin (ads, tag managers, fonts) — they are a disproportionate source of INP/LCP regressions and are otherwise invisible in aggregate page metrics.
8. Annotate frontend dashboards with deploy markers so a Web Vitals regression can be traced to a specific release within seconds.
9. Treat the frontend telemetry ingestion endpoint as a public, adversarial-facing service — rate limit and validate payloads at the edge before they reach internal Collector infrastructure.

---

## 7. Reference Architecture

### 7.1 End-to-End Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│  Browser / Mobile Client                                              │
│  OTel Web SDK / Faro / Datadog RUM                                     │
│  - Web Vitals, JS errors, resource timing, session replay              │
└───────────────────────────────┬───────────────────────────────────┘
                                │ OTLP-HTTP (sampled, rate-limited)
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│  Edge / Public Ingestion Layer                                        │
│  CDN/WAF → Edge Collector (CORS handling, PII strip, rate limit)      │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│  EKS Cluster                                                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  App Namespaces                                                  │    │
│  │  Pods (OTel auto-instr. via Operator/Admission Controller)      │    │
│  │      │ OTLP grpc/http (localhost / same-node)                   │    │
│  └──────┼──────────────────────────────────────────────────────┘    │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  DaemonSet Collector (Agent) — per node                          │    │
│  │  + hostmetrics, kubeletstats, filelog, k8sattributes enrichment  │    │
│  └──────┬──────────────────────────────────────────────────────┘    │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Gateway Collector (Deployment, HPA)                              │    │
│  │  tail sampling, PII scrubbing, routing/fan-out                   │    │
│  └──────┬──────────────────────────────┬──────────────────────┘    │
└─────────┼──────────────────────────────┼───────────────────────────┘
          │                              │
          ▼                              ▼
┌───────────────────┐        ┌────────────────────────────┐
│      Datadog        │        │       Grafana Stack           │
│  APM / Logs / Infra  │        │  Tempo / Mimir / Loki via     │
│  RUM / Monitors/SLOs │        │  Alloy, Grafana dashboards    │
└───────────────────┘        └────────────────────────────┘
          │                              │
          └────────────┬─────────────────┘
                       ▼
          ┌─────────────────────────┐
          │  Alerting / On-Call       │
          │  PagerDuty / Slack /      │
          │  Incident Management      │
          └─────────────────────────┘
```

### 7.2 Design Principles Behind This Architecture

1. **Instrumentation is vendor-neutral (OTel), backend routing is centralized (Collector).** Application teams never hardcode a vendor SDK; the Collector config decides where telemetry goes, which can change without touching app code.
2. **Sampling decisions happen as late as possible.** Head sampling only where necessary (extremely high-volume, low-value paths); tail sampling in the Gateway tier for everything that matters.
3. **Enrichment happens once, centrally.** `k8sattributes`, `resourcedetection`, and PII scrubbing all happen in the Collector, not duplicated across every service's application code.
4. **Every layer degrades gracefully.** `memory_limiter` processors, bounded queues, and DaemonSet-local buffering ensure a telemetry backend outage doesn't cascade into application-level backpressure or crashes.
5. **Dual-backend is a deliberate transitional or redundancy pattern**, not a default — most orgs converge on one primary backend (Datadog *or* Grafana stack) for cost and operational simplicity, using the OTel Collector's flexibility mainly for migration or specific redundant-alerting use cases.

### 7.3 Environment Promotion Strategy

Observability configuration should be promoted through environments the same way application code is:

```
dev          → 100% sampling, short retention (7 days), verbose debug logging enabled
staging      → 50% sampling, medium retention (14 days), mirrors prod alert rules in "warn-only" mode
production   → tail sampling (errors + slow + 10% baseline), full retention per compliance policy, alerts page on-call
```

Collector configs, dashboard JSON, and alert rules should live in the same git repository as the infrastructure-as-code that provisions the cluster, promoted via the same PR/review/CI pipeline as any other production change.

### 7.4 Migration Path Example (Datadog-native → OTel-based)

For organizations migrating from vendor-native instrumentation to OTel:

1. **Phase 1** — Deploy OTel Collector alongside existing Datadog Agent; no app changes yet. Validate Collector health and connectivity.
2. **Phase 2** — Instrument *new* services with OTel SDKs exporting to the Collector, which forwards to Datadog via the `datadog` exporter. Existing services keep `ddtrace`.
3. **Phase 3** — Migrate existing services incrementally, service by service, starting with lowest-risk/lowest-traffic services. Validate trace continuity (parent/child linkage across mixed OTel/ddtrace services) at each step using the Collector's Datadog connector for cross-format propagation.
4. **Phase 4** — Once all services are OTel-instrumented, the backend becomes a pure Collector-config decision — evaluate whether to stay on Datadog, adopt the Grafana stack, or run both during an extended validation window before fully cutting over.

---

## 8. Cross-Cutting Best Practices

### 8.1 Instrumentation

- Prefer auto-instrumentation over hand-rolled spans; reserve manual instrumentation for business-meaningful spans (e.g., "process-payment") that auto-instrumentation can't infer.
- Standardize resource attributes (`service.name`, `service.version`, `deployment.environment`, team/cost-center) via a shared library, CI/CD template, or Collector-side enforcement — never leave this to individual engineer discretion.
- Treat instrumentation code review with the same rigor as business logic — a missing span or a high-cardinality attribute is a production incident waiting to happen.
- Name spans after the operation, not the implementation (`process-checkout`, not `CheckoutController.handlePost`) so names remain stable across refactors.
- Keep span attribute counts bounded per span (a handful of meaningful attributes, not dozens) — excessive per-span attributes bloat storage without proportional query value.

### 8.2 Sampling & Cost

- Model your telemetry cost curve before scaling instrumentation coverage — cost usually scales with (traffic × retention × cardinality), and cardinality is the variable most likely to spiral unnoticed.
- Always keep 100% of error and slow-trace signal; sample the "boring middle" of your traffic distribution.
- Review custom metric and log-index volume on a recurring cadence (monthly), not just when a bill spikes.
- Set a documented cardinality budget per team/service and enforce it via linting or Collector-side cardinality limiting processors where available.
- Prefer histograms over pre-aggregated percentiles at the client — percentiles don't average correctly across instances, but histogram buckets do.

### 8.3 Alerting

- Alert on symptoms (SLO burn rate, user-facing error rate) as the primary page-worthy signal; use cause-level alerts (CPU, disk) as supporting context in the same incident, not as separate pages.
- Every page-worthy alert should link to a runbook. An alert without a runbook is a future 3am Google search.
- Regularly prune alerts that haven't fired in 90+ days or that consistently get acknowledged without action — alert fatigue is a bigger risk to reliability than under-alerting.
- Use multi-window, multi-burn-rate alerting for SLOs (e.g., a fast 5m/1h window for urgent paging, a slower 6h/3d window for ticket-level follow-up) rather than one static threshold.
- Test alert routing regularly (synthetic "fire drill" alerts) so a broken PagerDuty integration is caught before a real incident.

### 8.4 Dashboards

- One canonical dashboard template per service type (API, worker, frontend) applied consistently, not bespoke dashboards per team.
- Every dashboard should answer "is this service healthy right now" within 5 seconds of opening it — golden signals at the top, drill-down detail below.
- Annotate dashboards with deploy events automatically (via CI/CD webhook) so regressions are visually obvious.
- Avoid dashboard sprawl — archive or consolidate dashboards nobody has viewed in the past quarter; stale dashboards erode trust in the ones that matter.
- Use consistent color conventions across all dashboards (e.g., red always means error, never "high is good" in one panel and "high is bad" in another).

### 8.5 Data Governance & Security

- PII scrubbing is a platform-level control (Collector processor, RUM SDK config), not an app-team-by-app-team hope.
- Telemetry backends are a security asset — API keys/tokens for ingestion should be scoped, rotated, and stored in a secrets manager, never hardcoded.
- Audit who has access to session replay and raw log data; both frequently contain sensitive information despite scrubbing efforts.
- Apply retention policies deliberately per data type — traces/logs often need shorter retention than metrics, and compliance requirements may mandate specific minimums/maximums per signal type or data classification.
- Encrypt telemetry in transit (TLS to all backends) and at rest (enabled by default on most managed backends; verify explicitly for self-hosted object storage).

### 8.6 Organizational Practices

- Observability is a platform capability with an owning team, but instrumentation quality is a shared responsibility of every service team — bake "add telemetry" into the definition of done for new services.
- Run periodic "game days" that intentionally break something and verify the observability stack surfaces it correctly, rather than assuming coverage is complete.
- Maintain a lightweight internal style guide for span naming, attribute naming, and log structure so telemetry stays queryable/consistent as the org scales.
- Track "time to detect" and "time to diagnose" as observability-program-level metrics, not just service-level SLOs — these are the two numbers that most directly reflect whether the observability investment is paying off.
- Include an observability review as a standard step in new-service launch checklists, alongside security and performance reviews.

---

## 9. Incident Response & Runbooks

### 9.1 The Role of Observability During an Incident

During an active incident, observability tooling should answer, in order:

1. **Is this real, and how bad is it?** (SLO burn rate, error rate, affected user %)
2. **What changed?** (deploy markers, config changes, infra events correlated on the same timeline)
3. **Where is the failure localized?** (service map / trace waterfall to find the failing hop)
4. **What's the blast radius?** (dependent services, affected regions/customers via trace/log filtering)

### 9.2 Example Investigation Flow

```
1. PagerDuty alert fires: "checkout-api error rate > 2% (SLO burn rate: fast)"
2. Open service dashboard → error rate spike correlates with a deploy marker at 14:02
3. Open APM Service Map → checkout-api → payment-service edge shows elevated latency
4. Open Trace Explorer, filter: service:payment-service status:error
5. Flame graph shows timeout calling external Stripe API
6. Pivot to correlated logs (trace_id auto-linked) → "connection pool exhausted"
7. Check payment-service dashboard → DB connection pool saturation graph confirms
8. Root cause: new deploy reduced pool size; roll back or hotfix config
9. Resolve, update runbook with this specific failure signature for faster future triage
```

### 9.3 Runbook Template

Every page-worthy alert should link to a runbook following a consistent structure:

```markdown
# Runbook: Checkout API Error Rate

## Symptom
Error rate for checkout-api exceeds 2% over a 5-minute window.

## Impact
Users cannot complete checkout; revenue-impacting.

## First Steps
1. Confirm the alert is real: [Checkout Service Dashboard](link)
2. Check for a recent deploy: [Deployment Tracking](link)
3. Check downstream dependency health: [Service Map](link)

## Common Causes & Fixes
- Recent deploy regression → roll back via [rollback procedure](link)
- Downstream payment provider outage → check [Stripe status page], enable fallback provider
- DB connection pool exhaustion → check [DB dashboard](link), consider scaling pool/replicas

## Escalation
If unresolved in 15 minutes, escalate to #checkout-oncall and @mention service owner.
```

### 9.4 Postmortem Data Collection

Use observability tooling to build a factual incident timeline:

- Export the relevant dashboard time range as a Notebook (Datadog) or dashboard snapshot (Grafana) at the time of the incident, before data ages out of high-resolution retention.
- Capture the specific trace IDs that exemplify the failure for inclusion in the postmortem doc.
- Record which alerts fired, when, and whether they fired promptly — this is itself a data point for improving detection time in the next iteration.
- Distinguish "detection time" (alert fired to acknowledged) from "diagnosis time" (acknowledged to root cause identified) from "mitigation time" (root cause to fix deployed) — each has different levers for improvement.

### 9.5 Blameless Postmortem Structure

```markdown
# Postmortem: Checkout API Elevated Error Rate — 2026-09-01

## Summary
15-minute partial outage of checkout functionality, ~8% of checkout attempts failed.

## Timeline (all times UTC)
- 14:02 — Deploy of checkout-api v1.4.2 completed
- 14:05 — Error rate SLO fast-burn alert fired, on-call paged
- 14:08 — On-call acknowledged, began investigation via Service Map
- 14:12 — Root cause identified: reduced DB connection pool size in new config
- 14:15 — Rollback initiated
- 14:17 — Error rate returned to baseline

## Root Cause
Config change reduced `payment-service` DB connection pool from 50 to 5 connections, unintentionally, via a misapplied Helm values override.

## Detection
Detected within 3 minutes via SLO burn-rate alert — worked as intended.

## Contributing Factors
- No staging load test exercised the reduced pool size before prod rollout.
- Helm values diff was not surfaced clearly in the deploy PR.

## Action Items
- [ ] Add automated Helm values diff comment to deploy PRs
- [ ] Add a pre-deploy synthetic load check against staging DB pool settings
- [ ] Add a dedicated `db.connection_pool.size` metric with a minimum-value alert
```

---

## 10. Appendix

### 10.1 Comparison: Datadog vs. Grafana Stack

| Dimension | Datadog | Grafana Stack (LGTM) |
|---|---|---|
| Deployment model | SaaS only | Self-hosted, Grafana Cloud (managed), or hybrid |
| Pricing model | Per-host + ingested/indexed volume | Infra cost (self-hosted) or usage-based (Grafana Cloud) |
| Setup effort | Low (Agent + Helm chart) | Higher (multiple components to operate, unless using Grafana Cloud) |
| Correlation model | Unified Service Tagging (env/service/version) | Exemplars + derived fields + TraceQL links |
| Query languages | Datadog query syntax (APM/Logs/Metrics each slightly different) | PromQL (Mimir), LogQL (Loki), TraceQL (Tempo) — consistent family |
| OTel-nativeness | OTLP ingest supported, but native tracers are deeper-integrated | Fully OTLP/OTel-native throughout |
| Best fit | Teams wanting an all-in-one managed platform with minimal ops overhead | Teams wanting open-source control, portability, or already invested in Prometheus/Grafana |

### 10.2 Common Pitfalls

| Pitfall | Consequence | Fix |
|---|---|---|
| High-cardinality metric labels (user ID, request ID) | Metrics backend cost/cardinality explosion, slow queries | Move high-cardinality data to logs/trace attributes |
| Missing `memory_limiter` in Collector pipeline | Collector OOM-kills under load spikes, telemetry loss exactly during incidents | Always place `memory_limiter` first in every pipeline |
| Mismatched `env`/`service`/`version` tags across signal types | Broken correlation, can't pivot from metric to trace to log | Enforce Unified Service Tagging / consistent Resource attributes via shared config |
| No tail sampling, only head sampling | Rare but critical error traces silently dropped | Add tail sampling policies for errors/high latency |
| Frontend telemetry with no `allowedTracingUrls`/CORS propagation config | Frontend and backend traces never link | Explicitly configure trace header propagation allowlists |
| Alerts with no runbook link | Slow incident response, tribal-knowledge dependency | Require a runbook link as part of alert creation policy |
| Session replay at 100% sample rate with no masking | Cost blowup + PII/privacy exposure | Sample low, mask inputs by default |
| Dashboards built ad hoc per team with no shared template | Slower on-call context switching across services | Enforce a canonical golden-signals dashboard template |
| Mixing propagation formats (W3C, B3, Datadog) without translation | Traces silently break at service boundaries | Standardize on W3C Trace Context, bridge legacy formats explicitly at the Collector |
| No ownership of the observability stack itself | Silent data loss goes unnoticed for weeks | Assign a platform team, alert on the stack's own health metrics |

### 10.3 Glossary

- **Cardinality** — the number of unique combinations of label/tag values a system must track.
- **Exemplar** — a specific trace ID attached to a metric data point, used to jump from an aggregate to a concrete example.
- **Head-based sampling** — sampling decision made when a trace starts, before its outcome is known.
- **Tail-based sampling** — sampling decision made after a trace completes, based on its full content (e.g., whether it contains an error).
- **OTLP** — OpenTelemetry Protocol, the wire format for transmitting telemetry.
- **Resource** — metadata describing the entity (service, host, pod) producing telemetry.
- **RED method** — Rate, Errors, Duration; a framework for service-level metrics.
- **RUM** — Real User Monitoring; telemetry captured from actual end-user sessions in a browser or mobile app.
- **Semantic conventions** — standardized attribute naming defined by OpenTelemetry for common telemetry concepts.
- **SLO** — Service Level Objective; a target reliability threshold (e.g., 99.9% availability) tracked against an error budget.
- **USE method** — Utilization, Saturation, Errors; a framework for resource-level metrics.
- **Burn rate** — the rate at which an error budget is being consumed relative to its allotted window; used to drive urgency-tiered alerting.
- **W3C Trace Context** — the standardized `traceparent`/`tracestate` HTTP header format for propagating trace identity across service boundaries.

### 10.4 Recommended Reading & References

- OpenTelemetry documentation: opentelemetry.io
- OpenTelemetry Collector Contrib repository (for the full list of receivers/processors/exporters)
- Datadog documentation: docs.datadoghq.com
- Grafana Labs documentation: grafana.com/docs
- Google SRE Book, Chapter 6 (Monitoring Distributed Systems) — origin of the Golden Signals framework
- web.dev/vitals — Core Web Vitals reference

### 10.5 Quick-Reference Port Table

| Port | Protocol | Purpose |
|---|---|---|
| 4317 | gRPC | OTLP trace/metric/log ingestion (primary) |
| 4318 | HTTP | OTLP trace/metric/log ingestion (browser/proxy-friendly) |
| 8888 | HTTP | OTel Collector self-telemetry (Prometheus scrape) |
| 13133 | HTTP | OTel Collector health check extension |
| 55679 | HTTP | OTel Collector zPages debug UI |
| 9090 | HTTP | Prometheus/Mimir query API (typical default) |
| 3100 | HTTP | Loki push/query API (typical default) |
| 3200 | HTTP | Tempo query API (typical default) |
| 3000 | HTTP | Grafana UI (typical default) |
| 10250 | HTTPS | Kubelet API (used by `kubeletstats` receiver) |

---

*This document is intended as a living reference. Update it as instrumentation standards, backend choices, or Kubernetes/EKS platform conventions evolve within the organization.*
