import { formatFixtureComparisonText } from "./formatFixtureComparisonText";

const sampleGame = {
  id: 8507054,
  date: 1781222400,
  homeTeam: "Mexico",
  awayTeam: "South Africa",
  leagueDesc: "International World Cup",
  time: "20:00",
  goalsA: 1,
  goalsB: 0,
  homeWinProbability: 63,
  drawProbability: 28,
  awayWinProbability: 9,
  fractionHome: "2/5",
  fractionDraw: "18/5",
  fractionAway: "7/1",
};

const sampleHomeStats = {
  goals: 1.2,
  conceeded: 0.5,
  XG: 1.4,
  XGConceded: 0.7,
  goalDifference: 4,
  goalDifferenceHomeOrAway: 2,
  ppg: 1.8,
  ppgLast5: 1.6,
  ppgHomeOrAway: 1.75,
  sot: 4.2,
};

const sampleAwayStats = {
  goals: 0.8,
  conceeded: 1.1,
  XG: 1.0,
  XGConceded: 1.2,
  goalDifference: -2,
  goalDifferenceHomeOrAway: -1,
  ppg: 1.1,
  ppgLast5: 1.0,
  ppgHomeOrAway: 1.2,
  sot: 3.5,
};

const sampleComparisonMap = {
  goals: "better",
  conceeded: "better",
  XG: "better",
  ppg: "better",
};

describe("formatFixtureComparisonText markdown", () => {
  test("renders the header block on separate lines", () => {
    const markdown = formatFixtureComparisonText({
      game: sampleGame,
      homeStats: sampleHomeStats,
      awayStats: sampleAwayStats,
      comparisonMap: sampleComparisonMap,
      format: "markdown",
    });

    expect(markdown).toContain("## Mexico vs South Africa — *Soccer Stats Hub*");
    expect(markdown).not.toContain("### **International World Cup**");
    expect(markdown).toContain("**SSH Prediction:** 1-0");
    expect(markdown).toContain(
      "**Win chance:** Mexico 63% • Draw 28% • South Africa 9%"
    );
    expect(markdown).toContain("**Match odds (H/D/A):** 2/5 | 18/5 | 7/1");
    expect(markdown).toContain("| Stat | Mexico | South Africa |");
    expect(markdown).toContain("---");
  });
});
