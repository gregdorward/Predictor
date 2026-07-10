import {
  buildMetricTimeSeries,
  ATTACK_METRIC_DEFINITIONS,
  DEFENCE_METRIC_DEFINITIONS,
} from "./metricTimeSeries";

describe("buildMetricTimeSeries", () => {
  test("sorts games chronologically and maps attack and defence metrics", () => {
    const series = buildMetricTimeSeries([
      {
        dateRaw: 200,
        date: "12 Jan 2026, 15:00",
        scored: 2,
        XG: 1.8,
        shots: 14,
        sot: 6,
        dangerousAttacks: 55,
        corners: 7,
        conceeded: 1,
        XGAgainst: 0.9,
        shotsAgainst: 9,
        sotAgainst: 3,
        dangerousAttacksAgainst: 41,
        cornersAgainst: 4,
      },
      {
        dateRaw: 100,
        date: "5 Jan 2026, 15:00",
        scored: 0,
        XG: 0.4,
        shots: 8,
        sot: 2,
        dangerousAttacks: 33,
        corners: 3,
        conceeded: 2,
        XGAgainst: 1.7,
        shotsAgainst: 12,
        sotAgainst: 5,
        dangerousAttacksAgainst: 48,
        cornersAgainst: 6,
      },
    ]);

    expect(series).toHaveLength(2);
    expect(series[0].label).toBe("5 Jan 2026");
    expect(series[0].scored).toBe(0);
    expect(series[0].dangerousAttacksAgainst).toBe(48);
    expect(series[1].label).toBe("12 Jan 2026");
    expect(series[1].sot).toBe(6);
    expect(series[1].conceeded).toBe(1);
  });

  test("falls back to zero for invalid metric values", () => {
    const [point] = buildMetricTimeSeries([
      {
        dateRaw: 1,
        scored: "x",
        XG: null,
        shots: undefined,
        sot: NaN,
        dangerousAttacks: -1,
        corners: 4,
        conceeded: 1,
        XGAgainst: 1,
        shotsAgainst: 1,
        sotAgainst: 1,
        dangerousAttacksAgainst: 1,
        cornersAgainst: 1,
      },
    ]);

    expect(point.scored).toBe(0);
    expect(point.XG).toBe(0);
    expect(point.shots).toBe(0);
    expect(point.sot).toBe(0);
    expect(point.dangerousAttacks).toBe(-1);
    expect(point.corners).toBe(4);
  });

  test("exports attack and defence metric definitions", () => {
    expect(ATTACK_METRIC_DEFINITIONS.length).toBeGreaterThan(0);
    expect(DEFENCE_METRIC_DEFINITIONS.length).toBeGreaterThan(0);
    expect(DEFENCE_METRIC_DEFINITIONS.every((metric) => metric.lowerIsBetter)).toBe(true);
  });
});
