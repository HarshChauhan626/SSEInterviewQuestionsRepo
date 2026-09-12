# Greedy Algorithms — 10 Problems That Cover 95% of the Pattern

> **What is Greedy?**
> A greedy algorithm makes the **locally optimal choice at each step** hoping it leads to the global optimum. The key challenge is *proving* that local optimality implies global optimality — this is called the **Greedy Choice Property**.
>
> **When does Greedy work?**
> 1. **Greedy Choice Property** — A globally optimal solution can be reached by making a locally optimal (greedy) choice.
> 2. **Optimal Substructure** — An optimal solution to the problem contains optimal solutions to its subproblems.

---

## Table of Contents
| # | Problem | Difficulty | Jump to Solution |
|---|---------|:----------:|------------------|
| 1 | Activity Selection / Interval Scheduling | 🟡 Medium | [→ #1](#activity-selection--interval-scheduling) |
| 2 | Fractional Knapsack | 🟡 Medium | [→ #2](#fractional-knapsack) |
| 3 | Jump Game II — Minimum Jumps | 🟡 Medium | [→ #3](#jump-game-ii--minimum-jumps) |
| 4 | Gas Station | 🟡 Medium | [→ #4](#gas-station) |
| 5 | Meeting Rooms II — Minimum Meeting Rooms | 🟡 Medium | [→ #5](#meeting-rooms-ii--minimum-meeting-rooms) |
| 6 | Task Scheduler | 🟡 Medium | [→ #6](#task-scheduler) |
| 7 | Candy Distribution | 🔴 Hard | [→ #7](#candy-distribution) |
| 8 | Huffman Encoding (Greedy + Heap) | 🟡 Medium | [→ #8](#huffman-encoding-greedy--heap) |
| 9 | Minimum Number of Platforms (Trains) | 🟡 Medium | [→ #9](#minimum-number-of-platforms-trains) |
| 10 | Minimum Cost to Connect Ropes | 🟡 Medium | [→ #10](#minimum-cost-to-connect-ropes) |

---

<a id="activity-selection--interval-scheduling"></a>
## 1. Activity Selection / Interval Scheduling

### Problem Statement
Given `n` activities with `start[i]` and `end[i]`, select the **maximum number of non-overlapping activities**.

**LeetCode 435** — Minimum number of intervals to *remove* to make the rest non-overlapping (flip of this).

### Test Cases
```
Input:  start = [1, 3, 0, 5, 8, 5]
        end   = [2, 4, 6, 7, 9, 9]
Output: 4   (activities: [1,2], [3,4], [5,7], [8,9])

Input:  start = [1, 1, 1]
        end   = [2, 2, 2]
Output: 1

Edge:   start = [1], end = [2]  → Output: 1
```

### Intuition — Why Greedy Works
- **Key Insight:** Always pick the activity that **ends earliest** (greedy choice).
- Why? An activity ending sooner leaves the maximum remaining time for future activities.
- Sorting by end time and selecting non-conflicting ones is provably optimal (exchange argument proof).

### Approach
1. Sort activities by **end time**.
2. Always pick the first activity.
3. For each subsequent activity, pick it if `start[i] >= end of last picked`.

**Time:** O(n log n) | **Space:** O(1)

### Java Code
```java
import java.util.Arrays;

public class ActivitySelection {

    // Returns max number of non-overlapping activities
    public static int maxActivities(int[] start, int[] end) {
        int n = start.length;
        // Create index array sorted by end time
        Integer[] idx = new Integer[n];
        for (int i = 0; i < n; i++) idx[i] = i;
        Arrays.sort(idx, (a, b) -> end[a] - end[b]);

        int count = 1;
        int lastEnd = end[idx[0]];

        for (int i = 1; i < n; i++) {
            int curr = idx[i];
            if (start[curr] >= lastEnd) {
                count++;
                lastEnd = end[curr];
            }
        }
        return count;
    }

    // LeetCode 435: Min intervals to remove
    public static int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
        int kept = 1, lastEnd = intervals[0][1];
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] >= lastEnd) {
                kept++;
                lastEnd = intervals[i][1];
            }
        }
        return intervals.length - kept;
    }

    public static void main(String[] args) {
        System.out.println(maxActivities(
            new int[]{1,3,0,5,8,5},
            new int[]{2,4,6,7,9,9}
        )); // 4

        System.out.println(eraseOverlapIntervals(
            new int[][]{{1,2},{2,3},{3,4},{1,3}}
        )); // 1
    }
}
```

---

<a id="fractional-knapsack"></a>
## 2. Fractional Knapsack

### Problem Statement
Given items with `weight[i]` and `value[i]`, and a knapsack of capacity `W`, maximize the total value. **Fractions of items are allowed.**

### Test Cases
```
Input:  weights = [10, 20, 30], values = [60, 100, 120], W = 50
Output: 240.0
  Explanation: Take all of item 0 (60), all of item 1 (100),
               and 2/3 of item 2 (80) → 240

Input:  weights = [5], values = [10], W = 3
Output: 6.0   (take 3/5 of the item)

Edge:   W = 0 → Output: 0.0
```

### Intuition — Why Greedy Works
- **Key Insight:** Compute **value-per-unit-weight (value density)** for each item.
- Always take the item with the **highest value density** first.
- Since fractions are allowed, we never "waste" capacity — the greedy choice is always safe.
- This does NOT work for 0/1 Knapsack (where DP is needed).

### Approach
1. Compute `ratio = value[i] / weight[i]` for all items.
2. Sort items by ratio in **descending** order.
3. Greedily fill the knapsack; take fractions if needed.

**Time:** O(n log n) | **Space:** O(n)

### Java Code
```java
import java.util.Arrays;

public class FractionalKnapsack {

    static class Item {
        int weight, value;
        double ratio;
        Item(int w, int v) {
            weight = w; value = v;
            ratio = (double) v / w;
        }
    }

    public static double fractionalKnapsack(int[] weights, int[] values, int W) {
        int n = weights.length;
        Item[] items = new Item[n];
        for (int i = 0; i < n; i++)
            items[i] = new Item(weights[i], values[i]);

        // Sort by value density descending
        Arrays.sort(items, (a, b) -> Double.compare(b.ratio, a.ratio));

        double totalValue = 0.0;
        int remaining = W;

        for (Item item : items) {
            if (remaining == 0) break;
            if (item.weight <= remaining) {
                totalValue += item.value;
                remaining -= item.weight;
            } else {
                // Take fraction
                totalValue += item.ratio * remaining;
                remaining = 0;
            }
        }
        return totalValue;
    }

    public static void main(String[] args) {
        System.out.println(fractionalKnapsack(
            new int[]{10, 20, 30},
            new int[]{60, 100, 120},
            50
        )); // 240.0

        System.out.println(fractionalKnapsack(
            new int[]{5}, new int[]{10}, 3
        )); // 6.0
    }
}
```

---

<a id="jump-game-ii--minimum-jumps"></a>
## 3. Jump Game II — Minimum Jumps

### Problem Statement
Given array `nums` where `nums[i]` = max jump length from index `i`, return the **minimum number of jumps** to reach the last index.

**LeetCode 45**

### Test Cases
```
Input:  nums = [2, 3, 1, 1, 4]
Output: 2   (jump 1→3, then 3→4)

Input:  nums = [2, 3, 0, 1, 4]
Output: 2

Input:  nums = [1, 2, 1, 1, 1]
Output: 3

Edge:   nums = [0]    → Output: 0 (already at end)
        nums = [1, 1] → Output: 1
```

### Intuition — Why Greedy Works
- **Key Insight:** At each "level" (like BFS), extend as far as possible.
- Track `currentEnd` (boundary of current jump) and `farthest` (max we can reach).
- When we hit `currentEnd`, we must make a jump — greedily jump to `farthest`.
- This is equivalent to BFS level-order traversal on a virtual graph.

### Approach
1. Track `jumps`, `currentEnd`, `farthest`.
2. Iterate: update `farthest = max(farthest, i + nums[i])`.
3. When `i == currentEnd`: increment jumps, set `currentEnd = farthest`.

**Time:** O(n) | **Space:** O(1)

### Java Code
```java
public class JumpGameII {

    public static int jump(int[] nums) {
        int jumps = 0;
        int currentEnd = 0;   // boundary of current jump range
        int farthest = 0;     // farthest index reachable

        for (int i = 0; i < nums.length - 1; i++) {
            farthest = Math.max(farthest, i + nums[i]);

            if (i == currentEnd) {
                // Must take a jump here
                jumps++;
                currentEnd = farthest;

                if (currentEnd >= nums.length - 1) break;
            }
        }
        return jumps;
    }

    public static void main(String[] args) {
        System.out.println(jump(new int[]{2, 3, 1, 1, 4})); // 2
        System.out.println(jump(new int[]{2, 3, 0, 1, 4})); // 2
        System.out.println(jump(new int[]{1, 2, 1, 1, 1})); // 3
        System.out.println(jump(new int[]{0}));              // 0
    }
}
```

---

<a id="gas-station"></a>
## 4. Gas Station

### Problem Statement
There are `n` gas stations in a circle. `gas[i]` = gas available at station `i`, `cost[i]` = gas needed to travel from station `i` to `i+1`. Return the starting station index if you can complete the circuit, else return `-1`.

**LeetCode 134**

### Test Cases
```
Input:  gas  = [1, 2, 3, 4, 5]
        cost = [3, 4, 5, 1, 2]
Output: 3

Input:  gas  = [2, 3, 4]
        cost = [3, 4, 3]
Output: -1

Edge:   gas = [5], cost = [4] → Output: 0
        gas = [1], cost = [1] → Output: 0
```

### Intuition — Why Greedy Works
- **Key Insight 1:** If total `sum(gas) < sum(cost)`, solution is impossible.
- **Key Insight 2:** If we run out of gas at station `k` starting from station `s`, then no station between `s` and `k` can be a valid start (they inherit an even lower tank).
- So we reset our start to `k+1` whenever we go negative.
- The one candidate remaining at the end is the answer.

### Approach
1. Traverse once: track `totalGain` and `currentGain`.
2. If `currentGain < 0`: reset `start = i + 1`, reset `currentGain = 0`.
3. After loop: return `start` if `totalGain >= 0`, else `-1`.

**Time:** O(n) | **Space:** O(1)

### Java Code
```java
public class GasStation {

    public static int canCompleteCircuit(int[] gas, int[] cost) {
        int totalGain = 0;
        int currentGain = 0;
        int start = 0;

        for (int i = 0; i < gas.length; i++) {
            int gain = gas[i] - cost[i];
            totalGain += gain;
            currentGain += gain;

            // Can't reach next station from current start
            if (currentGain < 0) {
                start = i + 1;       // try starting from next station
                currentGain = 0;     // reset tank
            }
        }
        return totalGain >= 0 ? start : -1;
    }

    public static void main(String[] args) {
        System.out.println(canCompleteCircuit(
            new int[]{1,2,3,4,5},
            new int[]{3,4,5,1,2}
        )); // 3

        System.out.println(canCompleteCircuit(
            new int[]{2,3,4},
            new int[]{3,4,3}
        )); // -1
    }
}
```

---

<a id="meeting-rooms-ii--minimum-meeting-rooms"></a>
## 5. Meeting Rooms II — Minimum Meeting Rooms

### Problem Statement
Given intervals `[start, end]` representing meetings, find the **minimum number of conference rooms** required.

**LeetCode 253**

### Test Cases
```
Input:  [[0,30],[5,10],[15,20]]
Output: 2

Input:  [[7,10],[2,4]]
Output: 1

Input:  [[1,5],[2,6],[3,7],[4,8]]
Output: 4

Edge:   [] → Output: 0
        [[1,2]] → Output: 1
```

### Intuition — Why Greedy Works
- **Key Insight:** At any point, the number of rooms needed = number of meetings happening simultaneously.
- Use a **min-heap** tracking end times of ongoing meetings.
- Greedily: for each new meeting (sorted by start), if the earliest-ending meeting is already done, reuse its room; otherwise allocate a new room.
- Heap size = current rooms in use.

### Approach
1. Sort intervals by start time.
2. Use a min-heap of end times.
3. For each meeting: if `heap.peek() <= start`, poll (reuse room). Push current `end`.
4. Answer = heap size.

**Time:** O(n log n) | **Space:** O(n)

### Java Code
```java
import java.util.Arrays;
import java.util.PriorityQueue;

public class MeetingRoomsII {

    public static int minMeetingRooms(int[][] intervals) {
        if (intervals.length == 0) return 0;

        // Sort by start time
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);

        // Min-heap of end times
        PriorityQueue<Integer> heap = new PriorityQueue<>();

        for (int[] meeting : intervals) {
            // If earliest-ending meeting is done, free that room
            if (!heap.isEmpty() && heap.peek() <= meeting[0]) {
                heap.poll();
            }
            heap.offer(meeting[1]);  // occupy a room until meeting[1]
        }
        return heap.size();
    }

    public static void main(String[] args) {
        System.out.println(minMeetingRooms(
            new int[][]{{0,30},{5,10},{15,20}}
        )); // 2

        System.out.println(minMeetingRooms(
            new int[][]{{7,10},{2,4}}
        )); // 1

        System.out.println(minMeetingRooms(
            new int[][]{{1,5},{2,6},{3,7},{4,8}}
        )); // 4
    }
}
```

---

<a id="task-scheduler"></a>
## 6. Task Scheduler

### Problem Statement
Given a list of tasks (characters) and a cooldown `n`, find the **minimum intervals** needed to finish all tasks. Idle slots can be inserted.

**LeetCode 621**

### Test Cases
```
Input:  tasks = ['A','A','A','B','B','B'], n = 2
Output: 8   → A B _ A B _ A B

Input:  tasks = ['A','A','A','B','B','B'], n = 0
Output: 6   (no cooldown)

Input:  tasks = ['A','A','A','A','A','A','B','C','D','E','F','G'], n = 2
Output: 16

Edge:   tasks = ['A'], n = 5 → Output: 1
```

### Intuition — Why Greedy Works
- **Key Insight:** The most frequent task determines the minimum length of the schedule.
- If the max frequency is `f`, we need at least `(f-1) * (n+1) + 1` slots.
- All other tasks fill in the gaps; if there are enough tasks, no idle time is needed.
- Formula: `max(tasks.length, (maxFreq - 1) * (n + 1) + countOfMaxFreq)`

### Approach
1. Count frequency of each task.
2. Find `maxFreq` and `countOfMaxFreq` (ties for max).
3. Apply the formula.

**Time:** O(n) | **Space:** O(1) — at most 26 distinct tasks

### Java Code
```java
public class TaskScheduler {

    public static int leastInterval(char[] tasks, int n) {
        int[] freq = new int[26];
        for (char t : tasks) freq[t - 'A']++;

        int maxFreq = 0;
        for (int f : freq) maxFreq = Math.max(maxFreq, f);

        // Count how many tasks share the max frequency
        int countMax = 0;
        for (int f : freq) if (f == maxFreq) countMax++;

        // Formula
        int slots = (maxFreq - 1) * (n + 1) + countMax;
        return Math.max(tasks.length, slots);
    }

    public static void main(String[] args) {
        System.out.println(leastInterval(
            new char[]{'A','A','A','B','B','B'}, 2
        )); // 8

        System.out.println(leastInterval(
            new char[]{'A','A','A','B','B','B'}, 0
        )); // 6

        System.out.println(leastInterval(new char[]{'A'}, 5)); // 1
    }
}
```

---

<a id="candy-distribution"></a>
## 7. Candy Distribution

### Problem Statement
`n` children stand in a row with ratings `ratings[i]`. Each child must get **at least 1 candy**. Children with a **higher rating than their neighbor** must get more candies. Return the **minimum total candies**.

**LeetCode 135**

### Test Cases
```
Input:  ratings = [1, 0, 2]
Output: 5   → [2, 1, 2]

Input:  ratings = [1, 2, 2]
Output: 4   → [1, 2, 1]

Input:  ratings = [1, 3, 2, 2, 1]
Output: 7   → [1, 2, 1, 2, 1]  — wait → [1,3,2,1,1]? No: [1,2,1,1,1] fails 3>2.
            → Correct: [1, 3, 2, 1, 1] → sum=8? Let's check: 1<3 ✓(3>1), 3>2 ✓(2<3), 2=2 ✗(same ok), 2>1 ✓(1<2) → [1,3,2,2,1] → sum=9
            → Actually output: 7  [1,2,1,1,1]? 1<3 needs 2>1 ✓, 3>2 needs 2>1? → [1,2,1,1,1] fails 3→2 neighbor. 
            → Correct answer: [1,3,2,1,1] sum = 8. Let me verify: 7 for [1,2,2].

Edge:   ratings = [1]     → Output: 1
        ratings = [1,1,1] → Output: 3
```

### Intuition — Why Greedy Works
- **Two-pass greedy** — handle left constraint, then right constraint.
- **Left pass:** If `ratings[i] > ratings[i-1]`, then `candy[i] = candy[i-1] + 1`.
- **Right pass:** If `ratings[i] > ratings[i+1]`, then `candy[i] = max(candy[i], candy[i+1] + 1)`.
- Each pass greedily satisfies one direction's constraint; taking `max` in the second pass ensures both are respected.

### Approach
1. Initialize all candies to `1`.
2. Left-to-right pass: enforce left neighbor constraint.
3. Right-to-left pass: enforce right neighbor constraint.
4. Sum all candies.

**Time:** O(n) | **Space:** O(n)

### Java Code
```java
public class CandyDistribution {

    public static int candy(int[] ratings) {
        int n = ratings.length;
        int[] candies = new int[n];
        java.util.Arrays.fill(candies, 1);

        // Left pass: satisfy left neighbor
        for (int i = 1; i < n; i++) {
            if (ratings[i] > ratings[i - 1]) {
                candies[i] = candies[i - 1] + 1;
            }
        }

        // Right pass: satisfy right neighbor
        for (int i = n - 2; i >= 0; i--) {
            if (ratings[i] > ratings[i + 1]) {
                candies[i] = Math.max(candies[i], candies[i + 1] + 1);
            }
        }

        int total = 0;
        for (int c : candies) total += c;
        return total;
    }

    public static void main(String[] args) {
        System.out.println(candy(new int[]{1, 0, 2}));    // 5
        System.out.println(candy(new int[]{1, 2, 2}));    // 4
        System.out.println(candy(new int[]{1}));           // 1
        System.out.println(candy(new int[]{1, 1, 1}));    // 3
    }
}
```

---

<a id="huffman-encoding-greedy--heap"></a>
## 8. Huffman Encoding (Greedy + Heap)

### Problem Statement
Given characters and their frequencies, build a Huffman tree and return the **minimum total encoding cost** (sum of `freq * depth`). This is the classic optimal prefix-free code problem.

### Test Cases
```
Input:  chars = ['a','b','c','d','e','f']
        freq  = [5, 9, 12, 13, 16, 45]
Output: 224  (optimal encoding cost)

Input:  freq = [1, 1]
Output: 2

Input:  freq = [10]
Output: 0   (single character, no bits needed)
```

### Intuition — Why Greedy Works
- **Key Insight:** Less frequent characters should be placed deeper in the tree (longer codes).
- Greedily: always merge the **two nodes with the smallest frequency**.
- The merged node's frequency = sum of both; put it back in the priority queue.
- This produces the optimal tree — proven by the greedy exchange argument.

### Approach
1. Insert all frequencies into a **min-heap**.
2. While heap size > 1: poll two minimums, merge (sum), push back.
3. Track the sum of all merged values = total encoding cost.

**Time:** O(n log n) | **Space:** O(n)

### Java Code
```java
import java.util.PriorityQueue;

public class HuffmanEncoding {

    public static int huffmanCost(int[] freq) {
        if (freq.length == 1) return 0;

        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int f : freq) minHeap.offer(f);

        int totalCost = 0;

        while (minHeap.size() > 1) {
            int first  = minHeap.poll();
            int second = minHeap.poll();
            int merged = first + second;
            totalCost += merged;        // cost of this merge level
            minHeap.offer(merged);
        }
        return totalCost;
    }

    // Also build the actual tree
    static class HuffmanNode {
        char ch; int freq;
        HuffmanNode left, right;
        HuffmanNode(char ch, int freq) { this.ch = ch; this.freq = freq; }
    }

    public static HuffmanNode buildTree(char[] chars, int[] freq) {
        PriorityQueue<HuffmanNode> pq = new PriorityQueue<>(
            (a, b) -> a.freq - b.freq
        );
        for (int i = 0; i < chars.length; i++)
            pq.offer(new HuffmanNode(chars[i], freq[i]));

        while (pq.size() > 1) {
            HuffmanNode left = pq.poll();
            HuffmanNode right = pq.poll();
            HuffmanNode parent = new HuffmanNode('\0', left.freq + right.freq);
            parent.left = left;
            parent.right = right;
            pq.offer(parent);
        }
        return pq.poll();
    }

    public static void printCodes(HuffmanNode root, String code) {
        if (root == null) return;
        if (root.ch != '\0') System.out.println(root.ch + ": " + code);
        printCodes(root.left,  code + "0");
        printCodes(root.right, code + "1");
    }

    public static void main(String[] args) {
        System.out.println(huffmanCost(new int[]{5,9,12,13,16,45})); // 224

        char[] chars = {'a','b','c','d','e','f'};
        int[] freq   = {5,9,12,13,16,45};
        HuffmanNode root = buildTree(chars, freq);
        printCodes(root, "");
    }
}
```

---

<a id="minimum-number-of-platforms-trains"></a>
## 9. Minimum Number of Platforms (Trains)

### Problem Statement
Given arrival and departure times of trains at a station, find the **minimum number of platforms** required so that no train waits.

*(Variant of Meeting Rooms II — worth studying separately for its elegant two-pointer solution)*

### Test Cases
```
Input:  arrival   = [900, 940, 950, 1100, 1500, 1800]
        departure = [910, 1200, 1120, 1130, 1900, 2000]
Output: 3

Input:  arrival = [900, 1100, 1235]
        departure = [1000, 1200, 1240]
Output: 1

Edge:   Single train → Output: 1
```

### Intuition — Why Greedy Works
- **Key Insight:** Sort arrivals and departures separately. Use two pointers.
- At each step, if the next event is an arrival: need a new platform.
- If next event is a departure: free up a platform.
- Track running count and max count.
- This is the **sweep-line** technique — a core greedy pattern.

### Approach
1. Sort `arrival[]` and `departure[]` independently.
2. Two pointers `i`, `j` starting at 0.
3. Whichever is smaller, process it: arrival → `platforms++`, departure → `platforms--`.
4. Track `maxPlatforms`.

**Time:** O(n log n) | **Space:** O(1)

### Java Code
```java
import java.util.Arrays;

public class MinPlatforms {

    public static int findMinPlatforms(int[] arrival, int[] departure) {
        Arrays.sort(arrival);
        Arrays.sort(departure);

        int platforms = 0, maxPlatforms = 0;
        int i = 0, j = 0;
        int n = arrival.length;

        while (i < n && j < n) {
            if (arrival[i] <= departure[j]) {
                platforms++;
                i++;
            } else {
                platforms--;
                j++;
            }
            maxPlatforms = Math.max(maxPlatforms, platforms);
        }
        return maxPlatforms;
    }

    public static void main(String[] args) {
        System.out.println(findMinPlatforms(
            new int[]{900, 940, 950, 1100, 1500, 1800},
            new int[]{910, 1200, 1120, 1130, 1900, 2000}
        )); // 3

        System.out.println(findMinPlatforms(
            new int[]{900, 1100, 1235},
            new int[]{1000, 1200, 1240}
        )); // 1
    }
}
```

---

<a id="minimum-cost-to-connect-ropes"></a>
## 10. Minimum Cost to Connect Ropes

### Problem Statement
Given `n` ropes of lengths `arr[]`, connect all ropes into one. The cost to connect two ropes = their sum. Find the **minimum total cost** to connect all ropes.

*(This is Huffman cost applied to a simpler version — and also the core of Prim's/Kruskal's intuition)*

### Test Cases
```
Input:  ropes = [4, 3, 2, 6]
Output: 29
  Step 1: Connect 2+3=5, cost=5,  ropes=[4,5,6]
  Step 2: Connect 4+5=9, cost=9,  ropes=[6,9]
  Step 3: Connect 6+9=15, cost=15, ropes=[15]
  Total: 5+9+15 = 29

Input:  ropes = [1, 2, 3, 4, 5]
Output: 33

Edge:   ropes = [5]        → Output: 0
        ropes = [3, 5]     → Output: 8
```

### Intuition — Why Greedy Works
- **Key Insight:** Each rope's length contributes to the cost once for every time it's involved in a merge.
- Shorter ropes merged first are involved in more future merges but contribute less each time.
- Always merge the **two smallest** ropes — this minimizes the cost at each step.
- Identical to Huffman: the greedy choice of minimum two elements is provably optimal.

### Approach
1. Push all ropes into a **min-heap**.
2. While heap size > 1: poll two minimum, merge, add cost, push back.
3. Return total cost.

**Time:** O(n log n) | **Space:** O(n)

### Java Code
```java
import java.util.PriorityQueue;

public class ConnectRopes {

    public static long minCostToConnect(int[] ropes) {
        if (ropes.length == 1) return 0;

        PriorityQueue<Long> minHeap = new PriorityQueue<>();
        for (int r : ropes) minHeap.offer((long) r);

        long totalCost = 0;

        while (minHeap.size() > 1) {
            long first  = minHeap.poll();
            long second = minHeap.poll();
            long merged = first + second;
            totalCost += merged;
            minHeap.offer(merged);
        }
        return totalCost;
    }

    public static void main(String[] args) {
        System.out.println(minCostToConnect(new int[]{4, 3, 2, 6}));    // 29
        System.out.println(minCostToConnect(new int[]{1, 2, 3, 4, 5})); // 33
        System.out.println(minCostToConnect(new int[]{5}));              // 0
        System.out.println(minCostToConnect(new int[]{3, 5}));           // 8
    }
}
```

---

## Core Greedy Patterns — Quick Reference

| # | Problem | Greedy Choice | Key Data Structure | Time |
|---|---------|--------------|-------------------|------|
| 1 | Activity Selection | Earliest end time | Sort | O(n log n) |
| 2 | Fractional Knapsack | Max value density | Sort | O(n log n) |
| 3 | Jump Game II | Max reachable (BFS-like) | Variables | O(n) |
| 4 | Gas Station | Skip invalid prefix | Variables | O(n) |
| 5 | Meeting Rooms II | Earliest-ending room | Min-Heap | O(n log n) |
| 6 | Task Scheduler | Fill around max-freq task | Freq array | O(n) |
| 7 | Candy | Two-pass local comparison | Array | O(n) |
| 8 | Huffman Encoding | Merge two minimums | Min-Heap | O(n log n) |
| 9 | Min Platforms | Sweep-line two-pointer | Sort + 2 ptrs | O(n log n) |
| 10 | Connect Ropes | Merge two smallest | Min-Heap | O(n log n) |

---

## How to Identify a Greedy Problem

Ask yourself:
1. **Can I make a locally optimal choice that never needs to be revisited?**
2. **Does sorting or priority ordering reveal the right order of choices?**
3. **Is there an exchange argument?** ("Swapping any two choices makes things worse")
4. **Does a two-pass scan satisfy constraints from both sides?** (Candy pattern)
5. **Are we minimizing cost by always picking the two smallest things?** (Huffman/Ropes pattern)

> ⚠️ **Common Trap:** Greedy fails for 0/1 Knapsack, Coin Change (general), and Shortest Path with negative edges. When greedy fails, reach for **DP**.