# Trees — 15 Problems Covering 95% of Interview Patterns

---

## How to Use This Guide

Each problem follows this structure:
- **Problem Statement** — clear description with constraints
- **Intuition** — what to *see* before coding
- **Approach** — why this technique, step-by-step
- **Java Code** — clean, interview-ready
- **Test Cases** — edge cases that trip people up

Patterns covered: DFS, BFS, recursion, diameter, LCA, serialization, BST, path sum, Morris traversal, views, construction, Fenwick Tree.

---

## Table of Contents

| # | Problem | Difficulty | Jump to Solution |
|---|---------|:----------:|-----------------|
| 1 | Binary Tree Maximum Path Sum | 🔴 Hard | [→ #1](#binary-tree-maximum-path-sum) |
| 2 | Diameter of Binary Tree | 🟢 Easy | [→ #2](#diameter-of-binary-tree) |
| 3 | Lowest Common Ancestor (LCA) of a Binary Tree | 🟡 Medium | [→ #3](#lowest-common-ancestor-lca-of-a-binary-tree) |
| 4 | Binary Tree Level Order Traversal | 🟡 Medium | [→ #4](#binary-tree-level-order-traversal) |
| 5 | Serialize and Deserialize Binary Tree | 🔴 Hard | [→ #5](#serialize-and-deserialize-binary-tree) |
| 6 | Validate Binary Search Tree | 🟡 Medium | [→ #6](#validate-binary-search-tree) |
| 7 | Binary Tree Right Side View | 🟡 Medium | [→ #7](#binary-tree-right-side-view) |
| 8 | Construct Binary Tree from Preorder and Inorder Traversal | 🟡 Medium | [→ #8](#construct-binary-tree-from-preorder-and-inorder-traversal) |
| 9 | Kth Smallest Element in a BST | 🟡 Medium | [→ #9](#kth-smallest-element-in-a-bst) |
| 10 | Flatten Binary Tree to Linked List | 🟡 Medium | [→ #10](#flatten-binary-tree-to-linked-list) |
| 11 | Path Sum II (All Root-to-Leaf Paths with Target Sum) | 🟡 Medium | [→ #11](#path-sum-ii-all-root-to-leaf-paths-with-target-sum) |
| 12 | Morris Inorder Traversal (O(1) Space) | 🟡 Medium | [→ #12](#morris-inorder-traversal-o1-space) |
| 13 | Count Good Nodes in a Binary Tree | 🟡 Medium | [→ #13](#count-good-nodes-in-a-binary-tree) |
| 14 | Fenwick Tree (Binary Indexed Tree) — Range Sum Queries | 🟡 Medium | [→ #14](#fenwick-tree-binary-indexed-tree--range-sum-queries) |
| 15 | Fenwick Tree — Count of Smaller Numbers After Self | 🔴 Hard | [→ #15](#fenwick-tree--count-of-smaller-numbers-after-self) |

---

<a id="binary-tree-maximum-path-sum"></a>
## Problem 1 — Binary Tree Maximum Path Sum

### Problem Statement
Given a binary tree, find the maximum path sum. A path is any sequence of nodes where each pair of adjacent nodes has an edge. The path does not need to pass through the root. A node can only appear once.

```
Input:
        -10
       /    \
      9      20
            /  \
           15    7
Output: 42  (15 → 20 → 7)
```
Constraints: Node values can be negative. −10⁴ ≤ val ≤ 10⁴.

### Intuition
At every node you face a choice:
1. Use the node alone.
2. Extend from left child through this node.
3. Extend from right child through this node.
4. Use both children through this node (this forms a "arch" — valid as a path but cannot be extended further up).

The trick: what you *report to the parent* is always a single arm (node + best one child), but what you *record as answer* can be the arch.

### Why This Approach
A global variable tracks the best complete path seen so far. Each recursive call returns the best *extendable* arm. This separates "what I report up" from "what I record as answer" — the key insight for all path problems.

### Java Code
```java
class Solution {
    int maxSum = Integer.MIN_VALUE;

    public int maxPathSum(TreeNode root) {
        dfs(root);
        return maxSum;
    }

    // Returns max gain extendable to parent
    private int dfs(TreeNode node) {
        if (node == null) return 0;

        // Ignore negative contributions
        int left  = Math.max(dfs(node.left),  0);
        int right = Math.max(dfs(node.right), 0);

        // Path through this node (arch) — update global answer
        maxSum = Math.max(maxSum, node.val + left + right);

        // Return the best single arm to parent
        return node.val + Math.max(left, right);
    }
}
```

### Test Cases
| Input Tree | Expected Output |
|---|---|
| `[1, 2, 3]` | 6 |
| `[-3]` | -3 (single node, can't avoid it) |
| `[-10, 9, 20, null, null, 15, 7]` | 42 |
| `[2, -1, -2]` | 2 (just root) |

---

<a id="diameter-of-binary-tree"></a>
## Problem 2 — Diameter of Binary Tree

### Problem Statement
Given the root of a binary tree, return the length of the diameter — the longest path between any two nodes. The path may or may not pass through the root.

```
Input:
      1
     / \
    2   3
   / \
  4   5
Output: 3  (path: 4→2→1→3 or 4→2→5)
```

### Intuition
Diameter at any node = height(left subtree) + height(right subtree). Since the widest path may not pass through the root, compute this at every node and track the global maximum — exactly like Problem 1 but counting edges instead of summing values.

### Why DFS + Global Variable
A single post-order DFS computes heights bottom-up. At each node, the diameter *through* that node is immediately available. O(n) time, O(h) space.

### Java Code
```java
class Solution {
    int diameter = 0;

    public int diameterOfBinaryTree(TreeNode root) {
        height(root);
        return diameter;
    }

    private int height(TreeNode node) {
        if (node == null) return 0;
        int left  = height(node.left);
        int right = height(node.right);
        diameter  = Math.max(diameter, left + right); // edges through this node
        return 1 + Math.max(left, right);             // height reported to parent
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| `[1, 2, 3, 4, 5]` | 3 |
| `[1, 2]` | 1 |
| Single node `[1]` | 0 |
| Skewed tree 1→2→3→4→5 | 4 |

---

<a id="lowest-common-ancestor-lca-of-a-binary-tree"></a>
## Problem 3 — Lowest Common Ancestor (LCA) of a Binary Tree

### Problem Statement
Given a binary tree and two nodes `p` and `q`, find their lowest common ancestor (LCA) — the deepest node that has both `p` and `q` as descendants (a node is a descendant of itself).

```
Input: root = [3,5,1,6,2,0,8,null,null,7,4], p=5, q=1
Output: 3

Input: same tree, p=5, q=4
Output: 5
```

### Intuition
Post-order DFS: ask left subtree "do you have p or q?", ask right subtree same. If both return non-null, the current node is the LCA. If only one side returns non-null, bubble that result up.

### Why Post-order
We need to gather information from children before deciding at the current node. Post-order naturally expresses "compute children first, then decide."

### Java Code
```java
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;

        TreeNode left  = lowestCommonAncestor(root.left,  p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);

        // Both sides found something → this node is LCA
        if (left != null && right != null) return root;

        // Bubble up whichever side found something
        return left != null ? left : right;
    }
}
```

### Test Cases
| Tree | p | q | Expected |
|---|---|---|---|
| `[3,5,1,6,2,0,8]` | 5 | 1 | 3 |
| `[3,5,1,6,2,0,8]` | 5 | 4 | 5 |
| Two-node tree `[1,2]` | 1 | 2 | 1 |
| p == q | 5 | 5 | 5 |

---

<a id="binary-tree-level-order-traversal"></a>
## Problem 4 — Binary Tree Level Order Traversal

### Problem Statement
Given the root of a binary tree, return the node values level by level (left to right) as a list of lists.

```
Input:
    3
   / \
  9  20
    /  \
   15   7
Output: [[3], [9,20], [15,7]]
```

### Intuition
BFS naturally processes nodes level by level. The key trick: before expanding a level, snapshot `queue.size()` — that's exactly how many nodes belong to the current level.

### Why BFS with Size Snapshot
Without snapshotting the size, you can't tell where one level ends and the next begins. Snapshotting at the start of each while-loop iteration cleanly separates levels.

### Java Code
```java
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int size = queue.size(); // snapshot current level count
            List<Integer> level = new ArrayList<>();

            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left  != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(level);
        }
        return result;
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| `[3,9,20,null,null,15,7]` | `[[3],[9,20],[15,7]]` |
| Single node `[1]` | `[[1]]` |
| null | `[]` |
| Skewed left tree | One node per list |

---

<a id="serialize-and-deserialize-binary-tree"></a>
## Problem 5 — Serialize and Deserialize Binary Tree

### Problem Statement
Design an algorithm to serialize a binary tree to a string and deserialize that string back to the tree. There is no restriction on your format.

### Intuition
Pre-order DFS with null markers. When serializing, write each node's value; write `"#"` for nulls. For deserialization, consume the pre-order sequence character-by-character — the structure rebuilds itself because pre-order uniquely determines the tree when nulls are recorded.

### Why Pre-order with Null Markers
In-order alone is ambiguous. Pre-order with explicit nulls is unambiguous and mirrors the recursive call structure perfectly, making deserialization a clean recursive consumer.

### Java Code
```java
public class Codec {

    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        serDFS(root, sb);
        return sb.toString();
    }

    private void serDFS(TreeNode node, StringBuilder sb) {
        if (node == null) { sb.append("#,"); return; }
        sb.append(node.val).append(",");
        serDFS(node.left,  sb);
        serDFS(node.right, sb);
    }

    public TreeNode deserialize(String data) {
        Queue<String> tokens = new LinkedList<>(Arrays.asList(data.split(",")));
        return desDFS(tokens);
    }

    private TreeNode desDFS(Queue<String> tokens) {
        String token = tokens.poll();
        if ("#".equals(token)) return null;
        TreeNode node = new TreeNode(Integer.parseInt(token));
        node.left  = desDFS(tokens);
        node.right = desDFS(tokens);
        return node;
    }
}
```

### Test Cases
| Original Tree | Serialized (example) | Roundtrip Valid? |
|---|---|---|
| `[1,2,3,null,null,4,5]` | `1,2,#,#,3,4,#,#,5,#,#,` | ✓ |
| `[]` | `#,` | ✓ |
| Single node | `1,#,#,` | ✓ |
| Full binary tree | deterministic | ✓ |

---

<a id="validate-binary-search-tree"></a>
## Problem 6 — Validate Binary Search Tree

### Problem Statement
Given the root of a binary tree, determine if it is a valid BST. A valid BST: left subtree has only nodes with values **strictly less than** root; right subtree has only nodes with values **strictly greater than** root; both subtrees are also valid BSTs.

```
Input: [2,1,3] → true
Input: [5,1,4,null,null,3,6] → false (4 is in right subtree of 5 but 3 < 5)
```

### Intuition
The classic mistake: only checking the immediate children. The correct approach passes *valid range bounds* [min, max] down the recursion. Every node must satisfy `min < node.val < max`.

### Why Range Bounds
A node deep in the right subtree must be greater than ALL ancestors, not just its immediate parent. Passing bounds propagates the full constraint.

### Java Code
```java
class Solution {
    public boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean validate(TreeNode node, long min, long max) {
        if (node == null) return true;
        if (node.val <= min || node.val >= max) return false;
        return validate(node.left,  min,      node.val)
            && validate(node.right, node.val, max);
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| `[2,1,3]` | true |
| `[5,1,4,null,null,3,6]` | false |
| `[Integer.MAX_VALUE]` | true (use Long bounds!) |
| `[2,2,2]` | false (equal values not allowed) |

---

<a id="binary-tree-right-side-view"></a>
## Problem 7 — Binary Tree Right Side View

### Problem Statement
Given a binary tree, imagine yourself standing on the right side. Return the values of the nodes you can see, ordered from top to bottom.

```
Input:
    1
   / \
  2   3
   \   \
    5   4
Output: [1, 3, 4]
```

### Intuition
The rightmost node at each level is visible. BFS level-order: after processing each level, record the last node polled (or added). Alternatively, DFS with right-before-left: the first node visited at each depth is the rightmost.

### Why BFS is Cleaner Here
BFS naturally groups nodes by level; picking the last node per level is trivial.

### Java Code
```java
class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                if (i == size - 1) result.add(node.val); // last in level
                if (node.left  != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
        }
        return result;
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| `[1,2,3,null,5,null,4]` | `[1,3,4]` |
| `[1,2,3,4]` | `[1,3,4]` |
| Single node | `[1]` |
| Left-only tree 1→2→3 | `[1,2,3]` |

---

<a id="construct-binary-tree-from-preorder-and-inorder-traversal"></a>
## Problem 8 — Construct Binary Tree from Preorder and Inorder Traversal

### Problem Statement
Given `preorder` and `inorder` traversal arrays of a binary tree with unique values, construct and return the binary tree.

```
preorder = [3,9,20,15,7]
inorder  = [9,3,15,20,7]
Output:
    3
   / \
  9  20
    /  \
   15   7
```

### Intuition
Preorder's first element is always the root. Find that root in inorder — everything to its left is the left subtree, everything to its right is the right subtree. Recurse with the corresponding sub-arrays.

### Why HashMap for Inorder Index
Linear searching for the root in inorder at every step gives O(n²). A HashMap gives O(1) lookup, reducing total time to O(n).

### Java Code
```java
class Solution {
    Map<Integer, Integer> inorderIndex = new HashMap<>();
    int preIdx = 0;

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++)
            inorderIndex.put(inorder[i], i);
        return build(preorder, 0, inorder.length - 1);
    }

    private TreeNode build(int[] preorder, int left, int right) {
        if (left > right) return null;

        int rootVal = preorder[preIdx++];
        TreeNode root = new TreeNode(rootVal);
        int mid = inorderIndex.get(rootVal);

        root.left  = build(preorder, left,    mid - 1);
        root.right = build(preorder, mid + 1, right);
        return root;
    }
}
```

### Test Cases
| preorder | inorder | Expected Tree |
|---|---|---|
| `[3,9,20,15,7]` | `[9,3,15,20,7]` | Standard example |
| `[1]` | `[1]` | Single node |
| `[-1]` | `[-1]` | Negative value |
| `[1,2]` | `[2,1]` | Root with left child only |

---

<a id="kth-smallest-element-in-a-bst"></a>
## Problem 9 — Kth Smallest Element in a BST

### Problem Statement
Given the root of a BST and an integer `k`, return the `k`th smallest value among all node values.

```
Input: root = [3,1,4,null,2], k = 1
Output: 1
```

### Intuition
In-order traversal of a BST visits nodes in ascending sorted order. The k-th node visited in-order is the k-th smallest. Stop early once k reaches 0.

### Why In-order Is Perfect
BST in-order = sorted array. No need to materialize the entire sorted array — decrement a counter and return as soon as it hits zero.

### Java Code
```java
class Solution {
    int count = 0, result = 0;

    public int kthSmallest(TreeNode root, int k) {
        count = k;
        inorder(root);
        return result;
    }

    private void inorder(TreeNode node) {
        if (node == null || count < 0) return;
        inorder(node.left);
        if (--count == 0) { result = node.val; return; }
        inorder(node.right);
    }
}
```

### Test Cases
| Tree | k | Expected |
|---|---|---|
| `[3,1,4,null,2]` | 1 | 1 |
| `[5,3,6,2,4]` | 3 | 4 |
| Single node `[1]` | 1 | 1 |
| `[5,3,6,2,4]` | 5 | 6 |

---

<a id="flatten-binary-tree-to-linked-list"></a>
## Problem 10 — Flatten Binary Tree to Linked List

### Problem Statement
Given the root of a binary tree, flatten the tree into a "linked list" in-place using the same `TreeNode` class. The linked list follows pre-order traversal order, with all `left` pointers set to null.

```
Input:
    1
   / \
  2   5
 / \   \
3   4   6
Output: 1→2→3→4→5→6 (as right pointers)
```

### Intuition
Process right-to-left in pre-order (reverse pre-order: right, left, root). Maintain a `prev` pointer. At each node, set `node.right = prev`, `node.left = null`, then update `prev = node`. This weaves the list from tail to head without needing extra space.

### Why Reverse Pre-order
Going right→left→root means when we set `node.right = prev`, prev is already the correctly flattened tail of the right subtree.

### Java Code
```java
class Solution {
    TreeNode prev = null;

    public void flatten(TreeNode root) {
        if (root == null) return;
        flatten(root.right);
        flatten(root.left);
        root.right = prev;
        root.left  = null;
        prev = root;
    }
}
```

### Test Cases
| Input | Expected linked list order |
|---|---|
| `[1,2,5,3,4,null,6]` | 1→2→3→4→5→6 |
| `[]` | `[]` |
| `[0]` | `[0]` |
| Skewed right tree | unchanged structure |

---

<a id="path-sum-ii-all-root-to-leaf-paths-with-target-sum"></a>
## Problem 11 — Path Sum II (All Root-to-Leaf Paths with Target Sum)

### Problem Statement
Given a binary tree and a target sum, return all root-to-leaf paths where the sum equals `targetSum`.

```
Input: root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22
Output: [[5,4,11,2],[5,8,4,5]]
```

### Intuition
Backtracking DFS. Carry the current path and remaining sum. On reaching a leaf, check if remaining == 0. Add a *copy* of the path to results (important!), then backtrack by removing the last element.

### Why Backtracking
We explore all paths but share one mutable list, undoing additions when we retreat. This is O(n) space for the path vs O(n·L) if we copy at every step.

### Java Code
```java
class Solution {
    List<List<Integer>> result = new ArrayList<>();

    public List<List<Integer>> pathSum(TreeNode root, int targetSum) {
        dfs(root, targetSum, new ArrayList<>());
        return result;
    }

    private void dfs(TreeNode node, int remaining, List<Integer> path) {
        if (node == null) return;

        path.add(node.val);
        remaining -= node.val;

        if (node.left == null && node.right == null && remaining == 0)
            result.add(new ArrayList<>(path)); // copy!
        else {
            dfs(node.left,  remaining, path);
            dfs(node.right, remaining, path);
        }

        path.remove(path.size() - 1); // backtrack
    }
}
```

### Test Cases
| Tree | targetSum | Expected |
|---|---|---|
| `[5,4,8,11,null,13,4,7,2,null,null,5,1]` | 22 | `[[5,4,11,2],[5,8,4,5]]` |
| `[1,2,3]` | 5 | `[]` |
| `[1,2]` | 1 | `[]` (no leaf path sums to 1) |
| Single node `[1]` | 1 | `[[1]]` |

---

<a id="morris-inorder-traversal-o1-space"></a>
## Problem 12 — Morris Inorder Traversal (O(1) Space)

### Problem Statement
Perform an in-order traversal of a binary tree using O(1) extra space (no recursion stack, no explicit stack). Return values in sorted order for a BST.

### Intuition
Morris traversal uses the *right pointers of predecessor nodes* as temporary back-links (threads). For each node:
- If no left child: visit node, go right.
- If left child: find in-order predecessor (rightmost of left subtree). If predecessor's right is null → thread it to current node, go left. If predecessor's right already points back to current → we've visited the left subtree, cut the thread, visit current node, go right.

### Why This Is Brilliant
The tree is temporarily modified and restored. No additional data structure needed. O(n) time, O(1) space.

### Java Code
```java
class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        TreeNode curr = root;

        while (curr != null) {
            if (curr.left == null) {
                result.add(curr.val); // visit
                curr = curr.right;
            } else {
                // Find in-order predecessor
                TreeNode pred = curr.left;
                while (pred.right != null && pred.right != curr)
                    pred = pred.right;

                if (pred.right == null) {
                    pred.right = curr; // create thread
                    curr = curr.left;
                } else {
                    pred.right = null; // remove thread
                    result.add(curr.val); // visit
                    curr = curr.right;
                }
            }
        }
        return result;
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| `[1,null,2,3]` | `[1,3,2]` |
| `[]` | `[]` |
| `[1]` | `[1]` |
| BST `[4,2,6,1,3,5,7]` | `[1,2,3,4,5,6,7]` |

---

<a id="count-good-nodes-in-a-binary-tree"></a>
## Problem 13 — Count Good Nodes in a Binary Tree

### Problem Statement
A node `X` is **good** if, on the path from root to `X`, there is no node with a value greater than `X.val`. Given the root, return the number of good nodes.

```
Input:
       3
      / \
     1   4
    /   / \
   3   1   5
Output: 4  (nodes 3, 3, 4, 5 are good)
```

### Intuition
DFS, passing the maximum value seen so far on the path from root to current node. A node is good if its value ≥ that maximum. Update the max as you recurse down.

### Why Pre-order DFS
Pre-order naturally carries parent information downward. The max-so-far is a top-down parameter — it belongs to pre-order.

### Java Code
```java
class Solution {
    public int goodNodes(TreeNode root) {
        return dfs(root, Integer.MIN_VALUE);
    }

    private int dfs(TreeNode node, int maxSoFar) {
        if (node == null) return 0;

        int good = node.val >= maxSoFar ? 1 : 0;
        int newMax = Math.max(maxSoFar, node.val);

        return good
             + dfs(node.left,  newMax)
             + dfs(node.right, newMax);
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| `[3,1,4,3,null,1,5]` | 4 |
| `[3,3,null,4,2]` | 3 |
| Single node `[1]` | 1 |
| All same values `[2,2,2]` | 3 |

---

<a id="fenwick-tree-binary-indexed-tree--range-sum-queries"></a>
## Problem 14 — Fenwick Tree (Binary Indexed Tree) — Range Sum Queries

### Problem Statement
Given an array `nums`, implement a data structure supporting:
1. `update(index, val)` — set `nums[index] = val`
2. `sumRange(left, right)` — return the sum of elements from index `left` to `right` (0-indexed)

Constraints: up to 3×10⁴ calls; O(log n) per operation.

### Intuition
A Fenwick Tree (BIT) stores partial sums in a clever bit-indexed structure. Each index `i` is responsible for `lowbit(i)` elements (where `lowbit(i) = i & -i`). Prefix sums can be computed and updated in O(log n) by following the bit structure.

### Why Fenwick Tree
A prefix sum array gives O(1) queries but O(n) updates. A segment tree gives O(log n) for both but requires more code. The Fenwick Tree achieves O(log n) for both with extremely compact code — a popular interview choice.

### Key Operations
- **Query prefix(i)**: repeatedly subtract `lowbit` from i and accumulate.
- **Update point(i, delta)**: repeatedly add `lowbit` to i and update.
- **Range sum [l,r]** = `prefix(r+1) - prefix(l)` (1-indexed internally).

### Java Code
```java
class NumArray {
    private int[] bit; // 1-indexed
    private int[] nums;
    private int n;

    public NumArray(int[] nums) {
        this.n    = nums.length;
        this.nums = new int[n];
        this.bit  = new int[n + 1];
        for (int i = 0; i < n; i++) update(i, nums[i]);
    }

    public void update(int index, int val) {
        int delta = val - nums[index];
        nums[index] = val;
        for (int i = index + 1; i <= n; i += i & -i) // add lowbit
            bit[i] += delta;
    }

    public int sumRange(int left, int right) {
        return prefix(right + 1) - prefix(left);
    }

    private int prefix(int i) {
        int sum = 0;
        for (; i > 0; i -= i & -i) // subtract lowbit
            sum += bit[i];
        return sum;
    }
}
```

### Test Cases
| Operations | Expected |
|---|---|
| `init [1,3,5]`, `sumRange(0,2)` | 9 |
| `update(1,2)`, `sumRange(0,2)` | 8 |
| `init [0,0,0]`, `update(0,5)`, `sumRange(0,0)` | 5 |
| Large array, point updates interleaved with queries | O(log n) per op |

---

<a id="fenwick-tree--count-of-smaller-numbers-after-self"></a>
## Problem 15 — Fenwick Tree — Count of Smaller Numbers After Self

### Problem Statement
Given an integer array `nums`, return an array `counts` where `counts[i]` is the number of elements to the right of `nums[i]` that are smaller than `nums[i]`.

```
Input:  [5, 2, 6, 1]
Output: [2, 1, 1, 0]
```

### Intuition
Process from right to left. For each element, query "how many numbers already inserted are smaller than this one?" Then insert the current number. This is a classic rank/order-statistics problem — perfect for a Fenwick Tree operating on *coordinate-compressed* ranks.

### Why Fenwick Tree + Coordinate Compression
Values can be large/negative. Compress them to ranks [1..n], then use a BIT where `bit[rank]` counts how many times rank has been inserted. Query prefix sum up to `rank-1` for "count of smaller."

### Java Code
```java
class Solution {
    public List<Integer> countSmaller(int[] nums) {
        int n = nums.length;

        // Coordinate compression
        int[] sorted = nums.clone();
        Arrays.sort(sorted);
        sorted = Arrays.stream(sorted).distinct().toArray();
        Map<Integer, Integer> rank = new HashMap<>();
        for (int i = 0; i < sorted.length; i++)
            rank.put(sorted[i], i + 1); // 1-indexed

        int m = sorted.length;
        int[] bit = new int[m + 1];
        Integer[] result = new Integer[n];

        for (int i = n - 1; i >= 0; i--) {
            int r = rank.get(nums[i]);
            result[i] = query(bit, r - 1);  // count smaller
            update(bit, r, m);              // insert rank
        }
        return Arrays.asList(result);
    }

    private void update(int[] bit, int i, int n) {
        for (; i <= n; i += i & -i) bit[i]++;
    }

    private int query(int[] bit, int i) {
        int sum = 0;
        for (; i > 0; i -= i & -i) sum += bit[i];
        return sum;
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| `[5,2,6,1]` | `[2,1,1,0]` |
| `[2,0,1]` | `[2,1,0]` |
| `[1]` | `[0]` |
| All same `[3,3,3]` | `[0,0,0]` |
| Descending `[5,4,3,2,1]` | `[4,3,2,1,0]` |

---

## Pattern Summary

| # | Problem | Core Pattern | Time | Space |
|---|---|---|---|---|
| 1 | Max Path Sum | Post-order + global var | O(n) | O(h) |
| 2 | Diameter | Post-order + global var | O(n) | O(h) |
| 3 | LCA | Post-order bubble-up | O(n) | O(h) |
| 4 | Level Order | BFS + size snapshot | O(n) | O(n) |
| 5 | Serialize/Deserialize | Pre-order + null markers | O(n) | O(n) |
| 6 | Validate BST | DFS + range bounds | O(n) | O(h) |
| 7 | Right Side View | BFS last-per-level | O(n) | O(n) |
| 8 | Build from Pre+In | Divide & conquer + HashMap | O(n) | O(n) |
| 9 | Kth Smallest BST | In-order + counter | O(k+h) | O(h) |
| 10 | Flatten to List | Reverse pre-order + prev ptr | O(n) | O(h) |
| 11 | Path Sum II | Backtracking DFS | O(n²) | O(n) |
| 12 | Morris Traversal | Thread & unthread | O(n) | O(1) |
| 13 | Good Nodes | Pre-order + max-so-far | O(n) | O(h) |
| 14 | Range Sum (BIT) | Fenwick Tree | O(log n)/op | O(n) |
| 15 | Count Smaller | Fenwick Tree + coord compress | O(n log n) | O(n) |

---

## Key Mental Models

**Post-order** → results bubble *up* from children to parent (diameter, LCA, max path sum).

**Pre-order** → information flows *down* from parent to children (validate BST with bounds, good nodes with max-so-far, serialize).

**BFS with size snapshot** → whenever you need level-by-level processing.

**Backtracking** → explore all paths, undo as you retreat (path sum II, all permutations of paths).

**Morris Traversal** → O(1) space traversal by threading predecessor right-pointers.

**Fenwick Tree** → when you need O(log n) prefix sums with point updates; combine with coordinate compression for rank-based problems.