# Union Find / Disjoint Set — Master Problem Set

> 10 carefully chosen problems that cover ~95% of all DSA questions on this pattern.

---

## 📌 What is Union-Find (Disjoint Set Union)?

Union-Find is a data structure that tracks **which elements belong to the same group (component)**. It supports two core operations in near O(1) amortized time:

| Operation | Purpose |
|-----------|---------|
| `find(x)` | Returns the **representative (root)** of x's component |
| `union(x, y)` | **Merges** the components of x and y |

### Canonical Implementation (used in all problems below)

```java
class UnionFind {
    int[] parent, rank;

    UnionFind(int n) {
        parent = new int[n];
        rank   = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    // Path compression
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }

    // Union by rank
    boolean union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false; // already connected
        if (rank[px] < rank[py]) { int t = px; px = py; py = t; }
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
        return true;
    }

    boolean connected(int x, int y) {
        return find(x) == find(y);
    }
}
```

---

## Table of Contents

| # | Problem | Difficulty | Jump to Solution |
|---|---------|:----------:|-----------------|
| 1 | Number of Connected Components in an Undirected Graph | 🟡 Medium | [→ #1](#number-of-connected-components-in-an-undirected-graph) |
| 2 | Number of Islands (Union-Find approach) | 🟡 Medium | [→ #2](#number-of-islands-union-find-approach) |
| 3 | Redundant Connection | 🟡 Medium | [→ #3](#redundant-connection) |
| 4 | Accounts Merge | 🟡 Medium | [→ #4](#accounts-merge) |
| 5 | Graph Valid Tree | 🟡 Medium | [→ #5](#graph-valid-tree) |
| 6 | Smallest String With Swaps | 🟡 Medium | [→ #6](#smallest-string-with-swaps) |
| 7 | Satisfiability of Equality Equations | 🟡 Medium | [→ #7](#satisfiability-of-equality-equations) |
| 8 | Minimum Spanning Tree — Kruskal's Algorithm | 🟡 Medium | [→ #8](#minimum-spanning-tree--kruskals-algorithm) |
| 9 | Detect Cycle in Undirected Graph / Number of Operations to Make Network Connected | 🟡 Medium | [→ #9](#detect-cycle-in-undirected-graph--number-of-operations-to-make-network-connected) |
| 10 | Swim in Rising Water | 🔴 Hard | [→ #10](#swim-in-rising-water) |

---

<a id="number-of-connected-components-in-an-undirected-graph"></a>
## Problem 1 — Number of Connected Components in an Undirected Graph

### Problem Statement
Given `n` nodes (0 to n-1) and a list of undirected edges, return the **number of connected components**.

**Example:**
```
Input:  n = 5, edges = [[0,1],[1,2],[3,4]]
Output: 2
```
**Test Cases:**
```
n=5, edges=[[0,1],[1,2],[3,4]]        → 2
n=5, edges=[]                          → 5
n=5, edges=[[0,1],[1,2],[2,3],[3,4]]  → 1
n=1, edges=[]                          → 1
```

### Intuition
Every node starts as its own component (n components). Each time we successfully `union` two nodes that were in **different** components, the total count drops by 1.

### Why Union-Find?
- Merging groups and counting them is the literal definition of DSU.
- BFS/DFS works too but UF is cleaner and faster for dynamic connectivity.

### Approach
1. Initialize DSU with `n` nodes → `count = n`.
2. For each edge `(u, v)`: if `union(u, v)` returns true (different components), decrement `count`.
3. Return `count`.

```java
class Solution {
    public int countComponents(int n, int[][] edges) {
        UnionFind uf = new UnionFind(n);
        int count = n;
        for (int[] e : edges) {
            if (uf.union(e[0], e[1])) count--;
        }
        return count;
    }
}
```
**Complexity:** Time O(E · α(N)) ≈ O(E) | Space O(N)

---

<a id="number-of-islands-union-find-approach"></a>
## Problem 2 — Number of Islands (Union-Find approach)

### Problem Statement
Given a 2D grid of `'1'` (land) and `'0'` (water), return the **number of islands**.

**Example:**
```
Input:
  1 1 0
  1 0 0
  0 0 1
Output: 2
```
**Test Cases:**
```
All '1's 3×3             → 1
All '0's 3×3             → 0
Checkerboard pattern     → number of '1' cells
Single cell '1'          → 1
```

### Intuition
Treat each land cell as a node. Adjacent land cells belong to the same island. Use DSU to merge adjacent cells; the number of distinct roots among land cells = number of islands.

### Why Union-Find?
Avoids recursive DFS stack overflow for large grids; also more intuitive for "merging regions".

### Approach
1. Map 2D index `(r, c)` → 1D index `r * cols + c`.
2. Initialize DSU for all cells; track `islandCount` = number of '1' cells.
3. For each land cell, try to union with right and down neighbors; decrement count on successful union.
4. Return `islandCount`.

```java
class Solution {
    public int numIslands(char[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        UnionFind uf = new UnionFind(rows * cols);
        int count = 0;

        int[][] dirs = {{0,1},{1,0}};
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    for (int[] d : dirs) {
                        int nr = r + d[0], nc = c + d[1];
                        if (nr < rows && nc < cols && grid[nr][nc] == '1') {
                            if (uf.union(r * cols + c, nr * cols + nc)) count--;
                        }
                    }
                }
            }
        }
        return count;
    }
}
```
**Complexity:** Time O(M·N·α(M·N)) | Space O(M·N)

---

<a id="redundant-connection"></a>
## Problem 3 — Redundant Connection

### Problem Statement
Given a tree with `n` nodes and `n` edges (one extra edge creates a cycle), return the **edge that creates the cycle**.

**Example:**
```
Input:  edges = [[1,2],[1,3],[2,3]]
Output: [2,3]
```
**Test Cases:**
```
[[1,2],[1,3],[2,3]]         → [2,3]
[[1,2],[2,3],[3,4],[1,4],[1,5]] → [1,4]
[[1,2]]                     → (invalid, but handle gracefully)
```

### Intuition
Process edges one by one. The **first edge** where both endpoints are **already in the same component** is the redundant one — adding it creates a cycle.

### Why Union-Find?
Cycle detection in an undirected graph is DSU's sweet spot: `union` returns false exactly when a cycle is formed.

### Approach
1. Initialize DSU.
2. For each edge `(u, v)`: if `find(u) == find(v)` → return this edge. Otherwise `union(u, v)`.

```java
class Solution {
    public int[] findRedundantConnection(int[][] edges) {
        UnionFind uf = new UnionFind(edges.length + 1);
        for (int[] e : edges) {
            if (!uf.union(e[0], e[1])) return e;
        }
        return new int[]{};
    }
}
```
**Complexity:** Time O(N·α(N)) | Space O(N)

---

<a id="accounts-merge"></a>
## Problem 4 — Accounts Merge

### Problem Statement
Given a list of accounts where each account is `[name, email1, email2, ...]`, merge accounts that share at least one email. Return merged accounts sorted.

**Example:**
```
Input:  [["John","a@a","b@b"],["John","b@b","c@c"],["Mary","d@d"]]
Output: [["John","a@a","b@b","c@c"],["Mary","d@d"]]
```
**Test Cases:**
```
No shared emails → same accounts returned separately
All same emails  → single merged account
Name differs but email same → still merge (edge case: problem says merge by email)
```

### Intuition
Emails are nodes. If two emails appear in the same account, they belong to the same "person". Union all emails in the same account together. Then group by root.

### Why Union-Find?
Merging equivalence classes (emails belonging to same person) across multiple lists is exactly what DSU does efficiently.

### Approach
1. Map each email to a unique integer ID.
2. For each account, union all emails with the first email of that account.
3. Group emails by their root ID; sort each group; prepend the name.

```java
class Solution {
    public List<List<String>> accountsMerge(List<List<String>> accounts) {
        Map<String, Integer> emailId = new HashMap<>();
        Map<String, String> emailName = new HashMap<>();
        int id = 0;

        for (List<String> acc : accounts) {
            String name = acc.get(0);
            for (int i = 1; i < acc.size(); i++) {
                String email = acc.get(i);
                if (!emailId.containsKey(email)) {
                    emailId.put(email, id++);
                }
                emailName.put(email, name);
            }
        }

        UnionFind uf = new UnionFind(id);
        for (List<String> acc : accounts) {
            int first = emailId.get(acc.get(1));
            for (int i = 2; i < acc.size(); i++) {
                uf.union(first, emailId.get(acc.get(i)));
            }
        }

        Map<Integer, List<String>> groups = new HashMap<>();
        for (String email : emailId.keySet()) {
            int root = uf.find(emailId.get(email));
            groups.computeIfAbsent(root, k -> new ArrayList<>()).add(email);
        }

        List<List<String>> result = new ArrayList<>();
        for (List<String> emails : groups.values()) {
            Collections.sort(emails);
            emails.add(0, emailName.get(emails.get(0)));
            result.add(emails);
        }
        return result;
    }
}
```
**Complexity:** Time O(N·K·log(N·K)) | Space O(N·K) where K = avg emails per account

---

<a id="graph-valid-tree"></a>
## Problem 5 — Graph Valid Tree

### Problem Statement
Given `n` nodes and a list of undirected edges, determine whether the edges form a **valid tree**.

**Example:**
```
Input:  n=5, edges=[[0,1],[0,2],[0,3],[1,4]]
Output: true

Input:  n=5, edges=[[0,1],[1,2],[2,3],[1,3],[1,4]]
Output: false
```
**Test Cases:**
```
n=1, edges=[]                      → true  (single node)
n=2, edges=[[0,1],[0,1]]          → false (duplicate edge = cycle)
n=5, edges with cycle              → false
n=5, edges=[[0,1],[0,2],[0,3],[1,4]] → true
```

### Intuition
A valid tree on `n` nodes must satisfy **two conditions**:
1. Exactly `n-1` edges (necessary for connectivity without cycles).
2. No cycles (checked via DSU).

### Why Union-Find?
Both cycle detection and connectivity can be verified in a single pass with DSU.

### Approach
1. If `edges.length != n - 1` → return false immediately.
2. Run DSU on all edges; if any `union` returns false → cycle → return false.
3. Return true.

```java
class Solution {
    public boolean validTree(int n, int[][] edges) {
        if (edges.length != n - 1) return false;
        UnionFind uf = new UnionFind(n);
        for (int[] e : edges) {
            if (!uf.union(e[0], e[1])) return false;
        }
        return true;
    }
}
```
**Complexity:** Time O(N·α(N)) | Space O(N)

---

<a id="smallest-string-with-swaps"></a>
## Problem 6 — Smallest String With Swaps

### Problem Statement
Given a string `s` and a list of index pairs, you can swap characters at paired indices any number of times. Return the **lexicographically smallest** string.

**Example:**
```
Input:  s="dcab", pairs=[[0,3],[1,2]]
Output: "bacd"
```
**Test Cases:**
```
s="dcab", pairs=[[0,3],[1,2]]           → "bacd"
s="dcab", pairs=[[0,3],[1,2],[0,2]]     → "abcd"
s="cba",  pairs=[]                       → "cba"
s="a",    pairs=[]                       → "a"
```

### Intuition
Indices connected (directly or transitively) by swap pairs form a component. Within a component, you can arrange characters in **any order** — so sort them and place the smallest characters at the smallest indices.

### Why Union-Find?
Transitive connectivity ("can reach X through swaps") is precisely what DSU captures.

### Approach
1. Union all pairs of indices.
2. Group indices by their root.
3. For each group, collect characters, sort them, and place them back at the sorted indices.

```java
class Solution {
    public String smallestStringWithSwaps(String s, List<List<Integer>> pairs) {
        int n = s.length();
        UnionFind uf = new UnionFind(n);
        for (List<Integer> p : pairs) uf.union(p.get(0), p.get(1));

        Map<Integer, List<Integer>> groups = new HashMap<>();
        for (int i = 0; i < n; i++) {
            groups.computeIfAbsent(uf.find(i), k -> new ArrayList<>()).add(i);
        }

        char[] res = new char[n];
        for (List<Integer> indices : groups.values()) {
            List<Character> chars = new ArrayList<>();
            for (int idx : indices) chars.add(s.charAt(idx));
            Collections.sort(indices);
            Collections.sort(chars);
            for (int i = 0; i < indices.size(); i++) res[indices.get(i)] = chars.get(i);
        }
        return new String(res);
    }
}
```
**Complexity:** Time O(N log N) | Space O(N)

---

<a id="satisfiability-of-equality-equations"></a>
## Problem 7 — Satisfiability of Equality Equations

### Problem Statement
Given equations like `"a==b"` and `"a!=b"`, determine whether all equations can be satisfied simultaneously.

**Example:**
```
Input:  ["a==b","b!=c","b==c"]
Output: false
```
**Test Cases:**
```
["a==b","b!=c","b==c"]   → false
["c==c","b==d","x!=z"]   → true
["a==b","a==c","b!=c"]   → false
["a!=a"]                  → false
```

### Intuition
First process all `==` equations by unioning the variables. Then check all `!=` equations — if the two variables are in the **same component**, it's a contradiction.

### Why Union-Find?
Equality is an equivalence relation; DSU models equivalence classes perfectly.

### Approach
1. Map each variable to an integer (a→0 … z→25).
2. First pass: union all `==` pairs.
3. Second pass: for each `!=`, if `find(x) == find(y)` → return false.
4. Return true.

```java
class Solution {
    public boolean equationsPossible(String[] equations) {
        UnionFind uf = new UnionFind(26);
        for (String eq : equations) {
            if (eq.charAt(1) == '=') {
                uf.union(eq.charAt(0) - 'a', eq.charAt(3) - 'a');
            }
        }
        for (String eq : equations) {
            if (eq.charAt(1) == '!') {
                if (uf.connected(eq.charAt(0) - 'a', eq.charAt(3) - 'a')) return false;
            }
        }
        return true;
    }
}
```
**Complexity:** Time O(N·α(26)) ≈ O(N) | Space O(1) (fixed 26 nodes)

---

<a id="minimum-spanning-tree--kruskals-algorithm"></a>
## Problem 8 — Minimum Spanning Tree — Kruskal's Algorithm

### Problem Statement
Given `n` nodes and weighted edges, find the **minimum cost to connect all nodes** (Minimum Spanning Tree).

**Example:**
```
Input:  n=4, edges=[[0,1,10],[0,2,6],[0,3,5],[1,3,15],[2,3,4]]
Output: 19   (edges: 2-3 cost 4, 0-3 cost 5, 0-1 cost 10)
```
**Test Cases:**
```
n=2, edges=[[0,1,5]]                           → 5
n=4, edges=[[0,1,10],[0,2,6],[0,3,5],[2,3,4]] → 19
Already fully connected with same weights       → n-1 * weight
n=1, edges=[]                                  → 0
```

### Intuition
Greedily pick the cheapest edge that doesn't create a cycle. DSU tells us instantly whether adding an edge creates a cycle (both endpoints in same component).

### Why Union-Find?
Kruskal's algorithm **is** the textbook application of DSU. Checking for cycles across a sorted edge list is O(α(N)) per edge.

### Approach
1. Sort edges by weight.
2. Greedily take each edge; if it connects two different components (`union` returns true), add its weight and decrement remaining node count.
3. Stop when all nodes are connected (1 component).

```java
class Solution {
    public int minimumCost(int n, int[][] connections) {
        Arrays.sort(connections, (a, b) -> a[2] - b[2]);
        UnionFind uf = new UnionFind(n + 1);
        int cost = 0, edges = 0;

        for (int[] conn : connections) {
            if (uf.union(conn[0], conn[1])) {
                cost += conn[2];
                if (++edges == n - 1) return cost;
            }
        }
        return -1; // not fully connected
    }
}
```
**Complexity:** Time O(E log E) | Space O(N)

---

<a id="detect-cycle-in-undirected-graph--number-of-operations-to-make-network-connected"></a>
## Problem 9 — Detect Cycle in Undirected Graph / Number of Operations to Make Network Connected

### Problem Statement
You have `n` computers and `connections` (cables). Find the **minimum number of cables to move** to make all computers connected. Return -1 if impossible.

**Example:**
```
Input:  n=4, connections=[[0,1],[0,2],[1,2]]
Output: 1
```
**Test Cases:**
```
n=4, connections=[[0,1],[0,2],[1,2]]                → 1
n=6, connections=[[0,1],[0,2],[0,3],[1,2],[1,3]]    → 2
n=6, connections=[[0,1],[0,2],[0,3],[1,2]]          → -1 (not enough cables)
n=1, connections=[]                                  → 0
```

### Intuition
- You need at least `n-1` edges to connect `n` nodes. If `connections.length < n-1` → return -1.
- Each redundant edge (both endpoints in same component) is a "spare cable" that can be reused.
- Number of moves = number of disconnected components - 1.

### Why Union-Find?
Counting components and detecting redundant edges simultaneously is effortless with DSU.

### Approach
1. If total edges < n-1 → return -1.
2. Process all edges; count extra edges (failed unions) and components.
3. Answer = components - 1 (we have enough extras since edges ≥ n-1).

```java
class Solution {
    public int makeConnected(int n, int[][] connections) {
        if (connections.length < n - 1) return -1;

        UnionFind uf = new UnionFind(n);
        int components = n;

        for (int[] conn : connections) {
            if (uf.union(conn[0], conn[1])) components--;
        }
        return components - 1;
    }
}
```
**Complexity:** Time O(E·α(N)) | Space O(N)

---

<a id="swim-in-rising-water"></a>
## Problem 10 — Swim in Rising Water

### Problem Statement
In an N×N grid, cell `(r, c)` has elevation `grid[r][c]`. Wait time `t` means you can swim through cells with elevation ≤ t. Find the **minimum time** to swim from top-left `(0,0)` to bottom-right `(N-1,N-1)`.

**Example:**
```
Input:
  0 2
  1 3
Output: 3
```
**Test Cases:**
```
[[0,2],[1,3]]          → 3
[[0,1,2,3,4]...]       → depends on grid
1×1 grid [[0]]        → 0
2×2 [[0,1],[2,3]]     → 3
```

### Intuition
Sort all cells by elevation. Add cells from lowest to highest. After adding each cell, union it with adjacent already-added cells. The answer is the elevation of the cell we add that **first connects (0,0) to (N-1,N-1)**.

### Why Union-Find?
We need to detect the moment two specific nodes become connected as we incrementally add nodes — a classic DSU "online connectivity" query.

### Approach
1. Collect all `(elevation, row, col)` triples and sort by elevation.
2. Maintain a `visited` boolean grid.
3. For each cell in sorted order: mark visited, union with visited neighbors.
4. After each union, check if `(0,0)` and `(N-1,N-1)` are connected → return current elevation.

```java
class Solution {
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        int[][] cells = new int[n * n][3];
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++)
                cells[r * n + c] = new int[]{grid[r][c], r, c};

        Arrays.sort(cells, (a, b) -> a[0] - b[0]);

        UnionFind uf = new UnionFind(n * n);
        boolean[][] visited = new boolean[n][n];
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};

        for (int[] cell : cells) {
            int t = cell[0], r = cell[1], c = cell[2];
            visited[r][c] = true;

            for (int[] d : dirs) {
                int nr = r + d[0], nc = c + d[1];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && visited[nr][nc]) {
                    uf.union(r * n + c, nr * n + nc);
                }
            }

            if (uf.connected(0, n * n - 1)) return t;
        }
        return -1;
    }
}
```
**Complexity:** Time O(N² log N²) = O(N² log N) | Space O(N²)

---

## 🗺️ Pattern Coverage Map

| Problem | Core DSU Skill |
|---------|---------------|
| 1. Connected Components | Basic component counting |
| 2. Number of Islands | 2D grid → 1D DSU mapping |
| 3. Redundant Connection | Cycle detection |
| 4. Accounts Merge | String keys → DSU with grouping |
| 5. Graph Valid Tree | Combined cycle + edge count check |
| 6. Smallest String With Swaps | Component-wise sorting |
| 7. Equality Equations | Two-phase (build then verify) |
| 8. Kruskal's MST | Weighted DSU + greedy |
| 9. Network Connected | Spare edge counting |
| 10. Swim in Rising Water | Online connectivity query |

---

## ⚡ Decision Guide — When to Reach for DSU

```
Is the problem about grouping / merging sets?          → DSU
Does it ask "are X and Y connected?"                   → DSU
Does it involve detecting cycles (undirected)?         → DSU
Do you need to count connected components?             → DSU
Minimum spanning tree?                                 → DSU (Kruskal)
Does connectivity build incrementally?                 → DSU
Directed graph / shortest path / ordering?             → NOT DSU (use DFS/Topo/Dijkstra)
```

---

## 📝 Common Pitfalls

1. **Forgetting path compression** → TLE on large inputs.
2. **Using rank without path compression or vice versa** → Always use both.
3. **1-indexed vs 0-indexed** — be careful when nodes are labeled 1..N (allocate size N+1).
4. **String keys** — map strings to integers before passing to DSU (see Problem 4).
5. **Two-phase processing** — for constraint problems (equality/inequality), always process positive constraints first (Problem 7).