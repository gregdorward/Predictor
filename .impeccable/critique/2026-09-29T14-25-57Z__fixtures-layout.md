---
target_identity: "file:/Users/greg/Development/Predictor/fixtures layout"
timestamp: 2026-09-29T14-25-57Z
slug: fixtures-layout
---
# Fixtures layout critique (post–Get Predictions & Stats)

Method: dual-agent (A: 6974687d-2758-4dd3-82a1-fe79c450d71f · B: a02ea3fe-a318-4ba7-aee9-a4a8b5ccd8b7). Browser overlay skipped (HMR/API load).

## Design Health Score — 22/40 (Acceptable)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 2 | Batch OK (`Processing…`); row locks / expanded state weak; unused `#FixtureContainerHeaders` |
| 2 | Match system / real world | 2 | “Tips” language vs research product; `alert()` for pre-batch expand |
| 3 | User control and freedom | 2 | Date nav locked while predicting; row click vs star checkbox; no inline filter reset |
| 4 | Consistency and standards | 2 | Copy “and” vs “&”; score vs probability grid asymmetry; DESIGN No-Lift vs row hover lift |
| 5 | Error prevention | 2 | Unlock spends quota without inline cost; early-season “-” without row context |
| 6 | Recognition vs recall | 2 | Probability/score toggle buried in Options below CTA |
| 7 | Flexibility and efficiency | 3 | Filters, shortlist, SSH/AI strong but buried |
| 8 | Aesthetic / minimalist | 1 | Collapsibles, placeholder mounts, per-row column labels |
| 9 | Error recovery | 2 | Grey-out explained in copy; no reset control |
| 10 | Help and documentation | 2 | Post-run `InstructionalDiv` still pre-run copy |

Cognitive load: **7/8** checklist failures (high for Operate).

## Design Specificity Verdict

**LLM:** Rows are unmistakably SSH (1X2 grid, odds, form, probability bars, filter grey-out, `GameStats` expand). Shell IA feels legacy: date → allowance → Customise tips → CTA → Multis → Options → empty mounts → **then** `#FixtureContainer`.

**Detector:** 0 anti-patterns on `App.js`, `Fixture.js`, `FixtureDateCalendar.js`. `OptionsPanel.js` missing (options in `App.js`). Browser: skipped.

## What's Working

1. Probability/score on row with tiered bars — “show the work.”
2. Honest filter grey-out (`CapText`, `FiltersSelected`).
3. Full board + per-fixture unlock matches honest free tier.

## Priority Issues

**[P0] Board below configuration** — Payoff scrolls under Options/Multis. → `/impeccable layout src/App.js`

**[P0] Unlock under-specified** — Three locks, no “uses 1 of N” at tap. → `/impeccable clarify src/components/Fixture.js`

**[P1] Stale instructional copy after run** — → `/impeccable onboard` fixture list header states

**[P1] Expand affordance brittle** — Row click, alerts, checkbox conflict. → `/impeccable harden src/components/Fixture.js`

**[P2] Repeated column headers per row** — → `/impeccable distill` fixture grid + `#FixtureContainerHeaders`

## Persona Red Flags

**Jordan:** Tips language; mode in distant Options; `alert` on expand.

**Casey:** Assumes CTA failed if list below fold; locks read as broken.

**Morgan:** Expand then premium blur feels like retracted transparency; three “muted” semantics (filter, lock, blur).

## Minor Observations

- Multis appears after first run, adding noise at peak moment.
- Auto-scroll to Premium may pull users off fresh predictions.
- `.individualFixturefalse:hover` translateY vs flat-forward DESIGN.

## Emotional Journey

CTA anticipation → batch OK → **valley** (locks, stale help, buried grid) → recovery only if user scrolls and expands.
