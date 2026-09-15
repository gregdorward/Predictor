import { xgPrimaryLambdas } from "./xgPrimaryLambda.js";

describe("xgPrimaryLambdas", () => {
  test("high home xG and open away defence raise home λ", () => {
    const λ = xgPrimaryLambdas({
      homeForm: {
        gamesPlayed: 12,
        npXGOverall: 2.1,
        XGOverall: 2.1,
        teamGoalsRollingAverage: 2.0,
        npXGAgainstAvgOverall: 1.0,
        XGAgainstAvgOverall: 1.0,
      },
      awayForm: {
        gamesPlayed: 12,
        npXGOverall: 1.0,
        XGOverall: 1.0,
        teamGoalsRollingAverage: 1.0,
        npXGAgainstAvgOverall: 1.9,
        XGAgainstAvgOverall: 1.9,
      },
      averageGoalsHome: 1.4,
      averageGoalsAway: 1.1,
      averageGoalsPerTeam: 1.25,
    });
    expect(λ.home).toBeGreaterThan(λ.away);
    expect(λ.home).toBeGreaterThan(1.5);
  });

  test("finishing hot streak does not explode λ beyond xG blend", () => {
    const cold = xgPrimaryLambdas({
      homeForm: {
        gamesPlayed: 12,
        npXGOverall: 1.5,
        XGOverall: 1.5,
        teamGoalsRollingAverage: 1.5,
        npXGAgainstAvgOverall: 1.2,
      },
      awayForm: {
        gamesPlayed: 12,
        npXGOverall: 1.2,
        npXGAgainstAvgOverall: 1.5,
        teamGoalsRollingAverage: 1.2,
      },
      averageGoalsHome: 1.4,
      averageGoalsAway: 1.1,
      averageGoalsPerTeam: 1.25,
    });
    const hot = xgPrimaryLambdas({
      homeForm: {
        gamesPlayed: 12,
        npXGOverall: 1.5,
        XGOverall: 1.5,
        teamGoalsRollingAverage: 3.0,
        npXGAgainstAvgOverall: 1.2,
      },
      awayForm: {
        gamesPlayed: 12,
        npXGOverall: 1.2,
        npXGAgainstAvgOverall: 1.5,
        teamGoalsRollingAverage: 1.2,
      },
      averageGoalsHome: 1.4,
      averageGoalsAway: 1.1,
      averageGoalsPerTeam: 1.25,
    });
    expect(hot.home).toBeGreaterThan(cold.home);
    expect(hot.home / cold.home).toBeLessThan(1.05);
  });
});
