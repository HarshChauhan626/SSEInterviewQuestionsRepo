# SSE Interview Questions - Astro Version

This is an Astro.js conversion of the SSE Interview Questions repository. Astro provides a modern, performant static site generation framework ideal for documentation and content-heavy sites.

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

## Building

To build the project for production:

```bash
npm run build
```

This generates a static site in the `dist/` folder, ready for deployment.

## Preview

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
├── src/
│   ├── layouts/
│   │   └── Layout.astro       # Main layout component
│   ├── pages/
│   │   ├── index.astro        # Home page
│   │   ├── topics.astro       # Topics listing
│   │   ├── about.astro        # About page
│   │   └── 404.astro          # 404 page
│   └── styles/
│       └── globals.css         # Global styles with Tailwind
├── astro.config.mjs           # Astro configuration
├── tailwind.config.mjs        # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies
```

## Features

- **Astro 4.x** - Fast, modern static site generation
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Responsive Design** - Mobile-friendly layouts
- **Type Safety** - Full TypeScript support
- **Zero JavaScript** by default - Fast, lightweight sites

## Deployment

The generated static site can be deployed to any static hosting platform:

- **Vercel** (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any web server

## Adding Interview Questions

To integrate the existing interview questions data:

1. Create a data directory: `src/data/`
2. Copy JSON files from `dsa-questions-data/` and `questions-data/` directories
3. Create topic pages that fetch and display this data
4. Consider using Astro's `getStaticPaths()` for generating dynamic pages

## Contributing

Feel free to submit issues and enhancement requests!

## License

See the original repository for licensing information.

## Related Documentation

- [Astro Docs](https://docs.astro.build)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Astro Integrations](https://astro.build/integrations/)
