/**
 * Market Reliability Index dataset for /market-reliability/.
 *
 * Built from the cached /results blob (odds + scores already stored), so the
 * daily cron adds no RapidAPI load. Rows stay tiny so the page can SSR.
 */

import {
  buildLeagueReliabilityFromFixtures,
  buildTeamReliabilityFromFixtures,
} from "../logic/marketReliability";

/** Leagues / teams below this priced-match count are excluded. */
export const MRI_MIN_PRICED_MATCHES = 10;

/** Flag early-season noise in the UI. */
export const MRI_LOW_SAMPLE_MATCHES = 30;

/** Below this many leagues the page is not worth indexing. */
export const MRI_MIN_ROWS = 8;

/** Minimum favourite appearances before a team appears in the extremes lists. */
export const MRI_TEAM_MIN_FAVOURITES = 6;

/** How many teams to keep at each end of the reliability spectrum. */
export const MRI_TEAM_EXTREMES = 15;

export const MRI_METRICS = [
  {
    key: "predictabilityScore",
    label: "Predictability score",
    short: "Score",
    unit: "score",
    decimals: 2,
  },
  {
    key: "favouriteHitRate",
    label: "Favourite win rate",
    short: "Fav W%",
    unit: "%",
    decimals: 0,
  },
  {
    key: "favouriteUpsetRate",
    label: "Favourite upset rate",
    short: "Upset%",
    unit: "%",
    decimals: 0,
  },
  {
    key: "favouriteDrawRate",
    label: "Favourite draw rate",
    short: "Fav D%",
    unit: "%",
    decimals: 0,
  },
  {
    key: "drawRate",
    label: "Draw rate",
    short: "Draw%",
    unit: "%",
    decimals: 0,
  },
  {
    key: "homeFavouriteHitRate",
    label: "Home favourite win rate",
    short: "Home fav%",
    unit: "%",
    decimals: 0,
  },
  {
    key: "awayFavouriteHitRate",
    label: "Away favourite win rate",
    short: "Away fav%",
    unit: "%",
    decimals: 0,
  },
];

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function getMriMetric(key) {
  return MRI_METRICS.find((metric) => metric.key === key) || null;
}

export function formatMriMetricValue(value, metric) {
  const n = toNumber(value);
  if (n === null || !metric) return null;
  const fixed = n.toFixed(metric.decimals);
  if (metric.unit === "%") return `${fixed}%`;
  return fixed;
}

/** "12/20" style label for correctly priced favourites. */
export function formatCorrectlyPriced(correct, total) {
  const hits = toNumber(correct);
  const n = toNumber(total);
  if (hits === null || n === null || n <= 0) return null;
  return `${hits}/${n}`;
}

export function isLowSample(row) {
  return (row?.pricedMatches ?? 0) < MRI_LOW_SAMPLE_MATCHES;
}

/**
 * Reduce one /results league object + catalog entry to a compact MRI row.
 * Returns null when the league is not in the catalog or sample is too thin.
 */
export function buildLeagueMriRow(leagueResults, catalog) {
  if (!catalog?.slug || !leagueResults) return null;

  const fixtures = Array.isArray(leagueResults.fixtures)
    ? leagueResults.fixtures
    : Array.isArray(leagueResults.data)
      ? leagueResults.data
      : [];

  const summary = buildLeagueReliabilityFromFixtures(fixtures);
  if (summary.pricedMatches < MRI_MIN_PRICED_MATCHES) return null;
  if (summary.predictabilityScore === null) return null;

  return {
    id: toNumber(leagueResults.id) ?? catalog.id ?? null,
    slug: catalog.slug,
    name: catalog.name || leagueResults.name || null,
    pricedMatches: summary.pricedMatches,
    played: summary.played,
    predictabilityScore: summary.predictabilityScore,
    reliabilityLabel: summary.reliabilityLabel,
    favouriteHitRate: summary.favouriteHitRate,
    favouriteDrawRate: summary.favouriteDrawRate,
    favouriteUpsetRate: summary.favouriteUpsetRate,
    drawRate: summary.drawRate,
    homeFavouriteHitRate: summary.homeFavouriteHitRate,
    awayFavouriteHitRate: summary.awayFavouriteHitRate,
    favouriteWins: summary.favouriteWins,
    favouriteDraws: summary.favouriteDraws,
    favouriteLosses: summary.favouriteLosses,
    // Alias for the UI "X/Y correctly priced" column (favourite wins / priced).
    correctlyPriced: summary.favouriteWins,
  };
}

function buildTeamExtremes(leagueResults, catalog) {
  const fixtures = Array.isArray(leagueResults?.fixtures)
    ? leagueResults.fixtures
    : [];
  return buildTeamReliabilityFromFixtures(fixtures)
    .filter(
      (team) =>
        (team.favouriteCount || 0) >= MRI_TEAM_MIN_FAVOURITES &&
        team.predictabilityScore !== null
    )
    .map((team) => ({
      name: team.name,
      leagueSlug: catalog.slug,
      leagueName: catalog.name,
      favouriteCount: team.favouriteCount,
      underdogCount: team.underdogCount,
      winningFavouriteCount: team.winningFavouriteCount,
      correctlyPriced: team.winningFavouriteCount,
      pricedMatches: team.favouriteCount,
      predictabilityScore: team.predictabilityScore,
      reliabilityLabel: team.reliabilityLabel,
      oddsReliabilityWin: team.oddsReliabilityWin,
      oddsReliabilityWinAsUnderdog: team.oddsReliabilityWinAsUnderdog,
    }));
}

/**
 * Build the S3 payload from cached /results + the competition catalog.
 * `resultsPayload` may be `{ data: [...] }` or a bare league array.
 */
export function buildMarketReliabilityOverview(
  resultsPayload,
  catalogEntries,
  { generatedAt = new Date() } = {}
) {
  const leaguesRaw = Array.isArray(resultsPayload?.data)
    ? resultsPayload.data
    : Array.isArray(resultsPayload)
      ? resultsPayload
      : [];

  const catalogById = new Map(
    (catalogEntries || [])
      .filter((entry) => entry?.id != null)
      .map((entry) => [Number(entry.id), entry])
  );

  const leagues = [];
  const allTeams = [];

  for (const league of leaguesRaw) {
    const catalog = catalogById.get(Number(league?.id));
    if (!catalog) continue;

    const row = buildLeagueMriRow(league, catalog);
    if (row) leagues.push(row);

    allTeams.push(...buildTeamExtremes(league, catalog));
  }

  leagues.sort(
    (a, b) => (b.predictabilityScore ?? 0) - (a.predictabilityScore ?? 0)
  );

  const sortedTeams = [...allTeams].sort(
    (a, b) => (b.predictabilityScore ?? 0) - (a.predictabilityScore ?? 0)
  );

  return {
    generatedAt: new Date(generatedAt).toISOString(),
    minPricedMatches: MRI_MIN_PRICED_MATCHES,
    lowSampleMatches: MRI_LOW_SAMPLE_MATCHES,
    leagues,
    mostReliableTeams: sortedTeams.slice(0, MRI_TEAM_EXTREMES),
    leastReliableTeams: [...sortedTeams]
      .reverse()
      .slice(0, MRI_TEAM_EXTREMES),
  };
}

export function isValidMriOverviewPayload(payload) {
  return (
    !!payload &&
    typeof payload.generatedAt === "string" &&
    Array.isArray(payload.leagues) &&
    payload.leagues.every((row) => typeof row?.slug === "string")
  );
}
