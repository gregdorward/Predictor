import { findSofaScoreGameByTeams } from "./sofaScoreMatch";

const normalize = (name) => String(name).toLowerCase().trim();

describe("findSofaScoreGameByTeams", () => {
  const games = [
    {
      id: 1,
      homeTeam: "United States",
      awayTeam: "Mexico",
      homeId: 10,
      awayId: 11,
    },
    {
      id: 2,
      homeTeam: "England",
      awayTeam: "France",
      homeId: 20,
      awayId: 21,
    },
  ];

  test("finds an exact home and away match", () => {
    const match = findSofaScoreGameByTeams(
      games,
      "USA",
      "Mexico",
      (name) => (name === "USA" ? "united states" : normalize(name))
    );

    expect(match?.id).toBe(1);
  });

  test("returns null when no pair matches", () => {
    const match = findSofaScoreGameByTeams(
      games,
      "England",
      "Germany",
      normalize
    );

    expect(match).toBeNull();
  });
});
