---
phase: 03-sharing-booking
verified: 2026-06-25T14:31:00Z
status: human_needed
score: 7/7 must-haves verified (code-complete); 1 human-only confirmation outstanding
overrides_applied: 0
human_verification:
  - test: "On a real iOS Safari and/or Android Chrome phone, tap the ⬆ share button on a clip card."
    expected: "The OS native share sheet opens with the clip .mp4 file attached; Instagram / VK / Telegram are selectable; posting works. Cancelling the sheet shows no error UI."
    why_human: "Web Share Level 2 file handoff (navigator.canShare({files}) → navigator.share({files})) cannot be exercised without a real device that supports it. The only tablet available to the orchestrator (Huawei, no Web Share) correctly fell back to the popover, so the file-share path itself is code-present and guarded but device-unconfirmed. This is the single SC-1 acceptance that grep/build cannot prove."
---

# Phase 3: Sharing & Booking Verification Report

**Phase Goal:** Visitors can share a short clip to their own social story/feed on mobile (or use link/platform fallbacks on desktop), and can submit a booking request that reliably reaches Соня via Telegram.
**Verified:** 2026-06-25T14:31:00Z
**Status:** human_needed
**Re-verification:** No — initial verification
**Mode:** mvp (verified against the 5 ROADMAP success criteria, which are the phase contract)

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | On mobile with `navigator.share`, the share button opens the OS share sheet with a short `.mp4` attached; user can post to IG/VK/TG | ✓ VERIFIED (code path) — ⚠️ device-untested | `VideoSection.astro` lines 346–391: `navigator.canShare({files})` guard → `fetch(clipUrl)` → `blob()` → `new File([...], '...mp4')` → `navigator.share({files:[file]})` FILES-ONLY. Degrades to `navigator.share({title,text,url})` link share (375–386). 9 real CDN `.mp4` clips in `src/content/videos/`. **Real-phone OS-sheet confirmation is human-only (see human_verification).** |
| 2 | On desktop/Firefox, share button reveals VK link, Telegram link, copy-link — no broken UI / uncaught JS errors | ✓ VERIFIED | `.share-popover` (lines 125–144) with 3 `role="menuitem"` rows (VK/Telegram/Copy). Row handlers (425–466): VK → `vk.com/share.php?url=`; TG → `t.me/share/url?url=...&text=...` (both `encodeURIComponent`-escaped); Copy → `navigator.clipboard.writeText` + «Скопировано ✓» 2s. Inert-when-closed triplet + `z-index:2010`. Portaled to `<body>`. Orchestrator live-tested popover + touch-dismiss on the deployed site. |
| 3 | Booking form with name/contact/format/experience delivers a formatted Russian Telegram message within seconds + shows «Спасибо!»; bot token absent from any client JS bundle | ✓ VERIFIED | `book.ts` POST builds 4 labeled Russian lines (Формат/Имя/Контакт/Опыт, lines 106–111) via `sendTelegram` (41–54). `Layout.astro` inline handler `fetch('/api/book')` → success shows `#lessons-thanks` (197–205). Orchestrator live: HTTP 200 `{"ok":true}`, message received with all 4 fields on separate lines. Token read only from `process.env` (113–114, no `PUBLIC_`); `grep` of `.vercel/output/static` + `dist/client` for `TELEGRAM_BOT_TOKEN` → 0 hits. |
| 4 | >5 POSTs/60s/IP → HTTP 429; network/API failure shows a clear error state with a fallback Telegram link (never silent) | ✓ VERIFIED | `checkRateLimit` (24–34) `LIMIT=5`, returns 429 (84–87). Spot-check replica: 6th & 7th calls return false (429). Failure path: `Layout.astro` else/catch (202–211) shows `#lessons-error` (`display:flex`), which contains `t.me/vnimaniebrusnika` direct link + «Попробовать снова» retry (`LessonsModal.astro` 122–132). Orchestrator confirmed live booking returns 200. |
| 5 | «записаться»/хоротерапия section links to the live Timepad event | ✓ VERIFIED | `LessonsModal.astro` 52–57 renders `horoterapiyaUrl` = `https://sonya-brusnika.timepad.ru/event/4010316/` (`site.ts` 73–74) with `target="_blank" rel="noopener noreferrer"`. |

**Score:** 7/7 plan must-have truths code-verified; 5/5 roadmap success criteria met in code. SC-1's real-device OS-sheet behavior is the only human-only confirmation.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/VideoSection.astro` | share button ×(card+modal), `.share-popover`, share JS bundled | ✓ VERIFIED | `video-share-btn` appears 8× (incl. styles); 2 functional buttons (per-card slot + modal). Share JS in bundled `<script>` (not is:inline) → `dist/client/_astro/VideoSection.astro_astro_type_script_index_0_lang.*.js` contains `vk.com/share.php` + `clipboard.writeText`. |
| `src/data/site.ts` | `shareText` + `shareTitle` constants, no hardcoded site URL | ✓ VERIFIED | `shareText = 'внимание брусника! — слушайте и смотрите'` (88–89); `shareTitle(clipTitle)` (91–92). No site URL hardcoded — computed at runtime. |
| `src/pages/api/book.ts` | `prerender = false`, Telegram primary + gated email, rate-limit, honeypot | ✓ VERIFIED | `export const prerender = false` (14); honeypot `website` → 200 no-deliver (92–98); 429 limiter; email gated on `EMAIL_ENABLED==='true'` (63). try/catch hardening around both channels. |
| `src/components/LessonsModal.astro` | 4 named fields, honeypot, `#lessons-error` block | ✓ VERIFIED | `name="format|name|contact|experience"` (69,78,88,96); honeypot `name="website"` off-screen (104–111); `#lessons-error role="alert"` with TG link + retry (122–132). |
| `src/layouts/Layout.astro` | real `fetch('/api/book')` submit handler | ✓ VERIFIED | Inline IIFE submit handler (188–220): loading state, success→thanks, else/catch→error, finally restores button; retry wired (223–231). Stays is:inline; no `process.env`. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| Layout inline handler | `/api/book` | `fetch POST new FormData(form)` | ✓ WIRED | line 197; response branched to thanks/error. |
| `book.ts` | `api.telegram.org sendMessage` | `fetch` + chat_id + parse_mode HTML | ✓ WIRED | lines 43–47; `json.ok===true` returned. Orchestrator confirmed live 200 + message delivery. |
| `#lessons-error` | `https://t.me/vnimaniebrusnika` | direct visitor fallback link | ✓ WIRED | `LessonsModal.astro` 126. |
| share JS | `.video-card[data-clip-url]` | `btn.closest('.video-card').dataset.clipUrl` | ✓ WIRED | lines 415–417; modal button reads `openClip` (411–413). |
| share JS | `navigator.canShare/share` | `canShare({files})` guard then `share({files})` | ✓ WIRED | lines 346–366. |
| `.share-popover` | `document.body` | `appendChild` portal | ✓ WIRED | lines 284–286. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| VideoSection clip cards | `videos` collection | `getCollection('videos')` → 9 JSON entries with real `https://...vercel-storage.com/video/*.mp4` URLs | Yes | ✓ FLOWING |
| Booking Telegram message | form fields | `request.formData()` → `data.get('format'/'name'/'contact'/'experience')` → escaped into message | Yes (orchestrator received live message with typed values) | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Rate-limit boundary (5 pass, 6th+ block) | node replica of `checkRateLimit` | `[T,T,T,T,T,F,F]` | ✓ PASS |
| `npx astro check` | type check | 0 errors / 0 warnings / 0 hints | ✓ PASS |
| `npm run build` | build + Vercel bundle | exit 0; `/api/book` bundled as serverless function | ✓ PASS |
| Token absence in client bundle | grep `.vercel/output/static` + `dist/client` | 0 occurrences | ✓ PASS |
| No `process.env` in client code | grep `src/components src/layouts src/scripts` | 0 occurrences | ✓ PASS |
| Live booking delivery (orchestrator) | POST to deployed `/api/book` | HTTP 200 `{"ok":true}`, Telegram message received | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SHARE-01 | 03-01 | Existing clips serve as shareable units | ✓ SATISFIED | 9 CDN `.mp4` clips read via `data-clip-url`; D-01 reuse of `videos` collection (no separate "designated" clip set) is documented + accepted in plan/roadmap. |
| SHARE-02 | 03-01 | Mobile native file handoff | ✓ SATISFIED (code) / ? human | `canShare({files})` + `share({files})` path present; real-device OS-sheet confirmation deferred to human. |
| SHARE-03 | 03-01 | Desktop VK/TG/copy fallback, no Instagram | ✓ SATISFIED | Popover has exactly VK/Telegram/Copy; orchestrator live-tested. |
| BOOK-01 | 03-02 | Named form fields submit via FormData | ✓ SATISFIED | 4 `name=` attrs + `fetch('/api/book', {body:new FormData(form)})`. |
| BOOK-02 | 03-02 | Telegram delivery via serverless endpoint | ✓ SATISFIED | `/api/book` `sendTelegram`; orchestrator confirmed live delivery. |
| BOOK-03 | 03-02 | Success + error states | ✓ SATISFIED | `#lessons-thanks` + `#lessons-error` with TG fallback + retry. |
| BOOK-04 | 03-02 | Server-side token, rate-limit, honeypot | ✓ SATISFIED | `process.env` token (no leak in dist), 429 limiter, `website` honeypot 200-no-deliver. |
| BOOK-05 | 03-02 | Хоротерапия links to live Timepad | ✓ SATISFIED | `horoterapiyaUrl` Timepad link rendered. |

No orphaned requirements: all 8 IDs mapped to Phase 3 in REQUIREMENTS.md are claimed by a plan.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | No TBD/FIXME/XXX/HACK/PLACEHOLDER/stub markers in any of the 6 modified files | — | — |

The gated email fallback (Resend) returns false unless `EMAIL_ENABLED==='true'` — this is a fully-implemented, intentionally-disabled channel (D-11/D-12), not a stub.

### Human Verification Required

#### 1. Mobile native-share file handoff (SC-1)

**Test:** On a real iOS Safari and/or Android Chrome phone, open the deployed site, scroll to the clips carousel, tap the ⬆ share button on a clip card.
**Expected:** The OS native share sheet opens with the clip `.mp4` attached; Instagram / VK / Telegram are selectable and posting works. Cancelling the sheet shows no error UI and no console error.
**Why human:** Web Share Level 2 file handoff cannot be exercised by grep/build or by the orchestrator's available hardware (a Huawei tablet without Web Share, which correctly fell back to the popover). The code path is present and guarded; only a supporting device can confirm the sheet+file behavior.

### Gaps Summary

No gaps. All five ROADMAP success criteria and all seven plan must-have truths are satisfied in the codebase, corroborated by a clean `astro check`, a successful build with `/api/book` bundled as a serverless function, zero token/secret leakage into the client bundle, a passing rate-limit spot-check, and the orchestrator's live confirmation of Telegram delivery, honeypot short-circuit, and the desktop/touch popover. The single outstanding item is the real-device confirmation of the mobile native-share `.mp4` handoff (SC-1) — its code path exists and is guarded, so per the verification rules this is routed to human verification, not recorded as a gap.

---

_Verified: 2026-06-25T14:31:00Z_
_Verifier: Claude (gsd-verifier)_
