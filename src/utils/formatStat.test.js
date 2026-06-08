import {
  fixedStatOrDash,
  formatProbabilityPercent,
  getProbabilityNumber,
  isMissingStat,
  ratioOrDash,
  ratioPercentOrDash,
  statOrDash,
  statPercentDisplay,
  STAT_FALLBACK,
} from "./formatStat";

describe("formatStat fallbacks", () => {
  test("statOrDash returns '-' for missing values", () => {
    expect(statOrDash(undefined)).toBe(STAT_FALLBACK);
    expect(statOrDash(null)).toBe(STAT_FALLBACK);
    expect(statOrDash("N/A")).toBe(STAT_FALLBACK);
    expect(statOrDash(NaN)).toBe(STAT_FALLBACK);
  });

  test("statOrDash formats valid numbers", () => {
    expect(statOrDash(1.5)).toBe("1.5");
    expect(statOrDash(2)).toBe("2");
  });

  test("ratio helpers avoid NaN", () => {
    expect(ratioOrDash(10, 0)).toBe(STAT_FALLBACK);
    expect(ratioPercentOrDash(1, 4)).toBe("25.00");
  });

  test("fixedStatOrDash handles invalid input", () => {
    expect(fixedStatOrDash(undefined)).toBe(STAT_FALLBACK);
    expect(fixedStatOrDash(12.345)).toBe("12.35");
  });

  test("statPercentDisplay never returns '-%'", () => {
    expect(statPercentDisplay(undefined)).toBe(STAT_FALLBACK);
    expect(statPercentDisplay("-")).toBe(STAT_FALLBACK);
    expect(statPercentDisplay("45")).toBe("45%");
    expect(isMissingStat("-%")).toBe(true);
  });

  test("formatProbabilityPercent never returns undefined%", () => {
    expect(formatProbabilityPercent(undefined)).toBe("");
    expect(formatProbabilityPercent("-")).toBe("");
    expect(formatProbabilityPercent(42.5)).toBe("42.5%");
    expect(getProbabilityNumber("-")).toBe(0);
  });
});
