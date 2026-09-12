# Kubernetes Learning Notes — Part 2

**Covers:** 6) EKS, 7) End-to-End Request Flow

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
