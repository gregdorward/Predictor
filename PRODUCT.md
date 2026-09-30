# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Football fans and adults doing pre-match research are equally important audiences. Neither should be treated as secondary when making product or UX tradeoffs.

Typical jobs include browsing fixtures by date, comparing head-to-head and form, reading league and team market trends (BTTS, Over/Under 2.5, goals, cards, corners), running score and 1X2 predictions, building and sharing shortlists or multis, and (for some users) comparing model probability with bookmaker-implied probability. Users are expected to be 18+ where betting research applies; the product is research-oriented, not live scores or guaranteed tips.

## Product Purpose

Soccer Stats Hub helps people understand football matches before kick-off through deep, transparent statistics and modelled probabilities—not opaque picks. Success means users can see the data and reasoning behind predictions, explore competitions and fixtures with confidence, and (when subscribed) remove daily limits on predictions and premium intel.

The product is pre-match only: not a live-score or in-play alerts app.

## Positioning

Differentiators a generic odds or tips site cannot truthfully copy:

- **Depth of pre-match detail** — fixture pages expose comparative stats, charts, form, H2H, market context, and expandable model outputs rather than a single headline number.
- **Transparent modelling** — attack/defence strengths, expected goals (lambdas), Poisson-style score grids, and Dixon–Coles-style low-score adjustments are described publicly; users can inspect signals alongside outputs.
- **No bookmaker affiliate funnel** — odds appear for research and model comparison, not to drive sportsbook signups.
- **Focused coverage** — on the order of ~50 competitions at a time so prediction depth stays high rather than listing every lower division.

**Open decisions (user-flagged):** public copy for Premium pricing/plans and high-level model descriptions should be reconciled with the live app and checkout (FAQ still mentions £4.99/month and £39.99/year while Stripe exposes weekly, monthly, and yearly price IDs in code). Marketing claims about the model should stay aligned with what `SSH Tips` vs `AI Tips` actually implement.

## Operating Context

- Primary web property: [https://www.soccerstatshub.com](https://www.soccerstatshub.com) (`src/seo/pageMetaConfig.js`).
- Users browse by date, request predictions per fixture batch, drill into match detail, and use stat hubs (BTTS teams, Over 2.5, league comparisons, market reliability, etc.).
- Account sign-in and subscription state gate premium features; payments via Stripe.
- Data and prediction pipelines depend on external football statistics feeds and a separate backend (`footballServer` workspace) for server-side work—not all logic lives in this frontend repo.
- Editorial surfaces include articles, season previews, and tournament hubs alongside the core app shell on the homepage (`GuestLandingGate` + deferred client app).

## Capabilities and Constraints

**Core capabilities (confirmed in product):**

- Competition and fixture browsing with SEO-oriented static/SSR pages (`pages/competition`, `pages/fixture`, stat landing pages).
- Score predictions and 1X2 probabilities via selectable algorithms (`SSH Tips` standard model, `AI Tips` alternative).
- BTTS / Over 2.5 / goals research pages, tip lists, multis/accumulator tooling, shareable fixture URLs and shortlists, OG image export APIs.
- Premium subscription unlocking unlimited predictions, full tip lists, deeper match sections (streaks, season stats, previews beyond free allowance), and related blur-gated UI.
- Free tier: browse all fixtures; **10** predicted-score / 1X2 unlocks per calendar day (local timezone), tracked per fixture id (`src/logic/freePredictionAllowance.js`).

**Constraints:**

- Predictions are statistical aids, not guarantees; responsible-gambling messaging and BeGambleAware linkage are part of the product stance.
- Not live scores; completed results may display against predictions.
- Repository package name `predictor` is internal; public brand is **Soccer Stats Hub** only.

**Stack (incumbent):** Next.js 14 (Pages Router), React 18, Redux Toolkit, Firebase (client auth/admin/functions), Stripe, mixed Material UI v4/v5, Playwright e2e. Dev: `npm run dev`.

## Brand Commitments

- **Name:** Soccer Stats Hub (not “Predictor” in user-facing copy).
- **Voice:** Transparent, research-first, British English lean (`en-GB` on key static pages).
- **Punctuation (user-facing copy):** Do not use em dashes (—) or en dashes (–). Prefer full stops, commas, colons or parentheses to break or connect ideas.
- **Ethics:** No bookmaker affiliate links; odds shown for context; 18+ betting research framing where relevant.

## Evidence on Hand

| Asset | Location |
| --- | --- |
| About, positioning bullets | `pages/about.js` |
| FAQ (pricing, coverage, transparency) | `pages/faq.js` — treat Premium/model bullets as **may be stale** until reconciled |
| Methodology (lambdas, Poisson, inputs) | `pages/methodology.js`, articles under `pages/articles/` |
| In-app help / feature description | `src/App.js` (getting started copy) |
| Prediction implementation | `src/logic/getScorePredictions.js` and related logic |
| Premium checkout | `src/components/PremiumUpsell.js`, `src/logic/stripeCheckout.js` |
| Social / SEO defaults | `src/seo/pageMetaConfig.js` |

Do not fabricate testimonials, win rates, licensed tipster claims, or bookmaker partnerships.

## Product Principles

1. **Show the work** — surface the stats and model outputs that justify a prediction; never reduce the product to unexplained picks.
2. **Pre-match depth wins** — favour rich comparative match intel over shallow fixture lists or live-score noise.
3. **Honest limits** — free tier, Premium, and model uncertainty must be clear; no guaranteed-outcome language.
4. **Equal respect for fan and researcher** — design for curiosity and for structured pre-match decision support without privileging one persona.
5. **No affiliate distortion** — product decisions must not optimize for bookmaker conversion.

## Accessibility & Inclusion

No separate accessibility standard was confirmed beyond general web best practices. Betting-related content should remain clearly adult-oriented and paired with responsible-gambling resources where the site already links them.
