# Monotonic Stack — Complete Pattern Guide

> 10 problems covering ~95% of all monotonic stack interview questions.

---

## What is a Monotonic Stack?

A **monotonic stack** is a stack that maintains elements in either strictly increasing or strictly decreasing order from bottom to top. When a new element violates the monotonic property, elements are popped and processed before pushing.

### Core Intuition

Think of it as: *"I'm looking for the next element that is greater/smaller than me."*

Every element waits in the stack until it finds its "answer" (the next greater, next smaller, etc.). The moment that answer arrives, the element gets popped and its answer is recorded.

### When to Use

| Signal in problem | Stack type |
|---|---|
| Next Greater Element | Monotonic Decreasing |
| Next Smaller Element | Monotonic Increasing |
| Previous Greater Element | Monotonic Decreasing (left pass) |
| Previous Smaller Element | Monotonic Increasing (left pass) |
| Largest Rectangle / Area | Monotonic Increasing |
| Stock Span / Temperature | Monotonic Decreasing |

### Template

```java
// Monotonic Decreasing Stack (Next Greater Element pattern)
Deque<Integer> stack = new ArrayDeque<>();
for (int i = 0; i < n; i++) {
    while (!stack.isEmpty() && arr[stack.peek()] < arr[i]) {
        int idx = stack.pop();
        result[idx] = arr[i]; // arr[i] is the next greater for arr[idx]
    }
    stack.push(i);
}
// Remaining elements have no next greater → result stays -1
```

---

## Problem 1 — Next Greater Element I

### Problem Statement

Given two arrays `nums1` and `nums2` where `nums1` is a subset of `nums2`, for each element in `nums1` find the **next greater element** in `nums2`. The next greater element of `x` is the first element to the right of `x` in `nums2` that is greater than `x`. Return `-1` if none exists.

**LeetCode 496**

### Example

```
nums1 = [4,1,2],  nums2 = [1,3,4,2]
Output: [-1,3,-1]

4 → no greater to its right in nums2 → -1
1 → next greater in nums2 is 3
2 → no greater to its right → -1
```

### Intuition & Approach

We process `nums2` once with a monotonic decreasing stack. When we pop an element (because the current element is bigger), that current element IS the "next greater" for the popped element. We store this in a HashMap. Then, for each element in `nums1`, just look up the map.

**Why decreasing stack?** Elements sit in the stack waiting. A larger element arriving means "I found your answer — pop and record me." The stack always stays decreasing from bottom to top.

### Java Code

```java
class Solution {
    public int[] nextGreaterElement(int[] nums1, int[] nums2) {
        Map<Integer, Integer> map = new HashMap<>(); // val → next greater val
        Deque<Integer> stack = new ArrayDeque<>();   // monotonic decreasing

        for (int num : nums2) {
            // Current num is greater than top → pop and record answer
            while (!stack.isEmpty() && stack.peek() < num) {
                map.put(stack.pop(), num);
            }
            stack.push(num);
        }
        // Remaining in stack have no next greater → map won't have them (defaults to -1)

        int[] result = new int[nums1.length];
        for (int i = 0; i < nums1.length; i++) {
            result[i] = map.getOrDefault(nums1[i], -1);
        }
        return result;
    }
}
```

### Test Cases

```
Input:  nums1=[4,1,2], nums2=[1,3,4,2]   → [-1,3,-1]
Input:  nums1=[2,4],   nums2=[1,2,3,4]   → [3,-1]
Input:  nums1=[1],     nums2=[1,2]        → [2]
Input:  nums1=[3],     nums2=[3]          → [-1]
```

**Time:** O(n+m) | **Space:** O(n)

---

## Problem 2 — Daily Temperatures

### Problem Statement

Given an array `temperatures`, for each day find how many days you have to wait until a warmer temperature. If no future day is warmer, return `0` for that day.

**LeetCode 739**

### Example

```
temperatures = [73,74,75,71,69,72,76,73]
Output:        [ 1, 1, 4, 2, 1, 1, 0, 0]
```

### Intuition & Approach

Each day "waits" in the stack for a warmer day. When a warmer day arrives, all cooler days in the stack that are resolved get popped. The answer for each popped index is `current_index - popped_index`.

**Key insight:** Store **indices** (not values) in the stack so we can compute the gap.

### Java Code

```java
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] result = new int[n]; // default 0
        Deque<Integer> stack = new ArrayDeque<>(); // indices, decreasing temps

        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {
                int idx = stack.pop();
                result[idx] = i - idx; // days waited
            }
            stack.push(i);
        }
        return result; // remaining → 0 (no warmer day)
    }
}
```

### Test Cases

```
Input: [73,74,75,71,69,72,76,73] → [1,1,4,2,1,1,0,0]
Input: [30,40,50,60]             → [1,1,1,0]
Input: [30,60,90]                → [1,1,0]
Input: [90,80,70]                → [0,0,0]
Input: [70,70,70]                → [0,0,0]
```

**Time:** O(n) | **Space:** O(n)

---

## Problem 3 — Largest Rectangle in Histogram

### Problem Statement

Given an array `heights` representing the heights of bars in a histogram (each bar has width 1), find the area of the **largest rectangle** that can be formed.

**LeetCode 84**

### Example

```
heights = [2,1,5,6,2,3]
Output  = 10   (rectangle of height 5 spanning bars 2–3)
```

### Intuition & Approach

For each bar, the largest rectangle with that bar as the **shortest** extends leftward until a shorter bar and rightward until a shorter bar.

A monotonic increasing stack lets us efficiently find the "left boundary" and "right boundary" for each bar:
- When we pop a bar (because current bar is shorter), the current bar is its right boundary and the new top of stack is its left boundary.
- Area = `height[popped] * (right - left - 1)`

Append a sentinel `0` at the end to flush all remaining bars.

### Java Code

```java
class Solution {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length;
        int maxArea = 0;
        Deque<Integer> stack = new ArrayDeque<>(); // increasing heights (indices)

        for (int i = 0; i <= n; i++) {
            int h = (i == n) ? 0 : heights[i]; // sentinel 0 to flush stack
            while (!stack.isEmpty() && heights[stack.peek()] > h) {
                int height = heights[stack.pop()];
                int width = stack.isEmpty() ? i : i - stack.peek() - 1;
                maxArea = Math.max(maxArea, height * width);
            }
            stack.push(i);
        }
        return maxArea;
    }
}
```

### Test Cases

```
Input: [2,1,5,6,2,3] → 10
Input: [2,4]          → 4
Input: [1]            → 1
Input: [6,2,5,4,5,1,6]→ 12
Input: [1,1,1,1]      → 4
Input: [5,4,3,2,1]    → 9
```

**Time:** O(n) | **Space:** O(n)

---

## Problem 4 — Trapping Rain Water

### Problem Statement

Given `height` array representing an elevation map where each bar has width 1, compute how much water it can trap after raining.

**LeetCode 42**

### Example

```
height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output = 6
```

### Intuition & Approach

Water above each position is bounded by `min(maxLeft, maxRight) - height[i]`. With a monotonic stack:
- We maintain a stack of indices in decreasing height order.
- When we see a taller bar, the popped bar is the "bottom" of a water pocket. The left wall is the new stack top, the right wall is the current bar.
- Water = `(min(leftHeight, rightHeight) - bottomHeight) * width`

### Java Code

```java
class Solution {
    public int trap(int[] height) {
        int water = 0;
        Deque<Integer> stack = new ArrayDeque<>(); // decreasing heights

        for (int i = 0; i < height.length; i++) {
            while (!stack.isEmpty() && height[stack.peek()] < height[i]) {
                int bottom = stack.pop();           // the valley floor
                if (stack.isEmpty()) break;         // no left wall

                int left = stack.peek();
                int boundedHeight = Math.min(height[left], height[i]) - height[bottom];
                int width = i - left - 1;
                water += boundedHeight * width;
            }
            stack.push(i);
        }
        return water;
    }
}
```

### Test Cases

```
Input: [0,1,0,2,1,0,1,3,2,1,2,1] → 6
Input: [4,2,0,3,2,5]              → 9
Input: [3,0,2,0,4]                → 7
Input: [1,0,1]                    → 1
Input: [3,0,0,2,0,4]              → 10
Input: []                         → 0
```

**Time:** O(n) | **Space:** O(n)

---

## Problem 5 — Maximal Rectangle (Binary Matrix)

### Problem Statement

Given a binary matrix filled with `'0'`s and `'1'`s, find the largest rectangle containing only `'1'`s and return its area.

**LeetCode 85**

### Example

```
matrix = [
  ["1","0","1","0","0"],
  ["1","0","1","1","1"],
  ["1","1","1","1","1"],
  ["1","0","0","1","0"]
]
Output = 6
```

### Intuition & Approach

Reduce to "Largest Rectangle in Histogram" row by row. Build a height array where `height[j]` = number of consecutive `'1'`s ending at current row in column `j`. Then apply Problem 3's histogram algorithm on each row's height array.

This is the classic "stack on top of DP" technique.

### Java Code

```java
class Solution {
    public int maximalRectangle(char[][] matrix) {
        if (matrix.length == 0) return 0;
        int cols = matrix[0].length;
        int[] heights = new int[cols];
        int maxArea = 0;

        for (char[] row : matrix) {
            // Update heights
            for (int j = 0; j < cols; j++) {
                heights[j] = (row[j] == '1') ? heights[j] + 1 : 0;
            }
            maxArea = Math.max(maxArea, largestRectangle(heights));
        }
        return maxArea;
    }

    private int largestRectangle(int[] heights) {
        int n = heights.length, maxArea = 0;
        Deque<Integer> stack = new ArrayDeque<>();

        for (int i = 0; i <= n; i++) {
            int h = (i == n) ? 0 : heights[i];
            while (!stack.isEmpty() && heights[stack.peek()] > h) {
                int height = heights[stack.pop()];
                int width = stack.isEmpty() ? i : i - stack.peek() - 1;
                maxArea = Math.max(maxArea, height * width);
            }
            stack.push(i);
        }
        return maxArea;
    }
}
```

### Test Cases

```
Input: [["1","0","1","0","0"],
        ["1","0","1","1","1"],
        ["1","1","1","1","1"],
        ["1","0","0","1","0"]] → 6

Input: [["0"]]               → 0
Input: [["1"]]               → 1
Input: [["1","1"],["1","1"]] → 4
```

**Time:** O(m×n) | **Space:** O(n)

---

## Problem 6 — Stock Span Problem

### Problem Statement

The **stock span** of a stock's price on a given day is the maximum number of consecutive days (including today) for which the price was less than or equal to today's price.

Given an array `prices`, return the span for each day.

**GFG / LeetCode 901**

### Example

```
prices = [100, 80, 60, 70, 60, 75, 85]
spans  = [  1,  1,  1,  2,  1,  4,  6]
```

### Intuition & Approach

For each day, we want the **previous greater element**. The span = `current_index - index_of_previous_greater`. A monotonic decreasing stack (of indices) gives us exactly this: when the current price is larger than the top, pop it (current price dominates). The remaining top is the previous greater.

### Java Code

```java
class Solution {
    public int[] calculateSpan(int[] prices) {
        int n = prices.length;
        int[] span = new int[n];
        Deque<Integer> stack = new ArrayDeque<>(); // indices, decreasing prices

        for (int i = 0; i < n; i++) {
            // Pop all days with price ≤ current price
            while (!stack.isEmpty() && prices[stack.peek()] <= prices[i]) {
                stack.pop();
            }
            // If stack empty, all previous days are dominated
            span[i] = stack.isEmpty() ? i + 1 : i - stack.peek();
            stack.push(i);
        }
        return span;
    }
}
```

### Test Cases

```
Input: [100,80,60,70,60,75,85]  → [1,1,1,2,1,4,6]
Input: [10,4,5,90,120,80]       → [1,1,2,4,5,1]
Input: [100,100,100]            → [1,2,3]
Input: [10,20,30,40]            → [1,2,3,4]
Input: [40,30,20,10]            → [1,1,1,1]
```

**Time:** O(n) | **Space:** O(n)

---

## Problem 7 — Remove K Digits to Make Smallest Number

### Problem Statement

Given a string `num` representing a non-negative integer and an integer `k`, remove `k` digits to make the resulting number the **smallest possible**. Return it as a string (no leading zeros).

**LeetCode 402**

### Example

```
num = "1432219", k = 3   → "1219"
num = "10200",   k = 1   → "200"   (leading zero removed → "200")
num = "10",      k = 2   → "0"
```

### Intuition & Approach

Greedily remove a digit when the digit to its left is **larger** (it creates a larger number). Use a monotonic increasing stack: when the current digit is smaller than the top, pop the top (that's one removal). After all digits are processed, if we still need to remove more, pop from the end (the stack is increasing, so the end is largest).

**Why increasing stack?** We want the smallest prefix, so we greedily keep smaller digits on the left.

### Java Code

```java
class Solution {
    public String removeKdigits(String num, int k) {
        Deque<Character> stack = new ArrayDeque<>(); // monotonic increasing

        for (char digit : num.toCharArray()) {
            // Remove larger preceding digits
            while (k > 0 && !stack.isEmpty() && stack.peek() > digit) {
                stack.pop();
                k--;
            }
            stack.push(digit);
        }

        // If k > 0, remove from the end (largest remaining digits)
        while (k-- > 0) stack.pop();

        // Build result, skip leading zeros
        StringBuilder sb = new StringBuilder();
        boolean leadingZero = true;
        // Stack is LIFO, so reverse it
        List<Character> list = new ArrayList<>(stack);
        Collections.reverse(list);
        for (char c : list) {
            if (leadingZero && c == '0') continue;
            leadingZero = false;
            sb.append(c);
        }

        return sb.length() == 0 ? "0" : sb.toString();
    }
}
```

### Test Cases

```
Input: "1432219", k=3 → "1219"
Input: "10200",   k=1 → "200"
Input: "10",      k=2 → "0"
Input: "9",       k=1 → "0"
Input: "112",     k=1 → "11"
Input: "1234",    k=2 → "12"
```

**Time:** O(n) | **Space:** O(n)

---

## Problem 8 — Next Greater Element II (Circular Array)

### Problem Statement

Given a **circular** integer array `nums`, return the next greater number for every element. The next greater number is the first number to the right (wrapping around circularly) that is greater. Return `-1` if none exists.

**LeetCode 503**

### Example

```
nums   = [1, 2, 1]
Output = [2,-1, 2]

1 → next greater is 2
2 → no greater (wraps around, 1 < 2) → -1
1 → wraps around, finds 2
```

### Intuition & Approach

Traverse the array **twice** (simulate circular by going `0` to `2n-1`, using `i % n`). First pass fills answers for most elements, second pass handles those that need to wrap around.

Only push indices during the first pass (`i < n`) to avoid duplicate entries.

### Java Code

```java
class Solution {
    public int[] nextGreaterElements(int[] nums) {
        int n = nums.length;
        int[] result = new int[n];
        Arrays.fill(result, -1);
        Deque<Integer> stack = new ArrayDeque<>(); // indices, decreasing values

        for (int i = 0; i < 2 * n; i++) {
            int curr = nums[i % n];
            while (!stack.isEmpty() && nums[stack.peek()] < curr) {
                result[stack.pop()] = curr;
            }
            if (i < n) stack.push(i); // only push each index once
        }
        return result;
    }
}
```

### Test Cases

```
Input: [1,2,1]     → [2,-1,2]
Input: [1,2,3,4,3] → [2,3,4,-1,4]
Input: [5,4,3,2,1] → [-1,5,5,5,5]
Input: [1,1,1]     → [-1,-1,-1]
Input: [3,3]       → [-1,-1]
```

**Time:** O(n) | **Space:** O(n)

---

## Problem 9 — Sum of Subarray Minimums

### Problem Statement

Given an array `arr`, find the sum of `min(subarray)` for every contiguous subarray. Return the answer modulo `10^9 + 7`.

**LeetCode 907**

### Example

```
arr = [3,1,2,4]
Subarrays and their mins:
[3]→3, [1]→1, [2]→2, [4]→4
[3,1]→1, [1,2]→1, [2,4]→2
[3,1,2]→1, [1,2,4]→1
[3,1,2,4]→1
Sum = 17
```

### Intuition & Approach

For each element `arr[i]`, count how many subarrays have `arr[i]` as their minimum. If there are `left` elements to the left where `arr[i]` is still the minimum, and `right` elements to the right, then `arr[i]` is the min in `left * right` subarrays. Contribution = `arr[i] * left * right`.

We use a monotonic increasing stack to find the **Previous Less or Equal** (PLE) and **Next Less** (NL) boundaries for each element. Use strict vs non-strict comparisons on either side to avoid double-counting duplicates.

### Java Code

```java
class Solution {
    public int sumSubarrayMins(int[] arr) {
        int n = arr.length;
        long MOD = 1_000_000_007L;
        int[] left = new int[n];  // distance to previous less element
        int[] right = new int[n]; // distance to next less or equal element

        Deque<Integer> stack = new ArrayDeque<>();

        // Previous Less Element (strict <)
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && arr[stack.peek()] >= arr[i]) stack.pop();
            left[i] = stack.isEmpty() ? i + 1 : i - stack.peek();
            stack.push(i);
        }

        stack.clear();

        // Next Less or Equal Element (<=)
        for (int i = n - 1; i >= 0; i--) {
            while (!stack.isEmpty() && arr[stack.peek()] > arr[i]) stack.pop();
            right[i] = stack.isEmpty() ? n - i : stack.peek() - i;
            stack.push(i);
        }

        long sum = 0;
        for (int i = 0; i < n; i++) {
            sum = (sum + (long) arr[i] * left[i] * right[i]) % MOD;
        }
        return (int) sum;
    }
}
```

### Test Cases

```
Input: [3,1,2,4]    → 17
Input: [11,81,94,43,3] → 444
Input: [1]          → 1
Input: [1,2,3]      → 10
Input: [3,2,1]      → 10
Input: [1,1,1]      → 6  (careful with duplicates)
```

**Time:** O(n) | **Space:** O(n)

---

## Problem 10 — Largest Rectangle in Buildings / Skyline (132 Pattern)

### Problem Statement

Given an array of integers `nums`, return `true` if there exists a **132 pattern**: three indices `i < j < k` such that `nums[i] < nums[k] < nums[j]`.

**LeetCode 456**

### Example

```
nums = [3,1,4,2]  → true  (1 < 2 < 4, indices 1,3,2... wait: i=1,k=3,j=2 → 1<2<4 ✓)
nums = [1,2,3,4]  → false
nums = [-1,3,2,0] → true  (−1 < 0 < 3)
```

### Intuition & Approach

We need to find `nums[i] < nums[k] < nums[j]` where `i < j > k` and `k > j`... actually `i < j` and `j < k`.

Scan **right to left**. Maintain a monotonic decreasing stack. Track `third` (the best candidate for `nums[k]`, the middle value in the pattern `i < k < j`). When we pop a smaller element from the stack, it's a valid `k` candidate — update `third`. If the current element is smaller than `third`, we've found `nums[i] < third < someJ` → return true.

**Why right to left?** The `j` element (the maximum) is what we process first; pops represent valid `k` values (smaller than a previous max); the current element is the candidate for `i`.

### Java Code

```java
class Solution {
    public boolean find132pattern(int[] nums) {
        int n = nums.length;
        Deque<Integer> stack = new ArrayDeque<>(); // decreasing stack
        int third = Integer.MIN_VALUE; // best candidate for nums[k] (the "2" in 132)

        for (int i = n - 1; i >= 0; i--) {
            if (nums[i] < third) return true; // found nums[i] < third < some j
            while (!stack.isEmpty() && stack.peek() < nums[i]) {
                third = stack.pop(); // popped value is a valid "2" (k candidate)
            }
            stack.push(nums[i]);
        }
        return false;
    }
}
```

### Test Cases

```
Input: [1,2,3,4]    → false
Input: [3,1,4,2]    → true
Input: [-1,3,2,0]   → true
Input: [1,0,1,-4,-3]→ false
Input: [3,5,0,3,4]  → true
Input: [1,3,2]      → true
Input: [1,2]        → false
```

**Time:** O(n) | **Space:** O(n)

---

## Pattern Summary Table

| # | Problem | Stack Order | Direction | Key Trick |
|---|---------|-------------|-----------|-----------|
| 1 | Next Greater Element I | Decreasing | Left→Right | HashMap for lookup |
| 2 | Daily Temperatures | Decreasing | Left→Right | Store indices |
| 3 | Largest Rectangle in Histogram | Increasing | Left→Right | Sentinel 0 at end |
| 4 | Trapping Rain Water | Decreasing | Left→Right | Width × bounded height |
| 5 | Maximal Rectangle | Increasing | Row by row | Reduce to histogram |
| 6 | Stock Span | Decreasing | Left→Right | Previous Greater Index |
| 7 | Remove K Digits | Increasing | Left→Right | Greedy pop on descent |
| 8 | Next Greater II (Circular) | Decreasing | 2× traversal | `i % n` trick |
| 9 | Sum of Subarray Minimums | Increasing | Both sides | PLE × NLE contribution |
| 10 | 132 Pattern | Decreasing | Right→Left | Track popped "third" |

---

## Common Pitfalls

**1. Index vs Value in stack** — Most problems need indices in the stack (not raw values) to compute distances or widths.

**2. Strict vs Non-strict comparisons** — In sum-of-minimums style problems, use `>=` on one side and `>` on the other to avoid double-counting when duplicates exist.

**3. Forgetting the sentinel** — In histogram problems, appending `0` ensures all elements get popped and processed. Without it, elements remaining in the stack get no answer.

**4. Circular arrays** — Always run `2×n` iterations and use `i % n`. Only push during the first `n` iterations.

**5. Stack cleanup** — Elements remaining in the stack after the loop have no "next greater/smaller" — their answer is `-1` or `0` depending on the problem.

---

## Quick Decision Tree

```
Is it about "next/previous greater or smaller"?
  → Basic NGE/NSE → Monotonic Stack (Decreasing/Increasing)

Does it involve area or width between boundaries?
  → Histogram / Rain Water → Monotonic Increasing Stack + width formula

Is the array circular?
  → Loop 2×n with i%n

Need contribution of each element across all subarrays?
  → Compute PLE and NLE for each element, multiply spans

Does it require greedy construction (smallest/largest sequence)?
  → Monotonic stack as a construction tool (Remove K Digits)

Pattern matching (132 / similar)?
  → Scan reverse + maintain candidate with stack
```