import { buildPremierLeaguePreviewJsonLd } from "./premierLeagueSeo";

describe("buildPremierLeaguePreviewJsonLd", () => {
  test("marks the season as SportsOrganization, not SportsEvent", () => {
    const jsonLd = buildPremierLeaguePreviewJsonLd({
      overview: "Overview text for the Premier League preview page.",
      dataAsOf: "2026-08-05",
      generatedAt: "2026-08-05T19:00:00.000Z",
      format: { startDate: "2026-08-21", endDate: "2027-05-30" },
    });

    expect(jsonLd["@type"]).toBe("Article");
    expect(jsonLd.about["@type"]).toBe("SportsOrganization");
    expect(jsonLd.about.name).toBe("Premier League");
    expect(jsonLd.about).not.toHaveProperty("location");
    expect(JSON.stringify(jsonLd)).not.toContain("SportsEvent");
  });
});
