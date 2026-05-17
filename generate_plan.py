import csv
import random

questions = []
with open('d:/DSA/questions.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        questions.append(row)

easies = [q for q in questions if q['Difficulty Level'].strip() == 'Easy']
mediums = [q for q in questions if q['Difficulty Level'].strip() == 'Medium']
hards = [q for q in questions if q['Difficulty Level'].strip() == 'Hard']

# Shuffle each category for randomness
random.seed(42)  # For good measure, though not strictly required
random.shuffle(easies)
random.shuffle(mediums)
random.shuffle(hards)

with open('d:/DSA/study_plan.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['Day', 'Pattern', 'Difficulty Level', 'Problem Name'])
    
    day = 1
    while easies or mediums or hards:
        daily_q = []
        
        # We aim for a balanced daily diet: 2 Easy, 6 Medium, 2 Hard
        for _ in range(2):
            if easies: daily_q.append(easies.pop())
        for _ in range(6):
            if mediums: daily_q.append(mediums.pop())
        for _ in range(2):
            if hards: daily_q.append(hards.pop())
            
        # If we didn't reach 10 (because we ran out of a specific difficulty), 
        # fill the rest of the 10 spots with whatever is remaining.
        while len(daily_q) < 10 and (easies or mediums or hards):
            if mediums: daily_q.append(mediums.pop())
            elif easies: daily_q.append(easies.pop())
            elif hards: daily_q.append(hards.pop())
            
        # Shuffle within the day so it's not always in the exact same difficulty order
        random.shuffle(daily_q)
        
        for q in daily_q:
            writer.writerow([f'Day {day}', q['Pattern'], q['Difficulty Level'], q['Problem Name']])
        
        day += 1

print("Successfully generated d:/DSA/study_plan.csv")
