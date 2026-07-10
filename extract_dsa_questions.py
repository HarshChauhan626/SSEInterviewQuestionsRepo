#!/usr/bin/env python3
"""
extract_dsa_questions.py
Parses all DSA & Puzzle markdown files and extracts Q&As into structured JSON files
in the dsa-questions-data/ directory.
"""

import re
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, "dsa-questions-data")
os.makedirs(OUT_DIR, exist_ok=True)

# ──────────────────────────────────────────────
# File definitions: (filename, topic_label, description, icon, accent)
# ──────────────────────────────────────────────
FILES = [
    ("dsaeasytomedium.md",                  "DSA: Easy to Medium",      "Core array, string, and common easy-to-medium interview problems",           "📊", "#10b981"),
    ("backtracking.md",                     "DSA: Backtracking",        "N-Queens, combinations, permutations, and subsets",                          "🔄", "#f59e0b"),
    ("binarysearch.md",                     "DSA: Binary Search",       "Monotonic functions, search boundaries, and rotated arrays",                 "🔍", "#3b82f6"),
    ("bitmanipulation.md",                  "DSA: Bit Manipulation",    "Bitwise operators, masks, and binary trickery",                              "🔢", "#14b8a6"),
    ("disjoinset.md",                       "DSA: Disjoint Set",        "Union-Find, connectivity, and cycle detection",                             "🕸️", "#ec4899"),
    ("dp.md",                               "DSA: Dynamic Programming", "Memoization, tabulation, knapsack, and sequence alignment",                  "📈", "#8b5cf6"),
    ("graph.md",                            "DSA: Graphs",              "BFS, DFS, Dijkstra, topological sort, and cycles",                           "🌿", "#10b981"),
    ("greedy.md",                           "DSA: Greedy",              "Interval scheduling, local optimization, and Huffman coding",                "🍕", "#f59e0b"),
    ("heap.md",                             "DSA: Heap",                "Priority queues, top K elements, and running median",                        "🥞", "#ef4444"),
    ("intervals.md",                        "DSA: Intervals",           "Merging, inserting, and scheduling overlapping intervals",                   "📅", "#f97316"),
    ("linkedlist.md",                       "DSA: Linked List",         "Pointers, reversals, cycle detection, and merging",                          "🔗", "#06b6d4"),
    ("monotonicstack.md",                   "DSA: Monotonic Stack",     "Next greater element, histogram areas, and boundary analysis",               "🥞", "#6366f1"),
    ("prefixsum.md",                        "DSA: Prefix Sum",          "Cumulative sums, range query optimization, and subarray matches",            "➕", "#84cc16"),
    ("queue.md",                            "DSA: Queue & Stack",       "FIFO and LIFO behaviors, custom implementations, and deque patterns",        "📥", "#ec4899"),
    ("recursion.md",                        "DSA: Recursion",           "Divide and conquer, call stack execution, and tree traversals",              "🌀", "#14b8a6"),
    ("slidingwindow.md",                    "DSA: Sliding Window",      "Fixed and variable window sizes, subarray constraints, and two-pointer tracking", "🪟", "#06b6d4"),
    ("strings.md",                          "DSA: Strings",             "String manipulation, pattern matching, palindromes, and parsing",            "🔤", "#3b82f6"),
    ("trees.md",                            "DSA: Trees",               "BST properties, node traversals, depth, and structural queries",             "🌳", "#10b981"),
    ("trie.md",                             "DSA: Trie",                "Prefix trees, autocomplete design, and dictionary searches",                 "🌲", "#8b5cf6"),
    ("twopointer.md",                       "DSA: Two Pointers",        "Fast/slow pointers, left/right boundaries, and sorted array searches",        "👉", "#f97316"),
    ("puzzles.md",                          "Logic Puzzles",            "50 Classic Logic & Math Puzzles for engineering interviews",                 "🧩", "#fb923c")
]

# Patterns that mark a heading as a structural section label — NOT a question.
# These chunks get skipped entirely.
SKIP_HEADING_PATTERNS = [
    r'^(Table of Contents|TOC)\b',
    r'^(PART|Part)\s+\d+',
    r'^(Chapter|Section|Appendix)\b',
    r'^(Bonus|Advanced|Summary|Overview|Introduction|Conclusion|Preface|Foreword)\b',
    r'^(Basics|Practical|Internals|Fundamentals|Questions|Production Questions)\s*$',
]

def is_skip_heading(text):
    """Return True if this heading text is a structural label, not a Q&A title."""
    text = text.strip()
    if not text:
        return True
    for pat in SKIP_HEADING_PATTERNS:
        if re.match(pat, text, re.IGNORECASE):
            return True
    # Single-word headings (e.g. "Fundamentals", "Rebalancing") are section titles
    if re.match(r'^\w+\s*$', text):
        return True
    # Two-word headings with no ? or number tend to be section labels too
    if re.match(r'^\w[\w\s]{0,25}$', text) and not text.endswith('?') and not re.search(r'\d', text):
        words = text.split()
        if len(words) <= 3:
            return True
    return False


def clean_heading_text(heading_line):
    """Strip markdown heading hashes and leading Q/number prefixes from a heading line."""
    # Remove heading hashes (e.g. "## ", "### ")
    text = re.sub(r'^#{1,6}\s+', '', heading_line).strip()
    # Remove "Problem \d+" prefix with optional punctuation/whitespace (e.g. "Problem 1 — ", "Problem 1: ")
    text = re.sub(r'^Problem\s+\d+\s*[\.\:—\-–\s]*\s*', '', text, flags=re.IGNORECASE).strip()
    # Remove leading numbering: "Q13.", "1.", "1.2.", "1.2 ", "Q13. " etc.
    text = re.sub(r'^Q?\d+(\.\d+)*[\.\):\s\-–—]+\s*', '', text).strip()
    # Clean stray bold/italic asterisks from heading text
    text = re.sub(r'\*{1,3}([^*]*)\*{1,3}', r'\1', text).strip()
    return text


def clean_answer(text):
    """Strip leading/trailing whitespace and collapse excessive blank lines."""
    lines = text.split("\n")
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    out = []
    blank_count = 0
    for line in lines:
        if line.strip() == "":
            blank_count += 1
            if blank_count <= 2:
                out.append(line)
        else:
            blank_count = 0
            out.append(line)
    return "\n".join(out)


def parse_chunk_into_nodes(chunk_body):
    """
    Parses the Q&A chunk body (everything after the main problem title)
    into structured nodes: problem, intuition, code, test_cases.
    """
    import re
    lines = chunk_body.split('\n')
    sections = []
    current_title = None
    current_lines = []
    
    for line in lines:
        stripped = line.strip()
        bold_match = re.match(r'^\*\*(.+?)\*\*:?\s*$', stripped)
        
        if stripped.startswith('###') or bold_match:
            if current_title or current_lines:
                sections.append((current_title, '\n'.join(current_lines).strip()))
            if bold_match:
                current_title = bold_match.group(1).strip()
            else:
                current_title = stripped.replace('###', '').strip()
            current_lines = []
        else:
            current_lines.append(line)
    if current_title or current_lines:
        sections.append((current_title, '\n'.join(current_lines).strip()))
        
    nodes = {
        "problem": "",
        "intuition": "",
        "code": "",
        "test_cases": ""
    }
    
    for title, content in sections:
        if not title:
            nodes["problem"] = (nodes["problem"] + "\n\n" + content).strip()
            continue
            
        title_lower = title.lower()
        if "problem" in title_lower or "statement" in title_lower:
            nodes["problem"] = (nodes["problem"] + "\n\n" + content).strip()
        elif any(k in title_lower for k in ["intuition", "why", "recurrence", "tree", "approach", "concept"]):
            header_text = f"**{title}**\n" if "intuition" not in title_lower else ""
            nodes["intuition"] = (nodes["intuition"] + f"\n\n{header_text}{content}").strip()
        elif any(k in title_lower for k in ["code", "solution", "pseudocode", "pseudo"]):
            nodes["code"] = (nodes["code"] + "\n\n" + content).strip()
        elif any(k in title_lower for k in ["test", "complexity", "example", "dry run"]):
            header_text = f"**{title}**\n" if "test case" not in title_lower else ""
            nodes["test_cases"] = (nodes["test_cases"] + f"\n\n{header_text}{content}").strip()
        else:
            nodes["intuition"] = (nodes["intuition"] + f"\n\n**{title}**\n{content}").strip()
            
    # Post-process: extract any stray code blocks from problem or intuition
    code_block_pattern = re.compile(
        r'(```(?:java|python|cpp|c\+\+|c|js|javascript|go|ts|typescript|ruby|php|swift|rust|kotlin)[ \t]*\n.*?\n```)',
        re.DOTALL | re.IGNORECASE
    )
    for key in ["problem", "intuition"]:
        blocks = code_block_pattern.findall(nodes[key])
        for block in blocks:
            nodes["code"] = (nodes["code"] + f"\n\n{block}").strip()
            nodes[key] = nodes[key].replace(block, "").strip()
            
    return nodes


def split_on_separator(content):
    """Split markdown content on '---' horizontal rule lines.
    Returns list of text chunks between separators."""
    content = content.replace("\r\n", "\n").replace("\r", "\n")
    sep_re = re.compile(r'^\s*-{3,}\s*$', re.MULTILINE)
    return sep_re.split(content)


HEADING_RE = re.compile(r'^(#{2,6})\s+(.+)$')


def first_heading_in_chunk(chunk):
    """Return (level_str, raw_heading_line, heading_text) for the first
    non-h1 heading found in chunk, skipping lines inside code fences."""
    in_code = False
    for line in chunk.split("\n"):
        stripped = line.strip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code = not in_code
            continue
        if in_code:
            continue
        m = HEADING_RE.match(line)
        if m:
            level = m.group(1)   # e.g. '##', '###'
            text = m.group(2).strip()
            return (level, line, text)
    return None


def body_after_first_heading(chunk):
    """Return all text in chunk that comes after the first heading line."""
    in_code = False
    found = False
    body_lines = []
    for line in chunk.split("\n"):
        if not found:
            stripped = line.strip()
            if stripped.startswith("```") or stripped.startswith("~~~"):
                in_code = not in_code
            if not in_code and HEADING_RE.match(line):
                found = True
                continue  # skip the heading itself
        else:
            body_lines.append(line)
    return "\n".join(body_lines)


def extract_questions_from_md(filepath):
    """Parse a markdown file and extract Q&A pairs using --- separators."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    chunks = split_on_separator(content)
    questions = []

    for chunk in chunks:
        chunk_stripped = chunk.strip()
        if not chunk_stripped:
            continue

        result = first_heading_in_chunk(chunk_stripped)
        if result is None:
            continue

        level, heading_line, raw_text = result

        # Enforce that for DSA and logic puzzles, a valid question heading must
        # start with a number/digit or "Problem <number>" to skip structural elements.
        if not re.match(r'^(?:Problem\s+)?\d+', raw_text.strip(), re.IGNORECASE):
            continue

        # Skip structural section headings
        if is_skip_heading(raw_text):
            continue

        question_text = clean_heading_text(heading_line)
        if not question_text:
            continue

        answer_raw = body_after_first_heading(chunk_stripped)
        answer = clean_answer(answer_raw)

        # Skip chunks with no real answer content
        if not answer or answer.strip() in ("---", ""):
            continue
        if re.match(r'^[-=\s]+$', answer.strip()):
            continue
            
        nodes = parse_chunk_into_nodes(answer)

        questions.append({
            "id": len(questions) + 1,
            "question": question_text,
            "problem": nodes["problem"],
            "intuition": nodes["intuition"],
            "code": nodes["code"],
            "test_cases": nodes["test_cases"],
            "images": []
        })

    return questions


def build_json_for_file(md_filename, topic, description, icon, accent):
    filepath = os.path.join(BASE_DIR, md_filename)
    if not os.path.exists(filepath):
        print(f"  WARNING: File not found: {md_filename}")
        return None

    print(f"  Parsing {md_filename}...")
    questions = extract_questions_from_md(filepath)

    if md_filename == "dsaeasytomedium.md":
        pseudo_filepath = os.path.join(BASE_DIR, "dsaeasytomedium_pseudocode.md")
        if os.path.exists(pseudo_filepath):
            pseudo_qs = extract_questions_from_md(pseudo_filepath)
            for i in range(min(len(questions), len(pseudo_qs))):
                pseudo_nodes = [pseudo_qs[i]["problem"], pseudo_qs[i]["intuition"], pseudo_qs[i]["code"], pseudo_qs[i]["test_cases"]]
                pseudo_content = "\n".join(filter(bool, pseudo_nodes)).strip()
                if pseudo_content:
                    questions[i]["code"] = (questions[i]["code"] + "\n\n### Pseudocode\n" + pseudo_content).strip()

    print(f"    -> {len(questions)} questions extracted")

    return {
        "topic": topic,
        "description": description,
        "icon": icon,
        "accent": accent,
        "source": md_filename,
        "questions": questions
    }


def main():
    print("Extracting Q&As from DSA & Puzzle markdown files...\n")
    index = []

    for entry in FILES:
        md_filename, topic, description, icon, accent = entry
        data = build_json_for_file(md_filename, topic, description, icon, accent)
        if data is None:
            continue

        out_name = md_filename.replace(".md", ".json")
        out_path = os.path.join(OUT_DIR, out_name)

        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        index.append({
            "file": f"dsa-questions-data/{out_name}",
            "topic": topic,
            "description": description,
            "icon": icon,
            "accent": accent,
            "count": len(data["questions"])
        })
        print(f"    Written to dsa-questions-data/{out_name}")

    index_path = os.path.join(OUT_DIR, "index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    print(f"\nDone! {len(index)} topic files + index.json written to dsa-questions-data/")
    total = sum(item["count"] for item in index)
    print(f"Total questions extracted: {total}")


if __name__ == "__main__":
    main()
