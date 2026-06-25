---
phase: 03-sharing-booking
plan: 01
subsystem: social-sharing
tags: [web-share-api, clipboard, popover, video-clips]
status: checkpoint-pending
requires:
  - "videos content collection (data-clip-url / data-clip-title on each .video-card) — Phase 02"
  - "design tokens in src/styles/global.css (--color-accent, --color-bg-modal, etc.)"
provides:
  - "Working clip share button on every card and inside the enlarge modal"
  - "Mobile Web Share Level 2 file handoff (canShare({files}) → share({files}))"
  - "Link-share fallback when files unsupported"
  - "Desktop VK / Telegram / Copy-link popover with «Скопировано ✓» confirmation"
  - "shareText / shareTitle constants in src/data/site.ts"
affects:
  - "src/components/VideoSection.astro (share UI + JS)"
  - "src/data/site.ts (share copy constants)"
tech-stack:
  added: []
  patterns:
    - "navigator.canShare({files}) guard before fetch-to-blob (avoids fetching MP4 on unsupported devices)"
    - "navigator.share({files:[file]}) FILES ONLY (iOS Safari suppresses sheet if text/url combined)"
    - "AbortError caught and ignored (user-cancel is not a failure)"
    - "popover portaled to <body> to escape carousel/card overflow:hidden (mirrors modal portal)"
    - "inert-when-closed: visibility:hidden + pointer-events:none, NOT opacity alone"
    - "share URL computed at runtime via window.location.origin (no hardcoded domain)"
key-files:
  created: []
  modified:
    - "src/data/site.ts"
    - "src/components/VideoSection.astro"
decisions:
  - "Popover always shares the home-page URL (D-09), so it carries no per-clip reference — simpler and correct since the site is one page"
  - "Share button glyph is Unicode ⬆ (per UI-SPEC option) — no SVG asset needed"
  - "File-share path passes files only (no title/text/url) per RESEARCH Pitfall 2; link-share path passes title/text/url"
metrics:
  duration: "~12m"
  completed: "2026-06-25"
  tasks_completed: 3
  tasks_total: 4
---

# Phase 03 Plan 01: Social Sharing Vertical Slice Summary

Working clip-share button (card + enlarge modal) that hands the actual `.mp4` to the OS native share sheet on mobile (Web Share Level 2, files-only per the iOS caveat), degrades to a link share when files are unsupported, and opens a dark/pink VK / Telegram / Copy-link popover on desktop with a «Скопировано ✓» confirmation — all built on browser built-ins, no new packages.

## What Was Built

**Task 1 — Share copy constants (`src/data/site.ts`)** — commit `5e145c7`
Added `shareText` (`'внимание брусника! — слушайте и смотрите'`, D-07/D-08 no hashtag) and a `shareTitle(clipTitle)` helper producing `{clipTitle} — внимание брусника!`. JSDoc notes these are the editable share strings and that the share URL is computed at runtime (`window.location.origin`, D-09) — no site URL hardcoded. Existing exports untouched; `https://` count unchanged at 4.

**Task 2 — Share button + popover markup and styles (`src/components/VideoSection.astro`)** — commit `01b25b4`
- `.video-share-btn` fills the reserved per-card `.video-share-slot` (slot's `aria-hidden` removed since it now holds an interactive control), plus a second `.video-share-btn--modal` instance inside the enlarge modal near the close button (D-03).
- One shared `.share-popover` (`role="menu"`, three `role="menuitem"` rows: VK / Telegram / Copy link) with Russian labels matching the UI-SPEC Copywriting Contract.
- Styles clone the `.video-modal-close` base (44×44 circle, `all:unset`, `rgba(0,0,0,0.45)` bg, accent hover/focus). Popover uses design tokens only, inert-when-closed triplet (`opacity/visibility/pointer-events`), `z-index:2010`, accent-tint row hover, and a `.share-copied` accent state. No raw hex literals in the new style lines.

**Task 3 — Share flow JS (`src/components/VideoSection.astro` bundled `<script>`)** — commit `f2667d4`
- Imports `shareText`/`shareTitle`; portals `.share-popover` to `<body>`; tracks the currently-open clip so the modal button shares the right clip.
- `shareClip()` flow: (1) `canShare({files})` guard → `fetch(clipUrl)` → `blob()` → `File` → `share({files:[file]})` FILES ONLY; (2) else `navigator.share({title,text,url})` link share; (3) else open the desktop popover. `AbortError` returns silently in both share paths; other errors surface no UI.
- Popover rows: VK/Telegram open platform share URLs via `window.open(..., '_blank', 'noopener')` (params `encodeURIComponent`-escaped, only `window.location.origin` + fixed `shareText`); Copy uses `navigator.clipboard.writeText` then swaps the label to «Скопировано ✓» for 2s, keeping the popover open. Close on click-outside and Escape; focus returns to the triggering button.
- No `process.env` / secrets in the client script.

## Verification Evidence

- `npx astro check` → 0 errors / 0 warnings / 0 hints (all three tasks).
- `npm run build` → exit 0; share logic confirmed bundled in `dist/_astro/VideoSection.astro_astro_type_script_index_0_lang.*.js` (NOT is:inline).
- `navigator.share({ files: [file] })` confirmed files-only (no `text:`/`url:` in the same call).
- `grep -E "TELEGRAM_BOT_TOKEN|process.env" src/components/VideoSection.astro` → nothing.
- Grep confirmed: `vk.com/share.php`, `t.me/share/url`, `clipboard.writeText`, `window.location.origin`, `AbortError` all present.

## Deviations from Plan

None for Tasks 1–3 — executed as written. One minor simplification within scope: the desktop popover carries no per-clip reference because every share targets the home-page URL (D-09); the unused `popoverClip` variable introduced during drafting was removed before committing Task 3.

## Pending Checkpoint — Task 4 (human-verify, blocking)

Task 4 is a `checkpoint:human-verify` and was NOT performed by the executor. It requires a human to test the share flow on real desktop + mobile devices against a Vercel preview (or `npm run build && npm run preview`):
- Desktop: popover appears unclipped (VK / Поделиться в Telegram / Скопировать ссылку), copy shows «Скопировано ✓» ~2s and pastes the home URL, VK/Telegram open prefilled in a new tab, Esc closes, modal share button opens the popover above the modal.
- Mobile (iOS Safari + Android Chrome if available): native share sheet appears with the clip attached (Android) or clip/link (iOS); cancelling shows no error.
- Zero uncaught console errors throughout.

**Resume signal:** Human types "approved" or describes what looked/behaved wrong.

## Requirements Status

- SHARE-01 — existing `videos` clips are the shareable units (share button reads `data-clip-url`/`data-clip-title`); no new content. **Code complete; pending human verify.**
- SHARE-02 — mobile file handoff via `canShare({files})` + `share({files})`, degrading to link share. **Code complete; pending human verify.**
- SHARE-03 — desktop VK/Telegram/Copy popover (no Instagram), «Скопировано ✓». **Code complete; pending human verify.**

## Self-Check: PASSED

- src/data/site.ts — FOUND (shareText/shareTitle exports)
- src/components/VideoSection.astro — FOUND (share button ×2, popover, share JS)
- Commit 5e145c7 — FOUND
- Commit 01b25b4 — FOUND
- Commit f2667d4 — FOUND
