import SiteHeader from "../src/components/SiteHeader";
import PageMeta from "../src/components/PageMeta";
import JsonLd from "../src/components/JsonLd";
import { SITE_URL } from "../src/seo/pageMetaConfig";

const METHODOLOGY_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/methodology/#webpage`,
  url: `${SITE_URL}/methodology/`,
  name: "Soccer Stats Hub Methodology",
  description:
    "How Soccer Stats Hub uses football data, form, xG, Poisson goal models, lambda tuning and probability outputs to support match research.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  inLanguage: "en-GB",
};

export default function MethodologyPage() {
  return (
    <>
      <PageMeta />
      <JsonLd data={METHODOLOGY_JSON_LD} />
      <SiteHeader showThemeToggle withFooter>
        <main className="StaticPage">
          <a href="/" className="HomeLink">
            Home
          </a>
          <h1>Methodology</h1>
          <p>
            Soccer Stats Hub is built to make football prediction research more
            transparent. The site combines league-level trends, team form,
            match odds, xG, PPG, goal markets and modelled probabilities so users
            can see why a fixture may be interesting.
          </p>
          <h2>Data Inputs</h2>
          <p>
            Core match and league statistics come from industry leading stat
            websites used throughout the app, including season, fixture and team
            fields. Selected competition and player ranking views use additional
            industry leading stat website metric feeds where available.
          </p>
          <h2>Prediction Signals</h2>
          <ul>
            <li>Recent form and home/away performance windows</li>
            <li>xG for, xG against and rolling xG difference</li>
            <li>PPG, win/draw/loss rates and league position context</li>
            <li>BTTS, Over 2.5, Under 2.5 and clean sheet percentages</li>
            <li>Market odds and implied probability comparisons</li>
            <li>Correct score probabilities generated from goal expectation models</li>
          </ul>
          <h2>Goal Expectation (Lambda)</h2>
          <p>
            At the heart of our fixture modelling is a pair of expected goals values,
            called lambdas: one for the home side and one for the away side. Each lambda
            estimates how many goals that team is likely to score in the specific match,
            before we turn those expectations into a full range of scoreline probabilities.
          </p>
          <p>
            We start with the league scoring environment. Season average goals are split
            into home and away baselines so a typical home attack is not treated the same
            as a typical away attack. Each team&apos;s attacking strength is then weighed
            against the opponent&apos;s defensive weakness to produce a raw goal expectation.
          </p>
          <p>
            Those raw values are tuned rather than taken at face value. Small sample sizes
            are dampened towards the league average when a team has played fewer than ten
            matches, so early-season outliers do not dominate. Missing players and lineup
            absences can nudge attack or defence lambdas up or down. xG efficiency is used
            for a light regression adjustment when a side has scored more or fewer goals
            than chance quality suggests. Rolling xG form and recent results can shift
            the final multiplier within safe bounds. A new manager flag can temporarily
            lift a side&apos;s expectation while the squad settles.
          </p>
          <p>
            On continental and international fixtures we blend the statistical expectation
            with market odds more heavily, because squad rotation, travel and knockout
            context can move results away from domestic league form. Every lambda is
            clamped to a realistic floor and ceiling before it enters the probability
            engine.
          </p>
          <h2>Poisson Distribution and Market Probabilities</h2>
          <p>
            Once home and away lambdas are set, we model each team&apos;s goals as a
            Poisson distribution. In plain terms, Poisson maths answers the question:
            if a team is expected to score 1.6 goals, how likely are 0, 1, 2, 3 or more?
            We build a score matrix by combining the home and away Poisson outcomes for
            every scoreline up to five goals each.
          </p>
          <p>
            A Dixon-Coles style adjustment is applied to low-scoring outcomes such as 0-0,
            1-0, 0-1 and 1-1. Football draws and tight games happen slightly more often
            than a naive independent Poisson model suggests, so this step keeps the
            matrix better aligned with real match results.
          </p>
          <p>
            The matrix is normalised so all scoreline probabilities sum to 100%, then
            lightly calibrated so extreme long-shot scores do not dominate the output.
            From that single matrix we derive:
          </p>
          <ul>
            <li>Home win, draw and away win probabilities</li>
            <li>Both teams to score (BTTS) yes and no</li>
            <li>Over and Under 2.5 goals</li>
            <li>The most likely correct score</li>
          </ul>
          <p>
            These model probabilities are shown alongside bookmaker implied prices on
            fixture pages so you can compare what the stats suggest with what the market
            is pricing in. The predicted scoreline on the page is the highest-probability
            outcome from the same matrix, not a separate guess.
          </p>
          <h2>How To Use The Outputs</h2>
          <p>
            Treat every table and prediction as a research aid, not a guarantee.
            Start with league and team tendencies, then check the fixture page
            for form, head-to-head data, venue splits, model probability and the
            current market price.
          </p>
          <h2>Update Cadence</h2>
          <p>
            Fixture and league data refreshes as source data updates throughout
            the day. Some competition pages and tournament previews update less
            frequently when the underlying season or editorial data changes.
          </p>
          <h2>Responsible Use</h2>
          <p>
            Soccer Stats Hub is an analytical tool. Predictions are statistical
            estimates and can be wrong. Users should follow local laws and gamble
            responsibly if they use football stats for betting research.
          </p>
        </main>
      </SiteHeader>
    </>
  );
}
