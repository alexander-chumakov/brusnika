---
phase: 01-foundation-static-site
plan: 01
subsystem: infra
tags: [astro, vercel, fontsource, webp, noindex, css-custom-properties]

# Dependency graph
requires: []
provides:
  - Astro 7 project scaffolded with @astrojs/vercel 11.0.0 adapter (output: static)
  - src/assets/images/ with all 11 source images (git mv from /images/)
  - src/styles/global.css with full design token set and shared keyframes
  - src/layouts/Layout.astro with self-hosted fonts, env-gated noindex, cursor-glow markup
  - src/components/HeroSection.astro — pixel-faithful hero with Astro <Image> WebP output
  - src/pages/index.astro composing Layout + HeroSection
  - .env.example (committed), .env.local (gitignored), .gitignore
  - Build green: astro check 0 errors, NOINDEX=true build exits 0
affects:
  - 01-02 (all remaining sections build on this Layout + global CSS foundation)
  - 01-03 (Content Collections, scripts)
  - 01-04 (booking, final assembly)
  - All Phase 2+ plans (inherit Layout shell, font setup, image pipeline)

# Tech tracking
tech-stack:
  added:
    - astro@7.0.2
    - "@astrojs/vercel@11.0.0"
    - "@fontsource/prata@5.2.7"
    - "@fontsource/golos-text@5.2.8"
    - photoswipe@5.4.4 (pre-installed for Phase 2, not wired)
    - "@astrojs/check (installed for astro check CI)"
  patterns:
    - CSS custom properties for all design tokens in global.css (D-10)
    - "@fontsource/*.css imports in Layout.astro frontmatter — self-hosted fonts"
    - Astro <Image> with widths/sizes/format=webp/quality/eager/fetchpriority for above-fold images (D-11)
    - import.meta.env.NOINDEX === 'true' read at build time for conditional meta tag (Pattern 4)
    - "[data-reveal] and .in scroll-reveal classes in global.css — never scoped (Pitfall 3)"
    - Scoped <style> blocks in .astro components reference var(--color-*) tokens
    - output: 'static' in astro.config.mjs (not 'hybrid' — removed in Astro 7, Pitfall 7)

key-files:
  created:
    - astro.config.mjs
    - package.json
    - package-lock.json
    - tsconfig.json
    - .gitignore
    - .env.example
    - src/styles/global.css
    - src/layouts/Layout.astro
    - src/components/HeroSection.astro
    - src/pages/index.astro
    - "src/assets/images/ (all 11 .jpg files — git mv from /images/)"
  modified:
    - src/pages/index.astro (overwritten from scaffold stub)

key-decisions:
  - "Import @fontsource/prata/400.css (explicit path) not '@fontsource/prata' bare import — avoids TypeScript ts(2882) side-effect import error in strict mode"
  - "output: 'static' confirmed correct for Astro 7 (hybrid keyword removed)"
  - "Astro <Image> generates WebP at build time via Sharp — assumption A1 CONFIRMED working without extra config"
  - "@fontsource font-display swap confirmed default — assumption A4 CONFIRMED (no override needed)"
  - "npm audit shows 3 high vulnerabilities in path-to-regexp via @astrojs/vercel transitive dep; fix would require downgrading to @astrojs/vercel@8.0.4 (breaking change, incompatible with Astro 7); left as-is, documented"

patterns-established:
  - "Pattern: Self-hosted fonts via @fontsource/pkg/weight.css import in Layout.astro frontmatter"
  - "Pattern: CSS design tokens in :root{} in global.css; all components reference var(--color-*)"
  - "Pattern: Astro <Image> with widths=[640,1024,1440,1920] sizes=100vw format=webp for hero images"
  - "Pattern: import.meta.env.NOINDEX === 'true' for env-gated conditional HTML in static builds"
  - "Pattern: [data-reveal] classes in global.css (not scoped) for JS-toggled scroll animations"

requirements-completed: [FND-01, FND-02, FND-06, FND-07]

# Metrics
duration: 6min
completed: 2026-06-24
---

# Phase 01 Plan 01: Walking Skeleton Summary

**Astro 7 + @astrojs/vercel adapter scaffolded with self-hosted Prata/Golos Text fonts, CSS design token system, and a pixel-faithful hero section served as optimized WebP — deployable Walking Skeleton proving the full Astro→Vercel pipeline**

## Performance

- **Duration:** 6 min
- **Started:** 2026-06-24T15:09:18Z
- **Completed:** 2026-06-24T15:15:28Z
- **Tasks:** 2 auto tasks complete; 1 checkpoint awaiting Vercel deploy
- **Files modified:** 16

## Accomplishments

- Astro 7.0.2 scaffolded into existing repo root with @astrojs/vercel 11.0.0, all fonts, and photoswipe pre-installed
- All 11 source images git mv'd from /images/ to src/assets/images/; hero image confirmed generating 3 WebP derivatives at build time
- Full CSS design token system (14 palette tokens, 3 font tokens, 4 keyframes, scroll-reveal classes, interactive state classes, responsive overrides) established in global.css
- Layout.astro shell: self-hosted fonts (zero Google Fonts), env-gated noindex meta, cursor-glow markup
- HeroSection.astro: pixel-faithful port of index.html hero with Astro Image, gradient overlays, gradient-clipped Prata Cyrillic h1, animated EQ bars, bobdown arrow
- NOINDEX=true build exits 0; dist/ contains zero googleapis/gstatic refs; noindex meta present; astro check 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Astro 7 + Vercel adapter, fonts, images** - `77b1389` (chore)
2. **Task 2: Global design tokens + Layout shell + HeroSection** - `849acd7` (feat)
3. **Task 3: Checkpoint (Vercel deploy)** - awaiting human deploy action

## Files Created/Modified

- `astro.config.mjs` — output: static, @astrojs/vercel adapter with staticHeaders: true
- `package.json` — astro 7, @astrojs/vercel 11, @fontsource/prata, @fontsource/golos-text, photoswipe
- `tsconfig.json` — extends astro/tsconfigs/strict
- `.gitignore` — node_modules, dist, .vercel, .astro, .env*.local
- `.env.example` — NOINDEX=true (committed reference)
- `src/styles/global.css` — all 14 CSS custom property tokens, 4 keyframes, scroll-reveal classes, interactive state classes, cross-section responsive overrides
- `src/layouts/Layout.astro` — html lang=ru, @fontsource imports, env-gated noindex meta, cursor-glow divs, slot
- `src/components/HeroSection.astro` — full hero with Astro Image (WebP), gradient overlays, Prata h1, EQ bars, bobdown arrow (260 lines)
- `src/pages/index.astro` — Layout + HeroSection composition
- `src/assets/images/` — 11 .jpg files git mv'd from /images/

## Decisions Made

- Used `@fontsource/prata/400.css` explicit path (not bare `@fontsource/prata`) to avoid TypeScript ts(2882) side-effect import error in strict mode — deviation from plan's suggested syntax but functionally identical
- Left npm audit vulnerabilities (path-to-regexp via @astrojs/vercel transitive dep) unresolved: the fix would require @astrojs/vercel@8.0.4 which is incompatible with Astro 7
- Assumption A1 (Vercel image optimization for static pages) CONFIRMED: Sharp generates WebP at build time without any extra astro.config.mjs settings
- Assumption A4 (@fontsource uses font-display: swap by default) CONFIRMED: no override needed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript strict-mode error on @fontsource bare import**
- **Found during:** Task 2 (astro check after Layout.astro creation)
- **Issue:** `import '@fontsource/prata'` caused ts(2882) "Cannot find module or type declarations for side-effect import" under strict TypeScript
- **Fix:** Changed to `import '@fontsource/prata/400.css'` (explicit CSS file path — functionally identical, resolves TypeScript)
- **Files modified:** src/layouts/Layout.astro
- **Verification:** `astro check` 0 errors after fix; NOINDEX=true build exits 0
- **Committed in:** 849acd7 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — TypeScript strict-mode import path)
**Impact on plan:** Minimal — import syntax changed to explicit CSS path; Astro bundles fonts identically; no functional difference. Fonts still self-hosted, zero Google Fonts.

## Issues Encountered

- npm create astro@latest . -- flags with non-empty directory defaulted to creating a subdirectory (`radiant-ring`). Resolved by copying scaffold files to root manually — functionally identical to in-place scaffold.
- npm audit shows 3 high-severity transitive vulnerabilities in path-to-regexp via @astrojs/vercel@11.0.0. The fix (audit fix --force) would install @astrojs/vercel@8.0.4 which is incompatible with Astro 7. Left unresolved — upstream issue, not actionable in v1.

## Known Stubs

None introduced in this plan. The hero section is fully rendered from real content (Cyrillic heading copy, gradient styling, animated EQ bars). No placeholder data.

## Threat Flags

None. Plan introduces no new network endpoints, auth paths, or trust boundaries beyond what was in the threat model. NOINDEX env var is non-secret build config (T-01-01 accepted per threat register). WebP images are static assets.

## Next Phase Readiness

- Ready for Plan 01-02: all remaining sections (marquee, featured album, tracks, about, shows, gallery, пойте с нами, footer) build on this Layout + global.css foundation
- Vercel preview URL pending checkpoint below — deploy needed to confirm A1 (Sharp WebP serving from Vercel CDN) and A2 (is:inline directive behavior)
- No blockers for Plan 01-02 — can proceed locally while Vercel deploy is arranged

## Post-checkpoint fixes

- **[Rule 1 - Bug] `f7aa253`** — Hero title `.hero-title-line` showed as "two pink bars" (invisible text) on some tablet browsers where `background-clip:text` does not paint. Added a solid `#f3a9bd` fallback color and gated the gradient text-clip behind `@supports`, with `-webkit-text-fill-color:transparent` for correct WebKit clipping. Build green; name now always readable. (Deploy handled by orchestrator.)

## Self-Check

### Verified Files Exist

- src/styles/global.css: FOUND
- src/layouts/Layout.astro: FOUND
- src/components/HeroSection.astro: FOUND
- src/pages/index.astro: FOUND
- src/assets/images/hero.jpg: FOUND (11 total images)
- dist/_astro/*.webp: FOUND (3 WebP derivatives)
- dist/index.html contains noindex meta: CONFIRMED
- dist/ contains zero googleapis/gstatic: CONFIRMED

### Verified Commits Exist

- 77b1389: Task 1 scaffold
- 849acd7: Task 2 design tokens + hero
- f7aa253: Post-checkpoint fix (hero title tablet readability)

## Self-Check: PASSED

---
*Phase: 01-foundation-static-site*
*Completed: 2026-06-24*
