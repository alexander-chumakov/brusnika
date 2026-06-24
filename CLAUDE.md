<!-- GSD:project-start source:PROJECT.md -->
## Project

**внимание брусника! — Band Website**

A polished, fast, media-rich one-page website for **внимание брусника!**, a Russian-language chamber dream-pop project. It introduces the band, lets visitors actually listen to the music and watch live video on-site, browse concert photos, see upcoming shows, share short clips to their own social stories, and book vocal lessons / хоротерапия with vocalist Соня. The audience is Russian-speaking fans and prospective vocal-lesson students.

A first visual draft was created in Claude Design (a single static `index.html` with inline styles/JS, currently in this repo). v1 turns that mockup into a real, functioning, deployable site — same look, but everything *works*.

**Core Value:** A visitor can experience the band's music and world (listen, watch, look) and take a real action — book a lesson — all on one fast, beautiful page. If everything else fails, the music must play and the booking must reach Соня.

### Constraints

- **Tech stack**: Astro (static-first with islands) — chosen for speed on a media-heavy site and a clean path to a v2 CMS. Avoids shipping a full React runtime when most of the page is static.
- **Hosting**: Vercel — serverless functions used only where needed (the Telegram booking endpoint).
- **Media hosting**: self-hosted media (band's choice). Large audio/video must not be served as raw repo files; needs a proper storage/delivery approach (e.g. Vercel Blob or a media host like Bunny/Cloudinary) — to be settled in research.
- **Privacy**: deploy must be noindex (robots noindex + likely disallow) until launch approval.
- **Social sharing**: limited by platform reality — no website can auto-post to a user's Story; implementation is the mobile Web Share API + platform share links.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Astro | 5.x (current: 5.x; npm shows `astro@latest` → 7.0.2 as of research date — use `astro@latest`) | Static site generator with islands | Ships zero JS by default for static sections; islands for audio player, lightbox, share widget; clean path to v2 CMS via content collections |
| @astrojs/vercel | 11.0.0 | Vercel deployment adapter | Required for hybrid mode (static pages + one serverless endpoint for the Telegram bot); official Astro adapter |
| Node.js | 22.12.0+ | Runtime | Required by Astro v6+; Vercel uses Node 22 runtime by default |
| TypeScript | 5.x (bundled with Astro) | Type safety | Astro ships with TS support built in; no separate install needed |
### Media Delivery — Recommended: Bunny.net (Storage + CDN)
| Service | Purpose | Pricing (verified) | Why |
|---------|---------|-------------------|-----|
| Bunny Storage (HDD, single region) | Store MP3 audio files and MP4/WebM video files | $0.01/GB/month; $1/month minimum | Cheapest durable object storage; internal egress to Bunny CDN is free |
| Bunny CDN | Deliver audio and video files globally | $0.01/GB (Europe/North America); $0.06/GB (APAC) | Internal Bunny Storage → Bunny CDN transfer is free; end-user CDN delivery is pay-as-you-go |
| Bunny Stream (optional, video only) | Adaptive bitrate video transcoding + player | $0.005/GB delivery; $0.01/GB storage; free transcoding and player | Use if you want HLS adaptive streaming and the Bunny player; skip if raw MP4 delivery suffices |
### Media Delivery — Realistic Cost Estimate
- Storage: ~0.65 GB × $0.01 = **$0.007/month** (effectively just the $1 minimum)
- Bandwidth: ~650 MB × 1,000 plays × $0.01/GB = **$6.50/month** (if every visitor played every track, which won't happen — realistic cost ~$1–3/month)
- **Total: $1–3/month all-in for v1 traffic volumes.**
### Audio Player
| Approach | Recommendation | Why |
|----------|---------------|-----|
| Custom Astro island + vanilla JS + HTML5 `<audio>` element | **Use this** | The existing design already has a custom now-playing bar with its own visual language (pink equaliser bars, Prata font track titles, fixed bottom bar). Any third-party player library will fight the design. The HTML5 Audio API is sufficient: `audio.play()`, `audio.pause()`, `audio.currentTime`, `audio.duration`, `timeupdate` event for progress, `ended` event for next-track. Wrap in an Astro island with `client:visible` directive. |
| Howler.js (2.x) | Fallback only | Adds ~7 KB gzipped; useful if you need Web Audio API equaliser effects or cross-browser fade. Not needed for basic playback. LOW priority. |
| Plyr, APlayer, jPlayer | Do NOT use | All impose their own UI chrome that would conflict with the bespoke dark pink design. Not worth the fight. |
### Video Player
| Approach | Recommendation | Why |
|----------|---------------|-----|
| Native HTML5 `<video>` with custom controls | **Use this for v1** | For 2–3 concert clips, a styled HTML5 video element with `controls` hidden and a thin custom control strip is sufficient. The dark theme and pink accent are trivially applied via CSS. No library needed. |
| Plyr (3.x) | Acceptable alternative | 28 KB gzipped; wraps native video with a polished custom control layer. Worth adding if you want keyboard shortcuts, fullscreen, and pip without writing them yourself. CSS variables allow full theme override to match the pink/dark palette. Install: `npm install plyr`. |
| Bunny Stream player (iframe embed) | Use if using Bunny Stream for video | Bunny provides a free embeddable player with HLS support. Embed via `<iframe>` into an Astro component. Loses some design control but is zero-JS on your side. |
| Video.js, Vimeo SDK | Do NOT use | Video.js is 300 KB+. Vimeo means losing self-hosted control, which is the band's explicit requirement. |
### Image Gallery / Lightbox
| Technology | Version | Purpose | Confidence |
|------------|---------|---------|-----------|
| Astro `<Image />` / `<Picture />` | built-in | Serve optimised WebP/AVIF with correct `srcset` and `sizes`; lazy-load below-fold gallery images | HIGH |
| PhotoSwipe | 5.x | Fullscreen lightbox with touch/swipe/pinch-zoom on mobile | HIGH |
### Booking Form → Telegram Bot
| Technology | Purpose | Confidence |
|------------|---------|-----------|
| Astro API route (`src/pages/api/book.ts`) | Serverless POST endpoint on Vercel | HIGH |
| grammY (`grammy` npm package) | Send messages to Telegram Bot API from serverless function | HIGH — official Vercel hosting guide exists |
| Telegram Bot API (sendMessage) | Deliver form submissions to Соня's Telegram | HIGH |
### Social Sharing
| Technology | Purpose | Notes |
|------------|---------|-------|
| `navigator.share()` (Web Share API) | Native mobile share sheet | Supported on iOS Safari, Android Chrome, and most modern mobile browsers. Triggers the OS share sheet — VK, Telegram, Instagram all appear if installed. |
| Fallback share links | Desktop and unsupported browsers | Construct static share URLs: `https://t.me/share/url?url=…&text=…` (Telegram), `https://vk.com/share.php?url=…` (VK), `https://www.instagram.com/` (Instagram has no web share URL — link to profile instead). |
### Noindex — Pre-launch
### Fonts
| Font | Source | Why |
|------|--------|-----|
| Prata (serif) | Google Fonts | Already in the design; headings, track numbers, marquee. Use `display=swap` and `<link rel="preconnect">` |
| Golos Text (sans-serif) | Google Fonts | Body text; already in the design. |
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
## Installation
# Scaffold a new Astro project (choose "Empty" template)
# Core adapter
# Gallery lightbox
# Self-hosted fonts (optional but recommended)
# Video player (install only if needed after evaluating native <video>)
# npm install plyr
# Dev tooling
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
## astro.config.mjs Shape
## Hybrid Output: Which Pages Are Server-Rendered
| Route | Mode | Why |
|-------|------|-----|
| `src/pages/index.astro` | Prerendered (static) | The entire marketing page; no dynamic data |
| `src/pages/api/book.ts` | Server (on-demand) | Needs to call Telegram API at request time |
## Version Compatibility
| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `astro@7.x` | `@astrojs/vercel@11.0.0` | Verified via npm at research date |
| `astro@7.x` | Node 22.12.0+ | Astro v6+ dropped Node 18/20 |
| `photoswipe@5.x` | Any Astro version | Pure JS, no framework dependency |
| `plyr@3.x` | Any Astro version | Pure JS; import CSS separately |
| `@fontsource/*` | Any Astro version | Import in layout `<head>` or base CSS |
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
