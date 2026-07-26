import {
  buildCompetitionSeoShell,
  isCompetitionSeasonEmpty,
} from "./CompetitionSeoShell";

describe("competition empty-season SSR", () => {
  test("detects all-zero market block as empty", () => {
    expect(
      isCompetitionSeasonEmpty({
        seasonAVG_overall: 0,
        seasonBTTSPercentage: 0,
        seasonOver25Percentage_overall: 0,
        seasonUnder25Percentage_overall: 0,
      })
    ).toBe(true);
  });

  test("keeps in-season competitions with live averages", () => {
    expect(
      isCompetitionSeasonEmpty({
        seasonAVG_overall: 3.24,
        seasonBTTSPercentage: 60,
        seasonOver25Percentage_overall: 62,
        seasonUnder25Percentage_overall: 38,
      })
    ).toBe(false);
  });

  test("buildCompetitionSeoShell omits zero stats for empty seasons", () => {
    const shell = buildCompetitionSeoShell(
      {
        english_name: "Premier League",
        country: "England",
        season: "2026/2027",
        seasonAVG_overall: 0,
        seasonBTTSPercentage: 0,
        seasonOver25Percentage_overall: 0,
        seasonUnder25Percentage_overall: 0,
        homeWinPercentage: 0,
        drawPercentage: 0,
        awayWinPercentage: 0,
        team: {},
      },
      { slug: "premier-league", name: "Premier League" }
    );

    expect(shell.seasonStarted).toBe(false);
    expect(shell.avgGoals).toBeNull();
    expect(shell.btts).toBeNull();
    expect(shell.topOver25Teams).toEqual([]);
  });
});
