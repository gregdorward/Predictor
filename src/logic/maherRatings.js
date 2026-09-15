/**
 * Maher-style attack/defence ratings from league history.
 *
 * For each team before asOf: attack = mean xG (else goals) for;
 * defence = mean xG (else goals) against. Ratings are league-normalised
 * to mean 1, then shrunk toward 1 when sample size is small.
 *
 * λ_home ≈ μ_home × att_home × def_away
 * λ_away ≈ μ_away × att_away × def_home
 */

import {
  getLeagueFixturesByLeagueId,
  isCompleteLeagueHistoryFixture,
  teamNamesMatch,
} from "../utils/leagueResultsAccess.js";

const ratingCache = new Map();

function finitePositive(value, fallback = null) {
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) return n;
  return fallback;
}

function resolveTeamXg(rawXg, goalsFallback) {
  const xg = Number(rawXg);
  if (Number.isFinite(xg) && xg > 0 && xg <= 7) return xg;
  const goals = Number(goalsFallback);
  return Number.isFinite(goals) && goals >= 0 ? goals : 0;
}

function dayKey(asOfUnix) {
  const t = Number(asOfUnix);
  if (!Number.isFinite(t) || t <= 0) return "0";
  return String(Math.floor(t / 86400));
}

function shrinkToOne(value, games, fullSample = 8) {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return 1;
  const n = Number(games);
  if (!Number.isFinite(n) || n <= 0) return 1;
  const w = Math.min(1, Math.max(0, n / fullSample));
  return 1 + (v - 1) * w;
}

/**
 * @param {object[]} allLeagueResults
 * @param {number|string} leagueId
 * @param {number} asOfUnix seconds
 * @returns {{ byTeam: Map<string, { att: number, def: number, games: number }>, mu: number }}
 */
export function fitMaherRatings(allLeagueResults, leagueId, asOfUnix) {
  const cacheKey = `${leagueId}:${dayKey(asOfUnix)}`;
  if (ratingCache.has(cacheKey)) {
    return ratingCache.get(cacheKey);
  }

  const fixtures = getLeagueFixturesByLeagueId(allLeagueResults, leagueId);
  const asOf = Number(asOfUnix);
  const cutoff = Number.isFinite(asOf) && asOf > 0 ? asOf - 86400 : Infinity;

  /** @type {Map<string, { gf: number, ga: number, games: number }>} */
  const totals = new Map();

  const bump = (name, gf, ga) => {
    if (!name) return;
    const cur = totals.get(name) || { gf: 0, ga: 0, games: 0 };
    cur.gf += gf;
    cur.ga += ga;
    cur.games += 1;
    totals.set(name, cur);
  };

  for (const fixture of fixtures) {
    if (!isCompleteLeagueHistoryFixture(fixture)) continue;
    const dateUnix = Number(fixture.date_unix);
    if (!Number.isFinite(dateUnix) || dateUnix >= cutoff) continue;

    const homeName = fixture.home_name;
    const awayName = fixture.away_name;
    const homeXg = resolveTeamXg(fixture.team_a_xg, fixture.homeGoalCount);
    const awayXg = resolveTeamXg(fixture.team_b_xg, fixture.awayGoalCount);
    bump(homeName, homeXg, awayXg);
    bump(awayName, awayXg, homeXg);
  }

  let sumAtt = 0;
  let sumDef = 0;
  let teamCount = 0;
  for (const row of totals.values()) {
    if (row.games <= 0) continue;
    sumAtt += row.gf / row.games;
    sumDef += row.ga / row.games;
    teamCount += 1;
  }

  const meanAtt = teamCount > 0 ? sumAtt / teamCount : 1.25;
  const meanDef = teamCount > 0 ? sumDef / teamCount : 1.25;
  const mu = (meanAtt + meanDef) / 2;

  /** @type {Map<string, { att: number, def: number, games: number }>} */
  const byTeam = new Map();
  for (const [name, row] of totals.entries()) {
    const rawAtt = meanAtt > 0 ? row.gf / row.games / meanAtt : 1;
    const rawDef = meanDef > 0 ? row.ga / row.games / meanDef : 1;
    byTeam.set(name, {
      att: shrinkToOne(rawAtt, row.games),
      def: shrinkToOne(rawDef, row.games),
      games: row.games,
    });
  }

  const fitted = { byTeam, mu: finitePositive(mu, 1.25) };
  ratingCache.set(cacheKey, fitted);
  return fitted;
}

export function clearMaherRatingCache() {
  ratingCache.clear();
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
 * Build home/away λ from Maher ratings.
 *
 * homeAdvMode:
 * - split (default): λ = μ_venue × att × def (separate league home/away μ)
 * - gamma: one shared μ; home only multiplied by γ = μ_home / μ
 * - none: shared μ, no home boost
 *
 * @returns {{ home: number, away: number, attHome: number, defHome: number, attAway: number, defAway: number, gamma?: number } | null}
 */
export function maherLambdas({
  allLeagueResults,
  leagueId,
  asOfUnix,
  homeTeam,
  awayTeam,
  averageGoalsHome,
  averageGoalsAway,
  averageGoalsPerTeam = null,
  neutralVenue = false,
  homeAdvMode = "split",
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

  const mode = String(homeAdvMode || "split").toLowerCase();

  if (neutralVenue || mode === "none") {
    const mu = finitePositive(
      averageGoalsPerTeam,
      finitePositive(
        (Number(averageGoalsHome) + Number(averageGoalsAway)) / 2,
        fitted.mu
      )
    );
    return {
      home: Math.max(0.05, mu * attHome * defAway),
      away: Math.max(0.05, mu * attAway * defHome),
      attHome,
      defHome,
      attAway,
      defAway,
      gamma: 1,
    };
  }

  if (mode === "gamma") {
    const muHome = finitePositive(averageGoalsHome, fitted.mu * 1.1);
    const muAway = finitePositive(averageGoalsAway, fitted.mu * 0.9);
    const mu = finitePositive(
      averageGoalsPerTeam,
      (muHome + muAway) / 2
    );
    const gamma = mu > 0 ? muHome / mu : 1;
    return {
      home: Math.max(0.05, mu * attHome * defAway * gamma),
      away: Math.max(0.05, mu * attAway * defHome),
      attHome,
      defHome,
      attAway,
      defAway,
      gamma,
    };
  }

  // split: separate venue baselines
  let muHome = finitePositive(averageGoalsHome, fitted.mu);
  let muAway = finitePositive(averageGoalsAway, fitted.mu);

  return {
    home: Math.max(0.05, muHome * attHome * defAway),
    away: Math.max(0.05, muAway * attAway * defHome),
    attHome,
    defHome,
    attAway,
    defAway,
    gamma: muAway > 0 ? muHome / muAway : 1,
  };
}
