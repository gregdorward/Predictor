import {
  buildFixtureSlug,
  isFixtureFinished,
  parseFixtureParam,
} from "./fixtureSlug";
import { getCanonicalPathFromAsPath, getCanonicalUrl } from "./pageMetaConfig";

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
});

describe("canonical URLs", () => {
  test("strips query strings from asPath", () => {
    expect(getCanonicalPathFromAsPath("/competition/premier-league/?theme=dark")).toBe(
      "/competition/premier-league"
    );
  });

  test("builds trailing-slash canonical URLs", () => {
    expect(getCanonicalUrl("/competition/premier-league")).toBe(
      "https://www.soccerstatshub.com/competition/premier-league/"
    );
  });
});
