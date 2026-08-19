import { filterIndexableFixtureLinks } from "./serverFetch";

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
