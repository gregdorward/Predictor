import {
  COMPETITION_ID_ALIASES,
  getCompetitionById,
  getCompetitionUrl,
  resolveCompetitionParam,
} from "./competitionCatalog";

describe("competitionCatalog removals and aliases", () => {
  test("does not expose World Cup qualifier competition URLs", () => {
    expect(getCompetitionUrl("world-cup-europe-qualifiers")).toBeNull();
    expect(getCompetitionUrl("world-cup-south-america-qualifiers")).toBeNull();
    expect(getCompetitionUrl(13964)).toBe("/competition/world-cup-2026/");
    expect(getCompetitionUrl(10121)).toBe("/competition/world-cup-2026/");
  });

  test("redirects removed qualifier slugs to World Cup 2026", () => {
    expect(resolveCompetitionParam("world-cup-europe-qualifiers")).toEqual({
      redirectTo: "/competition/world-cup-2026/",
    });
    expect(
      resolveCompetitionParam("world-cup-south-america-qualifiers")
    ).toEqual({
      redirectTo: "/competition/world-cup-2026/",
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

  test("does not link unavailable competitions", () => {
    expect(getCompetitionUrl("usl")).toBeNull();
    expect(resolveCompetitionParam("usl")).toEqual({
      redirectTo: "/competitions/",
    });
  });
});
