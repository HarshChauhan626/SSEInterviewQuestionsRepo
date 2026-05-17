# Trie — Master Guide: 10 Problems Covering 95% of Interview Patterns

## What is a Trie?

A **Trie** (pronounced "try", from re**trie**val) is a tree-like data structure where each node represents a character. Words are stored by sharing common prefixes — making it extremely efficient for prefix-based lookups, autocomplete, and dictionary operations.

### Core Trie Node (Java) — reused across all problems

```java
class TrieNode {
    TrieNode[] children = new TrieNode[26]; // for lowercase a-z
    boolean isEnd = false;
    // Extra fields added per problem as needed
}
```

**Time complexity:** Insert / Search / StartsWith → O(L) where L = word length  
**Space complexity:** O(ALPHABET_SIZE × L × N) where N = number of words

---

## Pattern Map

| # | Problem | Pattern |
|---|---------|---------|
| 1 | Implement Trie | Core structure |
| 2 | Word Search II | Trie + DFS/Backtracking |
| 3 | Replace Words | Prefix replacement |
| 4 | Design Add and Search Words | Wildcard search |
| 5 | Longest Word in Dictionary | BFS/DFS on Trie |
| 6 | Maximum XOR of Two Numbers | Bit Trie |
| 7 | Palindrome Pairs | Trie + Palindrome check |
| 8 | Word Break II | Trie + DP/Backtracking |
| 9 | Autocomplete System | Trie + Frequency ranking |
| 10 | Count Distinct Substrings | Suffix Trie |

---

## Problem 1 — Implement Trie (Prefix Tree)

### Problem Statement
Design a data structure that supports:
- `insert(word)` — Insert a word
- `search(word)` — Return true if word exists exactly
- `startsWith(prefix)` — Return true if any word has this prefix

**Example:**
```
insert("apple")
search("apple")   → true
search("app")     → false
startsWith("app") → true
insert("app")
search("app")     → true
```

### Intuition
Think of a Trie as a tree where each **path from root to a marked node** spells a word. Every character occupies one level. Shared prefixes share nodes, saving space and enabling O(L) operations regardless of dictionary size.

### Why This Approach?
- HashMap alternatives give O(1) search but O(L) space per word with no prefix sharing.
- A Trie enables prefix queries naturally — you can't do `startsWith` in O(L) with a HashSet.

### Java Code
```java
class Trie {
    private TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    public void insert(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null)
                cur.children[idx] = new TrieNode();
            cur = cur.children[idx];
        }
        cur.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null) return false;
            cur = cur.children[idx];
        }
        return cur.isEnd;
    }

    public boolean startsWith(String prefix) {
        TrieNode cur = root;
        for (char c : prefix.toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null) return false;
            cur = cur.children[idx];
        }
        return true;
    }
}

class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}
```

### Test Cases
```
Input:  insert("car"), insert("card"), search("car"), search("ca"), startsWith("ca")
Output: true, false, true

Input:  insert("a"), search("a"), startsWith("b")
Output: true, false

Input:  insert("hello"), insert("help"), startsWith("hel"), search("helx")
Output: true, false
```

---

## Problem 2 — Word Search II (LeetCode 212)

### Problem Statement
Given an `m x n` board of characters and a list of strings `words`, return all words that can be found in the board. Words must be constructed from sequentially adjacent cells (horizontally or vertically), and the same cell may not be used more than once.

**Example:**
```
board = [["o","a","a","n"],
         ["e","t","a","e"],
         ["i","h","k","r"],
         ["i","f","l","v"]]
words = ["oath","pea","eat","rain"]
Output: ["eat","oath"]
```

### Intuition
Naively running DFS for each word separately is O(W × M × N × 4^L). Instead, **insert all words into a Trie first**, then run a single DFS over the board. At every cell, traverse the Trie simultaneously — prune entire branches the moment the path diverges from any word prefix. This transforms it from "search per word" to "search per board cell once."

### Why This Approach?
- Trie gives shared prefix pruning — if "app" doesn't exist on board, neither "apple" nor "application" will be explored.
- Without Trie, even 30 words × board traversal = TLE on large inputs.

### Java Code
```java
class Solution {
    char[][] board;
    int m, n;
    List<String> result = new ArrayList<>();

    public List<String> findWords(char[][] board, String[] words) {
        this.board = board;
        m = board.length;
        n = board[0].length;

        TrieNode root = new TrieNode();
        for (String w : words) insert(root, w);

        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                dfs(root, i, j, new StringBuilder());

        return result;
    }

    void insert(TrieNode root, String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null)
                cur.children[idx] = new TrieNode();
            cur = cur.children[idx];
        }
        cur.word = word; // store word at end node
    }

    void dfs(TrieNode node, int i, int j, StringBuilder path) {
        if (i < 0 || i >= m || j < 0 || j >= n) return;
        char c = board[i][j];
        if (c == '#' || node.children[c - 'a'] == null) return;

        node = node.children[c - 'a'];
        if (node.word != null) {
            result.add(node.word);
            node.word = null; // avoid duplicates
        }

        board[i][j] = '#'; // mark visited
        dfs(node, i+1, j, path);
        dfs(node, i-1, j, path);
        dfs(node, i, j+1, path);
        dfs(node, i, j-1, path);
        board[i][j] = c; // restore
    }
}

class TrieNode {
    TrieNode[] children = new TrieNode[26];
    String word = null;
}
```

### Test Cases
```
board=[["a","b"],["c","d"]], words=["abdc","abcd"]
Output: ["abdc"]  (abcd is not valid — b→c requires diagonal)

board=[["a"]], words=["a"]
Output: ["a"]

board=[["o","a"],["e","t"]], words=["oae","eat","oat"]
Output: ["oat","eat"]  (order may vary)
```

---

## Problem 3 — Replace Words (LeetCode 648)

### Problem Statement
Given a dictionary of root words and a sentence, replace every word in the sentence with the shortest root that is a prefix of that word. If no root is found, leave the word as-is.

**Example:**
```
dictionary = ["cat","bat","rat"]
sentence = "the cattle was rattled by the battery"
Output: "the cat was rat by the bat"
```

### Intuition
Insert all roots into a Trie. For each word in the sentence, walk the Trie character by character — the moment you hit an `isEnd` node, you've found the shortest root. Stop and return it. No need to traverse the full word.

### Why This Approach?
- Sorting roots by length and checking prefix for each word = O(W × D × L). Trie reduces it to O(W × L) — one pass per word.
- The Trie naturally surfaces the **shortest** prefix because we stop at the first `isEnd`.

### Java Code
```java
class Solution {
    public String replaceWords(List<String> dictionary, String sentence) {
        TrieNode root = new TrieNode();

        // Insert all roots
        for (String root_word : dictionary) {
            TrieNode cur = root;
            for (char c : root_word.toCharArray()) {
                int idx = c - 'a';
                if (cur.children[idx] == null)
                    cur.children[idx] = new TrieNode();
                cur = cur.children[idx];
            }
            cur.isEnd = true;
        }

        // Replace each word in sentence
        String[] words = sentence.split(" ");
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < words.length; i++) {
            if (i > 0) sb.append(" ");
            sb.append(getRoot(root, words[i]));
        }
        return sb.toString();
    }

    String getRoot(TrieNode root, String word) {
        TrieNode cur = root;
        StringBuilder prefix = new StringBuilder();
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null) break;
            cur = cur.children[idx];
            prefix.append(c);
            if (cur.isEnd) return prefix.toString(); // shortest root found
        }
        return word; // no root matched
    }
}

class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}
```

### Test Cases
```
dict=["a","b","c"], sentence="aadsfasf absbs bbab cadsfafs"
Output: "a a b c"

dict=["catt","cat","bat","rat"], sentence="the cattle was rattled"
Output: "the cat was rat"    // "cat" wins over "catt" (shorter)

dict=["e"], sentence="education education"
Output: "e e"
```

---

## Problem 4 — Design Add and Search Words (LeetCode 211)

### Problem Statement
Design a data structure that supports:
- `addWord(word)` — adds a word
- `search(word)` — returns true if the word matches any stored word. The word may contain `.` which matches any letter.

**Example:**
```
addWord("bad"), addWord("dad"), addWord("mad")
search("pad") → false
search("bad") → true
search(".ad") → true
search("b..") → true
```

### Intuition
Standard Trie insert for `addWord`. For `search`, when you encounter a `.`, you must **branch into all 26 children** recursively — any of them could be the wildcard match. This is essentially DFS on the Trie with wildcards.

### Why This Approach?
- Regular search is O(L). Wildcard search is O(26^k × L) where k = number of dots — but in practice the Trie prunes non-matching branches heavily.
- Recursion handles wildcards cleanly without extra data structures.

### Java Code
```java
class WordDictionary {
    TrieNode root = new TrieNode();

    public void addWord(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null)
                cur.children[idx] = new TrieNode();
            cur = cur.children[idx];
        }
        cur.isEnd = true;
    }

    public boolean search(String word) {
        return dfs(word, 0, root);
    }

    private boolean dfs(String word, int idx, TrieNode node) {
        if (idx == word.length()) return node.isEnd;

        char c = word.charAt(idx);
        if (c == '.') {
            for (TrieNode child : node.children)
                if (child != null && dfs(word, idx + 1, child))
                    return true;
            return false;
        } else {
            int i = c - 'a';
            if (node.children[i] == null) return false;
            return dfs(word, idx + 1, node.children[i]);
        }
    }
}

class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}
```

### Test Cases
```
addWord("a"), search(".")      → true
addWord("aa"), search(".a")    → true
addWord("aa"), search("a.")    → true
addWord("aab"), search("c.b")  → false
search("...")                  → false (no 3-letter word added)
```

---

## Problem 5 — Longest Word in Dictionary (LeetCode 720)

### Problem Statement
Given an array of strings `words`, find the longest word that can be built one character at a time by other words in the array. If there's a tie, return the lexicographically smallest.

**Example:**
```
words = ["w","wo","wor","worl","world"]
Output: "world"

words = ["a","banana","app","appl","ap","apply","apple"]
Output: "apple"
```

### Intuition
Insert all words into a Trie. Then do a BFS/DFS from the root — but only move to a child if that child's node has `isEnd = true`. This ensures every prefix of the candidate word itself exists in the dictionary. Track the longest (and lexicographically smallest) word found during traversal.

### Why This Approach?
- Sorting + checking prefixes is O(N log N + N × L). Trie traversal is O(N × L) total.
- The Trie naturally encodes prefix relationships — checking "is every prefix in the dictionary" is just checking `isEnd` at each level.

### Java Code
```java
class Solution {
    String result = "";

    public String longestWord(String[] words) {
        TrieNode root = new TrieNode();
        for (String w : words) insert(root, w);
        dfs(root, "");
        return result;
    }

    void insert(TrieNode root, String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null)
                cur.children[idx] = new TrieNode();
            cur = cur.children[idx];
        }
        cur.isEnd = true;
    }

    void dfs(TrieNode node, String path) {
        // Update result if this path is longer (or lex smaller on tie)
        if (path.length() > result.length() ||
           (path.length() == result.length() && path.compareTo(result) < 0)) {
            result = path;
        }
        for (int i = 0; i < 26; i++) {
            TrieNode child = node.children[i];
            // Only traverse if this child represents a complete word
            if (child != null && child.isEnd) {
                dfs(child, path + (char)('a' + i));
            }
        }
    }
}

class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}
```

### Test Cases
```
words=["b","br","bre","brea","break","breakfast"]  → "breakfast"
words=["a","b","c"]                                → "a"  (lex smallest)
words=["yo","ew","fc","zrc","yodn","fcm","qp"]     → "yo"
words=[]                                           → ""
```

---

## Problem 6 — Maximum XOR of Two Numbers in an Array (LeetCode 421)

### Problem Statement
Given an integer array `nums`, return the maximum result of `nums[i] XOR nums[j]` where `0 ≤ i ≤ j < n`.

**Example:**
```
nums = [3, 10, 5, 25, 2, 8]
Output: 28  (5 XOR 25 = 28)

nums = [14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]
Output: 127
```

### Intuition
To maximize XOR, for each bit from MSB to LSB, you want the **opposite** bit. Store all numbers in a **binary Trie** (32-bit depth). For each number, greedily navigate the Trie choosing the opposite bit at every level — this maximizes XOR bit by bit.

### Why This Approach?
- Brute force O(N²). Trie approach O(32N) = O(N).
- XOR maximization is inherently bit-by-bit — the Trie structure mirrors this perfectly, letting you make a greedy choice at each bit level.

### Java Code
```java
class Solution {
    static final int BITS = 31;

    public int findMaximumXOR(int[] nums) {
        TrieNode root = new TrieNode();

        // Insert all numbers into bit trie
        for (int num : nums) {
            TrieNode cur = root;
            for (int i = BITS; i >= 0; i--) {
                int bit = (num >> i) & 1;
                if (cur.children[bit] == null)
                    cur.children[bit] = new TrieNode();
                cur = cur.children[bit];
            }
        }

        int maxXOR = 0;
        for (int num : nums) {
            TrieNode cur = root;
            int currentXOR = 0;
            for (int i = BITS; i >= 0; i--) {
                int bit = (num >> i) & 1;
                int want = 1 - bit; // opposite bit maximizes XOR
                if (cur.children[want] != null) {
                    currentXOR = (currentXOR << 1) | 1;
                    cur = cur.children[want];
                } else {
                    currentXOR = (currentXOR << 1);
                    cur = cur.children[bit];
                }
            }
            maxXOR = Math.max(maxXOR, currentXOR);
        }
        return maxXOR;
    }
}

class TrieNode {
    TrieNode[] children = new TrieNode[2]; // only 0 and 1
}
```

### Test Cases
```
nums=[0]           → 0
nums=[3,10,5,25,2,8] → 28
nums=[2,4]         → 6   (2 XOR 4 = 6)
nums=[8,10,2]      → 10  (8 XOR 2 = 10)
```

---

## Problem 7 — Palindrome Pairs (LeetCode 336)

### Problem Statement
Given a list of unique words, find all pairs `(i, j)` such that `words[i] + words[j]` is a palindrome. Return all such index pairs.

**Example:**
```
words = ["abcd","dcba","lls","s","sssll"]
Output: [[0,1],[1,0],[3,2],[2,4]]

words = ["bat","tab","cat"]
Output: [[0,1],[1,0]]
```

### Intuition
Insert all **reversed** words into a Trie (storing their indices). For each word, walk the Trie with the word's characters. At each node:
1. If you've consumed the whole word and the Trie has a match (`isEnd`), check if the remaining Trie suffix is a palindrome.
2. If the Trie path ends mid-word (`isEnd` found), check if the remaining suffix of the original word is a palindrome.

### Why This Approach?
- Brute force O(N² × L). Trie approach O(N × L²) — for each word, checking is O(L) per node, palindrome check O(L).
- Inserting reversed words lets us detect "word + reversal" pairs naturally while traversing.

### Java Code
```java
class Solution {
    TrieNode root = new TrieNode();

    public List<List<Integer>> palindromePairs(String[] words) {
        // Insert reversed words
        for (int i = 0; i < words.length; i++) {
            String rev = new StringBuilder(words[i]).reverse().toString();
            insert(rev, i);
        }

        List<List<Integer>> result = new ArrayList<>();
        for (int i = 0; i < words.length; i++) {
            findPairs(words[i], i, result);
        }
        return result;
    }

    void insert(String word, int idx) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int id = c - 'a';
            if (cur.children[id] == null) cur.children[id] = new TrieNode();
            cur = cur.children[id];
            if (cur.isEnd >= 0) cur.palindromeSuffix.add(cur.isEnd);
        }
        cur.isEnd = idx;
    }

    void findPairs(String word, int i, List<List<Integer>> res) {
        TrieNode cur = root;
        for (int k = 0; k < word.length(); k++) {
            // Trie path exhausted mid-word: check if remaining suffix is palindrome
            if (cur.isEnd >= 0 && cur.isEnd != i && isPalindrome(word, k, word.length() - 1))
                res.add(Arrays.asList(i, cur.isEnd));

            int id = word.charAt(k) - 'a';
            if (cur.children[id] == null) return;
            cur = cur.children[id];
        }

        // Whole word consumed: exact match (must not be same word)
        if (cur.isEnd >= 0 && cur.isEnd != i)
            res.add(Arrays.asList(i, cur.isEnd));

        // Remaining Trie branches where the suffix itself is a palindrome
        for (int j : cur.palindromeSuffix)
            if (j != i) res.add(Arrays.asList(i, j));
    }

    boolean isPalindrome(String s, int l, int r) {
        while (l < r) if (s.charAt(l++) != s.charAt(r--)) return false;
        return true;
    }
}

class TrieNode {
    TrieNode[] children = new TrieNode[26];
    int isEnd = -1;
    List<Integer> palindromeSuffix = new ArrayList<>();
}
```

### Test Cases
```
words=["a",""]         → [[0,1],[1,0]]
words=["aa",""]        → [[0,1],[1,0]]
words=["abcd","dcba"]  → [[0,1],[1,0]]
words=["lls","s","sssll"] → [[1,0],[0,2]]
```

---

## Problem 8 — Word Break II (LeetCode 140)

### Problem Statement
Given a string `s` and a dictionary of strings `wordDict`, add spaces in `s` to construct all possible sentences where each word is a valid dictionary word.

**Example:**
```
s = "catsanddog", wordDict = ["cat","cats","and","sand","dog"]
Output: ["cats and dog","cat sand dog"]

s = "pineapplepenapple", wordDict = ["apple","pen","applepen","pine","pineapple"]
Output: ["pine apple pen apple","pineapple pen apple","pine applepen apple"]
```

### Intuition
Insert all dictionary words into a Trie. Then use **backtracking with memoization** — from each position in `s`, walk the Trie character by character. When you hit an `isEnd` node, you've found a valid word — recurse on the remainder. Cache results for each starting index to avoid recomputation.

### Why This Approach?
- Trie lets you enumerate all valid words starting at position `i` in O(L) instead of trying all substrings.
- Memoization prevents exponential recomputation on repeated subproblems.

### Java Code
```java
class Solution {
    TrieNode root = new TrieNode();
    Map<Integer, List<String>> memo = new HashMap<>();

    public List<String> wordBreak(String s, List<String> wordDict) {
        for (String w : wordDict) insert(w);
        return backtrack(s, 0);
    }

    void insert(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null) cur.children[idx] = new TrieNode();
            cur = cur.children[idx];
        }
        cur.isEnd = true;
    }

    List<String> backtrack(String s, int start) {
        if (memo.containsKey(start)) return memo.get(start);
        List<String> result = new ArrayList<>();
        if (start == s.length()) {
            result.add("");
            return result;
        }

        TrieNode cur = root;
        for (int end = start; end < s.length(); end++) {
            int idx = s.charAt(end) - 'a';
            if (cur.children[idx] == null) break; // no word can start here
            cur = cur.children[idx];

            if (cur.isEnd) {
                String word = s.substring(start, end + 1);
                List<String> rest = backtrack(s, end + 1);
                for (String r : rest) {
                    result.add(word + (r.isEmpty() ? "" : " " + r));
                }
            }
        }

        memo.put(start, result);
        return result;
    }
}

class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}
```

### Test Cases
```
s="catsanddog", dict=["cat","cats","and","sand","dog"]
Output: ["cats and dog","cat sand dog"]

s="aaaa", dict=["a","aa","aaa","aaaa"]
Output: ["a a a a","a a aa","a aa a","a aaa","aa a a","aa aa","aaa a","aaaa"]

s="abc", dict=["a","bc","b","c"]
Output: ["a b c","a bc"]

s="abc", dict=["d","e"]
Output: []
```

---

## Problem 9 — Design Search Autocomplete System (LeetCode 642)

### Problem Statement
Design a search autocomplete system. Given past sentences with frequencies, and a stream of characters typed one at a time, return the top 3 historical sentences with the typed prefix (ties broken by ASCII order). A `#` character commits the current input as a new sentence.

**Example:**
```
sentences=["i love you","island","iroman","i love leetcode"]
times=[5,3,2,2]
input('i') → ["i love you","island","i love leetcode"]
input(' ') → ["i love you","i love leetcode"]
input('a') → []
input('#') → []  // commits "i a" as new sentence
```

### Intuition
Build a Trie where each node stores a list (or map) of all sentences that pass through it along with their frequencies. On each character typed, navigate the Trie to the current prefix node and return the top 3 sentences stored there (pre-sorted or sorted on the fly). On `#`, insert the completed sentence and update frequencies.

### Why This Approach?
- Querying top-k suggestions per prefix repeatedly is expensive without precomputation.
- Storing candidate sentences at each node trades space for O(L + k log k) query time.

### Java Code
```java
class AutocompleteSystem {
    TrieNode root = new TrieNode();
    StringBuilder current = new StringBuilder();

    public AutocompleteSystem(String[] sentences, int[] times) {
        for (int i = 0; i < sentences.length; i++)
            insert(sentences[i], times[i]);
    }

    void insert(String sentence, int times) {
        TrieNode cur = root;
        for (char c : sentence.toCharArray()) {
            if (cur.children[c] == null) cur.children[c] = new TrieNode();
            cur = cur.children[c];
            cur.counts.merge(sentence, times, Integer::sum);
        }
    }

    public List<String> input(char c) {
        if (c == '#') {
            insert(current.toString(), 1);
            current = new StringBuilder();
            return new ArrayList<>();
        }
        current.append(c);

        TrieNode cur = root;
        for (char ch : current.toString().toCharArray()) {
            if (cur.children[ch] == null) return new ArrayList<>();
            cur = cur.children[ch];
        }

        // Get top 3 by frequency, then lexicographic order
        return cur.counts.entrySet().stream()
            .sorted((a, b) -> a.getValue().equals(b.getValue())
                ? a.getKey().compareTo(b.getKey())
                : b.getValue() - a.getValue())
            .limit(3)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }
}

class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    Map<String, Integer> counts = new HashMap<>();
}
```

### Test Cases
```
sentences=["abc","abbc","a"], times=[3,3,3]
input('a') → ["a","abc","abbc"]  // lex order on tie
input('b') → ["abc","abbc"]
input('c') → ["abc"]
input('#') → []   // "abc" frequency becomes 4

sentences=["i love you"], times=[5]
input('i') → ["i love you"]
input('#') → []
input('i') → ["i love you","i"] // "i" now has freq 1
```

---

## Problem 10 — Count Distinct Substrings (Suffix Trie)

### Problem Statement
Given a string `s`, count the number of distinct non-empty substrings. 

**Example:**
```
s = "abab"
Output: 7  → {"a","b","ab","ba","aba","bab","abab"}

s = "aaa"
Output: 3  → {"a","aa","aaa"}
```

### Intuition
Insert every **suffix** of `s` into a Trie. Each new node created represents a **new distinct substring** — because each path from root to any node spells a unique prefix of some suffix, which is itself a unique substring. Count all nodes created (excluding root).

### Why This Approach?
- HashSet of all substrings = O(N²) space and O(N³) time.
- Suffix Trie inserts N suffixes, each of length up to N → O(N²) nodes, O(N²) time. Counting nodes = counting distinct substrings.
- A Suffix Array/SA-LCP approach gives O(N log N) but Trie is more intuitive for interviews.

### Java Code
```java
class Solution {
    public int countDistinctSubstrings(String s) {
        TrieNode root = new TrieNode();
        int count = 0;

        // Insert every suffix
        for (int i = 0; i < s.length(); i++) {
            TrieNode cur = root;
            for (int j = i; j < s.length(); j++) {
                int idx = s.charAt(j) - 'a';
                if (cur.children[idx] == null) {
                    cur.children[idx] = new TrieNode();
                    count++; // new node = new distinct substring
                }
                cur = cur.children[idx];
            }
        }
        return count;
    }
}

class TrieNode {
    TrieNode[] children = new TrieNode[26];
}
```

### Test Cases
```
s="a"      → 1
s="aa"     → 2  {"a","aa"}
s="ab"     → 3  {"a","b","ab"}
s="abab"   → 7
s="aaa"    → 3
s="abcd"   → 10  (all n(n+1)/2 substrings are distinct)
```

---

## Summary — Patterns at a Glance

| Problem | Key Insight | Time | Space |
|---------|------------|------|-------|
| 1. Implement Trie | Foundation — insert/search/prefix | O(L) per op | O(N×L) |
| 2. Word Search II | Trie prunes DFS branches | O(M×N×4^L) | O(W×L) |
| 3. Replace Words | Stop at first `isEnd` = shortest root | O(W×L) | O(D×L) |
| 4. Add & Search Words | Wildcard → branch all 26 children | O(26^k × L) | O(N×L) |
| 5. Longest Word | DFS only through `isEnd` nodes | O(N×L) | O(N×L) |
| 6. Max XOR | Bit Trie, greedy opposite bit | O(32N) | O(32N) |
| 7. Palindrome Pairs | Insert reversed, check palindrome suffix | O(N×L²) | O(N×L) |
| 8. Word Break II | Trie + backtracking + memo | O(N×2^N) worst | O(N×L) |
| 9. Autocomplete | Store top-k at each Trie node | O(L + k log k) | O(N×L) |
| 10. Distinct Substrings | Count nodes in suffix Trie | O(N²) | O(N²) |

---

## Common Mistakes to Avoid

1. **Forgetting to mark `isEnd`** — search will return false for valid words.
2. **Not restoring board cells** in Word Search II — DFS corruption.
3. **Off-by-one in bit Trie** — always start from bit 31 (or 30 for positive ints).
4. **Duplicate results** in Word Search II — set `node.word = null` after adding.
5. **Not handling `#` correctly** in Autocomplete — commit and reset buffer.
6. **Suffix Trie vs Suffix Array** — Trie is O(N²) space; use SA for large inputs.