# Pitfalls Research

**Domain:** Media-rich band website — Astro on Vercel, self-hosted audio/video, Telegram-bot booking, Web Share API, Russian-market audience
**Researched:** 2026-06-24
**Confidence:** HIGH (critical pitfalls verified against official Vercel docs, MDN, and community sources)

---

## Critical Pitfalls

### Pitfall 1: Serving Audio/Video Through Vercel Serverless Functions (Not Blob/CDN)

**What goes wrong:**
A developer wires up the audio player or video element to an API route (e.g. `/api/track/[slug]`) that reads the file and streams it. This fails in multiple ways: Vercel Functions cap non-streaming response bodies at 4.5 MB (an MP3 or video will blow past this), and even with streaming enabled, Functions are designed for lightweight API logic — not media transfer. Seekable playback requires HTTP 206 Partial Content with `Accept-Ranges: bytes`; a naive Function won't emit the right headers, making scrubbing broken in Chrome.

**Why it happens:**
The pattern of "proxy a file through an API route" is common for adding auth headers, and developers carry it over to public media without realising Vercel Blob already provides CDN delivery with range-request support natively.

**How to avoid:**
Upload audio and video to Vercel Blob with `access: 'public'`. Point `<audio src>` and `<video src>` directly at the Blob CDN URL — never route media through a Function. Vercel Blob's CDN serves files from 20 regional hubs, handles range requests, and caches blobs up to 512 MB (audio files are well under this; a full-resolution concert video likely is too unless it exceeds 512 MB, in which case every play is a cache miss and costs extra). The Vercel Blob docs explicitly list "large files such as video and audio" as a primary use case.

**Warning signs:**
- Track buttons work locally (no real `<audio>` yet) but audio fails after deployment
- Network tab shows 200 responses without `Accept-Ranges: bytes` or `Content-Range`
- Scrubbing the audio player jumps back to beginning (no range request support)
- Console shows `413 FUNCTION_PAYLOAD_TOO_LARGE`

**Phase to address:**
Media infrastructure phase (before any audio/video player is wired up). The Blob store region, public vs. private decision, and upload workflow must be decided before building the player component.

---

### Pitfall 2: Google Fonts Blocked or Slow for Russian Users

**What goes wrong:**
The existing `index.html` already loads Prata and Golos Text from `fonts.googleapis.com` and `fonts.gstatic.com`. Russian ISPs throttle or selectively block Google services (Roskomnadzor has blocked Google News and Google services have been subject to throttling campaigns). Even when not outright blocked, latency from Russia to Google's font CDN edge nodes can be high. The result: Prata fails to load and the entire typographic design — which depends on the Prata serif for headings and the hero — falls back to system serif, destroying the visual identity. The band's audience is specifically Russian-speaking.

**Why it happens:**
Google Fonts is so universal that developers never question it, and the draft was generated without awareness of the Russian-connectivity reality.

**How to avoid:**
Self-host both fonts. Download the WOFF2 files (tool: `google-webfonts-helper.herokuapp.com` or `fontsource.org`), add them under `public/fonts/`, declare `@font-face` in the Astro global CSS. This eliminates the Google dependency entirely and improves performance (eliminates the cross-origin DNS prefetch round-trip). Alternatively Bunny Fonts (`fonts.bunny.net`) is a GDPR-compliant EU-hosted drop-in replacement, but self-hosting is more reliable for Russia because it removes third-party reachability entirely.

**Warning signs:**
- `<link rel="preconnect" href="https://fonts.googleapis.com">` still in `<head>` at launch
- Russian test users report broken/ugly fonts (system serif fallback visible)
- Lighthouse shows render-blocking requests to `fonts.googleapis.com`

**Phase to address:**
Astro build setup phase (first phase). Replace the Google Fonts `<link>` tags before anything else is built — it is already in the `index.html` and will be copy-pasted forward if not explicitly removed.

---

### Pitfall 3: Audio Autoplay Silently Fails on Mobile (iOS Safari)

**What goes wrong:**
A developer implements a global "now playing" state and tries to resume playback when the player bar re-opens, or wires up a demo autoplay on page load. iOS Safari and Chrome Mobile block `audio.play()` unless it is called directly in response to a user gesture (tap/click). The promise returned by `play()` rejects with `NotAllowedError`. If not caught, this creates an uncaught rejection and the player appears stuck — the "now playing" bar shows but no sound plays. Android Chrome and mobile browsers have the same restriction for audio with sound.

**Why it happens:**
Desktop browsers are more permissive, so it works in development. The fake now-playing bar in the draft fires synchronously from a click event, which masks that real audio would need `audioElement.play()` inside the handler — any async gap (fetching the URL, waiting for metadata) breaks the gesture chain in iOS Safari.

**How to avoid:**
Always call `audioElement.play()` inside the synchronous click handler — before any `await`. For the "resume" case (user clicked play earlier, navigated within the SPA, now audio should resume): store state but re-prompt play with a visible button; never attempt auto-resume. Catch the `play()` promise: `audioElement.play().catch(() => showPlayButton())`. For video: use `muted autoplay playsinline` for ambient/hero video only; never autoplay video with sound.

**Warning signs:**
- `Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first` in mobile console
- Players work on desktop Chrome, fail silently on iPhone
- The now-playing bar appears but volume-bar animation runs without sound

**Phase to address:**
Audio player component phase. The player island must be built with the no-autoplay constraint as a first-class design decision.

---

### Pitfall 4: Telegram Bot Token in Source Code or Client-Side Bundle

**What goes wrong:**
The bot token is committed to the repo, logged during a Vercel build, or accidentally included in the client-side bundle (e.g. placed in an Astro component's frontmatter that gets tree-shaken incorrectly, or put in a `PUBLIC_` prefixed env var). Once the token is exposed, anyone can impersonate the bot, spam Соня with fake form submissions, or extract the webhook URL (which reveals the Vercel function endpoint). The GitGuardian article confirms that a leaked token grants full control over the bot.

**Why it happens:**
Astro's `PUBLIC_` prefix makes env vars available in the browser. A developer stores `PUBLIC_TELEGRAM_BOT_TOKEN=...` to make it "accessible" without realising it ships in the built JS.

**How to avoid:**
Store the token as `TELEGRAM_BOT_TOKEN` (no `PUBLIC_` prefix) in Vercel project settings. Access it only inside the Astro server-side API endpoint (`src/pages/api/book.ts`). Never reference it in any `.astro` component script block that isn't tagged `server:only`, and never use the `PUBLIC_` prefix. Add rate limiting to the `/api/book` endpoint (e.g. simple IP-based check: reject if >5 submissions in 60 seconds from same IP). Add a honeypot field to the form.

**Warning signs:**
- `TELEGRAM_BOT_TOKEN` appears with `PUBLIC_` prefix in any env var
- `process.env.TELEGRAM_BOT_TOKEN` referenced in a `.astro` file outside the server section
- Token visible in browser DevTools → Network → Response payload

**Phase to address:**
Booking form / Telegram integration phase. Must be treated as security-critical from day one, not retrofitted.

---

### Pitfall 5: noindex Left On at Launch

**What goes wrong:**
The site ships with `<meta name="robots" content="noindex">` for pre-launch testing (correct). After the band approves the launch, the developer removes the Vercel password protection, points the domain, and announces the site — but forgets to remove the noindex tag (and/or the `Disallow: /` in `robots.txt`). The site is now live and publicly linked from Instagram, VK, and Telegram but Google will not index it. It can take weeks before anyone notices (Google Search Console would show 0 impressions, but the band may not be checking it). If `robots.txt` also disallows crawling, Google cannot even see the noindex instruction, which could cause outdated cached pages to persist in results if they exist.

**Why it happens:**
"Remove noindex at launch" is a checklist item that exists only in the developer's head. The noindex is baked into a layout component, not surfaced as a visible config or environment variable.

**How to avoid:**
Gate the noindex on a Vercel environment variable: `NOINDEX=true` in the Vercel Preview/Development environment, absent in Production. In the Astro layout: `<meta name="robots" content={import.meta.env.NOINDEX ? 'noindex,nofollow' : 'index,follow'}>`. Then removing noindex at launch is a Vercel dashboard env var toggle, not a code change — impossible to forget. Also add a pre-launch checklist item to verify in Google Search Console that the production URL returns `index,follow` after launch.

**Warning signs:**
- `<meta name="robots" content="noindex">` hardcoded in `BaseLayout.astro`
- Launch announcement made without checking `curl -I https://brusnika.ru | grep -i x-robots`
- Google Search Console shows "Crawled, currently not indexed" after 2+ weeks live

**Phase to address:**
Initial Astro setup phase (set up the env-var gate from day one). Pre-launch checklist must capture "remove NOINDEX from Vercel Production env".

---

### Pitfall 6: Web Share API Misunderstood as "Post to Stories"

**What goes wrong:**
The feature is described in PROJECT.md as sharing "short clips/content to their own stories/feeds". A developer implements `navigator.share({ files: [videoBlob] })` and assumes this will open Instagram Stories on mobile. It does not. The Web Share API opens the OS native share sheet, which lets the user choose any installed app. Whether that app accepts a video file and places it in Stories is entirely the receiving app's decision — Instagram on iOS may or may not accept a video file from the share sheet, and even if it does, it opens the camera roll, not a pre-loaded Story post. On desktop, Chrome 128+/Edge/Safari support `navigator.share` but Firefox never has; the desktop share sheet is minimal compared to mobile. Trying to `share({ files: [...] })` with a video Blob will fail if the browser does not support file sharing (`navigator.canShare({ files })` returns false on many environments).

**Why it happens:**
The term "share to stories" sounds achievable from a website, but there is no web API that auto-posts to Instagram/VK Stories. Even native apps must use platform-specific SDKs. The PROJECT.md already correctly notes this in Out of Scope, but the implementation can still be built incorrectly if the developer tries to make file-sharing "work" on desktop.

**How to avoid:**
Implement the share button as: (1) check `navigator.share` is available AND `navigator.canShare({ url })` returns true — if so, call `navigator.share({ title, text, url })` sharing the page URL (not a video Blob); (2) for desktop fallback show platform-specific share links: `https://vk.com/share.php?url=...` and `https://t.me/share/url?url=...` (Instagram has no web share URL). Document explicitly in code that "sharing a video file to Stories is impossible from a website" to prevent future re-attempts.

**Warning signs:**
- Code attempts `navigator.share({ files: [videoBlob] })` without `canShare` check
- "Share to Stories" appears anywhere in the UI copy as a promise
- Desktop shows a broken/empty share dialog because Firefox + non-gesture context

**Phase to address:**
Social sharing feature phase. Scope must be locked: share the page URL via the native OS sheet; platform share-link fallbacks for desktop. Nothing more.

---

### Pitfall 7: Instagram as a First-Class Social Platform for Russian Audience

**What goes wrong:**
Instagram is blocked in Russia since March 2022 (Roskomnadzor). A developer adds an "подписаться в Instagram" link prominently in the social section, includes Instagram in the Web Share API fallback links, and optimises sharing previews for Instagram. Russian users cannot visit the Instagram link without a VPN. The footer in the current `index.html` already includes `Instagram` as a navigation link with a `#` placeholder. Linking to the band's Instagram profile is not harmful (those with VPNs can use it), but designing around Instagram as a primary sharing channel wastes effort.

**Why it happens:**
Instagram feels like a universal platform. The fact that it is legally blocked in Russia (classified as an extremist organisation) is easy to forget when building from outside Russia. Since September 2025, advertising on Instagram is also illegal in Russia.

**How to avoid:**
Primary social links should be Telegram and VK. Instagram can remain in the footer (it is still used via VPN and band members may be active there), but should not be the default share target, should not be listed first, and share-link fallback should default to VK and Telegram. The share button logic should not construct an Instagram share URL at all (Instagram has no public web share URL endpoint anyway).

**Warning signs:**
- Instagram listed before VK/Telegram in the social links footer
- Web Share fallback includes an Instagram share URL
- Analytics (if added later) show very low click-through on Instagram links from Russian users

**Phase to address:**
Social links wiring phase. When replacing `#` placeholder links, prioritise VK and Telegram.

---

### Pitfall 8: Hero Image Lazy-Loaded → Destroyed LCP

**What goes wrong:**
Astro's `<Image>` component defaults to `loading="lazy"` and `decoding="async"`. If the hero image (`images/hero.jpg`) is converted to an Astro `<Image>` component without explicitly setting `loading="eager"` and `fetchpriority="high"`, the browser will not start loading it until it is about to enter the viewport — which for a `min-height: 100vh` hero means it starts loading exactly when it is needed, tanking LCP by 2–4 seconds on a slow mobile connection. The hero is also a full-bleed, `object-fit: cover` image that is always the largest visible element on load: it will be the LCP element every time.

**Why it happens:**
"Lazy load all images" is a well-intentioned performance mantra that breaks when applied to above-the-fold images. Astro's default is correct for below-the-fold images, but wrong for the hero.

**How to avoid:**
On the hero `<Image>` (and any other above-the-fold image): `loading="eager"` and `fetchpriority="high"`. Use `<Picture>` with `formats={['avif', 'webp']}` for the hero to serve AVIF to browsers that support it. Do NOT lazy-load the first gallery or album cover image either. Lazy-load everything below the fold. Also: the film-grain overlay and cursor-glow use `position: fixed` with `will-change: transform` — confirm they are not inadvertently adding to the LCP candidate.

**Warning signs:**
- Lighthouse LCP > 2.5 s on a simulated mobile connection
- Network waterfall shows hero image starting to load after DOMContentLoaded
- `loading="lazy"` in the rendered HTML for the hero `<img>`

**Phase to address:**
Astro component build phase (when converting static HTML sections to Astro components). Must be checked during the image component build, not as a post-launch fix.

---

### Pitfall 9: Hardcoded Content Structure Makes v2 CMS Migration Painful

**What goes wrong:**
In v1, all content (track titles, concert dates, venue names, ticket URLs, bio copy) lives in Astro component markup. When v2 adds a CMS, the developer must hunt through multiple `.astro` files to find every hardcoded string, restructure them into a data layer, and match the exact shape the CMS delivers. If the component structure couples presentation and data tightly (e.g. the track list is a single `div` with inline data attributes), the migration is a rewrite of each component. Concert dates in particular will need updating manually until the CMS is in place — if the site ships in August and a show changes, there is no admin panel.

**Why it happens:**
"Hardcode for v1, extract for v2" is a common plan that fails because the extraction cost scales with how tightly data is coupled to markup. Choosing wrong component boundaries now locks in a painful CMS shape later.

**How to avoid:**
Establish a "content boundary" convention in v1: all hardcoded content should live in a single `src/content/` data file (TypeScript objects or JSON) per content type (`tracks.ts`, `shows.ts`, `bio.ts`), imported into components. Components become pure renderers. This is not a CMS, but it means v2 CMS migration is only replacing `import { shows } from '../content/shows'` with a CMS fetch — not rewriting every component. Astro's built-in Content Collections are ideal here: define a schema now, populate with local JSON/markdown v1, swap the loader for a CMS in v2 without touching component code.

**Warning signs:**
- Concert dates, track titles, or venue names appear as inline text in `.astro` component JSX
- No `src/content/` directory after the initial Astro build phase
- Track list is a hardcoded `ul` rather than a `.map()` over a data array

**Phase to address:**
Astro component build phase (from the first component written). The data boundary must be established before any content-heavy component is built.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline styles in `.astro` (copy-pasted from `index.html`) | Fastest fidelity to existing design | Class-less markup is hard to read, impossible to diff, and prevents Tailwind/CSS modules in v2 | Acceptable only for initial hero/header; extract to scoped `<style>` blocks ASAP |
| Serve audio from Vercel Git repo `/public/` | Zero setup required | Vercel's 100 MB file limit blocks real audio files; no CDN cache, no range requests | Never — use Blob from day one |
| Hardcode `NOINDEX` as `<meta>` in layout | Simple | Requires code change to remove at launch; will be forgotten | Never — gate on env var |
| Single Vercel serverless function without rate limiting | Fastest to ship the form | Spam/abuse vector for the Telegram bot; Соня's inbox fills with junk | Never for a public form |
| `loading="lazy"` on all images | Correct for most images | Destroys LCP for hero image | Only for images below the fold |
| Google Fonts `<link>` tag (copy from draft) | Zero setup | Blocked or slow for Russian users; render-blocking | Never — self-host fonts |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Telegram Bot API | Sending form data directly from client-side JS to the Bot API (exposing token) | POST to `/api/book` server function only; function calls Telegram API server-to-server |
| Vercel Blob (audio/video) | Uploading via server upload (incurs Fast Data Transfer charges) | Use client-side upload for initial asset population; direct Blob URLs for playback |
| Web Share API | Not checking `navigator.canShare()` before calling `navigator.share()` | Always gate on `if (navigator.share)` and `navigator.canShare(data)` before sharing |
| Telegram bot webhook | Vercel function returning 200 before processing is complete → Telegram retries | Respond `200 OK` immediately, process async; for simple form sends this is fast enough |
| Astro `<Image>` component | Using it without specifying `width` and `height` props → layout shift (CLS) | Always provide explicit dimensions; use aspect-ratio CSS as fallback |
| Astro env vars | Using `PUBLIC_TELEGRAM_BOT_TOKEN` to make the token "available" in a component | Use `TELEGRAM_BOT_TOKEN` (no prefix); access only in `src/pages/api/*.ts` |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unoptimised hero image (raw JPEG from band) | LCP 4–6 s on mobile | `<Picture formats={['avif', 'webp']} loading="eager" fetchpriority="high">` | Immediately on any real mobile network |
| Scroll-reveal IntersectionObserver on every `[data-reveal]` element | JS blocks paint; layout shift on slow devices | Use `requestIdleCallback` or ensure IO callback is lightweight | On low-end Android devices |
| Cursor-follow glow `mousemove` listener (no throttle) | Janky scroll on mobile pointer | Already conditioned on `(pointer:fine)` in draft — preserve this check | On hover-capable touchscreens (Surface, iPad with keyboard) |
| Loading all gallery images eagerly | Above-fold LCP slows due to bandwidth contention | `loading="lazy"` on gallery images; `loading="eager"` on hero only | On slower connections; gallery is below fold |
| Marquee animation on low-power mode | Battery drain; iOS Low Power Mode pauses CSS animations | Use `@media (prefers-reduced-motion: reduce)` to pause marquee | iOS Low Power Mode; user accessibility preference |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `PUBLIC_TELEGRAM_BOT_TOKEN` in Vercel env | Token ships in client JS bundle; bot fully compromised | Never prefix Telegram token with `PUBLIC_`; server-side only |
| No rate limit on `/api/book` | Automated form spam fills Соня's Telegram inbox | IP-based rate limit (5 submissions/60s per IP); honeypot field |
| Committing `.env` with bot token to git | GitHub secret scanning will catch it, but token is in history | `.env` in `.gitignore` from day one; verify with `git log -- .env` before first commit |
| Webhook URL leakable via `getWebhookInfo` Bot API call | Exposes Vercel function URL (platform fingerprinting) | Use `sendMessage` push mode (not webhook) for a simple form — no webhook registration needed at all |
| No HTTPS on production | Web Share API requires secure context; form submissions rejected | Vercel provides HTTPS automatically; ensure no mixed-content assets |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Audio player with no visible "loading" state | User taps play, nothing happens for 2 s; taps again, two tracks start simultaneously | Show a spinner inside the play button; disable the button while audio is loading |
| "Now playing" bar blocks footer on mobile | Band name/social links unreachable without closing bar | Add `padding-bottom` equal to bar height to the page body when bar is visible |
| Share button visible on desktop with no fallback | Firefox users see broken/no share UI | Hide Web Share button on Firefox (detect via `navigator.share === undefined`); show platform links instead |
| No keyboard access to the lessons modal | Screen reader and keyboard users cannot open or close the modal | `role="dialog"`, `aria-modal="true"`, focus trap on open, `Escape` closes (already in draft — verify `aria` attrs) |
| Booking form success state only ("Спасибо!") — no error state | Network failure silently drops the booking; Соня never hears from user | Add explicit error state with fallback Telegram link if API call fails |
| Lightbox gallery without keyboard navigation | Users cannot scroll photos without mouse | `focustrap` + arrow key handling in the lightbox component |

---

## "Looks Done But Isn't" Checklist

- [ ] **Audio player:** Track buttons show the now-playing bar (already works in draft), but `<audio>` element exists, range requests work, and scrubbing doesn't reload the file from the start — verify in Network tab
- [ ] **Booking form:** Shows "Спасибо!" in demo — verify the actual Telegram `sendMessage` call succeeds and Соня receives the message in the correct chat
- [ ] **noindex:** `<meta name="robots" content="noindex">` present in preview, absent in production — verify via `curl -s https://brusnika.ru | grep -i robots`
- [ ] **Google Fonts removed:** No requests to `fonts.googleapis.com` or `fonts.gstatic.com` in Network tab after migration
- [ ] **Social links:** Footer has `#` placeholders for VK, Apple Music, Яндекс Музыка, and ticket links — all must be real URLs before launch
- [ ] **Range requests:** Open browser DevTools → Network → click a track → check server response includes `Accept-Ranges: bytes` and `Content-Range` on a seek operation
- [ ] **Mobile audio:** Test on real iPhone (not simulator) — confirm track plays after tap, scrubbing works, background audio continues
- [ ] **Web Share API:** On mobile Chrome, share button invokes native share sheet; on Firefox desktop, fallback platform links are shown instead

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Audio served via Function (wrong approach discovered post-launch) | MEDIUM | Upload files to Vercel Blob, update `src` attributes in audio components, redeploy — no data loss |
| Telegram token leaked (committed to git) | HIGH | Immediately revoke token via BotFather (`/revoke`), generate new token, update Vercel env var, force-push rewrite if public repo |
| noindex left on at launch | MEDIUM | Remove env var or update layout component, redeploy; submit URL to Google Search Console for expedited crawl; may take 1–4 weeks to appear in results |
| Google Fonts blocking discovered post-launch | LOW | Self-host fonts (1–2 hours of work), redeploy — no user data impact |
| Hardcoded content requiring manual update (show date changed) | LOW (v1) → HIGH (at scale) | Edit `src/content/shows.ts`, redeploy; acceptable for v1 with few shows; motivates v2 CMS |
| LCP-lazy-loaded hero image (post-launch audit) | LOW | Add `loading="eager" fetchpriority="high"` to hero `<Image>`, redeploy |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Google Fonts blocked for Russian users | Phase 1: Astro project setup | No requests to `fonts.googleapis.com` in Network tab after first build |
| noindex env-var gate (not hardcoded) | Phase 1: Astro project setup | Preview env shows `noindex`; production env shows `index,follow` |
| Hero image LCP (eager loading) | Phase 2: Astro component build | Lighthouse mobile LCP < 2.5 s after hero component built |
| Hardcoded content / data boundary | Phase 2: Astro component build | `src/content/` data files exist; no literal track titles in component JSX |
| Audio via Blob CDN (not Function) | Phase 3: Media player implementation | Network tab shows Blob CDN URL with `Accept-Ranges: bytes` |
| Autoplay restriction (mobile iOS) | Phase 3: Media player implementation | Audio plays on real iPhone after single tap; no uncaught promise rejections |
| Web Share API desktop/Firefox | Phase 4: Social sharing implementation | Firefox shows platform link fallbacks; mobile shows native share sheet |
| Instagram not primary for Russian users | Phase 4: Social sharing implementation | VK/Telegram listed before Instagram; no Instagram share URL in code |
| Telegram token security + rate limit | Phase 5: Booking form / Telegram API | Token not in any `PUBLIC_` env var; form submits rate-limited to 5/min |
| noindex removed at launch | Pre-launch checklist | `curl -s https://brusnika.ru | grep robots` returns `index,follow` |

---

## Sources

- [Vercel Functions Limits (official, updated 2026-06-19)](https://vercel.com/docs/functions/limitations)
- [Vercel Blob — official docs (updated 2026-02-19)](https://vercel.com/docs/vercel-blob)
- [Vercel Blob Pricing and Size Limits (updated 2026-06-16)](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [MDN Web Docs — Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [Can I Use — Web Share API (84% global support, Firefox excluded)](https://caniuse.com/web-share)
- [Google Search Central — Block indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [GitGuardian — Remediating Telegram Bot Token leaks](https://www.gitguardian.com/remediation/telegram-bot-token)
- [grammY — Hosting Telegram bots on Vercel](https://grammy.dev/hosting/vercel)
- [Autoplay policies — Bitmovin comparison of Safari/Chrome](https://bitmovin.com/blog/autoplay-policies-safari-14-chrome-64/)
- [Astro Image Optimization and LCP — PageSpeedFix](https://www.pagespeedfix.com/blog/astro-image-optimization/)
- [Don't Lazy-Load Your LCP Image — Unlighthouse](https://unlighthouse.dev/learn-lighthouse/lcp/lcp-lazy-loaded)
- [HRW — State Censorship and Internet Isolation in Russia (2025)](https://www.hrw.org/report/2025/07/30/disrupted-throttled-and-blocked/state-censorship-control-and-increasing-isolation)
- [Instagram ban in Russia (March 2022, advertising ban Sept 2025)](https://vpnoverview.com/unblocking/censorship/access-instagram-russia/)
- [Self-hosting Google Fonts — Tune The Web](https://www.tunetheweb.com/blog/should-you-self-host-google-fonts/)
- [Serving Video with HTTP Range Requests — smoores.dev](https://smoores.dev/post/http_range_requests/)

---
*Pitfalls research for: внимание брусника! — Astro/Vercel media-rich band website*
*Researched: 2026-06-24*
