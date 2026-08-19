import {
  FIXTURE_DATE_MAX_OFFSET,
  FIXTURE_DATE_MIN_OFFSET,
  clampDateToFixtureRange,
  getFixtureDateBounds,
  getOffsetFromToday,
  isOffsetInFixtureRange,
  startOfLocalDay,
} from "./fixtureDateBounds";

describe("fixtureDateBounds", () => {
  const today = startOfLocalDay(new Date(2026, 7, 19)); // 19 Aug 2026

  test("exposes the planned offset window", () => {
    expect(FIXTURE_DATE_MIN_OFFSET).toBe(-60);
    expect(FIXTURE_DATE_MAX_OFFSET).toBe(4);
  });

  test("computes min and max calendar dates from today", () => {
    const { minDate, maxDate } = getFixtureDateBounds(today);
    expect(getOffsetFromToday(minDate, today)).toBe(-60);
    expect(getOffsetFromToday(maxDate, today)).toBe(4);
  });

  test("isOffsetInFixtureRange matches the window", () => {
    expect(isOffsetInFixtureRange(-60)).toBe(true);
    expect(isOffsetInFixtureRange(4)).toBe(true);
    expect(isOffsetInFixtureRange(-61)).toBe(false);
    expect(isOffsetInFixtureRange(5)).toBe(false);
  });

  test("clampDateToFixtureRange clamps outside values", () => {
    const tooOld = new Date(today);
    tooOld.setDate(today.getDate() - 90);
    const tooNew = new Date(today);
    tooNew.setDate(today.getDate() + 10);

    expect(getOffsetFromToday(clampDateToFixtureRange(tooOld, today), today)).toBe(-60);
    expect(getOffsetFromToday(clampDateToFixtureRange(tooNew, today), today)).toBe(4);
    expect(getOffsetFromToday(clampDateToFixtureRange(today, today), today)).toBe(0);
  });
});
