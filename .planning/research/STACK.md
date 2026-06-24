# Stack Research

**Domain:** Russian-language dream-pop band one-page marketing website
**Researched:** 2026-06-24
**Confidence:** HIGH (Astro/Vercel/Bunny verified via official docs and npm; audio player pattern verified via MDN and community sources; Telegram bot pattern verified via grammY official docs)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Astro | 5.x (current: 5.x; npm shows `astro@latest` → 7.0.2 as of research date — use `astro@latest`) | Static site generator with islands | Ships zero JS by default for static sections; islands for audio player, lightbox, share widget; clean path to v2 CMS via content collections |
| @astrojs/vercel | 11.0.0 | Vercel deployment adapter | Required for hybrid mode (static pages + one serverless endpoint for the Telegram bot); official Astro adapter |
| Node.js | 22.12.0+ | Runtime | Required by Astro v6+; Vercel uses Node 22 runtime by default |
| TypeScript | 5.x (bundled with Astro) | Type safety | Astro ships with TS support built in; no separate install needed |

> **Note on Astro version:** Context7 docs reference Astro 6 upgrade (dropping Node 18/20, requiring Node 22). The `npm view astro version` returned 7.0.2 at research time. Use `npx @astrojs/upgrade` to pull latest; the architecture is identical across 5/6/7. Verify with `npm view astro version` at project creation time.

### Media Delivery — Recommended: Bunny.net (Storage + CDN)

**Decision: Bunny.net Storage Zone + CDN for audio and video. Bunny Stream for video if adaptive streaming is needed.**

| Service | Purpose | Pricing (verified) | Why |
|---------|---------|-------------------|-----|
| Bunny Storage (HDD, single region) | Store MP3 audio files and MP4/WebM video files | $0.01/GB/month; $1/month minimum | Cheapest durable object storage; internal egress to Bunny CDN is free |
| Bunny CDN | Deliver audio and video files globally | $0.01/GB (Europe/North America); $0.06/GB (APAC) | Internal Bunny Storage → Bunny CDN transfer is free; end-user CDN delivery is pay-as-you-go |
| Bunny Stream (optional, video only) | Adaptive bitrate video transcoding + player | $0.005/GB delivery; $0.01/GB storage; free transcoding and player | Use if you want HLS adaptive streaming and the Bunny player; skip if raw MP4 delivery suffices |

**Why NOT Vercel Blob for audio/video:**
Vercel Blob costs $0.023/GB storage and $0.05/GB data transfer. Any audio file > 512 MB causes a cache MISS on every request, generating additional Fast Origin Transfer charges. For a band site with 5–10 audio tracks at ~10 MB each, Blob is marginally acceptable on cost — but it has no built-in audio streaming semantics, no Range request optimisation, and no CDN layer optimised for media. Bunny is purpose-built for this use case at 2.5–5x lower bandwidth cost.

**Why NOT Cloudinary:**
Cloudinary free tier is limited; paid plans start at ~$99/month. Audio and video delivery is not its strength. Overkill for a one-page band site with self-hosted media.

**Why NOT Mux:**
Mux charges per encoding minute and is excellent for video analytics and player quality. For a band site with a handful of concert clips and no analytics requirement, Bunny Stream delivers the same adaptive video for a fraction of the cost (pay-as-you-go per GB, not per minute).

**Why NOT raw repo / Vercel public assets:**
Vercel intentionally recommends against serving large media from git repositories or Vercel itself. Files over 512 MB miss cache entirely. No streaming/Range support. Repo size balloon causes deployment slowdowns.

### Media Delivery — Realistic Cost Estimate

Assume: 5 audio tracks × 10 MB = 50 MB audio; 3 concert clips × 200 MB = 600 MB video; 1,000 unique plays/month.
- Storage: ~0.65 GB × $0.01 = **$0.007/month** (effectively just the $1 minimum)
- Bandwidth: ~650 MB × 1,000 plays × $0.01/GB = **$6.50/month** (if every visitor played every track, which won't happen — realistic cost ~$1–3/month)
- **Total: $1–3/month all-in for v1 traffic volumes.**

### Audio Player

| Approach | Recommendation | Why |
|----------|---------------|-----|
| Custom Astro island + vanilla JS + HTML5 `<audio>` element | **Use this** | The existing design already has a custom now-playing bar with its own visual language (pink equaliser bars, Prata font track titles, fixed bottom bar). Any third-party player library will fight the design. The HTML5 Audio API is sufficient: `audio.play()`, `audio.pause()`, `audio.currentTime`, `audio.duration`, `timeupdate` event for progress, `ended` event for next-track. Wrap in an Astro island with `client:visible` directive. |
| Howler.js (2.x) | Fallback only | Adds ~7 KB gzipped; useful if you need Web Audio API equaliser effects or cross-browser fade. Not needed for basic playback. LOW priority. |
| Plyr, APlayer, jPlayer | Do NOT use | All impose their own UI chrome that would conflict with the bespoke dark pink design. Not worth the fight. |

**Pattern:** One `<AudioPlayer>` Astro component (island, `client:idle`) receives a playlist prop (array of `{title, src, duration}`). It manages a single `<audio>` element, exposes play/pause/seek, and drives the existing now-playing bar markup. Tracks on the page fire a custom event to the player. Zero framework dependency — pure vanilla JS inside an Astro component script block, or as a `.astro` island with a `<script>` tag.

### Video Player

| Approach | Recommendation | Why |
|----------|---------------|-----|
| Native HTML5 `<video>` with custom controls | **Use this for v1** | For 2–3 concert clips, a styled HTML5 video element with `controls` hidden and a thin custom control strip is sufficient. The dark theme and pink accent are trivially applied via CSS. No library needed. |
| Plyr (3.x) | Acceptable alternative | 28 KB gzipped; wraps native video with a polished custom control layer. Worth adding if you want keyboard shortcuts, fullscreen, and pip without writing them yourself. CSS variables allow full theme override to match the pink/dark palette. Install: `npm install plyr`. |
| Bunny Stream player (iframe embed) | Use if using Bunny Stream for video | Bunny provides a free embeddable player with HLS support. Embed via `<iframe>` into an Astro component. Loses some design control but is zero-JS on your side. |
| Video.js, Vimeo SDK | Do NOT use | Video.js is 300 KB+. Vimeo means losing self-hosted control, which is the band's explicit requirement. |

**Recommendation:** Start with native `<video controls>` styled with CSS. Upgrade to Plyr if the client wants keyboard shortcut support or a more polished control strip.

### Image Gallery / Lightbox

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|-----------|
| Astro `<Image />` / `<Picture />` | built-in | Serve optimised WebP/AVIF with correct `srcset` and `sizes`; lazy-load below-fold gallery images | HIGH |
| PhotoSwipe | 5.x | Fullscreen lightbox with touch/swipe/pinch-zoom on mobile | HIGH |

**PhotoSwipe v5** is the recommended lightbox. It is pure JavaScript (no React/Vue dependency), touch-first, actively maintained, and has documented Astro integration patterns as of 2025. Install: `npm install photoswipe`. Initialise in an Astro island or a `<script>` tag with `client:load`. PhotoSwipe v5 reads `data-pswp-src` / `data-pswp-width` / `data-pswp-height` from anchor tags wrapping gallery images — pair this with Astro's `getImage()` to pre-compute dimensions at build time.

**Gallery images** (the 5-image mosaic grid from the existing design) live in `src/assets/gallery/`. Use Astro's `<Picture />` with `formats={['avif','webp']}` and `loading="lazy"`. The hero and about images above the fold use `priority` to avoid LCP regression.

### Booking Form → Telegram Bot

| Technology | Purpose | Confidence |
|------------|---------|-----------|
| Astro API route (`src/pages/api/book.ts`) | Serverless POST endpoint on Vercel | HIGH |
| grammY (`grammy` npm package) | Send messages to Telegram Bot API from serverless function | HIGH — official Vercel hosting guide exists |
| Telegram Bot API (sendMessage) | Deliver form submissions to Соня's Telegram | HIGH |

**Pattern:**
1. Form submits via `fetch('/api/book', {method:'POST', body: JSON.stringify(data)})` — no page reload.
2. The serverless function at `src/pages/api/book.ts` (Astro endpoint) reads the body and calls `https://api.telegram.org/bot<TOKEN>/sendMessage` with the chat ID and a formatted Russian-language message.
3. No webhook needed for a booking form — the endpoint calls the Telegram HTTP API directly (outbound POST). Webhooks are only needed if the bot needs to receive and respond to Telegram messages interactively.
4. `BOT_TOKEN` and `CHAT_ID` stored as Vercel environment variables, never in code.
5. The Astro config uses `output: 'hybrid'` (default-static with opt-in server routes) so only this one route renders server-side; all other pages are pre-rendered static HTML.

**grammY vs raw fetch:** For a simple one-way "send a message" use case, a plain `fetch` to the Telegram Bot API is sufficient — no grammY needed. Use grammY only if the bot grows to handle replies or commands.

### Social Sharing

| Technology | Purpose | Notes |
|------------|---------|-------|
| `navigator.share()` (Web Share API) | Native mobile share sheet | Supported on iOS Safari, Android Chrome, and most modern mobile browsers. Triggers the OS share sheet — VK, Telegram, Instagram all appear if installed. |
| Fallback share links | Desktop and unsupported browsers | Construct static share URLs: `https://t.me/share/url?url=…&text=…` (Telegram), `https://vk.com/share.php?url=…` (VK), `https://www.instagram.com/` (Instagram has no web share URL — link to profile instead). |

**Implementation pattern:** Share button calls `if (navigator.canShare?.()) { await navigator.share({title, text, url}) } else { window.open(fallbackUrl) }`. No library needed — 10 lines of vanilla JS. The `files` parameter of Web Share API allows sharing a media clip directly, but this requires the file to be fetched as a `Blob` first and the target app to accept files via the share sheet (Telegram and some Android apps do; Instagram Stories requires their SDK which is not available from web).

### Noindex — Pre-launch

Two complementary layers required; both are simple:

**Layer 1 — Meta tag in every page `<head>`:**
```html
<meta name="robots" content="noindex, nofollow">
```
Add to the base Astro layout. Remove at launch.

**Layer 2 — Vercel HTTP header via `vercel.json`:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [{ "key": "X-Robots-Tag", "value": "noindex" }]
    }
  ]
}
```

**Why both:** The meta tag covers crawlers that parse HTML. The `X-Robots-Tag` header covers crawlers that don't render JS. Vercel preview deployments already get `X-Robots-Tag: noindex` automatically, but production deployments on a custom domain do not — the `vercel.json` header rule is the belt to the meta tag's suspenders.

**At launch:** Remove the meta tag from the layout and delete the header rule from `vercel.json`.

### Fonts

| Font | Source | Why |
|------|--------|-----|
| Prata (serif) | Google Fonts | Already in the design; headings, track numbers, marquee. Use `display=swap` and `<link rel="preconnect">` |
| Golos Text (sans-serif) | Google Fonts | Body text; already in the design. |

Both fonts are already loaded in the existing `index.html`. In Astro, move them to the base layout `<head>`. For performance, consider self-hosting via `@fontsource/prata` and `@fontsource/golos-text` to eliminate the Google Fonts third-party request — especially relevant for Russian audience (Google can be slow in Russia).

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `photoswipe` | 5.x | Gallery lightbox | Required for fullscreen photo viewing |
| `@astrojs/vercel` | 11.0.0 | Vercel adapter | Required — enables hybrid output mode |
| `plyr` | 3.x | Video player controls | Optional — use if native `<video>` controls feel too bare |
| `@fontsource/prata` | latest | Self-hosted Prata font | Optional but recommended for Russian users (avoids Google Fonts latency) |
| `@fontsource/golos-text` | latest | Self-hosted Golos Text | Same rationale as above |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite (bundled with Astro) | Dev server and bundler | No separate install; Astro uses Vite internally |
| TypeScript (bundled with Astro) | Type checking | Astro generates `tsconfig.json` on `create astro` |
| `astro check` | Type-safe Astro component linting | Run in CI; catches template errors |
| Vercel CLI (`vercel`) | Local preview of serverless functions | `vercel dev` runs the `/api/book.ts` route locally |
| `.env.local` | Secret management in dev | `BOT_TOKEN`, `CHAT_ID` — never commit |

---

## Installation

```bash
# Scaffold a new Astro project (choose "Empty" template)
npm create astro@latest brusnika-site -- --template empty --typescript strict

cd brusnika-site

# Core adapter
npm install @astrojs/vercel

# Gallery lightbox
npm install photoswipe

# Self-hosted fonts (optional but recommended)
npm install @fontsource/prata @fontsource/golos-text

# Video player (install only if needed after evaluating native <video>)
# npm install plyr

# Dev tooling
npm install -D vercel
```

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|------------------------|
| Media storage | Bunny.net Storage + CDN | Vercel Blob | Only if you want zero additional accounts and traffic is very low (< 5 GB/month total); Blob becomes expensive per-GB at scale |
| Media storage | Bunny.net Storage + CDN | Cloudflare R2 + CDN | If you already have a Cloudflare account; R2 egress is free but setup is more complex |
| Video hosting | Bunny Storage (MP4) / Bunny Stream | Mux | If you need video analytics, viewer quality data, or a polished player SDK; worth it for a video-first product, overkill for 2–3 clips |
| Audio player | Custom vanilla JS island | Howler.js | If you need Web Audio API features (EQ, spatial audio, fade effects) beyond basic play/pause/seek |
| Lightbox | PhotoSwipe 5 | GLightbox | GLightbox is simpler to set up; use if PhotoSwipe v5's API feels heavy for the project |
| Video player | Native `<video>` / Plyr | Video.js | Never for this project — Video.js is 300 KB+ and designed for broadcast-level control surfaces |
| Telegram endpoint | Plain fetch to Bot API | grammY library | Use grammY if the bot needs to receive and respond to Telegram messages (not needed for a one-way booking form) |
| Fonts | Self-hosted `@fontsource/*` | Google Fonts CDN | Google Fonts CDN is acceptable if Russian CDN latency is not a concern; self-hosting eliminates the risk |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Raw MP3/MP4 files in the git repo or Vercel `public/` | Vercel explicitly warns against serving large media from deployments; files > 512 MB never cache; repo size balloons; deployment is slow | Bunny.net Storage + CDN |
| React or Next.js for this project | No SSR needed; mostly static; React runtime (40+ KB) is wasted budget for a one-page site | Astro with vanilla JS islands |
| Any audio/video player library that ships its own UI (Plyr excepted) | The design system is too specific — custom dark/pink player bar already designed | Custom vanilla JS + HTML5 `<audio>` |
| YouTube/Vimeo embed for self-hosted video | Band explicitly wants self-hosted control; embeds leak user data to Google/Vimeo and show competitor recommendations | Bunny Storage MP4 or Bunny Stream |
| Cloudinary for audio | Cloudinary is an image/video transformation platform; no audio support; paid tiers expensive | Bunny.net |
| Email as booking delivery (SMTP/SendGrid) | Russian audience is Telegram-native; Соня monitors Telegram; email adds latency and inbox-monitoring burden | Telegram Bot API direct |
| Password-protected deployment for noindex | Adds friction for stakeholders reviewing the pre-launch site | Meta noindex + X-Robots-Tag header |

---

## astro.config.mjs Shape

```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'hybrid',       // static by default; /api/book.ts opts in to server
  adapter: vercel({
    maxDuration: 10,      // Telegram API call well within 10s
  }),
  image: {
    // Vercel Image Optimization for <Image /> components
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
```

---

## Hybrid Output: Which Pages Are Server-Rendered

| Route | Mode | Why |
|-------|------|-----|
| `src/pages/index.astro` | Prerendered (static) | The entire marketing page; no dynamic data |
| `src/pages/api/book.ts` | Server (on-demand) | Needs to call Telegram API at request time |

In Astro hybrid mode, pages are static by default. Add `export const prerender = false` to `src/pages/api/book.ts` to make it a serverless function. All other pages remain static HTML deployed to Vercel's edge network.

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `astro@7.x` | `@astrojs/vercel@11.0.0` | Verified via npm at research date |
| `astro@7.x` | Node 22.12.0+ | Astro v6+ dropped Node 18/20 |
| `photoswipe@5.x` | Any Astro version | Pure JS, no framework dependency |
| `plyr@3.x` | Any Astro version | Pure JS; import CSS separately |
| `@fontsource/*` | Any Astro version | Import in layout `<head>` or base CSS |

---

## Sources

- `npm view astro version` → 7.0.2 (verified 2026-06-24) — HIGH confidence
- `npm view @astrojs/vercel version` → 11.0.0 (verified 2026-06-24) — HIGH confidence
- [Astro Vercel Adapter Docs](https://docs.astro.build/en/guides/integrations-guide/vercel/) — official; hybrid mode, maxDuration — HIGH confidence
- [Vercel Blob Pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing) — official; $0.023/GB storage, $0.05/GB transfer, 512 MB cache limit — HIGH confidence
- [Bunny Stream Pricing](https://bunny.net/pricing/stream/) — official; $0.005/GB delivery, $0.01/GB storage, free transcoding — HIGH confidence
- [Bunny Storage Pricing](https://bunny.net/pricing/storage/) — official; $0.01/GB/month, free internal egress to CDN — HIGH confidence
- [Vercel Best Practices for Video Hosting](https://vercel.com/kb/guide/best-practices-for-hosting-videos-on-vercel-nextjs-mp4-gif) — official; recommends external media hosts — HIGH confidence
- [grammY Vercel Hosting Guide](https://grammy.dev/hosting/vercel) — official grammY docs; webhook and serverless pattern — HIGH confidence
- [PhotoSwipe Getting Started](https://photoswipe.com/getting-started/) — official; v5 API confirmed — HIGH confidence
- [Astro Upgrade to v6 Guide](https://docs.astro.build/en/guides/upgrade-to/v6/) — Node 22 requirement — HIGH confidence
- [Preventing Vercel indexing](https://dev.to/samrobbins85/prevent-a-vercel-site-from-being-indexed-in-search-engines-3b65) — community; confirmed by Vercel KB — MEDIUM confidence
- [Web Share API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) — authoritative browser API reference — HIGH confidence
- PhotoSwipe + Astro integration: [launchfa.st guide](https://www.launchfa.st/blog/photoswipe-astro), [DEV community post](https://dev.to/petrovicz/astro-photoswipe-549a) — MEDIUM confidence (community-verified patterns)

---

*Stack research for: внимание брусника! — Russian dream-pop band one-page marketing website*
*Researched: 2026-06-24*
