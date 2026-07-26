import {
  filterLeagueRows,
  mapLowestScoringLeagues,
  mapHighestScoringTeams,
  mapBttsTeams,
} from "./statPageData";

describe("statPageData mappers", () => {
  test("maps under25 league payload", () => {
    const rows = mapLowestScoringLeagues({
      data: {
        top_leagues: {
          data: [
            {
              name: "Serie A",
              country: "Italy",
              seasonAVG_overall: 2.1,
              seasonUnder25Percentage_overall: 55,
              division: 1,
              id: 1,
            },
          ],
        },
      },
    });

    expect(rows).toEqual([
      {
        league: "Serie A",
        leagueCountry: "Italy",
        averageGoals: 2.1,
        under25Percentage: 55,
        division: 1,
        leagueId: 1,
      },
    ]);
  });

  test("filters leagues to allowed countries and divisions", () => {
    const filtered = filterLeagueRows([
      {
        league: "Premier League",
        leagueCountry: "England",
        averageGoals: 2.5,
        under25Percentage: 40,
        division: 1,
        leagueId: 1,
      },
      {
        league: "Obscure",
        leagueCountry: "Nowhere",
        averageGoals: 1.1,
        under25Percentage: 80,
        division: 1,
        leagueId: 2,
      },
      {
        league: "National",
        leagueCountry: "England",
        averageGoals: 2.2,
        under25Percentage: 50,
        division: 5,
        leagueId: 3,
      },
    ]);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].league).toBe("Premier League");
  });

  test("maps over25 team payload", () => {
    const rows = mapHighestScoringTeams({
      data: {
        top_teams: {
          data: [
            {
              full_name: "Arsenal",
              next_match_team: "Chelsea",
              country: "England",
              seasonAVG_overall: 2.9,
              seasonOver25Percentage_overall: 70,
              division: 1,
              id: 9,
            },
          ],
        },
      },
    });

    expect(rows[0].team).toBe("Arsenal");
    expect(rows[0].over25Percentage).toBe(70);
  });

  test("maps missing btts team fields to null for Next serialization", () => {
    const rows = mapBttsTeams({
      data: {
        top_teams: {
          data: [
            {
              name: "Arsenal",
              country: "England",
              seasonBTTSPercentage_overall: 62,
              seasonMatchesPlayed_overall: 20,
            },
          ],
        },
      },
    });

    expect(rows[0].progress).toBeNull();
    expect(rows[0].opponent).toBeNull();
    expect(rows[0].odds).toBeNull();
  });
});
