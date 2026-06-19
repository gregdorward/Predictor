import { buildMatchShareUrl } from "./shareMatchUrl";

describe("buildMatchShareUrl", () => {
  test("returns a per-fixture URL", () => {
    expect(buildMatchShareUrl(12345)).toBe(
      "https://www.soccerstatshub.com/fixture/12345/"
    );
  });

  test("returns null when game id is missing", () => {
    expect(buildMatchShareUrl(null)).toBeNull();
  });
});
