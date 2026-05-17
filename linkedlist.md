# 🔗 Linked List — 15 Problems That Cover 95% of Interview Questions

> Master these 15 problems and you'll be ready for virtually every linked list question in FAANG and product company interviews.

---

## 📚 Table of Contents

1. [Reverse a Linked List](#1-reverse-a-linked-list)
2. [Detect Cycle in a Linked List](#2-detect-cycle-in-a-linked-list)
3. [Find the Middle of a Linked List](#3-find-the-middle-of-a-linked-list)
4. [Merge Two Sorted Linked Lists](#4-merge-two-sorted-linked-lists)
5. [Remove Nth Node from End of List](#5-remove-nth-node-from-end-of-list)
6. [Linked List Cycle II — Find Cycle Start](#6-linked-list-cycle-ii--find-cycle-start)
7. [Reorder List](#7-reorder-list)
8. [Merge K Sorted Linked Lists](#8-merge-k-sorted-linked-lists)
9. [Intersection of Two Linked Lists](#9-intersection-of-two-linked-lists)
10. [Palindrome Linked List](#10-palindrome-linked-list)
11. [Flatten a Multilevel Doubly Linked List](#11-flatten-a-multilevel-doubly-linked-list)
12. [Copy List with Random Pointer](#12-copy-list-with-random-pointer)
13. [Sort a Linked List (Merge Sort)](#13-sort-a-linked-list-merge-sort)
14. [LRU Cache](#14-lru-cache)
15. [Reverse Nodes in k-Group](#15-reverse-nodes-in-k-group)

---

## Node Definition (Used Across All Problems)

```java
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) {
        this.val = val;
        this.next = null;
    }
}
```

---

## 1. Reverse a Linked List

### Problem Statement
Given the head of a singly linked list, reverse the list and return the new head.

**Example:**
```
Input:  1 → 2 → 3 → 4 → 5 → null
Output: 5 → 4 → 3 → 2 → 1 → null
```

### Intuition
Think of it like reversing a chain of people holding hands. Each person needs to stop looking forward and start looking backward. We walk through the chain and one by one make each node point to the person behind it instead of the person ahead.

### Why This Approach?
- **What:** Use three pointers — `prev`, `curr`, `next` — to iteratively flip each `next` pointer.
- **Why:** In-place reversal is O(1) space and O(n) time. No extra structure needed.
- **Core Idea:** At each step, save `curr.next` before overwriting it, then redirect `curr.next = prev`, and slide all three pointers forward.

### Test Cases
| Input | Output |
|-------|--------|
| `1 → 2 → 3 → 4 → 5` | `5 → 4 → 3 → 2 → 1` |
| `1 → 2` | `2 → 1` |
| `1` (single node) | `1` |
| `null` | `null` |

### Java Code
```java
public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;

    while (curr != null) {
        ListNode nextNode = curr.next; // save next
        curr.next = prev;             // reverse the link
        prev = curr;                  // move prev forward
        curr = nextNode;              // move curr forward
    }

    return prev; // prev is now the new head
}
```

**Complexity:** Time O(n) | Space O(1)

---

## 2. Detect Cycle in a Linked List

### Problem Statement
Given the head of a linked list, determine if the list has a cycle (i.e., a node's `next` pointer points to a previously visited node).

**Example:**
```
Input:  3 → 2 → 0 → -4 → (back to 2)
Output: true

Input:  1 → 2 → null
Output: false
```

### Intuition
Imagine two runners on a circular track — one fast, one slow. If there's a loop, the fast runner will eventually lap the slow one and they'll meet. If no loop, the fast runner reaches the finish line (null).

This is **Floyd's Tortoise and Hare** algorithm.

### Why This Approach?
- **What:** Use two pointers — `slow` moves 1 step, `fast` moves 2 steps.
- **Why:** If a cycle exists, fast and slow will eventually point to the same node. No HashSet needed → O(1) space.
- **Key Insight:** In a cycle of length L, they are guaranteed to meet within L steps of slow entering the cycle.

### Test Cases
| Input | Output |
|-------|--------|
| `3 → 2 → 0 → -4 → (cycle to 2)` | `true` |
| `1 → 2 → null` | `false` |
| Single node, no cycle | `false` |
| Single node pointing to itself | `true` |

### Java Code
```java
public boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;       // move 1 step
        fast = fast.next.next;  // move 2 steps

        if (slow == fast) return true; // cycle detected
    }

    return false; // fast reached end → no cycle
}
```

**Complexity:** Time O(n) | Space O(1)

---

## 3. Find the Middle of a Linked List

### Problem Statement
Given the head of a singly linked list, return the middle node. If there are two middle nodes, return the **second** middle node.

**Example:**
```
Input:  1 → 2 → 3 → 4 → 5
Output: Node with value 3

Input:  1 → 2 → 3 → 4
Output: Node with value 3 (second middle)
```

### Intuition
Same two-pointer concept: when the fast pointer reaches the end, the slow pointer is exactly at the middle. Think of a measuring tape — fast covers twice the ground as slow.

### Why This Approach?
- **What:** `slow` moves 1 step, `fast` moves 2 steps. When `fast` hits null, `slow` is at middle.
- **Why:** Avoids a two-pass solution (count length, then traverse n/2). One pass, O(1) space.
- **Even-length behavior:** When there are two middles (even-length list), `slow` lands on the **second** middle because `fast` checks `fast.next` first.

### Test Cases
| Input | Output |
|-------|--------|
| `1 → 2 → 3 → 4 → 5` | `3` |
| `1 → 2 → 3 → 4` | `3` |
| `1` | `1` |
| `1 → 2` | `2` |

### Java Code
```java
public ListNode middleNode(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }

    return slow; // slow is at the middle
}
```

**Complexity:** Time O(n) | Space O(1)

---

## 4. Merge Two Sorted Linked Lists

### Problem Statement
Given the heads of two sorted linked lists, merge them into one sorted linked list and return its head.

**Example:**
```
Input:  list1: 1 → 2 → 4,  list2: 1 → 3 → 4
Output: 1 → 1 → 2 → 3 → 4 → 4
```

### Intuition
Think of merging two sorted card decks. At each step, take the smaller top card from either deck and place it in the result. Use a **dummy head node** to avoid special-casing the first element.

### Why This Approach?
- **What:** Two-pointer traversal. Compare `l1.val` and `l2.val`, attach the smaller, advance that pointer.
- **Why:** In-place merging avoids extra memory. Dummy node simplifies the head edge case elegantly.
- **After loop:** One list may have leftover nodes — attach them directly since they're already sorted.

### Test Cases
| list1 | list2 | Output |
|-------|-------|--------|
| `1 → 2 → 4` | `1 → 3 → 4` | `1 → 1 → 2 → 3 → 4 → 4` |
| `null` | `1 → 2` | `1 → 2` |
| `null` | `null` | `null` |
| `1` | `2` | `1 → 2` |

### Java Code
```java
public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;

    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            curr.next = l1;
            l1 = l1.next;
        } else {
            curr.next = l2;
            l2 = l2.next;
        }
        curr = curr.next;
    }

    // Attach remaining nodes
    curr.next = (l1 != null) ? l1 : l2;

    return dummy.next;
}
```

**Complexity:** Time O(m + n) | Space O(1)

---

## 5. Remove Nth Node from End of List

### Problem Statement
Given the head of a linked list and an integer `n`, remove the nth node from the end and return the head.

**Example:**
```
Input:  1 → 2 → 3 → 4 → 5,  n = 2
Output: 1 → 2 → 3 → 5
```

### Intuition
Use two pointers `fast` and `slow`. Move `fast` exactly `n` steps ahead first. Then move both together. When `fast` reaches null, `slow` is right before the node to delete.

### Why This Approach?
- **What:** Gap-based two-pointer. Maintain a window of size n between fast and slow.
- **Why:** One-pass O(n) solution. No need to count total length separately.
- **Dummy node:** Prepend a dummy node before head to handle edge case of removing the head node itself.

### Test Cases
| Input | n | Output |
|-------|---|--------|
| `1 → 2 → 3 → 4 → 5` | 2 | `1 → 2 → 3 → 5` |
| `1 → 2` | 1 | `1` |
| `1` | 1 | `null` |
| `1 → 2` | 2 | `2` |

### Java Code
```java
public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;

    ListNode fast = dummy;
    ListNode slow = dummy;

    // Move fast n+1 steps ahead
    for (int i = 0; i <= n; i++) {
        fast = fast.next;
    }

    // Move both until fast reaches null
    while (fast != null) {
        fast = fast.next;
        slow = slow.next;
    }

    // slow.next is the node to remove
    slow.next = slow.next.next;

    return dummy.next;
}
```

**Complexity:** Time O(n) | Space O(1)

---

## 6. Linked List Cycle II — Find Cycle Start

### Problem Statement
Given the head of a linked list that may contain a cycle, return the node where the cycle **begins**. If no cycle, return null.

**Example:**
```
Input:  3 → 2 → 0 → -4 → (back to 2)
Output: Node with value 2 (cycle starts here)
```

### Intuition
Extension of Floyd's algorithm. After detecting the meeting point, there's a beautiful mathematical property:

> The distance from **head to cycle start** equals the distance from the **meeting point to cycle start**.

So after the fast/slow meet, reset one pointer to head and walk both one step at a time — they'll collide exactly at the cycle start.

### Why This Approach?
- **What:** Phase 1 — detect cycle (Floyd). Phase 2 — reset one pointer to head, walk both at speed 1.
- **Why:** Pure O(1) space. The math guarantees the two-phase approach works perfectly.
- **Math Proof:** If `F` = steps to cycle entry, `C` = cycle length, `a` = steps from entry to meeting point inside cycle. Meeting condition yields: `F = C - a`, which means starting from head and from meeting point at speed 1 leads to the same node.

### Test Cases
| Input | Output |
|-------|--------|
| `3 → 2 → 0 → -4 → cycle to 2` | Node `2` |
| `1 → 2 → cycle to 1` | Node `1` |
| `1 → null` | `null` |

### Java Code
```java
public ListNode detectCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;

    // Phase 1: Detect cycle
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) break;
    }

    // No cycle
    if (fast == null || fast.next == null) return null;

    // Phase 2: Find cycle start
    slow = head;
    while (slow != fast) {
        slow = slow.next;
        fast = fast.next;
    }

    return slow; // cycle start node
}
```

**Complexity:** Time O(n) | Space O(1)

---

## 7. Reorder List

### Problem Statement
Given a linked list `L0 → L1 → … → Ln-1 → Ln`, reorder it to `L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …` in-place.

**Example:**
```
Input:  1 → 2 → 3 → 4 → 5
Output: 1 → 5 → 2 → 4 → 3
```

### Intuition
The trick is to break this into three sub-problems:
1. Find the middle of the list
2. Reverse the second half
3. Merge the two halves alternately

### Why This Approach?
- **What:** Middle (problem 3) + Reverse (problem 1) + Merge alternately.
- **Why:** Reusing sub-patterns keeps the solution clean. In-place, no extra space.
- **Merge step:** Take one node from the first half, one from the reversed second half, repeat.

### Test Cases
| Input | Output |
|-------|--------|
| `1 → 2 → 3 → 4 → 5` | `1 → 5 → 2 → 4 → 3` |
| `1 → 2 → 3 → 4` | `1 → 4 → 2 → 3` |
| `1` | `1` |
| `1 → 2` | `1 → 2` |

### Java Code
```java
public void reorderList(ListNode head) {
    if (head == null || head.next == null) return;

    // Step 1: Find middle
    ListNode slow = head, fast = head;
    while (fast.next != null && fast.next.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // Step 2: Reverse second half
    ListNode secondHalf = reverseList(slow.next);
    slow.next = null; // cut the list

    // Step 3: Merge two halves
    ListNode first = head, second = secondHalf;
    while (second != null) {
        ListNode tmp1 = first.next;
        ListNode tmp2 = second.next;

        first.next = second;
        second.next = tmp1;

        first = tmp1;
        second = tmp2;
    }
}

private ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
```

**Complexity:** Time O(n) | Space O(1)

---

## 8. Merge K Sorted Linked Lists

### Problem Statement
Given an array of `k` sorted linked lists, merge them all into one sorted linked list.

**Example:**
```
Input:  [1→4→5, 1→3→4, 2→6]
Output: 1 → 1 → 2 → 3 → 4 → 4 → 5 → 6
```

### Intuition
We could merge lists one by one, but that's O(kN). Instead, use a **Min-Heap (PriorityQueue)** to always extract the globally smallest node across all list heads. This is like a k-way merge sort.

### Why This Approach?
- **What:** Insert the head of each list into a min-heap. Pop the minimum, add it to the result, push the popped node's `next` into the heap.
- **Why:** The heap maintains order across all k lists simultaneously. Each element is pushed/popped once → O(N log k) total.
- **Alternative:** Divide and conquer pairwise merges also gives O(N log k) — good to know.

### Test Cases
| Input | Output |
|-------|--------|
| `[1→4→5, 1→3→4, 2→6]` | `1→1→2→3→4→4→5→6` |
| `[]` (empty array) | `null` |
| `[null, null]` | `null` |
| `[[1]]` | `1` |

### Java Code
```java
import java.util.PriorityQueue;

public ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> minHeap = new PriorityQueue<>(
        (a, b) -> a.val - b.val
    );

    // Add heads of all lists to heap
    for (ListNode node : lists) {
        if (node != null) minHeap.offer(node);
    }

    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;

    while (!minHeap.isEmpty()) {
        ListNode node = minHeap.poll(); // smallest node
        curr.next = node;
        curr = curr.next;

        if (node.next != null) {
            minHeap.offer(node.next); // push next from same list
        }
    }

    return dummy.next;
}
```

**Complexity:** Time O(N log k) | Space O(k) — where N = total nodes, k = number of lists

---

## 9. Intersection of Two Linked Lists

### Problem Statement
Given the heads of two singly linked lists, return the node at which the two lists intersect. If they don't intersect, return null.

**Example:**
```
listA: a1 → a2 ↘
                  c1 → c2 → c3
listB: b1 → b2 ↗

Output: c1
```

### Intuition
The elegant trick: let pointer A traverse listA then listB, and pointer B traverse listB then listA. Both pointers travel exactly `len(A) + len(B)` total steps. If they intersect, they'll meet at the intersection node. If not, both hit null simultaneously.

### Why This Approach?
- **What:** Two pointers, each switching to the other list after reaching null.
- **Why:** Elegantly equalizes path lengths without computing lengths explicitly. O(1) space.
- **Key Insight:** Both pointers see the same total distance regardless of individual list lengths.

### Test Cases
| Input | Output |
|-------|--------|
| A: `4→1→8→4→5`, B: `5→6→1→8→4→5` (intersect at node 8) | Node `8` |
| A: `2→6→4`, B: `1→5` (no intersection) | `null` |
| Both same list | First node |

### Java Code
```java
public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
    if (headA == null || headB == null) return null;

    ListNode a = headA;
    ListNode b = headB;

    // When they meet (including null), that's the answer
    while (a != b) {
        a = (a == null) ? headB : a.next;
        b = (b == null) ? headA : b.next;
    }

    return a; // null if no intersection, else intersection node
}
```

**Complexity:** Time O(m + n) | Space O(1)

---

## 10. Palindrome Linked List

### Problem Statement
Given the head of a singly linked list, return `true` if it is a palindrome.

**Example:**
```
Input:  1 → 2 → 2 → 1 → null
Output: true

Input:  1 → 2 → null
Output: false
```

### Intuition
Combine three previously seen techniques:
1. Find the middle
2. Reverse the second half
3. Compare both halves node by node

### Why This Approach?
- **What:** Find middle → Reverse second half → Compare → (Optionally restore).
- **Why:** O(1) space by avoiding a stack or array for comparison.
- **Gotcha:** After reversal, the first half may be one node longer (odd-length list), so stop when the second pointer hits null.

### Test Cases
| Input | Output |
|-------|--------|
| `1 → 2 → 2 → 1` | `true` |
| `1 → 2 → 3 → 2 → 1` | `true` |
| `1 → 2` | `false` |
| `1` | `true` |
| `1 → 0 → 1` | `true` |

### Java Code
```java
public boolean isPalindrome(ListNode head) {
    // Step 1: Find middle
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // Step 2: Reverse second half
    ListNode secondHalf = reverseList(slow);

    // Step 3: Compare both halves
    ListNode left = head, right = secondHalf;
    while (right != null) {
        if (left.val != right.val) return false;
        left = left.next;
        right = right.next;
    }

    return true;
}

private ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
```

**Complexity:** Time O(n) | Space O(1)

---

## 11. Flatten a Multilevel Doubly Linked List

### Problem Statement
A doubly linked list node may have a `child` pointer to another doubly linked list. Flatten it so all nodes appear in a single-level doubly linked list in depth-first order.

**Example:**
```
Input:  1 ↔ 2 ↔ 3 ↔ 4 ↔ 5 ↔ 6
                ↓
                7 ↔ 8 ↔ 9
                    ↓
                    10 ↔ 11

Output: 1 ↔ 2 ↔ 7 ↔ 8 ↔ 10 ↔ 11 ↔ 9 ↔ 3 ↔ 4 ↔ 5 ↔ 6
```

### Intuition
DFS traversal. When we encounter a node with a child, splice the child list between the current node and its `next`, then continue traversal on the newly spliced sublist.

### Why This Approach?
- **What:** Iterative DFS. When `curr.child != null`, find the tail of the child list, splice it in, clear `child` pointer.
- **Why:** Iterative avoids recursion stack overhead. The splicing approach is clean and in-place.
- **Tricky part:** You must find the tail of the child list to reconnect `curr.next`.

### Node Definition
```java
class Node {
    int val;
    Node prev, next, child;
}
```

### Test Cases
| Input | Output |
|-------|--------|
| `1 ↔ 2 (child→3)` | `1 ↔ 3 ↔ 2` |
| No children | Original list unchanged |
| Deeply nested (3 levels) | Depth-first flattened |

### Java Code
```java
public Node flatten(Node head) {
    Node curr = head;

    while (curr != null) {
        if (curr.child != null) {
            Node child = curr.child;
            Node next = curr.next;

            // Find tail of child list
            Node childTail = child;
            while (childTail.next != null) {
                childTail = childTail.next;
            }

            // Splice child list between curr and next
            curr.next = child;
            child.prev = curr;
            curr.child = null;

            childTail.next = next;
            if (next != null) next.prev = childTail;
        }

        curr = curr.next;
    }

    return head;
}
```

**Complexity:** Time O(n) | Space O(1)

---

## 12. Copy List with Random Pointer

### Problem Statement
Each node in a linked list has `val`, `next`, and `random` (which may point to any node or null). Create a **deep copy** of the list.

**Example:**
```
Input:  [[7,null],[13,0],[11,4],[10,2],[1,0]]
Output: A new independent deep copy with identical structure
```

### Intuition
Two-pass approach using a **HashMap**:
- Pass 1: Create all new nodes and map `original → copy`.
- Pass 2: Wire up `.next` and `.random` pointers using the map.

### Why This Approach?
- **What:** HashMap to track original → clone mapping. Two-pass traversal.
- **Why:** The random pointer can point anywhere — we need all nodes created before we can set random links.
- **Alternative:** Interleaving technique (O(1) space) — clone nodes inline between originals, wire randoms, then separate the two lists.

### Node Definition
```java
class Node {
    int val;
    Node next, random;
}
```

### Test Cases
| Input | Output |
|-------|--------|
| `[[7,null],[13,0]]` | Deep copy, no shared references |
| Single node pointing to itself randomly | Correct self-reference in clone |
| All `random = null` | Correct deep copy |

### Java Code
```java
import java.util.HashMap;

public Node copyRandomList(Node head) {
    if (head == null) return null;

    HashMap<Node, Node> map = new HashMap<>();

    // Pass 1: Create all clone nodes
    Node curr = head;
    while (curr != null) {
        map.put(curr, new Node(curr.val));
        curr = curr.next;
    }

    // Pass 2: Wire next and random pointers
    curr = head;
    while (curr != null) {
        if (curr.next != null)
            map.get(curr).next = map.get(curr.next);
        if (curr.random != null)
            map.get(curr).random = map.get(curr.random);
        curr = curr.next;
    }

    return map.get(head);
}
```

**Complexity:** Time O(n) | Space O(n)

---

## 13. Sort a Linked List (Merge Sort)

### Problem Statement
Given the head of a linked list, sort it in ascending order and return its head.

**Example:**
```
Input:  4 → 2 → 1 → 3
Output: 1 → 2 → 3 → 4
```

### Intuition
Merge sort is the natural fit for linked lists because:
- Finding the middle and splitting is O(n)
- Merging two sorted lists is O(n)
- No random access needed (unlike quicksort which prefers arrays)

### Why This Approach?
- **What:** Recursively split at middle → sort halves → merge.
- **Why:** O(n log n) time, O(log n) space (recursion stack). No extra array allocation.
- **Why not quicksort?** Linked lists lack random access, making pivot selection O(n), while finding the middle for merge sort is equally O(n) — merge sort wins on cache behavior.

### Test Cases
| Input | Output |
|-------|--------|
| `4 → 2 → 1 → 3` | `1 → 2 → 3 → 4` |
| `1` | `1` |
| `2 → 1` | `1 → 2` |
| `4 → 2 → 1 → 3 → 5` | `1 → 2 → 3 → 4 → 5` |
| All same values | Same list |

### Java Code
```java
public ListNode sortList(ListNode head) {
    // Base case
    if (head == null || head.next == null) return head;

    // Step 1: Find middle and split
    ListNode mid = getMid(head);
    ListNode right = mid.next;
    mid.next = null; // cut the list

    // Step 2: Recursively sort both halves
    ListNode left = sortList(head);
    right = sortList(right);

    // Step 3: Merge sorted halves
    return merge(left, right);
}

private ListNode getMid(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast.next != null && fast.next.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}

private ListNode merge(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
        else { curr.next = l2; l2 = l2.next; }
        curr = curr.next;
    }
    curr.next = (l1 != null) ? l1 : l2;
    return dummy.next;
}
```

**Complexity:** Time O(n log n) | Space O(log n)

---

## 14. LRU Cache

### Problem Statement
Design a data structure that implements a **Least Recently Used (LRU) Cache** with `get(key)` and `put(key, value)` operations — both in O(1).

**Example:**
```
LRUCache cache = new LRUCache(2); // capacity 2
cache.put(1, 1);
cache.put(2, 2);
cache.get(1);    // returns 1 (1 is now most recently used)
cache.put(3, 3); // evicts key 2 (least recently used)
cache.get(2);    // returns -1 (not found)
```

### Intuition
Combine a **HashMap** (for O(1) lookup) with a **Doubly Linked List** (for O(1) insertion/removal of any node). Most recently used node goes to the front, least recently used stays at the back. On eviction, remove from the back.

### Why This Approach?
- **What:** HashMap `key → Node` + Doubly Linked List with dummy `head` and `tail`.
- **Why:** HashMap gives O(1) access. DLL gives O(1) order updates. Neither structure alone achieves both.
- **Put:** If key exists, update and move to front. If new, insert at front. If over capacity, remove tail.
- **Get:** Return value and move node to front (most recently used).

### Test Cases
| Operations | Expected |
|-----------|---------|
| `put(1,1), put(2,2), get(1)` | 1 |
| `put(1,1), put(2,2), put(3,3), get(2)` | -1 (evicted) |
| `get` on non-existent key | -1 |
| Capacity = 1, repeated puts | Only latest key survives |

### Java Code
```java
import java.util.HashMap;

class LRUCache {
    private class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }

    private HashMap<Integer, Node> map;
    private Node head, tail; // dummy head & tail
    private int capacity;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        map = new HashMap<>();
        head = new Node(0, 0); // dummy
        tail = new Node(0, 0); // dummy
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        insertFront(node);
        return node.val;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) {
            remove(map.get(key));
        }
        Node node = new Node(key, value);
        insertFront(node);
        map.put(key, node);

        if (map.size() > capacity) {
            // Evict LRU: node before tail
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void insertFront(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
}
```

**Complexity:** Time O(1) for get and put | Space O(capacity)

---

## 15. Reverse Nodes in k-Group

### Problem Statement
Given a linked list, reverse the nodes of the list `k` at a time and return the modified list. If remaining nodes are fewer than `k`, leave them as is.

**Example:**
```
Input:  1 → 2 → 3 → 4 → 5,  k = 2
Output: 2 → 1 → 4 → 3 → 5

Input:  1 → 2 → 3 → 4 → 5,  k = 3
Output: 3 → 2 → 1 → 4 → 5
```

### Intuition
Process the list in chunks of k. For each chunk:
1. Check if k nodes exist (if not, stop)
2. Reverse those k nodes
3. Reconnect the reversed chunk to the previous and next parts

### Why This Approach?
- **What:** Iterative group-by-group reversal. Use a dummy node as the stable anchor.
- **Why:** In-place O(1) space. Each node touched exactly twice (once to check, once to reverse).
- **Key Variables:** `groupPrev` (tail of last reversed group), `groupNext` (start of next unprocessed group).

### Test Cases
| Input | k | Output |
|-------|---|--------|
| `1 → 2 → 3 → 4 → 5` | 2 | `2 → 1 → 4 → 3 → 5` |
| `1 → 2 → 3 → 4 → 5` | 3 | `3 → 2 → 1 → 4 → 5` |
| `1 → 2 → 3` | 4 | `1 → 2 → 3` (unchanged) |
| `1` | 1 | `1` |
| `1 → 2` | 2 | `2 → 1` |

### Java Code
```java
public ListNode reverseKGroup(ListNode head, int k) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    ListNode groupPrev = dummy;

    while (true) {
        // Check if k nodes exist ahead
        ListNode kth = getKth(groupPrev, k);
        if (kth == null) break;

        ListNode groupNext = kth.next;

        // Reverse k nodes starting from groupPrev.next
        ListNode prev = groupNext;
        ListNode curr = groupPrev.next;

        while (curr != groupNext) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }

        // Reconnect with previous group
        ListNode tmp = groupPrev.next; // will become new tail
        groupPrev.next = kth;         // kth is new head of group
        groupPrev = tmp;              // advance groupPrev
    }

    return dummy.next;
}

// Returns the kth node from start, or null if fewer than k nodes exist
private ListNode getKth(ListNode curr, int k) {
    while (curr != null && k > 0) {
        curr = curr.next;
        k--;
    }
    return curr;
}
```

**Complexity:** Time O(n) | Space O(1)

---

## 🗺️ Pattern Summary Table

| # | Problem | Core Pattern | Time | Space |
|---|---------|--------------|------|-------|
| 1 | Reverse List | Three-pointer iteration | O(n) | O(1) |
| 2 | Detect Cycle | Floyd's Tortoise & Hare | O(n) | O(1) |
| 3 | Find Middle | Slow/Fast pointers | O(n) | O(1) |
| 4 | Merge Two Sorted | Two-pointer + Dummy head | O(m+n) | O(1) |
| 5 | Remove Nth from End | Gap-based two pointers | O(n) | O(1) |
| 6 | Find Cycle Start | Floyd Phase I + II | O(n) | O(1) |
| 7 | Reorder List | Middle + Reverse + Merge | O(n) | O(1) |
| 8 | Merge K Sorted | Min-Heap | O(N log k) | O(k) |
| 9 | Intersection | Path equalization trick | O(m+n) | O(1) |
| 10 | Palindrome Check | Middle + Reverse + Compare | O(n) | O(1) |
| 11 | Flatten Multilevel | Iterative DFS + splice | O(n) | O(1) |
| 12 | Copy with Random | HashMap two-pass | O(n) | O(n) |
| 13 | Sort List | Merge Sort | O(n log n) | O(log n) |
| 14 | LRU Cache | HashMap + Doubly Linked List | O(1) | O(cap) |
| 15 | Reverse k-Group | Group reversal + reconnect | O(n) | O(1) |

---

## 🧠 Key Intuitions to Internalize

1. **Dummy node** — Use a dummy/sentinel node before head whenever you might need to modify the head itself.
2. **Slow/Fast pointers** — Default to this for: middle finding, cycle detection, nth-from-end.
3. **Two pointer gap** — Fixing fast pointer `n` steps ahead creates an automatic "offset window".
4. **Floyd's two phases** — Phase 1 detects the cycle. Phase 2 (reset one pointer to head) finds the start.
5. **Merge sort for sorting** — Linked lists are naturally split-able; merge sort fits like a glove.
6. **HashMap + DLL** — The canonical O(1) pattern for order-sensitive caching (LRU, LFU).
7. **Subproblem composition** — Most hard problems (Reorder List, Palindrome, Sort) decompose into easier sub-problems you've already seen.

---

*Practice these 15 thoroughly and you'll handle 95%+ of linked list problems in any interview.*