import { clearMatchPredictionFields } from "./matchPredictionFields";

describe("clearMatchPredictionFields", () => {
  test("removes score and probability outputs while keeping other fields", () => {
    const match = {
      goalsA: "x",
      goalsB: "x",
      homeWinProbability: 42,
      drawProbability: 28,
      awayWinProbability: 30,
      scoreMatrix: [[0.1]],
      winValue: 5,
      formHome: { resultsAll: ["W", "D"] },
    };

    clearMatchPredictionFields(match);

    expect(match.homeWinProbability).toBeUndefined();
    expect(match.drawProbability).toBeUndefined();
    expect(match.awayWinProbability).toBeUndefined();
    expect(match.scoreMatrix).toBeUndefined();
    expect(match.winValue).toBeUndefined();
    expect(match.goalsA).toBe("x");
    expect(match.formHome.resultsAll).toEqual(["W", "D"]);
  });
});
