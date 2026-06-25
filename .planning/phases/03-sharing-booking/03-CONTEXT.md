# Phase 3: Sharing & Booking - Context

**Gathered:** 2026-06-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire up the two real "take action" surfaces left after the media work:

1. **Social sharing** — let a visitor share a video clip to their own story/feed. On mobile, hand the actual clip `.mp4` to the OS native share sheet (Web Share API with `files`); on desktop, fall back to platform share links + copy-link. Attaches to the clip carousel/modal already built in Phase 2 (the reserved `.video-share-slot`, D-16).
2. **Booking delivery** — turn the existing demo booking form into a real submission that reliably reaches Соня. Primary delivery via a Telegram bot through a Vercel serverless endpoint (`/api/book`); email as a secondary fallback channel. Show a success state and a non-silent failure path.

Covers requirements: SHARE-01, SHARE-02, SHARE-03, BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05.

**Out of scope (other phases / v2):**
- Building or restyling the clip carousel/enlarge modal — done in Phase 2; this phase only adds the share button into the reserved slot.
- Producing dedicated short clip files — the existing clips are confirmed to serve as the shareable units (see D-01), so no new content task here.
- Full end-to-end production verification of live Telegram delivery and final URLs — that's Phase 4 (Pre-Launch Verification).
- An admin UI for choosing delivery channels — v1 uses config/env, not a dashboard (CMS/admin is v2).
</domain>

<decisions>
## Implementation Decisions

### Sharing — what gets shared (SHARE-01, SHARE-02)
- **D-01:** **Every clip in the carousel is shareable** (no curated subset). The clips currently in the `videos` collection are confirmed **already short enough** (≈15–30s, Stories-length) and serve as the shareable units — **SHARE-01 is satisfied by the existing `videos` collection; no new short-clip content task in this phase.**
- **D-02:** **On mobile, the share button hands over the actual `.mp4` file** via the Web Share API (`navigator.share({ files: [...] })`) guarded by `navigator.canShare`. This is the core of SHARE-02 — the visitor can post the clip straight to their Story/feed. If the device/browser can't share files, it **auto-degrades to sharing the link** (text + URL).

### Sharing — button placement & fallback UI (SHARE-02, SHARE-03)
- **D-03:** **Share button appears in two places:** the reserved 44×44 corner slot on **each clip card** (D-16 from Phase 2) **and inside the enlarge modal**. The visitor can share whether or not they've opened a clip.
- **D-04:** **Desktop fallback = a small popover menu** anchored to the share button (compact, dark/pink themed) — not an always-visible inline icon row.
- **D-05:** **Desktop fallback options: VK, Telegram, Copy link.** Copy link always present (universal catch-all, with a «Скопировано» confirmation).
- **D-06:** **No Instagram button on desktop.** Instagram offers no web share URL (can't pre-fill a clip or caption), is footer-only, and is blocked in Russia. Instagram sharing still works fully on **mobile** via the native share sheet (where it actually can receive the file). Desktop users use Copy link → paste into Instagram manually if they wish. (Reaffirms SHARE-03's "no Instagram share" on desktop.)

### Sharing — caption / share text
- **D-07:** **Default share text = band name + a short line + home-page link**, in Russian (e.g. «внимание брусника! — слушайте и смотрите» + URL). Warm, gives context, drives traffic back to the site. Exact wording editable later.
- **D-08:** **No hashtag.**
- **D-09:** **Shared link points to the site's home page** (not a deep-link to `#clips`). Use the site's canonical URL so it automatically becomes the public domain once set at launch.

### Booking — delivery channels (BOOK-01, BOOK-02)
- **D-10:** **Telegram is the primary delivery channel.** The real `/api/book` Vercel serverless endpoint sends a message to Соня's Telegram via the bot (replacing the demo's fake submit handler).
- **D-11:** **Email is a secondary FALLBACK channel** — it fires only **if Telegram delivery fails**. (This intentionally overrides the "no email as booking delivery" note in `CLAUDE.md` § What NOT to Use — see rationale below. User's explicit call.)
- **D-12:** **Build both channels now; ship Telegram-only active for v1.** Email is implemented and ready to switch on the moment there is (a) a monitored inbox address and (b) a configured email-sending service. **No dead placeholder address that silently goes nowhere** — email stays disabled until both exist. The active channel(s) are controlled by config/env, not a UI.

### Booking — message content & failure UX (BOOK-03)
- **D-13:** **The Telegram message to Соня contains all four form fields** — формат / имя / контакт / опыт — each labeled, on its own line, in Russian. Nothing extra.
- **D-14:** **Failure is never silent.** If the active delivery channel(s) fail, the visitor sees a clear Russian error AND a **direct tap-to-open Telegram link** so the request still reaches the band. (Once email fallback is enabled, a Telegram failure is first retried via email; the visitor-facing error + direct link appears only if all active channels fail.)
- **D-15:** **Visitor-facing fallback link target = the existing band Telegram, `t.me/vnimaniebrusnika`** (already wired into the site; no new contact info needed). Соня's personal @username is NOT on file and is not required. **NOTE — two distinct "fallbacks":** D-11's email fallback is *server-side* (the server emails Соня if the bot send fails; invisible to the visitor); D-14/D-15 is the *visitor-facing* "contact us directly" link shown on screen when all automatic delivery fails. The visitor-facing link is **Telegram-only for now on purpose** — there is no real monitored email address yet, and a `mailto:` to a placeholder would drop the booking into an unread inbox (the opposite of the core value). **As soon as a real inbox exists, add «или напишите на почту» (a `mailto:`) as a second direct option beside the Telegram link.**
- **D-16:** **Success state** = the existing «Спасибо!» (`#lessons-thanks`) block; shown when at least one active channel delivers.

### Booking — хоротерапия link (BOOK-05)
- **D-17:** Already satisfied — `LessonsModal.astro` links хоротерапия to the live Timepad event via `horoterapiyaUrl` in `site.ts`. Verify it remains correct; no new work expected.

### Claude's Discretion
- **Security mechanics (BOOK-04):** bot token kept server-side only (no `PUBLIC_` prefix), rate-limit (5 requests / 60s / IP → HTTP 429), and a honeypot field — implementer/researcher decide the exact mechanism (in-memory vs. store; Vercel serverless instance caveats). These are locked requirements, not discussion points.
- **Email-sending service choice** (e.g. Resend / SMTP) — researcher/planner decide the lightest option that fits a Vercel serverless function and a Russian-facing project. Note it needs one API key + a verified sending identity.
- **Web Share API specifics** — exact `canShare` feature-detection, how the clip file is fetched from the CDN for sharing, file-size guardrails, and the desktop popover markup — planner/researcher decide following Astro island conventions.
- **Share text exact wording / share URL plumbing** (`Astro.site` vs `window.location.origin`) — implementer decides.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning docs
- `.planning/ROADMAP.md` § "Phase 3: Sharing & Booking" — phase goal, the 5 success criteria (the TRUE conditions this phase must satisfy), requirement list, UI hint.
- `.planning/REQUIREMENTS.md` § Sharing / Booking — SHARE-01..03, BOOK-01..05 exact wording and acceptance phrasing. NOTE: D-11 adds email as a fallback delivery channel on top of the Telegram requirement.
- `.planning/PROJECT.md` — product intent; established design system (dark #000, pink #f3a9bd, Prata + Golos Text); the "if everything else fails, the booking must reach Соня" core value that motivates D-11/D-14.
- `.planning/STATE.md` § "Accumulated Context" — locked architecture: `TELEGRAM_BOT_TOKEN` server-side only (no `PUBLIC_` prefix) in `src/pages/api/book.ts`; never serve through a serverless function for media; island hydration (`BookingModal`/`ShareButton` directives); VK+Telegram primary, Instagram footer-only. § "External Prerequisites" — Telegram bot token + chat ID pending from Соня.
- `.planning/phases/02-media-islands/02-CONTEXT.md` — D-16 reserved the `.video-share-slot` and built the clip section "share-ready" specifically for this phase; D-13/D-14 framed clips as shareable social-media units.
- `CLAUDE.md` § Social Sharing — Web Share API + fallback share-link URL patterns (`t.me/share/url`, `vk.com/share.php`, Instagram = profile link only). § Booking Form → Telegram Bot — Astro API route + Telegram `sendMessage` (note: the doc's "no email" guidance is overridden by D-11). § What NOT to Use — email-as-delivery row is the decision D-11 explicitly overrides.

### Code to read (modify / replace targets)
- `src/components/VideoSection.astro` — the clip carousel + enlarge modal; lines ~66–67 the reserved `.video-share-slot` (per card) and line ~84–92 the enlarge modal where the second share button goes; `data-clip-url` / `data-clip-title` already on each card (the share button's data source).
- `src/components/LessonsModal.astro` — the booking form markup (формат / имя / telegram-or-email / опыт; `#lessons-form`, `#lessons-thanks`). Add the honeypot field + error state here.
- `src/scripts/demo-modal.js` — the demo IIFE whose **submit handler is the only thing this phase replaces** (lines 69–77) with a real `fetch('/api/book', …)`. Open/close/escape logic stays. Inlined via `<script is:inline>` in `Layout.astro`.
- `src/data/site.ts` — `socialLinks` (Telegram `t.me/vnimaniebrusnika` = the D-15 fallback link), `horoterapiyaUrl` (BOOK-05). Add share-text/URL constants here if modeled as data.
- `src/content.config.ts` — `videos` collection schema (`title`, `videoUrl`, `posterUrl`, `order`); confirms the clip data the share button reads. No schema change expected for sharing.
- `src/pages/api/book.ts` — does NOT exist yet; this phase creates it (the serverless booking endpoint). `src/pages/api/` directory must be created.

No external ADRs/specs — requirements and decisions are fully captured in the docs above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`VideoSection.astro`** — already built "share-ready" (Phase 2 D-16): reserved 44×44 `.video-share-slot` on each card, `data-clip-url`/`data-clip-title` attributes, and an enlarge modal. The share button is an additive insert, not a rebuild.
- **`LessonsModal.astro`** — complete booking form UI (formats, name, contact, experience) + a ready `#lessons-thanks` success block. Only the submit path changes.
- **`demo-modal.js`** — open/close/escape/click-outside logic is reusable as-is; its fake submit handler is the documented replacement seam (Phase 2 D-05 isolation contract).
- **`site.ts`** — typed singleton link data; band Telegram already present for the D-15 fallback; natural home for share-text constants.

### Established Patterns
- **Cross-island coordination via `document` CustomEvent** (`brusnika:video-play`, from Phase 2) — pattern available if the share flow needs to pause video/audio.
- **Overlays portaled to `<body>` + driven by `[data-open]`** (video modal, lessons modal) — share popover should follow the same inert-when-closed approach (`pointer-events:none` + `visibility:hidden`, not just `opacity:0`).
- **Scripts must be standard bundled `<script>` (NOT `is:inline`)** when they import CSS/assets — but the lessons modal IIFE is intentionally `is:inline` in `Layout.astro`; the real `fetch` swap stays in that same inline block (Phase 2 D-05).
- **Content Collections (`getCollection`) are the data layer** — the share button reads clip data already loaded by `VideoSection`.
- **Design tokens in `global.css`**; per-component scoped `<style>`; match the dark/pink dream-pop look for the share popover and any new booking states.

### Integration Points
- **Share button** mounts into `VideoSection`'s reserved per-card slot + enlarge modal; reads `data-clip-url`/`data-clip-title`; calls Web Share API (mobile, file) or opens the desktop popover (VK / Telegram / Copy link).
- **Booking** — new `src/pages/api/book.ts` serverless endpoint receives the form POST, sends Telegram (primary) + email (fallback, when enabled); the `LessonsModal` submit handler in `Layout.astro`'s inline script swaps from fake-thanks to `fetch('/api/book')` with success + non-silent failure handling.
- **Server config** — `TELEGRAM_BOT_TOKEN` + chat ID env vars (no `PUBLIC_` prefix); future email service API key + recipient address env vars (D-12).
</code_context>

<specifics>
## Specific Ideas

- Clips are framed as **shareable social-media / Stories units** — the whole point is a friend reposting to their own Story (D-01/D-02, carries Phase 2 framing).
- Default share text is **warm and Russian**, band-name-first, with a link home (D-07) — not marketing-y, no hashtag (D-08).
- Booking must **never silently drop** a request — "if everything else fails, the booking must reach Соня" is the project's core value, which is exactly why email fallback (D-11) and the direct-Telegram error link (D-14) exist.
- Email is deliberately **fallback-only and config-gated off until a real monitored inbox exists** (D-11/D-12) — the user does not want an inbox to babysit unnecessarily, only a safety net.
</specifics>

<deferred>
## Deferred Ideas

- **Email as a co-primary / always-both channel, and an admin switch to choose channels** — for v1, email is fallback-only and channel selection is config/env (D-11/D-12). A user-facing or dashboard channel chooser belongs with the v2 CMS/admin.
- **Соня's personal Telegram @username** as the fallback target — deferred; v1 uses the band Telegram `t.me/vnimaniebrusnika` (D-15). Swap in later if she wants direct DMs.
- **Deep-linking shares to `#clips` or per-clip pages** — v1 shares the home page (D-09).
- **Final production verification** of live Telegram delivery, real URLs, and the email service once configured — Phase 4 (Pre-Launch Verification).

### New external prerequisites surfaced (for STATE.md / Phase 4)
- **Email-sending service** (e.g. Resend / SMTP) — one API key + a verified sending identity — needed to enable the email fallback (D-11/D-12). Not required to ship v1 Telegram-only.
- **A monitored recipient inbox address** — none exists yet; email fallback stays disabled until provided.
- (Already tracked) **Telegram bot token + Соня's chat ID** — needed to test live booking delivery.
</deferred>

---

*Phase: 3-sharing-booking*
*Context gathered: 2026-06-25*
