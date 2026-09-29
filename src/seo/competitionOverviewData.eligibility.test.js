import { isComparisonEligible } from "./competitionOverviewData";

const baseRow = {
  slug: "test-league",
  country: "England",
  played: 20,
  avgGoals: 2.8,
};

describe("isComparisonEligible", () => {
  it("includes tiers 1 through 6", () => {
    for (const division of [1, 2, 3, 4, 5, 6]) {
      expect(isComparisonEligible({ ...baseRow, division })).toBe(true);
    }
  });

  it("excludes tier 7 and domestic cups", () => {
    expect(isComparisonEligible({ ...baseRow, division: 7 })).toBe(false);
    expect(
      isComparisonEligible({
        ...baseRow,
        slug: "fa-cup",
        division: -1,
        country: "England",
      })
    ).toBe(false);
  });

  it("includes allowlisted continental competitions", () => {
    expect(
      isComparisonEligible({
        slug: "champions-league",
        country: "Europe",
        division: -1,
        played: 30,
        avgGoals: 2.9,
      })
    ).toBe(true);
    expect(
      isComparisonEligible({
        slug: "copa-libertadores",
        country: "South America",
        division: -1,
        played: 20,
        avgGoals: 2.5,
      })
    ).toBe(true);
  });
});
