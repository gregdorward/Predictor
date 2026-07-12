import { parseGoalMinute } from "./goalTimingHeatmap";

const SECONDS_PER_DAY = 86400;
const SOFT_SOS_THRESHOLD = 0.2;
const LATE_GOAL_MINUTE = 76;

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function pct(count, total) {
  if (!total) return null;
  return Number(((count / total) * 100).toFixed(0));
}

function average(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values) {
  if (values.length < 2) return null;
  const mean = average(values);
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function round(value, digits = 2) {
  if (value == null || !Number.isFinite(value)) return null;
  return Number(value.toFixed(digits));
}

function sortedNewestFirst(results = []) {
  return [...results].sort((a, b) => (b.dateRaw ?? 0) - (a.dateRaw ?? 0));
}

/**
 * Rest days and recent fixture congestion relative to the upcoming fixture.
 */
export function buildRestAndCongestion(allTeamResults = [], fixtureUnix) {
  const results = sortedNewestFirst(allTeamResults).filter(
    (result) => toNumber(result.dateRaw) != null
  );
  const fixtureTs = toNumber(fixtureUnix);

  if (!results.length || fixtureTs == null) {
    return {
      daysSinceLastMatch: null,
      matchesInLast7Days: null,
      matchesInLast14Days: null,
      restLabel: null,
      congestionLabel: null,
    };
  }

  const lastMatchTs = toNumber(results[0].dateRaw);
  const daysSinceLastMatch =
    lastMatchTs == null
      ? null
      : round(Math.max(0, (fixtureTs - lastMatchTs) / SECONDS_PER_DAY), 1);

  const matchesInLast7Days = results.filter((result) => {
    const ts = toNumber(result.dateRaw);
    return ts != null && fixtureTs - ts <= 7 * SECONDS_PER_DAY && ts < fixtureTs;
  }).length;

  const matchesInLast14Days = results.filter((result) => {
    const ts = toNumber(result.dateRaw);
    return ts != null && fixtureTs - ts <= 14 * SECONDS_PER_DAY && ts < fixtureTs;
  }).length;

  let restLabel = "Unknown";
  if (daysSinceLastMatch != null) {
    if (daysSinceLastMatch <= 3) restLabel = "Short rest";
    else if (daysSinceLastMatch <= 5) restLabel = "Normal rest";
    else if (daysSinceLastMatch <= 8) restLabel = "Fresh";
    else restLabel = "Long layoff";
  }

  let congestionLabel = "Light";
  if (matchesInLast7Days >= 2 || matchesInLast14Days >= 4) {
    congestionLabel = "Congested";
  } else if (matchesInLast7Days === 1 && matchesInLast14Days >= 3) {
    congestionLabel = "Busy";
  }

  return {
    daysSinceLastMatch,
    matchesInLast7Days,
    matchesInLast14Days,
    restLabel,
    congestionLabel,
  };
}

/**
 * Rolling over/under rates from completed match goal totals.
 */
export function buildRollingOverUnder(allTeamResults = []) {
  const results = sortedNewestFirst(allTeamResults);
  const totals = results.map(
    (result) => Number(result.scored || 0) + Number(result.conceeded || 0)
  );

  const windowRate = (windowSize, threshold) => {
    const slice = totals.slice(0, windowSize);
    if (!slice.length) return null;
    const overs = slice.filter((total) => total > threshold).length;
    return pct(overs, slice.length);
  };

  const last5 = totals.slice(0, 5);
  const last10 = totals.slice(0, 10);

  return {
    over25Last5Percentage: windowRate(5, 2.5),
    over25Last10Percentage: windowRate(10, 2.5),
    under25Last5Percentage: last5.length
      ? pct(last5.filter((total) => total < 2.5).length, last5.length)
      : null,
    over35Last5Percentage: windowRate(5, 3.5),
    over35Last10Percentage: windowRate(10, 3.5),
    avgGoalsPerGameLast5: round(average(last5), 2),
    avgGoalsPerGameLast10: round(average(last10), 2),
  };
}

function fixtureHasUsableTimings(fixture) {
  return Boolean(
    fixture?.goal_timings_recorded === 1 &&
      ((fixture.homeGoals_timings?.length ?? 0) > 0 ||
        (fixture.awayGoals_timings?.length ?? 0) > 0)
  );
}

/**
 * Game-state / timing profile from FootyStats goal minute arrays.
 * homeFixtures / awayFixtures are raw league result objects for this team.
 */
export function buildGameStateTiming(homeFixtures = [], awayFixtures = []) {
  let matchesWithTimings = 0;
  let scoredFirst = 0;
  let concededFirst = 0;
  let decidedFirstGoal = 0;
  let lateGoalsScored = 0;
  let lateGoalsConceded = 0;
  let totalGoalsScored = 0;
  let totalGoalsConceded = 0;
  let pointsFromLosingPositions = 0;
  let trailedMatches = 0;

  const processFixture = (fixture, isHome) => {
    if (!fixtureHasUsableTimings(fixture)) return;

    const ownTimings = isHome
      ? fixture.homeGoals_timings
      : fixture.awayGoals_timings;
    const oppTimings = isHome
      ? fixture.awayGoals_timings
      : fixture.homeGoals_timings;

    matchesWithTimings += 1;

    const ownMinutes = (ownTimings || [])
      .map(parseGoalMinute)
      .filter((minute) => minute != null)
      .sort((a, b) => a - b);
    const oppMinutes = (oppTimings || [])
      .map(parseGoalMinute)
      .filter((minute) => minute != null)
      .sort((a, b) => a - b);

    totalGoalsScored += ownMinutes.length;
    totalGoalsConceded += oppMinutes.length;
    lateGoalsScored += ownMinutes.filter((minute) => minute >= LATE_GOAL_MINUTE)
      .length;
    lateGoalsConceded += oppMinutes.filter(
      (minute) => minute >= LATE_GOAL_MINUTE
    ).length;

    const ownFirst = ownMinutes[0] ?? null;
    const oppFirst = oppMinutes[0] ?? null;

    if (ownFirst != null && (oppFirst == null || ownFirst < oppFirst)) {
      scoredFirst += 1;
      decidedFirstGoal += 1;
    } else if (oppFirst != null && (ownFirst == null || oppFirst < ownFirst)) {
      concededFirst += 1;
      decidedFirstGoal += 1;
    }

    // Approximate "trailed then took points" from ordered goal events.
    let ownGoals = 0;
    let oppGoals = 0;
    let trailed = false;
    const events = [
      ...ownMinutes.map((minute) => ({ minute, side: "own" })),
      ...oppMinutes.map((minute) => ({ minute, side: "opp" })),
    ].sort((a, b) => a.minute - b.minute);

    for (const event of events) {
      if (event.side === "own") ownGoals += 1;
      else oppGoals += 1;
      if (oppGoals > ownGoals) trailed = true;
    }

    if (trailed) {
      trailedMatches += 1;
      const scored = isHome ? fixture.homeGoalCount : fixture.awayGoalCount;
      const conceded = isHome ? fixture.awayGoalCount : fixture.homeGoalCount;
      if (scored > conceded) pointsFromLosingPositions += 3;
      else if (scored === conceded) pointsFromLosingPositions += 1;
    }
  };

  homeFixtures.forEach((fixture) => processFixture(fixture, true));
  awayFixtures.forEach((fixture) => processFixture(fixture, false));

  return {
    hasData: matchesWithTimings >= 3,
    matchesWithTimings,
    scoredFirstPercentage: pct(scoredFirst, decidedFirstGoal),
    concededFirstPercentage: pct(concededFirst, decidedFirstGoal),
    lateGoalsScoredPercentage: pct(lateGoalsScored, totalGoalsScored),
    lateGoalsConcededPercentage: pct(lateGoalsConceded, totalGoalsConceded),
    pointsFromLosingPositions,
    trailedMatches,
    lateGoalsScored,
    lateGoalsConceded,
  };
}

/**
 * Strength-of-schedule splits using opponent pre-match PPG.
 */
export function buildStrengthOfSchedule(allTeamResults = []) {
  const results = sortedNewestFirst(allTeamResults).filter(
    (result) => toNumber(result.oppositionPPG) != null
  );

  if (!results.length) {
    return {
      avOppositionPPGLast5: null,
      avOppositionPPGLast10: null,
      avOppositionPPGAll: null,
      last5VsAllDelta: null,
      softScheduleFlag: false,
      toughScheduleFlag: false,
      pointsVsStrongLast5: null,
      pointsVsWeakLast5: null,
      strongOpponentThreshold: null,
      scheduleLabel: null,
    };
  }

  const allOpp = results.map((result) => Number(result.oppositionPPG));
  const last5 = results.slice(0, 5);
  const last10 = results.slice(0, 10);
  const avAll = average(allOpp);
  const avLast5 = average(last5.map((result) => Number(result.oppositionPPG)));
  const avLast10 = average(last10.map((result) => Number(result.oppositionPPG)));
  const delta = avLast5 != null && avAll != null ? avLast5 - avAll : null;

  const strongThreshold = avAll != null ? avAll + 0.15 : 1.5;
  const weakThreshold = avAll != null ? avAll - 0.15 : 1.2;

  const vsStrong = last5.filter(
    (result) => Number(result.oppositionPPG) >= strongThreshold
  );
  const vsWeak = last5.filter(
    (result) => Number(result.oppositionPPG) <= weakThreshold
  );

  const softScheduleFlag = delta != null && delta <= -SOFT_SOS_THRESHOLD;
  const toughScheduleFlag = delta != null && delta >= SOFT_SOS_THRESHOLD;

  let scheduleLabel = "Typical recent schedule";
  if (softScheduleFlag) scheduleLabel = "Softer recent schedule";
  else if (toughScheduleFlag) scheduleLabel = "Tougher recent schedule";

  return {
    avOppositionPPGLast5: round(avLast5, 2),
    avOppositionPPGLast10: round(avLast10, 2),
    avOppositionPPGAll: round(avAll, 2),
    last5VsAllDelta: round(delta, 2),
    softScheduleFlag,
    toughScheduleFlag,
    pointsVsStrongLast5: vsStrong.length
      ? round(average(vsStrong.map((result) => Number(result.points) || 0)), 2)
      : null,
    pointsVsWeakLast5: vsWeak.length
      ? round(average(vsWeak.map((result) => Number(result.points) || 0)), 2)
      : null,
    strongOpponentThreshold: round(strongThreshold, 2),
    scheduleLabel,
  };
}

/**
 * Scoring variance / match-shape profile.
 */
export function buildScoringVariance(allTeamResults = []) {
  const results = sortedNewestFirst(allTeamResults);
  if (!results.length) {
    return {
      goalsPerGameStdDev: null,
      oneGoalGamePercentage: null,
      drawPercentage: null,
      blowoutPercentage: null,
      varianceLabel: null,
    };
  }

  const totals = results.map(
    (result) => Number(result.scored || 0) + Number(result.conceeded || 0)
  );
  const margins = results.map((result) =>
    Math.abs(Number(result.scored || 0) - Number(result.conceeded || 0))
  );
  const draws = results.filter((result) => result.result === "D").length;
  const oneGoalGames = margins.filter((margin) => margin === 1).length;
  const blowouts = margins.filter((margin) => margin >= 3).length;
  const stdDev = standardDeviation(totals);

  let varianceLabel = "Balanced";
  if (stdDev != null) {
    if (stdDev >= 1.6 || pct(blowouts, results.length) >= 25) {
      varianceLabel = "High variance";
    } else if (stdDev <= 1.0 && pct(oneGoalGames, results.length) >= 45) {
      varianceLabel = "Tight / low variance";
    }
  }

  return {
    goalsPerGameStdDev: round(stdDev, 2),
    oneGoalGamePercentage: pct(oneGoalGames, results.length),
    drawPercentage: pct(draws, results.length),
    blowoutPercentage: pct(blowouts, results.length),
    varianceLabel,
  };
}

/**
 * Bundle all contextual metrics for a team's form object.
 * Does not feed the score prediction algorithm.
 */
export function buildFormContextMetrics({
  allTeamResults = [],
  homeFixtures = [],
  awayFixtures = [],
  fixtureUnix,
} = {}) {
  const rest = buildRestAndCongestion(allTeamResults, fixtureUnix);
  const overUnder = buildRollingOverUnder(allTeamResults);
  const gameState = buildGameStateTiming(homeFixtures, awayFixtures);
  const strengthOfSchedule = buildStrengthOfSchedule(allTeamResults);
  const scoringVariance = buildScoringVariance(allTeamResults);

  return {
    rest,
    overUnder,
    gameState,
    strengthOfSchedule,
    scoringVariance,
  };
}
