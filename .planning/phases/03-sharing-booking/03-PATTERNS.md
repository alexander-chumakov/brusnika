# Phase 3: Sharing & Booking — Pattern Map

**Mapped:** 2026-06-25
**Files analyzed:** 5 (3 modified, 1 created, 1 optional-modify)
**Analogs found:** 5 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/VideoSection.astro` (MODIFY — insert share button markup + JS) | component | event-driven | `src/components/VideoSection.astro` itself (modal open/close section) | exact — same file, extend existing pattern |
| `src/components/LessonsModal.astro` (MODIFY — add `#lessons-error` state + honeypot field) | component | request-response | `src/components/LessonsModal.astro` itself (`#lessons-thanks` block) | exact — same file, add sibling state block |
| `src/scripts/demo-modal.js` (MODIFY — replace submit handler lines 69–77) | utility | request-response | `src/scripts/demo-modal.js` itself (lines 20–76 IIFE structure) | exact — same file, swap one handler |
| `src/pages/api/book.ts` (CREATE — serverless booking endpoint) | route / API handler | request-response | `src/components/VideoSection.astro` `<script>` block (fetch + error handling) | partial — same project fetch conventions; no existing API route to copy |
| `src/data/site.ts` (MODIFY optional — add share text constants) | config / data | transform | `src/data/site.ts` itself (existing `Link` interface + `const` exports) | exact — same file, add typed constants |

---

## Pattern Assignments

### `src/components/VideoSection.astro` — share button markup + JS

**Analog:** `src/components/VideoSection.astro` (existing modal section)

**Insert point — share button inside `.video-share-slot`** (lines 66–68 — currently empty `<div>`):

```astro
<!-- Phase 3: replace the empty aria-hidden div with an interactive button -->
<button
  class="video-share-btn"
  aria-label="Поделиться клипом"
  aria-haspopup="menu"
  aria-expanded="false"
>
  ↑
</button>
<!-- Share popover (portaled to body at runtime — same pattern as .video-modal) -->
```

**Portal-to-body pattern** (lines 111–113 — copy verbatim for popover):

```typescript
// From VideoSection.astro lines 111-113:
if (modal && modal.parentElement !== document.body) {
  document.body.appendChild(modal);
}
// Apply same pattern to .share-popover element:
// if (popover && popover.parentElement !== document.body) {
//   document.body.appendChild(popover);
// }
```

**Inert-when-closed pattern** (lines 419–436 — copy CSS convention):

```css
/* From VideoSection.astro lines 419-436 — the ONLY valid closed-overlay pattern: */
.video-modal {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}
.video-modal[data-open='true'] {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
/* Share popover must use the same [data-open] toggle — NOT just opacity:0 alone.
   pointer-events:none + visibility:hidden = fully inert when closed. */
```

**44×44px circular button pattern** (lines 286–312 — copy for share button):

```css
/* From VideoSection.astro lines 286-312 (.video-arrow):
   44×44px, circle, dark blur backdrop, border → accent on hover */
.video-arrow {
  all: unset;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: rgba(6, 6, 6, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.video-arrow:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
/* Share button (.video-share-btn) uses same spec:
   background rgba(0,0,0,0.45) + backdrop-filter:blur(4px) per UI-SPEC
   (matches .video-modal-close at lines 476-492 more precisely) */
```

**Close button as exact share button base** (lines 472–497 — closest size match):

```css
/* From VideoSection.astro lines 472-497 (.video-modal-close):
   rgba(0,0,0,0.5) + blur(4px) — the share button spec says rgba(0,0,0,0.45) + blur(4px) */
.video-modal-close {
  all: unset;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}
.video-modal-close:hover {
  color: var(--color-accent);
}
/* Share button: same shape, swap hover to border-color + icon color per UI-SPEC */
```

**CustomEvent dispatch pattern** (lines 119–121 — for share JS to pause audio if needed):

```typescript
// From VideoSection.astro lines 119-121:
modalVideo?.addEventListener('play', () => {
  document.dispatchEvent(new CustomEvent('brusnika:video-play'));
});
// Share flow does NOT need to dispatch (no playback involved).
// AudioPlayer listens at lines 291-293:
// document.addEventListener('brusnika:video-play', () => { pausePlayback(); });
```

**data-clip-url / data-clip-title read pattern** (lines 148–154):

```typescript
// From VideoSection.astro lines 148-154:
document.querySelectorAll<HTMLElement>('.video-card').forEach((card) => {
  const trigger = card.querySelector<HTMLButtonElement>('.video-poster-btn');
  const url = card.dataset.clipUrl;
  const title = card.dataset.clipTitle ?? '';
  if (!trigger || !url) return;
  trigger.addEventListener('click', () => openModal(url, title));
});
// Share button reads the same data attributes from the parent .video-card:
// const card = shareBtn.closest('.video-card') as HTMLElement;
// const clipUrl = card.dataset.clipUrl;
// const clipTitle = card.dataset.clipTitle ?? '';
```

**Esc key close pattern** (lines 159–161):

```typescript
// From VideoSection.astro lines 159-161:
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.dataset.open === 'true') closeModal();
});
// Share popover uses same pattern: close popover on Escape.
```

**Share popover z-index** (must exceed video modal): video modal is `z-index: 2000` (line 423). Share popover must use `z-index: 2010` per UI-SPEC.

---

### `src/components/LessonsModal.astro` — add `#lessons-error` + honeypot

**Analog:** `src/components/LessonsModal.astro` itself — the existing `#lessons-thanks` block (lines 103–109) is the direct structural template.

**`#lessons-thanks` as structural template** (lines 103–109):

```astro
<!-- From LessonsModal.astro lines 103-109 — copy structure, adapt content -->
<div id="lessons-thanks">
  <div class="thanks-icon-wrap">
    <span class="thanks-icon">♥</span>
  </div>
  <h4 class="thanks-title">Спасибо!</h4>
  <p class="thanks-desc">Заявка отправлена — мы скоро напишем вам, чтобы договориться о времени.</p>
</div>

<!-- #lessons-error sibling block — same position, after #lessons-thanks: -->
<div id="lessons-error" role="alert" style="display:none;">
  <h4 class="error-heading">Что-то пошло не так</h4>
  <p class="error-body">Заявка не дошла. Пожалуйста, напишите нам напрямую:</p>
  <a href="https://t.me/vnimaniebrusnika" target="_blank" rel="noopener noreferrer"
     class="lessons-timepad-link error-direct-link">написать в Telegram</a>
  <button type="button" class="error-retry">Попробовать снова</button>
</div>
```

**`.lessons-timepad-link` pattern for the error direct link** (lines 195–200):

```css
/* From LessonsModal.astro lines 195-200 — copy for error-direct-link: */
.lessons-timepad-link {
  color: var(--color-accent);
  text-decoration: none;
  border-bottom: 1px solid rgba(243, 169, 189, 0.5);
}
.lessons-timepad-link:hover {
  border-bottom-color: var(--color-accent);
}
```

**`#lessons-thanks` CSS** (lines 263–269 — copy and adapt for `#lessons-error`):

```css
/* From LessonsModal.astro lines 263-269: */
#lessons-thanks {
  display: none;  /* shown by JS; #lessons-error mirrors this */
  text-align: center;
  padding: 50px 6px;
}
/* #lessons-error uses display:none + flex-direction:column per UI-SPEC:
   padding: 24px 0; gap: 12px; text-align: left (not centered). */
```

**Honeypot field — insert before submit button** (after line 100, before line 101):

```astro
<!-- Honeypot — invisible to humans, auto-filled by bots (BOOK-04) -->
<input
  type="text"
  name="website"
  tabindex="-1"
  autocomplete="off"
  aria-hidden="true"
  style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"
/>
```

**`lessons-panel-right` as the containing block** (lines 64, 206–214):

```css
/* From LessonsModal.astro lines 206-214:
   .lessons-panel-right is display:flex flex-direction:column.
   The three states (#lessons-form, #lessons-thanks, #lessons-error)
   all live as direct children; JS shows one and hides the other two. */
.lessons-panel-right {
  padding: 44px 38px;
}
#lessons-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
```

---

### `src/scripts/demo-modal.js` — replace submit handler lines 69–77

**Analog:** `src/scripts/demo-modal.js` itself (lines 71–77 — the exact replacement seam).

**Replacement seam** (lines 69–77):

```javascript
// CURRENT (lines 69-77) — remove this entire block:
// Fake submit — D-05: e.preventDefault() + show thanks, NO fetch/XHR
// Phase 3 replaces ONLY this handler with: fetch('/api/book', { method: 'POST', body: new FormData(form) })
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.style.display = 'none';
    if (thanks) thanks.style.display = 'block';
  });
}

// REPLACE WITH (real submit handler — keep inside the same IIFE):
var error = document.getElementById('lessons-error');
var submitBtn = form ? form.querySelector('[type="submit"]') : null;

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var submitText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
      submitBtn.textContent = 'отправляем...';
      submitBtn.setAttribute('disabled', '');
      submitBtn.setAttribute('aria-busy', 'true');
    }
    fetch('/api/book', { method: 'POST', body: new FormData(form) })
      .then(function (res) {
        if (res.ok) {
          form.style.display = 'none';
          if (thanks) { thanks.style.display = 'block'; }
        } else {
          form.style.display = 'none';
          if (error) { error.style.display = 'flex'; }
        }
      })
      .catch(function () {
        form.style.display = 'none';
        if (error) { error.style.display = 'flex'; }
      })
      .finally(function () {
        if (submitBtn) {
          if (submitText) submitBtn.textContent = submitText;
          submitBtn.removeAttribute('disabled');
          submitBtn.removeAttribute('aria-busy');
        }
      });
  });
}
// Retry link — resets from error state back to form (values retained)
if (error) {
  var retryBtn = error.querySelector('.error-retry');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      error.style.display = 'none';
      if (form) { form.style.display = 'flex'; }
    });
  }
}
```

**IIFE structure to preserve** (lines 14 and 78):

```javascript
// From demo-modal.js lines 14 and 78 — the wrapper that MUST be kept:
(function demoModal() {
  // ... all code including the new submit handler lives here
})();
```

**Variable declarations to extend** (lines 15–18):

```javascript
// From demo-modal.js lines 15-18 — add `error` alongside existing vars:
var overlay = document.getElementById('lessons-overlay');
var dialog = document.getElementById('lessons-dialog');
var form = document.getElementById('lessons-form');
var thanks = document.getElementById('lessons-thanks');
// ADD:
var error = document.getElementById('lessons-error');  // Phase 3 third state
```

**This file is the `<script is:inline>` source** — the inlined version in `Layout.astro` (lines 127–193) must be updated in sync. The source file (`demo-modal.js`) and the inlined block in `Layout.astro` are currently identical. Phase 3 edits both to stay in sync (or the planner should specify which is the master).

---

### `src/pages/api/book.ts` (CREATE — no analog exists)

**No existing API route in the codebase.** The closest patterns are:

1. **Astro file header convention** — copy from `src/components/VideoSection.astro` lines 1–28 (JSDoc block style).
2. **TypeScript conventions** — all existing `.ts` files use standard ES module imports, `as const`, Zod validation via `astro/zod`.
3. **Error handling tone** — never expose internals; return generic status.

**Complete structure to implement** (from RESEARCH.md Pattern 1 + Pattern 2 + Pattern 3 + Pattern 4):

```typescript
// src/pages/api/book.ts
/**
 * /api/book — Serverless booking endpoint
 *
 * Receives form POST from LessonsModal.astro (#lessons-form).
 * Primary: Telegram Bot API sendMessage.
 * Fallback: Resend email (gated by EMAIL_ENABLED=true env var — D-11/D-12).
 * Security: honeypot check, IP rate-limit (5 req/60s), server-side token only.
 */
export const prerender = false; // On-demand route; rest of site stays output:'static'

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Rate limiter — in-memory Map (per-instance; accepted v1 tradeoff — RESEARCH Pitfall notes)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 5;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendTelegram(token: string, chatId: string, text: string): Promise<boolean> {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  const json = await res.json() as { ok: boolean };
  return json.ok === true;
}

async function sendEmailFallback(fields: {
  format: string; name: string; contact: string; experience: string;
}): Promise<boolean> {
  if (process.env.EMAIL_ENABLED !== 'true') return false;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'booking@brusnika.ru',
    to: [process.env.RECIPIENT_EMAIL!],
    subject: `Новая заявка: ${fields.name}`,
    html: `<p><b>Формат:</b> ${fields.format}</p>`
        + `<p><b>Имя:</b> ${fields.name}</p>`
        + `<p><b>Контакт:</b> ${fields.contact}</p>`
        + `<p><b>Опыт:</b> ${fields.experience}</p>`,
  });
  return !error;
}

export const POST: APIRoute = async ({ request }) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response('Too Many Requests', { status: 429 });
  }

  const data = await request.formData();
  const honeypot = (data.get('website') as string) ?? '';
  if (honeypot) {
    // Silently succeed — bots get no feedback (BOOK-04)
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  const format = (data.get('format') as string) ?? '';
  const name = (data.get('name') as string) ?? '';
  const contact = (data.get('contact') as string) ?? '';
  const experience = (data.get('experience') as string) ?? '';

  const text = `<b>Новая заявка на занятие</b>\n\n`
    + `<b>Формат:</b> ${escapeHtml(format)}\n`
    + `<b>Имя:</b> ${escapeHtml(name)}\n`
    + `<b>Контакт:</b> ${escapeHtml(contact)}\n`
    + `<b>Опыт:</b> ${escapeHtml(experience)}`;

  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  const tgOk = await sendTelegram(token, chatId, text);

  if (tgOk) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Telegram failed — try email fallback (D-11)
  const emailOk = await sendEmailFallback({ format, name, contact, experience });
  if (emailOk) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: false }), {
    status: 500, headers: { 'Content-Type': 'application/json' },
  });
};
```

**astro.config.mjs — no changes needed.** `output: 'static'` + `adapter: vercel()` at lines 6–13 already supports `export const prerender = false` on individual routes. Do not change this file.

**Environment variables (server-side only, no `PUBLIC_` prefix):**
- `TELEGRAM_BOT_TOKEN` — bot token from @BotFather
- `TELEGRAM_CHAT_ID` — Соня's personal chat ID (obtained via `getUpdates`)
- `EMAIL_ENABLED` — `'true'` to activate email fallback (absent = off)
- `RESEND_API_KEY` — Resend API key (only needed when `EMAIL_ENABLED=true`)
- `EMAIL_FROM` — verified sending address (e.g. `booking@brusnika.ru`)
- `RECIPIENT_EMAIL` — Соня's inbox address (only needed when `EMAIL_ENABLED=true`)

---

### `src/data/site.ts` (MODIFY optional — share text constants)

**Analog:** `src/data/site.ts` itself — existing `Link` interface and `const` exports (lines 14–74).

**Existing export pattern** (lines 25–46):

```typescript
// From site.ts lines 25-46 — typed const export with inline comments:
export const streamingLinks = [
  { label: 'Яндекс Музыка', url: '#' },  // inline comment notes deferral
  // ...
] as const;
```

**New constants to add** (after existing exports, lines 74+):

```typescript
// Share text constants (D-07) — editable here without touching component JS
export const shareText = 'внимание брусника! — слушайте и смотрите' as const;
export const shareTitle = (clipTitle: string) =>
  `${clipTitle} — внимание брусника!` as const;
// Note: shareUrl is runtime-only (window.location.origin) — not exported from site.ts
```

**IMPORTANT:** `shareText` is a build-time string safe to export. `shareUrl` must be computed at runtime in the browser (`window.location.origin`) — do NOT hardcode a URL in `site.ts` because the domain is not finalized until launch (D-09).

---

## Shared Patterns

### Inert-When-Closed Overlay (ALL new overlays in Phase 3)

**Source:** `src/components/VideoSection.astro` lines 413–436
**Apply to:** `.share-popover` element

```css
/* The ONLY valid inert-when-closed pattern in this codebase:
   opacity:0 alone is INSUFFICIENT — it still intercepts pointer events.
   Must combine all three: */
.overlay-element {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.15s ease, visibility 0.15s ease;
}
.overlay-element[data-open='true'] {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
```

### Portal to `<body>` (ALL new absolute-positioned overlays)

**Source:** `src/components/VideoSection.astro` lines 104–113
**Apply to:** `.share-popover` (must escape `.video-frame`'s `overflow:hidden`)

```typescript
// Identical pattern — run immediately after DOM is ready:
if (popover && popover.parentElement !== document.body) {
  document.body.appendChild(popover);
}
// Then position with position:fixed; z-index:2010 (above video modal at 2000)
```

### `[data-open]` Toggle (ALL interactive overlays)

**Source:** `src/components/VideoSection.astro` lines 127–146 (`openModal`/`closeModal`)
**Apply to:** share popover open/close handlers

```typescript
// From VideoSection.astro lines 127-146 (openModal / closeModal):
function openModal(url: string, title: string) {
  modal.hidden = false;
  void modal.offsetWidth;   // force reflow so CSS transition fires
  modal.dataset.open = 'true';
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.dataset.open = 'false';
  // ...cleanup...
  modal.hidden = true;
}
// Share popover: same open/close with dataset.open toggle.
// Body scroll lock only needed if popover is full-screen — for a small
// corner popover, skip the body.style.overflow lock.
```

### Esc Key Close (ALL interactive overlays)

**Source:** `src/components/VideoSection.astro` lines 159–161 and `src/scripts/demo-modal.js` lines 63–67
**Apply to:** share popover

```typescript
// From VideoSection.astro lines 159-161:
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.dataset.open === 'true') closeModal();
});
// From demo-modal.js lines 63-67 (IIFE version using string check):
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') {
    closeLessons();
  }
});
```

### CSS Token Usage (ALL new style blocks)

**Source:** `src/styles/global.css` (tokens), `src/components/LessonsModal.astro` scoped `<style>` block
**Apply to:** share button, share popover, `#lessons-error`

```css
/* All design tokens — NEVER hardcode hex values in component <style> blocks: */
var(--color-bg)           /* #000 — page background */
var(--color-bg-modal)     /* #0c0a0b — popover background */
var(--color-bg-raised)    /* #070707 — hover row background */
var(--color-accent)       /* #f3a9bd — pink accent */
var(--color-accent-hover) /* #ffc0d0 — accent hover */
var(--color-text)         /* #f2f0ee — primary text */
var(--color-text-muted)   /* #bdb9b4 — secondary text */
var(--color-border)       /* rgba(255,255,255,0.08) — borders */
var(--font-serif)         /* Prata */
var(--font-sans)          /* Golos Text */
var(--font-mono)          /* ui-monospace */
```

### `is:inline` vs bundled `<script>` rule

**Source:** `src/layouts/Layout.astro` lines 88–193 and `src/components/VideoSection.astro` line 95
**Apply to:** all Phase 3 JS

```
Rule: The submit handler replacement stays in the is:inline IIFE block in Layout.astro
(demo-modal.js source). This is the D-05 isolation contract.

Share button JS: if it imports no assets → either pattern is acceptable per UI-SPEC note 3,
but prefer standard bundled <script> in VideoSection.astro for consistency with the existing
<script> block (line 95) which is already bundled (TypeScript, typed querySelector).

Never mix: don't add fetch() calls to is:inline blocks that aren't already doing fetch(),
and don't use process.env in any client-side <script> block.
```

---

## No Analog Found

No files in this phase are entirely without analog — all new additions extend existing patterns or are modeled by RESEARCH.md examples.

The only file with partial analog coverage is `src/pages/api/book.ts` (no existing API routes in the codebase). Planner should use the RESEARCH.md Pattern 1–4 examples directly for this file, as documented above in the Pattern Assignments section.

---

## Key Architectural Observations

1. **Three-state right panel:** `#lessons-form` / `#lessons-thanks` / `#lessons-error` are all direct children of `.lessons-panel-right`. JS shows exactly one at a time using `style.display`. The existing `demo-modal.js` IIFE already manages the first two (lines 22–23 in `openLessons`, lines 74–75 in submit handler). Phase 3 extends this to three states.

2. **Share button reads existing data attributes:** `data-clip-url` and `data-clip-title` are already on every `.video-card` (VideoSection.astro lines 47–50). The share button JS needs to walk up the DOM (`shareBtn.closest('.video-card')`) to read them — same pattern as the existing card `forEach` loop (lines 148–154).

3. **The demo-modal.js source file and Layout.astro inline block are currently duplicates.** The executor must update both in sync. The source file (`src/scripts/demo-modal.js`) is not imported — it is the reference source for the `<script is:inline>` block pasted into `Layout.astro`. Recommend treating `Layout.astro`'s inline block as the master for Phase 3 edits and keeping `demo-modal.js` updated as documentation.

4. **`resend` needs to be installed** before `src/pages/api/book.ts` can be written: `npm install resend`. It is the only new package for Phase 3 (RESEARCH.md Standard Stack).

5. **Share popover z-index stacking:** video modal = 2000 (VideoSection.astro line 423), nav = 50, now-playing bar = 60. Share popover must be `z-index: 2010` to appear above the video modal when the enlarge modal is open and the user taps share.

---

## Metadata

**Analog search scope:** `src/components/`, `src/scripts/`, `src/data/`, `src/layouts/`, `src/pages/`
**Files read:** 9 (VideoSection.astro, LessonsModal.astro, AudioPlayer.astro, demo-modal.js, Layout.astro, site.ts, content.config.ts, astro.config.mjs, package.json)
**Pattern extraction date:** 2026-06-25
