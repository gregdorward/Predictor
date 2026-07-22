import dynamic from "next/dynamic";
import PageMeta from "../../src/components/PageMeta";
import JsonLd from "../../src/components/JsonLd";
import FixtureSeoShell from "../../src/components/FixtureSeoShell";
import SiteHeader from "../../src/components/SiteHeader";
import {
  buildFixtureJsonLd,
  buildFixtureMeta,
  buildFixtureSlug,
  buildFixtureUrl,
  isFixtureFinished,
  parseFixtureParam,
} from "../../src/seo/fixtureSlug";
import { fetchMatchSnapshot, fetchUpcomingFixtureLinks } from "../../src/seo/serverFetch";
import { getCanonicalUrl } from "../../src/seo/pageMetaConfig";
import { getCompetitionById, getCompetitionUrl } from "../../src/seo/competitionCatalog";
import SeoPageLinks from "../../src/components/SeoPageLinks";

const TeamPage = dynamic(() => import("../../src/components/Team"), {
  ssr: false,
});

function formatKickOff(dateUnix) {
  if (!dateUnix) return null;
  const date = new Date(Number(dateUnix) * 1000);
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FixtureByParam({
  matchId,
  meta,
  jsonLd,
  canonicalPath,
  seoShell,
  noIndex,
  relatedFixtureLinks = [],
}) {
  return (
    <>
      <PageMeta
        title={meta.title}
        description={meta.description}
        canonicalPath={canonicalPath}
        noIndex={noIndex}
      />
      {!noIndex && <JsonLd data={jsonLd} />}
      <SiteHeader showThemeToggle withFooter>
        <FixtureSeoShell {...seoShell} ssrOnly />
        {!noIndex && (
          <SeoPageLinks
            relatedLinks={relatedFixtureLinks}
            relatedLabel="Upcoming fixtures"
            ssrOnly
          />
        )}
        <TeamPage matchId={matchId} seoShell={seoShell} />
      </SiteHeader>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const parsed = parseFixtureParam(params?.param);
  if (!parsed) {
    return { notFound: true };
  }

  const { matchId, isNumericOnly } = parsed;
  const snapshot = await fetchMatchSnapshot(matchId);
  if (!snapshot?.id) {
    return { notFound: true };
  }

  const meta = buildFixtureMeta(snapshot);
  const slug = buildFixtureSlug(meta.home, meta.away, matchId);

  if (isNumericOnly) {
    return {
      redirect: {
        destination: buildFixtureUrl(meta.home, meta.away, matchId),
        permanent: true,
      },
    };
  }

  const canonicalPath = `/fixture/${slug}`;
  const canonicalUrl = getCanonicalUrl(canonicalPath);
  const noIndex = isFixtureFinished(snapshot);
  const jsonLd = noIndex ? null : buildFixtureJsonLd(snapshot, canonicalUrl, meta);
  const competition = snapshot.competition_id
    ? getCompetitionById(snapshot.competition_id)
    : null;
  const competitionUrl = competition
    ? getCompetitionUrl(competition.slug)
    : null;
  const relatedFixtureLinks = noIndex
    ? []
    : await fetchUpcomingFixtureLinks({ excludeMatchId: matchId, limit: 150 });

  return {
    props: {
      matchId,
      meta,
      jsonLd,
      canonicalPath,
      noIndex,
      relatedFixtureLinks,
      seoShell: {
        home: meta.home,
        away: meta.away,
        league: meta.league || snapshot.competition_name || snapshot.league_name || "",
        stadium: snapshot.stadium_name || snapshot.stadium || "",
        kickOff: formatKickOff(snapshot.date_unix),
        competitionUrl,
        competitionName: competition?.name || meta.league || null,
        gameWeek: snapshot.game_week ?? snapshot.matches_completed_minimum ?? null,
      },
    },
  };
}
