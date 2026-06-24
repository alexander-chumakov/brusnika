# Roadmap: внимание брусника! — Band Website

**Created:** 2026-06-24
**Granularity:** Coarse
**Mode:** MVP (vertical slices)
**Coverage:** 28/28 v1 requirements mapped

---

## Phases

- [x] **Phase 1: Foundation & Static Site** — Astro scaffold, self-hosted fonts, all static sections, shows data, real links, noindex gate, deployed to Vercel (completed 2026-06-24)
- [ ] **Phase 2: Media Islands** — Working audio player (CDN-backed), video player, photo lightbox gallery
- [ ] **Phase 3: Sharing & Booking** — Social share button with mobile/desktop paths; booking form wired to Соня's Telegram bot
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

**Plans:** 3/4 plans executed
Plans:
**Wave 1**

- [x] 02-01-PLAN.md — CDN media upload to Vercel Blob + data layer: reconcile tracks to 6 real-audio entries, new videos collection (4 clips), gallery caption field (AUD-05/VID-03)

**Wave 2** *(blocked on Wave 1 completion; these two run in parallel — no shared files)*

- [x] 02-02-PLAN.md — Audio island: real <audio> player, now-playing bar controls, auto-advance + fade, buffering state; delete demo player (AUD-01/02/03/04/05)
- [x] 02-03-PLAN.md — Gallery lightbox: PhotoSwipe 5 over the existing grid, dark/pink theming, optional captions (GAL-01/02/03)

**Wave 3** *(blocked on Wave 2 — shares index.astro with 02-02)*

- [ ] 02-04-PLAN.md — Video section: poster + play, inline playsinline native video (no autoplay), CSS carousel/grid, Phase 3 share hooks (VID-01/02/03)

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

**Plans:** TBD
**UI hint**: yes

### Phase 4: Pre-Launch Verification

**Goal:** Every pitfall documented in research is confirmed resolved; the site is ready for Соня to approve and go public; the launch-time noindex toggle is documented so it cannot be forgotten.
**Mode:** mvp
**Depends on:** Phase 2, Phase 3
**Requirements:** (cross-cutting verification — no new requirements; confirms FND-02, FND-07, AUD-05, SHARE-02, SHARE-03, BOOK-02, LINK-01, LINK-02 are correct in production)
**Success Criteria** (what must be TRUE):

  1. Toggling the `NOINDEX` env var to `false` and redeploying causes the robots meta tag to disappear from page source and `robots.txt` to allow crawling; the launch procedure is written down in one place so the band cannot miss it
  2. A Network tab audit of the deployed production URL shows zero requests to `fonts.googleapis.com` or `fonts.gstatic.com` at any point during page load
  3. Audio seek on a real iPhone (Safari): scrubbing to the middle of a track plays from that position without restarting; Network tab confirms `Content-Range` in response headers
  4. All outbound links across the entire page — streaming platforms, ticket pages, footer social, contact — open to real destination pages; zero `#` placeholder `href` values remain
  5. A live booking form submission delivers a correctly formatted message to Соня's Telegram chat; the band confirms receipt

**Plans:** TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Static Site | 4/4 | Complete   | 2026-06-24 |
| 2. Media Islands | 3/4 | In Progress|  |
| 3. Sharing & Booking | 0/? | Not started | - |
| 4. Pre-Launch Verification | 0/? | Not started | - |

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
