# Kubernetes Learning Notes — Part 5 (Combined)

**Covers:** 13) CI/CD & GitOps — full deep dive, including a dedicated deep dive on Argo CD architecture and internals.

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
