import { buildShotStackSeries } from "./shotStackSeries";

describe("buildShotStackSeries", () => {
  test("uses away goals when the team played away", () => {
    const series = buildShotStackSeries(
      [
        {
          unixTimestamp: 1,
          homeTeam: "Haiti",
          awayTeam: "England",
          homeGoals: 2,
          awayGoals: 4,
          homeSot: 3,
          awaySot: 8,
          homeShots: 10,
          awayShots: 15,
          goalsFor: 2,
        },
      ],
      "England"
    );

    expect(series).toHaveLength(1);
    expect(series[0].goals).toBe(4);
    expect(series[0].stackGoals).toBe(4);
    expect(series[0].stackSot).toBe(4);
  });

  test("uses home goals when the team played at home", () => {
    const series = buildShotStackSeries(
      [
        {
          unixTimestamp: 1,
          homeTeam: "England",
          awayTeam: "Haiti",
          homeGoals: 4,
          awayGoals: 0,
          homeSot: 6,
          awaySot: 1,
          homeShots: 12,
          awayShots: 5,
          goalsFor: 4,
        },
      ],
      "England"
    );

    expect(series[0].goals).toBe(4);
    expect(series[0].stackGoals).toBe(4);
    expect(series[0].stackSot).toBe(2);
  });
});
