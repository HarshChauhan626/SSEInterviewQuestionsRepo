# String Problems — Complete Reference

## Table of Contents
| # | Problem | Difficulty | Jump to Solution |
|---|---------|:----------:|------------------|
| 1 | Longest Substring Without Repeating Characters | 🟡 Medium | [→ #1](#longest-substring-without-repeating-characters) |
| 2 | Longest Repeating Character Replacement | 🟡 Medium | [→ #2](#longest-repeating-character-replacement) |
| 3 | Minimum Window Substring | 🔴 Hard | [→ #3](#minimum-window-substring) |
| 4 | Permutation in String | 🟡 Medium | [→ #4](#permutation-in-string) |
| 5 | Find All Anagrams in a String | 🟡 Medium | [→ #5](#find-all-anagrams-in-a-string) |
| 6 | Longest Substring with At Most K Distinct Characters | 🟡 Medium | [→ #6](#longest-substring-with-at-most-k-distinct-characters) |
| 7 | Group Anagrams | 🟡 Medium | [→ #7](#group-anagrams) |
| 8 | Valid Anagram | 🟢 Easy | [→ #8](#valid-anagram) |
| 9 | Isomorphic Strings | 🟢 Easy | [→ #9](#isomorphic-strings) |
| 10 | Word Pattern | 🟢 Easy | [→ #10](#word-pattern) |
| 11 | Determine if Two Strings Are Close | 🟡 Medium | [→ #11](#determine-if-two-strings-are-close) |
| 12 | Find the Difference | 🟢 Easy | [→ #12](#find-the-difference) |
| 13 | Reverse Words in a String | 🟡 Medium | [→ #13](#reverse-words-in-a-string) |
| 14 | String Compression | 🟡 Medium | [→ #14](#string-compression) |
| 15 | Zigzag Conversion | 🟡 Medium | [→ #15](#zigzag-conversion) |
| 16 | Remove All Adjacent Duplicates in String II | 🟡 Medium | [→ #16](#remove-all-adjacent-duplicates-in-string-ii) |
| 17 | Multiply Strings | 🟡 Medium | [→ #17](#multiply-strings) |
| 18 | Reverse Words in a String III | 🟢 Easy | [→ #18](#reverse-words-in-a-string-iii) |
| 19 | String to Integer (atoi) | 🟡 Medium | [→ #19](#string-to-integer-atoi) |
| 20 | Decode String | 🟡 Medium | [→ #20](#decode-string) |
| 21 | Compare Version Numbers | 🟡 Medium | [→ #21](#compare-version-numbers) |
| 22 | Simplify Path | 🟡 Medium | [→ #22](#simplify-path) |
| 23 | Restore IP Addresses | 🟡 Medium | [→ #23](#restore-ip-addresses) |
| 24 | Basic Calculator II | 🟡 Medium | [→ #24](#basic-calculator-ii) |
| 25 | Longest Palindromic Substring | 🟡 Medium | [→ #25](#longest-palindromic-substring) |
| 26 | Palindromic Substrings | 🟡 Medium | [→ #26](#palindromic-substrings) |
| 27 | Valid Palindrome II | 🟢 Easy | [→ #27](#valid-palindrome-ii) |
| 28 | Count Palindromic Subsequences | 🔴 Hard | [→ #28](#count-palindromic-subsequences) |
| 29 | Partition Labels | 🟡 Medium | [→ #29](#partition-labels) |
| 30 | Remove Duplicate Letters | 🟡 Medium | [→ #30](#remove-duplicate-letters) |
| 31 | Reorganize String | 🟢 Easy | [→ #31](#reorganize-string) |
| 32 | Partition String Into Substrings With Unique Characters | 🟢 Easy | [→ #32](#partition-string-into-substrings-with-unique-characters) |
| 33 | Implement strStr() | 🟢 Easy | [→ #33](#implement-strstr) |
| 34 | Repeated DNA Sequences | 🟢 Easy | [→ #34](#repeated-dna-sequences) |
| 35 | Longest Happy Prefix | 🟢 Easy | [→ #35](#longest-happy-prefix) |
| 36 | Word Break | 🟢 Easy | [→ #36](#word-break) |
| 37 | Decode Ways | 🟢 Easy | [→ #37](#decode-ways) |
| 38 | Interleaving String | 🟢 Easy | [→ #38](#interleaving-string) |
| 39 | Longest Common Subsequence | 🟢 Easy | [→ #39](#longest-common-subsequence) |
| 40 | Word Ladder | 🟢 Easy | [→ #40](#word-ladder) |
| 41 | Edit Distance | 🟢 Easy | [→ #41](#edit-distance) |
| 42 | Distinct Subsequences | 🟢 Easy | [→ #42](#distinct-subsequences) |
| 43 | Word Search II | 🟢 Easy | [→ #43](#word-search-ii) |
| 44 | Alien Dictionary | 🟢 Easy | [→ #44](#alien-dictionary) |
| 45 | Text Justification | 🟢 Easy | [→ #45](#text-justification) |
| 46 | Shortest Way to Form String | 🟢 Easy | [→ #46](#shortest-way-to-form-string) |
| 47 | Minimum Deletions to Make Character Frequencies Unique | 🟢 Easy | [→ #47](#minimum-deletions-to-make-character-frequencies-unique) |
| 48 | Encode and Decode Strings | 🟢 Easy | [→ #48](#encode-and-decode-strings) |
| 49 | Find and Replace Pattern | 🟢 Easy | [→ #49](#find-and-replace-pattern) |
| 50 | Shortest Palindrome | 🟢 Easy | [→ #50](#shortest-palindrome) |
| 51 | Longest Common Prefix | 🟢 Easy | [→ #51](#longest-common-prefix) |
| 52 | First Unique Character in a String | 🟢 Easy | [→ #52](#first-unique-character-in-a-string) |
| 53 | Ransom Note | 🟢 Easy | [→ #53](#ransom-note) |
| 54 | Check if a String Contains All Binary Codes of Size K | 🟢 Easy | [→ #54](#check-if-a-string-contains-all-binary-codes-of-size-k) |
| 55 | Maximum Number of Vowels in a Substring of Given Length | 🟢 Easy | [→ #55](#maximum-number-of-vowels-in-a-substring-of-given-length) |
| 56 | Swap For Longest Repeated Character Substring | 🟢 Easy | [→ #56](#swap-for-longest-repeated-character-substring) |
| 57 | Count and Say | 🟢 Easy | [→ #57](#count-and-say) |
| 58 | Remove Duplicate Letters to Obtain Lexicographically Smallest Result | 🟢 Easy | [→ #58](#remove-duplicate-letters-to-obtain-lexicographically-smallest-result) |
| 59 | Custom Sort String | 🟢 Easy | [→ #59](#custom-sort-string) |
| 60 | Smallest Subsequence of Distinct Characters | 🟢 Easy | [→ #60](#smallest-subsequence-of-distinct-characters) |

---

<a id="longest-substring-without-repeating-characters"></a>
## 1. 🟡 Longest Substring Without Repeating Characters

**Problem:** Given a string `s`, find the length of the longest substring without repeating characters.

**Test Cases:**
```
Input: s = "abcabcbb"  →  Output: 3  ("abc")
Input: s = "bbbbb"    →  Output: 1  ("b")
Input: s = "pwwkew"   →  Output: 3  ("wke")
Input: s = ""         →  Output: 0
```

**Java Solution:**
```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        // map stores: character → last seen index
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            // if c was seen AND its last position is inside current window [left, right]
            // → move left past the duplicate so the window is valid again
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1; // skip over the old occurrence
            }
            map.put(c, right); // record/update latest index of c
            maxLen = Math.max(maxLen, right - left + 1); // update best window size
        }
        return maxLen;
    }
}
// Time: O(n)  Space: O(min(n, alphabet))
```

---

<a id="longest-repeating-character-replacement"></a>
## 2. 🟡 Longest Repeating Character Replacement

**Problem:** Given a string `s` and an integer `k`, you can replace at most `k` characters. Return the length of the longest substring containing the same letter after replacements.

**Test Cases:**
```
Input: s = "ABAB", k = 2    →  Output: 4
Input: s = "AABABBA", k = 1 →  Output: 4
Input: s = "AAAA", k = 0    →  Output: 4
```

**Java Solution:**
```java
class Solution {
    public int characterReplacement(String s, int k) {
        int[] freq = new int[26]; // frequency count of chars in current window
        int left = 0, maxFreq = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            freq[s.charAt(right) - 'A']++; // expand window by including s[right]
            // track the max frequency of any single char in the window
            // → tells us how many chars we DON'T need to replace
            maxFreq = Math.max(maxFreq, freq[s.charAt(right) - 'A']);
            // window size - most frequent char count > k → shrink
            // (window size - maxFreq) = chars that need replacing; if > k, window is invalid
            if (right - left + 1 - maxFreq > k) {
                freq[s.charAt(left) - 'A']--; // remove leftmost char from window
                left++; // shrink from left
            }
            maxLen = Math.max(maxLen, right - left + 1); // update best window size
        }
        return maxLen;
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="minimum-window-substring"></a>
## 3. 🔴 Minimum Window Substring

**Problem:** Given strings `s` and `t`, return the minimum window substring of `s` that contains every character of `t`. If none exists, return `""`.

**Test Cases:**
```
Input: s = "ADOBECODEBANC", t = "ABC"  →  Output: "BANC"
Input: s = "a", t = "a"               →  Output: "a"
Input: s = "a", t = "aa"              →  Output: ""
```

**Java Solution:**
```java
class Solution {
    public String minWindow(String s, String t) {
        if (s.isEmpty() || t.isEmpty()) return "";
        // need: how many of each char from t we still require
        Map<Character, Integer> need = new HashMap<>();
        for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);

        int left = 0, formed = 0, required = need.size();
        // formed = number of unique chars whose window count meets need count
        // required = total unique chars we must satisfy
        int minLen = Integer.MAX_VALUE, minLeft = 0;
        Map<Character, Integer> window = new HashMap<>(); // counts in current window

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            window.merge(c, 1, Integer::sum); // add s[right] to window
            // if this char is needed AND we just hit exact required count → one more char satisfied
            if (need.containsKey(c) && window.get(c).equals(need.get(c))) formed++;

            // when all required chars are satisfied → try to shrink from left
            while (formed == required) {
                // record this window if it's smaller than previous best
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    minLeft = left;
                }
                char lc = s.charAt(left++); // remove leftmost char from window
                window.merge(lc, -1, Integer::sum);
                // if removed char was needed and now count drops below need → window is invalid again
                if (need.containsKey(lc) && window.get(lc) < need.get(lc)) formed--;
            }
        }
        return minLen == Integer.MAX_VALUE ? "" : s.substring(minLeft, minLeft + minLen);
    }
}
// Time: O(|s| + |t|)  Space: O(|s| + |t|)
```

---

<a id="permutation-in-string"></a>
## 4. 🟡 Permutation in String

**Problem:** Given strings `s1` and `s2`, return `true` if `s2` contains a permutation of `s1`.

**Test Cases:**
```
Input: s1 = "ab", s2 = "eidbaooo"  →  Output: true  ("ba" at index 3)
Input: s1 = "ab", s2 = "eidboaoo"  →  Output: false
Input: s1 = "a",  s2 = "a"         →  Output: true
```

**Java Solution:**
```java
class Solution {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;
        int[] need = new int[26], window = new int[26];
        for (char c : s1.toCharArray()) need[c - 'a']++; // build frequency map for s1
        int k = s1.length(); // fixed window size = length of s1
        for (int i = 0; i < s2.length(); i++) {
            window[s2.charAt(i) - 'a']++; // add right char of window
            // once window is larger than k, remove the leftmost char (slide the window)
            if (i >= k) window[s2.charAt(i - k) - 'a']--;
            // if frequency arrays match → current window is a permutation of s1
            if (Arrays.equals(need, window)) return true;
        }
        return false;
    }
}
// Time: O(|s1| + |s2|)  Space: O(1)
```

---

<a id="find-all-anagrams-in-a-string"></a>
## 5. 🟡 Find All Anagrams in a String

**Problem:** Given strings `s` and `p`, return all start indices of `p`'s anagrams in `s`.

**Test Cases:**
```
Input: s = "cbaebabacd", p = "abc"  →  Output: [0, 6]
Input: s = "abab",       p = "ab"   →  Output: [0, 1, 2]
Input: s = "aa",         p = "bb"   →  Output: []
```

**Java Solution:**
```java
class Solution {
    public List<Integer> findAnagrams(String s, String p) {
        List<Integer> result = new ArrayList<>();
        if (s.length() < p.length()) return result;
        int[] need = new int[26], window = new int[26];
        for (char c : p.toCharArray()) need[c - 'a']++; // frequency of each char in p
        int k = p.length(); // fixed window size
        for (int i = 0; i < s.length(); i++) {
            window[s.charAt(i) - 'a']++; // slide right: add new char
            // slide left: remove char that left the window
            if (i >= k) window[s.charAt(i - k) - 'a']--;
            // if window frequencies == p frequencies → anagram found at start index (i - k + 1)
            if (Arrays.equals(need, window)) result.add(i - k + 1);
        }
        return result;
    }
}
// Time: O(|s|)  Space: O(1)
```

---

<a id="longest-substring-with-at-most-k-distinct-characters"></a>
## 6. 🟡 Longest Substring with At Most K Distinct Characters

**Problem:** Given a string `s` and integer `k`, return the length of the longest substring with at most `k` distinct characters.

**Test Cases:**
```
Input: s = "eceba", k = 2  →  Output: 3  ("ece")
Input: s = "aa",    k = 1  →  Output: 2
Input: s = "abc",   k = 0  →  Output: 0
```

**Java Solution:**
```java
class Solution {
    public int lengthOfLongestSubstringKDistinct(String s, int k) {
        // map stores: char → count in current window
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            map.merge(c, 1, Integer::sum); // add s[right] to window
            // if we now have more than k distinct chars → window is invalid, shrink from left
            while (map.size() > k) {
                char lc = s.charAt(left++);
                map.merge(lc, -1, Integer::sum); // reduce count of leftmost char
                if (map.get(lc) == 0) map.remove(lc); // if count hits 0, remove it (reduces distinct count)
            }
            maxLen = Math.max(maxLen, right - left + 1); // valid window → update best
        }
        return maxLen;
    }
}
// Time: O(n)  Space: O(k)
```

---

<a id="group-anagrams"></a>
## 7. 🟡 Group Anagrams

**Problem:** Given an array of strings, group the anagrams together.

**Test Cases:**
```
Input: ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]

Input: [""]       →  Output: [[""]]
Input: ["a"]      →  Output: [["a"]]
```

**Java Solution:**
```java
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // key = sorted version of string (anagrams share the same sorted form)
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] ca = s.toCharArray();
            Arrays.sort(ca); // sort chars → all anagrams produce identical sorted key
            String key = new String(ca);
            // if key not yet in map, create new list; then add original string to its group
            map.computeIfAbsent(key, x -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values()); // each map value is one anagram group
    }
}
// Time: O(n * k log k)  Space: O(n * k)
```

---

<a id="valid-anagram"></a>
## 8. 🟢 Valid Anagram

**Problem:** Given strings `s` and `t`, return `true` if `t` is an anagram of `s`.

**Test Cases:**
```
Input: s = "anagram", t = "nagaram"  →  Output: true
Input: s = "rat",     t = "car"      →  Output: false
Input: s = "a",       t = "ab"       →  Output: false
```

**Java Solution:**
```java
class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false; // different lengths → can't be anagrams
        int[] count = new int[26]; // net frequency difference
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++; // +1 for each char in s
            count[t.charAt(i) - 'a']--; // -1 for each char in t
        }
        // if every count is 0, both strings have identical char frequencies → anagram
        for (int v : count) if (v != 0) return false;
        return true;
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="isomorphic-strings"></a>
## 9. 🟢 Isomorphic Strings

**Problem:** Given strings `s` and `t`, determine if they are isomorphic (characters in `s` can be replaced to get `t`).

**Test Cases:**
```
Input: s = "egg",  t = "add"  →  Output: true
Input: s = "foo",  t = "bar"  →  Output: false
Input: s = "paper",t = "title"→  Output: true
Input: s = "ab",   t = "aa"   →  Output: false
```

**Java Solution:**
```java
class Solution {
    public boolean isIsomorphic(String s, String t) {
        // sMap[c] = last index+1 where char c appeared in s
        // tMap[c] = last index+1 where char c appeared in t
        // Using i+1 so the default 0 means "never seen"
        int[] sMap = new int[256], tMap = new int[256];
        for (int i = 0; i < s.length(); i++) {
            int sc = s.charAt(i), tc = t.charAt(i);
            // if sMap[sc] != tMap[tc], the two chars last appeared at different positions
            // → the mapping is inconsistent → not isomorphic
            if (sMap[sc] != tMap[tc]) return false;
            sMap[sc] = i + 1; // record when this s-char was last seen
            tMap[tc] = i + 1; // record when this t-char was last seen
        }
        return true;
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="word-pattern"></a>
## 10. 🟢 Word Pattern

**Problem:** Given a pattern string and a string `s`, return `true` if `s` follows the same pattern (bijective mapping).

**Test Cases:**
```
Input: pattern = "abba", s = "dog cat cat dog"  →  Output: true
Input: pattern = "abba", s = "dog cat cat fish"  →  Output: false
Input: pattern = "aaaa", s = "dog cat cat dog"  →  Output: false
```

**Java Solution:**
```java
class Solution {
    public boolean wordPattern(String pattern, String s) {
        String[] words = s.split(" ");
        if (pattern.length() != words.length) return false; // mismatch count → false
        Map<Character, String> p2w = new HashMap<>(); // pattern char → word
        Map<String, Character> w2p = new HashMap<>(); // word → pattern char (bijective check)
        for (int i = 0; i < pattern.length(); i++) {
            char p = pattern.charAt(i);
            String w = words[i];
            // if pattern char p already maps to a DIFFERENT word → conflict
            if (p2w.containsKey(p) && !p2w.get(p).equals(w)) return false;
            // if word w already maps to a DIFFERENT pattern char → conflict (ensures bijection)
            if (w2p.containsKey(w) && w2p.get(w) != p) return false;
            p2w.put(p, w); // establish / confirm mapping p → w
            w2p.put(w, p); // establish / confirm reverse mapping w → p
        }
        return true;
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="determine-if-two-strings-are-close"></a>
## 11. 🟡 Determine if Two Strings Are Close

**Problem:** Two strings are "close" if you can make one from the other using: (1) swap any two existing characters; (2) transform every occurrence of one character into another and vice versa. Return `true` if `word1` and `word2` are close.

**Test Cases:**
```
Input: word1 = "abc",   word2 = "bca"    →  Output: true
Input: word1 = "a",     word2 = "aa"     →  Output: false
Input: word1 = "cabbba",word2 = "abbccc" →  Output: true
Input: word1 = "cabbba",word2 = "aabbss" →  Output: false
```

**Java Solution:**
```java
class Solution {
    public boolean closeStrings(String word1, String word2) {
        if (word1.length() != word2.length()) return false; // must have same length
        int[] f1 = new int[26], f2 = new int[26];
        for (char c : word1.toCharArray()) f1[c - 'a']++; // frequency of each char in word1
        for (char c : word2.toCharArray()) f2[c - 'a']++; // frequency of each char in word2
        // Condition 1: both strings must use the SAME SET of characters
        // (op 2 lets us swap frequencies but not introduce new characters)
        // Same set of characters
        for (int i = 0; i < 26; i++)
            if ((f1[i] == 0) != (f2[i] == 0)) return false; // one has char, other doesn't
        // Condition 2: the MULTISET of frequencies must match
        // (op 1 lets us rearrange chars; op 2 lets us swap frequency values between chars)
        // Same multiset of frequencies
        Arrays.sort(f1);
        Arrays.sort(f2);
        return Arrays.equals(f1, f2); // sorted freq arrays equal → close
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="find-the-difference"></a>
## 12. 🟢 Find the Difference

**Problem:** You are given two strings `s` and `t` where `t` is generated by randomly shuffling `s` and then adding one more random character. Find the added character.

**Test Cases:**
```
Input: s = "abcd", t = "abcde"  →  Output: 'e'
Input: s = "",     t = "y"      →  Output: 'y'
Input: s = "a",    t = "aa"     →  Output: 'a'
```

**Java Solution:**
```java
class Solution {
    public char findTheDifference(String s, String t) {
        int xor = 0;
        // XOR all chars in s: each char cancels itself if it appears twice
        for (char c : s.toCharArray()) xor ^= c;
        // XOR all chars in t: the extra char in t won't cancel → it's left in xor
        for (char c : t.toCharArray()) xor ^= c;
        // xor now holds the ASCII value of the single added character
        return (char) xor;
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="reverse-words-in-a-string"></a>
## 13. 🟡 Reverse Words in a String

**Problem:** Given a string `s`, reverse the order of words (words separated by spaces; leading/trailing/multiple spaces should be trimmed).

**Test Cases:**
```
Input: "the sky is blue"     →  Output: "blue is sky the"
Input: "  hello world  "     →  Output: "world hello"
Input: "a good   example"    →  Output: "example good a"
```

**Java Solution:**
```java
class Solution {
    public String reverseWords(String s) {
        // trim() removes leading/trailing spaces; \\s+ splits on any whitespace run
        String[] words = s.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        // iterate from last word to first → builds reversed word order
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]);
            if (i > 0) sb.append(' '); // add space between words (not after last)
        }
        return sb.toString();
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="string-compression"></a>
## 14. 🟡 String Compression

**Problem:** Compress the array of characters `chars` in-place. For each group of consecutive repeating characters, write the character followed by its count (if > 1). Return the new length.

**Test Cases:**
```
Input: ["a","a","b","b","c","c","c"]  →  Output: 6, chars = ["a","2","b","2","c","3"]
Input: ["a"]                           →  Output: 1, chars = ["a"]
Input: ["a","b","b","b","b","b","b","b","b","b","b","b","b"]
       →  Output: 4, chars = ["a","b","1","2"]
```

**Java Solution:**
```java
class Solution {
    public int compress(char[] chars) {
        int write = 0, i = 0; // write = pointer to write compressed output in-place; i = read pointer
        while (i < chars.length) {
            char cur = chars[i]; // current group character
            int count = 0;
            // count how many consecutive identical chars starting at i
            while (i < chars.length && chars[i] == cur) { i++; count++; }
            chars[write++] = cur; // write the character itself
            if (count > 1) {
                // write the count as individual digit characters (e.g. 12 → '1','2')
                for (char c : String.valueOf(count).toCharArray())
                    chars[write++] = c;
            }
            // if count == 1, don't write any digit (per problem rules)
        }
        return write; // new length of compressed array
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="zigzag-conversion"></a>
## 15. 🟡 Zigzag Conversion

**Problem:** Write the string `s` in a zigzag pattern on a given number of rows, then read line by line.

**Test Cases:**
```
Input: s = "PAYPALISHIRING", numRows = 3  →  Output: "PAHNAPLSIIGYIR"
Input: s = "PAYPALISHIRING", numRows = 4  →  Output: "PINALSIGYAHRPI"
Input: s = "A",              numRows = 1  →  Output: "A"
```

**Java Solution:**
```java
class Solution {
    public String convert(String s, int numRows) {
        if (numRows == 1 || numRows >= s.length()) return s; // no zigzag needed
        StringBuilder[] rows = new StringBuilder[numRows];
        for (int i = 0; i < numRows; i++) rows[i] = new StringBuilder(); // one builder per row
        int cur = 0, dir = -1; // cur = current row; dir = +1 (going down) or -1 (going up)
        for (char c : s.toCharArray()) {
            rows[cur].append(c); // place char in current row
            // reverse direction at top row (0) or bottom row (numRows-1)
            if (cur == 0 || cur == numRows - 1) dir = -dir;
            cur += dir; // move to next row
        }
        StringBuilder sb = new StringBuilder();
        for (StringBuilder row : rows) sb.append(row); // concatenate rows top to bottom
        return sb.toString();
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="remove-all-adjacent-duplicates-in-string-ii"></a>
## 16. 🟡 Remove All Adjacent Duplicates in String II

**Problem:** Given a string `s` and an integer `k`, repeatedly remove `k` adjacent identical characters until no more can be removed. Return the final string.

**Test Cases:**
```
Input: s = "abcd",       k = 2  →  Output: "abcd"
Input: s = "deeedbbcccbdaa", k = 3  →  Output: "aa"
Input: s = "pbbcggttciiippooaais", k = 2  →  Output: "ps"
```

**Java Solution:**
```java
class Solution {
    public String removeDuplicates(String s, int k) {
        Deque<int[]> stack = new ArrayDeque<>(); // stack stores [char_ascii, consecutive_count]
        for (char c : s.toCharArray()) {
            // if top of stack has same char, increment its run count
            if (!stack.isEmpty() && stack.peek()[0] == c) {
                stack.peek()[1]++;
                // if run reaches k, pop it (those k chars are removed)
                if (stack.peek()[1] == k) stack.pop();
            } else {
                // new char different from top → push with count 1
                stack.push(new int[]{c, 1});
            }
        }
        // Rebuild string from stack (stack is in reverse order, so reverse at end)
        StringBuilder sb = new StringBuilder();
        for (int[] pair : stack) {
            for (int i = 0; i < pair[1]; i++) sb.append((char) pair[0]);
        }
        return sb.reverse().toString();
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="multiply-strings"></a>
## 17. 🟡 Multiply Strings

**Problem:** Given two non-negative integers `num1` and `num2` represented as strings, return their product as a string (cannot use BigInteger or convert directly to int).

**Test Cases:**
```
Input: num1 = "2",   num2 = "3"    →  Output: "6"
Input: num1 = "123", num2 = "456"  →  Output: "56088"
Input: num1 = "0",   num2 = "0"    →  Output: "0"
```

**Java Solution:**
```java
class Solution {
    public String multiply(String num1, String num2) {
        int m = num1.length(), n = num2.length();
        // Product of m-digit and n-digit numbers has at most m+n digits
        int[] pos = new int[m + n];
        // Multiply each digit pair, just like grade-school multiplication
        for (int i = m - 1; i >= 0; i--) {
            for (int j = n - 1; j >= 0; j--) {
                int mul = (num1.charAt(i) - '0') * (num2.charAt(j) - '0');
                // p1 is the carry position, p2 is the units position for this partial product
                int p1 = i + j, p2 = i + j + 1;
                int sum = mul + pos[p2]; // add existing carry-over in pos[p2]
                pos[p2] = sum % 10;     // units digit goes to p2
                pos[p1] += sum / 10;    // carry propagates to p1
            }
        }
        StringBuilder sb = new StringBuilder();
        // Skip leading zeros when building result string
        for (int d : pos) if (!(sb.length() == 0 && d == 0)) sb.append(d);
        return sb.length() == 0 ? "0" : sb.toString();
    }
}
// Time: O(m*n)  Space: O(m+n)
```

---

<a id="reverse-words-in-a-string-iii"></a>
## 18. 🟢 Reverse Words in a String III

**Problem:** Reverse each word in the string while preserving whitespace and word order.

**Test Cases:**
```
Input: "Let's take LeetCode contest"  →  Output: "s'teL ekat edoCteeL tsetno c"
Input: "God Ding"                     →  Output: "doG gniD"
Input: "a"                            →  Output: "a"
```

**Java Solution:**
```java
class Solution {
    public String reverseWords(String s) {
        String[] words = s.split(" "); // split on single space (spaces preserved)
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            // reverse each individual word and append to result
            sb.append(new StringBuilder(words[i]).reverse());
            if (i < words.length - 1) sb.append(' '); // preserve original spaces between words
        }
        return sb.toString();
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="string-to-integer-atoi"></a>
## 19. 🟡 String to Integer (atoi)

**Problem:** Implement `myAtoi(string s)` which converts a string to a 32-bit signed integer, handling leading whitespace, optional sign, and overflow.

**Test Cases:**
```
Input: "42"           →  Output: 42
Input: "   -42"       →  Output: -42
Input: "4193 with words" → Output: 4193
Input: "-91283472332" →  Output: -2147483648  (INT_MIN)
```

**Java Solution:**
```java
class Solution {
    public int myAtoi(String s) {
        int i = 0, n = s.length(), sign = 1;
        long result = 0;
        // Step 1: skip leading whitespace
        while (i < n && s.charAt(i) == ' ') i++;
        // Step 2: read optional sign character
        if (i < n && (s.charAt(i) == '+' || s.charAt(i) == '-')) {
            sign = s.charAt(i++) == '-' ? -1 : 1;
        }
        // Step 3: read consecutive digit characters and build number
        while (i < n && Character.isDigit(s.charAt(i))) {
            result = result * 10 + (s.charAt(i++) - '0'); // shift left and add next digit
            // Step 4: clamp to 32-bit signed int range before overflow
            if (result * sign > Integer.MAX_VALUE) return Integer.MAX_VALUE;
            if (result * sign < Integer.MIN_VALUE) return Integer.MIN_VALUE;
        }
        return (int)(result * sign);
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="decode-string"></a>
## 20. 🟡 Decode String

**Problem:** Given an encoded string, return its decoded form. The encoding rule is `k[encoded_string]` where `encoded_string` is repeated `k` times.

**Test Cases:**
```
Input: "3[a]2[bc]"      →  Output: "aaabcbc"
Input: "3[a2[c]]"       →  Output: "accaccacc"
Input: "2[abc]3[cd]ef"  →  Output: "abcabccdcdcdef"
```

**Java Solution:**
```java
class Solution {
    public String decodeString(String s) {
        Deque<Integer> countStack = new ArrayDeque<>();    // stores repetition counts
        Deque<StringBuilder> strStack = new ArrayDeque<>(); // stores strings built before '['
        StringBuilder cur = new StringBuilder(); // current string being built
        int k = 0; // accumulates multi-digit numbers
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) {
                k = k * 10 + (c - '0'); // build number digit by digit (handles multi-digit k)
            } else if (c == '[') {
                countStack.push(k);   // save current repeat count
                strStack.push(cur);   // save current string (what was built before this '[')
                cur = new StringBuilder(); // start fresh for the inner string
                k = 0; // reset count for next number
            } else if (c == ']') {
                int repeat = countStack.pop(); // how many times to repeat inner string
                StringBuilder prev = strStack.pop(); // the string built before this bracket
                String inner = cur.toString();
                // append inner string 'repeat' times to the previous context
                for (int i = 0; i < repeat; i++) prev.append(inner);
                cur = prev; // restore context
            } else {
                cur.append(c); // regular char: just append to current string
            }
        }
        return cur.toString();
    }
}
// Time: O(n * maxK)  Space: O(n)
```

---

<a id="compare-version-numbers"></a>
## 21. 🟡 Compare Version Numbers

**Problem:** Compare two version numbers `version1` and `version2`. Return -1, 1, or 0 if version1 < version2, > version2, or == version2.

**Test Cases:**
```
Input: version1 = "1.2",   version2 = "1.10"  →  Output: -1
Input: version1 = "1.01",  version2 = "1.001" →  Output: 0
Input: version1 = "1.0",   version2 = "1.0.0" →  Output: 0
```

**Java Solution:**
```java
class Solution {
    public int compareVersion(String version1, String version2) {
        // split by escaped '.' to get individual revision tokens
        String[] v1 = version1.split("\\.");
        String[] v2 = version2.split("\\.");
        int len = Math.max(v1.length, v2.length); // compare up to the longer version
        for (int i = 0; i < len; i++) {
            // missing revisions are treated as 0 (e.g. "1.0" vs "1.0.0")
            int n1 = i < v1.length ? Integer.parseInt(v1[i]) : 0;
            int n2 = i < v2.length ? Integer.parseInt(v2[i]) : 0;
            if (n1 < n2) return -1; // version1 is smaller
            if (n1 > n2) return 1;  // version1 is larger
            // equal → move to next revision
        }
        return 0; // all revisions equal
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="simplify-path"></a>
## 22. 🟡 Simplify Path

**Problem:** Given an absolute Unix file path, simplify it (handle `.`, `..`, and multiple slashes).

**Test Cases:**
```
Input: "/home/"          →  Output: "/home"
Input: "/../"            →  Output: "/"
Input: "/home//foo/"     →  Output: "/home/foo"
Input: "/a/./b/../../c/" →  Output: "/c"
```

**Java Solution:**
```java
class Solution {
    public String simplifyPath(String path) {
        Deque<String> stack = new ArrayDeque<>();
        for (String part : path.split("/")) {
            // ".." means go up one directory: pop the stack if not empty
            if (part.equals("..")) { if (!stack.isEmpty()) stack.pop(); }
            // skip empty parts (from leading/trailing/multiple slashes) and current dir "."
            else if (!part.isEmpty() && !part.equals(".")) stack.push(part);
        }
        // Rebuild path: stack is LIFO so insert each component at front
        StringBuilder sb = new StringBuilder();
        for (String s : stack) sb.insert(0, "/" + s);
        return sb.length() == 0 ? "/" : sb.toString(); // empty stack → root
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="restore-ip-addresses"></a>
## 23. 🟡 Restore IP Addresses

**Problem:** Given a string containing only digits, return all possible valid IP addresses that can be obtained from it.

**Test Cases:**
```
Input: "25525511135"  →  Output: ["255.255.11.135","255.255.111.35"]
Input: "0000"         →  Output: ["0.0.0.0"]
Input: "1111111111111111"  →  Output: []
```

**Java Solution:**
```java
class Solution {
    public List<String> restoreIpAddresses(String s) {
        List<String> result = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(String s, int start, List<String> parts, List<String> result) {
        // base case: exactly 4 parts and we've consumed the whole string
        if (parts.size() == 4 && start == s.length()) {
            result.add(String.join(".", parts)); // valid IP address found
            return;
        }
        // prune: too many parts already, or ran out of string with fewer than 4 parts
        if (parts.size() == 4 || start == s.length()) return;
        // try segments of length 1, 2, or 3
        for (int len = 1; len <= 3; len++) {
            if (start + len > s.length()) break;
            String seg = s.substring(start, start + len);
            if (seg.length() > 1 && seg.charAt(0) == '0') break; // no leading zeros
            if (Integer.parseInt(seg) > 255) break; // octet must be 0-255
            parts.add(seg);
            backtrack(s, start + len, parts, result); // recurse with this segment chosen
            parts.remove(parts.size() - 1); // backtrack: undo choice
        }
    }
}
// Time: O(1) (bounded by constant)  Space: O(1)
```

---

<a id="basic-calculator-ii"></a>
## 24. 🟡 Basic Calculator II

**Problem:** Implement a basic calculator to evaluate a string expression with `+`, `-`, `*`, `/` (integer division). No parentheses.

**Test Cases:**
```
Input: "3+2*2"     →  Output: 7
Input: " 3/2 "     →  Output: 1
Input: " 3+5 / 2 " →  Output: 5
```

**Java Solution:**
```java
class Solution {
    public int calculate(String s) {
        Deque<Integer> stack = new ArrayDeque<>();
        int num = 0;
        char op = '+'; // start with '+' so first number is pushed as-is
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) num = num * 10 + (c - '0'); // build multi-digit number
            // process when we hit an operator or end of string
            if ((!Character.isDigit(c) && c != ' ') || i == s.length() - 1) {
                switch (op) {
                    case '+': stack.push(num);  break;  // push positive number
                    case '-': stack.push(-num); break;  // push as negative number
                    // for * and /, pop top, compute, push result (handles precedence)
                    case '*': stack.push(stack.pop() * num); break;
                    case '/': stack.push(stack.pop() / num); break;
                }
                op = c;  // update operator for next iteration
                num = 0; // reset number accumulator
            }
        }
        // sum all values on stack (additions/subtractions are already sign-encoded)
        int result = 0;
        while (!stack.isEmpty()) result += stack.pop();
        return result;
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="longest-palindromic-substring"></a>
## 25. 🟡 Longest Palindromic Substring

**Problem:** Given a string `s`, return the longest palindromic substring.

**Test Cases:**
```
Input: "babad"  →  Output: "bab" (or "aba")
Input: "cbbd"   →  Output: "bb"
Input: "a"      →  Output: "a"
```

**Java Solution:**
```java
class Solution {
    private int start, maxLen;

    public String longestPalindrome(String s) {
        if (s.length() < 2) return s;
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);     // odd-length palindromes centered at i
            expand(s, i, i + 1); // even-length palindromes centered between i and i+1
        }
        return s.substring(start, start + maxLen);
    }

    private void expand(String s, int l, int r) {
        // expand outward as long as characters match
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
        // after loop, [l+1, r-1] is the palindrome
        // length = r - l - 1; update global best if this is longer
        if (r - l - 1 > maxLen) {
            maxLen = r - l - 1;
            start = l + 1; // start index of this palindrome
        }
    }
}
// Time: O(n²)  Space: O(1)
```

---

<a id="palindromic-substrings"></a>
## 26. 🟡 Palindromic Substrings

**Problem:** Given a string `s`, return the number of palindromic substrings in it.

**Test Cases:**
```
Input: "abc"  →  Output: 3  ("a","b","c")
Input: "aaa"  →  Output: 6  ("a","a","a","aa","aa","aaa")
```

**Java Solution:**
```java
class Solution {
    private int count = 0;

    public int countSubstrings(String s) {
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);     // expand from single center (odd-length)
            expand(s, i, i + 1); // expand from gap between i and i+1 (even-length)
        }
        return count;
    }

    private void expand(String s, int l, int r) {
        // each successful expansion is a valid palindromic substring
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            count++; // found one palindrome
            l--; r++; // try to expand further
        }
    }
}
// Time: O(n²)  Space: O(1)
```

---

<a id="valid-palindrome-ii"></a>
## 27. 🟢 Valid Palindrome II

**Problem:** Given a string `s`, return `true` if it can become a palindrome after deleting at most one character.

**Test Cases:**
```
Input: "aba"   →  Output: true
Input: "abca"  →  Output: true  (remove 'c')
Input: "abc"   →  Output: false
```

**Java Solution:**
```java
class Solution {
    public boolean validPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            if (s.charAt(l) != s.charAt(r))
                // mismatch found: try skipping either left or right character
                // if either of the resulting substrings is a palindrome, we're good
                return isPalin(s, l + 1, r) || isPalin(s, l, r - 1);
            l++; r--; // characters match, move inward
        }
        return true; // no mismatch found → already a palindrome
    }

    private boolean isPalin(String s, int l, int r) {
        while (l < r) {
            if (s.charAt(l++) != s.charAt(r--)) return false; // mismatch → not palindrome
        }
        return true;
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="count-palindromic-subsequences"></a>
## 28. 🔴 Count Palindromic Subsequences

**Problem:** Given a string `s`, return the number of distinct, non-empty palindromic subsequences. Since the answer may be very large, return it modulo 10^9 + 7.

**Test Cases:**
```
Input: "bccb"   →  Output: 6  ("b","c","c","b","cc","bccb")
Input: "abcdabcdabcdabcdabcdabcdabcdabcddcbadcbadcbadcbadcbadcbadcbadcba"  →  104860361
```

**Java Solution:**
```java
class Solution {
    public int countPalindromicSubsequences(String s) {
        int n = s.length();
        long MOD = 1_000_000_007L;
        long[][] dp = new long[n][n];
        // dp[i][j] = number of distinct palindromic subsequences in s[i..j]
        for (int i = 0; i < n; i++) dp[i][i] = 1; // each single char is 1 palindrome
        for (int len = 2; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                if (s.charAt(i) == s.charAt(j)) {
                    // find innermost occurrences of the same char within (i, j)
                    int lo = i + 1, hi = j - 1;
                    while (lo <= hi && s.charAt(lo) != s.charAt(i)) lo++;
                    while (lo <= hi && s.charAt(hi) != s.charAt(j)) hi--;
                    if (lo > hi) {
                        // char s[i] does NOT appear inside → add 2 new palindromes (s[i] alone and s[i]s[j])
                        dp[i][j] = dp[i + 1][j - 1] * 2 + 2;
                    } else if (lo == hi) {
                        // char appears exactly once inside → add 1 new palindrome (s[i]s[j] wrap)
                        dp[i][j] = dp[i + 1][j - 1] * 2 + 1;
                    } else {
                        // char appears at least twice inside → subtract duplicates (lo+1..hi-1 was counted twice)
                        dp[i][j] = dp[i + 1][j - 1] * 2 - dp[lo + 1][hi - 1];
                    }
                } else {
                    // chars differ: inclusion-exclusion to avoid double-counting
                    dp[i][j] = dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1];
                }
                dp[i][j] = ((dp[i][j] % MOD) + MOD) % MOD; // keep result positive mod
            }
        }
        return (int) dp[0][n - 1];
    }
}
// Time: O(n²)  Space: O(n²)
```

---

<a id="partition-labels"></a>
## 29. 🟡 Partition Labels

**Problem:** Partition string `s` into as many parts as possible so that each letter appears in at most one part. Return the list of partition sizes.

**Test Cases:**
```
Input: "ababcbacadefegdehijhklij"  →  Output: [9,7,8]
Input: "eccbbbbdec"               →  Output: [10]
Input: "a"                        →  Output: [1]
```

**Java Solution:**
```java
class Solution {
    public List<Integer> partitionLabels(String s) {
        int[] last = new int[26];
        // record the last occurrence index of each character
        for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
        List<Integer> result = new ArrayList<>();
        int start = 0, end = 0; // current partition boundaries
        for (int i = 0; i < s.length(); i++) {
            // extend the partition end to include the last occurrence of current char
            end = Math.max(end, last[s.charAt(i) - 'a']);
            // if we've reached the end of the partition → close it
            if (i == end) {
                result.add(end - start + 1); // record partition size
                start = end + 1; // start next partition right after
            }
        }
        return result;
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="remove-duplicate-letters"></a>
## 30. 🟡 Remove Duplicate Letters

**Problem:** Given a string `s`, remove duplicate letters so that every letter appears once and the result is the smallest in lexicographic order among all possible results.

**Test Cases:**
```
Input: "bcabc"   →  Output: "abc"
Input: "cbacdcbc"→  Output: "acdb"
```

**Java Solution:**
```java
class Solution {
    public String removeDuplicateLetters(String s) {
        int[] count = new int[26];    // remaining occurrences of each char
        boolean[] inStack = new boolean[26]; // whether char is already in result stack
        for (char c : s.toCharArray()) count[c - 'a']++;
        Deque<Character> stack = new ArrayDeque<>(); // monotonic stack (result built here)
        for (char c : s.toCharArray()) {
            count[c - 'a']--; // one fewer occurrence remaining
            if (inStack[c - 'a']) continue; // already in result, skip duplicate
            // Pop chars that are: (a) larger than c [not smallest] AND
            //                     (b) will appear again later [safe to remove now]
            while (!stack.isEmpty() && stack.peek() > c && count[stack.peek() - 'a'] > 0) {
                inStack[stack.pop() - 'a'] = false; // mark as no longer in stack
            }
            stack.push(c);          // add current char to result
            inStack[c - 'a'] = true; // mark it as in stack
        }
        StringBuilder sb = new StringBuilder();
        for (char c : stack) sb.append(c);
        return sb.reverse().toString(); // stack is LIFO, reverse to get correct order
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="reorganize-string"></a>
## 31. Reorganize String

**Problem:** Given a string `s`, rearrange the characters so that no two adjacent characters are the same. Return any valid arrangement, or `""` if impossible.

**Test Cases:**
```
Input: "aab"   →  Output: "aba"
Input: "aaab"  →  Output: ""
Input: "vvvlo" →  Output: "vlvov" (or similar valid)
```

**Java Solution:**
```java
class Solution {
    public String reorganizeString(String s) {
        int[] freq = new int[26];
        for (char c : s.toCharArray()) freq[c - 'a']++; // count frequency of each char
        // Max-heap: [frequency, character index] — always process most frequent char first
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> b[0] - a[0]);
        for (int i = 0; i < 26; i++) if (freq[i] > 0) pq.offer(new int[]{freq[i], i});
        StringBuilder sb = new StringBuilder();
        // Always take top two most frequent chars and alternate them
        while (pq.size() >= 2) {
            int[] a = pq.poll(), b = pq.poll(); // two most frequent
            sb.append((char)('a' + a[1])); // append char a
            sb.append((char)('a' + b[1])); // append char b (different from a)
            if (--a[0] > 0) pq.offer(a); // reinsert if still has remaining count
            if (--b[0] > 0) pq.offer(b);
        }
        if (!pq.isEmpty()) {
            // one char left: if it appears more than once we can't avoid adjacency
            if (pq.peek()[0] > 1) return "";
            sb.append((char)('a' + pq.poll()[1])); // safely append single remaining char
        }
        return sb.toString();
    }
}
// Time: O(n log k)  Space: O(k)  where k=26
```

---

<a id="partition-string-into-substrings-with-unique-characters"></a>
## 32. Partition String Into Substrings With Unique Characters

**Problem:** Partition string `s` into one or more substrings such that the characters in each substring are unique. Return the minimum number of substrings in such a partition.

**Test Cases:**
```
Input: "abacaba"  →  Output: 4  ("a","b","ac","aba" → actually "a","b","a","caba" → "ab","ac","a","ba")
Input: "ssssss"   →  Output: 6
```

**Java Solution:**
```java
class Solution {
    public int partitionString(String s) {
        Set<Character> seen = new HashSet<>(); // chars in current partition
        int parts = 1; // start with 1 partition
        for (char c : s.toCharArray()) {
            if (seen.contains(c)) {
                // char already seen in this partition → start a new one
                parts++;
                seen.clear(); // reset for new partition
            }
            seen.add(c); // add char to current partition
        }
        return parts;
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="implement-strstr"></a>
## 33. Implement strStr()

**Problem:** Return the index of the first occurrence of needle in haystack, or -1 if not present.

**Test Cases:**
```
Input: haystack = "sadbutsad", needle = "sad"  →  Output: 0
Input: haystack = "leetcode",  needle = "leeto" →  Output: -1
Input: haystack = "hello",     needle = "ll"    →  Output: 2
```

**Java Solution (KMP):**
```java
class Solution {
    public int strStr(String haystack, String needle) {
        if (needle.isEmpty()) return 0;
        int[] lps = buildLPS(needle); // precompute LPS (Longest Prefix Suffix) array
        int i = 0, j = 0; // i = haystack pointer, j = needle pointer
        while (i < haystack.length()) {
            if (haystack.charAt(i) == needle.charAt(j)) { i++; j++; } // chars match, advance both
            if (j == needle.length()) return i - j; // full needle matched, return start index
            else if (i < haystack.length() && haystack.charAt(i) != needle.charAt(j)) {
                // mismatch: use LPS to skip redundant comparisons (don't reset j to 0)
                if (j != 0) j = lps[j - 1]; // fall back to best matching prefix
                else i++; // no prefix to fall back to, advance haystack
            }
        }
        return -1;
    }

    private int[] buildLPS(String pat) {
        // lps[i] = length of longest proper prefix of pat[0..i] which is also a suffix
        int[] lps = new int[pat.length()];
        int len = 0, i = 1; // len = current longest prefix-suffix length
        while (i < pat.length()) {
            if (pat.charAt(i) == pat.charAt(len)) lps[i++] = ++len; // extend prefix-suffix
            else if (len != 0) len = lps[len - 1]; // mismatch: fall back
            else lps[i++] = 0; // no prefix-suffix possible
        }
        return lps;
    }
}
// Time: O(n + m)  Space: O(m)
```

---

<a id="repeated-dna-sequences"></a>
## 34. Repeated DNA Sequences

**Problem:** Given a DNA string `s`, find all 10-letter-long sequences that appear more than once.

**Test Cases:**
```
Input: "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"  →  Output: ["AAAAACCCCC","CCCCCAAAAA"]
Input: "AAAAAAAAAAAAA"                     →  Output: ["AAAAAAAAAA"]
```

**Java Solution:**
```java
class Solution {
    public List<String> findRepeatedDnaSequences(String s) {
        Set<String> seen = new HashSet<>(), repeated = new HashSet<>();
        for (int i = 0; i + 10 <= s.length(); i++) {
            String sub = s.substring(i, i + 10); // extract 10-char window
            // if seen.add returns false, the substring was already in the set → it's repeated
            if (!seen.add(sub)) repeated.add(sub);
        }
        return new ArrayList<>(repeated);
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="longest-happy-prefix"></a>
## 35. Longest Happy Prefix

**Problem:** A string is a "happy prefix" if it is both a prefix and suffix (non-trivial). Return the longest such prefix of `s`.

**Test Cases:**
```
Input: "level"          →  Output: "l"
Input: "ababab"         →  Output: "abab"
Input: "leetcodeleet"   →  Output: "leet"
Input: "a"              →  Output: ""
```

**Java Solution (KMP failure function):**
```java
class Solution {
    public String longestPrefix(String s) {
        int n = s.length();
        // Build KMP failure function (LPS array) for the string itself
        // lps[i] = length of longest proper prefix of s[0..i] that is also a suffix
        int[] lps = new int[n];
        int len = 0, i = 1;
        while (i < n) {
            if (s.charAt(i) == s.charAt(len)) lps[i++] = ++len; // extend prefix-suffix
            else if (len != 0) len = lps[len - 1]; // fall back
            else lps[i++] = 0;
        }
        // lps[n-1] gives the length of the longest happy prefix
        return s.substring(0, lps[n - 1]);
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="word-break"></a>
## 36. Word Break

**Problem:** Given a string `s` and a dictionary `wordDict`, return `true` if `s` can be segmented into space-separated dictionary words.

**Test Cases:**
```
Input: s = "leetcode",  wordDict = ["leet","code"]          →  true
Input: s = "applepenapple", wordDict = ["apple","pen"]       →  true
Input: s = "catsandog",  wordDict = ["cats","dog","sand","and","cat"] → false
```

**Java Solution:**
```java
class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> set = new HashSet<>(wordDict); // O(1) lookup for each word
        int n = s.length();
        boolean[] dp = new boolean[n + 1];
        dp[0] = true; // empty string is always segmentable
        for (int i = 1; i <= n; i++) {
            // try every possible last word ending at index i
            for (int j = 0; j < i; j++) {
                // if s[0..j-1] was segmentable AND s[j..i-1] is a dictionary word
                if (dp[j] && set.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break; // no need to check more splits for index i
                }
            }
        }
        return dp[n];
    }
}
// Time: O(n²)  Space: O(n)
```

---

<a id="decode-ways"></a>
## 37. Decode Ways

**Problem:** A message encoded as digits where 'A'=1 ... 'Z'=26. Return the number of ways to decode it.

**Test Cases:**
```
Input: "12"   →  Output: 2  ("AB" or "L")
Input: "226"  →  Output: 3  ("BZ","VF","BBF")
Input: "06"   →  Output: 0
Input: "10"   →  Output: 1
```

**Java Solution:**
```java
class Solution {
    public int numDecodings(String s) {
        int n = s.length();
        int[] dp = new int[n + 1];
        dp[0] = 1; // empty string → 1 way (base case)
        dp[1] = s.charAt(0) != '0' ? 1 : 0; // single digit: 1 way if non-zero, else 0
        for (int i = 2; i <= n; i++) {
            int one = s.charAt(i - 1) - '0'; // last single digit
            int two = Integer.parseInt(s.substring(i - 2, i)); // last two digits
            // if single digit is valid (1-9), we can decode it as one character
            if (one >= 1) dp[i] += dp[i - 1];
            // if two-digit number is valid (10-26), we can decode it as one character
            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
        }
        return dp[n];
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="interleaving-string"></a>
## 38. Interleaving String

**Problem:** Given strings `s1`, `s2`, and `s3`, return `true` if `s3` is formed by an interleaving of `s1` and `s2`.

**Test Cases:**
```
Input: s1="aabcc", s2="dbbca", s3="aadbbcbcac"  →  true
Input: s1="aabcc", s2="dbbca", s3="aadbbbaccc"  →  false
Input: s1="", s2="", s3=""                       →  true
```

**Java Solution:**
```java
class Solution {
    public boolean isInterleave(String s1, String s2, String s3) {
        int m = s1.length(), n = s2.length();
        if (m + n != s3.length()) return false; // total length must match
        // dp[i][j] = true if s3[0..i+j-1] can be formed by interleaving s1[0..i-1] and s2[0..j-1]
        boolean[][] dp = new boolean[m + 1][n + 1];
        dp[0][0] = true; // empty strings trivially interleave to empty s3
        // fill first column: use only s1
        for (int i = 1; i <= m; i++) dp[i][0] = dp[i-1][0] && s1.charAt(i-1) == s3.charAt(i-1);
        // fill first row: use only s2
        for (int j = 1; j <= n; j++) dp[0][j] = dp[0][j-1] && s2.charAt(j-1) == s3.charAt(j-1);
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                // either take from s1 (if prev state valid and s1 char matches s3 char)
                // or take from s2 (if prev state valid and s2 char matches s3 char)
                dp[i][j] = (dp[i-1][j] && s1.charAt(i-1) == s3.charAt(i+j-1))
                         || (dp[i][j-1] && s2.charAt(j-1) == s3.charAt(i+j-1));
        return dp[m][n];
    }
}
// Time: O(m*n)  Space: O(m*n)
```

---

<a id="longest-common-subsequence"></a>
## 39. Longest Common Subsequence

**Problem:** Given two strings `text1` and `text2`, return the length of their longest common subsequence.

**Test Cases:**
```
Input: text1 = "abcde", text2 = "ace"   →  Output: 3  ("ace")
Input: text1 = "abc",   text2 = "abc"   →  Output: 3
Input: text1 = "abc",   text2 = "def"   →  Output: 0
```

**Java Solution:**
```java
class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        // dp[i][j] = LCS length for text1[0..i-1] and text2[0..j-1]
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                // if chars match → extend the LCS from diagonal (both shrink by 1)
                // else → take the best of skipping one char from either string
                dp[i][j] = text1.charAt(i-1) == text2.charAt(j-1)
                          ? dp[i-1][j-1] + 1
                          : Math.max(dp[i-1][j], dp[i][j-1]);
        return dp[m][n];
    }
}
// Time: O(m*n)  Space: O(m*n)
```

---

<a id="word-ladder"></a>
## 40. Word Ladder

**Problem:** Given `beginWord`, `endWord`, and a `wordList`, return the number of words in the shortest transformation sequence from `beginWord` to `endWord` (changing one letter at a time, each intermediate word must be in the list).

**Test Cases:**
```
Input: beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log","cog"]  →  5
Input: beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log"]        →  0
```

**Java Solution (BFS):**
```java
class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Set<String> dict = new HashSet<>(wordList);
        if (!dict.contains(endWord)) return 0;
        Queue<String> queue = new LinkedList<>();
        queue.offer(beginWord);
        Set<String> visited = new HashSet<>();
        visited.add(beginWord);
        int steps = 1;
        while (!queue.isEmpty()) {
            int size = queue.size();
            while (size-- > 0) {
                String word = queue.poll();
                char[] arr = word.toCharArray();
                for (int i = 0; i < arr.length; i++) {
                    char orig = arr[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        arr[i] = c;
                        String next = new String(arr);
                        if (next.equals(endWord)) return steps + 1;
                        if (dict.contains(next) && !visited.contains(next)) {
                            visited.add(next);
                            queue.offer(next);
                        }
                    }
                    arr[i] = orig;
                }
            }
            steps++;
        }
        return 0;
    }
}
// Time: O(n * L * 26)  Space: O(n)
```

---

<a id="edit-distance"></a>
## 41. Edit Distance

**Problem:** Given strings `word1` and `word2`, return the minimum number of operations (insert, delete, replace) to convert `word1` to `word2`.

**Test Cases:**
```
Input: word1 = "horse", word2 = "ros"    →  Output: 3
Input: word1 = "intention", word2 = "execution"  →  Output: 5
Input: word1 = "",      word2 = "a"      →  Output: 1
```

**Java Solution:**
```java
class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        // dp[i][j] = min edits to convert word1[0..i-1] to word2[0..j-1]
        int[][] dp = new int[m + 1][n + 1];
        // base cases: converting to/from empty string costs i or j deletions/insertions
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                // if chars match → no new operation needed (take diagonal)
                // else → 1 op + min(replace dp[i-1][j-1], delete dp[i-1][j], insert dp[i][j-1])
                dp[i][j] = word1.charAt(i-1) == word2.charAt(j-1)
                          ? dp[i-1][j-1]
                          : 1 + Math.min(dp[i-1][j-1], Math.min(dp[i-1][j], dp[i][j-1]));
        return dp[m][n];
    }
}
// Time: O(m*n)  Space: O(m*n)
```

---

<a id="distinct-subsequences"></a>
## 42. Distinct Subsequences

**Problem:** Given strings `s` and `t`, return the number of distinct subsequences of `s` that equals `t`.

**Test Cases:**
```
Input: s = "rabbbit", t = "rabbit"  →  Output: 3
Input: s = "babgbag",  t = "bag"    →  Output: 5
```

**Java Solution:**
```java
class Solution {
    public int numDistinct(String s, String t) {
        int m = s.length(), n = t.length();
        // dp[i][j] = number of ways s[0..i-1] contains t[0..j-1] as a subsequence
        long[][] dp = new long[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = 1; // empty t is always a subsequence: 1 way
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                dp[i][j] = dp[i-1][j]; // always: don't use s[i-1] (skip it)
                // if s[i-1] == t[j-1], also add the ways where we USE s[i-1] to match t[j-1]
                if (s.charAt(i-1) == t.charAt(j-1)) dp[i][j] += dp[i-1][j-1];
            }
        return (int) dp[m][n];
    }
}
// Time: O(m*n)  Space: O(m*n)
```

---

<a id="word-search-ii"></a>
## 43. Word Search II

**Problem:** Given an `m x n` board of characters and a list of strings `words`, return all words on the board (each cell used at most once per word).

**Test Cases:**
```
Input: board=[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]
       words=["oath","pea","eat","rain"]  →  Output: ["eat","oath"]

Input: board=[["a","b"],["c","d"]], words=["abcb"]  →  Output: []
```

**Java Solution (Trie + DFS):**
```java
class Solution {
    class TrieNode {
        TrieNode[] children = new TrieNode[26];
        String word = null; // non-null if this node marks end of a word
    }

    public List<String> findWords(char[][] board, String[] words) {
        // Step 1: Insert all words into Trie for efficient prefix matching
        TrieNode root = new TrieNode();
        for (String w : words) {
            TrieNode node = root;
            for (char c : w.toCharArray()) {
                int i = c - 'a';
                if (node.children[i] == null) node.children[i] = new TrieNode();
                node = node.children[i];
            }
            node.word = w; // mark end of word
        }
        List<String> result = new ArrayList<>();
        // Step 2: Start DFS from every cell on the board
        for (int i = 0; i < board.length; i++)
            for (int j = 0; j < board[0].length; j++)
                dfs(board, i, j, root, result);
        return result;
    }

    private void dfs(char[][] board, int i, int j, TrieNode node, List<String> result) {
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) return; // out of bounds
        char c = board[i][j];
        if (c == '#' || node.children[c - 'a'] == null) return; // visited or no trie path
        node = node.children[c - 'a']; // descend into trie
        if (node.word != null) { result.add(node.word); node.word = null; } // word found, dedup
        board[i][j] = '#'; // mark cell as visited (avoid reuse in same word)
        dfs(board, i+1, j, node, result); // explore all 4 directions
        dfs(board, i-1, j, node, result);
        dfs(board, i, j+1, node, result);
        dfs(board, i, j-1, node, result);
        board[i][j] = c; // restore cell (backtrack)
    }
}
// Time: O(m*n*4^L)  Space: O(W*L)
```

---

<a id="alien-dictionary"></a>
## 44. Alien Dictionary

**Problem:** Given a sorted list of words in an alien language, derive the order of letters in the alien alphabet. Return any valid ordering, or `""` if invalid.

**Test Cases:**
```
Input: ["wrt","wrf","er","ett","rftt"]  →  Output: "wertf"
Input: ["z","x"]                        →  Output: "zx"
Input: ["z","x","z"]                    →  Output: ""  (cycle)
Input: ["abc","ab"]                     →  Output: ""  (invalid)
```

**Java Solution (Topological Sort):**
```java
class Solution {
    public String alienOrder(String[] words) {
        Map<Character, Set<Character>> graph = new HashMap<>();
        Map<Character, Integer> inDegree = new HashMap<>();
        // Initialize graph nodes for every unique character seen
        for (String w : words) for (char c : w.toCharArray()) {
            graph.putIfAbsent(c, new HashSet<>());
            inDegree.putIfAbsent(c, 0);
        }
        // Compare adjacent words to extract ordering constraints
        for (int i = 0; i < words.length - 1; i++) {
            String w1 = words[i], w2 = words[i + 1];
            int minLen = Math.min(w1.length(), w2.length());
            // invalid: longer word is a prefix of shorter → bad ordering
            if (w1.length() > w2.length() && w1.startsWith(w2)) return "";
            for (int j = 0; j < minLen; j++) {
                if (w1.charAt(j) != w2.charAt(j)) {
                    // first differing char gives us an edge: w1[j] comes before w2[j]
                    if (!graph.get(w1.charAt(j)).contains(w2.charAt(j))) {
                        graph.get(w1.charAt(j)).add(w2.charAt(j));
                        inDegree.merge(w2.charAt(j), 1, Integer::sum); // increment in-degree
                    }
                    break; // only first difference counts between adjacent words
                }
            }
        }
        // BFS topological sort (Kahn's algorithm)
        Queue<Character> queue = new LinkedList<>();
        for (char c : inDegree.keySet()) if (inDegree.get(c) == 0) queue.offer(c); // start with 0 in-degree
        StringBuilder sb = new StringBuilder();
        while (!queue.isEmpty()) {
            char c = queue.poll();
            sb.append(c); // add char to result order
            for (char next : graph.get(c)) {
                inDegree.merge(next, -1, Integer::sum); // remove edge
                if (inDegree.get(next) == 0) queue.offer(next); // now processable
            }
        }
        // if result has all chars → valid; else there's a cycle → invalid
        return sb.length() == inDegree.size() ? sb.toString() : "";
    }
}
// Time: O(C)  Space: O(1) — at most 26 chars
```

---

<a id="text-justification"></a>
## 45. Text Justification

**Problem:** Given words and a maximum line width `maxWidth`, format the text such that each line has exactly `maxWidth` characters (full justification, last line left-justified).

**Test Cases:**
```
Input: words=["This","is","an","example","of","text","justification."], maxWidth=16
Output: ["This    is    an","example  of text","justification.  "]

Input: words=["What","must","be","acknowledgment","shall","be"], maxWidth=16
Output: ["What   must   be","acknowledgment  ","shall be        "]
```

**Java Solution:**
```java
class Solution {
    public List<String> fullJustify(String[] words, int maxWidth) {
        List<String> result = new ArrayList<>();
        int i = 0, n = words.length;
        while (i < n) {
            // Greedily pack words into current line
            int lineLen = words[i].length(), j = i + 1;
            while (j < n && lineLen + 1 + words[j].length() <= maxWidth) {
                lineLen += 1 + words[j++].length(); // +1 for minimum 1 space between words
            }
            int numWords = j - i;
            // numSpaces: total spaces needed (maxWidth minus actual word chars)
            int numSpaces = maxWidth - lineLen + (numWords - 1);
            StringBuilder sb = new StringBuilder(words[i]);
            if (j == n || numWords == 1) {
                // Last line or single word: left-justify (single space between, pad right)
                for (int k = i + 1; k < j; k++) sb.append(' ').append(words[k]);
                while (sb.length() < maxWidth) sb.append(' ');
            } else {
                // Full justification: distribute spaces as evenly as possible
                int gaps = numWords - 1;
                int spaceEach = numSpaces / gaps;   // base spaces per gap
                int extra = numSpaces % gaps;         // first 'extra' gaps get one extra space
                for (int k = i + 1; k < j; k++) {
                    int sp = spaceEach + (k - i <= extra ? 1 : 0); // extra space for early gaps
                    for (int s = 0; s < sp; s++) sb.append(' ');
                    sb.append(words[k]);
                }
            }
            result.add(sb.toString());
            i = j; // move to next line
        }
        return result;
    }
}
// Time: O(n * maxWidth)  Space: O(maxWidth)
```

---

<a id="shortest-way-to-form-string"></a>
## 46. Shortest Way to Form String

**Problem:** Return the minimum number of subsequences of `source` needed to form `target`, or -1 if impossible.

**Test Cases:**
```
Input: source = "abc", target = "abcbc"  →  Output: 2
Input: source = "abc", target = "acdbc"  →  Output: 3
Input: source = "xyz", target = "xzyxz"  →  Output: 3
Input: source = "abc", target = "xbc"    →  Output: -1
```

**Java Solution:**
```java
class Solution {
    public int shortestWay(String source, String target) {
        boolean[] inSource = new boolean[26];
        for (char c : source.toCharArray()) inSource[c - 'a'] = true;
        // if any target char doesn't exist in source → impossible
        for (char c : target.toCharArray())
            if (!inSource[c - 'a']) return -1;

        int count = 1; // number of source subsequence passes used
        int j = 0;     // pointer into source
        for (int i = 0; i < target.length(); i++) {
            boolean found = false;
            // scan source from current position to find target[i]
            while (j < source.length()) {
                if (source.charAt(j++) == target.charAt(i)) { found = true; break; }
            }
            if (!found) {
                // exhausted source without finding target[i] → start a new pass
                count++; j = 0; i--; // retry target[i] from beginning of source
            }
        }
        return count;
    }
}
// Time: O(|source| * |target|)  Space: O(1)
```

---

<a id="minimum-deletions-to-make-character-frequencies-unique"></a>
## 47. Minimum Deletions to Make Character Frequencies Unique

**Problem:** A string is "good" if no two characters have the same frequency. Return the minimum number of deletions to make `s` good.

**Test Cases:**
```
Input: "aab"      →  Output: 0
Input: "aaabbbcc" →  Output: 2
Input: "ceabaacb" →  Output: 2
```

**Java Solution:**
```java
class Solution {
    public int minDeletions(String s) {
        int[] freq = new int[26];
        for (char c : s.toCharArray()) freq[c - 'a']++; // count each char's frequency
        Arrays.sort(freq); // sort ascending so we process from highest frequency downwards
        int deletions = 0;
        // iterate from second-highest to lowest (compare with its right neighbor)
        for (int i = 24; i >= 0; i--) {
            if (freq[i] == 0) break; // no more non-zero frequencies
            if (freq[i] >= freq[i + 1]) {
                // current freq must be strictly less than freq[i+1]; reduce it
                int newFreq = Math.max(0, freq[i + 1] - 1); // target unique freq below right neighbor
                deletions += freq[i] - newFreq; // deletions needed to go from freq[i] to newFreq
                freq[i] = newFreq; // update so next left neighbor compares correctly
            }
        }
        return deletions;
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="encode-and-decode-strings"></a>
## 48. Encode and Decode Strings

**Problem:** Design an algorithm to encode a list of strings to a single string, and decode it back.

**Test Cases:**
```
Input: ["lint","code","love","you"]  →  Encode → Decode → ["lint","code","love","you"]
Input: [""]                          →  Encode → Decode → [""]
Input: ["Hello", "World"]            →  Encode → Decode → ["Hello", "World"]
```

**Java Solution (length-prefix encoding):**
```java
class Codec {
    public String encode(List<String> strs) {
        StringBuilder sb = new StringBuilder();
        // Format: "<length>#<string>" for each string
        // Using '#' as delimiter after length makes decoding unambiguous regardless of string content
        for (String s : strs) sb.append(s.length()).append('#').append(s);
        return sb.toString();
    }

    public List<String> decode(String s) {
        List<String> result = new ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            int j = s.indexOf('#', i); // find '#' to locate the length prefix
            int len = Integer.parseInt(s.substring(i, j)); // parse the length
            result.add(s.substring(j + 1, j + 1 + len)); // extract exactly 'len' chars after '#'
            i = j + 1 + len; // advance past this entry
        }
        return result;
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="find-and-replace-pattern"></a>
## 49. Find and Replace Pattern

**Problem:** Given a list of strings `words` and a `pattern`, return every word that matches the pattern (same bijective mapping as isomorphic strings).

**Test Cases:**
```
Input: words=["abc","deq","mee","aqq","dkd","ccc"], pattern="abb"
Output: ["mee","aqq"]

Input: words=["a","b","c"], pattern="a"  →  Output: ["a","b","c"]
```

**Java Solution:**
```java
class Solution {
    public List<String> findAndReplacePattern(String[] words, String pattern) {
        List<String> result = new ArrayList<>();
        // check each word against the pattern
        for (String word : words) if (matches(word, pattern)) result.add(word);
        return result;
    }

    private boolean matches(String word, String pattern) {
        if (word.length() != pattern.length()) return false;
        // w2p[c] = last index+1 where word char c was seen
        // p2w[c] = last index+1 where pattern char c was seen
        // same trick as Isomorphic Strings (problem 9)
        int[] w2p = new int[256], p2w = new int[256];
        for (int i = 0; i < word.length(); i++) {
            char w = word.charAt(i), p = pattern.charAt(i);
            // if the last-seen timestamps differ → inconsistent bijection
            if (w2p[w] != p2w[p]) return false;
            w2p[w] = i + 1; // update timestamps to current position
            p2w[p] = i + 1;
        }
        return true;
    }
}
// Time: O(n * L)  Space: O(1)
```

---

<a id="shortest-palindrome"></a>
## 50. Shortest Palindrome

**Problem:** Given a string `s`, find the shortest palindrome you can make by adding characters in front of it.

**Test Cases:**
```
Input: "aacecaaa"  →  Output: "aaacecaaa"
Input: "abcd"      →  Output: "dcbabcd"
Input: "a"         →  Output: "a"
```

**Java Solution (KMP on s + '#' + reverse(s)):**
```java
class Solution {
    public String shortestPalindrome(String s) {
        String rev = new StringBuilder(s).reverse().toString();
        // Combine s + '#' + rev; '#' acts as sentinel to prevent prefix of s matching into rev
        // We want: longest prefix of s that is a palindrome (= longest prefix that is also a suffix of rev)
        String combined = s + "#" + rev;
        int[] lps = new int[combined.length()];
        for (int i = 1; i < combined.length(); i++) {
            int j = lps[i - 1]; // start from last known prefix-suffix length
            while (j > 0 && combined.charAt(i) != combined.charAt(j)) j = lps[j - 1];
            if (combined.charAt(i) == combined.charAt(j)) j++;
            lps[i] = j; // KMP failure function value
        }
        int overlap = lps[combined.length() - 1]; // length of longest palindromic prefix of s
        // Prepend the reverse of the suffix that isn't part of the palindrome
        return rev.substring(0, s.length() - overlap) + s;
    }
}
// Time: O(n)  Space: O(n)
```

---

<a id="longest-common-prefix"></a>
## 51. Longest Common Prefix

**Problem:** Find the longest common prefix string amongst an array of strings. If none, return `""`.

**Test Cases:**
```
Input: ["flower","flow","flight"]  →  Output: "fl"
Input: ["dog","racecar","car"]     →  Output: ""
Input: ["a"]                       →  Output: "a"
```

**Java Solution:**
```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        if (strs.length == 0) return "";
        String prefix = strs[0]; // start with first string as the candidate prefix
        for (int i = 1; i < strs.length; i++) {
            // shrink prefix from the right until strs[i] starts with it
            while (!strs[i].startsWith(prefix))
                prefix = prefix.substring(0, prefix.length() - 1);
            if (prefix.isEmpty()) return ""; // no common prefix possible
        }
        return prefix;
    }
}
// Time: O(S) where S = sum of all characters  Space: O(1)
```

---

<a id="first-unique-character-in-a-string"></a>
## 52. First Unique Character in a String

**Problem:** Given a string `s`, find the first non-repeating character and return its index. If it doesn't exist, return -1.

**Test Cases:**
```
Input: "leetcode"  →  Output: 0  ('l')
Input: "loveleetcode" → Output: 2  ('v')
Input: "aabb"      →  Output: -1
```

**Java Solution:**
```java
class Solution {
    public int firstUniqChar(String s) {
        int[] count = new int[26];
        for (char c : s.toCharArray()) count[c - 'a']++; // Step 1: count all char frequencies
        // Step 2: scan again and return first index where count is exactly 1 (unique)
        for (int i = 0; i < s.length(); i++)
            if (count[s.charAt(i) - 'a'] == 1) return i;
        return -1; // no unique character found
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="ransom-note"></a>
## 53. Ransom Note

**Problem:** Return `true` if you can construct `ransomNote` using letters from `magazine` (each letter used at most once).

**Test Cases:**
```
Input: ransomNote = "a",   magazine = "b"    →  false
Input: ransomNote = "aa",  magazine = "ab"   →  false
Input: ransomNote = "aa",  magazine = "aab"  →  true
```

**Java Solution:**
```java
class Solution {
    public boolean canConstruct(String ransomNote, String magazine) {
        int[] count = new int[26];
        for (char c : magazine.toCharArray()) count[c - 'a']++; // count available letters
        for (char c : ransomNote.toCharArray()) {
            // consume one of this letter; if it goes below 0 → not enough in magazine
            if (--count[c - 'a'] < 0) return false;
        }
        return true;
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="check-if-a-string-contains-all-binary-codes-of-size-k"></a>
## 54. Check if a String Contains All Binary Codes of Size K

**Problem:** Given a binary string `s` and integer `k`, return `true` if every binary code of length `k` is a substring of `s`.

**Test Cases:**
```
Input: s = "00110110", k = 2  →  true   (all of "00","01","10","11" present)
Input: s = "0110",     k = 1  →  true
Input: s = "0110",     k = 2  →  false  ("00" missing)
```

**Java Solution (Rolling hash / HashSet):**
```java
class Solution {
    public boolean hasAllCodes(String s, int k) {
        if (s.length() < k) return false;
        Set<String> seen = new HashSet<>();
        int need = 1 << k; // total distinct binary codes of length k = 2^k
        for (int i = 0; i + k <= s.length(); i++) {
            seen.add(s.substring(i, i + k)); // add each k-length window
            // early exit: once we've collected all 2^k codes, we're done
            if (seen.size() == need) return true;
        }
        return false; // didn't collect all 2^k codes
    }
}
// Time: O(n*k)  Space: O(2^k * k)
```

---

<a id="maximum-number-of-vowels-in-a-substring-of-given-length"></a>
## 55. Maximum Number of Vowels in a Substring of Given Length

**Problem:** Given a string `s` and integer `k`, return the maximum number of vowel letters in any substring of `s` with length `k`.

**Test Cases:**
```
Input: s = "abciiidef", k = 3  →  Output: 3  ("iii")
Input: s = "aeiou",     k = 2  →  Output: 2
Input: s = "leetcode",  k = 3  →  Output: 2  ("lee","eet","etc.")
```

**Java Solution:**
```java
class Solution {
    public int maxVowels(String s, int k) {
        Set<Character> vowels = Set.of('a','e','i','o','u');
        int count = 0, max = 0;
        for (int i = 0; i < s.length(); i++) {
            if (vowels.contains(s.charAt(i))) count++; // expand: add new right char if vowel
            // shrink: once window exceeds k, remove the char that fell off the left
            if (i >= k && vowels.contains(s.charAt(i - k))) count--;
            max = Math.max(max, count); // update best vowel count seen
        }
        return max;
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="swap-for-longest-repeated-character-substring"></a>
## 56. Swap For Longest Repeated Character Substring

**Problem:** Given a string `text`, swap two characters (possibly the same position) to maximize the length of the longest substring consisting of a single repeating character.

**Test Cases:**
```
Input: "ababa"   →  Output: 3
Input: "aaabaaa" →  Output: 6
Input: "aaaaa"   →  Output: 5
Input: "abccc"   →  Output: 3
```

**Java Solution:**
```java
class Solution {
    public int maxRepOpt1(String text) {
        int[] freq = new int[26];
        for (char c : text.toCharArray()) freq[c - 'a']++; // global freq of each char
        int max = 0, n = text.length();
        int i = 0;
        while (i < n) {
            int j = i;
            // measure current run of same character
            while (j < n && text.charAt(j) == text.charAt(i)) j++;
            int left = j - i; // current run length
            // skip one different char and check if next run is same character
            int k = j + 1;
            while (k < n && text.charAt(k) == text.charAt(i)) k++;
            int right = k - j - 1; // length of run after the gap (0 if different char)
            int total = left + right; // combined length if we swap in the gap char
            // can extend by 1 more if there's another occurrence of this char elsewhere to swap in
            if (total < freq[text.charAt(i) - 'a']) total++;
            max = Math.max(max, total);
            i = j; // move to next run
        }
        return max;
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="count-and-say"></a>
## 57. Count and Say

**Problem:** The count-and-say sequence: `countAndSay(1) = "1"`, and each next term describes the previous one. Return the nth term.

**Test Cases:**
```
Input: 1  →  Output: "1"
Input: 2  →  Output: "11"
Input: 4  →  Output: "1211"
Input: 6  →  Output: "312211"
```

**Java Solution:**
```java
class Solution {
    public String countAndSay(int n) {
        String result = "1"; // seed: first term is "1"
        for (int i = 1; i < n; i++) {
            StringBuilder sb = new StringBuilder();
            int j = 0;
            while (j < result.length()) {
                char c = result.charAt(j); // current digit being described
                int count = 0;
                // count consecutive occurrences of digit c
                while (j < result.length() && result.charAt(j) == c) { j++; count++; }
                // say "<count><digit>" → describes the run
                sb.append(count).append(c);
            }
            result = sb.toString(); // this term becomes input for next term
        }
        return result;
    }
}
// Time: O(n * 2^n)  Space: O(2^n)
```

---

<a id="remove-duplicate-letters-to-obtain-lexicographically-smallest-result"></a>
## 58. Remove Duplicate Letters to Obtain Lexicographically Smallest Result

**Problem:** Same as problem 30 — given `s`, remove duplicate letters so every letter appears once and the result is the lexicographically smallest possible.

**Test Cases:**
```
Input: "bcabc"    →  Output: "abc"
Input: "cbacdcbc" →  Output: "acdb"
```

**Java Solution:** *(identical to #30 — monotonic stack approach)*
```java
class Solution {
    public String removeDuplicateLetters(String s) {
        int[] count = new int[26];    // remaining occurrences of each char
        boolean[] inStack = new boolean[26]; // whether char is already in result stack
        for (char c : s.toCharArray()) count[c - 'a']++;
        Deque<Character> stack = new ArrayDeque<>(); // monotonic stack
        for (char c : s.toCharArray()) {
            count[c - 'a']--; // one fewer remaining occurrence
            if (inStack[c - 'a']) continue; // already added, skip
            // pop larger chars that still appear later (can be re-added in better position)
            while (!stack.isEmpty() && stack.peek() > c && count[stack.peek() - 'a'] > 0) {
                inStack[stack.pop() - 'a'] = false;
            }
            stack.push(c);
            inStack[c - 'a'] = true;
        }
        StringBuilder sb = new StringBuilder();
        for (char c : stack) sb.append(c);
        return sb.reverse().toString(); // reverse because stack is LIFO
    }
}
// Time: O(n)  Space: O(1)
```

---

<a id="custom-sort-string"></a>
## 59. Custom Sort String

**Problem:** Given `order` (a permutation of some characters) and string `s`, sort the characters of `s` such that they follow the order in `order`. Characters not in `order` can appear anywhere.

**Test Cases:**
```
Input: order = "cba", s = "abcd"  →  Output: "cbad"
Input: order = "cbafg", s = "abcd" → Output: "cbad"
Input: order = "kqep",  s = "pekeq" → Output: "kqeep" (or "qkpee" etc.)
```

**Java Solution:**
```java
class Solution {
    public String customSortString(String order, String s) {
        int[] rank = new int[26];
        // Assign rank 1..order.length() to chars in order; chars not in order get rank 0
        for (int i = 0; i < order.length(); i++) rank[order.charAt(i) - 'a'] = i + 1;
        char[] chars = s.toCharArray();
        // Sort using custom comparator based on rank
        // Chars with rank 0 (not in order) will group together at front but order among them is arbitrary
        Integer[] idx = new Integer[chars.length];
        for (int i = 0; i < idx.length; i++) idx[i] = i;
        Arrays.sort(idx, (a, b) -> rank[chars[a] - 'a'] - rank[chars[b] - 'a']);
        StringBuilder sb = new StringBuilder();
        for (int i : idx) sb.append(chars[i]);
        return sb.toString();
    }
}
// Time: O(n log n)  Space: O(n)
```

---

<a id="smallest-subsequence-of-distinct-characters"></a>
## 60. Smallest Subsequence of Distinct Characters

**Problem:** Return the lexicographically smallest subsequence of `s` that contains all the distinct characters of `s` exactly once.

**Note:** This is exactly the same problem as #30 / #58.

**Test Cases:**
```
Input: "bcabc"    →  Output: "abc"
Input: "cbacdcbc" →  Output: "acdb"
```

**Java Solution:** *(same monotonic stack approach as #30)*
```java
class Solution {
    public String smallestSubsequence(String s) {
        int[] count = new int[26];    // remaining occurrences
        boolean[] inStack = new boolean[26]; // in result?
        for (char c : s.toCharArray()) count[c - 'a']++;
        Deque<Character> stack = new ArrayDeque<>(); // monotonic stack = result
        for (char c : s.toCharArray()) {
            count[c - 'a']--; // fewer remaining
            if (inStack[c - 'a']) continue; // already included, skip
            // pop larger chars that will appear again later (safe to postpone them)
            while (!stack.isEmpty() && stack.peek() > c && count[stack.peek() - 'a'] > 0) {
                inStack[stack.pop() - 'a'] = false;
            }
            stack.push(c); // include this char
            inStack[c - 'a'] = true;
        }
        StringBuilder sb = new StringBuilder();
        for (char c : stack) sb.append(c);
        return sb.reverse().toString(); // reverse LIFO stack
    }
}
// Time: O(n)  Space: O(1)
```

---

*End of String Problems Reference*