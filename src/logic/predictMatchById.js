import { orderedLeagues } from "../App";
import { apiGetUrl } from "../utils/apiUrl";
import {
  allForm,
  allLeagueResultsArrayOfObjects,
  shouldUseApiFormOnly,
} from "./getFixtures";
import {
  calculateScore,
  setSingleMatchPredictionData,
} from "./getScorePredictions";
import {
  buildAllFormEntry,
  buildLeaguePositionsFromTable,
  buildMatchFromFixture,
  enrichMatchForFixturePageDisplay,
  formatDateForApi,
} from "./buildSingleMatch";
import { resolveLeagueResultsForCompetition } from "./leagueResultsLoader";

export async function predictMatchById(matchId) {
  const snapshotRes = await fetch(apiGetUrl(`match-snapshot/${matchId}`));
  if (!snapshotRes.ok) {
    throw new Error("Match not found");
  }

  const snapshot = await snapshotRes.json();
  const fixture = snapshot?.data;
  if (!fixture?.id) {
    throw new Error("Invalid match data");
  }

  const competitionId = fixture.competition_id;
  const leagueMeta = orderedLeagues.find((l) => l.element.id === competitionId);
  const leagueName =
    leagueMeta?.name || fixture.competition_name || fixture.league_name || "League";

  const dateStr = formatDateForApi(fixture.date_unix);

  const [tableRes, leagueAveragesRes, predictedScoresRes, dayMatchesRes] =
    await Promise.all([
      fetch(apiGetUrl(`tables/${competitionId}/${dateStr}`)),
      fetch(apiGetUrl("league-averages")),
      fetch(`${process.env.NEXT_PUBLIC_EXPRESS_SERVER}predictedScores2`),
      fetch(apiGetUrl(`matches/${dateStr}`)),
    ]);

  if (dayMatchesRes.ok) {
    const dayPayload = await dayMatchesRes.json();
    const dayList = Array.isArray(dayPayload?.data)
      ? dayPayload.data
      : Array.isArray(dayPayload)
        ? dayPayload
        : [];
    const fromDay = dayList.find((entry) => entry.id === fixture.id);
    if (fromDay) {
      Object.assign(fixture, fromDay);
    }
  }

  if (!tableRes.ok) {
    throw new Error("Failed to load league table");
  }

  const table = await tableRes.json();
  const leaguePositions = buildLeaguePositionsFromTable(table);
  const leagueResults = await resolveLeagueResultsForCompetition(
    competitionId,
    leagueName
  );

  const match = buildMatchFromFixture(fixture, competitionId, leagueName);
  const formEntry = await buildAllFormEntry(
    match,
    fixture,
    competitionId,
    leaguePositions
  );

  allForm.length = 0;
  allForm.push(formEntry);

  allLeagueResultsArrayOfObjects.length = 0;
  allLeagueResultsArrayOfObjects.push(leagueResults);

  const leagueAverages = await leagueAveragesRes.json();
  const predictedScores = await predictedScoresRes.json();
  setSingleMatchPredictionData({ leagueAverages, predictedScores });

  const index = 2;
  const divider = 10;

  if (match.status === "canceled") {
    match.goalsA = "P";
    match.goalsB = "P";
    match.completeData = false;
    await calculateScore(match, index, divider, false, predictedScores, []);
  } else if (shouldUseApiFormOnly(match)) {
    [match.goalsA, match.goalsB, match.unroundedGoalsA, match.unroundedGoalsB] =
      await calculateScore(match, index, divider, true, predictedScores, []);
    match.completeData = true;
  } else if (match.matches_completed_minimum < 4) {
    match.goalsA = "x";
    match.goalsB = "x";
    match.completeData = false;
  } else {
    [match.goalsA, match.goalsB, match.unroundedGoalsA, match.unroundedGoalsB] =
      await calculateScore(match, index, divider, true, predictedScores, []);
    match.completeData = true;
  }

  await enrichMatchForFixturePageDisplay(match);

  return match;
}
