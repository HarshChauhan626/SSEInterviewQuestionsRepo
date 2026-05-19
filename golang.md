# Golang Fundamentals — Complete Interview Reference

---

## Part 1: Language Basics

### 1. Why was Go created?

Go was created at Google in 2007 (public release 2009) by Robert Griesemer, Rob Pike, and Ken Thompson. The motivations were:

- **Slow compilation** of C++ codebases at Google (builds taking minutes/hours)
- **Dependency management hell** in large C/C++ projects
- **Lack of concurrency primitives** suited to modern multicore hardware
- **Verbosity** of Java and complexity of C++
- **Need for a systems language** that was as productive as Python but as fast as C

Go was designed to be simple, readable, and fast to compile — a language for the scale of Google's infrastructure.

---

### 2. What are the advantages of Go?

- **Fast compilation** — entire programs compile in seconds
- **Static typing with type inference** — catches bugs at compile time, less ceremony than Java
- **Built-in concurrency** — goroutines and channels are first-class
- **Garbage collected** — no manual memory management
- **Single binary output** — no runtime dependencies, trivial deployment
- **Standard library** is rich — HTTP server, JSON, crypto, testing all built-in
- **Cross-compilation** — `GOOS=linux GOARCH=amd64 go build` from any machine
- **Low memory footprint** — goroutines start at ~2KB stack (vs ~1MB for OS threads)
- **Simplicity** — no inheritance, no generics overload, intentionally small language spec

---

### 3. Difference between Go and Java/.NET?

| Aspect | Go | Java / .NET |
|---|---|---|
| Runtime | Compiles to native binary | JVM / CLR virtual machine |
| Memory | GC, no JIT warmup | GC with JIT compilation |
| Concurrency | Goroutines (M:N scheduling) | OS threads (1:1 or thread pools) |
| OOP | Composition via embedding, interfaces | Full OOP with inheritance |
| Startup time | Milliseconds | Seconds (JVM warmup) |
| Binary | Single static binary | Requires installed runtime |
| Verbosity | Very concise | More boilerplate |
| Generics | Added in Go 1.18 (limited) | Mature generics |
| Error handling | Explicit `error` return values | Exceptions (try/catch) |

---

### 4. Why is Go fast?

- **Compiled to native machine code** — no interpreter or bytecode VM
- **Efficient goroutine scheduler** — M:N threading avoids OS thread overhead
- **Low GC pause times** — concurrent, tri-color mark-and-sweep GC
- **Cache-friendly data structures** — structs laid out contiguously in memory
- **No JIT warmup** — peak performance from the first request
- **Inlining and escape analysis** — compiler aggressively optimizes allocations
- **Minimal runtime** — small, focused runtime compared to JVM

---

### 5. What is a Goroutine?

A goroutine is a **lightweight, cooperatively-scheduled thread of execution** managed by the Go runtime, not the OS.

```go
go func() {
    fmt.Println("I run concurrently")
}()
```

Key properties:
- Initial stack of ~2KB (grows/shrinks dynamically, up to 1GB default)
- Scheduled by Go's runtime scheduler (M:N model — many goroutines on few OS threads)
- Cheap to create — you can have millions simultaneously
- Communicate via channels (CSP model) rather than shared memory

---

### 6. What is a Channel?

A channel is a **typed conduit** for sending and receiving values between goroutines. Channels provide safe communication and synchronization.

```go
ch := make(chan int)       // unbuffered
ch := make(chan int, 10)   // buffered with capacity 10

ch <- 42      // send
val := <-ch   // receive
```

Channels enforce the Go philosophy: *"Do not communicate by sharing memory; instead, share memory by communicating."*

---

### 7. Difference between buffered and unbuffered channels?

**Unbuffered channel** (`make(chan T)`):
- Sender **blocks** until a receiver is ready
- Receiver **blocks** until a sender sends
- Provides synchronization — both goroutines meet at the channel
- Use for: handoffs, synchronization points

**Buffered channel** (`make(chan T, N)`):
- Sender blocks only when the buffer is **full**
- Receiver blocks only when the buffer is **empty**
- Decouples producer and consumer timing
- Use for: rate limiting, worker pools, avoiding goroutine leaks

```go
// Unbuffered — will deadlock without a goroutine receiving
ch := make(chan int)
go func() { ch <- 1 }()
fmt.Println(<-ch)

// Buffered — send doesn't block immediately
ch := make(chan int, 3)
ch <- 1; ch <- 2; ch <- 3  // all succeed without a receiver
```

---

### 8. What is `select`?

`select` lets a goroutine **wait on multiple channel operations**, executing the first one that's ready.

```go
select {
case msg := <-ch1:
    fmt.Println("from ch1:", msg)
case msg := <-ch2:
    fmt.Println("from ch2:", msg)
case ch3 <- value:
    fmt.Println("sent to ch3")
default:
    fmt.Println("no channel ready")
}
```

- If multiple cases are ready simultaneously, Go picks one **at random** (uniform pseudo-random)
- `default` makes it non-blocking
- Common use: timeouts (`case <-time.After(1*time.Second)`), context cancellation

---

### 9. What are Go interfaces?

An interface is a **set of method signatures**. Any type that implements all the methods satisfies the interface — implicitly, without declaring it.

```go
type Animal interface {
    Sound() string
    Move()
}

type Dog struct{}
func (d Dog) Sound() string { return "Woof" }
func (d Dog) Move()         { fmt.Println("runs") }

// Dog implicitly satisfies Animal
var a Animal = Dog{}
```

This is **structural typing** (duck typing with compile-time checking). No `implements` keyword needed.

---

### 10. Difference between struct and interface?

| Aspect | Struct | Interface |
|---|---|---|
| Nature | Concrete type — holds data and methods | Abstract type — defines behavior |
| Memory | Holds actual values | Holds (type, pointer) pair |
| Instantiation | `Dog{}` | Cannot instantiate directly |
| Usage | Define data + implement methods | Define contracts / polymorphism |
| Nil | A nil pointer to struct | A nil interface vs interface holding nil pointer (subtle!) |

---

### 11. What is embedding in Go?

Embedding lets you **include one type inside another**, promoting its methods and fields to the outer type. It's Go's way of achieving code reuse without inheritance.

```go
type Base struct {
    ID int
}
func (b Base) Describe() string { return fmt.Sprintf("ID: %d", b.ID) }

type User struct {
    Base          // embedded — not named field
    Name string
}

u := User{Base: Base{ID: 1}, Name: "Alice"}
fmt.Println(u.Describe())  // promoted method
fmt.Println(u.ID)          // promoted field
```

You can also embed interfaces in structs (useful for mocking).

---

### 12. What is composition over inheritance?

Go deliberately has **no inheritance**. Instead, you build complex types by composing simpler ones via embedding and interfaces.

```go
// Instead of: class Manager extends Employee { ... }
type Employee struct { Name string }
func (e Employee) Work() { fmt.Println(e.Name, "works") }

type Manager struct {
    Employee         // compose
    Reports []Employee
}
// Manager gets Work() for free, can override it if needed
```

Benefits:
- Avoids fragile base class problems
- No diamond inheritance issues
- Easier to test (inject interfaces, not concrete types)
- Clearer dependencies

---

### 13. What is zero value?

Every Go variable is initialized to its **zero value** if not explicitly assigned. There's no "undefined" or "null" surprise.

| Type | Zero Value |
|---|---|
| `int`, `float64` | `0` |
| `bool` | `false` |
| `string` | `""` (empty string) |
| `pointer`, `slice`, `map`, `chan`, `func` | `nil` |
| `struct` | each field set to its zero value |

```go
var i int        // 0
var s string     // ""
var p *int       // nil
var sl []int     // nil (but len(sl)==0, cap(sl)==0)
```

Zero values make Go code safer — you rarely need constructors for simple initialization.

---

### 14. What are pointers in Go?

A pointer holds the **memory address** of a value. Use `&` to get an address, `*` to dereference.

```go
x := 42
p := &x      // p is *int, holds address of x
*p = 100     // modifies x through the pointer
fmt.Println(x) // 100
```

Go has pointers but **no pointer arithmetic** (unlike C). You cannot do `p++`.

When to use pointers:
- Mutate a value in a function
- Avoid copying large structs
- Share state between goroutines (with synchronization)
- Optional/nullable values (nil pointer = absent)

---

### 15. Arrays vs Slices?

**Array**: Fixed-size, value type — copying an array copies all elements.
```go
var a [5]int          // [0 0 0 0 0]
b := [3]string{"a","b","c"}
```

**Slice**: Dynamic, reference type — backed by an array, holds (pointer, length, capacity).
```go
s := []int{1, 2, 3}
s = append(s, 4)      // may allocate new backing array
```

Key differences:

| | Array | Slice |
|---|---|---|
| Size | Fixed at compile time | Dynamic |
| Type | `[5]int` and `[6]int` are different types | `[]int` for any length |
| Passing | Copied by value (full copy) | Passes header (pointer+len+cap) |
| Common use | Rarely used directly | The standard collection type |

---

### 16. How do slices work internally?

A slice is a **three-field struct** in the runtime:

```go
type slice struct {
    array unsafe.Pointer  // pointer to backing array
    len   int             // number of elements
    cap   int             // capacity of backing array from this pointer
}
```

```go
s := make([]int, 3, 5)
// backing array: [0, 0, 0, _, _]
// s.len = 3, s.cap = 5
```

When `append` exceeds capacity, Go allocates a **new, larger backing array** (typically doubles capacity up to 1024, then grows by ~1.25x) and copies data over. The original slice is unaffected.

```go
a := []int{1, 2, 3}
b := a[1:]         // shares same backing array!
b[0] = 99
fmt.Println(a)     // [1 99 3] — mutation visible through a
```

---

### 17. Difference between length and capacity?

- **`len(s)`** — number of elements currently in the slice
- **`cap(s)`** — number of elements in the backing array from the slice's start pointer

```go
s := make([]int, 3, 10)
fmt.Println(len(s)) // 3 — you can access s[0] through s[2]
fmt.Println(cap(s)) // 10 — appending up to 7 more won't reallocate
```

`cap` matters for performance: pre-allocating with `make([]T, 0, n)` avoids repeated reallocations.

---

### 18. What is a map internally?

Go maps are implemented as a **hash table with chaining buckets**. Internally:

- Array of buckets, each holding up to 8 key-value pairs
- Hash of key determines which bucket
- On collision within a bucket, overflow buckets are chained
- When load factor (~6.5 entries/bucket) is exceeded, the map **grows** (doubles bucket count) and rehashes incrementally

```go
m := make(map[string]int)
m["a"] = 1
v, ok := m["b"]  // ok is false if key absent — always use the two-value form
```

Map iteration order is **intentionally randomized** per run to prevent reliance on ordering.

---

### 19. Are maps thread-safe?

**No.** Concurrent reads are safe, but concurrent read+write or write+write causes a **runtime panic** ("concurrent map read and map write").

Solutions:
```go
// Option 1: sync.RWMutex
var mu sync.RWMutex
mu.RLock(); v := m[k]; mu.RUnlock()
mu.Lock(); m[k] = v; mu.Unlock()

// Option 2: sync.Map (optimized for high read, low write)
var sm sync.Map
sm.Store("key", "value")
v, ok := sm.Load("key")
```

Use `sync.Map` when reads heavily dominate writes. Use a mutex-protected plain map when writes are frequent — it's often faster due to less indirection.

---

### 20. What is a rune?

A `rune` is an alias for `int32` representing a **Unicode code point**.

```go
var r rune = '日'      // 0x65E5 — a single Unicode character
s := "Hello, 世界"
fmt.Println(len(s))          // 13 — bytes, not characters!
fmt.Println(len([]rune(s)))  // 9  — Unicode code points
```

Go source files are UTF-8. A `string` is a sequence of **bytes**, not characters. Iterating with `range` over a string yields runes (decoding UTF-8 automatically):

```go
for i, r := range "日本語" {
    fmt.Printf("%d: %c\n", i, r)  // byte index, rune
}
```

---

## Part 2: Concurrency (VERY IMPORTANT)

### 1. What is concurrency in Go?

Concurrency is the ability to **manage multiple tasks at the same time**, not necessarily executing them simultaneously (that's parallelism).

Go implements the **CSP (Communicating Sequential Processes)** model: independent processes communicate via message passing (channels) rather than shared memory. Goroutines are the processes; channels are the communication pipes.

```
Concurrency = structure for dealing with lots of things at once
Parallelism  = actually doing lots of things at once (needs multiple CPUs)
```

---

### 2. Goroutine vs thread?

| Aspect | Goroutine | OS Thread |
|---|---|---|
| Stack size | Starts ~2KB, grows dynamically | Fixed ~1–8MB |
| Creation cost | Microseconds | Milliseconds |
| Switching | Cooperative + preemptive (Go scheduler) | OS context switch (expensive) |
| Count | Millions feasible | Thousands max (limited by OS) |
| Managed by | Go runtime | Operating system kernel |
| Communication | Channels (preferred) | Shared memory + locks |

---

### 3. How does the Go scheduler work?

Go uses an **M:N scheduler** — M goroutines multiplexed onto N OS threads.

The **GMP model**:
- **G** — Goroutine (the unit of work)
- **M** — Machine (OS thread)
- **P** — Processor (logical CPU, holds a run queue of goroutines)

Each P has a local run queue. M picks goroutines from its P's queue. When a goroutine blocks on a syscall, M detaches from P so another M can pick up P's goroutines — no CPU waste.

The scheduler is **work-stealing**: an idle P can steal goroutines from another P's queue to balance load.

Scheduling is cooperative (goroutine yields at function calls, channel ops, syscalls) plus preemptive (since Go 1.14, goroutines can be preempted at safe points even in tight loops).

---

### 4. What is GOMAXPROCS?

`GOMAXPROCS` sets the **number of OS threads (P's) that can execute Go code simultaneously**. Defaults to the number of CPU cores.

```go
runtime.GOMAXPROCS(4)  // use 4 CPUs
fmt.Println(runtime.GOMAXPROCS(0))  // query current value
```

- Setting to 1 effectively makes goroutines run sequentially (useful for debugging races)
- Setting higher than CPU cores rarely helps — CPU-bound work is limited by hardware
- For I/O-bound workloads, GOMAXPROCS matters less since goroutines block on I/O

---

### 5. What is channel deadlock?

A **deadlock** occurs when all goroutines are blocked waiting — typically because a channel send or receive has no corresponding partner.

```go
// Deadlock: nobody to receive
ch := make(chan int)
ch <- 1  // blocks forever — fatal error: all goroutines are asleep
```

Common causes:
- Sending to an unbuffered channel with no receiver goroutine
- Receiving from an empty channel with no sender
- Two goroutines each waiting for the other to send first
- Forgetting to close a channel that a `range` loop is reading

Go's runtime detects total deadlock (all goroutines sleeping) and panics with `fatal error: all goroutines are asleep - deadlock!`

---

### 6. What is a race condition?

A race condition occurs when **two goroutines access shared data concurrently and at least one writes**, without synchronization — the result depends on scheduling order.

```go
var counter int
go func() { counter++ }()  // read-modify-write: not atomic!
go func() { counter++ }()
```

`counter++` compiles to: read, add 1, write — three operations that can interleave.

Detect races with: `go run -race main.go` or `go test -race ./...`

---

### 7. How do you prevent race conditions?

```go
// 1. Mutex
var mu sync.Mutex
mu.Lock()
counter++
mu.Unlock()

// 2. Atomic operations (for simple numeric ops)
var counter int64
atomic.AddInt64(&counter, 1)

// 3. Channels (send ownership, don't share memory)
ch := make(chan int, 1)
ch <- readAndIncrement(<-ch)

// 4. sync.Map for concurrent maps

// 5. Confine data to one goroutine (no sharing = no race)
```

Always run `go test -race` in CI.

---

### 8. What is `sync.WaitGroup`?

`WaitGroup` waits for a collection of goroutines to finish.

```go
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        fmt.Println("worker", id)
    }(i)
}

wg.Wait()  // blocks until all Done() calls balance Add() calls
fmt.Println("all done")
```

Rules:
- Call `Add` **before** starting the goroutine (not inside it)
- Always use `defer wg.Done()` to avoid forgetting it on error paths
- Don't copy a WaitGroup after first use

---

### 9. What is a Mutex?

A `Mutex` (mutual exclusion lock) ensures only **one goroutine at a time** accesses a critical section.

```go
type SafeCounter struct {
    mu sync.Mutex
    v  map[string]int
}

func (c *SafeCounter) Inc(key string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.v[key]++
}
```

Always use `defer mu.Unlock()` so the lock is released even if the function panics or returns early.

---

### 10. Difference between Mutex and RWMutex?

| | `sync.Mutex` | `sync.RWMutex` |
|---|---|---|
| Write lock | `Lock()` / `Unlock()` | `Lock()` / `Unlock()` |
| Read lock | Same exclusive lock | `RLock()` / `RUnlock()` |
| Concurrent reads | Blocked | Allowed (multiple readers) |
| Read + write | Blocked | Writer waits for all readers |
| Use case | Write-heavy or equal R/W | Read-heavy workloads |

```go
var mu sync.RWMutex

// Multiple goroutines can RLock simultaneously
mu.RLock()
val := cache[key]
mu.RUnlock()

// Only one goroutine can Lock at a time, and blocks all readers
mu.Lock()
cache[key] = newVal
mu.Unlock()
```

---

### 11. What is `sync.Once`?

`sync.Once` ensures a function is executed **exactly once**, regardless of how many goroutines call it — used for lazy initialization.

```go
var (
    instance *DB
    once     sync.Once
)

func GetDB() *DB {
    once.Do(func() {
        instance = connectToDB()  // called only once, ever
    })
    return instance
}
```

Thread-safe singleton pattern. Once `Do` completes, subsequent calls return immediately without executing the function.

---

### 12. What is the worker pool pattern?

A fixed number of goroutines (workers) process jobs from a shared channel, bounding resource usage.

```go
func workerPool(numWorkers int, jobs <-chan Job, results chan<- Result) {
    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                results <- process(job)
            }
        }()
    }
    go func() {
        wg.Wait()
        close(results)
    }()
}

jobs := make(chan Job, 100)
results := make(chan Result, 100)
workerPool(5, jobs, results)

for _, j := range allJobs { jobs <- j }
close(jobs)

for r := range results { fmt.Println(r) }
```

---

### 13. Fan-in and fan-out patterns?

**Fan-out**: Distribute work from one channel to multiple goroutines.
```go
func fanOut(in <-chan Work, n int) []<-chan Result {
    channels := make([]<-chan Result, n)
    for i := 0; i < n; i++ {
        channels[i] = worker(in)  // each reads from same input
    }
    return channels
}
```

**Fan-in**: Merge multiple channels into one.
```go
func fanIn(channels ...<-chan Result) <-chan Result {
    merged := make(chan Result)
    var wg sync.WaitGroup
    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan Result) {
            defer wg.Done()
            for v := range c { merged <- v }
        }(ch)
    }
    go func() { wg.Wait(); close(merged) }()
    return merged
}
```

---

### 14. How does `context.Context` work?

`context.Context` carries **deadlines, cancellation signals, and request-scoped values** across API boundaries and goroutines.

```go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()  // always cancel to release resources

resp, err := http.Get(req.WithContext(ctx), url)
```

Four constructors:
- `context.Background()` — root context, never cancelled
- `context.TODO()` — placeholder when unsure which context to use
- `context.WithCancel(parent)` — returns a cancellable context
- `context.WithTimeout(parent, d)` / `WithDeadline` — auto-cancels after duration/time

---

### 15. Context cancellation?

When a context is cancelled (by calling `cancel()` or timeout expiry), all child contexts derived from it are also cancelled. Goroutines check `ctx.Done()`:

```go
func doWork(ctx context.Context) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()  // context.Canceled or context.DeadlineExceeded
        default:
            // do a unit of work
        }
    }
}
```

Pass context as the **first parameter** of every function that does I/O or long computation. Never store contexts in structs.

---

### 16. What causes goroutine leaks?

A goroutine leak occurs when a goroutine is started but **never terminates** — it stays blocked forever, consuming memory.

Common causes:
```go
// 1. Nobody reads from a channel
ch := make(chan int)
go func() { ch <- 1 }()  // if nobody reads, goroutine stuck forever

// 2. Nobody closes a channel being ranged over
go func() {
    for v := range ch { process(v) }  // stuck if ch never closed
}()

// 3. Goroutine waiting on a mutex that's never unlocked

// 4. Context never cancelled / no timeout

// 5. HTTP server handler goroutine waiting for a slow client
```

Fix: always ensure goroutines have an exit path — pass a context, close channels when done, use select with done channel.

---

### 17. How do you debug goroutine leaks?

```go
// 1. At test time: use goleak
import "go.uber.org/goleak"
func TestFoo(t *testing.T) {
    defer goleak.VerifyNone(t)
    // ... test code
}

// 2. Print goroutine count
fmt.Println(runtime.NumGoroutine())

// 3. Expose pprof endpoint and inspect
import _ "net/http/pprof"
// then: go tool pprof http://localhost:6060/debug/pprof/goroutine

// 4. runtime/debug stack dump
buf := make([]byte, 1<<20)
n := runtime.Stack(buf, true)  // all goroutines
fmt.Printf("%s", buf[:n])
```

---

### 18. Buffered vs unbuffered channel use cases?

**Use unbuffered when:**
- You need guaranteed synchronization (sender knows receiver got the value)
- Implementing rendezvous / handoff patterns
- Signaling events (done channels: `close(done)`)

**Use buffered when:**
- Smoothing bursty producers (batch inserts, event queues)
- Worker pools (jobs channel with buffer = backpressure)
- Preventing goroutine leaks when the receiver might not read
- Rate limiting (semaphore pattern: `sem := make(chan struct{}, maxConcurrency)`)

---

### 19. What happens when a channel closes?

```go
close(ch)

// Receiving from a closed channel:
v, ok := <-ch   // ok is false when closed and empty
v := <-ch       // returns zero value immediately when closed+empty

// Ranging over a closed channel:
for v := range ch { }  // exits cleanly when channel is closed+empty

// Sending to a closed channel: PANICS
ch <- 1  // panic: send on closed channel
```

Rules:
- Only the **sender** should close a channel (never the receiver)
- Closing signals "no more values" — used to unblock `range` loops
- Multiple receivers are all unblocked when a channel closes

---

### 20. What is select starvation?

When multiple channels are ready in a `select`, Go picks **uniformly at random**. Starvation can still occur in practice if one channel is always ready, statistically getting picked more.

```go
// This can starve the 'quit' case if 'jobs' is always ready
select {
case job := <-jobs:
    process(job)
case <-quit:
    return
}
```

Fix with **priority select** pattern:
```go
// Check quit first with a non-blocking select
select {
case <-quit:
    return
default:
}
// Then the full select
select {
case job := <-jobs:
    process(job)
case <-quit:
    return
}
```

---

## Part 3: Memory & Internals

### 1. How does garbage collection work in Go?

Go uses a **concurrent, tri-color mark-and-sweep** GC with very short stop-the-world pauses (sub-millisecond in Go 1.14+).

**Three phases:**
1. **Mark setup** (STW, very brief) — enable write barriers
2. **Concurrent marking** — GC goroutines trace the object graph concurrently with application code. Objects are colored white (unreachable), gray (reachable, children unscanned), black (reachable, children scanned)
3. **Mark termination** (STW, brief) — finalize mark
4. **Concurrent sweep** — reclaim white (unreachable) objects concurrently

**Write barrier** ensures correctness: if a black object's pointer is changed during concurrent marking, the barrier re-grays it.

GC is triggered by heap doubling (GOGC=100 means trigger when heap doubles).

---

### 2. Stack vs heap in Go?

**Stack:**
- Per-goroutine, starts at 2KB, grows/shrinks dynamically (up to 1GB)
- Allocation/deallocation is O(1) — just move stack pointer
- Automatically reclaimed when function returns
- No GC involvement

**Heap:**
- Shared across all goroutines
- GC manages it
- Slower allocation (needs to find free memory, update GC metadata)

Go tries to put variables on the stack for performance. Variables **escape to the heap** when:
- A pointer to a local variable is returned
- A variable is too large for the stack
- Size is unknown at compile time (e.g., interface boxing)

---

### 3. Escape analysis?

The compiler's **escape analysis** determines whether a variable can live on the stack or must escape to the heap.

```go
func newFoo() *Foo {
    f := Foo{}   // f escapes to heap — pointer returned
    return &f
}

func noEscape() {
    f := Foo{}   // f stays on stack — doesn't outlive function
    use(f)
}
```

Inspect with: `go build -gcflags="-m" ./...`

```
./main.go:5:2: &f escapes to heap
./main.go:10:2: f does not escape
```

Reducing heap allocations (keeping things on stack) reduces GC pressure and improves performance.

---

### 4. How are interfaces implemented internally?

An interface value is a **two-word pair**:
- `(type, pointer)` — also called `(itab, data)`

```
interface{} or any:
  word 1: *_type (pointer to type descriptor)
  word 2: unsafe.Pointer (pointer to data, or data itself if it fits)

Non-empty interface (with methods):
  word 1: *itab (type descriptor + method table)
  word 2: unsafe.Pointer (data)
```

An `itab` contains:
- Pointer to the concrete type info
- Pointer to the interface type
- Method function pointers for dispatch

This is why interface method calls have a small overhead (pointer indirection to method table), and why a nil interface ≠ an interface holding a nil pointer.

---

### 5. Slice internals?

*(Covered in Language Basics Q16 — see "How do slices work internally")*

Briefly: `struct { ptr *T; len, cap int }`. Append may reallocate backing array. Slicing shares the backing array. Use `copy()` for an independent slice.

---

### 6. String immutability?

Go strings are **immutable byte sequences**. You cannot change a byte in a string:

```go
s := "hello"
// s[0] = 'H'  // compile error: cannot assign to s[0]
s = "Hello"    // OK — creates a new string header
```

Benefits:
- Strings can be safely shared between goroutines with no copying
- String constants are deduplicated in the binary
- Slicing a string (`s[1:3]`) shares the underlying bytes — O(1)

Convert to `[]byte` to mutate, then back to string (makes a copy):
```go
b := []byte(s)
b[0] = 'H'
s = string(b)
```

---

### 7. Why are strings UTF-8?

Go source code and `string` type are **UTF-8 encoded** because:
- UTF-8 is ASCII-compatible (ASCII strings require no change)
- Memory-efficient (common ASCII chars are 1 byte)
- No endianness issues
- Ken Thompson and Rob Pike co-invented UTF-8

`len(s)` returns byte count. Use `utf8.RuneCountInString(s)` or `len([]rune(s))` for character count.

---

### 8. What is memory alignment?

Processors read memory most efficiently when data is at addresses that are multiples of its size. Go's compiler automatically **pads structs** to satisfy alignment.

```go
type Bad struct {
    A bool    // 1 byte
    // 7 bytes padding
    B int64   // 8 bytes
    C bool    // 1 byte
    // 7 bytes padding
}  // 24 bytes total

type Good struct {
    B int64   // 8 bytes
    A bool    // 1 byte
    C bool    // 1 byte
    // 6 bytes padding
}  // 16 bytes total
```

Order struct fields from largest to smallest alignment to minimize padding. Use `unsafe.Sizeof` and `unsafe.Alignof` to inspect.

---

### 9. What causes memory leaks in Go?

Even with GC, Go programs can leak memory:

1. **Goroutine leaks** — goroutine holds references, keeping objects alive
2. **Global variables / caches** accumulating unboundedly
3. **Slice sub-slicing** — `s = s[1:]` retains backing array; `s = append([]T{}, s[1:]...)` to release
4. **Strings sliced from large strings** share backing bytes
5. **Timers not stopped** — `time.After` in a loop creates a new timer each iteration
6. **Finalizers** — objects with finalizers are not collected in the same GC cycle
7. **CGo** memory not freed (Go GC doesn't manage C heap)

---

### 10. How do you profile Go applications?

```go
// 1. pprof HTTP endpoint
import _ "net/http/pprof"
go http.ListenAndServe(":6060", nil)

// Endpoints:
// /debug/pprof/heap     — heap allocations
// /debug/pprof/goroutine — goroutine stacks
// /debug/pprof/cpu      — CPU profile (add ?seconds=30)
// /debug/pprof/mutex    — mutex contention

// 2. CPU profile in code
f, _ := os.Create("cpu.prof")
pprof.StartCPUProfile(f)
defer pprof.StopCPUProfile()

// 3. Analyze
go tool pprof cpu.prof
go tool pprof -http=:8080 http://localhost:6060/debug/pprof/heap

// 4. Benchmarks
go test -bench=. -benchmem -cpuprofile=cpu.out ./...
go tool pprof cpu.out

// 5. Trace
import "runtime/trace"
f, _ := os.Create("trace.out")
trace.Start(f); defer trace.Stop()
go tool trace trace.out
```

---

## Part 4: Backend Development in Go

### 1. How do you build REST APIs in Go?

Using the standard library:
```go
mux := http.NewServeMux()
mux.HandleFunc("GET /users/{id}", getUserHandler)
mux.HandleFunc("POST /users", createUserHandler)

srv := &http.Server{
    Addr:         ":8080",
    Handler:      mux,
    ReadTimeout:  5 * time.Second,
    WriteTimeout: 10 * time.Second,
    IdleTimeout:  120 * time.Second,
}
log.Fatal(srv.ListenAndServe())
```

Go 1.22+ added method+path routing to `net/http`. For complex needs, use Gin, Chi, or Echo.

---

### 2. Which router/framework have you used?

**Gin** — most popular, fast, minimal overhead, good middleware ecosystem
```go
r := gin.Default()
r.GET("/users/:id", func(c *gin.Context) {
    c.JSON(200, gin.H{"id": c.Param("id")})
})
r.Run(":8080")
```

**Fiber** — Express.js-inspired, built on fasthttp, very fast, familiar for Node devs
```go
app := fiber.New()
app.Get("/users/:id", func(c *fiber.Ctx) error {
    return c.JSON(fiber.Map{"id": c.Params("id")})
})
app.Listen(":8080")
```

**Echo** — clean API, built-in data binding and validation, good for REST APIs
```go
e := echo.New()
e.GET("/users/:id", getUser)
e.Logger.Fatal(e.Start(":8080"))
```

For most new projects, **Gin** or the standard library (Go 1.22+) are solid choices.

---

### 3. Middleware implementation?

```go
// Standard library
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}
mux.Handle("/", loggingMiddleware(myHandler))

// Gin
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if !isValid(token) {
            c.AbortWithStatus(401)
            return
        }
        c.Next()
    }
}
r.Use(AuthMiddleware())
```

Common middleware: logging, auth/JWT validation, rate limiting, CORS, recovery (panic → 500), request ID injection.

---

### 4. How do you structure large Go projects?

A common structure following the **Standard Go Project Layout**:

```
myservice/
├── cmd/
│   └── server/main.go       # entrypoint
├── internal/
│   ├── handler/             # HTTP handlers
│   ├── service/             # business logic
│   ├── repository/          # DB access
│   └── domain/              # domain types/interfaces
├── pkg/                     # reusable public packages
├── configs/                 # config files
├── migrations/              # SQL migrations
├── docker/
└── Makefile
```

Key principles:
- `internal/` is enforced by Go — cannot be imported by external packages
- Depend on interfaces, not concrete types (enables testing)
- Separate layers: handler → service → repository
- Avoid circular imports (Go enforces this)

---

### 5. Dependency injection in Go?

Go favors **manual constructor injection** — no magic frameworks needed for most services.

```go
// Define interfaces
type UserRepo interface {
    GetUser(ctx context.Context, id int) (*User, error)
}

// Service depends on interface
type UserService struct {
    repo UserRepo
    log  *slog.Logger
}
func NewUserService(repo UserRepo, log *slog.Logger) *UserService {
    return &UserService{repo: repo, log: log}
}

// Wire in main.go
db := connectDB()
repo := repository.NewUserRepo(db)
svc := service.NewUserService(repo, logger)
handler := handler.NewUserHandler(svc)
```

For large projects, **Wire** (Google) generates the wiring code at compile time. **Uber Fx** provides a runtime DI container.

---

### 6. How do you validate requests?

```go
// Using validator package (github.com/go-playground/validator/v10)
type CreateUserRequest struct {
    Name  string `json:"name"  validate:"required,min=2,max=100"`
    Email string `json:"email" validate:"required,email"`
    Age   int    `json:"age"   validate:"gte=0,lte=130"`
}

var validate = validator.New()

func createUser(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()}); return
    }
    if err := validate.Struct(req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()}); return
    }
    // proceed
}
```

---

### 7. How do you handle configuration?

```go
// Using viper (github.com/spf13/viper)
viper.SetDefault("server.port", 8080)
viper.SetConfigName("config")
viper.SetConfigType("yaml")
viper.AddConfigPath(".")
viper.AutomaticEnv()  // override with env vars

if err := viper.ReadInConfig(); err != nil { ... }

port := viper.GetInt("server.port")

// Or simple env-based config with envconfig
type Config struct {
    DBHost string `envconfig:"DB_HOST" required:"true"`
    Port   int    `envconfig:"PORT"    default:"8080"`
}
var cfg Config
envconfig.MustProcess("", &cfg)
```

12-factor app: prefer **environment variables** for production secrets, config files for defaults.

---

### 8. Logging best practices?

```go
// Use structured logging (slog — stdlib since Go 1.21)
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,
}))

logger.Info("request processed",
    slog.String("method", r.Method),
    slog.String("path", r.URL.Path),
    slog.Int("status", 200),
    slog.Duration("latency", time.Since(start)),
)
```

Best practices:
- Use structured/JSON logging (not `fmt.Println`) for machine parseability
- Include request ID / trace ID in every log line
- Never log secrets, PII, or passwords
- Use log levels (DEBUG, INFO, WARN, ERROR) appropriately
- Zap (Uber) or zerolog for high-performance logging when slog isn't enough

---

### 9. Graceful shutdown implementation?

```go
srv := &http.Server{Addr: ":8080", Handler: mux}

// Start server
go func() {
    if err := srv.ListenAndServe(); err != http.ErrServerClosed {
        log.Fatalf("server error: %v", err)
    }
}()

// Wait for interrupt signal
quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit
log.Println("shutting down...")

ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

if err := srv.Shutdown(ctx); err != nil {
    log.Fatalf("forced shutdown: %v", err)
}
log.Println("server stopped")
```

`Shutdown` stops accepting new connections and waits for in-flight requests to complete.

---

### 10. How do you implement health checks?

```go
// Liveness: is the process alive?
mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("ok"))
})

// Readiness: is the service ready to serve traffic?
mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
    if err := db.PingContext(r.Context()); err != nil {
        http.Error(w, "db unhealthy", http.StatusServiceUnavailable)
        return
    }
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
})
```

Kubernetes uses liveness (restart if failing) and readiness (remove from service endpoints if failing) probes separately.

---

### 11. API versioning?

Common strategies:

```go
// 1. URL path versioning (most common)
mux.Handle("/v1/users", v1.UsersHandler)
mux.Handle("/v2/users", v2.UsersHandler)

// 2. Header versioning
func versionMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        version := r.Header.Get("API-Version")
        // route based on version
    })
}

// 3. Content-type versioning
// Accept: application/vnd.myapi.v2+json
```

URL path versioning is most explicit and visible in logs. Use it for major breaking changes; for minor additions, make APIs backward compatible.

---

### 12. JWT authentication in Go?

```go
import "github.com/golang-jwt/jwt/v5"

// Generate
token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
    "sub": userID,
    "exp": time.Now().Add(24 * time.Hour).Unix(),
})
signed, err := token.SignedString([]byte(secret))

// Validate in middleware
func jwtMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        tokenStr := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
        token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method")
            }
            return []byte(secret), nil
        })
        if err != nil || !token.Valid {
            http.Error(w, "unauthorized", 401); return
        }
        // inject claims into context
        next.ServeHTTP(w, r)
    })
}
```

---

### 13. Rate limiting?

```go
// Token bucket using golang.org/x/time/rate
limiter := rate.NewLimiter(rate.Every(time.Second), 10)  // 10 req/sec

func rateLimitMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if !limiter.Allow() {
            http.Error(w, "too many requests", http.StatusTooManyRequests)
            return
        }
        next.ServeHTTP(w, r)
    })
}

// Per-IP rate limiting with sync.Map
var limiters sync.Map
func getLimiter(ip string) *rate.Limiter {
    v, _ := limiters.LoadOrStore(ip, rate.NewLimiter(rate.Every(time.Second), 5))
    return v.(*rate.Limiter)
}
```

For distributed rate limiting, use Redis with a sliding window or token bucket algorithm.

---

### 14. WebSocket implementation?

```go
import "github.com/gorilla/websocket"

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool { return true },
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil { return }
    defer conn.Close()

    for {
        messageType, p, err := conn.ReadMessage()
        if err != nil { break }
        // echo back
        conn.WriteMessage(messageType, p)
    }
}
```

For a production chat system: use a hub pattern where a central goroutine manages connections and broadcasts, with channels for message passing between connections and the hub.

---

### 15. gRPC vs REST?

| | REST | gRPC |
|---|---|---|
| Protocol | HTTP/1.1, JSON | HTTP/2, Protocol Buffers |
| Performance | Slower (text, HTTP/1) | Faster (binary, multiplexing) |
| Contract | OpenAPI (optional) | `.proto` file (required) |
| Streaming | Limited (SSE/WebSocket) | Native bidirectional streaming |
| Browser support | Universal | Requires grpc-web proxy |
| Code generation | Optional | Built-in (`protoc`) |
| Human readable | Yes | No (binary) |
| Use case | Public APIs, browser | Internal microservices |

```go
// gRPC server
s := grpc.NewServer(grpc.UnaryInterceptor(loggingInterceptor))
pb.RegisterUserServiceServer(s, &UserServer{})
s.Serve(lis)
```

---

## Part 5: Database Questions

### 1. How do you connect to databases in Go?

```go
import (
    "database/sql"
    _ "github.com/lib/pq"         // PostgreSQL driver
    _ "github.com/go-sql-driver/mysql"  // MySQL driver
)

db, err := sql.Open("postgres",
    "host=localhost user=app password=secret dbname=mydb sslmode=disable")
if err != nil { log.Fatal(err) }
defer db.Close()

db.SetMaxOpenConns(25)
db.SetMaxIdleConns(25)
db.SetConnMaxLifetime(5 * time.Minute)

if err := db.Ping(); err != nil { log.Fatal(err) }
```

---

### 2. ORM vs raw SQL?

**ORM (GORM)**:
- Pros: rapid development, auto migrations, associations
- Cons: N+1 queries easy to introduce, harder to optimize, abstraction leaks

**Raw SQL (database/sql or sqlx)**:
- Pros: full control, predictable performance, learn actual SQL
- Cons: more boilerplate, manual mapping

**Recommendation**: Use raw SQL with `sqlx` or `pgx` for performance-critical services. Use GORM for CRUD-heavy apps where dev speed matters more.

---

### 3. GORM vs sqlx?

| | GORM | sqlx |
|---|---|---|
| Type | Full ORM | SQL extension library |
| Queries | Generated from structs | You write SQL |
| Learning curve | Medium | Low (just adds `StructScan`, named queries) |
| Performance | More overhead | Near-native |
| Migrations | Built-in auto-migrate | External tool (goose, migrate) |
| Control | Less | Full |

```go
// sqlx
var user User
err := db.GetContext(ctx, &user, "SELECT * FROM users WHERE id=$1", id)

// GORM
db.First(&user, id)
```

---

### 4. Connection pooling?

`database/sql` provides built-in connection pooling:

```go
db.SetMaxOpenConns(25)       // max open connections to DB
db.SetMaxIdleConns(10)       // max idle connections in pool
db.SetConnMaxLifetime(5 * time.Minute)  // max connection age
db.SetConnMaxIdleTime(1 * time.Minute)  // max idle connection age
```

Pool sizing rule of thumb: `MaxOpenConns ≈ (num_cpu_cores * 2) + effective_spindle_count`. For PostgreSQL, stay well under `max_connections` (default 100); use PgBouncer for hundreds of application instances.

---

### 5. Transactions handling?

```go
tx, err := db.BeginTx(ctx, nil)
if err != nil { return err }
defer tx.Rollback()  // no-op after Commit

_, err = tx.ExecContext(ctx, "INSERT INTO orders ...")
if err != nil { return err }

_, err = tx.ExecContext(ctx, "UPDATE inventory ...")
if err != nil { return err }

return tx.Commit()
```

Always `defer tx.Rollback()` — it's a no-op after `Commit()` succeeds, but ensures rollback on any error path.

---

### 6. How do you prevent SQL injection?

**Always use parameterized queries / prepared statements:**

```go
// WRONG — SQL injection vulnerable
query := fmt.Sprintf("SELECT * FROM users WHERE name='%s'", userInput)

// CORRECT — parameterized
row := db.QueryRowContext(ctx, "SELECT * FROM users WHERE name=$1", userInput)

// Named parameters with sqlx
db.NamedExecContext(ctx, "INSERT INTO users (name) VALUES (:name)", user)
```

Go's `database/sql` enforces separation of query structure and data. Never concatenate user input into SQL strings.

---

### 7. How do you optimize DB-heavy APIs?

1. **Use indexes** on WHERE, JOIN, ORDER BY columns
2. **Connection pooling** tuned appropriately
3. **Avoid N+1** — use JOIN or batch queries instead of per-row queries
4. **Use EXPLAIN ANALYZE** to inspect query plans
5. **Pagination** — keyset pagination over OFFSET for large datasets
6. **Caching** — Redis for read-heavy, slowly-changing data
7. **Read replicas** — route read queries to replicas
8. **Query timeout** — always use `context.WithTimeout` for DB calls
9. **Batch inserts** — `INSERT INTO t VALUES ($1,$2), ($3,$4), ...`
10. **Select only needed columns** — avoid `SELECT *`

---

### 8. How do you implement the repository pattern?

```go
// Interface definition
type UserRepository interface {
    GetByID(ctx context.Context, id int64) (*User, error)
    Create(ctx context.Context, user *User) error
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id int64) error
}

// Implementation
type postgresUserRepo struct {
    db *sqlx.DB
}

func (r *postgresUserRepo) GetByID(ctx context.Context, id int64) (*User, error) {
    var u User
    err := r.db.GetContext(ctx, &u, "SELECT * FROM users WHERE id=$1", id)
    return &u, err
}

// Service uses the interface (testable with mock repo)
type UserService struct {
    repo UserRepository
}
```

---

### 9. What is the N+1 query problem?

You fetch N parent records, then issue a separate query for each one's children — totaling N+1 queries.

```go
// N+1 problem
users, _ := db.QueryContext(ctx, "SELECT * FROM users")  // 1 query
for _, u := range users {
    orders, _ := db.QueryContext(ctx,  // N queries!
        "SELECT * FROM orders WHERE user_id=$1", u.ID)
}

// Fix: JOIN in one query
db.QueryContext(ctx, `
    SELECT u.*, o.*
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
`)

// Or: batch query with IN
db.QueryContext(ctx,
    "SELECT * FROM orders WHERE user_id = ANY($1)", pq.Array(userIDs))
```

---

### 10. Database migrations in Go?

```go
// Using golang-migrate
import "github.com/golang-migrate/migrate/v4"
import _ "github.com/golang-migrate/migrate/v4/database/postgres"
import _ "github.com/golang-migrate/migrate/v4/source/file"

m, err := migrate.New("file://migrations", dbURL)
m.Up()    // apply all pending migrations
m.Down()  // rollback one migration
m.Steps(2) // apply 2 migrations
```

Migration files:
```
migrations/
  000001_create_users.up.sql
  000001_create_users.down.sql
  000002_add_email_index.up.sql
  000002_add_email_index.down.sql
```

Other tools: **goose** (supports Go migrations alongside SQL), **Atlas** (schema-as-code with drift detection).

---

## Part 6: System Design / Distributed Systems

### 1. Design scalable microservices in Go

Core principles:
- **Single responsibility** — each service owns one domain
- **API contracts** — gRPC (internal) or REST (external) with clear versioning
- **Independent deployability** — separate CI/CD pipelines per service
- **Stateless services** — session state in Redis, not in-process
- **Health checks** — liveness and readiness endpoints
- **Observability** — structured logs, metrics (Prometheus), traces (OpenTelemetry)
- **Circuit breakers** — prevent cascading failures
- **Async communication** — Kafka/NATS for eventual consistency, not synchronous chains

Go-specific advantages: tiny Docker images (~10MB), fast startup, low memory footprint per pod.

---

### 2. Why is Go popular for distributed systems?

- **Concurrency model** maps naturally to network servers (one goroutine per connection)
- **Low overhead** — can handle 100K+ concurrent connections with modest RAM
- **Fast startup** — critical for horizontal scaling and rolling deploys
- **Static binaries** — simple deployment, small Docker images
- **Strong standard library** — HTTP, TLS, JSON, gRPC out of the box
- **Battle-tested at scale** — Docker, Kubernetes, Prometheus, etcd, Consul all written in Go

---

### 3. How would you design a chat system?

```
Client ──WebSocket──► Gateway Service (Go)
                          │
                     Message Bus (Kafka/Redis Pub-Sub)
                          │
              ┌───────────┼───────────┐
           Room Svc    User Svc    Presence Svc
              │
         Message DB (Cassandra/PostgreSQL)
```

- **WebSocket gateway** — maintains connections, routes messages
- **Hub pattern** per room — goroutine managing subscribers via channels
- **Pub/Sub** (Redis or Kafka) — fan-out to gateways serving recipients on other nodes
- **Message persistence** — append-only store (Cassandra for high write throughput)
- **Presence** — Redis with TTL for online/offline status

---

### 4. How do you scale WebSockets?

Single node: hub pattern (central goroutine with a map of `connID → chan Message`).

Multi-node: each node publishes to Redis Pub/Sub, all nodes subscribe to channels for their rooms. When a message arrives on a subscription, the node broadcasts to its local connections.

```go
// Simplified multi-node fan-out
func (h *Hub) publishMessage(roomID string, msg Message) {
    // persist to DB
    // publish to Redis channel "room:{roomID}"
    rdb.Publish(ctx, "room:"+roomID, msg.JSON())
}

// Each node subscribes and forwards locally
sub := rdb.Subscribe(ctx, "room:"+roomID)
go func() {
    for msg := range sub.Channel() {
        h.broadcastToLocalConns(roomID, msg.Payload)
    }
}()
```

---

### 5. Kafka integration in Go?

```go
import "github.com/segmentio/kafka-go"

// Producer
writer := &kafka.Writer{
    Addr:  kafka.TCP("localhost:9092"),
    Topic: "orders",
}
writer.WriteMessages(ctx, kafka.Message{
    Key:   []byte(orderID),
    Value: orderJSON,
})

// Consumer
reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers: []string{"localhost:9092"},
    Topic:   "orders",
    GroupID: "order-processor",
})
for {
    msg, err := reader.ReadMessage(ctx)
    process(msg.Value)
}
```

Libraries: `segmentio/kafka-go` (pure Go), `confluent-kafka-go` (wraps librdkafka, higher throughput).

---

### 6. Redis caching strategies?

```go
// Cache-aside (lazy loading)
func GetUser(ctx context.Context, id string) (*User, error) {
    val, err := rdb.Get(ctx, "user:"+id).Result()
    if err == nil {
        var u User; json.Unmarshal([]byte(val), &u); return &u, nil
    }
    u, err := repo.GetUser(ctx, id)
    if err != nil { return nil, err }
    data, _ := json.Marshal(u)
    rdb.Set(ctx, "user:"+id, data, 5*time.Minute)
    return u, nil
}
```

Strategies:
- **Cache-aside** — app manages cache; cache miss hits DB
- **Write-through** — write to cache and DB on every write
- **Write-behind** — write to cache, async flush to DB
- **TTL-based** — always expire; staleness bounded by TTL
- **Cache invalidation** — delete on update (hard: "two hard things in CS")

---

### 7. Event-driven architecture?

Services communicate via **events** (Kafka, NATS, RabbitMQ) rather than synchronous RPC.

```
Order Service → publishes "OrderPlaced" event
                ↓ Kafka
Inventory Svc ← subscribes, reserves stock → publishes "StockReserved"
Payment Svc   ← subscribes to "StockReserved" → charges card
Email Svc     ← subscribes to "OrderPlaced" → sends confirmation
```

Benefits: loose coupling, independent scaling, resilience (consumer can retry). Challenges: eventual consistency, debugging event chains, duplicate event handling (must be idempotent).

---

### 8. CQRS in Go?

Command Query Responsibility Segregation separates read (query) and write (command) models.

```go
// Command side — optimized for writes
type CreateOrderCommand struct {
    UserID    string
    ProductID string
    Quantity  int
}
func (h *OrderCommandHandler) Handle(ctx context.Context, cmd CreateOrderCommand) error {
    // validate, apply business rules, persist to write DB
    // publish OrderCreated event
}

// Query side — optimized for reads (denormalized projections)
type OrderQuery struct {
    UserID string
}
func (h *OrderQueryHandler) GetOrdersByUser(ctx context.Context, q OrderQuery) ([]OrderView, error) {
    // read from read-optimized DB/cache (Redis, Elasticsearch)
}
```

Often combined with Event Sourcing. Useful when read and write throughput or models diverge significantly.

---

### 9. Circuit breaker implementation?

```go
import "github.com/sony/gobreaker"

cb := gobreaker.NewCircuitBreaker(gobreaker.Settings{
    Name:        "payment-service",
    MaxRequests: 3,                   // allowed requests in half-open
    Interval:    10 * time.Second,    // reset counts after
    Timeout:     30 * time.Second,    // time in open state before half-open
    ReadyToTrip: func(counts gobreaker.Counts) bool {
        return counts.ConsecutiveFailures > 5
    },
})

result, err := cb.Execute(func() (interface{}, error) {
    return paymentSvc.Charge(ctx, amount)
})
// If open: returns ErrOpenState immediately without calling the function
```

States: **Closed** (normal) → **Open** (failing, reject all) → **Half-Open** (test a few requests) → Closed or Open.

---

### 10. Retry mechanism?

```go
func withRetry(ctx context.Context, maxAttempts int, fn func() error) error {
    var err error
    for attempt := 0; attempt < maxAttempts; attempt++ {
        err = fn()
        if err == nil { return nil }

        // Exponential backoff with jitter
        wait := time.Duration(math.Pow(2, float64(attempt))) * 100 * time.Millisecond
        wait += time.Duration(rand.Intn(100)) * time.Millisecond

        select {
        case <-ctx.Done():
            return ctx.Err()
        case <-time.After(wait):
        }
    }
    return fmt.Errorf("after %d attempts: %w", maxAttempts, err)
}
```

Always retry only **idempotent operations**. Don't retry on `400 Bad Request` — only on transient errors (network errors, `503`, `429`).

---

### 11. Idempotency?

An operation is idempotent if calling it multiple times has the same effect as calling it once. Critical for safe retries.

```go
// Client sends Idempotency-Key header
// Server stores result keyed by idempotency key

func createOrder(ctx context.Context, req CreateOrderReq) (*Order, error) {
    existing, err := idempotencyStore.Get(ctx, req.IdempotencyKey)
    if err == nil { return existing, nil }  // return cached result

    order, err := createOrderInternal(ctx, req)
    if err != nil { return nil, err }

    idempotencyStore.Set(ctx, req.IdempotencyKey, order, 24*time.Hour)
    return order, nil
}
```

---

### 12. Distributed locking?

```go
import "github.com/go-redsync/redsync/v4"

rs := redsync.New(pool)
mutex := rs.NewMutex("order-lock:"+orderID,
    redsync.WithExpiry(10*time.Second),
    redsync.WithTries(3),
)

if err := mutex.LockContext(ctx); err != nil {
    return ErrLockNotAcquired
}
defer mutex.UnlockContext(ctx)

// critical section
```

Redsync implements Redlock algorithm across multiple Redis nodes. For stronger guarantees, use etcd or ZooKeeper (Raft consensus).

---

### 13. How do you implement observability?

The three pillars:

```go
// Logs — structured with slog/zap
logger.Info("order created", slog.String("order_id", id), slog.Int("amount", amt))

// Metrics — Prometheus
var requestDuration = prometheus.NewHistogramVec(
    prometheus.HistogramOpts{Name: "http_request_duration_seconds"},
    []string{"method", "path", "status"},
)
requestDuration.WithLabelValues("POST", "/orders", "200").Observe(dur.Seconds())

// Traces — OpenTelemetry
ctx, span := tracer.Start(ctx, "createOrder")
defer span.End()
span.SetAttributes(attribute.String("order.id", orderID))
```

Connect to: Grafana + Loki (logs), Prometheus + Grafana (metrics), Jaeger or Tempo (traces).

---

### 14. Tracing with OpenTelemetry?

```go
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
)

// Setup exporter
exporter, _ := otlptracegrpc.New(ctx,
    otlptracegrpc.WithEndpoint("otel-collector:4317"))
tp := trace.NewTracerProvider(
    trace.WithBatcher(exporter),
    trace.WithResource(resource.NewWithAttributes(
        semconv.ServiceNameKey.String("order-service"),
    )),
)
otel.SetTracerProvider(tp)

// Instrument
tracer := otel.Tracer("order-service")
ctx, span := tracer.Start(ctx, "processOrder")
defer span.End()

// Auto-instrument HTTP, gRPC, DB with contrib packages
import "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
mux.Handle("/orders", otelhttp.NewHandler(handler, "orders"))
```

---

### 15. How do you deploy Go apps on Kubernetes?

```dockerfile
# Multi-stage Dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

FROM gcr.io/distroless/static-debian11
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
```

```yaml
# Kubernetes deployment
resources:
  requests: { cpu: "100m", memory: "64Mi" }
  limits: { cpu: "500m", memory: "128Mi" }
livenessProbe:
  httpGet: { path: /healthz, port: 8080 }
readinessProbe:
  httpGet: { path: /readyz, port: 8080 }
```

---

## Part 7: Production & DevOps

### 1. How do you dockerize Go apps?

See the multi-stage Dockerfile in the section above. Key points:
- Use `CGO_ENABLED=0` for a fully static binary
- Use `distroless` or `scratch` as final image (no shell, minimal attack surface)
- Copy only the binary — final image is typically 5–15MB

---

### 2. Why are Go Docker images small?

- Go compiles to a **single static binary** with no external dependencies
- No runtime (JVM, interpreter) to bundle
- No shared libraries needed (with `CGO_ENABLED=0`)
- `scratch` base image is literally 0 bytes; `distroless/static` is ~2MB
- Comparison: Go ~10MB vs Java Spring Boot ~200–500MB

---

### 3. Multi-stage Docker builds?

Multi-stage builds separate the build environment from the runtime environment:

```dockerfile
# Stage 1: Build (large image with compiler)
FROM golang:1.22-alpine AS builder
# ... compile ...

# Stage 2: Runtime (tiny image, just the binary)
FROM scratch
COPY --from=builder /app/server /server
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
ENTRYPOINT ["/server"]
```

The final image contains only what the binary needs at runtime. SSL certs are needed for HTTPS calls.

---

### 4. CI/CD for Go services?

```yaml
# GitHub Actions example
- name: Test
  run: go test -race -coverprofile=coverage.out ./...

- name: Lint
  uses: golangci/golangci-lint-action@v4

- name: Build
  run: |
    CGO_ENABLED=0 go build -ldflags="-s -w" -o server ./cmd/server

- name: Docker build & push
  run: |
    docker build -t myrepo/service:${{ github.sha }} .
    docker push myrepo/service:${{ github.sha }}

- name: Deploy to Kubernetes
  run: kubectl set image deployment/service server=myrepo/service:${{ github.sha }}
```

Use `-ldflags="-s -w"` to strip debug info (reduces binary size ~30%).

---

### 5. Kubernetes probes?

```yaml
livenessProbe:   # If this fails: restart the pod
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:  # If this fails: remove from load balancer
  httpGet:
    path: /readyz
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5

startupProbe:    # Gives slow-starting apps time before liveness kicks in
  httpGet:
    path: /healthz
    port: 8080
  failureThreshold: 30
  periodSeconds: 10
```

---

### 6. How do you monitor Go services?

```go
// Expose Prometheus metrics
import "github.com/prometheus/client_golang/prometheus/promhttp"
http.Handle("/metrics", promhttp.Handler())

// Custom metrics
var (
    httpReqs = prometheus.NewCounterVec(
        prometheus.CounterOpts{Name: "http_requests_total"},
        []string{"method", "status"},
    )
    httpDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "path"},
    )
)
```

Dashboards: Grafana with prebuilt Go dashboards (dashboard ID 6671 on Grafana.com). Alert on: p99 latency, error rate, goroutine count, heap usage, GC pause time.

---

### 7. Prometheus integration?

```go
prometheus.MustRegister(httpReqs, httpDuration)

func metricsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        rec := statusRecorder{ResponseWriter: w, Status: 200}
        next.ServeHTTP(&rec, r)
        
        httpReqs.WithLabelValues(r.Method, strconv.Itoa(rec.Status)).Inc()
        httpDuration.WithLabelValues(r.Method, r.URL.Path).
            Observe(time.Since(start).Seconds())
    })
}
```

Go runtime exposes GC, goroutine, memory metrics automatically via `promhttp` when you import `prometheus/collectors`.

---

### 8. Structured logging?

```go
// slog (stdlib, Go 1.21+) — recommended default
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level:     slog.LevelInfo,
    AddSource: true,
}))
slog.SetDefault(logger)

// Output: {"time":"2024-...","level":"INFO","source":"main.go:42","msg":"request","method":"GET","path":"/users","latency_ms":12}

// Zap — when you need maximum performance
logger, _ := zap.NewProduction()
logger.Info("request processed",
    zap.String("method", "GET"),
    zap.Int("status", 200),
    zap.Duration("latency", 12*time.Millisecond),
)
```

Include `trace_id` and `request_id` in every log line for correlation.

---

### 9. How do you debug production crashes?

```go
// 1. Panic recovery in HTTP middleware
defer func() {
    if r := recover(); r != nil {
        buf := make([]byte, 64<<10)
        n := runtime.Stack(buf, false)
        logger.Error("panic recovered", "error", r, "stack", string(buf[:n]))
        http.Error(w, "internal server error", 500)
    }
}()

// 2. Core dumps (GOTRACEBACK=crash go run ...)
// 3. Delve debugger: dlv attach <pid>
// 4. pprof: continuous profiling with Pyroscope
// 5. Read structured logs + traces in Grafana
// 6. GOTRACEBACK=all prints all goroutine stacks on crash
```

---

### 10. Blue-green deployment?

Two identical production environments (Blue = current, Green = new version):

1. Deploy new version to Green environment
2. Run smoke tests against Green
3. Switch load balancer to point traffic at Green
4. Blue becomes the new standby (instant rollback: switch LB back)

In Kubernetes, implement with two Deployments and a Service selector switch, or use ArgoCD with blue-green strategy. Canary deployments (gradual traffic shift) are more common in practice — use Argo Rollouts or Flagger.

---

## Part 8: Advanced Golang Questions

### 1. How does the Go scheduler work internally?

*(Expanded from Concurrency Q3)*

The scheduler runs inside the Go runtime as part of each OS thread (M). It is a **cooperative + preemptive work-stealing scheduler**.

Key mechanisms:
- Each P has a **local run queue** (ring buffer, capacity 256)
- There is also a **global run queue** (mutex-protected)
- When local queue is full, half the goroutines go to the global queue
- On network I/O, the goroutine is parked with `netpoller` (epoll/kqueue); when the FD is ready, the goroutine is re-queued
- On blocking syscall, M releases P, another M picks up P (handoff)
- **Sysmon** goroutine runs every 10ms: retakes P's from goroutines running >10ms (sets `preempt` flag), checks for deadlocks, forces GC

---

### 2. GMP model explained

**G (Goroutine)**: The unit of concurrent execution. Contains its stack, program counter, goroutine ID, and status (running, runnable, waiting, dead).

**M (Machine)**: An OS thread. Executes Go code. Each M needs a P to run goroutines. Can exist without P (in syscall).

**P (Processor)**: A logical "CPU" for Go code. Holds a local run queue of runnable goroutines. The number of Ps = GOMAXPROCS. P is the bridge between M and runnable Gs.

```
Global Run Queue
      │
P0 ──►│◄── M0 (OS Thread)
P1 ──►│◄── M1 (OS Thread)
      │
    Goroutines (G) waiting in P's local run queues
```

Work stealing: idle M picks a P, steals half of another P's run queue.

---

### 3. What is work stealing?

When a P's local run queue is empty, it doesn't idle — it **steals** goroutines from other Ps:

1. Check own local run queue → empty
2. Check global run queue → take goroutines if any
3. Check netpoller → take network-ready goroutines
4. **Steal half** the goroutines from a random other P's local queue

This keeps all Ps busy and balances load automatically without explicit load balancing code.

---

### 4. How do channel internals work?

A channel is a `runtime.hchan` struct:

```go
type hchan struct {
    qcount   uint           // current elements in queue
    dataqsiz uint           // capacity (0 for unbuffered)
    buf      unsafe.Pointer // circular buffer
    elemsize uint16
    closed   uint32
    sendx    uint           // send index in circular buffer
    recvx    uint           // receive index
    recvq    waitq          // goroutines waiting to receive
    sendq    waitq          // goroutines waiting to send
    lock     mutex
}
```

On send to a full buffered channel (or unbuffered with no receiver):
1. Current goroutine is packaged into a `sudog` struct
2. Added to `sendq`
3. Goroutine is parked (taken off run queue)
4. When a receiver arrives, it copies the value and unparks the sender

Direct send optimization: if a receiver is already waiting, the value is copied directly from sender's stack to receiver's stack, skipping the buffer.

---

### 5. How does interface nil work?

An interface value is `nil` only when **both its type and value are nil**:

```go
var err error = nil          // type=nil, value=nil → nil interface ✓
fmt.Println(err == nil)      // true

var p *MyError = nil
var err error = p            // type=*MyError, value=nil → NOT nil interface!
fmt.Println(err == nil)      // false ← surprising!
```

This is the most common Go gotcha. When you assign a typed nil pointer to an interface, the interface is non-nil because the type field is set.

---

### 6. Nil interface vs nil pointer?

```go
// Nil interface: both type and value fields are nil
var i interface{} = nil   // i == nil: true

// Interface holding a nil pointer: type is set, value is nil
var p *int = nil
var i interface{} = p     // i == nil: FALSE!
// i.(type) == *int, i.(*int) == nil

// Real-world problem
func mayFail() error {
    var err *MyError = nil
    if condition { return err }  // returns non-nil error!
    return nil                   // this is the correct way
}
```

Fix: never return a typed nil from a function returning an interface. Return `nil` directly.

---

### 7. Why can interface comparisons panic?

Interface comparison with `==` panics at runtime if the underlying **dynamic type is not comparable** (e.g., slices, maps, functions):

```go
var a, b interface{} = []int{1, 2}, []int{1, 2}
fmt.Println(a == b)  // panic: runtime error: comparing uncomparable type []int
```

Safe comparison: use `reflect.DeepEqual` (slower) or type-assert to a concrete type before comparing. The compiler can't catch this because the type is only known at runtime.

---

### 8. What are memory barriers?

A memory barrier (memory fence) is a CPU/compiler instruction that **prevents reordering** of memory operations across it.

In Go, you rarely deal with memory barriers directly — the `sync/atomic` package and channel operations include implicit barriers. For example, `atomic.Store` has a full barrier: all prior writes are visible to any core that subsequently calls `atomic.Load` on the same variable.

Without barriers, the CPU or compiler can reorder loads/stores for performance, breaking concurrent code that relies on ordering guarantees.

Go's **memory model** guarantees: "Within a single goroutine, reads and writes must behave as if they executed in the order specified by the program." Cross-goroutine ordering is only guaranteed via synchronization primitives (channels, mutexes, atomics).

---

### 9. How does select choose cases?

When multiple cases in a `select` are ready simultaneously:

1. All ready cases are collected
2. One is chosen **uniformly at random** (using Go's internal pseudo-random generator seeded per goroutine)
3. Its channel operation is performed

This prevents starvation of any single case in a statistical sense, but doesn't guarantee fairness over short periods (see select starvation above).

Internally, `select` is compiled to a call to `runtime.selectgo`, which shuffles the cases array, locks all channel mutexes in a consistent order (to avoid deadlock), finds ready cases, picks one, then unlocks all.

---

### 10. What is `sync.Pool`?

`sync.Pool` is a **cache of temporary, reusable objects** that reduces GC pressure by recycling allocations.

```go
var bufPool = sync.Pool{
    New: func() interface{} {
        return new(bytes.Buffer)
    },
}

func handler(w http.ResponseWriter, r *http.Request) {
    buf := bufPool.Get().(*bytes.Buffer)
    buf.Reset()
    defer bufPool.Put(buf)

    // use buf for JSON encoding, formatting, etc.
    json.NewEncoder(buf).Encode(response)
    w.Write(buf.Bytes())
}
```

Important: Pool objects **may be garbage collected at any time** (cleared each GC cycle). Don't use Pool for objects that must persist. Great for: buffers, encoder/decoder instances, temporary byte slices.

---

### 11. Atomic operations?

`sync/atomic` provides low-level, lock-free operations that execute as single CPU instructions:

```go
var counter int64

// Atomic increment (no mutex needed)
atomic.AddInt64(&counter, 1)

// Atomic load/store
val := atomic.LoadInt64(&counter)
atomic.StoreInt64(&counter, 0)

// Compare-and-swap (CAS) — the building block of lock-free algorithms
old, new := int64(0), int64(1)
swapped := atomic.CompareAndSwapInt64(&counter, old, new)

// Go 1.19+: typed atomics
var v atomic.Int64
v.Add(1)
v.Load()
v.Store(42)
v.CompareAndSwap(42, 100)
```

Use atomics for simple counters and flags. For anything more complex, use a mutex — lock-free code is easy to get wrong.

---

### 12. How does the garbage collector pause work?

Go's GC has two very short **stop-the-world (STW)** pauses:

**STW 1 — Mark Setup** (~100µs):
- Enable write barriers (so mutators don't break the tri-color invariant)
- Scan goroutine stacks (very fast due to goroutine stack scanning)

**STW 2 — Mark Termination** (~100µs):
- Disable write barriers
- Flush any remaining work
- Finalize the mark phase

Everything else (scanning heap, most stack scanning) runs **concurrently** with the application on dedicated GC goroutines using 25% of GOMAXPROCS.

Since Go 1.14, even STW pauses of a handful of microseconds are common. Use `GODEBUG=gctrace=1` to log GC events.

---

### 13. How do you reduce GC pressure?

```go
// 1. Reuse allocations with sync.Pool
// 2. Pre-allocate slices/maps with known capacity
users := make([]User, 0, expectedCount)
m := make(map[string]int, expectedSize)

// 3. Use value types instead of pointers where possible
// (pointers = more GC scanning work)

// 4. Reduce interface boxing — use concrete types in hot paths

// 5. Avoid small, frequent allocations in hot loops
// ❌ for _, item := range items { go process(&item) }  // alloc per item
// ✅ worker pool + channel

// 6. Use []byte buffers instead of string concatenation
var b strings.Builder
b.WriteString("hello"); b.WriteString(" world")

// 7. Tune GOGC
// GOGC=200 means GC runs when heap doubles to 200% of live data
// (lower GC frequency, higher peak memory)

// 8. Use arena allocator (experimental in Go 1.20+) for batch allocations
```

Profile first with `go tool pprof`: fix the allocations the profiler shows, not guesses.

---

*End of Golang Fundamentals Reference*