import {
  getLeagueFixturesByLeagueId,
  getLeagueResultsByLeagueId,
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
      { id: 15050, fixtures: [{ home_name: "EPL", away_name: "Side" }] },
      { id: 16494, fixtures: [{ home_name: "USA", away_name: "Mexico" }] },
    ];

    expect(reorderedCache[0].id).toBe(15050);
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
