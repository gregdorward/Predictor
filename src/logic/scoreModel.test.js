import {
  CLEAR_OUTCOME_MARGIN,
  VENUE_FORM_WEIGHT,
  getClearOutcomeMargin,
  resetClearOutcomeMargin,
  applyScoreModelFromEnv,
} from "./scoreModelConfig";

describe("CLEAR_OUTCOME_MARGIN", () => {
  afterEach(() => {
    resetClearOutcomeMargin();
  });

  test("defaults to configured clear outcome margin", () => {
    expect(CLEAR_OUTCOME_MARGIN).toBe(20);
    expect(getClearOutcomeMargin()).toBe(20);
  });

  test("defaults venue form weight to 0.5", () => {
    expect(VENUE_FORM_WEIGHT).toBe(0.5);
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
