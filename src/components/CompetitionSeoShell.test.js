import { buildCompetitionSeoShell } from "../components/CompetitionSeoShell";

describe("buildCompetitionSeoShell payload size", () => {
  test("keeps highlight teams to a handful of fields", () => {
    const bulkyTeam = {
      id: 1,
      name: "Example FC",
      english_name: "Example FC",
      seasonOver25Percentage_overall: 62.5,
      seasonBTTSPercentage_overall: 55,
      seasonUnder25Percentage_overall: 40,
      ...Object.fromEntries(
        Array.from({ length: 200 }, (_, i) => [`stat_${i}`, i])
      ),
    };

    const shell = buildCompetitionSeoShell(
      {
        english_name: "Example League",
        country: "Testland",
        season: "2026",
        seasonAVG_overall: 2.7,
        seasonBTTSPercentage: 50,
        seasonOver25Percentage_overall: 55,
        seasonUnder25Percentage_overall: 45,
        homeWinPercentage: 40,
        drawPercentage: 25,
        awayWinPercentage: 35,
        teams: [bulkyTeam],
      },
      { slug: "example-league", name: "Example League" }
    );

    expect(Object.keys(shell.topOver25Teams[0]).sort()).toEqual([
      "english_name",
      "id",
      "name",
      "seasonOver25Percentage_overall",
    ]);
    expect(JSON.stringify(shell).length).toBeLessThan(5000);
  });
});
