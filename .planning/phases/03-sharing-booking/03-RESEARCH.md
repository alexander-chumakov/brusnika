# Phase 3: Sharing & Booking — Research

**Researched:** 2026-06-25
**Domain:** Web Share API (file sharing), Telegram Bot API, Astro serverless API routes, Vercel rate limiting, Resend email
**Confidence:** HIGH (core patterns verified via official docs); MEDIUM (iOS file-share edge cases); LOW (rate-limit cross-instance behavior)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Every clip in the carousel is shareable; existing clips are already short enough (SHARE-01 satisfied).
- **D-02:** Mobile shares the actual `.mp4` file via Web Share API with `navigator.canShare` guard; degrades to link-only share if files not supported.
- **D-03:** Share button appears on each clip card AND inside the enlarge modal.
- **D-04:** Desktop fallback is a small popover menu (not inline icon row).
- **D-05:** Desktop popover options: VK, Telegram, Copy link.
- **D-06:** No Instagram button on desktop; Instagram shares via native sheet on mobile only.
- **D-07:** Default share text = band name + short line + home-page link, in Russian.
- **D-08:** No hashtag.
- **D-09:** Shared link points to site home page (not `#clips`).
- **D-10:** Telegram is the primary delivery channel for bookings.
- **D-11:** Email is a secondary FALLBACK channel — fires only if Telegram delivery fails. (Overrides CLAUDE.md "no email" guidance — explicit user override.)
- **D-12:** Build both channels now; ship Telegram-only active. Email gated by `EMAIL_ENABLED=true` env var.
- **D-13:** Telegram message to Соня contains all four form fields (формат / имя / контакт / опыт), labeled, in Russian.
- **D-14:** Failure is never silent — show error + direct Telegram link `t.me/vnimaniebrusnika`.
- **D-15:** Visitor-facing fallback link = `t.me/vnimaniebrusnika` (band Telegram, already in `site.ts`).
- **D-16:** Success state = existing `#lessons-thanks` block.
- **D-17:** BOOK-05 (хоротерапия Timepad link) already satisfied in `LessonsModal.astro`; verify only.

### Claude's Discretion

- Security mechanics (BOOK-04): bot token server-side only, rate-limit (5 req / 60s / IP → HTTP 429), honeypot — researcher decides exact mechanism.
- Email-sending service choice (Resend vs SMTP) — researcher/planner decide.
- Web Share API specifics — canShare detection, file fetch from CDN, size guards, popover markup.
- Share text exact wording and share-URL plumbing (`Astro.site` vs `window.location.origin`).

### Deferred Ideas (OUT OF SCOPE)

- Email as co-primary / always-both + admin channel chooser → v2.
- Соня's personal Telegram @username as fallback → later.
- Deep-linking shares to `#clips` / per-clip pages → later.
- Final production verification of live delivery + email service → Phase 4.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHARE-01 | Designated short shareable video clips are self-hosted as shareable units | Satisfied by existing `videos` collection (D-01); no new content task needed |
| SHARE-02 | Mobile visitor can share a short clip via native share sheet (Web Share API with files + canShare guard) | Web Share API Level 2 with `files` parameter; canShare pre-check; fetch blob pattern documented below |
| SHARE-03 | Desktop fallback: VK, Telegram, copy-link; no Instagram share | Platform share URLs confirmed (`vk.com/share.php`, `t.me/share/url`); popover pattern confirmed |
| BOOK-01 | Visitor can submit the booking form (format, name, contact, experience) | Existing `LessonsModal.astro` has the form; submit handler replacement in `demo-modal.js` lines 69–77 |
| BOOK-02 | Submissions delivered to Соня via Telegram bot through Vercel serverless endpoint | Astro `output:static` + `prerender=false` confirmed; Telegram Bot API `sendMessage` via plain `fetch` |
| BOOK-03 | Form shows success state and clear error/fallback state on failure | Third state `#lessons-error` per UI-SPEC; error + direct Telegram link + retry |
| BOOK-04 | Bot token server-side only; endpoint rate-limited with honeypot | `x-forwarded-for` IP extraction; in-memory Map rate limiter (v1 acceptable); honeypot field in form |
| BOOK-05 | Хоротерапия links to live Timepad event | `horoterapiyaUrl` in `site.ts` already wired — verify only |
</phase_requirements>

---

## Summary

Phase 3 adds two interaction layers to the existing site: (1) a share button that hands actual `.mp4` clip files to the OS native share sheet on mobile (with a VK/Telegram/copy-link popover fallback on desktop), and (2) a real booking submission that delivers form data to Соня's Telegram via a Vercel serverless endpoint.

The critical technical question — how to add a single server-rendered API route to an otherwise static Astro 7 site — is now confirmed: `output: 'static'` with `export const prerender = false` on the API route is the correct Astro 7 pattern. The `@astrojs/vercel` adapter (already installed at 11.0.0) makes this work automatically, deploying only the on-demand route as a Vercel serverless function.

For mobile file sharing, the Web Share API Level 2 `files` parameter is the right tool, but iOS Safari has a documented quirk: including `title`, `text`, or `url` alongside `files` can suppress the share sheet on some iOS versions. The safest pattern for iOS is to pass `files` alone, then fall through to a separate `navigator.share({ text, url })` link-share call if `canShare({ files })` fails. On Android Chrome, files + text + url work together. The CDN fetch-to-blob step requires the CDN to serve CORS headers (`Access-Control-Allow-Origin: *`), which Vercel Blob does by default.

For the booking endpoint, plain `fetch` to the Telegram Bot API (no library) is sufficient for one-way `sendMessage` delivery. HTML `parse_mode` is the simplest escape-safe option (only `<`, `>`, `&` need escaping). The email fallback is best served by Resend (one npm package, one API key, runs cleanly in Vercel serverless). Rate limiting with an in-memory Map is acknowledged as per-instance only — this is the right v1 choice for a low-traffic band site, and the UI-SPEC implementation notes explicitly call this out as an accepted limitation.

**Primary recommendation:** Use `output: 'static'` + `prerender = false` on `src/pages/api/book.ts`, plain `fetch` to Telegram Bot API with `parse_mode: 'HTML'`, Resend for the email fallback, in-memory Map for rate limiting, and the fetch-to-blob + `canShare` guard for Web Share API file sharing.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Share button UI (clip card + modal) | Browser / Client | — | Pure JS running in the browser; reads `data-clip-url`, calls Web Share API or opens popover |
| Desktop share popover | Browser / Client | — | Vanilla JS popover anchored to share button; no server involvement |
| Web Share API file handoff | Browser / Client | CDN (Bunny/Vercel Blob) | `navigator.share({ files })` runs in the browser; CDN serves the `.mp4` file with CORS headers |
| Booking form UI | Browser / Client | — | Existing `LessonsModal.astro` form; inline script handles submit event |
| Booking endpoint (server) | API / Backend | — | `src/pages/api/book.ts` — Vercel serverless function; handles POST, validates, calls Telegram + Resend |
| Telegram delivery | API / Backend | External (Telegram Bot API) | Server calls `https://api.telegram.org/bot{token}/sendMessage`; token is server-side only |
| Email fallback delivery | API / Backend | External (Resend API) | Resend SDK called server-side only when `EMAIL_ENABLED=true` and Telegram fails |
| Rate limiting | API / Backend | — | In-memory Map in the serverless function; keyed by IP from `x-forwarded-for` |
| Хоротерапия Timepad link | Browser / Client | — | Static `<a>` in `LessonsModal.astro`, driven by `horoterapiyaUrl` in `site.ts`; no server involvement |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 7.0.2 (already installed) | Static site framework | Already installed; `output:static` + `prerender=false` per-route is the Astro 7 hybrid pattern |
| `@astrojs/vercel` | 11.0.0 (already installed) | Vercel adapter | Required to deploy on-demand routes as serverless functions; already in `package.json` |
| `resend` | 6.14.0 | Email fallback delivery | Lightest Vercel-serverless-compatible email sender; one npm package, REST API (no raw SMTP — critical for Vercel) |
| HTML5 Web Share API | browser built-in | Mobile file sharing | No library needed; `navigator.share()` + `navigator.canShare()` |
| Telegram Bot API | HTTP (no library) | Booking delivery | Plain `fetch` is sufficient for one-way `sendMessage`; no `grammY` needed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `navigator.clipboard` | browser built-in | Copy-link confirmation | Already available in all modern browsers; no library needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `resend` (REST API client) | `nodemailer` + SMTP | Nodemailer with raw SMTP dies mid-handshake in Vercel serverless (un-awaited sends); Resend uses REST API which is safe |
| `resend` | `@sendgrid/mail` | Both work; Resend is simpler (fewer required fields), more modern, Russian-friendly pricing |
| Plain fetch to Telegram | `grammy` | grammY is only needed if the bot receives and responds to messages; one-way sendMessage needs only fetch |
| In-memory Map rate limit | Upstash Redis + `@upstash/ratelimit` | Upstash is durable across instances but requires a Redis account; in-memory is correct for v1 low traffic |

**Installation (new packages only):**

```bash
npm install resend
```

`@astrojs/vercel` and `astro` are already in `package.json`. No other new packages needed.

---

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `resend` | npm | 2017-02-25 (8+ yrs) | High (6.14.0 current) | github.com/resend/resend-node | [OK] | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** none

*slopcheck ran successfully (v0.6.1). `resend` passed [OK]. All other capabilities use browser built-ins or already-installed packages.*

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (mobile)                    Browser (desktop)
      |                                    |
  [tap share btn]                   [click share btn]
      |                                    |
  canShare({files})?              Show .share-popover
      |                           VK link | TG link | Copy link
    YES                                   |
      |                           navigator.clipboard.writeText()
  fetch CDN mp4 → Blob
      |
  navigator.share({files})
  → OS share sheet (Instagram / VK / Telegram)
      |
    NO (files unsupported)
      |
  navigator.share({text, url})
  → OS share sheet (link only)
      |
  navigator.share absent
      |
  Show .share-popover (same as desktop)


Browser (booking form)
      |
  submit → fetch POST /api/book
      |
  [Vercel serverless: src/pages/api/book.ts]
      |
  validate + rate-check + honeypot
      |
  fetch Telegram Bot API sendMessage
      |
    OK (200) ─────────────────────→ return 200 → browser shows #lessons-thanks
      |
    FAIL
      |
  EMAIL_ENABLED=true?
      |
    YES → resend.emails.send()
      |     OK → return 200 → browser shows #lessons-thanks
      |     FAIL → return 500
      |
    NO  → return 500
      |
  browser shows #lessons-error + direct TG link
```

### Recommended Project Structure

```
src/
├── pages/
│   └── api/
│       └── book.ts        # NEW — serverless booking endpoint
├── components/
│   ├── VideoSection.astro # MODIFY — insert .video-share-btn into .video-share-slot
│   └── LessonsModal.astro # MODIFY — add #lessons-error state + honeypot field
├── scripts/
│   └── demo-modal.js      # MODIFY — replace submit handler (lines 69–77) with fetch('/api/book')
└── data/
    └── site.ts            # MODIFY (optional) — add share text constants
```

### Pattern 1: Astro 7 Static Site with One Server Route

**What:** `output: 'static'` (default, prerender everything) + `export const prerender = false` on a single API route. The adapter deploys only that route as a Vercel serverless function.

**When to use:** When the site is 99% static but needs one server-side endpoint (e.g., a booking form that calls external APIs with secret tokens).

**Example:**

```typescript
// src/pages/api/book.ts
// Source: https://docs.astro.build/en/guides/on-demand-rendering/
export const prerender = false;  // This route is server-rendered; rest of site stays static

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const name = data.get('name') as string;
  // ... process data
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

**astro.config.mjs:** No change needed. The existing `output: 'static'` with `adapter: vercel({ staticHeaders: true })` supports `prerender = false` on individual routes. [VERIFIED: docs.astro.build/en/guides/on-demand-rendering/]

### Pattern 2: Telegram Bot API sendMessage via fetch

**What:** Plain `fetch` to `https://api.telegram.org/bot{TOKEN}/sendMessage` with `parse_mode: 'HTML'`. Only `<`, `>`, `&` need escaping in user-supplied data.

**When to use:** One-way delivery (server notifies bot, bot does not receive messages back).

**Example:**

```typescript
// Source: https://core.telegram.org/bots/api
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendTelegramMessage(token: string, chatId: string, text: string): Promise<boolean> {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });
  const json = await res.json() as { ok: boolean };
  return json.ok === true;
}

// Build the message text from form fields:
const text = `<b>Новая заявка на занятие</b>\n\n`
  + `<b>Формат:</b> ${escapeHtml(format)}\n`
  + `<b>Имя:</b> ${escapeHtml(name)}\n`
  + `<b>Контакт:</b> ${escapeHtml(contact)}\n`
  + `<b>Опыт:</b> ${escapeHtml(experience)}`;
```

### Pattern 3: Resend Email Fallback (server-side, gated)

**What:** Call `resend.emails.send()` only when `process.env.EMAIL_ENABLED === 'true'` AND Telegram delivery failed. Never send email as co-primary.

**Example:**

```typescript
// Source: https://resend.com/docs/send-with-vercel-functions
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmailFallback(formData: { name: string; contact: string; format: string; experience: string }): Promise<boolean> {
  if (process.env.EMAIL_ENABLED !== 'true') return false;
  const { data, error } = await resend.emails.send({
    from: 'booking@brusnika.ru',  // must be a Resend-verified domain
    to: [process.env.RECIPIENT_EMAIL!],
    subject: `Новая заявка: ${formData.name}`,
    html: `<p><b>Формат:</b> ${formData.format}</p>`
        + `<p><b>Имя:</b> ${formData.name}</p>`
        + `<p><b>Контакт:</b> ${formData.contact}</p>`
        + `<p><b>Опыт:</b> ${formData.experience}</p>`,
  });
  return !error;
}
```

### Pattern 4: IP-Based Rate Limiting with In-Memory Map

**What:** Module-level `Map<string, { count: number; resetAt: number }>` in the serverless function file. Keyed by client IP from `x-forwarded-for`. Resets per-instance (not shared across Vercel instances — accepted v1 limitation per UI-SPEC implementation note 7).

**Example:**

```typescript
// Rate limit: 5 requests per 60 seconds per IP
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 5;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true; // allowed
  }
  if (entry.count >= LIMIT) return false; // blocked
  entry.count++;
  return true; // allowed
}

// In the route handler:
const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
if (!checkRateLimit(ip)) {
  return new Response('Too Many Requests', { status: 429 });
}
```

**Known limitation:** Each Vercel serverless instance has its own Map. Two simultaneous requests hitting different instances bypass per-instance limits. For a low-traffic band site, this is acceptable in v1. [ASSUMED — exact Vercel instance isolation behavior is training knowledge; behavior is consistent with serverless documentation.]

### Pattern 5: Web Share API with File Sharing

**What:** Check `navigator.canShare({ files })` first (avoids fetching the MP4 on unsupported devices), then fetch the clip as a blob, construct a `File` object, call `navigator.share({ files })`.

**iOS Safari caveat:** Including `title`, `text`, or `url` alongside `files` in the same `navigator.share()` call suppresses the share sheet on some iOS versions. [CITED: blog.bitsrc.io/sharing-files-from-ios-15-safari-to-apps-using-web-share] Best approach: pass `{ files }` alone first; if the sharing is rejected/aborted, offer the text fallback separately.

**CORS requirement:** The CDN serving the `.mp4` files must respond with `Access-Control-Allow-Origin: *` (or the site origin) on the clip URLs, because the browser `fetch()` call is cross-origin. Vercel Blob serves CORS headers by default. [ASSUMED — Vercel Blob CORS behavior; verify before relying on it.]

**Example:**

```javascript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare
async function shareClip(clipUrl, clipTitle, siteUrl) {
  // Step 1: Try file sharing (mobile with Web Share Level 2)
  if (navigator.canShare) {
    // Create a dummy File to test canShare before fetching (avoids unnecessary CDN fetch)
    const testFile = new File([''], 'test.mp4', { type: 'video/mp4' });
    if (navigator.canShare({ files: [testFile] })) {
      try {
        const response = await fetch(clipUrl);
        const blob = await response.blob();
        const file = new File([blob], `${clipTitle}.mp4`, { type: 'video/mp4' });
        await navigator.share({ files: [file] });
        return; // success
      } catch (err) {
        if (err.name === 'AbortError') return; // user cancelled — not an error
        // fall through to text share
      }
    }
  }

  // Step 2: Try text+url share (mobile without file support)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${clipTitle} — внимание брусника!`,
        text: 'внимание брусника! — слушайте и смотрите',
        url: siteUrl,
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  // Step 3: Show desktop popover (no Web Share API)
  showSharePopover();
}
```

### Pattern 6: Honeypot Field (anti-spam)

**What:** An invisible text input named `website`. Humans never see or fill it. Bots auto-fill form fields. Server checks the field; if non-empty, silently return 200 (do not process or error — gives bots no feedback).

**Example (server side):**

```typescript
const honeypot = formData.get('website') as string;
if (honeypot) {
  // Bot detected — return 200 silently (no delivery)
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
```

**HTML (in `LessonsModal.astro`):**

```html
<input
  type="text"
  name="website"
  tabindex="-1"
  autocomplete="off"
  aria-hidden="true"
  style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"
/>
```

### Anti-Patterns to Avoid

- **Using `output: 'hybrid'` in Astro 7:** The `output: 'hybrid'` mode was removed/deprecated in Astro 5. Use `output: 'static'` (already the project's config) and add `export const prerender = false` to the API route only.
- **Using nodemailer / raw SMTP for email:** Vercel serverless functions stop execution the moment they return; un-awaited SMTP handshakes die silently with no error or delivery. Always use a REST-based email API (Resend, SendGrid, etc.). [CITED: vercel.com/kb/guide/sending-emails-from-an-application-on-vercel]
- **Sending `text`, `url`, `title` alongside `files` in navigator.share on iOS:** Reliably suppresses the share sheet on iOS Safari. Pass `{ files }` alone for file sharing.
- **Using `opacity:0` alone for the closed popover:** The existing codebase pattern (confirmed in `VideoSection.astro`) is `pointer-events:none` + `visibility:hidden` when closed. The share popover must follow the same pattern.
- **Importing `resend` in any client-side script:** The Resend API key is server-side only. Only import and call Resend from `src/pages/api/book.ts`.
- **Referencing `TELEGRAM_BOT_TOKEN` in any Astro component or client script:** Must stay in `src/pages/api/book.ts` only. Never use a `PUBLIC_` prefix.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email sending from Vercel serverless | Custom SMTP / `nodemailer` | `resend` npm package | SMTP connections die mid-handshake when a serverless function returns; REST API (Resend) is the only safe approach on Vercel |
| HTML escaping for Telegram messages | Custom regex | Simple `escapeHtml()` (3 replaces) or `parse_mode: 'HTML'` (only 3 chars need escaping) | MarkdownV2 requires escaping ~20 special characters; HTML parse_mode only needs `< > &` escaped — trivial to hand-write safely |
| CDN CORS headers | Custom proxy or server-side clip streaming | Native CDN CORS config (Vercel Blob / Bunny) | Never stream media through serverless functions (4.5 MB limit, no `Accept-Ranges` — already a locked architecture decision) |
| Web Share API detection | `typeof navigator.share !== 'undefined'` | `navigator.canShare({ files: [testFile] })` | `canShare` tests both API support AND file type support in a single call; `typeof` check only confirms the API exists, not file support |

**Key insight:** The whole Phase 3 backend is 1 file (`book.ts`, ~80 lines) and 1 npm package (`resend`). There is no framework, no ORM, no session layer needed. The complexity is in the browser-side share flow edge cases (iOS Safari), not the server.

---

## Common Pitfalls

### Pitfall 1: astro.config.mjs doesn't need to change

**What goes wrong:** Developer reads older blog posts suggesting `output: 'hybrid'` is needed and changes `astro.config.mjs`, which breaks the existing static build.

**Why it happens:** Astro's hybrid/static terminology changed across versions. In Astro 7, `output: 'static'` already supports per-route `prerender = false` when an adapter is installed.

**How to avoid:** Leave `astro.config.mjs` unchanged. Only add `export const prerender = false` at the top of `src/pages/api/book.ts`.

**Warning signs:** Build errors about hybrid mode, or "output hybrid is not supported" messages.

### Pitfall 2: iOS Safari rejects navigator.share when files + text/url are combined

**What goes wrong:** `navigator.share({ files: [mp4File], text: shareText, url: siteUrl })` silently fails or shows no share sheet on some iOS Safari versions.

**Why it happens:** iOS Safari's Web Share Level 2 implementation has historically been stricter about combining `files` with other properties.

**How to avoid:** For file sharing, call `navigator.share({ files: [file] })` with `files` as the only property. Append text separately if needed or accept that text context comes from the OS app (e.g., Instagram shows the clip, the user writes their own caption).

**Warning signs:** `navigator.canShare({ files: [testFile] })` returns `true` but `navigator.share({ files, text, url })` returns a rejected promise that is not an `AbortError`.

### Pitfall 3: CDN CORS blocks the fetch-to-blob for file sharing

**What goes wrong:** `fetch(clipUrl)` in the share handler throws a CORS error because the CDN doesn't serve the right headers for cross-origin browser fetches.

**Why it happens:** `fetch()` on a cross-origin URL requires `Access-Control-Allow-Origin` on the response. Media elements like `<video src="...">` do NOT require CORS, but `fetch()` does.

**How to avoid:** Verify that Vercel Blob (current media CDN) serves CORS headers on the `.mp4` URLs. Test with `curl -I -H "Origin: https://vnimanie-brusnika.vercel.app" <clip-url>` and confirm `Access-Control-Allow-Origin: *` is present. If missing, configure the CDN bucket CORS policy before relying on the file-share flow.

**Warning signs:** Console error "CORS policy: No 'Access-Control-Allow-Origin' header" when testing share on desktop.

### Pitfall 4: Telegram chat_id is not the same as bot token

**What goes wrong:** Developer tries to send to the bot's own chat ID, or confuses Соня's user ID with a group chat ID.

**Why it happens:** There are two prerequisites: a bot token (from @BotFather) AND Соня's personal chat ID (obtained by her sending `/start` to the bot and calling `getUpdates`).

**How to avoid:** Document the prerequisite clearly. `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are two separate env vars. The chat ID procedure: (1) Соня sends any message to the bot in Telegram, (2) call `https://api.telegram.org/bot{TOKEN}/getUpdates`, (3) extract `result[0].message.chat.id`. That number is `TELEGRAM_CHAT_ID`.

**Warning signs:** Telegram API returns `{"ok":false,"error_code":400,"description":"Bad Request: chat not found"}`.

### Pitfall 5: resend "from" address must be a verified domain in production

**What goes wrong:** Email sends work locally with `onboarding@resend.dev` test address but fail in production with a "from address not verified" error.

**Why it happens:** Resend (like all transactional email services) requires a verified sending domain for production sends.

**How to avoid:** Since the email fallback is gated off until a real inbox exists (D-12), this is only relevant when enabling email. At that point, the band needs a sending domain (e.g., `booking@brusnika.ru`) verified in the Resend dashboard. The `from` field in `resend.emails.send()` must use this verified domain.

**Warning signs:** Resend returns `{ error: { name: "validation_error", message: "The from address is not verified..." } }`.

### Pitfall 6: The lessons modal submit handler is is:inline in Layout.astro

**What goes wrong:** Developer creates a new bundled `<script>` file to replace the submit handler, which fails because the IIFE in `demo-modal.js` still catches the submit event first.

**Why it happens:** `demo-modal.js` is inlined via `<script is:inline>` in `Layout.astro` (Phase 2 D-05 isolation contract). Per the UI-SPEC implementation note 4, the submit handler replacement stays in that same inline block.

**How to avoid:** Edit `demo-modal.js` (the source file for the inline block): replace lines 69–77 (the fake submit handler) with the real `fetch('/api/book', …)` implementation. Do NOT create a separate bundled script for this.

**Warning signs:** Two submit event listeners fire; the fake handler still shows thanks immediately before the fetch completes.

### Pitfall 7: Share popover must be portaled to body

**What goes wrong:** The `.share-popover` is clipped by the `.video-frame`'s `overflow:hidden` (which creates the portrait card shape). The popover appears behind the card or is visually cut off.

**Why it happens:** The `.video-frame` has `overflow:hidden` for the border-radius effect. Any absolutely-positioned child is clipped.

**How to avoid:** Append the share popover to `<body>` at runtime (same pattern as `.video-modal` already uses in `VideoSection.astro`). Set `position: fixed; z-index: 2010` (above the video modal at 2000).

**Warning signs:** Popover appears cropped or invisible when opening on a card at the carousel edge.

---

## Runtime State Inventory

This is not a rename/refactor/migration phase — no runtime state inventory needed.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro dev / build | Yes | v25.6.1 | — |
| npm | Package install | Yes | bundled | — |
| Astro | Build system | Yes | 7.0.2 | — |
| `@astrojs/vercel` | Serverless API route | Yes | 11.0.0 | — |
| Vercel CLI (`vercel dev`) | Local testing of `/api/book` | Not checked | — | Test via `astro dev` + manual fetch; `vercel dev` provides a more accurate serverless env |
| Telegram bot token | BOOK-02 | Not yet available | — | Endpoint cannot be tested end-to-end without credentials from Соня |
| Соня's chat_id | BOOK-02 | Not yet available | — | Same |
| Resend API key | D-11 email fallback | Not yet available | — | Email fallback stays disabled (`EMAIL_ENABLED` absent/false) — no blocker for v1 |
| Resend verified sending domain | Email fallback in production | Not yet available | — | Same — email is off by default; no blocker |

**Missing dependencies with no fallback:**
- None that block implementing the code. The Telegram credentials are needed for live testing but not for writing and deploying the code.

**Missing dependencies with fallback:**
- Telegram bot token / chat_id: implementation can be written and deployed; live end-to-end test is blocked until Соня creates the bot (tracked in STATE.md External Prerequisites).
- Resend API key: email fallback is built but gated off by default.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `output: 'hybrid'` for mixed static/SSR | `output: 'static'` + `prerender = false` per route | Astro v5 (2024) | Simpler config; no astro.config.mjs change needed |
| `@astrojs/vercel/serverless` import path | `@astrojs/vercel` (default import) | Astro v4–5 | Old import path is deprecated; current `package.json` already uses the correct import |
| grammY for Telegram | Plain `fetch` to Bot API (for one-way sends) | n/a (was always an option) | Fewer dependencies; grammY only adds value when bot receives messages |
| SMTP for transactional email in serverless | REST-based email API (Resend, SendGrid) | ~2022 (serverless became mainstream) | SMTP connections die when serverless functions return; REST is the only safe approach |

**Deprecated/outdated:**
- `output: 'hybrid'`: Removed in Astro 5; use `output: 'static'` with per-route `prerender = false`.
- `@astrojs/vercel/serverless` as a subpath import: Deprecated in favor of the bare `@astrojs/vercel` import.

---

## Security Domain

`security_enforcement` is not explicitly set to false — treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No user accounts |
| V3 Session Management | No | No sessions |
| V4 Access Control | Partial | Bot token is env-var only; never exposed to client |
| V5 Input Validation | Yes | Validate all four form fields server-side; honeypot check; HTML-escape user data before Telegram send |
| V6 Cryptography | No | No cryptographic operations; HTTPS handled by Vercel |
| V7 Error Handling | Yes | Never expose raw Telegram API errors or stack traces to the client; return generic 500 |
| V9 Communication | Yes | All external API calls are HTTPS (Telegram, Resend); no HTTP fallback |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Spam form submission (automated) | DoS + Information Disclosure | Rate limit (5 req/60s/IP via in-memory Map) + honeypot field |
| Bot token leakage | Information Disclosure | Never use `PUBLIC_` prefix; server-side only in `book.ts`; never log the token |
| XSS via booking data in Telegram message | Tampering | `parse_mode: 'HTML'` + manual `escapeHtml()` on all user-supplied fields before sending |
| CORS bypass for clip fetch | Elevation of Privilege | Browsers enforce CORS — attacker cannot make the victim's browser fetch clips to a malicious server; only risk is CORS misconfiguration that breaks legitimate file sharing |
| Telegram API abuse (using our bot to spam) | Spoofing | Rate limiting + honeypot mitigate automated abuse; bot only sends, never receives |

**Critical:** `TELEGRAM_BOT_TOKEN` in any server log, client bundle, or error response is a direct compromise of the booking channel. Set up Vercel environment variable (not `PUBLIC_` prefix) and ensure no `console.log(process.env)` style debugging is left in production code.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | In-memory Map rate limiter is per-instance (not shared across Vercel instances) — accepted v1 tradeoff | Pattern 4 / Pitfall notes | A determined bot hitting multiple instances could exceed 5 req/60s; acceptable for a low-traffic band site |
| A2 | Vercel Blob serves `Access-Control-Allow-Origin: *` on media files by default | Pitfall 3 / Web Share API | If wrong, `fetch()` in the share handler fails with a CORS error; file sharing is broken on all platforms |
| A3 | iOS Safari accepts `navigator.share({ files: [mp4File] })` with files-only (no text/url) reliably | Pattern 5 / Pitfall 2 | If iOS Safari has further restrictions, file sharing may not work; link-share fallback always works |
| A4 | `@astrojs/vercel` at 11.0.0 supports per-route `prerender = false` alongside `output: 'static'` without config changes | Pattern 1 | If wrong, `astro.config.mjs` needs an update to add `output: 'server'` or similar; the endpoint may not deploy as a function |
| A5 | Resend free tier is available for the email fallback volume (< 100 emails/month expected) | Standard Stack | If pricing changes, cost impact is minimal (few booking submissions expected at v1 traffic) |

---

## Open Questions

1. **CDN CORS headers for Vercel Blob**
   - What we know: `fetch()` in the share handler requires CORS headers on clip URLs.
   - What's unclear: Whether the existing Vercel Blob bucket is configured to serve `Access-Control-Allow-Origin: *` or if it defaults to same-origin only.
   - Recommendation: The Phase 3 plan should include a Wave 0 verification step — `curl -I -H "Origin: https://vnimanie-brusnika.vercel.app" <clip-url>` — before the share flow is built. If CORS headers are missing, add a Vercel Blob CORS config step.

2. **Telegram bot creation and chat_id**
   - What we know: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are listed as "Pending" external prerequisites in STATE.md.
   - What's unclear: Whether Соня has created the bot yet or will do so during Phase 3.
   - Recommendation: The Phase 3 plan should include a checkpoint for human confirmation of bot credentials before the live Telegram delivery can be tested. The code can be written and deployed without them; end-to-end test cannot.

3. **iOS Safari Web Share files + title behavior (current version)**
   - What we know: Older iOS Safari versions reject `{ files, text, url }` in a single call.
   - What's unclear: Whether current iOS 17/18 Safari has fixed this.
   - Recommendation: Implement the safe pattern (files-only call) regardless. The upside of adding text/url is minor (the app shows a caption field anyway); the downside of a broken share sheet is significant.

---

## Sources

### Primary (HIGH confidence)
- [Astro On-Demand Rendering — docs.astro.build](https://docs.astro.build/en/guides/on-demand-rendering/) — `output:static` + `prerender=false` pattern confirmed
- [Astro Endpoints — docs.astro.build](https://docs.astro.build/en/guides/endpoints/) — APIRoute type, FormData handling, POST handler signature
- [Astro Vercel Adapter — docs.astro.build](https://docs.astro.build/en/guides/integrations-guide/vercel/) — adapter config, hybrid support
- [Vercel Astro Guide — vercel.com/docs/frameworks/frontend/astro](https://vercel.com/docs/frameworks/frontend/astro) — per-route prerender=false with output:static confirmed; Astro Server Endpoints as API routes; `@astrojs/vercel` import (not `/serverless`)
- [Telegram Bot API — core.telegram.org/bots/api](https://core.telegram.org/bots/api) — sendMessage URL format, parse_mode, response shape, getUpdates for chat_id
- [MDN Navigator.canShare() — developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare) — files parameter, browser support, returns false if files unsupported
- [MDN Navigator.share() — developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) — share() method, AbortError, files parameter
- [Resend Vercel Functions Guide — resend.com/docs/send-with-vercel-functions](https://resend.com/docs/send-with-vercel-functions) — minimal send example, `RESEND_API_KEY`, `{ data, error }` pattern
- [Vercel Email Sending Guide — vercel.com/kb](https://vercel.com/kb/guide/sending-emails-from-an-application-on-vercel) — confirms REST API required (no raw SMTP), Resend recommended

### Secondary (MEDIUM confidence)
- [npm view astro version → 7.0.2] — verified 2026-06-25
- [npm view @astrojs/vercel version → 11.0.0] — verified 2026-06-25
- [npm view resend version → 6.14.0, created 2017-02-25] — verified 2026-06-25
- [slopcheck resend → OK] — slopcheck v0.6.1 ran 2026-06-25
- [iOS Safari files-only limitation — blog.bitsrc.io/sharing-files-from-ios-15-safari-to-apps-using-web-share](https://blog.bitsrc.io/sharing-files-from-ios-15-safari-to-apps-using-web-share-c0e98f6a4971) — community source; consistent with MDN notes
- Telegram HTML parse_mode escaping (only `< > &` required) — [DEV community article](https://dev.to/mbelsky/send-message-as-a-telegram-bot-what-may-go-wrong-1adf), cross-referenced with Telegram API docs
- In-memory Map rate limiting per serverless instance — [lihbr.com/posts/rate-limiting-without-overhead-netlify-or-vercel-functions](https://lihbr.com/posts/rate-limiting-without-overhead-netlify-or-vercel-functions)

### Tertiary (LOW confidence)
- Vercel Blob CORS headers default behavior — [ASSUMED from Vercel Blob docs overview]; not directly verified; flag as Pitfall 3 open question

---

## Metadata

**Confidence breakdown:**
- Astro 7 static + prerender=false pattern: HIGH — confirmed via official Astro and Vercel docs
- Telegram Bot API sendMessage: HIGH — confirmed via official Telegram docs + community examples
- Resend email: HIGH — confirmed via official Resend docs
- Web Share API files (general): HIGH — MDN authoritative
- Web Share API iOS Safari files-only quirk: MEDIUM — community source, consistent with MDN notes; exact iOS version range unknown
- Vercel Blob CORS headers: LOW — assumed, not directly verified
- In-memory Map rate limit (per-instance behavior): MEDIUM — consistent with serverless documentation

**Research date:** 2026-06-25
**Valid until:** 2026-07-25 (Astro and Vercel adapter versions change; Web Share API iOS behavior may improve)
