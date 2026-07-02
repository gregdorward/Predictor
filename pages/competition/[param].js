import CompetitionPage from "../../src/components/CompetitionPage";
import PageMeta from "../../src/components/PageMeta";
import JsonLd from "../../src/components/JsonLd";
import {
  buildCompetitionJsonLd,
  buildCompetitionMeta,
  resolveCompetitionParam,
} from "../../src/seo/competitionCatalog";
import { fetchCompetitionData } from "../../src/seo/serverFetch";
import { getCanonicalUrl } from "../../src/seo/pageMetaConfig";

export default function CompetitionByParam({
  seasonId,
  initialData,
  meta,
  jsonLd,
  canonicalPath,
}) {
  return (
    <>
      <PageMeta
        title={meta.title}
        description={meta.description}
        canonicalPath={canonicalPath}
      />
      <JsonLd data={jsonLd} />
      <CompetitionPage seasonId={seasonId} initialData={initialData} />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const resolved = resolveCompetitionParam(params?.param);
  if (!resolved) {
    return { notFound: true };
  }

  const { seasonId, catalog } = resolved;

  if (/^\d+$/.test(String(params.param)) && catalog?.slug) {
    return {
      redirect: {
        destination: `/competition/${catalog.slug}/`,
        permanent: true,
      },
    };
  }

  const data = await fetchCompetitionData(seasonId);
  if (!data) {
    return { notFound: true };
  }

  const slug = catalog?.slug || params.param;
  const canonicalPath = `/competition/${slug}`;
  const canonicalUrl = getCanonicalUrl(canonicalPath);
  const meta = buildCompetitionMeta(data, catalog);
  const jsonLd = buildCompetitionJsonLd(data, canonicalUrl, catalog);

  return {
    props: {
      seasonId,
      initialData: data,
      meta,
      jsonLd,
      canonicalPath,
    },
  };
}
