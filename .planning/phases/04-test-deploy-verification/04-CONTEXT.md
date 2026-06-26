# Phase 4: Test Deploy & Verification - Context

**Gathered:** 2026-06-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Confirm — on the **already-live private test deploy** (`vnimanie-brusnika.vercel.app`, noindex) — that every pitfall documented in research is actually resolved, then record the findings in a single checklist so the band can review v1 with confidence.

This is a **verification phase**, not a feature phase. The only code change in scope is the one small gap that blocks a success criterion: a missing `robots.txt` (see D-01). Everything else is *check what is deployed and document it*.

**Success criteria being verified (from ROADMAP § Phase 4):**
1. Deploy is private/noindex — `robots` meta `noindex` present **and** `robots.txt` disallows crawling.
2. Zero requests to `fonts.googleapis.com` / `fonts.gstatic.com` during page load (self-hosted fonts).
3. iOS Safari audio seek works mid-track without restart; `Content-Range`/`Accept-Ranges` confirmed.
4. Every outbound link audited; status recorded; remaining `#` placeholders documented in one checklist.
5. A live booking submission reaches Соня's Telegram; the band confirms receipt.

**Out of scope (deferred to a future Launch milestone, NOT v1):**
- Flipping `NOINDEX` to `false` to go public.
- Writing the band-facing launch procedure.
- The zero-placeholder-links gate (Phase 4 only *inventories* placeholders; it does not require them filled).
- Any new product capability — this phase adds no features.
</domain>

<decisions>
## Implementation Decisions

### robots.txt gap (Success Criterion 1)
- **D-01:** **Create a simple static `public/robots.txt`** with `User-agent: *` / `Disallow: /` (disallow everything, always). Criterion 1 requires a crawl-disallowing `robots.txt`, but **no robots.txt exists in the repo today** — only the build-time `noindex` meta tag (`Layout.astro`, gated on `import.meta.env.NOINDEX === 'true'`). A static always-disallow file is correct because **v1 stays private the entire time** — going public is a separate Launch milestone. Rejected: generating robots.txt dynamically from the `NOINDEX` env var (more moving parts, only useful for the launch toggle which is out of scope here).

### Division of verification labor (Success Criteria 1–5)
- **D-02:** **Claude automates everything checkable from curl/code against the live URL, and writes the result straight into the checklist:**
  - SC1 — `robots` meta tag present in fetched HTML + `robots.txt` returns `Disallow: /`.
  - SC2 — no `fonts.googleapis.com` / `fonts.gstatic.com` references anywhere in the fetched HTML/CSS.
  - SC3 (server side) — audio response on the CDN returns `Accept-Ranges: bytes` and HTTP 206 + `Content-Range` on a ranged request.
  - SC4 — fetch every outbound link from `src/data/site.ts` and record each one's HTTP status; flag remaining `#` placeholders.
  - SC5 (server side) — endpoint/bot reachability where checkable without a full UI submission.
- **D-03:** **Human-only checks stay with the user**, who reports back and Claude marks them off. These cannot be automated:
  - SC3 (device) — scrub to the middle of a track on a **real iPhone in Safari** and confirm it plays from that position without restarting.
  - SC5 (receipt) — submit the live booking form and have **the band confirm in Telegram** that the message arrived, correctly formatted, in Russian.
  - For each human check, Claude provides a short "what to tap → what should happen" instruction.

### Where findings are recorded (Success Criterion 4)
- **D-04:** **One markdown document inside the phase directory** (`.planning/phases/04-test-deploy-verification/`). It contains a table — *check → result → proof (response header / value / screenshot note)* — covering all 5 success criteria, **plus a dedicated placeholder-link tracker block** listing every remaining `#` link, where it lives, and which real URL is still pending from the band. Stays within the planning structure; does not clutter the repo root.

### Placeholder links (Success Criterion 4)
- **D-05:** **Inventory only — do not fix.** Remaining `#` placeholders in `src/data/site.ts` (Яндекс Музыка, VK Музыка, Apple Music, VK community, Instagram) are recorded in the D-04 tracker. Filling them to zero is a **Launch-milestone gate, not a v1 test gate** (per ROADMAP). Each is already annotated in `site.ts` with the phase that should fill it.

### Telegram credentials (Success Criterion 5)
- **D-06:** **Bot token + Соня's chat ID are confirmed already configured in Vercel** (user confirmed 2026-06-26 — supersedes the "Pending" status in STATE.md § External Prerequisites). Therefore **the live booking test (SC5) is performed for real in this phase**, not deferred.

### Claude's Discretion
- Exact tooling for the automated checks (curl flags, `Range:` header value to trigger a 206, how the link list is iterated) — implementer/researcher decides.
- Exact filename/structure of the D-04 verification document — follow phase conventions.
- Which deploy URL to test against — default to the live production deploy `vnimanie-brusnika.vercel.app` (already noindex), unless a fresh preview is preferred at plan time.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope & success criteria
- `.planning/ROADMAP.md` § "Phase 4: Test Deploy & Verification" — the goal, the 5 success criteria (the TRUE conditions), and the explicit "Deferred to a future Launch milestone (NOT v1)" list.
- `.planning/REQUIREMENTS.md` — the cross-cutting requirements re-confirmed here: FND-02 (no Google Fonts), FND-07 (noindex), AUD-05 (audio range requests), SHARE-02/03, BOOK-02 (Telegram delivery), LINK-01/02 (real links).

### Project intent & locked architecture
- `.planning/PROJECT.md` — core value ("if everything else fails, the music must play and the booking must reach Соня") that SC3 and SC5 protect; the privacy constraint (noindex until launch approval).
- `.planning/STATE.md` § "Accumulated Context" — locked architecture: env-var-gated `NOINDEX` (Vercel dashboard toggle, not code); `TELEGRAM_BOT_TOKEN` server-side only; never serve media through serverless; § "External Prerequisites" — Telegram credentials (now confirmed present per D-06) and real placeholder URLs (pending, tracked per D-05).
- `CLAUDE.md` § Noindex / § Fonts / § Booking — the research-backed reasons each pitfall matters (Google Fonts unreliable for Russian ISPs; noindex via meta + X-Robots header; Telegram delivery).

### Code to read (verification targets)
- `src/layouts/Layout.astro` (lines ~32–49) — the build-time `noindex` meta tag gated on `import.meta.env.NOINDEX === 'true'`. SC1 verifies this renders in the live HTML.
- `src/data/site.ts` — single source of truth for all outbound links; lines with `url: '#'` are the placeholders SC4/D-05 must inventory (Яндекс Музыка, VK Музыка, Apple Music, VK community, Instagram).
- `src/pages/api/book.ts` — the booking serverless endpoint exercised by the SC5 live test.
- `astro.config.mjs` — `output: 'static'`, `@astrojs/vercel` with `staticHeaders: true` (relevant to how `robots.txt` / headers are served).
- `public/` — currently holds only `favicon.svg`; this is where the new `robots.txt` (D-01) lands.

No external ADRs/specs — requirements and decisions are fully captured in the docs above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Layout.astro` already implements the `noindex` meta gate — SC1's meta-tag half needs no new code, only verification.
- `site.ts` typed link singletons make the SC4 link audit mechanical: iterate the exported link objects, fetch each, record status. Placeholder `#` entries are self-documenting (inline comments name the deferral phase).
- `public/` exists with `favicon.svg` — adding `robots.txt` here is the standard Astro static-asset path (served verbatim at site root).

### Established Patterns
- Build-time env gating (`import.meta.env.NOINDEX`) — robots.txt as a *static* file (D-01) is intentionally simpler than mirroring this gating, since v1 never goes public.
- Media is served from the CDN (Vercel Blob), never through serverless — SC3's `Accept-Ranges`/206 check targets the **CDN audio URL**, not an app route.

### Integration Points
- `robots.txt` → `public/robots.txt`, served at `/robots.txt` on the live deploy.
- SC2/SC1 checks run against the rendered HTML of the live URL.
- SC3 server check runs against the CDN audio asset URL; SC3 device check runs on a real iPhone.
- SC5 runs against `/api/book` end-to-end into Соня's Telegram.
</code_context>

<specifics>
## Specific Ideas

- The verification document should read as a **band-shareable status report**: each criterion either ✅ with a concrete proof (a header value, a "no google-fonts requests" note, a screenshot reference) or ⏳ pending-human / ⛔ blocked — no vague "looks fine".
- Human-check instructions for the user should be **plain-language, step-by-step** ("открой на айфоне, начни трек, перемотай на середину — должно играть с середины, а не сначала").
- The placeholder-link tracker is explicitly a **handoff artifact for the future Launch milestone** — it's the single list of "what real URLs we still need from the band".
</specifics>

<deferred>
## Deferred Ideas

- **Flipping `NOINDEX=false` to go public** + writing the band-facing launch procedure + the zero-placeholder-links gate — all Launch milestone, explicitly out of v1 (ROADMAP).
- **Dynamic, env-driven `robots.txt`** (allow when public, disallow when private) — only useful once launch is on the table; deferred with the launch toggle. v1 uses a static always-disallow file (D-01).
- **Filling the real streaming / ticket / social URLs** (Яндекс Музыка, VK Музыка, Apple Music, VK community, Instagram) — pending from the band; tracked, not fixed, in this phase (D-05).
- **Email fallback channel for booking** (built but disabled in Phase 3) — stays off until a monitored inbox + email service exist; not part of v1 verification.

None of the discussion introduced new scope — all four discussed areas clarified *how* to verify what is already deployed.
</deferred>

---

*Phase: 4-test-deploy-verification*
*Context gathered: 2026-06-26*
