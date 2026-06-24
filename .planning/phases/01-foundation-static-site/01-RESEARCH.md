# Phase 1: Foundation & Static Site - Research

**Researched:** 2026-06-24
**Domain:** Astro 7 static site, Content Collections, @fontsource, Vercel deployment, noindex gating
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Shows — build the shows collection schema now with sample/draft entries (the draft's 4 placeholder shows). Real dates/cities/venues/ticket URLs are deferred to Phase 4. Do NOT block Phase 1 on band-supplied show data.
- **D-02:** Streaming links are all confirmed real — use real URLs for Яндекс Музыка, VK Music, Apple Music, Spotify, YouTube. Order: Яндекс Музыка and VK Music first, then Spotify, Apple Music, YouTube. Yandex/VK Music real URLs to be supplied by the user (not present in draft markup).
- **D-03:** Unconfirmed items keep draft's current values for the demo so layout looks full. Carry as Phase 4 verification items: ticket URLs (#), VK community + Instagram footer links (#), contact email (hello@brusnika.ru is draft value). Track every placeholder so Phase 4 catches all.
- **D-04:** Audio UI — port draft's demo behavior verbatim (~30 lines of vanilla JS: clicking «слушать» shows fake sticky now-playing bar). Intentionally throwaway, replaced by real audio island in Phase 2. Keep isolated.
- **D-05:** Booking flow — «записаться»/«пойте с нами» opens lessons modal; form submit shows fake «Спасибо!» success state. Real Telegram delivery replaces submit handler in Phase 3. Keep isolated.
- **D-06:** Animations (FND-03) — scroll-reveal (IntersectionObserver) + cursor-follow glow (guarded by `pointer:fine`) ship as ONE small global vanilla-JS client script, not Astro islands. Behavior identical to draft.
- **D-07:** Data scope — Content Collections for tracks, shows, gallery AND streaming links and social/footer links as data. Section prose (about, hero, «пойте с нами» copy) stays inline in components.
- **D-08:** Singletons — store one-of-a-kind content (featured album, hero/about copy where data-driven, lessons info) in a single typed site-data file (e.g. `src/data/site.ts`); use collections only for the lists.
- **D-09:** Forward-compatible track schema — include optional/empty media fields (audioUrl, duration) in the track collection schema so Phase 2 is pure data-fill, no migration.
- **D-10:** Styling — translate draft's 100% inline styles into central design tokens (CSS custom properties for palette #000/#f3a9bd/#f2f0ee and fonts Prata/Golos Text) in a global stylesheet, plus per-component scoped `<style>`. Result must be pixel-identical to the draft.
- **D-11:** Images — use Astro's built-in image optimization (`<Image>`/`<Picture>`, WebP/AVIF, `srcset`) for the `images/` assets. Lazy-load below-fold gallery images.
- **noindex:** env-gated NOINDEX → robots meta + X-Robots-Tag header (Vercel adapter).

### Claude's Discretion

- Exact file/component breakdown, collection schema field names, token naming, and where the global stylesheet lives — planner/researcher decide following Astro conventions.
- How noindex is implemented in detail is already locked by prior decisions (env-gated `NOINDEX` → robots meta + `X-Robots-Tag`); see canonical refs.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope. (Real audio/video/lightbox/share/booking-delivery are already scoped to Phases 2–3 by the roadmap, not new ideas.)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FND-01 | Site rebuilt in Astro, visual design preserved (dark theme, pink #f3a9bd, Prata + Golos Text, all sections and layout) | Astro 7 scaffolding, D-10 CSS token migration, pixel-identical rebuild of all 9 sections from index.html |
| FND-02 | Fonts (Prata, Golos Text) self-hosted — no Google Fonts dependency | @fontsource/prata (Cyrillic supported) and @fontsource/golos-text (Cyrillic supported) — both verified on npm |
| FND-03 | Scroll-reveal and cursor-follow glow from draft are preserved | D-06: one global vanilla-JS script, verbatim port of the 75-line IIFE from index.html |
| FND-04 | Layout responsive, matches draft on mobile and desktop | CSS media query breakpoints ported from draft; Astro adds no layout opinions |
| FND-05 | Content (tracks, shows, gallery) modeled as Astro Content Collections | Content Layer API: src/content.config.ts with glob loader + zod schema; getCollection() in components |
| FND-06 | Site deployed to Vercel | @astrojs/vercel@11.0.0 adapter; `npm create astro@latest` scaffold + `vercel deploy` |
| FND-07 | Search indexing disabled via env-gated noindex, toggleable without code changes | NOINDEX env var → `import.meta.env.NOINDEX` inlined at build; `<meta name="robots">` in Layout head; Vercel auto-adds X-Robots-Tag on preview deployments |
| SHOW-01 | Upcoming shows listed with date, city, and venue | shows Content Collection with sample data from draft (4 entries: Москва, СПб, Казань, Екатеринбург) |
| SHOW-02 | Each show links to a working ticket page | Ticket URL field in shows schema; placeholder `#` values per D-03, wired in Phase 4 |
| LINK-01 | Streaming links wired to real URLs, Yandex/VK first | streamingLinks array in src/data/site.ts; Spotify + YouTube real URLs in draft; Yandex/VK URLs user-supplied |
| LINK-02 | Footer social/contact links wired to real URLs | socialLinks array in src/data/site.ts; Telegram real URL in draft; VK/Instagram placeholder per D-03 |
</phase_requirements>

---

## Summary

Phase 1 rebuilds the existing 467-line `index.html` draft as a real Astro 7 site with zero visual change — every pixel of the dark dream-pop aesthetic (black background, pink accent #f3a9bd, Prata serif headings, Golos Text body) is preserved. The project is greenfield: no Astro project exists yet. The build process is: scaffold Astro 7 into the existing repo, migrate all nine sections from inline-style HTML into scoped Astro components with central CSS custom-property tokens, move images to `src/assets/images/` for Astro `<Image>` optimization, define Content Collections for tracks/shows/gallery, and deploy to Vercel with env-gated noindex.

The two demo JS behaviors (fake now-playing bar + lessons modal) are ported verbatim as a single global client script — intentionally throwaway scaffolding for Phase 2/3 to replace. Self-hosted fonts from `@fontsource/prata` and `@fontsource/golos-text` eliminate the Google Fonts dependency that would be throttled for Russian users. Both packages include Cyrillic subsets, which is confirmed.

The key structural decision for the planner: images currently live at repo root in `images/` and must move to `src/assets/images/` to be processed by Astro `<Image>`. This is the only material transformation beyond HTML-to-.astro migration. Everything else is a faithful transcription.

**Primary recommendation:** Scaffold with `npm create astro@latest` (empty template, TypeScript, no sample pages) into the existing repo, then migrate section-by-section from `index.html`, commit after each section deploys cleanly to Vercel preview.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| All page sections (hero, marquee, album, tracks, about, shows, gallery, sing, footer) | Static HTML (Astro prerendered) | — | Pure markup; no server data needed; prerendered at build time |
| Design tokens + global CSS | Static asset | — | CSS custom properties in a global stylesheet, referenced by all scoped component styles |
| Content data (tracks, shows, gallery, links) | Build-time Content Collections | src/data/site.ts for singletons | Read at build time; no runtime dependency |
| Font serving | Static asset (CDN) | — | @fontsource woff2 files bundled into Astro build; served as static assets by Vercel CDN |
| Image optimization | Astro build-time transform | Vercel CDN | Astro Sharp transforms source images; resulting WebP/AVIF served from Vercel CDN |
| Scroll-reveal + cursor glow animations | Browser (vanilla JS) | — | D-06: one global inline script; runs client-side, no server involvement |
| Demo: fake now-playing bar | Browser (vanilla JS) | — | D-04: throwaway IIFE, client-side only; isolated for Phase 2 swap |
| Demo: lessons modal | Browser (vanilla JS) | — | D-05: throwaway IIFE, client-side only; isolated for Phase 3 swap |
| Noindex gating | Build-time (env var inlining) + Vercel CDN | — | `import.meta.env.NOINDEX` read at build; static HTML rendered with or without meta tag; Vercel auto-adds X-Robots-Tag on preview deployments |
| Future booking API | API / Backend (serverless) | — | Phase 3: `src/pages/api/book.ts` with `export const prerender = false` |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 7.0.2 | Static site generator + build system | [VERIFIED: npm registry] — official Astro package; github.com/withastro/astro |
| @astrojs/vercel | 11.0.0 | Vercel deployment adapter | [VERIFIED: npm registry] — official adapter from withastro org; required for hybrid output |
| @fontsource/prata | 5.2.7 | Self-hosted Prata font (includes Cyrillic) | [VERIFIED: npm registry] — github.com/fontsource/font-files |
| @fontsource/golos-text | 5.2.8 | Self-hosted Golos Text (includes Cyrillic) | [VERIFIED: npm registry] — github.com/fontsource/font-files |

### Supporting (Phase 1 scope)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| photoswipe | 5.4.4 | Gallery lightbox | [VERIFIED: npm registry] — github.com/dimsemenov/Photoswipe — install now (peer dep of Phase 2 gallery island); do NOT wire up in Phase 1 components |
| TypeScript | 5.x (bundled) | Type safety in .astro + .ts files | Bundled with Astro; no separate install |

### Not Needed in Phase 1

| Library | Reason Deferred |
|---------|----------------|
| plyr | Phase 2 video player only |
| grammy | Phase 3 Telegram booking only |
| zod | Bundled with Astro as `astro/zod`; no separate install |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @fontsource self-hosted | Google Fonts CDN | Google Fonts is throttled/blocked on some Russian ISPs — eliminated by project constraint |
| Astro `<Image>` | `<img>` with manual srcset | `<Image>` auto-generates WebP/AVIF, infers width/height (prevents CLS), no manual work |

### Installation

```bash
# Step 1: scaffold (run from project root — accepts existing directory)
npm create astro@latest . -- --template minimal --typescript strict --no-git --no-install
npm install

# Step 2: add adapter
npm install @astrojs/vercel

# Step 3: fonts
npm install @fontsource/prata @fontsource/golos-text

# Step 4: pre-install lightbox for Phase 2 (no-op in Phase 1 components)
npm install photoswipe
```

### Version Verification

All versions verified against npm registry on 2026-06-24:

| Package | Verified Version | Published |
|---------|-----------------|-----------|
| astro | 7.0.2 | 2026-06-23 |
| @astrojs/vercel | 11.0.0 | 2026-06-22 |
| @fontsource/prata | 5.2.7 | confirmed on npm |
| @fontsource/golos-text | 5.2.8 | confirmed on npm |
| photoswipe | 5.4.4 | confirmed on npm |

---

## Package Legitimacy Audit

> slopcheck defaulted to PyPI for this Node.js project and produced false positives (these are npm packages, not Python). Manual npm verification was performed instead — all packages confirmed against official source repositories.

| Package | Registry | Source Repo | Postinstall Script | Disposition |
|---------|----------|-------------|-------------------|-------------|
| astro | npm | github.com/withastro/astro | none | Approved |
| @astrojs/vercel | npm | github.com/withastro/astro (monorepo) | none | Approved |
| @fontsource/prata | npm | github.com/fontsource/font-files | none | Approved |
| @fontsource/golos-text | npm | github.com/fontsource/font-files | none | Approved |
| photoswipe | npm | github.com/dimsemenov/Photoswipe | none | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*slopcheck was run but operates on PyPI, not npm — all tags are [VERIFIED: npm registry] via manual `npm view` commands against authoritative sources.*

---

## Architecture Patterns

### System Architecture Diagram

```
Visitor browser
    |
    | HTTP GET /
    v
Vercel CDN (edge)
    |-- Serves static HTML (prerendered at build time)
    |-- Serves static assets: woff2 fonts, WebP/AVIF images, CSS, JS
    |-- Adds X-Robots-Tag: noindex (automatically on preview deployments)
    |
    v
index.astro (prerendered)
    |-- Layout.astro (head: meta noindex conditional, font imports, global CSS)
    |       |-- @fontsource/prata CSS (Cyrillic woff2 → bundled)
    |       |-- @fontsource/golos-text CSS (Cyrillic woff2 → bundled)
    |       |-- src/styles/global.css (design tokens: CSS custom properties)
    |       |-- <script> global-animations.js (scroll-reveal + cursor glow)
    |
    |-- HeroSection.astro
    |-- MarqueeSection.astro
    |-- FeaturedAlbumSection.astro (data from src/data/site.ts)
    |-- TracksSection.astro (data from getCollection('tracks'))
    |       |-- <script> demo-player.js (fake now-playing bar — D-04)
    |-- AboutSection.astro
    |-- ShowsSection.astro (data from getCollection('shows'))
    |-- GallerySection.astro (data from getCollection('gallery'))
    |-- SingSection.astro
    |       |-- <script> demo-modal.js (fake lessons modal — D-05)
    |-- FooterSection.astro (data from src/data/site.ts: streamingLinks, socialLinks)
    |
    v
Astro build (Sharp)
    |-- Transforms src/assets/images/*.jpg → WebP/AVIF with srcset
    |-- Content Layer reads src/content/{tracks,shows,gallery}/*.json
    |-- Inlines import.meta.env.NOINDEX → conditional <meta> tag in HTML

src/pages/api/book.ts (Phase 3 — not built in Phase 1)
    export const prerender = false  ← on-demand, serverless on Vercel
```

### Recommended Project Structure

```
/                          ← repo root (index.html stays as reference; not served)
├── astro.config.mjs       ← Astro config: adapter + image service
├── tsconfig.json          ← TypeScript (generated by create astro)
├── package.json
├── .env.local             ← NOINDEX=true (gitignored)
├── .env.example           ← NOINDEX=true (committed)
├── vercel.json            ← optional: custom headers if needed
├── public/                ← files served as-is (favicon, robots.txt if needed)
│   └── favicon.svg
└── src/
    ├── content.config.ts  ← Content Layer: tracks, shows, gallery collections
    ├── data/
    │   └── site.ts        ← Typed singletons: featuredAlbum, streamingLinks, socialLinks, lessonsInfo
    ├── content/
    │   ├── tracks/        ← 01-doorudi.json, 02-vesennee-tango.json, etc.
    │   ├── shows/         ← 01-moscow-16ton.json, etc.
    │   └── gallery/       ← g-studio.json, g-guitar.json, etc.
    ├── assets/
    │   └── images/        ← hero.jpg, featured.jpg, about.jpg, g-*.jpg, etc. (moved from root /images/)
    ├── styles/
    │   └── global.css     ← Design tokens (CSS custom properties) + resets + keyframe animations
    ├── scripts/
    │   ├── global-animations.js   ← scroll-reveal + cursor-glow (D-06)
    │   ├── demo-player.js         ← fake now-playing bar (D-04, isolated)
    │   └── demo-modal.js          ← fake lessons modal (D-05, isolated)
    ├── layouts/
    │   └── Layout.astro   ← <html>, <head>, font imports, global CSS import, <slot>
    ├── components/
    │   ├── HeroSection.astro
    │   ├── MarqueeSection.astro
    │   ├── FeaturedAlbumSection.astro
    │   ├── TracksSection.astro
    │   ├── AboutSection.astro
    │   ├── ShowsSection.astro
    │   ├── GallerySection.astro
    │   ├── SingSection.astro
    │   └── FooterSection.astro
    └── pages/
        └── index.astro    ← composes all sections; export const prerender = true (default in static mode)
```

### Pattern 1: Astro Content Collections (Content Layer API)

**What:** Define collections in `src/content.config.ts` using `defineCollection` + `glob` loader + zod schema. Query with `getCollection()` in .astro frontmatter.

**When to use:** Any list content that will eventually be CMS-backed (tracks, shows, gallery per D-07).

**Example (tracks collection with forward-compatible optional media fields per D-09):**

```typescript
// src/content.config.ts
// Source: https://docs.astro.build/en/guides/content-collections/
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tracks = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tracks' }),
  schema: z.object({
    number: z.string(),          // "01", "02" — display order
    title: z.string(),           // "Доодури"
    subtitle: z.string().optional(), // "· сингл 2026"
    duration: z.string().optional(), // "4:18" — display string; Phase 2 will populate
    audioUrl: z.string().url().optional(), // Phase 2 populates this
  }),
});

const shows = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/shows' }),
  schema: z.object({
    date: z.string(),            // "12 сент" — display string
    year: z.string(),            // "2026"
    city: z.string(),            // "Москва"
    venue: z.string(),           // "клуб «16 тонн»"
    ticketUrl: z.string().optional(), // Phase 4 fills real URLs; # placeholder allowed
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/gallery' }),
  schema: z.object({
    src: z.string(),             // image filename, e.g. "g-studio.jpg"
    alt: z.string(),
    spanRows: z.number().optional(), // for the CSS grid span-2 first item
  }),
});

export const collections = { tracks, shows, gallery };
```

**Usage in .astro component:**

```astro
---
// Source: https://docs.astro.build/en/guides/content-collections/
import { getCollection } from 'astro:content';
import { Image } from 'astro:assets';

const tracks = await getCollection('tracks');
---
{tracks.map(track => (
  <button class="track" data-i={track.data.number} data-title={track.data.title}>
    ...
  </button>
))}
```

### Pattern 2: Astro `<Image>` for Local Images

**What:** Import images from `src/assets/images/` and pass to `<Image>` component. Astro's Sharp integration auto-generates WebP/AVIF, infers width/height, generates `srcset`.

**Critical prerequisite:** Images must live inside `src/` (or `public/`) for Astro to process them. The current `images/` folder at repo root must be moved to `src/assets/images/` during scaffold.

**Example:**

```astro
---
// Source: https://docs.astro.build/en/guides/images/
import { Image, Picture } from 'astro:assets';
import heroImg from '../assets/images/hero.jpg';
import galleryStudio from '../assets/images/g-studio.jpg';
---

<!-- Hero — above fold, no lazy load -->
<Image
  src={heroImg}
  alt="внимание брусника!"
  class="hero-bg"
  widths={[640, 1024, 1440, 1920]}
  sizes="100vw"
  format="webp"
  quality={85}
  loading="eager"
  fetchpriority="high"
/>

<!-- Gallery — below fold, lazy load -->
<Image
  src={galleryStudio}
  alt="внимание брусника!"
  loading="lazy"
  decoding="async"
  widths={[400, 800]}
  sizes="(max-width: 860px) 50vw, 33vw"
  format="webp"
  quality={80}
/>
```

**Vercel image behavior:** Astro with @astrojs/vercel uses Vercel's built-in image optimization service by default. Static prerendered pages produce optimized images at build time via Sharp; these are then served from Vercel's CDN. No additional configuration needed. [ASSUMED — Vercel adapter docs did not explicitly describe the Sharp vs Vercel image service interaction for prerendered pages; verify during deploy]

### Pattern 3: Design Token CSS Architecture (D-10)

**What:** Central `src/styles/global.css` defines CSS custom properties (tokens) for all design decisions. Per-component `<style>` blocks reference the tokens and handle layout.

**Token naming convention:**

```css
/* src/styles/global.css */
/* Source: Derived from index.html inline styles */

:root {
  /* Palette */
  --color-bg: #000;
  --color-bg-raised: #070707;
  --color-bg-modal: #0c0a0b;
  --color-accent: #f3a9bd;
  --color-accent-hover: #ffc0d0;
  --color-text: #f2f0ee;
  --color-text-muted: #bdb9b4;
  --color-text-subtle: #9a9691;
  --color-text-dim: #7d7974;
  --color-text-dimmer: #5f5b56;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-subtle: rgba(255, 255, 255, 0.06);

  /* Typography */
  --font-serif: 'Prata', serif;
  --font-sans: 'Golos Text', system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
}

/* Keyframe animations (shared across components) */
@keyframes eq { /* ... from draft ... */ }
@keyframes riseup { /* ... from draft ... */ }
@keyframes marquee { /* ... from draft ... */ }
@keyframes bobdown { /* ... from draft ... */ }

/* Scroll-reveal base state */
[data-reveal] {
  opacity: 0;
  transform: translateY(36px);
  transition: opacity 1s cubic-bezier(.16,.7,.2,1), transform 1s cubic-bezier(.16,.7,.2,1);
}
[data-reveal].in { opacity: 1; transform: none; }
[data-reveal-d1] { transition-delay: .08s; }
[data-reveal-d2] { transition-delay: .16s; }
[data-reveal-d3] { transition-delay: .24s; }

/* Global interactive state classes (applied by class="" in markup) */
.nav-link { color: var(--color-text-muted); transition: color .25s; }
.nav-link:hover { color: var(--color-text); }
/* ... etc. */
```

**Per-component scoped style example:**

```astro
<!-- TracksSection.astro -->
<style>
  /* Scoped styles: Astro adds data-astro-cid-* attribute automatically */
  .track {
    all: unset;
    cursor: pointer;
    display: grid;
    grid-template-columns: 60px 1fr auto auto;
    align-items: center;
    gap: 20px;
    padding: 22px 16px;
    border-top: 1px solid var(--color-border);
    border-radius: 3px;
    transition: background .25s, padding .25s;
  }
  .track:hover {
    background: rgba(243, 169, 189, 0.07);
    padding-left: 24px;
  }
  @media (max-width: 860px) {
    .track { grid-template-columns: 40px 1fr auto; }
    .track-time { display: none; }
  }
</style>
```

**When to use `:global()`:** Only for styles that must cascade into child components' slots or for third-party library markup that Astro can't scope. Not needed for Phase 1 (all content is in one component tree).

### Pattern 4: Noindex Implementation (FND-07)

**What:** `NOINDEX` environment variable read at build time via `import.meta.env`. Inlined into static HTML as a conditional `<meta>` tag.

**Mechanism:**

```astro
---
// src/layouts/Layout.astro
// Source: https://docs.astro.build/en/guides/environment-variables/
const noindex = import.meta.env.NOINDEX === 'true';
---
<head>
  {noindex && <meta name="robots" content="noindex, nofollow" />}
  <!-- ... rest of head ... -->
</head>
```

**Environment setup:**

```env
# .env.local (gitignored — local dev with noindex on)
NOINDEX=true
```

```env
# .env.production (committed — production default is indexable)
NOINDEX=false
```

In Vercel dashboard: set `NOINDEX=true` as an environment variable for the Preview environment. For the production environment, set `NOINDEX=false` or omit entirely. This is the "launch toggle" — flip in Vercel dashboard, trigger redeploy, no code change.

**X-Robots-Tag header:** Vercel **automatically** adds `X-Robots-Tag: noindex` to all Preview deployment responses. [VERIFIED: Vercel response headers docs, 2026-03-05]. For Production deployments, this header is NOT added by Vercel — the `<meta name="robots">` tag is the only noindex signal. Both signals together (meta + header) provide redundant coverage for the pre-launch period.

**Important nuance:** Since the page is static (prerendered), `import.meta.env.NOINDEX` is evaluated at BUILD time, not request time. This means: changing the env var in Vercel dashboard + redeploying is the required flow. There is no per-request conditional — the HTML is baked. This is by design and aligned with the project's "launch toggle" intent.

### Pattern 5: astro.config.mjs Shape

```javascript
// astro.config.mjs
// Source: https://docs.astro.build/en/guides/integrations-guide/vercel/
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',      // default — all pages prerendered; API route will opt out with prerender=false
  adapter: vercel({
    staticHeaders: true, // saves custom headers to vercel.json for static pages
  }),
  image: {
    // Astro uses Sharp by default for build-time image optimization
    // No additional config needed for Vercel static deployment
  },
});
```

**Future API route (Phase 3 — for reference, not Phase 1 work):**

```typescript
// src/pages/api/book.ts
export const prerender = false; // opt this one route out of static prerendering
// This makes Vercel deploy a serverless function for this path only
```

### Pattern 6: Font Self-Hosting (FND-02)

**What:** Import @fontsource CSS in the Layout component. Fonts are bundled into the Astro build and served as static assets — zero requests to fonts.googleapis.com or fonts.gstatic.com.

**Import location:** `src/layouts/Layout.astro` frontmatter (server-side import; Astro processes CSS imports in frontmatter).

```astro
---
// src/layouts/Layout.astro
// Source: @fontsource/prata README (npm), @fontsource/golos-text README (npm)

// Prata: weight 400 only; Cyrillic subset included automatically
import '@fontsource/prata';
// To include only Cyrillic subset explicitly:
// import '@fontsource/prata/400.css';

// Golos Text: import only the weights used in the draft (400, 500, 600, 700)
import '@fontsource/golos-text/400.css';
import '@fontsource/golos-text/500.css';
import '@fontsource/golos-text/600.css';
import '@fontsource/golos-text/700.css';
---
```

**Cyrillic subset coverage (VERIFIED from npm README):**
- `@fontsource/prata`: Subsets: `[cyrillic, cyrillic-ext, latin, vietnamese]` — Cyrillic INCLUDED
- `@fontsource/golos-text`: Subsets: `[cyrillic, cyrillic-ext, latin, latin-ext]` — Cyrillic INCLUDED

**Font-display behavior:** @fontsource packages use `font-display: swap` by default — no FOIT, graceful fallback to system-ui/sans-serif while fonts load.

### Pattern 7: Demo JS Isolation (D-04, D-05)

The two demo JS behaviors must be isolated so Phase 2/3 can cleanly replace them.

**Demo player (D-04) — now-playing bar:**

```javascript
// src/scripts/demo-player.js
// Verbatim port from index.html lines 413–424
// Isolated: when Phase 2 audio island lands, delete this file and its <script> import
(function demoDemoPlayer() {
  var npBar = document.getElementById('now-playing');
  var npTitle = document.getElementById('np-title');
  var npIndex = document.getElementById('np-index');
  document.querySelectorAll('.track').forEach(function (btn) {
    btn.addEventListener('click', function () {
      npTitle.textContent = btn.dataset.title;
      npIndex.textContent = 'трек ' + btn.dataset.i;
      npBar.style.display = 'flex';
    });
  });
  document.getElementById('np-close').addEventListener('click', function () {
    npBar.style.display = 'none';
  });
})();
```

**Demo modal (D-05) — lessons form:**

```javascript
// src/scripts/demo-modal.js
// Verbatim port from index.html lines 427–464
// Isolated: when Phase 3 Telegram endpoint lands, replace only the form.submit handler
(function demoLessonsModal() {
  var overlay = document.getElementById('lessons-overlay');
  // ... full verbatim from index.html ...
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.style.display = 'none';
    thanks.style.display = 'block';
    // Phase 3: replace this handler with real fetch('/api/book', ...)
  });
})();
```

**Import in Layout.astro (or page):**

```astro
<script src="../scripts/global-animations.js" is:inline></script>
<script src="../scripts/demo-player.js" is:inline></script>
<script src="../scripts/demo-modal.js" is:inline></script>
```

> Note: `is:inline` preserves the IIFE structure and prevents Astro from bundling/transforming it. This matches the draft's behavior. [ASSUMED — verify that is:inline is the right directive vs. standard `<script>` tag behavior in Astro 7; alternative is just a bare `<script>` which Astro does bundle with Vite]

### Anti-Patterns to Avoid

- **Serving images from `public/` instead of `src/assets/`:** Images in `public/` are copied as-is — no WebP/AVIF conversion, no srcset, no optimization. Use `src/assets/images/` for all images that should be optimized (D-11).
- **Importing fonts with `<link>` to Google Fonts:** The draft does this. Must be removed entirely. Any Google Fonts reference means FND-02 fails.
- **Using Astro islands (`client:*` directives) for the demo JS:** D-06 explicitly specifies a global vanilla script, not islands. Islands require a framework (React, Preact, Svelte, etc.) and add runtime overhead. The animations and demo behaviors are pure vanilla JS.
- **Keeping inline styles in .astro components:** Defeats D-10 (token system) and makes the v2 theming path painful. All inline styles from the draft must migrate to scoped `<style>` blocks referencing CSS custom properties.
- **Using `output: 'server'` instead of `output: 'static'`:** Server mode SSR-renders every page on every request. The site is 99% static content; use static mode and let the Phase 3 API route opt out individually.
- **Zod imports from `zod` package directly:** In Astro, use `import { z } from 'astro/zod'` — Astro bundles Zod 4 internally. Importing from the `zod` package could cause version conflicts.
- **Using `process.env` in .astro frontmatter:** For static prerendered pages, `import.meta.env` is the correct accessor. `process.env` works in server-side code (API routes) but not in prerendered .astro frontmatter.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization (WebP/AVIF, srcset) | Custom build script | Astro `<Image>`/`<Picture>` | Sharp integration handles format conversion, width calculation, lazy loading attrs automatically |
| Font subsetting | Subset and host fonts manually | `@fontsource/prata`, `@fontsource/golos-text` | Packages already include Cyrillic subsets, correct font-display:swap, and woff2 files |
| Content schema validation | `if (!data.title)` runtime checks | `z.object()` in `src/content.config.ts` | Build fails with clear error if any JSON entry violates schema — prevents silent data bugs |
| CSS scoping | BEM class naming, unique prefixes | Astro scoped `<style>` | Astro adds unique data attributes automatically; no naming convention overhead |
| Deployment adapter | Manual serverless config | `@astrojs/vercel` | Handles Vercel output directory, serverless function routing, image service integration |

**Key insight:** The Astro ecosystem makes the standard operations (image opt, font hosting, content schema) trivial. The project complexity is in the pixel-identical CSS migration, not in infrastructure.

---

## Common Pitfalls

### Pitfall 1: Images at Wrong Path — `<Image>` Won't Process Them

**What goes wrong:** Astro `<Image>` only processes images imported from within `src/` using ESM imports. If images stay in the root `images/` folder (where they currently are), you cannot import them with `import heroImg from '../../images/hero.jpg'` — Astro's build will error or silently fall back to unoptimized output.

**Why it happens:** Astro's asset pipeline only operates on files inside `src/` (or `public/`, which it copies as-is without optimization).

**How to avoid:** Move all images from `/images/` to `/src/assets/images/` as the FIRST step of the migration. Update all import paths accordingly.

**Warning signs:** `<Image src={heroImg}>` works in dev but produces a 404 on build, or Astro shows "Cannot import from outside src directory."

### Pitfall 2: Google Fonts `<link>` Tags Left in Layout

**What goes wrong:** The draft has `<link rel="preconnect" href="https://fonts.googleapis.com">` and the `<link href="https://fonts.googleapis.com/css2?family=Prata...">`. If these are copy-pasted into `Layout.astro`, FND-02 fails (Google Fonts requests in page source).

**Why it happens:** The draft's `<head>` is copied wholesale into the new layout without stripping the old font loading.

**How to avoid:** The Layout.astro `<head>` must include @fontsource imports in the frontmatter AND must not include any `<link>` pointing to fonts.googleapis.com or fonts.gstatic.com. Verify with `grep -r "googleapis" src/`.

**Warning signs:** Page source contains `fonts.googleapis.com` anywhere.

### Pitfall 3: Scoped Styles Not Applying to Dynamic Elements

**What goes wrong:** The `[data-reveal]` and `.in` classes are toggled by JavaScript at runtime. If the scoped style targets `.in`, Astro's scoping adds a `data-astro-cid-*` attribute requirement that the JS-added class won't have.

**Why it happens:** Astro scopes styles by adding `[data-astro-cid-XXXX]` to every selector in a `<style>` block. A class added by external JS doesn't have that attribute — so scoped `.in` selectors don't match.

**How to avoid:** The `[data-reveal]` base state and `.in` active state must live in `global.css` (unscoped), not in component `<style>` blocks. This is correct per D-10 — the token/animation system is global, component styles handle layout only.

**Warning signs:** Scroll-reveal animations don't fire even though IntersectionObserver is working.

### Pitfall 4: `import.meta.env.NOINDEX` Is Build-Time, Not Request-Time

**What goes wrong:** Developer sets `NOINDEX=true` in `.env.local`, runs `astro dev`, sees noindex meta tag. Assumes the env var toggle works at request time. Deploys to Vercel, changes env var in dashboard, doesn't redeploy — noindex state doesn't change.

**Why it happens:** For static prerendered pages, Vite inlines `import.meta.env` values at build time. The HTML is baked; there's no runtime evaluation.

**How to avoid:** Document clearly: changing `NOINDEX` requires a redeploy. The launch procedure is: (1) set `NOINDEX=false` in Vercel dashboard, (2) trigger a new deployment. This is the intended "launch toggle" as described in STATE.md.

**Warning signs:** Env var changed in Vercel dashboard but page source still shows (or doesn't show) the noindex meta.

### Pitfall 5: Zod v4 Breaking Changes (Astro 7 bundles Zod 4)

**What goes wrong:** Zod 4 (shipped with Astro 7 via `astro/zod`) has breaking changes from Zod 3. The most common issue for this schema: `.email()`, `.url()`, `.uuid()` moved from `z.string()` methods to top-level (`z.email()`, `z.url()`). Additionally, `z.string().url()` still works but may show deprecation warnings.

**Why it happens:** Astro 6 upgrade notes specifically call out Zod 4 as a major dependency change.

**How to avoid:** Use `z.string().url().optional()` for `audioUrl` (still functional in Zod 4). Avoid `.email()` on `z.string()`. For this project's simple schemas (strings, numbers, optionals), Zod 4 is largely backward-compatible.

**Warning signs:** Build errors referencing Zod type method not found; TypeScript type errors in content.config.ts.

### Pitfall 6: Whitespace Between Inline Elements (Astro 7 JSX-style stripping)

**What goes wrong:** Astro 7's new Rust compiler strips whitespace between inline elements JSX-style. `<span>hello</span> <em>world</em>` renders as `helloworld` — missing the space.

**Why it happens:** Compiler change from Astro 7 (Go → Rust compiler with different whitespace handling).

**How to avoid:** Use `{' '}` explicit space character between inline elements, or use CSS `gap` on flex containers instead of relying on natural whitespace. The track title + subtitle pattern in the draft (`<span>Доодури</span><span>· сингл 2026</span>`) uses a gap approach that's safe.

**Warning signs:** Track titles run together; nav link text appears concatenated.

### Pitfall 7: Astro `output: 'hybrid'` — No Longer a Valid Keyword

**What goes wrong:** Older tutorials and the CLAUDE.md description reference `output: 'hybrid'`. This was a valid mode in earlier Astro versions. In current Astro (5+), it is no longer needed.

**Why it happens:** The `hybrid` output mode was unified with `static` mode — you get hybrid behavior by default: static for all pages, opt individual routes into server rendering with `export const prerender = false`.

**How to avoid:** Use `output: 'static'` (or omit output entirely, as static is the default). Add `export const prerender = false` to any route that needs server rendering (Phase 3: `src/pages/api/book.ts`).

**Warning signs:** `output: 'hybrid'` in astro.config.mjs may produce a build warning or error in Astro 7.

---

## Code Examples

### content.config.ts — Complete for Phase 1

```typescript
// src/content.config.ts
// Source: https://docs.astro.build/en/guides/content-collections/
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tracks = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tracks' }),
  schema: z.object({
    number: z.string(),                    // "01" — display number
    title: z.string(),                     // "Доодури"
    subtitle: z.string().optional(),       // "· сингл 2026"
    displayDuration: z.string().optional(),// "4:18" — display only; Phase 2 will populate
    audioUrl: z.string().optional(),       // Phase 2 data-fill; empty for now (D-09)
    durationSeconds: z.number().optional(),// Phase 2 data-fill; empty for now (D-09)
  }),
});

const shows = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/shows' }),
  schema: z.object({
    dateDisplay: z.string(),   // "12 сент"
    year: z.string(),          // "2026"
    city: z.string(),          // "Москва"
    venue: z.string(),         // "клуб «16 тонн»"
    ticketUrl: z.string().optional().default('#'),  // Phase 4 fills real URLs
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/gallery' }),
  schema: z.object({
    filename: z.string(),               // "g-studio.jpg"
    alt: z.string(),
    gridSpan: z.enum(['single', 'tall']).default('single'), // 'tall' = grid-row: span 2
    order: z.number(),                  // sort order
  }),
});

export const collections = { tracks, shows, gallery };
```

### src/data/site.ts — Typed Singletons

```typescript
// src/data/site.ts
// Source: D-08 (Claude's discretion — planner decides schema)

export const featuredAlbum = {
  title: 'Неоднозначное',
  year: '2024',
  label: 'МТС Лейбл',
  description: 'Одиннадцать песен о любви, памяти и взрослении. Тёплые гитары, синтезаторы и шорох плёнки.',
  trackCount: 11,
  durationDisplay: '38 мин',
  spotifyUrl: 'https://open.spotify.com/artist/11epkfgLUMWmXsTbgfPu4B',
  image: 'featured.jpg',
} as const;

// D-02: Yandex/VK URLs to be supplied by user; placeholders until then
export const streamingLinks = [
  { label: 'Яндекс Музыка', url: '#', order: 1 }, // D-02: user supplies real URL
  { label: 'VK Музыка', url: '#', order: 2 },      // D-02: user supplies real URL
  { label: 'Spotify', url: 'https://open.spotify.com/artist/11epkfgLUMWmXsTbgfPu4B', order: 3 },
  { label: 'Apple Music', url: '#', order: 4 },    // D-03: Phase 4 placeholder
  { label: 'YouTube', url: 'https://www.youtube.com/@vnimaniebrusnika', order: 5 },
] as const;

// D-03: VK and Instagram are # placeholders; Telegram is real
export const socialLinks = [
  { label: 'Telegram', url: 'https://t.me/vnimaniebrusnika' },
  { label: 'VK', url: '#' },           // D-03: Phase 4 placeholder
  { label: 'Instagram', url: '#' },    // D-03: Phase 4 placeholder (footer-only)
  { label: 'hello@brusnika.ru', url: 'mailto:hello@brusnika.ru' }, // D-03: draft placeholder email
] as const;

export const horoterapiyaUrl = 'https://sonya-brusnika.timepad.ru/event/4010316/';
```

### Sample JSON Content Files

```json
// src/content/tracks/01-doorudi.json
{
  "number": "01",
  "title": "Доодури",
  "subtitle": "· сингл 2026",
  "displayDuration": "4:18"
}
```

```json
// src/content/shows/01-moscow.json
{
  "dateDisplay": "12 сент",
  "year": "2026",
  "city": "Москва",
  "venue": "клуб «16 тонн»"
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `output: 'hybrid'` in Astro config | `output: 'static'` (default) + `export const prerender = false` per route | Astro 5+ | Do not use `hybrid` keyword — use static mode with per-route opt-out |
| `src/content/` directory with implicit collections | `src/content.config.ts` with explicit `defineCollection` + `glob()` loader | Astro 5 (mandatory in 6) | `legacy.collections` flag removed in Astro 6; must use Content Layer API |
| `import { z } from 'zod'` | `import { z } from 'astro/zod'` | Astro 5+ | Astro bundles Zod internally; use the re-export to ensure version consistency |
| Go-based Astro compiler | Rust-based compiler | Astro 7 | Stricter HTML validation + JSX-style whitespace stripping between inline elements |
| Google Fonts `<link>` tags | `@fontsource/*` npm packages | Project requirement | Self-hosted fonts eliminate Google Fonts dependency; Cyrillic subsets included |
| `import.meta.env` values sometimes referencing process.env | Always inlined at build time | Astro 6 | Server-side values in .astro frontmatter must be read via `import.meta.env`; always baked into HTML for static pages |

**Deprecated/outdated:**
- `output: 'hybrid'`: replaced by per-route `export const prerender = false`
- `legacy.collections`: removed in Astro 6, not supported in Astro 7
- Any Google Fonts `<link>` tags from the draft's `<head>`: must be removed entirely

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vercel image optimization (Sharp vs. Vercel Image Optimization Service) works correctly for static prerendered Astro pages without additional config | Architecture Patterns (Pattern 2) | May need `image.service` config in astro.config.mjs; test early on first Vercel deploy |
| A2 | `is:inline` is the correct Astro directive for verbatim script inclusion of demo IIFE files | Pattern 7: Demo JS Isolation | May need `<script>` without directive — Astro 7 behavior for inline scripts should be verified against current docs |
| A3 | `output: 'hybrid'` is not a valid keyword in Astro 7 (was valid in Astro 3/4) | Pitfall 7 | If Astro 7 still accepts 'hybrid', the workaround still works correctly; low risk |
| A4 | @fontsource packages use `font-display: swap` by default | Pattern 6: Font Self-Hosting | If not swap by default, need to override via CSS `font-display: swap` in global.css; minor |
| A5 | Moving images from `/images/` to `src/assets/images/` is the correct path for Astro `<Image>` processing | Pitfall 1 | If `public/images/` is sufficient (without optimization), the move still works but images won't be optimized; verify D-11 intent |

**If this table were empty:** No unverified claims. But it isn't — A1 and A2 warrant early validation during the Walking Skeleton deploy.

---

## Open Questions

1. **Real URLs for Яндекс Музыка and VK Music (LINK-01)**
   - What we know: Spotify (`open.spotify.com/artist/11epkfgLUMWmXsTbgfPu4B`) and YouTube (`youtube.com/@vnimaniebrusnika`) are real and in the draft
   - What's unclear: The Yandex Music and VK Music real URLs are not in the draft and "to be supplied by the user" (D-02)
   - Recommendation: Planner should add a task early in Phase 1 to collect these URLs from the user before wiring streaming links; Phase 1 can proceed with `#` placeholder and swap in real URLs when received

2. **Astro 7 Rust compiler whitespace behavior scope**
   - What we know: JSX-style whitespace stripping is a documented Astro 7 change; spaces between inline elements may disappear
   - What's unclear: Which specific patterns in the draft's markup are affected (likely `<span>track title</span><span>subtitle</span>` patterns)
   - Recommendation: Test first with the MarqueeSection or TracksSection (which have inline span patterns) and fix with explicit `{' '}` or flex gap as needed

3. **Contact email accuracy (D-03)**
   - What we know: Draft uses `hello@brusnika.ru`; D-03 notes this is a "draft value, updated after demo"
   - What's unclear: Whether the band wants a different email for the demo phase or accepts `hello@brusnika.ru` for now
   - Recommendation: Keep `hello@brusnika.ru` per D-03; add to Phase 4 verification checklist

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro 7 (min: 22.12.0) | YES | v25.6.1 | — (exceeds minimum) |
| npm | Package management | YES | 11.9.0 | — |
| Git | Version control | Assumed (repo exists) | — | — |
| Vercel CLI | Preview deploy | Not checked | — | Deploy via Vercel GitHub integration |
| Sharp | Astro image processing | Bundled with Astro | — | — (no fallback needed) |

**Missing dependencies with no fallback:** none
**Missing dependencies with fallback:** Vercel CLI not verified; GitHub integration covers the deploy path

---

## MVP Walking Skeleton Order

The thinnest end-to-end deployable slice that proves the full pipeline before fleshing out all sections:

1. `npm create astro@latest` — scaffold into existing repo (empty template, TypeScript)
2. Add `@astrojs/vercel` adapter + configure `astro.config.mjs`
3. Move `images/` to `src/assets/images/`
4. Create `src/layouts/Layout.astro` with @fontsource imports, global CSS, NOINDEX conditional
5. Create `src/styles/global.css` with all CSS custom properties + keyframe animations
6. Create `src/pages/index.astro` — render ONLY the HeroSection (one real section with one `<Image>`)
7. Deploy to Vercel — verify: page loads, Prata font renders, no Google Fonts requests, NOINDEX meta tag present, hero image is WebP
8. Once deploy is green: add remaining sections one by one (marquee, featured album, tracks, about, shows, gallery, sing, footer)
9. Wire Content Collections: add `src/content.config.ts`, JSON content files, update TracksSection + ShowsSection to use `getCollection()`
10. Wire `src/data/site.ts` for streaming links and social links
11. Add global animations script + demo player/modal scripts
12. Final pixel-comparison check against `index.html`

---

## Sources

### Primary (HIGH confidence)
- `npm view astro version` → 7.0.2 (verified 2026-06-24) — package exists, correct ecosystem, source repo confirmed
- `npm view @astrojs/vercel version` → 11.0.0 (verified 2026-06-24) — same monorepo as astro
- `npm view @fontsource/prata readme` — Cyrillic subset CONFIRMED (`[cyrillic,cyrillic-ext,latin,vietnamese]`)
- `npm view @fontsource/golos-text readme` — Cyrillic subset CONFIRMED (`[cyrillic,cyrillic-ext,latin,latin-ext]`)
- [Astro Content Collections Guide](https://docs.astro.build/en/guides/content-collections/) — Content Layer API, glob loader, defineCollection, z.object, getCollection()
- [Astro Environment Variables Guide](https://docs.astro.build/en/guides/environment-variables/) — import.meta.env, PUBLIC_ prefix, build-time inlining behavior
- [Astro Rendering Modes](https://docs.astro.build/en/basics/rendering-modes/) — static (default) + prerender=false per-route; no 'hybrid' keyword needed
- [Astro Upgrade to v6 Guide](https://docs.astro.build/en/guides/upgrade-to/v6/) — Node 22.12.0+ requirement; Zod 4; Content Layer API mandatory; import.meta.env always inlined
- [Vercel Response Headers Docs](https://vercel.com/docs/headers/response-headers) — X-Robots-Tag automatically set to noindex on Preview deployments (confirmed 2026-03-05)
- [Astro Image Guide](https://docs.astro.build/en/guides/images/) — `<Image>` and `<Picture>` components, local image import pattern, Sharp processing, loading="lazy"
- [Astro Styling Guide](https://docs.astro.build/en/guides/styling/) — scoped `<style>` blocks, CSS custom properties, :global(), global stylesheet import

### Secondary (MEDIUM confidence)
- [Astro @astrojs/vercel Integration Guide](https://docs.astro.build/en/guides/integrations-guide/vercel/) — staticHeaders option, adapter config shape
- [Astro v7 Upgrade Guide](https://docs.astro.build/en/guides/upgrade-to/v7/) — Rust compiler, JSX whitespace, Vite 8, experimental flags
- [Astro on-demand rendering docs](https://docs.astro.build/en/guides/on-demand-rendering/) — confirmed: 'hybrid' not mentioned; use prerender=false
- [fontsource.org/fonts/golos-text](https://fontsource.org/fonts/golos-text) — Cyrillic confirmed; weights 400-900

### Tertiary (LOW confidence)
- WebSearch results on `is:inline` directive behavior in Astro 7 — not directly verified from official docs; flagged as A2 in Assumptions Log

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified on npm with source repos confirmed
- Architecture: HIGH — patterns derived from official Astro docs + current registry state
- Pitfalls: MEDIUM-HIGH — most derived from official migration docs; A1/A2 are training-knowledge assumptions
- CSS migration: HIGH — direct analysis of index.html source of truth
- Noindex: HIGH — Vercel response headers docs explicitly confirm X-Robots-Tag behavior

**Research date:** 2026-06-24
**Valid until:** 2026-07-24 (stable stack; Astro releases frequently but 7.x API is stable)
