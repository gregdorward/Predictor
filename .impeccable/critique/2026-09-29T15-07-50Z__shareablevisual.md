---
target_identity: "file:/Users/greg/Development/Predictor/ShareableVisual"
timestamp: 2026-09-29T15-07-50Z
slug: shareablevisual
---
# ShareableVisual + rankings-wrapper critique

Method: dual-agent (A: 8228bcb7-a0d3-430a-ae72-20ea31e1cbd2 · B: 41a53423-2803-4616-8990-36e92c6633b6). Browser skipped.

Surface: match-detail league rankings (`TeamRankingsFlexView`, `GameStats` season form). Mode: Operate/Read.

## Design Health Score — 28/40 (Competent)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 3 | Status text OK; no export preview; busy state subtle |
| 2 | Match system / real world | 4 | Download/copy/share familiar |
| 3 | User control and freedom | 3 | Share abort silent; copy→download fallback good |
| 4 | Consistency and standards | 2 | DESIGN No-Lift vs share btn lift; GameStats share variants differ |
| 5 | Error prevention | 3 | Locked: hideActions + no capture target |
| 6 | Recognition vs recall | 2 | Icon-only toolbar; brand hidden until export |
| 7 | Flexibility and efficiency | 3 | Three export paths for power users |
| 8 | Aesthetic / minimalist | 3 | Dense rankings fit research; container hover shadow |
| 9 | Error recovery | 3 | Clear fallback copy |
| 10 | Help and documentation | 2 | No “what gets shared” hint |

## Design Specificity

**LLM:** Rankings legend, heatmap tiles, fixture-titled exports feel SSH-specific. Share toolbar and premium unlock reuse comparison-chart chrome (generic).

**Detector:** 0 findings on ShareableVisual, TeamRankingsFlexView, RankingsSection. Browser skipped.

## Strengths

1. Premium + export safety (hideActions, data-share-capture, pointer-events when locked).
2. Export brand strip only on capture path.
3. Rankings hierarchy: title → legend → sections; strong tile aria-labels.

## Priority Issues

**[P1]** Share buttons use hover lift vs DESIGN.md → `/impeccable polish ShareableVisual`

**[P1]** Icon-only share row low discoverability → `/impeccable clarify` + `/impeccable layout rankings-wrapper`

**[P2]** No preview of export footer → `/impeccable shape ShareableVisual export preview`

**[P2]** Premium unlock CTA from chart pattern on rankings → `/impeccable quieter` + rankings-specific copy

**[P3]** GameStats share wrappers inconsistent → `/impeccable distill GameStats share patterns`

## Personas

Casual fan: won’t find icons. Researcher: wants WYSIWYG export. AT: add aria-busy on capture.

## Minor

`.ShareableVisual__actions { font-size: 0.25em }` suspect typo. rankings-container hover shadow on read-only card.
