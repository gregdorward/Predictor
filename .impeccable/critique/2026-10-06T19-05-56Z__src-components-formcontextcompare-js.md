---
target: homepage Match Context (fixture expanded)
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/Users/greg/Development/Predictor/src/components/FormContextCompare.js"
target_fingerprint: "sha256:3fcbd4d437eacb9cff3a5ffd598a90a6499db9c837ea12280508aad2ed0a97d5"
target_path: /Users/greg/Development/Predictor/src/components/FormContextCompare.js
timestamp: 2026-10-06T19-05-56Z
slug: src-components-formcontextcompare-js
---
Method: dual-agent (A: [Design review](9464efc1-e29b-449e-8edf-a60fa3f9122f) · B: [Detector/browser](29230dcb-e004-491f-b75c-136b161e5967))

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | `aria-expanded` on collapsible; no loading state for context metrics |
| 2 | Match System / Real World | 2 | O2.5, PPG, top half, blowout jargon without plain-language bridge |
| 3 | User Control and Freedom | 3 | Clear collapse exit; no in-panel navigation |
| 4 | Consistency and Standards | 3 | Matches Team Streaks ☰ pattern; icon still reads as menu |
| 5 | Error Prevention | 2 | Em dash placeholders help; asymmetric completeness not explained |
| 6 | Recognition Rather Than Recall | 2 | 14 labels per column; user must recall definitions and direction |
| 7 | Flexibility and Efficiency | 2 | No metric-row compare, filter, or jump links |
| 8 | Aesthetic and Minimalist Design | 2 | 28 equal-weight rows when open |
| 9 | Error Recovery | 3 | Empty column copy is clear |
| 10 | Help and Documentation | 1 | One-line note only; no per-metric help |
| **Total** | | **23/40** | **Acceptable** |

#### Design Specificity Verdict

**LLM assessment:** Metrics are distinctly SSH (rest/congestion, schedule strength, game-state script, variance). The shell is generic: twin definition lists behind the same navy collapsible as streaks, with no fixture-native comparison (aligned rows, deltas, home/away chroma).

**Deterministic scan:** CLI `impeccable detect` on `FormContextCompare.js` returned **zero** static findings. Live inject on expanded Match Context ([Assessment B](29230dcb-e004-491f-b75c-136b161e5967)): **59** scoped warnings in `.FormContextCompare` (mostly undersized/tiny text from **~12.24px** base inherited via `.ExpandingStats { font-size: 0.9em }`); **28** metric rows in DOM. Page-wide inject noise is expected on the full homepage shell.

**Visual (logged-in, Farnham Town v Truro City):** Match Context expanded below Market Value / Lineups. Orange section bars, grey disclaimer, two columns with vertical divider. Rest/congestion identical for both sides in this fixture; O2.5 and schedule differ. Long scroll before late metrics (game state, variance).

#### Overall Impression

Strong **data product**, weak **comparison UX**. Users who already speak betting analytics can mine it; everyone else opens a wall after one good progressive-disclosure click.

#### What's Working

1. Section-level collapse keeps the expanded fixture scannable.
2. Side-by-side home/away columns match the fixture mental model.
3. Value strings wrap safely (`overflow-wrap`) on long congestion / points-from-position lines.

#### Priority Issues

**[P0] Cross-team comparison is a memory task**

- **Why:** Team-first columns force 14 left-right saccades per question (“who has the easier schedule?”).
- **Fix:** Metric-first rows (label | home | away) or comparison table with sticky label column.
- **Suggested command:** `/impeccable layout src/components/FormContextCompare.js`

**[P1] Flat 14-metric wall**

- **Why:** Exceeds chunk size; fatigue on mobile when columns stack (~28 rows).
- **Fix:** Group under subheads (Fatigue, Goal trends, Schedule, Match script, Variance) with ≤5 items each.
- **Suggested command:** `/impeccable shape Match Context`

**[P1] Jargon and opaque value grammar**

- **Why:** “O2.5 last 5 / 10”, “Last 5 Opposition PPG Avg / all”, congestion parentheticals slow scan.
- **Fix:** Plain labels, optional `title` glosses, unify slash patterns.
- **Suggested command:** `/impeccable clarify FormContextCompare`

**[P2] `Match Context ☰` trigger**

- **Why:** ☰ implies navigation, not expand; duplicated on streaks.
- **Fix:** Chevron + Show/Hide copy; keep accent bar.
- **Suggested command:** `/impeccable polish FormContextCompare collapsible trigger`

**[P2] `locked` prop unused**

- **Why:** Team Streaks paywalls; Match Context does not, yet shares affordances. Future paywall will feel bolted on.
- **Fix:** Align lock/teaser with streaks or remove dead prop.
- **Suggested command:** `/impeccable harden FormContextCompare`

#### Persona Red Flags

**Alex (power user):** No aligned compare rows, export, or pin of schedule block; must scroll the full list every time.

**Jordan (first-timer):** O2.5 and blowout labels without “what good looks like”; disclaimer does not decode rest labels.

**Sam (mobile):** Stacked columns after `auto-fit`; compound values wrap to 3+ lines per row.

#### Minor Observations

- Note uses hyphen not en dash; product prefers commas or parentheses.
- No `tabular-nums` on values.
- Display-only behaviour: addressed in note copy (post-critique follow-up).
- Column `border-left` at ≥640px is a legacy divider pattern.

#### Questions to Consider

- Which three metrics belong above the fold?
- Should metric-row-first be the default for all compare blocks on the fixture card?
- Is a one-line synthesis (“Home fresher; away softer schedule”) out of scope for display-only data?
