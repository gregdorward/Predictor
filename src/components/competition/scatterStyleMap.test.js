import {
  buildCrossLeagueAveragePoint,
  computeAxisRange,
  comparisonMetricToAxisMeta,
  CROSS_LEAGUE_AVERAGE_NAME,
} from "./scatterStyleMap";
import { getComparisonMetric } from "../../seo/competitionOverviewData";

const SAMPLE_COMPETITIONS = [
  { name: "A", avgGoals: 3, btts: 60 },
  { name: "B", avgGoals: 2, btts: 50 },
  { name: "C", avgGoals: 4, btts: 70 },
];

describe("buildCrossLeagueAveragePoint", () => {
  it("returns unweighted means for both axes", () => {
    const point = buildCrossLeagueAveragePoint(
      SAMPLE_COMPETITIONS,
      "avgGoals",
      "btts"
    );
    expect(point.name).toBe(CROSS_LEAGUE_AVERAGE_NAME);
    expect(point.isLeagueAverage).toBe(true);
    expect(point.avgGoals).toBe(3);
    expect(point.btts).toBe(60);
  });

  it("returns null when a metric is missing on all rows", () => {
    const rows = [{ name: "X", avgGoals: 2, cards: null }];
    expect(buildCrossLeagueAveragePoint(rows, "avgGoals", "cards")).toBeNull();
  });
});

describe("comparisonMetricToAxisMeta", () => {
  it("maps percent units to axis suffix", () => {
    const meta = comparisonMetricToAxisMeta(getComparisonMetric("btts"));
    expect(meta.suffix).toBe("%");
    expect(meta.label).toBe("Both teams to score");
  });
});

describe("computeAxisRange", () => {
  it("floors percent metrics at zero", () => {
    const metric = comparisonMetricToAxisMeta(getComparisonMetric("btts"));
    const range = computeAxisRange([2, 4, 6], metric);
    expect(range.min).toBeGreaterThanOrEqual(0);
  });
});
