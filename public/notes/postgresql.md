# PostgreSQL: The Complete Interview Guide & Cheatsheet

> **Covers ~90–95% of PostgreSQL topics asked in Senior Software Engineer interviews.**  
> Use this as both a quick-reference cheatsheet and a deep-dive study guide.

---

## Table of Contents

1. [Basics](#1-basics)
2. [Indexes](#2-indexes)
3. [Query Optimization](#3-query-optimization)
4. [Transactions & Concurrency](#4-transactions--concurrency)
5. [Partitioning & Scaling](#5-partitioning--scaling)
6. [Internals: MVCC, VACUUM, WAL](#6-internals-mvcc-vacuum-wal)
7. [Advanced Topics](#7-advanced-topics)
8. [System Design Scenarios](#8-system-design-scenarios)
9. [Quick-Reference Cheatsheet](#9-quick-reference-cheatsheet)

---

# 1. Basics

---

## 1.1 What is PostgreSQL and how is it different from MySQL?

**PostgreSQL** (also called "Postgres") is a free, open-source, object-relational database management system (ORDBMS) that has been actively developed since 1986. It is known for standards compliance, extensibility, robustness, and rich feature support.

### Key Differences: PostgreSQL vs MySQL

| Feature | PostgreSQL | MySQL |
|---|---|---|
| **Type** | Object-Relational DBMS | Relational DBMS |
| **ACID Compliance** | Fully ACID compliant by default | Depends on storage engine (InnoDB = ACID) |
| **MVCC** | Full MVCC built-in | InnoDB has MVCC; MyISAM does not |
| **JSON Support** | Native `JSON` and `JSONB` with indexing | JSON type, limited indexing |
| **Advanced Indexes** | B-Tree, Hash, GIN, GiST, BRIN, SP-GiST | B-Tree, Hash, Full-text |
| **Full-Text Search** | Built-in with `tsvector`/`tsquery` | Limited built-in |
| **Replication** | Streaming + Logical replication | Statement-based + Row-based + Semi-sync |
| **Stored Procedures** | Yes (PL/pgSQL, PL/Python, PL/Perl, etc.) | Yes (SQL only) |
| **CTEs** | Full support including writable CTEs | CTE support added in MySQL 8.0 |
| **Window Functions** | Full support | Added in MySQL 8.0 |
| **Parallel Queries** | Yes, native parallel query execution | Limited |
| **Table Inheritance** | Yes | No |
| **Custom Types** | Yes — enums, composite types, domains | Limited |
| **Extensions** | Powerful extension system (PostGIS, pg_trgm, etc.) | Plugin-based, less rich |
| **Licensing** | PostgreSQL License (very permissive) | GPL v2 (dual-licensed) |
| **Speed (read-heavy)** | Excellent | Slightly faster historically for simple reads |
| **Speed (write-heavy)** | Excellent | Comparable with InnoDB |

### When to choose PostgreSQL
- Complex queries, joins, aggregations
- JSON document storage alongside relational data
- Geospatial data (PostGIS extension)
- Need for strong data integrity and constraints
- Complex replication or logical decoding requirements

### When to choose MySQL
- Simple read-heavy workloads
- Wide ecosystem of managed services (PlanetScale, Vitess, Aurora MySQL)
- Team already has deep MySQL expertise

---

## 1.2 Main Advantages of PostgreSQL

1. **Full SQL Standards Compliance** — PostgreSQL is one of the most SQL-standards-compliant databases available. It supports SQL:2016 features broadly.

2. **ACID Guarantees** — Every transaction is Atomic, Consistent, Isolated, and Durable. This is not optional or engine-dependent.

3. **Powerful Data Types** — Arrays, hstore (key-value), JSONB, geometric types, network addresses (INET, CIDR), UUID, range types, and custom composite types.

4. **Extensibility** — You can add custom functions in C, Python, Perl, Go, Rust (via extensions), define custom operators, create custom index methods, and build full extensions like PostGIS.

5. **Advanced Indexing** — B-Tree, Hash, GIN (for arrays/JSON/FTS), GiST (for geometric/range data), BRIN (for large sequential data), partial indexes, expression indexes.

6. **Full-Text Search** — Built-in `tsvector` and `tsquery` with GIN indexes. Not as powerful as Elasticsearch but sufficient for many use cases.

7. **MVCC** — Readers never block writers, writers never block readers. High concurrency without aggressive locking.

8. **Logical Replication** — Can replicate specific tables or even rows to downstream consumers, useful for ETL, analytics, and CDC (Change Data Capture).

9. **Robust Community & Ecosystem** — Active open-source community, regular major releases, rich ecosystem of extensions (PostGIS, TimescaleDB, Citus, pgvector).

10. **Reliability & Crash Safety** — Write-Ahead Logging (WAL) ensures data durability even in the event of a crash.

11. **Foreign Data Wrappers (FDW)** — Query data in other databases (MySQL, MongoDB, flat files, REST APIs) directly from PostgreSQL using SQL.

12. **Row-Level Security (RLS)** — Define policies that filter rows returned to different users at the database level.

---

## 1.3 What is MVCC (Multi-Version Concurrency Control)?

MVCC is PostgreSQL's concurrency mechanism that allows **multiple transactions to read and write data simultaneously without blocking each other**.

### The Core Idea

Instead of locking a row when it's being updated, PostgreSQL **keeps multiple versions of each row** simultaneously. Each transaction sees a **consistent snapshot** of the database as of when the transaction started.

### How it works (simplified)

Every row in PostgreSQL has two hidden system columns:
- `xmin` — the transaction ID that **created** this row version
- `xmax` — the transaction ID that **deleted or updated** this row version (0 if still live)

When a transaction reads a row, PostgreSQL checks:
- Is `xmin` committed and before my snapshot? → Row is visible
- Is `xmax` 0 or not yet committed? → Row is still live
- Is `xmax` committed and before my snapshot? → Row is deleted, skip it

### Example

```
Transaction A (xid=100): BEGIN; UPDATE accounts SET balance = 500 WHERE id = 1;
Transaction B (xid=101): BEGIN; SELECT balance FROM accounts WHERE id = 1;
```

- The original row (balance=1000) has `xmin=50, xmax=0`
- After the UPDATE, PostgreSQL creates a **new row version**: `xmin=100, xmax=0`
- The old row is marked: `xmin=50, xmax=100`
- Transaction B (started before A committed) sees the **old version** (balance=1000)
- After A commits, new transactions will see the new version (balance=500)

### Key Benefits
- **Readers never block writers** — a SELECT doesn't wait for an UPDATE
- **Writers never block readers** — an UPDATE doesn't wait for a SELECT
- **Consistent snapshots** — long-running reads see a stable view of data
- **No read locks needed** — dramatically reduces lock contention

### The Cost
- Dead row versions accumulate over time → **table bloat**
- **VACUUM** must periodically clean up dead row versions
- Transaction IDs are 32-bit integers → **transaction ID wraparound** is a concern (handled by VACUUM FREEZE)

---

## 1.4 What is ACID and how does PostgreSQL ensure it?

ACID stands for **Atomicity, Consistency, Isolation, Durability** — the four properties that guarantee reliable database transactions.

### Atomicity
**Definition**: A transaction is "all or nothing." Either all operations succeed, or none of them do.

**How PostgreSQL ensures it**:
- Uses WAL (Write-Ahead Log) to track all changes
- On failure, PostgreSQL can roll back partially completed transactions
- `ROLLBACK` discards all changes since `BEGIN`
- On crash, incomplete transactions are rolled back during recovery

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
-- If second UPDATE fails, first UPDATE is also rolled back
COMMIT;
```

### Consistency
**Definition**: A transaction brings the database from one valid state to another. Database constraints are never violated.

**How PostgreSQL ensures it**:
- Enforces `NOT NULL`, `UNIQUE`, `CHECK`, `FOREIGN KEY`, `PRIMARY KEY` constraints
- Deferred constraints can be checked at the end of a transaction
- Triggers can enforce complex business rules

```sql
ALTER TABLE orders ADD CONSTRAINT check_amount CHECK (amount > 0);
-- This constraint is enforced on every INSERT/UPDATE
```

### Isolation
**Definition**: Concurrent transactions don't interfere with each other. Each transaction executes as if it were the only one.

**How PostgreSQL ensures it**:
- MVCC provides snapshot isolation by default
- Four isolation levels: Read Uncommitted, Read Committed (default), Repeatable Read, Serializable
- Serializable Snapshot Isolation (SSI) — PostgreSQL's implementation of true serializability without heavy locking

### Durability
**Definition**: Once a transaction commits, it remains committed even if the system crashes.

**How PostgreSQL ensures it**:
- WAL (Write-Ahead Logging): every change is written to the WAL **before** the actual data page is modified
- On crash, PostgreSQL replays the WAL to recover to the last consistent state
- `fsync` ensures WAL is flushed to disk before commit acknowledgment
- `synchronous_commit` controls trade-off between durability and performance

```
-- WARNING: This improves performance but risks data loss on crash
SET synchronous_commit = off;
```

---

## 1.5 What are Schemas in PostgreSQL?

A **schema** is a namespace within a database. It allows you to organize tables, views, functions, indexes, and other database objects into logical groups.

### Database → Schema → Table hierarchy

```
PostgreSQL Server
  └── Database: myapp
        ├── Schema: public          (default)
        │     ├── Table: users
        │     └── Table: orders
        ├── Schema: analytics
        │     ├── Table: events
        │     └── View: daily_summary
        └── Schema: audit
              └── Table: change_log
```

### Key Points

- Every database has a `public` schema by default
- The `search_path` determines which schemas PostgreSQL looks in when you don't qualify a table name
- `pg_catalog` is a system schema that stores metadata
- Different schemas can have tables with the same name (no conflict)

```sql
-- Create a schema
CREATE SCHEMA analytics;

-- Create a table in that schema
CREATE TABLE analytics.events (
    id BIGSERIAL PRIMARY KEY,
    event_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Set search path
SET search_path TO analytics, public;

-- Grant access
GRANT USAGE ON SCHEMA analytics TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO readonly_user;
```

### Why use schemas?
- **Multi-tenancy**: one schema per tenant, isolate data easily
- **Module organization**: separate schemas for app, audit, analytics
- **Security**: grant different permissions per schema
- **Avoid name collisions**: same table name in different schemas is fine

---

## 1.6 Difference between CHAR, VARCHAR, and TEXT

| Type | Storage | Trailing Spaces | Max Length |
|---|---|---|---|
| `CHAR(n)` | Fixed-length, padded with spaces | Preserved (padded) | n characters |
| `VARCHAR(n)` | Variable-length | Stripped on comparison | n characters |
| `TEXT` | Variable-length, unlimited | Not padded | Unlimited |

### PostgreSQL-specific behavior

In PostgreSQL, **all three types are stored identically under the hood**. There is **no performance difference** between `VARCHAR(255)` and `TEXT`. This is unlike MySQL, where `CHAR` vs `VARCHAR` has more significant storage differences.

```sql
-- These are essentially the same in PostgreSQL
name VARCHAR(100)
name TEXT

-- CHAR pads with spaces to the declared length
CHAR(10) storing 'hello' → 'hello     '
```

### Recommendations
- Use `TEXT` for most string columns — no artificial length limit
- Use `VARCHAR(n)` when you have a real business constraint (e.g., a 2-letter country code)
- Avoid `CHAR(n)` in PostgreSQL — the space-padding behavior is usually surprising

```sql
-- Best practice: use TEXT with a CHECK constraint if needed
ALTER TABLE users ADD CONSTRAINT check_username_length 
  CHECK (LENGTH(username) <= 50);
```

---

## 1.7 Difference between DELETE, TRUNCATE, and DROP

| Operation | What it does | WHERE clause | Rollback | Triggers | Speed |
|---|---|---|---|---|---|
| `DELETE` | Removes specific rows | Yes | Yes (inside transaction) | Fires row-level triggers | Slow for large tables |
| `TRUNCATE` | Removes all rows | No | Yes (inside transaction) | Fires `TRUNCATE` triggers | Very fast |
| `DROP` | Removes the entire table | No | Yes (inside transaction) | N/A | Instant |

```sql
-- DELETE: removes rows matching condition
DELETE FROM orders WHERE created_at < '2020-01-01';

-- TRUNCATE: removes all rows, resets sequences
TRUNCATE TABLE orders;
TRUNCATE TABLE orders RESTART IDENTITY; -- also resets SERIAL counters
TRUNCATE TABLE orders, order_items CASCADE; -- truncate related tables

-- DROP: removes the table structure entirely
DROP TABLE orders;
DROP TABLE IF EXISTS orders CASCADE; -- also drops dependent views/FKs
```

### Key Differences in Detail

**DELETE**:
- Creates dead row versions (MVCC) → VACUUM needed afterward
- Can use WHERE clause to target specific rows
- Fires row-level `BEFORE DELETE` and `AFTER DELETE` triggers
- Logged in WAL row-by-row (can be slow)
- Safe for large tables only if deleting a small fraction of rows

**TRUNCATE**:
- Physically removes data pages → no dead tuples, no bloat
- Resets high-water mark for sequential scans
- Much faster than DELETE for removing all rows
- In PostgreSQL, TRUNCATE is transactional (unlike MySQL)
- Acquires `ACCESS EXCLUSIVE` lock — blocks all concurrent access

**DROP**:
- Removes the table definition and all its data
- Cascades to dependent objects (views, foreign keys, indexes) with `CASCADE`
- Irreversible if not in a transaction

---

## 1.8 Difference between UNION and UNION ALL

Both combine results from two or more SELECT queries.

```sql
-- UNION: removes duplicates (like SELECT DISTINCT)
SELECT city FROM customers
UNION
SELECT city FROM suppliers;

-- UNION ALL: keeps all rows including duplicates
SELECT city FROM customers
UNION ALL
SELECT city FROM suppliers;
```

| Aspect | UNION | UNION ALL |
|---|---|---|
| Duplicates | Removed | Kept |
| Performance | Slower (sort + dedup) | Faster |
| Use case | Need distinct values | All values needed, or guaranteed no duplication |

**Rules for both**:
- Same number of columns in each SELECT
- Corresponding columns must have compatible data types
- Column names come from the **first** SELECT

**Performance tip**: Always use `UNION ALL` when you know there are no duplicates or you don't care about them. `UNION` performs an implicit `DISTINCT` operation which requires sorting or hashing.

---

## 1.9 Difference between JOIN types

```sql
-- Sample data
-- Table: employees        Table: departments
-- id | name | dept_id    -- id | name
-- 1  | Alice | 1         -- 1  | Engineering
-- 2  | Bob   | 2         -- 2  | Marketing
-- 3  | Carol | NULL      -- 3  | HR (no employees)
```

### INNER JOIN
Returns rows where there is a match in **both** tables.

```sql
SELECT e.name, d.name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;
-- Result: Alice/Engineering, Bob/Marketing
-- Carol (no dept) and HR (no employees) are excluded
```

### LEFT JOIN (LEFT OUTER JOIN)
Returns **all rows from the left table**, plus matching rows from the right. Non-matching right rows are NULL.

```sql
SELECT e.name, d.name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;
-- Result: Alice/Engineering, Bob/Marketing, Carol/NULL
-- Carol is included even though she has no department
```

### RIGHT JOIN (RIGHT OUTER JOIN)
Returns **all rows from the right table**, plus matching rows from the left.

```sql
SELECT e.name, d.name
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id;
-- Result: Alice/Engineering, Bob/Marketing, NULL/HR
-- HR is included even though it has no employees
```

### FULL JOIN (FULL OUTER JOIN)
Returns all rows from **both** tables, with NULLs where there's no match.

```sql
SELECT e.name, d.name
FROM employees e
FULL JOIN departments d ON e.dept_id = d.id;
-- Result: Alice/Engineering, Bob/Marketing, Carol/NULL, NULL/HR
```

### CROSS JOIN
Returns the Cartesian product — every combination of rows.

```sql
SELECT e.name, d.name
FROM employees e
CROSS JOIN departments d;
-- Result: 3 employees × 3 departments = 9 rows
```

---

## 1.10 Difference between WHERE and HAVING

| Aspect | WHERE | HAVING |
|---|---|---|
| When applied | Before grouping | After grouping |
| Can use aggregates? | No | Yes |
| Operates on | Individual rows | Groups |

```sql
-- WHERE filters individual rows BEFORE GROUP BY
SELECT dept_id, COUNT(*) 
FROM employees
WHERE salary > 50000       -- filter rows first
GROUP BY dept_id;

-- HAVING filters groups AFTER GROUP BY
SELECT dept_id, COUNT(*) as headcount
FROM employees
GROUP BY dept_id
HAVING COUNT(*) > 5;       -- filter groups after aggregation

-- Both together
SELECT dept_id, AVG(salary) as avg_salary
FROM employees
WHERE status = 'active'    -- remove inactive employees first
GROUP BY dept_id
HAVING AVG(salary) > 60000; -- then filter departments by avg salary
```

**Performance note**: Always put conditions in `WHERE` when possible. Filtering rows before grouping means less data to aggregate.

---

# 2. Indexes

---

## 2.1 What is an index and how does it improve performance?

An **index** is a separate data structure that the database maintains to allow faster row lookups. Without an index, PostgreSQL must perform a **sequential scan** — reading every row in the table to find matching rows. An index allows PostgreSQL to jump directly to the relevant rows.

### Analogy
Think of a book's index. Without it, you'd read every page to find "quantum entanglement." With it, you jump directly to page 347.

### How indexes work in PostgreSQL

1. You create an index on one or more columns
2. PostgreSQL builds a separate data structure (e.g., B-Tree) that maps column values → physical row locations (called `ctid` or heap tuple pointers)
3. When a query filters on an indexed column, PostgreSQL uses the index to find the matching `ctid` values, then fetches only those rows from the table

```sql
-- Without index: sequential scan of all 10M rows
SELECT * FROM orders WHERE customer_id = 12345;

-- Create an index
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- Now PostgreSQL uses the index: O(log n) lookup
SELECT * FROM orders WHERE customer_id = 12345;
```

### Costs of indexes
- **Write overhead**: every INSERT, UPDATE, DELETE must also update the index
- **Storage**: indexes take disk space
- **Maintenance**: VACUUM must also process index bloat
- **Planning time**: optimizer must evaluate more possible plans

---

## 2.2 Clustered vs Non-Clustered Indexes

PostgreSQL doesn't have "clustered indexes" in the SQL Server sense, but the concept is worth understanding.

### Conceptual difference

**Clustered index**: The physical order of rows on disk matches the index order. There can be only one clustered index per table. In SQL Server/MySQL InnoDB, the primary key is the clustered index.

**Non-clustered index**: A separate data structure that points back to the heap (the actual table data). Multiple non-clustered indexes per table are allowed.

### PostgreSQL's approach

PostgreSQL stores all tables as **heap files** (unordered). All indexes are technically "non-clustered" — they point back to heap tuples.

However, PostgreSQL has the `CLUSTER` command:

```sql
-- Physically reorder the table to match the index order
CLUSTER orders USING idx_orders_created_at;
-- After this, the table rows are physically sorted by created_at
-- But this order degrades over time as new rows are inserted
```

**Key point**: In PostgreSQL, the primary key is just a regular B-Tree index. Rows are not physically stored in primary key order (unlike MySQL InnoDB). This means primary key lookups in PostgreSQL do a **heap fetch** after the index lookup.

### Index-Only Scans (covering indexes)

PostgreSQL can avoid heap fetches entirely if all needed columns are in the index:

```sql
CREATE INDEX idx_orders_covering ON orders(customer_id) INCLUDE (total, status);
-- Query can be answered entirely from the index
SELECT total, status FROM orders WHERE customer_id = 123;
```

---

## 2.3 What is a B-Tree index and why is it the default?

A **B-Tree (Balanced Tree)** is a self-balancing tree data structure where:
- All leaf nodes are at the same depth
- Each node contains sorted keys
- Search, insert, delete are all O(log n)

### Why B-Tree is the default

1. **Versatile**: supports equality (`=`), range (`<`, `>`, `BETWEEN`), prefix matching (`LIKE 'foo%'`)
2. **Always balanced**: O(log n) performance regardless of data distribution
3. **Sorted**: supports `ORDER BY` and `MIN`/`MAX` without sorting
4. **Null handling**: B-Trees can include NULL values
5. **Unique enforcement**: used for PRIMARY KEY and UNIQUE constraints

```sql
-- B-Tree supports all these query types
WHERE age = 25           -- equality
WHERE age > 18           -- range
WHERE age BETWEEN 18 AND 65  -- range
WHERE name LIKE 'John%'  -- prefix (only left-anchored)
ORDER BY age             -- uses index order, avoids sort step
```

### B-Tree Structure

```
              [50]
           /        \
       [25]          [75]
      /    \        /    \
  [10,20] [30,40] [60,70] [80,90]
```

Each lookup traverses from root to leaf: O(log n). For a table with 1 billion rows, a B-Tree index is only about 30 levels deep.

---

## 2.4 When should you use a Hash index?

A **Hash index** maps column values to hash buckets. It only supports **equality lookups** (`=`).

```sql
CREATE INDEX idx_users_email_hash ON users USING HASH (email);
-- Only useful for: WHERE email = 'foo@example.com'
-- Useless for: WHERE email LIKE 'foo%', ORDER BY email
```

### When to use Hash indexes

- Column is used **exclusively** with equality conditions
- Values have **high cardinality** (many unique values) — hash indexes are good at this
- B-Tree would be less efficient for pure equality on very long strings

### Hash vs B-Tree for equality

In PostgreSQL, B-Tree is so well-optimized that **Hash indexes rarely offer meaningful speedup** for equality lookups. The main reason to choose Hash today:

- Slightly smaller index size for large string keys
- Marginally faster equality lookups on very high-cardinality columns

**Practical advice**: Start with B-Tree. Switch to Hash only if profiling shows it's beneficial.

**Note**: Before PostgreSQL 10, Hash indexes were not WAL-logged and not crash-safe. Since PostgreSQL 10, they are fully crash-safe.

---

## 2.5 What is a GIN index and where is it used?

**GIN (Generalized Inverted Index)** is designed for values that contain **multiple component values** — like arrays, JSONB, full-text search vectors, and range types.

### How GIN works

A GIN index creates an **inverted index**: for each component value (e.g., each word in a text, each element in an array), it stores a list of all rows that contain that value.

Think of it like a search engine's index: "the word 'PostgreSQL' appears in documents 1, 5, 23, 102..."

### Use cases

**1. Full-Text Search**
```sql
-- Create GIN index on tsvector column
CREATE INDEX idx_articles_fts ON articles USING GIN(to_tsvector('english', body));

-- Query
SELECT title FROM articles 
WHERE to_tsvector('english', body) @@ to_tsquery('postgresql & index');
```

**2. JSONB documents**
```sql
CREATE INDEX idx_products_attrs ON products USING GIN(attributes);

-- Query using JSONB containment operator @>
SELECT * FROM products WHERE attributes @> '{"color": "red"}';

-- Query for key existence
SELECT * FROM products WHERE attributes ? 'discount';
```

**3. Array columns**
```sql
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- Find posts containing specific tag
SELECT * FROM posts WHERE tags @> ARRAY['postgresql'];

-- Find posts with any of these tags
SELECT * FROM posts WHERE tags && ARRAY['postgresql', 'database'];
```

### GIN trade-offs

- **Faster reads**: excellent for multi-value lookups
- **Slower writes**: building the inverted index has overhead
- **Larger size**: usually larger than B-Tree
- **Partial GIN**: use `gin_pending_list_limit` to control write buffering

---

## 2.6 What is a GiST index?

**GiST (Generalized Search Tree)** is a framework for building custom index types. It's not one index type but a template that supports complex data types with custom distance/comparison operators.

### Use cases

**1. Geometric data (PostGIS)**
```sql
CREATE INDEX idx_locations_geom ON locations USING GIST(location);

-- Find points within 1km radius
SELECT * FROM locations 
WHERE ST_DWithin(location, ST_MakePoint(-73.9857, 40.7484)::geography, 1000);
```

**2. Range types**
```sql
CREATE INDEX idx_reservations_period ON reservations USING GIST(during);

-- Find reservations overlapping a time period
SELECT * FROM reservations 
WHERE during && '[2024-01-01, 2024-01-07)'::tsrange;
```

**3. Full-Text Search (alternative to GIN)**
```sql
CREATE INDEX idx_docs_fts ON documents USING GIST(to_tsvector('english', content));
-- GiST is lossy (can produce false positives, requires recheck)
-- GIN is preferred for FTS because it's lossless
```

### GiST vs GIN

| Aspect | GiST | GIN |
|---|---|---|
| Write speed | Faster | Slower |
| Read speed (lookup) | Slightly slower | Faster |
| Lossy? | Can be (requires recheck) | Lossless |
| Use case | Geometric, range, nearest-neighbor | FTS, JSONB, arrays |
| Nearest-neighbor (`<->`) | Yes | No |

---

## 2.7 What is a BRIN index?

**BRIN (Block Range Index)** stores summary information (min/max values) for ranges of physical disk blocks, rather than indexing individual rows.

### How it works

PostgreSQL divides the table into **block ranges** (default: 128 blocks). For each range, BRIN stores:
- The minimum value in that range
- The maximum value in that range

A query checks: "does my value fall within [min, max] of this block range?" If not, skip the whole range.

### When BRIN is effective

BRIN is **only useful when there is a strong correlation between the column value and the physical storage order**. This happens naturally with:

- **Timestamp/date columns** where rows are inserted chronologically
- **Auto-increment IDs** that increase monotonically
- **Sensor data**, **log data**, **time-series data**

```sql
-- Perfect use case: events table with timestamps, inserted in order
CREATE INDEX idx_events_brin ON events USING BRIN(occurred_at);

-- Effective query: looking up a time range
SELECT * FROM events WHERE occurred_at BETWEEN '2024-01-01' AND '2024-01-31';
-- BRIN quickly skips all block ranges whose [min,max] don't overlap
```

### BRIN vs B-Tree

| Aspect | BRIN | B-Tree |
|---|---|---|
| Size | Tiny (fraction of B-Tree) | Large |
| Build time | Very fast | Slower |
| Lookup precision | Imprecise (block ranges) | Exact row |
| Best for | Huge tables, sequential data | Any table, any access pattern |
| Effectiveness | Depends on data correlation | Always effective |

**Use BRIN when**: table has billions of rows, column is highly correlated with insertion order, and you can tolerate reading some extra rows (BRIN may return false positives that need to be rechecked).

---

## 2.8 How do Composite Indexes work?

A **composite index** (multi-column index) covers multiple columns in a defined order.

```sql
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
```

### Query matching

PostgreSQL can use this index for:
```sql
-- Full index usage (both columns)
WHERE customer_id = 123 AND status = 'pending'

-- Partial index usage (leftmost column only)
WHERE customer_id = 123

-- Partial + range on second column
WHERE customer_id = 123 AND status > 'p'
```

PostgreSQL **cannot** efficiently use this index for:
```sql
-- Missing leftmost column
WHERE status = 'pending'
-- PostgreSQL may still use it via bitmap scan but it's inefficient
```

### Column order matters

Put the **most selective** or **most frequently filtered** column first:

```sql
-- If most queries filter by customer_id first:
CREATE INDEX ON orders(customer_id, status, created_at);

-- If most queries filter by status first, but status has low cardinality:
-- Consider a separate index for status or a partial index
```

### How it works internally

A composite B-Tree index sorts by the first column, then by the second within the first, and so on. Like sorting a phone book by (last_name, first_name).

---

## 2.9 What is the Leftmost Prefix Rule?

The **leftmost prefix rule** states that a composite index can be used for queries that filter on the **leftmost columns** of the index, in order.

```sql
CREATE INDEX idx ON t(a, b, c);

-- ✅ Uses index fully
WHERE a = 1 AND b = 2 AND c = 3

-- ✅ Uses index on (a, b)
WHERE a = 1 AND b = 2

-- ✅ Uses index on (a)
WHERE a = 1

-- ✅ Uses index on (a) with range on (b)
WHERE a = 1 AND b > 5

-- ❌ Cannot use index efficiently (skips leftmost)
WHERE b = 2

-- ❌ Cannot use index efficiently (skips leftmost)
WHERE b = 2 AND c = 3

-- ❌ After a range condition on a column, remaining columns are not usable
WHERE a > 1 AND b = 2  -- only (a) part used for range; (b) can't be used
```

### Why this rule exists

The index sorts by `a`, then by `b` within each `a`, then by `c` within each `(a, b)` pair. Without knowing `a`, you can't efficiently navigate the index to find specific `b` values — you'd have to scan the whole thing.

---

## 2.10 Why can too many indexes hurt performance?

### Write overhead

Every index must be updated on every write:

```sql
-- If orders table has 10 indexes, this single INSERT updates 10 index structures
INSERT INTO orders (customer_id, product_id, status, ...) VALUES (...);
```

For write-heavy tables, this can be a significant bottleneck.

### Planner overhead

PostgreSQL's query planner evaluates possible query plans. With 10 indexes on a table, the planner has more combinations to consider. Planning time increases.

### Storage

Each index takes disk space. Large tables with many indexes can double or triple storage requirements.

### Bloat

Each index accumulates dead entries from UPDATE/DELETE, requiring VACUUM to clean them up.

### Poor plan choices

Paradoxically, having too many indexes can lead PostgreSQL to **choose a worse plan** — picking an inefficient index when a sequential scan would be faster.

### Guidelines

- Index columns used in `WHERE`, `JOIN ON`, `ORDER BY`, `GROUP BY`
- Remove unused indexes (`pg_stat_user_indexes` shows `idx_scan` count)
- Prefer composite indexes over multiple single-column indexes when queries use multiple columns together
- Use `EXPLAIN ANALYZE` to verify index usage

```sql
-- Find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

---

# 3. Query Optimization

---

## 3.1 How do you identify a slow query?

### pg_stat_statements (most important extension)

```sql
-- Enable it
CREATE EXTENSION pg_stat_statements;

-- Find slowest queries by total time
SELECT 
    query,
    calls,
    total_exec_time / 1000 AS total_seconds,
    mean_exec_time AS avg_ms,
    rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;

-- Find queries with highest average execution time
SELECT query, calls, mean_exec_time, stddev_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Find queries doing the most sequential scans relative to rows
SELECT query, rows, calls
FROM pg_stat_statements
ORDER BY rows / NULLIF(calls, 0) DESC;
```

### pg_stat_activity (currently running queries)

```sql
-- Find currently running queries, longest first
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
AND state != 'idle';

-- Kill a slow query
SELECT pg_cancel_backend(pid);   -- graceful
SELECT pg_terminate_backend(pid); -- forceful
```

### log_min_duration_statement

```sql
-- In postgresql.conf: log queries taking longer than 1 second
log_min_duration_statement = 1000  -- milliseconds

-- Or set per session
SET log_min_duration_statement = 500;
```

### auto_explain

```sql
-- Automatically log EXPLAIN ANALYZE for slow queries
LOAD 'auto_explain';
SET auto_explain.log_min_duration = 1000;
SET auto_explain.log_analyze = true;
```

---

## 3.2 What does EXPLAIN do?

`EXPLAIN` shows the **query plan** that PostgreSQL's optimizer has chosen to execute a query, without actually running it.

```sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 123;

-- Output:
Index Scan using idx_orders_customer_id on orders  (cost=0.43..8.45 rows=5 width=120)
  Index Cond: (customer_id = 123)
```

### Reading EXPLAIN output

**cost=0.43..8.45**:
- `0.43` = startup cost (cost before first row returned)
- `8.45` = total cost (cost to return all rows)
- Cost units are **arbitrary** (not milliseconds) — they represent relative I/O and CPU cost

**rows=5**: PostgreSQL's estimate of how many rows will be returned

**width=120**: estimated average row size in bytes

### Plan nodes (bottom-up execution)

```sql
EXPLAIN SELECT o.id, c.name 
FROM orders o 
JOIN customers c ON o.customer_id = c.id 
WHERE o.status = 'pending';

-- Hash Join  (cost=100.0..500.0 rows=1000 width=50)
--   Hash Cond: (o.customer_id = c.id)
--   ->  Seq Scan on orders o  (cost=0..300 rows=5000 width=30)
--         Filter: (status = 'pending')
--   ->  Hash  (cost=50..50 rows=4000 width=20)
--         ->  Seq Scan on customers c  (cost=0..50 rows=4000 width=20)
```

Plans are read **bottom-up** (inner nodes execute first, results bubble up).

---

## 3.3 EXPLAIN vs EXPLAIN ANALYZE

| Aspect | EXPLAIN | EXPLAIN ANALYZE |
|---|---|---|
| Runs the query? | No | **Yes** |
| Shows estimates | Yes | Yes |
| Shows actuals | No | Yes |
| Safe for writes? | Yes | **No — actually executes** |
| Use for | Understanding plan | Debugging estimates vs actuals |

```sql
-- EXPLAIN: safe, shows estimated plan
EXPLAIN SELECT * FROM orders WHERE customer_id = 123;

-- EXPLAIN ANALYZE: runs the query, shows actual vs estimated
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 123;

-- EXPLAIN ANALYZE with all options (PostgreSQL 9.0+)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
SELECT * FROM orders WHERE customer_id = 123;
```

### EXPLAIN ANALYZE output

```
Index Scan using idx_orders_customer_id on orders
  (cost=0.43..8.45 rows=5 width=120)
  (actual time=0.045..0.048 rows=3 loops=1)
  Index Cond: (customer_id = 123)
Buffers: shared hit=4
Planning Time: 0.123 ms
Execution Time: 0.087 ms
```

- `actual time=0.045..0.048` — real startup and total time in milliseconds
- `rows=3` — actual rows returned (vs estimated 5)
- `loops=1` — how many times this node was executed (important for nested loops)
- `Buffers: shared hit=4` — pages found in shared_buffers (cache hits)

### Using EXPLAIN ANALYZE safely for writes

```sql
-- Wrap in a transaction and rollback to avoid actually committing
BEGIN;
EXPLAIN ANALYZE UPDATE orders SET status = 'done' WHERE customer_id = 123;
ROLLBACK;
```

---

## 3.4 What is a Sequential Scan?

A **Sequential Scan (Seq Scan)** reads every row in the table from beginning to end.

```
Seq Scan on orders  (cost=0.00..15420.00 rows=1000000 width=120)
```

### When PostgreSQL chooses a Seq Scan

1. **No index** on the filtered column
2. **High selectivity** — the query returns a large fraction of the table (>5-20%). Reading the full table is cheaper than random I/O for index lookups
3. **Statistics are stale** — PostgreSQL underestimates how many rows will be returned
4. **Table is tiny** — reading 100 rows via index would be more overhead than a seq scan

### Seq Scan is not always bad

For small tables or queries returning most rows, a seq scan is the **correct** choice. Don't blindly add indexes to avoid seq scans.

```sql
-- These are fine as seq scans:
SELECT COUNT(*) FROM orders;  -- needs all rows
SELECT * FROM config;         -- 10-row table
SELECT * FROM orders WHERE status = 'pending' AND 30% of rows are pending
```

---

## 3.5 What is an Index Scan?

An **Index Scan** navigates the B-Tree (or other index structure) to find matching entries, then fetches the actual rows from the heap.

```
Index Scan using idx_orders_customer_id on orders
  (cost=0.43..8.45 rows=3 width=120)
  Index Cond: (customer_id = 123)
```

### Process

1. Traverse B-Tree to find the key(s)
2. Retrieve heap tuple pointer(s) (`ctid`)
3. Fetch each row from the heap (random I/O)

### Index Only Scan

If all required columns are in the index (covering index), PostgreSQL can skip the heap fetch entirely:

```sql
CREATE INDEX idx_orders_covering ON orders(customer_id) INCLUDE (total);
SELECT total FROM orders WHERE customer_id = 123;
-- Index Only Scan: no heap access needed
```

The output shows:
```
Index Only Scan using idx_orders_covering on orders
  Heap Fetches: 0
```

**Note**: Index Only Scans require the visibility map to be up-to-date. VACUUM populates the visibility map. In tables with lots of writes, `Heap Fetches` may not be 0 even with a covering index.

---

## 3.6 What is a Bitmap Index Scan?

A **Bitmap Index Scan** is a two-phase approach for when an Index Scan would require too many random heap accesses.

### Phase 1: Bitmap Heap Scan + Bitmap Index Scan

```
Bitmap Heap Scan on orders  (cost=50.0..500.0 rows=5000 width=120)
  Recheck Cond: (status = 'pending')
  ->  Bitmap Index Scan on idx_orders_status
        Index Cond: (status = 'pending')
```

1. **Bitmap Index Scan**: Reads the index and builds an **in-memory bitmap** of all matching page locations (not individual rows). Each bit = one heap page.
2. **Bitmap Heap Scan**: Reads the marked heap pages in **physical order** (sorted by disk location), minimizing random I/O.

### Why Bitmap Scan?

- Better than Index Scan when returning many rows (avoids random I/O per row)
- Better than Seq Scan when returning a moderate fraction of rows
- Can **combine multiple indexes** with AND/OR:

```sql
-- PostgreSQL combines two bitmap scans with BitmapAnd
SELECT * FROM orders WHERE status = 'pending' AND customer_id = 123;

BitmapAnd
  ->  Bitmap Index Scan on idx_orders_status
  ->  Bitmap Index Scan on idx_orders_customer_id
```

### When you see "Recheck Cond"

The bitmap is lossy at the page level when it doesn't fit in memory — PostgreSQL marks whole pages and must recheck each row in those pages. This is normal and not a sign of a problem.

---

## 3.7 Why might PostgreSQL ignore an index?

### 1. Poor selectivity
The optimizer estimates that the index would return too many rows:
```sql
-- If 50% of orders have status='active', a seq scan is likely faster
SELECT * FROM orders WHERE status = 'active';
```

### 2. Stale statistics
`ANALYZE` updates statistics. If stats are stale, the planner may misjudge selectivity.

```sql
ANALYZE orders;
-- Or let autovacuum handle it automatically
```

### 3. Data type mismatch
```sql
-- Index on integer column, but comparing with a string
CREATE INDEX idx_id ON orders(id);  -- id is INTEGER
WHERE id = '123'  -- implicit cast may prevent index use
-- Fix: use WHERE id = 123
```

### 4. Function applied to indexed column
```sql
-- Index on email
WHERE UPPER(email) = 'FOO@EXAMPLE.COM'  -- index not used
-- Fix: CREATE INDEX ON users(UPPER(email)) -- expression index
```

### 5. LIKE with leading wildcard
```sql
WHERE name LIKE '%smith'  -- can't use B-Tree index
WHERE name LIKE 'smith%'  -- ✅ can use B-Tree index
```

### 6. Low `random_page_cost` setting
```sql
-- For SSDs, lower this to make index scans more attractive
SET random_page_cost = 1.1;  -- default is 4.0 (optimized for spinning disks)
```

### 7. Force index use for testing
```sql
-- Temporarily disable seq scans to force index usage (testing only)
SET enable_seqscan = off;
EXPLAIN SELECT * FROM orders WHERE status = 'pending';
-- Don't leave this disabled in production!
```

---

## 3.8 Query Planning and Execution

### The Query Lifecycle

```
SQL Text
  → Parser (syntax check, parse tree)
  → Analyzer/Rewriter (semantic check, rule application)
  → Planner/Optimizer (generate & evaluate plans, choose best)
  → Executor (execute the chosen plan)
  → Results
```

### The Planner

The planner is a **cost-based optimizer**. It:

1. Generates possible access methods (seq scan, index scan, etc.) for each table
2. Generates possible join orders and methods (hash join, nested loop, merge join)
3. Estimates the cost of each plan using statistics
4. Chooses the plan with the **lowest estimated cost**

### Key statistics used

```sql
-- See table statistics
SELECT * FROM pg_stats WHERE tablename = 'orders' AND attname = 'customer_id';

-- Most useful columns:
-- n_distinct: number of distinct values (or negative fraction)
-- most_common_vals: most frequent values
-- most_common_freqs: frequency of each common value
-- histogram_bounds: distribution of values
```

### Join algorithms

| Algorithm | Best for |
|---|---|
| **Nested Loop** | Small tables, index on inner table |
| **Hash Join** | Large tables, equality joins |
| **Merge Join** | Pre-sorted inputs, equality joins |

```sql
-- Force specific join types for testing
SET enable_hashjoin = off;
SET enable_mergejoin = off;
SET enable_nestloop = off;
```

---

## 3.9 Common Causes of Slow Queries

1. **Missing indexes** — `EXPLAIN` shows `Seq Scan` on large tables with low selectivity

2. **Stale statistics** — planner makes poor choices because `pg_stats` is outdated
   ```sql
   ANALYZE tablename;
   ```

3. **N+1 queries** — application fetches one record, then N more in a loop
   ```sql
   -- Bad: 1 query for users + N queries for their orders
   -- Good: JOIN or batch fetch
   ```

4. **Too many rows returned** — missing `LIMIT`, returning more data than needed

5. **Inefficient joins** — joining in wrong order, missing join indexes

6. **Lock contention** — queries waiting for locks
   ```sql
   SELECT * FROM pg_locks WHERE NOT granted;
   ```

7. **Table/index bloat** — dead tuples slow down reads, VACUUM needed

8. **Connection overhead** — too many connections, use connection pooling

9. **`SELECT *`** — fetching unneeded columns, especially large TEXT/JSONB

10. **Non-sargable predicates** — conditions that prevent index use
    ```sql
    -- Bad (non-sargable): function on column
    WHERE DATE_TRUNC('day', created_at) = '2024-01-01'
    -- Good (sargable): range condition
    WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'
    ```

---

# 4. Transactions & Concurrency

---

## 4.1 What is a transaction?

A **transaction** is a unit of work that groups one or more SQL statements into an all-or-nothing operation.

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- both updates persist
-- or ROLLBACK; to undo both
```

### Savepoints

PostgreSQL supports **savepoints** — partial rollback points within a transaction:

```sql
BEGIN;
INSERT INTO orders (customer_id, total) VALUES (1, 100);
SAVEPOINT after_insert;
UPDATE inventory SET qty = qty - 1 WHERE product_id = 5;
-- Oops, product out of stock
ROLLBACK TO SAVEPOINT after_insert;  -- undo the inventory update
-- Order insert is still in place
COMMIT;
```

### Autocommit

By default in PostgreSQL (via `psql` or most ORMs), each statement is its own transaction. Explicitly using `BEGIN...COMMIT` groups statements.

---

## 4.2 & 4.3 Transaction Isolation Levels

PostgreSQL supports four isolation levels defined by SQL standard:

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| Read Uncommitted | Possible* | Possible | Possible |
| **Read Committed** (default) | Not possible | Possible | Possible |
| Repeatable Read | Not possible | Not possible | Not possible** |
| Serializable | Not possible | Not possible | Not possible |

*PostgreSQL's Read Uncommitted behaves like Read Committed (it never shows dirty reads)
**PostgreSQL's Repeatable Read also prevents phantom reads due to MVCC

### Read Committed (default)

Each statement within a transaction sees a **fresh snapshot** as of the start of that statement.

```sql
-- Transaction A reads balance = 1000
-- Transaction B commits UPDATE setting balance = 500
-- Transaction A reads again → sees 500 (new value)
-- This is a non-repeatable read, allowed in Read Committed
```

### Repeatable Read

The snapshot is taken at the **start of the transaction** and all reads see that snapshot.

```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;
-- All reads in this transaction see the same snapshot
-- Changes by concurrent transactions are invisible
```

### Serializable

The highest isolation level. Transactions execute as if they were serial (one after another). PostgreSQL uses **Serializable Snapshot Isolation (SSI)** — a technique that detects conflicts and rolls back transactions that would violate serializability, without using heavy locking.

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
-- Any concurrent transactions that conflict will fail with:
-- ERROR: could not serialize access due to concurrent update
```

---

## 4.4 Dirty Reads, Non-Repeatable Reads, and Phantom Reads

### Dirty Read
Reading uncommitted data from another transaction.

```
T1: UPDATE balance = 500 (not committed yet)
T2: SELECT balance → sees 500 (dirty read!)
T1: ROLLBACK → balance is still 1000
T2: acted on wrong data
```

PostgreSQL **never** allows dirty reads.

### Non-Repeatable Read
Reading the same row twice in a transaction and getting different values because another transaction committed a change.

```
T1: SELECT balance → 1000
T2: UPDATE balance = 500; COMMIT
T1: SELECT balance → 500 (different value!)
```

Allowed in **Read Committed**, prevented in **Repeatable Read** and above.

### Phantom Read
Running the same query twice and seeing different rows appear because another transaction inserted new rows.

```
T1: SELECT COUNT(*) FROM orders WHERE status='pending' → 5
T2: INSERT INTO orders (status='pending'); COMMIT
T1: SELECT COUNT(*) FROM orders WHERE status='pending' → 6 (phantom row!)
```

Prevented only in **Serializable** (in standard SQL). PostgreSQL's **Repeatable Read** also prevents phantom reads due to snapshot isolation.

---

## 4.5 Row-Level Locking

PostgreSQL supports **row-level locks** that allow concurrent access to different rows within the same table.

### Lock modes

```sql
-- Strongest: prevents any concurrent access
SELECT ... FOR UPDATE

-- Weaker: allows concurrent SELECT FOR SHARE, prevents FOR UPDATE
SELECT ... FOR SHARE

-- Skip locked rows instead of waiting
SELECT ... FOR UPDATE SKIP LOCKED

-- Return NULL for locked rows instead of waiting
SELECT ... FOR UPDATE NOWAIT
```

### FOR UPDATE vs FOR SHARE

| Lock | Blocks | Typical Use |
|---|---|---|
| `FOR UPDATE` | Other `FOR UPDATE`, `FOR SHARE`, writes | You intend to update the row |
| `FOR SHARE` | Other `FOR UPDATE`, writes | You want to prevent updates while reading |
| `FOR NO KEY UPDATE` | `FOR UPDATE`, `FOR SHARE`, writes (not key-only updates) | Updating non-PK columns |
| `FOR KEY SHARE` | `FOR UPDATE` only | Foreign key checks |

```sql
-- Pattern: select for update, then modify
BEGIN;
SELECT * FROM inventory WHERE product_id = 123 FOR UPDATE;
-- Other transactions trying to lock this row will wait
UPDATE inventory SET qty = qty - 1 WHERE product_id = 123;
COMMIT;
```

### SKIP LOCKED — Queue pattern

```sql
-- Worker process: pick next unprocessed job without blocking other workers
BEGIN;
SELECT * FROM jobs
WHERE status = 'pending'
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED;

UPDATE jobs SET status = 'processing' WHERE id = <fetched_id>;
COMMIT;
```

This is a common pattern for building job queues in PostgreSQL.

---

## 4.7 & 4.8 Deadlocks

A **deadlock** occurs when two or more transactions are each waiting for the other to release a lock.

```
T1: locks row A, waits for row B
T2: locks row B, waits for row A
→ Neither can proceed → deadlock
```

### PostgreSQL's deadlock detection

PostgreSQL runs a deadlock detection algorithm periodically (every `deadlock_timeout`, default 1 second). When a deadlock is detected, PostgreSQL **aborts one of the transactions** (the one that is cheapest to abort) and returns:

```
ERROR: deadlock detected
DETAIL: Process 12345 waits for ShareLock on transaction 67890; 
        blocked by process 98765.
```

### Preventing deadlocks

1. **Always acquire locks in the same order**: If T1 and T2 both lock row A before row B, deadlocks can't occur.

2. **Keep transactions short**: Less time holding locks = less chance of conflicts.

3. **Use `SELECT ... FOR UPDATE` with explicit ordering**:
   ```sql
   -- Sort the rows you're going to lock, lock them in consistent order
   SELECT * FROM accounts 
   WHERE id IN (1, 2) 
   ORDER BY id 
   FOR UPDATE;
   ```

4. **Use advisory locks for application-level coordination**:
   ```sql
   SELECT pg_advisory_lock(12345);  -- application-defined lock key
   -- ... do work ...
   SELECT pg_advisory_unlock(12345);
   ```

---

## 4.9 Optimistic vs Pessimistic Locking

### Pessimistic Locking
Assumes conflicts will happen. Locks the resource before accessing it.

```sql
-- Lock the row before reading, preventing anyone else from modifying it
BEGIN;
SELECT * FROM products WHERE id = 1 FOR UPDATE;
-- ... decide to update ...
UPDATE products SET stock = stock - 1 WHERE id = 1;
COMMIT;
```

**Pros**: Simple, no retry logic needed  
**Cons**: Locks held for duration of transaction, reduces concurrency, risk of deadlocks

### Optimistic Locking
Assumes conflicts are rare. Read without locking, then check if data changed before writing.

```sql
-- Add a version column
ALTER TABLE products ADD COLUMN version INTEGER DEFAULT 1;

-- Read without locking
SELECT id, stock, version FROM products WHERE id = 1;
-- Got: stock=10, version=5

-- Update only if version hasn't changed
UPDATE products 
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = 5;

-- Check if update succeeded (affected_rows = 0 means conflict)
-- If 0 rows: someone else modified it, retry the whole operation
```

**Pros**: No locks held during read phase, high concurrency  
**Cons**: Application must handle retry logic, can have high retry rate under contention

### When to use which

| Scenario | Use |
|---|---|
| High conflict rate | Pessimistic |
| Low conflict rate | Optimistic |
| Short transactions | Either |
| Long transactions (user input time) | Optimistic |
| Multi-step workflows | Pessimistic (to avoid retries) |

---

## 4.10 How MVCC helps avoid locking contention

MVCC eliminates the need for read locks entirely:

- **Without MVCC**: A read must wait for any concurrent write to complete
- **With MVCC**: A read sees the last committed version of the data and never waits for writes

```
T1: BEGIN; UPDATE accounts SET balance = 500 WHERE id = 1;
T2: BEGIN; SELECT balance FROM accounts WHERE id = 1;
-- T2 sees balance = 1000 (the old committed version)
-- T2 does NOT wait for T1 to commit
-- T1 and T2 run fully concurrently
```

The benefits:
1. **Long-running reports** don't block short write transactions
2. **Backup tools** (pg_dump) can run consistent backups without locking tables
3. **Read replicas** can serve reads while primary handles writes

The cost is the need for VACUUM to clean up old row versions — this is the fundamental trade-off of MVCC.

---

# 5. Partitioning & Scaling

---

## 5.1 What is Table Partitioning?

**Table partitioning** splits a large logical table into smaller physical tables called **partitions**, while presenting a single unified table interface to queries.

```sql
-- Create a partitioned table
CREATE TABLE orders (
    id BIGSERIAL,
    customer_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL,
    total NUMERIC(10,2)
) PARTITION BY RANGE (created_at);

-- Create partitions (child tables)
CREATE TABLE orders_2023 PARTITION OF orders
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE orders_2024 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Queries are transparently routed to the right partition(s)
SELECT * FROM orders WHERE created_at >= '2024-06-01';
-- Only queries orders_2024
```

### Benefits of partitioning

1. **Partition pruning**: queries only scan relevant partitions
2. **Faster maintenance**: `DROP TABLE orders_2020` vs deleting millions of rows
3. **Parallel I/O**: different partitions can be stored on different tablespaces
4. **Index size**: smaller per-partition indexes that fit in memory
5. **Archival**: move old partitions to slower/cheaper storage

---

## 5.2 Range, List, and Hash Partitioning

### Range Partitioning

Rows are assigned based on a column falling within a range. Most common for time-series data.

```sql
CREATE TABLE metrics PARTITION BY RANGE (measured_at);

CREATE TABLE metrics_jan_2024 PARTITION OF metrics
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE metrics_feb_2024 PARTITION OF metrics
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### List Partitioning

Rows are assigned based on a discrete set of values. Good for categorical data.

```sql
CREATE TABLE orders PARTITION BY LIST (region);

CREATE TABLE orders_us PARTITION OF orders
    FOR VALUES IN ('US', 'CA', 'MX');
CREATE TABLE orders_eu PARTITION OF orders
    FOR VALUES IN ('UK', 'DE', 'FR', 'ES');
CREATE TABLE orders_apac PARTITION OF orders
    FOR VALUES IN ('JP', 'AU', 'SG', 'IN');
```

### Hash Partitioning

Rows are assigned based on a hash of the partition key. Good for evenly distributing data when there's no natural range or list grouping.

```sql
CREATE TABLE users PARTITION BY HASH (id);

CREATE TABLE users_0 PARTITION OF users
    FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE users_1 PARTITION OF users
    FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE users_2 PARTITION OF users
    FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE users_3 PARTITION OF users
    FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

| Type | Best for | Partition pruning |
|---|---|---|
| Range | Time-series, sequential IDs | Excellent for range queries |
| List | Categorical (country, region, status) | Excellent for equality |
| Hash | Even distribution, no natural key | Only for equality on partition key |

---

## 5.3 When should partitioning be used?

Partitioning is beneficial when:

1. **Table is very large** (hundreds of GBs to TBs) and queries frequently filter on the partition key
2. **Data has a natural lifecycle** — old data is archived, deleted, or rarely accessed (time-based partitioning)
3. **Bulk delete/insert** — `DROP TABLE partition` is instantaneous vs deleting millions of rows
4. **Index size matters** — per-partition B-Tree indexes are smaller and more cache-friendly
5. **Parallel query** — different partitions can be scanned in parallel

Partitioning is **not beneficial** when:
- The table is small (partitioning overhead isn't worth it)
- Queries don't filter on the partition key (all partitions get scanned anyway)
- The partition key changes frequently (causing rows to move between partitions)

**Rule of thumb**: Consider partitioning when a table exceeds a few hundred GB or when you're regularly doing time-based data retention (deleting old data).

---

## 5.4 How does Partition Pruning work?

**Partition pruning** is the optimizer's ability to skip partitions that can't contain matching rows.

```sql
-- Partitioned by RANGE on created_at
EXPLAIN SELECT * FROM orders WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';

-- Plan shows:
-- Append
--   -> Seq Scan on orders_jan_2024
-- (orders_2023, orders_feb_2024, etc. are pruned)
```

### Static vs Runtime Pruning

**Static pruning**: happens at planning time when the partition key value is a literal constant.

**Runtime pruning** (PostgreSQL 11+): happens during execution when the partition key value comes from a parameter, function, or subquery.

```sql
-- Static pruning (constant in query)
WHERE created_at >= '2024-01-01'

-- Runtime pruning (value comes at runtime)
WHERE created_at >= $1  -- prepared statement parameter
WHERE created_at >= now() - interval '1 month'
```

### Pruning requires matching the partition key exactly

```sql
-- Partitioned by (created_at)
WHERE DATE_TRUNC('month', created_at) = '2024-01-01'
-- May NOT prune — function applied to column
-- Better:
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'
-- Prunes correctly
```

---

## 5.5 How would you handle a table with billions of rows?

A multi-layered approach:

### 1. Partitioning (as above)

### 2. Index strategy

```sql
-- Partial indexes on commonly filtered subsets
CREATE INDEX idx_orders_pending ON orders(created_at) WHERE status = 'pending';

-- Covering indexes to avoid heap fetches
CREATE INDEX idx_orders_covering ON orders(customer_id, created_at) 
  INCLUDE (total, status);

-- BRIN index for time-ordered data
CREATE INDEX idx_orders_brin ON orders USING BRIN(created_at);
```

### 3. Archival strategy

```sql
-- Move old data to archive table
INSERT INTO orders_archive SELECT * FROM orders WHERE created_at < '2020-01-01';
DELETE FROM orders WHERE created_at < '2020-01-01';
-- Or: just DROP the old partition
```

### 4. Read replicas

Route read-only analytical queries to read replicas, relieving the primary.

### 5. Denormalization / materialized views

Pre-aggregate frequently queried summaries:

```sql
CREATE MATERIALIZED VIEW daily_order_totals AS
SELECT DATE_TRUNC('day', created_at) AS day, SUM(total), COUNT(*)
FROM orders
GROUP BY 1;

CREATE UNIQUE INDEX ON daily_order_totals(day);

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_order_totals;
```

### 6. TimescaleDB

If the data is time-series, consider TimescaleDB — a PostgreSQL extension that provides automatic time-based partitioning (chunks), compression, and continuous aggregates.

---

## 5.6 Connection Pooling and PgBouncer

### Why connection pooling?

Each PostgreSQL connection is an OS process (~5MB RAM). With 1000 concurrent clients:
- Without pooling: 1000 Postgres processes × 5MB = 5GB RAM just for connections
- Planning, I/O buffers, temp memory per connection = easily 10-20MB each

**Connection pool** maintains a smaller set of actual database connections and multiplexes many application clients onto them.

### PgBouncer Modes

**Session pooling**: A server connection is assigned to a client for the entire client session.
- Best for: long-lived connections, uses prepared statements
- Pooling benefit: limited (still 1:1 while connected)

**Transaction pooling**: A server connection is assigned only for the duration of a transaction.
- Best for: most web applications
- Caveat: `SET` commands, prepared statements, advisory locks don't work reliably
- Use `SET LOCAL` instead of `SET`; use `pgbouncer_prepared_statements=on` for prepared statement support

**Statement pooling**: A server connection is held only for one statement.
- Most aggressive pooling
- Very few applications can use this (multi-statement transactions break)

```ini
# pgbouncer.ini
[databases]
myapp = host=127.0.0.1 port=5432 dbname=myapp

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
min_pool_size = 5
server_idle_timeout = 600
```

### PgBouncer topology

```
App instances (100s of connections)
        ↓
    PgBouncer (pool of 20-50 connections)
        ↓
   PostgreSQL (20-50 server processes)
```

---

## 5.7 PostgreSQL Replication

### Streaming Replication (Physical Replication)

Replicates the **entire database cluster** at the WAL level. The replica is a byte-for-byte copy of the primary.

```
Primary → WAL stream → Standby (reapplies WAL continuously)
```

- **Synchronous**: primary waits for at least one standby to acknowledge WAL before committing
- **Asynchronous**: primary doesn't wait (small risk of data loss on primary failure)
- Standby is read-only (can serve read queries)
- Used for **high availability** (failover) and **read scaling**

```sql
-- On primary (postgresql.conf)
wal_level = replica
max_wal_senders = 10

-- Create replication user
CREATE USER replicator REPLICATION LOGIN PASSWORD 'secret';

-- On standby (recovery.conf / postgresql.conf in PG12+)
primary_conninfo = 'host=primary user=replicator password=secret'
```

### Logical Replication

Replicates at the **row change level** using a publication/subscription model.

```sql
-- On publisher
CREATE PUBLICATION my_pub FOR TABLE orders, customers;

-- On subscriber
CREATE SUBSCRIPTION my_sub
  CONNECTION 'host=publisher dbname=myapp user=replica password=secret'
  PUBLICATION my_pub;
```

Features:
- Can replicate **specific tables** (not whole cluster)
- Subscriber can be a **different PostgreSQL version** or even a different database type
- Subscriber database can have **its own schema** beyond the subscribed tables
- Used for **CDC (Change Data Capture)**, ETL, zero-downtime migrations, event streaming

| Aspect | Streaming Replication | Logical Replication |
|---|---|---|
| Granularity | Entire cluster | Specific tables |
| Cross-version | No | Yes (PG10+) |
| Subscriber writes | No | Yes (to non-subscribed tables) |
| Use case | HA, read scaling | CDC, ETL, partial replication |
| Protocol | WAL (binary) | Logical decode (row changes) |

---

## 5.8 How to Scale PostgreSQL for High-Traffic Systems

### Vertical scaling (scale up)
- Increase CPU, RAM (larger `shared_buffers`, `effective_cache_size`)
- Faster SSDs (reduces `random_page_cost`)
- More RAM → better OS page cache

### Read scaling (read replicas)
- Add streaming replication standby servers
- Route read-only queries (analytics, reports) to replicas
- Use connection string routing or a proxy (HAProxy, Patroni)

### Connection pooling (PgBouncer)
- As above — critical for high-traffic apps

### Query optimization
- Ensure all queries are efficient before scaling hardware

### Caching layer
- Redis/Memcached for frequently read, rarely changing data
- Materialized views in PostgreSQL for pre-aggregated data

### Horizontal sharding (advanced)
- **Citus** (now part of Azure Cosmos DB for PostgreSQL): distributes tables across multiple PostgreSQL nodes
- Application-level sharding: route queries to different PostgreSQL instances based on shard key
- PgBouncer in front of multiple PostgreSQL instances

### CQRS Pattern
- Separate command (write) and query (read) paths
- Writes go to primary, reads go to replica
- Optionally, use event sourcing with logical replication to maintain a denormalized read model

---

# 6. Internals: MVCC, VACUUM, WAL

---

## 6.1 How MVCC works internally

### System columns

Every table row has hidden system columns:

```sql
SELECT ctid, xmin, xmax, * FROM orders LIMIT 5;
```

- `ctid`: physical location (page, tuple) — `(0,3)` = page 0, 3rd tuple
- `xmin`: transaction ID that created this row version
- `xmax`: transaction ID that deleted/updated this row (0 = live)

### Snapshot

When a transaction starts, PostgreSQL takes a **snapshot** containing:
- `xmin`: smallest active transaction ID (all xids below this are committed or aborted)
- `xmax`: next transaction ID to be assigned
- `xip`: list of active (in-progress) transaction IDs

A row version is **visible** to a snapshot if:
- Its `xmin` is committed AND less than snapshot's `xmax` AND not in `xip`
- Its `xmax` is 0 OR not committed OR greater than snapshot's `xmax`

### Example walkthrough

```sql
-- Before transaction 100:
-- Row: xmin=50, xmax=0, balance=1000 → visible to all

-- Transaction 100 runs: UPDATE balance = 500
-- Creates new row: xmin=100, xmax=0, balance=500
-- Marks old row: xmin=50, xmax=100, balance=1000

-- Transaction 101 runs concurrently, snapshot taken before 100 commits:
-- xip=[100], so row with xmin=100 is NOT committed in this snapshot
-- Transaction 101 sees old row: balance=1000

-- After transaction 100 commits:
-- New transactions see new row: balance=500
-- Dead row (xmin=50, xmax=100) is now invisible to everyone
-- → Dead tuple, needs VACUUM
```

---

## 6.2 VACUUM and AUTOVACUUM

### Why VACUUM?

MVCC creates dead row versions (tuples). These are:
- Taking up space
- Slowing down sequential scans (must be skipped)
- Preventing transaction ID reuse

### What VACUUM does

1. **Removes dead tuples**: marks space as reusable (but doesn't shrink the file)
2. **Updates visibility map**: marks pages as "all visible" (enables Index-Only Scans)
3. **Advances relfrozenxid**: prevents transaction ID wraparound
4. **Updates statistics** (when run as VACUUM ANALYZE)

```sql
-- Basic vacuum (removes dead tuples)
VACUUM orders;

-- Vacuum + update statistics
VACUUM ANALYZE orders;

-- Full vacuum (rewrites table, reclaims disk space, exclusive lock)
VACUUM FULL orders;
-- WARNING: takes ACCESS EXCLUSIVE lock, blocks all access!
-- Use pg_repack or pg_squeeze instead in production

-- See vacuum activity
SELECT * FROM pg_stat_all_tables WHERE relname = 'orders';
-- Look at: n_dead_tup, last_vacuum, last_autovacuum
```

### AUTOVACUUM

Autovacuum is a background process that automatically runs VACUUM and ANALYZE when needed.

```sql
-- See autovacuum settings
SHOW autovacuum_vacuum_threshold;   -- default: 50
SHOW autovacuum_vacuum_scale_factor; -- default: 0.2
-- Triggers when: dead_tuples > threshold + scale_factor * total_rows
-- e.g., for 1M row table: 50 + 0.2 * 1,000,000 = 200,050 dead tuples

-- Per-table autovacuum tuning (high-write tables need more aggressive settings)
ALTER TABLE orders SET (
    autovacuum_vacuum_scale_factor = 0.01,   -- trigger at 1% dead tuples
    autovacuum_vacuum_threshold = 100,
    autovacuum_analyze_scale_factor = 0.005
);
```

### Table Bloat

**Bloat** = space occupied by dead tuples that VACUUM hasn't cleaned yet.

```sql
-- Check table bloat (approximate)
SELECT 
    schemaname, tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    n_dead_tup,
    n_live_tup,
    ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_pct
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

**Causes of bloat**:
- High UPDATE/DELETE rate with insufficient VACUUM frequency
- Long-running transactions that prevent old versions from being reclaimed
- Autovacuum disabled or misconfigured

**Fixing bloat without downtime**:
```bash
# pg_repack: rebuilds tables/indexes without locking
pg_repack -d mydb -t orders
```

---

## 6.3 WAL (Write-Ahead Logging)

### What is WAL?

WAL is PostgreSQL's **journaling mechanism**. Before any change is made to a data page, the change is first written to the WAL (also called "redo log" or "transaction log").

### Why WAL?

**Durability**: If PostgreSQL crashes mid-write, on restart it replays the WAL to recover to a consistent state. Data pages may be dirty (in-memory but not flushed to disk), but the WAL is always flushed first.

**Performance**: Writing to WAL is sequential (append-only). Updating actual data pages is random I/O. WAL allows PostgreSQL to defer random writes while ensuring durability.

### WAL configuration

```
# postgresql.conf

wal_level = replica          # minimal | replica | logical
# minimal: just enough for crash recovery
# replica: required for streaming replication
# logical: required for logical replication/decoding

fsync = on                   # flush WAL to disk (must be on for durability)
synchronous_commit = on      # wait for WAL flush before returning commit
# off = async commit (better performance, small data loss window)

wal_buffers = 64MB           # WAL buffer in shared memory
min_wal_size = 1GB
max_wal_size = 4GB           # maximum WAL accumulation before checkpoint
```

### WAL flow

```
Client: COMMIT
  → WAL record written to WAL buffer
  → WAL buffer flushed to WAL files (WAL segment files, 16MB each)
  → fsync (if synchronous_commit=on)
  → Client receives "commit successful"
  → Dirty data pages written to heap in background (checkpoint)
```

### Checkpoints

A **checkpoint** is when all dirty data pages are flushed to disk. After a checkpoint, the WAL before that point is no longer needed for crash recovery.

```sql
-- Force a checkpoint (usually done automatically)
CHECKPOINT;

-- See last checkpoint
SELECT * FROM pg_control_checkpoint();
```

---

## 6.4 How PostgreSQL Crash Recovery Works

1. **On startup**, PostgreSQL checks if the last shutdown was clean (`pg_control` file)
2. If not clean (crash detected), enters **recovery mode**
3. Finds the last completed checkpoint
4. Replays all WAL records after that checkpoint
5. This brings all data pages to a consistent state
6. On standby servers, this process runs **continuously** (streaming replication)

This is why `fsync=on` is critical — if data pages aren't flushed in order with WAL, crash recovery can't guarantee consistency.

---

# 7. Advanced Topics

---

## 7.1 CTEs and When They Can Hurt Performance

### What are CTEs?

**Common Table Expressions (CTEs)** define named subqueries, making complex queries more readable.

```sql
WITH active_customers AS (
    SELECT id, name FROM customers WHERE status = 'active'
),
recent_orders AS (
    SELECT customer_id, SUM(total) as total_spent
    FROM orders
    WHERE created_at >= now() - interval '90 days'
    GROUP BY customer_id
)
SELECT ac.name, ro.total_spent
FROM active_customers ac
JOIN recent_orders ro ON ac.id = ro.customer_id
ORDER BY ro.total_spent DESC;
```

### The "Optimization Fence" Problem (pre-PostgreSQL 12)

Before PostgreSQL 12, CTEs were **optimization fences** — they were always materialized (executed once and stored in memory/temp storage), and the planner couldn't push predicates from the outer query into the CTE.

```sql
-- Pre-PG12: CTE scans all orders (1 billion rows!)
WITH all_orders AS (
    SELECT * FROM orders  -- expensive!
)
SELECT * FROM all_orders WHERE customer_id = 123;
-- After PG12: planner can inline the CTE and push the WHERE clause
```

### PostgreSQL 12+ behavior

- CTEs are now **inlined by default** when they are referenced once and have no side effects
- You can control materialization explicitly:

```sql
-- Force materialization (optimization fence)
WITH my_cte AS MATERIALIZED (
    SELECT * FROM expensive_function()
)
SELECT * FROM my_cte WHERE ...;

-- Force inlining (allow planner optimization)
WITH my_cte AS NOT MATERIALIZED (
    SELECT * FROM orders
)
SELECT * FROM my_cte WHERE customer_id = 123;
```

### When to use MATERIALIZED

- CTE is referenced **multiple times** (avoid re-execution)
- CTE has **side effects** (it always materializes)
- You want to limit the planner's choices (testing)

### Recursive CTEs

```sql
-- Find all employees in a reporting hierarchy
WITH RECURSIVE org_hierarchy AS (
    -- Base case: start with CEO
    SELECT id, name, manager_id, 1 AS level
    FROM employees WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case: find direct reports
    SELECT e.id, e.name, e.manager_id, oh.level + 1
    FROM employees e
    JOIN org_hierarchy oh ON e.manager_id = oh.id
)
SELECT * FROM org_hierarchy ORDER BY level, name;
```

---

## 7.2 Window Functions vs GROUP BY

### GROUP BY

Collapses multiple rows into a single summary row per group. Original row context is lost.

```sql
SELECT dept_id, AVG(salary) as avg_salary
FROM employees
GROUP BY dept_id;
-- One row per department, individual employee data gone
```

### Window Functions

Apply aggregate calculations **while preserving the original rows**.

```sql
SELECT 
    name,
    dept_id,
    salary,
    AVG(salary) OVER (PARTITION BY dept_id) as dept_avg,
    salary - AVG(salary) OVER (PARTITION BY dept_id) as diff_from_avg,
    RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rank_in_dept
FROM employees;
-- All employee rows preserved, with department aggregates added
```

### Window Function Syntax

```sql
function_name() OVER (
    [PARTITION BY partition_columns]  -- like GROUP BY but preserves rows
    [ORDER BY sort_columns]           -- defines row order within partition
    [ROWS/RANGE BETWEEN ... AND ...]  -- window frame specification
)
```

### Common window functions

```sql
-- Ranking
ROW_NUMBER() OVER (ORDER BY salary DESC)          -- unique sequential number
RANK() OVER (ORDER BY salary DESC)                -- gaps for ties (1,2,2,4)
DENSE_RANK() OVER (ORDER BY salary DESC)          -- no gaps for ties (1,2,2,3)
NTILE(4) OVER (ORDER BY salary)                   -- quartiles (1-4)

-- Value access
LAG(salary, 1) OVER (ORDER BY hire_date)          -- previous row's salary
LEAD(salary, 1) OVER (ORDER BY hire_date)         -- next row's salary
FIRST_VALUE(salary) OVER (...)                    -- first row in window
LAST_VALUE(salary) OVER (...)                     -- last row in window
NTH_VALUE(salary, 2) OVER (...)                   -- nth row in window

-- Aggregates as window functions
SUM(salary) OVER (PARTITION BY dept_id)           -- dept total
COUNT(*) OVER (PARTITION BY dept_id)              -- dept headcount
SUM(salary) OVER (ORDER BY hire_date)             -- running total
```

### Frame specification

```sql
-- Running total (default: RANGE UNBOUNDED PRECEDING to CURRENT ROW)
SUM(amount) OVER (ORDER BY date)

-- Moving average (last 7 rows including current)
AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)

-- Entire partition
SUM(salary) OVER (PARTITION BY dept_id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
```

---

## 7.3 UPSERTs: INSERT ... ON CONFLICT

PostgreSQL's UPSERT allows you to insert a row, and if there's a conflict (duplicate key violation), either update the existing row or do nothing.

```sql
-- Do nothing on conflict (idempotent insert)
INSERT INTO users (email, name, created_at)
VALUES ('alice@example.com', 'Alice', now())
ON CONFLICT (email) DO NOTHING;

-- Update on conflict (upsert)
INSERT INTO users (email, name, last_login)
VALUES ('alice@example.com', 'Alice', now())
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,          -- EXCLUDED refers to the proposed row
    last_login = EXCLUDED.last_login,
    updated_at = now();

-- Partial conflict target (for partial unique indexes)
INSERT INTO orders (customer_id, product_id, quantity)
VALUES (1, 5, 3)
ON CONFLICT (customer_id, product_id) WHERE status = 'cart'
DO UPDATE SET quantity = orders.quantity + EXCLUDED.quantity;
```

### EXCLUDED pseudo-table

`EXCLUDED` refers to the row that **would have been inserted** (but caused a conflict). This lets you reference the new values in your UPDATE.

### Atomic guarantee

The `INSERT ... ON CONFLICT` is a **single atomic statement**. There's no race condition between checking for existence and inserting, unlike the classic pattern:

```sql
-- WRONG: race condition! Two transactions can both get "not found" and both INSERT
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'alice@example.com') THEN
    INSERT INTO users ...;
END IF;
```

---

## 7.4 JSONB Storage and Querying

### JSON vs JSONB

| Aspect | JSON | JSONB |
|---|---|---|
| Storage | Text (exact copy) | Binary (parsed) |
| Input speed | Faster | Slower |
| Output speed | Slower (no re-parsing) | Faster |
| Indexing | None | GIN, B-Tree |
| Key ordering | Preserved | Not preserved |
| Duplicate keys | Preserved | Last value wins |
| Whitespace | Preserved | Removed |

**Use JSONB for almost all cases.** The binary format enables indexing and efficient operators.

### JSONB operators

```sql
-- Sample data
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    attributes JSONB
);
INSERT INTO products (attributes) VALUES 
    ('{"color": "red", "size": "M", "tags": ["sale", "summer"], "price": 29.99}');

-- Field access
SELECT attributes -> 'color' FROM products;          -- Returns JSON: "red"
SELECT attributes ->> 'color' FROM products;         -- Returns text: red
SELECT attributes -> 'tags' -> 0 FROM products;      -- First tag: "sale"
SELECT attributes #> '{address, city}' FROM products; -- Nested access
SELECT attributes #>> '{address, city}' FROM products; -- Nested access, text

-- Existence operators
SELECT * FROM products WHERE attributes ? 'color';       -- key exists
SELECT * FROM products WHERE attributes ?| ARRAY['color', 'size']; -- any key exists
SELECT * FROM products WHERE attributes ?& ARRAY['color', 'size']; -- all keys exist

-- Containment
SELECT * FROM products WHERE attributes @> '{"color": "red"}';  -- contains
SELECT * FROM products WHERE '{"color": "red"}' <@ attributes;  -- is contained by

-- Modify JSONB
SELECT attributes || '{"weight": 1.5}'::jsonb FROM products;    -- merge
SELECT attributes - 'color' FROM products;                       -- remove key
UPDATE products SET attributes = attributes || '{"on_sale": true}';

-- Extract all keys
SELECT jsonb_object_keys(attributes) FROM products;

-- Convert to rows
SELECT key, value FROM products, jsonb_each(attributes);
```

### Indexing JSONB

```sql
-- GIN index on all keys/values (most common)
CREATE INDEX idx_products_attrs ON products USING GIN(attributes);

-- GIN index with jsonb_path_ops (smaller, faster for containment only)
CREATE INDEX idx_products_attrs_path ON products USING GIN(attributes jsonb_path_ops);

-- B-Tree index on specific key (for range queries)
CREATE INDEX idx_products_price ON products ((attributes->>'price')::numeric);

-- Partial index
CREATE INDEX idx_products_on_sale ON products USING GIN(attributes)
WHERE attributes @> '{"on_sale": true}';
```

### JSONPath (PostgreSQL 12+)

```sql
-- jsonpath allows complex queries into JSONB
SELECT * FROM products 
WHERE attributes @@ '$.price < 30 && $.tags[*] == "sale"';

-- Extract matching values
SELECT jsonb_path_query(attributes, '$.tags[*]') FROM products;
```

---

## 7.5 Partial Indexes and Expression Indexes

### Partial Indexes

A **partial index** only indexes rows that satisfy a `WHERE` condition. Smaller, faster, more targeted.

```sql
-- Index only active users (if 90% are inactive, saves 90% of index space)
CREATE INDEX idx_users_active ON users(email) WHERE status = 'active';

-- Only useful for queries that match the partial condition
SELECT * FROM users WHERE status = 'active' AND email = 'foo@example.com';
-- Uses the index ✅

SELECT * FROM users WHERE email = 'foo@example.com';
-- Can't use this partial index ❌ (status not constrained to 'active')

-- Index pending orders for a job queue
CREATE INDEX idx_jobs_pending ON jobs(created_at) 
WHERE status = 'pending';

-- Find next job to process
SELECT * FROM jobs WHERE status = 'pending' ORDER BY created_at LIMIT 1;
-- Uses tiny partial index instead of full jobs table index ✅
```

### Expression Indexes

An **expression index** indexes the result of an expression, not just a column value.

```sql
-- Case-insensitive email search
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
SELECT * FROM users WHERE LOWER(email) = LOWER('Alice@Example.com');
-- Uses the expression index ✅

-- Date-based filtering
CREATE INDEX idx_orders_date ON orders(DATE(created_at));
SELECT * FROM orders WHERE DATE(created_at) = '2024-01-15';

-- JSON field extraction
CREATE INDEX idx_products_color ON products((attributes->>'color'));
SELECT * FROM products WHERE attributes->>'color' = 'red';

-- Computed column
CREATE INDEX idx_full_name ON employees((first_name || ' ' || last_name));
SELECT * FROM employees WHERE (first_name || ' ' || last_name) = 'John Smith';
```

### Combining Partial + Expression

```sql
-- Case-insensitive index only for active users
CREATE INDEX idx_active_users_email ON users(LOWER(email)) 
WHERE status = 'active';
```

---

## 7.6 Outbox Pattern with PostgreSQL

The **Outbox Pattern** solves the dual-write problem in microservices: how do you atomically update your database AND publish an event to a message broker?

### The problem

```
BEGIN;
UPDATE orders SET status = 'confirmed';
-- How do you atomically also publish an "OrderConfirmed" event to Kafka?
-- If you publish inside the transaction and commit fails: event published but order not updated
-- If you publish after commit: commit succeeds but app crashes before publish
COMMIT;
```

### The Outbox solution

Write the event **into the database** in the same transaction. A separate process reads from the outbox table and publishes to the broker.

```sql
-- Outbox table
CREATE TABLE outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type TEXT NOT NULL,   -- 'Order', 'Customer', etc.
    aggregate_id TEXT NOT NULL,     -- the entity's ID
    event_type TEXT NOT NULL,       -- 'OrderConfirmed', 'CustomerCreated', etc.
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ        -- NULL = not yet published
);

-- Application transaction (atomic!)
BEGIN;
UPDATE orders SET status = 'confirmed' WHERE id = $1;
INSERT INTO outbox (aggregate_type, aggregate_id, event_type, payload)
VALUES ('Order', $1, 'OrderConfirmed', $2::jsonb);
COMMIT;
```

### Outbox reader (polling pattern)

```sql
-- Background worker polls for unpublished events
SELECT * FROM outbox 
WHERE published_at IS NULL 
ORDER BY created_at 
FOR UPDATE SKIP LOCKED
LIMIT 100;

-- After publishing to Kafka/SQS/etc.:
UPDATE outbox SET published_at = now() WHERE id = ANY($1);
```

### CDC-based Outbox (Debezium)

More efficient: use **logical replication** with Debezium to stream outbox table changes directly to Kafka without polling.

```
PostgreSQL → logical replication slot → Debezium → Kafka
```

```sql
-- Enable logical replication
ALTER SYSTEM SET wal_level = 'logical';

-- Create replication slot for Debezium
SELECT pg_create_logical_replication_slot('debezium', 'pgoutput');
```

---

## 7.7 Preventing Duplicate Records in a Distributed System

### Database-level uniqueness

```sql
-- Simple unique constraint
ALTER TABLE orders ADD CONSTRAINT uq_orders_idempotency_key UNIQUE (idempotency_key);

-- Composite unique constraint
ALTER TABLE subscriptions ADD CONSTRAINT uq_user_plan UNIQUE (user_id, plan_id);

-- Partial unique constraint
CREATE UNIQUE INDEX uq_active_subscription ON subscriptions(user_id) 
WHERE status = 'active';
-- Only one active subscription per user allowed
```

### Idempotency key pattern

The client generates a unique key per operation. The server uses UPSERT:

```sql
-- Client sends idempotency_key with the request
INSERT INTO payments (idempotency_key, amount, customer_id, status)
VALUES ($1, $2, $3, 'pending')
ON CONFLICT (idempotency_key) DO NOTHING
RETURNING *;

-- If returning nothing: duplicate request, look up original result
SELECT * FROM payments WHERE idempotency_key = $1;
```

### Advisory locks for distributed coordination

```sql
-- Acquire advisory lock based on hash of the resource
SELECT pg_try_advisory_xact_lock(hashtext('user-42-subscription'));
-- Returns true if lock acquired, false if already held
-- Lock is automatically released at end of transaction
```

### Sequence gaps

Don't rely on `SERIAL` / `BIGSERIAL` gaps for uniqueness checks — sequences have gaps on rollback. Always use `UNIQUE` constraints.

---

## 7.8 Zero-Downtime PostgreSQL Migration

Migrating a large PostgreSQL database without downtime requires careful sequencing.

### Schema changes (DDL)

**Adding a column (safe)**
```sql
-- Adding nullable column with no default: instant (doesn't rewrite table)
ALTER TABLE orders ADD COLUMN notes TEXT;

-- Adding column with default (PostgreSQL 11+): instant for non-volatile defaults
ALTER TABLE orders ADD COLUMN discount NUMERIC DEFAULT 0;

-- Adding NOT NULL column (pre-PG11): must be done in phases
-- 1. Add nullable column
ALTER TABLE orders ADD COLUMN order_source TEXT;
-- 2. Backfill in batches (without locking whole table)
UPDATE orders SET order_source = 'web' WHERE id BETWEEN 1 AND 100000 AND order_source IS NULL;
-- 3. Add NOT NULL constraint with VALIDATE CONSTRAINT (acquired only SHARE UPDATE EXCLUSIVE)
ALTER TABLE orders ADD CONSTRAINT orders_source_not_null 
  CHECK (order_source IS NOT NULL) NOT VALID;
VALIDATE CONSTRAINT orders_source_not_null;  -- validates without full lock
-- 4. Convert to actual NOT NULL (short lock needed, but validation already done)
ALTER TABLE orders ALTER COLUMN order_source SET NOT NULL;
```

**Adding index without locking**
```sql
-- CONCURRENTLY: builds index without blocking reads/writes
-- Takes longer, can fail if duplicates found
CREATE INDEX CONCURRENTLY idx_orders_customer ON orders(customer_id);

-- If it fails, clean up and retry:
DROP INDEX CONCURRENTLY idx_orders_customer_invalid;
```

**Adding foreign key without full lock**
```sql
-- Add FK without validation first (immediate, small lock)
ALTER TABLE orders ADD CONSTRAINT fk_customer 
  FOREIGN KEY (customer_id) REFERENCES customers(id) NOT VALID;

-- Validate separately (SHARE UPDATE EXCLUSIVE, allows reads/writes)
ALTER TABLE orders VALIDATE CONSTRAINT fk_customer;
```

### Data migrations

Batch large data migrations to avoid long-running transactions:

```python
# Migrate in batches of 10,000 rows
batch_size = 10000
last_id = 0
while True:
    rows = db.execute("""
        UPDATE orders 
        SET new_col = compute(old_col)
        WHERE id > %s AND id <= %s + %s
          AND new_col IS NULL
        RETURNING id
    """, [last_id, last_id, batch_size])
    if not rows:
        break
    last_id += batch_size
    time.sleep(0.1)  # give other transactions time
```

### Full database migration (e.g., major version upgrade)

Use logical replication for near-zero downtime:

1. Set up logical replication from old cluster to new cluster
2. Sync data in real-time
3. Run application in read-only mode briefly
4. Cut over DNS/connection strings to new cluster
5. Total downtime: seconds to minutes

---

## 7.9 pg_repack vs VACUUM FULL

| Aspect | VACUUM FULL | pg_repack |
|---|---|---|
| Locks | ACCESS EXCLUSIVE (blocks all) | No table lock (concurrent reads/writes) |
| Availability | Table unavailable | Table remains available |
| Downtime | Yes | Near-zero |
| Speed | Fast | Slower |
| Use in production | Avoid on large tables | Preferred |

```bash
# Install pg_repack
CREATE EXTENSION pg_repack;

# Repack a bloated table
pg_repack -d mydb -t orders

# Repack only indexes
pg_repack -d mydb -t orders --only-indexes
```

---

# 8. System Design Scenarios

---

## 8.1 Investigate a Production Database Slowdown

A methodical approach:

### Step 1: Identify active long-running queries

```sql
SELECT pid, now() - query_start AS duration, query, state, wait_event_type, wait_event
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;
```

### Step 2: Check for lock waits

```sql
-- Find blocking queries
SELECT 
    blocked.pid AS blocked_pid,
    blocked.query AS blocked_query,
    blocking.pid AS blocking_pid,
    blocking.query AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_locks bl ON bl.pid = blocked.pid AND NOT bl.granted
JOIN pg_locks kl ON kl.transactionid = bl.transactionid AND kl.granted
JOIN pg_stat_activity blocking ON blocking.pid = kl.pid;
```

### Step 3: Check top queries by time

```sql
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC LIMIT 20;
```

### Step 4: Check for table/index bloat

```sql
SELECT relname, n_dead_tup, n_live_tup, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

### Step 5: Check cache hit ratio

```sql
-- Should be > 99% for OLTP workloads
SELECT 
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS cache_hit_ratio
FROM pg_statio_user_tables;
```

### Step 6: Check index usage

```sql
-- Find tables with high sequential scans
SELECT relname, seq_scan, idx_scan, 
       seq_scan::float / (seq_scan + idx_scan + 1) as seq_ratio
FROM pg_stat_user_tables
WHERE seq_scan + idx_scan > 100
ORDER BY seq_scan DESC;
```

### Step 7: Run EXPLAIN ANALYZE on slow queries

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...slow query...;
```

---

## 8.2 Designing Indexes for a 100M-Row Table

### Start with query analysis

Collect all queries that hit the table, weighted by frequency and cost:

```sql
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
WHERE query ILIKE '%orders%'
ORDER BY total_exec_time DESC;
```

### Index strategy

```sql
-- 1. Primary key (already exists)
-- 2. Foreign key columns (often missed!)
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);

-- 3. Composite index for common filter patterns
-- If most queries filter by (customer_id, status):
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

-- 4. Partial index for high-value subset
-- If queries mostly care about recent/active orders:
CREATE INDEX idx_orders_active ON orders(customer_id, created_at DESC) 
WHERE status != 'archived';

-- 5. BRIN for time-series data (tiny size, good for large ranges)
CREATE INDEX idx_orders_brin ON orders USING BRIN(created_at);

-- 6. Covering index to avoid heap fetches
CREATE INDEX idx_orders_api ON orders(customer_id, created_at DESC)
INCLUDE (total, status, product_id);
```

### Monitor and prune

```sql
-- After running for a few weeks, remove unused indexes
SELECT indexname, idx_scan
FROM pg_stat_user_indexes
WHERE relname = 'orders' AND idx_scan < 10
ORDER BY idx_scan;
```

---

## 8.3 Storing Time-Series Data in PostgreSQL

```sql
-- Partition by month
CREATE TABLE sensor_readings (
    sensor_id BIGINT NOT NULL,
    measured_at TIMESTAMPTZ NOT NULL,
    value DOUBLE PRECISION,
    PRIMARY KEY (sensor_id, measured_at)
) PARTITION BY RANGE (measured_at);

-- Create partitions (can be automated)
CREATE TABLE sensor_readings_2024_01 PARTITION OF sensor_readings
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- BRIN index for time range queries
CREATE INDEX ON sensor_readings USING BRIN(measured_at);

-- Materialized view for hourly aggregates
CREATE MATERIALIZED VIEW sensor_hourly AS
SELECT 
    sensor_id,
    DATE_TRUNC('hour', measured_at) AS hour,
    AVG(value) AS avg_value,
    MIN(value) AS min_value,
    MAX(value) AS max_value,
    COUNT(*) AS reading_count
FROM sensor_readings
GROUP BY 1, 2;
```

---

# 9. Quick-Reference Cheatsheet

---

## Essential Commands

```sql
-- Database info
\l                           -- list databases
\c dbname                    -- connect to database
\dt                          -- list tables
\d tablename                 -- describe table
\di                          -- list indexes
\x                           -- expanded output mode

-- Size queries
SELECT pg_size_pretty(pg_database_size('mydb'));
SELECT pg_size_pretty(pg_relation_size('orders'));
SELECT pg_size_pretty(pg_total_relation_size('orders')); -- includes indexes

-- Connection info
SELECT COUNT(*) FROM pg_stat_activity;
SELECT MAX(now() - state_change) FROM pg_stat_activity WHERE state = 'idle in transaction';

-- Kill query
SELECT pg_cancel_backend(pid);    -- send SIGINT (graceful)
SELECT pg_terminate_backend(pid); -- send SIGTERM (forceful)
```

## Index Creation Cheatsheet

```sql
-- Standard B-Tree
CREATE INDEX idx_name ON table(column);

-- Composite
CREATE INDEX idx_name ON table(col1, col2, col3);

-- Unique
CREATE UNIQUE INDEX idx_name ON table(column);

-- Partial
CREATE INDEX idx_name ON table(column) WHERE condition;

-- Expression
CREATE INDEX idx_name ON table(expression);

-- Covering (INCLUDE)
CREATE INDEX idx_name ON table(col1) INCLUDE (col2, col3);

-- GIN (arrays, JSONB, FTS)
CREATE INDEX idx_name ON table USING GIN(column);

-- GiST (geometric, range)
CREATE INDEX idx_name ON table USING GIST(column);

-- BRIN (large sequential tables)
CREATE INDEX idx_name ON table USING BRIN(column);

-- Hash (equality only)
CREATE INDEX idx_name ON table USING HASH(column);

-- Non-blocking (takes longer)
CREATE INDEX CONCURRENTLY idx_name ON table(column);
```

## Transaction Isolation Levels

```sql
BEGIN;
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;   -- default
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Or globally
SET default_transaction_isolation = 'repeatable read';
```

## Locking Cheatsheet

```sql
-- Row locks
SELECT ... FOR UPDATE;              -- exclusive row lock
SELECT ... FOR SHARE;               -- shared row lock
SELECT ... FOR UPDATE SKIP LOCKED;  -- skip locked rows (job queue)
SELECT ... FOR UPDATE NOWAIT;       -- fail immediately if locked

-- Table locks (acquired automatically or explicitly)
LOCK TABLE orders IN ACCESS EXCLUSIVE MODE;  -- blocks everything
LOCK TABLE orders IN ROW EXCLUSIVE MODE;     -- allows reads, blocks writes
LOCK TABLE orders IN SHARE MODE;             -- allows reads, blocks writes

-- Advisory locks
SELECT pg_advisory_lock(12345);         -- session-level, must release manually
SELECT pg_advisory_xact_lock(12345);    -- transaction-level, auto-released
SELECT pg_try_advisory_lock(12345);     -- non-blocking, returns boolean
```

## EXPLAIN Quick Reference

```sql
-- Basic plan (no execution)
EXPLAIN SELECT ...;

-- Execute and show actual vs estimated
EXPLAIN ANALYZE SELECT ...;

-- Full details (buffers, timing, format)
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT) SELECT ...;

-- Key things to look for:
-- cost=startup..total   rows=estimate  width=bytes
-- actual time=start..end rows=actual  loops=count
-- Seq Scan = reading whole table
-- Index Scan = using index + heap fetch
-- Index Only Scan = using index, no heap fetch (fast!)
-- Bitmap Heap Scan = index scan + batch heap fetch
-- Hash Join = hash table join (good for large tables)
-- Nested Loop = index-based join (good for small inner tables)
-- Merge Join = sorted merge join (needs sorted inputs)
-- rows=1 estimate but actual=1000000 → bad statistics (run ANALYZE)
```

## JSONB Operators Quick Reference

```sql
->     -- Get JSON object field (returns JSON)
->>    -- Get JSON object field (returns text)
#>     -- Get JSON by path (returns JSON)
#>>    -- Get JSON by path (returns text)
@>     -- Contains
<@     -- Is contained by
?      -- Key exists
?|     -- Any of these keys exist
?&     -- All of these keys exist
||     -- Concatenate/merge
-      -- Delete key
```

## Partitioning Quick Reference

```sql
-- Create partitioned table
CREATE TABLE t (...) PARTITION BY RANGE (date_col);
CREATE TABLE t (...) PARTITION BY LIST (region);
CREATE TABLE t (...) PARTITION BY HASH (id);

-- Create partitions
CREATE TABLE t_2024 PARTITION OF t FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE t_us PARTITION OF t FOR VALUES IN ('US', 'CA');
CREATE TABLE t_0 PARTITION OF t FOR VALUES WITH (MODULUS 4, REMAINDER 0);

-- Default partition (catches unmatched rows)
CREATE TABLE t_default PARTITION OF t DEFAULT;

-- Detach partition (for archival, non-blocking in PG14+)
ALTER TABLE t DETACH PARTITION t_2020 CONCURRENTLY;
```

## Important postgresql.conf Settings

```ini
# Memory
shared_buffers = 25%_of_RAM        # main PostgreSQL cache
effective_cache_size = 75%_of_RAM  # estimate for OS + PG cache (planner hint)
work_mem = 64MB                     # per-sort/hash operation (careful: per connection!)
maintenance_work_mem = 1GB          # for VACUUM, CREATE INDEX

# WAL / Durability
wal_level = replica
synchronous_commit = on             # off for better perf, small data loss risk
checkpoint_completion_target = 0.9  # spread checkpoint I/O over 90% of interval

# Query Tuning
random_page_cost = 1.1             # for SSDs (default 4.0 for spinning disk)
effective_io_concurrency = 200     # for SSDs
max_parallel_workers_per_gather = 4

# Logging
log_min_duration_statement = 1000   # log queries > 1 second
log_autovacuum_min_duration = 250   # log autovacuum > 250ms

# Connection
max_connections = 200               # use PgBouncer to multiplex
```

## Useful System Views

```sql
-- Active queries
pg_stat_activity

-- Query statistics (requires extension)
pg_stat_statements

-- Table statistics
pg_stat_user_tables        -- seq_scan, idx_scan, n_dead_tup, n_live_tup
pg_statio_user_tables      -- heap/index hits vs reads (cache hit ratio)

-- Index statistics
pg_stat_user_indexes       -- idx_scan, idx_tup_read, idx_tup_fetch
pg_statio_user_indexes     -- idx_blks_hit, idx_blks_read

-- Locks
pg_locks                   -- current lock information
pg_blocking_pids(pid)      -- PIDs blocking a given process (PG9.6+)

-- Replication
pg_stat_replication        -- streaming replication lag
pg_stat_subscription       -- logical replication subscription status
pg_replication_slots       -- replication slots (watch for slot lag!)

-- Vacuum
pg_stat_all_tables         -- last vacuum, last autovacuum times
```

---

## Common Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| `SELECT *` | Fetches unused columns, breaks column changes | Select only needed columns |
| `NOT IN (subquery)` | Fails silently with NULLs, slow | Use `NOT EXISTS` or `LEFT JOIN ... IS NULL` |
| `OR` on different columns | Can't use composite index | Consider separate queries + UNION |
| Function on indexed column | Index not used | Use expression index or rewrite predicate |
| `LIKE '%value%'` | Can't use B-Tree index | Use GIN with `pg_trgm` extension |
| Implicit type cast | Index not used | Explicit cast or match types |
| Long transactions | Blocks VACUUM, holds locks | Keep transactions short |
| Missing FK indexes | Slow FK checks and cascades | Index all foreign key columns |
| `VACUUM FULL` on live system | Exclusive lock, downtime | Use `pg_repack` instead |
| `UPDATE` entire table | Creates massive bloat | Update in batches |

---

## Interview Summary: The Key Concepts to Master

### Must be able to explain deeply
1. **MVCC**: How xmin/xmax work, why dead tuples accumulate, why VACUUM exists
2. **WAL**: What it is, how it enables crash recovery and replication, fsync trade-off
3. **EXPLAIN ANALYZE**: How to read it, what each node type means, how to diagnose issues
4. **Index types**: When to use B-Tree vs GIN vs GiST vs BRIN, partial/expression indexes
5. **Isolation levels**: What anomalies each prevents, when to use Serializable
6. **Partitioning**: When it helps vs when it doesn't, partition pruning

### Must be able to design
1. **Index strategy for high-traffic table**: How to choose indexes, composite index column order, covering indexes
2. **Zero-downtime migration**: `ADD COLUMN`, `ADD INDEX CONCURRENTLY`, FK `NOT VALID`
3. **Connection pooling architecture**: PgBouncer modes, pool sizing
4. **Outbox pattern**: Dual-write problem, transactional outbox, CDC with Debezium
5. **Scaling strategy**: Read replicas, caching, partitioning, Citus for horizontal scale

### Must be able to debug
1. **Slow query investigation**: `pg_stat_statements` → `pg_stat_activity` → `EXPLAIN ANALYZE`
2. **Lock contention**: `pg_locks`, deadlock logs, `FOR UPDATE SKIP LOCKED` pattern
3. **Bloat**: `pg_stat_user_tables`, `n_dead_tup`, VACUUM tuning

---

*This guide covers the core PostgreSQL topics for Senior Software Engineer interviews. Every concept here has appeared in real interviews at top-tier companies. Focus on being able to explain the "why" behind each feature, not just the syntax.*