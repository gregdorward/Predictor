import {
  calculateAttackingStrength,
  calculateDefensiveStrength,
  calculateMetricStrength,
} from "./getStats";

/**
 * Strength ratings for the competition's average team (from
 * `buildCompetitionAverageTeam`), in the radar's axis order: Attack, Defence,
 * Possession, XGF, XGA, Directness, Precision.
 */
export async function buildCompetitionAverageRadar(averageTeam, strengthOptions = {}) {
  const stats = averageTeam?.overall;
  if (!stats) return null;

  const { scored: goals, xg, npXG, shots, sot, dangerousAttacks, points } = stats;
  const possession = stats.possession ?? 50;

  const attackingMetrics = {
    "Average Dangerous Attacks": dangerousAttacks,
    "Average Shots": shots,
    "Average Shots On Target": sot,
    "Average Expected Goals": npXG,
    "Weighted XG": npXG,
    "Average Goals": goals,
    "Expected Points": points,
  };
  // Team ratings feed 100 minus the clean sheet % into this metric.
  const defensiveMetrics = {
    "Clean Sheet Percentage": 100 - stats.cleanSheet,
    "Average XG Against": npXG,
    "Weighted XG Against": npXG,
    "Average Goals Against": goals,
    "Average SOT Against": sot,
    "Average Dangerous Attacks Against": dangerousAttacks,
  };

  const [attack, attackLast5, defence, defenceLast5] = await Promise.all([
    calculateAttackingStrength(attackingMetrics, false, strengthOptions),
    calculateAttackingStrength(attackingMetrics, true, strengthOptions),
    calculateDefensiveStrength(defensiveMetrics, false, strengthOptions),
    calculateDefensiveStrength(defensiveMetrics, true, strengthOptions),
  ]);

  const metricStrength = (name, value) =>
    Number.isFinite(value) ? calculateMetricStrength(name, value) : null;

  const [possessionStrength, xgFor, xgAgainst, directness, precision] =
    await Promise.all([
      metricStrength("averagePossession", possession),
      metricStrength("xgFor", xg),
      metricStrength("xgAgainst", 3 - xg),
      metricStrength("directnessOverall", shots ? (shots / possession) * 10 : null),
      metricStrength("accuracyOverall", shots ? (xg / shots) * 100 * goals : null),
    ]);

  const sharedAxes = [possessionStrength, xgFor, xgAgainst, directness, precision];
  return {
    overall: [attack, defence, ...sharedAxes],
    last5: [attackLast5, defenceLast5, ...sharedAxes],
  };
}
