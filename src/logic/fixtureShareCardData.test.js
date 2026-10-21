import { buildFixtureShareCard, buildFixtureShareCardFromMatch } from "./fixtureShareCardData";

describe("buildFixtureShareCard", () => {
  test("includes gated prediction and model numbers when they exist", () => {
    const card = buildFixtureShareCard({
      homeName: "Wolves",
      awayName: "Portsmouth",
      league: "League",
      predictedHome: "2",
      predictedAway: 1,
      modelOutputs: { homeWin: 48.2, draw: 27.1, awayWin: 24.7 },
      chart: {
        homeAttack: 0.77,
        awayAttack: 0.39,
        homeDefence: 0.74,
        awayDefence: 0.49,
      },
      marketRows: [
        { label: "BTTS % (last 5)", homeValue: "60%", awayValue: "40%" },
        { label: "O2.5 % (last 5)", homeValue: "80%", awayValue: "20%" },
        { label: "U2.5 % (last 5)", homeValue: "20%", awayValue: "80%" },
      ],
      headToHead: {
        summary: { homeTeamWins: 5, awayTeamWins: 1, draws: 2 },
      },
    });

    expect(card.predictedScore).toEqual({ home: "2", away: "1" });
    expect(card.league).toBe("");
    expect(card.model.caption).toBe("Wolves are the most likely winners, at 48.2%.");
    expect(card.strengths.caption).toBe("Wolves are stronger in attack and defence.");
    expect(card.markets.map((row) => row.label)).toEqual(["BTTS", "Over 2.5"]);
    expect(card.headToHead.total).toBe(8);
    expect(card.headToHead.caption).toContain("2 draws");
  });

  test("sizes strength bars from each pair, so close values stay close", () => {
    const card = buildFixtureShareCard({
      homeName: "Wolverhampton Wanderers",
      awayName: "Portsmouth",
      chart: {
        homeAttack: 0.66,
        awayAttack: 0.59,
        homeDefence: 0.57,
        awayDefence: 0.64,
      },
    });

    expect(card.strengths.homeAttackShare + card.strengths.awayAttackShare).toBeCloseTo(100);
    expect(card.strengths.homeAttackShare).toBeCloseTo(52.8, 0);
    expect(card.strengths.awayDefenceShare).toBeGreaterThan(card.strengths.homeDefenceShare);
  });

  test("describes a single meeting without a zero win count", () => {
    const card = buildFixtureShareCard({
      homeName: "Nottingham Forest",
      awayName: "Midtjylland",
      headToHead: { summary: { homeTeamWins: 0, awayTeamWins: 1, draws: 0 } },
    });

    expect(card.headToHead.caption).toBe("Midtjylland have won the only meeting.");
  });

  test("omits unavailable modules instead of inventing them", () => {
    const card = buildFixtureShareCardFromMatch({
      home_name: "Home FC",
      away_name: "Away United",
      goalsA: "x",
      goalsB: "x",
    });

    expect(card.homeName).toBe("Home FC");
    expect(card.predictedScore).toBeNull();
    expect(card.model).toBeNull();
    expect(card.strengths).toBeNull();
    expect(card.markets).toEqual([]);
    expect(card.headToHead).toBeNull();
  });
});
