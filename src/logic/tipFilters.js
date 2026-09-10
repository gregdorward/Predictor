import { getMaxOutcomeEdge } from "./scoreModelConfig.js";

/** Default tip-filter thresholds (null = off). Shared by site UI and backtest. */
export function createDefaultTipFilters() {
  return {
    minimumXG: null,
    minimumGD: null,
    minimumGDHorA: null,
    minimumLast6: null,
    edge: null,
    O25edge: null,
    BTTSedge: null,
    oddsRange: [1.01, 10],
    over25Probability: null,
    bttsProbability: null,
    omitDraws: false,
    winProbability: null,
  };
}

export const GlobalFilters = createDefaultTipFilters();

export const FILTER_PRESET_NAMES = {
  high_btts: "BTTS picks",
  value_seekers: "High value picks",
  goals_galore: "Over 2.5 picks",
  stats_picks: "Form-based picks",
  "long-shots": "Medium to high odds win picks",
  underdogs: "Underdog picks",
  clear_favourites: "Clear favourites",
  ssh: "Soccer Stats Hub recommended",
};

export function resetTipFilters() {
  Object.assign(GlobalFilters, createDefaultTipFilters());
}

export function setTipFilters(overrides = {}) {
  resetTipFilters();
  applyTipFilterOverrides(GlobalFilters, overrides);
}

export function hasActiveTipFilters(filters = GlobalFilters) {
  const defaults = createDefaultTipFilters();
  return (
    filters.minimumXG != null ||
    filters.minimumGD != null ||
    filters.minimumGDHorA != null ||
    filters.minimumLast6 != null ||
    filters.edge != null ||
    filters.O25edge != null ||
    filters.BTTSedge != null ||
    filters.over25Probability != null ||
    filters.bttsProbability != null ||
    filters.winProbability != null ||
    filters.omitDraws === true ||
    filters.oddsRange[0] !== defaults.oddsRange[0] ||
    filters.oddsRange[1] !== defaults.oddsRange[1]
  );
}

export function applyTipFilterOverrides(target, overrides = {}) {
  if (!overrides || typeof overrides !== "object") return target;

  const numericKeys = [
    "minimumXG",
    "minimumGD",
    "minimumGDHorA",
    "minimumLast6",
    "edge",
    "O25edge",
    "BTTSedge",
    "over25Probability",
    "bttsProbability",
    "winProbability",
  ];

  for (const key of numericKeys) {
    if (overrides[key] === undefined) continue;
    target[key] = parseNullableNumber(overrides[key]);
  }

  if (overrides.omitDraws !== undefined) {
    target.omitDraws =
      overrides.omitDraws === true ||
      overrides.omitDraws === 1 ||
      overrides.omitDraws === "1" ||
      overrides.omitDraws === "true";
  }

  if (overrides.oddsRange !== undefined) {
    const range = Array.isArray(overrides.oddsRange)
      ? overrides.oddsRange
      : String(overrides.oddsRange)
          .split(",")
          .map((part) => Number(part.trim()));
    if (range.length === 2 && range.every((value) => Number.isFinite(value))) {
      target.oddsRange = range;
    }
  }

  return target;
}

function parseNullableNumber(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function applyFilterPreset(preset) {
  resetTipFilters();

  switch (preset) {
    case "high_btts":
      GlobalFilters.bttsProbability = 65;
      GlobalFilters.BTTSedge = 1;
      break;
    case "value_seekers":
      GlobalFilters.edge = 10;
      break;
    case "goals_galore":
      GlobalFilters.over25Probability = 65;
      GlobalFilters.O25edge = 1;
      break;
    case "stats_picks":
      GlobalFilters.minimumXG = 2;
      GlobalFilters.minimumGD = 5;
      GlobalFilters.minimumGDHorA = 10;
      GlobalFilters.minimumLast6 = 6;
      break;
    case "long-shots":
      GlobalFilters.oddsRange = [2, 10];
      GlobalFilters.omitDraws = true;
      break;
    case "underdogs":
      GlobalFilters.oddsRange = [3, 10];
      GlobalFilters.omitDraws = true;
      break;
    case "clear_favourites":
      GlobalFilters.winProbability = 80;
      break;
    case "ssh":
      GlobalFilters.minimumGDHorA = 5;
      GlobalFilters.minimumXG = 2;
      GlobalFilters.oddsRange = [1.2, 10];
      break;
    default:
      throw new Error(
        `Unknown filter preset "${preset}". Valid presets: ${Object.keys(FILTER_PRESET_NAMES).join(", ")}`
      );
  }

  return { ...GlobalFilters };
}

/** Model edge (pp) on the tipped 1X2 outcome vs bookmaker implied probability. */
export function getTipped1X2Edge(match, finalHomeGoals, finalAwayGoals) {
  if (finalHomeGoals === finalAwayGoals) {
    return Number(match.drawValue);
  }
  return Number(match.winValue);
}

/**
 * Flag fixtures whose tipped 1X2 edge exceeds the model cap (default 20%).
 * Keeps the game visible; ROI stats should exclude highEdgeFlag rows.
 */
export function applyHighEdgeFlag(
  match,
  { finalHomeGoals, finalAwayGoals, maxEdge = getMaxOutcomeEdge() }
) {
  match.highEdgeFlag = false;
  if (maxEdge == null) return;

  const edge = getTipped1X2Edge(match, finalHomeGoals, finalAwayGoals);
  if (Number.isFinite(edge) && edge > maxEdge) {
    match.highEdgeFlag = true;
  }
}

/**
 * Apply customise-tips filters to a match (sets match.omit when thresholds fail).
 * Mirrors the live site logic in calculateScore.
 */
export function applyTipFilters(
  match,
  {
    finalHomeGoals,
    finalAwayGoals,
    xgDiffHomePerspective,
    xgDiffAwayPerspective,
    last6PointDiffHomePerspective,
    last6PointDiffAwayPerspective,
    filters = GlobalFilters,
  }
) {
  if (!hasActiveTipFilters(filters)) {
    return;
  }

  switch (true) {
    case finalHomeGoals > finalAwayGoals:
      if (
        filters.minimumXG !== null &&
        xgDiffHomePerspective < filters.minimumXG
      ) {
        match.omit = true;
      }
      if (
        filters.minimumLast6 !== null &&
        last6PointDiffHomePerspective < filters.minimumLast6
      ) {
        match.omit = true;
      }
      if (filters.edge !== null && match.winValue < filters.edge) {
        match.omit = true;
      }
      if (filters.O25edge !== null && match.O25Value < filters.O25edge) {
        match.omit = true;
      }
      if (filters.BTTSedge !== null && match.BTTSValue < filters.BTTSedge) {
        match.omit = true;
      }
      if (
        filters.minimumGDHorA !== null &&
        match.goalDiffHomeOrAwayComparison < filters.minimumGDHorA
      ) {
        match.omit = true;
      }
      if (
        filters.minimumGD !== null &&
        match.goalDifferenceComparison < filters.minimumGD
      ) {
        match.omit = true;
      }
      if (
        filters.winProbability !== null &&
        match.homeWinProbability < filters.winProbability
      ) {
        match.omit = true;
      }
      if (
        filters.over25Probability !== null &&
        match.over25Probability < filters.over25Probability
      ) {
        match.omit = true;
      }
      if (
        filters.bttsProbability !== null &&
        match.bttsYesProbability < filters.bttsProbability
      ) {
        match.omit = true;
      }
      if (
        filters.oddsRange !== null &&
        (match.homeOdds < filters.oddsRange[0] ||
          match.homeOdds > filters.oddsRange[1])
      ) {
        match.omit = true;
      }
      break;
    case finalHomeGoals < finalAwayGoals:
      if (
        filters.minimumXG !== null &&
        xgDiffAwayPerspective < filters.minimumXG
      ) {
        match.omit = true;
      }
      if (
        filters.minimumLast6 !== null &&
        last6PointDiffAwayPerspective < filters.minimumLast6
      ) {
        match.omit = true;
      }
      if (
        filters.minimumGDHorA !== null &&
        Math.abs(match.goalDiffHomeOrAwayComparison) < filters.minimumGDHorA
      ) {
        match.omit = true;
      }
      if (filters.edge !== null && match.winValue < filters.edge) {
        match.omit = true;
      }
      if (filters.O25edge !== null && match.O25Value < filters.O25edge) {
        match.omit = true;
      }
      if (filters.BTTSedge !== null && match.BTTSValue < filters.BTTSedge) {
        match.omit = true;
      }
      if (
        filters.minimumGD !== null &&
        Math.abs(match.goalDifferenceComparison) < filters.minimumGD
      ) {
        match.omit = true;
      }
      if (
        filters.winProbability !== null &&
        match.awayWinProbability < filters.winProbability
      ) {
        match.omit = true;
      }
      if (
        filters.over25Probability !== null &&
        match.over25Probability < filters.over25Probability
      ) {
        match.omit = true;
      }
      if (
        filters.bttsProbability !== null &&
        match.bttsYesProbability < filters.bttsProbability
      ) {
        match.omit = true;
      }
      if (
        filters.oddsRange !== null &&
        (match.awayOdds < filters.oddsRange[0] ||
          match.awayOdds > filters.oddsRange[1])
      ) {
        match.omit = true;
      }
      break;
    case finalHomeGoals === finalAwayGoals:
      if (
        filters.minimumXG !== null &&
        Math.abs(xgDiffHomePerspective) < filters.minimumXG
      ) {
        match.omit = true;
      }
      if (
        filters.minimumLast6 !== null &&
        last6PointDiffHomePerspective < filters.minimumLast6
      ) {
        match.omit = true;
      }
      if (filters.edge !== null && match.drawValue < filters.edge) {
        match.omit = true;
      }
      if (filters.O25edge !== null && match.O25Value < filters.O25edge) {
        match.omit = true;
      }
      if (filters.BTTSedge !== null && match.BTTSValue < filters.BTTSedge) {
        match.omit = true;
      }
      if (
        filters.minimumGDHorA !== null &&
        Math.abs(match.goalDiffHomeOrAwayComparison) < filters.minimumGDHorA
      ) {
        match.omit = true;
      }
      if (
        filters.minimumGD !== null &&
        Math.abs(match.goalDifferenceComparison) < filters.minimumGD
      ) {
        match.omit = true;
      }
      if (filters.winProbability !== null) {
        match.omit = true;
      }
      if (
        filters.over25Probability !== null &&
        match.over25Probability < filters.over25Probability
      ) {
        match.omit = true;
      }
      if (
        filters.bttsProbability !== null &&
        match.bttsYesProbability < filters.bttsProbability
      ) {
        match.omit = true;
      }
      if (
        filters.oddsRange !== null &&
        (match.drawOdds < filters.oddsRange[0] ||
          match.drawOdds > filters.oddsRange[1])
      ) {
        match.omit = true;
      }
      if (filters.omitDraws === true) {
        match.omit = true;
      }
      break;
    default:
      break;
  }
}
