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
