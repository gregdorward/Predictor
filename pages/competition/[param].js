import dynamic from "next/dynamic";
import PageMeta from "../../src/components/PageMeta";
import JsonLd from "../../src/components/JsonLd";
import CompetitionSeoShell, {
  buildCompetitionSeoShell,
} from "../../src/components/CompetitionSeoShell";
import SeoPageLinks from "../../src/components/SeoPageLinks";
import {
  buildCompetitionJsonLd,
  buildCompetitionMeta,
  resolveCompetitionParam,
} from "../../src/seo/competitionCatalog";
import { fetchCompetitionData } from "../../src/seo/serverFetch";
import { getCanonicalUrl } from "../../src/seo/pageMetaConfig";

const CompetitionPage = dynamic(
  () => import("../../src/components/CompetitionPage"),
  { ssr: false }
);

export default function CompetitionByParam({
  seasonId,
  meta,
  jsonLd,
  canonicalPath,
  seoShell,
}) {
  return (
    <>
      <PageMeta
        title={meta.title}
        description={meta.description}
        canonicalPath={canonicalPath}
      />
      <JsonLd data={jsonLd} />
      <CompetitionSeoShell {...seoShell} />
      <SeoPageLinks relatedLinks={seoShell.relatedLinks} ssrOnly />
      <CompetitionPage
        seasonId={seasonId}
        skipHero
        relatedLinks={seoShell.relatedLinks}
      />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const resolved = resolveCompetitionParam(params?.param);
  if (!resolved) {
    return { notFound: true };
  }

  if (resolved.redirectTo) {
    return {
      redirect: {
        destination: resolved.redirectTo,
        permanent: true,
      },
    };
  }

  const { seasonId, catalog } = resolved;

  const data = await fetchCompetitionData(seasonId);
  if (!data) {
    return { notFound: true };
  }

  const slug = catalog?.slug || params.param;
  const canonicalPath = `/competition/${slug}`;
  const canonicalUrl = getCanonicalUrl(canonicalPath);
  const meta = buildCompetitionMeta(data, catalog);
  const jsonLd = buildCompetitionJsonLd(data, canonicalUrl, catalog);
  const seoShell = buildCompetitionSeoShell(data, catalog);

  // Do not serialize the full FootyStats competition payload into __NEXT_DATA__.
  // Team objects alone can be multi‑MB and push pages over Googlebot's 2 MB limit.
  // CompetitionPage (ssr:false) fetches the interactive payload client-side.
  return {
    props: {
      seasonId,
      meta,
      jsonLd,
      canonicalPath,
      seoShell,
    },
  };
}
