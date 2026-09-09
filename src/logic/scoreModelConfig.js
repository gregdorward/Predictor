/**
 * Min percentage-point gap before 1X2 overrides the Poisson mode scoreline.
 * Change this value to tune sensitivity — lower overrides more often, higher sticks to mode.
 */
export const CLEAR_OUTCOME_MARGIN = 20;

/**
 * How much home/away form shapes lambda baselines and strength inputs (0 = league only, 1 = form only).
 */
export const VENUE_FORM_WEIGHT = 0.25;

let activeClearOutcomeMargin = CLEAR_OUTCOME_MARGIN;

export function getClearOutcomeMargin() {
  return activeClearOutcomeMargin;
}

/** Reset to the CLEAR_OUTCOME_MARGIN constant (called before backtests). */
export function resetClearOutcomeMargin() {
  activeClearOutcomeMargin = CLEAR_OUTCOME_MARGIN;
}

function parseEnvNumber(env, key, apply) {
  if (env[key] == null || env[key] === "") return;
  const value = Number(env[key]);
  if (Number.isFinite(value)) apply(value);
}

/** Optional env override for backtest sweeps (SCORE_MODEL_MARGIN). */
export function applyScoreModelFromEnv(env = process.env) {
  parseEnvNumber(env, "SCORE_MODEL_MARGIN", (value) => {
    activeClearOutcomeMargin = value;
  });
}
