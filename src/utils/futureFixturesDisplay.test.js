import {
  mapFutureFixtureEvents,
  selectUpcomingFixtures,
} from "./futureFixturesDisplay";

describe("selectUpcomingFixtures", () => {
  test("keeps short schedules instead of skipping the only fixtures", () => {
    expect(selectUpcomingFixtures(["a", "b", "c"], 5)).toEqual(["a", "b", "c"]);
  });

  test("skips the first fixture when the schedule is longer than the display limit", () => {
    expect(selectUpcomingFixtures(["a", "b", "c", "d", "e", "f", "g"], 5)).toEqual([
      "b",
      "c",
      "d",
      "e",
      "f",
    ]);
  });
});

describe("mapFutureFixtureEvents", () => {
  test("maps industry stat website event fields into display rows", () => {
    const rows = mapFutureFixtureEvents([
      {
        tournament: { name: "World Cup" },
        homeTeam: { name: "Brazil" },
        awayTeam: { name: "Argentina" },
        startTimestamp: 1710000000,
      },
    ]);

    expect(rows[0]).toMatchObject({
      tournamentName: "World Cup",
      homeTeam: "Brazil",
      awayTeam: "Argentina",
    });
    expect(rows[0].date).not.toBe("N/A");
  });
});
