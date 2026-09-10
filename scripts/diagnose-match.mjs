import { loadBacktestEnv } from "../src/logic/backtest/loadEnv.js";
import { fetchGlobalBacktestData, loadDayData } from "../src/logic/backtest/loadDayData.js";
import { buildMatchFromFixture } from "../src/logic/backtest/buildMatchFromFixture.js";
import { getLeagueName } from "../src/logic/backtest/leagueNames.js";
import {
  calculateScore,
  setSingleMatchPredictionData,
  setSshSnapshotPersistEnabled,
  resetSshSnapshotState,
} from "../src/logic/getScorePredictions.js";
import {
  applyScoreModelFromEnv,
  resetClearOutcomeMargin,
  resetUseResultSnapshots,
} from "../src/logic/getScorePredictions.js";
import { resetTipFilters } from "../src/logic/tipFilters.js";
import { allForm, allLeagueResultsArrayOfObjects } from "../src/logic/getFixtures.js";
import { buildLeagueAveragesAsOf } from "../src/utils/leagueAverages.js";

loadBacktestEnv();
resetClearOutcomeMargin();
resetUseResultSnapshots();
resetTipFilters();
applyScoreModelFromEnv();

const matchId = Number(process.argv[2]);
const isoDate = process.argv[3] || "2026-09-09";
if (!matchId) {
  console.error("Usage: node scripts/diagnose-match.mjs <matchId> [YYYY-MM-DD]");
  process.exit(1);
}

const apiOrigin = process.env.NEXT_PUBLIC_EXPRESS_SERVER;
setSshSnapshotPersistEnabled(false);
resetSshSnapshotState();

const { leagueResults, leagueAveragesFallback } =
  await fetchGlobalBacktestData(apiOrigin);
const day = await loadDayData(new Date(`${isoDate}T12:00:00`), apiOrigin);

const origin = apiOrigin.endsWith("/") ? apiOrigin : `${apiOrigin}/`;
const matchesRes = await fetch(`${origin}matches/${isoDate}`);
const payload = await matchesRes.json();
const fixture = (payload.data || payload).find((row) => row.id === matchId);
if (!fixture) {
  throw new Error(`Fixture ${matchId} not found on ${isoDate}`);
}

const leagueName = getLeagueName(fixture.competition_id) || "Unknown";
const leagueDescOverride = process.argv[4] || null;
const leagueDescCandidates = leagueDescOverride
  ? [leagueDescOverride]
  : [
      leagueName,
      "South America Copa Libertadores",
      "Copa Libertadores",
    ];

allForm.length = 0;
allForm.push(...day.allForm);
allLeagueResultsArrayOfObjects.length = 0;
allLeagueResultsArrayOfObjects.push(...leagueResults);

const leagueAverages =
  day.leagueAverages ||
  buildLeagueAveragesAsOf(leagueResults, isoDate) ||
  leagueAveragesFallback;

setSingleMatchPredictionData({
  leagueAverages,
  predictedScores: [],
  applyOverlay: false,
});

const fixtureForm = day.allForm.find((row) => row.id === matchId);

async function runForLeagueDesc(leagueDesc) {
  const match = buildMatchFromFixture(fixture, leagueName);
  match.leagueDesc = leagueDesc;
  match.leagueName = leagueDesc;
  match.status = fixture.status || "incomplete";

  if (fixtureForm?.home?.[2]) match.formHome = { ...fixtureForm.home[2] };
  if (fixtureForm?.away?.[2]) match.formAway = { ...fixtureForm.away[2] };

  const [goalsA, goalsB, rawA, rawB] = await calculateScore(
    match,
    2,
    10,
    true,
    [],
    []
  );
  match.goalsA = goalsA;
  match.goalsB = goalsB;
  match.unroundedGoalsA = rawA;
  match.unroundedGoalsB = rawB;

  const implied = (odds) => Number(((1 / Number(odds)) * 100).toFixed(2));
  const homeImplied = implied(match.homeOdds);

  let matrixHome = null;
  if (match.scoreMatrix?.length) {
    let hw = 0;
    for (const { home, away, probability } of match.scoreMatrix) {
      if (home > away) hw += probability;
    }
    matrixHome = Number((hw * 100).toFixed(2));
  }

  return {
    leagueDesc,
    modelPct: {
      home: match.homeWinProbability,
      draw: match.drawProbability,
      away: match.awayWinProbability,
    },
    matrixHomePct: matrixHome,
    edgePp: {
      home: Number((match.homeWinProbability - homeImplied).toFixed(2)),
    },
    scoreline: `${goalsA}-${goalsB}`,
    lambdas: {
      home: match.formHome?.teamGoalsCalc,
      away: match.formAway?.teamGoalsCalc,
    },
    bttsYes: match.bttsYesProbability,
  };
}

const comparisons = [];
for (const leagueDesc of leagueDescCandidates) {
  comparisons.push(await runForLeagueDesc(leagueDesc));
}

const match = buildMatchFromFixture(fixture, leagueName);
match.status = fixture.status || "incomplete";
const implied = (odds) => Number(((1 / Number(odds)) * 100).toFixed(2));
const homeImplied = implied(match.homeOdds);
const drawImplied = implied(match.drawOdds);
const awayImplied = implied(match.awayOdds);
const primary = comparisons[0];

console.log(
  JSON.stringify(
    {
      match: `${match.homeTeam} vs ${match.awayTeam}`,
      leagueCatalogName: leagueName,
      leagueDescComparisons: comparisons,
      league: primary.leagueDesc,
      status: match.status,
      noHomeAway: fixture.no_home_away,
      odds: {
        home: match.homeOdds,
        draw: match.drawOdds,
        away: match.awayOdds,
      },
      impliedPct: {
        home: homeImplied,
        draw: drawImplied,
        away: awayImplied,
      },
      modelPct: primary.modelPct,
      edgePp: primary.edgePp,
      scoreline: primary.scoreline,
      lambdas: primary.lambdas,
      bttsYesProbability: primary.bttsYes,
      footyStatsPrematch: {
        homeXg: fixture.team_a_xg_prematch,
        awayXg: fixture.team_b_xg_prematch,
        homePpg: fixture.pre_match_home_ppg,
        awayPpg: fixture.pre_match_away_ppg,
        avgGoals: fixture.avg_potential,
        o25Potential: fixture.o25_potential,
        bttsPotential: fixture.btts_potential,
      },
      formHome: fixtureForm?.home?.[2]
        ? {
            xg: fixtureForm.home[2].XGOverall,
            xgVenue: fixtureForm.home[2].XG,
            scored: fixtureForm.home[2].ScoredAverageOverall,
            conceded: fixtureForm.home[2].ConcededAverageOverall,
            ppg: fixtureForm.home[2].PPG,
          }
        : null,
      formAway: fixtureForm?.away?.[2]
        ? {
            xg: fixtureForm.away[2].XGOverall,
            xgVenue: fixtureForm.away[2].XG,
            scored: fixtureForm.away[2].ScoredAverageOverall,
            conceded: fixtureForm.away[2].ConcededAverageOverall,
            ppg: fixtureForm.away[2].PPG,
          }
        : null,
    },
    null,
    2
  )
);
