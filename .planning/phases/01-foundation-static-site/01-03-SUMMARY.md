---
phase: 01-foundation-static-site
plan: 03
subsystem: content-layer
tags: [astro, content-collections, zod, tracks, shows, gallery, demo-player, webp, responsive]

# Dependency graph
requires:
  - 01-01 (Layout shell, global.css tokens, Astro <Image> pipeline)
  - 01-02 (FeaturedAlbum, About, Sing, js-reveal gate, placement comments in index.astro)
provides:
  - src/content.config.ts — tracks/shows/gallery collections with zod schemas (v1→v2 CMS seam)
  - src/content/tracks/ — 5 JSON files (01-doorudi through 05-vspomni-menya)
  - src/content/shows/ — 4 JSON files (01-moskva through 04-ekaterinburg)
  - src/content/gallery/ — 5 JSON files (01-studio through 05-live)
  - src/components/TracksSection.astro — track list from getCollection('tracks') + demo now-playing bar
  - src/components/ShowsSection.astro — shows list from getCollection('shows') with ticket links
  - src/components/GallerySection.astro — photo grid from getCollection('gallery'), lazy WebP
  - src/scripts/demo-player.js — isolated throwaway IIFE source (D-04)
  - src/pages/index.astro updated with all three sections in draft document order
affects:
  - 01-04 (Footer, BookingModal insert after Sing; Plan 04 also adds global-animations.js)
  - Phase 2 (audio island replaces TracksSection demo player block + demo-player.js)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Content Layer: defineCollection + glob() + zod schema in content.config.ts; getCollection() in .astro frontmatter"
    - "import z from 'astro/zod' (NOT 'zod' package — Pitfall 5; Astro 7 bundles Zod 4)"
    - "Dynamic gallery image import: import.meta.glob('../assets/images/*.jpg', { eager: true }) + default export lookup by filename key"
    - "<script is:inline> block for throwaway IIFE (A2 resolved: is:inline on <script> BLOCK prevents Vite bundling; is:inline on <script src=> does NOT inline file — emits broken relative-path src= tag)"
    - "Gallery item class-based grid span: gallery-item--tall for grid-row: span 2"

key-files:
  created:
    - src/content.config.ts
    - src/content/tracks/01-doorudi.json
    - src/content/tracks/02-vesennee-tango.json
    - src/content/tracks/03-klub-neopravdannykh-nadezhd.json
    - src/content/tracks/04-nauchi-menya-byt.json
    - src/content/tracks/05-vspomni-menya.json
    - src/content/shows/01-moskva.json
    - src/content/shows/02-spb.json
    - src/content/shows/03-kazan.json
    - src/content/shows/04-ekaterinburg.json
    - src/content/gallery/01-studio.json
    - src/content/gallery/02-guitar.json
    - src/content/gallery/03-band-guitars.json
    - src/content/gallery/04-couch.json
    - src/content/gallery/05-live.json
    - src/components/TracksSection.astro
    - src/components/ShowsSection.astro
    - src/components/GallerySection.astro
    - src/scripts/demo-player.js
  modified:
    - src/pages/index.astro (TracksSection, ShowsSection, GallerySection imported and composed)

key-decisions:
  - "import z from 'astro/zod' (not 'zod') confirmed — Astro 7 bundles Zod 4; direct import risks version conflict"
  - "Assumption A2 resolved: is:inline on <script> BLOCK inlines content correctly; is:inline on <script src=...> does NOT inline file content — it bypasses Vite but still emits a src= attribute with a broken relative path. Demo player now lives in <script is:inline> block in TracksSection.astro; src/scripts/demo-player.js is the canonical source reference Phase 2 deletes"
  - "Gallery dynamic images: import.meta.glob with { eager: true } and default export type. Key lookup is '../assets/images/<filename>' relative to GallerySection.astro. This satisfies Astro <Image>'s ImageMetadata type requirement"
  - "tracks sorted by number.localeCompare() — alphabetic works for '01'..'05' zero-padded strings"
  - "shows preserve file order (glob returns alphabetically by filename — 01-moskva, 02-spb, 03-kazan, 04-ekaterinburg matches draft display order)"
  - "ticket-link href from schema ticketUrl (all '#' placeholder per D-03); rel=noopener noreferrer only applied when href is not '#'"
  - "gallery-item--tall CSS class for gridSpan:'tall' items rather than inline style; class matches Astro scoped style without @supports gymnastics"

# Placeholder hrefs tracked for Phase 4 verification (D-03)
placeholder-hrefs:
  - "Яндекс Музыка ↗ link in TracksSection — href='#' (D-02: user supplies real URL)"
  - "All 4 ticket-link hrefs in ShowsSection — href='#' (D-03: Phase 4 fills real Timepad/Kassir URLs)"

# Metrics
duration: 5min
completed: 2026-06-24
---

# Phase 01 Plan 03: Content Layer Summary

**Astro Content Collections established as the v1→v2 CMS seam — tracks, shows, and gallery data authored in zod-validated JSON and rendered via getCollection() in three pixel-faithful sections, with the throwaway demo now-playing bar isolated for clean Phase 2 swap**

## Performance

- **Duration:** ~5 min
- **Completed:** 2026-06-24
- **Tasks:** 2 auto tasks complete; 1 checkpoint awaiting Vercel deploy
- **Files created:** 20 new files (1 config, 14 JSON content, 3 components, 1 script) + 1 updated page

## Accomplishments

- `src/content.config.ts`: Three collections defined with `defineCollection` + `glob()` loader + zod schemas. Import `z` from `astro/zod` (not `zod` package). Tracks carry forward-compatible optional `audioUrl` + `durationSeconds` for Phase 2 (D-09). Shows `ticketUrl` defaults to `'#'` (D-03). Gallery `gridSpan` enum `'single'|'tall'`.

- Content JSON: 5 track entries (Доодури, Весеннее танго, Клуб Неоправданных Надежд, Научи меня быть, Вспомни меня — exact titles/subtitles/durations from draft). 4 show entries (Москва клуб «16 тонн», Санкт-Петербург Сцена «Сердце», Казань Смена, Екатеринбург Дом Печати). 5 gallery entries (g-studio.jpg tall, g-guitar.jpg, band-guitars.jpg, g-couch.jpg, live.jpg).

- `TracksSection.astro`: `getCollection('tracks')` sorted by number. Header with Синглы и любимое + Spotify/Яндекс Музыка/YouTube links. 5 `.track` buttons with `data-i`/`data-title` for demo player. `#now-playing` bar markup (EQ bars, np-title, np-index, np-close). Demo player IIFE in `<script is:inline>` block (A2 resolved — see Decisions). Scoped grid + mobile rules.

- `ShowsSection.astro`: `getCollection('shows')` in file order. live-crowd2.jpg banner (Astro `<Image>`, WebP, 21/9, lazy). Prata caption. 4 `.show-row` grids each with `.ticket-link` from schema `ticketUrl` (all `#` per D-03). `rel="noopener noreferrer"` on non-`#` hrefs (T-03-02). Mobile responsive.

- `GallerySection.astro`: `getCollection('gallery')` sorted by `order`. Dynamic image import via `import.meta.glob('../assets/images/*.jpg', { eager: true })` — looks up `default` export by filename key. 5 `.gallery-item` divs with `gallery-item--tall` on studio photo. All images lazy WebP at `widths=[400,800]`. No lightbox (Phase 2). Mobile 2-column grid.

- `src/scripts/demo-player.js`: Verbatim IIFE source (D-04) — canonical reference file that Phase 2 deletes along with the `<script is:inline>` block in TracksSection.

- `index.astro`: TracksSection inserted after FeaturedAlbum; ShowsSection + GallerySection between About and Sing. Draft document order fully restored. Plan 04 comment preserved.

- Build: 30 WebP derivatives total (12 existing + 18 new: 3 live-crowd2 + 5×3 gallery images). `npm run build` exits 0; zod validates all 14 JSON files at build time.

## Task Commits

1. **Task 1: content.config.ts + JSON content** — `c123328` (feat)
2. **Task 2: TracksSection, ShowsSection, GallerySection, demo player, index.astro** — `427ce5d` (feat)
3. **Task 3: Checkpoint (Vercel visual verify)** — awaiting human deploy

## Resolved Assumptions

### A2: is:inline behavior (D-04 script isolation)

**Resolved:** `is:inline` on a `<script>` BLOCK (not `<script src=>`) is the correct approach.

- `<script is:inline>` with inline content: Astro preserves the content verbatim without Vite bundling. The IIFE structure is preserved, the script renders inline in the HTML `<body>`.
- `<script src="../scripts/demo-player.js" is:inline>`: This does NOT inline the file content. Astro bypasses Vite processing but still emits a `<script src="../scripts/demo-player.js">` tag, which renders a broken relative URL that the browser cannot fetch.

**Decision:** Demo player IIFE lives in `<script is:inline>` block directly in `TracksSection.astro`. `src/scripts/demo-player.js` serves as the isolated source reference (D-04) that Phase 2 deletes together with the inline block.

### Gallery dynamic images

**Resolved:** `import.meta.glob('../assets/images/*.jpg', { eager: true })` returns `{ [path]: { default: ImageMetadata } }`. Lookup key is the import path relative to the component file: `'../assets/images/<filename>'`. This correctly satisfies Astro `<Image>`'s `ImageMetadata` type requirement at build time.

## getCollection Sort Approach

| Collection | Sort Method | Rationale |
|------------|------------|-----------|
| tracks | `a.data.number.localeCompare(b.data.number)` | Zero-padded "01".."05" sorts correctly alphabetically |
| shows | No sort (file order) | `glob()` returns files alphabetically; `01-moskva`, `02-spb`, `03-kazan`, `04-ekaterinburg` already in display order |
| gallery | `a.data.order - b.data.order` | Numeric order field `1..5` ensures deterministic display order regardless of glob order |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed is:inline on <script src=> not actually inlining the file**
- **Found during:** Task 2 verification — `grep -q 'demoDemoPlayer'` in dist/index.html returned false after using `<script src="../scripts/demo-player.js" is:inline>` in index.astro
- **Issue:** Astro `is:inline` on a `<script src=>` tag does NOT inline the file. It bypasses Vite but still emits a literal `<script src="../scripts/demo-player.js">` tag in the HTML. The relative path `../scripts/demo-player.js` is not a valid URL the browser can fetch from `dist/index.html`.
- **Fix:** Moved the IIFE content into a `<script is:inline>` block directly in `TracksSection.astro` (adjacent to the now-playing bar markup it controls). Added explanatory comment. Removed the broken `<script src>` line from `index.astro`. `src/scripts/demo-player.js` remains as the canonical source reference (D-04 isolation).
- **Files modified:** TracksSection.astro, index.astro
- **Committed in:** 427ce5d (Task 2 commit)

No other deviations — plan executed as written.

## Placeholder Hrefs (Phase 4 Tracker, D-03)

| Location | href | Fill in |
|----------|------|---------|
| TracksSection: Яндекс Музыка ↗ | `#` | Phase 4 (user supplies real URL per D-02) |
| ShowsSection: Москва «16 тонн» билеты | `#` | Phase 4 (Timepad/Kassir) |
| ShowsSection: Санкт-Петербург «Сердце» билеты | `#` | Phase 4 |
| ShowsSection: Казань Смена билеты | `#` | Phase 4 |
| ShowsSection: Екатеринбург Дом Печати билеты | `#` | Phase 4 |

## Phase 2 Handoff (TracksSection demo cleanup)

When Phase 2 audio island lands:
1. Delete `src/scripts/demo-player.js`
2. Remove the `<script is:inline>` block from `src/components/TracksSection.astro`
3. Remove the `#now-playing` `<div>` markup from `TracksSection.astro`
4. Replace with the real audio island component

## Known Stubs

None introduced. All three sections render real band content from the design draft.
The demo now-playing bar is intentional throwaway scaffolding (D-04), not a stub —
documented as such with Phase 2 cleanup instructions.

## Threat Flags

No new threat surface beyond the plan's threat model.

| Status | Threat | Mitigation |
|--------|--------|------------|
| T-03-01 mitigated | Build-time content zod validation | All 14 JSON files validated by zod at build; build fails on schema violation |
| T-03-02 mitigated | target="_blank" links | All Spotify/YouTube links carry `rel="noopener noreferrer"`; ticket-links are `#` placeholders so no rel needed |
| T-03-03 accepted | Demo player reads data-title/data-i from DOM | Values are build-time JSON; only writes to textContent (no innerHTML); throwaway demo |

## Self-Check

### Verified Files Exist

- src/content.config.ts: FOUND
- src/content/tracks/ (5 files): FOUND
- src/content/shows/ (4 files): FOUND
- src/content/gallery/ (5 files): FOUND
- src/components/TracksSection.astro: FOUND
- src/components/ShowsSection.astro: FOUND
- src/components/GallerySection.astro: FOUND
- src/scripts/demo-player.js: FOUND
- src/pages/index.astro (updated): FOUND
- dist/_astro/g-studio.*.webp: FOUND (3 derivatives)
- dist/_astro/live-crowd2.*.webp: FOUND (3 derivatives)
- dist/index.html contains demoDemoPlayer IIFE: CONFIRMED

### Verified Commits Exist

- c123328: Task 1 — content.config.ts + JSON content
- 427ce5d: Task 2 — TracksSection, ShowsSection, GallerySection, demo player, index.astro

## Self-Check: PASSED

---
*Phase: 01-foundation-static-site*
*Plan: 03*
*Completed: 2026-06-24*
