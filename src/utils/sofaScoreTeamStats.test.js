import {
  mergeTeamStatsFromTopTeams,
  normalizeTeamStatistics,
  resolveTeamStatistics,
} from "./sofaScoreTeamStats";

describe("sofaScoreTeamStats", () => {
  const topTeamsData = {
    topTeams: {
      bigChances: [
        {
          team: { id: 1, name: "England" },
          statistics: { bigChances: 8, matches: 2 },
        },
      ],
      fastBreaks: [
        {
          team: { id: 1, name: "England" },
          statistics: { fastBreaks: 5, matches: 2 },
        },
      ],
      goalsScored: [
        {
          team: { id: 2, name: "France" },
          statistics: { goalsScored: 4, matches: 2 },
        },
      ],
    },
  };

  test("mergeTeamStatsFromTopTeams merges category values for a team", () => {
    expect(mergeTeamStatsFromTopTeams(topTeamsData, 1)).toEqual({
      bigChances: 8,
      fastBreaks: 5,
      matches: 2,
    });
  });

  test("normalizeTeamStatistics maps industry stat website aliases", () => {
    expect(
      normalizeTeamStatistics({
        bigChancesCreated: 6,
        fastBreaks: 3,
        averageRating: 7.1,
      })
    ).toEqual({
      bigChancesCreated: 6,
      bigChances: 6,
      fastBreaks: 3,
      fastBreakShots: 3,
      averageRating: 7.1,
      avgRating: 7.1,
    });
  });

  test("resolveTeamStatistics prefers team endpoint values over top teams", () => {
    expect(
      resolveTeamStatistics(
        { statistics: { bigChances: 10, matches: 2 } },
        topTeamsData,
        1
      )
    ).toEqual({
      bigChances: 10,
      fastBreaks: 5,
      matches: 2,
      fastBreakShots: 5,
    });
  });
});
