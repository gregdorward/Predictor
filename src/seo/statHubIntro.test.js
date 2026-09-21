import {
  buildBttsFixturesIntro,
  buildFixturesHighIntro,
  buildHighestScoringLeaguesIntro,
  STAT_PAGE_SEO,
} from "./statPageSeoConfig";

describe("stat hub intros", () => {
  test("names the live BTTS leader", () => {
    const intro = buildBttsFixturesIntro([
      { name: "Bournemouth", bttsPercentage: 72, played: 12 },
      { name: "Leeds", bttsPercentage: 40, played: 12 },
    ]);

    expect(intro).toContain("Bournemouth lead the Both Teams To Score table at 72%");
    expect(intro).toContain("from 12 matches");
  });

  test("names the live Over 2.5 team", () => {
    const intro = buildFixturesHighIntro([
      { team: "Leeds United", averageGoals: 3.4, over25Percentage: 80 },
      { team: "Burnley", averageGoals: 2.1, over25Percentage: 40 },
    ]);

    expect(intro).toContain("Leeds United average 3.4 goals");
    expect(intro).toContain("80%");
  });

  test("names the highest-scoring league", () => {
    const intro = buildHighestScoringLeaguesIntro([
      { league: "Eredivisie", averageGoals: 3.21, over25Percentage: 64 },
      { league: "Ligue 1", averageGoals: 2.4, over25Percentage: 48 },
    ]);

    expect(intro).toContain("Eredivisie are the highest-scoring league");
    expect(intro).toContain("3.21 goals");
  });

  test("falls back to the static intro when rows are empty", () => {
    expect(buildBttsFixturesIntro([])).toBe(STAT_PAGE_SEO.bttsFixtures.intro);
    expect(buildFixturesHighIntro([])).toBe(STAT_PAGE_SEO.fixturesHigh.intro);
    expect(buildHighestScoringLeaguesIntro([])).toBe(
      STAT_PAGE_SEO.highestScoringLeagues.intro
    );
  });
});
