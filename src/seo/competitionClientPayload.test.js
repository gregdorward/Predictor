import { buildCompetitionClientPayload } from "./competitionClientPayload";

describe("buildCompetitionClientPayload", () => {
  test("keeps chart fields and trims team objects", () => {
    const bulkyTeam = {
      id: 1,
      name: "Arsenal",
      seasonOver25Percentage_overall: 55,
      seasonMatchesPlayed_overall: 20,
      hugeNestedBlob: { matches: new Array(500).fill({ x: 1 }) },
    };

    const payload = buildCompetitionClientPayload({
      english_name: "Premier League",
      seasonAVG_overall: 2.8,
      seasonOver25Percentage_overall: 52,
      homeWinPercentage: 44,
      drawPercentage: 24,
      awayWinPercentage: 32,
      top_scorers: [{ player_name: "A", goals_overall: 10 }],
      teams: [bulkyTeam],
    });

    expect(payload.english_name).toBe("Premier League");
    expect(payload.seasonAVG_overall).toBe(2.8);
    expect(payload.top_scorers).toHaveLength(1);
    expect(payload.teams).toHaveLength(1);
    expect(payload.teams[0]).toEqual({
      id: 1,
      name: "Arsenal",
      seasonOver25Percentage_overall: 55,
      seasonMatchesPlayed_overall: 20,
    });
    expect(payload.teams[0].hugeNestedBlob).toBeUndefined();

    const serialized = JSON.stringify(payload);
    const full = JSON.stringify({ teams: [bulkyTeam] });
    expect(serialized.length).toBeLessThan(full.length / 10);
  });

  test("keeps slim MLS conference groups for client conference switch", () => {
    const payload = buildCompetitionClientPayload({
      id: 16504,
      english_name: "MLS",
      specific_tables: [
        {
          groups: [
            {
              name: "Eastern Conference",
              table: [
                {
                  id: 1,
                  name: "Inter Miami",
                  matchesPlayed: 27,
                  points: 46,
                  wdl_record: "WWDLL",
                  hugeNestedBlob: { matches: new Array(500).fill({ x: 1 }) },
                },
              ],
            },
            {
              name: "Western Conference",
              table: [{ id: 2, name: "LA Galaxy", points: 36 }],
            },
          ],
        },
      ],
    });

    expect(payload.specific_tables).toEqual([
      {
        groups: [
          {
            name: "Eastern Conference",
            round: null,
            table: [
              {
                id: 1,
                name: "Inter Miami",
                matchesPlayed: 27,
                points: 46,
                wdl_record: "WWDLL",
              },
            ],
          },
          {
            name: "Western Conference",
            round: null,
            table: [{ id: 2, name: "LA Galaxy", points: 36 }],
          },
        ],
      },
    ]);
    expect(
      payload.specific_tables[0].groups[0].table[0].hugeNestedBlob
    ).toBeUndefined();
  });

  test("keeps MLS table fields on trimmed teams for static conference fallback", () => {
    const payload = buildCompetitionClientPayload({
      id: 16504,
      english_name: "MLS",
      teams: [
        {
          id: 677446,
          name: "Inter Miami",
          matchesPlayed: 27,
          seasonWins_overall: 14,
          seasonDraws_overall: 4,
          seasonLosses_overall: 9,
          points: 46,
          wdl_record: "WWDLL",
          hugeNestedBlob: { matches: new Array(500).fill({ x: 1 }) },
        },
      ],
    });

    expect(payload.teams[0]).toEqual({
      id: 677446,
      name: "Inter Miami",
      matchesPlayed: 27,
      seasonWins_overall: 14,
      seasonDraws_overall: 4,
      seasonLosses_overall: 9,
      points: 46,
      wdl_record: "WWDLL",
    });
  });

  test("keeps slim MLS league table rows for conference standings", () => {
    const payload = buildCompetitionClientPayload({
      id: 16504,
      english_name: "MLS",
      league_table: [
        {
          id: 677447,
          cleanName: "Nashville SC",
          matchesPlayed: 27,
          seasonWins_overall: 18,
          seasonDraws_overall: 6,
          seasonLosses_overall: 3,
          seasonGoals: 55,
          seasonConceded_home: 12,
          seasonConceded_away: 9,
          seasonGoalDifference: 34,
          points: 60,
          position: 1,
          hugeNestedBlob: { matches: new Array(500).fill({ x: 1 }) },
        },
      ],
      specific_tables: [
        {
          groups: null,
          table: [
            {
              id: 677447,
              wdl_record: "wdwwwlwwwddwwwwwldwwwwdldww",
            },
          ],
        },
      ],
    });

    expect(payload.league_table).toEqual([
      {
        id: 677447,
        cleanName: "Nashville SC",
        matchesPlayed: 27,
        seasonWins_overall: 18,
        seasonDraws_overall: 6,
        seasonLosses_overall: 3,
        seasonGoals: 55,
        seasonConceded_home: 12,
        seasonConceded_away: 9,
        seasonGoalDifference: 34,
        points: 60,
        position: 1,
        wdl_record: "wdwwwlwwwddwwwwwldwwwwdldww",
      },
    ]);
  });
});
