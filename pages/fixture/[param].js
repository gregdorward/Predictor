import dynamic from "next/dynamic";
import PageMeta from "../../src/components/PageMeta";
import JsonLd from "../../src/components/JsonLd";
import FixtureSeoShell from "../../src/components/FixtureSeoShell";
import {
  buildFixtureJsonLd,
  buildFixtureMeta,
  buildFixtureSlug,
  buildFixtureUrl,
  isFixtureFinished,
  parseFixtureParam,
} from "../../src/seo/fixtureSlug";
import { fetchMatchSnapshot } from "../../src/seo/serverFetch";
import { getCanonicalUrl } from "../../src/seo/pageMetaConfig";
import { getCompetitionById, getCompetitionUrl } from "../../src/seo/competitionCatalog";

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
      <FixtureSeoShell {...seoShell} />
      <TeamPage matchId={matchId} />
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

  return {
    props: {
      matchId,
      meta,
      jsonLd,
      canonicalPath,
      noIndex,
      seoShell: {
        home: meta.home,
        away: meta.away,
        league: meta.league || snapshot.competition_name || snapshot.league_name || "",
        stadium: snapshot.stadium_name || snapshot.stadium || "",
        kickOff: formatKickOff(snapshot.date_unix),
        competitionUrl: competition ? getCompetitionUrl(competition.slug) : null,
        competitionName: competition?.name || meta.league || null,
      },
    },
  };
}
