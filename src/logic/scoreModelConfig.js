/**
 * Min percentage-point gap before 1X2 overrides the Poisson mode scoreline.
 * Change this value to tune sensitivity — lower overrides more often, higher sticks to mode.
 */
export const CLEAR_OUTCOME_MARGIN = 22;

/**
 * How much team home/away form shapes lambda baselines and strength inputs
 * (0 = league home/away μ only, 1 = team venue form only).
 * Prefer 0 when league averageGoalsHome/Away already carry venue split.
 */
export const VENUE_FORM_WEIGHT = 0.2;

/**
 * XGRating → λ dampening. 0 disables the multiplier (current branch default;
 * the multiply was previously commented out). Typical values 0.02–0.025.
 */
export const SCORE_XG_DAMP = 0;

/** When 1, apply goal-efficiency mean-reversion to λ (tight clamp 0.9–1.1). */
export const SCORE_EFFICIENCY = 0;

/**
 * When 1, multiply λ by formTrendScore from compareFormTrend.
 * Locked on after Jul–Sep 2026 holdout (+2.3pp ROI vs off).
 */
export const SCORE_FORM_TREND = 1;

/** When 1, multiply λ by clinicalScore from getClinicalRating. */
export const SCORE_CLINICAL = 0;

/**
 * λ multiplier when rest is Short rest or Congested (1 = off).
 * Candidate: 0.95.
 */
export const SCORE_REST_HAIRCUT = 1;

/**
 * When 1, shave λ by SCORE_SOS_HAIRCUT_FACTOR if softScheduleFlag is set.
 */
export const SCORE_SOS_DAMP = 0;

/** Soft-schedule λ factor when SCORE_SOS_DAMP is on. */
export const SCORE_SOS_HAIRCUT_FACTOR = 0.97;

/**
 * Defence strength weight for Clean Sheet Percentage (0 = unused).
 * Taken from Average Goals Against when enabled (e.g. 0.05 → GA becomes 0.10).
 */
export const SCORE_CS_WEIGHT = 0;

/**
 * Linear recency boost for calculateBalancedRollingAverage.
 * Newest weight = 1 + boost, oldest = 1. Ignored when SCORE_ROLLING_XI > 0.
 */
export const SCORE_ROLLING_BOOST = 2.5;

/**
 * Exponential time decay ξ per day (Dixon–Coles style).
 * 0 = off (use linear SCORE_ROLLING_BOOST). Typical half-lives:
 * 0.995 ≈ 138d, 0.99 ≈ 69d, 0.98 ≈ 34d, 0.95 ≈ 14d.
 */
export const SCORE_ROLLING_XI = 0;

/**
 * Attack/defence weight for opponent-adjusted Weighted XG (0 = unused).
 * Taken from Average Expected Goals / Average XG Against so weights still sum.
 */
export const SCORE_WEIGHTED_XG = 0;

/**
 * Blend 0–1 applied to volume strength inputs (DA / shots / SOT / goals and against).
 * 0 = raw averages only; 1 = full opponent-PPG-weighted averages.
 */
export const SCORE_OPP_ADJ_METRICS = 0;

/**
 * Attack weight for Expected Points (xPts from npXG). Taken from Average Goals.
 * 0 = unused.
 */
export const SCORE_XPTS_WEIGHT = 0;

/**
 * Draw-band τ for SCORE_XPTS_MODE=band: |npXG_for − npXG_against| < τ → 1 pt.
 */
export const SCORE_XPTS_DRAW_BAND = 0.3;

/**
 * How to turn per-match xG into expected points: band | poisson.
 */
export const SCORE_XPTS_MODE = "band";

/**
 * How expected goals (λ) are built in generateGoals.
 * - legacy: μ × (attack/0.5)^m × (defenceWeakness/0.5)^m
 * - maher: μ × att_team × def_opponent from league-normalised xG/goals rates
 * - loglinear: log(μ) + weighted log-ratios of xG / SOT features (shrunk)
 * - xg_primary: blend of team npxG and opponent npxGA; mild finishing pull only
 * - additive: Maher ratings combined as μ·(att+def−1) instead of μ·att·def
 * - maher_gamma: Maher with one shared μ and a single home γ (not split H/A μ)
 * - maher_recent: Maher season ratings blended with last-5 ratings
 *
 * Locked to maher_recent (blend 0.5) after Jul–Sep 2026 holdout
 * (+1.41pp ROI and better accuracy/exact vs season-only Maher).
 */
export const SCORE_LAMBDA_ENGINE = "maher_recent";

/**
 * Weight on last-N Maher ratings when SCORE_LAMBDA_ENGINE=maher_recent.
 * 0 = season only; 1 = recent window only.
 * Locked at 0.5 after Jul–Sep 2026 sweep (best among 0.25/0.35/0.50).
 */
export const SCORE_MAHER_RECENT_BLEND = 0.5;

/**
 * Games in the recent Maher window when SCORE_LAMBDA_ENGINE=maher_recent.
 * Locked at 5 after Jul–Sep 2026 sweep (ROI +2.13% vs 8 ≈ tied, 10 worse).
 */
export const SCORE_MAHER_RECENT_GAMES = 5;

/**
 * Match rate used when fitting Maher attack/defence.
 * - xg: Footystats xG (goals fallback)
 * - npxg: non-penalty xG
 * - goals: raw goals
 * - mix: 0.7·npxG + 0.3·goals
 *
 * Locked to npxg after Jul–Sep 2026 holdout (+1.04pp ROI vs xg).
 */
export const SCORE_MAHER_RATE_SOURCE = "npxg";

/**
 * Opponent-adjusted Maher fixed-point iterations.
 * 0 = mean rates only. Locked at 0 after Jul–Sep 2026: iters 3/5
 * both lost ~4pp ROI vs mean-only.
 */
export const SCORE_MAHER_ITERS = 0;

/**
 * Extra pull toward last-1-game Maher ratings after season/recent blend.
 * 0 = off. Applied as final = (1−w)·current + w·last1.
 */
export const SCORE_MAHER_LAST_GAME_BLEND = 0;

/**
 * Post-fit Maher defence adjustment from clean-sheet %.
 * 0 = off. Higher CS than SCORE_MAHER_CS_BASELINE lowers def (harder to
 * score on); lower CS raises def. Scaled by sample size (full by 8 games)
 * and clamped. Start at 0.1 — sweep before locking.
 */
export const SCORE_MAHER_CS_BLEND = 0;

/**
 * League-typical clean-sheet rate (%) used as the Maher CS adjustment pivot.
 */
export const SCORE_MAHER_CS_BASELINE = 28;

/**
 * Blend weight of de-vigged bookie 1X2 into model outcome probabilities.
 * 0 = pure model; 1 = pure market. Does not change λ.
 * Locked at 0.25 after Jul–Sep 2026: Brier 0.627 vs 0.638, ROI still +1.09%.
 */
export const SCORE_ODDS_BLEND = 0.3;

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
 * Minimum decimal odds on the tipped 1X2 outcome. Tips shorter than this are
 * omitted (site + backtest ROI). null / 0 = off. Example: 1.5 skips heavy favourites.
 */
export const MIN_TIP_ODDS = 0;

/**
 * When true, replace average odds_ft_* with best prices from FootyStats
 * odds_comparison (match details / snapshot) on match day or later only.
 * Future fixtures keep league-list averages (comparison can be stale early).
 * Bookmaker labels are stored on the match for display. Falls back to
 * odds_ft_* when comparison is missing.
 */
export const USE_BEST_MATCH_ODDS = true;

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
let activeMinTipOdds = MIN_TIP_ODDS;
let activeUseBestMatchOdds = USE_BEST_MATCH_ODDS;
let activeScoreModelFamily = SCORE_MODEL_FAMILY;
let activeDixonColesRho = DIXON_COLES_RHO;
let activeScoreMatrixMaxGoals = SCORE_MATRIX_MAX_GOALS;
let activeScoreMatrixAlpha = SCORE_MATRIX_ALPHA;
let activeScoreNbR = SCORE_NB_R;
let activeScoreBivariateLambda3 = SCORE_BIVARIATE_LAMBDA3;
let activeScoreZipPi = SCORE_ZIP_PI;
let activeVenueFormWeight = VENUE_FORM_WEIGHT;
let activeScoreXgDamp = SCORE_XG_DAMP;
let activeScoreEfficiency = SCORE_EFFICIENCY;
let activeScoreFormTrend = SCORE_FORM_TREND;
let activeScoreClinical = SCORE_CLINICAL;
let activeScoreRestHaircut = SCORE_REST_HAIRCUT;
let activeScoreSosDamp = SCORE_SOS_DAMP;
let activeScoreCsWeight = SCORE_CS_WEIGHT;
let activeScoreRollingBoost = SCORE_ROLLING_BOOST;
let activeScoreRollingXi = SCORE_ROLLING_XI;
let activeScoreWeightedXg = SCORE_WEIGHTED_XG;
let activeScoreOppAdjMetrics = SCORE_OPP_ADJ_METRICS;
let activeScoreXptsWeight = SCORE_XPTS_WEIGHT;
let activeScoreXptsDrawBand = SCORE_XPTS_DRAW_BAND;
let activeScoreXptsMode = SCORE_XPTS_MODE;
let activeScoreLambdaEngine = SCORE_LAMBDA_ENGINE;
let activeScoreMaherRecentBlend = SCORE_MAHER_RECENT_BLEND;
let activeScoreMaherRecentGames = SCORE_MAHER_RECENT_GAMES;
let activeScoreMaherRateSource = SCORE_MAHER_RATE_SOURCE;
let activeScoreMaherIters = SCORE_MAHER_ITERS;
let activeScoreMaherLastGameBlend = SCORE_MAHER_LAST_GAME_BLEND;
let activeScoreMaherCsBlend = SCORE_MAHER_CS_BLEND;
let activeScoreOddsBlend = SCORE_ODDS_BLEND;

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

export function getMinTipOdds() {
  return activeMinTipOdds;
}

export function setMinTipOdds(value) {
  if (value === 0 || value === null || value === false || value === "") {
    activeMinTipOdds = null;
    return;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 1) {
    activeMinTipOdds = MIN_TIP_ODDS;
    return;
  }
  activeMinTipOdds = parsed;
}

export function resetMinTipOdds() {
  activeMinTipOdds = MIN_TIP_ODDS;
}

export function getUseBestMatchOdds() {
  return activeUseBestMatchOdds;
}

export function setUseBestMatchOdds(value) {
  if (value === true || value === 1 || value === "1" || value === "true") {
    activeUseBestMatchOdds = true;
    return;
  }
  if (value === false || value === 0 || value === "0" || value === "false") {
    activeUseBestMatchOdds = false;
    return;
  }
  activeUseBestMatchOdds = USE_BEST_MATCH_ODDS;
}

export function resetUseBestMatchOdds() {
  activeUseBestMatchOdds = USE_BEST_MATCH_ODDS;
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

export function getVenueFormWeight() {
  return activeVenueFormWeight;
}

export function setVenueFormWeight(value) {
  const parsed = Number(value);
  activeVenueFormWeight = Number.isFinite(parsed)
    ? Math.min(1, Math.max(0, parsed))
    : VENUE_FORM_WEIGHT;
}

export function getScoreXgDamp() {
  return activeScoreXgDamp;
}

export function setScoreXgDamp(value) {
  const parsed = Number(value);
  activeScoreXgDamp = Number.isFinite(parsed) ? Math.max(0, parsed) : SCORE_XG_DAMP;
}

export function getScoreEfficiency() {
  return activeScoreEfficiency;
}

export function setScoreEfficiency(value) {
  const parsed = Number(value);
  activeScoreEfficiency = Number.isFinite(parsed) && parsed > 0 ? 1 : 0;
}

export function getScoreFormTrend() {
  return activeScoreFormTrend;
}

export function setScoreFormTrend(value) {
  const parsed = Number(value);
  activeScoreFormTrend = Number.isFinite(parsed) && parsed > 0 ? 1 : 0;
}

export function getScoreClinical() {
  return activeScoreClinical;
}

export function setScoreClinical(value) {
  const parsed = Number(value);
  activeScoreClinical = Number.isFinite(parsed) && parsed > 0 ? 1 : 0;
}

export function getScoreRestHaircut() {
  return activeScoreRestHaircut;
}

export function setScoreRestHaircut(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    activeScoreRestHaircut = SCORE_REST_HAIRCUT;
    return;
  }
  activeScoreRestHaircut = Math.min(1.1, Math.max(0.85, parsed));
}

export function getScoreSosDamp() {
  return activeScoreSosDamp;
}

export function setScoreSosDamp(value) {
  const parsed = Number(value);
  activeScoreSosDamp = Number.isFinite(parsed) && parsed > 0 ? 1 : 0;
}

export function getScoreCsWeight() {
  return activeScoreCsWeight;
}

export function setScoreCsWeight(value) {
  const parsed = Number(value);
  activeScoreCsWeight = Number.isFinite(parsed)
    ? Math.min(0.2, Math.max(0, parsed))
    : SCORE_CS_WEIGHT;
}

export function getScoreRollingBoost() {
  return activeScoreRollingBoost;
}

export function setScoreRollingBoost(value) {
  const parsed = Number(value);
  activeScoreRollingBoost = Number.isFinite(parsed)
    ? Math.min(8, Math.max(0, parsed))
    : SCORE_ROLLING_BOOST;
}

export function getScoreRollingXi() {
  return activeScoreRollingXi;
}

export function setScoreRollingXi(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    activeScoreRollingXi = 0;
    return;
  }
  // ξ must be in (0, 1); values ≥1 disable decay.
  activeScoreRollingXi = parsed < 1 ? parsed : 0;
}

export function getScoreWeightedXg() {
  return activeScoreWeightedXg;
}

export function setScoreWeightedXg(value) {
  const parsed = Number(value);
  activeScoreWeightedXg = Number.isFinite(parsed)
    ? Math.min(0.4, Math.max(0, parsed))
    : SCORE_WEIGHTED_XG;
}

export function getScoreOppAdjMetrics() {
  return activeScoreOppAdjMetrics;
}

export function setScoreOppAdjMetrics(value) {
  const parsed = Number(value);
  activeScoreOppAdjMetrics = Number.isFinite(parsed)
    ? Math.min(1, Math.max(0, parsed))
    : SCORE_OPP_ADJ_METRICS;
}

export function getScoreXptsWeight() {
  return activeScoreXptsWeight;
}

export function setScoreXptsWeight(value) {
  const parsed = Number(value);
  activeScoreXptsWeight = Number.isFinite(parsed)
    ? Math.min(0.15, Math.max(0, parsed))
    : SCORE_XPTS_WEIGHT;
}

export function getScoreXptsDrawBand() {
  return activeScoreXptsDrawBand;
}

export function setScoreXptsDrawBand(value) {
  const parsed = Number(value);
  activeScoreXptsDrawBand = Number.isFinite(parsed)
    ? Math.min(1.5, Math.max(0.05, parsed))
    : SCORE_XPTS_DRAW_BAND;
}

export function getScoreXptsMode() {
  return activeScoreXptsMode;
}

export function setScoreXptsMode(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  activeScoreXptsMode = key === "poisson" ? "poisson" : "band";
}

export function getScoreLambdaEngine() {
  return activeScoreLambdaEngine;
}

export function setScoreLambdaEngine(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  if (
    key === "maher" ||
    key === "maher_gamma" ||
    key === "maher_recent" ||
    key === "loglinear" ||
    key === "xg_primary" ||
    key === "additive" ||
    key === "legacy"
  ) {
    activeScoreLambdaEngine = key;
    return;
  }
  activeScoreLambdaEngine = SCORE_LAMBDA_ENGINE;
}

export function getScoreMaherRecentBlend() {
  return activeScoreMaherRecentBlend;
}

export function setScoreMaherRecentBlend(value) {
  const parsed = Number(value);
  activeScoreMaherRecentBlend = Number.isFinite(parsed)
    ? Math.min(1, Math.max(0, parsed))
    : SCORE_MAHER_RECENT_BLEND;
}

export function getScoreMaherRecentGames() {
  return activeScoreMaherRecentGames;
}

export function setScoreMaherRecentGames(value) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 1) {
    activeScoreMaherRecentGames = Math.round(parsed);
    return;
  }
  activeScoreMaherRecentGames = SCORE_MAHER_RECENT_GAMES;
}

export function getScoreMaherRateSource() {
  return activeScoreMaherRateSource;
}

export function setScoreMaherRateSource(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  if (
    key === "xg" ||
    key === "npxg" ||
    key === "goals" ||
    key === "mix"
  ) {
    activeScoreMaherRateSource = key;
    return;
  }
  activeScoreMaherRateSource = SCORE_MAHER_RATE_SOURCE;
}

export function getScoreMaherIters() {
  return activeScoreMaherIters;
}

export function setScoreMaherIters(value) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) {
    activeScoreMaherIters = Math.min(20, Math.round(parsed));
    return;
  }
  activeScoreMaherIters = SCORE_MAHER_ITERS;
}

export function getScoreMaherLastGameBlend() {
  return activeScoreMaherLastGameBlend;
}

export function setScoreMaherLastGameBlend(value) {
  const parsed = Number(value);
  activeScoreMaherLastGameBlend = Number.isFinite(parsed)
    ? Math.min(1, Math.max(0, parsed))
    : SCORE_MAHER_LAST_GAME_BLEND;
}

export function getScoreMaherCsBlend() {
  return activeScoreMaherCsBlend;
}

export function setScoreMaherCsBlend(value) {
  const parsed = Number(value);
  activeScoreMaherCsBlend = Number.isFinite(parsed)
    ? Math.min(1, Math.max(0, parsed))
    : SCORE_MAHER_CS_BLEND;
}

export function getScoreOddsBlend() {
  return activeScoreOddsBlend;
}

export function setScoreOddsBlend(value) {
  const parsed = Number(value);
  activeScoreOddsBlend = Number.isFinite(parsed)
    ? Math.min(1, Math.max(0, parsed))
    : SCORE_ODDS_BLEND;
}

export function resetLambdaWeightConfig() {
  activeVenueFormWeight = VENUE_FORM_WEIGHT;
  activeScoreXgDamp = SCORE_XG_DAMP;
  activeScoreEfficiency = SCORE_EFFICIENCY;
  activeScoreFormTrend = SCORE_FORM_TREND;
  activeScoreClinical = SCORE_CLINICAL;
  activeScoreRestHaircut = SCORE_REST_HAIRCUT;
  activeScoreSosDamp = SCORE_SOS_DAMP;
  activeScoreCsWeight = SCORE_CS_WEIGHT;
  activeScoreRollingBoost = SCORE_ROLLING_BOOST;
  activeScoreRollingXi = SCORE_ROLLING_XI;
  activeScoreWeightedXg = SCORE_WEIGHTED_XG;
  activeScoreOppAdjMetrics = SCORE_OPP_ADJ_METRICS;
  activeScoreXptsWeight = SCORE_XPTS_WEIGHT;
  activeScoreXptsDrawBand = SCORE_XPTS_DRAW_BAND;
  activeScoreXptsMode = SCORE_XPTS_MODE;
  activeScoreLambdaEngine = SCORE_LAMBDA_ENGINE;
  activeScoreMaherRecentBlend = SCORE_MAHER_RECENT_BLEND;
  activeScoreMaherRecentGames = SCORE_MAHER_RECENT_GAMES;
  activeScoreMaherRateSource = SCORE_MAHER_RATE_SOURCE;
  activeScoreMaherIters = SCORE_MAHER_ITERS;
  activeScoreMaherLastGameBlend = SCORE_MAHER_LAST_GAME_BLEND;
  activeScoreMaherCsBlend = SCORE_MAHER_CS_BLEND;
  activeScoreOddsBlend = SCORE_ODDS_BLEND;
}

/** Clamp a λ multiplier so no single signal dominates. */
export function clampLambdaSignal(value, min = 0.9, max = 1.1) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(max, Math.max(min, n));
}

export function restHaircutMultiplier(form) {
  const factor = getScoreRestHaircut();
  if (factor >= 1) return 1;
  const rest = form?.contextMetrics?.rest;
  if (!rest) return 1;
  if (rest.restLabel === "Short rest" || rest.congestionLabel === "Congested") {
    return factor;
  }
  return 1;
}

export function sosDampMultiplier(form) {
  if (!getScoreSosDamp()) return 1;
  if (form?.contextMetrics?.strengthOfSchedule?.softScheduleFlag) {
    return SCORE_SOS_HAIRCUT_FACTOR;
  }
  return 1;
}

/**
 * Maher defence multiplier from clean-sheet % vs baseline.
 * High CS → factor &lt; 1 (lower def rating → lower goals conceded expectancy).
 */
export function maherCsDefMultiplier(csPercentage, gamesPlayed = 8) {
  const blend = getScoreMaherCsBlend();
  if (blend <= 0) return 1;
  const cs = Number(csPercentage);
  if (!Number.isFinite(cs)) return 1;
  const baseline = Number(SCORE_MAHER_CS_BASELINE);
  if (!(baseline > 0)) return 1;
  const games = Number(gamesPlayed);
  const reliability =
    Number.isFinite(games) && games > 0 ? Math.min(1, games / 8) : 0.5;
  const csRate = Math.min(100, Math.max(0, cs));
  const relative = csRate / baseline;
  const raw = 1 + blend * reliability * (1 - relative);
  return clampLambdaSignal(raw, 0.85, 1.15);
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

export function applyMinTipOddsFromEnv(env = process.env) {
  const raw = env.MIN_TIP_ODDS ?? env.NEXT_PUBLIC_MIN_TIP_ODDS;
  if (raw == null || raw === "") {
    setMinTipOdds(MIN_TIP_ODDS);
    return;
  }
  if (raw === "0" || raw === "false" || raw === "no") {
    setMinTipOdds(null);
    return;
  }
  setMinTipOdds(raw);
}

export function applyUseBestMatchOddsFromEnv(env = process.env) {
  const parsed =
    parseEnvBoolean(env, "USE_BEST_MATCH_ODDS") ??
    parseEnvBoolean(env, "NEXT_PUBLIC_USE_BEST_MATCH_ODDS");
  if (parsed === undefined) {
    setUseBestMatchOdds(USE_BEST_MATCH_ODDS);
    return;
  }
  setUseBestMatchOdds(parsed);
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

  parseEnvNumber(env, "VENUE_FORM_WEIGHT", (value) => {
    setVenueFormWeight(value);
  });
  parseEnvNumber(env, "SCORE_XG_DAMP", (value) => {
    setScoreXgDamp(value);
  });
  parseEnvNumber(env, "SCORE_EFFICIENCY", (value) => {
    setScoreEfficiency(value);
  });
  parseEnvNumber(env, "SCORE_FORM_TREND", (value) => {
    setScoreFormTrend(value);
  });
  parseEnvNumber(env, "SCORE_CLINICAL", (value) => {
    setScoreClinical(value);
  });
  parseEnvNumber(env, "SCORE_REST_HAIRCUT", (value) => {
    setScoreRestHaircut(value);
  });
  parseEnvNumber(env, "SCORE_SOS_DAMP", (value) => {
    setScoreSosDamp(value);
  });
  parseEnvNumber(env, "SCORE_CS_WEIGHT", (value) => {
    setScoreCsWeight(value);
  });
  parseEnvNumber(env, "SCORE_ROLLING_BOOST", (value) => {
    setScoreRollingBoost(value);
  });
  parseEnvNumber(env, "SCORE_ROLLING_XI", (value) => {
    setScoreRollingXi(value);
  });
  parseEnvNumber(env, "SCORE_WEIGHTED_XG", (value) => {
    setScoreWeightedXg(value);
  });
  parseEnvNumber(env, "SCORE_OPP_ADJ_METRICS", (value) => {
    setScoreOppAdjMetrics(value);
  });
  parseEnvNumber(env, "SCORE_XPTS_WEIGHT", (value) => {
    setScoreXptsWeight(value);
  });
  parseEnvNumber(env, "SCORE_XPTS_DRAW_BAND", (value) => {
    setScoreXptsDrawBand(value);
  });
  if (env.SCORE_XPTS_MODE != null && env.SCORE_XPTS_MODE !== "") {
    setScoreXptsMode(env.SCORE_XPTS_MODE);
  }
  if (env.SCORE_LAMBDA_ENGINE != null && env.SCORE_LAMBDA_ENGINE !== "") {
    setScoreLambdaEngine(env.SCORE_LAMBDA_ENGINE);
  }
  parseEnvNumber(env, "SCORE_MAHER_RECENT_BLEND", (value) => {
    setScoreMaherRecentBlend(value);
  });
  parseEnvNumber(env, "SCORE_MAHER_RECENT_GAMES", (value) => {
    setScoreMaherRecentGames(value);
  });
  if (env.SCORE_MAHER_RATE_SOURCE != null && env.SCORE_MAHER_RATE_SOURCE !== "") {
    setScoreMaherRateSource(env.SCORE_MAHER_RATE_SOURCE);
  }
  parseEnvNumber(env, "SCORE_MAHER_ITERS", (value) => {
    setScoreMaherIters(value);
  });
  parseEnvNumber(env, "SCORE_MAHER_LAST_GAME_BLEND", (value) => {
    setScoreMaherLastGameBlend(value);
  });
  parseEnvNumber(env, "SCORE_MAHER_CS_BLEND", (value) => {
    setScoreMaherCsBlend(value);
  });
  parseEnvNumber(env, "SCORE_ODDS_BLEND", (value) => {
    setScoreOddsBlend(value);
  });

  const snapshots =
    parseEnvBoolean(env, "USE_RESULT_SNAPSHOTS") ??
    parseEnvBoolean(env, "NEXT_PUBLIC_USE_RESULT_SNAPSHOTS");
  if (snapshots !== undefined) {
    activeUseResultSnapshots = snapshots;
  }

  applyMaxOutcomeEdgeFromEnv(env);
  applyMinTipOddsFromEnv(env);
  applyUseBestMatchOddsFromEnv(env);
}
