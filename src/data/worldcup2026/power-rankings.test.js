import rankingsData from "./power-rankings.json";

const EM_DASH = "\u2014";

describe("World Cup 2026 power rankings data", () => {
  test("has required top-level fields", () => {
    expect(rankingsData.updatedAt).toBeTruthy();
    expect(rankingsData.methodology).toBeTruthy();
    expect(rankingsData.rankings.length).toBeGreaterThan(0);
  });

  test("each ranking has required fields", () => {
    rankingsData.rankings.forEach((entry) => {
      expect(entry.rank).toBeGreaterThan(0);
      expect(entry.team).toBeTruthy();
      expect(entry.flag).toBeTruthy();
      expect(entry.record).toBeTruthy();
      expect(entry.winChance).toMatch(/^\d+(\.\d+)?%$/);
      expect(entry.summary).toBeTruthy();
    });
  });

  test("ranks are sequential from 1", () => {
    rankingsData.rankings.forEach((entry, index) => {
      expect(entry.rank).toBe(index + 1);
    });
  });

  test("content contains no em-dashes", () => {
    const allText = [
      rankingsData.methodology,
      ...rankingsData.rankings.flatMap((r) => [
        r.team,
        r.record,
        r.summary,
      ]),
    ].join(" ");
    expect(allText).not.toContain(EM_DASH);
  });
});
