import {
  MRI_MIN_PRICED_MATCHES,
  buildLeagueMriRow,
  buildMarketReliabilityOverview,
  formatCorrectlyPriced,
  isValidMriOverviewPayload,
} from "./marketReliabilityData";

function pricedFixture(homeOdds, awayOdds, homeGoals, awayGoals) {
  return {
    home_name: "Home",
    away_name: "Away",
    odds_ft_1: homeOdds,
    odds_ft_2: awayOdds,
    odds_ft_x: 3.4,
    homeGoalCount: homeGoals,
    awayGoalCount: awayGoals,
    status: "complete",
  };
}

describe("buildMarketReliabilityOverview", () => {
  test("builds league rows from cached results and catalog", () => {
    const fixtures = Array.from({ length: MRI_MIN_PRICED_MATCHES }, () =>
      pricedFixture(1.6, 4.2, 2, 0)
    );
    const overview = buildMarketReliabilityOverview(
      {
        data: [{ id: 99, name: "Test League", fixtures }],
      },
      [{ id: 99, slug: "test-league", name: "Test League" }]
    );

    expect(overview.leagues).toHaveLength(1);
    expect(overview.leagues[0]).toMatchObject({
      slug: "test-league",
      favouriteHitRate: 100,
      predictabilityScore: 99,
    });
    expect(isValidMriOverviewPayload(overview)).toBe(true);
  });

  test("skips leagues missing from the catalog or below the sample floor", () => {
    const overview = buildMarketReliabilityOverview(
      {
        data: [
          {
            id: 1,
            fixtures: [pricedFixture(1.5, 4, 1, 0)],
          },
          {
            id: 2,
            fixtures: Array.from({ length: MRI_MIN_PRICED_MATCHES }, () =>
              pricedFixture(1.5, 4, 1, 0)
            ),
          },
        ],
      },
      [{ id: 2, slug: "known", name: "Known" }]
    );

    expect(overview.leagues.map((row) => row.slug)).toEqual(["known"]);
  });

  test("buildLeagueMriRow returns null without a catalog slug", () => {
    expect(
      buildLeagueMriRow(
        {
          fixtures: Array.from({ length: MRI_MIN_PRICED_MATCHES }, () =>
            pricedFixture(1.5, 4, 1, 0)
          ),
        },
        { name: "No slug" }
      )
    ).toBeNull();
  });

  test("exposes correctlyPriced counts for the X/Y column", () => {
    const fixtures = Array.from({ length: MRI_MIN_PRICED_MATCHES }, (_, i) =>
      pricedFixture(1.6, 4.2, i < 7 ? 2 : 0, i < 7 ? 0 : 1)
    );
    // 7 home-fav wins, 3 away wins = 7 correctly priced out of 10
    const overview = buildMarketReliabilityOverview(
      { data: [{ id: 3, fixtures }] },
      [{ id: 3, slug: "ratio-league", name: "Ratio League" }]
    );
    expect(overview.leagues[0].correctlyPriced).toBe(7);
    expect(overview.leagues[0].pricedMatches).toBe(10);
  });
});

describe("formatCorrectlyPriced", () => {
  test("formats hits over total", () => {
    expect(formatCorrectlyPriced(14, 20)).toBe("14/20");
    expect(formatCorrectlyPriced(null, 20)).toBeNull();
  });
});
