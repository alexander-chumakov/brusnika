---
quick_id: 260626-wil
slug: cover-mode-album-covers
type: quick
autonomous: true
created: 2026-06-26
---

<objective>
Add a "cover mode" slide variant to the releases hero banner (ReleasesSection.astro) for releases whose artwork is a SQUARE designed cover (not a wide promo photo). In cover mode the full square cover shows WITHOUT cropping, presented album-hero style: the same cover blurred + darkened fills the wide banner background, and the sharp full cover sits as a square next to the title/CTA text. Apply it to 3 releases: «куда летят мысли?» (remix), «неактуальное» (EP), «Пари» (single). Everything else (wide-photo slides, placeholder tiles, year filter, arrows, autoplay) stays exactly as is.
</objective>

<current_state>
- src/components/ReleasesSection.astro renders each release slide in one of two modes today: PHOTO (image present → full-bleed <Image> + left→right dark gradient + white text) or PLACEHOLDER (no image → striped --rel-* tile). Add a THIRD mode: COVER.
- src/data/releases.ts: `Release` interface has optional `image`/`imagePosition`/`desc`. Add optional `cover?: boolean`.
- 3 cover assets already exist in src/assets/images: kuda-letyat-mysli.png, neaktualnoe.jpg, pari.jpg (all square ~1:1).
- The 3 target releases currently render as placeholder tiles (no image yet).
</current_state>

<tasks>

<task n="1" name="Mark the 3 cover releases in releases.ts">
<files>src/data/releases.ts</files>
- Add `cover?: boolean;` to the `Release` interface.
- Import the 3 covers: `kuda-letyat-mysli.png`, `neaktualnoe.jpg`, `pari.jpg`.
- Set on these three existing entries `image: <import>`, `cover: true`, and a short `desc`:
  - «куда летят мысли?» (year 2025, type remix): desc "Ремикс-пак — новое прочтение трека." image kuda-letyat-mysli.png
  - «неактуальное» (year 2024, type EP): desc "Мини-альбом тихих песен между большими релизами." image neaktualnoe.jpg
  - «Пари» (year 2023, type сингл): desc "Сингл 2023 года." image pari.jpg
- Update the header doc-comment count (now 13 releases carry artwork; 6 placeholders).
- Do NOT add `imagePosition` for cover releases (cover mode shows the whole square, no crop position needed).
</task>

<task n="2" name="Implement COVER mode in ReleasesSection.astro">
<files>src/components/ReleasesSection.astro</files>
In the per-slide render, branch into three cases: `release.cover && release.image` → COVER mode; else `release.image` → existing PHOTO mode; else → existing PLACEHOLDER mode. The slide frame stays the same (`flex:0 0 100%`, `min-height: clamp(330px,42vw,470px)`, position relative, overflow hidden) so cover slides sit in the same year-panel track and work with arrows/dots/autoplay unchanged.

COVER mode markup inside the slide:
1. BLURRED BACKGROUND: the cover image filling the slide — use the imported asset's `.src` on an absolutely-positioned element (a plain `<img>` or a `<div>` with `background-image`), `inset:0; width:100%; height:100%; object-fit:cover; transform:scale(1.12); filter: blur(34px) brightness(0.5);` (scale prevents blurred edges showing through). Add a dark overlay on top: `background: linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.45) 100%);` for text contrast.
2. FOREGROUND ROW (position relative; display:flex; align-items:center; gap: clamp(20px,4vw,48px); height:100%; padding: clamp(24px,4vw,56px); max-width:1180px; margin:0 auto):
   - TEXT BLOCK (flex:1; min-width:0; max-width:480px): same content as photo slides — ui-monospace eyebrow (#f3a9bd) = release.eyebrow; Prata white title (clamp(34px,5.2vw,68px)) = release.title; optional desc (#d8d4cf, max-width 420px); a row with the pink CTA `<a>` (#f3a9bd bg, #000 text) = release.ctaLabel-equivalent (use the SAME CTA text the photo slides use — e.g. "▶ слушать") and a meta span (#cfcbc6) = release.meta. White text (over the dark blurred bg).
   - COVER SQUARE (flex:0 0 auto): a square box `aspect-ratio:1/1; height: clamp(190px, 30vw, 340px); border-radius:6px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,0.5);` containing the SHARP cover via astro:assets `<Image>` (object-fit:cover; the source is square so nothing crops). This is the full artwork, crisp.
3. RESPONSIVE (≤760px): stack to column (flex-direction:column; text-align:left or center). Put the sharp cover square ABOVE the text at a smaller size (height ~clamp(150px,42vw,210px)); keep the blurred bg. Ensure the slide min-height grows if needed so nothing overlaps (allow min-height auto / padding to expand on mobile). Keep it tidy and readable in both day and night (the blurred-dark bg + white text is theme-independent, like the photo slides).

Keep PHOTO and PLACEHOLDER modes byte-for-byte as they are. The CTA text used by photo slides today should be reused for cover slides (read the component to match the exact label/markup). Progress bars, arrows, year dropdown, autoplay, prefers-reduced-motion handling — all unchanged.
</task>

<task n="3" name="Build verify">
<files>src/pages/index.astro</files>
Run `npm run build`; MUST compile with zero errors. NO Google Fonts. Fix any error before finishing. (No index.astro change expected.)
</task>

</tasks>

<constraints>
- Only the 3 listed releases use cover mode; do not change which mode other releases use.
- Cover slides must crop NOTHING of the square artwork (the sharp square shows the full image; only the blurred background may scale/crop — that's fine, it's decorative).
- Keep id="music"; do not touch TracksSection / AudioPlayer / content collections.
- Reuse existing fonts/tokens; NO Google Fonts.
- Cover slides must still participate correctly in the strict per-year filter + arrows + dots + autoplay.
</constraints>

<success_criteria>
- «куда летят мысли?», «неактуальное», «Пари» render in cover mode: full square artwork visible (no crop) on a blurred-darkened version of the same art, with title + CTA text beside it.
- Selecting 2025 still shows only 2025 (куда летят мысли in cover mode among them); 2024 shows неактуальное in cover mode; 2023 shows Пари in cover mode. Arrows stay within year.
- Photo and placeholder slides look unchanged.
- `npm run build` passes.
</success_criteria>
