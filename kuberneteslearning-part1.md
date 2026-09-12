# Kubernetes Learning Notes — Part 1

**Covers:** 1) Kubernetes Fundamentals, 2) Pods & Containers, 3) Deployments & Workloads, 4) Kubernetes Networking, 5) Services, Ingress & Traffic Routing

---

## 1. Kubernetes Fundamentals

### What Kubernetes is
Kubernetes (K8s) is a **container orchestration platform**. It takes a set of container images and a description of how you want them to run (how many copies, what resources, what network access) and continuously works to make the real state of the cluster match that description.

Think of it as an operating system for a cluster of machines: instead of scheduling processes on a single computer, it schedules containers across many computers.

### Cluster, Control Plane, Worker Nodes
A Kubernetes **cluster** = one control plane + one or more worker nodes.

```
                ┌───────────────────────────┐
                │        CONTROL PLANE       │
                │  (the "brain")             │
                │                             │
                │  kube-apiserver             │
                │  etcd (cluster database)    │
                │  kube-scheduler             │
                │  kube-controller-manager    │
                └──────────────┬──────────────┘
                               │ API calls
        ┌──────────────────────┼──────────────────────┐
        │                      │                       │
 ┌──────▼──────┐        ┌──────▼──────┐         ┌──────▼──────┐
 │  Worker Node │        │  Worker Node │         │  Worker Node │
 │  kubelet     │        │  kubelet     │         │  kubelet     │
 │  kube-proxy  │        │  kube-proxy  │         │  kube-proxy  │
 │  Pods...     │        │  Pods...     │         │  Pods...     │
 └──────────────┘        └──────────────┘         └──────────────┘
```

- **Control plane**: decides *what should run where*. Components:
  - `kube-apiserver` — front door; every `kubectl` command talks to this.
  - `etcd` — the key-value store holding the entire cluster's desired/actual state.
  - `kube-scheduler` — picks which node a new Pod should run on.
  - `kube-controller-manager` — runs control loops (e.g., "make sure 3 replicas exist").
- **Worker nodes**: actually run your containers.
  - `kubelet` — the agent that talks to the control plane and starts/stops containers on that node.
  - `kube-proxy` — sets up networking rules so Services work (more in section 4).
  - **Container runtime** (containerd, CRI-O) — actually runs the containers.

### Kubernetes Objects
Everything in Kubernetes is represented as an **object** — a persistent record of intent stored in etcd. Examples: Pod, Deployment, Service, ConfigMap, Secret, Namespace.

Every object generally has:
```yaml
apiVersion: apps/v1   # which API group/version defines this object
kind: Deployment       # what type of object
metadata:              # name, namespace, labels, annotations
  name: my-app
spec:                  # desired state — what YOU want
status:                # actual state — filled in by Kubernetes, read-only
```

### Declarative Configuration
Kubernetes is **declarative**, not imperative. You don't say "start 3 containers now." You say "I want 3 replicas of this Pod running, always" (`spec.replicas: 3`), and Kubernetes' controllers continuously reconcile reality to match that.

Imperative (old-school scripting) approach: `docker run ...` three times, and if one dies, you must notice and re-run it yourself.

Declarative approach: write a manifest, `kubectl apply -f deployment.yaml`, and Kubernetes keeps 3 replicas alive forever — restarting failed ones automatically.

### Desired State vs Actual State
This is the core idea behind almost everything Kubernetes does:

- **Desired state** — what you wrote in `spec` (e.g., "3 replicas").
- **Actual state** — what's really running, reported in `status`.
- **Controllers** run infinite reconciliation loops: *observe → compare → act*.

```
   ┌────────────┐     compare      ┌────────────┐
   │  Desired   │ ───────────────► │   Actual    │
   │  (spec)    │                  │  (status)   │
   └────────────┘                  └────────────┘
          ▲                               │
          │        take action to         │
          └────── close the gap ──────────┘
```

If a Pod crashes (actual state drops to 2 replicas) while desired state says 3, the ReplicaSet controller notices the diff and creates a new Pod.

### Namespaces
Namespaces are **virtual clusters within a cluster** — a way to divide resources logically (e.g., `dev`, `staging`, `prod`, or per-team).

```bash
kubectl get namespaces
kubectl get pods -n dev
kubectl create namespace staging
```
Defaults: `default`, `kube-system` (system components), `kube-public`, `kube-node-lease`.

Resources in different namespaces are isolated by name (`myapp` in `dev` and `myapp` in `staging` are different objects) but **not** network-isolated by default — that requires NetworkPolicy.

### Labels and Selectors
**Labels** are arbitrary key-value pairs attached to objects, used to organize and select them.

```yaml
metadata:
  labels:
    app: payment-service
    tier: backend
    env: production
```

**Selectors** query objects by their labels. This is how a Deployment finds "its" Pods, and how a Service finds which Pods to send traffic to:

```yaml
selector:
  matchLabels:
    app: payment-service
```

```bash
kubectl get pods -l app=payment-service,env=production
```

Labels + selectors are the glue that connects almost every object relationship in Kubernetes (Deployment → Pods, Service → Pods, NetworkPolicy → Pods).

### YAML Manifests
A **manifest** is a YAML (or JSON) file describing a desired object. Example — a minimal Pod manifest:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello-pod
  labels:
    app: hello
spec:
  containers:
  - name: hello-container
    image: nginx:1.27
    ports:
    - containerPort: 80
```

Apply it:
```bash
kubectl apply -f hello-pod.yaml
```

Multiple objects can live in one file separated by `---`.

### kubectl Basics
`kubectl` is the CLI that talks to `kube-apiserver`.

| Command | Purpose |
|---|---|
| `kubectl get pods` | list Pods |
| `kubectl get all -n <ns>` | list common objects in a namespace |
| `kubectl describe pod <name>` | detailed info + events |
| `kubectl apply -f file.yaml` | create/update objects from a manifest |
| `kubectl delete -f file.yaml` | delete objects defined in a manifest |
| `kubectl logs <pod>` | view container logs |
| `kubectl exec -it <pod> -- sh` | shell into a container |
| `kubectl get pods -o wide` | show extra columns (node, IP) |
| `kubectl config current-context` | show which cluster you're pointed at |

### Putting It Together — A Worked Example
Say you run `kubectl apply -f deployment.yaml` requesting 3 replicas of `web-app`:
1. `kubectl` sends the manifest to `kube-apiserver`, which validates it and writes it to `etcd`.
2. The Deployment controller notices "desired: 3 replicas, actual: 0" and creates a ReplicaSet.
3. The ReplicaSet controller notices "desired: 3 Pods, actual: 0" and creates 3 Pod objects.
4. `kube-scheduler` sees 3 unscheduled Pods and assigns each one to a node with enough free resources.
5. Each node's `kubelet` sees a Pod assigned to it, pulls the image, and starts the container.
6. `status` fields update as things progress; `kubectl get pods` shows `Running` once done.

This chain — apiserver → controller → scheduler → kubelet — is the backbone of *everything* in Kubernetes, not just Deployments.

### Analogy
Think of the **control plane** as a restaurant's head office and the **worker nodes** as individual kitchens. The head office (control plane) doesn't cook food itself — it keeps the master recipe book (`etcd`), decides which kitchen should cook which order (`scheduler`), and continuously checks whether every kitchen has fulfilled its orders (`controller-manager`). Each kitchen's **kitchen manager** (`kubelet`) actually does the cooking (runs containers) and reports back "order done" or "order failed" to head office.

A **namespace** is like having separate floors in a shared office building — `dev` team on floor 1, `prod` team on floor 2 — same building (cluster), same address system, but organizationally separated. **Labels** are like sticky notes on folders ("urgent," "finance," "Q3") — anyone can search folders by sticky note without knowing the folder's actual name, which is exactly how a Deployment finds "its" Pods.

---

## 2. Pods & Containers

### Pod vs Container
A **container** is a single running process with its own filesystem, isolated by the OS. A **Pod** is Kubernetes' smallest deployable unit — a wrapper around **one or more containers** that:
- share the same network namespace (same IP, `localhost` between containers)
- can share storage volumes
- are always scheduled together on the same node
- live and die together

```
┌───────────────────── Pod (IP: 10.244.1.5) ─────────────────────┐
│                                                                  │
│   ┌───────────────┐        ┌───────────────┐                    │
│   │ main container │        │ sidecar        │                    │
│   │ (app)          │◄──────►│ (log shipper)  │  same network,     │
│   │ port 8080      │localhost│ port 9000     │  can share volumes │
│   └───────────────┘        └───────────────┘                    │
└──────────────────────────────────────────────────────────────────┘
```

Most Pods run a single container, but multi-container Pods are common for tightly-coupled helpers (sidecars, log shippers, proxies).

### Pod Lifecycle
A Pod moves through phases:

```
Pending ──► Running ──► Succeeded / Failed
   │
   └─► (image pulling, scheduling, init containers running)
```

- **Pending** — accepted by the cluster but not all containers are running yet (still scheduling, pulling images, etc.)
- **Running** — bound to a node, all containers created, at least one running.
- **Succeeded** — all containers terminated successfully (exit code 0) — typical for Jobs.
- **Failed** — at least one container terminated with failure.
- **Unknown** — node unreachable, state can't be determined.

Within "Running," each container also has its own state: `Waiting`, `Running`, `Terminated`.

### Container Images
An image is an immutable, versioned bundle of application code + runtime + dependencies. Pulled from a registry (Docker Hub, ECR, GCR).

```yaml
containers:
- name: app
  image: myregistry.io/my-app:1.4.2
  imagePullPolicy: IfNotPresent   # or Always / Never
```
Always pin a specific tag (or digest) in production — avoid `:latest`, since it makes rollbacks and reproducibility unreliable.

### Container Ports
`containerPort` is documentation/metadata telling Kubernetes (and humans) which port the app listens on inside the container. It does **not** by itself open the port — the application must actually bind to it.

```yaml
ports:
- containerPort: 8080
  name: http
```

### Init Containers
Init containers run **before** the main containers start, sequentially, and must each complete successfully before the next starts (and before app containers start). Used for setup tasks: waiting for a dependency, running a migration, fetching config.

```yaml
spec:
  initContainers:
  - name: wait-for-db
    image: busybox
    command: ['sh', '-c', 'until nc -z db-service 5432; do sleep 2; done']
  containers:
  - name: app
    image: my-app:1.0
```

### Sidecars
A **sidecar** is a helper container that runs alongside the main container for the Pod's whole lifetime — e.g., a log-forwarding agent, a service-mesh proxy (Envoy/Istio), or a metrics exporter. It shares the Pod's network and can share volumes with the main container.

### Pod Restart Behavior
Controlled by `restartPolicy`:
- `Always` (default, used by Deployments) — always restart on exit.
- `OnFailure` — restart only on non-zero exit (used by Jobs).
- `Never` — never restart automatically.

When kubelet restarts a container repeatedly, it uses **exponential backoff** (10s, 20s, 40s... capped at 5 min) — this is what produces `CrashLoopBackOff`.

### CrashLoopBackOff
Not an error itself — it's a **status** meaning: "this container keeps crashing, so I'm backing off before retrying."

Common causes: application crashes on startup (bad config, missing env var, unhandled exception), failing readiness probe causing repeated restarts, OOM (see below), wrong startup command.

Debug:
```bash
kubectl describe pod <name>          # see Events section
kubectl logs <name> --previous       # logs from the crashed instance
```

### ImagePullBackOff
The kubelet can't pull the container image, so it backs off retrying. Causes: typo in image name/tag, private registry needs `imagePullSecrets` that are missing/wrong, registry rate-limiting, network/firewall blocking the registry.

```bash
kubectl describe pod <name>   # look for "Failed to pull image" in Events
```

### OOMKilled
The container exceeded its memory **limit** and the Linux kernel's OOM killer terminated it. Shows up as:
```
State: Terminated
Reason: OOMKilled
Exit Code: 137
```
Fix by profiling actual memory usage and raising `resources.limits.memory`, or fixing a memory leak.

### Resource Requests and Limits
Declared per container:

```yaml
resources:
  requests:
    cpu: "250m"      # 0.25 vCPU — used for scheduling decisions
    memory: "256Mi"
  limits:
    cpu: "500m"      # hard ceiling — CPU is throttled, not killed
    memory: "512Mi"  # hard ceiling — memory overage = OOMKilled
```

- **Requests** = what the scheduler guarantees is reserved on a node (used to decide *where* a Pod can fit).
- **Limits** = the hard ceiling the container cannot exceed at runtime.
- CPU over-limit → throttled (slowed down). Memory over-limit → **killed** (OOMKilled).

### Readiness, Liveness, and Startup Probes
Kubernetes actively health-checks containers using probes (HTTP GET, TCP socket, or exec command):

| Probe | Question it answers | What happens on failure |
|---|---|---|
| **Liveness** | "Is this container stuck/deadlocked?" | Container is **restarted** |
| **Readiness** | "Is this container ready to serve traffic?" | Pod is **removed from Service endpoints** (not restarted) |
| **Startup** | "Has the app finished starting up yet?" | Liveness/readiness are paused until this passes |

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 5
startupProbe:
  httpGet:
    path: /startupz
    port: 8080
  failureThreshold: 30
  periodSeconds: 5
```
Startup probes are especially useful for slow-booting apps (e.g., JVM apps) so liveness doesn't kill them mid-boot.

### Graceful Shutdown / SIGTERM
When a Pod is deleted or scaled down:

```
1. Pod marked "Terminating"
2. Pod removed from Service endpoints (stops receiving new traffic)
3. kubelet sends SIGTERM to container process
4. App should finish in-flight requests and exit cleanly
5. If it hasn't exited after `terminationGracePeriodSeconds` (default 30s),
   kubelet sends SIGKILL (force kill)
```

```yaml
spec:
  terminationGracePeriodSeconds: 45
```
Applications should catch SIGTERM, stop accepting new work, finish existing requests, then exit — this avoids dropped connections during deploys/scaling.

### Worked Example — Debugging a Failing Pod
Suppose `kubectl get pods` shows:
```
NAME                       READY   STATUS             RESTARTS   AGE
web-app-7d9f8c-abcde       0/1     CrashLoopBackOff   5          4m
```
Debugging flow:
```bash
kubectl describe pod web-app-7d9f8c-abcde   # check Events for OOMKilled / probe failures
kubectl logs web-app-7d9f8c-abcde           # current logs (may be empty if crash is instant)
kubectl logs web-app-7d9f8c-abcde --previous   # logs from the last crashed attempt — usually the real answer
```
If `describe` shows `Reason: OOMKilled`, the fix is raising `resources.limits.memory` or fixing a leak. If logs show a stack trace on startup (e.g., "cannot connect to database"), the fix is a config/env-var/dependency issue, not a Kubernetes issue at all — Kubernetes is just faithfully reporting an app that keeps dying.

### Analogy
A **Pod** is like a **shared hospital room**: the "room" (network namespace/IP) is one thing, but it can hold one patient (single-container Pod) or a patient plus their dedicated nurse (multi-container Pod with a sidecar) — they share the same room number (IP) and can pass things to each other directly (`localhost`), but each patient (container) has their own chart (process, filesystem).

**Resource requests vs limits** are like booking a hotel room: the **request** is the minimum room size you're guaranteed when the hotel (node) assigns you a room — the hotel won't overbook below that. The **limit** is the maximum noise/water usage allowed before management (the kernel) throttles you (CPU) or kicks you out entirely (memory → OOMKilled).

A **liveness probe** is like a manager occasionally knocking on an employee's door to check "are you still working, or did you pass out?" — if there's no answer, they replace the employee (restart the container). A **readiness probe** is like a "back in 5 minutes" sign an employee puts on their own door — during that time, no new customers (traffic) are sent their way, but they aren't fired (not restarted), just temporarily skipped.

---

## 3. Deployments & Workloads

### Deployment
The most common way to run stateless apps. You describe a Pod template + replica count; the Deployment controller creates and manages a **ReplicaSet**, which in turn manages Pods.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: web-app:2.1
        ports:
        - containerPort: 8080
```

```
Deployment (web-app)
      │  manages
      ▼
ReplicaSet (web-app-7d9f8c)
      │  manages
      ▼
  Pod   Pod   Pod
```

### ReplicaSet
Ensures a specified number of identical Pod replicas are running at all times. You rarely create ReplicaSets directly — Deployments create/manage them for you (one ReplicaSet per version, enabling rollouts/rollbacks).

### StatefulSet (basic understanding)
For **stateful** apps (databases, queues) that need:
- stable, unique network identities (`pod-0`, `pod-1`, `pod-2` — predictable, not random)
- stable persistent storage per Pod (each replica keeps its own PVC across restarts)
- ordered, sequential deployment/scaling/termination (0, then 1, then 2...)

Example use: Kafka, Zookeeper, Postgres replicas.

### DaemonSet (basic understanding)
Ensures **exactly one copy of a Pod runs on every node** (or a selected subset). Used for node-level agents: log collectors (Fluentd), monitoring agents (node-exporter), CNI plugins.

### Job
Runs a Pod (or several) **to completion** — for one-off or batch tasks, not long-running services.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: migrate-tool:1.0
      restartPolicy: OnFailure
  backoffLimit: 3
```

### CronJob
Runs a Job on a schedule, using standard cron syntax.

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-report
spec:
  schedule: "0 2 * * *"   # every day at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: report
            image: report-gen:1.0
          restartPolicy: OnFailure
```

### Replicas
`spec.replicas` — the number of identical Pods a Deployment/ReplicaSet/StatefulSet should keep running. The controller constantly reconciles actual Pod count to this number.

### Rolling Updates
Default Deployment strategy: gradually replace old Pods with new ones, keeping the app available throughout.

```
Before:   [v1][v1][v1]
Step 1:   [v1][v1][v2]     <- new Pod created, old one removed once new is Ready
Step 2:   [v1][v2][v2]
After:    [v2][v2][v2]
```

Controlled by:
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1          # how many extra Pods above `replicas` during rollout
    maxUnavailable: 0    # how many Pods can be unavailable during rollout
```

### Rollbacks
If a new version is bad, revert to the previous ReplicaSet's Pod template:

```bash
kubectl rollout status deployment/web-app
kubectl rollout history deployment/web-app
kubectl rollout undo deployment/web-app
kubectl rollout undo deployment/web-app --to-revision=3
```

### Deployment Strategies
- **RollingUpdate** (default) — gradual, zero-downtime, as above.
- **Recreate** — kill all old Pods first, then create new ones (brief downtime; used when old/new versions can't run simultaneously, e.g. schema conflicts).
- **Blue-Green** (not native — built via two Deployments + a Service switch) — run v2 fully alongside v1, then flip traffic all at once.
- **Canary** (not native — built via two Deployments with a split, or via Argo Rollouts/service mesh) — send a small % of traffic to v2, then gradually increase.

### PodDisruptionBudget (basic understanding)
Limits how many Pods of an app can be **voluntarily** disrupted at once (e.g., during node drains or cluster upgrades) — protecting availability.

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-app-pdb
spec:
  minAvailable: 2      # or maxUnavailable: 1
  selector:
    matchLabels:
      app: web-app
```
This does not protect against involuntary disruption (node crash) — only planned actions like drains.

### Worked Example — A Rolling Update Gone Wrong, and the Rollback
```bash
kubectl set image deployment/web-app web-app=web-app:2.2
kubectl rollout status deployment/web-app
# Watching... 2 new Pods created, but they're CrashLoopBackOff
kubectl rollout undo deployment/web-app
# Kubernetes immediately scales the old (v2.1) ReplicaSet back up
# and scales the broken (v2.2) ReplicaSet down to 0
kubectl rollout status deployment/web-app
# deployment "web-app" successfully rolled out
```
Because the Deployment kept the previous ReplicaSet around (not deleted, just scaled to 0), the rollback is nearly instant — no rebuild, no re-pull of an old image if it's still cached.

### Analogy
A **Deployment** is like a restaurant franchise's head office: it doesn't cook (that's the ReplicaSet's/Pod's job), it just says "I want exactly 3 branches open, running this exact menu (Pod template)." The **ReplicaSet** is the regional manager who actually opens/closes branches (Pods) to match that number. When you update the menu, the Deployment doesn't smash all restaurants (Podds) at once — it does a **rolling update**: close one branch, open a new one with the new menu, wait until it's serving customers well, then move to the next — customers (traffic) are never left with zero open branches.

A **Job** is a one-time catering order ("cook 100 meals, then you're done") rather than a restaurant that stays open forever (a Deployment). A **CronJob** is that same catering order, scheduled to repeat every night at a set time.

A **PodDisruptionBudget** is like a factory rule: "no matter what maintenance we schedule, at least 2 of our 3 assembly lines must always keep running" — protecting against planned disruptions (like node drains during upgrades), not sudden unplanned power outages (node crashes).

---

## 4. Kubernetes Networking ⭐

### Kubernetes Networking Model
Kubernetes networking follows a flat model with rules:
1. Every Pod gets its **own unique IP** (no NAT between Pods).
2. All Pods can reach all other Pods' IPs directly, cluster-wide, without NAT.
3. Nodes can reach all Pods, and vice versa.
4. Containers within the same Pod share the same IP/network namespace (talk via `localhost`).

This is implemented by a **CNI (Container Network Interface)** plugin (e.g., AWS VPC CNI, Calico, Cilium).

### Pod IPs
Each Pod gets an IP address from the cluster's Pod network (e.g., `10.244.x.x`). This IP is **ephemeral** — when a Pod is recreated (even with the same name), it usually gets a new IP. This is exactly why you should never hardcode Pod IPs — use Services instead.

### Node IPs
Each worker node also has its own IP on the underlying network (e.g., the VPC in AWS). `kubectl get nodes -o wide` shows both internal and external node IPs.

### Service IPs
A **Service** gets a stable **virtual IP (ClusterIP)** that never changes for the Service's lifetime, even as the underlying Pods (and their IPs) come and go. This decouples "who I talk to" from "which specific Pod is currently running."

### Pod-to-Pod Communication
Any Pod can talk directly to any other Pod's IP:Port across the whole cluster (even across nodes) without NAT — this is a fundamental Kubernetes networking guarantee, implemented by the CNI's routing/overlay.

```
Node A                              Node B
┌─────────────┐                    ┌─────────────┐
│ Pod A        │                    │ Pod B        │
│ 10.244.1.5   │ ───── routed ───► │ 10.244.2.9   │
└─────────────┘   (via CNI/VPC)    └─────────────┘
```

### Pod-to-Service Communication
A Pod talks to a Service's ClusterIP/DNS name; `kube-proxy`'s rules transparently load-balance the request to one of the healthy backing Pods.

```
Pod (client) ──► Service ClusterIP ──► kube-proxy rules ──► one of N backend Pods
```

### Service-to-Service Communication
Common pattern in microservices: Service A calls Service B by its **DNS name** (`service-b.namespace.svc.cluster.local`), never by Pod IP. Kubernetes DNS + Services make this location-transparent — Service B's Pods can scale, restart, or move nodes without Service A's config ever changing.

### ClusterIP
Default Service type — exposes the Service on an internal-only virtual IP, reachable only from within the cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - port: 80          # Service port
    targetPort: 8080  # container port
```

### NodePort
Exposes the Service on a static port (30000-32767 by default) on **every node's IP**. `http://<any-node-ip>:<nodePort>` reaches the Service. Mostly used for dev/testing or as a building block underneath LoadBalancer.

```yaml
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080
```

### LoadBalancer
Requests a cloud provider's external load balancer (e.g., an AWS Classic/Network Load Balancer) which routes external traffic to the Service (via NodePort under the hood).

```yaml
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
```

```
Internet ──► Cloud Load Balancer ──► NodePort (on each node) ──► kube-proxy ──► Pod
```

### Service Selectors
Just like Deployments, Services use label selectors to determine which Pods are their backends:

```yaml
selector:
  app: backend
```
Any Pod with label `app: backend` (in the same namespace) automatically becomes a backend — no manual wiring needed.

### EndpointSlices
The actual list of "which Pod IPs currently back this Service" is stored in **EndpointSlice** objects (the modern replacement for the older `Endpoints` object), automatically updated as matching Pods become Ready/NotReady or are created/deleted.

```bash
kubectl get endpointslices -n <namespace>
```

### kube-proxy (basic understanding)
Runs on every node; watches Services/EndpointSlices and programs the node's networking (via `iptables` or `IPVS` rules) so that traffic to a Service's ClusterIP gets transparently routed/load-balanced to one of the healthy backend Pods.

### CoreDNS
The cluster's internal DNS server, running as Pods inside the cluster. It resolves Service and Pod names to their IPs, so apps can use names instead of hardcoded IPs.

### Kubernetes DNS
Every Service automatically gets a DNS record. Standard resolution:
```
<service-name>.<namespace>.svc.cluster.local
```
From within the same namespace, just `<service-name>` works, thanks to search-domain configuration in each Pod's `/etc/resolv.conf`.

### Service FQDNs
The **Fully Qualified Domain Name** for a Service is always:
```
backend.production.svc.cluster.local
```
Using the FQDN (rather than the short name) is recommended for **cross-namespace** calls, since it's unambiguous.

### Headless Services (basic understanding)
A Service with `clusterIP: None`. Instead of one virtual load-balanced IP, DNS returns the **individual Pod IPs directly**. Used when the client needs to know about (and connect to) each backend Pod individually — typically paired with StatefulSets (e.g., connecting to a specific Kafka broker or Postgres replica).

```yaml
spec:
  clusterIP: None
  selector:
    app: kafka
```

### NetworkPolicy (basic understanding)
By default, all Pods can talk to all other Pods (flat network = no isolation). A **NetworkPolicy** is a firewall rule for Pods, restricting allowed ingress/egress based on labels/namespaces/ports.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - port: 8080
```
This example: only Pods labeled `app: frontend` may send traffic to `backend` Pods on port 8080; everything else is denied. Requires a CNI plugin that supports NetworkPolicy (e.g., Calico, Cilium) — the default AWS VPC CNI needs this enabled or supplemented.

### Worked Example — Why a Curl to a Service Name Works
Inside a Pod in namespace `production`, running:
```bash
curl http://backend/api/health
```
resolves because:
1. The Pod's `/etc/resolv.conf` has a search domain like `production.svc.cluster.local`.
2. CoreDNS resolves `backend.production.svc.cluster.local` to the Service's ClusterIP, e.g. `10.100.34.12`.
3. The request hits that virtual IP; `kube-proxy`'s iptables/IPVS rules on that node rewrite the destination to one of the healthy backend Pod IPs (e.g., `10.244.2.9:8080`), chosen essentially at random for load-balancing.
4. The Pod-to-Pod packet is routed across the cluster network (CNI) directly to the destination Pod, no matter which node it's on.

### Analogy
Think of the cluster's flat Pod network like a **city where every house (Pod) has its own permanent street address (IP)**, and any house can mail a letter directly to any other house's address, city-wide, without going through a sorting/forwarding office. But since houses get demolished and rebuilt with new addresses all the time (Pods restart with new IPs), nobody actually sends mail to a raw address — instead, everyone uses a **PO Box number that never changes** (a Service's ClusterIP) and the postal service (`kube-proxy`) quietly forwards each letter to whichever house currently holds that PO box's mail.

**CoreDNS** is the phone book of the city: instead of memorizing PO box numbers, you just look up a business by name ("backend") and the phone book tells you its number.

A **NetworkPolicy** is like giving the building security guard a list: "only people from the Marketing floor (frontend Pods) are allowed to knock on Finance's door (backend Pods) on port 8080 — everyone else, denied." Without a NetworkPolicy, it's an open-plan office — anyone can walk up to anyone's desk.

---

## 5. Services, Ingress & Traffic Routing ⭐

### Service vs Ingress
- A **Service** load-balances traffic to a group of Pods — but it works at L4 (TCP/UDP), with one IP/port per Service, and (for LoadBalancer type) needs one cloud load balancer **per Service** — expensive and limited for HTTP routing.
- An **Ingress** is an L7 (HTTP/HTTPS) routing rule set — a single entry point that can route to *many* different Services based on hostname and/or URL path.

```
                       ┌─────────── Ingress ───────────┐
Internet ──► ALB ────► │  /api    → api-service          │
                       │  /web    → web-service          │
                       │  shop.example.com → shop-service│
                       └─────────────────────────────────┘
```

### Ingress Controller
An **Ingress object** is just a config (rules) — it does nothing by itself. An **Ingress Controller** is the actual software that watches Ingress objects and configures a real load balancer/proxy to implement those rules. Examples: NGINX Ingress Controller, AWS Load Balancer Controller, Traefik.

### Kubernetes Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop-ingress
  annotations:
    kubernetes.io/ingress.class: alb
spec:
  rules:
  - host: shop.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

### AWS Load Balancer Controller
A Kubernetes controller (runs as Pods in your EKS cluster) that watches for Ingress and Service (`type: LoadBalancer`) objects and provisions **real AWS ALBs/NLBs** to match, including target groups, listeners, and rules — all driven by annotations on your Ingress/Service manifests.

### ALB (Application Load Balancer)
An AWS L7 load balancer. When used as an Ingress backend, one ALB can serve many Ingress rules (host/path based), avoiding "one load balancer per Service."

### ALB Listeners
A listener checks for connection requests on a specific protocol/port (e.g., `HTTPS:443`), and applies **rules** to decide where to send matching traffic.

### ALB Rules
Ordered conditions evaluated per listener: "if host is X and path is Y, forward to Target Group Z." This is what implements Ingress path/host routing at the AWS layer.

### ALB Target Groups
A target group is the set of destinations (EC2 instances or IPs) the ALB forwards matched traffic to, plus its own health-check config. Each backend Service in your Ingress typically maps to one Target Group.

### ALB Health Checks
The ALB periodically probes each target (e.g., `GET /healthz`) to know if it should keep sending traffic there. Unhealthy targets are automatically removed from rotation.

```
ALB ──periodic GET /healthz──► Target
      2xx/3xx = healthy, else = unhealthy → removed from rotation
```

### Target Type: instance vs ip
- **`instance`** — ALB sends traffic to a node's IP + NodePort; relies on `kube-proxy` to further route to the right Pod (extra hop).
- **`ip`** — ALB sends traffic **directly to Pod IPs** (requires VPC CNI so Pods have routable VPC IPs) — fewer hops, and is the recommended/default mode for the AWS Load Balancer Controller on EKS.

```
instance mode:  ALB → Node:NodePort → kube-proxy → Pod
ip mode:        ALB → Pod IP directly
```

### Path-based Routing
Route requests to different backend Services based on URL path:
```
example.com/api  → api-service
example.com/web  → web-service
```

### Host-based Routing
Route based on the `Host` header/domain instead of (or combined with) path:
```
api.example.com  → api-service
shop.example.com → shop-service
```

### TLS Termination
Where HTTPS is decrypted into plain HTTP. Typically the **ALB terminates TLS** (holds the certificate, e.g., via ACM), and forwards plain HTTP internally to the cluster — simplifying certificate management (you don't need certs on every Pod).

### HTTPS → HTTP Inside Cluster
```
Client ──HTTPS (443)──► ALB (TLS terminated here) ──HTTP (80)──► Service ──► Pod
```
This is the common pattern: encrypt over the public internet, plain HTTP inside the trusted VPC/cluster network (though you *can* re-encrypt internally too, for stricter zero-trust setups).

### Client IP Preservation
By default, when traffic passes through NAT/proxies, the original client's IP can be lost (replaced by the load balancer's or node's IP). To preserve it:
- ALB in `ip` target mode + `X-Forwarded-For` header (apps read this header for the real client IP).
- Or `externalTrafficPolicy: Local` on a Service (avoids an extra hop that would otherwise obscure the source IP), at the cost of potentially uneven load balancing across nodes.

### Connection Draining (Deregistration Delay)
When a target (Pod) is being removed from a Target Group (e.g., during a rollout or scale-down), the ALB stops sending *new* requests to it but allows existing in-flight connections to finish for a configurable timeout before force-closing them — avoiding dropped requests.

### 502 / 503 / 504 Basics
| Code | Meaning | Common Kubernetes cause |
|---|---|---|
| **502 Bad Gateway** | ALB got an invalid response from the target | App crashed/not listening on expected port, wrong `targetPort` |
| **503 Service Unavailable** | No healthy targets available | All Pods failing readiness/health checks, or Service has zero endpoints |
| **504 Gateway Timeout** | Target didn't respond in time | App overloaded, slow downstream dependency, too-short ALB timeout vs slow app |

Debugging tip: 503 often means "check Service endpoints and Pod readiness"; 502/504 often mean "check the app itself and its port/health-check config."

### Worked Example — One Ingress, Two Apps, One ALB
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:...:certificate/abc123
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
spec:
  rules:
  - host: shop.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service: {name: api-service, port: {number: 80}}
      - path: /
        pathType: Prefix
        backend:
          service: {name: web-service, port: {number: 80}}
```
Applying this makes the AWS Load Balancer Controller provision **one ALB** with a 443 listener, two rules (`/api` → Target Group A, `/` → Target Group B), TLS termination using the ACM cert, and `ip`-mode target groups pointing straight at Pod IPs — all without you touching the AWS Console.

### Analogy
A **Service** (ClusterIP/NodePort/LoadBalancer) is like giving every restaurant its own private phone line — fine for one restaurant, but if you own 10 restaurants (Services) and want customers to dial *one* number and get routed to the right one, that's expensive and unmanageable (one cloud Load Balancer per Service). An **Ingress + Ingress Controller** is a single **receptionist switchboard**: one public phone number (one ALB), and the receptionist (Ingress rules) looks at what the caller asked for — "pizza place" (path `/api`) or "burger place" (path `/`) — and transfers the call (routes traffic) to the right back-office extension (Service).

**TLS termination at the ALB** is like a company's front desk that accepts sealed, locked (encrypted) mail from the outside world, unlocks it at the desk, then walks the opened letter to the right internal department by regular internal mail (plain HTTP) — because inside the building (VPC/cluster) is already considered a trusted zone.

**Connection draining** is like closing a checkout lane at a supermarket: you don't send new customers there, but you don't kick out the person already mid-checkout — you let them finish, up to a timeout, before switching off the lane for good.

---

*Next parts will cover: EKS, End-to-End Request Flow, Kubernetes DNS & FQDNs, Configuration & Secrets, Storage, Scaling, Helm, CI/CD & GitOps, Observability & Debugging, Security, Reliability & Production, and Developer Tools.*
