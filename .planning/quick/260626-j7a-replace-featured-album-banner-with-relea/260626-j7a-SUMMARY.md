---
phase: quick-260626-j7a
plan: "01"
subsystem: discography-carousel
tags: [releases, carousel, ui, data]
dependency_graph:
  requires: []
  provides: [ReleasesSection, releases-data]
  affects: [index.astro, global.css]
tech_stack:
  added: []
  patterns: [astro-island-inline-script, snap-scroll-carousel, --rel-* theme tokens]
key_files:
  created:
    - src/data/releases.ts
    - src/components/ReleasesSection.astro
  modified:
    - src/styles/global.css
    - src/pages/index.astro
  deleted:
    - src/components/FeaturedAlbumSection.astro
decisions:
  - "Used color-accent-deep (not color-accent) for eyebrow/type-year text so day-theme remains legible (#c95572 vs #f3a9bd)"
  - "Scrollbar hidden via scrollbar-width:none for cleaner look while keeping track scrollable"
  - "TypeScript <script> block (not plain JS) to match Astro conventions and get pointer-event types"
  - "Per-release Spotify/streaming links deferred: all 18 currently point to Spotify artist page"
metrics:
  duration: "~12 minutes"
  completed: "2026-06-26"
  tasks_completed: 3
  files_created: 2
  files_modified: 2
  files_deleted: 1
---

# Quick Task 260626-j7a: Replace Featured Album Banner with Releases Carousel — Summary

**One-liner:** Horizontally-scrolling Дискография carousel with 18 typed releases, striped placeholder tiles, and a featured.jpg cover card, replacing the single-album FeaturedAlbumSection banner.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create releases.ts data module + --rel-* theme tokens | 7b24b61 | src/data/releases.ts, src/styles/global.css |
| 2 | Create ReleasesSection.astro carousel component | 359813b | src/components/ReleasesSection.astro |
| 3 | Wire index.astro, delete FeaturedAlbumSection, build | 936e782 | src/pages/index.astro (delete FeaturedAlbumSection.astro) |

## What Was Built

- **`src/data/releases.ts`** — Typed `Release` interface + `releases` array of 18 entries in design source order, newest first. One entry (`Неоднозначное`) has `cover: true` mapping to featured.jpg; two entries (`Home Session`, `Live Урбан 2024`) have `live: true`.

- **`src/components/ReleasesSection.astro`** — Horizontally-scrolling carousel with:
  - Header row: `--font-mono` eyebrow «релизы» + `--font-serif` h2 + «слушать всё ↗» link + ← → arrow buttons.
  - Snap-scroll track (`scroll-snap-type: x mandatory`); cards are `clamp(208px, 56vw, 260px)` wide.
  - «Неоднозначное» renders `<Image>` from `featuredImg` (WebP, `object-position: center 42%`) with a bottom gradient and title overlay.
  - All other 17 cards render diagonal-striped placeholder tiles using `--rel-a/--rel-b` custom properties with a soft radial pink overlay, `--font-serif` title in `--rel-fg`, and an 8px accent dot top-left.
  - «● live» badge (blurred dark pill) on the two live releases.
  - Inline `<script>` wires ← → buttons and pointer-based drag-to-scroll.
  - Mobile breakpoint ≤860px reduces section and track padding.
  - `id="music"` + `scroll-margin-top: 70px` preserved — Nav «релизы» still jumps to the section.

- **`src/styles/global.css`** — Added `--rel-a`, `--rel-b`, `--rel-fg` to both `:root` (night) and `:root[data-theme="day"]` blocks.

- **`src/pages/index.astro`** — Swapped `FeaturedAlbumSection` import/usage for `ReleasesSection`. Updated doc-comment section-order note.

- **`src/components/FeaturedAlbumSection.astro`** — Deleted (fully replaced by ReleasesSection).

## Known Stubs / Deferred Items

**Per-release Spotify/streaming links deferred:** All 18 `url` values in `releases.ts` currently point to the Spotify artist page (`https://open.spotify.com/artist/11epkfgLUMWmXsTbgfPu4B`). This mirrors the site.ts deferral convention (placeholder '#' hrefs with inline comments). Replace individual release URLs when per-release Spotify/Apple Music/Яндекс Музыка links become available.

## Deviations from Plan

**1. [Rule 1 - Bug] Fixed TypeScript error in frontmatter doc-comment**
- **Found during:** Task 2 verify (`astro check`)
- **Issue:** The comment string `--color-*/--font-*` inside the `---` frontmatter caused TypeScript to parse `*` as a regex literal operator, producing 18 parse errors.
- **Fix:** Rewrote the comment line as plain English: "Uses project color and font CSS custom properties only (no raw design-file token names, no Google Fonts)".
- **Files modified:** src/components/ReleasesSection.astro
- **Commit:** 359813b (same task commit, fix applied before committing)

## Build Verification

`npm run build` completed successfully (exit 0). The only warning is the Node.js version advisory from `@astrojs/vercel` (local Node 25 vs Vercel's Node 24 runtime) — this is a pre-existing advisory unrelated to this task.

## Self-Check: PASSED

- src/data/releases.ts: FOUND
- src/components/ReleasesSection.astro: FOUND
- src/components/FeaturedAlbumSection.astro: CONFIRMED DELETED
- Commit 7b24b61: FOUND
- Commit 359813b: FOUND
- Commit 936e782: FOUND
