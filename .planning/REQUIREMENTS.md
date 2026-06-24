# Requirements: внимание брусника! — Band Website

**Defined:** 2026-06-24
**Core Value:** A visitor can experience the band's music and world (listen, watch, look) and take a real action — book a lesson — all on one fast, beautiful page.

## v1 Requirements

Requirements for the initial private (noindex) release. v1 = the complete final site, minus CMS/admin. Each maps to roadmap phases.

### Site Foundation

- [x] **FND-01**: Site is rebuilt in Astro with the existing draft's visual design preserved (dark theme, pink #f3a9bd accent, Prata + Golos Text, all sections and layout)
- [x] **FND-02**: Fonts (Prata, Golos Text) are self-hosted — no Google Fonts dependency (throttled in Russia)
- [ ] **FND-03**: Scroll-reveal animations and cursor-follow glow from the draft are preserved
- [ ] **FND-04**: Layout is responsive and matches the draft's behavior across mobile and desktop
- [ ] **FND-05**: Content (tracks, shows, gallery) is modeled as Astro Content Collections backed by local data, so a v2 CMS can be swapped in without touching components
- [x] **FND-06**: Site is deployed to Vercel
- [x] **FND-07**: Search indexing is disabled via an env-gated noindex (robots meta + X-Robots-Tag), toggleable to public at launch without code changes

### Audio

- [ ] **AUD-01**: Visitor can play a track on-site by clicking it in the track list
- [ ] **AUD-02**: A sticky now-playing bar shows the active track (title, number, animated EQ) and persists while scrolling
- [ ] **AUD-03**: Visitor can pause/resume the active track; clicking a different track switches playback (only one plays at a time)
- [ ] **AUD-04**: Visitor can dismiss the now-playing bar to stop playback
- [ ] **AUD-05**: Audio files are served from CDN (Vercel Blob), never from the repo or a serverless function, and support seeking on iOS

### Video

- [ ] **VID-01**: Visitor can play concert/live video on-site via a poster image + play button
- [ ] **VID-02**: Video plays inline on iOS (playsinline), with controls and no forced autoplay
- [ ] **VID-03**: Video file is served from CDN (Vercel Blob)

### Gallery

- [ ] **GAL-01**: Visitor can click a gallery photo to open it fullscreen in a lightbox
- [ ] **GAL-02**: Visitor can navigate between photos (arrow buttons, keyboard, mobile swipe) with a position indicator
- [ ] **GAL-03**: Visitor can close the lightbox (× button, click outside, Escape)

### Shows

- [ ] **SHOW-01**: Upcoming shows are listed with date, city, and venue
- [ ] **SHOW-02**: Each show links to a working ticket page (Timepad / Kassir)

### Sharing

- [ ] **SHARE-01**: Designated short shareable video clips (~15–30s `.mp4`) are self-hosted as the shareable units (distinct from the full concert video)
- [ ] **SHARE-02**: On mobile, a visitor can share a short clip to their own Story/feed — the clip file is handed to the native share sheet (Web Share API with `files` + `canShare` guard) and the user posts it in Instagram/VK/Telegram
- [ ] **SHARE-03**: A visitor can also share the page link; on desktop (where file-to-Story isn't possible) sharing falls back to VK, Telegram, and copy-link options (no Instagram share)

### Booking

- [ ] **BOOK-01**: Visitor can submit the «записаться» form with format, name, contact, and experience level
- [ ] **BOOK-02**: Submissions are delivered to Соня via a Telegram bot through a Vercel serverless endpoint
- [ ] **BOOK-03**: Form shows a success state ("Спасибо!") and a clear error/fallback state on failure
- [ ] **BOOK-04**: Telegram bot token stays server-side only (no PUBLIC_ prefix) and the endpoint is rate-limited with a honeypot
- [ ] **BOOK-05**: Хоротерапия group sessions link to the live Timepad event

### Links

- [ ] **LINK-01**: Streaming links wired to real URLs (Yandex Music, VK Music, Spotify, Apple Music, YouTube), with Yandex/VK ordered first
- [ ] **LINK-02**: Footer social and contact links wired to real URLs (Telegram, VK, Instagram footer-only, email)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Content Management

- **CMS-01**: Admin can add/edit/remove tracks, shows, and photos without code
- **CMS-02**: CMS approach chosen (WordPress / hybrid / headless) once v1 content patterns are known

### Enhancements

- **ENH-01**: Progress/scrub bar in the now-playing bar (seek within a track)
- **ENH-02**: Email newsletter / mailing list capture
- **ENH-03**: Merch store
- **ENH-04**: English-language support

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Auto-posting directly into Instagram/VK Stories | Technically impossible from a website; sharing is a one-tap handoff via the OS share sheet |
| CMS / admin panel | Deferred to v2 — ship the experience first, decide CMS once content patterns are clear |
| Public search-engine indexing | Deliberately noindex until the band approves launch |
| User accounts / login | No validated need for a one-page band site |
| Comments / fan wall | Moderation/spam burden; the Telegram channel serves this |
| YouTube/VK Video embeds for the video section | Breaks the dark dream-pop aesthetic; self-hosted `<video>` instead |
| Multi-page site | One-page is the brief |
| Merch / e-commerce | Out of scope for v1 |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Complete |
| FND-02 | Phase 1 | Complete |
| FND-03 | Phase 1 | Pending |
| FND-04 | Phase 1 | Pending |
| FND-05 | Phase 1 | Pending |
| FND-06 | Phase 1 | Complete |
| FND-07 | Phase 1 | Complete |
| SHOW-01 | Phase 1 | Pending |
| SHOW-02 | Phase 1 | Pending |
| LINK-01 | Phase 1 | Pending |
| LINK-02 | Phase 1 | Pending |
| AUD-01 | Phase 2 | Pending |
| AUD-02 | Phase 2 | Pending |
| AUD-03 | Phase 2 | Pending |
| AUD-04 | Phase 2 | Pending |
| AUD-05 | Phase 2 | Pending |
| VID-01 | Phase 2 | Pending |
| VID-02 | Phase 2 | Pending |
| VID-03 | Phase 2 | Pending |
| GAL-01 | Phase 2 | Pending |
| GAL-02 | Phase 2 | Pending |
| GAL-03 | Phase 2 | Pending |
| SHARE-01 | Phase 3 | Pending |
| SHARE-02 | Phase 3 | Pending |
| SHARE-03 | Phase 3 | Pending |
| BOOK-01 | Phase 3 | Pending |
| BOOK-02 | Phase 3 | Pending |
| BOOK-03 | Phase 3 | Pending |
| BOOK-04 | Phase 3 | Pending |
| BOOK-05 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-06-24*
*Last updated: 2026-06-24 after roadmap creation — traceability table populated*
