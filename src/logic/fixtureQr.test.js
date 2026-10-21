import { TextEncoder } from "util";
import { buildFixtureQr } from "./fixtureQr";

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
}

describe("buildFixtureQr", () => {
  test("draws a fixture URL with a quiet zone and a finder pattern", () => {
    const code = buildFixtureQr(
      "https://www.soccerstatshub.com/fixture/arsenal-vs-chelsea-12345/"
    );

    expect(code.size).toBeGreaterThan(20);
    expect(code.quiet).toBe(4);
    expect(code.d.startsWith("M0 0h1v1h-1z")).toBe(true);
  });

  test("returns null when there is no URL", () => {
    expect(buildFixtureQr("")).toBeNull();
    expect(buildFixtureQr(null)).toBeNull();
  });
});
