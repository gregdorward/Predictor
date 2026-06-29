import {
  buildRankingsSections,
  getBiggestRankingDisparities,
  getRankEdgeState,
  getSectionSummary,
  formatRankingsShareText,
} from "./rankingsInsights";

const ranksHome = {
  goalsScored: { rank: 2 },
  cleanSheets: { rank: 4 },
  shotsOnTarget: { rank: 8 },
  goalsConceded: { rank: 10 },
  averageBallPossession: { rank: 6 },
  tackles: { rank: 3 },
  avgRating: { rank: 5 },
  fouls: { rank: 20 },
};

const ranksAway = {
  goalsScored: { rank: 28 },
  cleanSheets: { rank: 31 },
  shotsOnTarget: { rank: 30 },
  goalsConceded: { rank: 25 },
  averageBallPossession: { rank: 32 },
  tackles: { rank: 18 },
  avgRating: { rank: 22 },
  fouls: { rank: 8 },
};

describe("rankingsInsights", () => {
  test("buildRankingsSections groups metrics by category", () => {
    const sections = buildRankingsSections(ranksHome);
    const titles = sections.map((section) => section.title);

    expect(titles).toContain("Attacking");
    expect(titles).toContain("Defensive");
    expect(titles).toContain("Passing");
    expect(titles).toContain("Miscellaneous");
  });

  test("getSectionSummary counts category leaders", () => {
    const sections = buildRankingsSections(ranksHome);
    const attacking = sections.find((section) => section.title === "Attacking");
    const summary = getSectionSummary(
      attacking.metrics,
      ranksHome,
      ranksAway,
      "Mexico",
      "South Africa"
    );

    expect(summary.leader).toBe("Mexico leads");
    expect(summary.home).toBeGreaterThan(summary.away);
  });

  test("getBiggestRankingDisparities sorts by edge and filters subtle gaps", () => {
    const disparities = getBiggestRankingDisparities(
      ranksHome,
      ranksAway,
      48,
      { limit: 5, minIntensity: "medium" }
    );

    expect(disparities.length).toBeGreaterThan(0);
    expect(disparities[0].key).toBe("cleanSheets");
    expect(disparities[0].edge).toBe(27);
    expect(disparities.some((item) => item.key === "goalsScored")).toBe(true);
    expect(disparities.every((item) => item.edge >= 3)).toBe(true);
  });

  test("inverted metrics treat higher rank as better for fouls and cards", () => {
    const foulsState = getRankEdgeState(20, 8, 48, "fouls");
    const goalsState = getRankEdgeState(20, 8, 48, "goalsScored");

    expect(foulsState.tone).toBe("home");
    expect(goalsState.tone).toBe("away");

    const sections = buildRankingsSections(ranksHome);
    const miscellaneous = sections.find(
      (section) => section.title === "Miscellaneous"
    );
    const summary = getSectionSummary(
      miscellaneous.metrics,
      ranksHome,
      ranksAway,
      "Mexico",
      "South Africa"
    );

    expect(summary.home).toBeGreaterThan(summary.away);
  });

  test("formatRankingsShareText renders markdown and plain text", () => {
    const markdown = formatRankingsShareText({
      ranksHome,
      ranksAway,
      teamALabel: "Mexico",
      teamBLabel: "South Africa",
      totalTeams: 48,
      format: "markdown",
    });
    const text = formatRankingsShareText({
      ranksHome,
      ranksAway,
      teamALabel: "Mexico",
      teamBLabel: "South Africa",
      totalTeams: 48,
      format: "text",
    });

    expect(markdown).toContain("### Competition Rankings");
    expect(markdown).toContain("Mexico leads");
    expect(text).toContain("Competition rankings:");
    expect(text).toContain("Biggest ranking edges:");
  });
});
