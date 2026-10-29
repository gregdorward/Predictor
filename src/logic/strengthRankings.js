/**
 * Strength rankings over the last six completed matches, with a second
 * ranking over the last ten. Six is the published default.
 *
 * Every club starts at its competition base. The window is walked from that
 * base, newest game weighing more. Each result is scored against what the
 * current ratings expected. A wider win adds more than a one-goal win, on the
 * World Football Elo goal-difference scale, and a wider defeat subtracts more.
 * The pass then repeats so a win over a side that has itself been winning is
 * worth more than a win over a side that has been losing.
 *
 * Domestic order uses league matches only. The global list also counts
 * Champions League, Europa League, Conference League, Copa Libertadores and
 * Nations League ties when both names resolve to exactly one domestic club.
 */

import { teamNamesMatch, isCompleteLeagueHistoryFixture } from "../utils/leagueResultsAccess";
import { resolveFootyStatsLeagueId } from "../seo/competitionCatalog";
import {
  CONTINENTAL_STRENGTH_LEAGUES,
  DOMESTIC_STRENGTH_LEAGUES,
  countryForStrengthLeague,
  getDomesticStrengthLeague,
  groupDomesticLeagues,
  isContinentalStrengthLeague,
} from "./competitionStrengthBases";

export const STRENGTH_WINDOW = 6;
export const STRENGTH_LONG_WINDOW = 10;
const RECENCY_NEWEST = 0.9;

/**
 * Newest game first. The latest result weighs twice the oldest game in the
 * window, in even steps, and the newest weight stays 0.9 in both windows.
 */
export function recencyWeights(windowSize) {
  const count = Math.max(1, Math.round(Number(windowSize)));
  const oldest = RECENCY_NEWEST / 2;
  if (count === 1) return [RECENCY_NEWEST];
  return Array.from({ length: count }, (_, index) => {
    const weight = RECENCY_NEWEST - ((RECENCY_NEWEST - oldest) * index) / (count - 1);
    return Math.round(weight * 100) / 100;
  });
}
export const STRENGTH_SCALE = 400;
/**
 * Chosen here, not taken from ClubElo. When two clubs are level, 65 points
 * makes the home side's expected result about 0.59, where a win is 1 and a
 * draw is 0.5. World Football Elo uses 100 for the same term.
 */
export const STRENGTH_HOME_ADVANTAGE = 65;
/** Goal difference at which the margin weight stops growing. */
export const STRENGTH_MARGIN_CAP = 6;
/**
 * Walks the six games from the league base. Large enough that a win over a
 * strong side pulls away from six wins over weak ones. The ClubElo gap from
 * the Premier League to Serie B is about 300, and one window cannot close
 * that. The published bases are drawn together afterwards, so a hot run in a
 * lower division can now reach the bottom of a higher one.
 */
export const STRENGTH_K = 24;
/** Newest game first, for the default six-game window. */
export const STRENGTH_RECENCY = recencyWeights(STRENGTH_WINDOW);
const MAX_PASSES = 16;
const SETTLE_EPSILON = 0.2;

export function expectedStrengthScore(rating, opponentRating, isHome) {
  const diff =
    rating -
    opponentRating +
    (isHome ? STRENGTH_HOME_ADVANTAGE : -STRENGTH_HOME_ADVANTAGE);
  return 1 / (1 + 10 ** (-diff / STRENGTH_SCALE));
}

/**
 * World Football Elo goal-difference index. A draw or a one-goal game is 1,
 * a two-goal win is 1.5, and a wider win is (11 + margin) / 8. Capped so six
 * games still cannot close the Premier League to Serie B gap.
 */
export function strengthMarginWeight(goalsFor, goalsAgainst) {
  const margin = Math.min(
    STRENGTH_MARGIN_CAP,
    Math.abs(Number(goalsFor) - Number(goalsAgainst))
  );
  if (!Number.isFinite(margin) || margin <= 1) return 1;
  if (margin === 2) return 1.5;
  return (11 + margin) / 8;
}

function actualScore(goalsFor, goalsAgainst) {
  if (goalsFor > goalsAgainst) return 1;
  if (goalsFor < goalsAgainst) return 0;
  return 0.5;
}

function resultLetter(goalsFor, goalsAgainst) {
  if (goalsFor > goalsAgainst) return "W";
  if (goalsFor < goalsAgainst) return "L";
  return "D";
}

function unwrapLeagues(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function completeFixtures(entry) {
  const fixtures = Array.isArray(entry?.fixtures) ? entry.fixtures : [];
  return fixtures.filter((fixture) => {
    if (!isCompleteLeagueHistoryFixture(fixture)) return false;
    if (!fixture?.home_name || !fixture?.away_name) return false;
    if (!Number.isFinite(Number(fixture.date_unix))) return false;
    const homeGoals = Number(fixture.homeGoalCount);
    const awayGoals = Number(fixture.awayGoalCount);
    return Number.isFinite(homeGoals) && Number.isFinite(awayGoals);
  });
}

function clubKey(leagueId, name) {
  return `${leagueId}::${name}`;
}

/**
 * Names that teamNamesMatch treats as the same club collapse to the first
 * spelling seen. Exact strings stay distinct when the fuzzy match is ambiguous.
 */
function canonicalNames(fixtures) {
  const names = [];
  for (const fixture of fixtures) {
    for (const raw of [fixture.home_name, fixture.away_name]) {
      if (!raw) continue;
      const hits = names.filter((name) => teamNamesMatch(name, raw));
      if (hits.length === 0) names.push(raw);
    }
  }
  return names;
}

function resolveLocalName(names, raw) {
  if (!raw) return null;
  if (names.includes(raw)) return raw;
  const hits = names.filter((name) => teamNamesMatch(name, raw));
  return hits.length === 1 ? hits[0] : null;
}

function resolveDomesticClub(clubs, raw) {
  if (!raw) return null;
  const exact = clubs.filter((club) => club.name === raw);
  if (exact.length === 1) return exact[0];
  const hits = clubs.filter((club) => teamNamesMatch(club.name, raw));
  return hits.length === 1 ? hits[0] : null;
}

function newestFirst(games) {
  return [...games].sort((a, b) => {
    if (b.dateUnix !== a.dateUnix) return b.dateUnix - a.dateUnix;
    return String(a.opponentName).localeCompare(String(b.opponentName));
  });
}

/**
 * @param {{ key: string, base: number }[]} clubs
 * @param {Map<string, object[]>} gamesByClub newest-first already, uncropped
 */
function rateClubs(clubs, gamesByClub, windowSize = STRENGTH_WINDOW) {
  const weights = recencyWeights(windowSize);
  let ratings = new Map(clubs.map((club) => [club.key, club.base]));
  let contributions = new Map();

  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    const next = new Map();
    const nextContributions = new Map();
    let maxMove = 0;

    for (const club of clubs) {
      const newestFirstGames = (gamesByClub.get(club.key) || []).slice(0, windowSize);
      const chronological = [...newestFirstGames].reverse();
      let rating = club.base;
      const rows = [];

      chronological.forEach((game, index) => {
        const opponentRating = ratings.get(game.opponentKey);
        if (!Number.isFinite(opponentRating)) return;
        const recencyIndex = chronological.length - 1 - index;
        const weight = weights[recencyIndex] ?? weights[weights.length - 1];
        const expected = expectedStrengthScore(rating, opponentRating, game.isHome);
        const actual = actualScore(game.goalsFor, game.goalsAgainst);
        const marginWeight = strengthMarginWeight(game.goalsFor, game.goalsAgainst);
        const delta = STRENGTH_K * weight * marginWeight * (actual - expected);
        rating += delta;
        rows.push({
          ...game,
          opponentRating,
          delta,
          result: resultLetter(game.goalsFor, game.goalsAgainst),
        });
      });

      const played = rows.length;
      if (played > 0 && played < windowSize) {
        const surplus = rating - club.base;
        const shrunk = surplus * (played / windowSize);
        const scale = surplus === 0 ? 0 : shrunk / surplus;
        rating = club.base + shrunk;
        rows.forEach((row) => {
          row.delta *= scale;
        });
      }

      next.set(club.key, rating);
      nextContributions.set(club.key, rows.reverse());
      maxMove = Math.max(maxMove, Math.abs(rating - ratings.get(club.key)));
    }

  ratings = next;
    contributions = nextContributions;
    if (maxMove < SETTLE_EPSILON) break;
  }

  for (const games of contributions.values()) {
    for (const game of games) {
      const settled = ratings.get(game.opponentKey);
      if (Number.isFinite(settled)) game.opponentRating = settled;
    }
  }

  return { ratings, contributions };
}

function assignRanks(rows) {
  let lastRating = null;
  let lastRank = 0;
  rows.forEach((row, index) => {
    if (row.rating !== lastRating) {
      lastRank = index + 1;
      lastRating = row.rating;
    }
    row.rank = lastRank;
  });
  return rows;
}

function toPublicMatch(game, rankByKey) {
  return {
    dateUnix: game.dateUnix,
    opponent: game.opponentName,
    opponentLeague: game.opponentLeague,
    opponentRating: Math.round(game.opponentRating),
    opponentRank: rankByKey.get(game.opponentKey) ?? null,
    isHome: game.isHome,
    homeGoals: game.isHome ? game.goalsFor : game.goalsAgainst,
    awayGoals: game.isHome ? game.goalsAgainst : game.goalsFor,
    result: game.result,
    delta: Math.round(game.delta * 10) / 10,
  };
}

function formString(matchesNewestFirst) {
  return [...matchesNewestFirst].reverse().map((game) => game.result).join("");
}

function publicTeam(club, rating, games, rankByKey) {
  const matches = games.map((game) => toPublicMatch(game, rankByKey));
  return {
    name: club.name,
    leagueId: club.leagueId,
    leagueName: club.leagueName,
    leagueSlug: club.leagueSlug,
    base: club.base,
    rating: Math.round(rating),
    played: matches.length,
    form: formString(games),
    matches,
  };
}

/**
 * @param {unknown} resultsPayload /results body: an array, or `{ data: [] }`
 * @param {{ generatedAt?: string }} [options]
 */
export function buildStrengthOverview(resultsPayload, options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const entries = unwrapLeagues(resultsPayload);
  const byId = new Map();
  for (const entry of entries) {
    const id = resolveFootyStatsLeagueId(entry?.id);
    if (id == null) continue;
    if (!byId.has(id)) byId.set(id, entry);
  }

  const clubs = [];
  /** @type {Map<string, object[]>} */
  const domesticGames = new Map();

  for (const league of DOMESTIC_STRENGTH_LEAGUES) {
    const entry = byId.get(league.id);
    if (!entry) continue;
    const fixtures = completeFixtures(entry);
    if (!fixtures.length) continue;
    const names = canonicalNames(fixtures);
    const leagueClubs = names.map((name) => ({
      key: clubKey(league.id, name),
      name,
      leagueId: league.id,
      leagueName: league.name,
      leagueSlug: league.slug,
      base: league.base,
    }));
    const localByName = new Map(leagueClubs.map((club) => [club.name, club]));

    for (const club of leagueClubs) {
      const games = [];
      for (const fixture of fixtures) {
        const home = resolveLocalName(names, fixture.home_name);
        const away = resolveLocalName(names, fixture.away_name);
        if (!home || !away || home === away) continue;
        const isHome = home === club.name;
        const isAway = away === club.name;
        if (!isHome && !isAway) continue;
        const opponentName = isHome ? away : home;
        const opponent = localByName.get(opponentName);
        if (!opponent) continue;
        games.push({
          dateUnix: Number(fixture.date_unix),
          opponentKey: opponent.key,
          opponentName: opponent.name,
          opponentLeague: league.name,
          isHome,
          goalsFor: Number(isHome ? fixture.homeGoalCount : fixture.awayGoalCount),
          goalsAgainst: Number(isHome ? fixture.awayGoalCount : fixture.homeGoalCount),
        });
      }
      const recent = newestFirst(games);
      if (!recent.length) continue;
      clubs.push(club);
      domesticGames.set(club.key, recent);
    }
  }

  const activeKeys = new Set(clubs.map((club) => club.key));
  const globalGames = new Map(
    clubs.map((club) => [club.key, [...(domesticGames.get(club.key) || [])]])
  );

  for (const competition of CONTINENTAL_STRENGTH_LEAGUES) {
    const entry = byId.get(competition.id);
    if (!entry) continue;
    for (const fixture of completeFixtures(entry)) {
      const home = resolveDomesticClub(clubs, fixture.home_name);
      const away = resolveDomesticClub(clubs, fixture.away_name);
      if (!home || !away || home.key === away.key) continue;
      if (!activeKeys.has(home.key) || !activeKeys.has(away.key)) continue;
      const dateUnix = Number(fixture.date_unix);
      const homeGoals = Number(fixture.homeGoalCount);
      const awayGoals = Number(fixture.awayGoalCount);
      globalGames.get(home.key).push({
        dateUnix,
        opponentKey: away.key,
        opponentName: away.name,
        opponentLeague: away.leagueName,
        isHome: true,
        goalsFor: homeGoals,
        goalsAgainst: awayGoals,
      });
      globalGames.get(away.key).push({
        dateUnix,
        opponentKey: home.key,
        opponentName: home.name,
        opponentLeague: home.leagueName,
        isHome: false,
        goalsFor: awayGoals,
        goalsAgainst: homeGoals,
      });
    }
  }

  for (const [key, games] of globalGames) {
    globalGames.set(key, newestFirst(games));
  }

  const domesticByLeague = new Map();
  for (const club of clubs) {
    if (!domesticByLeague.has(club.leagueId)) domesticByLeague.set(club.leagueId, []);
    domesticByLeague.get(club.leagueId).push(club);
  }

  function publish(windowSize) {
    const leagues = [];
    for (const league of DOMESTIC_STRENGTH_LEAGUES) {
      const leagueClubs = domesticByLeague.get(league.id);
      if (!leagueClubs?.length) continue;
      const games = new Map(
        leagueClubs.map((club) => [club.key, domesticGames.get(club.key) || []])
      );
      const { ratings, contributions } = rateClubs(leagueClubs, games, windowSize);
      const rows = leagueClubs
        .map((club) => ({
          club,
          rating: ratings.get(club.key),
          games: contributions.get(club.key) || [],
        }))
        .sort((a, b) => b.rating - a.rating || a.club.name.localeCompare(b.club.name));
      const ranked = assignRanks(
        rows.map((row) => publicTeam(row.club, row.rating, row.games, new Map()))
      );
      const rankByKey = new Map(
        rows.map((row, index) => [row.club.key, ranked[index].rank])
      );
      const teams = rows.map((row) =>
        publicTeam(row.club, row.rating, row.games, rankByKey)
      );
      assignRanks(teams);
      leagues.push({
        id: league.id,
        slug: league.slug,
        name: league.name,
        country: countryForStrengthLeague(league),
        base: league.base,
        ...(Number.isFinite(league.clubElo) ? { clubElo: league.clubElo } : {}),
        source: league.source,
        teams,
      });
    }

    const { ratings: globalRatings, contributions: globalContributions } = rateClubs(
      clubs,
      globalGames,
      windowSize
    );
    const globalRows = clubs
      .map((club) => ({
        club,
        rating: globalRatings.get(club.key),
        games: globalContributions.get(club.key) || [],
      }))
      .sort((a, b) => b.rating - a.rating || a.club.name.localeCompare(b.club.name));
    const globalRanked = assignRanks(
      globalRows.map((row) => publicTeam(row.club, row.rating, row.games, new Map()))
    );
    const globalRankByKey = new Map(
      globalRows.map((row, index) => [row.club.key, globalRanked[index].rank])
    );
    const global = globalRows.map((row) =>
      publicTeam(row.club, row.rating, row.games, globalRankByKey)
    );
    assignRanks(global);
    return { leagues, global };
  }

  const six = publish(STRENGTH_WINDOW);
  const ten = publish(STRENGTH_LONG_WINDOW);

  return {
    generatedAt,
    window: STRENGTH_WINDOW,
    windows: {
      [STRENGTH_WINDOW]: six,
      [STRENGTH_LONG_WINDOW]: ten,
    },
    basesAsOf: "2026-10-28",
    global: six.global,
    leagues: six.leagues,
  };
}

export function isValidStrengthOverviewPayload(payload) {
  if (!payload || typeof payload.generatedAt !== "string") return false;
  if (!Array.isArray(payload.global) || !Array.isArray(payload.leagues)) return false;
  return payload.leagues.every(
    (league) =>
      league &&
      typeof league.slug === "string" &&
      typeof league.name === "string" &&
      Number.isFinite(Number(league.base)) &&
      Array.isArray(league.teams)
  );
}

export function maxLastSixSwing() {
  const weightSum = STRENGTH_RECENCY.reduce((sum, weight) => sum + weight, 0);
  return STRENGTH_K * weightSum * strengthMarginWeight(STRENGTH_MARGIN_CAP, 0);
}

export {
  countryForStrengthLeague,
  getDomesticStrengthLeague,
  groupDomesticLeagues,
  isContinentalStrengthLeague,
};
