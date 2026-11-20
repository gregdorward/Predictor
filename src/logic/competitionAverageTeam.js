import { resolveTeamXgAndNpXg } from "./nonPenaltyXg";
import { isCompleteLeagueHistoryFixture } from "../utils/leagueResultsAccess";

const MIN_COMPLETED_FIXTURES = 10;

function positiveOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function nonNegativeOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function sideStats(fixture, prefix, goals) {
  const { xg, npXG } = resolveTeamXgAndNpXg(
    fixture[`${prefix}_xg`],
    goals,
    fixture.pens_recorded,
    fixture[`${prefix}_penalties_won`]
  );
  const shots = positiveOrNull(fixture[`${prefix}_shots`]);
  return {
    xg,
    npXG,
    shots,
    sot: shots == null ? null : nonNegativeOrNull(fixture[`${prefix}_shotsOnTarget`]),
    dangerousAttacks: positiveOrNull(fixture[`${prefix}_dangerous_attacks`]),
    possession: positiveOrNull(fixture[`${prefix}_possession`]),
    corners: nonNegativeOrNull(fixture[`${prefix}_corners`]),
    redCards: nonNegativeOrNull(fixture[`${prefix}_red_cards`]),
  };
}

function teamGameFromFixture(fixture, isHome) {
  const homeGoals = Number(fixture.homeGoalCount);
  const awayGoals = Number(fixture.awayGoalCount);
  const home = sideStats(fixture, "team_a", homeGoals);
  const away = sideStats(fixture, "team_b", awayGoals);
  const own = isHome ? home : away;
  const opponent = isHome ? away : home;
  const scored = isHome ? homeGoals : awayGoals;
  const conceded = isHome ? awayGoals : homeGoals;

  return {
    ...own,
    scored,
    conceded,
    xgAgainst: opponent.xg,
    npXGAgainst: opponent.npXG,
    sotAgainst: opponent.sot,
    points: scored > conceded ? 3 : scored === conceded ? 1 : 0,
    cleanSheet: conceded === 0 ? 100 : 0,
  };
}

function mean(games, key) {
  const values = games
    .map((game) => game[key])
    .filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const AVERAGED_KEYS = [
  "scored",
  "conceded",
  "xg",
  "npXG",
  "xgAgainst",
  "npXGAgainst",
  "shots",
  "sot",
  "sotAgainst",
  "dangerousAttacks",
  "possession",
  "corners",
  "redCards",
  "points",
  "cleanSheet",
];

function summarise(games) {
  return Object.fromEntries(AVERAGED_KEYS.map((key) => [key, mean(games, key)]));
}

/** Completed fixtures from before the day of `asOfUnix`, the same cutoff team form uses. */
export function completedFixturesBefore(leagueFixtures, asOfUnix) {
  const cutoff = Number(asOfUnix) - 86400;
  if (!Array.isArray(leagueFixtures) || !Number.isFinite(cutoff)) return [];
  return leagueFixtures.filter(
    (fixture) =>
      isCompleteLeagueHistoryFixture(fixture) &&
      Number(fixture.date_unix) < cutoff
  );
}

/**
 * Per-game averages for a typical team in the competition, from fixtures
 * completed before the day of `asOfUnix`. `home` and `away` cover only the
 * home or away side of each fixture; `overall` covers both, so its for and
 * against figures match. Returns null with fewer than 10 completed fixtures.
 */
export function buildCompetitionAverageTeam(leagueFixtures, asOfUnix) {
  const fixtures = completedFixturesBefore(leagueFixtures, asOfUnix);
  if (fixtures.length < MIN_COMPLETED_FIXTURES) return null;

  const homeGames = fixtures.map((fixture) => teamGameFromFixture(fixture, true));
  const awayGames = fixtures.map((fixture) => teamGameFromFixture(fixture, false));

  return {
    fixtureCount: fixtures.length,
    overall: summarise([...homeGames, ...awayGames]),
    home: summarise(homeGames),
    away: summarise(awayGames),
  };
}
