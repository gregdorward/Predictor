import {
  ATTACK_METRIC_DEFINITIONS,
  DEFENCE_METRIC_DEFINITIONS,
  buildMetricTimeSeries,
} from "./metricTimeSeries";

const MIN_SEASON_CHANGE = {
  scored: 0.35,
  XG: 0.25,
  shots: 1.2,
  sot: 0.5,
  dangerousAttacks: 6,
  corners: 0.6,
  conceeded: 0.35,
  XGAgainst: 0.25,
  shotsAgainst: 1.2,
  sotAgainst: 0.5,
  dangerousAttacksAgainst: 6,
  cornersAgainst: 0.6,
};

function average(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Against-metrics mirror the for-metric: every shot for one team is a shot against the other.
const COMPETITION_AVERAGE_KEYS = {
  scored: "scored",
  XG: "xg",
  shots: "shots",
  sot: "sot",
  dangerousAttacks: "dangerousAttacks",
  corners: "corners",
  conceeded: "conceded",
  XGAgainst: "xgAgainst",
  shotsAgainst: "shots",
  sotAgainst: "sotAgainst",
  dangerousAttacksAgainst: "dangerousAttacks",
  cornersAgainst: "corners",
};

function competitionAverageForMetric(averages, metricKey) {
  const averageKey = COMPETITION_AVERAGE_KEYS[metricKey];
  if (!averageKey || !averages) return null;
  const value = Number(averages[averageKey]);
  return Number.isFinite(value) ? value : null;
}

/**
 * Whether a team's season average is better than the competition average.
 * `above` means better: a higher number for attack, a lower number for defence.
 * Within 8% counts as level.
 */
export function classifyAgainstAverage(teamAverage, competitionAverage, { lowerIsBetter = false } = {}) {
  if (!Number.isFinite(teamAverage) || !Number.isFinite(competitionAverage)) return null;
  const tolerance = Math.max(Math.abs(competitionAverage) * 0.08, 0.05);
  const delta = teamAverage - competitionAverage;
  if (Math.abs(delta) <= tolerance) return "level";
  const better = lowerIsBetter ? delta < 0 : delta > 0;
  return better ? "above" : "below";
}

function levelDetail(level, teamAverage, competitionAverage) {
  const team = formatMetricValue(teamAverage);
  const typical = formatMetricValue(competitionAverage);
  if (level === "above") {
    return `Season average ${team} per game, better than the competition average of ${typical}.`;
  }
  if (level === "below") {
    return `Season average ${team} per game, worse than the competition average of ${typical}.`;
  }
  return `Season average ${team} per game, close to the competition average of ${typical}.`;
}

function formatMetricValue(value) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 10) return value.toFixed(1);
  if (abs >= 1) return value.toFixed(2).replace(/\.?0+$/, "");
  return value.toFixed(2);
}

function formatSignedDelta(value) {
  if (!Number.isFinite(value)) return "—";
  const formatted = formatMetricValue(value);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return formatted;
  return "0";
}

function buildTrendDetail({
  direction,
  perGameTrend,
  gameCount,
  recentAvg,
  earlyAvg,
  windowSize,
  lowerIsBetter,
}) {
  const gamesLabel = gameCount === 1 ? "1 game" : `${gameCount} games`;
  const pace = formatSignedDelta(perGameTrend);

  let primary;
  if (direction === "improving") {
    primary =
      lowerIsBetter
        ? `Conceding ${formatMetricValue(Math.abs(perGameTrend))} fewer per game over ${gamesLabel}`
        : `Up ${formatMetricValue(Math.abs(perGameTrend))} per game over ${gamesLabel}`;
  } else if (direction === "worsening") {
    primary =
      lowerIsBetter
        ? `Conceding ${formatMetricValue(Math.abs(perGameTrend))} more per game over ${gamesLabel}`
        : `Down ${formatMetricValue(Math.abs(perGameTrend))} per game over ${gamesLabel}`;
  } else {
    primary = `Little change (${pace}/game over ${gamesLabel})`;
  }

  const secondary = `First ${windowSize} games: ${formatMetricValue(earlyAvg)}/game · Last ${windowSize}: ${formatMetricValue(recentAvg)}/game`;

  return {
    detail: primary,
    detailPrimary: primary,
    detailSecondary: secondary,
  };
}

export function calculateLinearRegressionSlope(values = []) {
  const n = values.length;
  if (n === 0) {
    return { slope: 0, intercept: 0 };
  }
  if (n === 1) {
    return { slope: 0, intercept: values[0] };
  }

  const xs = values.map((_, index) => index);
  const sumX = xs.reduce((total, x) => total + x, 0);
  const sumY = values.reduce((total, value) => total + value, 0);
  const sumXY = xs.reduce((total, x, index) => total + x * values[index], 0);
  const sumXX = xs.reduce((total, x) => total + x * x, 0);
  const denominator = n * sumXX - sumX * sumX;

  if (denominator === 0) {
    const mean = sumY / n;
    return { slope: 0, intercept: mean };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export function classifyMetricTrend(values = [], { lowerIsBetter = false, metricKey } = {}) {
  const n = values.length;

  if (n < 3) {
    return {
      direction: "stable",
      slope: 0,
      detail: "Need at least 3 games",
      detailPrimary: "Need at least 3 games",
      detailSecondary: "",
      recentAvg: n ? values[n - 1] : null,
      earlyAvg: n ? values[0] : null,
      windowDelta: 0,
      seasonDelta: 0,
    };
  }

  const { slope } = calculateLinearRegressionSlope(values);
  const mean = average(values);
  const span = n - 1;
  const rawSeasonChange = slope * span;
  const seasonDelta = lowerIsBetter ? -rawSeasonChange : rawSeasonChange;

  const minChange = MIN_SEASON_CHANGE[metricKey] ?? Math.max(mean * 0.12, 0.2);
  const relativeChange = Math.max(minChange, Math.abs(mean) * 0.12);

  let direction = "stable";
  if (seasonDelta > relativeChange) {
    direction = "improving";
  } else if (seasonDelta < -relativeChange) {
    direction = "worsening";
  }

  const windowSize = Math.max(2, Math.min(5, Math.floor(n / 2)));
  const earlyValues = values.slice(0, windowSize);
  const recentValues = values.slice(-windowSize);
  const earlyAvg = average(earlyValues);
  const recentAvg = average(recentValues);
  const rawWindowDelta = recentAvg - earlyAvg;
  const windowDelta = lowerIsBetter ? -rawWindowDelta : rawWindowDelta;
  const perGameTrend = lowerIsBetter ? -slope : slope;
  const { detail, detailPrimary, detailSecondary } = buildTrendDetail({
    direction,
    perGameTrend,
    gameCount: n,
    recentAvg,
    earlyAvg,
    windowSize,
    lowerIsBetter,
  });

  return {
    direction,
    slope: perGameTrend,
    detail,
    detailPrimary,
    detailSecondary,
    recentAvg,
    earlyAvg,
    windowDelta,
    seasonDelta,
  };
}

export function buildMetricTrendRows(series = [], metricDefinitions = [], averages = null) {
  return metricDefinitions.map((metric) => {
    const values = series.map((point) => point[metric.key]);
    const lowerIsBetter = metric.lowerIsBetter === true;
    const trend = classifyMetricTrend(values, {
      lowerIsBetter,
      metricKey: metric.key,
    });
    const seasonAvg = values.length ? average(values) : null;
    const competitionAvg = competitionAverageForMetric(averages, metric.key);
    const level = classifyAgainstAverage(seasonAvg, competitionAvg, { lowerIsBetter });

    return {
      key: metric.key,
      label: metric.label,
      direction: trend.direction,
      detail: trend.detail,
      detailPrimary: trend.detailPrimary,
      detailSecondary: trend.detailSecondary,
      slope: trend.slope,
      seasonDelta: trend.seasonDelta,
      seasonAvg,
      competitionAvg,
      level,
      levelDetail: level ? levelDetail(level, seasonAvg, competitionAvg) : "",
    };
  });
}

export function buildAttackDefenceMetricTrends(homeResults = [], awayResults = [], averages = null) {
  const homeSeries = buildMetricTimeSeries(homeResults);
  const awaySeries = buildMetricTimeSeries(awayResults);

  return {
    attack: {
      home: buildMetricTrendRows(homeSeries, ATTACK_METRIC_DEFINITIONS, averages),
      away: buildMetricTrendRows(awaySeries, ATTACK_METRIC_DEFINITIONS, averages),
    },
    defence: {
      home: buildMetricTrendRows(homeSeries, DEFENCE_METRIC_DEFINITIONS, averages),
      away: buildMetricTrendRows(awaySeries, DEFENCE_METRIC_DEFINITIONS, averages),
    },
  };
}

export {
  ATTACK_METRIC_DEFINITIONS,
  DEFENCE_METRIC_DEFINITIONS,
};
