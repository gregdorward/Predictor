import {
  applyBestFtOddsToMatch,
  formatOddsForDisplay,
  isBestOddsEligible,
  resolveBestFtOdds,
  toLocalIsoDate,
} from "./bestMatchOdds.js";
import { DECIMAL_ODDS, FRACTIONAL_ODDS } from "../utils/oddsPreference.js";

describe("bestMatchOdds", () => {
  const comparison = {
    "FT Result": {
      1: { bet365: 1.9, Pinnacle: 2.05, Unibet: 2.0 },
      X: { bet365: 3.4, Pinnacle: 3.6 },
      2: { bet365: 4.0, Pinnacle: 3.9 },
    },
  };

  const pastUnix = Math.floor(Date.now() / 1000) - 3 * 24 * 60 * 60;
  const futureUnix = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60;

  test("resolveBestFtOdds picks the highest price per side", () => {
    const best = resolveBestFtOdds(comparison);
    expect(best.source).toBe("comparison");
    expect(best.home).toEqual({ odds: 2.05, bookmaker: "Pinnacle" });
    expect(best.draw).toEqual({ odds: 3.6, bookmaker: "Pinnacle" });
    expect(best.away).toEqual({ odds: 4.0, bookmaker: "bet365" });
  });

  test("falls back to odds_ft when comparison missing", () => {
    const best = resolveBestFtOdds(null, {
      home: 1.85,
      draw: 3.5,
      away: 4.2,
    });
    expect(best.source).toBe("fallback");
    expect(best.home.odds).toBe(1.85);
    expect(best.home.bookmaker).toBeNull();
  });

  test("isBestOddsEligible is true on match day or earlier kickoff", () => {
    expect(isBestOddsEligible({ date: pastUnix })).toBe(true);
    expect(isBestOddsEligible({ status: "complete", date: futureUnix })).toBe(
      true
    );
  });

  test("isBestOddsEligible is false for future kickoffs", () => {
    expect(
      isBestOddsEligible({ date: futureUnix, status: "incomplete" })
    ).toBe(false);
  });

  test("isBestOddsEligible treats local today as eligible", () => {
    const now = new Date();
    const noonLocal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      12,
      0,
      0
    );
    expect(
      isBestOddsEligible(
        { date: Math.floor(noonLocal.getTime() / 1000) },
        now
      )
    ).toBe(true);
    expect(toLocalIsoDate(noonLocal)).toBe(toLocalIsoDate(now));
  });

  test("applyBestFtOddsToMatch respects decimal display preference", () => {
    const match = {
      date: pastUnix,
      homeOdds: "1.90",
      drawOdds: "3.40",
      awayOdds: "4.00",
      fractionHome: "1.90",
      fractionDraw: "3.40",
      fractionAway: "4.00",
    };
    expect(
      applyBestFtOddsToMatch(match, comparison, {
        oddsPreference: DECIMAL_ODDS,
      })
    ).toBe(true);
    expect(match.homeOdds).toBe("2.05");
    expect(match.homeOddsBookmaker).toBe("Pinnacle");
    expect(match.fractionHome).toBe("2.05");
  });

  test("applyBestFtOddsToMatch respects fractional display preference", () => {
    const match = {
      date: pastUnix,
      homeOdds: "1.90",
      drawOdds: "3.40",
      awayOdds: "4.00",
      fractionHome: "9/10",
      fractionDraw: "12/5",
      fractionAway: "3/1",
    };
    expect(
      applyBestFtOddsToMatch(match, comparison, {
        oddsPreference: FRACTIONAL_ODDS,
      })
    ).toBe(true);
    expect(match.homeOdds).toBe("2.05");
    expect(match.fractionHome).toBe(
      formatOddsForDisplay(2.05, FRACTIONAL_ODDS)
    );
    expect(String(match.fractionHome)).toMatch(/\//);
  });

  test("applyBestFtOddsToMatch keeps averages for future fixtures", () => {
    const match = {
      date: futureUnix,
      status: "incomplete",
      homeOdds: "1.90",
      drawOdds: "3.40",
      awayOdds: "4.00",
      fractionHome: "1.90",
    };
    expect(applyBestFtOddsToMatch(match, comparison)).toBe(false);
    expect(match.homeOdds).toBe("1.90");
    expect(match.homeOddsBookmaker).toBeUndefined();
  });

  test("applyBestFtOddsToMatch no-ops without comparison", () => {
    const match = {
      date: pastUnix,
      homeOdds: "1.90",
      drawOdds: "3.40",
      awayOdds: "4.00",
    };
    expect(applyBestFtOddsToMatch(match, null)).toBe(false);
    expect(match.homeOdds).toBe("1.90");
    expect(match.homeOddsBookmaker).toBeUndefined();
  });
});
