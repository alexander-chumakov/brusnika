# Phase 2: Media Islands — Pattern Map

**Mapped:** 2026-06-24
**Files analyzed:** 9 new/modified files
**Analogs found:** 9 / 9

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/AudioPlayer.astro` | component (island) | event-driven | `src/components/TracksSection.astro` (now-playing bar markup + demo IIFE) | exact — replaces this code path |
| `src/components/TracksSection.astro` | component | CRUD (read collection) | self — surgical removal of `<script is:inline>` block + bar markup | self-modification |
| `src/components/VideoSection.astro` | component (island) | event-driven | `src/components/ShowsSection.astro` (list from getCollection + scoped CSS) | role-match |
| `src/components/GallerySection.astro` | component | CRUD + event-driven | self + `src/components/TracksSection.astro` (`<script>` block pattern) | self-modification |
| `src/content.config.ts` | config | transform | self — extending existing collection definitions | self-modification |
| `src/content/tracks/*.json` (6 new entries) | data | CRUD | `src/content/tracks/01-doorudi.json` | exact |
| `src/content/videos/*.json` (4 new entries) | data | CRUD | `src/content/gallery/01-studio.json` | role-match |
| `src/pages/index.astro` | page | request-response | self — import + render VideoSection between TracksSection and ShowsSection | self-modification |
| `src/scripts/demo-player.js` | utility | — | DELETE — no replacement analog needed; AudioPlayer island is the replacement | deletion |

---

## Pattern Assignments

### `src/components/AudioPlayer.astro` (island, event-driven)

**Analog:** `src/components/TracksSection.astro`

**What to copy:** The now-playing bar HTML and CSS entirely (lines 66–299); replace only the `<script is:inline>` demo IIFE with a real bundled `<script>`.

**Now-playing bar HTML to reuse** (TracksSection.astro lines 67–80):
```astro
<div id="now-playing" class="now-playing">
  <div class="np-eq">
    <span class="np-bar"></span>
    <span class="np-bar np-bar-2"></span>
    <span class="np-bar np-bar-3"></span>
    <span class="np-bar np-bar-4"></span>
  </div>
  <div class="np-info">
    <div class="np-label">сейчас играет · демо</div>
    <div id="np-title" class="np-title"></div>
  </div>
  <div id="np-index" class="np-index"></div>
  <button id="np-close" class="icon-btn np-close">×</button>
</div>
```
Extend with D-10 additions (pause/play + next buttons between `#np-index` and `#np-close`):
```html
<button id="np-play"  class="icon-btn" aria-label="Воспроизвести / пауза">⏸</button>
<button id="np-next"  class="icon-btn" aria-label="Следующий трек">→</button>
```
Change label from `"сейчас играет · демо"` to `"сейчас играет"`. Add loading label variant `"загружается…"` toggled by JS.

**Now-playing bar CSS to reuse** (TracksSection.astro lines 222–298):
Copy the full `.now-playing`, `.np-eq`, `.np-bar*`, `.np-info`, `.np-label`, `.np-title`, `.np-index`, `.np-close` rule-set verbatim into AudioPlayer's `<style>` block. Add `icon-btn` style for the two new control buttons (44px touch target minimum, `all: unset; cursor: pointer`).

**Track button `data-` attributes to read** (TracksSection.astro lines 49–53):
```astro
<button
  class="track"
  data-i={t.data.number}
  data-title={t.data.title}
>
```
AudioPlayer must also read `data-audio-url` (add to TracksSection button markup) so the island knows the CDN URL to assign to `audio.src`.

**Script pattern — standard bundled `<script>` (NOT is:inline):**
```astro
<!-- AudioPlayer.astro — real island script block -->
<script>
  // Single <audio> element; src swapped on track change
  const audio = new Audio();
  let currentIdx = -1;
  const FADE_MS = 400;
  const GAP_MS = 1500;

  // Collect track buttons with data-audio-url set
  const trackBtns = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.track[data-audio-url]')
  );

  function playTrack(idx: number) {
    if (idx === currentIdx && !audio.paused) {
      audio.pause();
      updateBarState('paused');
      return;
    }
    if (idx === currentIdx && audio.paused) {
      audio.play();
      updateBarState('playing');
      return;
    }
    fadeOut(() => {
      audio.src = trackBtns[idx].dataset.audioUrl!;
      currentIdx = idx;
      audio.load();
      audio.play().catch(() => updateBarState('error'));
      updateBarState('loading');
    });
  }

  function fadeOut(onComplete: () => void) {
    if (audio.paused || audio.volume === 0) { onComplete(); return; }
    const step = audio.volume / (FADE_MS / 50);
    const timer = setInterval(() => {
      audio.volume = Math.max(0, audio.volume - step);
      if (audio.volume <= 0) { clearInterval(timer); setTimeout(onComplete, GAP_MS); }
    }, 50);
  }

  audio.addEventListener('ended', () => {
    if (currentIdx < trackBtns.length - 1) {
      setTimeout(() => playTrack(currentIdx + 1), GAP_MS);
    } else { hideBar(); }
  });
  audio.addEventListener('waiting', () => updateBarState('loading'));
  audio.addEventListener('playing', () => { audio.volume = 1; updateBarState('playing'); });
</script>
```
**Critical rule:** No `is:inline` on this `<script>`. Vite must bundle it so TypeScript works and `photoswipe/style.css` (used in GallerySection) also bundles. See RESEARCH.md Pitfall 1.

**`client:` directive:** AudioPlayer is used as an Astro island inside TracksSection (or rendered separately in index.astro) with `client:idle`. Pattern from RESEARCH.md Pattern 2 and STATE.md architecture note.

---

### `src/components/TracksSection.astro` (modification — surgical removal)

**Analog:** self

**Lines to DELETE** (TracksSection.astro lines 66–107):
- Lines 66–80: the `<div id="now-playing">` markup block (moves to AudioPlayer.astro)
- Lines 82–107: the `<!--  D-04 throwaway demo player -->` comment + `<script is:inline>` block

**Lines to ADD in the frontmatter** (after existing `getCollection` call):
```astro
// Pass audioUrl via data attribute so AudioPlayer island can read it without props
// (island cannot receive Astro props at runtime — data-* is the bridge)
```
In the track `<button>` (line 49), add `data-audio-url={t.data.audioUrl ?? ''}`.

**Import to ADD** (after existing imports, only if AudioPlayer renders as a sibling in index.astro — see index.astro pattern below):
No import needed in TracksSection itself if AudioPlayer is placed after it in index.astro.

---

### `src/components/VideoSection.astro` (new component, island, event-driven)

**Analog:** `src/components/ShowsSection.astro`

**Frontmatter pattern** (ShowsSection.astro lines 1–16):
```astro
---
import { getCollection } from 'astro:content';

const videos = (await getCollection('videos')).sort((a, b) => a.data.order - b.data.order);
---
```

**Section structure pattern** — eyebrow + heading matches GallerySection/ShowsSection:
```astro
<section id="clips" class="video-section">
  <div data-reveal class="video-intro">
    <div class="video-eyebrow">клипы</div>
    <h2 class="video-title">Послушать <span class="video-accent">и поделиться</span></h2>
  </div>
  <!-- carousel / grid of VideoCard items -->
</section>
```
Eyebrow CSS (copy from ShowsSection.astro lines 71–77 `.shows-eyebrow`, rename to `.video-eyebrow`):
```css
.video-eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 16px;
}
```

**Video card markup** — native `<video>` with poster and play overlay (D-15):
```astro
{videos.map((v) => (
  <div
    class="video-card"
    data-clip-url={v.data.videoUrl}
    data-clip-title={v.data.title}
  >
    <video
      src={v.data.videoUrl}
      poster={v.data.posterUrl}
      controls
      playsinline
      preload="none"
      class="video-el"
    ></video>
    <!-- Phase 3 share button slot — bottom-right 44×44px (D-16) -->
    <div class="video-share-slot" aria-hidden="true"></div>
    <p class="video-title-label">{v.data.title}</p>
  </div>
))}
```
Note: `preload="none"` avoids loading all video files on page load. `playsinline` is mandatory (Pitfall 5 in RESEARCH.md).

**Carousel CSS pattern** — pure CSS scroll-snap (no JS library, per RESEARCH.md "Don't Hand-Roll"):
```css
.video-carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}
.video-carousel::-webkit-scrollbar { display: none; }

.video-card {
  scroll-snap-align: start;
  flex: 0 0 280px; /* mobile: one card visible + peek of next */
}

@media (min-width: 860px) {
  .video-carousel {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow-x: unset;
    scroll-snap-type: unset;
  }
}
```

**`client:visible` directive:** VideoSection is below-the-fold; use `client:visible` in index.astro so hydration defers until scroll.

**Phase 3 hook (D-16):** Each card already has `data-clip-url` + `data-clip-title` and `.video-share-slot` (44×44px reserved bottom-right slot). Phase 3 just populates that slot — no structural rebuild.

---

### `src/components/GallerySection.astro` (modification — add lightbox)

**Analog:** self (existing grid) + PhotoSwipe 5 integration pattern from RESEARCH.md Pattern 4

**Anchor wrapping change** (currently lines 36–58 — wrap `<div class="gallery-item">` in `<a>`):
```astro
{photos.map((photo) => {
  const imgPath = `../assets/images/${photo.data.filename}`;
  const imgModule = galleryImages[imgPath];
  const imgSrc = imgModule?.default;
  return (
    <a                                          <!-- WAS: <div -->
      href={imgSrc?.src ?? '#'}
      data-pswp-width={imgSrc?.width}           <!-- full-res dimensions from ImageMetadata -->
      data-pswp-height={imgSrc?.height}
      data-pswp-caption={photo.data.caption}    <!-- optional D-18 field -->
      class={`gallery-item${photo.data.gridSpan === 'tall' ? ' gallery-item--tall' : ''}`}
    >
      {imgSrc && (
        <Image src={imgSrc} alt={photo.data.alt} ... class="gallery-img" />
      )}
      {photo.data.caption && (
        <span class="hidden-caption-content">{photo.data.caption}</span>
      )}
    </a>                                        <!-- WAS: </div> -->
  );
})}
```
Use `imgSrc.width` / `imgSrc.height` from `import.meta.glob` ImageMetadata — NOT the thumbnail dimensions (Pitfall 4 in RESEARCH.md).

**Script block** — standard bundled `<script>` (NOT is:inline, Pitfall 1):
```astro
<script>
  import PhotoSwipeLightbox from 'photoswipe/lightbox';
  import 'photoswipe/style.css';

  const lightbox = new PhotoSwipeLightbox({
    gallery: '#gallery-grid',
    children: 'a',
    pswpModule: () => import('photoswipe'),
    arrowKeys: true,
    escKey: true,
  });

  lightbox.on('uiRegister', function () {
    lightbox.pswp.ui.registerElement({
      name: 'custom-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      html: '',
      onInit: (el, pswp) => {
        pswp.on('change', () => {
          const curr = pswp.currSlide.data.element;
          const caption = curr?.querySelector('.hidden-caption-content');
          el.innerHTML = caption ? caption.innerHTML : '';
        });
      },
    });
  });

  lightbox.init();
</script>
```

**PhotoSwipe theming** — add `<style is:global>` block (after existing scoped `<style>`):
```css
.pswp {
  --pswp-bg: #000;
  --pswp-icon-color: #f2f0ee;
  --pswp-icon-color-secondary: #9a9691;
  --pswp-error-text-color: #f3a9bd;
}
.hidden-caption-content { display: none; }
.pswp__custom-caption {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-text-dim);
  text-align: center;
  padding: 8px 16px;
}
```

**`#gallery-grid` id** — add `id="gallery-grid"` to the existing `<div class="gallery-grid">` (line 35 currently has no id). PhotoSwipe selector depends on this.

---

### `src/content.config.ts` (modification — add videos collection + gallery caption field)

**Analog:** self — extending the existing pattern

**Import pattern** (lines 1–17 — unchanged):
```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';  // ALWAYS astro/zod — never 'zod' directly
```

**Gallery schema addition** (line 48, after existing `order: z.number()`):
```typescript
caption: z.string().optional(), // D-18: photographer credit or location; absent = no caption shown
```

**New videos collection** (add after `gallery` definition, before `export`):
```typescript
const videos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    videoUrl: z.string(),    // CDN URL — https://<store>.public.blob.vercel-storage.com/video/...
    posterUrl: z.string(),   // CDN URL for poster JPEG
    order: z.number(),
  }),
});
```

**Updated export** (line 52):
```typescript
export const collections = { tracks, shows, gallery, videos };
```

---

### `src/content/tracks/*.json` — 6 new entries (replace 5 existing)

**Analog:** `src/content/tracks/01-doorudi.json` (exact shape)

**Delete:** `01-doorudi.json`, `02-vesennee-tango.json`, `03-klub-neopravdannykh-nadezhd.json`, `04-nauchi-menya-byt.json`, `05-vspomni-menya.json`

**Create 6 new files** with Phase 2 shape (existing optional fields now filled):
```json
{
  "number": "01",
  "title": "Доодури",
  "subtitle": "· сингл 2026",
  "displayDuration": "4:18",
  "audioUrl": "https://<store-id>.public.blob.vercel-storage.com/audio/doorudi.mp3",
  "durationSeconds": 258
}
```
`durationSeconds` is optional (schema already allows it); include when available. Files: `01-doorudi.json`, `02-klub.json`, `03-kazhetsya.json`, `04-iva.json`, `05-zavtra.json`, `06-igrok.json`.

---

### `src/content/videos/*.json` — 4 new entries (new directory)

**Analog:** `src/content/gallery/01-studio.json` (same pattern: flat JSON, no magic fields)

**Shape:**
```json
{
  "title": "Доодури",
  "videoUrl": "https://<store-id>.public.blob.vercel-storage.com/video/doorudi.mp4",
  "posterUrl": "https://<store-id>.public.blob.vercel-storage.com/posters/doorudi-poster.jpg",
  "order": 1
}
```
Files: `01-doorudi.json`, `02-kazhetsya.json`, `03-klub.json`, `04-iva.json`.

---

### `src/pages/index.astro` (modification — add VideoSection between TracksSection and AboutSection)

**Analog:** self (lines 1–40)

**Import to add** (after line 19 `import TracksSection`):
```astro
import VideoSection from '../components/VideoSection.astro';
```

**Render position** (after `<TracksSection />`, before `<AboutSection />`):
```astro
<TracksSection />
<AudioPlayer client:idle />     <!-- new — real audio island -->
<VideoSection client:visible /> <!-- new — below fold -->
<AboutSection />
```
`AudioPlayer` is placed immediately after `TracksSection` so the now-playing bar is in the DOM when track buttons are rendered. `VideoSection` uses `client:visible` (below fold). No `client:` directive on `TracksSection` or `GallerySection` themselves — they remain static components; only the island script blocks they contain are client-executed.

---

## Shared Patterns

### Design Token Usage
**Source:** `src/styles/global.css` lines 1–30
**Apply to:** All new component `<style>` blocks

Use CSS custom properties exclusively. Never hardcode color values:
```css
/* Correct */
color: var(--color-text);
border-color: var(--color-accent);

/* Wrong */
color: #f2f0ee;
```
Full token reference: `--color-bg` (#000), `--color-bg-raised` (#070707), `--color-accent` (#f3a9bd), `--color-accent-hover` (#ffc0d0), `--color-text` (#f2f0ee), `--color-text-muted` (#bdb9b4), `--color-text-subtle` (#9a9691), `--color-text-dim` (#7d7974), `--color-text-dimmer` (#5f5b56), `--color-border` (rgba(255,255,255,0.08)), `--font-serif` (Prata), `--font-sans` (Golos Text), `--font-mono` (ui-monospace).

### Scroll-Reveal Animation
**Source:** `src/layouts/Layout.astro` lines 93–110 (globalAnimations IIFE) + `src/styles/global.css`
**Apply to:** New section intro divs in VideoSection

Add `data-reveal` attribute to section intro containers (eyebrow + heading):
```astro
<div data-reveal class="video-intro">...</div>
<div data-reveal class="video-carousel">...</div>
```
The existing `IntersectionObserver` in `global-animations.js` picks these up automatically. No additional JS needed.

### Content Collection Data Loading
**Source:** `src/components/TracksSection.astro` lines 12–17 and `src/components/GallerySection.astro` lines 16–19
**Apply to:** `VideoSection.astro` frontmatter

```astro
---
import { getCollection } from 'astro:content';
const items = (await getCollection('videos')).sort((a, b) => a.data.order - b.data.order);
---
```
Always import `getCollection` from `'astro:content'` (not content.config.ts). Sort by `order` field for deterministic display.

### Section + Eyebrow Heading CSS
**Source:** `src/components/ShowsSection.astro` lines 61–88 (`.shows-section`, `.shows-eyebrow`, `.shows-title`, `.shows-accent`)
**Apply to:** `VideoSection.astro` section container

Copy the `.shows-section` / `.shows-eyebrow` / `.shows-title` / `.shows-accent` rules and rename the class prefix to `.video-`. Sizing values to preserve:
- Section `max-width: 1180px; margin: 0 auto; padding: 130px 40px 110px`
- Eyebrow: `font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--color-accent)`
- Section heading: `font-size: clamp(32px, 5vw, 62px); font-weight: 400; font-family: var(--font-serif)`

### Zod Schema Pattern
**Source:** `src/content.config.ts` lines 1–17 (imports), lines 19–29 (tracks schema as model)
**Apply to:** new `videos` collection definition and gallery `caption` field

```typescript
import { z } from 'astro/zod';  // Always astro/zod — never 'zod'
```
All new fields follow the existing style: one schema field per line with an inline comment explaining purpose and which decision/phase populates it.

### `<script>` Block Rule (No `is:inline` on Islands)
**Source:** RESEARCH.md Pitfall 1 + Pattern 2
**Apply to:** `AudioPlayer.astro` script block, `GallerySection.astro` PhotoSwipe script block

Standard `<script>` (no attribute) = Vite bundles the module, npm imports work, TypeScript works.
`<script is:inline>` = only acceptable for render-blocking IIFEs that must not be bundled (pattern already used in `Layout.astro` for `global-animations.js` and `demo-modal.js`).

---

## No Analog Found

All files have a close match in the codebase. No purely novel patterns are required.

| File | Role | Data Flow | Note |
|------|------|-----------|------|
| Upload shell script (`scripts/upload-media.sh`) | utility | file-I/O | No shell script analog in codebase; pattern comes from RESEARCH.md Pattern 1 (Vercel Blob CLI workflow). Not an Astro file — no pattern needed. |

---

## Metadata

**Analog search scope:** `src/components/`, `src/content/`, `src/data/`, `src/pages/`, `src/scripts/`, `src/layouts/`, `src/content.config.ts`, `src/styles/global.css`
**Files scanned:** 20
**Pattern extraction date:** 2026-06-24
