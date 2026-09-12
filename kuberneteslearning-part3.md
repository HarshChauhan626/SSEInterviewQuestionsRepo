# Kubernetes Learning Notes — Part 3

**Covers:** 8) Kubernetes DNS & FQDNs, 9) Configuration & Secrets

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
