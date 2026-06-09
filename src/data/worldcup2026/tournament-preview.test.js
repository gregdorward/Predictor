import previewData from "./tournament-preview.json";
import matchData from "./match-predictions.json";

describe("World Cup 2026 tournament preview data", () => {
  test("has required top-level sections", () => {
    expect(previewData.overview).toBeTruthy();
    expect(previewData.predictedWinner).toBeTruthy();
    expect(previewData.goldenBoot).toBeTruthy();
    expect(previewData.groups).toHaveLength(12);
    expect(previewData.teamPreviews).toHaveLength(48);
  });

  test("match predictions live in separate file", () => {
    expect(matchData.matches.length).toBeGreaterThanOrEqual(10);
  });

  test("each group has four teams", () => {
    previewData.groups.forEach((group) => {
      expect(group.teams).toHaveLength(4);
      expect(group.predicted1st).toBeTruthy();
      expect(group.predicted2nd).toBeTruthy();
    });
  });

  test("team previews have key fields", () => {
    previewData.teamPreviews.forEach((team) => {
      expect(team.team).toBeTruthy();
      expect(team.manager).toBeTruthy();
      expect(team.keyPlayers.length).toBeGreaterThan(0);
    });
  });
});
