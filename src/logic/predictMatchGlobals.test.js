import {
  mergeFormEntry,
  mergeLeagueResults,
} from "./predictMatchGlobals";

describe("predictMatchById shared state merges", () => {
  test("mergeFormEntry updates an existing fixture without dropping other entries", () => {
    const allForm = [
      { id: 1, home: { teamName: "A" }, away: { teamName: "B" } },
      { id: 2, home: { teamName: "C" }, away: { teamName: "D" } },
    ];
    const updated = {
      id: 2,
      home: { teamName: "C", updated: true },
      away: { teamName: "D", updated: true },
    };

    mergeFormEntry(allForm, updated);

    expect(allForm).toHaveLength(2);
    expect(allForm[0].id).toBe(1);
    expect(allForm[1]).toEqual(updated);
  });

  test("mergeFormEntry appends a new fixture without clearing existing entries", () => {
    const allForm = [{ id: 1, home: { teamName: "A" }, away: { teamName: "B" } }];
    const newEntry = { id: 3, home: { teamName: "E" }, away: { teamName: "F" } };

    mergeFormEntry(allForm, newEntry);

    expect(allForm).toHaveLength(2);
    expect(allForm.map((entry) => entry.id)).toEqual([1, 3]);
  });

  test("mergeLeagueResults updates one league without dropping others", () => {
    const allLeagueResultsArrayOfObjects = [
      { id: 100, name: "League A", data: [1] },
      { id: 200, name: "League B", data: [2] },
    ];
    const updatedLeague = { id: 200, name: "League B", data: [2, 3] };

    mergeLeagueResults(allLeagueResultsArrayOfObjects, updatedLeague);

    expect(allLeagueResultsArrayOfObjects).toHaveLength(2);
    expect(allLeagueResultsArrayOfObjects[0].id).toBe(100);
    expect(allLeagueResultsArrayOfObjects[1]).toEqual(updatedLeague);
  });

  test("mergeLeagueResults appends a new league without clearing existing entries", () => {
    const allLeagueResultsArrayOfObjects = [{ id: 100, name: "League A" }];
    const newLeague = { id: 300, name: "League C" };

    mergeLeagueResults(allLeagueResultsArrayOfObjects, newLeague);

    expect(allLeagueResultsArrayOfObjects).toHaveLength(2);
    expect(allLeagueResultsArrayOfObjects.map((entry) => entry.id)).toEqual([
      100,
      300,
    ]);
  });
});
