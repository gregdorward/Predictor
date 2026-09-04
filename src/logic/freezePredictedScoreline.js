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

/** Insert or replace sshHomeGoals/sshAwayGoals for one match in a scores array. */
export function upsertSshScoreRow(scores, gameId, home, away) {
  const rows = Array.isArray(scores) ? [...scores] : [];
  const idx = rows.findIndex((row) => String(row.gameId) === String(gameId));
  const next = {
    ...(idx >= 0 ? rows[idx] : {}),
    gameId,
    sshHomeGoals: home,
    sshAwayGoals: away,
  };
  if (idx >= 0) {
    rows[idx] = next;
  } else {
    rows.push(next);
  }
  return rows;
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
