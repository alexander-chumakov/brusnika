---
quick_id: 260626-ld1
slug: full-discography-year-filter
phase: quick
type: quick
completed: 2026-06-26
duration_minutes: 12
tasks_completed: 3
tasks_total: 3
files_modified: 2
files_key:
  - src/data/releases.ts
  - src/components/ReleasesSection.astro
commits:
  - hash: 0e87e26
    message: "feat(260626-ld1): expand releases.ts to full 19-release discography 2021–2026"
  - hash: b1cb058
    message: "feat(260626-ld1): rework ReleasesSection for year-filtered full discography"
---

# Quick 260626-ld1: Full Discography in Releases Section with Year Filter — Summary

Expanded the releases hero slideshow from 3 hardcoded slides to the band's full real
discography (19 releases, 6 years, 2021–2026) with a strict per-year filter: selecting a
year shows only that year's slides; arrows and autoplay are scoped entirely within the
active year.

## What was built

### Task 1 — Rewrite releases.ts (commit 0e87e26)

- Replaced the old `ReleaseSlide` interface (required `image`, required `desc`, `ctaLabel`)
  with a new `Release` interface where `image`, `desc`, and `imagePosition` are all optional.
- Added all 19 releases newest-first across 6 years. Only 3 carry ESM image imports
  (`bandTableImg`, `gGuitarImg`, `featuredImg`). The remaining 16 have no `image` field and
  render as placeholder tiles.
- Retained the `SP` Spotify artist-page constant; all `url` fields point to it.

### Task 2 — Rework ReleasesSection.astro (commit b1cb058)

**Data grouping (frontmatter):**
- `years = [...new Set(releases.map(r => r.year))].sort().reverse()` → `["2026","2025","2024","2023","2022","2021"]`
- `byYear` maps each year to its items array.
- `yearCountsMap` (Record<string,number>) is passed via `define:vars` to the inline script.

**Markup:**
- One `.rel-year-panel[data-year="{year}"]` per year inside `#rel-banner`. Only the first
  (2026) is visible on load; the rest have `display:none`.
- Each panel contains its own `.rel-track` (a flex strip of slides).
- Photo slides render `<Image>` + gradient overlay + white content block.
- Placeholder slides render a diagonal stripe tile:
  `repeating-linear-gradient(135deg, var(--rel-a) 0 15px, var(--rel-b) 15px 30px)`
  plus a soft pink radial glow and a small accent dot. A `.rel-slide-content--placeholder`
  modifier overrides title color to `var(--rel-fg)` and meta/desc to theme tokens, so
  both day (cream stripes, brown text) and night (dark stripes, off-white text) read cleanly.
- `#rel-progress` is an empty container; JS rebuilds the segments on every year change.
- Year dropdown lists all 6 years (not a fixed 3); JS highlights the active one.

**JS state machine (inline, no TypeScript syntax):**
- `activeYearIdx` + `slide` track position. `switchYear(idx)` hides the old panel, shows
  the new one, resets `slide = 0`, rebuilds dots, and restarts autoplay.
- `prevBtn` / `nextBtn`: `slide` changes modulo `activeCount()` — arrows can never cross
  into another year.
- Autoplay: 6 s `setInterval` within the active year. Skipped if the year has only 1 item.
  Pauses on `mouseenter`, restarts on `mouseleave` and on manual navigation.
- `prefers-reduced-motion`: no autoplay, no fill animation; arrows still work.
- Existing `@keyframes fillbar` and all visual styles are preserved.

### Task 3 — Build verify

`npm run build` completed with zero errors. 36 optimised WebP images generated. Pre-existing
warnings (`AudioPlayer`/`VideoSection` client directive on Astro components; Node 25 vs
Vercel 24) are unrelated to this change.

## Data assumptions — please confirm

The following data decisions were made based on the PLAN. Please review and correct if needed:

1. **Release count is 19, not 18.** The plan title says "18-release discography" but the
   item list in the plan data section totals 19 releases (3+6+3+2+3+2). All 19 are
   included as listed. If one release should be removed or combined, let me know which.

2. **2022/2023 split.** Занавес, Осколки, Божья Коровка are assigned to 2022; Развлечение
   and Пари to 2023. Confirm this split is correct.

3. **Year-only dates for most releases.** Releases without a specific date use `meta`
   strings like "сингл · 2025". Only the 3 photo releases and a handful of others have
   specific dates. This is intentional per the plan data; update `meta` strings in
   `releases.ts` whenever precise dates are known.

4. **Per-release Spotify URLs.** All 19 releases link to the same Spotify artist page.
   Per-release deep-links are deferred until the band confirms canonical URLs.

## Known Stubs

- All 19 `url` values point to the Spotify artist page, not per-release Spotify URLs.
  These are intentional stubs; per-release links will be filled in when the band provides
  them. The CTA "▶ слушать" is correct and functional (opens Spotify artist page).

## Deviations from Plan

None — plan executed exactly as written, with one data observation:

**[Observation] Release count 19 vs plan-stated 18** — The plan DATA is the authority (the
"18" in the title appears to be a counting error). All 19 releases from the data section
were implemented as-is.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes.
Static HTML only; the booking API route is unchanged.

## Self-Check

- [x] `src/data/releases.ts` exists and exports `releases: Release[]` with 19 items
- [x] `src/components/ReleasesSection.astro` exists with year panel structure
- [x] `npm run build` completed with zero errors
- [x] Commits 0e87e26 and b1cb058 exist in git log
- [x] 3 photo releases render `<Image>` + gradient; 16 placeholder-only releases render striped tile
- [x] Year selector has 6 options (2026–2021)
- [x] `--rel-a`, `--rel-b`, `--rel-fg` tokens reused from global.css (not redefined)
- [x] `id="music"` preserved; TracksSection untouched
- [x] No Google Fonts added

## Self-Check: PASSED
