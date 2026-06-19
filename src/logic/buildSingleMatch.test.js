import {
  buildFixturePageAttackingMetrics,
  buildFixturePageDefensiveMetrics,
  buildFixturePageSections,
  buildFixtureModelOutputs,
  computeCleanSheetPercentage,
  formatLeaguePosition,
} from "./fixturePageMetrics";

describe("fixture page display metrics", () => {
  const form = {
    AverageDangerousAttacksOverall: 52.1,
    avgShots: 11.4,
    avgShotValueChart: 8.25,
    AverageShotsOnTargetOverall: 4.2,
    XGOverall: 1.35,
    weightedXGAvgFor: 1.4267,
    teamXGAllRollingAverage: 1.55,
    avgScored: 1.8,
    teamGoalsRollingAverage: 2.1,
    AverageCorners: 5.6,
    attackingMetrics: { "Injury impact": 6 },
    CleanSheetPercentage: 35,
    XGAgainstAvgOverall: 1.1,
    weightedXGAvgAgainst: 1.0544,
    teamXGConceededAllRollingAverage: 1.2,
    avgConceeded: 1.25,
    teamConceededRollingAverage: 1.4,
    AverageShotsOnTargetAgainstOverall: 3.8,
    shotsOnTargetAgainstRollingAverage: 4.5,
    avgShotsAgainst: 10.2,
    shotsAgainstRollingAverage: 11.0,
    avgShotValueAgainstChart: 7.5,
    avgDangerousAttacksAgainst: 48.3,
    defensiveMetrics: { "Injury impact": 5 },
    allTeamResults: [
      { conceeded: 0 },
      { conceeded: 1 },
      { conceeded: 0 },
      { conceeded: 2 },
    ],
    homePosition: 3,
    awayPosition: 8,
    avPoints5: 2.4,
    trueForm: 7.2,
    goalDifference: 5,
    bttsAllPercentage: "60",
    bttsLast5Percentage: "80",
    bttsHomePercentage: "70",
    bttsAwayPercentage: "50",
  };

  test("uses plain league averages instead of rolling fields", () => {
    const attacking = buildFixturePageAttackingMetrics(form);
    const defensive = buildFixturePageDefensiveMetrics(form);

    expect(attacking["Average Goals"]).toBe(1.8);
    expect(attacking["Average Goals"]).not.toBe(form.teamGoalsRollingAverage);
    expect(attacking["Average Shots"]).toBe(11.4);
    expect(attacking["Average Shots On Target"]).toBe(4.2);
    expect(attacking["Weighted XG"]).toBe(1.43);
    expect(attacking["Injury impact"]).toBe(6);

    expect(defensive["Average Goals Against"]).toBe(1.25);
    expect(defensive["Average Goals Against"]).not.toBe(
      form.teamConceededRollingAverage
    );
    expect(defensive["Weighted XG Against"]).toBe(1.05);
    expect(defensive["Average SOT Against"]).toBe(3.8);
    expect(defensive["Average Shots Against"]).toBe(10.2);
    expect(defensive["Injury impact"]).toBe(5);
  });

  test("computes clean sheet percentage from league results", () => {
    expect(computeCleanSheetPercentage(form.allTeamResults)).toBe("50.00%");
    expect(buildFixturePageDefensiveMetrics(form)["Clean Sheet Percentage"]).toBe(
      "50.00%"
    );
    expect(buildFixturePageDefensiveMetrics(form)["Clean Sheet Percentage"]).not.toBe(
      form.CleanSheetPercentage
    );
  });

  test("formatLeaguePosition adds ordinal suffix", () => {
    expect(formatLeaguePosition(3)).toBe("3rd");
    expect(formatLeaguePosition(21)).toBe("21st");
    expect(formatLeaguePosition("2nd")).toBe("2nd");
  });

  test("buildFixturePageSections returns ordered engine-derived sections", () => {
    const match = {
      homeTeamHomePosition: "2nd",
      awayTeamAwayPosition: "11th",
      lastFiveFormHome: ["W", "W", "D", "L", "W"],
      lastFiveFormAway: ["L", "D", "W", "W", "L"],
      homeWinProbability: 45.2,
      drawProbability: 28.1,
      awayWinProbability: 26.7,
      formHome: form,
      formAway: { ...form, homePosition: 8, awayPosition: 3 },
    };

    const sections = buildFixturePageSections(match);

    expect(sections.map((section) => section.id)).toEqual([
      "context",
      "attacking",
      "defensive",
      "tendencies",
    ]);

    expect(sections[0].title).toBe("Form & Context");
    expect(sections[0].home[0]).toEqual({
      label: "Competition Ranking",
      value: "3rd",
    });
    expect(sections[0].home[1].value).toBe("2nd");
    expect(sections[0].home.some((row) => row.label === "True form")).toBe(false);
    expect(sections[0].home[2].value).toBe("W-W-D-L-W");

    expect(sections[1].home[0].label).toBe("Average Goals");
    expect(sections[3].home[0].label).toBe("BTTS % (last 10)");
    expect(sections[3].home[0].value).toBe("60%");

    expect(buildFixtureModelOutputs(match)).toEqual({
      homeWin: 45.2,
      draw: 28.1,
      awayWin: 26.7,
    });
  });
});
