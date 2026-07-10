export const ATTACK_METRIC_DEFINITIONS = [
  { key: "scored", label: "Goals" },
  { key: "XG", label: "xG" },
  { key: "shots", label: "Shots" },
  { key: "sot", label: "Shots on target" },
  { key: "dangerousAttacks", label: "Dangerous attacks" },
  { key: "corners", label: "Corners" },
];

export const DEFENCE_METRIC_DEFINITIONS = [
  { key: "conceeded", label: "Goals against", lowerIsBetter: true },
  { key: "XGAgainst", label: "xG against", lowerIsBetter: true },
  { key: "shotsAgainst", label: "Shots against", lowerIsBetter: true },
  { key: "sotAgainst", label: "SOT against", lowerIsBetter: true },
  {
    key: "dangerousAttacksAgainst",
    label: "Dangerous attacks against",
    lowerIsBetter: true,
  },
  { key: "cornersAgainst", label: "Corners against", lowerIsBetter: true },
];

function formatGameLabel(result, index) {
  if (result?.date) {
    return String(result.date).split(",")[0].trim();
  }

  return `G${index + 1}`;
}

function toMetricNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildMetricTimeSeries(results = []) {
  const sorted = [...results].sort((a, b) => a.dateRaw - b.dateRaw);

  return sorted.map((result, index) => ({
    label: formatGameLabel(result, index),
    scored: toMetricNumber(result.scored),
    XG: toMetricNumber(result.XG),
    shots: toMetricNumber(result.shots),
    sot: toMetricNumber(result.sot),
    dangerousAttacks: toMetricNumber(result.dangerousAttacks),
    corners: toMetricNumber(result.corners),
    conceeded: toMetricNumber(result.conceeded),
    XGAgainst: toMetricNumber(result.XGAgainst),
    shotsAgainst: toMetricNumber(result.shotsAgainst),
    sotAgainst: toMetricNumber(result.sotAgainst),
    dangerousAttacksAgainst: toMetricNumber(result.dangerousAttacksAgainst),
    cornersAgainst: toMetricNumber(result.cornersAgainst),
  }));
}
