---
phase: 03-sharing-booking
plan: 02
subsystem: booking
status: paused-at-checkpoint
tags: [booking, telegram, serverless, vercel, forms]
requires:
  - LessonsModal.astro (existing demo form, Phase 2)
  - Layout.astro inline demo-modal IIFE (existing, Phase 2)
provides:
  - /api/book serverless endpoint (Telegram primary + gated email fallback)
  - named + honeypot-protected booking form
  - non-silent failure state (#lessons-error) with Telegram fallback link
affects:
  - src/pages/api/book.ts
  - src/components/LessonsModal.astro
  - src/layouts/Layout.astro
  - src/scripts/demo-modal.js
tech-stack:
  added:
    - "resend ^6.14.0 (gated email fallback — disabled in v1)"
    - "@types/node ^26 (devDependency — process.env typing for astro check)"
  patterns:
    - "Astro on-demand API route via `export const prerender = false` on an otherwise output:'static' site"
    - "In-memory per-instance IP rate limiter (Map) — accepted v1 tradeoff"
    - "Honeypot field (website) for silent bot trapping"
    - "is:inline submit handler posting FormData to a serverless endpoint (no bundled script, no secrets client-side)"
key-files:
  created:
    - src/pages/api/book.ts
  modified:
    - src/components/LessonsModal.astro
    - src/layouts/Layout.astro
    - src/scripts/demo-modal.js
    - package.json
    - package-lock.json
    - tsconfig.json
decisions:
  - "Added @types/node + tsconfig types:[node] so astro check resolves process.env (PATTERNS uses process.env; Vercel runtime is Node)"
  - "Email fallback BUILT but gated OFF via EMAIL_ENABLED (D-11/D-12) — no monitored inbox/verified domain in v1"
metrics:
  duration: "3m 29s (code through Task 3; Tasks 4–5 are human checkpoints)"
  completed: 2026-06-25
  tasks_completed: 3
  tasks_total: 5
---

# Phase 3 Plan 02: Booking Vertical Slice Summary

Wired the existing demo booking form to a real Vercel serverless endpoint that delivers each submission to Соня's Telegram, with a non-silent failure path. Code (Tasks 1–3) is complete; live delivery is gated on a human-only checkpoint (Telegram bot token + chat ID as Vercel env vars).

## What Was Built (Tasks 1–3)

- **`src/pages/api/book.ts`** — the only backend file. `export const prerender = false` on-demand route. Telegram `sendMessage` is the primary channel (D-10): a Russian message with Формат / Имя / Контакт / Опыт each on its own labeled line, every user value passed through `escapeHtml` and sent with `parse_mode: 'HTML'` (T-03B-02). In-memory IP rate limiter returns HTTP 429 after 5 requests/60s/IP (T-03B-03). A filled `website` honeypot returns 200 without delivering (BOOK-04). The bot token and chat ID are read only from `process.env` (no `PUBLIC_` prefix), so they never reach the client bundle (T-03B-01). Errors are caught and returned as a generic `{ok:false}` 500 — raw Telegram/Resend errors are never surfaced (T-03B-05). Email fallback (Resend) is fully built but returns `false` immediately unless `EMAIL_ENABLED === 'true'` (D-11/D-12).
- **`src/components/LessonsModal.astro`** — added `name="format" | "name" | "contact" | "experience"` to the four fields (mandatory for `FormData`, BOOK-01) plus explicit option `value`s; added the off-screen honeypot `name="website"` input before the submit button; added a third `#lessons-error` state (`role="alert"`, default hidden) with «Что-то пошло не так», a direct `t.me/vnimaniebrusnika` link, and a «Попробовать снова» retry (D-14/D-15, BOOK-03). Scoped CSS uses token colors only — soft failure, no red border. Хоротерапия Timepad link verified unchanged (BOOK-05, D-17).
- **`src/layouts/Layout.astro`** — replaced the fake submit block inside the is:inline `demoModal` IIFE with a real `fetch('/api/book', { method:'POST', body: new FormData(form) })`. Success shows `#lessons-thanks`; failure (non-ok response or network catch) shows `#lessons-error` with `display:flex`, never silent (D-14). The submit button shows «отправляем...» + `disabled` + `aria-busy` during the request and restores after. The retry button returns to the form with values retained. Stays is:inline (RESEARCH Pitfall 6) — no bundled script, no `process.env`/secrets in client code.
- **`src/scripts/demo-modal.js`** — the documentation mirror updated in sync with the same handler.

## Verification (automated, passing)

- `npx astro check` → 0 errors, 0 warnings, 0 hints.
- `npm run build` → exits 0; `/api/book` bundles as the only on-demand serverless function.
- Token absent from client bundle: `grep -rl TELEGRAM_BOT_TOKEN dist/client` and `.vercel/output/static` → empty (T-03B-01 verified).
- `grep -rl process.env src/components src/layouts src/scripts` → empty (server secrets never in client code).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `process.env` had no TypeScript types**
- **Found during:** Task 1 (first `npx astro check`).
- **Issue:** The astro strict tsconfig does not include Node types, so `process` was unresolved (ts2591) and `astro check` reported 6 errors — blocking the Task 1 acceptance criterion of zero errors.
- **Fix:** Installed `@types/node` as a devDependency (the official DefinitelyTyped types package, explicitly named in the astro check error as the recommended fix — not a slopsquat risk) and added `"compilerOptions": { "types": ["node"] }` to `tsconfig.json`. PATTERNS.md prescribes `process.env`, and the Vercel serverless runtime is Node, so `process.env` is the correct runtime API.
- **Files modified:** package.json, package-lock.json, tsconfig.json.
- **Commit:** e7a67f1.

**2. [Rule 2 - Robustness] try/catch around Telegram + Resend calls**
- **Found during:** Task 1.
- **Issue:** PATTERNS reference did not wrap the `fetch`/Resend calls; an unexpected network throw would surface a raw error / 500 with a stack rather than the controlled `{ok:false}` failure path.
- **Fix:** Wrapped `sendTelegram` and `sendEmailFallback` in try/catch that return `false` on any throw, so the client always gets the generic failure path and the `#lessons-error` state (satisfies T-03B-05 and D-14 "never silent").
- **Files modified:** src/pages/api/book.ts.
- **Commit:** e7a67f1.

## Checkpoints Pending (Tasks 4–5)

This plan is `autonomous: false`. The executor stopped at Task 4 — a `checkpoint:human-action` that cannot be automated.

- **Task 4 (checkpoint:human-action, gate=blocking):** A human must create a Telegram bot via @BotFather, obtain Соня's chat ID via `getUpdates`, and set `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` as Vercel env vars (un-prefixed, Production + Preview), then redeploy. `EMAIL_ENABLED` stays unset for v1. No CLI/API substitute exists. Resume signal: "credentials set and deployed" or "skip live test".
- **Task 5 (checkpoint:human-verify, gate=blocking):** After credentials are set, a human submits the live form (confirms «Спасибо!» + Telegram delivery with the four labeled lines), exercises the failure path (error state + Telegram fallback link + retry with values retained), confirms the token is absent from the deployed bundle, triggers the rate limit (6+ submits), and confirms the хоротерапия link opens the live Timepad event. Resume signal: "approved".

## Requirements

- BOOK-01 (named fields submit via FormData), BOOK-02 (Telegram delivery via serverless endpoint), BOOK-03 (success + error states), BOOK-04 (server-side token, rate-limit, honeypot), BOOK-05 (хоротерапия Timepad link) — **code complete**; BOOK-02 live delivery confirmation depends on the Task 4/5 human checkpoints.

## Known Stubs

None. The email fallback is intentionally gated off (D-11/D-12), not a stub — it is fully implemented and activates when `EMAIL_ENABLED=true` with the Resend env vars present.

## Self-Check: PASSED

- Files: src/pages/api/book.ts, src/components/LessonsModal.astro, src/layouts/Layout.astro, src/scripts/demo-modal.js — all FOUND.
- Commits: e7a67f1, 40d43e5, 3168f03 — all FOUND.
