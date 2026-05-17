# DSA Problems: Easy to Medium — Problem Statements, Test Cases & Java Solutions

---

## Table of Contents
1. [Arrays / Hashing](#arrays--hashing)
2. [Strings](#strings)
3. [Sliding Window / Two Pointers](#sliding-window--two-pointers)
4. [Stack / Queue](#stack--queue)
5. [Linked List](#linked-list)
6. [Trees / BFS / DFS](#trees--bfs--dfs)
7. [Binary Search](#binary-search)

---

## Arrays / Hashing

---

### 1. Two Sum
**Difficulty:** Easy

**Problem Statement:**
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume exactly one solution exists, and you may not use the same element twice.

**Test Cases:**
```
Input:  nums = [2, 7, 11, 15], target = 9   →  Output: [0, 1]
Input:  nums = [3, 2, 4],      target = 6   →  Output: [1, 2]
Input:  nums = [3, 3],         target = 6   →  Output: [0, 1]
```

**Complexity:**
- Time: O(N) | Space: O(N)

**Java Solution:**
```java
import java.util.HashMap;

public class TwoSum {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}
```

---

### 2. Best Time to Buy and Sell Stock
**Difficulty:** Easy

**Problem Statement:**
Given an array `prices` where `prices[i]` is the price of a stock on day `i`, find the maximum profit you can achieve by buying on one day and selling on a later day. Return 0 if no profit is possible.

**Test Cases:**
```
Input:  prices = [7, 1, 5, 3, 6, 4]  →  Output: 5  (buy at 1, sell at 6)
Input:  prices = [7, 6, 4, 3, 1]     →  Output: 0  (no profit possible)
Input:  prices = [2, 4, 1]           →  Output: 2
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class BestTimeToBuyAndSellStock {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else if (price - minPrice > maxProfit) {
                maxProfit = price - minPrice;
            }
        }
        return maxProfit;
    }
}
```

---

### 3. Contains Duplicate
**Difficulty:** Easy

**Problem Statement:**
Given an integer array `nums`, return `true` if any value appears at least twice in the array, and `false` if every element is distinct.

**Test Cases:**
```
Input:  nums = [1, 2, 3, 1]        →  Output: true
Input:  nums = [1, 2, 3, 4]        →  Output: false
Input:  nums = [1, 1, 1, 3, 3, 4]  →  Output: true
```

**Complexity:**
- Time: O(N) | Space: O(N)

**Java Solution:**
```java
import java.util.HashSet;

public class ContainsDuplicate {
    public boolean containsDuplicate(int[] nums) {
        HashSet<Integer> seen = new HashSet<>();
        for (int num : nums) {
            if (!seen.add(num)) return true;
        }
        return false;
    }
}
```

---

### 4. Product of Array Except Self
**Difficulty:** Medium

**Problem Statement:**
Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all elements of `nums` except `nums[i]`. You must solve it in O(n) time without using the division operation.

**Test Cases:**
```
Input:  nums = [1, 2, 3, 4]   →  Output: [24, 12, 8, 6]
Input:  nums = [-1, 1, 0, -3, 3]  →  Output: [0, 0, 9, 0, 0]
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class ProductOfArrayExceptSelf {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] result = new int[n];
        result[0] = 1;
        for (int i = 1; i < n; i++) {
            result[i] = result[i - 1] * nums[i - 1];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            result[i] *= right;
            right *= nums[i];
        }
        return result;
    }
}
```

---

### 5. Maximum Subarray (Kadane's Algorithm)
**Difficulty:** Medium

**Problem Statement:**
Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum, and return its sum.

**Test Cases:**
```
Input:  nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]  →  Output: 6  (subarray [4,-1,2,1])
Input:  nums = [1]                                →  Output: 1
Input:  nums = [5, 4, -1, 7, 8]                  →  Output: 23
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class MaximumSubarray {
    public int maxSubArray(int[] nums) {
        int maxSum = nums[0];
        int currentSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }
}
```

---

### 6. Move Zeroes
**Difficulty:** Easy

**Problem Statement:**
Given an integer array `nums`, move all `0`s to the end while maintaining the relative order of non-zero elements. Do this in-place.

**Test Cases:**
```
Input:  nums = [0, 1, 0, 3, 12]  →  Output: [1, 3, 12, 0, 0]
Input:  nums = [0]               →  Output: [0]
Input:  nums = [1, 0, 1]         →  Output: [1, 1, 0]
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class MoveZeroes {
    public void moveZeroes(int[] nums) {
        int insertPos = 0;
        for (int num : nums) {
            if (num != 0) nums[insertPos++] = num;
        }
        while (insertPos < nums.length) {
            nums[insertPos++] = 0;
        }
    }
}
```

---

### 7. Merge Sorted Array
**Difficulty:** Easy

**Problem Statement:**
You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, and two integers `m` and `n` representing the number of elements in each array. Merge `nums2` into `nums1` in-place so the result is sorted.

**Test Cases:**
```
Input:  nums1 = [1,2,3,0,0,0], m=3, nums2 = [2,5,6], n=3  →  Output: [1,2,2,3,5,6]
Input:  nums1 = [1], m=1, nums2 = [], n=0                  →  Output: [1]
Input:  nums1 = [0], m=0, nums2 = [1], n=1                 →  Output: [1]
```

**Complexity:**
- Time: O(m + n) | Space: O(1)

**Java Solution:**
```java
public class MergeSortedArray {
    public void merge(int[] nums1, int m, int[] nums2, int n) {
        int i = m - 1, j = n - 1, k = m + n - 1;
        while (i >= 0 && j >= 0) {
            nums1[k--] = (nums1[i] > nums2[j]) ? nums1[i--] : nums2[j--];
        }
        while (j >= 0) {
            nums1[k--] = nums2[j--];
        }
    }
}
```

---

### 8. Majority Element
**Difficulty:** Easy

**Problem Statement:**
Given an array `nums` of size `n`, return the majority element — the element that appears more than `n / 2` times. It is guaranteed to always exist.

**Test Cases:**
```
Input:  nums = [3, 2, 3]              →  Output: 3
Input:  nums = [2, 2, 1, 1, 1, 2, 2]  →  Output: 2
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class MajorityElement {
    public int majorityElement(int[] nums) {
        int candidate = nums[0], count = 1;
        for (int i = 1; i < nums.length; i++) {
            if (count == 0) { candidate = nums[i]; count = 1; }
            else if (nums[i] == candidate) count++;
            else count--;
        }
        return candidate;
    }
}
```

---

### 9. Missing Number
**Difficulty:** Easy

**Problem Statement:**
Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.

**Test Cases:**
```
Input:  nums = [3, 0, 1]     →  Output: 2
Input:  nums = [0, 1]        →  Output: 2
Input:  nums = [9,6,4,2,3,5,7,0,1]  →  Output: 8
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class MissingNumber {
    public int missingNumber(int[] nums) {
        int n = nums.length;
        int expectedSum = n * (n + 1) / 2;
        int actualSum = 0;
        for (int num : nums) actualSum += num;
        return expectedSum - actualSum;
    }
}
```

---

### 10. Top K Frequent Elements
**Difficulty:** Medium

**Problem Statement:**
Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. The answer may be returned in any order.

**Test Cases:**
```
Input:  nums = [1,1,1,2,2,3], k = 2  →  Output: [1, 2]
Input:  nums = [1], k = 1            →  Output: [1]
```

**Complexity:**
- Time: O(N log K) | Space: O(N)

**Java Solution:**
```java
import java.util.*;

public class TopKFrequentElements {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int n : nums) freq.merge(n, 1, Integer::sum);

        PriorityQueue<Integer> pq = new PriorityQueue<>(
            (a, b) -> freq.get(a) - freq.get(b)
        );

        for (int key : freq.keySet()) {
            pq.add(key);
            if (pq.size() > k) {
                pq.poll();
            }
        }

        int[] result = new int[k];
        for (int i = k - 1; i >= 0; i--) {
            result[i] = pq.poll();
        }
        return result;
    }
}
```

---

## Strings

---

### 11. Valid Anagram
**Difficulty:** Easy

**Problem Statement:**
Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An anagram is a word formed by rearranging the letters of another.

**Test Cases:**
```
Input:  s = "anagram", t = "nagaram"  →  Output: true
Input:  s = "rat",     t = "car"      →  Output: false
Input:  s = "a",       t = "ab"       →  Output: false
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class ValidAnagram {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (char c : s.toCharArray()) count[c - 'a']++;
        for (char c : t.toCharArray()) {
            if (--count[c - 'a'] < 0) return false;
        }
        return true;
    }
}
```

---

### 12. Group Anagrams
**Difficulty:** Medium

**Problem Statement:**
Given an array of strings `strs`, group the anagrams together and return the groups in any order.

**Test Cases:**
```
Input:  strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]

Input:  strs = [""]     →  Output: [[""]]
Input:  strs = ["a"]    →  Output: [["a"]]
```

**Complexity:**
- Time: O(N * K log K) | Space: O(N * K)

**Java Solution:**
```java
import java.util.*;

public class GroupAnagrams {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }
}
```

---

### 13. Longest Common Prefix
**Difficulty:** Easy

**Problem Statement:**
Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string `""`.

**Test Cases:**
```
Input:  strs = ["flower","flow","flight"]  →  Output: "fl"
Input:  strs = ["dog","racecar","car"]     →  Output: ""
Input:  strs = ["ab","a"]                 →  Output: "a"
```

**Complexity:**
- Time: O(S) | Space: O(1)

**Java Solution:**
```java
public class LongestCommonPrefix {
    public String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) return "";
        String prefix = strs[0];
        for (int i = 1; i < strs.length; i++) {
            while (!strs[i].startsWith(prefix)) {
                prefix = prefix.substring(0, prefix.length() - 1);
                if (prefix.isEmpty()) return "";
            }
        }
        return prefix;
    }
}
```

---

### 14. Valid Palindrome
**Difficulty:** Easy

**Problem Statement:**
A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string `s`, return `true` if it is a palindrome.

**Test Cases:**
```
Input:  s = "A man, a plan, a canal: Panama"  →  Output: true
Input:  s = "race a car"                      →  Output: false
Input:  s = " "                               →  Output: true
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class ValidPalindrome {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right)))
                return false;
            left++; right--;
        }
        return true;
    }
}
```

---

### 15. Reverse Words in a String
**Difficulty:** Medium

**Problem Statement:**
Given an input string `s`, reverse the order of the words. A word is defined as a sequence of non-space characters. The returned string should not have leading/trailing spaces, and words should be separated by a single space.

**Test Cases:**
```
Input:  s = "the sky is blue"    →  Output: "blue is sky the"
Input:  s = "  hello world  "    →  Output: "world hello"
Input:  s = "a good   example"   →  Output: "example good a"
```

**Complexity:**
- Time: O(N) | Space: O(N)

**Java Solution:**
```java
public class ReverseWordsInString {
    public String reverseWords(String s) {
        String[] words = s.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]);
            if (i > 0) sb.append(" ");
        }
        return sb.toString();
    }
}
```

---

### 16. Longest Substring Without Repeating Characters
**Difficulty:** Medium

**Problem Statement:**
Given a string `s`, find the length of the longest substring without repeating characters.

**Test Cases:**
```
Input:  s = "abcabcbb"  →  Output: 3  (substring "abc")
Input:  s = "bbbbb"     →  Output: 1  (substring "b")
Input:  s = "pwwkew"    →  Output: 3  (substring "wke")
```

**Complexity:**
- Time: O(N) | Space: O(min(M, N))

**Java Solution:**
```java
import java.util.HashMap;

public class LongestSubstringWithoutRepeating {
    public int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}
```

---

### 17. String Compression
**Difficulty:** Medium

**Problem Statement:**
Given an array of characters `chars`, compress it using the following algorithm: begin with an empty string `s`. For each group of consecutive repeating characters, append the character; if the group length > 1, also append the group's length. Modify `chars` in-place and return the new length.

**Test Cases:**
```
Input:  chars = ['a','a','b','b','c','c','c']  →  Output: 6  → chars = ['a','2','b','2','c','3']
Input:  chars = ['a']                          →  Output: 1  → chars = ['a']
Input:  chars = ['a','b','b','b','b','b','b','b','b','b','b','b','b']
        Output: 4  → chars = ['a','b','1','2']
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class StringCompression {
    public int compress(char[] chars) {
        int write = 0, i = 0;
        while (i < chars.length) {
            char cur = chars[i];
            int count = 0;
            while (i < chars.length && chars[i] == cur) { i++; count++; }
            chars[write++] = cur;
            if (count > 1) {
                for (char c : Integer.toString(count).toCharArray()) {
                    chars[write++] = c;
                }
            }
        }
        return write;
    }
}
```

---

### 18. Roman to Integer
**Difficulty:** Easy

**Problem Statement:**
Given a string `s` representing a Roman numeral, convert it to an integer. Roman numerals use: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. If a smaller value precedes a larger value, it is subtracted.

**Test Cases:**
```
Input:  s = "III"    →  Output: 3
Input:  s = "LVIII"  →  Output: 58
Input:  s = "MCMXCIV"  →  Output: 1994
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
import java.util.HashMap;

public class RomanToInteger {
    public int romanToInt(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        map.put('I', 1); map.put('V', 5); map.put('X', 10);
        map.put('L', 50); map.put('C', 100); map.put('D', 500); map.put('M', 1000);

        int result = 0;
        for (int i = 0; i < s.length(); i++) {
            int cur = map.get(s.charAt(i));
            int next = (i + 1 < s.length()) ? map.get(s.charAt(i + 1)) : 0;
            result += (cur < next) ? -cur : cur;
        }
        return result;
    }
}
```

---

### 19. Implement strStr()
**Difficulty:** Easy

**Problem Statement:**
Given two strings `haystack` and `needle`, return the index of the first occurrence of `needle` in `haystack`, or `-1` if `needle` is not part of `haystack`. An empty `needle` returns 0.

**Test Cases:**
```
Input:  haystack = "hello",  needle = "ll"   →  Output: 2
Input:  haystack = "aaaaa",  needle = "bba"  →  Output: -1
Input:  haystack = "",       needle = ""     →  Output: 0
```

**Complexity:**
- Time: O(N * M) | Space: O(1)

**Java Solution:**
```java
public class ImplementStrStr {
    public int strStr(String haystack, String needle) {
        if (needle.isEmpty()) return 0;
        int n = haystack.length(), m = needle.length();
        for (int i = 0; i <= n - m; i++) {
            if (haystack.substring(i, i + m).equals(needle)) return i;
        }
        return -1;
    }
}
```

---

### 20. Palindromic Substrings
**Difficulty:** Medium

**Problem Statement:**
Given a string `s`, return the number of palindromic substrings in it. A string is a palindrome when it reads the same backward as forward. A substring is a contiguous sequence of characters within the string.

**Test Cases:**
```
Input:  s = "abc"   →  Output: 3   ("a", "b", "c")
Input:  s = "aaa"   →  Output: 6   ("a","a","a","aa","aa","aaa")
```

**Complexity:**
- Time: O(N^2) | Space: O(1)

**Java Solution:**
```java
public class PalindromicSubstrings {
    private int count = 0;

    public int countSubstrings(String s) {
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);     // odd length
            expand(s, i, i + 1); // even length
        }
        return count;
    }

    private void expand(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            count++;
            left--;
            right++;
        }
    }
}
```

---

## Sliding Window / Two Pointers

---

### 21. Container With Most Water
**Difficulty:** Medium

**Problem Statement:**
Given an integer array `height` of length `n`, there are `n` vertical lines where the two endpoints of the `i`-th line are `(i, 0)` and `(i, height[i])`. Find two lines that, together with the x-axis, form a container that holds the most water. Return the maximum amount of water.

**Test Cases:**
```
Input:  height = [1,8,6,2,5,4,8,3,7]  →  Output: 49
Input:  height = [1,1]                 →  Output: 1
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class ContainerWithMostWater {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1, maxWater = 0;
        while (left < right) {
            int water = Math.min(height[left], height[right]) * (right - left);
            maxWater = Math.max(maxWater, water);
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxWater;
    }
}
```

---

### 22. Minimum Size Subarray Sum
**Difficulty:** Medium

**Problem Statement:**
Given an array of positive integers `nums` and a positive integer `target`, return the minimal length of a contiguous subarray whose sum is greater than or equal to `target`. If no such subarray exists, return 0.

**Test Cases:**
```
Input:  target = 7, nums = [2,3,1,2,4,3]  →  Output: 2  (subarray [4,3])
Input:  target = 4, nums = [1,4,4]        →  Output: 1
Input:  target = 11, nums = [1,1,1,1,1]   →  Output: 0
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class MinimumSizeSubarraySum {
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

---

### 23. Permutation in String
**Difficulty:** Medium

**Problem Statement:**
Given two strings `s1` and `s2`, return `true` if `s2` contains a permutation of `s1`, or `false` otherwise. In other words, return `true` if one of `s1`'s permutations is a substring of `s2`.

**Test Cases:**
```
Input:  s1 = "ab", s2 = "eidbaooo"  →  Output: true  ("ba" is in s2)
Input:  s1 = "ab", s2 = "eidboaoo"  →  Output: false
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class PermutationInString {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;
        int[] count = new int[26];
        for (char c : s1.toCharArray()) count[c - 'a']++;
        int left = 0, matches = 0;
        for (int right = 0; right < s2.length(); right++) {
            if (--count[s2.charAt(right) - 'a'] >= 0) matches++;
            if (matches == s1.length()) return true;
            if (right >= s1.length() - 1) {
                if (++count[s2.charAt(left++) - 'a'] > 0) matches--;
            }
        }
        return false;
    }
}
```

---

### 24. 3Sum
**Difficulty:** Medium

**Problem Statement:**
Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, `j != k`, and `nums[i] + nums[j] + nums[k] == 0`. The solution set must not contain duplicate triplets.

**Test Cases:**
```
Input:  nums = [-1, 0, 1, 2, -1, -4]  →  Output: [[-1,-1,2],[-1,0,1]]
Input:  nums = [0, 1, 1]              →  Output: []
Input:  nums = [0, 0, 0]              →  Output: [[0,0,0]]
```

**Complexity:**
- Time: O(N^2) | Space: O(1)

**Java Solution:**
```java
import java.util.*;

public class ThreeSum {
    public List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        Arrays.sort(nums);
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++; right--;
                } else if (sum < 0) left++;
                else right--;
            }
        }
        return result;
    }
}
```

---

### 25. Remove Duplicates from Sorted Array
**Difficulty:** Easy

**Problem Statement:**
Given an integer array `nums` sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. Return the number of unique elements `k`. The first `k` elements of `nums` should hold the result.

**Test Cases:**
```
Input:  nums = [1,1,2]           →  Output: 2, nums = [1,2,_]
Input:  nums = [0,0,1,1,1,2,2,3,3,4]  →  Output: 5, nums = [0,1,2,3,4,_,_,_,_,_]
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class RemoveDuplicatesFromSortedArray {
    public int removeDuplicates(int[] nums) {
        if (nums.length == 0) return 0;
        int k = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] != nums[i - 1]) nums[k++] = nums[i];
        }
        return k;
    }
}
```

---

### 26. Sort Colors
**Difficulty:** Medium

**Problem Statement:**
Given an array `nums` with `n` objects colored red (0), white (1), or blue (2), sort them in-place so that objects of the same color are adjacent, in order 0, 1, 2. (Dutch National Flag problem)

**Test Cases:**
```
Input:  nums = [2,0,2,1,1,0]  →  Output: [0,0,1,1,2,2]
Input:  nums = [2,0,1]        →  Output: [0,1,2]
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class SortColors {
    public void sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                swap(nums, low++, mid++);
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                swap(nums, mid, high--);
            }
        }
    }
    private void swap(int[] nums, int i, int j) {
        int temp = nums[i]; nums[i] = nums[j]; nums[j] = temp;
    }
}
```

---

### 27. Find All Anagrams in a String
**Difficulty:** Medium

**Problem Statement:**
Given two strings `s` and `p`, return an array of all the start indices of `p`'s anagrams in `s`. An anagram is formed by rearranging all letters of another string.

**Test Cases:**
```
Input:  s = "cbaebabacd", p = "abc"  →  Output: [0, 6]
Input:  s = "abab",       p = "ab"   →  Output: [0, 1, 2]
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
import java.util.*;

public class FindAllAnagramsInString {
    public List<Integer> findAnagrams(String s, String p) {
        List<Integer> result = new ArrayList<>();
        if (s.length() < p.length()) return result;
        int[] pCount = new int[26], sCount = new int[26];
        for (char c : p.toCharArray()) pCount[c - 'a']++;
        for (int i = 0; i < p.length(); i++) sCount[s.charAt(i) - 'a']++;
        if (Arrays.equals(pCount, sCount)) result.add(0);
        for (int i = p.length(); i < s.length(); i++) {
            sCount[s.charAt(i) - 'a']++;
            sCount[s.charAt(i - p.length()) - 'a']--;
            if (Arrays.equals(pCount, sCount)) result.add(i - p.length() + 1);
        }
        return result;
    }
}
```

---

### 28. Subarray Sum Equals K
**Difficulty:** Medium

**Problem Statement:**
Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals `k`.

**Test Cases:**
```
Input:  nums = [1,1,1], k = 2  →  Output: 2
Input:  nums = [1,2,3], k = 3  →  Output: 2
```

**Complexity:**
- Time: O(N) | Space: O(N)

**Java Solution:**
```java
import java.util.HashMap;

public class SubarraySumEqualsK {
    public int subarraySum(int[] nums, int k) {
        HashMap<Integer, Integer> prefixCount = new HashMap<>();
        prefixCount.put(0, 1);
        int sum = 0, count = 0;
        for (int num : nums) {
            sum += num;
            count += prefixCount.getOrDefault(sum - k, 0);
            prefixCount.merge(sum, 1, Integer::sum);
        }
        return count;
    }
}
```

---

## Stack / Queue

---

### 29. Valid Parentheses
**Difficulty:** Easy

**Problem Statement:**
Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid. Open brackets must be closed by the same type of brackets, and in the correct order.

**Test Cases:**
```
Input:  s = "()"       →  Output: true
Input:  s = "()[]{}"   →  Output: true
Input:  s = "(]"       →  Output: false
Input:  s = "([)]"     →  Output: false
```

**Complexity:**
- Time: O(N) | Space: O(N)

**Java Solution:**
```java
import java.util.Stack;

public class ValidParentheses {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') { stack.push(c); }
            else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }
}
```

---

### 30. Min Stack
**Difficulty:** Medium

**Problem Statement:**
Design a stack that supports `push`, `pop`, `top`, and `getMin` operations, all in O(1) time.

**Test Cases:**
```
MinStack stack = new MinStack();
stack.push(-2); stack.push(0); stack.push(-3);
stack.getMin(); → -3
stack.pop();
stack.top();    → 0
stack.getMin(); → -2
```

**Complexity:**
- Time: O(1) per operation | Space: O(N)

**Java Solution:**
```java
import java.util.Stack;

public class MinStack {
    private Stack<Integer> stack = new Stack<>();
    private Stack<Integer> minStack = new Stack<>();

    public void push(int val) {
        stack.push(val);
        if (minStack.isEmpty() || val <= minStack.peek()) minStack.push(val);
        else minStack.push(minStack.peek());
    }

    public void pop() {
        stack.pop();
        minStack.pop();
    }

    public int top() { return stack.peek(); }

    public int getMin() { return minStack.peek(); }
}
```

---

### 31. Daily Temperatures
**Difficulty:** Medium

**Problem Statement:**
Given an array of integers `temperatures`, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i`-th day to get a warmer temperature. If there is no future day that is warmer, set `answer[i] = 0`.

**Test Cases:**
```
Input:  temperatures = [73,74,75,71,69,72,76,73]  →  Output: [1,1,4,2,1,1,0,0]
Input:  temperatures = [30,40,50,60]               →  Output: [1,1,1,0]
Input:  temperatures = [30,60,90]                  →  Output: [1,1,0]
```

**Complexity:**
- Time: O(N) | Space: O(N)

**Java Solution:**
```java
import java.util.Stack;

public class DailyTemperatures {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] result = new int[n];
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
                int idx = stack.pop();
                result[idx] = i - idx;
            }
            stack.push(i);
        }
        return result;
    }
}
```

---

### 32. Next Greater Element
**Difficulty:** Easy

**Problem Statement:**
Given two integer arrays `nums1` and `nums2` where `nums1` is a subset of `nums2`, for each element of `nums1`, find the next greater element in `nums2`. The next greater element of a number `x` in `nums2` is the first greater number to the right of `x` in `nums2`. Return an array of answers.

**Test Cases:**
```
Input:  nums1 = [4,1,2], nums2 = [1,3,4,2]  →  Output: [-1,3,-1]
Input:  nums1 = [2,4],   nums2 = [1,2,3,4]  →  Output: [3,-1]
```

**Complexity:**
- Time: O(N) | Space: O(N)

**Java Solution:**
```java
import java.util.*;

public class NextGreaterElement {
    public int[] nextGreaterElement(int[] nums1, int[] nums2) {
        Map<Integer, Integer> map = new HashMap<>();
        Stack<Integer> stack = new Stack<>();
        for (int num : nums2) {
            while (!stack.isEmpty() && stack.peek() < num) {
                map.put(stack.pop(), num);
            }
            stack.push(num);
        }
        int[] result = new int[nums1.length];
        for (int i = 0; i < nums1.length; i++) {
            result[i] = map.getOrDefault(nums1[i], -1);
        }
        return result;
    }
}
```

---

### 33. Implement Queue using Stacks
**Difficulty:** Easy

**Problem Statement:**
Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue: `push`, `pop`, `peek`, and `empty`.

**Test Cases:**
```
MyQueue queue = new MyQueue();
queue.push(1); queue.push(2);
queue.peek();  → 1
queue.pop();   → 1
queue.empty(); → false
```

**Complexity:**
- Time: Amortized O(1) | Space: O(N)

**Java Solution:**
```java
import java.util.Stack;

public class MyQueue {
    private Stack<Integer> inStack = new Stack<>();
    private Stack<Integer> outStack = new Stack<>();

    public void push(int x) { inStack.push(x); }

    public int pop() {
        move();
        return outStack.pop();
    }

    public int peek() {
        move();
        return outStack.peek();
    }

    public boolean empty() { return inStack.isEmpty() && outStack.isEmpty(); }

    private void move() {
        if (outStack.isEmpty()) {
            while (!inStack.isEmpty()) outStack.push(inStack.pop());
        }
    }
}
```

---

## Linked List

---

### 34. Reverse Linked List
**Difficulty:** Easy

**Problem Statement:**
Given the head of a singly linked list, reverse the list, and return the reversed list.

**Test Cases:**
```
Input:  1→2→3→4→5  →  Output: 5→4→3→2→1
Input:  1→2         →  Output: 2→1
Input:  []          →  Output: []
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class ReverseLinkedList {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}

class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}
```

---

### 35. Merge Two Sorted Lists
**Difficulty:** Easy

**Problem Statement:**
You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists in a sorted manner and return the head of the merged linked list.

**Test Cases:**
```
Input:  list1 = 1→2→4,  list2 = 1→3→4  →  Output: 1→1→2→3→4→4
Input:  list1 = [],      list2 = []     →  Output: []
Input:  list1 = [],      list2 = [0]    →  Output: [0]
```

**Complexity:**
- Time: O(N + M) | Space: O(1)

**Java Solution:**
```java
public class MergeTwoSortedLists {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) { curr.next = list1; list1 = list1.next; }
            else { curr.next = list2; list2 = list2.next; }
            curr = curr.next;
        }
        curr.next = (list1 != null) ? list1 : list2;
        return dummy.next;
    }
}
```

---

### 36. Linked List Cycle
**Difficulty:** Easy

**Problem Statement:**
Given the head of a linked list, determine if the linked list has a cycle in it. Return `true` if there is a cycle, otherwise return `false`.

**Test Cases:**
```
Input:  3→2→0→-4 (tail connects to node at index 1)  →  Output: true
Input:  1→2 (tail connects to node at index 0)        →  Output: true
Input:  1 (no cycle)                                  →  Output: false
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class LinkedListCycle {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}
```

---

### 37. Middle of Linked List
**Difficulty:** Easy

**Problem Statement:**
Given the head of a singly linked list, return the middle node. If there are two middle nodes, return the second middle node.

**Test Cases:**
```
Input:  1→2→3→4→5    →  Output: Node 3  (middle)
Input:  1→2→3→4→5→6  →  Output: Node 4  (second middle)
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class MiddleOfLinkedList {
    public ListNode middleNode(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }
}
```

---

### 38. Remove Nth Node From End
**Difficulty:** Medium

**Problem Statement:**
Given the head of a linked list, remove the `n`-th node from the end of the list and return its head. (1-indexed)

**Test Cases:**
```
Input:  1→2→3→4→5, n=2  →  Output: 1→2→3→5
Input:  [1], n=1         →  Output: []
Input:  1→2, n=1         →  Output: [1]
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class RemoveNthNodeFromEnd {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode fast = dummy, slow = dummy;
        for (int i = 0; i <= n; i++) fast = fast.next;
        while (fast != null) { fast = fast.next; slow = slow.next; }
        slow.next = slow.next.next;
        return dummy.next;
    }
}
```

---

### 39. Intersection of Two Linked Lists
**Difficulty:** Easy

**Problem Statement:**
Given the heads of two singly linked lists `headA` and `headB`, return the node at which the two lists intersect. If the two linked lists have no intersection at all, return `null`.

**Test Cases:**
```
Input:  A: a1→a2→c1→c2→c3, B: b1→b2→b3→c1→c2→c3  →  Output: c1
Input:  No intersection  →  Output: null
```

**Complexity:**
- Time: O(N + M) | Space: O(1)

**Java Solution:**
```java
public class IntersectionOfTwoLinkedLists {
    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        ListNode a = headA, b = headB;
        while (a != b) {
            a = (a == null) ? headB : a.next;
            b = (b == null) ? headA : b.next;
        }
        return a;
    }
}
```

---

## Trees / BFS / DFS

---

### 40. Maximum Depth of Binary Tree
**Difficulty:** Easy

**Problem Statement:**
Given the root of a binary tree, return its maximum depth. The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

**Test Cases:**
```
Input:  [3,9,20,null,null,15,7]  →  Output: 3
Input:  [1,null,2]               →  Output: 2
```

**Complexity:**
- Time: O(N) | Space: O(N) (Worst case call stack)

**Java Solution:**
```java
public class MaximumDepthBinaryTree {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}
```

---

### 41. Invert Binary Tree
**Difficulty:** Easy

**Problem Statement:**
Given the root of a binary tree, invert the tree (mirror it), and return its root.

**Test Cases:**
```
Input:  [4,2,7,1,3,6,9]  →  Output: [4,7,2,9,6,3,1]
Input:  [2,1,3]           →  Output: [2,3,1]
Input:  []                →  Output: []
```

**Complexity:**
- Time: O(N) | Space: O(N)

**Java Solution:**
```java
public class InvertBinaryTree {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode temp = root.left;
        root.left = invertTree(root.right);
        root.right = invertTree(temp);
        return root;
    }
}
```

---

### 42. Same Tree
**Difficulty:** Easy

**Problem Statement:**
Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not. Two binary trees are the same if they are structurally identical, and the nodes have the same value.

**Test Cases:**
```
Input:  p = [1,2,3], q = [1,2,3]      →  Output: true
Input:  p = [1,2],   q = [1,null,2]   →  Output: false
Input:  p = [1,2,1], q = [1,1,2]      →  Output: false
```

**Complexity:**
- Time: O(N) | Space: O(N)

**Java Solution:**
```java
public class SameTree {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null && q == null) return true;
        if (p == null || q == null) return false;
        return p.val == q.val
            && isSameTree(p.left, q.left)
            && isSameTree(p.right, q.right);
    }
}
```

---

### 43. Binary Tree Level Order Traversal
**Difficulty:** Medium

**Problem Statement:**
Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).

**Test Cases:**
```
Input:  [3,9,20,null,null,15,7]  →  Output: [[3],[9,20],[15,7]]
Input:  [1]                      →  Output: [[1]]
Input:  []                       →  Output: []
```

**Complexity:**
- Time: O(N) | Space: O(N)

**Java Solution:**
```java
import java.util.*;

public class BinaryTreeLevelOrderTraversal {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(level);
        }
        return result;
    }
}
```

---

### 44. Lowest Common Ancestor
**Difficulty:** Medium

**Problem Statement:**
Given a binary search tree (BST), find the lowest common ancestor (LCA) of two given nodes `p` and `q`. The LCA is the lowest node in the tree that has both `p` and `q` as descendants (where a node can be a descendant of itself).

**Test Cases:**
```
Input:  BST = [6,2,8,0,4,7,9], p=2, q=8  →  Output: 6
Input:  BST = [6,2,8,0,4,7,9], p=2, q=4  →  Output: 2
```

**Complexity:**
- Time: O(H) | Space: O(1)

**Java Solution:**
```java
public class LowestCommonAncestorBST {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        while (root != null) {
            if (p.val < root.val && q.val < root.val) root = root.left;
            else if (p.val > root.val && q.val > root.val) root = root.right;
            else return root;
        }
        return null;
    }
}
```

---

### 45. Validate Binary Search Tree
**Difficulty:** Medium

**Problem Statement:**
Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as: the left subtree of a node contains only nodes with keys less than the node's key; the right subtree only contains nodes with keys greater than the node's key; both subtrees must also be valid BSTs.

**Test Cases:**
```
Input:  [2,1,3]          →  Output: true
Input:  [5,1,4,null,null,3,6]  →  Output: false  (4 in right subtree but 3 < 5)
```

**Complexity:**
- Time: O(N) | Space: O(N)

**Java Solution:**
```java
public class ValidateBinarySearchTree {
    public boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean validate(TreeNode node, long min, long max) {
        if (node == null) return true;
        if (node.val <= min || node.val >= max) return false;
        return validate(node.left, min, node.val)
            && validate(node.right, node.val, max);
    }
}
```

---

## Binary Search

---

### 46. Binary Search
**Difficulty:** Easy

**Problem Statement:**
Given an array of integers `nums` sorted in ascending order, and an integer `target`, write a function to search for `target` in `nums`. If `target` exists, return its index. Otherwise, return `-1`. You must write an algorithm with O(log n) runtime complexity.

**Test Cases:**
```
Input:  nums = [-1,0,3,5,9,12], target = 9   →  Output: 4
Input:  nums = [-1,0,3,5,9,12], target = 2   →  Output: -1
Input:  nums = [5], target = 5               →  Output: 0
```

**Complexity:**
- Time: O(log N) | Space: O(1)

**Java Solution:**
```java
public class BinarySearch {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}
```

---

### 47. Search in Rotated Sorted Array
**Difficulty:** Medium

**Problem Statement:**
There is an integer array `nums` sorted in ascending order (with distinct values) that has been rotated at some pivot. Given the array after the rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`. You must write an algorithm with O(log n) runtime complexity.

**Test Cases:**
```
Input:  nums = [4,5,6,7,0,1,2], target = 0  →  Output: 4
Input:  nums = [4,5,6,7,0,1,2], target = 3  →  Output: -1
Input:  nums = [1], target = 0              →  Output: -1
```

**Complexity:**
- Time: O(log N) | Space: O(1)

**Java Solution:**
```java
public class SearchInRotatedSortedArray {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            // Left half is sorted
            if (nums[left] <= nums[mid]) {
                if (target >= nums[left] && target < nums[mid]) right = mid - 1;
                else left = mid + 1;
            } else {
                // Right half is sorted
                if (target > nums[mid] && target <= nums[right]) left = mid + 1;
                else right = mid - 1;
            }
        }
        return -1;
    }
}
```

---

### 48. Task Scheduler *(Stack/Queue — Medium)*

**Problem Statement:**
Given a characters array `tasks` representing CPU tasks, and an integer `n` (the cooldown interval), return the minimum number of intervals the CPU will take to finish all the given tasks. The CPU can be idle if there are no available tasks.

**Test Cases:**
```
Input:  tasks = ["A","A","A","B","B","B"], n=2  →  Output: 8
Input:  tasks = ["A","A","A","B","B","B"], n=0  →  Output: 6
Input:  tasks = ["A","A","A","A","A","A","B","C","D","E","F","G"], n=2  →  Output: 16
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class TaskScheduler {
    public int leastInterval(char[] tasks, int n) {
        int[] freq = new int[26];
        for (char task : tasks) freq[task - 'A']++;
        int maxFreq = 0;
        for (int f : freq) maxFreq = Math.max(maxFreq, f);
        int maxCount = 0;
        for (int f : freq) if (f == maxFreq) maxCount++;
        int result = (maxFreq - 1) * (n + 1) + maxCount;
        return Math.max(result, tasks.length);
    }
}
```

---

### 49. Trapping Rain Water *(Sliding Window — Hard)*

**Problem Statement:**
Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

**Test Cases:**
```
Input:  height = [0,1,0,2,1,0,1,3,2,1,2,1]  →  Output: 6
Input:  height = [4,2,0,3,2,5]               →  Output: 9
```

**Complexity:**
- Time: O(N) | Space: O(1)

**Java Solution:**
```java
public class TrappingRainWater {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}
```

---

### 50. Sliding Window Maximum *(Sliding Window — Hard)*

**Problem Statement:**
You are given an array of integers `nums` and an integer `k`. There is a sliding window of size `k` moving from the very left to the very right of the array. Return an array of the maximum value in each window position.

**Test Cases:**
```
Input:  nums = [1,3,-1,-3,5,3,6,7], k=3  →  Output: [3,3,5,5,6,7]
Input:  nums = [1], k=1                  →  Output: [1]
Input:  nums = [1,-1], k=1               →  Output: [1,-1]
```

**Complexity:**
- Time: O(N) | Space: O(K)

**Java Solution:**
```java
import java.util.ArrayDeque;

public class SlidingWindowMaximum {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        ArrayDeque<Integer> deque = new ArrayDeque<>(); // stores indices

        for (int i = 0; i < n; i++) {
            // Remove elements outside window
            while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
                deque.pollFirst();
            }
            // Remove elements smaller than current
            while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
                deque.pollLast();
            }
            deque.offerLast(i);
            if (i >= k - 1) result[i - k + 1] = nums[deque.peekFirst()];
        }
        return result;
    }
}
```

---

*End of document — 50 problems covered across 7 categories.*