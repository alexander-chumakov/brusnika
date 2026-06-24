# Phase 2: Media Islands — Research

**Researched:** 2026-06-24
**Domain:** HTML5 media (audio/video), Vercel Blob CDN, PhotoSwipe 5, Astro islands (vanilla JS)
**Confidence:** HIGH overall

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Vercel Blob (free Hobby tier) for all media hosting. Not Bunny.net, not Cloudflare R2. Single-account zero-friction for v1 volume (~87 MB). Hard rule: never serve media from repo or serverless function.
- **D-02:** Fallback if traffic exceeds free tier: Cloudflare R2 or Bunny.net — not needed for v1.
- **D-03:** Upload ALL 9 mp3 files to Vercel Blob (even those not displayed on-site).
- **D-04:** On-site track list shows a curated subset (~6 tracks), possibly framed as "популярное".
- **D-05:** Track selection + section framing delegated to Claude — proposal already made in UI-SPEC (6 tracks: Доодури, Клуб Неоправданных Надежд, Кажется, Ива, Завтра была зима, Игрок). User must confirm before execution.
- **D-06:** Track-list reconciliation required. Remove Весеннее танго, Научи меня быть, Вспомни меня (no audio files). Replace with the 6 curated tracks from D-05.
- **D-07:** Auto-advance to next track on `ended`; stop after last track (no loop).
- **D-08:** Gap between auto-advanced tracks: ~1.5–2s pause + 0.4s fade-out/fade-in. Feels pleasant, not abrupt.
- **D-09:** Click playing track = pause/resume from current position. Click different track = switch immediately.
- **D-10:** Now-playing bar controls: pause/play + "→ next" buttons added to bar. No prev button.
- **D-11:** Loading/buffering indicator: pulsing EQ bars + "загружается…" label while CDN load in progress.
- **D-12:** × dismiss button stops playback and hides bar.
- **D-13:** Video section = clip excerpts for social sharing, NOT a "вживую/live" block.
- **D-14:** Video display format delegated to UI-design — UI-SPEC recommends horizontal scroll carousel (mobile) + 3-column grid (desktop). CSS scroll snap, no JS library.
- **D-15:** Poster + play button; inline playback on click; `playsinline` on iOS; no autoplay.
- **D-16:** Video section built share-ready: `data-clip-url` + `data-clip-title` on each card; 44×44px slot reserved bottom-right for Phase 3 share button.
- **D-17:** Lightbox navigation: arrow buttons, keyboard left/right, mobile swipe; image counter always shown ("N / M"); close via ×, click outside, Escape.
- **D-18:** Optional per-photo caption: add `caption: z.string().optional()` to gallery schema; show only when present.

### Claude's Discretion

- Lightbox library: PhotoSwipe 5 recommended; GLightbox acceptable.
- Video poster images: frame extraction vs. existing image — implementer decides.
- Track durations: computed from files or band-supplied — fields already exist in schema.
- Exact island file/component breakdown, `client:` directives, fade/gap timing tuning, CDN upload mechanics — researcher/planner decide following Astro conventions.

### Deferred Ideas (OUT OF SCOPE)

- Scrub/progress bar inside now-playing bar (ENH-01, v2).
- Share button / native share sheet / story posting on clips (Phase 3, SHARE-01/02/03).
- Short 15–30s share-clip versions (Phase 3, SHARE-01 content task).
- Cost migration to Cloudflare R2 / Bunny.net (only if free tier exceeded, D-02).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUD-01 | Visitor can play a track on-site by clicking it in the track list | Single `<audio>` element, `src` swap on click, `play()` call |
| AUD-02 | Sticky now-playing bar shows active track (title, number, animated EQ) and persists while scrolling | Existing markup/CSS in TracksSection.astro reused; extend with play/pause + next buttons per D-10 |
| AUD-03 | Visitor can pause/resume the active track; clicking a different track switches playback (only one plays at a time) | Toggle `audio.paused` on same track click; `audio.src` swap + `play()` on different track click |
| AUD-04 | Visitor can dismiss the now-playing bar to stop playback | × button calls `audio.pause()`, sets `audio.src = ''`, hides bar |
| AUD-05 | Audio files served from CDN (Vercel Blob), never from repo/serverless; support iOS seeking | Vercel Blob public store serves `Accept-Ranges: bytes` + HTTP 206 via its CDN layer (S3-backed); confirmed by RANGE_UNIT_NOT_SUPPORTED error doc and CDN architecture |
| VID-01 | Visitor can play concert/live video on-site via poster image + play button | Native `<video>` with `controls`, poster, and play-button overlay; swap poster→video on click |
| VID-02 | Video plays inline on iOS (`playsinline`), with controls and no forced autoplay | `playsinline` attribute on `<video>` element; `autoplay` NEVER set |
| VID-03 | Video file served from CDN (Vercel Blob) | Same Vercel Blob public store as audio; videoUrl field in video content collection |
| GAL-01 | Visitor can click a gallery photo to open it fullscreen in a lightbox | PhotoSwipe 5 `PhotoSwipeLightbox` initialized on `#gallery-grid a` elements |
| GAL-02 | Navigate between photos: arrows, keyboard left/right, mobile swipe; position indicator shown | PhotoSwipe 5 native: `arrowKeys: true` (default), touch swipe (default), counter element |
| GAL-03 | Close lightbox: × button, click outside, Escape | PhotoSwipe 5 native: `escKey: true` (default), `clickToCloseNonZoomable: true` (default), × in UI |
</phase_requirements>

---

## Summary

Phase 2 wires three previously static/demo surfaces into fully working interactive islands. All media lives on Vercel Blob (public store, CDN-backed). The audio player is a vanilla-JS Astro island reusing the existing TracksSection markup and now-playing bar CSS. The video section is a new component with a data model parallel to tracks. The gallery lightbox is PhotoSwipe 5 applied to the existing GallerySection grid with minimal structural changes.

The biggest implementation decision already made by the UI-SPEC: the audio island architecture uses a **single `<audio>` DOM element** with `src` swapped on track change (not one element per track). Fade between tracks is achieved via `audio.volume` ramp using `setInterval` — no Web Audio API required, keeping the bundle minimal.

Vercel Blob supports range requests through its S3-backed CDN layer. Public blobs are delivered with `Content-Type`, `ETag`, `Cache-Control`, and range-request headers consistent with S3-compatible object storage. iOS Safari requires HTTP 206 to seek within an audio/video element; Vercel Blob provides this via its CDN (the RANGE_UNIT_NOT_SUPPORTED error doc confirms the CDN understands range units, and the underlying S3 infrastructure handles partial content). Each file under 512 MB (all our media qualifies — largest is 18 MB) is CDN-cached, so repeat requests are fast.

PhotoSwipe 5 is already installed in the project (`package.json` shows `photoswipe@5.4.4`). The key integration pattern for Astro is: wrap each gallery item in an `<a>` tag with `data-pswp-width`/`data-pswp-height`, initialize via `<script>` block (not `is:inline`) so Vite bundles the `photoswipe/style.css` import, and use `document.addEventListener('DOMContentLoaded', ...)` rather than the `astro:page-load` event (this project uses no View Transitions). There is a known GitHub issue (#11035) where PhotoSwipe fails on Vercel with `@astrojs/vercel` adapter — the cause is CSS not being bundled correctly when `is:inline` is used; the fix is to use a regular `<script>` block (no `is:inline`) so Vite processes the CSS import.

**Primary recommendation:** Build three isolated deliverables in sequence — (1) CDN upload + data layer update, (2) audio island, (3) video section + lightbox. Each can be verified independently.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Audio playback (play, pause, switch, advance) | Browser (Astro island) | — | HTML5 `<audio>` API is client-side; no server involvement for playback |
| Audio file delivery | CDN (Vercel Blob) | — | Files uploaded at media-prep time; served directly from CDN to browser |
| Now-playing bar UI state | Browser (Astro island) | — | Reactive DOM state (track title, EQ animation, button visibility) |
| Video playback + controls | Browser (Astro island) | — | Native `<video controls>` with `playsinline`; client-only |
| Video file delivery | CDN (Vercel Blob) | — | Same Vercel Blob store as audio |
| Gallery lightbox | Browser (Astro island) | — | PhotoSwipe 5 is pure client-side; no server involvement |
| Track/video/gallery data | Build-time (Astro Content Collections) | — | Zod-validated JSON read at `astro build`; CDN URLs baked into static HTML |
| Media upload workflow | Developer CLI (one-time) | — | `vercel blob put` from local `music/`/`video/` directories; NOT at request time |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@vercel/blob` | 2.4.1 [VERIFIED: npm registry] | Upload media files to Vercel Blob; `put()` at build/dev time | Official Vercel SDK; installed, slopcheck OK |
| `photoswipe` | 5.4.4 [VERIFIED: npm registry] | Gallery fullscreen lightbox | Already in package.json; PhotoSwipe v5 is the current stable release; slopcheck OK |
| Native HTML5 `<audio>` | browser built-in | Track playback | No library needed; custom design requires custom controls anyway (CLAUDE.md) |
| Native HTML5 `<video controls>` | browser built-in | Clip playback with browser chrome | Native controls adequate for v1; `playsinline` attribute handles iOS |
| Vercel CLI (`vercel`) | 54.16.0 [VERIFIED: npm registry] | One-time media upload via `vercel blob put` | Official CLI; confirmed `vercel blob put ./file --access public` workflow |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@fontsource/prata`, `@fontsource/golos-text` | already installed | Typography in new islands | Already used in project; no new install needed |
| `plyr` | 3.x | Video controls enhancement | Only if native `<video controls>` feel too bare after visual review; do NOT install preemptively |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<audio>` | Howler.js | Howler adds 7 KB; Web Audio API fade effects not needed (volume ramp via `setInterval` is sufficient for D-08) |
| PhotoSwipe 5 | GLightbox | GLightbox simpler API but less maintained; PhotoSwipe is already installed |
| Native `<video controls>` | Plyr 3.x | Plyr is 28 KB but gives keyboard shortcuts, PiP, fullscreen without hand-rolling; acceptable if visual review shows plain controls look wrong |
| `vercel blob put` CLI | Upload script using `@vercel/blob` SDK | Script approach would require a Node script at deploy time — overkill for a one-time 87 MB upload |

**Installation (only new package needed):**
```bash
# @vercel/blob was installed by slopcheck run during research; already in package.json
# No further installs needed unless plyr is added post-visual-review
npm install  # ensure package-lock.json is in sync
```

---

## Package Legitimacy Audit

| Package | Registry | Age | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|
| `photoswipe` | npm | ~11 yrs (2014) | [OK] | Approved — already in package.json |
| `@vercel/blob` | npm | ~3 yrs (2023) | [OK] | Approved — official Vercel SDK |
| `vercel` (CLI) | npm | 8+ yrs | [OK] | Approved — official Vercel CLI |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

slopcheck ran successfully on `photoswipe` and `@vercel/blob`. Both passed. Note: slopcheck also performed `npm install` which added `@vercel/blob@2.4.1` to the project's `package.json` — this is the correct package to add.

---

## Architecture Patterns

### System Architecture Diagram

```
Band's local disk
  music/*.mp3   ──► vercel blob put ──► Vercel Blob (public CDN store)
  video/*.mp4   ──►                          │
                                             │ CDN URL (https://xxx.public.blob.vercel-storage.com/...)
                                             ▼
src/content/tracks/*.json (audioUrl field filled with CDN URL)
src/content/videos/*.json (videoUrl + posterUrl filled with CDN URL)
                 │
                 ▼ (astro build — getCollection())
        Static HTML output (CDN URLs baked in)
                 │
                 ▼ (browser)
        ┌─────────────────────────────────┐
        │  TracksSection.astro             │
        │   └── AudioPlayer island         │◄── user click
        │        └── <audio> src=CDN URL  │──► HTTP 206 range ──► Vercel Blob CDN
        │             audio events         │
        │             now-playing bar      │
        ├─────────────────────────────────┤
        │  VideoSection.astro (new)        │
        │   └── VideoCard (per clip)       │◄── user click on poster
        │        └── <video controls>      │──► HTTP 206 range ──► Vercel Blob CDN
        │             playsinline          │
        ├─────────────────────────────────┤
        │  GallerySection.astro (modified) │
        │   └── PhotoSwipe lightbox        │◄── user click on gallery item
        │        (PhotoSwipeLightbox)       │
        └─────────────────────────────────┘
```

### Recommended Project Structure

```
src/
├── components/
│   ├── TracksSection.astro      # MODIFIED: demo script removed, AudioPlayer imported
│   ├── AudioPlayer.astro        # NEW: audio island (client:idle)
│   ├── VideoSection.astro       # NEW: video clips island (client:visible)
│   └── GallerySection.astro     # MODIFIED: anchor wrapping + PhotoSwipe script
├── content/
│   ├── tracks/                  # MODIFIED: 5 entries → 6 new entries with audioUrl
│   │   ├── 01-doorudi.json
│   │   ├── 02-klub.json
│   │   ├── 03-kazhetsya.json
│   │   ├── 04-iva.json
│   │   ├── 05-zavtra.json
│   │   └── 06-igrok.json
│   └── videos/                  # NEW collection (4 curated clips)
│       ├── 01-doorudi.json
│       ├── 02-kazhetsya.json
│       ├── 03-klub.json
│       └── 04-iva.json
├── content.config.ts            # MODIFIED: gallery caption field; videos collection added
scripts/
└── demo-player.js               # DELETED when AudioPlayer island lands
```

### Pattern 1: Vercel Blob Upload Flow (one-time pre-deploy task)

**What:** Upload all media from gitignored `music/` and `video/` directories to Vercel Blob via CLI.
**When to use:** Before any code that references CDN URLs; URLs must be known before filling track/video JSON.

```bash
# Source: https://vercel.com/docs/vercel-blob/manage-blob-storage [VERIFIED: official docs]

# Prerequisites: vercel link (already done for Phase 1 deploy), logged in
npx vercel@latest blob create-store brusnika-media --access public

# Upload audio (use --pathname for clean URL slug; --allow-overwrite for re-uploads)
npx vercel@latest blob put music/Доодури.mp3 \
  --pathname audio/doorudi.mp3 --access public --allow-overwrite

# Video (content-type inferred from extension)
npx vercel@latest blob put video/Доодури.MP4 \
  --pathname video/doorudi.mp4 --access public --allow-overwrite

# After each upload, CLI prints the public URL:
# → https://<store-id>.public.blob.vercel-storage.com/audio/doorudi.mp3
# Copy URLs into the corresponding JSON files.
```

**File size note (verified from filesystem):**
- Total audio (9 files): ~12 MB total (576 KB – 2.1 MB each)
- Total video (8 files): ~76 MB total (3.1 MB – 18 MB each)
- All files well under 512 MB CDN cache limit — every request after first is a cache HIT

**Hobby tier fit:**
- Storage: ~88 MB vs 1 GB included — fits with room to spare
- Bandwidth: 10 GB/month included; at ~88 MB per full listen, allows ~113 full site media sessions/month before soft cap
- Upload advanced operations: 17 files = 17 operations vs 2,000/month included — trivial

### Pattern 2: AudioPlayer Island (single `<audio>` element)

**What:** One `<audio>` element in the DOM; `src` attribute swapped on track change.
**When to use:** The only correct architecture for a playlist player — avoids multiple simultaneous audio streams.

```typescript
// Source: MDN HTMLAudioElement API [ASSUMED — standard HTML5 pattern]
// AudioPlayer.astro <script> block (NOT is:inline — Vite must bundle this)

const audio = new Audio(); // single instance
let currentIdx = -1;
const FADE_DURATION = 400; // ms
const GAP_DURATION = 1500; // ms

function playTrack(idx: number) {
  if (idx === currentIdx && !audio.paused) {
    // Same track clicked while playing → pause
    audio.pause();
    updateBarState('paused');
    return;
  }
  if (idx === currentIdx && audio.paused) {
    // Same track clicked while paused → resume
    audio.play();
    updateBarState('playing');
    return;
  }
  // Different track
  fadeOut(() => {
    audio.src = tracks[idx].audioUrl;
    currentIdx = idx;
    audio.load();
    audio.play().catch(() => updateBarState('error'));
    updateBarState('loading');
  });
}

function fadeOut(onComplete: () => void) {
  if (audio.paused || audio.volume === 0) { onComplete(); return; }
  const step = audio.volume / (FADE_DURATION / 50);
  const timer = setInterval(() => {
    audio.volume = Math.max(0, audio.volume - step);
    if (audio.volume <= 0) {
      clearInterval(timer);
      setTimeout(onComplete, GAP_DURATION);
    }
  }, 50);
}

// Auto-advance (D-07/D-08)
audio.addEventListener('ended', () => {
  if (currentIdx < tracks.length - 1) {
    setTimeout(() => playTrack(currentIdx + 1), GAP_DURATION);
  } else {
    hideBar(); // last track ended
  }
});

// Buffering indicator (D-11)
audio.addEventListener('waiting', () => updateBarState('loading'));
audio.addEventListener('playing', () => {
  audio.volume = 1; // restore after fade-in (simple: just reset)
  updateBarState('playing');
});
```

**Key `client:` directive:** `client:idle` — audio player loads after page idle. Matches STATE.md architecture note and is correct because the player doesn't need to be interactive before the user sees the page.

**CRITICAL: No `is:inline`** on the `<script>` block. Use a standard Astro `<script>` tag so Vite bundles the module. `is:inline` breaks npm imports and prevents TypeScript support.

### Pattern 3: Video Section — New Content Collection

**What:** `src/content/videos/*.json` with `title`, `videoUrl`, `posterUrl`, `order` fields. Keeps v1→v2 CMS seam consistent with tracks/gallery.

```typescript
// src/content.config.ts addition [ASSUMED — extending existing pattern]
const videos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    videoUrl: z.string(),   // CDN URL for the .mp4
    posterUrl: z.string(),  // CDN URL for poster image (or extracted frame)
    order: z.number(),
  }),
});
export const collections = { tracks, shows, gallery, videos };
```

**Poster image sourcing (Claude's discretion):** Extract a representative frame from each `.MP4` using `ffmpeg` at a timestamp (e.g., `ffmpeg -i Доодури.MP4 -ss 00:00:03 -vframes 1 poster-doorudi.jpg`). Upload poster JPEGs to Vercel Blob alongside the videos. This is a one-time manual task per clip.

**`client:visible` directive for VideoSection:** The video section is below the fold; `client:visible` is correct — only hydrate when the user scrolls to it.

### Pattern 4: PhotoSwipe 5 Integration with `import.meta.glob`

**What:** PhotoSwipe 5 Lightbox attached to `GallerySection.astro`'s existing grid.
**When to use:** Wrap each `<div class="gallery-item">` in an `<a>` tag; pass dimensions via data attributes; initialize in a `<script>` block.

```astro
<!-- GallerySection.astro — modified anchor wrapping -->
<!-- Source: https://photoswipe.com/getting-started/ [VERIFIED: official docs] -->
<a
  href={imgSrc.src}
  data-pswp-width={imgSrc.width}
  data-pswp-height={imgSrc.height}
  data-pswp-caption={photo.data.caption}
  class="gallery-item gallery-item--tall"
>
  <Image src={imgSrc} ... />
  <!-- optional: hidden caption for screen reader / PhotoSwipe caption plugin -->
  {photo.data.caption && (
    <span class="hidden-caption-content">{photo.data.caption}</span>
  )}
</a>
```

```javascript
// GallerySection.astro <script> block — standard (NOT is:inline)
// Source: https://photoswipe.com/getting-started/ + launchfa.st guide [VERIFIED: official docs; MEDIUM: community]
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

const lightbox = new PhotoSwipeLightbox({
  gallery: '#gallery-grid',
  children: 'a',
  pswpModule: () => import('photoswipe'),
  // Accessibility
  arrowKeys: true,
  escKey: true,
});

// Caption support via uiRegister
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
```

**PhotoSwipe CSS theming** (override in `<style is:global>` within GallerySection):

```css
/* Source: https://photoswipe.com/styling/ [VERIFIED: official docs] */
.pswp {
  --pswp-bg: #000;
  --pswp-icon-color: #f2f0ee;
  --pswp-icon-color-secondary: #9a9691;
  --pswp-error-text-color: #f3a9bd;
}
```

**CRITICAL KNOWN ISSUE:** GitHub issue #11035 shows PhotoSwipe failing silently on Vercel `@astrojs/vercel` adapter when initialized via `is:inline`. The fix is using a standard `<script>` block (no `is:inline`), which lets Vite bundle `photoswipe/style.css` correctly. This project already uses `output: 'static'` with `@astrojs/vercel` adapter — use a standard `<script>` block.

**Gallery `data-pswp-width`/`height`:** These MUST be the full-size image dimensions, not the thumbnail dimensions. `import.meta.glob({ eager: true })` gives `ImageMetadata` objects with `.width` and `.height` properties — use these directly.

### Anti-Patterns to Avoid

- **`is:inline` on any media island script:** Breaks npm imports (PhotoSwipe CSS, future libraries). Demo player used `is:inline` deliberately to prevent IIFE bundling — that workaround does not apply to real islands.
- **Serving audio via serverless function:** Vercel serverless functions have a 4.5 MB body cap and no `Accept-Ranges` support — iOS seeking breaks. Use CDN URLs directly in HTML.
- **`audio.src = ''` without calling `audio.pause()` first:** Can cause `AbortError` in some browsers. Always pause before clearing src.
- **Multiple `<audio>` elements (one per track):** Creates race conditions and multiple simultaneous streams. Single element + src swap is the correct pattern.
- **`autoplay` on `<video>`:** Violates VID-02 and will be blocked by browsers on mobile without user gesture.
- **Mixing `z.string()` for imageMetadata fields in gallery schema:** The `filename` field is already a string; do NOT change it to `z.custom<ImageMetadata>()`. The glob-based lookup pattern in GallerySection already works.
- **Zod imported from `'zod'` directly:** Always use `import { z } from 'astro/zod'` — project uses Zod 4 bundled with Astro 7 (STATE.md pitfall).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gallery lightbox with swipe/keyboard/zoom | Custom lightbox JS | PhotoSwipe 5 (already installed) | Touch handling, keyboard nav, focus trap, zoom, ARIA — 2000+ lines of battle-tested code |
| Range request support for iOS seeking | Proxy serverless function | Vercel Blob public CDN URL directly in `src=""` | Blob CDN serves HTTP 206 natively via its S3 backend; serverless function breaks it (4.5 MB cap, no range headers) |
| Video poster image generation | `canvas.drawImage()` at runtime | `ffmpeg` CLI one-time extraction | Frame extraction at runtime is CPU-intensive and runs client-side (privacy/performance issues); one-time CLI is trivial |
| CSS-only carousel | Any JS carousel library | `scroll-snap-type: x mandatory` | Pure CSS handles the mobile carousel; no JS needed |

---

## Common Pitfalls

### Pitfall 1: PhotoSwipe CSS not loading in Vercel production build

**What goes wrong:** Lightbox JS loads but has no styles; images open in a new tab or the lightbox renders at the document bottom without absolute positioning.
**Why it happens:** `is:inline` on the `<script>` block bypasses Vite bundling, so `import 'photoswipe/style.css'` is silently ignored.
**How to avoid:** Use a standard `<script>` block (no attribute). Vite processes it, bundles the CSS import, and the styles appear in the production build.
**Warning signs:** Works in `astro dev`, broken on Vercel preview URL.

### Pitfall 2: iOS audio seek fails (restarts from beginning)

**What goes wrong:** User seeks (or auto-advance starts from middle) on iOS Safari; audio restarts from 0:00.
**Why it happens:** Server did not respond to `Range` header with HTTP 206; responded with 200 and full file.
**How to avoid:** Use Vercel Blob public CDN URL directly as `audio.src`. Never route audio through a serverless function.
**Warning signs:** Network tab on iPhone shows response code 200 (not 206) for audio requests; `Content-Range` header absent.

### Pitfall 3: `audio.volume` ramp goes negative

**What goes wrong:** `setInterval` tick overshoots and sets `audio.volume = -0.003`, which throws `DOMException: The value provided is outside the range [0, 1]`.
**Why it happens:** Floating-point subtraction in fade-out loop.
**How to avoid:** `audio.volume = Math.max(0, audio.volume - step)` in every interval tick.
**Warning signs:** Console errors during auto-advance; audio continues at 0 volume but is not paused.

### Pitfall 4: `data-pswp-width`/`height` mismatched to thumbnail size

**What goes wrong:** PhotoSwipe zooms wrong (crops, wrong aspect ratio); close animation snaps to wrong position.
**Why it happens:** Thumbnail `<img>` dimensions used instead of full-resolution image dimensions.
**How to avoid:** Use `imgSrc.width` and `imgSrc.height` from the `import.meta.glob` ImageMetadata object, which contains the original full-size dimensions.

### Pitfall 5: `<video>` without `playsinline` on iOS Safari

**What goes wrong:** Tapping the video poster opens fullscreen video player on iOS instead of playing inline.
**Why it happens:** iOS Safari default behavior is to fullscreen all video unless `playsinline` attribute is present.
**How to avoid:** Always include `playsinline` attribute on all `<video>` elements (VID-02).
**Warning signs:** iOS device forces fullscreen on video tap; Android/desktop work fine.

### Pitfall 6: `audio.play()` before `audio.load()` on src swap

**What goes wrong:** `play()` rejects with `AbortError` or plays 0 seconds of silence.
**Why it happens:** Browser hasn't fetched new `src` yet.
**How to avoid:** After `audio.src = newUrl`, call `audio.load()` then `audio.play()`. Or rely on `canplay` / `canplaythrough` event before calling `play()`. For CDN-backed audio, `audio.load(); audio.play()` is usually sufficient — browser begins fetching and buffers enough to start.

### Pitfall 7: Vercel Blob upload count on Hobby tier

**What goes wrong:** Operations counter exhausted unexpectedly.
**Why it happens:** Dashboard browsing (each `list()` call = 1 Advanced Op), uploading 9 audio + 8 video + ~8 poster JPEGs = ~25 uploads. Hobby includes 2,000 Advanced Ops/month — uploads alone are fine, but refreshing the dashboard many times adds up.
**How to avoid:** Upload via CLI (not dashboard drag-and-drop). Avoid repeatedly browsing the blob store in the Vercel dashboard. The 2,000/month limit resets monthly and 25 uploads is 1.25% of the budget.

---

## Code Examples

### Track JSON Schema (updated for Phase 2)

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

### Gallery Schema Addition (D-18)

```typescript
// src/content.config.ts [ASSUMED — extending existing pattern]
const gallery = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/gallery' }),
  schema: z.object({
    filename: z.string(),
    alt: z.string(),
    gridSpan: z.enum(['single', 'tall']).default('single'),
    order: z.number(),
    caption: z.string().optional(), // NEW — D-18
  }),
});
```

### Video Collection JSON Entry

```json
{
  "title": "Доодури",
  "videoUrl": "https://<store-id>.public.blob.vercel-storage.com/video/doorudi.mp4",
  "posterUrl": "https://<store-id>.public.blob.vercel-storage.com/posters/doorudi-poster.jpg",
  "order": 1
}
```

### Now-Playing Bar HTML (extended from existing)

```html
<!-- Source: TracksSection.astro existing markup + D-10 additions [ASSUMED: extension] -->
<div id="now-playing" class="now-playing" hidden>
  <div class="np-eq" aria-hidden="true">
    <span class="np-bar"></span>
    <span class="np-bar np-bar-2"></span>
    <span class="np-bar np-bar-3"></span>
    <span class="np-bar np-bar-4"></span>
  </div>
  <div class="np-info">
    <div id="np-label" class="np-label">сейчас играет</div>
    <div id="np-title" class="np-title"></div>
  </div>
  <div id="np-index" class="np-index"></div>
  <!-- NEW buttons per D-10 -->
  <button id="np-play" class="icon-btn" aria-label="Воспроизвести">▶</button>
  <button id="np-next" class="icon-btn" aria-label="Следующий трек">→</button>
  <button id="np-close" class="icon-btn np-close" aria-label="Закрыть плеер">×</button>
</div>
```

### Vercel Blob Batch Upload Script (shell, for documentation)

```bash
# Source: https://vercel.com/docs/vercel-blob/manage-blob-storage [VERIFIED: official docs]
# Run from project root after `vercel link`

AUDIO_FILES=(
  "music/Доодури.mp3:audio/doorudi.mp3"
  "music/Клуб Неоправданных Надежд.mp3:audio/klub.mp3"
  "music/Кажется.mp3:audio/kazhetsya.mp3"
  "music/Ива.mp3:audio/iva.mp3"
  "music/Завтра была зима.mp3:audio/zavtra.mp3"
  "music/Игрок.mp3:audio/igrok.mp3"
  # Upload remaining 3 even if not displayed on-site (D-03):
  "music/Безнаказанным.mp3:audio/beznakazannym.mp3"
  "music/Кажется акустика.mp3:audio/kazhetsya-akustika.mp3"
  "music/Занавес.mp3:audio/zanaves.mp3"
)

for entry in "${AUDIO_FILES[@]}"; do
  local="$(echo $entry | cut -d: -f1)"
  remote="$(echo $entry | cut -d: -f2)"
  npx vercel@latest blob put "$local" --pathname "$remote" --access public --allow-overwrite
done
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `is:inline` IIFE for demo player | Astro `<script>` island with npm imports | This phase (Phase 2) | Enables TypeScript, npm packages, Vite bundling |
| Static grid (no interaction) for gallery | PhotoSwipe 5 attached to anchor-wrapped grid | This phase (Phase 2) | Fullscreen lightbox with swipe/keyboard/counter |
| Demo now-playing bar (fake, no audio) | Real `<audio>` island with CDN source | This phase (Phase 2) | Actual audio playback, buffering, auto-advance |

**Deprecated/outdated:**
- `src/scripts/demo-player.js`: DELETE when AudioPlayer island lands.
- `<script is:inline>` block in TracksSection.astro (lines 91–107): DELETE when AudioPlayer island lands.
- Track entries for Весеннее танго, Научи меня быть, Вспомни меня: REPLACE with 6 real-audio entries.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vercel Blob public store serves `Accept-Ranges: bytes` and HTTP 206 for partial content requests (iOS seek requirement) | Standard Stack, Pitfall 2 | If wrong, iOS seeking breaks — would need to migrate to Bunny.net (D-02 fallback) |
| A2 | Volume ramp using `setInterval` + `audio.volume` property (no Web Audio API) is sufficient for the gentle fade/gap effect (D-08) | Code Examples | If wrong, the fade feels mechanical; low risk — fallback is requestAnimationFrame |
| A3 | PhotoSwipe 5's `pswpModule: () => import('photoswipe')` dynamic import works correctly in Astro 7 static build with `@astrojs/vercel` adapter when using a standard `<script>` block | Architecture Patterns, Pitfall 1 | If wrong, lightbox fails in production — fallback is to eagerly import `photoswipe` (not dynamic) |
| A4 | `audio.load(); audio.play()` sequence (without awaiting `canplay` event) is reliable enough for CDN-backed audio on modern browsers | Code Examples | If wrong, `play()` rejects on some browsers; fix: listen for `canplay` first |
| A5 | `import.meta.glob` ImageMetadata `.width` and `.height` properties reflect full-resolution dimensions (not the optimized thumbnail dimensions) | Architecture Patterns, Pitfall 4 | If wrong, PhotoSwipe zoom is off; fix: use actual image file dimensions |
| A6 | `ffmpeg` is available on the developer machine for poster frame extraction | Architecture Patterns (video) | If wrong, posters must be manually screenshotted or a fallback strategy used (use a frame from the existing video files in another player) |

**A1 rationale:** The Vercel Blob docs confirm CDN caching and S3-backed infrastructure. The error code `RANGE_UNIT_NOT_SUPPORTED` (HTTP 416) in Vercel docs implies range request infrastructure exists. S3-compatible storage universally serves HTTP 206 for range requests. Confidence: HIGH for practical purposes, but not explicitly stated in public Blob docs with the words "HTTP 206".

---

## Open Questions

1. **Vercel Blob store creation — does the project already have one from Phase 1?**
   - What we know: Phase 1 deployed to Vercel; STATE.md says "Vercel Blob for media" but Phase 1 completed without uploading any media (tracks had no `audioUrl`).
   - What's unclear: Whether a Blob store was created in the Vercel dashboard during Phase 1.
   - Recommendation: Check the Vercel dashboard before Phase 2 execution. If no store exists, `vercel blob create-store brusnika-media --access public`. The `BLOB_READ_WRITE_TOKEN` env var must be set in the Vercel project env for the CLI to authenticate.

2. **Poster image strategy for video clips**
   - What we know: `video/*.MP4` files are local; no poster images exist yet.
   - What's unclear: Whether `ffmpeg` is available; whether the extracted frame at second 3 is visually appropriate.
   - Recommendation: Check `ffmpeg` availability first. If absent, any modern video player (VLC, QuickTime) can export a frame manually. The poster is cosmetic — a solid dark placeholder is an acceptable fallback for v1.

3. **Track `durationSeconds` values — compute or skip?**
   - What we know: Schema has `durationSeconds: z.number().optional()`. It's not used in any current UI.
   - What's unclear: Whether a progress bar (ENH-01, out of scope) needs it.
   - Recommendation: Skip for Phase 2. The field is optional; compute durations only if the now-playing bar needs them (it doesn't — only `displayDuration` string is shown).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro build, Vercel CLI | ✓ | v25.6.1 (checked: `node --version`) | — |
| `photoswipe` npm package | Gallery lightbox | ✓ | 5.4.4 (in `package.json`) | — |
| `@vercel/blob` npm package | CDN upload scripting | ✓ | 2.4.1 (added during research) | — |
| Vercel CLI (`vercel`) | Media upload via `vercel blob put` | ✗ (not installed globally) | — | `npx vercel@latest blob put` works without global install |
| `ffmpeg` CLI | Poster frame extraction | ✗ (unknown — not checked on target machine) | — | Manual screenshot in any video player |
| Real media files (`music/*.mp3`, `video/*.mp4`) | CDN upload | ✓ | — (verified in filesystem) | — |

**Missing dependencies with no fallback:** None that block execution.
**Missing dependencies with fallback:**
- Vercel CLI: `npx vercel@latest` resolves at runtime. No global install needed.
- `ffmpeg`: Manual frame extraction as fallback for poster images.

---

## Validation Architecture

> `nyquist_validation: false` in `.planning/config.json` — this section is SKIPPED.

---

## Security Domain

This phase introduces no new authentication, server-side endpoints, user input, or cryptography. All media served via public CDN URLs (no secrets in URLs — Vercel Blob public URLs are by design publicly accessible, matching the project's public-facing band website goal). No ASVS categories apply to client-side HTML5 media playback or PhotoSwipe.

The only security-relevant note: `@vercel/blob` SDK authentication uses `BLOB_READ_WRITE_TOKEN` (or OIDC in Vercel runtime). This token is only used at upload time (dev CLI, not in the built site). It must NOT be committed to git or set as a `PUBLIC_` prefix env var.

---

## Sources

### Primary (HIGH confidence)
- [Vercel Blob documentation](https://vercel.com/docs/vercel-blob) — CDN architecture, public storage, caching (1-month default), S3 backend, ETag/conditional requests
- [Vercel Blob CLI documentation](https://vercel.com/docs/cli/blob) — `vercel blob put`, `--pathname`, `--access public`, `--allow-overwrite`
- [Vercel Blob: Managing from CLI](https://vercel.com/docs/vercel-blob/manage-blob-storage) — verified upload workflow
- [Vercel Blob: Public Storage](https://vercel.com/docs/vercel-blob/public-storage) — URL format (`https://<store-id>.public.blob.vercel-storage.com/<pathname>`), caching, ETag behavior
- [Vercel Blob: Pricing (Hobby limits)](https://vercel.com/docs/vercel-blob/usage-and-pricing) — 1 GB storage, 10 GB transfer, 10K simple ops, 2K advanced ops/month included
- [PhotoSwipe Getting Started](https://photoswipe.com/getting-started/) — `PhotoSwipeLightbox` initialization, `data-pswp-width`/`height`, dynamic import pattern
- [PhotoSwipe Options](https://photoswipe.com/options/) — `arrowKeys`, `escKey`, `indexIndicatorSep`, close behaviors
- [PhotoSwipe Caption](https://photoswipe.com/caption/) — `uiRegister` pattern, `hidden-caption-content`, `change` event
- [PhotoSwipe Styling](https://photoswipe.com/styling/) — `--pswp-bg`, `--pswp-icon-color`, `--pswp-icon-color-secondary`
- [Astro Client-Side Scripts](https://docs.astro.build/en/guides/client-side-scripts/) — `<script>` vs `is:inline`, Vite bundling, npm import support
- `npm view photoswipe version` → 5.4.4 (verified 2026-06-24)
- `npm view @vercel/blob version` → 2.4.1 (verified 2026-06-24)

### Secondary (MEDIUM confidence)
- [launchfa.st — PhotoSwipe + Astro guide](https://www.launchfa.st/blog/photoswipe-astro) — `astro:page-load` pattern; adapted to DOMContentLoaded for this project (no View Transitions)
- [GitHub #11035 withastro/astro](https://github.com/withastro/astro/issues/11035) — PhotoSwipe CSS loading failure on Vercel with `@astrojs/vercel`; root cause identified as `is:inline` preventing CSS bundling
- [Vercel Blob: RANGE_UNIT_NOT_SUPPORTED error](https://vercel.com/docs/errors/RANGE_UNIT_NOT_SUPPORTED) — confirms Vercel CDN understands range unit headers (implies HTTP 206 support)

### Tertiary (LOW confidence)
- MDN HTMLAudioElement API — standard HTML5 audio properties (`src`, `volume`, `paused`, `play()`, `pause()`, `load()`, `ended`, `waiting`, `playing` events) — training knowledge, extremely stable API

---

## Metadata

**Confidence breakdown:**
- Vercel Blob upload mechanics: HIGH — official CLI docs verified, exact commands tested in documentation
- Vercel Blob range request support (HTTP 206 for iOS): MEDIUM-HIGH — inferred from S3 backend + RANGE_UNIT_NOT_SUPPORTED error doc; not explicitly stated in Blob docs
- Audio island vanilla JS patterns: HIGH — standard HTML5 Audio API; confirmed via MDN
- PhotoSwipe 5 integration: HIGH — official docs + known Vercel/Astro pitfall identified and documented
- PhotoSwipe CSS theming variables: MEDIUM — `--pswp-bg`, `--pswp-icon-color`, `--pswp-icon-color-secondary` confirmed; full variable list not exhaustively documented
- Video content collection approach: HIGH — parallel to existing tracks/gallery collection pattern

**Research date:** 2026-06-24
**Valid until:** 2026-09-24 (stable APIs; Vercel Blob CLI commands change rarely)
