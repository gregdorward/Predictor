import CompetitionsCompare from "../../../src/components/CompetitionsCompare";
import JsonLd from "../../../src/components/JsonLd";
import PageMeta from "../../../src/components/PageMeta";
import { COMPARISON_MIN_ROWS } from "../../../src/seo/competitionOverviewData";
import { fetchCompetitionOverview } from "../../../src/seo/serverFetch";
import { SITE_URL } from "../../../src/seo/pageMetaConfig";

const CANONICAL_PATH = "/competitions/compare";
const PAGE_URL = `${SITE_URL}/competitions/compare/`;

function buildJsonLd(overview) {
  const count = overview?.competitions?.length || 0;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        "@id": `${PAGE_URL}#dataset`,
        name: "Football league comparison: goals, BTTS, cards and corners",
        description: `Current-season averages for ${count} football leagues, covering goals per game, both teams to score, over and under 2.5 goals, cards, corners and home advantage.`,
        url: PAGE_URL,
        isAccessibleForFree: true,
        creator: { "@id": `${SITE_URL}/#organization` },
        temporalCoverage: overview?.generatedAt
          ? String(overview.generatedAt).slice(0, 10)
          : undefined,
        dateModified: overview?.generatedAt || undefined,
        variableMeasured: [
          "Goals per game",
          "Both teams to score",
          "Over 2.5 goals",
          "Under 2.5 goals",
          "Cards per game",
          "Corners per game",
          "Home wins",
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Competitions",
            item: `${SITE_URL}/competitions/`,
          },
          { "@type": "ListItem", position: 3, name: "Compare", item: PAGE_URL },
        ],
      },
    ],
  };
}

export default function CompetitionsComparePage({ overview, noIndex }) {
  return (
    <>
      <PageMeta canonicalPath={CANONICAL_PATH} noIndex={noIndex} />
      {!noIndex ? <JsonLd data={buildJsonLd(overview)} /> : null}
      <CompetitionsCompare overview={overview} />
    </>
  );
}

export async function getServerSideProps() {
  const overview = await fetchCompetitionOverview();
  const count = overview?.competitions?.length || 0;

  return {
    props: {
      overview: overview || null,
      // A near-empty comparison is not worth indexing; the page still renders
      // for anyone who lands on it.
      noIndex: count < COMPARISON_MIN_ROWS,
    },
  };
}
