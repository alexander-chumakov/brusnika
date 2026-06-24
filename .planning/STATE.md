---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: ready_to_plan
last_updated: 2026-06-24T22:32:43.971Z
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 8
  completed_plans: 8
  percent: 50
stopped_at: Phase 02 complete (4/4) — ready to discuss Phase 3
---

# Project State: внимание брусника! — Band Website

**Last updated:** 2026-06-25
**Updated by:** execute-plan (02-04 complete)

---

## Project Reference

**Core value:** A visitor can experience the band's music and world (listen, watch, look) and take a real action — book a lesson — all on one fast, beautiful page. If everything else fails, the music must play and the booking must reach Соня.

**Current milestone:** v1 — complete functional site (no CMS/admin)

---

## Current Position

Phase: 3
Plan: 4 of 4 complete (02-01 CDN/content + 02-02 audio player + 02-03 gallery lightbox + 02-04 video clip section)
**Plan:** Not started
**Status:** Ready to plan
**Progress:** [█████░░░░░] 50% (2 of 4 phases complete; 8 of 8 planned plans across Phases 1–2)

---

## Phase Summary

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation & Static Site | Not started |
| 2 | Media Islands | Not started |
| 3 | Sharing & Booking | Not started |
| 4 | Pre-Launch Verification | Not started |

---

## Performance Metrics

- Plans completed: 0
- Plans total: TBD (populated during plan-phase)
- Phases completed: 0 / 4
- Requirements mapped: 28 / 28

---

## Accumulated Context

### Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Astro 7 + output:static on Vercel (not hybrid — removed in Astro 7) | Static-first, minimal JS, clean v2 CMS path |
| Vercel Blob for media (audio/video) | Zero-friction for v1 scale; switch to Bunny.net if >5 GB/month egress |
| Self-hosted fonts via @fontsource | Google Fonts throttled/blocked for Russian ISPs |
| Env-var-gated noindex (NOINDEX=true) | Launch toggle is a Vercel dashboard action, not a code change |
| Telegram bot for booking delivery | Instant delivery, Russian-first UX, no inbox monitoring |
| Web Share API + platform fallbacks | Only realistic web mechanism for sharing to stories/feeds |
| Content Collections as v1→v2 seam | Loader swap in content.config.ts; zero component code changes for v2 |
| Use @fontsource/prata/400.css (explicit path) not bare import | Avoids TypeScript ts(2882) strict-mode error; functionally identical |
| Astro Sharp WebP generation confirmed for static builds (A1) | No extra astro.config.mjs settings needed — verified in build output |
| @supports gate for -webkit-text-stroke in MarqueeSection | Solid color fallback when browser lacks text-stroke support; extends 01-01 gradient-clip lesson |
| import z from 'astro/zod' (not 'zod') confirmed | Astro 7 bundles Zod 4; direct zod import risks version conflict (Pitfall 5) |
| is:inline on <script> BLOCK inlines content; is:inline on <script src=> does NOT | is:inline with src emits broken relative-path src= tag; content must be in the <script> block (A2 resolved) |
| Gallery dynamic images via import.meta.glob({ eager: true }) + default export | Only way to satisfy Astro <Image> ImageMetadata type requirement for filenames from JSON |
| lessons.jpg imported as Astro asset (not copied to public/) | Fingerprinted asset pipeline URL; no manual public/ management needed |
| .js-reveal added via render-blocking inline <script> in <head> | Prevents flash-then-hide — class must be set BEFORE first paint; prefers-reduced-motion skips it entirely |
| site.ts typed singletons drive all outbound links (LINK-01/02) | Single source of truth for Phase 4 placeholder fill-in; streamingLinks ordered Яндекс/VK first per LINK-01 |
| LessonsModal placed in Layout.astro (not index.astro) | Available globally on any Layout-using page; keeps IIFEs co-located with markup |
| PhotoSwipe init in a standard bundled <script> (never is:inline) | is:inline bypasses Vite so photoswipe/style.css is silently dropped on the Vercel prod build (#11035); standard script bundles the CSS — verified in dist/_astro/*.css |
| Lightbox captions = bottom-center dark pill (scrim + bright text), hidden when empty | Muted no-backing captions were unreadable over photos (user feedback); text-over-photo needs a semi-transparent scrim; D-18 captionless photos show counter only |
| Video clips are PORTRAIT 9:16 in a carousel on ALL viewports (not landscape grid) | Clips are social-media/Stories format (user feedback); touch-swipe on mobile + ◂▸ arrows on desktop via pure CSS scroll-snap, no JS carousel lib |
| Video enlarge = centered CSS-overlay Shorts modal, NOT the browser Fullscreen API | User didn't want a whole-site fullscreen takeover; centered tall portrait <video> on a dimmed backdrop, plays on open, close via ×/Esc/backdrop |
| Fixed overlays inside a section MUST be portaled to <body> to beat the nav | A section establishes a low-z stacking context, so an inner modal's z-index can't beat the root-context nav (z-index 50); appendChild to body + z-index 2000. Astro scoped data-astro attr moves with the node |
| Closed overlays must be inert via pointer-events:none + visibility:hidden (not just opacity:0) | opacity:0 still captures clicks — an invisible display:flex overlay blocked the whole page; the `hidden` attr is overridden by display:flex |
| Cross-island coordination via document CustomEvent (brusnika:video-play) | Pausing audio when a video plays without tightly coupling the two islands; AudioPlayer reuses its pausePlayback() so the now-playing bar UI stays consistent; one direction only, no auto-resume |

### External Prerequisites

| Prerequisite | Needed For | Status |
|-------------|-----------|--------|
| Telegram bot created by Соня via @BotFather | Phase 3 — BOOK-02 | Pending |
| Соня's Telegram chat ID | Phase 3 — BOOK-02 | Pending |
| Real audio .mp3 files from band | Phase 2 — AUD-01–05 | Confirm with band |
| Real video .mp4 file from band | Phase 2 — VID-01–03 | Confirm with band |
| Short shareable clip .mp4 files (~15–30s) | Phase 3 — SHARE-01 | Confirm with band |
| Real URLs for # placeholder links | Phase 4 verification | Confirm with band (Apple Music, VK Music, ticket links) |

### Architecture Notes

- `src/content.config.ts` is the v1→v2 CMS seam — never bypass getCollection()
- Never serve audio/video through serverless functions (4.5 MB cap, no Accept-Ranges)
- `TELEGRAM_BOT_TOKEN` — no PUBLIC_ prefix; server-side only in src/pages/api/book.ts
- Island hydration: AudioPlayer/VideoPlayer/BookingModal → client:idle; Lightbox/ShareButton → client:visible
- VK and Telegram are primary social channels; Instagram is footer-only (blocked in Russia since 2022)

### Blockers

None currently.

### Todos

- Deploy Phase 01 to Vercel preview for human visual verification (Plan 04 checkpoint)
- Confirm real media files are available from band before starting Phase 2
- Obtain Telegram bot credentials from Соня before starting Phase 3
- Collect real URLs for all # placeholder links before Phase 4 (full tracker in 01-04-SUMMARY.md)

---

## Session Continuity

**To resume:** Read `.planning/ROADMAP.md` for phase goals and `.planning/REQUIREMENTS.md` for requirement details. Check Current Position above for active phase. Run `/gsd:plan-phase 1` to begin planning Phase 1.

---
*State initialized: 2026-06-24 after roadmap creation*
