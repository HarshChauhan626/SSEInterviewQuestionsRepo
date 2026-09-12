# Queue & Deque: 10 Problems Covering 95% of Interview Patterns

> Covers: Simple Queue, Circular Queue, Deque (Double-Ended Queue), Monotonic Queue, BFS with Queue, Sliding Window with Deque, Priority Queue patterns.

---

## Table of Contents
| # | Problem | Difficulty | Jump to Solution |
|---|---------|:----------:|-----------------|
| 1 | Sliding Window Maximum | 🔴 Hard | [→ #1](#sliding-window-maximum) |
| 2 | First Non-Repeating Character in Stream | 🟡 Medium | [→ #2](#first-non-repeating-character-in-stream) |
| 3 | BFS – Shortest Path in Binary Matrix | 🟡 Medium | [→ #3](#bfs--shortest-path-in-binary-matrix) |
| 4 | Design Circular Queue | 🟡 Medium | [→ #4](#design-circular-queue) |
| 5 | Rotten Oranges – Multi-Source BFS | 🟡 Medium | [→ #5](#rotten-oranges--multi-source-bfs) |
| 6 | Design Hit Counter | 🟡 Medium | [→ #6](#design-hit-counter) |
| 7 | Largest Rectangle in Histogram | 🔴 Hard | [→ #7](#largest-rectangle-in-histogram) |
| 8 | Sliding Window Minimum with Deque | 🟡 Medium | [→ #8](#sliding-window-minimum-with-deque) |
| 9 | Task Scheduler | 🟡 Medium | [→ #9](#task-scheduler) |
| 10 | Design Snake Game | 🟡 Medium | [→ #10](#design-snake-game) |

---

## Problem Patterns at a Glance

| # | Problem | Pattern | Data Structure |
|---|---------|---------|----------------|
| 1 | Sliding Window Maximum | Monotonic Decreasing Deque | Deque |
| 2 | First Non-Repeating in Stream | FIFO + Frequency Map | Queue + HashMap |
| 3 | Shortest Path Binary Matrix | BFS | Queue |
| 4 | Design Circular Queue | Circular Buffer | Array + Pointers |
| 5 | Rotten Oranges | Multi-Source BFS | Queue |
| 6 | Hit Counter | Sliding Window | Queue |
| 7 | Largest Rectangle | Monotonic Stack (Queue intuition) | Deque/Stack |
| 8 | Sliding Window Minimum | Monotonic Increasing Deque | Deque |
| 9 | Task Scheduler | Greedy Cooldown | Queue + Array |
| 10 | Snake Game | Body Tracking | Deque |

---

<a id="sliding-window-maximum"></a>
## 1. Sliding Window Maximum

### Problem Statement
Given an integer array `nums` and a sliding window of size `k`, return the maximum value in each window as it slides from left to right.

**Example:**
```
Input:  nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3
Output: [3, 3, 5, 5, 6, 7]
```

### Intuition
A brute-force approach checks all k elements per window — O(nk). The key insight: **we never need an element that is smaller AND older than a new element**. If a new element is larger, all previous smaller elements can never be the maximum for any future window — they're useless. This gives us a **monotonic decreasing deque** (front = current max).

### Why Deque?
- We need to **add to the back** (new elements).
- We need to **remove from the front** (elements that slid out of window).
- We need to **remove from the back** (elements smaller than current — they're dominated).
Only a **Deque** supports O(1) operations on both ends.

### Approach
1. Use a deque storing **indices** (not values).
2. For each new element at index `i`:
   - Remove from **front** if that index is outside the window (`i - k`).
   - Remove from **back** while `nums[deque.back()] <= nums[i]` (maintain decreasing order).
   - Add `i` to the back.
   - Front of deque is always the index of the maximum.

### Complexity
- Time: O(n) — each element added and removed at most once.
- Space: O(k) — deque holds at most k elements.

### Java Code
```java
import java.util.*;

public class SlidingWindowMaximum {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        Deque<Integer> deque = new ArrayDeque<>(); // stores indices

        for (int i = 0; i < n; i++) {
            // Remove elements outside the window from front
            while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
                deque.pollFirst();
            }
            // Remove smaller elements from back (they can never be max)
            while (!deque.isEmpty() && nums[deque.peekLast()] <= nums[i]) {
                deque.pollLast();
            }
            deque.offerLast(i);

            // Start recording results once first window is complete
            if (i >= k - 1) {
                result[i - k + 1] = nums[deque.peekFirst()];
            }
        }
        return result;
    }

    // Test
    public static void main(String[] args) {
        SlidingWindowMaximum sol = new SlidingWindowMaximum();

        // Test 1
        System.out.println(Arrays.toString(sol.maxSlidingWindow(new int[]{1,3,-1,-3,5,3,6,7}, 3)));
        // Expected: [3, 3, 5, 5, 6, 7]

        // Test 2: k=1 (max is every element)
        System.out.println(Arrays.toString(sol.maxSlidingWindow(new int[]{4,2,1}, 1)));
        // Expected: [4, 2, 1]

        // Test 3: k = array length
        System.out.println(Arrays.toString(sol.maxSlidingWindow(new int[]{1,3,1,2,0,5}, 6)));
        // Expected: [5]

        // Test 4: all same
        System.out.println(Arrays.toString(sol.maxSlidingWindow(new int[]{2,2,2,2}, 2)));
        // Expected: [2, 2, 2]
    }
}
```

### Test Cases
| Input | k | Expected Output |
|-------|---|-----------------|
| [1,3,-1,-3,5,3,6,7] | 3 | [3,3,5,5,6,7] |
| [4,2,1] | 1 | [4,2,1] |
| [1,3,1,2,0,5] | 6 | [5] |
| [2,2,2,2] | 2 | [2,2,2] |
| [-7,-8,7,5,7,1,6,0] | 4 | [7,7,7,7,7] |

---

<a id="first-non-repeating-character-in-stream"></a>
## 2. First Non-Repeating Character in Stream

### Problem Statement
Given a stream of characters, find the first non-repeating character at each point in the stream.

**Example:**
```
Input:  stream = "aabcbc"
Output: "a#bbcc"
  (after 'a'→'a', after 'aa'→'#', after 'aab'→'b', ...)
```

### Intuition
We need to know both **frequency** (is it repeating?) and **order** (which came first among non-repeating ones?). A HashMap gives frequency; a Queue gives FIFO order. Together: peek at the front of the queue, and if that character has frequency > 1, remove it — it's now repeating.

### Why Queue?
- The first non-repeating character is always the **oldest** valid character.
- A FIFO Queue naturally maintains insertion order.
- We never need random access or reversal.

### Approach
1. Maintain a `Queue<Character>` and `Map<Character, Integer>` for frequency.
2. For each character in stream:
   - Increment frequency in map.
   - Add character to queue.
   - Clean front of queue: poll characters with frequency > 1 (they became repeating).
   - Answer = front of queue, or `#` if queue is empty.

### Complexity
- Time: O(26n) ≈ O(n) — each character enqueued/dequeued at most once.
- Space: O(26) = O(1) for the queue (at most 26 distinct chars).

### Java Code
```java
import java.util.*;

public class FirstNonRepeatingInStream {
    public String firstNonRepeating(String stream) {
        Queue<Character> queue = new LinkedList<>();
        Map<Character, Integer> freq = new HashMap<>();
        StringBuilder result = new StringBuilder();

        for (char c : stream.toCharArray()) {
            // Update frequency
            freq.merge(c, 1, Integer::sum);
            // Add to queue
            queue.offer(c);
            // Clean the front — remove characters that became repeating
            while (!queue.isEmpty() && freq.get(queue.peek()) > 1) {
                queue.poll();
            }
            result.append(queue.isEmpty() ? '#' : queue.peek());
        }
        return result.toString();
    }

    public static void main(String[] args) {
        FirstNonRepeatingInStream sol = new FirstNonRepeatingInStream();

        System.out.println(sol.firstNonRepeating("aabcbc")); // a#bbcc
        System.out.println(sol.firstNonRepeating("aabc"));   // aa#bb → a#bb? 
        // 'a'→a, 'aa'→#, 'aab'→b, 'aabc'→b  => "a#bb"
        System.out.println(sol.firstNonRepeating("abcabc")); // aaabc → "aabbcc"? 
        // a,b,c,a→b,b→c,c→# => "abcbc#"
        System.out.println(sol.firstNonRepeating("zz"));     // z#
        System.out.println(sol.firstNonRepeating("a"));      // a
    }
}
```

### Test Cases
| Stream | Expected Output |
|--------|-----------------|
| "aabcbc" | "a#bbcc" |
| "aabc" | "a#bb" |
| "abcabc" | "abcbc#" |
| "zz" | "z#" |
| "a" | "a" |

---

<a id="bfs--shortest-path-in-binary-matrix"></a>
## 3. BFS – Shortest Path in Binary Matrix

### Problem Statement
Given an `n x n` binary matrix, find the length of the shortest clear path from top-left `(0,0)` to bottom-right `(n-1, n-1)`. A clear path only passes through cells with value `0`. You can move in 8 directions.

Return `-1` if no such path exists.

**Example:**
```
Input:
[[0,0,0],
 [1,1,0],
 [1,1,0]]
Output: 4
```

### Intuition
BFS guarantees shortest path in an **unweighted graph**. Each cell is a node, each valid neighbor is an edge. BFS explores level by level, so the first time we reach the destination, we have the shortest path. This is the **most important queue pattern** — BFS.

### Why Queue?
- BFS requires FIFO order: explore all cells at distance `d` before any at distance `d+1`.
- A Queue naturally gives this level-by-level guarantee.
- DFS would find *a* path but not necessarily the *shortest* one.

### Approach
1. Start from `(0,0)`, add to queue with distance 1.
2. Mark visited by setting cell to 1.
3. For each cell dequeued, explore all 8 neighbors.
4. If neighbor is `(n-1, n-1)`, return current distance + 1.
5. If queue empties without reaching target, return -1.

### Complexity
- Time: O(n²) — each cell visited at most once.
- Space: O(n²) — queue can hold all cells.

### Java Code
```java
import java.util.*;

public class ShortestPathBinaryMatrix {
    public int shortestPathBinaryMatrix(int[][] grid) {
        int n = grid.length;
        if (grid[0][0] == 1 || grid[n-1][n-1] == 1) return -1;
        if (n == 1) return 1;

        int[][] dirs = {{-1,-1},{-1,0},{-1,1},{0,-1},{0,1},{1,-1},{1,0},{1,1}};
        Queue<int[]> queue = new LinkedList<>();
        queue.offer(new int[]{0, 0, 1}); // row, col, distance
        grid[0][0] = 1; // mark visited

        while (!queue.isEmpty()) {
            int[] curr = queue.poll();
            int row = curr[0], col = curr[1], dist = curr[2];

            for (int[] d : dirs) {
                int nr = row + d[0], nc = col + d[1];
                if (nr < 0 || nr >= n || nc < 0 || nc >= n || grid[nr][nc] == 1) continue;

                if (nr == n-1 && nc == n-1) return dist + 1;

                grid[nr][nc] = 1; // mark visited
                queue.offer(new int[]{nr, nc, dist + 1});
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        ShortestPathBinaryMatrix sol = new ShortestPathBinaryMatrix();

        System.out.println(sol.shortestPathBinaryMatrix(new int[][]{{0,1},{1,0}}));            // 2
        System.out.println(sol.shortestPathBinaryMatrix(new int[][]{{0,0,0},{1,1,0},{1,1,0}})); // 4
        System.out.println(sol.shortestPathBinaryMatrix(new int[][]{{1,0,0},{1,1,0},{1,1,0}})); // -1
        System.out.println(sol.shortestPathBinaryMatrix(new int[][]{{0}}));                    // 1
    }
}
```

### Test Cases
| Grid | Expected |
|------|----------|
| [[0,1],[1,0]] | 2 |
| [[0,0,0],[1,1,0],[1,1,0]] | 4 |
| [[1,0,0],[1,1,0],[1,1,0]] | -1 (start blocked) |
| [[0]] | 1 |
| [[0,0],[0,0]] | 2 |

---

<a id="design-circular-queue"></a>
## 4. Design Circular Queue

### Problem Statement
Design a circular queue with fixed capacity supporting:
- `enQueue(val)` — Insert element. Return false if full.
- `deQueue()` — Remove front element. Return false if empty.
- `Front()` — Get front element. Return -1 if empty.
- `Rear()` — Get rear element. Return -1 if empty.
- `isEmpty()` / `isFull()`

### Intuition
A regular array-based queue wastes space — once front moves forward, those cells are lost. A **circular queue** reuses that space by wrapping indices around using modulo. This is the foundational data structure — understanding this is critical before using Java's built-in Queue.

### Why Circular Array?
- O(1) for all operations.
- Fixed memory, no wasted space.
- Foundation of ring buffers used in OS, networking, audio systems.

### Approach
- Maintain `head` (front index), `tail` (next empty slot), and `size` counter.
- `enQueue`: place at `tail`, increment `tail = (tail + 1) % capacity`.
- `deQueue`: advance `head = (head + 1) % capacity`.
- Full: `size == capacity`. Empty: `size == 0`.

### Complexity
- All operations: O(1) time, O(k) space.

### Java Code
```java
public class MyCircularQueue {
    private int[] data;
    private int head, tail, size, capacity;

    public MyCircularQueue(int k) {
        capacity = k;
        data = new int[k];
        head = 0;
        tail = 0;
        size = 0;
    }

    public boolean enQueue(int value) {
        if (isFull()) return false;
        data[tail] = value;
        tail = (tail + 1) % capacity;
        size++;
        return true;
    }

    public boolean deQueue() {
        if (isEmpty()) return false;
        head = (head + 1) % capacity;
        size--;
        return true;
    }

    public int Front() {
        return isEmpty() ? -1 : data[head];
    }

    public int Rear() {
        // tail points to NEXT empty slot, so last filled = (tail - 1 + capacity) % capacity
        return isEmpty() ? -1 : data[(tail - 1 + capacity) % capacity];
    }

    public boolean isEmpty() { return size == 0; }
    public boolean isFull()  { return size == capacity; }

    public static void main(String[] args) {
        MyCircularQueue q = new MyCircularQueue(3);
        System.out.println(q.enQueue(1)); // true
        System.out.println(q.enQueue(2)); // true
        System.out.println(q.enQueue(3)); // true
        System.out.println(q.enQueue(4)); // false — full
        System.out.println(q.Rear());     // 3
        System.out.println(q.isFull());   // true
        System.out.println(q.deQueue());  // true
        System.out.println(q.enQueue(4)); // true
        System.out.println(q.Rear());     // 4
        System.out.println(q.Front());    // 2
    }
}
```

### Test Cases
| Operations | Expected |
|------------|----------|
| enQueue(1,2,3) then isFull() | true |
| enQueue(4) when full | false |
| deQueue on empty | false |
| Rear after wrap-around | correct |
| Front after multiple deQueues | correct |

---

<a id="rotten-oranges--multi-source-bfs"></a>
## 5. Rotten Oranges – Multi-Source BFS

### Problem Statement
Given a grid where `0` = empty, `1` = fresh orange, `2` = rotten orange. Rotten oranges infect fresh neighbors (4-directional) every minute. Return the minimum minutes to rot all fresh oranges, or `-1` if impossible.

**Example:**
```
Input:
[[2,1,1],
 [1,1,0],
 [0,1,1]]
Output: 4
```

### Intuition
This is **multi-source BFS** — multiple starting points simultaneously. All rotten oranges start infecting at time 0. In BFS terms: enqueue all rotten oranges first, then expand level by level. Each BFS level = 1 minute. This is a critical pattern for problems like "spreading fire", "virus spread", "water rising".

### Why Multi-Source BFS?
- Single-source BFS from one rotten orange would be incorrect (there can be many).
- Adding all sources to the queue at the start simulates simultaneous spreading.
- BFS levels naturally track time without needing explicit timestamps.

### Approach
1. Enqueue all initially rotten oranges. Count fresh oranges.
2. BFS: for each level (minute), spread rot to fresh 4-directional neighbors.
3. Decrement fresh count each time a fresh orange rots.
4. After BFS: if `fresh == 0`, return minutes; else return -1.

### Complexity
- Time: O(m × n) — each cell processed once.
- Space: O(m × n) — queue size.

### Java Code
```java
import java.util.*;

public class RottingOranges {
    public int orangesRotting(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        Queue<int[]> queue = new LinkedList<>();
        int fresh = 0;

        // Step 1: Add all rotten oranges to queue, count fresh
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 2) queue.offer(new int[]{i, j});
                else if (grid[i][j] == 1) fresh++;
            }
        }

        if (fresh == 0) return 0; // already all rotten or empty

        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        int minutes = 0;

        // Step 2: BFS level by level
        while (!queue.isEmpty() && fresh > 0) {
            minutes++;
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                int[] curr = queue.poll();
                for (int[] d : dirs) {
                    int nr = curr[0] + d[0], nc = curr[1] + d[1];
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n || grid[nr][nc] != 1) continue;
                    grid[nr][nc] = 2;
                    fresh--;
                    queue.offer(new int[]{nr, nc});
                }
            }
        }
        return fresh == 0 ? minutes : -1;
    }

    public static void main(String[] args) {
        RottingOranges sol = new RottingOranges();

        System.out.println(sol.orangesRotting(new int[][]{{2,1,1},{1,1,0},{0,1,1}})); // 4
        System.out.println(sol.orangesRotting(new int[][]{{2,1,1},{0,1,1},{1,0,1}})); // -1
        System.out.println(sol.orangesRotting(new int[][]{{0,2}}));                   // 0
        System.out.println(sol.orangesRotting(new int[][]{{1}}));                     // -1
        System.out.println(sol.orangesRotting(new int[][]{{2,2},{1,1},{0,0},{2,0}})); // 1
    }
}
```

### Test Cases
| Grid | Expected |
|------|----------|
| [[2,1,1],[1,1,0],[0,1,1]] | 4 |
| [[2,1,1],[0,1,1],[1,0,1]] | -1 (isolated orange) |
| [[0,2]] | 0 (no fresh) |
| [[1]] | -1 (no rotten) |
| [[0,0],[0,0]] | 0 (no oranges) |

---

<a id="design-hit-counter"></a>
## 6. Design Hit Counter

### Problem Statement
Design a hit counter that counts hits in the last 5 minutes (300 seconds).

- `hit(timestamp)` — Record a hit.
- `getHits(timestamp)` — Return hits in `[timestamp - 299, timestamp]`.

Timestamps are in seconds and come in non-decreasing order.

### Intuition
We only care about hits within a 300-second sliding window. Old hits (outside the window) are irrelevant — we can **discard** them. A Queue in FIFO order naturally lets us pop old hits off the front when they expire. This is the **sliding window queue** pattern.

### Why Queue?
- We need to remove the **oldest** hits first when they expire → FIFO.
- We need to add new hits at the end → enqueue.
- No random access needed.

### Approach
1. Queue stores timestamps of hits.
2. On `hit(t)`: enqueue `t`.
3. On `getHits(t)`: remove all front elements where `t - front > 299`. Return queue size.

### Complexity
- Time: O(n) amortized per call (each timestamp enqueued/dequeued once).
- Space: O(n) for all timestamps in the window.

### Java Code
```java
import java.util.*;

public class HitCounter {
    private Queue<Integer> queue;

    public HitCounter() {
        queue = new LinkedList<>();
    }

    public void hit(int timestamp) {
        queue.offer(timestamp);
    }

    public int getHits(int timestamp) {
        // Remove hits outside the 300-second window
        while (!queue.isEmpty() && timestamp - queue.peek() >= 300) {
            queue.poll();
        }
        return queue.size();
    }

    public static void main(String[] args) {
        HitCounter counter = new HitCounter();

        counter.hit(1);
        counter.hit(2);
        counter.hit(3);
        System.out.println(counter.getHits(4));   // 3
        counter.hit(300);
        System.out.println(counter.getHits(300)); // 4
        System.out.println(counter.getHits(301)); // 3 (hit at t=1 expired)
        System.out.println(counter.getHits(600)); // 1 (only hit at t=300 remains)
        System.out.println(counter.getHits(601)); // 0
    }
}
```

### Test Cases
| Operations | Expected |
|------------|----------|
| hit(1,2,3), getHits(4) | 3 |
| hit(300), getHits(300) | 4 |
| getHits(301) | 3 |
| getHits(600) | 1 |
| getHits(601) | 0 |

---

<a id="largest-rectangle-in-histogram"></a>
## 7. Largest Rectangle in Histogram

### Problem Statement
Given an array `heights` representing histogram bar heights (width = 1 each), find the area of the largest rectangle.

**Example:**
```
Input:  heights = [2, 1, 5, 6, 2, 3]
Output: 10
```

### Intuition
For each bar, the largest rectangle it can form extends as far left and right as it can while remaining at least as tall as itself. We need the **next smaller element** on the left and right for each bar. A **Monotonic Increasing Stack/Deque** gives us this in O(n): whenever a shorter bar appears, all taller bars waiting in the stack now know their right boundary.

### Why Monotonic Stack (Deque intuition)?
- We process elements in order and need previous smaller elements quickly.
- Stack pops maintain the invariant: smaller bars can't use taller bars as extension.
- This is the deque pattern generalized — monotonic structure = O(n) instead of O(n²).

### Approach
1. Use a stack of indices, maintaining increasing heights.
2. When `heights[i] < heights[stack.top()]`: the top bar's right boundary is `i`.
3. Pop the top; its left boundary is new top (or -1 if stack empty).
4. Area = `height * (right - left - 1)`.
5. After loop, process remaining elements in stack (right boundary = n).

### Complexity
- Time: O(n) — each index pushed and popped once.
- Space: O(n) — stack.

### Java Code
```java
import java.util.*;

public class LargestRectangleHistogram {
    public int largestRectangleArea(int[] heights) {
        Deque<Integer> stack = new ArrayDeque<>(); // stores indices, increasing heights
        int maxArea = 0;
        int n = heights.length;

        for (int i = 0; i <= n; i++) {
            int currHeight = (i == n) ? 0 : heights[i]; // sentinel 0 at end

            while (!stack.isEmpty() && heights[stack.peek()] > currHeight) {
                int height = heights[stack.pop()];
                int width = stack.isEmpty() ? i : (i - stack.peek() - 1);
                maxArea = Math.max(maxArea, height * width);
            }
            stack.push(i);
        }
        return maxArea;
    }

    public static void main(String[] args) {
        LargestRectangleHistogram sol = new LargestRectangleHistogram();

        System.out.println(sol.largestRectangleArea(new int[]{2,1,5,6,2,3})); // 10
        System.out.println(sol.largestRectangleArea(new int[]{2,4}));          // 4
        System.out.println(sol.largestRectangleArea(new int[]{1}));            // 1
        System.out.println(sol.largestRectangleArea(new int[]{5,5,5,5}));     // 20
        System.out.println(sol.largestRectangleArea(new int[]{1,2,3,4,5}));   // 9
        System.out.println(sol.largestRectangleArea(new int[]{5,4,3,2,1}));   // 9
    }
}
```

### Test Cases
| Heights | Expected |
|---------|----------|
| [2,1,5,6,2,3] | 10 |
| [2,4] | 4 |
| [1] | 1 |
| [5,5,5,5] | 20 |
| [1,2,3,4,5] | 9 |
| [5,4,3,2,1] | 9 |

---

<a id="sliding-window-minimum-with-deque"></a>
## 8. Sliding Window Minimum with Deque

### Problem Statement
Given an array `nums` and integer `k`, return the minimum of each sliding window of size `k`.

**Example:**
```
Input:  nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3
Output: [-1, -3, -3, -3, 3, 3]
```

### Intuition
Mirror of Problem 1 (Sliding Window Maximum) but with a **monotonic increasing deque**. The front always holds the minimum. When a new element arrives that is smaller, all larger elements in the deque are useless for future minimums — remove them from the back.

### Why Monotonic Increasing Deque?
- Front = current window minimum (smallest element seen, still in window).
- Back gets dominated elements removed: if `nums[back] >= nums[i]`, back can never be min.
- Front gets expired elements removed: if `front index < i - k + 1`.

### Approach
1. For each index `i`:
   - Remove from front if out of window.
   - Remove from back while `nums[back] >= nums[i]` (not minimum candidates).
   - Add `i` to back.
   - Record `nums[front]` when window is full.

### Complexity
- Time: O(n), Space: O(k).

### Java Code
```java
import java.util.*;

public class SlidingWindowMinimum {
    public int[] minSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        Deque<Integer> deque = new ArrayDeque<>(); // stores indices, increasing values

        for (int i = 0; i < n; i++) {
            // Remove expired elements from front
            while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
                deque.pollFirst();
            }
            // Remove larger elements from back (can't be minimum)
            while (!deque.isEmpty() && nums[deque.peekLast()] >= nums[i]) {
                deque.pollLast();
            }
            deque.offerLast(i);

            if (i >= k - 1) {
                result[i - k + 1] = nums[deque.peekFirst()];
            }
        }
        return result;
    }

    public static void main(String[] args) {
        SlidingWindowMinimum sol = new SlidingWindowMinimum();

        System.out.println(Arrays.toString(sol.minSlidingWindow(new int[]{1,3,-1,-3,5,3,6,7}, 3)));
        // Expected: [-1,-3,-3,-3,3,3]

        System.out.println(Arrays.toString(sol.minSlidingWindow(new int[]{4,2,1,3}, 2)));
        // Expected: [2,1,1]

        System.out.println(Arrays.toString(sol.minSlidingWindow(new int[]{5,5,5}, 2)));
        // Expected: [5,5]

        System.out.println(Arrays.toString(sol.minSlidingWindow(new int[]{3,1,2}, 3)));
        // Expected: [1]
    }
}
```

### Test Cases
| Input | k | Expected |
|-------|---|----------|
| [1,3,-1,-3,5,3,6,7] | 3 | [-1,-3,-3,-3,3,3] |
| [4,2,1,3] | 2 | [2,1,1] |
| [5,5,5] | 2 | [5,5] |
| [3,1,2] | 3 | [1] |
| [1] | 1 | [1] |

---

<a id="task-scheduler"></a>
## 9. Task Scheduler

### Problem Statement
Given a list of CPU tasks (characters A-Z) and a cooldown `n`, find the minimum intervals needed to execute all tasks. The CPU can be idle during cooldown.

**Example:**
```
Input:  tasks = ["A","A","A","B","B","B"], n = 2
Output: 8
Explanation: A→B→idle→A→B→idle→A→B
```

### Intuition
The most frequent task dictates the structure. Think of it as slots: `(maxFreq - 1) * (n + 1) + count_of_tasks_with_maxFreq`. Alternatively, simulate with a greedy queue approach: in each round of `n+1` slots, schedule the most frequent tasks first. This pattern appears in CPU scheduling, job scheduling, and rate-limiting systems.

### Why Queue/Array?
- We need to repeatedly pick the highest-frequency tasks → could use PriorityQueue.
- A frequency array + mathematical formula is cleaner and O(n) for this problem.
- Understanding the simulation with a queue (greedy round robin) generalizes better.

### Approach (Mathematical + Simulation intuition)
1. Count frequency of each task.
2. `maxFreq` = highest frequency.
3. `maxCount` = number of tasks with that max frequency.
4. Slots needed = `(maxFreq - 1) * (n + 1) + maxCount`.
5. Answer = `max(slots, tasks.length)` — if many different tasks, no idle needed.

### Java Code (with both approaches)
```java
import java.util.*;

public class TaskScheduler {

    // Approach 1: Mathematical (O(n) time)
    public int leastInterval(char[] tasks, int n) {
        int[] freq = new int[26];
        for (char t : tasks) freq[t - 'A']++;
        Arrays.sort(freq);

        int maxFreq = freq[25];
        int maxCount = 0;
        for (int f : freq) if (f == maxFreq) maxCount++;

        int slots = (maxFreq - 1) * (n + 1) + maxCount;
        return Math.max(slots, tasks.length);
    }

    // Approach 2: Simulation with PriorityQueue (more generalizable)
    public int leastIntervalSimulation(char[] tasks, int n) {
        int[] freq = new int[26];
        for (char t : tasks) freq[t - 'A']++;

        // Max-heap (descending frequency)
        PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());
        for (int f : freq) if (f > 0) pq.offer(f);

        int time = 0;
        while (!pq.isEmpty()) {
            List<Integer> temp = new ArrayList<>();
            int cycle = n + 1; // one full round

            while (cycle > 0 && !pq.isEmpty()) {
                int top = pq.poll();
                if (top > 1) temp.add(top - 1); // will need more runs
                cycle--;
                time++;
            }

            pq.addAll(temp);
            if (!pq.isEmpty()) time += cycle; // idle slots
        }
        return time;
    }

    public static void main(String[] args) {
        TaskScheduler sol = new TaskScheduler();

        System.out.println(sol.leastInterval(new char[]{'A','A','A','B','B','B'}, 2)); // 8
        System.out.println(sol.leastInterval(new char[]{'A','A','A','B','B','B'}, 0)); // 6
        System.out.println(sol.leastInterval(new char[]{'A','A','A','A','A','A','B','C','D','E','F','G'}, 2)); // 16
        System.out.println(sol.leastInterval(new char[]{'A','B','C','D','E','F'}, 2)); // 6

        System.out.println("--- Simulation ---");
        System.out.println(sol.leastIntervalSimulation(new char[]{'A','A','A','B','B','B'}, 2)); // 8
        System.out.println(sol.leastIntervalSimulation(new char[]{'A','A','A','B','B','B'}, 0)); // 6
    }
}
```

### Test Cases
| Tasks | n | Expected |
|-------|---|----------|
| [A,A,A,B,B,B] | 2 | 8 |
| [A,A,A,B,B,B] | 0 | 6 |
| [A×6,B,C,D,E,F,G] | 2 | 16 |
| [A,B,C,D,E,F] | 2 | 6 |
| [A,A,A,A] | 3 | 13 |

---

<a id="design-snake-game"></a>
## 10. Design Snake Game

### Problem Statement
Design the Snake game on a `width × height` board. The snake starts at `(0,0)` with length 1. Food appears at given positions one at a time. On each `move(direction)` call, return the snake's score (food eaten), or `-1` if the snake hits the wall or its own body.

### Intuition
The snake's body is a sequence of cells where the **head** is always at the front and the **tail** leaves at the back when moving without eating. This is a perfect **Deque** problem — add to front (new head position), remove from back (tail moves out). We also need an O(1) collision check, so a Set mirrors the deque's positions.

### Why Deque?
- Head moves to a new cell → **addFirst**.
- Tail leaves → **removeLast** (only when not eating).
- We need to check if the new head hits the body → Set for O(1) lookup.
- Neither Stack (LIFO) nor Queue (FIFO) alone works; only Deque handles both ends.

### Approach
1. Deque holds `[row * width + col]` for each body cell.
2. Set mirrors the deque for O(1) body-collision detection.
3. On each move:
   - Compute new head position.
   - If out of bounds → return -1.
   - If next food exists and new head == food: increment score, don't remove tail.
   - Else: remove tail from deque and set.
   - If new head is in set → return -1 (body collision).
   - Add new head to front of deque and set.
   - Return score.

### Complexity
- `move()`: O(1) amortized.
- Space: O(width × height).

### Java Code
```java
import java.util.*;

public class SnakeGame {
    private int width, height;
    private int[][] food;
    private int foodIndex;
    private int score;
    private Deque<Integer> snake;      // head at front, tail at back
    private Set<Integer> bodySet;      // for O(1) collision check

    public SnakeGame(int width, int height, int[][] food) {
        this.width = width;
        this.height = height;
        this.food = food;
        this.foodIndex = 0;
        this.score = 0;
        this.snake = new ArrayDeque<>();
        this.bodySet = new HashSet<>();
        int startPos = 0; // (0,0) = 0 * width + 0
        snake.addFirst(startPos);
        bodySet.add(startPos);
    }

    public int move(String direction) {
        int headPos = snake.peekFirst();
        int row = headPos / width;
        int col = headPos % width;

        switch (direction) {
            case "U": row--; break;
            case "D": row++; break;
            case "L": col--; break;
            case "R": col++; break;
        }

        // Check wall collision
        if (row < 0 || row >= height || col < 0 || col >= width) return -1;

        int newHead = row * width + col;

        // Check if food is here
        boolean ateFood = foodIndex < food.length &&
                          food[foodIndex][0] == row &&
                          food[foodIndex][1] == col;

        if (ateFood) {
            score++;
            foodIndex++;
            // Don't remove tail — snake grows
        } else {
            // Remove tail before collision check (tail will vacate)
            int tail = snake.removeLast();
            bodySet.remove(tail);
        }

        // Check body collision AFTER potentially removing tail
        if (bodySet.contains(newHead)) return -1;

        snake.addFirst(newHead);
        bodySet.add(newHead);

        return score;
    }

    public static void main(String[] args) {
        // Board: 3x2, food at (0,1) and (0,2)
        SnakeGame game = new SnakeGame(3, 2, new int[][]{{0,1},{0,2}});

        System.out.println(game.move("R")); // 1 (ate food at 0,1)
        System.out.println(game.move("R")); // 2 (ate food at 0,2)
        System.out.println(game.move("D")); // 2 (moved to 1,2)
        System.out.println(game.move("L")); // 2 (moved to 1,1)
        System.out.println(game.move("U")); // 2 (moved to 0,1 — was food location, now empty)
        System.out.println(game.move("L")); // 2 (moved to 0,0)
        System.out.println(game.move("D")); // 2 (moved to 1,0)
        System.out.println(game.move("R")); // 2 (moved to 1,1)
        System.out.println(game.move("R")); // 2 (moved to 1,2)
        System.out.println(game.move("U")); // 2 (moved to 0,2)
        System.out.println(game.move("L")); // 2 (moved to 0,1)
        System.out.println(game.move("L")); // -1 (head hits body at 0,0)
    }
}
```

### Test Cases
| Sequence | Expected Score |
|----------|----------------|
| R (food at 0,1) | 1 |
| R (food at 0,2) | 2 |
| Hit wall (out of bounds) | -1 |
| Hit own body | -1 |
| Tail vacates before collision check | valid move |

---

## Summary: When to Use What

| Situation | Use |
|-----------|-----|
| Level-by-level traversal, shortest path | `LinkedList` as Queue (BFS) |
| Multi-source BFS (spreading problems) | Same — enqueue all sources first |
| Fixed-size buffer, circular usage | Circular Queue (Array + modulo) |
| Window maximum/minimum efficiently | Monotonic Deque (ArrayDeque) |
| FIFO + expiration (sliding window) | Queue with front-cleanup |
| Two-ended insertion/deletion | ArrayDeque (Java's fastest Deque) |
| Snake body, palindrome check | Deque (addFirst/addLast + removeFirst/removeLast) |
| Scheduling, cooldown, greedy rounds | PriorityQueue + simulation |
| Monotonic processing | ArrayDeque as stack (peekFirst + pollFirst) |

## Key Java API Reference

```java
// Queue (FIFO)
Queue<Integer> q = new LinkedList<>();
q.offer(x);        // enqueue (returns false if fails)
q.poll();          // dequeue front (returns null if empty)
q.peek();          // see front

// Deque (Double-Ended)
Deque<Integer> dq = new ArrayDeque<>();
dq.offerFirst(x);  dq.offerLast(x);
dq.pollFirst();    dq.pollLast();
dq.peekFirst();    dq.peekLast();

// PriorityQueue (Min-Heap by default)
PriorityQueue<Integer> pq = new PriorityQueue<>();               // min
PriorityQueue<Integer> maxPq = new PriorityQueue<>(Collections.reverseOrder()); // max
pq.offer(x); pq.poll(); pq.peek();

// ArrayDeque as Stack
Deque<Integer> stack = new ArrayDeque<>();
stack.push(x);   // = addFirst
stack.pop();     // = removeFirst
stack.peek();    // = peekFirst
```

---

*These 10 problems cover: BFS, Multi-source BFS, Sliding Window (max & min), Circular Queue, Monotonic Deque, Queue + HashMap, Sliding Window Expiration, Greedy Scheduling, and Deque Simulation — the full spectrum of queue interview questions.*