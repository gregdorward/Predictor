const FINISHED_STATUSES = [
  "complete",
  "suspended",
  "canceled",
  "cancelled",
  "postponed",
  "abandoned",
];

export function hasKickoffPassed(match, nowMs = Date.now()) {
  if (!match) return false;
  if (FINISHED_STATUSES.includes(match.status)) return true;
  const kickoffMs = Number(match.date) * 1000;
  return Number.isFinite(kickoffMs) && nowMs >= kickoffMs;
}

export function getStoredSshScoreline(predictedScores, matchId) {
  const existing = (predictedScores || []).find(
    (row) => String(row?.gameId) === String(matchId)
  );
  const home = Number(existing?.sshHomeGoals);
  const away = Number(existing?.sshAwayGoals);
  if (!Number.isFinite(home) || !Number.isFinite(away)) {
    return null;
  }
  return { home, away };
}

/**
 * After kickoff, keep using a stored SSH scoreline so Build a Multi / tips
 * cannot reshuffle when live most-likely scores move. Before kickoff, keep
 * following live scores. If a finished game has no snapshot yet, freeze the
 * first live scoreline so later reloads stay put.
 */
export function resolveSshScorelineForTips({
  stored,
  liveHome,
  liveAway,
  kickoffPassed,
}) {
  if (kickoffPassed && stored) {
    return {
      home: stored.home,
      away: stored.away,
      source: "stored",
      shouldPersist: false,
    };
  }
  const live = { home: liveHome, away: liveAway, source: "live" };
  if (!kickoffPassed) {
    const changed =
      !stored || stored.home !== liveHome || stored.away !== liveAway;
    return { ...live, shouldPersist: changed };
  }
  return { ...live, shouldPersist: !stored };
}
