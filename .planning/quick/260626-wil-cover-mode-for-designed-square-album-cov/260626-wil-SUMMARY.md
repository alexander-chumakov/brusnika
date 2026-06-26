---
quick_id: 260626-wil
slug: cover-mode-album-covers
type: quick
phase: quick
plan: 260626-wil
subsystem: releases-section
tags: [releases, ui, cover-mode, album-art]
completed: 2026-06-26

dependency_graph:
  requires: []
  provides: [cover-mode-slide-variant]
  affects: [src/components/ReleasesSection.astro, src/data/releases.ts]

tech_stack:
  patterns:
    - Three-way conditional render branch in Astro (cover / photo / placeholder)
    - Blurred background via plain <img> with CSS filter:blur+scale, positioned absolutely
    - Sharp foreground via astro:assets <Image> with aspect-ratio:1/1 container

key_files:
  modified:
    - src/data/releases.ts
    - src/components/ReleasesSection.astro

decisions:
  - Used a plain <img src={item.image.src}> for the blurred background (decorative, no optimization needed at low resolution)
  - Used astro:assets <Image> for the sharp cover square (full optimization, correct srcset)
  - Responsive breakpoint at 760px (between 860px mobile breakpoint and 480px narrow breakpoint) for column layout

metrics:
  duration: ~8 minutes
  completed_date: 2026-06-26
  tasks_completed: 3
  files_modified: 2
---

# Quick 260626-wil: Cover Mode for Designed Square Album Covers

**One-liner:** Album-hero cover mode with blurred-darkened background and sharp uncropped square artwork for 3 releases (куда летят мысли?, неактуальное, Пари).

## What Was Built

Added a COVER mode slide variant to `ReleasesSection.astro` for releases whose artwork is a designed square cover. In cover mode the full square artwork is displayed uncropped as a crisp square beside the title/CTA text, while the same cover blurred+darkened fills the slide background for atmosphere.

The three target releases now render in cover mode:
- «куда летят мысли?» (2025, remix) — `kuda-letyat-mysli.png`
- «неактуальное» (2024, EP) — `neaktualnoe.jpg`
- «Пари» (2023, single) — `pari.jpg`

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 — releases.ts data | 62ea721 | Add cover?: boolean, import 3 assets, mark 3 entries |
| 2 — ReleasesSection COVER mode | eec27fa | Implement COVER branch + CSS + responsive |

## Implementation Details

### releases.ts (Task 1)
- Added `cover?: boolean` to `Release` interface (after `imagePosition?`)
- Imported `kudaLetyatMysliImg`, `neaktualnoeImg`, `pariImg` as ESM assets
- Set `image`, `cover: true`, and `desc` on the 3 entries; no `imagePosition` (cover mode shows full square, no crop position needed)
- Updated header comment: "13 releases carry artwork; 6 placeholders"

### ReleasesSection.astro (Task 2)
Render branch changed from binary `item.image ? PHOTO : PLACEHOLDER` to three-way:
1. `item.cover && item.image` → COVER
2. `item.image` → PHOTO (byte-for-byte unchanged)
3. else → PLACEHOLDER (byte-for-byte unchanged)

COVER mode structure:
- `<img class="rel-cover-bg">` — decorative blurred bg (plain img, `.src` attribute), `filter: blur(34px) brightness(0.5); transform: scale(1.12)` to prevent blurred-edge bleed
- `<div class="rel-cover-overlay">` — `linear-gradient(90deg, rgba(0,0,0,0.72)…)` for text contrast
- `<div class="rel-cover-row">` — foreground flex row: text block (left, flex:1) + sharp square (right, flex:0)
- Text block reuses existing `.rel-slide-eyebrow`, `.rel-slide-title`, `.rel-slide-desc`, `.rel-slide-actions`, `.rel-slide-cta`, `.rel-slide-meta` class names and exact "▶ слушать" CTA label
- Sharp square: `<Image>` from astro:assets, `aspect-ratio:1/1; height:clamp(190px,30vw,340px); border-radius:6px; overflow:hidden`

Responsive at ≤760px: column layout, `order:-1` on the square puts cover above text, smaller size `clamp(150px,42vw,210px)`.

### Build (Task 3)
`npm run build` — complete, zero errors. All 3 cover images processed to WebP at 2 srcset sizes each (small + large). Pre-existing warnings (AudioPlayer/VideoSection client directive warnings, Node.js version mismatch) are out of scope.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all 3 cover releases have real artwork, real Spotify URLs, and real descriptive text.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundary changes.

## Self-Check: PASSED

- [x] `src/data/releases.ts` — modified (cover?: boolean, 3 imports, 3 entries updated)
- [x] `src/components/ReleasesSection.astro` — modified (COVER branch + CSS)
- [x] Commit 62ea721 — exists
- [x] Commit eec27fa — exists
- [x] `npm run build` — Complete, zero errors
