import {
  blendModelWithMarket1x2,
  normalizeThreeWayPct,
  rawImpliedPct,
} from "./oddsProbabilityBlend.js";

describe("oddsProbabilityBlend", () => {
  test("rawImpliedPct from decimal odds", () => {
    expect(rawImpliedPct(2)).toBeCloseTo(50, 5);
    expect(rawImpliedPct(4)).toBeCloseTo(25, 5);
  });

  test("normalizeThreeWayPct de-vigs", () => {
    const n = normalizeThreeWayPct(50, 30, 30);
    expect(n[0] + n[1] + n[2]).toBeCloseTo(100, 5);
  });

  test("weight 0 leaves model unchanged", () => {
    const out = blendModelWithMarket1x2(60, 25, 15, 2.1, 3.4, 3.8, 0);
    expect(out.blended).toBe(false);
    expect(out.home).toBeCloseTo(60, 5);
  });

  test("weight 1 returns pure market", () => {
    const out = blendModelWithMarket1x2(60, 25, 15, 2, 4, 4, 1);
    expect(out.blended).toBe(true);
    expect(out.home).toBeCloseTo(50, 5);
    expect(out.draw).toBeCloseTo(25, 5);
    expect(out.away).toBeCloseTo(25, 5);
  });

  test("weight 0.5 midpoints model and market", () => {
    const out = blendModelWithMarket1x2(60, 20, 20, 2, 4, 4, 0.5);
    // market: 50/25/25; midpoint 55/22.5/22.5
    expect(out.home).toBeCloseTo(55, 5);
    expect(out.draw).toBeCloseTo(22.5, 5);
    expect(out.away).toBeCloseTo(22.5, 5);
  });
});
