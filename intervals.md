# Intervals — Master Problem Set

> 10 problems covering ~95% of all interval pattern questions asked in coding interviews.

---

## Table of Contents
| # | Problem | Difficulty | Jump to Solution |
|---|---------|:----------:|----------------|
| 1 | Merge Intervals | 🟡 Medium | [→ #1](#merge-intervals) |
| 2 | Insert Interval | 🟡 Medium | [→ #2](#insert-interval) |
| 3 | Meeting Rooms I (Can Attend All?) | 🟢 Easy | [→ #3](#meeting-rooms-i-can-attend-all) |
| 4 | Meeting Rooms II (Minimum Rooms Required) | 🟡 Medium | [→ #4](#meeting-rooms-ii-minimum-rooms-required) |
| 5 | Non-Overlapping Intervals (Minimum Removals) | 🟡 Medium | [→ #5](#non-overlapping-intervals-minimum-removals) |
| 6 | Minimum Number of Arrows to Burst Balloons | 🟡 Medium | [→ #6](#minimum-number-of-arrows-to-burst-balloons) |
| 7 | Maximum CPU Load / Peak Overlap Count | 🟡 Medium | [→ #7](#maximum-cpu-load--peak-overlap-count) |
| 8 | Employee Free Time | 🔴 Hard | [→ #8](#employee-free-time) |
| 9 | Interval List Intersections | 🟡 Medium | [→ #9](#interval-list-intersections) |
| 10 | Summary Ranges / Data Stream as Disjoint Intervals | 🟡 Medium | [→ #10](#summary-ranges--data-stream-as-disjoint-intervals) |

---

## Core Intuition Before You Start

**What makes interval problems special?**
Intervals represent ranges `[start, end]`. Almost every interval problem boils down to one of these questions:
- Do two intervals **overlap**? → `a.start <= b.end && b.start <= a.end`
- How do I **merge** overlapping intervals?
- How do I **schedule** or **count** something over time?
- What is the **minimum** number of resources (rooms, arrows, etc.) needed?

**The universal trick:** Sort by `start` time. Once sorted, you only need to compare the **current interval's start** with the **previous interval's end**.

**Overlap condition (memorize this):**
```
Two intervals [a, b] and [c, d] overlap if: a <= d && c <= b
They DON'T overlap if: b < c || d < a
```

---

<a id="merge-intervals"></a>
## Problem 1 — Merge Intervals

### Problem Statement
Given an array of intervals `[start, end]`, merge all overlapping intervals and return the result.

**Example:**
```
Input:  [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
```

**Test Cases:**
```
[[1,4],[4,5]]           → [[1,5]]       (touching counts as overlapping)
[[1,4],[2,3]]           → [[1,4]]       (one fully inside another)
[[1,2],[3,4],[5,6]]     → [[1,2],[3,4],[5,6]]  (no overlaps)
[[1,4]]                 → [[1,4]]       (single interval)
[]                      → []
```

### Intuition
Think of it like a timeline. Once sorted by start, you walk left to right. If the next interval starts before the current one ends, they overlap — just extend the current end. Otherwise, save the current and start fresh.

### Why This Approach Works
- After sorting, any interval that could possibly merge with the current one must come immediately after it (no need to look ahead more than one step).
- We only ever look at the **last merged interval's end** vs the **next interval's start**.

### Approach
1. Sort intervals by `start`.
2. Initialize result with the first interval.
3. For each subsequent interval:
   - If `current.start <= last.end` → overlap → update `last.end = max(last.end, current.end)`
   - Else → no overlap → push current to result.

**Time:** O(n log n) | **Space:** O(n)

### Java Code
```java
import java.util.*;

public class MergeIntervals {
    public int[][] merge(int[][] intervals) {
        if (intervals.length <= 1) return intervals;
        
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        
        List<int[]> result = new ArrayList<>();
        int[] current = intervals[0];
        
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] <= current[1]) {
                // Overlapping — extend end
                current[1] = Math.max(current[1], intervals[i][1]);
            } else {
                // No overlap — save current, move on
                result.add(current);
                current = intervals[i];
            }
        }
        result.add(current);
        
        return result.toArray(new int[result.size()][]);
    }
    
    // Test
    public static void main(String[] args) {
        MergeIntervals sol = new MergeIntervals();
        int[][] res = sol.merge(new int[][]{{1,3},{2,6},{8,10},{15,18}});
        for (int[] r : res) System.out.println(Arrays.toString(r));
        // [1,6] [8,10] [15,18]
    }
}
```

---

<a id="insert-interval"></a>
## Problem 2 — Insert Interval

### Problem Statement
Given a sorted, non-overlapping list of intervals and a new interval, insert it in the right position and merge if necessary. Return the updated list.

**Example:**
```
Input:  intervals = [[1,3],[6,9]], newInterval = [2,5]
Output: [[1,5],[6,9]]
```

**Test Cases:**
```
[[1,3],[6,9]], [2,5]        → [[1,5],[6,9]]
[[1,2],[3,5],[6,7],[8,10]], [4,8]  → [[1,2],[3,10]]
[], [5,7]                   → [[5,7]]
[[1,5]], [2,3]              → [[1,5]]
[[1,5]], [6,8]              → [[1,5],[6,8]]
```

### Intuition
Walk through three phases:
1. Add all intervals that end **before** the new interval starts (no overlap, go before).
2. Merge all intervals that overlap with the new interval.
3. Add all intervals that start **after** the new interval ends (go after).

### Why This Approach Works
Because the input is already sorted and non-overlapping, we can cleanly identify these three zones with simple comparisons. No sorting needed!

### Approach
1. Add all intervals where `end < newInterval.start`.
2. While `start <= newInterval.end` → merge: `newInterval = [min(start), max(end)]`.
3. Add the merged interval, then add the rest.

**Time:** O(n) | **Space:** O(n)

### Java Code
```java
import java.util.*;

public class InsertInterval {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> result = new ArrayList<>();
        int i = 0, n = intervals.length;
        
        // Phase 1: Add intervals that come completely before
        while (i < n && intervals[i][1] < newInterval[0]) {
            result.add(intervals[i++]);
        }
        
        // Phase 2: Merge all overlapping intervals
        while (i < n && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
            newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
            i++;
        }
        result.add(newInterval);
        
        // Phase 3: Add intervals that come completely after
        while (i < n) {
            result.add(intervals[i++]);
        }
        
        return result.toArray(new int[result.size()][]);
    }
    
    public static void main(String[] args) {
        InsertInterval sol = new InsertInterval();
        int[][] res = sol.insert(new int[][]{{1,3},{6,9}}, new int[]{2,5});
        for (int[] r : res) System.out.println(Arrays.toString(r));
        // [1,5] [6,9]
    }
}
```

---

<a id="meeting-rooms-i-can-attend-all"></a>
## Problem 3 — Meeting Rooms I (Can Attend All?)

### Problem Statement
Given an array of meeting time intervals `[start, end]`, determine if a person can attend all meetings (i.e., no two meetings overlap).

**Example:**
```
Input:  [[0,30],[5,10],[15,20]]
Output: false
```

**Test Cases:**
```
[[0,30],[5,10],[15,20]]   → false (0-30 overlaps with 5-10)
[[7,10],[2,4]]            → true
[[1,5],[5,10]]            → false (touching = overlap here, start == end)
[[1,2],[3,4],[5,6]]       → true
[]                        → true
```

### Intuition
After sorting by start time, two consecutive meetings conflict if the next one starts before the current ends. We just check all consecutive pairs.

### Why This Approach Works
If any two meetings overlap, the offending pair will be **adjacent** after sorting by start time. You don't need to check non-adjacent pairs.

### Approach
1. Sort by start time.
2. For each consecutive pair, if `intervals[i][0] < intervals[i-1][1]` → conflict → return false.
3. Return true.

**Time:** O(n log n) | **Space:** O(1)

### Java Code
```java
import java.util.*;

public class MeetingRooms {
    public boolean canAttendMeetings(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] < intervals[i - 1][1]) {
                return false; // Overlap found
            }
        }
        return true;
    }
    
    public static void main(String[] args) {
        MeetingRooms sol = new MeetingRooms();
        System.out.println(sol.canAttendMeetings(new int[][]{{0,30},{5,10},{15,20}})); // false
        System.out.println(sol.canAttendMeetings(new int[][]{{7,10},{2,4}}));          // true
    }
}
```

---

<a id="meeting-rooms-ii-minimum-rooms-required"></a>
## Problem 4 — Meeting Rooms II (Minimum Rooms Required)

### Problem Statement
Given meeting time intervals, find the **minimum number of conference rooms** required.

**Example:**
```
Input:  [[0,30],[5,10],[15,20]]
Output: 2
```

**Test Cases:**
```
[[0,30],[5,10],[15,20]]       → 2
[[7,10],[2,4]]                → 1
[[1,5],[2,6],[3,7],[4,8]]     → 4
[[1,4],[2,5],[7,10]]          → 2
[]                            → 0
```

### Intuition
Think of it as a **scheduling simulation**. You have rooms available. When a new meeting starts, check if any room has freed up (its meeting ended). If yes, reuse that room. If no, allocate a new room. A **min-heap** tracks the earliest ending meeting efficiently.

### Why Min-Heap Works
The room most likely to free up next is the one with the **smallest end time**. A min-heap always gives you that in O(log n).

### Approach
1. Sort by start time.
2. Use a min-heap of end times (each entry = when a room becomes free).
3. For each meeting:
   - If heap's top (earliest free room) `<= meeting.start` → reuse: pop and push new end.
   - Else → new room: just push new end.
4. Answer = heap size.

**Time:** O(n log n) | **Space:** O(n)

### Java Code
```java
import java.util.*;

public class MeetingRoomsII {
    public int minMeetingRooms(int[][] intervals) {
        if (intervals.length == 0) return 0;
        
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        
        PriorityQueue<Integer> minHeap = new PriorityQueue<>(); // stores end times
        
        for (int[] interval : intervals) {
            // If the earliest-ending room is free before this meeting starts
            if (!minHeap.isEmpty() && minHeap.peek() <= interval[0]) {
                minHeap.poll(); // Free up that room
            }
            minHeap.offer(interval[1]); // Assign/allocate a room
        }
        
        return minHeap.size();
    }
    
    public static void main(String[] args) {
        MeetingRoomsII sol = new MeetingRoomsII();
        System.out.println(sol.minMeetingRooms(new int[][]{{0,30},{5,10},{15,20}})); // 2
        System.out.println(sol.minMeetingRooms(new int[][]{{1,5},{2,6},{3,7},{4,8}})); // 4
    }
}
```

---

<a id="non-overlapping-intervals-minimum-removals"></a>
## Problem 5 — Non-Overlapping Intervals (Minimum Removals)

### Problem Statement
Given intervals, find the **minimum number of intervals to remove** to make the rest non-overlapping.

**Example:**
```
Input:  [[1,2],[2,3],[3,4],[1,3]]
Output: 1  (remove [1,3])
```

**Test Cases:**
```
[[1,2],[2,3],[3,4],[1,3]]   → 1
[[1,2],[1,2],[1,2]]         → 2
[[1,2],[2,3]]               → 0
[[1,100],[11,22],[1,11],[2,12]] → 2
```

### Intuition
This is a **Greedy** problem. The key insight: always keep the interval with the **earliest end time** when there's a conflict. Intervals that end earlier leave more room for future intervals — they're "less greedy" about the timeline.

### Why Greedy (Earliest End) Works
Among all conflicting intervals, removing the one with the later end time is always at least as good as any other choice. This is the classic **Activity Selection** greedy proof.

### Approach
1. Sort by **end time** (not start!).
2. Track the `end` of the last kept interval.
3. For each interval:
   - If `start >= lastEnd` → no conflict → keep it, update `lastEnd`.
   - Else → conflict → remove this one (increment count).

**Time:** O(n log n) | **Space:** O(1)

### Java Code
```java
import java.util.*;

public class NonOverlappingIntervals {
    public int eraseOverlapIntervals(int[][] intervals) {
        if (intervals.length == 0) return 0;
        
        // Sort by END time — greedy key insight
        Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
        
        int removals = 0;
        int lastEnd = intervals[0][1];
        
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] < lastEnd) {
                // Overlap — remove current (it has later end, sorted)
                removals++;
            } else {
                // No overlap — keep it
                lastEnd = intervals[i][1];
            }
        }
        
        return removals;
    }
    
    public static void main(String[] args) {
        NonOverlappingIntervals sol = new NonOverlappingIntervals();
        System.out.println(sol.eraseOverlapIntervals(new int[][]{{1,2},{2,3},{3,4},{1,3}})); // 1
        System.out.println(sol.eraseOverlapIntervals(new int[][]{{1,2},{1,2},{1,2}}));       // 2
    }
}
```

---

<a id="minimum-number-of-arrows-to-burst-balloons"></a>
## Problem 6 — Minimum Number of Arrows to Burst Balloons

### Problem Statement
Balloons are represented as intervals `[x_start, x_end]` on a number line. An arrow shot at position `x` bursts all balloons where `x_start <= x <= x_end`. Find the **minimum arrows** needed to burst all balloons.

**Example:**
```
Input:  [[10,16],[2,8],[1,6],[7,12]]
Output: 2
```

**Test Cases:**
```
[[10,16],[2,8],[1,6],[7,12]]   → 2
[[1,2],[3,4],[5,6],[7,8]]      → 4
[[1,2],[2,3],[3,4],[4,5]]      → 2
[[1,2]]                        → 1
[[-2147483646,-2147483645],[2147483646,2147483647]] → 2
```

### Intuition
Same idea as Non-Overlapping Intervals! Each arrow can burst a group of overlapping balloons. Count the number of **non-overlapping groups** — that's how many arrows you need.

### Key Difference from Problem 5
Here, touching intervals `[1,2]` and `[2,3]` ARE burst by one arrow (at x=2), so they overlap. The condition is `start <= lastEnd` (not strictly less).

### Approach
1. Sort by end position.
2. Shoot an arrow at the first balloon's end.
3. Any balloon whose start `<= lastArrow` is burst by this arrow.
4. Otherwise, shoot a new arrow at that balloon's end.

**Time:** O(n log n) | **Space:** O(1)

### Java Code
```java
import java.util.*;

public class MinArrowsBalloons {
    public int findMinArrowShots(int[][] points) {
        if (points.length == 0) return 0;
        
        // Sort by end position
        Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));
        
        int arrows = 1;
        int arrowPos = points[0][1]; // Shoot at end of first balloon
        
        for (int i = 1; i < points.length; i++) {
            if (points[i][0] > arrowPos) {
                // This balloon is NOT hit — need a new arrow
                arrows++;
                arrowPos = points[i][1];
            }
            // else: already burst by current arrow
        }
        
        return arrows;
    }
    
    public static void main(String[] args) {
        MinArrowsBalloons sol = new MinArrowsBalloons();
        System.out.println(sol.findMinArrowShots(new int[][]{{10,16},{2,8},{1,6},{7,12}})); // 2
        System.out.println(sol.findMinArrowShots(new int[][]{{1,2},{3,4},{5,6},{7,8}}));    // 4
    }
}
```

---

<a id="maximum-cpu-load--peak-overlap-count"></a>
## Problem 7 — Maximum CPU Load / Peak Overlap Count

### Problem Statement
Given a list of jobs with `[start, end, load]`, find the **maximum CPU load** at any point in time.

(Variant without load: find the maximum number of overlapping intervals at any point.)

**Example:**
```
Input:  [[1,4,3],[2,5,4],[7,9,6]]
Output: 7  (jobs [1,4,3] and [2,5,4] overlap → load = 3+4 = 7)
```

**Test Cases:**
```
[[1,4,3],[2,5,4],[7,9,6]]        → 7
[[6,7,10],[2,4,11],[8,12,15]]    → 15
[[1,4,2],[2,4,1],[3,6,5]]        → 8
[[1,2,1]]                        → 1
```

### Intuition
Use the **sweep line + heap** technique. Sort by start. Use a min-heap to track active jobs (sorted by end). When a new job starts, evict all jobs that have already ended, then add the new job's load to the running total.

### Why Heap Works Here
We need to quickly find and remove jobs that ended before the current one starts. A min-heap on end times gives us the earliest-ending job in O(log n).

### Approach
1. Sort by start time.
2. Min-heap stores `[end, load]`.
3. For each job:
   - Pop all heap entries with `end <= current.start` (subtracting their load).
   - Push current job, add its load.
   - Track `maxLoad`.

**Time:** O(n log n) | **Space:** O(n)

### Java Code
```java
import java.util.*;

public class MaxCPULoad {
    public int findMaxCPULoad(int[][] jobs) {
        Arrays.sort(jobs, (a, b) -> a[0] - b[0]);
        
        // Min-heap by end time
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        
        int maxLoad = 0, currentLoad = 0;
        
        for (int[] job : jobs) {
            int start = job[0], end = job[1], load = job[2];
            
            // Remove jobs that ended before this one starts
            while (!heap.isEmpty() && heap.peek()[0] <= start) {
                currentLoad -= heap.poll()[1];
            }
            
            heap.offer(new int[]{end, load});
            currentLoad += load;
            maxLoad = Math.max(maxLoad, currentLoad);
        }
        
        return maxLoad;
    }
    
    public static void main(String[] args) {
        MaxCPULoad sol = new MaxCPULoad();
        System.out.println(sol.findMaxCPULoad(new int[][]{{1,4,3},{2,5,4},{7,9,6}})); // 7
        System.out.println(sol.findMaxCPULoad(new int[][]{{1,4,2},{2,4,1},{3,6,5}})); // 8
    }
}
```

---

<a id="employee-free-time"></a>
## Problem 8 — Employee Free Time

### Problem Statement
Given a list of employees, each with a list of non-overlapping, sorted work intervals, find the **list of finite intervals representing their common free time** (intervals when NO employee is working).

**Example:**
```
Input:  [[[1,3],[6,7]], [[2,4]], [[2,5],[9,12]]]
Output: [[5,6],[7,9]]
```

**Test Cases:**
```
[[[1,3],[6,7]],[[2,4]],[[2,5],[9,12]]]   → [[5,6],[7,9]]
[[[1,3],[9,10]],[[2,4]],[[6,8]]]         → [[4,6],[8,9]]
[[[1,2],[5,6]],[[3,4]]]                  → [[2,3],[4,5]]
```

### Intuition
Flatten all intervals into one list, sort them, then find the **gaps between consecutive merged intervals** — those gaps are the free time.

Alternatively (interview-preferred): use a **min-heap** that streams intervals in sorted order by start, merging as you go and detecting gaps.

### Why This Is an Interval Problem
After merging all employee schedules, free time = gaps between merged blocks. This is just Merge Intervals + gap detection.

### Approach
1. Collect all intervals from all employees into one list.
2. Sort by start time.
3. Merge overlapping intervals (like Problem 1).
4. The gaps between merged intervals are the free times.

**Time:** O(n log n) | **Space:** O(n)

### Java Code
```java
import java.util.*;

public class EmployeeFreeTime {
    
    static class Interval {
        int start, end;
        Interval(int s, int e) { start = s; end = e; }
    }
    
    public List<Interval> employeeFreeTime(List<List<Interval>> schedule) {
        List<Interval> all = new ArrayList<>();
        for (List<Interval> emp : schedule) all.addAll(emp);
        
        all.sort((a, b) -> a.start - b.start);
        
        List<Interval> merged = new ArrayList<>();
        Interval current = all.get(0);
        
        for (int i = 1; i < all.size(); i++) {
            Interval next = all.get(i);
            if (next.start <= current.end) {
                current.end = Math.max(current.end, next.end);
            } else {
                merged.add(current);
                current = next;
            }
        }
        merged.add(current);
        
        // Gaps between merged intervals = free time
        List<Interval> freeTime = new ArrayList<>();
        for (int i = 1; i < merged.size(); i++) {
            freeTime.add(new Interval(merged.get(i - 1).end, merged.get(i).start));
        }
        
        return freeTime;
    }
    
    public static void main(String[] args) {
        EmployeeFreeTime sol = new EmployeeFreeTime();
        List<List<Interval>> schedule = Arrays.asList(
            Arrays.asList(new Interval(1,3), new Interval(6,7)),
            Arrays.asList(new Interval(2,4)),
            Arrays.asList(new Interval(2,5), new Interval(9,12))
        );
        List<Interval> free = sol.employeeFreeTime(schedule);
        for (Interval i : free) System.out.println("[" + i.start + "," + i.end + "]");
        // [5,6] [7,9]
    }
}
```

---

<a id="interval-list-intersections"></a>
## Problem 9 — Interval List Intersections

### Problem Statement
Given two sorted lists of non-overlapping intervals `A` and `B`, find all **intersecting intervals** between them.

**Example:**
```
Input:  A = [[0,2],[5,10],[13,23],[24,25]]
        B = [[1,5],[8,12],[15,24],[25,26]]
Output: [[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]
```

**Test Cases:**
```
A=[[0,2],[5,10]], B=[[1,5],[8,12]]        → [[1,2],[5,5],[8,10]]
A=[[1,3],[5,9]], B=[]                     → []
A=[[1,7]], B=[[3,10]]                     → [[3,7]]
A=[[1,2]], B=[[1,2]]                      → [[1,2]]
```

### Intuition
Use the **two-pointer technique**. Walk through both lists simultaneously. For each pair, compute the intersection (if any). Then advance the pointer of whichever interval ends first — it can't possibly intersect with future intervals in the other list.

### Intersection Formula
```
lo = max(A[i].start, B[j].start)
hi = min(A[i].end, B[j].end)
if lo <= hi → intersection exists: [lo, hi]
```

### Approach
1. Two pointers `i=0, j=0`.
2. Compute intersection of `A[i]` and `B[j]`.
3. If valid, add to result.
4. Advance the pointer whose interval ends earlier.

**Time:** O(m + n) | **Space:** O(m + n)

### Java Code
```java
import java.util.*;

public class IntervalIntersection {
    public int[][] intervalIntersection(int[][] firstList, int[][] secondList) {
        List<int[]> result = new ArrayList<>();
        int i = 0, j = 0;
        
        while (i < firstList.length && j < secondList.length) {
            int lo = Math.max(firstList[i][0], secondList[j][0]);
            int hi = Math.min(firstList[i][1], secondList[j][1]);
            
            if (lo <= hi) {
                result.add(new int[]{lo, hi});
            }
            
            // Move the pointer of the interval that ends sooner
            if (firstList[i][1] < secondList[j][1]) {
                i++;
            } else {
                j++;
            }
        }
        
        return result.toArray(new int[result.size()][]);
    }
    
    public static void main(String[] args) {
        IntervalIntersection sol = new IntervalIntersection();
        int[][] res = sol.intervalIntersection(
            new int[][]{{0,2},{5,10},{13,23},{24,25}},
            new int[][]{{1,5},{8,12},{15,24},{25,26}}
        );
        for (int[] r : res) System.out.println(Arrays.toString(r));
        // [1,2] [5,5] [8,10] [15,23] [24,24] [25,25]
    }
}
```

---

<a id="summary-ranges--data-stream-as-disjoint-intervals"></a>
## Problem 10 — Summary Ranges / Data Stream as Disjoint Intervals

### Problem Statement
Design a data structure that takes a stream of integers and, after each addition, returns the **summary as a list of disjoint intervals**.

**Example:**
```
add(1)  → [[1,1]]
add(3)  → [[1,1],[3,3]]
add(7)  → [[1,1],[3,3],[7,7]]
add(2)  → [[1,3],[7,7]]
add(6)  → [[1,3],[6,7]]
```

**Test Cases:**
```
add 1,3,7,2,6 → [[1,3],[6,7]]
add 1,2,3     → [[1,3]]
add 5,3,1     → [[1,1],[3,3],[5,5]]
add 1,2,4,3   → [[1,4]]
```

### Intuition
Use a **TreeMap** (sorted map) where keys are interval starts and values are interval ends. For each new number, check:
- Does it merge with the interval ending just before it (`num - 1`)?
- Does it merge with the interval starting just after it (`num + 1`)?
- Could it merge both (bridging two existing intervals)?

### Why TreeMap
`floorKey()` and `ceilingKey()` give us the adjacent intervals in O(log n), making merge checks efficient.

### Approach
For each `num`:
1. Find `left = floorKey(num)` and check if `num <= map.get(left) + 1`.
2. Find `right = ceilingKey(num)` and check if `num >= right - 1`.
3. Merge accordingly: potentially remove two entries and add one spanning entry.

**Time per add:** O(log n) | **Space:** O(n)

### Java Code
```java
import java.util.*;

public class DataStreamIntervals {
    TreeMap<Integer, Integer> map; // start → end
    
    public DataStreamIntervals() {
        map = new TreeMap<>();
    }
    
    public void addNum(int num) {
        if (map.containsKey(num)) return; // Already in an interval starting here
        
        Integer left = map.floorKey(num);   // Largest start ≤ num
        Integer right = map.ceilingKey(num); // Smallest start ≥ num
        
        boolean mergeLeft  = left != null && map.get(left) + 1 >= num;
        boolean mergeRight = right != null && right - 1 <= num;
        
        if (mergeLeft && mergeRight) {
            // Bridge two intervals
            map.put(left, map.get(right));
            map.remove(right);
        } else if (mergeLeft) {
            // Extend left interval
            map.put(left, Math.max(map.get(left), num));
        } else if (mergeRight) {
            // Extend right interval leftward
            map.put(num, map.get(right));
            map.remove(right);
        } else {
            // Standalone interval
            map.put(num, num);
        }
    }
    
    public List<List<Integer>> getIntervals() {
        List<List<Integer>> result = new ArrayList<>();
        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            result.add(Arrays.asList(entry.getKey(), entry.getValue()));
        }
        return result;
    }
    
    public static void main(String[] args) {
        DataStreamIntervals obj = new DataStreamIntervals();
        int[] stream = {1, 3, 7, 2, 6};
        for (int n : stream) {
            obj.addNum(n);
            System.out.println("After adding " + n + ": " + obj.getIntervals());
        }
        // After adding 1: [[1, 1]]
        // After adding 3: [[1, 1], [3, 3]]
        // After adding 7: [[1, 1], [3, 3], [7, 7]]
        // After adding 2: [[1, 3], [7, 7]]
        // After adding 6: [[1, 3], [6, 7]]
    }
}
```

---

## Quick Reference Cheatsheet

| # | Problem | Key Idea | Sort By | Data Structure | Time |
|---|---------|----------|---------|----------------|------|
| 1 | Merge Intervals | Extend end if overlap | Start | List | O(n log n) |
| 2 | Insert Interval | 3-phase walk | Pre-sorted | List | O(n) |
| 3 | Meeting Rooms I | Any adjacent conflict? | Start | — | O(n log n) |
| 4 | Meeting Rooms II | Min rooms = heap size | Start | Min-Heap | O(n log n) |
| 5 | Non-Overlapping | Keep earliest-ending | End | — | O(n log n) |
| 6 | Burst Balloons | Count non-overlap groups | End | — | O(n log n) |
| 7 | Max CPU Load | Sweep + active job sum | Start | Min-Heap | O(n log n) |
| 8 | Employee Free Time | Merge all, find gaps | Start | List | O(n log n) |
| 9 | Interval Intersection | Two-pointer lo/hi | Pre-sorted | Two Pointers | O(m+n) |
| 10 | Data Stream Intervals | Merge neighbors | Auto (TreeMap) | TreeMap | O(log n)/add |

---

## Decision Tree for Interval Problems

```
Given interval problem...
│
├── "Merge/combine overlapping" → Sort by START, walk + extend
│
├── "Insert into sorted list" → 3-phase (before / merge / after)
│
├── "Can attend all / no conflict?" → Sort by START, check adjacent pairs
│
├── "Minimum rooms/resources needed" → Sort by START + Min-Heap on end times
│
├── "Minimum removals for non-overlap" → Sort by END, greedy keep earliest-end
│
├── "Minimum arrows/groups" → Same as above (Activity Selection)
│
├── "Maximum overlap at any point" → Sort by START + Min-Heap or sweep line
│
├── "Find gaps/free time" → Merge all, then look at gaps
│
├── "Intersection of two lists" → Two pointers, lo=max(starts), hi=min(ends)
│
└── "Online/streaming + query" → TreeMap with floorKey/ceilingKey
```

---

## The 5 Patterns You Must Know

1. **Sort by Start + Greedy Extend** → Merge, Insert
2. **Sort by End + Greedy Keep** → Non-Overlapping, Burst Balloons
3. **Sort by Start + Min-Heap** → Meeting Rooms II, CPU Load
4. **Two Pointers on Two Sorted Lists** → Intersection
5. **TreeMap for Online Intervals** → Data Stream

Master these five and you can solve **any** interval problem in an interview.