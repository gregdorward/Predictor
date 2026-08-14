/** Footystats allocate this xG value for each penalty awarded. */
export const PENALTY_XG = 0.76;

/**
 * Prefer non-penalty xG when present; otherwise fall back to original xG.
 * Used by attack/defence strength and display when getPastLeagueResults did not run.
 */
export function npxgOrXg(npValue, xgValue) {
  if (npValue === null || npValue === undefined || npValue === "") {
    const xg = Number(xgValue);
    return Number.isFinite(xg) ? xg : xgValue;
  }
  const np = Number(npValue);
  if (Number.isFinite(np)) {
    return np;
  }
  const xg = Number(xgValue);
  return Number.isFinite(xg) ? xg : xgValue;
}

/**
 * Copy metrics for strength scoring, replacing named keys with npxG
 * (falling back to original xG when npxG was never computed).
 */
export function metricsWithNpXg(metrics, substitutions) {
  const copy = { ...metrics };
  for (const [key, [npValue, xgFallback]] of Object.entries(substitutions)) {
    if (Object.prototype.hasOwnProperty.call(copy, key)) {
      copy[key] = npxgOrXg(npValue, xgFallback ?? copy[key]);
    }
  }
  return copy;
}

/**
 * Deduct Footystats penalty xG from a per-match xG figure.
 *
 * @param {number} xg - Resolved xG used for the team (may already be a goals fallback)
 * @param {{ pensRecorded?: number, penaltiesWon?: number, usedGoalsFallback?: boolean }} options
 * @returns {number}
 */
export function toNonPenaltyXg(
  xg,
  { pensRecorded, penaltiesWon, usedGoalsFallback = false } = {}
) {
  const base = Number(xg);
  if (!Number.isFinite(base)) {
    return 0;
  }
  if (usedGoalsFallback) {
    return Math.max(0, base);
  }
  if (pensRecorded !== 1) {
    return Math.max(0, base);
  }
  const pens = Number(penaltiesWon);
  if (!Number.isFinite(pens) || pens <= 0) {
    return Math.max(0, base);
  }
  return Math.max(0, base - pens * PENALTY_XG);
}

/**
 * Resolve raw Footystats team xG the same way getPastLeagueResults does,
 * then convert to non-penalty xG when penalty data is available.
 */
export function resolveTeamXgAndNpXg(rawXg, goalsFallback, pensRecorded, penaltiesWon) {
  const xgNum = Number(rawXg);
  const usedGoalsFallback = !Number.isFinite(xgNum) || xgNum <= 0 || xgNum > 7;
  const xg = usedGoalsFallback ? Number(goalsFallback) || 0 : xgNum;
  const npXG = toNonPenaltyXg(xg, {
    pensRecorded,
    penaltiesWon,
    usedGoalsFallback,
  });
  return { xg, npXG, usedGoalsFallback };
}
