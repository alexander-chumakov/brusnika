# Feature Research

**Domain:** Artist / band one-page website (Russian-language dream-pop)
**Researched:** 2026-06-24
**Confidence:** HIGH for table stakes and Russian platform specifics; MEDIUM for social-sharing behavior (platform policies shift); HIGH for booking/Telegram pattern

---

## Context: What This Site Is

внимание брусника! is a chamber dream-pop project with a vocalist (Соня) who also teaches vocal lessons and хоротерапия. The site has two distinct conversion goals on one page:

1. **Fan experience** — listen, watch, browse photos, see upcoming shows, share content
2. **Student acquisition** — book a vocal lesson or хоротерапия session with Соня

All interactive features already exist as visual mockups in the `index.html` draft. v1 makes them functional. v2 adds CMS. This analysis covers what "functional" means for each feature, expected behavior, and what to leave out.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume work on any band site. Missing these = site feels broken or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Working audio playback (on-site) | Every band site lets you hear the music; a "слушать" button that does nothing destroys credibility | MEDIUM | HTML5 `<audio>` with custom UI is the right approach; native browser controls are visually incompatible with the design; the now-playing bar already designed in the draft is the right pattern |
| Sticky now-playing bar | Standard on any site with an audio player (Spotify, Bandcamp patterns); users expect playback to persist while scrolling | LOW | Design already done in draft; implementing means wiring real audio, pause/play toggle on the bar, and close/dismiss; no page-reload persistence needed (one-page site) |
| Track play/pause toggle | Clicking a playing track again should pause it, not restart | LOW | State management between tracks: only one plays at a time; active track changes the button icon |
| Streaming service links (Yandex Music, Spotify, Apple Music, YouTube) | Russian fans expect Yandex Music and VK Music as first-class options; Spotify and Apple Music for international listeners | LOW | Links exist in draft as `#` placeholders; replace with real URLs; Yandex Music link format: `https://music.yandex.ru/artist/[id]`; VK Music: `https://vk.com/music/artist/[slug]` |
| Concert ticket links (Timepad, KassirRu, etc.) | Show rows are designed with "билеты" buttons; dead links feel broken | LOW | Timepad is the standard Russian event ticketing platform; link directly to event page; no iframe embed needed |
| Photo gallery (click to view full) | Clicking on a concert photo without anything happening is confusing | MEDIUM | Lightbox overlay with keyboard nav (arrow keys, Escape), prev/next buttons, image count indicator; touch swipe on mobile; see Behavior Notes below |
| Booking form that actually submits | Form shows "Спасибо!" in the mockup but data goes nowhere; Соня needs to receive bookings | MEDIUM | Vercel serverless function calls Telegram Bot API `sendMessage`; form POSTs name, contact, format, experience level |
| Footer social links all working | VK, Instagram, Telegram, email — currently some are `#` placeholders | LOW | Replace with real URLs; Telegram channel/group link format: `https://t.me/[username]` |
| Mobile-responsive layout | Existing media queries cover 860px breakpoint; must work on modern phones | LOW | Already designed; Astro rebuild must preserve all existing breakpoint behavior |
| Page performance (fast initial load) | Media-heavy page; fans on mobile expect < 3s first paint | MEDIUM | Self-hosted audio/video must be delivered via CDN (Vercel Blob or Bunny.net); images need proper sizing/lazy loading; no blocking JS bundles |

### Differentiators (Competitive Advantage)

Features that distinguish this site from a generic band presence. These align with the project's core value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| On-site audio player (NOT streaming redirect) | Most Russian indie band sites just link to Yandex Music/VK; keeping listeners on-site deepens the fan experience and exposes them to the booking CTA | MEDIUM | Requires self-hosted audio files delivered via CDN; metadata (track title, duration) encoded in Astro component data |
| On-site video player for live footage | Concert video is the best "preview" for buying tickets; embedding YouTube loses the aesthetic and sends users away | MEDIUM | `<video>` element with custom poster frame; muted autoplay for a preview loop is NOT appropriate for a full concert video; user must press play; see Behavior Notes |
| Photo lightbox with concert atmosphere | A grid alone doesn't convey the intimacy of small-venue shows; fullscreen photo viewing makes the gallery feel like an editorial spread | MEDIUM | Dependency: gallery images must be available at sufficient resolution for fullscreen; lazy-load thumbnails, full-res on open |
| Social sharing via native share sheet | Fans sharing a clip or the site URL to Telegram, VK, or Instagram is organic promotion; framing it as "поделиться" fits the Russian audience naturally | HIGH (per complexity/gotchas) | See detailed behavior notes below; complexity is in managing the mobile-only nature and desktop fallback |
| Telegram bot booking delivery | Соня already uses Telegram daily; bookings arriving in Telegram means zero email monitoring, instant notification, and a familiar workflow | MEDIUM | Well-established pattern (Vercel function → Telegram Bot API); requires a bot token and a chat ID; see Behavior Notes |
| Timepad хоротерапия link integration | An already-live Timepad event page exists (`sonya-brusnika.timepad.ru`); linking directly to it for group sessions removes friction | LOW | The link is already in the draft modal copy; it needs to be a real `href`, not a placeholder |
| Cursor-follow glow + scroll-reveal animations | Sets the aesthetic apart from generic Tilda/Squarespace band templates; fits the dream-pop identity | LOW | Already coded in the draft; Astro rebuild must preserve these exactly |
| Cyrillic-first, Russian-language UX | Russian text, Russian platform links, Russian date formats, Telegram as primary contact — feels native to the audience | LOW | Built into the design; Astro must use `lang="ru"` on html element; date format already correct (12 сент 2026) |

### Anti-Features (Deliberately NOT Building in v1)

| Feature | Why Requested | Why NOT in v1 | What to Do Instead |
|---------|---------------|---------------|-------------------|
| CMS / admin panel | "We'll want to update shows and tracks ourselves" | Complexity doubles; v1 scope is to ship the experience first; content patterns unknown until real use | Hardcode content in Astro components; v2 adds CMS once patterns are clear |
| Auto-posting to Instagram/VK Stories | "Sharing should just post to Stories automatically" | Technically impossible from a website; Meta/VK APIs for Stories require native app integration (Android intents / iOS URL schemes), not browser APIs | Web Share API hands off to the OS share sheet; users choose their platform and complete the share in their own app |
| Email newsletter / mailing list | Standard band site feature | Not in the brief; adds backend complexity (ESP integration) with no validated demand | Footer email address is the contact fallback; add in v2 if requested |
| Merch store | Obvious revenue stream for bands | Out of scope per PROJECT.md; adds payment processing, fulfillment logic | Reference to external merch if it exists; full store in v2+ |
| User accounts / login | "Fans could save favorites" | Zero validated need; adds auth complexity; one-page sites don't need accounts | Stateless experience is correct for this site |
| Comments / fan wall | Social engagement | Moderation burden; spam risk; no demand signal | Telegram channel serves this; link to it |
| YouTube / VK Video embeds for the video section | "Just embed YouTube" | Sends users away from the aesthetic; loses the design; YouTube embed UI is visually jarring in this dark dream-pop context | Self-hosted `<video>` with custom controls; link to YouTube separately in the footer |
| Multi-page site | "We might need a tour page, a press page..." | Scope creep; one-page is the brief | Additional sections can be added to the single page; true multi-page site is v2 territory |
| Search engine optimization (SEO) | Standard web practice | `noindex` is deliberately set per PROJECT.md until band approves launch | Configure robots meta for noindex; do not spend time on keyword optimization in v1 |

---

## Feature Behavior Notes

### Audio Player

**Expected behavior pattern (what fans are trained to expect from Bandcamp, SoundCloud, Spotify-web):**
- Click track row → starts playing; the row shows a pause icon and a subtle active state
- The sticky now-playing bar appears at the bottom with: animated EQ bars (already designed), track title, track number, pause/play button, close (×) button
- Clicking the same row again pauses; clicking a different row switches tracks (previous stops)
- Clicking close on the now-playing bar stops audio and hides the bar
- Progress bar inside the now-playing bar is a differentiator but not strictly table stakes for v1; skip if adds significant complexity
- No autoplay; user must initiate
- Audio does not persist across page reloads (one-page site, not an issue)
- Self-hosted files: `.mp3` format; served from CDN (Vercel Blob or Bunny); file URLs set in Astro component data
- Mobile: same behavior; the bottom bar must not overlap content; add `padding-bottom` to page equal to bar height when bar is visible

**What NOT to build:** playlist shuffle, repeat modes, volume slider in v1. These can be added but are not expected for a 5-track curated list.

### Video Player

**Expected behavior pattern:**
- A prominent play button overlay on the poster image; clicking reveals the `<video>` element and begins playback
- Controls: play/pause, scrub bar, volume, fullscreen button (browser native is fine; custom controls optional)
- NO autoplay (browser policy blocks unmuted autoplay, and it would be inappropriate for a concert video anyway)
- `playsinline` attribute required for iOS Safari to prevent forced fullscreen on mobile
- Fullscreen: the browser's native Fullscreen API is sufficient; no custom fullscreen implementation needed
- Self-hosted: `.mp4` (H.264); served from CDN
- Poster frame: a still from the concert video, set via `poster` attribute

**What NOT to build:** custom video controls with a JavaScript progress bar. Browser native controls are acceptable and save significant complexity. A custom play-button overlay on the poster image is sufficient design polish.

### Photo Gallery / Lightbox

**Expected behavior pattern (based on UX conventions from lightGallery and similar):**
- Click any photo in the grid → lightbox opens with full-resolution image centered on a dark overlay
- Navigation: left/right arrow buttons on the overlay; keyboard left/right arrow keys; touch swipe left/right on mobile
- Close: × button top right; click outside the image; Escape key
- Image counter: "3 / 8" style indicator
- Smooth fade or slide transition between images
- Loading state: spinner or fade-in for full-resolution images while they load
- Accessibility: focus trapped inside lightbox while open; ARIA labels on navigation buttons
- The 5 images in the draft grid become the lightbox set; order follows grid reading order

**Libraries to consider:** photoswipe (lightweight, no jQuery dependency, touch-native) or glightbox; OR a custom implementation since there are only 5 images.

### Social Sharing

**Reality of sharing from the web (HIGH confidence after research):**

Instagram Stories sharing from a website is only supported in native iOS/Android apps, not from mobile browsers. The Facebook/Meta developer documentation confirms this. The Web Share API (navigator.share) is the correct mechanism for sharing content from a web page — it opens the OS native share sheet on mobile, which includes Telegram, VK, and potentially Instagram (as a regular post, not a Story).

**Recommended implementation:**
1. **Mobile (primary):** `navigator.share({ title, text, url })` — opens OS share sheet; user selects Telegram, VK, Instagram, or any other app installed on their device
2. **Desktop fallback:** show three specific share buttons — Telegram (`https://t.me/share/url?url=[url]&text=[text]`), VK (`https://vk.com/share.php?url=[url]`), and copy-link button
3. Feature detection: `if (navigator.share && navigator.canShare())` → use Web Share; else show button row

**File sharing (for short clips):** navigator.share supports `files: [File]` — this could allow sharing a pre-rendered audio clip or video snippet as a file. However, generating a clip in the browser requires the MediaRecorder API or pre-prepared clip files, which adds significant complexity. For v1, share the page URL with a descriptive text, not a file. File sharing is a v2 differentiator.

**What users will actually be able to share:** the page URL, a band name + track title as text. This is enough for organic word-of-mouth.

**VK specifics:** VK.com is the dominant Russian social network. The share button must be present and prominent. VK share URL: `https://vk.com/share.php?url=[encoded_url]&title=[encoded_title]`

**Telegram specifics:** Telegram is the primary communication app for the Russian audience. Share widget URL: `https://t.me/share/url?url=[encoded_url]&text=[encoded_text]`

### Booking Form / Telegram Bot

**How it works:**
1. User fills form (format, name, contact, experience level) → submits
2. Browser POSTs JSON to a Vercel serverless API route (`/api/booking`)
3. The serverless function calls `https://api.telegram.org/bot[TOKEN]/sendMessage` with a formatted message to Соня's Telegram chat ID
4. Function returns success → browser shows "Спасибо!" screen already designed in the modal
5. On error: show an inline error message with a fallback Telegram link or email address

**Message format to Соня (example):**
```
📬 Новая заявка
Формат: Индивидуальный вокал
Имя: Марина
Контакт: @marina_sings
Опыт: Пою для себя
```

**Security:** the bot token must be in a Vercel environment variable, never in client-side code. The API route is a server function.

**Spam risk:** minimal for v1; if needed add a simple honeypot field.

**Timepad integration in modal:** the existing draft already links хоротерапия group sessions to the live Timepad event (`sonya-brusnika.timepad.ru/event/4010316/`). This link should be real in v1; no further Timepad integration is needed.

---

## Feature Dependencies

```
Audio Player
    └──requires──> CDN-hosted audio files (.mp3)
    └──requires──> Now-Playing Bar (UI feedback)
                       └──enhances──> Track play/pause toggle

Video Player
    └──requires──> CDN-hosted video file (.mp4)
    └──requires──> Poster image

Photo Lightbox
    └──requires──> Full-resolution versions of gallery images
    └──enhances──> Gallery grid (makes it interactive)

Booking Form
    └──requires──> Vercel serverless function (/api/booking)
    └──requires──> Telegram Bot token (environment variable)
    └──requires──> Соня's Telegram chat ID

Social Sharing
    └──requires──> navigator.share feature detection
    └──requires──> Share URL (the site URL itself)
    └──fallback──> VK share link + Telegram share link + copy button (desktop)

All media features
    └──requires──> CDN/media hosting decision (Vercel Blob vs Bunny.net)
```

### Dependency Notes

- **CDN/media hosting must be decided before audio and video work** — all media feature development is blocked until the storage approach is confirmed.
- **Telegram bot token and chat ID must be obtained before booking form can be tested end-to-end** — Соня needs to create a bot via @BotFather and forward her chat ID.
- **Photo lightbox is independent** — images are already in the `images/` folder; lightbox can be built without CDN decision.
- **Social sharing is independent** — shares the page URL; no media files needed for v1 sharing.
- **Booking form UI exists** — only the backend plumbing (Vercel function + Telegram) needs to be added.

---

## MVP Definition

### Launch With (v1)

All of these are in scope for v1 per PROJECT.md.

- [ ] Audio player — play/pause per track, now-playing sticky bar, single active track at a time
- [ ] Video player — poster + play button, browser native controls, CDN-hosted file
- [ ] Photo lightbox — click to open, arrow key / swipe navigation, Escape to close
- [ ] Social sharing — navigator.share on mobile, Telegram + VK + copy-link on desktop
- [ ] Booking form — submits to Vercel function, delivers to Соня via Telegram bot
- [ ] All real links wired — Yandex Music, Apple Music, VK, Instagram, Telegram, ticket links, Timepad

### Add After Validation (v1.x)

These are improvements to v1 features once core is shipped and tested:

- [ ] Progress scrub bar in now-playing — lets users seek within a track (adds JS complexity; not critical for 5 short tracks)
- [ ] Social sharing of video clip files — requires pre-prepared downloadable snippets; significant complexity
- [ ] Keyboard shortcut for audio playback (Space to pause) — nice but not urgent

### Future Consideration (v2+)

- [ ] CMS / admin panel — add, edit, remove tracks/shows/photos without code
- [ ] Email newsletter / mailing list — if the band decides to build an email list
- [ ] Merch store integration — if merchandise is introduced
- [ ] YouTube/VK Video embed fallback — if self-hosted video proves too expensive to serve at scale
- [ ] Multi-language support (EN) — if international audience grows

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Working audio player | HIGH | MEDIUM | P1 |
| Real streaming links (Yandex Music, Spotify, etc.) | HIGH | LOW | P1 |
| Booking form → Telegram | HIGH | MEDIUM | P1 |
| Real ticket links | HIGH | LOW | P1 |
| Photo lightbox | MEDIUM | MEDIUM | P1 |
| Video player (live footage) | MEDIUM | MEDIUM | P1 |
| Social sharing (Web Share API + fallbacks) | MEDIUM | MEDIUM | P1 |
| Now-playing sticky bar (real audio) | HIGH | LOW | P1 |
| Progress bar in now-playing bar | LOW | MEDIUM | P2 |
| Social sharing of clip files | LOW | HIGH | P3 |
| Email capture | LOW | MEDIUM | P3 |

**Priority key:** P1 = must have for v1 launch; P2 = add when core is stable; P3 = v2+ territory

---

## Russian Market Specifics

### Streaming Platforms (in order of audience size in Russia, 2024)

1. **Яндекс Музыка** — dominant; artist page URL: `https://music.yandex.ru/artist/[id]`; supports iframe embeds but embedding on-site is not recommended (styling conflict, separate playback from on-site player); link out is correct
2. **VK Музыка** — second place; deeply integrated with VK social network; artist page URL: `https://vk.com/music/artist/[slug]`
3. **МТС Музыка** — the band's own label (МТС Лейбл mentioned in the draft); link if available
4. **Spotify** — available in Russia for now; artist link already in the draft
5. **Apple Music** — placeholder `#` in draft; needs real artist URL
6. **YouTube** — for video/live content; already linked

### Ticket Platforms

- **Timepad** — the primary Russian indie event platform; what Соня already uses for хоротерапия (`sonya-brusnika.timepad.ru`); also used for concerts. Direct links to Timepad event pages are the correct pattern — no widget embed needed.
- **КассирРу (kassir.ru)** — larger commercial ticket platform; used for bigger venues like 16 Тонн; link format: `https://www.kassir.ru/` + event page
- **Afisha.ru** — discovery + ticketing; may list the band automatically; link if available

### Social / Communication

- **Telegram** — primary for Russian indie audience; band has `@vnimaniebrusnika` channel; also the booking delivery mechanism; share format: `https://t.me/share/url?url=[url]&text=[text]`
- **VK (ВКонтакте)** — largest Russian social network; mandatory presence; share format: `https://vk.com/share.php?url=[url]`
- **Instagram** — available via VPN; included because the design calls for it; share from web via native share sheet only (no Stories API from browser)
- **Email** — `hello@brusnika.ru` in the footer; provides a non-Telegram contact option

---

## Sources

- Bandzoogle: "Creating a band website: A complete checklist" — musician website table stakes
- dontlabelit.co.uk: "Top 10 Features Every Musician's Website Should Have (2024 Update)"
- MDN Web Docs: Web Share API — `navigator.share()` implementation and constraints
- Meta for Developers: "Sharing to Stories" — confirmed Stories sharing requires native iOS/Android apps, not web
- sudolabs.com: "Share visual content from web to social media without API or SDK" — Web Share API file sharing behavior and desktop limitations
- Telegram official: `core.telegram.org/widgets/share` — `t.me/share/url` format
- GitHub / social-share-urls: VK share link format `vk.com/share.php`
- vc.ru / iguides.ru: Russian streaming platform landscape 2024 — Яндекс Музыка, VK Музыка rankings
- Timepad documentation (via Tilda integration guide) — Timepad widget embed capabilities; direct links are sufficient
- lightGallery docs — lightbox keyboard/touch navigation expected behaviors
- Chrome Developers: autoplay policy — muted-only autoplay, `playsinline` requirement
- marclittlemore.com / YouTube tutorial: Vercel serverless Telegram bot pattern

---
*Feature research for: внимание брусника! — Russian-language dream-pop band one-page website*
*Researched: 2026-06-24*
