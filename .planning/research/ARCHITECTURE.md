# Architecture Research

**Domain:** Media-rich one-page band website (Astro on Vercel, self-hosted media, Telegram booking)
**Researched:** 2026-06-24
**Confidence:** HIGH (Astro islands, content collections, Vercel adapter — all verified against current official docs)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                             │
│                                                                     │
│  Static HTML (server-rendered by Astro at build time)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ NavBar   │ │  Hero    │ │ Marquee  │ │  About   │ │  Footer  │  │
│  │ (static) │ │ (static) │ │ (static) │ │ (static) │ │ (static) │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                                     │
│  Islands (hydrated independently, zero JS for everything else)      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │ AudioPlayer  │ │ VideoPlayer  │ │   Lightbox   │ │  Booking  │  │
│  │ client:idle  │ │ client:idle  │ │client:visible│ │client:idle│  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘  │
│                    ┌──────────────┐                                 │
│                    │ ShareButton  │                                  │
│                    │client:visible│                                  │
│                    └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
         │                                      │
         │ form POST                            │ media URLs
         ▼                                      ▼
┌────────────────────────┐          ┌─────────────────────────┐
│  Vercel Serverless Fn  │          │   Media CDN             │
│  /api/book.ts          │          │   Vercel Blob (public)  │
│  - parse form body     │          │   or Bunny.net (fallbk) │
│  - POST to Telegram    │          │   - /audio/*.mp3        │
│  - return JSON         │          │   - /video/*.mp4        │
└────────────┬───────────┘          │   - /images/*.jpg       │
             │                      └─────────────────────────┘
             ▼
┌────────────────────────┐
│  Telegram Bot API      │
│  sendMessage to        │
│  Соня's chat/group     │
└────────────────────────┘
```

### Component Responsibilities

| Component | Type | Responsibility | Hydration |
|-----------|------|----------------|-----------|
| `BaseLayout.astro` | Static | HTML shell, `<head>`, global styles, noindex meta, cursor glow, scroll-reveal script | None |
| `Nav.astro` | Static | Fixed nav bar, logo, menu links, "пойте с нами" CTA | None |
| `Hero.astro` | Static | Full-viewport header, hero image, tagline, scroll cue | None |
| `Marquee.astro` | Static | CSS-animated text ribbon (no JS needed — pure CSS animation) | None |
| `FeaturedAlbum.astro` | Static | Album art card, album description, streaming platform links | None |
| `Tracks.astro` | Static | Track list shell with data-attributes; passes track list to AudioPlayer island | None |
| `AudioPlayer` (island) | Interactive | Play/pause state, now-playing bar, real `<audio>` element, progress | `client:idle` |
| `About.astro` | Static | Band bio, portrait photo | None |
| `Shows.astro` | Static | Concert dates list, venue names, ticket links (from data file) | None |
| `Gallery.astro` | Static | Photo grid layout; passes image list to Lightbox island | None |
| `Lightbox` (island) | Interactive | Fullscreen image viewer, keyboard nav, touch swipe | `client:visible` |
| `VideoSection.astro` | Static | Video section shell | None |
| `VideoPlayer` (island) | Interactive | HTML5 `<video>` with custom controls, lazy loads source | `client:idle` |
| `SingWithUs.astro` | Static | "Пойте с нами" section content, lesson descriptions | None |
| `BookingModal` (island) | Interactive | Modal dialog, form state, validation, fetch POST to /api/book | `client:idle` |
| `ShareButton` (island) | Interactive | Web Share API with platform-link fallbacks | `client:visible` |
| `Footer.astro` | Static | Links, copyright, social links | None |
| `src/pages/api/book.ts` | Serverless | Receives booking POST, forwards to Telegram Bot API | On-demand |

---

## Recommended Project Structure

```
brusnika/
├── astro.config.mjs            # output: 'hybrid', @astrojs/vercel adapter
├── src/
│   ├── content.config.ts       # Content Layer definitions (THE v1→v2 seam)
│   ├── content/
│   │   ├── tracks/             # One JSON/YAML entry per track
│   │   │   ├── 01-dooduri.json
│   │   │   ├── 02-vesennee-tango.json
│   │   │   └── ...
│   │   ├── shows/              # One JSON/YAML entry per show date
│   │   │   ├── 2026-09-12-moscow.json
│   │   │   └── ...
│   │   └── gallery/            # One JSON/YAML entry per photo
│   │       ├── studio.json
│   │       └── ...
│   ├── pages/
│   │   ├── index.astro         # Single page — assembles all section components
│   │   ├── robots.txt.ts       # Dynamic robots.txt (noindex all)
│   │   └── api/
│   │       └── book.ts         # POST endpoint: booking → Telegram; prerender=false
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BaseLayout.astro
│   │   │   └── Nav.astro
│   │   ├── sections/           # One file per page section (static)
│   │   │   ├── Hero.astro
│   │   │   ├── Marquee.astro
│   │   │   ├── FeaturedAlbum.astro
│   │   │   ├── Tracks.astro
│   │   │   ├── About.astro
│   │   │   ├── Shows.astro
│   │   │   ├── Gallery.astro
│   │   │   ├── SingWithUs.astro
│   │   │   └── Footer.astro
│   │   └── islands/            # Interactive components (receive client: directive)
│   │       ├── AudioPlayer.tsx  (or .svelte — vanilla TS also viable)
│   │       ├── VideoPlayer.tsx
│   │       ├── Lightbox.tsx
│   │       ├── BookingModal.tsx
│   │       └── ShareButton.tsx
│   ├── styles/
│   │   └── global.css          # Design tokens, animations (@keyframes), base resets
│   └── lib/
│       └── telegram.ts         # Telegram Bot API helper (used by api/book.ts only)
└── public/
    └── robots.txt              # Static fallback (see noindex section)
```

### Structure Rationale

- **`src/content/`** is the v1→v2 seam. Content that will eventually come from a CMS (tracks, shows, gallery metadata) lives as JSON files here. `content.config.ts` defines typed schemas. When v2 arrives, only the `loader:` line in `content.config.ts` changes — component code is untouched.
- **`sections/` vs `islands/`** separation makes the hydration budget explicit at a glance. A component in `sections/` ships zero JS. A component in `islands/` ships JS only when its `client:*` directive fires.
- **`pages/api/book.ts`** is the only on-demand rendered route. Everything else is pre-rendered static HTML. This keeps Vercel costs zero on the Hobby plan for a low-traffic band site.

---

## Architectural Patterns

### Pattern 1: Static Section + Island Slot

**What:** An Astro static component renders the section shell and passes data as props to an island. The island handles interactivity; the shell handles structure and layout.

**When to use:** Audio player, video player, lightbox, booking modal. The section HTML is visible and meaningful without JS; the island enhances it.

**Trade-offs:** Slight prop-passing boilerplate. Eliminates shipping unnecessary JS for static content.

**Example:**
```astro
---
// src/components/sections/Tracks.astro
import { getCollection } from 'astro:content';
import AudioPlayer from '../islands/AudioPlayer.tsx';

const tracks = await getCollection('tracks');
---
<section id="music">
  <!-- Static track list for SEO/no-JS fallback -->
  {tracks.map(t => (
    <div class="track" data-track-id={t.id}>
      <span>{t.data.title}</span>
    </div>
  ))}

  <!-- Island receives structured data, handles real playback -->
  <AudioPlayer client:idle tracks={tracks.map(t => t.data)} />
</section>
```

### Pattern 2: Content Layer as CMS Seam

**What:** All content that will eventually be CMS-managed is defined as a Content Collection with a Zod schema. v1 uses the `file()` or `glob()` loader pointing at local JSON. v2 swaps in a remote loader. Component code calls `getCollection()` in both cases and never changes.

**When to use:** Tracks list, show dates, gallery metadata, bio text. Anything a non-developer would want to edit in v2.

**Trade-offs:** Adds a `src/content/` folder and schema definition. Worth it because the migration cost goes from "rewrite components" to "change one line in content.config.ts."

**Example:**
```typescript
// src/content.config.ts — v1 (local JSON files)
import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const tracks = defineCollection({
  loader: file('./src/content/tracks/*.json'),    // ← v1: local files
  // loader: wordpressLoader({ endpoint: '...' }) // ← v2: swap this line only
  schema: z.object({
    title: z.string(),
    duration: z.string(),         // e.g. "4:18"
    releaseLabel: z.string(),     // e.g. "сингл 2026"
    audioUrl: z.string().url(),   // Vercel Blob or Bunny URL
    trackNumber: z.number(),
  }),
});

const shows = defineCollection({
  loader: file('./src/content/shows/*.json'),
  schema: z.object({
    date: z.coerce.date(),
    city: z.string(),
    venue: z.string(),
    ticketUrl: z.string().url().optional(),
  }),
});

export const collections = { tracks, shows };
```

**JSON data file example (`src/content/tracks/01-dooduri.json`):**
```json
{
  "id": "01-dooduri",
  "title": "Доодури",
  "duration": "4:18",
  "releaseLabel": "сингл 2026",
  "audioUrl": "https://<blob-store>.public.blob.vercel-storage.com/audio/dooduri.mp3",
  "trackNumber": 1
}
```

### Pattern 3: Hybrid Output — Static Site + One Serverless Endpoint

**What:** Astro `output: 'hybrid'` with the `@astrojs/vercel` adapter. All pages default to `prerender = true` (static). Only `src/pages/api/book.ts` sets `prerender = false`, becoming a Vercel serverless function.

**When to use:** Any Astro site that is mostly static but needs one or more server-side API routes (form submissions, webhooks, auth callbacks).

**Trade-offs:** Requires the Vercel adapter even though 99% of the site is static. Adds ~15s to cold-start on the first form submit (rare for a band site). No cost impact on the Hobby plan for this traffic volume.

**Example:**
```typescript
// src/pages/api/book.ts
export const prerender = false;
import type { APIRoute } from 'astro';
import { sendToTelegram } from '../../lib/telegram';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { name, contact, format, experience } = body;

  if (!name || !contact) {
    return new Response(JSON.stringify({ error: 'missing fields' }), { status: 400 });
  }

  await sendToTelegram({ name, contact, format, experience });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'hybrid',    // pages are static by default; opt-in to SSR per route
  adapter: vercel(),
});
```

### Pattern 4: Noindex via Meta + robots.txt

**What:** Two-layer noindex: a `<meta name="robots" content="noindex, nofollow">` tag in `BaseLayout.astro` (controls per-page crawling), and a `public/robots.txt` with `Disallow: /` (controls crawler access to the whole site). Together they ensure nothing is indexed before launch.

**When to use:** Pre-launch deployments where public indexing must be blocked.

**Trade-offs:** Must remember to flip both when launching. The meta tag in BaseLayout is the easiest to forget.

**Implementation:**
```astro
<!-- src/components/layout/BaseLayout.astro -->
---
const IS_PRE_LAUNCH = true; // flip to false at launch
---
<head>
  {IS_PRE_LAUNCH && <meta name="robots" content="noindex, nofollow" />}
</head>
```

```txt
# public/robots.txt — pre-launch
User-agent: *
Disallow: /
```

Use an environment variable (`PUBLIC_NOINDEX=true`) so flipping at launch is a Vercel dashboard toggle, not a code change.

---

## Data Flow

### Audio Playback Flow

```
User clicks track row (static HTML button)
    ↓
AudioPlayer island receives click event
    ↓
island sets currentTrack state (track object from props)
    ↓
<audio src={track.audioUrl}> fetches from Vercel Blob CDN
    ↓
Now-playing bar renders with track title + progress
```

### Booking Form Flow

```
User clicks "записаться" (any button with data-open-lessons)
    ↓
BookingModal island opens (manages its own open/close state)
    ↓
User fills form, clicks submit
    ↓
Island fetch() POST → /api/book (JSON body)
    ↓
Vercel serverless fn (src/pages/api/book.ts)
    ↓
lib/telegram.ts → Telegram Bot API sendMessage
    ↓
Message arrives in Соня's Telegram chat
    ↓
API returns { ok: true }
    ↓
Island shows thank-you state, resets form
```

### Content → Component Flow (build time)

```
src/content/tracks/*.json  ─┐
src/content/shows/*.json   ─┼─ getCollection() in Astro components
src/content/gallery/*.json ─┘         ↓
                              Props passed to static section components
                                       ↓
                              Props (track data) passed to islands as JSON
                                       ↓
                              Islands hydrate with data — no runtime fetch needed
```

### Social Share Flow

```
User clicks share button
    ↓
ShareButton island checks navigator.share availability
    ↓ (mobile)                          ↓ (desktop)
Web Share API native sheet          Fallback: copy link or
(OS handles Instagram/VK/Telegram)  open platform share URLs
```

---

## Build Order Implications

Dependencies flow downward. Build in this order:

1. **Foundation** — `BaseLayout.astro`, `global.css`, design tokens, `astro.config.mjs`. Everything depends on this.

2. **Content schema** — `src/content.config.ts` with Zod schemas for tracks, shows, gallery. Needed before any component calls `getCollection()`.

3. **Static sections** — `Nav`, `Hero`, `Marquee`, `FeaturedAlbum`, `About`, `Shows`, `Gallery`, `SingWithUs`, `Footer`. No island dependencies; can be built and styled in isolation. Validates visual parity with the existing `index.html`.

4. **Media infrastructure** — Upload audio/video to Vercel Blob, update `audioUrl`/`videoUrl` values in JSON content files. Must exist before islands can be tested with real media.

5. **Islands** — `AudioPlayer`, `VideoPlayer`, `Lightbox`, `ShareButton`, `BookingModal`. Each depends on the static section that embeds it. `BookingModal` additionally depends on step 6.

6. **Serverless endpoint + Telegram** — `src/pages/api/book.ts` and `src/lib/telegram.ts`. Depends on a Telegram bot being created and the token stored in Vercel env vars.

7. **Noindex + robots.txt** — Wire up environment variable control. Verify with Google Search Console or a crawler check before launch.

---

## v1 → v2 CMS Migration Seam

The seam is `src/content.config.ts`. In v1, loaders point at local JSON files. In v2, the loader line is replaced with a CMS-specific loader. Component code (`getCollection()`, prop access via `entry.data.*`) is identical in both versions.

### What stays the same (zero migration cost)
- All `sections/*.astro` components
- All `islands/*.tsx` components
- The `index.astro` page assembly
- The Zod schema shape (CMS fields must match, or add a mapping adapter in the loader)

### What changes in v2
- `loader:` in each collection definition in `content.config.ts` → points to WordPress REST API, Sanity, Contentful, etc.
- Environment variables for CMS API keys added to Vercel
- JSON data files in `src/content/` become optional (backup / seed data only)

### WordPress headless example (v2 drop-in)
```typescript
// src/content.config.ts — v2 (WordPress REST API)
import { defineCollection, z } from 'astro:content';

const tracks = defineCollection({
  loader: async () => {
    const res = await fetch('https://cms.brusnika.ru/wp-json/wp/v2/tracks');
    const posts = await res.json();
    return posts.map(p => ({
      id: String(p.id),
      title: p.title.rendered,
      duration: p.acf.duration,
      releaseLabel: p.acf.release_label,
      audioUrl: p.acf.audio_url,
      trackNumber: p.acf.track_number,
    }));
  },
  schema: z.object({         // ← same schema, zero component changes
    title: z.string(),
    duration: z.string(),
    releaseLabel: z.string(),
    audioUrl: z.string().url(),
    trackNumber: z.number(),
  }),
});
```

The pattern works identically for Sanity, Contentful, Payload CMS, or any other headless source. The schema is the contract; the loader is the implementation detail.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–1k visitors/month | No changes. Static site + one serverless fn. Vercel Hobby plan covers this for free. |
| 1k–50k visitors/month | Vercel Blob CDN handles media delivery automatically. If booking volume grows, rate-limit the `/api/book` endpoint. |
| 50k+ visitors/month | Likely warrants Vercel Pro plan. Consider moving audio/video to Bunny.net for cheaper egress ($0.01/GB vs Blob's higher data transfer cost at scale). |

For a Russian-language band website at v1, traffic will be concentrated in Russia and CIS. Vercel Blob stores support 20 regions; pick `fra1` (Frankfurt) as the closest well-served option for Russian traffic on Vercel's current PoP list.

---

## Anti-Patterns

### Anti-Pattern 1: Putting Track Data in Component Frontmatter

**What people do:** Hardcode track arrays directly in `Tracks.astro` or the index page frontmatter.

**Why it's wrong:** When v2 arrives, every place that hardcodes content must be hunted down and rewritten. The data has no schema, so typos are silent.

**Do this instead:** Define a content collection. Even for v1's five tracks, the 10-minute setup cost saves a full rewrite later.

---

### Anti-Pattern 2: Using `client:load` for Below-Fold Islands

**What people do:** Add `client:load` to the audio player, video player, lightbox, and booking modal. All JS loads and hydrates immediately on page load.

**Why it's wrong:** Ships all island JS on initial load, blocking the fast LCP the hero image needs. The audio player and booking modal are not needed until user interaction.

**Do this instead:**
- `client:idle` for AudioPlayer, VideoPlayer, BookingModal — hydrate after page is interactive
- `client:visible` for Lightbox, ShareButton — hydrate only when the gallery/share button scrolls into view

---

### Anti-Pattern 3: Serving Audio/Video from the Vercel Git Repo or `/public`

**What people do:** Drop `.mp3` and `.mp4` files into `public/audio/` and commit them to git.

**Why it's wrong:** Git is not a CDN. Large binary files bloat the repo permanently (git history is immutable), slow down clones and CI builds, and Vercel's serverless response size limits make serving large media from the deploy bundle unreliable.

**Do this instead:** Upload all audio and video to Vercel Blob (public store). Reference URLs in content JSON files. The repo contains only code and data references.

---

### Anti-Pattern 4: One Giant Island for All Interactivity

**What people do:** Create a single `App.tsx` island that wraps the whole page and manages audio, modal, gallery, and share state together.

**Why it's wrong:** Eliminates the performance advantage of islands. Ships the entire React (or other framework) runtime to handle interactions that could be isolated. Tightly couples unrelated features.

**Do this instead:** One island per concern. Audio state lives in `AudioPlayer`. Modal state lives in `BookingModal`. If two islands genuinely need shared state (e.g., a "now playing" indicator visible elsewhere), use Nano Stores as a tiny shared reactive store rather than lifting everything into a parent.

---

### Anti-Pattern 5: Putting the Telegram Bot Token in Client-Side Code

**What people do:** Read `import.meta.env.PUBLIC_TELEGRAM_TOKEN` in the `BookingModal` island and call the Telegram API from the browser.

**Why it's wrong:** `PUBLIC_` prefix in Astro exposes the variable to the browser bundle. Anyone can find the token in devtools, spam the bot, or impersonate the site.

**Do this instead:** The Telegram token lives only in a server-side env var (no `PUBLIC_` prefix). The browser POSTs to `/api/book`. Only the Vercel serverless function reads the token and calls Telegram.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel Blob | Public blob store; URLs embedded in content JSON | CDN-delivered. Upload media once at setup; never serve from repo. |
| Telegram Bot API | Server-only: `/api/book.ts` → `api.telegram.org/bot{TOKEN}/sendMessage` | Token stored as Vercel env var (no `PUBLIC_` prefix). |
| Spotify / Яндекс / Apple Music | Static `<a>` links in `FeaturedAlbum.astro` and `Footer.astro` | No API calls; just `href` values. Replace `#` placeholders with real URLs. |
| YouTube | Static `<a>` link | Same as above. |
| Timepad (хоротерапия bookings) | Static `<a>` link inside Lightbox/SingWithUs | Already in the HTML draft: `sonya-brusnika.timepad.ru/event/…` |
| Google Fonts (Prata + Golos Text) | `<link>` preconnect + stylesheet in BaseLayout | Consider self-hosting fonts in `public/fonts/` for privacy + speed if audience is Russian (Google Fonts may be slow from Russia). |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Static section → Island | Props (JSON-serializable data only) | Astro serializes island props at build time. No functions, no DOM refs. |
| Island → Island (audio state) | Nano Stores (`@nanostores/preact` or `@nanostores/react`) | Use only if a second island needs to read `currentTrack`. Otherwise keep state local to `AudioPlayer`. |
| Island → API endpoint | `fetch('/api/book', { method: 'POST', body: JSON.stringify(…) })` | Standard fetch. Handle network errors in the island UI. |
| API endpoint → Telegram | `fetch('https://api.telegram.org/…')` from serverless fn | Wrap in `src/lib/telegram.ts`. Adds retry logic later without touching the endpoint. |
| Content collections → Components | `getCollection('tracks')` / `getEntry()` | Build-time only. No runtime fetching in v1. |

---

## Sources

- [Astro Content Collections (official docs)](https://docs.astro.build/en/guides/content-collections/) — Content Layer API, `file()` loader, Zod schemas, CMS seam pattern — HIGH confidence
- [Astro Content Loader Reference](https://docs.astro.build/en/reference/content-loader-reference/) — custom loaders for v2 CMS swap — HIGH confidence
- [Astro Islands / client directives](https://docs.astro.build/en/concepts/islands/) — `client:load`, `client:idle`, `client:visible` hydration strategies — HIGH confidence
- [Astro Vercel Adapter](https://docs.astro.build/en/guides/integrations-guide/vercel/) — hybrid output, serverless endpoints, `prerender = false` — HIGH confidence
- [Astro Endpoints (API Routes)](https://docs.astro.build/en/guides/endpoints/) — POST endpoint pattern — HIGH confidence
- [Vercel Blob (official docs)](https://vercel.com/docs/vercel-blob) — public store, CDN delivery, audio/video use cases, multipart uploads — HIGH confidence
- [Content Layer API and CMS agnosticism](https://maciekpalmowski.dev/blog/content-layer-api-in-astro-how-to-create-a-cms-agnostic-website/) — loader swap pattern confirmed — MEDIUM confidence
- [Astro Use a CMS guide](https://docs.astro.build/en/guides/cms/) — list of officially supported CMS integrations for v2 — HIGH confidence
- Bunny.net CDN — MEDIUM confidence (community sources; pricing/features verified at bunny.net but not through official Astro docs)

---

*Architecture research for: внимание брусника! band website (Astro + Vercel)*
*Researched: 2026-06-24*
