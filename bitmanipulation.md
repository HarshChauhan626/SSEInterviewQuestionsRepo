# Bit Manipulation — 10 Problems Covering 95% of Interview Patterns

> Master these 10 problems and you'll have the intuition, vocabulary, and toolkit to solve virtually every bit manipulation question asked in coding interviews.

---

## Table of Contents

| # | Problem | Difficulty | Jump to Solution |
|---|---------|:----------:|-----------------|
| 1 | Check if a Number is a Power of Two | 🟢 Easy | [→ #1](#check-if-a-number-is-a-power-of-two) |
| 2 | Count Set Bits (Hamming Weight / Popcount) | 🟢 Easy | [→ #2](#count-set-bits-hamming-weight--popcount) |
| 3 | Find the Single Number (XOR Trick) | 🟢 Easy | [→ #3](#find-the-single-number-xor-trick) |
| 4 | Find Two Non-Repeating Numbers | 🟡 Medium | [→ #4](#find-two-non-repeating-numbers) |
| 5 | Reverse Bits of an Integer | 🟢 Easy | [→ #5](#reverse-bits-of-an-integer) |
| 6 | Find the Missing Number | 🟢 Easy | [→ #6](#find-the-missing-number) |
| 7 | Subsets Generation using Bitmask | 🟡 Medium | [→ #7](#subsets-generation-using-bitmask) |
| 8 | Maximum XOR of Two Numbers in an Array | 🟡 Medium | [→ #8](#maximum-xor-of-two-numbers-in-an-array) |
| 9 | Counting Bits — Number of 1s for 0 to N | 🟢 Easy | [→ #9](#counting-bits--number-of-1s-for-0-to-n) |
| 10 | Single Number III — Element Appearing Once When Others Appear Three Times | 🟡 Medium | [→ #10](#single-number-iii--element-appearing-once-when-others-appear-three-times) |

---

## Bit Manipulation Cheat Sheet (Read First)

| Operation | Expression | Effect |
|---|---|---|
| Get bit `i` | `(n >> i) & 1` | Returns 0 or 1 |
| Set bit `i` | `n \| (1 << i)` | Forces bit i to 1 |
| Clear bit `i` | `n & ~(1 << i)` | Forces bit i to 0 |
| Toggle bit `i` | `n ^ (1 << i)` | Flips bit i |
| Remove lowest set bit | `n & (n - 1)` | Clears rightmost 1 |
| Isolate lowest set bit | `n & (-n)` | Keeps only rightmost 1 |
| Check power of two | `n > 0 && (n & (n-1)) == 0` | True if power of two |
| XOR self-cancellation | `a ^ a = 0`, `a ^ 0 = a` | Core XOR property |

---

<a id="check-if-a-number-is-a-power-of-two"></a>
## 1. Check if a Number is a Power of Two

### Problem Statement
Given an integer `n`, return `true` if it is a power of two, otherwise return `false`.

```
Input:  n = 16  → Output: true   (2^4)
Input:  n = 18  → Output: false
Input:  n = 1   → Output: true   (2^0)
Input:  n = 0   → Output: false
```

### Intuition
A power of two in binary has **exactly one bit set**:
```
1  → 0001
2  → 0010
4  → 0100
8  → 1000
```
The trick `n & (n - 1)` removes the lowest set bit. If the result is 0, there was only one bit — a power of two.

```
n     = 1000  (8)
n - 1 = 0111  (7)
n & (n-1) = 0000 → Power of two ✓

n     = 1010  (10)
n - 1 = 1001  (9)
n & (n-1) = 1000 → NOT zero → Not a power of two ✗
```

### Why This Approach
- **O(1)** time and space — just a single bitwise AND.
- No loops, no log math. This is the canonical interview answer.

### Java Code
```java
public class PowerOfTwo {

    public boolean isPowerOfTwo(int n) {
        // n must be positive AND removing its lowest set bit gives 0
        return n > 0 && (n & (n - 1)) == 0;
    }

    // ---- Test Cases ----
    public static void main(String[] args) {
        PowerOfTwo sol = new PowerOfTwo();

        System.out.println(sol.isPowerOfTwo(1));   // true
        System.out.println(sol.isPowerOfTwo(2));   // true
        System.out.println(sol.isPowerOfTwo(16));  // true
        System.out.println(sol.isPowerOfTwo(18));  // false
        System.out.println(sol.isPowerOfTwo(0));   // false
        System.out.println(sol.isPowerOfTwo(-4));  // false
    }
}
```

### Test Cases
| Input | Expected | Reason |
|---|---|---|
| 1 | true | 2^0 |
| 2 | true | 2^1 |
| 16 | true | 2^4 |
| 18 | false | 10 + 8 |
| 0 | false | Edge case |
| -4 | false | Negative |

---

<a id="count-set-bits-hamming-weight--popcount"></a>
## 2. Count Set Bits (Hamming Weight / Popcount)

### Problem Statement
Given a positive integer `n`, return the number of `1` bits in its binary representation (also called Hamming weight or popcount).

```
Input: n = 11 (binary: 1011) → Output: 3
Input: n = 128 (binary: 10000000) → Output: 1
```

### Intuition
**Brian Kernighan's Algorithm**: `n & (n - 1)` always clears the rightmost set bit. Count how many times you can do this before `n` becomes 0 — that's the number of set bits.

```
n = 1011 (11)
Step 1: n & (n-1) = 1011 & 1010 = 1010  count=1
Step 2: n & (n-1) = 1010 & 1001 = 1000  count=2
Step 3: n & (n-1) = 1000 & 0111 = 0000  count=3
n = 0 → stop
```

### Why This Approach
- Iterates only as many times as there are **set bits**, not all 32 bits.
- Best when the number is sparse (few set bits).
- Contrast: naive approach shifts all 32 bits regardless.

### Java Code
```java
public class CountSetBits {

    // Brian Kernighan's Algorithm — O(number of set bits)
    public int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n = n & (n - 1); // clear the lowest set bit
            count++;
        }
        return count;
    }

    // Alternative: DP / lookup approach using Integer.bitCount (built-in)
    public int hammingWeightBuiltIn(int n) {
        return Integer.bitCount(n);
    }

    // ---- Test Cases ----
    public static void main(String[] args) {
        CountSetBits sol = new CountSetBits();

        System.out.println(sol.hammingWeight(11));          // 3  (1011)
        System.out.println(sol.hammingWeight(128));         // 1  (10000000)
        System.out.println(sol.hammingWeight(0));           // 0
        System.out.println(sol.hammingWeight(0xFFFFFFFF));  // 32 (all bits set)
        System.out.println(sol.hammingWeight(7));           // 3  (111)
    }
}
```

### Test Cases
| Input | Binary | Expected |
|---|---|---|
| 11 | 1011 | 3 |
| 128 | 10000000 | 1 |
| 0 | 00...0 | 0 |
| 7 | 111 | 3 |
| 0xFFFFFFFF | all 1s | 32 |

---

<a id="find-the-single-number-xor-trick"></a>
## 3. Find the Single Number (XOR Trick)

### Problem Statement
Given a non-empty array where every element appears **twice** except one — find that one element. Must run in O(n) time and O(1) space.

```
Input: [4, 1, 2, 1, 2]  → Output: 4
Input: [2, 2, 1]         → Output: 1
```

### Intuition
XOR has two beautiful properties:
- `a ^ a = 0` (same numbers cancel)
- `a ^ 0 = a` (XOR with 0 is identity)

XOR everything together — all duplicates cancel out, leaving just the unique number.

```
4 ^ 1 ^ 2 ^ 1 ^ 2
= 4 ^ (1 ^ 1) ^ (2 ^ 2)
= 4 ^ 0 ^ 0
= 4
```

### Why This Approach
- This is the **most elegant** bit manipulation trick. O(n) time, O(1) space.
- No hash map, no sorting needed.
- Interviewers love asking why XOR works — explain the two properties above.

### Java Code
```java
public class SingleNumber {

    public int singleNumber(int[] nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num; // XOR cancels duplicates
        }
        return result;
    }

    // ---- Test Cases ----
    public static void main(String[] args) {
        SingleNumber sol = new SingleNumber();

        System.out.println(sol.singleNumber(new int[]{4, 1, 2, 1, 2}));  // 4
        System.out.println(sol.singleNumber(new int[]{2, 2, 1}));         // 1
        System.out.println(sol.singleNumber(new int[]{1}));               // 1
        System.out.println(sol.singleNumber(new int[]{0, 1, 0}));         // 1
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| [4, 1, 2, 1, 2] | 4 |
| [2, 2, 1] | 1 |
| [1] | 1 |
| [0, 1, 0] | 1 |

---

<a id="find-two-non-repeating-numbers"></a>
## 4. Find Two Non-Repeating Numbers

### Problem Statement
Given an array where every element appears exactly **twice** except **two** elements — find those two elements. O(n) time, O(1) space.

```
Input: [1, 2, 3, 2, 1, 4]  → Output: [3, 4]
```

### Intuition
**Step 1**: XOR all elements → result is `a ^ b` (the two unique numbers).
**Step 2**: Find any set bit in `a ^ b` (use rightmost: `xor & (-xor)`). This bit differs between `a` and `b`.
**Step 3**: Split all numbers into two groups based on that bit. XOR each group separately → one group gives `a`, other gives `b`.

```
Array: [1, 2, 3, 2, 1, 4]
XOR all: 1^2^3^2^1^4 = 3^4 = 011 ^ 100 = 111 (7)

Rightmost set bit of 7 = 001 (bit 0)

Group A (bit 0 is 1): 1, 3, 1  → XOR = 3
Group B (bit 0 is 0): 2, 2, 4  → XOR = 4

Answer: 3, 4 ✓
```

### Why This Approach
Extends the XOR trick from problem 3. The key insight is using a **differentiating bit** to separate the two uniques into different groups.

### Java Code
```java
public class TwoSingleNumbers {

    public int[] singleNumber(int[] nums) {
        // Step 1: XOR all to get a ^ b
        int xor = 0;
        for (int num : nums) xor ^= num;

        // Step 2: Find rightmost set bit (differs between a and b)
        int diffBit = xor & (-xor);

        // Step 3: Partition and XOR separately
        int a = 0, b = 0;
        for (int num : nums) {
            if ((num & diffBit) != 0) a ^= num;
            else                      b ^= num;
        }
        return new int[]{a, b};
    }

    // ---- Test Cases ----
    public static void main(String[] args) {
        TwoSingleNumbers sol = new TwoSingleNumbers();

        int[] res1 = sol.singleNumber(new int[]{1, 2, 3, 2, 1, 4});
        System.out.println(res1[0] + ", " + res1[1]); // 3, 4

        int[] res2 = sol.singleNumber(new int[]{5, 7, 5, 9});
        System.out.println(res2[0] + ", " + res2[1]); // 7, 9
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| [1, 2, 3, 2, 1, 4] | [3, 4] |
| [5, 7, 5, 9] | [7, 9] |
| [1, 1, 2, 3] | [2, 3] |

---

<a id="reverse-bits-of-an-integer"></a>
## 5. Reverse Bits of an Integer

### Problem Statement
Reverse all 32 bits of an unsigned integer.

```
Input:  43261596  (00000010100101000001111010011100)
Output: 964176192 (00111001011110000010100101000000)
```

### Intuition
Process the input bit by bit from LSB to MSB, building the result from MSB to LSB:
- Extract the last bit of `n` using `n & 1`
- Shift result left and OR the extracted bit in
- Shift `n` right by 1

Do this 32 times.

```
n    = ...1011
Pass 1: result = (0 << 1) | 1 = 1,  n = ...101
Pass 2: result = (1 << 1) | 1 = 3,  n = ...10
Pass 3: result = (3 << 1) | 0 = 6,  n = ...1
Pass 4: result = (6 << 1) | 1 = 13, n = 0
```

### Why This Approach
Straightforward O(32) = O(1). For repeated calls (follow-up), cache 8-bit chunks in a lookup table for O(1) per call.

### Java Code
```java
public class ReverseBits {

    public int reverseBits(int n) {
        int result = 0;
        for (int i = 0; i < 32; i++) {
            result = (result << 1) | (n & 1); // pull LSB of n into result
            n >>= 1;
        }
        return result;
    }

    // ---- Test Cases ----
    public static void main(String[] args) {
        ReverseBits sol = new ReverseBits();

        // 43261596 → 964176192
        System.out.println(sol.reverseBits(43261596));

        // 0 → 0
        System.out.println(sol.reverseBits(0));

        // -1 (all 1s) → -1 (all 1s reversed = all 1s)
        System.out.println(sol.reverseBits(-1));

        // 1 (00...001) → -2147483648 (10...000)
        System.out.println(sol.reverseBits(1));
    }
}
```

### Test Cases
| Input (decimal) | Expected Output |
|---|---|
| 43261596 | 964176192 |
| 0 | 0 |
| -1 (all 32 bits set) | -1 |
| 1 | -2147483648 |

---

<a id="find-the-missing-number"></a>
## 6. Find the Missing Number

### Problem Statement
Given an array containing `n` distinct numbers in the range `[0, n]`, return the one number that is missing.

```
Input: [3, 0, 1]  → Output: 2
Input: [0, 1]     → Output: 2
Input: [9,6,4,2,3,5,7,0,1] → Output: 8
```

### Intuition
**XOR approach**: XOR all indices `0..n` with all array values. Pairs cancel, leaving the missing number.

```
Array = [3, 0, 1], n = 3
XOR indices: 0 ^ 1 ^ 2 ^ 3 = 0
XOR values:  3 ^ 0 ^ 1
Total XOR:   0^1^2^3 ^ 3^0^1
           = (0^0)^(1^1)^2^(3^3) = 2 ✓
```

### Why This Approach
Both sum formula (n*(n+1)/2 - sum) and XOR work. XOR avoids integer overflow risk for very large `n`.

### Java Code
```java
public class MissingNumber {

    // XOR approach — O(n) time, O(1) space
    public int missingNumber(int[] nums) {
        int xor = nums.length; // start with n
        for (int i = 0; i < nums.length; i++) {
            xor ^= i ^ nums[i]; // XOR index and value
        }
        return xor;
    }

    // Alternative: sum formula
    public int missingNumberSum(int[] nums) {
        int n = nums.length;
        int expectedSum = n * (n + 1) / 2;
        int actualSum = 0;
        for (int num : nums) actualSum += num;
        return expectedSum - actualSum;
    }

    // ---- Test Cases ----
    public static void main(String[] args) {
        MissingNumber sol = new MissingNumber();

        System.out.println(sol.missingNumber(new int[]{3, 0, 1}));            // 2
        System.out.println(sol.missingNumber(new int[]{0, 1}));               // 2
        System.out.println(sol.missingNumber(new int[]{9,6,4,2,3,5,7,0,1})); // 8
        System.out.println(sol.missingNumber(new int[]{0}));                  // 1
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| [3, 0, 1] | 2 |
| [0, 1] | 2 |
| [9,6,4,2,3,5,7,0,1] | 8 |
| [0] | 1 |

---

<a id="subsets-generation-using-bitmask"></a>
## 7. Subsets Generation using Bitmask

### Problem Statement
Given an array of **distinct** integers, return all possible subsets (the power set). Order doesn't matter.

```
Input: [1, 2, 3]
Output: [[], [1], [2], [1,2], [3], [1,3], [2,3], [1,2,3]]
```

### Intuition
For `n` elements there are `2^n` subsets. Each integer from `0` to `2^n - 1` is a **bitmask** where bit `i` being set means element `i` is included.

```
n = 3, masks 0..7:
000 → {}
001 → {1}
010 → {2}
011 → {1,2}
100 → {3}
101 → {1,3}
110 → {2,3}
111 → {1,2,3}
```

### Why This Approach
- No recursion needed. Bit `i` of mask directly encodes "include element i".
- Generalizes elegantly to set problems, combinatorics, DP on subsets.
- Foundation for bitmask DP (TSP, covered sets, etc.)

### Java Code
```java
import java.util.*;

public class Subsets {

    public List<List<Integer>> subsets(int[] nums) {
        int n = nums.length;
        int total = 1 << n; // 2^n
        List<List<Integer>> result = new ArrayList<>();

        for (int mask = 0; mask < total; mask++) {
            List<Integer> subset = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) { // bit i is set?
                    subset.add(nums[i]);
                }
            }
            result.add(subset);
        }
        return result;
    }

    // ---- Test Cases ----
    public static void main(String[] args) {
        Subsets sol = new Subsets();

        List<List<Integer>> res = sol.subsets(new int[]{1, 2, 3});
        System.out.println("Total subsets: " + res.size()); // 8
        res.forEach(System.out::println);

        // Edge: single element
        System.out.println(sol.subsets(new int[]{0})); // [[], [0]]
    }
}
```

### Test Cases
| Input | # Subsets | Sample Subsets |
|---|---|---|
| [1, 2, 3] | 8 | [], [1], [2], [1,2], ... |
| [0] | 2 | [], [0] |
| [] | 1 | [] |
| [1,2,3,4] | 16 | all 16 combinations |

---

<a id="maximum-xor-of-two-numbers-in-an-array"></a>
## 8. Maximum XOR of Two Numbers in an Array

### Problem Statement
Given an integer array `nums`, return the maximum result of `nums[i] XOR nums[j]`, where `0 <= i <= j < n`.

```
Input: [3, 10, 5, 25, 2, 8]  → Output: 28  (5 XOR 25 = 11101 = 28? No: 5=00101, 25=11001, XOR=11100=28) ✓
Input: [14, 70, 53, 83, 49, 91, 36, 80, 92, 51] → Output: 127
```

### Intuition
**Greedy bit-by-bit from MSB**: For maximum XOR, we want as many high bits set as possible. At each bit position (from 31 down to 0), we greedily try to set it in the answer:
1. Collect all prefixes (using the current bit length) into a set.
2. Tentatively assume the current bit can be 1 → `candidate = current_ans | (1 << bit)`.
3. Check if any two prefixes `a` and `b` exist in the set such that `a ^ b == candidate`.
4. This works because `a ^ b = candidate` ⟺ `a ^ candidate = b` — check if `b` is in the set.

### Why This Approach
- O(32n) = O(n) per bit level. Total O(32n) = O(n).
- Greedy works because each bit decision is independent — fixing a higher bit never prevents a lower bit from being 1.
- Can also be solved with a binary Trie: insert all numbers, then for each number greedily traverse opposite bits.

### Java Code
```java
import java.util.*;

public class MaximumXOR {

    // Greedy + HashSet approach — O(32n) = O(n)
    public int findMaximumXOR(int[] nums) {
        int maxXor = 0;
        int mask = 0;

        for (int i = 31; i >= 0; i--) {
            mask |= (1 << i); // include bit i in prefix

            // Collect all prefixes with current mask
            Set<Integer> prefixes = new HashSet<>();
            for (int num : nums) {
                prefixes.add(num & mask);
            }

            // Tentatively set this bit in the answer
            int candidate = maxXor | (1 << i);

            // Check if two prefixes XOR to candidate
            for (int prefix : prefixes) {
                if (prefixes.contains(candidate ^ prefix)) {
                    maxXor = candidate;
                    break;
                }
            }
        }
        return maxXor;
    }

    // ---- Test Cases ----
    public static void main(String[] args) {
        MaximumXOR sol = new MaximumXOR();

        System.out.println(sol.findMaximumXOR(new int[]{3, 10, 5, 25, 2, 8}));       // 28
        System.out.println(sol.findMaximumXOR(new int[]{0}));                          // 0
        System.out.println(sol.findMaximumXOR(new int[]{2, 4}));                       // 6
        System.out.println(sol.findMaximumXOR(
            new int[]{14,70,53,83,49,91,36,80,92,51}));                                // 127
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| [3, 10, 5, 25, 2, 8] | 28 |
| [0] | 0 |
| [2, 4] | 6 |
| [14,70,53,83,49,91,36,80,92,51] | 127 |

---

<a id="counting-bits--number-of-1s-for-0-to-n"></a>
## 9. Counting Bits — Number of 1s for 0 to N

### Problem Statement
Given an integer `n`, return an array `ans` of length `n + 1` such that for each `i` (0 ≤ i ≤ n), `ans[i]` is the **number of 1's** in the binary representation of `i`.

```
Input: n = 5
Output: [0, 1, 1, 2, 1, 2]
(0→0, 1→1, 2→1, 3→2, 4→1, 5→2)
```

### Intuition
**DP + bit trick**: For any number `i`:
- If `i` is even: `bits[i] = bits[i >> 1]` (right shift just removes a trailing 0, bit count same)
- If `i` is odd:  `bits[i] = bits[i >> 1] + 1` (right shift removes the trailing 1)

Combined: `bits[i] = bits[i >> 1] + (i & 1)`

```
i=0: 0
i=1: bits[0] + 1 = 1
i=2: bits[1] + 0 = 1
i=3: bits[1] + 1 = 2
i=4: bits[2] + 0 = 1
i=5: bits[2] + 1 = 2
```

### Why This Approach
- O(n) time, O(n) space (output).
- Builds on previously computed values — classic DP pattern.
- Avoids calling `hammingWeight` repeatedly (which would be O(n log n)).

### Java Code
```java
public class CountingBits {

    public int[] countBits(int n) {
        int[] bits = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            // Right-shift reuses smaller subproblem; (i & 1) adds the LSB
            bits[i] = bits[i >> 1] + (i & 1);
        }
        return bits;
    }

    // ---- Test Cases ----
    public static void main(String[] args) {
        CountingBits sol = new CountingBits();

        printArray(sol.countBits(0));  // [0]
        printArray(sol.countBits(1));  // [0, 1]
        printArray(sol.countBits(5));  // [0, 1, 1, 2, 1, 2]
        printArray(sol.countBits(8));  // [0,1,1,2,1,2,2,3,1]
    }

    static void printArray(int[] arr) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            sb.append(arr[i]);
            if (i < arr.length - 1) sb.append(", ");
        }
        System.out.println(sb.append("]"));
    }
}
```

### Test Cases
| n | Expected Output |
|---|---|
| 0 | [0] |
| 1 | [0, 1] |
| 5 | [0, 1, 1, 2, 1, 2] |
| 8 | [0,1,1,2,1,2,2,3,1] |

---

<a id="single-number-iii--element-appearing-once-when-others-appear-three-times"></a>
## 10. Single Number III — Element Appearing Once When Others Appear Three Times

### Problem Statement
Given an integer array where every element appears **three times** except for **one** element which appears exactly once. Find that element. O(n) time, O(1) space.

```
Input: [2, 2, 3, 2]    → Output: 3
Input: [0, 1, 0, 1, 0, 1, 99] → Output: 99
```

### Intuition
For each bit position, count the total number of 1s across all numbers. If the unique number has a 1 in that bit, the count will **not** be divisible by 3.

**Bit counting approach**: For each of the 32 bits, sum how many numbers have that bit set. `count % 3` gives the unique number's bit at that position.

**State machine approach (advanced O(1) space, no loop per bit)**:
Use two variables `ones` and `twos` to track bits seen once and twice. When a bit is seen three times it resets to 0.

```
ones = bits seen 1 time (mod 3)
twos = bits seen 2 times (mod 3)

For each number x:
  ones = (ones ^ x) & ~twos
  twos = (twos ^ x) & ~ones
```

### Why This Approach
The bit-count approach is easy to reason about. The state machine is the interview gold standard — it handles the "three times" constraint with pure bit operations, no extra array.

### Java Code
```java
public class SingleNumberIII {

    // Approach 1: Bit counting — O(32n) = O(n)
    public int singleNumberBitCount(int[] nums) {
        int result = 0;
        for (int i = 0; i < 32; i++) {
            int sum = 0;
            for (int num : nums) {
                sum += (num >> i) & 1; // count 1s at bit i
            }
            if (sum % 3 != 0) {
                result |= (1 << i); // this bit belongs to the unique number
            }
        }
        return result;
    }

    // Approach 2: State machine — O(n) time, O(1) space (elegant)
    public int singleNumber(int[] nums) {
        int ones = 0, twos = 0;
        for (int num : nums) {
            ones = (ones ^ num) & ~twos;  // add to ones if not in twos
            twos = (twos ^ num) & ~ones;  // add to twos if not in ones
        }
        return ones; // ones holds bits seen exactly once
    }

    // ---- Test Cases ----
    public static void main(String[] args) {
        SingleNumberIII sol = new SingleNumberIII();

        System.out.println(sol.singleNumber(new int[]{2, 2, 3, 2}));           // 3
        System.out.println(sol.singleNumber(new int[]{0,1,0,1,0,1,99}));       // 99
        System.out.println(sol.singleNumber(new int[]{-2,-2,1,1,-3,1,-3,-3,-4,-2})); // -4
        System.out.println(sol.singleNumber(new int[]{1, 1, 1, 3}));           // 3
    }
}
```

### Test Cases
| Input | Expected |
|---|---|
| [2, 2, 3, 2] | 3 |
| [0,1,0,1,0,1,99] | 99 |
| [-2,-2,1,1,-3,1,-3,-3,-4,-2] | -4 |
| [1, 1, 1, 3] | 3 |

---

## Pattern Coverage Summary

| # | Problem | Core Pattern Covered |
|---|---|---|
| 1 | Power of Two | `n & (n-1)` — remove lowest set bit |
| 2 | Count Set Bits | Brian Kernighan, popcount |
| 3 | Single Number (×2) | XOR self-cancellation |
| 4 | Two Single Numbers | XOR + differentiating bit partition |
| 5 | Reverse Bits | Bit extraction & construction |
| 6 | Missing Number | XOR index-value pairing |
| 7 | Subsets via Bitmask | Bitmask enumeration, power set |
| 8 | Maximum XOR | Greedy MSB-first, prefix sets / Trie |
| 9 | Counting Bits | DP + `i >> 1` recurrence |
| 10 | Single Num (×3) | Bit counting mod k, state machine |

> **Key insight**: 95% of bit manipulation questions are variations on XOR cancellation, bit counting, bitmask enumeration, greedy bit construction, or the `n & (n-1)` trick. Master these 10 and you have them all.