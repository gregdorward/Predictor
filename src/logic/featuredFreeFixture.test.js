/**
 * @jest-environment jsdom
 */
import {
  clearFreePredictionAllowance,
  tryUnlockFixture,
} from "./freePredictionAllowance";
import {
  getFeaturedFixtureId,
  hasFixtureFullAccess,
  isFeaturedFreeFixture,
  orderFixturesLikeHomepage,
} from "./featuredFreeFixture";

const orderedLeagues = [
  { element: { id: 100 } },
  { element: { id: 200 } },
];

describe("featuredFreeFixture", () => {
  beforeEach(() => {
    clearFreePredictionAllowance();
    window.localStorage.clear();
  });

  test("orderFixturesLikeHomepage follows league order then API order within league", () => {
    const raw = [
      { id: 3, competition_id: 200 },
      { id: 1, competition_id: 100 },
      { id: 2, competition_id: 100 },
    ];
    const ordered = orderFixturesLikeHomepage(raw, orderedLeagues);
    expect(ordered.map((f) => f.id)).toEqual([1, 2, 3]);
  });

  test("getFeaturedFixtureId returns first ordered fixture id", () => {
    const raw = [
      { id: 99, competition_id: 200 },
      { id: 42, competition_id: 100 },
    ];
    expect(getFeaturedFixtureId(raw, orderedLeagues)).toBe("42");
  });

  test("getFeaturedFixtureId without league order uses API list order", () => {
    const raw = [
      { id: 99, competition_id: 200 },
      { id: 42, competition_id: 100 },
    ];
    expect(getFeaturedFixtureId(raw, [])).toBe("99");
    expect(getFeaturedFixtureId(raw, orderedLeagues)).toBe("42");
  });

  test("isFeaturedFreeFixture matches normalized ids", () => {
    expect(isFeaturedFreeFixture(42, "42")).toBe(true);
    expect(isFeaturedFreeFixture("42", 42)).toBe(true);
    expect(isFeaturedFreeFixture(43, 42)).toBe(false);
  });

  test("hasFixtureFullAccess grants featured without consuming daily unlock", () => {
    expect(hasFixtureFullAccess(false, 7, "7")).toBe(true);
    expect(getFeaturedFixtureId([{ id: 7, competition_id: 100 }], orderedLeagues)).toBe(
      "7"
    );
    expect(tryUnlockFixture(false, 8).unlocked).toBe(true);
    expect(hasFixtureFullAccess(false, 7, "7")).toBe(true);
    expect(hasFixtureFullAccess(false, 9, "7")).toBe(false);
  });

  test("hasFixtureFullAccess respects daily unlock for non-featured", () => {
    tryUnlockFixture(false, 55);
    expect(hasFixtureFullAccess(false, 55, "1")).toBe(true);
    expect(hasFixtureFullAccess(false, 56, "1")).toBe(false);
  });
});
