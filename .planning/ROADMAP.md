# Roadmap: внимание брусника! — Band Website

**Created:** 2026-06-24
**Granularity:** Coarse
**Mode:** MVP (vertical slices)
**Coverage:** 28/28 v1 requirements mapped

---

## Phases

- [x] **Phase 1: Foundation & Static Site** — Astro scaffold, self-hosted fonts, all static sections, shows data, real links, noindex gate, deployed to Vercel (completed 2026-06-24)
- [x] **Phase 2: Media Islands** — Working audio player (CDN-backed), video player, photo lightbox gallery (completed 2026-06-24)
- [x] **Phase 3: Sharing & Booking** — Social share button with mobile/desktop paths; booking form wired to Соня's Telegram bot (completed 2026-06-25)
- [ ] **Phase 4: Pre-Launch Verification** — Noindex confirmed correct, no Google Fonts, iOS audio seekable, all links real, booking tested end-to-end, launch-time toggle documented

---

## Phase Details

### Phase 1: Foundation & Static Site

**Goal:** A visually complete, deployable Astro site that matches the existing draft pixel-for-pixel, with all static sections populated from Content Collections, real outbound links, shows data, self-hosted fonts, and noindex gating — shareable via Vercel preview URL before any interactive island work.
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, SHOW-01, SHOW-02, LINK-01, LINK-02
**Success Criteria** (what must be TRUE):

  1. Visitor sees the full page at the Vercel preview URL — dark theme, pink accent, Prata headings, Golos Text body, all sections (hero, marquee, featured album, tracks list, about, shows, gallery, "пойте с нами", footer) — matching the draft layout on both mobile and desktop
  2. Page source contains zero requests to `fonts.googleapis.com` or `fonts.gstatic.com`; fonts render correctly for a visitor without Google Fonts access
  3. Shows section lists real upcoming concert dates, cities, venues, and each links to a real Timepad/Kassir ticket page (no `#` placeholder)
  4. Streaming links (Yandex Music and VK Music first, then Spotify, Apple Music, YouTube) and footer social/contact links (Telegram, VK, email) resolve to real destination pages
  5. Loading the Vercel preview URL with `NOINDEX=true` env var set causes `<meta name="robots" content="noindex">` to appear in page source; no crawler can index the page until the env var is removed

**Plans:** 4/4 plans complete
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Walking Skeleton: scaffold Astro + Vercel adapter, move images, global tokens, Layout (fonts + noindex), Hero, deploy (FND-01/02/06/07)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Static prose sections: nav, marquee, featured album, about, sing-with-us (FND-01/04)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Content Collections seam: tracks/shows/gallery from getCollection() + demo now-playing bar (FND-05, SHOW-01/02)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-04-PLAN.md — Links-as-data + footer + lessons modal (fake submit) + animations + final pixel pass (LINK-01/02, FND-03)

**UI hint**: yes

### Phase 2: Media Islands

**Goal:** Visitors can listen to every track on-site, watch live video, and browse concert photos in fullscreen — all media served from CDN with correct range-request support.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** AUD-01, AUD-02, AUD-03, AUD-04, AUD-05, VID-01, VID-02, VID-03, GAL-01, GAL-02, GAL-03
**Success Criteria** (what must be TRUE):

  1. Clicking a track in the track list starts audio playback and shows a sticky now-playing bar with the track title and animated EQ; clicking a different track switches playback; only one track plays at a time; the dismiss button stops playback and hides the bar
  2. Audio network response shows `Accept-Ranges: bytes` and serves HTTP 206 on partial requests; scrubbing to mid-track on a real iPhone works without restarting from the beginning
  3. Clicking the video poster opens inline playback with browser controls; video plays `playsinline` on iOS without forced fullscreen; video does not autoplay on page load
  4. Clicking a gallery photo opens it fullscreen in a lightbox; visitor can advance and go back using arrow buttons, keyboard left/right, and mobile swipe; an image counter shows position (e.g. "3 / 12"); pressing Escape, clicking ×, or tapping outside closes the lightbox

**Plans:** 4/4 plans complete
Plans:
**Wave 1**

- [x] 02-01-PLAN.md — CDN media upload to Vercel Blob + data layer: reconcile tracks to 6 real-audio entries, new videos collection (4 clips), gallery caption field (AUD-05/VID-03)

**Wave 2** *(blocked on Wave 1 completion; these two run in parallel — no shared files)*

- [x] 02-02-PLAN.md — Audio island: real <audio> player, now-playing bar controls, auto-advance + fade, buffering state; delete demo player (AUD-01/02/03/04/05)
- [x] 02-03-PLAN.md — Gallery lightbox: PhotoSwipe 5 over the existing grid, dark/pink theming, optional captions (GAL-01/02/03)

**Wave 3** *(blocked on Wave 2 — shares index.astro with 02-02)*

- [x] 02-04-PLAN.md — Video section: poster + play, inline playsinline native video (no autoplay), CSS carousel/grid, Phase 3 share hooks (VID-01/02/03)

**UI hint**: yes

### Phase 3: Sharing & Booking

**Goal:** Visitors can share a short clip to their own social story/feed on mobile (or use link/platform fallbacks on desktop), and can submit a booking request that reliably reaches Соня via Telegram.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** SHARE-01, SHARE-02, SHARE-03, BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05
**Success Criteria** (what must be TRUE):

  1. On a mobile browser that supports `navigator.share`, tapping the share button opens the OS native share sheet with a short `.mp4` clip file attached; the user can post it to Instagram, VK, or Telegram from the share sheet
  2. On desktop (or Firefox), the share button reveals fallback options: a VK share link, a Telegram share link, and a copy-link button — no broken UI or uncaught JS errors
  3. Submitting the booking form with name, contact, format, and experience level delivers a formatted Russian-language message to Соня's Telegram chat within a few seconds and shows "Спасибо!" in the UI; the Telegram bot token does not appear in any client-side JavaScript bundle
  4. Submitting the form more than 5 times within 60 seconds from the same IP is rate-limited (HTTP 429); a network failure or API error shows a clear error state with a fallback Telegram link rather than silently dropping the submission
  5. The "записаться" / хоротерапия section links to the live Timepad event page

**Plans:** 2/2 plans complete
Plans:
**Wave 1** *(both plans run in parallel — no shared write files)*

- [x] 03-01-PLAN.md — Sharing slice: share button on clip card + enlarge modal, mobile Web Share file handoff, desktop VK/Telegram/copy popover (SHARE-01/02/03)
- [x] 03-02-PLAN.md — Booking slice: /api/book serverless endpoint (Telegram primary + gated email fallback), form name=/honeypot/error state, real submit handler, rate-limit (BOOK-01/02/03/04/05)

**UI hint**: yes

### Phase 03.1: Day/Night Theme (INSERTED)

**Goal:** The dark-only site gains a user-facing day (light) / night (dark) theme toggle. Remaining hardcoded colors are tokenized into the central `:root` design-token system, a light "day" palette is designed to fit the dream-pop brand, a toggle control is added, and the choice persists (localStorage) with a no-flash-before-paint init and a `prefers-color-scheme` default.
**Mode:** mvp
**Requirements**: D-04, D-05, D-06, D-07, D-01 (design-first; mapped from CONTEXT.md decisions + UI-SPEC build steps — no formal REQ IDs for this inserted phase)
**Depends on:** Phase 1, Phase 2
**Plans:** 4 plans

Plans:
- [ ] 03.1-01-PLAN.md — Theme machinery + full token contract: [data-theme=day] block, no-flash init, working top-right toggle, persistence (MVP thin slice)
- [ ] 03.1-02-PLAN.md — Tokenize static sections (Hero, Featured, Shows, Sing, Marquee, Tracks, About, Footer) — no dark islands
- [ ] 03.1-03-PLAN.md — Tokenize interactive surfaces (AudioPlayer bar, Lessons modal, Video card/modal, Gallery + PhotoSwipe) — no dark islands
- [ ] 03.1-04-PLAN.md — Design-first picks (checkpoint): user chooses day palette direction (Clean White vs Warm Cream) + toggle icon (sun/moon vs lingonberry); commit + clean up

### Phase 4: Test Deploy & Verification

**Goal:** v1 is deployed to Vercel as a **private (noindex) test build** and shared with the band for review. Every pitfall documented in research is confirmed resolved on the deployed test URL. v1 does NOT go public — actually launching (flipping noindex to public + the launch playbook) is deferred to a future Launch milestone.
**Mode:** mvp
**Depends on:** Phase 2, Phase 3
**Requirements:** (cross-cutting verification — no new requirements; confirms FND-02, FND-07, AUD-05, SHARE-02, SHARE-03, BOOK-02, LINK-01, LINK-02 work on the test deploy)
**Success Criteria** (what must be TRUE):

  1. The shared Vercel test deploy is confirmed **private/noindex**: the `robots` meta tag is present (`noindex`) and `robots.txt` disallows crawling, so the site will not be indexed by search engines while the band reviews it. (The site stays private throughout v1; going public is out of scope.)
  2. A Network tab audit of the deployed test URL shows zero requests to `fonts.googleapis.com` or `fonts.gstatic.com` at any point during page load (self-hosted fonts work — critical because Google Fonts is unreliable/blocked for Russian ISPs)
  3. Audio seek on a real iPhone (Safari): scrubbing to the middle of a track plays from that position without restarting; Network tab confirms `Content-Range` in response headers
  4. Every outbound link is audited and its status recorded: links with real destinations open correctly; any remaining `#` placeholder (e.g. streaming/ticket URLs still pending from the band) is documented in a single checklist so nothing is silently broken. (Zero-placeholders is a Launch-milestone gate, not a v1 test gate.)
  5. A live booking form submission delivers a correctly formatted message to Соня's Telegram chat; the band confirms receipt

**Deferred to a future Launch milestone (NOT v1):** flipping `NOINDEX` to `false` to go public, writing the band-facing launch procedure, and the zero-placeholder-links gate. These are launch actions, not test-deploy verification.

**Plans:** 2 plans
Plans:
**Wave 1**

- [ ] 04-01-PLAN.md — robots.txt gap fix (D-01) + all automated curl/code verification (SC1 meta, SC2 fonts, SC3 server-side range, SC4 link audit, SC5 endpoint reachability + token-absence) + band-shareable findings doc with placeholder-link tracker and Russian human-check instructions

**Wave 2** *(blocked on Wave 1 — needs the live robots.txt + the verification doc to update)*

- [ ] 04-02-PLAN.md — Two locked human checks: iPhone Safari audio-seek (SC3 device half) + live booking → band confirms Telegram receipt (SC5); record outcomes in the doc

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Static Site | 4/4 | Complete   | 2026-06-24 |
| 2. Media Islands | 4/4 | Complete   | 2026-06-24 |
| 3. Sharing & Booking | 2/2 | Complete   | 2026-06-25 |
| 3.1 Day/Night Theme (inserted) | 0/? | Not planned | - |
| 4. Test Deploy & Verification | 0/2 | Planned | - |

---

## Requirement Coverage

| Phase | Requirements |
|-------|-------------|
| 1 | FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, SHOW-01, SHOW-02, LINK-01, LINK-02 |
| 2 | AUD-01, AUD-02, AUD-03, AUD-04, AUD-05, VID-01, VID-02, VID-03, GAL-01, GAL-02, GAL-03 |
| 3 | SHARE-01, SHARE-02, SHARE-03, BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05 |
| 4 | (verification — no new requirements) |

**Total mapped:** 28/28 v1 requirements

---
*Roadmap created: 2026-06-24*
