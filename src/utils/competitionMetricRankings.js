import { getSofaScoreMapping } from "../constants/footyStatsToSofaScore";

function getOrigin() {
  return process.env.NEXT_PUBLIC_EXPRESS_SERVER;
}

function rankingsUrl(path) {
  const origin = getOrigin();
  if (!origin) {
    return null;
  }
  return `${origin}${path}`;
}

async function fetchJson(url) {
  if (!url) {
    return null;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch {
    return null;
  }
}

/**
 * Fetch SofaScore league team metric rankings (topTeams by stat).
 * @param {number|string} sofaTournamentId
 * @param {number|string} sofaSeasonId
 */
export async function fetchLeagueTeamMetricRankings(sofaTournamentId, sofaSeasonId) {
  return fetchJson(
    rankingsUrl(`LeagueTeamStats/${sofaTournamentId}/${sofaSeasonId}`)
  );
}

/**
 * Fetch SofaScore player metric rankings (topPlayers by stat).
 * @param {number|string} sofaTournamentId
 * @param {number|string} sofaSeasonId
 */
export async function fetchPlayerMetricRankings(sofaTournamentId, sofaSeasonId) {
  return fetchJson(rankingsUrl(`bestPlayers/${sofaTournamentId}/${sofaSeasonId}`));
}

/**
 * Fetch both team and player metric rankings for a FootyStats season id.
 * @param {number|string} footySeasonId
 */
export async function fetchCompetitionMetricRankings(footySeasonId) {
  const sofaMapping = getSofaScoreMapping(footySeasonId);

  if (!sofaMapping) {
    return { rankingStats: null, playerRankingStats: null };
  }

  const [rankingStats, playerRankingStats] = await Promise.all([
    fetchLeagueTeamMetricRankings(sofaMapping.id, sofaMapping.season),
    fetchPlayerMetricRankings(sofaMapping.id, sofaMapping.season),
  ]);

  return { rankingStats, playerRankingStats };
}
