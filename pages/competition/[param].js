import dynamic from "next/dynamic";
import PageMeta from "../../src/components/PageMeta";
import JsonLd from "../../src/components/JsonLd";
import SiteHeader from "../../src/components/SiteHeader";
import CompetitionSeoShell, {
  CompetitionSeoExtras,
  buildCompetitionSeoShell,
  isCompetitionSeasonEmpty,
} from "../../src/components/CompetitionSeoShell";
import SeoPageLinks from "../../src/components/SeoPageLinks";
import {
  buildCompetitionJsonLd,
  buildCompetitionMeta,
  resolveCompetitionParam,
} from "../../src/seo/competitionCatalog";
import { fetchCompetitionData } from "../../src/seo/serverFetch";
import {
  buildCompetitionOgImageUrl,
  getCanonicalUrl,
} from "../../src/seo/pageMetaConfig";

const CompetitionPage = dynamic(
  () => import("../../src/components/CompetitionPage"),
  { ssr: false }
);

export default function CompetitionByParam({
  seasonId,
  meta,
  jsonLd,
  canonicalPath,
  ogImage,
  ogImageAlt,
  seoShell,
  noIndex,
}) {
  return (
    <>
      <PageMeta
        title={meta.title}
        description={meta.description}
        canonicalPath={canonicalPath}
        noIndex={noIndex}
        ogImage={ogImage}
        ogImageAlt={ogImageAlt}
      />
      {!noIndex && <JsonLd data={jsonLd} />}
      <SiteHeader
        showThemeToggle
        withFooter
        beforeFooter={
          <SeoPageLinks relatedLinks={seoShell.relatedLinks} />
        }
      >
        <div id="ssh-content">
          <CompetitionSeoShell {...seoShell} />
          <CompetitionPage seasonId={seasonId} skipHero />
        </div>
        <CompetitionSeoExtras {...seoShell} />
      </SiteHeader>
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
  const ogImage = buildCompetitionOgImageUrl(slug);
  const competitionName =
    data?.english_name || data?.name || catalog?.name || "Competition";
  const ogImageAlt = `${competitionName} stats — BTTS, Over 2.5, standings and rankings | Soccer Stats Hub`;
  const seasonEmpty = isCompetitionSeasonEmpty(data);
  const noIndex = seasonEmpty;
  const jsonLd = noIndex
    ? null
    : buildCompetitionJsonLd(data, canonicalUrl, catalog, {
        ogImage,
      });
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
      ogImage,
      ogImageAlt,
      seoShell,
      noIndex,
    },
  };
}
