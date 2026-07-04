const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'systemdesignterminology.md');
const refHtmlPath = path.join(__dirname, 'systemdesign.html');
const outHtmlPath = path.join(__dirname, 'systemdesignterminology.html');

// Read files
const mdContent = fs.readFileSync(mdPath, 'utf8');
const refHtmlContent = fs.readFileSync(refHtmlPath, 'utf8');

// Extract CSS block
const styleMatch = refHtmlContent.match(/<style>[\s\S]*?<\/style>/);
const cssBlock = styleMatch ? styleMatch[0] : '<style></style>';

// Image mapping
const imageMap = {
    1: "DistributedSystems.png",
    2: "ScalabilityConcepts.png",
    3: "LoadBalancing.png",
    4: "Reliability&Resilience.png",
    5: "DatabaseFundamentals.png",
    6: "DatabaseScalingAndManagement.png",
    7: "StorageSystems.png",
    8: "SQLConcepts.png",
    9: "NoSQLConcepts.png",
    10: "CachingConcepts.png",
    11: "EventQueueConcepts.png",
    12: "EventDrivenConcepts.png",
    13: "MicorservicesConcepts.png",
    14: "APIDesignConcepts.png",
    15: "SecurityConcepts.png",
    16: "ObservabilityConcepts.png",
    17: "KubernetesConcepts.png",
    18: "CDNNetworkingConcepts.png",
    19: "SearchSystemConcepts.png",
    20: "ArchitecturePatternConcepts.png",
    21: "MetricsConcepts.png"
};

// Parse MD
const lines = mdContent.split('\n');
const categories = [];
let currentCategory = null;

const sectionRegex = /^## (\d+)\. (.*)/;
const termRegex = /^- \*\*(.*?)\*\*\s*[—:-]\s*(.*)/;

for (let line of lines) {
    line = line.trim();
    
    const secMatch = line.match(sectionRegex);
    if (secMatch) {
        const id = parseInt(secMatch[1], 10);
        const name = secMatch[2].trim();
        
        currentCategory = {
            id,
            name,
            terms: [],
            img: imageMap[id] ? `images/systemdesignterminology/${imageMap[id]}` : null
        };
        categories.push(currentCategory);
        continue;
    }
    
    const termMatch = line.match(termRegex);
    if (termMatch && currentCategory) {
        currentCategory.terms.push({
            name: termMatch[1].trim(),
            desc: termMatch[2].trim()
        });
    }
}

// Generate HTML
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>System Design Terminology — Dev Notes</title>
    <meta name="description" content="A comprehensive glossary of system design terms, categorized and mapped with diagrams.">
    ${cssBlock}
    <style>
        .term-card {
            background: var(--bg-card);
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 18px 20px;
            margin-bottom: 16px;
        }
        .term-name {
            font-family: var(--mono);
            font-size: 14px;
            color: var(--accent);
            margin-bottom: 8px;
            font-weight: bold;
        }
        .term-desc {
            font-size: 13.5px;
            color: var(--text-dim);
            line-height: 1.65;
        }
        .img-loader {
            position: absolute;
            width: 32px;
            height: 32px;
            border: 3px solid rgba(0,0,0,0.1);
            border-top: 3px solid var(--accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>

    <header class="topbar">
        <div class="topbar-inner">
            <div class="brand"><span class="dot">&gt;</span> Dev Notes</div>
            <nav>
                <a href="systemdesign.html">Systems</a>
                <a href="#">Terminology</a>
            </nav>
        </div>
    </header>

    <div class="hero" style="padding-bottom: 20px;">
        <div class="eyebrow">system design · glossary</div>
        <h1>System Design <em>Terminology</em></h1>
        <p>A comprehensive reference guide for core system design concepts, from distributed systems to observability.</p>
    </div>

    <div class="shell">
        <aside class="sidebar">
            <div class="picker" id="picker">
                <!-- picker items injected via JS -->
            </div>
        </aside>
        
        <main class="main-content">
            <div class="panel" id="panel">
                <!-- content injected via JS -->
            </div>
        </main>
    </div>

    <footer>
        <p>System Design Terminology Reference.</p>
    </footer>

    <script>
        const categories = ${JSON.stringify(categories, null, 2)};
        
        const picker = document.getElementById('picker');
        const panel = document.getElementById('panel');
        
        function init() {
            let pickerHtml = '<div class="picker-label">Categories</div>';
            categories.forEach(c => {
                pickerHtml += \`
                    <div class="item" data-id="\${c.id}">
                        <div class="num">\${c.id < 10 ? '0' + c.id : c.id}</div>
                        <div>
                            <span class="name">\${c.name}</span>
                            <span class="tag">\${c.terms.length} terms</span>
                        </div>
                    </div>\`;
            });
            picker.innerHTML = pickerHtml;
            
            picker.querySelectorAll('.item').forEach(el => {
                el.addEventListener('click', () => loadCategory(parseInt(el.dataset.id, 10)));
            });
            
            if(categories.length > 0) {
                loadCategory(categories[0].id);
            }
        }
        
        function loadCategory(id) {
            document.querySelectorAll('.item').forEach(el => el.classList.remove('active'));
            document.querySelector(\`.item[data-id="\${id}"]\`)?.classList.add('active');
            
            const cat = categories.find(c => c.id === id);
            if(!cat) return;
            
            let html = \`
                <div class="panel-head">
                    <h2>\${cat.name}</h2>
                    <span class="like">\${cat.terms.length} Definitions</span>
                </div>
            \`;
            
            if (cat.img) {
                html += \`
                    <div class="diagram-wrap" style="position: relative; min-height: 250px; display: flex; align-items: center; justify-content: center;">
                        <div class="img-loader"></div>
                        <img src="\${cat.img}" alt="\${cat.name} concepts" loading="lazy" onload="this.previousElementSibling.style.display='none'" style="position: relative; z-index: 1; min-height: 250px;">
                    </div>
                \`;
            }
            
            html += \`<div>\`;
            cat.terms.forEach(term => {
                html += \`
                    <div class="term-card">
                        <div class="term-name">\${term.name}</div>
                        <div class="term-desc">\${term.desc}</div>
                    </div>
                \`;
            });
            html += \`</div>\`;
            
            panel.innerHTML = html;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
`;

fs.writeFileSync(outHtmlPath, htmlTemplate);
console.log('Successfully created systemdesignterminology.html');
