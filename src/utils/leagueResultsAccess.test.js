import { getLeagueFixturesByLeagueId } from "./leagueResultsAccess";

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

  test("finds league by id regardless of array index", () => {
    const shuffled = [allLeagueResults[2], allLeagueResults[0], allLeagueResults[1]];
    expect(getLeagueFixturesByLeagueId(shuffled, 8)).toHaveLength(1);
    expect(getLeagueFixturesByLeagueId(shuffled, 16494)).toEqual([]);
  });
});
