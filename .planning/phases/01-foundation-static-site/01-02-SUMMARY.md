---
phase: 01-foundation-static-site
plan: 02
subsystem: static-sections
tags: [astro, webp, marquee, responsive, nav, album-banner, about, sing, data-open-lessons]

# Dependency graph
requires:
  - 01-01 (Layout shell, global.css tokens, HeroSection, Astro <Image> pipeline)
provides:
  - src/components/Nav.astro — fixed top nav with backdrop-blur, logo, nav-menu, data-open-lessons pill
  - src/components/MarqueeSection.astro — scrolling Prata text-stroke band (24s loop)
  - src/components/FeaturedAlbumSection.astro — Неоднозначное album banner with Astro <Image> WebP
  - src/components/AboutSection.astro — «о группе» section with portrait WebP
  - src/components/SingSection.astro — «пойте с нами» with lesson blocks + data-open-lessons button
  - src/pages/index.astro updated to compose all five sections in draft document order
  - Placement comments in index.astro marking Plan 03 (Tracks/Shows/Gallery) and Plan 04 (Footer/Modal) insertion points
affects:
  - 01-03 (TracksSection, ShowsSection, GallerySection insert between FeaturedAlbum and About)
  - 01-04 (Footer + BookingModal append after Sing; Plan 04 JS wires data-open-lessons)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "@supports (-webkit-text-stroke) gate for marquee color:transparent trick — solid fallback color outside gate"
    - "Astro <Image> widths=[480,860] sizes= for portrait/carpet images (lazy-loaded)"
    - "data-open-lessons attribute on both Nav pill and SingSection button — Plan 04 JS hook"
    - ".about-grid / .sing-grid class names matching global.css @media override (no !important conflict)"

key-files:
  created:
    - src/components/Nav.astro
    - src/components/MarqueeSection.astro
    - src/components/FeaturedAlbumSection.astro
    - src/components/AboutSection.astro
    - src/components/SingSection.astro
  modified:
    - src/pages/index.astro (Nav + 4 new sections imported and composed in document order)

key-decisions:
  - "@supports (-webkit-text-stroke) gate applied to MarqueeSection color:transparent — extends the 01-01 @supports lesson to text-stroke (not just background-clip)"
  - "all: unset on sing-btn preserves correct button baseline without browser-default padding/border leaking through"
  - "Scoped @media (max-width:860px) single-column rules in AboutSection/SingSection for co-location; global.css .about-grid/.sing-grid !important rules also fire — redundancy is harmless and explicit"
  - "FeaturedAlbumSection.astro: widths=[768,1180] matching actual max-width of the section container; other sections use [480,860]"

# Metrics
duration: 8min
completed: 2026-06-24
---

# Phase 01 Plan 02: Static Prose Sections Summary

**Five pixel-faithful static sections (Nav, Marquee, Featured Album, About, Sing-with-us) built from the index.html draft and composed into index.astro in draft document order, with optimized WebP images for featured/about/live-carpet, mobile responsive grids, and Plan 04 data-open-lessons hooks in place**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-06-24
- **Tasks:** 2 auto tasks complete; 1 checkpoint awaiting Vercel deploy
- **Files created:** 5 new components + 1 updated page

## Accomplishments

- Nav.astro: fixed backdrop-blur top nav with Prata logo, three .nav-link anchors, and pink «пойте с нами» pill with data-open-lessons; mobile menu hidden at 860px
- MarqueeSection.astro: 24s looping Prata text-stroke band using marquee keyframe from global.css; @supports gate on text-stroke with solid color fallback
- FeaturedAlbumSection.astro: Неоднозначное album banner — Astro <Image> at widths [768, 1180] generating 2 WebP derivatives; left gradient overlay; Spotify CTA with rel="noopener noreferrer" (T-02-01)
- AboutSection.astro: «о группе» section on #070707 raised background; two-column 1.15fr/0.85fr grid; 3/4 portrait frame via Astro <Image> (widths 480/860)
- SingSection.astro: «пойте с нами» section on #050505; 4/5 image frame (object-position center 30%); two numbered lesson blocks; «записаться» button with data-open-lessons
- index.astro: all five sections composed in draft order with explicit placement comments for Plan 03 and Plan 04 insertion points
- Build: 12 WebP derivatives generated (3 hero + 2 featured + 3 about + 3 live-carpet + 1 featured thumbnail variant); astro check 0 errors

## Task Commits

1. **Task 1: Nav, MarqueeSection, FeaturedAlbumSection** — `7c68263` (feat)
2. **Task 2: AboutSection, SingSection, index.astro composition** — `dabbd02` (feat)
3. **Task 3: Checkpoint (Vercel visual verify)** — awaiting human

## index.astro Insertion-Point Comments

```
{/* Plan 03 inserts here: TracksSection, ShowsSection, GallerySection */}
{/* Plan 04 inserts here: Footer + BookingModal markup */}
```

Both comments are live in `src/pages/index.astro` between the appropriate components.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added @supports gate for MarqueeSection text-stroke**
- **Found during:** Task 1 — applying the 01-01 lesson (critical input note in plan prompt)
- **Issue:** The draft's `color: transparent; -webkit-text-stroke` trick makes text invisible on browsers that don't support `-webkit-text-stroke`; lesson from 01-01's gradient-clip incident extends here
- **Fix:** Added solid fallback `color: rgba(243, 169, 189, 0.45)` as base; gated `color: transparent` + `-webkit-text-stroke` inside `@supports (-webkit-text-stroke: 1px #000)`. Text always visible.
- **Files modified:** src/components/MarqueeSection.astro
- **Committed in:** 7c68263 (Task 1 commit)

No other deviations — plan executed as written.

## Known Stubs

None. All five sections render real band content from the design draft. No placeholder text, no empty data sources. The «пойте с нами» pill and «записаться» button correctly carry data-open-lessons — they do not open a modal yet (that JS lands in Plan 04), which is documented behavior, not a stub.

## Threat Flags

No new threat surface beyond the plan's threat model.

| Flag | File | Description |
|------|------|-------------|
| (none) | — | All outbound links (Spotify) use `rel="noopener noreferrer"` (T-02-01 mitigated) |

## Self-Check

### Verified Files Exist

- src/components/Nav.astro: FOUND
- src/components/MarqueeSection.astro: FOUND
- src/components/FeaturedAlbumSection.astro: FOUND
- src/components/AboutSection.astro: FOUND
- src/components/SingSection.astro: FOUND
- src/pages/index.astro (updated): FOUND
- dist/_astro/featured.*.webp: FOUND (3 derivatives)
- dist/_astro/about.*.webp: FOUND (3 derivatives)
- dist/_astro/live-carpet.*.webp: FOUND (3 derivatives)

### Verified Commits Exist

- 7c68263: Task 1 — Nav, MarqueeSection, FeaturedAlbumSection
- dabbd02: Task 2 — AboutSection, SingSection, index.astro composition

## Self-Check: PASSED

---
*Phase: 01-foundation-static-site*
*Plan: 02*
*Completed: 2026-06-24*
