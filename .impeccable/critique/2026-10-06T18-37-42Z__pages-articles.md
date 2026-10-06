---
target: /articles/
total_score: 19
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
target_identity: "file:/Users/greg/Development/Predictor/pages/articles"
timestamp: 2026-10-06T18-37-42Z
slug: pages-articles
---
Method: dual-agent (A: [Design review](60846092-59cc-4693-8402-4f3903d74175) · B: [Detector/browser](bdbd6c72-a2ab-43a3-9159-492196d47e9c))

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Breadcrumb and date lines work; no reading progress or in-page section map |
| 2 | Match System / Real World | 4 | en-GB dates, honest methodology voice, fan-readable model language |
| 3 | User Control and Freedom | 3 | Linear read is fine; Share errors silent; no back-to-top on long pieces |
| 4 | Consistency and Standards | 2 | `.Articles` shell diverges from `.StaticPage` on `/methodology/` and `/faq/` |
| 5 | Error Prevention | 3 | Read-only surface; invalid slugs 404; clipboard/share edge cases unspoken |
| 6 | Recognition Rather Than Recall | 2 | `section.id` in data never exposed; no TOC on 7-section articles |
| 7 | Flexibility and Efficiency | n/a | Read surface; shortcuts not expected |
| 8 | Aesthetic and Minimalist Design | 2 | Awards layout strong; ad journey breaks and dense list deks add noise |
| 9 | Error Recovery | 2 | Share failure swallowed; no fallback when Web Share unavailable |
| 10 | Help and Documentation | n/a | The article is the help |
| **Total** | | **19/32** | **Acceptable** |

#### Design Specificity Verdict

**LLM assessment:** The **body content** is unmistakably Soccer Stats Hub: methodology that names real product behavior, backtest pieces with flat-stake rules, and `ArticleAwards` as a data-ceremony template for tournaments. The **chrome** is only half bespoke: orange eyebrow, navy type, and ~46rem column match brand, but the index reads like a generic sports blog list until you read the deks, and the route uses app-dense `.Articles` typography instead of DESIGN.md’s editorial reading lane.

**Deterministic scan:** CLI `impeccable detect` on `pages/articles` and `src/components/articles` returned **zero** static findings (clean markup pass). Live browser injection on `/articles/` surfaced **19** runtime warnings: low contrast on eyebrow and WC26 badge (global), **7×** undersized UI text on category labels (~10px), dek **line-length**, tight leading on two list titles, plus site-wide slop rules (`overused-font`, `layout-transition`, `dark-glow`). Two `text-occlusion` hits were **overlay false positives**. Articles-specific signal: eyebrow + list labels are too small for comfortable scan on index.

**Visual overlays:** Injection on the articles index succeeded during the assessment run; overlays highlighted contrast, type size, and line-length issues on the hero and list. The live-server was stopped after the run, so overlays are not guaranteed to still be visible in your browser.

#### Overall Impression

You have **strong editorial substance** trapped in **second-class reading chrome**. The awards and methodology JSON prove the product voice; the index and prose shell undershoot the StaticPage standard you already ship elsewhere. The single biggest opportunity is to **unify the editorial lane** (type, width, section navigation) and **stop fixture-page ad rhythm from interrupting long reads**.

#### What's Working

1. **Trust-building copy and structure** — Methodology and backtest articles tie claims to inspectable product behavior (model vs market, replay rules), not opaque tipster SEO.
2. **`ArticleAwards`** — Winner panel, stats grid, and contenders rhythm feel like matchday data storytelling, not a Medium clone.
3. **SEO and structure plumbing** — JSON-LD, `PageMeta`, breadcrumbs, and `id="ssh-content"` show intentional discoverability and journey integration.

#### Priority Issues

**[P0] Article body typography below the editorial spec**
- **Why it matters:** Long reads (methodology, backtest) at ~0.75–0.8125rem feel like app UI, not the 0.98rem / 1.6 reading voice on StaticPage. Fatigue hurts comprehension and brand trust on your most important transparency content.
- **Fix:** Align `ArticleProse` / `.Articles` detail with StaticPage reading tokens (400 weight, ~0.98rem, 1.6 line-height), or wrap detail in `.StaticPage` with article modifiers.
- **Suggested command:** `/impeccable typeset pages/articles`

**[P1] No section navigation despite section IDs in content**
- **Why it matters:** Seven-section methodology forces scroll-and-memory; researchers cannot jump to “Poisson” or “lambdas” without hunting.
- **Fix:** Render `id` on sections; add a compact TOC when `sections.length >= 4`.
- **Suggested command:** `/impeccable distill src/components/articles/ArticlePage.js`

**[P1] Editorial shell inconsistent with `/methodology/`**
- **Why it matters:** Users crossing from nav between Articles and Methodology get different column voice for the same job (explain the model).
- **Fix:** Shared editorial wrapper or token module used by both routes.
- **Suggested command:** `/impeccable adapt pages/methodology.js pages/articles`

**[P2] Journey ad slots mid-article**
- **Why it matters:** `JourneyContentBreak` inserts fixture-page ad rhythm into prose, breaking single-focus reading on 3,000-word pieces.
- **Fix:** Reduce breaks on prose, relocate below outro, or gate on content height.
- **Suggested command:** `/impeccable quieter src/components/articles/ArticleProse.js`

**[P3] Flat index at six items (will not scale)**
- **Why it matters:** `heroLabel` exists on each row but is not grouped; six long deks are borderline working-memory overload with no “start here.”
- **Fix:** Group by label or add light filter chips (Methodology, Product, Awards).
- **Suggested command:** `/impeccable layout src/components/articles/ArticlesIndex.js`

#### Persona Red Flags

**Jordan (first-timer):** Six peer list choices with no “start here”; methodology drops into lambdas/Dixon-Coles without a TOC or glossary; unclear how Articles relates to the standalone Methodology page.

**Sam (accessibility):** “Link copied” from Share not in an `aria-live` region; index category labels flagged at ~10px in browser detect; verify table scroll focus order in `ArticleProse__tableWrap`.

**Casey (mobile):** Body type smaller than FAQ/methodology on phone before desktop scaling; centered index header vs left-aligned detail is a small mode shift; awards stats grid may squeeze on narrow widths.

#### Minor Observations

- Index `PageMeta` vs `ARTICLES_JSON_LD` duplicate descriptions (drift risk).
- Paragraph React keys from `slice(0, 48)` can collide.
- Inline markup supports italic only; links live in Related footer.
- Breadcrumb stops at “Articles,” not current title.
- Share control lacks emphasized `:focus-visible` styling in component CSS.

#### Questions to Consider

- Should Articles **replace or complement** `/methodology/` as the canonical trust path—and should the UI say so explicitly?
- Is mid-article journey ad density a deliberate revenue trade on methodology completion?
- Should the index **visually distinguish** awards ceremony pieces from methodology before click?
