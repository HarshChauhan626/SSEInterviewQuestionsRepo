# Two Pointer Pattern — Complete Guide

> **Coverage:** These 10 problems cover ~95% of all Two Pointer interview questions across FAANG and competitive programming. Master these and you'll recognize every variant.

---

## What is Two Pointer?

Two Pointer is a technique where you maintain **two indices** (pointers) into a data structure — typically an array or string — and move them strategically to avoid nested loops. Instead of O(n²) brute force, you get **O(n) or O(n log n)** solutions.

### The 3 Core Variants

| Variant | Setup | When to Use |
|---|---|---|
| **Opposite Ends** | `left=0, right=n-1` | Sorted array, pair sums, palindromes |
| **Same Direction (Slow/Fast)** | `slow=0, fast=0` | Subarrays, duplicates, sliding window |
| **Two Arrays** | `i=0, j=0` | Merging, comparing two sequences |

### The Mental Checklist
1. Is the array **sorted** (or can it be)? → Opposite ends
2. Am I looking for a **subarray/window**? → Slow/fast or sliding window
3. Am I processing **two sequences**? → Two-array pointers
4. Does brute force use **nested loops** over the same array? → Two pointer likely applies

---

## Table of Contents

| # | Problem | Difficulty | Jump to Solution |
|---|---------|:----------:|-----------------|
| 1 | Two Sum II (Sorted Array) | 🟢 Easy | [→ #1](#two-sum-ii-sorted-array) |
| 2 | Container With Most Water | 🟡 Medium | [→ #2](#container-with-most-water) |
| 3 | 3Sum | 🟡 Medium | [→ #3](#3sum) |
| 4 | Remove Duplicates from Sorted Array | 🟢 Easy | [→ #4](#remove-duplicates-from-sorted-array) |
| 5 | Linked List Cycle Detection (Floyd's Algorithm) | 🟢 Easy | [→ #5](#linked-list-cycle-detection-floyds-algorithm) |
| 6 | Trapping Rain Water | 🔴 Hard | [→ #6](#trapping-rain-water) |
| 7 | Minimum Size Subarray Sum | 🟡 Medium | [→ #7](#minimum-size-subarray-sum) |
| 8 | Longest Substring Without Repeating Characters | 🟡 Medium | [→ #8](#longest-substring-without-repeating-characters) |
| 9 | Sort Colors (Dutch National Flag) | 🟡 Medium | [→ #9](#sort-colors-dutch-national-flag) |
| 10 | Merge Sorted Array | 🟢 Easy | [→ #10](#merge-sorted-array) |

---

<a id="two-sum-ii-sorted-array"></a>
## Problem 1 — Two Sum II (Sorted Array)

**LeetCode 167** | Difficulty: Easy | Variant: Opposite Ends

### Problem Statement
Given a **1-indexed** sorted array `numbers` and a target integer `target`, return the indices `[index1, index2]` of the two numbers such that they add up to `target`. Exactly one solution exists.

**Constraints:** `2 ≤ numbers.length ≤ 10⁵`, `-1000 ≤ numbers[i] ≤ 1000`

### Examples
```
Input:  numbers = [2, 7, 11, 15], target = 9
Output: [1, 2]   (2 + 7 = 9)

Input:  numbers = [2, 3, 4], target = 6
Output: [1, 3]   (2 + 4 = 6)

Input:  numbers = [-1, 0], target = -1
Output: [1, 2]
```

### Intuition
The array is already sorted. If we pick `numbers[left] + numbers[right]`:
- Sum **too small** → we need a bigger number → move `left` right
- Sum **too big** → we need a smaller number → move `right` left
- Sum **equals target** → done

This works because sorting gives us **monotonic control**: moving left up only increases the sum; moving right down only decreases it.

### Why Two Pointer (Not HashMap)?
- HashMap gives O(n) time but O(n) space.
- Two pointer gives O(n) time and **O(1) space** — and the sorted constraint is the hint the interviewer wants you to exploit.

### Java Code
```java
public int[] twoSum(int[] numbers, int target) {
    int left = 0, right = numbers.length - 1;

    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) {
            return new int[]{left + 1, right + 1}; // 1-indexed
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return new int[]{-1, -1}; // guaranteed to find answer
}
```

### Test Cases
```
[2,7,11,15], target=9   → [1,2]   ✓ basic case
[2,3,4],     target=6   → [1,3]   ✓ skip middle
[-1,0],      target=-1  → [1,2]   ✓ negatives
[1,2,3,4,5], target=9   → [4,5]   ✓ end of array
```

**Time:** O(n) | **Space:** O(1)

---

<a id="container-with-most-water"></a>
## Problem 2 — Container With Most Water

**LeetCode 11** | Difficulty: Medium | Variant: Opposite Ends

### Problem Statement
Given `n` non-negative integers `height[i]` representing vertical lines, find two lines that together with the x-axis form a container that holds the **most water**.

**Constraints:** `2 ≤ height.length ≤ 10⁵`, `0 ≤ height[i] ≤ 10⁴`

### Examples
```
Input:  height = [1,8,6,2,5,4,8,3,7]
Output: 49
(lines at index 1 (height=8) and 8 (height=7): min(8,7) * (8-1) = 7*7 = 49)

Input:  height = [1,1]
Output: 1
```

### Intuition
Water volume = `min(height[left], height[right]) * (right - left)`.

Start with the widest container (left=0, right=n-1). To potentially improve:
- Moving the **taller** side inward can only decrease width with no guarantee of increasing height.
- Moving the **shorter** side inward might find a taller line and increase the area despite reduced width.

So: always move the pointer at the **shorter line** inward.

### Why This Greedy Works
When we move the shorter side, we're eliminating all pairs that include the current shorter side with any position to the right (for left pointer). Those pairs are all smaller because:
- Width is strictly smaller
- Height is bounded by the same short line

So we safely skip them.

### Java Code
```java
public int maxArea(int[] height) {
    int left = 0, right = height.length - 1;
    int maxWater = 0;

    while (left < right) {
        int h = Math.min(height[left], height[right]);
        int width = right - left;
        maxWater = Math.max(maxWater, h * width);

        // Move the shorter side
        if (height[left] <= height[right]) {
            left++;
        } else {
            right--;
        }
    }
    return maxWater;
}
```

### Test Cases
```
[1,8,6,2,5,4,8,3,7] → 49   ✓ classic case
[1,1]                → 1    ✓ minimal
[4,3,2,1,4]          → 16   ✓ symmetric
[1,2,1]              → 2    ✓ small
[1,2,4,3]            → 4    ✓ asymmetric
```

**Time:** O(n) | **Space:** O(1)

---

<a id="3sum"></a>
## Problem 3 — 3Sum

**LeetCode 15** | Difficulty: Medium | Variant: Opposite Ends + Sorting

### Problem Statement
Given an integer array `nums`, return all triplets `[nums[i], nums[j], nums[k]]` such that `i ≠ j ≠ k` and `nums[i] + nums[j] + nums[k] == 0`. The solution set must **not contain duplicate triplets**.

**Constraints:** `3 ≤ nums.length ≤ 3000`, `-10⁵ ≤ nums[i] ≤ 10⁵`

### Examples
```
Input:  nums = [-1, 0, 1, 2, -1, -4]
Output: [[-1,-1,2],[-1,0,1]]

Input:  nums = [0, 1, 1]
Output: []

Input:  nums = [0, 0, 0]
Output: [[0,0,0]]
```

### Intuition
Sort the array first. Fix one number `nums[i]`, then use **Two Sum II** on the remaining subarray `[i+1, n-1]` to find pairs summing to `-nums[i]`.

Sorting also lets us **skip duplicates** easily: if `nums[i] == nums[i-1]`, the same `i` would produce duplicate triplets, so skip.

### Why Sort First?
- Without sorting, detecting and skipping duplicates requires a HashSet (O(n) space).
- With sorting, duplicates are adjacent — skip with a simple `continue`.
- Sorting costs O(n log n) but reduces overall complexity from O(n³) → O(n²).

### Java Code
```java
public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> result = new ArrayList<>();

    for (int i = 0; i < nums.length - 2; i++) {
        // Skip duplicates for the fixed element
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        // Early exit: smallest triplet sum is already > 0
        if (nums[i] > 0) break;

        int left = i + 1, right = nums.length - 1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                // Skip duplicates for left and right
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return result;
}
```

### Test Cases
```
[-1,0,1,2,-1,-4]  → [[-1,-1,2],[-1,0,1]]  ✓ two triplets
[0,1,1]           → []                      ✓ no valid triplet
[0,0,0]           → [[0,0,0]]               ✓ all zeros
[-2,0,0,2,2]      → [[-2,0,2]]              ✓ duplicate handling
[-4,-1,-1,0,1,2]  → [[-1,-1,2],[-1,0,1]]   ✓ sorted input
```

**Time:** O(n²) | **Space:** O(1) (excluding output)

---

<a id="remove-duplicates-from-sorted-array"></a>
## Problem 4 — Remove Duplicates from Sorted Array

**LeetCode 26** | Difficulty: Easy | Variant: Slow/Fast (Same Direction)

### Problem Statement
Given a sorted integer array `nums`, remove duplicates **in-place** so each unique element appears only once. Return `k` — the number of unique elements. The first `k` elements of `nums` must contain the unique elements in order.

**Constraints:** `1 ≤ nums.length ≤ 3 × 10⁴`, `-100 ≤ nums[i] ≤ 100`

### Examples
```
Input:  nums = [1,1,2]
Output: 2, nums = [1,2,_]

Input:  nums = [0,0,1,1,1,2,2,3,3,4]
Output: 5, nums = [0,1,2,3,4,_,_,_,_,_]
```

### Intuition
Use a **slow pointer** `k` that tracks where to write the next unique element, and a **fast pointer** `i` that scans for new unique values.

When `nums[i] ≠ nums[k-1]` (found a new unique number), write it at position `k` and advance `k`.

Think of `slow` as the "write head" and `fast` as the "read head."

### The Key Insight
Because the array is sorted, all duplicates of a value are adjacent. The fast pointer skips over duplicates automatically — it just keeps moving until it finds a value different from what the slow pointer last wrote.

### Java Code
```java
public int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;

    int k = 1; // slow pointer: next write position (first element is always unique)

    for (int i = 1; i < nums.length; i++) { // fast pointer
        if (nums[i] != nums[k - 1]) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}
```

### Test Cases
```
[1,1,2]               → k=2, [1,2,...]          ✓ basic duplicate
[0,0,1,1,1,2,2,3,3,4] → k=5, [0,1,2,3,4,...]   ✓ multiple duplicates
[1,2,3]               → k=3, [1,2,3]             ✓ no duplicates
[1,1,1,1]             → k=1, [1,...]             ✓ all same
[1]                   → k=1, [1]                 ✓ single element
```

**Time:** O(n) | **Space:** O(1)

---

<a id="linked-list-cycle-detection-floyds-algorithm"></a>
## Problem 5 — Linked List Cycle Detection (Floyd's Algorithm)

**LeetCode 141 / 142** | Difficulty: Easy/Medium | Variant: Slow/Fast Pointers

### Problem Statement
**141:** Given the head of a linked list, determine if it has a cycle.
**142:** If a cycle exists, return the **node where the cycle begins**. Return `null` if no cycle.

**Constraints:** `0 ≤ list length ≤ 10⁴`, `-10⁵ ≤ Node.val ≤ 10⁵`

### Examples
```
141:
Input:  3 → 2 → 0 → -4 → (back to 2)
Output: true

142:
Input:  3 → 2 → 0 → -4 → (back to 2)
Output: Node with value 2 (cycle start)

Input:  1 → 2 → null
Output: null (no cycle)
```

### Intuition (Cycle Detection)
`slow` moves 1 step at a time; `fast` moves 2 steps. If there's a cycle, fast will eventually lap slow — they must meet inside the cycle. If no cycle, fast hits `null`.

### Intuition (Cycle Start — 142)
This is the mathematical gem of Floyd's algorithm. Let:
- `F` = distance from head to cycle start
- `C` = cycle length
- `a` = distance from cycle start to meeting point

When they meet: slow traveled `F + a`, fast traveled `F + a + n*C`.
Since fast = 2 × slow: `F + a + n*C = 2(F + a)` → `F = n*C - a`.

So if we reset one pointer to `head` and move both one step at a time, they'll meet exactly at the **cycle start**.

### Java Code
```java
// 141: Detect cycle
public boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}

// 142: Find cycle start
public ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;

    // Phase 1: Find meeting point
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            // Phase 2: Find cycle start
            ListNode pointer = head;
            while (pointer != slow) {
                pointer = pointer.next;
                slow = slow.next;
            }
            return pointer; // cycle start
        }
    }
    return null; // no cycle
}
```

### Test Cases
```
3→2→0→-4→(→2)   hasCycle=true,  detectCycle=node(2)   ✓
1→2→(→1)         hasCycle=true,  detectCycle=node(1)   ✓ cycle from head
1→2→null         hasCycle=false, detectCycle=null       ✓ no cycle
null             hasCycle=false, detectCycle=null       ✓ empty list
```

**Time:** O(n) | **Space:** O(1)

---

<a id="trapping-rain-water"></a>
## Problem 6 — Trapping Rain Water

**LeetCode 42** | Difficulty: Hard | Variant: Opposite Ends

### Problem Statement
Given `n` non-negative integers `height` representing an elevation map where each bar has width 1, compute how much water it can trap after raining.

**Constraints:** `1 ≤ height.length ≤ 2 × 10⁴`, `0 ≤ height[i] ≤ 10⁵`

### Examples
```
Input:  height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6

Input:  height = [4,2,0,3,2,5]
Output: 9
```

### Intuition
Water at position `i` is `min(maxLeft[i], maxRight[i]) - height[i]`.

The naive approach precomputes `maxLeft` and `maxRight` arrays (O(n) space).

**Two pointer insight:** We don't need both arrays at once. We can maintain running maximums from each end:
- If `maxLeft < maxRight`: the left side is the bottleneck. Water at `left` is `maxLeft - height[left]`. We can safely compute this because we know the right side is at least as high as `maxRight ≥ maxLeft`.
- Else: symmetric logic from the right.

### Why We Can Compute Without Full Precomputation
When `maxLeft ≤ maxRight`, the water trapped at `left` is determined by `maxLeft`, not by what's to its right (which is ≥ maxLeft). So we can process `left` confidently.

### Java Code
```java
public int trap(int[] height) {
    int left = 0, right = height.length - 1;
    int maxLeft = 0, maxRight = 0;
    int water = 0;

    while (left < right) {
        if (height[left] <= height[right]) {
            if (height[left] >= maxLeft) {
                maxLeft = height[left];
            } else {
                water += maxLeft - height[left];
            }
            left++;
        } else {
            if (height[right] >= maxRight) {
                maxRight = height[right];
            } else {
                water += maxRight - height[right];
            }
            right--;
        }
    }
    return water;
}
```

### Test Cases
```
[0,1,0,2,1,0,1,3,2,1,2,1] → 6   ✓ classic case
[4,2,0,3,2,5]              → 9   ✓ descending then ascending
[3,0,0,2,0,4]              → 10  ✓ deep valleys
[1,0,1]                    → 1   ✓ minimal trap
[1,2,3,4]                  → 0   ✓ monotone, no trap
```

**Time:** O(n) | **Space:** O(1)

---

<a id="minimum-size-subarray-sum"></a>
## Problem 7 — Minimum Size Subarray Sum

**LeetCode 209** | Difficulty: Medium | Variant: Slow/Fast (Sliding Window)

### Problem Statement
Given an array of positive integers `nums` and a positive integer `target`, return the **minimum length** of a subarray whose sum is ≥ `target`. Return `0` if no such subarray exists.

**Constraints:** `1 ≤ target ≤ 10⁹`, `1 ≤ nums.length ≤ 10⁵`, `1 ≤ nums[i] ≤ 10⁴`

### Examples
```
Input:  target=7, nums=[2,3,1,2,4,3]
Output: 2   ([4,3])

Input:  target=4, nums=[1,4,4]
Output: 1   ([4])

Input:  target=11, nums=[1,1,1,1,1,1,1,1]
Output: 0   (impossible)
```

### Intuition
Use `left` and `right` as the window boundaries. Expand `right` to grow the window sum. Once the sum ≥ target, record the window length, then **shrink from the left** to try to minimize it.

Because all elements are **positive**, shrinking the window always decreases the sum — so we can safely use two pointers (not possible with negative numbers).

### Why Not Nested Loops?
Naive is O(n²): for every start, find the shortest valid end. Two pointer is O(n): each element is added once (right moves) and removed at most once (left moves).

### Java Code
```java
public int minSubArrayLen(int target, int[] nums) {
    int left = 0, sum = 0;
    int minLen = Integer.MAX_VALUE;

    for (int right = 0; right < nums.length; right++) {
        sum += nums[right];

        while (sum >= target) {
            minLen = Math.min(minLen, right - left + 1);
            sum -= nums[left];
            left++;
        }
    }
    return minLen == Integer.MAX_VALUE ? 0 : minLen;
}
```

### Test Cases
```
target=7,  [2,3,1,2,4,3]       → 2   ✓ [4,3]
target=4,  [1,4,4]             → 1   ✓ single element
target=11, [1,1,1,1,1,1,1,1]  → 0   ✓ impossible
target=15, [1,2,3,4,5]        → 5   ✓ entire array
target=6,  [10,2,3]           → 1   ✓ first element alone
```

**Time:** O(n) | **Space:** O(1)

---

<a id="longest-substring-without-repeating-characters"></a>
## Problem 8 — Longest Substring Without Repeating Characters

**LeetCode 3** | Difficulty: Medium | Variant: Slow/Fast + HashMap

### Problem Statement
Given a string `s`, find the length of the **longest substring without repeating characters**.

**Constraints:** `0 ≤ s.length ≤ 5 × 10⁴`, `s` consists of English letters, digits, symbols, and spaces.

### Examples
```
Input:  s = "abcabcbb"
Output: 3   ("abc")

Input:  s = "bbbbb"
Output: 1   ("b")

Input:  s = "pwwkew"
Output: 3   ("wke")
```

### Intuition
Maintain a window `[left, right]` with no duplicate characters. Use a HashMap to track the **last seen index** of each character.

When we encounter a character already in our window, we jump `left` forward to just after where that character was last seen — effectively expelling the duplicate.

### The Key Trick
Instead of removing characters one by one from left (slow), we use `left = Math.max(left, lastSeen[char] + 1)`. The `Math.max` handles the case where the duplicate was seen before our current window (left pointer shouldn't go backwards).

### Java Code
```java
public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> lastSeen = new HashMap<>();
    int maxLen = 0, left = 0;

    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);

        // If char was seen within current window, jump left past it
        if (lastSeen.containsKey(c)) {
            left = Math.max(left, lastSeen.get(c) + 1);
        }

        lastSeen.put(c, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}
```

### Test Cases
```
"abcabcbb"  → 3   ✓ "abc"
"bbbbb"     → 1   ✓ "b"
"pwwkew"    → 3   ✓ "wke"
""          → 0   ✓ empty string
"au"        → 2   ✓ all unique
"dvdf"      → 3   ✓ jump over stale char
```

**Time:** O(n) | **Space:** O(min(n, alphabet_size))

---

<a id="sort-colors-dutch-national-flag"></a>
## Problem 9 — Sort Colors (Dutch National Flag)

**LeetCode 75** | Difficulty: Medium | Variant: Three Pointers

### Problem Statement
Given an array `nums` containing only `0`s, `1`s, and `2`s, sort it **in-place** in a single pass **without using a sort function**.

**Constraints:** `1 ≤ nums.length ≤ 300`, `nums[i] ∈ {0, 1, 2}`

### Examples
```
Input:  nums = [2,0,2,1,1,0]
Output: [0,0,1,1,2,2]

Input:  nums = [2,0,1]
Output: [0,1,2]
```

### Intuition — Dutch National Flag Algorithm
Maintain three regions:
- `[0, low-1]` → all 0s
- `[low, mid-1]` → all 1s
- `[mid, high]` → unsorted
- `[high+1, n-1]` → all 2s

Process `nums[mid]`:
- If `0`: swap with `nums[low]`, advance both `low` and `mid`
- If `1`: it's in the right region, advance `mid`
- If `2`: swap with `nums[high]`, shrink `high` (don't advance `mid` — the swapped element is unprocessed)

### Why Not Count Sort?
Count sort (count 0s/1s/2s, rewrite) uses **two passes**. Dutch flag does it in **one pass, O(1) space** — the interviewer's goal.

### Java Code
```java
public void sortColors(int[] nums) {
    int low = 0, mid = 0, high = nums.length - 1;

    while (mid <= high) {
        if (nums[mid] == 0) {
            // Swap with low region
            int temp = nums[low];
            nums[low] = nums[mid];
            nums[mid] = temp;
            low++;
            mid++;
        } else if (nums[mid] == 1) {
            mid++; // already in correct region
        } else { // nums[mid] == 2
            // Swap with high region
            int temp = nums[mid];
            nums[mid] = nums[high];
            nums[high] = temp;
            high--;
            // Don't increment mid: nums[mid] is now unprocessed
        }
    }
}
```

### Test Cases
```
[2,0,2,1,1,0]  → [0,0,1,1,2,2]  ✓ mixed
[2,0,1]        → [0,1,2]         ✓ one of each
[0]            → [0]             ✓ single element
[1,0,0,1,2,2]  → [0,0,1,1,2,2]  ✓ already partially sorted
[2,2,2,0,0,0]  → [0,0,0,2,2,2]  ✓ all 2s then all 0s
```

**Time:** O(n) | **Space:** O(1)

---

<a id="merge-sorted-array"></a>
## Problem 10 — Merge Sorted Array

**LeetCode 88** | Difficulty: Easy | Variant: Two-Array Pointers (Reverse)

### Problem Statement
You are given two sorted arrays `nums1` (with size `m+n`, last `n` slots are 0) and `nums2` (size `n`). Merge `nums2` into `nums1` **in-place** in sorted order.

**Constraints:** `0 ≤ m, n ≤ 200`, `-10⁹ ≤ nums1[i], nums2[i] ≤ 10⁹`

### Examples
```
Input:  nums1=[1,2,3,0,0,0], m=3, nums2=[2,5,6], n=3
Output: [1,2,2,3,5,6]

Input:  nums1=[1], m=1, nums2=[], n=0
Output: [1]

Input:  nums1=[0], m=0, nums2=[1], n=1
Output: [1]
```

### Intuition
Merging forward overwrites elements in `nums1` we haven't processed yet. 

The trick: **merge from the back.** Since the end of `nums1` is empty (zeros), filling it from the largest element backward never overwrites unprocessed data.

Use three pointers:
- `p1 = m-1` (last real element of nums1)
- `p2 = n-1` (last element of nums2)
- `p = m+n-1` (write position)

At each step, place the larger of `nums1[p1]` and `nums2[p2]` at position `p`.

### Why Backwards?
Forward merge requires extra space (copy nums1 first). Backwards merge works in-place because we're filling the "free" space at the end — guaranteed to never collide with elements yet to be processed.

### Java Code
```java
public void merge(int[] nums1, int m, int[] nums2, int n) {
    int p1 = m - 1;     // pointer for nums1 real elements
    int p2 = n - 1;     // pointer for nums2
    int p = m + n - 1;  // write position (back of nums1)

    while (p1 >= 0 && p2 >= 0) {
        if (nums1[p1] > nums2[p2]) {
            nums1[p] = nums1[p1];
            p1--;
        } else {
            nums1[p] = nums2[p2];
            p2--;
        }
        p--;
    }

    // If nums2 has remaining elements (nums1 is exhausted)
    while (p2 >= 0) {
        nums1[p] = nums2[p2];
        p2--;
        p--;
    }
    // No need to handle remaining nums1: already in place
}
```

### Test Cases
```
[1,2,3,0,0,0] m=3, [2,5,6] n=3  → [1,2,2,3,5,6]  ✓ overlapping values
[1] m=1, [] n=0                  → [1]             ✓ empty nums2
[0] m=0, [1] n=1                 → [1]             ✓ empty nums1
[4,5,6,0,0,0] m=3, [1,2,3] n=3  → [1,2,3,4,5,6]  ✓ nums2 all smaller
[1,2,3,0,0,0] m=3, [4,5,6] n=3  → [1,2,3,4,5,6]  ✓ nums2 all larger
```

**Time:** O(m+n) | **Space:** O(1)

---

## Pattern Recognition Summary

| Problem | Variant | Key Signal |
|---|---|---|
| Two Sum II | Opposite Ends | Sorted array + pair sum |
| Container With Most Water | Opposite Ends | Maximize area/volume |
| 3Sum | Sort + Opposite Ends | Triplet sum = 0 |
| Remove Duplicates | Slow/Fast | In-place dedup, sorted |
| Linked List Cycle | Slow/Fast | Cycle detection |
| Trapping Rain Water | Opposite Ends | Min of two maxima |
| Min Size Subarray | Sliding Window | Subarray sum ≥ target |
| Longest Unique Substring | Sliding Window + Map | No-repeat window |
| Sort Colors | Three Pointers | Partition into 3 groups |
| Merge Sorted Array | Two-Array Reverse | Merge without extra space |

## Common Mistakes to Avoid

1. **Forgetting to handle duplicate skipping in 3Sum** — leads to duplicate triplets in output.
2. **Moving mid after swapping a 2 in Dutch Flag** — the swapped element is unprocessed, don't skip it.
3. **Using `lastSeen.containsKey` without `Math.max` in sliding window** — left pointer can jump backwards.
4. **Moving the taller bar in Container With Most Water** — the shorter bar is always the bottleneck.
5. **Not handling remaining elements in Merge Sorted Array** — only nums2 remainder matters; nums1 is already in place.

---

*Two pointers shine wherever brute force uses nested loops on a linear structure. Once you see the pattern, you'll never write O(n²) when O(n) is possible.*