import { persistLeagueResults } from "./persistLeagueResults";

describe("persistLeagueResults", () => {
  test("uses PUT only and never DELETE", async () => {
    const calls = [];
    global.fetch = jest.fn((url, options) => {
      calls.push({ url, method: options.method });
      return Promise.resolve({ ok: true, status: 200 });
    });

    await persistLeagueResults("https://api.example.com/", {
      leagueIds: [1],
      data: [{ id: 1, fixtures: [] }],
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      url: "https://api.example.com/results",
      method: "PUT",
    });
  });
});
