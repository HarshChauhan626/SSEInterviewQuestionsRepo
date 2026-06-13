const TOPICS = [
    "Goroutines", "Channels", "Sync Primitives", "Context", "Error Handling",
    "Interfaces", "Generics", "Memory & GC", "Slices & Maps", "Structs & Embedding",
    "Worker Pools", "Concurrency Patterns", "Scheduler & Runtime", "Testing",
    "HTTP & net", "Reflection", "Build & Tooling", "Modules", "Panic & Recover",
    "Go Internals"
];

const ALL_QUESTIONS = [

    // ── GOROUTINES ──
    {
        cat: "Goroutines", q: "What is the initial stack size of a goroutine in modern Go (1.4+)?",
        opts: ["1 MB", "8 KB", "2 KB", "64 KB"], ans: 2,
        exp: "Since Go 1.4, goroutines start with a 2 KB stack that grows dynamically (up to 1 GB by default). Earlier versions used 8 KB. This tiny initial size allows spawning millions of goroutines cheaply."
    },

    {
        cat: "Goroutines", q: "What happens when a goroutine's stack exceeds its current allocation?",
        opts: ["A panic is triggered immediately", "The goroutine is killed by the runtime", "The stack is copied to a larger contiguous block", "The OS allocates a new thread"], ans: 2,
        exp: "Go uses a 'stack copying' (contiguous stack) strategy. When a goroutine's stack fills up, the runtime allocates a new, larger contiguous block, copies the old stack, and updates all pointers. This replaced the old 'segmented stack' approach."
    },

    {
        cat: "Goroutines", q: "Which statement correctly starts a goroutine?",
        opts: ["goroutine func() {}()", "async func() {}()", "go func() {}()", "spawn func() {}()"], ans: 2,
        exp: "The `go` keyword before a function call starts a new goroutine. The function runs concurrently with the calling goroutine. `go func() {}()` is the idiomatic way to start an anonymous goroutine."
    },

    {
        cat: "Goroutines", q: "What is a goroutine leak?",
        opts: ["A goroutine that consumes too much CPU", "A goroutine blocked forever that is never garbage collected", "A goroutine that allocates memory without freeing it", "A goroutine that panics silently"], ans: 1,
        exp: "A goroutine leak occurs when a goroutine is started but never terminates—typically blocked on a channel receive/send or waiting on a lock forever. Leaked goroutines hold their stack memory and any heap objects they reference."
    },

    {
        cat: "Goroutines", q: "Which function can a goroutine call to yield the processor voluntarily?",
        opts: ["runtime.Pause()", "runtime.Gosched()", "runtime.Yield()", "runtime.Sleep()"], ans: 1,
        exp: "`runtime.Gosched()` yields the processor, allowing other goroutines to run. It doesn't suspend the goroutine indefinitely—it just reschedules it, like a cooperative yield hint to the scheduler."
    },

    {
        cat: "Goroutines", q: "How many goroutines can a Go program run simultaneously by default?",
        opts: ["One per OS thread", "Unlimited, constrained only by memory", "Exactly GOMAXPROCS at any moment (in parallel)", "One goroutine total"], ans: 2,
        exp: "A Go program can have millions of goroutines concurrently (limited by memory). At any instant, at most GOMAXPROCS goroutines run in parallel on OS threads. Concurrency ≠ parallelism—many goroutines exist but only GOMAXPROCS run simultaneously."
    },

    {
        cat: "Goroutines", q: "What does `runtime.GOMAXPROCS(n)` control?",
        opts: ["Maximum goroutines allowed", "Maximum number of OS threads that can execute Go code simultaneously", "Goroutine stack size limit", "Number of GC threads"], ans: 1,
        exp: "`GOMAXPROCS` sets the maximum number of OS threads that can execute Go code in parallel. It defaults to the number of logical CPUs. Setting it to 1 makes goroutine scheduling cooperative (though not truly single-threaded)."
    },

    {
        cat: "Goroutines", q: "What is a 'preemption point' in Go's goroutine scheduler?",
        opts: ["A function that stops all goroutines", "A point where the scheduler can switch goroutines without waiting for cooperation", "A signal sent to terminate a goroutine", "A memory fence in the GC"], ans: 1,
        exp: "Since Go 1.14, Go uses asynchronous preemption. Preemption points are locations (function calls, safe points injected via signals) where the scheduler can pause and reschedule a goroutine, preventing goroutines from monopolizing threads."
    },

    {
        cat: "Goroutines", q: "What happens if the main goroutine returns?",
        opts: ["All other goroutines finish their work first", "The program panics", "The program exits immediately, killing all other goroutines", "The runtime waits 30 seconds then exits"], ans: 2,
        exp: "When the main goroutine (the function `main()`) returns, the Go runtime terminates the entire program immediately, regardless of any other goroutines that may be running or blocked."
    },

    {
        cat: "Goroutines", q: "Which tool detects goroutine leaks in tests?",
        opts: ["go vet", "goleak (uber-go/goleak)", "go race", "go trace"], ans: 1,
        exp: "`goleak` (github.com/uber-go/goleak) is the standard library for detecting goroutine leaks in tests. It records goroutines at test start and end, failing the test if unexpected goroutines remain."
    },

    // ── CHANNELS ──
    {
        cat: "Channels", q: "What is the zero value of a channel variable?",
        opts: ["An empty buffered channel", "nil", "A closed channel", "An unbuffered channel"], ans: 1,
        exp: "The zero value of a channel is `nil`. Sending to or receiving from a nil channel blocks forever. Closing a nil channel panics."
    },

    {
        cat: "Channels", q: "What happens when you send to a closed channel?",
        opts: ["The send blocks indefinitely", "The value is discarded silently", "A panic occurs at runtime", "The channel reopens automatically"], ans: 2,
        exp: "Sending to a closed channel causes a panic: `send on closed channel`. This is a runtime panic, not a compile error. Always ensure the sender closes the channel, never the receiver."
    },

    {
        cat: "Channels", q: "What does receiving from a closed, empty channel return?",
        opts: ["Blocks forever", "Panics", "Returns the zero value of the channel's type and false", "Returns an error"], ans: 2,
        exp: "Receiving from a closed, empty channel immediately returns the zero value of the element type and `false` for the ok flag: `v, ok := <-ch`. If items remain, they're drained first before returning zero/false."
    },

    {
        cat: "Channels", q: "What is the capacity of an unbuffered channel?",
        opts: ["1", "0", "Unlimited", "Depends on message size"], ans: 1,
        exp: "An unbuffered channel has capacity 0. A send on an unbuffered channel blocks until a receiver is ready, and vice versa. It provides synchronization between sender and receiver."
    },

    {
        cat: "Channels", q: "Which select behavior occurs when multiple cases are ready simultaneously?",
        opts: ["The first case always wins", "The case with lowest channel capacity wins", "One case is chosen at random", "All ready cases execute in parallel"], ans: 2,
        exp: "When multiple cases in a `select` statement are ready simultaneously, Go chooses one at random. This prevents starvation and avoids systematic bias toward any particular channel."
    },

    {
        cat: "Channels", q: "What is a 'done channel' pattern used for?",
        opts: ["Signaling goroutines to stop work by closing a channel", "Tracking how many goroutines have finished", "Buffering completion results", "Synchronizing database writes"], ans: 0,
        exp: "The done channel pattern uses a channel (typically `chan struct{}`) that's closed to broadcast a stop/cancellation signal to multiple goroutines. Closing broadcasts to all receivers simultaneously, unlike sending which only wakes one."
    },

    {
        cat: "Channels", q: "What does `make(chan int, 5)` create?",
        opts: ["A channel that can hold 5 goroutines", "A buffered channel with capacity 5", "5 separate integer channels", "An unbuffered channel with 5 senders"], ans: 1,
        exp: "`make(chan int, 5)` creates a buffered channel with a buffer capacity of 5. Sends don't block until the buffer is full; receives don't block while there are buffered values."
    },

    {
        cat: "Channels", q: "Which statement correctly ranges over a channel?",
        opts: ["for v := range ch {}", "for v, ok := range ch {}", "for range ch {}", "for ch -> v {}"], ans: 0,
        exp: "`for v := range ch {}` iterates over values received from `ch`, blocking until a new value arrives or the channel is closed. When the channel is closed and drained, the loop exits automatically."
    },

    {
        cat: "Channels", q: "What is a 'fan-out' pattern?",
        opts: ["Multiple goroutines reading from one channel", "One goroutine writing to multiple channels", "Merging multiple channels into one", "Closing all channels simultaneously"], ans: 0,
        exp: "Fan-out distributes work from one input channel to multiple worker goroutines. Each worker reads from the same shared input channel, allowing parallel processing of work items."
    },

    {
        cat: "Channels", q: "Why use `chan struct{}` instead of `chan bool` for signals?",
        opts: ["struct{} is faster to serialize", "struct{} consumes zero bytes of memory", "bool channels are not allowed in Go", "chan bool cannot be closed"], ans: 1,
        exp: "`struct{}` is an empty struct that takes zero bytes of memory. For pure signaling (where the value itself doesn't matter), `chan struct{}` is idiomatic Go—it communicates intent clearly and wastes no memory."
    },

    // ── SYNC PRIMITIVES ──
    {
        cat: "Sync Primitives", q: "What does `sync.WaitGroup.Add(n)` do?",
        opts: ["Adds n goroutines to a pool", "Increments the WaitGroup counter by n", "Blocks until n goroutines complete", "Sets the maximum concurrency to n"], ans: 1,
        exp: "`wg.Add(n)` increments the WaitGroup's internal counter by n. `wg.Done()` decrements it by 1. `wg.Wait()` blocks until the counter reaches zero. `Add` must be called before starting goroutines."
    },

    {
        cat: "Sync Primitives", q: "What is the zero value of `sync.Mutex`?",
        opts: ["A locked mutex", "An unlocked, ready-to-use mutex", "Nil", "An error-state mutex"], ans: 1,
        exp: "The zero value of `sync.Mutex` is an unlocked mutex, ready to use. You never need to initialize a Mutex explicitly—`var mu sync.Mutex` is valid and ready."
    },

    {
        cat: "Sync Primitives", q: "What happens if you call `sync.Mutex.Unlock()` on an already-unlocked mutex?",
        opts: ["It's a no-op", "A deadlock occurs", "A runtime panic occurs", "A compile error"], ans: 2,
        exp: "Unlocking an already-unlocked mutex causes a runtime panic: `sync: unlock of unlocked mutex`. Always ensure Unlock is paired with a prior Lock. `defer mu.Unlock()` after `mu.Lock()` is the idiomatic safe pattern."
    },

    {
        cat: "Sync Primitives", q: "What is `sync.RWMutex` optimized for?",
        opts: ["Write-heavy workloads", "Read-heavy workloads with concurrent readers", "Single-threaded access patterns", "Network I/O synchronization"], ans: 1,
        exp: "`sync.RWMutex` allows multiple concurrent readers (`RLock`/`RUnlock`) but only one writer at a time (`Lock`/`Unlock`). It's optimized for scenarios where reads vastly outnumber writes, improving throughput significantly."
    },

    {
        cat: "Sync Primitives", q: "What does `sync.Once.Do(f)` guarantee?",
        opts: ["f runs on every call", "f runs exactly once, even with concurrent callers", "f runs once per goroutine", "f runs if no error occurs"], ans: 1,
        exp: "`sync.Once` guarantees that a function `f` is executed exactly once, regardless of how many goroutines call `Do(f)` concurrently. Subsequent calls are no-ops until the Once is reset (which isn't possible—use a new Once)."
    },

    {
        cat: "Sync Primitives", q: "Which sync type is appropriate for a concurrent map with frequent reads?",
        opts: ["sync.Mutex wrapping a map", "sync.Map", "sync.RWMutex wrapping a map", "Both sync.Map and sync.RWMutex are appropriate depending on access patterns"], ans: 3,
        exp: "`sync.Map` is optimized for cases where keys are written once and read many times, or when goroutines each access disjoint keys. For general concurrent maps, `sync.RWMutex` + regular map often performs better due to sync.Map's overhead."
    },

    {
        cat: "Sync Primitives", q: "What does `sync.Cond.Wait()` atomically do?",
        opts: ["Locks the mutex and waits", "Unlocks the associated mutex and suspends the goroutine", "Waits without releasing any locks", "Signals all waiting goroutines"], ans: 1,
        exp: "`cond.Wait()` atomically releases the associated mutex and suspends the goroutine. When another goroutine calls `Signal` or `Broadcast`, the goroutine wakes up and re-acquires the mutex before returning."
    },

    {
        cat: "Sync Primitives", q: "What is the risk of using `sync.Mutex` by value (not pointer)?",
        opts: ["No risk, it's fine to copy", "The copied mutex is independent—copying after first use causes undefined locking behavior", "The program won't compile", "It causes a memory leak"], ans: 1,
        exp: "Copying a `sync.Mutex` after first use copies the lock state, creating two independent mutexes that no longer protect the same resource. Always pass mutexes by pointer or embed them in a struct accessed by pointer."
    },

    {
        cat: "Sync Primitives", q: "What does `atomic.AddInt64(&x, 1)` provide that `x++` doesn't?",
        opts: ["Faster execution", "Atomicity—the read-modify-write happens as a single CPU instruction", "Automatic overflow detection", "Thread-local storage"], ans: 1,
        exp: "`atomic.AddInt64` performs an atomic read-modify-write using CPU atomic instructions (like LOCK XADD on x86), preventing race conditions. `x++` is not atomic—it compiles to multiple instructions and is unsafe for concurrent access."
    },

    {
        cat: "Sync Primitives", q: "Which package provides atomic operations on pointers and primitives in Go?",
        opts: ["sync", "runtime", "sync/atomic", "unsafe"], ans: 2,
        exp: "The `sync/atomic` package provides atomic operations for integer types and pointers. Since Go 1.19, `atomic.Int64`, `atomic.Pointer[T]`, and other typed atomics were added for safer, more ergonomic use."
    },

    {
        cat: "Sync Primitives", q: "What is a semaphore pattern implemented with channels?",
        opts: ["make(chan struct{}, N) with send to acquire, receive to release", "A closed channel used for broadcasting", "A nil channel that blocks forever", "A buffered channel of booleans"], ans: 0,
        exp: "A buffered channel of capacity N works as a semaphore: `sem <- struct{}{}` acquires (blocks if N slots taken), `<-sem` releases. This limits concurrent access to N goroutines—a common Go pattern for rate limiting concurrency."
    },

    // ── CONTEXT ──
    {
        cat: "Context", q: "What is the primary purpose of `context.Context`?",
        opts: ["Storing global application state", "Carrying deadlines, cancellation signals, and request-scoped values across API boundaries", "Managing goroutine lifecycles directly", "Replacing error returns"], ans: 1,
        exp: "`context.Context` carries deadlines, cancellation signals, and request-scoped key-value pairs across API and goroutine boundaries. It's the standard mechanism for propagating cancellation and timeouts in Go services."
    },

    {
        cat: "Context", q: "What is returned by `context.WithCancel(parent)`?",
        opts: ["A new context and a cancel function", "A new context with a timeout", "Just a cancelled context", "A channel that signals cancellation"], ans: 0,
        exp: "`context.WithCancel` returns a derived context and a `CancelFunc`. Calling the cancel function cancels the context and all its children. The cancel function should always be called to release resources (defer is idiomatic)."
    },

    {
        cat: "Context", q: "How does a goroutine check if its context has been cancelled?",
        opts: ["ctx.IsCancelled()", "<-ctx.Done()", "ctx.Err() != nil", "ctx.Cancel()"], ans: 1,
        exp: "`ctx.Done()` returns a channel that's closed when the context is cancelled or expired. Goroutines select on `<-ctx.Done()` to detect cancellation. `ctx.Err()` returns the reason (Canceled or DeadlineExceeded) after Done is closed."
    },

    {
        cat: "Context", q: "What does `context.Background()` return?",
        opts: ["A context with a 30-second timeout", "A nil context", "An empty, non-cancellable root context", "A context with all values pre-populated"], ans: 2,
        exp: "`context.Background()` returns a non-nil, empty context. It's never cancelled, has no deadline, and carries no values. It's the root from which all other contexts are derived, typically used in main(), init(), and top-level handlers."
    },

    {
        cat: "Context", q: "What is wrong with storing a `context.Context` in a struct field?",
        opts: ["Contexts are not thread-safe", "It prevents garbage collection", "It violates Go's convention that contexts should be passed explicitly per-call, not stored", "Structs cannot hold interface values"], ans: 2,
        exp: "The Go team explicitly recommends against storing contexts in structs. Contexts are request-scoped and should be passed as the first parameter to functions that need them, enabling per-call cancellation and deadline control."
    },

    {
        cat: "Context", q: "What does `context.WithTimeout(parent, 5*time.Second)` do differently from `WithDeadline`?",
        opts: ["WithTimeout accepts a duration; WithDeadline accepts an absolute time", "WithTimeout is for HTTP only", "WithDeadline is deprecated", "They are identical"], ans: 0,
        exp: "`WithTimeout(parent, d)` is sugar for `WithDeadline(parent, time.Now().Add(d))`. WithTimeout takes a relative duration; WithDeadline takes an absolute `time.Time`. Both return a derived context that cancels after the time expires."
    },

    {
        cat: "Context", q: "What key type should you use for context values to avoid collisions?",
        opts: ["string", "int", "A private unexported type defined in your package", "context.Key"], ans: 2,
        exp: "Using an unexported type (e.g., `type contextKey int`) as the key type prevents collisions with keys from other packages. Since the type is unexported, only your package can create or read values with that key."
    },

    {
        cat: "Context", q: "Which context function should be used when no cancellation is needed but a parent must be provided?",
        opts: ["context.TODO()", "context.Background()", "context.Empty()", "context.Noop()"], ans: 1,
        exp: "`context.Background()` is used as the root context when no cancellation/deadline is needed. `context.TODO()` signals that the developer intends to add a proper context later—it's a placeholder for unfinished code."
    },

    {
        cat: "Context", q: "If a parent context is cancelled, what happens to child contexts?",
        opts: ["Children are unaffected", "Children are cancelled automatically", "Children must be cancelled manually", "Children are garbage collected immediately"], ans: 1,
        exp: "Context cancellation propagates downward. When a parent context is cancelled (or its deadline expires), all derived child contexts are automatically cancelled too. This allows cancelling an entire tree of operations with one call."
    },

    {
        cat: "Context", q: "What is the correct way to pass context to an HTTP request in Go?",
        opts: ["http.Request.Context = ctx", "req = req.WithContext(ctx)", "http.SetContext(req, ctx)", "context.Attach(req, ctx)"], ans: 1,
        exp: "`req.WithContext(ctx)` returns a shallow copy of the request with the provided context attached. The original request is unchanged. This is the standard pattern for propagating cancellation/deadlines through outgoing HTTP calls."
    },

    // ── ERROR HANDLING ──
    {
        cat: "Error Handling", q: "What interface must a type implement to be used as an error?",
        opts: ["type Error interface { String() string }", "type error interface { Error() string }", "type Err interface { Message() string }", "type error interface { String() string; Code() int }"], ans: 1,
        exp: "The built-in `error` interface has a single method: `Error() string`. Any type implementing this method satisfies the error interface and can be returned as an error value."
    },

    {
        cat: "Error Handling", q: "What does `fmt.Errorf(\"wrap: %w\", err)` do?",
        opts: ["Formats the error as a string only", "Wraps err so it can be unwrapped with errors.Unwrap", "Copies the error to a new type", "Logs the error to stderr"], ans: 1,
        exp: "The `%w` verb in `fmt.Errorf` wraps an error, embedding it in a new error with a message prefix. The wrapped error can be retrieved with `errors.Unwrap(e)` and checked with `errors.Is(e, target)` or `errors.As(e, &target)`."
    },

    {
        cat: "Error Handling", q: "What is the difference between `errors.Is` and `errors.As`?",
        opts: ["Is checks type, As checks value", "Is checks identity/value equality through the chain; As finds the first error of a target type", "They are identical", "Is is for sentinel errors; As is for string comparison"], ans: 1,
        exp: "`errors.Is(err, target)` checks if any error in the chain equals target (by value or via Is method). `errors.As(err, &target)` finds the first error in the chain assignable to the target type and sets it. Use Is for sentinel errors, As for typed errors."
    },

    {
        cat: "Error Handling", q: "What is a sentinel error?",
        opts: ["An error that triggers a panic", "A predeclared package-level error variable compared with ==", "An error that wraps another error", "An error type with extra fields"], ans: 1,
        exp: "Sentinel errors are package-level error variables (e.g., `var ErrNotFound = errors.New(\"not found\")`) compared with `==` or `errors.Is`. Examples: `io.EOF`, `sql.ErrNoRows`. They communicate specific conditions to callers."
    },

    {
        cat: "Error Handling", q: "What does `errors.New(\"msg\")` return?",
        opts: ["A string", "A pointer to a new unique errorString struct", "An error code integer", "A formatted error with a stack trace"], ans: 1,
        exp: "`errors.New` returns a pointer to an unexported `errorString` struct. The pointer identity ensures two `errors.New` calls with the same string are not equal—each call creates a distinct error value."
    },

    {
        cat: "Error Handling", q: "What is wrong with `if err != nil { return err }` when calling multiple functions?",
        opts: ["It doesn't compile", "It loses context about where the error originated; wrap errors with %w to add context", "It causes a panic", "It ignores errors"], ans: 1,
        exp: "Returning raw errors without wrapping loses the call stack context. The best practice is to wrap with `fmt.Errorf(\"doThing: %w\", err)` to build an error chain that describes what was happening when the error occurred."
    },

    {
        cat: "Error Handling", q: "How do you create a custom error type with additional fields?",
        opts: ["Extend the error interface with new methods", "Define a struct with an Error() string method", "Use fmt.Errorf with %T", "Use errors.New with a struct argument"], ans: 1,
        exp: "Define a struct with relevant fields and implement `Error() string`. Example: `type ValidationError struct { Field string; Msg string }; func (e *ValidationError) Error() string { return e.Field + \": \" + e.Msg }`."
    },

    {
        cat: "Error Handling", q: "What is the purpose of the `errors.Join` function (added in Go 1.20)?",
        opts: ["Merges error messages into a single string", "Creates a multi-error that wraps multiple errors, each checkable with errors.Is/As", "Concatenates error codes", "Joins error types into a union type"], ans: 1,
        exp: "`errors.Join(errs...)` (Go 1.20+) returns an error wrapping multiple errors. `errors.Is` and `errors.As` traverse all joined errors. Useful for collecting multiple validation errors or reporting all failures simultaneously."
    },

    {
        cat: "Error Handling", q: "Which pattern ensures errors are not silently ignored at call sites?",
        opts: ["Using panic instead of error returns", "The linter `errcheck` or staticcheck that flags unhandled errors", "Returning errors as strings", "Using global error variables"], ans: 1,
        exp: "Tools like `errcheck` and `staticcheck` (or `golangci-lint`) statically analyze code to find ignored error return values. The Go community strongly values explicit error handling—ignoring errors with `_` should be deliberate and documented."
    },

    {
        cat: "Error Handling", q: "What does `defer` guarantee even when a function returns an error?",
        opts: ["The deferred function runs before the error is returned", "The deferred function runs after the error propagates", "Deferred functions run even when the function returns an error—cleanup always happens", "Deferred functions are skipped on error returns"], ans: 2,
        exp: "Deferred functions execute when the surrounding function returns, regardless of whether it returns an error or panics (panics also run defers). This makes defer ideal for cleanup: `defer f.Close()`, `defer mu.Unlock()`."
    },

    // ── INTERFACES ──
    {
        cat: "Interfaces", q: "What are the two components of an interface value in Go?",
        opts: ["Type and value (a type descriptor and a pointer to data)", "Method set and struct", "Interface name and size", "Pointer and length"], ans: 0,
        exp: "An interface value consists of a (type, value) pair internally: a pointer to type information (itab for concrete types) and a pointer to the underlying data. A nil interface has both as nil; a non-nil interface with a nil concrete value has only the data pointer nil."
    },

    {
        cat: "Interfaces", q: "What is the difference between a nil interface and an interface holding a nil pointer?",
        opts: ["They are identical", "A nil interface has no type info; an interface holding a nil pointer has type info but nil data—it is NOT nil", "Both cause panics when used", "A nil interface panics; interface with nil pointer doesn't"], ans: 1,
        exp: "A nil interface `(type=nil, value=nil)` compares equal to nil. An interface holding a typed nil pointer `(type=*T, value=nil)` is NOT nil—the type component is set. This is a famous Go gotcha: returning `(*MyError)(nil)` from an error-returning function is not nil."
    },

    {
        cat: "Interfaces", q: "What is implicit interface satisfaction in Go?",
        opts: ["Interfaces are satisfied by declaring `implements InterfaceName`", "A type satisfies an interface automatically if it has all the required methods", "The compiler generates interface boilerplate", "Interfaces must be registered at init time"], ans: 1,
        exp: "Go uses structural (duck) typing. A type satisfies an interface if it implements all the interface's methods—no `implements` keyword needed. This enables decoupled design and retroactive satisfaction."
    },

    {
        cat: "Interfaces", q: "What does the empty interface `interface{}` (or `any`) accept?",
        opts: ["Only pointer types", "Only structs", "Any value of any type", "Only comparable types"], ans: 2,
        exp: "`interface{}` (aliased as `any` since Go 1.18) can hold a value of any type since every type implements the empty interface. It's used for generic containers and interoperability, but requires type assertions to use the underlying value."
    },

    {
        cat: "Interfaces", q: "What is a type assertion `v, ok := i.(T)` used for?",
        opts: ["Converting interface to string", "Extracting the concrete value of type T from interface i, with ok indicating success", "Checking if two interfaces are equal", "Casting between numeric types"], ans: 1,
        exp: "A type assertion extracts the concrete type from an interface. The two-value form `v, ok := i.(T)` safely checks without panicking—ok is false if i doesn't hold a T. The single-value form `v := i.(T)` panics if the assertion fails."
    },

    {
        cat: "Interfaces", q: "What is a type switch used for?",
        opts: ["Switching on string values", "Matching the dynamic type of an interface across multiple cases", "Switching on error codes", "Pattern matching on struct fields"], ans: 1,
        exp: "A type switch `switch v := i.(type) { case T1: ... case T2: ... }` tests the dynamic type of an interface value across multiple types. In each case, v is the concrete value of that type—more elegant than chained type assertions."
    },

    {
        cat: "Interfaces", q: "Should interfaces be defined in the package that uses them or the package that implements them?",
        opts: ["In the implementation package", "In the user/consumer package", "In a shared `interfaces` package", "In the main package"], ans: 1,
        exp: "Go convention: define interfaces in the package that uses them, not where implementations live. This enables dependency inversion—consumers define what they need, implementations satisfy it without knowing about the interface. 'Accept interfaces, return concrete types.'"
    },

    {
        cat: "Interfaces", q: "What does `io.Reader` define?",
        opts: ["Read(p []byte) (n int, err error)", "ReadAll() ([]byte, error)", "Read() []byte", "ReadByte() (byte, error)"], ans: 0,
        exp: "`io.Reader` has a single method: `Read(p []byte) (n int, err error)`. It reads up to len(p) bytes into p, returning bytes read and any error. `io.EOF` signals end of data. It's Go's fundamental abstraction for readable byte streams."
    },

    {
        cat: "Interfaces", q: "What is interface pollution?",
        opts: ["Using too many interface methods", "Defining interfaces prematurely for types that have only one implementation, adding unnecessary abstraction", "Using interface{} everywhere", "Implementing unused interface methods"], ans: 1,
        exp: "Interface pollution is creating interfaces before they're needed—especially single-implementation interfaces. Go's philosophy: write concrete types first; extract an interface when you have 2+ implementations or need to mock for testing."
    },

    {
        cat: "Interfaces", q: "What is the Stringer interface?",
        opts: ["type Stringer interface { String() string }", "type Stringer interface { ToString() string }", "type Stringer interface { Format() string }", "fmt.Formatter"], ans: 0,
        exp: "`fmt.Stringer` is `interface { String() string }`. Types implementing it control their formatted output in fmt functions. When fmt encounters a Stringer, it calls String() automatically for %v, %s, and default formatting."
    },

    // ── GENERICS ──
    {
        cat: "Generics", q: "What Go version introduced generics?",
        opts: ["Go 1.16", "Go 1.17", "Go 1.18", "Go 1.20"], ans: 2,
        exp: "Generics were introduced in Go 1.18 (March 2022) via type parameters. This was one of the most significant language changes in Go's history, enabling type-safe reusable data structures and algorithms."
    },

    {
        cat: "Generics", q: "What is a type constraint in Go generics?",
        opts: ["A compile-time check on variable size", "An interface that restricts which types a type parameter can be", "A runtime assertion on types", "A way to limit struct field types"], ans: 1,
        exp: "Type constraints are interfaces that define which types are permitted for a type parameter. They can include method requirements and type set elements (e.g., `~int | ~float64`). `any` (empty interface) allows all types."
    },

    {
        cat: "Generics", q: "What does the `~` operator mean in a type constraint?",
        opts: ["Bitwise NOT", "Matches types whose underlying type is the specified type", "Approximate equality", "Optional type"], ans: 1,
        exp: "The `~T` syntax in a constraint means 'any type whose underlying type is T'. For example, `~int` matches not just `int` but also named types like `type MyInt int`. Without `~`, only the exact type matches."
    },

    {
        cat: "Generics", q: "What is the `comparable` constraint?",
        opts: ["Types that implement Less() bool", "Types that can be compared with == and != (suitable as map keys)", "Types implementing Equals() method", "Types with numerical operations"], ans: 1,
        exp: "`comparable` is a built-in constraint that permits types that are comparable with `==` and `!=`—basically types that can be used as map keys. It includes booleans, numbers, strings, pointers, channels, arrays, and structs of comparable fields."
    },

    {
        cat: "Generics", q: "Can you use type parameters on methods in Go?",
        opts: ["Yes, methods can have their own type parameters", "No, type parameters can only be on types (structs) and functions", "Yes, but only on interface methods", "Only on exported methods"], ans: 1,
        exp: "Methods cannot introduce new type parameters in Go. Only functions and types (structs, etc.) can declare type parameters. A method on a generic type can use the type's parameters, but can't add its own—this was a deliberate design decision."
    },

    {
        cat: "Generics", q: "What is a type inference in Go generics?",
        opts: ["Runtime type detection", "The compiler deducing type arguments from function arguments, so you don't need to specify them explicitly", "Automatic interface implementation", "Reflection-based type matching"], ans: 1,
        exp: "Type inference allows calling generic functions without explicitly providing type arguments when the compiler can deduce them from the function arguments. E.g., `Min(3, 4)` instead of `Min[int](3, 4)` when Min accepts `[T constraints.Ordered]`."
    },

    {
        cat: "Generics", q: "What package provides ordered number constraints?",
        opts: ["math", "constraints (golang.org/x/exp/constraints)", "generics", "cmp"], ans: 1,
        exp: "The `golang.org/x/exp/constraints` package provides `constraints.Ordered` (all ordered types: integers, floats, strings) and others. In Go 1.21+, the `cmp` package added `cmp.Ordered` as a standard library constraint."
    },

    {
        cat: "Generics", q: "What is a generic stack implementation's type signature?",
        opts: ["type Stack struct { items []interface{} }", "type Stack[T any] struct { items []T }", "type Stack(T) struct { items []T }", "generic type Stack[T] { items []T }"], ans: 1,
        exp: "`type Stack[T any] struct { items []T }` defines a generic stack. `T` is the type parameter constrained by `any`. Methods are defined as `func (s *Stack[T]) Push(v T)`. Instantiate with `Stack[int]{}` or `Stack[string]{}`."
    },

    {
        cat: "Generics", q: "What limitation exists when using generics with interface type sets?",
        opts: ["Cannot use generics with interfaces at all", "Type set interfaces (with ~ and |) can only be used as constraints, not as regular types", "Generics cannot return interface values", "Type parameters cannot be pointers"], ans: 1,
        exp: "Interface types that use type set elements (`~T`, `T1 | T2`) can only be used as type constraints, not as regular variable types. You can't write `var x interface{ ~int }`. They're purely a compile-time construct for generic bounds."
    },

    {
        cat: "Generics", q: "How do you instantiate a generic function `func Map[T, U any](s []T, f func(T) U) []U`?",
        opts: ["Map<int, string>(slice, fn)", "Map[int, string](slice, fn) or Map(slice, fn) with type inference", "Map.(int, string)(slice, fn)", "Map{int, string}(slice, fn)"], ans: 1,
        exp: "Generic functions are instantiated with type arguments in square brackets: `Map[int, string](slice, fn)`. When the compiler can infer types from arguments, you can omit them: `Map(intSlice, func(i int) string { ... })`."
    },

    // ── MEMORY & GC ──
    {
        cat: "Memory & GC", q: "What type of garbage collector does Go use?",
        opts: ["Reference counting", "Mark-and-sweep with stop-the-world phases", "Tri-color concurrent mark-and-sweep", "Generational garbage collection"], ans: 2,
        exp: "Go uses a tri-color concurrent mark-and-sweep GC. It runs mostly concurrently with the program, using short stop-the-world (STW) pauses only for specific phases. It prioritizes low latency over maximum throughput."
    },

    {
        cat: "Memory & GC", q: "What does 'escape analysis' determine?",
        opts: ["Whether a goroutine will terminate", "Whether a variable is allocated on the stack or heap", "Whether a function is inlined", "Whether an interface is satisfied"], ans: 1,
        exp: "Escape analysis is a compiler optimization that determines if a variable's lifetime is bounded by the function scope (stack allocation) or if it 'escapes' to be referenced beyond the function (heap allocation). Stack allocation is faster with no GC pressure."
    },

    {
        cat: "Memory & GC", q: "How can you see escape analysis decisions?",
        opts: ["go run -escape", "go build -gcflags='-m'", "go vet -escape", "GODEBUG=escape=1"], ans: 1,
        exp: "`go build -gcflags='-m'` (or `-gcflags='-m -m'` for more detail) prints escape analysis decisions. It shows which variables escape to the heap, which functions are inlined, etc. Useful for optimizing performance-critical code."
    },

    {
        cat: "Memory & GC", q: "What is `sync.Pool` used for?",
        opts: ["Limiting goroutine concurrency", "Pooling and reusing allocated objects to reduce GC pressure", "Synchronizing multiple WaitGroups", "Pooling database connections"], ans: 1,
        exp: "`sync.Pool` caches allocated objects for reuse between GC cycles. It reduces allocation pressure in high-throughput code. Objects in the pool may be collected by GC at any time—don't use for state that must survive GC. Classic use: byte buffers."
    },

    {
        cat: "Memory & GC", q: "What does `runtime.GC()` do?",
        opts: ["Disables the garbage collector", "Forces an immediate GC cycle", "Tunes GC parameters", "Frees a specific object"], ans: 1,
        exp: "`runtime.GC()` triggers an immediate, synchronous garbage collection cycle. It's useful in tests or benchmarks to produce a clean baseline, but shouldn't be called in production code—the runtime's automatic GC is better tuned."
    },

    {
        cat: "Memory & GC", q: "What does the `GOGC` environment variable control?",
        opts: ["Number of GC goroutines", "The ratio of live heap to new allocation that triggers GC (default 100)", "GC pause time target", "Whether GC is enabled"], ans: 1,
        exp: "`GOGC` sets the GC target percentage (default 100). A value of 100 means GC runs when the heap grows to 2x the live heap after the last collection. Lower values = more frequent GC (less memory, more CPU). `GOGC=off` disables GC."
    },

    {
        cat: "Memory & GC", q: "What is a false sharing problem in Go?",
        opts: ["Two goroutines sharing a false value", "Multiple goroutines accessing different variables that occupy the same CPU cache line, causing performance degradation", "Sharing interfaces between packages", "Nil pointer dereferences in shared memory"], ans: 1,
        exp: "False sharing occurs when goroutines on different CPUs access different variables that happen to be on the same cache line. Writes by one CPU invalidate the cache line for all CPUs, causing expensive cache misses. Fix: pad structs to cache line size (64 bytes)."
    },

    {
        cat: "Memory & GC", q: "What does `unsafe.Sizeof` return?",
        opts: ["Memory allocated on heap for a value", "The size in bytes of the type, as the compiler represents it (including padding)", "The runtime size of an interface", "The length of a slice"], ans: 1,
        exp: "`unsafe.Sizeof(x)` returns the size in bytes that the type of x occupies in memory, including struct padding but not the data pointed to by pointers. It's a compile-time constant. Useful for memory layout analysis and unsafe pointer arithmetic."
    },

    {
        cat: "Memory & GC", q: "When does a value escape to the heap?",
        opts: ["When assigned to a local variable", "When its address is stored somewhere that outlives the current function, or it's too large for the stack", "When passed to a function", "When used in a loop"], ans: 1,
        exp: "Variables escape to the heap when: their address is stored in a longer-lived location (e.g., returned pointer, assigned to interface), they're too large for the stack, or the compiler can't prove their lifetime is bounded (e.g., closed-over in a goroutine)."
    },

    {
        cat: "Memory & GC", q: "What is the purpose of `runtime.SetFinalizer(obj, fn)`?",
        opts: ["Forces obj to be freed immediately", "Registers fn to be called by GC when obj is about to be collected", "Prevents obj from being garbage collected", "Sets obj's memory limit"], ans: 1,
        exp: "`runtime.SetFinalizer` registers a function to run when the GC determines an object is unreachable. Useful for releasing non-memory resources (OS handles). However, finalizers run non-deterministically and can delay GC—prefer explicit Close() patterns."
    },

    // ── SLICES & MAPS ──
    {
        cat: "Slices & Maps", q: "What are the three components of a slice header?",
        opts: ["Length, capacity, and type", "Pointer to array, length, and capacity", "Pointer, size, and alignment", "Data, type, and GC info"], ans: 1,
        exp: "A slice header contains: (1) a pointer to the underlying array, (2) length (number of elements accessible), and (3) capacity (total elements in the array from the pointer). This 24-byte header is what's copied when passing slices to functions."
    },

    {
        cat: "Slices & Maps", q: "What does `append` do when the slice capacity is exceeded?",
        opts: ["Returns an error", "Panics with index out of range", "Allocates a new, larger underlying array and copies elements", "Overwrites the first element"], ans: 2,
        exp: "When `append` exceeds capacity, it allocates a new underlying array (typically 2x capacity for small slices, less for large ones), copies all existing elements, appends the new element(s), and returns a new slice header pointing to the new array."
    },

    {
        cat: "Slices & Maps", q: "What is the result of `a := []int{1,2,3}; b := a[1:2]; b[0] = 99`?",
        opts: ["Only b is modified", "Only a is modified", "Both a and b see the change (shared underlying array)", "A panic occurs"], ans: 2,
        exp: "Slice expressions share the underlying array. b[0] refers to the same memory as a[1]. After `b[0] = 99`, a becomes [1, 99, 3]. This sharing is a common source of bugs—be careful when modifying sub-slices."
    },

    {
        cat: "Slices & Maps", q: "How do you safely copy a slice to avoid sharing the underlying array?",
        opts: ["dst = src", "dst = append([]T{}, src...)", "dst = src[:]", "reflect.Copy(dst, src)"], ans: 1,
        exp: "`append([]T{}, src...)` creates a new slice with its own underlying array containing all of src's elements. Alternatively, `dst := make([]T, len(src)); copy(dst, src)`. Both prevent the two slices from sharing memory."
    },

    {
        cat: "Slices & Maps", q: "What happens when you access a missing key in a map?",
        opts: ["A panic occurs", "An error is returned", "The zero value of the value type is returned", "The map is automatically extended"], ans: 2,
        exp: "Accessing a missing key returns the zero value for the value type (0 for int, \"\" for string, nil for pointers, etc.). Use the two-value form `v, ok := m[k]` to distinguish between a missing key and a key that maps to the zero value."
    },

    {
        cat: "Slices & Maps", q: "Why is iterating a map with `range` non-deterministic?",
        opts: ["Maps are always empty on first iteration", "Go randomizes map iteration order intentionally to prevent reliance on unspecified behavior", "Map keys are sorted differently per CPU", "The range statement has a bug"], ans: 1,
        exp: "Go intentionally randomizes map iteration order (via a random seed set at program start per map iteration). This prevents developers from accidentally relying on unspecified ordering. To iterate in order, collect keys, sort them, then iterate."
    },

    {
        cat: "Slices & Maps", q: "What is the correct way to delete a key from a map?",
        opts: ["map[key] = nil", "delete(map, key)", "map.Remove(key)", "unset(map[key])"], ans: 1,
        exp: "The built-in `delete(m, k)` removes key k from map m. It's a no-op if k doesn't exist—no panic. After deletion, accessing m[k] returns the zero value."
    },

    {
        cat: "Slices & Maps", q: "What is the risk of concurrent map reads and writes?",
        opts: ["Silent data corruption with no error", "A compile error", "A race condition detected by the race detector; in Go 1.6+ concurrent map writes cause a fatal runtime error", "Automatic locking by the runtime"], ans: 2,
        exp: "Concurrent unsynchronized map reads/writes are a data race. Since Go 1.6, the runtime detects concurrent map writes and throws a fatal error: `concurrent map read and map write`. Use `sync.RWMutex` or `sync.Map` for concurrent access."
    },

    {
        cat: "Slices & Maps", q: "What does `make(map[string]int, 100)` do?",
        opts: ["Creates a map with 100 key-value pairs", "Preallocates hash table buckets for ~100 entries, reducing rehashing", "Limits the map to 100 entries", "Creates 100 maps"], ans: 1,
        exp: "The second argument to `make` for maps is a capacity hint. It pre-allocates internal hash table buckets to accommodate ~n entries, reducing allocations and rehashing. The map can still grow beyond n—it's a hint, not a limit."
    },

    {
        cat: "Slices & Maps", q: "What does `len(nil)` return for a nil slice or nil map?",
        opts: ["A panic", "An error", "0", "undefined"], ans: 2,
        exp: "`len(nil)` returns 0 for nil slices, nil maps, nil channels, and nil pointers. A nil slice and an empty slice (`[]T{}`) are both valid and `len` returns 0 for both. A nil map can be read from (returns zero values) but writing to it panics."
    },

    // ── STRUCTS & EMBEDDING ──
    {
        cat: "Structs & Embedding", q: "What is struct embedding in Go?",
        opts: ["Including one struct type as a named field in another", "Including a type without a field name, promoting its methods and fields to the outer struct", "Using inheritance from a base class", "Declaring a struct inside another struct's method"], ans: 1,
        exp: "Embedding includes a type without a field name. The embedded type's methods and fields are promoted to the outer struct, accessible as if they were defined on the outer type. It's Go's composition mechanism, not inheritance."
    },

    {
        cat: "Structs & Embedding", q: "What is the difference between embedding a type and declaring a named field of that type?",
        opts: ["No difference—they are the same", "Embedding promotes methods/fields to the outer type; a named field requires explicit field access", "Named fields are faster", "Embedding creates a copy; named fields use a pointer"], ans: 1,
        exp: "With embedding (`type Outer struct { Inner }`), Inner's methods are promoted: `outer.Method()` works. With a named field (`type Outer struct { inner Inner }`), you must write `outer.inner.Method()`. Embedding enables composition with method promotion."
    },

    {
        cat: "Structs & Embedding", q: "What happens when an outer struct and embedded struct both define a method with the same name?",
        opts: ["Compile error", "The outer struct's method shadows (overrides) the embedded method", "The embedded method takes priority", "Both methods are called sequentially"], ans: 1,
        exp: "The outer struct's method shadows the embedded type's method of the same name. To call the embedded method explicitly, use `outer.EmbeddedType.Method()`. This shadowing enables method 'overriding' in Go's composition model."
    },

    {
        cat: "Structs & Embedding", q: "What is a receiver in Go?",
        opts: ["A channel that receives values", "The variable after `func` and before the method name, binding the method to a type", "A return value from a function", "A listener for network connections"], ans: 1,
        exp: "A method receiver is the type a method is defined on, specified between `func` and the method name: `func (t *Type) Method()`. The receiver `t` is like `this` in other languages. Methods with receivers are defined on types, not in functions."
    },

    {
        cat: "Structs & Embedding", q: "When should you use a pointer receiver vs a value receiver?",
        opts: ["Always use value receivers for safety", "Use pointer receivers when the method modifies the receiver or the struct is large; use value receivers for small, immutable data", "Use value receivers for interfaces", "Use pointer receivers only for concurrency"], ans: 1,
        exp: "Use pointer receivers when: (1) the method needs to modify the receiver, (2) the struct is large (avoid copying), or (3) consistency with other methods on the type. Value receivers are fine for small, immutable structs or when you want to guarantee no mutation."
    },

    {
        cat: "Structs & Embedding", q: "What is struct field alignment/padding?",
        opts: ["Sorting struct fields alphabetically", "The compiler adding unused bytes between fields to satisfy CPU alignment requirements", "Compressing struct memory", "Aligning structs to cache lines automatically"], ans: 1,
        exp: "CPUs access memory most efficiently when values are aligned to their size. Go adds padding bytes between struct fields to ensure alignment. Field order matters: a struct with `bool, int64, bool` is larger than `bool, bool, int64` due to padding."
    },

    {
        cat: "Structs & Embedding", q: "What does the `json:\"name,omitempty\"` struct tag do?",
        opts: ["Ignores the field during JSON marshaling", "Sets the JSON field name to 'name' and omits it if it's the zero value", "Validates that the JSON value is not empty", "Marks the field as required in JSON"], ans: 1,
        exp: "Struct tags provide metadata for encoding packages. `json:\"name,omitempty\"` tells `encoding/json` to use 'name' as the JSON key and to omit the field entirely if it has the zero value (0, \"\", nil, false, empty slice/map)."
    },

    {
        cat: "Structs & Embedding", q: "What is the `sync.Mutex` anti-pattern when embedding?",
        opts: ["Embedding sync.Mutex exposes Lock/Unlock publicly if the struct is exported", "Embedded mutexes slow down compilation", "sync.Mutex cannot be embedded", "Embedded mutexes prevent method sets from working"], ans: 0,
        exp: "Embedding `sync.Mutex` in an exported struct exposes `Lock()` and `Unlock()` as public methods, allowing callers to accidentally misuse them. It's safer to use a named field `mu sync.Mutex` to keep it private and access it only within the package."
    },

    {
        cat: "Structs & Embedding", q: "What does `_ = (*T)(nil)` in code validate?",
        opts: ["That T implements the nil interface", "That *T satisfies a given interface at compile time (interface compliance check)", "That T is a pointer type", "Nothing—it's dead code"], ans: 1,
        exp: "`var _ InterfaceName = (*ConcreteType)(nil)` is an idiomatic compile-time check that `*ConcreteType` implements `InterfaceName`. The blank identifier discards the value. If the interface isn't satisfied, it's a compile error—useful for catching interface drift."
    },

    // ── WORKER POOLS ──
    {
        cat: "Worker Pools", q: "What is the purpose of a worker pool pattern?",
        opts: ["To create a fixed number of goroutines that share a database connection", "To limit concurrency by having a fixed number of goroutines process work from a shared queue", "To pool OS threads for lower latency", "To share network connections across goroutines"], ans: 1,
        exp: "A worker pool bounds concurrency to a fixed N goroutines. Workers read from a shared input channel, process tasks, optionally write results to an output channel. This prevents spawning unbounded goroutines and controls resource usage (CPU, memory, file descriptors)."
    },

    {
        cat: "Worker Pools", q: "In a worker pool, how are workers typically started?",
        opts: ["By calling workers.Start()", "By ranging over a slice of worker functions", "With a for loop starting N goroutines, each ranging over a shared jobs channel", "Using os.Fork()"], ans: 2,
        exp: "The idiomatic worker pool: create a buffered jobs channel, start N goroutines each doing `for job := range jobs { process(job) }`, send work to jobs, then close(jobs) when done. Closing the channel causes all workers to exit their range loops."
    },

    {
        cat: "Worker Pools", q: "How do you collect results from a worker pool?",
        opts: ["Workers write to a global slice with a mutex", "Workers send results to a shared results channel; a collector goroutine or main reads from it", "Return values from goroutines directly", "Using sync.Map to collect results"], ans: 1,
        exp: "Workers send to a shared results channel: `results <- result`. A separate goroutine or the main function reads from results. The channel is closed after all workers finish—typically coordinated with a WaitGroup that closes the channel when the counter reaches zero."
    },

    {
        cat: "Worker Pools", q: "What is the risk of not closing the jobs channel in a worker pool?",
        opts: ["Workers will panic", "Workers will block forever on range, causing a goroutine leak", "Workers will process jobs twice", "The results channel will deadlock"], ans: 1,
        exp: "Workers ranging over the jobs channel block when the channel is empty and drained—they only exit when the channel is closed. If you never close jobs, workers block forever: a goroutine leak. Always close(jobs) after all work is submitted."
    },

    {
        cat: "Worker Pools", q: "How do you gracefully shut down a worker pool with context cancellation?",
        opts: ["Close the jobs channel immediately", "Workers select on both jobs channel and ctx.Done(); on cancellation, workers drain and exit", "Call runtime.Goexit() on each worker", "Send a special sentinel value to each worker"], ans: 1,
        exp: "Workers use select: `select { case job, ok := <-jobs: if !ok { return }; process(job) case <-ctx.Done(): return }`. When context is cancelled, workers exit. Close(jobs) + context gives two independent shutdown mechanisms."
    },

    {
        cat: "Worker Pools", q: "What is errgroup (golang.org/x/sync/errgroup) useful for in worker patterns?",
        opts: ["Grouping errors from multiple functions into one", "Running concurrent tasks and collecting the first non-nil error while cancelling remaining tasks", "Replacing sync.WaitGroup", "Pooling database errors"], ans: 1,
        exp: "`errgroup.Group` runs multiple goroutines and waits for all to complete, returning the first non-nil error. With `errgroup.WithContext`, it cancels a shared context on first error. It's a higher-level alternative to WaitGroup+channel for concurrent tasks."
    },

    {
        cat: "Worker Pools", q: "What is a bounded semaphore pattern for limiting concurrency?",
        opts: ["Using N mutexes in sequence", "A buffered channel of capacity N: send before starting work, receive after finishing", "A WaitGroup with counter N", "Using GOMAXPROCS=N"], ans: 1,
        exp: "`sem := make(chan struct{}, N)`. Before spawning work: `sem <- struct{}{}` (blocks if N already running). After finishing: `<-sem`. This allows exactly N concurrent operations without maintaining a pool of worker goroutines."
    },

    {
        cat: "Worker Pools", q: "How do you handle panics in worker goroutines to prevent the whole program from crashing?",
        opts: ["Panics in goroutines automatically recover", "Use recover() inside each worker's deferred function to catch panics and send errors to the results channel", "Wrap jobs in a Mutex", "Use runtime.SetPanicHandler"], ans: 1,
        exp: "Panics in goroutines crash the program unless recovered within the same goroutine. Each worker should: `defer func() { if r := recover(); r != nil { results <- fmt.Errorf(\"panic: %v\", r) } }()`. This catches panics and converts them to errors."
    },

    {
        cat: "Worker Pools", q: "What is a pipeline pattern in Go?",
        opts: ["A sequence of functions that modify a single slice", "A series of stages connected by channels where each stage processes data and passes it downstream", "A linked list of goroutines", "A buffered channel used as a FIFO queue"], ans: 1,
        exp: "A pipeline chains goroutines via channels: `gen -> stage1 -> stage2 -> sink`. Each stage receives from an upstream channel, processes, and sends to a downstream channel. Cancellation and backpressure flow through the channel mechanism."
    },

    {
        cat: "Worker Pools", q: "What is fan-in (merge) in the context of Go concurrency patterns?",
        opts: ["Sending to multiple channels simultaneously", "Combining multiple input channels into a single output channel", "Distributing work from one channel to many workers", "Reducing goroutine count"], ans: 1,
        exp: "Fan-in merges multiple channels into one. A goroutine per input channel forwards values to a single output channel. This aggregates results from multiple parallel sources (e.g., from a fan-out of workers) into a single stream."
    },

    // ── CONCURRENCY PATTERNS ──
    {
        cat: "Concurrency Patterns", q: "What is the 'or-done' channel pattern?",
        opts: ["A channel that returns errors as booleans", "Wrapping a channel read with a select on ctx.Done() to respect cancellation", "A pattern for closing multiple channels", "Combining OR logic with channels"], ans: 1,
        exp: "The or-done pattern wraps channel reads: `select { case v, ok := <-ch: if !ok { return }; doWork(v) case <-done: return }`. It prevents goroutines from blocking on a channel when a done/cancel signal fires."
    },

    {
        cat: "Concurrency Patterns", q: "What is the 'tee' channel pattern?",
        opts: ["Splitting reads across two goroutines", "Copying a stream of values from one input channel to two output channels simultaneously", "A three-way channel split", "Merging two channels into one"], ans: 1,
        exp: "Tee takes one input channel and returns two output channels that each receive every value from the input. It's like Unix's `tee` command: `out1, out2 := tee(in)`. Useful when two independent consumers need the same data stream."
    },

    {
        cat: "Concurrency Patterns", q: "What problem does the 'confinement' pattern solve?",
        opts: ["Network connection limits", "Avoids synchronization by ensuring data is only accessed by one goroutine at a time through ownership transfer", "Limiting goroutine count", "Preventing context cancellation from leaking"], ans: 1,
        exp: "Confinement ensures a piece of data is only accessed by one goroutine at a time by design, not by locking. Ad-hoc confinement: by convention. Lexical confinement: by scoping (e.g., only goroutine A can reach variable x). Eliminates races without synchronization overhead."
    },

    {
        cat: "Concurrency Patterns", q: "What is the 'generator' pattern in Go?",
        opts: ["A function that returns a channel and sends values into it from a goroutine", "Using yield to produce values lazily", "A factory function for creating goroutines", "A closure that generates random numbers"], ans: 0,
        exp: "A generator returns a channel and starts a goroutine that sends values into it: `func gen(n int) <-chan int { ch := make(chan int); go func() { for ...; ch<-v; close(ch) }(); return ch }`. Callers consume values lazily."
    },

    {
        cat: "Concurrency Patterns", q: "What is backpressure in concurrent systems?",
        opts: ["CPU pressure from too many goroutines", "A mechanism where downstream consumers signal upstream producers to slow down when overwhelmed", "Memory pressure from large buffers", "Network congestion in distributed systems"], ans: 1,
        exp: "Backpressure prevents a fast producer from overwhelming a slow consumer. In Go, a buffered channel naturally provides backpressure: when the buffer fills, sends block, slowing the producer. Unbounded goroutine spawning without backpressure causes resource exhaustion."
    },

    {
        cat: "Concurrency Patterns", q: "What is the 'heartbeat' goroutine pattern?",
        opts: ["A goroutine that measures latency", "A goroutine that periodically sends a signal to prove it's alive, enabling timeouts if it dies", "A pattern for retrying failed operations", "A goroutine that monitors memory usage"], ans: 1,
        exp: "A heartbeat goroutine periodically sends on a heartbeat channel (or ticks) to prove it's alive and making progress. Consumers can time-out if no heartbeat arrives within a deadline—useful for detecting hung goroutines in tests."
    },

    {
        cat: "Concurrency Patterns", q: "What is the primary use of `time.After` in goroutine patterns?",
        opts: ["Delaying goroutine startup", "Creating a channel that receives after a duration—used in select for timeouts", "Measuring goroutine execution time", "Scheduling goroutines at specific times"], ans: 1,
        exp: "`time.After(d)` returns a `<-chan time.Time` that receives the current time after duration d. In select: `case <-time.After(5*time.Second): return errTimeout`. Warning: it leaks a timer goroutine if the case isn't hit—use `time.NewTimer` for proper cleanup."
    },

    {
        cat: "Concurrency Patterns", q: "What is the 'bridge channel' pattern?",
        opts: ["Connecting TCP sockets with channels", "Consuming a channel of channels, presenting values as a single flat channel", "Bridging between different goroutine pools", "Forwarding HTTP requests via channels"], ans: 1,
        exp: "A bridge channel destructures a `<-chan <-chan T` (channel of channels) into a single `<-chan T`. It reads from each inner channel until it's closed or exhausted, then moves to the next, presenting all values in sequence as one stream."
    },

    {
        cat: "Concurrency Patterns", q: "What race condition can occur with `time.After` in a tight loop?",
        opts: ["Double sends on the time channel", "Each call to time.After allocates a new timer and goroutine that's never cleaned up if the select fires another case first, causing a goroutine/timer leak", "The timer fires twice", "time.After panics under high concurrency"], ans: 1,
        exp: "Each `time.After(d)` creates a new `time.Timer` that is only GC'd after d expires. In a loop, if another select case fires before the timeout, the timer goroutine leaks until d elapses. Use `t := time.NewTimer(d); defer t.Stop()` to avoid leaks."
    },

    {
        cat: "Concurrency Patterns", q: "What is the 'replicated requests' pattern?",
        opts: ["Sending the same request to multiple servers and using the first response", "Caching responses to avoid duplicate requests", "Replicating goroutines for fault tolerance", "Distributing a request across multiple goroutines"], ans: 0,
        exp: "Replicated requests sends the same request to N handlers/servers simultaneously and uses the first response received. The other requests are cancelled via context. This reduces tail latency at the cost of extra load—useful when p99 latency matters."
    },

    // ── SCHEDULER & RUNTIME ──
    {
        cat: "Scheduler & Runtime", q: "What does the Go scheduler's GMP model stand for?",
        opts: ["Goroutine, Memory, Process", "Goroutine, Machine (OS thread), Processor (logical)", "Global, Manager, Process", "Goroutine, Mutex, Parallelism"], ans: 1,
        exp: "GMP: G = Goroutine (unit of work), M = Machine (OS thread), P = Processor (logical, holds a run queue). Each P can be assigned to one M. Goroutines from P's local run queue are scheduled onto M. There are GOMAXPROCS Ps."
    },

    {
        cat: "Scheduler & Runtime", q: "What happens when an M blocks on a syscall?",
        opts: ["All goroutines on that M block too", "The P detaches from the blocked M and attaches to another (or new) M to continue running other goroutines", "The goroutine is killed", "GOMAXPROCS increases automatically"], ans: 1,
        exp: "When an M blocks on a syscall, its P is 'handoff'—detached and reassigned to another idle M (or a new M is created). This prevents blocking syscalls from stalling other goroutines. When the syscall returns, the original M tries to reacquire a P."
    },

    {
        cat: "Scheduler & Runtime", q: "What is the 'work stealing' mechanism in Go's scheduler?",
        opts: ["The OS stealing CPU time from goroutines", "An idle P stealing goroutines from another P's local run queue to keep all processors busy", "A goroutine stealing memory from another goroutine", "The GC stealing CPU cycles from goroutines"], ans: 1,
        exp: "When a P's local run queue is empty, it randomly steals half the goroutines from another P's run queue. This load-balances goroutines across processors without a centralized scheduler, improving throughput on multi-core systems."
    },

    {
        cat: "Scheduler & Runtime", q: "What is a 'spinning' M in Go's scheduler?",
        opts: ["An M executing a spin lock", "An M actively searching for runnable goroutines rather than sleeping, reducing scheduling latency", "An M with an infinite loop", "An M waiting for I/O"], ans: 1,
        exp: "A spinning M is an OS thread looking for work (goroutines to run) without blocking. Go keeps at most one spinning M per P to reduce wake-up latency when new goroutines become runnable. Spinning costs CPU but reduces scheduling delay."
    },

    {
        cat: "Scheduler & Runtime", q: "What does `runtime.LockOSThread()` do?",
        opts: ["Locks a mutex tied to an OS thread", "Pins the current goroutine to its current OS thread—no other goroutines can run on that thread", "Prevents OS thread creation", "Locks the current goroutine's stack"], ans: 1,
        exp: "`runtime.LockOSThread()` locks the calling goroutine to its current OS thread. Used when calling C code that uses thread-local storage, or OS APIs that must be called from the same thread (e.g., some graphics APIs). `UnlockOSThread()` reverses it."
    },

    {
        cat: "Scheduler & Runtime", q: "What is `GOMAXPROCS` set to by default in modern Go?",
        opts: ["1", "4", "The number of logical CPU cores", "The number of physical CPU cores"], ans: 2,
        exp: "Since Go 1.5, `GOMAXPROCS` defaults to the number of logical CPU cores (as reported by `runtime.NumCPU()`). This allows true parallelism. Setting it to 1 makes goroutines run in an interleaved, cooperative fashion."
    },

    {
        cat: "Scheduler & Runtime", q: "What does `go tool trace` analyze?",
        opts: ["Memory allocation patterns", "Goroutine scheduling, GC events, syscalls, and heap size over time for detailed performance analysis", "CPU profiles", "Network packet captures"], ans: 1,
        exp: "`go tool trace` analyzes trace files created by `runtime/trace`. It visualizes goroutine lifetimes, scheduler events, GC phases, and blocking on channels/syscalls over time. Provides much more detail than pprof for understanding concurrent behavior."
    },

    {
        cat: "Scheduler & Runtime", q: "What does `runtime.NumGoroutine()` return?",
        opts: ["GOMAXPROCS", "The number of currently existing goroutines", "The number of OS threads", "The goroutine ID"], ans: 1,
        exp: "`runtime.NumGoroutine()` returns the number of goroutines currently existing (runnable, blocked, or in a syscall). Useful for detecting goroutine leaks in tests by comparing counts before and after operations."
    },

    {
        cat: "Scheduler & Runtime", q: "What is the 'netpoller' in Go's runtime?",
        opts: ["A DNS resolver", "An integration with the OS's async I/O (epoll/kqueue/IOCP) that allows goroutines to block on network I/O without blocking OS threads", "A network packet buffer", "A channel-based network abstraction"], ans: 1,
        exp: "The netpoller integrates Go with OS async I/O facilities (epoll on Linux, kqueue on macOS, IOCP on Windows). When a goroutine blocks on network I/O, it parks without blocking an OS thread. The netpoller wakes the goroutine when I/O is ready."
    },

    {
        cat: "Scheduler & Runtime", q: "What event triggers Go's asynchronous preemption (Go 1.14+)?",
        opts: ["Function calls only", "SIGURG signals sent to M threads by the runtime's sysmon goroutine", "A fixed time quantum", "Memory allocation events"], ans: 1,
        exp: "Since Go 1.14, a background `sysmon` goroutine sends SIGURG signals to OS threads running goroutines that have been running too long. A signal handler injects a preemption request at the next safe point, enabling preemption even in tight loops without function calls."
    },

    // ── TESTING ──
    {
        cat: "Testing", q: "What function marks a test as failed without stopping it immediately?",
        opts: ["t.Fatal()", "t.Error()", "t.Fail()", "t.Skip()"], ans: 1,
        exp: "`t.Error()` and `t.Errorf()` mark the test as failed and log a message but continue execution. `t.Fatal()` and `t.Fatalf()` mark as failed and stop the test immediately. Use Fatal when subsequent code depends on the failed assertion."
    },

    {
        cat: "Testing", q: "What does `testing.T.Parallel()` do?",
        opts: ["Runs the test on multiple CPUs", "Marks the test to run in parallel with other parallel tests", "Spawns goroutines for the test", "Runs subtests in parallel automatically"], ans: 1,
        exp: "`t.Parallel()` allows the test to run concurrently with other tests marked Parallel. The test pauses at `Parallel()`, waits for non-parallel tests in its parent to finish, then runs concurrently. Speeds up test suites significantly."
    },

    {
        cat: "Testing", q: "How do you run only tests matching a specific pattern?",
        opts: ["go test -filter=Pattern", "go test -run=Pattern", "go test -match Pattern", "go test Pattern"], ans: 1,
        exp: "`go test -run=Pattern` runs only tests, benchmarks, and examples whose names match the regular expression Pattern. For subtests: `-run=TestFoo/subtest`. The pattern is a regex, so `-run=.` runs all tests."
    },

    {
        cat: "Testing", q: "What is table-driven testing?",
        opts: ["Testing with a database backend", "A pattern where test cases are defined as a slice of structs and iterated with subtests", "A spreadsheet for test planning", "Using HTML tables to document tests"], ans: 1,
        exp: "Table-driven tests define multiple test cases as a slice/map of structs (input + expected output), then range over them running `t.Run(tc.name, func(t *testing.T) { ... })` for each. This is the dominant Go testing pattern—DRY, readable, and subtestable."
    },

    {
        cat: "Testing", q: "What does the `-race` flag do when running tests?",
        opts: ["Enables benchmark racing mode", "Enables the race detector to find data races at runtime", "Runs tests in a race condition", "Competes tests against each other"], ans: 1,
        exp: "`go test -race` enables the built-in race detector, which instruments memory accesses and reports data races at runtime. It has ~5-10x runtime overhead but is essential for catching race conditions in concurrent code."
    },

    {
        cat: "Testing", q: "How do you write a benchmark in Go?",
        opts: ["func BenchmarkXxx(b *testing.B) { for i := 0; i < b.N; i++ { ... } }", "func Benchmark_Xxx(b *testing.B) { ... }", "func TestBench(b *testing.B) { ... }", "func bench() testing.Result { ... }"], ans: 0,
        exp: "Benchmarks have signature `func BenchmarkXxx(b *testing.B)` and loop `b.N` times. The framework adjusts N to get a stable measurement. Run with `go test -bench=. -benchmem` to include allocation stats."
    },

    {
        cat: "Testing", q: "What does `t.Cleanup(fn)` do?",
        opts: ["Cleans up test output files", "Registers fn to run when the test and all its subtests complete—similar to defer but scoped to the test", "Removes temporary directories", "Resets global state"], ans: 1,
        exp: "`t.Cleanup(fn)` registers a cleanup function to run when the test function and all its subtests end, regardless of outcome. Unlike defer (which runs at function return), Cleanup runs after subtests finish too. Useful in helper functions."
    },

    {
        cat: "Testing", q: "What is `testify` commonly used for?",
        opts: ["Generating test data", "Providing assert/require helpers and mock generation for more expressive tests", "Benchmarking HTTP servers", "Fuzz testing"], ans: 1,
        exp: "`github.com/stretchr/testify` provides `assert` (non-fatal) and `require` (fatal) packages with expressive assertion helpers (`assert.Equal`, `assert.NoError`, etc.) and `mock` for interface mocking. It's the most popular Go testing library."
    },

    {
        cat: "Testing", q: "What does `go test -coverprofile=coverage.out` produce?",
        opts: ["A binary coverage file", "A coverage profile that can be visualized with `go tool cover -html=coverage.out`", "A test log file", "A pprof profile"], ans: 1,
        exp: "`-coverprofile=coverage.out` writes a coverage profile to the file. `go tool cover -html=coverage.out` opens an HTML view showing which lines are covered. `-cover` alone prints a percentage. Coverage helps identify untested code paths."
    },

    {
        cat: "Testing", q: "What is fuzz testing in Go (added in 1.18)?",
        opts: ["Testing with random but controlled data", "Automatically generating random/mutated inputs to find bugs and panics", "Testing network fuzzing protocols", "Stress-testing with concurrent goroutines"], ans: 1,
        exp: "Fuzz testing (Go 1.18+) automatically generates and mutates inputs to find crashes, panics, and failing assertions. Write `func FuzzXxx(f *testing.F)` with seed corpus entries (`f.Add(...)`). Run with `go test -fuzz=FuzzXxx`. Corpus failures are saved to testdata/."
    },

    // ── HTTP & NET ──
    {
        cat: "HTTP & net", q: "What does `http.ListenAndServe` block on?",
        opts: ["Until the first request arrives", "Forever (serving requests) or until an error occurs", "Until 100 requests are handled", "Until the context is cancelled"], ans: 1,
        exp: "`http.ListenAndServe(addr, handler)` listens on the TCP address and serves incoming connections forever, only returning on error. It blocks the calling goroutine. Production servers handle shutdown gracefully with `http.Server` and its `Shutdown()` method."
    },

    {
        cat: "HTTP & net", q: "How do you implement graceful shutdown of an HTTP server?",
        opts: ["Call http.Stop()", "Use server.Shutdown(ctx) which stops accepting new connections and waits for active requests to finish", "Close the listener socket directly", "Send SIGTERM to the server goroutine"], ans: 1,
        exp: "`server.Shutdown(ctx)` gracefully shuts down the server: stops accepting new connections, then waits for active handlers to complete (or ctx to expire). Pair with signal handling (SIGTERM) and a timeout context for production readiness."
    },

    {
        cat: "HTTP & net", q: "What does `http.DefaultServeMux` do?",
        opts: ["Handles all HTTP methods the same way", "A package-level ServeMux used by handlers registered with http.Handle/HandleFunc", "Provides HTTPS by default", "A reverse proxy mux"], ans: 1,
        exp: "`http.DefaultServeMux` is a package-level `*ServeMux` used when you call `http.Handle`, `http.HandleFunc`, or `http.ListenAndServe(addr, nil)`. For production, prefer an explicit `mux := http.NewServeMux()` to avoid polluting the default mux (which third-party packages may also register on)."
    },

    {
        cat: "HTTP & net", q: "What is the purpose of `http.RoundTripper`?",
        opts: ["A built-in load balancer", "An interface for executing a single HTTP transaction—implementing it lets you customize transport behavior (retries, auth, tracing)", "A HTTP/2 multiplexer", "A round-robin DNS resolver"], ans: 1,
        exp: "`http.RoundTripper` is an interface with one method: `RoundTrip(*Request) (*Response, error)`. You implement it to intercept or modify HTTP requests/responses. Common uses: adding auth headers, logging, retry logic, circuit breakers, tracing."
    },

    {
        cat: "HTTP & net", q: "Why should you always close `http.Response.Body`?",
        opts: ["To trigger garbage collection", "The Body is a network connection; not closing it leaks the TCP connection and prevents connection reuse", "Response.Body auto-closes after 60 seconds", "Bodies close automatically when the response is read"], ans: 1,
        exp: "`resp.Body` wraps the underlying TCP connection. Not closing it prevents the connection from being returned to the transport's connection pool, causing connection leaks. Always: `defer resp.Body.Close()` after checking the error from `http.Get/Do`."
    },

    {
        cat: "HTTP & net", q: "What is `http.Transport` responsible for?",
        opts: ["Routing HTTP requests to handlers", "Managing underlying TCP connections, TLS handshakes, HTTP/2 multiplexing, and connection pooling", "Parsing HTTP headers", "Writing HTTP responses"], ans: 1,
        exp: "`http.Transport` implements `RoundTripper` and manages connection pooling, TLS, keep-alives, and HTTP/2. `http.DefaultTransport` is the default used by `http.DefaultClient`. Customize it to control timeouts, max idle connections, and TLS configuration."
    },

    {
        cat: "HTTP & net", q: "What does setting `http.Client.Timeout` affect?",
        opts: ["Only the connection establishment time", "The total time from request send to full response body read—includes connection, TLS handshake, request, redirects, and response body", "Only the response read timeout", "Only TLS handshake timeout"], ans: 1,
        exp: "`http.Client.Timeout` sets the end-to-end timeout for the entire HTTP exchange: dial + TLS + send request + wait for response headers + read response body. After timeout, the request is cancelled. Use `http.Transport` timeouts for more granular control."
    },

    {
        cat: "HTTP & net", q: "What Go package enables writing HTTP middleware?",
        opts: ["net/middleware", "net/http (wrapping http.Handler)", "gorilla/middleware", "http/chain"], ans: 1,
        exp: "Middleware in Go is a function that takes an `http.Handler` and returns an `http.Handler`: `func Logging(next http.Handler) http.Handler { return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { log(...); next.ServeHTTP(w, r) }) }`. No special package needed."
    },

    {
        cat: "HTTP & net", q: "What is `context.WithTimeout` typically used for in HTTP handlers?",
        opts: ["Setting a timeout for the HTTP response", "Adding a deadline to downstream DB/service calls so they don't hang indefinitely", "Cancelling all goroutines in the handler", "Timing the handler execution for metrics"], ans: 1,
        exp: "In handlers, derive a child context with a deadline for downstream calls: `ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second); defer cancel()`. Pass ctx to DB queries, gRPC calls, etc. If downstream is slow, the context expires and calls return an error."
    },

    {
        cat: "HTTP & net", q: "What does `net.Conn` represent?",
        opts: ["An HTTP connection", "A generic network connection (TCP, UDP, Unix socket) with Read, Write, and Close methods", "A database connection", "A TLS certificate"], ans: 1,
        exp: "`net.Conn` is an interface representing a generic network connection with `Read(b []byte)`, `Write(b []byte)`, `Close()`, deadline-setting methods, and address info. `net.TCPConn`, `net.UDPConn`, and TLS connections all implement `net.Conn`."
    },

    // ── REFLECTION ──
    {
        cat: "Reflection", q: "What package provides reflection in Go?",
        opts: ["runtime", "reflect", "unsafe", "encoding"], ans: 1,
        exp: "The `reflect` package provides Go's reflection capabilities: inspecting types at runtime, reading/writing fields, calling methods dynamically, and creating types/values programmatically. It's used by encoding/json, ORM libraries, and dependency injection frameworks."
    },

    {
        cat: "Reflection", q: "What is the difference between `reflect.TypeOf` and `reflect.ValueOf`?",
        opts: ["TypeOf returns a string; ValueOf returns an int", "TypeOf returns the runtime type information; ValueOf returns a reflect.Value representing the actual value", "They are identical", "TypeOf is for interfaces; ValueOf is for structs"], ans: 1,
        exp: "`reflect.TypeOf(x)` returns a `reflect.Type` describing x's type (name, kind, methods, fields). `reflect.ValueOf(x)` returns a `reflect.Value` holding x's actual value, allowing you to read or (if addressable) modify it."
    },

    {
        cat: "Reflection", q: "What does `reflect.Value.Elem()` do?",
        opts: ["Returns the first element of a slice", "Dereferences a pointer reflect.Value or returns the value held by an interface reflect.Value", "Returns struct field by index", "Iterates over a map"], ans: 1,
        exp: "`v.Elem()` dereferences a pointer: if v holds a *T, Elem() returns the T value it points to. For interfaces, Elem() returns the concrete value stored in the interface. Panics if v's Kind is not Ptr or Interface."
    },

    {
        cat: "Reflection", q: "What is a reflect.Kind?",
        opts: ["The interface a type implements", "A constant categorizing a type's fundamental nature (Struct, Ptr, Slice, Map, Int, Func, etc.)", "The package a type belongs to", "The size of a type in bytes"], ans: 1,
        exp: "`reflect.Kind` is an enum categorizing a type's basic structure: `reflect.Struct`, `reflect.Ptr`, `reflect.Slice`, `reflect.Map`, `reflect.Int`, `reflect.Interface`, etc. Unlike Type (which is specific), Kind is the category. `type Celsius float64` has Kind Float64."
    },

    {
        cat: "Reflection", q: "Can you modify a struct field via reflection?",
        opts: ["Never—reflection is read-only", "Yes, if the value was obtained via a pointer and the field is exported", "Yes, always", "Only for public packages"], ans: 1,
        exp: "To set a field via reflection: pass a pointer to reflect.ValueOf, call Elem() to dereference, get the field with FieldByName, and call Set(). The field must be exported (uppercase). Setting unexported fields panics. This is how json.Unmarshal works."
    },

    {
        cat: "Reflection", q: "What is the performance implication of heavy reflection use?",
        opts: ["Reflection is the same speed as direct code", "Reflection is 10-100x slower than direct code due to type checks, interface boxing, and indirect dispatch", "Reflection only affects startup time", "Reflection is slower only for generics"], ans: 1,
        exp: "Reflection involves interface boxing, runtime type lookups, bounds checking, and indirect method dispatch—typically 5-50x slower than direct Go code. It also defeats compiler optimizations. Use reflection for framework/library code; avoid it in hot paths."
    },

    {
        cat: "Reflection", q: "What does `reflect.DeepEqual` do?",
        opts: ["Checks pointer equality", "Recursively compares two values for structural equality, including unexported fields and nested maps/slices", "Compares only exported fields", "Checks if two values have the same type"], ans: 1,
        exp: "`reflect.DeepEqual(x, y)` recursively compares two values: same type, same struct fields (including unexported), same map contents, same slice elements. Useful in tests but slower than `==`. Note: nil slice and empty slice are NOT DeepEqual."
    },

    {
        cat: "Reflection", q: "What is a common use of struct tags that requires reflection?",
        opts: ["Controlling struct field size", "encoding/json, database/sql ORM mappers, and validation libraries read struct tags at runtime via reflect.Type.Field.Tag", "Marking fields as concurrent-safe", "Controlling GC behavior"], ans: 1,
        exp: "Struct tags are string literals in backticks after a field declaration. Reflection reads them via `field.Tag.Get(\"json\")` etc. The `encoding/json` package uses `json:\"name,omitempty\"` tags to control marshaling. ORMs use `db:\"column_name\"` for SQL mapping."
    },

    {
        cat: "Reflection", q: "What does `reflect.MakeSlice`, `reflect.MakeMap`, and `reflect.MakeChan` enable?",
        opts: ["Creating generic data structures", "Creating slices, maps, and channels of dynamically determined types at runtime", "Allocating memory without GC", "Creating type aliases at runtime"], ans: 1,
        exp: "These functions create composite types whose element type is determined at runtime. For example, a generic deserialization function can create a `[]T` where T is determined by a `reflect.Type` parameter passed at runtime."
    },

    // ── BUILD & TOOLING ──
    {
        cat: "Build & Tooling", q: "What does `go build -ldflags \"-X main.version=1.0\"` do?",
        opts: ["Links a version library", "Sets the value of the string variable `main.version` at link time", "Compresses the binary", "Embeds a version file"], ans: 1,
        exp: "`-X importpath.name=value` sets the value of a string variable in the program at link time. This is the standard way to embed version strings, build timestamps, and git commit hashes into Go binaries without a separate config file."
    },

    {
        cat: "Build & Tooling", q: "What is a build constraint (build tag)?",
        opts: ["A runtime check for supported platforms", "A directive that tells the Go toolchain when to include a file in a build, based on OS, arch, or custom tags", "A minimum Go version requirement", "A constraint on import cycles"], ans: 1,
        exp: "Build constraints (via `//go:build` comment or filename suffixes like `_linux.go`) control which files are compiled. Example: `//go:build linux && amd64` includes the file only on Linux AMD64. `-tags` flag passes custom tags."
    },

    {
        cat: "Build & Tooling", q: "What does `go generate` do?",
        opts: ["Generates Go code from templates", "Runs commands specified in `//go:generate` directives within Go source files", "Generates test stubs", "Generates documentation"], ans: 1,
        exp: "`go generate` scans source files for `//go:generate command args` comments and runs the specified commands. Common uses: running `stringer` for enum strings, `mockgen` for mocks, `protoc` for protobuf, or `sqlc` for SQL code generation."
    },

    {
        cat: "Build & Tooling", q: "What is `go vet` used for?",
        opts: ["Running tests", "Detecting suspicious code constructs: printf format mismatches, unreachable code, incorrect mutex usage, etc.", "Formatting code", "Managing dependencies"], ans: 1,
        exp: "`go vet` runs a suite of static analyses on Go source code to catch common mistakes: mismatched format verbs, struct tags errors, incorrect use of sync primitives, shadowed errors, etc. It's run automatically by `go test` and CI pipelines."
    },

    {
        cat: "Build & Tooling", q: "What does `//go:embed` do?",
        opts: ["Embeds C code in Go files", "Embeds static files (or directories) into the compiled Go binary at build time, accessible via embed.FS", "Marks a function for inlining", "Generates assembly code"], ans: 1,
        exp: "`//go:embed` (Go 1.16+) embeds files or directories into the binary. `//go:embed templates/*` with `var f embed.FS` embeds all template files. Access via `f.ReadFile(\"templates/index.html\")`. No external file needed at runtime."
    },

    {
        cat: "Build & Tooling", q: "What is `pprof` used for?",
        opts: ["Protocol buffer profiling", "CPU, memory, goroutine, and contention profiling of Go programs", "Testing performance regressions", "Code coverage analysis"], ans: 1,
        exp: "`pprof` profiles Go programs: CPU profiles (where time is spent), heap profiles (memory allocations), goroutine profiles (all goroutine stacks), and mutex/block profiles (contention). Enable with `net/http/pprof` for HTTP endpoint or `runtime/pprof` for files."
    },

    {
        cat: "Build & Tooling", q: "What is `golangci-lint`?",
        opts: ["Go's built-in linter", "A meta-linter that runs multiple Go linters in parallel with shared configuration", "A code formatter", "A dependency security scanner"], ans: 1,
        exp: "`golangci-lint` runs dozens of Go linters simultaneously (staticcheck, errcheck, govet, ineffassign, etc.) much faster than running them individually, sharing parse results. Configured via `.golangci.yml`. The de facto standard linter aggregator in Go projects."
    },

    {
        cat: "Build & Tooling", q: "What does `go tool compile -S` produce?",
        opts: ["A binary symbol table", "Assembly output for Go source code, showing machine instructions generated by the compiler", "A formatted source listing", "A static analysis report"], ans: 1,
        exp: "`go tool compile -S file.go` (or `go build -gcflags='-S'`) outputs the assembly generated for the Go source. Useful for understanding what the compiler produces, checking inlining, and understanding low-level performance characteristics."
    },

    {
        cat: "Build & Tooling", q: "What does `GOOS=linux GOARCH=arm64 go build` do?",
        opts: ["Sets the maximum OS and architecture", "Cross-compiles the program for Linux ARM64, regardless of the host OS/architecture", "Builds with Linux system calls on any OS", "Enables ARM64 SIMD optimizations"], ans: 1,
        exp: "Go supports easy cross-compilation via environment variables. `GOOS` sets the target OS (linux, darwin, windows), `GOARCH` sets the architecture (amd64, arm64, 386). No external toolchain needed for pure Go code—CGO requires a cross-compiler."
    },

    // ── MODULES ──
    {
        cat: "Modules", q: "What file is the root of a Go module?",
        opts: ["package.json", "go.sum", "go.mod", "GOPATH/src"], ans: 2,
        exp: "`go.mod` defines a module's name (`module` directive), minimum Go version (`go` directive), and direct dependencies with versions (`require` blocks). It's the root of the module's dependency graph and must exist at the root of the module directory."
    },

    {
        cat: "Modules", q: "What does `go.sum` contain?",
        opts: ["A list of all files in the module", "Cryptographic hashes of module zip files and go.mod files for security verification", "A lock file with exact versions", "A list of module authors"], ans: 1,
        exp: "`go.sum` contains cryptographic hashes (SHA-256) of the content of specific module versions. It ensures that future downloads of the same version produce identical content, preventing supply chain attacks. Never manually edit go.sum."
    },

    {
        cat: "Modules", q: "What does `go mod tidy` do?",
        opts: ["Formats go.mod", "Adds missing and removes unused module requirements, updating go.mod and go.sum", "Upgrades all dependencies", "Verifies module checksums"], ans: 1,
        exp: "`go mod tidy` adds any missing module requirements needed to build the current module's packages and removes requirements for unused packages. It also updates go.sum. Run before committing code to keep go.mod clean."
    },

    {
        cat: "Modules", q: "What is semantic versioning (semver) in Go modules?",
        opts: ["A versioning scheme for Go's standard library", "A versioning scheme (vMAJOR.MINOR.PATCH) where major version changes indicate breaking API changes, required in module paths for v2+", "A way to version struct fields", "Go's internal version format"], ans: 1,
        exp: "Go modules use semver. For v2+, the major version must be included in the module path (e.g., `github.com/pkg/v2`) because different major versions are considered different modules. v0 and v1 are interchangeable in paths."
    },

    {
        cat: "Modules", q: "What is a 'replace' directive in go.mod used for?",
        opts: ["Renaming a package", "Replacing a module with a different version or a local path—commonly used for local development or forked dependencies", "Replacing a function at runtime", "Aliasing import paths"], ans: 1,
        exp: "`replace github.com/foo/bar => ./local/bar` redirects imports of a module to a local directory or different version. Used for developing two modules simultaneously, testing patches before upstreaming, or working around bugs in dependencies."
    },

    {
        cat: "Modules", q: "What is GOPATH mode vs modules mode?",
        opts: ["Different ways to set PATH", "Pre-Go1.11 GOPATH required code in $GOPATH/src; modules mode (default since 1.16) uses go.mod files and doesn't require GOPATH placement", "Different network modes", "Memory allocation strategies"], ans: 1,
        exp: "Before modules (Go 1.11), all code had to be in `$GOPATH/src` and dependencies were unversioned. Modules mode (enabled by go.mod) allows code anywhere and provides versioned, reproducible dependency management. GOPATH mode is effectively deprecated."
    },

    {
        cat: "Modules", q: "What does `go mod vendor` do?",
        opts: ["Uploads dependencies to a vendor CDN", "Copies all dependencies into a ./vendor directory for use with -mod=vendor builds", "Removes the module cache", "Creates a monorepo layout"], ans: 1,
        exp: "`go mod vendor` copies all module dependencies into a `vendor/` directory. Builds with `-mod=vendor` use this local copy instead of the module cache. Useful for hermetic builds, air-gapped environments, or Go version compatibility."
    },

    {
        cat: "Modules", q: "What is the module proxy (GOPROXY)?",
        opts: ["A local development proxy for HTTP", "A service that caches and serves module versions, with `proxy.golang.org` as the default, improving availability and security", "A proxy for the Go runtime", "A load balancer for Go servers"], ans: 1,
        exp: "`GOPROXY` specifies one or more module proxies. The default is `https://proxy.golang.org,direct`—first tries the public Google proxy (which caches modules), then falls back to direct VCS. Enterprises set private proxies via Artifactory, Athens, etc."
    },

    {
        cat: "Modules", q: "What is a 'retract' directive in go.mod?",
        opts: ["Removing a file from the module", "Declaring that certain module versions should not be used—appears in go.mod of the retracted version", "Reverting a dependency change", "Removing a deprecated API"], ans: 1,
        exp: "`retract` (Go 1.16+) in go.mod marks versions that authors want users to avoid (bugs, security issues, accidental publishes). `go list` and tooling warn when using retracted versions. Add a comment explaining why: `retract v1.0.0 // accidental publish`."
    },

    // ── PANIC & RECOVER ──
    {
        cat: "Panic & Recover", q: "What is a panic in Go?",
        opts: ["A compile error", "A runtime event that unwinds the stack, running deferred functions, and terminates the program unless recovered", "A checked exception", "A signal to the OS"], ans: 1,
        exp: "A panic begins unwinding the goroutine's stack, executing deferred functions as it goes. If not recovered, it prints a stack trace and terminates the program. Panics are for unrecoverable programmer errors, not normal error handling."
    },

    {
        cat: "Panic & Recover", q: "Where must `recover()` be called to catch a panic?",
        opts: ["Anywhere in the call stack", "Directly within a deferred function in the same goroutine", "In a separate goroutine", "In the main function only"], ans: 1,
        exp: "`recover()` only has effect when called directly within a deferred function. It stops the panicking sequence and returns the value passed to panic(). Calling it outside a deferred function (or in a deferred function called by a deferred function) returns nil."
    },

    {
        cat: "Panic & Recover", q: "What value does `recover()` return if no panic is occurring?",
        opts: ["An empty string", "false", "nil", "0"], ans: 2,
        exp: "`recover()` returns nil when there is no panic in progress. It only returns a non-nil value when called from a deferred function during a panic. Always check `if r := recover(); r != nil` before acting on the recovered value."
    },

    {
        cat: "Panic & Recover", q: "Can you recover from a panic in a different goroutine?",
        opts: ["Yes, using a shared channel", "Yes, using sync.Mutex", "No—panics propagate only within the goroutine where they occur; each goroutine must recover its own panics", "Yes, using runtime.SetPanicHandler"], ans: 2,
        exp: "Panics are goroutine-local. A panic in goroutine G1 cannot be recovered in G2. If G1 panics without recovery, it terminates the entire program regardless of other goroutines. Each goroutine must have its own recovery mechanism."
    },

    {
        cat: "Panic & Recover", q: "What is the idiomatic way to convert a panic back to an error?",
        opts: ["panic.ToError()", "A deferred function that calls recover() and assigns the result to a named return error variable", "fmt.Errorf(\"panic: %v\", recover())", "Using runtime.Stack to capture the panic"], ans: 1,
        exp: "Use named return values with a deferred recover: `func safe() (err error) { defer func() { if r := recover(); r != nil { err = fmt.Errorf(\"panic: %v\", r) } }(); /* risky code */ }`. This pattern is used in parsers, template engines, and frameworks."
    },

    {
        cat: "Panic & Recover", q: "Which built-in operations can cause a panic?",
        opts: ["Type assertions (single-value form), nil pointer dereferences, out-of-bounds slice/array access, division by zero, sending on a closed channel", "Only explicit panic() calls", "Array accesses only", "Out-of-memory errors only"], ans: 0,
        exp: "Go panics can be triggered by: explicit `panic(v)`, nil pointer dereference, out-of-bounds index, failed type assertion (`v := i.(T)`), integer division by zero, send on closed channel, and stack overflow. Not all runtime errors are panics—some are fatal (concurrent map writes)."
    },

    {
        cat: "Panic & Recover", q: "What is the convention for when to use panic vs returning an error?",
        opts: ["Always use panic for errors—it's faster", "Panic for programmer errors (invariant violations, impossible states); return errors for expected, recoverable conditions", "Use panic only in init functions", "Use panic when the error message is long"], ans: 1,
        exp: "The Go convention: return errors for expected failures (file not found, network error, invalid input). Panic for programmer bugs (index out of range, nil pointer in logic that should never be nil). Libraries should avoid panicking for user errors—return errors instead."
    },

    {
        cat: "Panic & Recover", q: "What happens to deferred functions when a goroutine panics?",
        opts: ["Deferred functions are skipped during panics", "Deferred functions run in LIFO order as the stack unwinds during the panic", "Only the most recently deferred function runs", "Deferred functions run after recover() is called"], ans: 1,
        exp: "During a panic, deferred functions execute in LIFO (last in, first out) order as the stack unwinds through each stack frame. This is why `defer mu.Unlock()` and `defer f.Close()` correctly run even during panics—cleanup is guaranteed."
    },

    {
        cat: "Panic & Recover", q: "What is `runtime.Stack(buf, all)` used for in panic handling?",
        opts: ["Measuring stack size", "Capturing goroutine stack traces into a buffer—useful in panic recovery to log the stack trace", "Setting the stack size limit", "Profiling stack allocations"], ans: 1,
        exp: "`runtime.Stack(buf []byte, all bool)` fills buf with the formatted stack trace of the current goroutine (all=false) or all goroutines (all=true). In a recover handler: `buf := make([]byte, 4096); n := runtime.Stack(buf, false); log.Printf(\"panic: %s\", buf[:n])`."
    },

    // ── GO INTERNALS ──
    {
        cat: "Go Internals", q: "What is an 'itab' in Go's interface implementation?",
        opts: ["An iterator for hash tables", "A cached lookup table holding a concrete type's method pointers for a specific interface", "An internal hash table bucket", "A goroutine scheduling table"], ans: 1,
        exp: "An itab (interface table) is a struct caching: a pointer to the concrete type info, a pointer to the interface type info, and an array of function pointers for the interface's methods as implemented by the concrete type. Interface calls dispatch through the itab."
    },

    {
        cat: "Go Internals", q: "What is the internal representation of a Go map?",
        opts: ["A sorted array of key-value pairs", "A hash table using chained buckets (8 key-value pairs per bucket) with overflow buckets", "A B-tree", "A skip list"], ans: 1,
        exp: "Go maps are hash tables with buckets, each holding 8 key-value pairs. Keys are stored together, then values together (for alignment). Overflow buckets handle hash collisions. The map grows by doubling bucket count when the load factor exceeds 6.5."
    },

    {
        cat: "Go Internals", q: "What is a 'defer frame' overhead?",
        opts: ["Memory allocated per deferred call on the heap (pre-1.14) or the stack", "The time to garbage collect deferred functions", "Network latency in deferred HTTP calls", "Compilation overhead"], ans: 0,
        exp: "Before Go 1.14, each defer allocated a defer record on the heap, adding ~50ns overhead. Go 1.14 introduced 'open-coded defers': for simple cases, defer calls are inlined by the compiler with no allocation. Only complex cases (loops, etc.) still use heap allocation."
    },

    {
        cat: "Go Internals", q: "What is a 'fat pointer' in Go?",
        opts: ["A pointer to a large struct", "A two-word pair: (type, data pointer) used for interfaces and slices", "A pointer stored in a map", "A pointer with GC metadata"], ans: 1,
        exp: "Go uses fat pointers (two-word pairs) for interfaces `(type, value)` and for slices `(ptr, len, cap—3 words actually)`. Unlike C's single-word pointer, these carry metadata needed for type dispatch and bounds checking respectively."
    },

    {
        cat: "Go Internals", q: "What is the purpose of the `//go:noescape` compiler directive?",
        opts: ["Prevents the function from returning errors", "Hints to the compiler that no arguments escape to the heap—used in assembly-implemented functions to improve escape analysis", "Disables GC for the function", "Prevents the function from panicking"], ans: 1,
        exp: "`//go:noescape` tells the escape analyzer that none of the function's pointer parameters escape to the heap. It's used for low-level functions (often implemented in assembly) where the analyzer can't inspect the body. Improves escape analysis for callers."
    },

    {
        cat: "Go Internals", q: "What does `//go:nosplit` prevent?",
        opts: ["Stack splitting—prevents the goroutine's stack from growing", "Function inlining", "Heap allocation", "Garbage collection during the function"], ans: 0,
        exp: "`//go:nosplit` instructs the compiler not to insert stack growth checks. Used for functions that must execute in a very constrained environment (e.g., during GC, in signal handlers). The function must guarantee its stack usage fits in the current stack segment."
    },

    {
        cat: "Go Internals", q: "What is the Go calling convention for function arguments?",
        opts: ["All arguments on the stack (Go 1.16 and earlier); register-based ABI since Go 1.17 on amd64", "Always on the stack", "Always in registers", "Depends on the number of arguments"], ans: 0,
        exp: "Before Go 1.17, all arguments and return values were passed on the stack. Go 1.17+ introduced a register-based calling ABI on amd64 (and later arm64), passing the first ~9 integer/pointer arguments in registers, significantly reducing function call overhead."
    },

    {
        cat: "Go Internals", q: "What is a 'write barrier' in Go's GC?",
        opts: ["A mutex preventing concurrent writes", "Code inserted by the compiler before pointer writes to notify the GC of pointer graph changes during concurrent marking", "A hardware memory fence", "An atomic operation on pointers"], ans: 1,
        exp: "During concurrent GC marking, the mutator (program) can modify pointer graphs. Write barriers are compiler-inserted hooks that execute before pointer stores, notifying the GC of new references. This ensures the tri-color invariant is maintained and no live objects are missed."
    },

    {
        cat: "Go Internals", q: "What is `unsafe.Pointer` used for?",
        opts: ["Creating unsafe goroutines", "A special pointer type that bypasses Go's type system, enabling conversion between any pointer types and uintptr—used for interfacing with C and low-level optimizations", "Allocating unmanaged memory", "Bypassing the GC"], ans: 1,
        exp: "`unsafe.Pointer` is Go's escape hatch from type safety. Any pointer can be converted to `unsafe.Pointer` and then to any other pointer type. It's used for C interop (cgo), atomic pointer operations, and rare performance optimizations. Usage is narrowly defined by rules in the unsafe package docs."
    },

    {
        cat: "Go Internals", q: "What is the 'finalizer' race condition and how is it avoided?",
        opts: ["Finalizers competing with GC", "A finalizer can run as soon as the last reference to an object disappears, even while methods are executing; use runtime.KeepAlive to prevent premature finalization", "Finalizers running before defers", "Two finalizers for the same object"], ans: 1,
        exp: "The GC can determine an object is unreachable and schedule its finalizer before the last use is syntactically complete if the compiler optimizes away the 'live' use. `runtime.KeepAlive(obj)` at the end of a function ensures obj is considered live up to that point."
    },

    {
        cat: "Go Internals", q: "What does the `strings.Builder` type optimize compared to `+` string concatenation?",
        opts: ["String encoding", "Avoids repeated memory allocations by using an internal []byte buffer that grows, vs + which creates a new string on every concatenation", "String hashing", "Unicode normalization"], ans: 1,
        exp: "String concatenation with `+` in a loop creates O(n) intermediate strings with O(n²) total copies. `strings.Builder` maintains an internal `[]byte` buffer, appending to it and converting to string only at the end with `String()`—O(n) total allocations."
    },

    {
        cat: "Go Internals", q: "What is the purpose of `runtime/debug.SetMemLimit` (Go 1.19+)?",
        opts: ["Sets the maximum goroutine count", "Sets a soft memory limit for the Go runtime, causing the GC to run more aggressively to stay under the limit", "Prevents heap allocations above the limit", "Sets the OS virtual memory limit"], ans: 1,
        exp: "`runtime/debug.SetMemLimit(limit)` (Go 1.19+) sets a soft memory limit. When the runtime's memory use approaches the limit, the GC runs more aggressively. This helps in containerized environments with strict memory limits, preventing OOM kills by keeping Go within bounds."
    },

    {
        cat: "Go Internals", q: "What is a 'span' in Go's memory allocator?",
        opts: ["A range of bytes in a string", "A contiguous region of memory pages managed by the runtime allocator, used to serve small object allocations of a specific size class", "A network packet span", "A range of goroutine IDs"], ans: 1,
        exp: "Go's allocator (based on tcmalloc) divides the heap into spans—contiguous page runs. Each span serves objects of one size class (e.g., 32-byte objects). This reduces fragmentation and makes allocation O(1) by finding the right span for a request size."
    },

    {
        cat: "Go Internals", q: "What is the difference between `make` and `new` in Go?",
        opts: ["new allocates on the stack; make on the heap", "new allocates zeroed memory and returns a pointer to any type; make initializes and returns (not a pointer to) slices, maps, and channels", "make is for structs; new is for primitives", "They are identical"], ans: 1,
        exp: "`new(T)` allocates zeroed memory for type T and returns *T. `make(T, ...)` is for slices, maps, and channels—it allocates and initializes the internal data structures (not just zero-fills) and returns a T (not *T). You can't use make for structs."
    },

    {
        cat: "Go Internals", q: "What is inlining in Go compilation?",
        opts: ["Embedding assembly code", "Replacing a function call site with the function body directly, eliminating call overhead and enabling further optimizations", "Copying struct values", "Embedding files in binaries"], ans: 1,
        exp: "Inlining substitutes a function call with the function's body at compile time, eliminating call overhead (stack frame setup, argument passing) and enabling further optimizations like constant folding. Go inlines small functions automatically; `//go:noinline` prevents it."
    },

    {
        cat: "Go Internals", q: "What is the 'heap profiler' sampling rate controlled by?",
        opts: ["GOGC environment variable", "runtime.MemProfileRate—allocations are sampled every N bytes; default 512KB", "go test -memprofile", "GODEBUG=memprofile"], ans: 1,
        exp: "`runtime.MemProfileRate` controls heap profiler sampling: profile one allocation per MemProfileRate bytes allocated. Default is 512KB—not every allocation is recorded. Set to 1 to profile every allocation (high overhead). Accessible via pprof's heap profile."
    },

    {
        cat: "Go Internals", q: "What does `GODEBUG=gctrace=1` output?",
        opts: ["A file with GC events", "A line to stderr for each GC cycle showing heap size, pause duration, and GC timing", "Go version and debug info", "Memory allocation trace"], ans: 1,
        exp: "`GODEBUG=gctrace=1` prints one line per GC cycle to stderr: wall clock time, heap before/after GC, pause durations for STW phases, and GC CPU utilization. Useful for diagnosing GC pressure without a full profiler."
    },

    {
        cat: "Go Internals", q: "What is the purpose of `sync.Mutex`'s 'starvation mode' (Go 1.9+)?",
        opts: ["Preventing goroutines from starving memory", "Ensuring that goroutines waiting for a mutex don't get indefinitely bypassed by newly arriving goroutines—waiters get priority after 1ms", "Preventing deadlocks", "Limiting mutex hold time"], ans: 1,
        exp: "Before Go 1.9, a mutex could be repeatedly re-acquired by new goroutines, starving waiting goroutines. Starvation mode (Go 1.9+): if a goroutine waits > 1ms, the mutex enters starvation mode, passing ownership directly to the longest waiting goroutine. Prevents starvation."
    }
];

window.QUIZ_DATA = ALL_QUESTIONS;