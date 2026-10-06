---
target: /fixtures
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/greg/Development/Predictor/pages/fixtures/index.js"
target_fingerprint: "sha256:3967d1412d7c7c223a02f57f198e74038618d8fcfb706d591113ca05ddb26c7e"
target_path: /Users/greg/Development/Predictor/pages/fixtures/index.js
timestamp: 2026-09-30T13-36-25Z
slug: pages-fixtures-index-js
---
# Critique: `/fixtures/`

Method: ⚠️ DEGRADED: single-context (Task subagent spawn failed on first attempt; design review, detector CLI, and browser snapshot completed in parent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 3 | SSR count + search result text; no loading state on client filter |
| 2 | Match system / real world | 3 | Football labels fine; date · match · league string is analyst-hostile |
| 3 | User control and freedom | 2 | Search only; no date/league filters or jump nav |
| 4 | Consistency and standards | 2 | Plain StaticPage list vs polished `/competitions/` hub patterns |
| 5 | Error prevention | 3 | Search empty message OK |
| 6 | Recognition rather than recall | 2 | Must parse long link text; no visual columns or grouping |
| 7 | Flexibility and efficiency | 3 | Search helps power users; no league shortcuts |
| 8 | Aesthetic and minimalist design | 2 | Two intro paragraphs before the tool; list is minimal but not scannable |
| 9 | Error recovery | 2 | Fetch failure looks like “no fixtures”; no retry or homepage CTA |
| 10 | Help and documentation | 3 | Methodology/competitions linked in intro |
| **Total** | | **25/40** | **Acceptable: works, but Operate job is under-served** |

## Design specificity verdict

**LLM:** This is Soccer Stats Hub editorial shell (SiteHeader, StaticPage, en-GB copy, fixture deep links) but the **list UI is generic**: underline links in a `<ul>` with no matchday dashboard density. It reads like an SEO sitemap page, not the research terminal the homepage defers to. Compared to the improved competitions index, `/fixtures/` did not inherit jump nav, grouping, or card rhythm.

**Detector:** `impeccable detect` on `pages/fixtures/index.js` + `FixturesIndexList.js` → **0 findings**.

**Browser:** Inspected `http://localhost:3000/fixtures/` (29 fixtures). Search exposed in a11y tree; list items are single long link names (e.g. “Wed 30 Sept · Eastleigh vs Southend United · National League”). No detect.js overlay injection attempted.

## Overall impression

The page delivers SSR upcoming links and a working search, which is the core job. Friction is **scanning and orientation**: users scroll past copy to reach search, then face an ungrouped wall of similarly formatted Nations League rows with no kick-off time structure or league filter.

## What's working

- **SSR fixture links** with sensible `href`s and a capped window (good for SEO and first paint).
- **Client search** with accessible label and live result count.
- **Copy** sets expectations (H2H, BTTS, O2.5, modelled scores) and links methodology/competitions honestly.

## Priority issues

**[P1] No date or league grouping** — `/impeccable layout` on `FixturesIndexList.js`

Long flat list mixes MLS, Nations League, and National League without section headers or sticky day chips. Users cannot jump to “today” or “my league” without typing.

**[P1] Tool below the fold of marketing copy** — `/impeccable distill` on `pages/fixtures/index.js`

Two paragraphs precede search on mobile. Operate mode should lead with search + count, then optional SEO body.

**[P1] Row format is one undifferentiated string** — `/impeccable layout` + `FixturesIndexList.js`

Date, fixture, and league are concatenated in the link text. No kick-off time column, no league chip, no row hover surface like homepage `ResultButton` rows.

**[P2] Inconsistent with competitions index polish** — `/impeccable polish` `pages/fixtures/index.js`

Missing breadcrumb pattern, jump nav, and dedicated polish CSS file used elsewhere (`competitions-index-layout.css`).

**[P2] Ambiguous empty state** — `/impeccable harden` `getServerSideProps` / `fetchUpcomingFixtureLinks`

API failure and genuinely empty calendars share the same message; no link to homepage today’s board.

## Persona red flags

**Alex (power user):** No league filter chips, no keyboard section jumps, must search or scroll 29+ identical row shapes.

**Jordan (first-timer):** Two paragraphs before the only interactive control; “29 fixtures” does not explain sort order (date? league?).

**Casey (mobile):** Search sits below intro copy; primary action not in first thumb zone; long wrapped link strings hard to tap precisely.

## Minor observations

- Curly quotes in “No matches for …” may feel off-brand vs PRODUCT punctuation rules.
- Styles live only in `index.css` (hook-sensitive); prefer `fixtures-index-polish.css` + `_app` import like other hubs.
- Footer/nav duplication in snapshot is sitewide, not fixtures-specific.

## Questions to consider

- Should this page reuse the homepage fixture row component for visual parity?
- Is one combined list correct, or should National League / MLS blocks mirror competition grouping?
- Can intro move below the list for logged-in repeat visitors only?
