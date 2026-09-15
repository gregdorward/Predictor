import {
  calculateOpponentWeightedAverage,
  blendRawAndOppAdj,
  expectedPointsFromXg,
  xPtsSeriesFromResults,
  averageFinite,
} from "./opponentAdjustedMetrics";

describe("calculateOpponentWeightedAverage", () => {
  test("inflates values vs stronger opponents", () => {
    const values = [1, 1];
    const opp = [1.0, 2.0];
    // baseline = mean opp = 1.5 → weights 1/1.5 and 2/1.5
    const avg = calculateOpponentWeightedAverage(values, opp);
    expect(avg).toBeCloseTo(1, 5); // both values 1 → still 1
    const values2 = [1, 2];
    const avg2 = calculateOpponentWeightedAverage(values2, opp);
    // (1*(1/1.5) + 2*(2/1.5)) / (1/1.5 + 2/1.5) = (1/1.5 + 4/1.5) / (3/1.5) = (5/1.5)/(2) = 5/3
    expect(avg2).toBeCloseTo(5 / 3, 5);
  });

  test("invert downweights against-metrics vs strong sides", () => {
    const values = [2, 2];
    const opp = [1.0, 2.0];
    const inv = calculateOpponentWeightedAverage(values, opp, null, {
      invert: true,
    });
    expect(inv).toBeCloseTo(2, 5);
    const values2 = [1, 3];
    // baseline 1.5; weights baseline/opp → 1.5/1 and 1.5/2
    // (1*1.5 + 3*0.75) / (1.5+0.75) = (1.5+2.25)/2.25 = 3.75/2.25 = 1.666...
    const inv2 = calculateOpponentWeightedAverage(values2, opp, null, {
      invert: true,
    });
    expect(inv2).toBeCloseTo(3.75 / 2.25, 5);
  });
});

describe("blendRawAndOppAdj", () => {
  test("weight 0 returns raw", () => {
    expect(blendRawAndOppAdj(10, 20, 0)).toBe(10);
  });
  test("weight 1 returns adj", () => {
    expect(blendRawAndOppAdj(10, 20, 1)).toBe(20);
  });
  test("weight 0.5 midpoints", () => {
    expect(blendRawAndOppAdj(10, 20, 0.5)).toBe(15);
  });
});

describe("expectedPointsFromXg", () => {
  test("band: draw when within τ", () => {
    expect(
      expectedPointsFromXg(1.2, 1.1, { mode: "band", drawBand: 0.3 })
    ).toBe(1);
  });
  test("band: win / loss outside τ", () => {
    expect(
      expectedPointsFromXg(2.0, 0.5, { mode: "band", drawBand: 0.3 })
    ).toBe(3);
    expect(
      expectedPointsFromXg(0.5, 2.0, { mode: "band", drawBand: 0.3 })
    ).toBe(0);
  });
  test("poisson: favourite gets >1.5 xPts", () => {
    const pts = expectedPointsFromXg(2.0, 0.8, { mode: "poisson" });
    expect(pts).toBeGreaterThan(1.8);
    expect(pts).toBeLessThanOrEqual(3);
  });
  test("poisson: even contest near 1.3–1.5", () => {
    const pts = expectedPointsFromXg(1.2, 1.2, { mode: "poisson" });
    expect(pts).toBeGreaterThan(1.0);
    expect(pts).toBeLessThan(1.6);
  });
});

describe("xPtsSeriesFromResults", () => {
  test("prefers npXG and averages", () => {
    const series = xPtsSeriesFromResults(
      [
        { npXG: 2, npXGAgainst: 0.5, XG: 9, XGAgainst: 9 },
        { npXG: 0.5, npXGAgainst: 2, XG: 9, XGAgainst: 9 },
      ],
      { mode: "band", drawBand: 0.3 }
    );
    expect(series).toEqual([3, 0]);
    expect(averageFinite(series)).toBe(1.5);
  });
});
