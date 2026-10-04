import type { ImageMetadata } from 'astro';

/**
 * Every image under src/assets, keyed by the path used in projects.ts
 * (e.g. "/assets/gitea-eks/argocd-ui.png"). Going through src/ rather than
 * public/ means Astro resizes them and emits AVIF/WebP at build time.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/**/*.{png,PNG,jpg,jpeg,webp,avif}',
  { eager: true }
);

const registry = new Map<string, ImageMetadata>(
  Object.entries(modules).map(([path, mod]) => [path.replace('../assets', '/assets'), mod.default])
);

export function image(key: string): ImageMetadata {
  const found = registry.get(key);
  if (!found) {
    throw new Error(
      `Unknown image "${key}". Available: ${[...registry.keys()].join(', ')}`
    );
  }
  return found;
}
