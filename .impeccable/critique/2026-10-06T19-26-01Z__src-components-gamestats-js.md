---
target: homepage fixture Match Preview section
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:/Users/greg/Development/Predictor/src/components/GameStats.js"
target_fingerprint: "sha256:bcc584f56d244e5d4ac607cc3eb08455235cf9ba4a4f64f6e7d3e2cbcae8163d"
target_path: /Users/greg/Development/Predictor/src/components/GameStats.js
timestamp: 2026-10-06T19-26-01Z
slug: src-components-gamestats-js
---
Method: dual-agent (A: [Assessment A](8db9108d-f50a-45b2-9bd6-982e9f0aba34) · B: [Assessment B](77ca58da-c03e-42a0-a975-0c9f1501d730))

**Resolved target:** `src/components/GameStats.js` (Match Preview trigger, `AIOutput`, `AIMatchPreview*` styles) on homepage expanded fixture. **Mode:** Operate.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Generic loading copy; no step feedback through prefetch + Gemini; button not disabled while loading |
| 2 | Match System / Real World | 1 | "Match Preview" vs "AI Tips" card; pick-list framing reads tipster, not research |
| 3 | User Control and Freedom | 2 | No collapse/hide for generated block; silent abort if unlock revoked mid-request |
| 4 | Consistency and Standards | 2 | Four peer `h2`s; centered tips card vs comparison-terminal elsewhere; locked button styling vs `PredictionUnlockBtn` |
| 5 | Error Prevention | 2 | Unlock gate is sound; no double-submit guard while `isLoading` |
| 6 | Recognition Rather Than Recall | 2 | Quota on locked label is good; star scale unexplained; unlock shared with predictions not stated here |
| 7 | Flexibility and Efficiency | 2 | One-shot generate OK; no skim mode, anchors, or collapsible sections for return visits |
| 8 | Aesthetic and Minimalist Design | 1 | Full dump: prose + tips + players + 20 rating rows with weak hierarchy |
| 9 | Error Recovery | 1 | `generateAIInsights` errors only log; empty `AIOutput` after failed unlock spend |
| 10 | Help and Documentation | 2 | No point-of-use scope, limits, or methodology link on this gated surface |
| **Total** | | **18/40** | **Significant improvements needed** |

## Design Specificity Verdict

**LLM assessment:** The trigger ("Match Preview", orange CTA, daily unlock copy) fits Soccer Stats Hub's matchday dashboard. The **revealed content** feels interchangeable with a generic AI tip app: centered `AIMatchPreviewCard`, "AI Tips" headline, enumerated picks (score, goalscorer, cards), whispered italic disclaimer. That fights PRODUCT.md's research-first, show-the-work stance. Home/away columns echo GameStats, but there is no tie-in to stats already on the page, no SSH Tips vs this preview distinction, and the centered card breaks the side-by-side terminal rhythm.

**Deterministic scan:** CLI `impeccable detect` on `GameStats.js` returned **0** findings (exit 0). Live inject on homepage (fixture expanded, Match Preview open) reported **701** page-level issues, but **0** scoped to `AIMatchPreview`, `AIInsights*`, or inside `.GameStats` / `.ExpandingStats`. Detector agrees the problem is **IA/copy/hierarchy**, not static markup violations in the preview component file. Page noise (fixture board `undersized-ui-text`, collapsible `layout-transition`, guest auth) is false positive relative to this target.

**Visual overlays:** Injection succeeded on localhost:3001; overlays reflect **whole-page** scan, not Match Preview-only.

## Overall Impression

The opt-in pattern is right: preview stays behind a deliberate CTA inside an already dense fixture panel. After generate, the experience collapses into a **tip sheet plus homework grid** that undermines trust for researchers and overwhelms casual fans. The single biggest opportunity is to **reframe and stage** output: research narrative first, optional markets block, collapsible team depth, honest errors when the API fails.

## What's Working

1. **Opt-in reveal** — `#AIInsightsContainer` keeps the expanded fixture lighter until the user chooses Match Preview.
2. **Home/away parity** — `AIContainer` / `HomeAIInsights` / `AwayAIInsights` matches the mental model used across GameStats.
3. **Unlock recognition** — Locked button shows `(${remaining}/${FREE_DAILY_PREDICTION_LIMIT} free left)` and reuses `unlockOrUpgrade()` with the prediction table.

## Priority Issues

### [P0] Tipster framing under a research label
- **What:** Card title `${teams} AI Tips` and pick list (Correct Score, Anytime Goalscorer, etc.) with a small italic disclaimer.
- **Why it matters:** Contradicts brand commitments; users treat the site as picks, not transparent modelling.
- **Fix:** Rename/reframe sections; lead with narrative and limits; demote or collapse market-style picks; static, visible disclaimer per PRODUCT tone.
- **Suggested command:** `/impeccable clarify Match Preview AIOutput`

### [P0] Silent failure after generate
- **What:** Errors only `console.error`; user may see loading end with no content after spending a daily unlock.
- **Why it matters:** High frustration on a gated, high-stakes action.
- **Fix:** Error state + retry; consider not consuming unlock on server failure.
- **Suggested command:** `/impeccable harden Match Preview generate flow`

### [P1] Cognitive wall with no progressive disclosure
- **What:** `AIOutput` renders Preview, tips card, key players, and full ratings/styles in one scroll.
- **Why it matters:** 7/8 cognitive-load checklist failures; brutal on mobile (`.AIContainer` flex with no breakpoint rules found).
- **Fix:** Default-open narrative only; `Collapsable` sections mirroring Team styles / Match Context.
- **Suggested command:** `/impeccable distill Match Preview AIOutput`

### [P1] Weak status during long pipeline
- **What:** Multi-step prefetch then Gemini; only "Loading AI data...."; button stays `disabled={false}`.
- **Why it matters:** Operate surfaces need feedback and double-submit protection.
- **Fix:** Step labels, disable button, skeleton in `AIOutputContainer`.
- **Suggested command:** `/impeccable polish Match Preview loading`

### [P2] Unlock coupling not explicit
- **What:** Same `predictionUnlocked` as score/1X2 table; button does not state it uses a daily unlock.
- **Fix:** Subcopy + FAQ link even when unlocked.
- **Suggested command:** `/impeccable clarify Match Preview unlock subcopy`

### [P3] Typography and prose handling
- **What:** Flat `h2` ladder; `formatAIPreview` splits on `". "`; centered card typography diverges from fixture panel.
- **Fix:** Shared section heading classes; safer paragraph rendering.
- **Suggested command:** `/impeccable typeset Match Preview`

## Persona Red Flags

**Jordan (first-timer):** "Match Preview" opens "AI Tips" and a score pick; assumes tipster site. Star ratings with no scale legend.

**Football researcher (SSH):** No link to inputs already on the page or methodology; picks card undermines transparent modelling story.

**Casey (mobile):** Side-by-side rating columns without responsive rules; long scroll after one tap; loading text-only with no progress.

## Minor Observations

- Pre-button copy "Loading data for Match Preview..." ties to `loadingKeyPlayers`, not the preview action itself.
- Guide comment mentions `Over2.5Goals` but UI does not surface it.
- `AIInsightsContainer` has no dedicated spacing tokens; relies on `button.AIInsights` margins.

## Questions to Consider

- Should the tips-style card live on this surface at all, or only under the global "AI Tips" algorithm path?
- What if the first screen were three sentences plus "Expand team breakdown"?
- Should unlock spend be repeated on the button label even after unlock ("Uses 1 of 10 today")?
