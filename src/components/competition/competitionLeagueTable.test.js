import {
  buildTeamConferenceLookup,
  buildCompetitionLeagueTableViews,
  CONFERENCE_SCOPE_EAST,
  CONFERENCE_SCOPE_WEST,
  filterTeamsByConference,
  normaliseMlsConferenceName,
  resolveConferenceLeagueTeams,
  teamRowHasHomeAwaySplit,
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
    seasonConceded_home: 0,
    seasonWins_home: 1,
    seasonDraws_home: 0,
    seasonLosses_home: 0,
    seasonGoals_home: 2,
    seasonWins_away: 0,
    seasonDraws_away: 0,
    seasonLosses_away: 1,
    seasonGoals_away: 0,
    seasonGoalDifference: 1,
    wdl_record: "W",
    points: 3,
    zone: { name: null },
  };
}

describe("buildCompetitionLeagueTableViews", () => {
  test("teamRowHasHomeAwaySplit requires home and away goal splits", () => {
    expect(teamRowHasHomeAwaySplit(makeTeam("A"))).toBe(true);
    expect(teamRowHasHomeAwaySplit({ seasonWins_home: 1 })).toBe(false);
  });

  test("maps home and away columns for classic league tables", () => {
    const views = buildCompetitionLeagueTableViews(17146, {
      data: { league_table: [makeTeam("City")] },
    });

    expect(views.supportsClassicTable).toBe(true);
    expect(views.teams[0]).toMatchObject({
      HomeWins: 1,
      HomeFor: 2,
      HomeAgainst: 0,
      AwayWins: 0,
      AwayLosses: 1,
      AwayFor: 0,
      AwayAgainst: 1,
    });
  });

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

    expect(views).toMatchObject({
      mode: "grouped",
      supportsClassicTable: true,
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

    expect(views).toMatchObject({
      mode: "standard",
      supportsClassicTable: true,
      teams: [expect.objectContaining({ Name: "Overall A" })],
    });
  });

  test("uses MLS static conference fallback when provider groups are null", () => {
    const league = {
      data: {
        league_table: [
          makeTeam("Inter Miami"),
          makeTeam("LA Galaxy"),
        ],
        specific_tables: [{ table: [], groups: null }],
      },
    };

    const views = buildCompetitionLeagueTableViews(16504, league);

    expect(views).toMatchObject({
      mode: "grouped",
      teams: [
        expect.objectContaining({
          Name: "Inter Miami",
          GroupName: "Eastern Conference",
          Form: "W",
          LastXPoints: 3,
          Points: 3,
        }),
        expect.objectContaining({
          Name: "LA Galaxy",
          GroupName: "Western Conference",
          Form: "W",
          LastXPoints: 3,
          Points: 3,
        }),
      ],
    });
  });

  test("overlays MLS form from specific table onto league_table rows", () => {
    const league = {
      data: {
        league_table: [
          {
            id: 677446,
            cleanName: "Inter Miami",
            position: 2,
            points: 54,
            seasonGoalDifference: 20,
          },
          {
            id: 10,
            cleanName: "LA Galaxy",
            position: 8,
            points: 36,
            seasonGoalDifference: -4,
          },
        ],
        specific_tables: [
          {
            groups: null,
            table: [
              {
                id: 677446,
                cleanName: "Inter Miami",
                wdl_record: "wdwww",
              },
              {
                id: 10,
                cleanName: "LA Galaxy",
                wdl_record: "llwdw",
              },
            ],
          },
        ],
      },
    };

    const views = buildCompetitionLeagueTableViews(16504, league);

    expect(views.teams).toEqual([
      expect.objectContaining({
        Name: "Inter Miami",
        GroupName: "Eastern Conference",
        Position: 2,
        Points: 54,
        Form: "WDWWW",
        LastXPoints: 13,
      }),
      expect.objectContaining({
        Name: "LA Galaxy",
        GroupName: "Western Conference",
        Position: 8,
        Points: 36,
        Form: "LLWDW",
        LastXPoints: 7,
      }),
    ]);
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

  test("normalises MLS conference names", () => {
    expect(normaliseMlsConferenceName("Eastern Conference")).toBe("east");
    expect(normaliseMlsConferenceName("Western")).toBe("west");
    expect(normaliseMlsConferenceName("Supporters Shield")).toBe("overall");
  });

  test("builds conference lookups and filters competition teams", () => {
    const league = {
      data: {
        specific_tables: [
          {
            groups: [
              { name: "Eastern Conference", table: [makeTeam("Inter Miami")] },
              { name: "Western Conference", table: [makeTeam("LA Galaxy")] },
            ],
          },
        ],
      },
    };
    const views = buildCompetitionLeagueTableViews(16504, league);
    const lookup = buildTeamConferenceLookup(views);
    const teams = [
      { id: "Inter Miami", name: "Club Internacional de Fútbol Miami" },
      { id: "LA Galaxy", name: "Los Angeles Galaxy" },
    ];

    expect(filterTeamsByConference(teams, CONFERENCE_SCOPE_EAST, lookup)).toEqual([
      expect.objectContaining({ id: "Inter Miami" }),
    ]);
    expect(filterTeamsByConference(teams, CONFERENCE_SCOPE_WEST, lookup)).toEqual([
      expect.objectContaining({ id: "LA Galaxy" }),
    ]);
  });
});
