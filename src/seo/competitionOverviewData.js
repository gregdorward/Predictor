/**
 * Cross-league comparison dataset for /competitions/compare/.
 *
 * Server-safe (no `window` guards) so the daily cron, getServerSideProps and the
 * client charts all share one definition of which leagues qualify and which
 * metrics exist. Rows are deliberately tiny (~20 numbers) so the whole set can
 * be server-rendered without the payload problem that forced CompetitionPage to
 * be ssr:false.
 */

import { isCompetitionSeasonEmpty } from "./competitionSeason";
import { STAT_HUB_ALLOWED_COUNTRIES } from "./statPageData";

/**
 * Leagues below this are excluded outright - a handful of games says nothing
 * about a league's scoring profile. Kept low enough that the major European
 * leagues still qualify in August, when they are only a few rounds in.
 */
export const COMPARISON_MIN_MATCHES = 10;

/** Rows below this are flagged in the UI so early-season rates are read with care. */
export const COMPARISON_LOW_SAMPLE_MATCHES = 30;

/** Below this many qualifying leagues the page is not worth indexing. */
export const COMPARISON_MIN_ROWS = 10;

/**
 * Every comparable metric, shared by the table and the charts.
 * `unit: "%"` renders as a percentage; `unit: "avg"` as a per-match average.
 */
export const COMPARISON_METRICS = [
  { key: "avgGoals", label: "Goals per game", short: "Goals", unit: "avg", decimals: 2 },
  { key: "btts", label: "Both teams to score", short: "BTTS", unit: "%", decimals: 0 },
  { key: "over25", label: "Over 2.5 goals", short: "O2.5", unit: "%", decimals: 0 },
  { key: "over15", label: "Over 1.5 goals", short: "O1.5", unit: "%", decimals: 0 },
  { key: "over35", label: "Over 3.5 goals", short: "O3.5", unit: "%", decimals: 0 },
  { key: "under25", label: "Under 2.5 goals", short: "U2.5", unit: "%", decimals: 0 },
  { key: "cards", label: "Cards per game", short: "Cards", unit: "avg", decimals: 2 },
  { key: "corners", label: "Corners per game", short: "Corners", unit: "avg", decimals: 2 },
  { key: "fouls", label: "Fouls per game", short: "Fouls", unit: "avg", decimals: 1 },
  { key: "homeWin", label: "Home wins", short: "Home", unit: "%", decimals: 0 },
  { key: "draw", label: "Draws", short: "Draw", unit: "%", decimals: 0 },
  { key: "awayWin", label: "Away wins", short: "Away", unit: "%", decimals: 0 },
];

/** Metrics offered in the leaderboard chart's metric switcher. */
export const CHARTABLE_METRIC_KEYS = [
  "avgGoals",
  "btts",
  "over25",
  "cards",
  "corners",
  "homeWin",
];

export function getComparisonMetric(key) {
  return COMPARISON_METRICS.find((metric) => metric.key === key) || null;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Some competitions report a metric family as all-but-zero because the source
 * never records it (e.g. National League cards averaging 0.02). Treating those
 * as real would put them top of an "fewest cards" ranking, so drop them.
 */
function toRate(value) {
  const n = toNumber(value);
  if (n === null || n <= 0) return null;
  return n;
}

function readMatchesCompleted(data) {
  const candidates = [
    data?.matchesCompleted,
    data?.matches_completed,
    data?.seasonMatchesPlayed_overall,
  ];
  for (const candidate of candidates) {
    const n = toNumber(candidate);
    if (n !== null) return n;
  }
  return null;
}

/** Reduce one /competition/{id} payload to a compact comparison row. */
export function buildOverviewRow(data, catalog) {
  if (!data || !catalog?.slug) return null;

  return {
    id: toNumber(data.id) ?? catalog.id ?? null,
    slug: catalog.slug,
    // Catalog names win here: the provider returns ambiguous labels such as
    // "Super League" and "2 Bundesliga", and a cross-league table needs the same
    // wording as the rest of the site's navigation.
    name: catalog.name || data.english_name || data.name || null,
    country: data.country || null,
    season: data.season || null,
    division: toNumber(data.division),
    played: readMatchesCompleted(data),
    total: toNumber(data.totalMatches),
    avgGoals: toRate(data.seasonAVG_overall),
    avgGoalsHome: toRate(data.seasonAVG_home),
    avgGoalsAway: toRate(data.seasonAVG_away),
    btts: toRate(data.seasonBTTSPercentage),
    over15: toRate(data.seasonOver15Percentage_overall),
    over25: toRate(data.seasonOver25Percentage_overall),
    over35: toRate(data.seasonOver35Percentage_overall),
    under25: toRate(data.seasonUnder25Percentage_overall),
    cards: toRate(data.cardsAVG_overall),
    corners: toRate(data.cornersAVG_overall),
    fouls: toRate(data.foulsAVG_overall),
    homeWin: toRate(data.homeWinPercentage),
    draw: toRate(data.drawPercentage),
    awayWin: toRate(data.awayWinPercentage),
  };
}

/**
 * Same coverage rule as the existing stat hub pages: top-four tiers in the
 * countries we cover. This also keeps cups out, since they report
 * `division: -1` and a continental `country` such as "Europe".
 */
export function isComparisonEligible(row) {
  if (!row?.slug) return false;
  if (!STAT_HUB_ALLOWED_COUNTRIES.includes(row.country)) return false;
  if (!(row.division > 0 && row.division < 5)) return false;
  if (!(row.played >= COMPARISON_MIN_MATCHES)) return false;
  return row.avgGoals !== null;
}

export function isLowSample(row) {
  return (row?.played ?? 0) < COMPARISON_LOW_SAMPLE_MATCHES;
}

/**
 * Build a row from a payload and keep it only if it qualifies.
 * Returns null for unstarted seasons, cups and out-of-scope tiers.
 */
export function buildEligibleRow(data, catalog) {
  if (!data || isCompetitionSeasonEmpty(data)) return null;
  const row = buildOverviewRow(data, catalog);
  return isComparisonEligible(row) ? row : null;
}

/** Final blob written to S3 and read by the page. */
export function buildCompetitionOverview(rows, { generatedAt = new Date() } = {}) {
  const competitions = (rows || [])
    .filter(Boolean)
    .sort((a, b) => (b.avgGoals ?? 0) - (a.avgGoals ?? 0));

  return {
    generatedAt: new Date(generatedAt).toISOString(),
    minMatches: COMPARISON_MIN_MATCHES,
    lowSampleMatches: COMPARISON_LOW_SAMPLE_MATCHES,
    competitions,
  };
}

/** Guards against serving a partially-built or stale-shaped blob. */
export function isValidOverviewPayload(payload) {
  return (
    !!payload &&
    typeof payload.generatedAt === "string" &&
    Array.isArray(payload.competitions) &&
    payload.competitions.every((row) => typeof row?.slug === "string")
  );
}

export function formatMetricValue(value, metric) {
  const n = toNumber(value);
  if (n === null || !metric) return null;
  const fixed = n.toFixed(metric.decimals);
  return metric.unit === "%" ? `${fixed}%` : fixed;
}

/** Leagues ranked by one metric, highest first, skipping leagues missing it. */
export function rankByMetric(competitions, metricKey) {
  return (competitions || [])
    .filter((row) => toNumber(row?.[metricKey]) !== null)
    .sort((a, b) => Number(b[metricKey]) - Number(a[metricKey]));
}

/** Mean of a metric across the qualifying leagues, for "vs average" context. */
export function averageForMetric(competitions, metricKey) {
  const values = (competitions || [])
    .map((row) => toNumber(row?.[metricKey]))
    .filter((value) => value !== null);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
