import {
  bumpPredictionRunEpoch,
  getPredictionRunEpoch,
  isCurrentPredictionRun,
} from "./predictionRunEpoch";

describe("predictionRunEpoch", () => {
  test("isCurrentPredictionRun is true until a newer run bumps the epoch", () => {
    const runAtStart = bumpPredictionRunEpoch();
    expect(isCurrentPredictionRun(runAtStart)).toBe(true);

    bumpPredictionRunEpoch();
    expect(isCurrentPredictionRun(runAtStart)).toBe(false);
    expect(getPredictionRunEpoch()).toBe(runAtStart + 1);
  });
});
