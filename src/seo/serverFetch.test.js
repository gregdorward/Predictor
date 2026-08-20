import {
  filterIndexableCompetitions,
  filterIndexableFixtureLinks,
} from "./serverFetch";

describe("filterIndexableFixtureLinks", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("drops fixtures whose snapshot status is finished", async () => {
    global.fetch = jest.fn(async (url) => ({
      ok: true,
      json: async () => ({
        data: {
          id: url.includes("111") ? 111 : 222,
          status: url.includes("111") ? "suspended" : "incomplete",
        },
      }),
    }));

    const links = [
      {
        matchId: "111",
        href: "/fixture/home-vs-away-111/",
        label: "Home vs Away",
      },
      {
        matchId: "222",
        href: "/fixture/alpha-vs-beta-222/",
        label: "Alpha vs Beta",
      },
    ];

    await expect(filterIndexableFixtureLinks(links)).resolves.toEqual([links[1]]);
  });

  test("keeps fixtures when snapshot fetch fails", async () => {
    global.fetch = jest.fn(async () => {
      throw new Error("timeout");
    });

    const links = [
      {
        matchId: "333",
        href: "/fixture/home-vs-away-333/",
        label: "Home vs Away",
      },
    ];

    await expect(filterIndexableFixtureLinks(links)).resolves.toEqual(links);
  });
});

describe("filterIndexableCompetitions", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("drops empty-season competitions that would be noindex", async () => {
    global.fetch = jest.fn(async (url) => ({
      ok: true,
      json: async () => ({
        success: true,
        data: String(url).includes("17146")
          ? {
              seasonAVG_overall: 0,
              seasonBTTSPercentage: 0,
              seasonOver25Percentage_overall: 0,
              seasonUnder25Percentage_overall: 0,
            }
          : {
              seasonAVG_overall: 2.7,
              seasonBTTSPercentage: 55,
              seasonOver25Percentage_overall: 58,
              seasonUnder25Percentage_overall: 42,
            },
      }),
    }));

    const competitions = [
      { id: 17146, slug: "premier-league", name: "Premier League" },
      { id: 17084, slug: "serie-a", name: "Serie A" },
    ];

    await expect(filterIndexableCompetitions(competitions)).resolves.toEqual([
      competitions[1],
    ]);
  });

  test("excludes competitions when the season fetch fails", async () => {
    global.fetch = jest.fn(async () => {
      throw new Error("timeout");
    });

    const competitions = [
      { id: 17146, slug: "premier-league", name: "Premier League" },
    ];

    await expect(filterIndexableCompetitions(competitions)).resolves.toEqual([]);
  });
});
