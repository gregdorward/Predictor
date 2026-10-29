import StrengthRankings from "../../src/components/StrengthRankings";
import JsonLd from "../../src/components/JsonLd";
import PageMeta from "../../src/components/PageMeta";
import { buildStrengthPreviewOverview } from "../../src/logic/strengthRankingsPreview";
import { fetchStrengthOverview } from "../../src/seo/serverFetch";
import { DATASET_LICENSE_URL, SITE_URL } from "../../src/seo/pageMetaConfig";

const CANONICAL_PATH = "/strength-rankings";
const PAGE_URL = `${SITE_URL}/strength-rankings/`;

function buildJsonLd(overview) {
  const count = overview?.global?.length || 0;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        "@id": `${PAGE_URL}#dataset`,
        name: "Football strength rankings, last six games",
        description: `Strength ratings for ${count} clubs from the last six results, weighted by opponent, starting from each league's ClubElo average.`,
        url: PAGE_URL,
        isAccessibleForFree: true,
        license: DATASET_LICENSE_URL,
        creator: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "Soccer Stats Hub",
          url: SITE_URL,
        },
        temporalCoverage: overview?.generatedAt
          ? String(overview.generatedAt).slice(0, 10)
          : undefined,
        dateModified: overview?.generatedAt || undefined,
        variableMeasured: [
          "Strength rating",
          "Matches used",
          "Result contribution",
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
            name: "Strength rankings",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };
}

export default function StrengthRankingsPage({ overview, preview, noIndex }) {
  return (
    <>
      <PageMeta canonicalPath={CANONICAL_PATH} noIndex={noIndex} />
      {!noIndex ? <JsonLd data={buildJsonLd(overview)} /> : null}
      <StrengthRankings overview={overview} preview={preview} />
    </>
  );
}

export async function getServerSideProps({ query }) {
  const preview =
    process.env.NODE_ENV !== "production" && String(query.preview || "") === "comp";
  const overview = preview
    ? buildStrengthPreviewOverview()
    : await fetchStrengthOverview();
  const ready = Boolean(overview?.global?.length || overview?.leagues?.length);

  return {
    props: {
      overview: overview || null,
      preview,
      noIndex: preview || !ready,
    },
  };
}
