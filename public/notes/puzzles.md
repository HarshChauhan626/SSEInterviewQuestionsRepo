# 🧩 50 Classic Logic & Math Puzzles

---

## 1. Two Egg Drop Problem

### Problem Statement
You have 2 eggs and a 100-floor building. Find the **highest floor** from which an egg can be dropped without breaking, using the **minimum number of trials** in the worst case.

### Intuition
- If you had 1 egg, you'd have to go floor-by-floor from bottom: worst case = 100 tries.
- With 2 eggs, use the first egg to "narrow down" a range, then use the second egg linearly within that range.
- The trick: let the first egg jump in **decreasing steps** so that total trials stay constant regardless of where it breaks.

If the first egg is dropped at floors: x, x+(x-1), x+(x-1)+(x-2), ... up to 100, and the total adds up to at least 100, then:
`x(x+1)/2 >= 100` → `x = 14`

### Solution
- Drop egg 1 from floors: **14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100**
- When egg 1 breaks at floor F, start egg 2 from the previous checkpoint and go one floor at a time.
- **Answer: 14 trials** in the worst case.

### Dry Run
- Drop egg 1 at floor 14 → doesn't break
- Drop egg 1 at floor 27 → breaks!
- Drop egg 2 at floor 15 → doesn't break
- Drop egg 2 at floor 16 → doesn't break
- ...
- Drop egg 2 at floor 26 → doesn't break
- Critical floor = **26** (27 breaks, 26 is safe)
- Total drops = 2 (egg1) + 12 (egg2) = **14 trials** ✓

---

## 2. Three Switches and Three Bulbs

### Problem Statement
There are 3 light switches outside a room, each controlling one of 3 bulbs inside the room. You can flip switches however you like, but you may **enter the room only once**. Determine which switch controls which bulb.

### Intuition
With only one visit, you need more than on/off binary. **Heat** is the key — a bulb that was on for a while will be warm even after being turned off.

### Solution
1. Turn **Switch 1 ON** for 10 minutes.
2. Turn **Switch 1 OFF**, then turn **Switch 2 ON**.
3. Enter the room.
   - **Bulb that is ON** → controlled by Switch 2
   - **Bulb that is OFF but warm** → controlled by Switch 1
   - **Bulb that is OFF and cold** → controlled by Switch 3

### Dry Run
- S1 on for 10 min → Bulb A warms up
- S1 off, S2 on → Bulb B lights up
- Enter: Bulb B lit → Switch 2; Bulb A warm/off → Switch 1; Bulb C cold/off → Switch 3 ✓

---

## 3. Bridge and Torch Problem

### Problem Statement
Four people must cross a bridge at night. They have **one torch** and the bridge holds only **2 people** at a time. Speeds: A=1 min, B=2 min, C=5 min, D=10 min. Two people walk at the **slower person's pace**. What is the minimum time to get everyone across?

### Intuition
Naively sending the fastest person back each time costs: 1+10+1+5+1+2 = 20 min.  
Better: pair the two slowest together, and use the two fastest to shuttle the torch.

### Solution
**Step 1:** A and B cross → 2 min  
**Step 2:** A returns → 1 min  
**Step 3:** C and D cross → 10 min  
**Step 4:** B returns → 2 min  
**Step 5:** A and B cross → 2 min  

**Total = 2+1+10+2+2 = 17 minutes**

### Dry Run
| Step | Action | Time | Elapsed |
|------|--------|------|---------|
| 1 | A+B cross | 2 | 2 |
| 2 | A returns | 1 | 3 |
| 3 | C+D cross | 10 | 13 |
| 4 | B returns | 2 | 15 |
| 5 | A+B cross | 2 | 17 |

---

## 4. Monty Hall Problem

### Problem Statement
You're on a game show with 3 doors. Behind one is a car, behind the others are goats. You pick Door 1. The host (who knows what's behind each door) opens Door 3 revealing a goat. Should you **switch** to Door 2 or **stay** with Door 1?

### Intuition
Initially, your door has 1/3 chance of being right and the other two combined have 2/3. After the host reveals a goat (he always reveals a goat), all that 2/3 probability **collapses onto the one remaining door**. Switching wins 2/3 of the time.

### Solution
- **Stay**: wins 1/3 of the time
- **Switch**: wins 2/3 of the time
- **Always switch!**

### Dry Run (100 simulations mentally)
- In 33 cases, car is behind Door 1 → switching loses
- In 67 cases, car is behind Door 2 or Door 3 → host reveals the goat door → switching wins
- Switching wins **67 out of 100 times** ✓

---

## 5. Birthday Paradox

### Problem Statement
How many people do you need in a room before there's a **>50% chance** that two of them share a birthday?

### Intuition
We tend to think "1 in 365" per person, but we're comparing **every pair**, not just against one specific date. The number of pairs grows as n², so the probability rises much faster than expected.

### Solution
P(no shared birthday among n people) = (365/365) × (364/365) × (363/365) × ... × ((365−n+1)/365)

We want this to fall below 0.5.

At **n = 23**: P(no match) ≈ 0.4927 → P(at least one match) ≈ **50.7%**

**Answer: 23 people**

### Dry Run
| n | P(no match) | P(match) |
|---|-------------|----------|
| 10 | 88.3% | 11.7% |
| 20 | 58.9% | 41.1% |
| 23 | 49.3% | **50.7%** |
| 30 | 29.4% | 70.6% |
| 57 | ~1% | ~99% |

---

## 6. Poisoned Bottle Puzzle

### Problem Statement
You have 1000 bottles of wine, exactly one is poisoned. You have 10 test strips. Poison kills a rat within 24 hours. You can test multiple strips simultaneously. Identify the poisoned bottle in **24 hours** using only 10 rats.

### Intuition
Use **binary encoding**. Number the bottles 1–1000. Each bottle's binary representation uses at most 10 bits. Each rat represents one bit. Give each rat a sip from every bottle whose binary number has a '1' in that rat's bit position.

### Solution
- Number bottles 1 to 1000 (binary: up to 10 digits)
- Rat 1 = bit 1, Rat 2 = bit 2, ..., Rat 10 = bit 10
- Each rat drinks from all bottles that have a '1' in its bit position
- After 24 hours, the pattern of dead rats forms a binary number → that's the poisoned bottle

2^10 = **1024 ≥ 1000** ✓

### Dry Run
- Say bottle **613** is poisoned: 613 = `1001100101` in binary
- Rats 1, 3, 6, 9, 10 die
- Binary: bit positions 1,3,6,9,10 = `1001100101` = **613** ✓

---

## 7. Water Jug Problem

### Problem Statement
You have a **3-liter** jug and a **5-liter** jug. No markings. Measure exactly **4 liters** of water.

### Intuition
Use Bezout's identity: gcd(3,5)=1, so any integer combination is achievable. Systematically fill and pour between jugs.

### Solution
**Method:**
1. Fill 5L jug
2. Pour into 3L jug (3L fills, 2L remains in 5L)
3. Empty 3L jug
4. Pour 2L from 5L into 3L
5. Fill 5L jug again
6. Pour from 5L into 3L (which already has 2L, needs 1L more)
7. 5L jug now has **4L** ✓

### Dry Run
| Step | 3L Jug | 5L Jug |
|------|--------|--------|
| Start | 0 | 0 |
| Fill 5L | 0 | 5 |
| Pour 5→3 | 3 | 2 |
| Empty 3L | 0 | 2 |
| Pour 5→3 | 2 | 0 |
| Fill 5L | 2 | 5 |
| Pour 5→3 | 3 | **4** ✓ |

---

## 8. 100 Prisoners Problem

### Problem Statement
100 prisoners, each numbered 1–100. A room has 100 boxes, each containing a random number 1–100 (one each). Each prisoner may open **50 boxes**. If all find their own number, everyone is freed. Strategy?

### Intuition
Random guessing: (1/2)^100 ≈ 0. The brilliant strategy uses **cycles**: each prisoner starts at their own number box, then follows the chain of numbers inside.

### Solution
**Cycle-following strategy:**
- Prisoner N opens box N
- If it contains number M (≠N), opens box M
- Continue following numbers until finding N or exhausting 50 tries
- This works if the **longest cycle in the permutation ≤ 50**

P(longest cycle ≤ 50) ≈ **31.18%** — vs near 0% random!

### Dry Run
Permutation: Box1→7, Box7→4, Box4→1 (cycle of length 3)  
Prisoner 1: opens box 1 → sees 7 → opens box 7 → sees 4 → opens box 4 → sees **1** ✓ (found in 3 steps)

---

## 9. Counterfeit Coin Puzzle

### Problem Statement
You have 12 coins, one is counterfeit (either heavier or lighter). Find the counterfeit coin and determine if it's heavier or lighter in exactly **3 weighings** on a balance scale.

### Intuition
Each weighing has 3 outcomes (left heavy, right heavy, balanced). With 3 weighings: 3^3 = 27 possible outcomes, enough to distinguish 24 possibilities (12 coins × 2 states: heavier/lighter).

### Solution
**Weighing 1:** Coins {1,2,3,4} vs {5,6,7,8}  
**Case A (balanced):** Counterfeit is in {9,10,11,12}  
  - Weighing 2: {9,10,11} vs {1,2,3} (known good)  
  - Narrow down in weighing 3  
**Case B (left heavy):** Counterfeit is in {1,2,3,4} (heavy) or {5,6,7,8} (light)  
  - Use weighing 2 and 3 to isolate

Full solution covers all cases with precise group swaps.

### Dry Run
- W1: {1,2,3,4} vs {5,6,7,8} → **balanced** → fake in {9,10,11,12}
- W2: {9,10,11} vs {1,2,3} → **left heavy** → fake is 9, 10, or 11 (heavy)
- W3: {9} vs {10} → **right heavy** → **Coin 10 is heavy** ✓

---

## 10. Fox, Chicken, and Grain River Crossing

### Problem Statement
A farmer must cross a river with a **fox**, a **chicken**, and a **bag of grain**. The boat holds only the farmer + one item. Fox eats chicken if left alone; chicken eats grain if left alone. How does the farmer get all across safely?

### Intuition
The chicken is the problem (it can't be left with either). The key insight: you can **bring something back** — it's not wasted effort.

### Solution
1. Take **chicken** across → return alone
2. Take **fox** across → return with **chicken**
3. Take **grain** across → return alone
4. Take **chicken** across

### Dry Run
| Step | Left Bank | Boat | Right Bank |
|------|-----------|------|------------|
| Start | F,Ch,G,Fox | | |
| 1→ | F,G,Fox | Ch→ | |
| 2← | F,G,Fox | ←F | Ch |
| 3→ | F,Ch | Fox→ | Ch |
| 4← | F,Ch | ←Ch | Fox,G |
| 5→ | F | G→ | Fox,G |
| 6← | F | ←F | Ch,Fox,G |
| 7→ | | Ch→ | All ✓ |

---

## 11. Blue Eyes Island Puzzle

### Problem Statement
On an island, 100 people have blue eyes, 100 have brown eyes. No mirrors; no one knows their own eye color. If you know your eye color, you **must leave** the next day. A visitor announces: **"I see at least one person with blue eyes."** What happens?

### Intuition
The announcement adds **common knowledge** — everyone now knows that *everyone knows* there's at least one blue-eyed person. Use inductive reasoning.

### Solution
- If 1 blue-eyed person: they see no others, know it's them → **leaves day 1**
- If 2 blue-eyed: each sees 1 other, waits for day 1, no one leaves → each deduces they're blue-eyed → **both leave day 2**
- If n blue-eyed: all leave on **day n**

With 100 blue-eyed people: all **100 leave on day 100**. Brown-eyed people never leave (no one announces brown eyes).

### Dry Run (n=3)
- Day 1: Each blue-eyed person sees 2 others, doesn't leave
- Day 2: Each thinks "if I'm not blue, those 2 would've left day 1" — they didn't → Day 3 all 3 leave ✓

---

## 12. Prisoners and Hats Puzzle

### Problem Statement
10 prisoners stand in a line. Each gets a **black or white hat**. Starting from the back, each must say only "black" or "white." If wrong, they're executed. The group can strategize beforehand. Guarantee saving at least **9 out of 10**.

### Intuition
The last person (who sees all others) can encode information in their guess using **parity**.

### Solution
- **Prisoner 10** (back): counts total black hats visible. If odd, says "black"; if even, says "white." (50% survival chance)
- **Prisoner 9**: counts black hats visible ahead. Uses parity information from prisoner 10 to deduce own hat color.
- Each subsequent prisoner updates the running parity to determine their own hat.
- **Prisoners 1–9 are guaranteed to survive; prisoner 10 has 50% chance.**

### Dry Run
Hats (back to front): B W B B W (prisoners 5→1)  
- P5 sees B,B,W → 2 blacks (even) → says "**white**" (may die)  
- P4 knows even parity, sees B,W ahead (1 black, odd) → parity changed → P4 must be **black** → says "black" ✓  
- Continue updating parity each round ✓

---

## 13. Truth Tellers and Liars (Two Guards)

### Problem Statement
Two guards stand before two doors: one to freedom, one to death. One guard **always lies**, one **always tells the truth**. You may ask **one question** to one guard to find the door to freedom.

### Intuition
Any single-guard question introduces uncertainty about which guard you asked. The trick: craft a question that yields the same answer from **both** a truth-teller and a liar.

### Solution
Ask either guard: **"If I asked the other guard which door leads to freedom, what would they say?"**

- If you ask the truth-teller: they truthfully report what the liar would say → **wrong door**
- If you ask the liar: they lie about what the truth-teller would say → **wrong door**

Both point to the **wrong door** → go through the **other door**.

### Dry Run
- Door A = freedom, Door B = death
- Truth-teller would say "A." Liar would say "B."
- Ask truth-teller about liar's answer → "B" (truthfully reporting liar's lie)
- Ask liar about truth-teller's answer → "B" (lying about truth-teller's truth)
- Both say "B" → choose **Door A** ✓

---

## 14. Clock Angle Problem

### Problem Statement
What is the angle between the hour and minute hands of a clock at **3:27**?

### Intuition
Both hands move continuously. Calculate each hand's position in degrees (0° at 12), then find the difference.

### Solution
- **Minute hand:** 360° / 60 min × 27 min = **162°**
- **Hour hand:** 360° / 12 hr × 3 hr + 360° / 12 hr / 60 min × 27 min  
  = 90° + 13.5° = **103.5°**
- **Difference:** |162° - 103.5°| = **58.5°**

### Dry Run
- At 3:00: hour hand = 90°, minute = 0°
- Each minute: minute hand moves 6°, hour hand moves 0.5°
- After 27 min: minute = 27×6 = 162°; hour = 90 + 27×0.5 = 103.5°
- Angle = **58.5°** ✓

---

## 15. Train Crossing / Relative Speed Puzzle

### Problem Statement
A man walks along a railway track. A train going the **same direction** passes him in **20 seconds**. A train of equal length going the **opposite direction** passes him in **5 seconds**. If trains are 100m long, find the train's speed.

### Intuition
Relative speed differs based on direction. Same direction: speeds subtract. Opposite direction: speeds add. Set up two equations.

### Solution
Let train speed = T, man speed = M (both m/s), train length = 100m  
- Same direction: 100 / (T - M) = 20 → T - M = 5
- Opposite direction: 100 / (T + M) = 5 → T + M = 20

Solving: **T = 12.5 m/s = 45 km/h**, **M = 7.5 m/s**

### Dry Run
- T - M = 5, T + M = 20
- Adding: 2T = 25 → T = 12.5 m/s ✓
- Subtracting: 2M = 15 → M = 7.5 m/s ✓
- Check: 100 / (12.5-7.5) = 100/5 = 20 sec ✓; 100/20 = 5 sec ✓

---

## 16. Seating Arrangement Puzzle

### Problem Statement
5 people (A, B, C, D, E) must sit in a row. A and B must not sit next to each other. How many valid arrangements are there?

### Intuition
Total arrangements minus arrangements where A and B **are** adjacent.

### Solution
- **Total:** 5! = 120
- **A and B adjacent:** treat AB as a unit → 4! arrangements × 2 (AB or BA) = 48
- **Valid:** 120 - 48 = **72**

### Dry Run
- Total permutations of 5 people = 120
- AB as a block: 4 positions for block + 3 others = 4! = 24; block can be AB or BA → 48
- 120 - 48 = **72 valid arrangements** ✓

---

## 17. Chessboard Domino Covering Puzzle

### Problem Statement
A standard 8×8 chessboard has two opposite corner squares removed (64 - 2 = 62 squares). Can you cover all 62 squares with **31 dominoes** (each covers 2 squares)?

### Intuition
Each domino covers one black and one white square. What color are the two removed corners?

### Solution
Opposite corners of a chessboard are the **same color** (both black or both white). So after removing them, we have **30 of one color and 32 of the other**. A domino always covers 1 black + 1 white, so tiling 30+32 squares is **impossible** — you'd always have 2 squares of the same color uncovered.

**Answer: No, it's impossible.**

### Dry Run
- Standard board: 32 black, 32 white squares
- Remove both corners (same color, say black): 30 black, 32 white
- Each domino covers 1 black + 1 white
- 31 dominoes cover 31 black + 31 white — but we only have 30 black!
- **Impossible** ✓

---

## 18. Matchstick Equation Puzzle

### Problem Statement
Given the matchstick equation: **VI = VII + I** — move exactly one matchstick to make the equation correct.

### Intuition
Think laterally — you don't have to keep it as addition. Could also flip or rearrange.

### Solution
Move one matchstick from the right side to turn the `+` into `-`:  
**VII = VII - I** → wait, reframe:  
Move one stick from the first `I` in `VII` on the right to make: **VI = VI + I**? No.

Best answer: Move the `=` sign's top matchstick:  
**VII - I = VI** → Move one stick from `+` to make it `-`:  
**VI = VII - I** ✓  (6 = 7 - 1 ✓)

### Dry Run
Original: VI = VII + I (6 = 7 + 1 = 8 ✗)  
Move one stick from `+` to form `-`: VI = VII - I → 6 = 7 - 1 = **6** ✓

---

## 19. Family Probability Puzzle

### Problem Statement
A family has two children. You're told at least one is a boy. What is the probability that **both are boys**?

### Intuition
The sample space isn't just {boy, girl} for the unknown child — it's conditional on what we know.

### Solution
All possibilities: BB, BG, GB, GG (equal probability)  
"At least one boy" eliminates GG → remaining: {BB, BG, GB}  
Only BB satisfies "both boys"  
**P = 1/3**

### Dry Run
- Full space: {BB, BG, GB, GG} — each 25%
- Condition: at least one boy → remove GG
- Remaining: {BB, BG, GB} — renormalize to 33.3% each
- P(BB) = **1/3** ✓

---

## 20. Fermi Estimation: Piano Tuners in Chicago

### Problem Statement
Estimate the number of **piano tuners** in Chicago.

### Intuition
Break into estimable sub-problems and multiply through.

### Solution
1. Population of Chicago: ~3,000,000
2. Average household size: 3 → 1,000,000 households
3. Fraction with pianos: ~1 in 20 → **50,000 pianos**
4. Piano tuned once/year; tuner does 4/day × 250 days = 1,000 pianos/year
5. Tuners needed: 50,000 / 1,000 = **~50 piano tuners**

Actual answer: ~50–100. ✓

### Dry Run
- 3M people / 3 per household = 1M households
- 5% have pianos = 50,000 pianos
- Each needs tuning once/year → 50,000 tunings/year
- Each tuner does ~1,000/year
- 50,000 / 1,000 = **50 tuners** ✓

---

## 21. Wolf, Goat, and Cabbage Puzzle

### Problem Statement
A farmer must cross a river with a **wolf**, **goat**, and **cabbage**. The boat holds farmer + one item. Wolf eats goat; goat eats cabbage if left alone. Get all three across safely.

### Intuition
Same logic as Fox-Chicken-Grain (puzzle #10). The goat is the problem item — never leave it alone with either.

### Solution
1. Take **goat** across → return
2. Take **wolf** across → return with **goat**
3. Take **cabbage** across → return
4. Take **goat** across

(Or: steps 2–3 swap wolf with cabbage — two valid solutions)

### Dry Run
| Step | Left | Right |
|------|------|-------|
| Start | Wolf, Goat, Cabbage | - |
| Take Goat → | Wolf, Cabbage | Goat |
| ← Return | Wolf, Cabbage | Goat |
| Take Wolf → | Cabbage | Goat, Wolf |
| ← Return with Goat | Goat, Cabbage | Wolf |
| Take Cabbage → | Goat | Wolf, Cabbage |
| ← Return | Goat | Wolf, Cabbage |
| Take Goat → | - | All ✓ |

---

## 22. Tower of Hanoi

### Problem Statement
Move **n disks** from peg A to peg C using peg B as auxiliary. Rules: move one disk at a time; never place a larger disk on a smaller one. Minimum moves?

### Intuition
To move n disks: move top n-1 to B (using C), move largest to C, move n-1 from B to C (using A). Recursive!

### Solution
**T(n) = 2·T(n-1) + 1**  
Solving: **T(n) = 2^n - 1**

For 3 disks: 2³ - 1 = **7 moves**

### Dry Run (3 disks: A→C)
1. A→C (disk 1)
2. A→B (disk 2)
3. C→B (disk 1)
4. A→C (disk 3)
5. B→A (disk 1)
6. B→C (disk 2)
7. A→C (disk 1) ✓

---

## 23. Burning Ropes Timing Puzzle

### Problem Statement
You have **2 ropes**, each burns in exactly **1 hour** (but not uniformly). Measure exactly **45 minutes**.

### Intuition
Burning one rope from both ends halves its time (30 min). Combine with a full rope for the remaining 15 min.

### Solution
1. Light **Rope 1 from both ends** and **Rope 2 from one end** simultaneously.
2. After **30 min**, Rope 1 is done. At this moment, light **Rope 2's other end**.
3. Rope 2 had 30 min remaining; burning from both ends → finishes in **15 more min**.
4. Total: 30 + 15 = **45 minutes** ✓

### Dry Run
- t=0: Rope1 both ends lit, Rope2 one end lit
- t=30: Rope1 burns out; Rope2 has 30 min left
- t=30: Light Rope2's other end → halves remaining time
- t=45: Rope2 burns out → **exactly 45 min measured** ✓

---

## 24. Heavy Pill Bottle Puzzle

### Problem Statement
You have 10 pill bottles, each with 100 pills. 9 bottles have pills weighing **10g** each; 1 bottle has pills weighing **11g** each. You have a **digital scale** (one use). Find the heavy bottle.

### Intuition
With one weighing, you need to encode which bottle is heavy in the total weight. Use a different count from each bottle.

### Solution
- Take **1 pill** from bottle 1, **2 pills** from bottle 2, ..., **10 pills** from bottle 10
- Total pills = 1+2+...+10 = 55
- If all were 10g: expected weight = **550g**
- Actual weight = 550 + k (where k = bottle number with heavy pills)

### Dry Run
- Take pills as described; weigh them all
- Scale shows **553g** → 553 - 550 = 3 → **Bottle 3** is heavy ✓
- Scale shows **557g** → Bottle 7 is heavy ✓

---

## 25. Nine Balls Weight Puzzle

### Problem Statement
You have 9 balls, identical in appearance. One is **heavier**. Find it using a balance scale in **2 weighings**.

### Intuition
Each weighing has 3 outcomes. 3^2 = 9 — exactly enough to identify 1 among 9.

### Solution
**Weighing 1:** Group into three groups of 3: {1,2,3}, {4,5,6}, {7,8,9}  
Weigh {1,2,3} vs {4,5,6}:  
- Left heavy → heavy ball in {1,2,3}  
- Right heavy → heavy ball in {4,5,6}  
- Balanced → heavy ball in {7,8,9}  

**Weighing 2:** Take the identified group of 3. Weigh any 2 against each other:  
- One side heavier → that's the heavy ball  
- Balanced → the unweighed ball is heavy  

### Dry Run
- W1: {1,2,3} vs {4,5,6} → **right side heavy** → heavy ball in {4,5,6}
- W2: {4} vs {5} → **left side heavy** → **Ball 4 is heavy** ✓

---

## 26. Five Pirates Gold Division Puzzle

### Problem Statement
5 pirates (ranked 1–5, with 1 being most senior) found 100 gold coins. The most senior proposes a split; all vote. If 50%+ agree, it passes; otherwise the proposer is thrown overboard and the next senior pirate proposes. Each pirate prefers: 1) survival, 2) more gold, 3) throwing others overboard. What does Pirate 1 propose?

### Intuition
Work **backwards** from the simplest case (2 pirates).

### Solution
- **2 pirates:** Pirate 2 takes all 100 (owns 50% of vote)
- **3 pirates:** Pirate 3 must get Pirate 1's vote. Offer P1 = 1 coin (better than 0). P3 proposes: P3=99, P2=0, P1=1
- **4 pirates:** P4 needs 2 votes. P2 gets 0 in 3-pirate scenario → offer P2=1. P4=99, P3=0, P2=1, P1=0
- **5 pirates:** P5 needs 3 votes. P3 and P1 get 0 in 4-pirate scenario → offer them 1 each. 

**Pirate 1 proposes: P1=98, P2=0, P3=1, P4=0, P5=1**

### Dry Run
- P1 votes yes (gets 98 vs dying in 4-pirate scenario where P1=0)... wait, recalculate:
- Actually P5 proposes; pirates are 5→1 senior. Working back confirms:
- **Proposal: {Pirate 5 = 98, Pirate 4 = 0, Pirate 3 = 1, Pirate 2 = 0, Pirate 1 = 1}**
- P5, P3, P1 vote yes (3 ≥ 50% of 5) ✓

---

## 27. Crossing Bridge with Different Speeds

*(See Puzzle #3 — Bridge and Torch Problem for the classic variant)*

### Problem Statement (Extended)
Persons A(1min), B(2min), C(7min), D(10min). Same torch, 2-person bridge. Minimum crossing time?

### Solution
**Strategy: always pair slowest two, use two fastest to shuttle.**

1. A+B cross (2 min); A returns (1 min) → elapsed: 3
2. C+D cross (10 min); B returns (2 min) → elapsed: 15
3. A+B cross (2 min) → elapsed: **17 min**

Wait, same as original. With C=7: still 17? Let's recheck with 7 instead of 5:

1. A+B → 2; A returns → 1; elapsed 3
2. C+D → 10; B returns → 2; elapsed 15
3. A+B → 2; elapsed **17 min** ✓

---

## 28. Measure 4 Liters with 3L and 5L Jugs

*(See Puzzle #7 — Water Jug Problem — for full solution)*

**Quick Answer:** Fill 5L, pour into 3L, empty 3L, pour remaining 2L into 3L, fill 5L, pour into 3L (needs 1L), **4L remains in 5L jug** ✓

---

## 29. Camel and Banana Puzzle

### Problem Statement
A camel must carry **3000 bananas** across a **1000-mile desert**. It can carry at most **1000 bananas** and eats **1 banana per mile**. Maximize bananas delivered.

### Intuition
The camel must make multiple trips. At the start with 3000 bananas, it must make 3 trips (5 legs: 3 forward, 2 back). As bananas decrease to 2000, only 2 trips needed. Use **"caching" at intermediate points**.

### Solution
- **Phase 1 (0 to 200 miles):** 3 loads, 5 legs. Bananas consumed per mile = 5. Travel 200 miles: 5×200=1000 bananas used. Start: 3000, End: 2000 bananas at mile 200.
- **Phase 2 (200 to 533.3 miles):** 2 loads, 3 legs. Bananas consumed per mile = 3. Travel 333.3 miles: 3×333.3=1000 bananas used. Start: 2000, End: 1000 bananas at mile 533.3.
- **Phase 3 (533.3 to 1000 miles):** 1 load. Distance = 466.7 miles. Bananas consumed: 466.7. Delivered: 1000 - 466.7 = **533.3 bananas** (≈ 533 bananas)

### Dry Run
| Phase | Miles | Legs | Cost/mile | Distance | Bananas left |
|-------|-------|------|-----------|----------|--------------|
| 1 | 0–200 | 5 | 5 | 200 | 2000 |
| 2 | 200–533 | 3 | 3 | 333 | 1000 |
| 3 | 533–1000 | 1 | 1 | 467 | **533** |

---

## 30. Coin Flip Strategy Puzzle

### Problem Statement
Two players take turns flipping a fair coin. The first to flip **heads** wins. Player 1 goes first. What is Player 1's probability of winning?

### Intuition
Player 1 wins on turn 1, 3, 5, ... (odd rounds). Each round, both players must flip tails first.

### Solution
P(P1 wins on round 1) = 1/2  
P(P1 wins on round 2) = (1/2)(1/2)(1/2) = 1/8  
P(P1 wins on round 3) = (1/4)³ × (1/2) = 1/32  

P(P1 wins) = 1/2 + 1/8 + 1/32 + ... = (1/2) / (1 - 1/4) = (1/2)/(3/4) = **2/3**

### Dry Run
- P1 wins: 1/2 + 1/8 + 1/32 + ... = geometric series, sum = **2/3** ≈ 66.7%
- P2 wins: 1 - 2/3 = **1/3** ≈ 33.3% ✓

---

## 31. Elevator Puzzle

### Problem Statement
You live on the 10th floor. Every morning you take the elevator **down to the ground floor**. When you return, you take the elevator to the **7th floor** and walk up the remaining 3 floors — except on rainy days. Why?

### Intuition
This is a lateral thinking puzzle, not math.

### Solution
**You are too short to reach the button above floor 7.**  
On rainy days, you carry an **umbrella**, and use it to press the higher floor buttons.

### Dry Run
- Short person can reach buttons up to floor 7
- On dry days: can only press 7, walks 3 flights
- On rainy days: umbrella extends reach → can press 10 ✓

---

## 32. Farmer River Crossing Variants

### Problem Statement
A farmer has a **fox, 3 chickens, and a bag of grain**. The boat holds farmer + 2 items. Fox eats chicken; chicken eats grain. Get all across safely.

### Intuition
With capacity for 2 items, more combinations are possible. Carry the "conflict pairs" across together under supervision.

### Solution
1. Take fox + chicken → return alone
2. Take chicken + grain → return with fox
3. Take fox + chicken → done

Or many other valid sequences given the larger capacity.

### Dry Run
- Trip 1: Fox + Chicken → Right (Grain alone: safe)
- Return: Farmer alone
- Trip 2: Chicken + Grain → Right
- Return: Farmer + Fox
- Trip 3: Fox + Chicken → Right ✓

---

## 33. N-Queens Problem

### Problem Statement
Place **N queens** on an N×N chessboard so that no two queens attack each other (no shared row, column, or diagonal). How many solutions exist for N=8?

### Intuition
Use **backtracking**: place queens row by row, checking column and diagonal conflicts at each step.

### Solution
For N=8: **92 solutions** (12 fundamental solutions excluding rotations/reflections).

**Algorithm:**
- For each row, try each column
- Check: no queen in same column, no queen in same diagonal (|row_diff| == |col_diff|)
- Recurse; backtrack if no valid position

### Dry Run (N=4)
```
. Q . .
. . . Q
Q . . .
. . Q .
```
One valid solution for 4-queens:  
Positions: (1,2), (2,4), (3,1), (4,3) → No conflicts ✓ (Total: 2 solutions for N=4)

---

## 34. Sudoku Logic Puzzle

### Problem Statement
Fill a 9×9 grid so every row, column, and 3×3 box contains digits **1–9** exactly once.

### Intuition
Use constraint propagation + backtracking. Humans use logical deductions; computers use systematic search.

### Key Strategies
1. **Naked singles:** Only one digit possible in a cell
2. **Hidden singles:** A digit can only go in one cell in a row/col/box
3. **Naked pairs/triples:** Elimination by shared candidates
4. **Backtracking:** For hard puzzles, guess and verify

### Dry Run
```
Given: Row 1 has 1,2,3,4,5,6,7,8,_
       Column 9 has 1,2,3,4,5,6,7,8,_
       Box contains 1,2,3,4,5,6,7,8,_
→ Missing digit = 9 → Place 9 ✓
```

---

## 35. Josephus Problem

### Problem Statement
**N people** stand in a circle. Every **k-th person** is eliminated until one remains. Find the survivor's position.

### Intuition
Recursive structure: after the first elimination, the problem reduces to (N-1) people.

### Solution (k=2 case)
**J(n) = 2L + 1**, where n = 2^m + L, 0 ≤ L < 2^m

For **n=10**: 10 = 8 + 2 → L=2 → J(10) = 2×2+1 = **5**

General recursive formula:
- J(1) = 1
- J(n) = (J(n-1) + k - 1) mod n + 1

### Dry Run (N=6, k=2)
Circle: 1,2,3,4,5,6  
Eliminate: 2,4,6,3,1 → **Survivor: 5** ✓  
Formula: 6 = 4 + 2, L=2 → 2×2+1 = 5 ✓

---

## 36. Minimum Cuts to Divide Cake

### Problem Statement
What is the minimum number of straight cuts needed to divide a circular cake into **8 equal pieces**?

### Intuition
With 3 cuts (stacking), 8 pieces are possible!

### Solution
- **Mathematically (flat cuts only):** 3 cuts through center → 6 pieces; you need **4 cuts** for 8 pieces with flat cuts arranged differently... 
- **With stacking:** Cut cake in half, stack, cut again, stack, cut again → **3 cuts = 8 pieces** ✓
- **Without stacking:** Minimum is **3 cuts** (3 diameter cuts at 60° angles = 6 pieces or at 45° = 8 pieces) — 3 cuts through the center at equal angles gives **6 pieces**, so you need **3 cuts** specifically at 45° apart = **8 pieces** ✓

**Answer: 3 cuts** (each cut through the center at 45° apart)

### Dry Run
- Cut 1: vertical → 2 pieces
- Cut 2: horizontal → 4 pieces  
- Cut 3: diagonal → 8 pieces ✓

---

## 37. Ants on a Triangle Problem

### Problem Statement
3 ants sit on the corners of an equilateral triangle. Each randomly picks a direction (CW or CCW) and walks. What is the probability that **no two ants collide**?

### Intuition
Collision is avoided only when all ants walk in the **same direction** (all CW or all CCW).

### Solution
Total outcomes: 2³ = 8 (each ant chooses CW or CCW)  
Safe outcomes: all CW (1) + all CCW (1) = 2  
**P(no collision) = 2/8 = 1/4**

### Dry Run
All possibilities: CCC, CCW, CWC, CWW, WCC, WCW, WWC, WWW (C=CW, W=CCW)  
Collision-free: CCC, WWW → 2 outcomes  
P = **2/8 = 1/4 = 25%** ✓

---

## 38. Handshake Problem

### Problem Statement
In a room of **n people**, everyone shakes hands with everyone else exactly once. How many handshakes occur?

### Intuition
Each handshake involves 2 people. Count pairs.

### Solution
Number of ways to choose 2 people from n:  
**C(n, 2) = n(n-1)/2**

For n=10: 10×9/2 = **45 handshakes**

### Dry Run
n=5: Person 1 shakes 4 hands; Person 2 shakes 3 more; Person 3 shakes 2 more; Person 4 shakes 1 more; Person 5 shakes 0 more.  
Total: 4+3+2+1+0 = **10** = 5×4/2 = 10 ✓

---

## 39. Sock Drawer Color Matching

### Problem Statement
A drawer has **10 red socks, 10 blue socks, 10 green socks** (30 total). You draw socks randomly in the dark. How many do you need to draw to **guarantee** a matching pair?

### Intuition
Worst case: you could draw one of each color (3 socks) before getting a pair. The 4th draw must match one of the 3 colors you already have.

### Solution
There are 3 colors. In the worst case, the first 3 draws give one of each color. The **4th sock must match one of them**.

**Answer: 4 socks**

### Dry Run
- Draw 1: Red
- Draw 2: Blue
- Draw 3: Green
- Draw 4: Must be Red, Blue, or Green → **guaranteed match** ✓

---

## 40. Poisonous Wine with Test Strips

*(Variant of Puzzle #6 — Poisoned Bottle)*

### Problem Statement
1000 bottles of wine, one is poisoned. You have 10 lab test strips. Each strip can test multiple samples simultaneously. Result in 1 hour. Identify the poisoned bottle.

### Solution
Binary encoding — identical to the Poisoned Bottle puzzle:  
- 2^10 = 1024 ≥ 1000
- Number bottles 1–1000 in binary
- Strip i tests all bottles with bit i = 1
- Positive strips form binary number = poisoned bottle

*(Full dry run in Puzzle #6)*

---

## 41. Calendar Day Calculation Puzzle

### Problem Statement
What day of the week was **January 1, 2000**? (Or: given a date, find the day)

### Intuition
Use **Zeller's congruence** or the **Doomsday algorithm** to compute day of week from any date.

### Solution (Doomsday Algorithm)
Key insight: Certain "anchor" dates always fall on the same day (the "doomsday") for a given year.

**For 2000:** Doomsday = Saturday  
Anchor dates: 4/4, 6/6, 8/8, 10/10, 12/12, and 5/9, 9/5, 7/11, 11/7 → all fall on Saturday  
Jan 1, 2000: Days from Jan 3 (doomsday-ish) = count back...  
January 4 = Saturday (known anchor for non-leap year Jan is 3rd)  
Jan 1 = Sat - 3 = **Saturday** ✓

### Dry Run
2000 is a leap year. Jan 4 = Saturday. Jan 1 = Saturday - 3 = **Saturday** ✓

---

## 42. Manhole Cover Puzzle

### Problem Statement
Why are **manhole covers round**?

### Intuition
This is a classic geometry/engineering interview question. Think about when a shape can fall into its own hole.

### Solution
A round cover **cannot fall through** a round hole of the same size — because a circle has the same diameter in every direction (it's a **curve of constant width**).

A square cover, tilted diagonally, has a diagonal ~1.41× its side — it could fall through if tilted.

**Other reasons:** Easier to roll/move, no need to align when replacing, handles stress more uniformly, standard manufacturing.

### Dry Run
- Square hole (1m×1m): diagonal = √2 ≈ 1.41m. A 1m square cover tilted at 45° fits through → **dangerous!**
- Circle hole (1m diameter): any orientation of a 1m circular cover cannot pass through → **safe** ✓

---

## 43. Island Weighing Puzzle

### Problem Statement
You're on an island with 3 boxes: one has apples, one has oranges, one has mixed. All labels are **wrong**. You may take **one fruit** from one box. Correctly label all three boxes.

### Intuition
Since ALL labels are wrong, the box labeled "Mixed" cannot be mixed. It must be apples or oranges. One sample tells you everything.

### Solution
1. Pick one fruit from the box labeled **"Mixed"** (it's not mixed)
2. If you get an **apple** → that box is "Apples"
3. Now the box labeled "Apples" isn't apples → it's either oranges or mixed
4. But "Oranges" box is also wrong → deduce by elimination

### Dry Run
- Box labels: [Apple], [Orange], [Mixed]
- Pick from [Mixed] → get Orange → [Mixed] box = Oranges
- [Apple] box ≠ Apples, ≠ Oranges (taken) → [Apple] box = Mixed
- [Orange] box = Apples (only one left) ✓

---

## 44. Plane Fuel Transfer Puzzle

### Problem Statement
A plane must fly **around the world** (circumference = 1 unit). It can carry **1/2 unit of fuel** and can transfer fuel mid-air. All planes are identical. Minimum planes needed to get **one plane around the world**?

### Intuition
Planes can refuel each other from fuel caches along the route. By symmetry, use planes from both directions.

### Solution
With **3 planes** total (including the circumnavigator):  
- Two support planes fuel the main plane to the 1/4 mark, then return
- Repeat from the other side for the last quarter
- **Minimum: 3 planes**

### Dry Run
- Main plane + Plane 2 + Plane 3 start together
- At 1/8 mark: Plane 3 refuels Plane 2 and Main → returns (has 1/4 fuel left for trip back from 1/8)
- At 1/4 mark: Plane 2 tops off Main → returns
- Main flies solo through the middle
- Mirror scenario from other side: two planes meet Main at 3/4 mark ✓

---

## 45. Rope Around Earth Puzzle

### Problem Statement
A rope is tied tightly around the Earth's equator (~40,000 km). You add **1 meter** to the rope's length and distribute the slack uniformly. How high above the ground does the rope float?

### Intuition
Counter-intuitively, the answer doesn't depend on the Earth's size!

### Solution
- Original: C = 2πR → R = C/2π
- New: C + 1 = 2π(R + h) → R + h = (C+1)/2π
- Subtracting: h = 1/(2π) ≈ **0.159 meters ≈ 16 cm**

The answer is always **~16 cm**, regardless of the size of the sphere!

### Dry Run
- h = Δlength / (2π) = 1 / (2 × 3.14159) = 1/6.283 ≈ **0.159m = 15.9 cm** ✓
- If you added 1m to a rope around a tennis ball: still 16 cm gap!

---

## 46. Light Bulb Toggle Puzzle

### Problem Statement
100 bulbs in a row, all off. 100 students walk by. Student k toggles every k-th bulb (Student 1 toggles all, Student 2 toggles every 2nd, ...). Which bulbs are on at the end?

### Intuition
A bulb is toggled once for each divisor of its number. A bulb ends ON if it's toggled an **odd number** of times → if it has an **odd number of divisors** → only **perfect squares** (divisors pair up, except the square root).

### Solution
Bulbs that are ON: **perfect squares from 1 to 100**  
→ Bulbs **1, 4, 9, 16, 25, 36, 49, 64, 81, 100** (10 bulbs)

### Dry Run
- Bulb 12: divisors = 1,2,3,4,6,12 → 6 (even) toggles → **OFF**
- Bulb 16: divisors = 1,2,4,8,16 → 5 (odd) toggles → **ON** ✓
- Bulb 36: divisors = 1,2,3,4,6,9,12,18,36 → 9 (odd) toggles → **ON** ✓

---

## 47. 25 Horses / 5 Tracks — Find the 3 Fastest

### Problem Statement
You have **25 horses** and a track that can race **5 horses** at a time. No stopwatch. Find the **3 fastest horses** in the minimum number of races.

### Intuition
Use tournament-style elimination, then a smart final race.

### Solution
**Minimum: 7 races**

1. Race 1–5: Race all horses in 5 groups of 5. (5 races)
2. Race 6: Race the **5 group winners** → determines overall 1st place (the winner) and ranks the groups.
3. Race 7: Take **top 2 from group-winner's group** + **top 2 from 2nd-place group** + **1st from 3rd-place group** (5 horses total). The top 2 finishers here complete the top 3 overall.

**Total: 7 races**

### Dry Run
- Races 1–5: Winners are W1,W2,W3,W4,W5
- Race 6: Say W1 wins, W2 is 2nd, W3 is 3rd → W4, W5 eliminated; also 4th/5th from W1's group and lower groups eliminated
- Race 7: {W1's 2nd, W1's 3rd, W2, W2's 2nd, W3} → top 2 join W1 as the 3 fastest ✓

---

## 48. Coin Change Logic Puzzle

### Problem Statement
You need to make change for any amount from **1 to 99 cents** using the fewest coins. What is the minimum number of coins needed to make any value, and what denominations suffice?

### Intuition
Use a greedy approach with coins: 1, 5, 10, 25 (standard US coins). At most 1 quarter, 2 dimes, 1 nickel, 4 pennies = 9 coins needed for worst case (e.g., 99 cents).

### Solution
99 cents: 3 quarters + 2 dimes + 4 pennies = **9 coins** (but 3Q+2D+0N+4P)  
Actually: 25+25+25+10+10+1+1+1+1 = 99 ✓ → **9 coins max**

To guarantee coverage of 1–99¢: use denominations {1, 5, 10, 25} with counts {4, 1, 2, 3} = **10 coins** carry all change.

### Dry Run
- 99¢: 75+20+4 = 3×25¢ + 2×10¢ + 4×1¢ = 9 coins
- 94¢: 75+10+9 = 3×25¢ + 1×10¢ + 1×5¢ - no wait: 75+10+5+4×1 = 9 coins
- **Worst case: 9 coins for 99¢** ✓

---

## 49. Rectangle Cutting Puzzle

### Problem Statement
A rectangle has a small rectangular piece cut out from its interior (not touching any edge). With **one straight cut**, can you divide the remaining piece into **two equal areas**?

### Intuition
Any line through the **center of both rectangles** bisects each rectangle equally. Since the two centers may differ, find one line through both.

### Solution
**Yes!** Any line that passes through the **centers of both the large and small rectangles** will divide both rectangles into equal halves, thus dividing the remaining (donut-shaped) area into two equal parts.

- Each rectangle is bisected by any line through its center
- A line through both centers bisects both simultaneously

### Dry Run
- Large rectangle center: (5, 5); Small (cut-out) center: (6, 7)
- Draw line through (5,5) and (6,7)
- This line bisects large rectangle area → two halves of 50 each
- This line bisects cut-out area → removes equal area from each half
- Net result: two **equal areas** ✓

---

## 50. Escape from Jail Logic Puzzle

### Problem Statement
A prisoner faces 3 doors. **Door 1:** leads to a 3-year tunnel. **Door 2:** leads to a 5-year tunnel (both tunnels loop back). **Door 3:** leads to freedom. The prisoner has no memory after exiting a tunnel. What is the expected number of years to escape?

### Intuition
Each attempt is independent (no memory). Set up an equation for expected time E.

### Solution
Let E = expected years to escape.  
Each attempt: 1/3 chance of each door.  

E = (1/3)(3 + E) + (1/3)(5 + E) + (1/3)(0)  
E = 1 + E/3 + 5/3 + E/3  
E = 8/3 + 2E/3  
E - 2E/3 = 8/3  
E/3 = 8/3  
**E = 8 years**

### Dry Run
- If always picking Door 3 by luck (prob 1/3): expects 3 tries
- Each try: avg cost = (1/3)(3) + (1/3)(5) + (1/3)(0) = 1 + 5/3 = 8/3 years per attempt
- Geometric series: expected attempts = 3; 3 × 8/3 = ... actually use the formula:
- E = (door1 year)(1/3) + E·(1/3) + (door2 year)(1/3) + E·(1/3) + 0·(1/3) → **E = 8** ✓

---

*End of 50 Classic Logic & Math Puzzles*