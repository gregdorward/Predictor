import {
  MAX_RADAR_METRICS,
  MIN_RADAR_METRICS,
  applyPresetKeys,
  formatRadarRawValue,
  getAvailableMetrics,
  getMetricByKey,
  isCustomRadarUnlocked,
  isMetricAvailable,
  normalizeRadarValue,
  toggleMetricSelection,
} from "./customRadarMetrics";

describe("normalizeRadarValue", () => {
  test("maps value within fixed range to 0–1", () => {
    const metric = { range: [0, 10], higherIsBetter: true };
    expect(normalizeRadarValue(0, metric)).toBe(0);
    expect(normalizeRadarValue(5, metric)).toBe(0.5);
    expect(normalizeRadarValue(10, metric)).toBe(1);
  });

  test("clamps outside the range", () => {
    const metric = { range: [0, 3], higherIsBetter: true };
    expect(normalizeRadarValue(-1, metric)).toBe(0);
    expect(normalizeRadarValue(9, metric)).toBe(1);
  });

  test("inverts lower-is-better metrics", () => {
    const metric = { range: [0, 3], higherIsBetter: false };
    expect(normalizeRadarValue(0, metric)).toBe(1);
    expect(normalizeRadarValue(3, metric)).toBe(0);
    expect(normalizeRadarValue(1.5, metric)).toBe(0.5);
  });

  test("returns 0 for missing values", () => {
    const metric = { range: [0, 3], higherIsBetter: true };
    expect(normalizeRadarValue(null, metric)).toBe(0);
    expect(normalizeRadarValue(NaN, metric)).toBe(0);
  });
});

describe("formatRadarRawValue", () => {
  test("formats with decimals and optional suffix", () => {
    expect(formatRadarRawValue(1.82, { decimals: 2 })).toBe("1.82");
    expect(
      formatRadarRawValue(54.5, { decimals: 1, suffix: "%" })
    ).toBe("54.5%");
  });

  test("returns dash for missing", () => {
    expect(formatRadarRawValue(null, { decimals: 2 })).toBe("-");
  });
});

describe("availability and selection limits", () => {
  const shots = {
    key: "shots",
    getValue: (stats) =>
      stats?.shots != null && stats.shots !== "-" ? Number(stats.shots) : null,
  };
  const sofaOnly = {
    key: "bigChances",
    getValue: (stats) =>
      stats?.bigChances != null && stats.bigChances !== "-"
        ? Number(stats.bigChances)
        : null,
  };

  test("hides metric when both teams lack data", () => {
    expect(
      isMetricAvailable(sofaOnly, { shots: "12" }, { shots: "10" }, {}, {})
    ).toBe(false);
    expect(
      isMetricAvailable(
        sofaOnly,
        { bigChances: "2.1" },
        { bigChances: "-" },
        {},
        {}
      )
    ).toBe(true);
  });

  test("getAvailableMetrics filters catalog entries without values", () => {
    const home = { goals: "1.5", shots: "12", bigChances: "-" };
    const away = { goals: "1.2", shots: "10", bigChances: "-" };
    const available = getAvailableMetrics(home, away, {}, {});
    const keys = available.map((m) => m.key);
    expect(keys).toContain("goals");
    expect(keys).toContain("shots");
    expect(keys).not.toContain("bigChances");
  });

  test("fouls fall back to allTeamResults averages from getPastLeagueResults", () => {
    const homeForm = {
      allTeamResults: [
        { fouls: 12, foulsAgainst: 11 },
        { fouls: 14, foulsAgainst: 9 },
        { fouls: 10, foulsAgainst: 13 },
      ],
    };
    const awayForm = {
      allTeamResults: [
        { fouls: 8, foulsAgainst: 10 },
        { fouls: 9, foulsAgainst: 12 },
      ],
    };
    const available = getAvailableMetrics({}, {}, homeForm, awayForm);
    const keys = available.map((m) => m.key);
    expect(keys).toContain("FoulsPerGame");
    expect(keys).toContain("foulsAgainst");
  });

  test("cards use CardsTotal divided by games when SofaScore missing", () => {
    const homeForm = {
      CardsTotal: 40,
      allTeamResults: new Array(10).fill({ fouls: 10 }),
    };
    const awayForm = {
      CardsTotal: 30,
      allTeamResults: new Array(10).fill({ fouls: 10 }),
    };
    const available = getAvailableMetrics({}, {}, homeForm, awayForm);
    expect(available.map((m) => m.key)).toContain("CardsPerGame");
    const cards = available.find((m) => m.key === "CardsPerGame");
    expect(cards.getValue({}, homeForm)).toBe(4);
  });

  test("penalties for sums allTeamResults.penaltiesWon", () => {
    const homeForm = {
      allTeamResults: [
        { penaltiesWon: 1, penaltiesAgainst: 0 },
        { penaltiesWon: 0, penaltiesAgainst: 1 },
        { penaltiesWon: 2, penaltiesAgainst: 0 },
      ],
    };
    const awayForm = {
      allTeamResults: [
        { penaltiesWon: 0, penaltiesAgainst: 0 },
        { penaltiesWon: 1, penaltiesAgainst: 1 },
      ],
    };
    const available = getAvailableMetrics({}, {}, homeForm, awayForm);
    const keys = available.map((m) => m.key);
    expect(keys).toContain("PenaltiesFor");
    expect(keys).toContain("PenaltiesConceded");
    const pensFor = available.find((m) => m.key === "PenaltiesFor");
    expect(pensFor.getValue({}, homeForm)).toBe(3);
  });

  test("big chances uses per-game values so radar does not clamp to the edge", () => {
    const metric = getMetricByKey("bigChances");
    const stats = { bigChances: "60", gameCount: "20" };
    const perGame = metric.getValue(stats, {});
    expect(perGame).toBe(3);
    expect(normalizeRadarValue(perGame, metric)).toBe(0.75);
    expect(normalizeRadarValue(60, metric)).toBe(1);
  });

  test("applyPresetKeys intersects and clamps to max", () => {
    const available = [
      "goals",
      "XG",
      "shots",
      "sot",
      "dangerousAttacks",
      "goalConversionRate",
      "ppg",
      "possession",
      "extra",
      "corners",
      "fouls",
    ];
    const preset = [
      "goals",
      "XG",
      "shots",
      "sot",
      "dangerousAttacks",
      "goalConversionRate",
      "missing",
      "ppg",
      "possession",
      "extra",
      "corners",
      "fouls",
    ];
    const result = applyPresetKeys(preset, available);
    expect(result).not.toContain("missing");
    expect(result.length).toBeLessThanOrEqual(MAX_RADAR_METRICS);
    expect(result.length).toBe(MAX_RADAR_METRICS);
  });

  test("toggleMetricSelection enforces max selection limit", () => {
    const available = Array.from({ length: 12 }, (_, i) => `m${i}`);
    const selected = available.slice(0, MAX_RADAR_METRICS);
    expect(toggleMetricSelection(selected, "m10", available)).toEqual(selected);
    expect(toggleMetricSelection(selected, "m0", available)).toEqual(
      selected.slice(1)
    );
  });

  test("toggle can go below min (UI hides chart)", () => {
    const available = ["a", "b", "c", "d"];
    let next = ["a", "b", "c"];
    next = toggleMetricSelection(next, "c", available);
    expect(next.length).toBe(2);
    expect(next.length).toBeLessThan(MIN_RADAR_METRICS);
  });
});

describe("isCustomRadarUnlocked", () => {
  test("paid users always unlocked", () => {
    expect(isCustomRadarUnlocked(true, 99)).toBe(true);
    expect(isCustomRadarUnlocked(true, -1)).toBe(true);
  });

  test("free users unlocked only for first 5 fixtures", () => {
    expect(isCustomRadarUnlocked(false, 0)).toBe(true);
    expect(isCustomRadarUnlocked(false, 4)).toBe(true);
    expect(isCustomRadarUnlocked(false, 5)).toBe(false);
    expect(isCustomRadarUnlocked(false, -1)).toBe(false);
    expect(isCustomRadarUnlocked(false, undefined)).toBe(false);
  });
});
