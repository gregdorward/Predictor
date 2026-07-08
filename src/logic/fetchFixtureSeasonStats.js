import { apiGetUrl } from "../utils/apiUrl";
import { fetchLeagueTeamMetricRankings } from "../utils/competitionMetricRankings";
import { resolveTeamStatistics } from "../utils/sofaScoreTeamStats";
import { resolveSofaScoreFixtureTeams } from "../utils/resolveSofaScoreFixtureTeams";
import GenerateFormSummary from "./compareFormTrend";
import {
  buildBttsArrayFromResults,
  resolveRoundId,
  resolveSofaScoreId,
} from "./allStatsProps";

async function fetchTeamStats(teamId, sofaScoreId, roundId, leagueTopTeams) {
  if (!teamId || !sofaScoreId || !roundId) {
    return null;
  }

  try {
    const response = await fetch(
      apiGetUrl(`teamStats/${teamId}/${sofaScoreId}/${roundId}`)
    );
    const payload = await response.json();
    if (!response.ok || payload?.error) {
      return null;
    }
    return resolveTeamStatistics(payload, leagueTopTeams, teamId);
  } catch {
    return null;
  }
}

async function fetchLeagueTopTeams(sofaScoreId, roundId) {
  if (!sofaScoreId || !roundId) {
    return null;
  }

  try {
    return (await fetchLeagueTeamMetricRankings(sofaScoreId, roundId)) ?? null;
  } catch {
    return null;
  }
}

async function buildFormSummaries(match) {
  const homeForm = match?.formHome;
  const awayForm = match?.formAway;

  if (
    !homeForm?.fiveGameAv ||
    !awayForm?.fiveGameAv ||
    Number(match?.matches_completed_minimum) <= 3
  ) {
    return { home: undefined, away: undefined };
  }

  try {
    const [home, away] = await Promise.all([
      GenerateFormSummary(homeForm, homeForm.tenGameAv, homeForm.fiveGameAv),
      GenerateFormSummary(awayForm, awayForm.tenGameAv, awayForm.fiveGameAv),
    ]);
    return { home, away };
  } catch {
    return { home: undefined, away: undefined };
  }
}

/**
 * Fetch industry leading stat website team stats and form summaries for the fixture detail page.
 */
export async function fetchFixtureSeasonStats(match) {
  const leagueID = match?.leagueID ?? match?.competition_id;
  const sofaScoreId = resolveSofaScoreId(leagueID);
  const roundId = resolveRoundId(sofaScoreId);
  const sofaScoreFixture = await resolveSofaScoreFixtureTeams(match);

  const homeSofaTeamId = sofaScoreFixture?.homeId ?? null;
  const awaySofaTeamId = sofaScoreFixture?.awayId ?? null;

  const leagueTopTeams = await fetchLeagueTopTeams(sofaScoreId, roundId);

  const [homeTeamStats, awayTeamStats, formSummaries] = await Promise.all([
    fetchTeamStats(homeSofaTeamId, sofaScoreId, roundId, leagueTopTeams),
    fetchTeamStats(awaySofaTeamId, sofaScoreId, roundId, leagueTopTeams),
    buildFormSummaries(match),
  ]);

  return {
    homeTeamStats,
    awayTeamStats,
    leagueTopTeams,
    formSummaries,
    bttsArrayHome: buildBttsArrayFromResults(match?.formHome?.allTeamResults),
    bttsArrayAway: buildBttsArrayFromResults(match?.formAway?.allTeamResults),
    sofaScoreId,
    roundId,
    sofaScoreFixture,
  };
}
