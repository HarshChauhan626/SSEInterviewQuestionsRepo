# Architecture Patterns: A Comprehensive Reference Guide

> A deep-dive documentation of foundational and advanced software architecture patterns used in modern software engineering. This guide covers structural intent, component diagrams, trade-offs, and real-world applicability of each pattern — without code-specific implementation details.

---

## Table of Contents

1. [Introduction to Architecture Patterns](#1-introduction-to-architecture-patterns)
   - 1.1 What Are Architecture Patterns?
   - 1.2 Why Architecture Patterns Matter
   - 1.3 Patterns vs Principles vs Frameworks
   - 1.4 How to Choose the Right Pattern
   - 1.5 Pattern Composition

2. [Clean Architecture](#2-clean-architecture)
   - 2.1 Overview and Philosophy
   - 2.2 The Dependency Rule
   - 2.3 The Four Concentric Layers
   - 2.4 Entities Layer
   - 2.5 Use Cases Layer
   - 2.6 Interface Adapters Layer
   - 2.7 Frameworks & Drivers Layer
   - 2.8 The Role of Boundaries
   - 2.9 Data Flow in Clean Architecture
   - 2.10 Clean Architecture vs MVC
   - 2.11 Screaming Architecture
   - 2.12 Advantages and Disadvantages
   - 2.13 When to Use Clean Architecture
   - 2.14 Common Misconceptions

3. [Hexagonal Architecture](#3-hexagonal-architecture)
   - 3.1 Overview and Origins
   - 3.2 The Core Problem It Solves
   - 3.3 The Hexagon: Ports and Adapters
   - 3.4 Primary (Driving) Ports and Adapters
   - 3.5 Secondary (Driven) Ports and Adapters
   - 3.6 The Application Core
   - 3.7 Inversion of Control in Hexagonal Architecture
   - 3.8 Comparing Hexagonal and Clean Architecture
   - 3.9 Testability and Isolation
   - 3.10 Advantages and Disadvantages
   - 3.11 When to Use Hexagonal Architecture

4. [Repository Pattern](#4-repository-pattern)
   - 4.1 Overview and Purpose
   - 4.2 The Problem Without Repositories
   - 4.3 Core Concepts
   - 4.4 Repository Interface Design
   - 4.5 Generic vs Specific Repositories
   - 4.6 Unit of Work Pattern (Companion Pattern)
   - 4.7 Repository and Domain-Driven Design
   - 4.8 In-Memory vs Persistent Repositories
   - 4.9 Query Objects and Specifications
   - 4.10 Repository Anti-Patterns
   - 4.11 Advantages and Disadvantages
   - 4.12 When to Use the Repository Pattern

5. [Factory Pattern](#5-factory-pattern)
   - 5.1 Overview and Motivation
   - 5.2 Simple Factory
   - 5.3 Factory Method Pattern
   - 5.4 Abstract Factory Pattern
   - 5.5 Factory vs Constructor
   - 5.6 Static vs Instance Factories
   - 5.7 Factory and Dependency Injection
   - 5.8 Factories in Domain-Driven Design
   - 5.9 Object Pools and Factory Variations
   - 5.10 Advantages and Disadvantages
   - 5.11 When to Use the Factory Pattern

6. [Strategy Pattern](#6-strategy-pattern)
   - 6.1 Overview and Motivation
   - 6.2 Core Structure
   - 6.3 Strategy vs Inheritance
   - 6.4 Strategy Selection Mechanisms
   - 6.5 Stateless vs Stateful Strategies
   - 6.6 Composing Strategies
   - 6.7 Strategy and Open/Closed Principle
   - 6.8 Real-World Domains of Application
   - 6.9 Template Method vs Strategy
   - 6.10 Advantages and Disadvantages
   - 6.11 When to Use the Strategy Pattern

7. [Adapter Pattern](#7-adapter-pattern)
   - 7.1 Overview and Purpose
   - 7.2 The Real-World Analogy
   - 7.3 Object Adapter vs Class Adapter
   - 7.4 Two-Way Adapters
   - 7.5 Adapter Chains
   - 7.6 Adapter in Integration Layers
   - 7.7 Adapter vs Facade vs Decorator
   - 7.8 Anti-Corruption Layer (ACL) Connection
   - 7.9 Adapters in Hexagonal Architecture
   - 7.10 Advantages and Disadvantages
   - 7.11 When to Use the Adapter Pattern

8. [Observer Pattern](#8-observer-pattern)
   - 8.1 Overview and Motivation
   - 8.2 Core Components
   - 8.3 Push vs Pull Models
   - 8.4 Synchronous vs Asynchronous Observers
   - 8.5 Event-Driven Architecture Connection
   - 8.6 Observer and the Publish-Subscribe Pattern
   - 8.7 Weak References and Memory Leaks
   - 8.8 Observer in Reactive Programming
   - 8.9 Domain Events and Observer
   - 8.10 Advantages and Disadvantages
   - 8.11 When to Use the Observer Pattern

9. [Dependency Injection](#9-dependency-injection)
   - 9.1 Overview and Philosophy
   - 9.2 The Dependency Inversion Principle
   - 9.3 Types of Injection
   - 9.4 Constructor Injection
   - 9.5 Property (Setter) Injection
   - 9.6 Method Injection
   - 9.7 DI Containers and IoC Containers
   - 9.8 Service Locator vs Dependency Injection
   - 9.9 DI and Testability
   - 9.10 DI Scopes and Lifecycles
   - 9.11 DI Anti-Patterns
   - 9.12 Advantages and Disadvantages
   - 9.13 When to Use Dependency Injection

10. [Pattern Interactions and Combinations](#10-pattern-interactions-and-combinations)
    - 10.1 Clean Architecture + Repository + DI
    - 10.2 Hexagonal + Factory + Adapter
    - 10.3 Strategy + Observer
    - 10.4 Full Stack Pattern Example

11. [Comparative Analysis](#11-comparative-analysis)
    - 11.1 Pattern Comparison Matrix
    - 11.2 Complexity vs Benefit Trade-offs
    - 11.3 Pattern Selection Guide

12. [Glossary](#12-glossary)

---

## 1. Introduction to Architecture Patterns

### 1.1 What Are Architecture Patterns?

Architecture patterns are reusable, high-level solutions to commonly recurring problems in software design. Unlike algorithms, which describe a step-by-step computational procedure, architecture patterns describe the **structural organization** of a system — how components relate to each other, how data flows, and where responsibility is placed.

They are not "copy-paste" solutions. Instead, they are templates or blueprints that must be adapted to the specific context of a given system. A pattern captures:

- **Intent** — What problem does it solve?
- **Motivation** — Why does this problem need solving?
- **Structure** — What are the components and their relationships?
- **Consequences** — What are the trade-offs?

Architecture patterns operate at a higher level of abstraction than design patterns (like GoF patterns). While a design pattern might tell you how to structure a single class interaction, an architecture pattern tells you how to structure entire modules, subsystems, or applications.

### 1.2 Why Architecture Patterns Matter

Software systems fail not because of a lack of logic, but because of poor structure. As systems grow:

- **Coupling** increases — changing one thing breaks another
- **Cohesion** decreases — related code drifts apart
- **Testability** degrades — components cannot be tested in isolation
- **Onboarding** becomes painful — no mental model exists for newcomers
- **Deployment** becomes risky — no clear boundaries between subsystems

Architecture patterns are a direct antidote to these problems. They introduce:

- **Explicit boundaries** between subsystems
- **Defined contracts** between components
- **Clear data flow** paths
- **Separation of concerns** at every layer
- **Predictable structure** that every developer can reason about

A codebase with a recognizable architecture pattern is one where a developer can say: "I know where the business logic lives," or "I know where to add a new data source," without digging through a tangled web of dependencies.

### 1.3 Patterns vs Principles vs Frameworks

These three concepts are often confused:

**Principles** are philosophical guidelines — SOLID, DRY, YAGNI. They tell you *how to think* about design.

**Patterns** are named, reusable structural solutions. They tell you *what structure to use* when facing a known type of problem.

**Frameworks** are concrete tools or libraries that implement one or more patterns for you. They tell you *what code to write* within their constraints.

The relationship flows like this:

```
Principles → shape → Patterns → are implemented by → Frameworks
```

For example:
- The **Dependency Inversion Principle** leads to the **Dependency Injection** pattern, which is implemented by Spring (Java), or .NET's built-in DI container.
- The **Single Responsibility Principle** leads to **Clean Architecture's layer separation**, which you implement manually (no single framework enforces it entirely).

### 1.4 How to Choose the Right Pattern

There is no universal "best" architecture. The appropriate pattern depends on:

| Factor | Consideration |
|---|---|
| **Domain complexity** | Simple CRUD vs rich domain logic |
| **Team size** | Solo projects vs distributed teams |
| **Change frequency** | Stable business rules vs fast-changing UX |
| **Integration surface** | Monolith vs many external services |
| **Testing requirements** | Unit testability vs integration focus |
| **Deployment model** | Single app vs microservices |

The patterns covered in this guide are not mutually exclusive. Most production systems use several patterns simultaneously, each applied where most appropriate.

### 1.5 Pattern Composition

Patterns compose naturally. A single application might use:

- **Clean Architecture** to define layer boundaries
- **Repository Pattern** within the data access layer
- **Factory Pattern** to create domain entities
- **Strategy Pattern** to vary business logic at runtime
- **Adapter Pattern** to wrap third-party services
- **Observer Pattern** for event notification
- **Dependency Injection** to wire everything together

Understanding each pattern independently, and then understanding how they relate, is the core skill of software architecture.

---

## 2. Clean Architecture

### 2.1 Overview and Philosophy

Clean Architecture, introduced by Robert C. Martin (Uncle Bob) in 2012 and elaborated in his book of the same name, is an architectural style that organizes software into concentric layers, with the most fundamental business rules at the center and the most volatile, framework-specific code on the outside.

The central philosophy is: **the inner layers must know nothing about the outer layers**. Business rules should not depend on UI, databases, web servers, or any external infrastructure. Instead, those outer concerns depend on the business rules.

This produces software that is:
- **Independent of frameworks** — the architecture doesn't rely on any library
- **Testable** — business rules can be tested without UI, DB, or web server
- **Independent of UI** — the UI can change without affecting business logic
- **Independent of database** — the business rules don't know what database is used
- **Independent of any external agency** — the business rules simply don't know about the outside world

The mental model is: **put your business logic first, everything else is a detail**.

### 2.2 The Dependency Rule

The most important rule in Clean Architecture is the **Dependency Rule**:

> *Source code dependencies must point only inward, toward higher-level policies.*

An inner circle can know nothing about an outer circle. This means:

- An Entity cannot import a Use Case
- A Use Case cannot import a Controller
- A Controller cannot import a Framework's routing class (except through abstraction)

Data structures defined in an outer circle should not be passed into inner circles. Instead, simple data transfer objects (DTOs) or primitive data must be used to cross boundaries.

```
Direction of dependency:
Outer Layer → Inner Layer (ONLY this direction is allowed)

Entities ← Use Cases ← Interface Adapters ← Frameworks & Drivers
```

If you ever find inner-layer code importing from an outer layer, you have a **Dependency Rule violation** — the most common architectural mistake.

### 2.3 The Four Concentric Layers

Clean Architecture typically depicts four concentric circles:

```
╔══════════════════════════════════════════════════════╗
║              FRAMEWORKS & DRIVERS                    ║
║    ┌──────────────────────────────────────────┐      ║
║    │         INTERFACE ADAPTERS               │      ║
║    │   ┌──────────────────────────────┐       │      ║
║    │   │        USE CASES             │       │      ║
║    │   │   ┌──────────────────┐       │       │      ║
║    │   │   │    ENTITIES      │       │       │      ║
║    │   │   │  (Enterprise     │       │       │      ║
║    │   │   │  Business Rules) │       │       │      ║
║    │   │   └──────────────────┘       │       │      ║
║    │   │  (Application Business Rules)│       │      ║
║    │   └──────────────────────────────┘       │      ║
║    │   (Controllers, Presenters, Gateways)    │      ║
║    └──────────────────────────────────────────┘      ║
║    (Web, DB, External Interfaces, UI, Devices)       ║
╚══════════════════════════════════════════════════════╝
```

Each layer has a clear responsibility, and the layers increase in abstraction from outside to inside.

### 2.4 Entities Layer

The **Entities** layer is the innermost circle. It contains the **Enterprise Business Rules** — the rules that would exist regardless of whether you had a software system or were doing everything on paper.

Entities are:
- Business objects that encapsulate the most general and high-level rules
- The least likely to change when something external changes (e.g., if the web UI changes, entities don't care)
- Plain data structures or objects with methods that express critical business rules
- Free of all framework dependencies, library dependencies, and database concerns

**What lives here:**
- Domain models (Customer, Order, Invoice)
- Value objects (Money, Address, Email)
- Business rule objects (e.g., a Policy object that validates a discount)
- Domain exceptions

**What does NOT live here:**
- Database annotations or ORM mappings
- HTTP-related code
- Framework-specific base classes
- Infrastructure concerns of any kind

Entities represent the **"what"** of your domain — what your business is fundamentally about.

### 2.5 Use Cases Layer

The **Use Cases** layer contains **Application Business Rules** — the specific behaviors and flows that your application supports. These are the actions users perform in the system.

A Use Case describes:
- What input data is expected (from any source — UI, API, event)
- What sequence of operations is performed
- What output is returned

Use Cases:
- Orchestrate the flow of data to and from Entities
- Direct the Entities to use their business rules to achieve the goals of the Use Case
- Do not know about UI, frameworks, or databases
- Only depend on the Entities layer

**Examples of Use Cases:**
- `CreateOrderUseCase` — validates input, creates an Order entity, applies discount rules, saves via a repository
- `ProcessPaymentUseCase` — retrieves an order, validates status, calls payment gateway, updates status
- `GenerateInvoiceUseCase` — retrieves order and customer, applies tax rules, generates invoice entity

**Use Case Input/Output:**
Each Use Case typically takes a **Request Model** (plain data) and returns a **Response Model** (plain data). These are simple data structures — not entities, not HTTP responses — just the data needed to cross the boundary cleanly.

```
[Request Model] → [Use Case Interactor] → [Response Model]
                        ↑↓
                  [Entity Operations]
                        ↑↓
                  [Repository Interface]
                     (abstract)
```

### 2.6 Interface Adapters Layer

The **Interface Adapters** layer is responsible for converting data between the format most convenient for the Use Cases and Entities, and the format most convenient for some external agent (like a web server or database).

This layer contains:

**Controllers** — Accept input from the delivery mechanism (HTTP, CLI, message queue), convert it into a format the Use Case understands, call the Use Case, and receive back a Response Model.

**Presenters** — Take the Response Model from a Use Case and convert it into a ViewModel — a format suitable for the UI to display. Presenters know about the UI's display concerns but not the underlying business logic.

**Gateways / Repository Implementations** — Implement the abstract repository interfaces defined in the Use Cases layer. They know how to translate between Entity/Domain objects and database rows.

**Data Mappers** — Convert between persistence models (database rows) and domain models (entities).

The key point: nothing in this layer should contain business logic. All logic here is purely **format conversion and routing**.

```
HTTP Request → Controller → Request Model → Use Case
                                                ↓
HTTP Response ← Presenter ← Response Model ←──┘
```

### 2.7 Frameworks & Drivers Layer

The **Frameworks & Drivers** layer is the outermost layer. It contains all the details:

- Web frameworks (Express, Spring MVC, FastAPI)
- Databases (PostgreSQL, MongoDB, Redis)
- External APIs and services
- UI frameworks (React, Vue)
- Testing libraries
- Build tools and configuration

This layer is made up mostly of **glue code** — code that connects the inner layers to the real world. It should be as thin as possible. The goal is to make these details pluggable and replaceable.

If you swap your database from PostgreSQL to MongoDB, only this layer (and the Interface Adapters layer's repository implementations) should change. The Entities and Use Cases should be completely unaffected.

### 2.8 The Role of Boundaries

**Boundaries** are the interfaces that separate one concentric layer from another. They define the contract that inner layers expect and outer layers fulfill.

There are two types of boundaries:

**Abstract Boundaries** — Interfaces or abstract classes defined in the inner layer, implemented in the outer layer. This is how the Dependency Rule is maintained even when the inner layer needs to call out to the outer layer (e.g., to save data to a database).

**Data Boundaries** — The shapes of data (Request Models, Response Models) that cross a boundary. These are simple data structures, never rich objects from the other side.

When crossing a boundary:
- Data flows **inward** as Request Models
- Data flows **outward** as Response Models
- Never pass Entities across boundaries (they belong to the inner circles)
- Never pass framework-specific objects (HTTP requests, ORM rows) into inner layers

### 2.9 Data Flow in Clean Architecture

A typical request flows like this:

```
1. HTTP Request arrives at the Web Framework (outermost)
         ↓
2. Framework routes to a Controller (Interface Adapters)
         ↓
3. Controller converts HTTP data → Request Model
         ↓
4. Controller calls Use Case Interactor
         ↓
5. Use Case uses Entities to apply business rules
         ↓
6. Use Case calls Repository Interface (abstraction)
         ↓
7. Repository Implementation (Interface Adapters) converts
   domain objects → database queries (Frameworks & Drivers)
         ↓
8. Data returns back up through the same path
         ↓
9. Use Case produces Response Model
         ↓
10. Presenter formats Response Model → ViewModel
         ↓
11. Framework renders ViewModel as HTTP Response
```

Notice: the Use Case never "knows" about HTTP. The Entity never "knows" about the database. All knowledge flows in one direction.

### 2.10 Clean Architecture vs MVC

MVC (Model-View-Controller) is often compared to Clean Architecture, but they operate at different levels of abstraction:

| Aspect | MVC | Clean Architecture |
|---|---|---|
| **Focus** | UI concerns | Entire system structure |
| **Business Logic** | Often in Controller or Model | Explicit Use Case layer |
| **Testability** | Controllers hard to test without framework | Use Cases fully testable in isolation |
| **Database** | Often tied to Model | Hidden behind Repository abstraction |
| **Layers** | 3 (M, V, C) | 4+ concentric layers |
| **Dependency direction** | Loosely defined | Strictly enforced |

MVC can *live inside* Clean Architecture. The Controller in Clean Architecture is similar to MVC's Controller, but Clean Architecture adds explicit Use Case and Entity layers that MVC doesn't address.

### 2.11 Screaming Architecture

A concept related to Clean Architecture is **Screaming Architecture**: the architecture of your system should scream what the system *does*, not what tools or frameworks it uses.

When you open a codebase, the top-level folder structure should tell you:
- "This is a payroll system" (not "this is a Rails app")
- "This is a healthcare records system" (not "this is a Spring Boot app")

The use cases, entities, and domain concerns should be prominent. The database choice, web framework, and UI library should be subordinate details.

```
BAD (technology-first):
/controllers
/models
/views
/migrations

GOOD (domain-first):
/orders
/customers
/payments
/invoicing
/infrastructure
```

### 2.12 Advantages and Disadvantages

**Advantages:**
- Extreme testability — inner layers testable without any infrastructure
- True independence from frameworks and databases
- Business rules survive UI and infrastructure changes
- Clear ownership of concerns across teams
- Enables parallel development (UI team, backend team, DB team can work independently)
- Facilitates long-term maintainability

**Disadvantages:**
- Significant upfront ceremony and boilerplate (many interfaces, many models)
- Steep learning curve for teams unfamiliar with the concepts
- Over-engineering risk for simple CRUD applications
- Requires discipline to maintain (boundaries erode over time without enforcement)
- More files, more abstraction layers, more indirection to trace

### 2.13 When to Use Clean Architecture

**Ideal for:**
- Systems with complex, rich business logic that changes frequently
- Long-lived enterprise systems (5+ years)
- Teams where multiple parallel workstreams touch the same system
- Systems with multiple delivery mechanisms (API + UI + CLI + events)
- Systems requiring high unit test coverage of business rules

**Overkill for:**
- Simple CRUD applications with minimal business logic
- Prototypes and MVPs where speed is prioritized
- Very small, single-developer projects
- Short-lived or throwaway scripts

### 2.14 Common Misconceptions

**Misconception 1: "Clean Architecture means I must have exactly 4 layers."**
The four layers are guidelines. Some domains need 3, some need 5. The key is the dependency rule, not the exact count.

**Misconception 2: "Clean Architecture and microservices are the same thing."**
Clean Architecture is about internal structure within a single deployable unit. Microservices are about distributing functionality across multiple deployable units. They are orthogonal and can be combined.

**Misconception 3: "Clean Architecture means no frameworks."**
Frameworks live in the outer layers. They are fine to use — they just must not bleed into inner layers.

**Misconception 4: "Every project needs Clean Architecture."**
Clean Architecture has costs. For simple projects, the overhead may not be worth the benefits.

---

## 3. Hexagonal Architecture

### 3.1 Overview and Origins

Hexagonal Architecture, also known as **Ports and Adapters**, was introduced by Alistair Cockburn in 2005. The pattern aims to create a system that is equally testable and drivable from:
- Automated test suites
- Human users via a UI
- Other applications via APIs

The name "hexagonal" is somewhat arbitrary — the hexagon shape was chosen to give enough sides to draw multiple ports, and to distinguish it from the layered diagrams of traditional architecture. The important concept is the **shape of the boundary** between the application and the outside world, not the number six.

The core idea: **the application should have no knowledge of what drives it or what it drives**. It should be able to operate entirely without a UI, database, or any specific external system.

### 3.2 The Core Problem It Solves

In many applications, business logic becomes **entangled with infrastructure concerns**:

- A service method directly queries a database using a specific ORM
- A business function creates HTTP requests to call an external API
- Validation logic depends on a specific JSON framework
- Business rules are expressed using database-specific SQL

This entanglement causes:
- **Difficult testing** — you need a running database to test business logic
- **Tight coupling** — swapping the database requires rewriting business logic
- **Deployment complexity** — every component must be deployed together
- **Brittle design** — external API changes break your business logic

Hexagonal Architecture cleanly separates these concerns using **ports** (interfaces) and **adapters** (implementations).

### 3.3 The Hexagon: Ports and Adapters

```
                 ┌──────────────┐
    HTTP API ────┤              ├──── PostgreSQL DB
                 │              │
    Test Suite ──┤  APPLICATION ├──── Email Service
                 │     CORE     │
    CLI Tool ────┤              ├──── File System
                 │              │
    Message Q ───┤              ├──── Third-party API
                 └──────────────┘
        ↑                              ↑
  Driving Adapters            Driven Adapters
  (Primary Adapters)          (Secondary Adapters)
        ↑                              ↑
  Driving Ports               Driven Ports
  (Primary Ports)             (Secondary Ports)
```

The **hexagon** is the application core. It is surrounded by **ports** (interfaces) through which all interaction happens. **Adapters** are the concrete implementations that connect the application core to the outside world.

### 3.4 Primary (Driving) Ports and Adapters

**Primary Ports** (also called Driving Ports or Inbound Ports) are interfaces through which external actors *drive* the application — they initiate actions.

These represent what the application *can do* from an external perspective:
- "Place an order"
- "Register a user"
- "Generate a report"

**Primary Adapters** are the concrete components that call through primary ports:
- A REST Controller that receives HTTP requests and calls `OrderService.placeOrder()`
- A CLI handler that reads command-line arguments and calls the same `OrderService.placeOrder()`
- A test that directly calls `OrderService.placeOrder()` with test data

The key insight: the **application core doesn't change** whether it's being called by an HTTP controller, a CLI, or a test. The port (interface) remains the same; only the adapter changes.

### 3.5 Secondary (Driven) Ports and Adapters

**Secondary Ports** (also called Driven Ports or Outbound Ports) are interfaces through which the application *drives* external systems — the application initiates the action.

These represent what the application *needs* from the outside world:
- "Store this order"
- "Send this email"
- "Get the current exchange rate"

**Secondary Adapters** are the concrete implementations that fulfill those needs:
- A PostgreSQL repository that implements `OrderRepository`
- An in-memory repository used during tests
- An SMTP adapter that implements `EmailSender`
- A mock email adapter used during tests

Again, the **application core doesn't change** whether it stores data in PostgreSQL or an in-memory map. Only the adapter changes.

### 3.6 The Application Core

The **Application Core** (the hexagon itself) contains:

- **Domain Model** — the entities, value objects, and domain services that express business rules
- **Application Services** — orchestration logic that coordinates domain operations
- **Port Definitions (Interfaces)** — the contracts that adapters must fulfill

The application core must have **zero knowledge** of:
- HTTP, REST, GraphQL, gRPC
- SQL, NoSQL, file systems
- Email protocols, messaging systems
- Third-party libraries and frameworks

It only knows about its own domain objects and the port interfaces it defines.

```
APPLICATION CORE
┌─────────────────────────────────────────────────┐
│                                                 │
│   Domain Model (Entities, Value Objects)        │
│              ↑                                  │
│   Domain Services (pure business logic)         │
│              ↑                                  │
│   Application Services (orchestration)          │
│              ↑                ↓                 │
│   Primary Port Interfaces   Secondary Port      │
│   (what I offer)            Interfaces          │
│                             (what I need)       │
└─────────────────────────────────────────────────┘
         ↑                           ↓
   Primary Adapters           Secondary Adapters
   (call into core)           (called by core)
```

### 3.7 Inversion of Control in Hexagonal Architecture

The magic of Hexagonal Architecture lies in **Inversion of Control** (IoC) for secondary ports.

Normally, a service would directly call a database:
```
ApplicationService → DatabaseClass (concrete)
```

With Hexagonal Architecture and IoC:
```
ApplicationService → RepositoryPort (interface)
                          ↑
                DatabaseAdapter (implements RepositoryPort)
```

The `ApplicationService` owns the `RepositoryPort` interface and depends only on it. The `DatabaseAdapter` depends on both the interface (to implement it) and the database library. This means the outer layer depends on the inner layer's interface — the dependency points inward.

This is the same Dependency Inversion Principle as Clean Architecture's dependency rule, just framed differently.

### 3.8 Comparing Hexagonal and Clean Architecture

Both patterns share the same fundamental idea: isolate the core from the outside world. They differ in emphasis:

| Aspect | Clean Architecture | Hexagonal Architecture |
|---|---|---|
| **Primary metaphor** | Concentric circles | Hexagon with ports |
| **Layer count** | Explicitly 4 layers | No fixed layers |
| **Naming** | Entities, Use Cases, Adapters, Frameworks | Domain, Application, Ports, Adapters |
| **Direction distinction** | Less explicit | Clearly separates Driving vs Driven |
| **Use Case structure** | Explicit Use Case objects | Application Services (similar concept) |
| **Origin** | Robert C. Martin (2012) | Alistair Cockburn (2005) |

In practice, they are highly compatible. Many teams implement a hybrid that uses Clean Architecture's layering and Hexagonal Architecture's port/adapter terminology.

### 3.9 Testability and Isolation

Hexagonal Architecture is often praised specifically for the **testability** it enables:

**Testing the domain with no infrastructure:**
Replace all secondary adapters with in-memory fakes. The entire domain can be tested without a running database, email server, or any external dependency.

```
Test Suite (primary adapter)
      ↓
Application Core (unchanged)
      ↓
In-Memory Adapter (replaces PostgreSQL adapter)
```

**Testing adapters in isolation:**
Each adapter can be tested independently against the port contract it implements. A PostgreSQL adapter can be tested with a real (or containerized) database, without involving any business logic.

**Contract testing:**
The port interface acts as a contract. Any adapter claiming to implement that port can be verified by running the same test suite against different implementations.

### 3.10 Advantages and Disadvantages

**Advantages:**
- Exceptional testability at every level
- Technology-agnostic application core
- Easy to swap out infrastructure (databases, messaging, APIs)
- Parallel development (one team writes adapters, another writes core)
- Clear driver vs driven distinction simplifies reasoning about data flow
- Strong separation between what the system *does* and how it *does it*

**Disadvantages:**
- Interface proliferation — every interaction requires a port definition
- Boilerplate for simple operations
- Learning curve for teams new to the pattern
- Can be overkill for systems with a single, stable infrastructure stack
- Requires discipline to keep adapters thin and logic-free

### 3.11 When to Use Hexagonal Architecture

**Ideal for:**
- Applications that must support multiple delivery mechanisms (API + CLI + events)
- Systems where the infrastructure may change (migrating databases)
- High test coverage requirements, especially unit tests
- Domain-rich systems where business logic must be isolated
- Microservices where each service has clear, bounded interactions

**Overkill for:**
- Simple CRUD applications
- Prototypes with no test requirements
- Systems tightly coupled to a single infrastructure stack by design

---

## 4. Repository Pattern

### 4.1 Overview and Purpose

The Repository Pattern, described in Martin Fowler's *Patterns of Enterprise Application Architecture* (2002) and popularized by Domain-Driven Design (DDD), provides an abstraction layer between the domain model and the data mapping layer.

A **repository** mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects. From the domain's perspective, data manipulation feels like working with an in-memory collection — you add, remove, and find domain objects without worrying about SQL, indexes, connection pools, or network latency.

The core promise: **code that uses a repository should be completely unaware of the underlying persistence mechanism**.

### 4.2 The Problem Without Repositories

Without the Repository Pattern, data access logic tends to leak everywhere:

- Service classes directly execute SQL queries
- Business logic is mixed with database column names
- The same query appears in multiple places (no reuse)
- Changing the database requires touching business logic
- Unit testing requires a running database

Consider a service method that validates a business rule while also constructing SQL — any change to either the rule or the schema breaks both concerns simultaneously. This is a clear violation of the Single Responsibility Principle.

### 4.3 Core Concepts

The Repository Pattern introduces these concepts:

**Repository Interface** — Defined in the domain layer. Describes what data operations the domain needs. Uses domain language (not database language).

**Repository Implementation** — Resides in the infrastructure layer. Fulfills the interface using a specific data access technology (ORM, raw SQL, NoSQL client, etc.).

**Domain Object ↔ Persistence Model Mapping** — The repository is responsible for converting between domain objects (entities, value objects) and whatever format the database uses.

```
DOMAIN LAYER
┌────────────────────────────────────────────┐
│  Business Logic → Repository Interface     │
│                    (IOrderRepository)      │
└───────────────────────┬────────────────────┘
                        │ depends on (abstraction)
INFRASTRUCTURE LAYER    │
┌───────────────────────▼────────────────────┐
│  PostgresOrderRepository                   │
│  (implements IOrderRepository)             │
│  Uses ORM / SQL → maps to domain objects   │
└────────────────────────────────────────────┘
```

### 4.4 Repository Interface Design

A repository interface should speak the **language of the domain**, not the language of data access. It should express *what* is needed, not *how* to get it.

**Good repository interface:**
```
Interface OrderRepository:
  findById(orderId: OrderId): Order
  findByCustomer(customerId: CustomerId): List<Order>
  findPendingOrdersOlderThan(days: int): List<Order>
  save(order: Order): void
  remove(order: Order): void
```

**Poor repository interface (leaking data concerns):**
```
Interface OrderRepository:
  executeQuery(sql: String): ResultSet   ← exposes SQL
  findByJoin(table1, table2, on): List   ← exposes joins
  findWithLimit(limit, offset): List     ← exposes pagination impl
```

The interface should represent **collections of domain objects** with **domain-meaningful query methods**.

### 4.5 Generic vs Specific Repositories

**Generic Repository:**
A single interface parameterized by type, typically offering CRUD operations:

```
Interface Repository<T, ID>:
  findById(id: ID): T
  findAll(): List<T>
  save(entity: T): void
  delete(id: ID): void
```

**Advantages:** Reduces boilerplate, quick to implement for many entity types.
**Disadvantages:** Doesn't express domain-specific query needs; often leads to "findAll() and filter in memory" anti-pattern.

**Specific Repository:**
An interface tailored to the domain object it manages:

```
Interface OrderRepository:
  findById(orderId: OrderId): Order
  findByCustomerAndStatus(customerId, status): List<Order>
  findOverdueOrders(): List<Order>
  totalRevenueForPeriod(from: Date, to: Date): Money
```

**Advantages:** Expressive, domain-aligned, prevents accidental misuse.
**Disadvantages:** More interfaces to write and maintain.

Best practice: **prefer specific repositories** for complex domains. Use generic repositories for simple entities with basic CRUD needs.

### 4.6 Unit of Work Pattern (Companion Pattern)

The **Unit of Work** pattern is a companion to the Repository Pattern. It tracks all objects affected during a business transaction and coordinates how these changes are written to the database in a single atomic operation.

Without Unit of Work:
- Each repository saves independently
- Multiple roundtrips to the database
- Inconsistent state if one save fails after another succeeds

With Unit of Work:
```
UnitOfWork:
  - Tracks new objects to insert
  - Tracks modified objects to update
  - Tracks deleted objects to remove
  - commit() → writes all changes in a single transaction
  - rollback() → discards all tracked changes
```

The Unit of Work and Repository Pattern together ensure **transactional consistency** across multiple domain operations:

```
Business Transaction:
  1. Create Order (via OrderRepository)
  2. Reduce Inventory (via InventoryRepository)
  3. Send Confirmation (via NotificationRepository)
  4. UnitOfWork.commit() → all three committed atomically
     or UnitOfWork.rollback() → none of them committed
```

### 4.7 Repository and Domain-Driven Design

In DDD, repositories are associated with **Aggregate Roots** — the top-level entities that own a cluster of related objects. The rule is:

**One repository per Aggregate Root.**

- An `Order` aggregate (containing `OrderLines` and `ShippingAddress`) → `OrderRepository`
- A `Customer` aggregate → `CustomerRepository`
- There is NO `OrderLineRepository` — order lines are accessed only through the Order aggregate

This enforces aggregate boundaries and ensures that all invariants within an aggregate are managed through the aggregate root.

```
Aggregate Root: Order
    ├── OrderLine 1
    ├── OrderLine 2
    ├── ShippingAddress
    └── OrderStatus

OrderRepository manages the entire aggregate as a unit.
You cannot access OrderLines directly — always through Order.
```

### 4.8 In-Memory vs Persistent Repositories

A powerful feature of the Repository Pattern is the ability to **swap implementations**:

**InMemoryOrderRepository** — Stores orders in a dictionary in memory. Used for:
- Unit tests (fast, no infrastructure required)
- Rapid prototyping
- Testing domain logic in complete isolation

**PostgresOrderRepository** — Uses a PostgreSQL database. Used for:
- Production deployments
- Integration tests

**MongoOrderRepository** — Uses MongoDB. Used for:
- Alternative storage requirements
- Document-oriented domain models

All three implement the same `OrderRepository` interface. The domain code that uses the repository **does not change** between implementations. Only the wiring (dependency injection configuration) changes.

### 4.9 Query Objects and Specifications

As repository queries become complex, the **Specification Pattern** can complement repositories. A Specification encapsulates a query predicate as an object:

```
Specification:
  - isSatisfiedBy(entity): boolean

Examples:
  OrderIsOverdueSpec (order): checks if order.dueDate < today
  OrderIsFromCustomerSpec(customerId): checks order.customerId
  OrderHasMinimumValueSpec(amount): checks order.total >= amount

Composed:
  overdueHighValueOrders = OrderIsOverdueSpec.AND(OrderHasMinimumValueSpec(1000))
  repository.find(overdueHighValueOrders)
```

This keeps repositories thin and query logic composable and testable.

### 4.10 Repository Anti-Patterns

**Fat Repository Anti-Pattern:**
The repository contains business logic rather than just data access. Business rules (like "an order can only be retrieved if the customer is active") belong in the domain, not the repository.

**Anemic Repository Anti-Pattern:**
The repository is bypassed directly by service classes that run raw queries, defeating the abstraction.

**Generic Repository Over-Abstraction:**
Exposing `findAll()` on everything and then filtering in memory, which defeats the purpose of efficient database queries.

**Leaky Repository:**
The repository returns persistence-layer objects (e.g., ORM proxy objects) rather than true domain entities. Business logic then accidentally triggers lazy-loading database calls.

**God Repository:**
One repository for all domain objects, with hundreds of methods. Prefer one focused repository per aggregate.

### 4.11 Advantages and Disadvantages

**Advantages:**
- Domain logic is completely decoupled from data access technology
- Enables seamless switching of persistence mechanisms
- Unit testing of domain logic without a database
- Centralized data access logic (no scattered queries)
- Enforces DDD aggregate boundaries (when done correctly)
- Clean, expressive domain-language query methods

**Disadvantages:**
- Added abstraction layer = more interfaces, more files, more indirection
- Risk of "N+1 problem" if repository design doesn't consider query efficiency
- ORM magic can leak through if not carefully managed
- Complex queries can become awkward to express through a repository interface
- Requires consistent discipline to avoid leaky abstractions

### 4.12 When to Use the Repository Pattern

**Ideal for:**
- Applications with rich domain models (DDD contexts)
- Systems that need to switch or support multiple data stores
- Any system where testability of business logic is a priority
- Bounded contexts with complex aggregate relationships

**Consider alternatives when:**
- The application is purely read-heavy with complex analytical queries (CQRS might suit better)
- The system is a simple CRUD application with one database and no complex domain
- Query performance is paramount and the abstraction introduces inefficiency

---

## 5. Factory Pattern

### 5.1 Overview and Motivation

The Factory Pattern is one of the most widely applied creational design patterns. At its core, it addresses a simple but pervasive problem: **objects are often complex to construct, and the knowledge of how to construct them shouldn't be scattered throughout the codebase**.

When an object requires:
- Multiple steps to initialize
- Conditional logic to determine which concrete type to create
- Pre- and post-construction configuration
- Coordination among multiple sub-objects
- Enforcement of invariants before the object is usable

...then creating it with a simple `new` call in every place it's needed violates the Single Responsibility Principle and leads to duplicated construction logic.

The Factory Pattern centralizes object creation logic, providing a **single place** where all construction complexity lives.

### 5.2 Simple Factory

The **Simple Factory** (also called a Static Factory or Factory Utility) is not a formal Gang of Four pattern but is perhaps the most commonly used variant. It is a single class with a static or instance method that creates objects:

```
SimpleFactory:
  createShape(type: String) → Shape:
    if type == "circle"  → return Circle
    if type == "square"  → return Square
    if type == "triangle" → return Triangle
    else → throw UnknownShapeException
```

**Characteristics:**
- All creation logic in one place
- Client code doesn't know which concrete class is returned
- Simple and easy to understand
- Does not follow Open/Closed Principle — adding a new type requires modifying the factory

Simple Factories are appropriate when the number of types is small and unlikely to grow, and when the creation logic is simple.

### 5.3 Factory Method Pattern

The **Factory Method** (formal GoF pattern) defines an interface for creating an object but **lets subclasses decide which class to instantiate**. The factory method defers object instantiation to subclasses.

```
Abstract Creator:
  abstract createProduct(): Product  ← factory method
  doSomething():
    product = this.createProduct()   ← uses factory method
    product.use()

ConcreteCreatorA extends Creator:
  createProduct(): return ProductA   ← subclass decides

ConcreteCreatorB extends Creator:
  createProduct(): return ProductB   ← subclass decides
```

**Structure:**
```
Creator (abstract)
  ├── ConcreteCreatorA → creates → ProductA
  └── ConcreteCreatorB → creates → ProductB

Product (interface)
  ├── ProductA
  └── ProductB
```

**When to use:** When a class can't anticipate what kind of objects it must create, and when you want subclasses to specify the objects they create. Common in frameworks where the framework calls the factory method and the application provides the concrete implementation.

### 5.4 Abstract Factory Pattern

The **Abstract Factory** provides an interface for creating **families of related or dependent objects** without specifying their concrete classes.

Where Factory Method creates one product, Abstract Factory creates a family of related products:

```
AbstractFactory (interface):
  createButton(): Button
  createCheckbox(): Checkbox
  createTextInput(): TextInput

WindowsFactory implements AbstractFactory:
  createButton(): WindowsButton
  createCheckbox(): WindowsCheckbox
  createTextInput(): WindowsTextInput

MacFactory implements AbstractFactory:
  createButton(): MacButton
  createCheckbox(): MacCheckbox
  createTextInput(): MacTextInput
```

The client code works with both factories and products through abstract interfaces. It never sees concrete types. By simply switching which factory is injected, the entire family of objects changes consistently.

**Key invariant:** Abstract Factory ensures that related objects are always created together. A `MacFactory` will never accidentally create a `WindowsButton` alongside a `MacCheckbox`.

```
Abstract Factory Diagram:
┌─────────────────────────────────────────────────────┐
│             Client                                  │
│               │ uses                                │
│     ┌─────────▼──────────┐                         │
│     │  AbstractFactory   │                         │
│     └───┬────────────────┘                         │
│         │                                          │
│   ┌─────▼───────┐    ┌──────────────┐             │
│   │WindowsFactory│   │  MacFactory  │             │
│   └──────┬──────┘    └──────┬───────┘             │
│          │                  │                      │
│   WindowsButton        MacButton                   │
│   WindowsCheckbox      MacCheckbox                 │
└─────────────────────────────────────────────────────┘
```

### 5.5 Factory vs Constructor

Using a constructor (`new`) everywhere:
- Exposes the concrete type to every caller
- Prevents returning a subtype or cached instance
- Cannot return null (only throw exceptions)
- No meaningful name — `new Shape()` says nothing about purpose

Using a factory:
- Caller remains unaware of the concrete type
- Can return different subtypes based on conditions
- Can return `null`, cached instances, or singleton variants
- Can have meaningful names: `ShapeFactory.createCircleFromRadius(r)` or `ShapeFactory.createFromAreaSpec(spec)`

Factory methods also enable **fluent object creation** patterns:

```
OrderFactory:
  createStandardOrder(customer): Order
  createExpressOrder(customer): Order      ← adds rush fee
  createSubscriptionOrder(customer): Order ← applies discount
  createGiftOrder(recipient, sender): Order ← flags as gift
```

Each method name expresses intent clearly.

### 5.6 Static vs Instance Factories

**Static Factories** are class-level methods, not instance methods. They can:
- Cache and return the same instance (flyweight/singleton)
- Have descriptive names
- Return subtypes
- Allow lazy initialization

**Instance Factories** are objects injected into consumers:
- Support multiple factory implementations
- Can be swapped for testing (use a mock factory)
- Carry state (e.g., configuration)
- Work cleanly with Dependency Injection

For systems using DI, **instance factories** are preferred because they can be swapped, mocked, and managed by the DI container.

### 5.7 Factory and Dependency Injection

Factories and DI complement each other:

- **DI Container** manages long-lived, singleton-scope dependencies
- **Factory** is used when a new instance is needed at runtime, parameterized by data only known at runtime

For example, a `ReportFactory` might be a singleton (managed by DI) but called with runtime data to produce `Report` instances (which are not singletons):

```
ReportFactory (singleton, managed by DI):
  constructor(logger, config)    ← injected by DI
  create(reportSpec): Report     ← creates new instance at runtime
```

This is the **Factory Pattern as an Abstract Factory for DI** — the factory is the stable dependency; the created objects are runtime artifacts.

### 5.8 Factories in Domain-Driven Design

In DDD, factories play a critical role: **factories are responsible for creating Aggregate Roots and complex domain objects**, ensuring all invariants are satisfied upon creation.

A domain object must never exist in an invalid state. Constructors alone often can't enforce this if:
- Multiple steps are required
- Validation requires other services
- The creation requires a decision based on domain rules

```
OrderFactory:
  createOrder(customer, cart, shippingAddress):
    validate(customer is active)
    validate(cart is non-empty)
    validate(shippingAddress is deliverable)
    order = new Order(generateOrderId(), customer, now())
    for item in cart.items:
      order.addLine(item.product, item.quantity, item.price)
    order.applyPromotions(customer.loyaltyStatus)
    return order
```

The factory owns all the creation complexity, ensuring the returned `Order` is always valid.

### 5.9 Object Pools and Factory Variations

**Object Pool Pattern** is a factory variation where objects are pre-created and reused:

```
ConnectionPool (Factory variant):
  pool: List<Connection>
  
  acquire(): Connection
    if pool.has_available → return from pool
    else → create new Connection and return

  release(connection): void
    reset(connection) → return to pool
```

Used for expensive-to-create objects like database connections, thread pools, or parser objects.

### 5.10 Advantages and Disadvantages

**Advantages:**
- Single location for all object creation logic
- Caller is decoupled from concrete types
- Enables returning subtypes, cached instances, or null
- Descriptive factory method names improve readability
- Easy to extend with new types (Abstract Factory / Factory Method)
- Facilitates DDD invariant enforcement on creation

**Disadvantages:**
- Simple Factory violates Open/Closed Principle
- Adds an extra abstraction layer
- Can grow into a "God Factory" anti-pattern if not kept focused
- Factory Method's subclass approach can lead to deep class hierarchies

### 5.11 When to Use the Factory Pattern

**Use Simple Factory when:**
- A small, stable set of types needs to be created
- Creation logic is moderate and centralization is the main goal

**Use Factory Method when:**
- A framework or base class needs to defer object creation to subclasses
- You want to support open extension for new types without modifying existing code

**Use Abstract Factory when:**
- A system must be independent of how its products are created
- A system is configured with one of multiple families of products
- You need to ensure consistency among related objects

---

## 6. Strategy Pattern

### 6.1 Overview and Motivation

The **Strategy Pattern** defines a family of algorithms, encapsulates each one, and makes them interchangeable. It allows the algorithm to vary independently from the clients that use it.

The motivation: many problems have multiple valid solutions (strategies), and the choice of which to apply may depend on context, configuration, user preference, or runtime conditions. Without the Strategy Pattern, this often manifests as large `if-else` or `switch` blocks:

```
WITHOUT STRATEGY:
if sortType == "bubble":
  bubble_sort(data)
elif sortType == "merge":
  merge_sort(data)
elif sortType == "quick":
  quick_sort(data)
elif sortType == "heap":
  heap_sort(data)
```

This is problematic:
- Adding a new algorithm requires modifying existing code (violates Open/Closed)
- The class has too many responsibilities
- Algorithms cannot be tested in isolation
- The same logic duplicated in other classes that sort

The Strategy Pattern extracts each algorithm into its own class, making it independently changeable and testable.

### 6.2 Core Structure

```
Strategy Pattern:
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Context                                            │
│  ┌──────────────────────────────────┐               │
│  │  - strategy: SortStrategy (ref)  │               │
│  │  + setStrategy(strategy)         │               │
│  │  + executeSort(data)             │               │
│  └────────────────────┬─────────────┘               │
│                       │ uses                        │
│            ┌──────────▼──────────────┐              │
│            │    <<interface>>        │              │
│            │    SortStrategy         │              │
│            │  + sort(data): void     │              │
│            └─┬──────────┬────────┬───┘              │
│              │          │        │                  │
│         BubbleSort  MergeSort  QuickSort            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Components:**

**Strategy Interface** — Defines the contract that all concrete strategies implement. It is the point of variation.

**Concrete Strategies** — Individual implementations of the algorithm, each in its own class. Each is independently testable, modifiable, and deployable.

**Context** — The class that holds a reference to the strategy and delegates the algorithm call to it. The context is agnostic to which concrete strategy it uses.

### 6.3 Strategy vs Inheritance

A common alternative to Strategy is inheritance:

```
WITHOUT STRATEGY (inheritance):
abstract class Sorter:
  abstract sort(data)

class BubbleSorter extends Sorter:
  sort(data) { ... }

class MergeSorter extends Sorter:
  sort(data) { ... }
```

Problems with inheritance:
- The sorting behavior is **baked in** at construction time — you can't switch algorithms at runtime
- Deep class hierarchies emerge as you combine behaviors (e.g., a sorter that also logs + compresses → multiple inheritance problems)
- Testing requires instantiating subclasses that may have other dependencies

The Strategy Pattern **favors composition over inheritance**. The strategy object is injected into the context, making it swappable at any time.

### 6.4 Strategy Selection Mechanisms

Strategies can be selected in multiple ways:

**Constructor Injection:**
```
Sorter(strategy: SortStrategy)
  The strategy is set once and used for the lifetime of the Sorter.
```

**Setter Injection:**
```
sorter.setStrategy(new QuickSortStrategy())
  The strategy can be changed at any time.
```

**Factory Selection:**
```
StrategyFactory.select(dataSize):
  if dataSize < 100 → return BubbleSortStrategy
  if dataSize < 10000 → return QuickSortStrategy
  else → return MergeSortStrategy
```

**Registry/Map:**
```
strategies: Map = {
  "bubble" → BubbleSortStrategy,
  "merge" → MergeSortStrategy,
  "quick" → QuickSortStrategy
}
strategy = strategies[userPreference]
```

### 6.5 Stateless vs Stateful Strategies

**Stateless Strategies** hold no instance state. They are pure functions wrapped in an object. These are safe to share as singletons:

```
QuickSortStrategy (stateless):
  sort(data): sorts data without storing anything
  → Can be instantiated once and reused everywhere
```

**Stateful Strategies** carry configuration or mutable state:

```
PageRankStrategy (stateful):
  dampingFactor: 0.85
  maxIterations: 100
  sort(graph): uses stored configuration
  → New instance needed per configuration
```

Prefer stateless strategies when possible — they simplify lifecycle management and thread safety.

### 6.6 Composing Strategies

Strategies can be composed:

**Chained Strategies:**
```
CompositeValidationStrategy:
  strategies: List<ValidationStrategy>
  validate(input):
    for each strategy → strategy.validate(input)
    fail-fast or collect all errors
```

**Fallback Strategies:**
```
FallbackStrategy(primary, fallback):
  execute(input):
    try → primary.execute(input)
    on failure → fallback.execute(input)
```

**Weighted Strategies:**
```
WeightedPricingStrategy:
  strategies: List<(PricingStrategy, weight)>
  calculatePrice(product):
    return weighted_average(strategies)
```

### 6.7 Strategy and Open/Closed Principle

The Strategy Pattern is one of the canonical implementations of the **Open/Closed Principle** (OCP):

> Software entities should be open for extension, but closed for modification.

With Strategy:
- Adding a new algorithm = adding a new class (open for extension)
- Existing algorithms and context code are untouched (closed for modification)

This makes Strategy especially powerful in systems where new business rules or algorithms are frequently introduced without wanting to destabilize existing ones.

### 6.8 Real-World Domains of Application

The Strategy Pattern appears naturally in many domains:

**E-commerce:**
- Shipping calculation strategies (FedEx, UPS, Standard, Express)
- Tax calculation strategies by region
- Discount/promotion strategies
- Payment processing strategies

**Data Processing:**
- Sorting algorithms
- Compression algorithms
- Serialization formats (JSON, XML, CSV)
- Caching strategies (LRU, LFU, TTL)

**Security:**
- Authentication strategies (password, OAuth, API key, biometric)
- Encryption algorithms
- Authorization strategies (RBAC, ABAC, ACL)

**UI:**
- Layout strategies (grid, list, masonry)
- Rendering strategies (lazy vs eager)
- Form validation strategies

### 6.9 Template Method vs Strategy

Both patterns define algorithmic skeletons, but they differ fundamentally:

| Aspect | Template Method | Strategy |
|---|---|---|
| **Mechanism** | Inheritance | Composition |
| **Variation** | Overriding methods in subclasses | Injecting different strategy objects |
| **Relationship** | "Is-a" | "Has-a" |
| **Runtime switching** | No | Yes |
| **Algorithm parts** | Can vary individual steps | Replaces entire algorithm |

**Template Method** is for when the algorithm structure is fixed but individual steps vary.
**Strategy** is for when the entire algorithm can change.

### 6.10 Advantages and Disadvantages

**Advantages:**
- Eliminates conditional statements for algorithm selection
- Algorithms are interchangeable at runtime
- Each strategy is independently testable
- New strategies can be added without modifying existing code (OCP)
- Context and strategy can evolve independently
- Clear separation between the "what" (context) and "how" (strategy)

**Disadvantages:**
- Increases the number of classes/objects
- Clients must be aware of different strategies (to choose one)
- Communication overhead between context and strategy (passing data)
- Stateful strategies require careful lifecycle management

### 6.11 When to Use the Strategy Pattern

**Use Strategy when:**
- Multiple variants of an algorithm exist and may need to switch at runtime
- A class has multiple behaviors that change based on conditions
- You want to eliminate large conditional blocks for algorithm selection
- You want to isolate and test algorithms independently
- Different clients may need different variations of behavior

**Avoid Strategy when:**
- There is only one algorithm and no variation is expected
- The algorithm is trivial and doesn't justify the abstraction
- The overhead of defining interfaces and classes outweighs the benefit (very simple cases)

---

## 7. Adapter Pattern

### 7.1 Overview and Purpose

The **Adapter Pattern** (also called Wrapper) converts the interface of a class into another interface that clients expect. It allows classes with incompatible interfaces to work together by wrapping one interface in another.

The Adapter Pattern solves the fundamental problem of interface mismatch: you have an existing component that does what you need, but its interface doesn't match what your code expects.

This happens constantly in software:
- Integrating a third-party library with a different interface
- Connecting two systems built by different teams
- Upgrading a component while maintaining backward compatibility
- Wrapping legacy code with a modern interface

### 7.2 The Real-World Analogy

Consider a travel adapter for electrical plugs. Your laptop charger has a Type A plug (US), but the hotel room has a Type C socket (Europe). The **travel adapter** fits between them — it accepts your plug on one side and fits the European socket on the other, allowing current to flow without changing either the charger or the wall.

In software:
- **Your code** = the laptop charger (expects a certain interface)
- **Third-party library** = the European socket (provides a different interface)
- **Adapter** = the travel adapter (translates between them)

### 7.3 Object Adapter vs Class Adapter

**Object Adapter** (composition-based):
```
Adapter:
  - adaptee: LegacySystem (reference)
  
  + targetOperation(params):
      convertedParams = translate(params)
      result = adaptee.legacyOperation(convertedParams)
      return translate(result)
```

The adapter holds a reference to the adaptee and delegates calls after translation. This is the most common and flexible approach — the adaptee can be any object implementing the legacy interface, including subclasses.

**Class Adapter** (inheritance-based):
```
Adapter extends LegacySystem implements TargetInterface:
  + targetOperation(params):
      convertedParams = translate(params)
      result = this.legacyOperation(convertedParams)  ← calls inherited method
      return translate(result)
```

The adapter inherits from the adaptee class. Available in languages that support multiple inheritance. Less flexible — tied to one concrete adaptee class.

**Prefer Object Adapter** in most cases. It's more flexible and compatible with composition-over-inheritance principles.

### 7.4 Two-Way Adapters

A **Two-Way Adapter** implements both interfaces, allowing it to work from either direction:

```
TwoWayAdapter implements TargetInterface, LegacyInterface:
  
  // When called as TargetInterface:
  targetOperation(params) → calls legacyOperation internally
  
  // When called as LegacyInterface:
  legacyOperation(params) → calls targetOperation internally
```

Two-way adapters are useful in migration scenarios where old and new code must coexist temporarily, both calling each other through the adapter.

### 7.5 Adapter Chains

Sometimes a single conversion isn't enough, and adapters are chained:

```
Client → AdapterA → AdapterB → ThirdPartyService

AdapterA: translates client protocol → intermediate format
AdapterB: translates intermediate format → third-party format
```

Adapter chains allow complex translations to be broken into smaller, testable steps. However, long adapter chains can become hard to debug — keep chains short and each adapter's responsibility clear.

### 7.6 Adapter in Integration Layers

The Adapter Pattern is ubiquitous in integration layers between systems:

**Messaging Adapters:**
```
KafkaMessageAdapter implements MessageBrokerPort:
  + publish(domainEvent: DomainEvent): void
      kafkaRecord = toKafkaRecord(domainEvent)
      kafkaProducer.send(kafkaRecord)
  
  + subscribe(topic, handler): void
      kafkaConsumer.subscribe(topic, msg → handler(fromKafkaRecord(msg)))
```

**Payment Gateway Adapters:**
```
StripePaymentAdapter implements PaymentGatewayPort:
  + charge(amount: Money, card: CardToken): PaymentResult
      stripeCharge = new StripeCharge(amount.cents, card.token)
      stripeResult = stripeClient.createCharge(stripeCharge)
      return PaymentResult.from(stripeResult)
```

**Storage Adapters:**
```
S3StorageAdapter implements FileStoragePort:
  + upload(file: DomainFile): StorageReference
      s3Object = toS3Object(file)
      response = s3Client.putObject(bucket, s3Object)
      return StorageReference.from(response.key)
```

In each case, the adapter is thin — it only translates, never contains business logic.

### 7.7 Adapter vs Facade vs Decorator

These three patterns are often confused:

| Aspect | Adapter | Facade | Decorator |
|---|---|---|---|
| **Intent** | Convert interface | Simplify interface | Add behavior |
| **Changes interface?** | Yes (translation) | Yes (simplification) | No (same interface) |
| **Wraps what?** | Incompatible interface | Complex subsystem | Same-interface object |
| **Adds behavior?** | No (pure translation) | No (delegation only) | Yes (adds features) |
| **Use case** | Legacy integration | Simplify complex API | Add logging, caching |

**Adapter** = "make this work with my interface"
**Facade** = "hide all this complexity behind a simple interface"
**Decorator** = "add features to this object without changing its interface"

### 7.8 Anti-Corruption Layer (ACL) Connection

In Domain-Driven Design, the **Anti-Corruption Layer (ACL)** is a pattern for protecting your domain model from the concepts of an external system. The ACL is typically implemented using a combination of Adapters and Translators.

When integrating with a third-party CRM system:
```
Your Domain Model:
  Customer (has Email, Name, Address)

Third-Party CRM Model:
  Contact (has email_address, full_name, mailing_address.line1, ...)

ACL (using Adapter + Translator):
  CrmAdapter implements CustomerRepository:
    + findById(id: CustomerId): Customer
        crmContact = crmClient.getContact(id.value)
        return CustomerTranslator.toDomain(crmContact)  ← prevents CRM concepts
                                                            from leaking in
```

Without the ACL, third-party concepts and naming conventions contaminate your domain model. The Adapter is the structural pattern; the translation logic protects your domain.

### 7.9 Adapters in Hexagonal Architecture

Adapters are the central concept of Hexagonal Architecture. Every interaction with the outside world is mediated by an adapter:

**Primary (Driving) Adapters:**
- REST Controller → calls Application Port
- GraphQL Resolver → calls Application Port
- CLI Handler → calls Application Port
- Test → calls Application Port (this is why tests are first-class citizens)

**Secondary (Driven) Adapters:**
- PostgreSQL Repository (implements Database Port)
- SendGrid Email Adapter (implements Email Port)
- Stripe Payment Adapter (implements Payment Port)
- Redis Cache Adapter (implements Cache Port)

Each adapter is thin, focused, and easily replaceable. The Application Core never changes when adapters change.

### 7.10 Advantages and Disadvantages

**Advantages:**
- Enables use of existing, incompatible classes without modifying their source
- Promotes reuse of legacy code
- Isolates domain from third-party interface changes
- Easy to swap out the adapted component
- Single responsibility (adapter does only translation)

**Disadvantages:**
- Adds an extra indirection layer
- Can obscure the actual interface being used (harder to debug)
- Multiple adapters for the same subsystem can lead to inconsistency
- Over-use leads to unnecessary complexity for simple integrations

### 7.11 When to Use the Adapter Pattern

**Use Adapter when:**
- You need to use an existing class but its interface doesn't match what you need
- You want to create a reusable class that works with classes with incompatible interfaces
- You need to protect your domain from third-party concepts (ACL in DDD)
- You're implementing Hexagonal Architecture's port/adapter structure
- You want to wrap legacy code with a modern interface

**Avoid Adapter when:**
- The interfaces are similar enough that direct use is clear and clean
- You control both sides of the interface (just change one of them)

---

## 8. Observer Pattern

### 8.1 Overview and Motivation

The **Observer Pattern** (also known as Event-Listener, Pub-Sub, or Publish-Subscribe in some contexts) defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

The core problem: when one object changes, other objects need to react to that change, but you don't want tight coupling between the source and the reactors.

Without Observer:
- The subject directly calls methods on all known observers
- Subjects must know exactly who is interested
- Adding a new reaction requires modifying the subject
- Removing a reaction requires modifying the subject

With Observer:
- Subjects maintain a list of observers and notify them through a defined interface
- Subjects don't know who is listening — just that listeners exist
- New reactions are added by registering a new observer, without changing the subject

### 8.2 Core Components

```
Observer Pattern Structure:
┌──────────────────────────────────────────────────┐
│                                                  │
│  Subject (Observable)                            │
│  ┌──────────────────────────────────────────┐    │
│  │  - observers: List<Observer>              │    │
│  │  + subscribe(observer: Observer)          │    │
│  │  + unsubscribe(observer: Observer)        │    │
│  │  + notify(): void  ← calls all observers  │    │
│  │  + setState(state) ← triggers notify      │    │
│  └────────────────────────┬─────────────────┘    │
│                           │ notifies              │
│                ┌──────────▼──────────────┐        │
│                │  <<interface>> Observer  │        │
│                │  + update(event): void   │        │
│                └──┬────────┬────────┬────┘        │
│                   │        │        │             │
│              EmailObs  LogObs  CacheObs           │
└──────────────────────────────────────────────────┘
```

**Subject (Observable):**
- Maintains a list of registered observers
- Provides methods to subscribe and unsubscribe observers
- Notifies all registered observers when its state changes

**Observer (Listener):**
- Defines the update interface that subjects call
- Each concrete observer reacts to the notification in its own way

**Concrete Subject:**
- Stores state of interest to observers
- Sends notification to observers when state changes

**Concrete Observer:**
- Implements the update interface
- Reacts to state change (update cache, send email, log event, update UI, etc.)

### 8.3 Push vs Pull Models

**Push Model:**
The subject sends all relevant data with the notification:

```
Subject notifies: observer.update(event: OrderPlacedEvent)
  where OrderPlacedEvent contains all relevant data

Observer receives: all data without needing to query back
```

**Advantages:** Observer doesn't need a reference to the subject. Data is packaged at the time of the event.
**Disadvantages:** Subject must package data even if some observers don't need all of it.

**Pull Model:**
The subject notifies minimally; observers query for data:

```
Subject notifies: observer.update(subjectReference)
  
Observer receives: reference to subject
Observer calls: subject.getOrderId(), subject.getCustomer(), etc.
```

**Advantages:** Observers take only what they need. Subject packaging is minimal.
**Disadvantages:** Observers must hold a reference to the subject (more coupling). Risk of race conditions if state changes between notification and pull.

**Best practice:** Prefer **push model with event objects** for loose coupling. Package all relevant data in an immutable event object at the time of the change.

### 8.4 Synchronous vs Asynchronous Observers

**Synchronous Observers** are called in sequence in the same thread as the subject:

```
Subject.changeState():
  update internal state
  for each observer: observer.update(event)  ← blocks until all done
  return
```

**Pros:** Simple, transactional (if any observer fails, you know immediately).
**Cons:** Slow observers block the subject. Exceptions in observers can propagate unexpectedly.

**Asynchronous Observers** are notified via an event queue or message bus:

```
Subject.changeState():
  update internal state
  eventBus.publish(event)  ← returns immediately
  return

(later, in a different thread/process:)
  observer.update(event)
```

**Pros:** Subject is not blocked. Observers can be slow without affecting the subject.
**Cons:** Complexity of async processing (delivery guarantees, ordering, failure handling).

For distributed systems, asynchronous observation via message queues (Kafka, RabbitMQ) is the standard approach.

### 8.5 Event-Driven Architecture Connection

The Observer Pattern is the foundational building block of **Event-Driven Architecture (EDA)**. In EDA:

- **Events** replace direct method calls
- **Event producers** (subjects) don't know about consumers
- **Event consumers** (observers) react to events they're interested in
- An **Event Bus or Message Broker** mediates between producers and consumers

```
Traditional Observer:         Event-Driven (distributed):
Subject → Observer            Service A → Event Bus → Service B
(in-process)                  (across services, async)
```

The conceptual model is the same: one change notifies many interested parties without the originator knowing who they are. The implementation scales from simple in-process callbacks to distributed message queues.

### 8.6 Observer and the Publish-Subscribe Pattern

Observer and Publish-Subscribe are related but distinct:

| Aspect | Observer | Publish-Subscribe |
|---|---|---|
| **Coupling** | Observers registered with specific subject | Publishers and subscribers never know each other |
| **Mediation** | Subject directly calls observers | Message broker/event bus mediates |
| **Scope** | Usually in-process | Often distributed |
| **Filtering** | Observers receive all notifications | Subscribers filter by topic/type |
| **Delivery** | Synchronous (typically) | Asynchronous (typically) |

Observer = direct registration
Pub-Sub = mediated through a broker

Both patterns share the goal of **decoupling** state change from the reactions to it.

### 8.7 Weak References and Memory Leaks

A classic pitfall of the Observer Pattern: **memory leaks caused by strong observer references**.

If a subject holds strong references to all observers, observers can never be garbage collected, even if all other references to them are gone. This is the **"Lapsed Listener" problem**.

**Solutions:**
- **Weak references:** Subject holds weak references to observers. If the observer is garbage collected, the subject's list is automatically cleaned up.
- **Explicit unsubscription:** Observers are responsible for calling `unsubscribe()` when they're done (e.g., in a destructor or lifecycle method).
- **Scoped subscriptions:** Observation is scoped to a lifetime, automatically cleaned up when the scope ends (common in reactive frameworks).

### 8.8 Observer in Reactive Programming

**Reactive Programming** extends the Observer Pattern to handle streams of events over time, with operators for transformation, filtering, and combination:

```
Traditional Observer:
  subject → observer.update(singleValue)

Reactive Stream:
  observable → filter → map → merge → debounce → subscribe
  (pipeline of transformations on a stream of events)
```

Libraries like RxJS, Project Reactor, and Akka Streams build on the Observer Pattern to create composable pipelines for processing event streams. The core concept remains: producers emit, consumers react, but now the pipeline between them is first-class.

### 8.9 Domain Events and Observer

In Domain-Driven Design, **Domain Events** are first-class expressions of something that happened in the domain:

```
Domain Events:
  OrderPlaced(orderId, customerId, items, timestamp)
  PaymentReceived(orderId, amount, paymentMethod, timestamp)
  ItemShipped(orderId, trackingNumber, carrier, timestamp)
```

Domain events are raised by Aggregate Roots and dispatched to registered event handlers (observers). Each handler reacts to the event:

```
OrderPlaced event:
  → InventoryReducedHandler (reduces stock)
  → ConfirmationEmailHandler (sends email)
  → AnalyticsHandler (records metrics)
  → LoyaltyPointsHandler (adds points)
```

The Aggregate Root raises the event; it doesn't know about any of the handlers. New reactions to `OrderPlaced` are added simply by registering new handlers — the Order aggregate itself never changes.

### 8.10 Advantages and Disadvantages

**Advantages:**
- Loose coupling between subject and observers
- Supports broadcast communication (one to many)
- New observers can be added without modifying the subject (Open/Closed)
- Enables event-driven design and reactive systems
- Clean separation between state change and reactions to it

**Disadvantages:**
- Unexpected updates — observers don't know about each other, so cascading events can cause complex behavior
- Memory leaks if observers are not properly unsubscribed
- Ordering not guaranteed (unless explicitly managed)
- Hard to debug — the chain of events can be non-obvious
- Performance overhead with many observers or high-frequency events

### 8.11 When to Use the Observer Pattern

**Use Observer when:**
- Multiple objects need to react to a single object's state change
- The coupling between subject and its dependents should be minimal
- A change in one object requires changing an unknown number of others
- You're building event-driven, reactive, or pub-sub systems
- Domain Events need to be dispatched to multiple handlers

**Avoid Observer when:**
- There is only one reaction needed (just call it directly)
- The reaction must be synchronous and transactional (cascading event failures are unacceptable)
- The order of observer notification matters critically (hard to control with standard Observer)

---

## 9. Dependency Injection

### 9.1 Overview and Philosophy

**Dependency Injection (DI)** is a technique whereby one object supplies the dependencies of another object, rather than the object constructing its dependencies itself.

The philosophy: **a class should not be responsible for obtaining its own dependencies**. It should declare what it needs, and an external entity (a DI container, a factory, or a test setup) provides those dependencies.

Without DI:
```
OrderService:
  constructor():
    this.repository = new PostgresOrderRepository()   ← hard dependency
    this.emailService = new SmtpEmailService()        ← hard dependency
    this.logger = new FileLogger()                    ← hard dependency
```

With DI:
```
OrderService:
  constructor(repository: OrderRepository,            ← injected
              emailService: EmailService,             ← injected
              logger: Logger):                        ← injected
    this.repository = repository
    this.emailService = emailService
    this.logger = logger
```

In the second version, `OrderService` doesn't know or care what concrete implementations it uses. Someone else is responsible for providing them.

### 9.2 The Dependency Inversion Principle

DI is the *technique* that implements the **Dependency Inversion Principle (DIP)**, the 'D' in SOLID:

> A. High-level modules should not depend on low-level modules. Both should depend on abstractions.
> B. Abstractions should not depend on details. Details should depend on abstractions.

Without DIP:
```
High-level: OrderService
Low-level: PostgresOrderRepository

OrderService depends on PostgresOrderRepository (concrete)
→ High-level depends on low-level (VIOLATION)
```

With DIP:
```
High-level: OrderService
Abstraction: OrderRepository (interface)
Low-level: PostgresOrderRepository (implements OrderRepository)

OrderService depends on OrderRepository (abstraction)
PostgresOrderRepository depends on OrderRepository (abstraction)
→ Both depend on abstraction (CORRECT)
```

This is the key shift: instead of `OrderService` creating a `PostgresOrderRepository`, it declares a dependency on the `OrderRepository` interface, and the concrete implementation is *injected* from outside.

### 9.3 Types of Injection

DI can be implemented in three primary ways, each with different trade-offs.

### 9.4 Constructor Injection

The most common and generally preferred form. Dependencies are provided through the class constructor:

```
OrderService:
  constructor(
    repository: OrderRepository,     ← required
    emailService: EmailService,      ← required
    logger: Logger                   ← required
  ):
    this.repository = repository
    this.emailService = emailService
    this.logger = logger
```

**Advantages:**
- Dependencies are explicit and visible
- Object is always in a valid state (all deps present at construction)
- Facilitates immutability (store deps as final fields)
- Testing is clean — just pass mocks to constructor
- Circular dependencies are detected at compile/startup time

**Disadvantages:**
- Can lead to large constructor parameter lists
- Difficult for objects with optional dependencies (use overloads or null defaults)

**Best practice:** If your constructor has more than 4-5 parameters, it's a signal that the class has too many responsibilities (violates SRP). Refactor before adding more parameters.

### 9.5 Property (Setter) Injection

Dependencies are provided via setter methods after construction:

```
OrderService:
  repository: OrderRepository      ← mutable property
  emailService: EmailService       ← mutable property

  setRepository(repo): void
    this.repository = repo

  setEmailService(svc): void
    this.emailService = svc
```

**Advantages:**
- Allows optional dependencies (only set what's needed)
- Useful for circular dependencies (when A depends on B and B depends on A)
- Allows reconfiguration after construction

**Disadvantages:**
- Object may be in a partially-configured, invalid state if setters aren't all called
- Dependencies are not visible from the constructor signature
- Not thread-safe for mutable fields
- Harder to reason about — you must read the whole class to know what it needs

**Use sparingly.** Constructor injection is preferred. Use setter injection only for optional or circular dependencies.

### 9.6 Method Injection

A dependency is passed as a parameter to the specific method that needs it:

```
OrderService:
  processOrder(orderId, paymentGateway: PaymentGateway):
    ← paymentGateway injected per call
    order = this.repository.findById(orderId)
    paymentGateway.charge(order.total, order.paymentMethod)
```

**When to use:**
- The dependency varies with each call (e.g., different payment gateways per call)
- The dependency is not needed for the entire lifetime of the object
- You want to avoid coupling the class to the dependency for all its methods

**Less common** than constructor injection, but useful for operations where the dependency is specific to a single use.

### 9.7 DI Containers and IoC Containers

Manually wiring dependencies for large applications becomes complex:

```
Manual wiring:
  logger = new FileLogger(config.logPath)
  emailService = new SmtpEmailService(config.smtp, logger)
  repository = new PostgresOrderRepository(config.db, logger)
  orderService = new OrderService(repository, emailService, logger)
  orderController = new OrderController(orderService, logger)
```

This is tedious, error-prone, and hard to change. **DI Containers** (also called IoC Containers) automate this wiring:

```
Container configuration:
  container.register(Logger, FileLogger, singleton)
  container.register(EmailService, SmtpEmailService, transient)
  container.register(OrderRepository, PostgresOrderRepository, singleton)
  container.register(OrderService, OrderService, transient)

Usage:
  orderService = container.resolve(OrderService)
  ← Container automatically resolves the entire dependency graph
```

The container inspects constructor signatures (via reflection, annotations, or explicit registration) and provides the right dependencies.

**IoC (Inversion of Control)** is the broader principle: you invert who controls object creation. Instead of objects creating their own dependencies, an external container does. DI is the most common way to achieve IoC.

### 9.8 Service Locator vs Dependency Injection

**Service Locator** is an alternative to DI:

```
Service Locator approach:
  class OrderService:
    processOrder(orderId):
      repository = ServiceLocator.get(OrderRepository)   ← pulls from global registry
      email = ServiceLocator.get(EmailService)
      ...
```

This is considered an **anti-pattern** in modern software design because:
- Dependencies are hidden — you can't tell what `OrderService` needs from its constructor
- Testing is hard — you must configure the global Service Locator before each test
- The class is coupled to the Service Locator itself
- Violates the Dependency Inversion Principle

DI makes dependencies **explicit** at the class interface. Service Locator makes them **implicit** and hidden inside method bodies.

### 9.9 DI and Testability

The greatest practical benefit of DI is **testability**. With dependencies injected, any dependency can be replaced with a mock, stub, or fake during testing:

```
Unit test for OrderService:
  
  mockRepository = MockOrderRepository()
  mockEmailService = MockEmailService()
  mockLogger = MockLogger()
  
  orderService = OrderService(mockRepository, mockEmailService, mockLogger)
  
  orderService.processOrder(testOrderId)
  
  verify: mockRepository.findById was called with testOrderId
  verify: mockEmailService.send was called once
  verify: no real database was touched
  verify: no real email was sent
```

Without DI, `OrderService` creates its own `PostgresOrderRepository`, which requires a real database. With DI, the test controls exactly what implementations are used.

### 9.10 DI Scopes and Lifecycles

DI containers manage object lifecycles through scopes:

**Singleton Scope:**
One instance per container lifetime. Created once, shared everywhere.
- Use for: stateless services, repositories, loggers, caches

**Transient Scope:**
A new instance for every resolution.
- Use for: objects with state that shouldn't be shared, short-lived operations

**Scoped (Request) Scope:**
One instance per request/unit of work. Created at request start, disposed at request end.
- Use for: database contexts, unit-of-work objects, request-specific state

```
Scope examples:
  Logger         → Singleton (stateless, expensive to create)
  DbContext      → Scoped (one per HTTP request/transaction)
  HttpClient     → Singleton (manages connection pooling)
  OrderService   → Scoped (needs fresh DbContext per request)
  ValidationRule → Transient (stateful, not shareable)
```

**Captive Dependency Anti-Pattern:** A Singleton holding a reference to a Scoped or Transient service. The Singleton outlives its injected dependency, which may have been disposed. Always ensure longer-lived objects hold only equally or longer-lived dependencies.

### 9.11 DI Anti-Patterns

**The Service Locator Anti-Pattern** (described above) — using a global registry to pull dependencies.

**The Constructor Over-Injection Anti-Pattern** — injecting 10+ dependencies into a constructor. Signals a God Class that needs to be broken apart.

**Temporal Coupling** — Using setter injection and relying on setters being called in a specific order before methods can be called.

**The Ambient Context Anti-Pattern** — storing dependencies in thread-local or global static variables and accessing them everywhere (similar to Service Locator but worse).

**Injecting the Container** — passing the DI container itself as a dependency. This makes the class dependent on the container infrastructure and hides its actual dependencies.

**Leaking Abstractions** — injecting concrete types (`PostgresOrderRepository`) instead of interfaces (`OrderRepository`). Defeats the purpose of DI.

### 9.12 Advantages and Disadvantages

**Advantages:**
- Explicit, visible dependencies (no hidden coupling)
- Exceptional unit testability (dependencies easily mocked)
- Supports Dependency Inversion Principle
- Enables open/closed behavior (swap implementations without changing dependent code)
- Centralizes object lifecycle management (in DI containers)
- Enables parallel development (depend on interfaces, implement independently)

**Disadvantages:**
- Increased boilerplate (interfaces, registrations, configuration)
- DI container magic can obscure where objects come from (reduces traceability)
- Misconfigured containers cause runtime errors rather than compile-time errors
- Learning curve for DI container configuration
- Over-injection can lead to complex, hard-to-follow dependency graphs

### 9.13 When to Use Dependency Injection

**Use DI when:**
- Unit testing of classes is a priority
- You want to adhere to SOLID principles
- Multiple implementations of an interface exist (or may exist)
- You're building a medium-to-large application with multiple modules
- You're using Clean Architecture, Hexagonal Architecture, or layered architecture
- Lifecycle management of services is complex (request-scoped, singleton, etc.)

**Consider alternatives when:**
- Building a very small, simple script or utility
- All dependencies are stable, never vary, and don't need to be mocked
- The overhead of DI configuration outweighs the benefits (rare for non-trivial code)

---

## 10. Pattern Interactions and Combinations

### 10.1 Clean Architecture + Repository + DI

This is perhaps the most common combination in enterprise software. Each pattern reinforces the others:

```
Clean Architecture provides the structure:
  ┌─────────────────────────────────────────────────────────┐
  │  FRAMEWORKS & DRIVERS                                   │
  │    DI Container Configuration (wires everything)        │
  │    ┌──────────────────────────────────────────────┐     │
  │    │  INTERFACE ADAPTERS                           │     │
  │    │    PostgresOrderRepository                    │     │
  │    │      (implements OrderRepository)             │     │
  │    │    ┌────────────────────────────────────┐     │     │
  │    │    │  USE CASES                          │     │     │
  │    │    │    OrderService                     │     │     │
  │    │    │    (depends on OrderRepository)     │     │     │
  │    │    │    ┌──────────────────────────┐     │     │     │
  │    │    │    │  ENTITIES                 │     │     │     │
  │    │    │    │    Order, Customer        │     │     │     │
  │    │    │    └──────────────────────────┘     │     │     │
  │    │    └────────────────────────────────────┘     │     │
  │    └──────────────────────────────────────────────┘     │
  └─────────────────────────────────────────────────────────┘

Repository Pattern provides data access abstraction:
  OrderRepository (interface in Use Cases layer)
  PostgresOrderRepository (implementation in Interface Adapters layer)

DI wires it all together (in Frameworks layer):
  container.register(OrderRepository, PostgresOrderRepository)
  container.register(OrderService, OrderService)
  ← OrderService gets PostgresOrderRepository injected, but only knows about the interface
```

**How they reinforce each other:**
- Clean Architecture defines WHERE each component lives and which direction dependencies flow
- Repository Pattern defines HOW data access is abstracted
- DI defines HOW components are connected (always through abstractions, never directly)

### 10.2 Hexagonal + Factory + Adapter

This combination is natural in domain-rich applications:

```
Hexagonal Architecture defines ports and adapters:
  Primary Port: OrderApplicationService.placeOrder(command)
  Secondary Port: OrderRepository, PaymentGateway, EmailSender

Factory creates domain objects:
  OrderFactory.createOrder(customer, cart, address)
    → validates invariants, creates Order aggregate

Adapter wraps external services:
  StripePaymentAdapter implements PaymentGateway
  SendGridEmailAdapter implements EmailSender
  PostgresOrderRepository implements OrderRepository

Flow:
  HTTP Request (Driving Adapter)
    → OrderController
    → OrderApplicationService.placeOrder(command)
      → OrderFactory.createOrder(...)
        → domain validation (entities, value objects)
      → OrderRepository.save(order)    ← Driven Port
        → PostgresOrderRepository      ← Driven Adapter
      → PaymentGateway.charge(...)     ← Driven Port
        → StripePaymentAdapter         ← Driven Adapter
      → EmailSender.send(...)          ← Driven Port
        → SendGridEmailAdapter         ← Driven Adapter
```

### 10.3 Strategy + Observer

Strategy defines *how* something is done; Observer notifies *who cares* when it's done:

```
Payment Processing:
  PaymentService:
    strategy: PaymentStrategy (e.g., CreditCardStrategy)
    
    processPayment(order):
      result = strategy.charge(order)
      
      if result.success:
        eventBus.publish(PaymentSucceededEvent(order, result))
                          ← Observer: notifies all interested parties
      else:
        eventBus.publish(PaymentFailedEvent(order, result))

Observers of PaymentSucceededEvent:
  → OrderFulfillmentHandler (start shipping)
  → LoyaltyPointsHandler (award points)
  → AnalyticsHandler (record revenue)
  → CustomerNotificationHandler (send receipt)

Strategy varies HOW payment is charged (credit card, PayPal, crypto).
Observer varies WHO reacts to the outcome.
Both independently extensible.
```

### 10.4 Full Stack Pattern Example

A complete order management feature using all patterns together:

```
LAYER: Frameworks & Drivers
  - Express.js HTTP framework
  - DI Container (wires everything)
  - PostgreSQL database
  - SendGrid email service

LAYER: Interface Adapters (Adapters in Hexagonal terms)
  - OrderController (HTTP → Application Service call)
  - PostgresOrderRepository implements OrderRepository
  - SendGridEmailAdapter implements EmailSender
  - StripePaymentAdapter implements PaymentGateway
  - OrderPresenter (Response Model → HTTP Response)

LAYER: Use Cases / Application Core
  - PlaceOrderUseCase / OrderApplicationService
    (uses OrderFactory, OrderRepository, PaymentGateway, EventBus)
  - PlaceOrderRequest (input DTO)
  - PlaceOrderResponse (output DTO)

LAYER: Entities / Domain
  - Order (Aggregate Root)
  - OrderLine, ShippingAddress (part of aggregate)
  - OrderFactory (creates valid Orders)
  - OrderRepository (interface — implemented in Adapters layer)
  - PaymentGateway (interface — implemented in Adapters layer)
  - OrderPlacedEvent (Domain Event)
  - ShippingStrategy (interface, with FedExShipping, UPSShipping)
  - OrderPricingStrategy (interface, with StandardPricing, PremiumPricing)

PATTERN ROLES:
  Clean Architecture → defines the layers and dependency direction
  Hexagonal Architecture → identifies primary/secondary ports and adapters
  Repository Pattern → OrderRepository interface + PostgresOrderRepository
  Factory Pattern → OrderFactory creates valid Order aggregates
  Strategy Pattern → ShippingStrategy, PricingStrategy vary per order type
  Adapter Pattern → StripePaymentAdapter, SendGridEmailAdapter translate interfaces
  Observer Pattern → OrderPlacedEvent dispatched to multiple handlers
  Dependency Injection → DI Container wires all concrete types to interfaces
```

---

## 11. Comparative Analysis

### 11.1 Pattern Comparison Matrix

| Pattern | Primary Problem | Scope | Relationship Type | Key Benefit |
|---|---|---|---|---|
| **Clean Architecture** | Coupling of business logic to infrastructure | Entire system | Layering | Long-term maintainability |
| **Hexagonal Architecture** | Hard to test; tight infrastructure coupling | Entire system | Core + Ports | Testability, replaceability |
| **Repository Pattern** | Data access logic scattered, coupled | Data layer | Domain ↔ Persistence | Persistence ignorance |
| **Factory Pattern** | Complex object creation scattered | Object creation | Creator ↔ Product | Centralized creation |
| **Strategy Pattern** | Algorithm variation with conditionals | Behavior selection | Context ↔ Algorithm | Runtime algorithm swap |
| **Adapter Pattern** | Interface mismatch between components | Integration layer | Target ↔ Adaptee | Interface compatibility |
| **Observer Pattern** | Tight coupling in notification chains | Event handling | Subject ↔ Observers | Decoupled notifications |
| **Dependency Injection** | Hard-coded dependencies, poor testability | Wiring layer | Consumer ↔ Provider | Testability, flexibility |

### 11.2 Complexity vs Benefit Trade-offs

```
HIGH BENEFIT
    │
    │  Clean Architecture ●
    │  Hexagonal Architecture ●      ● DI
    │            ● Repository
    │       ● Observer
    │  ● Strategy      ● Adapter
    │            ● Factory
    │
LOW BENEFIT
    └────────────────────────────────────→
         LOW COMPLEXITY          HIGH COMPLEXITY
```

The patterns toward the upper-right (high benefit, high complexity) are worth the investment for large, long-lived systems. The patterns toward the lower-left are quick wins for smaller scales.

### 11.3 Pattern Selection Guide

**"My business logic is tangled with database code"**
→ Repository Pattern + Clean/Hexagonal Architecture

**"Adding a new algorithm means modifying existing code"**
→ Strategy Pattern + Open/Closed Principle

**"I can't test my service without a database"**
→ Repository Pattern + Dependency Injection

**"My code is tied to a specific third-party library"**
→ Adapter Pattern + Port definition (Hexagonal)

**"Adding a new reaction to an event requires modifying the event source"**
→ Observer Pattern / Domain Events

**"My constructors create their own dependencies"**
→ Dependency Injection

**"My object creation logic is scattered and complex"**
→ Factory Pattern

**"My framework bleeds into my business logic"**
→ Clean Architecture + Hexagonal Architecture

**"I need to run the same logic from HTTP, CLI, and tests"**
→ Hexagonal Architecture (multiple primary adapters)

---

## 12. Glossary

**Abstraction** — A simplified representation of something complex. In software, typically an interface or abstract class that hides implementation details.

**Aggregate Root** — In DDD, the top-level entity of a cluster of objects. External access to the cluster is only through the root. One repository per aggregate root.

**Anti-Corruption Layer (ACL)** — A boundary between your domain and an external system, using Adapters and Translators to prevent external concepts from contaminating your domain model.

**Boundary** — A separation between two architectural layers, defined by an interface. Data crossing a boundary must be translated to a form the receiving layer understands.

**Captive Dependency** — An anti-pattern where a longer-lived component holds a reference to a shorter-lived component (e.g., a Singleton holding a Scoped dependency).

**Cohesion** — The degree to which elements within a module belong together. High cohesion = a module does one thing well.

**Composition over Inheritance** — The principle that it's better to compose objects from smaller pieces than to inherit behavior from a parent class.

**Coupling** — The degree of interdependence between modules. Low coupling = changing one module doesn't require changing another.

**Dependency Inversion Principle (DIP)** — High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details.

**Domain Event** — An immutable representation of something that happened in the domain. Named in past tense. Used to communicate between bounded contexts and aggregate roots.

**Domain Model** — A conceptual model of a domain that represents its objects, rules, and behaviors. The central concept in DDD.

**Entity** — An object with a unique identity that persists through state changes. Distinguished from a Value Object by identity, not attributes.

**Event-Driven Architecture (EDA)** — An architectural style where components communicate through events, enabling loose coupling and asynchronous processing.

**Hexagon** — In Hexagonal Architecture, the metaphor for the Application Core. The sides of the hexagon represent the ports.

**Idempotent** — An operation that produces the same result regardless of how many times it is called. Important for event handlers and retry logic.

**Inversion of Control (IoC)** — Inverting who controls object creation and lifecycle from the objects themselves to an external container or framework.

**Layered Architecture** — Organizing software into horizontal layers (UI, Business Logic, Data Access), where each layer only communicates with adjacent layers.

**Open/Closed Principle (OCP)** — Software entities should be open for extension (new behavior can be added) but closed for modification (existing code doesn't change).

**Port** — In Hexagonal Architecture, an interface that defines how the Application Core communicates with the outside world. Primary ports receive calls; secondary ports make calls.

**Repository** — An abstraction layer that provides collection-like access to domain objects, hiding persistence details.

**Single Responsibility Principle (SRP)** — A class should have only one reason to change.

**Use Case** — In Clean Architecture, an application-specific business rule that describes what a user can do with the system. Implemented as an interactor or service class.

**Value Object** — An object with no unique identity, defined only by its attributes. Two value objects with the same attributes are equal. Immutable by convention.

---

*This document covers Clean Architecture, Hexagonal Architecture, Repository Pattern, Factory Pattern, Strategy Pattern, Adapter Pattern, Observer Pattern, and Dependency Injection — eight foundational patterns of modern software architecture. Each pattern addresses a specific structural challenge, and together they form a comprehensive toolkit for building maintainable, testable, and extensible software systems.*

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Audience:** Software Engineers, Architects, Technical Leads  
**Scope:** Architecture Patterns Reference Guide