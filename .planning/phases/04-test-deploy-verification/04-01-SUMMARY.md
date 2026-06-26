---
phase: 04-test-deploy-verification
plan: "01"
subsystem: verification
tags: [robots-txt, noindex, fonts, audio-range, link-audit, booking-endpoint, security]
dependency_graph:
  requires: []
  provides: [robots-txt-live, verification-report]
  affects: [04-02]
tech_stack:
  added: []
  patterns: [curl-audit, honeypot-probe, worktree-deploy]
key_files:
  created:
    - public/robots.txt
    - .planning/phases/04-test-deploy-verification/04-VERIFICATION.md
  modified: []
decisions:
  - "Static always-disallow robots.txt (D-01): never env-gated because v1 stays private throughout; simpler than a dynamic toggle"
  - "Honeypot probe for SC5 reachability: fills website field to trigger honeypot path (book.ts L92-98), returns 200 without contacting Telegram — safe probe that never spams Соня"
  - "Deployed from worktree directory to pick up worktree's committed robots.txt (main repo checkout did not have the file)"
  - "t.me/share and vk.com/share links are runtime-computed in JS (not in HTML); confirmed via JS bundle grep"
  - "Astro CSRF protection requires Origin header on cross-site POSTs; honeypot probe uses Origin header to pass check"
metrics:
  duration: "~10 minutes"
  completed_date: "2026-06-26"
  tasks_completed: 3
  files_created: 2
  files_modified: 0
---

# Phase 04 Plan 01: Test Deploy Automated Verification Summary

**One-liner:** Disallow-all robots.txt deployed live (closing /robots.txt 404 gap) and all 5 success criteria's automatable halves proven with literal curl/header proof values in a band-shareable verification report.

---

## What Was Built

### Task 1: public/robots.txt (D-01)
Created `public/robots.txt` with exactly two directive lines (`User-agent: *` / `Disallow: /`). Deployed to Vercel production from the worktree directory (the initial deploy from the main repo directory picked up the old code — see deviations). Confirmed live: `GET /robots.txt → 200`, body contains `Disallow: /`.

### Task 2: Automated Verification Checks (D-02)
Ran all curl/code-verifiable checks against the live deploy at https://vnimanie-brusnika.vercel.app:

- **SC1:** Meta `name="robots" content="noindex, nofollow"` confirmed in live HTML. robots.txt 200 + Disallow. No X-Robots-Tag header (not required — meta + robots.txt are the gating controls).
- **SC2:** Google Fonts refs = 0 in HTML; = 0 in both linked CSS bundles (`/_astro/GallerySection.pe3E5Za-.css`, `/_astro/index.SY6LcFkL.css`). `@font-face` URLs all use `/_astro/*.woff2` (self-hosted Prata + Golos Text).
- **SC3 (server):** CDN audio returns `accept-ranges: bytes`; Range request `bytes=1000-2000` → HTTP 206 + `content-range: bytes 1000-2000/675840`.
- **SC4:** 4 real outbound links all HTTP 200 (Spotify, YouTube, Telegram t.me/vnimaniebrusnika, Timepad). 9 `#` placeholder links inventoried (5 site.ts + 4 show ticket links).
- **SC5 (server):** POST to `/api/book` with honeypot field returns 200 `{"ok":true}` — no Telegram delivery. Token check: `api.telegram.org` and bot token variable = 0 in HTML and all 3 JS bundles.
- **SHARE (SHARE-02/03):** Share button (`share-btn`) and `data-share` attributes present; `t.me/share/url?url=` and `vk.com/share.php?url=` confirmed in VideoSection JS bundle.

### Task 3: 04-VERIFICATION.md (D-04, D-05)
Band-shareable verification report written at `.planning/phases/04-test-deploy-verification/04-VERIFICATION.md` containing:
- Summary table with one row per criterion (SC1–SC5) with ✅/⏳ and literal proof values
- Detailed per-criterion proof sections (header strings, status codes, counts)
- Placeholder-link tracker (9 links, D-05 — inventory only, not fixed; Launch milestone handoff)
- Two plain-language Russian human-check instruction blocks for Plan 02 (audio seek on iPhone; booking receipt in Telegram)
- Security note confirming no secrets in the doc

---

## Verification Results

| Check | Expected | Actual | Pass? |
|-------|----------|--------|-------|
| robots.txt HTTP status | 200 | 200 | ✅ |
| robots.txt body | Disallow: / | User-agent: * / Disallow: / | ✅ |
| noindex meta in HTML | present | `name="robots" content="noindex, nofollow"` | ✅ |
| Google Fonts in HTML | 0 | 0 | ✅ |
| Google Fonts in CSS bundles | 0 | 0 (both files) | ✅ |
| CDN Accept-Ranges | bytes | accept-ranges: bytes | ✅ |
| CDN ranged request | 206 | HTTP/2 206 | ✅ |
| CDN Content-Range | bytes 1000-2000/N | bytes 1000-2000/675840 | ✅ |
| /api/book honeypot | 200 | 200 {"ok":true} | ✅ |
| Token in HTML/JS | 0 | 0 across HTML + 3 bundles | ✅ |
| 04-VERIFICATION.md exists | yes | yes | ✅ |
| Placeholder-link tracker present | yes | yes (9 links) | ✅ |
| Russian human-check instructions | yes | yes (2 blocks) | ✅ |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] First Vercel deploy used main repo directory (pre-worktree files)**

- **Found during:** Task 1
- **Issue:** Running `vercel --prod` from `/Users/chumakov/projects/brusnika` (the main repo) deployed the `master` branch content, which did not include the worktree's `public/robots.txt` (still on the worktree branch). `GET /robots.txt` returned 404 after the first deploy.
- **Fix:** Copied `.vercel/project.json` into the worktree directory, then ran `vercel --prod` from the worktree root. This built and deployed from the worktree's filesystem (with `public/robots.txt`). Second deploy confirmed live: HTTP 200.
- **Files modified:** `.vercel/project.json` (copied, gitignored — not committed)
- **Commit:** 8bc6c72 (robots.txt) already committed before the second deploy

**2. [Rule 3 - Blocking] Astro CSRF protection rejects cross-site POST without Origin header**

- **Found during:** Task 2 (SC5 honeypot probe)
- **Issue:** `curl -X POST /api/book -F "website=probe"` without an `Origin` header returned HTTP 403 "Cross-site POST form submissions are forbidden". This is Astro's built-in CSRF protection — expected production behavior, not a bug.
- **Fix:** Added `-H "Origin: https://vnimanie-brusnika.vercel.app"` to the probe command. Returns 200 as expected. CSRF protection is correctly working.
- **Files modified:** None — probe command adjusted in-flight; no code change needed.

---

## Known Stubs

None introduced by this plan. The 9 `#` placeholder links pre-exist in the repo and are tracked in the placeholder-link tracker (D-05). No new stubs were added.

---

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 8bc6c72 | chore(04-01): add disallow-all robots.txt (D-01) |
| Tasks 2+3 | 6a40ccb | docs(04-01): add band-shareable v1 verification report (D-02, D-04, D-05) |

---

## Self-Check: PASSED

- `public/robots.txt` exists at worktree path: confirmed
- `.planning/phases/04-test-deploy-verification/04-VERIFICATION.md` exists: confirmed
- Commit 8bc6c72 exists: confirmed
- Commit 6a40ccb exists: confirmed
- Live site `/robots.txt` returns 200 + Disallow: / : confirmed
- All 5 automated SC halves pass: confirmed
