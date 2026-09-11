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

/** Softer floor for the team lookup search (early-season clubs still findable). */
export const MRI_TEAM_SEARCH_MIN_FAVOURITES = 3;

/** How many teams to keep at each end of the reliability spectrum. */
export const MRI_TEAM_EXTREMES = 15;

/** Soft floor for underdog-points ranking (matches team search). */
export const MRI_UNDERDOG_MIN_APPEARANCES = MRI_TEAM_SEARCH_MIN_FAVOURITES;

/** Top underdogs to surface on the overview. */
export const MRI_UNDERDOG_TOP = 15;

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
  {
    key: "favouriteRoi",
    label: "Favourite ROI",
    short: "Fav ROI",
    unit: "roi%",
    decimals: 1,
  },
  {
    key: "underdogRoi",
    label: "Underdog ROI",
    short: "Dog ROI",
    unit: "roi%",
    decimals: 1,
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
  if (metric.unit === "roi%") {
    const signed = n > 0 ? `+${fixed}` : fixed;
    return `${signed}%`;
  }
  if (metric.unit === "%") return `${fixed}%`;
  return fixed;
}

/** Tooltip text for flat-stake P&L, e.g. "+2.10u / 20". */
export function formatMriProfitTooltip(profit, bets) {
  const net = toNumber(profit);
  const stakeCount = toNumber(bets);
  if (net === null || stakeCount === null || stakeCount <= 0) return null;
  const signed = net > 0 ? `+${net.toFixed(2)}` : net.toFixed(2);
  return `${signed}u / ${stakeCount}`;
}

/** "12/20" style label for correctly priced favourites. */
export function formatCorrectlyPriced(correct, total) {
  const hits = toNumber(correct);
  const n = toNumber(total);
  if (hits === null || n === null || n <= 0) return null;
  return `${hits}/${n}`;
}

/** "W/D/L" record, e.g. "5/2/3". */
export function formatWdlRecord(wins, draws, losses) {
  const w = toNumber(wins);
  const d = toNumber(draws);
  const l = toNumber(losses);
  if (w === null || d === null || l === null) return null;
  return `${w}/${d}/${l}`;
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
    favouriteProfit: summary.favouriteProfit,
    favouriteRoi: summary.favouriteRoi,
    // Alias for the UI "X/Y correctly priced" column (favourite wins / priced).
    correctlyPriced: summary.favouriteWins,
  };
}

function mapTeamRow(team, catalog) {
  return {
    name: team.name,
    leagueSlug: catalog.slug,
    leagueName: catalog.name,
    favouriteCount: team.favouriteCount,
    underdogCount: team.underdogCount,
    winningFavouriteCount: team.winningFavouriteCount,
    drawingFavouriteCount: team.drawingFavouriteCount,
    beatenFavouriteCount: team.beatenFavouriteCount,
    winningUnderdogCount: team.winningUnderdogCount,
    drawingUnderdogCount: team.drawingUnderdogCount,
    beatenUnderdogCount: team.beatenUnderdogCount,
    correctlyPriced: team.winningFavouriteCount,
    pricedMatches: team.favouriteCount,
    predictabilityScore: team.predictabilityScore,
    reliabilityLabel: team.reliabilityLabel,
    oddsReliabilityWin: team.oddsReliabilityWin,
    oddsReliabilityWinAsUnderdog: team.oddsReliabilityWinAsUnderdog,
    favouriteProfit: team.favouriteProfit,
    favouriteRoi: team.favouriteRoi,
    underdogProfit: team.underdogProfit,
    underdogRoi: team.underdogRoi,
    underdogPoints: team.underdogPoints,
  };
}

function buildTeamRows(
  leagueResults,
  catalog,
  {
    minFavourites = MRI_TEAM_MIN_FAVOURITES,
    minUnderdogs = null,
  } = {}
) {
  const fixtures = Array.isArray(leagueResults?.fixtures)
    ? leagueResults.fixtures
    : [];
  return buildTeamReliabilityFromFixtures(fixtures)
    .filter((team) => {
      if (minUnderdogs != null) {
        return (team.underdogCount || 0) >= minUnderdogs;
      }
      return (
        (team.favouriteCount || 0) >= minFavourites &&
        team.predictabilityScore !== null
      );
    })
    .map((team) => mapTeamRow(team, catalog));
}

function normalizeTeamQuery(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Rank team matches for the search box. Exact / prefix beats substring.
 * Returns up to `limit` candidates; callers pick the first as the single row.
 */
export function searchTeamReliability(teams, query, { limit = 8 } = {}) {
  const needle = normalizeTeamQuery(query);
  if (!needle || !Array.isArray(teams) || teams.length === 0) return [];

  const scored = [];
  for (const team of teams) {
    const name = normalizeTeamQuery(team?.name);
    if (!name) continue;

    let rank = 0;
    if (name === needle) rank = 300;
    else if (name.startsWith(needle)) rank = 200;
    else if (name.includes(needle)) rank = 100;
    else continue;

    // Prefer stronger sample / score when names tie.
    scored.push({
      team,
      rank:
        rank +
        Math.min(team.favouriteCount || 0, 40) +
        (team.predictabilityScore || 0) / 100,
    });
  }

  return scored
    .sort((a, b) => b.rank - a.rank || a.team.name.localeCompare(b.team.name))
    .slice(0, limit)
    .map((entry) => entry.team);
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
  const searchTeams = [];
  const extremeCandidates = [];
  const underdogCandidates = [];

  for (const league of leaguesRaw) {
    const catalog = catalogById.get(Number(league?.id));
    if (!catalog) continue;

    const row = buildLeagueMriRow(league, catalog);
    if (row) leagues.push(row);

    searchTeams.push(
      ...buildTeamRows(league, catalog, {
        minFavourites: MRI_TEAM_SEARCH_MIN_FAVOURITES,
      })
    );
    extremeCandidates.push(
      ...buildTeamRows(league, catalog, {
        minFavourites: MRI_TEAM_MIN_FAVOURITES,
      })
    );
    underdogCandidates.push(
      ...buildTeamRows(league, catalog, {
        minUnderdogs: MRI_UNDERDOG_MIN_APPEARANCES,
      })
    );
  }

  leagues.sort(
    (a, b) => (b.predictabilityScore ?? 0) - (a.predictabilityScore ?? 0)
  );

  const sortedSearchTeams = [...searchTeams].sort(
    (a, b) => (b.predictabilityScore ?? 0) - (a.predictabilityScore ?? 0)
  );
  const sortedExtremes = [...extremeCandidates].sort(
    (a, b) => (b.predictabilityScore ?? 0) - (a.predictabilityScore ?? 0)
  );

  const mostEffectiveUnderdogs = [...underdogCandidates]
    .sort(
      (a, b) =>
        (b.underdogPoints ?? 0) - (a.underdogPoints ?? 0) ||
        (b.underdogRoi ?? -Infinity) - (a.underdogRoi ?? -Infinity) ||
        a.name.localeCompare(b.name)
    )
    .slice(0, MRI_UNDERDOG_TOP);

  return {
    generatedAt: new Date(generatedAt).toISOString(),
    minPricedMatches: MRI_MIN_PRICED_MATCHES,
    lowSampleMatches: MRI_LOW_SAMPLE_MATCHES,
    teamSearchMinFavourites: MRI_TEAM_SEARCH_MIN_FAVOURITES,
    underdogMinAppearances: MRI_UNDERDOG_MIN_APPEARANCES,
    leagues,
    // Full searchable set for the team lookup section.
    teams: sortedSearchTeams,
    mostReliableTeams: sortedExtremes.slice(0, MRI_TEAM_EXTREMES),
    leastReliableTeams: [...sortedExtremes]
      .reverse()
      .slice(0, MRI_TEAM_EXTREMES),
    mostEffectiveUnderdogs,
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
