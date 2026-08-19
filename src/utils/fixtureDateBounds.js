/** Homepage fixture browsing: how far back / ahead relative to today. */
export const FIXTURE_DATE_MIN_OFFSET = -60;
export const FIXTURE_DATE_MAX_OFFSET = 4;

export function startOfLocalDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getFixtureDateBounds(today = new Date()) {
  const base = startOfLocalDay(today);
  const minDate = new Date(base);
  minDate.setDate(base.getDate() + FIXTURE_DATE_MIN_OFFSET);
  const maxDate = new Date(base);
  maxDate.setDate(base.getDate() + FIXTURE_DATE_MAX_OFFSET);
  return { minDate, maxDate, today: base };
}

/** Days from today (local midnight) to `date`. */
export function getOffsetFromToday(date, today = new Date()) {
  const target = startOfLocalDay(date);
  const base = startOfLocalDay(today);
  return Math.round((target.getTime() - base.getTime()) / 86400000);
}

export function isOffsetInFixtureRange(offset) {
  return offset >= FIXTURE_DATE_MIN_OFFSET && offset <= FIXTURE_DATE_MAX_OFFSET;
}

export function clampDateToFixtureRange(date, today = new Date()) {
  const { minDate, maxDate } = getFixtureDateBounds(today);
  const target = startOfLocalDay(date);
  if (target < minDate) return new Date(minDate);
  if (target > maxDate) return new Date(maxDate);
  return target;
}
