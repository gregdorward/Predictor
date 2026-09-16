import { loadBacktestEnv } from "../src/logic/backtest/loadEnv.js";
import { fetchGlobalBacktestData, loadDayData } from "../src/logic/backtest/loadDayData.js";
import { metricsWithNpXg } from "../src/logic/nonPenaltyXg.js";
import { expandRadarStrength } from "../src/utils/radarDisplay.js";
import {
  getScoreCsWeight,
  getScoreWeightedXg,
  applyScoreModelFromEnv,
} from "../src/logic/scoreModelConfig.js";

loadBacktestEnv();
applyScoreModelFromEnv();

const api = process.env.NEXT_PUBLIC_EXPRESS_SERVER || "http://localhost:5050/";
const isoDate = process.argv[2] || "2026-09-14";
const matchId = Number(process.argv[3] || 8570382);

const DOMESTIC_DEFENCE_RANGES = {
  overall: {
    "Average XG Against": { min: 1.03, max: 1.92 },
    "Weighted XG Against": { min: 1.03, max: 1.92 },
    "Average Goals Against": { min: 0.95, max: 1.91 },
    "Average SOT Against": { min: 3.39, max: 5.71 },
    "Average Dangerous Attacks Against": { min: 31.8, max: 68.83 },
    "Clean Sheet Percentage": { min: 11.72, max: 44.53 },
  },
};

function parseStrengthMetricValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Mirror of getStats.calculateDefensiveStrength (production radar path). */
function calculateDefensiveStrength(stats, last5 = false) {
  const csWeight = getScoreCsWeight();
  const goalsAgainstWeight = Math.max(0, 0.15 - csWeight);
  const wxgAgainstWeight = getScoreWeightedXg();
  const rawXgaWeight = Math.max(0, 0.5 - wxgAgainstWeight);
  const weights = {
    "Average XG Against": rawXgaWeight,
    "Weighted XG Against": wxgAgainstWeight,
    "Average Goals Against": goalsAgainstWeight,
    "Average SOT Against": 0.25,
    "Average Dangerous Attacks Against": 0.1,
    "Clean Sheet Percentage": csWeight,
  };
  const ranges = last5
    ? DOMESTIC_DEFENCE_RANGES.last5
    : DOMESTIC_DEFENCE_RANGES.overall;

  let weightedSum = 0;
  const breakdown = [];
  for (const metric of Object.keys(weights)) {
    const w = weights[metric];
    if (!(w > 0) || !ranges[metric] || !Object.prototype.hasOwnProperty.call(stats, metric)) {
      continue;
    }
    const metricValue = parseStrengthMetricValue(stats[metric]);
    if (metricValue === null) continue;
    const normalizedValueRaw =
      (metricValue - ranges[metric].min) /
      (ranges[metric].max - ranges[metric].min);
    const normalizedValueClamped = Math.max(0, Math.min(1, normalizedValueRaw));
    const reversedScore = 1 - normalizedValueClamped;
    weightedSum += reversedScore * w;
    breakdown.push({
      metric,
      value: metricValue,
      weight: w,
      range: ranges[metric],
      normClamped: Number(normalizedValueClamped.toFixed(3)),
      reversedScore: Number(reversedScore.toFixed(3)),
      contribution: Number((reversedScore * w).toFixed(3)),
      saturatesHigh:
        normalizedValueRaw > 1
          ? "at floor (worse than range max)"
          : normalizedValueRaw < 0
            ? "at ceiling (better than range min)"
            : null,
    });
  }
  const score = Math.max(0, Math.min(1, weightedSum));
  return {
    score: parseFloat(score.toFixed(2)),
    weights,
    breakdown,
  };
}

function buildDefenceMetrics(form) {
  return metricsWithNpXg(
    { ...(form.defensiveMetrics || {}) },
    {
      "Average XG Against": [
        form.npXGAgainstAvgOverall,
        form.XGAgainstAvgOverall,
      ],
      "Weighted XG Against": [
        form.teamNpXGConceededAllRollingAverage,
        form.teamXGConceededAllRollingAverage ?? form.XGAgainstAvgOverall,
      ],
    }
  );
}

await fetchGlobalBacktestData(api);
const day = await loadDayData(new Date(`${isoDate}T12:00:00`), api);
const fixtureForm = day.allForm.find((row) => row.id === matchId);
if (!fixtureForm) throw new Error(`no form for ${matchId} on ${isoDate}`);

const awayForm = fixtureForm.away?.[2] ?? fixtureForm.away;
const homeForm = fixtureForm.home?.[2] ?? fixtureForm.home;

function analyze(form, label) {
  const metrics = buildDefenceMetrics(form);
  const { score, weights, breakdown } = calculateDefensiveStrength(metrics);
  return {
    label,
    team: form.teamName,
    games: form.gamesPlayed,
    XGAgainstAvgOverall: form.XGAgainstAvgOverall,
    npXGAgainst: form.npXGAgainstAvgOverall,
    conceded: form.ConcededAverageOverall,
    cleanSheetPct:
      form.CleanSheetPercentage ??
      form.defensiveMetrics?.["Clean Sheet Percentage"],
    sotAgainst: form.defensiveMetrics?.["Average SOT Against"],
    daAgainst: form.defensiveMetrics?.["Average Dangerous Attacks Against"],
    metricsAfterNp: metrics,
    calculatedRaw: score,
    radarDisplayed: expandRadarStrength(score),
    expandExplains:
      "radar = clamp(0.5 + (raw-0.5)*factor); factor soft default 1.15",
    weights,
    breakdown,
  };
}

console.log(
  JSON.stringify(
    {
      matchId,
      isoDate,
      betis: analyze(awayForm, "away"),
      villarreal: analyze(homeForm, "home"),
    },
    null,
    2
  )
);
