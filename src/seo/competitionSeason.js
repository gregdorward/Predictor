/** Season has not produced usable league averages yet (new / unstarted). */
export function isCompetitionSeasonEmpty(data) {
  if (!data) return true;
  const matchesPlayed = readMatchesPlayed(data);
  if (matchesPlayed === 0) return true;

  const avg = Number(data.seasonAVG_overall);
  const btts = Number(data.seasonBTTSPercentage);
  const over25 = Number(data.seasonOver25Percentage_overall);
  const under25 = Number(data.seasonUnder25Percentage_overall);

  // All-zero market block means the season has not produced usable averages yet
  // (typical right after a catalog season-id rollover).
  return (
    (!Number.isFinite(avg) || avg === 0) &&
    (!Number.isFinite(btts) || btts === 0) &&
    (!Number.isFinite(over25) || over25 === 0) &&
    (!Number.isFinite(under25) || under25 === 0)
  );
}

function readMatchesPlayed(data) {
  const candidates = [
    data?.matches_completed,
    data?.matchesCompleted,
    data?.seasonMatchesPlayed_overall,
    data?.seasonMatchesCompleted,
    data?.games_played,
    data?.clubStats?.seasonMatchesPlayed_overall,
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}
