import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split the document by lines
    lines = content.split('\n')
    
    # We want to extract sections (## ) and questions (### )
    
    sections = [] # list of dicts: {'title': '...', 'questions': []}
    current_section = None
    
    preamble = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith('## '):
            current_section = {'title': line, 'questions': []}
            sections.append(current_section)
            i += 1
            continue
            
        if line.startswith('### '):
            # Start of a new question
            q_title = line
            q_body = []
            i += 1
            while i < len(lines) and not lines[i].startswith('### ') and not lines[i].startswith('## '):
                q_body.append(lines[i])
                i += 1
            
            # Clean up trailing empty lines in q_body
            while q_body and q_body[-1].strip() == '':
                q_body.pop()
                
            if current_section is None:
                # If there are questions before any ## header, create a default one
                current_section = {'title': '## General', 'questions': []}
                sections.append(current_section)
                
            current_section['questions'].append({
                'title': q_title,
                'body': '\n'.join(q_body)
            })
            continue
            
        if current_section is None:
            preamble.append(line)
        i += 1

    # Heuristics for Must Know
    must_know_keywords = [
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
    ]
    
    # Process each question
    for sec in sections:
        for q in sec['questions']:
            title_lower = q['title'].lower()
            is_must_know = False
            for kw in must_know_keywords:
                if kw in title_lower:
                    is_must_know = True
                    break
            
            # Additional logic
            if "what is node.js" in title_lower or "what is asynchronous programming" in title_lower or "what are callbacks" in title_lower or "difference between promise and async/await" in title_lower or "execution order" in title_lower or "what are streams" in title_lower or "types of streams" in title_lower or "what is backpressure" in title_lower:
                is_must_know = True

            q['urgency'] = "Must Know" if is_must_know else "Good to Know"
            q['score'] = 2 if is_must_know else 1
            
            # Remove any existing (Urgency) just in case
            q['title'] = re.sub(r'\s*\((Must Know|Good to Know)\)\s*$', '', q['title'])
            # Clean up the numbering "### 1. " -> "What is Node.js?"
            q['clean_title'] = re.sub(r'^### \d+\.\s*', '', q['title'])

    # The prompt says: "Arrangement should on basis of most asked questions in interview"
    # To truly respect this, maybe we should flatten the questions and sort them globally?
    # Let's create two sections: Must Know (Top Interview Questions) and Good to Know
    
    must_know_qs = []
    good_to_know_qs = []
    
    for sec in sections:
        for q in sec['questions']:
            if q['score'] == 2:
                must_know_qs.append(q)
            else:
                good_to_know_qs.append(q)

    # Output file generation
    out_lines = []
    out_lines.extend(preamble)
    
    counter = 1
    
    out_lines.append("## 🚀 Top Interview Questions (Must Know)\n")
    for q in must_know_qs:
        out_lines.append(f"### {counter}. {q['clean_title']} (Must Know)")
        out_lines.append(q['body'])
        out_lines.append("\n---\n")
        counter += 1
        
    out_lines.append("## 💡 Additional Concepts (Good to Know)\n")
    for q in good_to_know_qs:
        out_lines.append(f"### {counter}. {q['clean_title']} (Good to Know)")
        out_lines.append(q['body'])
        out_lines.append("\n---\n")
        counter += 1
        
    # Remove the last "\n---\n" if we want, or just leave it
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out_lines))

if __name__ == '__main__':
    process_file('d:/DSA/nodejs.md')
