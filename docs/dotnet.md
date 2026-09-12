# .NET / C# Interview Reference Guide

---

## Part 1: OOP & C# Fundamentals

### 1. What are the 4 pillars of OOP?

| Pillar | Description |
|---|---|
| **Encapsulation** | Bundling data and methods together; hiding internal state via access modifiers |
| **Abstraction** | Exposing only what's necessary; hiding complexity behind interfaces/abstract classes |
| **Inheritance** | A class deriving from another to reuse and extend behavior |
| **Polymorphism** | One interface, many implementations — same method call behaves differently depending on the object |

---

### 2. Difference between abstraction and encapsulation?

- **Abstraction** is about *what* an object does — it hides complexity by exposing only relevant operations (via interfaces or abstract classes). Think: "I can call `Drive()` on a car without knowing how the engine works."
- **Encapsulation** is about *how* the object protects its state — it bundles data with methods and restricts direct access using `private`/`protected`. Think: "The car's engine internals are hidden behind a casing."

```csharp
// Abstraction: consumer only sees the interface
public interface IPaymentGateway {
    bool ProcessPayment(decimal amount);
}

// Encapsulation: internal balance is hidden, mutated only through methods
public class BankAccount {
    private decimal _balance;
    public void Deposit(decimal amount) => _balance += amount;
    public decimal GetBalance() => _balance;
}
```

---

### 3. Difference between interface and abstract class?

| Feature | Interface | Abstract Class |
|---|---|---|
| Multiple inheritance | ✅ Yes | ❌ No (single only) |
| Constructor | ❌ No | ✅ Yes |
| Fields | ❌ No (only properties) | ✅ Yes |
| Access modifiers on members | All public by default | Any modifier |
| Default implementation | ✅ (C# 8+) | ✅ |
| Use when | Defining a capability/contract | Sharing base logic + enforcing structure |

**Rule of thumb:** Use an interface when you want to say "this thing *can do* X". Use an abstract class when you want to say "this thing *is a kind of* X and shares common code."

```csharp
public interface ILoggable {
    void Log(string message);
}

public abstract class BaseService {
    protected readonly ILogger _logger;
    protected BaseService(ILogger logger) => _logger = logger;
    public abstract void Execute(); // must be implemented
    public void LogStart() => _logger.LogInformation("Starting...");
}
```

---

### 4. Difference between method overloading and overriding?

- **Overloading** — same method name, different parameters (resolved at compile time / static dispatch).
- **Overriding** — subclass replaces a `virtual`/`abstract` method from the base class (resolved at runtime / dynamic dispatch).

```csharp
// Overloading (compile time)
public int Add(int a, int b) => a + b;
public double Add(double a, double b) => a + b;

// Overriding (runtime)
public class Animal {
    public virtual string Speak() => "...";
}
public class Dog : Animal {
    public override string Speak() => "Woof";
}
```

---

### 5. What is polymorphism?

Polymorphism means "many forms" — the ability of different types to be treated as the same base type, while each provides its own behavior.

- **Compile-time (static):** Method overloading, operator overloading.
- **Runtime (dynamic):** Method overriding via `virtual`/`override`.

```csharp
List<Animal> animals = new() { new Dog(), new Cat() };
foreach (var a in animals)
    Console.WriteLine(a.Speak()); // calls the correct override per type
```

This is essential for writing extensible, open/closed-principle-compliant code.

---

### 6. What is inheritance?

Inheritance lets a class (child/derived) acquire the fields, properties, and methods of another class (parent/base), enabling code reuse and establishing an "is-a" relationship.

```csharp
public class Vehicle {
    public int Speed { get; set; }
    public void Accelerate() => Speed += 10;
}

public class Car : Vehicle {
    public int Doors { get; set; }
}

var car = new Car();
car.Accelerate(); // inherited from Vehicle
```

C# supports single class inheritance but multiple interface implementation.

---

### 7. Difference between `==` and `.Equals()`?

| | `==` | `.Equals()` |
|---|---|---|
| **Value types** | Compares values | Compares values |
| **Reference types (default)** | Compares references (same object?) | Compares references (unless overridden) |
| **`string`** | Compares content (overloaded) | Compares content |
| **Null safety** | Safe (no NullReferenceException) | Throws if called on null |

```csharp
string a = new string("hello");
string b = new string("hello");

Console.WriteLine(a == b);        // True  (string overloads ==)
Console.WriteLine(a.Equals(b));   // True
Console.WriteLine(ReferenceEquals(a, b)); // False (different objects)
```

For custom types: override both `==` and `Equals()` together, and also `GetHashCode()`.

---

### 8. Difference between value type and reference type?

| | Value Type | Reference Type |
|---|---|---|
| **Stored in** | Stack (or inline in containing object) | Heap |
| **Assignment** | Copies the value | Copies the reference |
| **Examples** | `int`, `double`, `bool`, `struct`, `enum` | `class`, `string`, `array`, `interface` |
| **Default value** | Zero/false/null-equivalent | `null` |
| **Nullability** | Not nullable by default (`int?` for nullable) | Nullable by default |

```csharp
int x = 5;
int y = x; // y is a copy; changing y doesn't affect x

var list1 = new List<int> { 1, 2, 3 };
var list2 = list1; // both point to same list; list2.Add(4) affects list1
```

---

### 9. What is boxing and unboxing?

- **Boxing:** Converting a value type to `object` (or an interface type). The value is copied to the heap, wrapped in an object.
- **Unboxing:** Extracting the value type back from the object. Requires explicit cast.

```csharp
int num = 42;
object boxed = num;        // boxing — heap allocation
int unboxed = (int)boxed;  // unboxing — explicit cast required
```

**Performance impact:** Boxing allocates memory on the heap and involves GC pressure. In hot paths, avoid boxing by using generics (`List<int>` instead of `ArrayList`).

---

### 10. What are delegates and events?

**Delegate:** A type-safe function pointer — a reference to a method with a specific signature.

```csharp
public delegate int MathOperation(int a, int b);

MathOperation add = (a, b) => a + b;
Console.WriteLine(add(3, 4)); // 7
```

**Event:** A delegate wrapped with publish/subscribe semantics. External code can subscribe (`+=`) or unsubscribe (`-=`) but cannot invoke directly.

```csharp
public class Button {
    public event EventHandler Clicked;
    public void Click() => Clicked?.Invoke(this, EventArgs.Empty);
}

var btn = new Button();
btn.Clicked += (s, e) => Console.WriteLine("Button clicked!");
btn.Click();
```

Built-in generic delegates: `Action<T>` (no return), `Func<T, TResult>` (with return), `Predicate<T>` (returns bool).

---

### 11. What is a lambda expression?

A lambda is an inline anonymous function using the `=>` syntax. Syntactic sugar over anonymous delegates.

```csharp
// Without lambda
Func<int, int> square = delegate(int x) { return x * x; };

// With lambda (expression)
Func<int, int> square = x => x * x;

// With lambda (statement body)
Func<int, int> square = x => { return x * x; };

// Used heavily in LINQ
var evens = numbers.Where(n => n % 2 == 0).ToList();
```

Lambdas can capture variables from the enclosing scope (closures), which has GC implications if references are held longer than expected.

---

### 12. What is LINQ?

Language Integrated Query — a unified syntax for querying collections, databases, XML, and more directly in C#.

```csharp
var people = new List<Person> { ... };

// Query syntax
var adults = from p in people
             where p.Age >= 18
             orderby p.Name
             select p.Name;

// Method syntax (more common)
var adults = people
    .Where(p => p.Age >= 18)
    .OrderBy(p => p.Name)
    .Select(p => p.Name);
```

LINQ is lazy (deferred execution) — the query is not evaluated until iterated. Call `.ToList()` or `.ToArray()` to force evaluation.

---

### 13. Difference between `IEnumerable` and `IQueryable`?

| | `IEnumerable<T>` | `IQueryable<T>` |
|---|---|---|
| **Namespace** | `System.Collections.Generic` | `System.Linq` |
| **Execution** | In-memory (client-side) | Translated to query (e.g., SQL) |
| **Use case** | In-memory collections | EF Core / ORM queries |
| **Filtering** | Loads all data, then filters | Filters at the database |
| **Performance** | Slower for large DB datasets | Much more efficient |

```csharp
// IQueryable — SQL: SELECT * WHERE Age > 18
IQueryable<User> query = dbContext.Users.Where(u => u.Age > 18);

// IEnumerable — loads ALL users into memory, then filters
IEnumerable<User> users = dbContext.Users.ToList().Where(u => u.Age > 18);
```

**Rule:** Keep the query as `IQueryable` as long as possible before calling `.ToList()`.

---

### 14. What is async/await?

`async`/`await` is C#'s way of writing asynchronous code that reads like synchronous code. It's built on `Task`-returning methods and state machines generated by the compiler.

```csharp
public async Task<string> GetDataAsync(string url) {
    using var client = new HttpClient();
    string result = await client.GetStringAsync(url); // doesn't block thread
    return result;
}
```

- `await` suspends the method and releases the thread back to the thread pool while the I/O completes.
- The method resumes (possibly on a different thread) when the awaited task completes.
- The compiler transforms the method into a state machine under the hood.

---

### 15. Difference between Task, Thread, and async?

| | `Thread` | `Task` | `async/await` |
|---|---|---|---|
| **Abstraction level** | Low | Medium | High |
| **Thread pool** | No (own thread) | Yes | Yes |
| **Return value** | No | Yes (`Task<T>`) | Yes |
| **Cancellation** | Manual | `CancellationToken` | `CancellationToken` |
| **Best for** | Long-running CPU work | CPU or I/O work | I/O-bound async work |

```csharp
// Thread — manual, heavyweight
new Thread(() => DoWork()).Start();

// Task — pool-based
Task.Run(() => DoWork());

// async/await — idiomatic for I/O
await httpClient.GetAsync(url);
```

In modern .NET, prefer `async/await` + `Task`. Use raw `Thread` only for long-running, dedicated CPU work.

---

### 16. What is dependency injection?

DI is a design pattern where an object's dependencies are provided externally rather than created internally. It decouples components, making them testable and replaceable.

```csharp
// Without DI (tightly coupled)
public class OrderService {
    private readonly EmailSender _emailSender = new EmailSender(); // hardcoded
}

// With DI (loosely coupled)
public class OrderService {
    private readonly IEmailSender _emailSender;
    public OrderService(IEmailSender emailSender) => _emailSender = emailSender;
}

// Registration in ASP.NET Core
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
```

Benefits: testability (inject mocks), replaceability, single responsibility.

---

### 17. What is garbage collection?

The .NET GC automatically manages memory by tracking object references and reclaiming memory for objects that are no longer reachable.

**Generations:**
- **Gen 0:** Short-lived objects (most GC happens here, very fast).
- **Gen 1:** Objects that survived Gen 0.
- **Gen 2:** Long-lived objects (full GC, most expensive).
- **LOH (Large Object Heap):** Objects ≥ 85 KB; collected with Gen 2.

**Key points:**
- GC is non-deterministic — you don't control when it runs.
- Implement `IDisposable` + `using` for deterministic release of unmanaged resources (file handles, DB connections).
- `GC.Collect()` exists but should almost never be called manually.

---

### 18. What are generics?

Generics allow you to write type-safe, reusable code without specifying the actual type until usage.

```csharp
// Without generics — loses type safety
public class Box {
    private object _value;
    public void Set(object v) => _value = v;
    public object Get() => _value;
}

// With generics — type safe, no boxing
public class Box<T> {
    private T _value;
    public void Set(T v) => _value = v;
    public T Get() => _value;
}

var intBox = new Box<int>();
intBox.Set(42);
int val = intBox.Get(); // no cast needed
```

Generic constraints (`where T : class`, `where T : new()`, `where T : IComparable`) let you restrict what types are allowed.

---

### 19. What is reflection?

Reflection allows inspecting and interacting with type metadata at runtime — discovering classes, methods, properties, and invoking them dynamically.

```csharp
Type type = typeof(MyClass);
Console.WriteLine(type.Name);

// Get all public methods
foreach (var method in type.GetMethods())
    Console.WriteLine(method.Name);

// Invoke a method dynamically
var instance = Activator.CreateInstance(type);
type.GetMethod("MyMethod")?.Invoke(instance, null);
```

**Use cases:** Serialization, ORMs, dependency injection containers, plugin systems, unit testing frameworks.

**Downside:** Slow (bypasses compile-time checks), no IntelliSense, runtime errors instead of compile errors. Use sparingly.

---

### 20. Difference between `const`, `readonly`, and `static`?

| | `const` | `readonly` | `static` |
|---|---|---|---|
| **Set when** | Compile time | Declaration or constructor | N/A (modifier, not about mutability) |
| **Instance or type** | Type-level (implicitly static) | Instance or static | Type-level |
| **Value can change** | Never | After construction: No | Yes (unless also readonly) |
| **Reference types** | Only primitives & strings | Any type | Any type |

```csharp
public class Config {
    public const int MaxRetries = 3;          // compile-time constant
    public readonly DateTime StartedAt;       // set once in constructor
    public static int InstanceCount;          // shared across all instances

    public Config() {
        StartedAt = DateTime.UtcNow;
        InstanceCount++;
    }
}
```

---

## Part 2: ASP.NET Core

### 1. What is ASP.NET Core?

ASP.NET Core is a cross-platform, open-source, high-performance framework for building web APIs, web apps, and microservices. It's a complete rewrite of ASP.NET 4.x — modular, lightweight, and built from the ground up for cloud/container environments.

---

### 2. Difference between .NET Framework and .NET Core?

| | .NET Framework | .NET Core / .NET 5+ |
|---|---|---|
| **Platform** | Windows only | Cross-platform (Windows, Linux, macOS) |
| **Open source** | Partially | Fully open source |
| **Deployment** | GAC, machine-wide | Self-contained or framework-dependent |
| **Performance** | Good | Significantly better |
| **Future** | Maintenance only | Active development |
| **Side-by-side versioning** | No | Yes |

.NET 5+ unified the two stacks. "ASP.NET Core" now refers to the modern, cross-platform framework.

---

### 3. Why is .NET Core cross-platform?

.NET Core was designed with platform abstraction from day one:
- The **CLR (CoreCLR)** is ported to Linux and macOS.
- The **BCL (Base Class Libraries)** use platform abstractions (PAL) to wrap OS-specific system calls.
- **Kestrel** (the web server) is implemented entirely in managed C# with platform-neutral I/O via libuv/epoll/kqueue.
- **Build tooling** (dotnet CLI, MSBuild) runs on all platforms.

---

### 4. Explain middleware in ASP.NET Core.

Middleware is a component in the HTTP request pipeline that can inspect, modify, or short-circuit requests and responses. Each middleware decides whether to pass the request to the next component.

```csharp
// Custom middleware
app.Use(async (context, next) => {
    Console.WriteLine($"Before: {context.Request.Path}");
    await next(context); // call next middleware
    Console.WriteLine($"After: {context.Response.StatusCode}");
});

// Terminal middleware (no next)
app.Run(async context => {
    await context.Response.WriteAsync("Hello!");
});
```

**Common built-in middleware:** `UseAuthentication`, `UseAuthorization`, `UseRouting`, `UseCors`, `UseStaticFiles`, `UseExceptionHandler`.

Order matters — middleware executes in registration order on the way in, and in reverse order on the way out.

---

### 5. Request lifecycle in ASP.NET Core?

```
Client Request
    ↓
Kestrel (HTTP server)
    ↓
Middleware Pipeline (in order):
  - Exception Handling
  - HTTPS Redirection
  - Static Files
  - Routing
  - Authentication
  - Authorization
  - Endpoint (Controller Action / Minimal API)
    ↓
Model Binding → Action Filters → Controller Action → Result Filters → Response
    ↑
Response travels back up through middleware (in reverse)
    ↑
Kestrel sends response to Client
```

---

### 6. What is dependency injection in ASP.NET Core?

ASP.NET Core has a built-in IoC container. Services are registered in `Program.cs` and injected via constructor injection.

```csharp
// Register
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
builder.Services.AddSingleton<IMemoryCache, MemoryCache>();

// Inject (constructor injection)
public class OrderController : ControllerBase {
    private readonly IOrderRepository _repo;
    public OrderController(IOrderRepository repo) => _repo = repo;
}
```

---

### 7. What are service lifetimes?

**Singleton:** One instance for the entire application lifetime. Shared across all requests.
```csharp
builder.Services.AddSingleton<IMyCache, MyCache>();
```
Use for: caches, configuration objects, stateless services.

**Scoped:** One instance per HTTP request. Created when the request starts, disposed when it ends.
```csharp
builder.Services.AddScoped<IDbContext, AppDbContext>();
```
Use for: DbContext, unit-of-work objects.

**Transient:** A new instance every time it's requested from the container.
```csharp
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();
```
Use for: lightweight, stateless services.

> ⚠️ **Captive Dependency:** Never inject a Scoped or Transient service into a Singleton — the short-lived service gets captured for the Singleton's lifetime.

---

### 8. What is Kestrel server?

Kestrel is ASP.NET Core's built-in, cross-platform HTTP web server written in managed C#. It's used as the default edge server or behind a reverse proxy (nginx, IIS, Azure Front Door).

- Extremely high throughput (often ranked in TechEmpower benchmarks).
- Supports HTTP/1.1, HTTP/2, HTTP/3 (QUIC).
- In production: typically placed behind a reverse proxy for SSL termination, load balancing, and static file serving.

---

### 9. What is `appsettings.json`?

`appsettings.json` is the primary configuration file for ASP.NET Core apps — a JSON file for storing app settings like connection strings, feature flags, logging levels, and custom config.

```json
{
  "ConnectionStrings": {
    "Default": "Server=.;Database=MyDb;Trusted_Connection=True;"
  },
  "Logging": {
    "LogLevel": { "Default": "Information" }
  },
  "FeatureFlags": {
    "EnableNewCheckout": true
  }
}
```

Environment-specific overrides: `appsettings.Development.json`, `appsettings.Production.json`.

---

### 10. How does configuration work?

Configuration is built as a layered system — later sources override earlier ones.

**Default load order:**
1. `appsettings.json`
2. `appsettings.{Environment}.json`
3. Environment variables
4. Command-line arguments
5. User secrets (Development only)

```csharp
// Strongly-typed config binding
builder.Services.Configure<JwtOptions>(
    builder.Configuration.GetSection("Jwt"));

// Injecting
public class AuthService {
    private readonly JwtOptions _opts;
    public AuthService(IOptions<JwtOptions> opts) => _opts = opts.Value;
}
```

---

### 11. What is routing?

Routing maps incoming HTTP requests to the correct endpoint (controller action or minimal API handler) based on URL pattern and HTTP method.

```csharp
// Minimal API
app.MapGet("/users/{id}", async (int id, IUserService svc) => 
    await svc.GetByIdAsync(id));

// Controller routing
[Route("api/[controller]")]
public class UsersController : ControllerBase {
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id) { ... }
}
```

---

### 12. Attribute routing vs conventional routing?

**Conventional routing** — defined centrally in `Program.cs`, uses route templates like `{controller}/{action}/{id?}`. Common in MVC apps.

```csharp
app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");
```

**Attribute routing** — routes defined directly on controllers/actions with `[Route]`, `[HttpGet]`, etc. More explicit, preferred for Web APIs.

```csharp
[Route("api/orders")]
public class OrdersController : ControllerBase {
    [HttpGet("{id:int}")]
    public IActionResult GetOrder(int id) { ... }
}
```

Attribute routing gives more control, is self-documenting, and is the standard for REST APIs.

---

### 13. What are filters?

Filters run code at specific stages of the action execution pipeline — before or after model binding, action execution, result execution, or exception handling.

| Filter Type | Runs When |
|---|---|
| `IActionFilter` | Before/after action method |
| `IResultFilter` | Before/after result execution |
| `IExceptionFilter` | On unhandled exceptions |
| `IAuthorizationFilter` | Before action, checks authorization |
| `IResourceFilter` | Early in pipeline, can short-circuit |

```csharp
public class LogActionFilter : IActionFilter {
    public void OnActionExecuting(ActionExecutingContext ctx) 
        => Console.WriteLine($"Executing: {ctx.ActionDescriptor.DisplayName}");
    public void OnActionExecuted(ActionExecutedContext ctx) 
        => Console.WriteLine("Executed");
}
```

Apply with `[ServiceFilter(typeof(...))]` or globally in `AddControllers(o => o.Filters.Add(...))`.

---

### 14. What is model binding?

Model binding automatically maps incoming HTTP request data (route values, query strings, form data, JSON body) to action method parameters or model objects.

```csharp
// Binds from route, query, and body automatically
[HttpPost("{categoryId}")]
public IActionResult Create(
    int categoryId,                      // from route
    [FromQuery] bool notifyUser,         // from query string
    [FromBody] CreateProductDto dto)     // from JSON body
{ ... }
```

**Data annotations** on models enable automatic validation:
```csharp
public class CreateProductDto {
    [Required] public string Name { get; set; }
    [Range(0.01, 10000)] public decimal Price { get; set; }
}
```

---

### 15. What is DTO?

A Data Transfer Object is a plain class used to shape data moving between layers (e.g., API request/response) — keeping your domain model separate from what's exposed to the client.

```csharp
// Domain model (internal)
public class User {
    public int Id { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; } // never expose this!
}

// DTO (external-facing)
public class UserResponseDto {
    public int Id { get; set; }
    public string Email { get; set; }
}
```

Benefits: security (never accidentally leak sensitive fields), versioning flexibility, reduced coupling.

---

### 16. What is AutoMapper?

AutoMapper is a library that eliminates boilerplate code for mapping between objects (e.g., domain model → DTO).

```csharp
// Profile configuration
public class MappingProfile : Profile {
    public MappingProfile() {
        CreateMap<User, UserResponseDto>();
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
    }
}

// Registration
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Usage
var dto = _mapper.Map<UserResponseDto>(user);
```

Alternative: **Mapster** (faster, zero-config); or manual mapping for complex cases.

---

### 17. How do you handle exceptions globally?

**Option 1: Exception Handler Middleware** (recommended for APIs)

```csharp
app.UseExceptionHandler(appBuilder => {
    appBuilder.Run(async context => {
        var error = context.Features.Get<IExceptionHandlerFeature>();
        context.Response.StatusCode = error?.Error switch {
            NotFoundException => 404,
            ValidationException => 400,
            _ => 500
        };
        await context.Response.WriteAsJsonAsync(new { 
            message = error?.Error.Message 
        });
    });
});
```

**Option 2: `IExceptionFilter`** — applied to specific controllers.

**Option 3: `IMiddleware`** — custom middleware for full control.

**Option 4: Problem Details** (RFC 7807) via `AddProblemDetails()` — standardized error responses.

---

### 18. What is authentication vs authorization?

- **Authentication:** *Who are you?* — verifying identity (JWT, cookies, API keys, OAuth).
- **Authorization:** *What can you do?* — verifying permissions (roles, policies, claims).

```csharp
// Authentication setup
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { ... });

// Authorization
[Authorize(Roles = "Admin")]
public IActionResult AdminOnly() => Ok();

[Authorize(Policy = "MinAge18")]
public IActionResult AdultsOnly() => Ok();
```

`UseAuthentication()` must come before `UseAuthorization()` in middleware pipeline.

---

### 19. JWT authentication flow?

```
1. Client POSTs credentials → /auth/login
2. Server validates credentials
3. Server generates JWT:
   - Header: { alg: "HS256", typ: "JWT" }
   - Payload: { sub: userId, roles, exp, iat }
   - Signature: HMACSHA256(base64(header) + "." + base64(payload), secretKey)
4. Server returns: { accessToken, refreshToken }
5. Client stores tokens (memory or httpOnly cookie)
6. Client sends: Authorization: Bearer <accessToken> on subsequent requests
7. Server validates signature, checks expiry, extracts claims
8. When access token expires, client sends refresh token → /auth/refresh
9. Server validates refresh token, issues new access token
```

```csharp
var token = new JwtSecurityToken(
    issuer: _config["Jwt:Issuer"],
    audience: _config["Jwt:Audience"],
    claims: claims,
    expires: DateTime.UtcNow.AddMinutes(15),
    signingCredentials: new SigningCredentials(
        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"])),
        SecurityAlgorithms.HmacSha256));
```

---

### 20. What is CORS?

Cross-Origin Resource Sharing is a browser security mechanism that controls whether a web page can make requests to a different domain than the one that served it.

```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("https://myapp.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

CORS is enforced by the browser — it doesn't protect server-to-server communication.

---

### 21. What is Swagger?

Swagger (OpenAPI) generates interactive API documentation from your code. In .NET, `Swashbuckle` or `NSwag` auto-generates the OpenAPI spec from controllers and models.

```csharp
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new() { Title = "My API", Version = "v1" });
    // Add JWT support to swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme { ... });
});

app.UseSwagger();
app.UseSwaggerUI();
```

Access at `/swagger` — provides a UI to test endpoints directly.

---

### 22. What is API versioning?

API versioning allows evolving your API without breaking existing clients.

```csharp
builder.Services.AddApiVersioning(options => {
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

// URL segment versioning: /api/v1/users
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class UsersController : ControllerBase { ... }

// Header versioning: X-Api-Version: 2.0
// Query string: /api/users?api-version=2.0
```

Strategies: URL segment (most explicit), header, query string, media type.

---

### 23. How do you secure APIs?

- **Authentication:** JWT / OAuth2 / API keys
- **Authorization:** Role-based (`[Authorize(Roles = "Admin")]`) or policy-based
- **HTTPS:** Always enforce; redirect HTTP → HTTPS
- **Rate limiting:** Prevent abuse and DDoS
- **Input validation:** Model validation + `[ApiController]` auto-validation
- **CORS:** Whitelist allowed origins
- **Secrets management:** Never commit secrets; use Azure Key Vault / AWS Secrets Manager / environment variables
- **SQL injection:** Use parameterized queries / EF Core (never string concatenation)
- **Sensitive data:** Never log or expose PII; use DTOs to control what's returned
- **Dependency updates:** Regularly patch NuGet packages

---

### 24. What is rate limiting?

Rate limiting caps how many requests a client can make in a time window — prevents abuse, DDoS, and ensures fair usage.

**.NET 7+ built-in rate limiting:**
```csharp
builder.Services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("fixed", config => {
        config.PermitLimit = 100;
        config.Window = TimeSpan.FromMinutes(1);
        config.QueueLimit = 0;
    });
});

app.UseRateLimiter();

[EnableRateLimiting("fixed")]
public class OrdersController : ControllerBase { ... }
```

Strategies: Fixed window, Sliding window, Token bucket, Concurrency limiter.

---

### 25. How do you validate requests?

**Data annotations (simple):**
```csharp
public class CreateUserDto {
    [Required, EmailAddress] public string Email { get; set; }
    [Required, MinLength(8)] public string Password { get; set; }
    [Range(18, 120)] public int Age { get; set; }
}
// [ApiController] automatically returns 400 on validation failure
```

**FluentValidation (complex rules):**
```csharp
public class CreateUserValidator : AbstractValidator<CreateUserDto> {
    public CreateUserValidator() {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Must contain uppercase");
        RuleFor(x => x.Age).GreaterThanOrEqualTo(18);
    }
}
```

---

## Part 3: Entity Framework Core

### 1. What is Entity Framework Core?

EF Core is Microsoft's official ORM (Object-Relational Mapper) for .NET. It maps C# classes to database tables and allows querying/manipulating data using LINQ instead of raw SQL.

```csharp
// Define entity
public class Product {
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}

// Query (translated to SQL)
var expensive = await db.Products
    .Where(p => p.Price > 100)
    .OrderBy(p => p.Name)
    .ToListAsync();
```

---

### 2. Difference between EF and Dapper?

| | EF Core | Dapper |
|---|---|---|
| **Type** | Full ORM | Micro-ORM |
| **SQL generation** | Automatic | Manual |
| **Performance** | Good (with care) | Faster (thin wrapper) |
| **Change tracking** | Yes | No |
| **Migrations** | Yes | No |
| **Learning curve** | Higher | Low |
| **Best for** | CRUD-heavy apps | Complex/custom SQL |

**Common pattern:** Use EF Core for CRUD, Dapper for complex reporting queries.

---

### 3. What is DbContext?

`DbContext` is the primary class in EF Core — it represents a session with the database, manages entity tracking, and exposes `DbSet<T>` properties for querying.

```csharp
public class AppDbContext : DbContext {
    public DbSet<User> Users { get; set; }
    public DbSet<Order> Orders { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();
        
        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId);
    }
}
```

Register: `builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(connString));`

---

### 4. What are migrations?

Migrations are C#-generated files that represent incremental changes to your database schema, allowing you to evolve the schema over time without losing data.

```bash
# Create migration
dotnet ef migrations add AddUserTable

# Apply to database
dotnet ef database update

# Rollback
dotnet ef database update PreviousMigrationName
```

Each migration has an `Up()` (apply) and `Down()` (revert) method. In production, apply migrations programmatically at startup or via CI/CD pipeline.

---

### 5. Code First vs Database First?

**Code First:** Define C# entity classes → EF generates the database schema via migrations. Standard modern approach.

**Database First:** Existing database → EF generates C# entity classes via scaffolding.
```bash
dotnet ef dbcontext scaffold "ConnectionString" Microsoft.EntityFrameworkCore.SqlServer
```

**Code First is preferred** for greenfield projects; Database First for working with existing legacy databases.

---

### 6. What is lazy loading?

Lazy loading automatically loads related entities from the database the first time the navigation property is accessed.

```csharp
// With lazy loading (requires proxies)
var order = await db.Orders.FindAsync(id);
var items = order.Items; // triggers a DB query HERE
```

**Requires:** `UseLazyLoadingProxies()` + all navigation properties must be `virtual`.

**Problem:** Can cause N+1 queries silently. Generally avoid in web APIs — prefer explicit eager loading.

---

### 7. Eager loading vs explicit loading?

**Eager loading** — loads related data in the same query using `Include()`.
```csharp
var orders = await db.Orders
    .Include(o => o.Items)
    .ThenInclude(i => i.Product)
    .ToListAsync();
// Single SQL query with JOINs
```

**Explicit loading** — load related data on demand with `LoadAsync()`.
```csharp
var order = await db.Orders.FindAsync(id);
await db.Entry(order).Collection(o => o.Items).LoadAsync();
// Two separate queries, but you control when
```

Eager loading is best when you always need the related data. Explicit is good when you conditionally need it.

---

### 8. What is tracking vs no-tracking?

**Tracking (default):** EF Core tracks changes to loaded entities. Calling `SaveChanges()` detects and persists those changes. Has memory overhead.

**No-tracking:** Entities are loaded read-only, not tracked. Faster and uses less memory.

```csharp
// No-tracking — for read-only queries
var products = await db.Products
    .AsNoTracking()
    .Where(p => p.IsActive)
    .ToListAsync();

// Default tracking — for updates
var user = await db.Users.FindAsync(id);
user.Name = "New Name";
await db.SaveChangesAsync(); // EF detects the change
```

Use `AsNoTracking()` for all GET/read endpoints — significant performance win.

---

### 9. What are navigation properties?

Navigation properties are C# properties on an entity that represent related entities, allowing you to traverse relationships.

```csharp
public class Order {
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }             // reference navigation (many-to-one)
    public List<OrderItem> Items { get; set; } // collection navigation (one-to-many)
}

// Using navigation property in query
var order = await db.Orders
    .Include(o => o.User)
    .Include(o => o.Items)
    .FirstAsync(o => o.Id == orderId);

Console.WriteLine(order.User.Email);
```

---

### 10. How does LINQ translate to SQL?

EF Core's query provider intercepts LINQ expression trees and translates them into the target database's SQL dialect.

```csharp
// C# LINQ
var result = await db.Orders
    .Where(o => o.UserId == userId && o.Status == OrderStatus.Pending)
    .OrderByDescending(o => o.CreatedAt)
    .Take(10)
    .Select(o => new { o.Id, o.Total })
    .ToListAsync();

// Generated SQL (approximate)
-- SELECT TOP 10 o.Id, o.Total
-- FROM Orders o
-- WHERE o.UserId = @p0 AND o.Status = @p1
-- ORDER BY o.CreatedAt DESC
```

If EF can't translate an expression, it throws at runtime or (dangerously) switches to client-side evaluation. Use `ToQueryString()` to inspect generated SQL during development.

---

### 11. How do you optimize EF queries?

- **Use `AsNoTracking()`** for read-only queries.
- **Project with `Select()`** — only fetch columns you need, not the whole entity.
- **Use `Include()` wisely** — don't load navigation properties you won't use.
- **Avoid N+1** — always use `Include()` instead of accessing navigation properties in a loop.
- **Use pagination** — `Skip()` + `Take()` with indexed columns.
- **Use compiled queries** for hot paths.
- **Use raw SQL** via `FromSqlRaw()` or `ExecuteSqlRaw()` for complex queries EF generates poorly.
- **Check generated SQL** with `.ToQueryString()` or EF logging.
- **Index columns** used in `Where()` and `OrderBy()`.

```csharp
// Good: only loads needed columns
var names = await db.Users
    .Where(u => u.IsActive)
    .AsNoTracking()
    .Select(u => new { u.Id, u.Name })
    .ToListAsync();
```

---

### 12. What is connection pooling?

Connection pooling reuses existing database connections instead of opening a new one for each request — dramatically reducing latency and resource usage.

In .NET, `SqlConnection` and EF Core use the **ADO.NET connection pool** by default. When a connection is "closed", it's returned to the pool, not physically closed.

```csharp
// Pool is managed automatically; configure via connection string:
"Server=.;Database=MyDb;Min Pool Size=5;Max Pool Size=100;Connection Timeout=30;"
```

With EF Core's `AddDbContextPool<T>()`, the DbContext itself is pooled (reused across requests), reducing object allocation overhead.

---

### 13. Transactions in EF Core?

```csharp
// Implicit transaction: SaveChanges wraps all changes in a transaction
await db.SaveChangesAsync(); // atomic

// Explicit transaction: multiple SaveChanges in one transaction
using var transaction = await db.Database.BeginTransactionAsync();
try {
    db.Orders.Add(order);
    await db.SaveChangesAsync();
    
    db.Inventory.Update(item);
    await db.SaveChangesAsync();
    
    await transaction.CommitAsync();
} catch {
    await transaction.RollbackAsync();
    throw;
}
```

For distributed transactions (multiple databases/services), use the **Saga pattern** or **Outbox pattern** instead of distributed transactions.

---

### 14. What causes N+1 query problems?

N+1 occurs when you load a list of N entities, then access a navigation property on each one — triggering N additional queries.

```csharp
// N+1 Problem: 1 query for orders + N queries for each user
var orders = await db.Orders.ToListAsync();          // Query 1: SELECT * FROM Orders
foreach (var order in orders) {
    Console.WriteLine(order.User.Name);              // Query 2...N+1: SELECT * FROM Users WHERE Id = ?
}

// Fix: use Include()
var orders = await db.Orders.Include(o => o.User).ToListAsync(); // Single JOIN query
```

**Detection:** Enable EF Core logging, use MiniProfiler, or use `ToQueryString()`.

---

### 15. How do you handle concurrency?

**Optimistic concurrency** (most common) — no locks; detect conflicts at save time using a `RowVersion` / `ConcurrencyToken`.

```csharp
public class Product {
    public int Id { get; set; }
    public decimal Price { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } // auto-updated by DB
}

try {
    await db.SaveChangesAsync();
} catch (DbUpdateConcurrencyException ex) {
    // Another user modified the record; resolve conflict
    var entry = ex.Entries.Single();
    var dbValues = await entry.GetDatabaseValuesAsync();
    // Decide: client wins, server wins, or merge
}
```

**Pessimistic concurrency** — use `SELECT ... WITH (UPDLOCK)` via raw SQL for high-contention scenarios.

---

## Part 4: Multithreading & Async

### 1. What is multithreading?

Multithreading is running multiple threads of execution concurrently within a single process. Each thread has its own stack but shares the process heap and resources.

In .NET, threads are managed by the **CLR ThreadPool**, which maintains a pool of worker threads to execute tasks without the overhead of creating new OS threads.

---

### 2. Difference between parallelism and concurrency?

- **Concurrency:** Dealing with multiple things *at once* — tasks make progress by interleaving (may run on a single core). Used for I/O-bound work.
- **Parallelism:** Doing multiple things *simultaneously* — tasks execute at the exact same time on multiple cores. Used for CPU-bound work.

```csharp
// Concurrency (async I/O — single thread, but handling multiple I/O operations)
var t1 = httpClient.GetAsync("url1");
var t2 = httpClient.GetAsync("url2");
await Task.WhenAll(t1, t2); // concurrent, not necessarily parallel

// Parallelism (CPU work on multiple cores)
Parallel.ForEach(largeList, item => ProcessItem(item));
```

---

### 3. What is deadlock?

A deadlock occurs when two or more threads are each waiting for a resource held by the other — creating a circular dependency where no thread can proceed.

**Classic deadlock in async code:**
```csharp
// ❌ DEADLOCK: Blocking on async in synchronization context (e.g., ASP.NET 4.x or UI thread)
var result = GetDataAsync().Result; // blocks the thread
// GetDataAsync tries to resume on the same thread → deadlock

// ✅ FIX: await all the way up
var result = await GetDataAsync();
// or use ConfigureAwait(false) in library code
var result = await GetDataAsync().ConfigureAwait(false);
```

---

### 4. What is `lock` in C#?

`lock` is a synchronization primitive that ensures only one thread can execute a block of code at a time. Internally uses `Monitor.Enter`/`Monitor.Exit`.

```csharp
private readonly object _lockObj = new object();
private int _counter = 0;

public void Increment() {
    lock (_lockObj) {
        _counter++;
    }
}
```

**Rules:**
- Lock on a dedicated `private readonly object`, never on `this` or a type.
- Keep locked sections short.
- Never call external code inside a lock.
- `lock` is not async-friendly — use `SemaphoreSlim` for async code.

---

### 5. What is `SemaphoreSlim`?

`SemaphoreSlim` is a lightweight, async-compatible synchronization primitive that limits the number of concurrent accesses to a resource.

```csharp
private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1); // mutex

public async Task UpdateAsync() {
    await _semaphore.WaitAsync(); // async wait — doesn't block thread
    try {
        await DoWorkAsync();
    } finally {
        _semaphore.Release();
    }
}

// Throttle: allow only 5 concurrent HTTP calls
private readonly SemaphoreSlim _throttle = new SemaphoreSlim(5);
```

Use `SemaphoreSlim` instead of `lock` whenever you need async locking.

---

### 6. What is thread safety?

Thread safety means a piece of code behaves correctly when accessed by multiple threads concurrently — no data corruption, race conditions, or deadlocks.

```csharp
// NOT thread safe
private int _count = 0;
public void Increment() => _count++; // read-modify-write is not atomic

// Thread safe options:
// 1. Interlocked (atomic operations)
Interlocked.Increment(ref _count);

// 2. lock
lock (_lock) { _count++; }

// 3. Concurrent collections
var dict = new ConcurrentDictionary<string, int>();
dict.AddOrUpdate("key", 1, (k, v) => v + 1);
```

---

### 7. Difference between `Task.WhenAll` and `Task.WaitAll`?

| | `Task.WhenAll` | `Task.WaitAll` |
|---|---|---|
| **Returns** | `Task` (awaitable) | `void` |
| **Thread behavior** | Async — releases thread while waiting | Blocks the calling thread |
| **Exception handling** | All exceptions collected in `AggregateException` | Same |
| **Use in async code** | ✅ Yes | ❌ No (causes blocking/deadlock risk) |

```csharp
// ✅ Correct: async, non-blocking
await Task.WhenAll(task1, task2, task3);

// ❌ Avoid: blocks the thread
Task.WaitAll(task1, task2, task3);
```

---

### 8. What happens if async code blocks?

Blocking async code (`.Result`, `.Wait()`, blocking `Task`) can cause:
- **Deadlocks** — especially in contexts with a `SynchronizationContext` (classic ASP.NET, WPF/WinForms).
- **Thread starvation** — blocking ThreadPool threads prevents new work from being processed; the pool exhausts available threads while blocked threads pile up.
- **Reduced throughput** — the scalability benefit of async (thread reuse during I/O) is completely lost.

```csharp
// ❌ ALL of these can deadlock or starve the pool
var result = GetAsync().Result;
GetAsync().Wait();
GetAsync().GetAwaiter().GetResult();
```

**Rule:** If it's async at any layer, it must be async all the way up.

---

### 9. Explain synchronization context.

`SynchronizationContext` is the mechanism that controls how continuations (code after `await`) are scheduled. In ASP.NET Core, there is **no** `SynchronizationContext` (unlike classic ASP.NET or UI frameworks), so continuations run on ThreadPool threads.

In WPF/WinForms, the UI `SynchronizationContext` marshals continuations back to the UI thread, which is why blocking on async from the UI thread causes deadlocks.

```csharp
// In library code: use ConfigureAwait(false) to avoid capturing context
public async Task<string> GetDataAsync() {
    var data = await _httpClient.GetStringAsync(url).ConfigureAwait(false);
    return data; // resumes on ThreadPool, not UI/ASP context
}
```

In ASP.NET Core, `ConfigureAwait(false)` is not strictly required but is still a good habit for library code.

---

### 10. When should you avoid async?

- **Very short synchronous operations** — the overhead of state machine, task allocation, and context switching costs more than the operation itself.
- **Simple property access or in-memory operations** — no I/O, no need for async.
- **Inside locks** — `lock` doesn't support `await`; use `SemaphoreSlim` instead.
- **Constructors** — can't be async; use factory methods instead.
- **Fire-and-forget with exceptions** — unobserved task exceptions can crash the process; handle them explicitly.

```csharp
// Overkill: no I/O, no benefit
public async Task<int> AddAsync(int a, int b) => a + b; // ❌ don't do this

// Just do:
public int Add(int a, int b) => a + b;
```

---

## Part 5: Senior-Level — Authentication

### 1. Explain JWT flow end-to-end.

```
1. User submits credentials (email + password) to POST /auth/login
2. Server:
   a. Validates credentials against DB (bcrypt hash compare)
   b. Creates JWT payload: { sub, email, roles, iat, exp (15 min) }
   c. Signs with HS256 (symmetric) or RS256 (asymmetric)
   d. Generates refresh token (opaque, stored in DB with userId + expiry)
   e. Returns: { accessToken, refreshToken }
3. Client stores:
   - accessToken in memory (not localStorage — XSS risk)
   - refreshToken in httpOnly Secure cookie (XSS-safe)
4. Client attaches: Authorization: Bearer <accessToken> on each API call
5. Server middleware validates JWT:
   - Verifies signature
   - Checks exp (not expired)
   - Checks iss / aud
   - Extracts claims → populates HttpContext.User
6. When accessToken expires (401):
   Client sends refreshToken → POST /auth/refresh
7. Server validates refreshToken (check DB, not expired, not revoked)
   Issues new accessToken (and optionally rotates refreshToken)
8. Logout: invalidate refreshToken in DB (JWT itself can't be revoked)
```

---

### 2. How did you implement SSO?

SSO (Single Sign-On) allows users to authenticate once and access multiple applications. Common implementations:

**SAML 2.0 (enterprise):**
- Identity Provider (IdP): Azure AD, Okta, ADFS
- Service Provider (SP): your app
- User authenticates with IdP → IdP sends signed SAML assertion → SP validates and creates session

**OpenID Connect (modern/web):**
```csharp
builder.Services.AddAuthentication()
    .AddOpenIdConnect("AzureAD", options => {
        options.Authority = "https://login.microsoftonline.com/{tenantId}/v2.0";
        options.ClientId = config["AzureAD:ClientId"];
        options.ClientSecret = config["AzureAD:ClientSecret"];
        options.ResponseType = "code";
        options.Scope.Add("openid profile email");
        options.CallbackPath = "/signin-oidc";
    });
```

The IdP handles authentication; your app trusts the token issued by the IdP.

---

### 3. What is OAuth2/OpenID Connect?

**OAuth2** is an *authorization* framework — it allows third-party apps to obtain limited access to a user's resources without exposing credentials.

- Flows: Authorization Code (web), Client Credentials (server-to-server), Device Code (CLI/TV)
- Issues: **Access tokens** (opaque or JWT) to access protected resources

**OpenID Connect (OIDC)** is an *authentication* layer on top of OAuth2.
- Adds an **ID token** (JWT) that contains user identity claims (`sub`, `email`, `name`)
- Answers "who is this user?" not just "what can they access?"

```
Authorization Code Flow:
1. App redirects user to IdP: /authorize?client_id=...&response_type=code&scope=openid
2. User authenticates with IdP
3. IdP redirects back with: ?code=AUTHORIZATION_CODE
4. App exchanges code for tokens: POST /token with code + client_secret
5. IdP returns: { access_token, id_token, refresh_token }
```

---

### 4. How does refresh token work?

Refresh tokens exist because access tokens are short-lived (15 min) for security — if stolen, damage is limited. Refresh tokens are long-lived (days/weeks) but stored server-side so they can be revoked.

```csharp
// Issue refresh token on login
var refreshToken = new RefreshToken {
    Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
    UserId = user.Id,
    ExpiresAt = DateTime.UtcNow.AddDays(30),
    CreatedAt = DateTime.UtcNow
};
await db.RefreshTokens.AddAsync(refreshToken);

// Validate on refresh request
var stored = await db.RefreshTokens
    .FirstOrDefaultAsync(r => r.Token == incomingToken && !r.IsRevoked);
if (stored == null || stored.ExpiresAt < DateTime.UtcNow)
    return Unauthorized();

// Rotate: revoke old, issue new (prevents reuse attacks)
stored.IsRevoked = true;
var newRefreshToken = GenerateRefreshToken();
```

**Refresh token rotation** (revoke on use + issue new) prevents refresh token theft.

---

### 5. How do you secure authentication systems?

- **Hash passwords** with bcrypt/Argon2 — never MD5/SHA1, never plain text.
- **Short-lived access tokens** (15 min), revocable refresh tokens.
- **Refresh token rotation** — invalidate on use.
- **httpOnly Secure cookies** for refresh tokens — prevents XSS access.
- **HTTPS everywhere** — tokens over plain HTTP are trivially stolen.
- **Rate limit login endpoints** — prevent brute force.
- **Account lockout** after N failed attempts.
- **MFA** for sensitive accounts.
- **Constant-time comparison** for token/secret comparison (prevent timing attacks).
- **Monitor and alert** on suspicious login patterns (new location, multiple failures).
- **Revocation list** or short expiry to handle logout and compromised tokens.

---

## Part 6: Senior-Level — Performance

### 1. How do you improve API response time?

**Database layer:**
- Add proper indexes on filtered/sorted columns.
- Use `AsNoTracking()` for read queries.
- Project with `Select()` — don't load full entities when you need 3 fields.
- Fix N+1 queries with `Include()`.
- Use read replicas for heavy read traffic.

**Application layer:**
- Cache frequently-read, rarely-changed data (Redis / `IMemoryCache`).
- Avoid synchronous blocking — use async throughout.
- Use response compression (`UseResponseCompression()`).
- Minimize object allocations in hot paths (`Span<T>`, `ArrayPool`, `StringBuilder`).

**Infrastructure:**
- CDN for static assets.
- HTTP/2 multiplexing.
- Connection pooling (DB, HTTP clients).
- Horizontal scaling + load balancing.

**Measure first:** Use Application Insights, Datadog, or dotnet-trace to find actual bottlenecks before optimizing.

---

### 2. How do you debug memory leaks?

**Symptoms:** Growing memory over time, frequent GC, eventual OOM crashes.

**Common causes in .NET:**
- Static collections that grow indefinitely.
- Event handlers not unsubscribed (e.g., `+=` without `-=`).
- HttpClient instances not reused (use `IHttpClientFactory`).
- Finalizers holding objects alive too long.
- Long-lived objects holding references to short-lived ones (gen2 promotion).

**Debugging tools:**
```bash
# Capture memory dump
dotnet-dump collect -p <pid>
dotnet-dump analyze <dump_file>
> dumpheap -stat         # top types by size
> gcroot <address>       # find what's holding an object

# dotnet-counters live monitoring
dotnet-counters monitor --process-id <pid> System.Runtime
```

**Process:**
1. Monitor with `dotnet-counters` to confirm leak (GC heap growing).
2. Capture dump under load.
3. Analyze with `dotnet-dump` or PerfView.
4. Find the root reference keeping objects alive.
5. Fix: unsubscribe events, use `WeakReference`, fix `IDisposable`, etc.

---

### 3. How do you optimize SQL-heavy APIs?

**Query optimization:**
- Use `EXPLAIN`/`SET STATISTICS IO ON` to read query plans.
- Add covering indexes for common query patterns.
- Avoid `SELECT *` — select only needed columns.
- Use CTEs and window functions instead of subqueries.
- Paginate with `OFFSET/FETCH` or keyset pagination (faster for large datasets).

**Application-level:**
- Cache query results in Redis for reads with acceptable staleness.
- Use `IQueryable` projections to push filtering to the database.
- Batch inserts/updates (`BulkInsert` via EF Extensions).
- Use Dapper for complex, hand-tuned queries where EF generates poor SQL.

**Infrastructure:**
- Read replicas for reporting/analytics queries.
- Connection pooling tuned to workload.
- Query result caching with appropriate invalidation.
- Database partitioning/sharding for very large tables.

---

### 4. How do you reduce cloud cost?

**Compute:**
- Right-size instances — use Application Insights/metrics to find over-provisioned services.
- Use auto-scaling — scale in during off-peak hours.
- Spot/preemptible instances for batch/non-critical workloads.
- Use containers (AKS) for bin packing — multiple apps per node.

**Database:**
- Use serverless tiers (Azure SQL Serverless) for dev/low-traffic.
- Reduce DTUs/RUs by optimizing queries (fewer reads = lower cost).
- Archive old data to cheap storage (Blob/S3).
- Use Redis instead of DB for ephemeral/session data.

**Networking:**
- CDN for static assets — reduces origin egress cost.
- Compress API responses — less data transfer.
- Keep inter-service traffic within the same region/VNet (avoid egress charges).

**Storage:**
- Lifecycle policies — move old blobs to cool/archive tiers automatically.
- Delete unused resources (orphaned disks, snapshots, old deployments).

---

### 5. How do you handle high traffic?

**Horizontal scaling:**
- Stateless APIs behind a load balancer — any instance handles any request.
- Session state in Redis, not in-memory.
- Use sticky sessions only if absolutely necessary.

**Caching:**
- Redis for session data, computed results, rate limit counters.
- Response caching for read-heavy endpoints (`[ResponseCache]`).
- CDN for static and semi-static content.

**Async and non-blocking:**
- Fully async code — maximizes request throughput per instance.
- Queue slow operations (email sending, report generation) to background workers via message queues (Service Bus, RabbitMQ).

**Rate limiting and circuit breakers:**
- Rate limit per client to prevent any single client overwhelming the system.
- Circuit breakers (Polly) to fail fast when downstream dependencies are slow.

**Database:**
- Read replicas for read-heavy workloads.
- Connection pool tuning.
- CQRS — separate read and write models to scale independently.

**Load testing:**
- Baseline with k6/NBomber before going live.
- Identify and fix bottlenecks before they hit production.
- Monitor P95/P99 latency, not just averages.