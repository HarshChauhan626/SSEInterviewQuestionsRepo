# Networking: A Complete Reference for Senior Software Engineers

> A comprehensive, deep-dive reference covering every networking concept a senior software engineer must master — from OSI fundamentals to production troubleshooting in Kubernetes and AWS.

---

## Table of Contents

1. [Networking Fundamentals](#module-1-networking-fundamentals)
2. [IP Addressing](#module-2-ip-addressing)
3. [Routing](#module-3-routing)
4. [TCP](#module-4-tcp)
5. [UDP](#module-5-udp)
6. [DNS](#module-6-dns)
7. [HTTP](#module-7-http)
8. [HTTP Versions](#module-8-http-versions)
9. [HTTPS / TLS](#module-9-https--tls)
10. [Load Balancing](#module-10-load-balancing)
11. [Reverse Proxy & API Gateway](#module-11-reverse-proxy--api-gateway)
12. [Linux Networking](#module-12-linux-networking)
13. [AWS Networking](#module-13-aws-networking)
14. [Kubernetes Networking](#module-14-kubernetes-networking)
15. [Database Networking](#module-15-database-networking)
16. [Kafka Networking](#module-16-kafka-networking)
17. [Distributed Systems Networking](#module-17-distributed-systems-networking)
18. [Networking Security](#module-18-networking-security)
19. [Networking Observability](#module-19-networking-observability)
20. [Production Troubleshooting](#module-20-production-troubleshooting)

---

## Module 1: Networking Fundamentals

### The OSI Model

The **Open Systems Interconnection (OSI) model** is a conceptual framework that standardizes how different network systems communicate with each other. Developed by the International Organization for Standardization (ISO) in 1984, it divides network communication into seven distinct layers, each with a specific responsibility.

Understanding the OSI model is not just academic. When you're debugging a production issue, you mentally walk up and down these layers: "Is the physical link up? Is the IP reachable? Is TCP connecting? Is the application responding?" The model gives you a systematic mental map.

| Layer | Number | Name         | PDU     | Examples                        |
|-------|--------|--------------|---------|---------------------------------|
| 7     | Top    | Application  | Data    | HTTP, SMTP, DNS, FTP, SSH       |
| 6     |        | Presentation | Data    | SSL/TLS, JPEG, MPEG, ASCII      |
| 5     |        | Session      | Data    | NetBIOS, RPC, SQL sessions      |
| 4     |        | Transport    | Segment | TCP, UDP, SCTP                  |
| 3     |        | Network      | Packet  | IP, ICMP, OSPF, BGP             |
| 2     |        | Data Link    | Frame   | Ethernet, Wi-Fi (802.11), ARP   |
| 1     | Bottom | Physical     | Bits    | Cables, fiber, radio waves, NICs|

**Layer 1 – Physical:** Responsible for the actual physical transmission of raw bits over a medium. This layer defines voltages, timing, physical connectors, cable types, and signal modulation. Think of it as the actual wire or radio frequency carrying the 1s and 0s.

**Layer 2 – Data Link:** Responsible for node-to-node delivery on the same network segment. It packages raw bits from Layer 1 into frames, handles MAC addressing, and provides error detection (but not necessarily correction). Ethernet operates here. The Data Link layer is further subdivided into the MAC (Medium Access Control) and LLC (Logical Link Control) sublayers.

**Layer 3 – Network:** Responsible for logical addressing and routing between different networks. IP (Internet Protocol) lives here. Routers operate at this layer, making decisions about how to forward packets toward their destination based on IP addresses.

**Layer 4 – Transport:** Responsible for end-to-end communication between processes on different hosts. TCP provides reliable, ordered delivery; UDP provides fast, unreliable delivery. This layer introduces the concept of ports, which allow multiple services to coexist on a single IP address.

**Layer 5 – Session:** Manages sessions (connections) between applications. Handles session establishment, maintenance, and teardown. In practice, this layer's responsibilities are often absorbed by Layer 4 or Layer 7 protocols.

**Layer 6 – Presentation:** Responsible for data translation, encryption, and compression. Ensures data from one system can be read by another regardless of internal data representation. TLS/SSL encryption is conceptually placed here.

**Layer 7 – Application:** The topmost layer, closest to the user. Provides network services directly to end-user applications. HTTP, HTTPS, DNS, FTP, SMTP, and SSH all operate at this layer.

**A practical note:** In real-world engineering, you rarely think about Layers 5 and 6 independently. They are either handled transparently by the OS or absorbed by Layer 7 protocols.

---

### The TCP/IP Model

The **TCP/IP model** (also called the Internet model or DoD model) is the practical model that the actual Internet is built on. It predates OSI and was developed by DARPA. It has four layers that map roughly to the OSI model:

| TCP/IP Layer    | Maps to OSI Layers | Examples               |
|-----------------|--------------------|------------------------|
| Application     | 5, 6, 7            | HTTP, DNS, SMTP, SSH   |
| Transport       | 4                  | TCP, UDP               |
| Internet        | 3                  | IP, ICMP               |
| Network Access  | 1, 2               | Ethernet, Wi-Fi        |

The TCP/IP model is what engineers work with day-to-day. When you write a web server, you're writing an Application layer application. When you open a socket, you're working with Transport. When you configure IP addresses, you're working with Internet. The Network Access layer is handled by your NIC and driver.

**Why both models exist:** OSI is the theoretical reference model — it's useful for understanding and teaching concepts. TCP/IP is the implementation model — it's what actually runs the internet. Most protocol documentation and networking tools reference both.

---

### Encapsulation and Decapsulation

**Encapsulation** is the process of wrapping data with protocol-specific headers (and sometimes trailers) as it moves down the protocol stack from the application layer to the physical layer.

**Decapsulation** is the reverse: as data travels up the stack on the receiving end, each layer strips off its corresponding header.

**How encapsulation works (sending side):**

```
Application Data: "GET / HTTP/1.1\r\n..."
      ↓ [Transport Layer adds TCP header: src port, dst port, seq num, ack num...]
TCP Segment: [TCP Header | Application Data]
      ↓ [Network Layer adds IP header: src IP, dst IP, TTL, protocol...]
IP Packet:   [IP Header | TCP Header | Application Data]
      ↓ [Data Link Layer adds Ethernet header + trailer: src MAC, dst MAC, CRC]
Ethernet Frame: [Eth Header | IP Header | TCP Header | App Data | Eth Trailer]
      ↓ [Physical Layer converts to bits and transmits]
Bits: 0101001100101...
```

**How decapsulation works (receiving side):**

```
Bits arrive at NIC
      ↓ Physical layer reconstructs frame
Ethernet Frame is processed — MAC addresses checked, CRC verified, header stripped
      ↓ IP packet handed to network layer
IP Packet processed — destination IP checked, TTL decremented, header stripped
      ↓ TCP segment handed to transport layer
TCP Segment processed — checksum verified, sequence numbers managed, header stripped
      ↓ Application data handed to the application
Application reads "GET / HTTP/1.1\r\n..."
```

Each layer only reads its own header; it treats everything else as opaque payload. This is the principle of **layer independence** — the IP layer doesn't care what's inside the TCP segment, and the TCP layer doesn't care what application data it's carrying.

---

### Packet vs Frame vs Segment

These terms are often used interchangeably in casual conversation, but they have precise meanings based on which OSI layer they belong to:

**Segment** (Layer 4 – Transport): A Transport layer PDU. A TCP segment contains a TCP header plus the application data. The header includes source/destination port, sequence number, acknowledgment number, flags, window size, and checksum. UDP's PDU is technically called a **datagram**.

**Packet** (Layer 3 – Network): A Network layer PDU. An IP packet contains an IP header (source IP, destination IP, TTL, protocol, etc.) plus the Transport layer segment as its payload.

**Frame** (Layer 2 – Data Link): A Data Link layer PDU. An Ethernet frame contains an Ethernet header (source MAC, destination MAC, EtherType), an IP packet as payload, and an Ethernet trailer (Frame Check Sequence/CRC).

**Summary:**
- Application sends **data**
- Transport wraps it into a **segment**
- Network wraps that into a **packet**
- Data Link wraps that into a **frame**
- Physical transmits **bits**

When debugging with `tcpdump` or Wireshark, you're capturing frames at the Data Link layer and then dissecting them layer by layer.

---

### MTU and MSS

**MTU (Maximum Transmission Unit)** is the maximum size of a single packet/frame that can be transmitted over a network link, measured in bytes. It includes all headers.

- Standard Ethernet MTU: **1500 bytes**
- Loopback interface MTU: **65536 bytes** (or more)
- Wi-Fi typical MTU: **2304 bytes** (but often constrained to 1500)
- Jumbo frames: **9000 bytes** (used in data centers for performance)

When a packet is larger than the MTU of a link it needs to traverse, one of two things happens:
1. **IP fragmentation:** The packet is split into smaller fragments, each with its own IP header. The destination reassembles them. This is inefficient and can cause issues.
2. **PMTUD (Path MTU Discovery):** The sender discovers the smallest MTU along the path and sends packets no larger than that. It works by setting the "Don't Fragment" (DF) bit in the IP header and relying on ICMP "Fragmentation Needed" messages from routers.

**MSS (Maximum Segment Size)** is a TCP-specific parameter that defines the maximum amount of **data** (excluding TCP and IP headers) in a single TCP segment. MSS is negotiated during the TCP three-way handshake via TCP options.

```
MSS = MTU - IP header size - TCP header size
MSS = 1500 - 20 - 20 = 1460 bytes (typical value)
```

**MTU Mismatch** is a common production problem. If ICMP is blocked by a firewall (which is unfortunately common), PMTUD breaks. Large packets get silently dropped. TCP connections work for small data but fail or hang for large transfers. The fix is often to use **TCP MSS clamping** on routers/firewalls to force a lower MSS.

```bash
# Check interface MTU
ip link show eth0

# Check effective path MTU to a host
tracepath google.com
```

---

### Bandwidth, Throughput, Latency, and Jitter

These four metrics together define the quality of a network connection. Understanding their differences is critical for performance analysis and capacity planning.

**Bandwidth** is the theoretical maximum amount of data that can be transmitted over a network link per unit time. It's like the width of a pipe — it defines the upper limit of what's possible. Measured in bits per second (bps, Mbps, Gbps).

- A 1 Gbps Ethernet link has 1 Gbps of bandwidth
- Bandwidth is a property of the link itself
- You can't exceed bandwidth, but you often won't reach it due to protocol overhead and other factors

**Throughput** is the actual amount of data successfully transferred per unit time. It's always less than or equal to bandwidth. Real-world throughput is affected by:
- Protocol overhead (TCP/IP headers, retransmissions)
- Network congestion
- Application-level bottlenecks
- TCP flow control and congestion control
- Hardware limitations (CPU, disk I/O)

**Latency** (also called **Round-Trip Time or RTT**) is the time it takes for a signal to travel from source to destination and back. Latency is composed of:
- **Propagation delay:** Time for the signal to physically travel across the medium (bounded by the speed of light). New York to London is roughly 70ms propagation.
- **Transmission delay:** Time to push all bits onto the wire = packet size / bandwidth
- **Processing delay:** Time routers spend processing packet headers
- **Queuing delay:** Time spent waiting in router buffers when the network is congested

Latency is especially important for:
- Interactive applications (gaming, video calls, trading)
- Many small requests (REST API calls, database queries)
- TCP's performance (high latency multiplies the effect of slow-start)

**Jitter** is the variation in latency over time. In a perfect network, every packet would arrive with the same delay. In reality, packets may arrive with varying delays depending on queuing, routing decisions, and load. Jitter is particularly problematic for:
- Real-time audio/video (VoIP, video conferencing)
- Streaming media
- Gaming

High jitter can be mitigated with **jitter buffers**, which add a fixed delay to smooth out variations, at the cost of increased overall latency.

**The Bandwidth-Latency Product** is an important concept: it represents the amount of data "in flight" in the network at any given time.

```
Bandwidth-Latency Product = Bandwidth × RTT
Example: 1 Gbps link with 100ms RTT = 100 Mb "in flight"
```

This matters for TCP performance — the TCP window size must be large enough to fill the pipe. A small window on a high-latency, high-bandwidth link severely limits throughput.

---

## Module 2: IP Addressing

### IPv4

**IPv4 (Internet Protocol version 4)** uses 32-bit addresses, written in dotted-decimal notation: four octets (8-bit groups), each ranging from 0 to 255, separated by dots.

```
Example: 192.168.1.100
Binary:  11000000.10101000.00000001.01100100
```

IPv4 provides 2^32 = ~4.3 billion unique addresses. This seemed plenty in the 1970s, but address exhaustion became a real problem. IANA allocated the last blocks of IPv4 addresses to regional registries in 2011. Today, the internet runs on a combination of IPv4 (with NAT) and the gradual deployment of IPv6.

**Address Classes (historical, mostly replaced by CIDR):**

| Class | Range                       | Default Mask  | Usage                        |
|-------|-----------------------------|---------------|------------------------------|
| A     | 1.0.0.0 – 126.0.0.0        | /8            | Large organizations          |
| B     | 128.0.0.0 – 191.255.0.0    | /16           | Medium organizations         |
| C     | 192.0.0.0 – 223.255.255.0  | /24           | Small organizations          |
| D     | 224.0.0.0 – 239.255.255.255| N/A           | Multicast                    |
| E     | 240.0.0.0 – 255.255.255.255| N/A           | Experimental/Reserved        |

**Special addresses:**
- `0.0.0.0` — "This host" or "all interfaces" (used in binding)
- `127.0.0.1` — Loopback (localhost)
- `255.255.255.255` — Limited broadcast
- `169.254.x.x` — Link-local (APIPA, assigned when DHCP fails)

---

### Public vs Private IP Addresses

**Private IP addresses** are reserved for use within private networks and are not routable on the public internet. Defined in RFC 1918:

| Range                         | CIDR Notation | Common Usage                    |
|-------------------------------|---------------|---------------------------------|
| 10.0.0.0 – 10.255.255.255    | 10.0.0.0/8    | Large enterprise networks       |
| 172.16.0.0 – 172.31.255.255  | 172.16.0.0/12 | Medium networks, Docker default |
| 192.168.0.0 – 192.168.255.255| 192.168.0.0/16| Home and small office networks  |

Private addresses are free to use and can be reused across different private networks without conflict, since they never appear on the public internet (NAT handles translation).

**Public IP addresses** are globally unique addresses assigned by IANA through regional registries (ARIN, RIPE, APNIC, etc.) to organizations. Any device with a public IP is directly addressable from anywhere on the internet (firewalls permitting).

**Why this matters in practice:**
- Your home router has one public IP (from your ISP) and uses NAT to share it across all your devices with private IPs
- In AWS, EC2 instances in private subnets have private IPs and reach the internet through a NAT Gateway
- Services that need to receive inbound traffic require either a public IP or port forwarding through NAT

---

### CIDR Notation

**CIDR (Classless Inter-Domain Routing)** notation replaces the old class-based system with a more flexible way of specifying IP address ranges. It uses a prefix length (the number of bits in the network portion of the address) written after a slash.

```
Format: <IP address>/<prefix length>
Example: 192.168.1.0/24
```

**How to read CIDR:**
- The prefix length tells you how many bits are fixed (network portion)
- The remaining bits are available for host addresses
- `/24` means 24 bits fixed, 8 bits for hosts = 256 addresses (254 usable)

**Subnet mask conversion:**
```
/24 → 255.255.255.0     (11111111.11111111.11111111.00000000)
/16 → 255.255.0.0       (11111111.11111111.00000000.00000000)
/8  → 255.0.0.0         (11111111.00000000.00000000.00000000)
/28 → 255.255.255.240   (11111111.11111111.11111111.11110000)
```

**Calculating addresses in a CIDR block:**
```
Number of addresses = 2^(32 - prefix length)
/24 → 2^8  = 256   addresses (254 usable)
/16 → 2^16 = 65536 addresses
/28 → 2^4  = 16    addresses (14 usable)
/32 → 2^0  = 1     address (a single host)
/0  → 2^32 = all addresses (the entire internet)
```

The first address in a block is the **network address** and the last is the **broadcast address**; neither can be assigned to a host.

---

### Subnetting

**Subnetting** is the practice of dividing a larger network (IP block) into smaller sub-networks (subnets). It allows better organization, security segmentation, and efficient use of address space.

**Why subnet?**
- Security: Isolate sensitive systems (databases) from public-facing servers
- Organization: Group related systems logically
- Traffic management: Contain broadcast domains
- AWS requirement: Each availability zone needs its own subnet

**Subnetting example:**

Given: `10.0.0.0/16` (65,536 addresses), divide into /24 subnets:

```
Subnet 1: 10.0.0.0/24   → 10.0.0.1 to 10.0.0.254
Subnet 2: 10.0.1.0/24   → 10.0.1.1 to 10.0.1.254
Subnet 3: 10.0.2.0/24   → 10.0.2.1 to 10.0.2.254
...
Subnet 256: 10.0.255.0/24
```

**VLSM (Variable Length Subnet Masking):** Modern networks use VLSM, meaning different subnets can have different prefix lengths. A data center might use:
- `/24` for web servers (254 hosts)
- `/27` for database servers (30 hosts)
- `/30` for point-to-point router links (2 hosts)

**Quick reference for common prefix lengths:**

| CIDR | Addresses | Usable Hosts |
|------|-----------|--------------|
| /30  | 4         | 2            |
| /29  | 8         | 6            |
| /28  | 16        | 14           |
| /27  | 32        | 30           |
| /26  | 64        | 62           |
| /25  | 128       | 126          |
| /24  | 256       | 254          |
| /23  | 512       | 510          |
| /22  | 1,024     | 1,022        |
| /20  | 4,096     | 4,094        |
| /16  | 65,536    | 65,534       |

---

### NAT (Network Address Translation)

**NAT** is the mechanism by which a router or gateway translates between private IP addresses (used internally) and public IP addresses (used on the internet). It allows many devices with private IPs to share a single public IP.

**How NAT works (NAPT/PAT — Port Address Translation):**

1. Client at `192.168.1.100:54231` sends a packet to `93.184.216.34:80`
2. NAT router receives the packet, replaces source IP/port: `203.0.113.1:10001`
3. NAT router records the mapping in its NAT table: `192.168.1.100:54231 ↔ 203.0.113.1:10001`
4. Server at `93.184.216.34` receives packet from `203.0.113.1:10001`, responds back
5. NAT router receives response on port `10001`, looks up the mapping
6. Translates destination back to `192.168.1.100:54231` and forwards to the internal client

**NAT table entry:**
```
Protocol | Internal IP:Port    | External IP:Port     | Remote IP:Port
TCP      | 192.168.1.100:54231 | 203.0.113.1:10001    | 93.184.216.34:80
```

**Types of NAT:**
- **Static NAT:** One-to-one mapping between private and public IP (for servers that need to receive inbound connections)
- **Dynamic NAT:** Pool of public IPs shared among private hosts
- **PAT/NAPT:** Many private IPs share one public IP using different ports (most common)

**NAT and applications:** NAT breaks the end-to-end connectivity model of the original internet design. Some protocols embed IP addresses in their payload (like FTP's active mode, SIP for VoIP), which breaks through NAT without special ALG (Application Layer Gateway) support. This is one reason why protocols like WebRTC require ICE/STUN/TURN to establish peer-to-peer connections through NAT.

**AWS NAT Gateway:** In AWS, a NAT Gateway allows instances in private subnets to initiate outbound connections to the internet while preventing inbound connections from the internet.

---

### Default Gateway

The **default gateway** is the router address that a host sends traffic to when it doesn't have a more specific route to the destination. It's the "door out of the local network."

When a host wants to communicate:
1. It checks if the destination IP is in the same subnet (using its subnet mask)
2. If yes: communicate directly (ARP for MAC address, send frame directly)
3. If no: send the packet to the default gateway, which will route it toward the destination

```bash
# View default gateway on Linux
ip route show default
# or
ip route | grep default
# Output: default via 10.0.0.1 dev eth0

# On Windows
route print | findstr "0.0.0.0"
```

The default gateway must be in the same subnet as the host — you can't route traffic to a router you can't directly reach. In AWS, the default gateway for instances in a public subnet is automatically set to the VPC's internal router.

---

## Module 3: Routing

### Routing Tables

A **routing table** is a data structure stored in a router (or host) that contains a list of rules for deciding where to forward packets. Each entry in the routing table contains:

- **Destination network:** The network prefix this entry matches (e.g., `10.0.1.0/24`)
- **Next hop:** The IP address of the next router to send the packet to
- **Interface:** The network interface to use for sending the packet
- **Metric:** A cost value used to compare routes to the same destination

```bash
# View routing table on Linux
ip route show
# or
route -n   # legacy command

# Example output:
# Destination     Gateway         Genmask         Flags Metric Ref Use Iface
# 0.0.0.0         10.0.0.1        0.0.0.0         UG    100    0   0   eth0
# 10.0.0.0        0.0.0.0         255.255.255.0   U     100    0   0   eth0
# 172.17.0.0      0.0.0.0         255.255.0.0     U     0      0   0   docker0
```

When a packet arrives, the router looks through its routing table to find the best matching entry.

---

### Longest Prefix Match

**Longest Prefix Match (LPM)** is the algorithm routers use to find the best route for a packet. When multiple routing table entries match the destination IP, the router chooses the one with the longest (most specific) prefix.

**Example:**

Routing table:
```
10.0.0.0/8    → via Router A
10.1.0.0/16   → via Router B
10.1.2.0/24   → via Router C
0.0.0.0/0     → via Router D (default route)
```

Packet destined for `10.1.2.50`:
- Matches `10.0.0.0/8` (8 bits match)
- Matches `10.1.0.0/16` (16 bits match)
- Matches `10.1.2.0/24` (24 bits match)
- Matches `0.0.0.0/0` (0 bits match)

**LPM selects `10.1.2.0/24`** — 24-bit prefix is the longest (most specific) match.

This is how internet routing works. The routing tables in major internet exchange points contain hundreds of thousands of prefixes, and every packet must be matched against them in microseconds using specialized hardware (ternary content-addressable memory, or TCAM).

---

### Static Routing

**Static routes** are manually configured routing table entries that don't change automatically. An administrator explicitly tells the router: "To reach network X, send packets to next-hop Y."

```bash
# Add a static route on Linux
ip route add 192.168.10.0/24 via 10.0.0.254

# Add a persistent static route (varies by distro)
# In /etc/network/interfaces or nmcli

# Remove a static route
ip route del 192.168.10.0/24
```

**Advantages of static routing:**
- Simple and predictable
- No routing protocol overhead
- Secure (no routing protocol to attack or misconfigure)
- Works well in small, stable networks

**Disadvantages:**
- Doesn't adapt to network changes (link failures)
- Becomes unmanageable at scale
- Requires manual updates when topology changes

Static routes are commonly used for:
- Small networks with few paths
- Stub networks (networks with only one exit point)
- VPN tunnels with specific destinations
- Override routes (force specific traffic through a certain path)

Dynamic routing protocols (OSPF, BGP, EIGRP) automate route discovery and adapt to topology changes, but they're complex and outside the scope of most application engineers.

---

### Default Route

The **default route** (also called the **gateway of last resort**) is a special routing entry that matches any destination that has no more specific route. It's represented as `0.0.0.0/0` in IPv4.

```bash
# Add a default route
ip route add default via 10.0.0.1

# Or equivalently
ip route add 0.0.0.0/0 via 10.0.0.1
```

The default route is:
- On end hosts: the address of the first-hop router (your home router, VPC router, etc.)
- On enterprise routers: the address of the ISP's router
- On internet routers: there is no single default route — every prefix must be explicitly in the BGP routing table

In AWS, when you create a VPC, the main route table automatically gets a local route for the VPC CIDR and you add additional routes (to the internet gateway, NAT gateway, etc.) manually or via automation.

---

## Module 4: TCP

### TCP Overview

**TCP (Transmission Control Protocol)** is the workhorse of the internet. It operates at Layer 4 and provides:
- **Reliable delivery:** Guarantees that data arrives, in order, without duplicates
- **Connection-oriented:** Establishes a connection before data transfer
- **Flow control:** Prevents the sender from overwhelming the receiver
- **Congestion control:** Prevents the sender from overwhelming the network
- **Full duplex:** Both sides can send and receive simultaneously

TCP achieves reliability through sequence numbers, acknowledgements, and retransmission of lost segments.

---

### Three-Way Handshake

Before any data is exchanged, TCP establishes a connection using the **three-way handshake**. This synchronizes sequence numbers and ensures both sides are ready.

```
Client                          Server
  |                               |
  |-------- SYN (seq=x) -------->|   Step 1: Client sends SYN
  |                               |          (x = random initial seq num)
  |<---- SYN-ACK (seq=y,ack=x+1)-|   Step 2: Server responds with SYN-ACK
  |                               |          (y = server's random seq num)
  |-------- ACK (ack=y+1) ------>|   Step 3: Client acknowledges
  |                               |
  |====== DATA TRANSFER ==========|
```

**Step 1 – SYN:** The client sends a segment with the SYN flag set. It includes the client's **Initial Sequence Number (ISN)**, chosen randomly to prevent TCP injection attacks.

**Step 2 – SYN-ACK:** The server responds with both SYN and ACK flags set. It acknowledges the client's ISN (client_ISN + 1) and sends its own ISN.

**Step 3 – ACK:** The client acknowledges the server's ISN (server_ISN + 1). The connection is now established and data can flow.

**Why random ISNs?** Random initial sequence numbers prevent an attacker from injecting forged TCP segments into an existing connection (they would need to guess the correct sequence number).

**SYN cookies:** When a server receives more SYN packets than it can handle (SYN flood attack), it can use SYN cookies — encoding connection state into the ISN so it doesn't need to allocate memory for half-open connections until the handshake completes.

The handshake adds at minimum **1.5 RTT** of latency before the first byte of data can be sent. This is a key motivation for HTTP/2 connection multiplexing and QUIC's 0-RTT/1-RTT handshakes.

---

### Four-Way Termination

TCP connections are terminated using a **four-way handshake** (also called four-way teardown). Each side independently closes its half of the connection.

```
Client                          Server
  |                               |
  |-------- FIN (seq=u) -------->|   Step 1: Client done sending, sends FIN
  |<------- ACK (ack=u+1) -------|   Step 2: Server acknowledges
  |                               |          (server can still send data here)
  |<------- FIN (seq=v) ---------|   Step 3: Server done sending, sends FIN
  |-------- ACK (ack=v+1) ------>|   Step 4: Client acknowledges
  |                               |
  [Client waits in TIME_WAIT state]
```

Steps 2 and 3 are sometimes combined into a single FIN-ACK if the server has no more data to send, making it effectively a three-way termination.

**Half-close:** Between steps 2 and 3, the server can still send data to the client even though the client has closed its sending side. This is useful for protocols like HTTP where the server may still be sending a response.

---

### Sequence Numbers and Acknowledgements

**Sequence numbers** track the order of bytes in a TCP stream. The sequence number in a segment indicates the position of the first byte of data in that segment.

**Acknowledgement numbers** tell the sender which byte the receiver expects next. An ACK number of N means "I have received everything up to byte N-1, please send byte N next."

```
Sender transmits:
  Segment 1: seq=1000, data="Hello" (5 bytes) → occupies bytes 1000-1004
  Segment 2: seq=1005, data=" World" (6 bytes) → occupies bytes 1005-1010

Receiver acknowledges:
  ACK: ack=1005  (received bytes up to 1004)
  ACK: ack=1011  (received bytes up to 1010)
```

If segment 2 is lost:
```
Receiver sends: ACK: ack=1005  (still waiting for byte 1005)
                ACK: ack=1005  (duplicate ACK — signal of loss)
                ACK: ack=1005  (three duplicate ACKs = fast retransmit trigger)
```

TCP uses **cumulative acknowledgements** — a single ACK acknowledges all data up to that point, not individual segments. **Selective Acknowledgements (SACK)** is a TCP extension that allows a receiver to acknowledge non-contiguous ranges, helping the sender retransmit only the missing segments rather than everything after the loss.

---

### Sliding Window

The **sliding window** mechanism is how TCP manages the flow of data between sender and receiver. The window represents the amount of data the sender can transmit before needing an acknowledgement.

```
Sequence numbers: 1    2    3    4    5    6    7    8    9    10
                  |----sent----|----in flight----|----can send----|---must wait---|
                  |   & acked  |                 |                |               |
                       ↑                  ↑              ↑
                   Left edge         Right edge    Window limit
                   of window         (last acked)
```

As the receiver acknowledges data, the window "slides" to the right, allowing more data to be sent. The window size is advertised in every TCP segment and can grow or shrink dynamically.

**Window size** is constrained by two independent mechanisms:
1. **Receiver window (rwnd):** The receiver's available buffer space — prevents overwhelming the receiver
2. **Congestion window (cwnd):** The sender's estimate of network capacity — prevents overwhelming the network

The effective window = `min(rwnd, cwnd)`

**TCP Window Scaling (RFC 7323):** The original TCP window field is 16 bits, limiting it to 65,535 bytes. Window scaling extends this up to 1 GB by using a scale factor negotiated during the handshake. Essential for high-bandwidth, high-latency links.

---

### Flow Control

**Flow control** is the mechanism by which TCP prevents a fast sender from overwhelming a slow receiver. It is receiver-driven.

The receiver advertises its available buffer space (the **receive window**, or `rwnd`) in the window field of every ACK it sends. The sender must not have more unacknowledged data in flight than the receiver's advertised window.

**Zero window scenario:**
1. Receiver's buffer fills up (receiver is too slow to process data)
2. Receiver advertises `rwnd = 0`
3. Sender stops sending
4. Receiver sends a **window update** when it has processed some data and has buffer space available
5. Sender resumes

**Silly Window Syndrome:** Occurs when the receiver opens its window by a very small amount (e.g., 1 byte), causing the sender to send many tiny packets. Solutions: Nagle's algorithm (sender-side) and Clark's algorithm (receiver-side, don't open window until there's "enough" space).

**Nagle's algorithm:** Buffers small writes and sends them together when either the buffer reaches MSS size or an ACK is received. Can increase latency for interactive applications (SSH, telnet). Disabled with `TCP_NODELAY` socket option.

---

### Congestion Control

**Congestion control** prevents TCP senders from overwhelming the network itself (not just the receiver). The network provides no explicit signal of its capacity; TCP must infer it from packet loss and delays.

**TCP's congestion control has four phases:**

**1. Slow Start:**
- Begins with `cwnd = 1 MSS` (or sometimes 10 MSS, per RFC 6928)
- For each ACK received, `cwnd += 1 MSS` (doubles each RTT)
- Continues until `cwnd` reaches the **slow start threshold (ssthresh)** or packet loss occurs

```
RTT 1: cwnd=1    → send 1 segment, receive 1 ACK → cwnd=2
RTT 2: cwnd=2    → send 2 segments, receive 2 ACKs → cwnd=4
RTT 3: cwnd=4    → cwnd=8
RTT 4: cwnd=8    → cwnd=16 (if ssthresh=16, switch to congestion avoidance)
```

**2. Congestion Avoidance:**
- `cwnd` grows by 1 MSS per RTT (linear growth instead of exponential)
- Formula: `cwnd += MSS × MSS / cwnd` per ACK

**3. Fast Retransmit:**
- Three duplicate ACKs are received → inferred segment loss
- Retransmit the missing segment immediately (don't wait for timeout)
- `ssthresh = cwnd / 2`, `cwnd = ssthresh` (TCP Reno) or `cwnd = ssthresh + 3 MSS`

**4. Fast Recovery:**
- After fast retransmit, enter fast recovery instead of slow start
- Continue receiving duplicate ACKs while transmitting new data within cwnd
- Exit to congestion avoidance when new data is acknowledged

**Modern TCP Congestion Control Algorithms:**
- **CUBIC (default in Linux):** Uses a cubic function for window growth, performs well on high-bandwidth networks
- **BBR (Bottleneck Bandwidth and RTT):** Google's algorithm; models the network as a pipe and tries to keep it full without queuing
- **QUIC/BBR:** Used in HTTP/3

```bash
# Check current congestion control algorithm
sysctl net.ipv4.tcp_congestion_control

# List available algorithms
sysctl net.ipv4.tcp_available_congestion_control

# Change algorithm
sysctl -w net.ipv4.tcp_congestion_control=bbr
```

---

### Retransmission

When TCP detects that a segment was lost, it retransmits it. Loss is detected by:

1. **Retransmission Timeout (RTO):** If an acknowledgement is not received within the timeout period, the segment is retransmitted. RTO is calculated based on RTT measurements (exponentially weighted moving average). On timeout: `ssthresh = cwnd / 2`, `cwnd = 1 MSS` (slow start restart).

2. **Fast Retransmit:** Three duplicate ACKs trigger immediate retransmission without waiting for RTO. Much faster recovery.

**RTO calculation:**
```
SRTT (Smoothed RTT) = (1 - α) × SRTT + α × RTT_sample     (α = 0.125)
RTTVAR (RTT variance) = (1 - β) × RTTVAR + β × |SRTT - RTT_sample|  (β = 0.25)
RTO = SRTT + 4 × RTTVAR
```

RTO doubles on each retransmission (exponential backoff), capped at 60 seconds by default.

---

### Keep-Alive

**TCP Keep-Alive** is a mechanism to detect dead connections. If no data is exchanged for a period, TCP sends small probe packets to check if the other side is still alive.

By default on Linux:
- `tcp_keepalive_time = 7200` seconds (2 hours before first probe)
- `tcp_keepalive_intvl = 75` seconds (interval between probes)
- `tcp_keepalive_probes = 9` (number of probes before declaring dead)

These defaults are very conservative. Applications that need faster detection of dead connections should either:
1. Set socket-level `SO_KEEPALIVE` with custom values via `TCP_KEEPIDLE`, `TCP_KEEPINTVL`, `TCP_KEEPCNT`
2. Implement application-level heartbeats (more portable and reliable)

```bash
# Enable keep-alive on a socket in Python
import socket
sock.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPIDLE, 60)
sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPINTVL, 10)
sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPCNT, 3)
```

---

### TCP Connection States

TCP connections go through a series of states defined in the TCP state machine:

**TIME_WAIT:**
- The active closer (usually the client) enters TIME_WAIT after sending the final ACK
- Lasts for **2 × MSL (Maximum Segment Lifetime)**, typically 2 minutes (60-120 seconds)
- Purpose: Ensure the final ACK is received (if lost, the other side will retransmit FIN, and we can re-ACK); prevent old delayed packets from confusing a new connection on the same 4-tuple

**TIME_WAIT causes port exhaustion** in high-traffic servers. If a load balancer or proxy has many short-lived connections to backends, it can run out of ephemeral ports. Solutions:
- `SO_REUSEADDR` socket option
- `tcp_tw_reuse` kernel parameter (safe, reuses TIME_WAIT sockets for new outgoing connections if RTT information confirms safety)
- Increase ephemeral port range: `net.ipv4.ip_local_port_range = 1024 65535`

**CLOSE_WAIT:**
- The passive closer enters CLOSE_WAIT after receiving a FIN from the other side
- The application should close its side, which transitions to LAST_ACK
- If a server has many connections stuck in CLOSE_WAIT, it usually means the application is not closing the connection properly (resource/code bug)

**FIN_WAIT_1:** Active closer has sent FIN, waiting for ACK
**FIN_WAIT_2:** Active closer has received ACK of FIN, waiting for the other side's FIN

---

### RST (Reset)

The **RST flag** in a TCP segment is used to abruptly terminate a connection without a graceful four-way handshake.

Reasons TCP sends RST:
- Connection request to a closed port (no service listening)
- Receiving a segment that doesn't belong to any known connection
- Application calls `SO_LINGER` with timeout=0 and then closes the socket
- Firewall/load balancer terminating a connection forcefully

When you see RST in a packet capture:
- **RST from server:** Port closed, or server forcefully rejected the connection
- **RST from firewall:** Often seen when firewall rules drop an existing connection
- **RST from load balancer:** Connection drained or health check failed

---

### TCP vs UDP

| Feature           | TCP                              | UDP                           |
|-------------------|----------------------------------|-------------------------------|
| Connection        | Connection-oriented (handshake)  | Connectionless                |
| Reliability       | Guaranteed delivery              | Best-effort, no guarantee     |
| Ordering          | In-order delivery                | No ordering                   |
| Error correction  | Retransmission of lost segments  | None (application must handle)|
| Flow control      | Yes (rwnd)                       | No                            |
| Congestion control| Yes (cwnd)                       | No                            |
| Header size       | 20-60 bytes                      | 8 bytes                       |
| Speed             | Slower (overhead)                | Faster (less overhead)        |
| Use cases         | HTTP, SMTP, SSH, databases       | DNS, video streaming, gaming  |

---

## Module 5: UDP

### UDP Basics

**UDP (User Datagram Protocol)** provides a minimal, connectionless transport service. It takes application data, adds a tiny 8-byte header (source port, destination port, length, checksum), and sends it as a datagram. There is no handshake, no acknowledgement, no retransmission, and no ordering guarantee.

```
UDP Header (8 bytes):
| Source Port (16 bits) | Destination Port (16 bits) |
| Length (16 bits)      | Checksum (16 bits)         |
| Data...                                              |
```

The UDP checksum covers the UDP header and data (and a pseudo-header including IP addresses). It's optional in IPv4 but mandatory in IPv6.

**What UDP provides:**
- **Multiplexing:** Port numbers allow multiple services on the same host
- **Checksum:** Basic data integrity check
- **Speed:** Minimal overhead, no connection establishment

**What UDP does NOT provide:**
- Reliability (no ACK, retransmission)
- Ordering (datagrams may arrive out of order)
- Flow control
- Congestion control
- Connection state

---

### UDP Use Cases

UDP is preferred when:

**1. Low latency is critical:**
- DNS queries: A short, simple request/response. Adding TCP's handshake would double the latency.
- Online gaming: Position updates. A slightly outdated position is better than a delayed one.
- VoIP: A missing audio packet is better experienced as a brief crackle than waiting for retransmission.

**2. The application can tolerate or manage loss:**
- Video streaming (live): A dropped frame is acceptable; retransmitting it would be pointless (the moment has passed).
- Metrics/monitoring: Losing some data points is acceptable.
- IoT sensor data: Frequent updates, some loss tolerable.

**3. Broadcast/multicast:**
- UDP supports broadcasting to all hosts on a subnet (`255.255.255.255`) and multicasting to a group (`224.0.0.0/4`).
- TCP is inherently unicast (point-to-point).

**4. Simple request-response with short messages:**
- DNS
- DHCP
- NTP (Network Time Protocol)
- SNMP (Simple Network Management Protocol)

**5. Custom reliability over UDP:**
- QUIC (HTTP/3 transport): Implements reliability, ordering, and congestion control on top of UDP, with better performance than TCP
- WebRTC: Uses UDP with DTLS for security and SRTP for media
- Many game engines implement their own selective acknowledgement on top of UDP

---

## Module 6: DNS

### DNS Resolution

**DNS (Domain Name System)** translates human-readable domain names (like `www.example.com`) into IP addresses (`93.184.216.34`). It's a globally distributed, hierarchical database.

**Full DNS resolution flow:**

```
Browser requests: www.example.com

1. Browser checks local DNS cache → not found
2. OS checks /etc/hosts → not found
3. OS queries configured recursive resolver (e.g., 8.8.8.8)

4. Recursive resolver checks its cache → not found
5. Resolver queries a Root Name Server:
   "Who knows about .com?"
   Root server responds: "Ask the .com TLD servers at 192.5.6.30"

6. Resolver queries .com TLD server:
   "Who knows about example.com?"
   TLD server responds: "Ask example.com's authoritative servers at 205.251.196.1"

7. Resolver queries example.com's authoritative server:
   "What is the IP of www.example.com?"
   Authoritative server responds: "93.184.216.34, TTL=3600"

8. Resolver caches the answer and returns it to the client
9. Client connects to 93.184.216.34
```

This full resolution takes multiple round trips but is only done occasionally due to caching.

---

### Recursive Resolver

A **recursive resolver** (also called a **recursive nameserver** or **full-service resolver**) is the DNS server your client talks to. It does the heavy lifting of traversing the DNS hierarchy on your behalf.

Common recursive resolvers:
- Your ISP's resolver (assigned via DHCP)
- `8.8.8.8` / `8.8.4.4` — Google Public DNS
- `1.1.1.1` / `1.0.0.1` — Cloudflare DNS (also privacy-focused)
- `9.9.9.9` — Quad9 (security-focused)
- Enterprise internal resolvers (forward internal domains, recurse for external)

Configured on Linux in `/etc/resolv.conf`:
```
nameserver 8.8.8.8
nameserver 8.8.4.4
search example.com    # appended to unqualified names
```

In containers and Kubernetes, CoreDNS serves as the in-cluster recursive resolver.

---

### Authoritative DNS

An **authoritative name server** is the server that holds the actual DNS records for a domain. It gives definitive answers (not cached guesses). When you register a domain and set up DNS, you configure which servers are authoritative for your domain.

Types of authoritative servers:
- **Primary (master):** Holds the original zone file with all records
- **Secondary (slave):** Gets zone data from the primary via zone transfer (AXFR/IXFR); provides redundancy

In AWS, **Route 53** serves as both a recursive resolver (Route 53 Resolver) and an authoritative DNS service.

---

### Root and TLD Servers

**Root servers:** The 13 logical root name servers (A through M) are the starting point for all DNS resolution. They don't know the answer to queries but know where to find the authoritative servers for each TLD. There are actually hundreds of physical servers behind these 13 logical addresses, distributed globally using anycast.

**TLD (Top-Level Domain) servers:** Maintained by registries (Verisign manages `.com`, IANA manages `.org`, country registries manage ccTLDs). They know which authoritative servers are responsible for each second-level domain.

**Delegation chain:**
```
. (root)
└── .com (TLD)
    └── example.com (authoritative)
        └── www.example.com (A record)
```

---

### DNS Caching and TTL

**DNS caching** is what makes DNS practical. Without it, every DNS query would require a full traversal of the hierarchy, adding hundreds of milliseconds to every request.

**TTL (Time To Live)** is set by the domain owner on each DNS record. It tells resolvers (and clients) how long to cache the answer, in seconds.

```
www.example.com.  3600  IN  A  93.184.216.34
                  ^^^^
                  TTL = 3600 seconds = 1 hour
```

**TTL trade-offs:**
- **Low TTL (60-300 seconds):** Changes propagate quickly. Good for deployments, failover. More DNS queries = more load on DNS servers.
- **High TTL (3600-86400 seconds):** Fewer queries, lower latency. Changes take longer to propagate.

**Best practices:**
- Lower TTL before planned migrations (e.g., to 60 seconds, wait for cache to expire, then change the record)
- Use 300-3600 seconds for stable records
- Route 53 minimum TTL is 0 (though very low TTLs increase cost and query volume)

**DNS cache poisoning:** An attack where a malicious resolver inserts false records into a victim resolver's cache. DNSSEC was designed to prevent this by cryptographically signing DNS responses.

---

### DNS Record Types

**A Record:** Maps a hostname to an IPv4 address.
```
www.example.com.  3600  IN  A  93.184.216.34
```

**AAAA Record:** Maps a hostname to an IPv6 address.
```
www.example.com.  3600  IN  AAAA  2606:2800:220:1:248:1893:25c8:1946
```

**CNAME (Canonical Name):** Creates an alias from one name to another. The resolver follows the chain until it finds an A/AAAA record.
```
blog.example.com.  3600  IN  CNAME  example.github.io.
```
**Important:** CNAME cannot coexist with other records for the same name. A domain apex (`example.com`) cannot be a CNAME (use ALIAS or ANAME records provided by some DNS providers).

**MX (Mail Exchange):** Specifies mail servers for the domain, with a priority number (lower = higher priority).
```
example.com.  3600  IN  MX  10  mail1.example.com.
example.com.  3600  IN  MX  20  mail2.example.com.
```

**TXT Record:** Arbitrary text associated with a domain. Used for:
- SPF (email sender verification): `v=spf1 include:_spf.google.com ~all`
- DKIM (email signing): Public key for verifying email signatures
- DMARC: Email authentication policy
- Domain ownership verification (Google Search Console, Let's Encrypt)

**NS Record:** Specifies the authoritative name servers for a domain.
```
example.com.  86400  IN  NS  ns1.exampledns.com.
example.com.  86400  IN  NS  ns2.exampledns.com.
```

---

## Module 7: HTTP

### HTTP Request Lifecycle

HTTP (HyperText Transfer Protocol) is a stateless, application-layer protocol for distributed information systems. The full lifecycle of an HTTP request:

```
1. DNS Resolution: resolve api.example.com → 93.184.216.34
2. TCP Connection: three-way handshake with 93.184.216.34:443
3. TLS Handshake: negotiate cipher suite, exchange certificates
4. HTTP Request: send GET /users HTTP/1.1
5. Server Processing: route, authenticate, query DB, build response
6. HTTP Response: receive 200 OK with JSON body
7. Connection: keep alive (reuse) or close
```

---

### HTTP Methods

HTTP methods define the intended action for a request:

**GET:** Retrieve a resource. Should be safe (no side effects) and idempotent. Browsers cache GET responses. Request body is allowed by spec but rarely used.

**POST:** Submit data to create or trigger an action. Not safe, not idempotent. Each POST may create a new resource.

**PUT:** Replace a resource at a specific URI with the provided representation. Idempotent — making the same PUT request multiple times has the same effect as once.

**PATCH:** Partially update a resource. Not necessarily idempotent (depends on implementation).

**DELETE:** Remove a resource. Idempotent — deleting an already-deleted resource returns 404 or 204 but has the same state outcome.

**HEAD:** Like GET but returns only headers, no body. Useful for checking if a resource exists or its metadata (size, last-modified).

**OPTIONS:** Returns the communication options for the resource (supported methods). Used in CORS preflight requests.

**CONNECT:** Establishes a tunnel (used for HTTPS through HTTP proxies).

**TRACE:** Echoes the request back. Useful for debugging but often disabled for security (exposes headers).

---

### HTTP Headers

Headers convey metadata about the request or response. Common headers:

**Request Headers:**
- `Host`: Domain name of the server (mandatory in HTTP/1.1)
- `User-Agent`: Client software identification
- `Accept`: Media types the client can handle (`application/json, text/html`)
- `Authorization`: Credentials (`Bearer <token>`, `Basic <base64>`)
- `Content-Type`: Media type of the request body (`application/json`)
- `Content-Length`: Size of the request body in bytes
- `Cookie`: Cookies sent to the server
- `Cache-Control`: Caching directives (`no-cache`, `max-age=3600`)
- `Accept-Encoding`: Compression algorithms the client supports (`gzip, br`)
- `Connection`: Options for the current connection (`keep-alive`, `close`)

**Response Headers:**
- `Content-Type`: Media type of the response body
- `Content-Length`: Size of the response body
- `Set-Cookie`: Sets a cookie on the client
- `Cache-Control`: Caching directives for the response
- `ETag`: Identifier for a specific version of a resource
- `Last-Modified`: When the resource was last changed
- `Location`: Used with 3xx redirects; the new URL
- `WWW-Authenticate`: Challenge for 401 responses
- `X-Request-ID`: Request tracing identifier (custom)
- `Strict-Transport-Security`: HSTS directive (HTTPS only)
- `Access-Control-Allow-Origin`: CORS header

---

### HTTP Status Codes

**1xx — Informational:**
- `100 Continue`: Server has received request headers, client should send body

**2xx — Success:**
- `200 OK`: Standard success
- `201 Created`: Resource created (usually after POST/PUT)
- `204 No Content`: Success, no body to return (common for DELETE)
- `206 Partial Content`: Partial response (range requests for streaming)

**3xx — Redirection:**
- `301 Moved Permanently`: Redirect, browsers cache the new URL
- `302 Found`: Temporary redirect
- `304 Not Modified`: Resource unchanged, use cached version (conditional GET)
- `307 Temporary Redirect`: Temporary, preserve method (POST stays POST)
- `308 Permanent Redirect`: Permanent, preserve method

**4xx — Client Error:**
- `400 Bad Request`: Malformed request (invalid JSON, missing required field)
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource doesn't exist
- `405 Method Not Allowed`: HTTP method not supported for this endpoint
- `409 Conflict`: State conflict (e.g., duplicate resource)
- `410 Gone`: Resource permanently removed
- `422 Unprocessable Entity`: Request understood but semantic errors
- `429 Too Many Requests`: Rate limited
- `499 Client Closed Request`: Client disconnected before server responded (nginx-specific)

**5xx — Server Error:**
- `500 Internal Server Error`: Unhandled server exception
- `502 Bad Gateway`: Upstream server returned invalid response
- `503 Service Unavailable`: Server temporarily overloaded or down
- `504 Gateway Timeout`: Upstream server didn't respond in time

---

### Cookies

**Cookies** are small pieces of data sent by the server to the browser via `Set-Cookie` header, stored by the browser, and sent back with every subsequent request via the `Cookie` header.

```
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
```

**Cookie attributes:**
- `Path`: The URL path the cookie applies to
- `Domain`: The domain the cookie is sent to (and subdomains if set)
- `Max-Age` / `Expires`: When the cookie expires. Without these, it's a session cookie (deleted when browser closes)
- `HttpOnly`: Cannot be accessed by JavaScript (prevents XSS theft)
- `Secure`: Only sent over HTTPS
- `SameSite`: Controls cross-site sending. `Strict` = never cross-site, `Lax` = top-level navigations only, `None` = always (requires `Secure`)

---

### Sessions

**Sessions** provide server-side state to the stateless HTTP protocol. A session stores user state on the server; a session ID (typically stored in a cookie) identifies which session belongs to which user.

**Session flow:**
1. User logs in → server creates session, stores data (user ID, roles) in session store
2. Server returns session ID in `Set-Cookie: session_id=xyz`
3. Browser sends `Cookie: session_id=xyz` with every subsequent request
4. Server looks up session by ID, retrieves user data

**Session stores:**
- In-memory (single server, no HA — don't use in production)
- Database (PostgreSQL, MySQL)
- Redis (most common — fast, supports TTL, clusterable)
- JWT (stateless tokens — session data in the token itself, no server-side store needed)

**Session vs JWT:** Sessions require server-side storage and lookup on every request but can be instantly invalidated. JWTs are stateless (no lookup) but cannot be invalidated without a blocklist (defeating the purpose) — they must be short-lived.

---

### Authentication and Authorization

**Authentication** ("AuthN") is the process of verifying *who* you are — proving your identity.
**Authorization** ("AuthZ") is the process of verifying *what* you're allowed to do — checking permissions.

These are distinct concepts that are often conflated:
- A valid JWT proves authentication but doesn't grant specific access
- A user authenticated as "alice" may not be authorized to delete records

**Common authentication mechanisms:**
- **Basic Auth:** Base64-encoded `username:password` in the `Authorization: Basic` header. Simple but insecure without HTTPS.
- **API Keys:** A token in headers or query string. Simple, but hard to rotate and often long-lived.
- **Bearer Tokens (JWT):** `Authorization: Bearer <token>`. Token contains signed claims.
- **OAuth 2.0:** Delegation framework — users grant third-party apps access to their resources without sharing credentials.
- **OIDC (OpenID Connect):** Authentication layer on top of OAuth 2.0. Returns an ID token (JWT) with user identity claims.
- **mTLS:** Both client and server present certificates.

---

### REST Principles

**REST (Representational State Transfer)** is an architectural style for designing networked applications. An API is RESTful if it follows these constraints:

1. **Client-Server:** Separation of concerns between UI and data storage
2. **Stateless:** Each request contains all information needed; no client context stored on server
3. **Cacheable:** Responses must define themselves as cacheable or non-cacheable
4. **Uniform Interface:** Consistent interface simplifies architecture:
   - Resource identification in requests (URLs)
   - Resource manipulation through representations
   - Self-descriptive messages (Content-Type, etc.)
   - HATEOAS (Hypermedia as the engine of application state — least followed)
5. **Layered System:** Client can't tell if connected directly to the server or a proxy
6. **Code on Demand (optional):** Servers can send executable code (JavaScript)

**RESTful URL conventions:**
```
GET    /users          → list users
POST   /users          → create a user
GET    /users/123      → get user 123
PUT    /users/123      → replace user 123
PATCH  /users/123      → update user 123 fields
DELETE /users/123      → delete user 123
GET    /users/123/posts → list posts for user 123
```

---

### Idempotency and Safe Methods

**Safe methods** have no side effects — they don't change server state. GET, HEAD, OPTIONS, TRACE are safe. Clients can freely retry safe methods.

**Idempotent methods** can be called multiple times and produce the same result as calling once. GET, HEAD, PUT, DELETE, OPTIONS are idempotent. POST is not.

| Method  | Safe | Idempotent |
|---------|------|------------|
| GET     | Yes  | Yes        |
| HEAD    | Yes  | Yes        |
| OPTIONS | Yes  | Yes        |
| PUT     | No   | Yes        |
| DELETE  | No   | Yes        |
| POST    | No   | No         |
| PATCH   | No   | No*        |

*PATCH can be made idempotent if designed carefully.

**Why idempotency matters in distributed systems:** Network failures mean you don't know if your request was received. With idempotent operations, you can safely retry. With non-idempotent POST (e.g., charge a credit card), retrying without an idempotency key could charge twice. The solution is **idempotency keys**: the client generates a unique request ID, the server stores the result keyed by this ID, and subsequent retries with the same ID return the cached result.

---

### HTTP Caching

HTTP caching reduces latency and server load by reusing cached responses.

**Cache-Control directives:**
```
Cache-Control: max-age=3600           → cache for 1 hour
Cache-Control: no-cache               → revalidate with server before using cache
Cache-Control: no-store               → never cache (sensitive data)
Cache-Control: private                → browser can cache, intermediaries cannot
Cache-Control: public                 → anyone can cache
Cache-Control: s-maxage=86400         → CDN cache duration (overrides max-age for shared caches)
Cache-Control: must-revalidate        → cache must revalidate when stale (no serving stale content)
Cache-Control: stale-while-revalidate=60  → serve stale for up to 60s while refreshing in background
```

**Conditional requests (validation model):**
- Server sends `ETag: "abc123"` or `Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT`
- Client sends `If-None-Match: "abc123"` or `If-Modified-Since: Wed, 21 Oct 2023 07:28:00 GMT`
- If unchanged, server returns `304 Not Modified` (no body, saves bandwidth)
- If changed, server returns `200 OK` with new content

---

### HTTP Compression

Compression reduces response body size, saving bandwidth and reducing transfer time. Modern networks are fast but compression is still valuable for high-latency mobile connections and large payloads.

**Common algorithms:**
- `gzip`: Standard, widely supported, ~70% size reduction on text
- `br` (Brotli): Better compression than gzip, especially for text. Supported by all modern browsers.
- `zstd`: Zstandard, fast compression/decompression, good ratio

```
Request:  Accept-Encoding: gzip, br, zstd
Response: Content-Encoding: br
          Content: [Brotli-compressed body]
```

The server compresses the response body and sets `Content-Encoding`. The client decompresses on receipt.

---

### Keep-Alive and Connection Pooling

**HTTP Keep-Alive** (persistent connections) allows multiple HTTP requests to be sent over a single TCP connection, avoiding the overhead of establishing a new TCP connection (and TLS handshake) for each request.

In HTTP/1.1, persistent connections are the default. To close: `Connection: close`.

**Connection pooling** is the practice of maintaining a pool of established connections to a server, reusing them for multiple requests rather than creating new ones each time.

**Why pooling matters:**
- TCP handshake: ~1 RTT (typically 10-100ms)
- TLS handshake: additional 1-2 RTT
- Creating connections is expensive and slow
- A connection pool amortizes this cost across many requests

**Chunked Transfer Encoding:** Used when the response size is not known in advance. The body is sent in chunks, each preceded by the chunk size in hex. The response ends with a zero-size chunk.

```
HTTP/1.1 200 OK
Transfer-Encoding: chunked

1a\r\n          (26 bytes in this chunk)
This is the first chunk\r\n
...\r\n
0\r\n           (final zero-size chunk)
\r\n
```

---

## Module 8: HTTP Versions

### HTTP/1.1

HTTP/1.1 (1997) is the workhorse of the early web. Key features:
- Persistent connections (keep-alive) by default
- Pipelining (send multiple requests without waiting for responses — poorly supported)
- Chunked transfer encoding
- Host header (allows virtual hosting)
- Range requests (partial content)

**HTTP/1.1 limitations:**
- **Head-of-line blocking:** On a single connection, requests are processed in order. A slow response blocks subsequent requests.
- **Limited parallelism:** Browsers work around this by opening 6 concurrent connections per host, but this is wasteful.
- **Header overhead:** Headers are sent as plaintext on every request, including large and repetitive headers like `Cookie` and `User-Agent`.
- **No server push:** Server can only respond to explicit client requests.

---

### HTTP/2

HTTP/2 (2015) was designed to solve HTTP/1.1's performance issues while maintaining semantic compatibility. Same methods, headers, and status codes.

**Key features:**

**Binary framing:** HTTP/2 uses a binary protocol instead of text. All communication is via frames, which are smaller and more efficient to parse.

**Multiplexing:** Multiple requests and responses can be interleaved on a single TCP connection. Each request/response pair is assigned a stream ID. The server can send frames from different streams interleaved. This eliminates HTTP-level head-of-line blocking.

**Header compression (HPACK):** Headers are compressed using a static table of common headers and a dynamic table of previously seen headers. Reduces header overhead by 85-88% in typical workloads.

**Server push:** The server can proactively send resources (CSS, JS, images) before the client requests them, reducing round trips.

**Stream prioritization:** Clients can assign weights and dependencies to streams, allowing the server to prioritize important resources.

**HTTP/2 still suffers from TCP-level head-of-line blocking:** All streams share a single TCP connection. If one TCP packet is lost, all streams are blocked until it's retransmitted. This is why HTTP/3 moved to QUIC.

---

### HTTP/3 and QUIC

HTTP/3 is built on **QUIC (Quick UDP Internet Connections)** instead of TCP. QUIC was developed by Google and standardized in RFC 9000 (2021).

**Why QUIC?**
- Eliminates TCP head-of-line blocking by multiplexing streams independently in the transport layer
- Reduces connection establishment latency: 0-RTT (for returning clients) or 1-RTT (new clients) vs TCP's 1-RTT + TLS's 1-2 RTT
- Encryption is built-in (always TLS 1.3)
- Better performance on lossy/mobile networks
- Connection migration: connections survive IP/port changes (e.g., switching from Wi-Fi to cellular)

**QUIC features:**
- Runs over UDP (avoids ossification — middleboxes can't inspect/modify as easily)
- Implements its own reliability, ordering, and congestion control per stream
- Each stream is independently flow-controlled
- Built-in encryption (no unencrypted QUIC in HTTP/3)

```
HTTP/3 connection establishment:
Client → Server: UDP packet with ClientHello (QUIC + TLS combined)
Server → Client: ServerHello + application data possible in same RTT
Total: 1 RTT for new connections, 0 RTT for resumed connections
```

**Current adoption:** HTTP/3 is supported by all major browsers and CDNs (Cloudflare, Fastly, Google). As of 2024, ~30% of web traffic uses HTTP/3.

---

## Module 9: HTTPS / TLS

### SSL vs TLS

**SSL (Secure Sockets Layer)** was the original encryption protocol for HTTP, developed by Netscape. SSL 2.0 (1995) and SSL 3.0 (1996) are obsolete and have known vulnerabilities (POODLE, etc.).

**TLS (Transport Layer Security)** is the modern successor to SSL. TLS 1.0 and 1.1 are deprecated (2020). TLS 1.2 is widely supported and still secure. TLS 1.3 is current best practice.

Despite SSL being deprecated, the term "SSL" is still commonly used colloquially to mean TLS (as in "SSL certificates," "SSL termination"). In technical contexts, always mean TLS.

**TLS versions:**
| Version | Year | Status       |
|---------|------|--------------|
| SSL 2.0 | 1995 | Prohibited   |
| SSL 3.0 | 1996 | Prohibited   |
| TLS 1.0 | 1999 | Deprecated   |
| TLS 1.1 | 2006 | Deprecated   |
| TLS 1.2 | 2008 | Current (OK) |
| TLS 1.3 | 2018 | Current (Best)|

---

### TLS Handshake (TLS 1.3)

TLS 1.3 simplified and improved the handshake compared to 1.2:

```
Client                                      Server
  |                                           |
  |---- ClientHello (supported ciphers, ---->|
  |     key_share, supported_versions)        |
  |                                           |
  |<--- ServerHello (chosen cipher, ---------|
  |     key_share, Certificate,               |
  |     CertificateVerify, Finished)          |
  |                                           |
  |---- Finished --------------------------->|
  |                                           |
  |======== Encrypted Application Data ======|
```

TLS 1.3 completes in **1 RTT** (vs 2 RTT for TLS 1.2). For sessions with a pre-shared key (PSK), it achieves **0-RTT** resumption (data sent with the first flight of messages).

**TLS 1.2 handshake** (for comparison) required:
1. ClientHello
2. ServerHello + Certificate + ServerHelloDone
3. ClientKeyExchange + ChangeCipherSpec + Finished
4. ChangeCipherSpec + Finished

That's 2 RTT before application data can flow (plus the 1 RTT for TCP handshake = 3 RTT total minimum for HTTP over TLS 1.2).

---

### Public Key Cryptography

TLS uses **asymmetric (public key) cryptography** for key exchange and **symmetric cryptography** for bulk data encryption.

**Asymmetric cryptography:**
- Each party has a **key pair**: public key (shareable) and private key (secret)
- Data encrypted with the public key can only be decrypted with the corresponding private key
- Data signed with the private key can be verified with the public key
- Common algorithms: RSA (2048+ bits), ECDSA (256+ bits), EdDSA
- Relatively slow — only used for key exchange and digital signatures

**Symmetric cryptography:**
- Same key used for encryption and decryption
- Much faster than asymmetric
- Common algorithms in TLS 1.3: AES-128-GCM, AES-256-GCM, ChaCha20-Poly1305
- Used for bulk data encryption once a session key is established

**Key exchange in TLS:** The client and server use asymmetric cryptography (or Diffie-Hellman) to securely establish a shared symmetric key, then switch to symmetric encryption for the rest of the session.

---

### Certificates and Certificate Chain

A **TLS certificate** is a digitally signed document that binds a public key to an identity (a domain name, organization, etc.). It's issued by a **Certificate Authority (CA)**.

**Certificate contents:**
- Subject (who it's issued to: domain name, organization)
- Public key
- Issuer (who signed it)
- Validity period (not before, not after)
- Subject Alternative Names (SANs): additional domains the cert covers
- Digital signature from the issuer's CA

**Certificate chain (chain of trust):**
```
Root CA (self-signed, in OS/browser trust store)
  └── Intermediate CA (signed by Root CA)
       └── End-entity certificate (signed by Intermediate CA)
            (e.g., *.example.com)
```

Browsers and OS trust **root CAs** (a curated list). Root CAs sign **intermediate CAs** to avoid using the root key directly. Intermediate CAs sign end-entity certificates. When a browser validates a certificate:
1. Check the end-entity cert is signed by a trusted CA
2. Check the intermediate CA is signed by a root CA in the trust store
3. Verify the certificate hasn't expired
4. Verify the certificate is not revoked (CRL or OCSP)
5. Verify the domain matches the Subject or SANs

---

### Cipher Suites

A **cipher suite** specifies the combination of cryptographic algorithms used in a TLS session:
- Key exchange algorithm (how to establish the session key)
- Authentication algorithm (how to verify the server's identity)
- Bulk encryption algorithm (how to encrypt data)
- MAC/HMAC algorithm (how to verify data integrity)

**TLS 1.2 cipher suite example:**
```
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
     ↑          ↑        ↑       ↑
  Key exchange  Auth  Encryption  MAC
  (ECDH Ephemeral) (RSA) (AES-256 GCM) (SHA-384)
```

**TLS 1.3 simplified cipher suites** (authentication and key exchange separated from symmetric encryption):
```
TLS_AES_256_GCM_SHA384
TLS_CHACHA20_POLY1305_SHA256
TLS_AES_128_GCM_SHA256
```

---

### Perfect Forward Secrecy (PFS)

**Perfect Forward Secrecy** ensures that compromise of a server's private key does not compromise past session recordings. It's achieved by using **ephemeral key exchange** (DHE or ECDHE) — generating a new, temporary key pair for each session that is discarded afterward.

Without PFS (static RSA key exchange):
- Attacker records encrypted traffic
- Later obtains the server's private key
- Can decrypt all recorded past traffic

With PFS (ECDHE key exchange):
- Session keys are derived from ephemeral keys
- Ephemeral keys are discarded after each session
- Past traffic remains encrypted even if the long-term private key is compromised

TLS 1.3 mandates PFS — only ephemeral key exchange is supported.

---

### SNI (Server Name Indication)

**SNI** is a TLS extension that allows the client to specify which hostname it's connecting to during the handshake. This is necessary because:
- A single IP address may host multiple domains (virtual hosting)
- The server needs to know which certificate to present before TLS negotiation is complete
- Without SNI, the server couldn't send the right certificate for the requested domain

```
ClientHello:
  ...
  extensions:
    server_name: www.example.com    ← SNI field
```

SNI is sent in plaintext (before encryption is established), which means an observer can see which domain you're connecting to. **ESNI (Encrypted SNI)** and **ECH (Encrypted Client Hello)** are extensions designed to encrypt this field.

---

### ALPN (Application-Layer Protocol Negotiation)

**ALPN** is a TLS extension that allows the client and server to negotiate which application protocol to use over the TLS connection, without requiring additional round trips.

```
ClientHello:
  extensions:
    application_layer_protocol_negotiation: [h2, http/1.1]
    
ServerHello:
  extensions:
    application_layer_protocol_negotiation: h2   ← server chose HTTP/2
```

Used to negotiate between HTTP/1.1 and HTTP/2 on the same port 443.

---

### Mutual TLS (mTLS)

In standard TLS, only the server presents a certificate. In **mutual TLS (mTLS)**, both the client and server present and validate certificates.

**mTLS handshake:**
1. Server presents its certificate (as normal)
2. Server requests client certificate (`CertificateRequest`)
3. Client presents its certificate
4. Both sides verify each other's certificates

**Use cases:**
- Service-to-service authentication in microservices (zero-trust networking)
- API authentication (client certificates instead of API keys)
- Kubernetes service mesh (Istio, Linkerd use mTLS between pods)
- VPN connections

**Advantages over API keys:**
- Certificates have cryptographically verifiable identity
- Short-lived certificates reduce risk
- Can be rotated without client cooperation (SPIFFE/SPIRE)

---

## Module 10: Load Balancing

### Layer 4 Load Balancer

A **Layer 4 load balancer** operates at the Transport layer. It makes routing decisions based on TCP/UDP connection information: source IP, destination IP, source port, destination port, and protocol.

**How it works:**
- Receives TCP connections from clients
- Forwards them to backend servers based on a chosen algorithm
- The backend server sees the TCP connection from the load balancer (or the client's IP if PROXY protocol or transparent mode is used)
- The LB does not inspect or modify the HTTP payload

**Characteristics:**
- Very fast (minimal processing)
- Cannot make routing decisions based on URL, headers, or cookies
- Cannot perform SSL termination (unless it's also doing SSL passthrough/offload)
- Lower latency than L7 LB
- Works with any TCP-based protocol

**Examples:** AWS Network Load Balancer (NLB), HAProxy in TCP mode, nginx stream module

---

### Layer 7 Load Balancer

A **Layer 7 load balancer** operates at the Application layer. It terminates the client's connection, reads the HTTP request, and makes routing decisions based on content.

**Can route based on:**
- URL path (`/api/*` → service A, `/static/*` → CDN)
- HTTP headers (`X-Version: v2` → new backend)
- Cookies (sticky sessions)
- HTTP method
- Query parameters
- Request body (for some implementations)

**Additional capabilities:**
- SSL/TLS termination (offloads crypto from backends)
- Header manipulation (add/remove/modify headers)
- Response modification
- Health checks at the application level (check HTTP 200, not just TCP connect)
- Request/response buffering
- Compression
- Caching
- Authentication

**Examples:** AWS Application Load Balancer (ALB), nginx, HAProxy in HTTP mode, Envoy

---

### Load Balancing Algorithms

**Round Robin:** Requests are distributed to backend servers in rotation. Simple and fair when backends are equally capable and requests take similar time.

**Least Connections:** New requests go to the backend with the fewest active connections. Better for workloads with variable request duration. The LB must track active connection counts.

**Weighted Round Robin:** Like round robin, but servers have weights. A server with weight 3 gets 3x as many requests as one with weight 1. Used when backends have different capacities.

**IP Hash:** A hash of the client's IP address determines which backend receives the request. Provides client-to-backend affinity (same client always goes to the same backend) as long as the backend set doesn't change.

**Consistent Hashing:** Uses a hash ring to distribute requests. When a backend is added or removed, only a minimal number of requests are redistributed (vs. regular hashing where ~50% change). Critical for cache-friendly routing.

**Random:** Select a random backend. Surprisingly effective for large numbers of servers; often combined with "power of two choices" (pick 2 random servers, send to the one with fewer connections).

---

### Sticky Sessions (Session Persistence)

**Sticky sessions** (session affinity) ensure that requests from a specific client always go to the same backend server. Required when application state is stored locally on the server (in-memory sessions, local file storage).

**Methods:**
- **Cookie-based:** LB sets a cookie identifying the backend. On subsequent requests, LB reads the cookie and routes accordingly.
- **IP-based:** Hash the client IP to a backend. Doesn't work well behind NAT (all users share one IP).

**Problems with sticky sessions:**
- Uneven load distribution (some servers may be busier)
- Loss of affinity when the backend restarts (session lost anyway)
- Prevents proper stateless architecture

**Better alternative:** Externalize session state (Redis, database). Then any backend can serve any request and you don't need sticky sessions.

---

### Health Checks

Load balancers continuously check the health of backend servers to avoid routing traffic to failed instances.

**Types:**
- **TCP health check:** Simply opens a TCP connection. Fast but minimal — only checks if the port is listening.
- **HTTP health check:** Sends an HTTP request to a specific endpoint (e.g., `/health`). Expects a 200 response. More thorough — verifies the application is running.
- **Deep health check:** The `/health` endpoint checks dependencies (database, cache, downstream services) before responding.

**Health check parameters:**
- **Interval:** How often to check (e.g., every 10 seconds)
- **Timeout:** How long to wait for a response (e.g., 5 seconds)
- **Healthy threshold:** Consecutive successes before marking healthy (e.g., 2)
- **Unhealthy threshold:** Consecutive failures before marking unhealthy (e.g., 3)

---

### Connection Draining

**Connection draining** (also called **deregistration delay**) is the process of gracefully removing a backend from the load balancer rotation without abruptly terminating in-flight requests.

**How it works:**
1. Backend is marked for removal (scale-in, deployment, maintenance)
2. LB stops sending new requests to that backend
3. Existing in-flight requests are allowed to complete (within a timeout, e.g., 30 seconds)
4. After the timeout or when all requests complete, the backend is fully removed

In AWS ALB/NLB: **Deregistration delay** (default 300 seconds, configurable).
In Kubernetes: **preStop hooks** + `terminationGracePeriodSeconds` achieve similar behavior.

---

## Module 11: Reverse Proxy & API Gateway

### Reverse Proxy

A **reverse proxy** sits in front of backend servers and forwards client requests to them. Clients interact with the proxy, not the backend directly.

```
Client → Reverse Proxy → Backend Server(s)
```

**What a reverse proxy provides:**
- **SSL/TLS termination:** Decrypts HTTPS, forwards HTTP to backends. Backends don't need to handle crypto.
- **Load balancing:** Distribute requests across multiple backends.
- **Caching:** Cache static assets or API responses.
- **Compression:** Compress responses before sending to clients.
- **Security:** Hides backend server details. Can block malicious requests.
- **Logging:** Centralized request logging.
- **Header manipulation:** Add, remove, or modify headers.

**Common reverse proxies:** nginx, HAProxy, Envoy, Caddy, Traefik

---

### Forward Proxy

A **forward proxy** sits in front of clients and forwards their requests to the internet on their behalf. Clients are configured to use the forward proxy.

```
Client → Forward Proxy → Internet
```

**Use cases:**
- Content filtering (block certain websites)
- Privacy (hide client IP from destination server)
- Caching (reduce bandwidth usage)
- Bypassing geographic restrictions

**Key difference:** A reverse proxy is on the server side; a forward proxy is on the client side. Reverse proxies are transparent to the server; forward proxies are often transparent to the server but configured on the client.

---

### API Gateway

An **API Gateway** is a Layer 7 component specifically designed to manage, secure, and route API traffic. It extends reverse proxy functionality with API-specific features.

**API Gateway capabilities:**
- **Request routing:** Route to different microservices based on path/method
- **Authentication & Authorization:** Validate tokens, enforce policies (JWT validation, OAuth, API keys)
- **Rate limiting:** Throttle clients to prevent abuse
- **Request/response transformation:** Convert between formats (XML ↔ JSON)
- **Schema validation:** Validate requests against OpenAPI specs
- **API versioning:** Route `v1` and `v2` traffic to different backends
- **Circuit breaking:** Stop forwarding to failing backends
- **Observability:** Centralized logging, metrics, tracing
- **Developer portal:** Documentation, API keys management

**Examples:** Kong, AWS API Gateway, Apigee, Traefik, Nginx Plus

---

### Rate Limiting

**Rate limiting** controls how many requests a client can make within a time window. Protects against abuse, DDoS, and ensures fair resource distribution.

**Algorithms:**
- **Fixed window:** Count requests in fixed time windows (e.g., 100 req/minute). Edge case: allows 2× rate at window boundaries.
- **Sliding window:** Count requests in a rolling window — more accurate but more memory-intensive.
- **Token bucket:** Tokens accumulate at a fixed rate; each request consumes a token. Allows bursting (use accumulated tokens) up to the bucket size.
- **Leaky bucket:** Requests are processed at a fixed rate regardless of arrival rate. Smooths traffic but introduces queuing delay.

**Limiting dimensions:**
- Per IP
- Per API key / user
- Per endpoint
- Global

**HTTP 429 Too Many Requests** with `Retry-After` header indicates rate limiting.

---

## Module 12: Linux Networking

### Key Linux Networking Tools

**`ip`** — The modern replacement for `ifconfig` and `route`. Part of the `iproute2` package.

```bash
ip addr show                  # Show IP addresses
ip addr add 10.0.0.1/24 dev eth0  # Add IP to interface
ip link show                  # Show network interfaces
ip link set eth0 up           # Enable interface
ip route show                 # Show routing table
ip route add 10.0.1.0/24 via 10.0.0.1  # Add route
ip neigh show                 # Show ARP table
ip -s link show eth0          # Interface statistics
```

**`ss`** — Socket statistics. Modern replacement for `netstat`. Faster and more feature-rich.

```bash
ss -tlnp          # TCP listening sockets with PID
ss -tunlp         # TCP+UDP, numeric, listening, with PID
ss -s             # Summary statistics
ss -t state established  # Established TCP connections
ss -o state time-wait    # TIME_WAIT connections
ss dst 10.0.0.1          # Connections to specific host
```

**`netstat`** — Legacy but still commonly found. Shows network connections, routing tables, interfaces.

```bash
netstat -tlnp     # Listening TCP ports with PID
netstat -an       # All connections, numeric
netstat -rn       # Routing table
netstat -s        # Per-protocol statistics
```

**`ping`** — Tests network reachability using ICMP Echo Request/Reply.

```bash
ping 8.8.8.8              # Continuous ping
ping -c 4 google.com      # Send 4 pings
ping -i 0.2 google.com    # 200ms interval
ping -s 1472 google.com   # Large packet (for MTU testing)
ping -M do -s 1472 host   # Don't Fragment bit set (PMTUD testing)
```

**`traceroute`** — Traces the path packets take to a destination, using ICMP or UDP with increasing TTL.

```bash
traceroute google.com
traceroute -T google.com   # Use TCP (bypasses firewalls blocking ICMP/UDP)
traceroute -n google.com   # No DNS resolution (faster)
mtr google.com             # Real-time traceroute with statistics
```

**`tcpdump`** — Captures and displays network packets. The most powerful network debugging tool.

```bash
tcpdump -i eth0                    # Capture on eth0
tcpdump -i any                     # Capture on all interfaces
tcpdump port 80                    # Filter by port
tcpdump host 10.0.0.1              # Filter by host
tcpdump tcp and dst port 443       # HTTPS traffic
tcpdump -w /tmp/capture.pcap       # Write to file (for Wireshark)
tcpdump -r capture.pcap            # Read from file
tcpdump -n -A port 8080            # ASCII output, no DNS
tcpdump 'tcp[tcpflags] & (tcp-syn|tcp-fin) != 0'  # SYN and FIN packets
```

**`dig`** — DNS lookup tool. The standard for DNS debugging.

```bash
dig google.com                    # A record lookup
dig google.com AAAA               # IPv6
dig google.com MX                 # Mail servers
dig @8.8.8.8 google.com           # Use specific resolver
dig +trace google.com             # Trace full resolution path
dig +short google.com             # Short output (just IP)
dig google.com +noall +answer     # Only show answer section
dig -x 8.8.8.8                    # Reverse DNS lookup
```

**`nslookup`** — Legacy DNS lookup tool. Simpler than dig.

```bash
nslookup google.com
nslookup google.com 8.8.8.8       # Use specific nameserver
```

**`curl`** — Transfer data from/to servers. Essential for HTTP debugging.

```bash
curl https://api.example.com/users          # GET request
curl -X POST -H "Content-Type: application/json" \
     -d '{"name":"test"}' https://api.example.com/users  # POST
curl -v https://example.com                 # Verbose (headers, TLS details)
curl -I https://example.com                 # HEAD request (headers only)
curl -o /dev/null -s -w "%{http_code}\n" https://example.com  # Status code only
curl --resolve example.com:443:1.2.3.4 https://example.com   # Override DNS
curl -k https://example.com                 # Ignore SSL errors
curl --cacert /path/to/ca.pem https://example.com  # Custom CA
curl -w "\nDNS: %{time_namelookup}\nConnect: %{time_connect}\nTTFB: %{time_starttransfer}\nTotal: %{time_total}\n" -o /dev/null -s https://example.com  # Timing breakdown
```

**`lsof`** — List open files, including network sockets.

```bash
lsof -i                      # All network connections
lsof -i :80                  # Connections on port 80
lsof -i tcp                  # All TCP connections
lsof -p <PID>                # All files/sockets for a process
lsof -i :8080 -i :8443       # Multiple ports
```

---

## Module 13: AWS Networking

### VPC (Virtual Private Cloud)

An **AWS VPC** is a logically isolated section of the AWS cloud where you launch resources. It's your own private network within AWS, completely separate from other customers.

**Core concepts:**
- A VPC spans all AZs in a region
- Each VPC has a CIDR block (e.g., `10.0.0.0/16`)
- VPCs contain subnets, route tables, security groups, and gateways
- By default, VPCs cannot communicate with each other (VPC peering or Transit Gateway needed)
- Default VPC: AWS creates one per region automatically; comes with default subnets, IGW, route tables

---

### Public and Private Subnets

**Public subnet:** A subnet whose route table has a route to an **Internet Gateway**. Resources in public subnets can have public IPs and receive inbound traffic from the internet.

```
Route table for public subnet:
10.0.0.0/16   → local
0.0.0.0/0     → igw-xxxxx  ← routes to Internet Gateway
```

**Private subnet:** A subnet with no route to the Internet Gateway. Resources cannot be directly reached from the internet. To reach the internet for outbound traffic (e.g., software updates), they use a **NAT Gateway** in a public subnet.

```
Route table for private subnet:
10.0.0.0/16   → local
0.0.0.0/0     → nat-xxxxx  ← routes to NAT Gateway (in public subnet)
```

**Best practice architecture:**
```
VPC: 10.0.0.0/16

  Public subnets (one per AZ):
    10.0.1.0/24 (us-east-1a) - Load balancers, NAT Gateways, Bastion hosts
    10.0.2.0/24 (us-east-1b)

  Private subnets (one per AZ):
    10.0.11.0/24 (us-east-1a) - Application servers
    10.0.12.0/24 (us-east-1b)

  Database subnets (one per AZ):
    10.0.21.0/24 (us-east-1a) - RDS, ElastiCache
    10.0.22.0/24 (us-east-1b)
```

---

### Internet Gateway and NAT Gateway

**Internet Gateway (IGW):** A horizontally scaled, redundant, and highly available VPC component that allows communication between your VPC and the internet. It performs NAT for instances with public IPs. Free to use; you pay for data transfer.

**NAT Gateway:** A managed NAT service that allows instances in private subnets to initiate outbound connections to the internet while preventing inbound connections. Deployed in a public subnet. Costs ~$0.045/hour + data processing fees. Should be deployed in each AZ for HA.

**Elastic IP (EIP):** A static public IPv4 address that you can associate with an EC2 instance or NAT Gateway. Unlike auto-assigned public IPs (which change when instance stops), EIPs are persistent.

---

### Security Groups and Network ACLs

**Security Groups (SG):**
- Act as a stateful firewall at the **instance/ENI level**
- Rules are stateful: if inbound traffic is allowed, the response is automatically allowed (no need for explicit outbound rule for responses)
- Only allow rules (no explicit deny)
- Evaluated as a union (all rules are considered)
- Applied when traffic enters/leaves the instance

```
Inbound rules:
HTTP   TCP  80   0.0.0.0/0    ALLOW
HTTPS  TCP  443  0.0.0.0/0    ALLOW
SSH    TCP  22   10.0.0.0/8   ALLOW  ← restrict SSH to internal only

Outbound rules:
All traffic  All  All  0.0.0.0/0  ALLOW  ← default; allow all outbound
```

**Network ACLs (NACLs):**
- Act as a stateless firewall at the **subnet level**
- Rules are stateless: you must explicitly allow both inbound and outbound for bidirectional traffic (including ephemeral ports for responses)
- Support both ALLOW and DENY rules
- Rules are evaluated in numerical order; first match wins
- Applied at subnet boundary (before traffic reaches any instance)

**When to use which:**
- Use Security Groups for most access control (easier, stateful, per-instance)
- Use NACLs as an additional layer for subnet-wide rules, or to explicitly deny specific IPs (SGs can't deny, only allow)

---

### VPC Peering and Transit Gateway

**VPC Peering:** A networking connection between two VPCs that allows traffic to be routed between them using private IP addresses. Works within a region or across regions (inter-region peering).

**Limitations of VPC peering:**
- Not transitive: If VPC A peers with VPC B and VPC B peers with VPC C, traffic from A cannot reach C through B
- At scale (dozens of VPCs), the number of peering connections grows as O(n²)

**Transit Gateway (TGW):** A hub-and-spoke network transit service that allows you to connect multiple VPCs (and on-premises networks via VPN/Direct Connect) through a central hub. Supports transitive routing.

```
VPC-A ──┐
VPC-B ──┤ Transit Gateway ──── On-premises (VPN)
VPC-C ──┘
```

---

### Route 53

**AWS Route 53** is Amazon's DNS service. It provides:
- **Authoritative DNS:** Host your domain's DNS records
- **Domain registration:** Register domains through Route 53
- **Health checking:** Monitor endpoints and route around failures
- **Traffic routing policies:**
  - **Simple:** Single record, no health checking
  - **Weighted:** Distribute traffic by percentage (A/B testing, canary deployments)
  - **Latency-based:** Route to the region with lowest latency
  - **Failover:** Primary/secondary; fail over if primary unhealthy
  - **Geolocation:** Route based on user's geographic location
  - **Geoproximity:** Route based on distance to resources
  - **Multivalue Answer:** Return multiple healthy records (basic load balancing at DNS level)

**Route 53 Resolver:** Acts as the DNS resolver for resources within your VPC. Automatically handles `.amazonaws.com` domains and your custom domains. **Resolver Endpoints** allow DNS queries to flow between your VPC and on-premises networks.

---

### ALB and NLB

**Application Load Balancer (ALB):**
- Layer 7 (HTTP/HTTPS/WebSocket/gRPC)
- Content-based routing (URL paths, headers, query strings, HTTP methods)
- SSL termination
- Native container support (ECS, EKS)
- Weighted target groups (canary deployments)
- User authentication via Cognito or OIDC
- Access logs to S3

**Network Load Balancer (NLB):**
- Layer 4 (TCP/UDP/TLS)
- Extremely high performance and low latency (millions of requests/second)
- Static IP per AZ (or Elastic IP)
- Preserves source IP by default (important for applications that need client IP)
- TLS passthrough (no termination at LB) or TLS termination
- Good for non-HTTP workloads (databases, game servers, IoT)

---

### CloudFront

**AWS CloudFront** is AWS's CDN (Content Delivery Network). It caches content at edge locations close to users globally.

**Use cases:**
- Static asset distribution (JS, CSS, images)
- Dynamic content acceleration (uses optimized AWS backbone)
- DDoS protection (AWS Shield integration)
- HTTPS enforcement
- Lambda@Edge / CloudFront Functions for edge compute
- Origin failover (multiple origins with health checks)
- Geo-restriction (block/allow by country)

**CloudFront + S3 + ALB pattern:**
```
Users → CloudFront → Static assets: S3 bucket
                  → Dynamic API: ALB → ECS/EKS
```

---

## Module 14: Kubernetes Networking

### Pod Networking

In Kubernetes, each **pod** gets its own IP address from the cluster's pod CIDR range. All pods can communicate with all other pods directly (without NAT) — this is the **Kubernetes networking model**.

**Pod network properties:**
- Every pod has a unique IP in the cluster
- Containers within a pod share a network namespace (share IP and ports)
- Pods communicate across nodes through a CNI plugin
- No NAT between pods (pod IP is the actual address seen by other pods)

**Pause container:** Each pod has a hidden "pause" (or "infra") container whose sole job is to hold the network namespace. Other containers in the pod join this namespace.

---

### CNI (Container Network Interface)

**CNI** is a specification and set of libraries for configuring network interfaces in Linux containers. Kubernetes uses CNI plugins to implement pod networking.

**Popular CNI plugins:**

- **Flannel:** Simple overlay network using VXLAN. Easy to set up, limited features.
- **Calico:** Supports both overlay (VXLAN/IP-in-IP) and native routing (BGP). Also supports Network Policies.
- **Cilium:** Uses eBPF for high-performance networking. Native Kubernetes Network Policy support, observability, encryption.
- **Weave Net:** Overlay network with encryption built in.
- **AWS VPC CNI:** Uses AWS VPC networking directly — pods get IPs from VPC subnets. Native AWS integration but limited IP space.

---

### Kubernetes Service Types

**ClusterIP (default):** Creates a virtual IP (cluster-internal only) that load-balances traffic across matching pods. Not accessible from outside the cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP
  selector:
    app: my-app
  ports:
    - port: 80          # Service port
      targetPort: 8080  # Pod port
```

**NodePort:** Exposes the service on a static port on every node's IP. External traffic can reach `<NodeIP>:<NodePort>`. NodePort range: 30000-32767. Not suitable for production (exposes all node IPs, no intelligent load balancing).

**LoadBalancer:** Provisions an external load balancer (cloud provider specific — AWS ELB, GCP LB, etc.) that routes to the service. The standard way to expose services externally in cloud environments.

**Headless Service:** A service with `clusterIP: None`. DNS returns the IPs of all individual pods instead of a virtual IP. Used for StatefulSets (databases, Kafka, etc.) where you need to connect to specific pods.

---

### Ingress and Gateway API

**Ingress:** A Kubernetes resource that defines HTTP routing rules to route external traffic to internal services. Requires an **Ingress Controller** (nginx ingress, AWS ALB Ingress Controller, Traefik) to actually implement the routing.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: api-v1
            port:
              number: 80
      - path: /v2
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 80
```

**Gateway API:** The next-generation successor to Ingress. Provides richer routing capabilities (traffic splitting, header-based routing, TCP/UDP routing), better extensibility, and role-based management (cluster operators vs. application developers).

---

### CoreDNS and kube-proxy

**CoreDNS:** The in-cluster DNS server. Runs as a Deployment and is the default recursive resolver for all pods. Resolves service names like `my-service.my-namespace.svc.cluster.local`.

DNS resolution within Kubernetes:
```
my-service                       → my-service.<current-namespace>.svc.cluster.local
my-service.other-ns              → my-service.other-ns.svc.cluster.local
my-service.other-ns.svc.cluster.local → resolved by CoreDNS → ClusterIP
```

**kube-proxy:** Runs on every node and maintains network rules (iptables or IPVS) to implement Service routing. When a pod connects to a ClusterIP, kube-proxy's rules DNAT the packet to one of the actual pod IPs (load balancing).

**iptables mode:** kube-proxy creates iptables rules for each service and endpoint. Works but doesn't scale well above ~1000 services.

**IPVS mode:** Uses kernel IPVS for load balancing. Scales much better (O(1) lookup vs O(n) for iptables).

**Cilium replaces kube-proxy:** Using eBPF, Cilium can replace kube-proxy with more efficient service routing and observability.

---

### Kubernetes Network Policies

**Network Policies** are Kubernetes resources that control which pods can communicate with which other pods (and external endpoints). By default, Kubernetes has no network policies — all pods can talk to all pods.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: production
spec:
  podSelector: {}         # Apply to all pods in namespace
  policyTypes:
  - Ingress
  - Egress
  # No ingress/egress rules = deny all
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-to-db
spec:
  podSelector:
    matchLabels:
      role: database
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: api
    ports:
    - protocol: TCP
      port: 5432
```

Network Policies require a CNI that supports them (Calico, Cilium, Weave Net support them; Flannel alone does not).

---

## Module 15: Database Networking

### Database Connections

Database connections are expensive: they require TCP handshake, authentication, SSL handshake, and allocation of server-side resources. Each connection on PostgreSQL uses ~5MB of memory.

**Connection limits:** PostgreSQL default `max_connections = 100`. Many connections doing nothing waste resources. Increasing it arbitrarily degrades performance (context switching, lock contention).

**Best practice:** Keep the total number of active connections low. Use connection pooling.

---

### Connection Pooling

**Connection pooling** maintains a pool of pre-established database connections that are reused across application requests. Instead of opening a new connection per request, the application borrows a connection from the pool and returns it when done.

**Types of connection pooling:**

**Application-side pooling (e.g., HikariCP, pg, SQLAlchemy):**
- Pool lives in the application process
- Each application instance has its own pool
- Problem: 50 app instances × 10 connections each = 500 DB connections
- Works fine at small scale

**Proxy pooling (e.g., PgBouncer, PgPool-II):**
- Pool lives in a separate proxy process
- All application instances connect to the proxy
- Proxy multiplexes to a smaller pool of actual DB connections
- 50 app instances × 100 connections to PgBouncer → PgBouncer → 20 DB connections

---

### PgBouncer

**PgBouncer** is a lightweight connection pooler for PostgreSQL.

**Pooling modes:**
- **Session mode:** A database connection is assigned to a client for the entire duration of the client's session. Least efficient — essentially the same as direct connections.
- **Transaction mode:** A database connection is assigned only for the duration of a transaction. Most efficient and most common. Does not support some PostgreSQL features (advisory locks, `SET` statements, named prepared statements).
- **Statement mode:** A connection is returned after each statement. Rarely used.

**PgBouncer configuration:**
```ini
[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 5432
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
server_reset_query = DISCARD ALL
```

**In AWS RDS:** AWS offers **RDS Proxy**, a managed connection pooling service that handles failover transparently and uses IAM authentication.

---

### Read Replicas and Replication

**Read replicas** are copies of the primary database that receive data changes via replication. Read replicas handle read-only queries, reducing load on the primary.

**PostgreSQL streaming replication:**
- Primary server streams WAL (Write-Ahead Log) records to replicas in real-time
- Replicas apply WAL changes to stay in sync
- By default, replication is asynchronous (small lag possible) for performance
- Synchronous replication ensures durability but adds write latency

**Replication lag:** The delay between a write on the primary and its appearance on the replica. Under load, this can be seconds or even minutes. Applications must handle reading stale data from replicas or check replication lag.

**Failover:** When the primary fails:
1. A replica is promoted to primary
2. Application connection strings must be updated (or handled by smart DNS/proxy)
3. Other replicas must reconfigure to replicate from the new primary
4. Any unconfirmed writes from the old primary may be lost (unless synchronous replication)

**In AWS RDS Multi-AZ:** Standby instance is maintained in sync (synchronous replication). Failover is automatic, typically 60-120 seconds. The CNAME of the endpoint is updated to point to the new primary.

---

## Module 16: Kafka Networking

### Broker Discovery

Kafka clients don't connect directly to all brokers at startup. Instead, they use a **bootstrap process:**

1. Client connects to one or more **bootstrap brokers** (configured as `bootstrap.servers`)
2. Client sends a **Metadata Request** to the bootstrap broker
3. Broker responds with the full cluster metadata: list of all brokers, topics, partition leaders
4. Client now knows the full cluster topology and connects to the appropriate leader broker for each partition it needs

This means `bootstrap.servers` doesn't need to list all brokers — just enough that at least one is reachable at startup. However, listing multiple is recommended for redundancy.

---

### Metadata Requests and Partition Leaders

**Metadata Requests** return information about:
- All broker hostnames and ports
- All topics and their partitions
- Which broker is the leader for each partition
- Which brokers are followers (ISR)

**Producers** send to the **partition leader**. Followers pull from the leader to replicate data. Consumers typically read from the leader (though recent versions allow reading from followers in the same AZ for cost savings — `replica.fetch.min.bytes`).

---

### ISR (In-Sync Replicas)

The **ISR (In-Sync Replica set)** is the set of replicas that are fully caught up with the leader. A replica is "in sync" if it has fetched all messages up to the last committed message from the leader within `replica.lag.time.max.ms`.

**`min.insync.replicas`:** Minimum number of replicas that must acknowledge a write before the producer considers it successful. Setting this to 2 (with replication factor 3) ensures you need at least 2 copies before confirming — provides durability at the cost of latency.

**Producer `acks` setting:**
- `acks=0`: Fire and forget (fastest, least durable)
- `acks=1`: Leader acknowledges (moderate)
- `acks=all` or `acks=-1`: All ISRs acknowledge (slowest, most durable)

---

### Consumer Groups and Rebalancing

**Consumer groups** allow multiple consumers to share the work of consuming from a topic. Each partition is consumed by exactly one consumer in the group.

**Rebalancing** occurs when:
- A consumer joins the group
- A consumer leaves the group (gracefully or via timeout)
- A topic's partition count changes

During rebalancing, all partition assignments are revoked and redistributed. This causes a brief pause in consumption.

**Rebalancing protocols:**
- **Eager rebalancing (default):** All consumers stop, revoke all partitions, then rebalance. Simple but causes downtime.
- **Cooperative/Incremental rebalancing:** Only reassign the partitions that need to move. Consumers that keep their partitions continue without interruption.

**Key networking parameters:**
- `session.timeout.ms`: Maximum time between heartbeats before broker removes consumer (default: 45000ms)
- `heartbeat.interval.ms`: How often consumers send heartbeats (default: 3000ms)
- `max.poll.interval.ms`: Maximum time between `poll()` calls before considered dead

---

## Module 17: Distributed Systems Networking

### Timeouts

In distributed systems, every network call must have a timeout. Without timeouts, a slow or unresponsive downstream service causes your threads/goroutines/resources to pile up, eventually exhausting your service.

**Types of timeouts:**

**Connection timeout:** How long to wait to establish a TCP connection. Should be short (1-5 seconds). If it takes longer, the server is likely unreachable.

**Read timeout (socket timeout):** How long to wait for data to arrive after the connection is established. Depends on expected response time (e.g., 2-30 seconds for typical APIs).

**Request timeout:** Total time budget for the entire request (connection + waiting + reading). Provides an upper bound.

**Write timeout:** How long to wait when sending data (usually less critical but can block on slow connections).

**Setting appropriate timeouts:**
- Measure your p99/p999 latency in normal conditions
- Set timeout to a multiple of p99 (e.g., 3×) to allow for occasional spikes
- Don't set it so high that failures cause thread pool exhaustion
- Propagate timeouts (reduce remaining budget as you call downstream services — deadline propagation)

---

### Retries

**Retries** handle transient failures (network blips, temporary overload) by automatically repeating failed requests.

**What to retry:**
- Network errors (connection refused, timeout)
- HTTP 503 Service Unavailable
- HTTP 429 Too Many Requests (with backoff)
- HTTP 502 Bad Gateway

**What NOT to retry:**
- HTTP 400 Bad Request (client error — retrying won't help)
- HTTP 401/403 (authentication/authorization — retry won't change outcome)
- Non-idempotent operations without an idempotency key (double charges, duplicate records)

**Retry budget:** Limit total retries across the service (not per request) to prevent retry storms from amplifying failures.

---

### Exponential Backoff with Jitter

**Exponential backoff** increases the wait time between retries exponentially to reduce load on a struggling server:

```
Attempt 1: wait 1s
Attempt 2: wait 2s
Attempt 3: wait 4s
Attempt 4: wait 8s
Attempt 5: wait 16s (capped at some max)
```

Without jitter, all retrying clients will retry at the same time, creating thundering herd problems. **Jitter** adds randomness:

```python
import random, time

base_delay = 1.0  # seconds
max_delay = 60.0
cap = 30.0

for attempt in range(max_attempts):
    try:
        result = make_request()
        break
    except TransientError:
        delay = min(cap, base_delay * (2 ** attempt))
        # Full jitter: random in [0, delay]
        time.sleep(random.uniform(0, delay))
```

**"Full jitter"** (random between 0 and computed delay) tends to work better than **"decorrelated jitter"** or **"equal jitter"** for most use cases.

---

### Circuit Breaker

The **circuit breaker pattern** prevents an application from repeatedly trying to call a service that's clearly failing. Analogous to an electrical circuit breaker.

**States:**
- **Closed (normal):** Requests flow through. Failures are counted.
- **Open (tripped):** Requests fail immediately without calling the service. After a timeout, transitions to Half-Open.
- **Half-Open (testing):** A limited number of test requests are allowed through. If they succeed, transition to Closed. If they fail, return to Open.

```
Closed → (failure threshold exceeded) → Open
Open → (timeout elapsed) → Half-Open
Half-Open → (test succeeds) → Closed
Half-Open → (test fails) → Open
```

**Benefits:**
- Prevents cascade failures (slow/failing service causing your threads to pile up)
- Gives the failing service time to recover
- Fails fast — better user experience than waiting for timeout

**Implementations:** Resilience4j (Java), Hystrix (Java, deprecated), Polly (.NET), go-resilience, Envoy sidecar

---

### Bulkhead

The **bulkhead pattern** isolates components of a system so that failure in one doesn't cascade to others. Named after ship compartments (bulkheads) that prevent flooding from sinking the whole ship.

**Implementation:**
- Separate thread pools for different downstream services
- Separate connection pools for different backends
- Resource quotas per customer/tenant

**Example:** An API gateway calls three downstream services: UserService, PaymentService, InventoryService. Without bulkheads, slow responses from PaymentService can exhaust the shared thread pool, causing UserService calls to also fail. With bulkheads, each service has a dedicated thread pool — PaymentService degradation doesn't affect UserService.

---

### Service Discovery

In dynamic environments (containers, cloud, Kubernetes), service instances start and stop frequently, and their IPs change. **Service discovery** is the mechanism by which services find each other.

**Client-side discovery:** The client queries a service registry (Consul, Eureka, etcd) directly and load-balances itself.

**Server-side discovery:** The client makes requests to a load balancer or DNS name, which handles discovery and routing.

**In Kubernetes:** Services are discovered via CoreDNS. Each Service gets a DNS name (`<service>.<namespace>.svc.cluster.local`) that resolves to the ClusterIP, which kube-proxy routes to healthy pods.

**Consul:** A popular service mesh/discovery tool. Services register themselves; clients query Consul for healthy instances. Supports health checking and DNS-based or HTTP API-based discovery.

---

### CAP Theorem

**CAP Theorem** states that a distributed system can only guarantee two of three properties simultaneously:

- **Consistency (C):** Every read receives the most recent write or an error
- **Availability (A):** Every request receives a (non-error) response, without guaranteeing it's the most recent write
- **Partition Tolerance (P):** The system continues operating despite network partitions (lost/delayed messages between nodes)

In practice, network partitions are unavoidable in distributed systems, so **P is not really optional**. The real choice is between **CP** (consistency over availability) and **AP** (availability over consistency) during partitions.

**CP systems:** HBase, Zookeeper, etcd, Consul. Choose to reject requests rather than serve potentially stale data.

**AP systems:** Cassandra, CouchDB, DynamoDB (in some configurations). Choose to serve potentially stale data rather than reject requests.

**Note:** CAP is a theoretical model with limitations. In practice, systems tune between consistency and latency (PACELC theorem).

---

### Quorum

**Quorum** is used in distributed systems to make decisions that require consensus without needing all nodes. A quorum is typically a majority: `(N/2) + 1` nodes.

With N=3 nodes:
- Quorum = 2
- Can tolerate 1 node failure
- Writes require 2 nodes to acknowledge
- Reads from 2 nodes guarantee seeing the latest write

With N=5 nodes:
- Quorum = 3
- Can tolerate 2 node failures

**Used in:** Raft consensus (Kubernetes etcd), Paxos, Kafka (min.insync.replicas), Cassandra (QUORUM consistency level)

---

## Module 18: Networking Security

### Firewalls

A **firewall** is a network security system that monitors and controls incoming and outgoing traffic based on security rules. It establishes a barrier between trusted internal networks and untrusted external networks.

**Types:**
- **Packet filtering:** Inspects packets at the network layer based on IP/port rules. Stateless.
- **Stateful inspection:** Tracks connection state; knows if a packet belongs to an established connection.
- **Application layer / NGFW (Next-Gen Firewall):** Deep packet inspection; can filter based on application protocol content.
- **WAF (Web Application Firewall):** Specializes in HTTP traffic; protects against OWASP Top 10.

---

### iptables

**iptables** is the Linux kernel's packet filtering framework. Used to configure firewall rules in Linux.

```bash
# View all rules
iptables -L -v -n

# Block a specific IP
iptables -A INPUT -s 1.2.3.4 -j DROP

# Allow SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Default drop policy
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# NAT/masquerade (for routing)
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
```

**iptables tables:**
- `filter` (default): Packet filtering (INPUT, OUTPUT, FORWARD chains)
- `nat`: Network address translation
- `mangle`: Packet modification
- `raw`: Early packet processing

Modern Linux uses **nftables** as the replacement for iptables, with a cleaner syntax and better performance.

---

### WAF (Web Application Firewall)

A **WAF** inspects HTTP requests and responses to protect web applications from common attacks:
- **SQL Injection:** Malicious SQL in input fields
- **Cross-Site Scripting (XSS):** Injected JavaScript executed in victims' browsers
- **CSRF:** Trick users into performing actions on authenticated sites
- **Command Injection:** Shell commands injected via input
- **Path traversal:** `../../etc/passwd` style attacks
- **HTTP flooding:** DDoS at the application layer

**Deployment modes:**
- **Detection mode:** Log but don't block (learn your traffic first)
- **Prevention mode:** Block malicious requests

**AWS WAF:** Managed WAF service integrates with CloudFront, ALB, and API Gateway. Supports managed rule groups (AWS, OWASP, vendor-specific).

---

### CORS (Cross-Origin Resource Sharing)

**CORS** is a browser security mechanism that controls which web pages can make requests to a different domain than the one that served the page.

**Same-Origin Policy (SOP):** Browsers block JavaScript from making requests to a different origin (protocol + domain + port) than the page's origin.

**CORS allows exceptions:**
```
Browser: GET https://api.example.com/data
  (from page at https://www.myapp.com)
  
Browser sends: Origin: https://www.myapp.com

Server responds with:
  Access-Control-Allow-Origin: https://www.myapp.com
  (or * for public APIs)

Browser: OK to read the response
```

**Preflight requests:** For non-simple requests (POST with JSON, custom headers), the browser sends an OPTIONS request first:
```
OPTIONS /api/data HTTP/1.1
Origin: https://myapp.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400   ← cache preflight for 1 day
```

---

### CSRF (Cross-Site Request Forgery)

**CSRF** attacks trick authenticated users into making unintended requests to a web application. For example: a malicious page makes the victim's browser send a state-changing request to their bank.

**Protection methods:**
- **CSRF tokens:** A random token included in forms and checked server-side. An attacker can't read the token (SOP) so can't forge the request.
- **SameSite cookies:** With `SameSite=Strict` or `Lax`, cookies aren't sent on cross-site requests.
- **Double Submit Cookie:** Submit the same random value as both a cookie and a request header; CSRF can't forge the header.
- **Check Origin/Referer headers:** Only process requests from allowed origins (not foolproof but a layer of defense).

---

### DDoS and SYN Flood

**DDoS (Distributed Denial of Service):** An attack in which many systems flood a target with traffic to overwhelm its capacity, making it unavailable to legitimate users.

**SYN Flood:** A specific DDoS attack targeting the TCP handshake. The attacker sends many SYN packets with spoofed source IPs. The server sends SYN-ACK responses and holds half-open connections, exhausting its connection table.

**Defenses:**
- **SYN cookies:** Server doesn't allocate state for half-open connections until the handshake completes
- **Rate limiting:** Limit SYN packets per source IP
- **IP reputation filtering:** Block known bad IPs
- **Anycast scrubbing:** Route traffic to DDoS mitigation centers that filter attack traffic
- **AWS Shield:** Managed DDoS protection service (Standard is free, Advanced is paid)

---

### Man-in-the-Middle (MITM)

A **MITM attack** occurs when an attacker secretly intercepts and potentially alters communication between two parties who believe they're communicating directly.

**Attack vectors:**
- ARP poisoning (LAN): Attacker responds to ARP requests with their own MAC address
- DNS poisoning: Return malicious IP for legitimate domain
- SSL stripping: Downgrade HTTPS to HTTP
- BGP hijacking: Advertise more specific routes to redirect internet traffic

**Defenses:**
- **HTTPS/TLS:** Encrypts traffic; certificate validation prevents impersonation
- **HSTS (HTTP Strict Transport Security):** Tells browsers to always use HTTPS for a domain
- **Certificate Transparency:** Public logs of all issued certificates; detect unauthorized cert issuance
- **DNSSEC:** Cryptographically signed DNS responses
- **mTLS:** Both sides must present valid certificates

---

## Module 19: Networking Observability

### OpenTelemetry

**OpenTelemetry (OTel)** is an open-source observability framework providing vendor-neutral APIs, SDKs, and tooling for generating, collecting, and exporting telemetry data: **traces, metrics, and logs**.

**Components:**
- **API:** Language-specific API for instrumentation
- **SDK:** Implementation of the API with processing and export capabilities
- **Collector:** Agent or gateway to receive, process, and export telemetry
- **OTLP (OpenTelemetry Protocol):** Standard telemetry data transport format

**Data types:**
- **Traces:** End-to-end journey of a request across services (spans)
- **Metrics:** Measurements over time (counters, gauges, histograms)
- **Logs:** Timestamped event records

OTel is supported by all major observability backends: Jaeger, Zipkin, Datadog, New Relic, Honeycomb, Grafana Tempo.

---

### Distributed Tracing

**Distributed tracing** tracks a request's journey across multiple services in a microservices architecture. Each unit of work is a **span**; related spans form a **trace**.

**Trace context propagation:** Each request carries a trace ID (and span ID) in headers that are passed through the system:
```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
              ^  ^                                ^                ^
              v  trace-id (16 bytes hex)          parent-span-id   flags
              version
```

**W3C Trace Context** is the standard. Also widely used: **B3 headers** (Zipkin), **X-Amzn-Trace-Id** (AWS).

**What traces tell you:**
- Total request latency and where time is spent
- Which service is the bottleneck
- Error propagation paths
- Database query counts and durations

---

### Correlation and Request IDs

**Correlation ID (or Trace ID):** A unique identifier assigned at the entry point of a system and passed through all subsequent calls. Allows correlating all logs, metrics, and traces for a single request across multiple services.

**Request ID:** Sometimes used synonymously with correlation ID. Often generated per service hop (vs. correlation ID which is end-to-end).

**Implementation:**
```python
# Generate at entry point (API gateway or first service)
request_id = str(uuid.uuid4())
headers['X-Request-Id'] = request_id
headers['X-Correlation-Id'] = correlation_id

# Log with IDs in every service
logger.info("Processing request", extra={
    "request_id": request_id,
    "correlation_id": correlation_id,
    "user_id": user_id
})

# Pass to downstream services
response = requests.get(
    downstream_url,
    headers={"X-Correlation-Id": correlation_id}
)
```

---

### Wireshark and Packet Capture

**Wireshark** is a graphical packet analyzer that captures and displays network traffic. Essential for deep protocol debugging.

**Common use cases:**
- Debug TLS handshake failures
- Inspect exact HTTP requests and responses
- Identify packet loss and retransmissions
- Analyze DNS resolution issues
- Verify MTU issues (fragmentation)

**Key Wireshark filters:**
```
http                          # All HTTP traffic
http.request.method == "POST" # Only POST requests
tcp.port == 8080              # Traffic on port 8080
ip.addr == 10.0.0.1           # Traffic to/from IP
tcp.flags.reset == 1          # TCP RST packets
dns                           # DNS traffic
tcp.analysis.retransmission   # Retransmitted packets
```

**tcpdump → Wireshark workflow:**
```bash
# Capture on server with tcpdump
tcpdump -i eth0 -w capture.pcap

# Transfer to local machine and open in Wireshark
scp server:/tmp/capture.pcap .
wireshark capture.pcap
```

---

### Network Metrics

Key network metrics to monitor in production:

**Latency metrics:**
- P50, P90, P99, P999 request latency (percentiles, not averages)
- DNS resolution time
- TCP connection time
- TLS handshake time
- Time to first byte (TTFB)

**Error metrics:**
- Error rate by status code (4xx, 5xx)
- TCP error rates (RST, retransmissions)
- DNS resolution failures
- TLS handshake failures

**Throughput metrics:**
- Requests per second (RPS)
- Bytes in/out per second
- Active connections
- Connection pool utilization

**Resource metrics:**
- Open file descriptors (connections use FDs)
- Socket buffer utilization
- NIC queue depths
- Network interface errors and drops

---

## Module 20: Production Troubleshooting

### DNS Debugging

**Symptoms:** Service cannot connect to other services, requests failing with "could not resolve host."

**Debugging steps:**

```bash
# 1. Test basic DNS resolution
dig api.example.com

# 2. Test with a specific resolver
dig @8.8.8.8 api.example.com
dig @10.0.0.2 api.example.com  # VPC's DNS resolver

# 3. Check /etc/resolv.conf
cat /etc/resolv.conf

# 4. Test resolution from inside a container/pod
kubectl exec -it mypod -- nslookup api.example.com
kubectl exec -it mypod -- dig api.example.com

# 5. Check if CoreDNS is healthy in Kubernetes
kubectl get pods -n kube-system | grep coredns
kubectl logs -n kube-system deployment/coredns

# 6. Trace the full DNS path
dig +trace api.example.com

# 7. Check TTL of cached records (look for very short or zero TTL)
dig api.example.com | grep -A1 'ANSWER SECTION'
```

**Common issues:**
- Wrong or missing `search` domain in `/etc/resolv.conf`
- DNS server unreachable (firewall blocking UDP/TCP port 53)
- TTL expired and re-resolution fails (authoritative server down)
- In Kubernetes: CoreDNS overloaded (high CPU, too many requests — implement NodeLocal DNSCache)
- ndots setting causing unnecessary absolute lookups

---

### TCP Connection Issues

**Symptoms:** "Connection refused," "Connection timed out," connections hang.

**Debugging:**

```bash
# Check if port is open on remote host
nc -zv host port
telnet host port

# Check connection state
ss -tnp | grep :8080
ss -t state established

# Check for SYN_SENT (timeout — nothing listening or firewall dropping)
ss -tnp | grep SYN_SENT

# Check server is listening
ss -tlnp | grep :8080

# Trace the connection attempt
tcpdump -i eth0 host remote_host and port 8080 -n

# Test from a specific source IP/interface
curl --interface eth1 http://host:8080
```

**"Connection refused"** means:
- Nothing is listening on that port
- OR a firewall is actively rejecting (RST response)

**"Connection timed out"** means:
- A firewall is silently dropping packets (no response at all)
- The host is unreachable
- Wrong IP or port

---

### TLS Handshake Failures

**Symptoms:** "SSL handshake failed," "certificate verify failed," "unknown certificate authority."

**Debugging:**

```bash
# Test TLS connection with verbose output
openssl s_client -connect host:443 -servername host

# Test with specific TLS version
openssl s_client -connect host:443 -tls1_2
openssl s_client -connect host:443 -tls1_3

# Check certificate details
openssl s_client -connect host:443 -servername host 2>&1 | openssl x509 -noout -text

# Test with custom CA
curl --cacert /path/to/ca-bundle.pem https://host

# Check certificate expiry
echo | openssl s_client -connect host:443 2>/dev/null | openssl x509 -noout -dates

# Debug via curl
curl -v --tlsv1.2 https://host 2>&1 | grep -E "(TLS|SSL|certificate)"
```

**Common issues:**
- Certificate expired
- Certificate hostname mismatch (CN/SAN doesn't match requested hostname)
- Self-signed certificate not trusted (missing in trust store)
- Intermediate certificate missing from chain
- Cipher suite mismatch (client and server have no common cipher)
- TLS version mismatch
- SNI not sent (connecting by IP instead of hostname)

---

### HTTP Errors (4xx/5xx)

**400 Bad Request:** Request malformed. Check Content-Type header, request body format, required fields.

**401 Unauthorized:** Missing or invalid authentication. Check token validity/expiry, Authorization header format.

**403 Forbidden:** Authenticated but not authorized. Check permissions, IAM policies, service account roles.

**404 Not Found:** Wrong URL path, resource doesn't exist, trailing slashes, case sensitivity.

**429 Too Many Requests:** Rate limited. Check rate limit headers (`Retry-After`, `X-RateLimit-*`). Implement backoff.

**500 Internal Server Error:** Server-side exception. Check application logs, exception traces.

**502 Bad Gateway:** Upstream returned invalid response. Check if backend is running and healthy. Look at backend logs.

**503 Service Unavailable:**
- LB has no healthy backends (all health checks failing)
- Service is overloaded
- Deployment in progress with no instances

**504 Gateway Timeout:**
- Backend took too long to respond
- Database query slow
- External API call timing out
- Network latency spike between LB and backend

```bash
# Check response headers for debugging info
curl -v https://api.example.com/endpoint 2>&1 | head -50

# Check load balancer access logs (AWS ALB)
# Check application logs for 500s
kubectl logs deployment/myapp --since=5m | grep ERROR
```

---

### Kubernetes Connectivity Issues

**Pod to Pod:**
```bash
# Test connectivity between pods
kubectl exec pod-a -- curl http://pod-b-ip:8080
kubectl exec pod-a -- ping pod-b-ip

# Check if CNI is working (pods have IPs)
kubectl get pods -o wide

# Check Network Policies
kubectl get networkpolicies -A
kubectl describe networkpolicy <name>
```

**Pod to Service:**
```bash
# Test service DNS resolution
kubectl exec pod -- nslookup my-service.my-namespace

# Test service connectivity
kubectl exec pod -- curl http://my-service:80

# Check endpoints (are backends registered?)
kubectl get endpoints my-service
kubectl describe service my-service

# Check pod labels match selector
kubectl get pods --selector=app=my-app
```

**External to Pod (Ingress):**
```bash
# Check Ingress resource
kubectl describe ingress my-ingress

# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Check TLS certificate
kubectl describe secret my-tls-secret

# Test with curl
curl -H "Host: api.example.com" http://load-balancer-ip/path
```

---

### AWS Networking Issues

**Security Group debugging:**
```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxx

# Use VPC Reachability Analyzer for automated path analysis
aws ec2 create-network-insights-path \
  --source i-source \
  --destination i-dest \
  --protocol TCP \
  --destination-port 80
```

**Common AWS networking mistakes:**
- Security group missing inbound rule for the correct port/CIDR
- NACL has an explicit DENY rule that overrides SG ALLOW
- Route table missing route to Internet Gateway (for public subnets)
- Route table missing route to NAT Gateway (for private subnets)
- Elastic IP not associated with NAT Gateway
- Instances in different subnets with no route between them
- VPC DNS hostnames not enabled (needed for internal DNS resolution)
- EC2 instance profile missing permissions for VPC endpoints

---

### Port Exhaustion

**Symptoms:** "Cannot assign requested address," connection failures under high load, many TIME_WAIT connections.

**Cause:** Each outbound TCP connection uses an ephemeral port. The Linux default range is 32768-60999 (28,232 ports). Under high connection rates or many short-lived connections, this fills up.

**Diagnosis:**
```bash
# Check current ephemeral port range
cat /proc/sys/net/ipv4/ip_local_port_range

# Count TIME_WAIT connections
ss -t state time-wait | wc -l

# Count total connections
ss -tan | awk '{print $1}' | sort | uniq -c

# Check socket stats
ss -s
```

**Solutions:**
```bash
# Expand ephemeral port range
echo "1024 65535" > /proc/sys/net/ipv4/ip_local_port_range
# Or persistently:
sysctl -w net.ipv4.ip_local_port_range="1024 65535"

# Enable port reuse for TIME_WAIT (safe)
sysctl -w net.ipv4.tcp_tw_reuse=1

# Reduce TIME_WAIT duration (more aggressive, use carefully)
sysctl -w net.ipv4.tcp_fin_timeout=30

# Use connection pooling (reduces total connections needed)
# Add more source IPs (NLB with multiple EIPs, multiple NICs)
```

---

### MTU Mismatch

**Symptoms:** TCP connections work for small data but fail or hang for large transfers. Ping works but HTTP requests fail or return partial data.

**Cause:** A link in the path has a smaller MTU than the sender expects, ICMP "Fragmentation Needed" is blocked, and PMTUD fails silently.

**Common scenarios:**
- VPN tunnels (add overhead, reducing effective MTU)
- VXLAN overlay networks in Kubernetes (1500 - 50 bytes overhead = 1450)
- AWS instances with jumbo frames in some paths but not others

**Diagnosis:**
```bash
# Test if large ping works
ping -c 1 -M do -s 1472 remote_host   # 1472 + 28 (ICMP+IP header) = 1500
ping -c 1 -M do -s 1400 remote_host   # Try smaller sizes

# Check interface MTU
ip link show

# Check for ICMP unreachable messages
tcpdump -i eth0 icmp

# Find the actual path MTU
tracepath remote_host
```

**Solutions:**
- Set MTU on the problematic interface: `ip link set eth0 mtu 1450`
- Enable TCP MSS clamping on the gateway: `iptables -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu`
- Ensure ICMP is not blocked for type 3, code 4 (Fragmentation Needed)

---

### Firewall Debugging

**Diagnosis steps:**

```bash
# 1. Check iptables rules
iptables -L -v -n --line-numbers
iptables -t nat -L -v -n

# 2. Check if traffic is being dropped
# Add a logging rule temporarily
iptables -I INPUT -p tcp --dport 8080 -j LOG --log-prefix "INPUT-8080: "
tail -f /var/log/kern.log | grep INPUT-8080

# 3. Check nftables (modern systems)
nft list ruleset

# 4. In AWS: check VPC flow logs
# Enable in VPC console → Flow Logs
# Filter for REJECT actions to specific port

# 5. Use netfilter-persistent to check all rules
iptables-save | grep 8080

# 6. Temporarily disable iptables to confirm (test env only!)
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -F
```

**AWS Security Group troubleshooting:**
```bash
# List security group rules for an instance
aws ec2 describe-instances --instance-ids i-xxx \
  --query 'Reservations[].Instances[].SecurityGroups'

aws ec2 describe-security-groups --group-ids sg-xxx \
  --query 'SecurityGroups[].IpPermissions'

# Use VPC Flow Logs to see ACCEPT/REJECT decisions
# CloudWatch Logs Insights query:
# fields @timestamp, srcAddr, dstPort, action
# | filter dstPort = 8080 and action = "REJECT"
# | sort @timestamp desc
```

---

## Quick Reference: Cheat Sheets

### Common Port Numbers
| Port | Protocol | Service          |
|------|----------|------------------|
| 22   | TCP      | SSH              |
| 25   | TCP      | SMTP             |
| 53   | TCP/UDP  | DNS              |
| 80   | TCP      | HTTP             |
| 443  | TCP      | HTTPS            |
| 3306 | TCP      | MySQL            |
| 5432 | TCP      | PostgreSQL       |
| 6379 | TCP      | Redis            |
| 9092 | TCP      | Kafka            |
| 2181 | TCP      | ZooKeeper        |
| 2379 | TCP      | etcd             |
| 8080 | TCP      | HTTP (alternate) |
| 6443 | TCP      | Kubernetes API   |
| 10250| TCP      | Kubelet          |
| 4789 | UDP      | VXLAN            |

### TCP Flags Reference
| Flag | Meaning                          |
|------|----------------------------------|
| SYN  | Synchronize (connection setup)   |
| ACK  | Acknowledge                      |
| FIN  | Finish (graceful close)          |
| RST  | Reset (abrupt close)             |
| PSH  | Push (deliver data immediately)  |
| URG  | Urgent (urgent data pointer)     |
| ECE  | ECN Echo (congestion)            |
| CWR  | Congestion Window Reduced        |

### HTTP Status Code Summary
| Range | Category      | Common Codes                     |
|-------|---------------|----------------------------------|
| 1xx   | Informational | 100 Continue                     |
| 2xx   | Success       | 200, 201, 204, 206               |
| 3xx   | Redirect      | 301, 302, 304, 307, 308          |
| 4xx   | Client Error  | 400, 401, 403, 404, 409, 422, 429|
| 5xx   | Server Error  | 500, 502, 503, 504               |

### CIDR Quick Reference
| CIDR | Hosts   |
|------|---------|
| /32  | 1       |
| /30  | 2       |
| /28  | 14      |
| /27  | 30      |
| /26  | 62      |
| /24  | 254     |
| /22  | 1,022   |
| /20  | 4,094   |
| /16  | 65,534  |
| /8   | 16M     |

---

## Closing Note

Networking is not a one-time subject to memorize — it's a set of mental models that deepen with every production incident, every packet capture analyzed, and every system designed. The concepts in this reference interconnect: understanding TCP helps you understand why HTTP/2 was built, which helps you understand why QUIC exists, which informs your load balancer choice, which determines your AWS architecture.

The best networking engineers I've encountered don't just know the facts — they know *why* each protocol was designed the way it was, what problem it was solving, and what trade-offs it made. That understanding lets you reason from first principles about problems you've never seen before.

**Further reading:**
- *TCP/IP Illustrated, Vol. 1* — W. Richard Stevens (the definitive reference)
- *Computer Networks* — Andrew Tanenbaum
- RFC 793 (TCP), RFC 791 (IP), RFC 2616 (HTTP/1.1), RFC 7540 (HTTP/2), RFC 9000 (QUIC)
- Cloudflare Blog (cloudflare.com/learning) — excellent practical networking articles
- AWS Documentation on VPC Networking
- Brendan Gregg's Linux Performance (systems and networking tools)

---
*Last updated: 2025 | ~3200 lines | Covers OSI through Kubernetes, AWS, Kafka, and Production Troubleshooting*