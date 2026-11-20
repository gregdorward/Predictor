import {
  buildAttackDefenceMetricTrends,
  buildMetricTrendRows,
  calculateLinearRegressionSlope,
  classifyAgainstAverage,
  classifyMetricTrend,
} from "./metricTrendAnalysis";
import { buildMetricTimeSeries } from "./metricTimeSeries";

describe("metricTrendAnalysis", () => {
  test("detects improving attack trend when values rise across the season", () => {
    const values = [0.5, 0.8, 1.0, 1.3, 1.6, 2.0];
    const trend = classifyMetricTrend(values, {
      lowerIsBetter: false,
      metricKey: "scored",
    });

    expect(trend.direction).toBe("improving");
    expect(trend.slope).toBeGreaterThan(0);
    expect(trend.detailPrimary).toContain("per game");
    expect(trend.detailSecondary).toContain("First");
    expect(trend.detailSecondary).toContain("Last");
  });

  test("detects improving defence trend when values fall across the season", () => {
    const values = [2.4, 2.1, 1.8, 1.5, 1.1, 0.8];
    const trend = classifyMetricTrend(values, {
      lowerIsBetter: true,
      metricKey: "conceeded",
    });

    expect(trend.direction).toBe("improving");
    expect(trend.slope).toBeGreaterThan(0);
  });

  test("marks flat trends when season change is small", () => {
    const values = [1.4, 1.5, 1.4, 1.5, 1.4, 1.5];
    const trend = classifyMetricTrend(values, {
      lowerIsBetter: false,
      metricKey: "scored",
    });

    expect(trend.direction).toBe("stable");
  });

  test("builds attack and defence rows for both teams", () => {
    const sampleResults = [
      {
        dateRaw: 1,
        scored: 1,
        XG: 1.1,
        shots: 10,
        sot: 4,
        dangerousAttacks: 40,
        corners: 5,
        conceeded: 2,
        XGAgainst: 1.5,
        shotsAgainst: 12,
        sotAgainst: 5,
        dangerousAttacksAgainst: 50,
        cornersAgainst: 4,
      },
      {
        dateRaw: 2,
        scored: 2,
        XG: 1.4,
        shots: 12,
        sot: 5,
        dangerousAttacks: 45,
        corners: 6,
        conceeded: 1,
        XGAgainst: 1.2,
        shotsAgainst: 10,
        sotAgainst: 4,
        dangerousAttacksAgainst: 44,
        cornersAgainst: 3,
      },
      {
        dateRaw: 3,
        scored: 2,
        XG: 1.6,
        shots: 13,
        sot: 6,
        dangerousAttacks: 48,
        corners: 7,
        conceeded: 1,
        XGAgainst: 1.0,
        shotsAgainst: 9,
        sotAgainst: 3,
        dangerousAttacksAgainst: 40,
        cornersAgainst: 3,
      },
    ];

    const trends = buildAttackDefenceMetricTrends(sampleResults, sampleResults);

    expect(trends.attack.home).toHaveLength(6);
    expect(trends.defence.away).toHaveLength(6);
    expect(trends.attack.home[0].label).toBe("Goals");
    expect(["improving", "worsening", "stable"]).toContain(
      trends.attack.home[0].direction
    );
  });

  test("calculateLinearRegressionSlope returns zero slope for flat values", () => {
    const { slope } = calculateLinearRegressionSlope([2, 2, 2, 2]);
    expect(slope).toBe(0);
  });

  test("classifies a season average against the competition average", () => {
    expect(classifyAgainstAverage(1.8, 1.3)).toBe("above");
    expect(classifyAgainstAverage(0.8, 1.3)).toBe("below");
    expect(classifyAgainstAverage(1.32, 1.3)).toBe("level");
    expect(classifyAgainstAverage(0.8, 1.3, { lowerIsBetter: true })).toBe("above");
    expect(classifyAgainstAverage(1.8, 1.3, { lowerIsBetter: true })).toBe("below");
    expect(classifyAgainstAverage(1.8, null)).toBeNull();
  });

  test("marks attack rows above average and defence rows by the mirrored average", () => {
    const series = [
      { scored: 2, shotsAgainst: 8 },
      { scored: 2, shotsAgainst: 8 },
      { scored: 2, shotsAgainst: 8 },
    ];
    const averages = { scored: 1.2, shots: 13 };

    const attack = buildMetricTrendRows(
      series,
      [{ key: "scored", label: "Goals" }],
      averages
    );
    const defence = buildMetricTrendRows(
      series,
      [{ key: "shotsAgainst", label: "Shots against", lowerIsBetter: true }],
      averages
    );

    expect(attack[0].level).toBe("above");
    expect(attack[0].levelDetail).toBe(
      "Season average 2 per game, better than the competition average of 1.2."
    );
    expect(defence[0].level).toBe("above");
    expect(defence[0].competitionAvg).toBe(13);
  });

  test("leaves the level off when no competition average is available", () => {
    const rows = buildMetricTrendRows(
      [{ scored: 2 }, { scored: 2 }, { scored: 2 }],
      [{ key: "scored", label: "Goals" }]
    );

    expect(rows[0].level).toBeNull();
    expect(rows[0].levelDetail).toBe("");
  });

  test("buildMetricTrendRows uses chronological series order", () => {
    const series = buildMetricTimeSeries([
      { dateRaw: 3, scored: 3 },
      { dateRaw: 1, scored: 1 },
      { dateRaw: 2, scored: 2 },
    ]);
    const rows = buildMetricTrendRows(series, [{ key: "scored", label: "Goals" }]);

    expect(rows[0].direction).toBe("improving");
  });
});
