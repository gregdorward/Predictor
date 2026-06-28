import { apiGetUrl } from "../utils/apiUrl";
import { resolveTeamStatistics } from "../utils/sofaScoreTeamStats";
import { resolveSofaScoreFixtureTeams } from "../utils/resolveSofaScoreFixtureTeams";
import GenerateFormSummary from "./compareFormTrend";
import {
  buildBttsArrayFromResults,
  resolveRoundId,
  resolveSofaScoreId,
} from "./allStatsProps";

function getWeekOfYear(date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = target - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

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

async function fetchLeagueTopTeams(sofaScoreId, roundId, matchDateUnix) {
  if (!sofaScoreId || !roundId) {
    return null;
  }

  const matchDate = matchDateUnix
    ? new Date(matchDateUnix * 1000)
    : new Date();
  const week = getWeekOfYear(matchDate);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_EXPRESS_SERVER}LeagueTeamStats/${sofaScoreId}/${roundId}/${week}`
    );
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    return payload ?? null;
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
    Number(match?.matches_completed_minimum) <= 4
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
 * Fetch SofaScore team stats and form summaries for the fixture detail page.
 */
export async function fetchFixtureSeasonStats(match) {
  const leagueID = match?.leagueID ?? match?.competition_id;
  const sofaScoreId = resolveSofaScoreId(leagueID);
  const roundId = resolveRoundId(sofaScoreId);
  const sofaScoreFixture = await resolveSofaScoreFixtureTeams(match);

  const homeSofaTeamId = sofaScoreFixture?.homeId ?? null;
  const awaySofaTeamId = sofaScoreFixture?.awayId ?? null;

  const leagueTopTeams = await fetchLeagueTopTeams(
    sofaScoreId,
    roundId,
    match?.date
  );

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
