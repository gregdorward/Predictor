import SiteHeader from "../src/components/SiteHeader";
import PageMeta from "../src/components/PageMeta";
import JsonLd from "../src/components/JsonLd";
import { FOUNDER_AUTHOR_LABEL, buildFounderPersonSchema } from "../src/seo/authorConfig";
import { FEATURED_COMPETITION_SLUGS, getCompetitionBySlug } from "../src/seo/competitionCatalog";
import { SITE_URL } from "../src/seo/pageMetaConfig";

const ABOUT_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about/#webpage`,
      url: `${SITE_URL}/about/`,
      name: "About Soccer Stats Hub",
      description:
        "Soccer Stats Hub delivers transparent football statistics, predictions and data-driven match analysis across around 50 competitions at any given time.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-GB",
      author: buildFounderPersonSchema(),
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Soccer Stats Hub",
      url: SITE_URL,
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <PageMeta />
      <JsonLd data={ABOUT_JSON_LD} />
      <SiteHeader showThemeToggle withFooter>
        <main className="StaticPage" id="ssh-content">
          <a href="/" className="HomeLink">
            Home
          </a>
          <h1>About Soccer Stats Hub</h1>
          <p>
            Soccer Stats Hub is a football statistics and predictions platform built for fans
            who want more than fixture lists. We combine deep historical data, current
            form and transparent modelling to surface BTTS trends, Over 2.5 value, correct score
            probabilities and daily multis across around 50 competitions at any given time.
          </p>
          <p>
            Our competition pages summarise league-wide markets including average goals, BTTS rates,
            corner and card lines, home advantage and team rankings, while individual fixture
            pages compare head-to-head records, recent form and model outputs side by side.
          </p>
          <p>
            Read our <a href="/methodology/">football prediction methodology</a> for more detail
            on how form, xG, PPG, BTTS, Over/Under 2.5, odds and probability models are used
            across the site. For pricing, affiliates, live scores and other common questions, see
            the <a href="/faq/">FAQ</a>.
          </p>

          <h2>Founder</h2>
          <p>
            Soccer Stats Hub was built by Greg ({FOUNDER_AUTHOR_LABEL}) to make pre-match
            research clearer: show the stats, show the model, and let readers decide. We publish
            how the engine is tested, including a public{" "}
            <a href="/articles/soccer-stats-hub-backtest-results/">backtest of match-result tips</a>,
            and we do not run bookmaker affiliate links. Odds on the site are context for research,
            not a path to sportsbook signups.
          </p>
          <p>
            Data comes from licensed football statistics feeds used across the competitions we cover.
            When we write longer analysis, drafts may be assisted by software, but every published
            piece is reviewed and edited by Greg before it goes live.
          </p>

          <h2>Editorial policy</h2>
          <ul>
            <li>Predictions are statistical models, not guarantees or financial advice.</li>
            <li>League and market tables refresh as results land; cite the page URL and date when sharing figures.</li>
            <li>We do not target competitor brand names in copy or metadata.</li>
            <li>Corrections: use the contact form in the site footer.</li>
          </ul>

          <h2>Popular competitions</h2>
          <ul>
            {FEATURED_COMPETITION_SLUGS.map((slug) => {
              const competition = getCompetitionBySlug(slug);
              if (!competition) return null;
              return (
                <li key={slug}>
                  <a href={`/competition/${competition.slug}/`}>{competition.name}</a>
                </li>
              );
            })}
          </ul>
          <p>
            <a href="/competitions/">Browse all football competitions</a>
          </p>
          <h2>What makes us different</h2>
          <ul>
            <li>Transparent predictions with the underlying stats visible on every match page</li>
            <li>Clear methodology notes explaining the main data inputs and model signals</li>
            <li>Coverage from the Premier League and Champions League to MLS, J League and more</li>
            <li>No bookmaker affiliate links — odds are research context, not a signup funnel</li>
            <li>Data-led articles and season notes on major leagues</li>
            <li>Dedicated Premier League season preview with sourced analysis and market odds</li>
          </ul>
          <h2>Responsible use</h2>
          <p>
            Soccer Stats Hub is for users aged 18 and over in jurisdictions where sports analysis
            services are permitted. Our predictions are statistical models, not financial advice.
            Always gamble responsibly. More detail is in the{" "}
            <a href="/faq/">frequently asked questions</a>.
          </p>
        </main>
      </SiteHeader>
    </>
  );
}
