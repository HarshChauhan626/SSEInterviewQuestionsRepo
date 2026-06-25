# Backtracking — 10 Problems That Cover 95% of the Pattern

> **What is Backtracking?**
> Backtracking is a systematic way to iterate through all possible configurations of a search space. At each step, you make a choice, recurse into the next state, and *undo* the choice (backtrack) before trying the next option. Think of it as a DFS on a decision tree where you prune branches that can't possibly lead to a valid solution.

---

## Table of Contents
| # | Problem | Difficulty | Jump to Solution |
|---|---------|:----------:|------------------|
| 1 | Subsets (Power Set) | 🟢 Easy | [→ #1](#subsets-power-set) |
| 2 | Subsets II (With Duplicates) | 🟡 Medium | [→ #2](#subsets-ii-with-duplicates) |
| 3 | Permutations | 🟡 Medium | [→ #3](#permutations) |
| 4 | Permutations II (With Duplicates) | 🟡 Medium | [→ #4](#permutations-ii-with-duplicates) |
| 5 | Combination Sum | 🟡 Medium | [→ #5](#combination-sum) |
| 6 | Combination Sum II (Each element used once) | 🟡 Medium | [→ #6](#combination-sum-ii-each-element-used-once) |
| 7 | N-Queens | 🔴 Hard | [→ #7](#n-queens) |
| 8 | Word Search | 🟡 Medium | [→ #8](#word-search) |
| 9 | Palindrome Partitioning | 🟡 Medium | [→ #9](#palindrome-partitioning) |
| 10 | Sudoku Solver | 🔴 Hard | [→ #10](#sudoku-solver) |

---

## The Universal Backtracking Template

```java
void backtrack(State current, Result result, ...) {
    // 1. Base case — valid complete solution
    if (isComplete(current)) {
        result.add(new Solution(current));
        return;
    }

    // 2. Iterate over all choices at this step
    for (Choice c : getChoices(current)) {
        if (isValid(c, current)) {        // 3. Prune invalid branches
            makeChoice(c, current);       // 4. Choose
            backtrack(current, result);   // 5. Explore
            undoChoice(c, current);       // 6. Un-choose (backtrack)
        }
    }
}
```

**The 3 questions to ask for every problem:**
1. **What is a "choice"?** (what do I pick at each step?)
2. **What is the "constraint"?** (when do I prune?)
3. **What is the "goal"?** (when do I record a solution?)

---

<a id="subsets-power-set"></a>
## Problem 1 — Subsets (Power Set)

### Problem Statement
Given an integer array `nums` of **unique** elements, return all possible subsets (the power set). The solution must not contain duplicate subsets.

**Example:**
```
Input:  nums = [1, 2, 3]
Output: [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

### Intuition
Every element has exactly two choices: **include** it or **exclude** it. We make this binary decision for each element from index `start` onward, collecting the current path whenever we descend (every node in the decision tree is a valid subset).

### Why This Approach?
- No pruning needed (all subsets are valid).
- Starting from `start` index avoids duplicates because we never go backward.
- Time: O(2ⁿ · n) — 2ⁿ subsets, each copied in O(n). Space: O(n) recursion depth.

### Decision Tree
```
                    []
           /                \
        [1]                  []
       /    \              /    \
    [1,2]  [1]          [2]    []
    /  \   /  \        /  \   /  \
[1,2,3][1,2][1,3][1] [2,3][2][3] []
```

### Java Code
```java
import java.util.*;

class Subsets {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, int start,
                           List<Integer> current,
                           List<List<Integer>> result) {
        result.add(new ArrayList<>(current)); // every node is a valid subset

        for (int i = start; i < nums.length; i++) {
            current.add(nums[i]);              // choose
            backtrack(nums, i + 1, current, result); // explore
            current.remove(current.size() - 1); // un-choose
        }
    }

    // Test
    public static void main(String[] args) {
        Subsets s = new Subsets();
        System.out.println(s.subsets(new int[]{1, 2, 3}));
        // [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
        System.out.println(s.subsets(new int[]{0}));
        // [[], [0]]
    }
}
```

### Test Cases
| Input | Expected Output |
|-------|----------------|
| `[1,2,3]` | `[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]` |
| `[0]` | `[[],[0]]` |
| `[]` | `[[]]` |

---

<a id="subsets-ii-with-duplicates"></a>
## Problem 2 — Subsets II (With Duplicates)

### Problem Statement
Given an integer array `nums` that **may contain duplicates**, return all possible subsets without duplicate subsets.

**Example:**
```
Input:  nums = [1, 2, 2]
Output: [[], [1], [1,2], [1,2,2], [2], [2,2]]
```

### Intuition
Same as Subsets, but after sorting, we **skip over duplicate values at the same recursion level**. The key insight: if `nums[i] == nums[i-1]` and we're at the same depth (i > start), we'd generate the same subtree twice — so we skip it.

### Why This Approach?
Sorting groups duplicates together. The condition `i > start && nums[i] == nums[i-1]` says: "I've already explored a branch that starts with this value at this level, skip."

### Java Code
```java
import java.util.*;

class SubsetsII {
    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums); // crucial: group duplicates
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, int start,
                           List<Integer> current,
                           List<List<Integer>> result) {
        result.add(new ArrayList<>(current));

        for (int i = start; i < nums.length; i++) {
            // Skip duplicate at same recursion level
            if (i > start && nums[i] == nums[i - 1]) continue;
            current.add(nums[i]);
            backtrack(nums, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        SubsetsII s = new SubsetsII();
        System.out.println(s.subsetsWithDup(new int[]{1, 2, 2}));
        // [[], [1], [1,2], [1,2,2], [2], [2,2]]
        System.out.println(s.subsetsWithDup(new int[]{0}));
        // [[], [0]]
    }
}
```

### Test Cases
| Input | Expected Output |
|-------|----------------|
| `[1,2,2]` | `[[],[1],[1,2],[1,2,2],[2],[2,2]]` |
| `[1,1,2,2]` | `[[],[1],[1,1],[1,1,2],[1,1,2,2],[1,2],[1,2,2],[2],[2,2]]` |
| `[0]` | `[[],[0]]` |

---

<a id="permutations"></a>
## Problem 3 — Permutations

### Problem Statement
Given an array `nums` of **distinct** integers, return all possible permutations.

**Example:**
```
Input:  nums = [1, 2, 3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

### Intuition
Unlike subsets, order matters in permutations. At each step, we pick **any unused** element. We track which elements are used with a boolean array. The base case is when current path length equals nums length.

### Why This Approach?
- A `used[]` array avoids revisiting elements in the same permutation.
- We always iterate from index 0 (not `start`) because any unused element can go in any position.
- Time: O(n! · n). Space: O(n).

### Java Code
```java
import java.util.*;

class Permutations {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, new boolean[nums.length], new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, boolean[] used,
                           List<Integer> current,
                           List<List<Integer>> result) {
        if (current.size() == nums.length) {
            result.add(new ArrayList<>(current));
            return;
        }

        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;        // skip used elements
            used[i] = true;               // choose
            current.add(nums[i]);
            backtrack(nums, used, current, result); // explore
            used[i] = false;              // un-choose
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        Permutations p = new Permutations();
        System.out.println(p.permute(new int[]{1, 2, 3}));
        System.out.println(p.permute(new int[]{0, 1}));
        System.out.println(p.permute(new int[]{1}));
    }
}
```

### Test Cases
| Input | Expected Count | Sample Output |
|-------|----------------|--------------|
| `[1,2,3]` | 6 | `[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]` |
| `[0,1]` | 2 | `[[0,1],[1,0]]` |
| `[1]` | 1 | `[[1]]` |

---

<a id="permutations-ii-with-duplicates"></a>
## Problem 4 — Permutations II (With Duplicates)

### Problem Statement
Given a collection of numbers `nums` that **might contain duplicates**, return all unique permutations.

**Example:**
```
Input:  nums = [1, 1, 2]
Output: [[1,1,2],[1,2,1],[2,1,1]]
```

### Intuition
Sort first. For each level, if `nums[i] == nums[i-1]` and `nums[i-1]` is **not used**, skip — this means we already tried placing this value from a previous identical sibling, generating the same subtree.

### Why `!used[i-1]` instead of `used[i-1]`?
If `used[i-1]` is false, the previous identical element was already fully explored and backtracked at this recursion level. Using `nums[i]` here would produce a duplicate.

### Java Code
```java
import java.util.*;

class PermutationsII {
    public List<List<Integer>> permuteUnique(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, new boolean[nums.length], new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, boolean[] used,
                           List<Integer> current,
                           List<List<Integer>> result) {
        if (current.size() == nums.length) {
            result.add(new ArrayList<>(current));
            return;
        }

        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            // Skip duplicate: same value, previous copy not yet used at this level
            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;

            used[i] = true;
            current.add(nums[i]);
            backtrack(nums, used, current, result);
            used[i] = false;
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        PermutationsII p = new PermutationsII();
        System.out.println(p.permuteUnique(new int[]{1, 1, 2}));
        // [[1,1,2],[1,2,1],[2,1,1]]
        System.out.println(p.permuteUnique(new int[]{1, 2, 3}));
        // 6 unique permutations
    }
}
```

### Test Cases
| Input | Expected Output |
|-------|----------------|
| `[1,1,2]` | `[[1,1,2],[1,2,1],[2,1,1]]` |
| `[1,2,3]` | All 6 permutations |
| `[1,1,1]` | `[[1,1,1]]` |

---

<a id="combination-sum"></a>
## Problem 5 — Combination Sum

### Problem Statement
Given an array of **distinct** integers `candidates` and a target integer `target`, return all unique combinations where the chosen numbers sum to `target`. The same number may be chosen **unlimited** times.

**Example:**
```
Input:  candidates = [2,3,6,7], target = 7
Output: [[2,2,3],[7]]
```

### Intuition
At each step, pick a candidate ≥ current index (allows reuse). Subtract it from remaining target. Prune when remaining < 0. Record when remaining == 0.

### Why start index (not used array)?
We allow reuse, so we pass `i` (not `i+1`) when recurring. Passing `i` as start prevents going backward, avoiding duplicates like `[3,2,2]` when `[2,2,3]` already exists.

### Java Code
```java
import java.util.*;

class CombinationSum {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        Arrays.sort(candidates); // enables early pruning
        backtrack(candidates, 0, target, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] candidates, int start,
                           int remaining, List<Integer> current,
                           List<List<Integer>> result) {
        if (remaining == 0) {
            result.add(new ArrayList<>(current));
            return;
        }

        for (int i = start; i < candidates.length; i++) {
            if (candidates[i] > remaining) break; // pruning: sorted array
            current.add(candidates[i]);
            backtrack(candidates, i, remaining - candidates[i], current, result); // i not i+1 (reuse)
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        CombinationSum cs = new CombinationSum();
        System.out.println(cs.combinationSum(new int[]{2, 3, 6, 7}, 7));
        // [[2,2,3],[7]]
        System.out.println(cs.combinationSum(new int[]{2, 3, 5}, 8));
        // [[2,2,2,2],[2,3,3],[3,5]]
    }
}
```

### Test Cases
| Input | Target | Expected Output |
|-------|--------|----------------|
| `[2,3,6,7]` | 7 | `[[2,2,3],[7]]` |
| `[2,3,5]` | 8 | `[[2,2,2,2],[2,3,3],[3,5]]` |
| `[2]` | 1 | `[]` |

---

<a id="combination-sum-ii-each-element-used-once"></a>
## Problem 6 — Combination Sum II (Each element used once)

### Problem Statement
Given a collection `candidates` (may have duplicates) and a `target`, find all unique combinations where each number is used **at most once**.

**Example:**
```
Input:  candidates = [10,1,2,7,6,1,5], target = 8
Output: [[1,1,6],[1,2,5],[1,7],[2,6]]
```

### Intuition
Sort + skip duplicates at the same level (like Subsets II), but now we recurse with `i+1` since each element is used at most once. The duplicate-skip rule: if `i > start && nums[i] == nums[i-1]`, we've already tried this value at this depth.

### Why This Approach?
Combining the "no-reuse" constraint (`i+1`) with the "no-duplicate-subtree" constraint (`i > start && same value`) cleanly eliminates all duplicate combinations.

### Java Code
```java
import java.util.*;

class CombinationSumII {
    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, 0, target, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] candidates, int start,
                           int remaining, List<Integer> current,
                           List<List<Integer>> result) {
        if (remaining == 0) {
            result.add(new ArrayList<>(current));
            return;
        }

        for (int i = start; i < candidates.length; i++) {
            if (candidates[i] > remaining) break; // pruning
            if (i > start && candidates[i] == candidates[i - 1]) continue; // skip dup

            current.add(candidates[i]);
            backtrack(candidates, i + 1, remaining - candidates[i], current, result);
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        CombinationSumII cs = new CombinationSumII();
        System.out.println(cs.combinationSum2(new int[]{10,1,2,7,6,1,5}, 8));
        // [[1,1,6],[1,2,5],[1,7],[2,6]]
        System.out.println(cs.combinationSum2(new int[]{2,5,2,1,2}, 5));
        // [[1,2,2],[5]]
    }
}
```

### Test Cases
| Input | Target | Expected Output |
|-------|--------|----------------|
| `[10,1,2,7,6,1,5]` | 8 | `[[1,1,6],[1,2,5],[1,7],[2,6]]` |
| `[2,5,2,1,2]` | 5 | `[[1,2,2],[5]]` |
| `[1,1,1,1]` | 3 | `[[1,1,1]]` |

---

<a id="n-queens"></a>
## Problem 7 — N-Queens

### Problem Statement
Place `n` queens on an `n×n` chessboard so no two queens attack each other. Return all distinct solutions. Each solution contains board placement (`'Q'` and `'.'`).

**Example:**
```
Input:  n = 4
Output: [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]
```

### Intuition
Place one queen per row. For each row, try every column. A placement is valid if no queen already placed shares the same column, or either diagonal. Recurse to the next row. Backtrack by removing the queen.

### Why Track Column + Diagonals?
- **Column conflict:** `cols` set
- **Left diagonal** (row - col is constant): `diag1` set
- **Right diagonal** (row + col is constant): `diag2` set

This gives O(1) validity check instead of O(n).

### Java Code
```java
import java.util.*;

class NQueens {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> result = new ArrayList<>();
        char[][] board = new char[n][n];
        for (char[] row : board) Arrays.fill(row, '.');
        backtrack(board, 0, new HashSet<>(), new HashSet<>(), new HashSet<>(), result);
        return result;
    }

    private void backtrack(char[][] board, int row,
                           Set<Integer> cols,
                           Set<Integer> diag1, // row - col
                           Set<Integer> diag2, // row + col
                           List<List<String>> result) {
        if (row == board.length) {
            result.add(buildBoard(board));
            return;
        }

        for (int col = 0; col < board.length; col++) {
            if (cols.contains(col) ||
                diag1.contains(row - col) ||
                diag2.contains(row + col)) continue; // pruning

            board[row][col] = 'Q';
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);

            backtrack(board, row + 1, cols, diag1, diag2, result);

            board[row][col] = '.';
            cols.remove(col);
            diag1.remove(row - col);
            diag2.remove(row + col);
        }
    }

    private List<String> buildBoard(char[][] board) {
        List<String> rows = new ArrayList<>();
        for (char[] row : board) rows.add(new String(row));
        return rows;
    }

    public static void main(String[] args) {
        NQueens nq = new NQueens();
        List<List<String>> res4 = nq.solveNQueens(4);
        System.out.println("n=4 solutions: " + res4.size()); // 2
        res4.forEach(sol -> { sol.forEach(System.out::println); System.out.println(); });

        System.out.println("n=1 solutions: " + nq.solveNQueens(1).size()); // 1
        System.out.println("n=3 solutions: " + nq.solveNQueens(3).size()); // 0
    }
}
```

### Test Cases
| n | Solutions Count |
|---|----------------|
| 1 | 1 |
| 3 | 0 |
| 4 | 2 |
| 8 | 92 |

---

<a id="word-search"></a>
## Problem 8 — Word Search

### Problem Statement
Given an `m×n` grid of characters and a string `word`, return `true` if `word` exists in the grid. The word can be constructed from sequentially adjacent cells (horizontally or vertically), and the same cell may not be used more than once.

**Example:**
```
Input:  board = [["A","B","C","E"],
                  ["S","F","C","S"],
                  ["A","D","E","E"]], word = "ABCCED"
Output: true
```

### Intuition
For each cell that matches `word[0]`, start a DFS/backtrack. At each step, mark the cell visited (modify in place: set to `#`), recurse in all 4 directions for the next character, then restore the cell. Prune when out-of-bounds, character mismatch, or already visited.

### Why In-Place Marking?
Avoids a separate `visited` matrix. Setting `board[r][c] = '#'` during exploration and restoring after is classic backtracking — cheap and clean.

### Java Code
```java
class WordSearch {
    private int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};

    public boolean exist(char[][] board, String word) {
        int m = board.length, n = board[0].length;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if (backtrack(board, word, r, c, 0)) return true;
        return false;
    }

    private boolean backtrack(char[][] board, String word,
                               int r, int c, int index) {
        if (index == word.length()) return true; // all chars matched
        if (r < 0 || r >= board.length ||
            c < 0 || c >= board[0].length ||
            board[r][c] != word.charAt(index)) return false; // pruning

        char temp = board[r][c];
        board[r][c] = '#';          // mark visited

        for (int[] d : dirs) {
            if (backtrack(board, word, r + d[0], c + d[1], index + 1))
                return true;
        }

        board[r][c] = temp;         // restore
        return false;
    }

    public static void main(String[] args) {
        WordSearch ws = new WordSearch();
        char[][] board = {
            {'A','B','C','E'},
            {'S','F','C','S'},
            {'A','D','E','E'}
        };
        System.out.println(ws.exist(board, "ABCCED")); // true
        System.out.println(ws.exist(board, "SEE"));    // true
        System.out.println(ws.exist(board, "ABCB"));   // false
    }
}
```

### Test Cases
| Board | Word | Expected |
|-------|------|----------|
| `[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]` | `"ABCCED"` | `true` |
| Same board | `"SEE"` | `true` |
| Same board | `"ABCB"` | `false` |
| `[["a"]]` | `"a"` | `true` |

---

<a id="palindrome-partitioning"></a>
## Problem 9 — Palindrome Partitioning

### Problem Statement
Given a string `s`, partition it so that every substring of the partition is a palindrome. Return all possible palindrome partitionings.

**Example:**
```
Input:  s = "aab"
Output: [["a","a","b"],["aa","b"]]
```

### Intuition
At each step, try every possible prefix `s[start..i]`. If it's a palindrome, add it to the current partition and recurse from `i+1`. The base case is when `start == s.length()` — we've consumed the full string.

### Why Check Palindrome at Each Step?
We **prune** non-palindrome prefixes immediately, which avoids exploring entire subtrees that can't yield valid partitions. This is backtracking's power over brute force.

### Java Code
```java
import java.util.*;

class PalindromePartitioning {
    public List<List<String>> partition(String s) {
        List<List<String>> result = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(String s, int start,
                           List<String> current,
                           List<List<String>> result) {
        if (start == s.length()) {
            result.add(new ArrayList<>(current));
            return;
        }

        for (int end = start + 1; end <= s.length(); end++) {
            String sub = s.substring(start, end);
            if (!isPalindrome(sub)) continue; // pruning

            current.add(sub);                    // choose
            backtrack(s, end, current, result);  // explore
            current.remove(current.size() - 1);  // un-choose
        }
    }

    private boolean isPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            if (s.charAt(l++) != s.charAt(r--)) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        PalindromePartitioning pp = new PalindromePartitioning();
        System.out.println(pp.partition("aab"));
        // [["a","a","b"],["aa","b"]]
        System.out.println(pp.partition("a"));
        // [["a"]]
        System.out.println(pp.partition("aba"));
        // [["a","b","a"],["aba"]]
    }
}
```

### Test Cases
| Input | Expected Output |
|-------|----------------|
| `"aab"` | `[["a","a","b"],["aa","b"]]` |
| `"a"` | `[["a"]]` |
| `"aba"` | `[["a","b","a"],["aba"]]` |
| `"aaa"` | `[["a","a","a"],["a","aa"],["aa","a"],["aaa"]]` |

---

<a id="sudoku-solver"></a>
## Problem 10 — Sudoku Solver

### Problem Statement
Write a program to solve a Sudoku puzzle by filling the empty cells (`'.'`). Each digit `1–9` must appear exactly once in each row, column, and 3×3 box.

**Example:**
```
Input:
  5 3 . | . 7 . | . . .
  6 . . | 1 9 5 | . . .
  . 9 8 | . . . | . 6 .
  ------+-------+------
  8 . . | . 6 . | . . 3
  4 . . | 8 . 3 | . . 1
  7 . . | . 2 . | . . 6
  ------+-------+------
  . 6 . | . . . | 2 8 .
  . . . | 4 1 9 | . . 5
  . . . | . 8 . | . 7 9
Output: (solved board)
```

### Intuition
Find the first empty cell. Try digits 1–9; if placing a digit doesn't violate any constraint, place it and recurse. If the recursive call returns `true`, we're done. Otherwise, remove the digit (backtrack) and try the next. If no digit works, return `false`.

### Why Backtracking Over Constraint Propagation?
Pure backtracking is simpler to implement and fast enough for 9×9. Validation is O(1) using three sets of bitmasks. The key pruning: don't place a digit that already appears in the same row, column, or 3×3 box.

### Java Code
```java
class SudokuSolver {
    public void solveSudoku(char[][] board) {
        solve(board);
    }

    private boolean solve(char[][] board) {
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] != '.') continue;

                for (char ch = '1'; ch <= '9'; ch++) {
                    if (isValid(board, r, c, ch)) {
                        board[r][c] = ch;              // choose
                        if (solve(board)) return true;  // explore
                        board[r][c] = '.';             // un-choose
                    }
                }
                return false; // no digit works — backtrack
            }
        }
        return true; // all cells filled
    }

    private boolean isValid(char[][] board, int row, int col, char ch) {
        for (int i = 0; i < 9; i++) {
            if (board[row][i] == ch) return false;     // row conflict
            if (board[i][col] == ch) return false;     // col conflict
            // 3x3 box conflict
            int boxRow = 3 * (row / 3) + i / 3;
            int boxCol = 3 * (col / 3) + i % 3;
            if (board[boxRow][boxCol] == ch) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        SudokuSolver ss = new SudokuSolver();
        char[][] board = {
            {'5','3','.','.','7','.','.','.','.'},
            {'6','.','.','1','9','5','.','.','.'},
            {'.','9','8','.','.','.','.','6','.'},
            {'8','.','.','.','6','.','.','.','3'},
            {'4','.','.','8','.','3','.','.','1'},
            {'7','.','.','.','2','.','.','.','6'},
            {'.','6','.','.','.','.','2','8','.'},
            {'.','.','.','4','1','9','.','.','5'},
            {'.','.','.','.','8','.','.','7','9'}
        };
        ss.solveSudoku(board);
        for (char[] row : board) System.out.println(new String(row));
        // 534678912 726195348 198342567
        // 859761423 426853791 713924856
        // 961537284 287419635 345286179
    }
}
```

### Test Cases
| Scenario | Expected |
|----------|----------|
| Classic puzzle (above) | Unique solved board |
| Already-solved board | Returns same board unchanged |
| Board with one empty cell | Fills one cell |

---

## Summary Table

| # | Problem | Key Insight | Time Complexity |
|---|---------|-------------|-----------------|
| 1 | Subsets | Every node in tree is a solution | O(2ⁿ · n) |
| 2 | Subsets II | Sort + skip same value at same depth | O(2ⁿ · n) |
| 3 | Permutations | `used[]` array, iterate from 0 | O(n! · n) |
| 4 | Permutations II | Sort + skip if prev same unused | O(n! · n) |
| 5 | Combination Sum | Allow reuse via `i` (not `i+1`) | O(2^(T/M) · n) |
| 6 | Combination Sum II | Sort + skip dup at same level + `i+1` | O(2ⁿ · n) |
| 7 | N-Queens | Track cols + both diagonals with sets | O(n! · n) |
| 8 | Word Search | In-place `#` marking, 4-dir DFS | O(m·n · 4^L) |
| 9 | Palindrome Partitioning | Prune non-palindrome prefixes | O(n · 2ⁿ) |
| 10 | Sudoku Solver | Fill empty cells, try 1–9, return false if stuck | O(9^m) |

---

## The Backtracking Mindset Cheat Sheet

```
1. Duplicates in input?          → Sort first
2. Avoid duplicate results?      → Skip same value at same depth (i > start && nums[i] == nums[i-1])
3. Reuse elements?               → Recurse with i (not i+1)
4. Permutation (order matters)?  → used[] array, iterate from 0
5. Combination (order doesn't)?  → start index, iterate from start
6. Need to mark visited in grid? → Modify in-place, restore after recursion
7. Early termination possible?   → Prune before recursing (if remaining < 0, break on sorted array)
```