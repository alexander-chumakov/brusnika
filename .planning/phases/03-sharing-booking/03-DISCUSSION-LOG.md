# Phase 3: Sharing & Booking - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-25
**Phase:** 3-sharing-booking
**Areas discussed:** What gets shared, Share button & fallback UI, Share caption text, Booking delivery & failure

---

## What gets shared

| Option | Description | Selected |
|--------|-------------|----------|
| All clips shareable | Every clip gets a share button; no curation | ✓ |
| A curated few | Tag a subset as shareable | |

| Option | Description | Selected |
|--------|-------------|----------|
| Already short enough | Existing clips are ~15-30s; share as-is | ✓ |
| Longer — provide short cuts | Band supplies dedicated short versions | |
| Share as-is for now, swap later | Ship with current clips, replace later | |

| Option | Description | Selected |
|--------|-------------|----------|
| The video file itself | Hand the .mp4 to the share sheet (Web Share files) | ✓ |
| Just a link | Share only the site URL | |

**User's choice:** All clips; existing clips already short enough (SHARE-01 satisfied by existing collection); mobile shares the actual file.
**Notes:** Auto-degrade to link sharing where files aren't supported.

---

## Share button & fallback UI

| Option | Description | Selected |
|--------|-------------|----------|
| On each card + in modal | Share in card slot and inside enlarge view | ✓ |
| Only on each card | Card slot only | |
| Only inside the enlarge modal | After opening a clip only | |

| Option | Description | Selected |
|--------|-------------|----------|
| Small popover menu | Compact menu next to the button | ✓ |
| Inline row of icons | Always-visible icons | |

| Option | Description | Selected |
|--------|-------------|----------|
| Telegram | t.me share link | ✓ |
| VK | vk.com share link | ✓ |
| Copy link | Copy URL with confirmation | ✓ |
| WhatsApp | WhatsApp share link | |
| Instagram (added by user, then resolved) | No web share URL exists | dropped on desktop |

**User's choice:** Share on each card + modal; desktop popover; options VK + Telegram + Copy link.
**Notes:** User initially added Instagram. Clarified that Instagram has no web share URL (footer-only, blocked in RU); user chose to drop it on desktop and add Copy link instead. Instagram sharing still works on mobile's native share sheet. Copy link confirmed included regardless.

---

## Share caption text

| Option | Description | Selected |
|--------|-------------|----------|
| Band name + short line + link | «внимание брусника! — слушайте и смотрите» + URL | ✓ |
| Just band name + link | Minimal | |
| Clip title + band + link | Per-clip specific | |

| Option | Description | Selected |
|--------|-------------|----------|
| No hashtag | Cleaner | ✓ |
| Yes — #внимание брусника | Branded hashtag | |

| Option | Description | Selected |
|--------|-------------|----------|
| Home page | Points to main page; becomes public domain at launch | ✓ |
| Deep-link to clips section | Lands on #clips | |

**User's choice:** Band name + short line + home-page link; no hashtag.
**Notes:** Exact Russian wording editable later.

---

## Booking delivery & failure

| Option | Description | Selected |
|--------|-------------|----------|
| All four fields, formatted | формат/имя/контакт/опыт, labeled, Russian | ✓ |
| Fields + timestamp | Adds submission time | |
| Just name + contact | Minimal | |

| Option | Description | Selected |
|--------|-------------|----------|
| Error + direct Telegram fallback | Error message + tap-to-open Telegram link | ✓ |
| Error message only | No direct link | |

| Option | Description | Selected |
|--------|-------------|----------|
| Band Telegram t.me/vnimaniebrusnika | Existing wired link | ✓ |
| Соня's personal Telegram | Needs @username (not on file) | |

**User's choice:** All four fields formatted; failure shows error + direct band-Telegram link.
**Notes:** During the wrap-up, user added a new requirement: bookings should also be deliverable by email, not only Telegram.

### Follow-up: email delivery (added during wrap-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Always send both | Telegram + email simultaneously | |
| Email only as backup | Email fires only if Telegram fails | ✓ |
| Email is the main channel | Reverses Telegram-first | |

| Option | Description | Selected |
|--------|-------------|----------|
| Who chooses: You/Соня as a setting | Config switch (Telegram/email/both) | (superseded) |
| Who chooses: The visitor at submit time | Form shows delivery choice | |

| Option | Description | Selected |
|--------|-------------|----------|
| Build it, ship Telegram-only, enable email later | Both channels built; email off until inbox exists | ✓ |
| Wait on email entirely | Telegram only, email as later task | |

**User's choice:** Telegram primary; **email as a fallback** (fires only if Telegram fails). Build both now, ship Telegram-only; enable email once a monitored inbox + sending service exist. No email address exists yet.
**Notes:** This overrides the "no email as booking delivery" guidance in CLAUDE.md — explicit user override, recorded with rationale. User later asked why the visitor-facing failure link doesn't mention email; clarified the two distinct fallbacks (server-side email vs. on-screen direct-contact link) and that the on-screen link stays Telegram-only until a real inbox exists (a placeholder mailto would silently drop bookings).

---

## Claude's Discretion

- Security mechanics (BOOK-04): server-side token, rate-limit 5/60s → 429, honeypot — implementer/researcher decide mechanism.
- Email-sending service choice (Resend / SMTP) — researcher/planner decide.
- Web Share API specifics (canShare detection, file fetch from CDN, size guards, popover markup) — planner/researcher.
- Share text exact wording and share-URL plumbing — implementer.

## Deferred Ideas

- Email as co-primary / always-both + admin channel chooser → v2 (CMS/admin).
- Соня's personal Telegram @username as fallback target → later.
- Deep-linking shares to #clips / per-clip pages → later.
- Final production verification of live delivery + email service → Phase 4.
- New external prerequisites surfaced: email-sending service (API key + verified identity) and a monitored recipient inbox; plus the already-tracked Telegram bot token + chat ID.
