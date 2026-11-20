import {
  buildGoalTimingHeatmap,
  buildGoalTimingRates,
  getGoalTimingBucketIndex,
  getGoalTimingHeatOpacity,
  parseGoalMinute,
  scaleGoalTimingRates,
} from "./goalTimingHeatmap";

describe("goalTimingHeatmap", () => {
  test("parses regular and stoppage-time minutes", () => {
    expect(parseGoalMinute("7")).toBe(7);
    expect(parseGoalMinute("90+3")).toBe(93);
    expect(parseGoalMinute("45+2")).toBe(47);
    expect(parseGoalMinute("")).toBeNull();
  });

  test("maps minutes into 15-minute buckets", () => {
    expect(getGoalTimingBucketIndex(7)).toBe(0);
    expect(getGoalTimingBucketIndex(47)).toBe(3);
    expect(getGoalTimingBucketIndex(93)).toBe(5);
  });

  test("aggregates scored and conceded timings from home and away fixtures", () => {
    const heatmap = buildGoalTimingHeatmap(
      [
        {
          goal_timings_recorded: 1,
          homeGoals_timings: ["7", "42"],
          awayGoals_timings: ["64"],
        },
      ],
      [
        {
          goal_timings_recorded: 1,
          homeGoals_timings: ["10"],
          awayGoals_timings: ["90+1"],
        },
      ]
    );

    expect(heatmap.scored).toEqual([1, 0, 1, 0, 0, 1]);
    expect(heatmap.conceded).toEqual([1, 0, 0, 0, 1, 0]);
    expect(heatmap.hasData).toBe(true);
    expect(heatmap.goalsWithTimings).toBe(5);
  });

  test("returns hasData false when there are too few timed goals", () => {
    const heatmap = buildGoalTimingHeatmap(
      [
        {
          goal_timings_recorded: 1,
          homeGoals_timings: ["12"],
          awayGoals_timings: [],
        },
      ],
      []
    );

    expect(heatmap.hasData).toBe(false);
  });

  test("counts recorded matches including goalless ones", () => {
    const heatmap = buildGoalTimingHeatmap(
      [
        { goal_timings_recorded: 1, homeGoals_timings: ["12"], awayGoals_timings: [] },
        { goal_timings_recorded: 1, homeGoals_timings: [], awayGoals_timings: [] },
      ],
      [{ goal_timings_recorded: 0, homeGoals_timings: [], awayGoals_timings: [] }]
    );

    expect(heatmap.matchesWithTimings).toBe(1);
    expect(heatmap.matchesRecorded).toBe(2);
  });

  test("builds per team per game rates from recorded fixtures", () => {
    const recorded = Array.from({ length: 9 }, () => ({
      goal_timings_recorded: 1,
      homeGoals_timings: [],
      awayGoals_timings: [],
    }));
    const fixtures = [
      ...recorded,
      { goal_timings_recorded: 1, homeGoals_timings: ["5", "88"], awayGoals_timings: ["90+2", "50"] },
      { goal_timings_recorded: 0, homeGoals_timings: ["20"], awayGoals_timings: [] },
    ];

    expect(buildGoalTimingRates(fixtures)).toEqual([0.05, 0, 0, 0.05, 0, 0.1]);
    expect(buildGoalTimingRates(recorded)).toBeNull();
  });

  test("scales rates to a team's recorded games", () => {
    const scaled = scaleGoalTimingRates([0.05, 0.1], 14);
    expect(scaled[0]).toBeCloseTo(0.7);
    expect(scaled[1]).toBeCloseTo(1.4);
    expect(scaleGoalTimingRates(null, 14)).toBeNull();
    expect(scaleGoalTimingRates([0.05], 0)).toBeNull();
  });

  test("derives smooth heat opacity from bucket counts", () => {
    expect(getGoalTimingHeatOpacity(0, 10)).toBe(0);
    expect(getGoalTimingHeatOpacity(2, 10)).toBeCloseTo(0.304);
    expect(getGoalTimingHeatOpacity(10, 10)).toBeCloseTo(0.88);
  });
});
