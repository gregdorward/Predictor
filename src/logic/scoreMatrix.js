/**
 * Score-grid builders for alternative goal distributions.
 *
 * Default family `poisson_indep`: independent Poisson on a 0–5 grid, then
 * temperature α=0.65. Other families (poisson+DC, negbin, bivariate, zip)
 * share the same λ inputs so backtests isolate the distribution.
 */

import {
  getScoreModelFamily,
  getScoreMatrixMaxGoals,
  getDixonColesRho,
  getScoreNbR,
  getScoreBivariateLambda3,
  getScoreZipPi,
  getScoreMatrixAlpha,
} from "./scoreModelConfig.js";

function factorial(n) {
  if (n === 0) return 1;
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

export function poissonProbability(k, lambda) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export function dixonColesAdjustment(home, away, lambdaHome, lambdaAway, rho = 0) {
  if (home === 0 && away === 0) return 1 - lambdaHome * lambdaAway * rho;
  if (home === 0 && away === 1) return 1 + lambdaHome * rho;
  if (home === 1 && away === 0) return 1 + lambdaAway * rho;
  if (home === 1 && away === 1) return 1 - rho;
  return 1;
}

/**
 * Independent Poisson × Dixon–Coles. Defaults match main production.
 */
export function buildScoreMatrix(
  lambdaHome,
  lambdaAway,
  maxGoals = 5,
  rho = 0.075
) {
  const scores = [];

  for (let home = 0; home <= maxGoals; home++) {
    for (let away = 0; away <= maxGoals; away++) {
      let prob =
        poissonProbability(home, lambdaHome) *
        poissonProbability(away, lambdaAway);

      prob *= dixonColesAdjustment(
        home,
        away,
        lambdaHome,
        lambdaAway,
        rho
      );

      scores.push({
        home,
        away,
        probability: Math.max(0, prob),
      });
    }
  }

  return scores;
}

/**
 * Negative binomial PMF with mean λ and dispersion r (higher r → Poisson).
 * Computed iteratively for numerical stability.
 */
export function negativeBinomialProbability(k, lambda, r) {
  const mean = Number(lambda);
  const dispersion = Number(r);
  if (!Number.isFinite(mean) || mean < 0 || !Number.isFinite(dispersion) || dispersion <= 0) {
    return 0;
  }
  if (k < 0 || !Number.isFinite(k)) return 0;

  const pSuccess = dispersion / (dispersion + mean);
  let prob = Math.pow(pSuccess, dispersion);
  for (let i = 0; i < k; i += 1) {
    prob *= ((i + dispersion) / (i + 1)) * (1 - pSuccess);
  }
  return prob;
}

export function buildNegativeBinomialScoreMatrix(
  lambdaHome,
  lambdaAway,
  maxGoals = 5,
  r = 12
) {
  const scores = [];
  for (let home = 0; home <= maxGoals; home++) {
    for (let away = 0; away <= maxGoals; away++) {
      scores.push({
        home,
        away,
        probability:
          negativeBinomialProbability(home, lambdaHome, r) *
          negativeBinomialProbability(away, lambdaAway, r),
      });
    }
  }
  return scores;
}

/**
 * Karlis–Ntzoufras bivariate Poisson: X = X'+Z, Y = Y'+Z with Z ~ Pois(λ3).
 * Marginal means remain λh / λa when λ1 = λh−λ3, λ2 = λa−λ3.
 */
export function bivariatePoissonProbability(
  home,
  away,
  lambdaHome,
  lambdaAway,
  lambda3
) {
  const lh = Number(lambdaHome);
  const la = Number(lambdaAway);
  let l3 = Number(lambda3);
  if (!Number.isFinite(lh) || !Number.isFinite(la) || !Number.isFinite(l3)) {
    return 0;
  }
  if (l3 < 0) l3 = 0;
  const maxShared = Math.min(lh, la) * 0.999;
  if (l3 > maxShared) l3 = Math.max(0, maxShared);

  const l1 = Math.max(0, lh - l3);
  const l2 = Math.max(0, la - l3);
  const minK = Math.min(home, away);
  let sum = 0;
  for (let k = 0; k <= minK; k += 1) {
    sum +=
      (Math.pow(l1, home - k) / factorial(home - k)) *
      (Math.pow(l2, away - k) / factorial(away - k)) *
      (Math.pow(l3, k) / factorial(k));
  }
  return Math.exp(-(l1 + l2 + l3)) * sum;
}

export function buildBivariatePoissonScoreMatrix(
  lambdaHome,
  lambdaAway,
  maxGoals = 5,
  lambda3 = 0.08
) {
  const scores = [];
  for (let home = 0; home <= maxGoals; home++) {
    for (let away = 0; away <= maxGoals; away++) {
      scores.push({
        home,
        away,
        probability: bivariatePoissonProbability(
          home,
          away,
          lambdaHome,
          lambdaAway,
          lambda3
        ),
      });
    }
  }
  return scores;
}

/** Zero-inflated Poisson PMF for one side. */
export function zipProbability(k, lambda, pi) {
  const mean = Number(lambda);
  let inflation = Number(pi);
  if (!Number.isFinite(mean) || mean < 0) return 0;
  if (!Number.isFinite(inflation)) inflation = 0;
  inflation = Math.min(1, Math.max(0, inflation));

  if (k === 0) {
    return inflation + (1 - inflation) * Math.exp(-mean);
  }
  return (1 - inflation) * poissonProbability(k, mean);
}

export function buildZeroInflatedPoissonScoreMatrix(
  lambdaHome,
  lambdaAway,
  maxGoals = 5,
  pi = 0.06
) {
  const scores = [];
  for (let home = 0; home <= maxGoals; home++) {
    for (let away = 0; away <= maxGoals; away++) {
      scores.push({
        home,
        away,
        probability:
          zipProbability(home, lambdaHome, pi) *
          zipProbability(away, lambdaAway, pi),
      });
    }
  }
  return scores;
}

export function getMostLikelyScore(scoreMatrix) {
  return scoreMatrix.reduce((best, current) =>
    current.probability > best.probability ? current : best
  );
}

export function clampLambda(lambda, min = 0.05, max = 5) {
  const n = Number(lambda);
  if (!Number.isFinite(n)) {
    return min;
  }
  return Math.max(min, Math.min(max, n));
}

export function normaliseScoreMatrix(scoreMatrix) {
  const total = scoreMatrix.reduce(
    (sum, s) => sum + (Number(s.probability) || 0),
    0
  );

  if (!Number.isFinite(total) || total <= 0) {
    const uniform = 1 / Math.max(scoreMatrix.length, 1);
    return scoreMatrix.map((s) => ({ ...s, probability: uniform }));
  }

  return scoreMatrix.map((s) => ({
    ...s,
    probability: s.probability / total,
  }));
}

/**
 * Temperature scaling: P_i^α then renormalise.
 * Default signature keeps α=1.1 for callers that omit it; config default is 0.65.
 */
export function calibrateScoreMatrix(matrix, alpha = 1.1) {
  const calibrated = matrix.map((score) => {
    const base = Number(score.probability);
    const raised =
      Number.isFinite(base) && base > 0 ? Math.pow(base, alpha) : 0;
    return { ...score, probability: raised };
  });

  const sum = calibrated.reduce((acc, s) => acc + s.probability, 0);
  if (!Number.isFinite(sum) || sum <= 0) {
    const uniform = 1 / Math.max(calibrated.length, 1);
    return calibrated.map((score) => ({ ...score, probability: uniform }));
  }

  return calibrated.map((score) => ({
    ...score,
    probability: score.probability / sum,
  }));
}

export function getOverUnderProbability(scoreMatrix, line = 2.5) {
  let over = 0;
  let under = 0;

  for (const { home, away, probability } of scoreMatrix) {
    if (home + away > line) over += probability;
    else under += probability;
  }
  over = over * 100;
  under = under * 100;

  return { over, under };
}

export function getBTTSProbability(scoreMatrix) {
  let yes = 0;
  let no = 0;

  for (const { home, away, probability } of scoreMatrix) {
    if (home > 0 && away > 0) yes += probability;
    else no += probability;
  }
  yes = yes * 100;
  no = no * 100;

  return { yes, no };
}

export function getMatchOddsProbabilities(scoreMatrix) {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (const { home, away, probability } of scoreMatrix) {
    if (home > away) homeWin += probability;
    else if (home === away) draw += probability;
    else awayWin += probability;
  }

  homeWin = homeWin * 100;
  draw = draw * 100;
  awayWin = awayWin * 100;

  return { homeWin, draw, awayWin };
}

function cellProbability(matrix, home, away) {
  const cell = matrix.find((s) => s.home === home && s.away === away);
  return Number(cell?.probability) || 0;
}

/**
 * Build a raw (unnormalised) score grid for the active or provided family.
 */
export function buildScoreMatrixForFamily(
  lambdaHome,
  lambdaAway,
  options = {}
) {
  const family = options.family ?? getScoreModelFamily();
  const maxGoals = options.maxGoals ?? getScoreMatrixMaxGoals();
  const lh = Number(lambdaHome);
  const la = Number(lambdaAway);

  switch (family) {
    case "negbin":
      return buildNegativeBinomialScoreMatrix(
        lh,
        la,
        maxGoals,
        options.r ?? getScoreNbR()
      );
    case "bivariate":
      return buildBivariatePoissonScoreMatrix(
        lh,
        la,
        maxGoals,
        options.lambda3 ?? getScoreBivariateLambda3()
      );
    case "zip":
      return buildZeroInflatedPoissonScoreMatrix(
        lh,
        la,
        maxGoals,
        options.pi ?? getScoreZipPi()
      );
    case "poisson_indep":
      return buildScoreMatrix(lh, la, maxGoals, 0);
    case "poisson":
    default:
      return buildScoreMatrix(
        lh,
        la,
        maxGoals,
        options.rho ?? getDixonColesRho()
      );
  }
}

/**
 * Full pipeline used by calculateScore: family grid → normalise → temperature.
 */
export function buildCalibratedScoreMatrixForFamily(
  lambdaHome,
  lambdaAway,
  options = {}
) {
  const raw = buildScoreMatrixForFamily(lambdaHome, lambdaAway, options);
  const normalised = normaliseScoreMatrix(raw);
  const alpha = options.alpha ?? getScoreMatrixAlpha();
  return calibrateScoreMatrix(normalised, alpha);
}

export { cellProbability };
