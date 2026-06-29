import { getSofaScoreMapping } from "../../constants/footyStatsToSofaScore";

const ORIGIN = process.env.NEXT_PUBLIC_EXPRESS_SERVER;

function getWeekOfYear(date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = target - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

export async function fetchCompetitionMetricRankings(seasonId) {
  const week = getWeekOfYear(new Date());
  const sofaMapping = getSofaScoreMapping(seasonId);

  if (!sofaMapping) {
    return { rankingStats: null, playerRankingStats: null };
  }

  const [rankingStats, playerRankingStats] = await Promise.all([
    fetch(
      `${ORIGIN}LeagueTeamStats/${sofaMapping.id}/${sofaMapping.season}/${week}`
    )
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null),
    fetch(
      `${ORIGIN}bestPlayers/${sofaMapping.id}/${sofaMapping.season}/${week}`
    )
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null),
  ]);

  return { rankingStats, playerRankingStats };
}
