import {
  buildCompetitionLeagueTableViews,
  resolveConferenceLeagueTeams,
} from "./competitionLeagueTable";

function makeTeam(name) {
  return {
    id: name,
    cleanName: name,
    name,
    matchesPlayed: 1,
    seasonWins_overall: 1,
    seasonDraws_overall: 0,
    seasonLosses_overall: 0,
    seasonGoals: 2,
    seasonConceded_home: 0,
    seasonConceded_away: 1,
    seasonGoalDifference: 1,
    wdl_record: "W",
    points: 3,
    zone: { name: null },
  };
}

describe("buildCompetitionLeagueTableViews", () => {
  test("uses MLS conference groups when an overall table is also present", () => {
    const league = {
      data: {
        specific_tables: [
          {
            table: [makeTeam("Overall A"), makeTeam("Overall B")],
            groups: [
              { name: "Eastern Conference", table: [makeTeam("East A")] },
              { name: "Western Conference", table: [makeTeam("West A")] },
            ],
          },
        ],
      },
    };

    const views = buildCompetitionLeagueTableViews(16504, league);

    expect(views).toEqual({
      mode: "grouped",
      teams: [
        expect.objectContaining({
          Name: "East A",
          GroupName: "Eastern Conference",
        }),
        expect.objectContaining({
          Name: "West A",
          GroupName: "Western Conference",
        }),
      ],
    });
  });

  test("falls back to the overall table when MLS groups are unavailable", () => {
    const league = {
      data: {
        specific_tables: [
          {
            table: [makeTeam("Overall A")],
          },
        ],
      },
    };

    const views = buildCompetitionLeagueTableViews(16504, league);

    expect(views).toEqual({
      mode: "standard",
      teams: [expect.objectContaining({ Name: "Overall A" })],
    });
  });

  test("resolveConferenceLeagueTeams prefers bespoke divisions then falls back to payload", () => {
    const league = {
      data: {
        specific_tables: [
          {
            table: [makeTeam("Overall A")],
            groups: [
              { name: "Eastern Conference", table: [makeTeam("East A")] },
              { name: "Western Conference", table: [makeTeam("West A")] },
            ],
          },
        ],
      },
    };

    const fromBespoke = resolveConferenceLeagueTeams(
      16504,
      [
        {
          id: 16504,
          group: "Eastern Conference",
          table: [{ Name: "East A", LeagueID: 16504 }],
        },
      ],
      league
    );

    expect(fromBespoke).toEqual([
      expect.objectContaining({ Name: "East A", GroupName: "Eastern Conference" }),
    ]);

    const fromPayload = resolveConferenceLeagueTeams(16504, [], league);

    expect(fromPayload).toEqual([
      expect.objectContaining({ Name: "East A", GroupName: "Eastern Conference" }),
      expect.objectContaining({ Name: "West A", GroupName: "Western Conference" }),
    ]);
  });
});
