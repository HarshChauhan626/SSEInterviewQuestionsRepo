# OpenStack â€” Part 1 (P0 Must-Know Topics)

> A deep, from-scratch guide to OpenStack fundamentals â€” architecture, core services, networking, and the complete VM lifecycle â€” with analogies, diagrams, and real command examples.

---

## Table of Contents

1. [OpenStack Overview & Architecture](#1-openstack-overview--architecture)
2. [Control Plane vs Data Plane](#2-control-plane-vs-data-plane)
3. [OpenStack Projects / Services](#3-openstack-projects--services)
4. [Keystone â€” Identity & RBAC](#4-keystone--identity--rbac)
5. [Nova â€” Compute](#5-nova--compute)
6. [Nova Scheduler](#6-nova-scheduler)
7. [Nova Compute Nodes](#7-nova-compute-nodes)
8. [Flavors](#8-flavors)
9. [VM / Instance Lifecycle](#9-vm--instance-lifecycle)
10. [Glance â€” Images](#10-glance--images)
11. [Cinder â€” Block Storage](#11-cinder--block-storage)
12. [Neutron â€” Networking â­](#12-neutron--networking-)
13. [Neutron Networks](#13-neutron-networks)
14. [Neutron Subnets](#14-neutron-subnets)
15. [Neutron Ports](#15-neutron-ports)
16. [Neutron Routers](#16-neutron-routers)
17. [Floating IPs](#17-floating-ips)
18. [Security Groups](#18-security-groups)
19. [DHCP](#19-dhcp)
20. [L2 vs L3 Networking](#20-l2-vs-l3-networking)
21. [VLAN / VXLAN / Geneve](#21-vlan--vxlan--geneve)
22. [Provider vs Tenant Networks](#22-provider-vs-tenant-networks)
23. [Network Namespaces](#23-network-namespaces)
24. [East-West vs North-South Traffic](#24-east-west-vs-north-south-traffic)
25. [VM â†’ Internet Traffic Flow](#25-vm--internet-traffic-flow)
26. [Internet â†’ VM Traffic Flow](#26-internet--vm-traffic-flow)
27. [VM Creation â€” Complete End-to-End Flow](#27-vm-creation--complete-end-to-end-flow)
28. [OpenStack CLI](#28-openstack-cli)
29. [OpenStack REST APIs](#29-openstack-rest-apis)
30. [Projects / Tenants / Quotas / Availability Zones](#30-projects--tenants--quotas--availability-zones)

---

## 1. OpenStack Overview & Architecture

### What is OpenStack?

OpenStack is a **free, open-source cloud computing platform** that lets you build and manage your own **Infrastructure as a Service (IaaS)** â€” essentially your own private AWS/Azure/GCP, running on your own hardware in your own datacenter.

It doesn't run VMs itself â€” it **orchestrates** the underlying virtualization (KVM, Xen, ESXi), storage systems, and networking (Linux bridges, OVS, OVN) through a large collection of loosely-coupled services that talk to each other over REST APIs and a message bus.

### The Hotel Analogy ðŸ¨

Think of a large hotel:

- **Keystone** = the front desk / ID verification â€” checks who you are and what you're allowed to book.
- **Nova** = the room booking & room service manager â€” allocates rooms (VMs), decides which room you get.
- **Glance** = the catalog of pre-furnished room templates (photos of how each room type looks) â€” i.e., OS images.
- **Cinder** = the storage lockers you can attach to your room and take with you when you move rooms.
- **Neutron** = the hotel's internal phone/hallway/elevator system â€” how rooms talk to each other and to the outside world.
- **Horizon** = the hotel's web portal where you browse and book everything visually.
- **Swift** = the hotel's shared warehouse for bulk storage (object storage), not room-specific.

Each of these is a separate, independently-scalable microservice â€” that's the key architectural idea.

### High-Level Architecture Diagram

```
                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                        â”‚         Horizon (UI)         â”‚
                        â”‚      OpenStack CLI / SDKs    â”‚
                        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                        â”‚  REST APIs (HTTPS)
                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                        â”‚           Keystone            â”‚
                        â”‚   (AuthN/AuthZ, Service Catalog)â”‚
                        â””â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚         â”‚         â”‚
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â” â”Œâ”€â”€â”€â–¼â”€â”€â”€â”€â”€â” â”Œâ”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”
              â”‚      Nova       â”‚ â”‚ Neutron â”‚ â”‚  Cinder   â”‚
              â”‚   (Compute)     â”‚ â”‚ (Network)â”‚ â”‚ (Block SV)â”‚
              â””â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”˜ â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
                  â”‚         â”‚         â”‚             â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â” â”Œâ”€â”€â”€â–¼â”€â”€â”€â”€â”€â”   â”‚      â”Œâ”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”
        â”‚ nova-compute â”‚ â”‚ Glance  â”‚   â”‚      â”‚  Storage    â”‚
        â”‚  (hypervisor)â”‚ â”‚(Images) â”‚   â”‚      â”‚  Backend    â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚      â”‚(LVM/Ceph..) â”‚
                                        â”‚      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                              â”‚  OVS/OVN/Linux     â”‚
                              â”‚  Bridges, L2/L3     â”‚
                              â”‚  agents, DHCP, etc  â”‚
                              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

        All services communicate over a shared Message Bus (RabbitMQ/AMQP)
        and store state in their own databases (typically MySQL/MariaDB).
```

### Key Architectural Principles

| Principle | Meaning |
|---|---|
| **Shared-nothing microservices** | Each project (Nova, Neutron, etc.) is independently deployable and scalable |
| **REST API-first** | Every action a user takes goes through a versioned REST API |
| **Message-queue driven internals** | Internally, services talk asynchronously via RPC over RabbitMQ |
| **Pluggable backends** | Storage, networking, and hypervisor drivers are swappable (KVM vs Xen, LVM vs Ceph, OVS vs OVN) |
| **Multi-tenancy first** | Projects/tenants isolate resources, quotas, and networks by default |
| **Everything is a resource with an API** | VMs, networks, volumes, images â€” all first-class API objects with UUIDs |

### Definitions

- **IaaS (Infrastructure as a Service):** delivering compute, storage, and networking as on-demand, API-driven resources instead of physical hardware.
- **Tenant / Project:** an isolated namespace for resources, users, and quotas (used interchangeably in OpenStack docs).
- **Endpoint:** a URL where a service's API can be reached, registered in Keystone's catalog.

---

## 2. Control Plane vs Data Plane

This is one of the most important mental models in all of networking and cloud infrastructure, not just OpenStack.

### Definitions

- **Control Plane:** The "brains" â€” decides *what should happen*. It makes decisions, stores configuration/state, and issues instructions. Examples: Nova API deciding which host a VM should land on, Neutron server deciding what a router's routes should be.
- **Data Plane:** The "muscles" â€” actually *does the work* of moving/processing traffic or workloads based on what the control plane decided. Examples: the actual packets flowing through OVS flows, the actual CPU cycles a VM consumes on a hypervisor.

### Analogy: Air Traffic Control âœˆï¸

- **Control Plane** = the air traffic control tower. It doesn't fly anything. It just tells planes "you're cleared for runway 27," "descend to 10,000 ft," etc. It's about **decisions and coordination**.
- **Data Plane** = the actual airplanes flying, carrying passengers and cargo. This is where the "real work" â€” the actual transportation â€” happens.

If the control tower (control plane) goes down temporarily, planes already in the air keep flying (data plane keeps working) â€” but no *new* coordinated decisions can be made until it's back.

### In OpenStack terms

| Layer | Control Plane Components | Data Plane Components |
|---|---|---|
| Compute | `nova-api`, `nova-scheduler`, `nova-conductor` | `nova-compute` + hypervisor (KVM) actually running the VM's vCPUs/RAM |
| Networking | `neutron-server`, ML2 plugin, L3/DHCP agents' *control logic* | OVS/OVN flows, Linux bridges, actual packet forwarding |
| Storage | `cinder-api`, `cinder-scheduler`, `cinder-volume` (orchestration) | The actual storage backend (Ceph OSDs, LVM volumes) serving I/O |
| Identity | Keystone issuing tokens | N/A (Keystone is pure control plane) |

### Why This Distinction Matters

1. **Failure domains differ.** If `neutron-server` (control plane) crashes, existing VMs keep passing traffic fine (data plane keeps running on already-programmed OVS flows) â€” but you can't create new ports, update security groups, or spin up new networks until it's restored.
2. **Scaling differs.** Control plane services usually scale by adding more API workers / DB read replicas. Data plane scales by adding more compute/network nodes doing the actual traffic forwarding.
3. **Latency sensitivity differs.** Control plane operations can tolerate some latency (a few hundred ms to create a port is fine). Data plane operations (packet forwarding) must happen at line-rate, microsecond latencies.

```
        CONTROL PLANE (slow-path, decisions)          DATA PLANE (fast-path, execution)
        â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€             â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        nova-api  â”€â”€ "schedule VM on host-3"  â”€â”€â”€â–º    nova-compute on host-3 boots
        neutron-server â”€â”€ "create OVS flow"   â”€â”€â”€â–º    OVS on host-3 forwards packets
        cinder-scheduler â”€â”€ "attach vol X"    â”€â”€â”€â–º    QEMU attaches iSCSI/RBD device
```

---

## 3. OpenStack Projects / Services

OpenStack is not one monolithic program â€” it's a constellation of independent "projects," each providing one service, each with its own REST API, database, and (usually) its own set of agents.

### Core Services (the ones in this guide's P0 list)

| Service (code name) | Purpose | Analogy |
|---|---|---|
| **Keystone** | Identity, authentication, authorization, service catalog | Front desk / ID check |
| **Nova** | Compute â€” manage VM instances | Hotel room booking manager |
| **Glance** | Image service â€” VM disk image catalog | Room "template photo" catalog |
| **Cinder** | Block storage â€” persistent virtual disks | Detachable storage lockers |
| **Neutron** | Networking â€” virtual networks, routers, LB, FW | Hotel's phone/hallway/elevator wiring |
| **Swift** | Object storage (not in P0 but often paired) | Warehouse for bulk unstructured data |
| **Horizon** | Web dashboard/UI | The hotel's booking website |

### Other Notable (non-P0, for context)

- **Heat** â€” orchestration (like CloudFormation) for stacks of resources.
- **Ceilometer/Gnocchi** â€” telemetry/metering.
- **Octavia** â€” Load-Balancer-as-a-Service.
- **Barbican** â€” secrets/key management.
- **Designate** â€” DNS-as-a-Service.
- **Magnum** â€” Container-orchestration-as-a-Service (Kubernetes clusters).

### How They Fit Together

```
   User/Admin
       â”‚
       â–¼
   Horizon / CLI / SDK
       â”‚  (every call first hits Keystone to get a token)
       â–¼
   Keystone â”€â”€ validates identity, returns auth token + service catalog
       â”‚
       â”œâ”€â”€â–º Nova     (compute)
       â”œâ”€â”€â–º Glance   (images)
       â”œâ”€â”€â–º Cinder   (volumes)
       â”œâ”€â”€â–º Neutron  (networking)
       â””â”€â”€â–º Swift    (objects)

   Every one of these services independently:
     - Has its own REST API (versioned, e.g., /v2.1/, /v3/)
     - Has its own database (usually MySQL/MariaDB)
     - Registers its endpoint URL in Keystone's catalog
     - Talks internally via RPC (RabbitMQ) to its own agents
```

### Why a Microservices Design?

- **Independent scaling:** you might need 50 Nova compute nodes but only 3 Neutron network nodes.
- **Independent upgrades:** you can upgrade Cinder without touching Nova.
- **Vendor pluggability:** you can swap Neutron's backend from OVS to OVN, or Cinder's backend from LVM to Ceph/NetApp/Pure Storage, without rewriting Nova.
- **Fault isolation:** Glance being briefly down doesn't crash running VMs.

---

## 4. Keystone â€” Identity & RBAC

### What is Keystone?

Keystone is OpenStack's **identity provider**. It handles:
1. **Authentication (AuthN)** â€” "who are you?" (username/password, LDAP, SAML, OIDC federation)
2. **Authorization (AuthZ)** â€” "what are you allowed to do?" (via roles and policies)
3. **Service Catalog** â€” "where do I find the Nova/Neutron/Cinder API endpoints?"
4. **Multi-tenancy structure** â€” Projects, Domains, Users, Groups

### Analogy: The Airport Security + Boarding Pass System âœˆï¸

- You show your **passport** (credentials) at security â†’ Keystone authenticates you.
- You get a **boarding pass** (token) that says: your name, which flight (project/tenant) you're allowed on, and your seat class (role â€” economy/business = member/admin).
- At each gate (each OpenStack service), the agent doesn't re-check your passport â€” they just scan your **boarding pass (token)** and check if it's valid and grants the right access.
- The **airport directory board** (service catalog) tells you which gate (endpoint URL) to go to for each service.

### Core Concepts

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚    Domain    â”‚   (top-level container, e.g. "Default", "CompanyX")
                    â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
                           â”‚
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
              â–¼            â–¼            â–¼
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚ Project â”‚   â”‚ Project â”‚   â”‚ Project â”‚   (aka "Tenant")
         â”‚ "dev"   â”‚   â”‚ "prod"  â”‚   â”‚ "qa"    â”‚
         â””â”€â”€â”€â”¬â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”¬â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”¬â”€â”€â”€â”€â”˜
             â”‚            â”‚            â”‚
        â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”
        â”‚  Users  â”‚   â”‚  Users  â”‚   â”‚  Users  â”‚  (assigned Roles per-project)
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- **User:** an identity (person or service account) that can authenticate.
- **Project (Tenant):** a namespace that owns resources (VMs, networks, volumes) and has quotas.
- **Domain:** a container for users/projects/groups â€” used for multi-org isolation (e.g., separate customer orgs in a public cloud).
- **Role:** a named permission set (e.g., `admin`, `member`, `reader`) assigned to a **User+Project** pair (a "role assignment").
- **Group:** a collection of users that can be assigned roles together.

### RBAC (Role-Based Access Control) in Keystone

Keystone doesn't itself decide "can this user delete this VM" â€” instead:

1. Keystone issues a **token** that embeds: user ID, project ID, and the **roles** the user has in that project.
2. Each service (Nova, Neutron, etc.) has its own **policy.yaml** (policy-in-code) that maps API actions to required roles, e.g.:
   ```yaml
   "os_compute_api:servers:delete": "role:member and project_id:%(project_id)s"
   "os_compute_api:servers:create": "role:admin or role:member"
   ```
3. When a request comes in with a token, the service checks the token's roles against its own policy file to allow/deny.

### Token Types

| Type | Description |
|---|---|
| **Unscoped token** | Proves who you are, but not tied to any project yet |
| **Project-scoped token** | Tied to a specific project â€” most common, used for actual resource operations |
| **Domain-scoped token** | Used for domain-level admin operations |
| **Fernet token (default in modern OpenStack)** | Lightweight, non-persistent, cryptographically signed â€” replaced old UUID tokens that had to be stored in a DB |

### Example CLI Flow

```bash
# Authenticate & get a project-scoped token
openstack token issue

# List projects your user is a member of
openstack project list

# Show role assignments
openstack role assignment list --user alice --project dev

# Assign the 'member' role to a user in a project
openstack role add --user alice --project dev member
```

### Why Keystone is "the front door" of the whole system

Every single API call to Nova, Neutron, Cinder, Glance first requires a valid Keystone token in the `X-Auth-Token` header. If Keystone is down, **nothing new can happen** anywhere in the cloud â€” no new VMs, no new volumes, no new networks â€” even though existing VMs keep running (this is the Control Plane vs Data Plane idea again: Keystone is pure control plane).

---

## 5. Nova â€” Compute

### What is Nova?

Nova is OpenStack's **compute service** â€” it's the component responsible for provisioning and managing the lifecycle of **virtual machine instances**. It doesn't do the actual virtualization itself (that's KVM/QEMU/Xen/ESXi's job) â€” Nova is the **orchestrator** that decides *which* physical host a VM should run on, talks to the hypervisor to create it, and tracks its state.

### Analogy: The Restaurant Kitchen Manager ðŸ‘¨â€ðŸ³

Think of Nova as a **restaurant's kitchen manager**:
- A customer (user) places an order (VM creation request) with the waiter (Nova API).
- The manager (nova-scheduler) looks at all cooking stations (compute hosts) and picks one that has room and the right equipment (CPU/RAM/GPU) to fulfill the order.
- The recipe (image + flavor) is retrieved from the recipe book (Glance).
- The actual chef at that station (nova-compute + hypervisor) cooks (boots) the dish (VM).
- The conductor keeps track of order status in the central ledger (database) without letting waiters touch the ledger directly.

### Nova's Sub-Components

```
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   API requests â”€â”€â”€â–º â”‚      nova-api      â”‚  (REST API entrypoint)
                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚  RPC (via RabbitMQ)
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚   nova-scheduler   â”‚  (decides WHICH host)
                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚   nova-conductor   â”‚  (mediates DB access, business logic,
                     â”‚                    â”‚   shields compute nodes from direct DB access)
                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚  RPC
                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                â–¼              â–¼              â–¼
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚ nova-compute  â”‚â”‚ nova-compute  â”‚â”‚ nova-compute  â”‚  (one per hypervisor host)
        â”‚  (host A)     â”‚â”‚  (host B)     â”‚â”‚  (host C)     â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                â”‚
                â–¼
          libvirt/KVM â”€â”€ actually creates & runs the VM
```

| Component | Role |
|---|---|
| `nova-api` | Accepts REST requests (`POST /servers`, etc.), validates, forwards |
| `nova-scheduler` | Picks the best compute host based on filters/weights (see section 6) |
| `nova-conductor` | Acts as a proxy between compute nodes and the DB (security + decoupling); handles long-running orchestration tasks |
| `nova-compute` | Runs on every hypervisor host; talks to libvirt/KVM to actually create/manage VMs |
| `nova-novncproxy` | Provides browser-based console (VNC) access to VMs |
| Nova DB | Stores instance metadata, state, host mappings |
| Message Queue (RabbitMQ) | All internal Nova component communication (async RPC) |

### What Nova Is NOT Responsible For

- **Image storage** â†’ that's Glance
- **Networking (IP assignment, virtual switches)** â†’ that's Neutron (Nova just calls Neutron's API to get a port)
- **Block storage volumes** â†’ that's Cinder (Nova just calls Cinder's API to attach a volume)

Nova is the **conductor of an orchestra** â€” it doesn't play every instrument, it coordinates Glance, Neutron, and Cinder to assemble a working VM.

---

## 6. Nova Scheduler

### What Does the Scheduler Do?

When you request a new VM, someone has to decide: **which of the (potentially thousands of) physical compute hosts should this VM actually run on?** That's the `nova-scheduler`'s job.

### Analogy: Hotel Booking Optimization ðŸ¨

Imagine a hotel with hundreds of rooms across multiple buildings. When a guest requests "a room with 2 beds, ocean view, pet-friendly, in Building B," the booking system:
1. **Filters out** every room that doesn't meet hard requirements (pet-friendly? ocean view? in Building B?) â€” this is the **Filter** stage.
2. Among remaining valid rooms, **ranks** them by soft preferences (least crowded floor, most recently cleaned) â€” this is the **Weighing** stage.
3. Picks the top-ranked room.

### The Two-Stage Filter + Weight Pipeline

```
   All compute hosts (e.g. 500 hypervisors)
           â”‚
           â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚   FILTERING STAGE  â”‚  Remove hosts that CANNOT satisfy the request
   â”‚                    â”‚  e.g. not enough RAM, wrong AZ, disabled host,
   â”‚                    â”‚  doesn't meet flavor's required traits (SSD, GPU)
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â”‚  (e.g. 500 â†’ 40 hosts remain)
             â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚   WEIGHING STAGE    â”‚  Rank remaining hosts by preference
   â”‚                    â”‚  e.g. prefer hosts with more free RAM (spread),
   â”‚                    â”‚  or fewer VMs already (anti-affinity)
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â”‚
             â–¼
     Best host selected â†’ instance placed there
```

### Common Filters

| Filter | Purpose |
|---|---|
| `RetryFilter` | Avoid re-trying hosts that already failed for this request |
| `AvailabilityZoneFilter` | Only hosts in the requested AZ |
| `RamFilter` / `CoreFilter` / `DiskFilter` | Only hosts with enough free RAM/vCPU/disk |
| `ComputeFilter` | Only hosts whose `nova-compute` service is up |
| `ImagePropertiesFilter` | Host hypervisor type matches image requirements |
| `ServerGroupAffinityFilter` / `AntiAffinityFilter` | Keep VMs together (affinity) or apart (anti-affinity) on hosts |
| `NUMATopologyFilter` | Ensure NUMA/CPU-pinning requirements can be met |

### Common Weighers

| Weigher | Purpose |
|---|---|
| `RAMWeigher` | Prefer hosts with more (or less, configurable) free RAM â€” enables spread or stack scheduling strategies |
| `DiskWeigher` | Similar, for disk |
| `MetricsWeigher` | Custom metrics-based weighing (e.g., host load average) |

### Placement Service (modern OpenStack)

In newer OpenStack releases, a separate **Placement API** tracks resource inventories (VCPU, MEMORY_MB, DISK_GB) and allocations per host, so the scheduler can do fast resource-based filtering by querying Placement instead of scanning every compute node's live state directly.

```
  nova-scheduler â”€â”€â–º Placement API â”€â”€â–º "which hosts have >= 4 VCPU, 8GB RAM free?"
                                     â”€â”€â–º returns candidate host list
  nova-scheduler â”€â”€â–º runs Filters + Weighers on candidates â”€â”€â–º picks winner
```

### Why This Matters

Scheduling decisions directly affect:
- **Bin-packing efficiency** (cost â€” fewer wasted idle hosts)
- **Fault tolerance** (anti-affinity spreads replicas across failure domains)
- **Performance** (NUMA/CPU pinning avoids cross-socket memory latency)

---

## 7. Nova Compute Nodes

### What is a Compute Node?

A **compute node** is a physical server (hypervisor host) that actually runs VMs. It runs the `nova-compute` service, which is the **agent** that talks to Nova's control plane on one side and to the local hypervisor (usually libvirt/KVM) on the other.

### Analogy: The Individual Kitchen Station ðŸ³

If nova-scheduler is the manager assigning orders to stations, each **compute node** is an actual cooking station with its own stove, oven, and ingredients (CPU, RAM, local disk). The chef at that station (`nova-compute` process) receives the order and does the actual cooking (creates the VM via libvirt).

### What nova-compute Does

1. **Reports resource inventory** (total/available VCPU, RAM, disk) periodically to the control plane / Placement.
2. **Receives "build instance" RPC calls** from the conductor/scheduler.
3. **Talks to libvirt** to:
   - Download/prepare the image (from local cache or Glance)
   - Create the VM's disk (via Cinder if it's a volume-backed instance, or locally if ephemeral)
   - Request a network **port** from Neutron and attach the VM's vNIC to the right virtual switch (OVS bridge)
   - Boot the VM (`virsh start` under the hood)
4. **Monitors VM state** and reports changes back (ACTIVE, ERROR, SHUTOFF, etc.)
5. **Handles lifecycle actions**: start, stop, reboot, resize, migrate, snapshot, delete.

### Compute Node Architecture

```
                     Compute Node (physical server)
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚                                                            â”‚
   â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
   â”‚   â”‚nova-compute â”‚â”€â”€â”€â”€â–ºâ”‚   libvirtd    â”‚â”€â”€â–ºâ”‚  KVM/QEMU    â”‚ â”‚
   â”‚   â”‚  (agent)    â”‚     â”‚ (hypervisor    â”‚   â”‚ (VM processes)â”‚ â”‚
   â”‚   â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜     â”‚  mgmt daemon)  â”‚   â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
   â”‚         â”‚            â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜          â”‚         â”‚
   â”‚         â”‚ RPC to control plane                  â”‚         â”‚
   â”‚         â”‚                                        â–¼         â”‚
   â”‚         â”‚                              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
   â”‚         â”‚                              â”‚  VM1  VM2  VM3 â”‚  â”‚
   â”‚         â”‚                              â”‚ (actual guests)â”‚  â”‚
   â”‚         â”‚                              â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
   â”‚         â”‚                                       â”‚           â”‚
   â”‚   â”Œâ”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                     â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
   â”‚   â”‚ neutron-       â”‚                     â”‚  OVS bridge /   â”‚ â”‚
   â”‚   â”‚ openvswitch-   â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  Linux bridge   â”‚ â”‚
   â”‚   â”‚ agent          â”‚  wires VM's tap dev  â”‚  (vNIC to phy) â”‚ â”‚
   â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  into virtual switch â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
   â”‚                                                            â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Key Facts

- Every hypervisor host in the cloud runs exactly **one `nova-compute` process**.
- Compute nodes are typically **stateless from the control plane's perspective** â€” if one dies, its VMs can (with shared storage) be evacuated to another host.
- The **hypervisor driver** is pluggable: `libvirt` (KVM/QEMU, most common), `vmware`, `hyperv`, `ironic` (bare metal), etc.
- Compute nodes periodically send **heartbeats** to the control plane; if missed, `nova-scheduler`'s `ComputeFilter` stops sending new VMs there.

---

## 8. Flavors

### What is a Flavor?

A **flavor** is a predefined hardware profile â€” essentially "T-shirt sizing" for VMs. It specifies vCPU count, RAM, root disk size, ephemeral disk, swap, and optional extra specs (like CPU pinning, NUMA, GPU passthrough).

### Analogy: Fast Food Menu Combos ðŸ”

You don't custom-order "exactly 347 grams of beef, 2.3 fries" â€” you pick "Combo #2" (Medium meal: burger + medium fries + medium drink). A flavor is exactly that: a fixed, named bundle of resources so users pick from a menu instead of hand-specifying raw hardware numbers.

### Default Flavor Examples

| Flavor Name | vCPUs | RAM (MB) | Disk (GB) |
|---|---|---|---|
| `m1.tiny` | 1 | 512 | 1 |
| `m1.small` | 1 | 2048 | 20 |
| `m1.medium` | 2 | 4096 | 40 |
| `m1.large` | 4 | 8192 | 80 |
| `m1.xlarge` | 8 | 16384 | 160 |

### CLI Examples

```bash
# List available flavors
openstack flavor list

# Create a custom flavor
openstack flavor create --vcpus 4 --ram 8192 --disk 100 gpu.medium

# Set extra specs (e.g., pin to hosts with specific trait, or dedicated CPUs)
openstack flavor set gpu.medium --property hw:cpu_policy=dedicated
openstack flavor set gpu.medium --property pci_passthrough:alias=nvidia-t4:1
```

### Extra Specs â€” Fine-Grained Control

Flavors aren't just size â€” `extra_specs` let admins encode advanced scheduling/hardware requirements:

| Extra Spec | Meaning |
|---|---|
| `hw:cpu_policy=dedicated` | Pin vCPUs to physical cores (no oversubscription) â€” for latency-sensitive workloads |
| `hw:numa_nodes=2` | Spread the VM across 2 NUMA nodes |
| `quota:vif_rate_limit` | Network bandwidth limit for the VM's port |
| `trait:CUSTOM_GPU=required` | Only schedule on hosts advertising this custom Placement trait |

### Why Flavors Matter for Scheduling

The **Nova Scheduler's filters** (RamFilter, CoreFilter, DiskFilter, NUMATopologyFilter) directly consume the flavor's specs to eliminate hosts that can't satisfy the request â€” so flavors are the direct input to the filtering pipeline discussed in section 6.

---

## 9. VM / Instance Lifecycle

### The State Machine

An OpenStack instance moves through a well-defined set of states (`vm_state` and `task_state` in Nova's data model):

```
        [BUILD] â”€â”€â–º [ACTIVE] â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
           â”‚            â”‚  â–²                â”‚
           â”‚      stop  â”‚  â”‚ start          â”‚
           â”‚            â–¼  â”‚                â”‚
           â”‚         [SHUTOFF]               â”‚
           â”‚            â”‚                    â”‚
           â”‚      rebootâ”‚  resize/migrate    â”‚
           â”‚            â–¼                    â”‚
           â”‚         [REBOOT] â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º [RESIZED]
           â”‚                                  â”‚
           â”‚                          confirm/revert
           â”‚                                  â”‚
           â–¼                                  â–¼
        [ERROR]                          [ACTIVE/SHUTOFF]

     Other transitions:
     ACTIVE â”€â”€pauseâ”€â”€â–º PAUSED â”€â”€unpauseâ”€â”€â–º ACTIVE
     ACTIVE â”€â”€suspendâ”€â”€â–º SUSPENDED â”€â”€resumeâ”€â”€â–º ACTIVE
     ACTIVE â”€â”€snapshotâ”€â”€â–º (creates Glance image, stays ACTIVE)
     ANY â”€â”€deleteâ”€â”€â–º [DELETED] (soft-delete, then reclaimed)
```

### Definitions of Common States

| State | Meaning |
|---|---|
| `BUILD` | Instance is being created (image download, disk prep, boot in progress) |
| `ACTIVE` | Running normally |
| `SHUTOFF` | Powered off, but disk/config still exists (can be started again) |
| `PAUSED` | VM's execution frozen in memory (like `Ctrl+Z`), RAM still allocated |
| `SUSPENDED` | VM's RAM state saved to disk, resources freed (like hibernate) |
| `RESIZED` | Instance resized to new flavor, awaiting confirm/revert |
| `ERROR` | Something failed during a state transition |
| `DELETED` | Marked for removal / removed |

### Analogy: A Car's Life ðŸš—

- **BUILD** = the car is on the factory assembly line.
- **ACTIVE** = the car is being driven.
- **SHUTOFF** = the car is parked, engine off, but fully intact and ready to start again.
- **PAUSED** = like hitting pause on a video game â€” everything frozen mid-action, engine still "on" conceptually.
- **SUSPENDED** = like hibernating a laptop â€” state saved to disk, engine actually off, resources released.
- **DELETED** = the car is sent to the scrapyard.

### Lifecycle Operations (CLI)

```bash
openstack server create --image ubuntu-22.04 --flavor m1.medium \
    --network private-net --key-name mykey my-vm

openstack server list
openstack server show my-vm
openstack server stop my-vm
openstack server start my-vm
openstack server reboot my-vm
openstack server resize my-vm --flavor m1.large
openstack server resize confirm my-vm
openstack server pause my-vm
openstack server suspend my-vm
openstack server delete my-vm
```

### What Actually Happens Under the Hood (summary â€” full detail in Section 27)

1. `nova-api` validates request, writes an initial DB record (state=BUILD).
2. `nova-conductor` + `nova-scheduler` pick a host.
3. `nova-compute` on that host:
   - fetches image from Glance (or uses cache)
   - requests a Neutron port (IP, MAC assigned)
   - requests a Cinder volume if boot-from-volume
   - calls libvirt to define & start the VM
4. State transitions to `ACTIVE` once boot succeeds; if anything fails â†’ `ERROR`.

---

## 10. Glance â€” Images

### What is Glance?

Glance is OpenStack's **image service**. It stores and serves the **disk images** (OS templates) used to boot VMs â€” think of it as a registry/catalog, similar in spirit to a Docker image registry, but for full VM disk images (qcow2, raw, vmdk, ISO, etc.).

### Analogy: A Photocopier Master Template ðŸ“„

Imagine Glance as the master copy of a document in a photocopier's memory. Every time someone wants a "copy" (a new VM), the system doesn't hand them the master â€” it makes a **fresh copy-on-write clone** of it, so the original template stays pristine and reusable for the next 1,000 VMs.

### What Glance Stores

- **Image metadata**: name, disk format (qcow2/raw/vmdk/ami), container format, size, checksum, visibility, tags, custom properties.
- **The actual image file bytes**, in a configurable backend (local filesystem, Swift, Ceph RBD, S3-compatible object store â€” most production clouds use Ceph or Swift).

### Image Visibility Types

| Visibility | Meaning |
|---|---|
| `public` | Any project can use it |
| `private` | Only the owning project can use it |
| `shared` | Explicitly shared with specific other projects |
| `community` | Visible to all, but not in default listing |

### CLI Examples

```bash
# Upload a new image
openstack image create "ubuntu-22.04" \
    --file ubuntu-22.04-server-cloudimg-amd64.img \
    --disk-format qcow2 --container-format bare \
    --public

# List images
openstack image list

# Show image details
openstack image show ubuntu-22.04
```

### How Glance Fits into VM Boot

```
  User requests VM with image="ubuntu-22.04"
              â”‚
              â–¼
       nova-compute â”€â”€â–º Glance API: "give me ubuntu-22.04's data"
              â”‚
              â–¼
   Glance streams image bytes (from Ceph/Swift/local backend)
              â”‚
              â–¼
   nova-compute caches it locally, then either:
     (a) uses it directly as the VM's ephemeral root disk (copy-on-write), OR
     (b) hands it to Cinder to create a persistent boot volume from it
```

### Why Copy-on-Write Matters

Most deployments back images with **qcow2** format and use a **copy-on-write (CoW)** backing file mechanism: the VM's actual root disk is a thin delta layered on top of the shared Glance image, so:
- Boot is fast (no full copy needed upfront)
- Storage is efficient (1000 VMs from the same image share the base layers)
- Each VM's writes go only to its own private delta

---

## 11. Cinder â€” Block Storage

### What is Cinder?

Cinder is OpenStack's **block storage service** â€” it provisions and manages **persistent virtual disks (volumes)** that can be attached to VMs, similar to AWS EBS.

### Analogy: A Detachable Storage Locker ðŸ”

A Cinder volume is like a **detachable storage locker on wheels**. You can:
- Roll it up and attach it to VM A (room 101).
- Later detach it, roll it down the hall, and attach it to VM B (room 305) â€” the data persists, independent of any single VM's lifecycle.
- Unlike the VM's own ephemeral disk (which vanishes if the VM is deleted), the locker survives VM deletion.

### Cinder vs Nova Ephemeral Disk

| | Ephemeral disk (from Nova/Glance) | Cinder Volume |
|---|---|---|
| Lifecycle | Tied to the VM â€” deleted when VM deleted | Independent â€” survives VM deletion |
| Portability | Cannot move to another VM | Can detach/attach to different VMs |
| Backend | Local compute node disk (usually) | Dedicated storage backend (LVM, Ceph, SAN, etc.) |
| Snapshots | Limited | First-class Cinder snapshots |
| Use case | Boot disk / scratch space | Databases, persistent app data |

### Architecture

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   API requests â”€â”€â–º â”‚  cinder-api    â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚ cinder-schedulerâ”‚  (picks a backend/pool based on
                    â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜   capacity, capabilities)
                            â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚ cinder-volume   â”‚  (talks to the actual backend driver:
                    â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜   LVM, Ceph RBD, NetApp, Pure, etc.)
                            â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚ Storage Backend â”‚
                    â”‚ (LVM/Ceph/SAN)  â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### CLI Examples

```bash
# Create a 50GB volume
openstack volume create --size 50 my-data-vol

# Attach it to a running VM
openstack server add volume my-vm my-data-vol

# Detach
openstack server remove volume my-vm my-data-vol

# Snapshot a volume
openstack volume snapshot create --volume my-data-vol my-vol-snapshot

# Create a new volume from a snapshot
openstack volume create --snapshot my-vol-snapshot restored-vol
```

### How a Volume Gets Attached (Under the Hood)

1. `nova-compute` calls Cinder's API: "attach volume X to instance Y."
2. Cinder's driver exports the volume via the backend's protocol â€” commonly **iSCSI** (LVM backend) or **RBD** (Ceph backend).
3. `nova-compute`, via libvirt, connects to that exported block device and attaches it as a new disk (`/dev/vdb`) inside the guest.
4. Inside the VM, the guest OS sees a brand-new block device it can partition/format/mount.

### Boot-from-Volume

Instead of ephemeral disk, a VM can boot **directly from a Cinder volume** (created from a Glance image). This is common in production because:
- The VM's root disk can survive host failure and be **migrated/rebuilt** on another host.
- Enables features like **volume-based live migration** and easier backup/snapshot of the OS disk itself.

```bash
openstack server create --volume my-boot-vol --flavor m1.medium my-vm
```

---

## 12. Neutron â€” Networking â­

### What is Neutron?

Neutron is OpenStack's **networking-as-a-service** component. It provides tenants with **software-defined virtual networks** â€” virtual switches, routers, DHCP, floating IPs, security groups, load balancers (via Octavia) â€” all fully API-driven and isolated per-project.

This is the most conceptually dense P0 topic, so we'll build it up from first principles across sections 12â€“26.

### Analogy: The Hotel's Internal Telecom & Wiring System â˜Žï¸

If Nova is "room booking" and Cinder is "storage lockers," **Neutron is the entire electrical/telecom wiring infrastructure of the hotel**:
- Every room (VM) has a phone jack (**port**) wired into the hallway's internal switchboard (**virtual switch / network**).
- Rooms on the same floor can dial each other directly through the internal switchboard (**L2 network, same subnet**).
- To call a room on a different floor, you go through the hotel's PBX exchange (**router**), which knows how to route calls between floors (**subnets**).
- To call outside the hotel (the internet), you go through the PBX's outside line (**router's external gateway + floating IP / SNAT**).
- The hotel's security desk decides who can call which rooms (**security groups / firewall rules**).
- New guests automatically get assigned a room phone extension when they check in (**DHCP**).

### Why Neutron is Marked â­ (Complexity)

Networking is the hardest part of OpenStack conceptually because it spans **multiple OSI layers** (L2 switching, L3 routing, overlay encapsulation) and involves **many moving pieces working together in real time**: `neutron-server` (control plane) plus per-host **agents** (`ovs-agent`, `l3-agent`, `dhcp-agent`, `metadata-agent`) that program the actual **data plane** (Open vSwitch flows, Linux network namespaces, iptables).

### Neutron's High-Level Architecture

```
                       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
     API requests â”€â”€â–º  â”‚    neutron-server     â”‚  (control plane; talks to plugins)
                       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                  â”‚
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚      ML2 Plugin            â”‚  (Modular Layer 2 plugin â€”
                     â”‚  (pluggable type & mech     â”‚   decides encapsulation:
                     â”‚   drivers: OVS, OVN, etc.)  â”‚   VLAN/VXLAN/Geneve)
                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                  â”‚  RPC (RabbitMQ)
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â–¼                        â–¼                        â–¼
 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 â”‚ neutron-       â”‚      â”‚  neutron-l3-   â”‚        â”‚  neutron-dhcp-  â”‚
 â”‚ openvswitch-   â”‚      â”‚  agent         â”‚        â”‚  agent          â”‚
 â”‚ agent          â”‚      â”‚ (runs on       â”‚        â”‚ (runs dnsmasq   â”‚
 â”‚ (runs on every â”‚      â”‚  network node) â”‚        â”‚  per network)   â”‚
 â”‚  compute/net   â”‚      â”‚ programs       â”‚        â”‚                 â”‚
 â”‚  node; programs â”‚      â”‚ routers via    â”‚        â”‚                 â”‚
 â”‚  OVS flows)     â”‚      â”‚ netns + iptablesâ”‚       â”‚                 â”‚
 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Neutron's Core Abstractions (previewed, detailed in next sections)

| Abstraction | What it Represents |
|---|---|
| **Network** | A virtual L2 broadcast domain |
| **Subnet** | An IP address range (CIDR) bound to a network |
| **Port** | A virtual NIC â€” a VM's or router's attachment point to a network |
| **Router** | A virtual L3 device connecting subnets/networks together and to external networks |
| **Floating IP** | A public IP mapped (1:1 NAT) to a VM's private IP |
| **Security Group** | A stateful virtual firewall applied to ports |

### Definitions

- **Control plane (neutron-server + ML2):** decides the *logical* topology and desired state (declared via API).
- **Data plane (agents + OVS/OVN + netns):** actually implements that topology as real flow rules, iptables rules, and namespace configs on each host.

---

## 13. Neutron Networks

### Definition

A **Network** in Neutron is a virtual, isolated **Layer 2 broadcast domain** â€” conceptually equivalent to a VLAN or a physical Ethernet switch's collision/broadcast domain, but entirely software-defined.

### Analogy: A Single Floor's Hallway ðŸ¨

A Neutron network is like one floor of the hotel â€” all rooms (VM ports) on that floor share the same hallway. If you shout down the hallway (broadcast, e.g., ARP), everyone on that floor hears it. Rooms on a different floor (a different network) never hear it directly â€” they'd need to go through the PBX (router) to communicate.

### Key Properties

- Every network has one or more **subnets** attached (the IP ranges usable on that L2 segment).
- Networks are isolated from each other at L2 by default â€” VMs on Network A cannot ARP/broadcast-reach VMs on Network B without a router.
- Implemented under the hood via **VLAN tagging**, **VXLAN**, or **Geneve** tunnels (see section 21) depending on the ML2 type driver configured.

### CLI Example

```bash
openstack network create private-net
openstack network show private-net
openstack network list
```

### Network Types

| Type | Description |
|---|---|
| **Provider network** | Maps directly to a physical network segment the admin defines (e.g., a VLAN on the physical switch) â€” see section 22 |
| **Tenant network** | Created by a regular user, isolated automatically using overlay tech (VXLAN/Geneve) â€” see section 22 |
| **External network** | A special provider network representing "the internet" or a shared corporate network, used as a router's gateway |

---

## 14. Neutron Subnets

### Definition

A **Subnet** is an IP address block (CIDR) associated with a Network â€” it defines the actual IPv4/IPv6 addressing, gateway, and DHCP behavior for that L2 segment.

### Analogy: Room Numbering Scheme on a Floor ðŸ”¢

If the Network is "Floor 3," the Subnet is "rooms are numbered 300â€“399, with the floor's PBX exchange (gateway) at room 300." Every guest checking into that floor gets a room number from that specific range.

### Key Properties

| Field | Meaning |
|---|---|
| `cidr` | The IP range, e.g. `10.0.1.0/24` |
| `gateway_ip` | The IP that acts as the default gateway for hosts on this subnet (usually a router's interface) |
| `allocation_pools` | The sub-range(s) DHCP is allowed to hand out (can exclude reserved IPs) |
| `enable_dhcp` | Whether Neutron's DHCP agent should serve addresses on this subnet |
| `dns_nameservers` | DNS servers pushed to instances via DHCP |
| `host_routes` | Extra static routes pushed via DHCP option 121 |

### CLI Example

```bash
openstack subnet create --network private-net \
    --subnet-range 10.0.1.0/24 \
    --gateway 10.0.1.1 \
    --dns-nameserver 8.8.8.8 \
    --allocation-pool start=10.0.1.10,end=10.0.1.200 \
    private-subnet
```

### One Network, Multiple Subnets

A single Neutron network **can** have multiple subnets (e.g., one IPv4 + one IPv6 subnet, or dual IPv4 ranges) â€” all sharing the same L2 broadcast domain, since Subnet is purely an L3 addressing construct layered on top of the L2 Network.

---

## 15. Neutron Ports

### Definition

A **Port** is a virtual network interface â€” Neutron's representation of a single connection point to a Network. Every VM's vNIC, every router's interface, and every DHCP server's interface is backed by a Port object.

### Analogy: The Phone Jack in Each Room â˜Žï¸

A Port is the actual **phone jack** wired into the wall of a hotel room, connected to that floor's switchboard (the Network). It has:
- A **MAC address** (like the phone's unique hardware serial)
- An **IP address** (like the extension number, assigned from the subnet's pool)
- **Security group rules** attached (like a rule: "this room can only receive calls from the front desk")

### Key Properties

| Field | Meaning |
|---|---|
| `mac_address` | Unique virtual hardware address |
| `fixed_ips` | The IP(s) assigned from the subnet(s), plus which subnet each came from |
| `network_id` | Which network this port belongs to |
| `device_owner` | What kind of entity owns this port (`compute:nova`, `network:router_interface`, `network:dhcp`, etc.) |
| `device_id` | The UUID of the owning resource (instance ID, router ID, etc.) |
| `security_groups` | List of security groups applied to this port |
| `binding:vif_type` | How the port is actually wired into the data plane (e.g., `ovs`, `tap`) |

### CLI Example

```bash
# Create a port explicitly (often Nova does this implicitly during VM boot)
openstack port create --network private-net --fixed-ip subnet=private-subnet,ip-address=10.0.1.50 my-port

# Attach that pre-created port when booting a VM
openstack server create --image ubuntu-22.04 --flavor m1.small \
    --port my-port my-vm
```

### How a Port Becomes "Real"

When a VM boots, Nova requests a port from Neutron (or uses a pre-created one). Neutron:
1. Allocates a MAC + IP.
2. Records the port in its DB.
3. Notifies the `neutron-openvswitch-agent` on the target compute host via RPC.
4. The agent creates a **tap device** and wires it into the local **OVS integration bridge (br-int)**, tagging it with the right internal VLAN so it lands in the correct logical network segment.

```
   VM's vNIC (virtio-net) â”€â”€â–º tap device (e.g. tapXXXX) â”€â”€â–º br-int (OVS) â”€â”€â–º network overlay
```

---

## 16. Neutron Routers

### Definition

A **Router** is a virtual L3 device that connects multiple networks/subnets together and optionally connects a tenant network to an **external network** (providing internet access via SNAT/floating IPs).

### Analogy: The Hotel's PBX Exchange ðŸ“ž

The Router is the PBX switchboard that:
- Connects Floor 1's phone system to Floor 2's phone system (**inter-subnet routing** â€” East-West).
- Connects the whole hotel's internal phone network to the **outside phone line** (**external gateway** â€” North-South).
- Translates internal extensions to a callable outside number when a guest calls out (**SNAT**).
- Routes an incoming outside call to the specific correct room if that room has a direct dial-in number set up (**Floating IP / DNAT**).

### Architecture

```
        External Network (public, "the internet")
                    â”‚
                    â”‚  router's gateway port (qg-xxxx)
                    â–¼
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚   Neutron Router      â”‚   (implemented as a Linux network namespace:
        â”‚   (L3 agent, in a      â”‚    qrouter-<router-id>)
        â”‚   dedicated netns)     â”‚
        â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
        internal ports (qr-xxxx)
              â”‚           â”‚
              â–¼           â–¼
      Subnet A (10.0.1.0/24)   Subnet B (10.0.2.0/24)
        [VM1]  [VM2]              [VM3]  [VM4]
```

### Key Router Concepts

| Concept | Meaning |
|---|---|
| **Internal interface (`qr-` port)** | Connects the router to one internal tenant subnet â€” acts as that subnet's default gateway |
| **Gateway interface (`qg-` port)** | Connects the router to the external network |
| **SNAT (Source NAT)** | Translates outbound VM traffic's private source IP to the router's public IP, so VMs *without* a floating IP can still reach the internet (many-to-one) |
| **DNAT (Destination NAT) via Floating IP** | Translates inbound traffic destined for a public floating IP to a specific VM's private IP (one-to-one) â€” see section 17 |

### CLI Example

```bash
# Create a router
openstack router create my-router

# Set external gateway (connects router to the public/external network)
openstack router set --external-gateway public-net my-router

# Attach an internal subnet interface
openstack router add subnet my-router private-subnet
```

### Distributed Virtual Routing (DVR)

In legacy/centralized Neutron deployments, all router namespaces live on dedicated **network nodes**, creating a bottleneck and single point of failure. **DVR (Distributed Virtual Router)** distributes East-West routing and floating-IP handling directly onto compute nodes, so traffic between two VMs on different subnets â€” even on the same compute host â€” doesn't need to traverse a centralized network node at all.

---

## 17. Floating IPs

### Definition

A **Floating IP** is a publicly-routable IP address from an external network that is **1:1 NAT-mapped** to a specific VM's private, internal fixed IP â€” allowing that VM to be reached directly from outside the cloud (e.g., the internet or corporate network).

### Analogy: A Hotel Room's Direct-Dial Number ðŸ“±

By default, all hotel rooms share the PBX's single outside line for making calls out (SNAT-like) â€” but nobody outside can call *into* a specific room directly. A **floating IP** is like getting that room its own direct-dial phone number: anyone outside can now call that exact room directly, bypassing the front desk.

### How It Works

```
      Internet
         â”‚
         â”‚  destined for 203.0.113.10 (Floating IP)
         â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚   Router      â”‚   DNAT: 203.0.113.10 â”€â”€â–º 10.0.1.50 (VM's fixed IP)
   â”‚  (qrouter-ns) â”‚   SNAT: 10.0.1.50 â”€â”€â–º 203.0.113.10 (for return traffic)
   â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
          â–¼
   VM (fixed IP 10.0.1.50)
```

- Floating IPs are allocated from a pool defined on an **external network**.
- They are a **project-level resource** â€” once allocated to your project, you can associate/disassociate them with different VM ports at will (no need to re-provision).
- Implemented via **iptables DNAT/SNAT rules** inside the router's network namespace (or distributed via DVR's floating-IP namespaces on compute nodes).

### CLI Example

```bash
# Allocate a floating IP from the external network's pool
openstack floating ip create public-net

# Associate it with a VM (or a specific port)
openstack server add floating ip my-vm 203.0.113.10

# Disassociate
openstack server remove floating ip my-vm 203.0.113.10
```

### Floating IP vs SNAT â€” Key Difference

| | SNAT (default router behavior) | Floating IP |
|---|---|---|
| Direction | Outbound only (VM â†’ internet) | Both directions (bidirectional) |
| Mapping | Many VMs share ONE router public IP | One dedicated public IP per VM |
| Inbound reachability | VM cannot be reached from outside | VM directly reachable from outside |
| Typical use | Default for all VMs (egress-only) | Public-facing servers (web servers, bastion hosts) |

---

## 18. Security Groups

### Definition

A **Security Group** is a **stateful, virtual firewall** â€” a named set of inbound/outbound rules applied to one or more Neutron ports (VM vNICs). It's conceptually identical to an AWS Security Group.

### Analogy: The Hotel Room's Guest List at the Door ðŸšª

Each room has a guest list posted at the door (security group rules): "Only room service and the guest's own invited visitors may enter; the guest may call anyone they like." It's a **per-room (per-port)** access control list, not a hallway-wide (network-wide) rule â€” different rooms can have completely different guest lists even on the same floor.

### Key Properties

- **Stateful:** if you allow an outbound connection, the return traffic for that same connection is automatically allowed back in (no need for a matching inbound rule) â€” like a phone call, once you dial out, the response can flow back automatically.
- **Default-deny inbound, default-allow outbound:** by default, all inbound traffic is denied except what's explicitly allowed; all outbound traffic is allowed.
- Rules are defined by: **direction** (ingress/egress), **protocol** (TCP/UDP/ICMP), **port range**, and **remote source** (either a CIDR or another security group).
- A port can have **multiple security groups** attached â€” rules are additive (union of all allow rules).

### CLI Example

```bash
# Create a security group
openstack security group create web-servers

# Allow inbound SSH (22) from anywhere
openstack security group rule create --proto tcp --dst-port 22 \
    --remote-ip 0.0.0.0/0 web-servers

# Allow inbound HTTP (80) from anywhere
openstack security group rule create --proto tcp --dst-port 80 \
    --remote-ip 0.0.0.0/0 web-servers

# Allow all traffic FROM instances in the same security group (common for app-tier â†” db-tier)
openstack security group rule create --proto tcp --remote-group web-servers web-servers

# Apply to a VM
openstack server create ... --security-group web-servers my-vm
```

### Security Groups vs Firewall-as-a-Service (FWaaS)

| | Security Groups | FWaaS |
|---|---|---|
| Scope | Per-port (per-VM) | Per-router (perimeter) |
| Enforcement point | On the compute node hosting the VM (via `iptables`/`ovs` conntrack flows) | On the router's network namespace |
| Analogy | Guest list at each room's door | Security checkpoint at the hotel's main entrance |

### Where Security Groups Are Enforced (Data Plane)

On the compute node, the `neutron-openvswitch-agent` translates security group rules into either:
- **iptables rules** applied to the VM's tap device (older "hybrid" driver), or
- **OVS connection-tracking (conntrack) flow rules** directly in `br-int` (modern "openvswitch firewall driver," more performant).

---

## 19. DHCP

### Definition

**DHCP (Dynamic Host Configuration Protocol)** is how VMs automatically receive their IP address, gateway, DNS servers, and other network config when they boot â€” without manual configuration inside the guest OS.

### Analogy: Automatic Room Check-In ðŸ—ï¸

When a guest checks into the hotel, they don't pick their own room number â€” the front desk (DHCP server) automatically assigns them one from the available pool for that floor, tells them where the elevator (gateway) is, and gives them the hotel directory (DNS servers) â€” all automatically, the moment they arrive.

### How Neutron Implements DHCP

Neutron doesn't write a custom DHCP server â€” it uses the battle-tested **`dnsmasq`** program, running one dedicated instance **per network**, inside its own **network namespace** (`qdhcp-<network-id>`), managed by the `neutron-dhcp-agent`.

```
        Network "private-net" (subnet 10.0.1.0/24)
                    â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚  qdhcp-<net-id> netns    â”‚
        â”‚   running dnsmasq        â”‚  â—„â”€â”€ acts as DHCP server for this subnet
        â”‚   IP: 10.0.1.2 (dhcp port)â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                     â”‚  (connected to same br-int as VM ports)
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â–¼            â–¼            â–¼
      [VM1]        [VM2]        [VM3]
   (DHCPDISCOVER broadcast reaches dnsmasq via the shared L2 segment)
```

### DHCP Handshake (the classic DORA process)

1. **Discover** â€” VM boots, broadcasts "is there a DHCP server here?"
2. **Offer** â€” `dnsmasq` (in the `qdhcp` namespace) responds: "here's IP 10.0.1.15, gateway 10.0.1.1, DNS 8.8.8.8."
3. **Request** â€” VM says "I'll take that IP."
4. **Acknowledge** â€” `dnsmasq` confirms, VM configures its NIC.

### Why It's Namespaced Per-Network

Because IP ranges can **overlap** between different tenants' private networks (e.g., two different projects both using `10.0.0.0/24`), each network's DHCP server must be fully isolated in its own network namespace to avoid IP/ARP collisions â€” this is the same reason routers get their own namespace (see section 23).

### Metadata Service Tie-In

The DHCP agent (or a separate metadata agent) also often helps VMs reach the special **metadata service** at `169.254.169.254`, which provides cloud-init data (SSH keys, hostname, user-data scripts) â€” this is delivered via a route pushed by DHCP option 121, pointing that special IP at the router/DHCP namespace, which proxies the request to `nova-metadata-api`.

---

## 20. L2 vs L3 Networking

### The Fundamental Distinction

| | Layer 2 (Data Link) | Layer 3 (Network) |
|---|---|---|
| Addressing | MAC addresses | IP addresses |
| Scope | Single broadcast domain / segment | Across multiple segments (routed) |
| OpenStack construct | Neutron **Network** | Neutron **Router** connecting Subnets |
| Analogy | One floor's hallway (everyone hears a shout) | The PBX exchange connecting floors |
| Devices | Switches, bridges | Routers |
| Broadcast/ARP | Works natively (ARP "who has this IP?" reaches everyone) | Does NOT cross without a router; each segment ARPs independently |

### Analogy Recap: Floors and the PBX

- **L2 = same floor.** VM1 (Room 301) and VM2 (Room 305) on Floor 3 can shout down the hallway directly â€” an ARP broadcast for "who has 10.0.1.5?" is heard by everyone on that floor instantly, no routing needed.
- **L3 = different floors.** VM3 on Floor 4 wants to talk to VM1 on Floor 3 â€” it can't just shout, because sound doesn't travel between floors. It has to place a call through the PBX (router), which knows the "extension range" (subnet CIDR) for each floor and forwards the call appropriately.

### Why This Matters for Traffic Flow

- Two VMs on the **same Neutron network** (even different subnets, if multiple are attached) communicate via pure **L2 switching** â€” packets go VM â†’ br-int â†’ (same or different compute host via VXLAN) â†’ br-int â†’ VM, **no router hop needed** if they're on the identical L2 segment.
- Two VMs on **different Neutron networks** (different L2 segments) must traverse a **Neutron Router** â€” even if physically running on the very same compute host â€” because routing is a logical L3 function tied to the router's namespace/flows.

```
   Same Network (L2):           Different Networks (L3, needs router):
   VM1 â”€â”€â–º br-int â”€â”€â–º VM2       VM1 â”€â”€â–º br-int â”€â”€â–º qrouter-ns â”€â”€â–º br-int â”€â”€â–º VM3
   (direct switching)            (routed hop through the Neutron Router)
```

---

## 21. VLAN / VXLAN / Geneve

### The Problem These Solve

Neutron networks need to be **isolated** from each other at L2, but a physical network only has limited native isolation mechanisms (802.1Q VLAN tags max out at 4094), while a cloud might need **tens of thousands** of isolated tenant networks. VXLAN/Geneve solve this scale problem using **overlay encapsulation**.

### VLAN (802.1Q)

- A **VLAN tag** (12-bit ID, 1â€“4094) is inserted into the Ethernet frame header to logically segment a physical switch into multiple isolated broadcast domains.
- **Limitation:** only ~4094 VLANs possible on a single physical network â€” not enough for large multi-tenant clouds.
- Typically used for **provider networks** where the admin maps Neutron networks directly onto physical VLANs already configured on the datacenter's switches.

### VXLAN (Virtual Extensible LAN)

- An **overlay/tunneling protocol**: the entire original Ethernet frame (L2) is encapsulated inside a UDP packet and sent across the existing L3 physical network between compute hosts.
- Uses a **24-bit VNI (VXLAN Network Identifier)** â†’ supports **16 million+** isolated segments, solving VLAN's 4094 limit.
- This is how two VMs on the same tenant network, but on **physically different compute hosts**, can appear to be on the same L2 segment â€” their traffic is tunneled host-to-host over the datacenter's ordinary IP fabric.

### Geneve (Generic Network Virtualization Encapsulation)

- A newer, more **flexible** overlay protocol (like VXLAN but with extensible TLV-based headers), preferred by **OVN** (Open Virtual Network) deployments.
- Same core idea as VXLAN (L2-over-L3 tunneling with a large ID space) but designed to carry richer metadata for future extensibility.

### Analogy: Mail Envelopes ðŸ“¬âœ‰ï¸

- **VLAN tag** = writing a colored sticker on an internal hotel envelope so the internal mail sorter knows "this goes to Floor 3's mail slot only" â€” works only *within* the same building's internal mail system.
- **VXLAN/Geneve** = putting the entire internal hotel envelope (with its own internal addressing) inside a **second, outer envelope** addressed via the regular postal system (the physical IP network) so it can be shipped to a **different hotel building entirely** (a different physical compute host), then unwrapped there and delivered internally as if it never left.

### Comparison Table

| | VLAN | VXLAN | Geneve |
|---|---|---|---|
| Mechanism | Ethernet frame tag | L2-over-UDP/IP tunnel | L2-over-UDP/IP tunnel (extensible) |
| Max segments | 4,094 | ~16 million | ~16 million |
| Requires special physical switch config | Yes (trunk ports, VLAN config) | No (just IP reachability between hosts) | No |
| Common driver | ML2 `vlan` type driver | ML2 `vxlan` type driver | OVN's native encapsulation |
| Typical use | Provider networks | Tenant (self-service) networks | Tenant networks in OVN deployments |

### Diagram: VXLAN Tunnel Between Two Compute Hosts

```
  Compute Host A                                Compute Host B
  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚   VM1      â”‚                                 â”‚   VM2      â”‚
  â”‚ 10.0.1.5   â”‚                                 â”‚ 10.0.1.6   â”‚
  â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜                                 â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
        â”‚ (original L2 frame)                          â”‚
        â–¼                                               â–¼
  br-int / br-tun                                 br-int / br-tun
        â”‚  encapsulate in VXLAN (VNI=5001)              â”‚
        â”‚  outer UDP/IP packet:                          â”‚
        â”‚  src=192.168.50.10 dst=192.168.50.20           â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º Physical IP Network â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                (ordinary L3 routing/switching, unaware
                 of tenant VLANs/segments at all)
```

---

## 22. Provider vs Tenant Networks

### Definition

| | Provider Network | Tenant (Self-Service) Network |
|---|---|---|
| Who creates it | Cloud **admin** | Regular **project user** |
| Maps to | An existing physical network segment (VLAN/flat) the admin has pre-configured on datacenter switches | An abstract overlay segment (VXLAN/Geneve), created on-demand |
| Physical awareness | Admin must know the physical topology | Fully virtual â€” no physical network config needed per-network |
| Typical use | External/internet-facing networks, shared infra networks | Private per-project networks for app tiers |

### Analogy

- **Provider network** = a hotel's pre-wired conference room that's *physically* patched into the building's main trunk line by the building electrician (admin) ahead of time â€” a fixed, real physical resource.
- **Tenant network** = a guest, using the hotel's self-service app, spins up their own **virtual conference call bridge** on demand â€” no physical wiring involved, just a logical construct the PBX (Neutron/OVS) manages internally.

### CLI Examples

```bash
# Admin creates a provider (VLAN) network, mapped to physical VLAN 200
openstack network create --provider-network-type vlan \
    --provider-physical-network physnet1 \
    --provider-segment 200 \
    provider-vlan200

# Regular user creates a self-service (VXLAN) tenant network â€” no provider details needed
openstack network create my-app-network
openstack subnet create --network my-app-network --subnet-range 10.0.5.0/24 my-app-subnet
```

### Why Both Exist Together

A typical deployment uses a **provider network as the "external network"** (the internet-facing uplink used by routers for SNAT/floating IPs), while all the isolated per-application private networks are **tenant networks**. This gives:
- **Admin control** over anything touching physical/shared infrastructure (external connectivity).
- **Self-service freedom** for regular users to create as many isolated private networks as they need, without ever touching physical switch config.

---

## 23. Network Namespaces

### Definition

A **Linux network namespace (netns)** is a kernel feature that gives a process (or group of processes) its **own completely isolated network stack** â€” its own interfaces, routing table, iptables rules, and even its own `127.0.0.1` loopback â€” separate from the host's default namespace and from every other namespace.

### Why Neutron Needs This

Because different tenants can have **overlapping private IP ranges** (two projects both using `10.0.0.0/24`), Neutron **cannot** just run one shared DHCP server or one shared router on the host â€” there'd be IP collisions and ambiguous routing. Network namespaces solve this by giving **each router and each network's DHCP server its own fully isolated mini-Linux-network-stack**, as if it were a completely separate machine.

### Analogy: Separate Phone Systems in Parallel Universes ðŸŒ€

Imagine the hotel actually contains **many parallel-universe copies of "Floor 3,"** each belonging to a different guest group, each with its own independent PBX exchange and room numbering â€” even though two different universes might both have a "Room 301," calls never get confused, because each universe's phone system is entirely self-contained and walled off from the others. A network namespace is exactly this: a private, self-contained network universe.

### The Two Main Namespace Types in Neutron

| Namespace prefix | Purpose |
|---|---|
| `qrouter-<router-id>` | One per Neutron Router â€” contains the router's interfaces, routing table, and NAT/iptables rules |
| `qdhcp-<network-id>` | One per Network with DHCP enabled â€” contains the `dnsmasq` process serving that network |
| `fip-<router-id>` (DVR) | Floating-IP namespace on compute nodes, used in Distributed Virtual Routing setups |

### Inspecting Namespaces (on a Network Node)

```bash
# List all network namespaces on this host
ip netns list
# qrouter-3f9e2a1b-...
# qdhcp-7c1d4e2f-...

# Run a command INSIDE a specific namespace (e.g., check the router's routing table)
sudo ip netns exec qrouter-3f9e2a1b-... ip route
sudo ip netns exec qrouter-3f9e2a1b-... iptables -t nat -L -n
```

### Diagram: Two Overlapping-CIDR Tenants, Fully Isolated

```
  Host (default namespace / OVS br-int)
   â”‚
   â”œâ”€â”€ qrouter-tenantA-ns  (10.0.0.0/24, tenant A's own gateway 10.0.0.1)
   â”‚        connects Tenant A's private network to shared external net
   â”‚
   â””â”€â”€ qrouter-tenantB-ns  (10.0.0.0/24, tenant B's own gateway 10.0.0.1)
            connects Tenant B's private network to shared external net

   Even though BOTH use 10.0.0.0/24 internally, their namespaces
   never see each other's routing tables or interfaces â€” total isolation.
```

---

## 24. East-West vs North-South Traffic

### Definitions

- **North-South traffic:** traffic flowing **into or out of the datacenter/cloud** â€” e.g., a user on the internet hitting a VM's floating IP, or a VM reaching out to the public internet. Conceptually flows "up and down" on a typical network diagram (cloud/internet drawn at the top).
- **East-West traffic:** traffic flowing **between VMs/servers within the datacenter** â€” e.g., a web-tier VM talking to a database-tier VM. Conceptually flows "sideways" across the diagram.

### Analogy: Hotel Guests vs. Room Service Staff ðŸ›Žï¸

- **North-South** = guests arriving from outside the hotel (the street/internet) and going up to their rooms, or guests leaving the hotel to go outside â€” traffic crossing the hotel's front door boundary.
- **East-West** = room service staff moving between rooms and floors *within* the hotel, or two guests on different floors calling each other internally â€” traffic that never leaves the building.

### Why the Distinction Matters

| | North-South | East-West |
|---|---|---|
| Typical volume in modern clouds | Smaller % | **Majority** â€” especially with microservices, most traffic is service-to-service inside the DC |
| Security tooling focus | Perimeter firewalls, floating IP/NAT rules, WAFs | Security Groups, micro-segmentation, service mesh |
| OpenStack components involved | Router's gateway interface, Floating IPs, SNAT | br-int L2 switching, or Router's internal interfaces for inter-subnet |
| Performance concern | Bandwidth to/from external uplink | Latency & throughput between compute hosts (east-west often dominates datacenter fabric design) |

### Diagram

```
                     Internet (North)
                          â”‚
                 â•â•â•â•â•â•â•â•â•â–¼â•â•â•â•â•â•â•â•â•   â—„â”€â”€ NORTH-SOUTH traffic
                     Router / FIP
                          â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â–¼                                   â–¼
     [Web VM] â—„â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â–º [DB VM]   â—„â”€â”€ EAST-WEST traffic
                  (same or different
                   compute hosts, via
                   br-int/VXLAN or router)
```

---

## 25. VM â†’ Internet Traffic Flow

### Scenario

A VM (10.0.1.5, no floating IP) sends a request to `8.8.8.8` on the public internet.

### Step-by-Step Flow

```
 1. VM's guest OS sends packet: src=10.0.1.5, dst=8.8.8.8
                â”‚
                â–¼
 2. Packet exits VM's vNIC â†’ tap device â†’ br-int (OVS integration bridge)
    br-int sees dst is NOT on the local L2 segment â†’ must go to the
    subnet's default gateway (the Neutron Router's internal "qr-" port)
                â”‚
                â–¼
 3. Packet arrives at qrouter-<id> namespace's internal interface
    (e.g., qr-abc, IP 10.0.1.1)
                â”‚
                â–¼
 4. Inside the router namespace, the kernel's routing table sends it out
    the gateway interface (qg-xyz) toward the external network
                â”‚
                â–¼
 5. SNAT (iptables MASQUERADE rule) rewrites the packet:
    src=10.0.1.5  â”€â”€â–º  src=<router's public/floating gateway IP>, e.g. 203.0.113.5
    (dst stays 8.8.8.8)
                â”‚
                â–¼
 6. Packet leaves via br-ex / physical NIC of the network node,
    out onto the real physical/external network toward the internet
                â”‚
                â–¼
 7. Response comes back to 203.0.113.5, router's conntrack state
    reverses the NAT (un-SNAT), delivers back to 10.0.1.5 internally
```

### Key Point: This is SNAT, Not Floating IP

Because this VM has **no floating IP**, it uses the router's shared **SNAT** â€” many VMs behind the same router share one public source IP for outbound traffic (many-to-one NAT), just like a home router's NAT for all devices in a house.

---

## 26. Internet â†’ VM Traffic Flow

### Scenario

An external client on the internet connects to a VM's **Floating IP** `203.0.113.10` (mapped to VM's fixed IP `10.0.1.5`) on port 80.

### Step-by-Step Flow

```
 1. External client sends packet: src=<client-ip>, dst=203.0.113.10:80
                â”‚
                â–¼
 2. Packet arrives at the network node's external interface (br-ex),
    routed there because 203.0.113.10 is advertised/routed to this
    router's gateway port
                â”‚
                â–¼
 3. Packet enters qrouter-<id> namespace via its gateway interface (qg-xyz)
                â”‚
                â–¼
 4. DNAT (iptables PREROUTING rule, installed when the floating IP was
    associated) rewrites the destination:
    dst=203.0.113.10  â”€â”€â–º  dst=10.0.1.5
    (src stays <client-ip>)
                â”‚
                â–¼
 5. Router's routing table sends the now-rewritten packet out its
    internal interface (qr-abc) toward subnet 10.0.1.0/24
                â”‚
                â–¼
 6. Packet traverses br-int (possibly a VXLAN tunnel if the router
    namespace lives on a different physical host than the VM)
                â”‚
                â–¼
 7. Packet arrives at VM's tap device â†’ vNIC â†’ guest OS's web server
    receives connection on port 80, appearing to come from <client-ip>
                â”‚
                â–¼
 8. Response packet reverses the whole path; conntrack un-DNATs it
    back to appear as if it came from 203.0.113.10
```

### Security Group Checkpoint

Critically, **before** the packet is delivered to the VM's vNIC, it also passes the security-group-enforced conntrack/iptables rules on the **compute host** â€” if no rule allows inbound TCP/80, the packet is dropped right there, even if the router's DNAT succeeded.

### Diagram Summary: The Full Round Trip

```
  Internet Client
        â”‚  dst=203.0.113.10:80
        â–¼
   br-ex (network node's external bridge)
        â–¼
   qrouter-ns:  DNAT 203.0.113.10 â†’ 10.0.1.5
        â–¼
   br-int / VXLAN tunnel (if cross-host)
        â–¼
   Compute host: Security Group check (allow tcp/80?)
        â–¼
   VM's tap device â†’ vNIC â†’ Guest OS â†’ Web Server (port 80)
```

---

## 27. VM Creation â€” Complete End-to-End Flow

This section ties together **every** service and concept covered above into one master sequence â€” the single most important "systems design" narrative in OpenStack.

### The Full Sequence Diagram

```
 User                nova-api        nova-conductor     nova-scheduler      Placement
  â”‚  POST /servers        â”‚                  â”‚                  â”‚                â”‚
  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º                  â”‚                  â”‚                â”‚
  â”‚                       â”‚  validate quota,  â”‚                  â”‚                â”‚
  â”‚                       â”‚  create DB record  â”‚                  â”‚                â”‚
  â”‚                       â”‚  (state=BUILD)     â”‚                  â”‚                â”‚
  â”‚                       â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚                  â”‚                â”‚
  â”‚                       â”‚                   â”‚  request host    â”‚                â”‚
  â”‚                       â”‚                   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º                â”‚
  â”‚                       â”‚                   â”‚                  â”‚  query resource â”‚
  â”‚                       â”‚                   â”‚                  â”‚  inventory      â”‚
  â”‚                       â”‚                   â”‚                  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
  â”‚                       â”‚                   â”‚                  â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
  â”‚                       â”‚                   â”‚                  â”‚ candidate hosts â”‚
  â”‚                       â”‚                   â”‚                  â”‚  run Filters +   â”‚
  â”‚                       â”‚                   â”‚                  â”‚  Weighers        â”‚
  â”‚                       â”‚                   â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â†’ host-42       â”‚
  â”‚                       â”‚                   â”‚  claim resources  â”‚                â”‚
  â”‚                       â”‚                   â”‚  on host-42 via   â”‚                â”‚
  â”‚                       â”‚                   â”‚  Placement         â”‚                â”‚
  â”‚  202 Accepted          â”‚                   â”‚                  â”‚                â”‚
  â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                   â”‚                  â”‚                â”‚
  (instance UUID returned; polling continues via GET /servers/{id})

                       nova-conductor
                             â”‚  RPC: "build_and_run_instance"
                             â–¼
                     nova-compute (host-42)
                             â”‚
     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
     â–¼                       â–¼                        â–¼
  Glance API             Neutron API               Cinder API
 "fetch image data"    "create port for      "create/attach boot
  (or use local cache)   this instance,        volume" (if boot-
                          assign IP+MAC"       from-volume)
     â”‚                       â”‚                        â”‚
     â–¼                       â–¼                        â–¼
 image bytes cached    port created; agent      volume created;
 locally (qcow2)       notified to wire the      exported via
                        tap device into           iSCSI/RBD
                        br-int with correct
                        VLAN/VXLAN tag

                             â”‚  (all three complete)
                             â–¼
                    nova-compute calls libvirt:
                    - define the VM's XML domain
                      (CPU/RAM from flavor, disk from
                       Cinder or local qcow2, NIC = tap device)
                    - libvirt/KVM boots the VM
                             â”‚
                             â–¼
                    cloud-init inside the VM boots,
                    fetches SSH keys/userdata from
                    169.254.169.254 (metadata service,
                    proxied via DHCP/router namespace)
                             â”‚
                             â–¼
                 nova-compute reports state=ACTIVE
                 back through conductor â†’ DB updated
                             â”‚
                             â–¼
                User polls GET /servers/{id} â†’ sees "ACTIVE"
                with an assigned fixed IP
```

### Narrative Walkthrough (Plain English)

1. **User submits request** (`openstack server create ...`) to `nova-api`, authenticated via a Keystone token.
2. `nova-api` validates the request against the project's **quotas**, writes an initial instance record (`BUILD` state), and returns immediately (async â€” HTTP 202 Accepted). This is a classic **control-plane-first, data-plane-later** pattern.
3. `nova-conductor` orchestrates: asks `nova-scheduler` to pick a host.
4. `nova-scheduler` queries **Placement** for hosts with enough free VCPU/RAM/disk (per the chosen **Flavor**), applies **Filters** (hard constraints) then **Weighers** (soft preferences), returns the winning host.
5. `nova-conductor` tells that host's `nova-compute` to build the instance.
6. `nova-compute` fans out three parallel calls:
   - **Glance**: fetch the OS image bytes (or find them already cached locally).
   - **Neutron**: create a **Port** â€” allocates an IP from the chosen **Subnet**, a MAC address, wires up security groups, and (crucially) instructs the local `neutron-openvswitch-agent` to plug a new **tap device** into **br-int**, tagged appropriately for VLAN/VXLAN isolation.
   - **Cinder** (if boot-from-volume): creates/attaches a persistent volume as the root disk.
7. `nova-compute` builds a **libvirt domain XML** describing the VM (vCPUs/RAM from the flavor, disk, NIC = the tap device) and asks **libvirt/KVM** to actually boot it.
8. Inside the guest, **cloud-init** runs, reaching out to the special metadata IP `169.254.169.254` â€” this request is intercepted by the DHCP/router namespace and proxied to `nova-metadata-api`, delivering SSH keys, hostname, and any user-data script.
9. Once boot succeeds, `nova-compute` reports state **ACTIVE** back up through the conductor, updating the central DB.
10. The user (polling or via event notification) sees the instance is `ACTIVE` with an assigned IP â€” ready to use.

### Why This "Fan-Out" Design Matters

Notice how **Nova never directly manipulates networking or storage** â€” it always calls Neutron's and Cinder's own APIs, exactly as an external user would. This is the microservices principle from Section 1 in action: **strict separation of concerns**, each service owning its own domain completely, coordinated (not centralized) by Nova as the orchestrator.

---

## 28. OpenStack CLI

### What is the OpenStack CLI?

The `openstack` command is a **unified command-line client** that wraps the REST APIs of every core service (Nova, Neutron, Cinder, Glance, Keystone, etc.) into one consistent tool â€” so you don't need separate `nova`, `neutron`, `cinder` CLI binaries (which were the old, now-deprecated, per-project clients).

### Authentication â€” the `clouds.yaml` / RC file

Before using the CLI, you need credentials. Two common approaches:

**1. Source an OpenStack RC file (classic):**
```bash
source openrc.sh
# sets env vars: OS_AUTH_URL, OS_USERNAME, OS_PASSWORD,
#                OS_PROJECT_NAME, OS_USER_DOMAIN_NAME, etc.
```

**2. Use `clouds.yaml` (modern, preferred):**
```yaml
clouds:
  mycloud:
    auth:
      auth_url: https://keystone.example.com:5000/v3
      username: alice
      password: ${OS_PASSWORD}
      project_name: dev
      user_domain_name: Default
      project_domain_name: Default
    region_name: RegionOne
```
```bash
openstack --os-cloud mycloud server list
```

### Command Structure

```
openstack <resource> <action> [options] [resource-name-or-id]
```

Examples:
```bash
openstack server list
openstack server create --image ubuntu-22.04 --flavor m1.small --network net1 vm1
openstack network create net1
openstack subnet create --network net1 --subnet-range 10.0.0.0/24 subnet1
openstack router create router1
openstack security group rule create --proto tcp --dst-port 22 default
openstack volume create --size 10 vol1
openstack image list
openstack project create dev
openstack user create --project dev alice
openstack role add --user alice --project dev member
```

### Useful Global Options

| Flag | Purpose |
|---|---|
| `--os-cloud <name>` | Use a named cloud from `clouds.yaml` |
| `-f json` / `-f yaml` / `-f table` | Output formatting (great for scripting with `jq`) |
| `--debug` | Show full HTTP request/response â€” invaluable for learning/troubleshooting |
| `--os-region-name` | Target a specific region in multi-region deployments |

### Debugging Tip

```bash
openstack server create ... --debug
```
This prints the **exact REST API calls** being made under the hood â€” an excellent way to learn the mapping between CLI commands and the raw API (which leads directly into section 29).

---

## 29. OpenStack REST APIs

### The Foundation

Every single OpenStack action â€” whether from the CLI, Horizon dashboard, or a Python SDK â€” ultimately becomes an **HTTP REST API call** to the relevant service's endpoint. Understanding this is key to understanding OpenStack as "just a set of well-designed REST services."

### The Universal Pattern: Auth First, Then Act

```
 Step 1: Authenticate with Keystone
   POST https://keystone.example.com:5000/v3/auth/tokens
   Body: { "auth": { "identity": {...}, "scope": { "project": {...} } } }
   Response headers include: X-Subject-Token: <token>
   Response body includes: the SERVICE CATALOG (list of every service's endpoint URLs)

 Step 2: Call any service, using that token
   GET https://nova.example.com:8774/v2.1/servers
   Headers: X-Auth-Token: <token>
```

### Example: Creating a VM via Raw REST (what the CLI does internally)

```http
POST /v2.1/servers HTTP/1.1
Host: nova.example.com:8774
X-Auth-Token: gAAAAABk...
Content-Type: application/json

{
  "server": {
    "name": "my-vm",
    "imageRef": "b8f7a1e2-...",
    "flavorRef": "2",
    "networks": [{ "uuid": "d32019d3-..." }],
    "security_groups": [{ "name": "default" }],
    "key_name": "mykey"
  }
}
```

Response:
```json
{
  "server": {
    "id": "e9ad4923-...",
    "status": "BUILD",
    "links": [ ... ]
  }
}
```

### Service Catalog â€” How Clients Find Endpoints

After authenticating, Keystone returns a catalog like:

```json
{
  "catalog": [
    { "type": "compute", "name": "nova",
      "endpoints": [{ "interface": "public", "url": "https://nova.example.com:8774/v2.1" }] },
    { "type": "network", "name": "neutron",
      "endpoints": [{ "interface": "public", "url": "https://neutron.example.com:9696" }] },
    { "type": "volumev3", "name": "cinder",
      "endpoints": [{ "interface": "public", "url": "https://cinder.example.com:8776/v3" }] },
    { "type": "image", "name": "glance",
      "endpoints": [{ "interface": "public", "url": "https://glance.example.com:9292" }] }
  ]
}
```

This is exactly how a client (CLI, SDK, Horizon) knows *where* to send a "create server" request without hardcoding URLs â€” it's fully **service-discovery driven**.

### API Versioning

OpenStack APIs are versioned in the URL path (`/v2.1/`, `/v3/`) and support **microversions** (e.g., `OpenStack-API-Version: compute 2.79`) that allow incremental feature additions without breaking older clients â€” a request without a microversion header gets the minimum supported behavior.

### SDKs

Instead of raw HTTP, most automation uses:
- **`openstacksdk`** (Python) â€” the modern unified SDK, what the `openstack` CLI itself is built on.
- **Terraform's `openstack` provider** â€” for infrastructure-as-code.
- **Ansible's `openstack.cloud` collection** â€” for playbook-driven automation.

---

## 30. Projects / Tenants / Quotas / Availability Zones

### Projects / Tenants (Recap + Depth)

As covered in Section 4, a **Project** (historically called "Tenant" â€” the terms are interchangeable in OpenStack) is the fundamental **unit of resource ownership and isolation**. Every VM, network, volume, and image (unless public/shared) belongs to exactly one project.

**Analogy:** Each project is like a **separate corporate account** at the hotel â€” Company A's bookings, room service charges, and phone bills are entirely separate from Company B's, even though they're staying in the same physical hotel.

### Quotas

**Quotas** are per-project (and optionally per-user) limits on how many resources can be consumed â€” preventing any single tenant from exhausting the shared physical infrastructure.

| Quota | Example Default |
|---|---|
| Instances | 10 |
| VCPUs | 20 |
| RAM | 51200 MB |
| Volumes | 10 |
| Volume storage (GB) | 1000 |
| Floating IPs | 10 |
| Security Groups | 10 |
| Networks | 10 |
| Ports | 50 |

```bash
# View current quotas for a project
openstack quota show dev

# Update a quota (admin only)
openstack quota set --instances 50 --cores 100 --ram 204800 dev
```

**Analogy:** Quotas are like a hotel corporate account's **credit limit** â€” "Company A can book at most 50 rooms and spend at most $X on room service at any one time," preventing one client from starving resources for everyone else.

### Availability Zones (AZs)

An **Availability Zone** is a logical grouping of compute/storage hosts, typically aligned with **physical failure domains** â€” separate power feeds, separate racks, separate rooms, or even separate buildings/datacenters.

**Purpose:** let users deliberately **spread** critical workloads across independent failure domains, so a single power/rack/host failure doesn't take down every replica of a service.

```bash
# List availability zones
openstack availability zone list

# Create a VM in a specific AZ
openstack server create --availability-zone AZ2 --image ubuntu-22.04 \
    --flavor m1.small --network net1 my-vm
```

**Analogy:** If the hotel has three separate buildings (Building A, B, C) each with **independent power and internet uplinks**, an Availability Zone is "which building." A savvy corporate guest books their team's redundant meeting rooms **across different buildings** â€” so if Building A loses power, Building B and C's meetings continue uninterrupted.

### How AZs Interact with Scheduling

Availability Zone is one of the **hard filters** in the Nova Scheduler pipeline (Section 6) â€” the `AvailabilityZoneFilter` eliminates any host not in the requested AZ before weighing even begins. Similarly, Cinder and Neutron both support their own AZ concepts for volumes and networks, letting you build fully failure-domain-aware architectures across compute, storage, and network simultaneously.

### Putting It All Together: The Multi-Tenancy Stack

```
        Domain ("CompanyX")
              â”‚
     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”
     â–¼                  â–¼
  Project "dev"     Project "prod"
     â”‚                  â”‚
  Quota: 10 VMs      Quota: 200 VMs
     â”‚                  â”‚
  â”Œâ”€â”€â”´â”€â”€â”            â”Œâ”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â–¼     â–¼            â–¼              â–¼
 AZ1   AZ2          AZ1            AZ2
 (VMs) (VMs)     (prod VMs,    (prod VMs,
                  replica 1)    replica 2 â€”
                                 spread for HA)
```

---

## Summary Cheat-Sheet

| Concept | One-Line Definition |
|---|---|
| **Keystone** | Identity, tokens, RBAC, service catalog |
| **Nova** | Orchestrates VM lifecycle across compute hosts |
| **Nova Scheduler** | Filters + weighs hosts to pick VM placement |
| **Glance** | Stores/serves VM disk images |
| **Cinder** | Persistent, attachable block storage volumes |
| **Neutron** | Software-defined networking: networks, subnets, ports, routers |
| **Network** | Virtual L2 broadcast domain |
| **Subnet** | IP addressing (CIDR) bound to a network |
| **Port** | A virtual NIC â€” VM/router's attachment point |
| **Router** | Virtual L3 device connecting subnets + external access |
| **Floating IP** | 1:1 NAT mapping public IP â†” VM's private IP |
| **Security Group** | Stateful per-port virtual firewall |
| **DHCP (dnsmasq per-network)** | Auto-assigns IP/gateway/DNS to booting VMs |
| **VLAN** | Physical-switch-based L2 isolation (4094 max) |
| **VXLAN/Geneve** | Overlay tunneling for massive-scale L2 isolation over L3 |
| **Namespace (netns)** | Isolated per-router/per-network mini network stack |
| **North-South** | Traffic crossing the cloud boundary (internet â†” VM) |
| **East-West** | Traffic between VMs inside the cloud |
| **Flavor** | Predefined VM hardware sizing template |
| **Project/Tenant** | Isolated resource-ownership namespace |
| **Quota** | Per-project resource consumption limits |
| **Availability Zone** | Logical failure-domain grouping of hosts |

---

*End of Part 1 â€” P0 Must-Know Topics. This document covers the architectural foundation needed before moving on to Part 2 (advanced topics: HA, Octavia LBaaS, Heat orchestration, Ceph integration, live migration internals, and OVN).*
# OpenStack Deep Dive â€” Part 2
### Load Balancing, Storage, Virtualization, Messaging, HA, Orchestration, IaC, and Kubernetes Integration

---

## Table of Contents

1. [Octavia â€” Load Balancing](#1-octavia--load-balancing)
2. [Load Balancer â†’ Listener â†’ Pool â†’ Member](#2-load-balancer--listener--pool--member)
3. [VIP & Health Monitors](#3-vip--health-monitors)
4. [L4 vs L7 Load Balancing](#4-l4-vs-l7-load-balancing)
5. [Ceph Integration](#5-ceph-integration)
6. [Cinder + Ceph Architecture](#6-cinder--ceph-architecture)
7. [KVM / QEMU](#7-kvm--qemu)
8. [RabbitMQ â€” OpenStack Messaging](#8-rabbitmq--openstack-messaging)
9. [MariaDB / Galera](#9-mariadb--galera)
10. [Memcached](#10-memcached)
11. [HAProxy](#11-haproxy)
12. [OpenStack Control Plane HA](#12-openstack-control-plane-ha)
13. [Heat â€” Orchestration](#13-heat--orchestration)
14. [Terraform + OpenStack](#14-terraform--openstack)
15. [Ansible + OpenStack](#15-ansible--openstack)
16. [OpenStack SDKs](#16-openstack-sdks)
17. [Kubernetes on OpenStack](#17-kubernetes-on-openstack)
18. [OpenStack Cloud Controller Manager](#18-openstack-cloud-controller-manager)
19. [Cinder CSI](#19-cinder-csi)
20. [Neutron CNI Concepts](#20-neutron-cni-concepts)
21. [Kubernetes Service type=LoadBalancer + OpenStack](#21-kubernetes-service-typeloadbalancer--openstack)
22. [Kubernetes PersistentVolumes + Cinder](#22-kubernetes-persistentvolumes--cinder)
23. [Kubernetes â†’ OpenStack API Interaction](#23-kubernetes--openstack-api-interaction)
24. [OpenStack Troubleshooting](#24-openstack-troubleshooting)
25. [API â†’ Scheduler â†’ Compute â†’ Network â†’ Storage Debugging](#25-api--scheduler--compute--network--storage-debugging)
26. [OpenStack Service-to-Service Communication](#26-openstack-service-to-service-communication)
27. [Controller vs Compute vs Network vs Storage Node](#27-controller-node-vs-compute-node-vs-network-node-vs-storage-node)
28. [OpenStack Deployment Architecture](#28-openstack-deployment-architecture)
29. [Scaling OpenStack](#29-scaling-openstack)
30. [Failure Scenarios & Recovery](#30-failure-scenarios--recovery)

---

## 1. Octavia â€” Load Balancing

### Definition
Octavia is OpenStack's **Load-Balancing-as-a-Service (LBaaS v2)** project. Unlike early OpenStack load balancing (which just configured HAProxy on the controller), Octavia is **operator-driven**: it spins up **actual virtual machines (amphorae)** that run HAProxy/nginx internally, and it manages their lifecycle exactly like Nova manages tenant VMs.

### Analogy
Think of Octavia as a **hotel concierge service that hires a dedicated receptionist (amphora VM) for every event you host**. Instead of you manually setting up a reception desk (HAProxy config) yourself, you ask the concierge "I need front-desk service for my event," and it provisions a whole new receptionist, gives them a phone number (VIP), and tells them how to route guests (traffic) to different rooms (backend members).

### Why Octavia Exists
Old Neutron-LBaaS ran HAProxy processes as network namespaces on the network node â€” this was a **single point of failure** and didn't scale. Octavia solves this by:
- Deploying **amphora VMs** (small Nova instances, usually a cut-down Amphora image built with `diskimage-builder`)
- Each amphora runs HAProxy (L4/L7) or a Linux kernel forwarding stack
- Supports **Active-Standby** amphora pairs for HA
- Fully driven via the OpenStack Load Balancer API (`openstack loadbalancer ...`)

### High-Level Architecture

```
                     +-------------------------+
                     |     Octavia API          |
                     |  (receives LB requests)  |
                     +------------+--------------+
                                  |
                                  v
                     +-------------------------+
                     |   Octavia Controller     |
                     |  - Worker (builds LB)    |
                     |  - Housekeeping (cleans) |
                     |  - Health Manager        |
                     +------------+--------------+
                                  |
              Nova boots amphora VM(s) via Nova API
                                  |
                                  v
      +----------------------------------------------------+
      |                Amphora VM(s)                        |
      |  - HAProxy process configured dynamically           |
      |  - Listens on VIP                                   |
      |  - Forwards to backend Pool Members                 |
      +----------------------------------------------------+
                                  |
                 +----------------+-----------------+
                 v                                  v
          +-------------+                    +-------------+
          |  Member VM1 |                    |  Member VM2 |
          +-------------+                    +-------------+
```

### Key Components
| Component | Role |
|---|---|
| `octavia-api` | REST API endpoint, talks to Neutron LBaaS extension |
| `octavia-worker` | Does the actual provisioning (talks to Nova/Neutron to spin amphora) |
| `octavia-health-manager` | Monitors amphora health via UDP heartbeat |
| `octavia-housekeeping` | Cleans up stale/dead amphorae and DB records |
| Amphora image | Purpose-built VM image with HAProxy + Octavia agent |

### Example CLI Flow
```bash
# Create a load balancer with a VIP on a subnet
openstack loadbalancer create --name web-lb --vip-subnet-id <subnet-id>

# Create a listener (frontend port)
openstack loadbalancer listener create --name web-listener \
  --protocol HTTP --protocol-port 80 web-lb

# Create a pool (backend group)
openstack loadbalancer pool create --name web-pool \
  --lb-algorithm ROUND_ROBIN --listener web-listener --protocol HTTP

# Add members (backend servers)
openstack loadbalancer member create --subnet-id <subnet-id> \
  --address 10.0.0.11 --protocol-port 80 web-pool
```

---

## 2. Load Balancer â†’ Listener â†’ Pool â†’ Member

### The Hierarchy (Object Model)

```
Load Balancer (VIP: 203.0.113.10)
   |
   +-- Listener (Port 443, protocol HTTPS)
   |      |
   |      +-- Pool (algorithm: ROUND_ROBIN)
   |             |
   |             +-- Member 1 (10.0.0.11:443)
   |             +-- Member 2 (10.0.0.12:443)
   |             +-- Member 3 (10.0.0.13:443)
   |
   +-- Listener (Port 80, protocol HTTP) -- e.g. redirect to HTTPS
          |
          +-- Pool (algorithm: LEAST_CONNECTIONS)
                 |
                 +-- Member 1 (10.0.0.11:80)
                 +-- Member 2 (10.0.0.12:80)
```

### Definitions

- **Load Balancer**: The top-level object; owns the **VIP** (Virtual IP). Analogy: the **building address**.
- **Listener**: Defines **which port/protocol** the LB accepts traffic on. Analogy: **the specific door** of the building (Door 80 for HTTP visitors, Door 443 for HTTPS visitors).
- **Pool**: A group of backend servers plus a **load-balancing algorithm**. Analogy: the **department behind the door** (e.g., "Billing Department") along with the rule for whom to see next (round robin, least busy, etc.).
- **Member**: An actual backend server (IP:port). Analogy: an **individual staff member** in that department.

### Load-Balancing Algorithms
| Algorithm | Behavior |
|---|---|
| `ROUND_ROBIN` | Cycles through members sequentially |
| `LEAST_CONNECTIONS` | Sends to the member with fewest active connections |
| `SOURCE_IP` | Same client IP always goes to same member (session affinity) |
| `SOURCE_IP_PORT` | Affinity based on IP+port |

### Practical Example
A pool can have members at **different weights** â€” a bigger VM might get weight `10` while a smaller one gets weight `5`, meaning it receives twice the traffic proportionally.

```bash
openstack loadbalancer member create --weight 10 --address 10.0.0.11 ...
openstack loadbalancer member create --weight 5  --address 10.0.0.12 ...
```

---

## 3. VIP & Health Monitors

### VIP (Virtual IP)
The VIP is a **floating, non-machine-bound IP address** that clients connect to. It's the "front door" â€” clients never know or care which backend member actually served them.

- Allocated from a Neutron subnet (or associated with a Floating IP for external access)
- Bound to the **active amphora**; on failover, the VIP moves to the **standby amphora** using a technique similar to VRRP (keepalived), so client-facing IP never changes.

```
   Client
     |
     v
  VIP: 203.0.113.10  <-- always the same, regardless of which amphora is active
     |
     +---(active)---> Amphora-1 (HAProxy)
     |
     +---(standby, silent until failover)---> Amphora-2 (HAProxy)
```

### Health Monitors
A health monitor continuously **probes pool members** to determine if they are alive; unhealthy members are automatically pulled out of rotation.

| Type | Check |
|---|---|
| `PING` | ICMP echo |
| `TCP` | TCP handshake succeeds |
| `HTTP` | GET request returns expected status code (e.g., 200) |
| `HTTPS` | Same as HTTP but over TLS |

```bash
openstack loadbalancer healthmonitor create \
  --delay 5 --max-retries 3 --timeout 3 \
  --type HTTP --url-path /healthz web-pool
```

- `delay`: how often to check (seconds)
- `timeout`: how long to wait for a response
- `max-retries`: consecutive failures before marking DOWN
- `url-path`: for HTTP checks, the endpoint to hit (e.g., `/healthz`)

### Analogy
The health monitor is a **hallway inspector who knocks on every staff member's door every 5 seconds**. If a staff member doesn't answer 3 times in a row, the inspector puts a "Do Not Disturb / Out" sign and stops sending visitors there â€” until they respond again.

---

## 4. L4 vs L7 Load Balancing

### Layer 4 (Transport Layer)
- Operates on **IP + TCP/UDP port** only
- Doesn't inspect application data (HTTP headers, cookies, URLs)
- Faster, lower overhead
- Example: Octavia listener with protocol `TCP` or `UDP`

```
Client --> [TCP SYN to VIP:443] --> LB forwards raw TCP stream --> Member
        (LB has no idea if it's HTTP, gRPC, or a database protocol)
```

### Layer 7 (Application Layer)
- Understands **HTTP/HTTPS** â€” headers, cookies, URL paths, hostnames
- Can route based on content: `/api/*` â†’ pool A, `/static/*` â†’ pool B
- Can terminate TLS, inspect and rewrite headers, do content-based routing
- Slightly more overhead due to parsing

```
Client --> HTTPS request "/api/orders" --> LB terminates TLS,
           reads Host + Path headers --> routes to "orders-pool"
```

### Comparison Table
| Feature | L4 | L7 |
|---|---|---|
| Awareness | IP/Port only | Full HTTP semantics |
| Speed | Faster | Slightly slower (parsing overhead) |
| TLS termination | No (passthrough) | Yes |
| Content-based routing | No | Yes |
| Use case | Databases, raw TCP services, gRPC streams | Web apps, microservices routing, API gateways |

### Analogy
- **L4** is a mail sorter who only reads the **building number** on an envelope and drops it at the right building â€” doesn't open the letter.
- **L7** is a receptionist who **opens the envelope**, reads the actual request ("I need Billing, not HR"), and routes you precisely.

---

## 5. Ceph Integration

### Definition
Ceph is a **distributed, software-defined storage system** providing object, block, and file storage on a single cluster. OpenStack integrates with Ceph as a **unified backend** for multiple services:

| OpenStack Service | Ceph Component Used |
|---|---|
| **Cinder** (Block Storage) | RBD (RADOS Block Device) |
| **Glance** (Images) | RBD (image store) |
| **Nova** (Ephemeral disks) | RBD (boot from Ceph) |
| **Swift-compatible object storage** | RGW (RADOS Gateway) |
| **Manila** (File shares) | CephFS |

### Architecture Diagram

```
                +-------------------------------------------------+
                |                   Ceph Cluster                   |
                |                                                   |
                |   MON (Monitors)  -- cluster map, quorum          |
                |   OSD (Object Storage Daemons) -- actual disks    |
                |   MGR (Manager) -- metrics/dashboard               |
                |   MDS (Metadata Server) -- for CephFS only         |
                |                                                   |
                |            RADOS (reliable object store)          |
                +-------------------+-------------------------------+
                                    |
      +-----------------------------+------------------------------+
      |                             |                               |
      v                             v                               v
   RBD (block)                RGW (object/S3)                CephFS (file)
      |                             |                               |
      v                             v                               v
   Cinder / Nova / Glance      Swift-compatible API              Manila
```

### Why Ceph + OpenStack
1. **Unified backend** â€” one storage cluster serves images, volumes, ephemeral disks, and objects â€” reduces operational complexity.
2. **Copy-on-Write (CoW) cloning** â€” Glance images stored as RBD snapshots let Cinder/Nova create new volumes/VMs **instantly** without copying full image data.
3. **Live migration friendliness** â€” because VM disks live on Ceph (network storage) rather than local disk, Nova can live-migrate VMs between compute hosts without moving the disk.
4. **Self-healing & replication** â€” Ceph automatically replicates data (commonly 3x) across OSDs/failure domains.

### Analogy
Ceph is like a **city-wide shared warehouse network** instead of every store (OpenStack service) keeping its own stockroom. Any store can request "block of shelving" (RBD), "public storage locker" (RGW/object), or "shared filing cabinet" (CephFS) from the same warehouse system, and the warehouse handles replication/backup automatically.

---

## 6. Cinder + Ceph Architecture

### Definition
Cinder is OpenStack's **Block Storage service** â€” it provides persistent volumes that can be attached to Nova instances, similar to an AWS EBS volume. When backed by Ceph, Cinder volumes are actually **RBD images**.

### Flow: Creating and Attaching a Volume

```
 User: "openstack volume create --size 20 my-volume"
             |
             v
      +----------------+
      |  cinder-api     |  <- validates request, writes to DB
      +--------+--------+
               |
               v
      +----------------+
      | cinder-scheduler|  <- picks backend (e.g., ceph-rbd pool)
      +--------+--------+
               |
               v
      +----------------+
      | cinder-volume   |  <- talks to Ceph via librbd
      +--------+--------+
               |
               v
      +----------------------------+
      |   Ceph Cluster (RBD pool)   |
      |   creates RBD image 20GB    |
      +----------------------------+
```

### Attach Flow (to a running VM)

```
 openstack server add volume <instance> <volume>
             |
             v
      cinder-api  --> validates
             |
             v
      nova-compute (on the hypervisor hosting the VM)
             |
             v
      libvirt/QEMU attaches the RBD image directly
      over the network (via librbd driver) as a virtio-blk/virtio-scsi device
             |
             v
      Guest OS sees a new block device: /dev/vdb
```

Because Ceph is **network-attached**, the compute node doesn't need local disk access to the volume â€” it connects directly to the Ceph cluster using the `rbd` driver in QEMU, which means:
- **Live migration** doesn't need to copy volume data (only VM RAM/state) since the disk is already reachable from every compute node.
- **Boot-from-volume** is efficient because Nova can boot directly from an RBD-backed volume.

### cinder.conf Example (conceptual)
```ini
[ceph]
volume_driver = cinder.volume.drivers.rbd.RBDDriver
rbd_pool = volumes
rbd_ceph_conf = /etc/ceph/ceph.conf
rbd_user = cinder
rbd_secret_uuid = <libvirt-secret-uuid>
```

### Snapshots & Clones (Copy-on-Write)
Because Ceph RBD supports **CoW clones**, Cinder can:
- Snapshot a volume in seconds (metadata operation, not a full copy)
- Create new volumes from a Glance image nearly instantly, since the new RBD image is just a CoW clone pointing back to the base image

---

## 7. KVM / QEMU

### Definitions
- **KVM (Kernel-based Virtual Machine)**: A **Linux kernel module** that turns the Linux kernel into a **type-1-like hypervisor**, using hardware virtualization extensions (Intel VT-x / AMD-V). KVM handles CPU and memory virtualization.
- **QEMU**: A **userspace emulator/virtual machine manager**. When paired with KVM, QEMU handles **device emulation** (virtual NIC, virtual disk, virtual BIOS) while KVM accelerates CPU/memory instructions directly on hardware.

Together: **QEMU/KVM** = full virtualization stack. Nova's default hypervisor driver is `libvirt`, which in turn drives QEMU/KVM.

### Architecture

```
+-----------------------------------------------------------+
|                     Physical Compute Host                  |
|                                                             |
|   +-------------------+     +-------------------+          |
|   |   Guest VM 1       |     |   Guest VM 2       |          |
|   |  (runs unmodified   |     |  (runs unmodified   |          |
|   |   guest OS kernel)  |     |   guest OS kernel)  |          |
|   +---------+----------+     +---------+----------+          |
|             |                          |                     |
|      QEMU process              QEMU process                  |
|     (device emulation:         (device emulation)             |
|      vNIC, vDisk, vBIOS)                                       |
|             |                          |                     |
|             +-----------+--------------+                     |
|                         |                                     |
|                   KVM kernel module                           |
|            (uses Intel VT-x / AMD-V for CPU/mem)               |
|                         |                                     |
|                  Host Linux Kernel                            |
|                         |                                     |
|                  Physical CPU / RAM / NIC                     |
+-----------------------------------------------------------+
```

### Nova's Role
```
Nova-compute (per host)
     |
     v
libvirt (abstraction layer)
     |
     v
QEMU/KVM (actual hypervisor)
```

Nova doesn't talk to QEMU directly â€” it goes through **libvirt**, an abstraction layer that can also drive Xen, LXC, Hyper-V, and VMware, making Nova hypervisor-agnostic.

### Analogy
- **QEMU** is like a **movie set** â€” it builds fake props (virtual disk, virtual NIC) that look real to the actor (guest OS).
- **KVM** is the **stunt coordinator with real physics** â€” when the actor needs to actually run (execute CPU instructions), KVM lets them use the real hardware directly instead of faking it, which is why KVM-accelerated VMs run at near-native speed instead of pure emulation speed.

### Key Commands
```bash
# Check hardware virtualization support
egrep -c '(vmx|svm)' /proc/cpuinfo

# List running VMs on a compute node via libvirt
virsh list --all

# Inspect a VM's XML definition (used internally by Nova)
virsh dumpxml instance-00000001
```

---

## 8. RabbitMQ â€” OpenStack Messaging

### Definition
RabbitMQ is the **default AMQP message broker** used by OpenStack for **asynchronous inter-service communication**. Nearly every OpenStack service (`nova`, `neutron`, `cinder`, `heat`) uses RabbitMQ via **oslo.messaging** to communicate between their own sub-components (API, scheduler, conductor, agents).

### Why Messaging Instead of Direct API Calls?
- **Decoupling**: `nova-api` doesn't need to know which `nova-compute` host is free â€” it just publishes to a queue.
- **Load leveling**: If compute nodes are busy, messages queue up instead of failing.
- **RPC + Fanout + Notifications**: Supports request/reply (RPC), one-to-many broadcast (fanout), and event notifications (for telemetry/Ceilometer).

### Message Patterns in OpenStack

```
1. RPC (Remote Procedure Call) â€” synchronous-style request/response over async transport
   nova-api --[RPC call: "build instance"]--> nova-conductor --> nova-scheduler

2. Fanout â€” broadcast to ALL consumers (e.g., all compute nodes)
   neutron-server --[fanout: "security group updated"]--> ALL neutron-l2-agents

3. Topic/Notification â€” event stream for logging/telemetry
   nova-compute --[notify: "instance.create.end"]--> notification queue --> Ceilometer/Telemetry
```

### Diagram

```
   +---------------+        publish         +----------------+
   |  nova-api      | ----------------------> |   RabbitMQ      |
   +---------------+                         |  Exchange/Queue  |
                                              +--------+---------+
                                                       |
                          +----------------------------+---------------------------+
                          |                             |                          |
                          v                             v                          v
                 +----------------+          +------------------+        +------------------+
                 | nova-scheduler |          |  nova-conductor   |        | nova-compute(N)   |
                 +----------------+          +------------------+        +------------------+
```

### Key Concepts
| Term | Meaning |
|---|---|
| **Exchange** | Routes messages to queues based on routing key (direct/topic/fanout) |
| **Queue** | Holds messages until consumed |
| **Consumer** | The service process (e.g. `nova-compute`) that processes messages |
| **oslo.messaging** | The OpenStack library abstracting RabbitMQ (also supports Kafka/AMQP1.0) |

### HA Considerations
- RabbitMQ typically deployed as a **clustered, mirrored-queue setup** (3 nodes) so that if one node dies, queues survive on the mirrors.
- Modern deployments favor **quorum queues** (Raft-based) over classic mirrored queues for stronger consistency.

### Analogy
RabbitMQ is the **office mailroom**. Instead of every employee (service) walking to every other employee's desk to hand over a memo (direct API call), they drop it in labeled mail slots (queues/exchanges), and the mailroom guarantees delivery even if the recipient is briefly away (down/restarting).

---

## 9. MariaDB / Galera

### Definition
MariaDB is the relational database used by virtually all OpenStack services to store persistent state (instances, networks, volumes, flavors, users, projects). **Galera Cluster** is a **synchronous multi-master replication plugin** for MariaDB, giving OpenStack a **highly available, write-anywhere SQL cluster**.

### Why Galera (not simple master-replica)?
- Traditional MySQL replication (master-slave) is **asynchronous** â€” a crash can lose the last transactions, and only the master can accept writes.
- Galera provides **synchronous, multi-master replication**: a write must be certified across **all nodes before commit succeeds**, so any node can accept reads/writes, and there's no replication lag.

### Architecture

```
           +---------------+      +---------------+      +---------------+
           |  MariaDB Node1 |<---->|  MariaDB Node2 |<---->|  MariaDB Node3 |
           |   (Galera)     |      |   (Galera)     |      |   (Galera)     |
           +-------+--------+      +-------+--------+      +-------+--------+
                   |                       |                       |
                   +-----------+  Galera Replication (synchronous, |
                               |  certification-based) all-to-all  |
                               +-----------------+------------------+
                                                  |
                                     All 3 nodes can accept
                                     reads AND writes
```

Traffic is usually routed through **HAProxy** (see Section 11) which load-balances/directs writes, often to a single "preferred" node to avoid certification conflicts (deadlocks under heavy concurrent writes), while spreading reads across all nodes.

### Quorum & Split-Brain Protection
- Galera requires a **quorum (majority)** of nodes to remain part of the cluster.
- With 3 nodes, if 1 node fails, the remaining 2 still form a quorum (2 out of 3) and continue serving.
- If the cluster splits such that no partition has a majority, all nodes go **non-primary** and refuse writes â€” protecting against split-brain data corruption.

### Analogy
Galera is like **three notaries in different cities who must all stamp a contract simultaneously** before it's considered legally signed â€” this guarantees every copy is identical (synchronous), unlike a courier system where one city's copy might lag behind (async replication).

### Example Health Check
```sql
SHOW STATUS LIKE 'wsrep_cluster_size';   -- number of nodes in cluster
SHOW STATUS LIKE 'wsrep_local_state_comment';  -- should be 'Synced'
```

---

## 10. Memcached

### Definition
Memcached is an **in-memory key-value caching system** used by OpenStack primarily for:
1. **Keystone token caching** â€” avoids re-validating tokens against the DB on every API call
2. **Nova/Neutron/Cinder API response caching** â€” reduces DB load for frequently requested, rarely changing data
3. **oslo.cache** â€” the common library OpenStack services use to talk to Memcached

### Why It Matters for OpenStack Performance
Every API request to any OpenStack service typically requires **token validation** via Keystone. Without caching, this would mean a **DB round trip on every single API call** across the entire cloud â€” a massive bottleneck at scale. Memcached absorbs this load.

### Diagram

```
      Client Request (with X-Auth-Token header)
                  |
                  v
        +--------------------+
        |   nova-api / etc.   |
        +----------+----------+
                    |
          Is token cached?
             /          \
          YES            NO
           |               |
   Return cached          Validate against Keystone
   validation result       (DB / Fernet decode)
           |                       |
           +---------> Cache result in Memcached (with TTL)
```

### Key Properties
- **Not persistent** â€” pure RAM cache; if it restarts, cache is empty (rebuilt on demand â€” not a data-loss risk since Memcached is never the source of truth).
- **Distributed** â€” typically run on all 3 controllers; clients (oslo.cache) use consistent hashing to spread keys across nodes.
- Configured in `keystone.conf` / service configs:
```ini
[cache]
enabled = true
backend = dogpile.cache.memcached
memcache_servers = controller1:11211,controller2:11211,controller3:11211
```

### Analogy
Memcached is the **sticky-note board at the front desk**. Instead of the receptionist calling HR (the database) every single time someone asks "is my badge still valid?", they check a sticky note that says "Badge #123 = valid until 3pm" â€” much faster, and it's fine if the board gets wiped occasionally since they can always re-ask HR.

---

## 11. HAProxy

### Definition
HAProxy (High Availability Proxy) is a **fast, reliable TCP/HTTP load balancer and reverse proxy**. In OpenStack control-plane architecture (separate from Octavia, which is for **tenant** workloads), HAProxy is used to load-balance traffic **across the OpenStack API services themselves** (nova-api, neutron-server, keystone, etc.) running on multiple controller nodes, and often in front of the Galera database cluster.

### Where It Sits

```
                     Internet / Management Network
                              |
                              v
                    +--------------------+
                    |  VIP (kept by       |
                    |  Keepalived/VRRP)   |
                    +---------+----------+
                              |
                    +--------------------+
                    |     HAProxy         |
                    | (on each controller,|
                    |  active on VIP node)|
                    +---------+----------+
         +----------------------+----------------------+
         |                      |                       |
         v                      v                       v
 Controller-1 API      Controller-2 API         Controller-3 API
 (nova-api, neutron,   (nova-api, neutron,      (nova-api, neutron,
  keystone, cinder)     keystone, cinder)         keystone, cinder)
```

### Example haproxy.cfg Snippet
```
frontend nova_api_front
    bind 10.0.0.10:8774
    default_backend nova_api_back

backend nova_api_back
    balance roundrobin
    option httpchk GET /
    server controller1 10.0.0.11:8774 check
    server controller2 10.0.0.12:8774 check
    server controller3 10.0.0.13:8774 check
```

### HAProxy + Galera
For the database, HAProxy commonly uses a **health-check script (e.g., clustercheck)** to identify the Galera node that's `Synced`, and routes traffic (often all writes) to a single healthy node to reduce certification conflicts, failing over automatically if that node goes down.

### HAProxy vs Octavia â€” Don't Confuse Them
| | HAProxy (control plane) | Octavia (tenant LBaaS) |
|---|---|---|
| Who manages it | Cloud operator, manually or via deployment tool (Kolla/TripleO) | Tenants, via API |
| What it balances | OpenStack's own API services + DB | Tenant application workloads |
| Where it runs | Directly on controller nodes | Inside amphora VMs (managed by Octavia) |

### Analogy
HAProxy here is the **building's main switchboard operator** making sure calls (API requests) to "the office" get routed to whichever of the three identical office branches (controllers) is open and answering, regardless of which branch physically picks up.

---

## 12. OpenStack Control Plane HA

### Definition
Control Plane High Availability means **no single controller node failure should bring down cloud operations** (API access, scheduling, networking control, DB, messaging). This is achieved by **redundantly deploying every control-plane component** across 3 (or more, always odd for quorum) controller nodes.

### Full HA Stack Diagram

```
                         Keepalived (VRRP) â€” owns Virtual IP
                                     |
                    +----------------+----------------+
                    |                |                |
              Controller-1     Controller-2      Controller-3
              +-----------+   +-----------+     +-----------+
              | HAProxy    |   | HAProxy    |     | HAProxy    |
              | nova-api   |   | nova-api   |     | nova-api   |
              | neutron-svr|   | neutron-svr|     | neutron-svr|
              | keystone   |   | keystone   |     | keystone   |
              | cinder-api |   | cinder-api |     | cinder-api |
              | RabbitMQ   |   | RabbitMQ   |     | RabbitMQ   |
              | (cluster)  |   | (cluster)  |     | (cluster)  |
              | MariaDB    |   | MariaDB    |     | MariaDB    |
              | (Galera)   |   | (Galera)   |     | (Galera)   |
              | Memcached  |   | Memcached  |     | Memcached  |
              +-----------+   +-----------+     +-----------+
```

### The Layers of HA
1. **VIP Failover** â€” Keepalived/VRRP moves the externally-facing VIP between controllers if one fails.
2. **Stateless service HA** â€” API services (`nova-api`, `neutron-server`) are stateless, so HAProxy simply removes a dead one from rotation.
3. **Stateful service HA** â€” MariaDB (Galera) and RabbitMQ (mirrored/quorum queues) require **clustering protocols**, not just load balancing, because they hold state.
4. **Scheduler/Conductor HA** â€” `nova-scheduler`, `nova-conductor`, `neutron` agents can run **active-active**; RabbitMQ ensures only one consumer processes a given RPC message.
5. **Compute Node HA** â€” Not part of "control plane" HA per se, but Nova can detect a dead compute host (via `nova-compute` heartbeat) and operators/tools can trigger **evacuation** of instances to healthy hosts.

### Quorum Requirement
Both Galera and RabbitMQ (with quorum queues) require **odd-numbered clusters (typically 3)** to avoid split-brain â€” 2 nodes cannot safely determine "majority" if they disagree.

### Analogy
Think of Control Plane HA like a **company with three identical branch offices**, connected by a **shared, always-in-sync ledger (Galera)** and a **shared mailroom system (RabbitMQ)**. If one branch burns down, the switchboard (HAProxy/VIP) simply stops sending customers there â€” business continues uninterrupted because the other two branches have identical, synced records.

---

## 13. Heat â€” Orchestration

### Definition
Heat is OpenStack's **native orchestration engine**, similar to AWS CloudFormation. It takes a **declarative template (HOT â€” Heat Orchestration Template, YAML-based)** describing desired infrastructure, and Heat creates/updates/deletes all the described resources (networks, servers, volumes, security groups, floating IPs) as a single unit called a **Stack**.

### Architecture

```
   heat-template.yaml
          |
          v
   +----------------+
   |   heat-api      |  <- REST endpoint
   +--------+---------+
            |
            v
   +----------------+
   | heat-engine     |  <- resolves dependency graph, calls other services
   +--------+---------+
            |
    +-------+-------+-------+--------+
    v       v       v       v        v
  Nova   Neutron  Cinder  Keystone  Glance
 (server) (net)   (vol)    (auth)   (image)
```

### Example HOT Template
```yaml
heat_template_version: 2021-04-16

description: Simple web server stack

parameters:
  image_id:
    type: string
  flavor:
    type: string
    default: m1.small
  network:
    type: string

resources:
  web_server:
    type: OS::Nova::Server
    properties:
      image: { get_param: image_id }
      flavor: { get_param: flavor }
      networks:
        - network: { get_param: network }

  web_port_sg:
    type: OS::Neutron::SecurityGroup
    properties:
      rules:
        - protocol: tcp
          port_range_min: 80
          port_range_max: 80

outputs:
  server_ip:
    value: { get_attr: [web_server, first_address] }
```

```bash
openstack stack create -t heat-template.yaml my-stack
openstack stack list
openstack stack delete my-stack   # tears down EVERYTHING in the stack
```

### Key Concepts
| Term | Meaning |
|---|---|
| **Stack** | A collection of resources managed as one unit |
| **HOT** | Heat Orchestration Template â€” the YAML DSL |
| **Resource** | A single managed object (`OS::Nova::Server`, `OS::Cinder::Volume`, etc.) |
| **Nested Stack** | A stack referenced as a resource inside another stack (modularity) |
| **Auto Scaling Group** | Heat resource type that integrates with Ceilometer/Aodh alarms to scale server count |
| **Software Config/Deployment** | Heat resources to run config scripts inside instances after boot (like cloud-init orchestration) |

### Analogy
Heat is like an **architect's blueprint + general contractor combined**. You describe "I want a 2-story house with 3 rooms and a garage" (declarative template), and Heat figures out the order to build things (foundation before walls, walls before roof â€” i.e., dependency graph) and calls the right subcontractors (Nova for the "rooms", Neutron for the "wiring", Cinder for the "plumbing/storage").

---

## 14. Terraform + OpenStack

### Definition
Terraform is a **multi-cloud Infrastructure-as-Code (IaC) tool** by HashiCorp. It supports OpenStack via the **`terraform-provider-openstack`** plugin, letting you define OpenStack resources declaratively in HCL (HashiCorp Configuration Language) â€” similar goal to Heat, but cloud-agnostic and with a much larger ecosystem.

### Heat vs Terraform
| | Heat | Terraform |
|---|---|---|
| Scope | OpenStack-native only | Multi-cloud (AWS, Azure, GCP, OpenStack, etc.) |
| State | Stored server-side (Heat DB) | Stored in a state file (local or remote backend) |
| Language | YAML (HOT) | HCL |
| Ecosystem | OpenStack-specific | Massive shared modules/providers ecosystem |
| Drift detection | Limited | Strong (`terraform plan`) |

### Example
```hcl
terraform {
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
    }
  }
}

provider "openstack" {
  auth_url    = "https://cloud.example.com:5000/v3"
  tenant_name = "myproject"
  user_name   = "myuser"
  password    = var.password
  region      = "RegionOne"
}

resource "openstack_networking_network_v2" "app_net" {
  name           = "app-network"
  admin_state_up = true
}

resource "openstack_networking_subnet_v2" "app_subnet" {
  network_id = openstack_networking_network_v2.app_net.id
  cidr       = "10.20.0.0/24"
  ip_version = 4
}

resource "openstack_compute_instance_v2" "web" {
  name            = "web-server"
  image_name      = "ubuntu-22.04"
  flavor_name     = "m1.small"
  key_pair        = "my-keypair"

  network {
    uuid = openstack_networking_network_v2.app_net.id
  }
}
```

```bash
terraform init
terraform plan     # shows what WILL change (dry run)
terraform apply    # actually creates resources
terraform destroy  # tears down everything in state
```

### Terraform Workflow Diagram
```
   main.tf (desired state)
           |
           v
   terraform plan  --> compares desired state vs. .tfstate (current known state)
           |
           v
   terraform apply --> calls OpenStack APIs (Nova, Neutron, Cinder...) to reconcile
           |
           v
   .tfstate updated to reflect new real-world state
```

### Analogy
If Heat is the **in-house architect who only knows this one city's building codes (OpenStack)**, Terraform is a **freelance architect who knows building codes for every city (AWS, Azure, OpenStack, GCP)** â€” and keeps a personal notebook (state file) tracking exactly what they've built so far, so they know what changed since last time.

---

## 15. Ansible + OpenStack

### Definition
Ansible automates OpenStack via the **`openstack.cloud` collection** (formerly `os_*` modules), which wraps the OpenStack SDK. Unlike Terraform/Heat (declarative state management with drift tracking), Ansible is primarily a **procedural/idempotent task runner** â€” great for both **provisioning** and **configuration/deployment automation** (e.g., Kolla-Ansible and OpenStack-Ansible use it to deploy OpenStack itself).

### Two Different Uses of Ansible in the OpenStack World
1. **Deploying OpenStack itself** â€” projects like **Kolla-Ansible** and **OpenStack-Ansible** use Ansible playbooks to install/configure OpenStack services (containerized or bare-metal) across controller/compute/network/storage nodes.
2. **Managing OpenStack resources** (as a cloud consumer) â€” creating servers, networks, volumes via the `openstack.cloud` collection, similar in end-effect to Terraform but imperative in style.

### Example Playbook
```yaml
- name: Provision app infrastructure on OpenStack
  hosts: localhost
  tasks:
    - name: Create network
      openstack.cloud.network:
        cloud: mycloud
        name: app-net
        state: present

    - name: Create subnet
      openstack.cloud.subnet:
        cloud: mycloud
        network_name: app-net
        name: app-subnet
        cidr: 10.30.0.0/24

    - name: Boot a server
      openstack.cloud.server:
        cloud: mycloud
        name: web01
        image: ubuntu-22.04
        flavor: m1.small
        network: app-net
        key_name: my-keypair
        state: present
```

```bash
ansible-playbook provision.yml
```

### Kolla-Ansible Deployment Flow (deploying OpenStack itself)
```
   globals.yml (config: which services, versions, VIP, network interfaces)
             |
             v
   kolla-ansible deploy
             |
             v
   Ansible connects to all controller/compute/network/storage nodes via SSH
             |
             v
   Pulls & starts containerized OpenStack services (Docker/Podman)
   on the right nodes according to inventory groups
```

### Analogy
Ansible is like a **very disciplined checklist-following assistant**: "SSH into this machine, check if the network exists, if not create it, then check if the VM exists, if not create it." It re-runs the same checklist safely any number of times (idempotency) rather than maintaining a separate ledger of "desired state" like Terraform does.

---

## 16. OpenStack SDKs

### Definition
OpenStack SDKs are **client libraries** that let applications programmatically interact with OpenStack APIs, instead of using the CLI or raw REST calls. The most important is the **official `openstacksdk` (Python)**, which unifies what used to be dozens of separate per-service SDKs (`novaclient`, `neutronclient`, `cinderclient`, etc.) into one consistent interface.

### Layers of Interaction

```
   Your Application Code
            |
            v
   openstacksdk (Python) / gophercloud (Go) / other language SDKs
            |
            v
   REST API calls (HTTP + JSON) with Keystone token in headers
            |
            v
   OpenStack Service APIs (nova-api, neutron-server, cinder-api, ...)
```

### Example (Python, openstacksdk)
```python
import openstack

conn = openstack.connect(cloud='mycloud')  # reads clouds.yaml

# Create a server
image = conn.compute.find_image('ubuntu-22.04')
flavor = conn.compute.find_flavor('m1.small')
network = conn.network.find_network('app-net')

server = conn.compute.create_server(
    name='web01',
    image_id=image.id,
    flavor_id=flavor.id,
    networks=[{"uuid": network.id}]
)
conn.compute.wait_for_server(server)
print(server.access_ipv4)
```

### Other Language SDKs
| Language | SDK |
|---|---|
| Python | `openstacksdk` |
| Go | `gophercloud` |
| Java | `jclouds` (multi-cloud, OpenStack support) |
| Terraform | `terraform-provider-openstack` (built on Go/gophercloud internally) |
| Kubernetes components | Cloud Controller Manager & Cinder CSI use `gophercloud` internally |

### `clouds.yaml` â€” Shared Credential Config
```yaml
clouds:
  mycloud:
    auth:
      auth_url: https://cloud.example.com:5000/v3
      username: myuser
      password: mypassword
      project_name: myproject
      user_domain_name: Default
      project_domain_name: Default
    region_name: RegionOne
```
Nearly all tools (CLI, SDK, Terraform, Ansible, K8s Cloud Provider) can read this same file â€” a **unified credential source**.

### Analogy
The SDK is a **universal remote control** for OpenStack. Instead of learning the raw "infrared codes" (REST/JSON payloads) for every single button, you press a labeled button ("create_server") and the SDK translates it correctly for whichever "TV" (OpenStack service/version) you're pointed at.

---

## 17. Kubernetes on OpenStack

### Definition
Running Kubernetes **on top of** OpenStack means using OpenStack as the **IaaS layer** (VMs, networks, storage) to host Kubernetes nodes, while Kubernetes manages containers **on top of** those VMs. This is one of the most common real-world patterns â€” OpenStack for infrastructure, Kubernetes for application orchestration.

### Two Layers of Orchestration

```
      +-------------------------------------------------------------+
      |                     Kubernetes Layer                         |
      |   Pods, Deployments, Services, Ingress, ConfigMaps            |
      |   (schedules CONTAINERS onto Nodes)                           |
      +---------------------------+-----------------------------------+
                                   |
                     Kubernetes Nodes = OpenStack VMs
                                   |
      +---------------------------v-----------------------------------+
      |                       OpenStack Layer                          |
      |   Nova (VMs) / Neutron (networks) / Cinder (volumes) /         |
      |   Glance (images) / Octavia (LB) / Keystone (auth)             |
      |   (schedules VMs onto physical Compute hosts)                  |
      +-----------------------------------------------------------------+
```

### Deployment Approaches
| Method | Description |
|---|---|
| **Magnum** | OpenStack's native "Container-Orchestration-as-a-Service" â€” provisions full K8s clusters via Heat templates automatically |
| **Cluster API Provider OpenStack (CAPO)** | Modern, Kubernetes-native way to manage the lifecycle of K8s clusters running on OpenStack |
| **kubeadm on OpenStack VMs** | Manually boot Nova VMs, then bootstrap Kubernetes with kubeadm |
| **Managed K8s distros** (Rancher, kubespray) | Automate node provisioning against OpenStack + K8s install |

### Why This Matters
Once Kubernetes nodes run as OpenStack VMs, Kubernetes itself needs to interact with OpenStack for two things it can't do alone:
1. **Dynamically provisioning storage** for PersistentVolumeClaims â†’ handled by **Cinder CSI** (Section 19)
2. **Provisioning cloud load balancers** for `Service type=LoadBalancer` and managing node metadata/zones â†’ handled by the **OpenStack Cloud Controller Manager** (Section 18)

### Analogy
OpenStack is the **city's road, water, and electric grid**; Kubernetes is the **logistics company that runs delivery trucks (pods) on those roads**. The trucking company doesn't build roads â€” it just needs the city to hand it addresses (IPs), parking spots (nodes/VMs), and warehouses (storage) reliably.

---

## 18. OpenStack Cloud Controller Manager

### Definition
The **OpenStack Cloud Controller Manager (CCM)**, part of the `cloud-provider-openstack` project, is a Kubernetes control-plane component that lets Kubernetes **delegate cloud-specific operations to OpenStack**. It replaced the old "in-tree" OpenStack cloud provider (deprecated/removed from core Kubernetes) with an **out-of-tree** plugin.

### Responsibilities
| Controller inside CCM | Job |
|---|---|
| **Node Controller** | Adds cloud metadata (zone, region, instance type) to K8s Node objects; detects when a Nova VM backing a Node is deleted and removes the stale Node object |
| **Route Controller** | Manages Neutron routes for pod networking (only relevant with certain CNI setups) |
| **Service Controller** | Watches for `Service type=LoadBalancer` and provisions/manages an **Octavia** load balancer for it |

### Diagram

```
   +--------------------------------------------------------------+
   |                      Kubernetes Control Plane                 |
   |                                                                |
   |   kube-apiserver <---> etcd                                    |
   |         ^                                                     |
   |         |                                                     |
   |   +----------------------------+                              |
   |   |  OpenStack CCM (cloud-      |                              |
   |   |  controller-manager)        |                              |
   |   +--------------+---------------+                              |
   |                  |                                             |
   +------------------+----------------------------------------------+
                       |
                       v
        +-----------------------------+
        |     OpenStack APIs            |
        |  Nova (node metadata)         |
        |  Neutron (networking)         |
        |  Octavia (LoadBalancer svc)   |
        +-----------------------------+
```

### Example: Node Labels Added by CCM
```yaml
apiVersion: v1
kind: Node
metadata:
  labels:
    topology.kubernetes.io/region: RegionOne
    topology.kubernetes.io/zone: nova
    node.kubernetes.io/instance-type: m1.large
spec:
  providerID: openstack:///<nova-instance-uuid>
```

The `providerID` links the Kubernetes Node object directly to its backing **Nova instance UUID** â€” this is how CCM knows to clean up the Node if the VM is deleted in OpenStack.

### Configuration (cloud-config, used by CCM/CSI)
```ini
[Global]
auth-url = https://cloud.example.com:5000/v3
username = k8s-user
password = ...
region = RegionOne
tenant-name = k8s-project

[LoadBalancer]
use-octavia = true
subnet-id = <subnet-uuid>
floating-network-id = <external-net-uuid>
```

### Analogy
The CCM is a **translator/diplomat embedded inside Kubernetes' government** who speaks fluent "OpenStack" â€” whenever Kubernetes needs something from the outside infrastructure (a public phone line/LoadBalancer, or confirmation a worker still physically exists), the CCM handles the foreign paperwork so Kubernetes' own machinery stays cloud-agnostic.

---

## 19. Cinder CSI

### Definition
**Cinder CSI (Container Storage Interface driver)** is the plugin that lets Kubernetes dynamically provision, attach, and manage **Cinder volumes** as Kubernetes **PersistentVolumes**, replacing the old in-tree Cinder volume plugin. CSI is the vendor-neutral standard Kubernetes uses for all storage plugins (AWS EBS CSI, Azure Disk CSI, Cinder CSI, etc. all follow the same interface).

### Architecture

```
   +---------------------------------------------------------------+
   |                     Kubernetes Cluster                         |
   |                                                                 |
   |  PVC (PersistentVolumeClaim) created by user/app                |
   |            |                                                    |
   |            v                                                    |
   |  +--------------------------+                                   |
   |  | csi-provisioner (sidecar) |  watches for unbound PVCs         |
   |  +-------------+--------------+                                  |
   |                |                                                 |
   |                v                                                 |
   |  +--------------------------+                                   |
   |  |  cinder-csi-controller    |  calls Cinder API to create volume|
   |  +-------------+--------------+                                  |
   |                |                                                 |
   +----------------+-------------------------------------------------+
                     |
                     v
          +-----------------------+
          |   Cinder (OpenStack)   |
          |   creates RBD/LVM/etc  |
          |   volume, returns ID   |
          +-----------------------+
                     |
                     v
   +---------------------------------------------------------------+
   |  On the Node where the Pod is scheduled:                       |
   |  cinder-csi-node (DaemonSet) attaches the volume to the         |
   |  Nova VM (this node) via the OpenStack API, then mounts it      |
   |  into the Pod's filesystem                                      |
   +---------------------------------------------------------------+
```

### Example: StorageClass + PVC
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: cinder-csi
provisioner: cinder.csi.openstack.org
parameters:
  type: "ceph-ssd"     # maps to a Cinder volume type
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-data
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: cinder-csi
  resources:
    requests:
      storage: 10Gi
```

When a Pod references this PVC, the following happens automatically:
1. `csi-provisioner` sees the PVC is unbound â†’ calls Cinder CSI controller
2. Cinder CSI controller calls `POST /v3/volumes` on Cinder API â†’ volume created
3. Kubernetes schedules the Pod to a Node (a Nova VM)
4. `csi-node` plugin on that Node calls Nova's **volume-attach** API to attach the Cinder volume to that specific VM
5. Inside the VM, the new block device (e.g., `/dev/vdc`) appears; CSI node plugin formats/mounts it into the Pod

### Key CSI Components
| Component | Runs as | Role |
|---|---|---|
| `csi-provisioner` | Sidecar in controller Pod | Watches PVCs, triggers `CreateVolume` |
| `csi-attacher` | Sidecar in controller Pod | Triggers `ControllerPublishVolume` (Nova attach) |
| `cinder-csi-plugin` (controller mode) | Deployment | Talks to Cinder/Nova APIs |
| `cinder-csi-plugin` (node mode) | DaemonSet | Formats/mounts the block device inside each Node VM |

### Analogy
Cinder CSI is a **warehouse dispatcher working for the Kubernetes logistics company**. When a delivery truck (Pod) needs a storage crate (volume), the dispatcher calls the city warehouse (Cinder) to produce it, then physically straps it to the correct truck (Nova VM attach) before the truck can load it.

---

## 20. Neutron CNI Concepts

### Definition
A **CNI (Container Network Interface)** plugin gives **pods** their network interfaces and IP addresses inside a Kubernetes cluster. On OpenStack, there are two very different patterns:

1. **Standard CNI overlay (most common)**: Calico, Flannel, Cilium, etc. run **independently of Neutron**, building their own pod-network overlay on top of whatever VM network Neutron provides to the Nova instances (K8s nodes). Neutron just gives each **Node VM** one IP; the CNI plugin handles all **pod-to-pod** IPs and routing itself (typically via VXLAN/IPIP overlay or BGP).

2. **Kuryr-Kubernetes (Neutron-native CNI)**: A special CNI plugin that makes **pods themselves first-class Neutron ports** â€” i.e., every pod gets a **real Neutron port with a real Neutron-managed IP**, instead of an independent overlay network.

### Standard Overlay Pattern (e.g., Calico on OpenStack VMs)

```
   +-------------------------------------------------------------+
   |                    Neutron Network (VM-level)                 |
   |   Node1: 10.0.0.11         Node2: 10.0.0.12                   |
   +-------------------------------------------------------------+
                |                               |
                v                               v
   +----------------------+       +----------------------+
   |  Node1 (K8s worker)   |       |  Node2 (K8s worker)   |
   |  Pod overlay CIDR:    |       |  Pod overlay CIDR:    |
   |  192.168.1.0/24       |       |  192.168.2.0/24       |
   |  (Calico/Flannel      |       |  (Calico/Flannel      |
   |   manages this,       |       |   manages this,       |
   |   Neutron has NO idea |       |   Neutron has NO idea |
   |   these IPs exist)    |       |   these IPs exist)    |
   +----------------------+       +----------------------+
        Pod-to-pod traffic tunneled (VXLAN/IPIP) between
        Node1 and Node2 over the Neutron-provided VM network
```

### Kuryr-Kubernetes Pattern (Neutron-native)

```
   Pod created ---> Kuryr CNI ---> creates a real Neutron Port
                                   (Pod gets IP directly from a Neutron subnet,
                                    same address space as VMs)

   +-------------------------------------------------------------+
   |                    Neutron Network                            |
   |   Node1 VM: 10.0.0.11    Pod-A: 10.0.0.21   Pod-B: 10.0.0.22   |
   |   (Neutron sees and manages EVERY pod IP directly,             |
   |    using SR-IOV/Trunk ports or nested VLANs for performance)   |
   +-------------------------------------------------------------+
```

### Comparison
| | Overlay CNI (Calico/Flannel) | Kuryr-Kubernetes |
|---|---|---|
| Pod IP visibility to Neutron | None (opaque overlay) | Full â€” every pod is a Neutron port |
| Performance | Overlay/tunnel overhead | Can approach near-native (with trunk ports) |
| Security groups | CNI's own network policy | Can reuse native Neutron Security Groups per-pod |
| Complexity | Simpler, most common | More complex; tighter OpenStack coupling |
| IP exhaustion risk | Low (private overlay CIDR) | Higher (pods consume real Neutron subnet IPs) |

### Analogy
The **overlay CNI approach** is like each **apartment building (Node VM)** having its own **private internal room-numbering system** (pod IPs) that the city (Neutron) doesn't track â€” mail (packets) between buildings goes through a special courier tunnel. **Kuryr** is like the city **officially registering every single room** in every building as its own street address â€” more visibility and control, but the city's address book (Neutron) has to handle a lot more entries.

---

## 21. Kubernetes Service type=LoadBalancer + OpenStack

### Definition
When a Kubernetes `Service` is created with `type: LoadBalancer`, the **OpenStack Cloud Controller Manager's Service Controller** (Section 18) automatically provisions a real **Octavia load balancer** (Section 1) to expose that service externally â€” bridging Kubernetes' abstraction directly to OpenStack's tenant networking.

### End-to-End Flow

```
 kubectl apply -f svc.yaml (type: LoadBalancer)
             |
             v
 kube-apiserver stores Service object
             |
             v
 OpenStack CCM's Service Controller notices the new/updated Service
             |
             v
 CCM calls Octavia API:
   - Create Load Balancer (VIP on configured subnet)
   - Create Listener (for each Service port)
   - Create Pool (ROUND_ROBIN by default)
   - Add Members = the Kubernetes Node IPs (or Pod IPs if using Kuryr)
   - Create Health Monitor (checks NodePort health)
             |
             v
 Octavia provisions amphora VM(s) via Nova (Section 1 flow)
             |
             v
 CCM writes the VIP (or Floating IP) back into:
   Service.status.loadBalancer.ingress[0].ip
             |
             v
 kubectl get svc shows EXTERNAL-IP = <Octavia VIP / Floating IP>
```

### Example Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-svc
  annotations:
    loadbalancer.openstack.org/floating-network-id: "<ext-net-uuid>"
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
```

```bash
kubectl get svc web-svc
# NAME      TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)
# web-svc   LoadBalancer   10.96.10.20    203.0.113.55     80:31234/TCP
```

### How Traffic Actually Flows (with standard overlay CNI + NodePort backing)
```
 Client --> Octavia VIP (203.0.113.55:80)
              |
              v
        Amphora (HAProxy) load balances across
        Kubernetes Node IPs on the Service's NodePort (e.g. :31234)
              |
              v
        kube-proxy on that Node forwards to a Pod backing the Service
        (via iptables/IPVS rules, possibly a DIFFERENT node than
         the one traffic landed on)
```

### Analogy
This is like Kubernetes calling up **Octavia's front desk** and saying "I need a public phone line that rings through to any of my available staff (Nodes)." Octavia sets up that phone line (VIP + amphora), and internally Kubernetes' own receptionist (kube-proxy) makes sure the call reaches an actual available employee (Pod), even redirecting between rooms/floors if needed.

---

## 22. Kubernetes PersistentVolumes + Cinder

### Definition
This ties together **Cinder CSI (Section 19)** with Kubernetes' **PersistentVolume (PV) / PersistentVolumeClaim (PVC)** abstraction â€” the mechanism giving Pods **durable, network-attached storage** backed by OpenStack Cinder (often itself backed by Ceph â€” Section 6).

### The Abstraction Chain
```
Pod (wants storage)
   |
   v
PersistentVolumeClaim (PVC)  -- "I need 10Gi, ReadWriteOnce"
   |
   v
StorageClass  -- "use provisioner cinder.csi.openstack.org, ceph-ssd backend"
   |
   v
PersistentVolume (PV)  -- created dynamically, represents the actual Cinder volume
   |
   v
Cinder Volume (in OpenStack)  -- an RBD image (if Ceph-backed) or LVM/iSCSI volume
```

### Full Lifecycle Diagram
```
1. User creates PVC
        |
        v
2. csi-provisioner (Cinder CSI) sees unbound PVC --> calls Cinder API
        |
        v
3. Cinder creates the volume; CSI creates a matching PV object in K8s,
   binding it to the PVC
        |
        v
4. Scheduler places the Pod on some Node (Nova VM)
        |
        v
5. csi-attacher (Cinder CSI) calls Nova's "attach volume" API,
   attaching the Cinder volume to that specific Node's VM
        |
        v
6. csi-node plugin (on that Node) formats (if new) and mounts the
   block device into the Pod's container filesystem
        |
        v
7. Pod runs with a real persistent, network-backed disk at its mountPath
```

### Example: Pod Using a Cinder-backed PVC
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: db-pod
spec:
  containers:
    - name: postgres
      image: postgres:16
      volumeMounts:
        - mountPath: /var/lib/postgresql/data
          name: pgdata
  volumes:
    - name: pgdata
      persistentVolumeClaim:
        claimName: my-data
```

### Key Behaviors
- **ReadWriteOnce (RWO)**: A Cinder volume can only be attached to **one Nova VM (Node) at a time** â€” matches Cinder's own single-attach nature (unless multi-attach volume types are used).
- **Pod rescheduling**: If a Node dies, Kubernetes must first **detach** the Cinder volume (via CSI/Nova) before it can attach it to a new Node and reschedule the Pod there â€” this can cause a delay (volume detach/attach isn't instant).
- **Snapshots**: Kubernetes `VolumeSnapshot` objects can map directly to **Cinder snapshots**, which (if Ceph-backed) are near-instant CoW operations.

### Analogy
This is the Kubernetes equivalent of ordering a **shipping container (PVC)** from a catalog (StorageClass). The **warehouse (Cinder)** builds the actual container, and when your truck (Pod's Node) is ready to load, a **crane (CSI attacher)** physically bolts the container onto that specific truck â€” and if the truck breaks down, the container must be unbolted before a new truck can pick it up.

---

## 23. Kubernetes â†’ OpenStack API Interaction

### Definition
This section summarizes **all the ways** Kubernetes components authenticate and call into OpenStack APIs â€” tying together CCM, Cinder CSI, and general cluster provisioning tools.

### Unified Auth Flow
```
   cloud-config / clouds.yaml (credentials: username, password, project, auth_url)
                 |
                 v
   Kubernetes components request a token from Keystone
   (using gophercloud, the Go equivalent of openstacksdk)
                 |
                 v
   Keystone returns a scoped token (project + role, e.g. "member" or specific
   least-privilege role recommended for CCM/CSI service accounts)
                 |
                 v
   Token attached as "X-Auth-Token" header on all subsequent
   Nova / Neutron / Cinder / Octavia API calls
```

### Which K8s Component Talks to Which OpenStack Service
```
   +---------------------------+-------------------------------------+
   | Kubernetes Component       | OpenStack APIs Called                |
   +---------------------------+-------------------------------------+
   | OpenStack CCM (Node ctrl)  | Nova (instance metadata, existence)   |
   | OpenStack CCM (Svc ctrl)   | Octavia (LB), Neutron (floating IPs)  |
   | Cinder CSI (controller)    | Cinder (volume create/delete/snapshot)|
   | Cinder CSI (attacher)      | Nova (volume-attach/detach API)       |
   | Cluster API Provider (CAPO)| Nova, Neutron, Glance (full cluster    |
   |                             | lifecycle: create Node VMs, networks) |
   | Magnum (if used)           | Heat (drives Nova/Neutron/Cinder      |
   |                             | to build the entire K8s cluster)      |
   +---------------------------+-------------------------------------+
```

### Recommended Practice: Least-Privilege Service Account
Operators typically create a **dedicated Keystone project + user** (e.g., `k8s-cloud-provider`) with only the roles needed (`member` on relevant project, sometimes a custom `load-balancer_member` role for Octavia), rather than using admin credentials â€” following the principle of least privilege since CCM/CSI credentials live inside the cluster (as Kubernetes Secrets).

```bash
openstack project create k8s-project
openstack user create --project k8s-project --password-prompt k8s-ccm-user
openstack role add --user k8s-ccm-user --project k8s-project member
```

```yaml
# Stored as a Kubernetes Secret, mounted into CCM/CSI pods
apiVersion: v1
kind: Secret
metadata:
  name: cloud-config
  namespace: kube-system
stringData:
  cloud.conf: |
    [Global]
    auth-url=https://cloud.example.com:5000/v3
    username=k8s-ccm-user
    password=********
    tenant-name=k8s-project
    domain-name=Default
```

### Analogy
Every Kubernetes component that needs something from OpenStack carries its own **ID badge (token)**, scoped to only the **departments it's allowed to enter** (Nova for CCM's node-tracking, Cinder+Nova for CSI's storage-attach, Octavia+Neutron for load balancer management) â€” rather than a master key that opens every door in the building.

---

## 24. OpenStack Troubleshooting

### General Troubleshooting Philosophy
OpenStack failures are almost always traceable through **one of three lenses**:
1. **Is the API reachable and authenticated?** (Keystone, HAProxy, network)
2. **Is the message making it through RabbitMQ to the right agent?**
3. **Is the state consistent in the database (Galera)?**

### The "First Response" Checklist
```
1. Can you get a token?          -> openstack token issue
2. Is the specific service API up? -> openstack <service> service list / endpoint list
3. Are the service's own agents/workers running & healthy?
       -> systemctl status <service> (or `openstack compute service list`,
          `openstack network agent list`)
4. Check logs on the RIGHT node (api log vs scheduler log vs agent log)
5. Check RabbitMQ queue depth (backlog = a consumer is stuck/dead)
6. Check Galera cluster state (wsrep_cluster_size, wsrep_local_state_comment)
```

### Useful Diagnostic Commands
```bash
# Identity / Auth
openstack token issue
openstack endpoint list

# Compute service health (per-host agent status)
openstack compute service list
# look for "state = down" or "status = disabled"

# Networking agent health
openstack network agent list

# Volume service health
openstack volume service list

# Nova instance-specific debugging
openstack server show <instance-id>
openstack server event list <instance-id>     # timeline of what happened
nova instance-action-list <instance-id>       # deprecated but useful historically

# Logs (typical locations, varies by deployment tool)
/var/log/nova/nova-api.log
/var/log/nova/nova-scheduler.log
/var/log/nova/nova-compute.log      (on the compute node!)
/var/log/neutron/neutron-server.log
/var/log/neutron/*-agent.log        (on network/compute nodes)
```

### Common Failure Signatures
| Symptom | Likely Cause | Where to Look |
|---|---|---|
| `401 Unauthorized` on any API call | Expired/invalid token, clock skew, wrong project scope | Keystone logs, NTP sync |
| Instance stuck in `BUILD` | Scheduler can't find a host / compute agent not reporting | `nova-scheduler.log`, `openstack compute service list` |
| Instance stuck in `ERROR` | Compute-node failure (image, disk, hypervisor error) | `nova-compute.log` on that host, `openstack server event list` |
| Instance has no network | DHCP agent, L2 agent, or security group misconfig | `neutron-dhcp-agent.log`, `neutron-openvswitch-agent.log` |
| Volume attach fails | Cinder backend unreachable, iSCSI/RBD auth issue | `cinder-volume.log`, `nova-compute.log` |
| Slow API responses cluster-wide | Galera node desynced, RabbitMQ queue backlog, Memcached down | `wsrep_local_state_comment`, RabbitMQ mgmt UI queue depth |
| Everything down after 1 controller reboot | HA misconfiguration â€” quorum lost | Check Galera/RabbitMQ cluster size (should tolerate N-1 failures) |

### Analogy
Troubleshooting OpenStack is like **tracing a lost package through a postal system**: first confirm the sender had valid postage (auth), then check if the local post office accepted it (API), then trace which sorting facility it went through (RabbitMQ), and finally check the central records office (database) to see the last confirmed location.

---

## 25. API â†’ Scheduler â†’ Compute â†’ Network â†’ Storage Debugging

### The Canonical "Boot an Instance" Path
This is the most important flow to understand for debugging â€” nearly every Nova issue maps to a step in this chain.

```
 1. openstack server create ...
          |
          v
 2. nova-api  (validates request, quota check, writes DB record: status=BUILD)
          |
          v (RPC via RabbitMQ)
 3. nova-conductor (mediates DB access for compute nodes; fetches details)
          |
          v (RPC via RabbitMQ)
 4. nova-scheduler (filters + weighs hosts: RAM, CPU, AZ, affinity rules)
          |    picks best compute host
          v (RPC via RabbitMQ, targeted at chosen host's queue)
 5. nova-compute (on chosen host)
          |
          +--> 5a. Glance: download/verify image
          |
          +--> 5b. Neutron: request port creation (get IP, security group applied)
          |
          +--> 5c. Cinder: (if boot-from-volume) attach/create volume
          |
          +--> 5d. libvirt/QEMU/KVM: actually create and boot the VM
          |
          v
 6. nova-compute reports "active" back via RabbitMQ --> nova-conductor
    updates DB status=ACTIVE
          |
          v
 7. openstack server show now returns ACTIVE with IP address
```

### Debugging at Each Stage

**Stage 2 â€” nova-api**
```bash
# Check quota issues
openstack quota show <project>
# Check nova-api.log for 4xx/5xx errors
tail -f /var/log/nova/nova-api.log
```

**Stage 4 â€” nova-scheduler**
```
Symptom: "No valid host was found" error
Causes:
  - Not enough RAM/CPU/disk on any compute host matching the flavor
  - Availability zone / host aggregate filter excludes all hosts
  - PCI/NUMA/CPU-pinning requirements can't be satisfied anywhere
Check: nova-scheduler.log, "openstack hypervisor stats show"
```

**Stage 5 â€” nova-compute + Neutron port**
```
Symptom: Instance ACTIVE but "port binding failed" / no IP
Causes:
  - neutron-openvswitch-agent (or equivalent) down on that compute host
  - VLAN/VXLAN misconfiguration, physical NIC mapping wrong
Check: neutron-server.log (port creation), 
       neutron-openvswitch-agent.log (ON THE COMPUTE HOST)
       ovs-vsctl show   (inspect actual OVS bridge state on the host)
```

**Stage 5c â€” Cinder (boot from volume)**
```
Symptom: Instance stuck in BUILD, "block device mapping" errors
Check: cinder-volume.log, cinder-scheduler.log
       openstack volume show <vol-id>   # check status: available/error/attaching
```

**Stage 5d â€” libvirt/QEMU**
```
Symptom: Instance in ERROR with hypervisor-level failure
Check: /var/log/libvirt/qemu/<instance-id>.log  (on compute host)
       virsh list --all
       virsh dumpxml <instance-id>   # inspect actual domain XML
```

### Visual Summary: Where Each Log Lives
```
Controller Node(s):
   nova-api.log, nova-scheduler.log, nova-conductor.log
   neutron-server.log
   cinder-api.log, cinder-scheduler.log
   keystone.log

Compute Node(s):
   nova-compute.log
   neutron-<l2-agent>.log (e.g. neutron-openvswitch-agent.log)
   libvirt/qemu/<instance>.log

Storage Node(s) (if Cinder backend is not Ceph, e.g. LVM):
   cinder-volume.log

Network Node(s) (if using legacy DVR/centralized routing):
   neutron-l3-agent.log
   neutron-dhcp-agent.log
```

### Analogy
This flow is like **tracking a food delivery order end-to-end**: order placed (API) â†’ kitchen dispatcher decides which cook has capacity (scheduler) â†’ assigned cook actually prepares food (compute) â†’ delivery driver assigned + route calculated (network/Neutron) â†’ payment/inventory settled (storage/Cinder) â†’ order marked "delivered" (ACTIVE). A stuck order means checking exactly which stage's logbook shows the holdup.

---

## 26. OpenStack Service-to-Service Communication

### Two Communication Channels
OpenStack services talk to each other through **exactly two channels**:

1. **Synchronous REST (HTTP/JSON)** â€” for direct, immediate cross-service API calls (e.g., Nova calling Neutron to create a port, or Nova calling Cinder to attach a volume)
2. **Asynchronous RPC (RabbitMQ / oslo.messaging)** â€” for internal communication **within** a service's own components (nova-api â†’ nova-conductor â†’ nova-scheduler â†’ nova-compute)

```
                    Cross-Service Calls (REST/HTTP, via Keystone-authenticated tokens)
     Nova  <--------------------------------------------------------------->  Neutron
       |                                                                          |
       |  <--------------------------------------------------------------->  Cinder
       |                                                                          |
       |  <--------------------------------------------------------------->  Glance
       |
       v  (internal, via RabbitMQ RPC)
   nova-conductor <---> nova-scheduler <---> nova-compute(s)
```

### Example: Booting a Volume-Backed Instance (cross-service REST)
```
nova-compute
     |
     |-- REST call --> Glance:  "give me image metadata"
     |
     |-- REST call --> Neutron: "create a port for this instance, in this network"
     |                          (Neutron replies with IP + MAC)
     |
     |-- REST call --> Cinder:  "create/attach volume for this instance"
     |                          (Cinder replies with volume ID + connection info)
     |
     v
  libvirt/QEMU boots the VM using the returned network + storage details
```

### Service Catalog & Keystone's Role
Every cross-service call first requires knowing **where** the target service's API lives. This is resolved via Keystone's **Service Catalog**:
```bash
openstack catalog list
# Shows each service's public/internal/admin endpoint URLs
```
When `nova-compute` needs to call Neutron, it doesn't hardcode Neutron's URL â€” it asks Keystone (or uses a cached catalog) for Neutron's current **internal endpoint**, then attaches a valid token to the request.

### Notifications (Event-Driven, Loosely Coupled)
Beyond direct RPC/REST, services also emit **notifications** onto RabbitMQ that other services can optionally subscribe to â€” without tight coupling:
```
nova-compute --[notify: instance.create.end]--> notification exchange
                                                        |
                                   +--------------------+-------------------+
                                   v                                        v
                          Ceilometer/Telemetry                    Custom billing system
                          (records usage for metering)             (any consumer can listen)
```

### Analogy
Think of it as a company where:
- **Departments (services)** call each other directly via **phone (REST)** when they need something specific right now ("Neutron, please connect this new phone line").
- Within a **single department**, employees pass notes through the **internal mailroom (RabbitMQ RPC)** for routine internal coordination.
- The company also has a **PA system (notifications)** that broadcasts events ("New hire started") which any interested department can tune into, without the originating department needing to know who's listening.

---

## 27. Controller Node vs Compute Node vs Network Node vs Storage Node

### Definitions & Roles

| Node Type | Runs | Purpose |
|---|---|---|
| **Controller Node** | `nova-api`, `nova-scheduler`, `nova-conductor`, `neutron-server`, `cinder-api`, `cinder-scheduler`, `keystone`, `glance-api`, `horizon`, Galera, RabbitMQ, Memcached, HAProxy | The "brain" â€” accepts API requests, makes decisions, holds cluster state |
| **Compute Node** | `nova-compute`, hypervisor (KVM/QEMU via libvirt), Neutron L2 agent (e.g. `neutron-openvswitch-agent`) | Actually runs tenant VMs |
| **Network Node** (in classic/legacy architectures) | `neutron-l3-agent`, `neutron-dhcp-agent`, `neutron-metadata-agent`, sometimes Octavia components | Handles routing, NAT, DHCP, floating IPs â€” centralizes north-south traffic (largely replaced by **DVR â€” Distributed Virtual Routing**, which pushes this onto compute nodes instead) |
| **Storage Node** | Cinder-volume (if not Ceph), or Ceph OSD/MON/MGR daemons | Provides actual block/object storage backend |

### Visual: Classic 4-Node-Type Architecture

```
+------------------+   +------------------+   +------------------+   +------------------+
|  Controller Node  |   |   Compute Node    |   |   Network Node    |   |  Storage Node     |
|------------------|   |------------------|   |------------------|   |------------------|
| nova-api           |   | nova-compute       |   | neutron-l3-agent   |   | Ceph OSD daemons   |
| nova-scheduler      |   | libvirt/KVM/QEMU   |   | neutron-dhcp-agent |   | (or cinder-volume  |
| nova-conductor      |   | neutron-ovs-agent  |   | neutron-metadata-  |   |  w/ LVM backend)   |
| neutron-server      |   | (runs tenant VMs)  |   |   agent            |   |                    |
| cinder-api/scheduler|   |                    |   | (handles floating  |   |                    |
| keystone            |   |                    |   |  IPs / NAT / DHCP) |   |                    |
| glance-api          |   |                    |   |                    |   |                    |
| Galera / RabbitMQ   |   |                    |   |                    |   |                    |
+------------------+   +------------------+   +------------------+   +------------------+
          ^                        ^                       ^                     ^
          |                        |                       |                     |
          +------------------------+-----------------------+---------------------+
                              Management Network (all nodes)
```

### Modern Trend: DVR (Distributed Virtual Routing)
In many modern deployments, the dedicated "Network Node" role is **eliminated** â€” routing (`neutron-l3-agent` functions) is distributed onto **compute nodes** directly, so each compute node can route its own VMs' north-south traffic without a centralized bottleneck. DHCP agents may still be centralized or also distributed.

```
   Legacy (Network Node = single choke point for external traffic)
        VM --> compute node --> [ALL traffic routed through Network Node] --> Internet

   DVR (Distributed)
        VM --> compute node (has its own router namespace) --> Internet directly
        (Network node, if it exists, only handles SNAT for traffic without a Floating IP)
```

### Physical vs Logical Separation
In small deployments (e.g., DevStack, small labs), **all roles can run on a single node**. In production, they're physically separated for:
- **Fault isolation** (a compute node crash shouldn't kill the API)
- **Independent scaling** (add more compute nodes without touching controllers)
- **Security boundaries** (storage/network traffic isolated from tenant traffic)

### Analogy
- **Controller Node** = the **corporate HQ** (decision-making, records, reception desk)
- **Compute Node** = the **factory floor** (where the actual product â€” VMs â€” gets built and run)
- **Network Node** = the **shipping/receiving dock** (all goods in/out pass through, or in the modern DVR model, every factory floor has its own loading dock)
- **Storage Node** = the **warehouse** (raw materials and finished goods storage)

---

## 28. OpenStack Deployment Architecture

### Reference Minimal Production Topology

```
                          +-------------------+
                          |  External Network   |
                          |  (public internet /  |
                          |   provider network)  |
                          +----------+-----------+
                                     |
                        +------------+-------------+
                        |     Load Balancer/VIP      |
                        |  (Keepalived + HAProxy)    |
                        +------------+-------------+
                                     |
      +------------------------------+------------------------------+
      |                              |                                |
+-------------+              +-------------+                  +-------------+
| Controller-1 |              | Controller-2 |                  | Controller-3 |
+-------------+              +-------------+                  +-------------+
      |                              |                                |
      +------------------------------+------------------------------+
                                     |
                          Management Network (internal API/DB/MQ traffic)
                                     |
      +----------------+----------------+----------------+----------------+
      |                |                |                |                |
+-----------+   +-----------+    +-----------+    +-----------+   +-----------+
| Compute-1  |   | Compute-2  |    | Compute-N  |    |  Storage   |   | (optional)|
| (nova-     |   | (nova-     |    | (nova-     |    |  Node(s)   |   | Network    |
|  compute)  |   |  compute)  |    |  compute)  |    | (Ceph OSD) |   | Node(s)    |
+-----------+   +-----------+    +-----------+    +-----------+   +-----------+
      |                |                |                |
      +----------------+----------------+----------------+
                                     |
                        Tenant/Overlay Network (VM traffic, VXLAN/GRE)
                                     |
                        Storage Network (Ceph public/cluster network)
```

### Network Segmentation (Best Practice)
| Network | Purpose |
|---|---|
| **Management/API network** | Controller-to-controller, controller-to-compute API/DB/RabbitMQ traffic |
| **Tenant/overlay network** | East-west VM-to-VM traffic (VXLAN/GRE encapsulated) |
| **External/provider network** | North-south traffic â€” floating IPs, internet access |
| **Storage network** | Dedicated network for Cinder/Ceph traffic (often split into "public" client-facing and "cluster" replication-only networks for Ceph) |

Segmenting these onto **separate physical NICs/VLANs** prevents storage replication traffic from competing with tenant VM traffic or management API calls.

### Deployment Tools
| Tool | Approach |
|---|---|
| **Kolla-Ansible** | Deploys OpenStack as **Docker/Podman containers**, orchestrated by Ansible playbooks |
| **OpenStack-Ansible (OSA)** | Deploys OpenStack inside **LXC containers**, orchestrated by Ansible |
| **TripleO** ("OpenStack on OpenStack") | Uses a small "undercloud" OpenStack (with Ironic bare-metal) to deploy the production "overcloud" |
| **DevStack** | Single-node, source-based install â€” for development/testing only, not production |
| **MicroStack / OpenStack-Helm** | Snap-based or Kubernetes-based (Helm charts) deployment options |

### Scaling Dimensions of the Architecture
- **Controllers**: scale for API throughput and HA (typically stay at 3, sometimes split further into dedicated DB/MQ clusters at very large scale)
- **Compute**: scale horizontally, essentially unlimited (add more hypervisor hosts)
- **Storage**: scale by adding Ceph OSD nodes (more capacity + IOPS)
- **Network**: with DVR, scales naturally with compute nodes; legacy centralized network nodes need their own HA/scaling plan

### Analogy
This is a **factory campus blueprint**: HQ buildings (controllers) triplicated for redundancy, connected by a private admin road (management network) to many factory floors (compute nodes) which connect via a separate delivery road (tenant network) to the warehouse (storage nodes), all guarded by a single main gate (VIP/HAProxy) that the outside world uses to reach HQ.

---

## 29. Scaling OpenStack

### Scaling Dimensions

```
                    +-----------------------------------------+
                    |          What needs to scale?              |
                    +-----------------------------------------+
                                |
           +--------------------+---------------------+
           |                    |                      |
     Control Plane         Compute Capacity        Storage Capacity
     (API throughput,      (# of VMs / tenants)     (IOPS / raw TB)
      DB/MQ capacity)
```

### 1. Control Plane Scaling
- Add more **controller nodes behind HAProxy** for API throughput (usually plateaus around 3-7 nodes before diminishing returns / DB becomes the bottleneck)
- Split databases: run a **dedicated Galera cluster** separate from RabbitMQ hosts once load grows
- Consider **Cells v2** in Nova â€” partitions a single OpenStack deployment's compute fleet into multiple "cells," each with its own conductor/DB, all fronted by one global API â€” used by very large deployments (thousands of hypervisors) to avoid a single giant DB/scheduler bottleneck

```
                 +------------------+
                 |   nova-api (global)|
                 +---------+----------+
                           |
              +------------+------------+
              |                         |
        +-----------+            +-----------+
        |   Cell 0    |            |   Cell 1    |
        | (DB for     |            | (own DB,    |
        |  metadata)  |            |  conductor, |
        +-----------+            |  scheduler) |
                                   +-----------+
                                          |
                                +---------+---------+
                                |                   |
                          Compute hosts         Compute hosts
                          (subset 1)             (subset 2)
```

### 2. Compute Scaling
- Simply **add more hypervisor hosts** â€” Nova's scheduler naturally spreads load
- Use **host aggregates / availability zones** to logically group hardware (e.g., GPU hosts, high-memory hosts) so the scheduler can target the right hardware for the right flavor
- Watch **oversubscription ratios** (CPU/RAM overcommit) â€” too aggressive causes noisy-neighbor problems

### 3. Storage Scaling
- **Ceph scales by adding OSD nodes** â€” more OSDs = more capacity AND more aggregate IOPS (parallelism across more disks)
- Ceph automatically rebalances data (`CRUSH` algorithm) when new OSDs join â€” no manual data migration needed
- For Cinder without Ceph (e.g., LVM), scaling means adding more **cinder-volume backend nodes**, each owning its own storage pool

### 4. Network Scaling
- **DVR** removes the network-node bottleneck by distributing routing to compute nodes (Section 27)
- Use **provider networks (VLAN)** instead of purely overlay (VXLAN) for very high-throughput workloads where overlay encapsulation overhead matters
- Scale **Octavia** by increasing amphora flavor size or using **Active-Active amphora** (multiple active amphorae, not just active-standby) for very high-traffic load balancers

### Horizontal vs Vertical Scaling Table
| Layer | Horizontal (add more nodes) | Vertical (bigger nodes) |
|---|---|---|
| Controllers | Yes, up to a point (DB becomes bottleneck) | Helps DB/MQ throughput |
| Compute | Yes, essentially unlimited | Bigger hosts = more VM density per host |
| Storage (Ceph) | Yes, preferred approach | Bigger OSD disks, but limits parallelism |
| Network | DVR spreads load across composes | Bigger network-node NICs (legacy model) |

### Analogy
Scaling OpenStack is like scaling a **city**: you can build more office branches (controllers, up to a point before city hall itself becomes the bottleneck), you can zone and build more factories (compute nodes, nearly unlimited), and you can expand the warehouse district (storage nodes) â€” but you eventually also need to widen the roads (network) or the whole system jams regardless of how many buildings you've added.

---

## 30. Failure Scenarios & Recovery

### Scenario 1: A Compute Node Dies
```
Symptom: openstack compute service list shows host as "down"
         VMs on that host are unreachable but still show ACTIVE in DB
         (Nova doesn't know for certain the VM is dead, just that the host agent stopped reporting)

Recovery:
1. Confirm the host is truly down (not just network-partitioned) â€”
   critical, because evacuating onto a live host while the "dead" host
   is actually still running risks DUPLICATE running VMs / data corruption
2. Fence the host if possible (power off via IPMI) to guarantee it's dead
3. openstack compute service set --disable <dead-host> nova-compute
4. nova evacuate (or `openstack server rebuild`/evacuate API) to rebuild
   affected instances on healthy hosts â€” 
   NOTE: only works cleanly for boot-from-volume or shared-storage
   (e.g., Ceph-backed) instances, since ephemeral local-disk VMs
   lose their disk entirely if the host is gone
```

### Scenario 2: A Controller Node Dies
```
Symptom: HAProxy/VIP fails over; cluster continues operating on remaining
         controllers (if HA is properly configured)

Recovery:
1. Confirm Galera cluster size dropped but still has quorum (>=2 of 3)
2. Confirm RabbitMQ cluster still has quorum
3. Bring the dead controller back and rejoin:
   - Galera: node auto-rejoins and performs State Snapshot Transfer (SST)
     or Incremental State Transfer (IST) to resync
   - RabbitMQ: node rejoins cluster, queues resync (mirrored/quorum queues)
4. If ALL controllers are down simultaneously (rare, catastrophic):
   Galera requires a manual "bootstrap" of the cluster from the node
   with the most recent data (identified via `grastate.dat` seqno)
   -- this is a manual, careful operation to avoid data loss/split-brain
```

### Scenario 3: RabbitMQ Cluster Loses Quorum
```
Symptom: Services appear "up" but API calls hang/timeout
         (e.g., "openstack server create" hangs at BUILD forever
          because nova-conductor can't get a response from nova-scheduler)

Recovery:
1. Check RabbitMQ cluster status: rabbitmqctl cluster_status
2. If minority partition â€” those nodes will refuse operations (by design,
   to prevent split-brain) until quorum is restored
3. Restart/rejoin the missing node(s); with quorum queues, once quorum
   nodes are back, message processing auto-resumes
```

### Scenario 4: Ceph OSD/Node Failure
```
Symptom: Ceph cluster HEALTH_WARN, "PGs degraded"
         Cinder volumes remain accessible (data is replicated, typically 3x)
         but with reduced redundancy until recovery completes

Recovery:
1. Ceph automatically starts re-replicating degraded placement groups (PGs)
   to other healthy OSDs using CRUSH map rules
2. If a whole node is lost, replace/re-add it; Ceph rebalances automatically
3. Never manually intervene with `ceph osd out`/`in` during active recovery
   unless you fully understand the CRUSH implications
4. Monitor with: ceph -s / ceph health detail
```

### Scenario 5: Neutron Agent Down on a Compute Host
```
Symptom: VMs on that host lose new port bindings / security group updates
         don't apply; existing traffic may still flow (data plane vs
         control plane are somewhat decoupled in OVS)

Recovery:
1. openstack network agent list  --> identify agent marked "down" (state=XXX)
2. Restart the agent service (e.g., neutron-openvswitch-agent) on that host
3. Check ovs-vsctl show for stale/broken bridge state if restart doesn't fix it
```

### General Recovery Principles
1. **Never restore quorum-based systems (Galera/RabbitMQ) by force without checking for split-brain risk** â€” bootstrapping from the wrong node can silently lose data.
2. **Prefer automated self-healing** (Ceph rebalancing, Galera IST/SST, RabbitMQ mirror resync) over manual intervention wherever the system supports it.
3. **Instance evacuation only works reliably with network-backed storage** (Ceph/Cinder) â€” ephemeral local-disk instances are unrecoverable if the host disk is lost.
4. **Always confirm true failure (fencing) before triggering evacuation**, to avoid two copies of the same VM running simultaneously with conflicting IPs.

### Analogy
Failure recovery in OpenStack is like a **hospital's emergency protocol**: when one wing (controller/compute node) goes offline, the triage desk (HAProxy) redirects patients (traffic) to the remaining wings automatically. But if the whole hospital network goes dark simultaneously, you can't just flip the lights back on carelessly (force-bootstrap) â€” you need a careful, single "chief of staff" decision (identify the most up-to-date node) to avoid conflicting patient records (split-brain data corruption) when everything reconnects.

---

## Summary Cheat Sheet

| Concept | One-Line Takeaway |
|---|---|
| Octavia | Tenant load balancing via dedicated amphora VMs |
| Listener/Pool/Member | Door â†’ Department â†’ Staff hierarchy |
| VIP/Health Monitor | Stable address + automatic "are you alive?" checks |
| L4 vs L7 | Envelope routing vs reading the letter |
| Ceph | Unified distributed storage backend for images/volumes/objects |
| Cinder+Ceph | Volumes are network-attached RBD images, enabling live migration |
| KVM/QEMU | Kernel accelerator + userspace device emulator = the hypervisor |
| RabbitMQ | Internal mailroom for OpenStack service components |
| Galera | Synchronous multi-master SQL cluster, needs quorum |
| Memcached | Sticky-note cache to avoid hammering the DB (esp. Keystone tokens) |
| HAProxy | Load balances OpenStack's OWN API services + DB traffic |
| Control Plane HA | Triplicated everything + VIP failover + quorum-based clustering |
| Heat | OpenStack-native declarative orchestration (HOT templates) |
| Terraform | Multi-cloud IaC, drift-aware, HCL |
| Ansible | Idempotent procedural automation; also deploys OpenStack itself |
| SDKs | Programmatic, unified API access (`openstacksdk`, `gophercloud`) |
| K8s on OpenStack | Two orchestration layers: VMs (OpenStack) hosting containers (K8s) |
| OpenStack CCM | Bridges K8s Nodes/Services to Nova/Octavia |
| Cinder CSI | Dynamically provisions/attaches Cinder volumes as K8s PVs |
| Neutron CNI | Overlay CNI (independent) vs Kuryr (pods as real Neutron ports) |
| K8s Service LB | CCM auto-provisions an Octavia LB for `type=LoadBalancer` |
| K8s PV+Cinder | PVC â†’ CSI â†’ Cinder volume â†’ attached to Node VM â†’ mounted in Pod |
| K8sâ†’OpenStack API | Every component authenticates via scoped Keystone tokens |
| Troubleshooting | Check auth â†’ API â†’ agents â†’ RabbitMQ â†’ Galera, in that order |
| APIâ†’Storage debug | Follow the exact boot chain: apiâ†’conductorâ†’schedulerâ†’computeâ†’network/storage |
| Service-to-service | REST for cross-service, RPC for intra-service, notifications for events |
| Node types | Controller=brain, Compute=factory, Network=dock, Storage=warehouse |
| Deployment architecture | Segmented networks + triplicated controllers + scalable compute/storage |
| Scaling | Controllers scale a little, compute/storage scale a lot, network needs DVR |
| Failure recovery | Automate where possible; never force quorum recovery blindly |

---

*End of openstack-part-2.md*
