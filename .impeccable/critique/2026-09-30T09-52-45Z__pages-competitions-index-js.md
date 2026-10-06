---
target: /competitions/
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:/Users/greg/Development/Predictor/pages/competitions/index.js"
target_fingerprint: "sha256:0bd49b7347f9a22b91e699c8c769c4b280a00a2c96c3f64be78594d37f14d7dd"
target_path: /Users/greg/Development/Predictor/pages/competitions/index.js
timestamp: 2026-09-30T09-52-45Z
slug: pages-competitions-index-js
closed: true
---
# Critique: /competitions/

Method: dual-agent (A: explore · B: generalPurpose)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 3 | Compare shows data date; charts load client-side with no skeleton |
| 2 | Match system / real world | 4 | Regions and market language match punter/fan mental models |
| 3 | User control and freedom | 3 | Strong sort on compare; index is scroll-only |
| 4 | Consistency and standards | 3 | Breadcrumbs on compare vs Home-only on index; width differs |
| 5 | Error prevention | 3 | Low-sample badges on compare; early-season misuse still possible |
| 6 | Recognition rather than recall | 2 | No search on 60+ leagues; outside Popular is geography memory |
| 7 | Flexibility and efficiency | 3 | Compare is the power path; index lacks jump links or filter |
| 8 | Aesthetic and minimalist design | 2 | Compare stacks chart, style map, 12-column table, journey breaks |
| 9 | Error recovery | 3 | Compare empty state links home; noIndex when dataset too thin |
| 10 | Help and documentation | 3 | Methodology links; no inline metric glossary |
| **Total** | | **27/40** | **Solid operate surface; discovery and compare density are the gaps** |

## Design specificity verdict

**LLM:** This is unmistakably Soccer Stats Hub: BTTS, Over 2.5, corners, cards, home advantage, and a real cross-league compare tool (SSR table, style map, shareable charts). The index is an editorial catalog (Popular + regions), not a generic league list. It reads as **browse leagues** or **rank markets**, which fits the product.

**Detector:** `impeccable detect` on `pages/competitions`, `pages/competition/[param].js`, and `src/components/competition` returned **0 primary findings** (exit 0). No browser overlay (file targets only).

## Overall impression

The **compare** route is the product highlight; the **index** is a long, text-only directory whose main job is SEO and hand-off. The biggest opportunity is **discovery** (search or collapse to Popular + compare) and **compare chart ergonomics** (leaderboard height on full league sets).

## What's working

1. **Cross-league compare** is substantive: sortable table, low-sample signaling, league deep links (`CompetitionsCompare.js`).
2. **Popular band** and card hover affordances make the top leagues scannable (`CompetitionsIndex-*` CSS).
3. **Catalog hygiene**: featured deduping, JSON-LD CollectionPage/Dataset, region grouping (`competitionGroups.js`).

## Priority issues

**[P0] No search or filter on the competitions index**  
Why: Fans outside the seven Popular leagues must scroll and remember region groupings.  
Fix: Add typeahead or anchor jump list; or lead with compare for “find a high-BTTS league.”  
Suggested command: `/impeccable layout pages/competitions/index.js`

**[P0] Leaderboard chart height scales with every league**  
Why: ~22px per row pushes the style map and table far down on mobile.  
Fix: Cap chart to top/bottom N with “see full table” link.  
Suggested command: `/impeccable layout src/components/competition/competitionCompareCharts.js`

**[P1] Client-only charts without loading state on compare**  
Why: Page feels empty or broken until Chart.js hydrates.  
Fix: `dynamic` loading skeleton or SSR placeholder stats row.  
Suggested command: `/impeccable harden src/components/CompetitionsCompare.js`

**[P1] Wayfinding mismatch index vs compare**  
Why: Compare has breadcrumbs; index only has Home link when returning from a league hub.  
Fix: Shared breadcrumb pattern on index (`Home / Competitions`).  
Suggested command: `/impeccable layout pages/competitions/index.js`

**[P2] Compare CTA placement on index**  
Why: Single orange pill competes with journey zone; easy to miss on long scroll.  
Fix: Repeat compare entry after Popular or sticky secondary link.  
Suggested command: `/impeccable layout pages/competitions/index.js`

## Persona red flags

**Single-league fan:** No search; cards are name-only (no country/tier teaser). Compare feels like analyst tooling.

**Researcher / analyst:** Table metrics exceed chart metrics (mental mapping). No export beyond share images. Current-season-only data easy to over-read early season despite badges.

## Minor observations

- Index intro uses an em dash in copy (`pages/competitions/index.js`); PRODUCT prefers avoiding em/en dashes in user-facing text.
- `ssh-content` wraps header + first journey break only; grids sit outside for ad placement (intentional).
- Mobile compare hides country column; duplicate league names may confuse.

## Questions to consider

1. Is `/competitions/` primarily an SEO directory or a daily tool? Should Popular + search + compare replace long regional scroll?
2. Should the leaderboard chart show a bounded story (top 15) instead of every qualifying league?
3. Should index cards tease one live stat (e.g. goals/game) to earn clicks vs compare alone?
