import {
  compareStat,
  getPointsFromLastX,
  getOverOrUnderAchievingResult,
  getClinicalRating,
  getPointsDifferential,
  getPointWeighting,
  compareFormTrend,
  getPointAverage,
  compareTeams,
} from "./getScorePredictions";

const homePositionHomeOnly = 3;
const awayPositionAwayOnly = 10;
const homePosition = 5;
const awayPosition = 9;

const homeForm = {
  AverageShotsOnTarget: 5,
  AverageShotsOnTargetOverall: 4.5,
  CleanSheetPercentage: 40,
  dangerousAttackConversion: 0.1,
  goalsPerDangerousAttack: 0.075,
  ScoredAverage: 1.4,
  ConcededAverage: 1.1,
  AverageDangerousAttacks: 55,
  AverageDangerousAttacksOverall: 50,
  XGWeighting: 1.2,
  formTrendScore: 9,
  last10Points: 18,
  twoGameAverage: 2.5,
  fiveGameAverage: 2,
  sixGameAverage: 2.2,
  tenGameAverage: 2.25,
  SeasonPPG: 1.98,
  AttackingPotency: 3,
  AveragePossession: 52.1,
  AveragePossessionOverall: 51.8,
};

const awayForm = {
    AverageShotsOnTarget: 4.5,
    AverageShotsOnTargetOverall: 4,
    CleanSheetPercentage: 30,
    dangerousAttackConversion: 0.12,
    goalsPerDangerousAttack: 0.088,
    ScoredAverage: 1.1,
    ConcededAverage: 1.3,
    AverageDangerousAttacks: 48,
    AverageDangerousAttacksOverall: 49,
    XGWeighting: 0.7,
    formTrendScore: 6.5,
    last10Points: 14,
    twoGameAverage: 2,
    fiveGameAverage: 1.7,
    sixGameAverage: 1.8,
    tenGameAverage: 1.96,
    SeasonPPG: 1.6,
    AttackingPotency: 3.5,
    AveragePossession: 47.1,
    AveragePossessionOverall: 45.8,
  };

const match = {
    homeTeamWinPercentage: 55,
    awayTeamWinPercentage: 25,
}

describe("compare stat tests", () => {
  test("a positve number is returned when the home team has the greater number", async () => {
    expect(await compareStat(5, 2)).toBe(1);
  });

  test("a negative number is returned when the away team has the greater number", async () => {
    expect(await compareStat(2, 5)).toBe(-1);
  });

  test("a neutral number is returned when both teams have the same number", async () => {
    expect(await compareStat(2, 2)).toBe(0);
  });

  test("a neutral number is returned when each team have an almost idential number", async () => {
    expect(await compareStat(10, 10.1)).toBe(0);
  });
});

describe("get points from lastX tests", () => {
  test("the correct amount of points are allocated for wins", async () => {
    expect(getPointsFromLastX(["W", "W", "W"])).toBe(9);
  });

  test("the correct amount of points are allocated for draws", async () => {
    expect(getPointsFromLastX(["D", "D", "D"])).toBe(3);
  });

  test("the correct amount of points are allocated for losses", async () => {
    expect(getPointsFromLastX(["L", "L", "L"])).toBe(0);
  });

  test("the correct amount of points are allocated for mixed results", async () => {
    expect(getPointsFromLastX(["W", "L", "D", "W", "L", "D", "D", "D"])).toBe(
      10
    );
  });
});

describe("over or under achieving tests", () => {
  test("a team is correctly deemed to be overachieving drastically", async () => {
    expect(await getOverOrUnderAchievingResult(2, -2)).toStrictEqual([
      "Overachieving drastically",
      -0.4,
    ]);
  });

  test("a team is correctly deemed to be underachieving drastically", async () => {
    expect(await getOverOrUnderAchievingResult(2, 2)).toStrictEqual([
      "Underachieving drastically",
      0.4,
    ]);
  });

  test("a team is correctly deemed to be overachieving slightly", async () => {
    expect(await getOverOrUnderAchievingResult(2, -0.3)).toStrictEqual([
      "Overachieving slightly",
      -0.1,
    ]);
  });
});

describe("clinical rating tests", () => {
  test("a team is given the correct clinical rating of excellent", async () => {
    expect(
      await getClinicalRating({ dangerousAttackConversion: 15 })
    ).toStrictEqual(["excellent", 0.8]);
  });

  test("a team is given the correct clinical rating of awful", async () => {
    expect(
      await getClinicalRating({ dangerousAttackConversion: 61 })
    ).toStrictEqual(["awful", 1.3]);
  });
});

describe("points differential tests", () => {
  test("the correct points differential is calculated", async () => {
    expect(await getPointsDifferential(5, 3)).toBe(2.0);
  });
});

describe("the point weighting function", () => {
  test("large point differences are weighted correctly", async () => {
    expect(await getPointWeighting(2.5)).toStrictEqual([0.6, -0.1]);
  });
  test("small point differences are weighted correctly", async () => {
    expect(await getPointWeighting(-0.75)).toStrictEqual([0, 0.1]);
  });
  test("near identical point differences are weighted correctly", async () => {
    expect(await getPointWeighting(0.45)).toStrictEqual([0, 0]);
  });
});

describe("the form trend calculatiom", () => {
  test("outstanding form with improvement is calculated correctly", async () => {
    expect(await compareFormTrend(3, 2.5, 2, 1.5, 2, 1)).toStrictEqual([
      12.5,
      true,
    ]);
  });

  test("outstanding form worsening is calculated correctly", async () => {
    expect(await compareFormTrend(2.6, 2.7, 2.7, 1.5, 2, 1)).toStrictEqual([
      12.5,
      false,
    ]);
  });

  test("poor form worsening is calculated correctly", async () => {
    expect(await compareFormTrend(1, 1.2, 1.3, 1.5, 1, 1)).toStrictEqual([
      5,
      false,
    ]);
  });

  test("poor form is calculated correctly", async () => {
    expect(await compareFormTrend(1, 0.9, 0.7, 0.5, 1, 1)).toStrictEqual([
      4.5,
      undefined,
    ]);
  });

  test("poor form with improving goal difference is calculated correctly", async () => {
    expect(await compareFormTrend(1, 1.1, 0.7, 0.5, 3, 1)).toStrictEqual([
      6.5,
      true,
    ]);
  });
});

describe("the point average function", () => {
  test("point average is calculated correctly", async () => {
    expect(await getPointAverage(9, 3)).toBe(3);
  });

  test("point average is calculated correctly when resulting number is not whole", async () => {
    expect(await getPointAverage(10, 4)).toBe(2.5);
  });
});

describe("the team comparison function", () => {
    test("teams are compared and the correct calculation is returned", async () => {
      expect(await compareTeams(homeForm, awayForm, "test", match)).toBe(21);
    });

})
