---
quick_id: 260626-krg
slug: redo-releases-section-as-hero-slideshow
type: quick
completed: 2026-06-26
duration_minutes: 12
tasks_completed: 3
files_changed: 2
commits:
  - d59c48a
  - "2126035"
---

# 260626-krg: Redo Releases Section as Hero Slideshow

**One-liner:** Replaced the wrong 18-card horizontal carousel with the canonical 3-slide hero slideshow (year selector, progress bars, 6 s autoplay, prev/next arrows) from the main handoff design.

## What Was Built

### Task 1 — releases.ts (d59c48a)
- Deleted the 18-item `Release[]` array and `Release` interface
- Exported new `ReleaseSlide` interface (year, eyebrow, title, desc, ctaLabel, meta, image: ImageMetadata, imagePosition, url)
- Exported `releaseSlides: ReleaseSlide[]` with exactly 3 entries, newest-first:
  - Slide 0: 2026 · Доодури · band-table.jpg (object-position center 32%)
  - Slide 1: 2025 · Преисполненный · g-guitar.jpg (object-position center 42%)
  - Slide 2: 2024 · Неоднозначное · featured.jpg (object-position center 42%)
- All 3 CTA URLs → Spotify artist page (per-release deep-links deferred — see Known Stubs)

### Task 2 — ReleasesSection.astro (2126035)
- Full rewrite from card carousel to 3-slide hero banner
- **Header row:** mono "релизы" eyebrow + Prata italic accent year button + ▾ caret (rotates on open) + dropdown listing 2026/2025/2024 with active styling
- **Dropdown:** `position: absolute`, `var(--color-bg)` background, `var(--color-border-strong)` border, box-shadow, full-screen invisible overlay for outside-click close
- **Hero banner** (id="rel-banner"): `border-radius: 5px`, `overflow: hidden`, flex slide track with `transition: transform .6s cubic-bezier(.16,.7,.2,1)`
- **Per slide:** astro:assets `<Image>` (widths [768,1180], webp, quality 85) absolutely fills slot; left→right gradient overlay; content block (max-width 600px) with eyebrow / Prata h2 / desc / CTA link + meta span
- **Progress bars:** 3 x 3 px `rgba(255,255,255,0.28)` track + white `.rel-seg-fill` animated by `@keyframes fillbar` (0→100% in 6000 ms); reflow trick triggers restart on each slide change
- **Arrows:** 46 px round buttons, `backdrop-filter: blur(6px)`, pink hover
- **JS state machine:** vanilla, no library; `current` index; `render()` moves track + updates year label + ARIA + segment fills; `startAutoplay()` / `stopAutoplay()` around `setInterval`; pause on `mouseenter`, resume on `mouseleave`; manual nav restarts timer; `prefers-reduced-motion` guard skips autoplay and fill animation
- Section keeps `id="music"` for Nav anchor

### Task 3 — index.astro (no change)
- Verified: `<ReleasesSection />` already in correct position between `<MarqueeSection />` and `<TracksSection />` — no change needed
- `npm run build` passed with zero errors; 36 image variants generated

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| All 3 CTA `url` values point to the Spotify artist page, not per-release | src/data/releases.ts | Band has not provided per-release Spotify/Apple/Яндекс URLs. Deferred per site.ts convention. |

## Threat Flags

None — no new network endpoints, auth paths, or trust-boundary surface introduced.

## Self-Check

- [x] `src/data/releases.ts` exists and exports `ReleaseSlide` + `releaseSlides` (3 entries)
- [x] `src/components/ReleasesSection.astro` rewrites the hero slideshow, retains `id="music"`
- [x] `src/pages/index.astro` unchanged — ReleasesSection wired between Marquee and Tracks
- [x] `npm run build` completed — "Complete!" with zero errors
- [x] Commits d59c48a and 2126035 verified in git log

## Self-Check: PASSED
