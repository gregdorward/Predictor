import MarketReliabilityIndex from "../../src/components/MarketReliabilityIndex";
import JsonLd from "../../src/components/JsonLd";
import PageMeta from "../../src/components/PageMeta";
import { MRI_MIN_ROWS } from "../../src/seo/marketReliabilityData";
import { fetchMarketReliabilityOverview } from "../../src/seo/serverFetch";
import {
  SITE_URL,
  buildMarketReliabilityOgImageUrl,
} from "../../src/seo/pageMetaConfig";

const CANONICAL_PATH = "/market-reliability";
const PAGE_URL = `${SITE_URL}/market-reliability/`;
const OG_IMAGE = buildMarketReliabilityOgImageUrl();
const OG_IMAGE_ALT =
  "Market Reliability Index - favourite wins, upsets and predictability by league | Soccer Stats Hub";

function buildJsonLd(overview) {
  const count = overview?.leagues?.length || 0;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        "@id": `${PAGE_URL}#dataset`,
        name: "Football market reliability index by league",
        description: `Favourite win, draw and upset rates across ${count} football leagues, plus team-level price reliability from current-season results.`,
        url: PAGE_URL,
        isAccessibleForFree: true,
        creator: { "@id": `${SITE_URL}/#organization` },
        temporalCoverage: overview?.generatedAt
          ? String(overview.generatedAt).slice(0, 10)
          : undefined,
        dateModified: overview?.generatedAt || undefined,
        variableMeasured: [
          "Favourite win rate",
          "Favourite upset rate",
          "Favourite draw rate",
          "Predictability score",
          "Draw rate",
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
          {
            "@type": "ListItem",
            position: 3,
            name: "Market Reliability",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };
}

export default function MarketReliabilityPage({ overview, noIndex }) {
  return (
    <>
      <PageMeta
        canonicalPath={CANONICAL_PATH}
        noIndex={noIndex}
        ogImage={OG_IMAGE}
        ogImageAlt={OG_IMAGE_ALT}
      />
      {!noIndex ? <JsonLd data={buildJsonLd(overview)} /> : null}
      <MarketReliabilityIndex overview={overview} />
    </>
  );
}

export async function getServerSideProps() {
  const overview = await fetchMarketReliabilityOverview();
  const count = overview?.leagues?.length || 0;

  return {
    props: {
      overview: overview || null,
      noIndex: count < MRI_MIN_ROWS,
    },
  };
}
