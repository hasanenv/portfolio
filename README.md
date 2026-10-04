# hasanenv.co.uk

Personal portfolio site. Astro and Tailwind, hosted on S3 behind CloudFront,
provisioned with Terraform and deployed by GitHub Actions over OIDC.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve the built output
```

## Structure

```
portfolio/
├── .github/workflows/deploy.yml   # build, sync to S3, invalidate CloudFront
├── infra/                         # Terraform, see infra/README.md
│   ├── bootstrap/                 # state bucket (run once, local state)
│   ├── functions/router.js        # CloudFront Function: index rewrite + www redirect
│   ├── main.tf                    # S3 origin, CloudFront, ACM, security headers
│   ├── iam-github.tf              # OIDC provider and deploy role
│   ├── variables.tf
│   └── outputs.tf
├── src/
│   ├── assets/                    # diagrams and screenshots (optimised at build)
│   ├── components/
│   │   ├── HeroGraph.astro        # animated node/edge canvas
│   │   ├── Nav.astro
│   │   ├── ProjectRow.astro
│   │   └── Footer.astro
│   ├── data/
│   │   ├── projects.ts            # all case-study content
│   │   ├── site.ts                # name, contact, skills, certifications
│   │   └── images.ts              # maps asset paths to optimised images
│   ├── layouts/Base.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   └── projects/[slug].astro  # one page per project, generated from data
│   └── styles/global.css          # design tokens and component classes
└── public/                        # favicon, robots.txt, CV, headshot
```

## Editing content

Almost everything lives in two files:

- **`src/data/site.ts`**: name, role, contact details, skills groups,
  certifications, nav.
- **`src/data/projects.ts`**: the featured case studies and the secondary
  repository list. Adding a project means adding one object; the case-study page
  and the homepage row are generated from it.

Images go in `src/assets/<project>/` and are referenced by the path
`/assets/<project>/<file>`. Astro resizes them and emits WebP at build time.
Files in `public/` are served as-is without optimisation.

## Accessibility and motion

- All animation is gated behind `prefers-reduced-motion`. With it set, the hero
  canvas renders one static frame and scroll reveals are disabled.
- Scroll reveals start at `opacity: 0`, so a `<noscript>` block forces them
  visible if JavaScript fails.
- Keyboard: skip link to main content, visible focus rings, the mobile menu
  closes on Escape.
