# Phase 2: Media Islands - Context

**Gathered:** 2026-06-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Turn the Phase-1 demo media surfaces into real, working interactive islands: (1) an on-site **audio player** with a sticky now-playing bar that plays real tracks from a CDN, (2) a **video section** of clip excerpts the visitor can comfortably watch inline, and (3) a **fullscreen photo lightbox** for the existing gallery. All media is served from a CDN with correct range-request support (iOS seeking works).

Covers requirements: AUD-01..05, VID-01..03, GAL-01..03.

**Out of scope (later phases):**
- The **share button / native share sheet / story posting** on video clips — that is Phase 3 (SHARE-01/02/03). Phase 2 only builds the clip-viewing section that Phase 3 will attach sharing to.
- Producing/supplying the short 15–30s share-clip versions (SHARE-01) — a Phase 3 content concern.
- A **scrub/progress bar inside the now-playing bar** (seek within a track) — explicitly deferred to v2 (ENH-01).
</domain>

<decisions>
## Implementation Decisions

### Media Hosting / CDN (AUD-05, VID-03)
- **D-01:** Use **Vercel Blob on the free (Hobby) tier**. Total media is ~87 MB (audio ~12 MB, video ~76 MB), which fits comfortably in the free storage/bandwidth allotment for a private noindex demo. This resolves the documented conflict — REQUIREMENTS.md (AUD-05/VID-03) locks "Vercel Blob," CLAUDE.md research recommended Bunny.net for cost — by staying on Vercel Blob (single account, no extra dashboard) at zero cost for v1 volumes. Vercel Blob serves `Accept-Ranges: bytes` / HTTP 206, satisfying the iOS-seek criterion. **Hard rule (from STATE.md architecture): never serve media from the repo or a serverless function.**
- **D-02:** **Fallback if post-launch traffic exceeds the free tier:** move to Cloudflare R2 (free egress) or Bunny.net. Not needed for v1; note it so the band isn't surprised by a future bill.

### Audio: Track List & Files (AUD-01)
- **D-03:** **Upload all 9 mp3 files** from `music/` to the CDN. (Current `music/` set: Безнаказанным, Доодури, Завтра была зима, Занавес, Ива, Игрок, Кажется акустика, Кажется, Клуб Неоправданных Надежд.)
- **D-04:** **Do NOT display all 9.** The on-site track list shows a **curated subset (~6 tracks)**, possibly framed as "популярное" (Spotify-style). Uploading all 9 lets the curated set change without re-deploying media.
- **D-05:** **Selection + section framing is delegated to Claude:** propose the curated ~6 songs, their order, and the display framing during the **UI-design step (`/gsd:ui-phase`)**; the user approves/edits. The exact final song picks are the user's content call but they asked Claude to propose first.
- **D-06:** **Track-list reconciliation required.** The current 5-entry tracks collection (Доодури, Весеннее танго, Клуб Неоправданных Надежд, Научи меня быть, Вспомни меня) does NOT match available audio — only Доодури and Клуб Неоправданных Надежд have files. Весеннее танго / Научи меня быть / Вспомни меня have no mp3 and must be removed/replaced. Every displayed track MUST have a real, playable file (success criterion #1).

### Audio: Player Behavior (AUD-02, AUD-03, AUD-04)
- **D-07:** **Auto-advance** to the next track when one finishes; **stop after the last track** (no loop).
- **D-08:** **Gap between auto-advanced tracks** — insert a short pause (~1.5–2 s) with a **gentle fade-out/fade-in** so songs don't collide; it should feel pleasant, not like a "каша." (User-requested refinement.) NOTE: this is a small fade/gap, NOT the v2 scrub bar.
- **D-09:** **Click the currently-playing track = pause/resume** (toggle from the same position), not restart-from-zero. Clicking a different track switches playback (only one plays at a time — per criteria).
- **D-10:** **Now-playing bar controls:** add **pause/play + "→ next"** buttons directly in the bar (today it only has the × close). Gives a playlist feel and lets the visitor control playback without scrolling back to the list. (Prev button NOT required.)
- **D-11:** **Loading indicator** — show an **unobtrusive buffering state** (e.g. "загружается…" or pulsing EQ bars) while a track loads from the CDN, especially for mobile networks, so a tap doesn't look broken.
- **D-12:** The **× dismiss button stops playback and hides the bar** (carried from criteria/Phase-1 demo behavior).

### Video: Clip Section (VID-01, VID-02, VID-03)
- **D-13:** This is a **section of clip excerpts meant to be shared** to popularize the band — NOT a "вживую/live" block. Reframe accordingly. The current `video/` files (8 clips, ~3–18 MB each, names mirror songs) are the source material.
- **D-14:** **Display format and on-page placement are delegated to the UI-design step.** User leaned toward a **carousel** ("удобно увидеть видео") but wants the best UX decided in `/gsd:ui-phase`. Likely "upload all to CDN, show a curated/carousel set" — same pattern as audio.
- **D-15:** **Playback behavior:** poster image + play button; clicking opens **inline playback** with browser controls; **`playsinline` on iOS** (no forced fullscreen); **no autoplay** on page load (per VID-02).
- **D-16:** **Build the section share-ready.** It is the exact UI surface Phase 3 (SHARE-01/02/03) will attach the share button to. Design hooks so Phase 3 is a clean add, not a rebuild.

### Gallery Lightbox (GAL-01, GAL-02, GAL-03)
- **D-17:** Fullscreen lightbox over the existing static `GallerySection` grid. Navigation: **arrow buttons, keyboard left/right, mobile swipe**; **image counter always shown** (e.g. "3 / 12"); close via **× button, click outside, and Escape** (per criteria).
- **D-18:** **Optional per-photo caption** — the counter is always present; show a short caption **only when a photo has one** (e.g. photographer credit or where the shot was taken). Requires adding an **optional `caption` field** to the gallery collection schema (`src/content.config.ts`). Default look stays clean/minimal (counter only) when no caption.

### Claude's Discretion
- **Lightbox library:** PhotoSwipe 5 recommended (CLAUDE.md research, dark/pink theming via CSS). GLightbox acceptable alternative — implementer decides.
- **Video poster images:** how posters are produced/sourced (extracted frame vs. existing image) — implementer/UI decides.
- **Track durations:** how `displayDuration` / `durationSeconds` are obtained (computed from files vs. band-supplied) — implementer decides; fields already exist in the schema.
- Exact island file/component breakdown, `client:` directives, fade/gap timing tuning, and CDN upload mechanics — planner/researcher decide following Astro conventions.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning docs
- `.planning/ROADMAP.md` § "Phase 2: Media Islands" — phase goal, the 4 success criteria (the TRUE conditions Phase 2 must satisfy), requirement list, UI hint.
- `.planning/REQUIREMENTS.md` § Audio / Video / Gallery — AUD-01..05, VID-01..03, GAL-01..03 exact wording and acceptance phrasing. NOTE: AUD-05/VID-03 say "Vercel Blob" — confirmed by D-01.
- `.planning/PROJECT.md` — product intent, established design system (dark #000, pink #f3a9bd, Prata + Golos Text), media-hosting constraint.
- `.planning/STATE.md` § "Accumulated Context" — locked architecture (Astro+hybrid on Vercel; **never serve media via serverless/repo**; Content Collections as v1→v2 seam).
- `.planning/phases/01-foundation-static-site/01-CONTEXT.md` — Phase-1 decisions; D-04/D-05/D-09 there define the isolated demo surfaces this phase replaces and the forward-compatible track schema.
- `CLAUDE.md` § Technology Stack — audio player guidance (custom vanilla JS + HTML5 `<audio>`), video guidance (native `<video>` / Plyr), PhotoSwipe 5, media-host comparison, what-NOT-to-use list, package versions.

### Code to read (rebuild/replace targets)
- `src/scripts/demo-player.js` + `src/components/TracksSection.astro` (lines ~66–107) — the **throwaway demo player + now-playing bar markup** the real audio island replaces. Delete the `<script is:inline>` demo block and `demo-player.js` when the island lands.
- `src/content.config.ts` — tracks/shows/gallery zod schemas; tracks already have optional `audioUrl`/`durationSeconds` (D-09 Phase 1). Gallery schema needs a new optional `caption` field (D-18).
- `src/components/GallerySection.astro` — static grid to attach the lightbox to; uses `import.meta.glob` eager image loading.
- `src/content/tracks/*.json` — current 5 track entries needing reconciliation (D-06).

No external ADRs/specs — requirements and decisions are fully captured in the docs above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/TracksSection.astro` — track list markup (`.track` buttons with `data-i`/`data-title`) and the full now-playing bar CSS (EQ bars, fixed bottom bar, pink accent) are reusable; the real island reuses the markup/styling and swaps the demo IIFE for real `<audio>` logic.
- Track schema (`audioUrl`, `durationSeconds`) — built in Phase 1 (D-09) specifically so Phase 2 is a data-fill, no schema migration for audio.
- `src/components/GallerySection.astro` — existing optimized image grid; lightbox layers on top.
- `music/` (9 mp3, ~12 MB) and `video/` (8 mp4, ~76 MB) — gitignored real media staged for CDN upload.

### Established Patterns
- Phase 1 isolated the demo behaviors deliberately (`demo-player.js` is a self-contained IIFE imported via `<script is:inline>`) — clean replacement seam for the audio island.
- Content Collections (`getCollection()`) are the data layer; components read from collections, not hardcoded lists — keep this for tracks/video/gallery.
- Design tokens in `src/styles/global.css` (palette + fonts); per-component scoped `<style>`. Match the dark/pink dream-pop aesthetic for all new media UI.

### Integration Points
- **Audio island** replaces the `demo-player.js` IIFE + `<script is:inline>` block in `TracksSection.astro`; reads `audioUrl` from the tracks collection (CDN URLs).
- **Video section** is a NEW component (none exists today); it becomes the host surface for Phase 3 sharing (D-16). Decide its data model (likely a new `video` collection or `site.ts` entry) during planning.
- **Lightbox** attaches to `GallerySection`'s existing grid items; new optional `caption` field flows from `content.config.ts` → gallery JSON → lightbox.
</code_context>

<specifics>
## Specific Ideas

- Auto-advance must feel **"приятно для ушей"** — short pause + gentle fade between tracks, deliberately avoiding an abrupt back-to-back start ("каша"). (D-08, user's words.)
- Track display possibly framed as **"популярное"** like Spotify (D-04) — to be proposed at UI step.
- Video framed as **shareable clip excerpts to popularize the band**, possibly a **carousel** (D-13/D-14, user's words) — not a live-performance block.
- Lightbox captions used sparingly for **photographer credit / location info** (D-18).
- Design must stay within the established dark/pink dream-pop look for every new media surface.
</specifics>

<deferred>
## Deferred Ideas

- **Scrub/progress bar inside the now-playing bar** (seek within a track) — v2 (ENH-01), already out of scope.
- **Share button / native share sheet / story posting on clips** — Phase 3 (SHARE-01/02/03). The Phase 2 video section is built to host it (D-16).
- **Short 15–30s share-clip versions** of videos — Phase 3 content task; current `video/` files appear longer than 30s, so dedicated short clips may be needed then (SHARE-01).
- **Cost migration to Cloudflare R2 / Bunny.net** — only if post-launch traffic outgrows the Vercel Blob free tier (D-02).

None of these are new in-phase scope — all map to already-roadmapped phases or v2.
</deferred>

---

*Phase: 2-media-islands*
*Context gathered: 2026-06-24*
