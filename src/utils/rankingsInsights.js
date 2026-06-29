const ATTACKING_METRIC_KEYS = [
  "goalsScored",
  "shotsOnTarget",
  "shots",
  "bigChances",
  "bigChancesMissed",
  "hitWoodwork",
  "corners",
  "penaltyGoals",
  "successfulDribbles",
];

const PASSING_METRIC_KEYS = [
  "averageBallPossession",
  "accuratePasses",
  "accurateLongBalls",
  "accurateCrosses",
];

const MISC_METRIC_KEYS = ["avgRating", "redCards", "yellowCards", "fouls"];

export const INVERTED_RANKING_METRICS = new Set([
  "redCards",
  "yellowCards",
  "fouls",
]);

const DEFENSIVE_METRIC_KEYS = [
  "goalsConceded",
  "cleanSheets",
  "tackles",
  "clearances",
  "interceptions",
  "penaltyGoalsConceded",
];

export const RANKINGS_SECTION_DEFINITIONS = [
  { title: "Attacking", keys: ATTACKING_METRIC_KEYS },
  { title: "Defensive", keys: DEFENSIVE_METRIC_KEYS },
  { title: "Passing", keys: PASSING_METRIC_KEYS },
  { title: "Miscellaneous", keys: MISC_METRIC_KEYS },
];

export function toMetricLabel(camel) {
  return camel
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

export function buildRankingsSections(ranksHome) {
  const allMetrics = Object.keys(ranksHome || {});

  return RANKINGS_SECTION_DEFINITIONS.map(({ title, keys }) => ({
    title,
    metrics: keys
      .filter((key) => allMetrics.includes(key))
      .map((key) => ({ key, label: toMetricLabel(key) })),
  })).filter((section) => section.metrics.length > 0);
}

function ordinal(rank) {
  const suffixes = ["th", "st", "nd", "rd"];
  const mod100 = rank % 100;
  const mod10 = rank % 10;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? "th" : suffixes[mod10] || "th";
  return `${rank}${suffix}`;
}

export function formatRank(rank, totalTeams) {
  if (rank == null) return "No rank";

  return totalTeams ? `${ordinal(rank)} of ${totalTeams}` : ordinal(rank);
}

export function formatRankDetail(rank, rankData, totalTeams) {
  let detail = formatRank(rank, totalTeams);
  if (rankData?.value != null) {
    detail += ` · ${rankData.value}`;
  }

  return detail;
}

export function isInvertedRankingMetric(metricKey) {
  return INVERTED_RANKING_METRICS.has(metricKey);
}

function getLeadingSide(homeRank, awayRank, metricKey) {
  if (homeRank === awayRank) {
    return "level";
  }

  const lowerRankIsBetter = !isInvertedRankingMetric(metricKey);

  if (lowerRankIsBetter) {
    return homeRank < awayRank ? "home" : "away";
  }

  return homeRank > awayRank ? "home" : "away";
}

export function getRankEdgeState(homeRank, awayRank, totalTeams, metricKey) {
  if (homeRank == null || awayRank == null) {
    return {
      tone: "neutral",
      intensity: "none",
      leader: "Unavailable",
      edge: null,
      edgeText: "Ranking data missing",
    };
  }

  if (homeRank === awayRank) {
    return {
      tone: "level",
      intensity: "none",
      leader: "Level",
      edge: 0,
      edgeText: "Same rank",
    };
  }

  const edge = Math.abs(homeRank - awayRank);
  const edgeRatio = totalTeams > 1 ? edge / (totalTeams - 1) : 0;
  const intensity =
    edge >= 6 || edgeRatio >= 0.35
      ? "strong"
      : edge >= 3 || edgeRatio >= 0.18
      ? "medium"
      : "subtle";

  const leadingSide = getLeadingSide(homeRank, awayRank, metricKey);

  return {
    tone: leadingSide,
    intensity,
    leader:
      leadingSide === "level"
        ? "Level"
        : leadingSide === "home"
        ? "Home edge"
        : "Away edge",
    edge,
    edgeText: `${edge} rank edge`,
  };
}

export function getSectionSummary(
  metrics,
  ranksHome,
  ranksAway,
  teamALabel,
  teamBLabel
) {
  const summary = metrics.reduce(
    (acc, metric) => {
      const homeRank = ranksHome[metric.key]?.rank;
      const awayRank = ranksAway[metric.key]?.rank;

      if (homeRank == null || awayRank == null) {
        acc.unavailable += 1;
      } else {
        const leadingSide = getLeadingSide(homeRank, awayRank, metric.key);

        if (leadingSide === "level") {
          acc.level += 1;
        } else if (leadingSide === "home") {
          acc.home += 1;
        } else {
          acc.away += 1;
        }
      }

      return acc;
    },
    { home: 0, away: 0, level: 0, unavailable: 0 }
  );
  const compared = metrics.length - summary.unavailable;
  const tone =
    summary.home === summary.away
      ? "level"
      : summary.home > summary.away
      ? "home"
      : "away";
  const leader =
    tone === "level"
      ? "Category level"
      : `${tone === "home" ? teamALabel : teamBLabel} leads`;
  const edge = Math.abs(summary.home - summary.away);
  const edgeText =
    edge === 0
      ? `${summary.home}-${summary.away} across compared metrics`
      : `${edge} metric edge`;

  return {
    ...summary,
    compared,
    tone,
    leader,
    edgeText,
  };
}

export function getBiggestRankingDisparities(
  ranksHome,
  ranksAway,
  totalTeams,
  { limit = 5, minIntensity = "medium" } = {}
) {
  const intensityRank = { subtle: 1, medium: 2, strong: 3, none: 0 };
  const minRank = intensityRank[minIntensity] ?? 2;
  const allMetricKeys = new Set([
    ...Object.keys(ranksHome || {}),
    ...Object.keys(ranksAway || {}),
  ]);

  return [...allMetricKeys]
    .map((key) => {
      const homeRank = ranksHome[key]?.rank;
      const awayRank = ranksAway[key]?.rank;
      const state = getRankEdgeState(homeRank, awayRank, totalTeams, key);

      if (state.edge == null || state.edge === 0) {
        return null;
      }

      if ((intensityRank[state.intensity] ?? 0) < minRank) {
        return null;
      }

      return {
        key,
        label: toMetricLabel(key),
        homeRank,
        awayRank,
        homeRankData: ranksHome[key],
        awayRankData: ranksAway[key],
        edge: state.edge,
        intensity: state.intensity,
        tone: state.tone,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.edge - a.edge)
    .slice(0, limit);
}

function formatSectionSummaryLine(summary, title, format) {
  const counts = `${summary.home}-${summary.away}-${summary.level}`;
  const comparedText = `(${summary.compared} compared)`;
  const leaderLabel =
    summary.leader === "Category level" ? "Level" : summary.leader;

  if (format === "markdown") {
    if (summary.leader === "Category level") {
      return `**${title}** - Level (${counts} across ${summary.compared} metrics)`;
    }
    return `**${title}** - ${leaderLabel} (${counts} across ${summary.compared} metrics)`;
  }

  if (summary.leader === "Category level") {
    return `${title}: Level ${counts} ${comparedText}`;
  }
  return `${title}: ${leaderLabel} ${counts} ${comparedText}`;
}

function formatDisparityLine(
  disparity,
  teamALabel,
  teamBLabel,
  totalTeams,
  format
) {
  const homeDetail = formatRank(disparity.homeRank, totalTeams);
  const awayDetail = formatRank(disparity.awayRank, totalTeams);

  if (format === "markdown") {
    return `**${disparity.label}** - ${teamALabel} ${homeDetail} | ${teamBLabel} ${awayDetail} *(${disparity.edge} rank edge)*`;
  }

  return `• ${disparity.label}: ${teamALabel} ${homeDetail} vs ${teamBLabel} ${awayDetail} (${disparity.edge} rank edge)`;
}

export function formatRankingsShareText({
  ranksHome,
  ranksAway,
  teamALabel,
  teamBLabel,
  totalTeams,
  format = "text",
}) {
  if (
    !ranksHome ||
    !ranksAway ||
    !totalTeams ||
    Object.keys(ranksHome).length === 0 ||
    Object.keys(ranksAway).length === 0
  ) {
    return "";
  }

  const sections = buildRankingsSections(ranksHome);
  const sectionLines = sections.map(({ title, metrics }) => {
    const summary = getSectionSummary(
      metrics,
      ranksHome,
      ranksAway,
      teamALabel,
      teamBLabel
    );
    return formatSectionSummaryLine(summary, title, format);
  });

  const disparities = getBiggestRankingDisparities(
    ranksHome,
    ranksAway,
    totalTeams
  );

  if (sectionLines.length === 0 && disparities.length === 0) {
    return "";
  }

  const lines = [];

  if (format === "markdown") {
    const blocks = ["### Competition Rankings"];

    if (sectionLines.length > 0) {
      blocks.push(sectionLines.join("\n\n"));
    }

    if (disparities.length > 0) {
      const disparityLines = disparities.map((disparity) =>
        formatDisparityLine(
          disparity,
          teamALabel,
          teamBLabel,
          totalTeams,
          format
        )
      );
      blocks.push(
        ["**Biggest ranking edges:**", ...disparityLines].join("\n\n")
      );
    }

    return blocks.join("\n\n");
  } else {
    lines.push("Competition rankings:");
    if (sectionLines.length > 0) {
      lines.push(...sectionLines);
    }
    if (disparities.length > 0) {
      if (sectionLines.length > 0) {
        lines.push("");
      }
      lines.push("Biggest ranking edges:");
      lines.push(
        ...disparities.map((disparity) =>
          formatDisparityLine(
            disparity,
            teamALabel,
            teamBLabel,
            totalTeams,
            format
          )
        )
      );
    }
  }

  return lines.join("\n");
}
