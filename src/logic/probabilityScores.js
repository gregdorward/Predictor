/**
 * Proper scoring rules for 1X2 probability vectors.
 * Kept separate from odds/devig helpers so the experiment branch stays lean.
 */

const LOG_LOSS_FLOOR = 1e-15;

function oneHot1X2(outcome) {
  return {
    homeWin: [1, 0, 0],
    draw: [0, 1, 0],
    awayWin: [0, 0, 1],
  }[outcome];
}

function toUnitInterval(percent) {
  const n = Number(percent);
  if (!Number.isFinite(n)) return null;
  return n > 1.0000001 ? n / 100 : n;
}

/**
 * Multi-class Brier score for a 1X2 probability vector (percent or 0–1).
 * Lower is better.
 */
export function brierScore1X2(homePct, drawPct, awayPct, outcome) {
  const truth = oneHot1X2(outcome);
  const probs = [homePct, drawPct, awayPct].map(toUnitInterval);
  if (!truth || probs.some((p) => p == null || p < 0)) return null;
  let sum = 0;
  for (let i = 0; i < 3; i += 1) {
    const diff = probs[i] - truth[i];
    sum += diff * diff;
  }
  return sum;
}

/** Log loss for the realised 1X2 outcome. Lower is better. */
export function logLoss1X2(homePct, drawPct, awayPct, outcome) {
  const truth = oneHot1X2(outcome);
  const probs = [homePct, drawPct, awayPct].map(toUnitInterval);
  if (!truth || probs.some((p) => p == null || p < 0)) return null;
  const realised = probs[truth.indexOf(1)];
  const clipped = Math.min(
    1 - LOG_LOSS_FLOOR,
    Math.max(LOG_LOSS_FLOOR, realised)
  );
  return -Math.log(clipped);
}

export function meanScore(values) {
  const nums = (values || []).filter((v) => Number.isFinite(v));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
