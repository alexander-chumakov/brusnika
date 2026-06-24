---
phase: 02-media-islands
plan: 03
subsystem: ui
tags: [photoswipe, lightbox, gallery, astro-islands, vite-bundling, image-metadata]

# Dependency graph
requires:
  - phase: 02-01
    provides: "gallery content collection with optional caption field (D-18 schema)"
provides:
  - "PhotoSwipe 5 fullscreen lightbox on the gallery grid (open/navigate/close)"
  - "Anchor-wrapped gallery items with full-res data-pswp-width/height from ImageMetadata"
  - "Dark/pink-themed lightbox chrome matching the site palette"
  - "Optional per-photo captions (D-18) as a legible bottom-center pill, hidden when absent"
affects: [03-sharing, 04-pre-launch]

# Tech tracking
tech-stack:
  added: [photoswipe@5.4.4 (already in package.json; first real use)]
  patterns:
    - "PhotoSwipe init in a STANDARD bundled <script> (no is:inline) so Vite bundles photoswipe/style.css"
    - "data-pswp-width/height sourced from import.meta.glob ImageMetadata (full-res, not thumbnail)"
    - "uiRegister custom-caption element reads .hidden-caption-content span on the change event"

key-files:
  created:
    - .planning/phases/02-media-islands/02-03-SUMMARY.md
  modified:
    - src/components/GallerySection.astro
    - src/content/gallery/01-studio.json
    - src/content/gallery/05-live.json

key-decisions:
  - "PhotoSwipe initialized via a standard bundled <script> (not is:inline) — the documented Astro/Vite pitfall (#11035) that otherwise silently drops the CSS import in the Vercel production build"
  - "Caption rendered as a bottom-center dark pill with a scrim (rgba(0,0,0,0.55)+blur) after user feedback that low-contrast captions were unreadable over photos"
  - "Caption element hidden entirely (display:none) when a photo has no caption, so captionless photos show counter only (D-18 optional behavior)"

patterns-established:
  - "Lightbox-on-static-grid: keep the prerendered grid, wrap items in <a>, attach PhotoSwipe in a bundled script — no client: directive needed on the component"
  - "Caption legibility: text-over-photo needs a semi-transparent dark scrim + bright text, not a muted color"

requirements-completed: [GAL-01, GAL-02, GAL-03]

# Metrics
duration: ~95min
completed: 2026-06-24
---

# Phase 02 Plan 03: Gallery Lightbox Summary

**PhotoSwipe 5 fullscreen lightbox on the gallery grid — click-to-open, arrow/keyboard/swipe navigation with an N/M counter, three close methods, dark/pink theme, and legible optional per-photo captions (D-18), all bundled production-safe (no is:inline pitfall).**

## Performance

- **Duration:** ~95 min (includes a post-checkpoint caption-legibility feedback round)
- **Started:** 2026-06-24T19:19:17Z
- **Completed:** 2026-06-24T20:52:24Z
- **Tasks:** 2 auto tasks + 1 human-verify checkpoint (approved)
- **Files modified:** 3

## Accomplishments

- Existing static gallery grid now opens any of the 5 photos fullscreen via PhotoSwipe 5 (GAL-01).
- Native PhotoSwipe navigation: on-screen arrows, keyboard left/right, mobile swipe, and an always-visible "N / M" counter (GAL-02).
- Three close methods — × button, Escape, click-outside (GAL-03).
- Lightbox chrome themed to the site's dark/pink palette (`--pswp-bg: #000`, light icons, pink error color).
- Optional D-18 captions wired end-to-end; 2 of 5 photos carry real captions, 3 carry none (proves the optional behavior).
- PhotoSwipe CSS confirmed bundled in the production build output — the documented Astro/Vercel `is:inline` pitfall (#11035) avoided.

## Task Commits

Each task was committed atomically (all with hooks, no `--no-verify`):

1. **Task 1: Anchor-wrap grid + initialize PhotoSwipe 5 (dark/pink theme + caption wiring)** — `f3ce594` (feat)
2. **Task 2: Add real captions to 2 gallery photos + fix TS strict-null errors** — `6df279d` (feat)
3. **Post-checkpoint fix: legible captions (bottom pill, high contrast, hide when empty)** — `6bb8818` (fix)

**Plan metadata:** committed separately with this SUMMARY + STATE/ROADMAP tracking.

_Task 3 in the plan was a `checkpoint:human-verify` (browser test) — the user approved the lightbox including the legibility fix._

## Files Created/Modified

- `src/components/GallerySection.astro` — Added `id="gallery-grid"`; wrapped each grid item in an `<a>` with `href` (full-res src), `data-pswp-width`/`data-pswp-height` (from `import.meta.glob` ImageMetadata — full-res, not thumbnail), and `data-pswp-caption`; added a hidden `.hidden-caption-content` span when a caption exists; added a standard bundled `<script>` initializing `PhotoSwipeLightbox` against `#gallery-grid a` with `pswpModule: () => import('photoswipe')`, `arrowKeys`/`escKey`, and a `uiRegister` `custom-caption` element; added a `<style is:global>` block with the dark/pink PhotoSwipe theme variables and the caption pill styling.
- `src/content/gallery/01-studio.json` — Added caption "студия, Москва" (D-18).
- `src/content/gallery/05-live.json` — Added caption "концерт в Москве" (D-18).

## Decisions Made

- **Standard bundled `<script>` (not `is:inline`):** The known Astro/Vite pitfall (#11035) is that `is:inline` bypasses Vite, so `import 'photoswipe/style.css'` is silently dropped and the lightbox renders unstyled on the Vercel production build. Using a standard `<script>` lets Vite bundle the CSS. Confirmed: `pswp__custom-caption` and PhotoSwipe core CSS appear in `dist/_astro/*.css`.
- **`data-pswp-width/height` from ImageMetadata:** Used the full-resolution dimensions from the eager glob import (Pitfall 4) so PhotoSwipe zoom/close animations target the correct aspect ratio.
- **Caption as a bottom-center dark pill (post-checkpoint):** Initial caption used `var(--color-text-muted)` with no backing and no fixed position — user reported it was very hard to find and blended into photos. Redesigned to a fixed bottom-center pill (`position:absolute; left:50%; bottom:24px; transform:translateX(-50%)`) with a scrim (`rgba(0,0,0,0.55)` + `backdrop-filter: blur(4px)`), bright text (`#f2f0ee`, 14.5px, centered), and pill `border-radius`.
- **Hide caption element when empty:** The `uiRegister` change handler sets `el.style.display = text ? 'block' : 'none'` so captionless photos show no empty pill — counter only (D-18).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript strict-null errors on PhotoSwipe handles**
- **Found during:** Task 2 (`npx astro check` verification)
- **Issue:** `lightbox.pswp` and `pswp.currSlide` are typed as possibly-undefined (PhotoSwipe 5 types); strict mode raised `ts(18048)` (3 errors).
- **Fix:** Added optional chaining — `lightbox.pswp?.ui?.registerElement(...)` and `pswp.currSlide?.data.element`.
- **Files modified:** src/components/GallerySection.astro
- **Verification:** `npx astro check` → 0 errors.
- **Committed in:** `6df279d` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug). One additional **post-checkpoint user-feedback fix** (caption legibility, `6bb8818`) — not a deviation, but a change requested by the user at the verify gate before approval.
**Impact on plan:** Auto-fix was necessary for the build to typecheck clean. No scope creep; the lightbox feature set matches the plan.

## Issues Encountered

- Captions were unreadable in the first checkpoint pass (low contrast, no backing, ambiguous position). Resolved with the bottom-pill scrim redesign in `6bb8818`; user then approved.

## Pitfall 1 Outcome (CSS bundling)

PASS. PhotoSwipe CSS bundled correctly because the init script is a standard `<script>` (no `is:inline`). Verified by grepping `dist/_astro/*.css` for `pswp__custom-caption` / `pswp` after `npm run build`. The lightbox renders dark (not the default light blue) — the practical confirmation that the CSS import survived the production build.

## User Setup Required

None — no external service configuration. All gallery images are local Astro-optimized assets served same-origin.

## Next Phase Readiness

- Gallery lightbox capability complete; GAL-01..03 satisfied.
- Remaining in Phase 2: Plan 02-04 (video section / clips) if not already done.
- Phase 3 (sharing) can reference the same anchor-wrapping pattern if photo-share is ever added.

## Self-Check: PASSED

- `src/components/GallerySection.astro` — FOUND
- `src/content/gallery/01-studio.json` — FOUND (caption present)
- `src/content/gallery/05-live.json` — FOUND (caption present)
- Commit `f3ce594` — FOUND
- Commit `6df279d` — FOUND
- Commit `6bb8818` — FOUND
- `npm run build` — PASSED (exit 0)

---
*Phase: 02-media-islands*
*Completed: 2026-06-24*
