/**
 * Additive expected-goals engine (Maher ratings, summed not multiplied).
 *
 * λ ≈ μ + μ · (att − 1) + μ · (def − 1)
 *   = μ · (att + def − 1)
 *
 * Same league-normalised xG/goals ratings as Maher, but extremes grow
 * linearly instead of as a product.
 */

import { fitMaherRatings } from "./maherRatings.js";
import { teamNamesMatch } from "../utils/leagueResultsAccess.js";

function finitePositive(value, fallback = null) {
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) return n;
  return fallback;
}

function lookupTeam(byTeam, teamName) {
  if (!teamName || !byTeam?.size) return null;
  if (byTeam.has(teamName)) return byTeam.get(teamName);
  for (const [name, row] of byTeam.entries()) {
    if (teamNamesMatch(name, teamName)) return row;
  }
  return null;
}

/**
 * Soft floor that stays smooth near zero: log(1+e^x) scaled is overkill;
 * clamp after the linear combination.
 */
export function additiveFromRatings(mu, att, def) {
  const m = finitePositive(mu, 1.25);
  const a = finitePositive(att, 1) ?? 1;
  const d = finitePositive(def, 1) ?? 1;
  return Math.max(0.05, m * (a + d - 1));
}

/**
 * @returns {{ home: number, away: number, attHome: number, defHome: number, attAway: number, defAway: number } | null}
 */
export function additiveLambdas({
  allLeagueResults,
  leagueId,
  asOfUnix,
  homeTeam,
  awayTeam,
  averageGoalsHome,
  averageGoalsAway,
  neutralVenue = false,
}) {
  const fitted = fitMaherRatings(allLeagueResults, leagueId, asOfUnix);
  if (!fitted?.byTeam?.size) return null;

  const home = lookupTeam(fitted.byTeam, homeTeam);
  const away = lookupTeam(fitted.byTeam, awayTeam);
  if (!home && !away) return null;

  const attHome = home?.att ?? 1;
  const defHome = home?.def ?? 1;
  const attAway = away?.att ?? 1;
  const defAway = away?.def ?? 1;

  let muHome = finitePositive(averageGoalsHome, fitted.mu);
  let muAway = finitePositive(averageGoalsAway, fitted.mu);
  if (neutralVenue) {
    const mid = (muHome + muAway) / 2;
    muHome = mid;
    muAway = mid;
  }

  return {
    home: additiveFromRatings(muHome, attHome, defAway),
    away: additiveFromRatings(muAway, attAway, defHome),
    attHome,
    defHome,
    attAway,
    defAway,
  };
}
