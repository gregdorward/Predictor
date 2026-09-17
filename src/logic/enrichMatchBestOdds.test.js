jest.mock("./scoreModelConfig.js", () => ({
  getUseBestMatchOdds: () => true,
}));

const mockAllForm = [];

jest.mock("./getFixtures.js", () => ({
  get allForm() {
    return mockAllForm;
  },
}));

jest.mock("./bestMatchOdds.js", () => ({
  applyBestFtOddsToMatch: jest.fn(() => false),
  resolveMatchKickoffUnix: (match) => match.date || match.kickoffUnix,
  syncMatchDisplayOdds: jest.fn(),
}));

import {
  clearBestOddsComparisonCache,
  enrichMatchWithBestOdds,
  takePendingOddsTimelineUpdates,
} from "./enrichMatchBestOdds.js";

describe("enrichMatchWithBestOdds allForm bake", () => {
  const kickoff = 1_700_000_000;
  const softNowMs = (kickoff - 30 * 3600) * 1000;

  beforeEach(() => {
    clearBestOddsComparisonCache();
    mockAllForm.length = 0;
    global.fetch = jest.fn();
    jest.useFakeTimers({ now: softNowMs });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("skips HTTP when oddsTimeline bake is fresh", async () => {
    const match = {
      id: 42,
      date: kickoff,
      homeOdds: "2.00",
      drawOdds: "3.40",
      awayOdds: "4.00",
      oddsTimeline: {
        phase: "soft",
        kickoffUnix: kickoff,
        nextPhaseAt: kickoff - 12 * 3600,
        display: {
          home: 1.95,
          draw: 3.4,
          away: 4.2,
          bookmakers: { home: "Pinnacle", draw: "bet365", away: "Unibet" },
        },
        movement: { home: "stable", draw: "stable", away: "stable" },
        movementPct: { home: null, draw: null, away: null },
      },
    };

    const ok = await enrichMatchWithBestOdds(match);
    expect(ok).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(match.homeOdds).toBe("1.95");
    expect(match.homeOddsBookmaker).toBe("Pinnacle");
    expect(match.bestOddsSource).toBe("timeline");
    expect(takePendingOddsTimelineUpdates()).toEqual([]);
  });

  test("syncs when bake is past nextPhaseAt and queues batched allForm update", async () => {
    mockAllForm.push({ id: 42, home: {}, away: {} });
    const match = {
      id: 42,
      date: kickoff,
      homeOdds: "2.00",
      drawOdds: "3.40",
      awayOdds: "4.00",
      oddsTimeline: {
        phase: "soft",
        kickoffUnix: kickoff,
        nextPhaseAt: kickoff - 12 * 3600,
        display: {
          home: 1.95,
          draw: 3.4,
          away: 4.2,
          bookmakers: { home: "Pinnacle", draw: null, away: null },
        },
        movement: { home: "stable", draw: "stable", away: "stable" },
        movementPct: { home: null, draw: null, away: null },
      },
    };

    // Past nextPhaseAt → mid window, must sync.
    jest.setSystemTime((kickoff - 6 * 3600) * 1000);

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        phase: "mid",
        display: {
          home: 1.85,
          draw: 3.5,
          away: 4.5,
          bookmakers: { home: "Pinnacle", draw: "bet365", away: "Unibet" },
        },
        movement: {
          home: "shortening",
          draw: "drifting",
          away: "drifting",
        },
        movementPct: { home: -5.1, draw: 2.9, away: 7.1 },
        timeline: {
          opening: { home: 1.95, draw: 3.4, away: 4.2 },
          mid: { home: 1.85, draw: 3.5, away: 4.5 },
          locked: null,
          kickoffUnix: kickoff,
        },
        fetched: true,
        stored: true,
      }),
    });

    const ok = await enrichMatchWithBestOdds(match);
    expect(ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(match.homeOdds).toBe("1.85");
    expect(match.oddsTimeline.phase).toBe("mid");
    expect(match.oddsTimeline.movementPct.home).toBe(-5.1);
    expect(mockAllForm[0].oddsTimeline.display.home).toBe(1.85);

    const pending = takePendingOddsTimelineUpdates();
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe("42");
    expect(pending[0].oddsTimeline.display.home).toBe(1.85);
  });
});
