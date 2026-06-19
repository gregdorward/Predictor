import { buildFixtureHeadToHead } from "./fixturePageH2h";

describe("buildFixtureHeadToHead", () => {
  const fixture = {
    homeID: 2053,
    awayID: 2061,
    home_name: "Home FC",
    away_name: "Away United",
    h2h: {
      team_a_id: 2053,
      team_b_id: 2061,
      previous_matches_results: {
        team_a_win_home: 4,
        team_a_win_away: 7,
        team_b_win_home: 7,
        team_b_win_away: 5,
        draw: 12,
        team_a_wins: 11,
        team_b_wins: 12,
        totalMatches: 35,
        team_a_win_percent: 31,
        team_b_win_percent: 34,
      },
      previous_matches_ids: [
        {
          team_a_id: 2053,
          team_b_id: 2061,
          team_a_goals: 1,
          team_b_goals: 2,
          date_unix: 1700000000,
        },
        {
          team_a_id: 2061,
          team_b_id: 2053,
          team_a_goals: 0,
          team_b_goals: 0,
          date_unix: 1710000000,
        },
      ],
    },
  };

  test("maps summary to upcoming fixture home and away teams", () => {
    const result = buildFixtureHeadToHead(fixture);

    expect(result.summary).toEqual({
      totalMatches: 35,
      homeTeamWins: 11,
      awayTeamWins: 12,
      draws: 12,
      homeWinPercent: 31,
      awayWinPercent: 34,
    });
  });

  test("returns the four most recent meetings with scores", () => {
    const result = buildFixtureHeadToHead(fixture);

    expect(result.recentMatches).toHaveLength(2);
    expect(result.recentMatches[0].homeGoals).toBe(0);
    expect(result.recentMatches[0].awayGoals).toBe(0);
    expect(result.recentMatches[1].homeGoals).toBe(1);
    expect(result.recentMatches[1].awayGoals).toBe(2);
  });

  test("returns null when no h2h history exists", () => {
    expect(buildFixtureHeadToHead({ homeID: 1, awayID: 2 })).toBeNull();
    expect(
      buildFixtureHeadToHead({
        homeID: 1,
        awayID: 2,
        h2h: { previous_matches_results: { totalMatches: 0 } },
      })
    ).toBeNull();
  });
});
