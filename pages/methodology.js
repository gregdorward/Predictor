import SiteHeader from "../src/components/SiteHeader";
import PageMeta from "../src/components/PageMeta";
import JsonLd from "../src/components/JsonLd";
import ArticleTableOfContents from "../src/components/articles/ArticleTableOfContents";
import ArticleShareButton from "../src/components/articles/ArticleShareButton";
import { SITE_URL } from "../src/seo/pageMetaConfig";

const METHODOLOGY_DEK =
  "A prediction on Soccer Stats Hub is one chain of steps: completed matches in the competition, attack and defence strengths, expected goals for each side, then a score grid you can read into 1X2, BTTS and Over 2.5. This page is that chain in order. Figures refresh through the day as results and odds land.";

const METHODOLOGY_SECTIONS = [
  { id: "data-inputs", heading: "What we load" },
  { id: "prediction-signals", heading: "What the model reads" },
  { id: "goal-expectation", heading: "Expected goals (lambda)" },
  { id: "poisson-markets", heading: "The score grid" },
  { id: "using-outputs", heading: "Using it on the site" },
  { id: "update-cadence", heading: "When numbers refresh" },
  { id: "responsible-use", heading: "Responsible use" },
];

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

const RELATED_LINKS = [
  { label: "FAQ", href: "/faq/" },
  { label: "How we predict a game", href: "/articles/how-we-predict-a-game/" },
  {
    label: "Backtest results",
    href: "/articles/soccer-stats-hub-backtest-results/",
  },
  {
    label: "What sets Soccer Stats Hub apart",
    href: "/articles/what-sets-soccer-stats-hub-apart/",
  },
  { label: "Articles", href: "/articles/" },
  { label: "About", href: "/about/" },
  { label: "Competitions", href: "/competitions/" },
  { label: "BTTS fixtures", href: "/bttsfixtures/" },
  { label: "Over 2.5 fixtures", href: "/fixtureshigh/" },
];

export default function MethodologyPage() {
  return (
    <>
      <PageMeta />
      <JsonLd data={METHODOLOGY_JSON_LD} />
      <SiteHeader showThemeToggle withFooter>
        <main className="StaticPage StaticPage--article">
          <nav className="Articles__crumbs" aria-label="Breadcrumb">
            <a href="/" className="HomeLink">
              Home
            </a>
            <span className="Articles__crumbSep" aria-hidden="true">
              /
            </span>
            <span aria-current="page">Methodology</span>
          </nav>

          <header className="Articles__header">
            <h1 className="Articles__title">Methodology</h1>
            <p className="Articles__dek">{METHODOLOGY_DEK}</p>
            <div className="Articles__headerRow">
              <ArticleShareButton title="Methodology" text={METHODOLOGY_DEK} />
            </div>
          </header>

          <div id="ssh-content" className="journey-content Articles__content">
            <ArticleTableOfContents sections={METHODOLOGY_SECTIONS} />

            <h2 id="data-inputs" className="ArticleProse__heading">
              What we load
            </h2>
            <p>
              Match and league data come from the feeds that power the fixture
              browser: schedules, results, season and team fields, and bookmaker
              prices where we show them. Rankings and some competition pages pull
              extra metrics when that competition has a feed.
            </p>
            <p>
              Predictions are built from completed fixtures in the same competition
              as the match you are looking at. We do not blend league results with
              cup ties or friendlies when we shape a club&apos;s attacking or
              defensive picture for a league game. That like-for-like rule is
              deliberate, and it matches the walkthrough in{" "}
              <a href="/articles/how-we-predict-a-game/">How we predict a game</a>.
            </p>

            <h2 id="prediction-signals" className="ArticleProse__heading">
              What the model reads
            </h2>
            <p>Before kick-off, typical inputs include:</p>
            <ul className="ArticleProse__list">
              <li>Recent form and home or away performance windows</li>
              <li>xG for, xG against and rolling xG difference</li>
              <li>Points per game, win-draw-loss rates and league position</li>
              <li>BTTS, Over 2.5, Under 2.5 and clean sheet rates</li>
              <li>Market odds and implied probability, shown for comparison on the page</li>
              <li>
                Correct score probabilities from the goal expectation step below
              </li>
            </ul>

            <h2 id="goal-expectation" className="ArticleProse__heading">
              Expected goals (lambda)
            </h2>
            <p>
              If you expand a fixture, the expected goals rate for each team is
              what we call lambda: one number for the home side, one for the away
              side. The predicted scoreline and the home-draw-away percentages
              all come from the same score grid those lambdas produce. There is
              no second guess sitting alongside the matrix.
            </p>

            <h3 className="ArticleProse__subheading">Baselines</h3>
            <p>
              We start from the league scoring environment. Season averages are
              split into home and away baselines so a typical home attack is not
              treated like a typical away attack. Attack strength for the fixture
              is weighed against the opponent&apos;s defensive record to produce a
              raw goal expectation for each side.
            </p>

            <h3 className="ArticleProse__subheading">Adjustments</h3>
            <p>Raw expectations are tuned before they enter the grid:</p>
            <ul className="ArticleProse__list">
              <li>
                Fewer than ten completed matches in the competition: pull strengths
                toward the league average so early-season spikes do not dominate.
              </li>
              <li>
                Missing players or lineup absences: small nudges to attack or
                defence lambdas when the data supports it.
              </li>
              <li>
                xG efficiency: light regression when goals scored diverge from chance
                quality over the sample we hold.
              </li>
              <li>
                Rolling xG and recent results: shift the final multiplier within
                fixed bounds.
              </li>
              <li>
                New manager flag: short-lived lift while the squad settles, when
                flagged in the data.
              </li>
            </ul>

            <h3 className="ArticleProse__subheading">
              Continental and international fixtures
            </h3>
            <p>
              For continental and international matches we lean more on market
              odds in the blend, because rotation, travel and knockout context
              can pull results away from domestic league form. Every lambda is
              clamped to a floor and ceiling before it enters the probability
              engine.
            </p>

            <h2 id="poisson-markets" className="ArticleProse__heading">
              The score grid
            </h2>
            <p>
              Once home and away lambdas are set, goals for each side are treated
              as a Poisson process. A lambda of 1.6 means the model assigns
              separate probabilities to 0, 1, 2, 3 and more goals. Home and away
              distributions are combined into a score matrix up to five goals
              each way.
            </p>
            <p>
              Low-scoring cells (0-0, 1-0, 0-1, 1-1) get a Dixon-Coles style
              adjustment. Draws and tight games occur a bit more often than a
              naive independent Poisson grid would imply.
            </p>
            <p>
              The matrix is normalised to 100% and lightly calibrated so extreme
              long shots do not swamp the output. From that one grid we read:
            </p>
            <ul className="ArticleProse__list">
              <li>Home win, draw and away win probabilities</li>
              <li>Both teams to score (BTTS) yes and no</li>
              <li>Over and Under 2.5 goals</li>
              <li>The most likely correct score</li>
            </ul>
            <p>
              On the fixture page those model probabilities sit next to bookmaker
              implied prices. The headline predicted score is the
              highest-probability cell in the same matrix, not a separate model.
            </p>

            <h2 id="using-outputs" className="ArticleProse__heading">
              Using it on the site
            </h2>
            <p>
              This is close to how Soccer Stats Hub is used in practice: one
              match, one model read, one market price. Open the fixture, compare
              model probability with the bookmaker-implied price, then decide
              whether the tip deserves more attention. League hubs and tables
              give you the wider picture; the match view is where the model meets
              the market for that kick-off.
            </p>
            <p>
              Customise Tips narrows the board by odds range, value edge, form,
              probability or preset when you want a shorter list to work through.
              For a longer narrative of the same pipeline, read{" "}
              <a href="/articles/how-we-predict-a-game/">How we predict a game</a>.
              For how selections have behaved when replayed at scale, see{" "}
              <a href="/articles/soccer-stats-hub-backtest-results/">
                Backtest results
              </a>
              .
            </p>

            <h2 id="update-cadence" className="ArticleProse__heading">
              When numbers refresh
            </h2>
            <p>
              Fixture and league data refresh as source feeds update through the
              day. Competition pages and tournament previews may move more slowly
              when the underlying season or editorial copy changes.
            </p>

            <h2 id="responsible-use" className="ArticleProse__heading">
              Responsible use
            </h2>
            <p>
              Soccer Stats Hub is an analytical tool. Predictions are statistical
              estimates and can be wrong. The aim is probability beside price,
              context beside prediction, and enough detail for you to disagree
              with the tip if the match picture does not convince you.
            </p>
            <p>
              If you use football stats for betting research, follow local laws,
              only stake what you can afford to lose, and keep it to adults aged
              18 and over. See{" "}
              <a
                href="https://www.begambleaware.org/"
                rel="noopener noreferrer"
              >
                BeGambleAware
              </a>{" "}
              for support.
            </p>

            <footer className="Articles__related">
              <h2 className="Articles__relatedTitle">Related</h2>
              <ul className="Articles__relatedList">
                {RELATED_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </footer>
          </div>
        </main>
      </SiteHeader>
    </>
  );
}
