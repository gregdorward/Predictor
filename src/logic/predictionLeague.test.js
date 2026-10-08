import {
  getMonthKey,
  getMonthLabel,
  getTrendingSelections,
  mergeLeaderboardRows,
  slipsFromTipsNewPayload,
} from "./predictionLeague";

describe("predictionLeague", () => {
  test("getMonthKey formats YYYY-MM", () => {
    expect(getMonthKey(new Date("2026-10-15T12:00:00Z"))).toBe("2026-10");
  });

  test("getMonthLabel renders long month name", () => {
    expect(getMonthLabel("2026-10")).toBe("October 2026");
  });

  test("slipsFromTipsNewPayload filters by submission month", () => {
    const data = {
      u1: [
        {
          slipId: "a",
          submittedAt: "2026-10-05T10:00:00.000Z",
          selections: [{ date: 1 }],
          stake: 5,
        },
        {
          slipId: "b",
          submittedAt: "2026-09-28T10:00:00.000Z",
          selections: [{ date: 1 }],
          stake: 5,
        },
      ],
    };

    const slips = slipsFromTipsNewPayload(data, { monthKey: "2026-10" });
    expect(slips).toHaveLength(1);
    expect(slips[0].slipId).toBe("a");
    expect(slips[0].uid).toBe("u1");
  });

  test("mergeLeaderboardRows computes ROI and filters empty slip users", () => {
    const leaderboard = [
      { uid: "u1", displayName: "Alice", monthlyProfit: 10 },
      { uid: "u2", displayName: "Bob", monthlyProfit: 20 },
    ];
    const slips = [
      {
        uid: "u1",
        stake: 100,
        submittedAt: "2026-10-01T00:00:00.000Z",
        slipId: "s1",
      },
    ];

    const merged = mergeLeaderboardRows(leaderboard, slips);
    expect(merged).toHaveLength(1);
    expect(merged[0].displayName).toBe("Alice");
    expect(merged[0].roi).toBe(10);
    expect(merged[0].userSlips).toHaveLength(1);
  });

  test("mergeLeaderboardRows uses zero ROI when nothing staked", () => {
    const merged = mergeLeaderboardRows(
      [{ uid: "u1", displayName: "A", monthlyProfit: 5 }],
      [{ uid: "u1", stake: 0, submittedAt: "2026-10-01T00:00:00.000Z" }]
    );
    expect(merged[0].roi).toBe(0);
  });

  test("getTrendingSelections counts pending legs", () => {
    const slips = [
      {
        status: "PENDING",
        selections: [
          { gameId: 1, tipString: "HomeWin", game: "A v B", odds: 2 },
          { gameId: 2, tipString: "BTTS", game: "C v D", odds: 1.8 },
        ],
      },
      {
        status: "PENDING",
        selections: [
          { gameId: 1, tipString: "HomeWin", game: "A v B", odds: 2 },
        ],
      },
      {
        status: "WON",
        selections: [
          { gameId: 3, tipString: "Draw", game: "E v F", odds: 3 },
        ],
      },
    ];

    const trending = getTrendingSelections(slips);
    expect(trending[0].tip).toBe("HomeWin");
    expect(trending[0].count).toBe(2);
  });
});
