import { resolveMultiDivisionLeagueTables } from "./multiDivisionLeagueTables";

describe("resolveMultiDivisionLeagueTables", () => {
  test("returns null when the stale groups flag would have opened an empty MLS table", () => {
    expect(resolveMultiDivisionLeagueTables([], 16504)).toBeNull();
  });

  test("returns null when only one division is present", () => {
    const bespokeLeagueArray = [
      { id: 16504, group: "Eastern", table: [{ Name: "Team A" }] },
    ];

    expect(resolveMultiDivisionLeagueTables(bespokeLeagueArray, 16504)).toBeNull();
  });

  test("returns both divisions when MLS tables are available", () => {
    const bespokeLeagueArray = [
      { id: 16504, group: "Eastern", table: [{ Name: "Team A" }] },
      { id: 16504, group: "Western", table: [{ Name: "Team B" }] },
    ];

    expect(resolveMultiDivisionLeagueTables(bespokeLeagueArray, 16504)).toEqual({
      leagueTable1: [{ Name: "Team A" }],
      leagueTable2: [{ Name: "Team B" }],
      divisionName1: "Eastern",
      divisionName2: "Western",
    });
  });
});
