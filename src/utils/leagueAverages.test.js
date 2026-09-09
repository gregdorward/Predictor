import {
  fetchLeagueAveragesForDate,
  toFormDateKeyFromIso,
  toIsoDateFromLocal,
  isIsoDateToday,
  isoDateToStartUnix,
  buildLeagueAveragesAsOf,
  resolveLeagueAveragesForDate,
} from "./leagueAverages";

describe("toFormDateKeyFromIso", () => {
  test("converts YYYY-MM-DD to MMDDYYYY", () => {
    expect(toFormDateKeyFromIso("2026-08-19")).toBe("8192026");
    expect(toFormDateKeyFromIso("2026-01-05")).toBe("152026");
    expect(toFormDateKeyFromIso("2026-09-08")).toBe("982026");
  });

  test("returns null for invalid input", () => {
    expect(toFormDateKeyFromIso("")).toBeNull();
    expect(toFormDateKeyFromIso("invalid")).toBeNull();
  });
});

describe("toIsoDateFromLocal", () => {
  test("formats a local Date as YYYY-MM-DD", () => {
    expect(toIsoDateFromLocal(new Date(2026, 8, 8))).toBe("2026-09-08");
  });
});

describe("isIsoDateToday", () => {
  test("matches the local calendar date", () => {
    const now = new Date(2026, 8, 8, 15, 0, 0);
    expect(isIsoDateToday("2026-09-08", now)).toBe(true);
    expect(isIsoDateToday("2026-09-07", now)).toBe(false);
  });
});

describe("buildLeagueAveragesAsOf", () => {
  const leagueResults = [
    {
      id: 17146,
      fixtures: [
        {
          status: "complete",
          date_unix: isoDateToStartUnix("2026-08-16"),
          homeGoalCount: 2,
          awayGoalCount: 1,
        },
        {
          status: "complete",
          date_unix: isoDateToStartUnix("2026-08-20"),
          homeGoalCount: 5,
          awayGoalCount: 5,
        },
      ],
    },
  ];

  test("excludes the selected day and later results", () => {
    const rows = buildLeagueAveragesAsOf(leagueResults, "2026-08-20");
    expect(rows).toEqual([
      {
        id: 17146,
        averageGoals: 3,
        averageGoalsHome: 2,
        averageGoalsAway: 1,
      },
    ]);
  });

  test("returns empty when no complete games precede the day", () => {
    expect(buildLeagueAveragesAsOf(leagueResults, "2026-08-16")).toEqual([]);
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

describe("resolveLeagueAveragesForDate", () => {
  const originalFetch = global.fetch;
  const originalOrigin = process.env.NEXT_PUBLIC_EXPRESS_SERVER;

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_EXPRESS_SERVER = originalOrigin;
  });

  test("builds and persists as-of averages when dated snapshot is missing", async () => {
    process.env.NEXT_PUBLIC_EXPRESS_SERVER = "http://origin/";
    const posted = [];
    global.fetch = jest.fn(async (url, options) => {
      if (options?.method === "POST") {
        posted.push(JSON.parse(options.body));
        return { ok: true, json: async () => ({}) };
      }
      if (String(url).includes("league-averages/8192026")) {
        return { ok: false, status: 404 };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await resolveLeagueAveragesForDate({
      formDateKey: "8192026",
      isoDate: "2026-08-20",
      leagueResults: [
        {
          id: 17146,
          fixtures: [
            {
              status: "complete",
              date_unix: isoDateToStartUnix("2026-08-16"),
              homeGoalCount: 1,
              awayGoalCount: 0,
            },
          ],
        },
      ],
    });

    expect(result.source).toBe("results-as-of");
    expect(result.averages[0].id).toBe(17146);
    expect(posted).toHaveLength(1);
    expect(posted[0][0].averageGoalsHome).toBe(1);
  });

  test("does not persist when persist is false", async () => {
    process.env.NEXT_PUBLIC_EXPRESS_SERVER = "http://origin/";
    const posted = [];
    global.fetch = jest.fn(async (url, options) => {
      if (options?.method === "POST") {
        posted.push(JSON.parse(options.body));
        return { ok: true, json: async () => ({}) };
      }
      if (String(url).includes("league-averages/8192026")) {
        return { ok: false, status: 404 };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await resolveLeagueAveragesForDate({
      formDateKey: "8192026",
      isoDate: "2026-08-20",
      leagueResults: [
        {
          id: 17146,
          fixtures: [
            {
              status: "complete",
              date_unix: isoDateToStartUnix("2026-08-16"),
              homeGoalCount: 1,
              awayGoalCount: 0,
            },
          ],
        },
      ],
      persist: false,
    });

    expect(result.source).toBe("results-as-of");
    expect(posted).toHaveLength(0);
  });
});
