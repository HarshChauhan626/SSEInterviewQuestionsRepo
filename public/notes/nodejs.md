# Node.js Core Interview Questions & Answers

---

## Basics

### 1. What is Node.js?
Node.js is an open-source, cross-platform **JavaScript runtime environment** built on Chrome's V8 engine. It allows JavaScript to run outside the browser — on servers, CLIs, and desktop apps. It uses an **event-driven, non-blocking I/O model**, making it well-suited for scalable network applications.

---

### 2. Why is Node.js single-threaded?
Node.js was designed to handle many concurrent connections without the overhead of multi-threading. Traditional servers spawn a new thread per connection, which consumes memory and CPU for context switching. Node.js uses a **single main thread** with an event loop to handle concurrency through asynchronous, non-blocking I/O — making it lightweight and efficient.

---

### 3. How does Node.js work internally?
1. Your JS code runs on the **V8 engine** (single-threaded).
2. When an async operation (file read, network call) is encountered, it's handed off to **libuv**.
3. libuv manages the **event loop** and uses a **thread pool** (or OS async APIs) to handle I/O.
4. Once the operation completes, the callback is pushed to the appropriate queue.
5. The event loop picks up the callback and runs it on the main thread.

---

### 4. What is the V8 engine?
V8 is Google's open-source **JavaScript engine**, written in C++. It compiles JavaScript directly to native machine code using **JIT (Just-In-Time) compilation** rather than interpreting it, making execution extremely fast. Node.js embeds V8 to execute JS outside the browser.

---

### 5. What makes Node.js fast?
- **V8 JIT compilation** — JS compiled to machine code at runtime.
- **Non-blocking I/O** — threads aren't blocked waiting for I/O.
- **Event loop** — handles thousands of concurrent connections on a single thread.
- **libuv** — efficient async I/O with OS-level primitives (epoll, kqueue, IOCP).
- **Minimal overhead** — no heavy thread management per request.

---

### 6. Difference between Node.js and browser JavaScript

| Feature | Node.js | Browser JS |
|---|---|---|
| Environment | Server-side | Client-side |
| Global object | `global` | `window` |
| DOM access | ❌ No | ✅ Yes |
| File system access | ✅ Yes (fs module) | ❌ No |
| Module system | CommonJS / ESM | ESM (or bundlers) |
| APIs | `http`, `fs`, `os`, `path` | `fetch`, `localStorage`, `document` |

---

### 7. When should you use Node.js?
- Real-time applications (chat, gaming, live notifications)
- REST APIs and microservices
- Streaming applications (audio/video)
- I/O-heavy workloads
- CLI tools
- Proxy servers
- Anywhere JavaScript is used full-stack (sharing code between client and server)

---

### 8. When should you NOT use Node.js?
- **CPU-intensive tasks** (image processing, ML, video encoding) — blocks the event loop.
- Applications requiring heavy computation or complex numerical algorithms.
- When a mature, battle-tested language ecosystem is more appropriate (e.g., Python for data science, Java for enterprise).

---

## Event Loop & Async

### 9. What is the event loop?
The event loop is the mechanism that allows Node.js to perform **non-blocking I/O** despite being single-threaded. It continuously checks if the call stack is empty, then picks up callbacks from queues and pushes them onto the stack for execution. It is the heart of Node.js's async model.

---

### 10. Explain each phase of the event loop

The event loop has these phases (in order):

1. **timers** — Executes callbacks from `setTimeout` and `setInterval` whose delay has expired.
2. **pending callbacks** — Executes I/O callbacks deferred from the previous iteration.
3. **idle, prepare** — Internal use only.
4. **poll** — Retrieves new I/O events; executes I/O-related callbacks. Blocks here if no timers are pending.
5. **check** — Executes `setImmediate` callbacks.
6. **close callbacks** — Executes close event callbacks (e.g., `socket.on('close', ...)`).

Between each phase, Node.js processes **microtask queues**: `process.nextTick` first, then Promise `.then` callbacks.

---

### 11. What are blocking and non-blocking operations?
- **Blocking**: The execution waits for the operation to complete before moving to the next line. Example: `fs.readFileSync()`.
- **Non-blocking**: The operation is initiated and control is returned immediately. A callback is invoked when the operation completes. Example: `fs.readFile()`.

---

### 12. What is asynchronous programming?
Asynchronous programming allows a program to **start a task and move on** without waiting for it to finish. When the task completes, the program is notified (via a callback, Promise, or event). This prevents blocking and enables handling multiple operations concurrently.

---

### 13. Difference between synchronous and asynchronous code

| | Synchronous | Asynchronous |
|---|---|---|
| Execution | Sequential, blocking | Non-blocking, concurrent |
| Performance | Poor under I/O load | Excellent under I/O load |
| Error handling | try/catch | Callbacks, `.catch()`, try/await |
| Example | `fs.readFileSync()` | `fs.readFile()` |

---

### 14. What are callbacks?
A callback is a **function passed as an argument** to another function, to be called when an asynchronous operation completes.

```js
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

---

### 15. What is callback hell?
Callback hell (also called the "pyramid of doom") is when callbacks are **nested inside each other** multiple levels deep, making code hard to read, debug, and maintain.

```js
getUser(id, (user) => {
  getOrders(user, (orders) => {
    getDetails(orders[0], (details) => {
      // deeply nested...
    });
  });
});
```

---

### 16. How do Promises solve callback hell?
Promises allow chaining with `.then()` instead of nesting, making the code **flat and readable**:

```js
getUser(id)
  .then(user => getOrders(user))
  .then(orders => getDetails(orders[0]))
  .then(details => console.log(details))
  .catch(err => console.error(err));
```

---

### 17. What are async/await?
`async/await` is syntactic sugar over Promises that makes async code look and behave like synchronous code:

```js
async function main() {
  try {
    const user = await getUser(id);
    const orders = await getOrders(user);
    const details = await getDetails(orders[0]);
    console.log(details);
  } catch (err) {
    console.error(err);
  }
}
```

A function marked `async` always returns a Promise. `await` pauses execution within that function until the Promise resolves.

---

### 18. What is the difference between Promise and async/await?
They are functionally equivalent — `async/await` is built on Promises. The difference is **syntax and readability**. `async/await` is cleaner for sequential async flows; Promises with `.then()` can be more natural for parallel operations or when you don't need `await`.

---

### 19. What is Promise chaining?
Promise chaining is linking multiple `.then()` calls where **each handler returns a new value or Promise**, passing results down the chain:

```js
fetch(url)
  .then(res => res.json())
  .then(data => processData(data))
  .then(result => saveResult(result))
  .catch(handleError);
```

---

### 20. What is Promise.all()?
`Promise.all(iterable)` takes an array of Promises and returns a single Promise that:
- **Resolves** when **all** input Promises resolve (returns array of results).
- **Rejects** immediately if **any** input Promise rejects (fail-fast).

```js
const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);
```

---

### 21. Difference between Promise.all, allSettled, race, and any

| Method | Resolves when | Rejects when |
|---|---|---|
| `Promise.all` | All resolve | Any rejects (fail-fast) |
| `Promise.allSettled` | All settle (resolve or reject) | Never rejects |
| `Promise.race` | First settles (resolve or reject) | First rejects |
| `Promise.any` | First resolves | All reject |

---

### 22. What happens when a Promise fails?
If a Promise rejects and there is no `.catch()` handler or `try/catch` with `await`, it results in an **UnhandledPromiseRejection** warning (and in newer Node.js versions, crashes the process). Always handle rejections.

---

### 23. What are microtasks in Node.js?
Microtasks are high-priority tasks that run **before the event loop moves to the next phase**. They include:
- `process.nextTick()` callbacks
- Promise `.then()` / `.catch()` / `.finally()` callbacks

Microtasks are processed after every phase transition of the event loop.

---

### 24. What are macrotasks?
Macrotasks (also called tasks) are processed **one per event loop iteration**. They include:
- `setTimeout` callbacks
- `setInterval` callbacks
- `setImmediate` callbacks
- I/O callbacks

---

### 25. Difference between setTimeout and setImmediate
- `setTimeout(fn, 0)` — schedules callback in the **timers phase**. Even with 0ms delay, it's subject to OS timer resolution (~1ms minimum).
- `setImmediate(fn)` — schedules callback in the **check phase**, which runs after the poll phase.

In I/O callbacks, `setImmediate` always runs before `setTimeout(fn, 0)`. Outside I/O, order is non-deterministic.

---

### 26. What is process.nextTick()?
`process.nextTick(fn)` schedules a callback to run **at the end of the current operation**, before the event loop continues to the next phase. It has higher priority than Promise microtasks.

```js
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));
// Output: nextTick, then promise
```

---

### 27. Execution order of nextTick, Promise, setTimeout, and setImmediate

```js
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
```

**Output:**
```
nextTick
promise
setTimeout  (or setImmediate — non-deterministic outside I/O)
setImmediate
```

Order: `nextTick` → Promise microtasks → timers/setImmediate (phase-dependent).

---

### 28. What is the call stack?
The call stack is a **LIFO (Last In, First Out) data structure** that tracks function execution. When a function is called, it's pushed onto the stack. When it returns, it's popped off. Node.js's single-threaded execution means only one function runs at a time on the call stack.

---

### 29. What is the callback queue?
The callback queue (task queue) holds **callbacks from async operations** (timers, I/O) that are ready to execute. The event loop picks from this queue only when the call stack is empty.

---

### 30. What is the event queue?
The event queue is essentially the same as the callback queue/task queue — it holds ready-to-execute callbacks that the event loop processes. In Node.js's context, there are multiple queues per event loop phase (timers queue, poll queue, check queue, etc.) plus microtask queues.

---

## Node.js Architecture

### 31. Explain Node.js architecture
Node.js architecture has these layers:
- **JavaScript code** — Your application code.
- **Node.js core APIs** — Built-in modules (`fs`, `http`, `path`, etc.).
- **Node.js bindings (C/C++)** — Bridges JS and the underlying C++ libraries.
- **V8** — Executes JavaScript.
- **libuv** — Provides the event loop, thread pool, and async I/O abstraction.
- **OS** — System-level I/O (file system, networking, DNS).

---

### 32. What is libuv?
libuv is a **cross-platform C library** that provides:
- The **event loop** implementation.
- **Thread pool** (default 4 threads) for blocking operations.
- Async TCP/UDP sockets, DNS resolution, file system operations, timers, and child processes.
- OS-specific async mechanisms (epoll on Linux, kqueue on macOS, IOCP on Windows).

---

### 33. How does Node.js achieve concurrency?
Through the **event loop** and **non-blocking I/O**:
- Async operations are offloaded to libuv (thread pool or OS async APIs).
- The main thread remains free to handle other requests.
- Callbacks are queued and executed when operations complete.
- This achieves **concurrency without multi-threading** in application code.

---

### 34. Difference between concurrency and parallelism
- **Concurrency**: Multiple tasks are in progress at the same time, but not necessarily executing simultaneously. They interleave on one or more processors (Node.js event loop model).
- **Parallelism**: Tasks are executing literally at the same instant on multiple CPU cores (worker threads, cluster module).

---

### 35. What operations are handled by thread pool?
libuv's thread pool handles operations that don't have async OS support:
- File system operations (`fs` module)
- DNS lookups (`dns.lookup`)
- CPU-intensive crypto operations (`crypto` module — hashing, pbkdf2)
- Compression (`zlib`)
- User-defined C++ addon async work

Network I/O (TCP, UDP) uses OS async primitives and does **not** use the thread pool.

---

### 36. What is the default thread pool size?
The default thread pool size is **4 threads** (`UV_THREADPOOL_SIZE = 4`).

---

### 37. How can you increase thread pool size?
Set the environment variable before starting Node.js:

```bash
UV_THREADPOOL_SIZE=16 node app.js
```

Or in code (must be set before any libuv calls):

```js
process.env.UV_THREADPOOL_SIZE = 16;
```

Maximum value is 1024.

---

### 38. What is the worker thread module?
`worker_threads` is a Node.js module that enables **true parallel JavaScript execution** across multiple threads. Each worker runs in its own V8 instance and event loop, with communication via `MessageChannel`. Ideal for CPU-intensive tasks.

```js
const { Worker } = require('worker_threads');
const worker = new Worker('./heavy-task.js');
worker.on('message', result => console.log(result));
```

---

### 39. Difference between worker threads and child processes

| | Worker Threads | Child Processes |
|---|---|---|
| Memory | Shared (`SharedArrayBuffer`) | Separate memory spaces |
| Startup | Lightweight | Heavier (new process) |
| Communication | Fast (shared memory / messages) | IPC (slower) |
| Use case | CPU-intensive JS tasks | Running separate programs |
| Isolation | Low | High |

---

### 40. What are child processes?
Child processes allow Node.js to **spawn new OS processes** to run commands or other Node.js scripts. Useful for running shell commands, scripts, or CPU-heavy tasks in isolation. Communication happens via IPC (stdin/stdout/stderr).

---

### 41. Types of child processes in Node.js
The `child_process` module provides:
- `spawn` — Stream-based; launches a command.
- `exec` — Buffers output; runs command in a shell.
- `execFile` — Like `exec` but directly executes a file (no shell).
- `fork` — Special `spawn` for Node.js scripts with built-in IPC channel.

---

### 42. Difference between spawn, exec, execFile, and fork

| Method | Shell | Output | Use Case |
|---|---|---|---|
| `spawn` | No | Streaming | Large output, long-running |
| `exec` | Yes | Buffered | Short commands with shell features |
| `execFile` | No | Buffered | Execute binary files directly |
| `fork` | No | IPC messages | Run Node.js child with IPC |

---

## Modules

### 43. What are modules in Node.js?
Modules are **reusable blocks of code** that encapsulate functionality. Each file in Node.js is a separate module with its own scope. Modules can export functionality and import from other modules, preventing global scope pollution.

---

### 44. What is CommonJS?
CommonJS (CJS) is the **original module system** for Node.js. Files use `.js` extension, `require()` for imports, and `module.exports` for exports. It loads modules **synchronously**.

```js
// math.js
module.exports = { add: (a, b) => a + b };

// app.js
const { add } = require('./math');
```

---

### 45. What is require()?
`require()` is a built-in function in CommonJS that **loads and caches a module**. It resolves the path, loads the file, wraps it in a function, executes it, and returns `module.exports`. Subsequent calls return the cached module.

---

### 46. What is module.exports?
`module.exports` is the **object returned by `require()`** when loading a module. You assign what you want to export to it.

```js
module.exports = function greet(name) {
  return `Hello, ${name}`;
};
```

---

### 47. Difference between exports and module.exports
- `exports` is a **shorthand reference** to `module.exports`.
- You can add properties to `exports`: `exports.foo = bar` (works fine).
- But if you **reassign** `exports = something`, you break the reference — `require()` still returns the original `module.exports`.
- Always use `module.exports` when exporting a single value or replacing the entire export.

---

### 48. What are ES Modules?
ES Modules (ESM) is the **official ECMAScript module standard**. Uses `import`/`export` syntax, files use `.mjs` extension or `"type": "module"` in `package.json`. Loads **asynchronously** and supports static analysis.

```js
// math.mjs
export const add = (a, b) => a + b;

// app.mjs
import { add } from './math.mjs';
```

---

### 49. Difference between CommonJS and ES Modules

| Feature | CommonJS | ES Modules |
|---|---|---|
| Syntax | `require` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| Execution | Runtime | Static (parse time) |
| Default in Node.js | Yes (legacy) | With `.mjs` or `"type":"module"` |
| Tree shaking | No | Yes |
| `__dirname` / `__filename` | Available | Not available (use `import.meta.url`) |

---

### 50. What is dynamic import()?
`import()` is an **async function** that loads a module at runtime (works in both CJS and ESM):

```js
const module = await import('./heavy-module.js');
module.doSomething();
```

Useful for **lazy loading** and conditional imports.

---

### 51. How does module caching work?
After a module is first `require()`d, it is **cached** in `require.cache` (keyed by resolved filename). Subsequent `require()` calls return the cached `module.exports` without re-executing the file. This means modules are singletons.

---

### 52. How do you clear module cache?
```js
delete require.cache[require.resolve('./myModule')];
```

After deletion, the next `require('./myModule')` re-executes the file. Used in testing or hot-reload scenarios.

---

### 53. What is circular dependency in modules?
Circular dependency occurs when **Module A requires Module B, and Module B requires Module A**. Node.js handles this by returning a **partially populated `module.exports`** at the point of the circular reference, which can cause unexpected `undefined` values if not handled carefully.

---

## File System (fs)

### 54. What is the fs module?
The `fs` (File System) module is a **built-in Node.js module** that provides APIs to interact with the file system — reading, writing, deleting, renaming files and directories, watching for changes, and more.

---

### 55. Difference between synchronous and asynchronous fs methods
- **Synchronous** (`fs.readFileSync`) — Blocks the event loop until complete. Use only in startup scripts or CLI tools.
- **Asynchronous** (`fs.readFile`) — Non-blocking; callback/Promise is called when done. Use in servers and production code.

---

### 56. How do you read files in Node.js?
```js
// Async (callback)
fs.readFile('file.txt', 'utf8', (err, data) => console.log(data));

// Async (Promise)
const data = await fs.promises.readFile('file.txt', 'utf8');

// Sync
const data = fs.readFileSync('file.txt', 'utf8');
```

---

### 57. How do you write files?
```js
// Async
fs.writeFile('file.txt', 'Hello', (err) => { if (err) throw err; });

// Append
fs.appendFile('file.txt', '\nMore data', (err) => {});

// Sync
fs.writeFileSync('file.txt', 'Hello');
```

---

### 58. Difference between readFile and createReadStream
- `readFile` — Reads the **entire file into memory** before returning. Fine for small files.
- `createReadStream` — Reads the file in **chunks** (as a stream). Memory-efficient for large files. Allows processing data as it arrives.

---

### 59. What are streams?
Streams are **objects that handle reading/writing data sequentially** in chunks, rather than all at once. They're ideal for large data (files, network responses) because they process data piece by piece without loading everything into memory.

---

### 60. Types of streams in Node.js
1. **Readable** — Data can be read from (e.g., `fs.createReadStream`, `http.IncomingMessage`).
2. **Writable** — Data can be written to (e.g., `fs.createWriteStream`, `http.ServerResponse`).
3. **Duplex** — Both readable and writable (e.g., TCP sockets).
4. **Transform** — Duplex stream that modifies data as it passes through (e.g., `zlib.createGzip`).

---

### 61. What is piping in streams?
Piping connects a **Readable stream to a Writable stream**, automatically forwarding data chunks and handling backpressure:

```js
const readable = fs.createReadStream('input.txt');
const writable = fs.createWriteStream('output.txt');
readable.pipe(writable);
```

---

### 62. What is backpressure?
Backpressure occurs when a **Writable stream can't consume data as fast as a Readable produces it**. The Readable should pause until the Writable drains. Node.js streams handle this automatically via `pipe()`. If ignored, it leads to excessive memory usage.

---

### 63. How does stream buffering work?
Each stream has an internal buffer with a **highWaterMark** (default 16KB for byte streams). Data is buffered until consumed. For Readable streams, if the buffer fills and isn't consumed, the stream pauses. For Writable streams, `write()` returns `false` when the buffer is full (signal to pause the source).

---

### 64. What are buffers?
Buffers are **fixed-size chunks of memory** in Node.js (outside the V8 heap) for handling binary data. Used when dealing with raw bytes — TCP streams, file I/O, image data, etc.

```js
const buf = Buffer.from('Hello', 'utf8');
console.log(buf); // <Buffer 48 65 6c 6c 6f>
```

---

### 65. Difference between buffer and stream
- **Buffer**: A fixed-size, in-memory container for binary data. Holds data statically.
- **Stream**: A continuous flow of data chunks over time. Uses buffers internally but processes data incrementally.

A stream uses buffers to temporarily hold chunks as they flow through.

---

## Events

### 66. What is EventEmitter?
`EventEmitter` is a **core Node.js class** (`events` module) that implements the observer/pub-sub pattern. Objects can emit named events and listeners can subscribe to them.

```js
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.on('data', (msg) => console.log(msg));
emitter.emit('data', 'Hello!');
```

---

### 67. How does event-driven programming work?
In event-driven programming, the flow of the program is determined by **events** (user input, I/O completion, messages). Producers emit events; consumers register listeners. The event loop drives execution — no polling, just waiting and reacting. This decouples components and enables async, reactive behavior.

---

### 68. Difference between emit and on
- `emitter.on(event, listener)` — **Registers** a listener for the event (persistent).
- `emitter.emit(event, ...args)` — **Triggers** the event, calling all registered listeners synchronously.

---

### 69. What is once() in EventEmitter?
`emitter.once(event, listener)` registers a listener that is **automatically removed after being called once**:

```js
emitter.once('connect', () => console.log('Connected!'));
```

---

### 70. How do you remove listeners?
```js
function handler() { console.log('event'); }

emitter.on('event', handler);
emitter.off('event', handler);         // or
emitter.removeListener('event', handler);
emitter.removeAllListeners('event');   // remove all
```

---

### 71. What causes memory leak warnings in EventEmitter?
By default, Node.js warns when more than **10 listeners** are added to a single event. This is a safeguard against accidentally adding listeners in loops without removing them, causing a memory leak. Warning: `MaxListenersExceededWarning`.

---

### 72. What is the max listener limit?
Default is **10**. Change it with:

```js
emitter.setMaxListeners(20);
EventEmitter.defaultMaxListeners = 20; // globally
```

Set to `0` for unlimited (use with caution).

---

## Timers

### 73. How does setTimeout work internally?
`setTimeout(fn, delay)` registers the callback with libuv's timer mechanism. After `delay` milliseconds, the callback is added to the **timers queue**. The event loop processes it in the **timers phase**. The actual delay may be slightly longer than specified due to OS scheduling and event loop overhead.

---

### 74. How does setInterval work?
`setInterval(fn, interval)` repeatedly schedules a callback every `interval` milliseconds. Internally, after each execution, the next timer is re-registered. If the callback takes longer than the interval, executions may stack up (though Node.js won't call it again until the current one finishes).

---

### 75. Difference between setImmediate and setTimeout(fn, 0)
Both execute "soon," but in different event loop phases:
- `setTimeout(fn, 0)` — Runs in the **timers phase** (subject to min ~1ms delay).
- `setImmediate(fn)` — Runs in the **check phase**, after I/O events.

Inside an I/O callback, `setImmediate` **always** runs first. Outside, the order is non-deterministic.

---

### 76. What is clearTimeout?
`clearTimeout(id)` cancels a timer before it fires. `setTimeout` returns a `Timeout` object (or integer ID) that you pass to `clearTimeout`:

```js
const id = setTimeout(() => console.log('fired'), 5000);
clearTimeout(id); // cancelled
```

Similarly, `clearInterval` cancels `setInterval`, and `clearImmediate` cancels `setImmediate`.

---

### 77. What keeps Node.js process alive?
Node.js stays alive as long as there are:
- Pending callbacks (timers, I/O, `setImmediate`)
- Active server listeners (e.g., `http.createServer().listen()`)
- Active handles (sockets, file watchers)
- Worker threads running

Once all queues are empty and no handles are active, Node.js exits.

---

## Process & OS

### 78. What is the process object?
`process` is a **global object** in Node.js providing information and control over the current Node.js process — environment variables, command-line args, stdin/stdout, exit codes, memory usage, and lifecycle events.

---

### 79. Commonly used process methods/properties
- `process.argv` — Command-line arguments.
- `process.env` — Environment variables.
- `process.cwd()` — Current working directory.
- `process.exit(code)` — Exit with a status code.
- `process.pid` — Process ID.
- `process.platform` — OS platform (linux, darwin, win32).
- `process.memoryUsage()` — Memory usage stats.
- `process.uptime()` — Process uptime in seconds.
- `process.nextTick(fn)` — Schedule microtask.
- `process.on('uncaughtException', fn)` — Handle uncaught errors.

---

### 80. What is process.env?
`process.env` is an object containing the **environment variables** of the process. Used to store configuration (database URLs, API keys, feature flags) outside the codebase:

```js
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
```

---

### 81. What is process.cwd()?
`process.cwd()` returns the **current working directory** — the directory from which the Node.js process was launched. Can change if `process.chdir()` is called.

---

### 82. Difference between __dirname and process.cwd()
- `__dirname` — The **directory of the current file** (the module). Fixed, regardless of where the process was started.
- `process.cwd()` — The **directory where `node` was run from**. Can be different from `__dirname`.

Use `__dirname` for file paths relative to the source file. Use `process.cwd()` for paths relative to the working directory.

---

### 83. What is process.exit()?
`process.exit(code)` immediately **terminates the Node.js process** with the given exit code. Code `0` = success; non-zero = error. Pending async operations are abandoned (no cleanup).

---

### 84. What are exit codes?
Exit codes are integer values returned by a process to the OS on exit:
- `0` — Success.
- `1` — Uncaught fatal exception.
- `2` — Misuse of shell built-ins.
- `3-10` — Various internal Node.js error codes.
- User-defined codes can be set via `process.exitCode` or `process.exit(code)`.

---

### 85. How do you handle uncaught exceptions?
```js
process.on('uncaughtException', (err) => {
  console.error('Uncaught:', err);
  // Perform cleanup
  process.exit(1); // Always exit after uncaughtException
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
```

> **Warning**: After `uncaughtException`, the process is in an undefined state. Always exit after logging/cleanup.

---

### 86. What is process.memoryUsage()?
Returns an object with memory stats (in bytes):
```js
{
  rss: 30720000,        // Resident Set Size (total memory)
  heapTotal: 7159808,   // Total heap allocated by V8
  heapUsed: 4914392,    // Heap actually used
  external: 915416,     // Memory used by C++ objects
  arrayBuffers: 9386    // Memory for ArrayBuffers/SharedArrayBuffers
}
```

---

### 87. How do you monitor CPU and memory usage?
- `process.memoryUsage()` — Memory snapshot.
- `process.cpuUsage()` — CPU time used.
- **External tools**: `clinic.js`, `0x`, `heapdump`, `node --prof`.
- **APM**: New Relic, Datadog, PM2 monitoring.
- **Built-in**: `--inspect` flag + Chrome DevTools / VS Code debugger.

---

## Error Handling

### 88. Types of errors in Node.js
1. **Syntax errors** — Code can't be parsed (e.g., missing brackets).
2. **Runtime errors** — Thrown during execution (e.g., `TypeError`, `ReferenceError`).
3. **Operational errors** — Expected failures (network timeout, file not found, invalid user input).
4. **Programmer errors** — Bugs in code (off-by-one, wrong type passed).

---

### 89. How do you handle async errors?
- **Callbacks**: Check the first `err` argument.
- **Promises**: Use `.catch()`.
- **async/await**: Wrap in `try/catch`.
- **Global**: `process.on('unhandledRejection', ...)`.

---

### 90. What is try-catch limitation with async code?
`try/catch` **cannot catch errors in callbacks** or un-awaited Promises:

```js
try {
  setTimeout(() => { throw new Error('oops'); }, 100); // NOT caught!
} catch (e) {
  console.log('caught'); // Never runs
}
```

`try/catch` only works with `await` in async functions or synchronous code.

---

### 91. What is unhandledPromiseRejection?
When a Promise is rejected and **no `.catch()` or `try/catch` handles it**, Node.js emits `unhandledRejection`. In Node.js 15+, this **crashes the process** by default (same as an uncaught exception). Handle via `process.on('unhandledRejection', ...)`.

---

### 92. Difference between operational and programmer errors
- **Operational errors**: Expected, runtime problems a program must handle gracefully (file not found, network timeout, invalid input). Recover from them.
- **Programmer errors**: Bugs — accessing `.length` on `undefined`, wrong argument types. These should crash the process (fix the code, not catch the error).

---

### 93. What is custom error handling?
Creating custom error classes for domain-specific errors:

```js
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

throw new ValidationError('Invalid email', 'email');
```

Allows `instanceof` checks and structured error handling.

---

## Memory Management

### 94. How does garbage collection work in Node.js?
Node.js uses **V8's garbage collector**, which employs a **generational GC** strategy:
- **Young generation (Scavenge)**: New objects live here. GC runs frequently and quickly, promoting surviving objects to the old generation.
- **Old generation (Mark-Sweep/Mark-Compact)**: Long-lived objects. GC runs less frequently but takes longer.

The GC automatically frees memory no longer reachable from the root references.

---

### 95. What causes memory leaks?
Memory leaks occur when objects are **unintentionally kept in memory** and never garbage collected:
- Forgotten timers/intervals with references.
- Unbounded caches (Maps/arrays that grow forever).
- Event listeners not removed.
- Closures holding references to large objects.
- Global variables accumulating data.

---

### 96. Common memory leak scenarios
1. `setInterval` holding references without `clearInterval`.
2. Accumulating event listeners on EventEmitter without removing them.
3. Module-level arrays/maps used as caches with no eviction.
4. Closures capturing large objects longer than necessary.
5. Storing user session data in global scope.

---

### 97. How do closures cause memory leaks?
Closures retain references to their **outer scope's variables**. If a closure is stored (e.g., as a callback or event listener) and the outer scope holds a reference to a large object, that object is kept alive even if no longer needed:

```js
function init() {
  const bigData = new Array(1000000).fill('*');
  return () => console.log('using closure'); // bigData stays in memory!
}
const fn = init(); // bigData never GC'd as long as fn exists
```

---

### 98. How do global variables affect memory?
Global variables are **never garbage collected** during the process lifetime. Accumulating data in globals (caches, logs, session data) causes steady memory growth. Always prefer scoped variables and bounded data structures.

---

### 99. How do you debug memory leaks?
1. `--inspect` flag + Chrome DevTools Memory tab (heap snapshots, allocation timelines).
2. `node --heap-prof` — Generate V8 heap profile.
3. `heapdump` npm package — Capture heap snapshots programmatically.
4. `clinic.js` / `0x` — Flame graphs and profiling.
5. Monitor `process.memoryUsage().heapUsed` over time.
6. Look for steady growth in RSS after requests.

---

### 100. What is heap memory?
The **heap** is where V8 dynamically allocates memory for objects, closures, and arrays. It's managed by the garbage collector. The heap has a default size limit (around 1.5GB on 64-bit). Increase with `--max-old-space-size=4096` (MB).

---

### 101. Difference between stack and heap

| | Stack | Heap |
|---|---|---|
| Stores | Primitive values, function call frames | Objects, arrays, closures |
| Management | Automatic (LIFO) | Garbage collected |
| Size | Small, fixed | Large, dynamic |
| Speed | Very fast | Slower |
| Scope | Local to function | Reference-based lifetime |

---

## Performance

### 102. How do you optimize Node.js applications?
- Use **async/non-blocking** operations everywhere.
- **Stream** large data instead of buffering.
- Use **clustering** to utilize all CPU cores.
- **Cache** frequently accessed data (Redis, in-memory).
- Offload CPU tasks to **worker threads**.
- Profile with `--inspect` and fix hot paths.
- Use connection pooling for databases.
- Enable HTTP/2 and compression (gzip/brotli).
- Use a **reverse proxy** (Nginx) for static files.

---

### 103. Why are streams memory efficient?
Streams process data **chunk by chunk** rather than loading everything into memory. For a 1GB file, `readFile` loads the whole GB into RAM, while `createReadStream` only ever holds one chunk (~16KB) in memory at a time. This allows processing files larger than available RAM and keeps heap usage flat.

---

### 104. What is clustering?
Clustering spawns **multiple Node.js processes** (workers), each on a separate CPU core, all sharing the same server port. The master process distributes incoming connections among workers, utilizing multi-core CPUs.

---

### 105. How does cluster module work?
```js
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork(); // Spawn a worker per CPU
  }
} else {
  require('./server'); // Each worker runs the server
}
```

Workers share the same port; the OS distributes connections (or the master with explicit IPC).

---

### 106. Difference between cluster and worker threads

| | Cluster | Worker Threads |
|---|---|---|
| Unit | Separate OS processes | Threads in the same process |
| Memory | Independent | Shareable (`SharedArrayBuffer`) |
| Use case | Scale HTTP servers across CPUs | CPU-intensive JS computation |
| Fault isolation | High (crash one worker, others live) | Lower |
| Communication | IPC (serialized) | Fast (shared memory or messages) |

---

### 107. What is load balancing in Node.js?
Load balancing distributes incoming requests across multiple server instances/workers to prevent overload. In Node.js:
- **Cluster module** — OS-level round-robin across worker processes.
- **PM2** — Process manager with built-in load balancing.
- **Nginx / HAProxy** — External reverse proxy distributing across Node.js instances.

---

### 108. CPU-bound vs I/O-bound tasks
- **I/O-bound**: Performance limited by input/output speed (database queries, file reads, network calls). Node.js excels here — async I/O lets it handle thousands concurrently.
- **CPU-bound**: Performance limited by processor speed (image encoding, encryption, sorting large datasets). These block the event loop — use worker threads or offload to a separate service.

---

### 109. Why is Node.js not ideal for CPU-intensive tasks?
Node.js runs JS on a **single thread**. A CPU-intensive operation blocks the event loop — no other requests can be handled until it completes. This kills throughput. Solutions: worker threads, child processes, or dedicated microservices in a CPU-optimized language.

---

### 110. How do you profile Node.js applications?
- `node --inspect app.js` + Chrome DevTools (`chrome://inspect`) — CPU profiles, heap snapshots.
- `node --prof app.js` → `node --prof-process isolate-*.log` — V8 profiler.
- `clinic.js` — All-in-one profiling (Doctor, Flame, Bubbleprof).
- `0x` — Flamegraph profiler.
- `autocannon` / `wrk` — Load testing to identify bottlenecks.
- `perf_hooks` module — Custom performance measurements.

---

## Networking

### 111. What is the HTTP module?
The `http` module is a **built-in Node.js module** for creating HTTP servers and making HTTP requests. It provides low-level control over the HTTP protocol without needing a framework like Express.

---

### 112. How do you create a server using core Node.js?
```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!\n');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

### 113. What happens internally when a request hits a Node.js server?
1. OS receives a TCP connection and notifies libuv.
2. libuv adds the connection event to the event loop.
3. Node.js's `http` module parses the HTTP request (headers, method, URL).
4. The `request` event is emitted on the server.
5. Your callback runs on the main thread.
6. The response is sent back through the TCP socket.
7. The connection is closed or kept alive (keep-alive).

---

### 114. What are sockets?
Sockets are **endpoints for communication** between two machines over a network. A socket has an IP address and port number. In Node.js, the `net` module provides TCP sockets and the `dgram` module provides UDP sockets. `socket.io` builds real-time bidirectional communication over WebSockets.

---

### 115. What is TCP?
TCP (Transmission Control Protocol) is a **connection-oriented, reliable transport protocol**. It guarantees:
- Data is delivered in order.
- No data is lost (retransmission).
- Error detection.
- Flow and congestion control.
Used for HTTP, HTTPS, databases, SSH. Node.js's `net` module provides raw TCP.

---

### 116. Difference between TCP and UDP

| | TCP | UDP |
|---|---|---|
| Connection | Connection-oriented | Connectionless |
| Reliability | Guaranteed delivery | Best-effort |
| Order | In-order | No guarantee |
| Speed | Slower (overhead) | Faster |
| Use case | HTTP, email, databases | DNS, video streaming, gaming |

---

### 117. What is DNS lookup in Node.js?
`dns.lookup(hostname, callback)` resolves a hostname to an IP address using the OS's resolver (same as `getaddrinfo`). It uses libuv's **thread pool**. `dns.resolve()` uses Node.js's own async DNS resolver (no thread pool, faster under load).

```js
const dns = require('dns');
dns.lookup('google.com', (err, address) => console.log(address));
```

---

## Advanced Core Topics

### 118. What is REPL in Node.js?
REPL stands for **Read-Eval-Print Loop** — an interactive shell that reads input, evaluates it as JavaScript, prints the result, and loops. Launch it by running `node` with no arguments. Useful for quick experiments and debugging.

---

### 119. What are environment variables?
Environment variables are **key-value pairs** set in the OS environment, accessible in Node.js via `process.env`. They externalize configuration (secrets, URLs, feature flags) from code. Typically managed via `.env` files (loaded with `dotenv` package) in development.

```bash
DATABASE_URL=postgres://localhost:5432/mydb node app.js
```

---

### 120. What is middleware conceptually in Node.js?
Middleware is a **function that sits in the request-response pipeline**, processing requests before they reach the final handler. Each middleware can:
- Execute code.
- Modify `req`/`res`.
- End the request-response cycle.
- Call the next middleware (`next()`).

Conceptually: `request → middleware1 → middleware2 → handler → response`.

---

### 121. What is dependency injection?
Dependency injection (DI) is a pattern where a function or class **receives its dependencies** from the outside rather than creating them internally:

```js
// Without DI (hard to test)
class UserService { constructor() { this.db = new Database(); } }

// With DI (testable)
class UserService { constructor(db) { this.db = db; } }
```

This decouples components, improves testability, and makes code more flexible.

---

### 122. What is hot reloading?
Hot reloading automatically **restarts or updates the application** when source files change, without manual restarts. Tools:
- `nodemon` — Watches files and restarts the Node.js process.
- `node --watch` — Built-in (Node.js 18+).
- `ts-node-dev` — For TypeScript projects.

---

### 123. What is graceful shutdown?
Graceful shutdown means **cleanly stopping the server** without dropping active connections:
1. Stop accepting new requests.
2. Wait for in-flight requests to complete.
3. Close database connections and other resources.
4. Exit.

```js
process.on('SIGTERM', () => {
  server.close(() => {
    db.disconnect();
    process.exit(0);
  });
});
```

---

### 124. What are signals like SIGINT and SIGTERM?
Unix signals are **OS-level notifications** sent to a process:
- `SIGINT` — Interrupt (Ctrl+C). Default: terminate.
- `SIGTERM` — Termination request (e.g., `kill <pid>`, Docker stop). Default: terminate.
- `SIGKILL` — Forceful kill (cannot be caught or ignored).
- `SIGHUP` — Terminal hangup (often used to reload config).

Handle in Node.js: `process.on('SIGTERM', handler)`.

---

### 125. What is stdin, stdout, stderr?
- `process.stdin` — Readable stream for **standard input** (keyboard, pipe).
- `process.stdout` — Writable stream for **standard output** (`console.log` writes here).
- `process.stderr` — Writable stream for **standard error** (`console.error` writes here).

These are the three standard I/O streams every Unix process has.

---

### 126. How does Node.js handle large concurrent connections?
Via the **event loop and non-blocking I/O**:
- Each connection doesn't get a dedicated thread.
- Connections are handled as events.
- libuv uses OS mechanisms (epoll, kqueue) to monitor thousands of sockets simultaneously.
- Only when I/O is ready does the callback run on the main thread.
- This allows a single Node.js process to handle **tens of thousands of concurrent connections** with minimal memory.

---

### 127. What are native addons in Node.js?
Native addons are **C/C++ modules** compiled to `.node` files and loaded via `require()`. They allow:
- Using existing C/C++ libraries.
- Performing CPU-intensive tasks in native code.
- Accessing low-level OS APIs.

Built with `node-gyp`. Modern alternative: **NAPI (Node-API)** for ABI-stable addons. Examples: `bcrypt`, `sharp`, `better-sqlite3`.

---

### 128. What is the difference between Node.js and Deno?

| Feature | Node.js | Deno |
|---|---|---|
| Created by | Ryan Dahl (2009) | Ryan Dahl (2018) |
| Language | JS / C++ | JS/TS / Rust |
| Module system | CommonJS / ESM | ESM only (URLs) |
| TypeScript | Via transpiler | Native support |
| Security | Full access by default | Sandboxed (explicit permissions) |
| Package manager | npm | Built-in (URL imports, `deno.land/x`) |
| Standard library | Third-party (`lodash`, etc.) | Built-in, vetted |

---

### 129. What is the purpose of package.json?
`package.json` is the **manifest file** for a Node.js project. It contains:
- `name`, `version` — Package identity.
- `main` / `exports` — Entry points.
- `scripts` — npm scripts (`start`, `test`, `build`).
- `dependencies` — Runtime packages.
- `devDependencies` — Development-only packages.
- `engines` — Required Node.js/npm versions.
- Metadata: `description`, `license`, `author`, `keywords`.

---

### 130. What happens during npm install internally?
1. `package.json` is read; the dependency tree is resolved.
2. `package-lock.json` is consulted (or generated) to **lock exact versions**.
3. npm checks the local cache (`~/.npm`) for packages.
4. Missing packages are fetched from the **npm registry** (registry.npmjs.org).
5. Packages are extracted to `node_modules/`.
6. Lifecycle scripts (`preinstall`, `install`, `postinstall`) are run.
7. `package-lock.json` is updated.

---

*End of Node.js Core Interview Questions & Answers*