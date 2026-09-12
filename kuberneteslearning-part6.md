# Kubernetes Deep Dive — Part 3: Security, Reliability & Production, Developer Tools

> This is Part 3 of your Kubernetes learning notes, covering topics **15 (Security)**, **16 (Reliability & Production)**, and **17 (Developer Tools)**.

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
