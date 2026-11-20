import { completedFixturesBefore } from "./competitionAverageTeam";
import { teamNamesMatch } from "../utils/leagueResultsAccess";

const MIN_COMPLETED_FIXTURES = 10;

function round2(value) {
  return Math.round(value * 100) / 100;
}

function mean(values) {
  const finite = values.filter((value) => Number.isFinite(value));
  if (!finite.length) return null;
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

function teamGame(fixture, isHome) {
  const scored = Number(isHome ? fixture.homeGoalCount : fixture.awayGoalCount);
  const conceded = Number(isHome ? fixture.awayGoalCount : fixture.homeGoalCount);
  const possession = Number(isHome ? fixture.team_a_possession : fixture.team_b_possession);
  return {
    isHome,
    date: Number(fixture.date_unix),
    points: scored > conceded ? 3 : scored === conceded ? 1 : 0,
    possession: possession > 0 ? possession : null,
  };
}

/**
 * Per-team figures for ranking, using the same windows as the team form
 * values they are compared with: season, last 10/6/5, last six at each venue,
 * and possession over the season, last five and each venue.
 */
export function buildCompetitionTeamMetrics(leagueFixtures, asOfUnix) {
  const fixtures = completedFixturesBefore(leagueFixtures, asOfUnix);
  if (fixtures.length < MIN_COMPLETED_FIXTURES) return null;

  const gamesByTeam = new Map();
  const add = (name, game) => {
    if (!name) return;
    if (!gamesByTeam.has(name)) gamesByTeam.set(name, []);
    gamesByTeam.get(name).push(game);
  };
  for (const fixture of fixtures) {
    add(fixture.home_name, teamGame(fixture, true));
    add(fixture.away_name, teamGame(fixture, false));
  }

  return [...gamesByTeam.entries()].map(([name, games]) => {
    const newestFirst = [...games].sort((a, b) => b.date - a.date);
    const home = newestFirst.filter((game) => game.isHome);
    const away = newestFirst.filter((game) => !game.isHome);
    const ppg = (list) => mean(list.map((game) => game.points));
    // Form trend PPG divides by the window size even before that many games are played.
    const trendPpg = (n) =>
      newestFirst.slice(0, n).reduce((sum, game) => sum + game.points, 0) / n;
    const possession = (list) => mean(list.map((game) => game.possession));
    return {
      name,
      ppg: ppg(newestFirst),
      ppgTrend10: trendPpg(10),
      ppgTrend6: trendPpg(6),
      ppgTrend5: trendPpg(5),
      ppgLast5: ppg(newestFirst.slice(0, 5)),
      ppgHomeLast6: ppg(home.slice(0, 6)),
      ppgAwayLast6: ppg(away.slice(0, 6)),
      possession: possession(newestFirst),
      possessionLast5: possession(newestFirst.slice(0, 5)),
      possessionHome: possession(home),
      possessionAway: possession(away),
    };
  });
}

/** Values of `metric` for every team except `teamName`, rounded as displayed. */
export function otherTeamValues(teams, teamName, metric) {
  if (!Array.isArray(teams)) return null;
  return teams
    .filter((team) => !teamNamesMatch(team.name, teamName))
    .map((team) => team[metric])
    .filter((value) => Number.isFinite(value))
    .map(round2);
}

/**
 * Competition-style rank of `value` (highest first) among `others`.
 * `tied` is true when another team has the same value.
 */
export function rankAmong(value, others) {
  const n = Number(value);
  if (!Number.isFinite(n) || !Array.isArray(others) || !others.length) return null;
  const target = round2(n);
  return {
    rank: 1 + others.filter((other) => other > target).length,
    tied: others.some((other) => other === target),
    of: others.length + 1,
  };
}
