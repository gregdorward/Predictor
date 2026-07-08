import SiteHeader from "../src/components/SiteHeader";
import PageMeta from "../src/components/PageMeta";
import JsonLd from "../src/components/JsonLd";
import { FEATURED_COMPETITION_SLUGS, getCompetitionBySlug } from "../src/seo/competitionCatalog";
import { SITE_URL } from "../src/seo/pageMetaConfig";

const ABOUT_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about/#webpage`,
      url: `${SITE_URL}/about/`,
      name: "About SoccerStatsHub",
      description:
        "SoccerStatsHub delivers transparent football statistics, predictions and betting insights across 50+ competitions.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-GB",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "SoccerStatsHub",
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
        <main className="StaticPage">
          <a href="/" className="HomeLink">
            Home
          </a>
          <h1>About SoccerStatsHub</h1>
          <p>
            SoccerStatsHub is a football statistics and predictions platform built for fans and
            bettors who want more than fixture lists. We combine deep historical data, current
            form and transparent modelling to surface BTTS trends, Over 2.5 value, correct score
            probabilities and daily multis across more than 50 competitions.
          </p>
          <p>
            Our competition pages summarise league-wide markets including average goals, BTTS rates,
            corner and card lines, home advantage and team rankings, while individual fixture
            pages compare head-to-head records, recent form and model outputs side by side.
          </p>
          <p>
            Read our <a href="/methodology/">football prediction methodology</a> for more detail
            on how form, xG, PPG, BTTS, Over/Under 2.5, odds and probability models are used
            across the site.
          </p>
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
            <li>Tournament hubs with curated news and previews, including FIFA World Cup 2026</li>
            <li>AI-generated season previews for major European leagues (BETA)</li>
          </ul>
          <h2>Responsible use</h2>
          <p>
            SoccerStatsHub is for users aged 18 and over in jurisdictions where sports analysis
            services are permitted. Our predictions are statistical models, not financial advice.
            Always gamble responsibly.
          </p>
        </main>
      </SiteHeader>
    </>
  );
}
