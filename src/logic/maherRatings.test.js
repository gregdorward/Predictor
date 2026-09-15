import {
  fitMaherRatings,
  maherLambdas,
  clearMaherRatingCache,
} from "./maherRatings.js";

describe("maherRatings", () => {
  afterEach(() => {
    clearMaherRatingCache();
  });

  const leagueId = 1234;
  const allLeagueResults = [
    {
      id: leagueId,
      fixtures: [
        {
          id: 1,
          status: "complete",
          date_unix: 1_700_000_000,
          home_name: "Alpha",
          away_name: "Beta",
          homeGoalCount: 2,
          awayGoalCount: 1,
          team_a_xg: 1.8,
          team_b_xg: 0.9,
        },
        {
          id: 2,
          status: "complete",
          date_unix: 1_700_100_000,
          home_name: "Alpha",
          away_name: "Gamma",
          homeGoalCount: 3,
          awayGoalCount: 0,
          team_a_xg: 2.4,
          team_b_xg: 0.6,
        },
        {
          id: 3,
          status: "complete",
          date_unix: 1_700_200_000,
          home_name: "Beta",
          away_name: "Gamma",
          homeGoalCount: 1,
          awayGoalCount: 1,
          team_a_xg: 1.1,
          team_b_xg: 1.0,
        },
      ],
    },
  ];

  test("strong attack side gets att > 1", () => {
    const fitted = fitMaherRatings(allLeagueResults, leagueId, 1_700_300_000);
    const alpha = fitted.byTeam.get("Alpha");
    const gamma = fitted.byTeam.get("Gamma");
    expect(alpha.att).toBeGreaterThan(1);
    expect(gamma.att).toBeLessThan(1);
  });

  test("maherLambdas favours Alpha vs Gamma", () => {
    const λ = maherLambdas({
      allLeagueResults,
      leagueId,
      asOfUnix: 1_700_300_000,
      homeTeam: "Alpha",
      awayTeam: "Gamma",
      averageGoalsHome: 1.4,
      averageGoalsAway: 1.1,
    });
    expect(λ).not.toBeNull();
    expect(λ.home).toBeGreaterThan(λ.away);
  });
});
