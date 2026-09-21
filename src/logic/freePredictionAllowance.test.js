/**
 * @jest-environment jsdom
 */
import {
  FREE_DAILY_PREDICTION_LIMIT,
  clearFreePredictionAllowance,
  getRemainingFreeUnlocks,
  getUnlockedFixtureIds,
  isFixturePredictionUnlocked,
  tryUnlockFixture,
} from "./freePredictionAllowance";

describe("freePredictionAllowance", () => {
  beforeEach(() => {
    clearFreePredictionAllowance();
    window.localStorage.clear();
  });

  test("paid users are always unlocked without consuming slots", () => {
    expect(isFixturePredictionUnlocked(true, 101)).toBe(true);
    expect(tryUnlockFixture(true, 101)).toEqual({
      unlocked: true,
      remaining: Infinity,
    });
    expect(getUnlockedFixtureIds().size).toBe(0);
    expect(getRemainingFreeUnlocks(true)).toBe(Infinity);
  });

  test("free users start locked and unlock on tryUnlockFixture", () => {
    expect(isFixturePredictionUnlocked(false, 42)).toBe(false);
    const result = tryUnlockFixture(false, 42);
    expect(result.unlocked).toBe(true);
    expect(result.remaining).toBe(FREE_DAILY_PREDICTION_LIMIT - 1);
    expect(isFixturePredictionUnlocked(false, 42)).toBe(true);
  });

  test("re-unlocking the same id does not consume another slot", () => {
    tryUnlockFixture(false, "99");
    const second = tryUnlockFixture(false, "99");
    expect(second.unlocked).toBe(true);
    expect(second.remaining).toBe(FREE_DAILY_PREDICTION_LIMIT - 1);
    expect(getUnlockedFixtureIds().size).toBe(1);
  });

  test("stops unlocking after the daily limit", () => {
    for (let i = 0; i < FREE_DAILY_PREDICTION_LIMIT; i += 1) {
      expect(tryUnlockFixture(false, i).unlocked).toBe(true);
    }
    expect(getRemainingFreeUnlocks(false)).toBe(0);
    const blocked = tryUnlockFixture(false, 999);
    expect(blocked).toEqual({ unlocked: false, remaining: 0 });
    expect(isFixturePredictionUnlocked(false, 999)).toBe(false);
  });

  test("persists across getUnlockedFixtureIds reads", () => {
    tryUnlockFixture(false, 7);
    tryUnlockFixture(false, 8);
    expect([...getUnlockedFixtureIds()].sort()).toEqual(["7", "8"]);
  });

  test("date rollover uses a different storage key", () => {
    const dayOne = new Date(2026, 8, 21); // Sep 21 local
    const dayTwo = new Date(2026, 8, 22);
    tryUnlockFixture(false, 1, dayOne);
    expect(isFixturePredictionUnlocked(false, 1, dayOne)).toBe(true);
    expect(isFixturePredictionUnlocked(false, 1, dayTwo)).toBe(false);
    expect(getRemainingFreeUnlocks(false, dayTwo)).toBe(
      FREE_DAILY_PREDICTION_LIMIT
    );
  });

  test("missing fixture id cannot unlock", () => {
    expect(tryUnlockFixture(false, null).unlocked).toBe(false);
    expect(tryUnlockFixture(false, undefined).unlocked).toBe(false);
    expect(tryUnlockFixture(false, "").unlocked).toBe(false);
  });
});
