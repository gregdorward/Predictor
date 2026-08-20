import dynamic from "next/dynamic";
import PageMeta from "../../src/components/PageMeta";
import FixtureSeoShell from "../../src/components/FixtureSeoShell";
import SiteHeader from "../../src/components/SiteHeader";
import {
  buildFixtureMeta,
  buildFixtureSlug,
  buildFixtureUrl,
  parseFixtureParam,
} from "../../src/seo/fixtureSlug";
import { fetchMatchSnapshot } from "../../src/seo/serverFetch";
import { buildFixtureOgImageUrl } from "../../src/seo/pageMetaConfig";
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
  canonicalPath,
  seoShell,
  ogImage,
}) {
  return (
    <>
      <PageMeta
        title={meta.title}
        description={meta.description}
        canonicalPath={canonicalPath}
        noIndex
        ogImage={ogImage}
        ogImageAlt={`${meta.home} vs ${meta.away} | Soccer Stats Hub`}
      />
      <SiteHeader showThemeToggle withFooter>
        <div id="ssh-content">
          <FixtureSeoShell {...seoShell} />
          <TeamPage matchId={matchId} seoShell={seoShell} />
        </div>
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
  const competition = snapshot.competition_id
    ? getCompetitionById(snapshot.competition_id)
    : null;
  const competitionUrl = competition
    ? getCompetitionUrl(competition.slug)
    : null;

  return {
    props: {
      matchId,
      meta,
      canonicalPath,
      ogImage: buildFixtureOgImageUrl(matchId),
      seoShell: {
        home: meta.home,
        away: meta.away,
        league: meta.league || snapshot.competition_name || snapshot.league_name || "",
        stadium: snapshot.stadium_name || snapshot.stadium || "",
        kickOff: formatKickOff(snapshot.date_unix),
        competitionUrl,
        competitionName: competition?.name || meta.league || null,
        homeBadge: snapshot.home_image || snapshot.homeBadge || null,
        awayBadge: snapshot.away_image || snapshot.awayBadge || null,
      },
    },
  };
}
