# Kubernetes Learning Notes — Part 4

**Covers:** 10) Storage, 11) Scaling, 12) Helm

---

## 10. Storage

### Stateless vs Stateful Applications
- **Stateless** — a Pod holds no important data of its own; any replica can handle any request, and losing/recreating a Pod loses nothing important (e.g., a web API that reads/writes everything to an external database). This is what most Deployments are built for.
- **Stateful** — a Pod (or its storage) holds data that matters and must survive restarts/rescheduling (e.g., a database, a message queue with unflushed data). These need persistent storage and often a stable identity (StatefulSets).

```
Stateless Pod:  destroy it → recreate it anywhere → no data lost, nothing to reconnect
Stateful Pod:   destroy it → must reattach the SAME storage volume → data must survive
```

### Ephemeral Storage
By default, a container's filesystem is **ephemeral** — it exists only for the container's lifetime. If the container restarts (even within the same Pod), its writable filesystem is reset to the image's original contents; anything written during runtime is gone.

### Container Filesystem
Each container gets its own filesystem, built from read-only image layers plus one thin writable layer on top. Writes go to that writable layer, which is destroyed when the container is removed — this is why databases should never just write to the plain container filesystem.

### emptyDir
A Pod-level volume type that exists only as long as the **Pod** does (survives individual *container* restarts within the Pod, but not Pod deletion/recreation). Useful for scratch space or sharing files between containers in the same Pod.

```yaml
spec:
  containers:
  - name: app
    volumeMounts:
    - name: cache
      mountPath: /cache
  - name: sidecar
    volumeMounts:
    - name: cache
      mountPath: /cache
  volumes:
  - name: cache
    emptyDir: {}
```
Both containers here see the *same* `/cache` directory — data written by one is instantly visible to the other, but disappears entirely if the Pod is deleted.

### PersistentVolume (PV)
A **PersistentVolume** is a cluster-level object representing an actual piece of real storage (an AWS EBS volume, an EFS filesystem, etc.) — it exists independently of any specific Pod's lifecycle, so data survives Pod deletion/recreation.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-example
spec:
  capacity:
    storage: 10Gi
  accessModes: ["ReadWriteOnce"]
  csi:
    driver: ebs.csi.aws.com
    volumeHandle: vol-0abc123456
```
In practice on EKS, PVs are usually **dynamically provisioned** for you (via a StorageClass) rather than hand-written like this.

### PersistentVolumeClaim (PVC)
A **PersistentVolumeClaim** is how a Pod actually *requests* storage — "I need 10Gi, ReadWriteOnce" — without knowing or caring about the underlying storage technology. Kubernetes binds the claim to a matching (or dynamically created) PersistentVolume.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: db-data
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 10Gi
  storageClassName: gp3
```
```yaml
# Pod using it:
spec:
  containers:
  - name: postgres
    volumeMounts:
    - name: data
      mountPath: /var/lib/postgresql/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: db-data
```

```
Pod ──uses──► PVC (claim: "I need 10Gi") ──binds to──► PV (actual EBS volume)
```

### StorageClass
Defines *how* storage should be dynamically provisioned when a PVC requests it — which provisioner/driver to use, what disk type/parameters, and the reclaim policy (what happens to the underlying volume when the PVC is deleted).

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
reclaimPolicy: Delete      # or "Retain" to keep the volume after PVC deletion
volumeBindingMode: WaitForFirstConsumer
```
`volumeBindingMode: WaitForFirstConsumer` delays actually provisioning the disk until a Pod using the PVC is scheduled — important so the disk gets created in the **same Availability Zone** as the Pod (EBS volumes are AZ-locked).

### EBS CSI Driver (basic understanding)
The **Container Storage Interface** driver that lets Kubernetes provision and attach **Amazon EBS** volumes as PersistentVolumes. EBS volumes are block storage, AZ-locked, and support `ReadWriteOnce` (one node at a time) — the standard choice for single-Pod-writer workloads like databases.

### EFS CSI Driver (basic understanding)
The CSI driver for **Amazon EFS** — a network filesystem that supports `ReadWriteMany` (many Pods, across many nodes/AZs, reading and writing concurrently). Slower than EBS per-operation but ideal when multiple Pods truly need to share the same files simultaneously (e.g., shared uploads directory across replicas).

| | EBS | EFS |
|---|---|---|
| Access mode | ReadWriteOnce (single node) | ReadWriteMany (many nodes) |
| AZ-bound? | Yes | No (works across AZs) |
| Typical use | Databases, single-writer workloads | Shared file storage across many Pods |
| Performance | Fast, block storage | Slower, network filesystem |

### StatefulSet Storage
When a StatefulSet defines a `volumeClaimTemplates` block, Kubernetes automatically creates a **separate PVC per replica**, each with a stable name tied to that replica's ordinal — so `pod-0` always reattaches to `pod-0`'s own volume, even after being rescheduled to a different node.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres-headless
  replicas: 3
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
```
This produces PVCs named `data-postgres-0`, `data-postgres-1`, `data-postgres-2` — each permanently associated with its respective Pod ordinal.

### What Happens to Data When a Pod Dies
- **Ephemeral container filesystem** — gone immediately, no exceptions.
- **`emptyDir`** — gone when the Pod is deleted (survives container restarts within the same Pod, not Pod deletion).
- **PVC-backed volume** — survives Pod deletion/rescheduling; the same underlying storage reattaches when a new Pod using that PVC starts (this is the entire point of PersistentVolumes).
- **PVC itself deleted** — what happens to the underlying PV/disk depends on the StorageClass's `reclaimPolicy`: `Delete` (default for dynamically-provisioned volumes) destroys the actual disk; `Retain` keeps the disk around (now unbound, requiring manual cleanup/reattachment) as a safety net against accidental data loss.

### Worked Example — Losing (and Not Losing) Data
```bash
# emptyDir scenario:
kubectl delete pod cache-pod
# any data in the emptyDir volume is GONE forever — new Pod starts with an empty volume

# PVC scenario:
kubectl delete pod postgres-0
# StatefulSet controller recreates postgres-0
# new Pod is scheduled, and it reattaches to the SAME PVC "data-postgres-0"
# all data is exactly as it was — nothing lost
kubectl get pvc data-postgres-0    # still exists, Bound, untouched throughout
```

### Analogy
Think of container storage tiers like different kinds of workspace:
- **Ephemeral container filesystem** is like writing notes on a **whiteboard that gets wiped clean every time you leave the room** — fine for scratch thoughts, useless for anything you need tomorrow.
- **`emptyDir`** is like a **shared shoebox left on your desk** — it survives you stepping out and coming back (container restarts), but the moment the desk itself is cleared out and reassigned (Pod deleted), the shoebox and everything in it goes in the trash.
- A **PersistentVolume + PersistentVolumeClaim** is like a **rented storage locker**: you (the Pod) don't own the locker directly, you hold a claim ticket (PVC) that says "this locker is mine." Even if you move to a completely different building (a new node), you can bring your claim ticket and get access to the *exact same locker* with everything still inside.
- **EBS vs EFS** is the difference between a **personal storage locker only accessible at one specific facility location** (EBS — one node/AZ at a time) versus a **shared warehouse accessible from any of the company's branch locations simultaneously** (EFS — many Pods, many nodes, at once).
- `reclaimPolicy: Retain` vs `Delete` is like choosing, when you cancel your locker rental, whether the facility should **immediately shred everything inside** (`Delete`) or **keep the locker sealed and untouched** in case you come back to claim it manually later (`Retain`).

---

## 11. Scaling ⭐

### Horizontal Pod Autoscaler (HPA)
Automatically adjusts the **number of Pod replicas** in a Deployment/StatefulSet based on observed metrics (CPU, memory, or custom/external metrics), keeping some target metric near a desired value.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

```
             ┌───────────────────────────┐
             │   Metrics Server / API      │
             │ (reports current CPU usage) │
             └──────────────┬──────────────┘
                             │ every ~15s
                             ▼
                  ┌─────────────────────┐
                  │  HPA Controller       │  "average CPU is 90%, target
                  │                       │   is 70% → I need more Pods"
                  └──────────┬────────────┘
                             │ updates
                             ▼
                  Deployment.spec.replicas
                             │
                             ▼
                     more Pods created
```

### CPU-based Scaling
The most common HPA metric — measures average CPU utilization (as a % of each Pod's *requested* CPU, not an absolute number) across all Pods, and scales up/down to bring that average toward the target.

### Memory-based Scaling
Same mechanism, but tracking average memory utilization instead. Less commonly reliable for scaling decisions than CPU, since memory usage often doesn't drop back down after a spike (unlike CPU, which naturally settles) — a Pod that briefly used lots of memory may keep "holding" it, making memory-based scale-down decisions trickier.

### Custom Metrics
Metrics beyond built-in CPU/memory — application-specific numbers like "requests per second," "queue depth," or "active WebSocket connections" — exposed via the **Custom Metrics API**, typically backed by Prometheus + a metrics adapter.

```yaml
metrics:
- type: Pods
  pods:
    metric:
      name: http_requests_per_second
    target:
      type: AverageValue
      averageValue: "100"
```

### External Metrics
Metrics sourced from **outside** the cluster entirely (e.g., an SQS queue's message count, a CloudWatch metric) — used when the thing driving your scaling need isn't something Kubernetes/Pods report themselves.

```yaml
metrics:
- type: External
  external:
    metric:
      name: sqs_queue_length
      selector:
        matchLabels:
          queue: order-processing
    target:
      type: AverageValue
      averageValue: "30"
```

### Minimum and Maximum Replicas
`minReplicas`/`maxReplicas` set hard bounds the HPA will never cross, regardless of metric readings — protecting against scaling to zero unexpectedly (unless intentionally using KEDA's scale-to-zero, below) or scaling infinitely and exhausting cluster/cloud resources or budget.

### Scale-up vs Scale-down
HPA behavior is intentionally **asymmetric** by default: scale-**up** reacts quickly (to absorb traffic spikes fast), while scale-**down** is more conservative/slower (to avoid "flapping" — rapidly oscillating replica counts as a metric hovers near the threshold).

### HPA Stabilization
Configurable windows that smooth out scaling decisions by looking at recent history rather than reacting to a single noisy metric reading:

```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 300   # wait 5 min of consistently-low metrics before scaling down
  scaleUp:
    stabilizationWindowSeconds: 0     # react immediately to spikes
```

### KEDA (Kubernetes Event-Driven Autoscaling)
An open-source project that extends HPA to scale based on **event sources** (queues, streams, schedules) directly, including scaling **all the way down to zero** replicas when there's no work — something the native HPA cannot do (HPA's minimum is effectively 1 without KEDA).

### KEDA ScaledObject
The custom resource that configures KEDA scaling for a workload — under the hood, KEDA actually creates/manages a standard HPA object, but adds its own event-source-aware "scaler" logic (and zero-to-one handling) on top.

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: order-processor-scaler
spec:
  scaleTargetRef:
    name: order-processor
  minReplicaCount: 0
  maxReplicaCount: 20
  triggers:
  - type: aws-sqs-queue
    metadata:
      queueURL: https://sqs.ap-south-1.amazonaws.com/123456789012/orders
      queueLength: "5"
```

### KEDA Triggers
The specific event-source integration a ScaledObject uses — KEDA ships 60+ built-in triggers/scalers, letting the same scaling mechanism drive off wildly different sources.

### KEDA + Kafka
Scales consumer Pods based on **consumer group lag** (how many unprocessed messages are waiting) — more lag → more consumer replicas, up to the topic's partition count (beyond which extra replicas can't help, since Kafka assigns at most one consumer per partition per group).

### KEDA + SQS
Scales workers based on the **approximate number of messages** visible in an SQS queue — a classic "scale workers to match queue backlog" pattern, including scaling down to zero workers when the queue is empty.

### KEDA + Prometheus
Scales based on the result of an arbitrary **PromQL query** — extremely flexible, letting you scale on literally any metric already being scraped by Prometheus (error rate, custom business metric, etc).

### Queue-length Scaling
The general pattern behind KEDA+SQS/Kafka: replicas are added proportionally to backlog size, so that (roughly) `replicas ≈ queue_length / target_length_per_replica` — keeping per-worker backlog roughly constant regardless of load.

### Zero-to-one Scaling
KEDA's signature capability: when there's genuinely no work (empty queue, no events), it can scale a Deployment down to **zero replicas** — saving compute cost entirely — and then scale back up to 1+ the moment new events arrive (there's inherent added latency for that "cold start" first Pod, a trade-off to accept for cost savings on bursty/sporadic workloads).

### Node Scaling vs Pod Scaling
- **Pod scaling** (HPA/KEDA) — changes how many Pod *replicas* exist, assuming there's node capacity to place them.
- **Node scaling** (Cluster Autoscaler/Karpenter) — changes how many *nodes* exist in the cluster, so there's actually somewhere to schedule those Pods.

```
       Traffic increases
              │
              ▼
   HPA adds more Pod replicas
              │
              ▼
  Not enough node capacity? → some Pods stay "Pending"
              │
              ▼
  Node autoscaler (Cluster Autoscaler / Karpenter)
  notices Pending Pods → adds new nodes
              │
              ▼
  Pending Pods get scheduled onto the new nodes
```
These two layers work together but are entirely independent mechanisms — Pod scaling alone can't help if there's no room; node scaling alone doesn't create more replicas.

### Cluster Autoscaler (basic understanding)
The traditional AWS-integrated tool: watches for **Pending Pods that can't be scheduled** due to insufficient resources, and increases the size of an existing EC2 Auto Scaling Group (matching one of your pre-defined node group configurations) to fit them. Also scales *down* underutilized nodes by draining and removing them.

### Karpenter (basic understanding)
A newer, more flexible node-autoscaler (originally AWS-built, now more broadly adopted): instead of picking from pre-defined, fixed node groups, it directly provisions **right-sized EC2 instances** (choosing instance type/size on the fly) to fit exactly what Pending Pods need — generally faster and more cost-efficient than Cluster Autoscaler's fixed-node-group approach.

### Worked Example — Traffic Spike End to End
```
1. Marketing sends a promo email; traffic to "web-app" spikes 5x.
2. Existing 3 Pods' average CPU jumps to 95% (target was 70%).
3. HPA controller (checking metrics every ~15s) decides more replicas are needed,
   scales Deployment "web-app" from 3 → 9 replicas.
4. Scheduler tries to place 6 new Pods — only room for 2 on existing nodes.
5. 4 Pods sit "Pending" (insufficient CPU/memory on any node).
6. Karpenter notices Pending Pods, provisions 2 new right-sized EC2 nodes.
7. New nodes join the cluster; the 4 Pending Pods get scheduled and start.
8. Traffic settles down after the promo; HPA (after its stabilization window)
   scales back down to 3 replicas; Karpenter later removes now-idle nodes too.
```

### Analogy
**HPA** is like a call center manager watching how busy current staff are (CPU/metric usage) and calling in more staff (Pod replicas) when the floor gets too busy, sending people home when it's quiet — but that manager can only call in staff who already have desks available.

**KEDA** is like a call center that can watch the actual **ticket queue** (SQS/Kafka backlog) instead of just staff busyness, and — crucially — can send *everyone* home entirely (scale to zero) when there are no tickets at all, calling in the first person back the instant a new ticket appears (with a short delay while they walk in and log on — the cold-start cost).

**Cluster Autoscaler / Karpenter** is the **facilities manager** who makes sure there are enough desks (nodes) in the building for however many staff the call-center manager (HPA/KEDA) wants to bring in — Karpenter is like a facilities manager who can order **exactly the right size desk on demand** for each new hire, while Cluster Autoscaler is more like ordering from a small fixed catalog of pre-approved desk sizes (fixed node groups).

---

## 12. Helm ⭐

### What Helm Is
Helm is the standard **package manager for Kubernetes** — it lets you bundle a full set of related manifests (Deployment, Service, ConfigMap, Ingress, etc.) into a single reusable, versioned, configurable unit called a **chart**, instead of hand-writing/copy-pasting dozens of raw YAML files per environment.

### Helm Charts
A chart is a directory (or packaged `.tgz`) containing templated Kubernetes manifests plus metadata describing how to configure and install them.

### Chart Structure
```
my-app-chart/
├── Chart.yaml           # chart metadata (name, version, description)
├── values.yaml           # default configuration values
├── charts/                # any dependency sub-charts
├── templates/             # actual Kubernetes manifest templates
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   └── _helpers.tpl       # reusable template snippets/functions
└── .helmignore
```

### Chart.yaml
Metadata about the chart itself — its own name/version, the app version it packages, and any dependencies.

```yaml
apiVersion: v2
name: my-app
description: A Helm chart for my-app
version: 1.2.0        # chart version (bump when the chart itself changes)
appVersion: "2.4.1"    # the actual application version being deployed
```

### values.yaml
The default configuration values a chart uses to fill in its templates — this is the primary interface consumers of a chart interact with, without needing to understand or edit the templates themselves.

```yaml
replicaCount: 3
image:
  repository: my-app
  tag: "2.4.1"
  pullPolicy: IfNotPresent
service:
  type: ClusterIP
  port: 80
resources:
  requests:
    cpu: 250m
    memory: 256Mi
ingress:
  enabled: false
```

### Templates
Manifest files using **Go templating syntax** to reference values, enabling one template to generate different actual manifests depending on the values supplied.

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Chart.Name }}
  template:
    metadata:
      labels:
        app: {{ .Chart.Name }}
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
```
`{{ .Values.replicaCount }}` gets substituted with whatever value is active (default from `values.yaml`, or overridden — see below) when the chart is rendered/installed.

### Helm Releases
Each time a chart is installed into a cluster (with a specific name and set of values), that instance is tracked as a **release** — Helm keeps a revision history per release, which is what makes rollbacks possible.

```bash
helm install my-web-app ./my-app-chart --namespace production
#            └────┬────┘
#             release name
```
The same chart can be installed multiple times under different release names (e.g., `my-web-app-staging`, `my-web-app-prod`), each independently configured and tracked.

### Helm Repositories
A hosted collection of packaged charts (like a package registry, e.g. PyPI/npm but for charts) that you can add and install from.

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo bitnami/postgresql
helm install my-postgres bitnami/postgresql
```

### Helm Install / Upgrade / Rollback
```bash
helm install my-web-app ./my-app-chart                          # first install
helm upgrade my-web-app ./my-app-chart --set replicaCount=5      # update an existing release
helm rollback my-web-app 2                                       # revert to revision 2
helm history my-web-app                                          # list all revisions
helm uninstall my-web-app                                         # remove entirely
```
Each `upgrade` creates a new revision; `rollback` doesn't "undo" — it re-applies a prior revision's rendered manifests as a brand-new revision on top, keeping full history intact.

### Values Overriding
Values can be overridden at install/upgrade time, layered in this priority (highest wins):
```
1. --set key=value           (command-line, highest priority)
2. -f custom-values.yaml     (custom values file, if provided)
3. values.yaml                (chart's own defaults, lowest priority)
```

```bash
helm install my-web-app ./my-app-chart \
  -f values-production.yaml \
  --set replicaCount=10 \
  --set image.tag=2.5.0
```
Common pattern: keep environment-specific files (`values-dev.yaml`, `values-staging.yaml`, `values-prod.yaml`) that only override what differs from the shared defaults in `values.yaml`.

### Helm Dependencies
A chart can declare other charts as dependencies (e.g., your app chart depends on the `postgresql` chart), letting Helm install/manage a whole related stack together as one unit.

```yaml
# Chart.yaml
dependencies:
- name: postgresql
  version: "12.x.x"
  repository: "https://charts.bitnami.com/bitnami"
  condition: postgresql.enabled
```
```bash
helm dependency update    # downloads dependency charts into ./charts/
```

### Helm vs Raw YAML
| | Raw YAML manifests | Helm |
|---|---|---|
| Reuse across environments | Copy-paste + manual edits, or `kustomize` overlays | One chart, many `values-*.yaml` files |
| Versioning/rollback | Manual (`kubectl apply` has no built-in history) | Built-in release history + `helm rollback` |
| Packaging/sharing | Just files in a repo | Installable, versioned charts via repositories |
| Templating/logic | None (unless combined with another tool) | Full Go templating (conditionals, loops, functions) |
| Learning curve | Lower | Higher (templating syntax, chart structure) |

### Helm vs Kustomize (basic understanding)
**Kustomize** takes a different philosophy: no templating language at all — instead, you write a plain "base" set of manifests plus small **patches/overlays** per environment that Kustomize merges in (`kubectl apply -k` has native Kustomize support, no extra tool install needed).

| | Helm | Kustomize |
|---|---|---|
| Approach | Templating (fill in placeholders) | Overlay/patch (merge diffs onto a base) |
| Packaging/sharing charts | Strong (repositories, versioning) | Weaker (no native package registry concept) |
| Learning curve | Steeper (templating syntax) | Gentler (plain YAML + patches) |
| Built into kubectl | No (separate binary) | Yes (`kubectl apply -k`) |

Many real-world setups actually use **both** — e.g., Helm to template/package a complex app, then Kustomize on top for small final environment-specific tweaks.

### Worked Example — One Chart, Three Environments
```
my-app-chart/
├── values.yaml              # shared defaults
├── values-dev.yaml           # replicaCount: 1, resources: small
├── values-staging.yaml        # replicaCount: 2
└── values-prod.yaml           # replicaCount: 10, resources: larger, ingress.enabled: true
```
```bash
helm install my-app ./my-app-chart -f values-dev.yaml --namespace dev
helm install my-app ./my-app-chart -f values-staging.yaml --namespace staging
helm install my-app ./my-app-chart -f values-prod.yaml --namespace production
```
Same underlying templates, three independently-configured, independently-tracked releases — a bug fix to the Deployment template only needs to be made once, in one place, and benefits all three environments the next time each is upgraded.

### Analogy
A **Helm chart** is like an **IKEA furniture kit**: the `templates/` folder is the pre-designed instruction manual and pre-cut parts (the structure never changes), while `values.yaml` is the **order form** where you pick color, size, and optional add-ons — the same kit (chart) can produce a small white bookshelf or a tall black one, depending only on what you filled in on the order form, without redesigning the furniture itself.

A **Helm release** is your **specific assembled bookshelf sitting in your specific room** — you could order the same kit again for a different room (a different release name/namespace), and each assembled instance is tracked separately, including a full history of every time you've reassembled/modified it (`helm history`), so if a new attempt goes wrong you can put it back exactly the way it was (`helm rollback`).

A **Helm repository** is the **IKEA store's catalog** — a shared place where kits (charts) are published, versioned, and can be searched/downloaded by anyone, rather than everyone hand-cutting their own furniture parts from scratch (raw YAML). **Kustomize**, by contrast, is more like buying one plain, unfinished piece of furniture (the base manifests) and keeping a small, separate list of "sand this corner, paint it blue" instructions (patches) per room — no instruction manual/templating language, just direct modifications layered onto the same base object.

---

*Next parts will cover: CI/CD & GitOps, Observability & Debugging, Security, Reliability & Production, and Developer Tools.*
