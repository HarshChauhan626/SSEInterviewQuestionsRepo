# Kubernetes Learning Notes — Complete Guide

A comprehensive set of Kubernetes learning notes covering everything from fundamentals to security, reliability, and production tooling.

---

## Table of Contents

**Part 1: Core Kubernetes**
- [1. Kubernetes Fundamentals](#1-kubernetes-fundamentals)
- [2. Pods & Containers](#2-pods--containers)
- [3. Deployments & Workloads](#3-deployments--workloads)
- [4. Kubernetes Networking](#4-kubernetes-networking)
- [5. Services, Ingress & Traffic Routing](#5-services-ingress--traffic-routing)

**Part 2: AWS & Request Flow**
- [6. EKS](#6-eks)
- [7. End-to-End Request Flow](#7-end-to-end-request-flow)

**Part 3: DNS & Configuration**
- [8. Kubernetes DNS & FQDNs](#8-kubernetes-dns--fqdns)
- [9. Configuration & Secrets](#9-configuration--secrets)

**Part 4: Storage, Scaling & Helm**
- [10. Storage](#10-storage)
- [11. Scaling](#11-scaling)
- [12. Helm](#12-helm)

**Part 5: CI/CD & GitOps (Argo CD)**
- [13. CI/CD & GitOps](#13-cicd--gitops)
- [Argo CD Architecture](#argo-cd-architecture---whats-actually-running)
- [The Application CRD](#the-application-crd-fully-explained)
- [Sync Phases, Hooks, and Waves](#sync-phases-hooks-and-waves)
- [Health Checks](#health-checks---how-argo-cd-knows-something-is-healthy)
- [App of Apps and ApplicationSets](#app-of-apps-and-applicationsets---managing-many-applications)
- [RBAC in Argo CD](#rbac-in-argo-cd)
- [Multi-Cluster GitOps](#multi-cluster-gitops)
- [Notifications and Observability](#notifications-and-observability-of-argo-cd-itself)

**Part 6: Security, Reliability & Developer Tools**
- [15. Security](#15-security)
  - [15.1 Kubernetes RBAC](#151-kubernetes-rbac-role-based-access-control)
  - [15.2 Least Privilege](#152-least-privilege)
  - [15.3 IAM vs Kubernetes RBAC](#153-iam-vs-kubernetes-rbac)
  - [15.4 IRSA / EKS Pod Identity](#154-irsa--eks-pod-identity)
  - [15.5 NetworkPolicy](#155-networkpolicy)
  - [15.6 Security Groups](#156-security-groups)
  - [15.7 Secrets Management](#157-secrets-management)
  - [15.8 Image Scanning](#158-image-scanning)
  - [15.9 Non-root Containers](#159-non-root-containers)
  - [15.10 Read-only Root Filesystem](#1510-read-only-root-filesystem)
  - [15.11 Pod Security Standards](#1511-pod-security-standards-basic-understanding)
- [16. Reliability & Production](#16-reliability--production)
  - [16.1 Pod Availability & Replica Redundancy](#161-pod-availability--replica-redundancy)
  - [16.2 Multi-AZ Deployments](#162-multi-az-deployments)
  - [16.3 Readiness During Deployments](#163-readiness-during-deployments)
  - [16.4 Graceful Termination](#164-graceful-termination)
  - [16.5 Rolling Updates](#165-rolling-updates)
  - [16.6 Health Checks](#166-health-checks)
  - [16.7 Resource Requests and Limits](#167-resource-requests-and-limits)
  - [16.8 Noisy Neighbor Problem](#168-noisy-neighbor-problem)
  - [16.9 Node Failure & Pod Eviction](#169-node-failure--pod-eviction)
  - [16.10 Taints and Tolerations](#1610-taints-and-tolerations-basic-understanding)
  - [16.11 Stateless vs Stateful Services](#1611-stateless-vs-stateful-services)
  - [16.12 Disaster Recovery Basics](#1612-disaster-recovery-basics)
  - [16.13 Backup and Restore Basics](#1613-backup-and-restore-basics)
  - [16.14 Kubernetes Upgrade Strategy](#1614-kubernetes-upgrade-strategy)
- [17. Developer Tools](#17-developer-tools)
  - [17.1 kubectl](#171-kubectl)
  - [17.2 k9s](#172-k9s)
  - [17.3 Helm](#173-helm)
  - [17.4 Kustomize](#174-kustomize-basic-understanding)
  - [17.5 Docker](#175-docker)
  - [17.6 kubectl debug](#176-kubectl-debug)
  - [17.7 stern](#177-stern)
  - [17.8 jq / yq](#178-jq--yq)
  - [17.9 curl / dig / nslookup / netshoot](#179-curl--dig--nslookup--netshoot)
  - [17.10 Argo CD UI](#1710-argo-cd-ui)
  - [17.11 Prometheus / Grafana](#1711-prometheus--grafana)

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

---

## 6. EKS ⭐

### What EKS Provides
**Amazon EKS (Elastic Kubernetes Service)** is AWS's managed Kubernetes offering. AWS runs and operates the **control plane** for you (multi-AZ, patched, upgraded, backed by managed `etcd`) — you only manage the **worker nodes** (and even those can be handed off via Fargate). You get a standard, upstream-conformant Kubernetes API — anything that works on vanilla Kubernetes works on EKS.

```
┌─────────────────────────────────────────────┐
│      AWS-managed EKS Control Plane           │
│  (multi-AZ, HA, patched by AWS — you never   │
│   SSH into or directly manage this)          │
│                                               │
│  kube-apiserver | etcd | scheduler | ctrl-mgr│
└───────────────────┬───────────────────────────┘
                     │ EKS API endpoint (HTTPS)
   ┌─────────────────┼─────────────────────┐
   │                 │                     │
┌──▼─────────┐  ┌────▼───────┐      ┌──────▼──────┐
│ Managed     │  │ Managed    │      │  Fargate     │
│ Node Group  │  │ Node Group │      │  (serverless │
│ (EC2)       │  │ (EC2, GPU) │      │   Pods)      │
└─────────────┘  └────────────┘      └──────────────┘
      your responsibility (patch, scale, secure)
```

### EKS Control Plane vs Worker Nodes
| | Control Plane | Worker Nodes |
|---|---|---|
| Who manages it | AWS | You (or Fargate abstracts it away) |
| What runs there | apiserver, etcd, scheduler, controller-manager | kubelet, kube-proxy, your Pods |
| High availability | AWS runs it across multiple AZs automatically | You choose multi-AZ node groups yourself |
| You pay for | A flat hourly cluster fee | EC2 instances / Fargate vCPU+memory used |

### Managed Node Groups
AWS-managed EC2 Auto Scaling Groups configured to automatically register as Kubernetes worker nodes, with AWS handling node provisioning, and (optionally) automated AMI/version upgrades and graceful node draining.

```bash
eksctl create nodegroup --cluster my-cluster --name workers --node-type t3.medium --nodes 3
```
You still choose: instance types, min/max/desired size, subnets, labels/taints — but AWS handles attaching them to the cluster and lifecycle operations like draining before termination.

### EC2 Instances in EKS
The literal virtual machines backing your worker nodes (whether in managed node groups or self-managed). Each EC2 instance runs `kubelet`, `kube-proxy`, the container runtime, and the AWS VPC CNI plugin, and registers itself as a Kubernetes `Node` object.

### Fargate (basic understanding)
A **serverless** compute option for EKS: instead of managing EC2 nodes at all, you define a **Fargate Profile** (matching namespace/labels), and matching Pods each get their own right-sized, isolated micro-VM — no node management, but no DaemonSets, and generally higher per-Pod cost than densely-packed EC2 nodes.

```yaml
# Fargate profile (conceptually) says:
# "any Pod in namespace 'serverless-apps' runs on Fargate, not EC2 nodes"
```

### EKS Cluster VPC
Every EKS cluster is deployed into a **VPC (Virtual Private Cloud)** — an isolated network. The control plane's Elastic Network Interfaces (ENIs) are attached into your VPC subnets so it can communicate with worker nodes, and Pods get IPs directly from VPC subnet CIDR ranges (via the VPC CNI) — meaning Pods are first-class VPC citizens, not hidden behind an overlay network.

### Public vs Private Subnets
- **Public subnets** — have a route to an **Internet Gateway**; typically host load balancers (ALBs/NLBs) that need direct internet exposure.
- **Private subnets** — no direct route to the internet; typically host worker nodes/Pods for security, reaching the internet indirectly via a **NAT Gateway** if needed.

```
        Internet
            │
    ┌───────▼────────┐
    │ Internet Gateway│
    └───────┬────────┘
    ┌───────▼─────────────────┐
    │   Public Subnet           │  ← ALB lives here
    └───────┬─────────────────┘
            │ (ALB forwards to)
    ┌───────▼─────────────────┐
    │   Private Subnet          │  ← Worker nodes / Pods live here
    │   (outbound via NAT GW)   │
    └────────────────────────────┘
```

### Availability Zones (AZs)
Physically separate data centers within an AWS region. Best practice: spread worker nodes (and the control plane, handled by AWS) across **at least 2-3 AZs** so a single AZ outage doesn't take down your whole application — combine with `topologySpreadConstraints` or anti-affinity rules to actually spread Pods across AZs too, not just nodes.

### EKS API Endpoint
The URL (`https://<cluster-id>.gr7.<region>.eks.amazonaws.com`) that `kubectl`/clients use to reach `kube-apiserver`. Can be configured as:
- **Public** — reachable from the internet (optionally restricted by CIDR allow-list).
- **Private** — reachable only from within the VPC (via a private VPC endpoint).
- **Public + Private** — both, common for hybrid access patterns.

### ECR (Elastic Container Registry)
AWS's managed Docker/OCI image registry. Worker nodes' IAM roles are typically granted `ecr:GetDownloadUrlForLayer`/`ecr:BatchGetImage` permissions so kubelet can pull images without needing separate `imagePullSecrets`.

```yaml
containers:
- name: app
  image: 123456789012.dkr.ecr.ap-south-1.amazonaws.com/my-app:1.4.2
```

### EKS Add-ons
AWS-managed installations of common cluster components, installable/upgradable via the EKS API/Console instead of manually applying YAML — AWS handles version compatibility with your control plane version.

- **CoreDNS add-on** — the managed version of cluster DNS (section 8).
- **kube-proxy add-on** — the managed version of the Service-routing component (section 4).
- **VPC CNI** — the networking plugin that assigns real VPC IPs to Pods (below).

```bash
aws eks create-addon --cluster-name my-cluster --addon-name vpc-cni
```

### VPC CNI
AWS's default CNI plugin for EKS. It assigns each Pod a real, routable **IP address from the VPC's subnet CIDR range** (via ENIs and secondary IPs attached to each EC2 node), meaning Pods are directly addressable within the VPC — no overlay/NAT needed for Pod-to-Pod or Pod-to-AWS-service traffic. Trade-off: subnet IP exhaustion is a real constraint — the number of Pods per node is limited by ENI/IP capacity of the instance type.

### EKS Cluster Upgrades
Kubernetes only supports upgrading **one minor version at a time** (e.g., 1.28 → 1.29, not 1.28 → 1.30 directly). For EKS:
1. AWS upgrades the **control plane** first (you trigger it; brief API disruption possible, but it's HA).
2. You then upgrade **add-ons** (CoreDNS, kube-proxy, VPC CNI) to compatible versions.
3. You then upgrade **worker nodes** (see below) to match.

### Node Upgrades
For managed node groups, EKS can perform a **rolling replace**: spin up new nodes on the new AMI/version, cordon + drain old nodes (gracefully evicting Pods, respecting PodDisruptionBudgets), then terminate the old nodes.

```bash
eksctl upgrade nodegroup --cluster my-cluster --name workers
```

### IAM Roles for EKS
AWS Identity and Access Management (IAM) controls *what AWS API actions* are allowed (e.g., "read this S3 bucket," "pull from ECR") — separate and complementary to Kubernetes RBAC, which controls *what Kubernetes API actions* are allowed. Node IAM roles grant permissions needed by kubelet itself (pulling from ECR, writing CloudWatch logs, etc).

### IRSA (IAM Roles for Service Accounts)
Lets you grant **fine-grained AWS permissions to individual Pods** (via their Kubernetes ServiceAccount) instead of giving every Pod on a node the same broad node-level IAM role.

```
ServiceAccount (annotated with an IAM role ARN)
        │
        ▼
   OIDC trust between EKS cluster and IAM
        │
        ▼
Pod using that ServiceAccount gets short-lived,
scoped AWS credentials automatically (no static keys)
```

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: s3-reader
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/s3-read-role
```
Any Pod using `serviceAccountName: s3-reader` can then call AWS APIs (e.g., read an S3 bucket) using exactly the permissions of that IAM role — nothing more.

### EKS Pod Identity
A newer, simpler alternative to IRSA (2023+) — removes the need to configure OIDC trust relationships manually. You install the "EKS Pod Identity Agent" add-on and create a direct association between a ServiceAccount and an IAM role via the EKS API, without touching OIDC provider trust policies — same end result as IRSA (scoped, short-lived AWS creds per Pod), simpler setup.

### Worked Example — Pulling It All Together on EKS
1. You provision an EKS cluster (AWS manages control plane) with a managed node group in private subnets across 3 AZs.
2. You enable the VPC CNI, CoreDNS, and kube-proxy add-ons.
3. Your Deployment's Pods get real VPC IPs from private subnets.
4. A Pod needs to read from S3 → you create an IAM role + IRSA-annotated ServiceAccount, so only *that* Pod (not the whole node) can access that S3 bucket.
5. Your app image lives in ECR; node IAM role permissions let kubelet pull it without extra secrets.
6. Traffic reaches Pods via an ALB (provisioned by the AWS Load Balancer Controller) sitting in public subnets, forwarding into private-subnet Pod IPs.

### Analogy
Think of **EKS** as renting a fully-managed apartment building's core infrastructure (plumbing, electricity, elevators = the control plane) from a landlord (AWS) who handles all the maintenance and never lets you touch the boiler room — you just move your furniture (Pods) into your own unit (worker nodes), which you're responsible for arranging and maintaining. **Fargate** is like upgrading to a serviced apartment where even your unit's cleaning and furniture setup is handled for you — pay-per-use, zero maintenance, but pricier per square foot and less flexible for unusual furniture (some workloads like DaemonSets don't fit).

**IRSA / EKS Pod Identity** is like giving individual employees (Pods) their own personal keycard scoped to only the rooms they need (a specific S3 bucket), rather than giving everyone in the building (every Pod on a node) a master key (the node's broad IAM role) — much safer if one employee's badge is compromised.

**Public vs private subnets** are like a hotel's layout: the **lobby and front desk** (public subnet, hosting the ALB) is where outside guests are allowed to walk in, but **guest rooms** (private subnet, hosting your Pods) are only reachable via the front desk directing you there — guests never wander directly into the private hallways.

---

## 7. End-to-End Request Flow ⭐

This section stitches together *everything* from Parts 1 and above into a single trace: **what actually happens between a user typing a URL and a database query returning data.**

### The Full Path, Visually

```
 User's Browser
       │  1. DNS lookup for shop.example.com
       ▼
 ┌───────────────┐
 │   Route 53     │  Domain → ALB (returns ALB's DNS/IP)
 └───────┬───────┘
       2. HTTPS request to ALB's address
       ▼
 ┌───────────────┐
 │      ALB       │  TLS terminated here; evaluates listener rules
 └───────┬───────┘
       3. matched rule → forward to Target Group
       ▼
 ┌───────────────┐
 │ Target Group   │  health-checked list of Pod IPs (ip mode) or Node:NodePort
 └───────┬───────┘
       4. forwards to a healthy target
       ▼
 ┌────────────────────────┐
 │  (conceptually)          │
 │  ALB → Ingress → Service │  the Ingress rule is what *configured* the ALB's
 │        → Pod             │  listener/rules/target-groups in the first place
 └───────┬────────────────┘
       5. request lands inside the Pod on its container port
       ▼
 ┌───────────────┐
 │  Container     │  app handles request
 │  Port 8080     │
 └───────┬───────┘
       6. app needs data → calls internal DB Service
       ▼
 ┌───────────────┐
 │ Pod → Database │  via Service DNS: db.production.svc.cluster.local
 └───────┬───────┘
       7. app also calls a 3rd-party API
       ▼
 ┌───────────────┐
 │ Pod → External │  routed: Pod → NAT Gateway → Internet Gateway → internet
 │      API        │
 └───────────────┘
```

### DNS Resolution
The very first step: the client's browser/OS resolves `shop.example.com` to an IP address, by querying DNS resolvers up the chain until an authoritative answer is found.

### Route 53
AWS's managed DNS service. Typically holds an **alias record** mapping your domain (`shop.example.com`) directly to the ALB's DNS name — alias records are Route-53-specific and avoid an extra DNS hop compared to a plain CNAME.

### Domain → ALB
```
shop.example.com  (Route 53 ALIAS record)
        │
        ▼
my-alb-1234567890.ap-south-1.elb.amazonaws.com
        │
        ▼
   ALB's actual IP(s) — AWS manages/rotates these
```

### ALB → Target Group
Once a request reaches the ALB and matches a listener rule (host/path), the ALB forwards it to the associated **Target Group** — the pool of registered, health-checked destinations.

### Target Group → Node / Pod
- `instance` mode: Target Group entries are `Node-IP:NodePort` → kube-proxy on that node forwards to a Pod (possibly on a *different* node, one extra network hop).
- `ip` mode: Target Group entries are **Pod IPs directly** (via VPC CNI) — no extra hop, ALB talks straight to the Pod.

### ALB → Ingress → Service → Pod
It's important to understand this isn't 4 separate network hops — the **Ingress object is a configuration source**, not a live traffic component:
```
Ingress YAML (rules)
      │  watched & translated by
      ▼
AWS Load Balancer Controller
      │  configures
      ▼
Real ALB (listeners, rules, target groups)
```
The Ingress "creates" the ALB's routing config once; after that, actual packets flow ALB → Target Group → Pod directly, without re-consulting the Ingress object per-request. The "Service" is what the Ingress/Target Group binding is based on (its selector determines which Pods are valid targets).

### Service → Container Port
Inside the cluster, a Service's `targetPort` field is what actually maps to the container's listening port — this is the final translation from "Service port" (what clients dial) to "the port the app process is bound to inside the container."

### Pod → Database
A typical backend Pod calls a database via its internal Service DNS name:
```
postgres://db.production.svc.cluster.local:5432/mydb
```
This resolves via CoreDNS to the DB Service's ClusterIP, then kube-proxy forwards to the actual DB Pod (or, more commonly in production, to an external managed DB like RDS, reached via a Service without selectors pointing at an external endpoint, or simply an external DNS name).

### Pod → External API
When a Pod calls something outside the cluster (e.g., a third-party payment API):
```
Pod (private subnet) → NAT Gateway (in public subnet) → Internet Gateway → Internet
```
The response follows the reverse path back through the NAT Gateway to the originating Pod. This works because a NAT Gateway allows **outbound-initiated** connections from private subnets to reach the internet, while keeping the private subnet itself unreachable from the internet.

### Private Subnet Routing
A private subnet's route table typically has:
```
Destination        Target
10.0.0.0/16 (VPC)  local
0.0.0.0/0           nat-gateway-id     ← outbound internet traffic
```
No route to an Internet Gateway means nothing can reach these subnets directly from the internet — traffic must arrive via something already inside the VPC (like an ALB in a public subnet forwarding in).

### NAT Gateway
A managed AWS resource, placed in a **public subnet**, that lets resources in **private subnets** initiate outbound connections to the internet (e.g., pulling a package, calling an external API) — without exposing those private resources to *inbound* internet traffic.

### Internet Gateway
Attached to the VPC itself; it's what allows **public subnets** to have direct two-way internet connectivity (used by both the ALB for inbound traffic and the NAT Gateway for outbound-on-behalf-of-private-subnets traffic).

### VPC Routing Tables
Every subnet is associated with a route table that decides, per-destination-CIDR, where traffic should be sent next (`local`, an Internet Gateway, a NAT Gateway, a peering connection, etc). Misconfigured route tables are a very common cause of "Pod can't reach the internet" or "Pod can't reach another VPC" issues.

### Security Groups
Stateful, **instance/ENI-level** firewalls in AWS — since Pods get their own ENI-backed IPs via VPC CNI, Security Groups can even be applied to individual Pods (`SecurityGroupPolicy`) in EKS, not just nodes. They control what IP/port traffic is allowed in/out at the AWS networking layer, separate from and in addition to Kubernetes NetworkPolicy.

### Network ACL Basics
Stateless, **subnet-level** firewalls in AWS (evaluated before Security Groups, in both directions independently since they're stateless). Usually left permissive by default, with Security Groups doing the fine-grained work — but overly restrictive NACLs are a classic hard-to-diagnose cause of connectivity issues since they silently drop traffic with no application-level error.

### Why a Pod May Not Reach the Internet
Checklist, in likely-cause order:
1. Pod is in a **private subnet** with no route to a NAT Gateway (missing/misconfigured route table entry).
2. **Security Group** on the node/Pod ENI blocks outbound traffic.
3. **NetworkPolicy** denies egress for that Pod.
4. **NACL** on the subnet blocks the traffic.
5. DNS resolution itself is failing (see Part 3, section 8) — looks like "can't reach the internet" but is actually a DNS problem.

### Why One Service May Not Reach Another
Checklist:
1. **Selector mismatch** — the Service's `selector` doesn't match any Pod's labels → zero Endpoints. Check with `kubectl get endpointslices`.
2. Target Pods are **not Ready** (failing readiness probe) → excluded from Endpoints even if the Service exists.
3. **NetworkPolicy** blocks traffic between the calling and target Pods' namespaces/labels.
4. Wrong `targetPort` — Service points at a port the container isn't actually listening on.
5. DNS misconfiguration — calling the wrong FQDN, or missing cross-namespace suffix.

### Analogy
The whole end-to-end flow is like **ordering a package online and having it delivered to a specific apartment in a large gated complex**:
- **Route 53** is the shipping company's system looking up which distribution center (ALB) handles your address.
- The **ALB** is the complex's front gate security desk — it checks your package's label (host/path), decides which building it belongs to (Target Group), and only lets it through if that building's mailroom (health checks) is confirmed open and staffed.
- The **Ingress** is not a physical checkpoint at all — it's the **instruction sheet** the complex management (AWS Load Balancer Controller) used to originally configure the front gate's rules; the gate doesn't re-read the instruction sheet for every single package, it just runs by the rules already programmed.
- The **Target Group** is the mailroom's current active resident list (which apartments — Pods — are currently occupied and accepting deliveries).
- Once inside, if the resident (Pod) needs groceries delivered (a database call), they call the **building's internal intercom system** (Service DNS) rather than knowing every grocery truck's exact location.
- If the resident wants to order something from outside the complex entirely (an external API), they can't be reached directly from outside (private subnet, no direct route in) — but they *can* place outbound orders, which leave via the complex's single loading dock (**NAT Gateway**) connected to the public road (**Internet Gateway**), and the delivery finds its way back to them because the dock remembers which resident placed which order.
- **Security Groups** are the individual apartment door locks; **NACLs** are the perimeter fence rules for the whole complex — both must allow the traffic, or the delivery never arrives, often with no explanation given back to the sender (silent drops).

---

*Next parts will cover: Kubernetes DNS & FQDNs (in more depth), Configuration & Secrets, Storage, Scaling, Helm, CI/CD & GitOps, Observability & Debugging, Security, Reliability & Production, and Developer Tools.*

---

## 8. Kubernetes DNS & FQDNs ⭐

### What DNS Is
DNS (Domain Name System) translates human-readable names (`google.com`, `backend-service`) into IP addresses that computers actually use to route traffic. It's a distributed, hierarchical lookup system — no single server knows every name; instead, servers know how to ask the *next* server up (or down) the chain.

### What an FQDN Is
A **Fully Qualified Domain Name** is a complete, unambiguous name that specifies exact location in a naming hierarchy, with no reliance on any implicit default/search domain.

```
backend.production.svc.cluster.local
   │        │        │      │
   │        │        │      └── cluster's DNS root/domain
   │        │        └──────── always "svc" for a Service record
   │        └───────────────── namespace the Service lives in
   └────────────────────────── Service name
```
Compare: `backend` (short name — only works if the caller's own search domains fill in the rest) vs the FQDN above (works from *anywhere*, unambiguous).

### Kubernetes Service DNS
Every Service (in every namespace) automatically gets a DNS `A`/`AAAA` record (and `SRV` records for named ports) pointing to its ClusterIP — created and kept in sync automatically the moment you create the Service object, no manual DNS config needed.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: production
spec:
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 8080
```
The instant this is applied, `backend.production.svc.cluster.local` starts resolving to that Service's ClusterIP cluster-wide.

### `<service>.<namespace>.svc.cluster.local`
This is the canonical DNS pattern for **every** Kubernetes Service, always in this order: service name → namespace → `svc` → cluster domain (`cluster.local` by default, but can be customized at cluster-creation time).

```
payment-api.checkout.svc.cluster.local
```
reads as: "the `payment-api` Service, in the `checkout` namespace, which is a Service (`svc`), in this cluster (`cluster.local`)."

### Short DNS Names
Each Pod's `/etc/resolv.conf` includes a `search` list based on its own namespace:
```
search production.svc.cluster.local svc.cluster.local cluster.local
nameserver 10.100.0.10   # CoreDNS's ClusterIP
```
So from a Pod *in* the `production` namespace, simply calling `backend` gets automatically expanded/tried against each search suffix until one resolves — landing on `backend.production.svc.cluster.local`. This is why same-namespace communication typically just uses the short name.

### Cross-Namespace Communication
Calling a Service in a *different* namespace than the caller requires including at least the namespace in the name — the short name alone won't resolve correctly, because the search domain only auto-appends the **caller's own** namespace by default.

```
# Pod in "checkout" namespace calling a Service in "inventory" namespace:
curl http://inventory-service.inventory.svc.cluster.local
# or the shorter (still cross-namespace-safe) form:
curl http://inventory-service.inventory
```
Best practice: always use at least `<service>.<namespace>` for cross-namespace calls — relying on bare short names across namespaces is a common source of subtle bugs when namespace context changes (e.g., copy-pasting a manifest into a new namespace).

### CoreDNS
The default cluster DNS server for Kubernetes, running as a Deployment of Pods (usually in `kube-system`), exposed via its own Service (`kube-dns`, historically named, still used as the ClusterIP every Pod points to). It watches the Kubernetes API for Services/Endpoints/Pods and dynamically serves DNS records reflecting current cluster state — when a Service is deleted, its DNS record disappears immediately.

```
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl get configmap coredns -n kube-system -o yaml   # see its Corefile config
```

### Pod DNS
Pods themselves *can* get DNS records too, but only in specific cases (usually via a headless Service backing a StatefulSet — see below). A regular Pod's own bare IP is not normally given a friendly DNS name; you look Pods up **through** their owning Service instead.

`dnsPolicy` on a Pod controls where it gets its DNS config from:
- `ClusterFirst` (default) — use cluster DNS (CoreDNS), with the cluster domain search paths.
- `Default` — inherit the *node's* DNS settings.
- `None` — fully custom (`dnsConfig` field), useful for special networking cases.

### External DNS Resolution
Cluster DNS also handles lookups for names *outside* the cluster (e.g., `api.stripe.com`) by forwarding those queries upstream to the DNS servers configured on the node (or a configured upstream resolver), rather than trying to resolve them itself.

```
Pod queries "api.stripe.com"
        │
        ▼
   CoreDNS: "not a cluster.local name, doesn't match any Service"
        │
        ▼
  forwards query upstream (e.g., to VPC's default resolver / Route 53 Resolver)
        │
        ▼
   returns external IP back to the Pod
```

### Route 53 Private Hosted Zones (basic understanding)
On AWS/EKS, if you need Pods to resolve *internal, non-Kubernetes* names (e.g., an RDS database's custom internal name, or a name shared with other AWS services in the VPC) without exposing them publicly, a **Route 53 Private Hosted Zone** associated with your VPC lets you define private DNS records only resolvable from within that VPC — CoreDNS's upstream forwarding to the VPC resolver picks these up transparently, same as any other external-to-cluster name.

### Headless Service DNS
A headless Service (`clusterIP: None`) skips the "one virtual load-balanced IP" behavior; instead, its DNS name resolves directly to **all matching Pod IPs** (as multiple `A` records), letting a client discover and choose between individual Pods itself.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kafka-headless
spec:
  clusterIP: None
  selector:
    app: kafka
  ports:
  - port: 9092
```
```bash
nslookup kafka-headless.production.svc.cluster.local
# Returns multiple A records — one per matching, Ready Pod — instead of one ClusterIP
```

### StatefulSet DNS
When a headless Service fronts a **StatefulSet**, each Pod additionally gets its **own stable, individually-addressable DNS name**, in the pattern:
```
<pod-name>.<headless-service-name>.<namespace>.svc.cluster.local
```
Example — a 3-replica Kafka StatefulSet named `kafka` behind headless Service `kafka-headless` in namespace `data`:
```
kafka-0.kafka-headless.data.svc.cluster.local
kafka-1.kafka-headless.data.svc.cluster.local
kafka-2.kafka-headless.data.svc.cluster.local
```
This is exactly why StatefulSets are used for clustered/quorum-based systems — each member needs a *predictable, stable identity* to be addressed by peers even across restarts, unlike regular Pods' random names/IPs.

### DNS Debugging with nslookup, dig, curl
Standard toolkit for diagnosing "why can't my Pod reach X" issues — usually run from a throwaway debug Pod since minimal app images often lack these tools:

```bash
kubectl run debug --rm -it --image=nicolaka/netshoot -- bash

# Inside the debug Pod:
nslookup backend.production.svc.cluster.local     # does DNS resolve at all?
dig backend.production.svc.cluster.local          # more detail: which server answered, TTL, record type
dig +short backend.production.svc.cluster.local   # just the resolved IP
curl -v http://backend.production.svc.cluster.local/health   # does the app actually respond once resolved?
cat /etc/resolv.conf                              # confirm nameserver + search domains are as expected
```

Common failure signatures:
| Symptom | Likely cause |
|---|---|
| `nslookup` fails entirely, even for cluster names | CoreDNS Pods down/unreachable, or `resolv.conf` misconfigured (`dnsPolicy`) |
| `nslookup` works for short name but not FQDN (or vice versa) | search-domain vs typo issue — double check namespace spelling |
| DNS resolves, but `curl` times out/connection refused | not a DNS problem — check Service `targetPort`, Pod readiness, NetworkPolicy |
| Works from one namespace, fails from another | forgot the namespace in a cross-namespace short name |
| Intermittent DNS failures under load | known UDP DNS race/conntrack issue in some CNI/kube-proxy setups — consider CoreDNS `ndots` tuning or a local DNS cache (NodeLocal DNSCache) |

### Worked Example — Tracing a Real DNS Bug
Symptom: `checkout` service intermittently fails to call `payment-api`, error `Could not resolve host: payment-api`.

```bash
kubectl get pods -n checkout    # confirm caller's namespace
kubectl get svc -n payments payment-api   # confirm it actually lives in "payments", not "checkout"!
```
Root cause found: the caller in `checkout` was using the bare short name `payment-api`, which only auto-expands to `payment-api.checkout.svc.cluster.local` — but the real Service lives in the `payments` namespace, so that lookup fails. Fix: use the cross-namespace-safe form.
```
# before (broken):
http://payment-api
# after (fixed):
http://payment-api.payments.svc.cluster.local
```

### Analogy
Kubernetes DNS is like a company's **internal phone directory system**, organized by department:
- The **FQDN** (`backend.production.svc.cluster.local`) is like dialing a colleague's full extension including their department and building — works from anywhere in the company, unambiguous.
- The **short name** (`backend`) is like just saying a colleague's first name out loud — it only works reliably if you're asking someone *in the same department* (namespace), because the department's own reception desk (search domain) automatically assumes you mean someone local.
- **CoreDNS** is the company operator who keeps this directory perfectly up to date in real time — the moment someone joins or leaves (a Service is created/deleted), the directory updates immediately, no manual edits needed.
- A **headless Service** is like a department where, instead of routing your call to "whoever's free" through one shared department line (ClusterIP), the operator gives you the **direct extensions of every single person in that department**, letting you choose who to call yourself — useful when you specifically need to reach *this exact* team member (e.g., `kafka-0`, the one holding a specific piece of data), not just "anyone available."
- `dig` and `nslookup` are like calling the operator yourself and asking "what number do you have on file for this name?" — useful for confirming whether a directory problem or an actual line problem is causing your call to fail.

---

## 9. Configuration & Secrets

### ConfigMap
A **ConfigMap** stores non-sensitive configuration data as key-value pairs, decoupled from your container image — so you can change config without rebuilding/redeploying a new image.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  LOG_LEVEL: "info"
  FEATURE_FLAG_NEW_UI: "true"
  app.properties: |
    max_connections=100
    timeout_seconds=30
```

### Secret
A **Secret** is structurally almost identical to a ConfigMap, but intended for **sensitive** data (passwords, API keys, TLS certs). Values are stored **base64-encoded** (not encrypted by default — see below) and Kubernetes applies some extra protections around them (e.g., not printed in `kubectl describe` output by default).

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: production
type: Opaque
data:
  username: YWRtaW4=          # base64 for "admin"
  password: c3VwZXJzZWNyZXQ=  # base64 for "supersecret"
```
```bash
echo -n 'admin' | base64          # encode
echo -n 'YWRtaW4=' | base64 -d    # decode — proves base64 is NOT encryption, just encoding!
```
**Important:** base64 is trivially reversible by anyone with read access to the Secret object — real protection comes from RBAC restricting *who* can read Secrets, plus optionally enabling **encryption at rest** in etcd, and/or using an external secrets system (below).

### Environment Variables
The most common way to inject ConfigMap/Secret values into a container — each becomes a normal env var the app reads at startup, no application code changes needed to be "Kubernetes-aware."

```yaml
containers:
- name: app
  envFrom:
  - configMapRef:
      name: app-config
  env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: password
```
Downside: env vars are set once at container start — updating the ConfigMap/Secret does **not** update already-running containers' env vars; the Pod must be restarted to pick up new values.

### Mounted Configuration Files
Alternatively, mount a ConfigMap or Secret as **files** in the container's filesystem — each key becomes a filename, its value becomes the file's contents.

```yaml
containers:
- name: app
  volumeMounts:
  - name: config-volume
    mountPath: /etc/config
volumes:
- name: config-volume
  configMap:
    name: app-config
```
Result inside the container: `/etc/config/LOG_LEVEL` (file containing `info`), `/etc/config/app.properties` (file containing the multi-line properties block).

**Key advantage over env vars:** mounted ConfigMap/Secret volumes are **automatically updated** on the filesystem (usually within ~60 seconds) when the underlying object changes — no Pod restart needed, though your *application* still needs logic to detect the file changed and reload (Kubernetes won't do that part for you).

### ConfigMap vs Secret
| | ConfigMap | Secret |
|---|---|---|
| Purpose | Non-sensitive config | Sensitive data (passwords, tokens, certs) |
| Encoding | Plain text | Base64 (not encryption by default) |
| `kubectl describe` output | Shows values | Hides values (shows only key names) |
| Encryption at rest | Optional (etcd encryption) | Strongly recommended to enable |
| RBAC sensitivity | Normal | Should be tightly restricted |

### Secret Rotation (basic understanding)
Changing a Secret's value (e.g., rotating a database password) doesn't automatically make running Pods pick it up if using env vars (must restart Pods); mounted-volume Secrets update on disk automatically but the app must reload them. Proper rotation strategies:
- Use mounted volumes + an app that watches the file for changes (or a sidecar that triggers a reload/restart on change).
- Or perform a rolling restart of the Deployment after rotating (`kubectl rollout restart deployment/my-app`) to force fresh env vars everywhere.
- For external secret stores (below), some come with native rotation + automatic sync back into Kubernetes Secrets on a schedule.

### AWS Secrets Manager
An AWS service purpose-built for storing, encrypting, auditing access to, and **automatically rotating** secrets (e.g., it can rotate an RDS password and update the RDS instance *and* the secret value together, on a schedule) — generally preferred over native Kubernetes Secrets for anything requiring compliance-grade auditing or automated rotation.

### AWS Systems Manager Parameter Store
A simpler, often cheaper AWS key-value config/secret store (supports both plain "String" and encrypted "SecureString" types) — commonly used for configuration values and simpler secrets that don't need Secrets Manager's advanced rotation workflows.

### External Secrets Operator (basic understanding)
A Kubernetes controller that syncs secrets **from** an external system (AWS Secrets Manager, Parameter Store, HashiCorp Vault, etc.) **into** native Kubernetes Secret objects automatically and on a refresh interval — giving you the operational/compliance benefits of a centralized external secret store while your application code still just reads a normal Kubernetes Secret, unaware anything external is involved.

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: db-credentials       # the K8s Secret this creates/updates
  data:
  - secretKey: password
    remoteRef:
      key: prod/db/password    # the key in AWS Secrets Manager
```

```
AWS Secrets Manager (source of truth, rotates automatically)
         │  synced periodically by
         ▼
External Secrets Operator (runs in-cluster)
         │  creates/updates
         ▼
Native Kubernetes Secret "db-credentials"
         │  mounted/env-injected as usual
         ▼
      Your Pod
```

### Why Secrets Should Not Be Committed to Git
Committing raw Secret manifests (even base64-encoded ones) to Git is a serious security risk because:
1. **Base64 is not encryption** — anyone with repo read access can decode it instantly.
2. Git history is effectively permanent — deleting a file in a later commit doesn't erase it from history; the exposed secret must be treated as compromised and **rotated**, not just removed from the file.
3. Repos are often more broadly readable (many engineers, CI systems, sometimes external contractors) than the actual production Secret objects in the cluster (protected by Kubernetes RBAC).

Safer GitOps-friendly patterns:
- Store `ExternalSecret` manifests in Git (these only contain *references* to secret names/paths, not actual values) and let External Secrets Operator pull real values from AWS Secrets Manager/Vault at runtime.
- Or encrypt secrets *before* committing using tools like **Sealed Secrets** or **SOPS**, so only the cluster (holding the decryption key) can actually read the real values — the encrypted blob in Git is safe to store.

### Worked Example — From Zero to a Working Secret-Backed App
```bash
# 1. Store the real secret centrally (outside Git)
aws secretsmanager create-secret --name prod/db/password --secret-string 'S3cur3P@ss'

# 2. Commit only a *reference* to Git (safe to commit)
cat <<EOF > external-secret.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  secretStoreRef: {name: aws-secrets-manager, kind: SecretStore}
  target: {name: db-credentials}
  data:
  - secretKey: password
    remoteRef: {key: prod/db/password}
EOF
kubectl apply -f external-secret.yaml

# 3. External Secrets Operator creates the real K8s Secret "db-credentials" automatically

# 4. App Pod references it as normal, unaware of AWS entirely:
kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 -d
```

### Analogy
A **ConfigMap** is like a restaurant's publicly-posted menu board — anyone can look at it, it just describes settings (today's specials, prices), nothing to hide. A **Secret** is like the safe combination written on a sticky note — *technically* anyone who finds the note can read it (base64 = a note written upside-down, not actually locked), so real security depends on **who's allowed into the room** (RBAC) and ideally putting the note in an actual **locked safe** (encryption at rest / external secret managers) rather than trusting that nobody looks at an upside-down note.

**Environment variables vs mounted files** are like handing someone a printed copy of instructions (env vars — fixed at the moment you handed it over; if the instructions change, they're still holding the old printout until you hand them a new one/they restart) versus pointing them to a **shared bulletin board** (mounted volume — you can update the posted notice anytime, and it's automatically visible; but the reader still has to *notice* the paper changed and read it again to actually act on it).

**AWS Secrets Manager + External Secrets Operator** is like hiring a professional key-management service that keeps the *real* master key in a bank vault (with tracked access logs and scheduled key changes/rotation), while your building only ever holds a **temporary, revocable copy** of the key (the synced Kubernetes Secret) — if the temporary copy is compromised, you rotate the master key at the vault and the building's copy is automatically refreshed, without ever having stored the "real" long-term secret sitting around in an easily-copied place (like a Git repo).

---

*Next parts will cover: Storage, Scaling, Helm, CI/CD & GitOps, Observability & Debugging, Security, Reliability & Production, and Developer Tools.*

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

---

## 13. CI/CD & GitOps ⭐

This part goes deeper than earlier ones because CI/CD and GitOps are where all the previous concepts (Deployments, Helm, EKS, ECR) actually get wired together into a real, repeatable delivery pipeline.

### The Big Picture First

```
┌──────────────────────────────── CI (Continuous Integration) ───────────────────────────────┐
│                                                                                                │
│   Developer          Git Push          CI Pipeline           Build           Push             │
│   writes code  ────► to feature ────► (test, lint,   ────► container ────► image to          │
│                       branch            build)                image           ECR              │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                                    │
                                                                                    │ new image tag
                                                                                    ▼
┌──────────────────────────────── CD (Continuous Delivery/Deployment) — GitOps style ─────────┐
│                                                                                                │
│   CI pipeline           Git repo            Argo CD              Reconciles           Cluster │
│   updates image ────► (source of  ────►  (watches Git,   ────►  cluster to  ────►    running │
│   tag in manifest       truth)             not the cluster)      match Git             new    │
│   repo/Helm values                                                                     version │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

The key mental shift from traditional CI/CD to **GitOps**: instead of your pipeline *pushing* changes directly into the cluster (`kubectl apply` from a CI runner with cluster credentials), a controller running **inside the cluster** *pulls* the desired state from Git and reconciles toward it. Git becomes the single source of truth for "what should be running," not just a place code lives.

---

### Build → Test → Image → Registry → Deploy

This is the standard CI/CD pipeline shape for a containerized app:

```
1. Build     — compile code / install dependencies
2. Test      — unit tests, lint, static analysis, maybe integration tests
3. Image     — package the app into a container image (Dockerfile build)
4. Registry  — push the tagged image to a registry (ECR)
5. Deploy    — update the running system to use the new image
```

Example GitHub Actions workflow implementing steps 1–4:

```yaml
name: build-and-push
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        run: |
          npm install
          npm test

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-ecr-push
          aws-region: ap-south-1

      - name: Login to ECR
        run: aws ecr get-login-password | docker login --username AWS --password-stdin 123456789012.dkr.ecr.ap-south-1.amazonaws.com

      - name: Build and push image
        run: |
          IMAGE_TAG=$(git rev-parse --short HEAD)
          docker build -t 123456789012.dkr.ecr.ap-south-1.amazonaws.com/my-app:$IMAGE_TAG .
          docker push 123456789012.dkr.ecr.ap-south-1.amazonaws.com/my-app:$IMAGE_TAG
          echo "IMAGE_TAG=$IMAGE_TAG" >> $GITHUB_ENV
```
Note step 5 (Deploy) is deliberately **not** `kubectl apply` here — under GitOps, this pipeline's job stops at "image is built and pushed." A separate step updates a *manifests* Git repo, and Argo CD takes it from there (see below).

### Docker Image Tagging
How you tag images has a big operational impact:

| Tag strategy | Example | Pros | Cons |
|---|---|---|---|
| `:latest` | `my-app:latest` | Simple | **Never use in production** — not reproducible, can't roll back reliably, caching issues |
| Git SHA | `my-app:a1b2c3d` | Immutable, traceable to exact commit | Not human-friendly |
| Semantic version | `my-app:1.4.2` | Human-friendly, follows release process | Requires a versioning/release discipline |
| SHA + branch | `my-app:main-a1b2c3d` | Traceable + readable | Slightly longer |

**Best practice:** tag with the Git SHA (or SHA + semver) so every image is immutable and traceable back to an exact commit — never redeploy by re-pushing the same mutable tag.

### ECR (recap in CI/CD context)
ECR is where built images land after step 3–4. In GitOps flows, the pipeline's *only* interaction with the cluster/registry is: build image → push to ECR → **update a manifest in Git with the new tag**. It never touches the cluster directly.

### Kubernetes Image Pulling
Once a Deployment's manifest references the new tag, the actual pull happens on the node when a new Pod is scheduled:
```yaml
containers:
- name: app
  image: 123456789012.dkr.ecr.ap-south-1.amazonaws.com/my-app:a1b2c3d
  imagePullPolicy: IfNotPresent
```
`IfNotPresent` avoids re-pulling an already-cached image (faster, cheaper) — safe specifically *because* tags are immutable (Git SHA), so "already have this tag cached" reliably means "already have this exact code."

### Deployment Pipelines
A **deployment pipeline** is the ordered sequence of environments a change flows through before reaching production, usually with increasing levels of caution/gates:

```
main branch merge
       │
       ▼
   ┌───────┐    auto-deploy     ┌───────────┐   manual approval   ┌────────────┐
   │  Dev   │ ─────────────────► │  Staging   │ ───────────────────► │ Production │
   └───────┘                    └───────────┘                      └────────────┘
   fast feedback,                integration tests,                  careful, gated,
   frequent deploys              QA sign-off                         often canary/blue-green
```

### Helm-based Deployments (in a CI/CD Pipeline)
Combining Helm with GitOps: the CI pipeline doesn't run `helm install/upgrade` directly either — it updates the chart's `values.yaml` (or a values overlay) in the manifests repo with the new image tag, and Argo CD (which understands Helm charts natively) renders and applies it.

```yaml
# values-prod.yaml (in the manifests Git repo — this is what CI updates)
image:
  repository: 123456789012.dkr.ecr.ap-south-1.amazonaws.com/my-app
  tag: a1b2c3d     # ← CI pipeline bumps this line via a commit, nothing else
```

### Argo CD
A **GitOps continuous delivery controller** for Kubernetes. It runs inside (or alongside) your cluster, continuously watches one or more Git repositories for the desired state (plain YAML, Helm charts, or Kustomize), and automatically (or on approval) reconciles the live cluster to match.

```
┌─────────────────┐        watches         ┌──────────────────┐
│  Git repo         │ ◄─────────────────── │   Argo CD           │
│  (manifests/Helm   │                      │  (runs in-cluster)  │
│   values, desired  │ ──── compares to ──► │                     │
│   state)           │                      │  live cluster state │
└─────────────────┘                        └──────────────────┘
                                                     │
                                          if different (drift/new commit)
                                                     ▼
                                          applies changes to reconcile
```

Argo CD "Application" object — this is what tells Argo CD *what* to sync and *from where*:
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/my-org/my-app-manifests.git
    targetRevision: main
    path: helm/my-app
    helm:
      valueFiles:
      - values-prod.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true        # delete resources removed from Git
      selfHeal: true      # auto-correct manual cluster drift back to Git's state
```

### GitOps (the Principle)
GitOps is a set of practices, not a specific tool (Argo CD is just one popular implementation):
1. **Declarative** — the entire desired system state is described declaratively (YAML/Helm/Kustomize).
2. **Versioned in Git** — that desired state lives in Git, giving you history, code review (PRs), and an audit trail for free.
3. **Pulled, not pushed** — an in-cluster agent pulls and applies changes; CI never holds direct cluster credentials.
4. **Continuously reconciled** — the agent constantly checks live state vs Git and corrects drift automatically.

### Desired State in Git
Under GitOps, Git isn't just "where the code lives" — it becomes the **literal source of truth for what's running in production**. If it's not in Git, it's not supposed to be in the cluster; if the cluster differs from Git, that's "drift" to be corrected (or, if intentional, immediately captured back into Git).

### Reconciliation
The continuous control loop: Argo CD periodically (and on webhook-triggered Git changes) diffs **live cluster state** against **Git's desired state**, and if `selfHeal` is enabled, automatically re-applies to correct any difference — same reconciliation philosophy as native Kubernetes controllers (Part 1), just one layer up, reconciling "cluster vs Git" instead of "Pods vs ReplicaSet spec."

```
        ┌─────────────┐
        │  Git (desired)│
        └──────┬───────┘
               │ compare
               ▼
        ┌─────────────┐
        │ Live cluster  │
        │  (actual)     │
        └──────┬───────┘
               │ diff found?
        ┌──────┴───────┐
        │              │
       yes             no
        │              │
        ▼              ▼
   apply changes    do nothing,
   to match Git      check again later
```

### Drift Detection
Argo CD's UI/CLI shows drift status per Application: **Synced** (cluster matches Git exactly) or **OutOfSync** (something differs — either Git changed, or someone manually modified the cluster with `kubectl` directly). Drift most commonly comes from:
- A legitimate new commit to the manifests repo (expected, will be synced).
- Someone running `kubectl edit`/`kubectl scale` directly against the cluster, bypassing Git entirely (usually **unwanted** — this is exactly what `selfHeal: true` reverts).

### Rollbacks (GitOps Style)
Because desired state lives in Git, a rollback is just a **Git operation**, not a special Kubernetes command:
```bash
git revert <bad-commit-sha>
git push
# Argo CD detects the new commit and automatically reconciles the cluster
# back to the previous state — no need to touch kubectl or helm directly
```
This is a major GitOps advantage: rollback = revert a commit = the exact same mechanism as any other change, fully audited via normal Git history (who reverted, when, why — in the commit message/PR).

### Environment-specific Configuration
Typical repo layout separating shared templates from per-environment values (echoing the Helm pattern from Part 4, now tied into Argo CD Applications):

```
my-app-manifests/
├── helm/
│   └── my-app/
│       ├── templates/
│       ├── values.yaml           # shared defaults
│       ├── values-dev.yaml
│       ├── values-staging.yaml
│       └── values-prod.yaml
└── argocd-apps/
    ├── my-app-dev.yaml            # Argo CD Application pointing at values-dev.yaml
    ├── my-app-staging.yaml
    └── my-app-prod.yaml
```

### Dev / Staging / Production Deployments
Common GitOps pattern: separate Argo CD Applications per environment, often with **different sync policies** reflecting how much caution each environment needs:

```yaml
# my-app-dev.yaml — fully automated, no human gate
syncPolicy:
  automated:
    prune: true
    selfHeal: true

# my-app-prod.yaml — require manual sync approval
syncPolicy: {}   # manual sync only — someone clicks "Sync" in the Argo CD UI (or a pipeline gate does)
```
A common flow: a commit to `main` auto-deploys to `dev` and `staging` immediately; a **separate, explicit action** (merging to a `production` branch, tagging a release, or manually clicking "Sync" in Argo CD) is required to promote to production.

### Blue-Green Deployment (basic understanding)
Run **two full environments** (blue = current live version, green = new version) simultaneously; once green is verified healthy, switch all traffic to it at once (typically by updating a Service selector or load balancer target group), keeping blue around briefly for instant rollback.

```
Before:  Service ──► [Blue: v1, v1, v1]      (Green: v2, v2, v2 — deployed, not receiving traffic yet)
Switch:  Service ──► [Green: v2, v2, v2]     (Blue kept warm for instant rollback if needed)
```
Not natively built into Kubernetes — implemented via two Deployments + manually (or tool-assisted) switching a Service's selector, or via Argo Rollouts (below).

### Canary Deployment (basic understanding)
Gradually shift a **small percentage** of traffic to the new version, watch metrics (error rate, latency), and progressively increase — the safest rollout strategy for catching bad releases before they affect all users.

```
Step 1:  95% traffic → v1,  5% traffic → v2   (watch metrics)
Step 2:  75% traffic → v1, 25% traffic → v2   (metrics still healthy? proceed)
Step 3:  25% traffic → v1, 75% traffic → v2
Step 4:   0% traffic → v1, 100% traffic → v2  (fully rolled out)
```
Requires traffic-splitting capability beyond a plain Kubernetes Service (which can't do weighted routing) — typically implemented with **Argo Rollouts** (an Argo CD companion project) or a service mesh (Istio/Linkerd), which can automate the whole progressive-traffic-shift + metric-analysis + auto-rollback-on-failure flow.

```yaml
# Simplified Argo Rollouts canary example
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: my-app
spec:
  strategy:
    canary:
      steps:
      - setWeight: 5
      - pause: {duration: 5m}
      - setWeight: 25
      - pause: {duration: 5m}
      - setWeight: 75
      - pause: {duration: 5m}
```

---

### Comparing the Two CD Models

| | Traditional CI/CD (push-based) | GitOps (pull-based) |
|---|---|---|
| Who applies changes | CI pipeline (`kubectl apply` from a runner) | An in-cluster agent (Argo CD) |
| Where do cluster credentials live | In CI system (secret risk) | Only inside the cluster (agent has them, CI doesn't) |
| Source of truth | Pipeline logs / whatever was last applied | Git, always |
| Drift handling | None — manual `kubectl` changes silently persist | Detected and (optionally) auto-corrected |
| Rollback | Re-run an old pipeline job, or manual `kubectl`/`helm` command | `git revert` |
| Auditability | Scattered across CI logs | Full Git history: who, what, when, why (PR description) |
| Multi-cluster fan-out | Pipeline must handle each cluster's auth/access | Each cluster runs its own Argo CD, all watching the same Git source |

---

### Best Practices

1. **Never let CI apply directly to production.** CI should stop at "image built & pushed, manifest updated in Git" — let the GitOps controller do the actual apply. This removes long-lived cluster credentials from your CI system entirely.
2. **Separate the app's source repo from the manifests/config repo.** Keeps CI (build/test) and CD (deploy) concerns decoupled — a manifest-only change (e.g., bumping replica count) doesn't need to trigger a full app rebuild, and vice versa.
3. **Immutable image tags, always.** Git SHA or semver — never `:latest`. This is what makes Git-based rollback actually deterministic.
4. **Enable `selfHeal` cautiously, environment by environment.** Great for dev/staging (catches manual drift immediately); for production, many teams prefer to *detect and alert* on drift rather than auto-correct instantly, in case a manual emergency change was intentional (e.g., an incident hotfix) — decide deliberately, don't just default it on everywhere.
5. **Use PR review on the manifests repo like you would on code.** Since Git *is* your deployment mechanism, an unreviewed bad commit there is just as dangerous as an unreviewed bad code merge — apply the same review/approval rigor.
6. **Progressive delivery for anything risky.** Canary or blue-green for production-critical services, paired with automated metric analysis (Argo Rollouts + Prometheus) so a bad release is caught and auto-rolled-back before most users ever see it.
7. **Keep environment differences in values files, not divergent templates.** One shared Helm chart/template set, environment-specific values only — divergent copy-pasted manifests per environment are a maintenance and drift nightmare (fixes applied to one environment silently missing from others).
8. **Tag/label everything with commit SHA and build metadata.** Makes "which exact code is running in prod right now" a one-command answer (`kubectl get deploy -o jsonpath='{.spec.template.spec.containers[0].image}'`), critical during incidents.
9. **Automate promotion gates, don't rely on memory.** Explicit pipeline stages/approvals between dev → staging → prod, not "someone remembers to manually deploy to prod later."

### Common Pitfalls

1. **CI pipeline holds broad, long-lived cluster credentials.** Defeats much of GitOps's security benefit; if the CI system is compromised, so is production. Fix: CI should only need registry push access; only the in-cluster Argo CD agent needs cluster-apply permissions.
2. **Mixing manual `kubectl` changes with GitOps-managed resources.** Someone runs `kubectl scale` or `kubectl edit` directly "just this once" during an incident — `selfHeal` silently reverts it minutes later, confusing everyone ("why did my fix disappear?"). Fix: for genuine emergencies, either disable auto-sync temporarily and *then* fix forward in Git immediately after, or make the emergency change via Git and use a fast-tracked pipeline.
3. **Using `:latest` or mutable tags with GitOps.** If the manifest always says `:latest`, Argo CD sees no diff on a new image push (the *text* in Git didn't change) — nothing gets deployed at all, or worse, a Pod restart silently pulls a different image than what's actually intended, breaking the "Git = truth" guarantee entirely.
4. **One giant Argo CD Application for everything.** Makes it hard to reason about sync status, blast radius, and permissions. Fix: split by service/team/environment into separate Applications (optionally organized under an "App of Apps" pattern for easier bulk management).
5. **No automated tests before the "Deploy" stage.** GitOps makes deployment mechanically easy and fast — which also means a broken image can reach production *faster* if testing gates are weak or skipped. Speed without quality gates just ships bugs quicker.
6. **Secrets committed directly into the manifests repo.** Even with GitOps' many benefits, this is the same anti-pattern as Part 3 warned about — use External Secrets Operator, Sealed Secrets, or SOPS-encrypted values instead of raw Secret YAML in Git.
7. **Ignoring drift alerts / letting Applications sit "OutOfSync" for a long time.** Undermines the entire "Git is truth" premise — an ignored drift means Git and the running system have quietly diverged, and nobody's sure which one is actually correct anymore.
8. **No rollback rehearsal.** Teams assume `git revert` + Argo CD sync "just works" for rollback but have never actually tested it — only discovering issues (e.g., a database migration that isn't backward-compatible) during a real incident, when it's too late to learn calmly.
9. **Canary/blue-green without real automated metric analysis.** Manually watching a dashboard for 5 minutes and eyeballing "looks fine" doesn't scale and is error-prone under incident pressure — invest in automated analysis (Argo Rollouts' `AnalysisTemplate` + Prometheus queries) that can auto-abort a bad rollout without a human needing to notice in time.

### Worked Example — A Full Trip From Commit to Production

```
1. Developer opens a PR on "my-app" source repo, merges to main.
2. CI pipeline: runs tests → builds image → tags "my-app:a1b2c3d" → pushes to ECR.
3. CI pipeline's last step: opens a PR against "my-app-manifests" repo,
   bumping helm/my-app/values-dev.yaml → image.tag: a1b2c3d
4. That PR auto-merges (dev is low-risk); Argo CD (watching this repo) detects
   the new commit within its poll interval (or instantly via a webhook).
5. Argo CD renders the Helm chart with the new values, diffs against the live
   "dev" cluster, sees the image tag differs, and applies the change.
6. New Pods roll out in dev via the Deployment's RollingUpdate strategy (Part 3).
7. QA/automated integration tests pass in dev → a human (or automated gate)
   promotes by merging the same tag bump into values-staging.yaml.
8. Same reconciliation happens for staging; more thorough tests run.
9. For production: a release manager opens a PR bumping values-prod.yaml,
   requiring 2 approvals (branch protection rule) before merge.
10. Once merged, Argo CD's "my-app-prod" Application (manual sync policy)
    shows "OutOfSync" — a human clicks "Sync" in the Argo CD UI (or an
    approved pipeline stage triggers it).
11. Argo Rollouts (if configured) executes a canary: 5% → 25% → 75% → 100%,
    with Prometheus-based automated analysis pausing/aborting the rollout
    if error rates spike at any step.
12. Fully rolled out. If something's later found wrong: `git revert` the
    values-prod.yaml commit → Argo CD reconciles back to the previous image
    tag automatically.
```

### Analogy
Think of **traditional push-based CI/CD** as a **catering company that lets any delivery driver walk directly into your kitchen with a master key** to restock your fridge with whatever they were told to bring — convenient, but if a driver's key or instructions are wrong (or stolen), your kitchen is directly exposed, and there's no independent record of what's actually supposed to be in the fridge versus what some driver happened to leave last.

**GitOps** flips this: instead of drivers holding a key to your kitchen, there's a **standing recipe card pinned on your fridge** (Git) that says exactly what should be inside, and a **live-in kitchen manager** (Argo CD) who lives in the house full-time, constantly checks the fridge against the recipe card, and restocks it themselves whenever the card changes — no outside delivery driver ever needs a key to your house at all. If someone sneaks in and swaps an ingredient without updating the recipe card (manual `kubectl` drift), the kitchen manager notices on their next check and quietly puts it back to match the card (`selfHeal`) — unless you've told them "hands off, I'm doing something special right now" (disabled auto-sync during an incident).

A **canary deployment** is like a chef testing a **new recipe on 5% of tonight's tables first** before serving it to the whole restaurant — if those five tables send plates back (bad metrics), the kitchen quietly reverts to the old recipe for everyone else, and only a handful of diners ever noticed anything different. A **blue-green deployment** is more like having **two entirely separate dining rooms** ready to go, and the moment the new one (green) is fully staffed and inspected, the host simply starts seating *all* new arrivals there instead — with the old room (blue) kept warm and ready in case you need to seat people back in it immediately.

And a **Git revert as rollback** is simply: "cross out the last line on the recipe card" — the kitchen manager (Argo CD) sees the card changed back and restocks the fridge (cluster) to match, exactly the same mechanism used for every other change, with the crossing-out itself permanently recorded in the recipe card's history for anyone to review later.

---

---


## Argo CD Architecture — What's Actually Running

Argo CD isn't one process — it's a set of components installed into your cluster (usually in an `argocd` namespace), each with a distinct job:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         argocd namespace                              │
│                                                                        │
│  ┌────────────────┐   ┌────────────────┐   ┌───────────────────┐    │
│  │ API Server       │   │ Repo Server      │   │ Application         │    │
│  │                  │   │                  │   │ Controller           │    │
│  │ - serves UI/CLI  │   │ - clones Git     │   │ - core reconcile     │    │
│  │ - gRPC/REST API  │   │   repos          │   │   loop               │    │
│  │ - auth (SSO/RBAC)│   │ - renders Helm/  │   │ - compares live vs   │    │
│  │ - triggers syncs │   │   Kustomize/raw  │   │   desired state      │    │
│  │                  │   │   YAML into      │   │ - applies changes    │    │
│  │                  │   │   final manifests│   │ - updates health/    │    │
│  │                  │   │                  │   │   sync status         │    │
│  └────────┬─────────┘   └────────┬─────────┘   └──────────┬──────────┘    │
│           │                       │                          │            │
│           └───────────────────────┴──────────────────────────┘            │
│                                    │                                       │
│                          ┌─────────▼─────────┐                            │
│                          │  Redis (cache)      │  caches rendered           │
│                          │                     │  manifests, app state       │
│                          └────────────────────┘                            │
│                                                                             │
│  ┌────────────────┐   ┌─────────────────────┐                             │
│  │ Dex (optional)   │   │ Notifications         │                             │
│  │ - SSO/OIDC login │   │ Controller            │                             │
│  └────────────────┘   │ - Slack/email/webhook  │                             │
│                        │   alerts on sync/health│                             │
│                        └─────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────┘
              │                                              │
              │ watches                                      │ applies to
              ▼                                              ▼
     ┌─────────────────┐                          ┌─────────────────────┐
     │  Git repositories │                          │  Kubernetes cluster(s)│
     │  (source of truth) │                          │  (one or many)        │
     └─────────────────┘                          └─────────────────────┘
```

- **API Server** — the front door; the UI, CLI (`argocd` command), and any automation talk to this. Handles authentication (local users, SSO via Dex/OIDC) and RBAC.
- **Repo Server** — clones your Git repos and does the actual templating work (runs `helm template`, `kustomize build`, or just reads raw YAML) to produce final Kubernetes manifests, without ever touching the cluster itself.
- **Application Controller** — the actual reconciliation engine. Continuously watches both the rendered manifests (from Repo Server) and live cluster state (via the Kubernetes API), computes the diff, and applies changes when needed. This is the component doing the "GitOps" work described in Part 5.
- **Redis** — caching layer so repeated diffs/renders aren't recomputed from scratch every time.
- **Dex** — optional SSO bridge (OIDC, SAML, LDAP, GitHub/Google login) so you don't need separate Argo CD-only user accounts.
- **Notifications Controller** — sends alerts (Slack, email, webhooks) when sync status or health changes — e.g., "Application X went OutOfSync" or "sync succeeded."

### Why This Matters
Understanding the split between Repo Server (renders manifests) and Application Controller (applies + reconciles) explains a lot of real-world Argo CD behavior: a broken Helm template causes a **rendering error** (visible in the UI as "ComparisonError," nothing gets touched in the cluster), which is a completely different failure mode from a manifest that renders fine but fails to **apply** (e.g., an invalid field value — a live "Sync failed" error). Debugging starts by figuring out which of these two stages actually failed.

---

## The Application CRD, Fully Explained

Everything in Argo CD centers on the `Application` custom resource. Here's a fuller example with commentary:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app-prod
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io   # ensures cluster resources are
                                                  # cleaned up if the Application
                                                  # itself is deleted
spec:
  project: production                # which AppProject this belongs to (see below)

  source:
    repoURL: https://github.com/my-org/my-app-manifests.git
    targetRevision: main              # branch, tag, or exact commit SHA
    path: helm/my-app
    helm:
      valueFiles:
        - values-prod.yaml
      parameters:                     # one-off overrides on top of the values file
        - name: image.tag
          value: a1b2c3d

  destination:
    server: https://kubernetes.default.svc   # or a remote cluster's API URL
    namespace: production

  syncPolicy:
    automated:
      prune: true          # delete resources that were removed from Git
      selfHeal: true        # revert manual/out-of-band cluster changes
      allowEmpty: false     # refuse to sync if rendering produces zero resources (safety net)
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - ApplyOutOfSyncOnly=true       # only touch resources that actually differ
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### `targetRevision` Deserves Extra Attention
This field decides exactly *what* Git state Argo CD tracks:
- A branch name (`main`) — Argo CD tracks the latest commit on that branch, auto-updating as new commits land (if `automated` sync is on).
- A tag (`v1.4.2`) — pins to that exact tag; you promote by changing the Application to point at a new tag.
- A specific commit SHA — the most locked-down option, useful for environments requiring exact, manual promotion.

### AppProjects — Multi-Tenancy and Guardrails
An `AppProject` groups Applications and constrains what they're *allowed* to do — critical in multi-team clusters so one team's Applications can't accidentally (or maliciously) touch another team's namespaces or use disallowed Git sources.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: team-payments
  namespace: argocd
spec:
  sourceRepos:
    - https://github.com/my-org/payments-*    # only repos matching this pattern
  destinations:
    - server: https://kubernetes.default.svc
      namespace: payments-*                    # only namespaces matching this pattern
  clusterResourceWhitelist:
    - group: ""
      kind: Namespace                          # allow creating Namespaces
  namespaceResourceBlacklist:
    - group: ""
      kind: ResourceQuota                       # forbid touching ResourceQuotas
```
Without AppProjects (or using only the implicit `default` project), any Application can deploy to any namespace on any configured cluster — fine for a small team, dangerous at organizational scale.

---

## Sync Phases, Hooks, and Waves

A "sync" isn't always a single atomic step — Argo CD supports ordering and hook-based lifecycle actions for more complex rollouts (e.g., "run a DB migration Job *before* the new Deployment goes live").

### Resource Hooks
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
  annotations:
    argocd.argoproj.io/hook: PreSync         # run BEFORE the main sync applies
    argocd.argoproj.io/hook-delete-policy: HookSucceeded   # clean up the Job after success
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: migrate-tool:1.0
      restartPolicy: Never
```
Hook types: `PreSync` (before), `Sync` (during, alongside normal resources), `PostSync` (after everything applies successfully), `SyncFail` (only runs if the sync failed — useful for cleanup/alerting).

### Sync Waves
Within a single sync, you can order resources into numbered "waves" — lower numbers apply first, and Argo CD waits for each wave's resources to be healthy before starting the next.

```yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "-1"   # apply this before wave "0" (the default)
```
Typical use: ConfigMaps/Secrets in wave `-1`, the Deployment that consumes them in wave `0`, an Ingress in wave `1` — ensuring dependencies exist before dependents.

```
Wave -1: ConfigMap, Secret        (applied first, must become healthy)
Wave  0: Deployment, Service       (applied next)
Wave  1: Ingress                   (applied last, once Service exists)
```

---

## Health Checks — How Argo CD Knows Something Is "Healthy"

Sync status (Synced/OutOfSync) answers "does live state match Git?" — a completely separate question from **health status** (Healthy/Progressing/Degraded/Missing), which answers "is what's running actually working?"

```
                    ┌───────────────┐
                    │  Sync Status    │  Git vs Cluster match?
                    │ (Synced/        │
                    │  OutOfSync)     │
                    └───────────────┘

                    ┌───────────────┐
                    │  Health Status  │  Is it actually working?
                    │ (Healthy/       │
                    │  Progressing/   │
                    │  Degraded/      │
                    │  Missing)       │
                    └───────────────┘
```
A Deployment can be **Synced** (the manifest exactly matches Git) but **Degraded** (e.g., the new image crashes on startup — CrashLoopBackOff) — Argo CD applied exactly what Git said, but the result isn't healthy. Built-in health checks understand common types (Deployment, StatefulSet, Ingress, Job, PVC) — e.g., a Deployment is "Healthy" only once its `status.availableReplicas` matches `spec.replicas`.

Custom health checks (Lua scripts) can be defined for CRDs Argo CD doesn't natively understand:
```yaml
# in the argocd-cm ConfigMap
resource.customizations.health.mycompany.io_MyCustomResource: |
  hs = {}
  if obj.status ~= nil and obj.status.phase == "Ready" then
    hs.status = "Healthy"
  else
    hs.status = "Progressing"
  end
  return hs
```

---

## App of Apps and ApplicationSets — Managing Many Applications

### App of Apps Pattern
A "parent" Argo CD Application whose entire job is to deploy... more Argo CD Applications. Useful for bootstrapping an entire cluster's set of workloads from one root object.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-app
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/my-org/cluster-config.git
    path: argocd-apps      # a directory containing many Application YAML files
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated: {prune: true, selfHeal: true}
```
```
root-app (Application)
    │  deploys (because they're just YAML files in its source path)
    ▼
my-app-dev (Application) ──► actual workload manifests in "dev" namespace
my-app-staging (Application) ──► actual workload manifests in "staging" namespace
my-app-prod (Application) ──► actual workload manifests in "production" namespace
payments-service (Application) ──► ...
inventory-service (Application) ──► ...
```
One `git push` adding a new Application YAML file under `argocd-apps/` is enough to onboard a brand-new service into GitOps management — no manual `argocd app create` needed.

### ApplicationSets — Templating Applications Themselves
Where App of Apps requires you to hand-write each Application YAML, **ApplicationSet** *generates* many Applications from a single template plus a "generator" (a list, a Git directory structure, or a cluster list) — solving the "same app, many clusters/environments" problem without copy-pasting Application manifests.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: my-app-envs
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - env: dev
            replicas: "1"
          - env: staging
            replicas: "2"
          - env: prod
            replicas: "10"
  template:
    metadata:
      name: 'my-app-{{env}}'
    spec:
      source:
        repoURL: https://github.com/my-org/my-app-manifests.git
        targetRevision: main
        path: helm/my-app
        helm:
          valueFiles: ['values-{{env}}.yaml']
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{env}}'
      syncPolicy:
        automated: {prune: true, selfHeal: true}
```
This one ApplicationSet produces three real Applications (`my-app-dev`, `my-app-staging`, `my-app-prod`) automatically. A **cluster generator** variant does the same thing but iterates over *registered clusters* instead of a static list — extremely useful for "deploy this same platform-level component (e.g., a monitoring agent) to every cluster we manage" scenarios, automatically picking up newly-added clusters.

---

## RBAC in Argo CD

Separate from Kubernetes RBAC (which governs what Argo CD's own service account can do *in the cluster*), Argo CD has its own RBAC model governing what **human users/teams** can do *within Argo CD itself* (who can see which Applications, who can trigger a sync, who can edit an AppProject).

```yaml
# argocd-rbac-cm ConfigMap
policy.csv: |
  p, role:payments-team, applications, sync, payments/*, allow
  p, role:payments-team, applications, get, payments/*, allow
  p, role:payments-team, applications, sync, platform/*, deny
  g, payments-team-sso-group, role:payments-team
```
This lets you grant the `payments-team` SSO group permission to sync/view only Applications inside the `payments` AppProject, without ever giving them raw `kubectl` access to the cluster at all — a meaningful security improvement over "everyone who needs to deploy gets a kubeconfig."

---

## Multi-Cluster GitOps

Argo CD doesn't have to live in the same cluster it deploys to. One "hub" Argo CD instance can manage many "spoke" clusters:

```
                     ┌─────────────────────┐
                     │   Hub cluster          │
                     │  (Argo CD lives here)  │
                     └──────────┬───────────┘
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                   ▼
     ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
     │  Dev cluster      │ │  Staging cluster  │ │  Prod cluster    │
     │  (spoke)          │ │  (spoke)          │ │  (spoke)         │
     └────────────────┘ └────────────────┘ └────────────────┘
```
```bash
# Register a remote cluster with the hub Argo CD
argocd cluster add my-prod-cluster-context
```
Each Application's `destination.server` field then points at whichever cluster it should deploy to — combined with an ApplicationSet's cluster generator, this lets a single Git commit fan out consistently across every registered cluster. Trade-off: the hub cluster becomes a critical dependency — if it's down, no new syncs happen anywhere (though already-running workloads are unaffected, since Argo CD isn't in the live traffic path).

---

## Notifications and Observability of Argo CD Itself

```yaml
# argocd-notifications-cm ConfigMap
trigger.on-sync-failed: |
  - when: app.status.operationState.phase in ['Error', 'Failed']
    send: [slack-sync-failed]
template.slack-sync-failed: |
  message: "🔴 Sync failed for {{.app.metadata.name}}: {{.app.status.operationState.message}}"
```
Combined with Prometheus metrics Argo CD itself exposes (`argocd_app_info`, sync/health status as labeled gauges), you can build dashboards/alerts on "how many Applications are currently OutOfSync or Degraded across the whole org" — turning GitOps compliance into a monitored, alertable signal rather than something someone has to remember to check in the UI.

---

## Deep-Dive Worked Example — Diagnosing a Stuck Sync

Symptom: Argo CD UI shows `my-app-prod` stuck in `Progressing` for 20 minutes.

```bash
argocd app get my-app-prod                     # overview: sync status, health, resource tree
argocd app get my-app-prod --show-operation     # detailed operation state/history
kubectl get application my-app-prod -n argocd -o yaml   # raw status conditions

# Drill into the specific resource that's not healthy:
argocd app resources my-app-prod
kubectl describe deployment my-app -n production
kubectl get events -n production --sort-by='.lastTimestamp'
```
Common root causes for a stuck `Progressing` state:
1. A **PreSync hook Job** never completes (e.g., a migration script hanging) — the main sync is blocked waiting on it. Check `kubectl logs job/db-migration -n production`.
2. The new Deployment's Pods are stuck `Pending` (insufficient node capacity) or `CrashLoopBackOff` — Argo CD applied the change correctly, but health will never reach "Healthy" until the underlying Kubernetes issue (Parts 1–2) is fixed. Argo CD surfaces the symptom; the root cause is still ordinary Kubernetes debugging.
3. A **custom health check** is misconfigured/missing for a CRD, so Argo CD can never correctly report it as Healthy even though it actually is — fix the Lua health check definition.

---

## Best Practices (Argo CD–Specific, Beyond Part 5's General GitOps List)

1. **Use AppProjects from day one**, even solo — retrofitting tenant boundaries onto dozens of unrestricted Applications later is painful.
2. **Prefer ApplicationSets over hand-copied Application files** the moment you have more than 2-3 near-identical environments/clusters — copy-paste drift between Application YAMLs is a real, recurring source of "why does staging behave differently from prod" bugs.
3. **Set `ApplyOutOfSyncOnly=true`** for large Applications — re-applying every resource on every sync (even unchanged ones) is slower and noisier in audit logs than touching only what actually changed.
4. **Use PreSync hooks for migrations, not application startup code.** Running a migration inside the app container's entrypoint means every replica tries to run it concurrently on scale-up — a dedicated PreSync Job runs it exactly once, before the app even starts.
5. **Pin `targetRevision` to tags or SHAs for production**, branches for dev/staging — branches are convenient for fast iteration but make "what exact version is in prod" a moving target if misused.
6. **Alert on `OutOfSync` and `Degraded`, not just deployment failures.** A silently-drifted or silently-unhealthy Application can sit unnoticed for days without an active alerting rule watching Argo CD's own status metrics.
7. **Give teams Argo CD RBAC scoped to their AppProject, not raw cluster kubeconfigs.** Keeps the "who can deploy what" boundary enforced consistently and auditable through one system.

## Common Pitfalls (Argo CD–Specific)

1. **Forgetting the difference between Sync status and Health status**, and being confused when an Application is "Synced" but the app is clearly broken — Synced only means "matches Git," never "is working."
2. **Helm `values.yaml` changes not producing a diff** because Argo CD is pointed at a Helm *chart repository* version rather than the Git path containing your values overlay — double-check `source.path` vs `source.chart` usage.
3. **Using `selfHeal: true` in every environment uniformly**, then being surprised when a legitimate emergency `kubectl scale` during an incident gets silently reverted moments later — decide per-environment, and know how to pause sync (`argocd app set my-app --sync-policy none`) when you need a temporary manual window.
4. **Not setting `PrunePropagationPolicy`**, leading to surprises when deleting an Application/removing a resource from Git — foreground vs background deletion changes whether dependent resources are removed immediately or asynchronously.
5. **One massive AppProject (or just using `default`) for the whole org**, making it impossible to reason about blast radius — split by team/environment early.
6. **Treating the hub cluster as disposable** in a multi-cluster setup — if it holds no backup/DR plan and goes down, you lose the ability to make *any* new GitOps change across *any* spoke cluster until it's restored (running workloads keep running, but you're flying blind on new deployments).

---

*Next parts will cover: Observability & Debugging, Security, Reliability & Production, and Developer Tools.*

---

## Table of Contents

**15. Security**
- 15.1 Kubernetes RBAC (Roles, ClusterRoles, RoleBindings, ServiceAccounts)
- 15.2 Least Privilege
- 15.3 IAM vs Kubernetes RBAC
- 15.4 IRSA / EKS Pod Identity
- 15.5 NetworkPolicy
- 15.6 Security Groups
- 15.7 Secrets Management
- 15.8 Image Scanning
- 15.9 Non-root Containers
- 15.10 Read-only Root Filesystem
- 15.11 Pod Security Standards (basic)

**16. Reliability & Production**
- 16.1 Pod Availability & Replica Redundancy
- 16.2 Multi-AZ Deployments
- 16.3 Readiness During Deployments
- 16.4 Graceful Termination
- 16.5 Rolling Updates
- 16.6 Health Checks
- 16.7 Resource Requests and Limits
- 16.8 Noisy Neighbor Problem
- 16.9 Node Failure & Pod Eviction
- 16.10 Taints and Tolerations (basic)
- 16.11 Stateless vs Stateful Services
- 16.12 Disaster Recovery Basics
- 16.13 Backup and Restore Basics
- 16.14 Kubernetes Upgrade Strategy

**17. Developer Tools**
- 17.1 kubectl
- 17.2 k9s
- 17.3 Helm
- 17.4 Kustomize (basic)
- 17.5 Docker
- 17.6 kubectl debug
- 17.7 stern
- 17.8 jq / yq
- 17.9 curl / dig / nslookup / netshoot
- 17.10 Argo CD UI
- 17.11 Prometheus / Grafana

---

# 15. Security

Kubernetes security is layered — think of it like an onion (or an airport). There's the perimeter (who gets into the country/VPC), the terminal (who gets into the cluster), the gate (who gets onto a specific flight/namespace), and the seat (what a container can actually do once it's running). We'll go layer by layer.

## 15.1 Kubernetes RBAC (Role-Based Access Control)

**What it is:** RBAC controls **who** (a user, group, or ServiceAccount) can do **what** (verbs: get, list, watch, create, update, delete) to **which resources** (pods, secrets, deployments, etc.), and **where** (namespace-scoped or cluster-scoped).

**Analogy:** Think of a hospital. A nurse (Role) can read patient charts and administer meals on their *own ward* (Namespace). A hospital administrator (ClusterRole) can read charts across *all wards*. The ID badge that says who you are and which role you've been assigned is the **RoleBinding**.

### The four RBAC objects

| Object | Scope | Purpose |
|---|---|---|
| `Role` | Namespace | Defines permissions within one namespace |
| `ClusterRole` | Cluster-wide | Defines permissions across all namespaces (or for cluster-scoped resources like Nodes) |
| `RoleBinding` | Namespace | Grants a Role (or ClusterRole) to a subject, scoped to one namespace |
| `ClusterRoleBinding` | Cluster-wide | Grants a ClusterRole to a subject, cluster-wide |

### Example: Role + RoleBinding

```yaml
# Role: allow reading pods in the "payments" namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: payments
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
---
# RoleBinding: bind that Role to a specific ServiceAccount
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-binding
  namespace: payments
subjects:
- kind: ServiceAccount
  name: monitoring-agent
  namespace: payments
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### RBAC decision flow

```
        ┌────────────────────┐
        │  Request arrives    │
        │ (user/SA + verb +   │
        │  resource + ns)     │
        └─────────┬──────────┘
                   │
                   ▼
        ┌────────────────────┐
        │ Any RoleBinding /   │
        │ ClusterRoleBinding  │
        │ match this subject? │
        └─────────┬──────────┘
             yes   │   no
        ┌──────────┴───────────┐
        ▼                      ▼
 ┌─────────────┐        ┌─────────────┐
 │ Does the     │        │   DENY      │
 │ bound Role   │        │ (implicit,  │
 │ allow this   │        │ RBAC is     │
 │ verb+resource│        │ deny-by-    │
 │ ?            │        │ default)    │
 └──────┬───────┘        └─────────────┘
   yes  │   no
 ┌──────┴───────┐
 ▼              ▼
ALLOW         DENY
```

**Key fact:** RBAC is **deny by default** and **additive only** — there's no explicit "deny" rule. If no rule grants access, the request is denied. Permissions from multiple bindings are combined (union), never subtracted.

### ServiceAccounts

Every pod runs *as* a ServiceAccount (default: `default` SA in its namespace, unless you specify one). ServiceAccounts are how **pods** (not humans) authenticate to the Kubernetes API — for example, a controller that needs to list its own pods, or a CI job that needs to trigger a rollout.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: monitoring-agent
  namespace: payments
```

```yaml
# reference it in a pod
spec:
  serviceAccountName: monitoring-agent
  containers:
  - name: agent
    image: monitoring-agent:1.0
```

**Best practices:**
- Never use the `default` ServiceAccount for workloads that need API access — create a dedicated, narrowly-scoped one per app.
- Set `automountServiceAccountToken: false` on pods that don't need to talk to the API server at all — this reduces attack surface if the pod is compromised.
- Prefer `Role`/`RoleBinding` over `ClusterRole`/`ClusterRoleBinding` unless the workload genuinely needs cross-namespace or cluster-scoped access.

## 15.2 Least Privilege

**The principle:** Every identity (human or ServiceAccount) should get the *minimum* set of permissions needed to do its job — nothing more "just in case."

**Analogy:** A junior employee gets a keycard that opens their floor and the kitchen, not the CEO's office, the server room, and the vault. Even though it'd be "convenient" to give everyone a master key, that's exactly what makes a single compromised badge catastrophic.

**In practice for Kubernetes:**
- Avoid `verbs: ["*"]` and `resources: ["*"]` in Roles.
- Avoid granting `cluster-admin` to CI/CD pipelines "to keep things simple" — scope pipeline permissions to the namespaces and resource types it actually deploys.
- Periodically audit RBAC bindings (`kubectl get rolebindings,clusterrolebindings -A`) for stale or overly-broad grants.
- Separate **read** (`get/list/watch`) from **write** (`create/update/patch/delete`) — most humans debugging production need only read access.

## 15.3 IAM vs Kubernetes RBAC

These are two **completely separate permission systems** that people often conflate on EKS:

| | Kubernetes RBAC | AWS IAM |
|---|---|---|
| Controls access to | Kubernetes API objects (Pods, Secrets, Deployments...) | AWS resources (S3 buckets, DynamoDB tables, EC2, ECR...) |
| Identity | Kubernetes User / Group / ServiceAccount | IAM User / Role |
| Enforced by | kube-apiserver | AWS APIs |
| Example question it answers | "Can this ServiceAccount delete pods in `payments` namespace?" | "Can this workload read objects from this S3 bucket?" |

**Analogy:** RBAC is the security guard *inside* the building deciding which rooms you can enter. IAM is the security guard at the *airport* deciding whether you can board a specific flight to a specific country. A pod might have full RBAC rights to read Secrets in its namespace, but zero IAM permission to touch an S3 bucket — and vice versa. They don't automatically know about each other — **IRSA / EKS Pod Identity is the bridge between them** (next section).

## 15.4 IRSA / EKS Pod Identity

**The problem this solves:** A pod running in EKS often needs to call AWS APIs (e.g., read from S3, write to DynamoDB, pull a secret from Secrets Manager). Historically, the bad old way was to bake long-lived AWS access keys into container images or environment variables — a huge security risk.

### IRSA (IAM Roles for Service Accounts)

**How it works:**
1. EKS cluster has an OIDC identity provider registered with AWS IAM.
2. You create an IAM Role with a **trust policy** that says "I trust tokens issued by this cluster's OIDC provider, specifically for ServiceAccount X in namespace Y."
3. You annotate the Kubernetes ServiceAccount with that IAM Role's ARN.
4. When a pod using that ServiceAccount starts, EKS injects a short-lived, auto-rotated **projected service account token**.
5. The AWS SDK inside the pod automatically exchanges that token for temporary AWS credentials via STS (`AssumeRoleWithWebIdentity`).

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: s3-reader
  namespace: payments
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/s3-read-role
```

```
┌───────────┐   1. uses ServiceAccount   ┌────────────────┐
│   Pod     │──────────────────────────▶│ ServiceAccount   │
│ (payments)│                            │ s3-reader        │
└─────┬─────┘                            │ (annotated with  │
      │                                  │  IAM role ARN)   │
      │ 2. gets projected OIDC token     └────────┬─────────┘
      ▼                                            │
┌──────────────────┐  3. AssumeRoleWithWebIdentity  │
│  AWS STS          │◀───────────────────────────────┘
└─────────┬─────────┘
          │ 4. returns temporary AWS credentials
          ▼
┌───────────────────┐
│  Pod calls S3 API   │
│  using temp creds    │
└───────────────────┘
```

**Analogy:** Instead of giving every employee a permanent master key to the building (long-lived AWS keys), the front desk (STS) issues each visitor a temporary, time-limited badge (temporary credentials) *only after* verifying their appointment letter (the OIDC token) matches a pre-approved guest list (the IAM trust policy).

### EKS Pod Identity (the newer approach)

EKS Pod Identity is AWS's simplified successor to IRSA — instead of configuring OIDC federation and long trust-policy JSON per role, you install the **EKS Pod Identity Agent** add-on and create a simple **association** (ServiceAccount ↔ IAM Role) via the EKS API. It removes the need to manage OIDC provider details manually and simplifies cross-account and role-chaining scenarios.

| | IRSA | EKS Pod Identity |
|---|---|---|
| Setup | Manual OIDC provider + trust policy per role | EKS API association + agent add-on |
| Credential delivery | Projected token exchanged via STS directly by SDK | Pod Identity Agent (a DaemonSet) handles token exchange |
| Role reuse across clusters | Requires re-configuring trust policy per cluster | Easier reuse — just create a new association |

**Best practices:**
- Never mount long-lived AWS access keys as environment variables/Secrets — always use IRSA or Pod Identity.
- Scope IAM roles per-workload (one S3-reader role for the reporting service, a different one for the upload service) rather than one shared "EKS role for everything."
- Combine with least-privilege IAM policies (e.g., `s3:GetObject` on one specific bucket ARN, not `s3:*` on `*`).

## 15.5 NetworkPolicy

**What it is:** A NetworkPolicy is a **firewall rule for pods** — it controls which pods can talk to which other pods (and on which ports), based on **labels**. By default, Kubernetes networking is "flat" — every pod can reach every other pod. NetworkPolicies let you restrict that.

**Analogy:** Without NetworkPolicy, your office building has no locked doors — anyone can walk into any room. NetworkPolicy is like installing keycard locks: "only people from the Finance team's badge group may enter the Finance server room."

**Important gotcha:** NetworkPolicies are **enforced by the CNI plugin**, not the Kubernetes API server itself. If your CNI doesn't support NetworkPolicy (some do, some don't — e.g., the AWS VPC CNI historically needed Calico or a similar add-on layered on top for policy enforcement), writing a NetworkPolicy YAML does *nothing*.

### Example: only allow the "frontend" pods to reach "backend" pods on port 8080

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-allow-frontend
  namespace: shop
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

```
   ┌───────────┐   allowed (matches policy)   ┌───────────┐
   │ frontend  │ ────────────────────────────▶│  backend   │
   │   pod     │           :8080               │    pod     │
   └───────────┘                               └───────────┘

   ┌───────────┐   BLOCKED (no matching rule)  ┌───────────┐
   │  random    │ ──────────────X─────────────▶│  backend   │
   │ other pod  │                               │    pod     │
   └───────────┘                               └───────────┘
```

**Best practices:**
- Start with a **default-deny** policy per namespace, then explicitly allow what's needed:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: shop
spec:
  podSelector: {}
  policyTypes: ["Ingress", "Egress"]
```
- Also restrict **egress** (outbound), not just ingress — a compromised pod shouldn't be able to freely call out to the internet or scan the internal network.
- Label your pods consistently and deliberately — NetworkPolicy is only as good as your labeling scheme.

## 15.6 Security Groups

**What they are:** Security Groups are **AWS-level, VPC-layer firewalls** — they operate on EC2 instances/ENIs (Elastic Network Interfaces), not on Kubernetes labels. In EKS, they control traffic at the **node** (and, with the VPC CNI assigning pod IPs from the VPC, sometimes the **pod ENI**) level.

**How this differs from NetworkPolicy:**

| | Security Groups | NetworkPolicy |
|---|---|---|
| Layer | AWS VPC (EC2/ENI) | Kubernetes (pod labels) |
| Enforced by | AWS networking infrastructure | CNI plugin inside the cluster |
| Granularity | IP ranges, ports, other SGs | Pod labels, namespaces, ports |
| Typical use | Node-to-node, cluster-to-RDS, cluster-to-internet | Pod-to-pod within the cluster |

**Analogy:** Security Groups are the perimeter fence and gate around the entire office park (which trucks/vehicles can even enter the parking lot). NetworkPolicy is the internal door-lock system deciding which employees can walk into which specific room once they're already inside the building.

**Common production pattern:** the EKS node Security Group typically allows traffic from the control plane (for kubelet, webhook calls) and between nodes (for pod-to-pod overlay/VPC-CNI traffic), while a separate, tighter Security Group governs the ALB → node/pod path (see Section 5).

## 15.7 Secrets Management

**What it is:** Managing sensitive data — passwords, API keys, TLS certs, DB credentials — so they're encrypted at rest, tightly access-controlled, and never end up in plaintext in Git or logs.

Covered in more depth in the Configuration & Secrets topic, but from a **security** lens specifically:

- Kubernetes `Secret` objects are **base64-encoded, not encrypted**, by default at the object level — base64 is *encoding*, not *encryption*; anyone with `get secrets` RBAC access can decode them trivially.
- Enable **encryption at rest** for etcd (EKS supports envelope encryption via AWS KMS) so Secrets are actually encrypted on disk.
- Prefer **AWS Secrets Manager** or **Parameter Store** for the source of truth, synced into the cluster via the **External Secrets Operator**, rather than hand-writing Kubernetes `Secret` manifests.

```
┌───────────────────┐        ┌────────────────────┐        ┌──────────┐
│ AWS Secrets Manager │──────▶│ External Secrets     │──────▶│ K8s      │
│ (source of truth)    │ sync  │ Operator (controller) │ create│ Secret   │
└───────────────────┘        └────────────────────┘        └──────────┘
                                                                   │
                                                                   ▼
                                                           mounted into Pod
```

**Best practices (why Secrets shouldn't be committed to Git):**
- Git history is forever — even if you delete a secret in a later commit, it's recoverable from history unless you rewrite it (and even then, forks/clones may retain it).
- Anyone with read access to the repo (including CI logs, PR previews, bots) gets the secret.
- Use `.gitignore` + secret scanning tools (e.g., `git-secrets`, `truffleHog`) as a safety net, and rotate immediately if one ever leaks.
- Use **sealed secrets** or **External Secrets Operator** patterns so what's committed to Git (for GitOps) is an encrypted or reference-only object, not the plaintext value.

## 15.8 Image Scanning

**What it is:** Automatically scanning container images for known vulnerabilities (CVEs) in OS packages and application dependencies, ideally *before* the image is deployed.

**Analogy:** It's an airport security scanner for your container image — checking what's packed inside before it's allowed to board.

**Where it happens:**
- **At build/push time:** ECR has built-in image scanning (basic via Clair-based scanning, or enhanced via Amazon Inspector) that flags CVEs when you push an image.
- **In CI/CD:** Tools like Trivy, Grype, or Snyk scan images as a pipeline gate — failing the build if critical CVEs are found.
- **Continuously:** Re-scan images already running in the cluster, since new CVEs are discovered daily for packages that haven't changed.

**Best practices:**
- Use minimal base images (`distroless`, `alpine`) to shrink the attack surface — fewer packages, fewer CVEs.
- Pin dependency versions and rebuild regularly to pick up patches.
- Fail CI builds on **critical/high** severity findings; track and remediate medium/low on a schedule rather than blocking every merge.

## 15.9 Non-root Containers

**What it is:** By default, many container images run their process as `root` (UID 0) inside the container. If an attacker escapes the container or exploits a kernel vulnerability, running as root gives them far more power on the host.

**Best practice:** Explicitly run containers as a non-root user.

```yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
  containers:
  - name: app
    image: myapp:1.0
```

**Analogy:** It's the difference between an intruder getting into your house through an open window as a regular guest (limited access) versus getting in through the front door with a master key that unlocks every room, the safe, and the alarm system (root).

`runAsNonRoot: true` tells Kubernetes to **refuse to start the container** if the image tries to run as UID 0 — a safety net that catches misconfigured images before they even launch.

## 15.10 Read-only Root Filesystem

**What it is:** Setting the container's root filesystem to read-only so the running process cannot write to (or modify) its own filesystem — a common technique to limit what an attacker can do post-compromise (e.g., they can't drop a malicious binary onto disk and execute it).

```yaml
containers:
- name: app
  image: myapp:1.0
  securityContext:
    readOnlyRootFilesystem: true
  volumeMounts:
  - name: tmp
    mountPath: /tmp   # apps that need to write somewhere (e.g., /tmp) get an explicit writable volume
volumes:
- name: tmp
  emptyDir: {}
```

**Analogy:** Imagine handing someone a printed, laminated instruction manual instead of an editable Word document — they can read and follow it, but they can't secretly rewrite a page to change what it says.

**Best practice:** Combine with an explicit `emptyDir` volume for any directory the app *legitimately* needs to write to (logs, temp files, caches) — don't disable the read-only setting just because one path needs write access.

## 15.11 Pod Security Standards (basic understanding)

**What it is:** Kubernetes' built-in framework (replacing the deprecated PodSecurityPolicy) for enforcing security best practices at the **namespace** level via labels. There are three standard profiles:

| Profile | Description |
|---|---|
| **Privileged** | Unrestricted — allows known privilege escalations (used only for trusted, cluster-admin-managed workloads like CNI plugins) |
| **Baseline** | Blocks known privilege escalations but stays broadly compatible (e.g., disallows host namespaces, privileged containers) |
| **Restricted** | Heavily locked down — enforces non-root, no privilege escalation, read-only filesystem patterns, seccomp profiles, etc. |

Applied by labeling a namespace:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: payments
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

**Analogy:** It's like a building's tiered access policy — the loading dock (Privileged) allows forklifts and heavy equipment because trusted staff operate there; general office floors (Baseline) block obviously dangerous behavior; and the vault floor (Restricted) enforces the strictest possible rules on everyone, no exceptions.

---

# 16. Reliability & Production

This section is about keeping applications **up and correct** under real-world conditions: node failures, deployments, traffic spikes, and the eventual reality that hardware and software both fail.

## 16.1 Pod Availability & Replica Redundancy

**The core idea:** Never run a single replica of anything important. If you run `replicas: 1` and that one pod's node dies, crashes, or is evicted, your application is down until Kubernetes reschedules it — which is not instantaneous.

**Analogy:** A single point of failure is like a company that has exactly one person who knows how to process payroll — if they're sick, on vacation, or quit, payroll doesn't run. Redundancy means training multiple people (replicas) so the process survives one person's absence.

**Best practice:** Run at least 2-3 replicas for anything user-facing, spread across nodes (and ideally AZs — see below) using **PodAntiAffinity** so replicas don't all land on the same node:

```yaml
spec:
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchLabels:
              app: my-app
          topologyKey: kubernetes.io/hostname
```

## 16.2 Multi-AZ Deployments

**What it is:** Spreading your nodes (and therefore your pods) across multiple AWS **Availability Zones** (physically separate data centers within a region) so that the failure of an entire AZ (power outage, network partition, natural disaster) doesn't take your whole application down.

```
Region: us-east-1
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│      AZ-a         │   │      AZ-b         │   │      AZ-c         │
│  ┌────┐ ┌────┐    │   │  ┌────┐ ┌────┐    │   │  ┌────┐            │
│  │Node│ │Pod │    │   │  │Node│ │Pod │    │   │  │Node│            │
│  │ 1  │ │ A  │    │   │  │ 2  │ │ B  │    │   │  │ 3  │            │
│  └────┘ └────┘    │   │  └────┘ └────┘    │   │  └────┘            │
└─────────────────┘   └─────────────────┘   └─────────────────┘
      If AZ-a goes down entirely, Pods B (and others in AZ-b/c) keep serving traffic.
```

**Best practice:** Combine `topologySpreadConstraints` with your managed node group spanning multiple subnets/AZs:

```yaml
spec:
  topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: my-app
```

This tells the scheduler: "keep the number of `my-app` pods roughly even across AZs; don't let one AZ end up hosting all of them."

## 16.3 Readiness During Deployments

**Recap + production angle:** During a rolling update, new pods must pass their **readiness probe** before the Service starts sending them traffic, and old pods are only removed from the Service's endpoints once new ones are ready. This is what makes rolling updates "zero downtime" — if you skip readiness probes, Kubernetes considers a pod ready the instant its container starts, potentially routing real user traffic to a pod that hasn't finished initializing (loading config, warming caches, connecting to a DB pool) yet, causing a burst of errors.

**Analogy:** A restaurant doesn't seat customers at a newly-opened table until the table's been wiped down and the menu's placed on it (readiness) — even though the chair itself exists (the container is running).

## 16.4 Graceful Termination

Recap from Pods & Containers, with a production lens: when a pod is deleted (during a rolling update, scale-down, or node drain), Kubernetes:
1. Sends **SIGTERM** to the container's main process.
2. Simultaneously (in parallel), removes the pod from Service endpoints, so no *new* requests are routed to it — but in-flight requests may still be completing.
3. Waits up to `terminationGracePeriodSeconds` (default 30s) for the process to exit cleanly.
4. If it hasn't exited by then, sends **SIGKILL** (forceful, immediate termination).

**Production gotcha:** There's a well-known race condition — the pod might get SIGTERM *before* it's fully removed from all kube-proxy/iptables rules across every node, meaning a few requests can still land on a terminating pod for a brief window. The fix: add a short `preStop` hook that sleeps for a few seconds, giving time for endpoint removal to propagate before the app actually starts shutting down.

```yaml
lifecycle:
  preStop:
    exec:
      command: ["sh", "-c", "sleep 5"]
```

## 16.5 Rolling Updates

Recap + production tuning: rolling updates are controlled by two fields on the Deployment strategy:

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # how many EXTRA pods above desired count can be created during update
      maxUnavailable: 0    # how many pods can be UNAVAILABLE during update
```

- `maxUnavailable: 0` + `maxSurge: 1` = "never drop below current capacity, add one extra pod at a time" — the safest, most conservative production setting (costs slightly more compute during the rollout).
- `maxUnavailable: 1, maxSurge: 0` = "replace pods one at a time without spinning up extras" — cheaper but briefly reduces capacity.

**Analogy:** Repaving a highway one lane at a time while keeping traffic flowing (RollingUpdate) versus closing the whole highway overnight to repave it all at once (Recreate strategy) — the former is safer for users but takes longer and needs a temporarily wider shoulder (surge capacity).

## 16.6 Health Checks

Recap in a production context — the three probe types work together as layered safety nets:

| Probe | Question it answers | What happens on failure |
|---|---|---|
| **Startup** | "Has the app finished starting up yet?" | Kubernetes waits, doesn't yet run liveness/readiness (protects slow-starting apps from being killed prematurely) |
| **Readiness** | "Is the app currently able to serve traffic?" | Pod removed from Service endpoints (no traffic sent), but **not restarted** |
| **Liveness** | "Is the app still alive/functioning (not deadlocked/hung)?" | Container is **restarted** |

**Best practice:** Don't make your liveness probe check downstream dependencies (like "can I reach the database?") — if the DB has a blip, you don't want Kubernetes to restart *every single pod* in a cascading, self-inflicted outage. Save deep dependency checks for readiness, and keep liveness checking only "is my own process responsive."

## 16.7 Resource Requests and Limits

Recap + production impact: requests/limits directly affect **scheduling** and **reliability**:

- **Requests** = what the scheduler reserves on a node for this pod (guaranteed).
- **Limits** = the hard ceiling; exceeding the CPU limit causes throttling, exceeding the memory limit causes an **OOMKill**.

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

**QoS Classes** (derived automatically from requests/limits, affects eviction priority under node pressure):

| QoS Class | Condition | Eviction priority |
|---|---|---|
| **Guaranteed** | requests == limits for all containers | Evicted last (most protected) |
| **Burstable** | requests < limits (or only some set) | Evicted before Guaranteed |
| **BestEffort** | no requests/limits set at all | Evicted first |

**Best practice:** Set requests close to real average usage (so the scheduler packs nodes efficiently) and limits high enough to absorb legitimate spikes — but always set *something*, since unset resources make a pod BestEffort, the first to be sacrificed when a node runs low on memory.

## 16.8 Noisy Neighbor Problem

**What it is:** One pod consuming excessive CPU/memory/disk I/O on a shared node, degrading performance for other pods on that same node — even though those other pods didn't do anything wrong.

**Analogy:** Living in an apartment building where one neighbor blasts music all night — everyone else's "quality of life" (performance) suffers even though they're behaving perfectly reasonably.

**Mitigations:**
- Set CPU/memory **limits** so one pod can't monopolize a node's resources.
- Use **ResourceQuota** and **LimitRange** at the namespace level to cap total consumption per team/app.
- For extreme isolation needs, use dedicated node pools/taints so noisy workloads (e.g., batch jobs) don't share nodes with latency-sensitive services.

## 16.9 Node Failure & Pod Eviction

**Node failure flow:**
1. kubelet on a node stops sending heartbeats to the control plane.
2. After `node-monitoring-grace-period` (default ~40s), the node is marked `NotReady`.
3. After a further `pod-eviction-timeout` (default ~5 minutes), the control plane marks the node's pods for deletion and reschedules them elsewhere (if managed by a Deployment/ReplicaSet/etc — standalone pods are simply lost).

**Pod eviction** can also happen deliberately/proactively, not just from hard failure:
- **Node pressure eviction:** kubelet itself evicts pods when the node is low on memory/disk, prioritizing evicting BestEffort, then Burstable, then (rarely) Guaranteed pods.
- **Voluntary eviction:** draining a node for maintenance (`kubectl drain`) or Cluster Autoscaler/Karpenter scaling down an underutilized node.

```
Node health timeline:
 t=0s      Node stops responding
 t=40s     Control plane marks Node "NotReady"
 t=5min    Pods on the node marked for deletion & rescheduled elsewhere
           (assuming a Deployment/ReplicaSet owns them)
```

**This is exactly why replica redundancy + PodDisruptionBudgets matter** — a PDB (from topic 3) ensures that *voluntary* disruptions (drains, scale-downs) don't take out too many replicas of the same app at once, even though it can't help against a sudden hard node failure.

## 16.10 Taints and Tolerations (basic understanding)

**What they are:** The inverse of node affinity. A **taint** on a node repels pods ("don't schedule here unless you explicitly tolerate this"); a **toleration** on a pod says "I'm okay running on a node with this taint."

**Analogy:** A taint is a sign on a door that says "Staff Only" — pods need a matching "toleration" (staff badge) to be allowed through. Without one, they simply won't be scheduled there.

```yaml
# Taint a node (usually done at node-group creation, e.g. for GPU nodes)
kubectl taint nodes gpu-node-1 workload=gpu:NoSchedule
```

```yaml
# Pod toleration to allow scheduling onto that tainted node
spec:
  tolerations:
  - key: "workload"
    operator: "Equal"
    value: "gpu"
    effect: "NoSchedule"
```

**Common taint effects:**
| Effect | Meaning |
|---|---|
| `NoSchedule` | New pods without a matching toleration won't be scheduled here |
| `PreferNoSchedule` | Scheduler tries to avoid it, but isn't strict |
| `NoExecute` | Existing pods without a matching toleration are actively **evicted** |

**Typical use case:** Dedicating a node pool to GPU workloads, spot instances, or a specific team — taint the nodes, and only pods that explicitly tolerate the taint (and typically also use a matching `nodeSelector`/affinity) land there.

## 16.11 Stateless vs Stateful Services

Recap in a reliability context:

| | Stateless | Stateful |
|---|---|---|
| Example | Web/API server | Database, message queue, cache with persistence |
| On pod death | Any replica can replace it — no special handling needed | Needs stable identity/storage (StatefulSet) — replacement must reconnect to the *same* data |
| Scaling | Trivial — just add replicas | Careful — order and identity matter |
| Failure impact | Low (traffic just moves to another replica) | High (data availability/consistency at risk) |

**Production implication:** Design as much of your system as possible to be stateless — push state out to managed services (RDS, ElastiCache, managed Kafka) where possible, since stateless workloads are dramatically easier to make reliable in Kubernetes.

## 16.12 Disaster Recovery Basics

**What it is:** Planning for scenarios where an entire cluster, region, or major dependency becomes unavailable — beyond what redundancy within a cluster can handle.

**Key concepts:**
- **RTO (Recovery Time Objective):** How long can the system be down before it must be restored?
- **RPO (Recovery Point Objective):** How much data loss (measured in time) is acceptable — i.e., how far back can your last good backup be?

**Common DR patterns for Kubernetes/EKS:**
- **Backup cluster config as code (GitOps):** since Deployments/Services/etc are declarative and stored in Git (see Argo CD/GitOps in topic 13), rebuilding a cluster's *workloads* from scratch is largely "re-apply the Git repo."
- **Multi-region active/passive:** a warm-standby cluster in a second region, promoted if the primary region fails.
- **Data DR:** database backups/replication (e.g., RDS cross-region read replicas) — Kubernetes itself doesn't back up your *data*, only your *desired configuration*.

**Analogy:** GitOps-based DR is like having architectural blueprints for your house — if it burns down, you can rebuild the exact same structure quickly. But the blueprints don't restore your family photo albums (your actual data) — that requires a separate backup of the *contents*, not just the structure.

## 16.13 Backup and Restore Basics

What actually needs backing up in a Kubernetes/EKS context:

| What | How it's typically backed up |
|---|---|
| Cluster resource definitions (Deployments, Services, ConfigMaps...) | Git (if using GitOps) — the repo *is* the backup |
| PersistentVolume data (databases, file storage) | EBS snapshots, EFS backups, application-level DB backups (e.g., `pg_dump`, RDS automated backups) |
| Secrets (source of truth) | AWS Secrets Manager/Parameter Store (which have their own versioning/backup) |
| etcd (control plane's own datastore) | Managed automatically by AWS for EKS — you don't administer etcd backups yourself on EKS |

**Tools:** **Velero** is a popular open-source tool for backing up and restoring entire Kubernetes cluster state (resources + PersistentVolume snapshots) — useful for both DR and migrating workloads between clusters.

**Best practice:** Test restores regularly — a backup you've never successfully restored from is a backup you don't actually have.

## 16.14 Kubernetes Upgrade Strategy

**Why it matters:** EKS control-plane and node versions must be upgraded periodically (AWS deprecates old Kubernetes versions on a schedule), and upgrades can introduce breaking API changes.

**Typical safe upgrade flow:**
1. **Read the changelog** for deprecated/removed APIs between your current and target version (e.g., a `batch/v1beta1` CronJob API removed in favor of `batch/v1`).
2. **Upgrade the EKS control plane first** (AWS manages this) — it can run one minor version ahead of worker nodes for a limited window.
3. **Upgrade managed node groups** (or let Karpenter/Cluster Autoscaler cycle in new nodes) — typically one AZ/batch of nodes at a time, verifying workloads reschedule healthily before proceeding.
4. **Upgrade EKS add-ons** (CoreDNS, kube-proxy, VPC CNI) to versions compatible with the new cluster version.
5. **Roll forward one minor version at a time** — Kubernetes doesn't support skipping multiple minor versions in a single upgrade.

```
1.28 (control plane) ──▶ 1.29 (control plane) ──▶ 1.29 (nodes) ──▶ 1.30 (control plane) ──▶ ...
        never skip a minor version; upgrade nodes to catch up before jumping again
```

**Best practice:** Maintain good PodDisruptionBudgets, readiness probes, and multi-replica deployments *before* an upgrade — node upgrades are essentially a large, deliberate rolling "drain and replace" of your entire fleet, and your workloads need to already tolerate that gracefully.

---

# 17. Developer Tools

A quick-reference tour of the day-to-day tools you'll actually have open in a terminal while operating a Kubernetes/EKS environment.

## 17.1 kubectl

The primary CLI for talking to the Kubernetes API server. Nearly everything else in this list either wraps `kubectl`, complements it, or reads the same API.

```bash
kubectl get pods -n payments
kubectl describe pod my-pod -n payments
kubectl apply -f deployment.yaml
kubectl delete pod my-pod
kubectl config get-contexts        # see which clusters you can talk to
kubectl config use-context my-eks-cluster
```

## 17.2 k9s

A terminal-based **UI** for Kubernetes — think of it as a "top"-like, keyboard-driven dashboard layered over `kubectl`, letting you navigate pods/deployments/logs/exec sessions visually without typing a fresh `kubectl` command for every action.

**Analogy:** If `kubectl` is a command-line accounting ledger, `k9s` is a spreadsheet app over the same data — same underlying numbers, much faster to browse and interact with visually.

```bash
k9s                  # launches the UI, defaults to current kube-context
# inside: ":pods", ":deploy", ":svc" to jump between resource views
# "l" for logs, "d" for describe, "s" for shell/exec, on a selected resource
```

## 17.3 Helm

Covered in depth in topic 12 — as a developer tool day-to-day:

```bash
helm install my-release ./my-chart -f values-prod.yaml
helm upgrade my-release ./my-chart --set image.tag=v2.3.1
helm rollback my-release 1
helm list -n payments
```

## 17.4 Kustomize (basic understanding)

**What it is:** A tool (built into `kubectl` via `kubectl apply -k`) for customizing raw YAML manifests **without templating** — instead of `{{ .Values.x }}` placeholders like Helm, Kustomize uses a `kustomization.yaml` that layers **patches** on top of a common "base."

```
base/
  deployment.yaml
  kustomization.yaml
overlays/
  dev/
    kustomization.yaml     # patches replicas: 1
  prod/
    kustomization.yaml     # patches replicas: 5, adds resource limits
```

```bash
kubectl apply -k overlays/prod/
```

**Helm vs Kustomize, in one line:** Helm is "one parameterized template + different input values per environment"; Kustomize is "one base manifest + explicit YAML patches per environment" — no templating language, just structural overlays.

## 17.5 Docker

The tool used to **build** the container images that Kubernetes runs (though the cluster itself typically runs a different container *runtime* like containerd — Docker is mainly a developer-facing build/local-testing tool at this point).

```bash
docker build -t myapp:1.0 .
docker run -p 8080:8080 myapp:1.0     # test locally before deploying
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:1.0
```

## 17.6 kubectl debug

**What it is:** Attaches an **ephemeral debug container** to a running pod (or creates a copy of it) — extremely useful for troubleshooting minimal/distroless production images that don't even have a shell or basic tools like `curl` baked in.

```bash
# Attach a debug container with networking tools to a running pod
kubectl debug -it my-pod --image=nicolaka/netshoot --target=my-container

# Create a copy of a pod with a shell for debugging, without touching the original
kubectl debug my-pod -it --copy-to=my-pod-debug --container=my-container -- sh
```

**Analogy:** It's like being able to teleport a fully-equipped mechanic's toolbox into a sealed, minimal shipping container to diagnose a problem — without having to have pre-installed tools inside the container from day one (which would bloat and weaken your production image).

## 17.7 stern

**What it is:** A CLI tool for **tailing logs from multiple pods simultaneously**, with color-coded, prefixed output — solves the pain of `kubectl logs` only working against one pod at a time.

```bash
stern my-app -n payments             # tails logs from ALL pods matching "my-app"
stern my-app --since 10m             # only logs from the last 10 minutes
stern -l app=my-app --tail 50        # by label selector
```

**Analogy:** `kubectl logs` is listening to one radio station at a time; `stern` is a mixing board that plays every relevant station simultaneously, each labeled so you know which is which.

## 17.8 jq / yq

**What they are:** Command-line JSON (`jq`) and YAML (`yq`) processors — essential for slicing and filtering `kubectl`'s output (which can be requested as JSON) or manifest files.

```bash
kubectl get pods -o json | jq '.items[].metadata.name'
kubectl get deploy my-app -o json | jq '.spec.replicas'

yq '.spec.template.spec.containers[0].image' deployment.yaml
yq -i '.spec.replicas = 5' deployment.yaml   # in-place edit
```

## 17.9 curl / dig / nslookup / netshoot

The classic network-debugging toolkit, used **from inside a pod** (often via `kubectl exec` or `kubectl debug`) to diagnose the "why can't Service A reach Service B" or "why is DNS failing" class of problems (see topic 8's DNS debugging).

```bash
kubectl exec -it my-pod -- curl -v http://backend-svc.shop.svc.cluster.local:8080/health
kubectl exec -it my-pod -- nslookup backend-svc.shop.svc.cluster.local
kubectl exec -it my-pod -- dig backend-svc.shop.svc.cluster.local
```

**netshoot** is a purpose-built container image (`nicolaka/netshoot`) that bundles `curl`, `dig`, `nslookup`, `tcpdump`, `iperf`, `netstat`, and more — since most production images intentionally *don't* include these tools, you run netshoot as a temporary debug pod or via `kubectl debug` when you need them:

```bash
kubectl run tmp-netshoot --rm -it --image=nicolaka/netshoot -- bash
```

## 17.10 Argo CD UI

Covered as a concept in topic 13 (GitOps) — as a **developer tool**, the Argo CD web UI gives you:
- A visual **sync status** per application (in-sync vs out-of-sync/drifted from Git).
- A **diff view** showing exactly what changed between the live cluster state and the desired Git state.
- One-click **manual sync**, **rollback to a previous Git commit**, and a visual **resource tree** (Deployment → ReplicaSet → Pods) for quickly seeing what's unhealthy.

**Analogy:** It's a live dashboard version of "git diff" and "git log," but comparing your *running cluster* against your *Git repository* instead of comparing two commits.

## 17.11 Prometheus / Grafana

Covered in topic 14 (Observability) as the metrics stack — as day-to-day developer tools:
- **Prometheus** exposes a query language (**PromQL**) you'll use directly for ad-hoc investigation, e.g.:
  ```promql
  rate(http_requests_total{job="my-app", status=~"5.."}[5m])
  ```
  ("What's the per-second rate of 5xx errors from my-app over the last 5 minutes?")
- **Grafana** is the dashboarding layer on top — pre-built dashboards for CPU/memory/latency/error-rate, and a place to build custom panels and alerts.

**Best practice:** Learn a handful of PromQL patterns you'll reuse constantly — rate() over a counter, histogram_quantile() for latency percentiles, and sum(...) by (label) for aggregating across pod replicas — rather than trying to memorize every function up front.

---

## Quick Recap Table

| Topic | One-line takeaway |
|---|---|
| RBAC | Deny-by-default permissions for *who* can do *what* to *which K8s objects* |
| IRSA/Pod Identity | Bridges Kubernetes ServiceAccounts to temporary AWS IAM credentials — no long-lived keys |
| NetworkPolicy | Pod-level firewall rules, enforced by the CNI, based on labels |
| Security Groups | VPC-level firewall rules, enforced by AWS, based on IPs/ports |
| Non-root + read-only FS | Shrinks what an attacker can do if a container is compromised |
| Replica redundancy + Multi-AZ | No single point of failure — one pod, node, or AZ dying shouldn't cause an outage |
| Readiness + graceful termination | Makes rolling updates actually zero-downtime |
| Requests/limits + QoS | Determines scheduling fairness and who gets evicted first under pressure |
| Taints/tolerations | Repel pods from nodes unless they explicitly "opt in" |
| DR/backup | Git backs up *config*; snapshots/DB backups back up *data* — you need both |
| kubectl/k9s/stern/jq/netshoot | The daily toolkit for inspecting, debugging, and operating a live cluster |

---

