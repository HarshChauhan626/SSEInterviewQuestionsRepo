# Prefix Sum — 10 Problems That Cover 95% of the Pattern

> **What is Prefix Sum?**
> A prefix sum array `pre[i]` stores the cumulative sum of elements from index `0` to `i`.
> `pre[i] = arr[0] + arr[1] + ... + arr[i]`
> Range sum `[l, r]` = `pre[r] - pre[l-1]`  (O(1) after O(n) build)

---

## Table of Contents
| # | Problem | Difficulty | Jump to Solution |
|---|---------|:----------:|-----------------|
| 1 | Range Sum Query (1D) | 🟢 Easy | [→ #1](#range-sum-query-1d) |
| 2 | Subarray Sum Equals K | 🟡 Medium | [→ #2](#subarray-sum-equals-k) |
| 3 | Product of Array Except Self | 🟡 Medium | [→ #3](#product-of-array-except-self) |
| 4 | Find Pivot Index | 🟢 Easy | [→ #4](#find-pivot-index) |
| 5 | Contiguous Array (Equal 0s and 1s) | 🟡 Medium | [→ #5](#contiguous-array-equal-0s-and-1s) |
| 6 | Range Sum Query 2D (Immutable) | 🟡 Medium | [→ #6](#range-sum-query-2d-immutable) |
| 7 | Subarray Sums Divisible by K | 🟡 Medium | [→ #7](#subarray-sums-divisible-by-k) |
| 8 | Maximum Sum of Subarray of Size K (Sliding Window + Prefix) | 🟢 Easy | [→ #8](#maximum-sum-of-subarray-of-size-k-sliding-window--prefix) |
| 9 | Count of Range Sum | 🔴 Hard | [→ #9](#count-of-range-sum) |
| 10 | Minimum Size Subarray Sum (Prefix Sum + Binary Search) | 🟡 Medium | [→ #10](#minimum-size-subarray-sum-prefix-sum--binary-search) |

---

<a id="range-sum-query-1d"></a>
## Problem 1 — Range Sum Query (1D)
**LeetCode 303**

### Problem Statement
Given an integer array `nums`, handle multiple queries of the form: return the sum of elements between indices `left` and `right` (inclusive).

**Example:**
```
Input:  nums = [2, 4, 3, 1, 6, 5]
Query:  sumRange(1, 3)
Output: 8   (4 + 3 + 1)

Query:  sumRange(0, 5)
Output: 21
```

### Why Prefix Sum?
A brute-force approach sums every query in O(n). With many queries this becomes O(n·q). Prefix sum precomputes cumulative sums once in O(n), answering every query in O(1).

### Intuition
Build `pre[i+1] = pre[i] + nums[i]`.
Sum of `[l, r]` = `pre[r+1] - pre[l]`.
Think of it as subtracting "what came before l" from "everything up to r."

### Java Code
```java
class NumArray {
    private int[] pre;

    public NumArray(int[] nums) {
        pre = new int[nums.length + 1];
        for (int i = 0; i < nums.length; i++)
            pre[i + 1] = pre[i] + nums[i];
    }

    public int sumRange(int left, int right) {
        return pre[right + 1] - pre[left];
    }
}
```

### Test Cases
| nums | left | right | Expected |
|------|------|-------|----------|
| [2,4,3,1,6,5] | 1 | 3 | 8 |
| [-2,0,3,-5,2,-1] | 0 | 2 | 1 |
| [1] | 0 | 0 | 1 |
| [1,2,3,4,5] | 0 | 4 | 15 |

**Complexity:** Time O(1) per query, O(n) build · Space O(n)

---

<a id="subarray-sum-equals-k"></a>
## Problem 2 — Subarray Sum Equals K
**LeetCode 560**

### Problem Statement
Given an integer array `nums` and an integer `k`, return the total number of subarrays whose sum equals `k`.

**Example:**
```
Input:  nums = [1, 1, 1], k = 2
Output: 2   ([1,1] at indices 0-1, and 1-2)

Input:  nums = [1, 2, 3], k = 3
Output: 2   ([3] and [1,2])
```

### Why Prefix Sum + HashMap?
We need count of pairs (i, j) where `pre[j] - pre[i] = k`, i.e., `pre[i] = pre[j] - k`.
A HashMap stores how many times each prefix sum has been seen, giving O(1) lookup per element.

### Intuition
As we iterate, at each index we ask: "How many previous prefix sums equal `currentSum - k`?"
Each such previous index `i` means the subarray `(i, current]` sums to `k`.

### Java Code
```java
class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        count.put(0, 1);   // empty prefix
        int sum = 0, result = 0;

        for (int num : nums) {
            sum += num;
            result += count.getOrDefault(sum - k, 0);
            count.put(sum, count.getOrDefault(sum, 0) + 1);
        }
        return result;
    }
}
```

### Test Cases
| nums | k | Expected |
|------|---|----------|
| [1,1,1] | 2 | 2 |
| [1,2,3] | 3 | 2 |
| [1,-1,0] | 0 | 3 |
| [3,4,7,2,-3,1,4,2] | 7 | 4 |
| [-1,-1,1] | 0 | 1 |

**Complexity:** Time O(n) · Space O(n)

---

<a id="product-of-array-except-self"></a>
## Problem 3 — Product of Array Except Self
**LeetCode 238**

### Problem Statement
Given an integer array `nums`, return an array `answer` such that `answer[i]` equals the product of all elements except `nums[i]`. **No division allowed.**

**Example:**
```
Input:  [1, 2, 3, 4]
Output: [24, 12, 8, 6]
```

### Why Prefix Products?
This is a prefix-sum analogue using multiplication. The product excluding index `i` = (product of everything to the left of i) × (product of everything to the right of i).

### Intuition
1. Build a **left prefix product** array: `left[i]` = product of all elements before index `i`.
2. Build a **right suffix product** array: `right[i]` = product of all elements after index `i`.
3. `answer[i] = left[i] * right[i]`.
Optimize space by computing the right pass in-place.

### Java Code
```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];

        // Left pass
        res[0] = 1;
        for (int i = 1; i < n; i++)
            res[i] = res[i - 1] * nums[i - 1];

        // Right pass (in-place)
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] *= right;
            right *= nums[i];
        }
        return res;
    }
}
```

### Test Cases
| Input | Expected |
|-------|----------|
| [1,2,3,4] | [24,12,8,6] |
| [-1,1,0,-3,3] | [0,0,9,0,0] |
| [2,3] | [3,2] |
| [1,0] | [0,1] |

**Complexity:** Time O(n) · Space O(1) (output array not counted)

---

<a id="find-pivot-index"></a>
## Problem 4 — Find Pivot Index
**LeetCode 724**

### Problem Statement
Given an array `nums`, return the **leftmost** index where the sum of all elements to the left equals the sum of all elements to the right. Return -1 if no such index exists.

**Example:**
```
Input:  [1, 7, 3, 6, 5, 6]
Output: 3   (left sum = 1+7+3 = 11, right sum = 5+6 = 11)
```

### Why Prefix Sum?
Total sum is fixed. At each index, `leftSum = prefixSum[i]` and `rightSum = total - prefixSum[i] - nums[i]`. We just check equality — O(1) per index.

### Intuition
For index `i` to be the pivot: `leftSum == total - leftSum - nums[i]`
i.e., `2 * leftSum + nums[i] == total`.
Walk left-to-right maintaining a running left sum.

### Java Code
```java
class Solution {
    public int pivotIndex(int[] nums) {
        int total = 0;
        for (int n : nums) total += n;

        int leftSum = 0;
        for (int i = 0; i < nums.length; i++) {
            if (2 * leftSum + nums[i] == total) return i;
            leftSum += nums[i];
        }
        return -1;
    }
}
```

### Test Cases
| Input | Expected |
|-------|----------|
| [1,7,3,6,5,6] | 3 |
| [1,2,3] | -1 |
| [2,1,-1] | 0 |
| [0] | 0 |
| [-1,-1,-1,0,1,1] | 0 |

**Complexity:** Time O(n) · Space O(1)

---

<a id="contiguous-array-equal-0s-and-1s"></a>
## Problem 5 — Contiguous Array (Equal 0s and 1s)
**LeetCode 525**

### Problem Statement
Given a binary array `nums`, return the maximum length of a contiguous subarray with an equal number of `0`s and `1`s.

**Example:**
```
Input:  [0, 1, 0]
Output: 2   (subarray [0,1] or [1,0])

Input:  [0, 1, 1, 0, 1, 1, 1, 0]
Output: 4
```

### Why Prefix Sum + HashMap?
Replace 0 with -1. Now equal 0s and 1s ↔ subarray sums to 0 ↔ two indices with the same prefix sum. We store the **first occurrence** of each prefix sum.

### Intuition
If `pre[j] == pre[i]` then `sum(i+1..j) = 0`, meaning equal counts between `i+1` and `j`. The length is `j - i`. We want the maximum such span.

### Java Code
```java
class Solution {
    public int findMaxLength(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, -1);   // prefix sum 0 seen at index -1
        int sum = 0, maxLen = 0;

        for (int i = 0; i < nums.length; i++) {
            sum += (nums[i] == 0) ? -1 : 1;
            if (map.containsKey(sum))
                maxLen = Math.max(maxLen, i - map.get(sum));
            else
                map.put(sum, i);
        }
        return maxLen;
    }
}
```

### Test Cases
| Input | Expected |
|-------|----------|
| [0,1] | 2 |
| [0,1,0] | 2 |
| [0,1,1,0,1,1,1,0] | 4 |
| [1,1,1,1] | 0 |
| [0,0,0,1,1,1] | 6 |

**Complexity:** Time O(n) · Space O(n)

---

<a id="range-sum-query-2d-immutable"></a>
## Problem 6 — Range Sum Query 2D (Immutable)
**LeetCode 304**

### Problem Statement
Given a 2D matrix, handle multiple queries returning the sum of elements within a rectangle defined by its upper-left corner `(r1, c1)` and lower-right corner `(r2, c2)`.

**Example:**
```
Matrix:
3  0  1  4  2
5  6  3  2  1
1  2  0  1  5
4  1  0  1  7
1  0  3  0  5

sumRegion(2,1,4,3) → 8
sumRegion(1,1,2,2) → 11
```

### Why 2D Prefix Sum?
The inclusion-exclusion principle extends 1D prefix sums to 2D rectangles, each query answered in O(1) after an O(m·n) build.

### Intuition
`pre[i][j]` = sum of the rectangle from (0,0) to (i-1, j-1).
Build: `pre[i][j] = matrix[i-1][j-1] + pre[i-1][j] + pre[i][j-1] - pre[i-1][j-1]`
Query: `pre[r2+1][c2+1] - pre[r1][c2+1] - pre[r2+1][c1] + pre[r1][c1]`

### Java Code
```java
class NumMatrix {
    private int[][] pre;

    public NumMatrix(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        pre = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                pre[i][j] = matrix[i-1][j-1]
                           + pre[i-1][j] + pre[i][j-1] - pre[i-1][j-1];
    }

    public int sumRegion(int r1, int c1, int r2, int c2) {
        return pre[r2+1][c2+1] - pre[r1][c2+1] - pre[r2+1][c1] + pre[r1][c1];
    }
}
```

### Test Cases
```
Matrix = [[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]]
sumRegion(2,1,4,3) → 8
sumRegion(1,1,2,2) → 11
sumRegion(1,2,2,4) → 12
sumRegion(0,0,4,4) → 58
```

**Complexity:** Time O(1) per query, O(m·n) build · Space O(m·n)

---

<a id="subarray-sums-divisible-by-k"></a>
## Problem 7 — Subarray Sums Divisible by K
**LeetCode 974**

### Problem Statement
Given an integer array `nums` and an integer `k`, return the number of **non-empty** subarrays with a sum divisible by `k`.

**Example:**
```
Input:  nums = [4, 5, 0, -2, -3, 1], k = 5
Output: 7
```

### Why Prefix Sum + Modular Arithmetic?
`sum(i..j) % k == 0` ↔ `pre[j] % k == pre[i-1] % k`.
Count pairs with equal prefix-sum remainders using a frequency array.

### Intuition
If two prefix sums share the same remainder mod k, the subarray between them is divisible by k.
**Edge case with negatives:** `((pre % k) + k) % k` normalises negative remainders.

### Java Code
```java
class Solution {
    public int subarraysDivByK(int[] nums, int k) {
        int[] count = new int[k];
        count[0] = 1;   // empty prefix
        int sum = 0, result = 0;

        for (int num : nums) {
            sum += num;
            int rem = ((sum % k) + k) % k;
            result += count[rem];
            count[rem]++;
        }
        return result;
    }
}
```

### Test Cases
| nums | k | Expected |
|------|---|----------|
| [4,5,0,-2,-3,1] | 5 | 7 |
| [5] | 9 | 0 |
| [1,2,3,4,5] | 5 | 4 |
| [-1,2,9] | 2 | 2 |

**Complexity:** Time O(n) · Space O(k)

---

<a id="maximum-sum-of-subarray-of-size-k-sliding-window--prefix"></a>
## Problem 8 — Maximum Sum of Subarray of Size K (Sliding Window + Prefix)
**LeetCode 643 variant / classic**

### Problem Statement
Find the **maximum average** of any contiguous subarray of length `k`.

**Example:**
```
Input:  nums = [1, 12, -5, -6, 50, 3], k = 4
Output: 12.75   (subarray [12,-5,-6,50] → avg = 51/4)
```

### Why Prefix Sum?
`sum(i, i+k-1) = pre[i+k] - pre[i]`. Sliding this window over all valid positions in O(n) finds the maximum.

### Intuition
Instead of re-summing each window, subtract the element leaving and add the element entering. This is exactly the sliding-window view of a prefix-sum difference.

### Java Code
```java
class Solution {
    public double findMaxAverage(int[] nums, int k) {
        int[] pre = new int[nums.length + 1];
        for (int i = 0; i < nums.length; i++)
            pre[i + 1] = pre[i] + nums[i];

        int maxSum = Integer.MIN_VALUE;
        for (int i = k; i <= nums.length; i++)
            maxSum = Math.max(maxSum, pre[i] - pre[i - k]);

        return (double) maxSum / k;
    }
}
```

### Test Cases
| nums | k | Expected |
|------|---|---------|
| [1,12,-5,-6,50,3] | 4 | 12.75 |
| [5] | 1 | 5.0 |
| [0,4,0,3,2] | 1 | 4.0 |
| [1,1,1,1] | 2 | 1.0 |

**Complexity:** Time O(n) · Space O(n) (O(1) with two-pointer sliding window)

---

<a id="count-of-range-sum"></a>
## Problem 9 — Count of Range Sum
**LeetCode 327**

### Problem Statement
Given an integer array `nums` and two integers `lower` and `upper`, return the number of range sums `sum(i, j)` such that `lower <= sum(i, j) <= upper`.

**Example:**
```
Input:  nums = [-2, 5, -1], lower = -2, upper = 2
Output: 3   (subarrays: [−2], [−1], [−2,5,−1])
```

### Why Prefix Sum + Merge Sort?
For each `j`, count prefix sums `pre[i]` where `lower <= pre[j] - pre[i] <= upper`, i.e., `pre[j] - upper <= pre[i] <= pre[j] - lower`. Merge sort counts these during the merge step in O(n log n).

### Intuition
Build the prefix sum array. Use a modified merge sort: during the merge of two sorted halves, for each `pre[j]` in the right half, use two pointers to count valid `pre[i]` values in the left half — those in range `[pre[j]-upper, pre[j]-lower]`.

### Java Code
```java
class Solution {
    int lower, upper;

    public int countRangeSum(int[] nums, int lower, int upper) {
        this.lower = lower;
        this.upper = upper;
        long[] pre = new long[nums.length + 1];
        for (int i = 0; i < nums.length; i++)
            pre[i + 1] = pre[i] + nums[i];
        return mergeCount(pre, 0, pre.length);
    }

    private int mergeCount(long[] pre, int lo, int hi) {
        if (hi - lo <= 1) return 0;
        int mid = (lo + hi) / 2;
        int count = mergeCount(pre, lo, mid) + mergeCount(pre, mid, hi);

        // count valid pairs
        int j = mid, k = mid;
        for (int i = lo; i < mid; i++) {
            while (j < hi && pre[j] - pre[i] < lower) j++;
            while (k < hi && pre[k] - pre[i] <= upper) k++;
            count += k - j;
        }

        // merge
        long[] sorted = new long[hi - lo];
        int p = lo, q = mid, idx = 0;
        while (p < mid && q < hi)
            sorted[idx++] = pre[p] <= pre[q] ? pre[p++] : pre[q++];
        while (p < mid) sorted[idx++] = pre[p++];
        while (q < hi)  sorted[idx++] = pre[q++];
        System.arraycopy(sorted, 0, pre, lo, hi - lo);

        return count;
    }
}
```

### Test Cases
| nums | lower | upper | Expected |
|------|-------|-------|----------|
| [-2,5,-1] | -2 | 2 | 3 |
| [0] | 0 | 0 | 1 |
| [1,2,3] | 2 | 5 | 4 |
| [-1] | -1 | 0 | 1 |

**Complexity:** Time O(n log n) · Space O(n)

---

<a id="minimum-size-subarray-sum-prefix-sum--binary-search"></a>
## Problem 10 — Minimum Size Subarray Sum (Prefix Sum + Binary Search)
**LeetCode 209**

### Problem Statement
Given an array of **positive** integers and a target `target`, return the minimal length of a subarray whose sum ≥ `target`. Return 0 if no such subarray exists.

**Example:**
```
Input:  target = 7, nums = [2, 3, 1, 2, 4, 3]
Output: 2   (subarray [4, 3])
```

### Why Prefix Sum + Binary Search?
Since all values are positive, prefix sums are strictly increasing. For each index `i`, binary search for the smallest `j > i` such that `pre[j] - pre[i] >= target`. This is O(n log n) — or use a two-pointer approach for O(n).

### Intuition
A strictly increasing prefix-sum array lets us binary-search for `pre[i] + target` within `pre[i+1..n]`. The position of the first value ≥ that threshold gives the shortest valid window ending at that threshold position.

### Java Code (Binary Search version)
```java
class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int n = nums.length;
        int[] pre = new int[n + 1];
        for (int i = 0; i < n; i++)
            pre[i + 1] = pre[i] + nums[i];

        int minLen = Integer.MAX_VALUE;
        for (int i = 0; i < n; i++) {
            int need = pre[i] + target;
            // binary search for first index j where pre[j] >= need
            int lo = i + 1, hi = n;
            while (lo <= hi) {
                int mid = (lo + hi) / 2;
                if (pre[mid] >= need) { hi = mid - 1; }
                else                   { lo = mid + 1; }
            }
            if (lo <= n) minLen = Math.min(minLen, lo - i);
        }
        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }
}
```

### Java Code (Two-Pointer O(n) — also uses prefix-sum thinking)
```java
class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int left = 0, sum = 0, minLen = Integer.MAX_VALUE;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= target) {
                minLen = Math.min(minLen, right - left + 1);
                sum -= nums[left++];
            }
        }
        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }
}
```

### Test Cases
| target | nums | Expected |
|--------|------|----------|
| 7 | [2,3,1,2,4,3] | 2 |
| 4 | [1,4,4] | 1 |
| 11 | [1,1,1,1,1,1,1,1] | 0 |
| 15 | [5,1,3,5,10,7,4,9,2,8] | 2 |

**Complexity:** Time O(n log n) binary search / O(n) two-pointer · Space O(n) / O(1)

---

## Quick Reference — Pattern Recognition Guide

| Clue in Problem | Pattern |
|-----------------|---------|
| Range sum query, many queries | 1D Prefix Sum |
| Count subarrays summing to k | Prefix Sum + HashMap |
| Subarray with equal 0s and 1s | Replace 0→-1, then Prefix Sum + HashMap |
| Sum divisible by k | Prefix Sum + mod + frequency array |
| 2D rectangle sum query | 2D Prefix Sum (inclusion-exclusion) |
| Count range sums in [lo, hi] | Prefix Sum + Merge Sort |
| Min/max window with positive values | Prefix Sum + Binary Search / Sliding Window |
| Product excluding self | Left × Right prefix products |

## Core Template

```java
// 1. Build prefix sum
int[] pre = new int[n + 1];
for (int i = 0; i < n; i++)
    pre[i + 1] = pre[i] + arr[i];

// 2. Query range [l, r] (0-indexed)
int rangeSum = pre[r + 1] - pre[l];

// 3. Subarray sum == k  →  count of pre[i] == (currentSum - k)
Map<Integer, Integer> freq = new HashMap<>();
freq.put(0, 1);
int sum = 0, ans = 0;
for (int x : arr) {
    sum += x;
    ans += freq.getOrDefault(sum - k, 0);
    freq.merge(sum, 1, Integer::sum);
}
```

---

*These 10 problems collectively train every major prefix-sum sub-pattern: 1D range query, 2D range query, HashMap complement trick, modular counting, equal-partition with sign-flip, merge-sort counting, and sliding window — enough to handle ~95% of prefix-sum questions on competitive platforms.*