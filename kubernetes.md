# Kubernetes: 100 Questions Answered

---

## 1. What is Kubernetes?

Kubernetes (K8s) is an open-source container orchestration platform originally developed by Google and now maintained by the Cloud Native Computing Foundation (CNCF). It automates the deployment, scaling, scheduling, and management of containerized applications across clusters of machines.

---

## 2. Why is Kubernetes Used?

- **Automated deployment & rollbacks** — deploy new versions safely and roll back on failure
- **Self-healing** — restarts failed containers, replaces and reschedules pods on dead nodes
- **Horizontal scaling** — scale applications up/down manually or automatically
- **Service discovery & load balancing** — built-in DNS and traffic distribution
- **Secret & config management** — manage sensitive data and configuration separately from code
- **Storage orchestration** — auto-mount local, cloud, or network storage
- **Multi-cloud & hybrid support** — runs on AWS, GCP, Azure, on-prem, or bare metal

---

## 3. What is a Pod?

A Pod is the **smallest deployable unit** in Kubernetes. It represents a single instance of a running process in the cluster and can contain one or more tightly coupled containers that share:

- The same network namespace (IP address and ports)
- The same storage volumes
- The same lifecycle

---

## 4. Difference Between Pod and Container?

| Aspect | Container | Pod |
|---|---|---|
| Definition | Isolated runtime for an application | Kubernetes wrapper around one or more containers |
| Networking | Has its own network stack | Containers in a Pod share one IP |
| Management | Managed by container runtime (Docker, containerd) | Managed by Kubernetes |
| Lifecycle | Independent | All containers in a Pod start/stop together |
| Storage | No built-in volume sharing | Containers in a Pod share volumes |

A Pod is a Kubernetes abstraction; a Container is the actual running process inside it.

---

## 5. What is a Deployment?

A Deployment is a Kubernetes resource that manages a **stateless application**. It describes the desired state (e.g., "run 3 replicas of this container image") and the Deployment Controller continuously reconciles actual state to match. It supports:

- Rolling updates and rollbacks
- Scaling up/down
- Self-healing via ReplicaSets

---

## 6. What is a ReplicaSet?

A ReplicaSet ensures that a **specified number of identical Pod replicas** are running at any given time. If a Pod dies, the ReplicaSet creates a new one. If there are too many Pods, it terminates extras.

> In practice, you rarely create ReplicaSets directly — Deployments manage them for you automatically.

---

## 7. Difference Between Deployment and StatefulSet?

| Feature | Deployment | StatefulSet |
|---|---|---|
| Use case | Stateless apps (web servers, APIs) | Stateful apps (databases, queues) |
| Pod identity | Pods are interchangeable | Each Pod has a stable, unique identity |
| Pod naming | Random suffix (pod-xyz) | Ordered suffix (pod-0, pod-1, pod-2) |
| Storage | Shared or ephemeral | Each Pod gets its own PersistentVolume |
| Scaling order | Simultaneous | Ordered (one at a time) |
| Examples | Nginx, Node.js APIs | MySQL, Kafka, Zookeeper |

---

## 8. What is a DaemonSet?

A DaemonSet ensures that **one copy of a Pod runs on every node** (or a subset of nodes) in the cluster. When nodes are added, Pods are automatically scheduled on them. When nodes are removed, Pods are garbage-collected.

**Common uses:**
- Log collectors (Fluentd, Filebeat)
- Monitoring agents (Prometheus Node Exporter)
- Network plugins (CNI agents)
- Security agents

---

## 9. What is a Service in Kubernetes?

A Service is an abstraction that defines a **stable network endpoint** to access a set of Pods. Since Pods are ephemeral and their IPs change, Services provide a consistent IP address and DNS name that load-balances traffic to matching Pods using label selectors.

---

## 10. Types of Kubernetes Services?

1. **ClusterIP** — internal-only access within the cluster (default)
2. **NodePort** — exposes the service on each node's IP at a static port
3. **LoadBalancer** — provisions an external cloud load balancer
4. **ExternalName** — maps a service to an external DNS name
5. **Headless** — no ClusterIP; used with StatefulSets for direct Pod DNS

---

## 11. Difference Between ClusterIP, NodePort, and LoadBalancer?

| Type | Accessible From | Use Case |
|---|---|---|
| ClusterIP | Inside the cluster only | Internal microservice communication |
| NodePort | Outside via `<NodeIP>:<NodePort>` | Development/testing, simple external access |
| LoadBalancer | External via cloud LB public IP | Production external traffic (AWS ELB, GCP LB) |

**Traffic flow:**
- `LoadBalancer` → `NodePort` → `ClusterIP` → Pod (each builds on the previous)

---

## 12. What is Ingress?

Ingress is a Kubernetes API object that manages **external HTTP/HTTPS access** to services within a cluster. It provides:

- Host-based routing (`api.example.com` → API service)
- Path-based routing (`/api` → API, `/web` → frontend)
- TLS/SSL termination
- Rewrite rules and redirects

Ingress does **not** expose arbitrary ports/protocols — it is HTTP/HTTPS specific.

---

## 13. What is an Ingress Controller?

An Ingress Controller is the **actual implementation** that fulfills Ingress rules. Kubernetes defines the Ingress spec, but a controller is required to act on it.

**Popular controllers:**
- **NGINX Ingress Controller** — most common, open source
- **Traefik** — modern, auto-discovery
- **HAProxy** — high performance
- **AWS ALB Ingress Controller** — native AWS integration
- **Istio Gateway** — service mesh based

---

## 14. Kubernetes Architecture

### Control Plane (Master Node)
| Component | Role |
|---|---|
| **API Server** | Entry point for all REST commands; validates and persists state |
| **etcd** | Distributed key-value store; stores all cluster state |
| **Scheduler** | Assigns Pods to nodes based on resource availability |
| **Controller Manager** | Runs controller loops (Node, ReplicaSet, Endpoint controllers) |
| **Cloud Controller Manager** | Integrates with cloud provider APIs |

### Worker Nodes
| Component | Role |
|---|---|
| **Kubelet** | Agent on each node; ensures containers run as specified |
| **Kube Proxy** | Maintains network rules for Pod-to-Service communication |
| **Container Runtime** | Runs containers (containerd, CRI-O, Docker) |

### Flow
```
User → kubectl → API Server → etcd (persists)
                            → Scheduler (assigns node)
                            → Controller Manager (reconciles)
                            → Kubelet on Node (runs Pod)
```

---

## 15. What is etcd?

etcd is a **distributed, consistent key-value store** that serves as Kubernetes' "brain" — the single source of truth for all cluster state. Every resource (Pods, Services, ConfigMaps, Secrets) is stored here.

- Uses the **Raft consensus algorithm** for high availability
- Typically runs as a 3 or 5 node cluster for fault tolerance
- All API Server reads/writes go through etcd
- Should be backed up regularly in production

---

## 16. What is Kubelet?

The Kubelet is a **node-level agent** that runs on every worker node. It:

- Watches the API Server for Pods assigned to its node
- Instructs the container runtime to start/stop containers
- Reports node and Pod status back to the control plane
- Runs liveness/readiness probes
- Manages container logs and resource reporting

---

## 17. What is Kube Proxy?

Kube Proxy runs on every node and maintains **network rules** (iptables or IPVS) that allow network communication to Pods from inside or outside the cluster. It implements the Service abstraction by routing traffic to the correct Pod endpoints.

---

## 18. What is the API Server?

The Kubernetes API Server (`kube-apiserver`) is the **front-end of the control plane**. It:

- Exposes the Kubernetes REST API
- Validates all incoming requests
- Is the only component that reads from and writes to etcd
- Handles authentication, authorization (RBAC), and admission control
- Is horizontally scalable for high availability

---

## 19. What is the Scheduler in Kubernetes?

The `kube-scheduler` watches for newly created Pods with no assigned node and **selects the best node** to run them based on:

- Resource availability (CPU, memory)
- Node affinity/anti-affinity rules
- Taints and tolerations
- Pod topology spread constraints
- Custom scheduling policies

---

## 20. What are Controllers in Kubernetes?

Controllers are **control loops** that continuously watch the cluster state and make changes to move the current state toward the desired state. Each controller manages a specific resource type:

- **ReplicaSet Controller** — ensures correct Pod count
- **Node Controller** — responds to node failures
- **Endpoint Controller** — populates Service endpoints
- **Job Controller** — manages batch jobs to completion
- **CronJob Controller** — schedules jobs on a time basis

---

## 21. What is Horizontal Pod Autoscaler (HPA)?

HPA **automatically scales the number of Pod replicas** in a Deployment, ReplicaSet, or StatefulSet based on observed metrics like CPU utilization, memory usage, or custom metrics from Prometheus.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
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

---

## 22. What is Vertical Pod Autoscaler (VPA)?

VPA **automatically adjusts the CPU and memory requests/limits** of containers in a Pod based on historical usage. It resizes Pods to right-size resource allocations, potentially evicting and restarting Pods with new settings.

**Modes:**
- `Off` — only recommendations, no changes
- `Initial` — sets resources at Pod creation only
- `Auto` — updates Pods (may restart them)

---

## 23. What is Cluster Autoscaler?

The Cluster Autoscaler **automatically adjusts the number of nodes** in a cluster:

- **Scales up** when Pods are unschedulable due to insufficient resources
- **Scales down** when nodes are underutilized and their Pods can be rescheduled elsewhere

Works natively with AWS (ASG), GCP (MIGs), and Azure (VMSS).

---

## 24. Difference Between HPA and VPA?

| Feature | HPA | VPA |
|---|---|---|
| What it scales | Number of Pods (horizontal) | Resources per Pod (vertical) |
| Metric basis | CPU/memory/custom metrics | Historical resource usage |
| Downtime | None (adds/removes Pods) | May restart Pods to resize |
| Use case | Variable traffic loads | Right-sizing resource requests |
| Can be used together? | Carefully (avoid conflicts on CPU metrics) | Yes, with HPA on custom metrics |

---

## 25. What are Resource Requests and Limits?

**Requests** — the minimum resources a container is **guaranteed**. Used by the Scheduler to decide node placement.

**Limits** — the maximum resources a container **can use**. Enforced by the container runtime.

```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "250m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

- `250m` = 0.25 CPU cores
- If no limits are set, a container can consume all node resources

---

## 26. What Happens When a Pod Exceeds Memory Limits?

When a container exceeds its memory limit:

1. The Linux kernel's **Out-Of-Memory (OOM) killer** terminates the process
2. Kubernetes records the termination reason as **OOMKilled**
3. The Pod is restarted by the kubelet (based on its `restartPolicy`)
4. If it keeps crashing, the Pod enters `CrashLoopBackOff`

---

## 27. What is OOMKilled?

`OOMKilled` (Out Of Memory Killed) is a **container termination reason** that indicates the container was killed because it exceeded its configured memory limit. It's visible in:

```bash
kubectl describe pod <pod-name>
# Last State: Terminated
#   Reason: OOMKilled
```

**Fix:** Increase memory limits, fix memory leaks, or use VPA for auto-sizing.

---

## 28. What is a Persistent Volume (PV)?

A Persistent Volume is a **piece of storage in the cluster** provisioned by an administrator or dynamically by a StorageClass. It is a cluster-level resource with a lifecycle independent of any individual Pod.

- Backed by: NFS, iSCSI, AWS EBS, GCP PD, Azure Disk, etc.
- Has access modes: `ReadWriteOnce`, `ReadOnlyMany`, `ReadWriteMany`
- Has a reclaim policy: `Retain`, `Recycle`, `Delete`

---

## 29. What is a Persistent Volume Claim (PVC)?

A PVC is a **user's request for storage**. It specifies size, access mode, and optionally a StorageClass. Kubernetes binds it to a matching PV.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 5Gi
```

---

## 30. Difference Between PV and PVC?

| Aspect | PersistentVolume (PV) | PersistentVolumeClaim (PVC) |
|---|---|---|
| Who creates it | Admin or StorageClass (dynamic) | Developer/user |
| Scope | Cluster-wide resource | Namespace-scoped resource |
| Represents | Actual storage backend | Request for storage |
| Analogy | A physical hard drive | A ticket to reserve that drive |

---

## 31. What is a StorageClass?

A StorageClass defines **how storage is dynamically provisioned**. When a PVC requests storage with a given StorageClass, Kubernetes automatically creates a PV.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
```

Common provisioners: AWS EBS, GCP PD, Azure Disk, NFS, Ceph (Rook).

---

## 32. What is a ConfigMap?

A ConfigMap stores **non-sensitive configuration data** as key-value pairs. It decouples environment-specific configuration from container images.

**Usage:**
- Mounted as files in a Pod
- Injected as environment variables
- Used in command-line arguments

```yaml
apiVersion: v1
kind: ConfigMap
data:
  APP_ENV: production
  LOG_LEVEL: info
```

---

## 33. What is a Secret?

A Secret stores **sensitive data** (passwords, tokens, certificates) in base64-encoded form. It works like a ConfigMap but is designed for confidential information.

```yaml
apiVersion: v1
kind: Secret
type: Opaque
data:
  password: cGFzc3dvcmQxMjM=   # base64("password123")
```

> Note: base64 is encoding, not encryption. Use external vaults (HashiCorp Vault, AWS Secrets Manager) for true security.

---

## 34. Difference Between ConfigMap and Secret?

| Feature | ConfigMap | Secret |
|---|---|---|
| Data type | Non-sensitive config | Sensitive data |
| Encoding | Plain text | Base64 encoded |
| Storage in etcd | Plain text | Base64 (encrypted at rest if configured) |
| Use case | App settings, URLs | Passwords, API keys, certs |
| RBAC control | Standard | Tighter access recommended |

---

## 35. How do Pods Communicate with Each Other?

- **Within the same Pod** — via `localhost` (shared network namespace)
- **Across Pods in the cluster** — using Pod IPs directly (flat network model) or via Services
- **Using Services** — stable DNS name and VIP regardless of Pod IP changes
- **DNS resolution** — `service-name.namespace.svc.cluster.local`

Kubernetes mandates a flat network: every Pod can reach every other Pod without NAT.

---

## 36. What is CNI?

CNI (Container Network Interface) is a **specification and set of plugins** that configure network interfaces for containers. It defines how network connectivity is set up and torn down for Pods.

**Popular CNI plugins:**
- **Flannel** — simple overlay network
- **Calico** — supports NetworkPolicies, BGP routing
- **Cilium** — eBPF-based, high performance, Layer 7 policies
- **Weave Net** — encrypted mesh network
- **AWS VPC CNI** — native AWS networking

---

## 37. What are Network Policies?

Network Policies are **firewall rules for Pods**. They define which Pods can communicate with which other Pods or external endpoints, using label selectors.

By default, all Pod-to-Pod communication is allowed. A NetworkPolicy can restrict ingress (incoming) and egress (outgoing) traffic.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
spec:
  podSelector:
    matchLabels:
      role: db
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: api
```

Requires a CNI that supports NetworkPolicy (Calico, Cilium, Weave).

---

## 38. What are Taints and Tolerations?

**Taints** are applied to **nodes** to repel Pods from being scheduled on them.

**Tolerations** are applied to **Pods** to allow them to be scheduled on tainted nodes.

```bash
# Taint a node
kubectl taint nodes node1 dedicated=gpu:NoSchedule
```

```yaml
# Pod tolerates the taint
tolerations:
- key: "dedicated"
  operator: "Equal"
  value: "gpu"
  effect: "NoSchedule"
```

**Effects:** `NoSchedule`, `PreferNoSchedule`, `NoExecute`

---

## 39. What are Node Selectors?

Node Selectors are the **simplest form of node constraint**. They allow a Pod to be scheduled only on nodes with specific labels.

```yaml
spec:
  nodeSelector:
    disktype: ssd
    zone: us-east-1a
```

For more complex rules, use Node Affinity instead.

---

## 40. What are Affinity and Anti-Affinity Rules?

**Node Affinity** — schedules Pods on nodes matching label expressions (more powerful than nodeSelector).

**Pod Affinity** — schedules Pods on nodes that already run Pods matching a selector (co-location).

**Pod Anti-Affinity** — schedules Pods on nodes that do NOT have specific Pods (spread across nodes for HA).

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchLabels:
          app: web
      topologyKey: "kubernetes.io/hostname"
```

**Types:** `requiredDuringScheduling...` (hard rule) vs `preferredDuringScheduling...` (soft rule).

---

## 41. What are Namespaces in Kubernetes?

Namespaces are a way to **divide cluster resources between multiple users or teams**. They provide a scope for names — resources must be unique within a namespace but not across them.

**Default namespaces:**
- `default` — default for user workloads
- `kube-system` — Kubernetes system components
- `kube-public` — publicly accessible data
- `kube-node-lease` — node heartbeat leases

---

## 42. Why are Namespaces Used?

- **Multi-tenancy** — isolate teams, projects, or environments
- **Resource quotas** — limit CPU/memory per team
- **RBAC scoping** — grant permissions per namespace
- **Network isolation** — combined with NetworkPolicies
- **Environment separation** — `dev`, `staging`, `prod` in one cluster

---

## 43. What are Labels and Selectors?

**Labels** are key-value pairs attached to Kubernetes objects for identification.

```yaml
metadata:
  labels:
    app: web
    env: production
    version: v2
```

**Selectors** are queries that filter objects by their labels. Used by Services, ReplicaSets, Deployments, and NetworkPolicies to target Pods.

---

## 44. What are Annotations?

Annotations are key-value pairs that store **non-identifying metadata** — information not used by Kubernetes internals but consumed by tools, operators, or humans.

```yaml
metadata:
  annotations:
    deployment.kubernetes.io/revision: "3"
    prometheus.io/scrape: "true"
    build-version: "abc123"
```

Unlike labels, annotations cannot be used in selectors.

---

## 45. What are Init Containers?

Init Containers are **specialized containers that run before app containers** in a Pod. They run sequentially, and all must complete successfully before the main containers start.

**Use cases:**
- Wait for a database to be ready
- Clone a git repository before the app starts
- Set up configuration files
- Run database migrations

---

## 46. What are Sidecar Containers?

Sidecar Containers run **alongside the main application container** in the same Pod, extending or supporting its functionality without modifying it.

**Use cases:**
- Log shipping (Fluentd, Filebeat)
- Service mesh proxies (Envoy in Istio)
- Secret injection agents (Vault Agent)
- Metrics exporters

---

## 47. Difference Between Init Container and Sidecar Container?

| Feature | Init Container | Sidecar Container |
|---|---|---|
| Timing | Runs before main containers | Runs alongside main containers |
| Lifecycle | Exits after completion | Runs for the Pod's entire lifetime |
| Execution | Sequential | Concurrent with main containers |
| Purpose | Setup/pre-conditions | Support/extend the main app |

---

## 48. What are Liveness Probes?

A Liveness Probe determines **whether a container is running**. If it fails, Kubernetes kills the container and restarts it according to the restart policy.

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
```

**Probe types:** `httpGet`, `tcpSocket`, `exec` (run a command)

---

## 49. What are Readiness Probes?

A Readiness Probe determines **whether a container is ready to receive traffic**. If it fails, the Pod is removed from the Service's endpoints — traffic stops being routed to it — but the container is NOT restarted.

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 50. Difference Between Liveness and Readiness Probes?

| Feature | Liveness Probe | Readiness Probe |
|---|---|---|
| Checks | Is the container alive? | Is the container ready for traffic? |
| On failure | Kills and restarts the container | Removes Pod from Service endpoints |
| Use case | Detect deadlocks, stuck processes | Startup delays, overload protection |
| Traffic impact | Temporary interruption during restart | No traffic until probe passes |

---

## 51. What is a Rolling Update?

A Rolling Update gradually replaces old Pod instances with new ones **without downtime**. Kubernetes controls the pace using:

- `maxUnavailable` — max Pods that can be down during update (default: 25%)
- `maxSurge` — max extra Pods above desired count (default: 25%)

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 1
```

---

## 52. What is a Canary Deployment?

A Canary Deployment routes a **small percentage of traffic** to a new version while the majority still goes to the stable version. If the canary is healthy, traffic is gradually shifted.

**Kubernetes approach:**
- Deploy a small number of new-version Pods alongside old ones
- Use Ingress annotations or a service mesh (Istio) for traffic splitting (e.g., 5% new, 95% old)

---

## 53. What is a Blue-Green Deployment?

Blue-Green runs **two identical production environments** simultaneously. "Blue" is live; "Green" is the new version. Once Green is verified, traffic is switched instantly by updating the Service selector.

**Pros:** Instant switchover, easy rollback  
**Cons:** Double the infrastructure cost during deployment

---

## 54. How do you Rollback a Deployment?

```bash
# View rollout history
kubectl rollout history deployment/my-app

# Rollback to previous version
kubectl rollout undo deployment/my-app

# Rollback to a specific revision
kubectl rollout undo deployment/my-app --to-revision=2

# Check rollout status
kubectl rollout status deployment/my-app
```

---

## 55. What is Helm?

Helm is the **package manager for Kubernetes**. It allows you to define, install, and upgrade complex Kubernetes applications using templated YAML files called "Charts." Think of it as `apt` or `npm` for Kubernetes.

---

## 56. Why Use Helm?

- **Reusability** — parameterize and reuse Kubernetes manifests
- **Release management** — track installed application versions
- **Rollbacks** — easy rollback to previous release
- **Dependency management** — install dependent charts automatically
- **Community charts** — thousands of ready-made charts on Artifact Hub

---

## 57. What are Helm Charts?

A Helm Chart is a **collection of files** that describes a Kubernetes application:

```
my-chart/
├── Chart.yaml          # Chart metadata (name, version)
├── values.yaml         # Default configuration values
├── templates/          # Kubernetes manifest templates
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
└── charts/             # Dependent charts
```

---

## 58. Difference Between Docker and Kubernetes?

| Aspect | Docker | Kubernetes |
|---|---|---|
| Purpose | Build and run containers | Orchestrate containers at scale |
| Scope | Single machine | Multi-node cluster |
| Scaling | Manual | Automatic (HPA, Cluster Autoscaler) |
| Self-healing | No | Yes |
| Networking | Docker networks (bridge/overlay) | Flat pod network via CNI |
| Analogy | Shipping a single container | Managing a fleet of container ships |

Docker builds the containers; Kubernetes runs and manages them at scale.

---

## 59. Difference Between Docker Swarm and Kubernetes?

| Feature | Docker Swarm | Kubernetes |
|---|---|---|
| Complexity | Simple, easy setup | Complex, steep learning curve |
| Scalability | Limited | Enterprise-scale |
| Ecosystem | Small | Massive (CNCF ecosystem) |
| Auto-healing | Basic | Advanced |
| Networking | Built-in overlay | Pluggable CNI |
| Load balancing | Built-in | Service/Ingress |
| Adoption | Declining | Industry standard |

---

## 60. What Happens When a Node Goes Down?

1. The Node Controller detects the node is unreachable (after `node-monitor-grace-period`, default 40s)
2. Node is marked as `NotReady`
3. After `pod-eviction-timeout` (default 5 min), Pods on the failed node are marked for eviction
4. The Scheduler reschedules those Pods on healthy nodes
5. New Pods start on the remaining nodes

---

## 61. What Happens When a Pod Crashes?

1. The kubelet detects the container has exited
2. Based on `restartPolicy` (`Always`, `OnFailure`, `Never`), the container is restarted
3. Kubernetes applies **exponential backoff** between restarts (10s → 20s → 40s → ... max 5 min)
4. If the Pod keeps crashing, it enters `CrashLoopBackOff` state
5. The underlying ReplicaSet/Deployment does NOT create a new Pod (restart happens in-place)

---

## 62. How Does Kubernetes Perform Self-Healing?

- **Pod crashes** → Kubelet restarts containers automatically
- **Node failure** → Controller Manager reschedules Pods on healthy nodes
- **Pod deleted** → ReplicaSet Controller creates a replacement immediately
- **Unhealthy container** → Liveness Probe triggers restart
- **Unready container** → Readiness Probe removes Pod from load balancer

---

## 63. How Would you Troubleshoot CrashLoopBackOff?

```bash
# 1. Check Pod status and events
kubectl describe pod <pod-name>

# 2. Check current logs
kubectl logs <pod-name>

# 3. Check previous container logs (before crash)
kubectl logs <pod-name> --previous

# 4. Check exit code in describe output
# Exit 1 = app error, Exit 137 = OOMKilled, Exit 143 = SIGTERM

# 5. Temporarily override the entrypoint to debug
kubectl run debug --image=my-image --command -- sleep 3600
kubectl exec -it debug -- /bin/sh
```

**Common causes:** App startup error, missing ConfigMap/Secret, wrong image, OOMKilled, failed health checks.

---

## 64. How Would you Troubleshoot a Pending Pod?

```bash
# 1. Describe the pod — look at Events section
kubectl describe pod <pod-name>

# 2. Common causes and fixes:
```

| Cause | Symptom in Events | Fix |
|---|---|---|
| Insufficient CPU/memory | `Insufficient cpu` | Add nodes or reduce requests |
| No matching node | `no nodes available` | Check taints, nodeSelector, affinity |
| PVC not bound | `pod has unbound PVCs` | Check StorageClass, PV availability |
| Image pull error | `ImagePullBackOff` | Fix image name, add imagePullSecret |

---

## 65. How Would you Debug a Failing Deployment?

```bash
# 1. Check Deployment status
kubectl rollout status deployment/my-app
kubectl describe deployment my-app

# 2. Check ReplicaSet
kubectl get rs
kubectl describe rs <rs-name>

# 3. Check Pod events
kubectl get pods
kubectl describe pod <pod-name>

# 4. Check logs
kubectl logs deployment/my-app --tail=100

# 5. Check recent events
kubectl get events --sort-by='.lastTimestamp'
```

---

## 66. How Would you Debug Networking Issues Between Pods?

```bash
# 1. Verify Pod IPs and DNS
kubectl get pods -o wide
kubectl exec -it <pod> -- nslookup <service-name>

# 2. Test connectivity
kubectl exec -it <pod> -- curl http://<service-name>:<port>
kubectl exec -it <pod> -- nc -zv <target-pod-ip> <port>

# 3. Check Service and Endpoints
kubectl describe svc <service-name>
kubectl get endpoints <service-name>

# 4. Check NetworkPolicies
kubectl get networkpolicies -n <namespace>

# 5. Run a debug pod
kubectl run netdebug --image=nicolaka/netshoot --rm -it -- bash
```

---

## 67. How Would you Debug High CPU Usage in Kubernetes?

```bash
# 1. Check resource usage at node and pod level
kubectl top nodes
kubectl top pods --all-namespaces --sort-by=cpu

# 2. Check HPA and current replicas
kubectl get hpa

# 3. Describe the pod for resource limits
kubectl describe pod <pod-name>

# 4. Check application metrics in Prometheus/Grafana

# 5. Profile the application inside the container
kubectl exec -it <pod> -- top
kubectl exec -it <pod> -- /bin/sh -c "ps aux | sort -rk 3"
```

---

## 68. How Would you Debug Memory Leaks in Containers?

```bash
# 1. Monitor memory usage over time
kubectl top pods --containers

# 2. Set memory limits and watch for OOMKilled
kubectl describe pod <pod-name> | grep -A5 "Last State"

# 3. Use metrics-server or Prometheus to graph memory over time

# 4. Exec into container and inspect
kubectl exec -it <pod> -- cat /proc/meminfo
kubectl exec -it <pod> -- jmap -heap <pid>  # Java

# 5. Use language-specific profilers (pprof for Go, jvm heap dump for Java)
```

---

## 69. How Would you Monitor Kubernetes Clusters?

**Layered monitoring approach:**

1. **Infrastructure** — Node CPU, memory, disk, network (Node Exporter)
2. **Control plane** — API server latency, etcd performance, scheduler queue
3. **Workloads** — Pod restarts, CPU/memory usage, HPA activity
4. **Application** — Request rate, error rate, latency (RED metrics)
5. **Logs** — Centralized log aggregation and search

---

## 70. Which Tools are Used for Kubernetes Monitoring?

| Layer | Tool |
|---|---|
| Metrics collection | Prometheus |
| Metrics visualization | Grafana |
| Log aggregation | Loki + Promtail |
| Log search | Elasticsearch + Kibana (ELK) |
| Distributed tracing | Jaeger, Tempo |
| Alerting | Alertmanager |
| Pre-built dashboards | kube-prometheus-stack (Helm chart) |
| In-cluster metrics | metrics-server |
| Cost monitoring | Kubecost |

---

## 71. How Does Prometheus Work with Kubernetes?

1. Prometheus **scrapes metrics** from HTTP endpoints (`/metrics`) exposed by Pods, Services, and node exporters
2. Uses **service discovery** to automatically find targets via Kubernetes API
3. Stores time-series data in its local TSDB
4. **AlertManager** handles alerting rules
5. **Grafana** queries Prometheus via PromQL for dashboards

**Key components of kube-prometheus-stack:**
- Prometheus Operator (manages Prometheus via CRDs)
- ServiceMonitor/PodMonitor (define scrape targets)
- Grafana (visualization)
- AlertManager (alert routing)
- Node Exporter (node metrics)
- kube-state-metrics (Kubernetes object metrics)

---

## 72. What is Loki Used For?

Loki is a **horizontally scalable log aggregation system** by Grafana Labs, designed for Kubernetes. Unlike Elasticsearch, it indexes only **log labels** (not content), making it much cheaper to run.

- Promtail (agent) ships logs from nodes to Loki
- LogQL is used to query logs (similar to PromQL)
- Integrates natively with Grafana alongside Prometheus

---

## 73. What is Service Discovery in Kubernetes?

Service discovery is the mechanism by which services **find each other** without hardcoded IPs. Kubernetes provides automatic service discovery via:

- **DNS** — every Service gets a DNS record automatically
- **Environment variables** — Kubernetes injects service host/port into Pod env vars
- **Labels + Selectors** — Services dynamically discover their Pod endpoints

---

## 74. How Does DNS Work in Kubernetes?

Every Service gets a DNS record:

```
<service-name>.<namespace>.svc.cluster.local
```

Pods can reach services using short names within the same namespace (`my-service`) or fully qualified names across namespaces.

Pod DNS is also available:

```
<pod-ip-with-dashes>.<namespace>.pod.cluster.local
```

---

## 75. What is CoreDNS?

CoreDNS is the **default DNS server** in Kubernetes clusters (replaced kube-dns since 1.11). It:

- Runs as a Deployment in `kube-system`
- Resolves Service and Pod DNS names within the cluster
- Is extensible via plugins (health, cache, forward, rewrite, etc.)
- Configurable via a `Corefile` ConfigMap

---

## 76. How do you Expose an Application Externally?

**Options in order of complexity:**

1. **NodePort** — quick, for testing only
2. **LoadBalancer** — cloud load balancer per service (expensive at scale)
3. **Ingress** — single LB with host/path-based routing (recommended)
4. **ExternalDNS** — auto-update DNS records for services/ingress
5. **Service Mesh (Istio Gateway)** — advanced traffic management

---

## 77. How do you Secure Kubernetes Secrets?

1. **Enable encryption at rest** — configure `EncryptionConfiguration` for etcd
2. **Use external secret stores** — HashiCorp Vault, AWS Secrets Manager, Azure Key Vault
3. **Use External Secrets Operator** — sync external secrets into Kubernetes Secrets
4. **Restrict access with RBAC** — limit who can read Secret resources
5. **Avoid mounting unnecessary secrets** — only mount what the Pod needs
6. **Audit secret access** — enable Kubernetes audit logging

---

## 78. How do you Manage Application Configuration in Kubernetes?

- **ConfigMaps** — non-sensitive environment-specific config
- **Secrets** — sensitive values (DB passwords, API keys)
- **Helm values.yaml** — parameterized configs per environment
- **Kustomize** — overlay-based config management without templates
- **External Secrets Operator** — pull configs from external sources
- **Spring Cloud Config / Consul** — for dynamic config refresh in Java/Go apps

---

## 79. What is RBAC in Kubernetes?

RBAC (Role-Based Access Control) controls **who can do what** in the Kubernetes API.

**Key resources:**
- `Role` — defines permissions within a namespace
- `ClusterRole` — defines permissions cluster-wide
- `RoleBinding` — binds a Role to a user/group/ServiceAccount (namespace)
- `ClusterRoleBinding` — binds a ClusterRole cluster-wide

```yaml
# Allow reading pods in "dev" namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: dev
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
```

---

## 80. What are Service Accounts?

Service Accounts are **Kubernetes identities for Pods** (as opposed to user accounts for humans). They allow Pods to authenticate to the Kubernetes API and are used with RBAC to grant specific permissions.

```yaml
spec:
  serviceAccountName: my-app-sa
```

Every namespace has a `default` Service Account. Best practice: create dedicated Service Accounts with least-privilege permissions.

---

## 81. How do you Secure Communication Between Microservices?

1. **mTLS** — mutual TLS via a service mesh (Istio, Linkerd)
2. **NetworkPolicies** — restrict which Pods can talk to which
3. **RBAC** — control API access between services
4. **JWT/OAuth2** — application-level authentication
5. **Secrets management** — rotate credentials automatically

---

## 82. What is mTLS in Kubernetes?

mTLS (mutual TLS) means **both sides of a connection authenticate each other** using certificates. Unlike standard TLS (only the server authenticates), mTLS ensures the client is also verified.

In Kubernetes, a **service mesh** like Istio or Linkerd automatically injects sidecar proxies (Envoy) that handle mTLS transparently — your application code doesn't need to change.

---

## 83. Difference Between Stateful and Stateless Applications?

| Aspect | Stateless | Stateful |
|---|---|---|
| Data | No persistent data stored locally | Stores data that must survive restarts |
| Scaling | Scale out freely (any replica handles any request) | Scaling is complex; identity matters |
| Examples | Web servers, REST APIs, microservices | Databases, message queues, caches |
| K8s resource | Deployment | StatefulSet |

---

## 84. When Would you Use StatefulSet?

Use StatefulSet when your application requires:

- **Stable network identity** — consistent hostname across restarts
- **Stable storage** — each Pod needs its own persistent volume
- **Ordered deployment** — Pods must start/stop in sequence
- **Ordered scaling** — scale one Pod at a time

**Examples:** MySQL, PostgreSQL, Kafka, Zookeeper, Elasticsearch, Redis Cluster

---

## 85. How do you Deploy Databases in Kubernetes?

**Option 1 — StatefulSet (self-managed):**
- Deploy with StatefulSet + PVCs for data persistence
- Use Operators for advanced management (lifecycle, backups, failover)

**Option 2 — Kubernetes Operators:**
- MySQL Operator, PostgreSQL Operator (CloudNativePG), Redis Operator
- Automate backup, restore, scaling, failover

**Option 3 — Managed cloud databases:**
- Use AWS RDS, GCP Cloud SQL, Azure Database outside Kubernetes
- Recommended for production when operational simplicity > cost

---

## 86. How do you Scale Applications in Kubernetes?

**Manual scaling:**
```bash
kubectl scale deployment my-app --replicas=5
```

**Horizontal Pod Autoscaler (HPA):** Auto-scales Pods based on CPU/memory/custom metrics

**Vertical Pod Autoscaler (VPA):** Auto-adjusts resource requests per Pod

**Cluster Autoscaler:** Adds/removes nodes based on pending Pods

**KEDA (Kubernetes Event-Driven Autoscaling):** Scale based on external events (queue depth, HTTP traffic, cron)

---

## 87. How do Rolling Updates Ensure Zero Downtime?

1. New Pods are created alongside old ones (controlled by `maxSurge`)
2. Kubernetes waits for new Pods to pass Readiness Probes before routing traffic
3. Old Pods are terminated gradually (controlled by `maxUnavailable`)
4. Traffic is only sent to Pods that have passed readiness checks
5. If new Pods fail probes, the rollout pauses — old Pods stay alive

---

## 88. How do you Deploy a Microservices Architecture in Kubernetes?

1. **One Deployment per service** with appropriate resource limits
2. **Services** for internal discovery and load balancing
3. **Ingress** for external routing to services
4. **ConfigMaps/Secrets** for per-service configuration
5. **Namespaces** for environment isolation
6. **Helm** charts per microservice, managed via umbrella chart or GitOps
7. **Service mesh** (Istio/Linkerd) for mTLS, observability, traffic management

---

## 89. How Would you Deploy WebSocket Servers in Kubernetes?

- Use **SessionAffinity: ClientIP** on the Service to route a client to the same Pod
- Or use **Ingress with sticky sessions** (`nginx.ingress.kubernetes.io/affinity: cookie`)
- Ensure **no timeout at Ingress/LB** level (`proxy-read-timeout: 3600`)
- Use **StatefulSets** if WebSocket state must be per-Pod
- For pub/sub across pods, use Redis Pub/Sub or a message queue

---

## 90. How Would you Handle Sticky Sessions in Kubernetes?

```yaml
# Service-level affinity (IP-based)
spec:
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 3600
```

```yaml
# Ingress-level affinity (cookie-based — more reliable)
annotations:
  nginx.ingress.kubernetes.io/affinity: "cookie"
  nginx.ingress.kubernetes.io/session-cookie-name: "INGRESSCOOKIE"
  nginx.ingress.kubernetes.io/session-cookie-expires: "172800"
```

---

## 91. How Would you Deploy Kafka/Redis in Kubernetes?

**Kafka:**
- Use the **Strimzi Operator** — manages Kafka clusters as CRDs
- Deploy with StatefulSet, dedicated PVCs per broker
- Configure anti-affinity to spread brokers across nodes

**Redis:**
- **Redis Standalone**: simple Deployment + PVC
- **Redis Sentinel**: HA with automatic failover
- **Redis Cluster**: sharded, use Redis Operator (Spotahome or Redis Enterprise)
- Consider **managed Redis** (ElastiCache, Redis Cloud) for production

---

## 92. What is an Operator in Kubernetes?

An Operator is a **Kubernetes-native application** that uses CRDs and controllers to automate the management of complex, stateful applications. It encodes operational knowledge (deploy, scale, upgrade, backup, restore) into software.

**Examples:**
- Prometheus Operator
- CloudNativePG (PostgreSQL)
- Strimzi (Kafka)
- Elasticsearch Operator

Pattern: CRD (what you want) + Controller (makes it happen).

---

## 93. What are Custom Resource Definitions (CRDs)?

CRDs extend the Kubernetes API with **custom resource types**. Once a CRD is created, you can create instances of that resource using `kubectl` like any native Kubernetes object.

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: kafkas.kafka.strimzi.io
```

After applying, you can do `kubectl get kafkas` — Operators watch these custom resources.

---

## 94. What is GitOps?

GitOps is a **deployment methodology** where:

- The **desired state** of the cluster is stored in a Git repository
- A GitOps operator (ArgoCD, FluxCD) continuously **syncs** the cluster to match the Git state
- All changes go through Git (PRs, code review, audit trail)
- Drift between Git and cluster is automatically detected and corrected

**Benefits:** Auditability, rollback via git revert, consistency, security.

---

## 95. What is ArgoCD?

ArgoCD is a **declarative GitOps continuous delivery tool** for Kubernetes. It:

- Monitors Git repositories for changes to Kubernetes manifests
- Automatically (or manually) syncs changes to the cluster
- Provides a web UI and CLI for managing applications
- Supports Helm, Kustomize, Jsonnet, and plain YAML
- Shows diff between desired and live state

---

## 96. What is FluxCD?

FluxCD is another **GitOps toolkit** for Kubernetes, part of the CNCF sandbox. It:

- Watches Git repos, Helm repos, and OCI registries
- Applies changes automatically to the cluster
- Is more modular and CLI-driven than ArgoCD
- Supports multi-tenancy natively
- Uses GitRepository, Kustomization, HelmRelease CRDs

**ArgoCD vs FluxCD:** ArgoCD has a richer UI; FluxCD is more composable and CLI-focused.

---

## 97. How do CI/CD Pipelines Integrate with Kubernetes?

**Typical flow:**
```
Code Push → CI (GitHub Actions / Jenkins / GitLab CI)
  → Build Docker image
  → Push image to registry (ECR, GCR, Docker Hub)
  → Update image tag in Git (Helm values / Kustomize overlay)
  → ArgoCD/FluxCD detects change → Deploys to Kubernetes
```

**Push model:** CI pipeline runs `kubectl apply` or `helm upgrade` directly (less secure, requires cluster credentials in CI)

**Pull model (preferred):** GitOps operator polls Git and applies changes (cluster credentials stay inside the cluster)

---

## 98. How do you Manage Multiple Environments in Kubernetes?

**Option 1 — Multiple Namespaces in one cluster:**
- `dev`, `staging`, `prod` namespaces
- Simple but no hard isolation

**Option 2 — Multiple clusters:**
- Separate cluster per environment
- Strong isolation, more management overhead

**Option 3 — Kustomize overlays:**
```
base/           # common manifests
overlays/
  dev/          # dev-specific patches
  staging/
  prod/
```

**Option 4 — Helm + values files:**
```bash
helm install my-app ./chart -f values.prod.yaml
```

---

## 99. How do you Optimize Kubernetes Costs?

| Strategy | Action |
|---|---|
| Right-size resources | Use VPA recommendations; avoid over-provisioning |
| Use HPA | Scale down during low traffic |
| Use Cluster Autoscaler | Remove idle nodes automatically |
| Spot/Preemptible instances | Use for non-critical, fault-tolerant workloads |
| Namespace resource quotas | Prevent resource waste by teams |
| Set Pod Disruption Budgets | Allow safe spot interruptions |
| Use Kubecost | Visualize cost per namespace/team/workload |
| Container image optimization | Smaller images = faster pulls, less storage |
| Delete unused resources | Regular cleanup of orphaned PVCs, LBs, namespaces |

---

## 100. Best Practices for Running Production Workloads in Kubernetes

**Reliability:**
- Set resource requests and limits on all containers
- Configure liveness and readiness probes
- Use Pod Disruption Budgets (PDB) to ensure availability during disruptions
- Run at least 3 replicas for critical services
- Use anti-affinity rules to spread Pods across nodes

**Security:**
- Enable RBAC with least-privilege principles
- Use dedicated ServiceAccounts per application
- Encrypt Secrets at rest; use external secret managers
- Scan container images for vulnerabilities (Trivy, Snyk)
- Use NetworkPolicies to restrict east-west traffic
- Run containers as non-root users

**Scalability:**
- Configure HPA for all stateless workloads
- Use Cluster Autoscaler with appropriate node pools
- Set appropriate PodDisruptionBudgets

**Observability:**
- Deploy kube-prometheus-stack for metrics
- Centralize logs with Loki or ELK
- Set up distributed tracing (Jaeger/Tempo)
- Create actionable alerts (not alert fatigue)

**Operations:**
- Use GitOps (ArgoCD/FluxCD) for all deployments
- Tag and version all container images; avoid `latest`
- Use Helm or Kustomize for manifest management
- Regularly back up etcd
- Test disaster recovery procedures

---

*This document covers 100 essential Kubernetes concepts from fundamentals to production best practices.*