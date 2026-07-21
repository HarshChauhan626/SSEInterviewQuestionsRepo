#!/usr/bin/env python3
import os
import re
import json
import random

# Set random seed for reproducibility
random.seed(42)

GO_PROJECTS_DIR = "d:/Projects/GolangProjects/GolangProjects"
OUTPUT_DIR = "d:/Projects/SSEInterviewQuestionsRepo/SSEInterviewQuestionsRepo/golang-project"
os.makedirs(OUTPUT_DIR, exist_ok=True)

TOPIC_MAPPING = {
    "01_basic_syntax": "Basic Syntax & Types",
    "02_goroutines": "Goroutines & WaitGroups",
    "03_channels_unbuffered": "Unbuffered Channels",
    "04_channels_buffered": "Buffered Channels",
    "05_select_multiplexing": "Select Multiplexing",
    "06_worker_pool": "Worker Pools",
    "07_producer_consumer": "Producer-Consumer",
    "08_fan_out": "Fan-Out Pattern",
    "09_fan_in": "Fan-In Pattern",
    "10_pipeline": "Pipeline Pattern",
    "11_concurrent_api_calls": "Concurrent API Calls",
    "12_context_cancellation": "Context Cancellation",
    "13_context_timeout": "Context Timeout",
    "14_graceful_shutdown": "Graceful Shutdown",
    "15_semaphore": "Semaphore Pattern",
    "16_rate_limiter": "Rate Limiting",
    "17_batch_processor": "Batch Processing",
    "18_retry_mechanism": "Retry Mechanism",
    "19_circuit_breaker": "Circuit Breaker",
    "20_concurrent_task_queue": "Concurrent Task Queue",
    "21_event_bus": "Event Bus",
    "22_pubsub": "Pub/Sub Pattern",
    "23_future_promise": "Future/Promise Pattern",
    "24_safe_counter": "Safe Counter (Mutex)",
    "25_concurrent_map": "Concurrent Map",
    "26_lru_cache": "LRU Cache",
    "27_cache_aside": "Cache-Aside Pattern",
    "28_repository_pattern": "Repository Pattern",
    "29_generic_cache": "Generic Cache",
    "30_middleware_chain": "Middleware Chain",
    "31_jwt_auth": "JWT Authentication",
    "32_crud_rest_api": "CRUD REST API",
    "33_api_rate_limit": "API Rate Limiting",
    "34_panic_recovery": "Panic & Recovery",
    "35_url_shortener": "URL Shortener",
    "36_workerpool_dlq_gracefulshutdown": "Worker Pool with DLQ"
}

BLANKABLE_TOKENS = {
    # Concurrency & Channels
    "go": 3, "chan": 3, "select": 3, "defer": 3, "close": 3, "range": 3, "make": 2,
    "WaitGroup": 3, "Mutex": 3, "Lock": 3, "Unlock": 3, "Done": 3, "Add": 3, "Wait": 3,
    "Sleep": 3, "Context": 3, "Background": 3, "WithCancel": 3, "WithTimeout": 3,
    "<-": 3, "...": 3,
    # Basic structures & keywords
    "interface": 2, "struct": 2, "return": 1, "panic": 3, "recover": 3, "iota": 2,
    "switch": 2, "case": 2, "default": 2, "type": 2, "func": 1, "var": 1, "const": 1,
    "map": 2, "nil": 1, ":=": 2
}

def extract_blocks_from_file(filepath):
    """
    Extracts Go code blocks (functions, types, methods) using brace matching.
    Returns a list of dicts: {"code": str, "description": str, "title": str}
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    blocks = []
    in_block = False
    block_lines = []
    brace_count = 0
    comment_lines = []
    block_title = ""
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # If we see structural separators or headers, skip comment gathering
        if "====" in line or "----" in line:
            comment_lines = []
            i += 1
            continue
            
        # Collect preceding doc comments
        if stripped.startswith("//") and not in_block:
            comment_lines.append(stripped)
            i += 1
            continue
            
        # Detect start of function, struct, or interface
        is_func = stripped.startswith("func ")
        is_type = stripped.startswith("type ") and ("struct" in stripped or "interface" in stripped)
        
        if (is_func or is_type) and not in_block:
            in_block = True
            block_lines = [line]
            
            # Find block title
            if is_func:
                # E.g. func VariadicSum(nums ...int) int {
                # E.g. func (bl *BufferLogger) Log(message string) {
                match_func = re.search(r'func\s+(?:\([^)]+\)\s+)?([a-zA-Z0-9_]+)\b', stripped)
                block_title = match_func.group(1) if match_func else "Function"
            elif is_type:
                # E.g. type Shape interface {
                # E.g. type Circle struct {
                match_type = re.search(r'type\s+([a-zA-Z0-9_]+)\b', stripped)
                block_title = match_type.group(1) if match_type else "Type"
                
            brace_count = line.count('{') - line.count('}')
            if brace_count == 0 and block_lines:
                # Completed on single line
                blocks.append({
                    "raw_code": "\n".join(block_lines),
                    "comments": comment_lines,
                    "title": block_title
                })
                in_block = False
                block_lines = []
                comment_lines = []
            i += 1
            continue
            
        if in_block:
            block_lines.append(line)
            # Count braces ignoring strings and inline comments
            clean_line = re.sub(r'//.*$', '', line)
            clean_line = re.sub(r'"[^"]*"', '', clean_line)
            clean_line = re.sub(r'`[^`]*`', '', clean_line)
            brace_count += clean_line.count('{') - clean_line.count('}')
            
            if brace_count <= 0:
                blocks.append({
                    "raw_code": "\n".join(block_lines),
                    "comments": comment_lines,
                    "title": block_title
                })
                in_block = False
                block_lines = []
                comment_lines = []
            i += 1
        else:
            # Clear comment buffer if we hit non-blank non-comment non-start line
            if stripped != "" and not stripped.startswith("//"):
                comment_lines = []
            i += 1
            
    processed_blocks = []
    for b in blocks:
        raw_code = b["raw_code"]
        comments = b["comments"]
        title = b["title"]
        
        # Clean comments to form a description
        clean_desc_parts = []
        for c in comments:
            clean_c = c.lstrip('/').strip()
            # Remove leading numbers like "31. " or "1. "
            clean_c = re.sub(r'^\d+\.\s*', '', clean_c)
            if clean_c:
                clean_desc_parts.append(clean_c)
        description = " ".join(clean_desc_parts)
        if not description:
            description = f"Practice code block: {title}"
            
        processed_blocks.append({
            "code": raw_code,
            "description": description,
            "title": title
        })
        
    return processed_blocks

def find_blank_candidates(code):
    """
    Finds all tokens in code that are blankable.
    Returns list of tuple: (start_index, end_index, value)
    """
    token_pattern = re.compile(
        r'(?P<comment>//.*?$|/\*.*?\*/)'
        r'|(?P<string>"[^"]*"|`[^`]*`|\'[^\']*\')'
        r'|(?P<operator><-|:=|\.\.\.)'
        r'|(?P<word>\b[a-zA-Z_][a-zA-Z0-9_]*\b)',
        re.MULTILINE | re.DOTALL
    )
    
    candidates = []
    for match in token_pattern.finditer(code):
        group_dict = match.groupdict()
        val = match.group(0)
        start, end = match.span()
        
        if group_dict.get('word') and val in BLANKABLE_TOKENS:
            candidates.append((start, end, val))
        elif group_dict.get('operator') and val in BLANKABLE_TOKENS:
            candidates.append((start, end, val))
            
    return candidates

def choose_blanks(candidates, code, max_blanks=3):
    """
    Selects up to max_blanks non-overlapping and spaced-out blank candidate positions.
    Prefers higher priority scores.
    """
    if not candidates:
        return []
        
    # Sort candidates by token priority (highest score first)
    candidates_sorted = sorted(candidates, key=lambda c: BLANKABLE_TOKENS.get(c[2], 1), reverse=True)
    
    selected = []
    for c in candidates_sorted:
        if len(selected) >= max_blanks:
            break
            
        c_start, c_end, c_val = c
        # Ensure no overlap and sufficient spacing (at least 4 chars away from existing blanks)
        overlap = False
        for s in selected:
            s_start, s_end, _ = s
            # Check proximity
            if not (c_end + 4 <= s_start or c_start >= s_end + 4):
                overlap = True
                break
        if not overlap:
            selected.append(c)
            
    # Sort selected blanks by start index ascending for easy replacement mapping
    return sorted(selected, key=lambda x: x[0])

def generate_challenges():
    all_challenges = []
    challenge_id_counter = 1
    
    # Sort folders to process deterministically
    folders = sorted(os.listdir(GO_PROJECTS_DIR))
    
    for folder in folders:
        folder_path = os.path.join(GO_PROJECTS_DIR, folder)
        if not os.path.isdir(folder_path) or folder.startswith("."):
            continue
            
        category = TOPIC_MAPPING.get(folder, folder.replace("_", " ").title())
        
        # Traverse Go files in folder
        files = sorted(os.listdir(folder_path))
        for file in files:
            if not file.endswith(".go") or file.endswith("_test.go"):
                continue
                
            filepath = os.path.join(folder_path, file)
            blocks = extract_blocks_from_file(filepath)
            
            for b in blocks:
                code = b["code"]
                title = b["title"]
                description = b["description"]
                
                # Exclude trivial or very short blocks
                if len(code.split('\n')) < 3:
                    continue
                # Exclude main function from being trivial if it has nothing
                if title == "main" and len(code.split('\n')) < 5:
                    continue
                    
                candidates = find_blank_candidates(code)
                if not candidates:
                    continue
                    
                # We can allow up to 4 blanks for longer blocks, and 2-3 for shorter ones
                max_blanks = 4 if len(code.split('\n')) > 15 else 3
                chosen = choose_blanks(candidates, code, max_blanks)
                
                if not chosen:
                    continue
                    
                # Replace candidates from end to start to maintain indices
                template_code = code
                blanks_list = []
                
                # Replace in reverse order so character offsets do not shift
                for idx, (start, end, val) in enumerate(reversed(chosen)):
                    blank_idx = len(chosen) - 1 - idx
                    template_code = template_code[:start] + f"[[blank{blank_idx}]]" + template_code[end:]
                    blanks_list.insert(0, val)
                    
                challenge = {
                    "id": f"go_blank_{challenge_id_counter:03d}",
                    "category": category,
                    "folder": folder,
                    "file": file,
                    "title": title,
                    "description": description,
                    "code_template": template_code,
                    "blanks": blanks_list,
                    "full_code": code
                }
                all_challenges.append(challenge)
                challenge_id_counter += 1
                
    # Write to file
    output_filepath = os.path.join(OUTPUT_DIR, "go-challenges.json")
    with open(output_filepath, 'w', encoding='utf-8') as out_f:
        json.dump(all_challenges, out_f, indent=2)
        
    print(f"Successfully generated {len(all_challenges)} challenges in {output_filepath}")

if __name__ == "__main__":
    generate_challenges()
