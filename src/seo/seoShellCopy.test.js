import {
  buildCompetitionSeoParagraphs,
  buildFixtureSeoParagraphs,
} from "./seoShellCopy";

describe("seoShellCopy", () => {
  test("builds competition copy with live market stats", () => {
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
      topOver25Teams: [{ name: "Liverpool" }],
      topBttsTeams: [{ name: "Bournemouth" }],
    });

    expect(paragraphs.join(" ")).toContain("Premier League");
    expect(paragraphs.join(" ")).toContain("both teams have scored");
    expect(paragraphs.join(" ")).not.toMatch(/–/);
  });

  test("builds fixture copy with competition context", () => {
    const paragraphs = buildFixtureSeoParagraphs({
      home: "England",
      away: "Argentina",
      league: "World Cup 2026",
    });

    expect(paragraphs.join(" ")).toContain("England vs Argentina");
    expect(paragraphs.join(" ")).toContain("methodology page");
    expect(paragraphs.join(" ")).not.toContain("For planning purposes");
    expect(paragraphs.join(" ")).not.toContain("for any betting decision");
    expect(paragraphs.join(" ")).not.toMatch(/–/);
  });
});
