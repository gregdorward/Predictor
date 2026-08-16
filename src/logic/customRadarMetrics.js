import { isMissingStat } from "../utils/formatStat";

export const MIN_RADAR_METRICS = 3;
export const MAX_RADAR_METRICS = 10;
export const FREE_CUSTOM_RADAR_FIXTURE_LIMIT = 5;

export const RADAR_CATEGORIES = [
  { id: "attacking", label: "Attacking" },
  { id: "defending", label: "Defending" },
  { id: "possession", label: "In possession" },
  { id: "outOfPossession", label: "Out of possession" },
  { id: "setPiecesForm", label: "Set pieces / form" },
  { id: "discipline", label: "Discipline" },
  { id: "strength", label: "Strength ratings" },
];

function parseStatNumber(value) {
  if (isMissingStat(value)) return null;
  const cleaned = String(value).replace(/%/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function fromStats(key) {
  return (stats) => parseStatNumber(stats?.[key]);
}

function fromForm(key) {
  return (_stats, form) => {
    const n = Number(form?.[key]);
    return Number.isFinite(n) ? n : null;
  };
}

/** Season average of a per-match field on form.allTeamResults (from getPastLeagueResults). */
function avgFromAllTeamResults(form, key) {
  const results = form?.allTeamResults;
  if (!Array.isArray(results) || results.length === 0) return null;
  const nums = results
    .map((row) => Number(row?.[key]))
    .filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

/** Season sum of a per-match field (e.g. sparse penalty awards). */
function sumFromAllTeamResults(form, key) {
  const results = form?.allTeamResults;
  if (!Array.isArray(results) || results.length === 0) return null;
  const nums = results
    .map((row) => Number(row?.[key]))
    .filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  return nums.reduce((sum, n) => sum + n, 0);
}

function fromStatsOrResults(statsKey, resultsKey) {
  return (stats, form) => {
    const fromSofa = parseStatNumber(stats?.[statsKey]);
    if (fromSofa != null) return fromSofa;
    return avgFromAllTeamResults(form, resultsKey);
  };
}

/** SofaScore season totals → per-game using gameCount / allTeamResults length. */
function resolveMatchesPlayed(stats, form) {
  const fromStats =
    parseStatNumber(stats?.gameCount) ?? parseStatNumber(stats?.matches);
  if (fromStats != null && fromStats > 0) return fromStats;
  const fromForm = form?.allTeamResults?.length;
  return fromForm > 0 ? fromForm : null;
}

function perGameFromSeasonTotal(statsKey) {
  return (stats, form) => {
    const total = parseStatNumber(stats?.[statsKey]);
    if (total == null) return null;
    const matches = resolveMatchesPlayed(stats, form);
    if (matches == null) return null;
    return total / matches;
  };
}

/** SofaScore cards/game, else CardsTotal ÷ league games played. */
function cardsPerGameValue(stats, form) {
  const fromSofa = parseStatNumber(stats?.CardsPerGame);
  if (fromSofa != null) return fromSofa;
  const total = Number(form?.CardsTotal);
  const games = form?.allTeamResults?.length;
  if (Number.isFinite(total) && games > 0) return total / games;
  return null;
}

/**
 * Catalog of selectable radar axes.
 * Ranges are fixed expected scales so home/away gaps stay meaningful.
 * lower-is-better metrics are inverted during normalize so outward = stronger.
 */
export const CUSTOM_RADAR_METRICS = [
  // Attacking
  {
    key: "goals",
    label: "Goals",
    category: "attacking",
    higherIsBetter: true,
    range: [0, 3],
    decimals: 2,
    getValue: fromStats("goals"),
  },
  {
    key: "XG",
    label: "xG",
    category: "attacking",
    higherIsBetter: true,
    range: [0, 3],
    decimals: 2,
    getValue: fromStats("XG"),
  },
  {
    key: "npXG",
    label: "npXG",
    category: "attacking",
    higherIsBetter: true,
    range: [0, 3],
    decimals: 2,
    getValue: fromStats("npXG"),
  },
  {
    key: "shots",
    label: "Shots",
    category: "attacking",
    higherIsBetter: true,
    range: [0, 20],
    decimals: 1,
    getValue: fromStats("shots"),
  },
  {
    key: "sot",
    label: "Shots on target",
    category: "attacking",
    higherIsBetter: true,
    range: [0, 8],
    decimals: 1,
    getValue: fromStats("sot"),
  },
  {
    key: "dangerousAttacks",
    label: "Dangerous attacks",
    category: "attacking",
    higherIsBetter: true,
    range: [0, 80],
    decimals: 1,
    getValue: fromStats("dangerousAttacks"),
  },
  {
    key: "bigChances",
    label: "Big chances",
    category: "attacking",
    higherIsBetter: true,
    range: [0, 4],
    decimals: 2,
    getValue: perGameFromSeasonTotal("bigChances"),
  },
  {
    key: "shootingAccuracy",
    label: "Shooting accuracy",
    category: "attacking",
    higherIsBetter: true,
    range: [0, 100],
    decimals: 1,
    suffix: "%",
    getValue: fromStats("shootingAccuracy"),
  },
  {
    key: "goalConversionRate",
    label: "Shot conversion",
    category: "attacking",
    higherIsBetter: true,
    range: [0, 30],
    decimals: 1,
    suffix: "%",
    getValue: fromStats("goalConversionRate"),
  },
  {
    key: "shotsFromInsideBoxPercentage",
    label: "Shot Proximity",
    category: "attacking",
    higherIsBetter: true,
    range: [0, 100],
    decimals: 1,
    suffix: "%",
    getValue: fromStats("shotsFromInsideBoxPercentage"),
  },

  // Defending
  {
    key: "conceeded",
    label: "Goals conceded",
    category: "defending",
    higherIsBetter: false,
    range: [0, 3],
    decimals: 2,
    getValue: fromStats("conceeded"),
  },
  {
    key: "XGConceded",
    label: "xG conceded",
    category: "defending",
    higherIsBetter: false,
    range: [0, 3],
    decimals: 2,
    getValue: fromStats("XGConceded"),
  },
  {
    key: "shotsOnTargetAgainst",
    label: "SOT against",
    category: "defending",
    higherIsBetter: false,
    range: [0, 8],
    decimals: 1,
    getValue: fromStats("shotsOnTargetAgainst"),
  },
  {
    key: "cleansheetPercentage",
    label: "Clean sheet %",
    category: "defending",
    higherIsBetter: true,
    range: [0, 100],
    decimals: 1,
    suffix: "%",
    getValue: fromStats("cleansheetPercentage"),
  },
  {
    key: "bigChancesConceded",
    label: "Big chances conceded",
    category: "defending",
    higherIsBetter: false,
    range: [0, 4],
    decimals: 2,
    getValue: perGameFromSeasonTotal("bigChancesConceded"),
  },
  {
    key: "shotsInsideBoxAgainst",
    label: "Shots inside box against",
    category: "defending",
    higherIsBetter: false,
    range: [0, 15],
    decimals: 1,
    getValue: fromStats("shotsInsideBoxAgainst"),
  },

  // In possession
  {
    key: "possession",
    label: "Possession",
    category: "possession",
    higherIsBetter: true,
    range: [20, 80],
    decimals: 1,
    suffix: "%",
    getValue: fromStats("possession"),
  },
  {
    key: "accuratePassesPercentage",
    label: "Pass accuracy",
    category: "possession",
    higherIsBetter: true,
    range: [60, 95],
    decimals: 1,
    suffix: "%",
    getValue: fromStats("accuratePassesPercentage"),
  },
  {
    key: "accuratePassesOpponentHalf",
    label: "Attacking-half pass %",
    category: "possession",
    higherIsBetter: true,
    range: [50, 90],
    decimals: 1,
    suffix: "%",
    getValue: fromStats("accuratePassesOpponentHalf"),
  },
  {
    key: "successfulDribbles",
    label: "Successful dribbles",
    category: "possession",
    higherIsBetter: true,
    range: [0, 15],
    decimals: 1,
    getValue: fromStats("successfulDribbles"),
  },
  {
    key: "PPAA",
    label: "PPAA",
    category: "possession",
    higherIsBetter: false,
    range: [5, 40],
    decimals: 1,
    getValue: fromStats("PPAA"),
  },
  {
    key: "longBallPercentage",
    label: "Long-ball %",
    category: "possession",
    higherIsBetter: false,
    range: [0, 40],
    decimals: 1,
    suffix: "%",
    getValue: fromStats("longBallPercentage"),
  },

  // Out of possession
  {
    key: "PPDA",
    label: "PPDA",
    category: "outOfPossession",
    higherIsBetter: false,
    range: [5, 25],
    decimals: 1,
    getValue: fromStats("PPDA"),
  },
  {
    key: "tackles",
    label: "Tackles",
    category: "outOfPossession",
    higherIsBetter: true,
    range: [0, 25],
    decimals: 1,
    getValue: fromStats("tackles"),
  },
  {
    key: "interceptions",
    label: "Interceptions",
    category: "outOfPossession",
    higherIsBetter: true,
    range: [0, 15],
    decimals: 1,
    getValue: fromStats("interceptions"),
  },
  {
    key: "ballRecovery",
    label: "Ball recoveries",
    category: "outOfPossession",
    higherIsBetter: true,
    range: [0, 60],
    decimals: 1,
    getValue: fromStats("ballRecovery"),
  },
  {
    key: "duelsWonPercentage",
    label: "Duels won %",
    category: "outOfPossession",
    higherIsBetter: true,
    range: [30, 70],
    decimals: 1,
    suffix: "%",
    getValue: fromStats("duelsWonPercentage"),
  },

  // Set pieces / form
  {
    key: "CornersAverage",
    label: "Corners",
    category: "setPiecesForm",
    higherIsBetter: true,
    range: [0, 10],
    decimals: 1,
    getValue: fromStats("CornersAverage"),
  },
  {
    key: "BttsPercentage",
    label: "BTTS %",
    category: "setPiecesForm",
    higherIsBetter: true,
    range: [0, 100],
    decimals: 1,
    suffix: "%",
    getValue: fromStats("BttsPercentage"),
  },
  {
    key: "ppg",
    label: "PPG",
    category: "setPiecesForm",
    higherIsBetter: true,
    range: [0, 3],
    decimals: 2,
    getValue: fromStats("ppg"),
  },
  {
    key: "winPercentage",
    label: "H/A PPG",
    category: "setPiecesForm",
    higherIsBetter: true,
    range: [0, 3],
    decimals: 2,
    getValue: fromStats("winPercentage"),
  },
  {
    key: "FreeKickGoals",
    label: "Free-kick goals",
    category: "setPiecesForm",
    higherIsBetter: true,
    range: [0, 8],
    decimals: 1,
    getValue: fromStats("FreeKickGoals"),
  },

  // Discipline (SofaScore where present; fouls also from getPastLeagueResults match rows)
  {
    key: "FoulsPerGame",
    label: "Fouls per game",
    category: "discipline",
    higherIsBetter: false,
    range: [5, 20],
    decimals: 1,
    getValue: fromStatsOrResults("FoulsPerGame", "fouls"),
  },
  {
    key: "foulsAgainst",
    label: "Fouls won",
    category: "discipline",
    higherIsBetter: true,
    range: [5, 20],
    decimals: 1,
    getValue: (_stats, form) => avgFromAllTeamResults(form, "foulsAgainst"),
  },
  {
    key: "CardsPerGame",
    label: "Yellow cards / game",
    category: "discipline",
    higherIsBetter: false,
    range: [0, 4],
    decimals: 2,
    getValue: cardsPerGameValue,
  },
  {
    key: "RedCardsPerGame",
    label: "Red cards / game",
    category: "discipline",
    higherIsBetter: false,
    range: [0, 0.4],
    decimals: 2,
    getValue: fromStats("RedCardsPerGame"),
  },
  {
    key: "PenaltiesFor",
    label: "Penalties for",
    category: "discipline",
    higherIsBetter: true,
    range: [0, 8],
    decimals: 0,
    getValue: (_stats, form) => sumFromAllTeamResults(form, "penaltiesWon"),
  },
  {
    key: "PenaltiesConceded",
    label: "Penalties conceded",
    category: "discipline",
    higherIsBetter: false,
    range: [0, 8],
    decimals: 1,
    getValue: (stats, form) => {
      const fromSofa = parseStatNumber(stats?.PenaltiesConceded);
      if (fromSofa != null) return fromSofa;
      return sumFromAllTeamResults(form, "penaltiesAgainst");
    },
  },
  {
    key: "offsides",
    label: "Offsides per game",
    category: "discipline",
    higherIsBetter: false,
    range: [0, 5],
    decimals: 1,
    getValue: fromStats("offsides"),
  },

  // Strength ratings (0–1 composites from form)
  {
    key: "attackingStrength",
    label: "Attack rating",
    category: "strength",
    higherIsBetter: true,
    range: [0, 1],
    decimals: 2,
    getValue: fromForm("attackingStrength"),
  },
  {
    key: "defensiveStrength",
    label: "Defence rating",
    category: "strength",
    higherIsBetter: true,
    range: [0, 1],
    decimals: 2,
    getValue: fromForm("defensiveStrength"),
  },
  {
    key: "possessionStrength",
    label: "Possession rating",
    category: "strength",
    higherIsBetter: true,
    range: [0, 1],
    decimals: 2,
    getValue: fromForm("possessionStrength"),
  },
  {
    key: "xgForStrength",
    label: "XGF rating",
    category: "strength",
    higherIsBetter: true,
    range: [0, 1],
    decimals: 2,
    getValue: fromForm("xgForStrength"),
  },
  {
    key: "xgAgainstStrength",
    label: "XGA rating",
    category: "strength",
    higherIsBetter: true,
    range: [0, 1],
    decimals: 2,
    getValue: fromForm("xgAgainstStrength"),
  },
  {
    key: "directnessOverallStrength",
    label: "Directness",
    category: "strength",
    higherIsBetter: true,
    range: [0, 1],
    decimals: 2,
    getValue: fromForm("directnessOverallStrength"),
  },
  {
    key: "accuracyOverallStrength",
    label: "Precision",
    category: "strength",
    higherIsBetter: true,
    range: [0, 1],
    decimals: 2,
    getValue: fromForm("accuracyOverallStrength"),
  },
];

/** Preset fills — one tap selects a focused radar profile (still editable). */
export const RADAR_PRESETS = [
  {
    id: "attacking",
    label: "Attacking",
    keys: [
      "goals",
      "XG",
      "shots",
      "sot",
      "dangerousAttacks",
      "goalConversionRate",
    ],
  },
  {
    id: "defending",
    label: "Defending",
    keys: [
      "conceeded",
      "XGConceded",
      "shotsOnTargetAgainst",
      "cleansheetPercentage",
      "bigChancesConceded",
    ],
  },
  {
    id: "possession",
    label: "In possession",
    keys: [
      "possession",
      "accuratePassesPercentage",
      "accuratePassesOpponentHalf",
      "successfulDribbles",
      "PPAA",
    ],
  },
  {
    id: "outOfPossession",
    label: "Out of possession",
    keys: [
      "PPDA",
      "tackles",
      "interceptions",
      "ballRecovery",
      "duelsWonPercentage",
    ],
  },
  {
    id: "setPiecesForm",
    label: "Set pieces / form",
    keys: ["CornersAverage", "FreeKickGoals", "BttsPercentage", "ppg", "winPercentage"],
  },
  {
    id: "discipline",
    label: "Discipline",
    keys: [
      "FoulsPerGame",
      "foulsAgainst",
      "CardsPerGame",
      "RedCardsPerGame",
      "PenaltiesFor",
      "PenaltiesConceded",
    ],
  },
  {
    id: "strength",
    label: "Strength ratings",
    keys: [
      "attackingStrength",
      "defensiveStrength",
      "possessionStrength",
      "xgForStrength",
      "xgAgainstStrength",
      "directnessOverallStrength",
      "accuracyOverallStrength",
    ],
  },
];

export function getMetricByKey(key) {
  return CUSTOM_RADAR_METRICS.find((m) => m.key === key) || null;
}

export function normalizeRadarValue(value, metric) {
  if (value == null || !Number.isFinite(value) || !metric?.range) {
    return 0;
  }

  const [min, max] = metric.range;
  const span = max - min;
  if (!(span > 0)) return 0;

  let ratio = (value - min) / span;
  ratio = Math.max(0, Math.min(1, ratio));

  if (metric.higherIsBetter === false) {
    ratio = 1 - ratio;
  }

  return parseFloat(ratio.toFixed(3));
}

export function formatRadarRawValue(value, metric) {
  if (value == null || !Number.isFinite(value)) return "-";
  const decimals = metric?.decimals ?? 2;
  const formatted = Number(value).toFixed(decimals);
  return metric?.suffix ? `${formatted}${metric.suffix}` : formatted;
}

/**
 * A metric is available if at least one team has a numeric value.
 * Hidden when both teams lack data (e.g. SofaScore-only stats on form-only leagues).
 */
export function isMetricAvailable(metric, homeStats, awayStats, homeForm, awayForm) {
  if (!metric) return false;
  const home = metric.getValue(homeStats, homeForm);
  const away = metric.getValue(awayStats, awayForm);
  return home != null || away != null;
}

export function getAvailableMetrics(homeStats, awayStats, homeForm, awayForm) {
  return CUSTOM_RADAR_METRICS.filter((metric) =>
    isMetricAvailable(metric, homeStats, awayStats, homeForm, awayForm)
  );
}

export function getAvailableMetricsByCategory(
  homeStats,
  awayStats,
  homeForm,
  awayForm
) {
  const available = getAvailableMetrics(homeStats, awayStats, homeForm, awayForm);
  return RADAR_CATEGORIES.map((category) => ({
    ...category,
    metrics: available.filter((m) => m.category === category.id),
  })).filter((group) => group.metrics.length > 0);
}

/**
 * Apply a preset, intersecting with available keys and clamping to MAX.
 * Returns the selected key list (may be shorter than the preset if data is sparse).
 */
export function applyPresetKeys(presetKeys, availableKeys) {
  const availableSet = new Set(availableKeys);
  return presetKeys
    .filter((key) => availableSet.has(key))
    .slice(0, MAX_RADAR_METRICS);
}

/**
 * Toggle a metric key within min/max selection constraints.
 * Returns next selection array (unchanged if toggle would violate max).
 */
export function toggleMetricSelection(selectedKeys, key, availableKeys) {
  const availableSet = new Set(availableKeys);
  if (!availableSet.has(key)) return selectedKeys;

  if (selectedKeys.includes(key)) {
    return selectedKeys.filter((k) => k !== key);
  }

  if (selectedKeys.length >= MAX_RADAR_METRICS) {
    return selectedKeys;
  }

  return [...selectedKeys, key];
}

export function isCustomRadarUnlocked(isPaidUser, dayFixtureIndex) {
  if (isPaidUser) return true;
  return (
    typeof dayFixtureIndex === "number" &&
    dayFixtureIndex >= 0 &&
    dayFixtureIndex < FREE_CUSTOM_RADAR_FIXTURE_LIMIT
  );
}

/**
 * Build plot + raw series for selected metrics.
 */
export function buildRadarSeries(selectedKeys, homeStats, awayStats, homeForm, awayForm) {
  const metrics = selectedKeys
    .map((key) => getMetricByKey(key))
    .filter(Boolean);

  const labels = metrics.map((m) => m.label);
  const homeRaw = metrics.map((m) => m.getValue(homeStats, homeForm));
  const awayRaw = metrics.map((m) => m.getValue(awayStats, awayForm));
  const homeData = metrics.map((m, i) =>
    normalizeRadarValue(homeRaw[i] ?? 0, m)
  );
  const awayData = metrics.map((m, i) =>
    normalizeRadarValue(awayRaw[i] ?? 0, m)
  );
  const rawLabels = metrics.map((m, i) => ({
    home: formatRadarRawValue(homeRaw[i], m),
    away: formatRadarRawValue(awayRaw[i], m),
  }));

  return { metrics, labels, homeData, awayData, homeRaw, awayRaw, rawLabels };
}
