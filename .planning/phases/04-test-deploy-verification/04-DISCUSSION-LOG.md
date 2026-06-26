# Phase 4: Test Deploy & Verification - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-26
**Phase:** 4-test-deploy-verification
**Areas discussed:** robots.txt gap, Division of verification labor, Where findings are recorded, Telegram credentials readiness

---

## robots.txt gap

| Option | Description | Selected |
|--------|-------------|----------|
| Simple "disallow all" | Static `public/robots.txt` with `User-agent: *` / `Disallow: /`, always disallows. v1 stays private throughout. | ✓ |
| Tied to NOINDEX env var | Dynamically generate robots.txt: disallow when `NOINDEX=true`, allow when false. Prepares the launch toggle but more moving parts. | |

**User's choice:** Simple "disallow all" (recommended).
**Notes:** Surfaced during codebase scout — Success Criterion 1 requires a crawl-disallowing robots.txt, but no robots.txt exists; only the build-time `noindex` meta tag. Static file is correct since going public is a separate Launch milestone.

---

## Division of verification labor

| Option | Description | Selected |
|--------|-------------|----------|
| Claude auto + user manual | Claude automates everything checkable via curl/code and writes results to the checklist; user does iPhone audio-seek + band Telegram confirmation, reports back. | ✓ |
| Auto only for now | Do only the automatable checks now; leave human checks as open items for later. Faster but phase doesn't fully close. | |

**User's choice:** Claude auto + user manual (recommended).
**Notes:** Real-device audio seek (iPhone Safari) and band confirmation of booking receipt cannot be automated; Claude provides plain-language "what to tap → what should happen" instructions for those.

---

## Where findings are recorded

| Option | Description | Selected |
|--------|-------------|----------|
| One file in phase dir | Single markdown in `.planning/phases/04.../`: table of all 5 criteria + a placeholder-link tracker block. Stays in planning structure. | ✓ |
| Next to STATE/README | Keep checklist in a more visible spot (repo root / .planning root) for easy launch-time access. | |

**User's choice:** One file in the phase directory (recommended).
**Notes:** Criterion 4 asks for a single checklist; includes a dedicated placeholder-link tracker as a handoff artifact for the future Launch milestone.

---

## Telegram credentials readiness

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, already configured | Bot token + Соня's chat ID already set in Vercel env — SC5 live booking test runs for real in this phase. | ✓ |
| No / not sure | Credentials not yet available — SC5 marked "blocked: awaiting credentials from Соня", other 4 checks proceed. | |

**User's choice:** Yes, already configured.
**Notes:** Supersedes the "Pending" status in STATE.md § External Prerequisites. The live booking test (SC5) is performed end-to-end in this phase.

---

## Claude's Discretion

- Exact tooling for automated checks (curl flags, `Range:` header to trigger HTTP 206, link-iteration mechanism).
- Exact filename/structure of the verification document (follow phase conventions).
- Which deploy URL to test (default: live `vnimanie-brusnika.vercel.app`, already noindex).

## Deferred Ideas

- Flipping `NOINDEX=false` to go public + band-facing launch procedure + zero-placeholder gate — Launch milestone, out of v1.
- Dynamic env-driven robots.txt — deferred with the launch toggle.
- Filling real streaming/ticket/social URLs — pending from band; tracked, not fixed (D-05).
- Email fallback channel for booking — stays disabled until a monitored inbox + email service exist.
