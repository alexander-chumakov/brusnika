# Project Research Summary

**Project:** внимание брусника! — Band Website
**Domain:** Media-rich one-page band and artist-booking site, Russian-language audience
**Researched:** 2026-06-24
**Confidence:** HIGH

---

## Executive Summary

внимание брусника! is a media-heavy single-page marketing site for a Russian-language chamber dream-pop project. The site has two conversion goals: fan immersion (listen, watch, browse, share) and student acquisition (book vocal lessons / хоротерапия with vocalist Соня). A visual draft already exists as a static `index.html`. v1 is entirely about making that draft functional — identical aesthetics, every interactive element wired to real data and real services.

The recommended approach is Astro with hybrid output (static-first, one serverless endpoint) deployed to Vercel. All media — audio and video — must be hosted on an external CDN, never in the git repository or served through Vercel serverless functions. Content that will eventually be CMS-managed (tracks, shows, gallery metadata) should be defined as Astro Content Collections from day one, using local JSON files in v1 and swapping to a CMS loader in v2 without touching any component code. Five interactive islands (audio player, video player, lightbox, booking modal, share button) handle all interactivity while the rest of the page ships as pure static HTML.

The two highest-risk areas are Russian-market infrastructure and security hygiene. Google Fonts must be self-hosted — throttling and blocking of Google services by Russian ISPs is documented and will destroy the typography for the primary audience. The Telegram bot token must never leave the server; the booking endpoint must include rate limiting from day one. All other pitfalls (hero image LCP, noindex gate, media via CDN not serverless functions) have well-established mitigations and low recovery cost if caught early.

---

## Resolved Conflict: Media Hosting

**STACK.md recommends Bunny.net; ARCHITECTURE.md and PITFALLS.md reference Vercel Blob.**

**Recommendation: Start with Vercel Blob for v1. Switch to Bunny.net when monthly bandwidth exceeds ~5 GB or Russian CDN performance becomes a measurable concern.**

Rationale:

- v1 has ~5 audio tracks (~50 MB total) and 1–2 concert videos (~400 MB total). At 1,000 plays/month, total egress is roughly 1–3 GB — well within Vercel Blob's cost-effective range (~$0.15 total at $0.05/GB transfer).
- Vercel Blob is the zero-friction path: one account, one dashboard, native Astro integration, correct `Accept-Ranges` / HTTP 206 support, 512 MB cache per file. It eliminates a second vendor account and a second set of CDN URLs to manage during v1 development.
- Bunny.net's advantages — cheaper per-GB egress ($0.01/GB vs $0.05/GB), PoPs closer to Russia, Bunny Stream for HLS — become material only at scale (50k+ monthly visitors) or if Russian audience latency with Vercel Blob's Frankfurt edge proves measurable in testing.
- The switch is non-destructive: audio/video URLs are stored as values in Astro Content Collection JSON files (`audioUrl`, `videoUrl`). Migrating to Bunny means re-uploading files and updating those URL fields — no component code changes.

**Hard constraint either way:** never serve audio or video through a Vercel serverless function. The 4.5 MB function payload cap and the absence of `Accept-Ranges` / HTTP 206 range-request support make this non-negotiable. Always point `<audio src>` and `<video src>` directly at a CDN URL.

---

## Consensus Items (Strongly Agreed Across All Four Files)

These points appear in multiple research files with no disagreement. Treat them as non-negotiable constraints:

1. **Self-host fonts — drop Google Fonts.** Prata and Golos Text must come from `@fontsource/prata` and `@fontsource/golos-text` (npm packages), not from `fonts.googleapis.com`. Russian ISPs throttle or block Google services; the draft's existing `<link>` tags must be removed in the very first build step before anything else is copied forward.

2. **Env-var-gated noindex.** `NOINDEX=true` as a Vercel environment variable controls the `<meta name="robots">` tag and the `X-Robots-Tag` header. Never hardcode the noindex into the layout. Removing noindex at launch becomes a Vercel dashboard toggle, not a code change — impossible to forget.

3. **Never serve audio or video through serverless functions.** Vercel Functions cap non-streaming responses at 4.5 MB and do not emit `Accept-Ranges: bytes`. This makes scrubbing broken, large files return 413, and seeking restarts from the beginning. Point `<audio src>` and `<video src>` at CDN URLs directly.

4. **VK and Telegram are first-class social channels; Instagram is secondary.** Instagram has been blocked in Russia since March 2022 (Roskomnadzor; classified as extremist). It can remain in the footer for VPN users but must not be the default share target and must appear after VK and Telegram in social links ordering.

5. **Web Share API cannot auto-post to Stories.** `navigator.share()` opens the OS native share sheet; what happens inside the receiving app is the app's decision. There is no web API that auto-posts to Instagram Stories, VK Stories, or any other stories surface. Implementation is: `navigator.share({ title, text, url })` for mobile; VK share link + Telegram share link + copy-link button for desktop. Scope is locked to sharing the page URL.

6. **Telegram bot token must stay server-side with rate limiting.** The token lives as `TELEGRAM_BOT_TOKEN` (no `PUBLIC_` prefix) in Vercel environment variables. The browser POSTs to `/api/book`; only the serverless function reads the token. The endpoint must enforce an IP-based rate limit (5 submissions / 60 seconds per IP) and include a honeypot field.

7. **Astro Content Collections are the v1 to v2 CMS seam.** Tracks, shows, and gallery metadata are defined in `src/content.config.ts` with Zod schemas and local JSON loaders in v1. The v2 CMS migration is one line change per collection (`loader:` value) — all component code calling `getCollection()` is unchanged.

---

## Key Findings

### Recommended Stack

Astro (latest; 7.0.2 at research date) with `output: 'hybrid'` and the `@astrojs/vercel` adapter is the correct foundation. It ships zero JS for the ~80% of the page that is static HTML, and uses Astro islands with `client:idle` / `client:visible` hydration for the five interactive components. The only serverless route is `src/pages/api/book.ts` (the Telegram booking endpoint), which opts in with `export const prerender = false`.

**Core technologies:**
- **Astro 7.x** — static site generator with islands; hybrid output mode for one serverless endpoint; Content Collections for CMS-ready data layer
- **@astrojs/vercel 11.0.0** — required Vercel adapter; enables hybrid mode and Vercel Image Optimization
- **Node 22.12.0+** — required by Astro v6+; matches Vercel's default runtime
- **Vercel Blob (v1 default)** — media storage for audio and video; public store with CDN, native range-request support, 512 MB cache per file; switch to Bunny.net when egress exceeds ~5 GB/month
- **PhotoSwipe 5.x** — lightbox; pure JS, touch-first, no framework dependency
- **@fontsource/prata + @fontsource/golos-text** — self-hosted fonts; eliminates Google Fonts dependency for Russian audience
- **Telegram Bot API (direct fetch)** — booking delivery; no grammY library needed for one-way sendMessage

**What not to use:** Next.js (React runtime waste on a static site), Plyr/APlayer/jPlayer (fight the bespoke dark-pink player design), YouTube/Vimeo embeds (band requires self-hosted control), Google Fonts CDN (throttled in Russia), grammY (overkill for one-way message send), Cloudinary for audio (no audio support, expensive), Mux (per-minute encoding, overkill for 2–3 clips).

### Expected Features

**Must have (table stakes) for v1:**
- Working audio playback with sticky now-playing bar — play/pause per track, single active track, animated EQ bars, close button
- Streaming service links wired up — Yandex Music and VK Music primary for Russian fans; Spotify, Apple Music, YouTube secondary
- Concert ticket links — Timepad is the standard Russian indie ticketing platform; direct event page links
- Photo lightbox — click to open, arrow keys / swipe / Escape to close, image counter, dark overlay
- Booking form that submits — delivers to Соня via Telegram bot with formatted Russian-language message
- All footer social links real — VK and Telegram primary; Instagram as footer fallback
- Mobile-responsive layout — existing 860px breakpoint must be preserved exactly
- Fast initial load — images optimised, no blocking JS bundles, hero LCP under 2.5s on mobile

**Should have (differentiators) for v1:**
- On-site audio player, not streaming redirect — keeps visitors in the designed experience and exposes them to the booking CTA
- On-site video player with poster frame — self-hosted, custom play-button overlay, `playsinline` for iOS
- Social sharing via Web Share API with VK/Telegram fallbacks for desktop
- Cursor-follow glow and scroll-reveal animations — already coded in draft; must survive Astro rebuild exactly
- Cyrillic-first UX — `lang="ru"` on `<html>`, Russian date formats, Telegram as primary contact

**Defer to v2+:**
- CMS / admin panel
- Email newsletter / mailing list
- Merch store
- Progress scrub bar in now-playing (v1.x enhancement, not launch blocker)
- File sharing of audio clips via Web Share API

### Architecture Approach

The page is a single `index.astro` assembling ~14 static section components and 5 interactive island components. Static sections ship zero JS. Islands hydrate lazily: `client:idle` for AudioPlayer, VideoPlayer, and BookingModal; `client:visible` for Lightbox and ShareButton. All content that will be CMS-managed in v2 lives in `src/content/` as typed JSON files accessed via `getCollection()` — this is the seam that makes the v2 migration a one-line change per collection.

**Major components:**
1. `BaseLayout.astro` — HTML shell, self-hosted fonts, global CSS, noindex meta (env-var gated), cursor glow, scroll-reveal
2. `src/content.config.ts` — Zod schemas for tracks, shows, gallery; local JSON loaders in v1; CMS loader swap point for v2
3. `AudioPlayer` island (`client:idle`) — single `<audio>` element, now-playing bar state, play/pause/close; receives track data as props from `Tracks.astro`
4. `BookingModal` island (`client:idle`) — form state, validation, fetch POST to `/api/book`, thank-you / error states
5. `src/pages/api/book.ts` (serverless) — parses booking POST, calls Telegram Bot API `sendMessage` via `lib/telegram.ts`; rate-limited; token server-side only
6. `Lightbox` island (`client:visible`) — PhotoSwipe 5 wrapper; keyboard nav, touch swipe, ARIA focus trap
7. `VideoPlayer` island (`client:idle`) — HTML5 `<video>` with poster overlay; native browser controls acceptable for v1; `playsinline` required
8. `ShareButton` island (`client:visible`) — `navigator.share()` on mobile; VK + Telegram share links + copy-link on desktop/Firefox

**Key patterns:**
- Static section + island slot: section renders structural HTML and passes JSON data as props to its island; the island handles all interactivity
- Content Layer as CMS seam: `getCollection()` in components; loader is the only thing that changes in v2
- Hybrid output: all pages `prerender = true` by default; only `/api/book.ts` sets `prerender = false`
- One island per concern: no monolithic App component; audio state stays in AudioPlayer; cross-island state (if needed) via Nano Stores

### Critical Pitfalls

1. **Audio/video served through serverless functions** — 4.5 MB cap, no range requests, scrubbing broken. Prevention: upload to Vercel Blob on day one, point `<audio src>` / `<video src>` directly at CDN URLs. Verify via Network tab (`Accept-Ranges: bytes` in response headers).

2. **Google Fonts in the draft gets copy-pasted into Astro layout** — throttled / blocked for Russian users; destroys typography. Prevention: replace `<link>` tags with `@fontsource` imports in the very first build step, before any other component work.

3. **Telegram bot token in client-side bundle** — `PUBLIC_` prefix in Astro exposes env vars to the browser. Prevention: `TELEGRAM_BOT_TOKEN` with no prefix; accessed only in `src/pages/api/book.ts`; rate-limit the endpoint.

4. **noindex hardcoded into layout** — will be forgotten at launch; band site goes live but never gets indexed. Prevention: gate on `NOINDEX` env var from the start; removal at launch is a Vercel dashboard action.

5. **Hero image lazy-loaded** — Astro `<Image>` defaults to `loading="lazy"`; the hero is always the LCP element and must load immediately. Prevention: `loading="eager" fetchpriority="high"` on the hero `<Picture>`; lazy-load everything below the fold.

6. **Web Share API scoped to file-sharing or Stories** — `navigator.share({ files: [videoBlob] })` without `canShare` check fails on most desktop browsers and does not post to Stories. Prevention: share the page URL only (`navigator.share({ title, text, url })`); document in code that Stories auto-posting is impossible from web.

7. **Instagram as primary social or share target** — blocked in Russia since 2022. Prevention: VK and Telegram listed first in all social link sequences; no Instagram share URL constructed in code.

---

## Implications for Roadmap

### Phase 1: Project Foundation and Design System

**Rationale:** Every subsequent phase depends on the Astro project scaffold, the design token system ported from the draft, and the two infrastructure decisions that cannot be retrofitted (self-hosted fonts, env-var noindex). Build order: foundation then content schema then static sections then media infrastructure then islands then serverless then pre-launch checks.

**Delivers:** Deployable Astro project on Vercel with pixel-accurate static layout matching the existing `index.html` draft, self-hosted fonts, and env-var-gated noindex. No interactive features yet — but the page looks correct and can be shared with stakeholders via Vercel preview URL.

**Addresses:** Mobile-responsive layout, fast initial load (hero LCP), Cyrillic-first UX, `lang="ru"` on `<html>`

**Avoids:** Google Fonts copy-pasted from draft (pitfall 2); hardcoded noindex (pitfall 4); hero image lazy-loaded (pitfall 5)

**Research flag:** Standard patterns — no additional research needed

---

### Phase 2: Audio Player Island

**Rationale:** Audio is the site's primary value delivery. If music plays, the site succeeds. All audio infrastructure (Blob CDN URLs in content JSON, Content Collections schema for tracks) is ready from Phase 1. Audio player is the most complex island (state machine for track switching, mobile iOS restrictions, progress display) and should be isolated and tested before adding more islands.

**Delivers:** Fully functional audio player — play/pause per track, single active track at a time, animated now-playing bar, correct mobile iOS behavior, `Accept-Ranges` verified in Network tab.

**Addresses:** Working audio playback (P1 table stakes); sticky now-playing bar; track play/pause toggle

**Avoids:** Audio via serverless function (pitfall 1); autoplay on mobile iOS (pitfall 3 — `audio.play()` called synchronously in click handler, promise caught); loading state missing; now-playing bar blocking footer on mobile

**Research flag:** Standard patterns — MDN and community sources fully cover HTML5 Audio API

---

### Phase 3: Photo Lightbox and Video Player Islands

**Rationale:** Both are visually prominent sections in the draft and rely on the same CDN infrastructure established in Phase 1. Neither has state dependencies on the audio player. Batching them saves context-switching between island work and static section work.

**Delivers:** Clickable photo gallery with fullscreen lightbox (keyboard, swipe, Escape, counter); self-hosted video with poster frame, play button overlay, and native browser controls on CDN delivery.

**Addresses:** Photo gallery fullscreen viewing (P1 table stakes); video player for live footage (P1 differentiator)

**Avoids:** Video.js (300 KB+, not needed); missing `playsinline` on iOS; lazy-loading gallery images incorrectly (lightbox needs full-res URLs at open time)

**Research flag:** Standard patterns — PhotoSwipe 5 has documented Astro integration; no additional research needed

---

### Phase 4: Social Sharing Island

**Rationale:** Independent of all other islands (no shared state). Brief implementation (10–15 lines of JS). Best built after visual polish is complete so share content (`title`, `text`, `url`) can be finalized. Scope must be locked to sharing the page URL — not file sharing, not Stories auto-posting.

**Delivers:** Share button that opens native OS share sheet on mobile; desktop fallback showing VK share link, Telegram share link, and copy-link button; Firefox shows fallbacks instead of broken UI.

**Addresses:** Social sharing (P1); VK/Telegram as primary share channels; correct Russian-market social priority

**Avoids:** `navigator.share({ files: [blob] })` without `canShare` check (pitfall 6); Instagram constructed as share URL (pitfall 7); broken share dialog on Firefox

**Research flag:** Standard patterns — Web Share API is fully documented on MDN

---

### Phase 5: Booking Form and Telegram Integration

**Rationale:** Depends on a Telegram bot being created (external prerequisite from Соня) and `src/lib/telegram.ts` helper. The booking form UI already exists in the draft modal; only the backend wiring is new. This phase has security-critical requirements (token handling, rate limiting) and an external dependency, so it benefits from being isolated with checklist verification.

**Delivers:** Booking form that submits to Vercel serverless function, delivers formatted Russian-language message to Соня's Telegram chat, shows thank-you state on success and explicit error state with fallback Telegram link on failure.

**Addresses:** Booking form to Telegram delivery (P1 table stakes, core value of the site)

**Avoids:** Bot token in client bundle (pitfall — `PUBLIC_` prefix); no rate limiting (security pitfall — add IP-based 5/60s limit); no error state (UX pitfall — network failure silently drops bookings); webhook complexity (use `sendMessage` push mode, no webhook needed)

**External prerequisite:** Соня must create the Telegram bot and provide the token and her chat ID before this phase can be completed end-to-end.

**Research flag:** Standard patterns — Telegram Bot API `sendMessage` is well-documented; no additional research needed

---

### Phase 6: Pre-Launch Verification

**Rationale:** Several pitfalls are "looks done but isn't" — the noindex gate, Google Fonts removal, and range-request support all require explicit verification, not just visual inspection. This phase is a checklist, not feature development.

**Delivers:** Confidence that the site is ready for public launch. All verification items checked and documented.

**Avoids:** noindex left on at launch (pitfall 4); Google Fonts present at launch (pitfall 2); audio served incorrectly (pitfall 1); social links still `#` placeholders

**Verification checklist:**
- `curl -s https://brusnika.ru | grep -i robots` returns `index,follow` on production URL
- Network tab shows zero requests to `fonts.googleapis.com` or `fonts.gstatic.com`
- Network tab on audio seek shows `Accept-Ranges: bytes` and `Content-Range` in response
- Track plays on real iPhone after single tap; no uncaught promise rejections in console
- Mobile share button invokes native share sheet; Firefox shows fallback link row
- Booking form submission delivers message to Соня's Telegram chat
- All footer social links (VK, Telegram, Apple Music, Яндекс Музыка, ticket links) are real URLs

**Research flag:** No research needed — this is a verification phase

---

### Phase Ordering Rationale

- Phase 1 must be first because every component depends on the design system, content schema, and font infrastructure. Google Fonts and noindex mitigations must be in place before any content is authored.
- Phase 2 (audio) before Phase 3 (video/lightbox) because audio is the primary value delivery and has the most complex state machine. Isolating it catches mobile iOS restrictions early.
- Phases 3 and 4 are reversible — lightbox/video and social sharing have no dependencies on each other and can be swapped if priorities shift.
- Phase 5 (booking) last among feature phases because it has an external prerequisite (Telegram bot credentials) and is security-critical.
- Phase 6 (verification) always last; it validates all previous phases before launch approval.

### Research Flags

Phases needing deeper research during planning: **none.** All five feature phases use well-documented, standard patterns (Astro Content Collections, HTML5 Audio API, PhotoSwipe 5, Web Share API, Telegram Bot API direct HTTP). Official documentation exists for every technology at HIGH confidence.

Phases with standard patterns (skip research-phase flag): all six phases. Astro, Vercel, Telegram Bot API, PhotoSwipe, and Web Share API are all fully documented with official sources verified at research date.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core technologies verified via npm and official docs at research date. Astro 7.0.2, @astrojs/vercel 11.0.0 confirmed. Vercel Blob and Bunny.net pricing verified against official docs. |
| Features | HIGH | Table stakes verified against musician website checklists and UX conventions. Russian streaming platform rankings and Instagram block status verified against current sources. Social sharing constraints confirmed via MDN and Meta developer docs. |
| Architecture | HIGH | All patterns (Content Collections, hybrid output, island hydration strategies) verified against current official Astro docs. Content-as-CMS-seam pattern verified via official Content Loader Reference. |
| Pitfalls | HIGH | Critical pitfalls verified against official Vercel function limits doc, MDN, GitGuardian, and documented Russian ISP throttling reports. |

**Overall confidence:** HIGH

### Gaps to Address

- **Astro version at project creation time.** npm showed 7.0.2 at research date. Run `npm view astro version` at scaffold time and verify `@astrojs/vercel` compatibility. Architecture is identical across Astro 5/6/7; only Node runtime requirements vary.
- **Telegram bot credentials.** Bot creation and Соня's chat ID are external prerequisites for Phase 5. Must be obtained before Phase 5 begins. This is the only external dependency that can block the project.
- **Real media file availability.** Phase 1 requires actual audio (.mp3) and video (.mp4) files to upload to Vercel Blob and populate `audioUrl` / `videoUrl` values in content JSON. Confirm with the band before Phase 2 begins.
- **Vercel Blob vs. Bunny.net switch point.** Recommendation is Vercel Blob for v1. If Russian audience CDN latency becomes a measured concern, re-evaluate at the Phase 6 verification step. The switch is a file re-upload and URL value change with zero component code changes.
- **Real URLs for `#` placeholders.** Apple Music artist URL, VK Music artist URL, and individual ticket links must be provided by the band before Phase 6 can complete.

---

## Sources

### Primary (HIGH confidence)

- `npm view astro version` → 7.0.2 (verified 2026-06-24)
- `npm view @astrojs/vercel version` → 11.0.0 (verified 2026-06-24)
- [Astro Vercel Adapter Docs](https://docs.astro.build/en/guides/integrations-guide/vercel/) — hybrid mode, maxDuration, serverless endpoints
- [Astro Content Collections Docs](https://docs.astro.build/en/guides/content-collections/) — Content Layer API, `file()` loader, Zod schemas
- [Astro Islands / client directives](https://docs.astro.build/en/concepts/islands/) — hydration strategies
- [Vercel Blob Docs](https://vercel.com/docs/vercel-blob) — public store, CDN, audio/video use cases, range requests
- [Vercel Blob Pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing) — $0.023/GB storage, $0.05/GB transfer, 512 MB cache limit
- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations) — 4.5 MB response body cap (verified 2026-06-19)
- [Bunny Storage Pricing](https://bunny.net/pricing/storage/) — $0.01/GB/month, free internal egress to CDN
- [Bunny Stream Pricing](https://bunny.net/pricing/stream/) — $0.005/GB delivery, free transcoding
- [MDN Web Docs — Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) — browser support, file sharing constraints
- [Meta for Developers — Sharing to Stories](https://developers.facebook.com/docs/instagram/sharing-to-stories/) — confirmed Stories sharing requires native app, not browser
- [Google Search Central — Block indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [GitGuardian — Remediating Telegram Bot Token leaks](https://www.gitguardian.com/remediation/telegram-bot-token)
- [Autoplay policies — Bitmovin](https://bitmovin.com/blog/autoplay-policies-safari-14-chrome-64/) — iOS Safari / Chrome Mobile autoplay restrictions
- [HRW — State Censorship and Internet Isolation in Russia (2025)](https://www.hrw.org/report/2025/07/30/disrupted-throttled-and-blocked/state-censorship-control-and-increasing-isolation) — Google throttling, Instagram block
- [Instagram ban in Russia](https://vpnoverview.com/unblocking/censorship/access-instagram-russia/) — March 2022 block, September 2025 advertising ban

### Secondary (MEDIUM confidence)

- [Vercel Best Practices for Video Hosting](https://vercel.com/kb/guide/best-practices-for-hosting-videos-on-vercel-nextjs-mp4-gif) — recommends external media hosts
- [grammY Vercel Hosting Guide](https://grammy.dev/hosting/vercel) — webhook and serverless pattern confirmed; direct sendMessage needs no grammY
- [PhotoSwipe Getting Started](https://photoswipe.com/getting-started/) — v5 API; Astro integration verified via community sources
- [Don't Lazy-Load Your LCP Image — Unlighthouse](https://unlighthouse.dev/learn-lighthouse/lcp/lcp-lazy-loaded) — LCP lazy-load pitfall
- [Self-hosting Google Fonts — Tune The Web](https://www.tunetheweb.com/blog/should-you-self-host-google-fonts/) — rationale for self-hosting

### Tertiary (LOW confidence)

- [Preventing Vercel indexing](https://dev.to/samrobbins85/prevent-a-vercel-site-from-being-indexed-in-search-engines-3b65) — community post; confirmed directionally by Vercel KB but not an official doc
- PhotoSwipe + Astro integration: [launchfa.st guide](https://www.launchfa.st/blog/photoswipe-astro), [DEV community post](https://dev.to/petrovicz/astro-photoswipe-549a) — community-verified patterns, not official

---

*Research completed: 2026-06-24*
*Ready for roadmap: yes*
