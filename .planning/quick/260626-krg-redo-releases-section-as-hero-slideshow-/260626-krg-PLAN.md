---
quick_id: 260626-krg
slug: redo-releases-section-as-hero-slideshow
type: quick
autonomous: true
created: 2026-06-26
---

<objective>
Replace the WRONG releases implementation (a horizontal row of 18 small cards, ported from the `вар. карусель` design file) with the CANONICAL releases design from the main handoff file `claude_design_releases/_x/main.dc.html` (lines 199–319): a full-bleed **hero slideshow** of 3 featured releases with a **year selector** dropdown, progress bars, prev/next arrows, and 6s autoplay. The «Синглы и любимое» track list below stays as the existing TracksSection (do NOT touch it). Section keeps `id="music"`.
</objective>

<design_source>
Authoritative design: claude_design_releases/_x/main.dc.html
- Lines 199–276 = the releases header (year selector) + hero banner slideshow markup.
- Lines 614–642 = the slideshow JS state machine (autoplay, segFill, goSlide/prev/next, year menu).
Translate the design's custom DC runtime ({{ }}, sc-if) into vanilla Astro + a tiny inline <script>. Ignore lines 278–318 (that's the singles list = existing TracksSection, already on the site).
</design_source>

<tasks>

<task n="1" name="Rewrite releases.ts as 3 featured slides">
<files>src/data/releases.ts</files>
Replace the 18-item carousel array with a typed array of exactly 3 featured slides (one hero per year), in this order. Export an interface `ReleaseSlide` and `const releaseSlides: ReleaseSlide[]`.
Fields per slide: year (string), eyebrow (string), title (string), desc (string), ctaLabel (string), meta (string), image (imported asset), imagePosition (string), url (string).
All url = "https://open.spotify.com/artist/11epkfgLUMWmXsTbgfPu4B".
Import the 3 images from ../assets/images via astro:assets-compatible ESM import (so the component can pass them to <Image>): band-table.jpg, g-guitar.jpg, featured.jpg.

Slide 0 — year "2026", eyebrow "новый сингл · 2026", title "Доодури", desc "Самый свежий релиз — тёплый и негромкий, как поздняя весна.", ctaLabel "▶ слушать", meta "сингл · 15 мая 2026", image band-table.jpg, imagePosition "center 32%".
Slide 1 — year "2025", eyebrow "EP + Deluxe · 2025", title "Преисполненный", desc "Песни о свободе и взрослении — с расширенным Deluxe-изданием.", ctaLabel "▶ слушать", meta "EP · 24 октября 2025", image g-guitar.jpg, imagePosition "center 42%".
Slide 2 — year "2024", eyebrow "дебютный альбом · 2024", title "Неоднозначное", desc "Одиннадцать песен о любви, памяти и взрослении. Тёплые гитары, синтезаторы и шорох плёнки.", ctaLabel "▶ слушать целиком", meta "11 треков · 38 мин", image featured.jpg, imagePosition "center 42%".
(band-table.jpg already exists in src/assets/images — committed in a prep commit. g-guitar.jpg and featured.jpg also already exist.)
</task>

<task n="2" name="Rewrite ReleasesSection.astro as the hero slideshow">
<files>src/components/ReleasesSection.astro</files>
Fully rewrite the component (currently the wrong card-carousel). Keep <section id="music" ...> and the data-reveal scroll-reveal wrappers. Max-width 1180px, padding consistent with the design (120px 40px). Structure:

HEADER ROW (data-reveal, flex baseline, gap 16px, margin-bottom ~40px):
- mono eyebrow «релизы» (ui-monospace, letter-spacing 3px, uppercase, var(--text) per design line 202).
- A year-selector button: big Prata ITALIC accent text showing the active year (clamp(30px,3.8vw,50px), color accent) + a «▾» caret (var(--text-dim)) that rotates 180° when the menu is open (transition .28s).
- A dropdown (hidden by default) listing 2026 / 2025 / 2024 as Prata buttons (font-size 23px), each with data-i="0|1|2"; the active year is accent + weight 700, others var(--text) weight 500; container: background var(--bg), border var(--line-strong), radius 9px, padding 8px, box-shadow. A full-screen invisible overlay behind it closes the menu on outside click.

HERO BANNER (id="rel-banner", data-reveal, position relative, border-radius 5px, overflow hidden, box-shadow, margin-bottom ~58px):
- A flex track (width 100%, transition transform .6s cubic-bezier(.16,.7,.2,1)) holding the 3 slides via releaseSlides.map(...). Each slide: flex:0 0 100%, min-height clamp(330px,42vw,470px), position relative.
  - astro:assets <Image> of slide.image (widths like [768,1180], format webp, quality 85, loading "lazy"), absolutely positioned, object-fit cover, object-position slide.imagePosition.
  - A left→right dark gradient overlay: linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.36) 50%, rgba(0,0,0,0) 82%).
  - Content block (position relative, flex column, justify-end, padding clamp(28px,5vw,60px), max-width 600px): mono eyebrow (#f3a9bd) = slide.eyebrow; Prata h2 (white, clamp(36px,6vw,76px), line-height .98) = slide.title; description (#d8d4cf, max-width 400px) = slide.desc; a row with a pink CTA <a href={slide.url} target=_blank rel="noopener"> (#f3a9bd bg, #000 text, weight 600, padding 14px 28px, radius 2px) = slide.ctaLabel + a meta span (#cfcbc6) = slide.meta. White text stays white in both themes (it's on a photo).
- Progress bars (absolute, left clamp(28px,5vw,60px), bottom clamp(34px,4vw,52px), flex gap 6px, width clamp(120px,18vw,190px)): 3 segments, each a 3px track rgba(255,255,255,0.28) with an inner `.seg-fill` (white). The fill state per index: before active = width 100%; active = animates width 0→100% over 6000ms linear (keyframe `fillbar`), retriggered on each slide change; after active = width 0%.
- Prev/next arrows (absolute, right/bottom clamp, flex gap 12px): two 46px round buttons, border rgba(255,255,255,0.35), bg rgba(0,0,0,0.3), backdrop-filter blur(6px), white «←»/«→», aria-labels "предыдущий релиз"/"следующий релиз"; hover → bg #f3a9bd, color #000.

Use a scoped <style> block (translate the design's inline styles into classes; match FeaturedAlbumSection/TracksSection conventions). Include the `@keyframes fillbar { from{width:0%} to{width:100%} }`. Add a sensible mobile treatment (stack/scale text down) consistent with other sections.

INLINE <script> (vanilla, no library) — the state machine from main.dc.html lines 614–642:
- SLIDES=3; current index `i` starting 0; wrap with ((i % 3)+3)%3.
- render(): set track transform = `translateX(-${i*100}%)`; set the year-button text to ['2026','2025','2024'][i]; update dropdown active styling + aria-selected; set each progress seg fill (before=100%, active=retrigger fillbar animation by reflow, after=0%).
- autoplay: setInterval 6000ms → i++ then render. Pause on banner mouseenter (clearInterval), resume on mouseleave (restart). On any manual nav (arrow or year pick), restart the autoplay timer so the 6s cycle resets.
- arrows: prev → i--, next → i++, then render + restart timer.
- year button: toggle dropdown (rotate caret); clicking a year button (data-i) → set i, close menu, render, restart timer; outside-click overlay closes menu.
- Respect prefers-reduced-motion: if reduced, do NOT autoplay and skip the fill animation (just mark active seg full); manual nav still works.
- Guard everything on the elements existing (querySelector null-safe). Scope queries to the section/#rel-banner so it can't clash with other islands.
</task>

<task n="3" name="Verify wiring + build">
<files>src/pages/index.astro</files>
index.astro already imports ReleasesSection between MarqueeSection and TracksSection (from the prior task) — confirm it still does and that TracksSection remains right after it. No change expected unless the import is missing. Then run `npm run build` and confirm it compiles with zero errors. Do NOT add Google Fonts. Fix any build error before finishing.
</task>

</tasks>

<constraints>
- Self-hosted fonts only; NO Google Fonts.
- Keep id="music" (Nav «релизы» → #music).
- Do NOT modify TracksSection.astro, AudioPlayer.astro, or content collections.
- Both day and night themes must look correct (the slide text is white-on-photo; header/eyebrow use existing theme tokens).
- The 3 hero CTAs all point to the Spotify artist page (per-release links deferred — note in SUMMARY, like the placeholder-link tracker).
</constraints>

<success_criteria>
- releases.ts holds exactly 3 typed featured slides (2026 Доодури, 2025 Преисполненный, 2024 Неоднозначное).
- ReleasesSection renders a 3-slide hero banner with a working year selector, progress bars, arrows, and 6s autoplay (pause on hover; reduced-motion safe).
- Singles list (TracksSection) unchanged below it.
- `npm run build` passes.
</success_criteria>
