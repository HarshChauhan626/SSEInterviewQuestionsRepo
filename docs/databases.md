# Database Interview Questions & Answers

---

## PostgreSQL (30 Questions)

---

### 1. What are the differences between PostgreSQL and MySQL?

PostgreSQL and MySQL are both open-source relational databases but differ significantly in philosophy, feature set, and use cases.

**Architecture & Standards Compliance:** PostgreSQL is an object-relational database that strictly adheres to SQL standards (ANSI SQL). It supports advanced data types, table inheritance, and custom operators/types. MySQL is a purely relational system that historically prioritized speed over strict SQL compliance (though this has improved in recent versions).

**ACID Compliance:** PostgreSQL is fully ACID-compliant by default across all storage engines. MySQL's ACID compliance depends on the storage engine — InnoDB provides it, but MyISAM does not.

**Concurrency:** PostgreSQL uses MVCC (Multi-Version Concurrency Control) natively and deeply, enabling high concurrency without read/write conflicts. MySQL also uses MVCC in InnoDB, but the implementation differs — PostgreSQL's is generally considered more robust.

**Advanced Features:** PostgreSQL supports a much richer feature set:
- Full-text search with ranking
- JSONB (binary JSON) with indexing
- Array, hstore, UUID, and range data types
- Table inheritance and partitioning
- Window functions with full SQL:2003 support
- CTEs (recursive included) more robustly
- Extensible type system (PostGIS, etc.)

**Replication:** MySQL has historically had more mature, simpler replication. PostgreSQL's logical and streaming replication has become very competitive, but MySQL is still often preferred for its simplicity in multi-source replication.

**Performance:** MySQL can be faster for simple read-heavy workloads and OLTP. PostgreSQL typically outperforms on complex queries, aggregations, and write-heavy workloads. PostgreSQL's query planner is generally more sophisticated.

**Licensing:** PostgreSQL uses the PostgreSQL License (permissive BSD-style). MySQL is dual-licensed — GPL for community edition, commercial for enterprise.

**Use Cases:** Choose PostgreSQL for complex queries, data integrity, geospatial data, or when you need advanced SQL features. Choose MySQL for web applications where simplicity, widespread hosting support, or ecosystem (LAMP stack) is important.

---

### 2. Explain MVCC in PostgreSQL

MVCC (Multi-Version Concurrency Control) is the mechanism PostgreSQL uses to allow concurrent access to the database without locking rows for reads.

**The Core Idea:** Instead of locking a row when it's being read or written, PostgreSQL keeps multiple versions of the same row. Each transaction sees a consistent snapshot of the data as it existed when the transaction began.

**How It Works Internally:**

Every row (called a "tuple") in PostgreSQL has hidden system columns:
- `xmin`: the transaction ID that created this row version
- `xmax`: the transaction ID that deleted (or updated) this row version (0 if still live)

When a transaction reads a row, PostgreSQL checks whether the row's `xmin` is committed and visible to the current transaction, and whether `xmax` is either 0 or not yet committed. This determines visibility.

**Example Flow:**

1. Transaction A reads row R — it sees version V1 with xmin=100
2. Transaction B updates row R — it creates version V2 with xmin=200, and marks V1 with xmax=200
3. Transaction A reads again — it still sees V1, because V2's xmin=200 is after A's snapshot
4. New transactions after B commits will see V2

**Benefits:**
- Readers never block writers
- Writers never block readers
- Only write-write conflicts cause blocking

**The Dead Tuple Problem:** Old row versions (dead tuples) accumulate because PostgreSQL can't delete them immediately — another transaction might still need them. This is why VACUUM is necessary (see Q3).

**Transaction ID Wraparound:** Transaction IDs are 32-bit integers (~4 billion). PostgreSQL must periodically freeze old tuples to prevent ID wraparound, which is part of what autovacuum handles.

---

### 3. What is VACUUM and why is it needed?

VACUUM is PostgreSQL's housekeeping process that reclaims storage and maintains database health. It exists because of how MVCC works.

**Why It's Needed:**

When rows are updated or deleted in PostgreSQL, the old versions aren't immediately removed — they're marked as dead but left in place (because concurrent transactions may still need them per MVCC). Over time, these dead tuples accumulate and cause:
- Table bloat (wasted disk space)
- Index bloat
- Slower sequential scans (more pages to read)
- Transaction ID wraparound risk

**Types of VACUUM:**

`VACUUM` (standard):
- Marks dead tuples as reusable (doesn't return space to OS)
- Updates visibility map
- Updates free space map
- Does NOT lock the table for reads/writes

`VACUUM FULL`:
- Rewrites the entire table to a new file, fully compacting it
- Returns space to the OS
- Requires an exclusive lock on the table — avoid during peak hours
- Equivalent to a full table rebuild

`VACUUM ANALYZE`:
- Runs VACUUM then updates planner statistics
- Use after bulk inserts/updates to help the query planner

**AUTOVACUUM:**

PostgreSQL ships with autovacuum, a background daemon that automatically runs VACUUM when tables reach configurable thresholds:
- `autovacuum_vacuum_threshold` (default 50 rows) + `autovacuum_vacuum_scale_factor` (default 20% of table) triggers a VACUUM
- `autovacuum_analyze_threshold` triggers ANALYZE

**Transaction ID Wraparound Prevention:**

PostgreSQL uses 32-bit transaction IDs. At ~2 billion transactions, IDs wrap around and old data could appear "in the future." VACUUM freezes old tuples by replacing their xmin with a special frozen transaction ID, preventing this. Aggressive autovacuum settings are critical for high-write databases.

**Monitoring:**

```sql
SELECT relname, n_dead_tup, last_vacuum, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

---

### 4. Difference between DELETE, TRUNCATE, and DROP?

These three commands remove data at different scopes and with different behaviors:

**DELETE:**
- Removes specific rows matching a WHERE clause (or all rows if no WHERE)
- DML (Data Manipulation Language) operation
- Fully transactional — can be rolled back
- Fires row-level triggers
- Leaves dead tuples (requires subsequent VACUUM)
- Slow on large tables because it processes row-by-row
- Preserves table structure, indexes, and constraints

```sql
DELETE FROM orders WHERE created_at < '2020-01-01';
```

**TRUNCATE:**
- Removes ALL rows from a table very efficiently
- DDL operation in PostgreSQL (unlike in some other databases)
- Transactional (can be rolled back within the same transaction)
- Does NOT fire row-level triggers (fires statement-level TRUNCATE triggers)
- Immediately reclaims space — no VACUUM needed
- Much faster than DELETE for full-table clears because it doesn't scan rows
- Resets sequences if `RESTART IDENTITY` is specified
- Preserves table structure, indexes, and constraints
- Can be cascaded to child tables with foreign keys

```sql
TRUNCATE orders RESTART IDENTITY CASCADE;
```

**DROP:**
- Removes the entire table (or other database object) including its structure
- DDL operation
- Transactional in PostgreSQL
- Removes all data, indexes, triggers, constraints, and the table definition itself
- Cannot be easily undone without a backup

```sql
DROP TABLE orders;
DROP TABLE IF EXISTS orders CASCADE; -- cascade removes dependent objects
```

**Summary Table:**

| Feature | DELETE | TRUNCATE | DROP |
|---|---|---|---|
| Removes rows | Yes (selective) | Yes (all) | Yes (all) |
| Removes structure | No | No | Yes |
| Transactional | Yes | Yes | Yes |
| Fires triggers | Row-level | Statement-level | No |
| Speed (full table) | Slow | Fast | Instant |
| VACUUM needed | Yes | No | No |

---

### 5. What are indexes in PostgreSQL?

An index is a data structure that PostgreSQL maintains alongside a table to allow faster lookups without scanning every row. Think of it like a book's index — instead of reading every page, you jump directly to the relevant page numbers.

**How Indexes Work:**

Without an index, a query like `SELECT * FROM users WHERE email = 'foo@bar.com'` requires a sequential scan — reading every row. With an index on `email`, PostgreSQL consults the index structure (typically a B-Tree) which stores the email values in sorted order with pointers to the actual heap (table) rows. The lookup becomes O(log n) instead of O(n).

**Creating Indexes:**

```sql
-- Basic index
CREATE INDEX idx_users_email ON users(email);

-- Unique index (also enforces uniqueness constraint)
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Index on multiple columns
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Concurrent index creation (doesn't lock table)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

**Costs and Trade-offs:**

Indexes aren't free:
- Each index takes disk space
- Every INSERT, UPDATE, DELETE must update all relevant indexes — write overhead
- The query planner may choose not to use an index if a sequential scan is more efficient (e.g., when selecting >10-20% of rows)

**PostgreSQL Index Types:**
- B-Tree (default) — general purpose, sorted data
- Hash — equality lookups only
- GIN — arrays, full-text search, JSONB
- GiST — geometric data, range types, full-text
- BRIN — very large tables with naturally ordered data
- SP-GiST — non-balanced structures (quad-trees, k-d trees)

**Monitoring Index Usage:**

```sql
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC; -- Low scan count = possibly unused index
```

---

### 6. Difference between B-Tree, Hash, GIN, and GiST indexes?

**B-Tree (Balanced Tree) — Default:**

The default and most versatile index type. Stores data in a sorted tree structure where each node contains keys and pointers to child nodes.

Supports: `=`, `<`, `>`, `<=`, `>=`, `BETWEEN`, `IN`, `IS NULL`, `LIKE 'foo%'` (prefix only)

Best for: Most general-purpose queries, range queries, ORDER BY, and any column with sortable data types.

```sql
CREATE INDEX ON products(price); -- B-Tree by default
SELECT * FROM products WHERE price BETWEEN 10 AND 50; -- Uses B-Tree efficiently
```

**Hash:**

Stores a hash of the indexed value. Only supports equality lookups (`=`). Slightly faster than B-Tree for pure equality checks, but not useful for ranges, sorting, or pattern matching. Prior to PostgreSQL 10, hash indexes weren't WAL-logged (not crash-safe) — they are now.

```sql
CREATE INDEX ON users USING HASH (session_token);
SELECT * FROM users WHERE session_token = 'abc123'; -- Perfect use case
```

**GIN (Generalized Inverted Index):**

Designed for values that contain multiple component values — arrays, JSONB, tsvector (full-text search). It creates an inverted index: for each element value, it stores a list of all rows containing that value.

Supports: `@>` (contains), `<@` (contained by), `&&` (overlap), `@@` (text search match)

Best for: Full-text search, JSONB queries, array containment, tag systems.

```sql
CREATE INDEX ON articles USING GIN(to_tsvector('english', body));
SELECT * FROM articles WHERE to_tsvector('english', body) @@ to_tsquery('postgresql');

CREATE INDEX ON products USING GIN(tags); -- tags is a text[]
SELECT * FROM products WHERE tags @> ARRAY['electronics'];
```

**GiST (Generalized Search Tree):**

A framework for building custom index structures. Used for geometric types, range types, and full-text search (as an alternative to GIN). GiST is lossy (can have false positives, checked with re-check), while GIN is exact.

Best for: Geometric/spatial data (PostGIS), range type overlap queries, nearest-neighbor searches.

```sql
CREATE INDEX ON locations USING GIST(point_column);
SELECT * FROM locations WHERE point_column <-> '(0,0)' < 10; -- Nearest neighbor
```

**Choosing the Right Index:**

| Use Case | Index Type |
|---|---|
| General equality/range | B-Tree |
| Pure equality, high cardinality | Hash |
| JSONB, arrays, full-text search | GIN |
| Geometry, range overlap, nearest-neighbor | GiST |
| Huge tables, sequential physical order | BRIN |

---

### 7. What is a partial index?

A partial index is an index built over a subset of rows in a table, defined by a WHERE clause. It only indexes rows that satisfy the condition.

**Why Use Partial Indexes:**

Standard indexes index every row in a table. If your queries typically filter on a specific condition, indexing only the relevant rows makes the index much smaller, faster to scan, and cheaper to maintain.

**Examples:**

```sql
-- Index only active users (most queries target active users)
CREATE INDEX idx_users_active_email ON users(email) WHERE status = 'active';

-- Index only unprocessed orders
CREATE INDEX idx_orders_pending ON orders(created_at) WHERE status = 'pending';

-- Index non-null values (useful for sparse columns)
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
```

**Benefits:**
- Smaller index = fits in memory more easily
- Faster index scans
- Lower write overhead (only updates index when row matches condition)
- Can enforce partial uniqueness

```sql
-- Only one active session per user
CREATE UNIQUE INDEX idx_one_active_session 
ON sessions(user_id) WHERE is_active = TRUE;
```

**When PostgreSQL Uses a Partial Index:**

The query's WHERE clause must be compatible with the index's WHERE clause. PostgreSQL won't use the above active users index for `WHERE status = 'inactive'`.

```sql
-- This uses the partial index
SELECT * FROM users WHERE email = 'foo@bar.com' AND status = 'active';

-- This does NOT use the partial index (status is 'inactive')
SELECT * FROM users WHERE email = 'foo@bar.com' AND status = 'inactive';
```

---

### 8. What is a composite index and when should you use it?

A composite index (also called a multi-column index) is an index defined on two or more columns. The order of columns in the definition is critically important.

**How Composite Indexes Work:**

PostgreSQL sorts the index data by the first column, then by the second column within each first-column value, and so on. This means the index is most effective when queries use the leading columns.

```sql
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);
```

**The Left-Prefix Rule:**

A composite index on (A, B, C) can be used for queries on:
- A alone
- A and B together
- A, B, and C together

But NOT for queries on B alone, C alone, or B and C without A (PostgreSQL can't efficiently use the middle/end of a sorted composite key without the prefix).

```sql
-- Uses the index (leading column user_id present)
SELECT * FROM orders WHERE user_id = 5;
SELECT * FROM orders WHERE user_id = 5 AND created_at > '2024-01-01';

-- Does NOT use the index efficiently (missing leading column)
SELECT * FROM orders WHERE created_at > '2024-01-01';
```

**When to Use Composite Indexes:**

1. Frequently queried column combinations: `WHERE user_id = ? AND status = ?`
2. When you need to cover a query (index-only scan) — include all needed columns
3. For sorting: `ORDER BY user_id, created_at` can use the index above

**Column Order Strategy:**

- Put equality conditions first (`=`)
- Put range conditions last (`>`, `<`, `BETWEEN`, `LIKE`)
- Put high-cardinality columns first for better selectivity

```sql
-- Good: equality first, then range
CREATE INDEX ON orders(user_id, status, created_at);
-- Query: WHERE user_id = 5 AND status = 'active' AND created_at > '2024-01-01'
```

**vs. Multiple Single-Column Indexes:**

PostgreSQL can sometimes combine two single-column indexes via a bitmap AND, but a well-designed composite index is almost always more efficient for multi-column queries.

---

### 9. Explain query execution plans using EXPLAIN ANALYZE

`EXPLAIN` shows what PostgreSQL *plans* to do for a query. `EXPLAIN ANALYZE` actually executes the query and shows what it *actually* did, including real timing. This is the primary tool for query optimization.

**Basic Syntax:**

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 5;
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 5;
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM orders WHERE user_id = 5;
```

**Reading the Output:**

The plan is a tree of nodes, read bottom-up (innermost operations execute first).

```
Seq Scan on orders  (cost=0.00..450.00 rows=100 width=64)
                     (actual time=0.015..12.345 rows=87 loops=1)
  Filter: (user_id = 5)
  Rows Removed by Filter: 4913
```

**Key Fields:**

- `cost=0.00..450.00`: Estimated startup cost .. total cost (in abstract units, not milliseconds)
- `rows=100`: Estimated row count
- `actual time=0.015..12.345`: Real time in milliseconds (startup..total)
- `actual rows=87`: Real rows returned
- `loops=1`: How many times this node executed

**Common Node Types:**

- `Seq Scan`: Full table scan — reads every row. Fine for small tables, bad for large ones.
- `Index Scan`: Uses an index, then fetches the actual row from the heap.
- `Index Only Scan`: Uses an index without heap access (all needed columns in index).
- `Bitmap Index Scan` + `Bitmap Heap Scan`: Builds a bitmap of matching rows, then fetches them in heap order — efficient for moderate result sets.
- `Hash Join`, `Merge Join`, `Nested Loop`: Different join strategies with different performance profiles.
- `Sort`: Explicit sort operation (look out for high memory usage).
- `Hash Aggregate`, `Group Aggregate`: Aggregation strategies.

**What to Look For:**

1. High estimated vs actual row counts → stale statistics → run ANALYZE
2. Seq Scan on a large table when an index exists → check if query is sargable, or if selectivity is too low
3. High cost Sort nodes → consider index on ORDER BY column
4. Nested Loop with high loops → may need a better join strategy or index

**BUFFERS Option:**

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;
-- Shows: shared hit=X (cache), read=Y (disk), written=Z
```

High `read` values indicate disk I/O, suggesting the working set doesn't fit in `shared_buffers`.

---

### 10. What causes slow queries in PostgreSQL?

Slow queries have many potential root causes, often requiring diagnosis via `EXPLAIN ANALYZE` and system statistics.

**Missing or Unused Indexes:**
The most common cause. A sequential scan on a large table is almost always problematic. Check with `pg_stat_user_indexes` for low `idx_scan` counts, and ensure queries on large tables filter on indexed columns.

**Stale Statistics:**
PostgreSQL's query planner uses statistics (histograms of column value distributions) to estimate row counts. If statistics are stale (after large bulk operations), the planner picks suboptimal plans. Fix with `ANALYZE tablename`.

**Table Bloat:**
Excessive dead tuples from insufficient vacuuming cause larger sequential scans. Monitor with `pg_stat_user_tables`.

**N+1 Query Problem:**
Application code runs one query to get a list, then N queries for each item. This is an ORM anti-pattern. Fix with JOINs or batch fetches.

**Poor Join Strategy:**
When PostgreSQL chooses Nested Loop for a large join that would be better served by Hash Join. Usually caused by bad row estimates from stale statistics.

**Lock Contention:**
Queries waiting for locks (from long-running transactions, autovacuum conflicts, DDL operations). Check `pg_stat_activity` and `pg_locks`.

**Connection Overhead:**
Without connection pooling, establishing thousands of connections is expensive. Use PgBouncer.

**Inefficient Query Patterns:**
- Functions in WHERE clauses preventing index use: `WHERE LOWER(email) = ?` (use a functional index instead)
- Leading wildcards: `LIKE '%foo%'` can't use B-Tree indexes
- Implicit type casts: `WHERE user_id = '123'` when user_id is integer
- `SELECT *` returning unnecessary columns

**Hardware/Config:**
- Insufficient `shared_buffers` (should be ~25% of RAM)
- Low `work_mem` causing disk-based sorts and hash joins
- Slow storage for `temp_tablespaces`

**Long-running transactions:**
Prevent VACUUM from cleaning up dead tuples, causing table bloat and lock issues.

---

### 11. How does PostgreSQL handle transactions?

PostgreSQL provides full ACID-compliant transactions. Every SQL statement in PostgreSQL runs within a transaction, either explicitly declared or implicitly wrapped.

**Explicit Transactions:**

```sql
BEGIN;                         -- Or START TRANSACTION
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;                        -- Or ROLLBACK to undo all changes
```

**Savepoints:**

Savepoints allow partial rollbacks within a transaction:

```sql
BEGIN;
  INSERT INTO orders VALUES (1, 'item1');
  SAVEPOINT sp1;
  INSERT INTO orders VALUES (2, 'item2'); -- If this fails:
  ROLLBACK TO SAVEPOINT sp1;             -- Undo just this step
  INSERT INTO orders VALUES (2, 'item3'); -- Try again
COMMIT;
```

**Autocommit:**

By default (and in most client libraries), each statement is its own transaction unless you explicitly `BEGIN`. This is autocommit behavior.

**Transaction States:**
- Active: transaction is running normally
- Aborted: an error occurred; all subsequent commands fail until ROLLBACK
- Idle: between transactions

**Two-Phase Commit (2PC):**

For distributed transactions across multiple databases, PostgreSQL supports `PREPARE TRANSACTION` and `COMMIT PREPARED` / `ROLLBACK PREPARED` for XA-compliant two-phase commit.

**Transaction Isolation:**

PostgreSQL offers four isolation levels (see Q13), each controlling what concurrent transactions can see. The default is READ COMMITTED.

**WAL (Write-Ahead Log):**

All changes are first written to the WAL before being applied to data files. This ensures durability — if PostgreSQL crashes mid-transaction, it replays the WAL on restart and either commits or rolls back incomplete transactions.

---

### 12. Explain ACID properties

ACID is a set of four properties that guarantee database transactions are processed reliably.

**Atomicity:**

A transaction is all-or-nothing. Either all operations within the transaction succeed and are committed, or none of them are applied. There's no partial commit.

Example: Transferring money — debit from Account A and credit to Account B must both succeed or both fail. Atomicity prevents money from disappearing or appearing from nowhere.

PostgreSQL implements this via the transaction log (WAL). If a failure occurs, the WAL is used to roll back to the pre-transaction state.

**Consistency:**

A transaction brings the database from one valid state to another valid state. All defined rules — constraints, cascades, triggers — must be satisfied before and after the transaction.

Example: A `NOT NULL` constraint, foreign key constraint, or `CHECK` constraint violation will cause the entire transaction to roll back, preserving consistency.

**Isolation:**

Concurrent transactions execute as if they were serial. The intermediate state of one transaction is not visible to others. PostgreSQL achieves this via MVCC, where each transaction sees a consistent snapshot.

The degree of isolation is configurable via isolation levels (READ COMMITTED, REPEATABLE READ, SERIALIZABLE), trading off isolation guarantees for performance.

**Durability:**

Once a transaction is committed, it remains committed even in the face of crashes, power failures, or errors. The data is persisted to durable storage.

PostgreSQL achieves this via `fsync` — the WAL is flushed to disk before acknowledging a commit. This is why disabling `fsync` (sometimes done in test environments) is dangerous in production.

**In Practice:**

ACID properties are why relational databases are trusted for financial systems, healthcare records, and any domain where data correctness is non-negotiable.

---

### 13. What are isolation levels in PostgreSQL?

PostgreSQL supports four transaction isolation levels, each protecting against different concurrency anomalies. Higher isolation levels prevent more anomalies but reduce concurrency.

**Concurrency Anomalies:**

- **Dirty Read**: Reading uncommitted data from another transaction
- **Non-Repeatable Read**: Re-reading a row and getting different data (another transaction committed between reads)
- **Phantom Read**: A re-executed query returns new rows (another transaction inserted matching rows)
- **Serialization Anomaly**: Result differs from any serial execution of the transactions

**Isolation Levels:**

**READ UNCOMMITTED:**
Not truly supported in PostgreSQL — PostgreSQL treats it as READ COMMITTED. Provided for SQL standard compatibility.

**READ COMMITTED (default):**
Each statement within a transaction sees data committed before that statement began. Different statements in the same transaction may see different data.
- Prevents: Dirty reads
- Allows: Non-repeatable reads, phantom reads

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

**REPEATABLE READ:**
All statements in a transaction see data as it was at the transaction start. Other transactions' commits are invisible after the first query.
- Prevents: Dirty reads, non-repeatable reads
- Allows: Phantom reads (though PostgreSQL's implementation also prevents most phantom reads)

```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

**SERIALIZABLE:**
The highest isolation level. Transactions are guaranteed to produce a result equivalent to some serial (one-at-a-time) execution. PostgreSQL uses Serializable Snapshot Isolation (SSI) — a more optimistic approach than traditional locking that allows higher concurrency.
- Prevents: All anomalies including serialization anomalies
- May cause: Serialization failures requiring retry logic

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

**Choosing an Isolation Level:**

Most OLTP applications use READ COMMITTED (default). Use REPEATABLE READ when a transaction needs a consistent view across multiple queries (e.g., report generation). Use SERIALIZABLE for critical financial operations or when correctness is paramount and you can handle retry logic.

---

### 14. Difference between READ COMMITTED and SERIALIZABLE?

These are the most commonly used and most contrasting isolation levels.

**READ COMMITTED:**

Each statement sees the latest committed data at the moment it starts. If Transaction A commits a change while Transaction B is mid-flight, Transaction B's subsequent queries will see A's changes.

```sql
-- Transaction B (READ COMMITTED)
BEGIN;
SELECT sum(balance) FROM accounts; -- Returns 1000
-- Transaction A commits, adds new account with balance 500
SELECT sum(balance) FROM accounts; -- Returns 1500 (sees A's commit!)
COMMIT;
```

This is a non-repeatable read. READ COMMITTED is fine for single-statement operations but can produce inconsistent results for multi-statement business logic.

**SERIALIZABLE:**

The entire transaction behaves as if it ran in complete isolation, before or after every other transaction. PostgreSQL uses Serializable Snapshot Isolation (SSI) which uses snapshot reads and tracks read/write dependencies between transactions. If PostgreSQL detects that a serialization anomaly has or would occur, it aborts one of the conflicting transactions with error `40001 serialization_failure`.

```sql
-- Transaction B (SERIALIZABLE)
BEGIN ISOLATION LEVEL SERIALIZABLE;
SELECT sum(balance) FROM accounts; -- Returns 1000
-- Transaction A commits changes
SELECT sum(balance) FROM accounts; -- Still returns 1000 (snapshot is frozen!)
COMMIT; -- May fail with serialization error if dependency conflict detected
```

**Key Differences:**

| Aspect | READ COMMITTED | SERIALIZABLE |
|---|---|---|
| Snapshot | Per-statement | Per-transaction |
| Consistency | Weaker | Strongest |
| Concurrency | Higher | Lower |
| Failure mode | Silent inconsistency | Explicit error |
| Retry logic needed | No | Yes |
| Use case | Most OLTP | Financial, audit, invariant-critical |

**The Trade-off:**

READ COMMITTED silently allows anomalies — you may not even know your data is inconsistent. SERIALIZABLE makes the anomaly explicit by failing the transaction, forcing retry, but guaranteeing correctness. For applications like banking or inventory management where invariants must hold, SERIALIZABLE is worth the overhead.

---

### 15. What is deadlock and how do you resolve it?

A deadlock occurs when two or more transactions each hold a lock that the other needs, creating a circular dependency where neither can proceed.

**Classic Example:**

```sql
-- Transaction A                    -- Transaction B
BEGIN;                               BEGIN;
UPDATE accounts SET bal=bal-100      UPDATE accounts SET bal=bal+200
  WHERE id = 1; -- Locks row 1         WHERE id = 2; -- Locks row 2

UPDATE accounts SET bal=bal+100      UPDATE accounts SET bal=bal-200
  WHERE id = 2; -- Waits for B's lock    WHERE id = 1; -- Waits for A's lock
-- DEADLOCK!
```

Transaction A holds row 1, wants row 2. Transaction B holds row 2, wants row 1. Neither can proceed.

**PostgreSQL's Deadlock Detection:**

PostgreSQL automatically detects deadlocks (by default after `deadlock_timeout = 1s`). It picks one transaction as the victim, rolls it back, and returns an error to the client: `ERROR: deadlock detected`. The other transaction proceeds normally.

**Prevention Strategies:**

1. **Consistent lock ordering**: Always access resources in the same order. If all transactions lock rows in ascending ID order, circular dependencies can't form.

2. **Keep transactions short**: Long-running transactions hold locks longer, increasing deadlock probability.

3. **Use `SELECT FOR UPDATE`**: Acquire row locks at the start of a transaction so you know immediately if there's a conflict, rather than mid-transaction.

4. **Use `NOWAIT` or `SKIP LOCKED`**: Fail fast instead of waiting.

```sql
SELECT * FROM orders WHERE id = 5 FOR UPDATE NOWAIT; -- Error if locked
SELECT * FROM queue WHERE processed = false LIMIT 10 FOR UPDATE SKIP LOCKED; -- Skip locked rows
```

5. **Application retry logic**: Since deadlocks result in a transaction rollback, the application should catch `40P01` (deadlock_detected) and retry the transaction.

---

### 16. What are locks in PostgreSQL?

PostgreSQL uses a multi-layered locking system to manage concurrent access to database objects.

**Table-Level Locks:**

Acquired with `LOCK TABLE` or implicitly by operations. The main modes, from least to most restrictive:

- `ACCESS SHARE`: SELECT statements; compatible with everything except ACCESS EXCLUSIVE
- `ROW SHARE`: SELECT FOR UPDATE/SHARE
- `ROW EXCLUSIVE`: INSERT, UPDATE, DELETE
- `SHARE UPDATE EXCLUSIVE`: VACUUM, some ALTER TABLE forms, CREATE INDEX CONCURRENTLY
- `SHARE`: CREATE INDEX (non-concurrent)
- `SHARE ROW EXCLUSIVE`: Rare; used by triggers
- `EXCLUSIVE`: Rare; blocks most operations
- `ACCESS EXCLUSIVE`: ALTER TABLE (many forms), DROP TABLE, TRUNCATE, REINDEX — blocks everything including reads

**Row-Level Locks:**

Acquired on individual rows during DML:

- `FOR UPDATE`: Exclusive row lock; blocks other `FOR UPDATE` and `FOR NO KEY UPDATE`
- `FOR NO KEY UPDATE`: Weaker exclusive lock; doesn't block foreign key checks
- `FOR SHARE`: Shared row lock; blocks updates
- `FOR KEY SHARE`: Weakest; only blocks `FOR UPDATE`

**Advisory Locks:**

Application-level locks managed by PostgreSQL but not tied to specific tables/rows. Useful for distributed coordination:

```sql
SELECT pg_advisory_lock(12345); -- Acquire application lock
SELECT pg_advisory_unlock(12345); -- Release
SELECT pg_try_advisory_lock(12345); -- Non-blocking attempt
```

**Monitoring Locks:**

```sql
SELECT pid, relation::regclass, mode, granted 
FROM pg_locks 
WHERE NOT granted; -- Blocked locks
```

---

### 17. Row-level lock vs table-level lock?

**Row-Level Locks:**

Acquired on individual rows. Allow high concurrency — multiple transactions can modify different rows in the same table simultaneously.

```sql
-- Only locks specific rows matching the condition
SELECT * FROM orders WHERE id IN (1, 2, 3) FOR UPDATE;
```

Characteristics:
- High granularity = high concurrency
- Multiple transactions can operate on the same table concurrently
- Implemented via the row's xmin/xmax mechanism + lock table (for in-memory tracking)
- Appropriate for OLTP where transactions touch small sets of rows

**Table-Level Locks:**

Acquired on an entire table. Much coarser — blocks all concurrent access at the level specified.

```sql
LOCK TABLE orders IN EXCLUSIVE MODE; -- Explicit table lock
-- Or implicitly by: DROP TABLE, TRUNCATE, many ALTER TABLE forms
```

Characteristics:
- Low granularity = low concurrency
- Necessary for structural changes (schema migrations)
- `ACCESS EXCLUSIVE` (the strongest) blocks all reads and writes
- Can cause significant application downtime if not managed carefully

**Practical Impact:**

In a high-concurrency OLTP system, row-level locks are the norm and table locks should be minimized. The most dangerous table locks are those acquired by schema migrations (`ALTER TABLE`), which block all queries on the table. Techniques like `SET lock_timeout = '2s'` and using tools like `pg_repack` or Flyway with `lock_timeout` settings help manage this in production.

```sql
SET lock_timeout = '5s'; -- Fail if can't get lock within 5 seconds
ALTER TABLE large_table ADD COLUMN new_col TEXT;
```

---

### 18. What are CTEs (WITH clause)?

CTEs (Common Table Expressions) are named temporary result sets defined within a single SQL statement using the `WITH` keyword. They improve readability and enable complex query decomposition.

**Basic Syntax:**

```sql
WITH recent_orders AS (
  SELECT user_id, COUNT(*) as order_count, SUM(total) as total_spent
  FROM orders
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT u.name, u.email, ro.order_count, ro.total_spent
FROM users u
JOIN recent_orders ro ON u.id = ro.user_id
WHERE ro.total_spent > 500;
```

**Recursive CTEs:**

CTEs can reference themselves, enabling recursive queries — essential for hierarchical data (org charts, file systems, graphs):

```sql
WITH RECURSIVE org_tree AS (
  -- Base case: top-level employees (no manager)
  SELECT id, name, manager_id, 1 as depth
  FROM employees WHERE manager_id IS NULL
  
  UNION ALL
  
  -- Recursive case: find direct reports
  SELECT e.id, e.name, e.manager_id, ot.depth + 1
  FROM employees e
  JOIN org_tree ot ON e.manager_id = ot.id
)
SELECT * FROM org_tree ORDER BY depth, name;
```

**Multiple CTEs:**

```sql
WITH 
  active_users AS (SELECT id FROM users WHERE status = 'active'),
  recent_purchases AS (SELECT user_id, COUNT(*) cnt FROM orders GROUP BY user_id)
SELECT au.id, rp.cnt
FROM active_users au
LEFT JOIN recent_purchases rp ON au.id = rp.user_id;
```

**Writable CTEs (Data-Modifying):**

PostgreSQL supports `INSERT`, `UPDATE`, `DELETE` inside CTEs:

```sql
WITH moved_rows AS (
  DELETE FROM active_orders WHERE status = 'completed' RETURNING *
)
INSERT INTO archived_orders SELECT * FROM moved_rows;
```

**Materialization:**

Prior to PostgreSQL 12, CTEs were always materialized (computed once, stored as a temporary result). From PostgreSQL 12+, CTEs are inlined by default unless they are recursive, data-modifying, or you specify `MATERIALIZED`. Use `NOT MATERIALIZED` to force inlining for the planner to optimize through the CTE.

---

### 19. Difference between CTE and subquery?

Both CTEs and subqueries allow you to write modular SQL, but they have important differences in behavior, performance, and readability.

**Readability & Reusability:**

CTEs are named and defined at the top — much cleaner for complex queries. Subqueries are inline and can be harder to read, especially when nested deeply. Unlike subqueries, CTEs can be referenced multiple times in the same query without recomputation (when materialized).

```sql
-- Subquery (repeated logic)
SELECT * FROM orders 
WHERE user_id IN (SELECT id FROM users WHERE status = 'active')
AND total > (SELECT AVG(total) FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 'active'));

-- CTE (reusable)
WITH active_users AS (SELECT id FROM users WHERE status = 'active')
SELECT * FROM orders
WHERE user_id IN (SELECT id FROM active_users)
AND total > (SELECT AVG(total) FROM orders WHERE user_id IN (SELECT id FROM active_users));
```

**Materialization & Performance:**

This is the crucial difference. Prior to PostgreSQL 12, CTEs were always **optimization fences** — they were computed once, stored in memory, and the planner couldn't push predicates through them. This could hurt or help performance depending on the situation.

From PostgreSQL 12+, CTEs are inlined by default (treated like subqueries), so the planner can optimize through them. Use `MATERIALIZED` to force the old behavior (useful when you explicitly want to prevent the planner from running the CTE multiple times).

```sql
-- Force CTE to compute once (old behavior)
WITH expensive_calc AS MATERIALIZED (
  SELECT ... FROM huge_table WHERE complex_condition
)
SELECT * FROM expensive_calc WHERE x = 1
UNION ALL
SELECT * FROM expensive_calc WHERE x = 2;
-- expensive_calc runs once, not twice
```

**Recursion:**

Only CTEs support recursion. Subqueries cannot reference themselves.

**When to Use Each:**

Use CTEs for: complex multi-step logic, recursive queries, data-modifying operations, reusing the same logic multiple times, readability in complex analytical queries.

Use subqueries for: simple single-use filtering, correlated subqueries (which reference outer query columns), or when you want the planner maximum freedom to optimize.

---

### 20. Explain partitioning in PostgreSQL

Partitioning divides a large table into smaller physical chunks (partitions) while maintaining the appearance of a single logical table. PostgreSQL supports declarative partitioning since version 10 (improved significantly in v11-v14).

**Types of Partitioning:**

**Range Partitioning** — partition by a range of values (most common for time-series data):

```sql
CREATE TABLE orders (
  id BIGINT,
  created_at TIMESTAMP,
  total DECIMAL
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2023 PARTITION OF orders
  FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE orders_2024 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

**List Partitioning** — partition by discrete values:

```sql
CREATE TABLE events PARTITION BY LIST (region);
CREATE TABLE events_us PARTITION OF events FOR VALUES IN ('us-east', 'us-west');
CREATE TABLE events_eu PARTITION OF events FOR VALUES IN ('eu-west', 'eu-central');
```

**Hash Partitioning** — distribute rows evenly via hash:

```sql
CREATE TABLE users PARTITION BY HASH (id);
CREATE TABLE users_0 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE users_1 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 1);
```

**Benefits:**

- **Partition pruning**: Queries that filter on the partition key skip irrelevant partitions entirely
- **Faster data archival**: `DROP TABLE orders_2020` is instant vs deleting millions of rows
- **Parallel query**: Each partition can be queried in parallel
- **Better vacuum performance**: Smaller tables vacuum faster
- **Index locality**: Smaller indexes per partition fit in memory

**Partition Pruning Example:**

```sql
EXPLAIN SELECT * FROM orders WHERE created_at >= '2024-06-01';
-- Only scans orders_2024 partition, skips all others
```

**Sub-partitioning:** Partitions can themselves be partitioned (e.g., by year then by region).

---

### 21. Horizontal vs vertical partitioning?

These are two fundamentally different strategies for splitting data.

**Horizontal Partitioning (Sharding by rows):**

Splits rows across multiple tables/databases. Each partition contains a subset of rows but all columns. This is what PostgreSQL's native partitioning implements.

```
Full Table:          Partition 1 (2023):    Partition 2 (2024):
id | date  | total   id | date  | total     id | date  | total
1  | 2023  | 100     1  | 2023  | 100        3  | 2024  | 300
2  | 2023  | 200     2  | 2023  | 200        4  | 2024  | 400
3  | 2024  | 300
4  | 2024  | 400
```

**Use cases:** Time-series data (logs, events, orders), geographic sharding, high-volume tables needing partition pruning.

**Vertical Partitioning (Column splitting):**

Splits columns across multiple tables. Each partition contains all rows but only a subset of columns. Typically implemented by the application, not the database.

```
Full Table:          Core Table:            Extended Table:
id | name | email | bio | avatar  
                    id | name | email       id | bio | avatar
```

**Use cases:**
- Separating frequently accessed columns (name, email) from rarely accessed ones (bio, avatar)
- Large TEXT/BLOB columns that would bloat row size and slow down queries not needing them
- Columnar-style access patterns
- Compliance: separating sensitive PII columns to different storage with different access controls

**Comparison:**

| Aspect | Horizontal | Vertical |
|---|---|---|
| Splits by | Rows | Columns |
| Native DB support | Yes (PostgreSQL partitioning) | Application-level (use JOINs) |
| Query complexity | Transparent (partition pruning) | Requires JOINs |
| Use case | High row count, time-series | Wide tables, mixed access patterns |

---

### 22. What is replication in PostgreSQL?

Replication is the process of copying data from a primary (master) database to one or more replica (standby) servers to ensure high availability, fault tolerance, and read scalability.

**Streaming Replication (Physical):**

The most common type. The primary sends WAL (Write-Ahead Log) records to standbys, which replay them to stay in sync. The replica is a byte-for-byte copy of the primary.

- **Synchronous replication**: The primary waits for the standby to confirm WAL receipt before acknowledging the commit. Zero data loss but higher latency.
- **Asynchronous replication**: The primary doesn't wait. Lower latency, potential data loss on primary failure (replication lag).

**Logical Replication:**

Introduced in PostgreSQL 10. Replicates changes at the row level rather than binary WAL. Allows selective replication (specific tables), replication between different PostgreSQL versions, and replication to non-PostgreSQL systems.

```sql
-- On primary: create publication
CREATE PUBLICATION my_pub FOR TABLE orders, products;

-- On replica: create subscription
CREATE SUBSCRIPTION my_sub
  CONNECTION 'host=primary dbname=mydb'
  PUBLICATION my_pub;
```

**Replication Use Cases:**

- **High Availability**: Automatic failover if primary fails (using tools like Patroni or pg_auto_failover)
- **Read Replicas**: Route read-heavy queries to replicas, offloading the primary
- **Disaster Recovery**: Geographic replicas in separate data centers
- **Zero-downtime upgrades**: Logical replication between different PostgreSQL versions
- **Analytics**: Separate analytics queries to a replica without impacting production

---

### 23. Primary replica setup basics?

Setting up PostgreSQL streaming replication involves configuring the primary to send WAL and the replica to receive it.

**On the Primary:**

1. Edit `postgresql.conf`:
```
wal_level = replica          # or logical
max_wal_senders = 5          # max concurrent replication connections
wal_keep_size = 1GB          # keep WAL for standbys that fall behind
archive_mode = on            # optional: WAL archiving for PITR
```

2. Create a replication user:
```sql
CREATE USER replicator WITH REPLICATION PASSWORD 'secret';
```

3. Edit `pg_hba.conf` to allow replication connections:
```
host  replication  replicator  replica_ip/32  md5
```

**On the Replica:**

1. Use `pg_basebackup` to clone the primary:
```bash
pg_basebackup -h primary_host -U replicator -D /var/lib/postgresql/data -P -R
```
The `-R` flag creates `standby.signal` and configures `primary_conninfo` automatically.

2. Start the replica. PostgreSQL detects `standby.signal` and enters standby mode, connecting to the primary and streaming WAL.

**Monitoring Replication:**

```sql
-- On primary: check replication status
SELECT * FROM pg_stat_replication;
-- Shows: application_name, state, sent_lsn, write_lsn, flush_lsn, replay_lsn, write_lag, flush_lag, replay_lag

-- On replica: check if in recovery
SELECT pg_is_in_recovery();

-- Check replication lag
SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;
```

**Promoting a Replica:**

```bash
pg_ctl promote -D /var/lib/postgresql/data
# Or:
SELECT pg_promote();
```

---

### 24. What are materialized views?

A materialized view is a database object that stores the result of a query physically on disk, unlike a regular view which computes results at query time. It's essentially a cached query result.

**Creating a Materialized View:**

```sql
CREATE MATERIALIZED VIEW monthly_sales_summary AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  product_id,
  SUM(quantity) as units_sold,
  SUM(total) as revenue
FROM orders
JOIN order_items USING (order_id)
GROUP BY 1, 2;

CREATE UNIQUE INDEX ON monthly_sales_summary(month, product_id);
```

**Refreshing:**

The data doesn't update automatically — you must explicitly refresh:

```sql
-- Blocks reads while refreshing
REFRESH MATERIALIZED VIEW monthly_sales_summary;

-- Non-blocking refresh (requires a unique index)
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_sales_summary;
```

**Use Cases:**

- Complex aggregations/joins that are expensive to compute but queried frequently
- Dashboard queries that don't need real-time data (refresh every hour/day)
- Pre-computing expensive analytics
- Reducing load on the primary database

**Scheduling Refreshes:**

Use `pg_cron` extension or an external scheduler (cron job, Airflow):

```sql
-- Using pg_cron
SELECT cron.schedule('0 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_sales_summary');
```

---

### 25. Difference between view and materialized view?

**Regular View:**

A view is just a stored SQL query — a named shortcut. Every time you query a view, PostgreSQL executes the underlying query against the live tables.

```sql
CREATE VIEW active_users AS SELECT * FROM users WHERE status = 'active';
SELECT * FROM active_users; -- Runs the underlying query against live data each time
```

Characteristics:
- Always up-to-date (queries live data)
- No storage cost (just a query definition)
- Performance same as running the underlying query directly
- No refresh needed
- Can be updatable (simple views on single tables)

**Materialized View:**

A materialized view physically stores the query result. Querying it reads the stored data, not the underlying tables.

Characteristics:
- Data can be stale (only as fresh as last refresh)
- Storage cost (stores actual data + indexes)
- Much faster queries (especially for complex aggregations)
- Must be manually refreshed
- Cannot be directly updated

**Comparison:**

| Feature | View | Materialized View |
|---|---|---|
| Data storage | No | Yes |
| Query speed | Same as base query | Fast (cached) |
| Data freshness | Always current | As of last refresh |
| Storage cost | Minimal | Significant |
| Indexable | No | Yes |
| Use case | Abstraction, security | Performance optimization |

**When to Use Which:**

Use a regular view for: access control (hiding sensitive columns), simplifying complex joins used occasionally, or when real-time data is required.

Use a materialized view for: expensive reports/dashboards, analytics aggregations, data that changes infrequently but is queried heavily, and cross-database or cross-schema aggregations.

---

### 26. What is normalization?

Normalization is the process of organizing a database schema to reduce data redundancy and improve data integrity by applying a series of rules (normal forms).

**Why Normalize:**
- Eliminate redundant data (store each piece of information once)
- Prevent update anomalies (changing data in one place doesn't leave stale copies elsewhere)
- Ensure data dependencies are logical

**Normal Forms:**

**First Normal Form (1NF):**
- Each column contains atomic (indivisible) values
- No repeating groups or arrays in columns

```sql
-- Violates 1NF (multiple values in one column)
user_id | phone_numbers
1       | "555-1234, 555-5678"

-- 1NF compliant
user_id | phone_number
1       | 555-1234
1       | 555-5678
```

**Second Normal Form (2NF):**
- Must be in 1NF
- Every non-key column must depend on the entire primary key (no partial dependencies)
- Relevant when primary key is composite

```sql
-- Violates 2NF: order_date depends only on order_id, not (order_id, product_id)
order_id | product_id | order_date | quantity

-- 2NF: separate the order-level data
orders:       order_id | order_date
order_items:  order_id | product_id | quantity
```

**Third Normal Form (3NF):**
- Must be in 2NF
- No transitive dependencies (non-key columns shouldn't depend on other non-key columns)

```sql
-- Violates 3NF: zip_code → city (city depends on zip, not on user_id)
users: user_id | name | zip_code | city

-- 3NF: separate
users:  user_id | name | zip_code
zips:   zip_code | city
```

**Boyce-Codd Normal Form (BCNF):** Stronger version of 3NF; every determinant must be a candidate key.

**Higher Normal Forms (4NF, 5NF):** Handle multi-valued dependencies and join dependencies; rarely applied in practice.

---

### 27. What is denormalization and why use it?

Denormalization is the intentional introduction of redundancy into a database by merging tables, duplicating data, or storing pre-computed values to improve read performance. It's the deliberate reversal of normalization.

**Why Denormalize:**

Highly normalized schemas require many JOINs for common queries. In high-throughput read scenarios (millions of queries/sec), JOINs are expensive. Denormalization trades write complexity and storage for read speed.

**Common Denormalization Techniques:**

**1. Storing derived/computed values:**
```sql
-- Instead of computing on every query:
SELECT COUNT(*) FROM order_items WHERE order_id = 5;

-- Store on the order:
ALTER TABLE orders ADD COLUMN item_count INT;
-- Maintain with triggers or application code
```

**2. Duplicating columns to avoid joins:**
```sql
-- Normalized: orders table joins to users for email
-- Denormalized: store email on orders directly
ALTER TABLE orders ADD COLUMN customer_email TEXT;
-- Useful for historical accuracy (email at time of purchase)
```

**3. Pre-aggregated tables (summary tables):**
```sql
-- Instead of expensive GROUP BY on every dashboard load:
CREATE TABLE daily_sales (
  date DATE,
  product_id INT,
  revenue DECIMAL,
  units INT
);
-- Populated by batch jobs or triggers
```

**When to Denormalize:**

- Read performance is critical and profiling shows JOINs are the bottleneck
- Data is read far more than written
- Historical accuracy is needed (capture state at point-in-time)
- OLAP/analytics workloads (star schema, dimensional modeling)

**Trade-offs:**

- Write operations become more complex (must update all copies)
- Risk of data inconsistency if updates aren't synchronized
- Higher storage consumption
- Should be driven by profiling, not premature optimization

---

### 28. Explain JSONB support in PostgreSQL

PostgreSQL's JSONB type stores JSON data in a decomposed binary format. Unlike the `JSON` type (which stores raw JSON text and re-parses on every access), JSONB parses and stores the data in a binary structure at write time, enabling fast operations and indexing.

**JSON vs JSONB:**

| Feature | JSON | JSONB |
|---|---|---|
| Storage | Raw text | Binary decomposed |
| Write speed | Faster | Slower (parsing cost) |
| Read speed | Slower | Faster |
| Indexing | Not supported | GIN, B-Tree supported |
| Key ordering | Preserved | Not preserved |
| Duplicate keys | Preserved | Last value wins |

**Basic Operations:**

```sql
CREATE TABLE products (
  id SERIAL,
  data JSONB
);

INSERT INTO products (data) VALUES ('{"name": "Widget", "price": 9.99, "tags": ["sale", "new"]}');

-- Operators
SELECT data -> 'name'          -- Returns JSON: "Widget"
SELECT data ->> 'name'         -- Returns text: Widget
SELECT data -> 'tags' -> 0     -- First array element
SELECT data #> '{address,city}' -- Nested path
SELECT data #>> '{address,city}' -- Nested path as text
```

**Containment and Existence:**

```sql
-- Does the JSON contain this subset?
SELECT * FROM products WHERE data @> '{"tags": ["sale"]}';

-- Does key exist?
SELECT * FROM products WHERE data ? 'price';
SELECT * FROM products WHERE data ?| ARRAY['price', 'cost']; -- either key
SELECT * FROM products WHERE data ?& ARRAY['price', 'name']; -- both keys
```

**Indexing JSONB:**

```sql
-- GIN index for containment and key existence queries
CREATE INDEX ON products USING GIN(data);

-- B-Tree index on a specific JSONB field (expression index)
CREATE INDEX ON products ((data->>'price')::DECIMAL);
```

**Modifying JSONB:**

```sql
-- jsonb_set to update a field
UPDATE products
SET data = jsonb_set(data, '{price}', '12.99')
WHERE id = 1;

-- Concatenation operator for merging
UPDATE products
SET data = data || '{"on_sale": true}'
WHERE id = 1;

-- Remove a key
UPDATE products SET data = data - 'old_field' WHERE id = 1;
```

---

### 29. When would you store JSONB instead of relational data?

JSONB is not a replacement for relational modeling — it's a tool for specific situations. Here's when it makes sense:

**Good Use Cases for JSONB:**

**1. Variable/dynamic attributes:**
When different entities have different sets of attributes and you don't know them all upfront:
```sql
-- E-commerce: each product category has different specs
-- Electronics: wattage, voltage, frequency
-- Clothing: size, material, color, gender
-- Books: author, ISBN, pages, genre
CREATE TABLE products (id SERIAL, category TEXT, attributes JSONB);
-- Much cleaner than a 50-column table or EAV (Entity-Attribute-Value) pattern
```

**2. Storing external API responses:**
When ingesting data from external APIs that you don't fully control, storing raw responses in JSONB allows you to query them later without knowing the schema upfront.

**3. Event/audit logs:**
Events often have variable payloads. Storing event metadata as JSONB alongside fixed columns (user_id, event_type, timestamp) is clean and queryable.

**4. Feature flags / configuration:**
Hierarchical configuration objects that vary by context.

**5. Prototyping:**
When the schema is still evolving and you need flexibility.

**When NOT to Use JSONB:**

- When data has a known, stable schema — use proper columns with types, constraints, and indexes
- When you need foreign key constraints on the JSON fields
- When you need aggregate functions (AVG, SUM) on JSON fields frequently — it works but is slower than native column types
- For simple key-value data — hstore or a proper columns may be better
- When row-level security or access control is needed on individual fields

**The Hybrid Pattern:**

Often the best approach is to use both:
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,     -- Fixed: always present, frequently queried
  price DECIMAL NOT NULL, -- Fixed: needs constraints and aggregate queries
  attributes JSONB        -- Variable: category-specific specs
);
```

---

### 30. Explain connection pooling and tools like PgBouncer

**The PostgreSQL Connection Problem:**

Every PostgreSQL connection spawns a dedicated backend process (~5-10MB RAM each). Opening 1000 direct connections would consume 5-10GB of RAM just for connection overhead, and PostgreSQL degrades significantly at high connection counts. Web applications where each request opens a connection would overwhelm PostgreSQL instantly.

**What Connection Pooling Does:**

A connection pooler sits between the application and PostgreSQL, maintaining a pool of actual database connections. Applications connect to the pooler (cheap), which maps those to a smaller set of real PostgreSQL connections (expensive).

```
Applications (thousands)  →  PgBouncer  →  PostgreSQL (dozens of connections)
100 app connections            pool           10 real connections
```

**PgBouncer:**

The most popular PostgreSQL connection pooler. Lightweight, written in C, extremely efficient.

**Pooling Modes:**

1. **Session pooling**: One server connection per client session. Client keeps the connection for its entire session. Least efficient but supports all PostgreSQL features (prepared statements, `SET`, temporary tables).

2. **Transaction pooling**: One server connection per transaction. The connection is returned to the pool after each transaction completes. Most efficient — a pool of 50 connections can serve thousands of clients. **Caveat**: Prepared statements, `SET` commands, and advisory locks don't work correctly across transactions.

3. **Statement pooling**: One server connection per SQL statement. Most aggressive. Very limited use — doesn't work with multi-statement transactions.

**PgBouncer Configuration:**

```ini
[databases]
mydb = host=127.0.0.1 port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
server_idle_timeout = 600
```

**Alternatives:**

- **Pgpool-II**: Heavier, supports load balancing across replicas and query routing
- **RDS Proxy** (AWS): Managed connection pooler for AWS RDS/Aurora PostgreSQL
- **Built-in pooling in ORMs** (like SQLAlchemy's connection pool): Application-level, not as effective for multi-process deployments

**Best Practice:**

Use PgBouncer in transaction mode for web applications. Keep `default_pool_size` at 25-50% of `max_connections` in PostgreSQL, and set PostgreSQL's `max_connections` to 100-200 rather than 1000+.

---

## MongoDB (25 Questions)

---

### 1. What is MongoDB and when should you use it?

MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like documents (BSON format). Unlike relational databases with fixed schemas and tables, MongoDB stores related data together in self-contained documents, which can have different structures.

**Core Characteristics:**
- Schema-flexible: documents in the same collection don't need the same fields
- Horizontally scalable: built-in sharding for distributing data across servers
- Developer-friendly: document model maps naturally to objects in application code
- Rich query language: supports filtering, aggregation, text search, geospatial queries
- Replication built-in: replica sets provide high availability automatically

**When to Use MongoDB:**

- **Varying/dynamic schemas**: Different entities with different attributes (product catalogs, user profiles with custom fields)
- **Hierarchical/nested data**: Data that is naturally nested and queried together (e.g., a blog post with its comments, a customer with their address and preferences)
- **Rapid prototyping**: When the schema is evolving and you need flexibility
- **High write throughput**: IoT sensor data, event logging, real-time analytics ingestion
- **Content management**: Articles, pages, media metadata with varying structures
- **Catalogs**: E-commerce product catalogs with category-specific attributes

**When NOT to Use MongoDB:**

- Complex multi-entity transactions with strict ACID requirements (financial systems)
- Data with highly relational structure that requires many cross-collection JOINs
- When strong consistency and complex constraints are critical
- When your team is more experienced with SQL and the data is naturally tabular

---

### 2. Difference between MongoDB and relational databases?

**Data Model:**

Relational databases store data in tables (rows and columns) with a fixed schema. MongoDB stores data in collections of documents (BSON objects) with a flexible schema. Related data that you query together is embedded in a single document rather than normalized into multiple tables.

**Schema:**

Relational: schema is defined upfront and enforced by the database. Altering schema requires migrations. MongoDB: schema is flexible by default (each document can have different fields). Schema validation can be added optionally via JSON Schema.

**Relationships:**

Relational: relationships modeled with foreign keys and JOINs. MongoDB: relationships modeled through embedding (denormalization) or references (manual JOINs via `$lookup`). JOINs are less natural in MongoDB and don't perform as well as in PostgreSQL for complex multi-collection queries.

**Scaling:**

Relational databases scale primarily vertically (bigger hardware). Horizontal scaling (sharding) is possible but complex. MongoDB was designed for horizontal scaling with built-in sharding.

**Transactions:**

Relational databases have mature, full ACID transaction support. MongoDB added multi-document ACID transactions in version 4.0, but the data model is designed to minimize the need for them.

**Query Language:**

Relational: SQL (standardized, declarative). MongoDB: BSON-based query language and aggregation pipeline (expressive but proprietary).

**Consistency:**

Relational: strongly consistent by default. MongoDB: default write concern is majority, and reads can be configured for different consistency levels.

---

### 3. Explain BSON

BSON (Binary JSON) is the binary serialization format MongoDB uses to store and transfer documents. It extends JSON with additional data types and is optimized for traversal speed and space efficiency.

**Why Not Just JSON?**

Plain JSON is text-based, which makes it expensive to parse repeatedly. JSON also lacks types like dates, binary data, and explicit integer vs float distinction. BSON solves these:

**Additional BSON Types vs JSON:**

- `ObjectId` — 12-byte unique identifier (used as `_id` by default)
- `Date` — UTC datetime as 64-bit integer milliseconds since epoch
- `Int32` / `Int64` — explicit integer types (JSON has only `Number`)
- `Double` — 64-bit float
- `Decimal128` — high-precision decimal (for financial data)
- `Binary` — arbitrary binary data (file contents, UUIDs)
- `BinData` — binary subtype for UUIDs, MD5s, etc.
- `Timestamp` — internal MongoDB timestamp (not for application use)
- `Null` / `Undefined` / `MinKey` / `MaxKey`
- `Regular Expression`
- `JavaScript code`

**Structure:**

BSON documents are length-prefixed, which allows the MongoDB driver to quickly skip over documents or fields without parsing them. Each field stores its type, name, and value — making document traversal O(n) but field-by-field access fast once you're at the right position.

**ObjectId:**

The default `_id` type. 12 bytes: 4-byte Unix timestamp, 5-byte random value, 3-byte incrementing counter. This encodes creation time and is globally unique across machines.

```javascript
const { ObjectId } = require('mongodb');
const id = new ObjectId();
id.getTimestamp(); // Date object of creation time
```

---

### 4. What are collections and documents?

**Documents:**

A document is MongoDB's basic unit of data — analogous to a row in a relational database. It's a BSON object of key-value pairs:

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "age": 29,
  "address": {
    "street": "123 Main St",
    "city": "Austin",
    "state": "TX"
  },
  "tags": ["premium", "verified"],
  "created_at": ISODate("2024-01-15T10:30:00Z")
}
```

Key characteristics:
- Documents can have nested objects and arrays
- Different documents in the same collection can have different fields
- Maximum document size is 16MB
- Every document must have a unique `_id` field (auto-created as ObjectId if not provided)

**Collections:**

A collection is a group of documents — analogous to a table. Collections don't enforce a fixed schema by default (all documents can look different). Collections are created automatically when you first insert a document.

```javascript
db.users.insertOne({ name: "Bob" });        // Creates 'users' collection if not exists
db.orders.find({ status: "pending" });      // Query 'orders' collection
db.products.createIndex({ sku: 1 });        // Index on 'products' collection
```

Collections can optionally have schema validation:

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      required: ["name", "email"],
      properties: {
        name: { bsonType: "string" },
        email: { bsonType: "string", pattern: "^.+@.+$" }
      }
    }
  }
});
```

---

### 5. What are embedded documents?

Embedded documents (also called subdocuments) are documents nested inside another document. They represent related data stored together within a single BSON object rather than in separate collections.

```json
{
  "_id": ObjectId("..."),
  "order_number": "ORD-2024-001",
  "customer": {
    "name": "Alice Johnson",
    "email": "alice@example.com"
  },
  "shipping_address": {
    "street": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip": "78701"
  },
  "items": [
    { "product_id": "P001", "name": "Widget", "qty": 2, "price": 9.99 },
    { "product_id": "P002", "name": "Gadget", "qty": 1, "price": 24.99 }
  ],
  "total": 44.97,
  "status": "shipped"
}
```

**Benefits:**
- Retrieve all related data in a single read (no JOIN)
- Atomic updates on the entire document
- Better performance for data that is always accessed together
- Natural representation of hierarchical data

**Querying Embedded Documents:**

```javascript
// Query by embedded field
db.orders.find({ "shipping_address.city": "Austin" });

// Query array of embedded documents
db.orders.find({ "items.product_id": "P001" });

// Query with condition on array elements
db.orders.find({ "items": { $elemMatch: { qty: { $gt: 1 }, price: { $lt: 20 } } } });
```

**Limitations:**
- 16MB document size limit
- Arrays can grow unboundedly (use a reference if a list can grow forever — e.g., all posts by a user)
- Updating a specific embedded document in a large array can be expensive

---

### 6. Embedding vs referencing?

The most fundamental schema design decision in MongoDB is whether to embed related data or reference it.

**Embedding (Denormalization):**

Store related data within the parent document.

```json
// Post with embedded comments
{
  "_id": ObjectId("..."),
  "title": "My Post",
  "content": "...",
  "comments": [
    { "author": "Alice", "text": "Great post!", "date": "2024-01-15" },
    { "author": "Bob", "text": "Thanks!", "date": "2024-01-16" }
  ]
}
```

**Use embedding when:**
- Data is always accessed together
- The embedded data belongs to one parent (1:1 or 1:few)
- The embedded array has a bounded, small size
- Atomicity of updates matters

**Referencing (Normalization):**

Store references (ObjectIds) and use `$lookup` to join.

```json
// Post document
{ "_id": ObjectId("post1"), "title": "My Post", "author_id": ObjectId("user1") }

// Comment documents in separate collection
{ "_id": ObjectId("c1"), "post_id": ObjectId("post1"), "author": "Alice", "text": "Great!" }
```

**Use referencing when:**
- Data is accessed independently (query comments without posts)
- The relationship is 1:many with an unbounded many (a user's all-time tweets)
- Data is shared across multiple parent documents (many-to-many)
- Documents would exceed 16MB with embedding

**The "Rule of Thumb":**

> Embed if you always need the data together. Reference if you need to access the data independently or if the array can grow without bound.

---

### 7. What is schema design in MongoDB?

Unlike relational databases where schema design follows normalization rules, MongoDB schema design is driven by your application's access patterns. The mantra is: **"Design your schema for how your application queries the data."**

**Design Process:**

1. **Identify your access patterns first**: What queries will run most often? What data is always read together? What are the read:write ratios?
2. **Model for the common case**: Optimize for the most frequent queries, even if edge cases are less efficient
3. **Embed or reference based on access patterns**: See Q6
4. **Think about data growth**: Arrays that can grow infinitely are an anti-pattern
5. **Avoid complex multi-collection joins**: If every read requires `$lookup` across 3 collections, reconsider the model

**Common Patterns:**

**Polymorphic Pattern:** Store different entity types in the same collection with a `type` discriminator:
```json
{ "_id": "...", "type": "video", "title": "...", "duration": 120, "url": "..." }
{ "_id": "...", "type": "article", "title": "...", "word_count": 500, "body": "..." }
```

**Attribute Pattern:** Use a key-value array for variable attributes:
```json
{ "_id": "...", "name": "Widget", "specs": [
  { "k": "color", "v": "red" },
  { "k": "weight_kg", "v": 0.5 }
]}
```
Create a multikey index on `specs.k` and `specs.v` for efficient querying.

**Bucket Pattern:** Group time-series data into hourly/daily buckets to avoid millions of small documents.

**Computed Pattern:** Pre-compute and store aggregated values to avoid expensive runtime aggregations.

---

### 8. What are indexes in MongoDB?

MongoDB indexes are data structures that store a small portion of a collection's data in an easy-to-traverse form, improving query performance. Without indexes, MongoDB performs a collection scan — examining every document.

**Default Index:**

Every collection has an index on `_id` by default.

**Creating Indexes:**

```javascript
// Single field index
db.users.createIndex({ email: 1 });       // 1 = ascending, -1 = descending

// Unique index
db.users.createIndex({ email: 1 }, { unique: true });

// Sparse index (only indexes docs where field exists)
db.users.createIndex({ phone: 1 }, { sparse: true });

// Background index creation (doesn't block reads/writes in older versions)
db.users.createIndex({ name: 1 }, { background: true }); // Deprecated in 4.2+
// In 4.2+, all index builds don't hold the global write lock
```

**Index Types:**

- **Single field**: Index on one field
- **Compound**: Index on multiple fields (order matters — see Q9)
- **Multikey**: Automatic when indexing an array field; creates an index entry per array element
- **Text**: For full-text search (`$text` operator)
- **Geospatial**: `2d` (flat), `2dsphere` (spherical) for geo queries
- **Hashed**: For hash-based sharding; only supports equality
- **TTL**: Automatically removes documents after a time period (see Q22)
- **Wildcard**: Indexes all fields or all fields matching a pattern (flexible schemas)

**Monitoring Indexes:**

```javascript
db.users.getIndexes();
db.users.aggregate([{ $indexStats: {} }]); // Usage statistics
db.users.find({ email: "alice@example.com" }).explain("executionStats");
```

---

### 9. Explain compound indexes

A compound index is an index on multiple fields in a document. As in PostgreSQL, the order of fields in a compound index is critical.

**Creating Compound Indexes:**

```javascript
db.orders.createIndex({ user_id: 1, status: 1, created_at: -1 });
```

**The ESR Rule (Equality, Sort, Range):**

For optimal compound index usage, order fields as:
1. **Equality** conditions first (exact matches)
2. **Sort** fields next (ORDER BY equivalent)
3. **Range** fields last (greater than, less than, in)

```javascript
// Query: user's orders, sorted by date, in a status range
db.orders.find({ user_id: 5, status: "active" }).sort({ created_at: -1 });
// Best index: { user_id: 1, status: 1, created_at: -1 }
```

**Prefix Rule:**

A compound index `{ a: 1, b: 1, c: 1 }` supports queries on:
- `{ a: ... }` — prefix of index
- `{ a: ..., b: ... }` — prefix of index
- `{ a: ..., b: ..., c: ... }` — full index

But NOT efficiently: `{ b: ... }`, `{ c: ... }`, `{ b: ..., c: ... }`

**Sort Direction:**

For queries with multi-field sorts, the index directions must match or be all reversed:

```javascript
// Index: { a: 1, b: -1 }
// Supports sort: { a: 1, b: -1 } ✓ and { a: -1, b: 1 } ✓ (reverse traversal)
// Does NOT support: { a: 1, b: 1 } ✗ or { a: -1, b: -1 } ✗
```

---

### 10. What is a covered query?

A covered query is one where all the fields needed by the query (both in the filter and in the projection) are present in the index. MongoDB can satisfy the query entirely from the index without reading the actual documents from disk.

**Why Covered Queries Are Fast:**

Index data is much smaller than documents and more likely to be in memory (RAM). Covered queries avoid the document fetch step entirely, reducing I/O significantly.

**Example:**

```javascript
// Index: { email: 1, name: 1, status: 1 }

// This query is COVERED (all fields in index)
db.users.find(
  { email: "alice@example.com", status: "active" },  // filter — in index
  { name: 1, email: 1, _id: 0 }                      // projection — in index
);
```

MongoDB can answer this entirely from the index — it knows `email`, `name`, and `status` without touching the document heap.

**Verifying with explain():**

```javascript
db.users.find(
  { email: "alice@example.com" },
  { name: 1, email: 1, _id: 0 }
).explain("executionStats");
// Look for: "stage": "IXSCAN" with no "FETCH" stage
// "totalDocsExamined": 0 confirms it's covered
```

**Requirements:**
- All queried fields must be in the index
- All projected fields must be in the index
- `_id` must be explicitly excluded (`_id: 0`) unless it's in the index
- Field cannot be an array (multikey indexes can't be used for covered queries)

---

### 11. Explain MongoDB aggregation pipeline

The aggregation pipeline is MongoDB's framework for data transformation and computation. Documents pass through a sequence of stages, each transforming the data, analogous to Unix pipes or SQL's SELECT/WHERE/GROUP BY/HAVING chain.

**Basic Syntax:**

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },          // Stage 1: filter
  { $group: { _id: "$user_id", total: { $sum: "$amount" } } }, // Stage 2: aggregate
  { $sort: { total: -1 } },                     // Stage 3: sort
  { $limit: 10 }                                // Stage 4: top 10
]);
```

**Key Stages:**

`$match`: Filter documents (like WHERE/HAVING). Should be early in the pipeline to reduce data processed downstream. Uses indexes when first in the pipeline.

`$group`: Group documents and compute aggregations (`$sum`, `$avg`, `$min`, `$max`, `$count`, `$push`, `$addToSet`).

`$project`: Reshape documents — include/exclude fields, compute new fields, rename fields.

`$sort`: Sort by one or more fields.

`$limit` / `$skip`: Pagination.

`$unwind`: Deconstruct array fields — creates one document per array element.

`$lookup`: Left outer join from another collection.

`$addFields`: Add computed fields without changing others.

`$bucket` / `$bucketAuto`: Group values into ranges.

`$facet`: Run multiple sub-pipelines simultaneously on the same documents.

`$out` / `$merge`: Write pipeline results to a new collection.

**Example — Sales Report:**

```javascript
db.orders.aggregate([
  { $match: { created_at: { $gte: new Date("2024-01-01") } } },
  { $unwind: "$items" },
  { $group: {
    _id: "$items.product_id",
    revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
    units: { $sum: "$items.qty" }
  }},
  { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
  { $unwind: "$product" },
  { $project: { name: "$product.name", revenue: 1, units: 1 } },
  { $sort: { revenue: -1 } }
]);
```

---

### 12. Match, group, project, unwind stages?

**$match:**

Filters the document stream. Supports all standard MongoDB query operators: `$eq`, `$gt`, `$in`, `$regex`, `$and`, `$or`, etc. Place early in the pipeline to leverage indexes and reduce data volume.

```javascript
{ $match: { 
  status: "active", 
  age: { $gte: 18 },
  "address.country": "US"
}}
```

**$group:**

Groups documents by a key (`_id`) and computes accumulators. `_id: null` aggregates all documents.

```javascript
{ $group: {
  _id: { year: { $year: "$created_at" }, month: { $month: "$created_at" } },
  total_revenue: { $sum: "$amount" },
  order_count: { $count: {} },
  avg_order: { $avg: "$amount" },
  customers: { $addToSet: "$user_id" } // unique set
}}
```

**$project:**

Reshapes documents. Include (1), exclude (0), or compute new fields.

```javascript
{ $project: {
  _id: 0,                                           // exclude
  full_name: { $concat: ["$first_name", " ", "$last_name"] }, // compute
  year: { $year: "$created_at" },                   // extract date part
  discounted: { $multiply: ["$price", 0.9] }        // compute
}}
```

**$unwind:**

Deconstructs an array field. Each array element creates a separate output document.

```javascript
// Input: { _id: 1, tags: ["a", "b", "c"] }
{ $unwind: "$tags" }
// Output: 
// { _id: 1, tags: "a" }
// { _id: 1, tags: "b" }
// { _id: 1, tags: "c" }

// Options
{ $unwind: { path: "$tags", preserveNullAndEmpty: true, includeArrayIndex: "tagIndex" } }
```

`$unwind` is often followed by `$group` to re-aggregate after the expansion.

---

### 13. What is sharding?

Sharding is MongoDB's horizontal scaling mechanism — distributing data across multiple servers (shards) so that no single machine holds all the data or handles all the load.

**Architecture:**

A sharded cluster has three components:
- **Shards**: Each shard is a replica set holding a subset of the data
- **Config servers**: Store cluster metadata (which shard holds which data range)
- **mongos routers**: Query routers that route application queries to the correct shard(s)

Applications connect to `mongos`, which transparently routes queries.

**How Data is Distributed:**

MongoDB uses a **shard key** to determine which shard a document belongs to. The shard key is one or more fields in each document.

**Sharding Strategies:**

1. **Range sharding**: Documents are divided by contiguous ranges of the shard key. Easy to range query, but risks hot spots if keys are monotonically increasing (e.g., timestamps).

2. **Hash sharding**: Shard key values are hashed before distribution. Even distribution, but range queries must broadcast to all shards.

3. **Zone sharding**: Manually define which key ranges go to which shards. Useful for geographic or compliance requirements.

**Scatter-Gather vs Targeted Queries:**

- **Targeted query**: Filter includes the shard key → `mongos` routes to exactly one shard
- **Scatter-gather**: No shard key in filter → `mongos` broadcasts to ALL shards and merges results (expensive)

This is why shard key selection is so critical (see Q14).

---

### 14. Explain shard key selection

The shard key is the most consequential decision in a sharded MongoDB deployment. A bad shard key causes hot spots, poor scalability, and scattered queries.

**Criteria for a Good Shard Key:**

**1. High cardinality**: The key must have enough distinct values to distribute data across shards. A boolean field (only 2 values) cannot distribute across more than 2 shards. Use high-cardinality fields like user_id, session_id, or compound keys.

**2. Even distribution**: Values should be evenly distributed to prevent some shards from holding more data than others (data skew). Monotonically increasing keys (like timestamps or auto-increment IDs) all go to the latest/highest chunk and overload one shard.

**3. Query isolation**: For performance, most queries should include the shard key so `mongos` can route to a single shard. If your primary query pattern is `find by user_id`, make `user_id` part of the shard key.

**Common Shard Key Patterns:**

```javascript
// For a user-centric application: shard by user_id
db.adminCommand({ shardCollection: "mydb.orders", key: { user_id: 1 } });

// For random distribution (avoid hot spots): hashed
db.adminCommand({ shardCollection: "mydb.events", key: { _id: "hashed" } });

// Zone-based: shard by region for data locality
// { region: 1, user_id: 1 } — routes EU data to EU shards
```

**Anti-Patterns:**

- Monotonically increasing keys (ObjectId, timestamp as sole shard key) — all writes go to one shard
- Low cardinality keys (status, boolean, enum) — can't balance more shards than distinct values
- Keys rarely used in queries — causes scatter-gather on every read

**Immutability:**

Shard key values are immutable — you cannot change the shard key field value of a document after insertion (without deleting and reinserting it).

---

### 15. What is replication in MongoDB?

Replication in MongoDB provides high availability and data redundancy through **replica sets** — groups of MongoDB instances that maintain the same dataset.

**Purpose:**
- **High availability**: Automatic failover if the primary fails
- **Data redundancy**: Multiple copies of data on different servers/data centers
- **Read scaling**: Route read queries to secondaries (with appropriate read preference)
- **Disaster recovery**: Geographic replicas for business continuity

**How Replication Works:**

All writes go to the primary. The primary records every operation in its **oplog** (operations log) — a special capped collection in the `local` database. Secondaries continuously replicate the oplog, applying each operation to their own data copy.

**Write Concern:**

Controls how many replicas must acknowledge a write before it's considered successful:
- `w: 1` (default): Acknowledge after primary writes
- `w: "majority"`: Acknowledge after majority of replica set members write
- `w: 3`: Acknowledge after 3 specific members write

**Read Preference:**

Controls which replica handles read queries:
- `primary` (default): All reads from primary
- `primaryPreferred`: Primary if available, secondary otherwise
- `secondary`: Always from secondary (may read stale data)
- `nearest`: Lowest network latency member
- `secondaryPreferred`: Secondary if available

---

### 16. What is a replica set?

A replica set is a group of MongoDB instances (mongod processes) that maintain the same data, providing redundancy and automatic failover.

**Components:**

- **Primary (1)**: Receives all write operations. At any given time, there is exactly one primary.
- **Secondaries (1+)**: Maintain copies of the primary's data by replicating the oplog. Can serve reads depending on read preference.
- **Arbiter (optional)**: A lightweight member that participates in elections but doesn't store data. Used to break ties in elections with an even number of data-bearing members.

**Typical Deployment:**

3-member replica set: 1 primary + 2 secondaries. This provides a majority (2) for failover even if one member is unavailable. Data center deployments often use 3 data centers with one member each.

```javascript
// Initialize a replica set
rs.initiate({
  _id: "myReplSet",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
});
rs.status(); // Check replica set status
```

**Oplog:**

The oplog is a capped collection on the primary containing all write operations. Secondaries poll the primary's oplog and replay operations. The oplog size determines how far behind a secondary can fall before it needs a full resync. Configure with `--oplogSize` or `storage.oplogMinRetentionHours`.

---

### 17. Primary vs secondary nodes?

**Primary:**

- The single node that accepts all write operations
- Records all writes to its oplog
- Participates in elections (can vote and be elected)
- Provides the most up-to-date data (no replication lag)
- Must be reachable by a majority for writes to succeed

**Secondary:**

- Replicates data from the primary via oplog tailing
- Can serve read operations (if read preference allows)
- Participates in elections (votes for a new primary if current primary fails)
- May have replication lag (usually milliseconds, but can be more under load)
- Can be configured with special roles:
  - **Hidden**: Not used for queries, excluded from driver discovery, useful for backups
  - **Delayed**: Intentional lag (e.g., 1 hour) for recovery from accidental data loss
  - **Priority 0**: Cannot become primary; useful for DR nodes or analytics nodes that should never handle writes

```javascript
// Configure a hidden, delayed secondary for backup purposes
rs.reconfig({
  members: [
    { _id: 0, host: "mongo1:27017", priority: 1 },
    { _id: 1, host: "mongo2:27017", priority: 1 },
    { _id: 2, host: "mongo3:27017", priority: 0, hidden: true, slaveDelay: 3600 }
  ]
});
```

---

### 18. What happens during failover?

Failover is the automatic process of electing a new primary when the current primary becomes unavailable.

**Election Process:**

1. Secondaries can no longer reach the primary (after `electionTimeoutMillis`, default 10 seconds)
2. An eligible secondary calls for an election
3. Each member votes — a node wins if it receives votes from a majority of the replica set
4. The secondary with the highest priority and most up-to-date oplog typically wins
5. The winner transitions to primary state
6. Other members become secondaries of the new primary

**During Election:**

- Write operations to the replica set fail (no primary available) — typically 10-30 seconds of downtime
- Read operations may succeed if read preference allows secondary reads
- Application drivers (with proper connection strings using replicaSet parameter) automatically detect the new primary

**Post-Failover:**

When the old primary comes back online:
- It rejoins as a secondary
- Rolls back any writes that weren't replicated before the failure (if any — these go to a rollback file)
- Starts replicating from the new primary

**Minimizing Impact:**

- Use write concern `w: "majority"` to prevent rollbacks (only writes replicated to majority are acknowledged)
- Keep applications connected with proper retry logic
- Use `retryWrites: true` in connection string (automatically retries certain write operations)
- Ensure replica set has an odd number of members to avoid election ties

---

### 19. Explain write concern and read concern

**Write Concern:**

Specifies the level of acknowledgment requested from MongoDB for write operations — how many nodes must confirm receipt before the write is considered successful.

```javascript
db.orders.insertOne(
  { item: "Widget", qty: 10 },
  { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
);
```

- `w: 0` — Fire and forget; no acknowledgment. Fastest, no durability guarantee.
- `w: 1` — Acknowledge from primary only. Default in many drivers. Fast but risks data loss if primary fails before replication.
- `w: "majority"` — Acknowledge once majority of voting members have written. Recommended for critical data.
- `w: N` — Acknowledge from N specific nodes.
- `j: true` — Require journal flush to disk before acknowledging (durability guarantee on the acknowledging nodes).
- `wtimeout` — Maximum milliseconds to wait for write concern.

**Read Concern:**

Specifies the consistency and isolation properties of data returned by read operations.

- `local` (default): Returns most recent data on the queried node; may include data not yet replicated to majority.
- `available`: Similar to local; for sharded clusters, may return orphaned data. Lowest latency.
- `majority`: Returns data confirmed written by a majority; won't be rolled back. Stronger guarantee.
- `linearizable`: Reflects all majority-acknowledged writes before the read started. Strongest; slowest. Only for primary reads.
- `snapshot`: Used in transactions; sees a consistent snapshot of the data.

**Write + Read Concern Pairing:**

For maximum durability, use `writeConcern: { w: "majority" }` with `readConcern: "majority"` together. This ensures you only read data that has been confirmed durable.

---

### 20. What are transactions in MongoDB?

MongoDB supports multi-document ACID transactions since version 4.0 (replica sets) and 4.2 (sharded clusters). They allow multiple operations across multiple documents and collections to be executed atomically.

**Syntax:**

```javascript
const session = client.startSession();
session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
});

try {
  await accounts.updateOne(
    { _id: senderAccountId },
    { $inc: { balance: -100 } },
    { session }
  );
  await accounts.updateOne(
    { _id: receiverAccountId },
    { $inc: { balance: 100 } },
    { session }
  );
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  await session.endSession();
}
```

**ACID Guarantees:**

- **Atomic**: Either all operations commit or all are rolled back
- **Consistent**: All read/write isolation rules are maintained
- **Isolated**: Uses snapshot isolation — transaction sees data as it was at transaction start
- **Durable**: Committed changes survive crashes (with majority write concern + journaling)

**Limitations:**

- Transactions spanning shards require 2-phase commit — higher latency
- Write conflict rate increases with contention — retry logic required
- Performance overhead compared to single-document operations
- Maximum transaction runtime: 60 seconds by default

---

### 21. When should you avoid transactions in MongoDB?

Transactions in MongoDB are powerful but should be used sparingly because they come with significant performance overhead and complexity. If your schema design is good, you rarely need them.

**Avoid Transactions When:**

**1. Single-document atomicity suffices:**

MongoDB guarantees atomic updates on a single document, including all embedded subdocuments and arrays. This is usually enough:

```javascript
// Atomic even without a transaction — single document
db.accounts.updateOne(
  { _id: userId, balance: { $gte: 100 } }, // Condition check + update atomic
  { $inc: { balance: -100 }, $push: { transactions: { type: "debit", amount: 100 } } }
);
```

If the data that must change together lives in one document, you don't need a transaction.

**2. Performance is critical:**

Transactions lock documents and require coordination across nodes. Under high write throughput, transaction conflicts cause retries and reduce overall throughput dramatically. Benchmark carefully before relying on transactions for hot paths.

**3. You're operating on a sharded cluster with many shards:**

Cross-shard transactions use 2-phase commit, which can be 3-5x slower than single-shard operations and can amplify lock contention.

**4. The operations are idempotent:**

If you can design writes to be safe to retry without a transaction (e.g., using `upsert` semantics), that's preferable.

**Better Alternatives:**

- **Schema redesign**: Embed data that must be atomically updated
- **Two-phase commit pattern**: Application-level saga/workflow pattern for complex multi-step operations
- **Optimistic locking**: Version field + conditional update to detect conflicts without locking

---

### 22. Explain TTL indexes

TTL (Time-To-Live) indexes are special single-field indexes that automatically delete documents after a specified number of seconds, or at a specific date-time. MongoDB runs a background task (every 60 seconds) that removes expired documents.

**Creating TTL Indexes:**

```javascript
// Delete documents 3600 seconds (1 hour) after the indexed date field
db.sessions.createIndex({ created_at: 1 }, { expireAfterSeconds: 3600 });

// Delete at a specific time — index field must be a Date, expireAfterSeconds must be 0
db.scheduled_jobs.createIndex({ expire_at: 1 }, { expireAfterSeconds: 0 });
// Document: { ..., expire_at: new Date("2024-12-31T23:59:59Z") } — deleted at that exact time
```

**Use Cases:**

- **Session management**: Auto-expire login sessions
- **Cache invalidation**: Cached API responses with a TTL
- **Ephemeral data**: Temporary OTP codes, email verification tokens
- **Event logs**: Keep only the last 30 days of logs
- **Job queues**: Automatically clean up completed jobs

**Considerations:**

- The TTL thread runs every 60 seconds — document deletion may be delayed by up to 60 seconds after expiration
- Under heavy load, the background delete task may fall further behind
- TTL indexes must be on fields storing `Date` BSON type
- TTL index cannot be compound
- Deletion is one document at a time internally — can cause replication lag on replicas under heavy workload

**Monitoring:**

```javascript
db.sessions.getIndexes(); // Look for expireAfterSeconds in the index definition
```

---

### 23. What is MongoDB Atlas?

MongoDB Atlas is MongoDB's fully managed cloud database service (DBaaS). Rather than installing and managing MongoDB yourself, Atlas provisions, manages, scales, and monitors your cluster across AWS, GCP, or Azure.

**Key Features:**

- **Automated operations**: Backups, patching, scaling, failover — all managed
- **Multi-cloud & Multi-region**: Deploy across availability zones or multiple regions for HA/DR
- **Atlas Search**: Lucene-powered full-text search, deeply integrated with MongoDB (no separate Elasticsearch cluster needed)
- **Atlas Vector Search**: Store and query vector embeddings for AI/ML applications
- **Atlas Data Federation**: Query across S3, Atlas, and other data sources with a unified MongoDB query interface
- **Atlas Stream Processing**: Real-time data processing pipelines
- **Charts**: Built-in data visualization
- **App Services** (formerly Realm): Serverless functions, triggers, data sync for mobile/edge apps
- **Performance Advisor**: Automatic index suggestions based on query patterns

**Pricing:**

Atlas charges based on cluster tier (M0 free, M2/M5 shared, M10+ dedicated), storage, and data transfer. The M0 tier is free with limitations — useful for development.

**When to Use Atlas vs Self-Hosted:**

Use Atlas when: you want to minimize operational overhead, you're on a public cloud, you need Atlas-specific features (Atlas Search, Vector Search), or you don't have dedicated DBA resources.

Self-host when: you have strict data sovereignty requirements, you need to be on-premises, or you have specific hardware or configuration needs.

---

### 24. Common MongoDB performance optimization techniques?

**1. Index Optimization:**
- Create indexes that support your most frequent queries (use `.explain("executionStats")`)
- Remove unused indexes (`$indexStats` aggregation)
- Use compound indexes with ESR rule
- Consider covered queries to avoid document fetches

**2. Schema Design:**
- Embed data that is always queried together
- Avoid large arrays that grow without bound in documents
- Use the bucket pattern for time-series data
- Pre-compute and store aggregated values (computed pattern)

**3. Query Optimization:**
- Place `$match` and `$limit` early in aggregation pipelines
- Use projections to return only needed fields
- Avoid `$where` and JavaScript expressions (prevent index use)
- Use `$lookup` sparingly — it's MongoDB's JOIN; model to avoid it on hot paths

**4. Write Optimization:**
- Use bulk operations (`bulkWrite`) for multiple writes instead of individual operations
- Use ordered: false in bulk writes when order doesn't matter (faster — no serial dependency)
- Tune write concern appropriately for your durability needs

**5. Hardware/Config:**
- Ensure working set (indexes + hot data) fits in RAM
- Use SSDs for better IOPS
- Set `readConcern: "local"` for non-critical reads where stale reads are acceptable
- Configure appropriate `wiredTigerCacheSizeGB` (default: 50% of RAM - 1GB)

**6. Connection Management:**
- Use connection pooling (all official drivers do this by default)
- Size your pool to match concurrency requirements
- Use `maxPoolSize` carefully — too many connections wastes resources

---

### 25. How would you model a high-scale chat application in MongoDB?

A chat application has classic patterns: users, conversations, messages, and real-time delivery. At scale (millions of users, billions of messages), schema design is critical.

**Collections:**

**Users:**
```json
{ "_id": ObjectId, "username": "alice", "status": "online", "avatar_url": "..." }
```

**Conversations (Rooms/Channels):**
```json
{
  "_id": ObjectId,
  "type": "direct",  // or "group", "channel"
  "participants": [ObjectId("user1"), ObjectId("user2")],
  "last_message": { "text": "Hey!", "sender_id": ObjectId("user1"), "sent_at": ISODate },
  "last_activity": ISODate,
  "unread_counts": { "user1_id": 0, "user2_id": 3 }
}
```
Index: `{ participants: 1, last_activity: -1 }` — for listing a user's conversations sorted by recency.

**Messages (separate collection — unbounded):**
```json
{
  "_id": ObjectId,
  "conversation_id": ObjectId,
  "sender_id": ObjectId,
  "type": "text",  // or "image", "file", "reaction"
  "text": "Hey!",
  "sent_at": ISODate,
  "read_by": [ObjectId("user2")],
  "reactions": [{ "user_id": ObjectId, "emoji": "👍" }]
}
```
Indexes:
- `{ conversation_id: 1, sent_at: -1 }` — paginate messages in a conversation
- TTL on sent_at for message expiration if needed

**Key Design Decisions:**

- **Don't embed messages in conversations**: Messages are unbounded — embedding would violate the 16MB limit
- **Denormalize `last_message`** on conversations: Avoids fetching the latest message on every conversation list render
- **Bucket messages by day/week** for very high-volume channels: Group 100-1000 messages per bucket document to reduce index size and improve range scans

**Sharding Strategy:**

Shard messages by `conversation_id` (hashed) — keeps all messages for a conversation on the same shard for efficient range queries.

**Supplementary Systems:**

MongoDB handles durable storage. For real-time delivery at scale, pair with Redis Pub/Sub or a message broker (Kafka, NATS) for push notifications and presence tracking.

---

## DynamoDB (25 Questions)

---

### 1. What is DynamoDB?

Amazon DynamoDB is a fully managed, serverless, NoSQL key-value and document database provided by AWS. It offers single-digit millisecond latency at any scale, automatic scaling, and zero operational overhead.

**Key Characteristics:**

- **Fully managed**: No servers to provision, patch, or maintain
- **Serverless**: Scales automatically; you pay for what you use
- **Performance at scale**: Single-digit millisecond response times from 1 to 10 trillion+ operations/day
- **Highly available**: Data is replicated across 3 Availability Zones within a region; global tables for multi-region
- **Flexible schema**: Each item (row) can have different attributes
- **Event-driven**: DynamoDB Streams can trigger Lambda functions on changes

**DynamoDB is NOT:**

- Not a relational database — no JOINs, no complex queries, no SQL
- Not optimized for ad-hoc queries — you must design for your access patterns upfront
- Not ideal for small, low-traffic applications (RDS or DynamoDB On-Demand work, but the design complexity isn't worth it for simple use cases)

**Ideal Use Cases:**

- Session stores, user profiles, shopping carts (known key-based access)
- Leaderboards, counters, voting systems
- IoT device state and telemetry
- Mobile backends, gaming applications
- Any application needing predictable millisecond latency at massive scale

---

### 2. Difference between DynamoDB and relational databases?

**Data Model:**

Relational: Tables with fixed schemas (columns and types defined upfront). DynamoDB: Tables of items where each item can have different attributes. Only the primary key attributes are required and consistent.

**Query Flexibility:**

SQL databases allow arbitrary queries on any column using indexes, JOINs, and complex WHERE clauses. DynamoDB only efficiently queries by primary key or secondary indexes. Queries outside these patterns require expensive full-table Scans.

**Schema:**

Relational: Schema must be defined and migrated. DynamoDB: Schema-less (except for key attributes). Flexibility is greater but requires discipline.

**Scaling:**

Relational: Primarily vertical scaling; horizontal sharding is complex. DynamoDB: Natively designed for horizontal scaling — partitioned automatically across AWS infrastructure.

**Consistency:**

Relational: Strongly consistent reads by default, full ACID transactions. DynamoDB: Eventually consistent reads by default (stronger consistency available at extra cost); transactions added in 2018.

**Pricing Model:**

Relational (RDS): Pay for instances running 24/7 regardless of usage. DynamoDB: Pay per request (On-Demand) or provision capacity.

**Operational Overhead:**

Relational: Requires tuning, vacuuming, index maintenance, failover configuration. DynamoDB: Zero operational overhead — AWS manages everything.

---

### 3. Explain partition key and sort key

The primary key in DynamoDB uniquely identifies each item. It can be simple (partition key only) or composite (partition key + sort key).

**Partition Key (Hash Key):**

A single attribute that DynamoDB uses to determine which physical partition stores the item. DynamoDB hashes the partition key value and maps it to a partition. All items with the same partition key are stored together.

Partition key must be unique if you're using a simple primary key.

**Sort Key (Range Key):**

An optional second attribute used in a composite primary key. Items with the same partition key are stored together and sorted by sort key. This enables range queries within a partition.

**Composite Primary Key (Partition Key + Sort Key):**

The combination of partition key + sort key must be unique. This allows multiple items per partition key value, organized by sort key.

```
Table: OrderItems
PK: order_id       SK: item_id

order_id   | item_id      | product | qty
ORD-001    | ITEM-001     | Widget  | 2
ORD-001    | ITEM-002     | Gadget  | 1
ORD-002    | ITEM-001     | Widget  | 5
```

With this design, you can query all items for a specific order (`PK = ORD-001`) and get them in item_id order, or get a specific item (`PK = ORD-001, SK = ITEM-002`).

**Sort Key Range Queries:**

```javascript
// Get all items for order ORD-001
KeyConditionExpression: "order_id = :oid",
ExpressionAttributeValues: { ":oid": "ORD-001" }

// Get items with item_id starting with ITEM-0
KeyConditionExpression: "order_id = :oid AND begins_with(item_id, :prefix)",
```

---

### 4. What is a composite primary key?

A composite primary key is a primary key made up of two attributes: a **partition key** and a **sort key**. Together they uniquely identify each item in the table.

**How it Works:**

```
PK: user_id     SK: timestamp#type

user_id      | sk                          | event
user-001     | 2024-01-15T10:00:00#login   | { ... }
user-001     | 2024-01-15T14:30:00#purchase| { ... }
user-001     | 2024-01-16T09:00:00#login   | { ... }
user-002     | 2024-01-15T11:00:00#login   | { ... }
```

This design enables:
1. Fetch a specific event: `PK = user-001, SK = 2024-01-15T10:00:00#login`
2. Fetch all events for a user: `PK = user-001` (returns all items with this partition key, sorted by SK)
3. Fetch user's events in a date range: `PK = user-001 AND SK BETWEEN 2024-01-15 AND 2024-01-16`
4. Fetch a specific event type: `PK = user-001 AND SK begins_with 2024-01-15#login`

**Benefits:**

- Enables 1-to-many relationships within a single table
- Supports hierarchical data naturally
- Allows range queries within a partition
- Foundation for single-table design (see Q18)

**Constraints:**

- PK alone or PK + SK combination must be unique
- PK value cannot be queried as a range — only exact match
- SK supports: `=`, `<`, `<=`, `>`, `>=`, `BETWEEN`, `begins_with`
- SK does NOT support: `contains`, `ends_with`, or regex

---

### 5. How does DynamoDB distribute data internally?

DynamoDB uses consistent hashing to distribute data across partitions.

**Partitions:**

Data is stored in partitions — SSD-backed storage units managed by DynamoDB internally. Each partition can hold up to 10GB of data and can handle up to 3,000 Read Capacity Units (RCUs) or 1,000 Write Capacity Units (WCUs).

**Partition Allocation:**

DynamoDB allocates partitions based on:
- Storage: A new partition is created when data exceeds 10GB
- Throughput: New partitions are added to handle provisioned capacity

**Consistent Hashing:**

When you write an item, DynamoDB hashes the partition key value and maps it to a specific partition. The same partition key always maps to the same partition, ensuring items with the same partition key are co-located (important for sort key range queries).

**Internal Structure:**

Each partition is managed by a group of three DynamoDB nodes spread across Availability Zones (a storage node and two log replicas). Writes go to the storage node and two replicas; reads go to the storage node (strongly consistent) or any replica (eventually consistent).

**Why This Matters:**

The partition key becomes the unit of distribution and performance isolation. A partition can handle a fixed RCU/WCU limit. If all traffic is directed to one partition key, you're limited to that single partition's capacity — this is a hot partition (see Q6).

---

### 6. What causes hot partitions?

A hot partition occurs when a disproportionate amount of read or write traffic is directed to a single partition key, causing that partition to exceed its capacity limits. This results in throttling — requests being rejected with `ProvisionedThroughputExceededException`.

**Common Causes:**

**1. Low cardinality partition keys:**

Using a partition key with few distinct values means most items land in the same partitions. Example: `status` (active/inactive) or `date` (all today's writes go to today's partition).

**2. Popularity skew:**

Some items are inherently more popular. In a social media app, a celebrity's profile or post receives far more reads/writes than an average user's.

**3. Sequential/monotonic partition keys:**

If partition keys are timestamps or auto-incremented IDs, all new writes go to the same (latest) partition continuously. Classic example: using `Date.now()` as a partition key.

**4. Temporal access patterns:**

"Hot" recent data where all writes and reads target the current hour/day while older data is cold.

**Impact:**

- Throttled requests (400 errors requiring retry)
- Inconsistent latency (fast for cold partitions, slow/throttled for hot)
- Wasted capacity (cold partitions are underutilized while hot partitions are overloaded)

---

### 7. How would you avoid hot partitions?

**1. Choose High-Cardinality Partition Keys:**

Use keys with millions of distinct values so traffic is naturally spread. `user_id`, `device_id`, `session_id` are good candidates. Avoid `status`, `date`, `country` as standalone partition keys.

**2. Add Random Suffix (Write Sharding):**

For write-heavy scenarios with a naturally low-cardinality key, append a random number (1-N) to the partition key. Reads then query all N shards and merge.

```javascript
// Write: distribute across 10 virtual shards
const shard = Math.floor(Math.random() * 10);
const pk = `PRODUCT#${productId}#${shard}`;

// Read: query all shards and merge
const results = await Promise.all(
  Array.from({ length: 10 }, (_, i) => 
    ddb.query({ KeyConditionExpression: "pk = :pk", ExpressionAttributeValues: { ":pk": `PRODUCT#${productId}#${i}` } })
  )
);
```

**3. Time-based Sharding with Calculated Prefix:**

For time-series data, add a calculated shard prefix:

```javascript
const shardId = userId.hashCode() % 10; // User always goes to same shard, but spread across 10
const pk = `${shardId}#${timestamp}`;
```

**4. Use DynamoDB Adaptive Capacity:**

DynamoDB automatically re-distributes capacity to hot partitions within minutes. Not a substitute for good design, but provides a buffer.

**5. Use Caching:**

For extremely hot read items, cache in ElastiCache/DAX (DynamoDB Accelerator — in-memory cache for DynamoDB). DAX can handle millions of reads/second from cache, bypassing DynamoDB entirely.

**6. Use On-Demand Capacity Mode:**

On-Demand mode handles hot partitions better than Provisioned mode because DynamoDB instantly accommodates traffic spikes.

---

### 8. Difference between Scan and Query?

**Query:**

Retrieves items from a table or index using the primary key (or index key). Highly efficient.

```javascript
const result = await ddb.query({
  TableName: "Orders",
  KeyConditionExpression: "user_id = :uid AND created_at BETWEEN :start AND :end",
  ExpressionAttributeValues: {
    ":uid": "user-001",
    ":start": "2024-01-01",
    ":end": "2024-12-31"
  }
});
```

- Targets a specific partition (by partition key)
- Only reads items in that partition
- Can filter by sort key (range queries)
- Reads only the items needed
- Efficient regardless of table size

**Scan:**

Reads every item in the entire table or index, then optionally filters.

```javascript
const result = await ddb.scan({
  TableName: "Orders",
  FilterExpression: "amount > :amount",
  ExpressionAttributeValues: { ":amount": 100 }
});
```

- Reads ALL items across ALL partitions
- Filtering happens AFTER reading — you pay for all consumed read capacity even if items are filtered out
- Returns at most 1MB per call (requires pagination for large tables)
- Extremely expensive on large tables

**Key Insight:**

A `FilterExpression` on a `Scan` does NOT reduce read capacity consumed — it only filters the returned results. If you scan a 100GB table and filter it down to 10 records, you've still paid for 100GB of reads.

Always design your access patterns to use Query operations. If you find yourself needing Scans in production, it's a signal that you need a GSI or need to reconsider your data model.

---

### 9. Why is Scan expensive?

Scan is expensive for multiple reasons:

**1. Full Table Read:**

Every Scan reads every item in the table across all partitions. A 1TB table with 1 billion items requires reading all 1 billion items. Even with parallelism, this is slow and extremely costly.

**2. Capacity Consumption Before Filtering:**

DynamoDB charges for Read Capacity Units based on data read from storage — BEFORE any `FilterExpression` is applied. If you scan 1,000 items consuming 1,000 RCUs and your filter returns only 10 items, you've still consumed 1,000 RCUs.

**3. Pagination Overhead:**

A single Scan call returns at most 1MB of data. Large tables require many paginated calls, each consuming capacity. Managing pagination adds application complexity and latency.

**4. Parallel Scan Complexity:**

While DynamoDB supports parallel scans (splitting the table into segments processed concurrently), this still reads the entire table and requires careful coordination.

**5. Contention:**

On a table with active traffic, a large Scan consumes significant read capacity, potentially causing throttling for concurrent normal Query operations.

**When Scans Are Acceptable:**

- One-time data migrations or exports
- Small tables (< 1MB, fits in single call)
- Development/testing environments
- Scheduled batch jobs where latency and cost are acceptable

**Better Alternatives:**

- Design GSIs for additional query patterns
- Export to S3 and query with Athena for analytics
- Use DynamoDB Streams + Lambda for derived data
- Use ElasticSearch/OpenSearch for full-text search needs

---

### 10. What are GSIs and LSIs?

Secondary indexes allow you to query DynamoDB on attributes other than the primary key.

**LSI (Local Secondary Index):**

An alternative sort key for the same partition key. "Local" because it is scoped to a single partition.

- Must be defined at table creation time (cannot add later)
- Uses the same partition key as the base table
- Different sort key
- Shares the read/write capacity of the base table
- Supports strongly consistent reads (uses same partition)
- Maximum 5 LSIs per table

```javascript
// Table: UserActivity — PK: user_id, SK: timestamp
// LSI: user_id (same) + activity_type (different SK)
{
  IndexName: "ActivityTypeIndex",
  KeySchema: [
    { AttributeName: "user_id", KeyType: "HASH" },
    { AttributeName: "activity_type", KeyType: "RANGE" }
  ],
  Projection: { ProjectionType: "ALL" }
}
// Query: all activities of type 'purchase' for user-001
```

**GSI (Global Secondary Index):**

An entirely new partition key and optional sort key — "global" because it spans all partitions.

- Can be added or deleted at any time
- Different partition key than the base table
- Own separate read/write capacity
- Eventually consistent reads only
- Maximum 20 GSIs per table

```javascript
// Table: Orders — PK: order_id
// GSI: status (new PK) + created_at (new SK) — "status-date-index"
{
  IndexName: "StatusDateIndex",
  KeySchema: [
    { AttributeName: "status", KeyType: "HASH" },
    { AttributeName: "created_at", KeyType: "RANGE" }
  ]
}
// Query: all 'pending' orders sorted by created_at
```

---

### 11. Difference between GSI and LSI?

| Aspect | LSI | GSI |
|---|---|---|
| Partition key | Same as base table | Any attribute (different from base table) |
| Sort key | Different from base table | Optional; any attribute |
| Creation time | At table creation only | Anytime |
| Consistency | Strongly consistent reads supported | Eventually consistent only |
| Capacity | Shared with base table | Own provisioned/on-demand capacity |
| Limit | 5 per table | 20 per table |
| Storage | Included in table's partition | Separate, own storage |
| Data scope | One partition | Entire table |
| Hot partitions | Can inherit from base table | Can have its own |

**When to Use LSI:**

Use LSI when you need an alternative sort order within the same partition. Example: Query a user's orders (same user_id partition) sorted by status instead of by timestamp.

**When to Use GSI:**

Use GSI when you need to query on a completely different partition key. Example: Query all orders by status (regardless of which user placed them).

**Practical Advice:**

GSIs are far more commonly used than LSIs. Since GSIs can be created and deleted at any time (unlike LSIs), they're more flexible. Many DynamoDB practitioners recommend avoiding LSIs entirely and using GSIs exclusively unless you specifically need strongly consistent secondary index reads or you're certain at table creation time that you'll need an alternate sort key for the same partition.

---

### 12. What is eventual consistency?

Eventual consistency is a consistency model where a data store guarantees that, given no new updates to a piece of data, all reads will eventually return the last written value. There's no guarantee of when "eventually" is — it could be milliseconds.

**In DynamoDB:**

DynamoDB stores data in three AZ-replicated nodes. When you write an item, DynamoDB acknowledges the write after it's committed to a majority (2 of 3) of replicas. The third replica receives the update asynchronously.

An eventually consistent read may be served from any of the three replicas. If the third replica hasn't received the latest write yet, you might read stale data.

**Why Accept Eventual Consistency?**

- **Performance**: Eventually consistent reads are 50% cheaper (half the RCU cost) and faster (read from any replica, including the closest one)
- **Availability**: A consistent read requires coordinating with the leader; an eventually consistent read works even if one node is temporarily unavailable

**Is Stale Data a Problem?**

For many use cases, reading data that's milliseconds old is perfectly acceptable:
- A product catalog item's description being briefly stale: fine
- A user's profile picture: fine
- A bank account balance after a withdrawal: NOT fine — needs strong consistency

---

### 13. Difference between eventually consistent and strongly consistent reads?

**Eventually Consistent Reads (default):**

- Reads may be served from any replica (including ones that haven't received the latest write)
- May return data up to a few seconds old (in practice, usually <100ms behind)
- **Cost**: 0.5 RCU per 4KB
- **Performance**: Faster, higher availability
- **Use when**: Stale reads are acceptable (product listings, social feeds, leaderboards, most read-heavy queries)

```javascript
const result = await ddb.getItem({
  TableName: "Products",
  Key: { product_id: { S: "P001" } }
  // ConsistentRead defaults to false — eventually consistent
});
```

**Strongly Consistent Reads:**

- Reads are served from the partition leader (primary replica)
- Returns the most recent committed data — reflects all writes before the read
- **Cost**: 1 RCU per 4KB (2x the cost)
- **Performance**: Slightly higher latency (must go to leader)
- **Use when**: You must read your own writes, financial balances, inventory counts, or any data where staleness has consequences

```javascript
const result = await ddb.getItem({
  TableName: "Inventory",
  Key: { product_id: { S: "P001" } },
  ConsistentRead: true // Strongly consistent
});
```

**Note on GSIs:**

GSI reads are ALWAYS eventually consistent — you cannot request strongly consistent reads from a GSI. If you need strongly consistent reads, you must query the base table.

---

### 14. Explain DynamoDB transactions

DynamoDB transactions (added in 2018) allow you to group multiple read or write operations across multiple items and tables as an all-or-nothing atomic operation.

**Two Transaction APIs:**

**TransactWriteItems:**

Up to 100 write operations atomically. Supports Put, Update, Delete, and ConditionCheck.

```javascript
await ddb.transactWrite({
  TransactItems: [
    {
      Update: {
        TableName: "Accounts",
        Key: { account_id: { S: "sender" } },
        UpdateExpression: "SET balance = balance - :amount",
        ConditionExpression: "balance >= :amount", // Prevents overdraft
        ExpressionAttributeValues: { ":amount": { N: "100" } }
      }
    },
    {
      Update: {
        TableName: "Accounts",
        Key: { account_id: { S: "receiver" } },
        UpdateExpression: "SET balance = balance + :amount",
        ExpressionAttributeValues: { ":amount": { N: "100" } }
      }
    }
  ]
});
```

**TransactGetItems:**

Up to 100 read operations atomically — returns a consistent snapshot of all items at the same point in time.

**Capacity Cost:**

Transactional reads cost 2x regular reads (2 RCU per 4KB instead of 1). Transactional writes cost 2x regular writes (2 WCU per 1KB instead of 1). The overhead is for the underlying 2-phase commit coordination.

**Limitations:**

- 100 item limit per transaction
- Cannot span more than 25 distinct tables
- Transactions within a region only (not across global table regions)
- Higher latency than regular operations

---

### 15. What is DynamoDB Streams?

DynamoDB Streams is a time-ordered log of item-level changes in a DynamoDB table. Every insert, update, and delete creates a record in the stream, capturing the before and after state.

**Stream Record Contents (configurable):**

- `KEYS_ONLY`: Only the key attributes of the changed item
- `NEW_IMAGE`: The entire item after the change
- `OLD_IMAGE`: The entire item before the change
- `NEW_AND_OLD_IMAGES`: Both before and after states

**How It Works:**

Changes are written to a 24-hour rotating log split into shards (matching the table's partitions). AWS Lambda can be configured as a stream consumer — Lambda polls the stream and invokes your function with batches of change records.

**Enabling Streams:**

```javascript
await ddb.updateTable({
  TableName: "Orders",
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: "NEW_AND_OLD_IMAGES"
  }
});
```

**Guarantees:**

- Each item change appears exactly once in the stream
- Changes to the same item appear in the stream in order
- Changes are available within ~0ms-500ms of being committed

---

### 16. Use cases of DynamoDB Streams?

**1. Real-Time Aggregation:**

When an order is placed, trigger a Lambda to update aggregate counters (daily sales totals, inventory counts) in another table or in-memory cache.

**2. Cross-Region Replication (Global Tables Foundation):**

DynamoDB Global Tables use Streams internally to replicate changes across regions. You can implement custom cross-region replication the same way.

**3. Search Index Maintenance:**

When items change in DynamoDB, propagate changes to OpenSearch/ElasticSearch for full-text search capabilities that DynamoDB doesn't support natively.

**4. Cache Invalidation:**

When DynamoDB data changes, invalidate or update the corresponding entry in ElastiCache/Redis.

**5. Audit Logging:**

Capture `NEW_AND_OLD_IMAGES` and write change records to a data lake (S3 via Kinesis Firehose) for compliance and audit trails.

**6. Event-Driven Workflows:**

An order status changing from "pending" to "shipped" triggers a Lambda to send a shipping notification email.

**7. Derived Tables / Materialized Views:**

Build read-optimized projections of your data. When the source table changes, update a denormalized derived table optimized for a specific access pattern.

**8. Disaster Recovery:**

Stream all changes to a secondary account or region for additional protection beyond DynamoDB's built-in replication.

---

### 17. What is TTL in DynamoDB?

TTL (Time To Live) in DynamoDB is a feature that automatically deletes items from a table after a specified expiration time, without consuming write capacity.

**How It Works:**

1. You designate a specific attribute (must store Unix epoch timestamp in seconds) as the TTL attribute
2. DynamoDB's internal TTL service scans for expired items
3. Items past their expiration time are deleted — usually within 48 hours (typically within minutes, but no SLA guarantee)
4. Deletions appear in DynamoDB Streams as regular deletes (allowing downstream processing)

**Setup:**

```javascript
// Enable TTL on a table
await ddb.updateTimeToLive({
  TableName: "Sessions",
  TimeToLiveSpecification: {
    Enabled: true,
    AttributeName: "expires_at" // This attribute stores Unix timestamp
  }
});

// Write an item that expires in 1 hour
await ddb.putItem({
  TableName: "Sessions",
  Item: {
    session_id: { S: "sess-001" },
    user_id: { S: "user-001" },
    data: { S: "..." },
    expires_at: { N: String(Math.floor(Date.now() / 1000) + 3600) } // 1 hour from now
  }
});
```

**Key Points:**

- No WCU consumed for TTL deletions
- Items might be read/returned after expiration (until actually deleted) — filter on TTL attribute in queries if needed
- TTL deletions appear in DynamoDB Streams with a `userIdentity.type = "Service"` marker
- Not suitable for exact-second expiration — use for approximate cleanup

**Use Cases:** Session expiration, temporary tokens, cache entries, rate limit counters, event log rotation.

---

### 18. Explain single-table design

Single-table design is a DynamoDB data modeling pattern where all entities (Users, Orders, Products, etc.) are stored in a single DynamoDB table, using generic primary key attributes (`PK`, `SK`) that store different types of values depending on the item type.

**Why Single-Table Design?**

In relational databases, you normalize into many tables and use JOINs. DynamoDB JOINs (`$lookup`) are expensive. But DynamoDB's partition key model means all items with the same partition key are co-located on the same partition and can be retrieved in a single query.

Single-table design exploits this: by putting related entities under the same partition key, you can fetch a complex object graph in one request.

**Example:**

```
PK              | SK                    | Type   | Attributes
USER#alice      | USER#alice            | User   | name, email, created_at
USER#alice      | ORDER#2024-01-001     | Order  | total, status, items
USER#alice      | ORDER#2024-01-002     | Order  | total, status, items
USER#alice      | ADDRESS#home          | Addr   | street, city, zip
PRODUCT#P001    | PRODUCT#P001          | Product| name, price, category
ORDER#2024-01-001 | ITEM#1              | Item   | product_id, qty, price
ORDER#2024-01-001 | ITEM#2              | Item   | product_id, qty, price
```

**Fetching a User with All Orders (1 Query):**

```javascript
// One query fetches user + all orders
const result = await ddb.query({
  KeyConditionExpression: "PK = :pk",
  ExpressionAttributeValues: { ":pk": "USER#alice" }
});
// Returns: user profile + all orders for alice
```

This single query reads multiple entity types from the same partition — impossible in normalized multi-table design without multiple round trips.

---

### 19. Benefits of single-table design?

**1. Fewer Round Trips:**

The primary benefit. Fetch a user, their orders, and their addresses in a single DynamoDB Query instead of 3 separate GetItem/Query calls. Reduced latency, especially critical in Lambda functions (cold starts + multiple DB calls = slow).

**2. Cost Efficiency:**

Fewer requests = fewer RCU/WCU consumed. Also, one table is simpler and cheaper to manage than dozens.

**3. Natural DynamoDB Usage:**

DynamoDB is optimized for key-value lookups and range queries. Single-table design leverages this, rather than fighting against it.

**4. Better Performance Under Load:**

Traffic is spread across the entire table's partitions rather than concentrating on a small product table or user table.

**Challenges and Trade-offs:**

**Steep learning curve**: The mental model is very different from relational design. Requires careful upfront access pattern analysis.

**Less intuitive**: Debugging `PK = USER#alice, SK = ORDER#2024-01-001` is harder than querying a `orders` table.

**Less flexible for ad-hoc queries**: Adding a new access pattern after launch may require a new GSI or a full data migration.

**Team friction**: Developers familiar with SQL find it unintuitive. Requires discipline and documentation.

**When NOT to Use Single-Table:**

If your access patterns are simple, your team is SQL-native, or you're building an MVP — use multi-table design. Single-table is an optimization for high-scale, well-understood access patterns.

---

### 20. What are access patterns in DynamoDB?

Access patterns are the complete set of ways your application reads and writes data. In DynamoDB, you must identify ALL access patterns before designing your schema — unlike SQL where you can write arbitrary queries.

**Why Access Patterns First?**

DynamoDB doesn't support ad-hoc queries efficiently. Every query must use a primary key or secondary index. If you design your schema without knowing your access patterns, you'll end up needing expensive Scans for queries you didn't plan for.

**Documenting Access Patterns:**

Before modeling, list every query your application will make:

| # | Description | Key | Conditions | Sort | Frequency |
|---|---|---|---|---|---|
| 1 | Get user by ID | PK: USER#userId | | | Very high |
| 2 | Get user's orders | PK: USER#userId | SK begins_with ORDER# | By date | High |
| 3 | Get order details | PK: ORDER#orderId | SK: ORDER#orderId | | High |
| 4 | Get orders by status | GSI1 PK: STATUS#status | GSI1 SK: date | By date | Medium |
| 5 | Get product inventory | PK: PRODUCT#productId | | | Very high |

**Mapping Access Patterns to Keys:**

Each access pattern maps to either:
- Base table primary key (PK/SK)
- A GSI (with its own PK/SK)
- Overloaded sort keys (use SK prefix to differentiate entity types)

**The Discipline:**

Every time you identify a new access pattern after schema design, evaluate: Can an existing index serve it? If not, do you need a new GSI? If it's only needed occasionally, is a Scan acceptable?

This upfront planning discipline is the core skill in DynamoDB modeling.

---

### 21. How would you model many-to-many relationships?

Many-to-many (M:N) relationships in DynamoDB are handled with adjacency lists — a pattern where both directions of the relationship are stored as items in the same table.

**Example: Students and Courses**

```
PK              | SK              | Type       | Attributes
STUDENT#alice   | STUDENT#alice   | Student    | name, email
STUDENT#alice   | COURSE#math101  | Enrollment | enrolled_at, grade
STUDENT#alice   | COURSE#phys201  | Enrollment | enrolled_at
COURSE#math101  | COURSE#math101  | Course     | title, credits
COURSE#math101  | STUDENT#alice   | Enrollment | enrolled_at, grade
COURSE#math101  | STUDENT#bob     | Enrollment | enrolled_at
```

**Queries Supported:**

1. Get all courses for a student: `Query(PK=STUDENT#alice, SK begins_with COURSE#)`
2. Get all students in a course: `Query(PK=COURSE#math101, SK begins_with STUDENT#)`
3. Get a specific enrollment: `GetItem(PK=STUDENT#alice, SK=COURSE#math101)`

**The Two-Direction Pattern:**

Both directions of the relationship are stored as separate items. This is denormalization — the data is stored twice. DynamoDB transactions can ensure both directions stay in sync:

```javascript
await ddb.transactWrite({
  TransactItems: [
    { Put: { TableName: "T", Item: { PK: "STUDENT#alice", SK: "COURSE#math101", ...enrollmentData } } },
    { Put: { TableName: "T", Item: { PK: "COURSE#math101", SK: "STUDENT#alice", ...enrollmentData } } }
  ]
});
```

**With GSI for Different Access:**

Alternatively, use a GSI to flip partition and sort key, enabling reverse lookups without duplicating items.

---

### 22. Explain DynamoDB capacity modes

DynamoDB offers two capacity modes that control how you pay for and provision read/write throughput.

**Provisioned Capacity Mode:**

You specify the number of Read Capacity Units (RCUs) and Write Capacity Units (WCUs) your table can handle per second. You pay for provisioned capacity whether you use it or not.

- 1 RCU = 1 strongly consistent read/sec or 2 eventually consistent reads/sec for items up to 4KB
- 1 WCU = 1 write/sec for items up to 1KB

```javascript
{
  ProvisionedThroughput: {
    ReadCapacityUnits: 100,
    WriteCapacityUnits: 50
  }
}
```

Auto-scaling can adjust provisioned capacity automatically based on utilization targets (e.g., maintain 70% utilization), but still has limits and can be slow to react to sudden spikes.

**On-Demand Capacity Mode:**

DynamoDB automatically scales to handle any request volume — you pay per request rather than for provisioned capacity.

- Pay per RRU (Read Request Unit) and WRU (Write Request Unit)
- Instant scaling, no capacity planning
- More expensive per request than provisioned capacity at consistent high load
- Ideal for unpredictable traffic, new tables, development

**Switching Between Modes:**

You can switch between modes, but only once every 24 hours.

**Cost Comparison Rule of Thumb:**

On-Demand costs roughly 6-7x more per request than Provisioned at full utilization. If your traffic is consistent and predictable, Provisioned + Auto-Scaling is significantly cheaper. If traffic is spiky or unpredictable, On-Demand provides insurance against over-provisioning.

---

### 23. On-demand vs provisioned capacity?

| Aspect | Provisioned | On-Demand |
|---|---|---|
| Cost model | Per RCU/WCU per hour | Per request (RRU/WRU) |
| Scaling | Manual or auto-scaling | Automatic, instant |
| Traffic type | Predictable, steady | Unpredictable, spiky |
| Throttling risk | Yes, if traffic exceeds provision | Minimal (built-in burst capacity) |
| Cost efficiency | High (if predictable) | Lower at sustained high load |
| Warmup | Tables have "previous peak" memory | None needed |
| Pricing | ~$0.00013/RCU/hr, ~$0.00065/WCU/hr | ~$0.25/million reads, ~$1.25/million writes |

**Choose Provisioned When:**

- Traffic is predictable (daily/weekly patterns)
- Cost optimization is critical (steady-state workloads)
- You can accurately forecast capacity needs
- Large, mature production applications

**Choose On-Demand When:**

- New table with unknown traffic patterns
- Highly variable or spiky traffic (flash sales, viral content)
- Development/test environments where traffic is intermittent
- You want zero capacity management overhead
- Table is mostly idle with occasional bursts

**Hybrid Pattern:**

Many teams use On-Demand for new features and switch to Provisioned + Auto-Scaling once traffic patterns become predictable — typically after 1-3 months of production data.

---

### 24. What is adaptive capacity?

Adaptive capacity is a DynamoDB feature that automatically redistributes available throughput capacity to hot partitions in real time, reducing throttling caused by uneven traffic distribution.

**The Problem It Solves:**

DynamoDB partitions have per-partition throughput limits. Even if a table has plenty of total provisioned capacity, if traffic concentrates on one partition (a hot partition), that specific partition throttles.

**How Adaptive Capacity Works:**

1. DynamoDB monitors traffic to individual partitions continuously
2. When a partition receives more traffic than its allocated share, adaptive capacity automatically boosts that partition's throughput
3. The boost is funded by borrowing from underutilized partitions — the total table capacity isn't increased, just redistributed

**Limits:**

Adaptive capacity can boost a partition up to its maximum physical capacity (3,000 RCUs and 1,000 WCUs per partition). It cannot overcome the hard limits of a single physical partition. Also, it may take a few minutes to kick in for sudden spikes.

**Isolated Partition Management (2019):**

AWS enhanced adaptive capacity with "isolated partition management" — DynamoDB can now scale individual hot partitions to accommodate sustained workloads, even splitting hot partitions to spread their load.

**Important Nuance:**

Adaptive capacity is a safety net, not a substitute for good partition key design. Don't design for hot partitions and rely on adaptive capacity to save you. It helps with unavoidable patterns (celebrity items, sudden viral spikes) but isn't guaranteed to eliminate throttling.

---

### 25. Common DynamoDB throttling issues and fixes?

**Throttling Symptoms:**

`ProvisionedThroughputExceededException` (provisioned mode) or being limited by the burst pool (on-demand mode). DynamoDB returns 400 errors requiring retry.

**Common Causes and Fixes:**

**Hot Partitions (most common):**

Cause: Traffic concentrated on few partition keys.
Fix: Improve partition key cardinality, add random suffix for write sharding, use caching (DAX) for hot reads.

**Insufficient Provisioned Capacity:**

Cause: Traffic exceeds provisioned RCUs/WCUs.
Fix: Increase provisioned capacity, enable/tune auto-scaling, or switch to On-Demand.

**Burst Limit Exhausted:**

Cause: Short traffic spikes exceed burst bucket (DynamoDB maintains a 5-minute burst reserve of unused capacity).
Fix: Smooth traffic with SQS queue + DLQ; ensure steady-state capacity is close to peak needs.

**Costly Operations:**

Cause: Large items (items > 4KB consume multiple WCUs/RCUs), large `$in` queries, Scans.
Fix: Break large items into smaller ones, optimize queries to use GSIs, avoid Scans.

**Global Table Replication:**

Cause: Global table writes consume WCUs in both the source and destination regions.
Fix: Account for replication WCUs when provisioning global tables (multiply WCU needs by number of replica regions).

**Retry Best Practices:**

Always implement exponential backoff with jitter for `ProvisionedThroughputExceededException`. AWS SDKs do this automatically with default retry configuration, but ensure retry limits and timeouts are appropriate for your latency requirements.

```javascript
// AWS SDK v3 default retry configuration
const client = new DynamoDBClient({
  maxAttempts: 3,  // Total attempts (1 original + 2 retries)
  retryMode: "adaptive"  // Adaptive retry — adjusts based on throttling signals
});
```

---

## OpenSearch / Elasticsearch (20 Questions)

---

### 1. What is OpenSearch?

OpenSearch is an open-source, distributed search and analytics engine derived from Elasticsearch 7.10. It was forked by AWS in 2021 after Elasticsearch changed its license from Apache 2.0 to a more restrictive source-available license (SSPL).

**History:**

Elasticsearch was originally open-source (Apache 2.0). In January 2021, Elastic NV relicensed Elasticsearch and Kibana under SSPL (Server Side Public License) to prevent cloud providers from offering managed Elasticsearch services. AWS, which offered Amazon Elasticsearch Service, forked the last Apache 2.0 version (7.10) and created OpenSearch (with OpenSearch Dashboards replacing Kibana).

**What OpenSearch Provides:**

- **Full-text search**: Inverted index-based search with relevance ranking
- **Log analytics**: Ingest, store, and analyze large volumes of log data (common in DevOps/SIEM)
- **Real-time analytics**: Aggregations, dashboards (via OpenSearch Dashboards)
- **Vector search**: k-NN (k-Nearest Neighbor) search for AI/ML applications
- **Geospatial search**: Bounding box, radius, polygon queries
- **Security analytics**: Built-in security features, anomaly detection

**OpenSearch vs Elasticsearch:**

Both are largely API-compatible for common operations. OpenSearch has diverged on features like advanced security, ML features, and vector search. Elasticsearch has continued to develop under its new license with features unavailable in OpenSearch.

**Amazon OpenSearch Service:**

AWS's managed OpenSearch (and legacy Elasticsearch) service. Handles provisioning, patching, scaling, backups, and monitoring.

---

### 2. Difference between OpenSearch and traditional databases?

**Purpose:**

Traditional databases (PostgreSQL, MySQL) are designed for OLTP — storing, retrieving, and updating structured records with ACID guarantees. OpenSearch is a search and analytics engine designed for full-text search, log analysis, and read-heavy analytical queries.

**Data Model:**

Traditional DB: Tables with rows, fixed schemas, strong relationships. OpenSearch: Indexes of JSON documents with flexible schemas. Documents can have nested objects and arrays. No strict schema by default (dynamic mapping).

**Query Model:**

Traditional DB: SQL — structured, relational, JOIN-capable. OpenSearch: JSON-based query DSL — powerful for text search and analytics, but no JOINs between indexes, no ACID transactions, no foreign keys.

**Write Operations:**

Traditional DB: Single-row writes are fast, transactional. OpenSearch: Writes are more expensive — documents must be analyzed, tokenized, and added to inverted indexes. Bulk indexing is strongly recommended.

**Consistency:**

Traditional DB: Strongly consistent (ACID). OpenSearch: Eventually consistent — indexed documents become searchable after a `refresh` (default every 1 second). No multi-document transactions.

**Durability:**

Traditional DB: Full ACID durability, WAL. OpenSearch: Writes are durably stored in translog before being indexed, but no multi-document transactions.

**Best Together:**

The two are complementary, not mutually exclusive. Store canonical data in PostgreSQL/DynamoDB; sync changes to OpenSearch for search and analytics.

---

### 3. Explain inverted indexes

An inverted index is the core data structure that makes full-text search fast. It maps terms (words) to the documents that contain them — the inverse of a forward index (document → terms).

**Forward Index vs Inverted Index:**

```
Forward index:                    Inverted index:
Doc1 → [database, query, fast]    database → [Doc1, Doc2, Doc3]
Doc2 → [database, index, search]  query    → [Doc1, Doc4]
Doc3 → [database, analytics]      fast     → [Doc1, Doc4]
Doc4 → [query, fast, result]      index    → [Doc2, Doc5]
```

When searching for "database AND query", OpenSearch looks up both terms in the inverted index, finds their document lists, and intersects them: documents containing both terms.

**What's Stored in the Inverted Index:**

For each term, OpenSearch stores:
- **Document IDs**: Which documents contain the term
- **Term frequency (TF)**: How often the term appears in each document (for relevance scoring)
- **Positions**: Where in the document each occurrence appears (for phrase queries like "quick brown fox")
- **Offsets**: Character offsets for highlighting matched text

**Analysis Before Indexing:**

Before terms enter the inverted index, they're processed by an analyzer:
1. **Character filters**: Strip HTML, replace characters
2. **Tokenizer**: Split text into tokens (words). "Hello World" → ["Hello", "World"]
3. **Token filters**: Lowercase, remove stop words, stemming. "Running" → "run"

The same analysis is applied to query strings, so "RUNNING" matches documents containing "running".

---

### 4. What are shards and replicas?

**Shards:**

An OpenSearch index is divided into shards — horizontal slices of the index's data. Each shard is a complete Lucene index on its own. Sharding enables:
- Storing more data than fits on a single node
- Parallel search — each shard can be searched simultaneously
- Distribution of indexing load

When you create an index, you specify the number of primary shards (default: 1 in OpenSearch, was 5 in older Elasticsearch). This is **fixed at index creation** and cannot be changed without reindexing.

```javascript
// Create index with 3 primary shards
PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}
```

**Replicas:**

Each primary shard can have one or more replica shards — copies of the primary shard stored on different nodes.

Replicas provide:
- **High availability**: If a node fails, replica shards on other nodes serve the data
- **Read scalability**: Replica shards handle search requests, increasing throughput
- **Zero-downtime node loss**: Replicas are promoted to primary if the primary's node fails

Replicas (unlike primary shards) can be changed at any time.

---

### 5. Primary shard vs replica shard?

**Primary Shard:**

- The authoritative copy of a shard's data
- All write operations go to the primary shard first
- After writing, the primary replicates to all replica shards
- Number is fixed at index creation
- Each primary shard is assigned to exactly one node at a time

**Replica Shard:**

- An exact copy of a primary shard
- Can serve search requests (read load balancing)
- Promoted to primary automatically if the primary shard's node fails
- Can be on any node except the same node as its primary (for redundancy)
- Number can be changed dynamically

**Important Rule:**

A replica shard is NEVER placed on the same node as its primary shard. This ensures that a single node failure doesn't lose both copies of the data. This means a single-node cluster cannot have replicas (they'd stay in "unassigned" state) — use 0 replicas for single-node development setups.

**Cluster Health Colors:**

- **Green**: All primary AND replica shards are allocated
- **Yellow**: All primary shards allocated, but some replicas are unassigned (data is safe but not fully redundant)
- **Red**: Some primary shards unassigned (data for those shards is unavailable)

---

### 6. How does distributed search work?

When a search request hits OpenSearch, it goes through a two-phase process: scatter (broadcast to shards) and gather (collect and merge results).

**Phase 1: Query Phase (Scatter)**

1. The client request hits any node, which becomes the **coordinating node**
2. The coordinating node broadcasts the query to all primary or replica shards
3. Each shard executes the query locally against its Lucene index
4. Each shard returns the top-N document IDs and their relevance scores (not full documents yet)

**Phase 2: Fetch Phase (Gather)**

5. The coordinating node merges results from all shards, sorts by score, and determines the final top-N results
6. The coordinating node fetches the full documents for just those top-N results from the relevant shards
7. The coordinating node assembles the final response and returns it to the client

**Why Two Phases?**

If shards returned full documents in phase 1, the coordinating node would receive N_shards × page_size full documents and then discard most of them. By returning only IDs and scores in phase 1, the data transfer is minimized.

**Deep Pagination Problem:**

For `from: 900, size: 10` (page 91 of 10 results), each shard must return its top 910 results, the coordinating node receives shards × 910 results, sorts them globally, and returns 10. This gets very expensive at high page numbers. Use `search_after` or `scroll` for deep pagination.

---

### 7. What is indexing in OpenSearch?

"Indexing" in OpenSearch refers to both the noun (an index = a data store) and the verb (the process of adding documents to an index so they become searchable).

**Index (Noun):**

An index is a logical namespace containing related documents, similar to a database table. Each index has its own settings (shards, replicas), mappings (field types), and data.

```javascript
// Index names are lowercase
PUT /products        // Create index
GET /products        // Get index info
DELETE /products     // Delete index
```

**Indexing a Document (Verb):**

```javascript
// Index a document (auto-generate ID)
POST /products/_doc
{
  "name": "Widget Pro",
  "price": 29.99,
  "description": "The best widget for your needs",
  "tags": ["sale", "electronics"],
  "in_stock": true
}

// Index with specific ID
PUT /products/_doc/P001
{ "name": "Widget Pro", ... }

// Bulk indexing (much more efficient for many documents)
POST /_bulk
{ "index": { "_index": "products", "_id": "P001" } }
{ "name": "Widget Pro", "price": 29.99 }
{ "index": { "_index": "products", "_id": "P002" } }
{ "name": "Gadget", "price": 49.99 }
```

**The Indexing Pipeline:**

When a document is indexed:
1. Routing — determine which shard receives the document (based on `_id` hash by default)
2. Analysis — run text fields through the analyzer (tokenize, lowercase, stem)
3. Write to translog — for durability before the in-memory index is flushed
4. Add to in-memory Lucene buffer — not yet searchable
5. Refresh — flush in-memory buffer to a new Lucene segment (default every 1 second) — document becomes searchable
6. Merge — background process merges small Lucene segments into larger ones

---

### 8. Explain analyzers and tokenizers

Analyzers control how text is converted into searchable tokens at index time and at query time. They are central to OpenSearch's text search capability.

**Analyzer Components:**

An analyzer is a pipeline of three components:
1. **Character filters** (0 or more): Transform the raw text before tokenizing. Examples: strip HTML tags (`html_strip`), replace characters.
2. **Tokenizer** (exactly 1): Split the text into individual tokens. The most important component.
3. **Token filters** (0 or more): Transform the tokens. Examples: lowercase, stop words, stemming, synonyms.

**Built-in Analyzers:**

`standard` (default): Tokenizes on word boundaries, lowercases tokens, removes most punctuation.
"Hello, World! OpenSearch is GREAT" → ["hello", "world", "opensearch", "is", "great"]

`english`: Standard + English stop words removal ("is", "the", "a") + Porter stemming ("running" → "run").
"The quick brown foxes are running" → ["quick", "brown", "fox", "run"]

`whitespace`: Splits only on whitespace, no other processing.

`keyword`: Treats the entire field value as one token. Used for exact-match fields.

**Tokenizers:**

- `standard`: Smart unicode text segmentation (handles many languages)
- `whitespace`: Split on whitespace only
- `ngram`: Generate n-grams from text (for partial matching, autocomplete)
- `edge_ngram`: Generate n-grams from the start of tokens (for prefix autocomplete)
- `pattern`: Split on regex pattern
- `path_hierarchy`: For file paths ("/a/b/c" → ["/a", "/a/b", "/a/b/c"])

**Custom Analyzer Example:**

```javascript
PUT /products
{
  "settings": {
    "analysis": {
      "analyzer": {
        "product_search": {
          "type": "custom",
          "char_filter": ["html_strip"],
          "tokenizer": "standard",
          "filter": ["lowercase", "stop", "english_stemmer"]
        }
      },
      "filter": {
        "english_stemmer": { "type": "stemmer", "language": "english" }
      }
    }
  }
}
```

---

### 9. Difference between text and keyword fields?

These are the two primary string field types in OpenSearch, and choosing the right one (or using both) is critical for search behavior.

**text Field:**

Designed for full-text search. The value is analyzed — run through the analyzer pipeline, tokenized, and stored in the inverted index as individual tokens.

- Supports full-text search (`match`, `match_phrase` queries)
- Cannot be used for exact-value filtering, sorting, or aggregations (the tokens are different from the original value)
- Supports relevance scoring

```javascript
// Mapping
{ "description": { "type": "text", "analyzer": "english" } }

// At index time: "The Quick Brown Fox" → ["quick", "brown", "fox"]
// Query: match("description", "Quick") → matches (case-insensitive, stemmed)
```

**keyword Field:**

Stores the value as-is (not analyzed). Used for exact-value matching, filtering, sorting, and aggregations.

- Supports `term`, `terms`, `range` queries (exact match)
- Supports sorting and aggregations
- Does NOT support full-text search (e.g., `"Quick Brown"` keyword won't match a document with `"Quick brown fox"`)

```javascript
// Mapping
{ "status": { "type": "keyword" } }
{ "sku": { "type": "keyword" } }

// Query: term("status", "active") → exact match only
// Aggregation: terms aggregation to count by status
```

**Multi-field Mapping (text + keyword):**

Often you need both — full-text search AND exact matching/aggregation on the same field:

```javascript
{
  "product_name": {
    "type": "text",
    "analyzer": "english",
    "fields": {
      "keyword": { "type": "keyword" }  // Access as "product_name.keyword"
    }
  }
}
// Full-text search: match("product_name", "widget pro")
// Exact match: term("product_name.keyword", "Widget Pro")
// Aggregation: terms aggregation on "product_name.keyword"
```

---

### 10. What is relevance scoring?

Relevance scoring is OpenSearch's mechanism for ranking search results by how well they match the query. By default, results are ordered by `_score` — a floating-point score calculated by the scoring algorithm.

**What Affects Relevance:**

1. **Term Frequency (TF)**: How many times does the search term appear in the document? More occurrences = higher score.

2. **Inverse Document Frequency (IDF)**: How rare is the term across all documents in the index? Rare terms are more distinctive and weighted higher. Common terms like "the" get low IDF weight.

3. **Field length norm**: Shorter fields are scored higher. "database" in a 2-word title is more significant than "database" in a 1000-word body.

4. **Boost**: Fields or queries can be boosted to weight them more heavily.

**Viewing Scores:**

```javascript
GET /products/_search
{
  "query": { "match": { "name": "widget" } },
  "explain": true  // Shows detailed score calculation
}
```

**Customizing Relevance:**

- **Boosting fields**: `"title^3"` in multi_match to weight title 3x higher than body
- **Function score**: Incorporate custom signals (popularity, recency, geo distance) into the score
- **Script score**: Fully custom scoring with Painless script

```javascript
{
  "query": {
    "function_score": {
      "query": { "match": { "name": "widget" } },
      "functions": [
        { "field_value_factor": { "field": "popularity", "modifier": "log1p" } }
      ]
    }
  }
}
```

---

### 11. Explain BM25 algorithm basics

BM25 (Best Match 25) is the default relevance scoring algorithm in modern OpenSearch/Elasticsearch (replaced TF-IDF as default in Elasticsearch 5.0). BM stands for "Best Match" and 25 is the 25th iteration in the family.

**The Formula:**

```
score(D, Q) = Σ IDF(qi) × (TF(qi,D) × (k1 + 1)) / (TF(qi,D) + k1 × (1 - b + b × |D|/avgdl))
```

**Components:**

**IDF (Inverse Document Frequency):**

```
IDF(q) = log(1 + (N - n(q) + 0.5) / (n(q) + 0.5))
```

Where N = total documents, n(q) = documents containing term q.

Common terms get low IDF (they're in many documents and thus less distinctive). Rare terms get high IDF.

**Term Frequency Saturation (k1 parameter, default 1.2):**

Unlike raw TF-IDF where score increases linearly with term frequency, BM25 saturates TF. Having a term 100 times doesn't score 100x better than having it 10 times. The k1 parameter controls how quickly TF saturates (higher = slower saturation).

**Field Length Normalization (b parameter, default 0.75):**

Accounts for document length. A term appearing in a 10-word document is more significant than the same term in a 10,000-word document. `b = 1.0` = full normalization; `b = 0` = no normalization. `avgdl` is the average document length.

**Tuning BM25:**

```javascript
PUT /products
{
  "settings": {
    "similarity": {
      "custom_bm25": {
        "type": "BM25",
        "k1": 1.5,   // Higher = more TF influence
        "b": 0.5     // Lower = less length normalization
      }
    }
  }
}
```

---

### 12. What are aggregations in OpenSearch?

Aggregations are OpenSearch's analytics framework — the equivalent of SQL's GROUP BY, COUNT, SUM, AVG, and window functions. They allow you to extract statistics and summaries from your data.

**Types of Aggregations:**

**Metric Aggregations:** Compute a single value from a set of documents.

```javascript
{
  "aggs": {
    "avg_price": { "avg": { "field": "price" } },
    "total_revenue": { "sum": { "field": "revenue" } },
    "price_stats": { "stats": { "field": "price" } },  // min, max, avg, sum, count
    "price_percentiles": { "percentiles": { "field": "price", "percents": [50, 95, 99] } },
    "unique_customers": { "cardinality": { "field": "customer_id" } }  // approximate count distinct
  }
}
```

**Bucket Aggregations:** Group documents into buckets.

```javascript
{
  "aggs": {
    "by_category": { "terms": { "field": "category.keyword", "size": 10 } },
    "by_date": { "date_histogram": { "field": "created_at", "calendar_interval": "month" } },
    "price_ranges": { "range": { "field": "price", "ranges": [{"to": 10}, {"from": 10, "to": 50}, {"from": 50}] } },
    "geo_grid": { "geohash_grid": { "field": "location", "precision": 5 } }
  }
}
```

**Pipeline Aggregations:** Compute from other aggregations (like window functions).

```javascript
{
  "aggs": {
    "monthly_revenue": { "date_histogram": { ... },
      "aggs": {
        "revenue": { "sum": { "field": "amount" } }
      }
    },
    "moving_avg": { "moving_fn": { "buckets_path": "monthly_revenue>revenue", "window": 3, "script": "MovingFunctions.unweightedAvg(values)" } }
  }
}
```

**Nested Aggregations:**

Aggregations can be nested — a bucket aggregation with metric sub-aggregations gives GROUP BY with metrics:

```javascript
// Revenue by category
{
  "aggs": {
    "by_category": {
      "terms": { "field": "category.keyword" },
      "aggs": {
        "total_revenue": { "sum": { "field": "price" } },
        "avg_price": { "avg": { "field": "price" } }
      }
    }
  }
}
```

---

### 13. Terms aggregation vs metric aggregation?

**Terms Aggregation:**

A bucket aggregation that groups documents by the unique values of a field — directly analogous to SQL's `GROUP BY`. Returns the top-N unique values by document count (or by a custom metric).

```javascript
// Equivalent to: SELECT category, COUNT(*) FROM products GROUP BY category LIMIT 10
{
  "aggs": {
    "by_category": {
      "terms": {
        "field": "category.keyword",
        "size": 10,
        "order": { "_count": "desc" } // Or order by a sub-aggregation
      }
    }
  }
}
```

Response:
```json
{
  "by_category": {
    "buckets": [
      { "key": "Electronics", "doc_count": 4523 },
      { "key": "Clothing", "doc_count": 3210 },
      ...
    ]
  }
}
```

**Important Caveat:** Terms aggregation is approximate on multi-shard indexes. Each shard returns its top-N, and they're merged — values that are in the top-10 globally but not top-10 on any individual shard may be missed. Increase `shard_size` (how many each shard returns before merging) for more accuracy at the cost of performance.

**Metric Aggregations:**

Compute scalar metrics from the documents in each bucket (or the entire document set). Examples: `avg`, `sum`, `min`, `max`, `cardinality` (distinct count), `percentiles`, `stats`.

```javascript
// Equivalent to: SELECT AVG(price), SUM(revenue), COUNT(DISTINCT user_id) FROM orders WHERE ...
{
  "aggs": {
    "avg_order_value": { "avg": { "field": "total" } },
    "total_revenue": { "sum": { "field": "total" } },
    "unique_buyers": { "cardinality": { "field": "user_id" } }
  }
}
```

**Combined (the powerful pattern):**

```javascript
// Revenue and unique buyers per category
{
  "aggs": {
    "by_category": {
      "terms": { "field": "category.keyword", "size": 10 },
      "aggs": {
        "revenue": { "sum": { "field": "total" } },
        "unique_buyers": { "cardinality": { "field": "user_id" } }
      }
    }
  }
}
```

---

### 14. What is a mapping?

A mapping defines how documents and their fields are stored and indexed — similar to a schema definition in a relational database. Mappings specify field types, analyzer configurations, and indexing options.

**Key Field Types:**

- `text`: Full-text search (analyzed)
- `keyword`: Exact-value string
- `integer`, `long`, `double`, `float`: Numeric types
- `boolean`
- `date`: Date/datetime with configurable format
- `object`: Nested JSON object
- `nested`: Array of objects with independent field scoping
- `geo_point`, `geo_shape`: Geographic coordinates
- `dense_vector`: For k-NN vector search

**Defining a Mapping:**

```javascript
PUT /products
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "english",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "price": { "type": "float" },
      "category": { "type": "keyword" },
      "created_at": { "type": "date", "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis" },
      "location": { "type": "geo_point" },
      "attributes": {
        "type": "nested",
        "properties": {
          "key": { "type": "keyword" },
          "value": { "type": "keyword" }
        }
      }
    }
  }
}
```

**Mapping Updates:**

You can add new fields to a mapping at any time. However, you CANNOT change the type of an existing field (e.g., keyword to text) — that requires reindexing into a new index.

---

### 15. Dynamic mapping vs explicit mapping?

**Dynamic Mapping:**

OpenSearch automatically detects and maps new fields when documents are indexed. This is the default behavior.

```javascript
// No mapping defined — OpenSearch infers types
POST /products/_doc
{
  "name": "Widget",          // → text + keyword (sub-field)
  "price": 29.99,            // → float
  "created_at": "2024-01-15", // → date (if matches date detection patterns)
  "in_stock": true           // → boolean
}
```

**Dynamic Mapping Rules:**

| JSON Type | Dynamic Type |
|---|---|
| String | `text` with `keyword` sub-field (if < 256 chars) |
| Number (integer) | `long` |
| Number (float) | `float` |
| Boolean | `boolean` |
| Object | `object` |
| Array | Depends on first element's type |

**Problems with Dynamic Mapping:**

- Mapping explosion: If you index logs with arbitrary field names, you can end up with thousands of fields
- Wrong types: "2024-01-15" may be detected as a date when you just wanted it as a string
- Unexpected `text` fields where you wanted `keyword` for aggregations

**Explicit Mapping:**

You define the mapping before indexing. Best for production.

**Hybrid Approach (Recommended):**

Use `dynamic: "strict"` in production to reject unknown fields, while defining all known fields explicitly:

```javascript
PUT /logs
{
  "mappings": {
    "dynamic": "strict",  // "true"=allow, "false"=ignore, "strict"=reject
    "properties": {
      "level": { "type": "keyword" },
      "message": { "type": "text" },
      "timestamp": { "type": "date" }
    }
  }
}
```

---

### 16. Common causes of slow searches?

**1. Too Many Shards:**

Each shard requires CPU for query execution. If you have 100 shards with 1MB of data each, the overhead of coordinating across 100 shards exceeds the benefit. Rule of thumb: aim for 10-50GB per shard.

**2. Wildcard and Regex Queries:**

`wildcard: { "name": "*widget*" }` or `regexp` queries must scan every term in the inverted index — essentially a full-text scan. `leading wildcards` (`*widget`) are especially expensive (can't use index).

**3. Expensive Aggregations:**

High-cardinality `terms` aggregations (GROUP BY on user_id with millions of unique users) with large `size` and `shard_size` consume massive memory.

**4. Heap Memory Pressure / GC Pauses:**

OpenSearch runs on JVM. If heap is close to full, garbage collection pauses can cause search latency spikes. Monitor heap usage and JVM GC metrics.

**5. Field Data / Sorting Issues:**

Sorting on `text` fields requires loading all field values into memory (fielddata). Use `keyword` fields for sorting and aggregations instead.

**6. Large Result Sets:**

`size: 10000` forces each shard to collect and score 10,000 documents, then coordinate merging them. Use pagination techniques like `search_after` or consider whether you really need that many results.

**7. Unoptimized Queries:**

Expensive queries (large `bool` queries with many `should` clauses, large `terms` filters with thousands of values) or missing filters (not using `filter` context, which is cacheable).

**8. Disk I/O:**

Index files not in OS page cache (after node restart or for cold data). Consider index lifecycle management to move cold data to cheaper, slower storage.

---

### 17. How would you optimize OpenSearch queries?

**1. Use Filter Context for Non-Scoring Conditions:**

Filters are cached and don't affect relevance scores — much faster than query context for binary conditions.

```javascript
// Bad: "must" scores everything
{ "query": { "bool": { "must": [
  { "match": { "title": "opensearch" } },
  { "term": { "status": "active" } }  // Doesn't need scoring
]}}}

// Good: filter for non-scoring conditions
{ "query": { "bool": {
  "must": [{ "match": { "title": "opensearch" } }],   // Needs scoring
  "filter": [{ "term": { "status": "active" } }]       // Cacheable, fast
}}}
```

**2. Avoid Wildcard/Script Queries on Hot Paths:**

Replace `wildcard: { "name": "*widget*" }` with a full-text `match` query. For partial prefix matching, use `edge_ngram` tokenizer at index time.

**3. Use Source Filtering:**

Return only the fields you need:
```javascript
{ "_source": ["name", "price", "category"], "query": { ... } }
```

**4. Increase Shard Size, Decrease Shard Count:**

Too many small shards is worse than fewer larger shards. Consolidate during index lifecycle or use the ILM rollover strategy with appropriate shard sizing.

**5. Optimize Aggregations:**

- Use `execution_hint: "map"` vs `"global_ordinals"` depending on cardinality
- Pre-aggregate into summary indexes for dashboards
- Limit `shard_size` carefully (accuracy vs performance trade-off)
- Use `sampler` aggregation for approximate results on large datasets

**6. Use Index Lifecycle Management (ILM):**

Keep hot (recent, frequently searched) data on fast SSD-backed nodes and move cold (old) data to cheaper warm/cold nodes.

**7. Caching:**

OpenSearch has several caches: request cache (aggregation results), query cache (filter bitsets), and field data cache. Warm up caches after restarts for consistent performance.

**8. Profile Queries:**

```javascript
{ "query": { ... }, "profile": true }
// Returns detailed timing breakdown per shard, per query phase
```

---

### 18. What is refresh interval?

The refresh interval controls how frequently OpenSearch creates a new Lucene segment from buffered writes, making newly indexed documents available for search. This is the "near real-time" aspect of OpenSearch.

**How It Works:**

When you index a document, it goes into an in-memory buffer. The refresh operation flushes this buffer to a new Lucene segment on disk (well, in OS page cache), making the documents searchable. This is cheaper than a full fsync (flush) which writes to disk durably.

**Default Behavior:**

The default refresh interval is `1s` — documents become searchable within ~1 second of indexing.

**Configuring Refresh Interval:**

```javascript
// Set on index creation
PUT /logs { "settings": { "refresh_interval": "5s" } }

// Change dynamically
PUT /logs/_settings { "refresh_interval": "30s" }

// Disable during bulk indexing (then re-enable)
PUT /logs/_settings { "refresh_interval": "-1" } // Disable
// ... bulk index ...
PUT /logs/_settings { "refresh_interval": "1s" }  // Re-enable
POST /logs/_refresh // Manual refresh if needed
```

**Performance Impact:**

More frequent refreshes = smaller segments = more Lucene merge overhead = higher CPU/IO. For log ingestion pipelines, increasing refresh interval to 30s-60s can dramatically improve indexing throughput.

**Refresh vs Flush:**

- **Refresh**: Makes documents searchable (in-memory to searchable segment) — fast, frequent
- **Flush**: Persists segments to disk and clears translog — slower, less frequent (happens automatically when translog reaches a size threshold)

---

### 19. Difference between filter and query context?

The distinction between filter and query context is one of the most impactful performance concepts in OpenSearch.

**Query Context (Relevance Scoring):**

A query in the `query` context calculates a relevance score (`_score`) for each matching document. The score represents how well the document matches the query. Results are sorted by score by default.

```javascript
{
  "query": {
    "match": { "title": "opensearch tutorial" } // Scored: TF-IDF/BM25 calculated
  }
}
```

Use query context for: full-text search where ranking by relevance matters.

**Filter Context (Boolean Match):**

A query in the `filter` context only determines whether a document matches (yes/no). No score is calculated. **Filter results are cached** by OpenSearch — subsequent identical filters reuse the cached bitset.

```javascript
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "status": "active" } },    // Cached, no scoring
        { "range": { "price": { "gte": 10 } } } // Cached, no scoring
      ]
    }
  }
}
```

**Performance Impact:**

Filter context is significantly faster than query context:
1. No score calculation (no BM25 computation)
2. Results are cached as bitsets (up to 10MB per filter) — subsequent requests with the same filter are nearly instant
3. Filters can use index structures more efficiently

**Best Practice — Combine Both:**

```javascript
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "opensearch" } }  // Query context: relevance scored
      ],
      "filter": [
        { "term": { "status": "published" } },   // Filter context: cached
        { "range": { "date": { "gte": "2024-01-01" } } } // Filter context: cached
      ]
    }
  }
}
```

The `must` clause scores how well the title matches. The `filter` clauses are AND conditions that don't affect scoring — they efficiently eliminate non-matching documents before scoring.

---

### 20. Explain a real-world use case where OpenSearch was better than SQL

**Use Case: E-Commerce Product Search with Faceted Filtering**

A mid-size e-commerce platform (5 million products, 50,000 daily active users) was using PostgreSQL for everything — including product search. As the catalog grew, search became painful:

**The Problems with PostgreSQL:**

1. **Full-text search limitations**: `ILIKE '%widget%'` couldn't use B-Tree indexes. Full-text `to_tsvector` search was better but had no relevance ranking, no stemming-aware facets, and poor multilingual support.

2. **Faceted search aggregations**: Counting products by category, brand, price range, and rating simultaneously required expensive multi-GROUP BY queries. On 5M products with complex joins to attributes, these queries took 3-8 seconds.

3. **Typo tolerance**: Users searching "wirless headpones" got zero results. PostgreSQL's `pg_trgm` similarity was slow and couldn't handle transposition errors well.

4. **Synonym handling**: "TV" vs "television" vs "telly" required complex application-level logic.

**The OpenSearch Solution:**

Products were indexed into OpenSearch (synced via DynamoDB Streams from the source of truth) with:
- `name` and `description` as `text` fields with English analyzer + custom synonym filter
- `category`, `brand`, `color` as `keyword` for faceting
- Fuzzy matching enabled on name search

A single OpenSearch query now handled:
- Full-text relevance search with BM25 scoring
- Fuzzy matching for typos (`fuzziness: "AUTO"`)
- Synonym expansion ("TV" → ["TV", "television"])
- Faceted counts for category/brand/price in the same request (aggregations)
- Geographic boosting for local sellers

**Results:**

- Search latency: 3-8 seconds → 50-100ms
- Typo tolerance: 0% success → ~85% recovery on 1-2 character mistakes
- Facet counts: Previously a separate query → included in main search response with negligible overhead
- Relevance: Binary keyword match → BM25-scored, user click-through rate improved 34%

The key insight: **OpenSearch was not replacing PostgreSQL** — PostgreSQL still stored the authoritative product data with ACID guarantees, inventory, pricing, and orders. OpenSearch was a read-optimized, search-specific projection of that data. The two systems complemented each other perfectly.