# Phase 2: Media Islands - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-24
**Phase:** 2-media-islands
**Areas discussed:** Media hosting (CDN), Track list & audio files, Video clip section, Audio player behavior, Now-playing bar controls, Track loading indicator, Lightbox captions

---

## Media Hosting (CDN)

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel Blob (recommended) | One account, same Vercel; range/206 for iOS; matches requirement; slightly pricier at scale | ✓ |
| Bunny.net | Cheaper at volume (research rec) but separate account, billing, storage+CDN setup | |

**User's choice:** Free option needed; pointed Claude to inspect `music/`, `video/`, image folder sizes to decide.
**Notes:** Total media ~87 MB → fits Vercel Blob free (Hobby) tier. Locked Vercel Blob free tier (D-01), resolving the REQUIREMENTS-vs-CLAUDE.md conflict. Fallback to Cloudflare R2 / Bunny if traffic outgrows free tier post-launch (D-02).

---

## Track List & Audio Files

| Option | Description | Selected |
|--------|-------------|----------|
| All 9 from music/ (recommended) | Replace list with the 9 songs that have files; every track plays | |
| Curated subset | Pick a strong subset and order; hide the rest | partial |
| Keep current 5 | 3 of them have no audio — would need band files | |

**User's choice:** "Не думаю, что нужно отображать все, но загрузить можно все 9, возможно как функция популярные в spotify. нужно подумать, что лучше для пользовательского интерфейса."
**Notes:** Upload all 9 to CDN (D-03); display a curated ~6 ("популярное"-style) (D-04). Follow-up — who chooses songs: user picked **"Предложи ты, я утвержу"** → Claude proposes selection/order/framing at the UI-design step, user approves (D-05). Track-list reconciliation required: current 5 entries don't all have files (D-06).

---

## Video Clip Section

| Option | Description | Selected |
|--------|-------------|----------|
| One main video (recommended) | Single poster + inline play; elegant, simple | |
| Several (2-3) | Small row/grid | |
| Decide at UI step | Defer format/placement to UI design | ✓ (reframed) |

**User's choice (format):** "это должен быть раздел на котором пользователю должно было бы удобно увидеть видео и расшарить его, может должна быть карусель, нужно думать как лучше по юзер интерфейсу."
**User's choice (placement):** "Это не блок вживую, это же отрывки из клипов для того чтобы люди делились ими в сторис и популяризировали группу."
**Notes:** Reframed as a shareable clip-excerpt section (D-13), carousel-leaning, format/placement delegated to UI step (D-14). Sharing mechanics belong to Phase 3 (SHARE-01/02/03); Phase 2 builds the viewing surface share-ready (D-16). Files in `video/` look longer than the 15–30s share clips — flagged for Phase 3.

---

## Audio Player Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-advance to next (recommended) | Plays next when one ends; stop after last | ✓ |
| Stop | Stops after each track | |

| Option | Description | Selected |
|--------|-------------|----------|
| Pause/resume (recommended) | Click playing track = pause; click again = resume from position | ✓ |
| Restart | Click playing track restarts from zero | |

**User's choice:** Auto-advance + pause/resume.
**Notes:** Mid-discussion refinement (free text): "сделай паузу между треками, чтобы не прямо сразу началась играть новая песня... должно быть как-то приятно для ушей" → short ~1.5–2s gap + gentle fade between auto-advanced tracks (D-08).

---

## Now-Playing Bar Controls

| Option | Description | Selected |
|--------|-------------|----------|
| Pause/play + "next" (recommended) | Pause/play and → next directly in the bar | ✓ |
| Pause/play only | Single toggle + close | |
| Pause/play + prev/next | Full transport controls | |

**User's choice:** Pause/play + "next".
**Notes:** Adds to today's close-only bar; gives a playlist feel without scrolling to the list (D-10). Prev not required.

---

## Track Loading Indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, unobtrusive (recommended) | "загружается…" / pulsing EQ during CDN buffering | ✓ |
| No | Just plays when ready | |

**User's choice:** Yes, unobtrusive.
**Notes:** Especially for mobile networks so a tap doesn't look broken (D-11).

---

## Lightbox Captions

| Option | Description | Selected |
|--------|-------------|----------|
| Counter only (recommended) | "3 / 12" + arrows, no captions; clean | partial |
| Counter + caption | Short description under each photo | partial |

**User's choice:** "счетчик и иногда может быть подпись, например чтобы указать фотографа, либо какую-то информацию о том где была сделана эта фотография."
**Notes:** Counter always; optional per-photo caption (photographer / location) shown only when present. Add optional `caption` field to gallery schema (D-18).

---

## Claude's Discretion

- Lightbox library (PhotoSwipe 5 recommended; GLightbox acceptable).
- Video poster image sourcing (extracted frame vs. existing image).
- Track duration sourcing (computed vs. band-supplied; schema fields already exist).
- Island file/component breakdown, `client:` directives, fade/gap timing tuning, CDN upload mechanics.
- Curated track selection/order + section framing — Claude proposes at UI step, user approves.

## Deferred Ideas

- Scrub/progress bar in the now-playing bar — v2 (ENH-01).
- Share button / native share / story posting on clips — Phase 3 (SHARE-01/02/03).
- Short 15–30s share-clip versions — Phase 3 content task.
- Cost migration to Cloudflare R2 / Bunny.net — only if traffic outgrows Vercel Blob free tier.
