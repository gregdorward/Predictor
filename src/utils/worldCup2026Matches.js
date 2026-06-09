import staticMatchData from "../data/worldcup2026/match-predictions.json";

/** Knockout / group phase order for sorting and section headers. */
export const MATCH_PHASE_ORDER = [
  "group",
  "round32",
  "round16",
  "quarter",
  "semi",
  "final",
];

/** Human-readable labels for each phase id. */
export const MATCH_PHASE_LABELS = {
  group: "Group stage",
  round32: "Round of 32",
  round16: "Round of 16",
  quarter: "Quarter-finals",
  semi: "Semi-finals",
  final: "Final",
};

/**
 * Stable sort: date first, then phase order, then id.
 */
export function sortMatchesByDate(matches) {
  return [...matches].sort((a, b) => {
    const dateCmp = (a.date || "").localeCompare(b.date || "");
    if (dateCmp !== 0) return dateCmp;
    const phaseCmp =
      MATCH_PHASE_ORDER.indexOf(a.phase) - MATCH_PHASE_ORDER.indexOf(b.phase);
    if (phaseCmp !== 0) return phaseCmp;
    return (a.id || "").localeCompare(b.id || "");
  });
}

/**
 * Merge static JSON matches with additional entries (e.g. from API or PR updates).
 * Later matches override earlier ones when ids collide.
 */
export function mergeMatchPredictions(staticBundle, additionalMatches = []) {
  const map = new Map();
  (staticBundle?.matches || []).forEach((match) => {
    if (match.id) map.set(match.id, match);
  });
  additionalMatches.forEach((match) => {
    if (!match?.id) return;
    const existing = map.get(match.id) || {};
    map.set(match.id, { ...existing, ...match });
  });
  return sortMatchesByDate([...map.values()]);
}

/** Load matches from bundled static JSON (default for build / prerender). */
export function loadStaticMatchPredictions() {
  return mergeMatchPredictions(staticMatchData);
}

/**
 * Group matches by phase for sectioned UI (group stage, R32, etc.).
 */
export function groupMatchesByPhase(matches) {
  const grouped = {};
  matches.forEach((match) => {
    const phase = match.phase || "group";
    if (!grouped[phase]) grouped[phase] = [];
    grouped[phase].push(match);
  });
  return grouped;
}

/**
 * Optional future hook: fetch live WC fixtures from your API and map to match schema.
 * Returns [] until an endpoint is wired; merge result with static data in the page.
 */
export async function fetchWorldCupMatchUpdates(apiBaseUrl) {
  if (!apiBaseUrl) return [];
  try {
    const res = await fetch(`${apiBaseUrl}worldcup2026/matches`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.matches) ? data.matches : [];
  } catch {
    return [];
  }
}
