# SSE Interview Questions & Reference Platform

This repository is a comprehensive, system-design-grade reference platform for Senior Software Engineer (SSE) interview preparation. It features in-depth notes on algorithms, data structures, backend engineering, distributed systems, and AI, alongside interactive quizzes.

The project is built as a modern static site using **Astro.js**, providing excellent performance and a sleek dark-themed UI.

## 🚀 Getting Started

### Prerequisites
- Node.js (18.x or higher)
- npm or yarn
- Python 3.x (optional, for running data extraction scripts)

### Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### Running Locally
To start the local development server:
```bash
npm run dev
```
The site will be available at `http://localhost:4322` (or whichever port Astro allocates).

### Building for Production
To generate a production-ready static site:
```bash
npm run build
```
This compiles the site into the `dist/` folder.

To preview the built site locally:
```bash
npm run preview
```

---

## 📂 Project Structure

- **`src/`**: Contains the Astro components, layouts, pages, and UI styles.
- **`public/`**: Static assets including images and the single source of truth for markdown notes (`public/notes/`).
- **`data/`**: Stores data files. For example, `data/csv/` holds raw question and study plan data.
- **`scripts/`**: Utility scripts (Python and Node.js) used to extract Q&A from markdown files, format markdown, or generate study plans.
- **`docs/`**: Historical migration documentation and legacy notes.
- **`dsa-questions-data/` & `questions-data/`**: Extracted JSON files representing the core data for interactive study elements, populated by the scripts.

---

## 🛠️ Utility Scripts

The `scripts/` directory contains tools to generate JSON data from the Markdown notes. These scripts are especially useful when you've updated the markdown files in `public/notes/` and want to sync those changes to the interactive site elements.

### Extracting Q&A from Markdown
If you modify the markdown files, you can re-extract the interactive Q&A components into JSON:
```bash
# Extract Data Structures and Algorithms questions
python scripts/extract_dsa_questions.py

# Extract System Design, API, and general engineering questions
python scripts/extract_questions.py
```

### Generating the Study Plan
To generate the `study_plan.csv` from the base `questions.csv`:
```bash
node scripts/generate_plan.js
# OR
python scripts/generate_plan.py
```

---

## 📝 Editing Content

To add or modify notes:
1. Navigate to `public/notes/`.
2. Edit or create new Markdown files.
3. If your changes contain structured Q&A (e.g., lines starting with `### ` for questions), run the corresponding extraction scripts (see above) to update the JSON data.
4. The web application will immediately reflect these changes on reload.