import { resetTipFilters } from "./tipFilters";
import {
  CLEAR_OUTCOME_MARGIN,
  CONTINENTAL_ODDS_COMPARISON_FACTOR,
  MAX_OUTCOME_EDGE,
  VENUE_FORM_WEIGHT,
  applyMaxOutcomeEdgeFromEnv,
  getClearOutcomeMargin,
  getMaxOutcomeEdge,
  getUseResultSnapshots,
  isNeutralVenueMatch,
  parseNoHomeAwayFromFixture,
  resetClearOutcomeMargin,
  resetMaxOutcomeEdge,
  resetUseResultSnapshots,
  applyScoreModelFromEnv,
} from "./scoreModelConfig";

describe("CLEAR_OUTCOME_MARGIN", () => {
  afterEach(() => {
    resetClearOutcomeMargin();
  });

  test("defaults to configured clear outcome margin", () => {
    expect(getClearOutcomeMargin()).toBe(CLEAR_OUTCOME_MARGIN);
  });

  test("defaults venue form weight constant", () => {
    expect(VENUE_FORM_WEIGHT).toBe(0.2);
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
