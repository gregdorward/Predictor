import SiteHeader from "../../src/components/SiteHeader";
import PageMeta from "../../src/components/PageMeta";
import JsonLd from "../../src/components/JsonLd";
import { getIndexableCompetitions } from "../../src/seo/competitionCatalog";
import { SITE_URL } from "../../src/seo/pageMetaConfig";

const COMPETITIONS_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/competitions/#webpage`,
      url: `${SITE_URL}/competitions/`,
      name: "Football Competitions | SoccerStatsHub",
      description:
        "Browse betting stats, BTTS trends and Over 2.5 data for 60+ football leagues and tournaments.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-GB",
    },
  ],
};

const sortedCompetitions = [...getIndexableCompetitions()].sort((a, b) =>
  a.name.localeCompare(b.name, "en")
);

export default function CompetitionsIndexPage() {
  return (
    <>
      <PageMeta
        title="Football Competitions | SoccerStatsHub"
        description="Browse BTTS, Over 2.5, goals, corners and card stats for 60+ football leagues and tournaments on SoccerStatsHub."
        canonicalPath="/competitions"
      />
      <JsonLd data={COMPETITIONS_JSON_LD} />
      <SiteHeader showThemeToggle withFooter>
        <main className="StaticPage CompetitionsIndex">
          <a href="/" className="HomeLink">
            Home
          </a>
          <h1>Football competitions</h1>
          <p>
            League-wide betting stats for every competition we cover - average goals,
            BTTS rates, corner and card lines, home advantage and team rankings.
          </p>
          <ul className="CompetitionsIndex-list">
            {sortedCompetitions.map((competition) => (
              <li key={competition.slug}>
                <a href={`/competition/${competition.slug}/`}>{competition.name}</a>
              </li>
            ))}
          </ul>
        </main>
      </SiteHeader>
    </>
  );
}
