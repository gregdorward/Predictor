/**
 * Merge per-category industry stat website top-teams rankings into a flat statistics object.
 */
export function mergeTeamStatsFromTopTeams(topTeamsData, teamId) {
  const topTeams = topTeamsData?.topTeams;
  if (!topTeams || teamId == null) {
    return null;
  }

  const merged = {};
  let matches = null;

  for (const [category, teamArray] of Object.entries(topTeams)) {
    if (!Array.isArray(teamArray)) {
      continue;
    }

    const entry = teamArray.find((item) => item.team?.id === teamId);
    if (!entry?.statistics) {
      continue;
    }

    const value = entry.statistics[category];
    if (value != null) {
      merged[category] = value;
    }
    if (entry.statistics.matches != null) {
      matches = entry.statistics.matches;
    }
  }

  if (matches != null) {
    merged.matches = matches;
  }

  return Object.keys(merged).length ? merged : null;
}

function applyTeamStatAliases(stats) {
  if (!stats || typeof stats !== "object") {
    return stats;
  }

  const normalized = { ...stats };

  if (normalized.bigChances == null && normalized.bigChancesCreated != null) {
    normalized.bigChances = normalized.bigChancesCreated;
  }
  if (normalized.fastBreakShots == null && normalized.fastBreaks != null) {
    normalized.fastBreakShots = normalized.fastBreaks;
  }
  if (normalized.avgRating == null && normalized.averageRating != null) {
    normalized.avgRating = normalized.averageRating;
  }
  if (
    normalized.bigChancesAgainst == null &&
    normalized.bigChancesConceded != null
  ) {
    normalized.bigChancesAgainst = normalized.bigChancesConceded;
  }

  return normalized;
}

/**
 * Normalise an industry stat website team statistics payload for Key Stats display.
 */
export function normalizeTeamStatistics(statistics) {
  if (!statistics || typeof statistics !== "object") {
    return null;
  }

  return applyTeamStatAliases(statistics);
}

/**
 * Prefer tournament team statistics, falling back to merged top-teams league data.
 */
export function resolveTeamStatistics(rawResponse, topTeamsData, teamId) {
  const fromTeamEndpoint = normalizeTeamStatistics(rawResponse?.statistics);
  const fromTopTeams = mergeTeamStatsFromTopTeams(topTeamsData, teamId);

  if (!fromTeamEndpoint && !fromTopTeams) {
    return null;
  }

  return normalizeTeamStatistics({
    ...(fromTopTeams ?? {}),
    ...(fromTeamEndpoint ?? {}),
  });
}
