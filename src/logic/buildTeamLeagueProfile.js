import {
  calculateAttackingStrength,
  calculateDefensiveStrength,
} from "./getStats";

/** Opponent-PPG-adjusted xG average (same formula as getScorePredictions). */
export function calculateWeightedXG(recentXG, oppositionPPG, leagueAvgPPG = 1.5) {
  if (
    !Array.isArray(recentXG) ||
    !Array.isArray(oppositionPPG) ||
    recentXG.length === 0 ||
    recentXG.length !== oppositionPPG.length
  ) {
    return 0;
  }

  let weightedXGSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < recentXG.length; i++) {
    const difficultyMultiplier = oppositionPPG[i] / leagueAvgPPG;
    weightedXGSum += recentXG[i] * difficultyMultiplier;
    totalWeight += difficultyMultiplier;
  }

  return totalWeight > 0 ? weightedXGSum / totalWeight : 0;
}

function avg(values, fallback = 0) {
  if (!Array.isArray(values) || values.length === 0) return fallback;
  const sum = values.reduce((a, b) => a + Number(b || 0), 0);
  return sum / values.length;
}

function round(value, decimals = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return parseFloat(n.toFixed(decimals));
}

function normalizeHomeResult(fixture) {
  return {
    team: fixture.home_name,
    oppTeam: fixture.away_name,
    venue: "Home",
    gameweek: fixture.game_week,
    homeGoals: fixture.homeGoalCount,
    awayGoals: fixture.awayGoalCount,
    homePPGPreMatch: fixture.pre_match_teamA_overall_ppg,
    awayPPGPreMatch: fixture.pre_match_teamB_overall_ppg,
    oppositionPPG: fixture.pre_match_teamB_overall_ppg,
    XG:
      fixture.team_a_xg <= 0 || fixture.team_a_xg > 7
        ? fixture.homeGoalCount
        : fixture.team_a_xg,
    XGAgainst:
      fixture.team_b_xg <= 0 || fixture.team_b_xg > 7
        ? fixture.awayGoalCount
        : fixture.team_b_xg,
    possession: fixture.team_a_possession <= 0 ? 50 : fixture.team_a_possession,
    scored: fixture.homeGoalCount,
    conceeded: fixture.awayGoalCount,
    shots: fixture.team_a_shots <= 0 ? 12 : fixture.team_a_shots,
    shotsAgainst: fixture.team_b_shots <= 0 ? 12 : fixture.team_b_shots,
    sot: fixture.team_a_shotsOnTarget <= 0 ? 5 : fixture.team_a_shotsOnTarget,
    sotAgainst:
      fixture.team_b_shotsOnTarget <= 0 ? 5 : fixture.team_b_shotsOnTarget,
    dangerousAttacks:
      fixture.team_a_dangerous_attacks <= 0
        ? 50
        : fixture.team_a_dangerous_attacks,
    dangerousAttacksAgainst:
      fixture.team_b_dangerous_attacks <= 0
        ? 50
        : fixture.team_b_dangerous_attacks,
    corners: fixture.team_a_corners === -1 ? 6 : fixture.team_a_corners,
    cornersAgainst: fixture.team_b_corners === -1 ? 6 : fixture.team_b_corners,
    dateRaw: fixture.date_unix,
    odds: fixture.odds_ft_1,
    oppositionOdds: fixture.odds_ft_2,
    btts: fixture.homeGoalCount > 0 && fixture.awayGoalCount > 0,
    points:
      fixture.homeGoalCount > fixture.awayGoalCount
        ? 3
        : fixture.homeGoalCount < fixture.awayGoalCount
          ? 0
          : 1,
    result:
      fixture.homeGoalCount > fixture.awayGoalCount
        ? "W"
        : fixture.homeGoalCount < fixture.awayGoalCount
          ? "L"
          : "D",
  };
}

function normalizeAwayResult(fixture) {
  return {
    team: fixture.away_name,
    oppTeam: fixture.home_name,
    venue: "Away",
    gameweek: fixture.game_week,
    homeGoals: fixture.homeGoalCount,
    awayGoals: fixture.awayGoalCount,
    homePPGPreMatch: fixture.pre_match_teamA_overall_ppg,
    awayPPGPreMatch: fixture.pre_match_teamB_overall_ppg,
    oppositionPPG: fixture.pre_match_teamA_overall_ppg,
    XG:
      fixture.team_b_xg <= 0 || fixture.team_b_xg > 7
        ? fixture.awayGoalCount
        : fixture.team_b_xg,
    XGAgainst:
      fixture.team_a_xg <= 0 || fixture.team_a_xg > 7
        ? fixture.homeGoalCount
        : fixture.team_a_xg,
    possession: fixture.team_b_possession <= 0 ? 50 : fixture.team_b_possession,
    scored: fixture.awayGoalCount,
    conceeded: fixture.homeGoalCount,
    shots: fixture.team_b_shots <= 0 ? 12 : fixture.team_b_shots,
    shotsAgainst: fixture.team_a_shots <= 0 ? 12 : fixture.team_a_shots,
    sot: fixture.team_b_shotsOnTarget <= 0 ? 5 : fixture.team_b_shotsOnTarget,
    sotAgainst:
      fixture.team_a_shotsOnTarget <= 0 ? 5 : fixture.team_a_shotsOnTarget,
    dangerousAttacks:
      fixture.team_b_dangerous_attacks <= 0
        ? 50
        : fixture.team_b_dangerous_attacks,
    dangerousAttacksAgainst:
      fixture.team_a_dangerous_attacks <= 0
        ? 50
        : fixture.team_a_dangerous_attacks,
    corners: fixture.team_b_corners === -1 ? 6 : fixture.team_b_corners,
    cornersAgainst: fixture.team_a_corners === -1 ? 6 : fixture.team_a_corners,
    dateRaw: fixture.date_unix,
    odds: fixture.odds_ft_2,
    oppositionOdds: fixture.odds_ft_1,
    btts: fixture.homeGoalCount > 0 && fixture.awayGoalCount > 0,
    points:
      fixture.homeGoalCount > fixture.awayGoalCount
        ? 0
        : fixture.homeGoalCount < fixture.awayGoalCount
          ? 3
          : 1,
    result:
      fixture.homeGoalCount > fixture.awayGoalCount
        ? "L"
        : fixture.homeGoalCount < fixture.awayGoalCount
          ? "W"
          : "D",
  };
}

/**
 * Build team result rows from league fixtures before asOfUnix (same cutoff as
 * getPastLeagueResults: date_unix < asOfUnix - 86400). Newest first.
 */
export function buildTeamResultRows(teamName, leagueFixtures, asOfUnix) {
  const cutoff = asOfUnix - 86400;
  const homeResults = (leagueFixtures || [])
    .filter(
      (fixture) =>
        fixture.home_name === teamName && fixture.date_unix < cutoff
    )
    .map(normalizeHomeResult);
  const awayResults = (leagueFixtures || [])
    .filter(
      (fixture) =>
        fixture.away_name === teamName && fixture.date_unix < cutoff
    )
    .map(normalizeAwayResult);

  const allTeamResults = homeResults
    .concat(awayResults)
    .sort((a, b) => b.dateRaw - a.dateRaw);

  return { homeResults, awayResults, allTeamResults };
}

/**
 * Slim prediction-parity profile for league comparison charts.
 * Does not mutate the full prediction form object.
 */
export async function buildTeamLeagueProfile(
  teamName,
  leagueFixtures,
  asOfUnix = Math.floor(Date.now() / 1000),
  options = {}
) {
  const { homeResults, awayResults, allTeamResults } = buildTeamResultRows(
    teamName,
    leagueFixtures,
    asOfUnix
  );

  if (allTeamResults.length === 0) {
    return null;
  }

  const last5 = allTeamResults.slice(0, 5);
  const xgFor = allTeamResults.map((r) => r.XG);
  const xgAgainst = allTeamResults.map((r) => r.XGAgainst);
  const oppPpg = allTeamResults.map((r) => r.oppositionPPG);
  const oppPpgLast5 = last5.map((r) => r.oppositionPPG);
  const xgForLast5 = last5.map((r) => r.XG);
  const xgAgainstLast5 = last5.map((r) => r.XGAgainst);

  const goalsFor = avg(allTeamResults.map((r) => r.scored));
  const goalsAgainst = avg(allTeamResults.map((r) => r.conceeded));
  const daFor = avg(allTeamResults.map((r) => r.dangerousAttacks), 45);
  const daAgainst = avg(
    allTeamResults.map((r) => r.dangerousAttacksAgainst),
    45
  );
  const sotFor = avg(allTeamResults.map((r) => r.sot));
  const sotAgainst = avg(allTeamResults.map((r) => r.sotAgainst));
  const xgForAvg = avg(xgFor);
  const xgAgainstAvg = avg(xgAgainst);
  const weightedXgFor = calculateWeightedXG(xgFor, oppPpg, 1.5);
  const weightedXgAgainst = calculateWeightedXG(xgAgainst, oppPpg, 1.5);
  const weightedXgForLast5 = calculateWeightedXG(xgForLast5, oppPpgLast5, 1.5);
  const weightedXgAgainstLast5 = calculateWeightedXG(
    xgAgainstLast5,
    oppPpgLast5,
    1.5
  );

  const goalsForLast5 = avg(last5.map((r) => r.scored));
  const goalsAgainstLast5 = avg(last5.map((r) => r.conceeded));
  const daForLast5 = avg(last5.map((r) => r.dangerousAttacks), 45);
  const daAgainstLast5 = avg(
    last5.map((r) => r.dangerousAttacksAgainst),
    45
  );
  const sotForLast5 = avg(last5.map((r) => r.sot));
  const sotAgainstLast5 = avg(last5.map((r) => r.sotAgainst));
  const xgForLast5Avg = avg(xgForLast5);
  const xgAgainstLast5Avg = avg(xgAgainstLast5);
  const shotsFor = avg(allTeamResults.map((r) => r.shots));
  const shotsAgainst = avg(allTeamResults.map((r) => r.shotsAgainst));
  const shotsForLast5 = avg(last5.map((r) => r.shots));
  const shotsAgainstLast5 = avg(last5.map((r) => r.shotsAgainst));
  const cornersFor = avg(allTeamResults.map((r) => r.corners));
  const cornersAgainst = avg(allTeamResults.map((r) => r.cornersAgainst));
  const possessionLast5 = avg(last5.map((r) => r.possession));

  const bttsPct =
    (allTeamResults.filter((r) => r.btts).length / allTeamResults.length) * 100;
  const cleanSheetPct =
    (allTeamResults.filter((r) => Number(r.conceeded) === 0).length /
      allTeamResults.length) *
    100;
  const winPct =
    (allTeamResults.filter((r) => r.result === "W").length /
      allTeamResults.length) *
    100;
  const avgPoints = avg(allTeamResults.map((r) => r.points));
  const possession = avg(allTeamResults.map((r) => r.possession));
  const shotConversionPct =
    shotsFor > 0 ? (goalsFor / shotsFor) * 100 : 0;
  const sotConversionPct = sotFor > 0 ? (goalsFor / sotFor) * 100 : 0;

  const strengthOptions = options.international ? { international: true } : {};

  const attackingMetrics = {
    "Average Dangerous Attacks": daFor,
    "Average Shots On Target": sotFor,
    "Average Expected Goals": xgForAvg,
    "Weighted XG": weightedXgFor || xgForAvg,
    "Average Goals": goalsFor,
  };

  const attackingMetricsLast5 = {
    "Average Dangerous Attacks": daForLast5,
    "Average Shots On Target": sotForLast5,
    "Average Expected Goals": xgForLast5Avg,
    "Weighted XG": weightedXgForLast5 || xgForLast5Avg,
    "Average Goals": goalsForLast5,
  };

  const defensiveMetrics = {
    "Average XG Against": xgAgainstAvg,
    "Weighted XG Against": weightedXgAgainst || xgAgainstAvg,
    "Average Goals Against": goalsAgainst,
    "Average SOT Against": sotAgainst,
    "Average Dangerous Attacks Against": daAgainst,
  };

  const defensiveMetricsLast5 = {
    "Average XG Against": xgAgainstLast5Avg,
    "Weighted XG Against": weightedXgAgainstLast5 || xgAgainstLast5Avg,
    "Average Goals Against": goalsAgainstLast5,
    "Average SOT Against": sotAgainstLast5,
    "Average Dangerous Attacks Against": daAgainstLast5,
  };

  const [
    attackingStrength,
    defensiveStrength,
    attackingStrengthLast5,
    defensiveStrengthLast5,
  ] = await Promise.all([
    calculateAttackingStrength(attackingMetrics, false, strengthOptions),
    calculateDefensiveStrength(defensiveMetrics, false, strengthOptions),
    calculateAttackingStrength(attackingMetricsLast5, true, strengthOptions),
    calculateDefensiveStrength(defensiveMetricsLast5, true, strengthOptions),
  ]);

  return {
    name: teamName,
    gamesPlayed: allTeamResults.length,
    homeGames: homeResults.length,
    awayGames: awayResults.length,
    attackingStrength,
    defensiveStrength,
    attackingStrengthLast5,
    defensiveStrengthLast5,
    xgFor: round(xgForAvg),
    xgAgainst: round(xgAgainstAvg),
    xgDiff: round(xgForAvg - xgAgainstAvg),
    goalsFor: round(goalsFor),
    goalsAgainst: round(goalsAgainst),
    goalDiff: round(goalsFor - goalsAgainst),
    daFor: round(daFor, 1),
    daAgainst: round(daAgainst, 1),
    sotFor: round(sotFor, 1),
    sotAgainst: round(sotAgainst, 1),
    shotsFor: round(shotsFor, 1),
    shotsAgainst: round(shotsAgainst, 1),
    cornersFor: round(cornersFor, 1),
    cornersAgainst: round(cornersAgainst, 1),
    bttsPct: round(bttsPct, 1),
    cleanSheetPct: round(cleanSheetPct, 1),
    winPct: round(winPct, 1),
    avgPoints: round(avgPoints),
    possession: round(possession, 1),
    shotConversionPct: round(shotConversionPct, 1),
    sotConversionPct: round(sotConversionPct, 1),
    weightedXgFor: round(weightedXgFor),
    weightedXgAgainst: round(weightedXgAgainst),
    xgForLast5: round(xgForLast5Avg),
    xgAgainstLast5: round(xgAgainstLast5Avg),
    goalsForLast5: round(goalsForLast5),
    goalsAgainstLast5: round(goalsAgainstLast5),
    daForLast5: round(daForLast5, 1),
    daAgainstLast5: round(daAgainstLast5, 1),
    sotForLast5: round(sotForLast5, 1),
    sotAgainstLast5: round(sotAgainstLast5, 1),
    shotsForLast5: round(shotsForLast5, 1),
    shotsAgainstLast5: round(shotsAgainstLast5, 1),
    possessionLast5: round(possessionLast5, 1),
  };
}
