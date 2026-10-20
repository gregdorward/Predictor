import { buildCompetitionCrossRankInsights } from "./competitionCrossRankings";

function row(slug, overrides = {}) {
  return {
    slug,
    name: slug,
    avgGoals: 2.5,
    homeWin: 45,
    draw: 25,
    awayWin: 30,
    btts: 50,
    ...overrides,
  };
}

describe("buildCompetitionCrossRankInsights", () => {
  test("returns empty when overview is thin", () => {
    expect(buildCompetitionCrossRankInsights(null, "premier-league")).toEqual([]);
    expect(
      buildCompetitionCrossRankInsights({ competitions: [row("a")] }, "a")
    ).toEqual([]);
  });

  test("highlights a top goals league", () => {
    const competitions = Array.from({ length: 12 }, (_, index) =>
      row(`league-${index}`, { avgGoals: 2 + index * 0.1 })
    );
    competitions.push(row("premier-league", { avgGoals: 3.5 }));

    const insights = buildCompetitionCrossRankInsights(
      { competitions },
      "premier-league"
    );

    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].before).toMatch(/highest-scoring/);
    expect(insights[0].href).toBe("/competitions/compare/");
  });
});
