/** ~275 days - limits form/history payloads to the active season window. */
export const RECENT_RESULTS_WINDOW_SEC = 23778463;

export function getRecentResultsCutoffUnix(nowSec = Math.floor(Date.now() / 1000)) {
  return nowSec - RECENT_RESULTS_WINDOW_SEC;
}

/**
 * Assess whether a cached /results blob can be used as-is, merged, or must be rebuilt.
 *
 * - complete: every current league is present (use cache directly)
 * - usable: no stale season ids (safe to merge; may be missing newly added leagues)
 * - staleIds: cached ids no longer in leagueOrder (prior seasons - full rebuild)
 * - missingLeagues: orderedLeague entries not yet in the cache
 */
export function evaluateResultsCache(cachedResults, orderedLeagues) {
  if (!Array.isArray(cachedResults) || cachedResults.length === 0) {
    return {
      complete: false,
      usable: false,
      staleIds: [],
      missingIds: [],
      missingLeagues: Array.isArray(orderedLeagues) ? [...orderedLeagues] : [],
    };
  }
  if (!Array.isArray(orderedLeagues) || orderedLeagues.length === 0) {
    return {
      complete: false,
      usable: false,
      staleIds: [],
      missingIds: [],
      missingLeagues: [],
    };
  }

  const requiredIds = orderedLeagues.map((league) => String(league.element.id));
  const requiredSet = new Set(requiredIds);
  const cachedIds = cachedResults.map((entry) => String(entry.id));
  const cachedIdSet = new Set(cachedIds);

  const staleIds = cachedIds.filter((id) => !requiredSet.has(id));
  const missingIds = requiredIds.filter((id) => !cachedIdSet.has(id));
  const missingLeagues = orderedLeagues.filter((league) =>
    missingIds.includes(String(league.element.id))
  );

  const usable = staleIds.length === 0;
  const complete = usable && missingIds.length === 0;

  return { complete, usable, staleIds, missingIds, missingLeagues };
}

/**
 * True when every current league id is cached with no stale ids.
 * Prefer evaluateResultsCache when deciding between full vs incremental fetch.
 */
export function isResultsCacheValid(cachedResults, orderedLeagues) {
  return evaluateResultsCache(cachedResults, orderedLeagues).complete;
}

/** Rebuilt results must cover every current league before replacing the S3 blob. */
export function isRebuiltResultsCacheComplete(cachedResults, orderedLeagues) {
  return evaluateResultsCache(cachedResults, orderedLeagues).complete;
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
 * True for a finished league-history row.
 * Cached shortened results drop `status` after filtering to complete games,
 * so missing status still counts as complete when goal counts are finite.
 */
export function isCompleteLeagueHistoryFixture(fixture) {
  if (!fixture) return false;
  if (fixture.status === "complete") return true;
  if (fixture.status != null && fixture.status !== "") return false;
  return (
    Number.isFinite(Number(fixture.homeGoalCount)) &&
    Number.isFinite(Number(fixture.awayGoalCount)) &&
    Number(fixture.homeGoalCount) >= 0 &&
    Number(fixture.awayGoalCount) >= 0
  );
}

/**
 * Look up a league's cached results object by industry leading stat website league id.
 * Do not use orderedLeagues index - cached result array order can drift.
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
  if (teamNamesMatch(fixture.home_name, team)) {
    return { scored: fixture.homeGoalCount, conceded: fixture.awayGoalCount };
  }
  if (teamNamesMatch(fixture.away_name, team)) {
    return { scored: fixture.awayGoalCount, conceded: fixture.homeGoalCount };
  }
  return null;
}

/** Generic trailing club tokens (Tottenham Hotspur, Sporting CP) — not city disambiguators. */
const CLUB_EXTRA_NAME_TOKENS = new Set([
  "cp",
  "city",
  "united",
  "town",
  "hotspur",
  "albion",
  "county",
  "athletic",
  "villa",
  "rovers",
  "wanderers",
  "argyle",
  "orient",
  "forest",
  "palace",
  "alexandra",
  "wednesday",
  "borough",
  "saints",
  "ham",
  "north",
  "south",
  "east",
  "west",
]);

function teamNameTokens(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\b(rsc|rfc|afc|cfc|fc|cf|ac|as|sk|fk|nk|bk|ifk|if)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function tokensEqual(a, b) {
  return a.length === b.length && a.every((token, index) => token === b[index]);
}

function tokensMatchWithAllowedExtraSuffix(shorter, longer) {
  if (shorter.length >= longer.length) {
    return false;
  }
  for (let index = 0; index < shorter.length; index += 1) {
    if (shorter[index] !== longer[index]) {
      return false;
    }
  }
  const extra = longer.slice(shorter.length);
  return extra.every((token) => CLUB_EXTRA_NAME_TOKENS.has(token));
}

export function teamNamesMatch(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const ta = teamNameTokens(a);
  const tb = teamNameTokens(b);
  if (!ta.length || !tb.length) return false;
  if (tokensEqual(ta, tb)) return true;
  const shorter = ta.length <= tb.length ? ta : tb;
  const longer = ta.length <= tb.length ? tb : ta;
  return tokensMatchWithAllowedExtraSuffix(shorter, longer);
}

function mapFixtureToWdl(fixture, team) {
  const goals = fixtureGoalsForTeam(fixture, team);
  if (!goals) {
    return null;
  }
  if (goals.scored > goals.conceded) return "W";
  if (goals.scored < goals.conceded) return "L";
  return "D";
}

function fixtureBttsMark(fixture) {
  return Number(fixture.homeGoalCount) > 0 && Number(fixture.awayGoalCount) > 0
    ? "\u2714"
    : "\u2718";
}

/**
 * Completed this-competition fixtures for a team before `match`, newest first.
 */
export function getTeamCompetitionFixtures(team, match, allLeagueResults) {
  return getTeamFixturesBeforeMatch(team, match, allLeagueResults).filter(
    isCompleteLeagueHistoryFixture
  );
}

/**
 * This-competition home/away WDL + BTTS for a team before `match`.
 * Newest first. Shared by homepage pills and Match Preview so neither
 * falls back to FootyStats last-x formRun.
 */
export function getCompetitionVenueForm(team, match, allLeagueResults) {
  const fixtures = getTeamCompetitionFixtures(team, match, allLeagueResults);
  if (!fixtures.length) {
    return null;
  }

  const toResult = (fixture) => mapFixtureToWdl(fixture, team);
  const home = fixtures.filter((fixture) =>
    teamNamesMatch(fixture.home_name, team)
  );
  const away = fixtures.filter((fixture) =>
    teamNamesMatch(fixture.away_name, team)
  );
  const recent = fixtures.slice(0, 6);

  return {
    resultsAll: recent.map(toResult).filter(Boolean),
    resultsHome: home.slice(0, 6).map(toResult).filter(Boolean),
    resultsAway: away.slice(0, 6).map(toResult).filter(Boolean),
    bttsAll: recent.map(fixtureBttsMark),
    leaguePlayed: fixtures.length,
    leaguePlayedHome: home.length,
    leaguePlayedAway: away.length,
  };
}

/** Newest-first W/D/L for homepage / Match Preview pills. Empty if no history. */
export function getCompetitionFormPills(
  team,
  match,
  allLeagueResults,
  kind = "all",
  max = 5
) {
  const venueForm = getCompetitionVenueForm(team, match, allLeagueResults);
  if (!venueForm) {
    return [];
  }
  const results =
    kind === "home"
      ? venueForm.resultsHome
      : kind === "away"
        ? venueForm.resultsAway
        : venueForm.resultsAll;
  return results.slice(0, max);
}

export function applyCompetitionVenueForm(form, team, match, allLeagueResults) {
  if (!form) {
    return false;
  }
  const venueForm = getCompetitionVenueForm(team, match, allLeagueResults);
  if (!venueForm) {
    return false;
  }
  form.resultsAll = venueForm.resultsAll;
  form.resultsHome = venueForm.resultsHome;
  form.resultsAway = venueForm.resultsAway;
  form.bttsAll = venueForm.bttsAll;
  form.leaguePlayedHome = venueForm.leaguePlayedHome;
  form.leaguePlayedAway = venueForm.leaguePlayedAway;
  form.LeagueOrAll = "League";
  if (!Number.isFinite(Number(form.leaguePlayed)) || Number(form.leaguePlayed) <= 0) {
    form.leaguePlayed = venueForm.leaguePlayed;
  }
  return true;
}

/**
 * Completed competition fixtures for a team before a given match.
 */
export function getTeamFixturesBeforeMatch(team, match, allLeagueResults) {
  const leagueId = match?.leagueID ?? match?.leagueId ?? match?.competition_id;
  const asOfUnix = Number(match?.date ?? match?.date_unix);
  const fixtures = getLeagueFixturesByLeagueId(allLeagueResults, leagueId);
  if (!fixtures.length || !Number.isFinite(asOfUnix)) {
    return [];
  }

  return fixtures
    .filter(
      (fixture) =>
        (teamNamesMatch(fixture.home_name, team) ||
          teamNamesMatch(fixture.away_name, team)) &&
        Number(fixture.date_unix) < asOfUnix - 86400
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

    if (venue === "home" && teamNamesMatch(fixture.home_name, team)) {
      venueScored += goals.scored;
      venueConceded += goals.conceded;
    } else if (venue === "away" && teamNamesMatch(fixture.away_name, team)) {
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
