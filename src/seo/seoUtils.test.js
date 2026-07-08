import {
  buildFixtureEventStatus,
  buildFixtureJsonLd,
  buildFixtureMeta,
  buildFixtureSlug,
  isFixtureFinished,
  parseFixtureParam,
} from "./fixtureSlug";
import { getCanonicalPathFromAsPath, getCanonicalUrl, OG_IMAGE } from "./pageMetaConfig";

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
