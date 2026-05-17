# Dynamic Programming — 20 Problems Covering 95% of Patterns

> Master these 20 problems and you will recognize, map, and solve virtually any DP question in interviews and competitive programming.

---

## How to Think in DP (Universal Framework)

Before diving into problems, internalize this:

1. **Define the state** — What does `dp[i]` or `dp[i][j]` represent?
2. **Write the recurrence** — How does a state depend on smaller subproblems?
3. **Identify base cases** — What are the trivially known values?
4. **Determine traversal order** — Which direction do you fill the table?
5. **Extract the answer** — Which cell(s) hold the final answer?

---

## Pattern Index

| # | Problem | Pattern |
|---|---------|---------|
| 1 | Fibonacci / Climbing Stairs | Linear DP |
| 2 | House Robber | Linear DP with Skip |
| 3 | Longest Increasing Subsequence | Classic Subsequence |
| 4 | Longest Common Subsequence | Two-Sequence DP |
| 5 | Edit Distance | Two-Sequence DP |
| 6 | 0/1 Knapsack | Subset / Inclusion-Exclusion |
| 7 | Coin Change (Min Coins) | Unbounded Knapsack |
| 8 | Coin Change II (Count Ways) | Unbounded Knapsack Count |
| 9 | Partition Equal Subset Sum | Subset Sum |
| 10 | Word Break | String Segmentation |
| 11 | Matrix Chain Multiplication | Interval DP |
| 12 | Burst Balloons | Interval DP (Reverse Thinking) |
| 13 | Unique Paths | Grid DP |
| 14 | Minimum Path Sum | Grid DP |
| 15 | Maximal Square | Grid DP (2D extension) |
| 16 | Best Time to Buy and Sell Stock (with Cooldown) | State Machine DP |
| 17 | Palindromic Substrings / LPS | Palindrome DP |
| 18 | Decode Ways | Conditional Linear DP |
| 19 | Distinct Subsequences | Two-Sequence Count DP |
| 20 | Russian Doll Envelopes / 2D LIS | Multi-dimensional / Advanced |

---

---

## Problem 1 — Climbing Stairs (Linear DP / Fibonacci)

### Problem Statement
You are climbing a staircase with `n` steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you reach the top?

**Example:**
- Input: `n = 5`
- Output: `8`

### Intuition
To reach step `i`, you either came from step `i-1` (one step) or step `i-2` (two steps). So the total ways to reach `i` = ways to reach `i-1` + ways to reach `i-2`. This is exactly Fibonacci!

### Why This Approach?
The problem has **optimal substructure** (answer at step `i` depends on smaller steps) and **overlapping subproblems** (same sub-steps computed repeatedly in recursion). DP eliminates recomputation.

### Recurrence
```
dp[i] = dp[i-1] + dp[i-2]
Base: dp[1] = 1, dp[2] = 2
```

### Java Code
```java
public int climbStairs(int n) {
    if (n <= 2) return n;
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

### Test Cases
| Input | Output | Reason |
|-------|--------|--------|
| 1 | 1 | Only one way: {1} |
| 2 | 2 | {1,1} or {2} |
| 5 | 8 | Standard case |
| 10 | 89 | Fibonacci(12) |

---

---

## Problem 2 — House Robber (Linear DP with Skip)

### Problem Statement
Given an array of non-negative integers representing amounts of money in houses, rob the maximum money without robbing two adjacent houses.

**Example:**
- Input: `[2, 7, 9, 3, 1]`
- Output: `12` (rob houses 0, 2, 4 → 2+9+1=12)

### Intuition
At each house `i`, you make a binary decision:
- **Rob it**: Gain `nums[i]` + best up to `i-2`
- **Skip it**: Take best up to `i-1`

### Why This Approach?
You cannot make a greedy choice (robbing the largest doesn't always work due to adjacency). DP captures all decisions.

### Recurrence
```
dp[i] = max(dp[i-1], dp[i-2] + nums[i])
Base: dp[0] = nums[0], dp[1] = max(nums[0], nums[1])
```

### Java Code
```java
public int rob(int[] nums) {
    int n = nums.length;
    if (n == 1) return nums[0];
    int prev2 = nums[0];
    int prev1 = Math.max(nums[0], nums[1]);
    for (int i = 2; i < n; i++) {
        int curr = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

### Test Cases
| Input | Output |
|-------|--------|
| [1,2,3,1] | 4 |
| [2,7,9,3,1] | 12 |
| [5] | 5 |
| [2,1,1,2] | 4 |

---

---

## Problem 3 — Longest Increasing Subsequence (LIS)

### Problem Statement
Given an integer array `nums`, return the length of the longest strictly increasing subsequence.

**Example:**
- Input: `[10, 9, 2, 5, 3, 7, 101, 18]`
- Output: `4` → `[2, 3, 7, 101]`

### Intuition
For each element `nums[i]`, look at all previous elements `nums[j]` where `j < i` and `nums[j] < nums[i]`. The LIS ending at `i` is the best LIS ending at any such `j`, plus 1.

### Why DP (not Greedy alone)?
Pure greedy fails. You need to track ALL possible LIS endings. The O(n log n) patience sort is greedy + binary search but the O(n²) DP is foundational.

### Recurrence
```
dp[i] = max(dp[j] + 1) for all j < i where nums[j] < nums[i]
Base: dp[i] = 1 (each element alone)
Answer: max(dp)
```

### Java Code
```java
// O(n^2) DP
public int lengthOfLIS(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    Arrays.fill(dp, 1);
    int maxLen = 1;
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLen = Math.max(maxLen, dp[i]);
    }
    return maxLen;
}

// O(n log n) — Patience Sort
public int lengthOfLIS_NLogN(int[] nums) {
    List<Integer> tails = new ArrayList<>();
    for (int num : nums) {
        int lo = 0, hi = tails.size();
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (tails.get(mid) < num) lo = mid + 1;
            else hi = mid;
        }
        if (lo == tails.size()) tails.add(num);
        else tails.set(lo, num);
    }
    return tails.size();
}
```

### Test Cases
| Input | Output |
|-------|--------|
| [10,9,2,5,3,7,101,18] | 4 |
| [0,1,0,3,2,3] | 4 |
| [7,7,7,7] | 1 |
| [1,3,6,7,9,4,10,5,6] | 6 |

---

---

## Problem 4 — Longest Common Subsequence (LCS)

### Problem Statement
Given two strings `text1` and `text2`, return the length of their longest common subsequence. A subsequence need not be contiguous.

**Example:**
- Input: `text1 = "abcde"`, `text2 = "ace"`
- Output: `3` → "ace"

### Intuition
Build a 2D table. `dp[i][j]` = LCS of first `i` chars of text1 and first `j` chars of text2.
- If `text1[i-1] == text2[j-1]`: both chars match → `dp[i][j] = dp[i-1][j-1] + 1`
- Else: take the best by ignoring one char → `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`

### Why 2D DP?
Two sequences create a 2D state space. Each cell only depends on left, top, and diagonal — clean bottom-up fill.

### Java Code
```java
public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}
```

### Test Cases
| text1 | text2 | Output |
|-------|-------|--------|
| "abcde" | "ace" | 3 |
| "abc" | "abc" | 3 |
| "abc" | "def" | 0 |
| "oxcpqrsvwf" | "shmtulqrypy" | 2 |

---

---

## Problem 5 — Edit Distance (Levenshtein)

### Problem Statement
Given two strings `word1` and `word2`, return the minimum number of operations (insert, delete, replace) to convert `word1` to `word2`.

**Example:**
- Input: `word1 = "horse"`, `word2 = "ros"`
- Output: `3`

### Intuition
`dp[i][j]` = min operations to convert first `i` chars of word1 to first `j` chars of word2.
- Chars match: `dp[i][j] = dp[i-1][j-1]` (no cost)
- Chars differ: `dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])` → replace, delete, insert

### Why This Approach?
Three operations map cleanly to three neighboring cells in the DP table. This is the canonical two-sequence transformation DP.

### Java Code
```java
public int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j - 1],
                                Math.min(dp[i - 1][j], dp[i][j - 1]));
            }
        }
    }
    return dp[m][n];
}
```

### Test Cases
| word1 | word2 | Output |
|-------|-------|--------|
| "horse" | "ros" | 3 |
| "intention" | "execution" | 5 |
| "" | "abc" | 3 |
| "abc" | "abc" | 0 |

---

---

## Problem 6 — 0/1 Knapsack

### Problem Statement
Given `n` items each with weight `w[i]` and value `v[i]`, and a knapsack capacity `W`, find the maximum value you can carry. Each item can be used **at most once**.

**Example:**
- weights = [1,3,4,5], values = [1,4,5,7], W = 7
- Output: `9` (items with weights 3 and 4)

### Intuition
`dp[i][w]` = max value using first `i` items with capacity `w`.
- Don't take item `i`: `dp[i-1][w]`
- Take item `i` (if `w[i] <= w`): `dp[i-1][w-w[i]] + v[i]`
- Take the max.

### Why "0/1"?
Each item is either taken (1) or not (0) — no repetition. This forces us to look at `dp[i-1]` row, not `dp[i]`.

### Java Code
```java
public int knapsack(int W, int[] weights, int[] values, int n) {
    int[][] dp = new int[n + 1][W + 1];
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i - 1][w]; // don't take
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(dp[i][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1]);
            }
        }
    }
    return dp[n][W];
}

// Space optimized — 1D
public int knapsack1D(int W, int[] weights, int[] values, int n) {
    int[] dp = new int[W + 1];
    for (int i = 0; i < n; i++) {
        for (int w = W; w >= weights[i]; w--) { // reverse to avoid reuse
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    return dp[W];
}
```

### Test Cases
| W | weights | values | Output |
|---|---------|--------|--------|
| 7 | [1,3,4,5] | [1,4,5,7] | 9 |
| 10 | [5,4,3] | [10,40,30] | 70 |
| 0 | [1,2] | [10,20] | 0 |
| 3 | [4,5] | [1,2] | 0 |

---

---

## Problem 7 — Coin Change (Minimum Coins)

### Problem Statement
Given coin denominations and amount `n`, find the minimum number of coins to make exactly `n`. Coins can be reused unlimited times.

**Example:**
- coins = [1, 5, 6, 9], amount = 11
- Output: `2` (5 + 6)

### Intuition
`dp[i]` = min coins to make amount `i`.
For each amount, try every coin: `dp[i] = min(dp[i - coin] + 1)` for all valid coins.

### Why Unbounded?
Each coin can be picked multiple times → when processing coin `c`, we allow using it again (unlike 0/1 knapsack where we iterate backwards).

### Recurrence
```
dp[0] = 0
dp[i] = min(dp[i - coin] + 1) for each coin where coin <= i
Answer: dp[amount] (or -1 if unreachable)
```

### Java Code
```java
public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1); // sentinel infinity
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}
```

### Test Cases
| coins | amount | Output |
|-------|--------|--------|
| [1,5,6,9] | 11 | 2 |
| [1,2,5] | 11 | 3 |
| [2] | 3 | -1 |
| [1] | 0 | 0 |

---

---

## Problem 8 — Coin Change II (Count Ways)

### Problem Statement
Given coin denominations and an `amount`, return the number of combinations to make exactly `amount`. Each coin may be used unlimited times.

**Example:**
- coins = [1,2,5], amount = 5
- Output: `4` → {5}, {2,2,1}, {2,1,1,1}, {1,1,1,1,1}

### Intuition
`dp[i]` = number of ways to make amount `i`. For each coin, update: `dp[i] += dp[i - coin]`.

### Key Difference from Problem 7
Here we **count ways**, not minimize. We iterate **coins in outer loop** and **amounts in inner** to avoid counting permutations as separate combinations.

### Java Code
```java
public int change(int amount, int[] coins) {
    int[] dp = new int[amount + 1];
    dp[0] = 1; // one way to make 0 — use nothing
    for (int coin : coins) {           // outer: coins
        for (int i = coin; i <= amount; i++) { // inner: amounts
            dp[i] += dp[i - coin];
        }
    }
    return dp[amount];
}
```

### Why Outer Loop = Coins?
If amounts were outer and coins inner, we'd count [1,2] and [2,1] as different — giving permutations, not combinations.

### Test Cases
| coins | amount | Output |
|-------|--------|--------|
| [1,2,5] | 5 | 4 |
| [2] | 3 | 0 |
| [10] | 10 | 1 |
| [1,2,3] | 4 | 4 |

---

---

## Problem 9 — Partition Equal Subset Sum

### Problem Statement
Given an integer array `nums`, return true if it can be partitioned into two subsets with equal sum.

**Example:**
- Input: `[1, 5, 11, 5]`
- Output: `true` → {1,5,5} and {11}

### Intuition
If total sum is odd → impossible. Otherwise, find if any subset sums to `total/2`. This reduces to **subset sum** which is a 0/1 knapsack variant.

### Recurrence
`dp[j]` = true if subset with sum `j` is achievable.
For each num, iterate j from target down to num: `dp[j] |= dp[j - num]`

### Java Code
```java
public boolean canPartition(int[] nums) {
    int sum = 0;
    for (int n : nums) sum += n;
    if (sum % 2 != 0) return false;
    int target = sum / 2;
    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    for (int num : nums) {
        for (int j = target; j >= num; j--) {
            dp[j] = dp[j] || dp[j - num];
        }
    }
    return dp[target];
}
```

### Test Cases
| Input | Output |
|-------|--------|
| [1,5,11,5] | true |
| [1,2,3,5] | false |
| [2,2,1,1] | true |
| [1] | false |

---

---

## Problem 10 — Word Break

### Problem Statement
Given a string `s` and a dictionary `wordDict`, return true if `s` can be segmented into space-separated words from the dictionary.

**Example:**
- s = "leetcode", wordDict = ["leet", "code"]
- Output: `true`

### Intuition
`dp[i]` = true if `s[0..i-1]` can be segmented. For each position `i`, check all splits `j` where `dp[j]` is true and `s[j..i-1]` is in dict.

### Why DP?
Naive recursion recomputes the same suffix multiple times. DP caches results for each prefix end-index.

### Java Code
```java
public boolean wordBreak(String s, List<String> wordDict) {
    Set<String> dict = new HashSet<>(wordDict);
    int n = s.length();
    boolean[] dp = new boolean[n + 1];
    dp[0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) {
            if (dp[j] && dict.contains(s.substring(j, i))) {
                dp[i] = true;
                break;
            }
        }
    }
    return dp[n];
}
```

### Test Cases
| s | wordDict | Output |
|---|----------|--------|
| "leetcode" | ["leet","code"] | true |
| "applepenapple" | ["apple","pen"] | true |
| "catsandog" | ["cats","dog","sand","and","cat"] | false |
| "aaaaaaa" | ["aaaa","aaa"] | true |

---

---

## Problem 11 — Matrix Chain Multiplication (Interval DP)

### Problem Statement
Given `n` matrices, find the minimum number of scalar multiplications to compute their product. Matrix `i` has dimensions `dims[i-1] x dims[i]`.

**Example:**
- dims = [10, 30, 5, 60]
- Output: `4500`

### Intuition
`dp[i][j]` = min cost to multiply matrices `i` through `j`. Try every split point `k` between `i` and `j`:
`dp[i][j] = min(dp[i][k] + dp[k+1][j] + dims[i-1]*dims[k]*dims[j])`

### Why Interval DP?
The problem naturally decomposes over **intervals** of matrices. We compute smaller intervals first and build up.

### Java Code
```java
public int matrixChainOrder(int[] dims) {
    int n = dims.length - 1; // number of matrices
    int[][] dp = new int[n][n];
    // len = chain length
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i <= n - len; i++) {
            int j = i + len - 1;
            dp[i][j] = Integer.MAX_VALUE;
            for (int k = i; k < j; k++) {
                int cost = dp[i][k] + dp[k + 1][j]
                         + dims[i] * dims[k + 1] * dims[j + 1];
                dp[i][j] = Math.min(dp[i][j], cost);
            }
        }
    }
    return dp[0][n - 1];
}
```

### Test Cases
| dims | Output |
|------|--------|
| [10,30,5,60] | 4500 |
| [40,20,30,10,30] | 26000 |
| [1,2,3,4] | 18 |

---

---

## Problem 12 — Burst Balloons (Interval DP — Reverse Thinking)

### Problem Statement
Given `n` balloons with values `nums[i]`, bursting balloon `i` earns `nums[i-1]*nums[i]*nums[i+1]` coins. Return max coins from bursting all balloons. Boundaries are `1`.

**Example:**
- Input: `[3, 1, 5, 8]`
- Output: `167`

### Intuition — The Key Twist
Instead of thinking which balloon to burst **first**, think which to burst **last** in a range `[left, right]`.
`dp[i][j]` = max coins from bursting all balloons between `i` and `j` (exclusive boundaries).
If balloon `k` is the last in range: `dp[i][j] = dp[i][k] + dp[k][j] + nums[i]*nums[k]*nums[j]`

### Why Reverse Thinking?
Bursting changes neighbors, making forward state messy. Last-to-burst maintains fixed boundaries.

### Java Code
```java
public int maxCoins(int[] nums) {
    int n = nums.length;
    int[] arr = new int[n + 2];
    arr[0] = arr[n + 1] = 1;
    for (int i = 0; i < n; i++) arr[i + 1] = nums[i];
    int m = n + 2;
    int[][] dp = new int[m][m];
    for (int len = 2; len < m; len++) {
        for (int left = 0; left < m - len; left++) {
            int right = left + len;
            for (int k = left + 1; k < right; k++) {
                dp[left][right] = Math.max(dp[left][right],
                    dp[left][k] + dp[k][right] + arr[left] * arr[k] * arr[right]);
            }
        }
    }
    return dp[0][m - 1];
}
```

### Test Cases
| Input | Output |
|-------|--------|
| [3,1,5,8] | 167 |
| [1,5] | 10 |
| [1] | 1 |
| [7,9,8,0,7,1,3,5,5,2,3] | 1654 |

---

---

## Problem 13 — Unique Paths (Grid DP)

### Problem Statement
A robot starts at top-left of an `m x n` grid and can only move right or down. Count the distinct paths to reach the bottom-right.

**Example:**
- m=3, n=7 → Output: `28`

### Intuition
`dp[i][j]` = number of ways to reach cell `(i,j)`. You can only arrive from top `(i-1,j)` or left `(i,j-1)`.
`dp[i][j] = dp[i-1][j] + dp[i][j-1]`
Base: entire top row and left column = 1.

### Java Code
```java
public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int i = 0; i < m; i++) dp[i][0] = 1;
    for (int j = 0; j < n; j++) dp[0][j] = 1;
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    return dp[m - 1][n - 1];
}
```

### Test Cases
| m | n | Output |
|---|---|--------|
| 3 | 7 | 28 |
| 3 | 2 | 3 |
| 1 | 1 | 1 |
| 10 | 10 | 48620 |

---

---

## Problem 14 — Minimum Path Sum (Grid DP)

### Problem Statement
Given an `m x n` grid of non-negative integers, find the path from top-left to bottom-right (moving only right or down) that minimizes the sum of all numbers along the path.

**Example:**
- Grid: `[[1,3,1],[1,5,1],[4,2,1]]`
- Output: `7` → 1→3→1→1→1

### Intuition
`dp[i][j]` = min sum to reach cell `(i,j)`.
`dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`

### Java Code
```java
public int minPathSum(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    int[][] dp = new int[m][n];
    dp[0][0] = grid[0][0];
    for (int i = 1; i < m; i++) dp[i][0] = dp[i-1][0] + grid[i][0];
    for (int j = 1; j < n; j++) dp[0][j] = dp[0][j-1] + grid[0][j];
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1]);
    return dp[m-1][n-1];
}
```

### Test Cases
| Grid | Output |
|------|--------|
| [[1,3,1],[1,5,1],[4,2,1]] | 7 |
| [[1,2],[5,6],[1,1]] | 8 |
| [[1]] | 1 |

---

---

## Problem 15 — Maximal Square (2D Grid DP)

### Problem Statement
Given an `m x n` binary matrix, find the largest square containing only `'1'`s and return its area.

**Example:**
- Input: `[["1","0","1","1","1"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]`
- Output: `4`

### Intuition — The Key Insight
`dp[i][j]` = side length of the largest square whose **bottom-right corner** is at `(i,j)`.
If `matrix[i][j] == '1'`:
`dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1`
The minimum of three neighbors limits the square you can form.

### Why Min of Three?
You need the top, left, and diagonal squares to all be of at least that size to extend the square.

### Java Code
```java
public int maximalSquare(char[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    int[][] dp = new int[m + 1][n + 1];
    int maxSide = 0;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (matrix[i-1][j-1] == '1') {
                dp[i][j] = Math.min(dp[i-1][j],
                            Math.min(dp[i][j-1], dp[i-1][j-1])) + 1;
                maxSide = Math.max(maxSide, dp[i][j]);
            }
        }
    }
    return maxSide * maxSide;
}
```

### Test Cases
| Input | Output |
|-------|--------|
| [["1","0","1","1","1"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]] | 4 |
| [["0","1"],["1","0"]] | 1 |
| [["0"]] | 0 |
| [["1","1","1"],["1","1","1"],["1","1","1"]] | 9 |

---

---

## Problem 16 — Best Time to Buy/Sell Stock with Cooldown (State Machine DP)

### Problem Statement
Given stock prices, find max profit. After selling, you must wait 1 day (cooldown) before buying. You may not hold multiple stocks.

**Example:**
- prices = [1, 2, 3, 0, 2]
- Output: `3` → buy day0, sell day2, cooldown day3, buy day4

### Intuition — State Machine
Model 3 states:
- **HELD**: currently holding a stock
- **SOLD**: just sold (entering cooldown)
- **REST**: cooldown/rest state (can buy next day)

Transitions:
- `held = max(held, rest - price)` (buy from rest)
- `sold = held + price` (sell)
- `rest = max(rest, sold)` (transition out of cooldown)

### Java Code
```java
public int maxProfit(int[] prices) {
    int held = Integer.MIN_VALUE, sold = 0, rest = 0;
    for (int price : prices) {
        int prevSold = sold;
        sold = held + price;
        held = Math.max(held, rest - price);
        rest = Math.max(rest, prevSold);
    }
    return Math.max(sold, rest);
}
```

### Test Cases
| prices | Output |
|--------|--------|
| [1,2,3,0,2] | 3 |
| [1] | 0 |
| [2,1] | 0 |
| [6,1,3,2,4,7] | 6 |

---

---

## Problem 17 — Longest Palindromic Substring (Palindrome DP)

### Problem Statement
Given a string `s`, return the longest palindromic substring.

**Example:**
- Input: `"babad"`
- Output: `"bab"` or `"aba"`

### Intuition
`dp[i][j]` = true if `s[i..j]` is a palindrome.
- `dp[i][i] = true` (single char)
- `dp[i][i+1] = (s[i] == s[i+1])`
- `dp[i][j] = (s[i] == s[j]) && dp[i+1][j-1]` for len ≥ 3

### Why Fill by Length?
We need `dp[i+1][j-1]` to be computed before `dp[i][j]` — so iterate by increasing substring length.

### Java Code
```java
public String longestPalindrome(String s) {
    int n = s.length();
    boolean[][] dp = new boolean[n][n];
    int start = 0, maxLen = 1;
    // len 1
    for (int i = 0; i < n; i++) dp[i][i] = true;
    // len 2
    for (int i = 0; i < n - 1; i++) {
        if (s.charAt(i) == s.charAt(i + 1)) {
            dp[i][i + 1] = true;
            start = i; maxLen = 2;
        }
    }
    // len 3+
    for (int len = 3; len <= n; len++) {
        for (int i = 0; i <= n - len; i++) {
            int j = i + len - 1;
            if (s.charAt(i) == s.charAt(j) && dp[i + 1][j - 1]) {
                dp[i][j] = true;
                if (len > maxLen) { start = i; maxLen = len; }
            }
        }
    }
    return s.substring(start, start + maxLen);
}
```

### Test Cases
| Input | Output |
|-------|--------|
| "babad" | "bab" |
| "cbbd" | "bb" |
| "a" | "a" |
| "racecar" | "racecar" |

---

---

## Problem 18 — Decode Ways (Conditional Linear DP)

### Problem Statement
A string of digits can be decoded like `'A'=1, ..., 'Z'=26`. Return the number of ways to decode a given digit string.

**Example:**
- Input: `"226"`
- Output: `3` → "BZ"(2,26), "VF"(22,6), "BBF"(2,2,6)

### Intuition
`dp[i]` = number of ways to decode `s[0..i-1]`.
- Single digit decode: if `s[i-1] != '0'` → `dp[i] += dp[i-1]`
- Two digit decode: if `s[i-2..i-1]` is between 10–26 → `dp[i] += dp[i-2]`

### Why Conditional?
'0' cannot stand alone. Two-digit codes must be ≤ 26. These conditions make the recurrence non-trivial.

### Java Code
```java
public int numDecodings(String s) {
    int n = s.length();
    int[] dp = new int[n + 1];
    dp[0] = 1;
    dp[1] = s.charAt(0) == '0' ? 0 : 1;
    for (int i = 2; i <= n; i++) {
        int oneDigit = s.charAt(i - 1) - '0';
        int twoDigit = Integer.parseInt(s.substring(i - 2, i));
        if (oneDigit >= 1) dp[i] += dp[i - 1];
        if (twoDigit >= 10 && twoDigit <= 26) dp[i] += dp[i - 2];
    }
    return dp[n];
}
```

### Test Cases
| Input | Output |
|-------|--------|
| "226" | 3 |
| "12" | 2 |
| "06" | 0 |
| "11106" | 2 |
| "10" | 1 |

---

---

## Problem 19 — Distinct Subsequences (Count DP on Two Sequences)

### Problem Statement
Given strings `s` and `t`, count the number of distinct subsequences of `s` that equal `t`.

**Example:**
- s = "rabbbit", t = "rabbit"
- Output: `3` (choose which 'b' to skip)

### Intuition
`dp[i][j]` = number of ways to form `t[0..j-1]` from `s[0..i-1]`.
- If `s[i-1] != t[j-1]`: `dp[i][j] = dp[i-1][j]` (skip s[i-1])
- If `s[i-1] == t[j-1]`: `dp[i][j] = dp[i-1][j] + dp[i-1][j-1]` (use it or skip it)

### Why Two Options When Chars Match?
Even when characters match, you can choose not to use that occurrence of `s[i-1]` and find the match later.

### Java Code
```java
public int numDistinct(String s, String t) {
    int m = s.length(), n = t.length();
    long[][] dp = new long[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = 1; // empty t matched by any prefix
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = dp[i - 1][j]; // always: skip s[i-1]
            if (s.charAt(i - 1) == t.charAt(j - 1)) {
                dp[i][j] += dp[i - 1][j - 1]; // also: use s[i-1]
            }
        }
    }
    return (int) dp[m][n];
}
```

### Test Cases
| s | t | Output |
|---|---|--------|
| "rabbbit" | "rabbit" | 3 |
| "babgbag" | "bag" | 5 |
| "abc" | "abc" | 1 |
| "abc" | "d" | 0 |

---

---

## Problem 20 — Russian Doll Envelopes (2D LIS)

### Problem Statement
Each envelope has `[w, h]`. You can put envelope A inside B if `A.w < B.w` AND `A.h < B.h`. Return max envelopes you can nest.

**Example:**
- envelopes = [[5,4],[6,4],[6,7],[2,3]]
- Output: `3` → [2,3] → [5,4] → [6,7]

### Intuition
Sort by width ascending. For equal widths, sort height **descending** (prevents using two envelopes of same width). Then run LIS on heights only.

### Why Sort Height Descending for Equal Widths?
If widths are equal, you can't nest them. Descending height ensures LIS picks at most one from each equal-width group.

### Java Code
```java
public int maxEnvelopes(int[][] envelopes) {
    Arrays.sort(envelopes, (a, b) ->
        a[0] == b[0] ? b[1] - a[1] : a[0] - b[0]);
    // Extract heights and run O(n log n) LIS
    int[] heights = new int[envelopes.length];
    for (int i = 0; i < envelopes.length; i++) heights[i] = envelopes[i][1];
    return lisLength(heights);
}

private int lisLength(int[] nums) {
    List<Integer> tails = new ArrayList<>();
    for (int num : nums) {
        int lo = 0, hi = tails.size();
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (tails.get(mid) < num) lo = mid + 1;
            else hi = mid;
        }
        if (lo == tails.size()) tails.add(num);
        else tails.set(lo, num);
    }
    return tails.size();
}
```

### Test Cases
| envelopes | Output |
|-----------|--------|
| [[5,4],[6,4],[6,7],[2,3]] | 3 |
| [[1,1],[1,1],[1,1]] | 1 |
| [[2,100],[3,200],[4,300],[5,500],[5,400],[5,250],[6,400],[7,300]] | 5 |
| [[1,2]] | 1 |

---

---

## Summary: Pattern → Problem Mapping

| Pattern | Problems |
|---------|---------|
| **Linear DP** | 1, 2, 18 |
| **Subsequence DP** | 3, 17 |
| **Two-Sequence DP** | 4, 5, 19 |
| **Knapsack (0/1)** | 6, 9 |
| **Unbounded Knapsack** | 7, 8 |
| **String / Segmentation** | 10 |
| **Interval DP** | 11, 12 |
| **Grid DP** | 13, 14, 15 |
| **State Machine DP** | 16 |
| **Multi-dimensional / Hybrid** | 20 |

---

## Golden Rules for DP in Interviews

1. **Can I break this into overlapping subproblems?** → Yes → DP candidate
2. **Define state precisely** before writing any code
3. **Draw the recurrence** on paper first
4. **Start with top-down (memoization)** for clarity, optimize to bottom-up later
5. **Trace through a small example** manually before coding
6. **Space optimize** after correctness: most 2D DPs reduce to 1D
7. When stuck: think about what the **last decision** was (like in Burst Balloons)

---

*Master these 20 and you own Dynamic Programming.*