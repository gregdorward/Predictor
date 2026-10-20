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
  buildCompetitionJsonLd,
  buildCompetitionMeta,
  resolveCompetitionParam,
} from "../../src/seo/competitionCatalog";
import {
  buildCupPhaseRosterTeams,
  collectTeamIdsForRound,
  isCupPhaseTablesData,
  parseCupPhasesFromTables,
  pickDefaultPhase,
  trimCupCompetitionFixtures,
  trimCupPhaseTableViewsForClient,
} from "../../src/components/competition/cupCompetitionPhases";
import { buildCompetitionLeagueTableViews } from "../../src/components/competition/competitionLeagueTable";
import {
  fetchCompetitionData,
  fetchCompetitionOverview,
  fetchCompetitionTables,
  fetchLeagueFixtures,
  formatApiDate,
} from "../../src/seo/serverFetch";
import { buildCompetitionCrossRankInsights } from "../../src/seo/competitionCrossRankings";
import { getCompetitionSeasonNote } from "../../src/data/competitionNotes";
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
  initialCupDefaultRoundId = null,
  initialCupTablesData = null,
  initialCupFixtures = null,
  initialCupPhaseTableViews = null,
}) {
  return (
    <>
      <PageMeta
        title={meta.title}
        description={meta.description}
        canonicalPath={canonicalPath}
        noIndex={noIndex}
        follow={noIndex}
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
            initialCupDefaultRoundId={initialCupDefaultRoundId}
            initialCupTablesData={initialCupTablesData}
            initialCupFixtures={initialCupFixtures}
            initialCupPhaseTableViews={initialCupPhaseTableViews}
          />
          <JourneyContentBreak />
          <CompetitionSeoExtras {...seoShell} />
        </div>
      </SiteHeader>
    </>
  );
}

/** Align with /api/ss competition CDN freshness (10 min + SWR). */
const COMPETITION_PAGE_CACHE_CONTROL =
  "public, s-maxage=600, stale-while-revalidate=86400";

export async function getServerSideProps({ params, res }) {
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

  const [data, tablesData, leagueFixtures, overview] = await Promise.all([
    fetchCompetitionData(seasonId),
    fetchCompetitionTables(seasonId, formatApiDate(new Date())),
    fetchLeagueFixtures(seasonId),
    fetchCompetitionOverview(),
  ]);
  res.setHeader("Cache-Control", COMPETITION_PAGE_CACHE_CONTROL);

  let initialCupDefaultRoundId = null;
  let initialCupTablesData = null;
  let initialCupFixtures = null;
  let initialCupPhaseTableViews = null;
  let phaseTeamIds = null;
  let phaseRosterTeams = null;
  if (tablesData && isCupPhaseTablesData(tablesData, seasonId)) {
    initialCupTablesData = tablesData;
    initialCupFixtures = trimCupCompetitionFixtures(leagueFixtures);
    const phases = parseCupPhasesFromTables(tablesData);
    const defaultPhase = pickDefaultPhase(phases, leagueFixtures || []);
    if (defaultPhase) {
      initialCupDefaultRoundId = defaultPhase.roundId;
      if (leagueFixtures?.length) {
        const built = buildCompetitionLeagueTableViews(seasonId, tablesData, {
          roundId: defaultPhase.roundId,
          fixtures: leagueFixtures,
        });
        initialCupPhaseTableViews = trimCupPhaseTableViewsForClient(built);
      }
      phaseTeamIds = collectTeamIdsForRound(
        leagueFixtures || [],
        defaultPhase.roundId
      );
      phaseRosterTeams = buildCupPhaseRosterTeams(
        leagueFixtures || [],
        defaultPhase.roundId,
        data?.teams || data?.team || []
      );
    }
  }

  const slug = catalog?.slug || params.param;
  const canonicalPath = `/competition/${slug}`;
  const canonicalUrl = getCanonicalUrl(canonicalPath);
  const meta = buildCompetitionMeta(data, catalog);
  const ogImage = buildCompetitionOgImageUrl(slug);
  const competitionName =
    data?.english_name || data?.name || catalog?.name || "Competition";
  const ogImageAlt = `${competitionName} stats — BTTS, Over 2.5, standings and rankings | Soccer Stats Hub`;
  const seasonEmpty = !data || isCompetitionSeasonEmpty(data);
  const noIndex = seasonEmpty;
  const jsonLd =
    !data || noIndex
      ? null
      : buildCompetitionJsonLd(data, canonicalUrl, catalog, {
          ogImage,
        });
  const seasonNote = getCompetitionSeasonNote(slug);
  const seoShell = {
    ...buildCompetitionSeoShell(data, catalog, {
      phaseTeamIds,
      phaseRosterTeams,
    }),
    crossRankInsights: buildCompetitionCrossRankInsights(overview, slug),
    seasonNoteParagraphs: seasonNote?.paragraphs || [],
    seasonNoteReviewedAt: seasonNote?.reviewedAt || null,
  };

  const initialCompetitionData = data
    ? buildCompetitionClientPayload(data)
    : null;

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
      initialCupDefaultRoundId,
      initialCupTablesData,
      initialCupFixtures,
      initialCupPhaseTableViews,
    },
  };
}
