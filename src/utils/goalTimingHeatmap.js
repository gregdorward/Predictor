export const GOAL_TIMING_BUCKET_LABELS = [
  "0-15'",
  "16-30'",
  "31-45'",
  "46-60'",
  "61-75'",
  "76-90+'",
];

export const GOAL_TIMING_BUCKET_COUNT = GOAL_TIMING_BUCKET_LABELS.length;

export function parseGoalMinute(timing) {
  const raw = String(timing ?? "").trim();
  if (!raw) return null;

  const [base, extra = "0"] = raw.split("+");
  const minute = Number(base) + Number(extra);
  return Number.isFinite(minute) && minute >= 0 ? minute : null;
}

export function getGoalTimingBucketIndex(minute) {
  if (minute <= 15) return 0;
  if (minute <= 30) return 1;
  if (minute <= 45) return 2;
  if (minute <= 60) return 3;
  if (minute <= 75) return 4;
  return 5;
}

export function createEmptyGoalTimingBuckets() {
  return Array(GOAL_TIMING_BUCKET_COUNT).fill(0);
}

function addTimingsToBuckets(buckets, timings = []) {
  let added = 0;
  for (const timing of timings || []) {
    const minute = parseGoalMinute(timing);
    if (minute == null) continue;
    buckets[getGoalTimingBucketIndex(minute)] += 1;
    added += 1;
  }
  return added;
}

function fixtureHasGoalTimings(fixture) {
  return Boolean(
    fixture?.goal_timings_recorded === 1 &&
      ((fixture.homeGoals_timings?.length ?? 0) > 0 ||
        (fixture.awayGoals_timings?.length ?? 0) > 0)
  );
}

export function buildGoalTimingHeatmap(homeFixtures = [], awayFixtures = []) {
  const scored = createEmptyGoalTimingBuckets();
  const conceded = createEmptyGoalTimingBuckets();
  let matchesWithTimings = 0;
  let goalsWithTimings = 0;

  for (const fixture of homeFixtures) {
    if (fixtureHasGoalTimings(fixture)) {
      matchesWithTimings += 1;
    }
    goalsWithTimings += addTimingsToBuckets(scored, fixture.homeGoals_timings);
    goalsWithTimings += addTimingsToBuckets(conceded, fixture.awayGoals_timings);
  }

  for (const fixture of awayFixtures) {
    if (fixtureHasGoalTimings(fixture)) {
      matchesWithTimings += 1;
    }
    goalsWithTimings += addTimingsToBuckets(scored, fixture.awayGoals_timings);
    goalsWithTimings += addTimingsToBuckets(conceded, fixture.homeGoals_timings);
  }

  const totalMatches = homeFixtures.length + awayFixtures.length;
  const hasData = goalsWithTimings >= 3;

  return {
    labels: GOAL_TIMING_BUCKET_LABELS,
    scored,
    conceded,
    matchesWithTimings,
    totalMatches,
    goalsWithTimings,
    hasData,
  };
}

export function getGoalTimingIntensity(count, maxCount) {
  if (!count || !maxCount) return "none";
  const ratio = count / maxCount;
  if (ratio >= 0.66) return "strong";
  if (ratio >= 0.33) return "medium";
  return "subtle";
}

/** Smooth green heat opacity for a bucket count relative to the row maximum. */
export function getGoalTimingHeatOpacity(count, maxCount) {
  if (!count) return 0;
  if (!maxCount) return 0.35;
  const ratio = Math.min(count / maxCount, 1);
  return 0.16 + ratio * 0.72;
}
