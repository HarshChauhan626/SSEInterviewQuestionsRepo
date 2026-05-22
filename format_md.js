const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    
    const sections = [];
    let currentSection = null;
    const preamble = [];
    
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        
        if (line.startsWith('## ')) {
            currentSection = { title: line, questions: [] };
            sections.append = sections.push(currentSection);
            i++;
            continue;
        }
        
        if (line.startsWith('### ')) {
            const qTitle = line;
            const qBody = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('### ') && !lines[i].startsWith('## ')) {
                qBody.push(lines[i]);
                i++;
            }
            
            while (qBody.length > 0 && qBody[qBody.length - 1].trim() === '') {
                qBody.pop();
            }
            
            if (currentSection === null) {
                currentSection = { title: '## General', questions: [] };
                sections.push(currentSection);
            }
            
            currentSection.questions.push({
                title: qTitle,
                body: qBody.join('\n')
            });
            continue;
        }
        
        if (currentSection === null) {
            preamble.push(line);
        }
        i++;
    }

    const mustKnowKeywords = [
        "event loop", "architecture", "libuv", "v8", "concurrency", "blocking",
        "callback hell", "promises", "async/await", "microtasks", "macrotasks",
        "settimeout and setimmediate", "process.nexttick", "thread pool", "worker threads",
        "child processes", "spawn, exec", "module.exports", "commonjs and es modules",
        "synchronous and asynchronous", "readfile and createreadstream", "streams",
        "backpressure", "buffers", "eventemitter", "memory leak", "garbage collection",
        "closures", "stack and heap", "clustering", "cluster and worker threads",
        "cpu-bound", "middleware", "graceful shutdown", "package.json", "handle async errors",
        "unhandledpromiserejection", "single-threaded", "internally", "fast", "when should you use",
        "when should you not use", "promise.all", "difference between promise.all",
        "module caching", "piping", "difference between buffer", "difference between emit",
        "process.env", "__dirname", "uncaught exceptions", "try-catch limitation",
        "optimize node.js", "streams memory efficient", "not ideal for cpu",
        "difference between tcp and udp", "large concurrent connections", "difference between require"
    ];
    
    const mustKnowQs = [];
    const goodToKnowQs = [];
    
    for (const sec of sections) {
        for (const q of sec.questions) {
            const titleLower = q.title.toLowerCase();
            let isMustKnow = false;
            
            for (const kw of mustKnowKeywords) {
                if (titleLower.includes(kw)) {
                    isMustKnow = true;
                    break;
                }
            }
            
            if (titleLower.includes("what is node.js") || 
                titleLower.includes("what is asynchronous programming") || 
                titleLower.includes("what are callbacks") || 
                titleLower.includes("difference between promise and async/await") || 
                titleLower.includes("execution order") || 
                titleLower.includes("what are streams") || 
                titleLower.includes("types of streams") || 
                titleLower.includes("what is backpressure")) {
                isMustKnow = true;
            }

            q.urgency = isMustKnow ? "Must Know" : "Good to Know";
            q.score = isMustKnow ? 2 : 1;
            
            // Remove existing urgency if any
            q.title = q.title.replace(/\s*\((Must Know|Good to Know)\)\s*$/i, '');
            // Clean up numbering
            q.cleanTitle = q.title.replace(/^### \d+\.\s*/, '');
            
            if (q.score === 2) {
                mustKnowQs.push(q);
            } else {
                goodToKnowQs.push(q);
            }
        }
    }

    const outLines = [];
    outLines.push(...preamble);
    
    let counter = 1;
    
    outLines.push("## 🚀 Top Interview Questions (Must Know)\n");
    for (const q of mustKnowQs) {
        outLines.push(`### ${counter}. ${q.cleanTitle} (Must Know)`);
        outLines.push(q.body);
        outLines.push("\n---\n");
        counter++;
    }
        
    outLines.push("## 💡 Additional Concepts (Good to Know)\n");
    for (const q of goodToKnowQs) {
        outLines.push(`### ${counter}. ${q.cleanTitle} (Good to Know)`);
        outLines.push(q.body);
        outLines.push("\n---\n");
        counter++;
    }
    
    fs.writeFileSync(filepath, outLines.join('\n'), 'utf8');
    console.log("Processed successfully.");
}

processFile('d:/DSA/nodejs.md');
