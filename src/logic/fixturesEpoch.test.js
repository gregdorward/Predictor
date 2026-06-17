import {
  bumpFixturesEpoch,
  getFixturesEpoch,
  shouldApplyPredictionFixtures,
} from "./fixturesEpoch";

describe("fixturesEpoch", () => {
  test("shouldApplyPredictionFixtures is true until a reload bumps the epoch", () => {
    const epochAtStart = getFixturesEpoch();
    expect(shouldApplyPredictionFixtures(epochAtStart)).toBe(true);

    bumpFixturesEpoch();
    expect(shouldApplyPredictionFixtures(epochAtStart)).toBe(false);
  });
});
