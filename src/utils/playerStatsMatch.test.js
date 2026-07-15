import {
  findPlayerStatsEntry,
  normalizePlayerName,
} from "./playerStatsMatch";

describe("playerStatsMatch", () => {
  const players = [
    { id: 101, name: "Jordan Henderson", appearances: 5 },
    { id: 202, name: "Jarell Quansah", appearances: 3 },
  ];

  test("matches missing players by SofaScore id", () => {
    expect(
      findPlayerStatsEntry(players, {
        id: 202,
        name: "Different Name",
      })
    ).toEqual(players[1]);
  });

  test("matches missing players by normalized name", () => {
    expect(
      findPlayerStatsEntry(players, {
        name: "jordan henderson",
      })
    ).toEqual(players[0]);
  });

  test("normalizes accented characters", () => {
    expect(normalizePlayerName("José María")).toBe("jose maria");
  });
});
