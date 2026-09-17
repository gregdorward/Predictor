import {
  applyOddsTimelineToMatch,
  formatOddsMovementPctLabel,
  hoursToKickoff,
  isOddsTimelineBakeFresh,
  movementFromPrevious,
  movementPctFromPrevious,
  nextPhaseAtUnix,
  previousSample,
  resolveOddsPhase,
  snapshotFromSyncResponse,
} from "./oddsTimeline.js";

describe("oddsTimeline (client)", () => {
  test("resolveOddsPhase boundaries", () => {
    expect(resolveOddsPhase(13)).toBe("soft");
    expect(resolveOddsPhase(12)).toBe("mid");
    expect(resolveOddsPhase(0.75)).toBe("mid");
    expect(resolveOddsPhase(0.749)).toBe("lock");
    expect(resolveOddsPhase(0)).toBe("frozen");
  });

  test("hoursToKickoff", () => {
    const kickoff = 1_700_000_000;
    const now = new Date(kickoff * 1000);
    expect(hoursToKickoff(kickoff + 7200, now)).toBeCloseTo(2, 5);
  });

  test("movementFromPrevious compares to prior window", () => {
    const timeline = {
      opening: { home: 2.0, draw: 3.4, away: 4.0 },
      mid: { home: 1.9, draw: 3.5, away: 4.2 },
      locked: { home: 1.85, draw: 3.5, away: 4.5 },
    };
    expect(previousSample(timeline)).toEqual(timeline.mid);
    expect(movementFromPrevious(timeline, timeline.locked)).toEqual({
      home: "shortening",
      draw: "stable",
      away: "drifting",
    });
    expect(movementPctFromPrevious(timeline, timeline.locked)).toEqual({
      home: -2.6,
      draw: null,
      away: 7.1,
    });
  });

  test("movementPctFromPrevious is null with only one window", () => {
    const timeline = {
      opening: null,
      mid: null,
      locked: { home: 1.77, draw: 4.0, away: 4.92 },
    };
    expect(movementPctFromPrevious(timeline, timeline.locked)).toEqual({
      home: null,
      draw: null,
      away: null,
    });
  });

  test("formatOddsMovementPctLabel", () => {
    expect(formatOddsMovementPctLabel(-2.6)).toBe("↓ 2.6%");
    expect(formatOddsMovementPctLabel(5)).toBe("↑ 5%");
    expect(formatOddsMovementPctLabel(null)).toBeNull();
  });

  test("nextPhaseAtUnix after opening is KO-12h; mid missing in mid window is 0", () => {
    const kickoff = 1_700_000_000;
    const withOpening = {
      opening: { home: 2 },
      mid: null,
      locked: null,
    };
    const softNow = new Date((kickoff - 30 * 3600) * 1000);
    expect(nextPhaseAtUnix(kickoff, withOpening, softNow)).toBe(
      kickoff - 12 * 3600
    );

    const midNow = new Date((kickoff - 6 * 3600) * 1000);
    expect(nextPhaseAtUnix(kickoff, withOpening, midNow)).toBe(0);

    const withMid = { ...withOpening, mid: { home: 1.9 } };
    expect(nextPhaseAtUnix(kickoff, withMid, midNow)).toBe(
      Math.floor(kickoff - 0.75 * 3600)
    );
  });

  test("snapshotFromSyncResponse and isOddsTimelineBakeFresh", () => {
    const kickoff = 1_700_000_000;
    const softNow = new Date((kickoff - 30 * 3600) * 1000);
    const sync = {
      phase: "soft",
      display: {
        home: 1.95,
        draw: 3.4,
        away: 4.2,
        bookmakers: { home: "Pinnacle", draw: null, away: null },
      },
      movement: { home: "stable", draw: "stable", away: "stable" },
      movementPct: { home: null, draw: null, away: null },
      timeline: {
        opening: { home: 1.95 },
        mid: null,
        locked: null,
        kickoffUnix: kickoff,
      },
    };
    const snap = snapshotFromSyncResponse(sync, kickoff, softNow);
    expect(snap.nextPhaseAt).toBe(kickoff - 12 * 3600);
    expect(snap.display.home).toBe(1.95);
    expect(isOddsTimelineBakeFresh(snap, softNow)).toBe(true);
    expect(
      isOddsTimelineBakeFresh(snap, new Date((kickoff - 6 * 3600) * 1000))
    ).toBe(false);
    expect(
      isOddsTimelineBakeFresh({ display: { home: 2 }, nextPhaseAt: 0 })
    ).toBe(false);
  });

  test("applyOddsTimelineToMatch sets decimals bookmakers and movement", () => {
    const match = {
      homeOdds: "1.90",
      drawOdds: "3.40",
      awayOdds: "4.00",
    };
    expect(
      applyOddsTimelineToMatch(match, {
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
        movementPct: {
          home: -2.6,
          draw: null,
          away: 7.1,
        },
      })
    ).toBe(true);
    expect(match.homeOdds).toBe("1.85");
    expect(match.homeOddsBookmaker).toBe("Pinnacle");
    expect(match.homeOddsMovement).toBe("shortening");
    expect(match.drawOddsMovement).toBe("drifting");
    expect(match.homeOddsMovementPct).toBe(-2.6);
    expect(match.drawOddsMovementPct).toBeNull();
    expect(match.awayOddsMovementPct).toBe(7.1);
    expect(match.oddsTimelinePhase).toBe("mid");
    expect(match.bestOddsSource).toBe("timeline");
  });

  test("applyOddsTimelineToMatch does not wipe existing bookmakers when omitted", () => {
    const match = {
      homeOdds: "1.90",
      homeOddsBookmaker: "Pinnacle",
      drawOdds: "3.40",
      drawOddsBookmaker: "bet365",
      awayOdds: "4.00",
      awayOddsBookmaker: "Unibet",
    };
    applyOddsTimelineToMatch(match, {
      phase: "lock",
      display: {
        home: 1.85,
        draw: 3.5,
        away: 4.5,
        bookmakers: { home: null, draw: null, away: null },
      },
      movement: { home: "shortening", draw: "stable", away: "drifting" },
    });
    expect(match.homeOdds).toBe("1.85");
    expect(match.homeOddsBookmaker).toBe("Pinnacle");
    expect(match.drawOddsBookmaker).toBe("bet365");
    expect(match.awayOddsBookmaker).toBe("Unibet");
    expect(match.homeOddsMovementPct).toBeNull();
  });
});
