# WebSocket: The Complete Engineering Reference

> **The definitive guide** — from first principles to large-scale distributed systems.  
> Covers theory, protocol internals, architecture, security, performance, and interview prep.

---

## Table of Contents

1. [WebSocket Fundamentals](#1-websocket-fundamentals)
2. [Protocol & Handshake](#2-protocol--handshake)
3. [Connection Lifecycle Management](#3-connection-lifecycle-management)
4. [Client-Side WebSocket Engineering](#4-client-side-websocket-engineering)
5. [Backend WebSocket Server Architecture](#5-backend-websocket-server-architecture)
6. [Scaling WebSocket Systems](#6-scaling-websocket-systems)
7. [Security](#7-security)
8. [Reliability & Delivery Guarantees](#8-reliability--delivery-guarantees)
9. [Performance Optimization](#9-performance-optimization)
10. [Monitoring & Observability](#10-monitoring--observability)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Common System Design Patterns](#12-common-system-design-patterns)
13. [Advanced Distributed System Concepts](#13-advanced-distributed-system-concepts)
14. [WebSocket in Cloud Ecosystems](#14-websocket-in-cloud-ecosystems)
15. [Alternatives & Emerging Technologies](#15-alternatives--emerging-technologies)
16. [Coding Practice Topics](#16-coding-practice-topics)
17. [Common Interview Questions](#17-common-interview-questions)
18. [Senior-Level Deep Dive](#18-senior-level-deep-dive)

---

## 1. WebSocket Fundamentals

### What is WebSocket?

**Definition:** WebSocket is a communication protocol that provides full-duplex (two-way), persistent communication channels over a single, long-lived TCP connection between a client and server.

**Analogy:** Think of the difference between sending letters (HTTP) vs. having a phone call (WebSocket).
- With **HTTP (letters)**: You write a letter, send it, wait for a reply letter. Each exchange is independent.
- With **WebSocket (phone call)**: Once connected, both parties can speak and listen simultaneously, at any time, without needing to initiate a new request each time.

**Formal definition (RFC 6455):** WebSocket is a protocol that enables two-way communication between a client and a remote host, with the server allowed to send content to the browser without being first requested by the client.

---

### Why WebSocket Was Introduced

Before WebSocket, real-time web communication was painful. Developers had to hack around HTTP's request-response model:

```
PROBLEM TIMELINE:
─────────────────────────────────────────────────────────
1990s-2000s  │  Pure HTTP polling — client asks "anything new?" every N seconds
2000s        │  Long Polling — keep request open until server has something
2000s        │  HTTP Streaming — hack using chunked transfer encoding
2011         │  WebSocket (RFC 6455) — proper two-way protocol
─────────────────────────────────────────────────────────
```

**Core problems WebSocket solved:**
- Eliminate redundant HTTP headers on every message (often 800–2000 bytes overhead)
- Allow server-initiated pushes without tricks
- Reduce latency by avoiding connection setup on every exchange
- Enable true real-time, bidirectional communication

---

### WebSocket vs HTTP

| Aspect | HTTP | WebSocket |
|---|---|---|
| Direction | Request → Response (one-way per exchange) | Full-duplex (simultaneous both ways) |
| Connection | New connection per request (or reused briefly with keep-alive) | Single persistent connection |
| Overhead | Large headers per request | Small 2-byte minimum frame header |
| Server push | Not possible (without hacks) | Native |
| Latency | High (connection + TLS handshake each time) | Low (established once) |
| Use case | Documents, APIs, forms | Real-time data, chat, games |
| Protocol | HTTP/1.1, HTTP/2, HTTP/3 | ws://, wss:// |

```
HTTP REQUEST/RESPONSE MODEL:
  Client                    Server
    │──── GET /data ────────▶│
    │◀─── 200 OK + data ─────│
    │                        │
    │──── GET /data ────────▶│   (must ask again)
    │◀─── 200 OK + data ─────│

WEBSOCKET MODEL:
  Client                    Server
    │──── Upgrade Request ──▶│
    │◀─── 101 Switching ─────│
    │════════ open channel ═══════════════╗
    │──── message ──────────▶│           ║
    │◀─── message ───────────│   (both   ║
    │◀─── push ──────────────│   sides   ║
    │──── message ──────────▶│   can     ║
    │◀─── push ──────────────│   send    ║
    ╚════════════════════════╝ anytime)  ║
```

---

### WebSocket vs Polling

**Short Polling:**
```
Client polls every 2 seconds:

t=0s  Client: "Any new messages?"  Server: "No"
t=2s  Client: "Any new messages?"  Server: "No"
t=4s  Client: "Any new messages?"  Server: "No"
t=5s  [Server has a message!]
t=6s  Client: "Any new messages?"  Server: "Yes! Here it is"
                                           ↑ 1 second delay
Cons: Wasted requests, high latency, server load
```

---

### WebSocket vs Long Polling

**Long Polling:**
```
Client → Server: "Any messages?" [holds connection open]
Server: [waits...waits...waits...]
Server → Client: "Here's a message!" [immediately sends when available]
Client: [immediately sends new request] "Any more messages?"
[repeat]

Better than polling, but:
- Still creates a new HTTP request/response cycle per message
- Complex to implement correctly
- Headers re-sent each round trip
- Not true bidirectional (client still initiates)
```

---

### WebSocket vs SSE (Server-Sent Events)

| Feature | WebSocket | SSE |
|---|---|---|
| Direction | Bidirectional | Server → Client only |
| Protocol | ws/wss | HTTP/HTTPS |
| Browser support | All modern browsers | All modern browsers |
| Reconnection | Manual | Automatic |
| Binary data | Yes | No (text only) |
| Multiplexing | Manual | Native in HTTP/2 |
| Complexity | Higher | Lower |
| Best for | Chat, gaming, real-time collab | News feeds, notifications, dashboards |

**Analogy:**
- **SSE** = a radio broadcast (server broadcasts, clients listen)
- **WebSocket** = a walkie-talkie (either side can talk at any time)

---

### Full-Duplex Communication

**Full-duplex** means data can flow in both directions *simultaneously*, like a two-lane road.

```
SIMPLEX      ──────────────▶  (one direction only, e.g., TV broadcast)
HALF-DUPLEX  ──────▶ then ◀──  (both directions, but not at same time, e.g., walkie-talkie)
FULL-DUPLEX  ══════════════  (both directions simultaneously, e.g., phone call)
              ◀─────────────
```

WebSocket operates over TCP which is itself full-duplex. The WebSocket protocol preserves this property, allowing the client and server to send frames simultaneously without waiting.

---

### Real-World Use Cases

| Use Case | Why WebSocket? |
|---|---|
| **Chat applications** | Messages delivered instantly in both directions |
| **Live sports scores** | Server pushes score updates the moment they happen |
| **Stock tickers & trading** | Sub-millisecond price feed delivery |
| **Multiplayer games** | Real-time position/action synchronization |
| **Collaborative editing** | Simultaneous edits from multiple users (Google Docs style) |
| **IoT dashboards** | Devices stream sensor data continuously |
| **Customer support chat** | Agent and user exchange messages in real time |
| **Live auctions** | Instant bid updates to all participants |
| **Notification systems** | Push alerts without polling |
| **Code collaboration tools** | Live pair programming |

---

### Advantages and Limitations

**Advantages:**
- Low latency — no new connection setup per message
- Low overhead — minimal frame headers (2–14 bytes vs HTTP's ~800+ bytes)
- Real server push — no tricks needed
- Full-duplex — truly simultaneous communication
- Efficient for high-frequency messages

**Limitations:**
- Stateful — harder to scale horizontally than stateless HTTP
- Long-lived connections consume server resources (memory, file descriptors)
- Proxies/firewalls may block or interfere with WebSocket connections
- No built-in delivery guarantees (unlike HTTP which has request/response)
- No automatic reconnection — must be implemented manually
- Not ideal for infrequent, document-style requests

---

## 2. Protocol & Handshake

### HTTP Upgrade Mechanism

WebSocket begins life as an HTTP request. The client asks the server to "upgrade" the connection from HTTP to WebSocket.

```
UPGRADE FLOW:

   Browser                              Server
      │                                    │
      │  1. HTTP GET /chat                 │
      │     Upgrade: websocket             │
      │     Connection: Upgrade            │
      │     Sec-WebSocket-Key: abc123==    │
      │─────────────────────────────────▶ │
      │                                    │  2. Validates key, generates Accept
      │  HTTP/1.1 101 Switching Protocols  │
      │  Upgrade: websocket                │
      │  Sec-WebSocket-Accept: xyz789==    │
      │ ◀───────────────────────────────── │
      │                                    │
      │  ═══════ WebSocket Frames ════════ │  3. HTTP connection upgraded
      │  (TCP connection reused)           │
```

---

### Opening Handshake — Full Request/Response Headers

**Client Request:**
```http
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://example.com
Sec-WebSocket-Protocol: chat, superchat   (optional: subprotocols)
Sec-WebSocket-Extensions: permessage-deflate  (optional: extensions)
```

**Server Response (success):**
```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: chat             (selected subprotocol)
```

The `101 Switching Protocols` status code is the green light — the connection is now a WebSocket.

---

### Sec-WebSocket-Key & Sec-WebSocket-Accept

This is a security mechanism to prevent cross-protocol attacks.

**How it works:**
1. Client generates a random 16-byte value, base64-encodes it → `Sec-WebSocket-Key`
2. Server concatenates the key with the magic string `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`
3. Server SHA-1 hashes the result and base64-encodes it → `Sec-WebSocket-Accept`
4. Client verifies the accept value to confirm the server understood the WebSocket protocol

```javascript
// Server-side computation of Sec-WebSocket-Accept:
const crypto = require('crypto');
const MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function computeAccept(key) {
  return crypto
    .createHash('sha1')
    .update(key + MAGIC)
    .digest('base64');
}
```

**Purpose:** Prevents HTTP servers from accidentally treating WebSocket frames as HTTP requests.

---

### Subprotocols

Subprotocols let client and server agree on an application-level protocol to use over the WebSocket connection.

```http
/* Client offers multiple subprotocols */
Sec-WebSocket-Protocol: json-rpc, soap, custom-v2

/* Server picks one */
Sec-WebSocket-Protocol: json-rpc
```

Common subprotocols: `mqtt`, `stomp`, `graphql-ws`, `json-rpc`

---

### WebSocket Frame Structure

Every WebSocket message is sent as one or more **frames**. This is the binary format:

```
WebSocket Frame Format (RFC 6455):

 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
├─┬─┬─┬─┬───────┬─┬───────────────┬───────────────────────────────┤
│F│R│R│R│ opcode│M│  Payload len  │   Extended payload length     │
│I│S│S│S│ (4)   │A│    (7 bits)   │        (if needed)            │
│N│V│V│V│       │S│               │                               │
│ │1│2│3│       │K│               │                               │
└─┴─┴─┴─┴───────┴─┴───────────────┴───────────────────────────────┘

FIN  = 1 if this is the final (or only) fragment
RSV1-3 = Reserved (used by extensions like compression)
Opcode = what type of frame this is
MASK = 1 if payload is masked (required for client→server)
Payload length:
  0–125  → actual length
  126    → next 2 bytes are the real length (up to 65535)
  127    → next 8 bytes are the real length (up to 2^63)
```

---

### Control Frames vs Data Frames

**Data Frames (carry application payload):**

| Opcode | Hex | Description |
|---|---|---|
| Continuation | 0x0 | Continuation of a fragmented message |
| Text | 0x1 | UTF-8 encoded text data |
| Binary | 0x2 | Binary data (images, protobuf, etc.) |

**Control Frames (manage the connection):**

| Opcode | Hex | Description |
|---|---|---|
| Close | 0x8 | Initiate connection close |
| Ping | 0x9 | Keep-alive check |
| Pong | 0xA | Response to Ping |

Control frames must have `FIN=1` and payload ≤ 125 bytes.

---

### Masking

Frames sent from **client to server** MUST be masked. Frames from **server to client** must NOT be masked.

**Why masking?** Prevents cache-poisoning attacks on shared proxies. Masking XORs each byte of the payload with a 4-byte masking key.

```
masked_byte[i] = original_byte[i] XOR masking_key[i % 4]
```

---

### Fragmentation

Large messages can be split into multiple frames:

```
Message: "Hello World" (split into 3 fragments)

Frame 1: FIN=0, opcode=0x1 (Text), payload="Hel"
Frame 2: FIN=0, opcode=0x0 (Continuation), payload="lo "
Frame 3: FIN=1, opcode=0x0 (Continuation), payload="World"
                ↑ FIN=1 signals last fragment
```

Useful for streaming large payloads without buffering the entire message.

---

### ws vs wss

| Scheme | Description | Default Port | Encryption |
|---|---|---|---|
| `ws://` | Plain WebSocket | 80 | None |
| `wss://` | WebSocket Secure (over TLS) | 443 | TLS/SSL |

**Always use `wss://` in production.** `ws://` transmits data in plaintext — visible to network sniffers, ISPs, and proxies.

```
wss:// = WebSocket running inside TLS, exactly like HTTPS = HTTP inside TLS

wss://example.com/chat
 │       │           │
 │       │           └── Path/resource
 │       └── Host
 └── Secure WebSocket (TLS encrypted)
```

---

### TLS in WebSockets

When using `wss://`, the TLS handshake happens *before* the WebSocket handshake:

```
Client                           Server
  │──── TCP SYN ───────────────▶ │
  │◀─── TCP SYN-ACK ─────────── │
  │──── TCP ACK ───────────────▶ │
  │                               │
  │──── TLS ClientHello ────────▶ │  ← TLS handshake
  │◀─── TLS ServerHello ──────── │
  │◀─── TLS Certificate ──────── │
  │──── TLS Finished ───────────▶ │
  │                               │
  │──── HTTP Upgrade (encrypted)▶ │  ← WebSocket handshake
  │◀─── 101 Switching (encrypted)─│
  │                               │
  │════ Encrypted WS Frames ═════ │
```

---

### Ports and Networking

- `ws://` defaults to port **80** (same as HTTP)
- `wss://` defaults to port **443** (same as HTTPS)
- Custom ports are allowed: `ws://example.com:8080/ws`
- Firewalls that allow HTTP/HTTPS will usually allow WebSocket on the same ports
- Corporate proxies may still block WebSocket — they may not understand the Upgrade header

---

## 3. Connection Lifecycle Management

### Connection States

The WebSocket API defines four ready states:

```
CONNECTING (0) ──▶ OPEN (1) ──▶ CLOSING (2) ──▶ CLOSED (3)
     │                 │              │               │
     │                 │              │               │
  Handshake        Ready to      Close frame      Connection
  in progress      send/recv     exchanged        terminated
```

```javascript
const ws = new WebSocket('wss://example.com/ws');

switch (ws.readyState) {
  case WebSocket.CONNECTING: // 0
  case WebSocket.OPEN:       // 1
  case WebSocket.CLOSING:    // 2
  case WebSocket.CLOSED:     // 3
}
```

---

### Opening and Closing Handshake

**Opening:** The HTTP Upgrade described in Section 2.

**Closing Handshake:**
```
Initiator (either side)         Other side
       │                              │
       │──── Close frame ────────────▶│  (with status code + reason)
       │◀─── Close frame ─────────────│  (echo close)
       │                              │
       │──── TCP FIN ────────────────▶│
       │◀─── TCP FIN ─────────────────│
       │                              │
   Connection closed              Connection closed
```

The close frame contains a 2-byte status code and optional UTF-8 reason string.

---

### WebSocket Close Codes

| Code | Name | Description |
|---|---|---|
| 1000 | Normal Closure | Successful completion |
| 1001 | Going Away | Server shutting down or browser navigating away |
| 1002 | Protocol Error | Protocol violation |
| 1003 | Unsupported Data | Data type cannot be handled (e.g., binary when only text expected) |
| 1005 | No Status | Reserved — no close code provided |
| 1006 | Abnormal Closure | Connection dropped without close frame |
| 1007 | Invalid Frame Payload Data | Non-UTF-8 in text frame |
| 1008 | Policy Violation | Generic policy violation |
| 1009 | Message Too Big | Message exceeds server limit |
| 1011 | Internal Error | Server encountered an error |
| 1012 | Service Restart | Server restarting |
| 1013 | Try Again Later | Temporary overload |
| 4000–4999 | Application-defined | Custom codes for application use |

---

### Ping/Pong Heartbeats

TCP connections can silently die (network interruption, NAT timeout, idle firewall rules). Ping/Pong detects this.

```
Client              Server
  │                    │
  │◀──── PING ─────────│  every 30s (server sends ping)
  │───── PONG ─────────▶│  client must respond
  │                    │
  │◀──── PING ─────────│
  │  [no pong — 3 timeouts]
  │  [server closes connection]
```

```javascript
// Server-side heartbeat (Node.js ws library)
const HEARTBEAT_INTERVAL = 30_000;
const HEARTBEAT_TIMEOUT  = 10_000;

function startHeartbeat(ws) {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  const interval = setInterval(() => {
    if (!ws.isAlive) {
      clearInterval(interval);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  }, HEARTBEAT_INTERVAL);
}
```

---

### Keepalive Strategies

Different layers have keepalive mechanisms:

| Layer | Mechanism | Default Timeout |
|---|---|---|
| TCP | `TCP_KEEPALIVE` socket option | OS-dependent (often 2 hours!) |
| WebSocket | Ping/Pong frames | Application-defined |
| Application | Custom heartbeat messages | Application-defined |

**Recommendation:** Implement application-level heartbeats every 25–30 seconds. Don't rely on TCP keepalive (too slow) or stateless intermediaries (load balancers often have shorter timeouts).

---

### Detecting Dead Connections

```
ZOMBIE CONNECTION PROBLEM:

Server thinks:  "I have 10,000 active connections"
Reality:        "3,000 of them are dead (network cut, phone screen off, browser tab killed)"

Dead connections waste:
  - File descriptors
  - Memory (buffers per connection)
  - CPU (heartbeat checks)
  - Incorrect presence counts
```

**Detection strategies:**
1. Ping/Pong with timeout (WebSocket native)
2. Application-level heartbeat: client sends `{"type":"ping"}` every N seconds
3. Monitor TCP `CLOSE_WAIT` states using `netstat`
4. Track last-message timestamp per connection

---

### Idle Timeout

Set a max idle time after which a connection is forcibly closed:

```javascript
// Close connections idle for more than 5 minutes
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

ws.lastActivity = Date.now();

ws.on('message', () => {
  ws.lastActivity = Date.now();
});

setInterval(() => {
  if (Date.now() - ws.lastActivity > IDLE_TIMEOUT_MS) {
    ws.close(1000, 'Idle timeout');
  }
}, 60_000);
```

---

### Reconnection Strategies

Never assume a WebSocket connection will stay open forever. Always implement reconnection.

**Naive reconnect (don't do this):**
```javascript
// BAD: Hammers server with immediate reconnects
ws.onclose = () => new WebSocket(url);
```

**Exponential backoff with jitter (correct approach):**
```javascript
class ReconnectingWebSocket {
  constructor(url) {
    this.url = url;
    this.attempt = 0;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen  = () => { this.attempt = 0; };
    this.ws.onclose = () => this.scheduleReconnect();
    this.ws.onerror = () => this.ws.close();
  }

  scheduleReconnect() {
    const baseDelay = 1000;           // 1 second base
    const maxDelay  = 30_000;         // 30 second cap
    const jitter    = Math.random() * 1000;  // ±1 second jitter

    const delay = Math.min(
      baseDelay * Math.pow(2, this.attempt) + jitter,
      maxDelay
    );

    this.attempt++;
    setTimeout(() => this.connect(), delay);
  }
}
```

```
Backoff schedule (without jitter for clarity):
  Attempt 1: wait  1s
  Attempt 2: wait  2s
  Attempt 3: wait  4s
  Attempt 4: wait  8s
  Attempt 5: wait 16s
  Attempt 6: wait 30s (capped)
  Attempt N: wait 30s (stays at cap)
```

---

### Session Restoration

After reconnection, the client may have missed messages. Strategies:

1. **Message sequence numbers** — server assigns incrementing IDs; client sends last received ID on reconnect
2. **Timestamp-based replay** — client sends timestamp; server replays messages after that time
3. **Event sourcing** — server stores all events; client can replay any window

```javascript
// Client sends last known sequence on reconnect
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'restore',
    lastSeq: localStorage.getItem('lastSeq') || 0
  }));
};
```

---

## 4. Client-Side WebSocket Engineering

### Browser WebSocket API

```javascript
// Basic usage
const ws = new WebSocket('wss://example.com/ws');

// Connection opened
ws.onopen = (event) => {
  console.log('Connected');
  ws.send('Hello Server!');
};

// Message received
ws.onmessage = (event) => {
  console.log('Received:', event.data);
  // event.data is string (text) or Blob/ArrayBuffer (binary)
};

// Error
ws.onerror = (event) => {
  console.error('WebSocket error:', event);
};

// Connection closed
ws.onclose = (event) => {
  console.log(`Closed: code=${event.code} reason=${event.reason}`);
};

// Send data
ws.send('text message');
ws.send(JSON.stringify({ type: 'chat', text: 'Hi' }));
ws.send(new ArrayBuffer(8));   // binary
ws.send(new Blob([data]));     // binary

// Close
ws.close(1000, 'User logged out');
```

---

### Handling Binary Data

```javascript
// Tell the browser to give you ArrayBuffer (not Blob)
ws.binaryType = 'arraybuffer';  // default is 'blob'

ws.onmessage = (event) => {
  if (event.data instanceof ArrayBuffer) {
    const view = new DataView(event.data);
    const messageType = view.getUint8(0);
    const payload = event.data.slice(1);
  }
};
```

---

### Error Handling

```javascript
ws.onerror = (event) => {
  // Note: browser error events contain very little detail for security reasons
  // The close event that follows has more info
  logError('WebSocket error occurred');
};

ws.onclose = (event) => {
  if (!event.wasClean) {
    // Abnormal closure — network dropped, server crashed, etc.
    scheduleReconnect();
  }
  // event.code, event.reason available here
};
```

---

### Auto-Reconnect Implementation

```javascript
class RobustWebSocket extends EventTarget {
  #url; #ws; #attempt = 0; #forcedClose = false;
  #messageQueue = [];

  constructor(url) {
    super();
    this.#url = url;
    this.#connect();
  }

  #connect() {
    this.#ws = new WebSocket(this.#url);

    this.#ws.onopen = () => {
      this.#attempt = 0;
      // Flush queued messages
      while (this.#messageQueue.length) {
        this.#ws.send(this.#messageQueue.shift());
      }
      this.dispatchEvent(new Event('open'));
    };

    this.#ws.onmessage = (e) => this.dispatchEvent(
      new MessageEvent('message', { data: e.data })
    );

    this.#ws.onclose = () => {
      if (!this.#forcedClose) this.#scheduleReconnect();
    };
  }

  #scheduleReconnect() {
    const delay = Math.min(1000 * 2 ** this.#attempt++, 30_000);
    setTimeout(() => this.#connect(), delay + Math.random() * 500);
  }

  send(data) {
    if (this.#ws.readyState === WebSocket.OPEN) {
      this.#ws.send(data);
    } else {
      this.#messageQueue.push(data);  // queue if not connected
    }
  }

  close() {
    this.#forcedClose = true;
    this.#ws.close(1000, 'User initiated');
  }
}
```

---

### State Synchronization

When a client reconnects after a gap, state may be stale. Patterns:

**Full state snapshot on reconnect:**
```javascript
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'sync_request', clientVersion: localVersion }));
};

// Server responds with full state or delta
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'state_snapshot') applySnapshot(msg.data);
  if (msg.type === 'state_delta')    applyDelta(msg.ops);
};
```

---

### Handling Offline/Online Transitions

```javascript
window.addEventListener('online', () => {
  if (ws.readyState !== WebSocket.OPEN) {
    reconnect();
  }
});

window.addEventListener('offline', () => {
  // Don't attempt reconnect while offline — pointless
  clearReconnectTimers();
});
```

---

### Mobile Network Issues

Mobile connections are prone to:
- **IP address changes** (handoff between WiFi and cellular)
- **Intermittent connectivity** (tunnels, elevators)
- **Background app suspension** (iOS aggressively kills background processes)
- **NAT timeout** (NAT tables expire idle connections in 30–120 seconds)

**Mitigations:**
- Aggressive heartbeat interval (20–25 seconds to beat NAT timeouts)
- Re-authenticate on reconnect (IP may have changed, old session invalid)
- Detect `visibilitychange` events for tab/app becoming active

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Device may have been sleeping — check connection
    if (ws.readyState !== WebSocket.OPEN) reconnect();
    else ws.send(JSON.stringify({ type: 'ping' }));  // probe connection
  }
});
```

---

### Authentication from Frontend

WebSockets don't support custom headers in the initial browser API (unlike `fetch`). Options:

**Option 1: Token in URL (query param) — simple but less secure**
```javascript
const token = getJWT();
const ws = new WebSocket(`wss://example.com/ws?token=${token}`);
// Risk: token appears in server logs!
```

**Option 2: Token in first message — preferred**
```javascript
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'auth', token: getJWT() }));
  // Server accepts/rejects before processing other messages
};
```

**Option 3: Cookie-based auth — cleanest for browser clients**
```javascript
// If the user is already logged in via cookie-based session,
// the browser automatically sends cookies with the WebSocket upgrade request.
const ws = new WebSocket('wss://example.com/ws');
// Server reads session cookie from the Upgrade request headers
```

---

## 5. Backend WebSocket Server Architecture

### Connection Manager

Every WebSocket server needs a registry of active connections:

```javascript
class ConnectionManager {
  #connections = new Map();  // connectionId → ws

  register(id, ws) {
    this.#connections.set(id, ws);
    ws.on('close', () => this.#connections.delete(id));
  }

  send(id, message) {
    const ws = this.#connections.get(id);
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  broadcast(message, filter = () => true) {
    const data = JSON.stringify(message);
    for (const [id, ws] of this.#connections) {
      if (filter(id) && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }

  get size() { return this.#connections.size; }
}
```

---

### User-Session Mapping

```
Connection Registry:

connectionId (UUID) ──▶ ws object
userId              ──▶ Set<connectionId>   (user may have multiple tabs)
sessionId           ──▶ connectionId

Example:
  user:alice ──▶ { conn_1, conn_2 }   (two browser tabs)
  user:bob   ──▶ { conn_3 }
  conn_1     ──▶ ws_object_A
  conn_2     ──▶ ws_object_B
  conn_3     ──▶ ws_object_C
```

```javascript
class UserSessionMap {
  #userToConns = new Map();   // userId → Set<connectionId>
  #connToUser  = new Map();   // connectionId → userId
  #connToWs    = new Map();   // connectionId → ws

  connect(userId, connId, ws) {
    if (!this.#userToConns.has(userId)) {
      this.#userToConns.set(userId, new Set());
    }
    this.#userToConns.get(userId).add(connId);
    this.#connToUser.set(connId, userId);
    this.#connToWs.set(connId, ws);
  }

  disconnect(connId) {
    const userId = this.#connToUser.get(connId);
    this.#userToConns.get(userId)?.delete(connId);
    this.#connToUser.delete(connId);
    this.#connToWs.delete(connId);
  }

  sendToUser(userId, message) {
    const connIds = this.#userToConns.get(userId) ?? new Set();
    for (const connId of connIds) {
      const ws = this.#connToWs.get(connId);
      if (ws?.readyState === 1) ws.send(JSON.stringify(message));
    }
  }
}
```

---

### Room / Channel Architecture

```
Room Architecture:

  room:general ──▶ { alice, bob, charlie }
  room:sports  ──▶ { alice, dave }
  room:tech    ──▶ { bob, eve }

  alice is in: general, sports
  bob   is in: general, tech
```

```javascript
class RoomManager {
  #rooms = new Map();  // roomId → Set<userId>

  join(roomId, userId) {
    if (!this.#rooms.has(roomId)) this.#rooms.set(roomId, new Set());
    this.#rooms.get(roomId).add(userId);
  }

  leave(roomId, userId) {
    this.#rooms.get(roomId)?.delete(userId);
  }

  broadcast(roomId, message, excludeUserId = null) {
    const members = this.#rooms.get(roomId) ?? new Set();
    for (const userId of members) {
      if (userId !== excludeUserId) {
        userSessionMap.sendToUser(userId, message);
      }
    }
  }
}
```

---

### Message Routing

```
Incoming message flow:

Client ──▶ WebSocket Server ──▶ Message Router
                                      │
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                    chat handler  game handler  notification handler
                         │            │            │
                    Room broadcast  Game state  Push to recipients
```

```javascript
const handlers = {
  'chat':     handleChatMessage,
  'join':     handleJoinRoom,
  'leave':    handleLeaveRoom,
  'ping':     handlePing,
  'game_move': handleGameMove,
};

ws.on('message', (raw) => {
  const message = JSON.parse(raw);
  const handler = handlers[message.type];
  if (handler) {
    handler(ws, message, context);
  } else {
    ws.send(JSON.stringify({ type: 'error', code: 'UNKNOWN_MESSAGE_TYPE' }));
  }
});
```

---

### Presence Systems

A presence system tracks who is online, away, or offline.

```
Presence State Machine:

  OFFLINE ──[connect]──▶ ONLINE ──[idle 5min]──▶ AWAY
    ▲                       │                       │
    └──────[disconnect]──────┴───────[activity]──────┘
```

```javascript
class PresenceManager {
  #userStatus = new Map();  // userId → { status, lastSeen }

  setOnline(userId) {
    this.#userStatus.set(userId, { status: 'online', lastSeen: Date.now() });
    this.#broadcast({ type: 'presence', userId, status: 'online' });
  }

  setOffline(userId) {
    this.#userStatus.set(userId, { status: 'offline', lastSeen: Date.now() });
    this.#broadcast({ type: 'presence', userId, status: 'offline' });
  }

  getStatus(userId) {
    return this.#userStatus.get(userId)?.status ?? 'offline';
  }
}
```

---

### Stateful vs Stateless Design

| Aspect | Stateful | Stateless |
|---|---|---|
| Connection state | Stored in server memory | Stored in external store (Redis) |
| Scaling | Sticky sessions required | Any node can serve any request |
| Failover | Lost on node crash | Survives node crash |
| Latency | Lower (in-memory) | Higher (network call to Redis) |
| Complexity | Simpler per-node | More moving parts |

**Hybrid approach (recommended for large systems):**
- Hot data (active connections, room membership) in process memory
- Persistent data (message history, user data) in Redis/DB
- Pub/Sub for cross-node messaging

---

### Worker Threads / Event Loops

Node.js is single-threaded. CPU-heavy work blocks the event loop and freezes all WebSocket connections.

```
BAD: CPU work blocks all connections
  Event Loop ─── WS msg ─── [JSON.parse big payload 200ms] ─── all other msgs blocked!

GOOD: Offload CPU work to worker threads
  Event Loop ─── WS msg ─── [post to worker] ─────────────────▶ WS msg ─── WS msg...
                                    │
                               Worker Thread
                               [JSON.parse 200ms]
                                    │
                             result posted back
```

---

## 6. Scaling WebSocket Systems

### Vertical vs Horizontal Scaling

**Vertical scaling:** Give the server more CPU and RAM. Simple but has limits, and creates a single point of failure.

**Horizontal scaling:** Add more server nodes. More complex but virtually unlimited capacity.

```
HORIZONTAL SCALING PROBLEM:

  Client A connected to Server 1
  Client B connected to Server 2

  Client A sends a message to Client B...
  Server 1 doesn't know about Client B's connection!
  Server 1 has no direct reference to Server 2's connection.

  Solution: Cross-server messaging via shared pub/sub (Redis)
```

---

### Sticky Sessions

With multiple server nodes, you need a client to always reconnect to the same node (because connection state lives there).

```
WITHOUT STICKY SESSIONS:

  Client ──▶ Load Balancer ──▶ Server 1 (initial connection)
  Client ──▶ Load Balancer ──▶ Server 3 (reconnect — Server 3 has no context!)

WITH STICKY SESSIONS:

  Client ──▶ Load Balancer ──▶ Server 1 (always, based on IP or cookie)
```

**Nginx sticky session config:**
```nginx
upstream websocket_backend {
  ip_hash;  # route based on client IP
  server backend1.example.com;
  server backend2.example.com;
  server backend3.example.com;
}
```

**Limitation:** If Server 1 crashes, all its clients must reconnect and possibly re-authenticate. This is why moving state out of process memory is important for resilience.

---

### Load Balancers

Load balancers must support long-lived connections and the WebSocket Upgrade:

```nginx
# Nginx WebSocket load balancing
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

server {
  location /ws {
    proxy_pass http://websocket_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_read_timeout 3600s;  # don't close idle connections
    proxy_send_timeout 3600s;
  }
}
```

**Key LB settings for WebSocket:**
- `proxy_read_timeout` — increase from default 60s to match your idle timeout
- HTTP/1.1 mode required (WebSocket upgrade is HTTP/1.1)
- Preserve `Upgrade` and `Connection` headers

---

### Distributed Pub/Sub with Redis

Redis Pub/Sub enables cross-server message delivery:

```
ARCHITECTURE:

Server 1 (Alice connected)     Server 2 (Bob connected)
        │                               │
        │  publish to                   │  subscribe to
        │  "user:bob" channel           │  "user:bob" channel
        │                               │
        └──────────▶ Redis ────────────▶│
                  Pub/Sub              │
                                Bob receives message!
```

```javascript
const redis = require('redis');
const pub = redis.createClient();
const sub = redis.createClient();

// Server startup: subscribe to this server's channels
sub.subscribe('broadcast');
sub.subscribe(`server:${SERVER_ID}`);

sub.on('message', (channel, message) => {
  const { targetUserId, data } = JSON.parse(message);
  // Deliver to local connection if present
  userSessionMap.sendToUser(targetUserId, data);
});

// When routing a message to userId:
async function routeToUser(userId, message) {
  const serverId = await redis.hget('user_servers', userId);
  if (serverId === SERVER_ID) {
    // Local delivery
    userSessionMap.sendToUser(userId, message);
  } else {
    // Remote delivery via pub/sub
    pub.publish(`server:${serverId}`, JSON.stringify({ targetUserId: userId, data: message }));
  }
}
```

---

### Kafka Integration

For high-throughput event streaming, Kafka decouples message production from delivery:

```
KAFKA-BASED WEBSOCKET ARCHITECTURE:

[Clients] ──▶ [WS Servers] ──▶ [Kafka Topics]
                                      │
                               ┌──────┴──────┐
                               │  Consumers  │
                               └──────┬──────┘
                                      │
                              [WS Servers] ──▶ [Clients]
```

**Why Kafka over Redis Pub/Sub for large scale?**
- Kafka persists messages (Redis Pub/Sub does not)
- Kafka can replay messages for new consumers
- Kafka handles millions of messages/sec
- Kafka provides ordered, partitioned delivery

---

### Connection Sharding

Distribute connections across nodes by hashing the user/room ID:

```
Shard assignment:
  shard(userId) = hash(userId) % numServers

  user:alice → hash → shard 0 → Server A
  user:bob   → hash → shard 2 → Server C
  user:carol → hash → shard 1 → Server B
```

This ensures predictable routing without sticky sessions at the load balancer.

---

### Cross-Region Scaling

```
GLOBAL ARCHITECTURE:

Region: US-EAST          Region: EU-WEST         Region: AP-SOUTH
  ┌──────────────┐         ┌──────────────┐        ┌──────────────┐
  │  WS Cluster  │         │  WS Cluster  │        │  WS Cluster  │
  └──────┬───────┘         └──────┬───────┘        └──────┬───────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                         Global Message Bus
                         (Kafka / NATS / custom)
```

**Challenges:**
- Latency: cross-region messages add 50–200ms
- Consistency: user may appear online in one region but not another
- Fan-out: a popular room may have users in all regions
- Auth: tokens must be valid cross-region

---

## 7. Security

### WSS Encryption

Use `wss://` always. Everything described in Section 2 applies here. Key points:
- TLS prevents eavesdropping, tampering, and impersonation
- Verify TLS certificate validity server-side
- Use TLS 1.2+ (TLS 1.0/1.1 deprecated)
- Consider certificate pinning for mobile apps

---

### Authentication Methods

**JWT (most common):**
```javascript
// Client sends JWT in first message
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'auth', token: getJWT() }));
};

// Server validates
ws.on('message', async (raw) => {
  const msg = JSON.parse(raw);
  if (!ws.authenticated) {
    if (msg.type === 'auth') {
      try {
        ws.user = jwt.verify(msg.token, JWT_SECRET);
        ws.authenticated = true;
        ws.send(JSON.stringify({ type: 'auth_ok' }));
      } catch {
        ws.close(4001, 'Invalid token');
      }
    } else {
      ws.close(4003, 'Authenticate first');
    }
    return;
  }
  // Process authenticated messages...
});
```

---

### Token Refresh

JWT tokens expire. The connection may outlive the token:

```
t=0     Client connects, sends JWT (expires in 1 hour)
t=30min Token about to expire
t=55min Client sends { type: "refresh_token", refreshToken: "..." }
t=55min Server validates refresh token, issues new JWT
t=55min Server sends { type: "new_token", token: "new_jwt..." }
t=55min Client stores new JWT for next reconnection
t=1hr   Old JWT expired but connection still live (server cached auth)
```

---

### Origin Validation

Prevent connections from unauthorized domains:

```javascript
const wss = new WebSocketServer({ port: 8080 });

wss.on('headers', (headers, req) => {
  const origin = req.headers.origin;
  const allowed = ['https://myapp.com', 'https://www.myapp.com'];
  if (!allowed.includes(origin)) {
    // Can't reject during headers event — close after upgrade
    req.destroy(); // or reject in verifyClient
  }
});

// Better: use verifyClient
const wss = new WebSocketServer({
  port: 8080,
  verifyClient: (info, cb) => {
    const allowed = ['https://myapp.com'];
    const ok = allowed.includes(info.origin);
    cb(ok, ok ? 200 : 403, ok ? 'OK' : 'Forbidden');
  }
});
```

---

### Cross-Site WebSocket Hijacking (CSWSH)

**Attack:** A malicious site initiates a WebSocket connection to your server using the victim's credentials (cookies).

**Mitigations:**
1. Validate `Origin` header (see above)
2. Use CSRF tokens for WebSocket upgrade
3. Use token-based auth (not just cookies)
4. Ensure WebSocket endpoint is authenticated before processing messages

---

### Rate Limiting

```javascript
class RateLimiter {
  #window  = 1000;   // 1 second window
  #maxMsgs = 10;     // max 10 messages per second
  #buckets = new Map();

  check(clientId) {
    const now = Date.now();
    const bucket = this.#buckets.get(clientId) ?? { count: 0, windowStart: now };

    if (now - bucket.windowStart > this.#window) {
      bucket.count = 0;
      bucket.windowStart = now;
    }

    if (bucket.count >= this.#maxMsgs) return false;

    bucket.count++;
    this.#buckets.set(clientId, bucket);
    return true;
  }
}

ws.on('message', (data) => {
  if (!rateLimiter.check(ws.clientId)) {
    ws.send(JSON.stringify({ type: 'error', code: 'RATE_LIMITED' }));
    return;
  }
  processMessage(data);
});
```

---

### Message Validation

```javascript
const Joi = require('joi');

const chatMessageSchema = Joi.object({
  type:    Joi.string().valid('chat').required(),
  roomId:  Joi.string().uuid().required(),
  text:    Joi.string().max(2000).required(),
});

ws.on('message', (raw) => {
  let msg;
  try {
    msg = JSON.parse(raw);
  } catch {
    return ws.close(1003, 'Invalid JSON');
  }

  if (msg.text?.length > 2000) {
    return ws.send(JSON.stringify({ type: 'error', code: 'MSG_TOO_LONG' }));
  }

  const { error } = chatMessageSchema.validate(msg);
  if (error) {
    return ws.send(JSON.stringify({ type: 'error', code: 'VALIDATION_ERROR' }));
  }

  // Process valid message
});
```

---

## 8. Reliability & Delivery Guarantees

### TCP Guarantees

TCP provides:
- **Ordered delivery** — bytes arrive in the order they were sent
- **Reliable delivery** — lost packets are retransmitted
- **Error detection** — checksums on every segment

WebSocket inherits these, but only within a single connection. When a connection drops and you reconnect, there's a gap.

---

### Delivery Semantics

```
AT-MOST-ONCE:
  Send and forget. Message may be lost. Never duplicated.
  Use when: metrics, telemetry, game position updates (stale data is worthless)

AT-LEAST-ONCE:
  Retry until acknowledged. May be duplicated.
  Use when: chat messages, notifications (duplicates are annoying but acceptable)

EXACTLY-ONCE:
  No loss, no duplicates. Most complex to implement.
  Use when: financial transactions, critical state changes
```

---

### Acknowledgement System

```javascript
// Client: assigns sequence number, waits for ACK
class AckedSender {
  #seq = 0;
  #pending = new Map();  // seq → { message, timer }

  send(ws, message) {
    const seq = ++this.#seq;
    const data = JSON.stringify({ ...message, seq });
    ws.send(data);

    // Retry after 5 seconds if no ACK
    const timer = setTimeout(() => this.retry(ws, seq), 5000);
    this.#pending.set(seq, { data, timer });
  }

  ack(seq) {
    const entry = this.#pending.get(seq);
    if (entry) {
      clearTimeout(entry.timer);
      this.#pending.delete(seq);
    }
  }

  retry(ws, seq) {
    const entry = this.#pending.get(seq);
    if (entry && ws.readyState === WebSocket.OPEN) {
      ws.send(entry.data);
      entry.timer = setTimeout(() => this.retry(ws, seq), 5000);
    }
  }
}

// Server: sends ACK
ws.on('message', (raw) => {
  const msg = JSON.parse(raw);
  if (msg.seq !== undefined) {
    ws.send(JSON.stringify({ type: 'ack', seq: msg.seq }));
  }
  processMessage(msg);
});
```

---

### Duplicate Prevention (Idempotency)

```javascript
// Server-side deduplication with a sliding window
const recentSeqs = new Map();  // connectionId → Set<seq>

function isDuplicate(connId, seq) {
  const seen = recentSeqs.get(connId) ?? new Set();
  if (seen.has(seq)) return true;
  seen.add(seq);
  recentSeqs.set(connId, seen);
  // Expire old entries periodically
  return false;
}
```

---

### Message Persistence & Replay

```
DURABLE MESSAGE FLOW:

Client ──▶ Server ──▶ [Database: messages table] ──▶ Deliver to recipients
                               │
                      On reconnect: client sends lastSeq
                               │
                      Server queries: SELECT * FROM messages
                                       WHERE seq > lastSeq
                                         AND room = roomId
                               │
                      Server replays missed messages
```

---

## 9. Performance Optimization

### Memory Management

Each WebSocket connection consumes memory for:
- Socket buffers (send and receive)
- Application-level buffers
- Per-connection state objects

**Rough estimate:** 1,000 bytes–10 KB per connection (varies by OS, buffers, application)

**For 1 million connections:** 1–10 GB RAM minimum just for connection overhead.

---

### File Descriptor Limits

Each WebSocket connection = one file descriptor (FD).

```bash
# Check current limit
ulimit -n

# Typical default: 1024 (way too low for production!)

# Increase for current session
ulimit -n 1000000

# Permanent increase (/etc/security/limits.conf)
# * soft nofile 1000000
# * hard nofile 1000000

# System-wide (/etc/sysctl.conf)
# fs.file-max = 2000000
```

---

### epoll / Event Loops

Node.js and most modern servers use **I/O multiplexing** (epoll on Linux) — a single thread can efficiently monitor thousands of connections simultaneously.

```
WITHOUT EPOLL (thread-per-connection):
  1000 connections = 1000 threads = huge memory + context switching

WITH EPOLL (event-driven):
  1000 connections = 1 thread + epoll watches all FDs
  Only acts when a FD is ready (has data)
  C10K problem solved
```

---

### Compression (permessage-deflate)

WebSocket supports per-message deflate compression:

```http
/* Negotiated during handshake */
Client: Sec-WebSocket-Extensions: permessage-deflate
Server: Sec-WebSocket-Extensions: permessage-deflate; server_no_context_takeover
```

**Typical compression ratios for JSON payloads: 3:1 to 10:1**

**Tradeoff:** CPU cost vs bandwidth savings. Beneficial for text-heavy messages over slow connections. May not be worth it for binary data (already compressed) or high-frequency small messages (overhead > savings).

---

### Binary vs Text Frames

| Aspect | Text (opcode 0x1) | Binary (opcode 0x2) |
|---|---|---|
| Encoding | UTF-8 only | Any bytes |
| Overhead | None | None |
| Performance | JSON parsing CPU cost | Protobuf/MessagePack faster |
| Debuggability | Easy (readable) | Hard (need decoder) |
| Size | Verbose (JSON) | Compact (Protobuf ~3-10x smaller) |

**Recommendation:** Use binary + Protobuf/MessagePack for high-throughput systems. Use text + JSON for developer-friendliness at lower volumes.

---

### Backpressure

**Backpressure** occurs when a sender produces messages faster than a receiver can consume them. If unhandled, buffers grow unboundedly until the server runs out of memory.

```javascript
// Check bufferedAmount before sending
function sendWithBackpressure(ws, data) {
  const MAX_BUFFER = 1024 * 1024;  // 1MB

  if (ws.bufferedAmount > MAX_BUFFER) {
    // Slow consumer — either drop or queue with limits
    console.warn('Backpressure detected — dropping message');
    return false;
  }

  ws.send(data);
  return true;
}
```

---

### Latency Optimization

Key sources of latency and fixes:

| Source | Fix |
|---|---|
| TLS handshake (first connection) | TLS session resumption |
| DNS lookup | DNS caching, use IP directly for WebSocket |
| JSON parsing | Binary protocols (Protobuf), partial parsing |
| Message queuing in server | Direct delivery, skip unnecessary queues |
| Network distance | Edge deployment, regional servers |
| Head-of-line blocking | Multiple WebSocket connections or HTTP/2 |

---

## 10. Monitoring & Observability

### Key Metrics to Track

**Connection metrics:**
- Active connections (current count)
- Connection rate (new connections/sec)
- Disconnection rate (with breakdown by close code)
- Connection duration distribution

**Message metrics:**
- Messages sent/received per second
- Message size distribution (bytes)
- Message processing latency (time from receipt to delivery)

**Error metrics:**
- Error rate by error type
- Heartbeat failure rate
- Authentication failure rate

**Infrastructure metrics:**
- Memory per connection
- File descriptor usage %
- CPU usage (event loop lag in Node.js)
- Network I/O (bytes in/out)

---

### Prometheus Metrics (Node.js example)

```javascript
const client = require('prom-client');

const activeConnections = new client.Gauge({
  name: 'ws_active_connections',
  help: 'Number of active WebSocket connections',
  labelNames: ['server_id'],
});

const messageCounter = new client.Counter({
  name: 'ws_messages_total',
  help: 'Total WebSocket messages',
  labelNames: ['direction', 'type'],
});

const messageLatency = new client.Histogram({
  name: 'ws_message_latency_ms',
  help: 'Message processing latency in milliseconds',
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
});

// Instrument your code:
wss.on('connection', (ws) => {
  activeConnections.inc({ server_id: SERVER_ID });
  ws.on('close', () => activeConnections.dec({ server_id: SERVER_ID }));
});
```

---

### Grafana Dashboard

Key panels to include:
1. **Active connections** (time series, line chart) — watch for gradual leaks
2. **Connection rate** (rate of connects/disconnects) — spot traffic spikes
3. **Message throughput** (messages/sec in + out)
4. **Latency percentiles** (p50, p95, p99) — SLO tracking
5. **Error rate** (% of messages with errors)
6. **Memory usage** — correlate with connection count
7. **Disconnect reasons** (heatmap by close code) — diagnose network issues
8. **Heartbeat failure rate** — proxy for network health

---

### Distributed Tracing

Use trace IDs to follow a message through the entire stack:

```javascript
// Attach trace ID to every message
ws.on('message', (raw) => {
  const msg = JSON.parse(raw);
  const traceId = msg.traceId || generateTraceId();

  span = tracer.startSpan('ws.message.process', {
    tags: { 'ws.message.type': msg.type, 'user.id': ws.userId }
  });

  processMessage(msg, traceId).finally(() => span.finish());
});
```

---

## 11. Deployment & Infrastructure

### Nginx for WebSockets

Full production Nginx config:

```nginx
upstream ws_backend {
  least_conn;
  server ws1.internal:8080 weight=1;
  server ws2.internal:8080 weight=1;
  server ws3.internal:8080 weight=1;
  keepalive 32;
}

map $http_upgrade $connection_upgrade {
  default  upgrade;
  ''       close;
}

server {
  listen 443 ssl http2;
  server_name ws.example.com;

  ssl_certificate     /etc/ssl/certs/example.crt;
  ssl_certificate_key /etc/ssl/private/example.key;
  ssl_protocols TLSv1.2 TLSv1.3;

  location /ws {
    proxy_pass            http://ws_backend;
    proxy_http_version    1.1;
    proxy_set_header      Upgrade    $http_upgrade;
    proxy_set_header      Connection $connection_upgrade;
    proxy_set_header      Host       $host;
    proxy_set_header      X-Real-IP  $remote_addr;
    proxy_read_timeout    3600s;
    proxy_send_timeout    3600s;
    proxy_buffers         8 32k;
    proxy_buffer_size     64k;
  }
}
```

---

### Kubernetes Deployment

```yaml
# WebSocket Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ws-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ws-server
  template:
    spec:
      containers:
      - name: ws-server
        image: ws-server:latest
        ports:
        - containerPort: 8080
        resources:
          requests: { cpu: "500m", memory: "512Mi" }
          limits:   { cpu: "2",    memory: "2Gi"   }
---
# Service with session affinity for sticky sessions
apiVersion: v1
kind: Service
metadata:
  name: ws-service
spec:
  selector:
    app: ws-server
  sessionAffinity: ClientIP    # sticky sessions!
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800    # 3 hours
  ports:
  - port: 80
    targetPort: 8080
```

---

### Zero-Downtime Deployments

**Challenge:** During a rolling deployment, existing long-lived WebSocket connections are on old nodes being terminated.

**Strategy:**
```
1. Start new node (new version)
2. Load balancer routes new connections to new node
3. Send SIGTERM to old node
4. Old node:
   a. Stops accepting new connections
   b. Sends "server_restart" message to all connected clients
   c. Clients see message and reconnect (to new node)
   d. After 30s grace period, old node terminates
```

```javascript
process.on('SIGTERM', () => {
  // Notify clients of planned restart
  for (const ws of wss.clients) {
    ws.send(JSON.stringify({ type: 'server_restart', reconnectIn: 5000 }));
  }
  // Stop accepting new connections
  wss.close(() => process.exit(0));
});
```

---

## 12. Common System Design Patterns

### Chat System

```
ARCHITECTURE:

Users ──▶ WebSocket Servers (WS1, WS2, WS3)
                │
         Redis Pub/Sub
         ┌──────┴──────┐
         │             │
    Room State    Message DB
    (Redis Hash)  (Postgres/MongoDB)

MESSAGE FLOW:
  1. Alice (on WS1) sends { type:"chat", room:"general", text:"Hello" }
  2. WS1 validates, saves to DB, publishes to Redis channel "room:general"
  3. Redis delivers to all WS servers subscribed to "room:general"
  4. Each WS server delivers to its locally-connected members of "general"
```

---

### Live Score / Notification System

```
ARCHITECTURE:

Score Source (sports API / game engine)
        │
   Event Processor
        │
   Redis Pub/Sub ──▶ WebSocket Servers ──▶ Subscribed Clients
                              │
                    Client subscribes:
                    { type: "subscribe", topic: "match:42" }

BROADCAST PATTERN (fan-out):
  1 score update ──▶ 100,000 subscribers
  Must be highly optimized:
  - Pre-serialize message once
  - Use shared ArrayBuffer
  - Deliver in parallel (async fan-out)
```

---

### Multiplayer Gaming

```
GAME LOOP:
  60fps client input ──▶ Server ──▶ Game state update ──▶ All players

KEY CHALLENGES:
  1. Latency compensation (client-side prediction)
  2. State reconciliation (server is authoritative)
  3. Bandwidth optimization (delta updates only)

CLIENT-SIDE PREDICTION:
  Client applies move locally immediately (feels instant)
  Server validates and sends authoritative state
  Client reconciles (may rewind and replay if different)
```

---

### Collaborative Editing (Operational Transform / CRDT)

```
PROBLEM: Two users edit same document simultaneously

User A (pos 5): insert "Hello"
User B (pos 5): insert "World"

Without coordination:
  Document: "HelloWorld" or "WorldHello" (inconsistent!)

OPERATIONAL TRANSFORM:
  Server receives A's op then B's op
  Transforms B's op relative to A's op:
  B's new position = 5 + length("Hello") = 10
  Result: "Hello World" (consistent for all users)

CRDT (Conflict-free Replicated Data Type):
  Each character has a globally unique ID and position
  Operations always converge regardless of order
  No central server needed
```

---

### IoT Communication

```
IOT ARCHITECTURE:

IoT Devices ──▶ MQTT Broker ──▶ Backend ──▶ WebSocket ──▶ Dashboard
                     │
           Lightweight pub/sub
           (for constrained devices)

WHY MQTT FOR DEVICES?
  - Very small protocol overhead
  - Works on 2G/3G networks
  - Handles intermittent connectivity
  - QoS levels (at-most-once, at-least-once, exactly-once)

WHY WEBSOCKET FOR DASHBOARD?
  - Browser-native
  - Full-duplex for bidirectional control
  - Rich data visualization
```

---

## 13. Advanced Distributed System Concepts

### Distributed Presence

Tracking who is online across multiple servers:

```
NAIVE APPROACH (wrong):
  Each server maintains local online set
  Server 1: { alice, bob }
  Server 2: { carol }
  Server 3: { dave }
  → No server knows the global picture!

CORRECT APPROACH:
  Redis Hash: user_online → { alice: server1, bob: server1, carol: server2, ... }

  On connect:  HSET user_online <userId> <serverId>
               EXPIRE (with TTL — heartbeat keeps it alive)
  On disconnect: HDEL user_online <userId>
  To check:    HGET user_online <userId>
  To list all: HGETALL user_online
```

---

### Leader Election

Needed when exactly one node should perform a task (e.g., sending scheduled messages, cleanup jobs):

```
REDIS-BASED LEADER ELECTION:

  All nodes compete:
  SET leader "node1" NX EX 30   (NX = only if not exists, EX = expire in 30s)

  Only one wins (atomicity of Redis SET NX)
  Winner renews every 15s:
  SET leader "node1" XX EX 30   (XX = only if exists — renew)

  If leader crashes, lock expires after 30s
  Other nodes compete again
```

---

### CAP Theorem for WebSocket Systems

```
CAP Theorem: In a distributed system, you can guarantee only 2 of:
  C — Consistency (all nodes see the same data)
  A — Availability (every request gets a response)
  P — Partition Tolerance (system works despite network splits)

For WebSocket systems:
  Most choose AP (Availability + Partition Tolerance):
    - Users may briefly see stale presence data
    - Messages may be delivered out of order across regions
    - But the system stays up and users can connect

  Some choose CP (Consistency + Partition Tolerance):
    - Trading systems, financial platforms
    - Better to reject than to serve stale data
```

---

### Event Sourcing with WebSocket

```
TRADITIONAL: Store current state
  DB: { user: alice, balance: 100 }

EVENT SOURCING: Store all events
  DB events table:
    { type: "deposit",  amount: 200 }
    { type: "withdraw", amount: 100 }
    { type: "deposit",  amount: 50  }

  Current state = replay of all events (current balance: 150)

WEBSOCKET INTEGRATION:
  - New events are immediately pushed via WebSocket
  - Clients can request replay from any point
  - Perfect audit trail
  - Enables time-travel debugging
```

---

## 14. WebSocket in Cloud Ecosystems

### AWS API Gateway WebSockets

AWS API Gateway supports WebSocket APIs with Lambda integration:

```
Client ──▶ API Gateway (WebSocket) ──▶ Lambda functions

Routes:
  $connect    → onConnect Lambda
  $disconnect → onDisconnect Lambda
  $default    → onMessage Lambda
  /chat       → chatHandler Lambda

Connection management:
  API Gateway stores connectionId
  Lambda uses SDK to send back:

  const apigw = new ApiGatewayManagementApi({ endpoint: ENDPOINT });
  await apigw.postToConnection({
    ConnectionId: connectionId,
    Data: JSON.stringify({ type: 'msg', text: 'Hello' })
  }).promise();
```

**Limitations:**
- 10 minute connection timeout (configurable up to 2 hours)
- 128 KB max message size
- Cold start latency for Lambda
- Not ideal for very high message frequency

---

### Serverless Challenges

WebSockets are fundamentally stateful, which conflicts with serverless philosophy:

| Challenge | Solution |
|---|---|
| Function timeout | Store connection state in DynamoDB/Redis |
| No persistent process | API Gateway manages connections |
| Cold starts | Provisioned concurrency, keep-warm pings |
| Fan-out to many connections | Async fan-out via SQS/SNS |
| Cross-connection messaging | DynamoDB + API Gateway Management API |

---

### Cloudflare Durable Objects

Durable Objects solve the serverless WebSocket problem by providing a stateful compute primitive at the edge:

```javascript
export class ChatRoom {
  constructor(state, env) {
    this.state  = state;
    this.sessions = [];
  }

  async fetch(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.state.acceptWebSocket(server);
    this.sessions.push(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, message) {
    // Broadcast to all sessions in this Durable Object
    for (const session of this.sessions) {
      session.send(message);
    }
  }
}
```

Durable Objects run at Cloudflare edge, giving you stateful WebSocket handling with ~10ms latency globally.

---

## 15. Alternatives & Emerging Technologies

### Comparison Table

| Technology | Direction | Transport | Best For |
|---|---|---|---|
| WebSocket | Bidirectional | TCP | General real-time, chat, games |
| SSE | Server→Client | HTTP | News feeds, notifications |
| Long Polling | Server→Client | HTTP | Legacy browser support |
| WebRTC Data Channels | P2P bidirectional | UDP/SCTP | Video calls, P2P file transfer |
| gRPC streaming | Bidirectional | HTTP/2 | Microservice streaming |
| HTTP/2 Server Push | Server→Client | HTTP/2 | Asset push (deprecated in Chrome) |
| WebTransport | Bidirectional | HTTP/3 (QUIC) | Next-gen, low-latency gaming |
| MQTT | Pub/Sub | TCP | IoT, constrained devices |
| GraphQL Subscriptions | Server→Client | WebSocket | Type-safe real-time queries |
| Socket.IO | Bidirectional | WebSocket + fallback | Rapid development, legacy support |

---

### WebTransport (Emerging)

WebTransport is the next evolution, built on HTTP/3 (QUIC):

```
ADVANTAGES OVER WEBSOCKET:
  - Streams: multiple independent streams on one connection
  - Datagrams: UDP-like unreliable delivery (for games, video)
  - No head-of-line blocking (QUIC streams are independent)
  - Better connection migration (IP change = no reconnect needed)
  - Faster handshake (QUIC 0-RTT)

CURRENT STATUS (2025):
  - Available in Chrome, Firefox, Edge
  - Server support growing (Node.js, Deno, Go)
  - Not yet suitable as WebSocket replacement for all cases
```

---

### Socket.IO vs Raw WebSocket

| Aspect | Raw WebSocket | Socket.IO |
|---|---|---|
| Fallback | No | Yes (polling) |
| Rooms | Manual | Built-in |
| Auto-reconnect | Manual | Built-in |
| Acknowledgements | Manual | Built-in |
| Namespace | Manual | Built-in |
| Binary | Manual | Built-in |
| Overhead | Minimal | Extra (~60KB client library) |
| Flexibility | Full | Opinionated |
| Best for | Custom high-perf systems | Rapid development |

---

## 16. Coding Practice Topics

### Basic WebSocket Server (Node.js)

```javascript
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`New connection from ${ip}`);

  ws.on('message', (data) => {
    console.log('Received:', data.toString());
    ws.send(`Echo: ${data}`);
  });

  ws.on('close', (code, reason) => {
    console.log(`Connection closed: ${code} ${reason}`);
  });

  ws.on('error', (err) => {
    console.error('Error:', err);
  });

  ws.send('Welcome!');
});

console.log('WebSocket server running on ws://localhost:8080');
```

---

### Chat Application (with rooms)

```javascript
const { WebSocketServer } = require('ws');
const { randomUUID } = require('crypto');

const wss = new WebSocketServer({ port: 8080 });
const rooms = new Map();  // roomId → Set<ws>

wss.on('connection', (ws) => {
  ws.id = randomUUID();
  ws.rooms = new Set();

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());

    switch (msg.type) {
      case 'join': {
        const room = rooms.get(msg.room) ?? new Set();
        room.add(ws);
        rooms.set(msg.room, room);
        ws.rooms.add(msg.room);
        broadcast(msg.room, { type: 'join', user: ws.id }, ws);
        break;
      }
      case 'chat': {
        broadcast(msg.room, { type: 'chat', user: ws.id, text: msg.text });
        break;
      }
    }
  });

  ws.on('close', () => {
    for (const room of ws.rooms) {
      rooms.get(room)?.delete(ws);
    }
  });
});

function broadcast(roomId, message, exclude = null) {
  const room = rooms.get(roomId) ?? new Set();
  const data = JSON.stringify(message);
  for (const client of room) {
    if (client !== exclude && client.readyState === 1) {
      client.send(data);
    }
  }
}
```

---

### Heartbeat Implementation

```javascript
const INTERVAL = 25_000;

wss.on('connection', (ws) => {
  ws.isAlive = true;

  ws.on('pong', () => { ws.isAlive = true; });

  const hb = setInterval(() => {
    if (!ws.isAlive) {
      clearInterval(hb);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  }, INTERVAL);

  ws.on('close', () => clearInterval(hb));
});
```

---

### Redis Pub/Sub Integration

```javascript
const Redis = require('ioredis');
const pub = new Redis();
const sub = new Redis();

// Subscribe to all channels this server handles
sub.subscribe('broadcast', `server:${SERVER_ID}`);

sub.on('message', (channel, message) => {
  const { targetId, data } = JSON.parse(message);
  const ws = connections.get(targetId);
  if (ws?.readyState === 1) ws.send(data);
});

// Route message to a user
async function sendToUser(userId, data) {
  const serverId = await pub.hget('user_server', userId);
  if (serverId === SERVER_ID) {
    connections.get(userId)?.send(data);
  } else {
    pub.publish(`server:${serverId}`, JSON.stringify({ targetId: userId, data }));
  }
}
```

---

## 17. Common Interview Questions

### Fundamental Theory

**Q: What is WebSocket and how does it differ from HTTP?**  
WebSocket is a full-duplex, persistent communication protocol. Unlike HTTP (request-response), WebSocket allows both client and server to send messages at any time after a one-time handshake. It runs over TCP and is initiated via an HTTP Upgrade request.

**Q: Explain the WebSocket handshake.**  
Client sends an HTTP GET with `Upgrade: websocket` and a `Sec-WebSocket-Key`. Server responds with `101 Switching Protocols` and a `Sec-WebSocket-Accept` (derived by SHA-1 hashing the key + magic string). The TCP connection is then repurposed for WebSocket frames.

**Q: What is masking and why is it required?**  
Client-to-server frames must be XOR-masked with a random 4-byte key to prevent cache-poisoning attacks by shared intermediary proxies. Server-to-client frames are not masked (performance reasons; server is trusted).

---

### Scenario Questions

**Q: A user's WebSocket connection drops. How do you ensure they don't miss messages?**  
Assign sequence numbers to all messages. On reconnect, the client sends its `lastSeq`. The server queries all messages with `seq > lastSeq` and replays them. To prevent storing messages forever, implement a TTL or rolling window.

**Q: How would you implement typing indicators?**  
- Client sends `{type:"typing_start", roomId}` on keydown
- Client sends `{type:"typing_stop", roomId}` on timeout (3s after last keypress)
- Server broadcasts to room members
- Debounce on client to avoid spamming

---

### Scaling Questions

**Q: You have 3 WebSocket servers. User A (on server 1) sends a message to user B (on server 3). How does it work?**  
Each server subscribes to a Redis pub/sub channel `server:<id>`. When server 1 needs to send to user B, it looks up which server user B is connected to (stored in Redis), then publishes to `server:3`. Server 3 receives the pub/sub message and delivers to user B's local connection.

**Q: What is a sticky session and why do WebSocket servers need it?**  
Sticky sessions (session affinity) ensure all connections from a client go to the same server node. WebSocket connections are stateful — connection state lives in a specific server's memory. Without sticky sessions, a reconnecting client might land on a different server that has no knowledge of the connection.

---

### Failure Scenarios

**Q: A WebSocket server node crashes. What happens to connected clients?**  
- Clients detect the TCP connection drop and receive an `onclose` event
- Clients with auto-reconnect logic will attempt to reconnect (with backoff)
- Clients may reconnect to a different node (if no strict sticky sessions)
- If connection state was only in memory, it is lost — clients must re-authenticate
- If state was in Redis, the new server can restore it

**Q: How do you handle a slow consumer (client that can't process messages fast enough)?**  
Monitor `ws.bufferedAmount` before sending. If it exceeds a threshold, the client is a slow consumer. Options: drop non-critical messages (e.g., game positions), apply backpressure (pause the producer), queue with limits, or disconnect after a buffer limit is hit.

---

### System Design Rounds

**Q: Design a real-time collaborative document editor.**

Key components:
1. WebSocket server for real-time sync
2. Operational Transform or CRDT for conflict resolution
3. Redis for active sessions and recent ops buffer
4. PostgreSQL for document persistence
5. Operation log for replay on reconnect
6. Presence service for "who's editing" indicators

```
Client ──▶ WS Server ──▶ OT Engine ──▶ Broadcast to collaborators
                               │
                          Persist op
                          to DB
```

---

## 18. Senior-Level Deep Dive

### Kernel Networking & TCP Internals

```
WHAT HAPPENS WHEN CLIENT SENDS A WEBSOCKET FRAME:

Application layer:
  ws.send("Hello")
       │
       ▼
WebSocket library:
  Frame: [FIN=1, opcode=text, mask=1, len=5, masking_key=..., payload="Hello"]
       │
       ▼
TCP layer (kernel):
  Splits into segments, adds TCP header (src port, dst port, seq num, ack)
  Adds to send buffer
  Congestion control (CUBIC by default on Linux): controls how fast to send
       │
       ▼
IP layer:
  Adds IP header (src/dst IP), routing
       │
       ▼
NIC driver → wire
```

**TCP buffer tuning for WebSocket servers:**
```bash
# Increase TCP buffer sizes (/etc/sysctl.conf)
net.core.rmem_max     = 134217728   # 128MB max receive buffer
net.core.wmem_max     = 134217728   # 128MB max send buffer
net.ipv4.tcp_rmem     = 4096 87380 67108864
net.ipv4.tcp_wmem     = 4096 65536 67108864
net.ipv4.tcp_fin_timeout = 10       # Reduce TIME_WAIT duration
net.ipv4.tcp_tw_reuse    = 1        # Reuse TIME_WAIT sockets
```

---

### Load Balancer Behavior at Scale

```
L4 LOAD BALANCER (TCP level):
  Sees: IP:port pairs
  Routes: based on IP hash or round-robin at TCP level
  WebSocket: works transparently (just TCP bytes)
  Sticky sessions: IP-hash affinity
  Limitation: can't inspect HTTP headers

L7 LOAD BALANCER (HTTP level):
  Sees: full HTTP request including headers
  Routes: can inspect URL, cookies, JWT
  WebSocket: must explicitly support Upgrade header passthrough
  Sticky sessions: cookie-based (more reliable than IP-hash)
  Advantage: health checks on WebSocket endpoints

HAProxy for WebSocket:
  frontend ws_frontend
      bind *:443 ssl crt /etc/ssl/cert.pem
      default_backend ws_backend

  backend ws_backend
      balance leastconn        # best for long-lived connections
      cookie SERVERID insert   # sticky session via cookie
      option http-server-close
      server ws1 10.0.0.1:8080 check cookie ws1
      server ws2 10.0.0.2:8080 check cookie ws2
```

---

### Netty Architecture (JVM WebSocket)

For JVM-based high-performance WebSocket servers (like those handling 1M+ connections):

```
NETTY CHANNEL PIPELINE:

Inbound:  NioEventLoop → ByteToMessageDecoder → WebSocketFrameDecoder
                       → WebSocketServerHandshaker → YourHandler

Outbound: YourHandler → WebSocketFrameEncoder → MessageToByteEncoder
                      → NioEventLoop → Socket

EVENT LOOP GROUPS:
  BossGroup:   1–4 threads (accept new connections)
  WorkerGroup: CPU*2 threads (handle I/O on existing connections)

  BossGroup
      │── accepts connection
      │── hands off to WorkerGroup
  WorkerGroup
      │── handles all I/O (reads/writes) for assigned connections
      │── NEVER block in event loop (use separate thread pool for business logic)
```

---

### Large-Scale Infrastructure: The Numbers

```
SCALE BENCHMARKS (rough order of magnitude):

Connections per server:
  Node.js (ws):     ~100K concurrent (with tuning)
  Go (gorilla/ws):  ~500K concurrent
  Netty (Java):     ~1M concurrent (with 64GB RAM)

Message throughput:
  Simple echo:      ~1M msg/sec on modern hardware
  With processing:  ~100K–500K msg/sec

Memory per connection:
  Kernel buffers:   ~16KB (2x 8KB default)
  Application:      ~1–5KB (depending on per-conn state)
  Total estimate:   ~20–50KB per connection

For 1M connections:
  RAM needed:       20–50 GB just for connections
  File descriptors: 1M+ (requires OS tuning)
  Servers needed:   2–20 (depending on message rate)
```

---

### Cost / Performance Tradeoffs at Scale

| Decision | Cheap | Expensive |
|---|---|---|
| Protocol | Binary (Protobuf) | Text (JSON) |
| Message format | Fixed-width binary | Schema-free JSON |
| Fan-out | Pre-compute groups | Dynamic lookup |
| Presence | Approximate (Bloom filters) | Exact (Redis HSET) |
| Message history | Ring buffer (bounded) | Full log (unbounded) |
| Delivery | At-most-once (UDP-style) | Exactly-once (ACKs + dedup) |
| Compression | Per-message deflate | No compression |

---

### Compliance & Security at Scale

**PII in WebSocket messages:**
- Log message *metadata* (type, size, timestamp) but not *content*
- Encrypt message payloads at application layer if E2E required
- Implement message retention policies

**Audit logging:**
```
Every connection event:
  { time, userId, connectionId, ip, action: "connect|disconnect" }

Every significant message:
  { time, userId, type, roomId, seq } — no message content
```

**GDPR considerations:**
- Connection logs containing IP and userId = personal data
- Implement log TTL and deletion mechanisms
- Allow users to export their message history (right to access)
- Allow users to delete their message history (right to erasure)

---

### Global Architecture Decisions

```
OPTION A: CENTRALIZED
  All users connect to one region
  ├── Pros: Simple, consistent, easy debugging
  └── Cons: High latency for distant users, single region failure = global outage

OPTION B: REGIONAL CLUSTERS + GLOBAL MESH
  Users connect to nearest regional cluster
  Regions are connected by internal message bus
  ├── Pros: Low latency globally, regional isolation
  └── Cons: Complex, messages must route between regions

OPTION C: EDGE (Cloudflare Durable Objects / Fly.io)
  Compute runs at 200+ PoPs globally
  Each room/user is a Durable Object at nearest PoP
  ├── Pros: ~10ms latency globally, no regional setup
  └── Cons: Vendor lock-in, Durable Objects model constraints, cost

RECOMMENDATION:
  Small/medium (< 100K CCU):   Single region + CDN
  Large (100K–10M CCU):        2–4 regional clusters + Redis/Kafka mesh
  Massive (10M+ CCU):          Edge computing + custom global routing
```

---

## Quick Reference Cheat Sheet

```
WEBSOCKET LIFECYCLE:
  ws://  → port 80   (unencrypted — NEVER in production)
  wss:// → port 443  (TLS encrypted — always use this)

  States: CONNECTING(0) → OPEN(1) → CLOSING(2) → CLOSED(3)

HANDSHAKE HEADERS:
  Client: Upgrade: websocket | Connection: Upgrade
          Sec-WebSocket-Key: <base64 random 16 bytes>
          Sec-WebSocket-Version: 13
  Server: HTTP 101 | Sec-WebSocket-Accept: <SHA1(key + MAGIC) | base64>

FRAME OPCODES:
  0x0 Continuation | 0x1 Text | 0x2 Binary
  0x8 Close        | 0x9 Ping | 0xA Pong

CLOSE CODES:
  1000 Normal | 1001 Going Away | 1006 Abnormal (no frame)
  4000–4999  Application-defined

SCALING PATTERN:
  WS Servers ──▶ Redis Pub/Sub ──▶ Cross-server delivery
  Sticky sessions: ip_hash (Nginx) or ClientIP (K8s Service)

SECURITY CHECKLIST:
  ✓ Always use wss://
  ✓ Validate Origin header
  ✓ Authenticate before processing messages
  ✓ Rate limit messages per connection
  ✓ Validate all message schemas
  ✓ Set max message size

PERFORMANCE CHECKLIST:
  ✓ Increase file descriptor limit (ulimit -n 1000000)
  ✓ Tune TCP buffers (sysctl)
  ✓ Use binary frames for high-throughput
  ✓ Implement backpressure
  ✓ Monitor bufferedAmount
  ✓ Heartbeat every 25s (beats NAT timeout)
```

---

*Document covers WebSocket fundamentals through senior-level distributed systems. RFC 6455 is the authoritative specification.*