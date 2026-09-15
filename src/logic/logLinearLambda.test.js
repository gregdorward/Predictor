import { logLinearLambdas } from "./logLinearLambda.js";

describe("logLinearLambdas", () => {
  test("strong home attack vs weak away defence raises home λ", () => {
    const λ = logLinearLambdas({
      homeForm: {
        gamesPlayed: 12,
        npXGOverall: 2.0,
        XGOverall: 2.0,
        shotsOnTargetRollingAverage: 6,
        AverageShotsOnTargetAgainstOverall: 3.5,
        npXGAgainstAvgOverall: 0.9,
        XGAgainstAvgOverall: 0.9,
      },
      awayForm: {
        gamesPlayed: 12,
        npXGOverall: 0.9,
        XGOverall: 0.9,
        shotsOnTargetRollingAverage: 3,
        AverageShotsOnTargetAgainstOverall: 6,
        npXGAgainstAvgOverall: 1.8,
        XGAgainstAvgOverall: 1.8,
      },
      averageGoalsHome: 1.4,
      averageGoalsAway: 1.1,
      averageGoalsPerTeam: 1.25,
    });
    expect(λ.home).toBeGreaterThan(λ.away);
    expect(λ.home).toBeGreaterThan(1.4);
  });

  test("missing stats fall back near venue μ", () => {
    const λ = logLinearLambdas({
      homeForm: { gamesPlayed: 0 },
      awayForm: { gamesPlayed: 0 },
      averageGoalsHome: 1.5,
      averageGoalsAway: 1.2,
      averageGoalsPerTeam: 1.35,
    });
    expect(λ.home).toBeCloseTo(1.5, 1);
    expect(λ.away).toBeCloseTo(1.2, 1);
  });
});
