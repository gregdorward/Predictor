import { resolveFixtureTableContext } from "./groupStageTables";

const worldCupId = 16494;

const tableArray = [
  {
    id: worldCupId,
    group: "Group A",
    table: [
      { LeagueID: worldCupId, Name: "Mexico", Position: 1, GoalDifference: 2, Played: 2, Points: 6 },
      { LeagueID: worldCupId, Name: "Korea Republic", Position: 2, GoalDifference: 1, Played: 2, Points: 4 },
    ],
  },
  {
    id: worldCupId,
    group: "Group H",
    table: [
      { LeagueID: worldCupId, Name: "Spain", Position: 1, GoalDifference: 3, Played: 2, Points: 6 },
      { LeagueID: worldCupId, Name: "Uruguay", Position: 2, GoalDifference: 1, Played: 2, Points: 4 },
    ],
  },
];

describe("resolveFixtureTableContext", () => {
  it("returns the matching group table for a group-stage fixture", () => {
    const { leagueTable, competitionStage } = resolveFixtureTableContext({
      leagueId: worldCupId,
      homeTeam: "Spain",
      awayTeam: "Uruguay",
      tableArray,
      basicTableArray: [],
    });

    expect(leagueTable).toHaveLength(2);
    expect(leagueTable[0].Name).toBe("Spain");
    expect(competitionStage).toBe("Group stage - Group H");
  });

  it("returns both teams' group tables during knockouts", () => {
    const { leagueTable, competitionStage } = resolveFixtureTableContext({
      leagueId: worldCupId,
      homeTeam: "Spain",
      awayTeam: "Mexico",
      tableArray,
      basicTableArray: [],
      roundName: "Round of 32",
      matchesCompletedMinimum: 4,
      gameWeek: 4,
    });

    expect(leagueTable).toHaveLength(2);
    expect(leagueTable[0].group).toBe("Group H");
    expect(leagueTable[1].group).toBe("Group A");
    expect(competitionStage).toBe("Round of 32");
  });

  it("infers knockout stage when teams come from different groups", () => {
    const { competitionStage } = resolveFixtureTableContext({
      leagueId: worldCupId,
      homeTeam: "Brazil",
      awayTeam: "Japan",
      tableArray: [
        ...tableArray,
        {
          id: worldCupId,
          group: "Group C",
          table: [
            { LeagueID: worldCupId, Name: "Brazil", Position: 1, GoalDifference: 3, Played: 3, Points: 9 },
          ],
        },
        {
          id: worldCupId,
          group: "Group F",
          table: [
            { LeagueID: worldCupId, Name: "Japan", Position: 2, GoalDifference: 1, Played: 3, Points: 4 },
          ],
        },
      ],
      basicTableArray: [],
      matchesCompletedMinimum: 4,
      gameWeek: 4,
    });

    expect(competitionStage).toBe("Round of 32");
  });

  it("falls back to the standard league table for domestic leagues", () => {
    const basicTableArray = [
      {
        id: 7704,
        table: [{ Name: "Arsenal", Position: 1, Points: 80 }],
      },
    ];

    const { leagueTable, competitionStage } = resolveFixtureTableContext({
      leagueId: 7704,
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      tableArray: [],
      basicTableArray,
    });

    expect(leagueTable).toHaveLength(1);
    expect(leagueTable[0].Name).toBe("Arsenal");
    expect(competitionStage).toBeNull();
  });
});
