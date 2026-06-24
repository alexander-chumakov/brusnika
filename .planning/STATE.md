---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-06-24T16:53:37.779Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 4
  completed_plans: 3
  percent: 0
---

# Project State: внимание брусника! — Band Website

**Last updated:** 2026-06-24
**Updated by:** roadmap creation

---

## Project Reference

**Core value:** A visitor can experience the band's music and world (listen, watch, look) and take a real action — book a lesson — all on one fast, beautiful page. If everything else fails, the music must play and the booking must reach Соня.

**Current milestone:** v1 — complete functional site (no CMS/admin)

---

## Current Position

Phase: 01 (foundation-static-site) — EXECUTING
Plan: 3 of 4
**Phase:** 1 — Foundation & Static Site
**Plan:** Plan 03 complete (checkpoint: Vercel visual verify pending)
**Status:** Executing Phase 01 — Plans 01-01, 01-02, and 01-03 done; awaiting Vercel deploy for visual checkpoint
**Progress:** [███████░░░] 75%

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

- Confirm real media files are available from band before starting Phase 2
- Obtain Telegram bot credentials from Соня before starting Phase 3
- Collect real URLs for all # placeholder links before Phase 4
- **Plan 04 reveal script (`src/scripts/global-animations.js`) MUST:** (1) add `document.documentElement.classList.add('js-reveal')` as early as possible — ideally an inline render-blocking `<head>` script in Layout.astro to avoid flash-then-hide — AND (2) wire the IntersectionObserver toggling `.in` on `[data-reveal]`. Both must ship together (01-02 gated reveal behind `.js-reveal` so sections stay visible pre-Plan-04). See 01-02-SUMMARY.md Plan 04 handoff + global.css comment.

---

## Session Continuity

**To resume:** Read `.planning/ROADMAP.md` for phase goals and `.planning/REQUIREMENTS.md` for requirement details. Check Current Position above for active phase. Run `/gsd:plan-phase 1` to begin planning Phase 1.

---
*State initialized: 2026-06-24 after roadmap creation*
