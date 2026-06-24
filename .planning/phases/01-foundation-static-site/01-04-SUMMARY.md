---
phase: 01-foundation-static-site
plan: 04
subsystem: links-data-animations-modal
tags: [astro, typescript, scroll-reveal, cursor-glow, modal, site-data, footer, lessons]

# Dependency graph
requires:
  - 01-03 (TracksSection, content collections, is:inline resolution)
  - 01-02 (.js-reveal gate in global.css, data-open-lessons hooks in Nav + SingSection)
  - 01-01 (Layout shell, #cursor-glow markup, global.css tokens)
provides:
  - src/data/site.ts — typed singletons: streamingLinks (Яндекс/VK first, LINK-01), socialLinks, horoterapiyaUrl
  - src/components/FooterSection.astro — footer from site.ts (LINK-01/02); slots into index.astro
  - src/components/LessonsModal.astro — lessons modal markup + thanks state (D-05)
  - src/scripts/demo-modal.js — isolated fake-submit IIFE source (D-05 Phase 3 swap seam)
  - src/scripts/global-animations.js — scroll-reveal + cursor-glow IIFE source (FND-03/D-06)
  - src/layouts/Layout.astro — .js-reveal inline head script, LessonsModal at end of body, both IIFEs inlined
  - src/components/TracksSection.astro — header links from site.ts (LINK-01)
affects:
  - Phase 2 (replaces TracksSection demo player, keeps all site.ts data)
  - Phase 3 (replaces demo-modal.js submit handler only with fetch('/api/book'))
  - Phase 4 (fills placeholder '#' hrefs for Яндекс/Apple/VK/Instagram tracked below)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Import Astro asset (ImageMetadata) then use .src in inline style for CSS background-image (lessons.jpg)"
    - "is:inline on <script> BLOCK inlines verbatim IIFE (A2 pattern from Plan 03, applied to global-animations + demo-modal)"
    - "Inline render-blocking <script> in <head> (no defer/async/module) sets .js-reveal BEFORE first paint"
    - "prefers-reduced-motion gate: skip .js-reveal entirely so content is always visible with reduced motion"
    - "streamingLinks array filtered by label for subset renders (footer 4-item, TracksSection header 3-item)"

key-files:
  created:
    - src/data/site.ts
    - src/components/FooterSection.astro
    - src/components/LessonsModal.astro
    - src/scripts/demo-modal.js
    - src/scripts/global-animations.js
  modified:
    - src/layouts/Layout.astro (inline .js-reveal script, LessonsModal import, both IIFEs)
    - src/components/TracksSection.astro (header links from site.ts)
    - src/pages/index.astro (FooterSection import + slot)

key-decisions:
  - "lessons.jpg background approach: imported as Astro asset (import lessonsImg from '../assets/images/lessons.jpg') then used via lessonsImg.src in inline style. This keeps the image through Astro's asset pipeline with fingerprinted URL (/_astro/lessons.BmGQKHOr.jpg) — no copy to public/ needed. Gradient overlay byte-identical to draft."
  - "LessonsModal placement: rendered in Layout.astro at end of body (inside root wrapper div, after <slot />), not in index.astro. This keeps the modal available globally on any page that uses Layout."
  - "global-animations IIFE inlined via <script is:inline> in Layout.astro (not the .js file directly, per A2 resolution from Plan 03 SUMMARY — <script src= is:inline> does not inline file content)"
  - "demo-modal IIFE also inlined via <script is:inline> in Layout.astro (same A2 reasoning); the .js files serve as isolated source references for Phase 2/3 cleanup"
  - ".js-reveal class added in render-blocking inline <script> in <head> — NOT deferred — so the class is set BEFORE [data-reveal] elements are painted, preventing flash-then-hide"
  - "prefers-reduced-motion respected by skipping .js-reveal entirely: content remains visible, no CSS hiding, no animation. Pure progressive enhancement."
  - "Footer «слушать» renders 4 items (Spotify/Яндекс Музыка/Apple Music/YouTube), not 5 — excludes VK Музыка matching design draft. TracksSection header renders 3 items (Spotify/Яндекс Музыка/YouTube) matching draft lines 136-138."

# Placeholder hrefs tracked for Phase 4 (complete list across all plans)
placeholder-hrefs:
  - "streamingLinks: Яндекс Музыка — href='#' (D-02: user supplies real artist URL)"
  - "streamingLinks: VK Музыка — href='#' (D-02: user supplies real artist URL)"
  - "streamingLinks: Apple Music — href='#' (D-03: Phase 4 fills real Apple Music artist URL)"
  - "socialLinks: VK — href='#' (D-03: Phase 4 fills real VK community URL)"
  - "socialLinks: Instagram — href='#' (D-03: Phase 4 fills real Instagram profile URL)"
  - "socialLinks: hello@brusnika.ru — mailto: (D-03: draft email; real band email)"
  - "TracksSection header: Яндекс Музыка — href='#' (D-02 via site.ts)"
  - "FooterSection: Яндекс Музыка, Apple Music — href='#' (D-02/D-03 via site.ts)"
  - "FooterSection: VK, Instagram — href='#' (D-03 via site.ts)"
  - "ShowsSection: all 4 ticket-link hrefs — href='#' (D-03: Phase 4 fills Timepad/Kassir URLs)"

# Metrics
duration: 12min
completed: 2026-06-24
---

# Phase 01 Plan 04: Links-as-data, Footer, Lessons Modal, Global Animations Summary

**Typed data layer (site.ts) drives all outbound links; footer, lessons modal with fake submit, and scroll-reveal + cursor-glow animations complete the page — with .js-reveal class set pre-paint via inline head script to prevent flash-then-hide**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-06-24
- **Tasks:** 2 auto tasks complete; 1 checkpoint awaiting Vercel deploy
- **Files created:** 5 new files + 3 modified

## Accomplishments

- `src/data/site.ts`: Typed singletons with `as const`. `streamingLinks` ordered Яндекс/VK first (LINK-01); `socialLinks` (Telegram/VK/Instagram/email); `horoterapiyaUrl` (real Timepad event). All placeholder `#` hrefs carry inline `D-02`/`D-03` comments for Phase 4.

- `FooterSection.astro`: Three-column footer — brand block (pink dot + Prata wordmark), «слушать» column (Spotify/Яндекс/Apple Music/YouTube from `site.ts`), «связь» column (Telegram/VK/Instagram/email from `site.ts`). Bottom bar «© 2026» + tagline. All `target="_blank"` links carry `rel="noopener noreferrer"` (T-04-02 mitigated). Mobile single-column via global.css `.footer-grid` rule.

- `TracksSection.astro`: Header streaming links replaced with `site.ts` subset (Spotify/Яндекс Музыка/YouTube). LINK-01 fully data-sourced.

- `LessonsModal.astro`: Two-column dialog (`#lessons-overlay` → `.lessons-modal` → two panels). Left panel: `lessons.jpg` imported as Astro asset (fingerprinted), gradient overlay, Пойте с нами eyebrow, Prata h3, copy, хоротерапия block with real Timepad link. Right panel: `#lessons-form` (формат select / имя / telegram|email / опыт select / submit) + `#lessons-thanks` (hidden, shown by IIFE). Mobile single-column.

- `src/scripts/demo-modal.js`: Isolated IIFE (D-05) — `openLessons`/`closeLessons`, `[data-open-lessons]` click triggers, `.lessons-close` ×, click-outside, Escape keydown, fake submit (`e.preventDefault()` + shows thanks, **zero fetch/XHR**). Phase 3 seam clearly marked in comments.

- `src/scripts/global-animations.js`: Isolated IIFE (D-06) — `IntersectionObserver` (threshold 0.12, unobserve after intersect) for `[data-reveal]`; fallback `classList.add('in')` if no IO; cursor-glow `mousemove` guarded by `matchMedia('(pointer:fine)')`.

- `Layout.astro` updated:
  - **Inline render-blocking `<script>` in `<head>`**: adds `document.documentElement.classList.add('js-reveal')` BEFORE first paint (no defer/async/module). Skips entirely if `prefers-reduced-motion: reduce` — content stays visible with no animation.
  - `<LessonsModal />` at end of body inside root wrapper (after `<slot />`).
  - `global-animations` IIFE via `<script is:inline>` block.
  - `demo-modal` IIFE via `<script is:inline>` block.
  - `#cursor-glow` div already present from Plan 01; now activated by mousemove listener.

## .js-reveal Handoff — Verified

Both mandatory steps from 01-02 SUMMARY handoff shipped together:
1. `document.documentElement.classList.add('js-reveal')` — in render-blocking inline `<head>` script (BEFORE first paint)
2. IntersectionObserver in `globalAnimations` IIFE — toggles `.in` class on `[data-reveal]` elements

Self-check of `dist/index.html`:
- `js-reveal` class referenced: CONFIRMED (4 occurrences in dist)
- `prefers-reduced-motion` guard: CONFIRMED (2 occurrences)
- `IntersectionObserver`: CONFIRMED (5 occurrences)
- No `opacity:0` inline styles (no section permanently hidden): CONFIRMED
- `noindex` meta present (NOINDEX=true build): CONFIRMED
- Zero `googleapis`/`gstatic` references: CONFIRMED

## Task Commits

1. **Task 1: site.ts + FooterSection + TracksSection links from data** — `3d8e685` (feat)
2. **Task 2: LessonsModal + fake submit + global animations + Layout** — `7a1375a` (feat)
3. **Task 3: Checkpoint (Vercel visual verify)** — awaiting Vercel deploy

## lessons.jpg Background Approach

Used imported Astro asset: `import lessonsImg from '../assets/images/lessons.jpg'` then `lessonsImg.src` in the `style` attribute background-image. Astro runs lessons.jpg through the asset pipeline, outputs it at `/_astro/lessons.BmGQKHOr.jpg` (fingerprinted). The gradient overlay (`linear-gradient(180deg, rgba(10,8,9,0.82), rgba(10,8,9,0.9)), url(...)`) is byte-identical to draft line 333. No copy to `public/` needed.

## LessonsModal Placement

Rendered in `Layout.astro` (not `index.astro`) inside the root wrapper `<div>` after `<slot />`. This makes the modal available on any page using Layout, and keeps the JS IIFEs collocated with their markup without depending on `index.astro` document order.

## Phase 4 Placeholder Tracker

| Location | href | Action |
|----------|------|---------|
| streamingLinks (site.ts) — Яндекс Музыка | `#` | D-02: user supplies real Яндекс Музыка artist URL |
| streamingLinks (site.ts) — VK Музыка | `#` | D-02: user supplies real VK Музыка artist URL |
| streamingLinks (site.ts) — Apple Music | `#` | D-03: Phase 4 fills real Apple Music artist URL |
| socialLinks (site.ts) — VK | `#` | D-03: Phase 4 fills real VK community URL |
| socialLinks (site.ts) — Instagram | `#` | D-03: Phase 4 fills real Instagram profile URL |
| socialLinks (site.ts) — hello@brusnika.ru | `mailto:hello@brusnika.ru` | D-03: draft email (real band email TBD) |
| ShowsSection — Москва «16 тонн» | `#` | D-03: Phase 4 fills Timepad/Kassir URL |
| ShowsSection — Санкт-Петербург «Сердце» | `#` | D-03: Phase 4 fills Timepad/Kassir URL |
| ShowsSection — Казань Смена | `#` | D-03: Phase 4 fills Timepad/Kassir URL |
| ShowsSection — Екатеринбург Дом Печати | `#` | D-03: Phase 4 fills Timepad/Kassir URL |

## Phase 3 Handoff (LessonsModal → real booking endpoint)

When Phase 3 Telegram endpoint lands:
1. In `Layout.astro`, locate the `demoModal` IIFE's `form.addEventListener('submit', ...)` block
2. Replace the body with: `fetch('/api/book', { method: 'POST', body: new FormData(form) }).then(...)`
3. Delete `src/scripts/demo-modal.js` (the source reference file)
4. Optionally extract the wired IIFE into a proper Astro island with `client:load`

All other modal behavior (open/close/escape/click-outside) stays as-is.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused 'idx' variable in TracksSection.astro**
- **Found during:** Task 2 — `astro check` reported a TS hint about unused variable
- **Issue:** `tracks.map((t, idx) => ...)` — `idx` was declared but never used after the site.ts data refactor
- **Fix:** Changed to `tracks.map((t) => ...)`
- **Files modified:** src/components/TracksSection.astro
- **Committed in:** 7a1375a (Task 2 commit, included with the Task 2 changes)

No other deviations — plan executed as written.

## Known Stubs

None introduced. All sections render real band content.
- The lessons modal form is intentional throwaway scaffolding (D-05) — documented as such with Phase 3 cleanup instructions above.
- Placeholder `#` hrefs are tracked in the Phase 4 tracker table above.

## Threat Flags

No new threat surface beyond the plan's threat model.

| Status | Threat | Mitigation |
|--------|--------|------------|
| T-04-01 mitigated | Lessons-modal demo form input | Confirmed: demo submit handler calls e.preventDefault(), makes NO fetch/XHR; dist/index.html contains only comment references to fetch, no actual call |
| T-04-02 mitigated | target="_blank" footer/streaming/social/Timepad links | All carry rel="noopener noreferrer"; placeholder '#' hrefs have no target="_blank" |
| T-04-03 accepted | streamingLinks/socialLinks rendered as href | Values from build-time site.ts singleton; no user input; placeholders are '#'/known URLs only |

## Self-Check

### Verified Files Exist

- src/data/site.ts: FOUND
- src/components/FooterSection.astro: FOUND
- src/components/LessonsModal.astro: FOUND
- src/scripts/demo-modal.js: FOUND
- src/scripts/global-animations.js: FOUND
- src/layouts/Layout.astro (updated): FOUND
- src/components/TracksSection.astro (updated): FOUND
- src/pages/index.astro (updated): FOUND
- dist/_astro/lessons.BmGQKHOr.jpg: FOUND

### Verified Commits Exist

- 3d8e685: Task 1 — site.ts + FooterSection + TracksSection links from data (LINK-01/02)
- 7a1375a: Task 2 — LessonsModal + fake submit + global animations + Layout

## Self-Check: PASSED

---
*Phase: 01-foundation-static-site*
*Plan: 04*
*Completed: 2026-06-24*
