---
phase: 02-media-islands
plan: 04
subsystem: ui
tags: [astro, video, html5-video, carousel, scroll-snap, modal, custom-event, vercel-blob, cdn]

# Dependency graph
requires:
  - phase: 02-media-islands (02-01)
    provides: videos content collection + CDN-hosted clips/posters (Vercel Blob)
  - phase: 02-media-islands (02-02)
    provides: AudioPlayer island + now-playing bar (for cross-component pause coordination)
provides:
  - VideoSection.astro — «Смотрите и делитесь с друзьями» social-media clip section
  - Portrait 9:16 scroll-snap carousel of all 9 clips (touch-swipe + desktop arrows)
  - YouTube-Shorts-style centered enlarge modal (portaled to body, above the nav)
  - Decoupled brusnika:video-play CustomEvent → audio pauses when a clip plays
  - D-16 share-ready hooks (data-clip-url/title + reserved 44×44 slot) for Phase 3
  - "клипы" (#clips) nav link
affects: [phase-03-sharing, social-share, video]

# Tech tracking
tech-stack:
  added: []  # no new libraries — native HTML5 <video>, pure CSS scroll-snap (per CLAUDE.md "no heavy player libs")
  patterns:
    - "Native HTML5 <video controls playsinline preload=none> — no player library"
    - "Pure CSS scroll-snap carousel (scroll-snap-type: x mandatory) — no JS carousel lib"
    - "Portal-to-body for fixed overlays that must escape a section's stacking context"
    - "Decoupled cross-island coordination via document CustomEvent"

key-files:
  created:
    - src/components/VideoSection.astro
    - src/content/videos/05-igrok.json
    - src/content/videos/06-beznakazannym.json
    - src/content/videos/07-iva.json
    - src/content/videos/08-zavtra.json
    - src/content/videos/09-kazhetsya-akustika.json
  modified:
    - src/pages/index.astro
    - src/components/AudioPlayer.astro
    - src/components/Nav.astro
    - scripts/upload-media.sh
    - .planning/phases/02-media-islands/MEDIA-URLS.md

key-decisions:
  - "Clips are PORTRAIT 9:16 (social-media/Stories shape), not landscape (user feedback)"
  - "Carousel on ALL viewports (not desktop grid) — touch-swipe + ◂▸ desktop arrows (user feedback)"
  - "YouTube-Shorts centered CSS-overlay modal, NOT the browser Fullscreen API (user feedback)"
  - "Show all 9 clips, not the curated 4 (user feedback)"
  - "Audio pauses when a video starts via decoupled CustomEvent — no auto-resume on close"

patterns-established:
  - "Portal-to-body: fixed overlays inside a low-z section must be appended to <body> to beat the nav"
  - "Closed overlays must be fully inert (pointer-events:none + visibility:hidden), not just opacity:0"
  - "Cross-island messaging via document CustomEvent keeps components decoupled"

requirements-completed: [VID-01, VID-02, VID-03]

# Metrics
duration: 61min
completed: 2026-06-25
---

# Phase 2 Plan 04: Video Clip Section Summary

**Portrait 9:16 social-media clip carousel of all 9 CDN clips with a YouTube-Shorts-style centered enlarge modal (native HTML5 video, no library), that pauses the audio player when a clip plays.**

## Performance

- **Duration:** ~61 min
- **Started:** 2026-06-25T00:00:46+03:00
- **Completed:** 2026-06-25T01:01:52+03:00
- **Tasks:** 2 auto + 1 human-verify checkpoint (approved)
- **Files modified:** 11 (6 created, 5 modified)

## Accomplishments

- `VideoSection.astro` reads the `videos` collection and renders **all 9 clips** (Доодури, Кажется, Клуб Неоправданных Надежд, Занавес, Игрок, Безнаказанным, Ива, Завтра была зима, Кажется акустика) as **PORTRAIT 9:16 cards** in a horizontal **CSS scroll-snap carousel** — touch-swipe on mobile, ◂▸ scroll arrows on desktop. Each card shows a CDN poster + 64px play button. `preload="none"`; **no page autoplay** (VID-02).
- **YouTube-Shorts-style enlarge:** clicking a card opens a centered tall portrait `<video controls playsinline>` on a dimmed backdrop (a CSS overlay — **not** the browser Fullscreen API), plays on open; close via ×, Esc, or backdrop click (each stops + resets playback and restores body scroll). The modal is **portaled to `<body>`** (z-index 2000) so it sits above the fixed nav; the **closed modal is fully inert** (`pointer-events:none` + `visibility:hidden`) and never blocks the page; the **× button lives outside the video bounds** so it doesn't cover native controls.
- **Cross-component fix:** starting a video **pauses the audio player** — VideoSection dispatches a decoupled `brusnika:video-play` CustomEvent on the modal video's `play` event; AudioPlayer listens and calls a shared `pausePlayback()` helper (keeping the now-playing bar UI consistent: "на паузе", ▶ icon, EQ stops). One direction only; no auto-resume on close.
- **D-16 share-ready:** each card carries `data-clip-url` + `data-clip-title` and a reserved 44×44 bottom-right slot — no share button (Phase 3).
- **Content:** heading **"Смотрите и делитесь с друзьями"** (eyebrow "клипы"); a **"клипы"** nav link (`#clips`) added to `Nav.astro` after «релизы» (order: релизы → клипы → о группе → концерты → пойте с нами).
- **Media:** 5 additional posters extracted + uploaded to the CDN for the non-curated clips; `scripts/upload-media.sh` now covers all 9 posters; `MEDIA-URLS.md` updated.

## Task Commits

Atomic per-task + iterative user-feedback fixes:

1. **Task 1: Build VideoSection.astro** — `bee6d64` (feat)
2. **Task 2: Mount VideoSection in index.astro** — `c46db22` (feat)
3. **Rework: Shorts-style portrait enlarge modal** — `ec52af5` (feat)
4. **Fix: closed modal must not intercept page clicks** — `dd32ec6` (fix)
5. **Fix: move modal close button out of video bounds** — `7d3de19` (fix)
6. **Fix: portal modal to body so it sits above the nav** — `c77ed16` (fix)
7. **Feat: show all 9 clips** — `5dd3858` (feat)
8. **Content: heading "Смотрите и делитесь с друзьями" + клипы nav link** — `d097f08` (feat)
9. **Fix: pause audio player when a video clip plays** — `c38277c` (fix)

**Plan metadata:** committed separately with this SUMMARY + STATE/ROADMAP updates.

**Task 3** was a `checkpoint:human-verify` — the user tested the section on a real device on the deployed site and **approved** it.

## Files Created/Modified

- `src/components/VideoSection.astro` (created) — the clip section: 9-card portrait carousel, Shorts modal, audio-pause coordinator, D-16 hooks
- `src/content/videos/05-igrok.json` … `09-kazhetsya-akustika.json` (created) — 5 new collection entries (orders 5–9) with CDN video + poster URLs
- `src/pages/index.astro` (modified) — mounts `<VideoSection client:visible />` between AudioPlayer and AboutSection
- `src/components/AudioPlayer.astro` (modified) — extracted `pausePlayback()` helper; listens for `brusnika:video-play`
- `src/components/Nav.astro` (modified) — "клипы" (#clips) nav link
- `scripts/upload-media.sh` (modified) — poster extraction + upload now covers all 9 clips
- `.planning/phases/02-media-islands/MEDIA-URLS.md` (modified) — 5 new poster CDN URLs

## Decisions Made

- **Portrait 9:16, not landscape** — the clips are social-media/Stories format; landscape test clips center-crop (expected) and real vertical clips fill the frame.
- **Carousel on all viewports** (not a desktop grid) — matches the user's expectation; touch-swipe on mobile, ◂▸ arrows on desktop.
- **CSS-overlay Shorts modal, not the Fullscreen API** — clip plays inline-centered with dark side-margins on desktop / fills the screen on a phone; no whole-site fullscreen takeover.
- **All 9 clips shown** (not the curated 4) — all videos and posters already on the CDN.
- **Audio pauses when video plays**, via a decoupled CustomEvent; no auto-resume on close (user resumes manually).

## Deviations from Plan

The plan shipped the planned VideoSection (Tasks 1–2 exactly as written), then the human-verify checkpoint produced approved reworks. These were content/UX changes the user requested at the gate, plus correctness fixes (Rule 1) found while satisfying them.

### Auto-fixed Issues (Rule 1 — bugs found during checkpoint iteration)

**1. [Rule 1 - Bug] Closed modal intercepted all page clicks**
- **Found during:** Task 3 (human-verify) — headless test
- **Issue:** `.video-modal` was `display:flex; opacity:0` but `pointer-events:auto`, so the invisible full-viewport overlay blocked every page click from load; `hidden` attr was overridden by `display:flex`.
- **Fix:** Drive visibility off `[data-open]` with `pointer-events:none` + `visibility:hidden` when closed.
- **Committed in:** `dd32ec6`

**2. [Rule 1 - Bug] Close × overlapped native video controls**
- **Found during:** Task 3 (human-verify)
- **Issue:** × was `position:absolute` inside the stage (clipped by overflow), covering the volume control.
- **Fix:** Made × a sibling of the stage, `position:fixed` in the dimmed margin / corner with safe-area insets.
- **Committed in:** `7d3de19`

**3. [Rule 1 - Bug] Modal painted below the fixed nav (× unclickable)**
- **Found during:** Task 3 (human-verify) — headless `elementFromPoint` returned the nav
- **Issue:** Modal lived inside the section's low-z stacking context, so its z-index couldn't beat the root-context nav (z-index 50).
- **Fix:** Portal the modal to `<body>` on init; z-index 2000 (Astro scoped attribute moves with the node — verified in built HTML).
- **Committed in:** `c77ed16`

**4. [Rule 1 - Bug] Audio + video played simultaneously**
- **Found during:** Task 3 (human-verify) — user found on deployed site
- **Issue:** Starting a clip while music played left both playing.
- **Fix:** Decoupled `brusnika:video-play` CustomEvent → AudioPlayer `pausePlayback()` (reuses the bar's pause path; guarded no-op if already paused).
- **Committed in:** `c38277c`

### Approved content/UX reworks (requested at the checkpoint)

- Portrait 9:16 + carousel-on-all-viewports + Shorts modal — `ec52af5`
- Show all 9 clips — `5dd3858`
- Heading "Смотрите и делитесь с друзьями" + "клипы" nav link — `d097f08`

---

**Total deviations:** 4 Rule 1 bug fixes + 3 user-approved reworks at the human-verify gate.
**Impact on plan:** Core deliverable (VID-01..03) shipped as planned; the reworks/fixes refined UX and correctness without scope creep. The video data model, AudioPlayer core, gallery, and content schema were untouched except the additive audio-pause listener.

## Issues Encountered

None beyond the checkpoint-driven fixes documented above — all resolved and verified via `npx astro check` (0 errors) and `npm run build` after each change.

## User Setup Required

None — all media (9 videos + 9 posters) already on the Vercel Blob CDN; no new env vars or service config. `scripts/upload-media.sh` documents the reproducible upload for the record.

## Next Phase Readiness

- **Phase 3 (sharing) is unblocked:** each clip card already exposes `data-clip-url` + `data-clip-title` and a reserved 44×44 bottom-right slot — Phase 3 only needs to populate that slot with a share button (Web Share API + fallback links), no structural rebuild.
- The Shorts modal and audio-pause coordinator are stable and approved on a real device.

## Self-Check: PASSED

- All 6 created files verified present on disk (VideoSection.astro, 5 video JSON entries, this SUMMARY).
- All 9 key commits verified in git history (bee6d64, c46db22, ec52af5, dd32ec6, 7d3de19, c77ed16, 5dd3858, d097f08, c38277c).
- `npm run build` passes; `npx astro check` 0 errors.

---
*Phase: 02-media-islands*
*Completed: 2026-06-25*
