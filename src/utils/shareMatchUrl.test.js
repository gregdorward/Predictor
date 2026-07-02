import { buildMatchShareUrl } from "./shareMatchUrl";

describe("buildMatchShareUrl", () => {
  test("returns a per-fixture URL with slug when team names are provided", () => {
    expect(
      buildMatchShareUrl(12345, null, undefined, {
        homeTeam: "Arsenal",
        awayTeam: "Chelsea",
      })
    ).toBe("https://www.soccerstatshub.com/fixture/arsenal-vs-chelsea-12345/");
  });

  test("returns a numeric fixture URL when team names are omitted", () => {
    expect(buildMatchShareUrl(12345)).toBe(
      "https://www.soccerstatshub.com/fixture/12345/"
    );
  });

  test("returns null when game id is missing", () => {
    expect(buildMatchShareUrl(null)).toBeNull();
  });
});
