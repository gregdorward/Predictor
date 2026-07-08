function teamsMatch(left, right) {
  if (!left || !right) {
    return false;
  }

  return left === right || left.includes(right) || right.includes(left);
}

/**
 * Prefer an exact home/away pair before falling back to single-team industry stat website lookups.
 */
export function findSofaScoreGameByTeams(games, homeTeam, awayTeam, normalizeTeamName) {
  if (!Array.isArray(games) || !normalizeTeamName) {
    return null;
  }

  const normalizedHome = normalizeTeamName(homeTeam);
  const normalizedAway = normalizeTeamName(awayTeam);

  const exactMatch = games.find(
    (fixture) =>
      normalizeTeamName(fixture.homeTeam) === normalizedHome &&
      normalizeTeamName(fixture.awayTeam) === normalizedAway
  );

  if (exactMatch) {
    return exactMatch;
  }

  const partialMatch = games.find((fixture) => {
    const fixtureHome = normalizeTeamName(fixture.homeTeam);
    const fixtureAway = normalizeTeamName(fixture.awayTeam);
    return (
      teamsMatch(fixtureHome, normalizedHome) &&
      teamsMatch(fixtureAway, normalizedAway)
    );
  });

  return partialMatch || null;
}
