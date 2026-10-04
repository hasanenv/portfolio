// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hasanenv.co.uk',
  integrations: [sitemap()],
  // Local-only overlay; it never ships in a build. Off because it obscures
  // the bottom of the page while reviewing.
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto' },
  vite: { plugins: [tailwindcss()] },
});
