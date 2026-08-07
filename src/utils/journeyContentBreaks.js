import { getCompetitionUrl } from "../seo/competitionCatalog";

/** Minimum gap between Journey-friendly mid-fixture-list content breaks. */
export const FIXTURE_CONTENT_BREAK_MIN_INTERVAL = 3;

/**
 * Interval scales with list size so denser lists stay readable.
 * Examples: 9 fixtures → every 3; 99 fixtures → every 33.
 */
export function getFixtureContentBreakInterval(totalFixtures) {
  const total = Number(totalFixtures) || 0;
  if (total < FIXTURE_CONTENT_BREAK_MIN_INTERVAL) return null;
  return Math.max(
    FIXTURE_CONTENT_BREAK_MIN_INTERVAL,
    Math.floor(total / FIXTURE_CONTENT_BREAK_MIN_INTERVAL)
  );
}

export function shouldInsertFixtureContentBreak(fixtureIndex, totalFixtures) {
  const interval = getFixtureContentBreakInterval(totalFixtures);
  if (!interval) return false;
  // Avoid a break after the final fixture in the list.
  if (fixtureIndex >= totalFixtures - 1) return false;
  return (fixtureIndex + 1) % interval === 0;
}

export function getFixtureContentBreakTip(previousFixture) {
  const competition =
    previousFixture?.leagueName || previousFixture?.leagueDesc;
  const label = competition
    ? `${competition} stats and trends`
    : "Competition stats and trends";
  const href = getCompetitionUrl(previousFixture?.leagueID) || null;

  return { label, href };
}
