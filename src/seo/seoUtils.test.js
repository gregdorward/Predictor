import {
  buildFixtureEventStatus,
  buildFixtureJsonLd,
  buildFixtureMeta,
  buildFixtureSlug,
  buildTeamImageUrl,
  isFixtureFinished,
  parseFixtureParam,
} from "./fixtureSlug";
import {
  buildCompetitionOgCardModel,
  resolveCompetitionOgParam,
} from "./competitionOg";
import {
  buildCompetitionOgImageUrl,
  buildFixtureOgImageUrl,
  buildPremierLeague202627OgImageUrl,
  getCanonicalPathFromAsPath,
  getCanonicalUrl,
  OG_IMAGE,
} from "./pageMetaConfig";

describe("fixtureSlug", () => {
  test("builds a readable slug with match id suffix", () => {
    expect(buildFixtureSlug("Arsenal", "Chelsea", 12345)).toBe(
      "arsenal-vs-chelsea-12345"
    );
  });

  test("parses slug and numeric fixture params", () => {
    expect(parseFixtureParam("arsenal-vs-chelsea-12345")).toEqual({
      matchId: "12345",
      isNumericOnly: false,
    });
    expect(parseFixtureParam("12345")).toEqual({
      matchId: "12345",
      isNumericOnly: true,
    });
  });

  test("detects finished fixtures", () => {
    expect(isFixtureFinished({ status: "complete" })).toBe(true);
    expect(isFixtureFinished({ status: "incomplete" })).toBe(false);
  });

  test("builds FootyStats team image URLs", () => {
    expect(buildTeamImageUrl("teams/south-korea-fc-anyang.png")).toBe(
      "https://cdn.footystats.org/img/teams/south-korea-fc-anyang.png"
    );
    expect(buildTeamImageUrl("-")).toBeNull();
    expect(buildTeamImageUrl("")).toBeNull();
  });

  test("builds SportsEvent JSON-LD with required Google fields", () => {
    const fixture = {
      status: "incomplete",
      date_unix: 1783161000,
      stadium_name: "Anyang Stadium",
      stadium_location: "1023, Bisan3-dong, Dongan-gu",
      home_image: "teams/south-korea-fc-anyang.png",
      away_image: "teams/south-korea-pohang-steelers-fc.png",
    };
    const meta = buildFixtureMeta({
      home_name: "Anyang",
      away_name: "Pohang Steelers",
      competition_name: "K League 1",
    });
    const canonicalUrl =
      "https://www.soccerstatshub.com/fixture/anyang-vs-pohang-steelers-8436178/";
    const jsonLd = buildFixtureJsonLd(fixture, canonicalUrl, meta);
    const event = jsonLd["@graph"].find((node) => node["@type"] === "SportsEvent");

    expect(event.startDate).toBe("2026-07-04T10:30:00.000Z");
    expect(event.description).toContain("Anyang vs Pohang Steelers");
    expect(event.eventStatus).toBe("https://schema.org/EventScheduled");
    expect(event.location).toEqual({
      "@type": "Place",
      name: "Anyang Stadium",
      address: {
        "@type": "PostalAddress",
        streetAddress: "1023, Bisan3-dong, Dongan-gu",
      },
    });
    expect(event.image).toEqual([
      "https://cdn.footystats.org/img/teams/south-korea-fc-anyang.png",
      "https://cdn.footystats.org/img/teams/south-korea-pohang-steelers-fc.png",
    ]);
    expect(event.performer).toHaveLength(2);
    expect(event.offers).toMatchObject({
      "@type": "Offer",
      url: canonicalUrl,
      price: "0",
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
    });
  });

  test("falls back when venue and team images are missing", () => {
    const meta = buildFixtureMeta({ home_name: "Home", away_name: "Away" });
    const event = buildFixtureJsonLd(
      { status: "incomplete", date_unix: 1783161000 },
      "https://www.soccerstatshub.com/fixture/home-vs-away-1/",
      meta
    )["@graph"].find((node) => node["@type"] === "SportsEvent");

    expect(event.location).toEqual({
      "@type": "Place",
      name: "Venue to be confirmed",
    });
    expect(event.image).toEqual([OG_IMAGE]);
    expect(buildFixtureEventStatus({ status: "postponed" })).toBe(
      "https://schema.org/EventPostponed"
    );
  });
});

describe("fixture OG image URLs", () => {
  test("builds absolute dynamic OG image URLs per match id", () => {
    expect(buildFixtureOgImageUrl(8436178)).toBe(
      "https://www.soccerstatshub.com/api/og/fixture/8436178/"
    );
    expect(buildFixtureOgImageUrl("12345")).toBe(
      "https://www.soccerstatshub.com/api/og/fixture/12345/"
    );
  });
});

describe("premier league OG image URLs", () => {
  test("builds absolute OG image URL for the 2026/27 preview", () => {
    expect(buildPremierLeague202627OgImageUrl()).toBe(
      "https://www.soccerstatshub.com/api/og/premier-league-2026-27/"
    );
  });
});

describe("competition OG image URLs", () => {
  test("builds absolute OG image URLs per competition slug", () => {
    expect(buildCompetitionOgImageUrl("premier-league")).toBe(
      "https://www.soccerstatshub.com/api/og/competition/premier-league/"
    );
    expect(buildCompetitionOgImageUrl(17146)).toBe(
      "https://www.soccerstatshub.com/api/og/competition/17146/"
    );
  });

  test("resolves slug and numeric competition params", () => {
    expect(resolveCompetitionOgParam("premier-league")).toEqual({
      seasonId: "17146",
      catalog: expect.objectContaining({
        slug: "premier-league",
        name: "Premier League",
      }),
      slug: "premier-league",
    });
    expect(resolveCompetitionOgParam("17146").seasonId).toBe("17146");
    expect(resolveCompetitionOgParam("not-a-league")).toBeNull();
  });

  test("builds share-card model with key league stats", () => {
    const model = buildCompetitionOgCardModel(
      {
        english_name: "Premier League",
        country: "England",
        season: "2026/2027",
        matchesCompleted: 40,
        seasonAVG_overall: 2.85,
        seasonBTTSPercentage: 54.2,
        seasonOver25Percentage_overall: 58.1,
        seasonUnder25Percentage_overall: 41.9,
        homeWinPercentage: 45,
        drawPercentage: 24,
        awayWinPercentage: 31,
        image: "https://cdn.example.com/pl.png",
        teams: [
          {
            id: 1,
            name: "Arsenal",
            seasonOver25Percentage_overall: 72.5,
            seasonBTTSPercentage_overall: 61,
          },
          {
            id: 2,
            name: "Everton",
            seasonOver25Percentage_overall: 40,
            seasonBTTSPercentage_overall: 35,
          },
        ],
      },
      { slug: "premier-league", name: "Premier League" }
    );

    expect(model.name).toBe("Premier League");
    expect(model.stats.map((stat) => stat.label)).toEqual([
      "Avg goals",
      "BTTS",
      "Over 2.5",
      "Under 2.5",
    ]);
    expect(model.highlight).toEqual({
      label: "Highest Over 2.5",
      team: "Arsenal",
      value: "72.5%",
    });
    expect(model.resultSplit).toBe("45.0% / 24.0% / 31.0%");
    expect(model.logoUrl).toBe("https://cdn.example.com/pl.png");
    expect(model.seasonStarted).toBe(true);
  });
});

describe("canonical URLs", () => {
  test("strips query strings from asPath", () => {
    expect(getCanonicalPathFromAsPath("/competition/premier-league/?theme=dark")).toBe(
      "/competition/premier-league"
    );
    expect(getCanonicalPathFromAsPath("/fixtures/?shortlist=123,456")).toBe(
      "/fixtures"
    );
    expect(getCanonicalPathFromAsPath("/btts-no-teams/?theme=light#table")).toBe(
      "/btts-no-teams"
    );
  });

  test("builds trailing-slash canonical URLs", () => {
    expect(getCanonicalUrl("/competition/premier-league")).toBe(
      "https://www.soccerstatshub.com/competition/premier-league/"
    );
    expect(getCanonicalUrl("/highest-scoring-leagues")).toBe(
      "https://www.soccerstatshub.com/highest-scoring-leagues/"
    );
  });
});
