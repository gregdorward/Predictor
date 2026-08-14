import {
  PENALTY_XG,
  npxgOrXg,
  resolveTeamXgAndNpXg,
  toNonPenaltyXg,
} from "./nonPenaltyXg";

describe("toNonPenaltyXg", () => {
  test("deducts 0.76 for one penalty when pens are recorded", () => {
    expect(
      toNonPenaltyXg(1.5, { pensRecorded: 1, penaltiesWon: 1 })
    ).toBeCloseTo(1.5 - PENALTY_XG);
  });

  test("deducts 0.76 per penalty for multiple awards", () => {
    expect(
      toNonPenaltyXg(2.4, { pensRecorded: 1, penaltiesWon: 2 })
    ).toBeCloseTo(2.4 - 2 * PENALTY_XG);
  });

  test("does not deduct when pens_recorded is not 1", () => {
    expect(
      toNonPenaltyXg(1.5, { pensRecorded: -1, penaltiesWon: 1 })
    ).toBe(1.5);
    expect(
      toNonPenaltyXg(1.5, { pensRecorded: 0, penaltiesWon: 1 })
    ).toBe(1.5);
    expect(toNonPenaltyXg(1.5, { penaltiesWon: 1 })).toBe(1.5);
  });

  test("does not deduct when penalties_won is missing or zero", () => {
    expect(toNonPenaltyXg(1.5, { pensRecorded: 1 })).toBe(1.5);
    expect(
      toNonPenaltyXg(1.5, { pensRecorded: 1, penaltiesWon: 0 })
    ).toBe(1.5);
  });

  test("does not deduct when xG used goals fallback", () => {
    expect(
      toNonPenaltyXg(2, {
        pensRecorded: 1,
        penaltiesWon: 1,
        usedGoalsFallback: true,
      })
    ).toBe(2);
  });

  test("floors at 0", () => {
    expect(
      toNonPenaltyXg(0.5, { pensRecorded: 1, penaltiesWon: 2 })
    ).toBe(0);
  });
});

describe("npxgOrXg", () => {
  test("returns finite npxG when present", () => {
    expect(npxgOrXg(1.1, 1.5)).toBe(1.1);
  });

  test("falls back to original xG when npxG is missing", () => {
    expect(npxgOrXg(undefined, 1.5)).toBe(1.5);
    expect(npxgOrXg(null, 1.5)).toBe(1.5);
    expect(npxgOrXg(NaN, 1.5)).toBe(1.5);
  });
});

describe("resolveTeamXgAndNpXg", () => {
  test("uses raw xG and deducts penalties", () => {
    const result = resolveTeamXgAndNpXg(1.52, 2, 1, 1);
    expect(result.xg).toBe(1.52);
    expect(result.usedGoalsFallback).toBe(false);
    expect(result.npXG).toBeCloseTo(1.52 - PENALTY_XG);
  });

  test("uses goals fallback without penalty deduction when xG is invalid", () => {
    const result = resolveTeamXgAndNpXg(0, 3, 1, 1);
    expect(result.xg).toBe(3);
    expect(result.usedGoalsFallback).toBe(true);
    expect(result.npXG).toBe(3);
  });
});
