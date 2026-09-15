/**
 * Opponent-PPG weighting and xG→expected-points helpers for past-results form.
 */

import { poissonProbability } from "./scoreMatrix.js";

/**
 * Opponent-adjusted average of a parallel series.
 * Attack/volume (invert=false): value × (oppPPG / baseline) — credit more vs strong sides.
 * Against (invert=true): value × (baseline / oppPPG) — punish concessions vs weak sides more.
 *
 * @param {number[]} values
 * @param {number[]} oppositionPPG
 * @param {number|null} [leagueAvgPPG]
 * @param {{ invert?: boolean }} [options]
 */
export function calculateOpponentWeightedAverage(
  values,
  oppositionPPG,
  leagueAvgPPG = null,
  { invert = false } = {}
) {
  if (
    !Array.isArray(values) ||
    !Array.isArray(oppositionPPG) ||
    values.length === 0 ||
    values.length !== oppositionPPG.length
  ) {
    return 0;
  }

  const finiteOpp = oppositionPPG
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0);
  const seriesMean =
    finiteOpp.length > 0
      ? finiteOpp.reduce((a, b) => a + b, 0) / finiteOpp.length
      : null;
  const baseline =
    Number.isFinite(Number(leagueAvgPPG)) && Number(leagueAvgPPG) > 0
      ? Number(leagueAvgPPG)
      : seriesMean && seriesMean > 0
        ? seriesMean
        : 1.5;

  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < values.length; i++) {
    const value = Number(values[i]);
    const oppPPG = Number(oppositionPPG[i]);
    if (!Number.isFinite(value)) continue;
    let difficultyMultiplier = 1;
    if (Number.isFinite(oppPPG) && oppPPG > 0) {
      difficultyMultiplier = invert ? baseline / oppPPG : oppPPG / baseline;
    }
    weightedSum += value * difficultyMultiplier;
    totalWeight += difficultyMultiplier;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/** Blend raw and opponent-adjusted averages: (1−w)·raw + w·adj. */
export function blendRawAndOppAdj(raw, adj, weight) {
  const w = Number(weight);
  if (!Number.isFinite(w) || w <= 0) return raw;
  const a = Number(adj);
  if (!Number.isFinite(a)) return raw;
  const r = Number(raw);
  if (!Number.isFinite(r)) return a;
  const clamped = Math.min(1, Math.max(0, w));
  return (1 - clamped) * r + clamped * a;
}

/**
 * Expected points from a single match xG pair.
 * - band: |Δ| < drawBand → 1, else 3/0
 * - poisson: independent Poisson xPts on 0..maxGoals grid
 */
export function expectedPointsFromXg(
  xgFor,
  xgAgainst,
  { mode = "band", drawBand = 0.3, maxGoals = 6 } = {}
) {
  const λf = Number(xgFor);
  const λa = Number(xgAgainst);
  if (!Number.isFinite(λf) || !Number.isFinite(λa)) return 0;

  if (mode === "poisson") {
    const cap = Math.max(3, Math.min(10, Math.round(Number(maxGoals) || 6)));
    let pWin = 0;
    let pDraw = 0;
    let mass = 0;
    for (let h = 0; h <= cap; h++) {
      for (let a = 0; a <= cap; a++) {
        const p = poissonProbability(h, Math.max(0, λf)) * poissonProbability(a, Math.max(0, λa));
        mass += p;
        if (h > a) pWin += p;
        else if (h === a) pDraw += p;
      }
    }
    if (mass <= 0) return 0;
    return (3 * pWin + pDraw) / mass;
  }

  const band = Number(drawBand);
  const τ = Number.isFinite(band) && band > 0 ? band : 0.3;
  const delta = λf - λa;
  if (Math.abs(delta) < τ) return 1;
  return delta > 0 ? 3 : 0;
}

/**
 * Per-game xPts from result rows with npXG/XG fields (newest-first or any order).
 * Prefers npXG when present.
 */
export function xPtsSeriesFromResults(results, options = {}) {
  if (!Array.isArray(results)) return [];
  return results.map((res) => {
    const xgFor = Number.isFinite(Number(res?.npXG))
      ? Number(res.npXG)
      : Number(res?.XG);
    const xgAgainst = Number.isFinite(Number(res?.npXGAgainst))
      ? Number(res.npXGAgainst)
      : Number(res?.XGAgainst);
    return expectedPointsFromXg(xgFor, xgAgainst, options);
  });
}

export function averageFinite(values) {
  const nums = (values || [])
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
