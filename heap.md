# Heap Pattern — 10 Problems Covering 95% of Interview Questions

## What is a Heap?

A **Heap** is a complete binary tree stored as an array where:
- **Min-Heap**: Every parent ≤ its children → root is always the minimum.
- **Max-Heap**: Every parent ≥ its children → root is always the maximum.

Java's `PriorityQueue` is a **min-heap** by default. Use `Collections.reverseOrder()` or a custom comparator for a max-heap.

**Core operations:**
| Operation | Time Complexity |
|-----------|----------------|
| Insert    | O(log n)        |
| Delete    | O(log n)        |
| Peek      | O(1)            |
| Heapify   | O(n)            |

---

## Why Use a Heap?

Use a heap whenever you need **repeated access to the smallest or largest element** from a dynamic set. Classic signals:
- "Find the K largest / K smallest"
- "Median from a data stream"
- "Merge K sorted lists"
- "Shortest path / minimum cost"
- "Top K frequent"

---

## Problem 1 — Kth Largest Element in an Array

### Problem Statement
Given an integer array `nums` and an integer `k`, return the **kth largest element**.

**Example:**
```
Input:  nums = [3, 2, 1, 5, 6, 4], k = 2
Output: 5
```

### Intuition
We don't need to sort everything. We only care about the top `k` elements. A **min-heap of size k** keeps exactly the k largest elements seen so far — the root is the kth largest.

### Why Min-Heap and Not Max-Heap?
- A max-heap would give you the largest, but you'd need to pop k times → O(k log n).
- A min-heap of size k lets you answer in O(1) after O(n log k) build time. The root is always the smallest of the top-k, i.e., the kth largest.

### Approach
1. Add elements into a min-heap.
2. If heap size exceeds k, remove the minimum (it can never be the kth largest).
3. After processing all elements, the heap root is the answer.

**Time:** O(n log k) | **Space:** O(k)

### Java Code
```java
import java.util.PriorityQueue;

class KthLargest {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>(); // min-heap by default

        for (int num : nums) {
            minHeap.offer(num);
            if (minHeap.size() > k) {
                minHeap.poll(); // remove smallest — it's outside top-k
            }
        }

        return minHeap.peek(); // root = kth largest
    }
}
```

### Test Cases
```
nums = [3,2,1,5,6,4], k=2  → 5
nums = [3,2,3,1,2,4,5,5,6], k=4 → 4
nums = [1], k=1 → 1
nums = [-1,-2,-3], k=2 → -2
```

---

## Problem 2 — Top K Frequent Elements

### Problem Statement
Given an integer array `nums` and integer `k`, return the `k` most frequent elements.

**Example:**
```
Input:  nums = [1,1,1,2,2,3], k = 2
Output: [1, 2]
```

### Intuition
Count frequencies with a HashMap, then find the top-k by frequency. Instead of sorting all frequencies (O(n log n)), use a **min-heap of size k keyed on frequency** to find the k most frequent in O(n log k).

### Why Min-Heap?
Same trick as Problem 1: maintain the k "winners" by frequency. The heap root is always the least frequent among the top-k — if a new element has a higher frequency, evict the root.

### Approach
1. Build a frequency map.
2. Push `[frequency, element]` pairs into a min-heap (keyed by frequency).
3. If size > k, pop the minimum frequency element.
4. Remaining heap elements are the answer.

**Time:** O(n log k) | **Space:** O(n)

### Java Code
```java
import java.util.*;

class TopKFrequent {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int num : nums) freq.merge(num, 1, Integer::sum);

        // Min-heap ordered by frequency
        PriorityQueue<int[]> minHeap = new PriorityQueue<>(
            (a, b) -> a[0] - b[0]
        );

        for (Map.Entry<Integer, Integer> entry : freq.entrySet()) {
            minHeap.offer(new int[]{entry.getValue(), entry.getKey()});
            if (minHeap.size() > k) minHeap.poll();
        }

        int[] result = new int[k];
        for (int i = k - 1; i >= 0; i--) {
            result[i] = minHeap.poll()[1];
        }
        return result;
    }
}
```

### Test Cases
```
nums=[1,1,1,2,2,3], k=2 → [1,2]
nums=[1], k=1 → [1]
nums=[1,2], k=2 → [1,2]
nums=[4,1,1,2,2,3], k=2 → [1,2]
```

---

## Problem 3 — Merge K Sorted Lists

### Problem Statement
Merge `k` sorted linked lists into one sorted list and return it.

**Example:**
```
Input:  lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
```

### Intuition
At every step, you need the **minimum among k candidates** (the current head of each list). A min-heap gives you that minimum in O(log k) instead of O(k).

### Why Min-Heap?
Without a heap, finding the minimum across k list heads takes O(k) per step → O(nk) total. With a min-heap storing one node per list, extraction is O(log k) → O(n log k) total.

### Approach
1. Push the head of every non-null list into a min-heap (keyed by node value).
2. Poll the minimum, append it to the result, push its `next` node (if any).
3. Repeat until heap is empty.

**Time:** O(n log k) where n = total nodes | **Space:** O(k)

### Java Code
```java
import java.util.PriorityQueue;

class ListNode {
    int val; ListNode next;
    ListNode(int val) { this.val = val; }
}

class MergeKLists {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> minHeap = new PriorityQueue<>(
            (a, b) -> a.val - b.val
        );

        for (ListNode node : lists) {
            if (node != null) minHeap.offer(node);
        }

        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;

        while (!minHeap.isEmpty()) {
            ListNode smallest = minHeap.poll();
            curr.next = smallest;
            curr = curr.next;
            if (smallest.next != null) minHeap.offer(smallest.next);
        }

        return dummy.next;
    }
}
```

### Test Cases
```
lists = [[1,4,5],[1,3,4],[2,6]] → [1,1,2,3,4,4,5,6]
lists = []                       → []
lists = [[]]                     → []
lists = [[1],[0]]                → [0,1]
```

---

## Problem 4 — Find Median from Data Stream

### Problem Statement
Design a data structure that supports:
- `addNum(int num)` — adds a number.
- `findMedian()` — returns the median of all elements added so far.

**Example:**
```
addNum(1), addNum(2) → findMedian() = 1.5
addNum(3)            → findMedian() = 2.0
```

### Intuition
The median is the **middle element**. If we split data into two halves:
- The **lower half** in a max-heap → root = largest of the small numbers.
- The **upper half** in a min-heap → root = smallest of the large numbers.

The median is either the root of one (odd count) or the average of both roots (even count).

### Why Two Heaps?
- Sorted array median = O(1) but insert = O(n).
- Two heaps give O(log n) insert and O(1) median — best of both worlds.

### Approach
1. Keep `maxHeap` (lower half) and `minHeap` (upper half).
2. Always push to `maxHeap` first, then rebalance by moving its root to `minHeap`.
3. If `minHeap` grows larger, move its root back to `maxHeap`.
4. Median = `maxHeap.peek()` (odd) or average of both roots (even).

**Time:** O(log n) per add, O(1) per findMedian | **Space:** O(n)

### Java Code
```java
import java.util.*;

class MedianFinder {
    private final PriorityQueue<Integer> maxHeap; // lower half
    private final PriorityQueue<Integer> minHeap; // upper half

    public MedianFinder() {
        maxHeap = new PriorityQueue<>(Collections.reverseOrder());
        minHeap = new PriorityQueue<>();
    }

    public void addNum(int num) {
        maxHeap.offer(num);
        minHeap.offer(maxHeap.poll()); // balance: push max of lower to upper

        if (minHeap.size() > maxHeap.size()) {
            maxHeap.offer(minHeap.poll()); // keep lower half >= upper half in size
        }
    }

    public double findMedian() {
        if (maxHeap.size() > minHeap.size()) return maxHeap.peek();
        return (maxHeap.peek() + minHeap.peek()) / 2.0;
    }
}
```

### Test Cases
```
[1,2] → 1.5
[1,2,3] → 2.0
[1] → 1.0
[6,5,4] → 5.0
[2,3,4,5] → 3.5
```

---

## Problem 5 — Task Scheduler

### Problem Statement
Given a list of CPU tasks and a cooldown `n`, return the minimum number of intervals needed to finish all tasks. Between the same task, there must be at least `n` intervals.

**Example:**
```
Input:  tasks = ['A','A','A','B','B','B'], n = 2
Output: 8   →  A → B → idle → A → B → idle → A → B
```

### Intuition
Always execute the **most frequent remaining task** to avoid wasting idle time. A **max-heap** by frequency lets us greedily pick the best task each round.

### Why Max-Heap + Queue?
- The max-heap gives the most frequent available task.
- A queue holds tasks in cooldown (with their release time), and we re-add them to the heap when ready.

### Approach
1. Count task frequencies, push into a max-heap.
2. Use a queue of `[remaining_count, available_at_time]`.
3. Each tick: pop from heap if available, decrement count, push to queue with `available_at = time + n + 1`.
4. Re-add expired queue tasks to heap before each tick.

**Time:** O(T log 26) ≈ O(T) | **Space:** O(26) = O(1)

### Java Code
```java
import java.util.*;

class TaskScheduler {
    public int leastInterval(char[] tasks, int n) {
        int[] freq = new int[26];
        for (char t : tasks) freq[t - 'A']++;

        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
        for (int f : freq) if (f > 0) maxHeap.offer(f);

        // Queue holds [remaining_count, time_available_again]
        Queue<int[]> cooldown = new LinkedList<>();
        int time = 0;

        while (!maxHeap.isEmpty() || !cooldown.isEmpty()) {
            time++;

            // Re-add tasks whose cooldown has expired
            if (!cooldown.isEmpty() && cooldown.peek()[1] == time) {
                maxHeap.offer(cooldown.poll()[0]);
            }

            if (!maxHeap.isEmpty()) {
                int remaining = maxHeap.poll() - 1;
                if (remaining > 0) {
                    cooldown.offer(new int[]{remaining, time + n + 1});
                }
            }
            // else: idle tick
        }

        return time;
    }
}
```

### Test Cases
```
tasks=['A','A','A','B','B','B'], n=2 → 8
tasks=['A','A','A','B','B','B'], n=0 → 6
tasks=['A','A','A','A','A','A','B','C','D','E','F','G'], n=2 → 16
tasks=['A'], n=0 → 1
```

---

## Problem 6 — K Closest Points to Origin

### Problem Statement
Given an array of points on a 2D plane and integer `k`, return the `k` closest points to the origin `(0, 0)`.

**Example:**
```
Input:  points = [[1,3],[-2,2]], k = 1
Output: [[-2,2]]
  (distances: √10 vs √8 → [-2,2] is closer)
```

### Intuition
We need the k smallest distances. A **max-heap of size k** keyed on distance keeps the k closest — if a new point is closer than the farthest in the heap, swap it in.

### Why Max-Heap?
With a max-heap of size k, the root is the farthest among our current k-best. If the new point is closer than the root, evict the root and insert the new point. At the end, the heap contains exactly the k closest points.

### Approach
1. Push each point onto a max-heap keyed by distance squared (avoid sqrt for performance).
2. If heap size > k, poll the farthest point.
3. Return remaining points.

**Time:** O(n log k) | **Space:** O(k)

### Java Code
```java
import java.util.PriorityQueue;

class KClosestPoints {
    public int[][] kClosest(int[][] points, int k) {
        // Max-heap: largest distance at root
        PriorityQueue<int[]> maxHeap = new PriorityQueue<>(
            (a, b) -> (b[0]*b[0] + b[1]*b[1]) - (a[0]*a[0] + a[1]*a[1])
        );

        for (int[] point : points) {
            maxHeap.offer(point);
            if (maxHeap.size() > k) maxHeap.poll(); // remove farthest
        }

        return maxHeap.toArray(new int[k][]);
    }
}
```

### Test Cases
```
points=[[1,3],[-2,2]], k=1 → [[-2,2]]
points=[[3,3],[5,-1],[-2,4]], k=2 → [[3,3],[-2,4]]
points=[[0,1],[1,0]], k=2 → [[0,1],[1,0]]
points=[[1,1],[10,10],[2,2]], k=1 → [[1,1]]
```

---

## Problem 7 — Reorganize String

### Problem Statement
Given a string `s`, rearrange its characters so no two adjacent characters are the same. Return any valid arrangement, or `""` if impossible.

**Example:**
```
Input:  s = "aab"
Output: "aba"

Input:  s = "aaab"
Output: ""
```

### Intuition
Greedily place the **most frequent remaining character** that is not the same as the last placed character. A max-heap gives the most frequent character at each step.

### Why Max-Heap?
If we always pick the most frequent character (that's allowed), we minimize the chance of getting stuck. This greedy choice is provably optimal — the only way a valid arrangement doesn't exist is if one character's count > ⌈n/2⌉.

### Approach
1. Count frequencies, push `[frequency, char]` into max-heap.
2. Maintain `prev` (the character placed last step with its remaining count).
3. Each step: pop from heap, place it, push `prev` back to heap (if count > 0).
4. If heap is empty and `prev` still has count, return `""`.

**Time:** O(n log 26) = O(n) | **Space:** O(n)

### Java Code
```java
import java.util.*;

class ReorganizeString {
    public String reorganizeString(String s) {
        int[] freq = new int[26];
        for (char c : s.toCharArray()) freq[c - 'a']++;

        // Max-heap: [frequency, character]
        PriorityQueue<int[]> maxHeap = new PriorityQueue<>(
            (a, b) -> b[0] - a[0]
        );
        for (int i = 0; i < 26; i++) {
            if (freq[i] > 0) maxHeap.offer(new int[]{freq[i], i});
        }

        StringBuilder sb = new StringBuilder();
        int[] prev = null; // held out from last round

        while (!maxHeap.isEmpty()) {
            int[] curr = maxHeap.poll();
            sb.append((char) ('a' + curr[1]));
            curr[0]--;

            if (prev != null) {
                maxHeap.offer(prev);
                prev = null;
            }

            if (curr[0] > 0) prev = curr;
        }

        if (prev != null) return ""; // leftover with count > 0 means impossible
        return sb.toString();
    }
}
```

### Test Cases
```
"aab"  → "aba"
"aaab" → ""
"vvvlo" → "vlvov" (or any valid)
"a"    → "a"
"ab"   → "ab" or "ba"
```

---

## Problem 8 — Dijkstra's Shortest Path

### Problem Statement
Given a weighted directed graph with `n` nodes and edges list, find the shortest path from `source` to all other nodes.

**Example:**
```
Input:  n=5, edges=[[0,1,4],[0,2,1],[2,1,2],[1,3,1],[2,3,5]], source=0
Output: dist = [0, 3, 1, 4, INF]
```

### Intuition
At each step, expand the **unvisited node with the smallest known distance**. A min-heap replaces a linear scan and brings complexity from O(V²) down to O((V + E) log V).

### Why Min-Heap?
The heap efficiently answers "which unprocessed node is currently closest?" Every time we relax an edge, we push the updated distance into the heap — the stale entries are simply ignored when popped (they'll have a greater distance than the already-settled value).

### Approach
1. Initialize `dist[]` = ∞ for all, `dist[source]` = 0.
2. Push `[0, source]` into min-heap.
3. While heap not empty: pop `[d, u]`. If `d > dist[u]`, skip (stale). Otherwise, relax all neighbors.
4. Push updated neighbor distances into heap.

**Time:** O((V + E) log V) | **Space:** O(V + E)

### Java Code
```java
import java.util.*;

class Dijkstra {
    public int[] shortestPath(int n, int[][] edges, int source) {
        // Build adjacency list
        List<int[]>[] graph = new List[n];
        for (int i = 0; i < n; i++) graph[i] = new ArrayList<>();
        for (int[] e : edges) {
            graph[e[0]].add(new int[]{e[1], e[2]});
        }

        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[source] = 0;

        // Min-heap: [distance, node]
        PriorityQueue<int[]> minHeap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        minHeap.offer(new int[]{0, source});

        while (!minHeap.isEmpty()) {
            int[] curr = minHeap.poll();
            int d = curr[0], u = curr[1];

            if (d > dist[u]) continue; // stale entry

            for (int[] neighbor : graph[u]) {
                int v = neighbor[0], w = neighbor[1];
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    minHeap.offer(new int[]{dist[v], v});
                }
            }
        }

        return dist;
    }
}
```

### Test Cases
```
n=5, edges=[[0,1,4],[0,2,1],[2,1,2],[1,3,1],[2,3,5]], src=0
→ [0, 3, 1, 4, MAX_VALUE]

n=1, edges=[], src=0 → [0]

n=3, edges=[[0,1,1],[1,2,1],[0,2,10]], src=0 → [0, 1, 2]
```

---

## Problem 9 — Minimum Cost to Connect Ropes (Huffman-style)

### Problem Statement
Given `n` ropes of various lengths, connect them into one rope. The cost of connecting two ropes equals their sum. Find the minimum total cost.

**Example:**
```
Input:  ropes = [4, 3, 2, 6]
Output: 29
  Connect 2+3=5 (cost 5), then 4+5=9 (cost 9), then 9+6=15 (cost 15) → total=29
```

### Intuition
To minimize total cost, always merge the **two smallest ropes** first (they get added to the total the most times). This is the Huffman encoding greedy strategy.

### Why Min-Heap?
The min-heap gives the two smallest ropes in O(log n) each time. Sorting once is O(n log n) but then extracting and re-inserting is hard. A heap handles dynamic updates naturally.

### Approach
1. Push all ropes into a min-heap.
2. While heap size > 1: pop two smallest, add their sum to cost, push the sum back.
3. Return total cost.

**Time:** O(n log n) | **Space:** O(n)

### Java Code
```java
import java.util.PriorityQueue;

class MinCostRopes {
    public long minCost(int[] ropes) {
        PriorityQueue<Long> minHeap = new PriorityQueue<>();
        for (int r : ropes) minHeap.offer((long) r);

        long totalCost = 0;

        while (minHeap.size() > 1) {
            long first = minHeap.poll();
            long second = minHeap.poll();
            long combined = first + second;
            totalCost += combined;
            minHeap.offer(combined);
        }

        return totalCost;
    }
}
```

### Test Cases
```
ropes=[4,3,2,6]   → 29
ropes=[1,2,3,4,5] → 33
ropes=[5]         → 0
ropes=[1,1]       → 2
ropes=[20,4,8,2]  → 54
```

---

## Problem 10 — Find K Pairs with Smallest Sums

### Problem Statement
Given two sorted arrays `nums1` and `nums2`, return the `k` pairs `(u, v)` with the smallest sums, where `u` is from `nums1` and `v` is from `nums2`.

**Example:**
```
Input:  nums1=[1,7,11], nums2=[2,4,6], k=3
Output: [[1,2],[1,4],[1,6]]
```

### Intuition
The smallest sum pair is always `(nums1[0], nums2[0])`. After picking `(i, j)`, the next candidates are `(i+1, j)` and `(i, j+1)`. This is like merging k sorted virtual lists — use a min-heap to always expand the best candidate next.

### Why Min-Heap?
Since both arrays are sorted, we don't enumerate all n×m pairs. Instead, the heap stores `[sum, i, j]` and we expand only frontier candidates, achieving O(k log k).

### Approach
1. Seed heap with `(nums1[i], nums2[0])` for each `i` in `[0, min(k, m))`.
2. Poll minimum pair, add to result.
3. Push `(i, j+1)` if `j+1 < nums2.length`.
4. Repeat k times.

**Time:** O(k log k) | **Space:** O(k)

### Java Code
```java
import java.util.*;

class KSmallestPairs {
    public List<List<Integer>> kSmallestPairs(int[] nums1, int[] nums2, int k) {
        List<List<Integer>> result = new ArrayList<>();
        if (nums1.length == 0 || nums2.length == 0) return result;

        // Min-heap: [sum, i (index in nums1), j (index in nums2)]
        PriorityQueue<int[]> minHeap = new PriorityQueue<>(
            (a, b) -> a[0] - b[0]
        );

        // Seed with (nums1[i], nums2[0]) for all i
        for (int i = 0; i < Math.min(k, nums1.length); i++) {
            minHeap.offer(new int[]{nums1[i] + nums2[0], i, 0});
        }

        while (!minHeap.isEmpty() && result.size() < k) {
            int[] curr = minHeap.poll();
            int i = curr[1], j = curr[2];

            result.add(Arrays.asList(nums1[i], nums2[j]));

            if (j + 1 < nums2.length) {
                minHeap.offer(new int[]{nums1[i] + nums2[j + 1], i, j + 1});
            }
        }

        return result;
    }
}
```

### Test Cases
```
nums1=[1,7,11], nums2=[2,4,6], k=3 → [[1,2],[1,4],[1,6]]
nums1=[1,1,2], nums2=[1,2,3], k=2 → [[1,1],[1,1]]
nums1=[1,2], nums2=[3], k=3        → [[1,3],[2,3]]
nums1=[], nums2=[1], k=1           → []
```

---

## Summary Cheat Sheet

| Problem | Heap Type | Size | Key Insight |
|---|---|---|---|
| Kth Largest Element | Min-Heap | k | Root = kth largest |
| Top K Frequent | Min-Heap (by freq) | k | Root = least freq of top-k |
| Merge K Sorted Lists | Min-Heap | k | Always pick minimum head |
| Median from Stream | Max-Heap + Min-Heap | n/2 each | Two halves, balanced |
| Task Scheduler | Max-Heap + Queue | varies | Greedily pick most frequent |
| K Closest Points | Max-Heap | k | Root = farthest of k-best |
| Reorganize String | Max-Heap | 26 | Greedy: place most frequent |
| Dijkstra's SSSP | Min-Heap | V | Expand nearest unvisited |
| Min Cost Ropes | Min-Heap | n | Always merge two smallest |
| K Smallest Pairs | Min-Heap | k | Expand frontier candidates |

## Pattern Recognition Guide

```
Need K largest?      → Min-Heap of size K
Need K smallest?     → Max-Heap of size K
Need Kth element?    → Heap of size K, check root
Need median?         → Two heaps (max + min)
Need shortest path?  → Min-Heap (Dijkstra)
Need minimum merge?  → Min-Heap (greedy combine)
Need top-K frequent? → HashMap + Min-Heap of size K
Multiple sorted seqs?→ Min-Heap seeded with first element of each
```