import {
  applyOddsTimelineToMatch,
  hoursToKickoff,
  movementFromOpening,
  resolveOddsPhase,
} from "./oddsTimeline.js";

describe("oddsTimeline (client)", () => {
  test("resolveOddsPhase boundaries", () => {
    expect(resolveOddsPhase(25)).toBe("soft");
    expect(resolveOddsPhase(24)).toBe("mid");
    expect(resolveOddsPhase(3)).toBe("lock");
    expect(resolveOddsPhase(1)).toBe("frozen");
  });

  test("hoursToKickoff", () => {
    const kickoff = 1_700_000_000;
    const now = new Date(kickoff * 1000);
    expect(hoursToKickoff(kickoff + 7200, now)).toBeCloseTo(2, 5);
  });

  test("movementFromOpening", () => {
    expect(
      movementFromOpening(
        { home: 2.0, draw: 3.4, away: 4.0 },
        { home: 1.85, draw: 3.4, away: 4.5 }
      )
    ).toEqual({
      home: "shortening",
      draw: "stable",
      away: "drifting",
    });
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
      })
    ).toBe(true);
    expect(match.homeOdds).toBe("1.85");
    expect(match.homeOddsBookmaker).toBe("Pinnacle");
    expect(match.homeOddsMovement).toBe("shortening");
    expect(match.drawOddsMovement).toBe("drifting");
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
  });
});
