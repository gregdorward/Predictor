import {
  fetchLeagueAveragesForDate,
  toFormDateKeyFromIso,
} from "./leagueAverages";

describe("toFormDateKeyFromIso", () => {
  test("converts YYYY-MM-DD to MMDDYYYY", () => {
    expect(toFormDateKeyFromIso("2026-08-19")).toBe("8192026");
    expect(toFormDateKeyFromIso("2026-01-05")).toBe("152026");
  });

  test("returns null for invalid input", () => {
    expect(toFormDateKeyFromIso("")).toBeNull();
    expect(toFormDateKeyFromIso("invalid")).toBeNull();
  });
});

describe("fetchLeagueAveragesForDate", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("returns dated snapshot when available", async () => {
    const dated = [{ id: 1, averageGoals: 2.8, averageGoalsHome: 1.55 }];
    global.fetch = jest.fn(async (url) => {
      if (String(url).includes("league-averages/8192026")) {
        return { ok: true, json: async () => dated };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(fetchLeagueAveragesForDate("8192026")).resolves.toEqual(dated);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("falls back to global league averages when dated snapshot is missing", async () => {
    const globalAverages = [{ id: 1, averageGoals: 2.5 }];
    global.fetch = jest.fn(async (url) => {
      if (String(url).includes("league-averages/8192026")) {
        return { ok: false, status: 404 };
      }
      if (String(url).includes("league-averages")) {
        return { ok: true, json: async () => globalAverages };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(fetchLeagueAveragesForDate("8192026")).resolves.toEqual(
      globalAverages
    );
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
