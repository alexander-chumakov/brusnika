# Walking Skeleton — внимание брусника! (Band Website)

**Phase:** 1
**Generated:** 2026-06-24

## Capability Proven End-to-End

> One sentence: the smallest user-visible capability that exercises the full stack.

A visitor can open a deployed Vercel preview URL and see the real hero section of the band site — dark theme, pink accent, Prata heading rendered in self-hosted Cyrillic, a Sharp-optimized WebP hero image — with `<meta name="robots" content="noindex">` present in page source and zero requests to Google Fonts. This single page proves the entire build-and-deploy pipeline (Astro 7 scaffold → @astrojs/vercel adapter → `src/assets/images/` optimization → @fontsource self-hosting → env-gated noindex → Vercel deploy) before any further sections are added.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Astro 7.0.2, `output: 'static'` (all pages prerendered; future API routes opt out per-route with `export const prerender = false`) | Ships zero JS by default for a media-heavy marketing page; `hybrid` keyword is gone in Astro 7 (RESEARCH Pitfall 7); clean path to a v2 CMS via Content Collections |
| Deployment target | Vercel via `@astrojs/vercel@11.0.0` adapter, `staticHeaders: true` | Official adapter; static prerender + one future serverless route (Phase 3 booking); Vercel auto-adds `X-Robots-Tag: noindex` on Preview deployments |
| Fonts | Self-hosted `@fontsource/prata@5.2.7` (weight 400) + `@fontsource/golos-text@5.2.8` (weights 400/500/600/700), Cyrillic subsets included | Google Fonts is throttled/blocked on Russian ISPs (FND-02); both packages verified to include `cyrillic` subsets |
| Images | Astro `<Image>`/`<Picture>` from `src/assets/images/` (moved from repo-root `/images/`), Sharp → WebP/AVIF + srcset, lazy below the fold | `<Image>` only processes assets inside `src/`; faster loads on a media-heavy site; identical appearance (D-11) |
| Data layer | Content Layer API — `src/content.config.ts` with `glob()` loader + `z` from `astro/zod`, JSON entries under `src/content/{tracks,shows,gallery}/`; singletons (links, featured album, lessons) in `src/data/site.ts` | `getCollection()` is the v1→v2 CMS seam (D-05/D-07/D-08); track schema carries optional `audioUrl`/`durationSeconds` so Phase 2 is a pure data-fill (D-09) |
| Styling | Central design tokens (CSS custom properties) in `src/styles/global.css` for palette (`#000`/`#f3a9bd`/`#f2f0ee`) and fonts (Prata / Golos Text), plus keyframes + scroll-reveal base classes globally; per-component scoped `<style>` for layout | D-10: pixel-identical to the draft, tokens for maintainability and the v2 theming path; `[data-reveal]`/`.in` MUST live in global CSS (not scoped) because JS toggles `.in` at runtime (RESEARCH Pitfall 3) |
| Noindex | Env-gated `NOINDEX` read via `import.meta.env.NOINDEX === 'true'` in `Layout.astro`, conditionally rendering `<meta name="robots" content="noindex, nofollow">` (build-time inlined) | FND-07 launch toggle is a Vercel dashboard env change + redeploy, not a code change; redundant with Vercel's auto `X-Robots-Tag` on Preview |
| Directory layout | `src/{layouts,components,content,data,styles,scripts,assets/images,pages}` per RESEARCH "Recommended Project Structure"; `index.html` kept at repo root as the visual reference only (not served) | One-page site; section-per-component for clean diffs and pixel comparison against the draft |
| Animations / demo JS | Plain global vanilla-JS scripts (NOT Astro islands): `scripts/global-animations.js` (scroll-reveal + cursor glow), `scripts/demo-player.js` (fake now-playing bar), `scripts/demo-modal.js` (fake lessons form) | D-06: islands need a UI framework runtime; the draft behaviors are pure vanilla JS. Demo scripts are isolated so Phase 2 (audio island) and Phase 3 (Telegram endpoint) replace them cleanly |

## Stack Touched in Phase 1 (Walking Skeleton = Plan 01)

- [x] Project scaffold — `npm create astro@latest` (minimal template, TypeScript strict), `astro.config.mjs` with Vercel adapter, `astro check` + `npm run build` green
- [x] Routing — one real route: `src/pages/index.astro` (prerendered)
- [x] Data read — deferred to Plan 03 in the skeleton itself; skeleton proves the static pipeline. (Plan 03 adds the first real `getCollection()` read — the v1→v2 seam.)
- [x] UI — real hero section rendered from `Layout.astro` with one real Sharp-optimized `<Image>` + self-hosted Prata heading
- [x] Deployment — deployed to a Vercel preview URL a visitor can open, with noindex meta confirmed in page source

> Note: per WALKING_SKELETON guidance the skeleton proves the *deployable static pipeline* (the riskiest unknowns: image optimization on Vercel — RESEARCH assumption A1 — and self-hosted Cyrillic fonts). The first real Content Collection read lands in Plan 03 and uses the same proven pipeline; it does not change any architectural decision above.

## Out of Scope (Deferred to Later Slices)

> Explicit — prevents later phases re-litigating Phase 1's minimalism.

- Real audio playback, real video player, photo lightbox — **Phase 2** (Phase 1 ships the draft's throwaway demo now-playing bar per D-04 and unoptimized gallery click behavior)
- Real social sharing (Web Share API + fallbacks) — **Phase 3**
- Real Telegram booking delivery — **Phase 3** (Phase 1 ships the draft's fake "Спасибо!" submit per D-05, no network call)
- Real ticket URLs, real Yandex/VK Music URLs, real VK/Instagram footer URLs, final contact email — **Phase 4** verification (Phase 1 keeps draft `#`/placeholder values per D-03 so the demo looks full; every placeholder is tracked for Phase 4)
- CMS / admin panel — v2

## Subsequent Slice Plan

Each later plan adds one vertical slice on top of this skeleton, leaving the deployed Vercel preview strictly more complete, without altering any architectural decision above:

- **Plan 02:** Static prose sections (nav, marquee, featured album, about, sing-with-us) ported pixel-faithfully and composed into `index.astro`.
- **Plan 03:** Content Collections — `content.config.ts` + JSON data; tracks / shows / gallery sections rendered via `getCollection()` (first real data read = the v1→v2 seam); demo now-playing bar wired (D-04).
- **Plan 04:** Links-as-data (`site.ts`), footer, lessons modal + fake submit (D-05), global animations + cursor glow (D-06), and final pixel-comparison + noindex pass.
- **Phase 2:** Visitors listen to every track, watch live video, browse photos in a lightbox (media islands).
- **Phase 3:** Visitors share a clip and submit a booking that reaches Соня via Telegram.
- **Phase 4:** Pre-launch verification of every research pitfall + the noindex launch toggle.
