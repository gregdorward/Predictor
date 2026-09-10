import { readFileSync } from "fs";
import { resolve } from "path";

import {
  applyMaxOutcomeEdgeFromEnv,
  setMaxOutcomeEdge,
} from "../scoreModelConfig.js";
import {
  applyFilterPreset,
  applyTipFilterOverrides,
  createDefaultTipFilters,
  FILTER_PRESET_NAMES,
  GlobalFilters,
  hasActiveTipFilters,
  resetTipFilters,
} from "../tipFilters.js";

export function parseBacktestFilters(cliArgs = {}) {
  resetTipFilters();

  if (cliArgs.preset) {
    applyFilterPreset(cliArgs.preset);
  }

  if (cliArgs.filtersFile) {
    const filePath = resolve(cliArgs.filtersFile);
    const raw = JSON.parse(readFileSync(filePath, "utf8"));
    applyTipFilterOverrides(GlobalFilters, raw);
  }

  const inlineOverrides = { ...(cliArgs.filterOverrides || {}) };

  if (cliArgs.filterOddsMin != null || cliArgs.filterOddsMax != null) {
    inlineOverrides.oddsRange = [
      cliArgs.filterOddsMin ?? GlobalFilters.oddsRange[0],
      cliArgs.filterOddsMax ?? GlobalFilters.oddsRange[1],
    ];
  }

  if (cliArgs.filterOmitDraws === true) {
    inlineOverrides.omitDraws = true;
  }

  if (Object.keys(inlineOverrides).length > 0) {
    applyTipFilterOverrides(GlobalFilters, inlineOverrides);
  }

  if (cliArgs.filterOverrides?.maxEdge !== undefined) {
    setMaxOutcomeEdge(
      cliArgs.filterOverrides.maxEdge === 0
        ? null
        : cliArgs.filterOverrides.maxEdge
    );
  } else {
    applyMaxOutcomeEdgeFromEnv(process.env);
  }

  const active = hasActiveTipFilters(GlobalFilters);

  return {
    active,
    preset: cliArgs.preset ?? null,
    filters: { ...GlobalFilters },
    presetLabel: cliArgs.preset ? FILTER_PRESET_NAMES[cliArgs.preset] : null,
  };
}

export function formatActiveFilters(filters = GlobalFilters) {
  const defaults = createDefaultTipFilters();
  const parts = [];

  if (filters.minimumXG != null) parts.push(`minXG=${filters.minimumXG}`);
  if (filters.minimumGD != null) parts.push(`minGD=${filters.minimumGD}`);
  if (filters.minimumGDHorA != null) {
    parts.push(`minGDHorA=${filters.minimumGDHorA}`);
  }
  if (filters.minimumLast6 != null) parts.push(`minLast6=${filters.minimumLast6}`);
  if (filters.edge != null) parts.push(`edge=${filters.edge}`);
  if (filters.O25edge != null) parts.push(`o25Edge=${filters.O25edge}`);
  if (filters.BTTSedge != null) parts.push(`bttsEdge=${filters.BTTSedge}`);
  if (filters.winProbability != null) {
    parts.push(`winProb=${filters.winProbability}`);
  }
  if (filters.over25Probability != null) {
    parts.push(`over25Prob=${filters.over25Probability}`);
  }
  if (filters.bttsProbability != null) {
    parts.push(`bttsProb=${filters.bttsProbability}`);
  }
  if (filters.omitDraws) parts.push("omitDraws");
  if (
    filters.oddsRange[0] !== defaults.oddsRange[0] ||
    filters.oddsRange[1] !== defaults.oddsRange[1]
  ) {
    parts.push(`odds=${filters.oddsRange[0]}-${filters.oddsRange[1]}`);
  }

  return parts.length > 0 ? parts.join(", ") : "none";
}
