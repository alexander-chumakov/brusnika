---
phase: 02-media-islands
plan: 01
subsystem: media
tags: [vercel-blob, cdn, astro-content, zod, json]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Astro project scaffolding, content.config.ts tracks/shows/gallery collections, src/content/tracks/01-doorudi.json shape
provides:
  - 9 audio + 9 video + 4 poster files on Vercel Blob CDN (store: pacvdizqnhsygnis)
  - 6 curated track JSONs with real Vercel Blob audioUrls (AUD-05 satisfied)
  - 4 curated video clip JSONs with real Vercel Blob videoUrl + posterUrl (VID-03 satisfied)
  - videos content collection defined in content.config.ts
  - gallery caption field added to content.config.ts schema (D-18 satisfied)
  - MEDIA-URLS.md: complete 22-URL CDN mapping for Wave-2 islands
affects:
  - 02-02 (audio player island — reads track audioUrl)
  - 02-03 (video player island — reads videoUrl + posterUrl)
  - 02-04 (gallery island — may use caption field)

# Tech tracking
tech-stack:
  added: [vercel-blob (CDN), scripts/upload-media.sh (bash upload automation)]
  patterns:
    - Content JSON shape: { number, title, subtitle?, displayDuration?, audioUrl } for tracks
    - Content JSON shape: { title, videoUrl, posterUrl, order } for videos
    - All media URLs use pacvdizqnhsygnis.public.blob.vercel-storage.com prefix
    - Upload script uses `npx vercel@latest blob put` with --access public --allow-overwrite

key-files:
  created:
    - src/content/tracks/02-kazhetsya.json
    - src/content/tracks/03-klub.json
    - src/content/tracks/04-zanaves.json
    - src/content/tracks/05-igrok.json
    - src/content/tracks/06-beznakazannym.json
    - src/content/videos/01-doorudi.json
    - src/content/videos/02-kazhetsya.json
    - src/content/videos/03-klub.json
    - src/content/videos/04-zanaves.json
    - scripts/upload-media.sh
    - .planning/phases/02-media-islands/MEDIA-URLS.md
  modified:
    - src/content/tracks/01-doorudi.json (added audioUrl)
    - src/content.config.ts (videos collection + gallery caption field — committed in 254c343)

key-decisions:
  - "CDN store: Vercel Blob Hobby tier, store prefix pacvdizqnhsygnis — all 22 media URLs confirmed live"
  - "Curated 6-track set: Доодури, Кажется, Клуб Неоправданных Надежд, Занавес, Игрок, Безнаказанным (user overrode plan defaults; replaced Ива+Завтра with Занавес+Кажется+Безнаказанным)"
  - "Curated 4-clip video set: Доодури, Кажется, Клуб Неоправданных Надежд, Занавес (user added Занавес.MP4, making 9 videos total vs. plan's 8)"
  - "All 9 audio + 9 video files uploaded to CDN per D-03 (full archive), even though only 6/4 displayed"
  - "iOS seek precondition AUD-05 verified: HTTP/2 206 + accept-ranges: bytes + content-range on doorudi.mp3 Range request"

patterns-established:
  - "Content JSON: keep audioUrl as a required real CDN string for all displayed tracks — never '#' or empty"
  - "Video entries carry both videoUrl + posterUrl; poster JPEGs extracted via ffmpeg -ss 00:00:03 -vframes 1"
  - "MEDIA-URLS.md is the single source of truth for all CDN URL→file mappings across the project"

requirements-completed: [AUD-05, VID-03]

# Metrics
duration: 45min
completed: 2026-06-24
---

# Phase 02 Plan 01: Media CDN Upload + Content Reconciliation Summary

**All 9 audio + 9 video + 4 poster files on Vercel Blob CDN (store pacvdizqnhsygnis); 6-track and 4-clip curated content JSON sets wired with real CDN URLs; astro check 0 errors**

## Performance

- **Duration:** ~45 min (Tasks 1-2 were human-gated checkpoint steps; Task 3 automated)
- **Started:** 2026-06-24 (Task 1 decision)
- **Completed:** 2026-06-24T22:10:05Z
- **Tasks:** 3 (1 decision checkpoint, 1 human-action checkpoint, 1 auto)
- **Files modified:** 16

## Accomplishments

- All 22 CDN uploads complete: 9 audio (audio/*.mp3), 9 video (video/*.mp4), 4 poster JPEGs (posters/*-poster.jpg) — store prefix pacvdizqnhsygnis
- 6 curated track JSONs committed with real Vercel Blob audioUrls; 4 stale placeholder entries deleted
- 4 video clip JSONs created (src/content/videos/) with CDN videoUrl + posterUrl; videos collection defined in content.config.ts
- iOS seek precondition confirmed: doorudi.mp3 returns HTTP/2 206 + accept-ranges: bytes + content-range on Range request (AUD-05 network layer)
- MEDIA-URLS.md committed as the 22-URL source-of-truth mapping for Wave-2 island consumers

## Task Commits

1. **Task 1: Curated selection decision** - checkpoint (no commit — human decision)
2. **Task 2: Upload media to Vercel Blob** - checkpoint (no commit — human CLI action)
3. **Pre-Task 3: content.config.ts videos collection + gallery caption** - `254c343` (feat)
4. **Pre-Task 3: upload script + MEDIA-URLS.md** - `908578e` (feat)
5. **Task 3: Reconcile tracks + create video JSONs** - `7747f64` (feat)

**Plan metadata:** (this commit, docs)

## Files Created/Modified

- `src/content/tracks/01-doorudi.json` — added audioUrl (CDN)
- `src/content/tracks/02-kazhetsya.json` — new, Кажется with CDN audioUrl
- `src/content/tracks/03-klub.json` — new, Клуб Неоправданных Надежд with CDN audioUrl
- `src/content/tracks/04-zanaves.json` — new, Занавес with CDN audioUrl
- `src/content/tracks/05-igrok.json` — new, Игрок with CDN audioUrl
- `src/content/tracks/06-beznakazannym.json` — new, Безнаказанным with CDN audioUrl
- `src/content/videos/01-doorudi.json` — video clip, videoUrl + posterUrl
- `src/content/videos/02-kazhetsya.json` — video clip, videoUrl + posterUrl
- `src/content/videos/03-klub.json` — video clip, videoUrl + posterUrl
- `src/content/videos/04-zanaves.json` — video clip, videoUrl + posterUrl
- `src/content.config.ts` — videos collection added, gallery caption field added (254c343)
- `scripts/upload-media.sh` — batch upload script for all 9+9+4 files (908578e)
- `.planning/phases/02-media-islands/MEDIA-URLS.md` — 22-URL CDN mapping (908578e)

## Decisions Made

- User overrode plan default track selection (Ива → Занавес, Завтра была зима → Кажется+Безнаказанным); final set: Доодури, Кажется, Клуб Неоправданных Надежд, Занавес, Игрок, Безнаказанным
- User added Занавес.MP4 to video clips (plan specified 4 clips from 8 videos; user confirmed 9th video making final video count 9 not 8); video clip set: Доодури, Кажется, Клуб, Занавес
- Vercel Blob Hobby tier used (not Bunny CDN) — valid for v1 traffic; Bunny remains documented fallback per D-01/D-02

## Deviations from Plan

### Content Selection Override (user-directed, not an auto-fix)

The plan's default curated selection was Доодури, Клуб, Кажется, Ива, Завтра была зима, Игрок (tracks) and Доодури, Кажется, Клуб, Ива (clips). The user confirmed a different curated set at Task 1 decision:

- **Tracks:** Занавес and Безнаказанным replace Ива and Завтра была зима; order is Доодури → Кажется → Клуб → Занавес → Игрок → Безнаказанным
- **Clips:** Занавес replaces Ива; the 9th video file (Занавес.MP4) was available (plan assumed 8 videos; MEDIA-URLS.md shows 9 uploaded)
- **Impact:** All content data matches user intent. astro check passes. No correctness impact — all referenced files are confirmed live on CDN.

---

**Total deviations:** 1 (user-directed content selection override at checkpoint — not an auto-fix)
**Impact on plan:** Selection is cosmetic/editorial only; correctness and CDN infrastructure unaffected.

## Issues Encountered

None — upload script, CDN store, and Astro schema changes worked as designed. astro check: 0 errors, 0 warnings.

## Known Stubs

None — every displayed track has a real CDN audioUrl; every video clip has a real CDN videoUrl and posterUrl. No placeholder values remain in content data files.

## Threat Flags

No new security surface introduced beyond the planned CDN URLs (public-by-design, unguessable store prefix, noindex pre-launch per T-02-01). BLOB_READ_WRITE_TOKEN never entered repo — used at upload time only per T-02-02 mitigation.

## Next Phase Readiness

- Wave-2 audio island (02-02) can now read `audioUrl` from `getCollection('tracks')` — all 6 entries have real CDN URLs
- Wave-2 video island (02-03) can now read `videoUrl` + `posterUrl` from `getCollection('videos')` — all 4 entries wired
- MEDIA-URLS.md documents all 22 CDN URLs for island consumption or debugging
- Blocker cleared: no island can reference a real URL until this plan completes — that condition is now satisfied

---
*Phase: 02-media-islands*
*Completed: 2026-06-24*
