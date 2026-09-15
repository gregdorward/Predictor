/**
 * Log-linear expected-goals engine.
 *
 * log(λ) = log(μ) + Σ wᵢ · shrink(log(rateᵢ / baselineᵢ))
 *
 * Features for the attacking side of a fixture:
 *   - team attack xG (npXG preferred)
 *   - opponent defence xGA (np preferred)
 *   - team shots on target
 *   - opponent SOT against
 *
 * Weights sum to 1. Log-ratios are clamped so one wild stat cannot explode λ.
 */

import { npxgOrXg } from "./nonPenaltyXg.js";

const DEFAULT_WEIGHTS = {
  attackXg: 0.45,
  oppDefenceXg: 0.35,
  attackSot: 0.12,
  oppSotAgainst: 0.08,
};

const LOG_CLAMP = 0.75;
const FULL_SAMPLE = 8;
const DEFAULT_SOT = 4.5;

function finitePositive(value, fallback) {
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) return n;
  return fallback;
}

function shrinkLogRatio(rate, baseline, games, fullSample = FULL_SAMPLE) {
  const r = finitePositive(rate, null);
  const b = finitePositive(baseline, null);
  if (r == null || b == null) return 0;
  let term = Math.log(r / b);
  if (!Number.isFinite(term)) return 0;
  term = Math.max(-LOG_CLAMP, Math.min(LOG_CLAMP, term));
  const n = Number(games);
  const w =
    Number.isFinite(n) && n > 0 ? Math.min(1, Math.max(0, n / fullSample)) : 0.5;
  return term * w;
}

function formAttackXg(form) {
  return npxgOrXg(form?.npXGOverall, form?.XGOverall ?? form?.ScoredAverage);
}

function formDefenceXg(form) {
  return npxgOrXg(
    form?.npXGAgainstAvgOverall,
    form?.XGAgainstAvgOverall ?? form?.avgConceeded ?? form?.ConcededAverage
  );
}

function formSotFor(form) {
  return finitePositive(
    form?.shotsOnTargetRollingAverage ??
      form?.AverageShotsOnTargetOverall ??
      form?.AverageShotsOnTarget,
    DEFAULT_SOT
  );
}

function formSotAgainst(form) {
  return finitePositive(
    form?.shotsOnTargetAgainstRollingAverage ??
      form?.AverageShotsOnTargetAgainstOverall ??
      form?.avSOTAgainstLast5,
    DEFAULT_SOT
  );
}

/**
 * @returns {{ home: number, away: number }}
 */
export function logLinearLambdas({
  homeForm,
  awayForm,
  averageGoalsHome,
  averageGoalsAway,
  averageGoalsPerTeam = 1.25,
  weights = DEFAULT_WEIGHTS,
}) {
  const muHome = finitePositive(averageGoalsHome, averageGoalsPerTeam);
  const muAway = finitePositive(averageGoalsAway, averageGoalsPerTeam);
  const mu = finitePositive(averageGoalsPerTeam, (muHome + muAway) / 2);
  const sotBase = DEFAULT_SOT;

  const wAtt = Number(weights.attackXg) || 0;
  const wDef = Number(weights.oppDefenceXg) || 0;
  const wSot = Number(weights.attackSot) || 0;
  const wSotA = Number(weights.oppSotAgainst) || 0;
  const wSum = wAtt + wDef + wSot + wSotA || 1;

  const homeGames = Number(homeForm?.gamesPlayed) || 0;
  const awayGames = Number(awayForm?.gamesPlayed) || 0;

  const homeLog =
    Math.log(muHome) +
    (wAtt / wSum) *
      shrinkLogRatio(formAttackXg(homeForm), mu, homeGames) +
    (wDef / wSum) *
      shrinkLogRatio(formDefenceXg(awayForm), mu, awayGames) +
    (wSot / wSum) *
      shrinkLogRatio(formSotFor(homeForm), sotBase, homeGames) +
    (wSotA / wSum) *
      shrinkLogRatio(formSotAgainst(awayForm), sotBase, awayGames);

  const awayLog =
    Math.log(muAway) +
    (wAtt / wSum) *
      shrinkLogRatio(formAttackXg(awayForm), mu, awayGames) +
    (wDef / wSum) *
      shrinkLogRatio(formDefenceXg(homeForm), mu, homeGames) +
    (wSot / wSum) *
      shrinkLogRatio(formSotFor(awayForm), sotBase, awayGames) +
    (wSotA / wSum) *
      shrinkLogRatio(formSotAgainst(homeForm), sotBase, homeGames);

  return {
    home: Math.max(0.05, Math.exp(homeLog)),
    away: Math.max(0.05, Math.exp(awayLog)),
  };
}

export { DEFAULT_WEIGHTS as LOG_LINEAR_WEIGHTS };
