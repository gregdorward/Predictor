import {
  applyCompetitionGoalDifference,
  applyCompetitionVenueForm,
  computeCompetitionGoalDifference,
  findLeagueEntryById,
  evaluateResultsCache,
  isRebuiltResultsCacheComplete,
  getCompetitionFormPills,
  getCompetitionVenueForm,
  getLeagueFixturesByLeagueId,
  getLeagueResultsByLeagueId,
  getTeamFixturesBeforeMatch,
  isCompleteLeagueHistoryFixture,
  isResultsCacheValid,
  teamNamesMatch,
  trimLeagueResultsToWindow,
} from "./leagueResultsAccess";

describe("teamNamesMatch", () => {
  test("matches RSC Anderlecht to Anderlecht", () => {
    expect(teamNamesMatch("RSC Anderlecht", "Anderlecht")).toBe(true);
    expect(teamNamesMatch("Anderlecht", "RSC Anderlecht")).toBe(true);
  });

  test("matches Tottenham to Tottenham Hotspur", () => {
    expect(teamNamesMatch("Tottenham", "Tottenham Hotspur")).toBe(true);
  });

  test("matches Sporting to Sporting CP", () => {
    expect(teamNamesMatch("Sporting", "Sporting CP")).toBe(true);
  });

  test("does not match Sporting to Sporting Braga", () => {
    expect(teamNamesMatch("Sporting", "Sporting Braga")).toBe(false);
    expect(teamNamesMatch("Sporting Braga", "Sporting")).toBe(false);
  });

  test("does not match Rangers to Queens Park Rangers", () => {
    expect(teamNamesMatch("Rangers", "Queens Park Rangers")).toBe(false);
    expect(teamNamesMatch("Queens Park Rangers", "Rangers")).toBe(false);
  });
});

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

  test("getCompetitionVenueForm matches RSC Anderlecht to Anderlecht results", () => {
    const elResults = [
      {
        id: 17127,
        fixtures: [
          {
            home_name: "Anderlecht",
            away_name: "PAOK",
            homeGoalCount: 3,
            awayGoalCount: 2,
            date_unix: 300000,
            status: "complete",
          },
          {
            home_name: "PAOK",
            away_name: "Anderlecht",
            homeGoalCount: 0,
            awayGoalCount: 1,
            date_unix: 200000,
            status: "complete",
          },
          {
            home_name: "Hammarby",
            away_name: "Anderlecht",
            homeGoalCount: 1,
            awayGoalCount: 1,
            date_unix: 100000,
            status: "complete",
          },
        ],
      },
    ];
    const match = {
      competition_id: 17127,
      date_unix: 400000,
      awayTeam: "RSC Anderlecht",
    };
    expect(
      getCompetitionVenueForm("RSC Anderlecht", match, elResults)
    ).toEqual({
      resultsAll: ["W", "W", "D"],
      resultsHome: ["W"],
      resultsAway: ["W", "D"],
      bttsAll: ["\u2714", "\u2718", "\u2714"],
      leaguePlayed: 3,
      leaguePlayedHome: 1,
      leaguePlayedAway: 2,
    });
    expect(
      getCompetitionFormPills("RSC Anderlecht", match, elResults, "away")
    ).toEqual(["W", "D"]);
  });

  test("getCompetitionVenueForm splits this-competition home and away WDL", () => {
    expect(getCompetitionVenueForm("England", match, allLeagueResults)).toEqual({
      resultsAll: ["D", "W", "W"],
      resultsHome: ["D", "W"],
      resultsAway: ["W"],
      bttsAll: ["\u2718", "\u2718", "\u2714"],
      leaguePlayed: 3,
      leaguePlayedHome: 2,
      leaguePlayedAway: 1,
    });
  });

  test("applyCompetitionVenueForm stores league home/away played on the form", () => {
    const form = {};
    expect(
      applyCompetitionVenueForm(form, "England", match, allLeagueResults)
    ).toBe(true);
    expect(form.leaguePlayedHome).toBe(2);
    expect(form.leaguePlayedAway).toBe(1);
    expect(form.resultsHome).toEqual(["D", "W"]);
    expect(form.resultsAway).toEqual(["W"]);
    expect(form.bttsAll).toEqual(["\u2718", "\u2718", "\u2714"]);
  });

  test("getCompetitionFormPills is empty when the competition cache has no team games", () => {
    expect(
      getCompetitionFormPills(
        "RSC Anderlecht",
        { leagueID: 17127, date: 400000 },
        [{ id: 17127, fixtures: [] }],
        "all"
      )
    ).toEqual([]);
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

  test("resolves retired season ids via COMPETITION_ID_ALIASES", () => {
    const averages = [{ id: 16576, averageGoals: 2.6 }];

    expect(findLeagueEntryById(averages, 16263)?.averageGoals).toBe(2.6);
    expect(findLeagueEntryById(averages, 16576)?.averageGoals).toBe(2.6);
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

describe("isRebuiltResultsCacheComplete", () => {
  const orderedLeagues = [
    { element: { id: 17146 }, name: "EPL" },
    { element: { id: 16494 }, name: "MLS" },
  ];

  test("returns true when every current league is present after rebuild", () => {
    const rebuilt = [
      { id: 17146, fixtures: [] },
      { id: 16494, fixtures: [] },
    ];
    expect(isRebuiltResultsCacheComplete(rebuilt, orderedLeagues)).toBe(true);
  });

  test("returns false for partial rebuilds (e.g. industry leading stat website rate limit)", () => {
    const partial = [{ id: 17146, fixtures: [] }];
    expect(isRebuiltResultsCacheComplete(partial, orderedLeagues)).toBe(false);
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

describe("isCompleteLeagueHistoryFixture", () => {
  test("treats cached rows with no status as complete when goals are finite", () => {
    expect(
      isCompleteLeagueHistoryFixture({
        homeGoalCount: 1,
        awayGoalCount: 0,
      })
    ).toBe(true);
  });

  test("keeps explicit complete status", () => {
    expect(
      isCompleteLeagueHistoryFixture({
        status: "complete",
        homeGoalCount: 0,
        awayGoalCount: 0,
      })
    ).toBe(true);
  });

  test("rejects incomplete rows even if they look like 0-0", () => {
    expect(
      isCompleteLeagueHistoryFixture({
        status: "incomplete",
        homeGoalCount: 0,
        awayGoalCount: 0,
      })
    ).toBe(false);
  });
});
