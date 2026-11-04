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
  vite: {
    plugins: [tailwindcss()],
    // Never inline a script into the HTML. The CSP served by CloudFront is
    // script-src 'self', which refuses inline scripts outright, and a refused
    // script is not the same as a disabled one: the noscript fallback does not
    // fire, so the page renders blank below the hero. Separate files keep the
    // policy free of hashes and of 'unsafe-inline'.
    build: { assetsInlineLimit: 0 },
  },
});
