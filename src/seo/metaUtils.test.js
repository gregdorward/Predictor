import {
  META_DESCRIPTION_MAX,
  clampMetaDescription,
  clampMetaTitle,
} from "./metaUtils";

describe("metaUtils", () => {
  test("clampMetaDescription leaves short text unchanged", () => {
    const short = "BTTS and Over 2.5 stats for the Premier League.";
    expect(clampMetaDescription(short)).toBe(short);
  });

  test("clampMetaDescription truncates long text under the limit", () => {
    const long = "a".repeat(META_DESCRIPTION_MAX + 40);
    const result = clampMetaDescription(long);
    expect(result.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(result.endsWith("…")).toBe(true);
  });

  test("clampMetaTitle truncates long titles", () => {
    const long = "FAQ | Transparent Predictions, BTTS & Premium | Soccer Stats Hub";
    const result = clampMetaTitle(long, 60);
    expect(result.length).toBeLessThanOrEqual(60);
  });
});
