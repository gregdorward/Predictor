import { getDefaultStyleMapSlugs } from "./competitionOverviewData";

describe("getDefaultStyleMapSlugs", () => {
  const competitions = [
    { slug: "mls", name: "MLS" },
    { slug: "premier-league", name: "Premier League" },
    { slug: "veikkausliiga", name: "Veikkausliiga" },
    { slug: "la-liga", name: "La Liga" },
    { slug: "serie-a", name: "Serie A" },
    { slug: "bundesliga", name: "Bundesliga" },
    { slug: "ligue-1", name: "Ligue 1" },
    { slug: "champions-league", name: "Champions League" },
    { slug: "eredivisie", name: "Eredivisie" },
    { slug: "primeira-liga", name: "Primeira Liga" },
    { slug: "championship", name: "Championship" },
    { slug: "j-league", name: "J League" },
  ];

  it("returns priority slugs in editorial order up to the limit", () => {
    expect(getDefaultStyleMapSlugs(competitions, 10)).toEqual([
      "premier-league",
      "la-liga",
      "serie-a",
      "bundesliga",
      "ligue-1",
      "champions-league",
      "eredivisie",
      "primeira-liga",
      "championship",
      "mls",
    ]);
  });

  it("skips priority slugs that are not in the competition list", () => {
    expect(getDefaultStyleMapSlugs([{ slug: "mls" }, { slug: "premier-league" }], 10)).toEqual([
      "premier-league",
      "mls",
    ]);
  });

  it("returns empty when there are no competitions", () => {
    expect(getDefaultStyleMapSlugs([], 10)).toEqual([]);
  });
});
