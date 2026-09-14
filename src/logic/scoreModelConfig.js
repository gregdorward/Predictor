/**
 * Min percentage-point gap before 1X2 overrides the Poisson mode scoreline.
 * Change this value to tune sensitivity — lower overrides more often, higher sticks to mode.
 */
export const CLEAR_OUTCOME_MARGIN = 22;

/**
 * How much home/away form shapes lambda baselines and strength inputs (0 = league only, 1 = form only).
 */
export const VENUE_FORM_WEIGHT = 0.2;

/**
 * When true, settled fixtures use kickoff-frozen scorelines from predictedScores2.
 * When false, scorelines always follow the live model (backtest and site).
 */
export const USE_RESULT_SNAPSHOTS_DEFAULT = false;

/**
 * Default cap on tipped 1X2 value edge (%). Fixtures above this get a warning flag
 * and are excluded from ROI. Disable with MAX_OUTCOME_EDGE=0.
 */
export const MAX_OUTCOME_EDGE = 20;

/**
 * Score-distribution family.
 * Locked to independent Poisson (no Dixon–Coles) after holdout family sweeps.
 */
export const SCORE_MODEL_FAMILY = "poisson_indep";

/** Dixon–Coles ρ when SCORE_MODEL_FAMILY=poisson. */
export const DIXON_COLES_RHO = 0.075;

/** Truncate the score grid here, then renormalise. Main production uses 5. */
export const SCORE_MATRIX_MAX_GOALS = 5;

/**
 * Temperature scaling of the renormalised score matrix.
 * Locked at 0.65 after poisson_indep sweeps (best Brier on holdout).
 */
export const SCORE_MATRIX_ALPHA = 0.65;

/** Negative binomial dispersion r (higher → closer to Poisson). */
export const SCORE_NB_R = 12;

/** Bivariate Poisson shared intensity λ₃. */
export const SCORE_BIVARIATE_LAMBDA3 = 0.08;

/** Zero-inflated Poisson inflation π (probability of structural zero per side). */
export const SCORE_ZIP_PI = 0.06;

const VALID_SCORE_MODEL_FAMILIES = new Set([
  "poisson",
  "poisson_indep",
  "negbin",
  "bivariate",
  "zip",
]);

let activeMaxOutcomeEdge = MAX_OUTCOME_EDGE;
let activeScoreModelFamily = SCORE_MODEL_FAMILY;
let activeDixonColesRho = DIXON_COLES_RHO;
let activeScoreMatrixMaxGoals = SCORE_MATRIX_MAX_GOALS;
let activeScoreMatrixAlpha = SCORE_MATRIX_ALPHA;
let activeScoreNbR = SCORE_NB_R;
let activeScoreBivariateLambda3 = SCORE_BIVARIATE_LAMBDA3;
let activeScoreZipPi = SCORE_ZIP_PI;

export function getMaxOutcomeEdge() {
  return activeMaxOutcomeEdge;
}

export function setMaxOutcomeEdge(value) {
  if (value === 0 || value === null || value === false) {
    activeMaxOutcomeEdge = null;
    return;
  }
  const parsed = Number(value);
  activeMaxOutcomeEdge = Number.isFinite(parsed) ? parsed : MAX_OUTCOME_EDGE;
}

export function resetMaxOutcomeEdge() {
  activeMaxOutcomeEdge = MAX_OUTCOME_EDGE;
}

export function getScoreModelFamily() {
  return activeScoreModelFamily;
}

export function setScoreModelFamily(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  activeScoreModelFamily = VALID_SCORE_MODEL_FAMILIES.has(key)
    ? key
    : SCORE_MODEL_FAMILY;
}

export function getDixonColesRho() {
  return activeDixonColesRho;
}

export function getScoreMatrixMaxGoals() {
  return activeScoreMatrixMaxGoals;
}

export function getScoreMatrixAlpha() {
  return activeScoreMatrixAlpha;
}

export function getScoreNbR() {
  return activeScoreNbR;
}

export function getScoreBivariateLambda3() {
  return activeScoreBivariateLambda3;
}

export function getScoreZipPi() {
  return activeScoreZipPi;
}

export function resetScoreMatrixConfig() {
  activeScoreModelFamily = SCORE_MODEL_FAMILY;
  activeDixonColesRho = DIXON_COLES_RHO;
  activeScoreMatrixMaxGoals = SCORE_MATRIX_MAX_GOALS;
  activeScoreMatrixAlpha = SCORE_MATRIX_ALPHA;
  activeScoreNbR = SCORE_NB_R;
  activeScoreBivariateLambda3 = SCORE_BIVARIATE_LAMBDA3;
  activeScoreZipPi = SCORE_ZIP_PI;
}

/** Continental/international odds-comparison multiplier in generateGoals. */
export const CONTINENTAL_ODDS_COMPARISON_FACTOR = 0.1;

/** FootyStats competition IDs using the continental/international lambda path. */
export const CONTINENTAL_COMPETITION_IDS = new Set([
  17128, // Champions League
  17127, // Europa League
  17130, // Europa Conference League
  16556, // Copa Libertadores
  16494, // World Cup
]);

const CONTINENTAL_LEAGUE_NAMES = new Set([
  "Europe UEFA Champions League",
  "Europe UEFA Europa League",
  "Europe UEFA Europa Conference League",
  "South America Copa Libertadores",
  "International World Cup",
  // Catalog / SEO aliases (backtest, fixture pages)
  "Champions League",
  "Europa League",
  "Europa Conference League",
  "Copa Libertadores",
  "World Cup 2026",
]);

export function isContinentalOrInternationalMatch(match) {
  const id = Number(match?.leagueID ?? match?.competition_id);
  if (CONTINENTAL_COMPETITION_IDS.has(id)) return true;
  const desc = match?.leagueDesc || match?.leagueName;
  return Boolean(desc && CONTINENTAL_LEAGUE_NAMES.has(desc));
}

/** FootyStats no_home_away: 1 — neutral venue (symmetric goal baselines in generateGoals). */
export function isNeutralVenueMatch(match) {
  const flag = match?.noHomeAway ?? match?.no_home_away;
  return flag === 1 || flag === "1" || flag === true;
}

export function parseNoHomeAwayFromFixture(fixture) {
  const flag = fixture?.no_home_away ?? fixture?.noHomeAway;
  if (flag === 1 || flag === "1" || flag === true) return true;
  return false;
}

let activeClearOutcomeMargin = CLEAR_OUTCOME_MARGIN;
let activeUseResultSnapshots = USE_RESULT_SNAPSHOTS_DEFAULT;

export function getClearOutcomeMargin() {
  return activeClearOutcomeMargin;
}

/** Reset to the CLEAR_OUTCOME_MARGIN constant (called before backtests). */
export function resetClearOutcomeMargin() {
  activeClearOutcomeMargin = CLEAR_OUTCOME_MARGIN;
}

export function getUseResultSnapshots() {
  return activeUseResultSnapshots;
}

export function setUseResultSnapshots(enabled) {
  activeUseResultSnapshots = enabled === true;
}

export function resetUseResultSnapshots() {
  activeUseResultSnapshots = USE_RESULT_SNAPSHOTS_DEFAULT;
}

function parseEnvNumber(env, key, apply) {
  if (env[key] == null || env[key] === "") return;
  const value = Number(env[key]);
  if (Number.isFinite(value)) apply(value);
}

function parseEnvBoolean(env, key) {
  const raw = env[key];
  if (raw == null || raw === "") return undefined;
  if (raw === "1" || raw === "true" || raw === "yes") return true;
  if (raw === "0" || raw === "false" || raw === "no") return false;
  return undefined;
}

export function applyMaxOutcomeEdgeFromEnv(env = process.env) {
  const raw = env.MAX_OUTCOME_EDGE ?? env.NEXT_PUBLIC_MAX_OUTCOME_EDGE;
  if (raw === "0" || raw === "false" || raw === "no") {
    setMaxOutcomeEdge(null);
    return;
  }
  if (raw != null && raw !== "") {
    setMaxOutcomeEdge(raw);
    return;
  }
  setMaxOutcomeEdge(MAX_OUTCOME_EDGE);
}

/** Optional env overrides for backtest sweeps and runtime config. */
export function applyScoreModelFromEnv(env = process.env) {
  parseEnvNumber(env, "SCORE_MODEL_MARGIN", (value) => {
    activeClearOutcomeMargin = value;
  });

  if (env.SCORE_MODEL_FAMILY != null && env.SCORE_MODEL_FAMILY !== "") {
    setScoreModelFamily(env.SCORE_MODEL_FAMILY);
  }

  parseEnvNumber(env, "DIXON_COLES_RHO", (value) => {
    activeDixonColesRho = value;
  });
  parseEnvNumber(env, "SCORE_MATRIX_MAX_GOALS", (value) => {
    activeScoreMatrixMaxGoals = Math.max(3, Math.round(value));
  });
  parseEnvNumber(env, "SCORE_MATRIX_ALPHA", (value) => {
    activeScoreMatrixAlpha = value;
  });
  parseEnvNumber(env, "SCORE_NB_R", (value) => {
    activeScoreNbR = Math.max(0.1, value);
  });
  parseEnvNumber(env, "SCORE_BIVARIATE_LAMBDA3", (value) => {
    activeScoreBivariateLambda3 = Math.max(0, value);
  });
  parseEnvNumber(env, "SCORE_ZIP_PI", (value) => {
    activeScoreZipPi = Math.min(1, Math.max(0, value));
  });

  const snapshots =
    parseEnvBoolean(env, "USE_RESULT_SNAPSHOTS") ??
    parseEnvBoolean(env, "NEXT_PUBLIC_USE_RESULT_SNAPSHOTS");
  if (snapshots !== undefined) {
    activeUseResultSnapshots = snapshots;
  }

  applyMaxOutcomeEdgeFromEnv(env);
}
