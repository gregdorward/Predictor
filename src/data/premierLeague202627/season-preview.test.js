import previewData from "./season-preview.json";

describe("Premier League 2026/27 season preview data", () => {
  test("has required top-level sections", () => {
    expect(previewData.overview).toBeTruthy();
    expect(previewData.predictedWinner).toBeTruthy();
    expect(previewData.marketOdds.winner.length).toBeGreaterThan(0);
    expect(previewData.teams).toHaveLength(20);
    expect(previewData.predictedTable).toHaveLength(20);
    expect(previewData.storylines.length).toBeGreaterThanOrEqual(4);
  });

  test("predicted positions are unique 1-20", () => {
    const positions = previewData.predictedTable.map((t) => t.predictedPosition);
    expect(new Set(positions).size).toBe(20);
    expect(Math.min(...positions)).toBe(1);
    expect(Math.max(...positions)).toBe(20);
  });

  test("team guides have managers and transfer lists", () => {
    const names = new Set();
    previewData.teams.forEach((team) => {
      expect(team.name).toBeTruthy();
      expect(team.manager).toBeTruthy();
      expect(Array.isArray(team.keyArrivals)).toBe(true);
      expect(Array.isArray(team.keyDepartures)).toBe(true);
      expect(team.preview.length).toBeGreaterThan(80);
      names.add(team.name);
    });
    expect(names.size).toBe(20);
  });

  test("odds provider and snapshot dates are set", () => {
    expect(previewData.oddsProvider).toMatch(/Betfair/i);
    expect(previewData.oddsAsOf).toBeTruthy();
    expect(previewData.dataAsOf).toBeTruthy();
  });

  test("removed season-fact notes are not present", () => {
    const notes = (previewData.format.notes || []).join(" ");
    expect(notes.toLowerCase()).not.toContain("gambling");
    expect(notes.toLowerCase()).not.toContain("delayed one week");
  });

  test("content does not cite non-Betfair publishers by name", () => {
    const blob = JSON.stringify(previewData);
    expect(blob).not.toMatch(/Yahoo|Betzoid|Bleacher Report|Wikipedia|bet365|PremierLeagueNow|Evening Standard|The Athletic/i);
    expect(blob).toMatch(/Betfair/);
  });
});
