#!/usr/bin/env python3
"""
extract_questions.py
Parses all non-DSA markdown files and extracts Q&As into structured JSON files
in the questions-data/ directory.

Strategy:
  Split each file on '---' horizontal rule separators. Each chunk between two
  '---' lines is ONE Q&A entry. The first heading in the chunk is the question
  title; everything after that heading is the answer. Chunks with no valid
  question heading (TOC, section labels, part markers, etc.) are skipped.
"""

import re
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, "questions-data")
os.makedirs(OUT_DIR, exist_ok=True)

# ──────────────────────────────────────────────
# File definitions: (filename, topic_label, description, icon, accent)
# ──────────────────────────────────────────────
FILES = [
    ("agenticai.md",                       "Agentic AI",              "Autonomous agents, multi-agent systems, tool calling & LLM orchestration",  "🤖", "#a78bfa"),
    ("architecturalpatterns.md",           "Architecture Patterns",    "Clean, Hexagonal, Repository, CQRS, Event Sourcing and more",               "🏗️", "#6c8cff"),
    ("databases.md",                       "Databases",                "PostgreSQL, MySQL, indexing, transactions, sharding, and DB internals",      "🗄️", "#22d3a6"),
    ("distributedsystems.md",              "Distributed Systems",      "Consistency, CAP theorem, consensus, replication, and distributed design",   "🌐", "#f97316"),
    ("dotnet.md",                          ".NET / C#",               "C# fundamentals, ASP.NET, async/await, LINQ, and .NET internals",            "🔷", "#60a5fa"),
    ("golang.md",                          "Golang",                   "Go language fundamentals, goroutines, channels, interfaces, and idioms",     "🐹", "#34d399"),
    ("golangcodequestions.md",             "Go Code Questions",        "Hands-on Go coding challenges and code-reading questions",                   "💻", "#10b981"),
    ("kafka.md",                           "Kafka",                    "Kafka fundamentals, partitions, consumers, producers, and delivery guarantees","📨", "#f59e0b"),
    ("kubernetes.md",                      "Kubernetes",               "Pods, deployments, services, networking, storage, and K8s internals",        "☸️", "#38bdf8"),
    ("networkingessentials.md",            "Networking",               "TCP/IP, HTTP, DNS, TLS, CDN, load balancing, and network protocols",         "🔌", "#fb7185"),
    ("nodejs.md",                          "Node.js",                  "Event loop, V8, streams, modules, async patterns, and Node internals",       "🟢", "#84cc16"),
    ("observability.md",                   "Observability",            "Logging, metrics, tracing, OpenTelemetry, alerting, and incident response",  "📊", "#c084fc"),
    ("postgresql.md",                      "PostgreSQL",               "PostgreSQL internals, indexing, MVCC, query planning, and performance",      "🐘", "#60a5fa"),
    ("react.md",                           "React / Next.js",          "React hooks, state management, rendering, Next.js, and Redux",               "⚛️", "#38bdf8"),
    ("securityrelatedtopics.md",           "Security",                 "Auth, OAuth2, JWT, RBAC, API security, secrets management, and more",        "🔐", "#f87171"),
    ("systemdesigneventdrivenetc.md",      "System Design: Events",    "Event-driven systems, microservices, messaging patterns, and reliability",   "⚡", "#fbbf24"),
    ("systemdesigninterviewdesigncheatsheet.md", "System Design: Cheatsheet", "System design interview frameworks, patterns, and cheatsheet reference","📋", "#f97316"),
    ("systemdesignterminology.md",         "System Design: Terms",     "Core system design vocabulary and terminology explained in depth",            "📖", "#e879f9"),
    ("websocket.md",                       "WebSockets",               "WebSocket protocol, scaling, security, reliability, and system design",      "🔄", "#67e8f9"),
    ("a2arag.md",                          "A2A & RAG",                "Agent-to-Agent communication and Retrieval Augmented Generation patterns",   "🔗", "#a78bfa"),
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
    # e.g. "A2A Basics", "Consumer Internals", "Producer Internals"
    if re.match(r'^\w[\w\s]{0,25}$', text) and not text.endswith('?') and not re.search(r'\d', text):
        words = text.split()
        if len(words) <= 3:
            return True
    return False


def clean_heading_text(heading_line):
    """Strip markdown heading hashes and leading Q/number prefixes from a heading line."""
    # Remove heading hashes (e.g. "## ", "### ")
    text = re.sub(r'^#{1,6}\s+', '', heading_line).strip()
    # Remove leading numbering: "Q13.", "1.", "1.2.", "1.2 ", "Q13. " etc.
    text = re.sub(r'^Q?\d+(\.\d+)*[\.\):\s]+\s*', '', text).strip()
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

        questions.append({
            "id": len(questions) + 1,
            "question": question_text,
            "answer": answer,
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
    print("Extracting Q&As from non-DSA markdown files...\n")
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
            "file": f"questions-data/{out_name}",
            "topic": topic,
            "description": description,
            "icon": icon,
            "accent": accent,
            "count": len(data["questions"])
        })
        print(f"    Written to questions-data/{out_name}")

    index_path = os.path.join(OUT_DIR, "index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    print(f"\nDone! {len(index)} topic files + index.json written to questions-data/")
    total = sum(item["count"] for item in index)
    print(f"Total questions extracted: {total}")


if __name__ == "__main__":
    main()


