import { formatFixtureComparisonText } from "./formatFixtureComparisonText";

const sampleGame = {
  id: 8507054,
  date: 1781222400,
  homeTeam: "Mexico",
  awayTeam: "South Africa",
  leagueDesc: "International World Cup",
  leagueID: 39,
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

const worldCupGame = {
  ...sampleGame,
  leagueID: 16494,
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

const sampleRankings = {
  ranksHome: {
    goalsScored: { rank: 2, value: "12" },
    cleanSheets: { rank: 4, value: "3" },
    shotsOnTarget: { rank: 8, value: "45" },
    goalsConceded: { rank: 10, value: "5" },
    averageBallPossession: { rank: 6, value: "54%" },
    tackles: { rank: 3, value: "80" },
    avgRating: { rank: 5, value: "6.9" },
    fouls: { rank: 20, value: "110" },
  },
  ranksAway: {
    goalsScored: { rank: 28, value: "4" },
    cleanSheets: { rank: 31, value: "1" },
    shotsOnTarget: { rank: 30, value: "20" },
    goalsConceded: { rank: 25, value: "12" },
    averageBallPossession: { rank: 32, value: "42%" },
    tackles: { rank: 18, value: "55" },
    avgRating: { rank: 22, value: "6.4" },
    fouls: { rank: 8, value: "95" },
  },
  totalTeams: 48,
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

    expect(markdown).toContain("## Mexico vs South Africa - *Soccer Stats Hub*");
    expect(markdown).not.toContain("### **International World Cup**");
    expect(markdown).toContain("**SSH Prediction:** 1-0");
    expect(markdown).toContain(
      "**Win chance:** Mexico 63% • Draw 28% • South Africa 9%"
    );
    expect(markdown).toContain("**Match odds (H/D/A):** 2/5 | 18/5 | 7/1");
    expect(markdown).toContain("| Stat | Mexico | South Africa |");
    expect(markdown).toContain("| **Goal Diff (H/A)** |");
    expect(markdown).toContain("| **PPG (Home/Away)** |");
    expect(markdown).toContain("---");
  });

  test("omits home/away stats for World Cup fixtures", () => {
    const markdown = formatFixtureComparisonText({
      game: worldCupGame,
      homeStats: sampleHomeStats,
      awayStats: sampleAwayStats,
      comparisonMap: sampleComparisonMap,
      format: "markdown",
    });

    expect(markdown).not.toContain("Goal Diff (H/A)");
    expect(markdown).not.toContain("PPG (Home/Away)");
    expect(markdown).toContain("| **Goal Difference** |");
    expect(markdown).toContain("| **PPG (Overall)** |");
  });

  test("appends competition rankings for markdown", () => {
    const markdown = formatFixtureComparisonText({
      game: sampleGame,
      homeStats: sampleHomeStats,
      awayStats: sampleAwayStats,
      comparisonMap: sampleComparisonMap,
      rankings: sampleRankings,
      format: "markdown",
    });

    expect(markdown).toContain("### Competition Rankings");
    expect(markdown).toContain("**Attacking**");
    expect(markdown).toContain("**Defensive**");
    expect(markdown).toContain("**Biggest ranking edges:**");
    expect(markdown).toContain("**Goals Scored**");
    expect(markdown).toMatch(/\d+ rank edge/);
  });
});

describe("formatFixtureComparisonText plain text", () => {
  test("omits home/away stats for World Cup fixtures", () => {
    const text = formatFixtureComparisonText({
      game: worldCupGame,
      homeStats: sampleHomeStats,
      awayStats: sampleAwayStats,
      comparisonMap: sampleComparisonMap,
      format: "text",
    });

    expect(text).not.toContain("Goal difference (H/A)");
    expect(text).not.toContain("PPG (home/away)");
    expect(text).toContain("Goal difference:");
    expect(text).toContain("PPG:");
  });

  test("appends competition rankings for plain text", () => {
    const text = formatFixtureComparisonText({
      game: sampleGame,
      homeStats: sampleHomeStats,
      awayStats: sampleAwayStats,
      comparisonMap: sampleComparisonMap,
      rankings: sampleRankings,
      format: "text",
    });

    expect(text).toContain("Competition rankings:");
    expect(text).toContain("Attacking:");
    expect(text).toContain("Biggest ranking edges:");
    expect(text).toContain("Goals Scored:");
    expect(text).toMatch(/\d+ rank edge/);
  });
});
