// The CloudFront response headers policy serves script-src 'self' and
// font-src 'self'. Anything the build inlines into the page breaks both:
// an inline <script> is refused at runtime, and a refused script is not a
// disabled one, so the <noscript> fallback never fires and the page renders
// blank below the hero with nothing in the build log to show for it. A font
// inlined as a data: URI is refused the same way and falls back to a system
// face. Fail here instead of finding out in production.
//
// The build inlines a bundle or an asset when it is small enough. Keeping
// vite.build.assetsInlineLimit at 0 stops it.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist';

// Script types the browser never executes. CSP leaves these alone.
const dataBlock = /type\s*=\s*["']?(application\/(ld\+json|json)|text\/template)/i;

function* filesWithin(dir, extension) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* filesWithin(path, extension);
    else if (path.endsWith(extension)) yield path;
  }
}

const offenders = [];
let checked = 0;

for (const file of filesWithin(root, '.html')) {
  checked += 1;
  for (const tag of readFileSync(file, 'utf8').match(/<script\b[^>]*>/gi) ?? []) {
    if (/\bsrc\s*=/i.test(tag) || dataBlock.test(tag)) continue;
    offenders.push(`${file}  inline <script>, refused by script-src 'self'`);
  }
}

for (const file of filesWithin(root, '.css')) {
  checked += 1;
  const count = (readFileSync(file, 'utf8').match(/url\(["']?data:font/gi) ?? []).length;
  if (count > 0) {
    offenders.push(`${file}  ${count} data: font(s), refused by font-src 'self'`);
  }
}

if (offenders.length > 0) {
  console.error('Build output contradicts the CSP served by CloudFront:\n');
  for (const offender of offenders) console.error(`  ${offender}`);
  console.error('\nSet vite.build.assetsInlineLimit to 0 in astro.config.mjs.');
  process.exit(1);
}

console.log(`Build output matches the CSP. Checked ${checked} files.`);
