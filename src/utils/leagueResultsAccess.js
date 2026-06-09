/**
 * Safely read league fixture history used by GameStats and getStats.
 * Returns [] when cached results are missing or incomplete (e.g. early World Cup).
 */
export function getLeagueFixturesByLeagueId(allLeagueResults, leagueId) {
  if (!Array.isArray(allLeagueResults) || leagueId == null) {
    return [];
  }

  const entry = allLeagueResults.find((item) => item.id === leagueId);
  return Array.isArray(entry?.fixtures) ? entry.fixtures : [];
}
