/**
 * Maher-style attack/defence ratings from league history.
 *
 * For each team before asOf: attack = mean rate for; defence = mean rate
 * against. Rate source is configurable (xg | npxg | goals | mix).
 * With iters>0, ratings are refined by dividing observed rates by the
 * opponent's current rating (classic Maher fixed-point), then
 * league-normalised and shrunk toward 1 when sample size is small.
 *
 * λ_home ≈ μ_home × att_home × def_away
 * λ_away ≈ μ_away × att_away × def_home
 */

import {
  getLeagueFixturesByLeagueId,
  isCompleteLeagueHistoryFixture,
  teamNamesMatch,
} from "../utils/leagueResultsAccess.js";
import { resolveTeamXgAndNpXg } from "./nonPenaltyXg.js";

const ratingCache = new Map();

const VALID_RATE_SOURCES = new Set(["xg", "npxg", "goals", "mix"]);

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

function normalizeRateSource(rateSource) {
  const key = String(rateSource || "xg")
    .trim()
    .toLowerCase();
  return VALID_RATE_SOURCES.has(key) ? key : "xg";
}

/**
 * Per-match attacking rate for one side.
 * @param {object} fixture
 * @param {"home"|"away"} side
 * @param {string} rateSource
 */
function teamRate(fixture, side, rateSource) {
  const isHome = side === "home";
  const rawXg = isHome ? fixture.team_a_xg : fixture.team_b_xg;
  const goals = Number(isHome ? fixture.homeGoalCount : fixture.awayGoalCount);
  const goalsSafe = Number.isFinite(goals) && goals >= 0 ? goals : 0;
  const source = normalizeRateSource(rateSource);

  if (source === "goals") {
    return goalsSafe;
  }

  if (source === "xg") {
    return resolveTeamXg(rawXg, goalsSafe);
  }

  const pensRecorded = fixture.pens_recorded;
  const pensWon = isHome
    ? fixture.team_a_penalties_won
    : fixture.team_b_penalties_won;
  const { npXG } = resolveTeamXgAndNpXg(
    rawXg,
    goalsSafe,
    pensRecorded,
    pensWon
  );

  if (source === "mix") {
    return 0.7 * npXG + 0.3 * goalsSafe;
  }

  return npXG;
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

function normalizeIters(iters) {
  const n = Number(iters);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(20, Math.round(n));
}

/**
 * @param {Map<string, { gf: number, ga: number, opp: string }[]>} windowedGames
 * @param {number} iters
 * @param {number} shrinkFull
 * @returns {{ byTeam: Map<string, { att: number, def: number, games: number }>, mu: number }}
 */
function ratingsFromGames(windowedGames, iters, shrinkFull) {
  /** @type {Map<string, { gf: number, ga: number, games: number }>} */
  const totals = new Map();
  for (const [name, games] of windowedGames.entries()) {
    const row = { gf: 0, ga: 0, games: 0 };
    for (const g of games) {
      row.gf += g.gf;
      row.ga += g.ga;
      row.games += 1;
    }
    totals.set(name, row);
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
  const mu = finitePositive((meanAtt + meanDef) / 2, 1.25);

  /** @type {Map<string, { att: number, def: number, games: number }>} */
  const byTeam = new Map();
  for (const [name, row] of totals.entries()) {
    const rawAtt = meanAtt > 0 ? row.gf / row.games / meanAtt : 1;
    const rawDef = meanDef > 0 ? row.ga / row.games / meanDef : 1;
    byTeam.set(name, {
      att: rawAtt,
      def: rawDef,
      games: row.games,
    });
  }

  const nIters = normalizeIters(iters);
  for (let i = 0; i < nIters; i += 1) {
    /** @type {Map<string, { att: number, def: number, games: number }>} */
    const next = new Map();
    let sumA = 0;
    let sumD = 0;
    let count = 0;

    for (const [name, games] of windowedGames.entries()) {
      if (!games.length) continue;
      let gfAdj = 0;
      let gaAdj = 0;
      for (const g of games) {
        const opp = byTeam.get(g.opp);
        const oppDef = finitePositive(opp?.def, 1);
        const oppAtt = finitePositive(opp?.att, 1);
        gfAdj += g.gf / oppDef;
        gaAdj += g.ga / oppAtt;
      }
      const n = games.length;
      const att = gfAdj / n / mu;
      const def = gaAdj / n / mu;
      next.set(name, { att, def, games: n });
      sumA += att;
      sumD += def;
      count += 1;
    }

    const meanA = count > 0 ? sumA / count : 1;
    const meanD = count > 0 ? sumD / count : 1;
    byTeam.clear();
    for (const [name, row] of next.entries()) {
      byTeam.set(name, {
        att: meanA > 0 ? row.att / meanA : 1,
        def: meanD > 0 ? row.def / meanD : 1,
        games: row.games,
      });
    }
  }

  for (const [name, row] of byTeam.entries()) {
    byTeam.set(name, {
      att: shrinkToOne(row.att, row.games, shrinkFull),
      def: shrinkToOne(row.def, row.games, shrinkFull),
      games: row.games,
    });
  }

  return { byTeam, mu };
}

/**
 * @param {object[]} allLeagueResults
 * @param {number|string} leagueId
 * @param {number} asOfUnix seconds
 * @param {{ maxGamesPerTeam?: number|null, rateSource?: string, iters?: number }} [options]
 * @returns {{ byTeam: Map<string, { att: number, def: number, games: number }>, mu: number }}
 */
export function fitMaherRatings(
  allLeagueResults,
  leagueId,
  asOfUnix,
  { maxGamesPerTeam = null, rateSource = "xg", iters = 0 } = {}
) {
  const cap =
    Number.isFinite(Number(maxGamesPerTeam)) && Number(maxGamesPerTeam) > 0
      ? Math.round(Number(maxGamesPerTeam))
      : null;
  const source = normalizeRateSource(rateSource);
  const nIters = normalizeIters(iters);
  const cacheKey = `${leagueId}:${dayKey(asOfUnix)}:${cap ?? "all"}:${source}:i${nIters}`;
  if (ratingCache.has(cacheKey)) {
    return ratingCache.get(cacheKey);
  }

  const fixtures = getLeagueFixturesByLeagueId(allLeagueResults, leagueId);
  const asOf = Number(asOfUnix);
  const cutoff = Number.isFinite(asOf) && asOf > 0 ? asOf - 86400 : Infinity;

  /** @type {Map<string, { gf: number, ga: number, opp: string, date: number }[]>} */
  const gamesByTeam = new Map();

  const pushGame = (name, gf, ga, opp, date) => {
    if (!name) return;
    const list = gamesByTeam.get(name) || [];
    list.push({ gf, ga, opp, date });
    gamesByTeam.set(name, list);
  };

  for (const fixture of fixtures) {
    if (!isCompleteLeagueHistoryFixture(fixture)) continue;
    const dateUnix = Number(fixture.date_unix);
    if (!Number.isFinite(dateUnix) || dateUnix >= cutoff) continue;

    const homeName = fixture.home_name;
    const awayName = fixture.away_name;
    const homeRate = teamRate(fixture, "home", source);
    const awayRate = teamRate(fixture, "away", source);
    pushGame(homeName, homeRate, awayRate, awayName, dateUnix);
    pushGame(awayName, awayRate, homeRate, homeName, dateUnix);
  }

  /** @type {Map<string, { gf: number, ga: number, opp: string }[]>} */
  const windowedGames = new Map();
  for (const [name, games] of gamesByTeam.entries()) {
    const ordered = [...games].sort((a, b) => b.date - a.date);
    const window = cap != null ? ordered.slice(0, cap) : ordered;
    windowedGames.set(
      name,
      window.map(({ gf, ga, opp }) => ({ gf, ga, opp }))
    );
  }

  const shrinkFull = cap != null ? Math.max(3, cap) : 8;
  const fitted = ratingsFromGames(windowedGames, nIters, shrinkFull);
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

function blendRating(seasonVal, recentVal, blend) {
  const b = Math.min(1, Math.max(0, Number(blend) || 0));
  const s = Number.isFinite(Number(seasonVal)) ? Number(seasonVal) : 1;
  const r = Number.isFinite(Number(recentVal)) ? Number(recentVal) : s;
  return (1 - b) * s + b * r;
}

/**
 * Build home/away λ from Maher ratings.
 *
 * homeAdvMode:
 * - split (default): λ = μ_venue × att × def (separate league home/away μ)
 * - gamma: one shared μ; home only multiplied by γ = μ_home / μ
 * - none: shared μ, no home boost
 *
 * recentBlend ∈ [0,1]: mix season ratings with last-`recentGames` ratings.
 * lastGameBlend ∈ [0,1]: after that, pull further toward last-1-game ratings.
 * rateSource: xg | npxg | goals | mix (0.7·npxG + 0.3·goals).
 * iters: opponent-adjusted Maher fixed-point iterations (0 = mean rates only).
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
  recentBlend = 0,
  recentGames = 5,
  lastGameBlend = 0,
  rateSource = "xg",
  iters = 0,
}) {
  const source = normalizeRateSource(rateSource);
  const nIters = normalizeIters(iters);
  const fitted = fitMaherRatings(allLeagueResults, leagueId, asOfUnix, {
    rateSource: source,
    iters: nIters,
  });
  if (!fitted?.byTeam?.size) return null;

  const blend = Math.min(1, Math.max(0, Number(recentBlend) || 0));
  const lastBlend = Math.min(1, Math.max(0, Number(lastGameBlend) || 0));
  let recentFitted = null;
  if (blend > 0) {
    recentFitted = fitMaherRatings(allLeagueResults, leagueId, asOfUnix, {
      maxGamesPerTeam: recentGames,
      rateSource: source,
      iters: nIters,
    });
  }

  let lastFitted = null;
  if (lastBlend > 0) {
    lastFitted = fitMaherRatings(allLeagueResults, leagueId, asOfUnix, {
      maxGamesPerTeam: 1,
      rateSource: source,
      iters: nIters,
    });
  }

  const home = lookupTeam(fitted.byTeam, homeTeam);
  const away = lookupTeam(fitted.byTeam, awayTeam);
  if (!home && !away) return null;

  const homeRecent = recentFitted
    ? lookupTeam(recentFitted.byTeam, homeTeam)
    : null;
  const awayRecent = recentFitted
    ? lookupTeam(recentFitted.byTeam, awayTeam)
    : null;
  const homeLast = lastFitted
    ? lookupTeam(lastFitted.byTeam, homeTeam)
    : null;
  const awayLast = lastFitted
    ? lookupTeam(lastFitted.byTeam, awayTeam)
    : null;

  let attHome = blendRating(home?.att ?? 1, homeRecent?.att, blend);
  let defHome = blendRating(home?.def ?? 1, homeRecent?.def, blend);
  let attAway = blendRating(away?.att ?? 1, awayRecent?.att, blend);
  let defAway = blendRating(away?.def ?? 1, awayRecent?.def, blend);
  attHome = blendRating(attHome, homeLast?.att, lastBlend);
  defHome = blendRating(defHome, homeLast?.def, lastBlend);
  attAway = blendRating(attAway, awayLast?.att, lastBlend);
  defAway = blendRating(defAway, awayLast?.def, lastBlend);

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
