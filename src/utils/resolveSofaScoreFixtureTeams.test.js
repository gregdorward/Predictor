import { mapSofaTeamIdsToFixture } from "./resolveSofaScoreFixtureTeams";

describe("mapSofaTeamIdsToFixture", () => {
  test("keeps ids when SofaScore home/away matches FootyStats", () => {
    const mapped = mapSofaTeamIdsToFixture(
      {
        id: 99,
        homeTeam: "Arsenal",
        awayTeam: "Chelsea",
        homeId: 1,
        awayId: 2,
      },
      "Arsenal",
      "Chelsea"
    );

    expect(mapped).toMatchObject({ homeId: 1, awayId: 2 });
  });

  test("remaps ids when SofaScore lists teams on opposite sides", () => {
    const mapped = mapSofaTeamIdsToFixture(
      {
        id: 99,
        homeTeam: "Chelsea",
        awayTeam: "Arsenal",
        homeId: 2,
        awayId: 1,
      },
      "Arsenal",
      "Chelsea"
    );

    expect(mapped).toMatchObject({ homeId: 1, awayId: 2 });
  });

  test("leaves away id null when the matched game has the wrong opponent", () => {
    const mapped = mapSofaTeamIdsToFixture(
      {
        id: 99,
        homeTeam: "Arsenal",
        awayTeam: "Liverpool",
        homeId: 1,
        awayId: 3,
      },
      "Arsenal",
      "Chelsea"
    );

    expect(mapped).toMatchObject({ homeId: 1, awayId: null });
  });
});
