import { additiveFromRatings, additiveLambdas } from "./additiveLambda.js";
import { clearMaherRatingCache } from "./maherRatings.js";

describe("additiveLambda", () => {
  afterEach(() => {
    clearMaherRatingCache();
  });

  test("additiveFromRatings is linear in rating deltas", () => {
    // μ=1.5, att=1.2, def=1.1 → 1.5*(1.2+1.1-1)=1.95
    expect(additiveFromRatings(1.5, 1.2, 1.1)).toBeCloseTo(1.95, 5);
    // Product Maher would be 1.5*1.2*1.1=1.98 — close when near 1
    expect(additiveFromRatings(1.5, 1.5, 1.5)).toBeCloseTo(3.0, 5);
    // Product would be 1.5*1.5*1.5=3.375 — additive is calmer
  });

  test("additiveLambdas favours strong attack vs weak defence", () => {
    const leagueId = 55;
    const allLeagueResults = [
      {
        id: leagueId,
        fixtures: [
          {
            status: "complete",
            date_unix: 1_700_000_000,
            home_name: "Strong",
            away_name: "Weak",
            homeGoalCount: 3,
            awayGoalCount: 0,
            team_a_xg: 2.5,
            team_b_xg: 0.5,
          },
          {
            status: "complete",
            date_unix: 1_700_100_000,
            home_name: "Strong",
            away_name: "Mid",
            homeGoalCount: 2,
            awayGoalCount: 1,
            team_a_xg: 2.0,
            team_b_xg: 1.0,
          },
          {
            status: "complete",
            date_unix: 1_700_200_000,
            home_name: "Mid",
            away_name: "Weak",
            homeGoalCount: 2,
            awayGoalCount: 0,
            team_a_xg: 1.6,
            team_b_xg: 0.7,
          },
        ],
      },
    ];
    const λ = additiveLambdas({
      allLeagueResults,
      leagueId,
      asOfUnix: 1_700_300_000,
      homeTeam: "Strong",
      awayTeam: "Weak",
      averageGoalsHome: 1.4,
      averageGoalsAway: 1.1,
    });
    expect(λ).not.toBeNull();
    expect(λ.home).toBeGreaterThan(λ.away);
  });
});
