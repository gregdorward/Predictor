/**
 * Goals-per-xG ratio from the same rolling fixture window when available.
 * Values > 1 mean overperformance vs xG; < 1 mean underperformance.
 */
export function computeGoalEfficiency(form) {
  const goals = Number(form?.teamGoalsRollingAverage ?? form?.avgScored);
  const xg = Number(form?.teamXGAllRollingAverage ?? form?.XGOverall);

  if (!Number.isFinite(goals) || !Number.isFinite(xg) || xg <= 0 || goals < 0) {
    return 1;
  }

  const efficiency = goals / xg;
  return Math.min(Math.max(efficiency, 0.5), 2);
}

/** Map finishing efficiency to a mean-reversion lambda multiplier. */
export function goalEfficiencyRegressionMultiplier(efficiency, { min = 0.8, max = 1.25 } = {}) {
  const value = Number(efficiency);
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }
  const raw = 1 / value;
  return Math.min(Math.max(raw, min), max);
}
