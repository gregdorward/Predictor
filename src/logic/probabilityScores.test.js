import { brierScore1X2, logLoss1X2, meanScore } from "./probabilityScores.js";

describe("probabilityScores", () => {
  test("perfect home tip has Brier 0", () => {
    expect(brierScore1X2(100, 0, 0, "homeWin")).toBeCloseTo(0);
  });

  test("wrong sharp tip has high Brier", () => {
    expect(brierScore1X2(100, 0, 0, "awayWin")).toBeCloseTo(2);
  });

  test("log-loss is 0 for a certain correct tip", () => {
    expect(logLoss1X2(100, 0, 0, "homeWin")).toBeCloseTo(0);
  });

  test("log-loss is large for a certain wrong tip", () => {
    expect(logLoss1X2(100, 0, 0, "awayWin")).toBeGreaterThan(10);
  });

  test("meanScore ignores non-finite values", () => {
    expect(meanScore([0.4, null, 0.6])).toBeCloseTo(0.5);
    expect(meanScore([])).toBeNull();
  });
});
