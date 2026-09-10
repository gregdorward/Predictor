import {
  computeGoalEfficiency,
  goalEfficiencyRegressionMultiplier,
} from "./goalEfficiency";

describe("computeGoalEfficiency", () => {
  test("uses aligned rolling goals and xG from the same fixture window", () => {
    expect(
      computeGoalEfficiency({
        teamGoalsRollingAverage: 1.5,
        teamXGAllRollingAverage: 1.2,
        avgScored: 2,
        XGOverall: 0.8,
      })
    ).toBeCloseTo(1.25);
  });

  test("falls back to season averages when rolling fields are missing", () => {
    expect(
      computeGoalEfficiency({
        avgScored: 1.2,
        XGOverall: 1.5,
      })
    ).toBeCloseTo(0.8);
  });

  test("returns neutral efficiency when xG is unavailable", () => {
    expect(computeGoalEfficiency({ avgScored: 1.4 })).toBe(1);
  });
});

describe("goalEfficiencyRegressionMultiplier", () => {
  test("nudges overperformers down and underperformers up within clamp", () => {
    expect(goalEfficiencyRegressionMultiplier(1.25)).toBe(0.85);
    expect(goalEfficiencyRegressionMultiplier(0.8)).toBe(1.15);
    expect(goalEfficiencyRegressionMultiplier(1)).toBe(1);
  });
});
