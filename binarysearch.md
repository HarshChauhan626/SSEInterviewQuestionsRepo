# Binary Search — 10 Problems That Cover 95% of the Pattern

> **Core Intuition:** Binary search works whenever you can answer: *"Can I eliminate half the search space based on a condition?"*  
> The key insight is not just "sorted array" — it's **monotonicity**: a condition that transitions from `false → true` (or `true → false`) exactly once.

---

## Table of Contents

1. [Classic Binary Search](#1-classic-binary-search)
2. [Find First and Last Position (Search Range)](#2-find-first-and-last-position-search-range)
3. [Search in Rotated Sorted Array](#3-search-in-rotated-sorted-array)
4. [Find Minimum in Rotated Sorted Array](#4-find-minimum-in-rotated-sorted-array)
5. [Koko Eating Bananas (Binary Search on Answer)](#5-koko-eating-bananas-binary-search-on-answer)
6. [Median of Two Sorted Arrays](#6-median-of-two-sorted-arrays)
7. [Find Peak Element](#7-find-peak-element)
8. [Search a 2D Matrix](#8-search-a-2d-matrix)
9. [Aggressive Cows / Allocate Books (Maximize Minimum)](#9-aggressive-cows--allocate-books-maximize-minimum)
10. [Find in Mountain Array (Unknown Size / Double Binary Search)](#10-find-in-mountain-array-unknown-size--double-binary-search)

---

## The Binary Search Template

Before diving into problems, internalize these two universal templates:

```java
// Template 1: Exact match (classic)
int lo = 0, hi = n - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (arr[mid] == target) return mid;
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}

// Template 2: Find leftmost condition (boundary search)
int lo = 0, hi = n;          // hi = n (open right boundary)
while (lo < hi) {            // strict less-than
    int mid = lo + (hi - lo) / 2;
    if (condition(mid)) hi = mid;   // shrink right
    else lo = mid + 1;              // shrink left
}
// lo == hi == answer
```

**Why `mid = lo + (hi - lo) / 2`?**  
Avoids integer overflow compared to `(lo + hi) / 2`.

---

## 1. Classic Binary Search

### Problem Statement
Given a sorted array `nums` and a `target`, return the index of `target` or `-1` if not found.

**LeetCode 704**

### Intuition
The array is sorted — every comparison tells you which half to discard. If `nums[mid] < target`, everything to the left including `mid` is too small. If `nums[mid] > target`, everything to the right is too large. You halve the search space each step → O(log n).

### Why This Approach?
- **Linear scan** costs O(n). Binary search costs O(log n).
- Sorting gives us *monotonicity*: values only increase left→right, so once `nums[mid] < target`, the target cannot be anywhere in `[lo, mid]`.

### Test Cases

| Input | Output | Reason |
|-------|--------|--------|
| `nums = [-1,0,3,5,9,12], target = 9` | `4` | Found at index 4 |
| `nums = [-1,0,3,5,9,12], target = 2` | `-1` | Not present |
| `nums = [5], target = 5` | `0` | Single element |
| `nums = [1,2], target = 1` | `0` | Left boundary |
| `nums = [1,2], target = 2` | `1` | Right boundary |

### Java Code

```java
class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;

        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;

            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                lo = mid + 1;   // target is to the RIGHT
            } else {
                hi = mid - 1;   // target is to the LEFT
            }
        }

        return -1;  // not found
    }
}
// Time: O(log n) | Space: O(1)
```

---

## 2. Find First and Last Position (Search Range)

### Problem Statement
Given a sorted array `nums` and a `target`, return `[firstIndex, lastIndex]` of the target's occurrences. Return `[-1, -1]` if absent.

**LeetCode 34**

### Intuition
Two separate binary searches:
- **Left boundary:** Find the leftmost index where `nums[mid] >= target`.
- **Right boundary:** Find the rightmost index where `nums[mid] <= target`.

Think of it as searching for where the `false → true` transition happens for two different conditions.

### Why Two Binary Searches?
A single pass cannot simultaneously track both boundaries once duplicates exist. Running two independent O(log n) searches is still O(log n) total — no cost, maximum clarity.

### What Changes Between Left and Right Search?
- Left: when `nums[mid] == target`, go LEFT (`hi = mid`) to find earlier occurrence.
- Right: when `nums[mid] == target`, go RIGHT (`lo = mid + 1`) to find later occurrence.

### Test Cases

| Input | Output |
|-------|--------|
| `nums = [5,7,7,8,8,10], target = 8` | `[3,4]` |
| `nums = [5,7,7,8,8,10], target = 6` | `[-1,-1]` |
| `nums = [], target = 0` | `[-1,-1]` |
| `nums = [1], target = 1` | `[0,0]` |
| `nums = [2,2,2,2], target = 2` | `[0,3]` |

### Java Code

```java
class Solution {
    public int[] searchRange(int[] nums, int target) {
        return new int[]{findLeft(nums, target), findRight(nums, target)};
    }

    // Finds index of FIRST occurrence
    private int findLeft(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1, result = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) {
                result = mid;
                hi = mid - 1;  // keep going LEFT
            } else if (nums[mid] < target) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return result;
    }

    // Finds index of LAST occurrence
    private int findRight(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1, result = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) {
                result = mid;
                lo = mid + 1;  // keep going RIGHT
            } else if (nums[mid] < target) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return result;
    }
}
// Time: O(log n) | Space: O(1)
```

---

## 3. Search in Rotated Sorted Array

### Problem Statement
A sorted array was rotated at some pivot (e.g., `[4,5,6,7,0,1,2]`). Given a target, return its index or `-1`.

**LeetCode 33**

### Intuition
After rotation, splitting at `mid` always produces **at least one sorted half**. Determine which half is sorted, then check if target falls in that range. If yes, search there; otherwise search the other half.

### Why Does This Work?
At any `mid`, either:
- `nums[lo..mid]` is sorted (no rotation in left half), OR
- `nums[mid..hi]` is sorted (no rotation in right half).

We use the sorted half as a "safe" range check, then redirect.

### Key Decision Logic
```
if left half is sorted (nums[lo] <= nums[mid]):
    if target in [nums[lo], nums[mid]) → go left
    else → go right
else (right half is sorted):
    if target in (nums[mid], nums[hi]] → go right
    else → go left
```

### Test Cases

| Input | Output |
|-------|--------|
| `nums = [4,5,6,7,0,1,2], target = 0` | `4` |
| `nums = [4,5,6,7,0,1,2], target = 3` | `-1` |
| `nums = [1], target = 0` | `-1` |
| `nums = [3,1], target = 1` | `1` |
| `nums = [5,1,3], target = 5` | `0` |

### Java Code

```java
class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;

        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;

            if (nums[mid] == target) return mid;

            // Left half [lo..mid] is sorted
            if (nums[lo] <= nums[mid]) {
                if (target >= nums[lo] && target < nums[mid]) {
                    hi = mid - 1;   // target is in sorted left half
                } else {
                    lo = mid + 1;   // target must be in right half
                }
            }
            // Right half [mid..hi] is sorted
            else {
                if (target > nums[mid] && target <= nums[hi]) {
                    lo = mid + 1;   // target is in sorted right half
                } else {
                    hi = mid - 1;   // target must be in left half
                }
            }
        }

        return -1;
    }
}
// Time: O(log n) | Space: O(1)
```

---

## 4. Find Minimum in Rotated Sorted Array

### Problem Statement
Given a rotated sorted array (no duplicates), find the minimum element.

**LeetCode 153**

### Intuition
The minimum is the only element smaller than its predecessor — it's the **inflection point** where the rotation happened. Any element in the left (larger) portion of the rotation satisfies `nums[mid] > nums[hi]`. The minimum lives in the right portion.

### Why Compare With `nums[hi]`?
Unlike problem #3, we don't know the target, so we use `nums[hi]` as the reference. If `nums[mid] > nums[hi]`, the minimum must be to the right (rotation point is right of mid). Otherwise it's to the left (or is mid itself).

### Test Cases

| Input | Output |
|-------|--------|
| `nums = [3,4,5,1,2]` | `1` |
| `nums = [4,5,6,7,0,1,2]` | `0` |
| `nums = [11,13,15,17]` | `11` (no rotation) |
| `nums = [2,1]` | `1` |
| `nums = [1]` | `1` |

### Java Code

```java
class Solution {
    public int findMin(int[] nums) {
        int lo = 0, hi = nums.length - 1;

        while (lo < hi) {   // strict: stops when lo == hi (single candidate)
            int mid = lo + (hi - lo) / 2;

            if (nums[mid] > nums[hi]) {
                // mid is in the LARGER left portion; min is to the right
                lo = mid + 1;
            } else {
                // mid could be the min, or min is to the left
                hi = mid;
            }
        }

        return nums[lo];  // lo == hi == index of minimum
    }
}
// Time: O(log n) | Space: O(1)
```

---

## 5. Koko Eating Bananas (Binary Search on Answer)

### Problem Statement
Koko has `piles` of bananas and `h` hours. She eats at speed `k` bananas/hour (one pile per hour, leftover carries to next hour). Find the minimum `k` to finish all piles in `h` hours.

**LeetCode 875**

### Intuition — Binary Search on Answer Space
Instead of searching an array, we binary search **the answer itself**. The search space is `[1, max(piles)]`. The condition is: *"Can Koko finish all bananas at speed k within h hours?"*

This condition is **monotone**: if speed `k` works, every speed `> k` also works. So there's a clean `false → true` transition in the answer space, perfect for binary search.

### Why This Approach?
Brute force tries every speed from 1 to max — O(max × n). Binary search reduces speed candidates to O(log(max)) and each check is O(n) → **O(n log(max))** total.

### Hours Needed at Speed k
For each pile `p`, hours needed = `ceil(p / k)` = `(p + k - 1) / k` in integer arithmetic.

### Test Cases

| Input | Output |
|-------|--------|
| `piles = [3,6,7,11], h = 8` | `4` |
| `piles = [30,11,23,4,20], h = 5` | `30` |
| `piles = [30,11,23,4,20], h = 6` | `23` |
| `piles = [1000000000], h = 2` | `500000000` |
| `piles = [1,1,1,1], h = 4` | `1` |

### Java Code

```java
class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int lo = 1;
        int hi = 0;
        for (int p : piles) hi = Math.max(hi, p);  // upper bound = largest pile

        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;

            if (canFinish(piles, mid, h)) {
                hi = mid;       // mid works, try slower (smaller k)
            } else {
                lo = mid + 1;   // mid too slow, need faster
            }
        }

        return lo;
    }

    private boolean canFinish(int[] piles, int speed, int h) {
        int hours = 0;
        for (int p : piles) {
            hours += (p + speed - 1) / speed;  // ceil(p / speed)
        }
        return hours <= h;
    }
}
// Time: O(n log(max)) | Space: O(1)
```

---

## 6. Median of Two Sorted Arrays

### Problem Statement
Given two sorted arrays `nums1` and `nums2`, return the median of the combined sorted array in O(log(m+n)) time.

**LeetCode 4**

### Intuition
Instead of merging (O(m+n)), binary search for the correct **partition point** in the smaller array. A valid partition splits both arrays so that:
- All elements on the left ≤ all elements on the right
- Both sides have equal count (or left has one extra for odd total)

### Why Binary Search on Partition?
We're searching for a cut in `nums1` (from 0 to m). Once the cut in `nums1` is fixed, the cut in `nums2` is determined (by total length). The condition "left max ≤ right min" is monotone in partition index.

### Partition Logic
```
partition1 in nums1: elements [0..p1-1] on left, [p1..m-1] on right
partition2 in nums2: p2 = (m+n+1)/2 - p1

Valid if: maxLeft1 <= minRight2  AND  maxLeft2 <= minRight1
```

### Test Cases

| Input | Output |
|-------|--------|
| `nums1 = [1,3], nums2 = [2]` | `2.0` |
| `nums1 = [1,2], nums2 = [3,4]` | `2.5` |
| `nums1 = [], nums2 = [1]` | `1.0` |
| `nums1 = [0,0], nums2 = [0,0]` | `0.0` |
| `nums1 = [1,3,5,7], nums2 = [2,4,6,8]` | `4.5` |

### Java Code

```java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Always binary search on the smaller array
        if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);

        int m = nums1.length, n = nums2.length;
        int lo = 0, hi = m;
        int half = (m + n + 1) / 2;  // left half size

        while (lo <= hi) {
            int p1 = lo + (hi - lo) / 2;  // cut in nums1
            int p2 = half - p1;            // cut in nums2

            int maxLeft1  = (p1 == 0) ? Integer.MIN_VALUE : nums1[p1 - 1];
            int minRight1 = (p1 == m) ? Integer.MAX_VALUE : nums1[p1];
            int maxLeft2  = (p2 == 0) ? Integer.MIN_VALUE : nums2[p2 - 1];
            int minRight2 = (p2 == n) ? Integer.MAX_VALUE : nums2[p2];

            if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
                // Perfect partition found
                int leftMax  = Math.max(maxLeft1, maxLeft2);
                int rightMin = Math.min(minRight1, minRight2);
                if ((m + n) % 2 == 0) {
                    return (leftMax + rightMin) / 2.0;
                } else {
                    return leftMax;
                }
            } else if (maxLeft1 > minRight2) {
                hi = p1 - 1;  // too many elements from nums1 on left
            } else {
                lo = p1 + 1;  // too few elements from nums1 on left
            }
        }

        throw new IllegalArgumentException("Input arrays are not sorted");
    }
}
// Time: O(log(min(m,n))) | Space: O(1)
```

---

## 7. Find Peak Element

### Problem Statement
A peak element is greater than its neighbors. Return the index of **any** peak element. Assume `nums[-1] = nums[n] = -∞`.

**LeetCode 162**

### Intuition
We don't need the global maximum. At any `mid`:
- If `nums[mid] < nums[mid+1]`: the slope goes UP to the right → a peak exists in `[mid+1, hi]`.
- Otherwise: the slope goes DOWN (or flat) → a peak exists in `[lo, mid]`.

This is **always valid** because the boundaries are `-∞`, guaranteeing a peak exists in whichever half we choose.

### Why Does Halving Always Find A Peak?
Think of it like this: if you're climbing a hill and the next step is higher, keep going right — eventually you'll hit a local maximum (because the right boundary is `-∞`, it must come down). The same logic applies to going left.

### Test Cases

| Input | Output |
|-------|--------|
| `nums = [1,2,3,1]` | `2` |
| `nums = [1,2,1,3,5,6,4]` | `1 or 5` (any peak) |
| `nums = [1]` | `0` |
| `nums = [1,2]` | `1` |
| `nums = [3,2,1]` | `0` |

### Java Code

```java
class Solution {
    public int findPeakElement(int[] nums) {
        int lo = 0, hi = nums.length - 1;

        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;

            if (nums[mid] < nums[mid + 1]) {
                // Ascending slope → peak is to the right
                lo = mid + 1;
            } else {
                // Descending slope → peak is at mid or to the left
                hi = mid;
            }
        }

        return lo;  // lo == hi == peak index
    }
}
// Time: O(log n) | Space: O(1)
```

---

## 8. Search a 2D Matrix

### Problem Statement
Given an `m × n` matrix where each row is sorted and the first element of each row > last element of the previous row, search for a target integer.

**LeetCode 74**

### Intuition
The matrix is essentially a **flattened sorted array** of size `m × n`. Map 1D index to 2D: `row = index / n`, `col = index % n`. Then apply standard binary search.

### Why Flatten Instead of 2D Search?
The constraint (row[i][n-1] < row[i+1][0]) means the entire matrix, read row by row, is strictly sorted. Treating it as a 1D array of length `m*n` makes it a textbook binary search.

### Test Cases

| Input | Output |
|-------|--------|
| `matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3` | `true` |
| `matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13` | `false` |
| `matrix = [[1]], target = 1` | `true` |
| `matrix = [[1,3]], target = 3` | `true` |
| `matrix = [[1],[3]], target = 2` | `false` |

### Java Code

```java
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length;
        int lo = 0, hi = m * n - 1;

        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int row = mid / n;   // map 1D → 2D
            int col = mid % n;
            int val = matrix[row][col];

            if (val == target) return true;
            else if (val < target) lo = mid + 1;
            else hi = mid - 1;
        }

        return false;
    }
}
// Time: O(log(m*n)) | Space: O(1)
```

---

## 9. Aggressive Cows / Allocate Books (Maximize Minimum)

### Problem Statement
**(Aggressive Cows — SPOJ / GFG)**  
Place `c` cows in `n` stalls at positions `stalls[]`. Maximize the **minimum distance** between any two cows.

**(Allocate Books — GFG)**  
Allocate `n` books to `m` students minimizing the **maximum pages** assigned to any student.

> Both are the same pattern: **Binary Search on Answer + Greedy Check**

### Intuition
The answer (minimum distance / maximum pages) lies in a range. The feasibility condition is monotone:
- "Can we place cows with minimum gap ≥ d?" — if YES for d, YES for all d' < d.
- "Can we allocate books with max pages ≤ p?" — if YES for p, YES for all p' > p.

Binary search the answer; check feasibility greedily.

### Why Greedy Check Works?
For a fixed `d`, greedily place each cow as far left as possible (first valid stall). If all cows placed → d is feasible. This greedy is provably optimal: placing earlier never hurts future placements.

### Test Cases — Aggressive Cows

| Input | Output |
|-------|--------|
| `stalls = [1,2,4,8,9], c = 3` | `3` |
| `stalls = [1,2,3], c = 2` | `1` |
| `stalls = [1,2,3,4,5], c = 2` | `4` |
| `stalls = [0,3,4,7,10,9], c = 4` | `3` |

### Java Code — Aggressive Cows

```java
import java.util.Arrays;

class AggressiveCows {
    public int maxMinDistance(int[] stalls, int c) {
        Arrays.sort(stalls);
        int n = stalls.length;
        int lo = 1;
        int hi = stalls[n - 1] - stalls[0];  // max possible distance

        while (lo < hi) {
            int mid = lo + (hi - lo + 1) / 2;  // upper mid (avoid infinite loop)

            if (canPlace(stalls, c, mid)) {
                lo = mid;       // mid works, try LARGER gap
            } else {
                hi = mid - 1;   // mid too large
            }
        }

        return lo;
    }

    private boolean canPlace(int[] stalls, int c, int minDist) {
        int count = 1;                  // place first cow at stalls[0]
        int lastPlaced = stalls[0];

        for (int i = 1; i < stalls.length; i++) {
            if (stalls[i] - lastPlaced >= minDist) {
                count++;
                lastPlaced = stalls[i];
                if (count == c) return true;
            }
        }

        return count >= c;
    }
}
// Time: O(n log n + n log(max_dist)) | Space: O(1)
```

### Java Code — Allocate Books

```java
class AllocateBooks {
    public int findPages(int[] books, int m) {
        if (m > books.length) return -1;  // impossible

        int lo = 0, hi = 0;
        for (int b : books) {
            lo = Math.max(lo, b);   // at minimum, max single book
            hi += b;                // at most, one student gets all
        }

        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;

            if (canAllocate(books, m, mid)) {
                hi = mid;       // feasible, try less pages
            } else {
                lo = mid + 1;   // not feasible, need more pages
            }
        }

        return lo;
    }

    private boolean canAllocate(int[] books, int m, int maxPages) {
        int students = 1, pages = 0;

        for (int b : books) {
            if (pages + b > maxPages) {
                students++;     // give book to next student
                pages = b;
                if (students > m) return false;
            } else {
                pages += b;
            }
        }

        return true;
    }
}
// Time: O(n log(sum)) | Space: O(1)
```

---

## 10. Find in Mountain Array (Unknown Size / Double Binary Search)

### Problem Statement
Given a mountain array (values increase then decrease) and a target, return the **minimum index** where target is found, or `-1`. You can only access elements via `MountainArray.get(index)`.

**LeetCode 1095**

### Intuition — Three-Phase Binary Search
1. **Find the peak** of the mountain (maximum element) — binary search.
2. **Search ascending half** `[0, peak]` for target.
3. **Search descending half** `[peak+1, n-1]` for target (comparisons reversed).

Return the smaller index (ascending half answer takes priority).

### Why Find Peak First?
Without knowing the peak, we don't know which direction is "ascending" or "descending" at any `mid`. The peak separates two independently sorted (monotone) regions.

### Peak-Finding Logic
At any `mid`, compare `get(mid)` with `get(mid+1)`:
- `get(mid) < get(mid+1)` → still ascending → peak is to the right.
- Otherwise → past peak → peak is at mid or left.

### Test Cases

| Input | Output |
|-------|--------|
| `array = [1,2,3,4,5,3,1], target = 3` | `2` (ascending half first) |
| `array = [0,1,2,4,2,1], target = 3` | `-1` |
| `array = [1,5,2], target = 1` | `0` |
| `array = [1,2,3,4,5,3,1], target = 1` | `0` |
| `array = [3,5,3,2,0], target = 0` | `4` |

### Java Code

```java
interface MountainArray {
    int get(int index);
    int length();
}

class Solution {
    public int findInMountainArray(int target, MountainArray mountainArr) {
        int n = mountainArr.length();

        // Phase 1: Find peak index
        int lo = 0, hi = n - 2;  // peak can't be last element
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (mountainArr.get(mid) < mountainArr.get(mid + 1)) {
                lo = mid + 1;   // still ascending
            } else {
                hi = mid;       // descending or at peak
            }
        }
        int peak = lo;

        // Phase 2: Binary search ascending half [0, peak]
        int result = binarySearch(mountainArr, target, 0, peak, true);
        if (result != -1) return result;

        // Phase 3: Binary search descending half [peak+1, n-1]
        return binarySearch(mountainArr, target, peak + 1, n - 1, false);
    }

    private int binarySearch(MountainArray arr, int target, int lo, int hi, boolean ascending) {
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int val = arr.get(mid);

            if (val == target) return mid;

            if (ascending) {
                if (val < target) lo = mid + 1;
                else hi = mid - 1;
            } else {
                // Descending: larger values are to the LEFT
                if (val > target) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
}
// Time: O(log n) — 3 binary searches | Space: O(1)
```

---

## Pattern Summary

| # | Problem | Technique | Search Space |
|---|---------|-----------|--------------|
| 1 | Classic Binary Search | Exact match | Array indices |
| 2 | First & Last Position | Boundary search | Array indices |
| 3 | Rotated Sorted Array | Identify sorted half | Array indices |
| 4 | Min in Rotated Array | Compare with boundary | Array indices |
| 5 | Koko Eating Bananas | Binary search on answer | Answer value range |
| 6 | Median of Two Arrays | Partition search | Partition index |
| 7 | Find Peak Element | Slope direction | Array indices |
| 8 | Search 2D Matrix | Flatten to 1D | Matrix indices |
| 9 | Aggressive Cows / Allocate Books | BS on answer + greedy | Answer value range |
| 10 | Mountain Array | Multi-phase BS | Array indices |

---

## Decision Tree: Which Template to Use?

```
Is the array/space sorted or monotone?
├── YES → Standard binary search (Template 1 or 2)
│   ├── Exact match needed? → Template 1 (lo <= hi)
│   └── Boundary/leftmost? → Template 2 (lo < hi, hi = mid)
│
└── NO → Can I define a monotone condition on answer space?
    ├── YES → Binary search on answer (like Koko, Cows)
    └── NO → Look for hidden structure (rotation, mountain)
        ├── Rotation → Identify which half is sorted
        └── Mountain → Find peak first, then search halves
```

---

## Common Pitfalls

1. **Infinite loops**: When doing `lo < hi` with `lo = mid` (maximize), use `mid = lo + (hi - lo + 1) / 2` (upper mid). Otherwise `lo == mid` causes infinite loop.

2. **Off-by-one on hi**: For "binary search on answer," set `hi = max_possible + 1` if the answer could equal `max_possible` and condition is strictly monotone.

3. **Overflow**: Always use `mid = lo + (hi - lo) / 2`, never `(lo + hi) / 2`.

4. **Empty array**: Always handle `n == 0` before entering the loop.

5. **Wrong return**: When loop ends with `lo < hi` template, `lo == hi` is always your answer. Don't return `lo - 1` or `hi + 1`.