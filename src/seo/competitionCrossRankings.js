import {
  averageForMetric,
  rankByMetric,
} from "./competitionOverviewData";

function ordinal(rank) {
  const n = Number(rank);
  if (!Number.isFinite(n)) return String(rank);
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function findRank(competitions, slug, metricKey) {
  const ranked = rankByMetric(competitions, metricKey);
  const index = ranked.findIndex((row) => row.slug === slug);
  if (index < 0) return null;
  return { rank: index + 1, total: ranked.length, metricKey };
}

const METRIC_COPY = {
  avgGoals: {
    high: "highest-scoring",
    low: "lowest-scoring",
    compareLabel: "goals per game",
  },
  homeWin: {
    high: "strongest home-win rate",
    low: "weakest home-win rate",
    compareLabel: "home wins",
  },
  draw: {
    high: "highest draw rate",
    low: "lowest draw rate",
    compareLabel: "draws",
  },
  btts: {
    high: "highest BTTS rate",
    low: "lowest BTTS rate",
    compareLabel: "both teams to score",
  },
};

function buildRankInsight(competitions, slug, metricKey, direction = "high") {
  const ranked = rankByMetric(competitions, metricKey);
  const index = ranked.findIndex((row) => row.slug === slug);
  if (index < 0 || ranked.length < 5) return null;

  const copy = METRIC_COPY[metricKey];
  if (!copy) return null;

  const rank = index + 1;
  const isTop = direction === "high" ? rank <= 5 : rank >= ranked.length - 4;
  if (!isTop) return null;

  const label = direction === "high" ? copy.high : copy.low;
  return {
    before: `${ordinal(rank)} of ${ranked.length} leagues in our comparison for ${label} (${copy.compareLabel}). See the `,
    href: "/competitions/compare/",
    linkLabel: "league comparison table",
    after: ".",
  };
}

function buildVsAverageInsight(competitions, row, metricKey, label) {
  const value = Number(row?.[metricKey]);
  const average = averageForMetric(competitions, metricKey);
  if (!Number.isFinite(value) || average === null) return null;

  const delta = value - average;
  if (Math.abs(delta) < 4) return null;

  const direction = delta > 0 ? "above" : "below";
  return {
    before: `${label} (${value.toFixed(0)}%) is ${Math.abs(delta).toFixed(
      0
    )} points ${direction} the cross-league average on `,
    href: "/competitions/compare/",
    linkLabel: "our compare page",
    after: ".",
  };
}

/**
 * Short, data-backed bullets for competition SEO shells (not templated name swaps).
 * @returns {Array<{ before: string, href?: string, linkLabel?: string, after?: string }>}
 */
export function buildCompetitionCrossRankInsights(overview, slug) {
  const competitions = overview?.competitions || [];
  if (!slug || competitions.length < 10) return [];

  const row = competitions.find((entry) => entry.slug === slug);
  if (!row) return [];

  const insights = [];

  const goalsRank = findRank(competitions, slug, "avgGoals");
  if (goalsRank && goalsRank.rank <= 5) {
    const top = buildRankInsight(competitions, slug, "avgGoals", "high");
    if (top) insights.push(top);
  } else if (goalsRank && goalsRank.rank >= goalsRank.total - 4) {
    const low = buildRankInsight(competitions, slug, "avgGoals", "low");
    if (low) insights.push(low);
  }

  const homeInsight = buildVsAverageInsight(
    competitions,
    row,
    "homeWin",
    "Home wins"
  );
  if (homeInsight) insights.push(homeInsight);

  const drawTop = buildRankInsight(competitions, slug, "draw", "high");
  if (drawTop) insights.push(drawTop);

  const bttsTop = buildRankInsight(competitions, slug, "btts", "high");
  if (bttsTop && insights.length < 3) insights.push(bttsTop);

  return insights.slice(0, 3);
}
