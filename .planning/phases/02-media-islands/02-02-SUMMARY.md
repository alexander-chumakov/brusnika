---
phase: 02-media-islands
plan: 02
subsystem: ui
tags: [astro-island, html5-audio, vanilla-js, vercel-blob-cdn, web-animations, css-keyframes]

# Dependency graph
requires:
  - phase: 02-01
    provides: 6-track collection with real audioUrl CDN fields (Vercel Blob), HTTP 206 range support
provides:
  - AudioPlayer.astro island — real HTML5 audio playback (single <audio>, src swap)
  - Now-playing bar with play/pause, next, auto-advance (fade + gap), buffering state, × dismiss
  - Hero «слушать» CTA wired to start track 01 (start-only, fade transition)
  - Desktop volume control (mute toggle, live volume, sessionStorage, SVG icons, desktop-only)
  - Brusnika "play" animation — branded berry shower on hero-start (final form)
  - Demo player removed (demo-player.js deleted, demo IIFE + markup gone from TracksSection)
affects: [03-share-stories, video-section, gallery-lightbox]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Astro island via standard <script> (Vite-bundled, no is:inline) with client:idle"
    - "Single <audio> element + src swap (one stream at a time)"
    - "data-* attribute bridge from static markup to JS island (data-audio-url, data-play-first)"
    - "is:global <style> for JS-created (document.body-appended) particle nodes"

key-files:
  created:
    - src/components/AudioPlayer.astro
  modified:
    - src/components/TracksSection.astro
    - src/components/HeroSection.astro
    - src/pages/index.astro
    - src/styles/global.css
    - astro.config.mjs
  deleted:
    - src/scripts/demo-player.js

key-decisions:
  - "Single <audio> element with src swap (Pattern 2) — structurally prevents concurrent streams (AUD-03)"
  - "Standard bundled <script> (no is:inline) so Vite/TypeScript work — Pitfall 1"
  - "Audio src is the Vercel Blob CDN data-audio-url only — never repo/serverless (AUD-05, D-01)"
  - "Volume control desktop-only — iOS ignores programmatic audio.volume"
  - "Brusnika animation triggers only on the hero «слушать» START transition (not pause/track-click/auto-advance)"
  - "Bloom styles is:global because particles are created in JS and appended to document.body"
  - "Astro dev toolbar disabled in astro.config.mjs (devToolbar.enabled=false)"

patterns-established:
  - "Pattern: vanilla-JS audio island with bar-state machine (loading/playing/paused/error)"
  - "Pattern: no-flash particle guarantee — keyframe 0% off-screen+opacity0 with fill both"

requirements-completed: [AUD-01, AUD-02, AUD-03, AUD-04, AUD-05]

# Metrics
duration: ~80min
completed: 2026-06-24
---

# Phase 2 Plan 02: Real Audio Player Island Summary

**AudioPlayer.astro — a vanilla-JS Astro island delivering real CDN-backed audio (play/pause, switch, auto-advance with fade/gap, buffering, dismiss), plus a hero «слушать» play CTA, a restyled desktop volume control, and a branded brusnika berry "play" animation.**

## Performance

- **Duration:** ~80 min (including multiple post-approval enhancement rounds)
- **Tasks:** 2 auto build tasks + checkpoint verification + 11 approved post-checkpoint enhancement/refinement rounds
- **Files modified:** 5 modified, 1 created, 1 deleted

## Accomplishments

- **Real audio playback (AUD-01..05):** clicking any of the 6 curated tracks plays it from the Vercel Blob CDN; sticky now-playing bar shows title, animated EQ, and "трек NN / 06" index.
- **Playback controls (D-09/D-10):** click playing track → pause; click again → resume from position; click different track → switch (only one plays at a time); bar play/pause + → next controls.
- **Auto-advance (D-07/D-08):** on `ended`, next track plays after a ~1.5s gap with a 0.4s volume fade-out; stops after the last track (no loop).
- **Buffering state (D-11):** "загружается…" label + pulsing EQ while a track loads from the CDN.
- **Dismiss (D-12):** × stops playback (pause before clearing src) and hides the bar.
- **Demo player removed:** deleted `src/scripts/demo-player.js`, the demo `<script is:inline>` IIFE, the old now-playing markup, and now-playing CSS from TracksSection.
- **Hero «слушать» CTA:** starts track 01 through the same code path as the track list (identical fade), prevents the `#music` scroll jump; start-only (does not bloom/restart on the pause toggle).
- **Desktop volume control:** range slider + SVG speaker/mute icons (no emoji), styled to the dark/pink design; `userVolume` (default 1, sessionStorage-persisted) drives all fade/restore points; mute toggle restores the prior level; live volume during playback; hidden on mobile (≤860px).
- **Brusnika "play" animation (final form):** triggered only on the hero «слушать» start transition; ~18–24 real `/favicon.svg` berries scatter in (varied start time over ~1.2s starting at 0, and varied start height −10vh…−35vh so they never drop as one rank); organic balloon-ish descent with gentle sway and lazy tumble; softly settle on the now-playing bar and fade out individually/staggered; no-flash guarantee (keyframe 0% off-screen + opacity 0, fill both); `prefers-reduced-motion` skip (JS early-return + CSS `display:none`); `pointer-events:none` overlay; self-removing nodes.

## Task Commits

Built tasks committed atomically, then a series of approved post-checkpoint enhancements:

1. **Task 1: Build AudioPlayer.astro island** — `add81b4` (feat)
2. **Task 2: Wire TracksSection + index.astro; delete demo player** — `e7e5492` (feat)

**Post-checkpoint approved enhancements:**

3. **Hero «слушать» CTA starts track 01 with fade** — `ecf44dd` (feat)
4. **Desktop volume control** — `1970f98` (feat)
5. **Calm brusnika animation (initial)** — `0bfa6cb` (feat)
6. **Make bloom styles global so animation renders** — `635afdd` (fix)
7. **Restyle volume control (SVG icons, no emoji)** — `ba6acf0` (style)
8. **Disable Astro dev toolbar** — `21f34fd` (chore)
9. **Animation iterations** (cascade → snowfall → balloons → snowflake → settle-on-player → synchronized fade → simplified → organic) — `c10f368`, `fd6afd7`, `e9ca30a`, `203720b`, `c888f86`, `a1033ac`, `caf3537`, `fc916ca`, `8001ec1` (feat/fix)
10. **Scatter berry emergence (final form)** — `9be0d9c` (feat)

_Build verified green (`npm run build` exit 0) after each change._

## Files Created/Modified

- `src/components/AudioPlayer.astro` — created: real audio island (single `<audio>`, bar-state machine, D-07..D-12, volume control, brusnika animation). Bloom styles in an `is:global` block.
- `src/components/TracksSection.astro` — modified: `data-audio-url` added to track buttons; demo markup/CSS/IIFE removed.
- `src/components/HeroSection.astro` — modified: `data-play-first` attribute on the «слушать» CTA.
- `src/pages/index.astro` — modified: `<AudioPlayer client:idle />` rendered after `<TracksSection />`.
- `src/styles/global.css` — modified: `.track--playing` active-row visual.
- `astro.config.mjs` — modified: `devToolbar: { enabled: false }`.
- `src/scripts/demo-player.js` — deleted.

## Decisions Made

- Single `<audio>` + src swap (not one element per track) — prevents concurrent streams (AUD-03, threat T-02-04).
- Standard bundled `<script>` (no `is:inline`) so Vite bundles and TypeScript works (Pitfall 1).
- Audio `src` comes only from the build-time-validated `data-audio-url` CDN URL — never repo/serverless (AUD-05, D-01; threat T-02-05 accepted).
- Volume control desktop-only because iOS Safari ignores programmatic `audio.volume`.
- Brusnika animation fires only on the hero start transition; bloom CSS is `is:global` because particles are JS-created and appended to `document.body` (the scoped-CSS bug, fixed in `635afdd`).
- Astro dev toolbar disabled in local dev (`astro.config.mjs`).

## Deviations from Plan

The two planned tasks executed as written. Substantial **approved, user-driven enhancements** were added after the Task 3 human-verify checkpoint (the user approved the player, then requested additions/iterations):

- **[Enhancement] Hero «слушать» play CTA** — wired to the island via `data-play-first`; start-only guard added.
- **[Enhancement] Desktop volume control** — added, then restyled with inline SVG icons.
- **[Enhancement] Brusnika "play" animation** — iterated extensively to the user's taste (final: scattered organic berry-fall settling on the bar with staggered fades).
- **[Rule 1 - Bug] Bloom styles not rendering** — `.bloom-berry` lived in scoped `<style>` but nodes are appended to `document.body` (no scope hash) → invisible. Fixed by moving to `<style is:global>` (`635afdd`).
- **[Chore] Dev toolbar disabled** (`21f34fd`).

**Impact:** No scope creep on the core audio requirements; all additions are user-approved UX polish on top of the delivered AUD-01..05 functionality.

## Issues Encountered

- **Scoped CSS vs. JS-created nodes:** bloom particles appended to `document.body` did not receive Astro's scope hash → styles didn't apply. Resolved by switching the bloom block to `is:global`.
- **Animation flash-on-player:** an early multi-animation approach with `fill: both` rendered staggered berries at their landing spot during their delay. Resolved with a single per-berry timeline whose first and last keyframes are both `opacity 0` (no-flash guarantee).
- **iOS volume:** programmatic `audio.volume` is ignored on iOS Safari → the volume control is desktop-only by CSS.

## User Setup Required

None — no external service configuration required for this plan (CDN URLs were provisioned in Plan 02-01).

## Next Phase Readiness

- Core "the music must play" value is delivered: visitors can play, control, and flow through the 6 tracks from the CDN.
- iOS seek (AUD-05 / HTTP 206) was the riskiest criterion — verified at the human-verify checkpoint.
- VideoSection and the GallerySection lightbox (Plan 02-03, partially landed) build on the same island/`<script>` patterns established here.
- The video share-slot and the `data-clip-*` hooks remain for Phase 3 (SHARE-01/02/03); the brusnika animation primitives could be reused there.

## Self-Check: PASSED

- All key files confirmed present; `src/scripts/demo-player.js` confirmed deleted.
- Key commits confirmed in git history: `add81b4`, `e7e5492`, `ecf44dd`, `1970f98`, `635afdd`, `ba6acf0`, `21f34fd`, `9be0d9c`.
- `npm run build` passes (exit 0).

---
*Phase: 02-media-islands*
*Completed: 2026-06-24*
