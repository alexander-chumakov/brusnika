# v1 Verification Report — внимание брусника!

**Site:** https://vnimanie-brusnika.vercel.app (private test deploy; noindex — никогда не индексировался, в v1 всегда остаётся закрытым)
**Checked:** 2026-06-26 (automated checks by Claude; human checks → Plan 02)

---

## Summary: 5 Success Criteria

| # | Criterion | Requirement | Status | Proof |
|---|-----------|-------------|--------|-------|
| SC1 | Site is private (noindex + robots.txt) | FND-07 | ✅ | Meta `name="robots" content="noindex, nofollow"` in live HTML; `/robots.txt` returns HTTP 200 with `User-agent: *` / `Disallow: /` |
| SC2 | Zero Google Fonts requests | FND-02 | ✅ | `fonts.googleapis.com` / `fonts.gstatic.com` count = 0 in live HTML; count = 0 in both linked CSS bundles (`/_astro/GallerySection.pe3E5Za-.css`, `/_astro/index.SY6LcFkL.css`); `@font-face` URLs all point to `/_astro/*.woff2` (self-hosted Prata + Golos Text) |
| SC3 (server) | CDN audio is seekable (Accept-Ranges + 206) | AUD-05 | ✅ | `accept-ranges: bytes` header present; `Range: bytes=1000-2000` returns HTTP `206` with `content-range: bytes 1000-2000/675840` |
| SC3 (device) | iOS Safari audio seek mid-track | AUD-05 | ⏳ | Needs real iPhone in Safari — instructions below |
| SC4 | All outbound links audited; `#` placeholders inventoried | LINK-01/02 | ✅ | 4 real links all 200; 9 `#` placeholders inventoried (see tracker below) |
| SC5 (server) | Booking endpoint reachable; no token in client bundle | BOOK-02 | ✅ | POST `/api/book` with honeypot field returns HTTP `200 {"ok":true}` (no Telegram delivery); `api.telegram.org` and bot token variable count = 0 in HTML and all 3 JS bundles |
| SC5 (receipt) | Booking form → Соня's Telegram delivers correctly | BOOK-02 | ⏳ | Needs real form submission + Соня to confirm receipt — instructions below |

---

## SC1 — Privacy (Detailed Proof)

```
GET https://vnimanie-brusnika.vercel.app/robots.txt  →  200 OK
Body:
  User-agent: *
  Disallow: /

Live HTML contains:
  <meta name="robots" content="noindex, nofollow">

X-Robots-Tag response header: not present
(Meta tag + robots.txt are the required controls; header is optional.)
```

---

## SC2 — Fonts (Detailed Proof)

```
HTML:    fonts.googleapis.com / fonts.gstatic.com occurrences = 0
CSS #1:  /_astro/GallerySection.pe3E5Za-.css       occurrences = 0
CSS #2:  /_astro/index.SY6LcFkL.css                occurrences = 0

Sample @font-face entries (self-hosted):
  src: url(/_astro/prata-cyrillic-400-normal.CW5LVkdR.woff2) format("woff2"), ...
  src: url(/_astro/golos-text-cyrillic-ext-400-normal.Bo67NYBq.woff2) format("woff2"), ...

All @font-face src URLs use /_astro/ prefix → served directly from Vercel CDN, no third-party font requests.
```

---

## SC3 (Server-side) — Audio Seek (Detailed Proof)

```
CDN URL: https://pacvdizqnhsygnis.public.blob.vercel-storage.com/audio/doorudi.mp3

HEAD response:
  accept-ranges: bytes

Ranged request (Range: bytes=1000-2000):
  HTTP/2 206
  content-range: bytes 1000-2000/675840
  content-type: audio/mpeg
```

Full-file size: 675,840 bytes (~660 KB). Range delivery confirmed. iOS Safari can seek without re-downloading from the start.

---

## SC4 — Link Audit (Detailed Proof)

### Real outbound links — HTTP status codes

| Label | URL | HTTP Status |
|-------|-----|-------------|
| Spotify | https://open.spotify.com/artist/11epkfgLUMWmXsTbgfPu4B | 200 |
| YouTube | https://www.youtube.com/@vnimaniebrusnika | 200 |
| Telegram | https://t.me/vnimaniebrusnika | 200 |
| Хоротерапия (Timepad) | https://sonya-brusnika.timepad.ru/event/4010316/ | 200 |
| Email | mailto:hello@brusnika.ru | — (mailto; not HTTP-checkable) |

All real links are live and return 200.

---

## Placeholder-link tracker

**D-05: Inventory only — do NOT fix in v1.** These are real URLs pending from the band. Filling them to zero is a **Launch-milestone gate, not a v1 test gate.**

| # | Label | Where it lives | Real URL needed from |
|---|-------|----------------|---------------------|
| 1 | Яндекс Музыка | `src/data/site.ts` → `streamingLinks[0]` | Группа (artist page URL) |
| 2 | VK Музыка | `src/data/site.ts` → `streamingLinks[1]` | Группа (artist page URL) |
| 3 | Apple Music | `src/data/site.ts` → `streamingLinks[3]` | Группа (artist page URL) |
| 4 | VK сообщество | `src/data/site.ts` → `socialLinks[1]` | Группа (community URL) |
| 5 | Instagram | `src/data/site.ts` → `socialLinks[2]` | Группа (profile URL) |
| 6 | Билеты — Москва | `src/content/shows/01-moskva.json` (ticketUrl missing) | Промоутер / Соня |
| 7 | Билеты — Санкт-Петербург | `src/content/shows/02-spb.json` (ticketUrl missing) | Промоутер / Соня |
| 8 | Билеты — Казань | `src/content/shows/03-kazan.json` (ticketUrl missing) | Промоутер / Соня |
| 9 | Билеты — Екатеринбург | `src/content/shows/04-ekaterinburg.json` (ticketUrl missing) | Промоутер / Соня |

**Total: 9 placeholder links.** All render as `href="#"` on the live site. None block v1 testing — they are a known-incomplete state tracked for the Launch milestone.

---

## SC5 (Server-side) — Booking Endpoint (Detailed Proof)

```
Honeypot probe (safe — no Telegram delivery):
  POST https://vnimanie-brusnika.vercel.app/api/book
  Fields: website=probe, name=probe
  Note: Origin header required (Astro CSRF protection; expected behavior)
  Response: HTTP 200 {"ok":true}

Token check (client-side bundles):
  api.telegram.org in HTML:       0
  Bot token variable in HTML:     0
  Bot-token pattern in HTML:      none
  AudioPlayer.js token refs:      0
  VideoSection.js token refs:     0
  GallerySection.js token refs:   0

The bot token env var is read only from process.env in src/pages/api/book.ts
(no PUBLIC_ prefix) — never reaches any client bundle.
```

---

## SHARE — Social Sharing (SHARE-02/03)

```
share-btn class present in live HTML: YES
data-share="vk" attribute:            YES
data-share="telegram" attribute:       YES
data-share="copy" attribute:           YES

Desktop fallback URLs in VideoSection JS bundle:
  t.me/share/url?url=   → Telegram share link
  vk.com/share.php?url= → VK share link
```

Share button present in the video (clips) section. Desktop fallbacks for Telegram and VK confirmed in the JS bundle. Share URL is computed from `window.location.origin` at runtime (not hardcoded).

---

## Что проверить на телефоне (Plan 02 — Human Checks)

### SC3 — Перемотка аудио (проверяет Соня или кто-то с iPhone)

1. Открой https://vnimanie-brusnika.vercel.app на айфоне в Safari.
2. Прокрути вниз до раздела «Музыка» и нажми «слушать» на любом треке.
3. Когда трек начнёт играть, перемотай ползунок примерно на середину (50%).
4. Ожидаемый результат: музыка продолжает играть с того места, куда ты перемотала — не с начала.
5. Если после перемотки трек начинает играть снова с начала — это ошибка, сообщи нам.

### SC5 — Получение заявки (проверяет Соня)

1. Открой https://vnimanie-brusnika.vercel.app на любом устройстве.
2. Нажми кнопку «Записаться» (в навигации или в разделе «Пойте с нами»).
3. Заполни форму тестовыми данными (можно написать «тест» в каждом поле).
4. Нажми «Отправить».
5. Сайт должен показать экран «Спасибо!».
6. Проверь Telegram — должно прийти сообщение от бота с заявкой на русском языке:
   - Формат: [что ввела в поле «формат»]
   - Имя: [что ввела в поле «имя»]
   - Контакт: [что ввела в поле «контакт»]
   - Опыт: [что ввела в поле «опыт»]
7. Если сообщение не пришло или пришло с ошибками — сообщи нам.

---

## Security Note

This document contains **only** header values, HTTP status codes, and occurrence counts. No bot token, chat ID, or other secret value is recorded anywhere in this file.
