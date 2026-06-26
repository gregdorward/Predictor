/**
 * Find an entry in a league-keyed array, matching id with string coercion.
 */
export function findLeagueEntryById(entries, leagueId) {
  if (!Array.isArray(entries) || leagueId == null) {
    return null;
  }

  const normalizedId = String(leagueId);
  return entries.find((entry) => String(entry.id) === normalizedId) ?? null;
}

/**
 * Look up a league's cached results object by FootyStats league id.
 * Do not use orderedLeagues index — cached result array order can drift.
 */
export function getLeagueResultsByLeagueId(allLeagueResults, leagueId) {
  return findLeagueEntryById(allLeagueResults, leagueId);
}

/**
 * Safely read league fixture history used by GameStats and getStats.
 * Returns [] when cached results are missing or incomplete (e.g. early World Cup).
 */
export function getLeagueFixturesByLeagueId(allLeagueResults, leagueId) {
  const entry = getLeagueResultsByLeagueId(allLeagueResults, leagueId);
  return Array.isArray(entry?.fixtures) ? entry.fixtures : [];
}

function fixtureGoalsForTeam(fixture, team) {
  if (fixture.home_name === team) {
    return { scored: fixture.homeGoalCount, conceded: fixture.awayGoalCount };
  }
  if (fixture.away_name === team) {
    return { scored: fixture.awayGoalCount, conceded: fixture.homeGoalCount };
  }
  return null;
}

/**
 * Completed competition fixtures for a team before a given match.
 */
export function getTeamFixturesBeforeMatch(team, match, allLeagueResults) {
  const fixtures = getLeagueFixturesByLeagueId(allLeagueResults, match.leagueID);
  if (!fixtures.length) {
    return [];
  }

  return fixtures
    .filter(
      (fixture) =>
        (fixture.home_name === team || fixture.away_name === team) &&
        fixture.date_unix < match.date - 86400
    )
    .sort((a, b) => b.date_unix - a.date_unix);
}

/**
 * Goal difference from competition fixtures only (e.g. World Cup group stage).
 */
export function computeCompetitionGoalDifference(
  team,
  match,
  venue,
  allLeagueResults
) {
  const fixtures = getTeamFixturesBeforeMatch(team, match, allLeagueResults);
  if (!fixtures.length) {
    return null;
  }

  let goalsScored = 0;
  let goalsConceded = 0;
  let venueScored = 0;
  let venueConceded = 0;

  for (const fixture of fixtures) {
    const goals = fixtureGoalsForTeam(fixture, team);
    if (!goals) {
      continue;
    }

    goalsScored += goals.scored;
    goalsConceded += goals.conceded;

    if (venue === "home" && fixture.home_name === team) {
      venueScored += goals.scored;
      venueConceded += goals.conceded;
    } else if (venue === "away" && fixture.away_name === team) {
      venueScored += goals.scored;
      venueConceded += goals.conceded;
    }
  }

  return {
    goalDifference: goalsScored - goalsConceded,
    goalDifferenceHomeOrAway: venueScored - venueConceded,
  };
}

export function applyCompetitionGoalDifference(
  form,
  team,
  match,
  venue,
  allLeagueResults
) {
  const goalDiff = computeCompetitionGoalDifference(
    team,
    match,
    venue,
    allLeagueResults
  );
  if (!goalDiff) {
    return false;
  }

  form.goalDifference = goalDiff.goalDifference;
  form.goalDifferenceHomeOrAway = goalDiff.goalDifferenceHomeOrAway;
  return true;
}
