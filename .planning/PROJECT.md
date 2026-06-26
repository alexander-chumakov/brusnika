# внимание брусника! — Band Website

## What This Is

A polished, fast, media-rich one-page website for **внимание брусника!**, a Russian-language chamber dream-pop project. It introduces the band, lets visitors actually listen to the music and watch live video on-site, browse concert photos, see upcoming shows, share short clips to their own social stories, and book vocal lessons / хоротерапия with vocalist Соня. The audience is Russian-speaking fans and prospective vocal-lesson students.

A first visual draft was created in Claude Design (a single static `index.html` with inline styles/JS, currently in this repo). v1 turns that mockup into a real, functioning, deployable site — same look, but everything *works*.

## Core Value

A visitor can experience the band's music and world (listen, watch, look) and take a real action — book a lesson — all on one fast, beautiful page. If everything else fails, the music must play and the booking must reach Соня.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — the draft is an unshipped mockup. Ship to validate.)

### Active

<!-- Current scope. Building toward these. v1 = the full final site MINUS CMS/admin. -->

- [ ] Rebuild the existing draft as an Astro site with identical visual design (hero, marquee, featured album, about, shows, gallery, "пойте с нами", footer)
- [ ] Working on-site **audio player** for the band's tracks (self-hosted media)
- [ ] Working **video player** for live/concert video (self-hosted media)
- [ ] **Concert photo viewing** — gallery with fullscreen/lightbox viewing
- [ ] **Social sharing** — visitors can share short clips/content to their own stories/feeds (Instagram, VK, Telegram) via the mobile native share sheet, with desktop share-link fallbacks
- [ ] **Booking form** for vocal lessons / хоротерапия that actually delivers submissions to Соня via a **Telegram bot**
- [ ] Real outbound links wired up (Spotify, Yandex Music, Apple Music, YouTube, Telegram, VK, ticket links) — replacing `#` placeholders
- [ ] Concerts/shows section with real dates and ticket links
- [ ] Responsive and fast across mobile and desktop
- [ ] Deployed to **Vercel** with **indexing disabled (noindex)** for private pre-launch testing

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Admin panel — deferred to v2 (content is hardcoded in components for v1)
- CMS — deferred to v2; the WordPress vs. hybrid vs. headless decision is intentionally left open until v1 ships
- Auto-posting directly into Instagram/VK Stories without user action — not possible from a website; sharing is a one-tap handoff via the native share sheet
- Public search-engine indexing — deliberately off until the band approves launch
- User accounts / login — not needed for a band site
- E-commerce / merch store — not in this scope

## Context

- **Starting point:** a single `index.html` (~470 lines) with inline CSS/JS and an `images/` folder, generated in Claude Design. It's visually complete but functionally a demo: the "слушать" buttons show a fake now-playing bar (no real audio), the booking form just shows "Спасибо!" without sending anywhere, and several links (Apple Music, VK, Instagram, some ticket links) are `#` placeholders.
- **Language/audience:** Russian-language, Russian-speaking audience. VK and Telegram are first-class platforms alongside Instagram.
- **Design system already established:** dark theme (#000 bg), pink accent (#f3a9bd), fonts Prata (serif headings) + Golos Text (body), film-grain/dream-pop aesthetic, scroll-reveal animations, cursor-follow glow.
- **Media:** the band has most real assets ready (audio, concert video, photos) to drop in.
- **Two-version plan:** v1 = the complete final site minus CMS/admin. v2 = add content management (WordPress, hybrid, or headless — TBD).

## Constraints

- **Tech stack**: Astro (static-first with islands) — chosen for speed on a media-heavy site and a clean path to a v2 CMS. Avoids shipping a full React runtime when most of the page is static.
- **Hosting**: Vercel — serverless functions used only where needed (the Telegram booking endpoint).
- **Media hosting**: self-hosted media (band's choice). Large audio/video must not be served as raw repo files; needs a proper storage/delivery approach (e.g. Vercel Blob or a media host like Bunny/Cloudinary) — to be settled in research.
- **Privacy**: deploy must be noindex (robots noindex + likely disallow) until launch approval.
- **Social sharing**: limited by platform reality — no website can auto-post to a user's Story; implementation is the mobile Web Share API + platform share links.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build v1 in Astro (not Next.js or static HTML) | Media-heavy mostly-static site; ships minimal JS, islands for interactive bits, clean v2 CMS path | ✅ Validated — v1 built & deployed in Astro (Phase 4 test deploy) |
| Self-host audio + video | Band preference; full control over media | ✅ Validated — media on Vercel Blob/CDN; range/seek confirmed (Phase 4, SC3 server) |
| Booking form delivers via Telegram bot | Fits the Russian audience; instant, no inbox to monitor | ✅ Validated — live submission reached band's Telegram (Phase 4, SC5) |
| Social sharing via Web Share API + share links | Only realistic web mechanism for sharing to stories/feeds | ✅ Validated — share buttons + TG/VK fallbacks present on deploy (Phase 4, SHARE) |
| Deploy noindex for pre-launch testing | Test privately before public launch | ✅ Validated — noindex meta + robots.txt disallow confirmed on live test deploy (Phase 4, SC1) |
| Self-host fonts (no Google Fonts) | Google Fonts unreliable/blocked for Russian ISPs | ✅ Validated — zero Google Fonts requests; fonts served from /_astro (Phase 4, SC2) |
| Defer CMS/admin to v2 | Ship the experience first; decide CMS once content patterns are known | — Pending (v2) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-26 — Phase 4 (Test Deploy & Verification) complete; v1 milestone verified (5/5 success criteria) as a private noindex test build. Public launch deferred to a future Launch milestone.*
