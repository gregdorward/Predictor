import { resetTipFilters } from "./tipFilters";
import {
  CLEAR_OUTCOME_MARGIN,
  CONTINENTAL_ODDS_COMPARISON_FACTOR,
  MAX_OUTCOME_EDGE,
  VENUE_FORM_WEIGHT,
  SCORE_XG_DAMP,
  SCORE_EFFICIENCY,
  SCORE_CS_WEIGHT,
  SCORE_FORM_TREND,
  SCORE_ROLLING_BOOST,
  SCORE_ROLLING_XI,
  SCORE_WEIGHTED_XG,
  SCORE_OPP_ADJ_METRICS,
  SCORE_XPTS_WEIGHT,
  SCORE_XPTS_DRAW_BAND,
  SCORE_XPTS_MODE,
  SCORE_LAMBDA_ENGINE,
  SCORE_MAHER_RECENT_BLEND,
  SCORE_MAHER_RECENT_GAMES,
  SCORE_ODDS_BLEND,
  SCORE_MAHER_RATE_SOURCE,
  SCORE_MAHER_ITERS,
  SCORE_MAHER_LAST_GAME_BLEND,
  SCORE_MAHER_CS_BLEND,
  SCORE_MAHER_CS_BASELINE,
  applyMaxOutcomeEdgeFromEnv,
  getClearOutcomeMargin,
  getMaxOutcomeEdge,
  getUseResultSnapshots,
  getScoreModelFamily,
  getVenueFormWeight,
  getScoreXgDamp,
  getScoreEfficiency,
  getScoreFormTrend,
  getScoreClinical,
  getScoreRestHaircut,
  getScoreSosDamp,
  getScoreCsWeight,
  getScoreRollingBoost,
  getScoreRollingXi,
  getScoreWeightedXg,
  getScoreOppAdjMetrics,
  getScoreXptsWeight,
  getScoreXptsDrawBand,
  getScoreXptsMode,
  getScoreLambdaEngine,
  getScoreMaherRecentBlend,
  getScoreMaherRecentGames,
  getScoreOddsBlend,
  getScoreMaherRateSource,
  getScoreMaherIters,
  getScoreMaherLastGameBlend,
  getScoreMaherCsBlend,
  clampLambdaSignal,
  restHaircutMultiplier,
  sosDampMultiplier,
  maherCsDefMultiplier,
  isNeutralVenueMatch,
  parseNoHomeAwayFromFixture,
  resetClearOutcomeMargin,
  resetMaxOutcomeEdge,
  resetUseResultSnapshots,
  resetScoreMatrixConfig,
  resetLambdaWeightConfig,
  applyScoreModelFromEnv,
} from "./scoreModelConfig";

describe("CLEAR_OUTCOME_MARGIN", () => {
  afterEach(() => {
    resetClearOutcomeMargin();
    resetScoreMatrixConfig();
    resetLambdaWeightConfig();
  });

  test("defaults to configured clear outcome margin", () => {
    expect(getClearOutcomeMargin()).toBe(CLEAR_OUTCOME_MARGIN);
  });

  test("defaults venue form weight constant", () => {
    expect(VENUE_FORM_WEIGHT).toBe(0.2);
    expect(getVenueFormWeight()).toBe(0.2);
  });

  test("applyScoreModelFromEnv reads SCORE_MODEL_MARGIN", () => {
    applyScoreModelFromEnv({ SCORE_MODEL_MARGIN: "20" });
    expect(getClearOutcomeMargin()).toBe(20);
  });

  test("resetClearOutcomeMargin restores the code default", () => {
    applyScoreModelFromEnv({ SCORE_MODEL_MARGIN: "20" });
    resetClearOutcomeMargin();
    expect(getClearOutcomeMargin()).toBe(CLEAR_OUTCOME_MARGIN);
  });
});

describe("lambda weight knobs", () => {
  afterEach(() => {
    resetLambdaWeightConfig();
  });

  test("defaults enable form trend; other lambda signals stay off", () => {
    expect(SCORE_XG_DAMP).toBe(0);
    expect(getScoreXgDamp()).toBe(0);
    expect(SCORE_EFFICIENCY).toBe(0);
    expect(getScoreEfficiency()).toBe(0);
    expect(SCORE_CS_WEIGHT).toBe(0);
    expect(getScoreCsWeight()).toBe(0);
    expect(SCORE_FORM_TREND).toBe(1);
    expect(getScoreFormTrend()).toBe(1);
    expect(getScoreClinical()).toBe(0);
    expect(getScoreRestHaircut()).toBe(1);
    expect(getScoreSosDamp()).toBe(0);
    expect(SCORE_ROLLING_BOOST).toBe(2.5);
    expect(getScoreRollingBoost()).toBe(2.5);
    expect(SCORE_ROLLING_XI).toBe(0);
    expect(getScoreRollingXi()).toBe(0);
    expect(SCORE_WEIGHTED_XG).toBe(0);
    expect(getScoreWeightedXg()).toBe(0);
    expect(SCORE_OPP_ADJ_METRICS).toBe(0);
    expect(getScoreOppAdjMetrics()).toBe(0);
    expect(SCORE_XPTS_WEIGHT).toBe(0);
    expect(getScoreXptsWeight()).toBe(0);
    expect(SCORE_XPTS_DRAW_BAND).toBe(0.3);
    expect(getScoreXptsDrawBand()).toBe(0.3);
    expect(SCORE_XPTS_MODE).toBe("band");
    expect(getScoreXptsMode()).toBe("band");
    expect(SCORE_LAMBDA_ENGINE).toBe("maher_recent");
    expect(getScoreLambdaEngine()).toBe("maher_recent");
    expect(SCORE_MAHER_RECENT_BLEND).toBe(0.5);
    expect(getScoreMaherRecentBlend()).toBe(0.5);
    expect(SCORE_MAHER_RECENT_GAMES).toBe(5);
    expect(getScoreMaherRecentGames()).toBe(5);
    expect(SCORE_MAHER_RATE_SOURCE).toBe("npxg");
    expect(getScoreMaherRateSource()).toBe("npxg");
    expect(SCORE_MAHER_ITERS).toBe(0);
    expect(getScoreMaherIters()).toBe(0);
    expect(SCORE_MAHER_LAST_GAME_BLEND).toBe(0);
    expect(getScoreMaherLastGameBlend()).toBe(0);
    expect(SCORE_MAHER_CS_BLEND).toBe(0);
    expect(getScoreMaherCsBlend()).toBe(0);
    expect(SCORE_MAHER_CS_BASELINE).toBe(28);
    expect(SCORE_ODDS_BLEND).toBe(0.3);
    expect(getScoreOddsBlend()).toBe(0.3);
  });

  test("applyScoreModelFromEnv reads rolling / weighted-xg overrides", () => {
    applyScoreModelFromEnv({
      SCORE_ROLLING_BOOST: "1",
      SCORE_ROLLING_XI: "0.99",
      SCORE_WEIGHTED_XG: "0.25",
    });
    expect(getScoreRollingBoost()).toBe(1);
    expect(getScoreRollingXi()).toBe(0.99);
    expect(getScoreWeightedXg()).toBe(0.25);
  });

  test("applyScoreModelFromEnv reads opp-adj and xPts overrides", () => {
    applyScoreModelFromEnv({
      SCORE_OPP_ADJ_METRICS: "0.5",
      SCORE_XPTS_WEIGHT: "0.1",
      SCORE_XPTS_DRAW_BAND: "0.4",
      SCORE_XPTS_MODE: "poisson",
    });
    expect(getScoreOppAdjMetrics()).toBe(0.5);
    expect(getScoreXptsWeight()).toBe(0.1);
    expect(getScoreXptsDrawBand()).toBe(0.4);
    expect(getScoreXptsMode()).toBe("poisson");
  });

  test("applyScoreModelFromEnv reads SCORE_LAMBDA_ENGINE", () => {
    applyScoreModelFromEnv({ SCORE_LAMBDA_ENGINE: "maher_recent" });
    expect(getScoreLambdaEngine()).toBe("maher_recent");
    applyScoreModelFromEnv({ SCORE_MAHER_RECENT_BLEND: "0.5" });
    expect(getScoreMaherRecentBlend()).toBe(0.5);
    applyScoreModelFromEnv({ SCORE_LAMBDA_ENGINE: "maher" });
    expect(getScoreLambdaEngine()).toBe("maher");
    applyScoreModelFromEnv({ SCORE_LAMBDA_ENGINE: "nope" });
    expect(getScoreLambdaEngine()).toBe("maher_recent");
  });

  test("applyScoreModelFromEnv reads SCORE_ODDS_BLEND", () => {
    applyScoreModelFromEnv({ SCORE_ODDS_BLEND: "0.25" });
    expect(getScoreOddsBlend()).toBe(0.25);
  });

  test("applyScoreModelFromEnv reads SCORE_MAHER_RATE_SOURCE", () => {
    applyScoreModelFromEnv({ SCORE_MAHER_RATE_SOURCE: "npxg" });
    expect(getScoreMaherRateSource()).toBe("npxg");
    applyScoreModelFromEnv({ SCORE_MAHER_RATE_SOURCE: "goals" });
    expect(getScoreMaherRateSource()).toBe("goals");
    applyScoreModelFromEnv({ SCORE_MAHER_RATE_SOURCE: "mix" });
    expect(getScoreMaherRateSource()).toBe("mix");
    applyScoreModelFromEnv({ SCORE_MAHER_RATE_SOURCE: "nope" });
    expect(getScoreMaherRateSource()).toBe("npxg");
  });

  test("applyScoreModelFromEnv reads SCORE_MAHER_RECENT_GAMES", () => {
    applyScoreModelFromEnv({ SCORE_MAHER_RECENT_GAMES: "8" });
    expect(getScoreMaherRecentGames()).toBe(8);
    applyScoreModelFromEnv({ SCORE_MAHER_RECENT_GAMES: "0" });
    expect(getScoreMaherRecentGames()).toBe(5);
  });

  test("applyScoreModelFromEnv reads SCORE_MAHER_ITERS", () => {
    applyScoreModelFromEnv({ SCORE_MAHER_ITERS: "5" });
    expect(getScoreMaherIters()).toBe(5);
  });

  test("applyScoreModelFromEnv reads SCORE_MAHER_LAST_GAME_BLEND", () => {
    applyScoreModelFromEnv({ SCORE_MAHER_LAST_GAME_BLEND: "0.15" });
    expect(getScoreMaherLastGameBlend()).toBe(0.15);
  });

  test("applyScoreModelFromEnv reads SCORE_MAHER_CS_BLEND", () => {
    applyScoreModelFromEnv({ SCORE_MAHER_CS_BLEND: "0.25" });
    expect(getScoreMaherCsBlend()).toBe(0.25);
  });

  test("SCORE_ROLLING_XI >= 1 disables decay", () => {
    applyScoreModelFromEnv({ SCORE_ROLLING_XI: "1" });
    expect(getScoreRollingXi()).toBe(0);
  });

  test("applyScoreModelFromEnv reads lambda weight overrides", () => {
    applyScoreModelFromEnv({
      VENUE_FORM_WEIGHT: "0",
      SCORE_XG_DAMP: "0.02",
      SCORE_EFFICIENCY: "1",
      SCORE_FORM_TREND: "1",
      SCORE_CLINICAL: "1",
      SCORE_REST_HAIRCUT: "0.95",
      SCORE_SOS_DAMP: "1",
      SCORE_CS_WEIGHT: "0.05",
    });
    expect(getVenueFormWeight()).toBe(0);
    expect(getScoreXgDamp()).toBe(0.02);
    expect(getScoreEfficiency()).toBe(1);
    expect(getScoreFormTrend()).toBe(1);
    expect(getScoreClinical()).toBe(1);
    expect(getScoreRestHaircut()).toBe(0.95);
    expect(getScoreSosDamp()).toBe(1);
    expect(getScoreCsWeight()).toBe(0.05);
  });

  test("clampLambdaSignal bounds multipliers", () => {
    expect(clampLambdaSignal(1.5)).toBe(1.1);
    expect(clampLambdaSignal(0.5)).toBe(0.9);
    expect(clampLambdaSignal(1.02)).toBe(1.02);
    expect(clampLambdaSignal(null)).toBe(1);
  });

  test("restHaircutMultiplier only fires on short rest or congested", () => {
    applyScoreModelFromEnv({ SCORE_REST_HAIRCUT: "0.95" });
    expect(
      restHaircutMultiplier({
        contextMetrics: { rest: { restLabel: "Short rest" } },
      })
    ).toBe(0.95);
    expect(
      restHaircutMultiplier({
        contextMetrics: { rest: { congestionLabel: "Congested" } },
      })
    ).toBe(0.95);
    expect(
      restHaircutMultiplier({
        contextMetrics: { rest: { restLabel: "Fresh" } },
      })
    ).toBe(1);
  });

  test("sosDampMultiplier only fires on soft schedule flag", () => {
    applyScoreModelFromEnv({ SCORE_SOS_DAMP: "1" });
    expect(
      sosDampMultiplier({
        contextMetrics: { strengthOfSchedule: { softScheduleFlag: true } },
      })
    ).toBe(0.97);
    expect(
      sosDampMultiplier({
        contextMetrics: { strengthOfSchedule: { softScheduleFlag: false } },
      })
    ).toBe(1);
  });

  test("maherCsDefMultiplier lowers def factor when CS is high", () => {
    applyScoreModelFromEnv({ SCORE_MAHER_CS_BLEND: "0.2" });
    expect(maherCsDefMultiplier(75, 8)).toBeLessThan(1);
    expect(maherCsDefMultiplier(10, 8)).toBeGreaterThan(1);
    expect(maherCsDefMultiplier(28, 8)).toBe(1);
    applyScoreModelFromEnv({ SCORE_MAHER_CS_BLEND: "0" });
    expect(maherCsDefMultiplier(75, 8)).toBe(1);
  });
});

describe("MAX_OUTCOME_EDGE", () => {
  afterEach(() => {
    resetMaxOutcomeEdge();
  });

  test("defaults to 20pp cap when env unset", () => {
    applyMaxOutcomeEdgeFromEnv({});
    expect(getMaxOutcomeEdge()).toBe(MAX_OUTCOME_EDGE);
  });

  test("MAX_OUTCOME_EDGE=0 disables the cap", () => {
    applyMaxOutcomeEdgeFromEnv({ MAX_OUTCOME_EDGE: "0" });
    expect(getMaxOutcomeEdge()).toBeNull();
  });
});

describe("neutral venue (no_home_away)", () => {
  test("isNeutralVenueMatch reads match.noHomeAway", () => {
    expect(isNeutralVenueMatch({ noHomeAway: true })).toBe(true);
    expect(isNeutralVenueMatch({ no_home_away: 1 })).toBe(true);
    expect(isNeutralVenueMatch({ noHomeAway: false })).toBe(false);
  });

  test("parseNoHomeAwayFromFixture reads FootyStats field", () => {
    expect(parseNoHomeAwayFromFixture({ no_home_away: 1 })).toBe(true);
    expect(parseNoHomeAwayFromFixture({ no_home_away: 0 })).toBe(false);
  });
});

describe("continental odds comparison factor", () => {
  test("defaults to 0.1", () => {
    expect(CONTINENTAL_ODDS_COMPARISON_FACTOR).toBe(0.1);
  });
});

describe("USE_RESULT_SNAPSHOTS", () => {
  afterEach(() => {
    resetUseResultSnapshots();
    resetTipFilters();
  });

  test("defaults to off", () => {
    expect(getUseResultSnapshots()).toBe(false);
  });

  test("applyScoreModelFromEnv reads USE_RESULT_SNAPSHOTS", () => {
    applyScoreModelFromEnv({ USE_RESULT_SNAPSHOTS: "1" });
    expect(getUseResultSnapshots()).toBe(true);
    resetUseResultSnapshots();
    applyScoreModelFromEnv({ USE_RESULT_SNAPSHOTS: "false" });
    expect(getUseResultSnapshots()).toBe(false);
  });
});

describe("SCORE_MODEL_FAMILY", () => {
  afterEach(() => {
    resetScoreMatrixConfig();
  });

  test("defaults to poisson_indep", () => {
    expect(getScoreModelFamily()).toBe("poisson_indep");
  });

  test("applyScoreModelFromEnv reads SCORE_MODEL_FAMILY", () => {
    applyScoreModelFromEnv({ SCORE_MODEL_FAMILY: "zip" });
    expect(getScoreModelFamily()).toBe("zip");
  });

  test("invalid family falls back to poisson_indep", () => {
    applyScoreModelFromEnv({ SCORE_MODEL_FAMILY: "not-a-model" });
    expect(getScoreModelFamily()).toBe("poisson_indep");
  });
});
