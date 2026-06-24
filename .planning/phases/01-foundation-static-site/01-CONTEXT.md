# Phase 1: Foundation & Static Site - Context

**Gathered:** 2026-06-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the existing `index.html` draft (467 lines, inline styles/JS) as a real Astro site that is **pixel-for-pixel identical** to the draft, deployable to Vercel via a shareable preview URL. In scope: all static sections (hero, marquee, featured album, tracks list, about, shows, gallery, «пойте с нами», footer), self-hosted fonts, real outbound links, shows data modeled as data, env-gated noindex, scroll-reveal + cursor-glow animations.

Out of scope (later phases): real audio playback (Phase 2), real video player (Phase 2), photo lightbox (Phase 2), social sharing (Phase 3), real Telegram booking delivery (Phase 3). In Phase 1 these surfaces ship as the draft's **lightweight demo behavior** (see D-04, D-05) — intentionally throwaway, replaced by real islands later.

Covers requirements: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, SHOW-01, SHOW-02, LINK-01, LINK-02.
</domain>

<decisions>
## Implementation Decisions

### Real Content & Placeholder Strategy
- **D-01:** **Shows** — build the shows collection schema now with sample/draft entries (the draft's 4 placeholder shows). Real dates/cities/venues/ticket URLs are deferred and wired in **Phase 4** before public launch. Do NOT block Phase 1 on band-supplied show data.
- **D-02:** **Streaming links are all confirmed real** — use real URLs for Яндекс Музыка, VK Music, Apple Music, Spotify, YouTube (Spotify/YouTube/Telegram and the хоротерапия Timepad link are already real in the draft). Per LINK-01, order **Яндекс Музыка and VK Music first**, then Spotify, Apple Music, YouTube. Yandex/VK Music real URLs to be supplied by the user (not present in the current draft markup).
- **D-03:** **Unconfirmed items keep the draft's current values for the demo** so the layout looks full for the band's review. Still-pending (carry as Phase 4 verification items, must not ship to public): ticket URLs (`#`), VK community + Instagram footer links (`#`), contact email (`hello@brusnika.ru` is a draft value, "updated after demo"). These remaining `#`/placeholder values must be tracked so Phase 4 catches every one.

### Phase-1 State of Interactive UI
- **D-04:** **Audio UI** — port the draft's demo behavior: clicking a track «слушать» pops the fake sticky now-playing bar (the ~30 lines of vanilla JS). This is intentionally **throwaway**, replaced by the real audio island in Phase 2. Keep it isolated so Phase 2 can cleanly swap it out.
- **D-05:** **Booking flow** — «записаться» / «пойте с нами» opens the lessons modal; the form submit shows the draft's fake «Спасибо!» success state. Real Telegram delivery replaces the submit handler in **Phase 3**. Keep the submit handler isolated for clean replacement.
- **D-06:** **Animations (FND-03)** — scroll-reveal (IntersectionObserver) + cursor-follow glow (guarded by `pointer:fine`) ship as **one small global vanilla-JS client script**, not Astro islands. Behavior identical to the draft.

### Content Collections Modeling (v1→v2 CMS seam)
- **D-07:** **Data scope** — Content Collections for **tracks, shows, gallery** (FND-05 required); ALSO model **streaming links and social/footer links as data** (ordering matters, links change often — clear v2 win). Section prose (about, hero, «пойте с нами» copy) stays inline in components.
- **D-08:** **Singletons** — store one-of-a-kind content (featured album, hero/about copy where data-driven, lessons info) in a **single typed site-data file** (e.g. `src/data/site.ts`); use collections only for the lists (tracks/shows/gallery).
- **D-09:** **Forward-compatible track schema** — include **optional/empty media fields** (e.g. `audioUrl`, `duration`) in the track collection schema in Phase 1 so Phase 2 is a pure data-fill with no schema migration.

### CSS / Styling & Asset Migration
- **D-10:** **Styling** — translate the draft's 100% inline styles into **central design tokens** (CSS custom properties for the palette `#000` / `#f3a9bd` / `#f2f0ee` and fonts Prata / Golos Text) in a global stylesheet, plus **per-component scoped `<style>`** for layout. Result must be **pixel-identical** to the draft; tokens exist for maintainability and the v2 path.
- **D-11:** **Images** — use Astro's built-in image optimization (`<Image>` / `<Picture>`, WebP/AVIF, `srcset`) for the `images/` assets. Faster loads (important for a media-heavy site), identical appearance. Lazy-load below-fold gallery images.

### Claude's Discretion
- Exact file/component breakdown, collection schema field names, token naming, and where the global stylesheet lives — planner/researcher decide following Astro conventions.
- How noindex is implemented in detail is already locked by prior decisions (env-gated `NOINDEX` → robots meta + `X-Robots-Tag`); see canonical refs.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The visual source of truth (rebuild target)
- `index.html` — the complete 467-line draft. THE pixel-for-pixel reference for every section, color, font, spacing, animation, and the demo JS behaviors (now-playing bar, lessons modal) that D-04/D-05 port. Match it exactly.
- `images/` — all current image assets (hero, featured, about, gallery g-*.jpg, live-*.jpg, lessons.jpg, band-guitars.jpg) referenced by the draft.

### Project planning docs
- `.planning/ROADMAP.md` § "Phase 1: Foundation & Static Site" — phase goal, success criteria (the 5 TRUE conditions Phase 1 must satisfy), requirement list.
- `.planning/REQUIREMENTS.md` § Site Foundation / Shows / Links — FND-01..07, SHOW-01/02, LINK-01/02 exact wording and acceptance phrasing.
- `.planning/PROJECT.md` — product intent, constraints, established design system (dark #000, pink #f3a9bd, Prata + Golos Text), Key Decisions table.
- `.planning/STATE.md` § "Accumulated Context" — **locked architecture decisions** (Astro+hybrid on Vercel, @fontsource self-hosted fonts, env-gated `NOINDEX`, Content Collections as v1→v2 seam, never serve media via serverless) and External Prerequisites table.
- `CLAUDE.md` § Technology Stack — verified package versions, font sources (@fontsource/prata, @fontsource/golos-text), Astro Image / Picture guidance, noindex approach, what-NOT-to-use list.

No additional external specs/ADRs — requirements and decisions are fully captured in the docs above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `index.html` — directly reusable as markup/CSS/JS source: copy structure section-by-section into Astro components, extract repeated inline styles into tokens (D-10), and port the two demo JS blocks (now-playing bar, lessons modal) verbatim (D-04, D-05).
- `images/*.jpg` — feed straight into Astro `<Image>` (D-11); filenames map 1:1 to draft `<img src>` references.
- Existing real URLs in the draft to keep: Spotify (`open.spotify.com/artist/11epkfgLUMWmXsTbgfPu4B`), YouTube (`youtube.com/@vnimaniebrusnika`), Telegram (`t.me/vnimaniebrusnika`), хоротерапия Timepad (`sonya-brusnika.timepad.ru/event/4010316/`).

### Established Patterns
- No Astro project exists yet — this phase scaffolds it (no `package.json`/`astro.config` present). Greenfield Astro structure; follow CLAUDE.md stack table.
- Design system is fixed and documented (PROJECT.md + draft inline values): dark theme, pink accent, Prata/Golos Text, film-grain/dream-pop aesthetic, scroll-reveal + cursor-glow.

### Integration Points
- Content Collections config (`src/content.config.ts`) is the v1→v2 CMS seam — components must read via `getCollection()` (per STATE.md architecture note); D-07/D-08/D-09 schemas live here.
- Track collection's optional media fields (D-09) are the integration point for the Phase 2 audio island.
- The isolated demo-JS handlers (D-04/D-05) are the integration points the Phase 2 audio island and Phase 3 Telegram endpoint will replace.
</code_context>

<specifics>
## Specific Ideas

- "Pixel-for-pixel / 1-в-1 как черновик" is a hard requirement repeated by the user — the rebuilt site must be visually indistinguishable from `index.html`. All structural decisions (tokens, components, image optimization) are invisible to the visitor by design.
- The Phase 1 build is explicitly a **private demo for the band to review** — this framed the "keep draft values so it looks full" choice (D-03) and the "keep demo behaviors alive" choices (D-04, D-05).
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (Real audio/video/lightbox/share/booking-delivery are already scoped to Phases 2–3 by the roadmap, not new ideas.)
</deferred>

---

*Phase: 1-foundation-static-site*
*Context gathered: 2026-06-24*
