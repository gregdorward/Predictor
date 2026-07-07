/** ~275 days — limits form/history payloads to the active season window. */
export const RECENT_RESULTS_WINDOW_SEC = 23778463;

export function getRecentResultsCutoffUnix(nowSec = Math.floor(Date.now() / 1000)) {
  return nowSec - RECENT_RESULTS_WINDOW_SEC;
}

/**
 * Cached /results must match the current FootyStats season ids exactly.
 * Stale blobs from prior seasons (old ids alongside new) are rejected.
 */
export function isResultsCacheValid(cachedResults, orderedLeagues) {
  if (!Array.isArray(cachedResults) || cachedResults.length === 0) {
    return false;
  }
  if (!Array.isArray(orderedLeagues) || orderedLeagues.length === 0) {
    return false;
  }

  const requiredIds = orderedLeagues.map((league) => String(league.element.id));
  const cachedIds = cachedResults.map((entry) => String(entry.id));

  if (cachedIds.length !== requiredIds.length) {
    return false;
  }

  const requiredSet = new Set(requiredIds);
  return (
    requiredIds.every((id) => cachedIds.includes(id)) &&
    cachedIds.every((id) => requiredSet.has(id))
  );
}

/**
 * Trim each league's fixture list to the recent window (same rules as a fresh build).
 */
export function trimLeagueResultsToWindow(
  allLeagueResults,
  cutoffUnix = getRecentResultsCutoffUnix()
) {
  if (!Array.isArray(allLeagueResults)) {
    return [];
  }

  return allLeagueResults.map((entry) => {
    const fixtures = Array.isArray(entry.fixtures) ? entry.fixtures : [];
    const trimmed = fixtures
      .filter((fixture) => fixture.date_unix > cutoffUnix)
      .sort((a, b) => a.date_unix - b.date_unix)
      .slice(-600);

    return { ...entry, fixtures: trimmed };
  });
}

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
