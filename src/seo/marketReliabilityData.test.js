import {
  MRI_MIN_PRICED_MATCHES,
  buildLeagueMriRow,
  buildMarketReliabilityOverview,
  formatCorrectlyPriced,
  formatMriMetricValue,
  formatMriProfitTooltip,
  formatWdlRecord,
  getMriMetric,
  isValidMriOverviewPayload,
  searchTeamReliability,
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
      favouriteRoi: 60, // (1.6 - 1) * 10 / 10
      favouriteProfit: 6,
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

  test("includes a searchable teams list alongside extremes", () => {
    const fixtures = [
      ...Array.from({ length: 6 }, () => ({
        ...pricedFixture(1.5, 5, 2, 0),
        home_name: "Alpha FC",
        away_name: "Beta United",
      })),
      ...Array.from({ length: 6 }, () => ({
        ...pricedFixture(1.5, 5, 0, 1),
        home_name: "Gamma City",
        away_name: "Alpha FC",
      })),
    ];
    const overview = buildMarketReliabilityOverview(
      { data: [{ id: 4, fixtures }] },
      [{ id: 4, slug: "search-league", name: "Search League" }]
    );

    expect(overview.teams.length).toBeGreaterThan(0);
    expect(overview.teams.some((team) => team.name === "Alpha FC")).toBe(true);
    expect(overview.mostReliableTeams.length).toBeLessThanOrEqual(15);
  });

  test("ranks mostEffectiveUnderdogs by points as dog", () => {
    const fixtures = [
      ...Array.from({ length: 3 }, () => ({
        ...pricedFixture(4, 1.5, 1, 0),
        home_name: "Upsetters",
        away_name: "Giants",
      })),
      ...Array.from({ length: 3 }, () => ({
        ...pricedFixture(1.5, 4, 1, 1),
        home_name: "Giants",
        away_name: "Draw Dogs",
      })),
      ...Array.from({ length: 3 }, () => ({
        ...pricedFixture(1.4, 5, 2, 0),
        home_name: "Giants",
        away_name: "No Points",
      })),
    ];
    const overview = buildMarketReliabilityOverview(
      { data: [{ id: 5, fixtures }] },
      [{ id: 5, slug: "dog-league", name: "Dog League" }]
    );

    expect(overview.mostEffectiveUnderdogs[0].name).toBe("Upsetters");
    expect(overview.mostEffectiveUnderdogs[0].underdogPoints).toBe(9);
    expect(overview.mostEffectiveUnderdogs[0].underdogRoi).toBe(300);
    const drawDogs = overview.mostEffectiveUnderdogs.find(
      (team) => team.name === "Draw Dogs"
    );
    expect(drawDogs.underdogPoints).toBe(3);
  });
});

describe("searchTeamReliability", () => {
  const teams = [
    {
      name: "Manchester City",
      leagueName: "Premier League",
      favouriteCount: 20,
      predictabilityScore: 2.1,
    },
    {
      name: "Manchester United",
      leagueName: "Premier League",
      favouriteCount: 18,
      predictabilityScore: 1.4,
    },
    {
      name: "Celtic",
      leagueName: "Premiership",
      favouriteCount: 22,
      predictabilityScore: 2.5,
    },
  ];

  test("returns the best single match first", () => {
    expect(searchTeamReliability(teams, "celtic")[0].name).toBe("Celtic");
    expect(searchTeamReliability(teams, "manchester city")[0].name).toBe(
      "Manchester City"
    );
  });

  test("ranks prefix matches ahead of looser substring hits", () => {
    const names = searchTeamReliability(teams, "man").map((team) => team.name);
    expect(names[0]).toMatch(/^Manchester/);
  });
});

describe("formatCorrectlyPriced", () => {
  test("formats hits over total", () => {
    expect(formatCorrectlyPriced(14, 20)).toBe("14/20");
    expect(formatCorrectlyPriced(null, 20)).toBeNull();
  });
});

describe("formatWdlRecord", () => {
  test("formats wins draws losses", () => {
    expect(formatWdlRecord(5, 2, 3)).toBe("5/2/3");
    expect(formatWdlRecord(0, 0, 0)).toBe("0/0/0");
    expect(formatWdlRecord(null, 1, 2)).toBeNull();
  });
});

describe("formatMriMetricValue roi", () => {
  test("signs ROI percentages", () => {
    const metric = getMriMetric("favouriteRoi");
    expect(formatMriMetricValue(4.2, metric)).toBe("+4.2%");
    expect(formatMriMetricValue(-11, metric)).toBe("-11.0%");
    expect(formatMriProfitTooltip(2.1, 20)).toBe("+2.10u / 20");
    expect(formatMriProfitTooltip(-3, 10)).toBe("-3.00u / 10");
  });
});
