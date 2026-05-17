# Recursion — 20 Problems That Cover 95% of the Pattern

> Master these 20 problems and you will have seen every major recursion archetype: linear recursion, tree recursion, backtracking, divide-and-conquer, memoised recursion, and mutual recursion.

---

## How to Think About Any Recursion Problem

1. **Trust the function** — assume it works correctly for a smaller input.
2. **Find the recurrence** — how does the answer for size `n` relate to the answer for size `n-1` (or `n/2`, or sub-trees)?
3. **Write the base case first** — the smallest input you can answer without a recursive call.
4. **Visualise the call tree** — this reveals time complexity instantly.

---

## Problem 1 — Factorial

### Problem Statement
Given a non-negative integer `n`, return `n!`.

### Intuition
`n! = n × (n-1)!`. The work at each level is O(1); you just multiply and return. Classic linear recursion — one call per level, depth = n.

### Why This Approach
There is a direct mathematical recurrence. No iteration needed; the call stack naturally accumulates the multiplications.

### Java Code
```java
public class Factorial {
    public static long factorial(int n) {
        // Base case: 0! = 1
        if (n == 0) return 1;
        // Recurrence: n! = n * (n-1)!
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        System.out.println(factorial(0));  // 1
        System.out.println(factorial(1));  // 1
        System.out.println(factorial(5));  // 120
        System.out.println(factorial(10)); // 3628800
    }
}
```

### Test Cases
| Input | Expected Output |
|-------|----------------|
| 0     | 1              |
| 1     | 1              |
| 5     | 120            |
| 10    | 3628800        |

**Time:** O(n) · **Space:** O(n) stack

---

## Problem 2 — Fibonacci Number

### Problem Statement
Return the `n`-th Fibonacci number where `F(0)=0`, `F(1)=1`, `F(n)=F(n-1)+F(n-2)`.

### Intuition
Each call branches into two sub-calls — this is **tree recursion**. Without memoisation the call tree has exponential nodes. Adding a memo array collapses overlapping sub-trees into O(n).

### Why This Approach
Teaches the most important lesson in recursion: **overlapping sub-problems → memoisation**. This is the gateway to dynamic programming.

### Java Code
```java
import java.util.HashMap;
import java.util.Map;

public class Fibonacci {
    private static Map<Integer, Long> memo = new HashMap<>();

    // Naive — exponential, for comparison
    public static long fibNaive(int n) {
        if (n <= 1) return n;
        return fibNaive(n - 1) + fibNaive(n - 2);
    }

    // Memoised — O(n)
    public static long fib(int n) {
        if (n <= 1) return n;
        if (memo.containsKey(n)) return memo.get(n);
        long result = fib(n - 1) + fib(n - 2);
        memo.put(n, result);
        return result;
    }

    public static void main(String[] args) {
        System.out.println(fib(0));  // 0
        System.out.println(fib(1));  // 1
        System.out.println(fib(6));  // 8
        System.out.println(fib(10)); // 55
        System.out.println(fib(50)); // 12586269025
    }
}
```

### Test Cases
| Input | Expected Output |
|-------|----------------|
| 0     | 0              |
| 1     | 1              |
| 6     | 8              |
| 10    | 55             |
| 50    | 12586269025    |

**Time:** O(n) memoised · **Space:** O(n)

---

## Problem 3 — Power Function (Fast Exponentiation)

### Problem Statement
Compute `x^n` for a double `x` and integer `n` (may be negative).

### Intuition
`x^n = x^(n/2) × x^(n/2)` if n is even, else `x × x^(n-1)`. Each call halves the problem → O(log n) depth instead of O(n).

### Why This Approach
This is **divide-and-conquer** recursion. The key insight is reusing the result of the half-power rather than computing it twice.

### Java Code
```java
public class Power {
    public static double myPow(double x, int n) {
        if (n == 0) return 1.0;
        // Handle negative exponent
        if (n < 0) return 1.0 / myPow(x, -(long) n);
        // Divide and conquer
        double half = myPow(x, n / 2);
        if (n % 2 == 0) return half * half;
        else             return half * half * x;
    }

    public static void main(String[] args) {
        System.out.println(myPow(2, 10));   // 1024.0
        System.out.println(myPow(2, -2));   // 0.25
        System.out.println(myPow(2.1, 3));  // ~9.261
        System.out.println(myPow(1, 0));    // 1.0
    }
}
```

### Test Cases
| x    | n  | Expected   |
|------|----|------------|
| 2    | 10 | 1024.0     |
| 2    | -2 | 0.25       |
| 2.1  | 3  | ≈9.261     |
| 1    | 0  | 1.0        |

**Time:** O(log n) · **Space:** O(log n)

---

## Problem 4 — Binary Search (Recursive)

### Problem Statement
Given a sorted array and a target, return the index of the target or -1.

### Intuition
Compare the middle element. If equal, done. Otherwise recurse into the left or right half. This is the textbook divide-and-conquer.

### Why This Approach
Demonstrates that recursion is not just about arithmetic sequences; it applies to **search spaces** too. Halving the space each call gives O(log n).

### Java Code
```java
public class BinarySearch {
    public static int search(int[] arr, int target, int lo, int hi) {
        if (lo > hi) return -1;                   // Base: not found
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;        // Base: found
        if (arr[mid] < target)
            return search(arr, target, mid + 1, hi);
        else
            return search(arr, target, lo, mid - 1);
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11};
        System.out.println(search(arr, 7, 0, arr.length - 1));  // 3
        System.out.println(search(arr, 6, 0, arr.length - 1));  // -1
        System.out.println(search(arr, 1, 0, arr.length - 1));  // 0
        System.out.println(search(arr, 11, 0, arr.length - 1)); // 5
    }
}
```

### Test Cases
| Array              | Target | Expected |
|--------------------|--------|----------|
| [1,3,5,7,9,11]     | 7      | 3        |
| [1,3,5,7,9,11]     | 6      | -1       |
| [1,3,5,7,9,11]     | 1      | 0        |
| [1,3,5,7,9,11]     | 11     | 5        |

**Time:** O(log n) · **Space:** O(log n)

---

## Problem 5 — Merge Sort

### Problem Statement
Sort an integer array using the merge sort algorithm.

### Intuition
Split the array in half, sort each half recursively, then merge the two sorted halves in O(n). The recurrence is `T(n) = 2T(n/2) + O(n)` → O(n log n).

### Why This Approach
Classic **divide, conquer, combine** pattern. The merge step is the "combine" — it cannot be done before both halves are sorted, so the recursion must complete first (post-order work).

### Java Code
```java
public class MergeSort {
    public static void mergeSort(int[] arr, int l, int r) {
        if (l >= r) return;                         // Base: single element
        int mid = l + (r - l) / 2;
        mergeSort(arr, l, mid);
        mergeSort(arr, mid + 1, r);
        merge(arr, l, mid, r);
    }

    private static void merge(int[] arr, int l, int mid, int r) {
        int n1 = mid - l + 1, n2 = r - mid;
        int[] left = new int[n1], right = new int[n2];
        System.arraycopy(arr, l, left, 0, n1);
        System.arraycopy(arr, mid + 1, right, 0, n2);
        int i = 0, j = 0, k = l;
        while (i < n1 && j < n2)
            arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];
        while (i < n1) arr[k++] = left[i++];
        while (j < n2) arr[k++] = right[j++];
    }

    public static void main(String[] args) {
        int[] a = {5, 2, 8, 1, 9, 3};
        mergeSort(a, 0, a.length - 1);
        // prints [1, 2, 3, 5, 8, 9]
        for (int x : a) System.out.print(x + " ");
    }
}
```

### Test Cases
| Input              | Expected Output    |
|--------------------|--------------------|
| [5,2,8,1,9,3]      | [1,2,3,5,8,9]      |
| [1]                | [1]                |
| [2,1]              | [1,2]              |
| []                 | []                 |

**Time:** O(n log n) · **Space:** O(n)

---

## Problem 6 — Tower of Hanoi

### Problem Statement
Move `n` disks from peg A to peg C using peg B as auxiliary. Print each move.

### Intuition
To move n disks: move the top n-1 to B (using C), move the largest to C, then move n-1 from B to C (using A). The recurrence is `T(n) = 2T(n-1) + 1` → O(2^n) moves.

### Why This Approach
The classic example showing that some problems *require* exponential time. Also teaches pre-order and post-order work within a single recursive function.

### Java Code
```java
public class TowerOfHanoi {
    public static void hanoi(int n, char from, char to, char aux) {
        if (n == 0) return;                              // Base case
        hanoi(n - 1, from, aux, to);                    // Move n-1 to aux
        System.out.println("Move disk " + n + ": " + from + " → " + to);
        hanoi(n - 1, aux, to, from);                    // Move n-1 to dest
    }

    public static void main(String[] args) {
        hanoi(3, 'A', 'C', 'B');
        // 7 moves for n=3
    }
}
```

### Test Cases
| n | Total Moves |
|---|-------------|
| 1 | 1           |
| 2 | 3           |
| 3 | 7           |
| 4 | 15          |

**Time:** O(2^n) · **Space:** O(n)

---

## Problem 7 — Generate All Subsets (Power Set)

### Problem Statement
Given an integer array with distinct elements, return all possible subsets.

### Intuition
At each index, make a binary choice: **include** the element or **exclude** it. This creates a binary tree of depth n with 2^n leaves — each leaf is one subset.

### Why This Approach
This is the **include/exclude** pattern, the foundation for most backtracking problems. Recognising it here makes subset-sum, combination-sum, and partitioning problems straightforward.

### Java Code
```java
import java.util.*;

public class PowerSet {
    public static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private static void backtrack(int[] nums, int idx,
                                  List<Integer> current,
                                  List<List<Integer>> result) {
        result.add(new ArrayList<>(current));          // Record current subset
        for (int i = idx; i < nums.length; i++) {
            current.add(nums[i]);                      // Include
            backtrack(nums, i + 1, current, result);
            current.remove(current.size() - 1);        // Exclude (backtrack)
        }
    }

    public static void main(String[] args) {
        System.out.println(subsets(new int[]{1, 2, 3}));
        // [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
    }
}
```

### Test Cases
| Input   | # of Subsets |
|---------|-------------|
| []      | 1 (just []) |
| [1]     | 2           |
| [1,2]   | 4           |
| [1,2,3] | 8           |

**Time:** O(2^n × n) · **Space:** O(n)

---

## Problem 8 — Permutations of a String/Array

### Problem Statement
Return all permutations of a given array of distinct integers.

### Intuition
Fix the first position with each possible element (via swap), then recursively permute the rest. At depth k, you choose among `n-k` options.

### Why This Approach
The **swap-recurse-swap** pattern for permutations is used in N-Queens, Sudoku solver, and many scheduling problems. Understanding it here unlocks a whole class of backtracking problems.

### Java Code
```java
import java.util.*;

public class Permutations {
    public static List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, result);
        return result;
    }

    private static void backtrack(int[] nums, int start,
                                  List<List<Integer>> result) {
        if (start == nums.length) {
            List<Integer> perm = new ArrayList<>();
            for (int x : nums) perm.add(x);
            result.add(perm);
            return;
        }
        for (int i = start; i < nums.length; i++) {
            swap(nums, start, i);
            backtrack(nums, start + 1, result);
            swap(nums, start, i);              // Restore
        }
    }

    private static void swap(int[] a, int i, int j) {
        int t = a[i]; a[i] = a[j]; a[j] = t;
    }

    public static void main(String[] args) {
        System.out.println(permute(new int[]{1, 2, 3}));
        // [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,2,1],[3,1,2]]
    }
}
```

### Test Cases
| Input   | # of Permutations |
|---------|------------------|
| [1]     | 1                |
| [1,2]   | 2                |
| [1,2,3] | 6                |
| [1..4]  | 24               |

**Time:** O(n! × n) · **Space:** O(n)

---

## Problem 9 — Combination Sum

### Problem Statement
Given an array of distinct positive integers `candidates` and a `target`, return all combinations that sum to `target`. Numbers may be reused.

### Intuition
At each step decide: use `candidates[i]` again (stay at i) or move to `candidates[i+1]`. This is **bounded include/exclude** with repetition allowed — a direct extension of the subset pattern.

### Why This Approach
One of the most frequently asked backtracking patterns. Mastering the "stay vs advance index" decision solves Combination Sum I, II, and III variants.

### Java Code
```java
import java.util.*;

public class CombinationSum {
    public static List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        Arrays.sort(candidates);
        backtrack(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }

    private static void backtrack(int[] cands, int remaining,
                                   int start, List<Integer> current,
                                   List<List<Integer>> result) {
        if (remaining == 0) { result.add(new ArrayList<>(current)); return; }
        for (int i = start; i < cands.length; i++) {
            if (cands[i] > remaining) break;    // Pruning
            current.add(cands[i]);
            backtrack(cands, remaining - cands[i], i, current, result); // i, not i+1
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        System.out.println(combinationSum(new int[]{2, 3, 6, 7}, 7));
        // [[2,2,3],[7]]
    }
}
```

### Test Cases
| Candidates  | Target | Expected            |
|-------------|--------|---------------------|
| [2,3,6,7]   | 7      | [[2,2,3],[7]]       |
| [2,3,5]     | 8      | [[2,2,2,2],[2,3,3],[3,5]] |
| [2]         | 1      | []                  |

**Time:** O(n^(T/M)) where T=target, M=min element · **Space:** O(T/M)

---

## Problem 10 — N-Queens

### Problem Statement
Place N queens on an N×N chessboard such that no two queens attack each other. Return all valid configurations.

### Intuition
Place one queen per row. For each row, try every column — if the placement is safe (no column/diagonal conflict), place and recurse to the next row. If stuck, backtrack.

### Why This Approach
The N-Queens problem is the canonical **constraint backtracking** problem. It introduces the concept of *pruning* the search tree using constraints, which is the heart of every backtracking solution.

### Java Code
```java
import java.util.*;

public class NQueens {
    public static List<List<String>> solveNQueens(int n) {
        List<List<String>> result = new ArrayList<>();
        int[] queens = new int[n];   // queens[row] = col
        Arrays.fill(queens, -1);
        backtrack(queens, n, 0, result,
                  new HashSet<>(), new HashSet<>(), new HashSet<>());
        return result;
    }

    private static void backtrack(int[] queens, int n, int row,
                                   List<List<String>> result,
                                   Set<Integer> cols,
                                   Set<Integer> diag1,   // row - col
                                   Set<Integer> diag2) { // row + col
        if (row == n) { result.add(buildBoard(queens, n)); return; }
        for (int col = 0; col < n; col++) {
            if (cols.contains(col) ||
                diag1.contains(row - col) ||
                diag2.contains(row + col)) continue;
            queens[row] = col;
            cols.add(col); diag1.add(row - col); diag2.add(row + col);
            backtrack(queens, n, row + 1, result, cols, diag1, diag2);
            cols.remove(col); diag1.remove(row - col); diag2.remove(row + col);
        }
    }

    private static List<String> buildBoard(int[] queens, int n) {
        List<String> board = new ArrayList<>();
        for (int row = 0; row < n; row++) {
            char[] line = new char[n];
            Arrays.fill(line, '.');
            line[queens[row]] = 'Q';
            board.add(new String(line));
        }
        return board;
    }

    public static void main(String[] args) {
        System.out.println(solveNQueens(4).size()); // 2
        System.out.println(solveNQueens(8).size()); // 92
    }
}
```

### Test Cases
| n | # Solutions |
|---|-------------|
| 1 | 1           |
| 4 | 2           |
| 8 | 92          |

**Time:** O(n!) · **Space:** O(n)

---

## Problem 11 — Word Search in Grid

### Problem Statement
Given a 2D board of characters and a word, return `true` if the word exists in the grid (constructed from sequentially adjacent cells; no cell reused).

### Intuition
DFS from every cell. At each step, try all 4 directions. Mark the cell as visited before recursing, unmark after — this is **backtracking on a grid**.

### Why This Approach
This is the most important grid backtracking pattern. It recurs in: number of islands, shortest path, maze solving, and Boggle. The visited-marking approach prevents revisiting without an extra array.

### Java Code
```java
public class WordSearch {
    private static final int[][] DIRS = {{0,1},{0,-1},{1,0},{-1,0}};

    public static boolean exist(char[][] board, String word) {
        int m = board.length, n = board[0].length;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (dfs(board, word, i, j, 0)) return true;
        return false;
    }

    private static boolean dfs(char[][] board, String word,
                                int r, int c, int idx) {
        if (idx == word.length()) return true;           // All chars matched
        if (r < 0 || r >= board.length ||
            c < 0 || c >= board[0].length ||
            board[r][c] != word.charAt(idx)) return false;

        char temp = board[r][c];
        board[r][c] = '#';                               // Mark visited
        for (int[] d : DIRS)
            if (dfs(board, word, r + d[0], c + d[1], idx + 1)) {
                board[r][c] = temp;
                return true;
            }
        board[r][c] = temp;                              // Restore
        return false;
    }

    public static void main(String[] args) {
        char[][] board = {
            {'A','B','C','E'},
            {'S','F','C','S'},
            {'A','D','E','E'}
        };
        System.out.println(exist(board, "ABCCED")); // true
        System.out.println(exist(board, "SEE"));    // true
        System.out.println(exist(board, "ABCB"));   // false
    }
}
```

### Test Cases
| Word    | Expected |
|---------|----------|
| ABCCED  | true     |
| SEE     | true     |
| ABCB    | false    |
| SFCS    | true     |

**Time:** O(m×n×4^L) · **Space:** O(L) where L=word length

---

## Problem 12 — Flatten Nested List (Recursive Structures)

### Problem Statement
Given a nested integer list (each element is an integer or a list), flatten it into a single-level list of integers.

### Intuition
If the element is an integer, add it. If it is a list, recurse into it. This is **structural recursion** — the recursion mirrors the shape of the data.

### Why This Approach
Many real-world problems (JSON parsing, directory traversal, AST evaluation) involve recursive data structures. Understanding structural recursion is essential.

### Java Code
```java
import java.util.*;

public class FlattenList {
    // Simulated nested structure
    static class NestedInteger {
        private Integer val;
        private List<NestedInteger> list;
        NestedInteger(int v) { this.val = v; }
        NestedInteger(List<NestedInteger> l) { this.list = l; }
        boolean isInteger() { return val != null; }
        int getInteger() { return val; }
        List<NestedInteger> getList() { return list; }
    }

    public static List<Integer> flatten(List<NestedInteger> nestedList) {
        List<Integer> result = new ArrayList<>();
        for (NestedInteger ni : nestedList) {
            if (ni.isInteger()) {
                result.add(ni.getInteger());
            } else {
                result.addAll(flatten(ni.getList())); // Recurse into sub-list
            }
        }
        return result;
    }

    public static void main(String[] args) {
        // Represents [[1,1],2,[1,1]]
        List<NestedInteger> input = Arrays.asList(
            new NestedInteger(Arrays.asList(
                new NestedInteger(1), new NestedInteger(1))),
            new NestedInteger(2),
            new NestedInteger(Arrays.asList(
                new NestedInteger(1), new NestedInteger(1)))
        );
        System.out.println(flatten(input)); // [1, 1, 2, 1, 1]
    }
}
```

### Test Cases
| Input           | Expected      |
|-----------------|---------------|
| [[1,1],2,[1,1]] | [1,1,2,1,1]  |
| [1,[4,[6]]]     | [1,4,6]      |
| []              | []           |

**Time:** O(n) total elements · **Space:** O(d) depth

---

## Problem 13 — Height of Binary Tree

### Problem Statement
Given the root of a binary tree, return its height (max depth).

### Intuition
`height(node) = 1 + max(height(left), height(right))`. Null nodes return 0 (or -1 for edge-based height). This is **post-order** recursion — compute children first, then combine.

### Why This Approach
Almost every binary tree problem is either pre-order, in-order, or post-order recursion on the left and right subtrees. Height is the simplest post-order problem and the template for: diameter, balanced check, LCA, and max path sum.

### Java Code
```java
public class TreeHeight {
    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    public static int height(TreeNode root) {
        if (root == null) return 0;                     // Base case
        int leftH  = height(root.left);
        int rightH = height(root.right);
        return 1 + Math.max(leftH, rightH);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left  = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        System.out.println(height(root)); // 3
        System.out.println(height(null)); // 0
    }
}
```

### Test Cases
| Tree Shape         | Expected Height |
|--------------------|----------------|
| null               | 0              |
| single node        | 1              |
| complete depth-2   | 2              |
| left-skewed (n=4)  | 4              |

**Time:** O(n) · **Space:** O(h) height

---

## Problem 14 — Diameter of Binary Tree

### Problem Statement
Return the length of the longest path between any two nodes (number of edges).

### Intuition
The diameter through a node = `height(left) + height(right)`. Compute height recursively; update a global max at each node. This is an **augmented post-order** — return one value (height) while tracking a side-effect (max diameter).

### Why This Approach
The trick of "return height but track diameter as a by-product" appears in: max path sum, vertical width, and many other tree problems. It avoids an O(n²) double traversal.

### Java Code
```java
public class TreeDiameter {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    private static int maxDiameter = 0;

    public static int diameterOfBinaryTree(TreeNode root) {
        maxDiameter = 0;
        depth(root);
        return maxDiameter;
    }

    private static int depth(TreeNode node) {
        if (node == null) return 0;
        int l = depth(node.left);
        int r = depth(node.right);
        maxDiameter = Math.max(maxDiameter, l + r); // Update diameter
        return 1 + Math.max(l, r);                  // Return height
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        System.out.println(diameterOfBinaryTree(root)); // 3
    }
}
```

### Test Cases
| Tree               | Expected |
|--------------------|----------|
| [1,2,3,4,5]        | 3        |
| [1,2]              | 1        |
| single node        | 0        |

**Time:** O(n) · **Space:** O(h)

---

## Problem 15 — Validate Binary Search Tree

### Problem Statement
Given a binary tree, determine if it is a valid BST.

### Intuition
Pass down a valid range `(min, max)` to each node. A node is valid if `min < node.val < max`. Left subtree: max becomes current value. Right subtree: min becomes current value.

### Why This Approach
Demonstrates **parameter-passing recursion** — the function's parameters carry context downward (what range is currently valid). This pattern also solves: find k-th smallest in BST, BST from sorted array, and BST range queries.

### Java Code
```java
public class ValidBST {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    public static boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private static boolean validate(TreeNode node, long min, long max) {
        if (node == null) return true;
        if (node.val <= min || node.val >= max) return false;
        return validate(node.left,  min,       node.val) &&
               validate(node.right, node.val, max);
    }

    public static void main(String[] args) {
        TreeNode valid = new TreeNode(2);
        valid.left = new TreeNode(1); valid.right = new TreeNode(3);
        System.out.println(isValidBST(valid));  // true

        TreeNode invalid = new TreeNode(5);
        invalid.left = new TreeNode(1);
        invalid.right = new TreeNode(4);
        invalid.right.left = new TreeNode(3);
        invalid.right.right = new TreeNode(6);
        System.out.println(isValidBST(invalid)); // false
    }
}
```

### Test Cases
| Tree Structure          | Expected |
|-------------------------|----------|
| [2,1,3]                 | true     |
| [5,1,4,null,null,3,6]   | false    |
| single node             | true     |
| [2,2,2]                 | false    |

**Time:** O(n) · **Space:** O(h)

---

## Problem 16 — Lowest Common Ancestor (LCA)

### Problem Statement
Given a binary tree and two nodes `p` and `q`, find their lowest common ancestor.

### Intuition
If the current node is `null`, `p`, or `q`, return it. Recurse left and right. If both sides return non-null, current node is the LCA. Otherwise, return whichever side found something.

### Why This Approach
LCA is a **post-order aggregation** problem. The elegant 4-line recursion that bubbles up results from sub-trees is a powerful pattern for: delete nodes in BST, distance between nodes, and many interview problems.

### Java Code
```java
public class LCA {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    public static TreeNode lowestCommonAncestor(TreeNode root,
                                                 TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left  = lowestCommonAncestor(root.left,  p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root; // LCA found
        return (left != null) ? left : right;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(5);   root.right = new TreeNode(1);
        root.left.left  = new TreeNode(6);
        root.left.right = new TreeNode(2);
        root.right.left = new TreeNode(0);
        root.right.right = new TreeNode(8);
        TreeNode lca = lowestCommonAncestor(root, root.left, root.right);
        System.out.println(lca.val); // 3
        lca = lowestCommonAncestor(root, root.left, root.left.right);
        System.out.println(lca.val); // 5
    }
}
```

### Test Cases
| p | q | LCA |
|---|---|-----|
| 5 | 1 | 3   |
| 5 | 2 | 5   |
| 6 | 8 | 3   |

**Time:** O(n) · **Space:** O(h)

---

## Problem 17 — Decode Ways

### Problem Statement
A string of digits can be decoded as letters (A=1 … Z=26). Count the number of ways to decode it.

### Intuition
At each position, you can decode one digit (if valid 1-9) or two digits (if valid 10-26). `f(i) = f(i+1) [one-digit] + f(i+2) [two-digit]`. Memoising avoids recomputation.

### Why This Approach
This is **linear memoised recursion** — the same structure as Fibonacci but with conditional branching. It directly translates to a bottom-up DP table, teaching the recursion→DP transformation.

### Java Code
```java
import java.util.*;

public class DecodeWays {
    public static int numDecodings(String s) {
        int[] memo = new int[s.length() + 1];
        Arrays.fill(memo, -1);
        return decode(s, 0, memo);
    }

    private static int decode(String s, int idx, int[] memo) {
        if (idx == s.length()) return 1;          // Decoded successfully
        if (s.charAt(idx) == '0') return 0;       // Leading zero — invalid
        if (memo[idx] != -1) return memo[idx];

        int ways = decode(s, idx + 1, memo);      // Use one digit

        if (idx + 1 < s.length()) {
            int twoDigit = Integer.parseInt(s.substring(idx, idx + 2));
            if (twoDigit <= 26)
                ways += decode(s, idx + 2, memo); // Use two digits
        }
        return memo[idx] = ways;
    }

    public static void main(String[] args) {
        System.out.println(numDecodings("12"));   // 2  ("AB" or "L")
        System.out.println(numDecodings("226"));  // 3
        System.out.println(numDecodings("06"));   // 0
        System.out.println(numDecodings("11106")); // 2
    }
}
```

### Test Cases
| Input   | Expected |
|---------|----------|
| "12"    | 2        |
| "226"   | 3        |
| "06"    | 0        |
| "11106" | 2        |

**Time:** O(n) · **Space:** O(n)

---

## Problem 18 — Letter Combinations of a Phone Number

### Problem Statement
Given a string of digits 2-9, return all possible letter combinations (T9 phone keyboard).

### Intuition
At each digit, iterate over its mapped letters, append one, and recurse to the next digit. When the current string's length equals the input's length, record the answer. This is **tree recursion with branching factor 3-4**.

### Why This Approach
This is a fundamental backtracking template — "choose one option from a set, recurse, backtrack". It directly applies to: generate parentheses, IP addresses, expression add operators, and more.

### Java Code
```java
import java.util.*;

public class PhoneCombinations {
    private static final String[] MAP = {
        "", "", "abc", "def", "ghi", "jkl",
        "mno", "pqrs", "tuv", "wxyz"
    };

    public static List<String> letterCombinations(String digits) {
        List<String> result = new ArrayList<>();
        if (digits.isEmpty()) return result;
        backtrack(digits, 0, new StringBuilder(), result);
        return result;
    }

    private static void backtrack(String digits, int idx,
                                   StringBuilder current,
                                   List<String> result) {
        if (idx == digits.length()) {
            result.add(current.toString());
            return;
        }
        String letters = MAP[digits.charAt(idx) - '0'];
        for (char ch : letters.toCharArray()) {
            current.append(ch);
            backtrack(digits, idx + 1, current, result);
            current.deleteCharAt(current.length() - 1);  // Backtrack
        }
    }

    public static void main(String[] args) {
        System.out.println(letterCombinations("23"));
        // [ad, ae, af, bd, be, bf, cd, ce, cf]
        System.out.println(letterCombinations(""));   // []
    }
}
```

### Test Cases
| Input | # Combinations |
|-------|----------------|
| ""    | 0              |
| "2"   | 3              |
| "23"  | 9              |
| "234" | 27             |

**Time:** O(4^n × n) · **Space:** O(n)

---

## Problem 19 — Regular Expression Matching

### Problem Statement
Implement regex matching with `.` (any char) and `*` (zero or more of preceding).

### Intuition
`match(s, p)`:
- If pattern is empty → return `s.empty()`
- Check if first chars match: `firstMatch = s[0]==p[0] || p[0]=='.'`
- If `p[1]=='*'`: try zero occurrences `match(s, p[2:])` OR one occurrence `firstMatch && match(s[1:], p)`
- Else: `firstMatch && match(s[1:], p[1:])`

### Why This Approach
This is **top-down DP via memoised recursion** on two indices simultaneously. It demonstrates 2D memoisation and models the most complex string recursion asked in interviews.

### Java Code
```java
import java.util.*;

public class RegexMatch {
    private static Map<String, Boolean> memo = new HashMap<>();

    public static boolean isMatch(String s, String p) {
        memo.clear();
        return dp(s, p, 0, 0);
    }

    private static boolean dp(String s, String p, int i, int j) {
        String key = i + "," + j;
        if (memo.containsKey(key)) return memo.get(key);

        boolean result;
        if (j == p.length()) {
            result = (i == s.length());
        } else {
            boolean firstMatch = i < s.length() &&
                                 (p.charAt(j) == s.charAt(i) ||
                                  p.charAt(j) == '.');
            if (j + 1 < p.length() && p.charAt(j + 1) == '*') {
                // Zero occurrences OR one occurrence and advance s
                result = dp(s, p, i, j + 2) ||
                         (firstMatch && dp(s, p, i + 1, j));
            } else {
                result = firstMatch && dp(s, p, i + 1, j + 1);
            }
        }
        memo.put(key, result);
        return result;
    }

    public static void main(String[] args) {
        System.out.println(isMatch("aa",  "a"));    // false
        System.out.println(isMatch("aa",  "a*"));   // true
        System.out.println(isMatch("ab",  ".*"));   // true
        System.out.println(isMatch("aab", "c*a*b")); // true
    }
}
```

### Test Cases
| s     | p      | Expected |
|-------|--------|----------|
| "aa"  | "a"    | false    |
| "aa"  | "a*"   | true     |
| "ab"  | ".*"   | true     |
| "aab" | "c*a*b"| true     |

**Time:** O(|s|×|p|) · **Space:** O(|s|×|p|)

---

## Problem 20 — Sudoku Solver

### Problem Statement
Solve a 9×9 Sudoku puzzle by filling in empty cells (`.`).

### Intuition
Find the next empty cell. Try digits 1-9; if placing a digit is valid (no conflict in row, column, 3×3 box), place it and recurse. If recursion returns true, puzzle is solved. Otherwise, backtrack (remove the digit and try the next).

### Why This Approach
Sudoku solver is the **hardest standard backtracking** problem, combining all concepts: constraint propagation, pruning, and recursive search. Mastering it means you can solve any constraint satisfaction problem (CSP) asked in an interview.

### Java Code
```java
public class SudokuSolver {
    public static void solveSudoku(char[][] board) {
        solve(board);
    }

    private static boolean solve(char[][] board) {
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] != '.') continue;
                for (char d = '1'; d <= '9'; d++) {
                    if (isValid(board, r, c, d)) {
                        board[r][c] = d;
                        if (solve(board)) return true;
                        board[r][c] = '.';              // Backtrack
                    }
                }
                return false;                           // No valid digit
            }
        }
        return true;                                    // All cells filled
    }

    private static boolean isValid(char[][] b, int row, int col, char d) {
        for (int i = 0; i < 9; i++) {
            if (b[row][i] == d) return false;            // Row conflict
            if (b[i][col] == d) return false;            // Col conflict
            if (b[3*(row/3) + i/3][3*(col/3) + i%3] == d)
                return false;                            // Box conflict
        }
        return true;
    }

    public static void main(String[] args) {
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
        solveSudoku(board);
        for (char[] row : board) System.out.println(new String(row));
        // Prints the solved board
    }
}
```

### Test Cases
The above standard board has exactly one solution. Any valid 9×9 Sudoku puzzle with a unique solution is accepted input.

**Time:** O(9^m) where m = empty cells · **Space:** O(m)

---

## Summary Table

| # | Problem               | Pattern                        | Time       |
|---|-----------------------|--------------------------------|------------|
| 1 | Factorial             | Linear recursion               | O(n)       |
| 2 | Fibonacci             | Tree recursion + memoisation   | O(n)       |
| 3 | Fast Power            | Divide and conquer             | O(log n)   |
| 4 | Binary Search         | Divide and conquer             | O(log n)   |
| 5 | Merge Sort            | Divide, conquer, combine       | O(n log n) |
| 6 | Tower of Hanoi        | Multi-branch recursion         | O(2^n)     |
| 7 | Power Set             | Include / Exclude              | O(2^n · n) |
| 8 | Permutations          | Swap-recurse-swap              | O(n! · n)  |
| 9 | Combination Sum       | Bounded include/exclude        | O(n^(T/M)) |
|10 | N-Queens              | Constraint backtracking        | O(n!)      |
|11 | Word Search           | Grid DFS + backtracking        | O(mn·4^L)  |
|12 | Flatten Nested List   | Structural recursion           | O(n)       |
|13 | Binary Tree Height    | Post-order tree recursion      | O(n)       |
|14 | Tree Diameter         | Augmented post-order           | O(n)       |
|15 | Validate BST          | Parameter-passing recursion    | O(n)       |
|16 | LCA                   | Post-order aggregation         | O(n)       |
|17 | Decode Ways           | Linear memoised recursion      | O(n)       |
|18 | Phone Combinations    | Choice-recurse-backtrack       | O(4^n · n) |
|19 | Regex Matching        | 2D memoised recursion          | O(sp)      |
|20 | Sudoku Solver         | Constraint satisfaction        | O(9^m)     |

---

## The 5 Universal Recursion Templates

### 1. Linear (one sub-call)
```java
T solve(input) {
    if (base_case) return base_value;
    return combine(input, solve(smaller_input));
}
```

### 2. Divide and Conquer (two sub-calls, non-overlapping)
```java
T solve(input, l, r) {
    if (l == r) return base;
    int mid = l + (r - l) / 2;
    T left  = solve(input, l, mid);
    T right = solve(input, mid+1, r);
    return merge(left, right);
}
```

### 3. Tree Recursion (memoised)
```java
Map<Input, T> memo;
T solve(input) {
    if (base_case) return base_value;
    if (memo.containsKey(input)) return memo.get(input);
    T result = combine(solve(sub1(input)), solve(sub2(input)));
    memo.put(input, result);
    return result;
}
```

### 4. Backtracking
```java
void backtrack(state, choices) {
    if (goal_reached) { record(state); return; }
    for (choice : choices) {
        if (is_valid(choice)) {
            make(choice);
            backtrack(new_state, remaining_choices);
            undo(choice);   // ← This line is the soul of backtracking
        }
    }
}
```

### 5. Tree / Graph DFS
```java
T dfs(node) {
    if (node == null) return base;
    T left  = dfs(node.left);
    T right = dfs(node.right);
    return aggregate(node.val, left, right);
}
```