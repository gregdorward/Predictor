---
target: /competition/<leagueID>
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/Users/greg/Development/Predictor/pages/competition/[param].js"
target_fingerprint: "sha256:f0243ce7d95adf810cb350f5aa16b03799c5ad82542925d0fb1eb62a763a78b1"
target_path: /Users/greg/Development/Predictor/pages/competition/[param].js
timestamp: 2026-09-30T10-47-58Z
slug: pages-competition-param-js
---
# Critique: `/competition/<slug>/`

Method: dual-agent (A: explore · B: generalPurpose)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 2 | Client blocks return null while loading; standings fail silently |
| 2 | Match system / real world | 3 | BTTS/O2.5/GW language fits punters; analyst metrics lack gloss |
| 3 | User control and freedom | 2 | No section nav or deep links on a very long hub |
| 4 | Consistency and standards | 2 | SEO shell + hydrated page duplicate stats/tables; MUI vs custom tables |
| 5 | Error prevention | 3 | Read-only surface; sensible caps on comparison tools |
| 6 | Recognition rather than recall | 2 | Rankings/markets repeated; no sticky TOC |
| 7 | Flexibility and efficiency | 3 | Tabs, position-race controls, scatter filters, share captures |
| 8 | Aesthetic and minimalist design | 2 | Density fits SSH; repetition adds scroll without new insight |
| 9 | Error recovery | 2 | Page-level error exists; many sub-blocks vanish with no message |
| 10 | Help and documentation | 2 | Some section intros; few inline metric explainers |
| **Total** | | **23/40** | **Strong domain fit undermined by split architecture and repetition** |

## Design specificity verdict

**LLM:** This is unmistakably Soccer Stats Hub: market-first KPIs (BTTS, Over 2.5), standings, style-map comparison, market charts, and team ranking grids. It reads as a **league research terminal**, not a generic sports template.

**Detector:** `impeccable detect` on `pages/competition/[param].js`, `CompetitionPage.js`, `CompetitionSeoShell.js`, and `src/components/competition/` returned **0 findings** (exit 0).

**Browser:** Dev server responded on port 3000; URL-based detect timed out (30s). No live overlay evidence for this run.

## Overall impression

The **comparison tooling and market charts** are the product moat. The **page architecture** is the drag: SSR `CompetitionSeoShell` plus `dynamic(..., { ssr: false })` `CompetitionPage` tells the same league story twice, then rankings appear again in `CompetitionSeoExtras`. Fix the **single canonical path** for stats/standings and **wayfinding** before cosmetic polish.

## What's working

1. **Market-native league identity** — Season KPIs and SEO table foreground BTTS and Over 2.5 (`CompetitionSeoShell`, `CompetitionPage` metric grid).
2. **`CompetitionTeamComparison`** — Scatter style map, broad metric matrix, share capture; differentiated analyst surface.
3. **Accessible patterns in places** — Standings layout toggle uses tabs; SEO table uses caption/scope; player leaders use tablist roles.

## Priority issues

**[P0] Split SEO shell and client-only operate core**

- **Why:** Users see duplicated stats/table narrative; slow or no-JS clients miss interactive core; trust erodes when shell and hydrated blocks feel like two pages.
- **Fix:** One canonical stats + standings story; SSR or partial hydrate `CompetitionPage`; collapse or demote shell duplication.
- **Suggested command:** `/impeccable distill pages/competition/[param].js` then `/impeccable optimize pages/competition/[param].js`

**[P1] Silent loading and failure on key blocks**

- **Why:** `CompetitionStandings` / `CompetitionMetricRankings` returning `null` reads as missing data, not loading or error.
- **Fix:** Shared skeleton, empty, and retry states with season/date context.
- **Suggested command:** `/impeccable harden src/components/competition/CompetitionStandings.js`

**[P1] No wayfinding on a mega operate page**

- **Why:** Acca research becomes scroll archaeology; no shareable `#markets`-style anchors.
- **Fix:** Sticky section nav tied to `Competition__sectionHeading` ids (mirror `/competitions/` jump pattern).
- **Suggested command:** `/impeccable layout src/components/CompetitionPage.js`

**[P2] Triplicate rankings / market leaders**

- **Why:** SEO table columns, `TeamRankingTable` grid, and `CompetitionSeoExtras` repeat the same punter questions.
- **Fix:** One team market-leaders module with sort tabs; crawl-only extras or post-hydration removal.
- **Suggested command:** `/impeccable distill src/components/CompetitionPage.js`

**[P3] Journey breaks dilute terminal voice**

- **Why:** `JourneyContentBreak` copy between dense blocks feels like ad filler, not research UI.
- **Fix:** Section ledes under headings; single journey boundary at `#ssh-content`.
- **Suggested command:** `/impeccable quieter pages/competition/[param].js`

## Persona red flags

**Alex (power user):** No section jumps or hashes; 30+ metrics in pickers without search; ranking rows not linked to team routes.

**Jordan (first-timer):** BTTS/O2.5/home-advantage with no tooltips; silent missing standings; comparison buried mid-scroll.

**Riya (acca researcher):** Same O2.5/BTTS leaders again at page end; no quick path from league hub to today's fixtures in this competition.

## Questions to consider

1. Which source is canonical when SEO shell table and live `CompetitionStandings` could diverge after a matchday?
2. Should acca research (markets + top BTTS teams) win above-the-fold even if it shortens the encyclopedia scroll?
3. Should `CompetitionTeamComparison` own the first interactive viewport instead of a second stats band?
