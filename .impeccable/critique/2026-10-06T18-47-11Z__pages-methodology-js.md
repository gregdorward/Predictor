---
target: /methodology/
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:/Users/greg/Development/Predictor/pages/methodology.js"
target_fingerprint: "sha256:19a6ec3a1b998faad119e0ed13ec5a5c0001bab3c668debd5315e65c17e698a0"
target_path: /Users/greg/Development/Predictor/pages/methodology.js
timestamp: 2026-10-06T18-47-11Z
slug: pages-methodology-js
---
Method: dual-agent (A: [Design review](96436de3-3860-4146-8f37-6ba5138b163e) · B: [Detector/browser](a561212c-ec3e-4430-8569-79cc7f6ce7f9))

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No “last updated” up front; cadence only at bottom |
| 2 | Match System / Real World | 2 | “Industry leading stat websites” twice without concrete scope |
| 3 | User Control and Freedom | 2 | No TOC, section ids, or breadcrumb; one mid-page article link |
| 4 | Consistency and Standards | 2 | Articles now have crumbs, dek, TOC; FAQ has lead + more links; methodology omits all |
| 5 | Error Prevention | 4 | Read-only; Responsible Use sets expectations well |
| 6 | Recognition Rather Than Recall | 2 | Seven h2s on one scroll; lambda tuning must be held until Poisson |
| 7 | Flexibility and Efficiency | n/a | Read surface |
| 8 | Aesthetic and Minimalist Design | 3 | Clean StaticPage rhythm; lambda block is dense |
| 9 | Error Recovery | 4 | No interactive failure modes |
| 10 | Help and Documentation | n/a | Page is the documentation |
| **Total** | | **22/32** | **Acceptable** (~69%) |

#### Design Specificity Verdict

**LLM assessment:** The **voice** in Goal Expectation and Poisson sections is distinctly Soccer Stats Hub (Dixon-Coles, clamping, matrix-derived 1X2). The **shell** is generic StaticPage: Home link, thin h1, stacked h2s, no lead, no related strip. After articles detail was aligned to `StaticPage--article` plus TOC, methodology no longer reads as the editorial reference; it reads like an older policy page.

**Deterministic scan:** CLI detect on `pages/methodology.js` returned **zero** findings. Live browser scan reported **18** warnings: **13×** `line-length` on `#ssh-content` paragraphs (~90 chars/line at ~48rem), plus WC26 banner contrast/size and global shell rules. Line-length is a real readability signal shared with other static pages, not a markup bug in this file alone.

**Visual overlays:** Injection on `/methodology/` succeeded during the run; overlays clustered on intro, Data Inputs, and Lambda paragraphs. Live-server was stopped afterward.

#### Overall Impression

Methodology still **earns trust in the math sections** but **loses the editorial race** to your own articles and FAQ chrome. The biggest opportunity is to **give the canonical doc the same navigation and framing** you just shipped on long-form articles, without dumbing the lambda narrative.

#### What's Working

1. **Poisson section** explains lambdas in plain terms before matrix mechanics.
2. **Model honesty** (sample dampening, continental blend, “not a separate guess” on predicted score) matches product principles.
3. **StaticPage typography** keeps attention on prose with no decorative noise.

#### Priority Issues

**[P1] Editorial pattern drift vs articles and FAQ**

- **Why it matters:** Users sent from FAQ for “full detail” land on a plainer page than `/articles/how-we-predict-a-game/`.
- **Fix:** Reuse article patterns: lead (`StaticPage-lead`), TOC with section ids (≥4 sections), breadcrumb, `StaticPage-moreLinks` footer.
- **Suggested command:** `/impeccable layout pages/methodology.js`

**[P1] Data Inputs copy breaks transparency promise**

- **Why it matters:** Vague sourcing immediately after a transparency intro triggers skepticism.
- **Fix:** Align with FAQ specificity (competition-scoped fixtures, what feeds exist) without inventing vendor names if policy forbids.
- **Suggested command:** `/impeccable clarify pages/methodology.js`

**[P2] Lambda section cognitive wall**

- **Why it matters:** Four dense paragraphs mix tuning rules; highest intrinsic load on the site.
- **Fix:** h3 chunks or a short numbered list for adjustment rules; one-sentence “what lambda means on fixture pages” up front.
- **Suggested command:** `/impeccable distill pages/methodology.js`

**[P2] Weak page framing**

- **Why it matters:** H1 “Methodology” undersells stakes; meta description is richer than on-page framing.
- **Fix:** `StaticPage-lead` dek; consider clearer h1 or eyebrow.
- **Suggested command:** `/impeccable typeset pages/methodology.js`

**[P3] One-way discovery graph**

- **Why it matters:** Link to the fan article mid-body; no related next steps at the end.
- **Fix:** Footer more-links matching FAQ (FAQ, article, competitions, responsible gambling).
- **Suggested command:** `/impeccable polish pages/methodology.js`

#### Persona Red Flags

**Jordan (first-timer):** Data Inputs offers no concrete picture; Prediction Signals assumes BTTS, Over 2.5, PPG without gloss; no “start here” beyond scroll.

**Sam (accessibility):** Seven h2s with no skip/TOC; no section ids for deep links from FAQ.

**Casey (mobile):** Lambda wall before Poisson payoff; no bottom related strip to re-orient after interruption.

#### Minor Observations

- `id="ssh-content"` on `<main>` vs articles inner wrapper may affect journey conventions.
- Update Cadence accurate but buried.
- Opening paragraph lists markets the body never revisits.

#### Questions to Consider

- Should methodology be *more* structured than articles because it is source of truth?
- Is the fan article the default entry and methodology the appendix, or the reverse?
- Can Data Inputs be specific without naming vendors?
