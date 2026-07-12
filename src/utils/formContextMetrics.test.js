import {
  buildFormContextMetrics,
  buildGameStateTiming,
  buildRestAndCongestion,
  buildRollingOverUnder,
  buildScoringVariance,
  buildStrengthOfSchedule,
  formatMatchContextForAI,
} from "./formContextMetrics";

const DAY = 86400;

describe("formContextMetrics", () => {
  const fixtureUnix = 1_700_000_000;

  const sampleResults = [
    {
      dateRaw: fixtureUnix - 3 * DAY,
      scored: 2,
      conceeded: 1,
      points: 3,
      result: "W",
      oppositionPPG: 1.1,
    },
    {
      dateRaw: fixtureUnix - 6 * DAY,
      scored: 0,
      conceeded: 0,
      points: 1,
      result: "D",
      oppositionPPG: 1.0,
    },
    {
      dateRaw: fixtureUnix - 10 * DAY,
      scored: 1,
      conceeded: 0,
      points: 3,
      result: "W",
      oppositionPPG: 1.2,
    },
    {
      dateRaw: fixtureUnix - 13 * DAY,
      scored: 3,
      conceeded: 2,
      points: 3,
      result: "W",
      oppositionPPG: 1.8,
    },
    {
      dateRaw: fixtureUnix - 17 * DAY,
      scored: 0,
      conceeded: 2,
      points: 0,
      result: "L",
      oppositionPPG: 1.9,
    },
  ];

  test("builds rest and congestion from date_unix gaps", () => {
    const rest = buildRestAndCongestion(sampleResults, fixtureUnix);
    expect(rest.daysSinceLastMatch).toBe(3);
    expect(rest.matchesInLast7Days).toBe(2);
    expect(rest.restLabel).toBe("Short rest");
    expect(rest.congestionLabel).toBe("Congested");
  });

  test("builds rolling over/under percentages from goal totals", () => {
    const overUnder = buildRollingOverUnder(sampleResults);
    // totals: 3, 0, 1, 5, 2 → last5 O2.5 = 2/5 = 40%, last5 U2.5 = 3/5 = 60%
    expect(overUnder.over25Last5Percentage).toBe(40);
    expect(overUnder.under25Last5Percentage).toBe(60);
    expect(overUnder.avgGoalsPerGameLast5).toBe(2.2);
  });

  test("builds scored-first and late-goal rates from timings", () => {
    const gameState = buildGameStateTiming(
      [
        {
          goal_timings_recorded: 1,
          homeGoals_timings: ["12", "80"],
          awayGoals_timings: ["55"],
          homeGoalCount: 2,
          awayGoalCount: 1,
        },
        {
          goal_timings_recorded: 1,
          homeGoals_timings: ["90+1"],
          awayGoals_timings: ["8"],
          homeGoalCount: 1,
          awayGoalCount: 1,
        },
        {
          goal_timings_recorded: 1,
          homeGoals_timings: ["30"],
          awayGoals_timings: [],
          homeGoalCount: 1,
          awayGoalCount: 0,
        },
      ],
      []
    );

    expect(gameState.hasData).toBe(true);
    expect(gameState.scoredFirstPercentage).toBe(67);
    expect(gameState.lateGoalsScored).toBe(2);
  });

  test("flags softer recent schedules via opposition PPG", () => {
    const sos = buildStrengthOfSchedule(sampleResults);
    expect(sos.avOppositionPPGLast5).toBeCloseTo(1.4, 1);
    expect(sos.scheduleLabel).toBeTruthy();
    expect(sos.avOppositionPPGAll).toBeCloseTo(1.4, 1);
  });

  test("labels scoring variance from totals and margins", () => {
    const variance = buildScoringVariance(sampleResults);
    expect(variance.oneGoalGamePercentage).toBe(60);
    expect(variance.drawPercentage).toBe(20);
    expect(variance.varianceLabel).toBeTruthy();
  });

  test("buildFormContextMetrics returns all sections", () => {
    const metrics = buildFormContextMetrics({
      allTeamResults: sampleResults,
      homeFixtures: [
        {
          goal_timings_recorded: 1,
          homeGoals_timings: ["10"],
          awayGoals_timings: ["70"],
          homeGoalCount: 1,
          awayGoalCount: 1,
        },
        {
          goal_timings_recorded: 1,
          homeGoals_timings: ["5", "88"],
          awayGoals_timings: [],
          homeGoalCount: 2,
          awayGoalCount: 0,
        },
        {
          goal_timings_recorded: 1,
          homeGoals_timings: ["40"],
          awayGoals_timings: ["20"],
          homeGoalCount: 1,
          awayGoalCount: 1,
        },
      ],
      awayFixtures: [],
      fixtureUnix,
    });

    expect(metrics.rest.daysSinceLastMatch).toBe(3);
    expect(metrics.overUnder.over25Last5Percentage).toBe(40);
    expect(metrics.strengthOfSchedule.avOppositionPPGAll).not.toBeNull();
    expect(metrics.scoringVariance.drawPercentage).toBe(20);
    expect(metrics.gameState.hasData).toBe(true);
  });

  test("formatMatchContextForAI returns interpretable payload fields", () => {
    const metrics = buildFormContextMetrics({
      allTeamResults: sampleResults,
      homeFixtures: [],
      awayFixtures: [],
      fixtureUnix,
    });
    const formatted = formatMatchContextForAI(metrics);

    expect(formatted).not.toBeNull();
    expect(formatted.restAndCongestion.daysSinceLastMatch).toBe(3);
    expect(formatted.goalMarketContext.over25PercentLast5).toBe("40%");
    expect(formatted.strengthOfSchedule.oppositionPpgLast5).toBeTruthy();
    expect(Array.isArray(formatted.interpretationNotes)).toBe(true);
    expect(formatMatchContextForAI(null)).toBeNull();
  });
});
