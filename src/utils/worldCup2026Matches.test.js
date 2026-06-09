import matchData from "../data/worldcup2026/match-predictions.json";
import {
  mergeMatchPredictions,
  groupMatchesByPhase,
  sortMatchesByDate,
  loadStaticMatchPredictions,
} from "./worldCup2026Matches";

describe("worldCup2026Matches", () => {
  test("static match data has required shape", () => {
    expect(matchData.version).toBe(1);
    expect(matchData.matches.length).toBeGreaterThanOrEqual(10);
    matchData.matches.forEach((match) => {
      expect(match.id).toBeTruthy();
      expect(match.phase).toBeTruthy();
      expect(match.home).toBeTruthy();
      expect(match.away).toBeTruthy();
    });
  });

  test("mergeMatchPredictions overrides by id", () => {
    const base = loadStaticMatchPredictions();
    const firstId = base[0].id;
    const merged = mergeMatchPredictions(matchData, [
      {
        id: firstId,
        phase: "round32",
        roundLabel: "Round of 32",
        home: "Spain",
        away: "Senegal",
        source: "api",
        prediction: { predictedScore: "3-0", homeWin: 80, draw: 10, awayWin: 10 },
      },
    ]);
    const updated = merged.find((m) => m.id === firstId);
    expect(updated.source).toBe("api");
    expect(updated.phase).toBe("round32");
  });

  test("groupMatchesByPhase groups matches", () => {
    const grouped = groupMatchesByPhase(loadStaticMatchPredictions());
    expect(grouped.group.length).toBeGreaterThan(0);
  });

  test("sortMatchesByDate orders by date", () => {
    const sorted = sortMatchesByDate([
      { id: "b", date: "2026-06-20", phase: "group" },
      { id: "a", date: "2026-06-11", phase: "group" },
    ]);
    expect(sorted[0].id).toBe("a");
  });
});
