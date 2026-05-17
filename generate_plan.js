const fs = require('fs');

const content = fs.readFileSync('d:/DSA/questions.csv', 'utf-8');
const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

// skip header
const questions = lines.slice(1).map(line => {
    // split by comma, keeping the rest of the string if it contains commas
    const parts = line.split(',');
    const pattern = parts[0];
    const diff = parts[1];
    const name = parts.slice(2).join(',');
    return { pattern, diff, name };
});

const easies = questions.filter(q => q.diff === 'Easy');
const mediums = questions.filter(q => q.diff === 'Medium');
const hards = questions.filter(q => q.diff === 'Hard');

// Fisher-Yates shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

shuffle(easies);
shuffle(mediums);
shuffle(hards);

let csvOutput = 'Day,Pattern,Difficulty Level,Problem Name\n';
let day = 1;

while (easies.length > 0 || mediums.length > 0 || hards.length > 0) {
    let daily_q = [];
    
    for (let i = 0; i < 2; i++) {
        if (easies.length) daily_q.push(easies.pop());
    }
    for (let i = 0; i < 6; i++) {
        if (mediums.length) daily_q.push(mediums.pop());
    }
    for (let i = 0; i < 2; i++) {
        if (hards.length) daily_q.push(hards.pop());
    }
    
    while (daily_q.length < 10 && (easies.length || mediums.length || hards.length)) {
        if (mediums.length) daily_q.push(mediums.pop());
        else if (easies.length) daily_q.push(easies.pop());
        else if (hards.length) daily_q.push(hards.pop());
    }
    
    shuffle(daily_q);
    
    for (const q of daily_q) {
        csvOutput += `Day ${day},${q.pattern},${q.diff},${q.name}\n`;
    }
    day++;
}

fs.writeFileSync('d:/DSA/study_plan.csv', csvOutput);
console.log('Successfully generated d:/DSA/study_plan.csv');
