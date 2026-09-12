# DSA Problems: Easy to Medium — Pseudo Code with Detailed Comments

> Each pseudo code block is self-explanatory with inline comments explaining **WHY** each step is done, not just what it does.

---

## Priority Reference Table

> **Priority Guide:**
> - 🔴 **P1 — Must Do** · Core pattern every interviewer tests. Master these before anything else.
> - 🟡 **P2 — Good to Know** · Commonly asked; covers important variations. Study after P1.
> - 🟢 **P3 — Good to Have** · Occasionally asked, niche problems. Study when time permits.

| # | Problem | Category | Priority |
|---|---|---|:---:|
| 1 | Two Sum | Arrays / Hashing | 🔴 P1 |
| 2 | Best Time to Buy and Sell Stock | Arrays / Hashing | 🔴 P1 |
| 3 | Contains Duplicate | Arrays / Hashing | 🔴 P1 |
| 4 | Product of Array Except Self | Arrays / Hashing | 🔴 P1 |
| 5 | Maximum Subarray (Kadane's) | Arrays / Hashing | 🔴 P1 |
| 6 | Move Zeroes | Arrays / Hashing | 🟡 P2 |
| 7 | Merge Sorted Array | Arrays / Hashing | 🟡 P2 |
| 8 | Majority Element | Arrays / Hashing | 🟡 P2 |
| 9 | Missing Number | Arrays / Hashing | 🟡 P2 |
| 10 | Top K Frequent Elements | Arrays / Hashing | 🔴 P1 |
| 11 | Valid Anagram | Strings | 🔴 P1 |
| 12 | Group Anagrams | Strings | 🔴 P1 |
| 13 | Longest Common Prefix | Strings | 🟢 P3 |
| 14 | Valid Palindrome | Strings | 🔴 P1 |
| 15 | Reverse Words in a String | Strings | 🟢 P3 |
| 16 | Longest Substring Without Repeating Characters | Strings | 🔴 P1 |
| 17 | String Compression | Strings | 🟡 P2 |
| 18 | Roman to Integer | Strings | 🟢 P3 |
| 19 | Implement strStr() | Strings | 🟢 P3 |
| 20 | Palindromic Substrings | Strings | 🟡 P2 |
| 21 | Container With Most Water | Sliding Window / Two Pointers | 🔴 P1 |
| 22 | Minimum Size Subarray Sum | Sliding Window / Two Pointers | 🟡 P2 |
| 23 | Permutation in String | Sliding Window / Two Pointers | 🟡 P2 |
| 24 | 3Sum | Sliding Window / Two Pointers | 🔴 P1 |
| 25 | Remove Duplicates from Sorted Array | Sliding Window / Two Pointers | 🟡 P2 |
| 26 | Sort Colors | Sliding Window / Two Pointers | 🟡 P2 |
| 27 | Find All Anagrams in a String | Sliding Window / Two Pointers | 🟡 P2 |
| 28 | Subarray Sum Equals K | Sliding Window / Two Pointers | 🔴 P1 |
| 29 | Valid Parentheses | Stack / Queue | 🔴 P1 |
| 30 | Min Stack | Stack / Queue | 🔴 P1 |
| 31 | Daily Temperatures | Stack / Queue | 🔴 P1 |
| 32 | Next Greater Element | Stack / Queue | 🟡 P2 |
| 33 | Implement Queue Using Stacks | Stack / Queue | 🟡 P2 |
| 34 | Reverse Linked List | Linked List | 🔴 P1 |
| 35 | Merge Two Sorted Lists | Linked List | 🔴 P1 |
| 36 | Linked List Cycle | Linked List | 🔴 P1 |
| 37 | Middle of Linked List | Linked List | 🟡 P2 |
| 38 | Remove Nth Node From End of List | Linked List | 🔴 P1 |
| 39 | Intersection of Two Linked Lists | Linked List | 🟡 P2 |
| 40 | Maximum Depth of Binary Tree | Trees / BFS / DFS | 🔴 P1 |
| 41 | Invert Binary Tree | Trees / BFS / DFS | 🔴 P1 |
| 42 | Same Tree | Trees / BFS / DFS | 🟡 P2 |
| 43 | Binary Tree Level Order Traversal | Trees / BFS / DFS | 🔴 P1 |
| 44 | Lowest Common Ancestor of a BST | Trees / BFS / DFS | 🔴 P1 |
| 45 | Validate Binary Search Tree | Trees / BFS / DFS | 🔴 P1 |
| 46 | Binary Search | Binary Search | 🔴 P1 |
| 47 | Search in Rotated Sorted Array | Binary Search | 🔴 P1 |
| 48 | Task Scheduler | Stack / Queue | 🟡 P2 |
| 49 | Trapping Rain Water | Sliding Window / Two Pointers | 🔴 P1 |
| 50 | Sliding Window Maximum | Sliding Window / Two Pointers | 🟡 P2 |
| 51 | Flood Fill | Matrix / 2D Grid | 🟡 P2 |
| 52 | Set Matrix Zeroes | Matrix / 2D Grid | 🟡 P2 |
| 53 | Spiral Matrix | Matrix / 2D Grid | 🟡 P2 |
| 54 | Rotate Image | Matrix / 2D Grid | 🟡 P2 |
| 55 | Search a 2D Matrix | Matrix / 2D Grid | 🔴 P1 |
| 56 | Number of Islands | Graphs | 🔴 P1 |
| 57 | Clone Graph | Graphs | 🟡 P2 |
| 58 | Course Schedule | Graphs | 🔴 P1 |
| 59 | Number of Connected Components | Graphs | 🟡 P2 |
| 60 | Rotting Oranges | Graphs | 🔴 P1 |
| 61 | Pacific Atlantic Water Flow | Graphs | 🟡 P2 |
| 62 | Kth Largest Element in an Array | Heap / Priority Queue | 🔴 P1 |
| 63 | Merge K Sorted Lists | Heap / Priority Queue | 🔴 P1 |
| 64 | Find Median from Data Stream | Heap / Priority Queue | 🟡 P2 |
| 65 | K Closest Points to Origin | Heap / Priority Queue | 🟡 P2 |
| 66 | Climbing Stairs | Dynamic Programming | 🔴 P1 |
| 67 | House Robber | Dynamic Programming | 🔴 P1 |
| 68 | Coin Change | Dynamic Programming | 🔴 P1 |
| 69 | Longest Increasing Subsequence | Dynamic Programming | 🔴 P1 |
| 70 | 0/1 Knapsack | Dynamic Programming | 🔴 P1 |
| 71 | Longest Common Subsequence | Dynamic Programming | 🔴 P1 |
| 72 | Unique Paths | Dynamic Programming | 🔴 P1 |
| 73 | Jump Game | Dynamic Programming | 🔴 P1 |
| 74 | Word Break | Dynamic Programming | 🔴 P1 |
| 75 | Maximum Product Subarray | Dynamic Programming | 🔴 P1 |
| 76 | Decode Ways | Dynamic Programming | 🟡 P2 |
| 77 | Subsets | Backtracking | 🔴 P1 |
| 78 | Permutations | Backtracking | 🔴 P1 |
| 79 | Combination Sum | Backtracking | 🔴 P1 |
| 80 | Letter Combinations of a Phone Number | Backtracking | 🟡 P2 |
| 81 | Generate Parentheses | Backtracking | 🔴 P1 |
| 82 | N-Queens | Backtracking | 🟡 P2 |
| 83 | Path Sum | Trees / BFS / DFS | 🟡 P2 |
| 84 | Diameter of Binary Tree | Trees / BFS / DFS | 🟡 P2 |
| 85 | Symmetric Tree | Trees / BFS / DFS | 🟡 P2 |
| 86 | Binary Tree Zigzag Level Order Traversal | Trees / BFS / DFS | 🟡 P2 |
| 87 | Construct Binary Tree from Preorder & Inorder | Trees / BFS / DFS | 🟡 P2 |
| 88 | Reorder List | Linked List | 🟡 P2 |
| 89 | Palindrome Linked List | Linked List | 🟡 P2 |
| 90 | Find Minimum in Rotated Sorted Array | Binary Search | 🔴 P1 |
| 91 | First Bad Version | Binary Search | 🟡 P2 |
| 92 | Capacity to Ship Packages Within D Days | Binary Search | 🟡 P2 |
| 93 | Longest Consecutive Sequence | Arrays / Hashing | 🔴 P1 |
| 94 | Find the Duplicate Number | Arrays / Hashing | 🔴 P1 |
| 95 | Squares of a Sorted Array | Two Pointers | 🟡 P2 |
| 96 | Two Sum II — Input Array Is Sorted | Two Pointers | 🔴 P1 |
| 97 | Evaluate Reverse Polish Notation | Stack / Queue | 🔴 P1 |
| 98 | Decode String | Stack / Queue | 🔴 P1 |
| 99 | Balanced Binary Tree | Trees / BFS / DFS | 🔴 P1 |
| 100 | Binary Tree Right Side View | Trees / BFS / DFS | 🔴 P1 |
| 101 | Kth Smallest Element in a BST | Trees / BFS / DFS | 🔴 P1 |
| 102 | Merge Intervals | Intervals | 🔴 P1 |
| 103 | Insert Interval | Intervals | 🔴 P1 |
| 104 | Non-overlapping Intervals | Intervals | 🟡 P2 |
| 105 | Find Peak Element | Binary Search | 🟡 P2 |
| 106 | Koko Eating Bananas | Binary Search | 🔴 P1 |
| 107 | Find First and Last Position of Element | Binary Search | 🔴 P1 |
| 108 | Longest Palindromic Substring | Dynamic Programming | 🔴 P1 |
| 109 | Edit Distance | Dynamic Programming | 🔴 P1 |
| 110 | Partition Equal Subset Sum | Dynamic Programming | 🔴 P1 |
| 111 | Implement Trie (Prefix Tree) | Trie | 🔴 P1 |
| 112 | Word Search | Backtracking | 🔴 P1 |
| 113 | Number of 1 Bits | Bit Manipulation | 🟡 P2 |
| 114 | Reverse Bits | Bit Manipulation | 🟢 P3 |
| 115 | Sum of Two Integers | Bit Manipulation | 🟡 P2 |

> **Quick Stats:** 🔴 66 Must-Do · 🟡 44 Good to Know · 🟢 5 Good to Have

---

## Table of Contents
1. [Arrays / Hashing](#arrays--hashing)
2. [Strings](#strings)
3. [Sliding Window / Two Pointers](#sliding-window--two-pointers)
4. [Stack / Queue](#stack--queue)
5. [Linked List](#linked-list)
6. [Trees / BFS / DFS](#trees--bfs--dfs)
7. [Binary Search](#binary-search)
8. [Matrix / 2D Grid](#matrix--2d-grid)
9. [Graphs (BFS / DFS)](#graphs-bfs--dfs)
10. [Heap / Priority Queue](#heap--priority-queue)
11. [Dynamic Programming](#dynamic-programming)
12. [Backtracking](#backtracking)

---

## Arrays / Hashing

---

### 1. Two Sum

```
FUNCTION twoSum(nums, target):

    // We need to find two indices i,j such that nums[i] + nums[j] == target
    // Brute force would be O(N^2) by checking all pairs
    // Instead, use a HashMap to store each number and its index
    // For every new number, check if (target - number) already exists in the map
    // If yes, we found our pair instantly — O(1) lookup

    CREATE empty HashMap: map  // maps number -> its index

    FOR i = 0 TO length(nums) - 1:
        complement = target - nums[i]
        // complement is the number we need to complete the sum

        IF complement EXISTS in map:
            // The complement was seen before at map[complement]
            RETURN [map[complement], i]
            // Return both indices: the stored one and current index

        // Not found yet, store current number and index for future lookups
        map[nums[i]] = i

    RETURN []  // No solution found (guaranteed not to happen per problem)
```

---

### 2. Best Time to Buy and Sell Stock

```
FUNCTION maxProfit(prices):

    // We want to maximize: sell_price - buy_price
    // We must buy BEFORE we sell (left to right traversal)
    // Key insight: track the minimum price seen so far (best day to buy)
    // For each day, calculate profit if we sell today vs the minimum so far

    minPrice = INFINITY      // Represents the cheapest day seen so far
    maxProfit = 0            // Best profit found so far (at least 0 = no trade)

    FOR each price in prices:
        IF price < minPrice:
            minPrice = price
            // Found a cheaper buying day — update our "best buy day"
        ELSE IF price - minPrice > maxProfit:
            maxProfit = price - minPrice
            // Selling today gives a better profit than anything we've seen

    RETURN maxProfit
```

---

### 3. Contains Duplicate

```
FUNCTION containsDuplicate(nums):

    // We need to detect if any number appears more than once
    // A HashSet is perfect: it only stores unique values
    // Trying to add an existing value returns false — instant duplicate detection

    CREATE empty HashSet: seen

    FOR each num in nums:
        IF num is ALREADY IN seen:
            RETURN true   // Duplicate found — no need to continue
        ADD num to seen   // Remember this number for future checks

    RETURN false   // All numbers were unique
```

---

### 4. Product of Array Except Self

```
FUNCTION productExceptSelf(nums):

    // We cannot use division and must be O(N)
    // Trick: for each index i, the answer is:
    //    (product of all elements to the LEFT of i) * (product of all elements to the RIGHT of i)
    // Pass 1 (left to right): build prefix products
    // Pass 2 (right to left): multiply with suffix products on the fly

    n = length(nums)
    result = array of size n

    // --- Pass 1: Fill result[i] with the product of all elements LEFT of index i ---
    result[0] = 1           // Nothing to the left of index 0, so product = 1
    FOR i = 1 TO n - 1:
        result[i] = result[i-1] * nums[i-1]
        // result[i] now holds product of nums[0..i-1]

    // --- Pass 2: Multiply each result[i] by the product of elements to its RIGHT ---
    right = 1               // Accumulates the right-side product as we go right-to-left
    FOR i = n - 1 DOWNTO 0:
        result[i] = result[i] * right
        // result[i] now = (left product) * (right product) = answer for index i
        right = right * nums[i]
        // Extend the right product to include nums[i] for the next iteration

    RETURN result
```

---

### 5. Maximum Subarray (Kadane's Algorithm)

```
FUNCTION maxSubArray(nums):

    // We want the contiguous subarray with the largest sum
    // Kadane's Insight: at each position, decide whether to:
    //   (a) extend the previous subarray by adding current element, OR
    //   (b) start a fresh subarray from the current element
    // We pick whichever is larger

    maxSum = nums[0]       // Best sum found globally
    currentSum = nums[0]   // Best sum ending at current position

    FOR i = 1 TO length(nums) - 1:
        // Should we continue the existing subarray or start fresh?
        currentSum = MAX(nums[i], currentSum + nums[i])
        // If currentSum was negative, adding nums[i] only hurts us
        // So starting fresh (just nums[i]) is better

        maxSum = MAX(maxSum, currentSum)
        // Track the overall best we've ever seen

    RETURN maxSum
```

---

### 6. Move Zeroes

```
FUNCTION moveZeroes(nums):

    // We want to push all zeros to the end while keeping non-zeros in order
    // Use a write pointer (insertPos) that only advances for non-zero elements
    // All non-zeros get written to the front, then fill the rest with zeros

    insertPos = 0    // The next position to write a non-zero element

    FOR each num in nums:
        IF num != 0:
            nums[insertPos] = num   // Write non-zero to the front
            insertPos++             // Advance write pointer

    // At this point, insertPos is the count of non-zero elements
    // Fill remaining positions with zeros
    WHILE insertPos < length(nums):
        nums[insertPos] = 0
        insertPos++
```

---

### 7. Merge Sorted Array

```
FUNCTION merge(nums1, m, nums2, n):

    // nums1 has m real elements + n extra space at the end
    // We merge nums2 into nums1 in-place, sorted
    // KEY INSIGHT: Start from the END of both arrays
    //   This avoids overwriting elements in nums1 that haven't been processed yet
    //   We always write to the rightmost free position in nums1

    i = m - 1          // Last real element index in nums1
    j = n - 1          // Last element index in nums2
    k = m + n - 1      // Last position in nums1 (write pointer)

    WHILE i >= 0 AND j >= 0:
        IF nums1[i] > nums2[j]:
            nums1[k] = nums1[i]   // nums1's element is larger, place it at k
            i--
        ELSE:
            nums1[k] = nums2[j]   // nums2's element is larger or equal
            j--
        k--

    // If nums2 still has remaining elements, copy them over
    // (If nums1 still has remaining elements, they're already in place)
    WHILE j >= 0:
        nums1[k] = nums2[j]
        j--
        k--
```

---

### 8. Majority Element (Boyer-Moore Voting)

```
FUNCTION majorityElement(nums):

    // The majority element appears more than n/2 times
    // Boyer-Moore Voting: maintain a candidate + count
    // When count drops to 0, the current candidate "lost" all votes — pick a new one
    // The true majority element will always survive this process

    candidate = nums[0]   // Start with first element as our initial candidate
    count = 1             // It has 1 "vote" for itself

    FOR i = 1 TO length(nums) - 1:
        IF count == 0:
            candidate = nums[i]   // Previous candidate was eliminated, try a new one
            count = 1
        ELSE IF nums[i] == candidate:
            count++               // Another vote for our candidate — strengthen it
        ELSE:
            count--               // A different number "cancels out" one vote

    RETURN candidate
    // Guaranteed to be the majority element since it appears > n/2 times
```

---

### 9. Missing Number

```
FUNCTION missingNumber(nums):

    // Array contains n distinct numbers from range [0..n], one is missing
    // Math trick: sum of 0+1+2+...+n = n*(n+1)/2
    // If we subtract the actual sum of the array, the difference is the missing number

    n = length(nums)
    expectedSum = n * (n + 1) / 2   // What the sum SHOULD be with all numbers present

    actualSum = 0
    FOR each num in nums:
        actualSum += num   // Sum of what we actually have

    RETURN expectedSum - actualSum
    // The difference reveals exactly which number is absent
```

---

### 10. Top K Frequent Elements

```
FUNCTION topKFrequent(nums, k):

    // Step 1: Count frequency of each number using a HashMap
    // Step 2: Use a Min-Heap of size k to keep track of the k most frequent elements
    //   - Min-Heap means the LEAST frequent element is always at the top
    //   - If heap grows beyond k, pop the minimum (least frequent)
    //   - At the end, heap contains exactly the k most frequent elements

    CREATE frequency map: freq
    FOR each num in nums:
        freq[num] += 1    // Count occurrences

    CREATE min-heap: pq  (ordered by frequency ascending)

    FOR each (number, frequency) in freq:
        ADD number to pq
        IF size of pq > k:
            REMOVE top of pq    // Remove least frequent — it's not in top k

    // Extract results from heap
    result = array of size k
    FOR i = k-1 DOWNTO 0:
        result[i] = REMOVE top from pq

    RETURN result
```

---

## Strings

---

### 11. Valid Anagram

```
FUNCTION isAnagram(s, t):

    // Two strings are anagrams if they contain the exact same characters with same frequencies
    // Fast approach: count character frequencies using an int array of size 26 (a-z)
    // Increment for chars in s, decrement for chars in t
    // If any count goes negative, t has a char that s doesn't — not an anagram

    IF length(s) != length(t):
        RETURN false   // Different lengths can't be anagrams

    count = array[26] initialized to 0

    FOR each char c in s:
        count[c - 'a']++   // Increment frequency for this character

    FOR each char c in t:
        count[c - 'a']--   // Decrement frequency
        IF count[c - 'a'] < 0:
            RETURN false   // t has a character that s doesn't have enough of

    RETURN true   // All counts balanced — valid anagram
```

---

### 12. Group Anagrams

```
FUNCTION groupAnagrams(strs):

    // Anagrams are strings with identical characters — sorting them gives the same string
    // Use sorted version as a HashMap key to group anagrams together

    CREATE empty HashMap: map  // sorted_word -> list of original words

    FOR each word in strs:
        sortedWord = sort the characters of word alphabetically
        // e.g., "eat" -> "aet", "tea" -> "aet" (same key!)

        IF sortedWord NOT IN map:
            map[sortedWord] = empty list

        APPEND word to map[sortedWord]
        // Group this word with all other anagrams that share the same sorted key

    RETURN all values from map   // Each value is a group of anagrams
```

---

### 13. Longest Common Prefix

```
FUNCTION longestCommonPrefix(strs):

    // Strategy: Take the first string as the initial prefix candidate
    // Compare it against every other string, shrinking it until it matches
    // If prefix ever becomes empty, no common prefix exists

    IF strs is empty:
        RETURN ""

    prefix = strs[0]   // Start with the entire first string as the prefix guess

    FOR i = 1 TO length(strs) - 1:
        // Keep trimming the prefix from the right until strs[i] starts with it
        WHILE strs[i] does NOT start with prefix:
            prefix = prefix[0 .. length(prefix)-2]
            // Remove one character from the end of prefix

            IF prefix is empty:
                RETURN ""   // No common prefix at all

    RETURN prefix
```

---

### 14. Valid Palindrome

```
FUNCTION isPalindrome(s):

    // A palindrome reads the same forward and backward
    // We ignore non-alphanumeric characters and case
    // Use two pointers: one from left, one from right
    // Skip non-alphanumeric chars, compare remaining chars (case-insensitive)

    left = 0
    right = length(s) - 1

    WHILE left < right:
        // Skip non-alphanumeric characters from the left side
        WHILE left < right AND s[left] is NOT letter or digit:
            left++

        // Skip non-alphanumeric characters from the right side
        WHILE left < right AND s[right] is NOT letter or digit:
            right--

        // Compare characters ignoring case
        IF lowercase(s[left]) != lowercase(s[right]):
            RETURN false   // Mismatch — not a palindrome

        left++
        right--

    RETURN true   // All matching characters compared — it's a palindrome
```

---

### 15. Reverse Words in a String

```
FUNCTION reverseWords(s):

    // Split string into individual words, removing leading/trailing spaces
    //   and handling multiple spaces between words
    // Then join them in reverse order

    words = split(trim(s), by one-or-more whitespace)
    // trim() removes leading/trailing spaces
    // split with regex \\s+ handles multiple consecutive spaces between words

    result = empty string
    FOR i = length(words) - 1 DOWNTO 0:
        // Append each word from last to first
        result += words[i]
        IF i > 0:
            result += " "   // Add space between words, but not after the last

    RETURN result
```

---

### 16. Longest Substring Without Repeating Characters

```
FUNCTION lengthOfLongestSubstring(s):

    // Use a sliding window [left, right]
    // HashMap tracks the last seen index of each character
    // When we see a repeated character, jump the left pointer past its last occurrence
    // This ensures the window [left, right] always has unique characters

    map = HashMap: character -> last seen index
    maxLen = 0
    left = 0   // Left boundary of the window

    FOR right = 0 TO length(s) - 1:
        c = s[right]

        IF c IS IN map AND map[c] >= left:
            // c is already in our current window
            // Move left pointer to just past the previous occurrence of c
            // This invalidates the duplicate and makes the window valid again
            left = map[c] + 1

        map[c] = right   // Update last seen index of c to current position

        maxLen = MAX(maxLen, right - left + 1)
        // Current window size is right - left + 1

    RETURN maxLen
```

---

### 17. String Compression

```
FUNCTION compress(chars):

    // Compress runs of repeated characters in-place
    // e.g., ['a','a','a','b'] -> ['a','3','b'], return 4
    // Use two pointers: i (read), write (write position)

    write = 0   // Where we're currently writing compressed output
    i = 0       // Where we're reading from

    WHILE i < length(chars):
        cur = chars[i]   // Current character starting a new run
        count = 0        // How many consecutive chars equal to cur

        // Count the entire run of the same character
        WHILE i < length(chars) AND chars[i] == cur:
            i++
            count++

        // Write the character itself
        chars[write] = cur
        write++

        // Write the count only if it's more than 1
        IF count > 1:
            FOR each digit in string representation of count:
                chars[write] = digit
                write++
            // e.g., count=12 writes '1' then '2' separately

    RETURN write   // New length of compressed array
```

---

### 18. Roman to Integer

```
FUNCTION romanToInt(s):

    // Roman numerals: normally add each symbol's value
    // Exception: if a smaller value appears BEFORE a larger value, SUBTRACT it
    //   e.g., IV = 5 - 1 = 4,  IX = 10 - 1 = 9

    // Map each Roman symbol to its integer value
    map = {I:1, V:5, X:10, L:50, C:100, D:500, M:1000}

    result = 0

    FOR i = 0 TO length(s) - 1:
        cur = map[s[i]]           // Value of current symbol
        next = map[s[i+1]] IF i+1 < length(s) ELSE 0   // Value of next symbol

        IF cur < next:
            // Current symbol is smaller than the next — subtract it
            // e.g., I before V means -1
            result -= cur
        ELSE:
            // Normal case — add the current symbol's value
            result += cur

    RETURN result
```

---

### 19. Implement strStr()

```
FUNCTION strStr(haystack, needle):

    // Find the first occurrence of needle inside haystack
    // Return the starting index, or -1 if not found

    IF needle is empty:
        RETURN 0   // Empty string is always found at position 0

    n = length(haystack)
    m = length(needle)

    // Try every possible starting position in haystack
    FOR i = 0 TO n - m:
        // Check if the substring of haystack starting at i matches needle
        IF haystack[i .. i+m-1] == needle:
            RETURN i   // Found it!

    RETURN -1   // needle was not found anywhere in haystack
```

---

### 20. Palindromic Substrings

```
FUNCTION countSubstrings(s):

    // Count all substrings that are palindromes
    // Approach: for each character (and gap between characters), expand outward
    //   - Odd-length palindromes: center is a single character
    //   - Even-length palindromes: center is between two equal adjacent characters

    count = 0

    FOR i = 0 TO length(s) - 1:
        // Expand around center at i (odd-length palindromes, e.g., "aba")
        count += expand(s, i, i)

        // Expand around center between i and i+1 (even-length, e.g., "abba")
        count += expand(s, i, i + 1)

    RETURN count

FUNCTION expand(s, left, right):
    localCount = 0
    WHILE left >= 0 AND right < length(s) AND s[left] == s[right]:
        // Characters match — this window is a palindrome
        localCount++   // Count this palindrome
        left--         // Expand one step further left
        right++        // Expand one step further right
    RETURN localCount
```

---

## Sliding Window / Two Pointers

---

### 21. Container With Most Water

```
FUNCTION maxArea(height):

    // Two vertical lines form a container — area = min(height[left], height[right]) * width
    // Width is (right - left), which decreases as pointers move inward
    // Strategy: always move the pointer pointing to the SHORTER line
    //   Because moving the taller one can't increase area (width shrinks, height is still limited by the shorter)
    //   But moving the shorter one MIGHT find a taller line and increase area

    left = 0
    right = length(height) - 1
    maxWater = 0

    WHILE left < right:
        // Calculate current container area
        water = MIN(height[left], height[right]) * (right - left)
        maxWater = MAX(maxWater, water)

        IF height[left] < height[right]:
            left++    // Short line on left — move left pointer to try a taller one
        ELSE:
            right--   // Short line on right (or equal) — move right pointer

    RETURN maxWater
```

---

### 22. Minimum Size Subarray Sum

```
FUNCTION minSubArrayLen(target, nums):

    // Find the shortest contiguous subarray with sum >= target
    // Use a sliding window: grow the window by moving right pointer
    // When sum >= target, try to shrink the window from the left to find the minimum length

    left = 0
    sum = 0
    minLen = INFINITY

    FOR right = 0 TO length(nums) - 1:
        sum += nums[right]   // Expand window by including nums[right]

        WHILE sum >= target:
            // Current window [left..right] satisfies the condition
            minLen = MIN(minLen, right - left + 1)   // Record window size
            sum -= nums[left]   // Shrink window from left to try a smaller valid window
            left++

    RETURN 0 IF minLen == INFINITY ELSE minLen
    // If minLen never updated, no valid subarray exists
```

---

### 23. Permutation in String

```
FUNCTION checkInclusion(s1, s2):

    // Check if any permutation of s1 exists as a substring in s2
    // A permutation has same character frequencies — so compare frequency arrays
    // Use a fixed-size sliding window of length s1.length on s2

    IF length(s1) > length(s2): RETURN false

    count = array[26] of zeros
    FOR each char c in s1:
        count[c - 'a']++   // Build frequency profile of s1

    left = 0
    matches = 0   // Count how many characters are correctly matched in current window

    FOR right = 0 TO length(s2) - 1:
        // Add s2[right] to the window
        idx = s2[right] - 'a'
        count[idx]--
        IF count[idx] >= 0:
            matches++   // This character is still "needed" by s1 — good match

        // Check if full window matches s1
        IF matches == length(s1):
            RETURN true

        // If window size exceeds s1, shrink from left
        IF right >= length(s1) - 1:
            leftIdx = s2[left] - 'a'
            IF count[leftIdx] >= 0:
                matches--   // Removing this char breaks a match
            count[leftIdx]++
            left++

    RETURN false
```

---

### 24. 3Sum

```
FUNCTION threeSum(nums):

    // Find all unique triplets that sum to zero
    // Sort first so we can use two-pointer technique and easily skip duplicates
    // Fix one number (nums[i]), then use two pointers to find the other two

    SORT(nums)
    result = empty list

    FOR i = 0 TO length(nums) - 3:
        // Skip duplicate values for the first element to avoid duplicate triplets
        IF i > 0 AND nums[i] == nums[i-1]:
            CONTINUE

        left = i + 1
        right = length(nums) - 1

        WHILE left < right:
            sum = nums[i] + nums[left] + nums[right]

            IF sum == 0:
                ADD [nums[i], nums[left], nums[right]] to result
                // Skip duplicates for the second element
                WHILE left < right AND nums[left] == nums[left+1]: left++
                // Skip duplicates for the third element
                WHILE left < right AND nums[right] == nums[right-1]: right--
                left++
                right--
            ELSE IF sum < 0:
                left++    // Sum too small — move left pointer to a larger value
            ELSE:
                right--   // Sum too large — move right pointer to a smaller value

    RETURN result
```

---

### 25. Remove Duplicates from Sorted Array

```
FUNCTION removeDuplicates(nums):

    // Remove duplicates in-place from a sorted array
    // Use a write pointer k: it only advances when we find a new unique element
    // Since array is sorted, duplicates are always adjacent — easy to detect

    IF length(nums) == 0: RETURN 0

    k = 1   // Position to write the next unique element (first element is always unique)

    FOR i = 1 TO length(nums) - 1:
        IF nums[i] != nums[i-1]:
            // Found a new unique element (different from the one before it)
            nums[k] = nums[i]   // Write it to the next available position
            k++                  // Advance the write pointer

    RETURN k   // k is the count of unique elements
```

---

### 26. Sort Colors (Dutch National Flag)

```
FUNCTION sortColors(nums):

    // Sort array containing only 0s, 1s, 2s in a single pass
    // Use three pointers: low (boundary for 0s), mid (current element), high (boundary for 2s)
    // Invariant: everything before low is 0, everything after high is 2, 1s are in between

    low = 0
    mid = 0
    high = length(nums) - 1

    WHILE mid <= high:
        IF nums[mid] == 0:
            SWAP(nums[low], nums[mid])
            // 0 goes to the left section
            low++   // Expand the 0-section boundary
            mid++   // This element is now confirmed correct, move forward

        ELSE IF nums[mid] == 1:
            mid++   // 1 is in the right place (middle section), just advance

        ELSE:  // nums[mid] == 2
            SWAP(nums[mid], nums[high])
            // 2 goes to the right section
            high--  // Shrink the right boundary
            // Do NOT increment mid: the swapped element at mid hasn't been examined yet
```

---

### 27. Find All Anagrams in a String

```
FUNCTION findAnagrams(s, p):

    // Find all starting indices where an anagram of p appears in s
    // Use fixed sliding window of size length(p)
    // Compare frequency arrays of the window and p

    result = empty list
    IF length(s) < length(p): RETURN result

    pCount = array[26] of zeros   // Frequency of chars in p
    sCount = array[26] of zeros   // Frequency of chars in current window

    // Initialize frequency arrays for p and the first window
    FOR i = 0 TO length(p) - 1:
        pCount[p[i] - 'a']++
        sCount[s[i] - 'a']++

    // Check if the first window is an anagram
    IF pCount == sCount:
        ADD 0 to result

    // Slide the window one character at a time
    FOR i = length(p) TO length(s) - 1:
        sCount[s[i] - 'a']++            // Add new right character to window
        sCount[s[i - length(p)] - 'a']-- // Remove leftmost character from window

        IF pCount == sCount:
            ADD (i - length(p) + 1) to result   // Record starting index of anagram

    RETURN result
```

---

### 28. Subarray Sum Equals K

```
FUNCTION subarraySum(nums, k):

    // Count subarrays with sum exactly equal to k
    // Key insight: use prefix sums
    //   If prefixSum[j] - prefixSum[i] == k, then subarray[i+1..j] has sum k
    //   Equivalently: prefixSum[i] = prefixSum[j] - k
    // For each prefix sum we compute, check how many previous prefix sums were (sum - k)

    prefixCount = HashMap: 0 -> 1
    // Start with prefix sum of 0 having count 1 (the empty prefix before the array)
    // This handles subarrays that start from index 0

    sum = 0
    count = 0

    FOR each num in nums:
        sum += num   // Compute running prefix sum

        // How many subarrays ending here have sum == k?
        // They correspond to previous prefix sums equal to (sum - k)
        count += prefixCount.getOrDefault(sum - k, 0)

        // Record this prefix sum for future use
        prefixCount[sum] = prefixCount.getOrDefault(sum, 0) + 1

    RETURN count
```

---

## Stack / Queue

---

### 29. Valid Parentheses

```
FUNCTION isValid(s):

    // Use a stack to match opening and closing brackets
    // When we see an opening bracket, push it
    // When we see a closing bracket, pop the top and verify it matches

    stack = empty stack

    FOR each char c in s:
        IF c is '(' OR '{' OR '[':
            PUSH c onto stack   // Opening bracket — save for later matching

        ELSE:
            // It's a closing bracket
            IF stack is empty:
                RETURN false   // No matching opening bracket exists

            top = POP from stack

            // Check if the closing bracket matches the most recent opening bracket
            IF c == ')' AND top != '(': RETURN false
            IF c == '}' AND top != '{': RETURN false
            IF c == ']' AND top != '[': RETURN false

    // If stack is empty, all brackets were matched correctly
    // If not empty, some opening brackets were never closed
    RETURN stack is empty
```

---

### 30. Min Stack

```
CLASS MinStack:

    // Design a stack that also tracks the minimum in O(1)
    // Key idea: use TWO stacks
    //   main stack: normal push/pop behavior
    //   minStack: at each level, records the minimum value AT OR BELOW that level
    //   Both stacks stay synchronized — same size at all times

    stack = empty stack
    minStack = empty stack

    FUNCTION push(val):
        PUSH val onto stack   // Normal push

        // Push the current minimum onto minStack
        // It's either the new val (if smaller) or the previous minimum
        IF minStack is empty:
            PUSH val onto minStack
        ELSE:
            PUSH MIN(val, minStack.peek()) onto minStack
        // Now minStack.peek() always reflects the global minimum of the whole stack

    FUNCTION pop():
        POP from stack      // Remove top element
        POP from minStack   // Remove corresponding minimum snapshot

    FUNCTION top():
        RETURN stack.peek()   // Just peek at the top

    FUNCTION getMin():
        RETURN minStack.peek()
        // The minimum for the current state is always at the top of minStack
```

---

### 31. Daily Temperatures

```
FUNCTION dailyTemperatures(temperatures):

    // For each day, find how many days until a warmer temperature
    // Use a monotonic decreasing stack of INDICES
    // When we find a temperature warmer than the stack's top, we've found the answer for that day

    n = length(temperatures)
    result = array[n] of zeros   // Default 0 means no warmer day found
    stack = empty stack           // Stores indices of days waiting for a warmer day

    FOR i = 0 TO n - 1:
        // Check if today's temperature resolves any previous days
        WHILE stack is not empty AND temperatures[i] > temperatures[stack.peek()]:
            idx = POP from stack
            result[idx] = i - idx   // Days waited = current index - that day's index

        PUSH i onto stack   // Push current day's index (it's still waiting for a warmer day)

    RETURN result
    // Remaining elements in stack stay 0 (no warmer day ever found)
```

---

### 32. Next Greater Element

```
FUNCTION nextGreaterElement(nums1, nums2):

    // For each element in nums1, find the next greater element to its right in nums2
    // First, precompute a map of "next greater element" for all elements in nums2
    // Use a monotonic stack on nums2 to do this in O(N)

    map = HashMap: element -> next greater element in nums2
    stack = empty stack   // Monotonic decreasing stack of values

    FOR each num in nums2:
        // Pop elements from stack that are smaller than current num
        // Current num is the "next greater element" for all those popped elements
        WHILE stack is not empty AND stack.peek() < num:
            map[POP from stack] = num

        PUSH num onto stack   // num is still waiting for its next greater element

    // Build result for nums1 using the precomputed map
    result = array of size length(nums1)
    FOR i = 0 TO length(nums1) - 1:
        result[i] = map.getOrDefault(nums1[i], -1)
        // -1 if no greater element was found

    RETURN result
```

---

### 33. Implement Queue Using Stacks

```
CLASS MyQueue:

    // Simulate a FIFO queue using two LIFO stacks
    // inStack: receives all new pushes
    // outStack: serves all pops/peeks
    // When outStack is empty, transfer all elements from inStack (reversing the order)
    //   This makes the oldest element available at the top of outStack

    inStack = empty stack
    outStack = empty stack

    FUNCTION push(x):
        PUSH x onto inStack
        // All new elements go into inStack — order doesn't matter yet

    FUNCTION move():
        IF outStack is empty:
            // Transfer everything: this reverses the order, making oldest element on top
            WHILE inStack is not empty:
                PUSH (POP from inStack) onto outStack

    FUNCTION pop():
        move()         // Ensure outStack has the oldest element on top
        RETURN POP from outStack

    FUNCTION peek():
        move()
        RETURN outStack.peek()   // Oldest element

    FUNCTION empty():
        RETURN inStack is empty AND outStack is empty
```

---

## Linked List

---

### 34. Reverse Linked List

```
FUNCTION reverseList(head):

    // Reverse a singly linked list in-place
    // Use three pointers: prev, curr, next
    // For each node, make it point BACKWARD to prev instead of forward

    prev = null     // The node that curr should now point to (starts as null = new tail)
    curr = head     // Current node being processed

    WHILE curr is not null:
        next = curr.next    // Save the next node BEFORE we break the link
        curr.next = prev    // Reverse the link: point current node backward
        prev = curr         // Advance prev to current node
        curr = next         // Advance curr to the saved next node

    RETURN prev   // prev is now the new head (the old tail)
```

---

### 35. Merge Two Sorted Lists

```
FUNCTION mergeTwoLists(list1, list2):

    // Merge two sorted linked lists into one sorted list
    // Use a dummy head node to simplify edge cases (avoids special handling for first node)
    // At each step, pick the smaller node from the two lists

    dummy = new Node(0)   // Dummy head — we return dummy.next at the end
    curr = dummy           // Current position in the merged list

    WHILE list1 is not null AND list2 is not null:
        IF list1.val <= list2.val:
            curr.next = list1   // list1's node is smaller — add it to merged list
            list1 = list1.next  // Advance list1 pointer
        ELSE:
            curr.next = list2
            list2 = list2.next

        curr = curr.next    // Move merged list pointer forward

    // One list is exhausted — attach the remaining nodes of the other
    IF list1 is not null:
        curr.next = list1
    ELSE:
        curr.next = list2

    RETURN dummy.next   // Skip the dummy head
```

---

### 36. Linked List Cycle

```
FUNCTION hasCycle(head):

    // Detect if the linked list has a cycle
    // Floyd's Cycle Detection: use two pointers moving at different speeds
    //   slow moves 1 step at a time, fast moves 2 steps at a time
    //   If there's a cycle, fast will eventually "lap" slow and they'll meet
    //   If no cycle, fast reaches null first

    slow = head
    fast = head

    WHILE fast is not null AND fast.next is not null:
        slow = slow.next          // Move 1 step
        fast = fast.next.next     // Move 2 steps

        IF slow == fast:
            RETURN true   // Pointers met — cycle confirmed

    RETURN false   // fast reached end — no cycle
```

---

### 37. Middle of Linked List

```
FUNCTION middleNode(head):

    // Find the middle node of a linked list
    // Floyd's trick: slow moves 1 step, fast moves 2 steps
    // When fast reaches the end, slow is at the middle
    // For even-length lists, this naturally returns the SECOND middle node

    slow = head
    fast = head

    WHILE fast is not null AND fast.next is not null:
        slow = slow.next      // 1 step
        fast = fast.next.next // 2 steps
        // By the time fast finishes, slow is exactly at the midpoint

    RETURN slow   // slow is at the middle
```

---

### 38. Remove Nth Node From End

```
FUNCTION removeNthFromEnd(head, n):

    // Remove the n-th node from the END of the list
    // Trick: use two pointers (fast and slow) with a gap of n nodes between them
    // When fast reaches the end, slow is right before the node to be removed

    dummy = new Node(0)   // Dummy node before head — handles edge case of removing head
    dummy.next = head
    fast = dummy
    slow = dummy

    // Advance fast by n+1 steps so the gap between slow and fast is n+1
    FOR i = 0 TO n:
        fast = fast.next
        // After this loop, fast is n+1 steps ahead of slow

    // Move both pointers until fast reaches null
    WHILE fast is not null:
        fast = fast.next
        slow = slow.next
    // Now slow is pointing to the node JUST BEFORE the one to remove

    slow.next = slow.next.next   // Skip the n-th from end node

    RETURN dummy.next
```

---

### 39. Intersection of Two Linked Lists

```
FUNCTION getIntersectionNode(headA, headB):

    // Find the node where two linked lists intersect
    // KEY INSIGHT: pointer a traverses list A then list B
    //             pointer b traverses list B then list A
    // After traveling combined length (lenA + lenB), both pointers align at the intersection
    // If no intersection, both reach null at the same time

    a = headA
    b = headB

    WHILE a != b:
        // When a reaches the end of list A, redirect it to the head of list B
        a = IF a == null THEN headB ELSE a.next

        // When b reaches the end of list B, redirect it to the head of list A
        b = IF b == null THEN headA ELSE b.next

        // After lenA + lenB steps, both are at the same node (or both null)

    RETURN a   // Either the intersection node or null
```

---

## Trees / BFS / DFS

---

### 40. Maximum Depth of Binary Tree

```
FUNCTION maxDepth(root):

    // Maximum depth = length of the longest root-to-leaf path
    // Recursive approach: depth of tree = 1 + max(depth of left subtree, depth of right subtree)
    // Base case: null node has depth 0

    IF root is null:
        RETURN 0   // Empty subtree contributes 0 levels

    leftDepth = maxDepth(root.left)     // Recursively find depth of left subtree
    rightDepth = maxDepth(root.right)   // Recursively find depth of right subtree

    RETURN 1 + MAX(leftDepth, rightDepth)
    // +1 for the current node (root level)
```

---

### 41. Invert Binary Tree

```
FUNCTION invertTree(root):

    // Mirror/invert the binary tree: swap left and right children at every node
    // Recursive approach: invert left subtree, invert right subtree, then swap them

    IF root is null:
        RETURN null   // Nothing to invert

    // First, recursively invert both subtrees
    // Note: we save root.left before overwriting it
    temp = root.left

    root.left = invertTree(root.right)   // Left child becomes inverted right subtree
    root.right = invertTree(temp)        // Right child becomes inverted original left subtree

    RETURN root
```

---

### 42. Same Tree

```
FUNCTION isSameTree(p, q):

    // Two trees are the same if they have identical structure AND identical node values
    // Check recursively: if both are null → same; if one is null → different

    IF p == null AND q == null:
        RETURN true   // Both empty at this position — matches

    IF p == null OR q == null:
        RETURN false  // One is empty and the other isn't — mismatch

    // Both nodes exist — check if values match AND both subtrees are identical
    RETURN (p.val == q.val)
        AND isSameTree(p.left, q.left)
        AND isSameTree(p.right, q.right)
```

---

### 43. Binary Tree Level Order Traversal

```
FUNCTION levelOrder(root):

    // Visit nodes level by level (BFS using a queue)
    // Process all nodes at the current level before moving to the next level

    result = empty list
    IF root is null: RETURN result

    queue = new Queue
    ENQUEUE root into queue

    WHILE queue is not empty:
        levelSize = size of queue   // Number of nodes at the current level

        currentLevel = empty list

        FOR i = 0 TO levelSize - 1:
            node = DEQUEUE from queue   // Process one node from this level

            ADD node.val to currentLevel

            // Enqueue children for the next level
            IF node.left is not null: ENQUEUE node.left
            IF node.right is not null: ENQUEUE node.right

        ADD currentLevel to result

    RETURN result
```

---

### 44. Lowest Common Ancestor (BST)

```
FUNCTION lowestCommonAncestor(root, p, q):

    // In a BST, use the BST property to find LCA without full traversal
    // If both p and q are less than root, LCA must be in the left subtree
    // If both are greater than root, LCA must be in the right subtree
    // If they're on different sides (or one equals root), root IS the LCA

    WHILE root is not null:
        IF p.val < root.val AND q.val < root.val:
            root = root.left     // Both nodes are in the left subtree

        ELSE IF p.val > root.val AND q.val > root.val:
            root = root.right    // Both nodes are in the right subtree

        ELSE:
            RETURN root
            // They diverge here — root is the lowest common ancestor
            // (Includes the case where root == p or root == q)
```

---

### 45. Validate Binary Search Tree

```
FUNCTION isValidBST(root):

    // A valid BST: left subtree contains ONLY values < node, right subtree ONLY > node
    // Simple recursive check with bounds: pass down the valid range for each subtree
    // Every node must be strictly within (min, max)

    RETURN validate(root, -INFINITY, +INFINITY)

FUNCTION validate(node, min, max):

    IF node is null:
        RETURN true   // Empty subtree is always valid

    IF node.val <= min OR node.val >= max:
        RETURN false  // Node value violates the allowed range

    // Recurse: left subtree has upper bound of current val
    //          right subtree has lower bound of current val
    RETURN validate(node.left, min, node.val)
       AND validate(node.right, node.val, max)
```

---

## Binary Search

---

### 46. Binary Search

```
FUNCTION search(nums, target):

    // Classic binary search on a sorted array
    // At each step, check the middle element and eliminate half the search space
    //   If middle == target: found it
    //   If middle < target: target must be in the right half
    //   If middle > target: target must be in the left half

    left = 0
    right = length(nums) - 1

    WHILE left <= right:
        mid = left + (right - left) / 2
        // Use (right-left)/2 instead of (left+right)/2 to avoid integer overflow

        IF nums[mid] == target:
            RETURN mid   // Found the target

        ELSE IF nums[mid] < target:
            left = mid + 1   // Target is in the right half — discard left

        ELSE:
            right = mid - 1  // Target is in the left half — discard right

    RETURN -1   // Target not found
```

---

### 47. Search in Rotated Sorted Array

```
FUNCTION search(nums, target):

    // The array was sorted then rotated — one half is always sorted
    // Use binary search but determine WHICH half is sorted, then check if target falls in it

    left = 0
    right = length(nums) - 1

    WHILE left <= right:
        mid = left + (right - left) / 2

        IF nums[mid] == target:
            RETURN mid   // Lucky — found at mid

        // Determine which half is sorted
        IF nums[left] <= nums[mid]:
            // Left half [left..mid] is sorted
            IF target >= nums[left] AND target < nums[mid]:
                right = mid - 1   // Target is in the sorted left half
            ELSE:
                left = mid + 1    // Target must be in the right half

        ELSE:
            // Right half [mid..right] is sorted
            IF target > nums[mid] AND target <= nums[right]:
                left = mid + 1    // Target is in the sorted right half
            ELSE:
                right = mid - 1   // Target must be in the left half

    RETURN -1
```

---

### 48. Task Scheduler

```
FUNCTION leastInterval(tasks, n):

    // Find the minimum number of CPU intervals to finish all tasks with cooldown n
    // Math-based solution:
    //   The most frequent task determines the structure of the schedule
    //   maxFreq = frequency of the most frequent task
    //   We need (maxFreq - 1) full "slots" of size (n + 1), plus the last partial slot
    //   The last partial slot contains all tasks with frequency == maxFreq (maxCount of them)
    //   However, if tasks are very diverse, we may not need any idle slots at all

    freq = array[26] of zeros
    FOR each task in tasks:
        freq[task - 'A']++   // Count frequency of each task

    maxFreq = MAX value in freq   // Most frequent task

    maxCount = 0
    FOR each f in freq:
        IF f == maxFreq:
            maxCount++   // Count how many tasks share the maximum frequency

    // Formula: (maxFreq - 1) full cycles × (n+1) slots + the final partial cycle
    calculated = (maxFreq - 1) * (n + 1) + maxCount

    // But we can never do fewer intervals than total tasks (even with 0 idle time)
    RETURN MAX(calculated, length(tasks))
```

---

### 49. Trapping Rain Water

```
FUNCTION trap(height):

    // Water trapped at position i = min(maxLeft, maxRight) - height[i]
    // Use two pointers from both ends, tracking the max seen on each side
    // Process the side with the smaller max — it's the constraint

    left = 0
    right = length(height) - 1
    leftMax = 0
    rightMax = 0
    water = 0

    WHILE left < right:
        IF height[left] < height[right]:
            // Left side is the bottleneck
            IF height[left] >= leftMax:
                leftMax = height[left]   // Update max seen from the left
            ELSE:
                water += leftMax - height[left]
                // Water trapped = how much below the left maximum this position is
            left++

        ELSE:
            // Right side is the bottleneck
            IF height[right] >= rightMax:
                rightMax = height[right]   // Update max seen from the right
            ELSE:
                water += rightMax - height[right]
                // Water trapped = how much below the right maximum this position is
            right--

    RETURN water
```

---

### 50. Sliding Window Maximum

```
FUNCTION maxSlidingWindow(nums, k):

    // Return the maximum value in each window of size k
    // Use a monotonic deque (double-ended queue) of INDICES
    // Deque maintains indices in decreasing order of their values
    // Front of deque is always the index of the maximum for the current window

    n = length(nums)
    result = array of size (n - k + 1)
    deque = empty deque   // Stores indices, front = index of current window's max

    FOR i = 0 TO n - 1:
        // Remove indices that are outside the current window
        WHILE deque is not empty AND deque.front < (i - k + 1):
            REMOVE from front of deque

        // Remove indices whose values are smaller than nums[i]
        // They'll never be the maximum while nums[i] is in the window
        WHILE deque is not empty AND nums[deque.back] < nums[i]:
            REMOVE from back of deque

        ADD i to back of deque   // Add current index

        IF i >= k - 1:
            // We have a full window — record the maximum (front of deque)
            result[i - k + 1] = nums[deque.front]

    RETURN result
```

---

## Matrix / 2D Grid

---

### 51. Flood Fill

```
FUNCTION floodFill(image, sr, sc, color):

    original = image[sr][sc]   // The color we're replacing

    IF original == color:
        RETURN image   // Already the target color — no change needed (avoids infinite loop)

    dfs(image, sr, sc, original, color)
    RETURN image

FUNCTION dfs(image, r, c, original, color):

    // Check boundary conditions and whether this cell should be filled
    IF r < 0 OR r >= rows OR c < 0 OR c >= cols:
        RETURN   // Out of bounds
    IF image[r][c] != original:
        RETURN   // This cell has a different color — do not fill

    image[r][c] = color   // Fill this cell with the new color

    // Recursively fill all 4-directional neighbors
    dfs(image, r + 1, c, original, color)   // Down
    dfs(image, r - 1, c, original, color)   // Up
    dfs(image, r, c + 1, original, color)   // Right
    dfs(image, r, c - 1, original, color)   // Left
```

---

### 52. Set Matrix Zeroes

```
FUNCTION setZeroes(matrix):

    // If a cell is 0, set its entire row and column to 0
    // To avoid using O(m+n) extra space, use the first row and column as markers

    m = rows, n = cols

    // Check if the first row or first column themselves contain zeros
    firstRowZero = any element in matrix[0][*] == 0
    firstColZero = any element in matrix[*][0] == 0

    // Use first row and column as flags for the rest of the matrix
    FOR i = 1 TO m-1:
        FOR j = 1 TO n-1:
            IF matrix[i][j] == 0:
                matrix[i][0] = 0   // Mark: this column should be zeroed
                matrix[0][j] = 0   // Mark: this row should be zeroed

    // Now zero out cells based on the flags in row 0 and col 0
    FOR i = 1 TO m-1:
        FOR j = 1 TO n-1:
            IF matrix[i][0] == 0 OR matrix[0][j] == 0:
                matrix[i][j] = 0

    // Handle the first row and first column themselves
    IF firstRowZero: set all of matrix[0][*] to 0
    IF firstColZero: set all of matrix[*][0] to 0
```

---

### 53. Spiral Matrix

```
FUNCTION spiralOrder(matrix):

    // Traverse the matrix in spiral order (right → down → left → up, repeat)
    // Use four boundary pointers and shrink them as each layer is traversed

    result = empty list
    top = 0, bottom = rows - 1
    left = 0, right = cols - 1

    WHILE top <= bottom AND left <= right:

        // Traverse top row: left to right
        FOR i = left TO right: ADD matrix[top][i]
        top++   // Top row is done, shrink boundary

        // Traverse right column: top to bottom
        FOR i = top TO bottom: ADD matrix[i][right]
        right--

        // Traverse bottom row: right to left (only if still valid)
        IF top <= bottom:
            FOR i = right DOWNTO left: ADD matrix[bottom][i]
            bottom--

        // Traverse left column: bottom to top (only if still valid)
        IF left <= right:
            FOR i = bottom DOWNTO top: ADD matrix[i][left]
            left++

    RETURN result
```

---

### 54. Rotate Image

```
FUNCTION rotate(matrix):

    // Rotate the n×n matrix 90 degrees clockwise in-place
    // Observation: 90° clockwise rotation = Transpose + Reverse each row
    //   Transpose: matrix[i][j] becomes matrix[j][i]
    //   Reverse rows: mirror each row horizontally

    n = length(matrix)

    // Step 1: Transpose the matrix (swap across the main diagonal)
    FOR i = 0 TO n - 1:
        FOR j = i + 1 TO n - 1:
            SWAP(matrix[i][j], matrix[j][i])
            // After transpose, column j becomes row j

    // Step 2: Reverse each row
    FOR i = 0 TO n - 1:
        left = 0, right = n - 1
        WHILE left < right:
            SWAP(matrix[i][left], matrix[i][right])
            left++
            right--
        // Reversing a row achieves the horizontal mirror needed for clockwise rotation
```

---

### 55. Search a 2D Matrix

```
FUNCTION searchMatrix(matrix, target):

    // The matrix is like a flattened sorted array: each row sorted, rows sorted top to bottom
    // Treat the entire matrix as a 1D sorted array and apply binary search
    // Index i in 1D maps to matrix[i / n][i % n] in 2D (where n = number of columns)

    m = rows, n = cols
    left = 0
    right = m * n - 1   // Total elements - 1

    WHILE left <= right:
        mid = left + (right - left) / 2

        // Convert 1D mid index to 2D coordinates
        row = mid / n
        col = mid % n
        val = matrix[row][col]

        IF val == target:
            RETURN true

        ELSE IF val < target:
            left = mid + 1   // Target is in the right half

        ELSE:
            right = mid - 1  // Target is in the left half

    RETURN false
```

---

## Graphs (BFS / DFS)

---

### 56. Number of Islands

```
FUNCTION numIslands(grid):

    // Count distinct islands (connected groups of '1's)
    // For each unvisited land cell ('1'), do DFS to mark the entire island as visited
    // Each time we start a new DFS, we've found a new island

    count = 0

    FOR i = 0 TO rows - 1:
        FOR j = 0 TO cols - 1:
            IF grid[i][j] == '1':
                // Found an unvisited land cell — it's the start of a new island
                dfs(grid, i, j)   // Mark all connected land cells as visited
                count++

    RETURN count

FUNCTION dfs(grid, r, c):

    // Boundary check and visited/water check
    IF r < 0 OR r >= rows OR c < 0 OR c >= cols OR grid[r][c] != '1':
        RETURN

    grid[r][c] = '0'   // Mark as visited by turning land into water

    // Explore all 4 directions to sink the entire island
    dfs(grid, r+1, c)
    dfs(grid, r-1, c)
    dfs(grid, r, c+1)
    dfs(grid, r, c-1)
```

---

### 57. Clone Graph

```
FUNCTION cloneGraph(node):

    // Deep copy the entire graph: each node and its neighbors
    // Use a HashMap to track already-cloned nodes to handle cycles

    visited = HashMap: original node -> clone node

    RETURN clone(node, visited)

FUNCTION clone(node, visited):

    IF node is null: RETURN null

    IF node EXISTS in visited:
        RETURN visited[node]   // Already cloned this node — return existing clone

    // Create a new clone for this node
    cloneNode = new Node(node.val)
    visited[node] = cloneNode
    // Store BEFORE recursing to handle cycles (prevents infinite loops)

    FOR each neighbor in node.neighbors:
        ADD clone(neighbor, visited) to cloneNode.neighbors
        // Recursively clone each neighbor

    RETURN cloneNode
```

---

### 58. Course Schedule (Cycle Detection)

```
FUNCTION canFinish(numCourses, prerequisites):

    // Return true if we can complete all courses (i.e., no circular dependency)
    // This is equivalent to: does the directed graph have a cycle?
    // Use DFS with 3 states: 0=unvisited, 1=currently visiting (in DFS stack), 2=done

    // Build adjacency list: course -> list of courses that depend on it
    adj = array of empty lists, size numCourses
    FOR each [course, prereq] in prerequisites:
        adj[prereq].add(course)   // prereq must be taken before course

    state = array[numCourses] of 0s   // All unvisited initially

    FOR i = 0 TO numCourses - 1:
        IF hasCycle(adj, state, i):
            RETURN false   // Cycle found — can't finish

    RETURN true

FUNCTION hasCycle(adj, state, node):

    IF state[node] == 1:
        RETURN true    // Re-visiting a node in current path — CYCLE!
    IF state[node] == 2:
        RETURN false   // Already fully processed — safe, no cycle here

    state[node] = 1   // Mark as "currently being explored"

    FOR each neighbor in adj[node]:
        IF hasCycle(adj, state, neighbor):
            RETURN true

    state[node] = 2   // Mark as "completely done"
    RETURN false
```

---

### 59. Number of Connected Components (Union-Find)

```
FUNCTION countComponents(n, edges):

    // Count connected components using Union-Find (Disjoint Set Union)
    // Each node starts in its own component
    // For each edge, union the two nodes — if they were in different components, count decreases

    parent = array where parent[i] = i   // Each node is its own parent initially
    components = n                        // Start with n separate components

    FOR each [u, v] in edges:
        p1 = find(parent, u)   // Find root/representative of u's component
        p2 = find(parent, v)   // Find root/representative of v's component

        IF p1 != p2:
            parent[p1] = p2    // Merge the two components
            components--        // One fewer distinct component

    RETURN components

FUNCTION find(parent, x):
    // Path compression: make every node point directly to root
    IF parent[x] != x:
        parent[x] = find(parent, parent[x])
    RETURN parent[x]
```

---

### 60. Rotting Oranges (Multi-Source BFS)

```
FUNCTION orangesRotting(grid):

    // Find minimum minutes until all fresh oranges rot
    // Use multi-source BFS: start from ALL rotten oranges simultaneously
    // Each BFS level = 1 minute passing

    queue = empty queue
    fresh = 0

    // Initialize: add all rotten oranges to queue, count fresh oranges
    FOR each cell (i, j):
        IF grid[i][j] == 2: ENQUEUE (i, j)   // Rotten orange — BFS source
        ELSE IF grid[i][j] == 1: fresh++      // Count fresh oranges

    IF fresh == 0: RETURN 0   // Already no fresh oranges

    dirs = [(1,0), (-1,0), (0,1), (0,-1)]   // 4-directional neighbors
    minutes = 0

    WHILE queue is not empty AND fresh > 0:
        minutes++   // One minute passes
        size = queue.size()

        FOR i = 0 TO size - 1:
            (r, c) = DEQUEUE

            FOR each direction (dr, dc) in dirs:
                nr = r + dr, nc = c + dc

                IF (nr, nc) is in bounds AND grid[nr][nc] == 1:
                    grid[nr][nc] = 2   // Fresh orange becomes rotten
                    fresh--
                    ENQUEUE (nr, nc)

    RETURN fresh == 0 ? minutes : -1
    // If fresh > 0, some oranges are unreachable — return -1
```

---

### 61. Pacific Atlantic Water Flow

```
FUNCTION pacificAtlantic(heights):

    // Find cells from which water can flow to BOTH oceans
    // Instead of forward simulation (water flowing down), work BACKWARDS:
    //   Start from the ocean borders and find which cells CAN reach each ocean
    //   (going uphill or equal — reverse of water flow direction)

    m = rows, n = cols

    pacific  = 2D boolean array (false)   // Can this cell reach Pacific?
    atlantic = 2D boolean array (false)   // Can this cell reach Atlantic?

    pacificQueue  = cells on top/left borders (they touch Pacific)
    atlanticQueue = cells on bottom/right borders (they touch Atlantic)

    // Mark border cells as reachable
    FOR i = 0 TO m-1:
        ADD (i, 0) to pacificQueue, pacific[i][0] = true
        ADD (i, n-1) to atlanticQueue, atlantic[i][n-1] = true
    FOR j = 0 TO n-1:
        ADD (0, j) to pacificQueue, pacific[0][j] = true
        ADD (m-1, j) to atlanticQueue, atlantic[m-1][j] = true

    // BFS from each ocean's border cells
    bfs(heights, pacificQueue, pacific)
    bfs(heights, atlanticQueue, atlantic)

    // Collect cells reachable by both oceans
    result = empty list
    FOR i = 0 TO m-1:
        FOR j = 0 TO n-1:
            IF pacific[i][j] AND atlantic[i][j]:
                ADD [i, j] to result

    RETURN result

FUNCTION bfs(heights, queue, visited):
    WHILE queue not empty:
        (r, c) = DEQUEUE
        FOR each neighbor (nr, nc):
            IF in bounds AND NOT visited AND heights[nr][nc] >= heights[r][c]:
                // Water can flow from (nr, nc) to (r, c) because neighbor is >= current
                visited[nr][nc] = true
                ENQUEUE (nr, nc)
```

---

## Heap / Priority Queue

---

### 62. Kth Largest Element

```
FUNCTION findKthLargest(nums, k):

    // Find the k-th largest element
    // Use a MIN-HEAP of size k:
    //   We keep only the k largest elements seen so far
    //   The minimum of those k elements is at the top of the min-heap
    //   After processing all elements, the top is the k-th largest

    minHeap = empty min priority queue

    FOR each num in nums:
        ADD num to minHeap

        IF size of minHeap > k:
            REMOVE top (minimum)   // Discard elements that are not in the top k

    RETURN minHeap.peek()
    // The smallest of the top-k elements = the k-th largest overall
```

---

### 63. Merge K Sorted Lists

```
FUNCTION mergeKLists(lists):

    // Merge k sorted linked lists into one sorted list
    // Use a MIN-HEAP to always extract the globally smallest node among all list heads
    // At each step, add the next node from the same list to maintain coverage

    minHeap = min priority queue ordered by node.val

    // Initialize heap with the head of each non-empty list
    FOR each list in lists:
        IF list is not null:
            ADD list head to minHeap

    dummy = new Node(0)   // Dummy head to simplify result building
    curr = dummy

    WHILE minHeap is not empty:
        node = REMOVE minimum from minHeap   // Globally smallest remaining node

        curr.next = node   // Append to result list
        curr = curr.next

        IF node.next is not null:
            ADD node.next to minHeap   // Add next node from the same list

    RETURN dummy.next
```

---

### 64. Find Median from Data Stream

```
CLASS MedianFinder:

    // Maintain two heaps:
    //   maxHeap: stores the lower half of numbers (max at top)
    //   minHeap: stores the upper half of numbers (min at top)
    // Invariant: maxHeap.size() >= minHeap.size() (by 0 or 1 element)
    // Median is:
    //   If sizes equal: average of both tops
    //   If maxHeap has one more: top of maxHeap

    maxHeap = empty max-heap   // Lower half
    minHeap = empty min-heap   // Upper half

    FUNCTION addNum(num):
        // Step 1: Push to maxHeap first (ensures proper ordering)
        ADD num to maxHeap

        // Step 2: Balance — ensure maxHeap's max is <= minHeap's min
        ADD (REMOVE top of maxHeap) to minHeap
        // This pushes the largest from lower half to upper half

        // Step 3: Maintain size property: maxHeap should be >= minHeap in size
        IF size(maxHeap) < size(minHeap):
            ADD (REMOVE top of minHeap) to maxHeap

    FUNCTION findMedian():
        IF size(maxHeap) > size(minHeap):
            RETURN maxHeap.peek()            // Odd count — middle is maxHeap's top
        RETURN (maxHeap.peek() + minHeap.peek()) / 2.0  // Even count — average of two middles
```

---

### 65. K Closest Points to Origin

```
FUNCTION kClosest(points, k):

    // Find k points closest to origin (0,0)
    // Distance = sqrt(x²+y²), but we can compare x²+y² (no need for sqrt)
    // Use a MAX-HEAP of size k:
    //   Keep the k closest points seen so far
    //   Max-heap ensures the farthest of the current top-k is at the top
    //   If a new point is closer than the farthest, swap them out

    maxHeap = max priority queue ordered by distance descending (i.e., farther = higher priority)

    FOR each point in points:
        ADD point to maxHeap

        IF size > k:
            REMOVE top   // Remove the farthest point — it's not in top k closest

    RETURN all points in maxHeap as array
```

---

## Dynamic Programming

---

### 66. Climbing Stairs

```
FUNCTION climbStairs(n):

    // Number of ways to climb n stairs taking 1 or 2 steps at a time
    // This is exactly Fibonacci: ways(n) = ways(n-1) + ways(n-2)
    //   Because last step was either 1 step from (n-1) or 2 steps from (n-2)
    // Use space-optimized DP with only two variables

    IF n <= 1: RETURN 1   // Only 1 way to climb 0 or 1 step

    prev2 = 1   // ways(0) = 1
    prev1 = 1   // ways(1) = 1

    FOR i = 2 TO n:
        curr = prev1 + prev2   // ways(i) = ways(i-1) + ways(i-2)
        prev2 = prev1
        prev1 = curr

    RETURN prev1   // ways(n)
```

---

### 67. House Robber

```
FUNCTION rob(nums):

    // Max money without robbing two adjacent houses
    // DP: dp[i] = max money up to house i
    // At each house, choose: rob it (prev2 + nums[i]) or skip it (prev1)

    prev2 = 0   // Max money if we consider up to house (i-2)
    prev1 = 0   // Max money if we consider up to house (i-1)

    FOR each num in nums:
        curr = MAX(prev1, prev2 + num)
        // Option 1: Skip this house, keep best from previous (prev1)
        // Option 2: Rob this house, add to best from two houses ago (prev2 + num)
        // We can't use prev1 + num because that would mean robbing adjacent houses
        prev2 = prev1
        prev1 = curr

    RETURN prev1
```

---

### 68. Coin Change

```
FUNCTION coinChange(coins, amount):

    // Find minimum coins to make the exact amount
    // DP: dp[i] = min coins to make amount i
    // For each amount from 1 to amount, try every coin

    dp = array of size (amount + 1) filled with (amount + 1)
    // Initialize with a value larger than any real answer (infinity-like)
    dp[0] = 0   // Base case: 0 coins needed to make amount 0

    FOR i = 1 TO amount:
        FOR each coin in coins:
            IF coin <= i:
                dp[i] = MIN(dp[i], dp[i - coin] + 1)
                // If we use this coin, we need 1 + coins needed for (i - coin)

    RETURN dp[amount] if dp[amount] <= amount ELSE -1
    // If dp[amount] wasn't updated from its initial value, amount is impossible
```

---

### 69. Longest Increasing Subsequence (LIS)

```
FUNCTION lengthOfLIS(nums):

    // Find length of the longest strictly increasing subsequence
    // Patience sorting (binary search approach) — O(N log N)
    // Maintain a "sub" list where sub[i] is the smallest tail element of
    //   all increasing subsequences of length (i+1)
    // For each number, binary search for its position in sub

    sub = empty list   // Represents the "patience pile" tails

    FOR each num in nums:
        // Binary search: find the leftmost position in sub where sub[pos] >= num
        lo = 0, hi = length(sub)
        WHILE lo < hi:
            mid = (lo + hi) / 2
            IF sub[mid] < num:
                lo = mid + 1   // num can extend beyond this position
            ELSE:
                hi = mid

        IF lo == length(sub):
            APPEND num to sub   // num extends the longest subsequence found so far
        ELSE:
            sub[lo] = num
            // Replace: a smaller tail at this length enables longer extensions in future

    RETURN length(sub)   // Length of the LIS
```

---

### 70. 0/1 Knapsack

```
FUNCTION knapsack(weights, values, W):

    // Maximize total value of items fitting in a knapsack of capacity W
    // Each item can be taken at most once (0/1 constraint)
    // DP: dp[w] = max value achievable with capacity w
    // Process items one by one; iterate capacity BACKWARDS to avoid using same item twice

    n = length(weights)
    dp = array of size (W + 1) filled with 0

    FOR i = 0 TO n - 1:
        FOR w = W DOWNTO weights[i]:
            // Backwards iteration ensures each item is considered only once
            // (if we went forwards, we might use the same item multiple times)
            dp[w] = MAX(dp[w], dp[w - weights[i]] + values[i])
            // Either don't take item i (dp[w]) or take it (dp[w - weight] + value)

    RETURN dp[W]
```

---

### 71. Longest Common Subsequence (LCS)

```
FUNCTION longestCommonSubsequence(text1, text2):

    // Find length of longest subsequence common to both strings
    // DP: dp[i][j] = LCS length of text1[0..i-1] and text2[0..j-1]

    m = length(text1), n = length(text2)
    dp = 2D array (m+1) x (n+1) filled with 0
    // dp[0][*] and dp[*][0] are 0 (LCS with empty string is 0)

    FOR i = 1 TO m:
        FOR j = 1 TO n:
            IF text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
                // Characters match — extend the LCS found for shorter prefixes

            ELSE:
                dp[i][j] = MAX(dp[i-1][j], dp[i][j-1])
                // Characters don't match — take best from skipping one character
                // from either string (whichever gives longer LCS)

    RETURN dp[m][n]
```

---

### 72. Unique Paths

```
FUNCTION uniquePaths(m, n):

    // Count paths from top-left to bottom-right moving only right or down
    // DP: dp[j] = number of ways to reach current row, column j
    // Each cell = paths from left cell + paths from above cell
    // Space-optimized: use 1D array (reuse the same row)

    dp = array of size n filled with 1
    // First row: only 1 way to reach each cell (move right all the way)

    FOR i = 1 TO m - 1:
        FOR j = 1 TO n - 1:
            dp[j] += dp[j - 1]
            // dp[j] (above) + dp[j-1] (left in current row)
            // After update: dp[j] = ways to reach cell (i, j)

    RETURN dp[n - 1]
```

---

### 73. Jump Game

```
FUNCTION canJump(nums):

    // Can we reach the last index from index 0?
    // Greedy: track the maximum reachable index at each step
    // If at any point the current index exceeds maxReach, we're stuck

    maxReach = 0   // Farthest index we can currently reach

    FOR i = 0 TO length(nums) - 1:
        IF i > maxReach:
            RETURN false   // We can't even reach index i — stuck!

        maxReach = MAX(maxReach, i + nums[i])
        // From index i, we can jump up to nums[i] steps forward
        // Update the farthest point reachable

    RETURN true   // We successfully traversed to the end
```

---

### 74. Word Break

```
FUNCTION wordBreak(s, wordDict):

    // Can string s be segmented into words from the dictionary?
    // DP: dp[i] = true if s[0..i-1] can be segmented using dictionary words
    // For each position i, try all substrings ending at i

    dict = HashSet(wordDict)   // For O(1) lookup
    n = length(s)
    dp = array of size (n + 1) of false
    dp[0] = true   // Empty string is always valid (base case)

    FOR i = 1 TO n:
        FOR j = 0 TO i - 1:
            IF dp[j] AND dict.contains(s[j..i-1]):
                // s[0..j-1] is segmentable AND s[j..i-1] is a dictionary word
                dp[i] = true
                BREAK   // No need to check further j values for this i

    RETURN dp[n]
```

---

### 75. Maximum Product Subarray

```
FUNCTION maxProduct(nums):

    // Find the contiguous subarray with the largest product
    // Tricky because negatives can flip max to min and vice versa
    // Track BOTH the current max and current min product ending at each position
    // When we hit a negative number, swap max and min before multiplying

    maxProd = nums[0]   // Overall best product
    minProd = nums[0]   // Needed to track negatives (min can become max after another negative)
    result = nums[0]

    FOR i = 1 TO length(nums) - 1:
        IF nums[i] < 0:
            SWAP(maxProd, minProd)
            // Multiplying by a negative flips max and min
            // So swap them before extending

        maxProd = MAX(nums[i], maxProd * nums[i])
        // Either start fresh at nums[i], or extend the previous best product
        minProd = MIN(nums[i], minProd * nums[i])

        result = MAX(result, maxProd)

    RETURN result
```

---

### 76. Decode Ways

```
FUNCTION numDecodings(s):

    // Count ways to decode a digit string where '1'-'26' map to 'A'-'Z'
    // DP: dp[i] = number of ways to decode s[0..i-1]
    // At each position, try decoding 1 digit or 2 digits

    n = length(s)
    prev2 = 1                              // dp[0] — empty prefix has 1 way
    prev1 = s[0] != '0' ? 1 : 0           // dp[1] — single digit valid only if not '0'

    FOR i = 1 TO n - 1:
        curr = 0

        oneDigit = s[i] - '0'
        IF oneDigit != 0:
            curr += prev1
            // Decoding just s[i] as a single digit (valid if it's not '0')

        twoDigit = number formed by s[i-1] and s[i]
        IF twoDigit >= 10 AND twoDigit <= 26:
            curr += prev2
            // Decoding s[i-1..i] as a two-digit number (valid range: 10-26)

        prev2 = prev1
        prev1 = curr

    RETURN prev1
```

---

## Backtracking

---

### 77. Subsets

```
FUNCTION subsets(nums):

    // Generate all possible subsets (power set) of nums
    // Backtracking: at each step, choose to include or not include the current element
    // Start index prevents repeating elements (ensures each subset is unique)

    result = empty list
    backtrack(nums, startIndex=0, current=[], result)
    RETURN result

FUNCTION backtrack(nums, start, current, result):

    ADD copy of current to result
    // Add the current subset BEFORE exploring further (captures every valid prefix)

    FOR i = start TO length(nums) - 1:
        ADD nums[i] to current         // Choose nums[i] to be in the subset
        backtrack(nums, i + 1, current, result)   // Explore subsets with nums[i] included
        REMOVE last element from current           // Undo choice (backtrack)
        // This allows exploring subsets WITHOUT nums[i] in the next iteration
```

---

### 78. Permutations

```
FUNCTION permute(nums):

    // Generate all permutations of nums (all orderings)
    // Use a "used" boolean array to avoid reusing elements

    result = empty list
    backtrack(nums, used=boolean[n] all false, current=[], result)
    RETURN result

FUNCTION backtrack(nums, used, current, result):

    IF length(current) == length(nums):
        ADD copy of current to result   // Found a complete permutation
        RETURN

    FOR i = 0 TO length(nums) - 1:
        IF used[i]: CONTINUE   // Skip already used elements

        used[i] = true                     // Mark element as used
        ADD nums[i] to current             // Place nums[i] at next position
        backtrack(nums, used, current, result)
        REMOVE last from current           // Undo placement (backtrack)
        used[i] = false                    // Unmark so it can be reused in other branches
```

---

### 79. Combination Sum

```
FUNCTION combinationSum(candidates, target):

    // Find all unique combinations that sum to target
    // Same candidate can be used multiple times (unlimited)
    // Use backtracking; pass the SAME start index when recursing (allows reuse)

    result = empty list
    backtrack(candidates, target, start=0, current=[], result)
    RETURN result

FUNCTION backtrack(candidates, remaining, start, current, result):

    IF remaining == 0:
        ADD copy of current to result   // Exact sum achieved — valid combination
        RETURN

    FOR i = start TO length(candidates) - 1:
        IF candidates[i] > remaining:
            CONTINUE   // Pruning: this candidate is too large, skip it

        ADD candidates[i] to current
        backtrack(candidates, remaining - candidates[i], i, current, result)
        // Pass i (not i+1) so same candidate can be reused

        REMOVE last from current   // Backtrack
```

---

### 80. Letter Combinations of a Phone Number

```
FUNCTION letterCombinations(digits):

    // Map each digit to its phone keypad letters
    // Use backtracking to build combinations letter by letter

    IF digits is empty: RETURN []

    phoneMap = {2:"abc", 3:"def", 4:"ghi", 5:"jkl", 6:"mno", 7:"pqrs", 8:"tuv", 9:"wxyz"}
    result = empty list

    backtrack(digits, index=0, current=StringBuilder(), result, phoneMap)
    RETURN result

FUNCTION backtrack(digits, index, current, result, phoneMap):

    IF index == length(digits):
        ADD current.toString() to result   // Processed all digits — complete combination
        RETURN

    lettersForCurrentDigit = phoneMap[digits[index]]

    FOR each letter in lettersForCurrentDigit:
        APPEND letter to current
        backtrack(digits, index + 1, current, result, phoneMap)
        // Recurse for the next digit
        REMOVE last character from current   // Backtrack — undo the letter choice
```

---

### 81. Generate Parentheses

```
FUNCTION generateParenthesis(n):

    // Generate all valid combinations of n pairs of parentheses
    // At each step, we can either:
    //   (a) Add '(' if we haven't used all n open brackets yet
    //   (b) Add ')' if there are more open brackets than close brackets so far

    result = empty list
    backtrack(result, current="", open=0, close=0, max=n)
    RETURN result

FUNCTION backtrack(result, current, open, close, max):

    IF length(current) == max * 2:
        ADD current to result   // Used exactly n open and n close brackets
        RETURN

    IF open < max:
        backtrack(result, current + "(", open + 1, close, max)
        // Can still add open bracket — we haven't placed all n yet

    IF close < open:
        backtrack(result, current + ")", open, close + 1, max)
        // Can add close bracket only if there's an unmatched open bracket
        // (close < open ensures we never have more ')' than '(')
```

---

### 82. N-Queens

```
FUNCTION solveNQueens(n):

    // Place n queens on n×n board such that no two attack each other
    // Use backtracking: place one queen per row, track attacked columns and diagonals

    result = empty list
    board = n×n array filled with '.'
    backtrack(board, row=0, cols={}, diag1={}, diag2={}, result)
    RETURN result

FUNCTION backtrack(board, row, cols, diag1, diag2, result):
    // cols:  set of occupied columns
    // diag1: set of occupied (row - col) diagonals (top-left to bottom-right)
    // diag2: set of occupied (row + col) diagonals (top-right to bottom-left)

    IF row == n:
        ADD snapshot of board to result   // All n rows placed — valid solution
        RETURN

    FOR col = 0 TO n - 1:
        d1 = row - col   // Diagonal identifier
        d2 = row + col   // Anti-diagonal identifier

        IF col IN cols OR d1 IN diag1 OR d2 IN diag2:
            CONTINUE   // This square is attacked — skip

        // Place queen at (row, col)
        board[row][col] = 'Q'
        ADD col to cols, d1 to diag1, d2 to diag2

        backtrack(board, row + 1, cols, diag1, diag2, result)

        // Undo placement (backtrack)
        board[row][col] = '.'
        REMOVE col from cols, d1 from diag1, d2 from diag2
```

---

## Additional Must-Know: Trees (Extended)

---

### 83. Binary Tree Path Sum

```
FUNCTION hasPathSum(root, targetSum):

    // Check if any root-to-leaf path sums to targetSum
    // Recursively reduce target as we go down — if we reach a leaf with 0 remaining, success

    IF root is null:
        RETURN false   // Reached an empty node — no valid path here

    IF root.left is null AND root.right is null:
        // We're at a leaf node
        RETURN root.val == targetSum
        // Check if the leaf's value exactly uses up the remaining target

    // Recurse: subtract current node's value and check both subtrees
    RETURN hasPathSum(root.left, targetSum - root.val)
        OR hasPathSum(root.right, targetSum - root.val)
```

---

### 84. Diameter of Binary Tree

```
FUNCTION diameterOfBinaryTree(root):

    // The diameter is the longest path between any two nodes (not necessarily through root)
    // At each node, the diameter through that node = left depth + right depth
    // Use DFS to compute depths and update global max diameter simultaneously

    maxDiameter = 0   // Will be updated during DFS

    depth(root)   // DFS computes depth and updates maxDiameter as side effect

    RETURN maxDiameter

FUNCTION depth(node):

    IF node is null:
        RETURN 0   // Empty subtree has depth 0

    left = depth(node.left)    // Depth of left subtree
    right = depth(node.right)  // Depth of right subtree

    maxDiameter = MAX(maxDiameter, left + right)
    // The longest path through this node spans left + right edges
    // Update global maximum if this is bigger

    RETURN 1 + MAX(left, right)
    // Return depth of this node = 1 (for this node) + deeper of two subtrees
```

---

### 85. Symmetric Tree

```
FUNCTION isSymmetric(root):

    // A tree is symmetric if it's a mirror of itself
    // Check recursively by comparing mirrored pairs of nodes

    RETURN isMirror(root, root)

FUNCTION isMirror(t1, t2):

    IF t1 is null AND t2 is null:
        RETURN true    // Both sides are empty — symmetric at this position

    IF t1 is null OR t2 is null:
        RETURN false   // One side is empty and the other isn't — asymmetric

    RETURN (t1.val == t2.val)
        AND isMirror(t1.left, t2.right)
        // Left's left subtree should mirror Right's right subtree
        AND isMirror(t1.right, t2.left)
        // Left's right subtree should mirror Right's left subtree
```

---

### 86. Binary Tree Zigzag Level Order Traversal

```
FUNCTION zigzagLevelOrder(root):

    // Level order traversal but alternating direction each level
    // Level 1: left to right, Level 2: right to left, Level 3: left to right...

    result = empty list
    IF root is null: RETURN result

    queue = new Queue
    ENQUEUE root
    leftToRight = true   // Direction flag for current level

    WHILE queue not empty:
        size = queue.size()
        level = new LinkedList   // Using LinkedList allows addFirst and addLast

        FOR i = 0 TO size - 1:
            node = DEQUEUE

            IF leftToRight:
                level.addLast(node.val)    // Normal order
            ELSE:
                level.addFirst(node.val)   // Reversed order (add to front)

            IF node.left: ENQUEUE node.left
            IF node.right: ENQUEUE node.right

        ADD level to result
        leftToRight = !leftToRight   // Flip direction for next level

    RETURN result
```

---

### 87. Construct Binary Tree from Preorder and Inorder Traversal

```
FUNCTION buildTree(preorder, inorder):

    // Preorder: [root, left subtree, right subtree]
    // Inorder:  [left subtree, root, right subtree]
    // Key insight:
    //   preorder[0] is always the ROOT of the current subtree
    //   Find that root in inorder to split it into left/right portions

    // Build inorder index map for O(1) lookup
    inorderIndex = HashMap: value -> index in inorder
    FOR i = 0 TO length(inorder) - 1:
        inorderIndex[inorder[i]] = i

    RETURN build(preorder, 0, length(preorder)-1, 0)

FUNCTION build(preorder, preLeft, preRight, inLeft):

    IF preLeft > preRight:
        RETURN null   // No more nodes to place

    rootVal = preorder[preLeft]   // First element of preorder slice is the root
    root = new TreeNode(rootVal)

    mid = inorderIndex[rootVal]   // Position of root in inorder
    leftSize = mid - inLeft       // Number of nodes in the left subtree

    // Recursively build left subtree
    root.left = build(preorder, preLeft + 1, preLeft + leftSize, inLeft)

    // Recursively build right subtree (starts after left subtree in both arrays)
    root.right = build(preorder, preLeft + leftSize + 1, preRight, mid + 1)

    RETURN root
```

---

## Additional Must-Know: Linked List (Extended)

---

### 88. Reorder List

```
FUNCTION reorderList(head):

    // Reorder: L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → ...
    // Three-step approach:
    //   Step 1: Find the middle (split list in two halves)
    //   Step 2: Reverse the second half
    //   Step 3: Merge the two halves alternately

    // Step 1: Find middle using slow/fast pointers
    slow = head, fast = head
    WHILE fast.next != null AND fast.next.next != null:
        slow = slow.next
        fast = fast.next.next
    // slow is now at the middle

    // Step 2: Reverse the second half (starting from slow.next)
    prev = null
    curr = slow.next
    slow.next = null   // Disconnect the two halves

    WHILE curr != null:
        next = curr.next
        curr.next = prev
        prev = curr
        curr = next
    // prev is the head of the reversed second half

    // Step 3: Merge two halves alternately
    first = head
    second = prev

    WHILE second != null:
        tmp1 = first.next
        tmp2 = second.next
        first.next = second       // Insert second half's node
        second.next = tmp1        // Point second's next to first half's continuation
        first = tmp1              // Advance first pointer
        second = tmp2             // Advance second pointer
```

---

### 89. Palindrome Linked List

```
FUNCTION isPalindrome(head):

    // Check if the linked list reads the same forwards and backwards
    // Do it in O(N) time, O(1) space:
    //   Step 1: Find the middle of the list
    //   Step 2: Reverse the second half
    //   Step 3: Compare first half with reversed second half

    // Step 1: Find middle
    slow = head, fast = head
    WHILE fast != null AND fast.next != null:
        slow = slow.next
        fast = fast.next.next
    // slow is now at the start of the second half

    // Step 2: Reverse second half
    prev = null
    WHILE slow != null:
        next = slow.next
        slow.next = prev
        prev = slow
        slow = next
    // prev is now the head of the reversed second half

    // Step 3: Compare both halves
    left = head
    right = prev
    WHILE right != null:
        IF left.val != right.val:
            RETURN false   // Mismatch — not a palindrome
        left = left.next
        right = right.next

    RETURN true
```

---

## Additional Must-Know: Binary Search (Extended)

---

### 90. Find Minimum in Rotated Sorted Array

```
FUNCTION findMin(nums):

    // Find the minimum in a rotated sorted array in O(log n)
    // Key observation: the minimum is always in the "rotated" (unsorted) half
    // Compare mid with right:
    //   If nums[mid] > nums[right]: rotation point is in the right half (min is there)
    //   If nums[mid] <= nums[right]: min is in the left half (including mid)

    left = 0
    right = length(nums) - 1

    WHILE left < right:
        mid = left + (right - left) / 2

        IF nums[mid] > nums[right]:
            left = mid + 1
            // mid is in the larger "left side" of the rotation — min must be to the right

        ELSE:
            right = mid
            // mid is in the smaller "right side" — min is at mid or to its left

    RETURN nums[left]   // left == right at this point — that's the minimum
```

---

### 91. First Bad Version

```
FUNCTION firstBadVersion(n):

    // Binary search for the first bad version
    // All versions from the first bad one onwards are bad
    // So we want the LEFTMOST position where isBadVersion returns true

    left = 1
    right = n

    WHILE left < right:
        mid = left + (right - left) / 2   // Avoid overflow

        IF isBadVersion(mid):
            right = mid
            // mid is bad — the first bad version could be mid or to the left
        ELSE:
            left = mid + 1
            // mid is good — first bad version must be to the right

    RETURN left
    // left == right, pointing to the first bad version
```

---

### 92. Capacity to Ship Packages Within D Days

```
FUNCTION shipWithinDays(weights, days):

    // Binary search on the answer (the ship capacity)
    // Lower bound: must be at least the heaviest single package (can't split packages)
    // Upper bound: sum of all weights (ship everything in one day)
    // For a given capacity, check if we can ship within 'days' days

    left = MAX(weights)    // Minimum possible capacity
    right = SUM(weights)   // Maximum possible capacity (1 day shipping)

    WHILE left < right:
        mid = left + (right - left) / 2

        IF canShip(weights, days, mid):
            right = mid     // mid capacity works — try smaller
        ELSE:
            left = mid + 1  // mid capacity doesn't work — need more

    RETURN left

FUNCTION canShip(weights, days, capacity):
    // Simulate: greedily load packages each day without exceeding capacity

    daysNeeded = 1   // Start with day 1
    currentLoad = 0

    FOR each weight in weights:
        IF currentLoad + weight > capacity:
            daysNeeded++     // Start a new day
            currentLoad = 0  // Reset load for the new day

        currentLoad += weight

    RETURN daysNeeded <= days
    // If days needed is within the allowed days, this capacity works
```

---

## Arrays / Hashing (Extended)

---

### 93. Longest Consecutive Sequence

```
FUNCTION longestConsecutive(nums):

    // We need O(N) — sorting would be O(N log N), so use a HashSet
    // KEY INSIGHT: a consecutive sequence starting at X has X-1 NOT in the set
    //   So for each number, only start counting if it's the BEGINNING of a sequence
    //   This prevents recounting the same sequence from the middle

    SET = HashSet containing all nums   // O(1) lookup for any number

    maxLen = 0

    FOR each n in SET:
        IF (n - 1) NOT IN SET:
            // n is the start of a new sequence (no predecessor)
            len = 1

            WHILE (n + len) IS IN SET:
                len++   // Extend sequence: n, n+1, n+2, ...

            maxLen = MAX(maxLen, len)

    RETURN maxLen
    // Each number is visited at most twice total → O(N)
```

---

### 94. Find the Duplicate Number

```
FUNCTION findDuplicate(nums):

    // Array has n+1 numbers all in range [1..n] — treat as a linked list
    // Index i points to node i, which links to node nums[i]
    // Because values are in [1..n], index 0 is the only entry point (no value maps to 0)
    // The duplicate number creates a cycle — use Floyd's cycle detection

    // Phase 1: Detect the cycle
    slow = nums[0]
    fast = nums[0]

    DO:
        slow = nums[slow]           // 1 step
        fast = nums[nums[fast]]     // 2 steps
    WHILE slow != fast             // They meet inside the cycle

    // Phase 2: Find where the cycle STARTS (= the duplicate number)
    slow = nums[0]   // Reset slow to start (entry point of the entire traversal)

    WHILE slow != fast:
        slow = nums[slow]   // Both now move 1 step at a time
        fast = nums[fast]   // They meet at the cycle entry = duplicate number

    RETURN slow
    // Mathematical proof: distance from entry to cycle start = distance from head to cycle start
```

---

### 95. Squares of a Sorted Array

```
FUNCTION sortedSquares(nums):

    // Squares of negative numbers can be larger than squares of positives
    // The largest squares are always at the ENDS of the sorted array (most negative or most positive)
    // Use two pointers from both ends, filling the result from the back

    n = length(nums)
    result = array of size n
    left = 0
    right = n - 1
    pos = n - 1     // Fill result from the rightmost position (largest values go last)

    WHILE left <= right:
        lSq = nums[left]  * nums[left]    // Square of leftmost element
        rSq = nums[right] * nums[right]   // Square of rightmost element

        IF lSq > rSq:
            result[pos] = lSq   // Left element's square is larger
            left++
        ELSE:
            result[pos] = rSq   // Right element's square is larger (or equal)
            right--

        pos--   // Next position to fill (moving left, towards smaller values)

    RETURN result
```

---

## Two Pointers (Extended)

---

### 96. Two Sum II — Input Array Is Sorted

```
FUNCTION twoSum(numbers, target):

    // Array is already sorted — we can use two pointers instead of a HashMap
    // Left pointer at smallest, right pointer at largest
    // If sum is too small, move left pointer right (get a bigger number)
    // If sum is too large, move right pointer left (get a smaller number)
    // This is O(1) space vs HashMap's O(N)

    left = 0
    right = length(numbers) - 1

    WHILE left < right:
        sum = numbers[left] + numbers[right]

        IF sum == target:
            RETURN [left + 1, right + 1]   // 1-indexed answer

        ELSE IF sum < target:
            left++    // Sum too small — increase it by moving to a larger value

        ELSE:
            right--   // Sum too large — decrease it by moving to a smaller value

    RETURN []
```

> **Variation of Two Sum #1:** Unsorted array → use HashMap (original Two Sum, problem 1)
> **Change:** No sorting or two-pointer; use `map[complement] = i` approach instead.

---

## Stack / Queue (Extended)

---

### 97. Evaluate Reverse Polish Notation

```
FUNCTION evalRPN(tokens):

    // In RPN (postfix), operators come AFTER their operands
    // A stack is natural: push numbers, when we hit an operator pop two numbers and push result

    stack = empty stack

    FOR each token in tokens:
        IF token is a NUMBER:
            PUSH integer value of token   // Store operand for later

        ELSE:
            // It's an operator — pop the two most recent operands
            b = POP from stack   // Second operand (popped first = right operand)
            a = POP from stack   // First operand (popped second = left operand)

            IF token == "+": PUSH a + b
            IF token == "-": PUSH a - b   // Note: a - b (not b - a), order matters
            IF token == "*": PUSH a * b
            IF token == "/": PUSH a / b   // Integer division truncates toward zero

    RETURN top of stack   // The single remaining value is the result
```

---

### 98. Decode String

```
FUNCTION decodeString(s):

    // Pattern: k[string] — repeat string k times
    // Use two stacks: one for repeat counts, one for string built so far
    // When '[' is seen, push current state; when ']', pop and repeat

    countStack = empty stack    // Stores pending repeat counts
    strStack   = empty stack    // Stores partially built strings before each '['
    current    = empty string   // Current string being built
    k          = 0              // Current number being parsed (supports multi-digit like "12[")

    FOR each char c in s:
        IF c is a digit:
            k = k * 10 + (c - '0')
            // Accumulate digits: "12[" → k becomes 1 then 12

        ELSE IF c == '[':
            PUSH k onto countStack       // Save the repeat count for this bracket level
            PUSH current onto strStack   // Save string built so far before this bracket
            current = ""                 // Start fresh inside the bracket
            k = 0                        // Reset for the next number

        ELSE IF c == ']':
            times = POP from countStack
            prev  = POP from strStack
            current = prev + (current repeated times)
            // Expand the bracketed content and prepend what was before it

        ELSE:
            current += c   // Regular character — just append to current string

    RETURN current
```

---

## Trees / BFS / DFS (Extended)

---

### 99. Balanced Binary Tree

```
FUNCTION isBalanced(root):

    // A tree is balanced if for EVERY node, |left height - right height| <= 1
    // Naive approach: compute height at each node separately → O(N²)
    // Optimized: return -1 as a sentinel value meaning "already imbalanced"
    //   This propagates the imbalance upward without re-traversal → O(N)

    RETURN checkHeight(root) != -1

FUNCTION checkHeight(node):

    IF node is null:
        RETURN 0   // Empty subtree has height 0 — valid

    left  = checkHeight(node.left)
    right = checkHeight(node.right)

    IF left == -1 OR right == -1:
        RETURN -1   // Imbalance was detected below — propagate the sentinel upward

    IF ABS(left - right) > 1:
        RETURN -1   // This node itself is imbalanced

    RETURN 1 + MAX(left, right)   // Return actual height for the parent to use
```

---

### 100. Binary Tree Right Side View

```
FUNCTION rightSideView(root):

    // The "right side view" = the last visible node at each level
    // Use BFS (level order traversal) and take only the LAST node from each level

    result = empty list
    IF root is null: RETURN result

    queue = new Queue
    ENQUEUE root

    WHILE queue is not empty:
        size = queue.size()   // Number of nodes at this level

        FOR i = 0 TO size - 1:
            node = DEQUEUE

            IF i == size - 1:
                ADD node.val to result   // Last node at this level = rightmost visible

            // Enqueue children for next level
            IF node.left  != null: ENQUEUE node.left
            IF node.right != null: ENQUEUE node.right

    RETURN result
```

> **Variation — Left Side View:**
> **Change:** Record `i == 0` (first node of each level) instead of `i == size - 1`.

---

### 101. Kth Smallest Element in a BST

```
FUNCTION kthSmallest(root, k):

    // In a BST, inorder traversal (Left → Root → Right) gives nodes in sorted ascending order
    // So the k-th node visited in inorder traversal is the k-th smallest element
    // Stop early once we've visited k nodes — no need to traverse the whole tree

    count  = 0   // How many nodes visited so far
    result = 0   // The answer

    inorder(root, k)
    RETURN result

FUNCTION inorder(node, k):

    IF node is null: RETURN

    inorder(node.left, k)   // Visit all smaller nodes first

    count++
    IF count == k:
        result = node.val   // Found the k-th smallest
        RETURN              // Stop — no need to continue

    inorder(node.right, k)
```

> **Variation — Kth Largest in BST:**
> **Change:** Do REVERSE inorder (Right → Root → Left) instead. Everything else stays the same.

---

## Intervals

---

### 102. Merge Intervals

```
FUNCTION merge(intervals):

    // Sort by start time so overlapping intervals are adjacent
    // Scan left to right: if current interval overlaps with the previous one, merge them
    // Two intervals overlap if: next.start <= current.end

    SORT intervals by start time (intervals[i][0])

    result = empty list
    current = intervals[0]   // Start with the first interval as our "open" interval

    FOR i = 1 TO length(intervals) - 1:
        IF intervals[i][0] <= current[1]:
            // Overlap detected — merge by extending the end time
            current[1] = MAX(current[1], intervals[i][1])
            // Take the larger end (handles one interval fully inside another)

        ELSE:
            // No overlap — the current interval is complete, save it
            ADD current to result
            current = intervals[i]   // Start tracking the new interval

    ADD current to result   // Don't forget the last open interval

    RETURN result
```

> **Variation — Meeting Rooms (can one person attend all meetings?):**
> **Change:** Sort by start. Check if any `intervals[i][0] < intervals[i-1][1]` (overlap). If yes, return false.

> **Variation — Meeting Rooms II (minimum rooms needed):**
> **Change:** Use a min-heap of end times. For each interval sorted by start, if earliest end <= current start, reuse that room (pop). Otherwise add a new room. Answer = heap size.

---

### 103. Insert Interval

```
FUNCTION insert(intervals, newInterval):

    // Three phases:
    //   Phase 1: Add all intervals that END before newInterval STARTS (no overlap)
    //   Phase 2: Merge all intervals that OVERLAP with newInterval
    //   Phase 3: Add all remaining intervals after newInterval

    result = empty list
    i = 0
    n = length(intervals)

    // Phase 1: Intervals completely before newInterval (end < new start)
    WHILE i < n AND intervals[i][1] < newInterval[0]:
        ADD intervals[i] to result
        i++

    // Phase 2: Merge overlapping intervals into newInterval
    WHILE i < n AND intervals[i][0] <= newInterval[1]:
        // This interval overlaps — expand newInterval to cover both
        newInterval[0] = MIN(newInterval[0], intervals[i][0])
        newInterval[1] = MAX(newInterval[1], intervals[i][1])
        i++

    ADD newInterval to result   // Add the fully merged interval

    // Phase 3: Intervals completely after newInterval
    WHILE i < n:
        ADD intervals[i] to result
        i++

    RETURN result
```

---

### 104. Non-overlapping Intervals

```
FUNCTION eraseOverlapIntervals(intervals):

    // Find minimum intervals to REMOVE to make all remaining non-overlapping
    // Equivalent: find maximum number of non-overlapping intervals to KEEP
    //   then answer = total - kept

    // GREEDY: Sort by END time.
    //   Always keep the interval that ends earliest (leaves most room for future intervals)
    //   If two intervals overlap, remove the one with the later end time (keep the earlier one)
    //   Sorting by end time makes this automatic

    SORT intervals by end time (intervals[i][1])

    removeCount = 0
    prevEnd = -INFINITY   // End time of the last kept interval

    FOR each interval in intervals:
        IF interval[0] >= prevEnd:
            // No overlap with last kept interval — keep this one
            prevEnd = interval[1]

        ELSE:
            // Overlap — remove this interval (it has a later or equal end, due to sort order)
            removeCount++

    RETURN removeCount
```

---

## Binary Search (Extended)

---

### 105. Find Peak Element

```
FUNCTION findPeakElement(nums):

    // A peak is where nums[i] > nums[i-1] AND nums[i] > nums[i+1]
    // Binary search works because:
    //   If nums[mid] < nums[mid+1]: the slope goes UP to the right
    //     There MUST be a peak to the right (eventually reaches the boundary)
    //   If nums[mid] > nums[mid+1]: the slope goes DOWN
    //     There must be a peak at mid or to the left

    left = 0
    right = length(nums) - 1

    WHILE left < right:
        mid = left + (right - left) / 2

        IF nums[mid] < nums[mid + 1]:
            left = mid + 1   // Ascending slope — peak is ahead to the right

        ELSE:
            right = mid      // Descending slope — peak is at mid or to the left

    RETURN left   // left == right — this is the peak
```

---

### 106. Koko Eating Bananas

```
FUNCTION minEatingSpeed(piles, h):

    // Binary search ON THE ANSWER (the eating speed k)
    // Minimum possible speed = 1 (eat at least 1 banana/hour)
    // Maximum possible speed = max(piles) (eat entire largest pile in 1 hour)
    // For a given speed, check if Koko can finish within h hours

    left = 1
    right = MAX(piles)   // Upper bound: eating fastest pile in 1 hour

    WHILE left < right:
        mid = left + (right - left) / 2   // Try this speed

        IF canEat(piles, h, mid):
            right = mid     // Speed mid works — try to find something slower (smaller)
        ELSE:
            left = mid + 1  // Too slow — need to eat faster

    RETURN left   // Minimum valid speed

FUNCTION canEat(piles, h, speed):
    hours = 0
    FOR each pile in piles:
        hours += CEILING(pile / speed)
        // CEILING because partial piles still take a full hour
        // ceil(pile/speed) = (pile + speed - 1) / speed (integer arithmetic)
    RETURN hours <= h
```

> **This problem is the template for "Binary Search on Answer" problems.**
> **Same pattern used in:** Capacity to Ship Packages, Minimum Days to Make Bouquets, Split Array Largest Sum, etc.
> **Change for each:** Only the `canEat`-equivalent feasibility check changes. The binary search skeleton stays identical.

---

### 107. Find First and Last Position of Element in Sorted Array

```
FUNCTION searchRange(nums, target):

    // Run binary search TWICE:
    //   Once to find the FIRST (leftmost) position
    //   Once to find the LAST (rightmost) position

    RETURN [findBound(nums, target, findFirst=true),
            findBound(nums, target, findFirst=false)]

FUNCTION findBound(nums, target, findFirst):

    left = 0
    right = length(nums) - 1
    bound = -1   // Default: not found

    WHILE left <= right:
        mid = left + (right - left) / 2

        IF nums[mid] == target:
            bound = mid       // Record this as a valid answer

            IF findFirst:
                right = mid - 1   // Keep searching LEFT for an earlier occurrence
            ELSE:
                left = mid + 1    // Keep searching RIGHT for a later occurrence

        ELSE IF nums[mid] < target:
            left = mid + 1

        ELSE:
            right = mid - 1

    RETURN bound
```

---

## Dynamic Programming (Extended)

---

### 108. Longest Palindromic Substring

```
FUNCTION longestPalindrome(s):

    // Similar to Palindromic Substrings (count) but here we TRACK the longest
    // Expand from center: try every character and every gap as potential center
    // Update global (start, maxLen) when a longer palindrome is found

    start = 0
    maxLen = 1

    FOR i = 0 TO length(s) - 1:
        expand(s, i, i)       // Odd-length: center is a single character
        expand(s, i, i + 1)   // Even-length: center is a gap between i and i+1

    RETURN s[start .. start + maxLen - 1]

FUNCTION expand(s, left, right):

    WHILE left >= 0 AND right < length(s) AND s[left] == s[right]:
        IF right - left + 1 > maxLen:
            start  = left               // Update the start of longest palindrome found
            maxLen = right - left + 1   // Update its length
        left--
        right++
```

> **Variation — Palindromic Substrings Count** (problem 20 in original list):
> **Change:** Instead of tracking (start, maxLen), just increment a counter each time `s[left] == s[right]`.

---

### 109. Edit Distance

```
FUNCTION minDistance(word1, word2):

    // dp[i][j] = minimum operations to convert word1[0..i-1] to word2[0..j-1]
    // Base cases:
    //   dp[i][0] = i  (delete all i chars from word1 to get empty word2)
    //   dp[0][j] = j  (insert all j chars to get word2 from empty word1)
    // Recurrence:
    //   If characters match: dp[i][j] = dp[i-1][j-1]  (no operation needed)
    //   If characters differ: dp[i][j] = 1 + min of three operations:
    //     Replace: dp[i-1][j-1]  (replace word1[i] with word2[j])
    //     Delete:  dp[i-1][j]    (delete word1[i], solve for rest)
    //     Insert:  dp[i][j-1]    (insert word2[j] into word1)

    m = length(word1), n = length(word2)
    dp = 2D array (m+1) × (n+1)

    // Initialize base cases
    FOR i = 0 TO m: dp[i][0] = i
    FOR j = 0 TO n: dp[0][j] = j

    FOR i = 1 TO m:
        FOR j = 1 TO n:
            IF word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]   // Characters match — no work needed
            ELSE:
                dp[i][j] = 1 + MIN(
                    dp[i-1][j-1],   // Replace
                    dp[i-1][j],     // Delete from word1
                    dp[i][j-1]      // Insert into word1
                )

    RETURN dp[m][n]
```

---

### 110. Partition Equal Subset Sum

```
FUNCTION canPartition(nums):

    // Can we split the array into two equal-sum subsets?
    // If total sum is odd → impossible (can't split into two equal halves)
    // Otherwise: can we find any subset with sum = total/2?
    // This is exactly the 0/1 Knapsack problem with target = total/2

    total = SUM(nums)
    IF total % 2 != 0: RETURN false   // Odd sum — impossible

    target = total / 2
    dp = boolean array of size (target + 1), all false
    dp[0] = true   // Base case: we can always form sum 0 (empty subset)

    FOR each num in nums:
        FOR j = target DOWNTO num:
            // Backwards iteration ensures each num is used at most once
            dp[j] = dp[j] OR dp[j - num]
            // Can we reach sum j?
            // Either: already could (dp[j]) OR could reach (j - num) and now add num

    RETURN dp[target]
```

---

## Trie

---

### 111. Implement Trie (Prefix Tree)

```
CLASS TrieNode:
    children = array of 26 TrieNodes (one per letter a-z), all null initially
    isEnd = false   // Marks whether a complete word ends at this node

CLASS Trie:
    root = new TrieNode()   // Empty root node

FUNCTION insert(word):

    // Traverse the trie character by character
    // Create new TrieNodes wherever a path doesn't exist yet

    node = root
    FOR each char c in word:
        idx = c - 'a'
        IF node.children[idx] is null:
            node.children[idx] = new TrieNode()   // Create node for this character
        node = node.children[idx]   // Move down to the next level

    node.isEnd = true   // Mark the final node as end of a complete word

FUNCTION search(word):

    // Traverse the trie for the word — must reach a node where isEnd = true

    node = find(word)
    RETURN node != null AND node.isEnd
    // Node must exist AND it must mark the end of a complete word (not just a prefix)

FUNCTION startsWith(prefix):

    // Just check if any path for this prefix exists — no isEnd check needed

    RETURN find(prefix) != null

FUNCTION find(s):

    // Common helper: traverse the trie for string s
    // Return null if any character's path doesn't exist

    node = root
    FOR each char c in s:
        IF node.children[c - 'a'] is null:
            RETURN null   // Path doesn't exist — word/prefix not in trie
        node = node.children[c - 'a']

    RETURN node
```

> **Variation — Word Search II (find all words from a list on a board):**
> **Change:** Build a Trie from the word list. Then DFS on each board cell, navigating the Trie simultaneously. When `node.isEnd` is true during DFS, add the found word to results.

---

## Backtracking (Extended)

---

### 112. Word Search

```
FUNCTION exist(board, word):

    // Try starting the word from every cell on the board
    // For each starting cell, do DFS to spell out the word character by character

    FOR i = 0 TO rows - 1:
        FOR j = 0 TO cols - 1:
            IF dfs(board, word, i, j, index=0):
                RETURN true   // Found the word starting from (i, j)

    RETURN false

FUNCTION dfs(board, word, r, c, idx):

    IF idx == length(word):
        RETURN true   // We've matched all characters — word found!

    IF r < 0 OR r >= rows OR c < 0 OR c >= cols:
        RETURN false  // Out of bounds

    IF board[r][c] != word[idx]:
        RETURN false  // Character mismatch

    // Mark this cell as visited BEFORE recursing (to prevent reuse in the same path)
    temp = board[r][c]
    board[r][c] = '#'   // '#' is a sentinel that won't match any letter

    // Explore all 4 directions for the next character
    found = dfs(board, word, r+1, c, idx+1)
         OR dfs(board, word, r-1, c, idx+1)
         OR dfs(board, word, r, c+1, idx+1)
         OR dfs(board, word, r, c-1, idx+1)

    board[r][c] = temp   // Restore the cell (backtrack — allow other paths to use it)

    RETURN found
```

---

## Bit Manipulation

---

### 113. Number of 1 Bits

```
FUNCTION hammingWeight(n):

    // Count set bits (1s) in binary representation of n
    // Trick: n & (n-1) clears the LOWEST SET BIT of n
    //   e.g., n = 1100, n-1 = 1011, n & (n-1) = 1000 (cleared the rightmost 1)
    // Count how many times we can do this before n becomes 0

    count = 0

    WHILE n != 0:
        n = n & (n - 1)   // Remove the lowest set bit
        count++            // We just removed one '1' bit

    RETURN count
    // Number of iterations = number of 1 bits in n
```

> **Variation — Count Bits for 0..n (leetcode 338):**
> **Change:** Use DP: `dp[i] = dp[i >> 1] + (i & 1)`. Each number has the same bits as its right-shifted version, plus 1 if the last bit is set.

---

### 114. Reverse Bits

```
FUNCTION reverseBits(n):

    // Process all 32 bits one by one
    // For each bit: extract the rightmost bit of n, place it at the leftmost available position of result

    result = 0

    FOR i = 0 TO 31:
        result = (result << 1)   // Shift result left to make room for the next bit
        result = result | (n & 1)   // Extract LSB of n and append it to result
        n = n >>> 1              // Unsigned right shift n (fills with 0, not sign bit)

    RETURN result
    // After 32 iterations, all bits have been reversed
```

---

### 115. Sum of Two Integers (Without + or -)

```
FUNCTION getSum(a, b):

    // Add two numbers without + or - using bit manipulation
    // XOR gives addition WITHOUT carry: 1+1=0 (no carry stored), 0+1=1, 1+0=1
    // AND gives the carry bits: 1&1=1 means there's a carry into the next bit position
    // Left shift carry by 1 to add it at the correct bit position
    // Repeat until no more carries

    WHILE b != 0:
        carry = (a & b) << 1
        // Compute carry: positions where BOTH bits are 1 need to carry to next position

        a = a XOR b
        // Compute sum without carry: different bits = 1, same bits = 0

        b = carry
        // The carry now needs to be added in the next iteration

    RETURN a
    // When b == 0, there's no more carry — a holds the final sum
```

---

## Key Variations Reference

> Compact variation notes for the most frequently asked follow-ups.

---

### Two Sum Variations
| Variation | Key Change from Base Pseudo Code |
|---|---|
| **Two Sum II** (sorted input) | Replace HashMap with two pointers from both ends. No extra space. |
| **Two Sum III** (design with multiple queries) | Store all numbers in a HashMap with counts. For `find(val)`: check if `complement = val - num` exists (handle `num == complement` case using count >= 2). |
| **4Sum** | Add a second outer loop (fix two numbers with two loops), then apply Two Sum two-pointer inside. |

---

### House Robber Variations
| Variation | Key Change |
|---|---|
| **House Robber II** (circular array, first/last connected) | Run the base algorithm TWICE: once on `nums[0..n-2]`, once on `nums[1..n-1]`. Return the max of both results. |
| **House Robber III** (houses arranged as a binary tree) | DFS on tree, return a pair `(rob this node, skip this node)` for each subtree. Use: `rob = node.val + left.skip + right.skip`, `skip = max(left.rob, left.skip) + max(right.rob, right.skip)`. |

---

### Coin Change Variations
| Variation | Key Change |
|---|---|
| **Coin Change II** (count number of combinations) | Change `dp[j] = MIN(dp[j], dp[j-coin]+1)` → `dp[j] += dp[j-coin]`. Iterate coins in outer loop, amounts in inner loop (combinations, not permutations). |
| **Coin Change Permutations** (count ordered ways) | Iterate amounts in outer loop, coins in inner loop. `dp[j] += dp[j-coin]`. |

---

### Number of Islands Variations
| Variation | Key Change |
|---|---|
| **Max Area of Island** | Instead of incrementing a counter per DFS, return the count of cells visited in each DFS call. Track the global max. |
| **Surrounded Regions** | Start DFS from all '0' cells on the border, mark them as safe. Then flip all remaining '0' to 'X'. Finally, restore safe cells back to '0'. |

---

### Subarray Sum Variations
| Variation | Key Change from #28 (Subarray Sum Equals K) |
|---|---|
| **Subarray Sum Divisible by K** | Change key stored in map from `sum` to `sum % k`. Handle negative mod: `((sum % k) + k) % k`. Count prefix sums with the same remainder. |
| **Count Subarrays with Sum < K** | Use sliding window (only works with non-negative numbers). Maintain window sum, shrink when sum >= k. |

---

### Binary Search "Search on Answer" Template
```
// Use this pattern whenever the answer is a value in a range [lo, hi]
// and you have a monotonic feasibility function:

left = minimum_possible_answer
right = maximum_possible_answer

WHILE left < right:
    mid = left + (right - left) / 2

    IF isFeasible(mid):
        right = mid       // mid works — try smaller (for minimization)
    ELSE:
        left = mid + 1    // mid doesn't work — try larger

RETURN left

// Problems using this template:
// Koko Eating Bananas (#106), Capacity to Ship Packages (#92),
// Find Peak Element (#105), First Bad Version (#91)
```

---

*End of document — **115 problems** with detailed pseudo code across **15 categories**.*
*Includes variation notes for the most frequently asked follow-ups.*
*Each pseudo code block explains WHY each step is performed, not just what it does.*
