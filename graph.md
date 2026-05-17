# Graph Problems — Complete Pattern Guide

> Covers **95%** of graph interview questions across BFS, DFS, Topological Sort, Union-Find, Shortest Path, and more.

---

## Table of Contents

1. [Number of Islands (DFS/BFS on Grid)](#1-number-of-islands)
2. [Clone Graph (DFS + HashMap)](#2-clone-graph)
3. [Course Schedule (Cycle Detection — Directed)](#3-course-schedule)
4. [Course Schedule II (Topological Sort — Kahn's BFS)](#4-course-schedule-ii)
5. [Number of Connected Components (Union-Find)](#5-number-of-connected-components)
6. [Pacific Atlantic Water Flow (Multi-source BFS/DFS)](#6-pacific-atlantic-water-flow)
7. [Walls and Gates (Multi-source BFS)](#7-walls-and-gates)
8. [Shortest Path in Binary Matrix (BFS)](#8-shortest-path-in-binary-matrix)
9. [Word Ladder (BFS + Level Order)](#9-word-ladder)
10. [Dijkstra's Algorithm — Network Delay Time](#10-network-delay-time)
11. [Bellman-Ford — Cheapest Flights Within K Stops](#11-cheapest-flights-within-k-stops)
12. [Redundant Connection (Union-Find / Cycle in Undirected)](#12-redundant-connection)
13. [Alien Dictionary (Topological Sort on Characters)](#13-alien-dictionary)
14. [Graph Valid Tree (Union-Find + Edge Count)](#14-graph-valid-tree)
15. [Swim in Rising Water (Binary Search + BFS / Dijkstra)](#15-swim-in-rising-water)

---

## Core Concepts at a Glance

| Pattern | When to Use | Key Data Structure |
|---|---|---|
| DFS | Explore all paths, detect cycles | Stack / Recursion |
| BFS | Shortest path (unweighted), level order | Queue |
| Topological Sort | Dependency ordering, DAGs | Queue + In-degree array |
| Union-Find | Connected components, cycle detection | Parent + Rank arrays |
| Dijkstra | Shortest path (non-negative weights) | Min-Heap (PriorityQueue) |
| Bellman-Ford | Shortest path with negative weights / K-limited hops | DP array, K iterations |
| Multi-source BFS | Spread from multiple origins simultaneously | Queue pre-loaded with all sources |

---

---

## 1. Number of Islands

### Problem Statement
Given an `m x n` 2D binary grid where `'1'` represents land and `'0'` represents water, return the number of distinct islands.

### Test Cases
```
Input:  grid = [["1","1","0","0","0"],
                ["1","1","0","0","0"],
                ["0","0","1","0","0"],
                ["0","0","0","1","1"]]
Output: 3

Input:  grid = [["1","1","1","1","0"],
                ["1","1","0","1","0"],
                ["1","1","0","0","0"],
                ["0","0","0","0","0"]]
Output: 1
```

### Intuition
Think of each `'1'` as a piece of land. Whenever you step onto an unvisited land cell, you've found a new island — flood-fill all adjacent land cells so you never count them again.

### Why DFS?
DFS naturally "sinks" the entire connected region in one recursive call. Each unvisited `'1'` we encounter from the outer loop is a brand-new island — we increment the counter and DFS marks everything connected.

### Approach
1. Iterate every cell. If `grid[r][c] == '1'`, increment `islands` and call DFS.
2. DFS marks the cell `'0'` (visited) and recurses in 4 directions.
3. Return `islands`.

**Time:** O(m × n) | **Space:** O(m × n) recursion stack

### Java Code
```java
class Solution {
    public int numIslands(char[][] grid) {
        int islands = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    islands++;
                    dfs(grid, r, c);
                }
            }
        }
        return islands;
    }

    private void dfs(char[][] grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1')
            return;
        grid[r][c] = '0'; // mark visited
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }
}
```

---

## 2. Clone Graph

### Problem Statement
Given a reference to a node in a **connected undirected graph**, return a **deep copy** (clone) of the graph. Each node has a value and a list of neighbors.

### Test Cases
```
Input:  adjList = [[2,4],[1,3],[2,4],[1,3]]
Output: [[2,4],[1,3],[2,4],[1,3]]  // deep copy

Input:  adjList = [[]]
Output: [[]]

Input:  adjList = []
Output: []
```

### Intuition
The problem is essentially a graph traversal where, at each node, you create a copy before visiting neighbors. A `HashMap<Node, Node>` maps original → clone to handle cycles (avoid infinite recursion).

### Why HashMap + DFS?
Graphs can have cycles. Without memoization, DFS would loop forever. The map serves as both a `visited` set and a registry of already-cloned nodes.

### Approach
1. If node is null, return null.
2. If node already in map, return its clone.
3. Create clone, put in map, then recursively clone all neighbors.

**Time:** O(V + E) | **Space:** O(V)

### Java Code
```java
class Solution {
    private Map<Node, Node> map = new HashMap<>();

    public Node cloneGraph(Node node) {
        if (node == null) return null;
        if (map.containsKey(node)) return map.get(node);

        Node clone = new Node(node.val);
        map.put(node, clone);

        for (Node neighbor : node.neighbors) {
            clone.neighbors.add(cloneGraph(neighbor));
        }
        return clone;
    }
}
```

---

## 3. Course Schedule

### Problem Statement
There are `n` courses (0 to n-1). `prerequisites[i] = [a, b]` means you must take course `b` before `a`. Return `true` if you can finish all courses (i.e., no cycle exists in the directed graph).

### Test Cases
```
Input:  n=2, prerequisites=[[1,0]]
Output: true   // take 0, then 1

Input:  n=2, prerequisites=[[1,0],[0,1]]
Output: false  // cycle: 0 → 1 → 0
```

### Intuition
Model each prerequisite as a directed edge. If the graph has a cycle, courses in the cycle can never all be completed. So the question reduces to: **does this directed graph have a cycle?**

### Why DFS with 3-color marking?
- **White (0):** unvisited  
- **Gray (1):** currently in DFS stack (being processed)  
- **Black (2):** fully processed  

If DFS hits a **gray** node, we've found a back edge → cycle exists.

### Approach
1. Build adjacency list.
2. DFS every unvisited node. Mark gray on entry, black on exit.
3. If we hit a gray node during DFS, return false.

**Time:** O(V + E) | **Space:** O(V + E)

### Java Code
```java
class Solution {
    public boolean canFinish(int n, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] pre : prerequisites) adj.get(pre[1]).add(pre[0]);

        int[] color = new int[n]; // 0=white, 1=gray, 2=black

        for (int i = 0; i < n; i++) {
            if (color[i] == 0 && hasCycle(adj, color, i)) return false;
        }
        return true;
    }

    private boolean hasCycle(List<List<Integer>> adj, int[] color, int node) {
        color[node] = 1; // gray
        for (int nei : adj.get(node)) {
            if (color[nei] == 1) return true;          // back edge
            if (color[nei] == 0 && hasCycle(adj, color, nei)) return true;
        }
        color[node] = 2; // black
        return false;
    }
}
```

---

## 4. Course Schedule II

### Problem Statement
Same setup as Course Schedule, but now **return the order** in which you should take courses. If impossible, return `[]`.

### Test Cases
```
Input:  n=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]]
Output: [0,2,1,3] or [0,1,2,3]

Input:  n=2, prerequisites=[[1,0],[0,1]]
Output: []
```

### Intuition
This is **Topological Sort** — arrange nodes so every directed edge goes from left to right. Use **Kahn's Algorithm (BFS)**: repeatedly pick nodes with in-degree 0 (no remaining prerequisites).

### Why Kahn's BFS?
It naturally yields a valid order and detects cycles — if we can't process all `n` nodes, a cycle exists.

### Approach
1. Compute in-degree for every node.
2. Enqueue all nodes with in-degree 0.
3. BFS: dequeue node → add to result → decrement neighbors' in-degree → enqueue any that reach 0.
4. If result size == n, return it; else return [].

**Time:** O(V + E) | **Space:** O(V + E)

### Java Code
```java
class Solution {
    public int[] findOrder(int n, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        int[] inDegree = new int[n];
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        for (int[] pre : prerequisites) {
            adj.get(pre[1]).add(pre[0]);
            inDegree[pre[0]]++;
        }

        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < n; i++) if (inDegree[i] == 0) queue.offer(i);

        int[] order = new int[n];
        int idx = 0;

        while (!queue.isEmpty()) {
            int node = queue.poll();
            order[idx++] = node;
            for (int nei : adj.get(node)) {
                if (--inDegree[nei] == 0) queue.offer(nei);
            }
        }

        return idx == n ? order : new int[]{};
    }
}
```

---

## 5. Number of Connected Components

### Problem Statement
Given `n` nodes (0 to n-1) and a list of undirected edges, return the number of connected components.

### Test Cases
```
Input:  n=5, edges=[[0,1],[1,2],[3,4]]
Output: 2

Input:  n=5, edges=[[0,1],[1,2],[2,3],[3,4]]
Output: 1
```

### Intuition
Each connected component is an isolated "island" in the graph. Union-Find is the most elegant tool: merge nodes that share an edge; each surviving separate root is one component.

### Why Union-Find?
O(α(n)) per operation (nearly constant). Cleaner than DFS for pure component counting. Also teaches a reusable template for many graph problems.

### Approach
1. Initialize each node as its own parent.
2. For each edge, `union(a, b)` — if they had different roots, decrement component count.
3. Return component count.

**Time:** O(n · α(n)) | **Space:** O(n)

### Java Code
```java
class Solution {
    int[] parent, rank;

    public int countComponents(int n, int[][] edges) {
        parent = new int[n];
        rank = new int[n];
        int components = n;
        for (int i = 0; i < n; i++) parent[i] = i;

        for (int[] edge : edges) {
            if (union(edge[0], edge[1])) components--;
        }
        return components;
    }

    private int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]); // path compression
        return parent[x];
    }

    private boolean union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        if (rank[px] < rank[py]) { int t = px; px = py; py = t; }
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
        return true;
    }
}
```

---

## 6. Pacific Atlantic Water Flow

### Problem Statement
Given an `m x n` matrix of heights, water flows to adjacent cells with height ≤ current. Find all cells from which water can reach **both** the Pacific (top/left border) and Atlantic (bottom/right border).

### Test Cases
```
Input:  heights = [[1,2,2,3,5],
                   [3,2,3,4,4],
                   [2,4,5,3,1],
                   [6,7,1,4,5],
                   [5,1,1,2,4]]
Output: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]
```

### Intuition
Instead of simulating water flowing down from every cell (expensive), **reverse the flow**: start BFS from ocean borders and "climb uphill" (neighbors with height ≥ current). Cells reachable from both oceans are the answer.

### Why Multi-source BFS?
Both oceans have multiple border cells as sources. Pre-loading all of them in the queue simultaneously is faster and simpler than running BFS from each border cell individually.

### Approach
1. BFS from all Pacific border cells (mark `pacific[][]`).
2. BFS from all Atlantic border cells (mark `atlantic[][]`).
3. Return cells where both are true.

**Time:** O(m × n) | **Space:** O(m × n)

### Java Code
```java
class Solution {
    int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};

    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        int m = heights.length, n = heights[0].length;
        boolean[][] pac = new boolean[m][n], atl = new boolean[m][n];
        Queue<int[]> pq = new LinkedList<>(), aq = new LinkedList<>();

        for (int r = 0; r < m; r++) {
            pq.offer(new int[]{r, 0});     pac[r][0] = true;
            aq.offer(new int[]{r, n-1});   atl[r][n-1] = true;
        }
        for (int c = 0; c < n; c++) {
            pq.offer(new int[]{0, c});     pac[0][c] = true;
            aq.offer(new int[]{m-1, c});   atl[m-1][c] = true;
        }

        bfs(heights, pq, pac);
        bfs(heights, aq, atl);

        List<List<Integer>> res = new ArrayList<>();
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if (pac[r][c] && atl[r][c]) res.add(List.of(r, c));
        return res;
    }

    private void bfs(int[][] h, Queue<int[]> q, boolean[][] visited) {
        int m = h.length, n = h[0].length;
        while (!q.isEmpty()) {
            int[] cell = q.poll();
            for (int[] d : dirs) {
                int r = cell[0]+d[0], c = cell[1]+d[1];
                if (r>=0 && c>=0 && r<m && c<n && !visited[r][c] && h[r][c] >= h[cell[0]][cell[1]]) {
                    visited[r][c] = true;
                    q.offer(new int[]{r, c});
                }
            }
        }
    }
}
```

---

## 7. Walls and Gates

### Problem Statement
Fill each empty room (`INF = 2147483647`) in a grid with the distance to its nearest gate (`0`). Walls are `-1`.

### Test Cases
```
Input:  rooms = [[INF, -1,  0, INF],
                 [INF, INF, INF, -1],
                 [INF, -1, INF, -1],
                 [0,  -1, INF, INF]]
Output:          [[3, -1, 0,  1],
                  [2,  2, 1, -1],
                  [1, -1, 2, -1],
                  [0, -1, 3,  4]]
```

### Intuition
Starting BFS from every gate simultaneously is the key insight. BFS naturally finds shortest distances level by level — so each room is filled with its minimum gate distance on first visit.

### Why Multi-source BFS (not DFS)?
DFS would require revisiting cells to ensure minimum distances. BFS guarantees first-visit = shortest distance.

### Approach
1. Add all gates to queue.
2. BFS outward: for each cell dequeued, update unvisited `INF` neighbors with `dist + 1`.

**Time:** O(m × n) | **Space:** O(m × n)

### Java Code
```java
class Solution {
    public void wallsAndGates(int[][] rooms) {
        int m = rooms.length, n = rooms[0].length;
        int INF = Integer.MAX_VALUE;
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        Queue<int[]> q = new LinkedList<>();

        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if (rooms[r][c] == 0) q.offer(new int[]{r, c});

        while (!q.isEmpty()) {
            int[] cell = q.poll();
            for (int[] d : dirs) {
                int r = cell[0]+d[0], c = cell[1]+d[1];
                if (r>=0 && c>=0 && r<m && c<n && rooms[r][c] == INF) {
                    rooms[r][c] = rooms[cell[0]][cell[1]] + 1;
                    q.offer(new int[]{r, c});
                }
            }
        }
    }
}
```

---

## 8. Shortest Path in Binary Matrix

### Problem Statement
In an `n x n` binary matrix, find the length of the shortest clear path from top-left `(0,0)` to bottom-right `(n-1, n-1)`. A clear path only goes through `0` cells, moves in 8 directions. Return `-1` if no path.

### Test Cases
```
Input:  grid = [[0,1],[1,0]]
Output: 2

Input:  grid = [[0,0,0],[1,1,0],[1,1,0]]
Output: 4

Input:  grid = [[1,0,0],[1,1,0],[1,1,0]]
Output: -1
```

### Intuition
Shortest path in an unweighted grid = BFS. Each BFS level represents one step. The first time we reach the destination, that's the minimum distance.

### Why BFS and not DFS?
DFS finds *a* path, not necessarily the *shortest*. BFS explores all cells at distance `d` before any at distance `d+1`, guaranteeing the shortest path.

### Approach
1. Edge case: if start or end is `1`, return -1.
2. BFS from `(0,0)` in all 8 directions.
3. Track distance. Return when `(n-1, n-1)` is reached.

**Time:** O(n²) | **Space:** O(n²)

### Java Code
```java
class Solution {
    public int shortestPathBinaryMatrix(int[][] grid) {
        int n = grid.length;
        if (grid[0][0] == 1 || grid[n-1][n-1] == 1) return -1;

        Queue<int[]> q = new LinkedList<>();
        q.offer(new int[]{0, 0, 1}); // row, col, dist
        grid[0][0] = 1; // mark visited

        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0},{1,1},{1,-1},{-1,1},{-1,-1}};

        while (!q.isEmpty()) {
            int[] curr = q.poll();
            int r = curr[0], c = curr[1], dist = curr[2];
            if (r == n-1 && c == n-1) return dist;
            for (int[] d : dirs) {
                int nr = r+d[0], nc = c+d[1];
                if (nr>=0 && nc>=0 && nr<n && nc<n && grid[nr][nc] == 0) {
                    grid[nr][nc] = 1;
                    q.offer(new int[]{nr, nc, dist+1});
                }
            }
        }
        return -1;
    }
}
```

---

## 9. Word Ladder

### Problem Statement
Given a `beginWord`, `endWord`, and a `wordList`, find the **length of the shortest transformation sequence** from begin to end, changing exactly one letter at a time, each intermediate word must be in `wordList`.

### Test Cases
```
Input:  beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log","cog"]
Output: 5   // hit → hot → dot → dog → cog

Input:  beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log"]
Output: 0   // cog not in list
```

### Intuition
Model this as a graph where words are nodes and an edge exists if words differ by one letter. Find the shortest path from `beginWord` to `endWord` — classic BFS.

### Why BFS?
We need the *shortest* sequence. BFS explores all words reachable in 1 change, then 2 changes, etc. First time we reach `endWord` = minimum steps.

### Approach
1. Add all words to a `Set` for O(1) lookup.
2. BFS: for each word, try changing every character to 'a'-'z'. If the new word is in the set, add to queue.
3. Remove from set on visit to avoid revisits.

**Time:** O(M² × N) where M = word length, N = wordList size | **Space:** O(M × N)

### Java Code
```java
class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Set<String> wordSet = new HashSet<>(wordList);
        if (!wordSet.contains(endWord)) return 0;

        Queue<String> q = new LinkedList<>();
        q.offer(beginWord);
        int steps = 1;

        while (!q.isEmpty()) {
            int size = q.size();
            while (size-- > 0) {
                String word = q.poll();
                char[] chars = word.toCharArray();
                for (int i = 0; i < chars.length; i++) {
                    char orig = chars[i];
                    for (char ch = 'a'; ch <= 'z'; ch++) {
                        chars[i] = ch;
                        String next = new String(chars);
                        if (next.equals(endWord)) return steps + 1;
                        if (wordSet.contains(next)) {
                            wordSet.remove(next);
                            q.offer(next);
                        }
                    }
                    chars[i] = orig;
                }
            }
            steps++;
        }
        return 0;
    }
}
```

---

## 10. Network Delay Time

### Problem Statement
You have `n` nodes and directed weighted edges `times[i] = [u, v, w]`. A signal sent from node `k` — find the **minimum time** for all nodes to receive the signal. Return `-1` if impossible.

### Test Cases
```
Input:  times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2
Output: 2

Input:  times=[[1,2,1]], n=2, k=1
Output: 1

Input:  times=[[1,2,1]], n=2, k=2
Output: -1
```

### Intuition
This is **Single Source Shortest Path** on a weighted directed graph. We want the shortest time to reach every node from `k`. The answer is the maximum shortest-path value across all nodes.

### Why Dijkstra?
All edge weights are non-negative. Dijkstra greedily processes the closest unvisited node, guaranteeing shortest paths efficiently with a min-heap.

### Approach
1. Build adjacency list.
2. Min-heap stores `(dist, node)`. Start with `(0, k)`.
3. Relax edges. Track `dist[]` array.
4. Answer = max of `dist[]`. If any node unreachable, return -1.

**Time:** O((V + E) log V) | **Space:** O(V + E)

### Java Code
```java
class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        Map<Integer, List<int[]>> adj = new HashMap<>();
        for (int[] t : times) {
            adj.computeIfAbsent(t[0], x -> new ArrayList<>()).add(new int[]{t[1], t[2]});
        }

        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
        pq.offer(new int[]{0, k});

        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int d = curr[0], node = curr[1];
            if (d > dist[node]) continue; // stale entry
            for (int[] nei : adj.getOrDefault(node, new ArrayList<>())) {
                int newDist = dist[node] + nei[1];
                if (newDist < dist[nei[0]]) {
                    dist[nei[0]] = newDist;
                    pq.offer(new int[]{newDist, nei[0]});
                }
            }
        }

        int maxDist = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == Integer.MAX_VALUE) return -1;
            maxDist = Math.max(maxDist, dist[i]);
        }
        return maxDist;
    }
}
```

---

## 11. Cheapest Flights Within K Stops

### Problem Statement
Given `n` cities, flights `[from, to, price]`, find the cheapest price from `src` to `dst` with at most `k` stops. Return `-1` if no route.

### Test Cases
```
Input:  n=4, flights=[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src=0, dst=3, k=1
Output: 700  // 0→1→3

Input:  n=3, flights=[[0,1,100],[1,2,100],[0,2,500]], src=0, dst=2, k=1
Output: 200  // 0→1→2
```

### Intuition
Dijkstra won't work here because we have a **constraint on hops** (K stops). Bellman-Ford relaxes edges K+1 times — each pass represents one more hop — perfectly fitting the constraint.

### Why Bellman-Ford (K iterations)?
We limit relaxation to `K+1` rounds. After round `i`, `dist[node]` = cheapest price using exactly `i` edges. This enforces the stop limit.

### Approach
1. `dist[]` = INF, `dist[src] = 0`.
2. Repeat K+1 times: copy `dist` to `temp`, relax all edges using `temp` (avoid using edges added in same round).
3. Return `dist[dst]` or -1.

**Time:** O(K × E) | **Space:** O(V)

### Java Code
```java
class Solution {
    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;

        for (int i = 0; i <= k; i++) {
            int[] temp = Arrays.copyOf(dist, n);
            for (int[] flight : flights) {
                int from = flight[0], to = flight[1], price = flight[2];
                if (dist[from] != Integer.MAX_VALUE && dist[from] + price < temp[to]) {
                    temp[to] = dist[from] + price;
                }
            }
            dist = temp;
        }
        return dist[dst] == Integer.MAX_VALUE ? -1 : dist[dst];
    }
}
```

---

## 12. Redundant Connection

### Problem Statement
Given a tree with `n` nodes and `n` edges (one extra edge), find and return the edge that can be removed to restore the tree. If multiple answers, return the last one.

### Test Cases
```
Input:  edges = [[1,2],[1,3],[2,3]]
Output: [2,3]

Input:  edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]
Output: [1,4]
```

### Intuition
A tree has exactly `n-1` edges. Adding one more creates exactly one cycle. We process edges one by one — the first edge that **connects two already-connected nodes** is the redundant one.

### Why Union-Find?
Union-Find detects whether two nodes already belong to the same component in O(α(n)). The first edge where `find(a) == find(b)` is the answer.

### Approach
1. Initialize Union-Find.
2. For each edge `[a, b]`: if `find(a) == find(b)`, return `[a, b]`. Else `union(a, b)`.

**Time:** O(n · α(n)) | **Space:** O(n)

### Java Code
```java
class Solution {
    int[] parent, rank;

    public int[] findRedundantConnection(int[][] edges) {
        int n = edges.length;
        parent = new int[n + 1];
        rank = new int[n + 1];
        for (int i = 1; i <= n; i++) parent[i] = i;

        for (int[] edge : edges) {
            if (find(edge[0]) == find(edge[1])) return edge;
            union(edge[0], edge[1]);
        }
        return new int[]{};
    }

    private int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    private void union(int x, int y) {
        int px = find(x), py = find(y);
        if (rank[px] >= rank[py]) parent[py] = px;
        else parent[px] = py;
        if (rank[px] == rank[py]) rank[px]++;
    }
}
```

---

## 13. Alien Dictionary

### Problem Statement
Given a list of words sorted lexicographically in an alien language, derive the **order of characters** in that language. Return any valid ordering, or `""` if invalid.

### Test Cases
```
Input:  words = ["wrt","wrf","er","ett","rftt"]
Output: "wertf"

Input:  words = ["z","x"]
Output: "zx"

Input:  words = ["z","x","z"]
Output: ""   // cycle: invalid
```

### Intuition
Adjacent words give us ordering constraints on characters. For example, `"wrt"` before `"wrf"` tells us `t < f`. Build a directed graph of these constraints and topologically sort.

### Why Topological Sort?
Character ordering is a dependency problem — character `a` must come before `b`. Topological sort on a DAG gives a valid linear ordering. If a cycle exists, return `""`.

### Approach
1. Compare adjacent words char by char to find ordering constraints → build directed graph.
2. Validate: if `word1` is a prefix of `word2` but longer, return `""`.
3. Kahn's BFS topological sort. If all chars processed, return result; else `""`.

**Time:** O(C) where C = total chars in all words | **Space:** O(U + min(U², N)) U = unique chars

### Java Code
```java
class Solution {
    public String alienOrder(String[] words) {
        Map<Character, Set<Character>> adj = new HashMap<>();
        Map<Character, Integer> inDegree = new HashMap<>();

        for (String word : words)
            for (char c : word.toCharArray()) {
                adj.putIfAbsent(c, new HashSet<>());
                inDegree.putIfAbsent(c, 0);
            }

        for (int i = 0; i < words.length - 1; i++) {
            String w1 = words[i], w2 = words[i+1];
            int len = Math.min(w1.length(), w2.length());
            if (w1.length() > w2.length() && w1.startsWith(w2)) return "";
            for (int j = 0; j < len; j++) {
                if (w1.charAt(j) != w2.charAt(j)) {
                    char from = w1.charAt(j), to = w2.charAt(j);
                    if (!adj.get(from).contains(to)) {
                        adj.get(from).add(to);
                        inDegree.put(to, inDegree.get(to) + 1);
                    }
                    break;
                }
            }
        }

        Queue<Character> q = new LinkedList<>();
        for (char c : inDegree.keySet()) if (inDegree.get(c) == 0) q.offer(c);

        StringBuilder sb = new StringBuilder();
        while (!q.isEmpty()) {
            char c = q.poll();
            sb.append(c);
            for (char nei : adj.get(c)) {
                inDegree.put(nei, inDegree.get(nei) - 1);
                if (inDegree.get(nei) == 0) q.offer(nei);
            }
        }
        return sb.length() == inDegree.size() ? sb.toString() : "";
    }
}
```

---

## 14. Graph Valid Tree

### Problem Statement
Given `n` nodes and a list of undirected edges, determine if the edges form a **valid tree** (connected + acyclic → exactly n-1 edges).

### Test Cases
```
Input:  n=5, edges=[[0,1],[0,2],[0,3],[1,4]]
Output: true

Input:  n=5, edges=[[0,1],[1,2],[2,3],[1,3],[1,4]]
Output: false  // cycle
```

### Intuition
A valid tree has two properties: (1) **no cycle** and (2) **fully connected**. With Union-Find, detecting a cycle is trivial. We can also quick-fail: a tree on n nodes has exactly n-1 edges.

### Why Union-Find?
Elegant two-check solution: wrong edge count → early return. Otherwise, union edges and detect cycles simultaneously.

### Approach
1. If `edges.length != n - 1`, return false immediately.
2. Union-Find: if any edge connects already-connected nodes → cycle → false.
3. Otherwise true.

**Time:** O(n · α(n)) | **Space:** O(n)

### Java Code
```java
class Solution {
    int[] parent, rank;

    public boolean validTree(int n, int[][] edges) {
        if (edges.length != n - 1) return false;
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;

        for (int[] edge : edges) {
            if (find(edge[0]) == find(edge[1])) return false;
            union(edge[0], edge[1]);
        }
        return true;
    }

    private int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    private void union(int x, int y) {
        int px = find(x), py = find(y);
        if (rank[px] >= rank[py]) parent[py] = px;
        else parent[px] = py;
        if (rank[px] == rank[py]) rank[px]++;
    }
}
```

---

## 15. Swim in Rising Water

### Problem Statement
In an `n x n` grid, `grid[i][j]` is the elevation. At time `t`, you can swim to adjacent squares where elevation ≤ `t`. Find the **minimum time** to swim from `(0,0)` to `(n-1, n-1)`.

### Test Cases
```
Input:  grid = [[0,2],[1,3]]
Output: 3

Input:  grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]
Output: 16
```

### Intuition
We want to find a path from top-left to bottom-right that **minimizes the maximum elevation** encountered (since we must wait until time = max elevation along our path). This is a **minimax path problem**.

### Why Dijkstra (Modified)?
Treat the "cost" of reaching a cell as `max(cost_so_far, grid[r][c])`. Use a min-heap to always expand the cell with the lowest max-elevation seen. First time we reach `(n-1, n-1)` is our answer.

### Approach
1. Min-heap stores `(max_elevation, row, col)`.
2. Start with `(grid[0][0], 0, 0)`.
3. Expand neighbors: `newCost = max(curr_cost, grid[nr][nc])`.
4. Return cost when destination reached.

**Time:** O(n² log n) | **Space:** O(n²)

### Java Code
```java
class Solution {
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        int[][] dist = new int[n][n];
        for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);
        dist[0][0] = grid[0][0];

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
        pq.offer(new int[]{grid[0][0], 0, 0});

        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};

        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int cost = curr[0], r = curr[1], c = curr[2];
            if (cost > dist[r][c]) continue;
            if (r == n-1 && c == n-1) return cost;

            for (int[] d : dirs) {
                int nr = r+d[0], nc = c+d[1];
                if (nr >= 0 && nc >= 0 && nr < n && nc < n) {
                    int newCost = Math.max(cost, grid[nr][nc]);
                    if (newCost < dist[nr][nc]) {
                        dist[nr][nc] = newCost;
                        pq.offer(new int[]{newCost, nr, nc});
                    }
                }
            }
        }
        return -1;
    }
}
```

---

## Pattern Recognition Summary

```
Problem Type                        → Algorithm
────────────────────────────────────────────────────
Count connected regions (grid)      → DFS/BFS flood fill
Deep copy with cycles               → DFS + HashMap
Has cycle? (directed)               → DFS 3-color OR Kahn's
Topological ordering                → Kahn's BFS (in-degree)
Count components / detect cycle     → Union-Find
Reach from multiple sources         → Multi-source BFS
Shortest path (unweighted)          → BFS
Shortest path (weighted, ≥ 0)       → Dijkstra (min-heap)
Shortest path (K hops limit)        → Bellman-Ford (K rounds)
Extra edge in tree                  → Union-Find
Character/dependency ordering       → Topological Sort
Valid tree check                    → edges==n-1 + Union-Find
Minimax path                        → Modified Dijkstra
```

---

*Master these 15 problems and you will confidently handle 95%+ of graph questions in technical interviews.*