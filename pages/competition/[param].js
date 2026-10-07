import dynamic from "next/dynamic";
import PageMeta from "../../src/components/PageMeta";
import JourneyContentBreak from "../../src/components/JourneyContentBreak";
import JsonLd from "../../src/components/JsonLd";
import SiteHeader from "../../src/components/SiteHeader";
import CompetitionSeoShell, {
  CompetitionSeoExtras,
  buildCompetitionSeoShell,
  isCompetitionSeasonEmpty,
} from "../../src/components/CompetitionSeoShell";
import SeoPageLinks from "../../src/components/SeoPageLinks";
import {
  COMPETITION_CATALOG,
  buildCompetitionJsonLd,
  buildCompetitionMeta,
  isCompetitionIndexable,
  resolveCompetitionParam,
} from "../../src/seo/competitionCatalog";
import { fetchCompetitionData } from "../../src/seo/serverFetch";
import { buildCompetitionClientPayload } from "../../src/seo/competitionClientPayload";
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
  initialCompetitionData,
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
        <div id="ssh-content" className="journey-content">
          <CompetitionSeoShell {...seoShell} />
          <JourneyContentBreak />
          <CompetitionPage
            seasonId={seasonId}
            skipHero
            initialData={initialCompetitionData}
          />
          <JourneyContentBreak />
          <CompetitionSeoExtras {...seoShell} />
        </div>
      </SiteHeader>
    </>
  );
}

/** Align with /api/ss competition CDN freshness (10 min + SWR). */
const COMPETITION_PAGE_REVALIDATE_SECONDS = 600;

export async function getStaticPaths() {
  const paths = COMPETITION_CATALOG.filter(isCompetitionIndexable).map(
    (entry) => ({ params: { param: entry.slug } })
  );

  return {
    paths,
    // Numeric season IDs and new slugs still resolve on first request.
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
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

  const initialCompetitionData = buildCompetitionClientPayload(data);

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
      initialCompetitionData,
    },
    revalidate: COMPETITION_PAGE_REVALIDATE_SECONDS,
  };
}
