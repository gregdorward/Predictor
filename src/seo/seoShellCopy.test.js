import {
  buildCompetitionSeoParagraphs,
  buildCompetitionTableRows,
  buildFixtureSeoParagraphs,
} from "./seoShellCopy";

function standing(name, position, extras = {}) {
  return {
    id: position,
    cleanName: name,
    name,
    leaguePosition_overall: position,
    seasonMatchesPlayed_overall: 5,
    seasonGoalDifference_overall: extras.gd ?? 0,
    seasonWinsNum_overall: extras.wins ?? 1,
    seasonDrawsNum_overall: extras.draws ?? 0,
    seasonBTTSPercentage_overall: extras.btts ?? 40,
    seasonOver25Percentage_overall: extras.over25 ?? 50,
  };
}

describe("seoShellCopy", () => {
  test("builds competition copy from the table leader and live rates", () => {
    const paragraphs = buildCompetitionSeoParagraphs({
      name: "Premier League",
      country: "England",
      season: "2025/2026",
      avgGoals: "2.85",
      btts: "54.0%",
      over25: "58.0%",
      homeWin: "44.0%",
      draw: "24.0%",
      awayWin: "32.0%",
      tableLeader: { name: "Manchester City", points: 15, played: 5 },
      updatedOn: "21 September 2026",
    });

    const text = paragraphs.join(" ");
    expect(text).toContain("Manchester City lead the Premier League on 15 points");
    expect(text).toContain("both teams have scored");
    expect(text).toContain("Figures as of 21 September 2026");
    expect(text).not.toMatch(/load below|interactive view/);
    expect(text).not.toMatch(/–/);
  });

  test("states league rates when there is no standings table", () => {
    const paragraphs = buildCompetitionSeoParagraphs({
      name: "Champions League",
      country: "Europe",
      season: "2025/2026",
      avgGoals: "2.90",
      btts: "51.0%",
      over25: "49.0%",
    });

    const text = paragraphs.join(" ");
    expect(text).toContain("Across the Champions League season so far");
    expect(text).toContain("2.90 goals");
    expect(text).not.toMatch(/load below|interactive view/);
  });

  test("avoids zero-stat prose when the season has not started", () => {
    const paragraphs = buildCompetitionSeoParagraphs({
      name: "Premier League",
      country: "England",
      season: "2026/2027",
      seasonStarted: false,
    });

    const text = paragraphs.join(" ");
    expect(text).toContain("still getting underway");
    expect(text).not.toContain("averaging");
    expect(text).not.toContain("0.00");
    expect(text).not.toContain("0.0%");
    expect(text).not.toMatch(/load below|interactive view/);
  });

  test("builds a complete league table and skips cups with no positions", () => {
    const table = buildCompetitionTableRows([
      standing("Arsenal", 2, { wins: 4, draws: 0, gd: 4 }),
      standing("Manchester City", 1, { wins: 5, draws: 0, gd: 8 }),
      standing("Brighton", 3, { wins: 3, draws: 1, gd: 11 }),
      standing("Brentford", 4, { wins: 3, draws: 0, gd: 6 }),
    ]);

    expect(table.map((row) => row.name)).toEqual([
      "Manchester City",
      "Arsenal",
      "Brighton",
      "Brentford",
    ]);
    expect(table[0].points).toBe(15);

    const cup = buildCompetitionTableRows([
      standing("Club A", 0),
      standing("Club B", 0),
      standing("Club C", 0),
      standing("Club D", 0),
    ]);
    expect(cup).toEqual([]);
  });

  test("builds short fixture copy with competition context", () => {
    const paragraphs = buildFixtureSeoParagraphs({
      home: "England",
      away: "Argentina",
      league: "World Cup 2026",
    });

    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toContain("England vs Argentina");
    expect(paragraphs[0]).toContain("World Cup 2026");
    expect(paragraphs.join(" ")).not.toMatch(/–/);
  });
});
