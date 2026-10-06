---
target: /fixture/<fixtureID>
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:/Users/greg/Development/Predictor/pages/fixture/[param].js"
target_fingerprint: "sha256:320ca520e108d0d4bc5767bc158c43d90b663036be610e36c738a8c6a49bf048"
target_path: /Users/greg/Development/Predictor/pages/fixture/[param].js
timestamp: 2026-09-30T13-10-48Z
slug: pages-fixture-param-js
---
# Critique: `/fixture/<id>/`

Method: dual-agent (A: explore · B: generalPurpose)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 3 | SSR hero then client skeleton; unlock quota not global |
| 2 | Match system / real world | 3 | Football labels OK; "Match Tendencies" is analyst jargon |
| 3 | User control and freedom | 2 | No section nav; premium tabs tease paywall |
| 4 | Consistency and standards | 3 | FixturePage tokens vs hardcoded chart greens/reds |
| 5 | Error prevention | 2 | Locked season tabs still fully clickable |
| 6 | Recognition rather than recall | 2 | BTTS/O2.5 buried in long tendency list |
| 7 | Flexibility and efficiency | 2 | Compare blocks filtered; no jump to H2H/markets |
| 8 | Aesthetic and minimalist design | 2 | Long scroll, journey slots, homepage deflection note |
| 9 | Error recovery | 3 | Plain errors; no retry or fixtures index link |
| 10 | Help and documentation | 2 | No methodology or metric glossary on-page |
| **Total** | | **24/40** | **SSH craft present; Operate job (markets first) is under-served** |

## Design specificity verdict

**LLM:** Visually this is Soccer Stats Hub (fixture tokens, season compare tabs, W/D/L badges, prediction unlock). For **Operate**, it under-delivers: SEO and meta sell BTTS/O2.5, but the interactive stack leads with season stats, charts, and a flat "Match Tendencies" dump—not a markets-first research surface.

**Detector:** `impeccable detect` on fixture page components → **0 findings**; `Team.js` also **0** on supplemental scan.

**Browser:** Not run this session.

## Overall impression

Season stats compare and FixturePage CSS are strengths. Friction is IA: punters land for markets; the page foregrounds locked predicted score and deflects to homepage.

## Priority issues

**[P0] No above-the-fold markets answer** — `/impeccable shape` + `/impeccable layout` on Team.js

**[P0] Match Tendencies mixes markets with advanced stats** — `/impeccable distill` Team.js + fixturePageMetrics.js

**[P1] Homepage deflection note** — `/impeccable clarify` Team.js

**[P1] Client-only Team (ssr: false)** — `/impeccable harden` pages/fixture/[param].js

**[P2] Premium season tabs** — `/impeccable polish` FixtureSeasonStats.js

**[P3] Thin SEO shell** — `/impeccable clarify` FixtureSeoShell.js
