import {
  COMPETITION_ID_ALIASES,
  FEATURED_COMPETITION_SLUGS,
  getCompetitionById,
  getCompetitionUrl,
  getRelatedCompetitionLinks,
  resolveCompetitionParam,
  resolveFootyStatsLeagueId,
} from "./competitionCatalog";

describe("competitionCatalog removals and aliases", () => {
  test("does not expose World Cup qualifier or finished tournament URLs", () => {
    expect(getCompetitionUrl("world-cup-europe-qualifiers")).toBeNull();
    expect(getCompetitionUrl("world-cup-south-america-qualifiers")).toBeNull();
    expect(getCompetitionUrl("world-cup-2026")).toBeNull();
    expect(getCompetitionUrl(13964)).toBeNull();
    expect(getCompetitionUrl(10121)).toBeNull();
    expect(getCompetitionUrl(16494)).toBeNull();
  });

  test("redirects removed World Cup slugs to competitions hub", () => {
    expect(resolveCompetitionParam("world-cup-europe-qualifiers")).toEqual({
      redirectTo: "/competitions/",
    });
    expect(
      resolveCompetitionParam("world-cup-south-america-qualifiers")
    ).toEqual({
      redirectTo: "/competitions/",
    });
    expect(resolveCompetitionParam("world-cup-2026")).toEqual({
      redirectTo: "/competitions/",
    });
  });

  test("aliases retired season IDs to the current competition", () => {
    expect(COMPETITION_ID_ALIASES[15115]).toBe(17217);
    expect(getCompetitionById(15115)?.slug).toBe("primeira-liga");
    expect(getCompetitionUrl(15115)).toBe("/competition/primeira-liga/");
    expect(resolveCompetitionParam("15115")).toEqual({
      redirectTo: "/competition/primeira-liga/",
    });
  });

  test("aliases Aug 2026 season rollovers to current competition IDs", () => {
    expect(COMPETITION_ID_ALIASES[15844]).toBe(17403);
    expect(getCompetitionById(15844)?.slug).toBe("national-league-south");
    expect(resolveCompetitionParam("15844")).toEqual({
      redirectTo: "/competition/national-league-south/",
    });
    expect(COMPETITION_ID_ALIASES[15632]).toBe(17404);
    expect(getCompetitionById(15632)?.slug).toBe("serie-b");
    expect(COMPETITION_ID_ALIASES[12772]).toBe(17426);
    expect(getCompetitionById(12772)?.slug).toBe("saudi-pro-league");
    expect(resolveFootyStatsLeagueId(15844)).toBe(17403);
    expect(resolveFootyStatsLeagueId(17403)).toBe(17403);
  });

  test("does not link unavailable competitions", () => {
    expect(getCompetitionUrl("usl")).toBeNull();
    expect(resolveCompetitionParam("usl")).toEqual({
      redirectTo: "/competitions/",
    });
  });

  test("related competition links are capped to featured leagues", () => {
    const links = getRelatedCompetitionLinks("premier-league");
    expect(links.length).toBeLessThanOrEqual(
      FEATURED_COMPETITION_SLUGS.length - 1
    );
    expect(links.some((link) => link.href.includes("premier-league"))).toBe(
      false
    );
  });
});
