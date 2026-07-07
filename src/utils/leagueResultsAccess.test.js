import {
  applyCompetitionGoalDifference,
  computeCompetitionGoalDifference,
  findLeagueEntryById,
  evaluateResultsCache,
  getLeagueFixturesByLeagueId,
  getLeagueResultsByLeagueId,
  getTeamFixturesBeforeMatch,
  isResultsCacheValid,
  trimLeagueResultsToWindow,
} from "./leagueResultsAccess";

describe("getLeagueFixturesByLeagueId", () => {
  const allLeagueResults = [
    { id: 8, fixtures: [{ home_name: "A", away_name: "B", date_unix: 1 }] },
    { id: 16494, fixtures: undefined },
    { id: 18 },
  ];

  test("returns fixtures for a matching league", () => {
    expect(getLeagueFixturesByLeagueId(allLeagueResults, 8)).toHaveLength(1);
  });

  test("returns an empty array when fixtures are missing", () => {
    expect(getLeagueFixturesByLeagueId(allLeagueResults, 16494)).toEqual([]);
  });

  test("returns an empty array when the league is not found", () => {
    expect(getLeagueFixturesByLeagueId(allLeagueResults, 99999)).toEqual([]);
  });

  test("returns an empty array for invalid inputs", () => {
    expect(getLeagueFixturesByLeagueId(null, 8)).toEqual([]);
    expect(getLeagueFixturesByLeagueId(allLeagueResults, null)).toEqual([]);
  });

  test("finds fixtures by league id when array order differs from orderedLeagues index", () => {
    const reorderedCache = [
      { id: 17146, fixtures: [{ home_name: "EPL", away_name: "Side" }] },
      { id: 16494, fixtures: [{ home_name: "USA", away_name: "Mexico" }] },
    ];

    expect(reorderedCache[0].id).toBe(17146);
    expect(getLeagueFixturesByLeagueId(reorderedCache, 16494)).toHaveLength(1);
    expect(getLeagueFixturesByLeagueId(reorderedCache, 16494)[0].home_name).toBe(
      "USA"
    );
  });

  test("finds league by id regardless of array index", () => {
    const shuffled = [allLeagueResults[2], allLeagueResults[0], allLeagueResults[1]];
    expect(getLeagueFixturesByLeagueId(shuffled, 8)).toHaveLength(1);
    expect(getLeagueFixturesByLeagueId(shuffled, 16494)).toEqual([]);
  });
});

describe("getLeagueResultsByLeagueId", () => {
  const allLeagueResults = [{ id: 16494, fixtures: [] }];

  test("returns the matching league entry", () => {
    expect(getLeagueResultsByLeagueId(allLeagueResults, 16494)).toEqual({
      id: 16494,
      fixtures: [],
    });
  });

  test("returns null when the league is not found", () => {
    expect(getLeagueResultsByLeagueId(allLeagueResults, 99999)).toBeNull();
  });

  test("matches league id regardless of string vs number type", () => {
    const stringIdCache = [{ id: "16494", fixtures: [{ home_name: "USA" }] }];

    expect(getLeagueResultsByLeagueId(stringIdCache, 16494)?.id).toBe("16494");
    expect(getLeagueFixturesByLeagueId(stringIdCache, 16494)).toHaveLength(1);
  });
});

describe("competition goal difference", () => {
  const allLeagueResults = [
    {
      id: 16494,
      fixtures: [
        {
          home_name: "England",
          away_name: "Iran",
          homeGoalCount: 6,
          awayGoalCount: 2,
          date_unix: 100000,
        },
        {
          home_name: "Wales",
          away_name: "England",
          homeGoalCount: 0,
          awayGoalCount: 3,
          date_unix: 200000,
        },
        {
          home_name: "England",
          away_name: "USA",
          homeGoalCount: 0,
          awayGoalCount: 0,
          date_unix: 300000,
        },
      ],
    },
  ];

  const match = {
    leagueID: 16494,
    date: 400000,
    homeTeam: "England",
    awayTeam: "Senegal",
  };

  test("computes overall and home-only goal difference from competition fixtures", () => {
    expect(
      computeCompetitionGoalDifference(
        "England",
        match,
        "home",
        allLeagueResults
      )
    ).toEqual({
      goalDifference: 7,
      goalDifferenceHomeOrAway: 4,
    });
  });

  test("getTeamFixturesBeforeMatch excludes the current match day", () => {
    expect(
      getTeamFixturesBeforeMatch("England", match, allLeagueResults)
    ).toHaveLength(3);
  });

  test("applyCompetitionGoalDifference mutates the form object", () => {
    const form = { goalDifference: 99, goalDifferenceHomeOrAway: 99 };
    expect(
      applyCompetitionGoalDifference(
        form,
        "England",
        match,
        "home",
        allLeagueResults
      )
    ).toBe(true);
    expect(form.goalDifference).toBe(7);
    expect(form.goalDifferenceHomeOrAway).toBe(4);
  });
});

describe("findLeagueEntryById", () => {
  test("matches league averages entries regardless of string vs number type", () => {
    const averages = [
      { id: "17146", averageGoals: 2.8 },
      { id: 17184, averageGoals: 2.5 },
    ];

    expect(findLeagueEntryById(averages, 17146)?.averageGoals).toBe(2.8);
    expect(findLeagueEntryById(averages, "17184")?.averageGoals).toBe(2.5);
    expect(findLeagueEntryById(averages, 99999)).toBeNull();
    expect(findLeagueEntryById(null, 17146)).toBeNull();
  });
});

describe("isResultsCacheValid", () => {
  const orderedLeagues = [
    { element: { id: 17146 } },
    { element: { id: 16494 } },
  ];

  test("accepts cache that matches current season ids exactly", () => {
    const cache = [
      { id: 17146, fixtures: [] },
      { id: 16494, fixtures: [] },
    ];
    expect(isResultsCacheValid(cache, orderedLeagues)).toBe(true);
  });

  test("rejects cache with stale league ids from prior seasons", () => {
    const cache = [
      { id: 15050, fixtures: [] },
      { id: 17146, fixtures: [] },
      { id: 16494, fixtures: [] },
    ];
    expect(isResultsCacheValid(cache, orderedLeagues)).toBe(false);
  });

  test("rejects cache missing a newly added league", () => {
    const cache = [{ id: 17146, fixtures: [] }];
    expect(isResultsCacheValid(cache, orderedLeagues)).toBe(false);
  });
});

describe("evaluateResultsCache", () => {
  const orderedLeagues = [
    { element: { id: 17146 }, name: "EPL" },
    { element: { id: 16494 }, name: "MLS" },
    { element: { id: 8 }, name: "Championship" },
  ];

  test("marks a partial cache as usable but not complete", () => {
    const cache = [
      { id: 17146, fixtures: [] },
      { id: 16494, fixtures: [] },
    ];

    expect(evaluateResultsCache(cache, orderedLeagues)).toEqual({
      complete: false,
      usable: true,
      staleIds: [],
      missingIds: ["8"],
      missingLeagues: [{ element: { id: 8 }, name: "Championship" }],
    });
  });

  test("rejects caches that contain stale season ids", () => {
    const cache = [
      { id: 15050, fixtures: [] },
      { id: 17146, fixtures: [] },
      { id: 16494, fixtures: [] },
      { id: 8, fixtures: [] },
    ];

    expect(evaluateResultsCache(cache, orderedLeagues)).toMatchObject({
      complete: false,
      usable: false,
      staleIds: ["15050"],
      missingIds: [],
    });
  });
});

describe("trimLeagueResultsToWindow", () => {
  test("keeps only fixtures after the cutoff and caps at 600", () => {
    const cutoff = 1000;
    const cache = [
      {
        id: 8,
        fixtures: [
          { date_unix: 500 },
          { date_unix: 1500 },
          { date_unix: 2000 },
        ],
      },
    ];

    const trimmed = trimLeagueResultsToWindow(cache, cutoff);
    expect(trimmed[0].fixtures).toHaveLength(2);
    expect(trimmed[0].fixtures[0].date_unix).toBe(1500);
  });
});
