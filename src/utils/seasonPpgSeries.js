/**
 * Build season form series from allTeamResults (gameweek + points + rolling PPG).
 */
export function buildSeasonPpgSeries(allTeamResults, windowSize = 5) {
  if (!allTeamResults?.length) {
    return { labels: [], points: [], rollingPpg: [] };
  }

  const sorted = [...allTeamResults].sort(
    (a, b) => (a.dateRaw ?? 0) - (b.dateRaw ?? 0)
  );

  const labels = [];
  const points = [];
  const rollingPpg = [];

  for (let i = 0; i < sorted.length; i++) {
    const game = sorted[i];
    const gameweek = game.gameweek;
    labels.push(
      gameweek != null && gameweek !== "" && gameweek !== -1
        ? `GW${gameweek}`
        : `${i + 1}`
    );

    const pts = Number(game.points) || 0;
    points.push(pts);

    const start = Math.max(0, i - windowSize + 1);
    const slice = sorted.slice(start, i + 1);
    const ppg =
      slice.reduce((sum, g) => sum + (Number(g.points) || 0), 0) / slice.length;
    rollingPpg.push(parseFloat(ppg.toFixed(2)));
  }

  return { labels, points, rollingPpg };
}

function padSeries(values, length) {
  const out = [...values];
  while (out.length < length) out.push(null);
  return out;
}

/**
 * Align home/away rolling PPG for a shared chart x-axis.
 */
export function buildDualSeasonPpgSeries(homeResults, awayResults, windowSize = 5) {
  const home = buildSeasonPpgSeries(homeResults, windowSize);
  const away = buildSeasonPpgSeries(awayResults, windowSize);

  if (!home.labels.length && !away.labels.length) {
    return { labels: [], homeRollingPpg: [], awayRollingPpg: [] };
  }

  const length = Math.max(home.rollingPpg.length, away.rollingPpg.length);
  const labels = [];

  for (let i = 0; i < length; i++) {
    const homeLabel = home.labels[i];
    const awayLabel = away.labels[i];
    if (homeLabel && awayLabel && homeLabel !== awayLabel) {
      labels.push(`${homeLabel}/${awayLabel}`);
    } else {
      labels.push(homeLabel || awayLabel || `${i + 1}`);
    }
  }

  return {
    labels,
    homeRollingPpg: padSeries(home.rollingPpg, length),
    awayRollingPpg: padSeries(away.rollingPpg, length),
  };
}
