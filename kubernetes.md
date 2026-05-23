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

# Kubernetes & Cloud Observability: Complete Reference Guide

---

## Table of Contents

1. [How do you monitor Kubernetes clusters?](#1-how-do-you-monitor-kubernetes-clusters)
2. [Difference between liveness and readiness probes?](#2-difference-between-liveness-and-readiness-probes)
3. [Why do pods restart repeatedly?](#3-why-do-pods-restart-repeatedly)
4. [How do you debug CrashLoopBackOff?](#4-how-do-you-debug-crashloopbackoff)
5. [What is kube-state-metrics?](#5-what-is-kube-state-metrics)
6. [What metrics matter for nodes?](#6-what-metrics-matter-for-nodes)
7. [How do you monitor ingress traffic?](#7-how-do-you-monitor-ingress-traffic)
8. [How do you monitor container resource usage?](#8-how-do-you-monitor-container-resource-usage)
9. [What causes OOMKilled errors?](#9-what-causes-oomkilled-errors)
10. [How do you observe autoscaling behavior?](#10-how-do-you-observe-autoscaling-behavior)
11. [How do you monitor service mesh traffic?](#11-how-do-you-monitor-service-mesh-traffic)
12. [What is distributed observability in Kubernetes?](#12-what-is-distributed-observability-in-kubernetes)
13. [How do you collect logs from containers?](#13-how-do-you-collect-logs-from-containers)
14. [Sidecar logging vs DaemonSet logging?](#14-sidecar-logging-vs-daemonset-logging)
15. [How do you trace requests across Kubernetes services?](#15-how-do-you-trace-requests-across-kubernetes-services)
16. [Challenges with ephemeral containers?](#16-challenges-with-ephemeral-containers)
17. [How do you monitor AWS Lambda/serverless?](#17-how-do-you-monitor-aws-lambdaserverless)
18. [Cold start monitoring?](#18-cold-start-monitoring)
19. [CloudWatch vs Prometheus?](#19-cloudwatch-vs-prometheus)
20. [How do you monitor multi-region deployments?](#20-how-do-you-monitor-multi-region-deployments)

---

## 1. How do you monitor Kubernetes clusters?

Monitoring a Kubernetes cluster is a multi-layered discipline. It is not simply about watching CPU and memory — it encompasses the health of the control plane, data plane, workloads, networking, storage, and the applications running inside containers. A comprehensive strategy involves four primary signals: **metrics**, **logs**, **traces**, and **events**.

### The Observability Stack

The de-facto open-source Kubernetes monitoring stack centers on:

- **Prometheus** — pull-based metrics collection and storage
- **Grafana** — visualization and dashboards
- **Alertmanager** — alert routing and silencing
- **kube-state-metrics** — Kubernetes object state as metrics
- **node-exporter** — host-level OS and hardware metrics
- **cAdvisor** (embedded in kubelet) — per-container resource usage

Commercial alternatives and complements include Datadog, Dynatrace, New Relic, Elastic Observability, and Grafana Cloud.

### Monitoring Layers

**Control Plane**

The API server, scheduler, controller manager, and etcd are foundational. If these degrade, the entire cluster is compromised even if workloads appear healthy.

Key signals:
- `apiserver_request_total` — request rate broken down by verb, resource, code
- `apiserver_request_duration_seconds` — API latency percentiles (p50, p99)
- `etcd_disk_wal_fsync_duration_seconds` — etcd write latency (should be < 10ms)
- `scheduler_scheduling_attempt_duration_seconds` — scheduling latency
- `controller_manager_work_queue_depth` — backlog in reconciliation loops

**Node Layer**

CPU, memory, disk I/O, network, and kernel-level metrics from node-exporter. See [Section 6](#6-what-metrics-matter-for-nodes) for a deep dive.

**Workload Layer**

Pod health, restarts, resource consumption, and readiness via kube-state-metrics and cAdvisor.

**Application Layer**

Custom business metrics emitted by your services via Prometheus client libraries or StatsD, plus traces and structured logs.

### Prometheus Operator and kube-prometheus-stack

The `kube-prometheus-stack` Helm chart (formerly `prometheus-operator`) is the fastest path to a production-grade setup. It installs:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```

It deploys Prometheus, Alertmanager, Grafana, node-exporter, kube-state-metrics, and a set of pre-built dashboards and alert rules (the `kubernetes-mixin` ruleset).

### ServiceMonitor and PodMonitor

Prometheus Operator uses CRDs to discover scrape targets declaratively:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  namespaceSelector:
    matchNames:
      - production
  selector:
    matchLabels:
      app: my-app
  endpoints:
    - port: metrics
      interval: 30s
      path: /metrics
```

### The Four Golden Signals (Google SRE)

For any service, monitor:

1. **Latency** — time to serve requests (distinguish success vs error latency)
2. **Traffic** — request volume (req/s, messages/s)
3. **Errors** — error rate (HTTP 5xx, gRPC codes)
4. **Saturation** — how full the service is (CPU throttling %, queue depth)

These form the basis of SLO-driven alerting and are directly applicable to Kubernetes workloads.

### USE Method (Brendan Gregg)

For every resource (CPU, memory, disk, network):

- **Utilization** — percentage of time the resource is busy
- **Saturation** — degree of extra work it cannot service (queuing)
- **Errors** — error events from the resource

### Kubernetes Events

Events are first-class objects in Kubernetes and are often the fastest way to understand cluster-level issues. They are ephemeral (TTL of ~1 hour by default) and must be persisted with tools like `event-exporter` or sent to a log backend.

```bash
kubectl get events --all-namespaces --sort-by='.lastTimestamp'
kubectl get events -n production --field-selector reason=BackOff
```

Events are especially useful for detecting scheduling failures, image pull errors, volume mount failures, and probe failures before they become full outages.

---

## 2. Difference between liveness and readiness probes?

Kubernetes uses three types of probes to assess container health. Understanding the semantic difference between them is critical because misconfiguring them causes cascading failures more often than almost any other operational mistake.

### Liveness Probe

A liveness probe answers: **"Is this container alive and functional, or is it stuck/deadlocked?"**

When a liveness probe fails, the kubelet **kills the container and restarts it** (subject to the pod's `restartPolicy`). This is a recovery mechanism for processes that have entered a broken state from which they cannot recover on their own — for example, a Go application with a deadlocked goroutine that holds resources but never makes progress.

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 30    # Wait before first check — allow startup
  periodSeconds: 10          # Check every 10 seconds
  failureThreshold: 3        # Kill after 3 consecutive failures
  successThreshold: 1        # 1 success to recover
  timeoutSeconds: 5          # Probe request timeout
```

**Critical design rule:** The liveness endpoint must never depend on downstream services (databases, caches). If the database is down, the app is not "dead" — it is waiting. Failing liveness over a downstream dependency causes the pod to restart in a loop, making the situation worse (thundering herd on recovery, losing any in-memory state, taking time to warm up caches). The liveness check should verify only internal process health: goroutine health, internal lock states, or just that the HTTP server is responding.

### Readiness Probe

A readiness probe answers: **"Is this container ready to receive traffic?"**

When a readiness probe fails, the container is **removed from the Endpoints object** of all matching Services. Traffic is no longer routed to it. The container is not restarted. This is the mechanism for graceful degradation: if an app needs to warm up a cache, establish a database connection pool, or temporarily stop serving (e.g., during a rolling update), the readiness probe signals this.

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
  successThreshold: 2        # Require 2 successes to re-add to endpoints
```

The readiness check **can and should** check downstream dependencies because it controls whether the pod receives traffic. If the database connection pool is exhausted, the pod should report not-ready.

### Startup Probe

A startup probe answers: **"Has the container finished its initialization sequence?"**

It disables liveness and readiness probes until it succeeds. This is designed for slow-starting applications (JVM apps, applications loading large ML models) where you cannot set a high enough `initialDelaySeconds` on the liveness probe without leaving broken containers running too long.

```yaml
startupProbe:
  httpGet:
    path: /healthz
    port: 8080
  failureThreshold: 30       # Allow up to 30 * 10s = 5 minutes to start
  periodSeconds: 10
```

### Summary Comparison

| Aspect | Liveness | Readiness | Startup |
|---|---|---|---|
| Failure action | Restart container | Remove from endpoints | Disable liveness/readiness |
| Purpose | Detect deadlock/crash | Control traffic routing | Allow slow startup |
| Checks dependencies? | No | Yes | No |
| Affects scheduling? | No | No | No |

### Common Mistakes

- Setting `initialDelaySeconds` too low causes restarts during JVM warm-up, resulting in CrashLoopBackOff
- Making liveness probe check the database — a downstream outage triggers a restart loop cluster-wide
- Not setting a startup probe for slow apps and using a very high `initialDelaySeconds` on liveness instead, which means a truly dead container takes forever to restart
- Not setting `successThreshold > 1` for readiness on flapping services, causing endpoints to oscillate rapidly

---

## 3. Why do pods restart repeatedly?

Repeated pod restarts are one of the most common Kubernetes operational issues. The root causes span a wide spectrum from application bugs to resource exhaustion to misconfiguration.

### Restart Counter

The restart count in `kubectl get pods` increments every time the container is restarted. The restart policy of a pod (`Always`, `OnFailure`, `Never`) controls whether and when restarts happen.

```bash
kubectl get pods -n production
# NAME                    READY   STATUS             RESTARTS   AGE
# my-app-6d4b9f7c-x9q2p   0/1     CrashLoopBackOff   14         23m
```

### Primary Causes

**1. Application crash (non-zero exit code)**

The container process exits with a non-zero code. This is the most straightforward case.

```bash
kubectl logs my-app-6d4b9f7c-x9q2p --previous
# Shows logs from the previous container run
```

Look for panics, uncaught exceptions, or fatal errors. A Java application with `OutOfMemoryError` that causes JVM exit, a Python app with an unhandled exception at startup, or a misconfigured binary that exits immediately are common examples.

**2. OOMKilled**

The container exceeded its memory limit and the Linux OOM killer terminated it. The exit code is 137 (128 + SIGKILL). Covered deeply in [Section 9](#9-what-causes-oomkilled-errors).

```bash
kubectl describe pod my-app-6d4b9f7c-x9q2p | grep -A5 "Last State"
# Last State: Terminated
#   Reason: OOMKilled
#   Exit Code: 137
```

**3. Liveness probe failure**

The liveness probe is too aggressive (low timeout, too few retries) or checks something that legitimately fails under load (like a database connection). The container is killed by the kubelet even though the process itself is fine.

**4. Misconfigured command or entrypoint**

The container starts but the entrypoint script exits immediately — for example, a shell script that runs a command in the background but does not block in the foreground. Docker/Kubernetes requires PID 1 to stay alive.

```dockerfile
# WRONG - starts process in background, shell exits immediately
CMD ["/bin/sh", "-c", "my-app &"]

# CORRECT - process runs in foreground as PID 1
CMD ["my-app"]
# or use exec
CMD ["/bin/sh", "-c", "exec my-app"]
```

**5. Missing dependencies at startup**

The application requires a config file, secret mount, or environment variable that is absent or malformed. Common with `envFrom` referencing a missing ConfigMap or Secret.

```bash
kubectl describe pod my-app-xxx | grep -A10 Events
# Warning  Failed  2m  kubelet  Error: secret "db-credentials" not found
```

**6. Resource pressure and CPU throttling**

Extremely tight CPU limits cause liveness probe timeouts. The container is technically alive but so CPU-throttled that it cannot respond to the probe within the timeout window. This is a particularly subtle failure mode.

**7. Init container failure**

If an init container exits non-zero and the pod's restart policy is `Always`, the init container is retried indefinitely. The main container never starts but the pod still shows restart counts incrementing.

**8. Node-level pressure**

The node is under memory or disk pressure. The kubelet may evict pods (eviction) or the node may experience kernel-level OOM events that kill processes.

### Diagnostic Workflow

```bash
# Step 1: Check pod status and restart count
kubectl get pod <name> -n <ns> -o wide

# Step 2: Describe the pod for events and last state
kubectl describe pod <name> -n <ns>

# Step 3: Get logs from the PREVIOUS container run
kubectl logs <name> -n <ns> --previous

# Step 4: Check resource usage
kubectl top pod <name> -n <ns>

# Step 5: Check node conditions
kubectl describe node <node-name> | grep -A20 Conditions
```

---

## 4. How do you debug CrashLoopBackOff?

`CrashLoopBackOff` is not a crash itself — it is Kubernetes backing off restart attempts using an exponential backoff (10s, 20s, 40s, 80s, 160s, up to a maximum of 300s). The container is crashing, and Kubernetes is throttling how quickly it retries to avoid thrashing the node.

### Step-by-Step Debugging

**Step 1: Examine the exit code**

```bash
kubectl describe pod <pod-name> -n <namespace>
```

Look for the `Last State` section:

```
Last State:     Terminated
  Reason:       Error       <- non-zero exit / crash
  Exit Code:    1
  Started:      Mon, 01 Jan 2024 10:00:00 +0000
  Finished:     Mon, 01 Jan 2024 10:00:02 +0000
```

Exit codes to know:
- `0` — clean exit (process exited intentionally)
- `1` — general application error
- `127` — command not found (bad entrypoint)
- `128+N` — killed by signal N (e.g., 137 = SIGKILL/OOMKilled, 143 = SIGTERM)
- `137` — OOMKilled (memory limit exceeded)
- `139` — segmentation fault (SIGSEGV)

**Step 2: Get previous container logs**

```bash
kubectl logs <pod-name> -n <namespace> --previous
```

This is the single most valuable debugging command. The `--previous` flag retrieves logs from the container that just crashed, not the currently starting (or backing-off) one.

If logs are empty, the process crashed before writing anything. Check if the container image has a valid entrypoint:

```bash
kubectl run debug --image=<your-image> --restart=Never -it -- /bin/sh
# Manually run the entrypoint to see what happens
```

**Step 3: Check for resource limits**

```bash
kubectl get pod <name> -o yaml | grep -A10 resources
```

A container that is being OOMKilled will show exit code 137 and reason `OOMKilled`. Temporarily removing or increasing the memory limit to confirm is a valid diagnostic step.

**Step 4: Check environment and secrets**

Many crashes at startup are caused by missing environment variables, missing secrets, or misconfigured config files.

```bash
kubectl get pod <name> -o yaml | grep -A20 env
kubectl get pod <name> -o yaml | grep -A20 envFrom
kubectl get secret <secret-name> -n <namespace>
```

**Step 5: Use an ephemeral debug container (Kubernetes 1.23+)**

```bash
kubectl debug -it <pod-name> -n <namespace> \
  --image=busybox:latest \
  --target=<container-name>
```

This attaches a debug container to the pod's process namespace, allowing you to inspect the filesystem, environment, and running processes even when the main container is crashing.

**Step 6: Override the entrypoint to keep the container alive**

When you need the container to stay up for investigation:

```bash
kubectl run debug-app --image=<your-image> \
  --restart=Never \
  --command -- /bin/sh -c "sleep infinity"
kubectl exec -it debug-app -- /bin/sh
# Now run the actual entrypoint manually and observe
```

Or patch a deployment temporarily:

```bash
kubectl patch deployment my-app -p \
  '{"spec":{"template":{"spec":{"containers":[{"name":"my-app","command":["sleep","infinity"]}]}}}}'
```

**Step 7: Check for readiness/liveness probe misconfiguration**

```bash
kubectl get pod <name> -o yaml | grep -A15 livenessProbe
```

If the liveness probe is killing the container before it finishes starting, you will see short container lifetimes (the `Started/Finished` window in `describe`). The solution is to add or increase a `startupProbe`.

**Step 8: Check kubelet logs on the node**

For crashes that leave no application logs:

```bash
# Get the node where the pod runs
kubectl get pod <name> -o wide

# SSH to node and check kubelet logs
journalctl -u kubelet -n 200 --no-pager | grep <pod-name>

# Or check system-level OOM
dmesg | grep -i "out of memory"
dmesg | grep -i "oom_kill"
```

### Checklist Summary

- Inspect exit code — OOM, crash, or signal?
- Read `--previous` logs
- Check resource requests/limits
- Verify all ConfigMaps, Secrets, volumes exist
- Validate entrypoint runs correctly
- Check if liveness probe timeouts are too aggressive
- Review node-level events and conditions

---

## 5. What is kube-state-metrics?

**kube-state-metrics** (KSM) is a service that listens to the Kubernetes API server and generates metrics about the **state of Kubernetes objects** — not about resource usage, but about the logical state of the cluster as modeled by Kubernetes objects.

### What it exposes

Where `cAdvisor` tells you "this container is using 500MB of memory right now," `kube-state-metrics` tells you "this Deployment has 3 desired replicas and 2 available replicas." It exposes the `.spec` and `.status` fields of Kubernetes resources as Prometheus metrics.

Key metric families:

**Deployments**
```
kube_deployment_spec_replicas{deployment="my-app", namespace="production"} 3
kube_deployment_status_replicas_available{deployment="my-app", namespace="production"} 2
kube_deployment_status_replicas_unavailable{deployment="my-app", namespace="production"} 1
kube_deployment_metadata_generation{deployment="my-app", namespace="production"} 7
```

**Pods**
```
kube_pod_status_phase{pod="my-app-xxx", namespace="production", phase="Running"} 1
kube_pod_container_status_restarts_total{pod="my-app-xxx", container="my-app"} 5
kube_pod_container_status_ready{pod="my-app-xxx", container="my-app"} 0
kube_pod_container_resource_limits{resource="memory", unit="byte"} 536870912
kube_pod_container_resource_requests{resource="cpu", unit="core"} 0.5
```

**Nodes**
```
kube_node_status_condition{condition="Ready", status="true", node="worker-1"} 1
kube_node_spec_unschedulable{node="worker-1"} 0
kube_node_status_allocatable{resource="cpu", node="worker-1", unit="core"} 4
```

**Jobs and CronJobs**
```
kube_job_status_succeeded{job_name="backup-job", namespace="production"} 1
kube_job_status_failed{job_name="backup-job", namespace="production"} 0
kube_cronjob_next_schedule_time{cronjob="nightly-backup"} 1704067200
```

**StatefulSets, DaemonSets, HPA, PVCs**

KSM covers nearly all Kubernetes resource types: StatefulSets, DaemonSets, ReplicaSets, Services, Endpoints, Namespaces, LimitRanges, ResourceQuotas, PersistentVolumeClaims, Ingresses, and more.

### Architecture

KSM runs as a single Deployment with a single replica. It uses informers and shared caches to watch the API server, making it efficient. Because it uses informers (not polling), it reflects the current state of the cluster with very low latency.

```yaml
# Typical KSM deployment is included in kube-prometheus-stack
# Resource requests for a medium cluster (~50 nodes, ~500 pods):
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

For large clusters (1000+ pods), KSM memory usage grows substantially — it caches all object states in memory. Shard mode (available in newer KSM versions) can split responsibility across multiple instances.

### Essential Alert Rules Using KSM

```yaml
# Deployment has fewer replicas than desired
- alert: DeploymentReplicasMismatch
  expr: |
    kube_deployment_spec_replicas
      != kube_deployment_status_replicas_available
  for: 15m
  labels:
    severity: warning

# Pod has been in pending state for too long
- alert: PodNotScheduled
  expr: kube_pod_status_phase{phase="Pending"} == 1
  for: 30m
  labels:
    severity: warning

# Container restart rate high
- alert: HighRestartRate
  expr: |
    rate(kube_pod_container_status_restarts_total[15m]) * 60 > 1
  for: 5m
  labels:
    severity: critical

# PVC not bound
- alert: PVCNotBound
  expr: kube_persistentvolumeclaim_status_phase{phase!="Bound"} == 1
  for: 10m
  labels:
    severity: warning
```

### KSM vs cAdvisor vs metrics-server

| Source | What it measures | Use case |
|---|---|---|
| kube-state-metrics | Object state (desired vs actual) | Alerting on mismatches, configuration drift |
| cAdvisor (kubelet /metrics/cadvisor) | Container runtime metrics (CPU, memory, net, disk) | Resource utilization dashboards |
| metrics-server | Lightweight CPU/memory for HPA/VPA and `kubectl top` | Autoscaling, `kubectl top` only — not for alerting |
| node-exporter | Node OS/hardware metrics | Node-level health |

---

## 6. What metrics matter for nodes?

Nodes are the physical or virtual machines that host pods. Node health is foundational — a sick node can silently corrupt workloads by throttling CPU, evicting pods, or losing network connectivity.

### CPU Metrics

```
# CPU utilization (overall)
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# CPU steal time (relevant in virtualized environments — indicates noisy neighbor)
rate(node_cpu_seconds_total{mode="steal"}[5m]) * 100

# CPU iowait (high iowait indicates storage bottleneck)
rate(node_cpu_seconds_total{mode="iowait"}[5m]) * 100

# Load average (should stay below number of CPUs)
node_load1   # 1-minute load average
node_load5   # 5-minute
node_load15  # 15-minute
```

CPU steal time > 5% on a cloud VM is a major signal — the hypervisor is not delivering CPU cycles reliably, causing probe timeouts and application latency spikes.

### Memory Metrics

```
# Available memory
node_memory_MemAvailable_bytes

# Memory utilization
(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100

# Swap usage (non-zero swap is a strong signal of memory pressure)
node_memory_SwapTotal_bytes - node_memory_SwapFree_bytes

# OOM events
node_vmstat_oom_kill

# Page faults (major faults indicate swapping)
rate(node_vmstat_pgmajfault[5m])
```

Kubernetes recommends disabling swap on nodes (historically required, though newer versions offer more flexibility). Swap on Kubernetes nodes can cause unpredictable latency because the kubelet and scheduler assume memory constraints are enforced hard limits.

### Disk Metrics

```
# Disk space utilization per mount
(1 - node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100

# inode usage (can run out before disk space runs out!)
(1 - node_filesystem_files_free / node_filesystem_files) * 100

# Disk I/O utilization
rate(node_disk_io_time_seconds_total[5m]) * 100

# Disk read/write throughput
rate(node_disk_read_bytes_total[5m])
rate(node_disk_written_bytes_total[5m])

# Disk saturation (avg queue length)
rate(node_disk_io_time_weighted_seconds_total[5m])
```

Inode exhaustion is a classic Kubernetes gotcha. Container image layers, small log files, and temporary files can exhaust inodes even when disk space usage is low. Always alert on both.

### Network Metrics

```
# Network throughput per interface
rate(node_network_receive_bytes_total{device!="lo"}[5m])
rate(node_network_transmit_bytes_total{device!="lo"}[5m])

# Packet drops (critical for cluster networking)
rate(node_network_receive_drop_total[5m])
rate(node_network_transmit_drop_total[5m])

# Packet errors
rate(node_network_receive_errs_total[5m])
rate(node_network_transmit_errs_total[5m])

# TCP retransmissions
rate(node_netstat_Tcp_RetransSegs[5m])

# TCP connection states
node_sockstat_TCP_inuse
node_sockstat_TCP_tw  # TIME_WAIT connections
```

Packet drops are particularly important in Kubernetes. CNI plugin issues, conntrack table overflow, or NIC ring buffer exhaustion all manifest as packet drops, causing mysterious application timeouts.

### kubelet and System Metrics

```
# Kubelet running pods
kubelet_running_pods

# Kubelet running containers
kubelet_running_containers

# Pod start duration
kubelet_pod_start_duration_seconds

# Volume mount errors
kubelet_volume_stats_available_bytes
storage_operation_duration_seconds
```

### Node Conditions (from kube-state-metrics)

```
kube_node_status_condition{condition="MemoryPressure", status="true"}
kube_node_status_condition{condition="DiskPressure", status="true"}
kube_node_status_condition{condition="PIDPressure", status="true"}
kube_node_status_condition{condition="NetworkUnavailable", status="true"}
kube_node_status_condition{condition="Ready", status="false"}
```

When `MemoryPressure` is true, the kubelet begins evicting pods. When `DiskPressure` is true, it evicts pods and prevents new scheduling. Proactive alerting at 80% thresholds prevents these conditions from being reached.

### PID Exhaustion

Often overlooked, PID exhaustion (`PIDPressure`) can bring down a node. Each container spawns processes; a fork bomb or excessive thread creation can exhaust the kernel PID limit.

```
# Alert at 80% PID usage
(node_processes_max - node_processes_pids) / node_processes_max < 0.2
```

### Recommended Alert Thresholds

| Metric | Warning | Critical |
|---|---|---|
| CPU utilization | > 80% for 15m | > 95% for 5m |
| Memory utilization | > 85% for 15m | > 95% for 5m |
| Disk space | > 80% | > 90% |
| Inode usage | > 80% | > 90% |
| Disk I/O utilization | > 80% for 5m | > 95% for 2m |
| Network packet drop rate | > 0.1% | > 1% |
| Load average / CPU count | > 1.5 | > 3.0 |

---

## 7. How do you monitor ingress traffic?

Ingress controllers are the entry point for all HTTP/HTTPS traffic into a cluster. They are a critical observation point because they see every request and can expose rich telemetry about latency, error rates, and traffic distribution.

### NGINX Ingress Controller Metrics

The most widely used ingress controller. It exposes a Prometheus metrics endpoint at port 10254 by default.

Key metrics:

```
# Request rate
rate(nginx_ingress_controller_requests[5m])

# Request duration (latency) by status code, ingress, service
histogram_quantile(0.99,
  sum(rate(nginx_ingress_controller_request_duration_seconds_bucket[5m]))
  by (le, ingress, namespace, service)
)

# Error rate (4xx + 5xx)
rate(nginx_ingress_controller_requests{status=~"[45].."}[5m])
  / rate(nginx_ingress_controller_requests[5m])

# Request size and response size
nginx_ingress_controller_request_size_sum
nginx_ingress_controller_response_size_sum

# Upstream response time (time spent in backend service)
histogram_quantile(0.95,
  rate(nginx_ingress_controller_response_duration_seconds_bucket[5m])
)

# Connection count
nginx_ingress_controller_nginx_process_connections{state="active"}

# SSL certificate expiry (critical for proactive renewal)
nginx_ingress_controller_ssl_expire_time_seconds
```

**SSL Certificate Expiry Alert:**
```yaml
- alert: SSLCertificateExpirationWarning
  expr: |
    nginx_ingress_controller_ssl_expire_time_seconds
    - time() < 30 * 24 * 3600
  labels:
    severity: warning
  annotations:
    summary: "SSL certificate expires in less than 30 days"
```

### Ingress-Level Four Golden Signals

```yaml
# Request rate per service
sum(rate(nginx_ingress_controller_requests[5m])) by (ingress, service, namespace)

# Error rate per service
sum(rate(nginx_ingress_controller_requests{status=~"5.."}[5m])) by (ingress, service)
  /
sum(rate(nginx_ingress_controller_requests[5m])) by (ingress, service)

# p99 latency per service
histogram_quantile(0.99,
  sum(rate(nginx_ingress_controller_request_duration_seconds_bucket[5m]))
  by (le, ingress, service)
)

# Active connections (saturation proxy)
nginx_ingress_controller_nginx_process_connections{state="active"}
```

### Access Log Correlation

NGINX Ingress logs each request. Shipping these logs to a log aggregation system (Loki, Elasticsearch, Datadog) enables:

- Full request tracing by `trace-id` header
- Investigation of slow or erroring requests by path
- Client IP analysis for security
- Bot detection via User-Agent filtering

Enable JSON log format for easier parsing:

```yaml
# nginx-ingress ConfigMap
data:
  log-format-upstream: >
    {"time":"$time_iso8601","remote_addr":"$remote_addr",
    "request_id":"$req_id","method":"$request_method",
    "uri":"$request_uri","status":"$status",
    "request_time":"$request_time","upstream_time":"$upstream_response_time",
    "ingress":"$ingress_name","service":"$service_name"}
```

### Load Balancer and DNS Monitoring

At the cloud layer, the LoadBalancer service in front of the ingress needs monitoring:

- ELB/ALB healthy target count (AWS)
- Backend latency from cloud LB perspective
- LB error rates (502, 503 from cloud LB vs 5xx from upstream)
- DNS TTL and resolution latency (for split-horizon or external-dns setups)

### Monitoring Traffic Distribution

For A/B testing, canary deployments, or traffic splitting:

```
# Traffic split validation (if using canary annotations or service mesh)
sum(rate(nginx_ingress_controller_requests[5m])) by (service)
# Verify canary receives expected % of traffic
```

---

## 8. How do you monitor container resource usage?

Container resource monitoring provides visibility into what each container actually consumes versus what was requested or limited. The primary source is **cAdvisor**, which is embedded in the kubelet and exposes metrics at `/metrics/cadvisor`.

### CPU Metrics

```
# CPU usage rate per container (cores)
rate(container_cpu_usage_seconds_total{container!=""}[5m])

# CPU throttling — time the container was throttled (critical)
rate(container_cpu_cfs_throttled_seconds_total{container!=""}[5m])

# CPU throttle ratio — % of scheduling periods where throttling occurred
rate(container_cpu_cfs_throttled_periods_total{container!=""}[5m])
  /
rate(container_cpu_cfs_periods_total{container!=""}[5m])

# CPU usage vs limit (saturation ratio)
rate(container_cpu_usage_seconds_total{container!=""}[5m])
  /
on(pod, container, namespace)
  kube_pod_container_resource_limits{resource="cpu"}
```

**CPU throttling** is one of the most insidious Kubernetes issues. A container can be using only 10% CPU on average but still be heavily throttled because it has bursty behavior and a low CPU limit. Throttling does not cause OOMKilled — it causes latency spikes and probe timeouts. Many teams are surprised to find their p99 latency problems are caused by CPU throttling, not memory.

### Memory Metrics

```
# Working set memory (what the OOM killer uses — excludes page cache)
container_memory_working_set_bytes{container!=""}

# RSS (resident set size — process memory in RAM)
container_memory_rss{container!=""}

# Cache (page cache — can be reclaimed by OS under pressure)
container_memory_cache{container!=""}

# Memory usage vs limit
container_memory_working_set_bytes{container!=""}
  /
on(pod, container, namespace)
  kube_pod_container_resource_limits{resource="memory"}

# Memory usage vs request
container_memory_working_set_bytes{container!=""}
  /
on(pod, container, namespace)
  kube_pod_container_resource_requests{resource="memory"}
```

Use `container_memory_working_set_bytes` (not `container_memory_usage_bytes`) for memory alerting because the OOM killer uses working set. `usage_bytes` includes page cache which is reclaimable and will not trigger OOM.

### Network Metrics per Container/Pod

```
# Network bytes received per pod
rate(container_network_receive_bytes_total{container!=""}[5m])

# Network bytes transmitted per pod
rate(container_network_transmit_bytes_total{container!=""}[5m])

# Network errors
rate(container_network_receive_errors_total[5m])
rate(container_network_transmit_errors_total[5m])

# Dropped packets
rate(container_network_receive_packets_dropped_total[5m])
rate(container_network_transmit_packets_dropped_total[5m])
```

### Storage (Filesystem) Metrics

```
# Filesystem reads per container
rate(container_fs_reads_bytes_total{container!=""}[5m])

# Filesystem writes per container
rate(container_fs_writes_bytes_total{container!=""}[5m])

# Filesystem usage (overlayfs root filesystem)
container_fs_usage_bytes{container!=""}

# Ephemeral storage usage (important for log rotation)
container_ephemeral_storage_used_bytes
```

### Right-Sizing Containers

Using resource usage metrics to right-size requests and limits:

```
# CPU request recommendation: p99 of usage over 7 days
quantile_over_time(0.99,
  rate(container_cpu_usage_seconds_total[5m])[7d:5m]
)

# Memory limit recommendation: max + 20% headroom
max_over_time(container_memory_working_set_bytes[7d]) * 1.2
```

The **Vertical Pod Autoscaler (VPA)** automates this process and can run in recommendation mode (no mutations) to suggest right-sized resource values without changing anything.

### Resource Efficiency Metrics

```
# CPU efficiency = usage / request (should be near 1.0)
rate(container_cpu_usage_seconds_total[5m])
  /
kube_pod_container_resource_requests{resource="cpu"}

# Memory efficiency = usage / request
container_memory_working_set_bytes
  /
kube_pod_container_resource_requests{resource="memory"}
```

Low efficiency (< 0.2) indicates over-provisioned requests, which wastes cluster capacity and reduces scheduling density. High efficiency (> 0.9) indicates under-provisioned requests, which can cause eviction and scheduling failures.

---

## 9. What causes OOMKilled errors?

OOMKilled (Out of Memory Killed) occurs when a container's memory usage reaches its configured limit and the Linux kernel's OOM killer terminates the process. This is one of the most frequent and disruptive container failures in production.

### The Mechanics

Linux cgroups enforce memory limits on containers. When `container_memory_working_set_bytes` reaches the `resources.limits.memory` value, the kernel sends SIGKILL (signal 9) to the process. There is no warning, no graceful shutdown — the process is immediately terminated. The exit code is 137.

```
kubectl describe pod <name>
# Containers:
#   my-app:
#     Last State:     Terminated
#       Reason:       OOMKilled
#       Exit Code:    137
```

### Common Root Causes

**1. Memory limit set too low**

The most common cause. The limit was estimated (or guessed) and does not reflect actual runtime behavior. JVM applications, in particular, use memory for the heap, metaspace, native memory, and JVM overhead. Setting only the heap size via `-Xmx` does not bound total JVM memory usage — native memory and thread stacks are additional.

JVM total memory ≈ `-Xmx` + `-XX:MaxMetaspaceSize` + thread stacks (N × ~512KB) + JVM overhead (~200MB)

**2. Memory leak in application**

The application gradually increases memory consumption over hours or days until hitting the limit. This is identifiable by a steadily rising slope in `container_memory_working_set_bytes`:

```
# Alert for memory leak pattern: 90%+ of limit sustained
container_memory_working_set_bytes
  /
on(pod, container, namespace) kube_pod_container_resource_limits{resource="memory"}
> 0.9
```

**3. Sudden traffic spike or large workload**

Processing a large batch job, an unexpected traffic spike causing excessive in-memory caching, or loading a large dataset can cause transient memory peaks.

**4. Memory fragmentation**

Applications using memory allocators (especially in C/C++) can have high VSZ (virtual memory) but their actual RSS is much lower. However, Go, Java, and Python all have their own allocator behaviors that can cause fragmentation.

**5. Page cache exhaustion**

Under some conditions, the kernel cannot reclaim page cache fast enough. The OOM killer may fire even though `container_memory_usage_bytes` appears to have headroom, because what matters is `working_set_bytes` (which excludes page cache that has already been evicted).

**6. Sidecar containers consuming shared memory**

In pods with sidecar containers (e.g., a service mesh proxy like Envoy/Istio), the sidecar also consumes memory. If you size the main container correctly but forget the sidecar overhead, the node-level memory pressure from all containers in the pod contributes to OOM risk.

**7. tmpfs mounts and /dev/shm usage**

`emptyDir` volumes with `medium: Memory` are backed by tmpfs and count against the container's memory limit. Applications that use `/dev/shm` for inter-process communication can quietly consume large amounts of memory this way.

### Detection and Prevention

```bash
# Check OOM kills on a node (dmesg)
dmesg | grep -i "out of memory"
dmesg | grep -i "oom_kill"

# Node-level OOM kill metric
node_vmstat_oom_kill

# Container memory growth rate (leak detection)
deriv(container_memory_working_set_bytes[1h])
```

**Preventive measures:**

- Set requests equal to average usage, limits at 1.5–2× requests for headroom
- Use VPA in recommendation mode to gather right-sizing data over time
- For JVMs, use `-XX:+UseContainerSupport` (Java 10+) so the JVM respects cgroup memory limits
- Set `-XX:MaxRAMPercentage=75` rather than absolute `-Xmx` so limits scale with the container
- Add memory leak detection dashboards with retention of 7–30 day trends
- Implement circuit breakers and back-pressure in applications to shed load before OOM

---

## 10. How do you observe autoscaling behavior?

Kubernetes has three autoscaling dimensions: Horizontal Pod Autoscaler (HPA), Vertical Pod Autoscaler (VPA), and Cluster Autoscaler (CA). Each requires different observability approaches.

### Horizontal Pod Autoscaler (HPA)

The HPA scales the number of pod replicas based on metrics (CPU, memory, or custom metrics).

```bash
# View HPA status
kubectl get hpa -n production

# NAME       REFERENCE         TARGETS         MINPODS  MAXPODS  REPLICAS
# my-app     Deployment/my-app 72%/60%         2        20       5
```

**Key HPA Metrics:**

```
# Current metric value vs target
kube_horizontalpodautoscaler_status_current_replicas
kube_horizontalpodautoscaler_spec_max_replicas
kube_horizontalpodautoscaler_spec_min_replicas
kube_horizontalpodautoscaler_status_desired_replicas

# HPA conditions (from kube-state-metrics)
kube_horizontalpodautoscaler_status_condition{
  condition="AbleToScale", status="true"
}
kube_horizontalpodautoscaler_status_condition{
  condition="ScalingLimited", status="true"
  # means replicas are at max limit — may need to increase maxReplicas
}
```

**Detecting HPA problems:**

The HPA scale-up is limited by the rate at which new pods become ready. If `AbleToScale` is false, it means the HPA cannot scale for a reason (e.g., the Deployment is being updated, or there are API errors fetching metrics).

```
# Alert: HPA at max replicas for extended period (maxReplicas too low)
kube_horizontalpodautoscaler_status_current_replicas
  ==
kube_horizontalpodautoscaler_spec_max_replicas
```

**Scale event timeline:**

HPA decisions show up in Kubernetes events:

```bash
kubectl describe hpa my-app -n production
# Events:
#   Normal   SuccessfulRescale  2m    horizontal-pod-autoscaler
#            New size: 8; reason: cpu resource utilization (percentage of request)
#            above target
```

### Custom Metrics and KEDA

When scaling on CPU/memory alone is insufficient, custom metrics (from Prometheus, SQS queue depth, Kafka consumer lag, etc.) via KEDA (Kubernetes Event-Driven Autoscaling) or the Custom Metrics API provide richer scaling signals.

KEDA exposes its own metrics:

```
keda_scaler_metrics_value             -- current metric value
keda_scaler_metrics_latency           -- time to fetch metric from source
keda_scaler_active                    -- whether the scaler is active
keda_scaled_object_errors             -- errors in metric retrieval
```

**Queue-depth-based scaling observation:**

```
# SQS queue depth vs pod count
aws_sqs_approximate_number_of_messages_visible
  vs
kube_deployment_status_replicas_available
```

### Cluster Autoscaler

The Cluster Autoscaler adds or removes nodes when pods cannot be scheduled (scale-up) or nodes are underutilized (scale-down).

```
# Pending pods waiting for nodes
kube_pod_status_phase{phase="Pending"}

# Cluster Autoscaler specific metrics
cluster_autoscaler_nodes_count
cluster_autoscaler_unschedulable_pods_count
cluster_autoscaler_last_activity  # timestamp of last scale event
cluster_autoscaler_scaled_up_nodes_total
cluster_autoscaler_scaled_down_nodes_total
cluster_autoscaler_errors_total

# Node group size
cluster_autoscaler_nodes_count by (node_group)
```

**Cluster Autoscaler failure modes:**

- **Scale-up blocked by quota:** AWS, GCP, or Azure account limits prevent new instance provisioning
- **Scale-up blocked by taints/tolerations:** Pending pods cannot tolerate available node group taints
- **Scale-down blocked by PodDisruptionBudgets:** PDB prevents node drain
- **Scale-down blocked by local storage:** Pods using `emptyDir` with data cannot be safely evicted

```bash
# Check why a pod is pending (scheduling failure reason)
kubectl describe pod <pending-pod> | grep -A20 Events

# Check cluster autoscaler logs
kubectl logs -l app=cluster-autoscaler -n kube-system --tail=100
```

### VPA Recommendations

```
# VPA recommendation metrics
kube_verticalpodautoscaler_status_recommendation_containerrecommendations_target
kube_verticalpodautoscaler_status_recommendation_containerrecommendations_lowerbound
kube_verticalpodautoscaler_status_recommendation_containerrecommendations_upperbound
```

Build a dashboard showing actual resource usage vs VPA recommendations vs current requests/limits. This is the feedback loop for right-sizing.

---

## 11. How do you monitor service mesh traffic?

Service meshes (Istio, Linkerd, Cilium Service Mesh) inject a sidecar proxy into each pod, giving them visibility into all intra-cluster service-to-service communication. This is fundamentally different from monitoring ingress traffic — service meshes monitor the **east-west** traffic within the cluster.

### Istio Observability

Istio's Envoy sidecar proxies emit rich telemetry automatically without any application code changes.

**The Istio metrics set:**

```
# Request volume
istio_requests_total{
  source_workload, destination_workload,
  destination_service_name, destination_service_namespace,
  response_code, reporter
}

# Request duration (latency distribution)
istio_request_duration_milliseconds_bucket

# Request/response size
istio_request_bytes_bucket
istio_response_bytes_bucket

# TCP connections (for non-HTTP protocols)
istio_tcp_connections_opened_total
istio_tcp_connections_closed_total
istio_tcp_sent_bytes_total
istio_tcp_received_bytes_total
```

**Golden signals per service pair:**

```
# Error rate between service A and service B
sum(rate(istio_requests_total{
  source_workload="service-a",
  destination_workload="service-b",
  response_code=~"5.."
}[5m]))
/
sum(rate(istio_requests_total{
  source_workload="service-a",
  destination_workload="service-b"
}[5m]))

# p99 latency
histogram_quantile(0.99,
  sum(rate(istio_request_duration_milliseconds_bucket{
    destination_workload="service-b"
  }[5m]))
  by (le)
) / 1000  # convert ms to seconds
```

### mTLS and Security Metrics

Service meshes enforce mutual TLS between services, which provides both encryption and identity verification. Monitor for security posture:

```
# Connections NOT using mTLS (should be zero in enforced mode)
istio_requests_total{connection_security_policy="none"}

# Policy check failures (AuthorizationPolicy violations)
envoy_http_downstream_rq_total{response_code="403"}
```

### Linkerd Observability

Linkerd's proxy (written in Rust, lighter than Envoy) emits similar metrics:

```
request_total
response_total{classification="success"}
response_total{classification="failure"}
response_latency_ms_bucket
route_request_total
```

Linkerd's CLI provides instant golden signal access:

```bash
linkerd viz stat deployment -n production
linkerd viz routes deploy/my-service -n production
linkerd viz tap deployment/my-service -n production
```

### Service Dependency Mapping

One of the most powerful features of service mesh observability is automatic service topology mapping. Tools like Kiali (for Istio) and Linkerd's viz dashboard render the service graph with error rates and latency on each edge.

```bash
# Install Kiali for Istio topology visualization
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
```

### Envoy Admin Metrics (raw)

Each Envoy sidecar exposes an admin port (15000) with extremely detailed metrics:

```
# Upstream (outbound) connection pool exhaustion
envoy_cluster_upstream_cx_pool_overflow

# Circuit breaker trips
envoy_cluster_upstream_rq_pending_overflow  # pending queue overflow
envoy_cluster_upstream_rq_retry             # retries happening
envoy_cluster_upstream_rq_retry_overflow    # retry budget exhausted

# Health check failures for upstreams
envoy_cluster_health_check_failure

# Outlier detection (automatic unhealthy host ejection)
envoy_cluster_outlier_detection_ejections_active
envoy_cluster_outlier_detection_ejections_total
```

Envoy circuit breaker and outlier detection metrics reveal whether failure isolation is working correctly — a service mesh is not just for observability but for resilience.

---

## 12. What is distributed observability in Kubernetes?

Distributed observability is the practice of achieving comprehensive understanding of system behavior across multiple loosely coupled services, nodes, pods, and cloud resources. In Kubernetes, where a single user request may traverse dozens of microservices across multiple nodes, traditional single-process debugging tools are insufficient.

### The Three Pillars

**1. Metrics** — numeric measurements over time (Prometheus, CloudWatch, Datadog)

**2. Logs** — discrete events with context (Loki, Elasticsearch, Splunk)

**3. Traces** — causal records of request execution across services (Jaeger, Zipkin, Tempo, OTLP)

The modern addition is **Events** (Kubernetes events) as a fourth pillar and **Profiling** as a fifth (continuous profiling with Parca, Pyroscope).

### Correlation — The Key Challenge

The value of distributed observability comes from correlating these signals. Without correlation, you have isolated signals. With correlation, you can:

- See a Prometheus alert → link to relevant logs → link to the trace of a failing request → link to a CPU flame graph showing where time was spent
- Jump from a single failing trace to the metric trend that shows it's systemic vs isolated

This correlation is done through **context propagation**: trace IDs, span IDs, and baggage attached to every request. The W3C TraceContext standard and OpenTelemetry provide the interoperability layer.

### OpenTelemetry (OTel)

OpenTelemetry is the CNCF standard for vendor-neutral instrumentation. The OTel Collector acts as a telemetry pipeline inside Kubernetes:

```yaml
# OpenTelemetry Collector deployment
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector
spec:
  config: |
    receivers:
      otlp:
        protocols:
          grpc:
          http:
      prometheus:
        config:
          scrape_configs:
            - job_name: 'kubernetes-pods'
              kubernetes_sd_configs:
                - role: pod

    processors:
      batch:
      memory_limiter:
        limit_mib: 512
      k8sattributes:          # Enriches telemetry with K8s metadata
        auth_type: serviceAccount
        passthrough: false
        extract:
          metadata:
            - k8s.namespace.name
            - k8s.deployment.name
            - k8s.pod.name
            - k8s.node.name

    exporters:
      otlp:
        endpoint: jaeger-collector:4317
      prometheusremotewrite:
        endpoint: http://prometheus:9090/api/v1/write
      loki:
        endpoint: http://loki:3100/loki/api/v1/push

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, k8sattributes, batch]
          exporters: [otlp]
        metrics:
          receivers: [prometheus]
          processors: [batch]
          exporters: [prometheusremotewrite]
```

### The Kubernetes Metadata Enrichment Problem

Every telemetry signal emitted from within a pod needs to be enriched with Kubernetes metadata: namespace, pod name, deployment name, node name, labels. Without this enrichment, a trace from a microservice is just a trace — you cannot correlate it back to the specific pod revision, deployment version, or replica that generated it.

OTel's `k8sattributes` processor, Fluent Bit's Kubernetes filter, and Vector's Kubernetes metadata transform all serve this purpose.

### Exemplars: Bridging Metrics and Traces

Prometheus 2.35+ supports exemplars — trace ID references embedded in metric samples. This allows jumping directly from a metric data point to the specific trace that caused a spike:

```
# A histogram sample with an exemplar
http_request_duration_seconds_bucket{le="0.5"} 1234 # {trace_id="abc123"} 0.35
```

Grafana can visualize exemplars on metric graphs, letting you click a latency spike and immediately view the trace.

---

## 13. How do you collect logs from containers?

Kubernetes log collection is a fundamental operational requirement. Container logs are ephemeral — they disappear when the pod is deleted. Every production cluster needs a centralized log aggregation pipeline.

### How Kubernetes Handles Logs Natively

When a container writes to stdout/stderr, the container runtime (containerd, CRI-O) captures that output and writes it to a log file on the node at:

```
/var/log/pods/<namespace>_<pod-name>_<uid>/<container-name>/<restart-count>.log
/var/log/containers/<pod-name>_<namespace>_<container>-<container-id>.log  # symlink
```

The kubelet manages log rotation. `kubectl logs` reads from these files via the kubelet API.

### Log Collection Architectures

**DaemonSet-based collection (primary approach)**

A log collection agent runs on every node as a DaemonSet. It reads log files from the node's filesystem, enriches them with Kubernetes metadata, and ships them to a backend.

Common agents: Fluent Bit (lightweight, C-based), Fluentd (full-featured, Ruby-based), Promtail (for Loki), Vector (Rust-based, modern).

```yaml
# Fluent Bit DaemonSet — minimal example
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: logging
spec:
  selector:
    matchLabels:
      app: fluent-bit
  template:
    spec:
      serviceAccountName: fluent-bit
      containers:
        - name: fluent-bit
          image: fluent/fluent-bit:2.2
          volumeMounts:
            - name: varlog
              mountPath: /var/log
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
            - name: config
              mountPath: /fluent-bit/etc
      volumes:
        - name: varlog
          hostPath:
            path: /var/log
        - name: varlibdockercontainers
          hostPath:
            path: /var/lib/docker/containers
        - name: config
          configMap:
            name: fluent-bit-config
```

Fluent Bit ConfigMap with Kubernetes metadata enrichment:

```
[INPUT]
    Name              tail
    Path              /var/log/containers/*.log
    multiline.parser  docker, cri
    Tag               kube.*
    Mem_Buf_Limit     50MB

[FILTER]
    Name                kubernetes
    Match               kube.*
    Kube_URL            https://kubernetes.default.svc:443
    Kube_CA_File        /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    Kube_Token_File     /var/run/secrets/kubernetes.io/serviceaccount/token
    Merge_Log           On
    K8S-Logging.Parser  On
    K8S-Logging.Exclude On

[OUTPUT]
    Name  loki
    Match kube.*
    Host  loki.monitoring.svc.cluster.local
    Port  3100
    Labels job=fluentbit, namespace=$kubernetes['namespace_name'], pod=$kubernetes['pod_name']
```

**Sidecar-based collection**

Covered in detail in [Section 14](#14-sidecar-logging-vs-daemonset-logging).

### Structured Logging

Always emit logs as JSON in containers. Human-readable log formats are nearly impossible to parse reliably at scale.

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "ERROR",
  "service": "payment-service",
  "trace_id": "abc123def456",
  "span_id": "789xyz",
  "user_id": "usr_12345",
  "message": "Payment processing failed",
  "error": "connection refused",
  "upstream": "payment-gateway",
  "duration_ms": 3001
}
```

Including `trace_id` and `span_id` in every log line is the foundation of correlated observability.

### Log Backends

- **Grafana Loki** — label-based log aggregation, Prometheus-like query language (LogQL), cost-effective (only indexes labels, not full text)
- **Elasticsearch + Kibana** — full-text search, powerful but operationally complex and expensive at scale
- **Datadog Logs** — managed, integrates with metrics and traces natively
- **Google Cloud Logging / AWS CloudWatch Logs** — cloud-native, integrates with cluster audit logs

---

## 14. Sidecar logging vs DaemonSet logging?

These are the two primary architectures for getting logs out of containers. Each has meaningful trade-offs.

### DaemonSet Logging

A single log agent pod runs on each node and collects logs from all containers by reading node-level log files.

**Architecture:**
```
Node
├── Pod A (container writes to stdout → /var/log/containers/A.log)
├── Pod B (container writes to stdout → /var/log/containers/B.log)
├── Pod C (container writes to stdout → /var/log/containers/C.log)
└── Fluent Bit DaemonSet
    └── Reads all *.log files → enriches with K8s metadata → ships to Loki/ES
```

**Advantages:**
- **Low overhead:** One agent per node serves all pods, regardless of pod count
- **No application changes:** Works for any container that writes to stdout/stderr
- **Centrally managed:** A single DaemonSet configuration covers the entire cluster
- **Pod-lifecycle-independent:** Logs persist on the node even after the pod exits (until log rotation)
- **No sidecar resource cost:** Does not add CPU/memory requests to every pod

**Disadvantages:**
- **No access to log files inside containers:** Only captures stdout/stderr, not files written inside the container's filesystem
- **Shared resource contention:** One log agent handles all pods' logs; a particularly chatty pod can cause backpressure for all pods on that node
- **Less per-service configuration flexibility:** Changing parsing, tagging, or routing for one service requires conditional logic in the shared config
- **Node-level failure blast radius:** If the DaemonSet pod on a node crashes, all log shipping for that node stops

**Best for:** Most clusters, most applications, especially when all services write structured JSON to stdout.

### Sidecar Logging

A dedicated log-shipping container runs alongside each application container within the same pod, sharing a volume.

**Architecture:**
```
Pod
├── app-container
│   └── Writes logs to /var/log/app/*.log (shared emptyDir volume)
└── fluent-bit-sidecar
    └── Reads /var/log/app/*.log → processes → ships to backend
```

Or the streaming sidecar variant — the sidecar tails log files and re-emits them to stdout/stderr, then the DaemonSet collects them:

```
Pod
├── app-container
│   └── Writes to /var/log/app/*.log
└── sidecar-streamer
    └── Reads /var/log/app/*.log → writes to own stdout → DaemonSet collects
```

**Advantages:**
- **File-based log collection:** Handles applications that write to files (legacy apps, apps that cannot be modified to write to stdout)
- **Per-service configuration:** Each pod's sidecar can have completely custom parsing, filtering, and routing
- **Isolation:** One service's logging cannot affect another service's log shipping
- **Multi-stream logging:** Different log streams (access log, error log, audit log) can be independently routed

**Disadvantages:**
- **Resource overhead:** Every pod needs an additional container. At 50 pods per node with a 50m CPU / 64Mi sidecar, that's 2.5 CPU cores and 3.2GB RAM consumed just for log shipping
- **Operational complexity:** Every Deployment template must include the sidecar definition; sidecars must be updated across all pods during upgrades
- **Volume coordination:** Requires `emptyDir` shared volumes and proper log rotation configuration to prevent disk exhaustion
- **`kubectl logs` fragmentation:** Logs are split across containers; `kubectl logs pod -c sidecar` vs `kubectl logs pod -c app` requires explicit container selection

**Best for:** Legacy applications that write to files, applications with complex multi-stream logging requirements, or highly sensitive services that need isolated log routing.

### Hybrid Architecture

Many production clusters use both:

```
DaemonSet agent  →  collects stdout/stderr from all pods
Sidecar agents   →  handle specific pods that write to files or need custom routing
```

A common pattern: use Fluent Bit as the DaemonSet agent for stdout collection, and Fluent Bit sidecars only for the handful of legacy applications that write to files.

### Decision Matrix

| Criterion | DaemonSet | Sidecar |
|---|---|---|
| App writes to stdout | ✅ Ideal | Works (redundant) |
| App writes to files | ❌ Cannot access | ✅ Required |
| Resource efficiency | ✅ Shared agent | ❌ Per-pod overhead |
| Configuration isolation | ❌ Shared config | ✅ Per-pod config |
| Operational simplicity | ✅ One DaemonSet | ❌ Per-pod management |
| Pod volume requirements | None | emptyDir required |
| Cluster scale sensitivity | Scales well | Overhead multiplies with pods |

---

## 15. How do you trace requests across Kubernetes services?

Distributed tracing reconstructs the full causal chain of a request as it flows through multiple services. In a Kubernetes microservices architecture, a single user request might traverse an API gateway, an authentication service, a business logic service, a database proxy, and a notification service — tracing makes this visible as a single coherent timeline.

### How Distributed Tracing Works

**Trace:** A tree of spans representing a single end-to-end operation.

**Span:** A single unit of work: "service A called service B, which took 45ms."

Each span carries:
- `trace_id` — unique identifier for the entire trace
- `span_id` — identifier for this specific span
- `parent_span_id` — which span triggered this one
- `start_time`, `duration`
- `service_name`, `operation_name`
- Tags (key-value metadata)
- Logs (timestamped events within the span)
- Status (OK, ERROR)

### Context Propagation

For a trace to flow across service boundaries, the trace context must be propagated in requests. The W3C TraceContext standard defines the `traceparent` HTTP header:

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

This header is passed from service A to service B in every HTTP call. Service B creates a child span with `parent_span_id` pointing to service A's span. gRPC uses metadata; Kafka and other messaging systems use message headers.

### OpenTelemetry Auto-Instrumentation

OTel provides auto-instrumentation agents that inject tracing into popular frameworks without code changes:

```yaml
# OTel Java auto-instrumentation via initContainer and Java agent
spec:
  initContainers:
    - name: otel-agent
      image: ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:latest
      command: ["cp", "/javaagent.jar", "/otel/javaagent.jar"]
      volumeMounts:
        - name: otel-agent
          mountPath: /otel
  containers:
    - name: my-java-app
      env:
        - name: JAVA_TOOL_OPTIONS
          value: "-javaagent:/otel/javaagent.jar"
        - name: OTEL_SERVICE_NAME
          value: "my-java-app"
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://otel-collector:4317"
      volumeMounts:
        - name: otel-agent
          mountPath: /otel
```

The **OpenTelemetry Operator** automates this with the `Instrumentation` CRD:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: my-instrumentation
  namespace: production
spec:
  exporter:
    endpoint: http://otel-collector:4317
  propagators:
    - tracecontext
    - baggage
    - b3  # for services that use B3 propagation (Zipkin-compatible)
  sampler:
    type: parentbased_traceidratio
    argument: "0.1"  # 10% sampling rate for high-traffic services
  java:
    image: ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:latest
  python:
    image: ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:latest
  nodejs:
    image: ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-nodejs:latest
```

### Sampling Strategies

At high request rates, recording every trace is cost-prohibitive. Sampling strategies:

**Head-based sampling (decision at trace start):**
- `TraceIDRatioSampler` — sample N% of all traces randomly
- `ParentBasedSampler` — respect the sampling decision from the upstream service

**Tail-based sampling (decision after trace completes):**
The OTel Collector's tail sampling processor collects all spans for a trace and then makes a sampling decision based on the full trace characteristics:

```yaml
processors:
  tail_sampling:
    decision_wait: 10s
    policies:
      - name: errors-policy
        type: status_code
        status_code: {status_codes: [ERROR]}
        # Always sample error traces
      - name: slow-traces-policy
        type: latency
        latency: {threshold_ms: 1000}
        # Always sample traces > 1 second
      - name: random-policy
        type: probabilistic
        probabilistic: {sampling_percentage: 5}
        # 5% random sampling for normal traces
```

### Trace Backends

- **Jaeger** — CNCF project, feature-rich, good for high-cardinality trace search
- **Grafana Tempo** — integrates natively with Grafana/Loki/Prometheus, very cost-efficient (uses object storage)
- **Zipkin** — older, simpler, widely compatible
- **Datadog APM, Honeycomb, Lightstep** — managed options with advanced analytics

### Service Map from Traces

Trace backends can automatically generate service dependency maps by analyzing `source_service → destination_service` relationships in spans. This gives you a real-time, data-driven service topology map, unlike static architectural diagrams which become stale.

---

## 16. Challenges with ephemeral containers?

Ephemeral containers (GA in Kubernetes 1.25) are a debugging feature that allows attaching a temporary container to a running pod without modifying its spec. They solve a critical observability problem: distroless or minimal images lack debugging tools, but modifying the pod spec to add them requires a restart.

### What They Solve

Modern container security best practices advocate for minimal, distroless base images that contain only the application binary. This means no shell, no `curl`, no `netstat`, no `tcpdump`. When something goes wrong, debugging is impossible.

```bash
# Attach a debug container with full tools to a running pod
kubectl debug -it my-pod -n production \
  --image=nicolaka/netshoot \
  --target=my-app-container

# Now you have tools available in the pod's network/process namespace
/ # ss -tulpn           # see listening ports
/ # curl localhost:8080/healthz
/ # tcpdump -i eth0 port 8080
/ # cat /proc/1/environ # inspect app environment
```

### Challenges

**1. Ephemeral container spec is immutable once added**

Once an ephemeral container is added to a pod, it cannot be modified or removed via the Kubernetes API until the pod is deleted. If you attach the wrong image or need different settings, you must delete the pod (causing a service interruption in single-replica deployments) or wait for the pod to be recycled.

```
# Cannot remove or update ephemeral containers via:
kubectl patch pod <name> ...  # immutable after creation
```

**2. No resource limits enforcement clarity**

Ephemeral containers share the pod's cgroup and resource pools. While you can specify resource requests/limits for ephemeral containers, the behavior under memory pressure is less predictable. A debugging session that consumes significant memory can trigger OOMKilled for the main container.

**3. Sharing the pod's network and PID namespace (opt-in)**

Using `--target` shares the process namespace of the target container, allowing you to see its processes. However, this also means debugging tools can interfere with the target container's networking and processes. Incorrectly run commands (e.g., sending signals to the wrong PID) can crash the main container.

**4. Image pull in production environment**

Ephemeral containers require pulling a debug image into the production node. In air-gapped or heavily network-restricted environments, this image may not be accessible. The pull itself can add latency and disk pressure on the node.

**5. RBAC and audit concerns**

Attaching ephemeral containers to production pods is a highly privileged operation. It should require specific RBAC permissions and generate audit log entries:

```yaml
# RBAC for ephemeral containers — grant carefully
rules:
  - apiGroups: [""]
    resources: ["pods/ephemeralcontainers"]
    verbs: ["update", "patch"]
```

Many security-conscious teams require a break-glass process (approval + audit notification) before allowing ephemeral container attachment in production.

**6. Not persisted across pod restarts**

Ephemeral containers only exist for the lifetime of the pod they are attached to. If the pod restarts (which happens frequently in crash loops), the ephemeral container disappears. Debugging a CrashLoopBackOff with ephemeral containers is difficult precisely because the pod restarts before you can gather useful information.

**7. Not visible in `kubectl get pods`**

Ephemeral containers are in the pod spec but not shown by default in pod listings. They are in `.spec.ephemeralContainers` and viewable via `kubectl get pod <name> -o yaml` or `kubectl describe pod`.

**8. Log stream management**

Ephemeral container logs are viewable via `kubectl logs pod -c <ephemeral-container-name>` but may not be collected by the DaemonSet log agent (depending on when the log file is created and whether the node agent picks it up). Short-lived debugging sessions may not be captured in centralized logging.

### Alternatives and Complements

- `kubectl exec` — works only when the container has a shell
- `kubectl cp` — copy files into/out of containers for offline analysis
- Node-level debugging (`kubectl debug node/<name> -it --image=ubuntu`) — bypasses container namespace entirely
- eBPF-based tools (Pixie, Tetragon, Hubble) — observe container behavior at kernel level without entering the container at all

---

## 17. How do you monitor AWS Lambda/serverless?

Serverless functions introduce a fundamentally different observability model. Unlike long-running containers, Lambda functions are stateless, ephemeral, billed per invocation, and scale to zero. Traditional metric collection via pull-based Prometheus does not work; you must adapt to a push-based, event-driven telemetry model.

### Native AWS Lambda Metrics (CloudWatch)

AWS automatically publishes these metrics to CloudWatch for every Lambda function:

```
# Invocation volume
aws_lambda_invocations_total

# Error count and rate
aws_lambda_errors_total

# Duration (p50, p90, p99, max)
aws_lambda_duration_milliseconds{quantile="0.99"}

# Throttles (when concurrency limit is hit)
aws_lambda_throttles_total

# Concurrent executions (current)
aws_lambda_concurrent_executions

# Unreserved concurrency
aws_lambda_unreserved_concurrent_executions

# Iterator age (for stream-based triggers like Kinesis/DynamoDB)
aws_lambda_iterator_age_milliseconds  # lag between record creation and processing

# Dead letter queue errors
aws_lambda_dead_letter_errors_total

# Provisioned concurrency utilization
aws_lambda_provisioned_concurrency_utilization
```

### Lambda Powertools (Structured Observability SDK)

AWS Lambda Powertools (Python, Java, TypeScript, .NET) provides opinionated utilities for Lambda-native observability:

```python
from aws_lambda_powertools import Logger, Metrics, Tracer
from aws_lambda_powertools.metrics import MetricUnit

logger = Logger(service="payment-processor")
tracer = Tracer(service="payment-processor")
metrics = Metrics(namespace="MyApp", service="payment-processor")

@metrics.log_metrics(capture_cold_start_metric=True)  # Automatically tracks cold starts
@tracer.capture_lambda_handler
@logger.inject_lambda_context(log_event=True)
def handler(event, context):
    metrics.add_metric(name="PaymentProcessed", unit=MetricUnit.Count, value=1)
    
    with tracer.capture_method:
        result = process_payment(event)
    
    logger.info("Payment processed", extra={
        "amount": event["amount"],
        "customer_id": event["customer_id"],
        "trace_id": tracer.get_trace_id()
    })
    
    return result
```

### X-Ray Distributed Tracing

AWS X-Ray provides distributed tracing for Lambda, tracing execution across Lambda, API Gateway, DynamoDB, SQS, and other AWS services.

```python
from aws_xray_sdk.core import xray_recorder, patch_all

patch_all()  # Auto-instruments boto3, requests, pymysql, etc.

@xray_recorder.capture("process_payment")
def process_payment(data):
    # This creates a subsegment in X-Ray
    xray_recorder.current_subsegment().put_annotation("payment_amount", data["amount"])
    ...
```

X-Ray service maps show the topology of serverless architectures across Lambda, API Gateway, DynamoDB, SQS, SNS, and external HTTP calls.

### Custom Metrics via EMF (Embedded Metrics Format)

CloudWatch Embedded Metrics Format (EMF) allows embedding custom metrics in structured log lines, which CloudWatch automatically extracts asynchronously. This is the lowest-overhead way to emit custom metrics from Lambda (no synchronous API call):

```python
from aws_lambda_powertools.metrics import MetricUnit, Metrics

metrics = Metrics(namespace="MyApp")

def handler(event, context):
    metrics.add_metric(name="OrderValue", unit=MetricUnit.Count, value=event["amount"])
    metrics.add_metric(name="ProcessingTime", unit=MetricUnit.Milliseconds, value=150)
    metrics.add_metadata(key="order_id", value=event["order_id"])
    # Metrics are flushed at function end by the decorator
```

### SQS/Kinesis Consumer Monitoring

When Lambda is triggered by queues or streams, **iterator age** is the critical metric:

```
aws_lambda_iterator_age_milliseconds (Kinesis, DynamoDB Streams)
aws_sqs_approximate_age_of_oldest_message (SQS)
```

High iterator age means processing is falling behind production rate. Alert aggressively:

```
# Alert: Lambda falling behind Kinesis stream
aws_lambda_iterator_age_milliseconds > 60000  # > 1 minute behind
```

### Error Handling and DLQ Monitoring

For asynchronous invocations (S3 events, SNS, EventBridge), failed events after retries go to a Dead Letter Queue (DLQ). Monitor DLQ message count:

```
aws_sqs_approximate_number_of_messages_visible{queue_name="my-lambda-dlq"} > 0
```

A non-zero DLQ is always an alert condition in production.

---

## 18. Cold start monitoring?

Cold starts are the latency penalty paid when a Lambda function starts a new execution environment — loading the runtime, initializing the function code, and establishing connections. They can add hundreds of milliseconds to seconds of latency and must be explicitly monitored.

### What Happens During a Cold Start

1. AWS allocates an execution environment (VM/microVM)
2. The Lambda runtime (Python, Java, Node.js, etc.) is initialized
3. The deployment package is downloaded and extracted
4. The initialization code outside the handler is executed
5. The handler is invoked

For JVM-based functions, step 4 alone can take 5–10 seconds. Node.js and Python typically cold start in 200–500ms. Compiled languages (Go, Rust via custom runtimes) can cold start in < 100ms.

### Detecting Cold Starts

**AWS Lambda Powertools (recommended):**

```python
@metrics.log_metrics(capture_cold_start_metric=True)
def handler(event, context):
    pass
# Automatically emits ColdStart metric to CloudWatch
```

**Manually via INIT_START log pattern:**

Lambda writes `INIT_START` to logs at the beginning of a cold start. This is parseable via CloudWatch Insights or log forwarding:

```
fields @timestamp, @message
| filter @message like /INIT_START/
| stats count() as cold_starts by bin(5min)
```

**Custom detection:**

```python
import os

_cold_start = True

def handler(event, context):
    global _cold_start
    is_cold_start = _cold_start
    _cold_start = False
    
    if is_cold_start:
        # Log or emit metric for cold start
        logger.info("Cold start", extra={"cold_start": True})
```

### Provisioned Concurrency

Provisioned Concurrency pre-initializes execution environments, eliminating cold starts for those instances. Monitor its efficiency:

```
# Provisioned concurrency utilization
aws_lambda_provisioned_concurrency_utilization

# Spillover invocations (hitting non-provisioned concurrency and getting cold starts)
aws_lambda_provisioned_concurrency_spillover_invocations_total
```

If spillover invocations are significant, you need to increase provisioned concurrency.

### Cold Start Duration Breakdown

Use X-Ray to see initialization time separately from invocation time:

In X-Ray traces, Lambda shows:
- **Initialization** — time spent in cold start (initialization phase)
- **Invocation** — time in the handler function itself

This separation lets you quantify whether a slow request was due to cold start or actual handler processing.

### Reducing Cold Starts

- **Package size reduction:** Smaller deployment packages extract faster. Keep Lambda zips < 10MB. Use Lambda Layers for common dependencies.
- **GraalVM native compilation** (Java): Native executables start in < 100ms vs 5-10s for JVM
- **Connection reuse:** Establish database connections, SDK clients outside the handler (in init code). They persist across warm invocations.
- **ARM64 architecture (Graviton2):** Generally lower cold start times and 20% cheaper
- **SnapStart** (Java 11+): AWS snapshots the initialized execution environment and restores it, making Java cold starts comparable to Python/Node.js

### Alert on Cold Start Rate

```
# High cold start rate may indicate over-scaling or traffic bursts
# Monitor in CloudWatch:
100 * ColdStart / (ColdStart + SuccessfulRequests) > 10  # > 10% cold start rate
```

---

## 19. CloudWatch vs Prometheus?

CloudWatch and Prometheus are both monitoring systems but represent fundamentally different philosophies: managed cloud-native vs open-source self-hosted. Choosing between them (or combining them) is a decision with significant operational and cost implications.

### Architecture Philosophy

**Prometheus:**
- Pull-based: Prometheus scrapes metrics from endpoints on a configured interval
- Self-hosted: you run and operate it (or use managed Prometheus: AWS AMP, Grafana Cloud, Cortex, Thanos)
- TSDB with 15-day default retention; long-term storage requires Thanos/Cortex/VictoriaMetrics
- Open-source ecosystem: integrates with everything via exporters
- PromQL: powerful, expressive query language

**CloudWatch:**
- Push-based: services push metrics to CloudWatch (SDK, agent, EMF)
- Fully managed: zero operational overhead, automatic scaling, indefinite retention
- Native integration with all AWS services (EC2, RDS, Lambda, SQS, ELB, etc.)
- CloudWatch Metrics Insights (SQL-like) and metric math for queries
- Structured around namespaces, dimensions (limited cardinality)

### Key Technical Differences

| Dimension | Prometheus | CloudWatch |
|---|---|---|
| Data model | Labels (high cardinality OK) | Dimensions (max 30, low cardinality) |
| Query language | PromQL | Metrics Insights (SQL-like) |
| Scrape model | Pull (active scraping) | Push (SDK, agent, EMF) |
| Custom metrics cost | Free (self-hosted) | $0.30 per custom metric/month |
| Retention | 15 days (default) | 15 months (configurable) |
| Alerting | Alertmanager (powerful routing) | CloudWatch Alarms (simpler) |
| Dashboard | Grafana (rich, open) | CloudWatch Dashboards (limited) |
| Cardinality limits | High (practical limit ~10M series) | 10 dimensions per metric |
| Kubernetes-native | Excellent (kube-prometheus-stack) | Requires Container Insights agent |
| Operational overhead | Significant | Near zero |
| Cost model | Infrastructure cost only | Per-metric, per-API-call, per-log-GB |

### CloudWatch Container Insights

For Kubernetes on AWS (EKS), CloudWatch Container Insights provides Kubernetes metrics via the CloudWatch agent deployed as a DaemonSet:

```bash
# Install Container Insights on EKS
ClusterName=my-cluster
RegionName=us-east-1
FluentBitHttpPort='2020'

curl https://raw.githubusercontent.com/aws-samples/amazon-cloudwatch-container-insights/latest/k8s-deployment-manifest-templates/deployment-mode/daemonset/container-insights-monitoring/quickstart/cwagent-fluent-bit-quickstart.yaml |
  sed "s/{{cluster_name}}/${ClusterName}/;s/{{region_name}}/${RegionName}/" |
  kubectl apply -f -
```

Container Insights provides: cluster CPU/memory utilization, pod/node metrics, container-level metrics, and auto-generated dashboards.

### Cost Analysis

For a medium-scale Kubernetes cluster (~100 pods, ~1000 custom metrics):

**Prometheus (self-hosted on EKS):**
- 2× Prometheus instances (HA): ~$200/month (EC2)
- Thanos for long-term storage: ~$50/month (S3 + compute)
- Grafana: ~$30/month
- Total: ~$280/month + engineering time to operate

**CloudWatch:**
- 1000 custom metrics × $0.30 = $300/month
- 5 million API requests × $0.01/1000 = $50/month
- Container Insights metrics: ~$150/month
- CloudWatch Logs: ~$50/month for 10GB/day
- Total: ~$550+/month, but zero operational overhead

**Managed Prometheus (AWS AMP):**
- $0.000004 per metric sample
- ~$150/month for typical usage
- Plus Grafana: AMG or self-hosted

### When to Use Which

**Use Prometheus when:**
- Running Kubernetes anywhere (on-prem, multi-cloud, EKS)
- Need high-cardinality metrics (pod-level, container-level, user-level)
- Have engineering capacity to operate it
- Want to avoid per-metric cloud costs at scale
- Need tight integration with the Kubernetes ecosystem

**Use CloudWatch when:**
- AWS-native stack with Lambda, ECS, or light EKS usage
- Small team without SRE capacity to operate Prometheus
- Need minimal time-to-value
- AWS service metrics are primary concern (RDS, SQS, ALB, etc.)

**Use both (most common in practice):**
- Prometheus for Kubernetes workload metrics (containers, pods, nodes)
- CloudWatch for AWS service metrics and Lambda/serverless
- Grafana with both as data sources for unified dashboards

---

## 20. How do you monitor multi-region deployments?

Multi-region deployments multiply the complexity of observability. You now have independent control planes, potentially independent metric systems, inter-region latency, cross-region replication lag, failover events, and region-specific incident impacts to monitor.

### Architecture Patterns for Multi-Region Observability

**Federated Prometheus**

Each region runs its own Prometheus. A global Prometheus federates (pulls) aggregated metrics from regional instances:

```yaml
# Global Prometheus federating regional instances
scrape_configs:
  - job_name: federate-us-east-1
    honor_labels: true
    metrics_path: /federate
    params:
      match[]:
        - '{__name__=~"cluster:.*"}'     # Only aggregate-level metrics
        - '{job="kubernetes-apiservers"}'
    static_configs:
      - targets: ['prometheus-us-east-1.internal:9090']

  - job_name: federate-eu-west-1
    honor_labels: true
    metrics_path: /federate
    params:
      match[]:
        - '{__name__=~"cluster:.*"}'
    static_configs:
      - targets: ['prometheus-eu-west-1.internal:9090']
```

**Thanos or Cortex for Global View**

Thanos Query aggregates queries across multiple Prometheus instances (in different regions) transparently. Each regional Prometheus uploads blocks to a shared (or regional) object store (S3/GCS), and Thanos Compactor deduplicates and compacts:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   us-east-1     │     │   eu-west-1     │     │   ap-south-1    │
│   Prometheus    │     │   Prometheus    │     │   Prometheus    │
│   + Sidecar     │     │   + Sidecar     │     │   + Sidecar     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    ┌────────┐              ┌────────┐              ┌────────┐
    │ S3     │              │ S3     │              │ S3     │
    │ Bucket │              │ Bucket │              │ Bucket │
    └────────┘              └────────┘              └────────┘
              ╲                   │                 ╱
               ╲                  │                ╱
                ▼                 ▼               ▼
              ┌────────────────────────────────────┐
              │         Thanos Query               │
              │    (global query aggregation)      │
              └──────────────────┬─────────────────┘
                                 │
                                 ▼
                          ┌─────────────┐
                          │   Grafana   │
                          │  (global)   │
                          └─────────────┘
```

### Cross-Region Latency Monitoring

Latency between regions is foundational to multi-region system health. Measure it continuously:

```python
# Synthetic probe between regions using Blackbox Exporter
# Deploy in each region, probe endpoints in all other regions

- job_name: cross-region-latency
  metrics_path: /probe
  params:
    module: [http_2xx]
  static_configs:
    - targets:
        - https://api.eu-west-1.example.com/health
        - https://api.ap-south-1.example.com/health
  relabel_configs:
    - source_labels: [__address__]
      target_label: __param_target
    - source_labels: [__param_target]
      target_label: instance
    - target_label: __address__
      replacement: blackbox-exporter:9115
```

Key cross-region metrics:

```
# Probe success rate (is the region reachable?)
probe_success{instance="api.eu-west-1.example.com"} == 0  # alert condition

# Cross-region latency
probe_duration_seconds{instance=~".*eu-west-1.*"}

# DNS resolution time per region
probe_dns_lookup_time_seconds

# TLS handshake time (can degrade before full failure)
probe_tls_version_info
probe_ssl_earliest_cert_expiry
```

### Replication Lag Monitoring

For systems with cross-region data replication (databases, caches, event streams):

```
# PostgreSQL replication lag (bytes)
pg_replication_lag

# RDS replica lag (seconds)
aws_rds_replica_lag_seconds{region="eu-west-1"}

# Kafka cross-region replication lag (messages behind)
kafka_consumer_group_lag{consumer_group="cross-region-replicator"}

# DynamoDB Global Tables replication latency
aws_dynamodb_replication_latency_milliseconds
```

Replication lag thresholds should be tuned to your RPO (Recovery Point Objective). If RPO is 30 seconds, alert at 25 seconds lag.

### Failover Event Detection

Detecting and measuring failover events:

```
# Traffic shift during failover — detect sudden changes in request distribution
sum(rate(nginx_ingress_controller_requests[5m])) by (region)

# DNS health check status (Route 53)
aws_route53_health_check_status{health_check_id="..."}

# Global load balancer backend distribution
aws_globalaccelerator_processed_bytes_in by (endpoint)
```

Alert on traffic imbalances that might indicate a failover has occurred but was not intentionally triggered.

### Multi-Region Dashboard Design

A global dashboard should show:

- **Region health grid:** One cell per region showing RED/AMBER/GREEN status
- **Request distribution:** Real-time traffic breakdown by region
- **Cross-region error rate:** Requests that fail only when routing to a specific region
- **Replication lag timeline:** Each replica's lag vs source
- **Failover event log:** Historical record of failover events with duration

```
# Example: Detecting region-specific error spikes (may indicate degradation)
(
  rate(http_requests_total{status=~"5..", region="us-east-1"}[5m])
    /
  rate(http_requests_total{region="us-east-1"}[5m])
)
>
avg(
  rate(http_requests_total{status=~"5.."}[5m])
    /
  rate(http_requests_total[5m])
) * 3  # Alert if one region's error rate is 3× the global average
```

### Alerting Strategy for Multi-Region

Multi-region alerting requires careful design to avoid noise:

- **Regional Alertmanager instances** with routing to on-call teams that own each region
- **Global alerts** that fire only when multiple regions are affected simultaneously (cross-region silencing)
- **Inhibition rules** that suppress regional alerts when a known global incident is ongoing
- **Timezone-aware escalation paths** — who is on-call for ap-southeast-1 at 3am UTC?

```yaml
# Alertmanager inhibition: suppress regional alerts during global incidents
inhibit_rules:
  - source_match:
      severity: critical
      scope: global
    target_match:
      scope: regional
    equal: [alertname]
```

---

*This guide covers the core observability concepts for Kubernetes and cloud-native environments as of 2024–2025. The ecosystem evolves rapidly; always refer to the official documentation for the latest versions of Prometheus, OpenTelemetry, Kubernetes, and the AWS SDK.*