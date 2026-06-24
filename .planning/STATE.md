---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-06-24T15:01:04.275Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 4
  completed_plans: 0
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

**Phase:** 1 — Foundation & Static Site
**Plan:** None started
**Status:** Ready to execute
**Progress:** ░░░░░░░░░░░░░░░░░░░░ 0%

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
| Astro + hybrid output on Vercel | Static-first, minimal JS, clean v2 CMS path |
| Vercel Blob for media (audio/video) | Zero-friction for v1 scale; switch to Bunny.net if >5 GB/month egress |
| Self-hosted fonts via @fontsource | Google Fonts throttled/blocked for Russian ISPs |
| Env-var-gated noindex (NOINDEX=true) | Launch toggle is a Vercel dashboard action, not a code change |
| Telegram bot for booking delivery | Instant delivery, Russian-first UX, no inbox monitoring |
| Web Share API + platform fallbacks | Only realistic web mechanism for sharing to stories/feeds |
| Content Collections as v1→v2 seam | Loader swap in content.config.ts; zero component code changes for v2 |

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

---

## Session Continuity

**To resume:** Read `.planning/ROADMAP.md` for phase goals and `.planning/REQUIREMENTS.md` for requirement details. Check Current Position above for active phase. Run `/gsd:plan-phase 1` to begin planning Phase 1.

---
*State initialized: 2026-06-24 after roadmap creation*
