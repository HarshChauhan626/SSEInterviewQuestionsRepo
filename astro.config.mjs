import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
  // Allow importing JSON from data directories at build time
  vite: {
    ssr: {
      external: ['node-fetch']
    },
    // Ensure large files are handled
    build: {
      chunkSizeWarningLimit: 2000
    }
  }
});
