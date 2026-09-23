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
});
