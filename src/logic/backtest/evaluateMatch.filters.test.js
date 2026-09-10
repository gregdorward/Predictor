import { aggregateResults, evaluateMatch } from "./evaluateMatch.js";

describe("evaluateMatch filters", () => {
  const baseMatch = {
    id: 1,
    goalsA: 2,
    goalsB: 1,
    homeGoals: 2,
    awayGoals: 0,
    homeOdds: 2,
    drawOdds: 3.5,
    awayOdds: 4,
    homeWinProbability: 55,
    drawProbability: 25,
    awayWinProbability: 20,
    completeData: true,
  };

  test("marks filteredOut when match.omit is true", () => {
    const row = evaluateMatch({ ...baseMatch, omit: true }, "2026-09-05", "cached");
    expect(row.filteredOut).toBe(true);
    expect(row.outcomeCorrect).toBe(true);
  });

  test("aggregateResults can exclude filtered rows", () => {
    const rows = [
      evaluateMatch(baseMatch, "2026-09-05", "cached"),
      evaluateMatch({ ...baseMatch, id: 2, omit: true }, "2026-09-05", "cached"),
    ];

    expect(aggregateResults(rows).predicted).toBe(2);
    expect(
      aggregateResults(rows, { excludeFilteredOut: true }).predicted
    ).toBe(1);
  });

  test("aggregateResults excludes high-edge fixtures from ROI", () => {
    const rows = [
      evaluateMatch(baseMatch, "2026-09-05", "cached"),
      evaluateMatch(
        { ...baseMatch, id: 2, highEdgeFlag: true },
        "2026-09-05",
        "cached"
      ),
    ];

    expect(aggregateResults(rows).predicted).toBe(1);
  });
});
