---
phase: 01-foundation-static-site
verified: 2026-06-24T17:28:32Z
status: human_needed
score: 3/5
overrides_applied: 0
deferred:
  - truth: "Shows section lists real upcoming concert dates, cities, venues, and each links to a real Timepad/Kassir ticket page (no '#' placeholder)"
    addressed_in: "Phase 4"
    evidence: "Phase 4 SC-4: 'All outbound links across the entire page — streaming platforms, ticket pages, footer social, contact — open to real destination pages; zero '#' placeholder href values remain.' Plan 03 explicitly marks ticketUrl default '#' as D-03 (Phase 4 deferral)."
  - truth: "Streaming links (Yandex Music and VK Music first, then Spotify, Apple Music, YouTube) and footer social/contact links (Telegram, VK, email) resolve to real destination pages"
    addressed_in: "Phase 4"
    evidence: "Phase 4 SC-4 covers all outbound links. Plan 04 explicitly marks Яндекс Музыка, VK Музыка, Apple Music, VK, Instagram as D-02/D-03 deferrals awaiting user-supplied URLs and Phase 4 fill."
human_verification:
  - test: "Open the Vercel preview URL on desktop (https://vnimanie-brusnika.vercel.app). Scroll top-to-bottom comparing against index.html: hero, marquee, featured album, tracks, about, shows, gallery, sing-with-us, footer. Every section must be visually indistinguishable from the draft in colors, Prata/Golos fonts, spacing, and gradients."
    expected: "All 9 sections match the draft layout pixel-for-pixel on desktop"
    why_human: "Visual fidelity cannot be verified by grep; requires a human comparing the live site against index.html side-by-side"
  - test: "As you scroll, confirm sections fade/rise into view (scroll-reveal). Move the mouse and confirm the soft pink glow follows the cursor (desktop / fine-pointer only). On a device with prefers-reduced-motion enabled, confirm content is immediately visible with no animation."
    expected: "Sections animate in on scroll; cursor glow follows mouse on desktop; no content permanently hidden without JS or with reduced-motion preference"
    why_human: "Animation behavior and progressive-enhancement safety require live browser testing"
  - test: "Click any nav pill 'пойте с нами' and the 'записаться' button in the sing section. Confirm the lessons modal opens. Fill the form (format, name, contact, experience). Submit. Confirm it switches to the Спасибо! state. Open the Network tab — confirm NO HTTP request was sent on submit. Close with ×, click-outside, and Escape — all three must close the modal."
    expected: "Modal opens, fake submit shows Спасибо! with zero network requests, all close mechanisms work"
    why_human: "Modal interaction and Network tab inspection require a browser; cannot be grepped from source"
  - test: "Click the хоротерапия 'ближайшая встреча ↗' link inside the modal. Confirm it opens https://sonya-brusnika.timepad.ru/event/4010316/ in a new tab."
    expected: "Real Timepad event page opens"
    why_human: "External URL resolution requires a browser"
  - test: "View page source at the Vercel preview URL. Confirm: (1) zero 'googleapis' or 'gstatic' references; (2) '<meta name=\"robots\" content=\"noindex, nofollow\">' is present (the preview deployment has NOINDEX=true set); (3) fonts render in Cyrillic without fallback."
    expected: "Zero Google Fonts references, noindex meta present, Cyrillic font renders correctly"
    why_human: "Cyrillic font rendering requires visual inspection; network tab confirms no Google Fonts requests at runtime"
  - test: "Open the Vercel preview URL on a mobile device (or Chrome DevTools mobile emulation). Confirm: tracks section hides the duration column, shows rows reflow to a narrower date column, gallery goes 2-column, footer stacks to single column, modal goes single-column."
    expected: "All responsive breakpoints work at 860px and below"
    why_human: "Responsive layout requires a browser at the correct viewport width"
---

# Phase 1: Foundation & Static Site — Verification Report

**Phase Goal:** A visually complete, deployable Astro site that matches the existing draft pixel-for-pixel, with all static sections populated from Content Collections, real outbound links, shows data, self-hosted fonts, and noindex gating — shareable via Vercel preview URL before any interactive island work.
**Verified:** 2026-06-24T17:28:32Z
**Status:** human_needed — all automated checks pass; 6 human verification items required to confirm visual fidelity, animations, and modal behavior
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC-1 | Visitor sees the full page — dark theme, pink accent, Prata headings, Golos Text body, all 9 sections | ? NEEDS HUMAN | 11 components exist and compose in index.astro; verified by build only — visual fidelity requires browser |
| SC-2 | Page source contains zero requests to fonts.googleapis.com or fonts.gstatic.com | VERIFIED | `grep -rq 'googleapis\|gstatic' dist/` → no matches; `@fontsource/prata` and `@fontsource/golos-text` imported in Layout.astro frontmatter |
| SC-3 | Shows section lists real upcoming concerts, each linking to a real Timepad/Kassir ticket page (no '#' placeholder) | DEFERRED | 4 shows render from getCollection('shows') with correct date/city/venue (SHOW-01 met); 9 placeholder href="#" in dist/index.html. Ticket URLs deferred to Phase 4 by design (D-03). See Deferred Items. |
| SC-4 | Streaming links (Яндекс/VK first) and footer social/contact links resolve to real destination pages | PARTIAL/DEFERRED | Real: Spotify, YouTube, Telegram, horoterapiyaUrl (Timepad). Placeholder (#): Яндекс Музыка, VK Музыка, Apple Music, VK, Instagram. Яндекс/VK first ordering met in streamingLinks array. Placeholder URLs deferred to Phase 4 (D-02/D-03). |
| SC-5 | NOINDEX=true causes `<meta name="robots" content="noindex">` in page source; env-gate is toggleable | VERIFIED | `NOINDEX=false npm run build` → meta absent; `NOINDEX=true npm run build` → meta present. Code: `const noindex = import.meta.env.NOINDEX === 'true'` in Layout.astro line 33. |

**Automated Score:** 2/3 fully automated truths verified (SC-2, SC-5). SC-1 needs human. SC-3 and SC-4 deferred per design to Phase 4.

---

## Deferred Items

Items not yet met but explicitly addressed in later milestone phases.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Shows section ticket links resolve to real Timepad/Kassir URLs (SC-3 partial) | Phase 4 | Phase 4 SC-4: "zero '#' placeholder href values remain"; Plan 03 D-03 comment marks all 4 ticketUrl values as Phase 4 fill |
| 2 | Яндекс Музыка, VK Музыка, Apple Music streaming links resolve to real pages (SC-4 partial) | Phase 4 | Phase 4 SC-4 covers all streaming links; D-02 marks these as "user supplies real artist URL"; D-03 marks Apple Music as Phase 4 fill |
| 3 | VK, Instagram social links resolve to real pages (SC-4 partial) | Phase 4 | Phase 4 SC-4 covers all social links; D-03 marks both as Phase 4 fill |

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `astro.config.mjs` | Astro static output + Vercel adapter | VERIFIED | `output: 'static'`, `adapter: vercel({ staticHeaders: true })` |
| `src/layouts/Layout.astro` | HTML shell, self-hosted fonts, env-gated noindex | VERIFIED | Font imports via @fontsource, NOINDEX env gate line 33, cursor-glow markup, js-reveal inline head script, LessonsModal and IIFE scripts at end of body |
| `src/styles/global.css` | Design tokens, keyframes, scroll-reveal classes gated under .js-reveal | VERIFIED | `--color-accent: #f3a9bd`, keyframes eq/riseup/marquee/bobdown, `.js-reveal [data-reveal]` (gated — no ungated opacity:0) |
| `src/content.config.ts` | tracks/shows/gallery collections with zod schemas; D-09 optional media fields | VERIFIED | defineCollection + glob() for all 3; audioUrl/durationSeconds optional on tracks; ticketUrl defaults '#'; imports from astro/zod |
| `src/data/site.ts` | streamingLinks (Яндекс/VK first), socialLinks, horoterapiyaUrl | VERIFIED | All three exports present; streamingLinks[0]='Яндекс Музыка', [1]='VK Музыка'; horoterapiyaUrl = real Timepad URL |
| `src/components/HeroSection.astro` | Pixel-faithful hero, Astro Image WebP, gradient-clip with @supports fallback | VERIFIED | Astro `<Image>` with widths/format/quality; `color: #f3a9bd` solid fallback at line 158; `@supports` gradient-clip at line 162 |
| `src/components/TracksSection.astro` | Track list from getCollection('tracks'), streaming links from site.ts | VERIFIED | getCollection('tracks') at line 15; streamingLinks imported from site.ts; 5 track buttons with data-i/data-title |
| `src/components/ShowsSection.astro` | Shows from getCollection('shows') with ticket links | VERIFIED | getCollection('shows') at line 15; shows.map renders date/city/venue/ticketUrl; 4 show JSON files |
| `src/components/GallerySection.astro` | Gallery from getCollection('gallery'), lazy Image | VERIFIED | getCollection('gallery') at line 19; import.meta.glob for dynamic images |
| `src/components/FooterSection.astro` | Footer reading streamingLinks + socialLinks from site.ts | VERIFIED | Imports from '../data/site.ts'; footerStreaming array built from streamingLinks |
| `src/components/LessonsModal.astro` | Lessons modal with form + thanks state, real horoterapiyaUrl | VERIFIED | Modal markup with #lessons-overlay/#lessons-form/#lessons-thanks; horoterapiyaUrl from site.ts |
| `src/scripts/demo-modal.js` | Fake-submit IIFE, no fetch/XHR | VERIFIED | e.preventDefault() submit handler; `fetch` appears only in comments (lines 4, 70), not as executable code |
| `src/scripts/global-animations.js` | IntersectionObserver scroll-reveal + cursor-glow with matchMedia pointer:fine guard | VERIFIED | IntersectionObserver at line 23; matchMedia('(pointer:fine)') at line 39 |
| Content JSON: 5 tracks, 4 shows, 5 gallery | Content backing the collections | VERIFIED | ls counts: 5/4/5; build validates via zod schemas |
| 30 WebP derivatives | Image optimization | VERIFIED | dist/_astro/*.webp count = 30 |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| Layout.astro | @fontsource/prata + @fontsource/golos-text | CSS import in frontmatter | VERIFIED | Lines 20–24: explicit @fontsource/*.css imports |
| Layout.astro | import.meta.env.NOINDEX | const noindex at line 33 | VERIFIED | `{noindex && <meta name="robots" ...>}` at line 49 |
| Layout.astro | .js-reveal class | render-blocking inline head script | VERIFIED | `document.documentElement.classList.add('js-reveal')` in inline script before body |
| Layout.astro | LessonsModal | import + `<LessonsModal />` at end of body | VERIFIED | Imported line 30; rendered line 85 |
| TracksSection.astro | getCollection('tracks') | Astro content query | VERIFIED | `(await getCollection('tracks')).sort(...)` |
| TracksSection.astro | streamingLinks from site.ts | import + label filter | VERIFIED | Imported line 13; header subset filtered by label |
| ShowsSection.astro | getCollection('shows') | Astro content query | VERIFIED | `await getCollection('shows')` |
| ShowsSection.astro | ticketUrl per show | `href={s.data.ticketUrl}` | VERIFIED | Each ticket-link href is the schema field (D-03 '#' placeholder — deferred) |
| GallerySection.astro | getCollection('gallery') | Astro content query | VERIFIED | `(await getCollection('gallery')).sort(...)` |
| FooterSection.astro | streamingLinks + socialLinks from site.ts | import + map | VERIFIED | `import { streamingLinks, socialLinks } from '../data/site.ts'` |
| global.css `.js-reveal [data-reveal]` | JS adding `.js-reveal` to `<html>` | className gate | VERIFIED | CSS rule is `.js-reveal [data-reveal]` — only hides when class present; Layout.astro adds class before first paint |
| HeroSection.astro | @supports gradient-clip | solid fallback + @supports block | VERIFIED | `color: #f3a9bd` fallback at line 158; `@supports ((-webkit-background-clip: text) or (background-clip: text))` at line 162 |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| TracksSection.astro | `tracks` | `getCollection('tracks')` → 5 JSON files | Yes — 5 track JSON, validated by zod | FLOWING |
| ShowsSection.astro | `shows` | `getCollection('shows')` → 4 JSON files | Yes — 4 show JSON (ticketUrl '#' by design) | FLOWING |
| GallerySection.astro | `photos` | `getCollection('gallery')` → 5 JSON files | Yes — 5 gallery JSON, images via import.meta.glob | FLOWING |
| FooterSection.astro | `footerStreaming`, `socialLinks` | `src/data/site.ts` constants | Yes — typed singletons (some '#' deferred) | FLOWING |
| TracksSection.astro | `headerStreaming` | `streamingLinks` from site.ts filtered by label | Yes — real data (Spotify/YouTube real; Яндекс '#') | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build exits 0 with NOINDEX=true | `NOINDEX=true npm run build` | exit 0, "1 page(s) built" | PASS |
| Build exits 0 with NOINDEX=false | `NOINDEX=false npm run build` | exit 0, "1 page(s) built" | PASS |
| Zero Google Fonts in dist/ | `grep -rq 'googleapis\|gstatic' dist/` | no matches | PASS |
| Noindex meta present when NOINDEX=true | `grep 'name="robots"' dist/index.html` | `<meta name="robots" content="noindex, nofollow">` | PASS |
| Noindex meta absent when NOINDEX=false | `grep 'name="robots"' dist/index.html` (NOINDEX=false build) | no match | PASS |
| 30 WebP image derivatives in dist/ | `ls dist/_astro/*.webp \| wc -l` | 30 | PASS |
| getCollection in all 3 sections | `grep -c getCollection TracksSection ShowsSection GallerySection` | 3/3/3 | PASS |
| streamingLinks in FooterSection and TracksSection | `grep -q streamingLinks` | present in both | PASS |
| demo-modal.js no real fetch | `grep -n 'fetch\|XHR' demo-modal.js` (executable only) | only in comments | PASS |
| IntersectionObserver in global-animations | `grep -q IntersectionObserver global-animations.js` | present | PASS |
| pointer:fine guard in global-animations | `grep -q 'pointer:fine' global-animations.js` | present | PASS |
| .js-reveal gates [data-reveal] opacity | `grep 'data-reveal' global.css` | `.js-reveal [data-reveal]` only (no ungated rule) | PASS |
| @supports fallback on gradient-clip | `grep '@supports' HeroSection.astro` | `@supports ((-webkit-background-clip: text) or (background-clip: text))` | PASS |
| Solid color fallback on hero title | `grep 'color:.*#f3a9bd' HeroSection.astro` | `color: #f3a9bd` at line 158 | PASS |
| Audio/video files gitignored | `git ls-files music/ video/` | empty — not tracked | PASS |
| streamingLinks Яндекс/VK first ordering | `grep -A2 'streamingLinks' site.ts` | [0]='Яндекс Музыка', [1]='VK Музыка' | PASS |

---

## Probe Execution

Step 7c: SKIPPED — no probe scripts defined for this phase (no `scripts/*/tests/probe-*.sh` found).

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| FND-01 | 01-01, 01-02, 01-03, 01-04 | Astro site with visual design preserved | NEEDS HUMAN | Build green; all 11 components composed; visual match requires browser |
| FND-02 | 01-01 | Self-hosted fonts, no Google Fonts | SATISFIED | Zero googleapis/gstatic in dist/ (verified by build grep) |
| FND-03 | 01-04 | Scroll-reveal + cursor-glow preserved | NEEDS HUMAN | Code verified (IntersectionObserver, .js-reveal gate, pointer:fine guard); animation behavior requires browser |
| FND-04 | 01-02, 01-03, 01-04 | Responsive layout matches draft | NEEDS HUMAN | @media rules at 860px in all sections; responsive behavior requires browser |
| FND-05 | 01-03 | Content Collections as CMS seam | SATISFIED | content.config.ts with zod schemas; getCollection() in all 3 data sections; optional audioUrl/durationSeconds on tracks |
| FND-06 | 01-01 | Site deployed to Vercel | SATISFIED (claimed) | Deploy confirmed by user during execution checkpoints; Vercel URL https://vnimanie-brusnika.vercel.app |
| FND-07 | 01-01 | Env-gated noindex | SATISFIED | NOINDEX=true → noindex meta present; NOINDEX=false → absent; code: Layout.astro line 33 |
| SHOW-01 | 01-03 | Shows listed with date, city, venue | SATISFIED | 4 shows from getCollection('shows'); all JSON have dateDisplay/year/city/venue |
| SHOW-02 | 01-03 | Shows link to ticket page | PARTIAL/DEFERRED | Ticket links render from ticketUrl; all 4 shows use default '#' (D-03); Phase 4 fills real URLs |
| LINK-01 | 01-04 | Streaming links with Яндекс/VK first | PARTIAL/DEFERRED | streamingLinks array ordered Яндекс/VK first; 3 real URLs (Spotify, YouTube, Telegram); 3 deferred to Phase 4 (Яндекс, VK, Apple Music) |
| LINK-02 | 01-04 | Footer social/contact links wired | PARTIAL/DEFERRED | Telegram real; VK, Instagram, email present but '#' for VK and Instagram; Phase 4 fills real URLs |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | Scan completed: no TBD/FIXME/XXX markers in any phase file | — | Clean |
| None | — | No ungated `[data-reveal]{opacity:0}` — properly gated under `.js-reveal` | — | Progressive enhancement correct |
| None | — | demo-modal.js fetch references are comments only, not executable code | — | Clean |
| music/*.mp3, video/*.mp4 | — | Raw media files present in working directory | INFO | Gitignored (`.gitignore` lists `music/` and `*.mp3`/`*.mp4`); `git ls-files music/ video/` returns empty — not tracked; no deployment risk |

No blockers found. Placeholder `href="#"` values are documented design decisions (D-02, D-03) with Phase 4 tracking.

---

## Human Verification Required

### 1. Full Visual Fidelity Review

**Test:** Open https://vnimanie-brusnika.vercel.app on desktop. Scroll top-to-bottom with index.html open side-by-side. Compare: hero → marquee → featured album → tracks → about → shows → gallery → sing-with-us → footer.
**Expected:** Every section visually indistinguishable from the draft (dark theme, pink #f3a9bd accent, Prata headings, Golos Text body, correct spacing, all gradients).
**Why human:** Visual fidelity cannot be verified by code analysis.

### 2. Scroll-Reveal Animation + Cursor Glow

**Test:** Scroll down the full page. Observe sections animating in. Move the mouse on desktop — observe the soft pink glow following it. Enable prefers-reduced-motion in the OS and reload — confirm content is immediately visible.
**Expected:** Sections fade/rise in on scroll; cursor glow tracks mouse; reduced-motion shows content statically.
**Why human:** Animation behavior requires live browser testing.

### 3. Lessons Modal Interaction

**Test:** Click 'пойте с нами' (nav pill) and 'записаться' (sing section). Modal opens. Fill name + contact. Submit. Network tab shows zero HTTP requests. Switch to Спасибо! state. Close with ×, click-outside, and Escape — all three must close.
**Expected:** Modal opens, fake submit shows Спасибо! with zero network requests, all three close paths work.
**Why human:** Modal interaction and Network tab inspection require a real browser.

### 4. Хоротерапия Timepad Link

**Test:** Open the lessons modal. Click the хоротерапия link.
**Expected:** Opens https://sonya-brusnika.timepad.ru/event/4010316/ in a new tab (real, live event page).
**Why human:** External URL resolution requires browser navigation.

### 5. Fonts and No-Google-Fonts Runtime Check

**Test:** Open the preview URL. Open Network tab. Filter by 'fonts'. Confirm zero requests to fonts.googleapis.com or fonts.gstatic.com. Confirm Prata (Cyrillic serif) and Golos Text (sans) render correctly in headings and body text.
**Expected:** Zero Google Fonts requests at runtime; fonts render with correct Cyrillic letterforms.
**Why human:** Runtime network behavior and Cyrillic font rendering require browser inspection.

### 6. Mobile Responsive Layout

**Test:** Open preview on mobile or DevTools at 860px width. Check: track duration column hidden, show rows use 96px date column, gallery is 2 columns, footer is single column, lessons modal is single column.
**Expected:** All responsive breakpoints work at 860px.
**Why human:** Layout at specific viewport widths requires browser.

---

## Gaps Summary

No technical gaps were found. All automated checks pass:
- Build exits 0 (both NOINDEX=true and NOINDEX=false)
- Zero Google Fonts in built output
- Noindex env gate works correctly
- Content Collections established as CMS seam with D-09 optional fields
- All three data sections use getCollection() with no hardcoded data
- Links-as-data via site.ts wired to footer and tracks header
- Scroll-reveal properly gated under .js-reveal (no flash-then-hide risk)
- Gradient-clip has @supports solid fallback
- Demo-modal has no network calls
- Raw media files are gitignored and not tracked

The 3 partial/deferred items (SHOW-02, LINK-01, LINK-02 placeholder URLs) are intentional design decisions documented as D-02/D-03 and addressed by Phase 4 (Pre-Launch Verification SC-4). They are not gaps — they are planned future work.

Status is `human_needed` because 6 behavioral items (visual fidelity, animations, modal interaction, Timepad link, runtime font check, mobile layout) require a human with a browser to confirm. The user has already approved each checkpoint during execution, so this may be a formality to record.

---

_Verified: 2026-06-24T17:28:32Z_
_Verifier: Claude (gsd-verifier)_
