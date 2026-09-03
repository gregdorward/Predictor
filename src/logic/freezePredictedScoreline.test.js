import {
  getStoredSshScoreline,
  hasKickoffPassed,
  resolveSshScorelineForTips,
} from "./freezePredictedScoreline";

describe("hasKickoffPassed", () => {
  test("treats complete matches as kicked off", () => {
    expect(hasKickoffPassed({ status: "complete", date: 9999999999 })).toBe(
      true
    );
  });

  test("uses kickoff unix when status is still incomplete", () => {
    expect(
      hasKickoffPassed({ status: "incomplete", date: 1000 }, 1000 * 1000)
    ).toBe(true);
    expect(
      hasKickoffPassed({ status: "incomplete", date: 1000 }, 999 * 1000)
    ).toBe(false);
  });
});

describe("getStoredSshScoreline", () => {
  test("returns numeric ssh snapshot for the match", () => {
    expect(
      getStoredSshScoreline(
        [{ gameId: 1, sshHomeGoals: 2, sshAwayGoals: 0 }],
        "1"
      )
    ).toEqual({ home: 2, away: 0 });
  });

  test("returns null when snapshot is missing", () => {
    expect(getStoredSshScoreline([{ gameId: 1 }], 1)).toBeNull();
  });
});

describe("resolveSshScorelineForTips", () => {
  const stored = { home: 2, away: 0 };

  test("uses stored scoreline after kickoff", () => {
    expect(
      resolveSshScorelineForTips({
        stored,
        liveHome: 1,
        liveAway: 2,
        kickoffPassed: true,
      })
    ).toEqual({
      home: 2,
      away: 0,
      source: "stored",
      shouldPersist: false,
    });
  });

  test("follows live scores before kickoff and persists changes", () => {
    expect(
      resolveSshScorelineForTips({
        stored,
        liveHome: 3,
        liveAway: 1,
        kickoffPassed: false,
      })
    ).toEqual({
      home: 3,
      away: 1,
      source: "live",
      shouldPersist: true,
    });
  });

  test("freezes the first live scoreline after kickoff when nothing is stored", () => {
    expect(
      resolveSshScorelineForTips({
        stored: null,
        liveHome: 1,
        liveAway: 2,
        kickoffPassed: true,
      })
    ).toEqual({
      home: 1,
      away: 2,
      source: "live",
      shouldPersist: true,
    });
  });
});
