# Phase 1: Foundation & Static Site - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-24
**Phase:** 1-foundation-static-site
**Areas discussed:** Real content & placeholders, Phase-1 state of interactive UI, Content Collections modeling, CSS / styling migration

---

## Real Content & Placeholders

### Shows data
| Option | Description | Selected |
|--------|-------------|----------|
| Real shows ready now | Build shows collection with real data provided now | |
| Structure now, fill before launch | Schema + sample entries now; real data in Phase 4 | ✓ |
| No confirmed shows yet | Design empty / «объявим скоро» state | |

**User's choice:** Structure now, fill before launch.

### Unconfirmed link strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Hide until real | Omit links without a confirmed URL | |
| Show, marked «скоро» | Visible but disabled/labelled not-live | |
| Keep draft values for demo | Leave draft placeholders; Phase 4 swaps real values | ✓ |

**User's choice:** Keep draft values for demo.
**Notes:** User first asked (clarifying) why real links to platform pages couldn't be used — answer: no technical barrier; the placeholder strategy only applies to items where no real URL is in hand yet.

### Which links are real now (data capture)
| Option | Description | Selected |
|--------|-------------|----------|
| Яндекс Музыка | Real artist URL available | ✓ |
| VK Music | Real artist URL available | ✓ |
| Apple Music | Real artist URL available | ✓ |
| Ticket URLs | Real Timepad/Kassir URLs | |

**User's choice:** Яндекс Музыка, VK Music, Apple Music, and Spotify all confirmed real. (Tickets NOT selected → still pending.)

### Contact email
| Option | Description | Selected |
|--------|-------------|----------|
| Yes, it's real | Use hello@brusnika.ru | |
| Different email | Provide another address | |
| Drop email | Telegram-only contact | |

**User's choice:** Free-text — "this is a draft email, will be updated after demo." Treated as a known placeholder tracked for Phase 4.

---

## Phase-1 State of Interactive UI

### Audio UI
| Option | Description | Selected |
|--------|-------------|----------|
| Keep draft's demo behavior | Port fake now-playing bar JS | ✓ |
| Static shell, inert | Markup only, no JS | |
| Visually disabled | Greyed/non-clickable rows | |

**User's choice:** Keep draft's demo behavior (throwaway, replaced in Phase 2).

### Booking flow
| Option | Description | Selected |
|--------|-------------|----------|
| Modal opens, fake «Спасибо!» | Port draft fake success | ✓ |
| Modal opens, submit disabled | «скоро» note, no fake success | |
| Modal deferred to Phase 3 | Buttons open nothing | |

**User's choice:** Modal opens with fake «Спасибо!» (real Telegram in Phase 3).

### Animations (FND-03)
| Option | Description | Selected |
|--------|-------------|----------|
| Keep as small global script | Vanilla JS reveal + cursor glow | ✓ |
| Make them Astro islands | Hydrated island components | |

**User's choice:** Keep as small global script.

---

## Content Collections Modeling

Presented as three sub-questions (data scope / singletons / track schema). User asked for a plain-language explanation, then chose **"accept the recommended options"** across all three.

| Sub-question | Recommended (selected) | Alternatives |
|--------------|------------------------|--------------|
| Data scope | Collections for tracks/shows/gallery + links as data; prose in components | Minimal (FND-05 literal); Maximal (everything as data) |
| Singletons | Single typed site-data file | Single-entry collections; hardcode in components |
| Track schema | Include optional/empty media fields now | Add in Phase 2 |

**User's choice:** Accept recommended for all three.
**Notes:** User requested «объясни простым языком» — concepts re-explained with everyday analogies before deciding.

---

## CSS / Styling Migration

### Styling approach
| Option | Description | Selected |
|--------|-------------|----------|
| Palette tokens + per-block scoped styles | Central CSS variables + component-scoped styles; pixel-identical | ✓ |
| Copy inline styles verbatim | Move draft styles as-is | |

**User's choice:** Palette tokens + per-block styles.

### Images
| Option | Description | Selected |
|--------|-------------|----------|
| Optimize via Astro | `<Image>`, WebP/AVIF, srcset | ✓ |
| Keep plain .jpg | Draft-style plain images | |

**User's choice:** Optimize via Astro.

---

## Claude's Discretion

- File/component breakdown, collection schema field names, token naming, global stylesheet location — planner/researcher per Astro conventions.

## Deferred Ideas

None — discussion stayed within phase scope.
